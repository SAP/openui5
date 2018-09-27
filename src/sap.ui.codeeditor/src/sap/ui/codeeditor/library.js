/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.codeeditor.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'],
	function(Core) {
	"use strict";


	/**
	 * UI5 library: sap.ui.codeeditor.
	 *
	 * @namespace
	 * @name sap.ui.codeeditor
	 * @public
	 */

	// library dependencies

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
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


	return sap.ui.codeeditor;

});
