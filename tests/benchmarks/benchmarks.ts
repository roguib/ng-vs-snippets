const Benchmark = require("benchmark");
const suite = new Benchmark.Suite();

suite
  .add("foo", {
    defer: true,
    fn: (deferred) => {
      var spawn = require("child_process").spawn,
        ls = spawn("npm run test", [""], { shell: true });

      ls.on("exit", () => {
        deferred.resolve();
      });
    },
  })
  .on("complete", (event) => {
    console.log(String(event.target));
  })
  .run();

export {};
