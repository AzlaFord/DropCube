# DropCube frontend (React + Vite)

Simple React UI that:

- Fetches file list from `GET http://localhost:8080/files`
- Downloads via `GET http://localhost:8080/files/{id}`
- Uploads via `POST http://localhost:8080/upload` (multipart form-data, field name: `file`)

## Run

```bash
npm install
npm run dev
```

## Configure API base URL (optional)

By default the app calls `http://localhost:8080`.

You can override it with:

- Windows PowerShell:

```powershell
$env:VITE_API_BASE="http://localhost:8080"
npm run dev
```

- macOS/Linux:

```bash
VITE_API_BASE="http://localhost:8080" npm run dev
```
