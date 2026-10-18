# Bingo Club frontend

Responsive React + Vite client for the real-time Bingo backend in ../Backend.

## Run locally

~~~powershell
cd Frontend
Copy-Item .env.example .env
npm install
npm run dev
~~~

Start the backend separately from ../Backend with npm start. By default, the frontend expects it at http://localhost:3001.

| Variable | Purpose |
| --- | --- |
| VITE_API_URL | Public HTTP URL of the Bingo backend, for example https://api.example.com |
| VITE_SOCKET_URL | Public Socket.IO URL; use the same HTTPS origin as the API when Nginx proxies WebSockets |
| VITE_MIN_PLAYERS | Fallback when an older backend does not expose the room minimum; default 2 |

Vite variables are public browser configuration. Do not put secrets in variables prefixed with VITE_.

## Scripts

~~~powershell
npm run dev
npm run build
npm run lint
npm run test
npm run test:coverage
npm run test:e2e
~~~

test:e2e launches the real backend on port 3011 and the frontend on port 5174. Install the Playwright browser once if needed:

~~~powershell
npx playwright install chromium
~~~

## Game rules and privacy

- Every player receives a private 5×5 board containing the numbers 1–25 in a different random order.
- The backend selects the active player. That player chooses one remaining number; the server validates the turn and broadcasts only the public call.
- A server-confirmed call marks the matching number on every private board. The client never sends board layouts or mark state as authority.
- The first player to complete five horizontal, vertical, or diagonal lines takes first place. The next eligible players take second and third place when present.
- Public room state contains names, turns, called numbers, and placements. Each card, completed-line coordinates, and resume token are emitted only to its owner.

The frontend stores the backend-issued resume token only in sessionStorage, then sends it through player:reconnect after a Socket.IO reconnect or page reload. A player must leave a room before creating or joining another one.

## Deployment

1. Set VITE_API_URL and VITE_SOCKET_URL to the public HTTPS backend origin before building.
2. Build with npm run build; deploy dist/ to Vercel or another static host.
3. vercel.json rewrites room links such as /room/ABC234 to Vite's SPA entry point.
4. Configure Nginx for the backend to forward Socket.IO upgrade headers, and set backend CORS_ORIGINS to the deployed frontend origin.

The backend keeps game state in one server process. Restarting it clears rooms; multiple instances need shared state and a Socket.IO adapter before they can serve the same rooms.
