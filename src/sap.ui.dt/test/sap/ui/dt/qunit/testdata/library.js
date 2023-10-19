/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of test library sap.ui.testLibrary.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/library"
], function(Lib) {
	"use strict";

	/**
	 * DesignTime library.
	 *
	 * @namespace
	 * @name sap.ui.testLibrary
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 */

	// delegate further initialization of this library to the Core
	var testLib = Lib.init({
		name: "sap.ui.testLibrary",
		version: "${version}",
		dependencies: ["sap.ui.core", "sap.ui.dt"],
		types: [],
		interfaces: [],
		controls: [
			"dt.control.SimpleScrollControl"
		],
		elements: [],
		extensions: {
			flChangeHandlers: {
				"dt.control.SimpleScrollControl": {
					moveControls: "default"
				}
			}
		}
	});

	return testLib;
}, /* bExport= */ true);
