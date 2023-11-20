/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/SyncPromise",
	"sap/base/assert"
], function(
	SyncPromise,
	assert
) {
	"use strict";

	/* global Map */

	/**
	 * @class Loads the given module(s).
	 *
	 * @example <caption>Example usage of <code>loadModules</code> module</caption>
	 *	sap.ui.define(["sap/ui/mdc/util/loadModules"], function(loadModules) {
	 *		"use strict";
	 *
	 *		var oLoadModulesPromise = loadModules([
	 *			"sap/ui/Module1",
	 *			"sap/ui/Module2"
	 *		]).then(function onModulesLoaded(aModules) {
	 *			var Module1 = aModules[0];
	 *			var Module2 = aModules[1];
	 *		}).catch(function onLoadingError() {
	 *			console.error("Something goes wrong while loading the modules!");
	 *		});
	 *
	 *	});
	 *
	 * @example <caption>Example usage of <code>loadModules</code> module</caption>
	 *	sap.ui.define(["sap/ui/mdc/util/loadModules"], function(loadModules) {
	 *		"use strict";
	 *
	 *		var oLoadModulesPromise = loadModules("sap/ui/Module1");
	 *		oLoadModulesPromise.then(function onModuleLoaded(aModules) {
	 *			var Module1 = aModules[0];
	 *		}).catch(function onLoadingError() {
	 *			console.error("Something goes wrong while loading the module!");
	 *		});
	 *
	 *	});
	 *
	 * @alias sap.ui.mdc.util.loadModules
	 * @param {string|string[]} vModulePaths Pathname(s) of the module(s) to be loaded
	 * @returns {SyncPromise<function[]>} A <code>Promise</code> object to be fulfilled
	 * by an array of modules export functions.
	 * Otherwise a <code>Promise</code> object in the rejected state.
	 * <b>Note:</b> The <code>Promise</code> object is fulfilled synchronously with
	 * the <code>resolved</code> state, if all required modules are already loaded.
	 * @function
	 * @private
	 * @since 1.78
	 * @ui5-restricted sap.ui.mdc
	 */
	return function loadModules(vModulePaths) {
		assert(typeof vModulePaths === "string" || Array.isArray(vModulePaths), "vModulePaths" +
		" param either must be a single string or an array of strings. - sap.ui.mdc.util.loadModules");

		let aModulesPaths;

		if (typeof vModulePaths === "string") {
			aModulesPaths = [ vModulePaths ];
		} else {
			aModulesPaths = vModulePaths;
		}

		const oModulesMap = new Map();

		aModulesPaths.forEach(function(sModulePath) {
			const vModule = sap.ui.require(sModulePath);
			oModulesMap.set(sModulePath, vModule);
		});

		const aNotLoadedModulePaths = aModulesPaths.filter(function(sModulePath) {
			return oModulesMap.get(sModulePath) === undefined;
		});

		// all required modules are already loaded
		if (aNotLoadedModulePaths.length === 0) {
			const aModules = Array.from(oModulesMap.values());
			return SyncPromise.resolve(aModules);
		}

		return new SyncPromise(function(resolve, reject) {

			function onModulesLoadedSuccess() {
				const aNewLoadedModules = Array.from(arguments);

				aNotLoadedModulePaths.forEach(function(sModulePath, iIndex) {
					oModulesMap.set(sModulePath, aNewLoadedModules[iIndex]);
				});

				const aModules = Array.from(oModulesMap.values());
				resolve(aModules);
			}

			sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess, reject);
		});
	};
});
