import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

describe("smoke", () => {
  it("renders the shadcn Button component", () => {
    render(<Button>Shop now</Button>);
    expect(
      screen.getByRole("button", { name: "Shop now" }),
    ).toBeInTheDocument();
  });

  it("merges tailwind classes with cn", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
