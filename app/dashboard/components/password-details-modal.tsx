import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Copy, Edit, Trash, Share, AlertTriangle, Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  category: string
  updated_at: string
  is_expired: boolean
  url: string
  notes?: string
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
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PasswordEntry | null>(null)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (entry) setFormData(entry)
    setIsEditing(false)
  }, [entry, open])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryChange = (value: string) => {
    if (!formData) return
    setFormData({ ...formData, category: value })
  }

  const handleSave = async () => {
    if (!formData) return
    setLoading(true)
    try {
      await onUpdate(formData)
      setIsEditing(false)
    } finally {
      setLoading(false)
    }
  }

  if (!entry || !formData) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-slate-100 dark:border-slate-700">
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Password Details
            {entry.is_expired && (
              <Badge variant="destructive" className="ml-2 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Expired</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <form className="px-6 py-6 space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleFormChange} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" required />
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Banking">Banking</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">Username/Email</Label>
                <Input id="username" name="username" value={formData.username} onChange={handleFormChange} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" required />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
                <Input id="password" name="password" value={formData.password} onChange={handleFormChange} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="url" className="text-slate-700 dark:text-slate-300">Website</Label>
                <Input id="url" name="url" value={formData.url} onChange={handleFormChange} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">Notes</Label>
                <Textarea id="notes" name="notes" value={formData.notes} onChange={handleFormChange} className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 resize-none" rows={3} />
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</Button>
              <Button variant="default" type="submit" disabled={loading}>Save</Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-900/80 dark:to-slate-800/80">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Title</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">{entry.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</div>
                <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">{entry.category}</Badge>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Username/Email</div>
                <div className="font-mono text-slate-700 dark:text-slate-200 break-all">{entry.username}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Password</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700 dark:text-slate-200 select-all">{entry.password}</span>
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(entry.password)} className="text-slate-400 hover:text-blue-600">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Website</div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline break-all">{entry.url}</a>
                </div>
              </div>
              {entry.notes && (
                <div className="col-span-1 md:col-span-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</div>
                  <div className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{entry.notes}</div>
                </div>
              )}
              <div className="col-span-1 md:col-span-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Last Updated</div>
                <div className="text-slate-600 dark:text-slate-400">{new Date(entry.updated_at).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80">
              <Button variant="outline" onClick={onClose} className="min-w-[90px]">Close</Button>
              <Button variant="default" onClick={() => setIsEditing(true)} className="min-w-[90px] flex items-center gap-1"><Edit className="w-4 h-4" /> Edit</Button>
              <Button variant="destructive" onClick={() => onDelete(entry.id)} className="min-w-[90px] flex items-center gap-1"><Trash className="w-4 h-4" /> Delete</Button>
              <Button variant="secondary" onClick={() => onShare(entry)} className="min-w-[90px] flex items-center gap-1"><Share className="w-4 h-4" /> Share</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
