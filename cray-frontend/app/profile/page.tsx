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
import { useAuth } from "@/contexts/AuthContext"
import { userService, UserProfile, UserCampaign } from "@/services/user"
import { campaignsService } from "@/services/campaigns"
import { toast } from "sonner"
import { getCampaignStatus, CampaignStatus } from "@/utils/campaignStatus"

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [createdCampaigns, setCreatedCampaigns] = useState<UserCampaign[]>([])
  const [registeredCampaigns, setRegisteredCampaigns] = useState<UserCampaign[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const loadProfileData = async () => {
      try {
        const [profileData, createdData] = await Promise.all([
          userService.getProfile(),
          userService.getCreatedCampaigns()
        ])
        setProfile(profileData)
        setCreatedCampaigns(createdData)

        // Get registered campaign IDs from localStorage
        const registeredCampaignIds = JSON.parse(localStorage.getItem('registeredCampaigns') || '[]')
        
        // Fetch full campaign details for each registered campaign
        const registeredCampaignsData = await Promise.all(
          registeredCampaignIds.map(async (id: number) => {
            try {
              return await campaignsService.getCampaign(id)
            } catch (error) {
              console.error(`Error fetching campaign ${id}:`, error)
              return null
            }
          })
        )

        // Filter out any failed campaign fetches and transform to UserCampaign format
        const validCampaigns = registeredCampaignsData
          .filter((campaign): campaign is NonNullable<typeof campaign> => campaign !== null)
          .map(campaign => ({
            id: campaign.id,
            title: campaign.title,
            description: campaign.description,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            status: campaign.status,
            registeredVoters: campaign.totalVotes
          }))

        setRegisteredCampaigns(validCampaigns)
      } catch (error) {
        console.error('Error loading profile data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [isAuthenticated])

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">Login Required</h3>
              <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
              <Button onClick={() => router.push("/auth/login")} className="mt-2">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>{isAuthenticated ? "Your personal information" : "User information"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p>{isAuthenticated ? profile?.name : "Anonymous"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                <p>{isAuthenticated ? `@${profile?.username}` : "Anonymous"}</p>
              </div>

              <Alert className="bg-primary/5 border-primary/20">
                <Shield className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Privacy Protected</AlertTitle>
                <AlertDescription className="text-primary/80">
                  Your identity is never linked to your votes. All voting activity remains private.
                </AlertDescription>
              </Alert>
            </CardContent>
            {isAuthenticated && (
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push("/profile/edit")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/profile/change-password")}>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
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
              {createdCampaigns.length > 0 ? (
                createdCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">You haven't created any campaigns yet.</p>
                      <Button onClick={() => router.push("/campaigns/create")}>
                        Create Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="registered" className="space-y-4">
              {registeredCampaigns.length > 0 ? (
                registeredCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center space-y-4">
                      <p className="text-muted-foreground">You haven't registered for any campaigns yet.</p>
                      <Button onClick={() => router.push("/campaigns")}>
                        Browse Campaigns
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: UserCampaign }) {
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

function StatusBadge({ status }: { status: CampaignStatus }) {
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
