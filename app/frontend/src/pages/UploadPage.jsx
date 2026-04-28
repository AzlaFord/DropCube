import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'
const APP_BASE = 'http://localhost:5173'
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

function persistFileMeta(file) {
  localStorage.setItem(`dropcube:file:${file.public_id}`, JSON.stringify(file))
}



export default function UploadPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [uploadError, setUploadError] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [copyStatus, setCopyStatus] = useState('idle')

  const filePageLink = useMemo(() => {
    if (!uploadedFile?.public_id) return ''
    return `${APP_BASE}/file/${uploadedFile.public_id}`
  }, [uploadedFile])
  
  async function handleSubmit(e) {
    e.preventDefault()
    console.log("SUBMIT TRIGGERED")
  
    setUploadError('')
    setUploadedFile(null)
    setCopyStatus('idle')
    setUploadStatus('loading')
  
    if (!selectedFile) {
      setUploadStatus('error')
      setUploadError('Choose a file first.')
      return
    }
  
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
  
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })
  

  
      const text = await res.text()
  
      const data = JSON.parse(text)
  
      setUploadedFile(data)
      setSelectedFile(null)
      setUploadStatus('success')
  
    } catch (error) {
      setUploadStatus('error')
      setUploadError(error.message)
    }
  }

  async function handleCopyLink() {
    if (!filePageLink) return

    try {
      await navigator.clipboard.writeText(filePageLink)
      setCopyStatus('success')
    } catch {
      setCopyStatus('error')
      setUploadError('Failed to copy link.')
    }
  }

  function handleOpenFilePage() {
    if (!uploadedFile?.public_id) return

    navigate(`/file/${uploadedFile.public_id}`, {
      state: { file: uploadedFile },
    })
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1 className="title">DropCube</h1>
          <p className="subtitle">Upload a file and get a temporary download link.</p>
        </div>
      </header>

      <section className="card">
        <h2 className="sectionTitle">Upload</h2>
        <form className="upload" type="submit" onSubmit={handleSubmit} method="post" encType="multipart/form-data">
          <input
            className="fileInput"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            disabled={uploadStatus === 'loading'}
          />
          <button className="btn primary" type="submit" disabled={uploadStatus === 'loading'}>
            {uploadStatus === 'loading' ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        {uploadStatus === 'success' ? <p className="success">Upload successful.</p> : null}
        {uploadError ? <p className="error">{uploadError}</p> : null}
      </section>

      {uploadedFile ? (
        <section className="card">
          <h2 className="sectionTitle">Uploaded file</h2>
          <div className="stack">
            <p>
              <strong>Link:</strong> <code>{filePageLink}</code>
            </p>
            <p>
              <strong>Name:</strong> {uploadedFile.name}
            </p>
            <p>
              <strong>Size:</strong> {formatBytes(uploadedFile.size)}
            </p>
            <p>
              <strong>Expires:</strong> {formatDate(uploadedFile.expires_at)}
            </p>
          </div>

          <div className="actions">
            <button className="btn" type="button" onClick={handleCopyLink}>
              {copyStatus === 'success' ? 'Link copied' : 'Copy Link'}
            </button>
            <button className="btn primary" type="button" onClick={handleOpenFilePage}>
              Open File Page
            </button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
