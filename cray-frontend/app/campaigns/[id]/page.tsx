"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, CheckCircle2, Users, Trophy } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CampaignCountdown from "@/components/campaign-countdown"
import { Confetti } from "@/components/confetti"

export default function CampaignPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const campaignId = Number.parseInt(params.id)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  // This would come from a database in a real application
  const campaign = {
    id: campaignId,
    title: campaignId === 2 ? "Product Feature Prioritization" : "Example Campaign",
    description: "Help us decide which features to prioritize in our next release.",
    startDate: "2025-05-10T00:00:00Z",
    endDate: "2025-05-20T00:00:00Z",
    status: campaignId === 2 ? "active" : campaignId === 3 ? "closed" : "upcoming",
    registeredVoters: 89,
    options: [
      { id: 1, text: "Improved Dashboard Analytics", votes: 32 },
      { id: 2, text: "Mobile App Integration", votes: 45 },
      { id: 3, text: "Advanced User Permissions", votes: 18 },
      { id: 4, text: "API Enhancements", votes: 27 },
    ],
    restrictions: ["age:21+"],
  }

  const totalVotes = campaign.options.reduce((sum, option) => sum + option.votes, 0)
  const winningOption =
    campaign.status === "closed"
      ? campaign.options.reduce((prev, current) => (prev.votes > current.votes ? prev : current))
      : null

  const handleVote = () => {
    if (!selectedOption) return
    // Here you would submit the vote to your backend
    setHasVoted(true)
  }

  const handleRegister = () => {
    // Here you would submit the registration to your backend
    setIsRegistered(true)
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

    if (campaign.status === "active" && !isRegistered) {
      return (
        <Alert className="mb-6">
          <Users className="h-4 w-4" />
          <AlertTitle>You're not registered for this campaign</AlertTitle>
          <AlertDescription>You need to register to participate in this vote</AlertDescription>
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
        <span>{campaign.registeredVoters} registered voters</span>

        {campaign.restrictions.length > 0 && (
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

      {getStatusContent()}

      {hasVoted && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Thank you for voting!</AlertTitle>
          <AlertDescription className="text-green-600">Your vote has been recorded successfully</AlertDescription>
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
            <RadioGroup
              value={selectedOption || ""}
              onValueChange={setSelectedOption}
              className="space-y-3"
              disabled={campaign.status !== "active" || !isRegistered}
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
          )}
        </CardContent>
        {campaign.status === "active" && (
          <CardFooter>
            {isRegistered ? (
              <Button onClick={handleVote} disabled={!selectedOption || hasVoted} className="w-full">
                {hasVoted ? "Vote Submitted" : "Submit Vote"}
              </Button>
            ) : (
              <Button onClick={handleRegister} className="w-full">
                Register for this Campaign
              </Button>
            )}
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
