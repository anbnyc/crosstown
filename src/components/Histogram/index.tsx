import React, { useEffect, useRef } from "react";
import "./styles.scss";
import {
  max,
  extent,
  select,
  scaleLinear,
  bin,
  axisBottom,
  axisLeft,
  brushX,
  format,
} from "d3";
import { Layout } from "../../constants";
import { DataObj, NumFields } from "../../types";
import { truthyOrZero } from "../../utils";

interface HistogramProps {
  data: DataObj[];
  onBrushEnd: ([a, b]: [number, number]) => void;
  brushMin?: number;
  brushMax?: number;
}

// https://observablehq.com/@d3/histogram
const Histogram = ({
  data,
  onBrushEnd,
  brushMin,
  brushMax
}: HistogramProps): React.ReactElement => {
  const barG = useRef(null);
  const xAxis = useRef(null);
  const yAxis = useRef(null);
  const brushG = useRef(null);

  const x = React.useMemo(() => scaleLinear()
  //@ts-ignore
    .domain(extent(data, d => d[NumFields.TALLY_PCT]))
    .range([Layout.M, Layout.W - Layout.M]), [data, Layout]);

  const bins = React.useMemo(() => bin()
  //@ts-ignore
    .domain(x.domain())
    .thresholds(x.ticks(40))(data.map(d => d[NumFields.TALLY_PCT])), [data, x]);

  const y = React.useMemo(() => scaleLinear()
  //@ts-ignore
    .domain([0, max(bins, d => d.length)])
    .nice()
    .range([Layout.H - Layout.M, Layout.M]), [data, Layout, bins]);

  const brushed = React.useCallback(({ selection }) => {
    onBrushEnd((selection || []).map((d: number) =>
      Math.round(100*x.invert(d))/100));
  }, [x]);

  const brush = React.useMemo(() =>
    brushX()
      .handleSize(6)
      .extent([
        [Layout.M, 0],
        [Layout.W - Layout.M, Layout.H - Layout.M],
      ])
      .on("end", brushed)
  , [Layout, brushed]);

  useEffect(() => {
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

    //@ts-ignore
    select(brushG.current).call(brush);
  }, [data, onBrushEnd]);

  useEffect(() => {
    if (truthyOrZero(brushMin) && truthyOrZero(brushMax)) {
      //@ts-ignore
      select(brushG.current).call(brush.move, [brushMin, brushMax].map(x));
    }
  }, [brush, brushMin, brushMax]);

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
