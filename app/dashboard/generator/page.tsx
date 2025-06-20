"use client"

import { useState, useEffect } from "react"
import { Key, Copy, RefreshCw, Shield, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sidebar } from "../components/sidebar"
import { TopNavigation } from "../components/top-navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

const presetTemplates = [
  {
    name: "High Security",
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
  },
  {
    name: "Medium Security",
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  },
  { name: "Basic", length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false },
  {
    name: "PIN Code",
    length: 6,
    uppercase: false,
    lowercase: false,
    numbers: true,
    symbols: false,
    excludeSimilar: false,
  },
]

export default function PasswordGeneratorPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState("K9#mL2$vN8@pQ4wE6&rT3")
  const [length, setLength] = useState([16])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
  })
  const [customChars, setCustomChars] = useState("")
  const [excludeChars, setExcludeChars] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [expiredCount, setExpiredCount] = useState(0)
  const [passwordHistory, setPasswordHistory] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  useEffect(() => {
    const fetchPasswordHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('password_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setPasswordHistory(data.map(item => ({
          ...item,
          created: item.created_at ? new Date(item.created_at).toLocaleString() : '',
          strength: item.strength ?? 0,
        })));
      }
    };
    fetchPasswordHistory();
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(data || {});
    };
    fetchProfile();
  }, [user]);

  const generatePassword = async () => {
    let charset = ""

    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (options.numbers) charset += "0123456789"
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "")
    }

    if (options.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()/\\'"~,;<>.]/g, "")
    }

    if (customChars) {
      charset += customChars
    }

    if (excludeChars) {
      for (const char of excludeChars) {
        charset = charset.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "")
      }
    }

    let newPassword = ""
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(newPassword)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Not authenticated");
      return;
    }
    const strengthValue = calculateStrength(newPassword);
    const { data, error } = await supabase.from('password_history').insert([{
      user_id: user.id,
      password: newPassword,
      strength: strengthValue,
    }]).select().single();

    if (!error && data) {
      setPasswordHistory(prev => [
        {
          ...data,
          created: data.created_at ? new Date(data.created_at).toLocaleString() : '',
        },
        ...prev,
      ]);
    }

    await supabase.from('user_activity').insert([{
      user_id: user.id,
      activity_type: 'generated',
      title: 'Generated a new password',
      icon: 'Key',
      color: 'text-blue-500'
    }]);
    toast.success("New password generated!")
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    toast.success("Password copied to clipboard!")
  }

  const calculateStrength = (pwd: string) => {
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

  const getStrengthLabel = (strength: number) => {
    if (strength >= 90) return { label: "Excellent", color: "text-green-600 dark:text-green-400" }
    if (strength >= 70) return { label: "Strong", color: "text-blue-600 dark:text-blue-400" }
    if (strength >= 50) return { label: "Medium", color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Weak", color: "text-red-600 dark:text-red-400" }
  }

  const applyPreset = (preset: any) => {
    setLength([preset.length])
    setOptions({
      uppercase: preset.uppercase,
      lowercase: preset.lowercase,
      numbers: preset.numbers,
      symbols: preset.symbols,
      excludeSimilar: preset.excludeSimilar,
      excludeAmbiguous: false,
    })
    toast.success(`Applied ${preset.name} preset`)
  }

  const strength = calculateStrength(password)
  const strengthInfo = getStrengthLabel(strength)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <TopNavigation
            user={user}
            profile={profile}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            expiredCount={expiredCount}
          />

          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Password Generator</h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Generate secure, random passwords with customizable options
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Generator */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Key className="w-5 h-5 mr-2 text-blue-500" />
                        Generated Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Password Display */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-4 font-mono text-lg break-all">
                            {password}
                          </div>
                          <Button onClick={copyPassword} size="sm" className="shrink-0">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Strength Indicator */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Password Strength
                            </span>
                            <Badge className={`${strengthInfo.color} bg-transparent border-current`}>
                              {strengthInfo.label} ({strength}%)
                            </Badge>
                          </div>
                          <Progress value={strength} className="h-2" />
                        </div>

                        <Button
                          onClick={generatePassword}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate New Password
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Options */}
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Customization Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="basic" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="basic">Basic</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced</TabsTrigger>
                          <TabsTrigger value="presets">Presets</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-6">
                          {/* Length Slider */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Password Length</Label>
                              <Badge variant="secondary">{length[0]} characters</Badge>
                            </div>
                            <Slider
                              value={length}
                              onValueChange={setLength}
                              max={50}
                              min={4}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          {/* Character Options */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                              <Switch
                                id="uppercase"
                                checked={options.uppercase}
                                onCheckedChange={(checked) => setOptions({ ...options, uppercase: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                              <Switch
                                id="lowercase"
                                checked={options.lowercase}
                                onCheckedChange={(checked) => setOptions({ ...options, lowercase: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="numbers">Numbers (0-9)</Label>
                              <Switch
                                id="numbers"
                                checked={options.numbers}
                                onCheckedChange={(checked) => setOptions({ ...options, numbers: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="symbols">Symbols (!@#$)</Label>
                              <Switch
                                id="symbols"
                                checked={options.symbols}
                                onCheckedChange={(checked) => setOptions({ ...options, symbols: checked })}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="excludeSimilar">Exclude Similar Characters</Label>
                              <Switch
                                id="excludeSimilar"
                                checked={options.excludeSimilar}
                                onCheckedChange={(checked) => setOptions({ ...options, excludeSimilar: checked })}
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Excludes: i, l, 1, L, o, 0, O</p>

                            <div className="flex items-center justify-between">
                              <Label htmlFor="excludeAmbiguous">Exclude Ambiguous Characters</Label>
                              <Switch
                                id="excludeAmbiguous"
                                checked={options.excludeAmbiguous}
                                onCheckedChange={(checked) => setOptions({ ...options, excludeAmbiguous: checked })}
                              />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Excludes: {`{ } [ ] ( ) / \\ ' " ~ , ; < > .`}
                            </p>

                            <div className="space-y-2">
                              <Label htmlFor="customChars">Include Custom Characters</Label>
                              <Input
                                id="customChars"
                                placeholder="Enter custom characters"
                                value={customChars}
                                onChange={(e) => setCustomChars(e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="excludeChars">Exclude Specific Characters</Label>
                              <Input
                                id="excludeChars"
                                placeholder="Enter characters to exclude"
                                value={excludeChars}
                                onChange={(e) => setExcludeChars(e.target.value)}
                              />
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="presets" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {presetTemplates.map((preset, index) => (
                              <Card
                                key={index}
                                className="cursor-pointer hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700/50"
                                onClick={() => applyPreset(preset)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{preset.name}</h4>
                                    <Zap className="w-4 h-4 text-blue-500" />
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {preset.length} chars • {preset.uppercase ? "A-Z " : ""}
                                    {preset.lowercase ? "a-z " : ""}
                                    {preset.numbers ? "0-9 " : ""}
                                    {preset.symbols ? "!@# " : ""}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                {/* Password History */}
                <div className="space-y-6">
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-500" />
                        Recent Passwords
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {passwordHistory.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm truncate flex-1 mr-2">{item.password}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(item.password)
                                toast.success("Password copied!")
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400">{item.created}</span>
                            <Badge
                              variant="secondary"
                              className={`${getStrengthLabel(item.strength).color} bg-transparent border-current`}
                            >
                              {item.strength}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Quick Tips */}
                  <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                        Security Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Use at least 12 characters for strong passwords
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Include uppercase, lowercase, numbers, and symbols
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Avoid using personal information in passwords
                        </p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                        <p className="text-slate-600 dark:text-slate-400">Use unique passwords for each account</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
