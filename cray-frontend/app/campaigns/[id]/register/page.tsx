"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { InfoIcon, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function CampaignRegistration({ params }: { params: { id: string } }) {
  const router = useRouter()
  const campaignId = Number.parseInt(params.id)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  // This would come from a database in a real application
  const campaign = {
    id: campaignId,
    title: "Product Feature Prioritization",
    description: "Help us decide which features to prioritize in our next release.",
    startDate: "2025-05-10T00:00:00Z",
    endDate: "2025-05-20T00:00:00Z",
    restrictions: [
      { type: "age", value: "21+" },
      { type: "country", value: "US,CA,UK" },
    ],
  }

  const handleRegister = async () => {
    setIsLoading(true)

    // Simulate registration request
    setTimeout(() => {
      setIsLoading(false)
      setIsRegistered(true)
    }, 1000)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push(`/campaigns/${campaignId}`)}>
        ← Back to campaign
      </Button>

      <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
      <p className="text-muted-foreground mb-6">{campaign.description}</p>

      {isRegistered ? (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Registration Successful!</AlertTitle>
          <AlertDescription className="text-green-600">
            You are now registered for this campaign and can vote when it opens.
            <div className="mt-4">
              <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>Return to Campaign</Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Register for this Campaign</CardTitle>
            <CardDescription>You must register to participate in this voting campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Campaign Requirements</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {campaign.restrictions.map((restriction, index) => (
                    <li key={index}>
                      {restriction.type === "age" && `You must be ${restriction.value} years or older`}
                      {restriction.type === "country" &&
                        `You must be located in one of these regions: ${restriction.value.replace(/,/g, ", ")}`}
                      {restriction.type === "whitelist" && "You must be on the pre-approved whitelist"}
                    </li>
                  ))}
                  <li>You must agree to the campaign terms and conditions</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {campaign.restrictions.some((r) => r.type === "age") && (
                <div className="space-y-2">
                  <Label htmlFor="age">Your Age</Label>
                  <Input id="age" type="number" min="13" placeholder="Enter your age" required />
                  <p className="text-xs text-muted-foreground">
                    This campaign requires you to be {campaign.restrictions.find((r) => r.type === "age")?.value} or
                    older
                  </p>
                </div>
              )}

              {campaign.restrictions.some((r) => r.type === "country") && (
                <div className="space-y-2">
                  <Label htmlFor="country">Your Country</Label>
                  <Select>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This campaign is only available in:{" "}
                    {campaign.restrictions.find((r) => r.type === "country")?.value.replace(/,/g, ", ")}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I confirm that I meet all the requirements and agree to the terms and conditions
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRegister} disabled={!acceptTerms || isLoading} className="w-full">
              {isLoading ? "Registering..." : "Register for Campaign"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
