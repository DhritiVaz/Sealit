import axios from "axios";
import * as cheerio from "cheerio";
import type { RawPost } from "./types";

const USER_AGENT = "Sealit/1.0 (hackathon project; +https://sealit.dev)";

export async function scrapeReddit(
  subreddit: string,
  limit = 5
): Promise<RawPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 15000,
    });

    const posts: RawPost[] = [];
    for (const child of data?.data?.children ?? []) {
      const post = child.data;
      if (!post?.title || post.stickied) continue;

      posts.push({
        title: post.title,
        body: post.selftext || "",
        url: `https://reddit.com${post.permalink}`,
        source: "reddit",
        subreddit,
      });
    }
    return posts;
  } catch (err) {
    console.error(`Reddit scrape error (${subreddit}):`, err);
    return [];
  }
}

export async function scrapeAskHN(limit = 5): Promise<RawPost[]> {
  try {
    const { data: storyIds } = await axios.get<number[]>(
      "https://hacker-news.firebaseio.com/v0/askstories.json",
      { timeout: 15000 }
    );

    const posts: RawPost[] = [];
    const ids = (storyIds ?? []).slice(0, limit * 2);

    for (const id of ids) {
      if (posts.length >= limit) break;

      try {
        const { data: item } = await axios.get(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
          { timeout: 10000 }
        );

        if (!item?.title) continue;

        posts.push({
          title: item.title,
          body: item.text ? stripHtml(item.text) : "",
          url: `https://news.ycombinator.com/item?id=${id}`,
          source: "hn",
        });
      } catch {
        continue;
      }
    }

    return posts;
  } catch (err) {
    console.error("HN scrape error:", err);
    return [];
  }
}

function stripHtml(html: string): string {
  const $ = cheerio.load(html);
  return $.text().trim();
}

export async function scrapeAllSources(): Promise<RawPost[]> {
  const [smt, startups, hn] = await Promise.all([
    scrapeReddit("SomebodyMakeThis", 5),
    scrapeReddit("startups", 3),
    scrapeAskHN(5),
  ]);

  return [...smt, ...startups, ...hn];
}
