import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link to="/" style={{ marginTop: "1rem", display: "inline-block" }}>
        Go home
      </Link>
    </main>
  );
}