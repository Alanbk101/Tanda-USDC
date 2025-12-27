import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Coins, Calendar, TrendingUp } from "lucide-react";

interface PoolStatsProps {
  totalMembers: number;
  weeklyContribution: number;
  currentWeek: number;
  totalWeeks: number;
  monthlyPool: number;
  nextPayoutDate: string;
}

export function PoolStats({
  totalMembers,
  weeklyContribution,
  currentWeek,
  totalWeeks,
  monthlyPool,
  nextPayoutDate,
}: PoolStatsProps) {
  const progress = (currentWeek / totalWeeks) * 100;

  const stats = [
    {
      label: "Pool Members",
      value: totalMembers,
      icon: Users,
      suffix: "members",
    },
    {
      label: "Weekly Contribution",
      value: weeklyContribution,
      icon: Coins,
      prefix: "$",
      suffix: "USDC",
    },
    {
      label: "Monthly Pool",
      value: monthlyPool,
      icon: TrendingUp,
      prefix: "$",
      suffix: "USDC",
    },
    {
      label: "Next Payout",
      value: nextPayoutDate,
      icon: Calendar,
      isDate: true,
    },
  ];

  return (
    <div className="space-y-6">
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
                    {stat.suffix && !stat.isDate && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {stat.suffix}
                      </span>
                    )}
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

      <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "400ms" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Pool Cycle Progress</span>
            <span className="text-sm font-medium">
              Week {currentWeek} of {totalWeeks}
            </span>
          </div>
          <Progress value={progress} variant="gradient" className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {totalWeeks - currentWeek} weeks remaining in this cycle
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
