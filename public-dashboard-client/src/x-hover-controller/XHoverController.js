// Recidiviz - a data platform for criminal justice reform
// Copyright (C) 2020 Recidiviz, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
// =============================================================================

import { bisectCenter } from "d3-array";
import PropTypes from "prop-types";
import React, { useState } from "react";
import XYFrame from "semiotic/lib/XYFrame";
import styled from "styled-components";
import ResponsiveTooltipController from "../responsive-tooltip-controller";

const TOOLTIP_OFFSET = 8;

const OverlayContainer = styled.div`
  left: 0;
  position: absolute;
  top: 0;
  z-index: ${(props) => props.theme.zIndex.base};

  .frame {
    .annotation-xy-label {
      transform: translateY(
          -${(props) => (props.height - props.margin.top - props.margin.bottom) / 2}px
        )
        translateY(-50%)
        translateX(
          ${(props) =>
            props.tooltipLeft
              ? `calc(-100% - ${TOOLTIP_OFFSET}px)`
              : `${TOOLTIP_OFFSET}px`}
        );
      white-space: nowrap;
    }

    circle.frame-hover {
      display: none;
    }

    path.subject {
      stroke: ${(props) => props.theme.colors.highlight};
    }
  }
`;

const Wrapper = styled.div`
  position: relative;
`;

/**
 * Wraps around a Semiotic XYFrame and overlays a second, invisible XYFrame to provide
 * alternative hover behavior (creating uniform hover targets along the X axis
 * rather than a point-by-point Voronoi arrangement) by normalizing all Y values
 * to zero. (Necessary because there is no API to override Semiotic hover behavior.)
 *
 * Required props are the bare minimum required for proper rendering, but any other
 * supported XYFrame props can be included via `otherChartProps` as needed. `margin` and
 * `size` must be identical across both charts, so they are passed through to `children`;
 * if this is not a Semiotic Frame component, you should make sure it can handle these props.
 *
 * Also includes a `ResponsiveTooltipController` that you can pass any supported props to
 * via `tooltipControllerProps`.
 */
export default function XHoverController({
  children,
  lines,
  margin,
  otherChartProps,
  size,
  tooltipControllerProps,
  xAccessor,
}) {
  const [tooltipLeft, setTooltipLeft] = useState();

  return (
    <Wrapper>
      {/*
        it is critical that the invisible overlay be the exact same size as the visible chart,
        or the hover targets won't line up with their marks.
        If the child has different settings for these, they will be clobbered.
      */}
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { margin, size, ...otherChartProps })
      )}
      <OverlayContainer
        height={size[1]}
        margin={margin}
        tooltipLeft={tooltipLeft}
      >
        <ResponsiveTooltipController
          hoverAnnotation={[
            { type: "x", disable: ["connector", "note"] },
            { type: "frame-hover" },
          ]}
          {...tooltipControllerProps}
        >
          <XYFrame
            {...otherChartProps}
            customLineMark={() => null}
            htmlAnnotationRules={({ d, xScale }) => {
              if (d.type === "frame-hover") {
                // we're not going to render anything but we will determine
                // whether the tooltip should be on the left or right, based
                // on which side of the chart has more space.
                // voronoiX will always give us the center of the hover target in pixels
                const closestIndex = bisectCenter(xScale.range(), d.voronoiX); // should be 0 or 1
                setTooltipLeft(Boolean(closestIndex));
              }
              return null;
            }}
            lines={lines}
            margin={margin}
            size={size}
            xAccessor={xAccessor}
            // we want hover targets to be uniform with regards to the x axis;
            // by setting all the Y values equal we ensure that Semiotic creates
            // hover targets that are essentially "columns" centered on each data point
            yAccessor={() => 0}
          />
        </ResponsiveTooltipController>
      </OverlayContainer>
    </Wrapper>
  );
}

XHoverController.propTypes = {
  children: PropTypes.node.isRequired,
  lines: PropTypes.arrayOf(PropTypes.object).isRequired,
  margin: PropTypes.shape({
    top: PropTypes.number.isRequired,
    bottom: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
  }).isRequired,
  size: PropTypes.arrayOf(PropTypes.number).isRequired,
  xAccessor: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  // these are passed through if present, let the underlying components validate them
  tooltipControllerProps: PropTypes.objectOf(PropTypes.any),
  otherChartProps: PropTypes.objectOf(PropTypes.any),
};

XHoverController.defaultProps = {
  otherChartProps: {},
  tooltipControllerProps: {},
};
