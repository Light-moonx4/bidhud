import { NextResponse } from "next/server";

export function GET(): NextResponse {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}

export function POST(): NextResponse {
  return NextResponse.json({ error: "No implementado" }, { status: 501 });
}
