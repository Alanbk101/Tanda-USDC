import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "fr" | "el";

interface SettingsContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  testnetMode: boolean;
  setTestnetMode: (value: boolean) => void;
  language: Language;
  setLanguage: (value: Language) => void;
  watchWallet: string;
  setWatchWallet: (value: string) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "connectWallet": "Connect Wallet",
    // Settings
    "settings": "Settings",
    "globalSettings": "Global Settings",
    "darkMode": "Dark mode",
    "testnetMode": "Testnet mode",
    "language": "Language",
    "watchWallet": "Watch wallet",
    "watchWalletPlaceholder": "Enter wallet address...",
    "selectLanguage": "Select language",
    "english": "English",
    "spanish": "Spanish",
    "french": "French",
    "greek": "Greek",
    // Pool Stats
    "poolName": "Pool Name",
    "monthlyContribution": "Monthly Contribution",
    "totalPoolValue": "Total Pool Value",
    "currentMonth": "Current Month",
    "poolMembers": "Pool Members",
    "payoutRotation": "Payout Rotation",
    "contribute": "Contribute",
    "contributeNow": "Contribute Now",
    "month": "Month",
    "member": "Member",
    "amount": "Amount",
    "status": "Status",
    "paid": "Paid",
    "pending": "Pending",
    "current": "Current",
    "received": "Received",
    "contributionDue": "Contribution Due",
    // Member List
    "members": "Members",
    "wallet": "Wallet",
    "payoutMonth": "Payout Month",
    "paymentStatus": "Payment Status",
  },
  es: {
    // Header
    "connectWallet": "Conectar Billetera",
    // Settings
    "settings": "Configuración",
    "globalSettings": "Configuración Global",
    "darkMode": "Modo oscuro",
    "testnetMode": "Modo testnet",
    "language": "Idioma",
    "watchWallet": "Ver billetera",
    "watchWalletPlaceholder": "Ingrese dirección de billetera...",
    "selectLanguage": "Seleccionar idioma",
    "english": "Inglés",
    "spanish": "Español",
    "french": "Francés",
    "greek": "Griego",
    // Pool Stats
    "poolName": "Nombre del Pool",
    "monthlyContribution": "Contribución Mensual",
    "totalPoolValue": "Valor Total del Pool",
    "currentMonth": "Mes Actual",
    "poolMembers": "Miembros del Pool",
    "payoutRotation": "Rotación de Pagos",
    "contribute": "Contribuir",
    "contributeNow": "Contribuir Ahora",
    "month": "Mes",
    "member": "Miembro",
    "amount": "Monto",
    "status": "Estado",
    "paid": "Pagado",
    "pending": "Pendiente",
    "current": "Actual",
    "received": "Recibido",
    "contributionDue": "Contribución Pendiente",
    // Member List
    "members": "Miembros",
    "wallet": "Billetera",
    "payoutMonth": "Mes de Pago",
    "paymentStatus": "Estado de Pago",
  },
  fr: {
    // Header
    "connectWallet": "Connecter Portefeuille",
    // Settings
    "settings": "Paramètres",
    "globalSettings": "Paramètres Globaux",
    "darkMode": "Mode sombre",
    "testnetMode": "Mode testnet",
    "language": "Langue",
    "watchWallet": "Observer portefeuille",
    "watchWalletPlaceholder": "Entrez l'adresse du portefeuille...",
    "selectLanguage": "Sélectionner la langue",
    "english": "Anglais",
    "spanish": "Espagnol",
    "french": "Français",
    "greek": "Grec",
    // Pool Stats
    "poolName": "Nom du Pool",
    "monthlyContribution": "Contribution Mensuelle",
    "totalPoolValue": "Valeur Totale du Pool",
    "currentMonth": "Mois Actuel",
    "poolMembers": "Membres du Pool",
    "payoutRotation": "Rotation des Paiements",
    "contribute": "Contribuer",
    "contributeNow": "Contribuer Maintenant",
    "month": "Mois",
    "member": "Membre",
    "amount": "Montant",
    "status": "Statut",
    "paid": "Payé",
    "pending": "En attente",
    "current": "Actuel",
    "received": "Reçu",
    "contributionDue": "Contribution Due",
    // Member List
    "members": "Membres",
    "wallet": "Portefeuille",
    "payoutMonth": "Mois de Paiement",
    "paymentStatus": "Statut de Paiement",
  },
  el: {
    // Header
    "connectWallet": "Σύνδεση Πορτοφολιού",
    // Settings
    "settings": "Ρυθμίσεις",
    "globalSettings": "Γενικές Ρυθμίσεις",
    "darkMode": "Σκοτεινή λειτουργία",
    "testnetMode": "Λειτουργία testnet",
    "language": "Γλώσσα",
    "watchWallet": "Παρακολούθηση πορτοφολιού",
    "watchWalletPlaceholder": "Εισάγετε διεύθυνση πορτοφολιού...",
    "selectLanguage": "Επιλογή γλώσσας",
    "english": "Αγγλικά",
    "spanish": "Ισπανικά",
    "french": "Γαλλικά",
    "greek": "Ελληνικά",
    // Pool Stats
    "poolName": "Όνομα Pool",
    "monthlyContribution": "Μηνιαία Συνεισφορά",
    "totalPoolValue": "Συνολική Αξία Pool",
    "currentMonth": "Τρέχων Μήνας",
    "poolMembers": "Μέλη του Pool",
    "payoutRotation": "Εναλλαγή Πληρωμών",
    "contribute": "Συνεισφορά",
    "contributeNow": "Συνεισφέρετε Τώρα",
    "month": "Μήνας",
    "member": "Μέλος",
    "amount": "Ποσό",
    "status": "Κατάσταση",
    "paid": "Πληρωμένο",
    "pending": "Εκκρεμεί",
    "current": "Τρέχον",
    "received": "Λήφθηκε",
    "contributionDue": "Οφειλόμενη Συνεισφορά",
    // Member List
    "members": "Μέλη",
    "wallet": "Πορτοφόλι",
    "payoutMonth": "Μήνας Πληρωμής",
    "paymentStatus": "Κατάσταση Πληρωμής",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(true);
  const [testnetMode, setTestnetMode] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [watchWallet, setWatchWallet] = useState("");

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        setDarkMode,
        testnetMode,
        setTestnetMode,
        language,
        setLanguage,
        watchWallet,
        setWatchWallet,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
