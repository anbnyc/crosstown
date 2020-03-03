import { combineReducers } from "redux";
import { State, Action } from "../interfaces";
import { Constants, queryOrder } from "../constants";
import { rollup } from "d3-array";
import { nextDropdownOptionsFromRace } from "../utils";

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

const initMobile = window.innerWidth < 768;

const InitialState: State = {
  ui: {
    isMobile: initMobile,
    isPanelOpen: false,
    map: {
      zoom: 11,
      lat: 40.79,
      lngDesktop: -74.08, // 3/4 across
      lngMobile: -73.96, // 1/2 across
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
    case TOGGLE_PANEL_OPEN: {
      return {
        ...state,
        isPanelOpen: !state.isPanelOpen,
      };
    }
    case SET_IS_MOBILE: {
      return {
        ...state,
        isMobile: a.payload.isMobile,
      };
    }
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
            (d: any) => d.event.slice(-4), // year = synthetic variable for organizing the menu
            //@ts-ignore
            (d: any) => d.event,
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
              ? d.race
                  .filter(e => e.key !== "year")
                  .reduce(
                    (t, { key, value }) => t && apiQueryObj[key] === value,
                    true
                  )
              : false
          );
          const nextQuery = state.queries[nextQueryIndex];
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
      const nextQuery = {
        ...currentQuery,
        race: [...currentQuery.race, { key, value }],
        complete: currentQuery.race.length + 1 === queryOrder.length,
      };

      // if there is only one next dropdown option available, automatically select it
      // and repeat until the menu has multiple options
      // (the last level, Candidate, should always have multiple options because *there was a race*)
      let nextDropdownOptions = nextDropdownOptionsFromRace(
        state.menu,
        nextQuery
      );
      while (nextDropdownOptions.length === 1) {
        nextQuery.race.push({
          key: queryOrder[nextQuery.race.length].key,
          value: nextDropdownOptions[0],
        });
        nextDropdownOptions = nextDropdownOptionsFromRace(
          state.menu,
          nextQuery
        );
      }

      return {
        ...state,
        queries: [
          ...state.queries.slice(0, index),
          nextQuery,
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