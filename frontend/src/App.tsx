import ComplaintForm from './components/ComplaintForm'
import AIAssistantPanel from './components/AIAssistantPanel'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AIVOA Complaint Management System</h1>
      </header>
      <main className="app-main">
        <div className="form-panel">
          <ComplaintForm />
        </div>
        <div className="ai-panel">
          <AIAssistantPanel />
        </div>
      </main>
    </div>
  )
}

export default App
