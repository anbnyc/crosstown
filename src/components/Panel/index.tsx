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
import { displayBlankAsNA } from "../../utils";

import Histogram from "../Histogram";

const Panel: React.FC = () => {
  const dispatch = useDispatch();

  const queries = useSelector((state: State) => state.data.queries);
  const menu = useSelector((state: State) => state.data.menu);

  const addToNewQuery = (index: number, nextKey: string, nextValue: string) => {
    dispatch(setQueryProp(index, nextKey, nextValue));
    // this prop will complete this query's raceQuery
    if (queries[index].race.length + 1 === queryOrder.length) {
      dispatch(
        asyncCallEndpoint("pct", [
          ...queries[index].race.map(({ key, value }) => [key, value]),
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
      .filter(d => d.complete && d.min && d.max)
      .map(d => [
        ...d.race.map(({ key, value }) => [key, value]),
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
    <div className="Panel">
      <div className="header">
        <h2>Crosstown</h2>
        <p>Build visual queries of NYC election results.</p>
      </div>
      <div className="body">
        {queries.map((d, i) => {
          let queryDropdownOptions: string[] = [];
          if (d.race.length === 0) {
            queryDropdownOptions = Array.from(menu.keys());
          } else if (!d.complete) {
            // @ts-ignore // TODO fix
            const mapOrArray = d.race.reduce((t, v) => t.get(v.value), menu);

            // check if we've reached the deepest level of the nested Map
            // if so, just provide the values Array
            // else, give the keys so we can go a level deeper
            queryDropdownOptions =
              mapOrArray instanceof Map
                ? Array.from(mapOrArray.keys())
                : mapOrArray;
          }
          return (
            <div className="query" key={`query-${i}`}>
              {d.race.map(({ key, value }, j) => (
                <div key={key} className="query-line">
                  <div className="query-line-header">{queryOrder[j].label}</div>
                  <Button
                    onClick={() => removeFromNewQuery(i, key)}
                    variant="secondary"
                  >
                    {displayBlankAsNA(value)}
                  </Button>
                </div>
              ))}
              {queryDropdownOptions.length ? (
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    {queryOrder[d.race.length].label}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {queryDropdownOptions.map(option => (
                      <Dropdown.Item
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
                <Button variant="warning" onClick={() => onDeleteQuery(i)}>
                  Remove Query
                </Button>
              ) : null}
            </div>
          );
        })}
        <div>
          <Button
            className="add-new-query"
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
