"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, Settings, Shield, LogIn, Lock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate checking login status
  useEffect(() => {
    // In a real app, you would check if the user is logged in
    // For demo purposes, we'll use localStorage
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)
    setIsLoading(false)
  }, [])

  // This would come from a database in a real application
  const userCampaigns = {
    created: [
      {
        id: 1,
        title: "Company Board Election 2025",
        description: "Vote for the new board members for the upcoming fiscal year.",
        startDate: "2025-06-01T00:00:00Z",
        endDate: "2025-06-15T00:00:00Z",
        status: "upcoming",
        registeredVoters: 124,
      },
      {
        id: 3,
        title: "Annual Budget Allocation",
        description: "Vote on how to allocate the annual budget across departments.",
        startDate: "2025-04-15T00:00:00Z",
        endDate: "2025-04-30T00:00:00Z",
        status: "closed",
        registeredVoters: 156,
      },
    ],
    registered: [
      {
        id: 2,
        title: "Product Feature Prioritization",
        description: "Help us decide which features to prioritize in our next release.",
        startDate: "2025-05-10T00:00:00Z",
        endDate: "2025-05-20T00:00:00Z",
        status: "active",
        registeredVoters: 89,
      },
    ],
  }

  const userInfo = {
    name: "Jane Smith",
    username: "janesmith",
  }

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>{isLoggedIn ? "Your personal information" : "User information"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p>{isLoggedIn ? userInfo.name : "Anonymous"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p>{isLoggedIn ? `@${userInfo.username}` : "Anonymous"}</p>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Privacy Protected</AlertTitle>
                <AlertDescription className="text-primary/80">
                  Your identity is never linked to your votes. All voting activity remains private.
                </AlertDescription>
              </Alert>
            </CardContent>
            {isLoggedIn && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/profile/edit")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="created">
            <TabsList className="mb-4">
              <TabsTrigger value="created">Campaigns Created</TabsTrigger>
              <TabsTrigger value="registered">Campaigns Registered</TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="space-y-4">
              {isLoggedIn ? (
                userCampaigns.created.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                      <h3 className="text-lg font-medium">Login Required</h3>
                      <p className="text-muted-foreground">You need to be logged in to view your created campaigns.</p>
                      <Button onClick={() => router.push("/auth/login")} className="mt-2">
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="registered" className="space-y-4">
              {userCampaigns.registered.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{campaign.title}</CardTitle>
          <StatusBadge status={campaign.status} />
        </div>
        <CardDescription>{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{campaign.registeredVoters} registered voters</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/campaigns/${campaign.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Campaign
          </Button>
        </Link>
      </CardFooter>
    </Card>
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
