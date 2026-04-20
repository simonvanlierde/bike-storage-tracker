default:
    @just --list

install:
    pnpm install

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
    rm -rf dist/ coverage/
