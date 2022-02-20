import PlaceholderJs, { renderDOM } from "./placeHolderJs";
import Component2 from "./component2";

const Item = ({ name, description }) => {
  return {
    name: "Item",
    render: () => (
      <div>
        {name} -{description}
      </div>
    ),
  };
};

const App = ({}) => {
  return {
    name: "App",
    render: () => (
      <div class="app">
        <Component2 />
      </div>
    ),
  };
};

renderDOM(App, "root");
