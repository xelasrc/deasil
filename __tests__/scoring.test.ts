import { describe, it, expect } from "vitest";
import { checkGuess } from "../app/lib/scoring";

// ─── Puzzle Definitions ───────────────────────────────────────────────────────

const puzzles = {
  warnerBros: {
    acceptedAnswers: ["Warner Bros. Discovery", "Warner Bros Discovery", "WBD"],
  },
  taylorSwift: {
    acceptedAnswers: ["Taylor Swift", "Taylor Alison Swift"],
  },
  openAI: {
    acceptedAnswers: ["OpenAI", "Open AI"],
  },
  newZealand: {
    acceptedAnswers: ["New Zealand", "Aotearoa", "NZ"],
  },
  ukraine: {
    acceptedAnswers: ["Ukraine"],
  },
  appleiPhone: {
    acceptedAnswers: ["iPhone 17", "Apple iPhone 17"],
  },
  fifa: {
    acceptedAnswers: ["FIFA World Cup", "World Cup 2026", "FIFA World Cup 2026"],
  },
  amazon: {
    acceptedAnswers: ["Amazon", "Amazon.com"],
  },
  us: {
    acceptedAnswers: ["US", "USA", "United States", "United States of America"],
  },
  elonMusk: {
    acceptedAnswers: ["Elon Musk", "Musk"],
  },
};

// ─── Warner Bros Discovery ────────────────────────────────────────────────────

describe("Warner Bros Discovery", () => {
  it("accepts full name", () => expect(checkGuess("Warner Bros. Discovery", puzzles.warnerBros)).toBe(true));
  it("accepts without punctuation", () => expect(checkGuess("Warner Bros Discovery", puzzles.warnerBros)).toBe(true));
  it("accepts acronym", () => expect(checkGuess("WBD", puzzles.warnerBros)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("warner bros discovery", puzzles.warnerBros)).toBe(true));
  it("accepts one typo in warner", () => expect(checkGuess("Warnerr Bros Discovery", puzzles.warnerBros)).toBe(true));
  it("accepts one typo in discovery", () => expect(checkGuess("Warner Bros Discoverry", puzzles.warnerBros)).toBe(true));
  it("accepts partial warner bros", () => expect(checkGuess("Warner Bros", puzzles.warnerBros)).toBe(true));
  it("rejects warner music", () => expect(checkGuess("Warner Music", puzzles.warnerBros)).toBe(false));
  it("rejects disney", () => expect(checkGuess("Disney", puzzles.warnerBros)).toBe(false));
  it("rejects empty string", () => expect(checkGuess("", puzzles.warnerBros)).toBe(false));
  it("rejects single letter W", () => expect(checkGuess("W", puzzles.warnerBros)).toBe(false));
  it("rejects vague guess media company", () => expect(checkGuess("media company", puzzles.warnerBros)).toBe(false));
  it("rejects discovery channel", () => expect(checkGuess("discovery channel", puzzles.warnerBros)).toBe(false));
  it("rejects netflix", () => expect(checkGuess("Netflix", puzzles.warnerBros)).toBe(false));
  it("rejects hbo alone", () => expect(checkGuess("HBO", puzzles.warnerBros)).toBe(false));
});

// ─── Taylor Swift ─────────────────────────────────────────────────────────────

describe("Taylor Swift", () => {
  it("accepts full name", () => expect(checkGuess("Taylor Swift", puzzles.taylorSwift)).toBe(true));
  it("accepts full legal name", () => expect(checkGuess("Taylor Alison Swift", puzzles.taylorSwift)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("taylor swift", puzzles.taylorSwift)).toBe(true));
  it("rejects surname only", () => expect(checkGuess("Swift", puzzles.taylorSwift)).toBe(false));
  it("accepts one typo in first name", () => expect(checkGuess("Taylorr Swift", puzzles.taylorSwift)).toBe(true));
  it("accepts one typo in last name", () => expect(checkGuess("Taylor Swifft", puzzles.taylorSwift)).toBe(true));
  it("rejects taylor lautner", () => expect(checkGuess("Taylor Lautner", puzzles.taylorSwift)).toBe(false));
  it("rejects beyonce", () => expect(checkGuess("Beyonce", puzzles.taylorSwift)).toBe(false));
  it("rejects ariana grande", () => expect(checkGuess("Ariana Grande", puzzles.taylorSwift)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.taylorSwift)).toBe(false));
  it("rejects single T", () => expect(checkGuess("T", puzzles.taylorSwift)).toBe(false));
  it("rejects just taylor", () => expect(checkGuess("Taylor", puzzles.taylorSwift)).toBe(false));
  it("rejects pop star", () => expect(checkGuess("pop star", puzzles.taylorSwift)).toBe(false));
});

// ─── OpenAI ───────────────────────────────────────────────────────────────────

describe("OpenAI", () => {
  it("accepts OpenAI", () => expect(checkGuess("OpenAI", puzzles.openAI)).toBe(true));
  it("accepts Open AI with space", () => expect(checkGuess("Open AI", puzzles.openAI)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("openai", puzzles.openAI)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("OpennAI", puzzles.openAI)).toBe(true));
  it("rejects google", () => expect(checkGuess("Google", puzzles.openAI)).toBe(false));
  it("rejects anthropic", () => expect(checkGuess("Anthropic", puzzles.openAI)).toBe(false));
  it("rejects chatgpt alone", () => expect(checkGuess("ChatGPT", puzzles.openAI)).toBe(false));
  it("rejects AI company", () => expect(checkGuess("AI company", puzzles.openAI)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.openAI)).toBe(false));
  it("rejects single O", () => expect(checkGuess("O", puzzles.openAI)).toBe(false));
  it("rejects deepseek", () => expect(checkGuess("DeepSeek", puzzles.openAI)).toBe(false));
  it("rejects microsoft", () => expect(checkGuess("Microsoft", puzzles.openAI)).toBe(false));
});

// ─── New Zealand ──────────────────────────────────────────────────────────────

describe("New Zealand", () => {
  it("accepts New Zealand", () => expect(checkGuess("New Zealand", puzzles.newZealand)).toBe(true));
  it("accepts Aotearoa", () => expect(checkGuess("Aotearoa", puzzles.newZealand)).toBe(true));
  it("accepts NZ", () => expect(checkGuess("NZ", puzzles.newZealand)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("new zealand", puzzles.newZealand)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("New Zealend", puzzles.newZealand)).toBe(true));
  it("rejects australia", () => expect(checkGuess("Australia", puzzles.newZealand)).toBe(false));
  it("rejects UK", () => expect(checkGuess("UK", puzzles.newZealand)).toBe(false));
  it("rejects island nation", () => expect(checkGuess("island nation", puzzles.newZealand)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.newZealand)).toBe(false));
  it("rejects single N", () => expect(checkGuess("N", puzzles.newZealand)).toBe(false));
  it("rejects pacific", () => expect(checkGuess("Pacific", puzzles.newZealand)).toBe(false));
});

// ─── Ukraine ──────────────────────────────────────────────────────────────────

describe("Ukraine", () => {
  it("accepts Ukraine", () => expect(checkGuess("Ukraine", puzzles.ukraine)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("ukraine", puzzles.ukraine)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("Ukrainne", puzzles.ukraine)).toBe(true));
  it("rejects russia", () => expect(checkGuess("Russia", puzzles.ukraine)).toBe(false));
  it("rejects eastern europe", () => expect(checkGuess("Eastern Europe", puzzles.ukraine)).toBe(false));
  it("rejects kyiv", () => expect(checkGuess("Kyiv", puzzles.ukraine)).toBe(false));
  it("rejects poland", () => expect(checkGuess("Poland", puzzles.ukraine)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.ukraine)).toBe(false));
  it("rejects single U", () => expect(checkGuess("U", puzzles.ukraine)).toBe(false));
  it("rejects war", () => expect(checkGuess("war", puzzles.ukraine)).toBe(false));
  it("rejects NATO", () => expect(checkGuess("NATO", puzzles.ukraine)).toBe(false));
});

// ─── iPhone 17 ────────────────────────────────────────────────────────────────

describe("iPhone 17", () => {
  it("accepts iPhone 17", () => expect(checkGuess("iPhone 17", puzzles.appleiPhone)).toBe(true));
  it("accepts Apple iPhone 17", () => expect(checkGuess("Apple iPhone 17", puzzles.appleiPhone)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("iphone 17", puzzles.appleiPhone)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("iPhonne 17", puzzles.appleiPhone)).toBe(true));
  it("rejects iPhone 16", () => expect(checkGuess("iPhone 16", puzzles.appleiPhone)).toBe(false));
  it("rejects samsung", () => expect(checkGuess("Samsung", puzzles.appleiPhone)).toBe(false));
  it("rejects apple alone", () => expect(checkGuess("Apple", puzzles.appleiPhone)).toBe(false));
  it("rejects smartphone", () => expect(checkGuess("smartphone", puzzles.appleiPhone)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.appleiPhone)).toBe(false));
  it("rejects pixel", () => expect(checkGuess("Pixel", puzzles.appleiPhone)).toBe(false));
  it("rejects ipad", () => expect(checkGuess("iPad", puzzles.appleiPhone)).toBe(false));
});

// ─── FIFA World Cup ───────────────────────────────────────────────────────────

describe("FIFA World Cup", () => {
  it("accepts FIFA World Cup", () => expect(checkGuess("FIFA World Cup", puzzles.fifa)).toBe(true));
  it("accepts World Cup 2026", () => expect(checkGuess("World Cup 2026", puzzles.fifa)).toBe(true));
  it("accepts FIFA World Cup 2026", () => expect(checkGuess("FIFA World Cup 2026", puzzles.fifa)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("fifa world cup", puzzles.fifa)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("FIFA Worldd Cup", puzzles.fifa)).toBe(true));
  it("accepts partial world cup", () => expect(checkGuess("World Cup", puzzles.fifa)).toBe(true));
  it("rejects euros", () => expect(checkGuess("Euros", puzzles.fifa)).toBe(false));
  it("rejects olympics", () => expect(checkGuess("Olympics", puzzles.fifa)).toBe(false));
  it("rejects football alone", () => expect(checkGuess("football", puzzles.fifa)).toBe(false));
  it("rejects copa america", () => expect(checkGuess("Copa America", puzzles.fifa)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.fifa)).toBe(false));
  it("rejects single F", () => expect(checkGuess("F", puzzles.fifa)).toBe(false));
});

// ─── Amazon ───────────────────────────────────────────────────────────────────

describe("Amazon", () => {
  it("accepts Amazon", () => expect(checkGuess("Amazon", puzzles.amazon)).toBe(true));
  it("accepts Amazon.com", () => expect(checkGuess("Amazon.com", puzzles.amazon)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("amazon", puzzles.amazon)).toBe(true));
  it("accepts one typo", () => expect(checkGuess("Amazzon", puzzles.amazon)).toBe(true));
  it("rejects ebay", () => expect(checkGuess("eBay", puzzles.amazon)).toBe(false));
  it("rejects jeff bezos", () => expect(checkGuess("Jeff Bezos", puzzles.amazon)).toBe(false));
  it("rejects AWS alone", () => expect(checkGuess("AWS", puzzles.amazon)).toBe(false));
  it("rejects ecommerce", () => expect(checkGuess("ecommerce", puzzles.amazon)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.amazon)).toBe(false));
  it("rejects single A", () => expect(checkGuess("A", puzzles.amazon)).toBe(false));
  it("rejects walmart", () => expect(checkGuess("Walmart", puzzles.amazon)).toBe(false));
  it("rejects river", () => expect(checkGuess("Amazon River", puzzles.amazon)).toBe(false));
});

// ─── US / USA ─────────────────────────────────────────────────────────────────

describe("US / USA", () => {
  it("accepts US", () => expect(checkGuess("US", puzzles.us)).toBe(true));
  it("accepts USA", () => expect(checkGuess("USA", puzzles.us)).toBe(true));
  it("accepts United States", () => expect(checkGuess("United States", puzzles.us)).toBe(true));
  it("accepts United States of America", () => expect(checkGuess("United States of America", puzzles.us)).toBe(true));
  it("accepts lowercase us", () => expect(checkGuess("us", puzzles.us)).toBe(true));
  it("accepts lowercase usa", () => expect(checkGuess("usa", puzzles.us)).toBe(true));
  it("accepts lowercase united states", () => expect(checkGuess("united states", puzzles.us)).toBe(true));
  it("accepts one typo in united states", () => expect(checkGuess("United Stattes", puzzles.us)).toBe(true));
  it("rejects canada", () => expect(checkGuess("Canada", puzzles.us)).toBe(false));
  it("rejects uk", () => expect(checkGuess("UK", puzzles.us)).toBe(false));
  it("rejects america alone", () => expect(checkGuess("America", puzzles.us)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.us)).toBe(false));
  it("rejects single U", () => expect(checkGuess("U", puzzles.us)).toBe(false));
  it("rejects washington", () => expect(checkGuess("Washington", puzzles.us)).toBe(false));
});

// ─── Elon Musk ────────────────────────────────────────────────────────────────

describe("Elon Musk", () => {
  it("accepts Elon Musk", () => expect(checkGuess("Elon Musk", puzzles.elonMusk)).toBe(true));
  it("accepts surname only", () => expect(checkGuess("Musk", puzzles.elonMusk)).toBe(true));
  it("accepts lowercase", () => expect(checkGuess("elon musk", puzzles.elonMusk)).toBe(true));
  it("accepts one typo in first name", () => expect(checkGuess("Ellon Musk", puzzles.elonMusk)).toBe(true));
  it("accepts one typo in last name", () => expect(checkGuess("Elon Mussk", puzzles.elonMusk)).toBe(true));
  it("rejects jeff bezos", () => expect(checkGuess("Jeff Bezos", puzzles.elonMusk)).toBe(false));
  it("rejects elon alone", () => expect(checkGuess("Elon", puzzles.elonMusk)).toBe(false));
  it("rejects tesla", () => expect(checkGuess("Tesla", puzzles.elonMusk)).toBe(false));
  it("rejects spacex", () => expect(checkGuess("SpaceX", puzzles.elonMusk)).toBe(false));
  it("rejects billionaire", () => expect(checkGuess("billionaire", puzzles.elonMusk)).toBe(false));
  it("rejects empty", () => expect(checkGuess("", puzzles.elonMusk)).toBe(false));
  it("rejects single E", () => expect(checkGuess("E", puzzles.elonMusk)).toBe(false));
  it("rejects mark zuckerberg", () => expect(checkGuess("Mark Zuckerberg", puzzles.elonMusk)).toBe(false));
  it("rejects doge", () => expect(checkGuess("DOGE", puzzles.elonMusk)).toBe(false));
});