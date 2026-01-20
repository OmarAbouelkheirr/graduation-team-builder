import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settings";
import { assertAdminAuthorized } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = assertAdminAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("Error fetching settings", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = assertAdminAuthorized(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    // Remove _id and updatedAt from updates (immutable fields)
    const { _id, updatedAt, ...updates } = body;
    const updated = await updateSettings(updates);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating settings", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 }
    );
  }
}
