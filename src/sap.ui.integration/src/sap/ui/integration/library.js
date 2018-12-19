/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.f.
 */
sap.ui.define(["sap/ui/base/DataType",
	"sap/ui/Global",
	"sap/ui/core/library",
	"sap/f/library"], // library dependency
	function(DataType) {

	"use strict";

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.integration",
		version: "${version}",
		dependencies : ["sap.ui.core", "sap.f"],
		types: [
		],
		controls: [
			"sap.ui.integration.Example"
		],
		elements: [
		],
		noLibraryCSS: true
	});

	/**
	 * SAPUI5 library with controls specialized for SAP Fiori apps.
	 *
	 * @namespace
	 * @alias sap.ui.integration
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 */
	var thisLib = sap.ui.integration;

	return thisLib;

});
