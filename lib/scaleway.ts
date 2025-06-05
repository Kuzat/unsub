import {createClient} from "@scaleway/sdk-client";
import {Tem} from "@scaleway/sdk";

const client = createClient({
  accessKey: process.env.SCALEWAY_ACCESS_KEY,
  secretKey: process.env.SCALEWAY_SECRET_KEY,
  defaultProjectId: process.env.SCALEWAY_PROJECT_ID,
  defaultRegion: 'fr-par',
  defaultZone: 'fr-par-1',
});

export const scalewayTEM = new Tem.v1alpha1.API(client);