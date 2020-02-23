import React from "react";
import "./styles.scss";
import { useSelector, useDispatch } from "react-redux";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import { State, raceKeys } from "../../interfaces";
import { queryOrder } from "../../constants";
import {
  asyncCallEndpoint,
  setQueryProp,
  clearQueryProp,
  setQueryMinMax,
  addQuery,
  removeQuery,
} from "../../actions";
import {
  displayBlankAsNA,
  truthyOrZero,
  nextDropdownOptionsFromRace,
} from "../../utils";

import Histogram from "../Histogram";

const Panel: React.FC = () => {
  const dispatch = useDispatch();

  const queries = useSelector((state: State) => state.data.queries);
  const menu = useSelector((state: State) => state.data.menu);
  const isPanelOpen = useSelector((state: State) => state.ui.isPanelOpen);

  const addToNewQuery = (index: number, nextKey: string, nextValue: string) => {
    dispatch(setQueryProp(index, nextKey, nextValue));
    // this prop will complete this query's raceQuery
    if (queries[index].race.length + 1 === queryOrder.length) {
      dispatch(
        asyncCallEndpoint("pct", [
          ...queries[index].race
            .filter(e => e.key !== "year") // synthetic variable for organizing dropdown menu
            .map(({ key, value }) => [key, value]),
          [nextKey, nextValue],
        ])
      );
    }
  };

  const removeFromNewQuery = (index: number, nextKey: raceKeys) => {
    dispatch(clearQueryProp(index, nextKey));
  };

  const onAddQuery = () => {
    dispatch(addQuery());
  };

  const onDeleteQuery = (index: number) => {
    dispatch(removeQuery(index));
  };

  const applyMinMax = (index: number, minMax: [number, number]) => {
    dispatch(setQueryMinMax(index, ...minMax));

    // in addition to updating this query in Store,
    // dispatch a new request for matching AD/EDs
    const nextQueries = [
      ...queries.slice(0, index),
      {
        ...queries[index],
        min: minMax[0],
        max: minMax[1],
      },
      ...queries.slice(index + 1),
    ]
      .filter(d => d.complete && truthyOrZero(d.min) && truthyOrZero(d.max))
      .map(d => [
        ...d.race
          .filter(e => e.key !== "year") // synthetic variable for organizing dropdown menu
          .map(({ key, value }) => [key, value]),
        ["tally_pct-min", d.min],
        ["tally_pct-max", d.max],
      ])
      .flat();

    if (nextQueries.length === 0) {
      dispatch(asyncCallEndpoint("aded", []));
    } else {
      dispatch(asyncCallEndpoint("filter", nextQueries));
    }
  };

  return (
    <div className={"Panel " + (isPanelOpen ? "open" : "")}>
      <div className="header">
        <h2>Crosstown</h2>
        <p>Build visual queries of NYC election results.</p>
      </div>
      <div className="body">
        {queries.map((d, i) => {
          const queryDropdownOptions = nextDropdownOptionsFromRace(menu, d);
          return (
            <div className="query" key={`query-${i}`}>
              {d.race.map(({ key, value }, j) => (
                <div key={key} className="query-line">
                  <div className="query-line-header">{queryOrder[j].label}</div>
                  <Button
                    className="query-button"
                    onClick={() => removeFromNewQuery(i, key)}
                    variant="secondary"
                  >
                    {displayBlankAsNA(value)}
                  </Button>
                </div>
              ))}
              {queryDropdownOptions.length ? (
                <Dropdown>
                  <Dropdown.Toggle
                    variant="primary"
                    id="dropdown-basic"
                    className="query-dropdown"
                  >
                    {queryOrder[d.race.length].label}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {queryDropdownOptions.map(option => (
                      <Dropdown.Item
                        className="query-dropdown"
                        onClick={() =>
                          addToNewQuery(
                            i,
                            queryOrder[d.race.length].key,
                            option
                          )
                        }
                        key={option}
                      >
                        {displayBlankAsNA(option)}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              ) : null}
              {d.data ? (
                <Histogram
                  data={d.data}
                  onBrushEnd={mm => applyMinMax(i, mm)}
                />
              ) : null}
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
          );
        })}
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
