import { useState } from "react"
import SourceCitation from "./SourceCitation"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

function ChatWindow({ sessionId, filename }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)

  const sendQuestion = async () => {
    if (!question.trim()) return

    const userMessage = { role: "user", content: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          question: question
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error getting answer")
      }

      const aiMessage = {
        role: "assistant",
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Error: " + err.message,
        sources: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendQuestion()
    }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ backgroundColor: "#2563eb", padding: "12px 16px" }}>
        <p style={{ color: "white", margin: 0, fontWeight: "bold" }}>
          Chat with: {filename}
        </p>
      </div>

      <div style={{
        height: "400px",
        overflowY: "auto",
        padding: "16px",
        backgroundColor: "#f9fafb"
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#9ca3af", textAlign: "center", marginTop: "150px" }}>
            Ask your first question about the document
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "70%",
              padding: "10px 14px",
              borderRadius: "12px",
              backgroundColor: msg.role === "user" ? "#2563eb" : "white",
              color: msg.role === "user" ? "white" : "#111",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              {msg.content}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <SourceCitation sources={msg.sources} />
            )}
          </div>
        ))}
        {loading && (
          <p style={{ color: "#2563eb" }}>Thinking...</p>
        )}
      </div>

      <div style={{
        display: "flex",
        padding: "12px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "white"
      }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about your PDF..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            marginRight: "8px",
            fontSize: "14px"
          }}
        />
        <button
          onClick={sendQuestion}
          disabled={loading || !question.trim()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindow