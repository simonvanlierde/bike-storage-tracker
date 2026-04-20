# Bike Storage Tracker

Bike Storage Tracker is a small web app for saving where you parked your bike.

It lets you save your current spot, check a few recent locations, and restore an older one when needed.

## Development

Requirements: Node.js 20+ and `pnpm`

Install:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Check the project:

```bash
pnpm check
```

## Deployment

Run with Docker:

```bash
docker compose build
docker compose up -d
```

If you use the included `cloudflared` service, set `CLOUDFLARE_TUNNEL_TOKEN` in your environment first.

## Contributing

Before opening a pull request, run:

```bash
pnpm check
```

## License

Released under the [MIT License](LICENSE).
