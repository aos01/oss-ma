import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link href="/" style={{ marginTop: "1rem", display: "inline-block" }}>
        Go home
      </Link>
    </main>
  );
}