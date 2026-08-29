'use client';

import React from 'react';
import { AnalysisView } from '../../types';
import { ProposedActionCard } from './ProposedActionCard';
import { SaferActionCard } from './SaferActionCard';
import { RiskGauge } from './RiskGauge';

interface ImpactComparisonProps {
  view: AnalysisView;
  onExecute: () => void;
  onReject: () => void;
  isRejecting: boolean;
  isSaferPreview: boolean;
  onToggleSaferPreview: () => void;
}

export const ImpactComparison: React.FC<ImpactComparisonProps> = ({
  view,
  onExecute,
  onReject,
  isRejecting,
  isSaferPreview,
  onToggleSaferPreview,
}) => {
  const currentScore = isSaferPreview && view.safer.riskScore !== null
    ? view.safer.riskScore
    : view.riskScore;

  const currentLevel = isSaferPreview && view.safer.riskLevel !== null
    ? view.safer.riskLevel
    : view.riskLevel;

  return (
    <section className="space-y-6">
      {/* 2. Central Blast Radius Risk Gauge */}
      <RiskGauge
        score={currentScore}
        level={currentLevel}
        breakdown={view.riskBreakdown}
        isSaferMode={isSaferPreview}
        originalScore={view.riskScore}
        originalLevel={view.riskLevel}
      />

      {/* Side-by-Side Original vs Recommended Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <ProposedActionCard
          view={view}
          onExecute={onExecute}
          onReject={onReject}
          isRejecting={isRejecting}
        />
        <SaferActionCard
          view={view}
          isPreviewing={isSaferPreview}
          onTogglePreview={view.safer.available ? onToggleSaferPreview : undefined}
        />
      </div>
    </section>
  );
};
