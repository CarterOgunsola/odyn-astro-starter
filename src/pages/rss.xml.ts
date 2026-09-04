import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { SITE } from "@/config/site";

export async function GET(context: APIContext) {
  const notes = (await getCollection("notes")).filter((n) => !n.data.draft);
  return rss({
    title: `${SITE.name}${SITE.titleSeparator}${SITE.feed.title}`,
    description: SITE.feed.description,
    site: context.site ?? SITE.url,
    items: notes
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((n) => ({
        title: n.data.title,
        description: n.data.description,
        pubDate: n.data.date,
        link: `/notes/${n.id}/`,
      })),
  });
}
