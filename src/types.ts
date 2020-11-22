// for each AD/ED, a queries-length array of their stats
// used by Map tooltip
export interface QueryLookup {
  [key: string]: TooltipObject[]
}

export interface State {
  ui: {
    isMobile: boolean;
    isPanelOpen: boolean;
    map: {
      zoom: number;
      lat: number;
      lngDesktop: number;
      lngMobile: number;
    };
  };
  data: {
    matches: AD_ED[];
    queries: EDQuery[];
    menu: DataMenu;
    allAdEds: AD_ED[];
    lookup?: QueryLookup;
  };
}

export type AD_ED = {
  AD: string;
  ED: string;
};

export enum NumFields {
  TALLY_PCT = "tally_pct",
  SUM_TALLY = "sum_tally",
  TALLY = "tally",
}

export enum RaceKeys {
  year = "year",
  event = "event",
  office = "office",
  district_key = "district_key",
  party = "party",
  unit_name = "unit_name"
}

export interface RaceQuery {
  key: RaceKeys;
  value: string;
}

// row from results_candidate_pct table
export interface DataObj {
  ad: number;
  ed: number;
  [NumFields.TALLY_PCT]: number;
  [NumFields.SUM_TALLY]: number;
  [NumFields.TALLY]: number;
}

export interface EDQuery {
  race: RaceQuery[];
  complete: boolean;
  min?: number;
  max?: number;
  data?: DataObj[];
}

export interface URLParams {
  [key: string]: any[];
}

export type DataMenu = Map<string, string[] | DataMenu>;

export interface Action {
  type: string;
  payload?: any;
}

export interface QueryProps {
  query: EDQuery;
  queryId: number;
  addCallback: (i: number, k: RaceKeys, option: string) => void;
  removeCallback: (i: number, k: RaceKeys) => void;
  minMaxCallback: (i: number, [m, n]: [number, number]) => void;
}

export enum ActionTypes {
  TOGGLE_PANEL = "TOGGLE_PANEL",
}

export interface TooltipObject {
  [NumFields.TALLY_PCT]: number;
  [NumFields.SUM_TALLY]: number;
  [NumFields.TALLY]: number;
}
