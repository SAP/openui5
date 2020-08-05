const projectPreprocessor = require("@ui5/project").projectPreprocessor;
const builder = require("@ui5/builder").builder;

function collectLibraryNames(tree, libraryNames = []) {
	if (!libraryNames.includes(tree.metadata.name)) {
		libraryNames.push(tree.metadata.name);
	}
	tree.dependencies.forEach((dep) => {
		collectLibraryNames(dep, libraryNames);
	});
	return libraryNames;
}

async function build(dependencyTree, {destPath, jsdoc}) {
	// Process dependency tree
	const tree = await projectPreprocessor.processTree(dependencyTree);

	const librariesToBuild = process.env.OPENUI5_LIBRARIES;
	let includedDependencies;
	let excludedDependencies;
	if (librariesToBuild) {
		includedDependencies = librariesToBuild.split(",").map(($) => $.trim());
		excludedDependencies = "*";

		const allLibraryNames = collectLibraryNames(tree);
		console.log(`Limiting build to the following libraries:`);
		includedDependencies.forEach((libraryName) => {
			if (allLibraryNames.includes(libraryName)) {
				console.log(`    ${libraryName}`);
			} else {
				throw new Error(
					`Could not find a library named '${libraryName}' in the dependency tree of ` +
					`project '${tree.metadata.name}'`);
			}
		});
	}

	await builder.build({
		tree: tree,
		destPath,
		cleanDest: false,
		buildDependencies: true,
		includedDependencies,
		excludedDependencies,
		jsdoc
	});
}

module.exports = {
	build
};
