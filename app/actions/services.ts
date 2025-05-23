"use server"

import { db } from "@/db";
import { service } from "@/db/schema/app";
import { ilike } from "drizzle-orm";

export type Service = {
  id: string;
  name: string;
  category: string;
  url: string | null;
  description: string | null;
  logoUrl: string | null;
};

/**
 * Search for services by name
 * @param query The search query
 * @returns An array of services matching the query
 */
export async function searchServices(query: string): Promise<Service[]> {
  if (!query || query.trim() === "") {
    // Return all services if no query is provided
    const services = await db.select().from(service).limit(20);
    return services;
  }

  // Search for services with names that match the query
  const services = await db
    .select()
    .from(service)
    .where(ilike(service.name, `%${query}%`))
    .limit(20);

  return services;
}