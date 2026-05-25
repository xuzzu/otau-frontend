import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hotspot } from "./Hotspot";

describe("Hotspot", () => {
  test("renders n and positions via x/y as percentages", () => {
    render(
      <Hotspot
        n={3}
        x={0.25}
        y={0.75}
        label="Chair"
        active={false}
        onActivate={() => {}}
      />,
    );
    const btn = screen.getByRole("button", { name: /chair/i });
    expect(btn.textContent).toContain("3");
    const wrapper = btn.parentElement as HTMLElement;
    expect(wrapper.style.left).toBe("25%");
    expect(wrapper.style.top).toBe("75%");
  });

  test("fires onActivate on click", () => {
    const onActivate = vi.fn();
    render(
      <Hotspot
        n={1}
        x={0.5}
        y={0.5}
        label="Sofa"
        active={false}
        onActivate={onActivate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /sofa/i }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  test("fires onHoverEnter / onHoverLeave on mouse enter/leave", () => {
    const enter = vi.fn();
    const leave = vi.fn();
    render(
      <Hotspot
        n={2}
        x={0.5}
        y={0.5}
        label="Lamp"
        active={false}
        onActivate={() => {}}
        onHoverEnter={enter}
        onHoverLeave={leave}
      />,
    );
    const btn = screen.getByRole("button", { name: /lamp/i });
    fireEvent.mouseEnter(btn);
    expect(enter).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(btn);
    expect(leave).toHaveBeenCalledTimes(1);
  });
});
