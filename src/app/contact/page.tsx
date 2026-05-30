"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, MessageSquare, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/landing/Navbar"
import { Footer } from "@/components/landing/Footer"
import { toast } from "sonner"

const contactInfo = [
  { icon: MapPin, title: "Address", detail: "Butwal, Lumbini Province, Nepal" },
  { icon: Phone, title: "Phone", detail: "+977-98XXXXXXXX" },
  { icon: Mail, title: "Email", detail: "hello@nepalsewa.com.np" },
  { icon: MessageSquare, title: "Support Hours", detail: "Sun-Fri, 9AM-6PM" },
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = (formData.get("name") as string)?.trim()
    const email = (formData.get("email") as string)?.trim()
    const message = (formData.get("message") as string)?.trim()

    if (!name || !email || !message) {
      toast.error("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send message")
        return
      }

      toast.success("Message sent! We'll get back to you soon.")
      e.currentTarget.reset()
    } catch {
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-emerald-50 to-white py-16 lg:py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have a question, suggestion, or need help? We'd love to hear from you.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
                {contactInfo.map((item) => (
                  <Card key={item.title}>
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="lg:col-span-2">
                <CardContent className="p-8">
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" placeholder="Ram Sharma" required className="h-11" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="ram@example.com" required className="h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Tell us more..." rows={5} required />
                    </div>
                    <Button
                      type="submit"
                      className="h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
