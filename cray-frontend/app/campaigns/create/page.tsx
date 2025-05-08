"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function CreateCampaignPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [options, setOptions] = useState([
    { id: 1, text: "" },
    { id: 2, text: "" },
  ])

  // Restriction states
  const [ageRestriction, setAgeRestriction] = useState(false)
  const [minAge, setMinAge] = useState(18)
  const [countryRestriction, setCountryRestriction] = useState(false)
  const [countries, setCountries] = useState("")
  const [whitelist, setWhitelist] = useState(false)
  const [whitelistEmails, setWhitelistEmails] = useState("")

  const addOption = () => {
    const newId = options.length > 0 ? Math.max(...options.map((o) => o.id)) + 1 : 1
    setOptions([...options, { id: newId, text: "" }])
  }

  const removeOption = (id: number) => {
    if (options.length <= 2) return // Minimum 2 options
    setOptions(options.filter((option) => option.id !== id))
  }

  const updateOption = (id: number, text: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, text } : option)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Here you would submit the campaign data to your backend
    // For now, we'll just simulate a delay and redirect
    setTimeout(() => {
      setIsLoading(false)
      router.push("/")
    }, 1000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Create a New Campaign</h1>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>Provide the basic information about your voting campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input id="title" placeholder="Enter a descriptive title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Explain what this campaign is about and why people should vote"
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false) || date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voting Options</CardTitle>
            <CardDescription>Add the options that voters can choose from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(option.id)}
                  disabled={options.length <= 2}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
              <Plus className="h-4 w-4 mr-1" /> Add Option
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Voter Restrictions</CardTitle>
            <CardDescription>Set restrictions for who can register and vote in this campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="age-restriction">Age Restriction</Label>
                <p className="text-sm text-muted-foreground">Require voters to be a minimum age</p>
              </div>
              <Switch id="age-restriction" checked={ageRestriction} onCheckedChange={setAgeRestriction} />
            </div>

            {ageRestriction && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <Label htmlFor="min-age">Minimum Age</Label>
                <Input
                  id="min-age"
                  type="number"
                  min="13"
                  value={minAge}
                  onChange={(e) => setMinAge(Number.parseInt(e.target.value))}
                />
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="country-restriction">Country Restriction</Label>
                <p className="text-sm text-muted-foreground">Limit voting to specific countries</p>
              </div>
              <Switch id="country-restriction" checked={countryRestriction} onCheckedChange={setCountryRestriction} />
            </div>

            {countryRestriction && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <Label htmlFor="countries">Allowed Countries</Label>
                <Input
                  id="countries"
                  placeholder="US, CA, UK, etc."
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Enter country codes separated by commas</p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="whitelist">Whitelist Only</Label>
                <p className="text-sm text-muted-foreground">Only allow specific users to register</p>
              </div>
              <Switch id="whitelist" checked={whitelist} onCheckedChange={setWhitelist} />
            </div>

            {whitelist && (
              <div className="space-y-2 pl-6 border-l-2 border-muted">
                <Label htmlFor="whitelist-emails">Whitelisted Email Addresses</Label>
                <Textarea
                  id="whitelist-emails"
                  placeholder="Enter email addresses, one per line"
                  className="min-h-[100px]"
                  value={whitelistEmails}
                  onChange={(e) => setWhitelistEmails(e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Campaign"}
          </Button>
        </div>
      </form>
    </div>
  )
}
