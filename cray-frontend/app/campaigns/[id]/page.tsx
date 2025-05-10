"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, CheckCircle2, Users, Trophy, AlertCircle, Lock, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import CampaignCountdown from "@/components/campaign-countdown"
import { Confetti } from "@/components/confetti"
import { useToast } from "@/hooks/use-toast"
import { campaignsService, Campaign } from "@/services/campaigns"

export default function CampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const campaignId = Number.parseInt(params.id)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [registrationToken, setRegistrationToken] = useState("")
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCampaign()
  }, [campaignId])

  const loadCampaign = async () => {
    try {
      const data = await campaignsService.getCampaign(campaignId)
      setCampaign(data)
    } catch (error) {
      console.error("Error loading campaign:", error)
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (campaign?.status === "active") {
      const storedToken = localStorage.getItem(`campaign_token_${campaignId}`)
      if (storedToken) {
        setRegistrationToken(storedToken)
      }
    }
  }, [campaignId, campaign?.status])

  if (isLoading) {
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
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Campaign not found</AlertTitle>
          <AlertDescription>The campaign you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const totalVotes = campaign.options.reduce((sum, option) => sum + option.votes, 0)
  const winningOption =
    campaign.status === "closed"
      ? campaign.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
      : null

  const handleVote = async () => {
    if (!selectedOption || !registrationToken.trim()) {
      if (!registrationToken.trim()) {
        setTokenError("Please enter your registration token")
      }
      return
    }

    setIsValidating(true)
    setTokenError(null)

    try {
      await campaignsService.vote(campaignId, {
        optionId: Number(selectedOption),
        registrationToken
      })
      
      setHasVoted(true)
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded securely and anonymously.",
      })
    } catch (error) {
      console.error("Error submitting vote:", error)
      setTokenError("Invalid registration token. Please check and try again.")
    } finally {
      setIsValidating(false)
    }
  }

  const handleRegisterClick = () => {
    if (campaign.status === "upcoming") {
      router.push(`/campaigns/${campaignId}/register`)
    } else {
      toast({
        title: "Registration Closed",
        description: "This campaign is already active or has ended. Registration is no longer available.",
        variant: "destructive",
      })
    }
  }

  const getStatusContent = () => {
    if (campaign.status === "upcoming") {
      return (
        <Alert className="mb-6">
          <CalendarIcon className="h-4 w-4" />
          <AlertTitle>This campaign hasn't started yet</AlertTitle>
          <AlertDescription>
            Voting will be available from {new Date(campaign.startDate).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )
    }

    if (campaign.status === "active" && !hasVoted) {
      return (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Registration Token Required</AlertTitle>
          <AlertDescription>
            You need a registration token to vote in this campaign. If you registered earlier, your token will be used
            automatically.
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.push("/")}>
        ← Back to campaigns
      </Button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{campaign.title}</h1>
          <p className="text-muted-foreground mt-1">{campaign.description}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="mb-6">
        <CampaignCountdown startDate={campaign.startDate} endDate={campaign.endDate} />
      </div>

      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Users className="mr-2 h-4 w-4" />
        <span>{campaign.totalVotes} registered voters</span>

        {campaign.restrictions?.length > 0 && (
          <div className="flex ml-4 gap-1">
            {campaign.restrictions.map((restriction, index) => {
              const [type, value] = restriction.split(":")
              return (
                <Badge key={index} variant="outline" className="text-xs">
                  {type === "age" && `Age ${value}`}
                  {type === "country" && `Region: ${value.replace(/,/g, ", ")}`}
                  {type === "whitelist" && "Whitelist only"}
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      <Alert className="mb-6 bg-primary/5 border-primary/20">
        <Shield className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Private Voting Protocol</AlertTitle>
        <AlertDescription className="text-primary/80">
          Cray ensures your vote remains anonymous. Your identity is never linked to your voting choice.
        </AlertDescription>
      </Alert>

      {getStatusContent()}

      {hasVoted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Thank you for voting!</AlertTitle>
          <AlertDescription className="text-green-600">
            Your vote has been recorded securely and anonymously
          </AlertDescription>
        </Alert>
      )}

      {campaign.status === "closed" && winningOption && <Confetti />}

      <Card>
        <CardHeader>
          <CardTitle>{campaign.status === "closed" ? "Results" : "Cast Your Vote"}</CardTitle>
          <CardDescription>
            {campaign.status === "closed"
              ? "The voting period has ended. Here are the final results."
              : "Select one option below to cast your vote"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaign.status === "closed" || hasVoted ? (
            <div className="space-y-6">
              {campaign.options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                const isWinner = winningOption && option.id === winningOption.id

                return (
                  <div key={option.id} className={`space-y-2 ${isWinner ? "relative" : ""}`}>
                    <div className="flex justify-between">
                      <div className="font-medium flex items-center">
                        {isWinner && <Trophy className="h-4 w-4 text-yellow-500 mr-2" />}
                        <span className={isWinner ? "font-bold" : ""}>{option.text}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {percentage}% ({option.votes} votes)
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-2 ${isWinner ? "bg-muted" : ""}`}
                      indicatorClassName={isWinner ? "bg-yellow-500" : undefined}
                    />
                    {isWinner && campaign.status === "closed" && (
                      <div className="absolute -right-2 -top-2">
                        <Badge className="bg-yellow-500">Winner</Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-6">
              <RadioGroup
                value={selectedOption || ""}
                onValueChange={setSelectedOption}
                className="space-y-3"
                disabled={campaign.status !== "active"}
              >
                {campaign.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer py-2">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {campaign.status === "active" && !hasVoted && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token">Registration Token</Label>
                    <Input
                      id="token"
                      value={registrationToken}
                      onChange={(e) => setRegistrationToken(e.target.value)}
                      placeholder="Enter your registration token"
                      className={tokenError ? "border-red-500" : ""}
                    />
                    {tokenError && <p className="text-sm text-red-500 mt-1">{tokenError}</p>}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleVote}
                    disabled={!selectedOption || isValidating}
                  >
                    {isValidating ? "Validating..." : "Submit Vote"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
        {campaign.status === "upcoming" && (
          <CardFooter>
            <Button className="w-full" onClick={handleRegisterClick}>
              Register to Vote
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
  } else if (status === "upcoming") {
    return (
      <Badge variant="outline" className="text-blue-500 border-blue-500">
        Upcoming
      </Badge>
    )
  } else {
    return <Badge variant="secondary">Closed</Badge>
  }
}
