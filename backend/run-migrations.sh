#!/bin/bash

# Database connection from environment or defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-kintsugi}"

echo "Running migrations on database: $DB_NAME"

# Run each migration file
for migration in migrations/*.sql; do
    echo "Applying migration: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration"
    if [ $? -eq 0 ]; then
        echo "✓ $migration applied successfully"
    else
        echo "✗ Failed to apply $migration"
        exit 1
    fi
done

echo "All migrations completed successfully!"
