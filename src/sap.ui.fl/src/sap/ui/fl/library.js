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
		dependencies:["sap.ui.core"],
		noLibraryCSS: true
	});

//	if ( XMLView.registerPreprocessor ){
//		// Register preprocessor for flexibility changes
//		XMLView.registerPreprocessor("controls", "sap.ui.fl.PreprocessorImpl", true);
//		// Deactivated until caching is in place!
//		//XMLView.registerPreprocessor("viewxml", "sap.ui.fl.XmlPreprocessorImpl", true);
//	} else {
//		//workaround solution until registerPreprocessor is available
//		//PreprocessorImpl because in the workaround case there is no preprocessor base object
//		View._sContentPreprocessor = "sap.ui.fl.PreprocessorImpl";
//	}

	RegistrationDelegator.registerAll();

	return sap.ui.fl;

}, /* bExport= */ true);
