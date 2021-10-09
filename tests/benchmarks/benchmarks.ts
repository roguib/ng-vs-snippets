const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();

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
