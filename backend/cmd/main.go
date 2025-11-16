package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"github.com/kintsugi-ai/backend/internal/modules/auth"
	"github.com/kintsugi-ai/backend/internal/modules/chat"
	"github.com/kintsugi-ai/backend/internal/modules/messenger"
	"github.com/kintsugi-ai/backend/internal/modules/subscription"
	"github.com/kintsugi-ai/backend/internal/modules/translation"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database
	db := initDatabase()

	// Auto-migrate all models
	if err := migrateDatabase(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		BodyLimit:    50 * 1024 * 1024, // 50MB for large translations
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     os.Getenv("CORS_ORIGINS"),
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
	}))

	// Initialize modules

	// Auth module
	authRepo := auth.NewRepository(db)
	authService := auth.NewService(authRepo)
	authHandler := auth.NewHandler(authService)
	authMiddleware := auth.NewMiddleware(authService)
	auth.RegisterRoutes(app, authHandler, authMiddleware)

	// Chat module
	chatRepo := chat.NewRepository(db)
	chatService := chat.NewService(chatRepo, db)
	chatHandler := chat.NewHandler(chatService)
	chat.RegisterRoutes(app, chatHandler, authMiddleware.Protected())

	// Messenger module with WebSocket Hub
	messengerHub := messenger.NewHub()
	go messengerHub.Run()
	messengerRepo := messenger.NewRepository(db)
	messengerService := messenger.NewService(messengerRepo, messengerHub)
	messengerHandler := messenger.NewHandler(messengerService, messengerHub)
	messenger.RegisterRoutes(app, messengerHandler, authMiddleware.Protected())

	// Translation module
	translationRepo := translation.NewRepository(db)
	translationService := translation.NewService(translationRepo)
	translationHandler := translation.NewHandler(translationService)
	translation.RegisterRoutes(app, translationHandler, authMiddleware.Protected())

	// Subscription module
	subscriptionRepo := subscription.NewRepository(db)
	subscriptionService := subscription.NewService(subscriptionRepo, db)
	subscriptionHandler := subscription.NewHandler(subscriptionService)
	subscription.RegisterRoutes(app, subscriptionHandler, authMiddleware.Protected())

	// Cron job for token reset
	go tokenResetCron(db)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"time":   time.Now(),
		})
	})

	// Serve static files from public directory
	app.Static("/", "./public", fiber.Static{
		Compress:      true,
		ByteRange:     true,
		Browse:        false,
		Index:         "index.html",
		CacheDuration: 24 * time.Hour,
	})

	// Fallback to index.html for client-side routing
	app.Use(func(c *fiber.Ctx) error {
		path := c.Path()
		// Only serve index.html for non-API routes
		if len(path) >= 4 && path[:4] == "/api" {
			return c.Next()
		}
		if path == "/health" {
			return c.Next()
		}
		return c.SendFile("./public/index.html")
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func initDatabase() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connected successfully")
	return db
}

func migrateDatabase(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Drop incompatible tables if they exist (for clean migration)
	log.Println("Dropping old incompatible tables...")
	db.Exec("DROP TABLE IF EXISTS users CASCADE")
	db.Exec("DROP TABLE IF EXISTS refresh_tokens CASCADE")
	db.Exec("DROP TABLE IF EXISTS chats CASCADE")
	db.Exec("DROP TABLE IF EXISTS messages CASCADE")
	db.Exec("DROP TABLE IF EXISTS conversations CASCADE")
	db.Exec("DROP TABLE IF EXISTS participants CASCADE")
	db.Exec("DROP TABLE IF EXISTS conversation_messages CASCADE")
	db.Exec("DROP TABLE IF EXISTS reactions CASCADE")
	db.Exec("DROP TABLE IF EXISTS read_receipts CASCADE")
	db.Exec("DROP TABLE IF EXISTS stories CASCADE")
	db.Exec("DROP TABLE IF EXISTS story_views CASCADE")
	db.Exec("DROP TABLE IF EXISTS invite_codes CASCADE")
	db.Exec("DROP TABLE IF EXISTS group_invites CASCADE")
	db.Exec("DROP TABLE IF EXISTS translations CASCADE")
	db.Exec("DROP TABLE IF EXISTS subscriptions CASCADE")
	db.Exec("DROP TABLE IF EXISTS payments CASCADE")
	log.Println("Old tables dropped successfully")

	// Migrate models one by one for better error handling
	models := []interface{}{
		&auth.User{},
		&chat.Chat{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Failed to migrate %T: %v\n", model, err)
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
		log.Printf("Successfully migrated %T\n", model)

		if _, ok := model.(*auth.User); ok {
			log.Println("Adding preferences column to users table...")
			db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb")
		}
	}

	if err := ensureRefreshTokensTable(db); err != nil {
		return fmt.Errorf("failed to ensure refresh_tokens table: %w", err)
	}
	if err := ensureChatMessagesTable(db); err != nil {
		return fmt.Errorf("failed to ensure chat messages table: %w", err)
	}
	if err := ensureMessengerTables(db); err != nil {
		return fmt.Errorf("failed to ensure messenger tables: %w", err)
	}
	if err := ensureTranslationTable(db); err != nil {
		return fmt.Errorf("failed to ensure translation table: %w", err)
	}
	if err := ensureSubscriptionTables(db); err != nil {
		return fmt.Errorf("failed to ensure subscription tables: %w", err)
	}

	// Add role column if it doesn't exist
	log.Println("Adding role column to users table...")
	db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'")

	// Set superadmin for specific email
	log.Println("Setting superadmin role for work.olegkaminskyi@gmail.com...")
	db.Exec(`
		UPDATE users
		SET role = 'superadmin',
		    subscription_tier = 'unlimited',
		    tokens_limit = -1
		WHERE email = 'work.olegkaminskyi@gmail.com'
	`)

	// Create indexes
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_invite_codes_expires_at ON invite_codes(expires_at)")

	log.Println("Database migrations completed")
	return nil
}

func ensureRefreshTokensTable(db *gorm.DB) error {
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS refresh_tokens (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token varchar(500) NOT NULL UNIQUE,
			expires_at timestamptz NOT NULL,
			created_at timestamptz DEFAULT CURRENT_TIMESTAMP
		)
	`

	if err := db.Exec(createTableSQL).Error; err != nil {
		log.Printf("Failed to create refresh_tokens table: %v", err)
		return fmt.Errorf("failed to create refresh_tokens table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)").Error; err != nil {
		log.Printf("Failed to create refresh_tokens index: %v", err)
		return fmt.Errorf("failed to create refresh_tokens index: %w", err)
	}

	log.Println("Refresh tokens table ensured via manual SQL")
	return nil
}

func ensureChatMessagesTable(db *gorm.DB) error {
	createTableSQL := `
		CREATE TABLE IF NOT EXISTS messages (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
			role varchar(20) NOT NULL,
			content text NOT NULL,
			tokens integer DEFAULT 0,
			model varchar(50),
			created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
			deleted_at timestamptz
		)
	`

	if err := db.Exec(createTableSQL).Error; err != nil {
		log.Printf("Failed to create messages table: %v", err)
		return fmt.Errorf("failed to create messages table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)").Error; err != nil {
		log.Printf("Failed to create messages chat index: %v", err)
		return fmt.Errorf("failed to create messages chat index: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_messages_deleted_at ON messages(deleted_at)").Error; err != nil {
		log.Printf("Failed to create messages deleted index: %v", err)
		return fmt.Errorf("failed to create messages deleted index: %w", err)
	}

	log.Println("Chat messages table ensured via manual SQL")
	return nil
}

func ensureMessengerTables(db *gorm.DB) error {
	tasks := []func(*gorm.DB) error{
		ensureConversationsTable,
		ensureParticipantsTable,
		ensureConversationMessagesTable,
		ensureReactionsTable,
		ensureReadReceiptsTable,
		ensureStoriesTable,
		ensureStoryViewsTable,
		ensureInviteCodesTable,
		ensureGroupInvitesTable,
	}

	for _, task := range tasks {
		if err := task(db); err != nil {
			return err
		}
	}
	return nil
}

func ensureConversationsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS conversations (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		type varchar(20) NOT NULL,
		name varchar(255),
		description text,
		avatar text,
		is_ai_agent boolean DEFAULT false,
		enable_video boolean DEFAULT false,
		created_by uuid,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create conversations table: %v", err)
		return fmt.Errorf("failed to create conversations table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON conversations(deleted_at)").Error; err != nil {
		return fmt.Errorf("failed to create conversations deleted index: %w", err)
	}

	log.Println("Conversations table ensured via manual SQL")
	return nil
}

func ensureParticipantsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS participants (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
		user_id uuid NOT NULL,
		role varchar(20) DEFAULT 'member',
		is_pinned boolean DEFAULT false,
		is_muted boolean DEFAULT false,
		is_archived boolean DEFAULT false,
		joined_at timestamptz DEFAULT CURRENT_TIMESTAMP
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create participants table: %v", err)
		return fmt.Errorf("failed to create participants table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_participants_conversation_id ON participants(conversation_id)").Error; err != nil {
		return fmt.Errorf("failed to create participants conversation index: %w", err)
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id)").Error; err != nil {
		return fmt.Errorf("failed to create participants user index: %w", err)
	}

	log.Println("Participants table ensured via manual SQL")
	return nil
}

func ensureConversationMessagesTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS conversation_messages (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
		sender_id uuid NOT NULL,
		content text NOT NULL,
		message_type varchar(20) DEFAULT 'text',
		media_url text,
		reply_to_id uuid,
		is_edited boolean DEFAULT false,
		is_forwarded boolean DEFAULT false,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create conversation_messages table: %v", err)
		return fmt.Errorf("failed to create conversation_messages table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id)").Error; err != nil {
		return fmt.Errorf("failed to create conversation_messages conversation index: %w", err)
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at)").Error; err != nil {
		return fmt.Errorf("failed to create conversation_messages created index: %w", err)
	}

	log.Println("Conversation messages table ensured via manual SQL")
	return nil
}

func ensureReactionsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS reactions (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		message_id uuid NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
		user_id uuid NOT NULL,
		emoji varchar(10) NOT NULL,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create reactions table: %v", err)
		return fmt.Errorf("failed to create reactions table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id)").Error; err != nil {
		return fmt.Errorf("failed to create reactions message index: %w", err)
	}

	log.Println("Reactions table ensured via manual SQL")
	return nil
}

func ensureReadReceiptsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS read_receipts (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		message_id uuid NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
		user_id uuid NOT NULL,
		read_at timestamptz DEFAULT CURRENT_TIMESTAMP
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create read_receipts table: %v", err)
		return fmt.Errorf("failed to create read_receipts table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_read_receipts_message_id ON read_receipts(message_id)").Error; err != nil {
		return fmt.Errorf("failed to create read_receipts message index: %w", err)
	}

	log.Println("Read receipts table ensured via manual SQL")
	return nil
}

func ensureStoriesTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS stories (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id uuid NOT NULL,
		media_url text NOT NULL,
		media_type varchar(20) NOT NULL,
		caption text,
		expires_at timestamptz NOT NULL,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create stories table: %v", err)
		return fmt.Errorf("failed to create stories table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id)").Error; err != nil {
		return fmt.Errorf("failed to create stories user index: %w", err)
	}

	log.Println("Stories table ensured via manual SQL")
	return nil
}

func ensureStoryViewsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS story_views (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
		user_id uuid NOT NULL,
		viewed_at timestamptz DEFAULT CURRENT_TIMESTAMP
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create story_views table: %v", err)
		return fmt.Errorf("failed to create story_views table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id)").Error; err != nil {
		return fmt.Errorf("failed to create story_views story index: %w", err)
	}

	log.Println("Story views table ensured via manual SQL")
	return nil
}

func ensureInviteCodesTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS invite_codes (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		code varchar(50) NOT NULL UNIQUE,
		conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
		created_by uuid NOT NULL,
		used_by uuid,
		used_at timestamptz,
		expires_at timestamptz,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create invite_codes table: %v", err)
		return fmt.Errorf("failed to create invite_codes table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code)").Error; err != nil {
		return fmt.Errorf("failed to create invite_codes code index: %w", err)
	}

	log.Println("Invite codes table ensured via manual SQL")
	return nil
}

func ensureGroupInvitesTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS group_invites (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		group_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
		code varchar(50) UNIQUE NOT NULL,
		created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		max_uses integer DEFAULT 0,
		used_count integer DEFAULT 0,
		expires_at timestamptz,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create group_invites table: %v", err)
		return fmt.Errorf("failed to create group_invites table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_group_invites_code ON group_invites(code)").Error; err != nil {
		return fmt.Errorf("failed to create group_invites code index: %w", err)
	}

	log.Println("Group invites table ensured via manual SQL")
	return nil
}

func ensureTranslationTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS translations (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id uuid NOT NULL,
		source_language varchar(10) NOT NULL,
		target_language varchar(10) NOT NULL,
		source_text text NOT NULL,
		translated_text text,
		char_count integer NOT NULL,
		chunk_count integer DEFAULT 1,
		service varchar(20) NOT NULL,
		plan varchar(50) NOT NULL,
		cost decimal(10,4),
		status varchar(20) DEFAULT 'pending',
		error_message text,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		completed_at timestamptz,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create translations table: %v", err)
		return fmt.Errorf("failed to create translations table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id)").Error; err != nil {
		return fmt.Errorf("failed to create translations user index: %w", err)
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_translations_status ON translations(status)").Error; err != nil {
		return fmt.Errorf("failed to create translations status index: %w", err)
	}

	log.Println("Translation table ensured via manual SQL")
	return nil
}

func ensureSubscriptionTables(db *gorm.DB) error {
	if err := ensureSubscriptionsTable(db); err != nil {
		return err
	}
	if err := ensurePaymentsTable(db); err != nil {
		return err
	}
	return nil
}

func ensureSubscriptionsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS subscriptions (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id uuid NOT NULL UNIQUE,
		stripe_subscription_id varchar(255) UNIQUE,
		stripe_price_id varchar(255),
		tier varchar(50) NOT NULL,
		status varchar(20) NOT NULL,
		current_period_start timestamptz,
		current_period_end timestamptz,
		cancel_at_period_end boolean DEFAULT false,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
		deleted_at timestamptz
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create subscriptions table: %v", err)
		return fmt.Errorf("failed to create subscriptions table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)").Error; err != nil {
		return fmt.Errorf("failed to create subscriptions user index: %w", err)
	}
	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)").Error; err != nil {
		return fmt.Errorf("failed to create subscriptions status index: %w", err)
	}

	log.Println("Subscriptions table ensured via manual SQL")
	return nil
}

func ensurePaymentsTable(db *gorm.DB) error {
	sql := `
	CREATE TABLE IF NOT EXISTS payments (
		id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
		user_id uuid NOT NULL,
		stripe_payment_id varchar(255) NOT NULL UNIQUE,
		amount bigint NOT NULL,
		currency varchar(3) DEFAULT 'usd',
		status varchar(20) NOT NULL,
		description text,
		created_at timestamptz DEFAULT CURRENT_TIMESTAMP
	)`

	if err := db.Exec(sql).Error; err != nil {
		log.Printf("Failed to create payments table: %v", err)
		return fmt.Errorf("failed to create payments table: %w", err)
	}

	if err := db.Exec("CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)").Error; err != nil {
		return fmt.Errorf("failed to create payments user index: %w", err)
	}

	log.Println("Payments table ensured via manual SQL")
	return nil
}

func tokenResetCron(db *gorm.DB) {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()

		// Reset tokens for users whose reset period has passed
		result := db.Exec(`
			UPDATE users
			SET tokens_used = 0, reset_at = ?
			WHERE reset_at < ?
		`, now.Add(6*time.Hour), now)

		if result.Error != nil {
			log.Printf("Error resetting tokens: %v", result.Error)
		} else if result.RowsAffected > 0 {
			log.Printf("Reset tokens for %d users", result.RowsAffected)
		}
	}
}
