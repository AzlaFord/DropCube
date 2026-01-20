fileshare/
  apps/
    api/                 # Go backend
      cmd/
        api/             # main.go (pornește serverul)
      internal/
        config/          # load env, config struct
        db/              # connect, tx helpers
        files/           # domain: upload/download, storage
        http/            # router, handlers, middleware
        auth/            # (mai târziu) login, sessions, jwt
        users/           # (mai târziu) user management
      migrations/        # SQL migrations (up/down)
      pkg/               # (opțional) lucruri reusable extern
      go.mod
      go.sum

    web/                 # React frontend
      src/
        api/             # fetch wrappers (axios/fetch)
        pages/           # Upload, FileView, Login (mai târziu)
        components/      # UI components
        hooks/
        router/
        styles/
      index.html
      package.json
      vite.config.ts

  deploy/
    docker/
      api.Dockerfile
      web.Dockerfile
    compose.yml          # postgres + api + web (dev/prod)

  scripts/               # helper scripts
  .env.example
  .gitignore
  README.md

