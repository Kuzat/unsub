import { categoryEnum } from "../schema/_common";

export type SeedService = {
  id?: string;          // optional – script will generate UUIDs if omitted
  name: string;
  category: (typeof categoryEnum.enumValues)[number];
  url: string;
  description?: string;
};

// 💡 Keep an array alphabetical for merge-conflict hygiene
export const seedServices: SeedService[] = [
  {
    name: "Adobe Creative Cloud",
    category: "software",
    url: "https://www.adobe.com/creativecloud.html",
    description: "Photography, video & design apps bundle",
  },
  {
    name: "ChatGPT Plus",
    category: "software",
    url: "https://chat.openai.com",
    description: "OpenAI ChatGPT Plus subscription",
  },
  {
    name: "Disney+",
    category: "streaming",
    url: "https://www.disneyplus.com",
  },
  {
    name: "Netflix",
    category: "streaming",
    url: "https://www.netflix.com",
  },
  {
    name: "Spotify Premium",
    category: "streaming",
    url: "https://www.spotify.com/premium",
  },
] satisfies SeedService[];