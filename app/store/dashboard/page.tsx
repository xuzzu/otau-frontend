"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  useStoreDashboard, useStoreActivity, useStoreMagicHints,
  useStoreScenes, useStoreItems,
} from "@/lib/store-api/hooks";
import { useShopContext } from "@/lib/shop-context";

import { SectionHeader } from "@/components/store/shared/SectionHeader";
import { DashboardGreeting } from "@/components/store/dashboard/DashboardGreeting";
import { PulseStrip } from "@/components/store/dashboard/PulseStrip";
import { TodayQueue } from "@/components/store/dashboard/TodayQueue";
import { DashboardCatalog } from "@/components/store/dashboard/DashboardCatalog";
import { SceneShowcase } from "@/components/store/dashboard/SceneShowcase";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  const dashboard = useStoreDashboard();
  const activity = useStoreActivity(20);
  const hints = useStoreMagicHints(10);
  const scenes = useStoreScenes(20);
  const lowItems = useStoreItems({ bucket: "attention", all: 1 });

  const { shops, selectedShopId } = useShopContext();
  const currentShop = shops.find((s) => s.id === selectedShopId);

  const lowStockLines = useMemo(() => {
    const items = lowItems.data ?? [];
    return items
      .filter((i) => i.in_stock_current_shop <= 3 && i.status === "active")
      .slice(0, 3)
      .map((i) => `${i.name} — ${i.in_stock_current_shop} left`);
  }, [lowItems.data]);

  if (dashboard.isLoading) return <DashboardSkeleton />;
  if (dashboard.error || !dashboard.data) {
    return <p className="mono" style={{ padding: 32, color: "var(--color-clay)" }}>
      Dashboard · couldn&apos;t load. Refresh →
    </p>;
  }

  const data = dashboard.data;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
        <DashboardGreeting
          firstName={extractFirstName()}
          shopName={currentShop?.name ?? ""}
          city={(currentShop as { city?: string } | undefined)?.city ?? ""}
        />
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} style={{ marginBottom: 56 }}>
        <SectionHeader kicker="№ 01 · Pulse · last 7 days" title="How the shop is breathing" rightMeta="vs prior week" />
        <PulseStrip data={data} />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 }} style={{ marginBottom: 56 }}>
        <SectionHeader kicker="№ 02 · Today's queue" title="Needs your eye" rightMeta="live" />
        <TodayQueue
          dashboard={data}
          activity={activity.data ?? []}
          magicHints={hints.data ?? []}
          lowStockItems={lowStockLines}
        />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.3 }} style={{ marginBottom: 56 }}>
        <SectionHeader kicker="№ 03 · Your shop" title="Catalog" rightMeta="" />
        <DashboardCatalog />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}>
        <SectionHeader
          kicker="№ 04 · Scenes · this week"
          title={<>Your items, <em style={{ color: "var(--color-taupe-2)" }}>imagined at home</em></>}
          rightMeta={
            data.imagined
              ? `${data.imagined.scenes_count} scenes · ${data.imagined.items_in_scenes_count} items`
              : ""
          }
        />
        <SceneShowcase scenes={scenes.data ?? []} />
      </motion.section>
    </div>
  );
}

function extractFirstName(): string {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)firstName=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return "there";
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: 40 }}>
      <div className="mono" style={{ color: "var(--color-taupe)" }}>loading dashboard…</div>
    </div>
  );
}
