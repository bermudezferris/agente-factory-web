import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AgentPageTemplate } from "@/components/agents/agent-page-template";
import { agents, getAgentBySlug } from "@/content/agents";
import { siteConfig } from "@/config/site";

type AgentPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    viewport?: string;
  }>;
};

export async function generateStaticParams() {
  return agents.map((agent) => ({
    slug: agent.slug,
  }));
}

export async function generateMetadata({
  params,
}: AgentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    return {
      title: siteConfig.name,
    };
  }

  return {
    title: agent.metadataTitle ?? `${agent.name} | ${siteConfig.name}`,
    description: agent.metadataDescription,
    openGraph: {
      title: agent.metadataTitle ?? `${agent.name} | ${siteConfig.name}`,
      description: agent.metadataDescription,
      type: "article",
    },
  };
}

export default async function AgentPage({
  params,
  searchParams,
}: AgentPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const agent = getAgentBySlug(slug);

  if (!agent) {
    notFound();
  }

  return (
    <AgentPageTemplate
      agent={agent}
      previewViewport={
        resolvedSearchParams.viewport === "mobile" ? "mobile" : "desktop"
      }
    />
  );
}
