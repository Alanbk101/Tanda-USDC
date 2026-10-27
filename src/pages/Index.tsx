import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PoolStats } from "@/components/PoolStats";
import { PayoutSchedule } from "@/components/PayoutSchedule";
import { PaperEaglesBackground } from "@/components/PaperEaglesBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, Shield, Zap, Users, FlaskConical } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { PROTOCOL_CONSTANTS } from "@/config/contracts";

const Index = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<"base">("base");
  const { t } = useSettings();
  const navigate = useNavigate();

  const features = [
    { icon: Coins, titleKey: "stablecoinOnly", descKey: "stablecoinDesc" },
    { icon: Shield, titleKey: "onChainSecurity", descKey: "onChainDesc" },
    { icon: Zap, titleKey: "baseNetwork", descKey: "baseNetworkDesc" },
  ];

  // Calendario ilustrativo: un turno por mes, sin nombres, wallets ni estados de pago.
  const exampleSchedule = Array.from({ length: PROTOCOL_CONSTANTS.TOTAL_MONTHS }, (_, i) => ({
    month: i + 1,
    memberName: `${t("turn")} ${i + 1}`,
    amount: Number(PROTOCOL_CONSTANTS.GROUP_MONTHLY_PAYOUT_FORMATTED),
    isPaid: false,
    isCurrent: false,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <Header selectedNetwork={selectedNetwork} onNetworkChange={setSelectedNetwork} />

      <main className="container px-4 py-8 relative">
        {/* Hero */}
        <section className="mb-12 relative">
          <PaperEaglesBackground />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <Badge variant="outline" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {t("testnetBadge")}
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                <span className="gradient-text">{t("savingsPool")}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                {t("poolDescription")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="gradient" size="lg" className="gap-2" onClick={() => navigate("/waitlist")}>
                <Users className="w-5 h-5" />
                {t("joinWaitlistCta")}
              </Button>
              <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate("/dashboard")}>
                <FlaskConical className="w-5 h-5" />
                {t("tryTestnet")}
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card
                key={feature.titleKey}
                variant="glass"
                className="animate-fade-in hover:border-primary/30 transition-colors cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Reglas del protocolo */}
        <section className="mb-12 space-y-4">
          <h2 className="font-display text-2xl font-bold">{t("howItWorks")}</h2>
          <PoolStats />
        </section>

        {/* Calendario de ejemplo */}
        <section className="max-w-2xl">
          <PayoutSchedule
            payouts={exampleSchedule}
            title={t("exampleRotation")}
            note={t("exampleNote")}
          />
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>{t("footerText")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
