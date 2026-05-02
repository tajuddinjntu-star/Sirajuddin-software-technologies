import { db } from "@/lib/db";

export default async function AdminPage() {
  const purchases = await db.purchase.findMany();

  return (
    <main style={{ padding: 40 }}>
      <h1>Admin Dashboard</h1>
      <p>Total Purchases: {purchases.length}</p>

      {purchases.map((purchase: any) => (
        <div key={purchase.id} style={{ padding: 12, background: "white", marginBottom: 10 }}>
          <strong>{purchase.id}</strong> — {purchase.status}
        </div>
      ))}
    </main>
  );
}
