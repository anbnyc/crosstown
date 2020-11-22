import { format } from "d3";
import type { DecodedValueMap, QueryParamConfig } from "use-query-params";
import { ANY, queryOrder } from "./constants";
import type {
  EDQuery,
  DataMenu,
  RaceQuery,
  URLParams,
  QueryLookup
} from "./types";
import { RaceKeys } from "./types";

export const displayFn = (k: RaceKeys, d: any) =>
  k === RaceKeys.event ? d.replace("Election ", "") : displayBlankAsNA(d);
export const displayBlankAsNA = (d: any) => d || "N/A";

export const zeroPad = (ad: number, ed: number): string =>
  `${ad}${ed > 99 ? "" : ed > 9 ? "0" : "00"}${ed}`;

export const truthyOrZero = (d: number | undefined) => !!d || d === 0;

export const nextDropdownOptionsFromRace = (
  menu: DataMenu,
  race: RaceQuery[],
  complete: boolean
): string[] => {
  if (race.length === 0) {
    return Array.from(menu.keys()).sort();
  }
  if (!complete && menu.size > 0) {
    // @ts-ignore
    const mapOrArray: DataMenu | string[] = race.reduce(
      // @ts-ignore
      (t: DataMenu, v: RaceQuery) => {
        if (t && t.has(v.value)) {
          return t.get(v.value);
        }
        return t;
      },
      menu
    );

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

// TODO test
export const serializeQueriesToParams = (queries: EDQuery[]): URLParams => {
  const params: URLParams = {
    min: [],
    max: [],
  };
  queries.forEach(({ race, min, max }) => {
    params.min.push(min as number);
    params.max.push(max as number);
    race.forEach(({ key, value }) => {
      if (!params[key]) {
        params[key] = [];
      }
      params[key].push(value);
    });
  });
  const stringParams = Object.keys(params).map((k) => [k, params[k].join(",")]);
  return Object.fromEntries(stringParams);
};

// TODO test
export const deserializeQueriesToParams = (
  params: DecodedValueMap<{
    [key: string]:
      QueryParamConfig<string | null | undefined, string | null | undefined>
  }>
): Partial<EDQuery>[] => {
  const queries: Partial<EDQuery>[] = [];
  if (!params) {
    return queries;
  }

  //@ts-ignore
  Object.values(RaceKeys).forEach((key: RaceKeys) => {
    if (typeof params[key] === "string") {
      const paramsArray: string[] = params[key]!.split(",");
      if (paramsArray.length) {
        paramsArray.forEach((value: string, i: number) => {
          if (queries.length <= i) {
            queries.push({
              race: [{ key, value }],
            });
          } else {
            queries[i].race?.push({ key, value });
          }
        });
      }
    }
  });

  ["min", "max"].forEach((key: string) => {
    if (params[key]) {
      const paramsArray = params[key]!.split(",");
      if (paramsArray.length) {
        paramsArray.forEach((value: string, i: number) => {
          if (queries[i]) {
            queries[i][key as "min" | "max"] = +value;
          }
        });
      }
    }
  });

  return queries;
};

// year is a synthetic variable for organizing dropdown menu
// ANY is a replacement for null
export const filterReal = (e: RaceQuery): boolean =>
  e.key !== RaceKeys.year && e.value !== ANY;

export const isQueryComplete = (query: EDQuery): boolean =>
  query.race.length === queryOrder.length;

// TODO test
export const getLookupFromQueries = (queries: EDQuery[]): QueryLookup => {
  const res: QueryLookup = {};
  const queriesWithData = queries
    .filter((d: EDQuery)  => d.data && d.data.length);
  for (let i = 0; i < queriesWithData.length; i++){
    const queryData = queriesWithData[i].data!;
    for (let j = 0; j < queryData.length; j++){
      const {
        ad,
        ed,
        tally_pct,
        tally,
        sum_tally
      } = queryData[j];
      const key = zeroPad(ad, ed);
      if (!res[key]) {
        res[key] = [];
      }
      res[key].push({ tally_pct, tally, sum_tally });
    }
  }
  return res;
};
