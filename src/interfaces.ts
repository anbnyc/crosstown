export type AD_ED = {
  AD: string;
  ED: string;
};

export type raceKeys =
  | "year"
  | "event"
  | "office"
  | "unit_name"
  | "party"
  | "district_key";

export interface RaceQuery {
  key: raceKeys;
  value: string;
}

export interface EDQuery {
  race: RaceQuery[];
  complete: boolean;
  min?: number;
  max?: number;
  data?: any[];
}

export type DataMenu = Map<string, Map<string, any> | RaceQuery>;

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
  };
}

export interface Action {
  type: string;
  payload?: any;
}

export enum ActionTypes {
  TOGGLE_PANEL = "TOGGLE_PANEL",
}
