import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { purchaseId } = await req.json();

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase || purchase.status !== "PAID") {
    return Response.json({ error: "Not allowed" });
  }

  return Response.json({
    downloadUrl: "/files/software.zip",
  });
}
