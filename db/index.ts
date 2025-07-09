import 'dotenv/config';
import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as appSchema from '@/db/schema/app';
import * as authSchema from '@/db/schema/auth';
import * as relationsSchema from '@/db/schema/relations'

const DATABASE_URL = process.env.DATABASE_URL!;
const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...appSchema,
    ...authSchema,
    ...relationsSchema
  },
});
