import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const { childId, weekKey, amount } = body as {
      childId: string;
      weekKey: string;
      amount: number;
    };

    await sql`
      insert into weekly_carryovers (child_id, week_key, amount)
      values (${childId}, ${weekKey}, ${amount})
      on conflict (child_id, week_key) do update
      set amount = excluded.amount
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur d'écriture du report", detail: String(error) },
      { status: 500 },
    );
  }
}
