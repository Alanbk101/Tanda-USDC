import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, Users, Shield, Coins, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { MexicanEagle } from "@/components/MexicanEagle";
import { PaperEaglesBackground } from "@/components/PaperEaglesBackground";
import { useSettings } from "@/contexts/SettingsContext";
import { supabase } from "@/integrations/supabase/client";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("emailRequired"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(t("emailInvalid"));
      return;
    }
    if (trimmed.length > 255) {
      setError(t("emailTooLong"));
      return;
    }

    setLoading(true);
    const { error: dbError } = await supabase
      .from("waitlist")
      .insert({ email: trimmed });

    setLoading(false);

    if (dbError) {
      if (dbError.code === "23505") {
        setError(t("emailAlreadyRegistered") || "Este email ya está registrado.");
      } else {
        setError(t("genericError") || "Ocurrió un error. Intenta de nuevo.");
      }
      return;
    }

    setSubmitted(true);
  };

  const benefits = [
    { icon: Shield, labelKey: "secure" },
    { icon: Users, labelKey: "community" },
    { icon: Coins, labelKey: "noFees" },
  ];

  return (
    <div className="min-h-screen bg-background mexican-pattern flex flex-col">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <PaperEaglesBackground />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl relative z-10">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <MexicanEagle className="w-10 h-10 drop-shadow-md" />
            <span className="font-display font-bold text-xl bg-gradient-to-r from-mexican-green via-foreground to-mexican-red bg-clip-text text-transparent">
              Tanda USDC
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <Badge variant="outline" className="gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("comingSoon")}
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold gradient-text leading-tight">
              {t("joinTanda")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {t("waitlistHero")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            {benefits.map(({ icon: Icon, labelKey }, index) => (
              <div
                key={labelKey}
                className="flex flex-col items-center gap-2 animate-fade-in hover-scale"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{t(labelKey)}</span>
              </div>
            ))}
          </div>

          <Card variant="glow" className="animate-fade-in" style={{ animationDelay: "400ms" }}>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{t("waitlistTitle")}</CardTitle>
              <CardDescription>{t("waitlistDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center animate-scale-in">
                  <CheckCircle className="w-12 h-12 text-primary" />
                  <p className="font-semibold text-lg">{t("onTheList")}</p>
                  <p className="text-muted-foreground text-sm">{t("willNotify")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("emailLabel")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={255}
                      />
                    </div>
                    {error && <p className="text-sm text-destructive animate-fade-in">{error}</p>}
                  </div>
                  <Button type="submit" variant="gradient" className="w-full hover-scale" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("joinButton")}
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
