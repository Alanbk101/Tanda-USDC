import { useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { Header } from "@/components/Header";
import { NetworkSelector } from "@/components/NetworkSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupDetail, StatusBadge } from "@/components/tanda/GroupDetail";
import { AdminPanel } from "@/components/tanda/AdminPanel";
import { useGroups, useOwner, useTandaNetwork, useUsdcBalance } from "@/hooks/useTanda";
import { every, potPerRound, usdc, type TandaGroup } from "@/lib/tanda";
import { ArrowLeft, Coins, ExternalLink, FileCode2, Users } from "lucide-react";

function GroupCard({ group: g, onOpen }: { group: TandaGroup; onOpen: () => void }) {
  const c = g.config;
  return (
    <button onClick={onOpen} className="text-left w-full">
      <Card variant="glass" className="hover:border-primary/40 transition-colors h-full">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-lg font-bold">Tanda #{g.id.toString()}</span>
            <StatusBadge status={g.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {usdc(c.contribution)} USDC {every(c.periodDuration)} · cobro de {usdc(potPerRound(c))} USDC
          </p>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              {g.members.length}/{c.members}
            </span>
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-primary" />
              Garantía {usdc(c.collateral)} USDC
            </span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { network, manager } = useTandaNetwork();
  const { groups, isLoading, error } = useGroups();
  const { isAdmin } = useOwner();
  const balance = useUsdcBalance();
  const [params, setParams] = useSearchParams();

  const selectedId = params.get("tanda");
  const selected = selectedId ? groups.find((g) => g.id.toString() === selectedId) : undefined;
  const open = (id: bigint) => setParams({ tanda: id.toString() });
  const back = () => setParams({});

  return (
    <div className="min-h-screen bg-background mexican-pattern">
      <Header />

      <main className="container px-4 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-4xl font-bold gradient-text">Tandas</h1>
            <p className="text-muted-foreground mt-1">
              {network ? `Red: ${network.label}${network.testnet ? " (pruebas)" : ""}` : "Elige una red"}
              {isConnected && balance !== undefined && ` · Tu saldo: ${usdc(balance)} USDC`}
            </p>
          </div>
          <NetworkSelector className="md:hidden" />
        </div>

        {network?.testnet && isConnected && balance === 0n && (
          <Card>
            <CardContent className="p-4 text-sm flex items-center justify-between gap-3 flex-wrap">
              <span>No tienes USDC de prueba en {network.label}.</span>
              <a
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Pedir USDC de prueba <ExternalLink className="w-3 h-3" />
              </a>
            </CardContent>
          </Card>
        )}

        {!network && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Tu wallet está en una red que no soportamos. Cambia a Base, Arbitrum o Polygon con el selector de red.
            </CardContent>
          </Card>
        )}

        {network && !manager && (
          <Card className="border-dashed">
            <CardContent className="p-6 space-y-2 text-center">
              <FileCode2 className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-semibold">Todavía no hay contrato de tandas en {network.label}.</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Prueba otra red con el selector. Si eres el administrador, despliega el contrato siguiendo
                contracts/evm/README.md y pega la dirección en src/config/deployments.ts.
              </p>
            </CardContent>
          </Card>
        )}

        {manager && (
          <>
            {selected ? (
              <div className="max-w-3xl space-y-4">
                <Button variant="ghost" size="sm" onClick={back}>
                  <ArrowLeft className="w-4 h-4" /> Todas las tandas
                </Button>
                <GroupDetail group={selected} />
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
                <section className="space-y-4">
                  <h2 className="font-display text-xl font-semibold">Tandas en {network?.label}</h2>
                  {error && (
                    <p className="text-sm text-destructive">No se pudieron leer las tandas. Revisa tu conexión e intenta de nuevo.</p>
                  )}
                  {isLoading ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Skeleton className="h-36" />
                      <Skeleton className="h-36" />
                    </div>
                  ) : groups.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Aún no hay tandas en esta red.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {groups.map((g) => (
                        <GroupCard key={g.id.toString()} group={g} onOpen={() => open(g.id)} />
                      ))}
                    </div>
                  )}
                </section>
                {isAdmin && <AdminPanel groups={groups} />}
              </div>
            )}
            {selectedId && !selected && !isLoading && (
              <p className="text-sm text-muted-foreground">No encontramos la tanda #{selectedId} en esta red.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
