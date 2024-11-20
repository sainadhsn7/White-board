import React, { useCallback, useReducer } from "react";
import boardContext from "./board-context";
import { BOARD_ACTIONS, TOOL_ACTION_TYPES, TOOL_ITEMS } from "../constants";
import {
  createRoughElement,
  getSvgPathFromStroke,
  isPointNearElement,
} from "../utils/element";
import getStroke from "perfect-freehand";

const boardReducer = (state, action) => {
  switch (action.type) {
    case BOARD_ACTIONS.CHANGE_TOOL: {
      return {
        ...state,
        activeToolItem: action.payload.tool,
      };
    }

    case BOARD_ACTIONS.CHANGE_ACTION_TYPE: {
      return {
        ...state,
        toolActionType: action.payload.actionType,
      };
    }

    case BOARD_ACTIONS.DRAW_DOWN: {
      const { clientX, clientY, stroke, fill, size } = action.payload;
      const new_element = createRoughElement(
        state.elements.length + 1,
        clientX,
        clientY,
        clientX,
        clientY,
        { type: state.activeToolItem, stroke, fill, size }
      );
      const prevElements = state.elements;
      return {
        ...state,
        toolActionType:
          state.activeToolItem === TOOL_ITEMS.TEXT
            ? TOOL_ACTION_TYPES.WRITING
            : TOOL_ACTION_TYPES.DRAWING,
        elements: [...prevElements, new_element],
      };
    }

    case BOARD_ACTIONS.DRAW_MOVE: {
      const { clientX, clientY } = action.payload;
      const newElements = [...state.elements];
      const idx = newElements.length - 1;
      const { type } = newElements[idx];
      switch (type) {
        case TOOL_ITEMS.LINE:
        case TOOL_ITEMS.RECTANGLE:
        case TOOL_ITEMS.CIRCLE:
        case TOOL_ITEMS.ARROW: {
          const new_element = createRoughElement(
            newElements[idx].id,
            newElements[idx].x1,
            newElements[idx].y1,
            clientX,
            clientY,
            {
              type: state.activeToolItem,
              stroke: newElements[idx].stroke,
              fill: newElements[idx].fill,
              size: newElements[idx].size,
            }
          );
          newElements[idx] = new_element;
          return {
            ...state,
            elements: newElements,
          };
        }
        case TOOL_ITEMS.BRUSH: {
          newElements[idx].points = [
            ...newElements[idx].points,
            { x: clientX, y: clientY },
          ];
          newElements[idx].path = new Path2D(
            getSvgPathFromStroke(getStroke(newElements[idx].points))
          );

          return {
            ...state,
            elements: newElements,
          };
        }

        default:
          break;
      }
      break;
    }

    case BOARD_ACTIONS.ERASE: {
      const { clientX, clientY } = action.payload;
      const elementsCopy = [...state.elements];
      let newElements = [...state.elements];
      newElements = newElements.filter((element) => {
        return !isPointNearElement(element, clientX, clientY);
      });
      const newHistory = state.history.slice(0, state.index + 1);
      if (elementsCopy.length !== newElements.length)
        newHistory.push(newElements);
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: newHistory.length - 1,
      };
    }

    case BOARD_ACTIONS.DRAW_UP: {
      const elementsCopy = [...state.elements];
      const newHistory = state.history.slice(0, state.index + 1);
      newHistory.push(elementsCopy);

      return {
        ...state,
        history: newHistory,
        index: newHistory.length - 1,
      };
    }

    case BOARD_ACTIONS.UNDO: {
      if (state.index <= 0) return state;
      return {
        ...state,
        elements: state.history[state.index - 1],
        index: state.index - 1,
      };
    }

    case BOARD_ACTIONS.REDO: {
      if (state.index >= state.history.length - 1) return state;
      return {
        ...state,
        elements: state.history[state.index + 1],
        index: state.index + 1,
      };
    }

    case BOARD_ACTIONS.CHANGE_TEXT: {
      const index = state.elements.length - 1;
      let newElements = [...state.elements];
      const newHistory = state.history.slice(0, state.index + 1);
      if (action.payload.text !== "") {
        newElements[index].text = action.payload.text;
        newHistory.push(newElements);
      } else {
        newElements = newElements.splice(0, index);
      }
      return {
        ...state,
        elements: newElements,
        history: newHistory,
        index: newHistory.length - 1,
        toolActionType: TOOL_ACTION_TYPES.NONE,
      };
    }

    default:
      return state;
  }
};

const initialBoardState = {
  activeToolItem: TOOL_ITEMS.BRUSH,
  toolActionType: TOOL_ACTION_TYPES.NONE,
  elements: [],
  history: [[]],
  index: 0,
};

const BoardProvider = ({ children }) => {
  const [boardState, dispatchBoardAction] = useReducer(
    boardReducer,
    initialBoardState
  );

  const changeToolHandler = (tool) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TOOL,
      payload: {
        tool,
      },
    });
  };

  const boardMouseDownHandler = (event, toolboxState) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.activeToolItem === TOOL_ITEMS.ERASER) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
        payload: {
          actionType: TOOL_ACTION_TYPES.ERASING,
        },
      });
      return;
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.DRAW_DOWN,
      payload: {
        clientX,
        clientY,
        stroke: toolboxState[boardState.activeToolItem]?.stroke,
        fill: toolboxState[boardState.activeToolItem]?.fill,
        size: toolboxState[boardState.activeToolItem]?.size,
      },
    });
  };

  const boardMouseMoveHandler = (event) => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    const { clientX, clientY } = event;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_MOVE,
        payload: {
          clientX,
          clientY,
        },
      });
    } else if (boardState.toolActionType === TOOL_ACTION_TYPES.ERASING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.ERASE,
        payload: {
          clientX,
          clientY,
        },
      });
    }
  };

  const boardMouseUpHandler = () => {
    if (boardState.toolActionType === TOOL_ACTION_TYPES.WRITING) return;
    if (boardState.toolActionType === TOOL_ACTION_TYPES.DRAWING) {
      dispatchBoardAction({
        type: BOARD_ACTIONS.DRAW_UP,
      });
    }
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_ACTION_TYPE,
      payload: {
        actionType: TOOL_ACTION_TYPES.NONE,
      },
    });
  };

  const undoActionHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.UNDO,
    });
  }, []);

  const redoActionHandler = useCallback(() => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.REDO,
    });
  }, []);

  const textAreaBlurHandler = (text) => {
    dispatchBoardAction({
      type: BOARD_ACTIONS.CHANGE_TEXT,
      payload: {
        text,
      },
    });
  };

  const boardContextValue = {
    activeToolItem: boardState.activeToolItem,
    elements: boardState.elements,
    toolActionType: boardState.toolActionType,
    changeToolHandler,
    boardMouseDownHandler,
    boardMouseMoveHandler,
    boardMouseUpHandler,
    undoActionHandler,
    redoActionHandler,
    textAreaBlurHandler,
  };

  return (
    <boardContext.Provider value={boardContextValue}>
      {children}
    </boardContext.Provider>
  );
};

export default BoardProvider;
