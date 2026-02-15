import { Example } from "../features/example/Example";

export function App() {
  return (
    <main style={{ padding: 16 }}>
      <h1>{{appName}}</h1>
      <Example />
    </main>
  );
}