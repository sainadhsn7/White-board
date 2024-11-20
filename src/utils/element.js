import rough from "roughjs/bin/rough";
import { TOOL_ITEMS } from "../constants";
import getStroke from "perfect-freehand";

const gen = rough.generator();

export const createRoughElement = (
  id,
  x1,
  y1,
  x2,
  y2,
  { type, stroke, fill, size }
) => {
  const element = {
    id,
    x1,
    y1,
    x2,
    y2,
    stroke,
    fill,
    type,
    size,
  };
  let options = {
    seed: id,
    fillStyle: "solid",
  };

  if (stroke) {
    options.stroke = stroke;
  }

  if (fill) {
    options.fill = fill;
  }

  if (size) {
    options.strokeWidth = size;
  }

  switch (type) {
    case TOOL_ITEMS.BRUSH: {
      const brushElement = {
        id,
        points: [{ x: x1, y: y1 }],
        path: new Path2D(getSvgPathFromStroke(getStroke([{ x: x1, y: y1 }]))),
        type,
        stroke,
      };
      return brushElement;
    }

    case TOOL_ITEMS.LINE: {
      element.roughEle = gen.line(x1, y1, x2, y2, options);
      return element;
    }
    case TOOL_ITEMS.RECTANGLE: {
      element.roughEle = gen.rectangle(x1, y1, x2 - x1, y2 - y1, options);
      return element;
    }

    case TOOL_ITEMS.CIRCLE: {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      element.roughEle = gen.ellipse(cx, cy, x2 - x1, y2 - y1, options);
      return element;
    }

    case TOOL_ITEMS.ARROW: {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const x3 = x2 - 20 * Math.cos(angle - Math.PI / 6);
      const y3 = y2 - 20 * Math.sin(angle - Math.PI / 6);

      const x4 = x2 - 20 * Math.cos(angle + Math.PI / 6);
      const y4 = y2 - 20 * Math.sin(angle + Math.PI / 6);
      const points = [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x2, y2],
        [x4, y4],
      ];
      element.roughEle = gen.linearPath(points, options);
      return element;
    }

    case TOOL_ITEMS.TEXT: {
      element.text = "";
      return element;
    }

    default:
      throw new Error("Tool Type not recognized");
  }
};

const getDistance = (x1, y1, x2, y2) => {
  return Math.hypot(x2 - x1, y2 - y1);
};

const isPointNearLine = (x1, y1, x2, y2, pointX, pointY) => {
  return (
    getDistance(x1, y1, pointX, pointY) +
      getDistance(x2, y2, pointX, pointY) -
      getDistance(x1, y1, x2, y2) <
    0.2
  );
};

export const isPointNearElement = (element, pointX, pointY) => {
  switch (element.type) {
    case TOOL_ITEMS.ARROW:
    case TOOL_ITEMS.LINE: {
      const { x1, y1, x2, y2 } = element;
      return isPointNearLine(x1, y1, x2, y2, pointX, pointY);
    }
    case TOOL_ITEMS.CIRCLE:
    case TOOL_ITEMS.RECTANGLE: {
      const { x1, y1, x2, y2 } = element;
      return (
        isPointNearLine(x1, y1, x2, y1, pointX, pointY) ||
        isPointNearLine(x1, y1, x1, y2, pointX, pointY) ||
        isPointNearLine(x2, y1, x2, y2, pointX, pointY) ||
        isPointNearLine(x1, y2, x2, y2, pointX, pointY)
      );
    }

    case TOOL_ITEMS.BRUSH: {
      const context = document.getElementById("canvas").getContext("2d");
      return context.isPointInPath(element.path, pointX, pointY);
    }

    case TOOL_ITEMS.TEXT: {
      const context = document.getElementById("canvas").getContext("2d");
      context.font = `${element.size}px Caveat`;
      context.fillStyle = element.stroke;
      const textWidth = context.measureText(element.text).width;
      const textHeight = parseInt(element.size);
      context.restore();
      const { x1, y1 } = element;
      return (
        isPointNearLine(x1, y1, x1 + textWidth, y1, pointX, pointY) ||
        isPointNearLine(x1, y1, x1, y1 + textHeight, pointX, pointY) ||
        isPointNearLine(
          x1 + textWidth,
          y1,
          x1 + textWidth,
          y1 + textHeight,
          pointX,
          pointY
        ) ||
        isPointNearLine(
          x1,
          y1 + textHeight,
          x1 + textWidth,
          y1 + textHeight,
          pointX,
          pointY
        )
      );
    }

    default:
      break;
  }
};

export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
}
