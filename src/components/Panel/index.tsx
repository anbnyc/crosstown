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
} from "../../actions";
import { displayBlankAsNA } from "../../utils";

import Histogram from "../Histogram";

const Panel: React.FC = () => {
  const dispatch = useDispatch();

  const queries = useSelector((state: State) => state.data.queries);
  const menu = useSelector((state: State) => state.data.menu);

  const lastQuery = queries[queries.length - 1];
  const lastQueryRace = lastQuery.race;
  let dropdownOptions: string[] = [];
  if (lastQueryRace.length === 0) {
    dropdownOptions = Array.from(menu.keys());
  } else if (!lastQuery.complete) {
    // @ts-ignore // TODO fix
    const mapOrArray = lastQueryRace.reduce((t, v) => t.get(v.value), menu);

    // check if we've reached the deepest level of the nested Map
    // if so, just provide the values Array
    // else, give the keys so we can go a level deeper
    dropdownOptions =
      mapOrArray instanceof Map ? Array.from(mapOrArray.keys()) : mapOrArray;
  }

  const addToNewQuery = (nextKey: string, nextValue: string) => {
    dispatch(setQueryProp(nextKey, nextValue));
    // this prop will complete the raceQueries
    if (lastQueryRace.length + 1 === queryOrder.length) {
      dispatch(
        asyncCallEndpoint("pct", [
          ...lastQueryRace.map(({ key, value }) => [key, value]),
          [nextKey, nextValue],
        ])
      );
    }
  };

  const removeFromNewQuery = (nextKey: raceKeys) => {
    dispatch(clearQueryProp(nextKey));
  };

  const deleteQuery = () => {
    // TODO dispatch...
  };

  const applyMinMax = (index: number, minMax: [number, number]) => {
    dispatch(setQueryMinMax(index, ...minMax));
  };

  return (
    <div className="Panel">
      <div className="header">
        <h2>Crosstown</h2>
        <p>Build visual queries of NYC election results.</p>
      </div>
      <div className="body">
        {queries.map((d, i) => (
          <div className="query" key={`query-${i}`}>
            {d.race.map(({ key, value }, i) => (
              <div key={key} className="query-line">
                <div className="query-line-header">{queryOrder[i].label}</div>
                <Button onClick={() => removeFromNewQuery(key)}>
                  {displayBlankAsNA(value)}
                </Button>
              </div>
            ))}
            {i === queries.length - 1 && dropdownOptions.length ? (
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  {queryOrder[lastQueryRace.length].label}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {dropdownOptions.map(option => (
                    <Dropdown.Item
                      onClick={() =>
                        addToNewQuery(
                          queryOrder[lastQueryRace.length].key,
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
              <Histogram data={d.data} onBrushEnd={mm => applyMinMax(i, mm)} />
            ) : null}
            {queries.length > 1 && i < queries.length - 1 ? (
              <Button variant="warning">Remove Query</Button>
            ) : null}
          </div>
        ))}
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
