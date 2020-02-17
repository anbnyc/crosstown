import { raceKeys } from "./interfaces";

export const Constants = {
  GET_ASYNC_RESPONSE: "Get Async Response",
  SET_MENU_DATA: "Set Menu Data",
  ADD_PCT_DATA: "Add Pct Data",
  SET_ADED_DATA: "Set AD/ED Data",

  ADD_QUERY: "Add Query",
  REMOVE_QUERY: "Remove Query",
  SET_QUERY_PROP: "Set Query Prop",
  CLEAR_QUERY_PROP: "Clear Query Prop",
  TOGGLE_QUERY_COMPLETE: "Toggle Query Complete",
  SET_QUERY_MIN_MAX: "Set Query MinMax",

  TALLY_PCT: "tally_pct",
  SUM_TALLY: "sum_tally",
  TALLY: "tally",
};

export const queryOrder: {
  label: string;
  key: raceKeys;
}[] = [
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
