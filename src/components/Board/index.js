import { useRef, useContext, useLayoutEffect, useEffect } from "react";
import rough from "roughjs";
import boardContext from "../../store/board-context";
import toolboxContext from "../../store/toolbox-context";
import { TOOL_ACTION_TYPES, TOOL_ITEMS } from "../../constants";
import classes from "./index.module.css";

function Board() {
  const canvasRef = useRef();
  const textAreaRef = useRef();
  const {
    elements,
    toolActionType,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    undoActionHandler,
    redoActionHandler,
    textAreaBlurHandler,
  } = useContext(boardContext);

  const { toolboxState } = useContext(toolboxContext);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    // context.save();
    const roughCanvas = rough.canvas(canvas);

    elements.forEach((element) => {
      switch (element.type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW: {
          roughCanvas.draw(element.roughEle);
          break;
        }

        case TOOL_ITEMS.BRUSH: {
          context.fillStyle = element.stroke;
          context.fill(element.path);
          context.restore();
          break;
        }

        case TOOL_ITEMS.TEXT: {
          context.testBaseline = "top";
          context.font = `${element.size}px Caveat`;
          context.fillStyle = element.stroke;
          context.fillText(
            element.text,
            element.x1,
            element.y1 + parseInt(element.size)
          );
          context.restore();
          break;
        }
        default:
          break;
      }
    });

    return () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [elements]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === "z") {
        undoActionHandler();
      } else if (event.ctrlKey && event.key === "y") {
        redoActionHandler();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undoActionHandler, redoActionHandler]);

  const handleMouseDown = (event) => {
    boardMouseDownHandler(event, toolboxState);
  };

  const handleMouseMove = (event) => {
    if (toolActionType === "DRAWING" || toolActionType === "ERASING")
      boardMouseMoveHandler(event);
  };

  const handleMouseUp = () => {
    boardMouseUpHandler();
  };

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (toolActionType === TOOL_ACTION_TYPES.WRITING) {
      setTimeout(() => {
        textarea.focus();
      }, 0);
    }
  }, [toolActionType]);

  return (
    <>
      {toolActionType === TOOL_ACTION_TYPES.WRITING && (
        <textarea
          type="text"
          ref={textAreaRef}
          className={classes.textElementBox}
          style={{
            top: elements[elements.length - 1].y1,
            left: elements[elements.length - 1].x1,
            fontSize: `${elements[elements.length - 1]?.size}px`,
            color: `${elements[elements.length - 1]?.stroke}`,
          }}
          onBlur={(event) => {
            textAreaBlurHandler(event.target.value);
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        id="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

export default Board;
