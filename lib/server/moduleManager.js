const glob = require("glob");
const fs = require("fs");
const path = require("path");

async function getModules({cwd, knownModules = []}) {
	const modulePaths = await getModulePaths(cwd);
	const modules = {};
	await Promise.all(modulePaths.map((modulePath) => {
		return readPackage(modulePath).then((pkg) => {
			modules[pkg.name] = {
				id: pkg.name,
				version: pkg.version,
				path: modulePath,
				dependencies: pkg.dependencies
			};
		});
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
			const dep = modules[depId] || knownModules[depId];
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
