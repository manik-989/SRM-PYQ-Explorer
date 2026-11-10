.PHONY: help install dev lint typecheck test test-cov build preview docker-build docker-run clean

NPM ?= npm
IMAGE ?= srm-pyq-web:local

help:
	@echo "SRM PYQ Explorer - common tasks"
	@echo "  make install       Install dependencies with npm ci"
	@echo "  make dev           Start the Vite dev server"
	@echo "  make lint          Run ESLint"
	@echo "  make typecheck     Run the TypeScript compiler"
	@echo "  make test          Run unit tests"
	@echo "  make test-cov      Run unit tests with coverage"
	@echo "  make build         Typecheck and build for production"
	@echo "  make preview       Preview the production build"
	@echo "  make docker-build  Build the production image"
	@echo "  make docker-run    Run the image on http://localhost:8080"
	@echo "  make clean         Remove build and test artifacts"

install:
	$(NPM) ci

dev:
	$(NPM) run dev

lint:
	$(NPM) run lint

typecheck:
	$(NPM) run typecheck

test:
	$(NPM) run test

test-cov:
	$(NPM) run test:coverage

build:
	$(NPM) run build

preview:
	$(NPM) run preview

docker-build:
	docker build -t $(IMAGE) .

docker-run:
	docker run --rm -p 8080:80 $(IMAGE)

clean:
	rm -rf dist coverage node_modules/.vite
