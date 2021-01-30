// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
// https://stackoverflow.com/questions/4842424/list-of-ansi-color-escape-sequences
// https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
// https://en.wikipedia.org/wiki/ANSI_escape_code

const logPrefix = "\u001b[47;1m LOG: \x1b[0m ";
const warnPrefix = "\u001b[38;5;0m \u001b[48;5;11m WARNING: \x1b[0m ";
const errorPrefix = "\u001b[41;1m ERROR: \x1b[0m ";
const reset = "\x1b[0m";

// TODO: Omit printing logs if certain flag is not written on the terminal
export const log = (message: string, args?: any[] | any) => {
  console.log(logPrefix + message, args);
};

export const warn = (message: string, args?: any[] | any) => {
  console.log(warnPrefix + message, args);
};

export const err = (message: string, args?: any[] | any) => {
  console.log(errorPrefix + message, args);
};
