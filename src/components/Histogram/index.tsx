import React, { useEffect, useRef } from "react";
import "./styles.scss";
import {
  max,
  extent,
  select,
  scaleLinear,
  histogram,
  axisBottom,
  axisLeft,
  brushX,
  event,
  format,
} from "d3";
import { Constants, Layout } from "../../constants";

const { TALLY_PCT } = Constants;

interface HistogramProps {
  data: any[];
  onBrushEnd: ([a, b]: [number, number]) => void;
}

// https://observablehq.com/@d3/histogram
const Histogram = ({ data, onBrushEnd }: HistogramProps) => {
  const barG = useRef(null);
  const xAxis = useRef(null);
  const yAxis = useRef(null);
  const brushG = useRef(null);

  useEffect(() => {
    const x = scaleLinear()
      //@ts-ignore
      .domain(extent(data, d => d[TALLY_PCT]))
      .range([Layout.M, Layout.W - Layout.M]);

    const bins = histogram()
      //@ts-ignore
      .domain(x.domain())
      .thresholds(x.ticks(40))(data.map(d => d[TALLY_PCT]));

    const y = scaleLinear()
      //@ts-ignore
      .domain([0, max(bins, d => d.length)])
      .nice()
      .range([Layout.H - Layout.M, Layout.M]);

    const brushed = () => {
      onBrushEnd((event.selection || []).map(x.invert));
    };

    select(xAxis.current).call(
      //@ts-ignore
      axisBottom(x)
        .ticks(Layout.W / 80)
        //@ts-ignore
        .tickFormat(format(".2p"))
        .tickSizeOuter(0)
    );
    select(yAxis.current)
      //@ts-ignore
      .call(axisLeft(y).ticks(Layout.H / 40));

    select(barG.current)
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d: any) => x(d.x0) + 1)
      .attr("width", (d: any) => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("y", (d: any) => y(d.length))
      .attr("height", (d: any) => y(0) - y(d.length));

    select(brushG.current).call(
      //@ts-ignore
      brushX()
        .handleSize(6)
        .extent([
          [Layout.M, 0],
          [Layout.W - Layout.M, Layout.H - Layout.M],
        ])
        .on("end", brushed)
    );
  }, [data, onBrushEnd]);

  return (
    <svg>
      <g ref={barG}></g>
      <g ref={brushG}></g>
      <g ref={xAxis} transform={`translate(0, ${Layout.H - Layout.M})`}></g>
      <g ref={yAxis} transform={`translate(${Layout.M}, 0)`}></g>
    </svg>
  );
};

export default Histogram;
