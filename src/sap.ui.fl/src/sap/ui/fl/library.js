/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator",
	"sap/ui/core/library", // library dependency
	"sap/m/library" // library dependency
], function(RegistrationDelegator) {
	"use strict";

	/**
	 * SAPUI5 library for UI Flexibility and Descriptor Changes and Descriptor Variants.
	 * @namespace
	 * @name sap.ui.fl
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 */

	/**
	 * Element or Component instance or object containing information about the element or component
	 *
	 * @typedef {sap.ui.core.Element|sap.ui.core.Component|object} sap.ui.fl.Selector
	 * @since 1.69
	 * @private
	 * @ui5-restricted
	 * can be either
	 * 	- element or component instance
	 * 	- object with information about an element
	 * 		{
	 * 			elementId
	 * 			elementType
	 * 			appComponent
	 * 		}
	 * - object with information about component
	 * 		{
	 * 			appId
	 * 			appVersion
	 * 		}
	 */

	sap.ui.getCore().initLibrary({
		name: "sap.ui.fl",
		version: "${version}",
		controls: ["sap.ui.fl.variants.VariantManagement"],
		dependencies: [
			"sap.ui.core", "sap.m"
		],
		designtime: "sap/ui/fl/designtime/library.designtime",
		extensions: {
			"sap.ui.support": {
				diagnosticPlugins: [
					"sap/ui/fl/support/Flexibility"
				],
				//Configuration used for rule loading of Support Assistant
				publicRules: true
			}
		}
	});

	/**
	 * Available Scenarios
	 *
	 * @enum {string}
	 */
	sap.ui.fl.Scenario = {
		AppVariant: "APP_VARIANT",
		VersionedAppVariant: "VERSIONED_APP_VARIANT",
		AdaptationProject: "ADAPTATION_PROJECT",
		FioriElementsFromScratch: "FE_FROM_SCRATCH",
		UiAdaptation: "UI_ADAPTATION"
	};

	RegistrationDelegator.registerAll();

	return sap.ui.fl;
});
