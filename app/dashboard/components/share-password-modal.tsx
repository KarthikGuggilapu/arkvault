"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface SharePasswordModalProps {
  open: boolean;
  onClose: () => void;
  entry: {
    title: string;
    username: string;
    password: string;
    url: string;
  } | null;
}

export function SharePasswordModal({ open, onClose, entry }: SharePasswordModalProps) {
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSend = async () => {
    if (!recipient || !entry) return;
    setStatus("sending");

    const subject = `Sharing a password with you: ${entry.title}`;
    const text = `Hi,

I'm sharing a password with you.

Website: ${entry.url || "N/A"}
Username: ${entry.username}
Password: ${entry.password}

Please keep this information secure.

Best,
Your Name
`;

    const res = await fetch("/api/share-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: recipient, subject, text }),
    });

    if (res.ok) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setRecipient("");
        onClose();
      }, 1500);
    } else {
      setStatus("error");
      toast.error("Failed to send email.");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Password</DialogTitle>
        </DialogHeader>
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 animate-bounce" />
            <div className="mt-4 text-green-600 font-semibold">Email sent successfully!</div>
          </div>
        ) : (
          <>
            <div className="py-2">
              <Input
                type="email"
                placeholder="Recipient's email"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                disabled={status === "sending"}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose} disabled={status === "sending"}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={status === "sending" || !recipient}>
                {status === "sending" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
