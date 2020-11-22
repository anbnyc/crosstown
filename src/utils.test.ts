import {nextDropdownOptionsFromRace} from "./utils";
import { RaceKeys } from "./types";

describe("nextDropdownOptionsFromRace", () => {
  const emptyMenu = new Map();

  const menu = new Map([
    ["a", new Map([
      ["ag", new Map([
        ["agr", ["agrarian", "aggressive"]]
      ])],
      ["ap", new Map([
        ["app", ["apple", "application"]]
      ])]
    ])],
    ["b", new Map([
      ["ba", new Map([
        ["ban", ["banana", "bandana"]]
      ])]
    ])]
  ]);

  describe("incomplete states", () => {
    it ("returns top level keys if race has no items", () => {
      const race = [];
      expect(nextDropdownOptionsFromRace(menu, race, false)).toEqual(["a", "b"]);
    });

    it("returns empty array if race is complete", () => {
      const race = [{ key: RaceKeys.event, value: "a"}];
      expect(nextDropdownOptionsFromRace(menu, race, true)).toEqual([]);
    });

    it("returns empty array if menu is empty", () => {
      const race = [{ key: RaceKeys.event, value: "a"}];
      expect(nextDropdownOptionsFromRace(emptyMenu, race, false)).toEqual([]);
    });
  });

  describe("complete states", () => {
    it("returns menu keys for the next level", () => {
      const race = [{ key: RaceKeys.event, value: "a"}];
      expect(nextDropdownOptionsFromRace(menu, race, false)).toEqual(["ag", "ap"]);
    });

    it("returns menu values for the bottom level", () => {
      const race = [
        { key: RaceKeys.event, value: "a" },
        { key: RaceKeys.year, value: "ap" },
        { key: RaceKeys.district_key, value: "app" },
      ];
      expect(nextDropdownOptionsFromRace(menu, race, false)).toEqual(["apple", "application"]);
    });
  });
});
