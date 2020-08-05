const glob = require("glob");
const fs = require("fs");
const {promisify} = require("util");
const readFile = promisify(fs.readFile);
const path = require("path");
const jsyaml = require("js-yaml");

async function getModules({cwd, knownModules = []}) {
	const modulePaths = await getModulePaths(cwd);
	const modules = {};
	await Promise.all(modulePaths.map(async (modulePath) => {
		let pkg;
		try {
			pkg = await readPackage(modulePath);
		} catch (err) {
			console.log(`Ignoring invalid module found at ${modulePath} - Reported error: ${err.message}`);
			return;
		}

		let dependencies;
		dependencies = Object.assign({}, pkg.dependencies, pkg.devDependencies);
		Object.keys(dependencies).forEach((depName) => {
			if (!depName.match(/^@(?:openui5|sapui5)\//i)) {
				delete dependencies[depName];
			}
		});
		if (pkg.name.startsWith("@sapui5/")) {
			// Dependency information is part of ui5.yaml configuration
			// Always use the first configuration (some might have multiple)
			const configPath = path.join(modulePath, "ui5.yaml");
			let configFile;
			try {
				configFile = await readFile(configPath, {encoding: "utf8"});
			} catch (err) {
				const errorText = `Failed to read ui5.yaml for project ${pkg.name} ` +
						`at "${configPath}". Error: ${err.message}`;
				throw new Error(errorText);
			}
			const [config] = jsyaml.loadAll(configFile, undefined, {
				filename: configPath,
				schema: jsyaml.DEFAULT_SAFE_SCHEMA
			});
			if (config && config.framework && config.framework.libraries) {
				dependencies = {};
				config.framework.libraries.forEach((dependency) => {
					// We should be able to resolve any optional or development dependency
					// in the testsuite. So don't check for those. Just include them.

					// dependency.name contains for example "sap.ui.core" (not the package name)
					dependencies[dependency.name] = "NO-VERSION";
				});
			}
		}

		modules[pkg.name] = {
			id: pkg.name,
			version: pkg.version,
			path: modulePath,
			dependencies
		};
	}));

	// Add dependencies to modules
	const keys = Object.keys(modules);
	for (let i = keys.length - 1; i >= 0; i--) {
		const mod = modules[keys[i]];
		if (!mod.dependencies) {
			mod.dependencies = [];
			continue;
		}
		// Replace dependency list with actual modules
		mod.dependencies = Object.keys(mod.dependencies).map((depId) => {
			const dep = modules[depId] || knownModules[depId] ||
				// fallbacks for dependencies defined in ui5.yaml where the name is missing
				// the npm package scope
				modules[`@openui5/${depId}`] || knownModules[`@openui5/${depId}`] ||
				modules[`@sapui5/${depId}`] || knownModules[`@sapui5/${depId}`];
			if (!dep) {
				throw new Error(`Failed to find dependency ${depId} in current workspace ${cwd}`);
			}
			return dep;
		})
	}
	return modules;
}

async function getModulePaths(cwd) {
	const matchedFilePaths = await resolveWorkspacePaths(cwd);
	const dirPaths = await Promise.all(matchedFilePaths.map((relPath) => {
		const dirPath = path.join(cwd, relPath);
		return isDir(dirPath).then((isDir) => {
			if (isDir) {
				return dirPath;
			} else {
				return null;
			}
		});
	})).then((dirPaths) => {
		// Filter out nulls
		return dirPaths.filter((dirPath) => {
			return !!dirPath;
		});
	});

	return dirPaths;
}

function isDir(dirPath) {
	return new Promise((resolve, reject) => {
		fs.stat(dirPath, (err, stats) => {
			if (err) {
				if (err.code === "ENOENT") { // "File or directory does not exist"
					resolve(false);
				} else {
					reject(err);
				}
			} else {
				resolve(stats.isDirectory());
			}
		});
	});
}

async function readPackage(modulePath) {
	const pkg = require(path.join(modulePath, "package.json"));
	return pkg;
}

async function resolveWorkspacePaths(cwd) {
	const pkg = await readPackage(cwd);
	if (!pkg) {
		throw new Error(`No "package.json" found for path ${cwd}`);
	}
	if (!pkg.workspaces) {
		throw new Error(`No workspace configuration found for module ${pkg.name}`);
	}

	let files = await Promise.all(pkg.workspaces.map((pattern) => {
		return new Promise((resolve, reject) => {
			glob(pattern, {
				cwd
			}, (err, files) => {
				if (err) {
					reject(err);
				} else {
					resolve(files);
				}
			});
		});
	}));

	// Make list flat (glob returns array as well as Promise.all)
	files = Array.prototype.concat.apply([], files);
	if (!files.length) {
		throw new Error(`Could not resolve workspace configuration for module ${pkg.name}: ${pkg.workspaces}`);
	}
	return files;
}

module.exports = {
	getModules
};
