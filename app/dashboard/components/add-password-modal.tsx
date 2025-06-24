"use client"

import { useState } from "react"
import { Eye, EyeOff, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { supabase } from '@/lib/supabase'
import { encrypt } from '@/lib/utils'

interface AddPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onPasswordAdded?: (password: any) => void
}

function calculateStrength(pwd: string) {
  let score = 0
  if (pwd.length >= 8) score += 20
  if (pwd.length >= 12) score += 10
  if (pwd.length >= 16) score += 10
  if (/[a-z]/.test(pwd)) score += 15
  if (/[A-Z]/.test(pwd)) score += 15
  if (/[0-9]/.test(pwd)) score += 15
  if (/[^A-Za-z0-9]/.test(pwd)) score += 15
  return Math.min(score, 100)
}

export function AddPasswordModal({ isOpen, onClose, onPasswordAdded }: AddPasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    category: "",
    notes: "",
  })
  const [passwordHistory, setPasswordHistory] = useState<any[]>([])

  const generatePassword = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
    toast.success("Strong password generated!")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Not authenticated")
      return
    }

    const strengthValue = calculateStrength(password)
    const { data, error } = await supabase.from('password_history').insert([{
      user_id: user.id,
      password: password,
      strength: strengthValue,
    }]).select().single()

    if (!error && data) {
      setPasswordHistory(prev => [
        {
          ...data,
          created: data.created_at ? new Date(data.created_at).toLocaleString() : '',
        },
        ...prev,
      ])
    }

    await supabase.from('user_activity').insert([{
      user_id: user.id,
      activity_type: 'generated',
      title: 'Generated a new password',
      icon: 'Key',
      color: 'text-blue-500'
    }])
  }

  const handleSave = async () => {
    if (!formData.title || !formData.username || !formData.password) {
      toast.error("Please fill in all required fields")
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Not authenticated")
      return
    }

    const category = formData.category || "Personal"
    const encryptedPassword = encrypt(formData.password)

    const { data, error } = await supabase
      .from('passwords')
      .insert([{ ...formData, password: encryptedPassword, category, user_id: user.id }])
      .select()
      .single()

    if (error) {
      toast.error("Failed to save password: " + error.message)
      return
    }

    toast.success("Password saved to vault!")
    if (onPasswordAdded) onPasswordAdded(data)
    onClose()
    setFormData({
      title: "",
      username: "",
      password: "",
      url: "",
      category: "",
      notes: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Add New Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
              Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Gmail Account"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
              Username/Email *
            </Label>
            <Input
              id="username"
              placeholder="Enter username or email"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
              Password *
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={generatePassword}
                className="border-slate-200 dark:border-slate-600"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-slate-700 dark:text-slate-300">
              Website URL
            </Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 resize-none"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-200 dark:border-slate-600">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            Save Password
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
