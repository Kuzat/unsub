import {meter} from "@/lib/meter-provider";

const latestFxRatesCounter = meter.createCounter("fx_rates_api.latest", {
  description: "Number of times getLatestFxRates() was called",
})

const API_TOKEN = process.env.FX_RATES_API_TOKEN!
const API_URL = "https://api.fxratesapi.com"

type FxRatesApiResponse = {
  success: boolean,
  rates: Record<string, number>
  timestamp: number,
  date: string,
  base: string,
  error?: string,
}

/**
 * Docs from: https://fxratesapi.com/docs/endpoints/latest-exchange-rates
 *
 * @param base
 * @param quote
 */
export async function getLatestFxRates(base: string, quote: string) {
  const url = `${API_URL}/latest?base=${base}&currencies=${quote}`

  const response = await fetch(url, {
    method: "GET", headers: {
      "Authorization": `Bearer ${API_TOKEN}`
    }
  });

  if (!response.ok) {
    latestFxRatesCounter.add(1, {to: quote, from: base, status: "error"})
    throw new Error(`Error fetching latest FX rates: ${response.statusText}`)
  }

  const data = await response.json() as FxRatesApiResponse;

  if (!data.success) {
    latestFxRatesCounter.add(1, {to: quote, from: base, status: "error"})
    switch (data.error) {
      case "invalid_base_currency":
        throw new Error("Invalid base currency")
      case "invalid_currencies":
        throw new Error("Invalid quote currency")
      default:
        throw new Error("Error fetching latest FX rates: " + data.error)
    }
  }

  const rate = data.rates[quote]
  if (!rate) {
    latestFxRatesCounter.add(1, {to: quote, from: base, status: "error"})
    throw new Error(`No rate found for ${quote}`)
  }

  latestFxRatesCounter.add(1, {to: quote, from: base, status: "success"})
  return rate
}