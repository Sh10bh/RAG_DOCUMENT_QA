import { useState } from "react"
import UploadPanel from "./components/UploadPanel"
import ChatWindow from "./components/ChatWindow"

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState(null)

  return (
    <div style={{
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ textAlign: "center", color: "#2563eb" }}>
        📄 AskMyPDF
      </h1>
      <p style={{ textAlign: "center", color: "#666" }}>
        Upload a PDF and ask questions about it
      </p>

      <UploadPanel
        onUploadSuccess={(sid, fname) => {
          setSessionId(sid)
          setFilename(fname)
        }}
      />

      {sessionId && (
        <ChatWindow
          sessionId={sessionId}
          filename={filename}
        />
      )}
    </div>
  )
}

export default App