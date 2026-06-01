"use client"

import { Briefcase, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"

interface TaskerStatusCardProps {
  isTasker: boolean
  onCheckedChange: (checked: boolean) => void
}

export function TaskerStatusCard({ isTasker, onCheckedChange }: TaskerStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasker Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-600" />
              <p className="font-medium">Offer services as a tasker</p>
            </div>
            <p className="text-muted-foreground text-sm">
              {isTasker
                ? "You can now post requests AND bid on jobs. Your sidebar shows both sections."
                : "Enable this to start bidding on jobs and earning money in your community."}
            </p>
          </div>
          <Switch checked={isTasker} onCheckedChange={onCheckedChange} />
        </div>
        {isTasker && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard/tasker">
              <Button variant="outline" size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Tasker Dashboard
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/dashboard/user">
              <Button variant="outline" size="sm" className="gap-2">
                User Dashboard
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
