import deepMerge from "deepmerge";
import { rgb } from "d3-color";
import {
  AGES,
  BODY_FONT_SIZE,
  GENDERS,
  INCARCERATION_REASON_KEYS,
  RACE_LABELS,
  RELEASE_TYPE_KEYS,
  VIOLATION_COUNT_KEYS,
} from "../constants";

const bodyFontFamily = "'Libre Franklin', sans-serif";
const bodyLineHeight = 1.5;
const bodyMedium = `500 ${BODY_FONT_SIZE}px/${bodyLineHeight} ${bodyFontFamily}`;
const bodyBold = `600 ${BODY_FONT_SIZE}px/${bodyLineHeight} ${bodyFontFamily}`;

const displayFontFamily = "'Poppins', sans-serif";
const displayFontSize = "20px";
const displayLineHeight = 1.3;
const displayBold = `600 ${displayFontSize}/${displayLineHeight} ${displayFontFamily}`;
const displayMedium = `500 ${displayFontSize}/${displayLineHeight} ${displayFontFamily}`;
const displayNormal = `400 ${displayFontSize}/${displayLineHeight} ${displayFontFamily}`;

const brightGreen = "#25b894";

// The numbers behind the "darkGreen" colors represent an opacity
// percentage when using #FCFCFC as a background color.  Example,
// 9 === 0.9 opacity.
// Conversion tool: http://marcodiiga.github.io/rgba-to-rgb-conversion
const darkGreen = "#005450";
const darkGreen8 = "#327672";
const darkGreen4 = "#97B9B7";
const darkerGreen = "#00413E";
const white = "#FAF9F9";

const buttonBackground = "#EFEDEC";
const buttonBackgroundHover = "#E0DFDE";
const black = "#262420";
const blackTint1 = "#DFDEDD";
const charcoal = "#6C6762";

const dataVizColorMap = new Map([
  ["teal", "#25636F"],
  ["gold", "#D9A95F"],
  ["red", "#BA4F4F"],
  ["blue", "#4C6290"],
  ["paleGreen", "#90AEB5"],
  ["pink", "#CC989C"],
]);

const dataVizColors = Array.from(dataVizColorMap.values());
const dataVizDefaultColor = dataVizColors[0];

const assignDataVizColors = (keys) =>
  keys.reduce(
    (colorMapping, key, index) => ({
      ...colorMapping,
      // color will be undefined if the list overflows
      [key]: dataVizColors[index],
    }),
    {}
  );

const defaultDuration = "0.25s";
const defaultDurationMs = Number(defaultDuration.replace("s", "")) * 1000;
const defaultEasing = "ease-in-out";

const baseSentencingColor = rgb(dataVizDefaultColor);

export const defaultTheme = {
  colors: {
    age: assignDataVizColors(Array.from(AGES.keys())),
    asideBackground: "rgba(206, 202, 199, 0.8)", // "#CECAC7"
    background: white,
    body: charcoal,
    bodyLight: white,
    chartAxis: charcoal,
    controlBackground: buttonBackground,
    controlLabel: charcoal,
    controlValue: black,
    footer: white,
    footerBackground: darkerGreen,
    divider: "#CECAC7",
    gender: assignDataVizColors(Array.from(GENDERS.keys())),
    heading: black,
    highlight: brightGreen,
    incarcerationReasons: assignDataVizColors(
      Array.from(INCARCERATION_REASON_KEYS.keys())
    ),
    infoPanelTitle: "#F65834",
    loadingSpinner: darkerGreen,
    mapMarkers: {
      fill: dataVizDefaultColor,
      stroke: white,
    },
    pillBackground: buttonBackground,
    pillBackgroundHover: buttonBackgroundHover,
    pillValue: black,
    monthlyTimeseriesBar: dataVizDefaultColor,
    noData: "#EFEDEC",
    programParticipation: black,
    race: assignDataVizColors(Array.from(RACE_LABELS.keys())),
    releaseTypes: assignDataVizColors(Array.from(RELEASE_TYPE_KEYS.keys())),
    sentenceLengths: rgb(dataVizDefaultColor).copy({ opacity: 0.6 }).toString(),
    sentencing: {
      // unlike other charts, this one has a monochromatic palette with opacity
      incarceration: baseSentencingColor.copy({ opacity: 0.9 }).toString(),
      probation: baseSentencingColor.copy({ opacity: 0.6 }).toString(),
      target: baseSentencingColor.copy({ opacity: 0.4 }).toString(),
      hover: baseSentencingColor.toString(),
    },
    sliderThumb: darkGreen,
    statistic: black,
    tooltipBackground: black,
    violationReasons: assignDataVizColors(
      Array.from(VIOLATION_COUNT_KEYS.keys())
    ),
  },
  fonts: {
    body: bodyMedium,
    bodyBold,
    display: displayBold,
    displayMedium,
    displayNormal,
    brandSizeSmall: "14px",
    brandSizeLarge: "22px",
    brandSubtitleSize: "14px",
    brandSubtitleSizeSmall: "13px",
  },
  headerHeightSmall: 50,
  headerHeight: 112,
  maps: {
    // these are style objects that we can pass directly to react-simple-maps
    default: {
      fill: blackTint1,
      stroke: white,
      strokeWidth: 1.5,
    },
    hover: {
      fill: darkGreen4,
      stroke: white,
    },
    pressed: {
      fill: darkGreen8,
      stroke: white,
    },
  },
  sectionTextWidth: 600,
  transition: {
    defaultDuration,
    defaultDurationMs,
    defaultEasing,
    defaultTimeSettings: `${defaultDuration} ${defaultEasing}`,
  },
  zIndex: {
    base: 1,
    control: 50,
    menu: 100,
    tooltip: 500,
    header: 750,
    modal: 1000,
  },
};

// ND colors are tinted with the theme background color (i.e. converted from opacity)
const ndColors = {
  brandOrange: "#D34727",
  brandOrangeTint1: "#EFE0DC",
  brandTeal: "#004B5B",
  brandTealDark: "#003C49",
};

const northDakotaTheme = {
  colors: {
    footerBackground: ndColors.brandTealDark,
    highlight: ndColors.brandOrange,
    loadingSpinner: ndColors.brandTeal,
    sliderThumb: ndColors.brandTeal,
  },
  maps: {
    hover: {
      fill: ndColors.brandOrangeTint1,
    },
    pressed: {
      fill: ndColors.brandOrange,
    },
  },
};

export const THEME = deepMerge(defaultTheme, northDakotaTheme);