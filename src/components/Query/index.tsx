import React, { useState, useEffect } from "react";
import "./styles.scss";
import { useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { queryOrder } from "../../constants";
import Histogram from "../Histogram";
import { QueryProps, State } from "../../types";
import ExpandMore from "../../assets/expand_more-24px.svg";
import ExpandLess from "../../assets/expand_less-24px.svg";

import {
  displayFn,
  truthyOrZero,
  nextDropdownOptionsFromRace,
  fmt,
} from "../../utils";

const Query = ({
  query: { data, complete, race, min, max },
  queryId,
  removeCallback,
  addCallback,
  minMaxCallback,
}: QueryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const menu = useSelector((state: State) => state.data.menu);
  const queryDropdownOptions = nextDropdownOptionsFromRace(menu, race, complete);

  useEffect(() => {
    // always reopen if going into edit mode
    if (!data) {
      setIsOpen(true);
    }
  }, [data]);

  return (
    <div className="Query" key={`query-${queryId}`}>
      <div className="query-tag">{queryId + 1}</div>
      {complete ? (
        <img
          className="query-toggle-open"
          alt="toggle-arrow"
          src={isOpen ? ExpandLess : ExpandMore}
          onClick={() => setIsOpen(!isOpen)}
        />
      ) : null}
      {race.map(({ key, value }, j) =>
        isOpen ? (
          <div key={key} className="query-line">
            <div className="query-line-header">{queryOrder[j].label}</div>
            <Button
              className="query-button"
              onClick={() => removeCallback(queryId, key)}
              variant="secondary"
            >
              {displayFn(key, value)}
            </Button>
          </div>
        ) : (
          <div key={key} className="query-short-line">
            {value}
          </div>
        )
      )}
      {queryDropdownOptions.length ? (
        <Dropdown>
          <Dropdown.Toggle
            variant="primary"
            id="dropdown-basic"
            className="query-dropdown"
          >
            {queryOrder[race.length].label}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {queryDropdownOptions.map(option => (
              <Dropdown.Item
                className="query-dropdown"
                onClick={() =>
                  addCallback(queryId, queryOrder[race.length].key, option)
                }
                key={option}
              >
                {displayFn(queryOrder[race.length].key, option)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ) : null}
      {data ? (
        <div className="query-line">
          <div className="query-line-header">
            Range
            {truthyOrZero(min) && truthyOrZero(max) ? (
              <div>{`${fmt(min || 0).slice(0, -1)}-${fmt(max || 0)}`}</div>
            ) : (
              <div>
                <strong>Click/drag</strong>
              </div>
            )}
          </div>
          <Histogram data={data} onBrushEnd={mm => minMaxCallback(queryId, mm)} />
        </div>
      ) : null}
    </div>
  );
};

export default Query;
