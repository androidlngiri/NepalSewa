import { prisma } from "./prisma"

export const SYSTEM_PROMPT = `You are NepalSewa — a friendly local service marketplace assistant for Butwal, Nepal.

NepalSewa connects customers with skilled local taskers. Users post requests, taskers bid with prices, users pick the best one. Payment via eSewa or cash. Commission: 5% standard, 3% PRO taskers.

8 service categories: Plumbing, Electrical, Painting, Cleaning, Moving/Delivery, Tech Support, Tutoring, Salon/Spa.

## CRITICAL RULES:
1. For greetings or general questions: answer directly. Do NOT call any tool.
2. When user wants a service or mentions booking: call find_and_book_service with ONLY query (no address). It returns matching services + login status.
3. If user is NOT logged in (tool returns isLoggedIn: false), show the services and tell them to log in: [Login](/auth/signin). Do NOT call find_and_book_service with address.
4. If user IS logged in AND has provided address: call find_and_book_service with query AND address/urgency/budget.
5. AFTER calling find_and_book_service, you MUST read the tool result carefully:
   - If tool result has "booked": true → confirm booking with the requestId and say "Track here: [View Request](/dashboard/user/requests)"
   - If tool result has "booked": false → tell the user the booking was NOT created and explain why (not logged in, no address, etc.)
   - NEVER say "your request has been posted" or "booking confirmed" unless the tool result literally says "booked": true
6. NEVER call find_and_book_service for greetings, questions, or non-service topics.

## Examples:

User: hello
Assistant: Namaste! I'm the NepalSewa assistant. How can I help you today?

User: how does bidding work?
Assistant: You post a request describing what you need. Taskers see it and send bids. You compare, check ratings, pick the best one!

User: I need a plumber
Assistant: [calls find_and_book_service(query="plumber")]
I found these plumbing services:
1. Pipe Repair Service — Rs 500/visit
2. Faucet Installation — Rs 300/piece
Where is the problem? I need your address to post the request.

User: deepnagar, normal, 1000
Assistant: [calls find_and_book_service(query="plumber", address="deepnagar", urgency="normal", budget=1000)]
Tool result: { booked: true, requestId: "abc123", serviceName: "Pipe Repair Service" }
Assistant: Your request for Pipe Repair Service has been posted! Taskers in your area will start bidding soon. Track here: [View Request](/dashboard/user/requests)

User: I want cleaning, near bus park, urgent
Assistant: [calls find_and_book_service(query="cleaning", address="near bus park", urgency="urgent")]
Tool result: { booked: false, isLoggedIn: false, services: [...] }
Assistant: I found cleaning services but you need to log in first to book: [Login](/auth/signin)

User: what is the weather?
Assistant: I can only help with NepalSewa services. Is there a service you need help with?

## Style:
- Reply in the same language the user writes in (English or Romanized Nepali)
- Be warm, like a local friend from Butwal
- Keep replies short — under 4 sentences
- When showing services, include price if available
- For login links: [Login](/auth/signin)
- For tracking links: [View Request](/dashboard/user/requests)
- Never invent numbers for tasker counts or completed jobs`

export const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "find_and_book_service",
      description:
        "Search for services AND optionally create a booking in one call. When called with only query, it returns matching services and the user's login status. When called with query AND address, it creates a booking request automatically (user must be logged in).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search keywords: 'plumber', 'cleaning', 'painting', 'tutor', etc.",
          },
          address: {
            type: "string",
            description:
              "User's address or location in Butwal. ONLY include if the user has provided it AND is logged in.",
          },
          urgency: {
            type: "string",
            enum: ["low", "normal", "urgent", "emergency"],
            description: "How urgent the job is (optional)",
          },
          budget: {
            type: "number",
            description: "Budget in NPR (optional)",
          },
        },
        required: ["query"],
      },
    },
  },
]

type Session = {
  user?: {
    id?: string
    name?: string | null
    role?: string
  }
} | null

interface ToolCall {
  id: string
  type: string
  function: {
    name: string
    arguments: string
  }
}

async function executeTool(name: string, argsStr: string, session: Session): Promise<any> {
  let args: any
  try {
    args = JSON.parse(argsStr)
  } catch {
    return { error: "Invalid arguments format" }
  }

  if (name === "find_and_book_service") {
    const query = args.query as string
    if (!query || !query.trim()) {
      return {
        services: [],
        isLoggedIn: !!session?.user?.id,
        userName: session?.user?.name,
      }
    }

    // Always search for matching services
    const results = await prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { category: { select: { name: true, slug: true } } },
      take: 5,
    })

    const services = results.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      price: s.price,
      priceUnit: s.priceUnit,
      category: s.category.name,
    }))

    // If address provided and user is logged in → create booking
    const address = args.address as string | undefined
    if (address && session?.user?.id) {
      if (results.length === 0) {
        return { services, isLoggedIn: true, booked: false, error: "No matching services found" }
      }
      const service = results[0]
      const request = await prisma.request.create({
        data: {
          userId: session.user.id,
          serviceId: service.id,
          title: `Need ${service.name.toLowerCase()} service`,
          description: `Booked via chatbot: ${query}`,
          location: address,
          budget: args.budget ? Number(args.budget) : null,
          urgency: args.urgency || "normal",
        },
      })
      return {
        services,
        isLoggedIn: true,
        booked: true,
        requestId: request.id,
        serviceName: service.name,
      }
    }

    // No address or not logged in → just return search results
    return {
      services,
      isLoggedIn: !!session?.user?.id,
      userName: session?.user?.name,
      booked: false,
    }
  }

  return { error: `Unknown tool: ${name}` }
}

export async function* chatLoop(
  initialMessages: any[],
  session: Session,
  apiKey: string,
): AsyncGenerator<string, void, unknown> {
  const API_URL = "https://openrouter.ai/api/v1/chat/completions"
  const messages = [...initialMessages]

  for (let turn = 0; turn < 5; turn++) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openrouter/owl-alpha",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.4,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("AI API error:", res.status, err)
      if (res.status === 429) {
        yield "I'm getting a lot of requests right now. Please wait a moment and try again."
      } else {
        yield "I'm sorry, I couldn't process that. Please try again."
      }
      return
    }

    const data = await res.json()
    const choice = data.choices?.[0]

    if (!choice) {
      yield "I'm sorry, I couldn't process that. Please try again."
      return
    }

    const { finish_reason, message } = choice

    if (finish_reason === "stop" && message?.content) {
      yield message.content
      return
    }

    if (finish_reason === "tool_calls" && message?.tool_calls) {
      messages.push(message)

      for (const tc of message.tool_calls as ToolCall[]) {
        const toolName = tc.function.name
        yield `__TOOL_START__:${toolName}`

        const result = await executeTool(toolName, tc.function.arguments, session)

        yield `__TOOL_END__:${toolName}`

        messages.push({
          role: "tool",
          tool_call_id: tc.id || `tool_${Date.now()}`,
          content: JSON.stringify(result),
        })
      }
      continue
    }

    if (message?.content) {
      yield message.content
      return
    }

    yield "I'm sorry, something went wrong. Please try again."
    return
  }

  yield "I'm sorry, that took too long. Please try again."
}
