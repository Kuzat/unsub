"use server"

import {db} from "@/db";
import {service} from "@/db/schema/app";
import {and, count, eq, ilike, or} from "drizzle-orm";
import crypto from "crypto";
import {CreateServiceFormValues, createServiceSchema} from "@/lib/validation/service";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {User} from "better-auth";
import {categoryEnum} from "@/db/schema/_common";

export type Service = {
  id: string;
  name: string;
  category: typeof categoryEnum.enumValues[number];
  url: string | null | undefined;
  description: string | null | undefined;
  logoUrl: string | null | undefined;
  scope: string;
};

/**
 * Search for services by name
 * @param query The search query
 * @returns An array of services matching the query
 */
export async function searchServices(query: string): Promise<Service[]> {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const serviceScopeCondition = getServiceScopeCondition(session);

  if (!query || query.trim() === "") {
    // Return 5 random services if no query is provided
    return db
      .select()
      .from(service)
      .where(serviceScopeCondition)
      .limit(5);
  }

  // Search for services with names that match the query
  return db
    .select()
    .from(service)
    .where(and(
      serviceScopeCondition,
      ilike(service.name, `%${query}%`)
    ))
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
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Get services should also be available for non-authenticated users, but then only global services should be returned
  const serviceScopeCondition = getServiceScopeCondition(session);

  // Ensure page and pageSize are valid
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const offset = (validPage - 1) * validPageSize;

  // Get a total count of services
  const totalServicesResult = await db
    .select({count: count()})
    .from(service)
    .where(serviceScopeCondition);

  const totalServices = Number(totalServicesResult[0].count);
  const totalPages = Math.ceil(totalServices / validPageSize);

  // Get services for the current page
  const services = await db
    .select()
    .from(service)
    .where(serviceScopeCondition)
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
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return {error: "You must be logged in to create a service"}
  }

  try {
    const data = createServiceSchema.parse(input)
    // Check if a service with this name already exists
    const existingService = await db
      .select()
      .from(service)
      .where(and(
        eq(service.ownerId, session.user.id),
        ilike(service.name, data.name)
      ))
      .limit(1);

    if (existingService.length > 0) {
      return {error: `The service ${data.name} already exists. Consider using it or choosing a different name.`};
    }

    const newService: typeof service.$inferInsert = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      url: data.url || null,
      description: data.description || null,
      logoUrl: data.logoUrl || null,
      scope: "user",
      ownerId: session.user.id,
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
      scope: "user",
    };
  } catch (error) {
    console.error("Error creating service:", error);
    return {error: "Failed to create service"};
  }
}

export async function updateService(
  serviceId: string,
  input: CreateServiceFormValues
): Promise<Service | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { error: "You must be logged in to update a service" };
  }

  try {
    // Validate the input data
    const data = createServiceSchema.parse(input);

    // Check if the service exists and belongs to the user
    const existingService = await db
      .select()
      .from(service)
      .where(and(
        eq(service.id, serviceId),
        eq(service.ownerId, session.user.id),
        eq(service.scope, "user") // Only allow updating user services
      ))
      .limit(1);

    if (existingService.length === 0) {
      return { error: "Service not found or you don't have permission to update it" };
    }

    // Update the service
    const result = await db
      .update(service)
      .set({
        name: data.name,
        category: data.category,
        url: data.url || null,
        description: data.description || null,
        logoUrl: data.logoUrl || null,
        updatedAt: new Date(),
      })
      .where(and(
        eq(service.id, serviceId),
        eq(service.ownerId, session.user.id)
      ))
      .returning();

    if (result.length === 0) {
      return { error: "Failed to update service" };
    }

    return {
      id: result[0].id,
      name: result[0].name,
      category: result[0].category,
      url: result[0].url,
      description: result[0].description,
      logoUrl: result[0].logoUrl,
      scope: result[0].scope,
    };
  } catch (error) {
    console.error("Error updating service:", error);
    return { error: "Failed to update service" };
  }
}

export async function getServiceById(serviceId: string): Promise<Service | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { error: "You must be logged in to view this service" };
  }

  try {
    // Check if the service exists and is accessible to the user
    const result = await db
      .select()
      .from(service)
      .where(and(
        eq(service.id, serviceId),
        and(
          eq(service.scope, "user"),
          eq(service.ownerId, session.user.id)
        )
      ))
      .limit(1);

    if (result.length === 0) {
      return { error: "Service not found" };
    }

    return {
      id: result[0].id,
      name: result[0].name,
      category: result[0].category,
      url: result[0].url,
      description: result[0].description,
      logoUrl: result[0].logoUrl,
      scope: result[0].scope,
    };
  } catch (error) {
    console.error("Error fetching service:", error);
    return { error: "Failed to fetch service" };
  }
}

export async function deleteService(serviceId: string): Promise<{ success: string } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return { error: "You must be logged in to delete a service" };
  }

  try {
    // Check if the service exists and belongs to the user
    const existingService = await db
      .select()
      .from(service)
      .where(and(
        eq(service.id, serviceId),
        eq(service.ownerId, session.user.id),
        eq(service.scope, "user") // Only allow deleting user services
      ))
      .limit(1);

    if (existingService.length === 0) {
      return { error: "Service not found or you don't have permission to delete it" };
    }

    // Delete the service
    const result = await db
      .delete(service)
      .where(and(
        eq(service.id, serviceId),
        eq(service.ownerId, session.user.id)
      ))
      .returning({ id: service.id });

    if (result.length === 0) {
      return { error: "Failed to delete service" };
    }

    return { success: "Service deleted successfully" };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error: "Failed to delete service" };
  }
}

function getServiceScopeCondition(session: { user: User } | null) {
  let serviceScopeCondition;
  if (session) {
    serviceScopeCondition = or(
      eq(service.scope, "global"),
      eq(service.ownerId, session.user.id),
    );
  } else {
    serviceScopeCondition = eq(service.scope, "global");
  }

  return serviceScopeCondition
}
