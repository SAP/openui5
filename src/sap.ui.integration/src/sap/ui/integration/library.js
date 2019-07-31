/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library sap.ui.integration.
 */
sap.ui.define(["sap/ui/base/DataType",
		"sap/ui/Global",
		"sap/ui/core/library",
		"sap/m/library",
		"sap/f/library"
	], // library dependency
	function (DataType) {

		"use strict";

		// delegate further initialization of this library to the Core
		sap.ui.getCore().initLibrary({
			name: "sap.ui.integration",
			version: "${version}",
			dependencies: ["sap.ui.core", "sap.f", "sap.m"],
			types: [
				"sap.ui.integration.CardActionType",
				"sap.ui.integration.CardDataMode"
			],
			controls: [
				"sap.ui.integration.widgets.Card",
				"sap.ui.integration.host.HostConfiguration"
			],
			elements: [],
			noLibraryCSS: true,

			//define the custom tags that can be used in this library
			customTags: {
				"card": "sap/ui/integration/widgets/Card",
				"host-configuration": "sap/ui/integration/host/HostConfiguration"
			},
			defaultTagPrefix: "ui"
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

		/**
		 * Enumeration of possible card action types.
		 *
		 * @enum {string}
		 * @experimental since 1.64
		 * Disclaimer: this property is in a beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
		 */
		thisLib.CardActionType = {

			/**
			 * Used for navigation actions
			 * @public
			 */
			Navigation : "Navigation"
		};

		/**
		 * Possible data modes for <code>{@link sap.ui.integration.widgets.Card}</code>.
		 *
		 * @enum {string}
		 * @experimental since 1.65
		 * @public
		 * @since 1.65
		 */
		thisLib.CardDataMode = {

			/**
			 * When in this mode, the card can make requests.
			 * @public
			 */
			Active: "Active",

			/**
			 * When in this mode, the card cannot make requests.
			 * @public
			 */
			Inactive: "Inactive"
		};

		return thisLib;

	});