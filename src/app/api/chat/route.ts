import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/deepseek";
import { buildSystemPrompt } from "@/lib/prompts";
import rolesData from "@/lib/roles-data.json";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, stage } = body as {
      messages: ChatMessage[];
      stage?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build system prompt with roles data
    const rolesSummary = buildRolesSummary(rolesData);
    const systemPrompt = buildSystemPrompt(rolesSummary);

    // Construct full message list with system prompt
    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Get temperature based on stage
    const temperature = getTemperatureForStage(stage);

    const stream = await streamChat(fullMessages, {
      temperature,
      max_tokens: 2000,
      top_p: 0.9,
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function getTemperatureForStage(stage?: string): number {
  switch (stage) {
    case "demographics":
      return 0.4;
    case "role_nomination":
      return 0.3;
    case "triad_comparison":
      return 0.3;
    case "rating":
      return 0.2;
    case "report":
      return 0.5;
    default:
      return 0.4;
  }
}

interface RolesJsonData {
  roles: Array<{
    id: number;
    role_name: string;
    definition: string;
    category: string;
    tags: string[];
    match_weight: number;
    applicable_population: string;
  }>;
  categories: string[];
}

function buildRolesSummary(data: unknown): string {
  const rolesJson = data as RolesJsonData;
  const categories = rolesJson.categories;
  const lines: string[] = ["# 中国本土高频角色关系库\n"];

  for (const category of categories) {
    lines.push(`## ${category}`);
    const categoryRoles = rolesJson.roles.filter(
      (r) => r.category === category
    );
    for (const role of categoryRoles) {
      const tags = role.tags.join("、");
      lines.push(
        `- **${role.role_name}**（${role.definition}）[权重:${role.match_weight}] 适用:${role.applicable_population} 标签:${tags}`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
