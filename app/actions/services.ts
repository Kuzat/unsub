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
import {user} from "@/db/schema/auth";
import {ServiceWithUser} from "@/app/(dashboard)/admin/service-catalog/columns";

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

export type ServiceScope =
  | "userAndGlobal"
  | "globalOnly"
  | "all";

interface FetchServicesOptions {
  scope: ServiceScope;
  userId?: string;
  page: number;
  pageSize: number;
  query?: string;
}

export async function fetchServices({
                                      scope,
                                      userId,
                                      page,
                                      pageSize,
                                      query = "",
                                    }: FetchServicesOptions) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, pageSize);
  const offset = (page - 1) * validPageSize;

  let whereClause;
  if (scope === "userAndGlobal" && userId) {
    whereClause = or(
      eq(service.scope, "global"),
      eq(service.ownerId, userId),
    );
  } else if (scope === "globalOnly") {
    whereClause = eq(service.scope, "global");
  } else if (scope === "all") {
    whereClause = undefined;
  } else {
    throw new Error(`Invalid service scope: ${scope}`);
  }

  // Add a text-search condition if `query` is present
  const searchCond = query ? ilike(service.name, `%${query}%`) : undefined;

  // count + paginate
  const [{count: totalServices}] = await db
    .select({count: count()})
    .from(service)
    .where(and(
      whereClause,
      searchCond
    ));

  const queryBuilder = db
    .select()
    .from(service)
    .where(and(whereClause, searchCond))
    .limit(validPageSize)
    .offset(offset)
    .orderBy(service.name) // TODO: Might make this configable, if we add popularity or other sorting options

  const rows = (scope === "all"
    ? await queryBuilder.leftJoin(user, eq(service.ownerId, user.id)) as ServiceWithUser[]
    : await queryBuilder as Service[]);


  return {
    services: rows,
    totalPages: Math.ceil(totalServices / validPageSize),
    currentPage: validPage,
  }
}

export async function getServicesForUser(
  session: { user: User },
  page: number = 1,
  pageSize: number = 10,
  query?: string
) {
  return fetchServices({
    scope: "userAndGlobal",
    userId: session.user.id,
    page,
    pageSize,
    query,
  });
}


export async function getServicesForAdmin(
  page: number = 1,
  pageSize: number = 10,
  query?: string
) {
  return fetchServices({
    scope: "all",
    page,
    pageSize,
    query,
  });
}


export async function getGlobalServices(
  page: number = 1,
  pageSize: number = 10,
  query?: string
) {
  return fetchServices({
    scope: "globalOnly",
    page,
    pageSize,
    query,
  });
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
    return {error: "You must be logged in to update a service"};
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
      return {error: "Service not found or you don't have permission to update it"};
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
      return {error: "Failed to update service"};
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
    return {error: "Failed to update service"};
  }
}

export async function getServiceById(serviceId: string): Promise<Service | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return {error: "You must be logged in to view this service"};
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
      return {error: "Service not found"};
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
    return {error: "Failed to fetch service"};
  }
}

export async function deleteService(serviceId: string): Promise<{ success: string } | { error: string }> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return {error: "You must be logged in to delete a service"};
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
      return {error: "Service not found or you don't have permission to delete it"};
    }

    // Delete the service
    const result = await db
      .delete(service)
      .where(and(
        eq(service.id, serviceId),
        eq(service.ownerId, session.user.id)
      ))
      .returning({id: service.id});

    if (result.length === 0) {
      return {error: "Failed to delete service"};
    }

    return {success: "Service deleted successfully"};
  } catch (error) {
    console.error("Error deleting service:", error);
    return {error: "Failed to delete service"};
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
