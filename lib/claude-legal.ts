import Anthropic from "@anthropic-ai/sdk";
import { ContractAnalysis } from "@/types/analysis";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildPrompt(partyName?: string): string {
  const partyContext = partyName
    ? `
IMPORTANT — USER'S PERSPECTIVE:
The user is representing "${partyName}" in this contract. You MUST analyze every clause strictly from their point of view:
- "favorable" means the clause benefits "${partyName}" specifically
- "unfavorable" means the clause is disadvantageous or risky for "${partyName}" specifically
- All risks, recommendations, and red flags should be framed from "${partyName}"'s perspective
- The fairnessScore should reflect how fair the contract is for "${partyName}" (50 = neutral, >50 = favorable to them, <50 = unfavorable to them)
- In the summary, explicitly state how this contract positions "${partyName}"
`
    : `
NOTE: No specific party perspective provided. Perform a balanced, neutral analysis.
`;

  return `You are an expert legal analyst and contract lawyer with decades of experience in corporate law, contract drafting, and legal risk assessment. Your task is to perform a comprehensive, professional analysis of the provided contract document.
${partyContext}
Analyze the contract thoroughly and provide your analysis in the following JSON format. Be precise, specific, and actionable in your analysis. Do not use generic responses - cite specific clauses and provisions.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks, just raw JSON):

{
  "contractType": "Type of contract (e.g., Employment Agreement, NDA, Service Agreement, etc.)",
  "contractTitle": "Official title of the contract",
  "overallRisk": "low|medium|high|critical",
  "riskScore": <number 0-100, higher means riskier for the user's party>,
  "summary": "Comprehensive 3-4 sentence executive summary. If a party perspective is given, include an explicit statement on how the contract positions that party.",
  "effectiveDate": "Contract effective date if found",
  "expirationDate": "Contract expiration/termination date if found",
  "jurisdiction": "Applicable jurisdiction",
  "governingLaw": "Governing law clause",
  "parties": [
    {
      "name": "Party name",
      "role": "Role (e.g., Employer, Employee, Client, Vendor)",
      "obligations": ["Specific obligation 1", "Specific obligation 2"],
      "rights": ["Specific right 1", "Specific right 2"]
    }
  ],
  "keyClauses": [
    {
      "title": "Clause name",
      "content": "Summary of clause content",
      "type": "favorable|unfavorable|neutral",
      "importance": "low|medium|high",
      "pageHint": "Quote first few words of the clause for location"
    }
  ],
  "risks": [
    {
      "title": "Risk name",
      "description": "Detailed description of the risk",
      "level": "low|medium|high|critical",
      "clause": "Relevant clause or section reference",
      "recommendation": "Specific actionable recommendation"
    }
  ],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
  "redFlags": ["Critical issue 1", "Critical issue 2"],
  "strengths": ["Positive aspect 1", "Positive aspect 2"],
  "missingClauses": ["Missing important clause 1", "Missing important clause 2"],
  "unusualProvisions": ["Unusual or non-standard provision 1"],
  "financialTerms": {
    "amount": "Contract value if applicable",
    "currency": "Currency",
    "paymentTerms": "Payment terms and schedule",
    "penalties": "Penalty clauses"
  },
  "terminationClauses": ["Termination condition 1", "Termination condition 2"],
  "confidentialityClauses": ["Confidentiality provision 1"],
  "disputeResolution": "Method of dispute resolution",
  "completenessScore": <number 0-100>,
  "fairnessScore": <number 0-100, 50 is neutral, higher is more favorable to the user's party>,
  "analysisTimestamp": "${new Date().toISOString()}"
}

Be thorough and specific. Identify at least 3-5 key clauses, 2-4 risks, and 3-5 recommendations. If something is not found in the document, use null for that field or an empty array for array fields.

CONTRACT DOCUMENT TO ANALYZE:
`;
}

export async function analyzeContract(
  contractText: string,
  partyName?: string
): Promise<ContractAnalysis> {
  const prompt = buildPrompt(partyName);

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: prompt + contractText,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  const rawText = content.text.trim();

  // Clean up any potential markdown code blocks
  const jsonText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const analysis = JSON.parse(jsonText) as ContractAnalysis;
    return analysis;
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ContractAnalysis;
    }
    throw new Error("Failed to parse analysis response as JSON");
  }
}
