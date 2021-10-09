const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const execute = (command: string): Promise<{ stdout: string; stderr; string }> => {
  return exec(command);
};

function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

suite
  .add("testing workflow", () => {
    fib(10);
  })
  .on("cycle", (event) => {
    // Output benchmark result by converting benchmark result to string
    console.log(String(event.target));
  })
  .run();

suite
  .add("Benchmark test suite", async () => {
    await execute("npm run test");
  })
  .on("cycle", (event) => {
    console.log(String(event.target));
  })
  .run();

export {};
