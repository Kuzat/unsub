import {db} from "@/db";
import {fxRates} from "@/db/schema/app";
import {and, eq} from "drizzle-orm";
import {getLatestFxRates} from "@/lib/fx-rates-api";
import {meter} from "@/lib/meter-provider";

const convertCounter = meter.createCounter("fx_cache.convert",{
  description: "Number of times convert() was called",
})

const getRateCacheHitCounter = meter.createCounter("fx_cache.get_rate.hit",{
  description: "Number of times getRate() returned a cached value",
});

const getRateCacheMissCounter = meter.createCounter("fx_cache.get_rate.miss",{
  description: "Number of times getRate() returned a fresh value",
});

const STALE_MS = parseInt(process.env.FX_CACHE_STALE_MS ?? "604800000", 10);

type GetRateArgs = {
  base: string;
  quote: string;
};

export async function getRate({base, quote}: GetRateArgs): Promise<number> {
  const now = Date.now();

  const row = await db
    .select({rate: fxRates.rate, fetchedAt: fxRates.fetchedAt})
    .from(fxRates)
    .where(and(eq(fxRates.base, base), eq(fxRates.quote, quote)))
    .limit(1)
    .then((rows) => rows[0]);

  // Fresh row exists then return it
  if (row && (now - row.fetchedAt.getTime()) < STALE_MS) {
    getRateCacheHitCounter.add(1, {from: base, to: quote})
    return Number(row.rate);
  }

  getRateCacheMissCounter.add(1, {from: base, to: quote})
  // Need a fresh rate
  const freshRate = await fetchRateFromProvider(base, quote);

  await db
    .insert(fxRates)
    .values({base, quote, rate: freshRate.toString(), fetchedAt: new Date()})
    .onConflictDoUpdate({
      target: [fxRates.base, fxRates.quote],
      set: {rate: freshRate.toString(), fetchedAt: new Date()},
    });

  return freshRate;
}

export async function convert(amount: number, from: string, to: string) {
  convertCounter.add(1, {
    from,
    to,
  })
  if (from === to) {
    return amount;
  }

  const rate = await getRate({base: from, quote: to});
  return amount * rate;
}

async function fetchRateFromProvider(base: string, quote: string) {
  // Could make this configurable or something
  return await getLatestFxRates(base, quote)
}