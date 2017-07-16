/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/fl/RegistrationDelegator"
	],
	function(RegistrationDelegator) {
	"use strict";

	/**
	 * SAPUI5 library for UI Flexibility and Descriptor Changes and Descriptor Variants.
	 *
	 * @namespace
	 * @name sap.ui.fl
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @sap-restricted
	 *
	 */

	sap.ui.getCore().initLibrary({
		name:"sap.ui.fl",
		version:"${version}",
		dependencies:["sap.ui.core","sap.m"],
		noLibraryCSS: true,
		extensions: {
			"sap.ui.support": {
				diagnosticPlugins: [
					"sap/ui/fl/support/Flexibility"
				]
			}
		}
	});

	RegistrationDelegator.registerAll();

	return sap.ui.fl;

}, /* bExport= */ true);
