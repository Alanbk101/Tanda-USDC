import { Button } from "@/components/ui/button";
import { NetworkSelector } from "@/components/NetworkSelector";
import { Wallet, Menu } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  selectedNetwork: "solana" | "ethereum" | "polygon" | "arbitrum";
  onNetworkChange: (network: "solana" | "ethereum" | "polygon" | "arbitrum") => void;
}

export function Header({ selectedNetwork, onNetworkChange }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">T</span>
          </div>
          <span className="font-display font-bold text-xl hidden sm:inline">
            Tanda USDC
          </span>
          </div>
        </div>

        <div className="hidden md:block">
          <NetworkSelector
            selectedNetwork={selectedNetwork}
            onNetworkChange={onNetworkChange}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={isConnected ? "outline" : "gradient"}
            size="sm"
            onClick={() => setIsConnected(!isConnected)}
            className="gap-2"
          >
            <Wallet className="w-4 h-4" />
            {isConnected ? (
              <span className="font-mono">0x7a3d...8f2e</span>
            ) : (
              "Connect Wallet"
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Network Selector */}
      <div className="md:hidden border-t border-border/50 p-3">
        <NetworkSelector
          selectedNetwork={selectedNetwork}
          onNetworkChange={onNetworkChange}
        />
      </div>
    </header>
  );
}
