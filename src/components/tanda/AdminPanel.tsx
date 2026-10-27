import { useMemo, useState } from "react";
import { encodeAbiParameters, isAddress, keccak256, parseEventLogs, toHex } from "viem";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TANDA_MANAGER_ABI } from "@/config/tandaManagerAbi";
import { useTandaNetwork } from "@/hooks/useTanda";
import { useTx } from "@/hooks/useTx";
import { loadSeed, saveSeed } from "@/lib/seedStore";
import { TandaStatus, capitalize, every, formatDuration, parseUsdc, usdc, type TandaGroup } from "@/lib/tanda";
import { Copy, Download, Loader2, Shuffle, ShieldCheck } from "lucide-react";

const PERIODS: { label: string; seconds: number }[] = [
  { label: "1 hora (solo pruebas)", seconds: 3600 },
  { label: "1 día", seconds: 86400 },
  { label: "1 semana", seconds: 7 * 86400 },
  { label: "2 semanas", seconds: 14 * 86400 },
  { label: "30 días", seconds: 30 * 86400 },
];

const GRACES: { label: string; seconds: number }[] = [
  { label: "Sin gracia", seconds: 0 },
  { label: "1 hora", seconds: 3600 },
  { label: "1 día", seconds: 86400 },
  { label: "2 días", seconds: 2 * 86400 },
  { label: "3 días", seconds: 3 * 86400 },
];

interface FormState {
  members: string;
  contribution: string;
  collateral: string;
  periodDuration: number;
  periodsPerRound: string;
  gracePeriod: number;
  joinDeadline: string; // datetime-local
  invited: string;
}

const STANDARD: FormState = {
  members: "10",
  contribution: "15",
  collateral: "30",
  periodDuration: 7 * 86400,
  periodsPerRound: "4",
  gracePeriod: 2 * 86400,
  joinDeadline: "",
  invited: "",
};

const QUICK_TEST: FormState = {
  members: "3",
  contribution: "1",
  collateral: "2",
  periodDuration: 3600,
  periodsPerRound: "1",
  gracePeriod: 0,
  joinDeadline: "",
  invited: "",
};

const newSeed = () => toHex(crypto.getRandomValues(new Uint8Array(32)));
const commitOf = (seed: `0x${string}`) => keccak256(encodeAbiParameters([{ type: "bytes32" }], [seed]));

export function AdminPanel({ groups }: { groups: TandaGroup[] }) {
  const { chainId, network, manager } = useTandaNetwork();
  const tx = useTx();
  const [form, setForm] = useState<FormState>(STANDARD);
  const [seed, setSeed] = useState<`0x${string}`>(newSeed);
  const [seedSaved, setSeedSaved] = useState(false);
  const [revealSeeds, setRevealSeeds] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  // ------------------------------------------------------------------ validación
  const parsed = useMemo(() => {
    const errors: string[] = [];
    const members = Number(form.members);
    const ppr = Number(form.periodsPerRound);
    let contribution = 0n;
    let collateral = 0n;
    try {
      contribution = parseUsdc(form.contribution);
      collateral = parseUsdc(form.collateral);
    } catch {
      errors.push("Montos no válidos.");
    }
    if (!Number.isInteger(members) || members < 2 || members > 50) errors.push("Personas: entre 2 y 50.");
    if (contribution <= 0n) errors.push("La aportación debe ser mayor a 0.");
    if (!Number.isInteger(ppr) || ppr < 1 || ppr > 12) errors.push("Pagos por cobro: entre 1 y 12.");

    const invited = form.invited
      .split(/[\s,;]+/)
      .map((a) => a.trim())
      .filter(Boolean);
    const bad = invited.filter((a) => !isAddress(a));
    if (bad.length) errors.push(`Direcciones no válidas: ${bad.slice(0, 2).join(", ")}${bad.length > 2 ? "…" : ""}`);
    if (invited.length > 0 && invited.length < members) errors.push("Si hay invitados, deben ser al menos tantos como personas.");
    if (invited.length > 100) errors.push("Máximo 100 invitados.");

    let joinDeadline = 0n;
    if (form.joinDeadline) {
      const ts = Math.floor(new Date(form.joinDeadline).getTime() / 1000);
      if (!Number.isFinite(ts) || ts <= Date.now() / 1000) errors.push("La fecha límite debe ser futura.");
      else joinDeadline = BigInt(ts);
    }

    return {
      errors,
      config: {
        members,
        contribution,
        collateral,
        periodDuration: form.periodDuration,
        periodsPerRound: ppr,
        gracePeriod: form.gracePeriod,
        joinDeadline,
      },
      invited: invited as `0x${string}`[],
    };
  }, [form]);

  if (!manager || !network) return null;

  const { config, invited, errors } = parsed;
  const pot = errors.length ? 0n : config.contribution * BigInt(config.members) * BigInt(config.periodsPerRound);
  const commit = commitOf(seed);

  // ------------------------------------------------------------------ acciones
  const seedText = `Tanda USDC - seed del sorteo\nRed: ${network.label} (${chainId})\nContrato: ${manager}\nCommit: ${commit}\nSeed: ${seed}\n`;

  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed);
      toast.success("Seed copiado");
    } catch {
      toast.error("No se pudo copiar. Selecciónalo y cópialo a mano.");
    }
  };
  const downloadSeed = () => {
    const url = URL.createObjectURL(new Blob([seedText], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `tanda-seed-${chainId}-${commit.slice(2, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const create = () =>
    tx.run("create", async () => {
      const receipt = await tx.send("Crear tanda", {
        address: manager,
        abi: TANDA_MANAGER_ABI,
        functionName: "createGroup",
        args: [config, invited, commit],
      });
      const [log] = parseEventLogs({ abi: TANDA_MANAGER_ABI, logs: receipt.logs, eventName: "GroupCreated" });
      if (log) {
        saveSeed(chainId, manager, log.args.groupId, seed);
        toast.success(`Tanda #${log.args.groupId.toString()} creada. Comparte el enlace para que se unan.`);
      }
      setSeed(newSeed());
      setSeedSaved(false);
    });

  const reveal = (g: TandaGroup) => {
    const value = (revealSeeds[g.id.toString()] ?? loadSeed(chainId, manager, g.id)).trim();
    if (!/^0x[0-9a-fA-F]{64}$/.test(value)) {
      toast.error("El seed debe ser 0x seguido de 64 caracteres hexadecimales.");
      return;
    }
    return tx.run(`reveal-${g.id}`, () =>
      tx.send("Sortear turnos", {
        address: manager,
        abi: TANDA_MANAGER_ABI,
        functionName: "revealAndStart",
        args: [g.id, value],
      }),
    );
  };

  const cancel = (g: TandaGroup) => {
    if (!window.confirm(`¿Cancelar la tanda #${g.id}? Todos podrán retirar su garantía.`)) return;
    return tx.run(`cancel-${g.id}`, () =>
      tx.send("Cancelar tanda", {
        address: manager,
        abi: TANDA_MANAGER_ABI,
        functionName: "cancelGroup",
        args: [g.id],
      }),
    );
  };

  const pending = groups.filter((g) => g.status === TandaStatus.Filled || g.status === TandaStatus.Open);
  const busy = tx.busy !== null;

  return (
    <Card variant="glow" className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <ShieldCheck className="w-5 h-5 text-primary" /> Panel de administrador
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Solo tu wallet ve esto. Puedes crear tandas, sortear turnos y cancelar tandas que no han empezado. No puedes
          mover fondos de los miembros.
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* ------------------------------------------------ tandas pendientes */}
        {pending.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-display font-semibold">Pendientes</h3>
            {pending.map((g) => (
              <div key={g.id.toString()} className="rounded-lg border p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Tanda #{g.id.toString()}</span>
                  <span className="text-muted-foreground">
                    {g.members.length}/{g.config.members} · {g.status === TandaStatus.Filled ? "lista para sortear" : "abierta"}
                  </span>
                </div>
                {g.status === TandaStatus.Filled && (
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <Input
                      className="font-mono text-xs"
                      placeholder="Seed (0x…)"
                      value={revealSeeds[g.id.toString()] ?? loadSeed(chainId, manager, g.id)}
                      onChange={(e) => setRevealSeeds((s) => ({ ...s, [g.id.toString()]: e.target.value }))}
                    />
                    <Button variant="gradient" onClick={() => reveal(g)} disabled={busy}>
                      {tx.busy === `reveal-${g.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
                      Sortear y arrancar
                    </Button>
                  </div>
                )}
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => cancel(g)} disabled={busy}>
                  {tx.busy === `cancel-${g.id}` && <Loader2 className="w-4 h-4 animate-spin" />} Cancelar tanda
                </Button>
              </div>
            ))}
          </section>
        )}

        {/* ------------------------------------------------ crear tanda */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-display font-semibold">Crear tanda en {network.label}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setForm(STANDARD)}>
                Estándar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setForm(QUICK_TEST)}>
                Prueba rápida
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="members">Personas</Label>
              <Input id="members" inputMode="numeric" value={form.members} onChange={(e) => set("members", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contribution">Aportación (USDC)</Label>
              <Input
                id="contribution"
                inputMode="decimal"
                value={form.contribution}
                onChange={(e) => set("contribution", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cada cuánto se paga</Label>
              <Select value={String(form.periodDuration)} onValueChange={(v) => set("periodDuration", Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p.seconds} value={String(p.seconds)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ppr">Pagos por cada cobro</Label>
              <Input
                id="ppr"
                inputMode="numeric"
                value={form.periodsPerRound}
                onChange={(e) => set("periodsPerRound", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collateral">Garantía (USDC)</Label>
              <Input
                id="collateral"
                inputMode="decimal"
                value={form.collateral}
                onChange={(e) => set("collateral", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Gracia para pagar</Label>
              <Select value={String(form.gracePeriod)} onValueChange={(v) => set("gracePeriod", Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRACES.map((p) => (
                    <SelectItem key={p.seconds} value={String(p.seconds)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="deadline">Fecha límite para llenarse (opcional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={form.joinDeadline}
                onChange={(e) => set("joinDeadline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="invited">Invitados (opcional, una wallet por línea)</Label>
              <Textarea
                id="invited"
                rows={3}
                className="font-mono text-xs"
                placeholder="Vacío = cualquiera puede entrar hasta llenarla"
                value={form.invited}
                onChange={(e) => set("invited", e.target.value)}
              />
            </div>
          </div>

          {errors.length > 0 ? (
            <ul className="text-sm text-destructive list-disc pl-5">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm rounded-lg bg-secondary/60 p-3">
              {config.members} personas pagan {usdc(config.contribution)} USDC {every(config.periodDuration)}.{" "}
              {capitalize(every(config.periodDuration * config.periodsPerRound))} una persona cobra {usdc(pot)} USDC.
              Dura {formatDuration(config.periodDuration * config.periodsPerRound * config.members)}. Garantía:{" "}
              {usdc(config.collateral)} USDC por persona.
            </p>
          )}

          {/* seed */}
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
            <p className="text-sm font-medium">Seed secreto del sorteo</p>
            <p className="text-xs text-muted-foreground">
              Lo necesitas para sortear cuando la tanda se llene. Este navegador lo recuerda, pero guarda tu copia: si lo
              pierdes y pasan 3 días, la tanda se cancela.
            </p>
            <code className="block text-[11px] break-all bg-background/70 rounded p-2">{seed}</code>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copySeed}>
                <Copy className="w-4 h-4" /> Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={downloadSeed}>
                <Download className="w-4 h-4" /> Descargar
              </Button>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={seedSaved} onCheckedChange={(v) => setSeedSaved(v === true)} />
              Ya guardé el seed
            </label>
          </div>

          <Button variant="gradient" className="w-full" onClick={create} disabled={busy || errors.length > 0 || !seedSaved}>
            {tx.busy === "create" && <Loader2 className="w-4 h-4 animate-spin" />} Crear tanda
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
