CREATE TABLE "fx_rates" (
	"base" "currency" NOT NULL,
	"quote" "currency" NOT NULL,
	"rate" numeric(18, 8) NOT NULL,
	"fetched_at" timestamp NOT NULL,
	CONSTRAINT "fx_rates_base_quote_pk" PRIMARY KEY("base","quote")
);
