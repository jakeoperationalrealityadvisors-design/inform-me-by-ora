import "./globals.css";

export default function App() {
  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="top-bar">
        <h1 className="brand">
          <span className="brand-accent">In</span>Form Me
        </h1>
        <div className="top-icons">
          <span className="icon">🔔</span>
          <span className="icon">⋮</span>
        </div>
      </header>

      {/* Search */}
      <div className="search-wrap">
        <input
          className="search"
          placeholder="Search forms and checklists..."
        />
      </div>

      {/* AI Suggestions */}
      <section className="section">
        <h2 className="section-title">✨ AI Suggestions</h2>

        <div className="card">
          <div className="card-header">
            <span>📈</span>
            <strong>Frequently Used</strong>
          </div>
          <p>You often use “Orchard Inspection”</p>
          <button className="btn-primary">Fill Now</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span>⏰</span>
            <strong>Overdue Tasks</strong>
          </div>
          <p>You have 3 overdue tasks</p>
          <button className="btn-secondary">View Tasks</button>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs">
        <button className="tab active">Forms</button>
        <button className="tab">Checklists</button>
      </div>

      {/* List */}
      <section className="list">
        {[
          ["Soil Sample Collection", "Field Analysis", "13 fields"],
          ["Timber Harvest Plan", "Forestry", "13 fields"],
          ["Orchard Inspection", "Horticulture", "13 fields"],
          ["Poultry Production Log", "Poultry Farming", "11 fields"],
        ].map(([title, tag, meta]) => (
          <div key={title} className="list-item">
            <div className="list-left">
              <span className="doc-icon">📄</span>
              <div>
                <strong>{title}</strong>
                <div className="meta">
                  <span className="pill">{tag}</span>
                  <span className="muted">{meta}</span>
                </div>
              </div>
            </div>
            <button className="btn-fill">Fill</button>
          </div>
        ))}
      </section>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <span className="active">🏠 Home</span>
        <span>📝 Forms</span>
        <span className="temp">Temp</span>
        <span>📁 Docs</span>
      </nav>
    </div>
  );
}
