import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useTanda } from "@/hooks/useTanda";
import { useAccount } from "wagmi";
import { ConnectButton } from "@/components/ConnectButton";
import { PROTOCOL_CONSTANTS } from "@/config/contracts";
import { formatUnits } from "viem";
import {
  TrendingUp,
  Wallet,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";

export default function Dashboard() {
  const { t } = useSettings();
  const { address, isConnected } = useAccount();
  const {
    participantStatus,
    currentWeek,
    currentMonth,
    allowance,
    usdcBalance,
    approveUSDC,
    depositCurrentWeek,
    isApprovePending,
    isDepositPending,
    refetchStatus,
    refetchAllowance,
  } = useTanda();

  // Parsear datos del participante de forma segura
  const isActive = participantStatus?.[0] ?? false;
  const turn = participantStatus?.[1] ? Number(participantStatus[1]) : 0;
  const weeksPaid = participantStatus?.[2] ? Number(participantStatus[2]) : 0;
  const isBanned = participantStatus?.[4] ?? false;

  // Calcular progreso
  const totalWeeksRequired = turn * PROTOCOL_CONSTANTS.WEEKS_PER_MONTH;
  const progressPercentage = totalWeeksRequired > 0 ? (weeksPaid / totalWeeksRequired) * 100 : 0;

  // Verificar si necesita aprobar USDC
  const needsApproval = !allowance || allowance < BigInt(PROTOCOL_CONSTANTS.WEEKLY_PAYMENT);

  const handleApprove = async () => {
    try {
      await approveUSDC(BigInt(PROTOCOL_CONSTANTS.WEEKLY_PAYMENT * 100));
      setTimeout(() => {
        refetchAllowance();
      }, 2000);
    } catch (error) {
      console.error("Error al aprobar:", error);
    }
  };

  const handleDeposit = async () => {
    try {
      await depositCurrentWeek();
      setTimeout(() => {
        refetchStatus();
      }, 2000);
    } catch (error) {
      console.error("Error al depositar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background mexican-pattern">
      <Header selectedNetwork="base" onNetworkChange={() => {}} />
      
      <main className="container px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Conecta tu wallet"}
              </p>
            </div>
            <ConnectButton />
          </div>

          {!isConnected && (
            <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50 dark:bg-purple-950/20">
              <CardContent className="pt-6 text-center">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">Conecta tu Wallet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Conecta tu wallet para ver tu estado en la tanda
                </p>
              </CardContent>
            </Card>
          )}

          {isConnected && !isActive && (
            <Card className="border-2 border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-lg font-semibold mb-2">No eres participante</h3>
                <p className="text-sm text-muted-foreground">
                  Esta wallet no está registrada en la tanda actual
                </p>
              </CardContent>
            </Card>
          )}

          {isConnected && isBanned && (
            <Card className="border-2 border-red-300 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Cuenta Suspendida</h3>
                <p className="text-sm text-muted-foreground">
                  Tu cuenta ha sido suspendida
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {isConnected && isActive && !isBanned && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="glass-card hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tu Turno</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">#{turn}</div>
                  <p className="text-xs text-muted-foreground">
                    Mes {turn} de {PROTOCOL_CONSTANTS.TOTAL_MONTHS}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Semanas Pagadas</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{weeksPaid}</div>
                  <p className="text-xs text-muted-foreground">
                    de {totalWeeksRequired} requeridas
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Semana Actual</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentWeek + 1}</div>
                  <p className="text-xs text-muted-foreground">
                    Mes {currentMonth + 1}
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card hover:scale-105 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Balance USDC</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${usdcBalance ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2) : "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Acción Requerida
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Pago Semanal</p>
                    <p className="text-sm text-muted-foreground">
                      {PROTOCOL_CONSTANTS.WEEKLY_PAYMENT_FORMATTED} USDC por semana
                    </p>
                  </div>
                  <Badge variant={weeksPaid >= totalWeeksRequired ? "default" : "secondary"}>
                    {weeksPaid >= totalWeeksRequired ? "Al corriente" : "Pendiente"}
                  </Badge>
                </div>

                <Progress value={progressPercentage} className="h-2" />

                <div className="flex gap-3">
                  {needsApproval ? (
                    <Button 
                      onClick={handleApprove} 
                      disabled={isApprovePending}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500"
                    >
                      {isApprovePending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Aprobando...
                        </>
                      ) : (
                        "Aprobar USDC"
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDeposit} 
                      disabled={isDepositPending}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {isDepositPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Depositando...
                        </>
                      ) : (
                        `Depositar ${PROTOCOL_CONSTANTS.WEEKLY_PAYMENT_FORMATTED} USDC`
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Información del Grupo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Participantes</span>
                  <span className="font-semibold">{PROTOCOL_CONSTANTS.PARTICIPANTS_COUNT}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payout Mensual</span>
                  <span className="font-semibold">{PROTOCOL_CONSTANTS.GROUP_MONTHLY_PAYOUT_FORMATTED} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duración</span>
                  <span className="font-semibold">{PROTOCOL_CONSTANTS.TOTAL_MONTHS} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Red</span>
                  <Badge variant="outline">Base Sepolia</Badge>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
