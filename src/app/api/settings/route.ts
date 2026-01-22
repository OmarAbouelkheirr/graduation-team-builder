import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(
      {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        featuredLabel: settings.featuredLabel || "مبرمج المنصة",
        specialLabel: settings.specialLabel || "مميز",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching public settings", error);
    return NextResponse.json(
      { 
        maintenanceMode: false,
        siteName: "UniConnect",
        siteDescription: "Graduation Project Team Matching Platform",
      },
      { status: 200 }
    );
  }
}
