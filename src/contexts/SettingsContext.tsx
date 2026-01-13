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
    "poolMembers": "Pool Members",
    "weeklyContribution": "Weekly Contribution",
    "monthlyPool": "Monthly Pool",
    "nextPayout": "Next Payout",
    "poolCycleProgress": "Pool Cycle Progress",
    "week": "Week",
    "of": "of",
    "weeksRemaining": "weeks remaining in this cycle",
    // Member List
    "members": "members",
    "payout": "Payout",
    "month": "Month",
    "paid": "Paid",
    "pending": "Pending",
    // Payout Schedule
    "payoutRotation": "Payout Rotation",
    "nextPayoutBadge": "Next Payout",
    "completed": "Completed",
    // Index page
    "poolActive": "Pool Active",
    "savingsPool": "Savings Pool",
    "poolDescription": "Join 10 members contributing 15 USDC weekly. Each month, one member receives the full pool of 600 USDC.",
    "stablecoinOnly": "Stablecoin Only",
    "stablecoinDesc": "USDC contributions for zero volatility",
    "onChainSecurity": "On-Chain Security",
    "onChainDesc": "Smart contract ensures fair payouts",
    "multiChain": "Multi-Chain",
    "multiChainDesc": "Support for Solana & EVM networks",
    "footerText": "Tanda USDC — Decentralized Rotating Savings",
    "contributeNow": "Contribute Now",
    "weeklyContributionTitle": "Weekly Contribution",
    "contributionComplete": "Contribution Complete!",
    "contributionRecorded": "Your contribution has been recorded on-chain.",
    "confirmContributionDesc": "Confirm your weekly contribution to the savings pool.",
    "amount": "Amount",
    "fromWallet": "From Wallet",
    "processingTransaction": "Processing transaction...",
    "transactionConfirmed": "Transaction Confirmed",
    "confirmContribution": "Confirm Contribution",
    "contributionSuccess": "Contribution successful!",
    "contributionSuccessDesc": "You have contributed {amount} USDC to the pool.",
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
    "poolMembers": "Miembros del Pool",
    "weeklyContribution": "Contribución Semanal",
    "monthlyPool": "Pool Mensual",
    "nextPayout": "Próximo Pago",
    "poolCycleProgress": "Progreso del Ciclo",
    "week": "Semana",
    "of": "de",
    "weeksRemaining": "semanas restantes en este ciclo",
    // Member List
    "members": "miembros",
    "payout": "Pago",
    "month": "Mes",
    "paid": "Pagado",
    "pending": "Pendiente",
    // Payout Schedule
    "payoutRotation": "Rotación de Pagos",
    "nextPayoutBadge": "Próximo Pago",
    "completed": "Completado",
    // Index page
    "poolActive": "Pool Activo",
    "savingsPool": "Pool de Ahorros",
    "poolDescription": "Únete a 10 miembros contribuyendo 15 USDC semanales. Cada mes, un miembro recibe el pool completo de 600 USDC.",
    "stablecoinOnly": "Solo Stablecoin",
    "stablecoinDesc": "Contribuciones en USDC sin volatilidad",
    "onChainSecurity": "Seguridad On-Chain",
    "onChainDesc": "Contrato inteligente garantiza pagos justos",
    "multiChain": "Multi-Cadena",
    "multiChainDesc": "Soporte para redes Solana y EVM",
    "footerText": "Tanda USDC — Ahorros Rotativos Descentralizados",
    "contributeNow": "Contribuir Ahora",
    "weeklyContributionTitle": "Contribución Semanal",
    "contributionComplete": "¡Contribución Completada!",
    "contributionRecorded": "Tu contribución ha sido registrada on-chain.",
    "confirmContributionDesc": "Confirma tu contribución semanal al pool de ahorros.",
    "amount": "Monto",
    "fromWallet": "Desde Billetera",
    "processingTransaction": "Procesando transacción...",
    "transactionConfirmed": "Transacción Confirmada",
    "confirmContribution": "Confirmar Contribución",
    "contributionSuccess": "¡Contribución exitosa!",
    "contributionSuccessDesc": "Has contribuido {amount} USDC al pool.",
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
    "poolMembers": "Membres du Pool",
    "weeklyContribution": "Contribution Hebdomadaire",
    "monthlyPool": "Pool Mensuel",
    "nextPayout": "Prochain Paiement",
    "poolCycleProgress": "Progression du Cycle",
    "week": "Semaine",
    "of": "sur",
    "weeksRemaining": "semaines restantes dans ce cycle",
    // Member List
    "members": "membres",
    "payout": "Paiement",
    "month": "Mois",
    "paid": "Payé",
    "pending": "En attente",
    // Payout Schedule
    "payoutRotation": "Rotation des Paiements",
    "nextPayoutBadge": "Prochain Paiement",
    "completed": "Terminé",
    // Index page
    "poolActive": "Pool Actif",
    "savingsPool": "Pool d'Épargne",
    "poolDescription": "Rejoignez 10 membres contribuant 15 USDC par semaine. Chaque mois, un membre reçoit le pool complet de 600 USDC.",
    "stablecoinOnly": "Stablecoin Uniquement",
    "stablecoinDesc": "Contributions en USDC sans volatilité",
    "onChainSecurity": "Sécurité On-Chain",
    "onChainDesc": "Contrat intelligent garantit des paiements équitables",
    "multiChain": "Multi-Chaîne",
    "multiChainDesc": "Support pour les réseaux Solana et EVM",
    "footerText": "Tanda USDC — Épargne Rotative Décentralisée",
    "contributeNow": "Contribuer Maintenant",
    "weeklyContributionTitle": "Contribution Hebdomadaire",
    "contributionComplete": "Contribution Terminée!",
    "contributionRecorded": "Votre contribution a été enregistrée on-chain.",
    "confirmContributionDesc": "Confirmez votre contribution hebdomadaire au pool d'épargne.",
    "amount": "Montant",
    "fromWallet": "Du Portefeuille",
    "processingTransaction": "Traitement de la transaction...",
    "transactionConfirmed": "Transaction Confirmée",
    "confirmContribution": "Confirmer la Contribution",
    "contributionSuccess": "Contribution réussie!",
    "contributionSuccessDesc": "Vous avez contribué {amount} USDC au pool.",
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
    "poolMembers": "Μέλη Pool",
    "weeklyContribution": "Εβδομαδιαία Συνεισφορά",
    "monthlyPool": "Μηνιαίο Pool",
    "nextPayout": "Επόμενη Πληρωμή",
    "poolCycleProgress": "Πρόοδος Κύκλου",
    "week": "Εβδομάδα",
    "of": "από",
    "weeksRemaining": "εβδομάδες απομένουν σε αυτόν τον κύκλο",
    // Member List
    "members": "μέλη",
    "payout": "Πληρωμή",
    "month": "Μήνας",
    "paid": "Πληρωμένο",
    "pending": "Εκκρεμεί",
    // Payout Schedule
    "payoutRotation": "Εναλλαγή Πληρωμών",
    "nextPayoutBadge": "Επόμενη Πληρωμή",
    "completed": "Ολοκληρώθηκε",
    // Index page
    "poolActive": "Pool Ενεργό",
    "savingsPool": "Pool Αποταμίευσης",
    "poolDescription": "Συμμετέχετε με 10 μέλη που συνεισφέρουν 15 USDC εβδομαδιαία. Κάθε μήνα, ένα μέλος λαμβάνει το πλήρες pool των 600 USDC.",
    "stablecoinOnly": "Μόνο Stablecoin",
    "stablecoinDesc": "Συνεισφορές σε USDC χωρίς μεταβλητότητα",
    "onChainSecurity": "Ασφάλεια On-Chain",
    "onChainDesc": "Το έξυπνο συμβόλαιο εξασφαλίζει δίκαιες πληρωμές",
    "multiChain": "Πολλαπλές Αλυσίδες",
    "multiChainDesc": "Υποστήριξη για δίκτυα Solana και EVM",
    "footerText": "Tanda USDC — Αποκεντρωμένη Περιστροφική Αποταμίευση",
    "contributeNow": "Συνεισφέρετε Τώρα",
    "weeklyContributionTitle": "Εβδομαδιαία Συνεισφορά",
    "contributionComplete": "Η Συνεισφορά Ολοκληρώθηκε!",
    "contributionRecorded": "Η συνεισφορά σας καταγράφηκε on-chain.",
    "confirmContributionDesc": "Επιβεβαιώστε την εβδομαδιαία συνεισφορά σας στο pool αποταμίευσης.",
    "amount": "Ποσό",
    "fromWallet": "Από Πορτοφόλι",
    "processingTransaction": "Επεξεργασία συναλλαγής...",
    "transactionConfirmed": "Η Συναλλαγή Επιβεβαιώθηκε",
    "confirmContribution": "Επιβεβαίωση Συνεισφοράς",
    "contributionSuccess": "Επιτυχής συνεισφορά!",
    "contributionSuccessDesc": "Συνεισφέρατε {amount} USDC στο pool.",
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
