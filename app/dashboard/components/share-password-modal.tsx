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
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    category: string;
    notes?: string;
  } | null;
  user: any;
}

export function SharePasswordModal({ open, onClose, entry, user }: SharePasswordModalProps) {
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSend = async () => {
    if (!recipient || !entry || !user) {
      toast.error("Missing required information to share.");
      return;
    }
    setStatus("sending");

    const subject = `Sharing a password with you: ${entry.title}`;

    const res = await fetch("/api/share-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        subject,
        entry,
        shared_by_email: user.email,
        shared_by_user_id: user.id,
      }),
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
      toast.error("Failed to share password. Please try again.");
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
