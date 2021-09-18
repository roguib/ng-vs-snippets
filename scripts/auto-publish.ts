const fs = require("fs");
const readline = require("readline");
const util = require("util");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const iterator = rl[Symbol.asyncIterator]();
const prettier = require("prettier");
const exec = util.promisify(require("child_process").exec);

const execute = (
  command: string
): Promise<{ stdout: string; stderr; string }> => {
  return exec(command);
};

const autoPublish = async (): Promise<void> => {
  console.log(
    "Welcome to autopublish. This script walks you through the process of publishing the library to npm."
  );
  console.log("Choose which type of version you want to publish:");
  console.log("1- Major version (X.0.0) (M)");
  console.log("1- Minor version (0.X.0) (m)");
  console.log("1- Patch version (0.0.X) (p)");

  let version: { value: string; done: boolean } = undefined;
  try {
    console.log("Choose the version (M/m/p)");
    version = await iterator.next();
    if (version.value != "M" && version.value != "m" && version.value != "p") {
      throw Error(
        "Published version should be Major(M) / Minor(m) / Patch(p). Aborting."
      );
    }
  } catch (error) {
    throw error;
  }
  rl.close();

  console.log("Updating package.json");
  let packageJson: any = undefined;
  try {
    packageJson = JSON.parse(
      fs.readFileSync("package.json", {
        encoding: "utf8",
        withFileTypes: true,
      })
    );
  } catch (error) {
    console.log(
      "An error has occured while trying to read package.json file. Aborting."
    );
    throw error;
  }

  let vArr: Array<string> = packageJson.version.split("."),
    index = 0;
  switch (version.value) {
    case "M":
      index = 0;
      break;
    case "m":
      index = 1;
      break;
    default:
      index = 2;
      break;
  }
  vArr[index] = (+vArr[index] + 1).toString();
  const newVersion = vArr.join(".");
  packageJson.version = newVersion;
  try {
    console.log("package.json updated. Running prettier formatter.");
    fs.writeFileSync(
      "package.json",
      prettier.format(JSON.stringify(packageJson), {
        semi: false,
        parser: "json",
      }),
      {
        encoding: "utf8",
        withFileTypes: true,
      }
    );
  } catch (error) {
    console.log(
      "An error has occured while trying to update package.json file. Aborting."
    );
    throw error;
  }

  console.log("Building the latest version of the library.");
  try {
    await execute(packageJson.scripts["build:cjs"]);
  } catch (error) {
    throw error;
  }

  console.log("Pushing the new version into GitHub.");
  try {
    await execute("git add .");
    await execute(`git commit -m \"${newVersion}\"`);
    await execute('git push"');
  } catch (error) {
    throw error;
  }

  console.log("Publishing the new version to npm.");
  try {
    await execute("npm publish");
  } catch (error) {
    throw error;
  }
  return;
};

autoPublish();
