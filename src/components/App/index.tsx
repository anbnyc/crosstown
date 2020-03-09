import React, { useEffect } from "react";
import Map from "../Map";
import { useDispatch, useSelector } from "react-redux";
import { asyncCallEndpoint, togglePanelOpen, setIsMobile } from "../../actions";
import "./styles.scss";
import Panel from "../Panel";
import MenuIcon from "../../assets/menu-24px.svg";

import "bootstrap/dist/css/bootstrap.min.css";
import { State } from "../../interfaces";

const App: React.FC = () => {
  const isMobile = useSelector((state: State) => state.ui.isMobile);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(asyncCallEndpoint("menu", []));
  }, [dispatch]);

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
