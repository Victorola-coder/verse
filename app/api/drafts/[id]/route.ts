import {
  getDraftById,
  deleteDraftForSession,
  updateDraftForSession,
} from "@/lib/services/quotes"
import { serializeDraft } from "@/lib/serialize-draft";
import { NextRequest, NextResponse } from "next/server";
import { updateDraftSchema } from "@/lib/validations/quote";
import { isNextResponse, requireSessionId } from "@/lib/api-utils";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const { id } = await params;
    const draft = await getDraftById(id, sessionResult);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft: serializeDraft(draft) }, { status: 200 });
  } catch (error) {
    console.error("GET /api/drafts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const draft = await updateDraftForSession(id, sessionResult, parsed.data);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft: serializeDraft(draft) }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/drafts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const { id } = await params;
    const deleted = await deleteDraftForSession(id, sessionResult);

    if (!deleted) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/drafts/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
