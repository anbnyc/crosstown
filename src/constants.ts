import { raceKeys } from "./interfaces";

export const Constants = {
  GET_ASYNC_RESPONSE: "Get Async Response",
  SET_MENU_DATA: "[DATA] Set Menu Data",
  ADD_PCT_DATA: "[DATA] Add Pct Data",
  SET_ADED_DATA: "[DATA] Set AD/ED Data",

  ADD_QUERY: "[DATA] Add Query",
  REMOVE_QUERY: "[DATA] Remove Query",
  SET_QUERY_PROP: "[DATA] Set Query Prop",
  CLEAR_QUERY_PROP: "[DATA] Clear Query Prop",
  TOGGLE_QUERY_COMPLETE: "[DATA] Toggle Query Complete",
  SET_QUERY_MIN_MAX: "[DATA] Set Query MinMax",

  TOGGLE_PANEL_OPEN: "[UI] Toggle Panel Open",
  SET_IS_MOBILE: "[UI] Set Is Mobile",

  TALLY_PCT: "tally_pct",
  SUM_TALLY: "sum_tally",
  TALLY: "tally",
};

export const queryOrder: {
  label: string;
  key: raceKeys;
}[] = [
  { label: "Year", key: "year" },
  { label: "Race", key: "event" },
  { label: "Office", key: "office" },
  { label: "District", key: "district_key" },
  { label: "Party", key: "party" },
  { label: "Candidate", key: "unit_name" },
];

export const Layout = {
  W: 300,
  H: 150,
  M: 30,
};
