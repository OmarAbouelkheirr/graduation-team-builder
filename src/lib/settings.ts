import { getDb } from "./db";

export interface SiteSettings {
  _id?: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  siteName: string;
  siteDescription: string;
  updatedAt: Date;
}

const DEFAULT_SETTINGS: Omit<SiteSettings, "_id"> = {
  maintenanceMode: false,
  maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
  siteName: "UniConnect",
  siteDescription: "Graduation Project Team Matching Platform",
  updatedAt: new Date(),
};

export async function getSettings(): Promise<SiteSettings> {
  const db = await getDb();
  const settings = await db.collection<SiteSettings>("settings").findOne({});
  
  if (!settings) {
    // Create default settings if none exist
    const result = await db.collection<SiteSettings>("settings").insertOne({
      ...DEFAULT_SETTINGS,
    } as SiteSettings);
    return { ...DEFAULT_SETTINGS, _id: result.insertedId.toString() };
  }
  
  return {
    ...settings,
    _id: settings._id?.toString(),
  };
}

export async function updateSettings(
  updates: Partial<Omit<SiteSettings, "_id" | "updatedAt">>
): Promise<SiteSettings> {
  const db = await getDb();
  
  const result = await db.collection<SiteSettings>("settings").findOneAndUpdate(
    {},
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    {
      upsert: true,
      returnDocument: "after",
    }
  );
  
  if (!result) {
    throw new Error("Failed to update settings");
  }
  
  return {
    ...result,
    _id: result._id?.toString(),
  };
}
