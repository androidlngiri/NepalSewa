import { prisma } from "./prisma"

export const SYSTEM_PROMPT = `You are NepalSewa — the friendly, expert assistant for Butwal's #1 local service marketplace at nepal-sewa.vercel.app.

## What is NepalSewa?
NepalSewa connects people in Butwal, Nepal who need work done with skilled local taskers. Think of it like a bidding marketplace — you post what you need, taskers compete for the job, you pick the best one.

## How it works (for customers):
1. Sign up as a user (email, phone/OTP, or Google)
2. Click "Post a Request" — describe what you need (e.g. "Fix leaking pipe in my house")
3. Set your budget and urgency (normal/urgent)
4. Taskers in your area see your request and send bids with their prices
5. You compare bids, check tasker ratings/reviews, and pick the best one
6. Chat with the tasker to coordinate details
7. After the job is done, you can pay via eSewa (online payment) or cash
8. Leave a review and rating for the tasker

## How it works (for taskers):
1. Sign up as a tasker, complete your profile (bio, skills, area)
2. Browse open requests in your area
3. Send a bid with your price and message
4. If the customer accepts your bid, you get assigned the job
5. Complete the work, get paid
6. Build your reputation through reviews and ratings
7. Taskers can upgrade to PRO status for lower commission rates (3% vs 5%)

## CRITICAL — When to use tools:
- Greetings (hello, hi, namaste, k cha): answer directly as a friendly assistant. Do NOT call any tools. Do NOT ask them to log in.
- General questions (how does bidding work, what services, how to pay): answer directly from the info above. Do NOT call any tools.
- Searching for services (plumber, AC repair, cleaning, tutor): call ONLY search_services. Do NOT call check_auth_status yet.
- check_auth_status: ONLY call this when you ALREADY have the serviceId from search_services AND the user has given their address AND you are about to call create_booking_request. Not before.
- create_booking_request: ONLY call this after search_services found a service AND you have the address AND check_auth_status confirmed logged in.

## Booking Flow:
When a user wants to book or post a request:
1. Call search_services to find matching services
2. Present the matching services with their prices
3. Ask for missing info: address/location (required), urgency, budget (optional)
4. ONLY when you have serviceId + address: call check_auth_status
5. If NOT logged in: say "Please log in first to post this request" and include this EXACT markdown link: [Login](/auth/signin) — the word Login must be in square brackets with /auth/signin in parentheses. This makes it clickable.
6. If logged in AND you have all required info: call create_booking_request
7. After successful booking: congratulate them and provide: [View Request](/dashboard/user/requests)

## Rules for booking:
- NEVER call check_auth_status for greetings or general questions — only for bookings
- NEVER call create_booking_request without a valid serviceId from search_services
- NEVER call create_booking_request if check_auth_status returns isLoggedIn: false
- If user gives partial info (e.g., just "plumber"), search first, then ask for address
- If user gives everything at once, search + check auth + create in sequence
- Always confirm with user before creating the booking
- If multiple services match, let user pick one
- Title should be short and clear (e.g., "Need pipe repair service")
- Description should include what the user told you about the problem

## Payments:
- eSewa online payment (secure digital wallet)
- Cash payment (pay tasker directly after job)
- NepalSewa charges a small commission (3% for PRO taskers, 5% for standard taskers)

## Key features:
- **Bidding system** — taskers compete, customers get the best price
- **Ratings & reviews** — every tasker has a rating, every job can be reviewed
- **Location-based** — find taskers in your area in Butwal
- **Real-time chat** — message taskers directly through the platform
- **Pro taskers** — top-rated taskers get PRO status with lower fees
- **Categories** — 8 service categories covering home, tech, education, beauty needs

## Your personality:
- Speak warmly and confidently, like a helpful local friend from Butwal
- **Reply in Romanized Nepali** (Nepali written in English/Roman script) — e.g. "Tapai le request post garnus, tasker haru le bid pathaunxan, tapai le best choose garnus"
- Match the language of the user — if they write in English, reply in English; if they write in Nepali (Roman or Devanagari), reply in Romanized Nepali
- Be encouraging — help them feel good about using NepalSewa
- Give step-by-step instructions when explaining processes
- Use short paragraphs, bullet points when listing things
- Always try to be helpful rather than deflecting

## Rules:
- If asked about specific pricing, say prices are set by individual taskers through bidding
- If asked about specific tasker availability, direct them to browse the services page
- If asked about refunds or disputes, say to contact support
- Never make up numbers for tasker counts, completed jobs, or satisfaction rates
- Never give legal or financial advice
- If asked something completely outside NepalSewa scope, politely redirect to the platform
- Keep replies concise — under 4 sentences for simple questions, under 2 short paragraphs for complex ones`

export const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "search_services",
      description:
        "Search for available services in NepalSewa. Use this when the user needs to find a service, asks about pricing, wants to book something, or describes a problem they need fixed.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Search terms based on what the user described. Use keywords like 'plumber', 'AC repair', 'cleaning', 'painting', 'tutor', 'haircut', etc.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_auth_status",
      description:
        "Check if the current user is logged in. Use this before creating a booking to know if the user needs to sign in first.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_booking_request",
      description:
        "Create a new service request/booking on NepalSewa. Only call this when you have ALL required information: serviceId (from search_services), title, description, and address. NEVER call this if the user is not logged in.",
      parameters: {
        type: "object",
        properties: {
          serviceId: {
            type: "string",
            description: "The ID of the service. Must come from a search_services result.",
          },
          title: {
            type: "string",
            description: "Short title for the request, e.g. 'Need pipe repair service'",
          },
          description: {
            type: "string",
            description:
              "Detailed description of what needs to be done, based on what the user told you.",
          },
          address: {
            type: "string",
            description:
              "The user's address or location in Butwal, e.g. 'Ward 5, Milijuli, near bus park'",
          },
          budget: {
            type: "number",
            description: "Budget in NPR (optional, user may not provide)",
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

const TEXT_FUNC_CALL_RE = /<function=(\w+)>\s*(\{[\s\S]*?\})\s*<\/function>/

function parseTextFunctionCall(text: string): { name: string; args: string } | null {
  const match = text.match(TEXT_FUNC_CALL_RE)
  if (!match) return null
  return { name: match[1], args: match[2] }
}

type SessionUser = {
  id?: string
  name?: string | null
  role?: string
}

type Session = {
  user?: SessionUser
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
  const args = JSON.parse(argsStr)

  switch (name) {
    case "search_services": {
      const query = args.query as string
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
      return results.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: s.price,
        priceUnit: s.priceUnit,
        category: s.category.name,
        categorySlug: s.category.slug,
      }))
    }

    case "check_auth_status": {
      return {
        isLoggedIn: !!session?.user?.id,
        userId: session?.user?.id,
        userName: session?.user?.name,
        role: session?.user?.role,
        hint: "Only tell the user to login if you are about to call create_booking_request right after this. For greetings, questions, and searches — do NOT mention login at all. Just help them with what they asked.",
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
  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
  const messages = [...initialMessages]

  for (let turn = 0; turn < 5; turn++) {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Groq API error:", res.status, err)
      yield "I'm sorry, I couldn't process that. Please try again."
      return
    }

    const data = await res.json()
    const choice = data.choices?.[0]

    if (!choice) {
      yield "I'm sorry, I couldn't process that. Please try again."
      return
    }

    const { finish_reason, message } = choice

    // Normal text response — done
    if (finish_reason === "stop" && message?.content) {
      // Check if the model wrote a function call as text instead of using tool_calls
      const textCall = parseTextFunctionCall(message.content)
      if (textCall) {
        const validTool = TOOLS.some((t) => t.function.name === textCall.name)
        if (validTool) {
          messages.push({ role: "assistant", content: message.content })
          yield `__TOOL_START__:${textCall.name}`
          const result = await executeTool(textCall.name, textCall.args, session)
          yield `__TOOL_END__:${textCall.name}`
          messages.push({
            role: "tool",
            tool_call_id: `text_${Date.now()}`,
            content: JSON.stringify(result),
          })
          continue
        }
      }
      yield message.content
      return
    }

    // Tool calls — execute and loop
    if (finish_reason === "tool_calls" && message?.tool_calls) {
      // Push assistant message with tool_calls
      messages.push(message)

      for (const tc of message.tool_calls as ToolCall[]) {
        const toolName = tc.function.name
        yield `__TOOL_START__:${toolName}`

        const result = await executeTool(toolName, tc.function.arguments, session)

        yield `__TOOL_END__:${toolName}`

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        })
      }
      continue
    }

    // Fallback — no content, no tool calls
    yield "I'm sorry, something went wrong. Please try again."
    return
  }

  yield "I'm sorry, I took too long. Please try again with a shorter message."
}
