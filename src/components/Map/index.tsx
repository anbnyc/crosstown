import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { State, TooltipObject } from "../../types";
import mapboxgl, { Map as MapType } from "mapbox-gl";
import { geoCentroid } from "d3";
import "./styles.scss";

import nyced from "./nyc.json";
import nycad from "./nycad.json";
import { fmt } from "../../utils";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

const getTooltipHtml = (ed: string, adedData: TooltipObject[]): string =>
  `<div style="padding-top:5px;text-align:right;">
    ED: <strong>${ed}</strong>
    ${adedData
    .map(
      ({ tally, tally_pct, sum_tally }, i) =>
        `<div class='popup-row'>
            <div class='query-tag'>
              ${i + 1}${" "}
            </div>
            <div class='popup-column'>
              <div class='query-value query-value--bold'>
                ${fmt(tally_pct)}${" "}
              </div>
              <div class='query-value'>
                (${tally} out of ${sum_tally})
              </div>
            </div>
          </div>`
    )
    .join("")}
  </div>`;

// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/
const MapComponent = (): React.ReactElement => {
  const mapSettings = useSelector((state: State) => {
    return state.ui.map;
  });
  const isMobile = useSelector((state: State) => state.ui.isMobile);
  const matches = useSelector((state: State) => state.data.matches);
  const lookup = useSelector((state: State) => state.data.lookup);
  const mapContainer = useRef(null);
  const popupRef = useRef(null);
  const [map, setMap] = useState<MapType | null>(null);

  useEffect(() => {
    if (map) {
      // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/
      //@ts-ignore
      map.on("click", "eds-in-filter", function(e: any) {
        const { elect_dist } = e.features[0].properties;
        const adedData = lookup ? lookup[elect_dist] : [];

        //@ts-ignore
        popupRef.current
          .setLngLat(geoCentroid(e.features[0]))
          .setHTML(
            getTooltipHtml(elect_dist, adedData)
          )
          .addTo(map);
      });
    }
  }, [map, lookup]);

  useEffect(() => {
    if (map !== null && matches.length) {
      map?.setFilter("eds-in-filter", ["in", "elect_dist", ...matches]);
    }
  }, [matches, map]);

  useEffect(() => {
    if (map) {
      //@ts-ignore
      map.flyTo({
        center: [
          isMobile ? mapSettings.lngMobile : mapSettings.lngDesktop,
          mapSettings.lat,
        ],
      });
    }
  }, [isMobile, mapSettings]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      //@ts-ignore
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [
        isMobile ? mapSettings.lngMobile : mapSettings.lngDesktop,
        mapSettings.lat,
      ],
      zoom: mapSettings.zoom,
    });

    map.on("load", function() {
      map.addSource("nyced", {
        type: "geojson",
        data: nyced as any,
      });
      map.addSource("nycad", {
        type: "geojson",
        data: nycad as any,
      });

      map.addLayer({
        id: "eds",
        type: "fill",
        source: "nyced",
        paint: {
          "fill-color": "#ddd",
          "fill-outline-color": "#fff",
          "fill-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "eds-in-filter",
        type: "fill",
        source: "nyced",
        paint: {
          "fill-color": "#3f3",
          "fill-outline-color": "#fff",
          "fill-opacity": 0.8,
        },
        filter: ["in", "elect_dist", ...matches],
      });

      map.addLayer({
        id: "ads",
        type: "fill",
        source: "nycad",
        paint: {
          "fill-color": "#fff",
          "fill-outline-color": "#f00",
          "fill-opacity": 0.2,
        },
      });

      //@ts-ignore
      popupRef.current = new mapboxgl.Popup();

      map.on("styledata", () => {
        setMap(map);
      });
    });

    return () => map.remove();
  }, []);

  return <div className="Map" ref={mapContainer}></div>;
};

export default MapComponent;
