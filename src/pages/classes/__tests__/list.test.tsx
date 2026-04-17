import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import List from "../list";

describe("ClassesList", () => {
  it("renders without crashing", () => {
    render(<List />);
  });

  it("displays the 'List' placeholder text", () => {
    render(<List />);
    expect(screen.getByText("List")).toBeTruthy();
  });

  it("renders a div element as its root", () => {
    const { container } = render(<List />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });
});