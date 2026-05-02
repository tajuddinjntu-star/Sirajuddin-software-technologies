import { db } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const purchase = await db.purchase.create({
    data: {
      userId: body.userId,
      softwareId: body.softwareId,
      status: "PENDING",
    },
  });

  return Response.json(purchase);
}
