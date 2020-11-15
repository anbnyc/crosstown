import React, {useEffect} from "react";
import "./styles.scss";
import { useSelector, useDispatch } from "react-redux";
import { format } from "d3";

import Button from "react-bootstrap/Button";
import { State, RaceKeys } from "../../types";
import {
  asyncCallEndpoint,
  setQueryProp,
  clearQueryProp,
  setQueryMinMax,
  removeQuery,
  addQuery,
  resetAdeds,
} from "../../actions";
import { truthyOrZero } from "../../utils";
import { queryOrder } from "../../constants";

import Query from "../Query";

const fmt = format(",.0f");

const Panel: React.FC = () => {
  const dispatch = useDispatch();

  const queries = useSelector((state: State) => state.data.queries);
  const nMatches = useSelector((state: State) => state.data.matches.length);
  const isPanelOpen = useSelector((state: State) => state.ui.isPanelOpen);

  // sync data and URL params with changed queries
  useEffect(() => {
    const nextQueries = queries
      .filter(d => d.complete && truthyOrZero(d.min) && truthyOrZero(d.max))

    const nextQueriesFilter = nextQueries
      .map(d => [
        ...d.race
          .filter(e => e.key !== RaceKeys.year) // synthetic variable for organizing dropdown menu
          .map(({ key, value }) => [key, value]),
        ["tally_pct-min", d.min],
        ["tally_pct-max", d.max],
      ])
      .flat();

    // dispatch a new request for matching AD/EDs, or clear filters
    if (nextQueries.length === 0) {
      dispatch(resetAdeds());
    } else {
      dispatch(asyncCallEndpoint("filter", nextQueriesFilter));
    }

    // TODO call "pct" for all queries without data

  }, [queries, dispatch])

  const addToNewQuery = (index: number, nextKey: RaceKeys, nextValue: string) => {
    dispatch(setQueryProp(index, nextKey, nextValue));
    // this prop will complete this query's raceQuery
    if (queries[index].race.length + 1 === queryOrder.length) {
      dispatch(
        asyncCallEndpoint("pct", [
          ...queries[index].race
            .filter(e => e.key !== RaceKeys.year) // synthetic variable for organizing dropdown menu
            .map(({ key, value }) => [key, value]),
          [nextKey, nextValue],
        ])
      );
    }
  };

  const removeFromNewQuery = (index: number, nextKey: RaceKeys) => {
    dispatch(clearQueryProp(index, nextKey));
    const nextQueries = [
      ...queries.slice(0, index),
      ...queries.slice(index + 1),
    ].filter(d => d.complete && truthyOrZero(d.min) && truthyOrZero(d.max));
    if (nextQueries.length === 0) {
      dispatch(resetAdeds());
    }
  };

  const onDeleteQuery = (index: number) => {
    dispatch(removeQuery(index));
  };

  const applyMinMax = (index: number, minMax: [number, number]) => {
    // update this query in Store
    dispatch(setQueryMinMax(index, ...minMax));
  };

  const onAddQuery = () => {
    dispatch(addQuery());
  };

  return (
    <div className={"Panel " + (isPanelOpen ? "open" : "")}>
      <div className="header">
        <h2>
          Crosstown
          <span className="ed-count">{fmt(nMatches)} EDs</span>
        </h2>
        <p>Build visual queries of NYC election results</p>
      </div>
      <div className="body">
        {queries.map((d, i) => (
          <div key={`query-${i}`} className="query-container">
            <Query
              d={d}
              i={i}
              addCallback={addToNewQuery}
              removeCallback={removeFromNewQuery}
              minMaxCallback={applyMinMax}
            />
            {queries.length > 1 && i < queries.length - 1 ? (
              <div>
                <Button
                  variant="warning"
                  onClick={() => onDeleteQuery(i)}
                  className="query-button"
                >
                  Remove Query
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        <div>
          <Button
            className="add-new-query query-button"
            variant="success"
            onClick={() => onAddQuery()}
          >
            Add New Query
          </Button>
        </div>
      </div>
      <div className="footer">
        <p>
          Data from <a href="https://vote.nyc">vote.nyc</a>. Designed and
          developed by Alec Barrett.
        </p>
      </div>
    </div>
  );
};

export default Panel;
