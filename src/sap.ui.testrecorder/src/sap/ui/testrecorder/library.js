/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.testrecorder.
 */
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/Core",
	"sap/ui/support/library"
], function () {
	"use strict";

	/**
	 * UI5 library: sap.ui.testrecorder.
	 * A library for the Test Recorder tool.
	 * <h3>Overview</h3>
	 * The library provides the Test Recorder tool. It assists application
	 * developers in creating integration and system tests.
	 *
	 * @namespace
	 * @name sap.ui.testrecorder
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 */

	// library dependencies

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.testrecorder",
		dependencies : [
			"sap.ui.core",
			"sap.ui.support"
		],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: true,
		version: "${version}",
		extensions: {
			//Configuration used for rule loading of Support Assistant
			"sap.ui.support": {
				internalRules:true
			}
		}
	});

	return sap.ui.testrecorder;
});
