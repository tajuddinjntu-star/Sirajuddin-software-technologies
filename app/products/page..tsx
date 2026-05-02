export default function ProductsPage() {
  return (
    <main style={{ padding: 50 }}>
      <h1>Our Products</h1>
      <p>Professional software tools for engineering, welding, and QA/QC teams.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 30 }}>
        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h2>WeldWise Assistant (32)</h2>
          <p>Oil & gas welding data software for weld tracking, RT/UT/MT reports, NDE status, and QA/QC records.</p>
          <p><strong>Type:</strong> Web Tool</p>
          <p><strong>Currency:</strong> INR</p>
          <button style={{ background: "#0b5ed7", color: "white", border: 0, padding: "12px 18px", borderRadius: 8 }}>
            Purchase Coming Soon
          </button>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h2>QA/QC Report Manager</h2>
          <p>Manage inspection reports, daily monitoring logs, and project documentation.</p>
          <p><strong>Status:</strong> Coming Soon</p>
        </div>

        <div style={{ background: "white", padding: 25, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
          <h2>Welding Dashboard Pro</h2>
          <p>Dashboard for welding progress, NDE percentage, repair tracking, and project summaries.</p>
          <p><strong>Status:</strong> Coming Soon</p>
        </div>
      </div>
    </main>
  );
}
