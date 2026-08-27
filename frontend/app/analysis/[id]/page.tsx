"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import BlastShieldDashboard from "@/app/page";

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  return <BlastShieldDashboard />;
}
