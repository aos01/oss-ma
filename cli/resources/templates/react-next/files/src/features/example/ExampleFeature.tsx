"use client";

{{#if fetching}}
import { useQuery } from "@tanstack/react-query";
{{/if}}
{{#if state}}
import { useCounterStore } from "./store";
{{/if}}
import { Button } from "@/shared/ui/Button";
{{#if fetching}}

interface Post {
  id: number;
  title: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(
    "https://jsonplaceholder.typicode.com/posts?_limit=3",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}
{{/if}}

export function ExampleFeature() {
  {{#if state}}
  const { count, increment, decrement, reset } = useCounterStore();
  {{/if}}
  {{#if fetching}}
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
  {{/if}}

  return (
    <section style={{ marginTop: "2rem" }}>
      {{#if state}}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Counter (Zustand)</h2>
        <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{count}</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={decrement}>−</Button>
          <Button onClick={increment}>+</Button>
          <Button onClick={reset} variant="secondary">Reset</Button>
        </div>
      </div>
      {{/if}}
      {{#if fetching}}
      <div>
        <h2>Posts (TanStack Query)</h2>
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading posts.</p>}
        {posts && (
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.2rem" }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: "0.25rem" }}>
                {post.title}
              </li>
            ))}
          </ul>
        )}
      </div>
      {{/if}}
      {{#unless state}}
      {{#unless fetching}}
      <p>Feature module — add your components here.</p>
      {{/unless}}
      {{/unless}}
    </section>
  );
}