import { prisma } from "./prisma"

export const SYSTEM_PROMPT = `You are NepalSewa — a friendly local service marketplace assistant for Butwal, Nepal.

NepalSewa connects customers with skilled local taskers. Users post requests, taskers bid with prices, users pick the best one. Payment via eSewa or cash. Commission: 5% standard, 3% PRO taskers.

8 service categories: Plumbing, Electrical, Painting, Cleaning, Moving/Delivery, Tech Support, Tutoring, Salon/Spa.

## When to use tools:
- Greetings or general questions: answer directly. No tools.
- User wants a service or mentions booking: call search_services.
- User is ready to book (has service + address): call create_booking_request.

## Examples of correct behavior:

User: hello
Assistant: Namaste! I'm the NepalSewa assistant. How can I help you today?

User: how does bidding work?
Assistant: You post a request describing what you need. Taskers in your area see it and send bids with their prices. You compare bids, check ratings, and pick the best one. Simple!

User: I need a plumber
Assistant: [calls search_services("plumber")]
I found these plumbing services:
1. Pipe Repair Service — Rs 500/visit
2. Faucet Installation — Rs 300/piece
Where is the problem? I need your address to post the request.

User: can you book service?
Assistant: Of course! What kind of service do you need? For example: Plumbing, Electrical, Cleaning, Tutoring, Salon, and more. Just tell me what you need done.

User: book a plumber at Ward 5, Milijuli
Assistant: [calls search_services("plumber")]
Found: Pipe Repair Service (Rs 500/visit). You are not logged in. Please log in first: [Login](/auth/signin)

User: I want cleaning service, near bus park, normal urgency
Assistant: [calls search_services("cleaning")]
Found: Deep Cleaning (Rs 400/session). You are not logged in. Please log in first: [Login](/auth/signin)

User: how much for painting?
Assistant: [calls search_services("painting")]
Painting services are available. Final price depends on what taskers bid. Want me to help you post a request?

User: what is the weather?
Assistant: I can only help with NepalSewa services. Is there a service you need help with?

## Rules:
- Reply in the same language the user writes in (English or Romanized Nepali)
- Be warm and helpful, like a local friend from Butwal
- Keep replies short — under 4 sentences for simple questions
- When showing services, always include price if available
- When the user wants to book, ask for address (required), urgency, and budget (optional)
- For login links use exactly: [Login](/auth/signin)
- For tracking links use exactly: [View Request](/dashboard/user/requests)
- Never make up numbers for tasker counts or completed jobs`

export const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_services",
      description:
        "Search for available services. Call this when the user wants to find, book, or ask about a service. Returns matching services with prices and the user's login status.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search keywords based on what the user needs, e.g. 'plumber', 'cleaning', 'painting', 'tutor'",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_booking_request",
      description:
        "Create a service request on NepalSewa. Only call this when you have ALL required info: a valid serviceId from search_services, a title, a description, and the user's address. The user MUST be logged in.",
      parameters: {
        type: "object",
        properties: {
          serviceId: {
            type: "string",
            description: "The service ID from search_services results",
          },
          title: {
            type: "string",
            description: "Short title, e.g. 'Need pipe repair service'",
          },
          description: {
            type: "string",
            description: "What the user told you about the problem",
          },
          address: {
            type: "string",
            description: "The user's address or location in Butwal",
          },
          budget: {
            type: "number",
            description: "Budget in NPR (optional)",
          },
          urgency: {
            type: "string",
            enum: ["low", "normal", "urgent", "emergency"],
            description: "How urgent the job is",
          },
        },
        required: ["serviceId", "title", "description", "address"],
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

  switch (name) {
    case "search_services": {
      const query = args.query as string
      if (!query || !query.trim()) {
        return {
          services: [],
          isLoggedIn: !!session?.user?.id,
          userName: session?.user?.name,
        }
      }
      const results = await prisma.service.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          category: { select: { name: true, slug: true } },
        },
        take: 5,
      })
      return {
        services: results.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          priceUnit: s.priceUnit,
          category: s.category.name,
        })),
        isLoggedIn: !!session?.user?.id,
        userName: session?.user?.name,
      }
    }

    case "create_booking_request": {
      if (!session?.user?.id) {
        return { success: false, error: "User not logged in" }
      }

      const service = await prisma.service.findUnique({
        where: { id: args.serviceId },
      })
      if (!service) {
        return { success: false, error: "Service not found" }
      }

      const request = await prisma.request.create({
        data: {
          userId: session.user.id,
          serviceId: args.serviceId,
          title: args.title,
          description: args.description,
          location: args.address,
          budget: args.budget ? Number(args.budget) : null,
          urgency: args.urgency || "normal",
        },
      })

      return { success: true, requestId: request.id }
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export async function* chatLoop(
  initialMessages: any[],
  session: Session,
  apiKey: string,
): AsyncGenerator<string, void, unknown> {
  const API_URL = "https://openrouter.ai/api/v1/chat/completions"
  const messages = [...initialMessages]

  for (let turn = 0; turn < 3; turn++) {
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

  yield "I'm sorry, that took too long. Please try with a shorter message."
}
