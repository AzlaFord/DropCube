import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'

function formatBytes(size) {
  if (typeof size !== 'number') return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getFilenameFromContentDisposition(headerValue) {
  if (!headerValue) return null

  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(headerValue)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].trim())

  const quotedMatch = /filename\s*=\s*"([^"]+)"/i.exec(headerValue)
  if (quotedMatch?.[1]) return quotedMatch[1].trim()

  const plainMatch = /filename\s*=\s*([^;]+)/i.exec(headerValue)
  if (plainMatch?.[1]) return plainMatch[1].trim()

  return null
}

function readSavedFileMeta(publicId) {
  const raw = localStorage.getItem(`dropcube:file:${publicId}`)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function FilePage() {
  const { public_id } = useParams()
  const location = useLocation()
  const [fileMeta, setFileMeta] = useState(location.state?.file ?? null)
  const [metaStatus, setMetaStatus] = useState(location.state?.file ? 'success' : 'loading')
  const [downloadStatus, setDownloadStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!public_id) return

    if (location.state?.file) {
      setFileMeta(location.state.file)
      localStorage.setItem(`dropcube:file:${public_id}`, JSON.stringify(location.state.file))
      setMetaStatus('success')
      setError('')
      return
    }

    const savedMeta = readSavedFileMeta(public_id)
    if (savedMeta) setFileMeta(savedMeta)

    let cancelled = false

    ;(async () => {
      setMetaStatus('loading')
      setError('')

      try {
        const res = await fetch(`${API_BASE}/files/meta/${encodeURIComponent(public_id)}`, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!res.ok) {
          throw new Error('File not found or expired')
        }

        const data = await res.json()
        if (cancelled) return

        setFileMeta(data)
        localStorage.setItem(`dropcube:file:${public_id}`, JSON.stringify(data))
        setMetaStatus('success')
      } catch {
        if (cancelled) return
        setFileMeta(null)
        setMetaStatus('error')
        setError('File not found or expired')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [location.state, public_id])

  const isExpired = useMemo(() => {
    if (!fileMeta?.expires_at) return false
    return new Date(fileMeta.expires_at).getTime() <= Date.now()
  }, [fileMeta])

  async function handleDownload() {
    if (!public_id) return

    setError('')
    setDownloadStatus('loading')

    try {
      const res = await fetch(`${API_BASE}/files/${encodeURIComponent(public_id)}`)

      if (!res.ok) {
        throw new Error(res.status === 404 ? 'File not found or expired.' : `Download failed (${res.status})`)
      }

      const blob = await res.blob()
      const contentDisposition = res.headers.get('content-disposition')
      const filename =
        getFilenameFromContentDisposition(contentDisposition) ??
        fileMeta?.name ??
        `file-${public_id}`

      const url = URL.createObjectURL(blob)

      try {
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
      } finally {
        URL.revokeObjectURL(url)
      }

      setDownloadStatus('success')
    } catch (error) {
      setDownloadStatus('error')
      setError(error instanceof Error ? error.message : 'Download failed')
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">File</h1>
          <p className="subtitle">
            Temporary file page for <code>{public_id}</code>
          </p>
        </div>
      </header>

      <section className="card">
        <h2 className="sectionTitle">Details</h2>

        {metaStatus === 'loading' ? (
          <p className="meta">Loading file details...</p>
        ) : fileMeta ? (
          <div className="stack">
            <p>
              <strong>Filename:</strong> {fileMeta.name}
            </p>
            <p>
              <strong>Size:</strong> {formatBytes(fileMeta.size)}
            </p>
            <p>
              <strong>Expires:</strong> {formatDate(fileMeta.expires_at)}
            </p>
          </div>
        ) : (
          <p className="error">File not found or expired.</p>
        )}

        {isExpired ? <p className="error">This file has expired.</p> : null}
        {error && !(metaStatus === 'error' && !fileMeta) ? <p className="error">{error}</p> : null}

        <div className="actions">
          <button
            className="btn primary"
            type="button"
            onClick={handleDownload}
            disabled={downloadStatus === 'loading' || isExpired}
          >
            {downloadStatus === 'loading' ? 'Downloading...' : 'Download'}
          </button>

          <Link className="btn" to="/upload">
            Back to upload
          </Link>
        </div>
      </section>
    </div>
  )
}
