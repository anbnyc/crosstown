import React, { useState, useEffect } from "react";
import "./styles.scss";
import { useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { format } from "d3";
import { queryOrder } from "../../constants";
import Histogram from "../Histogram";
import { QueryProps, State } from "../../interfaces";
import ExpandMore from "../../assets/expand_more-24px.svg";
import ExpandLess from "../../assets/expand_less-24px.svg";

import {
  displayBlankAsNA,
  truthyOrZero,
  nextDropdownOptionsFromRace,
} from "../../utils";

const fmt = format(".2p");

const Query = ({
  d,
  i,
  removeCallback,
  addCallback,
  minMaxCallback,
}: QueryProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const menu = useSelector((state: State) => state.data.menu);
  const queryDropdownOptions = nextDropdownOptionsFromRace(menu, d);

  useEffect(() => {
    // always reopen if going into edit mode
    if (isOpen && !d.data) {
      setIsOpen(true);
    }
  }, [d.data, isOpen]);

  return (
    <div className="query" key={`query-${i}`}>
      {d.complete && truthyOrZero(d.min) && truthyOrZero(d.max) ? (
        <img
          className="query-toggle-open"
          alt="toggle-arrow"
          src={isOpen ? ExpandLess : ExpandMore}
          onClick={() => setIsOpen(!isOpen)}
        />
      ) : null}
      {d.race.map(({ key, value }, j) =>
        isOpen ? (
          <div key={key} className="query-line">
            <div className="query-line-header">{queryOrder[j].label}</div>
            <Button
              className="query-button"
              onClick={() => removeCallback(i, key)}
              variant="secondary"
            >
              {displayBlankAsNA(value)}
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
            {queryOrder[d.race.length].label}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {queryDropdownOptions.map(option => (
              <Dropdown.Item
                className="query-dropdown"
                onClick={() =>
                  addCallback(i, queryOrder[d.race.length].key, option)
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
        <div className="query-line">
          <div className="query-line-header">
            Range
            {truthyOrZero(d.min) && truthyOrZero(d.max) ? (
              <div>{`${fmt(d.min || 0).slice(0, -1)}-${fmt(d.max || 0)}`}</div>
            ) : (
              ""
            )}
          </div>
          <Histogram data={d.data} onBrushEnd={mm => minMaxCallback(i, mm)} />
        </div>
      ) : null}
    </div>
  );
};

export default Query;
