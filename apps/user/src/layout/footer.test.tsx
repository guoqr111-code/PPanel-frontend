// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const site = { site_name: "PP", custom_data: "{}" };

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));
vi.mock("@/stores/global", () => ({
  useGlobalStore: () => ({ common: { site } }),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock("@workspace/ui/composed/icon", () => ({
  Icon: () => <span data-testid="icon" />,
}));

import Footer from "./footer";

afterEach(() => {
  cleanup();
  site.custom_data = "{}";
});

describe("footer contact email", () => {
  it("shows the configured email as a mailto link after the copyright", () => {
    site.custom_data = JSON.stringify({
      contacts: { email: "support@example.com" },
    });
    render(<Footer />);

    const links = screen
      .getAllByRole("link")
      .filter((link) => link.textContent === "support@example.com");
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("mailto:support@example.com");
    // 邮箱紧跟在“版权所有.”之后。
    expect(links[0]?.parentElement?.textContent ?? "").toMatch(
      /All rights reserved\.\s*Contact:\s*support@example\.com/
    );
  });

  it("shows nothing extra when no email is configured", () => {
    render(<Footer />);
    expect(screen.queryByText(/@/)).toBeNull();
    expect(screen.queryByText("Contact")).toBeNull();
  });

  it("survives malformed custom data", () => {
    site.custom_data = "{not json";
    render(<Footer />);
    expect(screen.queryByText(/@/)).toBeNull();
  });

  it("does not turn a non-email value into a link", () => {
    site.custom_data = JSON.stringify({
      contacts: { email: "javascript:alert(1)" },
    });
    render(<Footer />);
    expect(screen.queryByText("javascript:alert(1)")).toBeNull();
  });
});
