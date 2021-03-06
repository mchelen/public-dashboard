import PropTypes from "prop-types";
import React, { useState } from "react";
import NetworkFrame from "semiotic/lib/NetworkFrame";
import styled from "styled-components";
import Disclaimer from "../disclaimer";
import ResponsiveTooltipController from "../responsive-tooltip-controller";
import { THEME } from "../theme";
import { demographicsAscending, formatAsNumber } from "../utils";

const MARGIN = { top: 10, bottom: 10, left: 140, right: 140 };
const MIN_WIDTH = 600;
const NODE_WIDTH = 72;

const ChartWrapper = styled.div`
  /*
    labels have a tendency to overflow the bottom of this container;
    this padding should ensure they have enough space to do so
  */
  padding-bottom: 80px;
  overflow: ${(props) => (props.width < MIN_WIDTH ? "auto" : "visible")};
  position: relative;
  width: ${(props) => props.width}px;
`;

const SOURCE_LABEL_X_OFFSET = `-${MARGIN.left + NODE_WIDTH / 2}`;

const SOURCE_VALUE_SIZE = 48;

const SourceValue = styled.text`
  color: ${(props) => props.theme.colors.heading};
  font: ${(props) => props.theme.fonts.displayMedium};
  font-size: ${SOURCE_VALUE_SIZE}px;
  letter-spacing: -0.09em;
`;

const SOURCE_LABEL_SIZE = 16;

const SourceLabel = styled.text`
  font-size: ${SOURCE_LABEL_SIZE}px;
`;

const TARGET_LABEL_PADDING = 8;
const TargetLabel = styled.text`
  font-size: 16px;
  text-anchor: start;
  width: ${MARGIN.right - TARGET_LABEL_PADDING}px;
`;
// this is a magic number based on the label's font size;
// workaround for lack of dominant-baseline support in IE
// to vertically center the text on origin
const TARGET_LABEL_Y_OFFSET = 6;

// because IE does not support CSS transforms on SVG elements (#182),
// we need to render label translations as SVG attributes. These functions do that
const getSourceValueTransform = (yOffset) => `translate(
  ${SOURCE_LABEL_X_OFFSET},
  ${-(yOffset - SOURCE_VALUE_SIZE)}
)`;

const getSourceLabelTransform = (
  yOffset
) => `translate(${SOURCE_LABEL_X_OFFSET},
  ${-(yOffset - SOURCE_VALUE_SIZE - SOURCE_LABEL_SIZE - 8)}
)`;
// this one happens to not use a dynamic value at the moment but we'll leave it
// as a function for consistency
const getTargetLabelTransform = () =>
  `translate(${
    NODE_WIDTH / 2 + TARGET_LABEL_PADDING
  }, ${TARGET_LABEL_Y_OFFSET})`;

const GRADIENTS = (
  <>
    <linearGradient id="incarcerationGradient">
      <stop
        offset="0"
        stopColor={THEME.colors.sentencing.incarceration}
        stopOpacity="1"
      />
      <stop
        offset="15%"
        stopColor={THEME.colors.sentencing.incarceration}
        stopOpacity="0.8"
      />
      <stop
        offset="90%"
        stopColor={THEME.colors.sentencing.target}
        stopOpacity="1"
      />
    </linearGradient>
    <linearGradient id="probationGradient">
      <stop
        offset="0"
        stopColor={THEME.colors.sentencing.probation}
        stopOpacity="1"
      />
      <stop
        offset="15%"
        stopColor={THEME.colors.sentencing.probation}
        stopOpacity="0.8"
      />
      <stop
        offset="90%"
        stopColor={THEME.colors.sentencing.target}
        stopOpacity="1"
      />
    </linearGradient>
    <linearGradient id="bothGradient">
      <stop
        offset="0"
        stopColor={THEME.colors.sentencing.both}
        stopOpacity="1"
      />
      <stop
        offset="15%"
        stopColor={THEME.colors.sentencing.both}
        stopOpacity="0.8"
      />
      <stop
        offset="90%"
        stopColor={THEME.colors.sentencing.target}
        stopOpacity="1"
      />
    </linearGradient>
  </>
);

const linksToTooltipProps = (d) => {
  let links;

  if ((d.sourceLinks || []).length > 0) {
    links = d.sourceLinks
      .map((link) => ({
        id: link.target.id,
        value: link.value,
        pct: link.value / d.value,
      }))
      .sort((a, b) => demographicsAscending(a.id, b.id));
  } else if ((d.targetLinks || []).length > 0) {
    links = d.targetLinks
      .map((link) => ({
        id: link.source.id,
        value: link.value,
        pct: link.value / d.value,
      }))
      .sort((a, b) => demographicsAscending(a.id, b.id));
  }

  return {
    title: d.id,
    records: links.map((link) => ({
      label: link.id,
      value: link.value,
      pct: link.pct,
    })),
  };
};

export default function SentenceTypesChart({ data, width }) {
  const [highlighted, setHighlighted] = useState();

  // width may be undefined when chart is first mounted; wait for it
  if (!width) return null;
  // we are assuming these are mutually exclusive; no intermediate nodes
  const sources = new Set(data.map((edge) => edge.source));
  const targets = new Set(data.map((edge) => edge.target));

  const nodes = [
    ...[...sources].map((name) => ({
      id: name,
      color: THEME.colors.sentencing[name.toLowerCase()],
    })),
    ...[...targets].map((name) => ({
      id: name,
      color: THEME.colors.sentencing.target,
    })),
  ];

  const renderNodeLabel = (d) => {
    if (sources.has(d.id)) {
      const yOffset = d.y - d.y0;
      return (
        <>
          <SourceValue transform={getSourceValueTransform(yOffset)}>
            {formatAsNumber(d.value)}
          </SourceValue>
          <SourceLabel transform={getSourceLabelTransform(yOffset)}>
            {d.id}
          </SourceLabel>
        </>
      );
    }
    if (targets.has(d.id)) {
      return (
        <TargetLabel transform={getTargetLabelTransform()}>{d.id}</TargetLabel>
      );
    }
    return null;
  };

  const shouldFade = (d) => {
    return (
      highlighted &&
      ((d.id && highlighted.id !== d.id) ||
        // edges not connected to this node
        (d.source &&
          d.source.id !== highlighted.id &&
          d.target &&
          d.target.id !== highlighted.id))
    );
  };

  return (
    <>
      <ChartWrapper width={width}>
        <ResponsiveTooltipController
          getTooltipProps={linksToTooltipProps}
          hoverAnnotation
          setHighlighted={setHighlighted}
        >
          <NetworkFrame
            additionalDefs={GRADIENTS}
            baseMarkProps={{
              transitionDuration: { fill: THEME.transition.defaultDurationMs },
            }}
            edges={data}
            edgeStyle={(d) => ({
              fill: shouldFade(d)
                ? THEME.colors.sentencing.hover
                : `url(#${d.source.id.toLowerCase()}Gradient)`,
            })}
            margin={MARGIN}
            networkType={{
              nodePaddingRatio: 0.1,
              nodeWidth: NODE_WIDTH,
              orient: "justify",
              projection: "horizontal",
              type: "sankey",
            }}
            nodes={nodes}
            nodeLabels={renderNodeLabel}
            nodeStyle={(d) => ({
              fill: shouldFade(d) ? THEME.colors.sentencing.hover : d.color,
            })}
            size={[Math.max(width, MIN_WIDTH), 500]}
          />
        </ResponsiveTooltipController>
      </ChartWrapper>
      <Disclaimer type="small-data" />
    </>
  );
}

SentenceTypesChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      source: PropTypes.string.isRequired,
      target: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  width: PropTypes.number,
};

SentenceTypesChart.defaultProps = {
  width: undefined,
};
