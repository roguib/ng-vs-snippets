// Reset = "\x1b[0m"
// Bright = "\x1b[1m"
// Dim = "\x1b[2m"
// Underscore = "\x1b[4m"
// Blink = "\x1b[5m"
// Reverse = "\x1b[7m"
// Hidden = "\x1b[8m"

// FgBlack = "\x1b[30m"
// FgRed = "\x1b[31m"
// FgGreen = "\x1b[32m"
// FgYellow = "\x1b[33m"
// FgBlue = "\x1b[34m"
// FgMagenta = "\x1b[35m"
// FgCyan = "\x1b[36m"
// FgWhite = "\x1b[37m"

// BgBlack = "\x1b[40m"
// BgRed = "\x1b[41m"
// BgGreen = "\x1b[42m"
// BgYellow = "\x1b[43m"
// BgBlue = "\x1b[44m"
// BgMagenta = "\x1b[45m"
// BgCyan = "\x1b[46m"
// BgWhite = "\x1b[47m"

const logPrefix = "\u001b[47;1m LOG: \x1b[0m ";
const warnPrefix = "\u001b[38;5;0m \u001b[48;5;11m WARNING: \x1b[0m ";
const errorPrefix = "\u001b[41;1m ERROR: \x1b[0m ";
const reset = "\x1b[0m";

export const log = (message: string) => {
  console.log(logPrefix + message);
};

export const warn = (message: string) => {
  console.log(warnPrefix + message);
};

export const err = (message: string) => {
  console.log(errorPrefix + message);
};
