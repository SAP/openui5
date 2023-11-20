sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/demo/orderbrowser/localService/mockserver",
	"sap/base/strings/capitalize",
	"sap/ui/core/Core"
], function (Opa5, mockserver, capitalize, oCore) {
	"use strict";

	return Opa5.extend("sap.ui.demo.orderbrowser.test.integration.pages.Common", {

		getEntitySet: function  (sEntitySet) {
			return mockserver.getMockServer().getEntitySetData(sEntitySet);
		},
		I18NTextExtended: function(oControl, sResourceId, sPropertyName, sLibrary, aParams){
			var oModel, oResourceBundle, sText;
			var fnProperty = oControl["get" + capitalize(sPropertyName, 0)];

			// check property
			if (!fnProperty) {
				return false;
			}

			var sPropertyValue = fnProperty.call(oControl);

			if (sLibrary) {
				oResourceBundle = oCore.getLibraryResourceBundle(sLibrary);
			} else {
				oModel = oControl.getModel("i18n");
				oResourceBundle = oModel.getResourceBundle();
			}

			sText = oResourceBundle.getText(sResourceId, aParams);

			return sText === sPropertyValue;
		}
	});

});