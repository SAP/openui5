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
				"sap.ui.integration.Widget",
				"sap.ui.integration.host.HostConfiguration"
			],
			elements: [
				"sap.ui.integration.Host",
				"sap.ui.integration.Extension"
			],

			// define the custom elements that can be used in this library
			customElements: {
				"card": "sap/ui/integration/customElements/CustomElementCard",
				"widget": "sap/ui/integration/customElements/CustomElementWidget",
				"host-configuration": "sap/ui/integration/customElements/CustomElementHostConfiguration"
			}
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
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 * @public
		 */
		thisLib.CardActionType = {

			/**
			 * Used for navigation actions
			 * @public
			 */
			Navigation : "Navigation",

			/**
			 * Used for submit actions
			 * @public
			 */
			Submit: "Submit",

			/**
			 * Used for custom actions
			 * @public
			 * @experimental Since 1.76
			 */
			Custom: 'Custom'
		};

		/**
		 * Possible data modes for <code>{@link sap.ui.integration.widgets.Card}</code>.
		 *
		 * @enum {string}
		 * @experimental since 1.65
		 * @public
		 * @since 1.65
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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