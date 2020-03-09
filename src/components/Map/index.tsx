import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { State, EDQuery } from "../../interfaces";
import mapboxgl from "mapbox-gl";
import { geoCentroid } from "d3";
import "./styles.scss";

import mn from "./mn.json";
import mnad from "./mnad.json";
import { asyncCallEndpoint } from "../../actions";
import { zeroPad, fmt } from "../../utils";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN as string;

// https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
// https://docs.mapbox.com/mapbox-gl-js/example/using-box-queryrenderedfeatures/
const MapComponent = () => {
  const dispatch = useDispatch();
  const mapSettings = useSelector((state: State) => {
    return state.ui.map;
  });
  const isMobile = useSelector((state: State) => state.ui.isMobile);
  const matches = useSelector((state: State) => state.data.matches);
  const queries = useSelector((state: State) => state.data.queries);
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    //@ts-ignore
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [
        isMobile ? mapSettings.lngMobile : mapSettings.lngDesktop,
        mapSettings.lat,
      ],
      zoom: mapSettings.zoom,
    });

    map.on("load", function() {
      map.addSource("mn", {
        type: "geojson",
        data: mn,
      });
      map.addSource("mnad", {
        type: "geojson",
        data: mnad,
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

      map.addLayer({
        id: "ads",
        type: "fill",
        source: "mnad",
        paint: {
          "fill-color": "#fff",
          "fill-outline-color": "#f00",
          "fill-opacity": 0.2,
        },
      });

      //@ts-ignore
      popupRef.current = new mapboxgl.Popup();

      // don't request matches until map has finished loading
      // to ensure the below useEffect catches it
      // (solves problem where load was finishing after matches returned)
      dispatch(asyncCallEndpoint("aded", []));
    });

    mapRef.current = map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lookup: Map<string, number[]> = new Map(
      Object.entries(
        queries
          .filter(d => d.data && d.data.length)
          .reduce((t, v: EDQuery) => {
            //@ts-ignore
            return v.data.reduce((tt, { ad, ed, tally_pct }) => {
              //@ts-ignore
              const prev = t[zeroPad(ad, ed)] || [];
              return {
                ...tt,
                [zeroPad(ad, ed)]: [...prev, tally_pct],
              };
            }, t);
          }, {})
      )
    );

    // https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/
    const map = mapRef.current;
    if (map) {
      //@ts-ignore
      map.on("click", "eds-in-filter", function(e: any) {
        var coordinates = geoCentroid(e.features[0]);
        const { elect_dist } = e.features[0].properties;
        const adedData: number[] = lookup.get(elect_dist) || [];

        //@ts-ignore
        popupRef.current
          .setLngLat(coordinates)
          .setHTML(
            `<div style="padding-top:5px;text-align:right;">
                ED: <strong>${elect_dist}</strong>
                ${adedData
                  .map(
                    (d: number, i: number) =>
                      `<div class='popup-row'><div class='query-tag'>${i +
                        1}</div><div class='query-value'>${fmt(d)}</div></div>`
                  )
                  .join("")}
              </div>`
          )
          .addTo(map);
      });
    }
  }, [queries]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && matches.length) {
      // @ts-ignore
      map.setFilter("eds-in-filter", ["in", "elect_dist", ...matches]);
    }
  }, [matches]);

  useEffect(() => {
    const map = mapRef.current;
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

  return <div className="Map" ref={mapContainer}></div>;
};

export default MapComponent;
