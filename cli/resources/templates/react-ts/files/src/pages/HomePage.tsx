import { ExampleFeature } from "@/features/example/ExampleFeature";

export function HomePage() {
  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>{{appName}}</h1>
      <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>
        React + TypeScript + Vite
      </p>
      <ExampleFeature />
    </main>
  );
}