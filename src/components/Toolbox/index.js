import React, { useContext } from "react";
import classes from "./index.module.css";
import {
  COLORS,
  FILL_TOOL_TYPES,
  SIZE_TOOL_TYPES,
  STROKE_TOOL_TYPES,
  TOOL_ITEMS,
} from "../../constants";
import cx from "classnames";
import boardContext from "../../store/board-context";
import toolboxContext from "../../store/toolbox-context";

const Toolbox = () => {
  const { activeToolItem } = useContext(boardContext);
  const {
    toolboxState,
    changeStrokeHandler,
    changeFillHandler,
    changeSizeHandler,
  } = useContext(toolboxContext);
  const strokeColor = toolboxState[activeToolItem]?.stroke;
  const fillColor = toolboxState[activeToolItem]?.fill;
  const size = toolboxState[activeToolItem]?.size;
  return (
    <div className={classes.container}>
      {STROKE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Stroke Color</div>
          <div className={classes.colorsContainer}>
            <div>
              <input
                className={classes.colorPicker}
                type="color"
                value={strokeColor}
                onChange={(e) =>
                  changeStrokeHandler(activeToolItem, e.target.value)
                }
              />
            </div>
            {Object.keys(COLORS).map((k) => {
              return (
                <div
                  key={k}
                  className={cx(classes.colorBox, {
                    [classes.activeColorBox]: strokeColor === COLORS[k],
                  })}
                  style={{ background: COLORS[k] }}
                  onClick={() => changeStrokeHandler(activeToolItem, COLORS[k])}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {FILL_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>Fill Color</div>
          <div className={classes.colorsContainer}>
            {fillColor === null ? (
              <div
                className={cx(classes.colorPicker, classes.noFillColorBox)}
                onClick={() => changeFillHandler(activeToolItem, COLORS.BLACK)}
              ></div>
            ) : (
              <input
                className={classes.colorPicker}
                type="color"
                value={fillColor}
                onChange={(e) =>
                  changeFillHandler(activeToolItem, e.target.value)
                }
              />
            )}
            <div
              className={cx(classes.colorPicker, classes.noFillColorBox, {
                [classes.activeColorBox]: fillColor === null,
              })}
              onClick={() => changeFillHandler(activeToolItem, null)}
            ></div>
            {Object.keys(COLORS).map((k) => {
              return (
                <div
                  key={k}
                  className={cx(classes.colorBox, {
                    [classes.activeColorBox]: fillColor === COLORS[k],
                  })}
                  style={{ background: COLORS[k] }}
                  onClick={() => changeFillHandler(activeToolItem, COLORS[k])}
                ></div>
              );
            })}
          </div>
        </div>
      )}

      {SIZE_TOOL_TYPES.includes(activeToolItem) && (
        <div className={classes.selectOptionContainer}>
          <div className={classes.toolBoxLabel}>
            {activeToolItem === TOOL_ITEMS.TEXT ? "Font Size" : "Brush Size"}
          </div>
          <input
            type="range"
            min={activeToolItem === TOOL_ITEMS.TEXT ? 10 : 1}
            max={activeToolItem === TOOL_ITEMS.TEXT ? 64 : 10}
            step={1}
            value={size}
            onChange={(event) => {
              changeSizeHandler(activeToolItem, event.target.value);
            }}
          ></input>
        </div>
      )}
    </div>
  );
};

export default Toolbox;
