import { Button } from "@/components/ui/button";
import { NetworkSelector } from "@/components/NetworkSelector";
import { SettingsMenu } from "@/components/SettingsMenu";
import { Wallet, Menu, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import { MexicanEagle } from "@/components/MexicanEagle";

interface HeaderProps {
  selectedNetwork: "base";
  onNetworkChange: (network: "base") => void;
}

export function Header({ selectedNetwork, onNetworkChange }: HeaderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { t } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const isWaitlist = location.pathname === "/waitlist";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl relative">
      <NavbarPattern />
      <div className="container flex h-16 items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => navigate("/")}
          >
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
            variant={isDashboard ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="w-4 h-4 text-mexican-green" />
            <span className="hidden sm:inline bg-gradient-to-r from-mexican-green via-foreground to-mexican-red bg-clip-text text-transparent font-semibold">
              Dashboard
            </span>
          </Button>
          <Button
            variant={isWaitlist ? "secondary" : "ghost"}
            size="sm"
            className="gap-2"
            onClick={() => navigate("/waitlist")}
          >
            <Users className="w-4 h-4 text-mexican-green" />
            <span className="hidden sm:inline bg-gradient-to-r from-mexican-green via-foreground to-mexican-red bg-clip-text text-transparent font-semibold">
              {t("waitlistTitle")}
            </span>
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
