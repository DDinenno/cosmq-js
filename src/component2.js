import PlaceholderJs, { renderDOM } from "./placeHolderJs";
import Component1 from "./component1";

const Component2 = () => {
  const testObs = new PlaceholderJs.Observable([]);

  return {
    name: "component 2",
    render: () => (
      <div>
        <Component1 testObs={testObs} />
      </div>
    ),
  };
};

export default Component2;
