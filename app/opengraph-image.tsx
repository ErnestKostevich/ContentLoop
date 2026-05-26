import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";
export const alt = "ContentLoop — turn one post into ten";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Aurora glow blobs */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            left: "-150px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0) 65%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            right: "-150px",
            width: "700px",
            height: "700px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.45) 0%, rgba(236,72,153,0) 65%)",
            display: "flex",
          }}
        />

        {/* Top: brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, #6366f1 0%, #a855f7 55%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 40px rgba(236,72,153,0.35)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 44 18 A 14 14 0 1 0 44 46"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 38 12 L 44 18 L 38 24"
                fill="none"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "44px",
              fontWeight: 600,
              color: "#ededed",
              letterSpacing: "-0.02em",
            }}
          >
            ContentLoop
          </span>
        </div>

        {/* Middle: headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "92px",
              fontWeight: 600,
              color: "#fafafa",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: "24px",
            }}
          >
            Turn one post
          </span>
          <span
            style={{
              fontSize: "92px",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              backgroundImage:
                "linear-gradient(90deg, #a5b4fc 0%, #f0abfc 50%, #fda4af 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            into ten.
          </span>
        </div>

        {/* Bottom: tagline + chips */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "30px",
              color: "#a3a3a3",
              letterSpacing: "-0.01em",
            }}
          >
            Paste long-form. Get 7 platform-native posts in your voice.
          </span>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {[
              "X thread",
              "LinkedIn",
              "IG caption",
              "Newsletter",
              "Shorts",
              "Carousel",
              "Reddit",
            ].map((t) => (
              <div
                key={t}
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#e5e5e5",
                  fontSize: "22px",
                  fontWeight: 500,
                  display: "flex",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
