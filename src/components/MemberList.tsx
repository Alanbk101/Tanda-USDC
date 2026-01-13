import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, Clock, Crown } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface Member {
  id: string;
  name: string;
  wallet: string;
  hasPaid: boolean;
  payoutMonth: number;
  hasReceivedPayout: boolean;
}

interface MemberListProps {
  members: Member[];
  currentMonth: number;
}

export function MemberList({ members, currentMonth }: MemberListProps) {
  const { t } = useSettings();

  return (
    <Card variant="glass" className="animate-fade-in" style={{ animationDelay: "500ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>{t("poolMembers")}</span>
          <Badge variant="secondary">{members.length}/10</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((member, index) => {
          const isNextPayout = member.payoutMonth === currentMonth && !member.hasReceivedPayout;
          
          return (
            <div
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                isNextPayout
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary/30 hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 font-display">
                    {member.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.name}</span>
                    {isNextPayout && (
                      <Crown className="w-4 h-4 text-primary animate-pulse-slow" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("payout")}</p>
                  <p className="text-sm font-medium">{t("month")} {member.payoutMonth}</p>
                </div>
                
                {member.hasPaid ? (
                  <Badge variant="success" className="gap-1">
                    <Check className="w-3 h-3" />
                    {t("paid")}
                  </Badge>
                ) : (
                  <Badge variant="pending" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {t("pending")}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}