"use server"
import {requireSession} from "@/lib/auth";
import { convert } from "@/lib/fx-cache";
import * as z from "zod";
import {convertCurrencySchema} from "@/components/dashboard/currency-converter-module";

// Define the result type for our action
export type ActionResult = 
  | { success: string; result?: number }
  | { error: string }
  | undefined;

export type ConvertCurrencyData = z.infer<typeof convertCurrencySchema>;

/**
 * Server action to convert currency
 * Requires authentication
 */
export async function convertCurrency(
  data: ConvertCurrencyData
): Promise<ActionResult> {
  await requireSession()

  try {
    // Validate input data
    const validatedData = data;
    
    // Perform the conversion
    const result = await convert(
      validatedData.amount,
      validatedData.fromCurrency,
      validatedData.toCurrency
    );

    return {
      success: "Currency converted successfully",
      result: result
    };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "An unknown error occurred. Please try again."
    };
  }
}