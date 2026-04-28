import Link from 'next/link';
import { getPublishedSoftware } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { company } from '@/lib/site';

export default async function HomePage() {
  const products = await getPublishedSoftware();

  return (
    <main>
      <section className="hero section">
        <div className="container">
          <span className="badge">Industrial software storefront</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.1, maxWidth: 760, margin: '18px 0' }}>
            Publish and sell your software with Google login, buyer access, and secure checkout.
          </h1>
          <p className="muted" style={{ fontSize: 18, maxWidth: 780 }}>
            {company.name} builds practical software for engineering and oil & gas workflows. Launch your own products,
            accept online payments, and let customers sign in with Gmail / Google to access purchased tools.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap' }}>
            <Link href="/pricing" className="btn-primary">View pricing</Link>
            <Link href="#products" className="btn-secondary">Explore products</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="card"><strong>Google sign-in</strong><p className="muted">Customers register quickly with Gmail / Google account authentication.</p></div>
            <div className="card"><strong>Stripe payments</strong><p className="muted">Accept one-time licenses now, with monthly subscriptions already modeled.</p></div>
            <div className="card"><strong>Admin control</strong><p className="muted">Manage software listings, publish status, downloads, and customer access.</p></div>
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 16, marginBottom: 24 }}>
            <div>
              <span className="badge">Products</span>
              <h2 style={{ fontSize: 36, margin: '14px 0 8px' }}>Featured software</h2>
              <p className="muted">Start with your welding platform and add more software products anytime.</p>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
