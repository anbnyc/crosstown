import React, { useEffect } from "react";
import Map from "../Map";
import { useDispatch } from "react-redux";
import { asyncCallEndpoint } from "../../actions";
import "./styles.scss";
import Panel from "../Panel";

import "bootstrap/dist/css/bootstrap.min.css";

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(asyncCallEndpoint("menu", []));
  }, []);

  // TODO window resize

  return (
    <div className="App">
      <Panel />
      <Map />
    </div>
  );
};

export default App;
