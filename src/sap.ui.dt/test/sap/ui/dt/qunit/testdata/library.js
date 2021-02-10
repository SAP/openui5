/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of test library sap.ui.testLibrary.
 */
sap.ui.define([
	"sap/ui/core/library"
],
function () {
	"use strict";

	/**
	 * DesignTime library.
	 *
	 * @namespace
	 * @name sap.ui.testLibrary
	 * @author SAP SE
	 * @version ${version}
	 * @experimental This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 * @private
	 */

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
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

	return sap.ui.testLibrary;
}, /* bExport= */ true);
