'use client';

import React from 'react';
import { ImpactResult, ExecutionMode } from '../../types';
import { ProposedActionCard } from './ProposedActionCard';
import { SaferActionCard } from './SaferActionCard';

interface ImpactComparisonProps {
  impact: ImpactResult;
  onExecute: (mode: ExecutionMode) => void;
}

export const ImpactComparison: React.FC<ImpactComparisonProps> = ({ impact, onExecute }) => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProposedActionCard impact={impact} onExecute={() => onExecute('ORIGINAL')} />
      <SaferActionCard impact={impact} onExecute={() => onExecute('SAFER')} />
    </section>
  );
};
