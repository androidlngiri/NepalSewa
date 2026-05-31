import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") || "NepalSewa"
  const description = searchParams.get("description") || "Butwal's trusted service marketplace"
  const type = searchParams.get("type") || "default"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0f172a 100%)",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -60,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.02)",
          }}
        />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.2)",
              background: "rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "white",
            }}
          >
            NS
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, color: "white" }}>NepalSewa</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {type !== "default" && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: "rgba(255,255,255,0.6)",
                textTransform: "uppercase",
                letterSpacing: 4,
                marginBottom: 12,
              }}
            >
              {type}
            </span>
          )}
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.2,
              maxWidth: 700,
              wordBreak: "break-word",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.7)",
              marginTop: 16,
              maxWidth: 600,
              lineHeight: 1.5,
            }}
          >
            {description}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 24,
          }}
        >
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>
            Post a task · Get quotes · Get it done
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
            nepal-sewa.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
