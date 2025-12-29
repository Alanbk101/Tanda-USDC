import { Button } from "@/components/ui/button";
import { NetworkSelector } from "@/components/NetworkSelector";
import { Wallet, Menu } from "lucide-react";
import { useState } from "react";

// Aztec-inspired decorative pattern component
function AztecPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <svg className="absolute left-0 top-0 h-full w-32" viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="aztec-left" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="currentColor" className="text-mexican-green" />
          <circle cx="10" cy="10" r="3" fill="currentColor" className="text-gold" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#aztec-left)" />
      </svg>
      <svg className="absolute right-0 top-0 h-full w-32" viewBox="0 0 100 100" preserveAspectRatio="none">
        <pattern id="aztec-right" patternUnits="userSpaceOnUse" width="20" height="20">
          <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="currentColor" className="text-mexican-red" />
          <circle cx="10" cy="10" r="3" fill="currentColor" className="text-gold" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#aztec-right)" />
      </svg>
    </div>
  );
}

// Mexican Eagle Emblem component
function MexicanEagle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Eagle body */}
      <ellipse cx="32" cy="36" rx="12" ry="14" className="fill-mexican-green" />
      {/* Eagle head */}
      <circle cx="32" cy="20" r="8" className="fill-mexican-green" />
      {/* Beak */}
      <path d="M32 24 L36 28 L32 32 L28 28 Z" className="fill-gold" />
      {/* Eye */}
      <circle cx="30" cy="18" r="1.5" className="fill-foreground" />
      <circle cx="34" cy="18" r="1.5" className="fill-foreground" />
      {/* Left wing */}
      <path d="M20 30 Q8 25 4 35 Q10 40 20 38 Z" className="fill-mexican-green" />
      <path d="M18 32 Q10 28 6 34" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M16 34 Q10 31 7 36" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      {/* Right wing */}
      <path d="M44 30 Q56 25 60 35 Q54 40 44 38 Z" className="fill-mexican-green" />
      <path d="M46 32 Q54 28 58 34" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      <path d="M48 34 Q54 31 57 36" stroke="currentColor" strokeWidth="1" className="stroke-gold" fill="none" />
      {/* Tail feathers */}
      <path d="M26 48 L22 58 L26 54 L30 60 L32 52 L34 60 L38 54 L42 58 L38 48 Z" className="fill-mexican-red" />
      {/* Snake */}
      <path d="M24 36 Q28 42 32 38 Q36 34 40 40" stroke="currentColor" strokeWidth="2" className="stroke-mexican-red" fill="none" strokeLinecap="round" />
      {/* Cactus/Nopal base */}
      <ellipse cx="32" cy="50" rx="6" ry="3" className="fill-mexican-green opacity-70" />
      {/* Crown/Crest */}
      <path d="M28 12 L30 8 L32 12 L34 8 L36 12" stroke="currentColor" strokeWidth="1.5" className="stroke-gold" fill="none" strokeLinecap="round" />
    </svg>
  );
}

interface HeaderProps {
  selectedNetwork: "solana" | "ethereum" | "polygon" | "arbitrum";
  onNetworkChange: (network: "solana" | "ethereum" | "polygon" | "arbitrum") => void;
}

export function Header({ selectedNetwork, onNetworkChange }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl relative">
      <AztecPattern />
      <div className="container flex h-16 items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <MexicanEagle className="w-10 h-10 drop-shadow-md" />
            <span className="font-display font-bold text-xl hidden sm:inline bg-gradient-to-r from-mexican-green via-foreground to-mexican-red bg-clip-text text-transparent">
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
