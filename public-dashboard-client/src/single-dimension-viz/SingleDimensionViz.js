import PropTypes from "prop-types";
import React, { useState } from "react";
import Measure from "react-measure";
import styled from "styled-components";
import BubbleChart from "../bubble-chart";
import { DIMENSION_KEYS, TOTAL_KEY } from "../constants";
import Disclaimer from "../disclaimer";
import ProportionalBar from "../proportional-bar";
import { formatDemographicValue } from "../utils";

const SECTION_HEIGHT = 450;
const GUTTER = 42;

const SingleDimensionVizWrapper = styled.div`
  width: 100%;
`;

const BreakdownBarWrapper = styled.div`
  height: ${(props) => props.height}px;
  padding-bottom: 16px;
  position: relative;
  z-index: ${(props) => props.theme.zIndex.base + props.stackOrder};
`;

function Breakdowns({ data, dimension }) {
  const breakdownHeight = SECTION_HEIGHT / data.size;
  const [highlighted, setHighlighted] = useState();
  return Array.from(data, ([key, value], i) => (
    <BreakdownBarWrapper key={key} stackOrder={data.size - i}>
      <ProportionalBar
        data={value}
        height={breakdownHeight - GUTTER}
        highlighted={highlighted}
        setHighlighted={setHighlighted}
        title={formatDemographicValue(key, dimension)}
        showLegend={i === data.size - 1}
      />
    </BreakdownBarWrapper>
  ));
}

export default function SingleDimensionViz({ data, dimension }) {
  return (
    <Measure bounds>
      {({
        measureRef,
        contentRect: {
          bounds: { width },
        },
      }) => {
        return (
          <SingleDimensionVizWrapper ref={measureRef}>
            {dimension === DIMENSION_KEYS.total ? (
              width && (
                <BubbleChart
                  data={data.get(TOTAL_KEY)}
                  height={SECTION_HEIGHT}
                  width={width}
                />
              )
            ) : (
              <Breakdowns data={data} dimension={dimension} />
            )}
            <Disclaimer type="small-data" />
          </SingleDimensionVizWrapper>
        );
      }}
    </Measure>
  );
}

SingleDimensionViz.propTypes = {
  data: PropTypes.instanceOf(Map).isRequired,
  dimension: PropTypes.string.isRequired,
};
