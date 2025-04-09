(function() {
	"use strict";

	const modules = Object.create(null);
	globalThis.define = function(name, deps, factory) {
		if ( typeof name !== "string" ) {
			throw new Error(`Anonymoous define is not supported`);
		}
		if ( Array.isArray(deps) ) {
			deps = deps.map((dep) => modules[dep]);
		} else {
			factory = deps;
			deps = [];
		}
		if ( typeof factory === "function" ) {
			modules[name] = factory.apply(deps);
		} else {
			modules[name] = factory;
		}
	};
	globalThis.define.amd = true;
	globalThis.require = function require(deps, callback) {
		if ( typeof deps === "string" ) {
			if (Object.hasOwn(modules, deps)) {
				return modules[deps];
			}
			throw new Error(`module ${deps} not yet defined`);
		}
		callback.apply(globalThis, deps.map((dep) => require(dep)));
	};
}());