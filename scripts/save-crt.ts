#!/usr/bin/env -S tsx
/**
 * Reads the DATABASE_CA_CRT environment variable and writes its contents
 * to /etc/ssl/certs/database-ca.crt
 *
 * USAGE:
 *   pnpm tsx scripts/save-crt.ts
 *
 *   # or with env vars
 *   DATABASE_CA_CRT="-----BEGIN CERTIFICATE-----..." \
 *     pnpm tsx scripts/save-crt.ts
 */

import "dotenv/config";
import chalk from "chalk";
import { writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { mkdir } from "node:fs/promises";

async function main() {
  console.log('Saving database CA certificate...');

  // Read the certificate from environment variable
  const caCertificate = process.env.DATABASE_CA_CRT;

  if (!caCertificate) {
    throw new Error("DATABASE_CA_CRT environment variable is not set");
  }

  const outputPath = "database-ca.crt";

  // Ensure the directory exists
  // try {
  //   await mkdir(dirname(outputPath), { recursive: true });
  // } catch (error) {
  //   // Ignore error if directory already exists
  //   console.error(error)
  // }

  // Write the certificate to the file
  await writeFile(outputPath, caCertificate, 'utf-8');

  console.log(chalk.green(`✔ Certificate successfully saved to ${outputPath}`));
}

main().catch((err) => {
  console.error(chalk.red("Saving certificate file failed:"), err);
  process.exit(1);
});
