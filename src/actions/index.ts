import { ThunkAction } from "redux-thunk";
import { AnyAction } from "redux";
import { ActionTypes, Action } from "../interfaces";
import { Constants } from "../constants";

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
} = Constants;

const dataTypeLookup: { [key: string]: string } = {
  menu: SET_MENU_DATA,
  pct: ADD_PCT_DATA,
  aded: SET_ADED_DATA,
  filter: SET_ADED_DATA,
};

const API_PATH = "/api";

const makeActionCreator = (type: string, ...argNames: string[]) => {
  return function(...args: any[]) {
    const action: Action = { type, payload: {} };
    argNames.forEach((arg: string, index: number) => {
      action.payload[argNames[index]] = args[index];
    });
    return action;
  };
};

export const asyncCallEndpoint = (
  endpoint: string,
  query: any[]
): ThunkAction<Promise<void>, {}, {}, AnyAction> => async (dispatch: any) => {
  fetch(
    `${API_PATH}/${endpoint}?${query
      .map(([k, v]: [string, string, string]) => `${k}=${v}`)
      .join("&")}`
  )
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

export const togglePanelOpen = makeActionCreator(TOGGLE_PANEL_OPEN);
export const setIsMobile = makeActionCreator(SET_IS_MOBILE, "isMobile");

// export const toggleQueryComplete = makeActionCreator(
//   TOGGLE_QUERY_COMPLETE
// );
