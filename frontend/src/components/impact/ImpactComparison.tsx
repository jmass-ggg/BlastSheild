'use client';

import React from 'react';
import { AnalysisView } from '../../types';
import { ProposedActionCard } from './ProposedActionCard';
import { SaferActionCard } from './SaferActionCard';

interface ImpactComparisonProps {
  view: AnalysisView;
  onExecute: () => void;
  onReject: () => void;
  isRejecting: boolean;
}

export const ImpactComparison: React.FC<ImpactComparisonProps> = ({
  view,
  onExecute,
  onReject,
  isRejecting,
}) => (
  <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
    <ProposedActionCard
      view={view}
      onExecute={onExecute}
      onReject={onReject}
      isRejecting={isRejecting}
    />
    <SaferActionCard view={view} />
  </section>
);
