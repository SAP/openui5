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
], (
	config
) => {
	"use strict";

	let pLoadModules = Promise.resolve();
	let pLoadLibraries = Promise.resolve();

	const aModules = config.get({
		name: "sapUiModules",
		type: config.Type.StringArray
	});

	const aLibs = config.get({
		name: "sapUiLibs",
		type: config.Type.StringArray
	});

	let sWaitForTheme = config.get({
		name: "sapUiXxWaitForTheme",
		type: config.Type.String,
		external: true}).toLowerCase();

	if (sWaitForTheme === "true" ) {
		sWaitForTheme = "rendering";
	}
	if ( sWaitForTheme !== "rendering" && sWaitForTheme !== "init" ) {
		// invalid value or false from legacy boolean setting
		sWaitForTheme = undefined;
	}

	if (!Array.isArray(aLibs)) {
		throw new Error("Config parameter libs must be of type string array!");
	}

	// load libraries
	if (aLibs.length > 0) {
		let Library;
		pLoadLibraries = new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/core/Lib"], (Lib) => {
				Library = Lib;
				resolve(Library);
			}, reject);
		}).then((Library) => {
			return Promise.all(
				aLibs.map((lib) => {
					return Library.load({
						name: lib,
						preloadOnly: true
					});
				})
			);
		}).then(() => {
			const aLibInfos = Library.getAllInstancesRequiringCss();
			let pReady = Promise.resolve();
			if (aLibInfos.length > 0) {
				pReady = Promise.all(
					aLibInfos.map((libInfo) => {
						return libInfo.started;
					})
				);
			}
			return pReady;
		}).then(() => {
			if (sWaitForTheme) {
				return new Promise((resolve, reject) => {
					sap.ui.require(["sap/ui/core/Rendering", "sap/ui/core/Theming"], (Rendering, Theming) => {
						Rendering.suspend();
						if (sWaitForTheme === "rendering") {
							Rendering.notifyInteractionStep();
							resolve();
							Rendering.getLogger().debug("delay initial rendering until theme has been loaded");
							Theming.attachAppliedOnce(() => {
								Rendering.resume("after theme has been loaded");
							});
						} else if (sWaitForTheme === "init") {
							Rendering.getLogger().debug("delay init event and initial rendering until theme has been loaded");
							Rendering.notifyInteractionStep();
							Theming.attachAppliedOnce(() => {
								resolve();
								Rendering.resume("after theme has been loaded");
							});
						}
					}, reject);
				});
			}
		}).catch((exc) => {
			throw (exc);
		});
	}

	// load modules
	if (aModules.length > 0) {
		pLoadModules = Promise.all(
			aModules.map((module) => {
				const aMatch = /^\[([^\[\]]+)?\]$/.exec(module);
				return new Promise((resolve, reject) => {
					const mod = aMatch && aMatch[1] || module;
					sap.ui.require([mod.replace(/\./g, "/")], (module) => {
						resolve(module);
					}, aMatch ? resolve : reject);
				});
			})
		);
	}

	return {
		run: () => {
			return Promise.all([pLoadModules, pLoadLibraries]);
		}
	};
});
