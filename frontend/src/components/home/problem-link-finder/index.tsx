"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link2, ClipboardPaste, Sparkles, ExternalLink, Copy } from "lucide-react";
import toast from "react-hot-toast";

type LinkItem = {
  label: string;
  url: string;
};

type ResolvedProblem = {
  id: string;
  title: string;
  links: LinkItem[];
};

type ProblemSeed = {
  title?: string;
  url?: string;
};

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function searchUrl(site: string, title: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${title} site:${site}`)}`;
}

function inferTitleFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];

    if (!lastPart) return parsed.hostname;

    return lastPart
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (match) => match.toUpperCase());
  } catch {
    return undefined;
  }
}

function cleanTitleLine(line: string): string {
  return line
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
    .replace(/^\s*(?:problem|question)\s*[:.-]\s*/i, "")
    .replace(/\s*-\s*(LeetCode|Codeforces|AtCoder|HackerRank|CodeChef|GeeksforGeeks)\s*$/i, "")
    .replace(/^['"`]+|['"`]+$/g, "")
    .trim();
}

function buildGeneratedLinks(title: string): LinkItem[] {
  const slug = slugifyTitle(title);

  return [
    {
      label: "Open LeetCode",
      url: `https://leetcode.com/problems/${slug}/`,
    },
    {
      label: "LeetCode Search",
      url: searchUrl("leetcode.com/problems", title),
    },
    {
      label: "Codeforces Search",
      url: searchUrl("codeforces.com", title),
    },
    {
      label: "Other Platforms Search",
      url: `https://www.google.com/search?q=${encodeURIComponent(
        `${title} site:atcoder.jp OR site:hackerrank.com OR site:codechef.com OR site:geeksforgeeks.org`
      )}`,
    },
  ];
}

function getPrimaryPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const hostMap: Array<{ host: string; label: string }> = [
      { host: "leetcode.com", label: "LeetCode" },
      { host: "codeforces.com", label: "Codeforces" },
      { host: "atcoder.jp", label: "AtCoder" },
      { host: "hackerrank.com", label: "HackerRank" },
      { host: "codechef.com", label: "CodeChef" },
      { host: "geeksforgeeks.org", label: "GeeksforGeeks" },
    ];
    const found = hostMap.find((item) => hostname.includes(item.host));
    return found?.label ?? "Direct Link";
  } catch {
    return "Direct Link";
  }
}

function extractSeeds(text: string): ProblemSeed[] {
  const seeds: ProblemSeed[] = [];

  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const seenUrls = new Set<string>();

  for (const match of text.matchAll(markdownLinkRegex)) {
    const title = cleanTitleLine(match[1] || "");
    const url = match[2]?.trim();

    if (url && !seenUrls.has(url)) {
      seeds.push({ title: title || undefined, url });
      seenUrls.add(url);
    }
  }

  const rawUrlRegex = /https?:\/\/[^\s)]+/g;
  for (const match of text.matchAll(rawUrlRegex)) {
    const url = match[0].trim();
    if (!seenUrls.has(url)) {
      seeds.push({ url });
      seenUrls.add(url);
    }
  }

  for (const rawLine of text.split(/\r?\n/)) {
    const cleaned = cleanTitleLine(rawLine);
    if (!cleaned) continue;
    if (/^https?:\/\//i.test(cleaned)) continue;
    if (cleaned.length < 3 || cleaned.length > 120) continue;
    if (!/[a-zA-Z]/.test(cleaned)) continue;
    seeds.push({ title: cleaned });
  }

  return seeds;
}

function resolveProblems(text: string): ResolvedProblem[] {
  const seeds = extractSeeds(text);
  const resultMap = new Map<string, ResolvedProblem>();

  const addLinks = (target: ResolvedProblem, links: LinkItem[]) => {
    const known = new Set(target.links.map((link) => link.url));
    for (const link of links) {
      if (!known.has(link.url)) {
        target.links.push(link);
        known.add(link.url);
      }
    }
  };

  for (const seed of seeds) {
    const title = seed.title || inferTitleFromUrl(seed.url) || "Untitled Problem";
    const normalized = normalizeTitle(title);
    const key = normalized ? `t:${normalized}` : `u:${seed.url ?? title}`;

    const existing = resultMap.get(key);
    const current: ResolvedProblem =
      existing ?? {
        id: key,
        title,
        links: [],
      };

    if (seed.url) {
      addLinks(current, [
        {
          label: `Open ${getPrimaryPlatform(seed.url)}`,
          url: seed.url,
        },
      ]);
    }

    addLinks(current, buildGeneratedLinks(current.title));
    resultMap.set(key, current);
  }

  return Array.from(resultMap.values());
}

export default function ProblemLinkFinder() {
  const [input, setInput] = useState("");

  const results = useMemo(() => resolveProblems(input), [input]);

  const copyAllLinks = async () => {
    const lines = results.flatMap((problem) =>
      problem.links.map((link) => `${problem.title} | ${link.label}: ${link.url}`)
    );

    if (lines.length === 0) {
      toast.error("Paste questions first to generate links.");
      return;
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("All links copied.");
    } catch {
      toast.error("Could not copy links.");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Clipboard is empty.");
        return;
      }
      setInput(text);
      toast.success("Pasted from clipboard.");
    } catch {
      toast.error("Clipboard access blocked by browser.");
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-secondary/15 to-background" />
      <div className="absolute -top-28 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-premium p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/40 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Quick Utility
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
                  Problem Link Finder
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
                  Paste your question list from ChatGPT, notes, or docs. Get one-click links for LeetCode, Codeforces,
                  and other platforms.
                </p>
              </div>

              <Button onClick={copyAllLinks} variant="outline" size="sm" className="rounded-full">
                <Copy className="h-4 w-4" />
                Copy All Links
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="problem-paste" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ClipboardPaste className="h-4 w-4 text-primary" />
                  Paste problem names / full text
                </label>
                <textarea
                  id="problem-paste"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={"Example:\n1. Two Sum\n2. Best Time to Buy and Sell Stock\n3. [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)"}
                  className="min-h-72 w-full rounded-2xl border border-input bg-background/80 px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="flex items-center gap-3">
                  <Button variant="glow" className="rounded-full" onClick={pasteFromClipboard}>
                    <Link2 className="h-4 w-4" />
                    Paste from Clipboard
                  </Button>
                  <Button variant="ghost" className="rounded-full" onClick={() => setInput("")}>
                    Clear
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-secondary/20 p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Generated Results</h3>
                  <span className="text-xs text-muted-foreground">{results.length} questions</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-auto pr-1">
                  {results.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Paste your list on the left. Links will appear here instantly.
                    </p>
                  ) : (
                    results.map((problem) => (
                      <div key={problem.id} className="rounded-xl border border-border/40 bg-card/80 p-3">
                        <p className="text-sm font-medium text-foreground mb-2">{problem.title}</p>
                        <div className="flex flex-wrap gap-2">
                          {problem.links.map((link) => (
                            <a
                              key={`${problem.id}-${link.url}`}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors"
                            >
                              {link.label}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}