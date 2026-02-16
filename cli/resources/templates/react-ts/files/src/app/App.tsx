{{#if routing}}
import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
{{/if}}
{{#unless routing}}
import { HomePage } from "@/pages/HomePage";

export function App() {
  return <HomePage />;
}
{{/unless}}