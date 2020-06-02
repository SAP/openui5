const path = require("path");
const moduleManager = require("../server/moduleManager");
const builder = require("./builder");

const openui5Root = path.join(__dirname, "..", "..");
moduleManager.getModules({cwd: openui5Root}).then(async (modules) => {
	console.log(`Found ${Object.keys(modules).length} OpenUI5 modules`);
	// Always use testsuite as root project
	const dependencyTree = modules["@openui5/testsuite"];

	return builder.build(dependencyTree, {
		destPath: path.join(dependencyTree.path, "dist"),
		jsdoc: true
	});
}).catch(function(err) {
	console.error(err);
	process.exit(1);
});
