import { RaceKeys } from "./types";

export const Constants = {
  GET_ASYNC_RESPONSE: "Get Async Response",
  SET_MENU_DATA: "[DATA] Set Menu Data",
  ADD_PCT_DATA: "[DATA] Add Pct Data",
  SET_ADED_DATA: "[DATA] Set AD/ED Data",
  RESET_ADEDS: "[DATA] Reset AD/ED Data",

  ADD_QUERY: "[DATA] Add Query",
  REMOVE_QUERY: "[DATA] Remove Query",
  SET_QUERY_PROP: "[DATA] Set Query Prop",
  CLEAR_QUERY_PROP: "[DATA] Clear Query Prop",
  TOGGLE_QUERY_COMPLETE: "[DATA] Toggle Query Complete",
  SET_QUERY_MIN_MAX: "[DATA] Set Query MinMax",
  SET_QUERIES_FROM_URL: "[DATA] Set Queries From URL",

  TOGGLE_PANEL_OPEN: "[UI] Toggle Panel Open",
  SET_IS_MOBILE: "[UI] Set Is Mobile",
};

export const ANY = "(Any)";

export const queryOrder: {
  label: string;
  key: RaceKeys;
}[] = [
  { label: "Year", key: RaceKeys.year },
  { label: "Race", key: RaceKeys.event },
  { label: "Office", key: RaceKeys.office },
  { label: "District", key: RaceKeys.district_key },
  { label: "Party", key: RaceKeys.party },
  { label: "Candidate", key: RaceKeys.unit_name },
];

export const Layout = {
  W: 300,
  H: 150,
  M: 30,
};
