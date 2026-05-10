import { NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function GET() {
  try {
    const sql = getSql();
    const transactions = await sql`
      select id, child_id, rule_id, label, value, date, added_by, created_at
      from transactions
      order by created_at desc
    `;

    const carryovers = await sql`
      select child_id, week_key, amount
      from weekly_carryovers
    `;

    return NextResponse.json({
      transactions: transactions.map((row) => ({
        id: row.id,
        childId: row.child_id,
        ruleId: row.rule_id,
        label: row.label,
        value: Number(row.value),
        date: row.date,
        addedBy: row.added_by,
        createdAt: row.created_at,
      })),
      carryovers: carryovers.reduce<Record<string, number>>((acc, row) => {
        acc[`${row.child_id}:${row.week_key}`] = Number(row.amount);
        return acc;
      }, {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur de lecture Neon", detail: String(error) },
      { status: 500 },
    );
  }
}
