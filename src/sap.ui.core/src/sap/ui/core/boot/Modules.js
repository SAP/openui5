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
	let Library;
	let pLoadModules = Promise.resolve();

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
		new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/core/Lib"], (Lib) => {
				Library = Lib;
				resolve(Library);
			}, reject);
		}).then((Library) => {
			return Promise.all(
				aLibs.map((lib) => {
					return Library._load({ name: lib }, { preloadOnly: true});
				})
			);
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
			return Promise.resolve();
		},
		beforeReady: (context) => {
			let pInitLibraries = Promise.resolve();
			if (aLibs.length > 0) {
				pInitLibraries = Promise.all(
					aLibs.map((lib) => {
						return Library.load({
							name: lib
						});
					})
				).then(() => {
					if (sWaitForTheme) {
						const aLibInfos = Library.getAllInstancesRequiringCss();
						let pReady = Promise.resolve();
						if (aLibInfos.length > 0) {
							pReady = Promise.all([
								context,
								...aLibInfos.map((libInfo) => {
									// wait for the library.started which indicates theme loading
									return libInfo.started;
								})
							]);
						}
						return pReady.then(() => {
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
						});
					}
				});
			}
			return Promise.all([
				pLoadModules,
				pInitLibraries
			]);
		}
	};
});
