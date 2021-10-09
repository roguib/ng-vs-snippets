var Benchmark = require("benchmark");
var suite = new Benchmark.Suite();
function fib(n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
suite
    .add("testing workflow", function () {
    fib(10);
})
    .on("cycle", function (event) {
    // Output benchmark result by converting benchmark result to string
    console.log(String(event.target));
})
    .run();
