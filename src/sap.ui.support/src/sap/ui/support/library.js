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
	 * A library for the Support Assistant tool.
	 * <h3>Overview</h3>
	 * The library provides the Support Assistant tool. It enables application
	 * developers to check whether their applications are built according to the
	 * best practices for building SAPUI5 apps. The tool uses a set of pre-defined
	 * rules to check all aspects of an application.
	 *
	 * @namespace
	 * @name sap.ui.support
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 */

	// library dependencies

	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name : "sap.ui.support",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.ui.support.Severity"
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

	/**
	 * Defines severity types.
	 * @enum {string}
	 * @since ${version}
	 * @public
	 */
	sap.ui.support.Severity = {
		/**
		 * Medium issue severity.
		 * @public
		 */
		Medium: "Medium",
		/**
		 * High issue severity.
		 * @public
		 */
		High: "High",
		/**
		 * Low issue severity.
		 * @public
		 */
		Low: "Low"
	};

	/**
	 * Defines the Audiences.
	 * @enum {string}
	 * @since ${version}
	 * @public
	 */
	sap.ui.support.Audiences = {
		/**
		 * Audience just on Control level.
		 * @public
		 */
		Control: "Control",
		/**
		 * Audience just on Internal level.
		 * @public
		 */
		Internal: "Internal",
		/**
		 * Audience just on Application level.
		 * @public
		 */
		Application: "Application"
	};

	/**
	 * Issue Categories.
	 * @enum {string}
	 * @since ${version}
	 * @public
	 */
	sap.ui.support.Categories = {
		/**
		 * Accessibility issue category.
		 * @public
		 */
		Accessibility: "Accessibility",
		/**
		 * Performance issue category.
		 * @public
		 */
		Performance: "Performance",
		/**
		 * Memory issue category.
		 * @public
		 */
		Memory: "Memory",
		/**
		 * Binding issue category.
		 * @public
		 */
		Bindings: "Bindings",
		/**
		 * Consistency issue category.
		 * @public
		 */
		Consistency: "Consistency",
		/**
		 * Functionality issue category.
		 * @public
		 */
		Functionality : "Functionality",
		/**
		 * Usability issue category.
		 * @public
		 */
		Usability : "Usability",
		/**
		 * DataModel issue category.
		 * @public
		 */
		DataModel: "DataModel",
		/**
		 * Usage issue category.
		 * @public
		 */
		Usage: "Usage",
		/**
		 * Accessibility issue category.
		 * @public
		 */
		Other: "Other"
	};

	return sap.ui.support;
});
