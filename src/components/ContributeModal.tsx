import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Wallet, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

interface ContributeModalProps {
  amount: number;
  network: string;
}

export function ContributeModal({ amount, network }: ContributeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "processing" | "success">("confirm");

  const handleContribute = async () => {
    setStep("processing");
    
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setStep("success");
    toast.success("Contribution successful!", {
      description: `You have contributed ${amount} USDC to the pool.`,
    });
    
    setTimeout(() => {
      setIsOpen(false);
      setStep("confirm");
    }, 1500);
  };

  const networkName = network.charAt(0).toUpperCase() + network.slice(1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" size="lg" className="gap-2">
          <Coins className="w-5 h-5" />
          Contribute Now
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {step === "success" ? "Contribution Complete!" : "Weekly Contribution"}
          </DialogTitle>
          <DialogDescription>
            {step === "success" 
              ? "Your contribution has been recorded on-chain."
              : "Confirm your weekly contribution to the savings pool."}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-usdc/20">
                  <Coins className="w-5 h-5 text-usdc" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-display font-bold text-xl">{amount} USDC</p>
                </div>
              </div>
              <Badge variant="solana">{networkName}</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From Wallet</p>
                  <p className="font-mono text-sm">0x7a3d...8f2e</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Processing transaction...</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-emerald-400 font-medium">Transaction Confirmed</p>
          </div>
        )}

        <DialogFooter>
          {step === "confirm" && (
            <Button onClick={handleContribute} variant="gradient" className="w-full gap-2">
              Confirm Contribution
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
