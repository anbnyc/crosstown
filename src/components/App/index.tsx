import React, { useEffect } from "react";
import Map from "../Map";
import { useDispatch, useSelector } from "react-redux";
import {StringParam, useQueryParams} from "use-query-params";

import {
  asyncCallEndpoint,
  togglePanelOpen,
  setIsMobile,
  setQueriesFromUrl
} from "../../actions";
import "./styles.scss";
import Panel from "../Panel";
import MenuIcon from "../../assets/menu-24px.svg";

import "bootstrap/dist/css/bootstrap.min.css";
import { State } from "../../types";

import {
  deserializeQueriesToParams,
  filterReal,
  isQueryComplete,
  serializeQueriesToParams
} from "../../utils";

const App: React.FC = () => {
  const isMobile = useSelector((state: State) => state.ui.isMobile);
  const dispatch = useDispatch();
  const queries = useSelector((state: State) => state.data.queries);
  const [query, setQuery] = useQueryParams({
    year: StringParam,
    event: StringParam,
    office: StringParam,
    district_key: StringParam,
    party: StringParam,
    unit_name: StringParam,
    min: StringParam,
    max: StringParam
  });

  // on initial load
  useEffect(() => {
    // get data for menu and map
    dispatch(asyncCallEndpoint("menu"));
    dispatch(asyncCallEndpoint("aded"));

    // parse URL params into queries
    const nextQueries = deserializeQueriesToParams(query);
    dispatch(setQueriesFromUrl(nextQueries));

  }, [dispatch]);

  // when queries change
  useEffect(() => {
    // sync URL with queries in state
    const serializedQuery = serializeQueriesToParams(queries);
    setQuery(serializedQuery, "replace");

    // fetch data for any complete queries without data
    queries
      .filter(q => isQueryComplete(q) && !q.data)
      .forEach(q => {
        dispatch(
          asyncCallEndpoint(`pct/${q.byUnitName ? "unitName" : "party"}`,
            q.race
              .filter(filterReal)
              .map(({ key, value }) => [key, value])
          )
        );
      });
  }, [queries, setQuery]);

  useEffect(() => {
    const onResize = () => {
      dispatch(setIsMobile(window.innerWidth <= 768));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dispatch]);

  return (
    <div className="App">
      <div className="toggle-panel">
        {isMobile ? (
          <img
            src={MenuIcon}
            alt="hamburger-menu"
            onClick={() => {
              dispatch(togglePanelOpen());
            }}
          />
        ) : null}
      </div>
      <Panel />
      <Map />
    </div>
  );
};

export default App;
