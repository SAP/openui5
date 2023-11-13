/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.codeeditor.
 */
sap.ui.define([
	"sap/ui/core/Lib",
	// provides sap.ui.getCore()
	"sap/ui/core/Core",
	// library dependency
	"sap/ui/core/library"
], function(Library) {
	"use strict";

	/**
	 * UI5 library: sap.ui.codeeditor.
	 *
	 * @namespace
	 * @alias sap.ui.codeeditor
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.48
	 * @public
	 */
	var thisLib = Library.init({
		name : "sap.ui.codeeditor",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [
			"sap.ui.codeeditor.CodeEditor"
		],
		elements: [],
		noLibraryCSS: false,
		version: "${version}"
	});

	return thisLib;
});