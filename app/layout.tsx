import type { ReactNode } from "react";

export const metadata = {
  title: "Sirajuddin Software Technologies",
  description: "WeldWise Assistant Software Platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f4f8ff", color: "#102033" }}>
        <header style={{ background: "#0b5ed7", color: "white", padding: "18px 50px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 22 }}>Sirajuddin Software Technologies</strong>
          <nav style={{ display: "flex", gap: 24 }}>
            <a href="/" style={{ color: "white", textDecoration: "none" }}>Home</a>
            <a href="/products" style={{ color: "white", textDecoration: "none" }}>Products</a>
            <a href="/about" style={{ color: "white", textDecoration: "none" }}>About Us</a>
            <a href="/admin" style={{ color: "white", textDecoration: "none" }}>Admin</a>
          </nav>
        </header>

        {children}

        <footer style={{ background: "#102033", color: "white", padding: 30, textAlign: "center", marginTop: 60 }}>
          © 2026 Sirajuddin Software Technologies Company Ltd. All rights reserved.
        </footer>
      </body>
    </html>
  );
}

