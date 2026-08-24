import Link from "next/link";

import { AgentPortrait } from "@/components/brand/agent-portrait";
import { Card } from "@/components/ui/card";
import { ResultTag } from "@/components/ui/result-tag";
import type { AgentSummary } from "@/content/agents";

type AgentCardProps = {
  agent: AgentSummary;
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="space-y-5">
        <AgentPortrait
          accent={agent.accent}
          className="h-60"
          initials={agent.initials}
          portrait={agent.portrait}
        />
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-semibold tracking-[-0.02em] text-white">
                {agent.name}
              </p>
              <p className="mt-1 text-sm text-slate-300">{agent.role}</p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] text-slate-300">
              IA
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            {agent.cardDescription ?? agent.tagline}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <ResultTag label={agent.result} />
          <Link
            href={`/agentes/${agent.slug}`}
            className="text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
          >
            Conoce a {agent.name}
          </Link>
        </div>
      </div>
    </Card>
  );
}
