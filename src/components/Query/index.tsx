import React, { useState, useEffect } from "react";
import "./styles.scss";
import { useSelector } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
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
  query: { data, complete, race, min, max, byUnitName },
  queryId,
  removeCallback,
  addCallback,
  minMaxCallback,
  onUnitNameToggle,
}: QueryProps): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(true);
  const menu = useSelector((state: State) => state.data.menu);
  let queryDropdownOptions = nextDropdownOptionsFromRace(
    menu,
    race,
    complete
  );

  /**
   * clip party names and show candidate name only if 3 conditions are met:
   * user is on the last RaceKey, which is unit_name
   * candidate appears for >1 party (ie list length is different after clipping)
   * the user has toggled it on
   */
  const checkUnitNameValues = race.length >= queryOrder.length - 1;
  let showByUnitNameToggle = false;
  if (checkUnitNameValues) {
    const unitNameValues = Array.from(
      new Set(queryDropdownOptions.map(d => d.split(" (")[0]))
    ).sort();
    showByUnitNameToggle = unitNameValues.length < queryDropdownOptions.length;
    if (showByUnitNameToggle && byUnitName){
      queryDropdownOptions = unitNameValues;
    }
  }

  useEffect(() => {
    // always reopen if going into edit mode
    if (!data) {
      setIsOpen(true);
    }
  }, [data]);

  const hasMinMax = truthyOrZero(min) && truthyOrZero(max);
  const minMaxValue = `${fmt(min || 0).slice(0, -1)}-${fmt(max || 0)}`;

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
      {!isOpen && hasMinMax &&
        <div className="query-short-line">{minMaxValue}</div>}
      {queryDropdownOptions.length ? (
        <div className="query-dropdown-toggle"><Dropdown>
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
        {showByUnitNameToggle && <Form><Form.Check
          type="switch"
          id="unit-name-toggle"
          label="Group by candidate, not party"
          onChange={(e: React.FormEvent) => {
            onUnitNameToggle(queryId, (e.target as HTMLInputElement).checked);
          }}
        /></Form>}
        </div>
      ) : null}
      {data && isOpen && (
        <div className="query-line">
          <div className="query-line-header">
            Range
            {hasMinMax ? (
              <div>{minMaxValue}</div>
            ) : (
              <div>
                <strong>Click/drag</strong>
              </div>
            )}
          </div>
          <Histogram
            data={data}
            onBrushEnd={mm => minMaxCallback(queryId, mm)}
            brushMin={min}
            brushMax={max}
          />
        </div>
      )}
    </div>
  );
};

export default Query;
