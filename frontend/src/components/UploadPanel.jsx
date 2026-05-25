import { useState, useRef } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export default function UploadPanel({ onUploadSuccess, filename, pageCount }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files are allowed"); return }
    setUploading(true); setError(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await fetch(`${API_URL}/upload`, { method: "POST", body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Upload failed")
      onUploadSuccess(data.session_id, file.name, data.page_count || "?")
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        onClick={() => !uploading && fileInputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? "#2563eb" : "#93c5fd"}`,
          borderRadius: "12px",
          padding: "32px 20px",
          textAlign: "center",
          background: dragging ? "#dbeafe" : "white",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>⬆️</div>
        <p style={{ fontWeight: 600, color: "#1e40af", marginBottom: "4px" }}>
          Drop your PDF here
        </p>
        <p style={{ fontSize: "12px", color: "#94a3b8" }}>or click to browse · max 50 MB</p>
        {uploading && <p style={{ color: "#2563eb", marginTop: "10px", fontSize: "14px" }}>⏳ Processing PDF...</p>}
        {error && <p style={{ color: "red", marginTop: "10px", fontSize: "13px" }}>❌ {error}</p>}
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
      </div>

      {filename && (
        <div style={{ background: "white", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #e2e8f0" }}>
          <span style={{ fontSize: "24px" }}>📄</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>{filename}</p>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>{pageCount} pages</p>
          </div>
          <span style={{ color: "#22c55e", fontSize: "18px" }}>✓</span>
        </div>
      )}

      <div style={{ background: "white", borderRadius: "10px", padding: "16px", border: "1px solid #e2e8f0" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", marginBottom: "12px" }}>HOW IT WORKS</p>
        {[["01", "Upload any PDF"], ["02", "AI indexes it"], ["03", "Ask questions"]].map(([num, text]) => (
          <div key={num} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>{num}</span>
            <span style={{ fontSize: "13px", color: "#475569" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}