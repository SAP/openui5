/* -------------------------------------------------------------------------------------------

   Node module that creates test libraries for the Core.qunit.html test

   Must be executed inside this folder with

     node make.js

   ------------------------------------------------------------------------------------------- */

/* eslint strict: [2, "global"] */
/* eslint-disable no-implicit-globals */
/* global require */
"use strict";

const {mkdirSync, writeFileSync} = require("fs");

const NAME_PREFIX = "testlibs.";
let _scenario = "";
let _currentLibs = {};
let _components = {};

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
	return code.replace("sap.ui.define(", `sap.ui.predefine("${module}",`);
}

function makeLiteral(content) {
	return content.replace(/"/g, "\\\"").replace(/\t/g, "\\t").replace(/\n/g, "\\n");
}

function makeLib(lib, dependencies) {

	// only add non-lazy dependencies
	const deps = dependencies
		? dependencies.filter((dep) => typeof dep === "string" || !dep.lazy)
		: [];

	const code =
`sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"${deps.map((dep) => `,\n\t"${makeModule(dep + ".library")}"`).join("")}
], function(Library) {
	"use strict";
	return Library.init({
		name: "${makeName(lib)}",
		apiVersion: 2,
		dependencies: [${deps.map((dep) => `
			"${makeName(dep)}"`).join(",")}
		],
		noLibraryCSS: true
	});
});`;

	return code;
}

function makeManifest(lib, dependencies) {
	const manifest = {
		"sap.ui5": {
			"dependencies" : {
				"libs": {
				}
			}
		}
	};
	if ( dependencies ) {
		dependencies.forEach((dep) => {
			if ( typeof dep === 'string' ) {
				dep = { name : dep };
			}
			manifest["sap.ui5"].dependencies.libs[makeName(dep.name)] = {
				"minVersion": "1.0.0",
				"lazy": dep.lazy || undefined
			};
		});
	}
	return JSON.stringify(manifest, null, "\t");
}

function makeLibPreloadJSON(lib, dependencies) {

	const preloadJSON = {
		"version":"2.0",
		"name": makeName(lib) + ".library-preload",
		"dependencies": undefined,
		"modules": {}
	};

	if ( dependencies ) {
		preloadJSON.dependencies = [];
		dependencies.forEach((dep) => {
			if ( typeof dep === 'object' ) {
				if ( dep.lazy ) {
					return;
				}
				dep = dep.name;
			}
			preloadJSON.dependencies.push(makeName(dep) + ".library-preload");
		});
	}

	preloadJSON.modules[makeModule(lib + ".library") + ".js"] = makeLib(lib, dependencies);
	preloadJSON.modules[makeModule(lib + ".manifest") + ".json"] = makeManifest(lib, dependencies);

	return JSON.stringify(preloadJSON, null, "\t");
}

function makeLibPreloadJS(lib, dependencies) {
	const preloadJS = [];
	const options = _components[lib];

	preloadJS.push(`//@ui5-bundle ${makeModule(lib)}/library-preload.js`);
	preloadJS.push( makePredefine( makeLib(lib, dependencies), makeModule(`${lib}.library`)) );
	if (options) {
		preloadJS.push(makePredefine(options.code, makeModule(`${lib}.${options.name}.Component`)));
	}
	preloadJS.push("sap.ui.require.preload({");
	if (options && options.manifest) {
		preloadJS.push(`	"${makeModule(`${lib}.manifest`)}.json":"${makeLiteral(makeManifest(lib, dependencies))}",`);
		preloadJS.push(`	"${makeModule(`${lib}.${options.name}.manifest`)}.json":"${makeLiteral(JSON.stringify(options.manifest))}"`);
	} else {
		preloadJS.push(`	"${makeModule(`${lib}.manifest`)}.json":"${makeLiteral(makeManifest(lib, dependencies))}"`);
	}
	preloadJS.push("});");

	return preloadJS.join('\n');
}

function makeComponent(options) {
	const path = options.owner + "." + options.name;

	const code =
`sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";
	return UIComponent.extend("${makeName(path)}.Component");
});`;

	const manifest = {
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

	if (options.embeddedBy) {
		manifest["sap.app"]["embeddedBy"] = options.embeddedBy;
	}

	options.code = code;
	options.manifest = manifest;

	_components[options.owner] = options;

	mkdirSync(makePath(options.owner + "." + options.name), {recursive: true});

	writeFileSync(makePath(options.owner + "." + options.name) + "/Component.js", code);
	writeFileSync(makePath(options.owner + "." + options.name) + "/manifest.json", JSON.stringify(manifest, null, "\t"));
}

function makeLibWith(lib, features, dependencies) {
	// build flat dep tree
	const currentLib = _currentLibs[lib] = {
		name: lib,
		flatDeps: []
	};
	if (dependencies) {
		currentLib.deps = dependencies.map((dep) => {
			const isObject = typeof dep === 'object';
			return {
				name: isObject ? dep.name : dep,
				lazy: isObject ? dep.lazy : undefined
			};
		});
	}

	mkdirSync(makePath(lib), {recursive: true});

	writeFileSync(makePath(lib) + "/library.js", makeLib(lib, dependencies));

	writeFileSync(makePath(lib) + "/manifest.json", makeManifest(lib, dependencies));

	if ( features && features.json ) {
		writeFileSync(makePath(lib) + "/library-preload.json", makeLibPreloadJSON(lib, dependencies));
	}

	if ( features && features.js ) {
		writeFileSync(makePath(lib) + "/library-preload.js", makeLibPreloadJS(lib, dependencies));
	}
}

function flatten(libInfo, parents) {
	// add dep to parents
	parents.forEach(function(parent) {
		parent.flatDeps.push(libInfo);
	});

	const lib = _currentLibs[libInfo.name];
	if (lib.deps) {
		// go deeper
		parents.push(lib);
		lib.deps.forEach((childLib) => flatten(childLib, parents));
		parents.pop();
	}
}

function makeVersionInfo() {
	const versionInfo = {
		libraries: [],
		components: {}
	};

	// resolve transitive dependencies
	for (const currentLib of Object.values(_currentLibs)) {
		flatten(currentLib, []);
	}

	function buildDependencyInfo(entity, dependencies) {
		const propName = entity.owner ? "library" : "name";
		const versionJson = {
			[propName]: makeName(entity.owner || entity.name)
		};

		if (dependencies.length > 0) {
			versionJson.manifestHints = {
				dependencies: {
					libs: {}
				}
			};
			dependencies.forEach((dep) => {
				const depName = makeName(dep.name);
				let libInfo = versionJson.manifestHints.dependencies.libs[depName];
				if (libInfo) {
					// lib dep exists already, but is now not lazy anymore
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
			});
		}

		return versionJson;
	}

	// libs
	for (const currentLib of Object.values(_currentLibs)) {
		const versionJson = buildDependencyInfo(currentLib, currentLib.flatDeps);

		versionInfo.libraries.push(versionJson);
	}

	// components
	for (const currentComp of Object.values(_components)) {

		const ownerLib = _currentLibs[currentComp.owner];
		let aCompDepsTransitive = [];

		// reuse existing transitive dependencies
		if (ownerLib.flatDeps) {
			aCompDepsTransitive = ownerLib.flatDeps.slice();
		}

		currentComp.extraDependencies.forEach((extraDepKey) => { // eslint-disable-line no-loop-func
			// look up transitive closure for the extra dependencies
			const extraDep = _currentLibs[extraDepKey];
			if (extraDep) {
				aCompDepsTransitive = aCompDepsTransitive.concat(extraDep.flatDeps);
			}
			aCompDepsTransitive.push({
				name: extraDepKey
			});
		});

		const versionJson = buildDependencyInfo(currentComp, aCompDepsTransitive);

		versionInfo.components[makeName(currentComp.owner + "." + currentComp.name)] = versionJson;
	}

	writeFileSync(makePath("") + "/sap-ui-version.json", JSON.stringify(versionInfo, null, '\t'));
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

// scenario 10 is mocked in unit tests

scenario("scenario11");
makeLibWith("lib1", {});

// scenario 12 is mocked in unit tests

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

// embeddedBy: Component is embedded in library
scenario("scenario16");
makeComponent({
	name: "embeddedComponent",
	owner: "embeddingLib",
	embeddedBy: "../"
});
makeLibWith("embeddingLib", {js: true});