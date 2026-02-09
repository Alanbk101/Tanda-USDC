import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, Users, Shield, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MexicanEagle } from "@/components/MexicanEagle";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (trimmed.length > 255) {
      setError("El correo es demasiado largo.");
      return;
    }

    // TODO: connect to backend to store email
    console.log("Waitlist signup:", trimmed);
    setSubmitted(true);
  };

  const benefits = [
    { icon: Shield, label: "Seguro" },
    { icon: Users, label: "Comunidad" },
    { icon: Coins, label: "Sin comisiones" },
  ];

  return (
    <div className="min-h-screen bg-background mexican-pattern flex flex-col">
      {/* Background effects — same as main platform */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl relative z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <MexicanEagle className="w-10 h-10 drop-shadow-md" />
            <span className="font-display font-bold text-xl bg-gradient-to-r from-mexican-green via-foreground to-mexican-red bg-clip-text text-transparent">
              Tanda USDC
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="outline" className="gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Próximamente
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold gradient-text leading-tight">
              Únete a la Tanda
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Ahorra en grupo con USDC. Sé de los primeros en acceder a la plataforma descentralizada de tandas.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {benefits.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 animate-fade-in hover-scale"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <Card variant="glow" className="animate-fade-in" style={{ animationDelay: "400ms" }}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Lista de espera</CardTitle>
              <CardDescription>
                Déjanos tu correo y te avisaremos cuando estemos listos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center animate-scale-in">
                  <CheckCircle className="w-12 h-12 text-primary" />
                  <p className="font-semibold text-lg">¡Estás en la lista!</p>
                  <p className="text-muted-foreground text-sm">
                    Te enviaremos un correo cuando sea tu turno.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@correo.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-destructive animate-fade-in">{error}</p>
                    )}
                  </div>
                  <Button type="submit" variant="gradient" className="w-full hover-scale" size="lg">
                    Quiero unirme
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
