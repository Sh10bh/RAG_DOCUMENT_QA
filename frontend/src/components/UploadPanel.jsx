import { useState } from "react"

const API_URL = "http://127.0.0.1:8000"

function UploadPanel({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are allowed")
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed")
      }

      setUploaded(true)
      onUploadSuccess(data.session_id, data.filename)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{
      border: "2px dashed #2563eb",
      borderRadius: "8px",
      padding: "30px",
      textAlign: "center",
      marginBottom: "20px",
      backgroundColor: uploaded ? "#f0fdf4" : "#f8faff"
    }}>
      {!uploaded ? (
        <>
          <p style={{ fontSize: "18px", marginBottom: "10px" }}>
            📁 Upload your PDF
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ marginBottom: "10px" }}
          />
          {uploading && <p style={{ color: "#2563eb" }}>⏳ Processing PDF...</p>}
          {error && <p style={{ color: "red" }}>❌ {error}</p>}
        </>
      ) : (
        <p style={{ color: "green", fontSize: "18px" }}>
          ✅ PDF uploaded successfully! You can now ask questions.
        </p>
      )}
    </div>
  )
}

export default UploadPanel