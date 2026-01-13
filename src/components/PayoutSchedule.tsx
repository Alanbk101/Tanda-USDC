import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface PayoutMonth {
  month: number;
  memberName: string;
  amount: number;
  isPaid: boolean;
  isCurrent: boolean;
}

interface PayoutScheduleProps {
  payouts: PayoutMonth[];
}

export function PayoutSchedule({ payouts }: PayoutScheduleProps) {
  const { t } = useSettings();

  return (
    <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "600ms" }}>
      <CardHeader>
        <CardTitle>{t("payoutRotation")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-4">
            {payouts.map((payout, index) => (
              <div
                key={payout.month}
                className={cn(
                  "relative flex items-center gap-4 pl-12 pr-4 py-3 rounded-lg transition-all",
                  payout.isCurrent && "bg-primary/10 border border-primary/30",
                  payout.isPaid && "opacity-60"
                )}
              >
                {/* Timeline node */}
                <div className="absolute left-2">
                  {payout.isPaid ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  ) : payout.isCurrent ? (
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center animate-pulse-slow">
                      <ArrowRight className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <Circle className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payout.memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("month")} {payout.month}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg">
                      ${payout.amount}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        USDC
                      </span>
                    </p>
                    {payout.isCurrent && (
                      <Badge variant="success" className="mt-1">{t("nextPayoutBadge")}</Badge>
                    )}
                    {payout.isPaid && (
                      <Badge variant="secondary" className="mt-1">{t("completed")}</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}