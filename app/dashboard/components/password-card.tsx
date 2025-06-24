"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Copy, Share, MoreHorizontal, AlertTriangle, Edit, Trash } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordDetailsModal } from "@/components/password-details-modal"
import { SharePasswordModal } from "./share-password-modal"
import { supabase } from "@/lib/supabase"
import { decrypt } from "@/lib/utils"

interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  category: string
  updated_at: string
  is_expired: boolean
  url: string
}

interface PasswordCardProps {
  entry: PasswordEntry
  user: any // or your User type
  onEdit?: (entry: PasswordEntry) => void
  onDelete?: (id: string) => void
  onView?: (entry: PasswordEntry) => void
  onCopy?: (password: string) => void
}

export function PasswordCard({ entry, user, onEdit = () => {}, onDelete = () => {}, onView = () => {}, onCopy = () => {} }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [detailsEntry, setDetailsEntry] = useState<PasswordEntry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [entryToShare, setEntryToShare] = useState<PasswordEntry | null>(null)

  // console.log("Entry : ", entry);
  // console.log("PasswordCard received user :", user);

  const decryptedPassword = decrypt(entry.password)

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard`)
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Personal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Work: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Banking: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Entertainment: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      Social: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }

  const isExpired = (updated_at: string) => {
    const expiryDays = 90;
    const updated = new Date(updated_at);
    const now = new Date();
    return (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24) > expiryDays;
  };

  const handleView = (entry: PasswordEntry) => {
    setDetailsEntry(entry)
    setDetailsOpen(true)
  }

  const handleUpdate = async (updatedEntry: PasswordEntry) => {
    // Update in Supabase
    const { error } = await supabase
      .from('passwords')
      .update(updatedEntry)
      .eq('id', updatedEntry.id)
    if (!error) {
      toast.success("Password updated!")
    } else {
      toast.error("Failed to update password")
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('passwords').delete().eq('id', id);
    if (!error) {
      toast.success("Password deleted!")
    } else {
      toast.error("Failed to delete password")
    }
  }

  const handleShare = async (entry: PasswordEntry) => {
    // console.log("Current user in handleShare:", user);
    // window.alert("handleShare called");
    // debugger
    if (!user) {
      toast.error("You must be logged in to share a password.");
      return;
    }

    const recipient = prompt("Enter recipient's email address:");
    if (!recipient) return;

    const subject = `Sharing a password with you: ${entry.title}`;
    const text = `Hi,

        I'm sharing a password with you.

        Website: ${entry.url || 'N/A'}
        Username: ${entry.username}
        Password: ${entry.password}

        Please keep this information secure.

        Shared by: ${user.email}
        `;

      if (!user) { toast.error("Not logged in"); return; }
      const userEmail = user.email;
      const userId = user.id;

    // Log the share activity before sending to API
    try {
      const { data: activityData, error: activityError } = await supabase.from("user_activity").insert([
        {
          user_id: userId,
          activity_type: "password_shared",
          title: `Shared password '${entry.title}' with ${recipient}`,
          description: `Password shared via email to ${recipient}`,
          icon: "Share",
          color: "text-blue-500",
          created_at: new Date().toISOString(),
        },
      ]).select();

      if (activityError) {
        console.error("Failed to log activity:", activityError);
        toast.error("Failed to log activity: " + activityError.message);
      } else {
        console.log("Activity logged successfully:", activityData);
      }
    } catch (error) {
      console.error("Exception while logging activity:", error);
    }

    const res = await fetch("/api/share-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: recipient,
        subject,
        text,
        entry,
        shared_by_email: userEmail,
        shared_by_user_id: userId,
      }),
    });

    if (res.ok) {
      toast.success("Password sent via email!");
    } else {
      toast.error("Failed to send email.");
    }
  };

  const openShareModal = (entry: PasswordEntry) => {
    setEntryToShare(entry);
    setShareModalOpen(true);
  };

  // console.log("last updated", entry.updated_at);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{entry.title}</h3>
              {entry.is_expired && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{entry.username}</p>
          </div>
          <Badge className={getCategoryColor(entry.category)}>{entry.category}</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-2 font-mono text-sm">
              {showPassword ? decryptedPassword : "••••••••••••"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated {new Date(entry.updated_at).toLocaleString()}
              {entry.is_expired && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  Expired
                </Badge>
              )}
            </span>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(decryptedPassword, "Password")}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openShareModal(entry)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <Share className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(entry)}>
                    <Eye className="w-4 h-4 mr-2" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openShareModal(entry)}>
                    <Share className="w-4 h-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(entry)}>
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-600"
                  >
                    <Trash className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopy(entry.password)}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Password
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
      <PasswordDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        entry={detailsEntry}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onShare={handleShare}
      />
      <SharePasswordModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        entry={entryToShare}
        user={user}
      />
    </Card>
  )
}
