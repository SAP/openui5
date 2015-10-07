sap.ui.define(['sap/ui/test/Opa5', "jquery.sap.storage"], function (Opa5, jQuery) {
	"use strict";

	return Opa5.extend("myApp.test.arrangement.Common", {

		iStartTheExploredApp : function (bSkipCleaningLocalStorage) {
			// clean up the local sto
			if (!bSkipCleaningLocalStorage) {
				var oStorage = jQuery.sap.storage("local");
				oStorage.put("UI5_EXPLORED_VIEW_SETTINGS", undefined);
			}

			return this.iStartMyAppInAFrame("../../../../../../../explored.html?sap-ui-language=en");
		},

		iLookAtTheScreen : function () {
			return this;
		}

	});
});
