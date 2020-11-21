import { format } from "d3";
import { ANY } from "./constants";
import type { EDQuery, DataMenu, RaceQuery, URLParams } from "./types";
import {RaceKeys} from './types'

export const displayFn = (k: RaceKeys, d: any) =>
  k === RaceKeys.event ? d.replace("Election ", "") : displayBlankAsNA(d);
export const displayBlankAsNA = (d: any) => d || "N/A";

export const zeroPad = (ad: number, ed: number): string =>
  `${ad}${ed > 99 ? "" : ed > 9 ? "0" : "00"}${ed}`;

export const truthyOrZero = (d: any) => !!d || d === 0;

export const nextDropdownOptionsFromRace = (menu: DataMenu, race: RaceQuery[], complete: boolean): string[] => {
  if (race.length === 0) {
    return Array.from(menu.keys()).sort();
  }
  if (!complete && menu.size > 0) {
    // @ts-ignore
    const mapOrArray: DataMenu | string[] = race.reduce((t: DataMenu, v: RaceQuery) => {
      if (t && t.has(v.value)){
        return t.get(v.value)
      }
      return t;
    }, menu);

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

export const serializeQueriesToParams = (queries: EDQuery[]): URLParams => {
  let params: URLParams = {
    min: [],
    max: [],
  }
  queries.forEach(({ race, min, max }) => {
    params.min.push(min as number)
    params.max.push(max as number)
    race.forEach(({ key, value }) => {
      if(!params[key]) {
        params[key] = []
      }
      params[key].push(value)
    })
  })
  const stringParams = Object.keys(params).map(k => [k, params[k].join(',')])
  return Object.fromEntries(stringParams)
}

export const deserializeQueriesToParams = (params: any): Partial<EDQuery>[] => {
  const queries: Partial<EDQuery>[] = [];

  //@ts-ignore
  Object.values(RaceKeys).forEach((key: RaceKeys) => {
    const paramsArray = params[key] && params[key].split(',')
    if (paramsArray.length) {
      paramsArray.forEach((value: string, i: number) => {
        if (queries.length <= i) {
          queries.push({
            race: [{ key, value }]
          })
        } else {
          queries[i].race?.push({ key, value })
        }
      })
    }
  });

  (['min', 'max']).forEach((key: string) => {
    const paramsArray = params[key] && params[key].split(',')
    if (paramsArray.length) {
      paramsArray.forEach((value: string, i: number) => {
        if (queries[i]) {
          queries[i][key as 'min' | 'max'] = +value
        }
      })
    }
  });

  return queries
}

// year is a synthetic variable for organizing dropdown menu
// ANY is a replacement for null
export const filterReal = (e: RaceQuery) => e.key !== RaceKeys.year && e.value !== ANY
