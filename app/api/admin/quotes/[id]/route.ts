import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  deleteQuoteAsAdmin,
  updateQuoteAsAdmin,
} from "@/lib/services/admin";

const updateSchema = z
  .object({
    text: z.string().min(1).max(1000).optional(),
    author: z.string().max(120).optional(),
    category: z.string().optional(),
    theme: z.string().optional(),
    alignment: z.string().optional(),
    backgroundImage: z.string().url().nullable().optional(),
    showQuoteMarks: z.boolean().optional(),
    authorCasing: z.string().optional(),
    featured: z.boolean().optional(),
  })
  .strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const quote = await updateQuoteAsAdmin(id, parsed.data);
    return NextResponse.json({ quote }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/quotes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update quote" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteQuoteAsAdmin(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/quotes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
