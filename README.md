# Stockflow - Inventory Dashboard

**Stockflow** is a dedicated web app designed to streamline inventory tracking small businesses. It offers real-time visibility into daily piece counts, itemized inventory and historical sales trends.

---

## Features

- **Real-time Metrics:** Instant tracking of today's pieces sold, total profit, monthly volume, and net revenue.
- **Inventory Management:** Itemized tracking for items with real-time progress indicators.
- **Restock Alerts:** Automatic visual alerts when key inventory items drop below minimum thresholds.

---

## Tech Stack

This repository is a local copy of a Base44 app created with `base44 eject`.

## Live App

[Open the app](https://stock-flow-0a6878b5.base44.app)

## Getting Started

## Prerequisites

1. Clone the repository using the project's Git URL.
2. Navigate to the project directory.
3. Install dependencies: `npm install`.
4. Install the Base44 CLI: `npm install -g base44@latest`.

See the [Base44 CLI docs](https://docs.base44.com/developers/references/cli/commands/introduction) if you want to run Base44 commands directly.

## Run Locally

Run the full local development environment from the project root:

```bash
base44 dev
```

`base44 dev` starts the local Base44 development backend and, when this app is configured for it, also starts the frontend dev server for you. Use the frontend URL printed by the command.

For example, when the Base44 project config includes a `serveCommand`, `base44 dev` can launch the frontend too:

```json5
{
  "site": {
    "serveCommand": "npm run dev"
  }
}
```

In a Base44 project this lives in `base44/config.jsonc`.

Local backend data is kept in memory and is cleared when the dev server stops.

## Run Only The Frontend

If you only want to work on the frontend against the hosted Base44 backend, run:

```bash
npm run dev
```

Open the local URL printed by Vite.

## Use The Hosted Backend (Optional)

Only needed for frontend-only development. Create or update `.env.local` in the project root:

```env
VITE_BASE44_APP_ID=your_ejected_app_id
VITE_BASE44_APP_BASE_URL=https://your-ejected-app.base44.app
```

`VITE_BASE44_APP_ID` identifies the ejected Base44 app (its own app ID — not the original app's).

`VITE_BASE44_APP_BASE_URL` tells the Base44 Vite plugin where to send local `/api` requests. Point it at your deployed Base44 app URL when you want the local frontend to use the hosted backend.

When you use `base44 dev`, the command injects the local Base44 values for you, so `.env.local` is mainly needed for frontend-only workflows. Don't commit `.env.local`.

## Commit & Push Your Changes

This repository is your own version history. Save each milestone with:

```bash
git add .
git commit -m "Describe what changed"
git push
```

Pushing records the change in GitHub. It does not, by itself, update Base44 — deploy when you want the change live (next section).

## Deploy Your Changes

Build the frontend, then deploy the project's resources to the ejected Base44 app:

```bash
base44 build
base44 deploy
```

Or do both in one step:

```bash
base44 deploy --build
```

`base44 build` compiles the frontend with the ejected app's ID injected. `base44 deploy` pushes entities, functions, and the site to your ejected Base44 project.

To open the Base44 dashboard for this project:

```bash
base44 dashboard open
```

## Docs & Support

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Base44 CLI command reference: [https://docs.base44.com/developers/references/cli/commands/introduction](https://docs.base44.com/developers/references/cli/commands/introduction)

Support: [https://app.base44.com/support](https://app.base44.com/support)
