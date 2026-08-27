"use client";

import React from "react";
import { useParams } from "next/navigation";
import BlastShieldDashboard from "@/app/page";

export default function AnalysisDetailPage() {
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  return <BlastShieldDashboard initialScenarioId={id} />;
}
