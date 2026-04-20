set dotenv-load := true

default:
    @just --list

install:
    pnpm install

update:
    pnpm update

dev:
    pnpm dev

check:
    pnpm check

build:
    pnpm build

test:
    pnpm test

lint:
    pnpm lint

format:
    pnpm format

clean:
    rm -rf dist/ node_modules/ .next/ coverage/

docker-build:
    docker compose build

docker-up:
    docker compose up -d

docker-down:
    docker compose down
