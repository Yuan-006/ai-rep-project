"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Brain,
  Cpu,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  User,
  GitCompare,
  Sparkles,
  FileText,
  MessageSquare,
} from "lucide-react";

// 颜色规范
const colors = {
  primary: "#1B3A5C",
  dark: "#0F1B33",
  accent: "#E67E22",
  bg: "#FAFBFC",
  textSecondary: "#697A8B",
};

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  // 步骤动画
  const startStepAnimation = () => {
    const steps = document.querySelectorAll(".step-node");
    steps.forEach((step, index) => {
      setTimeout(() => {
        step.classList.add("active");
      }, index * 300);
    });
  };

  // 滚动检测
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer 动画
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            // 流程区步骤动画
            if (entry.target.id === "process-section") {
              startStepAnimation();
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* 固定顶栏导航 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "shadow-lg" : ""
        }`}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl" style={{ color: colors.primary }}>
                AI-REP
              </span>
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium" style={{ color: colors.primary }}>
                首页
              </a>
              <Link
                href="/interview"
                className="px-5 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                开始测评
              </Link>
              <a
                href="#about"
                className="text-sm font-medium"
                style={{ color: colors.textSecondary }}
              >
                关于项目
              </a>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: colors.primary }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: colors.primary }} />
              )}
            </button>
          </div>
        </div>

        {/* 移动端抽屉菜单 */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 top-16 z-40"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.98)" }}
          >
            <div className="flex flex-col items-center gap-6 pt-12">
              <a
                href="#"
                className="text-lg font-medium"
                style={{ color: colors.primary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </a>
              <Link
                href="/interview"
                className="px-8 py-3 rounded-full text-lg font-medium text-white"
                style={{ backgroundColor: colors.primary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                开始测评
              </Link>
              <a
                href="#about"
                className="text-lg font-medium"
                style={{ color: colors.textSecondary }}
                onClick={() => setMobileMenuOpen(false)}
              >
                关于项目
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero 首屏区 */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 50%, #234E78 100%)`,
        }}
      >
        {/* 背景装饰 - 径向渐变光斑 */}
        <div
          className="absolute top-20 left-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${colors.accent}, transparent)` }}
        />
        <div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: `radial-gradient(circle, #4A90D9, transparent)` }}
        />

        {/* 背景装饰 - 点阵网格 */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-1/4 right-1/4 grid grid-cols-3 gap-8"
            style={{ opacity: 0.3 }}
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white" />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文字 */}
            <div className="hero-text-animate">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                基于大语言模型的
                <br />
                人格构念智能化测评系统
              </h1>
              <p className="text-lg text-white/75 mb-8 leading-relaxed">
                以凯利个人建构理论为根基，融合LLM语义理解能力，实现REP测验自动化施测、编码与报告生成
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/interview"
                  className="px-8 py-4 rounded-full font-medium text-white transition-transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: colors.accent }}
                >
                  免费体验测评
                </Link>
                <a
                  href="#about"
                  className="px-8 py-4 rounded-full font-medium text-white border-2 border-white/50 transition-all hover:bg-white/10"
                >
                  了解理论背景
                </a>
              </div>
            </div>

            {/* 右侧 SVG 节点图 */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-96 h-96">
                {/* SVG 弧线和装饰 */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 384 384"
                >
                  <defs>
                    {/* 渐变定义 */}
                    <linearGradient id="arcGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E67E22" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#4A90D9" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="arcGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E67E22" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#4A90D9" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2ECC71" stopOpacity="0.4" />
                    </linearGradient>
                    {/* 光晕滤镜 */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* 外圈装饰环 */}
                  <circle
                    cx="192"
                    cy="192"
                    r="140"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  <circle
                    cx="192"
                    cy="192"
                    r="100"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />

                  {/* 主弧线 - 上方 */}
                  <path
                    d="M 96 192 Q 192 96 288 192"
                    fill="none"
                    stroke="url(#arcGradient1)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  {/* 主弧线 - 下方 */}
                  <path
                    d="M 96 192 Q 192 288 288 192"
                    fill="none"
                    stroke="url(#arcGradient2)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* 流动虚线 - 上方 */}
                  <path
                    d="M 96 192 Q 192 96 288 192"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                    strokeDasharray="8,12"
                    strokeLinecap="round"
                    className="animate-flow"
                  />

                  {/* 装饰小点 */}
                  <circle cx="144" cy="144" r="3" fill="rgba(255,255,255,0.4)" />
                  <circle cx="240" cy="144" r="3" fill="rgba(255,255,255,0.4)" />
                  <circle cx="192" cy="120" r="2" fill="rgba(255,255,255,0.3)" />
                </svg>

                {/* 左侧节点 - 自然语言输入 */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-2 float-node-1">
                  <div className="relative">
                    {/* 光晕背景 */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{ backgroundColor: colors.accent }}
                    />
                    {/* 主圆形 */}
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <User className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  {/* 标签 */}
                  <div className="mt-3 text-center">
                    <span className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      自然语言输入
                    </span>
                  </div>
                </div>

                {/* 顶部节点 - AI语义分析 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 float-node-2">
                  <div className="relative">
                    {/* 光晕背景 */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{ backgroundColor: "#4A90D9" }}
                    />
                    {/* 主圆形 */}
                    <div
                      className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30"
                      style={{ backgroundColor: "#4A90D9" }}
                    >
                      <Sparkles className="w-14 h-14 text-white" strokeWidth={1.5} />
                    </div>
                    {/* 脉冲环 */}
                    <div className="absolute inset-0 rounded-full animate-ping-slow border-2 border-white/20" />
                  </div>
                  {/* 标签 */}
                  <div className="mt-3 text-center">
                    <span className="text-white text-sm font-bold bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      AI语义分析
                    </span>
                  </div>
                </div>

                {/* 右侧节点 - 构念图谱 */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-2 float-node-3">
                  <div className="relative">
                    {/* 光晕背景 */}
                    <div
                      className="absolute inset-0 rounded-full blur-xl opacity-50"
                      style={{ backgroundColor: "#2ECC71" }}
                    />
                    {/* 主圆形 */}
                    <div
                      className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20"
                      style={{ backgroundColor: "#2ECC71" }}
                    >
                      <FileText className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  {/* 标签 */}
                  <div className="mt-3 text-center">
                    <span className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                      构念图谱
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部向下箭头 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/60" />
        </div>
      </section>

      {/* 核心亮点区 */}
      <section className="py-20" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-center mb-12 animate-on-scroll"
            style={{ color: colors.primary }}
          >
            核心优势
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* 卡片 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-on-scroll">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center mb-6"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Brain className="w-7 h-7" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>
                理论驱动
              </h3>
              <p style={{ color: colors.textSecondary }}>
                基于凯利REP测验与个人建构理论，50余年经典范式的数字化重生
              </p>
            </div>

            {/* 卡片 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-on-scroll">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center mb-6"
                style={{ backgroundColor: `${colors.accent}15` }}
              >
                <Cpu className="w-7 h-7" style={{ color: colors.accent }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>
                LLM 智能化
              </h3>
              <p style={{ color: colors.textSecondary }}>
                大模型完成三元比较分析、构念提取、语义编码全流程自动化
              </p>
            </div>

            {/* 卡片 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-on-scroll">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center mb-6"
                style={{ backgroundColor: "#2ECC7115" }}
              >
                <ShieldCheck className="w-7 h-7" style={{ color: "#2ECC71" }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.primary }}>
                本土化验证
              </h3>
              <p style={{ color: colors.textSecondary }}>
                中国人群常模数据支撑，文化适配与信效度实证检验
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 测评流程区 */}
      <section id="process-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl font-bold text-center mb-16 animate-on-scroll"
            style={{ color: colors.primary }}
          >
            测评流程
          </h2>

          {/* 桌面端 - 横向步骤条 */}
          <div className="hidden md:flex items-center justify-between relative">
            {/* 连接线 */}
            <div className="absolute top-8 left-16 right-16 h-0.5 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-[#1B3A5C] to-[#E67E22] transition-all duration-1000 step-line" />
            </div>

            {/* 步骤节点 */}
            {[
              { icon: User, label: "填写信息" },
              { icon: GitCompare, label: "三元比较" },
              { icon: Sparkles, label: "AI分析" },
              { icon: FileText, label: "构念报告" },
              { icon: MessageSquare, label: "交互反馈" },
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center relative z-10">
                <div
                  className={`step-node w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index === 0 ? "active" : ""
                  }`}
                  style={{
                    backgroundColor: "white",
                    border: `3px solid ${colors.primary}`,
                  }}
                >
                  <step.icon className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <span className="mt-4 text-sm font-medium" style={{ color: colors.primary }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* 移动端 - 竖向时间轴 */}
          <div className="md:hidden relative pl-8">
            {/* 竖线 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
              <div className="h-full bg-gradient-to-b from-[#1B3A5C] to-[#E67E22] transition-all duration-1000 step-line-mobile" />
            </div>

            {[
              { icon: User, label: "填写信息" },
              { icon: GitCompare, label: "三元比较" },
              { icon: Sparkles, label: "AI分析" },
              { icon: FileText, label: "构念报告" },
              { icon: MessageSquare, label: "交互反馈" },
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-4 mb-8 relative">
                <div
                  className={`step-node-mobile w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    index === 0 ? "active" : ""
                  }`}
                  style={{
                    backgroundColor: "white",
                    border: `2px solid ${colors.primary}`,
                  }}
                >
                  <step.icon className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <span className="text-base font-medium" style={{ color: colors.primary }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA 行动号召区 */}
      <section
        className="py-20"
        style={{
          background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 100%)`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 animate-on-scroll">
            准备好探索你的人格构念了吗？
          </h2>
          <Link
            href="/interview"
            className="inline-block px-10 py-4 rounded-full text-lg font-medium text-white transition-transform hover:scale-105 shadow-xl animate-on-scroll"
            style={{ backgroundColor: colors.accent }}
          >
            立即开始测评
          </Link>
          <p className="mt-6 text-white/60 text-sm animate-on-scroll">
            基于凯利个人建构理论 | 无需注册 | 数据仅本地处理
          </p>
        </div>
      </section>

      {/* 全局样式 */}
      <style jsx>{`
        /* 浮动节点动画 */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .float-node-1 { animation: float 3s ease-in-out infinite; }
        .float-node-2 { animation: float 3s ease-in-out infinite 0.5s; }
        .float-node-3 { animation: float 3s ease-in-out infinite 1s; }

        /* 流动虚线动画 */
        @keyframes flowDash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -40; }
        }
        .animate-flow {
          animation: flowDash 2s linear infinite;
        }

        /* 脉冲环动画 */
        @keyframes pingSlow {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.3);
            opacity: 0;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        .animate-ping-slow {
          animation: pingSlow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Hero 文字动画 */
        .hero-text-animate {
          animation: heroFadeIn 1s ease-out forwards;
        }
        @keyframes heroFadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 滚动渐入动画 */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* 步骤节点激活状态 */
        .step-node.active {
          background-color: ${colors.primary} !important;
        }
        .step-node.active svg {
          color: white !important;
        }
        .step-node-mobile.active {
          background-color: ${colors.primary} !important;
        }
        .step-node-mobile.active svg {
          color: white !important;
        }

        /* 步骤线动画 */
        .step-line {
          width: 0%;
          transition: width 1.5s ease-out;
        }
        .step-line-mobile {
          height: 0%;
          transition: height 1.5s ease-out;
        }
        #process-section.animate-in .step-line {
          width: 100%;
        }
        #process-section.animate-in .step-line-mobile {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
