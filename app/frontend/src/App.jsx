import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

function getFilenameFromContentDisposition(headerValue) {
  if (!headerValue) return null
  // Examples:
  // content-disposition: attachment; filename="file.txt"
  // content-disposition: attachment; filename*=UTF-8''file.txt
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(headerValue)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].trim())

  const quotedMatch = /filename\s*=\s*"([^"]+)"/i.exec(headerValue)
  if (quotedMatch?.[1]) return quotedMatch[1].trim()

  const plainMatch = /filename\s*=\s*([^;]+)/i.exec(headerValue)
  if (plainMatch?.[1]) return plainMatch[1].trim()

  return null
}

function normalizeFiles(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return { id: String(item), name: String(item) }
        }
        if (item && typeof item === 'object') {
          const id =
            item.ID ?? item.id ?? item._id ?? item.key ?? item.fileId ?? item.Filename ?? item.filename
          const name = item.Filename ?? item.filename ?? item.name ?? String(id ?? '')
          const rawSize = item.Size ?? item.size
          return {
            id: id == null ? name : String(id),
            name: String(name),
            size: typeof rawSize === 'number' ? rawSize : undefined,
          }
        }
        return null
      })
      .filter(Boolean)
  }

  // Some backends return { files: [...] }
  if (payload && typeof payload === 'object' && Array.isArray(payload.files)) {
    return normalizeFiles(payload.files)
  }

  return []
}

function App() {
  const [files, setFiles] = useState([])
  const [listStatus, setListStatus] = useState('loading') // loading | error | success
  const [listError, setListError] = useState('')

  const [uploadFile, setUploadFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle') // idle | uploading | error | success
  const [uploadError, setUploadError] = useState('')

  async function refreshFiles() {
    setListStatus('loading')
    setListError('')
    try {
      const res = await fetch(`${API_BASE}/files`, {
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) {
        throw new Error(`Failed to load files (${res.status} ${res.statusText})`)
      }
      const data = await res.json()
      setFiles(normalizeFiles(data))
      setListStatus('success')
    } catch (e) {
      setListStatus('error')
      setListError(e instanceof Error ? e.message : 'Failed to load files')
    }
  }

  async function downloadFile(file) {
    const res = await fetch(`${API_BASE}/files/${encodeURIComponent(file.id)}`)
    if (!res.ok) {
      throw new Error(`Download failed (${res.status} ${res.statusText})`)
    }

    const blob = await res.blob()
    const cd = res.headers.get('content-disposition')
    const suggestedName = getFilenameFromContentDisposition(cd) ?? file.name ?? `file-${file.id}`

    const url = URL.createObjectURL(blob)
    try {
      const a = document.createElement('a')
      a.href = url
      a.download = suggestedName
      document.body.appendChild(a)
      a.click()
      a.remove()
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function onUploadSubmit(e) {
    e.preventDefault()
    setUploadError('')
    setUploadStatus('uploading')

    try {
      if (!uploadFile) throw new Error('Choose a file to upload.')
      const fd = new FormData()
      fd.append('file', uploadFile)

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const maybeText = await res.text().catch(() => '')
        throw new Error(
          maybeText
            ? `Upload failed (${res.status}): ${maybeText}`
            : `Upload failed (${res.status} ${res.statusText})`,
        )
      }

      setUploadStatus('success')
      setUploadFile(null)
      await refreshFiles()
    } catch (e) {
      setUploadStatus('error')
      setUploadError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setTimeout(() => {
        setUploadStatus('idle')
      }, 600)
    }
  }

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/files`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) {
          throw new Error(`Failed to load files (${res.status} ${res.statusText})`)
        }
        const data = await res.json()
        if (cancelled) return
        setFiles(normalizeFiles(data))
        setListError('')
        setListStatus('success')
      } catch (e) {
        if (cancelled) return
        setListStatus('error')
        setListError(e instanceof Error ? e.message : 'Failed to load files')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">DropCube</h1>
          <p className="subtitle">Simple file list, download, and upload.</p>
        </div>
        <button className="btn" type="button" onClick={refreshFiles} disabled={listStatus === 'loading'}>
          {listStatus === 'loading' ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      <section className="card">
        <h2 className="sectionTitle">Upload</h2>
        <form className="upload" onSubmit={onUploadSubmit}>
          <input
            className="fileInput"
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
          />
          <button className="btn primary" type="submit" disabled={uploadStatus === 'uploading'}>
            {uploadStatus === 'uploading' ? 'Uploading…' : 'Upload'}
          </button>
        </form>
        {uploadError ? <p className="error">{uploadError}</p> : null}
      </section>

      <section className="card">
        <div className="sectionHeader">
          <h2 className="sectionTitle">Files</h2>
          <p className="meta">
            API: <code>{API_BASE}</code>
          </p>
        </div>

        {listError ? <p className="error">{listError}</p> : null}

        <ul className="fileList" aria-busy={listStatus === 'loading'}>
          {files.length === 0 && listStatus !== 'loading' ? (
            <li className="empty">No files found.</li>
          ) : null}
          {files.map((f) => (
            <li key={f.id} className="fileRow">
              <div className="fileMain">
                <div className="fileName" title={f.name}>
                  {f.name}
                </div>
                <div className="fileMeta">
                  <span className="mono">id: {f.id}</span>
                  {typeof f.size === 'number' ? <span className="mono">size: {f.size}</span> : null}
                </div>
              </div>
              <div className="fileActions">
                <button
                  className="btn"
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadFile(f)
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Download failed')
                    }
                  }}
                >
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
