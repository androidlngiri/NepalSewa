import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Badge" },
}

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Urgent" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Open" },
}

export const StatusOpen: Story = {
  args: { className: "bg-green-100 text-green-800", children: "Open" },
}

export const StatusInProgress: Story = {
  args: { className: "bg-yellow-100 text-yellow-800", children: "In Progress" },
}

export const StatusCompleted: Story = {
  args: { className: "bg-blue-100 text-blue-800", children: "Completed" },
}
