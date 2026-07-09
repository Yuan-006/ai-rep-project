"use client";

import { useChat } from "@/hooks/use-chat";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import rolesData from "@/lib/roles-data.json";

const STAGE_LABELS: Record<string, string> = {
  demographics: "信息采集",
  role_nomination: "角色提名",
  triad_comparison: "三元比较",
  rating: "构念评分",
  report: "报告生成",
};

const STAGE_ORDER = [
  "demographics",
  "role_nomination",
  "triad_comparison",
  "rating",
  "report",
];

// 角色信息类型
interface RoleInfo {
  name: string;        // 称呼（如"小雨"）
  relation: string;    // 关系类型（如"发小"）
  roleId?: number;     // 角色库中的ID
  roleName?: string;   // 角色库中的角色名称
  isConfirmed?: boolean; // 是否已确认
}

// 构建角色库映射表
const roleLibraryMap = new Map<string, { id: number; name: string }>();
rolesData.roles.forEach((role: { id: number; role_name: string; definition: string; category: string }) => {
  // 添加角色名称映射
  roleLibraryMap.set(role.role_name, { id: role.id, name: role.role_name });
  // 添加常见别名映射
  const aliases: Record<string, string[]> = {
    "母亲": ["妈妈", "娘"],
    "父亲": ["爸爸", "爹"],
    "祖父": ["爷爷"],
    "祖母": ["奶奶"],
    "外祖父": ["外公", "姥爷"],
    "外祖母": ["外婆", "姥姥"],
    "兄长": ["哥哥"],
    "配偶或恋人": ["老婆", "老公", "女朋友", "男朋友", "恋人"],
    "最亲近的兄弟": ["兄弟"],
    "最亲近的姐妹": ["姐妹"],
  };
  if (aliases[role.role_name]) {
    aliases[role.role_name].forEach(alias => {
      roleLibraryMap.set(alias, { id: role.id, name: role.role_name });
    });
  }
});

// 从对话历史中提取已提及的角色及其信息
function extractMentionedRoles(messages: { role: string; content: string }[], stage?: string): RoleInfo[] {
  const roles: RoleInfo[] = [];
  const seen = new Set<string>();
  
  // 只在角色提名阶段及之后的阶段提取角色
  // 人口学信息采集阶段（demographics）不提取角色
  if (stage === 'demographics') {
    return roles;
  }
  
  // 角色关系映射
  const relationMap: Record<string, string> = {
    "妈妈": "母亲", "爸爸": "父亲", "爷爷": "祖父", "奶奶": "祖母",
    "外公": "外祖父", "外婆": "外祖母", "姥姥": "外祖母",
    "哥哥": "兄长", "姐姐": "姐姐", "弟弟": "弟弟", "妹妹": "妹妹",
    "发小": "发小", "同学": "同学", "室友": "室友", "朋友": "朋友",
    "闺蜜": "闺蜜", "兄弟": "兄弟", "姐妹": "姐妹",
    "老师": "老师", "导师": "导师", "教授": "教授", "师傅": "师傅", "教练": "教练",
    "同事": "同事", "领导": "领导", "上司": "上司", "老板": "老板", "下属": "下属", "员工": "员工",
    "网友": "网友", "游戏好友": "网友", "社群伙伴": "社群伙伴",
    "自己": "现在的自己", "现在的自己": "现在的自己", "理想中的自己": "理想中的自己",
  };
  
  // 常见的角色关系词
  const roleKeywords = [
    "妈妈", "爸爸", "爷爷", "奶奶", "外公", "外婆", "姥姥",
    "哥哥", "姐姐", "弟弟", "妹妹",
    "发小", "同学", "室友", "朋友", "闺蜜", "兄弟", "姐妹",
    "老师", "导师", "教授", "师傅", "教练",
    "同事", "领导", "上司", "老板", "下属", "员工",
    "网友", "游戏好友", "社群伙伴",
    "自己", "现在的自己", "理想中的自己",
  ];
  
  messages.forEach(msg => {
    // 只从用户消息中提取角色，不从 AI 消息中提取
    if (msg.role !== 'user') return;
    
    const content = msg.content;
    
    // 提取角色列表（如"1. 妈妈（李华）"）
    const roleListMatch = content.match(/\d+\.\s*([^\s（(]+)[（(]([^）)]+)[）)]/g);
    if (roleListMatch) {
      roleListMatch.forEach(match => {
        const m = match.match(/([^\s（(]+)[（(]([^）)]+)[）)]/);
        if (m) {
          const relation = m[1];
          const name = m[2];
          if (!seen.has(name)) {
            seen.add(name);
            // 查找角色库中的对应角色
            const mappedRelation = relationMap[relation] || relation;
            const libraryRole = roleLibraryMap.get(mappedRelation) || roleLibraryMap.get(relation);
            roles.push({
              name,
              relation: mappedRelation,
              roleId: libraryRole?.id,
              roleName: libraryRole?.name,
              isConfirmed: !!libraryRole,
            });
          }
        }
      });
    }
    
    // 提取"称呼+关系"模式（如"小雨，我的发小"、"小雨是我的发小"）
    const nameRelationPattern = /([^\s，,。！？]+)[，,]?\s*(?:是|是位|是我的|是我的位)?(?:我的)?(发小|同学|室友|朋友|闺蜜|兄弟|姐妹|网友|游戏好友|社群伙伴|同事|领导|上司|老板|下属|员工|老师|导师|教授|师傅|教练|妈妈|爸爸|爷爷|奶奶|外公|外婆|姥姥|哥哥|姐姐|弟弟|妹妹|自己|现在的自己|理想中的自己)/g;
    
    let match;
    while ((match = nameRelationPattern.exec(content)) !== null) {
      const name = match[1].trim();
      const relation = match[2];
      // 过滤掉太短或太长的名字
      if (name.length >= 2 && name.length <= 10 && !seen.has(name) && !roleKeywords.includes(name)) {
        seen.add(name);
        // 查找角色库中的对应角色
        const mappedRelation = relationMap[relation] || relation;
        const libraryRole = roleLibraryMap.get(mappedRelation) || roleLibraryMap.get(relation);
        roles.push({
          name,
          relation: mappedRelation,
          roleId: libraryRole?.id,
          roleName: libraryRole?.name,
          isConfirmed: !!libraryRole,
        });
      }
    }
    
    // 提取"关系+称呼"模式（如"我的发小小雨"）
    const relationNamePattern = /(?:我的|这位|那个)?(发小|同学|室友|朋友|闺蜜|兄弟|姐妹|网友|游戏好友|社群伙伴|同事|领导|上司|老板|下属|员工|老师|导师|教授|师傅|教练|妈妈|爸爸|爷爷|奶奶|外公|外婆|姥姥|哥哥|姐姐|弟弟|妹妹)[，,\s]*([^\s，,。！？]+)/g;
    
    while ((match = relationNamePattern.exec(content)) !== null) {
      const relation = match[1];
      const name = match[2].trim();
      // 过滤掉太短或太长的名字，以及常见非名字词汇
      if (name.length >= 2 && name.length <= 10 && !seen.has(name) && !['这个', '那个', '一个', '就是', '因为', '所以', '但是', '然后', '然后', '然后'].includes(name)) {
        seen.add(name);
        // 查找角色库中的对应角色
        const mappedRelation = relationMap[relation] || relation;
        const libraryRole = roleLibraryMap.get(mappedRelation) || roleLibraryMap.get(relation);
        roles.push({
          name,
          relation: mappedRelation,
          roleId: libraryRole?.id,
          roleName: libraryRole?.name,
          isConfirmed: !!libraryRole,
        });
      }
    }
  });
  
  return roles;
}

const colors = {
  dark: "#0F1B33",
  primary: "#1B3A5C",
  accent: "#E67E22",
  light: "#FAFBFC",
  muted: "#697A8B",
};

export default function InterviewPage() {
  const { messages, isStreaming, stage, isInitialized, sendMessage, stopStreaming, restoreSession, startNewSession, hasSavedSession, getSavedSessionInfo, scrollRef } =
    useChat();
  const [input, setInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [savedSessionInfo, setSavedSessionInfo] = useState<{ messageCount: number; stage: string; savedAt: string } | null>(null);
  const [showRoles, setShowRoles] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleInfo | null>(null);
  const [deletedRoles, setDeletedRoles] = useState<string[]>([]); // 已删除的角色标识
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentStageIndex = STAGE_ORDER.indexOf(stage);
  
  // 提取已提及的角色（排除已删除的）
  const allMentionedRoles = extractMentionedRoles(messages, stage);
  const mentionedRoles = allMentionedRoles.filter(role => {
    const roleKey = `${role.name}-${role.relation}`;
    return !deletedRoles.includes(roleKey);
  });

  // 页面初始化完成后检查是否有已保存的会话
  useEffect(() => {
    if (isInitialized && hasSavedSession()) {
      const info = getSavedSessionInfo();
      if (info && info.messageCount > 0) {
        setSavedSessionInfo(info);
        setShowResumeDialog(true);
      }
    }
  }, [isInitialized, hasSavedSession, getSavedSessionInfo]);

  // 用户选择继续测验
  const handleResume = () => {
    restoreSession();
    setHasStarted(true);
    setShowResumeDialog(false);
  };

  // 用户选择重新开始
  const handleStartFresh = () => {
    // 清除 localStorage 中的所有会话数据
    localStorage.removeItem("ai-rep-messages");
    localStorage.removeItem("ai-rep-stage");
    localStorage.removeItem("ai-rep-saved-at");
    localStorage.removeItem("ai-rep-session"); // use-chat.ts 使用的键
    
    // 清除所有状态
    setDeletedRoles([]);
    setSelectedRole(null);
    setHasStarted(false);
    setShowResumeDialog(false);
    
    // 重新加载页面，打开新的测验界面
    window.location.reload();
  };

  useEffect(() => {
    if (!isStreaming && inputRef.current && hasStarted && !showResumeDialog) {
      inputRef.current.focus();
    }
  }, [isStreaming, messages, hasStarted, showResumeDialog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStart = () => {
    setHasStarted(true);
    setTimeout(() => {
      sendMessage("你好，我想开始REP测验。请先进行人口学信息采集，了解我的基本背景信息。", true);
    }, 300);
  };

  // 格式化保存时间
  const formatSavedTime = (savedAt: string) => {
    const date = new Date(savedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "刚刚";
    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    return `${diffDays} 天前`;
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.primary} 50%, #234E78 100%)` }}>
      {/* 恢复会话弹窗 */}
      {showResumeDialog && savedSessionInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl" style={{ backgroundColor: colors.primary, border: "1px solid rgba(255,255,255,0.15)" }}>
            {/* 图标 */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.accent}20`, border: `2px solid ${colors.accent}40` }}>
                <svg className="h-8 w-8" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-center text-xl font-bold text-white">
              检测到未完成的测验
            </h3>

            {/* 会话信息 */}
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">当前阶段</span>
                  <span className="font-medium text-white">{STAGE_LABELS[savedSessionInfo.stage] || savedSessionInfo.stage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">对话轮次</span>
                  <span className="font-medium text-white">{Math.floor(savedSessionInfo.messageCount / 2)} 轮</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">上次保存</span>
                  <span className="font-medium text-white">{formatSavedTime(savedSessionInfo.savedAt)}</span>
                </div>
              </div>
            </div>

            {/* 提示文字 */}
            <p className="mt-4 text-center text-sm text-white/60">
              你可以继续上次的测验，或重新开始一个新的测验
            </p>

            {/* 按钮 */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleResume}
                className="w-full rounded-xl py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
                style={{ backgroundColor: colors.accent, boxShadow: `0 8px 20px ${colors.accent}40` }}
              >
                继续测验
              </button>
              <button
                onClick={handleStartFresh}
                className="w-full rounded-xl py-3.5 text-base font-medium text-white/80 transition-all hover:bg-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: "rgba(15, 27, 51, 0.85)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.accent }}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">AI-REP</span>
            </Link>

            {/* Stage Progress - Desktop */}
            {hasStarted && (
              <div className="hidden items-center gap-2 md:flex">
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-1.5">
                  {STAGE_ORDER.map((s, i) => (
                    <div key={s} className="group relative">
                      <div
                        className={`h-2 w-8 rounded-full transition-all duration-500 ${
                          i < currentStageIndex
                            ? ""
                            : i === currentStageIndex
                            ? "shadow-lg"
                            : "bg-white/20"
                        }`}
                        style={{
                          backgroundColor: i <= currentStageIndex ? colors.accent : undefined,
                          boxShadow: i === currentStageIndex ? `0 0 12px ${colors.accent}` : undefined,
                        }}
                      />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="whitespace-nowrap rounded-md bg-white/90 px-2 py-1 text-xs font-medium" style={{ color: colors.dark }}>
                          {STAGE_LABELS[s]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasStarted && (
            <div className="flex items-center gap-3">
              {/* 角色列表按钮 */}
              {mentionedRoles.length > 0 && (
                <button
                  onClick={() => setShowRoles(!showRoles)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-white/10"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="hidden sm:inline">已提及角色</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: colors.accent }}>
                    {mentionedRoles.length}
                  </span>
                </button>
              )}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: `${colors.accent}20`, border: `1px solid ${colors.accent}40` }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.accent }} />
                {STAGE_LABELS[stage] || stage}
              </span>
            </div>
          )}
        </div>
        
        {/* 角色列表展开区域 */}
        {hasStarted && showRoles && mentionedRoles.length > 0 && (
          <div className="border-t border-white/10 px-4 sm:px-6 py-3" style={{ backgroundColor: "rgba(15, 27, 51, 0.95)" }}>
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-white/60">已提及的关系：</span>
                <span className="text-xs text-white/40">({mentionedRoles.filter(r => r.isConfirmed).length}个)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {mentionedRoles.filter(role => role.isConfirmed).map((role, index) => (
                  <span
                    key={index}
                    onClick={() => setSelectedRole(role)}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white transition-all hover:scale-105 cursor-pointer"
                    style={{ 
                      backgroundColor: `${colors.accent}30`, 
                      border: `1px solid ${colors.accent}50`,
                      animationDelay: `${index * 50}ms`
                    }}
                    title={`点击查看 ${role.relation} 的详细信息`}
                  >
                    {role.relation}
                  </span>
                ))}
              </div>
              {/* 未确认的关系提示 */}
              {mentionedRoles.filter(r => !r.isConfirmed).length > 0 && (
                <div className="mt-3 rounded-lg p-3" style={{ backgroundColor: "rgba(255, 193, 7, 0.1)", border: "1px solid rgba(255, 193, 7, 0.3)" }}>
                  <p className="text-xs text-amber-400">
                    以下关系未在角色库中找到，需要确认后才能添加：
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mentionedRoles.filter(r => !r.isConfirmed).map((role, index) => (
                      <span
                        key={index}
                        onClick={() => setSelectedRole(role)}
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-amber-300 transition-all hover:scale-105 cursor-pointer"
                        style={{ 
                          backgroundColor: "rgba(255, 193, 7, 0.15)", 
                          border: "1px solid rgba(255, 193, 7, 0.4)"
                        }}
                        title="点击确认添加该关系"
                      >
                        {role.relation} ({role.name})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
          {!hasStarted ? (
            <WelcomeScreen 
              onStart={handleStart} 
              hasSavedSession={isInitialized && hasSavedSession()} 
              onResume={handleResume}
            />
          ) : (
            <div className="space-y-6">
              {messages
                .filter((m) => m.content)
                .map((msg, i) => (
                  <MessageBubble
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    isLast={i === messages.filter((m) => m.content).length - 1}
                    isStreaming={isStreaming && msg.role === "assistant" && i === messages.filter((m) => m.content).length - 1}
                  />
                ))}
              {isStreaming && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${colors.primary}40`, border: "1px solid rgba(255,255,255,0.2)" }}>
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-5 py-4" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {hasStarted && (
        <div className="flex-shrink-0 border-t border-white/10" style={{ backgroundColor: "rgba(15, 27, 51, 0.9)", backdropFilter: "blur(12px)" }}>
          <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-5">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的回答..."
                  rows={1}
                  className="w-full resize-none rounded-xl px-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  disabled={isStreaming}
                />
              </div>
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-105"
                  style={{ backgroundColor: "#DC3545" }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: colors.accent }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              )}
            </form>
            <p className="mt-2 text-center text-xs text-white/40">
              按 Enter 发送，Shift + Enter 换行
            </p>
          </div>
        </div>
      )}

      {/* 角色详情弹窗 */}
      {selectedRole && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedRole(null)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: colors.primary, border: "1px solid rgba(255,255,255,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setSelectedRole(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition-all hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* 角色头像 */}
            <div className="mb-4 flex justify-center">
              <div 
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${colors.accent}20`, border: `2px solid ${colors.accent}40` }}
              >
                <svg className="h-8 w-8" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            {/* 角色信息 */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">
                {selectedRole.relation}
              </h3>
              <div 
                className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: `${colors.accent}20`, border: `1px solid ${colors.accent}40`, color: colors.accent }}
              >
                称呼：{selectedRole.name}
              </div>
              {/* 显示角色库中的角色名称 */}
              {selectedRole.roleName && selectedRole.roleName !== selectedRole.relation && (
                <p className="mt-2 text-xs text-white/50">
                  对应角色库：{selectedRole.roleName}
                </p>
              )}
              {/* 未确认提示 */}
              {!selectedRole.isConfirmed && (
                <p className="mt-2 text-xs text-amber-400">
                  该关系未在角色库中找到
                </p>
              )}
            </div>

            {/* 说明文字 */}
            <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-sm text-white/60 text-center">
                这是在测验中提及的关系。你可以在对话中继续探索与这个角色相关的构念和评分。
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => {
                  const name = selectedRole.name;
                  setSelectedRole(null);
                  // 在输入框中插入补充信息的提示
                  setInput(`我想补充一下关于${name}的信息：`);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: colors.accent }}
              >
                补充信息
              </button>
              <button
                onClick={() => {
                  const name = selectedRole.name;
                  const relation = selectedRole.relation;
                  setSelectedRole(null);
                  // 在输入框中插入更改信息的提示
                  setInput(`我想更改${relation}（${name}）的信息：`);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                更改信息
              </button>
              <button
                onClick={() => {
                  if (selectedRole) {
                    // 删除该角色
                    const roleKey = `${selectedRole.name}-${selectedRole.relation}`;
                    setDeletedRoles(prev => [...prev, roleKey]);
                    setSelectedRole(null);
                  }
                }}
                className="w-full rounded-xl py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,100,100,0.2)" }}
              >
                删除该关系
              </button>
              {!selectedRole.isConfirmed && (
                <button
                  onClick={() => {
                    if (selectedRole) {
                      setSelectedRole({ ...selectedRole, isConfirmed: true });
                    }
                  }}
                  className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: colors.accent }}
                >
                  确认添加到角色库
                </button>
              )}
              <button
                onClick={() => setSelectedRole(null)}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeScreen({ onStart, hasSavedSession, onResume }: { onStart: () => void; hasSavedSession?: boolean; onResume?: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      {/* Decorative element */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulse rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent}30` }} />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`, border: "2px solid rgba(255,255,255,0.2)" }}>
          <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091c0 .719-.576 1.313-1.294 1.313H6.5a1.313 1.313 0 01-1.294-1.313v-3.091c-.34-.02-.68-.045-1.02-.072C3.047 16.89 2.2 15.927 2.2 14.79v-4.286c0-.97.616-1.812 1.5-2.097M12 2.25c2.358 0 4.272 1.913 4.272 4.272S14.358 10.794 12 10.794 7.728 8.88 7.728 6.522 9.642 2.25 12 2.25z" />
          </svg>
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-white">
        欢迎参加角色建构库测验
      </h2>
      <p className="mt-5 max-w-lg text-lg text-white/70 leading-relaxed">
        接下来的对话中，我会引导你完成一个关于人际认知的探索。没有对错之分，也没有标准答案。你想到什么都可以说，不用担心说错。
      </p>
      <p className="mt-4 max-w-md text-sm text-white/50">
        整个过程大约需要 30-45 分钟。如果你想跳过某个问题，随时告诉我。
      </p>

      {/* 按钮区域 */}
      <div className="mt-10 flex flex-col items-center gap-4">
        {/* 继续测验按钮（如果有已保存的会话） */}
        {hasSavedSession && onResume && (
          <button
            onClick={onResume}
            className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-xl px-10 text-lg font-semibold text-white shadow-2xl transition-all hover:scale-105"
            style={{ backgroundColor: colors.accent, boxShadow: `0 20px 40px ${colors.accent}40` }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            继续上次的测验
          </button>
        )}

        {/* 开始新测验按钮 */}
        <button
          onClick={onStart}
          className={`group inline-flex h-14 items-center justify-center gap-2.5 rounded-xl px-10 text-lg font-semibold text-white shadow-2xl transition-all hover:scale-105 ${hasSavedSession ? "" : ""}`}
          style={hasSavedSession 
            ? { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", boxShadow: "none" }
            : { backgroundColor: colors.accent, boxShadow: `0 20px 40px ${colors.accent}40` }
          }
        >
          {hasSavedSession ? "重新开始测验" : "开始对话"}
          <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-white/50">
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          安全私密
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          30-45 分钟
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          AI 引导
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = role === "user";

  // 转换 markdown 格式为 HTML 格式
  const formatContent = (text: string) => {
    // 转换 **text** 为 <strong>text</strong>
    let formatted = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // 转换 *text* 为 <em>text</em>
    formatted = formatted.replace(/\*(.+?)\*/g, "<em>$1</em>");
    // 转换 # text 为 <strong>text</strong>
    formatted = formatted.replace(/^# (.+)$/gm, "<strong>$1</strong>");
    // 转换 ## text 为 <strong>text</strong>
    formatted = formatted.replace(/^## (.+)$/gm, "<strong>$1</strong>");
    // 转换 ### text 为 <strong>text</strong>
    formatted = formatted.replace(/^### (.+)$/gm, "<strong>$1</strong>");
    // 转换换行为 <br>
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: isUser ? colors.accent : `${colors.primary}60`,
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        {isUser ? (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
      </div>

      {/* Message */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-4 ${isUser ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{
          backgroundColor: isUser ? `${colors.accent}20` : "rgba(255,255,255,0.06)",
          border: `1px solid ${isUser ? `${colors.accent}40` : "rgba(255,255,255,0.08)"}`,
          boxShadow: isUser ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {isUser ? (
          <p className="text-white whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div
            className="prose prose-invert max-w-none text-white/90 [&_strong]:text-white [&_strong]:font-semibold [&_em]:text-white/80 [&_em]:not-italic [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2.5 [&_p]:leading-relaxed [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_li]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:my-3 [&_blockquote]:text-white/70 [&_blockquote]:italic [&_hr]:border-white/20 [&_hr]:my-4 [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm"
            dangerouslySetInnerHTML={{ __html: formatContent(content) }}
          />
        )}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-white/70" />
        )}
      </div>
    </div>
  );
}
