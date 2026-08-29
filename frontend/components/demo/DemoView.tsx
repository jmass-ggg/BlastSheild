"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { DemoSidebar } from "@/components/demo/DemoSidebar";
import { PromptCard } from "@/components/demo/PromptCard";
import { SimulationCard } from "@/components/demo/SimulationCard";
import { AnalysisCompleteCard } from "@/components/demo/AnalysisCompleteCard";

interface DemoViewProps {
  onBackToHome?: () => void;
}

export function DemoView({ onBackToHome }: DemoViewProps) {
  const [prompt, setPrompt] = useState("Delete inactive customers older than 2 years.");
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("new-analysis");

  const handleRunAnalysis = () => {
    setIsRunningSimulation(true);
    setTimeout(() => {
      setIsRunningSimulation(false);
      // scroll to Card 3 smoothly
      document.getElementById("analysis-complete-section")?.scrollIntoView({ behavior: "smooth" });
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex flex-col select-none text-slate-900 font-sans">
      {/* Top Navbar */}
      <Navbar currentView="demo" onNavigate={(target) => target === "home" && onBackToHome?.()} />

      {/* Main Layout Container: Left Sidebar + Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1500px] mx-auto">
        {/* Left Sidebar */}
        <DemoSidebar
          activeTab={sidebarTab}
          onSelectTab={setSidebarTab}
          onNewAnalysis={() => {
            setSidebarTab("new-analysis");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-[1240px]">
          {/* Card 1: Add Your Prompt */}
          <section id="prompt-section">
            <PromptCard
              prompt={prompt}
              onChangePrompt={setPrompt}
              onRunAnalysis={handleRunAnalysis}
              isRunning={isRunningSimulation}
            />
          </section>

          {/* Card 2: BlastShield Analysis in Progress */}
          <section id="simulation-section">
            <SimulationCard isRunning={isRunningSimulation} />
          </section>

          {/* Card 3: Analysis Complete */}
          <section id="analysis-complete-section">
            <AnalysisCompleteCard />
          </section>
        </main>
      </div>
    </div>
  );
}
