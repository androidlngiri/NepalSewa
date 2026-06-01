import type { Meta, StoryObj } from "@storybook/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Service Request</CardTitle>
        <CardDescription>Plumbing repair needed</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Need a plumber to fix a leaking pipe in the kitchen. Urgent request.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  ),
}

export const ServiceCard: Story = {
  render: () => (
    <Card className="w-[300px] overflow-hidden">
      <div className="flex h-40 items-center justify-center bg-emerald-100 text-4xl">🔧</div>
      <CardHeader>
        <CardTitle>Home Services</CardTitle>
        <CardDescription>12 services available</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Professional plumbing, electrical, cleaning and more.
        </p>
      </CardContent>
    </Card>
  ),
}
