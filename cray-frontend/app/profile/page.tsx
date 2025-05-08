"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Users, Settings } from "lucide-react"

export default function ProfilePage() {
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
    email: "jane.smith@example.com",
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p>{userInfo.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p>{userInfo.email}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="created">
            <TabsList className="mb-4">
              <TabsTrigger value="created">Campaigns Created</TabsTrigger>
              <TabsTrigger value="registered">Campaigns Registered</TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="space-y-4">
              {userCampaigns.created.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
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
