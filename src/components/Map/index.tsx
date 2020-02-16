import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { State } from "../../interfaces";
import mapboxgl from "mapbox-gl";
import "./styles.scss";

import mn from "./mn.json";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/
const Map = () => {
  const [mbLoaded, setMbLoaded] = useState(false);
  const mapSettings = useSelector((state: State) => {
    return state.ui.map;
  });
  const matches = useSelector((state: State) => state.data.matches).slice(
    0,
    500
  );
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    console.log(matches);
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
          "fill-color": "#f03",
          "fill-outline-color": "#fff",
        },
      });

      map.addLayer({
        id: "eds-in-filter",
        type: "fill",
        source: "mn",
        paint: {
          "fill-color": "#30f",
          "fill-outline-color": "#fff",
        },
        filter: ["in", "elect_dist", ...matches],
      });

      setMbLoaded(true);
      console.log("load complete");
    });

    mapRef.current = map;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map && mbLoaded) {
      // @ts-ignore
      map.setFilter("eds-in-filter", ["in", "elect_dist", ...matches]);
    }
  }, [matches]);

  return <div className="Map" ref={mapContainer}></div>;
};

export default Map;
