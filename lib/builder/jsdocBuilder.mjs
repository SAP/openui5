import {fileURLToPath} from "node:url";
import {buildApplicationProject} from "./builder.mjs";

await buildApplicationProject({
	cwd: fileURLToPath(new URL("../../src/testsuite/", import.meta.url)),
	jsdoc: true
});
