import { Button } from "@/components/ui/button";
import { NetworkSelector } from "@/components/NetworkSelector";
import { SettingsMenu } from "@/components/SettingsMenu";
import { Wallet, Menu, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/contexts/SettingsContext";

// Modern geometric pattern background component with Mexican flag colors
function NavbarPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/* Main geometric pattern with diamonds and circles */}
          <pattern id="nav-geo-pattern" patternUnits="userSpaceOnUse" width="48" height="48">
            {/* Diamond shapes - green (desaturated) */}
            <path 
              d="M12 6 L18 12 L12 18 L6 12 Z" 
              fill="hsl(145 40% 35% / 0.08)"
            />
            {/* Diamond shapes - red (desaturated) */}
            <path 
              d="M36 6 L42 12 L36 18 L30 12 Z" 
              fill="hsl(0 50% 45% / 0.06)"
            />
            {/* Small circles - white/neutral */}
            <circle cx="24" cy="12" r="2" fill="hsl(0 0% 100% / 0.12)" />
            <circle cx="12" cy="36" r="1.5" fill="hsl(0 0% 100% / 0.08)" />
            <circle cx="36" cy="36" r="1.5" fill="hsl(0 0% 100% / 0.08)" />
            {/* Hexagon accent - green */}
            <path 
              d="M24 30 L28 33 L28 39 L24 42 L20 39 L20 33 Z" 
              fill="hsl(145 35% 40% / 0.05)"
              stroke="hsl(145 40% 35% / 0.06)"
              strokeWidth="0.5"
            />
            {/* Small diamond - red accent */}
            <path 
              d="M0 24 L3 27 L0 30 L-3 27 Z" 
              fill="hsl(0 45% 50% / 0.05)"
            />
            <path 
              d="M48 24 L51 27 L48 30 L45 27 Z" 
              fill="hsl(0 45% 50% / 0.05)"
            />
            {/* Connecting lines - subtle */}
            <line x1="18" y1="12" x2="30" y2="12" stroke="hsl(145 30% 45% / 0.04)" strokeWidth="0.5" />
            <line x1="12" y1="18" x2="12" y2="30" stroke="hsl(0 0% 100% / 0.04)" strokeWidth="0.5" />
            <line x1="36" y1="18" x2="36" y2="30" stroke="hsl(0 40% 50% / 0.04)" strokeWidth="0.5" />
          </pattern>
          
          {/* Gradient overlay for depth */}
          <linearGradient id="nav-fade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(145 40% 35% / 0.03)" />
            <stop offset="50%" stopColor="hsl(0 0% 100% / 0.02)" />
            <stop offset="100%" stopColor="hsl(0 50% 45% / 0.03)" />
          </linearGradient>
        </defs>
        
        {/* Base pattern layer */}
        <rect width="100%" height="100%" fill="url(#nav-geo-pattern)" />
        
        {/* Subtle gradient overlay */}
        <rect width="100%" height="100%" fill="url(#nav-fade)" />
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
  selectedNetwork: "base";
  onNetworkChange: (network: "base") => void;
}

export function Header({ selectedNetwork, onNetworkChange }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { t } = useSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl relative">
      <NavbarPattern />
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
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
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
              t("connectWallet")
            )}
          </Button>
          <SettingsMenu />
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
