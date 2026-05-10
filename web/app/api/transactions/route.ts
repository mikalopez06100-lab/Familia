import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/neon";

export async function POST(req: NextRequest) {
  try {
    const sql = getSql();
    const body = await req.json();
    const {
      id,
      childId,
      ruleId,
      label,
      value,
      date,
      addedBy,
      createdAt,
    } = body as {
      id: string;
      childId: string;
      ruleId: string;
      label: string;
      value: number;
      date: string;
      addedBy: string;
      createdAt: string;
    };

    await sql`
      insert into transactions (id, child_id, rule_id, label, value, date, added_by, created_at)
      values (${id}, ${childId}, ${ruleId}, ${label}, ${value}, ${date}, ${addedBy}, ${createdAt})
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur d'écriture transaction", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sql = getSql();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id manquant" }, { status: 400 });
    }

    await sql`delete from transactions where id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur suppression transaction", detail: String(error) },
      { status: 500 },
    );
  }
}
