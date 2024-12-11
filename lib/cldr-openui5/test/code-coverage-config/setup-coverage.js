// Config to import a custom loader hook for the istanbul code coverage tool.
// Used in the package.json in combination with the --import flag of the NODE_OPTIONS environment variable.
// This is necessary to enable the code coverage for the CLDR tests.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("@istanbuljs/esm-loader-hook", pathToFileURL("./"));