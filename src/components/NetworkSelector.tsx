import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Network = "solana" | "ethereum" | "polygon" | "arbitrum";

interface NetworkOption {
  id: Network;
  name: string;
  icon: string;
  color: string;
}

const networks: NetworkOption[] = [
  { id: "solana", name: "Solana", icon: "◎", color: "text-accent" },
  { id: "ethereum", name: "Ethereum", icon: "Ξ", color: "text-ethereum" },
  { id: "polygon", name: "Polygon", icon: "⬡", color: "text-purple-400" },
  { id: "arbitrum", name: "Arbitrum", icon: "◆", color: "text-blue-400" },
];

interface NetworkSelectorProps {
  selectedNetwork: Network;
  onNetworkChange: (network: Network) => void;
}

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-1 rounded-xl bg-secondary/50 border border-border">
      {networks.map((network) => (
        <Button
          key={network.id}
          variant="ghost"
          size="sm"
          onClick={() => onNetworkChange(network.id)}
          className={cn(
            "gap-2 transition-all duration-300",
            selectedNetwork === network.id
              ? "bg-card shadow-md"
              : "hover:bg-card/50"
          )}
        >
          <span className={cn("text-lg", network.color)}>{network.icon}</span>
          <span className="hidden sm:inline">{network.name}</span>
        </Button>
      ))}
    </div>
  );
}
