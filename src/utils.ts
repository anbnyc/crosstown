import { format } from "d3";
import type { EDQuery, DataMenu, RaceQuery, URLParams } from "./types";
import {RaceKeys} from './types'

export const displayFn = (k: RaceKeys, d: any) =>
  k === RaceKeys.event ? d.replace("Election ", "") : displayBlankAsNA(d);
export const displayBlankAsNA = (d: any) => d || "N/A";

export const zeroPad = (ad: number, ed: number): string =>
  `${ad}${ed > 99 ? "" : ed > 9 ? "0" : "00"}${ed}`;

export const truthyOrZero = (d: any) => !!d || d === 0;

export const nextDropdownOptionsFromRace = (menu: DataMenu, d: EDQuery): string[] => {
  if (d.race.length === 0) {
    return Array.from(menu.keys()).sort();
  }
  if (!d.complete) {
    // @ts-ignore // TODO fix
    const mapOrArray: DataMenu | RaceQuery = d.race.reduce((t, v) => t.get(v.value), menu);

    // check if we've reached the deepest level of the nested Map
    // if so, just provide the values Array
    // else, give the keys so we can go a level deeper
    return mapOrArray instanceof Map
      ? Array.from(mapOrArray.keys()).sort()
      // @ts-ignore
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
  queries.filter(d => d.complete).forEach(({ race, min, max }) => {
    params.min.push(min as number)
    params.max.push(max as number)
    race.forEach(({ key, value }) => {
      if(!params[key]) {
        params[key] = []
      }
      params[key].push(value)
    })
  })
  return params
}

export const deserializeQueriesToParams = (params: any): Partial<EDQuery>[] => {
  const queries: Partial<EDQuery>[] = [];

  //@ts-ignore
  Object.values(RaceKeys).forEach((key: RaceKeys) => {
    if (params[key] && Array.isArray(params[key])) {
      params[key].forEach((value: string, i: number) => {
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
    if (params[key] && Array.isArray(params[key])) {
      params[key].forEach((value: string, i: number) => {
        if (queries[i]) {
          queries[i][key as 'min' | 'max'] = +value
        }
      })
    }
  });

  return queries
}
