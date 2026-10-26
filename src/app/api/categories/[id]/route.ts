import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}

export function PATCH(): NextResponse {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}

export function DELETE(): NextResponse {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}
