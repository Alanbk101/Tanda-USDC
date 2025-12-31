import { useState } from "react";
import { Header } from "@/components/Header";
import { PoolStats } from "@/components/PoolStats";
import { MemberList } from "@/components/MemberList";
import { PayoutSchedule } from "@/components/PayoutSchedule";
import { ContributeModal } from "@/components/ContributeModal";
import { PaperEaglesBackground } from "@/components/PaperEaglesBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Shield, Zap } from "lucide-react";

// Mock data
const mockMembers = [
  { id: "1", name: "Alice", wallet: "0x7a3d8f2e9c1b5a4d6e8f0c2b4a6d8e0f2c4b6a8d", hasPaid: true, payoutMonth: 1, hasReceivedPayout: true },
  { id: "2", name: "Bob", wallet: "0x8b4e9f3a0d2c6b5e7f1d3c5a7b9d1e3f5a7c9b1d", hasPaid: true, payoutMonth: 2, hasReceivedPayout: true },
  { id: "3", name: "Charlie", wallet: "0x9c5f0a4b1e3d7c6f8a2e4d6b8c0f2a4d6e8a0c2e", hasPaid: true, payoutMonth: 3, hasReceivedPayout: false },
  { id: "4", name: "Diana", wallet: "0x0d6a1b5c2f4e8d7a9b3f5e7c9d1a3b5d7f9b1d3f", hasPaid: false, payoutMonth: 4, hasReceivedPayout: false },
  { id: "5", name: "Edward", wallet: "0x1e7b2c6d3a5f9e8b0c4a6d8e0b2d4f6a8c0e2a4b", hasPaid: true, payoutMonth: 5, hasReceivedPayout: false },
  { id: "6", name: "Fiona", wallet: "0x2f8c3d7e4b6a0f9c1d5b7e9f1c3e5a7b9d1f3b5c", hasPaid: true, payoutMonth: 6, hasReceivedPayout: false },
  { id: "7", name: "George", wallet: "0x3a9d4e8f5c7b1a0d2e6c8f0a2d4f6b8c0e2a4d6e", hasPaid: false, payoutMonth: 7, hasReceivedPayout: false },
  { id: "8", name: "Hannah", wallet: "0x4b0e5f9a6d8c2b1e3f7d9a1b3e5a7c9d1f3b5d7f", hasPaid: true, payoutMonth: 8, hasReceivedPayout: false },
  { id: "9", name: "Ivan", wallet: "0x5c1f6a0b7e9d3c2f4a8e0b2c4f6a8d0e2b4d6f8a", hasPaid: true, payoutMonth: 9, hasReceivedPayout: false },
  { id: "10", name: "Julia", wallet: "0x6d2a7b1c8f0e4d3a5b9f1c3d5a7b9e1f3c5e7a9b", hasPaid: false, payoutMonth: 10, hasReceivedPayout: false },
];

const mockPayouts = [
  { month: 1, memberName: "Alice", amount: 600, isPaid: true, isCurrent: false },
  { month: 2, memberName: "Bob", amount: 600, isPaid: true, isCurrent: false },
  { month: 3, memberName: "Charlie", amount: 600, isPaid: false, isCurrent: true },
  { month: 4, memberName: "Diana", amount: 600, isPaid: false, isCurrent: false },
  { month: 5, memberName: "Edward", amount: 600, isPaid: false, isCurrent: false },
  { month: 6, memberName: "Fiona", amount: 600, isPaid: false, isCurrent: false },
  { month: 7, memberName: "George", amount: 600, isPaid: false, isCurrent: false },
  { month: 8, memberName: "Hannah", amount: 600, isPaid: false, isCurrent: false },
  { month: 9, memberName: "Ivan", amount: 600, isPaid: false, isCurrent: false },
  { month: 10, memberName: "Julia", amount: 600, isPaid: false, isCurrent: false },
];

const Index = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<"base">("base");

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <Header selectedNetwork={selectedNetwork} onNetworkChange={setSelectedNetwork} />

      <main className="container px-4 py-8 relative">
        {/* Hero Section */}
        <section className="mb-12 relative">
          <PaperEaglesBackground />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <Badge variant="outline" className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Pool Active
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                <span className="gradient-text">Savings Pool</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                Join 10 members contributing 15 USDC weekly. Each month, one member receives the full pool of 600 USDC.
              </p>
            </div>
            <ContributeModal amount={15} network={selectedNetwork} />
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Coins,
                title: "Stablecoin Only",
                description: "USDC contributions for zero volatility",
              },
              {
                icon: Shield,
                title: "On-Chain Security",
                description: "Smart contract ensures fair payouts",
              },
              {
                icon: Zap,
                title: "Multi-Chain",
                description: "Support for Solana & EVM networks",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                variant="glass"
                className="animate-fade-in hover:border-primary/30 transition-colors cursor-default"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <PoolStats
            totalMembers={10}
            weeklyContribution={15}
            currentWeek={9}
            totalWeeks={40}
            monthlyPool={600}
            nextPayoutDate="Jan 15"
          />
        </section>

        {/* Members & Schedule */}
        <section className="grid lg:grid-cols-2 gap-6">
          <MemberList members={mockMembers} currentMonth={3} />
          <PayoutSchedule payouts={mockPayouts} />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>Tanda USDC — Decentralized Rotating Savings</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
