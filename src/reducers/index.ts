import { combineReducers } from "redux";
import { State, Action } from "../interfaces";
import { Constants, queryOrder } from "../constants";
import { rollup } from "d3-array";

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
} = Constants;

const initMobile = window.innerWidth < 768;

const InitialState: State = {
  ui: {
    isMobile: initMobile,
    panelOpen: false,
    map: {
      zoom: 11,
      lat: 40.79,
      lng: -74.08, // for 3/4 across (desktop); -73.96 to center (mobile)
    },
  },
  data: {
    matches: [],
    queries: [
      {
        race: [],
        complete: false,
      },
    ],
    menu: new Map([]),
  },
};

function uiReducer(state = InitialState.ui, a: Action) {
  switch (a.type) {
    default: {
      return state;
    }
  }
}

const arrayToObj = (arr: [string, string][]): { [key: string]: string } =>
  arr.reduce((t, [k, v]) => ({ ...t, [k]: v }), {});

function dataReducer(state = InitialState.data, a: Action) {
  switch (a.type) {
    case GET_ASYNC_RESPONSE: {
      switch (a.payload.dataType) {
        case SET_MENU_DATA: {
          const nestedData = rollup(
            a.payload.data,
            (values: any) => values.map((v: any) => v.unit_name),
            (d: any) => d.event,
            //@ts-ignore
            (d: any) => d.office,
            (d: any) => d.district_key,
            (d: any) => d.party
          );
          return {
            ...state,
            menu: nestedData,
          };
        }
        case ADD_PCT_DATA: {
          const apiQueryObj = arrayToObj(a.payload.query);
          const nextQueryIndex = state.queries.findIndex(d =>
            d.race.length
              ? d.race.reduce(
                  (t, { key, value }) => t && apiQueryObj[key] === value,
                  true
                )
              : false
          );
          const nextQuery = state.queries[nextQueryIndex];
          console.log(nextQueryIndex, nextQuery);
          return {
            ...state,
            queries: [
              ...state.queries.slice(0, nextQueryIndex),
              {
                ...nextQuery,
                data: a.payload.data.map(
                  ({ ad, ed, tally, sum_tally, tally_pct }: any) => ({
                    ad,
                    ed,
                    tally,
                    sum_tally: +sum_tally,
                    tally_pct: +tally_pct,
                  })
                ),
              },
            ],
          };
        }
        case SET_ADED_DATA: {
          return {
            ...state,
            matches: a.payload.data.map((d: any) => d.aded),
          };
        }
        default: {
          return state;
        }
      }
    }
    case ADD_QUERY: {
      return {
        ...state,
        queries: [
          ...state.queries,
          {
            complete: false,
            race: [],
          },
        ],
      };
    }
    case REMOVE_QUERY: {
      const { index } = a.payload;
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, index),
          ...state.queries.slice(index + 1),
        ],
      };
    }
    case SET_QUERY_PROP: {
      const { index, key, value } = a.payload;
      const currentQuery = state.queries[index];
      console.log(index, key, value, currentQuery);
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, index),
          {
            ...currentQuery,
            race: [...currentQuery.race, { key, value }],
            complete: currentQuery.race.length + 1 === queryOrder.length,
          },
          ...state.queries.slice(index + 1),
        ],
      };
    }
    case CLEAR_QUERY_PROP: {
      const { index, key } = a.payload;
      const currentQuery = state.queries[index];
      const indexOfKey = currentQuery.race.findIndex(d => d.key === key);
      delete currentQuery.data;
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, index),
          {
            ...currentQuery,
            race: [...currentQuery.race.slice(0, indexOfKey)],
            complete: false,
          },
          ...state.queries.slice(index + 1),
        ],
      };
    }
    case SET_QUERY_MIN_MAX: {
      const { index, min, max } = a.payload;
      const currentQuery = state.queries[index];
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, index),
          {
            ...currentQuery,
            min: min,
            max: max,
          },
          ...state.queries.slice(index + 1),
        ],
      };
    }
    default: {
      return state;
    }
  }
}

const reducer = combineReducers({
  ui: uiReducer,
  data: dataReducer,
});

export default reducer;
