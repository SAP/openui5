/* -------------------------------------------------------------------------------------------

   Node module that creates test modules for the loader-timing.html

   Must be executed inside this folder with

     node make.js

   ------------------------------------------------------------------------------------------- */

/* eslint strict: [2, "global"] */
/* eslint-disable no-implicit-globals */
/* global require */
"use strict";

const path = require("node:path");
const {mkdirSync, writeFileSync} = require("node:fs");

function makeModule({name, dependencies = []}) {

	const shortName = path.basename(name);

	const code =
`/*eslint-disable no-console*/
/*global busyWait*/
console.time("${shortName}-root");

sap.ui.define([${ dependencies.map((dep) => `"${dep}"`).join(", ")}], function() {
	"use strict";

	console.time("${shortName}-fn");

	busyWait(20);

	console.timeEnd("${shortName}-fn");
});

console.timeEnd("${shortName}-root");
`;

	return code;
}

function writeModule(name, dependencies) {
	const code = makeModule({name, dependencies});

	mkdirSync(path.dirname(name), {recursive: true});
	writeFileSync(`${name}.js`, code);
}

function compress(code) {
	// remove block comments
	code = code.replace(/\/\*[\s\S]*?\*\//g, "");

	// remove "use strict" directive
	code = code.replace(/"use strict";/g, "");

	// reduce whitespace
	code = code. replace(/\n[ \t]*/g, "");

	return code;
}

function writeBundle(modules) {

	const code = `/*eslint-disable no-console, semi-spacing*/
/*global busyWait*/
sap.ui.require.preload({
${
	Object.entries(modules).map(
		([name, dependencies]) =>
`"fixture/${name}.js":function(){"use strict";${compress(makeModule({name, dependencies}))}}`
	).join(",\n")
}
});
`;
	writeFileSync("custom-bundle.js", code);
}

const modules = {

	"deepDependencies/deep1": ["./deep2"],
	"deepDependencies/deep2": ["./deep3"],
	"deepDependencies/deep3": ["./deep4"],
	"deepDependencies/deep4": ["./deep5"],
	"deepDependencies/deep5": ["./deep6"],
	"deepDependencies/deep6": ["./deep7"],
	"deepDependencies/deep7": ["./deep8"],
	"deepDependencies/deep8": [],

	"broadDependencies/broad1": ["./broad2", "./broad3", "./broad4", "./broad5", "./broad6", "./broad7", "./broad8"],
	"broadDependencies/broad2": [],
	"broadDependencies/broad3": [],
	"broadDependencies/broad4": [],
	"broadDependencies/broad5": [],
	"broadDependencies/broad6": [],
	"broadDependencies/broad7": [],
	"broadDependencies/broad8": []

};

Object.entries(modules).forEach(
	([name, dependencies]) => writeModule(name, dependencies)
);

writeBundle(modules);

