{{#if state}}
import { ExampleFeature } from "@/features/example/ExampleFeature";
{{/if}}
{{#unless state}}
{{#unless fetching}}
import { Button } from "@/shared/ui/Button";
import { useState } from "react";
{{/unless}}
{{/unless}}

export function HomePage() {
  {{#unless state}}
  {{#unless fetching}}
  const [msg, setMsg] = useState<string | null>(null);
  {{/unless}}
  {{/unless}}

  return (
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <h1>{{appName}}</h1>
      <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>
        React + TypeScript + Vite
      </p>
      {{#if state}}
      <ExampleFeature />
      {{/if}}
      {{#unless state}}
      {{#unless fetching}}
      <section style={{ marginTop: "2rem" }}>
        <Button onClick={() => setMsg("Hello!")}>Click me</Button>
        {msg && <p style={{ marginTop: "0.5rem" }}>{msg}</p>}
      </section>
      {{/unless}}
      {{/unless}}
    </main>
  );
}