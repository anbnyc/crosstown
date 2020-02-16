import { combineReducers } from "redux";
import { State, Action } from "../interfaces";
import { Constants, queryOrder } from "../constants";
import { rollup } from "d3-array";

const {
  GET_ASYNC_RESPONSE,
  SET_MENU_DATA,
  ADD_PCT_DATA,
  SET_ADED_DATA,
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
          const nextQuery = state.queries[state.queries.length - 1];
          return {
            ...state,
            queries: [
              ...state.queries.slice(0, -1),
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
              // add a new Query when old one is complete
              ...(nextQuery.complete
                ? [
                    {
                      complete: false,
                      race: [],
                    },
                  ]
                : []),
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
    case SET_QUERY_PROP: {
      const currentQuery = state.queries[state.queries.length - 1];
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, -1),
          {
            ...currentQuery,
            race: [...currentQuery.race, { ...a.payload }],
            complete: currentQuery.race.length + 1 === queryOrder.length,
          },
        ],
      };
    }
    case CLEAR_QUERY_PROP: {
      const currentQuery = state.queries[state.queries.length - 1];
      const indexOfKey = currentQuery.race.findIndex(
        d => d.key === a.payload.key
      );
      delete currentQuery.data;
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, -1),
          {
            ...currentQuery,
            race: [...currentQuery.race.slice(0, indexOfKey)],
            complete: false,
          },
        ],
      };
    }
    case SET_QUERY_MIN_MAX: {
      const currentQuery = state.queries[a.payload.index];
      return {
        ...state,
        queries: [
          ...state.queries.slice(0, a.payload.index),
          {
            ...currentQuery,
            min: a.payload.min,
            max: a.payload.max,
          },
          ...state.queries.slice(a.payload.index + 1),
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
