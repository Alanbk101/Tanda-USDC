import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Mock data for dashboard
const portfolioStats = {
  totalContributed: 180,
  currentPoolValue: 600,
  nextPayoutAmount: 600,
  memberRank: 3,
  totalMembers: 10,
  weeksContributed: 12,
};

const recentActivity = [
  { id: 1, type: "contribution", amount: 15, date: "2024-01-10", status: "confirmed" },
  { id: 2, type: "contribution", amount: 15, date: "2024-01-03", status: "confirmed" },
  { id: 3, type: "payout", amount: 600, date: "2023-12-15", status: "received" },
  { id: 4, type: "contribution", amount: 15, date: "2023-12-27", status: "confirmed" },
  { id: 5, type: "contribution", amount: 15, date: "2023-12-20", status: "confirmed" },
];

const upcomingPayouts = [
  { month: "February", member: "You", amount: 600, isYou: true },
  { month: "March", member: "Carlos M.", amount: 600, isYou: false },
  { month: "April", member: "Ana R.", amount: 600, isYou: false },
];

export default function Dashboard() {
  const { t } = useSettings();

  return (
    <div className="min-h-screen bg-background mexican-pattern">
      <Header selectedNetwork="base" onNetworkChange={() => {}} />
      
      <main className="container px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your savings pool activity and portfolio
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Contributed</p>
                  <p className="text-2xl font-bold text-foreground">${portfolioStats.totalContributed}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-mexican-green" />
                    <span className="text-xs text-mexican-green">+15 this week</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-mexican-green/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-mexican-green" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pool Value</p>
                  <p className="text-2xl font-bold text-foreground">${portfolioStats.currentPoolValue}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{portfolioStats.totalMembers} members</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Payout</p>
                  <p className="text-2xl font-bold text-foreground">${portfolioStats.nextPayoutAmount}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">February 2024</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Position</p>
                  <p className="text-2xl font-bold text-foreground">#{portfolioStats.memberRank}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{portfolioStats.weeksContributed} weeks active</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-display text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === "payout" 
                          ? "bg-mexican-green/10" 
                          : "bg-accent/10"
                      }`}>
                        {activity.type === "payout" ? (
                          <ArrowDownRight className="w-5 h-5 text-mexican-green" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {activity.type === "payout" ? "Payout Received" : "Contribution"}
                        </p>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        activity.type === "payout" ? "text-mexican-green" : "text-foreground"
                      }`}>
                        {activity.type === "payout" ? "+" : "-"}${activity.amount} USDC
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          activity.status === "confirmed" || activity.status === "received"
                            ? "border-mexican-green/50 text-mexican-green"
                            : "border-muted-foreground/50"
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payouts */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-xl">Upcoming Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayouts.map((payout, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      payout.isYou 
                        ? "border-mexican-green bg-mexican-green/5" 
                        : "border-border/50 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{payout.month}</span>
                      {payout.isYou && (
                        <Badge className="bg-mexican-green text-white">Your Turn!</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{payout.member}</span>
                      <span className="font-bold text-foreground">${payout.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Progress */}
        <Card className="glass-card border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="font-display text-xl">Contribution Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cycle Progress</span>
                <span className="font-medium text-foreground">12 of 40 weeks</span>
              </div>
              <Progress value={30} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-2xl font-bold text-mexican-green">12</p>
                  <p className="text-xs text-muted-foreground">Weeks Paid</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-2xl font-bold text-foreground">28</p>
                  <p className="text-xs text-muted-foreground">Weeks Remaining</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-2xl font-bold text-accent">$420</p>
                  <p className="text-xs text-muted-foreground">Left to Contribute</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 text-center">
                  <p className="text-2xl font-bold text-gold">100%</p>
                  <p className="text-xs text-muted-foreground">On-Time Rate</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
