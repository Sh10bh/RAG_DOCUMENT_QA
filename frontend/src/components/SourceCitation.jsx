function SourceCitation({ sources }) {
  return (
    <div style={{ marginTop: "6px" }}>
      <span style={{ fontSize: "12px", color: "#6b7280" }}>
        📄 Sources: {sources.map(p => `Page ${p}`).join(", ")}
      </span>
    </div>
  )
}

export default SourceCitation