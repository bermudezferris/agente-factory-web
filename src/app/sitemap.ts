import type { MetadataRoute } from "next";

import { agents } from "@/content/agents";
import { siteConfig } from "@/config/site";

const canonicalRoutes = [
  "/",
  "/diagnostico-estrategico-ia",
  "/privacidad",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-24T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = canonicalRoutes.map((route) => ({
    url: route === "/" ? siteConfig.baseUrl : `${siteConfig.baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "/privacidad" ? "monthly" : "weekly",
    priority: route === "/" ? 1 : route === "/privacidad" ? 0.3 : 0.9,
  }));

  const agentRoutes: MetadataRoute.Sitemap = agents.map((agent) => ({
    url: `${siteConfig.baseUrl}/agentes/${agent.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...agentRoutes];
}
