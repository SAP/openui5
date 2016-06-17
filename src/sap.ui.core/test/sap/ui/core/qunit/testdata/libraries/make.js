/* -------------------------------------------------------------------------------------------

   Node module that creates test libraries for the Core.qunit.html test

   Must be executed inside this folder with

     node make.js

   ------------------------------------------------------------------------------------------- */

var fs = require("fs");
var pathModule = require("path");

function mkdir(path) {
	try {
		fs.mkdirSync(path);
	} catch(err) {
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

function scenario(s) {
	_scenario = s + ".";
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
		"	sap.ui.getCore().initLibrary({",
		"		name: '" + makeName(lib) + "',",
		"		dependencies: [",
		"		],",
		"		noLibraryCSS: true",
		"	});",
		"	return " + makeName(lib) + ";",
		"});"
	];

	if ( dependencies ) {
		for ( var i = 0, j = 4; i < dependencies.length; i++) {
			var dep = dependencies[i];
			if ( typeof dep === 'object' ) {
				if ( dep.lazy ) {
					continue;
				}
				dep = dep.name;
			}
			code.splice(j++, 0, "\t\t\t'" + makeName(dep) + "'" + (i + 1 < dependencies.length ? "," : ""));
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
			}
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
	}

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
	preloadJS.push( makePredefine( makeLib(lib, dependencies), makeModule(lib + ".library")) );
	preloadJS.push("jQuery.sap.registerPreloadedModules({");
	preloadJS.push("	\"version\":\"2.0\",");
	preloadJS.push("	\"name\":\"" + makeName(lib) + "\",");
	preloadJS.push("	\"modules\":{");
	preloadJS.push("		\"" + makeModule(lib + ".manifest") + ".json\":\"" + makeLiteral(makeManifest(lib, dependencies)) + "\"");
	preloadJS.push("	}");
	preloadJS.push("});");
	return preloadJS.join('\n');
}

function makeLibWith(lib, features, dependencies) {
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


