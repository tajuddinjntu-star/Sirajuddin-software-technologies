export default function HomePage() {
  return (
    <main>
      <section style={{ padding: "80px 50px", background: "linear-gradient(135deg, #0b5ed7, #003b8f)", color: "white" }}>
        <h1 style={{ fontSize: 46, marginBottom: 16 }}>Engineering Software Built for Oil & Gas Professionals</h1>
        <p style={{ fontSize: 20, maxWidth: 750 }}>
          Publish, manage, and sell professional software tools for welding, QA/QC, and engineering workflows.
        </p>
        <a href="/products" style={{ display: "inline-block", marginTop: 25, background: "white", color: "#0b5ed7", padding: "14px 24px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
          View Products
        </a>
      </section>

      <section style={{ padding: "50px" }}>
        <h2>Featured Software</h2>
        <div style={{ background: "white", padding: 30, borderRadius: 12, boxShadow: "0 4px 15px rgba(0,0,0,0.08)", maxWidth: 700 }}>
          <h3>WeldWise Assistant (32)</h3>
          <p>Oil & gas welding data software for weld logs, inspection reports, NDE tracking, and QA/QC documentation.</p>
          <p><strong>Price:</strong> INR — Coming Soon</p>
          <a href="/products" style={{ color: "#0b5ed7", fontWeight: "bold" }}>Learn More →</a>
        </div>
      </section>
    </main>
  );
}
