import PlaceholderJs, { renderDOM } from "./placeHolderJs";

const Component1 = ({ testObs }) => {
  const items = new PlaceholderJs.Observable([]);
  const text = new PlaceholderJs.Observable("");
  console.log(testObs);

  PlaceholderJs.effect(() => {
    console.log(items.value, text.value, testObs);
  }, [items, text, testObs]);

  const handleInput = (e) => {
    text = testObs + 2;
  };

  const handleClick = () => {
    items = items.concat({ id: Math.random() * 100000, name: text.value });
    text = "";
  };

  testObs = testObs + 2;

  return {
    name: "component 1",
    render: () => (
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "20px",
          boxSizing: "border-box",
          border: "solid 2px #3bc3bc",
          background: "maroon",
        }}
      >
        <h1 style={{ color: "white", marginTop: "0px" }}>Todo</h1>
        <input value={text} handle:input={handleInput} />
        <button handle:click={handleClick}>Add Item</button>
        {PlaceholderJs.compute(
          () =>
            items.value.map(
              (item, i) =>
                console.log(item) || (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      userSelect: "none",
                      width: "200px",
                      padding: "5px",
                      background: "#3bc3bc",
                      border: "solid 1px #333",
                      borderRadius: "5px",
                      marginTop: "10px",
                    }}
                  >
                    <span>{`(${i})`}</span>
                    <span>{item.name}</span>
                    <button
                      handle:click={() => {
                        items = items.filter(
                          (filterItem) =>
                            console.log(filterItem.id, item.id) ||
                            filterItem.id !== item.id
                        );
                      }}
                    >
                      X
                    </button>
                  </div>
                )
            ),
          [items]
        )}
      </div>
    ),
  };
};

export default Component1;
