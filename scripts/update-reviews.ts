import "dotenv/config"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

const updates = [
  {
    slug: "financial-analysis",
    review_summary: "Comprehensive financial modeling toolkit with institutional-grade workflows, strict data source hierarchies, and 11 MCP data connectors for real data access out of the box",
    review_strengths: [
      "Provides deeply actionable, multi-step workflows for each model type with concrete validation checklists and output format specifications",
      "Integrates 11 production-grade MCP data connectors (Daloopa, FactSet, S&P, Morningstar, PitchBook) giving real data access out of the box",
      "Commands and skills compose well together -- DCF references comps analysis for terminal multiples, creating a coherent analytical pipeline",
    ],
    review_weaknesses: [
      "No authentication or credential guidance for the 11 MCP endpoints, leaving users to figure out access and API keys on their own",
      "Missing error handling or fallback behavior when MCP data sources are unavailable or return incomplete data",
    ],
    review_quality_score: 8,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "investment-banking",
    review_summary: "Covers the core IB workflow with nine focused skills spanning deal materials, presentations, and transaction support, each mapped to a clear slash command with usage examples",
    review_strengths: [
      "Provides a well-scoped command set that mirrors real IB analyst deliverables (CIMs, teasers, strip profiles, merger models)",
      "Includes practical example workflows showing exact input/output expectations for key commands",
      "Clean plugin structure with separated commands, skills, and hooks directories following a consistent convention",
    ],
    review_weaknesses: [
      "Declares no permissions in plugin.json despite skills that likely need filesystem write access and potentially network access for market data",
      "Empty .mcp.json suggests external tool integrations are incomplete or undocumented, leaving unclear how financial data is sourced",
    ],
    review_quality_score: 7,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "equity-research",
    review_summary: "Comprehensive equity research workstation covering the full analyst workflow from morning notes to initiating coverage, with production-grade templates and rigorous sourcing standards",
    review_strengths: [
      "Covers the real day-to-day equity research workflow end-to-end (earnings, coverage initiation, morning notes, catalyst tracking, screening)",
      "Enforces rigorous sourcing and citation standards with clickable hyperlinks to SEC filings, transcripts, and earnings releases",
      "Commands are cleanly separated from skills, with clear argument hints and sensible defaults",
    ],
    review_weaknesses: [
      "No permission declarations or hooks found, leaving it unclear what file-system or network access the plugin expects",
      "Skills like initiating-coverage enforce strict single-task sequential execution that may frustrate users wanting a streamlined end-to-end run",
    ],
    review_quality_score: 8,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "private-equity",
    review_summary: "Comprehensive PE workflow suite with nine well-structured skills spanning the full deal lifecycle from sourcing through IC memo and portfolio monitoring",
    review_strengths: [
      "Covers the complete PE deal lifecycle with domain-specific rigor (screening criteria tables, IRR/MOIC sensitivity matrices, IC memo structure)",
      "Commands cleanly delegate to skills with sensible argument hints, making the plugin immediately usable from the CLI",
      "Skills include actionable financial frameworks (returns attribution, pass/fail screening, scenario analysis) rather than generic instructions",
    ],
    review_weaknesses: [
      "Empty .mcp.json and hooks.json means no tool integrations despite the description promising CRM integration and founder outreach",
      "No README at the plugin level -- new users have no onboarding path explaining how to install or configure fund-specific criteria",
    ],
    review_quality_score: 7,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "wealth-management",
    review_summary: "Well-structured suite of six wealth management skills with domain-accurate workflows covering client reporting, financial planning, portfolio rebalancing, and tax-loss harvesting",
    review_strengths: [
      "Covers the core wealth management workflow end-to-end with domain-specific depth (Monte Carlo projections, wash sale rules, drift bands, asset location)",
      "Each skill provides a concrete multi-step process with realistic deliverables, compliance guardrails, and nuanced guidance",
      "Commands are cleanly wired to skills with argument hints, making the plugin immediately usable from slash commands",
    ],
    review_weaknesses: [
      "No README at the plugin level -- a new user has no orientation on how the six skills relate or what data sources are expected",
      "Hooks file is empty, and no permissions are declared despite skills that imply file generation and sensitive client data access",
    ],
    review_quality_score: 8,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "lseg-financial-data",
    review_summary: "Eight specialized financial analysis workflows stitching together LSEG MCP tools into structured, actionable output with specific tables and trade recommendations",
    review_strengths: [
      "Covers a broad, coherent set of institutional-grade workflows (fixed income, FX, equity, derivatives, macro) with domain-specific rigor",
      "Every skill specifies exact tool names, sequenced steps, and structured output tables, making agent execution deterministic",
      "Cleanly separates concerns: single MCP server endpoint, per-workflow skills, and matching slash commands",
    ],
    review_weaknesses: [
      "Lacks error handling guidance when LSEG API credentials are invalid or data entitlements are missing for a requested instrument",
      "No example inputs or sample outputs in the skills, which would help users calibrate expectations before running a workflow",
    ],
    review_quality_score: 8,
    review_generated_at: new Date().toISOString(),
  },
  {
    slug: "sp-global-capital-iq",
    review_summary: "Three production-grade skills delivering real financial workflows with unusually rigorous data-integrity rules and explicit prohibitions against hallucinated financials",
    review_strengths: [
      "Enforces strict data provenance: every fact must trace to an S&P Capital IQ MCP call, with N/A over fabrication and audit trails",
      "Covers three distinct, high-value analyst workflows end-to-end with detailed formatting specs and audience-tailored output",
      "Minimal permission surface -- one HTTP MCP endpoint, no shell access, no filesystem writes outside designated directories",
    ],
    review_weaknesses: [
      "No error-handling guidance when the MCP endpoint is unreachable or credentials expire mid-session",
      "Skills lack version pinning or schema validation against the MCP server tool definitions, risking silent breakage if upstream API changes",
    ],
    review_quality_score: 8,
    review_generated_at: new Date().toISOString(),
  },
]

async function run() {
  for (const { slug, ...data } of updates) {
    const { error } = await supabase.from("skills").update(data).eq("slug", slug)
    console.log(slug, error ? "ERROR: " + error.message : "OK")
  }
}
run()
