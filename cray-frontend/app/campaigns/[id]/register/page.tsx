"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { InfoIcon, CheckCircle2, ShieldAlert, Copy, ClipboardCheck, Lock, Shield, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { campaignsService, Campaign } from "@/services/campaigns"
import { NoirUtils } from "@/lib/noir"

export default function CampaignRegistration({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const campaignId = Number.parseInt(params.id)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [registrationToken, setRegistrationToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true)

  // Registration flow states
  const [registrationStep, setRegistrationStep] = useState<"initial" | "restrictions" | "complete">("initial")
  const [age, setAge] = useState("")
  const [country, setCountry] = useState("")
  const [username, setUsername] = useState("")
  const [restrictionError, setRestrictionError] = useState<string | null>(null)

  useEffect(() => {
    loadCampaign()
  }, [campaignId])

  const loadCampaign = async () => {
    try {
      const data = await campaignsService.getCampaign(campaignId)
      setCampaign(data)

      // Check if campaign is active or closed
      const now = new Date()
      const startDate = new Date(data.startDate)

      if (now >= startDate) {
        // Redirect if campaign is already active or closed
        toast({
          title: "Registration Closed",
          description: "This campaign is already active or has ended. Registration is no longer available.",
          variant: "destructive",
        })
        router.push(`/campaigns/${campaignId}`)
      }

      // Check if already registered by looking in localStorage
      const registeredCampaigns = JSON.parse(localStorage.getItem('registeredCampaigns') || '[]')
      const existingRegistration = registeredCampaigns.find((reg: any) => reg.campaignId === campaignId)
      if (existingRegistration) {
        setRegistrationToken(existingRegistration.token)
        setIsRegistered(true)
        setRegistrationStep("complete")
      }
    } catch (error) {
      console.error("Error loading campaign:", error)
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      })
    } finally {
      setIsLoadingCampaign(false)
    }
  }

  const generateProofs = async () => {
    const proofs: any = {}

    if (campaign?.ageRestriction && age) {
      const ageProof = await NoirUtils.generateAgeProof(Number(age), campaign.ageRestriction)
      proofs.age_proof = ageProof.proof
    }

    if (campaign?.countryRestriction && country) {
      const countryProof = await NoirUtils.generateCountryProof(country, campaign.countryRestriction)
      proofs.country_proof = countryProof.proof
    }

    if (campaign?.whitelist && campaign.whitelist.length > 0 && username) {
      const whitelistProof = await NoirUtils.generateWhitelistProof(username, campaign.whitelist)
      proofs.whitelist_proof = whitelistProof.proof
    }

    return proofs
  }

  const handleRegister = async () => {
    if (registrationStep === "restrictions" && !validateRestrictions()) {
      return
    }

    setIsLoading(true)

    try {
      // Generate proofs for restrictions using Noir
      const proofs = await generateProofs()

      // Register with the backend
      const response = await campaignsService.registerForCampaign(campaignId, proofs)

      // Save registration token in localStorage
      const registeredCampaigns = JSON.parse(localStorage.getItem('registeredCampaigns') || '[]')
      const newRegistration = {
        campaignId,
        token: response.registrationKey,
        registeredAt: new Date().toISOString()
      }

      // Remove any existing registration for this campaign
      const filteredRegistrations = registeredCampaigns.filter((reg: any) => reg.campaignId !== campaignId)
      filteredRegistrations.push(newRegistration)
      
      localStorage.setItem('registeredCampaigns', JSON.stringify(filteredRegistrations))

      setRegistrationToken(response.registrationKey)
      setIsRegistered(true)
      setRegistrationStep("complete")

      toast({
        title: "Registration Successful",
        description: "You have been registered for this campaign.",
      })
    } catch (error: any) {
      console.error("Error registering for campaign:", error)
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Failed to register for the campaign. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (registrationToken) {
      navigator.clipboard.writeText(registrationToken)
      setCopied(true)
      toast({
        title: "Token Copied",
        description: "Registration token copied to clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoadingCampaign) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Campaign not found</AlertTitle>
          <AlertDescription>The campaign you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const hasRestrictions = Boolean(campaign?.restrictions?.length)

  const initiateRegistration = () => {
    if (hasRestrictions) {
      setRegistrationStep("restrictions")
    } else {
      handleRegister()
    }
  }

  const validateRestrictions = () => {
    if (!campaign.restrictions) return true

    // Check age restriction
    const ageRestriction = campaign.restrictions.find((r) => r.startsWith("age:"))
    if (ageRestriction) {
      const minAge = Number.parseInt(ageRestriction.split(":")[1].replace("+", ""))
      if (!age || Number.parseInt(age) < minAge) {
        setRestrictionError(`You must be at least ${minAge} years old to register for this campaign.`)
        return false
      }
    }

    // Check country restriction
    const countryRestriction = campaign.restrictions.find((r) => r.startsWith("country:"))
    if (countryRestriction) {
      const allowedCountries = countryRestriction.split(":")[1].split(",")
      if (!country || !allowedCountries.includes(country)) {
        setRestrictionError(`This campaign is only available in: ${allowedCountries.join(", ")}`)
        return false
      }
    }

    // Check whitelist restriction
    const whitelistRestriction = campaign.restrictions.find((r) => r === "whitelist:true")
    if (whitelistRestriction) {
      if (!username) {
        setRestrictionError("Please enter your username to verify whitelist eligibility.")
        return false
      }
    }

    setRestrictionError(null)
    return true
  }

  if (campaign.status !== "upcoming") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(`/campaigns/${campaignId}`)}>
          ← Back to campaign
        </Button>

        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Registration Closed</AlertTitle>
          <AlertDescription>
            This campaign is already active or has ended. Registration is no longer available.
            <div className="mt-4">
              <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>Return to Campaign</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push(`/campaigns/${campaignId}`)}>
        ← Back to campaign
      </Button>

      <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
      <p className="text-muted-foreground mb-6">{campaign.description}</p>

      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Shield className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Cray Private Voting Protocol</AlertTitle>
        <AlertDescription className="text-primary/80">
          Your registration information is used only to verify eligibility. Your identity will never be linked to your
          vote.
        </AlertDescription>
      </Alert>

      {registrationStep === "complete" && (
        <Card className="mb-6 border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <CardTitle className="text-green-700">Registration Successful!</CardTitle>
            </div>
            <CardDescription className="text-green-600">
              You are now registered for this campaign and can vote when it opens.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-1">
                  <h3 className="text-sm font-medium">Your Registration Token</h3>
                  <Lock className="h-4 w-4 ml-2 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  You'll need this token to vote when the campaign opens. It has been saved to your browser.
                </p>
                <div className="flex">
                  <Input value={registrationToken || ""} readOnly className="font-mono bg-muted" />
                  <Button variant="outline" size="icon" className="ml-2" onClick={copyToClipboard}>
                    {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Please save this token somewhere safe. You'll need it to vote when the campaign opens.
                </AlertDescription>
              </Alert>
              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Privacy Protection</AlertTitle>
                <AlertDescription className="text-primary/80">
                  This token allows you to vote anonymously. Your identity is never linked to your voting choice.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push(`/campaigns/${campaignId}`)} className="w-full">
              Return to Campaign
            </Button>
          </CardFooter>
        </Card>
      )}

      {registrationStep === "initial" && (
        <Card>
          <CardHeader>
            <CardTitle>Register to Vote</CardTitle>
            <CardDescription>
              Complete the registration process to participate in this campaign. Your information is used only to verify
              eligibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I understand that my vote will be anonymous and my identity will never be linked to my voting choice
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={initiateRegistration}
              disabled={!acceptTerms || isLoading}
            >
              {isLoading ? "Processing..." : "Continue Registration"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {registrationStep === "restrictions" && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Eligibility</CardTitle>
            <CardDescription>
              Please provide the following information to verify your eligibility for this campaign.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaign.restrictions?.find((r) => r.startsWith("age:")) && (
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                  />
                </div>
              )}

              {campaign.restrictions?.find((r) => r.startsWith("country:")) && (
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {campaign.restrictions?.find((r) => r === "whitelist:true") && (
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
              )}

              {restrictionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{restrictionError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Complete Registration"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
