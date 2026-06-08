import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidatePath("/blog");
  return NextResponse.json({ revalidated: true, timestamp: Date.now() });
}
