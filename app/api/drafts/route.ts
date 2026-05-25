import { NextRequest, NextResponse } from "next/server";
import { isNextResponse, requireSessionId } from "@/lib/api-utils";
import { serializeDraft } from "@/lib/serialize-draft";
import { createDraftSchema } from "@/lib/validations/quote";
import {
  createDraftForSession,
  getDraftsForSession,
} from "@/lib/services/quotes";

export async function GET(req: NextRequest) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const drafts = await getDraftsForSession(sessionResult);
    return NextResponse.json(
      { drafts: drafts.map(serializeDraft) },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/drafts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionResult = requireSessionId(req);
    if (isNextResponse(sessionResult)) {
      return sessionResult;
    }

    const body = await req.json();
    const parsed = createDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const draft = await createDraftForSession(sessionResult, parsed.data);
    return NextResponse.json(
      { draft: serializeDraft(draft) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/drafts error:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}
