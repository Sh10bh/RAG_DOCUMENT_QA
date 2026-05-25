import { useState } from "react"
import UploadPanel from "./components/UploadPanel"
import ChatWindow from "./components/ChatWindow"
import "./App.css"

function App() {
  const [sessionId, setSessionId] = useState(null)
  const [filename, setFilename] = useState(null)
  const [pageCount, setPageCount] = useState(null)

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">AskMyPDF</span>
        </div>
      </header>
      <main className="app-main">
        <div className="left-panel">
          <UploadPanel
            onUploadSuccess={(sid, fname, pages) => {
              setSessionId(sid)
              setFilename(fname)
              setPageCount(pages)
            }}
            filename={filename}
            pageCount={pageCount}
          />
        </div>
        <div className="right-panel">
          <ChatWindow
            sessionId={sessionId}
            filename={filename}
          />
        </div>
      </main>
    </div>
  )
}

export default App