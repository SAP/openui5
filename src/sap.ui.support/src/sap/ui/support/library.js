/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.support.
 */
sap.ui.define(["sap/ui/core/library"],
	function (library1) {
	"use strict";

	/**
	 * UI5 library: sap.ui.support.
	 *
	 * @namespace
	 * @name sap.ui.support
	 * @public
	 */

	// library dependencies

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.support",
		// Loading sap.ui.codeeditor is moved to overlay.html to make sure it is loaded from the correct origin.
		dependencies : ["sap.ui.core", "sap.ui.fl", "sap.m", "sap.ui.layout"],
		types: ["sap.ui.support.Severity"],
		interfaces: [],
		controls: [],
		elements: [],
		noLibraryCSS: false,
		version: "${version}"
	});

	sap.ui.support.Severity = {
		Medium: "Medium",
		High: "High",
		Low: "Low"
	};

	sap.ui.support.Audiences = {
		Control: "Control",
		Internal: "Internal",
		Application: "Application"
	};

	sap.ui.support.Categories = {
		Accessibility: "Accessibility",
		Performance: "Performance",
		Memory: "Memory",
		Bindings: "Bindings",
		Consistency: "Consistency",
		Functionality : "Functionality",
		Usability : "Usability",
		DataModel: "DataModel",
		Usage: "Usage",
		Other: "Other"
	};

	return sap.ui.support;
});
