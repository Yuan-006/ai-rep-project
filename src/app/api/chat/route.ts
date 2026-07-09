import { NextRequest } from "next/server";
import { streamChat, type ChatMessage } from "@/lib/deepseek";
import { buildSystemPrompt } from "@/lib/prompts";
import rolesData from "@/lib/roles-data.json";

export const runtime = "nodejs";

// 预计算角色摘要 — 模块加载时执行一次，避免每次请求都重建
const ROLES_SUMMARY = buildRolesSummary(rolesData);

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

    // 用阶段专用精简 prompt + 预计算的角色摘要
    const systemPrompt = buildSystemPrompt(ROLES_SUMMARY, undefined, stage);

    const fullMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    const temperature = getTemperatureForStage(stage);
    // 根据阶段调整 max_tokens — 简单回复用更少 tokens
    const maxTokens = getMaxTokensForStage(stage);

    const stream = await streamChat(fullMessages, {
      temperature,
      max_tokens: maxTokens,
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

function getMaxTokensForStage(stage?: string): number {
  switch (stage) {
    case "demographics":
      return 500;       // 简短提问
    case "role_nomination":
      return 400;       // 简短确认
    case "triad_comparison":
      return 600;       // 中等追问
    case "rating":
      return 300;       // 指令式
    case "report":
      return 3000;      // 完整报告
    default:
      return 800;
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
  // 精简格式：每角色一行
  const lines: string[] = ["# 角色库\n"];

  for (const category of categories) {
    const categoryRoles = rolesJson.roles.filter(
      (r) => r.category === category
    );
    if (categoryRoles.length === 0) continue;
    lines.push(`## ${category}`);
    for (const role of categoryRoles) {
      lines.push(
        `- ${role.role_name}：${role.definition}（适用:${role.applicable_population}）`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}
