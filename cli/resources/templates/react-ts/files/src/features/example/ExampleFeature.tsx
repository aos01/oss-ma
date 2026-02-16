import { useQuery } from "@tanstack/react-query";
import { useCounterStore } from "./store";
import { Button } from "@/shared/ui/Button";

interface Post {
  id: number;
  title: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=3");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export function ExampleFeature() {
  const { count, increment, decrement, reset } = useCounterStore();

  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <section style={{ marginTop: "2rem" }}>
      {/* Zustand counter */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>Counter (Zustand)</h2>
        <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{count}</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={decrement}>−</Button>
          <Button onClick={increment}>+</Button>
          <Button onClick={reset} variant="secondary">Reset</Button>
        </div>
      </div>

      {/* React Query fetch */}
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
    </section>
  );
}