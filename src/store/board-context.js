import { createContext } from "react";

const boardContext = createContext({
  activeToolItem: "",
  elements: [],
  history: [[]],
  index: 0,
  toolActionType: "",
  boardMouseDownHandler: () => {},
  boardMouseMoveHandler: () => {},
  changeToolHandler: () => {},
  boardMouseUpHandler: () => {},
  undoActionHandler: () => {},
  redoActionHandler: () => {},
  textAreaBlurHandler: () => {},
});

export default boardContext;
