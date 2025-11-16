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
		// Auth
		&auth.User{},
		// Chat
		&chat.Chat{},
		// Messenger
		&messenger.Conversation{},
		&messenger.Participant{},
		&messenger.ConversationMessage{},
		&messenger.Reaction{},
		&messenger.ReadReceipt{},
		&messenger.Story{},
		&messenger.StoryView{},
		&messenger.InviteCode{},
		&messenger.GroupInvite{},
		// Translation
		&translation.Translation{},
		// Subscription
		&subscription.Subscription{},
		&subscription.Payment{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Failed to migrate %T: %v\n", model, err)
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
		log.Printf("Successfully migrated %T\n", model)

		// Add preferences column manually after User migration
		switch model.(type) {
		case *auth.User:
			log.Println("Adding preferences column to users table...")
			db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb")
			if err := ensureRefreshTokensTable(db); err != nil {
				return err
			}
		case *chat.Chat:
			if err := ensureChatMessagesTable(db); err != nil {
				return err
			}
		}
	}

	// Create indexes
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
	db.Exec("CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier)")
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
