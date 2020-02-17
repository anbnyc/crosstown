import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { State } from "../../interfaces";
import mapboxgl from "mapbox-gl";
import "./styles.scss";

import mn from "./mn.json";
import { asyncCallEndpoint } from "../../actions";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/
const Map = () => {
  const dispatch = useDispatch();
  const mapSettings = useSelector((state: State) => {
    return state.ui.map;
  });
  const matches = useSelector((state: State) => state.data.matches);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    //@ts-ignore
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [mapSettings.lng, mapSettings.lat],
      zoom: mapSettings.zoom,
    });

    map.on("load", function() {
      map.addSource("mn", {
        type: "geojson",
        data: mn,
      });

      map.addLayer({
        id: "eds",
        type: "fill",
        source: "mn",
        paint: {
          "fill-color": "#ddd",
          "fill-outline-color": "#fff",
          "fill-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "eds-in-filter",
        type: "fill",
        source: "mn",
        paint: {
          "fill-color": "#3f3",
          "fill-outline-color": "#fff",
          "fill-opacity": 0.8,
        },
        filter: ["in", "elect_dist"],
      });

      // don't request matches until map has finished loading
      // to ensure the below useEffect catches it
      // (solves problem where load was finishing after matches returned)
      dispatch(asyncCallEndpoint("aded", []));
    });

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && matches.length) {
      // @ts-ignore
      map.setFilter("eds-in-filter", ["in", "elect_dist", ...matches]);
    }
  }, [matches]);

  return <div className="Map" ref={mapContainer}></div>;
};

export default Map;
