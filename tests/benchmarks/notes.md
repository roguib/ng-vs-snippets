## Working with threads in nodejs

### Exec

exec can be used to run a command in another thread. In windows, make sure that the commands used are valid in cmd because it runs in that terminal instead of using powershell (e.g. pwd works in powershell but is not recognized in cmd).

Not sure why `exec` without args and options doesn´t work:

```js
const spawn = require("child_process").spawn;

// does not work
spawn("cd");

// it works
spawn("cd", null, { shell: true });
```

### Spawn

Same as exec but emits different events in case there's some output in stdout or stderr.

```js
var spawn = require("child_process").spawn,
  ls = spawn("ls", ["-lh", "/usr"]);

ls.stdout.on("data", function (data) {
  console.log("stdout: " + data.toString());
});

ls.stderr.on("data", function (data) {
  console.log("stderr: " + data.toString());
});

ls.on("exit", function (code) {
  console.log("child process exited with code " + code.toString());
});
```

[Source](https://stackoverflow.com/questions/10232192/exec-display-stdout-live).

## Benchmark.js

We can use `setup` and `teardown` in benchmark.js function to execute something before and after running the tests. [Source](https://stackoverflow.com/questions/50471459/why-is-the-purpose-for-setup-teardown-and-cycles-in-benchmark-js).

### Deferred function in benchmark.js

If we need to execute an async function, we have to follow the syntax described [here](https://stackoverflow.com/questions/31624055/benchmark-asynchronous-code-benchmark-js-node-js):

```js
var Benchmark = require("benchmark");
var suite = new Benchmark.Suite();

suite
  .add("foo", {
    defer: true,
    fn: function (deferred) {
      setTimeout(function () {
        deferred.resolve(); // do not forget to call deferred.resolve() to indicate to benchmark.js that the async function has finished
      }, 200);
    },
  })
  .on("complete", function () {
    console.log(this[0].stats);
  })
  .run();
```

## Jest

By default Jest outputs to stderr. [There have been several requests](https://github.com/facebook/jest/issues/5064) to output the tests to `stdout` if everything went ok or to `stderr` if some test failed. However, this issue hasn´t been addressed. One workaround to this issue is to use [jest-standard-reporter](https://github.com/chrisgalvan/jest-standard-reporter) that fixes this issue.
