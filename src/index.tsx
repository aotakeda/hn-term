import { TextAttributes } from "@opentui/core";
import { render } from "@opentui/react";

function App() {
  return (
    <box flexGrow={1}>
      <box justifyContent="center" alignItems="center">
        <ascii-font font="tiny" text="HN Term" />
        <text attributes={TextAttributes.DIM}>Read HN in your terminal</text>
      </box>
      <box>
        <tab-select options={[{ name: "Top", description: "Top stories" }, { name: "New", description: "New stories" }, { name: "Show", description: "Show stories" }, { name: "Ask", description: "Ask stories" }, { name: "Jobs", description: "Jobs stories" }]} />
      </box>
    </box>
  );
}

render(<App />);
