"use client";

import { Suspense, use, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  Step1Scope,
  Step2Space,
  Step3Style,
  Step4Budget,
} from "@/components/design/WizardSteps";
import { useDesign } from "@/lib/store";

function DesignInner() {
  const sp = useSearchParams();
  const step = Math.min(4, Math.max(1, Number(sp.get("step") ?? 1)));
  const zhk = sp.get("zhk");
  const { spaceId, scope, setSpace, setScope } = useDesign();

  // Deep link from landing's ЖК quick start
  useEffect(() => {
    if (zhk && spaceId !== zhk) {
      setSpace(zhk);
      if (!scope) setScope("apartment");
    }
  }, [zhk, spaceId, scope, setSpace, setScope]);

  return (
    <AnimatePresence mode="wait">
      {step === 1 && <Step1Scope key="s1" />}
      {step === 2 && <Step2Space key="s2" />}
      {step === 3 && <Step3Style key="s3" />}
      {step === 4 && <Step4Budget key="s4" />}
    </AnimatePresence>
  );
}

export default function DesignPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; zhk?: string }>;
}) {
  // Touch searchParams once to keep the server-router happy on direct loads
  // (we read the actual values via useSearchParams in the client component).
  use(searchParams);
  return (
    <Suspense fallback={null}>
      <DesignInner />
    </Suspense>
  );
}
