import { describe, expect, it } from "vitest";
import {
  dropPage,
  keptPages,
  organizedName,
  pagesFrom,
  restorePage,
  summary,
  turnAll,
  turnPage,
  wrapTurns,
} from "~/utils/pdf-organizer";
import { moveItem } from "~/utils/reorder";

describe("pagesFrom", () => {
  it("should build one card per page in document order", () => {
    expect(pagesFrom(3)).toEqual([
      { id: "page-1", page: 1, turns: 0, dropped: false },
      { id: "page-2", page: 2, turns: 0, dropped: false },
      { id: "page-3", page: 3, turns: 0, dropped: false },
    ]);
  });

  it("should return an empty list when the document has no pages", () => {
    expect(pagesFrom(0)).toEqual([]);
  });

  it("should return an empty list when the count makes no sense", () => {
    expect(pagesFrom(-4)).toEqual([]);
    expect(pagesFrom(Number.NaN)).toEqual([]);
  });
});

describe("wrapTurns", () => {
  it("should keep a turn inside a full circle", () => {
    expect(wrapTurns(4)).toBe(0);
    expect(wrapTurns(5)).toBe(1);
    expect(wrapTurns(11)).toBe(3);
  });

  it("should read a turn the other way as a turn clockwise", () => {
    expect(wrapTurns(-1)).toBe(3);
    expect(wrapTurns(-5)).toBe(3);
  });
});

describe("turnPage", () => {
  it("should turn only the page asked for", () => {
    const turned = turnPage(pagesFrom(2), "page-2");

    expect(turned.map((card) => card.turns)).toEqual([0, 1]);
  });

  it("should wrap a fourth turn back to upright", () => {
    let cards = pagesFrom(1);

    for (let turn = 0; turn < 4; turn += 1) {
      cards = turnPage(cards, "page-1");
    }

    expect(cards[0]?.turns).toBe(0);
  });

  it("should leave the list alone when the page is not in it", () => {
    const cards = pagesFrom(2);

    expect(turnPage(cards, "page-9")).toEqual(cards);
  });

  it("should not change the list handed in", () => {
    const cards = pagesFrom(1);
    turnPage(cards, "page-1");

    expect(cards[0]?.turns).toBe(0);
  });
});

describe("turnAll", () => {
  it("should turn every page that is still kept", () => {
    const cards = turnAll(dropPage(pagesFrom(3), "page-2"));

    expect(cards.map((card) => card.turns)).toEqual([1, 0, 1]);
  });
});

describe("dropPage and restorePage", () => {
  it("should bring a dropped page back unchanged", () => {
    const cards = pagesFrom(3);
    const dropped = dropPage(cards, "page-2");

    expect(dropped[1]?.dropped).toBe(true);
    expect(restorePage(dropped, "page-2")).toEqual(cards);
  });

  it("should keep a turn through a drop and a restore", () => {
    const turned = turnPage(pagesFrom(1), "page-1", 2);
    const back = restorePage(dropPage(turned, "page-1"), "page-1");

    expect(back[0]).toEqual({
      id: "page-1",
      page: 1,
      turns: 2,
      dropped: false,
    });
  });
});

describe("keptPages", () => {
  it("should give the picks in the order the cards were dragged into", () => {
    const dragged = moveItem(pagesFrom(3), 2, 0);

    expect(keptPages(dragged)).toEqual([
      { source: 0, page: 3, turns: 0 },
      { source: 0, page: 1, turns: 0 },
      { source: 0, page: 2, turns: 0 },
    ]);
  });

  it("should leave out a dropped page and carry the turns of the rest", () => {
    const cards = dropPage(turnPage(pagesFrom(3), "page-1", 3), "page-2");

    expect(keptPages(cards)).toEqual([
      { source: 0, page: 1, turns: 3 },
      { source: 0, page: 3, turns: 0 },
    ]);
  });

  it("should return nothing when every page was dropped", () => {
    const cards = dropPage(dropPage(pagesFrom(2), "page-1"), "page-2");

    expect(keptPages(cards)).toEqual([]);
  });

  it("should return nothing when there is no document", () => {
    expect(keptPages([])).toEqual([]);
  });
});

describe("summary", () => {
  it("should count the pages kept, dropped and turned", () => {
    const cards = turnPage(dropPage(pagesFrom(4), "page-3"), "page-1");

    expect(summary(cards)).toEqual({
      total: 4,
      kept: 3,
      dropped: 1,
      turned: 1,
    });
  });

  it("should not count a dropped page as turned", () => {
    const cards = dropPage(turnPage(pagesFrom(2), "page-2"), "page-2");

    expect(summary(cards)).toEqual({
      total: 2,
      kept: 1,
      dropped: 1,
      turned: 0,
    });
  });

  it("should count nothing when there is no document", () => {
    expect(summary([])).toEqual({
      total: 0,
      kept: 0,
      dropped: 0,
      turned: 0,
    });
  });
});

describe("organizedName", () => {
  it("should name the saved file after the original", () => {
    expect(organizedName("report.pdf")).toBe("report-organized.pdf");
  });

  it("should fall back to a plain name when the original has none", () => {
    expect(organizedName("")).toBe("download-organized.pdf");
  });
});
