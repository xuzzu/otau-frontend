"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  useStoreDashboard, useStoreActivity, useStoreMagicHints,
  useStoreScenes, useStoreItems,
} from "@/lib/store-api/hooks";
import { useShopContext } from "@/lib/shop-context";
import { useT } from "@/lib/i18n";

import { SectionHeader } from "@/components/store/shared/SectionHeader";
import { DashboardGreeting } from "@/components/store/dashboard/DashboardGreeting";
import { PulseStrip } from "@/components/store/dashboard/PulseStrip";
import { TodayQueue } from "@/components/store/dashboard/TodayQueue";
import { DashboardCatalog } from "@/components/store/dashboard/DashboardCatalog";
import { SceneShowcase } from "@/components/store/dashboard/SceneShowcase";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  const { t } = useT();
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
      .map((i) => `${i.name} — ${t("store.dashboard.attention.left", { n: i.in_stock_current_shop })}`);
  }, [lowItems.data, t]);

  if (dashboard.isLoading) return <DashboardSkeleton />;
  if (dashboard.error || !dashboard.data) {
    return <p className="mono" style={{ padding: 32, color: "var(--color-clay)" }}>
      {t("store.dashboard.page.error")}
    </p>;
  }

  const data = dashboard.data;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
        <DashboardGreeting
          firstName={extractFirstName(t("store.greeting.fallback_name"))}
          shopName={currentShop?.name ?? ""}
          city={(currentShop as { city?: string } | undefined)?.city ?? ""}
        />
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} style={{ marginBottom: 56 }}>
        <SectionHeader
          kicker={t("store.dashboard.section.pulse.kicker")}
          title={t("store.dashboard.pulse.title")}
          rightMeta={t("store.dashboard.section.pulse.meta")}
        />
        <PulseStrip data={data} />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 }} style={{ marginBottom: 56 }}>
        <SectionHeader
          kicker={t("store.dashboard.section.queue.kicker")}
          title={t("store.dashboard.queue.title")}
          rightMeta={t("store.dashboard.section.queue.meta")}
        />
        <TodayQueue
          dashboard={data}
          activity={activity.data ?? []}
          magicHints={hints.data ?? []}
          lowStockItems={lowStockLines}
        />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.3 }} style={{ marginBottom: 56 }}>
        <SectionHeader
          kicker={t("store.dashboard.section.catalog.kicker")}
          title={t("store.dashboard.catalog.title")}
          rightMeta=""
        />
        <DashboardCatalog />
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}>
        <SectionHeader
          kicker={t("store.dashboard.section.scenes.kicker")}
          title={<>
            {t("store.dashboard.imagined.title").split("—")[0]}
            <em style={{ color: "var(--color-taupe-2)" }}>{t("store.dashboard.section.scenes.title_em")}</em>
          </>}
          rightMeta={
            data.imagined
              ? t("store.dashboard.section.scenes.meta", {
                  scenes: data.imagined.scenes_count,
                  items: data.imagined.items_in_scenes_count,
                })
              : ""
          }
        />
        <SceneShowcase scenes={scenes.data ?? []} />
      </motion.section>
    </div>
  );
}

function extractFirstName(fallback: string): string {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)firstName=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return fallback;
}

function DashboardSkeleton() {
  const { t } = useT();
  return (
    <div style={{ padding: 40 }}>
      <div className="mono" style={{ color: "var(--color-taupe)" }}>{t("store.dashboard.page.loading")}</div>
    </div>
  );
}
