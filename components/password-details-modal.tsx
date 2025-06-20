import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

interface PasswordDetailsModalProps {
  open: boolean
  onClose: () => void
  entry: PasswordEntry | null
  onUpdate: (entry: PasswordEntry) => void
  onDelete: (id: string) => void
  onShare: (entry: PasswordEntry) => void
}

export function PasswordDetailsModal({ open, onClose, entry, onUpdate, onDelete, onShare }: PasswordDetailsModalProps) {
  if (!entry) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Password Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <div><strong>Title:</strong> {entry.title}</div>
          <div><strong>Username:</strong> {entry.username}</div>
          <div><strong>Password:</strong> {entry.password}</div>
          <div><strong>Category:</strong> {entry.category}</div>
          <div><strong>URL:</strong> {entry.url}</div>
          <div><strong>Last Updated:</strong> {new Date(entry.updated_at).toLocaleString()}</div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="default" onClick={() => onUpdate(entry)}>Edit</Button>
          <Button variant="destructive" onClick={() => onDelete(entry.id)}>Delete</Button>
          <Button variant="secondary" onClick={() => onShare(entry)}>Share</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 