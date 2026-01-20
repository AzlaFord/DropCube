## Project Structure

```
fileshare/
├─ apps/
│  ├─ api/                    # Go backend
│  │  ├─ cmd/
│  │  │  └─ api/              # main.go – pornește HTTP serverul
│  │  ├─ internal/
│  │  │  ├─ config/           # configurare, env, structs
│  │  │  ├─ db/               # conexiune DB, tranzacții
│  │  │  ├─ files/            # upload/download, storage logic
│  │  │  ├─ http/             # router, handlers, middleware
│  │  │  ├─ auth/             # autentificare (JWT, sesiuni) – viitor
│  │  │  └─ users/            # management utilizatori – viitor
│  │  ├─ migrations/          # SQL migrations (up/down)
│  │  ├─ pkg/                 # cod reutilizabil (opțional)
│  │  ├─ go.mod
│  │  └─ go.sum
│  │
│  └─ web/                    # React frontend (Vite)
│     ├─ src/
│     │  ├─ api/              # request wrappers (fetch/axios)
│     │  ├─ pages/            # Upload, FileView, Login
│     │  ├─ components/       # componente UI
│     │  ├─ hooks/
│     │  ├─ router/
│     │  └─ styles/
│     ├─ index.html
│     ├─ package.json
│     └─ vite.config.ts
│
├─ deploy/
│  ├─ docker/
│  │  ├─ api.Dockerfile
│  │  └─ web.Dockerfile
│  └─ compose.yml             # Postgres + API + Web
│
├─ scripts/                   # scripturi helper
├─ .env.example
├─ .gitignore
└─ README.md
```

### Notes

* Backend-ul folosește **Go + clean architecture**
* Frontend-ul este **React + Vite**
* `internal/` este izolat conform convenției Go
* Docker & Compose sunt separate pentru deploy
* Structura este gândită pentru **scalare și extensii viitoare**
