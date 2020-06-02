sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var oExtension = new Extension({
		// Every formatter here will be available in the manifest by using "{= extension.formatters.nameToUpperCase(...)}" syntax.
		formatters: {
			toUpperCase: function (sName) {
				return sName.toUpperCase();
			},
			appendSuffix: function (sDescription) {
				var oParameters = oExtension.getCard().getCombinedParameters();
				return sDescription + ". Available since: " + oParameters.suffix;
			}
		}
	});

	return oExtension;
});
