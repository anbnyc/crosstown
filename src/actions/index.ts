import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { ActionTypes, Action } from "../types";
import { Constants } from "../constants";
import { Dispatch } from "react";

const {
  GET_ASYNC_RESPONSE,
  SET_MENU_DATA,
  ADD_PCT_DATA,
  SET_ADED_DATA,
  ADD_QUERY,
  REMOVE_QUERY,
  SET_QUERY_PROP,
  CLEAR_QUERY_PROP,
  SET_QUERY_MIN_MAX,
  TOGGLE_PANEL_OPEN,
  SET_IS_MOBILE,
  SET_QUERIES_FROM_URL,
  RESET_ADEDS
} = Constants;

const dataTypeLookup: { [key: string]: string } = {
  menu: SET_MENU_DATA,
  pct: ADD_PCT_DATA,
  aded: SET_ADED_DATA,
  filter: SET_ADED_DATA,
};

const API_URL = process.env.REACT_APP_API_URL || "/api";

const makeActionCreator = (type: string, ...argNames: string[]) => {
  return function(...args: any[]) {
    const action: Action = { type, payload: {} };
    for (let index = 0; index < argNames.length; index++){
      action.payload[argNames[index]] = args[index];
    }
    return action;
  };
};

export const asyncCallEndpoint = (
  endpoint: string,
  query: string[][] = []
): ThunkAction<Promise<void>, unknown, unknown, AnyAction> =>
  async (dispatch: Dispatch<AnyAction>) => {
    const queryString = query
      .map(([k, v]: string[]) => `${k}=${v}`)
      .join("&");

    fetch(`${API_URL}/${endpoint}?${queryString}`)
      .catch(e => console.log("error in asyncCallEndpoint:", e))
      .then(response => (response as Response).json())
      .then(data => {
        dispatch(getAsyncResponse(dataTypeLookup[endpoint], data, query));
      });
  };

export const togglePanel = makeActionCreator(ActionTypes.TOGGLE_PANEL);
export const getAsyncResponse = makeActionCreator(
  GET_ASYNC_RESPONSE,
  "dataType",
  "data",
  "query"
);
export const addQuery = makeActionCreator(ADD_QUERY);
export const removeQuery = makeActionCreator(REMOVE_QUERY, "index");
export const setQueryProp = makeActionCreator(
  SET_QUERY_PROP,
  "index",
  "key",
  "value"
);
export const clearQueryProp = makeActionCreator(
  CLEAR_QUERY_PROP,
  "index",
  "key"
);
export const setQueryMinMax = makeActionCreator(
  SET_QUERY_MIN_MAX,
  "index",
  "min",
  "max"
);
export const setQueriesFromUrl = makeActionCreator(
  SET_QUERIES_FROM_URL,
  "queries")
;
export const resetAdeds = makeActionCreator(RESET_ADEDS);

export const togglePanelOpen = makeActionCreator(TOGGLE_PANEL_OPEN);
export const setIsMobile = makeActionCreator(SET_IS_MOBILE, "isMobile");

// export const toggleQueryComplete = makeActionCreator(
//   TOGGLE_QUERY_COMPLETE
// );
