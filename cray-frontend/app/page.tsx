"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, VoteIcon, Shield, Lock } from "lucide-react"
import CampaignCountdown from "@/components/campaign-countdown"
import { campaignsService, Campaign } from "@/services/campaigns"
import { toast } from "sonner"

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const data = await campaignsService.listCampaigns()
      setCampaigns(data)
    } catch (error) {
      console.error("Error loading campaigns:", error)
      toast.error("Failed to load campaigns")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center">
            <h1 className="text-4xl font-bold">Cray</h1>
            <Badge variant="outline" className="ml-3 bg-primary/10 text-primary border-primary/20">
              <Lock className="h-3 w-3 mr-1" /> Private Voting Protocol
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Create and participate in secure, anonymous voting campaigns with privacy guarantees
          </p>
        </div>
        <Link href="/campaigns/create">
          <Button size="lg">Create Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Shield className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">Private by Design</CardTitle>
            </div>
            <CardDescription>
              Cray uses advanced cryptographic techniques to ensure your vote remains private and anonymous.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Lock className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">Secure Verification</CardTitle>
            </div>
            <CardDescription>
              Our token-based verification ensures only eligible voters can participate while maintaining anonymity.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center mb-2">
              <VoteIcon className="h-5 w-5 text-primary mr-2" />
              <CardTitle className="text-lg">Transparent Results</CardTitle>
            </div>
            <CardDescription>
              View accurate voting results without compromising individual voter privacy or anonymity.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Active Campaigns</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{campaign.title}</CardTitle>
                  <StatusBadge status={campaign.status} />
                </div>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <CampaignCountdown startDate={campaign.startDate} endDate={campaign.endDate} />
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{campaign.totalVotes} registered voters</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/campaigns/${campaign.id}`} className="w-full">
                  <Button variant={campaign.status === "active" ? "default" : "outline"} className="w-full">
                    {campaign.status === "active" ? (
                      <>
                        <VoteIcon className="mr-2 h-4 w-4" />
                        Vote Now
                      </>
                    ) : campaign.status === "upcoming" ? (
                      "Register to Vote"
                    ) : (
                      "View Results"
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
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
