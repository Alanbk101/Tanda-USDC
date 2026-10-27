import { Card, CardContent } from "@/components/ui/card";
import { Users, Coins, CalendarRange, TrendingUp } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { PROTOCOL_CONSTANTS } from "@/config/contracts";

// Reglas fijas del protocolo. No muestra progreso ni fechas: eso solo
// puede venir del contrato, y en la landing no hay un grupo real activo.
export function PoolStats() {
  const { t } = useSettings();

  const stats = [
    {
      label: t("poolMembers"),
      value: PROTOCOL_CONSTANTS.PARTICIPANTS_COUNT,
      icon: Users,
      suffix: t("members"),
    },
    {
      label: t("weeklyContribution"),
      value: PROTOCOL_CONSTANTS.WEEKLY_PAYMENT_FORMATTED,
      icon: Coins,
      prefix: "$",
      suffix: "USDC",
    },
    {
      label: t("monthlyPool"),
      value: PROTOCOL_CONSTANTS.GROUP_MONTHLY_PAYOUT_FORMATTED,
      icon: TrendingUp,
      prefix: "$",
      suffix: "USDC",
    },
    {
      label: t("duration"),
      value: PROTOCOL_CONSTANTS.TOTAL_MONTHS,
      icon: CalendarRange,
      suffix: t("monthsLabel"),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          variant="glass"
          className="animate-fade-in hover:border-primary/30 transition-colors"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-display font-bold">
                  {stat.prefix}
                  {stat.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {stat.suffix}
                  </span>
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
