"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ReportData {
  demographics: Record<string, string | number | boolean>;
  constructs: Array<{ leftPole: string; rightPole: string }>;
  summary: string;
}

const colors = {
  dark: "#0F1B33",
  primary: "#1B3A5C",
  accent: "#E67E22",
  light: "#FAFBFC",
  muted: "#697A8B",
};

export default function ReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("rep-report");
      if (stored) {
        setReport(JSON.parse(stored));
      }
    } catch {
      // No stored report
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.primary} 100%)` }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-3 border-white/20 border-t-white" />
          <p className="text-white/60">加载中...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.primary} 100%)` }}>
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent}30` }} />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`, border: "2px solid rgba(255,255,255,0.2)" }}>
            <svg className="h-12 w-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            暂无报告数据
          </h1>
          <p className="mt-3 text-white/60">
            请先完成 REP 测验以生成报告
          </p>
        </div>
        <Link
          href="/interview"
          className="group inline-flex h-14 items-center justify-center gap-2 rounded-xl px-8 text-lg font-semibold text-white shadow-2xl transition-all hover:scale-105"
          style={{ backgroundColor: colors.accent, boxShadow: `0 20px 40px ${colors.accent}40` }}
        >
          开始测验
          <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.primary} 50%, #234E78 100%)` }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: "rgba(15, 27, 51, 0.85)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: colors.accent }}>
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">AI-REP</span>
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:text-white hover:bg-white/10"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            返回测验
          </Link>
        </div>
      </header>

      {/* Report Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Title */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: `${colors.accent}20`, border: `1px solid ${colors.accent}40` }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            个人报告
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            个人建构可视化报告
          </h1>
          <p className="mt-4 text-lg text-white/60">
            基于角色建构库测验的分析结果
          </p>
        </div>

        {/* Demographics */}
        <section className="mb-10 sm:mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
              <svg className="h-5 w-5" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">基本信息</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 rounded-2xl p-5 sm:p-6 shadow-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            {Object.entries(report.demographics).map(([key, value]) => (
              <div key={key} className="group">
                <div className="text-xs font-medium text-white/50">
                  {formatLabel(key)}
                </div>
                <div className="mt-1.5 text-base font-semibold text-white">
                  {String(value) || "-"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Constructs */}
        <section className="mb-10 sm:mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
              <svg className="h-5 w-5" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">提取的构念</h2>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: `${colors.accent}20` }}>
              {report.constructs.length} 个
            </span>
          </div>
          <div className="space-y-3">
            {report.constructs.map((c, i) => (
              <div
                key={i}
                className="group flex items-center gap-3 sm:gap-4 rounded-xl p-4 sm:p-5 transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})` }}>
                  {i + 1}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-medium text-white">{c.leftPole}</span>
                  <div className="flex items-center gap-1">
                    <div className="h-px w-4 sm:w-6 bg-white/20" />
                    <svg className="h-3 w-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                    <div className="h-px w-4 sm:w-6 bg-white/20" />
                  </div>
                  <span className="text-white/60">{c.rightPole}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-10 sm:mb-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${colors.accent}20` }}>
              <svg className="h-5 w-5" style={{ color: colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">分析总结</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-xl" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ backgroundColor: `${colors.accent}10` }} />
            <div 
              className="relative prose prose-invert max-w-none text-white/85 [&_strong]:text-white [&_strong]:font-semibold [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-3 [&_p]:leading-relaxed [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1.5 [&_li]:leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:border-white/30 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-white/70 [&_blockquote]:italic [&_hr]:border-white/20 [&_hr]:my-5"
              dangerouslySetInnerHTML={{ __html: (report.summary || "报告总结将在完成全部测验后生成。").replace(/\n/g, "<br>") }}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            href="/interview"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-medium text-white transition-all hover:scale-105"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            重新测验
          </Link>
          <Link
            href="/"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl px-8 font-semibold text-white shadow-2xl transition-all hover:scale-105"
            style={{ backgroundColor: colors.accent, boxShadow: `0 20px 40px ${colors.accent}40` }}
          >
            返回首页
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    age: "年龄",
    gender: "性别",
    occupation: "职业",
    city: "居住城市",
    hometown: "籍贯",
    marital_status: "婚恋状态",
    has_children: "有无子女",
    is_student: "是否学生",
    education_level: "学历",
  };
  return labels[key] || key;
}
