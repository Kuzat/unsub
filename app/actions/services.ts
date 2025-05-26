"use server"

import {db} from "@/db";
import {service} from "@/db/schema/app";
import {count, ilike} from "drizzle-orm";
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
    return db
      .select()
      .from(service)
      .limit(5);
  }

  // Search for services with names that match the query
  return db
    .select()
    .from(service)
    .where(ilike(service.name, `%${query}%`))
    .limit(20);
}

/**
 * Get all services with pagination
 * @param page The page number (1-based)
 * @param pageSize The number of items per page
 * @returns An object containing the services and pagination info
 */
export async function getServices(page: number = 1, pageSize: number = 10): Promise<{
  services: Service[];
  totalServices: number;
  totalPages: number;
  currentPage: number;
}> {
  // Ensure page and pageSize are valid
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const offset = (validPage - 1) * validPageSize;

  // Get a total count of services
  const totalServicesResult = await db
    .select({ count: count() })
    .from(service);

  const totalServices = Number(totalServicesResult[0].count);
  const totalPages = Math.ceil(totalServices / validPageSize);

  // Get services for the current page
  const services = await db
    .select()
    .from(service)
    .limit(validPageSize)
    .offset(offset)
    .orderBy(service.name);

  return {
    services,
    totalServices,
    totalPages,
    currentPage: validPage,
  };
}

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
