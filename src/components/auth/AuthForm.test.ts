import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthForm } from "./AuthForm";
import { BetaFeedbackModal } from "../feedback/BetaFeedbackModal";
import Footer from "../Footer";

describe("registration and beta feedback", () => {
  it("asks for email and scout name on signup", () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { initialMode: "signup" }));
    expect(html).toContain("Scoutnamn");
    expect(html).toContain("E-post");
    expect(html).toContain("Lösenord");
    expect(html).toContain("Skapa konto");
    expect(html).toContain("Registrera e-post och scoutnamn");
    expect(html).not.toContain("Logga in med Apple");
    expect(html).not.toContain("Logga in med Google");
  });

  it("keeps login to email and password", () => {
    const html = renderToStaticMarkup(createElement(AuthForm, { initialMode: "login" }));
    expect(html).toContain("E-post");
    expect(html).toContain("Lösenord");
    expect(html).toContain("Logga in");
    expect(html).not.toContain("Logga in med Apple");
    expect(html).not.toContain("Logga in med Google");
  });

  it("opens a feedback form with rating, category, and comment", () => {
    const html = renderToStaticMarkup(createElement(BetaFeedbackModal, { open: true, onClose: () => undefined }));
    expect(html).toContain("Lämna beta-feedback");
    expect(html).toContain("Betyg 1 av 5");
    expect(html).toContain("Betyg 5 av 5");
    expect(html).toContain("Bugg");
    expect(html).toContain("Idé");
    expect(html).toContain("Övrigt");
    expect(html).toContain("Kommentar");
    expect(html).toContain("Skicka feedback");
  });

  it("puts the feedback button in the footer", () => {
    const html = renderToStaticMarkup(createElement(Footer));
    expect(html).toContain("Lämna beta-feedback");
  });
});
