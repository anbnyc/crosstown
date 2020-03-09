import { format } from "d3";
import { EDQuery, DataMenu } from "./interfaces";

export const displayFn = (k: string, d: any) =>
  k === "event" ? d.replace("Election ", "") : displayBlankAsNA(d);
export const displayBlankAsNA = (d: any) => d || "N/A";

export const zeroPad = (ad: number, ed: number) =>
  `${ad}${ed > 99 ? "" : ed > 9 ? "0" : "00"}${ed}`;

export const truthyOrZero = (d: any) => !!d || d === 0;

export const nextDropdownOptionsFromRace: (
  menu: DataMenu,
  d: EDQuery
) => string[] = (menu, d) => {
  if (d.race.length === 0) {
    return Array.from(menu.keys()).sort();
  }
  if (!d.complete) {
    // @ts-ignore // TODO fix
    const mapOrArray = d.race.reduce((t, v) => t.get(v.value), menu);

    // check if we've reached the deepest level of the nested Map
    // if so, just provide the values Array
    // else, give the keys so we can go a level deeper
    return mapOrArray instanceof Map
      ? Array.from(mapOrArray.keys()).sort()
      : mapOrArray.sort();
  }
  return [];
};

export const fmt = format(".2p");
