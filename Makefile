.PHONY: setup dev build lint db clean

# Install dependencies and create .env.local if missing
setup:
	@echo "Installing dependencies..."
	bun install
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "Created .env.local from .env.example — edit it with your keys"; \
	else \
		echo ".env.local already exists"; \
	fi
	@echo "Setup complete! Run 'make dev' to start."

# Start development server
dev:
	bun run dev

# Production build
build:
	bun run build

# Start production server
start:
	bun run start

# Run linter
lint:
	bun run lint

# Print database setup instructions
db:
	@echo "Run these SQL files in your Supabase SQL Editor:"
	@echo ""
	@echo "1. Main schema (first time):"
	@echo "   supabase/schema.sql"
	@echo ""
	@echo "2. Migrations (if updating existing DB):"
	@echo "   supabase/add_password_hash.sql"
	@echo "   supabase/add_education_fields.sql"

# Type check
typecheck:
	bunx tsc --noEmit

# Remove build artifacts
clean:
	rm -rf .next node_modules
