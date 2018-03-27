/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/RegistrationDelegator"
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
				publicRules:true
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
		AdaptationProject: "ADAPTATION_PROJECT",
		FioriElementsFromScratch: "FE_FROM_SCRATCH",
		UiAdaptation: "UI_ADAPTATION"
	};

	RegistrationDelegator.registerAll();

	return sap.ui.fl;

});
