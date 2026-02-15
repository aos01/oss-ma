import { useState } from "react";
import { Button } from "../../shared/ui/Button";

export function Example() {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section style={{ marginTop: 16 }}>
      <p>Feature module example.</p>
      <Button onClick={() => setMsg("Hello!")}>Click</Button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </section>
  );
}