/*!
 * ${copyright}
 */

/**
 * Load configured modules
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config"
], function(
	config
) {
	"use strict";
	var pLoadModules = Promise.resolve();
	var pLoadLibraries = Promise.resolve();
	var aModulesLoaded = [];

	var aModules = config.get({
		name: "sapUiModules",
		type: config.Type.StringArray
	});

	var aLibs = config.get({
		name: "sapUiLibs",
		type: config.Type.StringArray
	});

	// load libraries
	if (aLibs.length  > 0) {
		pLoadLibraries = new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/core/Lib"], function(Library) {
				resolve(Library);
			}, reject);
		}).then(function(Library) {
			var aLibsLoaded = [];
			aLibs.forEach(function(lib){
				aLibsLoaded.push(
					Library.load({
						name: lib
					})
				);
			});
			return Promise.all(aLibsLoaded);
		});
	}

	// load  eventing in parallel an execute it so it is available for later usages
	aModulesLoaded.push(new Promise(function(resolve, reject) {
		sap.ui.require(["sap/ui/events/jquery/EventSimulation"],function() {
			resolve();
		});
	}));

	// load other modules
	if (aModules.length > 0) {
		aModules.forEach(function(module) {
			var aMatch = /^\[([^\[\]]+)?\]$/.exec(module);
			aModulesLoaded.push(
				new Promise(function(resolve, reject) {
					sap.ui.require([aMatch && aMatch[1] || module], function() {
						resolve();
					}, aMatch ? resolve : reject);
				})
			);
		});
	}

	pLoadModules =  Promise.all(aModulesLoaded);

	return {
		run: function() {
			return Promise.all([pLoadModules, pLoadLibraries]);
		}
	};
});