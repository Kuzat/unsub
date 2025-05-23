"use server"

import { db } from "@/db";
import { service } from "@/db/schema/app";
import { ilike, sql } from "drizzle-orm";
import crypto from "crypto";
import {CreateServiceFormValues} from "@/lib/validation/service";

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
    // Return 5 random services if no query is provided
    const services = await db
      .select()
      .from(service)
      .orderBy(() => sql`RANDOM()`)
      .limit(5);
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

/**
 * Create a new service
 * @param input The service data
 * @returns The created service
 */
export async function createService(input: CreateServiceFormValues): Promise<Service | { error: string }> {
  try {
    // Check if a service with this name already exists
    const existingService = await db
      .select()
      .from(service)
      .where(ilike(service.name, input.name))
      .limit(1);

    if (existingService.length > 0) {
      return { error: "A service with this name already exists" };
    }

    const newService = {
      id: crypto.randomUUID(),
      name: input.name,
      category: input.category,
      url: input.url || null,
      description: input.description || null,
      logoUrl: input.logoUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(service).values(newService);

    return {
      id: newService.id,
      name: newService.name,
      category: newService.category,
      url: newService.url,
      description: newService.description,
      logoUrl: newService.logoUrl,
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return { error: "Failed to create service" };
  }
}
