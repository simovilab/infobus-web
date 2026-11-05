# Nuxt SaaS Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Fully built SaaS application to launch your next project with a landing page, a pricing page, a documentation and a blog powered by [Nuxt UI](https://ui.nuxt.com) components.

- [Live demo](https://saas-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://saas-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
    <img alt="Nuxt SaaS Template" src="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t ui/saas
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=saas&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fsaas&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fsaas-dark.png&demo-url=https%3A%2F%2Fsaas-template.nuxt.dev%2F&demo-title=Nuxt%20SaaS%20Template&demo-description=A%20SaaS%20template%20with%20landing%2C%20pricing%2C%20docs%20and%20blog%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Deploy with Docker Compose and Traefik

The production stack is a single container behind a Traefik reverse proxy that is already running on the server and owns the external Docker network `traefik_proxy`. Traefik issues the Let's Encrypt certificate through its certificate resolver.

1. Create the environment file and set the public domain (its DNS record must point to the server):

   ```bash
   cp .env.example .env
   # edit DOMAIN, and TRAEFIK_* if your Traefik uses other entrypoint/resolver names
   ```

2. Build and start:

   ```bash
   docker compose up -d --build
   ```

3. Check the container is healthy and reachable through Traefik:

   ```bash
   docker compose ps
   docker compose logs -f web
   ```

Configuration lives in `.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DOMAIN` | — (required) | Hostname routed by Traefik, e.g. `infobus.example.com` |
| `TRAEFIK_ENTRYPOINT` | `websecure` | Traefik HTTPS entrypoint |
| `TRAEFIK_HTTP_ENTRYPOINT` | `web` | Traefik HTTP entrypoint; requests are redirected to HTTPS |
| `TRAEFIK_CERT_RESOLVER` | `letsencrypt` | Name of the ACME resolver configured in Traefik |
| `IMAGE_NAME` / `IMAGE_TAG` | `infobus-web` / `latest` | Tag of the image built by Compose |

The [Dockerfile](./Dockerfile) builds the site in a Node 22 stage and ships only the Nitro output (`.output`), running as the unprivileged `node` user with a built-in health check on port 3000. To deploy a new version, pull the code and run `docker compose up -d --build` again.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
