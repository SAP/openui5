const semver = require("semver");

// Check for valid required Node.js version from package.json
// npm does not validate this within the project itself; only if this project would be installed as a dependency
const pkg = require("../package.json");
if (pkg.engines && pkg.engines.node && !semver.satisfies(process.version, pkg.engines.node)) {
	console.warn("!!! WARNING !!!");
	console.warn("Unsupported Node.js version: wanted '" + pkg.engines.node + "' (current: '" + process.version + "')");
	console.warn("Please update your Node.js installation before Wednesday, March 8, 2023!");
	console.warn("Afterwards the current used Node.js version will no longer work.");
	console.warn();
}
