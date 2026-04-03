import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "@/App";
import { useFocusBoardStore } from "@/app/store/use-focus-board-store";

beforeEach(() => {
  localStorage.clear();
  useFocusBoardStore.persist.clearStorage();
  useFocusBoardStore.setState(useFocusBoardStore.getInitialState());
});

afterEach(() => {
  localStorage.clear();
  useFocusBoardStore.persist.clearStorage();
  useFocusBoardStore.setState(useFocusBoardStore.getInitialState());
});

describe("App", () => {
  it("renders the start screen without crashing", () => {
    render(<App />);

    expect(screen.getByText("FocusBoard")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Начать сессию" })).toBeTruthy();
  });
});
