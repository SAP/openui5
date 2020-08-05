const path = require("path");
const moduleManager = require("./moduleManager");
const server = require("./server");

const openui5Root = path.join(__dirname, "..", "..");

async function start() {
	const modules = await moduleManager.getModules({cwd: openui5Root});
	console.log(`Found ${Object.keys(modules).length} OpenUI5 modules`);
	// Always use testsuite as root project
	const dependencyTree = modules["@openui5/testsuite"];

	return server.serve(dependencyTree);
}

// Start server when this script is executed directly via node
// See: https://nodejs.org/docs/latest/api/modules.html#modules_accessing_the_main_module
if (require.main === module) {
	start().catch(function(err) {
		console.error(err);
		process.exit(1);
	});
} else {
	// Otherwise export the function to be used somewhere else (e.g. from lib/test/karma.conf.js)
	module.exports.start = start;
}
