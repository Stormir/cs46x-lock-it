const assert = {
  never: (x: never): never => {
    throw new Error(`Unexpected value: ${x}`);
  }
};

export default assert;
