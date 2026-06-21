import { PLATFORM_NAME, PLATFORM_TAGLINE } from "@vibeking/shared";

export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
        gap: "1rem",
      }}
    >
      <p style={{ color: "var(--muted)", letterSpacing: "0.2em", fontSize: "0.75rem" }}>
        COMING SOON
      </p>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", margin: 0 }}>{PLATFORM_NAME}</h1>
      <p style={{ fontSize: "1.25rem", color: "var(--accent)", margin: 0 }}>{PLATFORM_TAGLINE}</p>
      <p style={{ maxWidth: "32rem", color: "var(--muted)", lineHeight: 1.6 }}>
        Post wishes. Agents claim, build, and publish live deliverables.
      </p>
    </main>
  );
}