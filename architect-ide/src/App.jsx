import { useState } from "react"
import Editor from "@monaco-editor/react"

function App() {
  const [showInterview, setShowInterview] = useState(true)

  const [architecture, setArchitecture] = useState({
    expectedUsers: "",
    type: ""
  })

  return (
    <div style={{
      background: "#0F172A",
      height: "100vh",
      color: "white",
      display: "flex",
      flexDirection: "column"
    }}>

      {/* Top Bar */}
      <div style={{
        height: "60px",
        background: "#1E293B",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        justifyContent: "space-between"
      }}>
        <div style={{ fontWeight: "bold" }}>Architect IDE</div>
        <div>Architecture Score: 100</div>
      </div>

      {/* Main Layout */}
      <div style={{ flex: 1, display: "flex" }}>

        {/* Architecture Panel */}
        <div style={{
          width: "25%",
          background: "#1E293B",
          padding: "20px"
        }}>
          <h3>Architecture Panel</h3>
          <p><strong>Type:</strong> {architecture.type}</p>
          <p><strong>Expected Users:</strong> {architecture.expectedUsers}</p>
        </div>

        {/* Code Editor */}
        <div style={{
          width: "50%",
          background: "#0B1220"
        }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={`// Start coding...\n\nfunction example() {\n  console.log("Hello Architect");\n}`}
            theme="vs-dark"
          />
        </div>

        {/* Risk Dashboard */}
        <div style={{
          width: "25%",
          background: "#1E293B",
          padding: "20px"
        }}>
          <h3>Risk Dashboard</h3>
          <p>Overengineering Risk: Low</p>
          <p>Scalability Readiness: Medium</p>
          <p>Security Surface: Low</p>
        </div>

      </div>

      {/* Mentor Console */}
      <div style={{
        height: "150px",
        background: "#1E293B",
        padding: "20px"
      }}>
        <h3>Mentor Console</h3>
        <p>System ready.</p>
      </div>

      {/* Architecture Interview Modal */}
      {showInterview && (
        <ArchitectureInterview
          onSubmit={(data) => {
            setArchitecture(data)
            setShowInterview(false)
          }}
        />
      )}

    </div>
  )
}

function ArchitectureInterview({ onSubmit }) {
  const [expectedUsers, setExpectedUsers] = useState("")
  const [type, setType] = useState("")

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#1E293B",
        padding: "30px",
        borderRadius: "8px",
        width: "400px"
      }}>
        <h2>Project Setup</h2>

        <div style={{ marginBottom: "15px" }}>
          <label>Expected Users:</label>
          <input
            value={expectedUsers}
            onChange={(e) => setExpectedUsers(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Architecture Type:</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px"
            }}
          >
            <option value="">Select</option>
            <option value="Monolith">Monolith</option>
            <option value="Microservices">Microservices</option>
          </select>
        </div>

        <button
          onClick={() => {
            if (!expectedUsers || !type) return
            onSubmit({ expectedUsers, type })
          }}
          style={{
            padding: "10px",
            background: "#3B82F6",
            border: "none",
            color: "white",
            width: "100%",
            cursor: "pointer"
          }}
        >
          Start Project
        </button>
      </div>
    </div>
  )
}

export default App
