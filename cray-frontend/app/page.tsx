import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, VoteIcon } from "lucide-react"
import CampaignCountdown from "@/components/campaign-countdown"

export default function Home() {
  // This would come from a database in a real application
  const campaigns = [
    {
      id: 1,
      title: "Company Board Election 2025",
      description: "Vote for the new board members for the upcoming fiscal year.",
      startDate: "2025-06-01T00:00:00Z",
      endDate: "2025-06-15T00:00:00Z",
      status: "upcoming",
      registeredVoters: 124,
      restrictions: ["age:18+", "country:US,CA,UK", "whitelist:true"],
    },
    {
      id: 2,
      title: "Product Feature Prioritization",
      description: "Help us decide which features to prioritize in our next release.",
      startDate: "2025-05-10T00:00:00Z",
      endDate: "2025-05-20T00:00:00Z",
      status: "active",
      registeredVoters: 89,
      restrictions: ["age:21+"],
    },
    {
      id: 3,
      title: "Annual Budget Allocation",
      description: "Vote on how to allocate the annual budget across departments.",
      startDate: "2025-04-15T00:00:00Z",
      endDate: "2025-04-30T00:00:00Z",
      status: "closed",
      registeredVoters: 156,
      restrictions: ["whitelist:true"],
    },
  ]

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">VoteSphere</h1>
          <p className="text-muted-foreground mt-2">Create and participate in secure voting campaigns</p>
        </div>
        <Link href="/campaigns/create">
          <Button size="lg">Create Campaign</Button>
        </Link>
      </div>

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
                <span>{campaign.registeredVoters} registered voters</span>
              </div>
              {campaign.restrictions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
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
