import { useState, useRef, useEffect } from "react"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export default function ChatWindow({ sessionId, filename }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages, loading])

  const sendQuestion = async () => {
    if (!question.trim() || !sessionId) return
    const userMsg = { role: "user", content: question }
    setMessages(prev => [...prev, userMsg])
    setQuestion("")
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Error getting answer")
      setMessages(prev => [...prev, { role: "ai", content: data.answer, sources: data.sources }])
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ " + err.message, sources: [] }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "white" }}>
      {filename && (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af" }}>💬 Chat with: {filename}</p>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {!sessionId && (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "60px" }}>
            <p style={{ fontSize: "32px" }}>📄</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>Upload a PDF to start chatting</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-start" }}>
            {msg.role === "ai" && <span style={{ fontSize: "20px", marginTop: "4px" }}>🤖</span>}
            <div style={{ maxWidth: "70%" }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#2563eb" : "#f1f5f9",
                color: msg.role === "user" ? "white" : "#1e293b",
                fontSize: "14px", lineHeight: "1.5"
              }}>
                {msg.content}
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                  {msg.sources.map((s, j) => (
                    <span key={j} style={{ fontSize: "11px", background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "20px" }}>
                      📄 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🤖</span>
            <div style={{ background: "#f1f5f9", borderRadius: "18px 18px 18px 4px", padding: "14px 18px", display: "flex", gap: "4px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: "8px", height: "8px", borderRadius: "50%", background: "#94a3b8",
                  animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0", background: "white" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end", background: "#f8fafc", borderRadius: "12px", padding: "10px 14px", border: "1px solid #e2e8f0" }}>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion() }}}
            placeholder="Ask a question about your PDF..."
            disabled={loading || !sessionId}
            maxLength={500}
            rows={1}
            style={{ flex: 1, border: "none", background: "transparent", resize: "none", fontSize: "14px", color: "#1e293b", outline: "none", fontFamily: "Inter, sans-serif" }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{question.length}/500</span>
            <button
              onClick={sendQuestion}
              disabled={loading || !question.trim() || !sessionId}
              style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: (!question.trim() || !sessionId) ? 0.5 : 1 }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  )
}