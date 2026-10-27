import type { ReactNode } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ConnectButton } from "@/components/ConnectButton";
import { TANDA_MANAGER_ABI } from "@/config/tandaManagerAbi";
import { explorerAddressUrl } from "@/config/networks";
import { useMember, useTandaNetwork } from "@/hooks/useTanda";
import { useTx } from "@/hooks/useTx";
import { useNow } from "@/hooks/useNow";
import {
  REVEAL_WINDOW_SECONDS,
  STATUS_LABEL,
  TandaStatus,
  currentRoundAt,
  formatDate,
  capitalize,
  every,
  formatDuration,
  payableNow,
  potPerRound,
  roundSeconds,
  sameAddress,
  settleTimeOf,
  shortAddress,
  usdc,
  type TandaGroup,
} from "@/lib/tanda";
import { CheckCircle2, Circle, Clock, ExternalLink, Loader2, ShieldAlert, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: TandaStatus }) {
  const variant =
    status === TandaStatus.Active
      ? "default"
      : status === TandaStatus.Open
        ? "outline"
        : status === TandaStatus.Cancelled
          ? "destructive"
          : "secondary";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

function ActionBox({ tone = "default", children }: { tone?: "default" | "warn" | "good"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        tone === "warn" && "border-amber-500/40 bg-amber-500/10",
        tone === "good" && "border-emerald-600/30 bg-emerald-600/10",
      )}
    >
      {children}
    </div>
  );
}

export function GroupDetail({ group: g }: { group: TandaGroup }) {
  const { address, isConnected } = useAccount();
  const { chainId, manager } = useTandaNetwork();
  const { member } = useMember(g.id);
  const tx = useTx();
  const now = useNow();

  if (!manager) return null;
  const c = g.config;
  const pot = potPerRound(c);
  const totalPeriods = c.members * c.periodsPerRound;
  const busy = tx.busy !== null;

  const call = (functionName: string, args: readonly unknown[]) => ({
    address: manager,
    abi: TANDA_MANAGER_ABI,
    functionName,
    args,
  });

  // ---------------------------------------------------------------- acciones
  const join = () =>
    tx.run("join", async () => {
      await tx.ensureAllowance(manager, c.collateral);
      await tx.send("Unirme", call("join", [g.id]));
    });
  const leave = () => tx.run("leave", () => tx.send("Salir", call("leave", [g.id])));
  const pay = (periods: number) =>
    tx.run(`pay-${periods}`, async () => {
      await tx.ensureAllowance(manager, c.contribution * BigInt(periods));
      await tx.send(`Pagar ${periods} ${periods === 1 ? "periodo" : "periodos"}`, call("contribute", [g.id, periods]));
    });
  const settle = () => tx.run("settle", () => tx.send("Liquidar ronda", call("settleRound", [g.id])));
  const withdraw = () => tx.run("withdraw", () => tx.send("Retirar", call("withdraw", [g.id])));
  const repay = (amount: bigint) =>
    tx.run("repay", async () => {
      await tx.ensureAllowance(manager, amount);
      await tx.send("Pagar deuda", call("repayDebt", [g.id, amount]));
    });
  const cancelUnrevealed = () =>
    tx.run("cancel", () => tx.send("Cancelar tanda", call("cancelUnrevealed", [g.id])));
  const cancelExpired = () => tx.run("cancel", () => tx.send("Cancelar tanda", call("cancelExpired", [g.id])));

  const spin = (key: string) => tx.busy === key && <Loader2 className="w-4 h-4 animate-spin" />;

  // ---------------------------------------------------------------- derivados
  const joined = !!member?.joined;
  const owedPeriods = member && joined && g.status === TandaStatus.Active ? payableNow(g, member, now) : 0;
  const round = currentRoundAt(g, now);
  const settleAt = settleTimeOf(g);
  const canSettle = g.status === TandaStatus.Active && now >= settleAt;
  const nextRecipient = g.status === TandaStatus.Active ? g.order[g.roundsSettled] : undefined;
  const revealDeadline = Number(g.filledAt) + REVEAL_WINDOW_SECONDS;
  const deadlinePassed = c.joinDeadline > 0n && now > Number(c.joinDeadline);
  const withdrawable =
    (member?.claimable ?? 0n) +
    (g.status === TandaStatus.Completed || g.status === TandaStatus.Cancelled ? (member?.collateralLeft ?? 0n) : 0n);

  return (
    <Card variant="glass" className="animate-fade-in">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="font-display text-2xl">Tanda #{g.id.toString()}</CardTitle>
          <div className="flex gap-2">
            {g.inviteOnly && <Badge variant="outline">Por invitación</Badge>}
            <StatusBadge status={g.status} />
          </div>
        </div>
        <p className="text-muted-foreground">
          {c.members} personas pagan {usdc(c.contribution)} USDC {every(c.periodDuration)}. {capitalize(every(roundSeconds(c)))} una persona cobra {usdc(pot)} USDC.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ---------------------------------------------------- reglas */}
        <div className="divide-y divide-border/60">
          <Row label="Aportación">
            {usdc(c.contribution)} USDC {every(c.periodDuration)}
          </Row>
          <Row label="Cobro por turno">{usdc(pot)} USDC</Row>
          <Row label="Garantía al entrar">{usdc(c.collateral)} USDC (se devuelve al final)</Row>
          <Row label="Duración total">{formatDuration(roundSeconds(c) * c.members)}</Row>
          <Row label="Gracia para pagar">{c.gracePeriod ? formatDuration(c.gracePeriod) : "Sin gracia"}</Row>
          {c.joinDeadline > 0n && <Row label="Fecha límite para llenarse">{formatDate(c.joinDeadline)}</Row>}
        </div>

        {/* ---------------------------------------------------- acciones */}
        {!isConnected && (
          <ActionBox>
            <p className="text-sm">Conecta tu wallet para unirte o ver tu estado en esta tanda.</p>
            <ConnectButton />
          </ActionBox>
        )}

        {isConnected && g.status === TandaStatus.Open && (
          <ActionBox>
            <div className="flex justify-between text-sm">
              <span>Lugares ocupados</span>
              <span className="font-medium">
                {g.members.length} / {c.members}
              </span>
            </div>
            <Progress value={(g.members.length / c.members) * 100} className="h-2" />
            {joined ? (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Ya estás dentro. Esperando a que se llene.
                </p>
                <Button variant="outline" size="sm" onClick={leave} disabled={busy}>
                  {spin("leave")} Salir y recuperar garantía
                </Button>
              </div>
            ) : g.inviteOnly && !member?.invited ? (
              <p className="text-sm text-muted-foreground">Esta tanda es solo por invitación y tu wallet no está en la lista.</p>
            ) : deadlinePassed ? (
              <p className="text-sm text-muted-foreground">La fecha límite para unirse ya pasó.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Al unirte se cobra la garantía de {usdc(c.collateral)} USDC. Si la tanda no arranca, la recuperas.
                </p>
                <Button variant="gradient" className="w-full" onClick={join} disabled={busy}>
                  {spin("join")} Unirme a la tanda
                </Button>
              </>
            )}
            {deadlinePassed && (
              <Button variant="outline" size="sm" onClick={cancelExpired} disabled={busy}>
                {spin("cancel")} Cancelar por vencimiento
              </Button>
            )}
          </ActionBox>
        )}

        {g.status === TandaStatus.Filled && (
          <ActionBox>
            <p className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" /> La tanda está llena. Falta que el administrador haga el sorteo de turnos.
            </p>
            {now > revealDeadline ? (
              <>
                <p className="text-sm text-muted-foreground">
                  El administrador no sorteó a tiempo. Cualquiera puede cancelar y todos recuperan su garantía.
                </p>
                <Button variant="outline" onClick={cancelUnrevealed} disabled={busy || !isConnected}>
                  {spin("cancel")} Cancelar y devolver garantías
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                Si no lo hace antes del {formatDate(revealDeadline)}, la tanda se podrá cancelar
              </p>
            )}
          </ActionBox>
        )}

        {g.status === TandaStatus.Active && (
          <ActionBox>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Ronda</p>
                <p className="font-display text-xl font-bold">
                  {round + 1} de {c.members}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Cobra ahora</p>
                <p className="font-mono">
                  {sameAddress(nextRecipient, address) ? "Tú" : shortAddress(nextRecipient)}
                </p>
              </div>
            </div>
            {canSettle ? (
              <>
                <p className="text-sm">
                  La ronda {g.roundsSettled + 1} ya cerró. Cualquiera puede liquidarla para acreditar el cobro.
                </p>
                <Button variant="outline" className="w-full" onClick={settle} disabled={busy || !isConnected}>
                  {spin("settle")} Liquidar ronda {g.roundsSettled + 1}
                </Button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Se puede liquidar a partir del {formatDate(settleAt)}</p>
            )}
          </ActionBox>
        )}

        {joined && member && g.status === TandaStatus.Active && (
          <ActionBox tone={owedPeriods > 0 ? "warn" : "good"}>
            <div className="flex justify-between text-sm">
              <span>Tu turno</span>
              <span className="font-medium">
                #{member.turn} {member.received ? "· ya cobraste" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Periodos pagados</span>
              <span className="font-medium">
                {member.periodsPaid} / {totalPeriods}
              </span>
            </div>
            <Progress value={(member.periodsPaid / totalPeriods) * 100} className="h-2" />
            {owedPeriods > 0 ? (
              <>
                <p className="text-sm">
                  Para estar al corriente en esta ronda te faltan {owedPeriods}{" "}
                  {owedPeriods === 1 ? "pago" : "pagos"} ({usdc(c.contribution * BigInt(owedPeriods))} USDC).
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="gradient" className="flex-1" onClick={() => pay(owedPeriods)} disabled={busy}>
                    {spin(`pay-${owedPeriods}`)} Pagar {usdc(c.contribution * BigInt(owedPeriods))} USDC
                  </Button>
                  {owedPeriods > 1 && (
                    <Button variant="outline" onClick={() => pay(1)} disabled={busy}>
                      {spin("pay-1")} Pagar solo 1
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Estás al corriente en esta ronda.
              </p>
            )}
          </ActionBox>
        )}

        {member && member.debt > 0n && (
          <ActionBox tone="warn">
            <p className="text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Tienes una deuda de {usdc(member.debt)} USDC con el grupo porque tu
              garantía no alcanzó a cubrir un pago.
            </p>
            <Button variant="outline" onClick={() => repay(member.debt)} disabled={busy}>
              {spin("repay")} Pagar deuda
            </Button>
          </ActionBox>
        )}

        {withdrawable > 0n && (
          <ActionBox tone="good">
            <p className="text-sm flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Tienes {usdc(withdrawable)} USDC listos para retirar.
            </p>
            <Button variant="gradient" className="w-full" onClick={withdraw} disabled={busy}>
              {spin("withdraw")} Retirar {usdc(withdrawable)} USDC
            </Button>
          </ActionBox>
        )}

        {/* ---------------------------------------------------- orden de cobro */}
        {g.order.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-display font-semibold">Orden de cobro (sorteado)</h3>
            <ol className="space-y-1">
              {g.order.map((a, i) => {
                const done = i < g.roundsSettled;
                const isNext = g.status === TandaStatus.Active && i === g.roundsSettled;
                const me = sameAddress(a, address);
                return (
                  <li
                    key={a}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      isNext && "bg-primary/10 border border-primary/30",
                      me && "font-semibold",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="w-16 text-muted-foreground">Turno {i + 1}</span>
                    <span className="font-mono">{me ? "Tú" : shortAddress(a)}</span>
                    {isNext && <Badge className="ml-auto">Cobra ahora</Badge>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {g.order.length === 0 && g.members.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-display font-semibold">Miembros</h3>
            <ul className="grid grid-cols-2 gap-1 text-sm font-mono">
              {g.members.map((a) => (
                <li key={a}>{sameAddress(a, address) ? "Tú" : shortAddress(a)}</li>
              ))}
            </ul>
          </div>
        )}

        {explorerAddressUrl(chainId, manager) && (
          <a
            href={explorerAddressUrl(chainId, manager)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:underline"
          >
            Ver contrato en el explorador <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
