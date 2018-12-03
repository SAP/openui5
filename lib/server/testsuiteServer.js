const path = require("path");
const moduleManager = require("./moduleManager");
const server = require("./server");

const openui5Root = path.join(__dirname, "..", "..");
moduleManager.getModules({cwd: openui5Root }).then(async (modules) => {
	console.log(`Found ${Object.keys(modules).length} OpenUI5 modules`);
	// Always use testsuite as root project
	const dependencyTree = modules["@openui5/testsuite"];

	return server.serve(dependencyTree);
}).catch(function(err) {
	console.error(err);
	process.exit(1);
});

