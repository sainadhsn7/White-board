import Board from "./components/Board";
import Toobar from "./components/Toolbar";
import Toolbox from "./components/Toolbox";
import BoardProvider from "./store/BoardProvider";
import ToolboxProvider from "./store/ToolboxProvider";

function App() {
  return (
    <BoardProvider>
      <ToolboxProvider>
        <Toobar />
        <Toolbox />
        <Board />
      </ToolboxProvider>
    </BoardProvider>
  );
}

export default App;
