const API_TOKEN = process.env.FX_RATES_API_TOKEN
if (!API_TOKEN) {
  throw new Error("FX_RATES_API_TOKEN environment variable is required");
}
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
  const url = `${API_URL}/latest?base=${base}&currencies=${quote}&apiKey=${API_TOKEN}`

  const response = await fetch(url, {method: "GET"});

  const data = await response.json() as FxRatesApiResponse;

  if (!data.success) {
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
    throw new Error(`No rate found for ${quote}`)
  }
  return rate
}