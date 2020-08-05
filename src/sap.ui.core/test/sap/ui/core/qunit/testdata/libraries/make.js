/* -------------------------------------------------------------------------------------------

   Node module that creates test libraries for the Core.qunit.html test

   Must be executed inside this folder with

     node make.js

   ------------------------------------------------------------------------------------------- */

/* eslint strict: [2, "global"] */
/* global require */
"use strict";

var fs = require("fs");
var pathModule = require("path");

function mkdir(path) {
	try {
		fs.mkdirSync(path);
	} catch (err) {
		if ( err.code == "ENOENT" ) {
			var slashIdx = path.lastIndexOf(pathModule.sep);
			if ( slashIdx > 0 ) {
				var parentPath = path.substring(0, slashIdx);
				mkdir(parentPath);
				mkdir(path);
			} else {
				throw err;
			}
		} else if ( err.code == "EEXIST" ) {
			return;
		} else {
			throw err;
		}
	}
}

var NAME_PREFIX = "testlibs.";
var _scenario = "";
var _currentLibs = {};
var _components = {};

function scenario(s) {
	_scenario = s + ".";
	_currentLibs = {};
	_components = {};
}

function makeName(lib) {
	return NAME_PREFIX + _scenario + lib;
}

function makeModule(lib) {
	return (NAME_PREFIX + _scenario + lib).replace(/\./g, "/");
}

function makePath(lib) {
	return (_scenario + lib).replace(/\./g, "/");
}

function makePredefine(code, module) {
	return code.replace("sap.ui.define(", "sap.ui.predefine('" + module + "',");
}

function makeLiteral(content) {
	return content.replace(/"/g, "\\\"").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
}

function makeLib(lib, dependencies) {
	var code = [
		"sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'], function(Core, coreLib) {",
		"	\"use strict\";",
		"	sap.ui.getCore().initLibrary({",
		"		name: '" + makeName(lib) + "',",
		"		dependencies: [",
		"		],",
		"		noLibraryCSS: true",
		"	});",
		"	return " + makeName(lib) + "; // eslint-disable-line no-undef",
		"});"
	];

	if ( dependencies ) {
		for ( var i = 0, j = 5; i < dependencies.length; i++) {
			var dep = dependencies[i];
			if ( typeof dep === 'object' ) {
				if ( dep.lazy ) {
					continue;
				}
				dep = dep.name;
			}

			// add comma to the end of previous line
			if (i > 0) {
				code[j - 1] = code[j - 1] + ",";
			}
			code.splice(j++, 0, "\t\t\t'" + makeName(dep) + "'");
		}
	}

	return code.join('\n');
}

function makeManifest(lib, dependencies) {
	var manifest = {
		"sap.ui5": {
			"dependencies" : {
				"libs": {
				}
			}
		}
	};
	if ( dependencies ) {
		for ( var i = 0; i < dependencies.length; i++) {
			var dep = dependencies[i];
			if ( typeof dep === 'string' ) {
				dep = { name : dep };
			}
			manifest["sap.ui5"].dependencies.libs[makeName(dep.name)] = {
				"minVersion": "1.0.0",
				"lazy": dep.lazy || undefined
			};
		}
	}
	return JSON.stringify(manifest, null, "\t");
}

function makeLibPreloadJSON(lib, dependencies) {

	var preloadJSON = {
		"version":"2.0",
		"name": makeName(lib) + ".library-preload",
		"dependencies": undefined,
		"modules": {}
	};

	if ( dependencies ) {
		preloadJSON.dependencies = [];
		for ( var i = 0; i < dependencies.length; i++) {
			var dep = dependencies[i];
			if ( typeof dep === 'object' ) {
				if ( dep.lazy ) {
					continue;
				}
				dep = dep.name;
			}
			preloadJSON.dependencies.push(makeName(dep) + ".library-preload");
		}
	}

	preloadJSON.modules[makeModule(lib + ".library") + ".js"] = makeLib(lib, dependencies);
	preloadJSON.modules[makeModule(lib + ".manifest") + ".json"] = makeManifest(lib, dependencies);

	return JSON.stringify(preloadJSON, null, "\t");
}

function makeLibPreloadJS(lib, dependencies) {
	var preloadJS = [];
	var options;

	preloadJS.push( makePredefine( makeLib(lib, dependencies), makeModule(lib + ".library")) );
	if (_components[lib]) {
		options = _components[lib];
		preloadJS.push(makePredefine(options.code, makeModule(lib + "." + options.name + ".Component")));
	}
	preloadJS.push("jQuery.sap.registerPreloadedModules({");
	preloadJS.push("	\"version\":\"2.0\",");
	preloadJS.push("	\"name\":\"" + makeName(lib) + "\",");
	preloadJS.push("	\"modules\":{");

	if (options && options.manifest) {
		preloadJS.push("		\"" + makeModule(lib + ".manifest") + ".json\":\"" + makeLiteral(makeManifest(lib, dependencies)) + "\",");
		preloadJS.push("		\"" + makeModule(lib + "." + options.name + ".manifest") + ".json\":\"" + makeLiteral(JSON.stringify(options.manifest)) + "\"");
	} else {
		preloadJS.push("		\"" + makeModule(lib + ".manifest") + ".json\":\"" + makeLiteral(makeManifest(lib, dependencies)) + "\"");
	}

	preloadJS.push("	}");
	preloadJS.push("});");

	return preloadJS.join('\n');
}

function makeComponent(options) {
	var path = options.owner + "." + options.name;
	var code = [
		"sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {",
		"	\"use strict\";",
		"	return UIComponent.extend(\"" + makeName(path + ".Component") + "\");",
		"});"
	];

	var manifest = {
		"_version": "1.12.0",
		"sap.app": {
			"id": makeName(path),
			"type": "application",
			"title": options.name,
			"applicationVersion": {
				"version": "1.0.0"
			}
		}
	};


	code = code.join('\n');
	options.code = code;

	options.manifest = manifest;

	_components[options.owner] = options;

	mkdir(makePath(options.owner + "." + options.name));

	fs.writeFileSync(makePath(options.owner + "." + options.name) + "/Component.js", code);
	fs.writeFileSync(makePath(options.owner + "." + options.name) + "/manifest.json", JSON.stringify(manifest, null, "\t"));
}

function makeLibWith(lib, features, dependencies) {
	// build flat dep tree
	var currentLib = _currentLibs[lib] = {
		name: lib,
		flatDeps: []
	};
	if (dependencies) {
		currentLib.deps = dependencies.map(function(dep) {
			var isObject = typeof dep === 'object';
			return {
				name: isObject ? dep.name : dep,
				lazy: isObject ? dep.lazy : undefined
			};
		});
	}

	mkdir(makePath(lib));

	fs.writeFileSync(makePath(lib) + "/library.js", makeLib(lib, dependencies));

	fs.writeFileSync(makePath(lib) + "/manifest.json", makeManifest(lib, dependencies));

	if ( features && features.json ) {
		fs.writeFileSync(makePath(lib) + "/library-preload.json", makeLibPreloadJSON(lib, dependencies));
	}

	if ( features && features.js ) {
		fs.writeFileSync(makePath(lib) + "/library-preload.js", makeLibPreloadJS(lib, dependencies));
	}
}

function flatten(libInfo, parents) {
	// add dep to parents
	parents.forEach(function(parent) {
		parent.flatDeps.push(libInfo);
	});

	var lib = _currentLibs[libInfo.name];
	if (lib.deps) {
		// go deeper
		parents.push(lib);
		lib.deps.forEach(function(childLib) {
			flatten(childLib, parents);
		});
		parents.pop();
	}
}

function makeVersionInfo() {
	var versionInfo = {
		libraries: [],
		components: {}
	};

	var versionJson;

	// resolve transitive dependencies
	for (var libName in _currentLibs) {
		flatten(_currentLibs[libName], []);
	}

	var buildLibraryDependencyMap = function(dep) {
		var depName = makeName(dep.name);
		var libInfo = versionJson.manifestHints.dependencies.libs[depName];
		// lib dep exists already, but is now not lazy anymore
		if (libInfo) {
			if (libInfo.lazy && !dep.lazy) {
				delete libInfo.lazy;
			}
		} else {
			// lib dependency does not exist yet
			libInfo = {};
			if (dep.lazy) {
				libInfo.lazy = true;
			}
			versionJson.manifestHints.dependencies.libs[depName] = libInfo;
		}
	};

	// libs
	for (var currentLibKey in _currentLibs) {
		var currentLib = _currentLibs[currentLibKey];
		versionJson = {
			name: makeName(currentLib.name)
		};
		if (currentLib.flatDeps.length > 0) {
			versionJson.manifestHints = {
				dependencies: {
					libs: {}
				}
			};
			currentLib.flatDeps.forEach(buildLibraryDependencyMap);
		}

		versionInfo.libraries.push(versionJson);
	}

	// components
	for (var currentCompKey in _components) {
		var currentComp = _components[currentCompKey];

		versionJson = {
			library: makeName(currentComp.owner),
			manifestHints: {
				dependencies: {
					libs: {}
				}
			}
		};

		var ownerLib = _currentLibs[currentComp.owner];
		var aCompDepsTransitive = [];

		// reuse existing trans. dependencies
		if (ownerLib.flatDeps) {
			aCompDepsTransitive = ownerLib.flatDeps.slice();
		}

		currentComp.extraDependencies.forEach(function(extraDepKey) { // eslint-disable-line no-loop-func
			// look up transitive closure for the extra dependencies
			var extraDep = _currentLibs[extraDepKey];
			if (extraDep) {
				aCompDepsTransitive = aCompDepsTransitive.concat(extraDep.flatDeps);
			}
			aCompDepsTransitive.push({
				name: extraDepKey
			});
		});

		aCompDepsTransitive.forEach(buildLibraryDependencyMap);

		versionInfo.components[makeName(currentComp.owner + "." + currentComp.name)] = versionJson;
	}

	fs.writeFileSync(makePath("") + "/sap-ui-version.json", JSON.stringify(versionInfo, null, '\t'));
}

scenario("scenario1");
makeLibWith("lib1", {js:true}, ['lib3', 'lib4', 'lib5']);
makeLibWith("lib2", {json:true}, ['lib4', 'lib1', { name: 'lib6', lazy: true}, 'lib7']);
makeLibWith("lib3", {js:true}, ['lib4']);
makeLibWith("lib4", {js: true, json:true});
makeLibWith("lib5", {json:true});
makeLibWith("lib6", {js:true});
makeLibWith("lib7", {});

scenario("scenario2");
makeLibWith("lib1", {js:true}, ['lib3', 'lib4', 'lib5']);
makeLibWith("lib2", {json:true}, ['lib4', 'lib1', { name: 'lib6', lazy: true}, 'lib7']);
makeLibWith("lib3", {js:true}, ['lib4']);
makeLibWith("lib4", {js: true, json:true});
makeLibWith("lib5", {json:true});
makeLibWith("lib6", {js:true});
makeLibWith("lib7", {});

scenario("scenario3");
makeLibWith("lib1", {js:true}, ['lib2']);
makeLibWith("lib2", {json:true}, ['lib3', 'lib4']);
makeLibWith("lib3", {js:true});

scenario("scenario4");
makeLibWith("lib1", {js:true}, ['lib2']);
makeLibWith("lib2", {json:true}, ['lib1']);

scenario("scenario5");
makeLibWith("lib1", {js:true}, ['lib3', 'lib4', 'lib5']);
makeLibWith("lib2", {js:true}, ['lib3', { name: 'lib6', lazy: true}, 'lib5']);
makeLibWith("lib3", {js:true}, ['lib6']);
makeLibWith("lib4", {js: true, json:true});
makeLibWith("lib5", {json:true});
makeLibWith("lib6", {js:true});

scenario("scenario6");
makeLibWith("lib1", {json:true});
makeLibWith("lib2", {json:true});

scenario("scenario7");
makeLibWith("lib1", {js:true,json:true});
makeLibWith("lib2", {json:true});
makeLibWith("lib3", {js:true});
makeLibWith("lib4", {json:true});
makeLibWith("lib5", {js:true});

scenario("scenario8");
makeLibWith("lib1", {js:true,json:true});
makeLibWith("lib2", {json:true});
makeLibWith("lib3", {js:true});
makeLibWith("lib4", {json:true});
makeLibWith("lib5", {js:true});

scenario("scenario9");
makeLibWith("lib1", {js:true});

// scenario 10-12 are mocked in unit tests

scenario("scenario13");
makeLibWith("lib1", {js:true}, ['lib3', 'lib4', 'lib5']);
makeLibWith("lib2", {json:true}, ['lib4', 'lib1', { name: 'lib6', lazy: true}, 'lib7']);
makeLibWith("lib3", {js:true}, ['lib4']);
makeLibWith("lib4", {js: true, json:true});
makeLibWith("lib5", {json:true});
makeLibWith("lib6", {js:true});
makeLibWith("lib7", {});
makeVersionInfo();

scenario("scenario14");
makeLibWith("lib1", {js:true}, ['lib2', 'lib5']);
makeLibWith("lib2", {js:true}, ['lib3', { name: 'lib5', lazy: true}, 'lib6']);
makeLibWith("lib3", {js:true}, ['lib4']);
makeLibWith("lib4", {js:true});
makeLibWith("lib5", {js:true}, ['lib7']);
makeLibWith("lib6", {js:true}, ['lib7']);
makeLibWith("lib7", {js:true});
makeVersionInfo();
makeLibWith("lib8", {js:true}, ['lib1']);

// scenario 15 is used in the component prealoading tests
scenario("scenario15");
makeComponent({
	name: "comp",
	owner: "lib1",
	extraDependencies: ["lib8", "lib9"]
});
makeLibWith("lib1", {js:true}, ['lib3', 'lib4', { name: 'lib5', lazy:true }]);
makeLibWith("lib2", {json:true}, ['lib4', 'lib1', { name: 'lib6', lazy: true}, 'lib7']);
makeLibWith("lib3", {js:true}, ['lib4']);
makeLibWith("lib4", {js: true, json:true});
makeLibWith("lib5", {json:true});
makeLibWith("lib6", {js:true});
makeLibWith("lib7", {js:true});
makeLibWith("lib8", {js:true}, ['lib6']);
makeLibWith("lib10", {js:true});
makeVersionInfo();
makeLibWith("lib9", {js:true}, ['lib10']); // not in version-info
