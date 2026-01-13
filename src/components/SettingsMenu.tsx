import { useState } from "react";
import { Settings, ChevronRight, ChevronLeft, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettings, Language } from "@/contexts/SettingsContext";

const languages: { code: Language; name: string; flag: string }[] = [
  { code: "en", name: "english", flag: "🇬🇧" },
  { code: "es", name: "spanish", flag: "🇪🇸" },
  { code: "fr", name: "french", flag: "🇫🇷" },
  { code: "el", name: "greek", flag: "🇬🇷" },
];

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const {
    darkMode,
    setDarkMode,
    testnetMode,
    setTestnetMode,
    language,
    setLanguage,
    watchWallet,
    setWatchWallet,
    t,
  } = useSettings();

  const currentLanguage = languages.find((l) => l.code === language);

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
    setShowLanguageSelector(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[380px] bg-background border-border">
        {showLanguageSelector ? (
          <>
            <SheetHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLanguageSelector(false)}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <SheetTitle className="text-lg font-semibold">
                  {t("selectLanguage")}
                </SheetTitle>
              </div>
            </SheetHeader>
            <div className="space-y-1 mt-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium">{t(lang.name)}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-mexican-green" />
                  )}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t("globalSettings")}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <span className="font-medium">{t("darkMode")}</span>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-mexican-green"
                />
              </div>

              {/* Testnet Mode */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🧪</span>
                  <span className="font-medium">{t("testnetMode")}</span>
                </div>
                <Switch
                  checked={testnetMode}
                  onCheckedChange={setTestnetMode}
                  className="data-[state=checked]:bg-mexican-green"
                />
              </div>

              {/* Language */}
              <button
                onClick={() => setShowLanguageSelector(true)}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span className="font-medium">{t("language")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{currentLanguage?.flag}</span>
                  <span className="text-sm">{t(currentLanguage?.name || "english")}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Watch Wallet */}
              <div className="py-3 px-4 rounded-lg bg-accent/50 space-y-3">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{t("watchWallet")}</span>
                </div>
                <Input
                  placeholder={t("watchWalletPlaceholder")}
                  value={watchWallet}
                  onChange={(e) => setWatchWallet(e.target.value)}
                  className="bg-background/50 border-border/50 font-mono text-sm"
                />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
