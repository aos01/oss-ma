import { describe, it, expect, beforeEach } from "vitest";
import { useCounterStore } from "@/features/example/store";

describe("useCounterStore", () => {
  beforeEach(() => {
    useCounterStore.getState().reset();
  });

  it("starts at 0", () => {
    expect(useCounterStore.getState().count).toBe(0);
  });

  it("increments", () => {
    useCounterStore.getState().increment();
    expect(useCounterStore.getState().count).toBe(1);
  });

  it("decrements", () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().decrement();
    expect(useCounterStore.getState().count).toBe(0);
  });

  it("resets to 0", () => {
    useCounterStore.getState().increment();
    useCounterStore.getState().increment();
    useCounterStore.getState().reset();
    expect(useCounterStore.getState().count).toBe(0);
  });
});