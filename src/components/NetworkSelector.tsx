import { useChainId, useSwitchChain } from "wagmi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NETWORKS } from "@/config/networks";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

const DOT: Record<string, string> = {
  Base: "bg-blue-500",
  Arbitrum: "bg-sky-400",
  Polygon: "bg-violet-500",
  Local: "bg-amber-400",
};

/** Cambia de red. Funciona con o sin wallet conectada. El modo testnet decide qué redes se ven. */
export function NetworkSelector({ className }: { className?: string }) {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const { testnetMode } = useSettings();

  const visible = NETWORKS.filter((n) => n.testnet === testnetMode);
  const current = NETWORKS.find((n) => n.chain.id === chainId);
  const options = current && !visible.includes(current) ? [current, ...visible] : visible;

  return (
    <Select
      value={current ? String(current.chain.id) : undefined}
      onValueChange={(v) => switchChain({ chainId: Number(v) })}
      disabled={isPending}
    >
      <SelectTrigger className={cn("w-[170px] h-9 bg-secondary/50", className)} aria-label="Red">
        <SelectValue placeholder="Elige red" />
      </SelectTrigger>
      <SelectContent>
        {options.map((n) => (
          <SelectItem key={n.chain.id} value={String(n.chain.id)}>
            <span className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full", DOT[n.short] ?? "bg-muted-foreground")} />
              {n.label}
              {!n.tandaManager && <span className="text-xs text-muted-foreground">· sin contrato</span>}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
