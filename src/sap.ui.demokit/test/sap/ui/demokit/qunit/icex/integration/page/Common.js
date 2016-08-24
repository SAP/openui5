sap.ui.define([
	"sap/ui/test/Opa5",
	"jquery.sap.storage"
], function (Opa5, jQuery) {
	"use strict";

	return Opa5.extend("myApp.test.arrangement.Common", {

		iStartTheApp : function () {
			// clean up the local storage
			var oStorage = jQuery.sap.storage("local");
			oStorage.put("ICON_EXPLORER_FAVORITES", undefined);
			// start ap in iFrame
			return this.iStartMyAppInAFrame("../../../../../../../iconExplorer.html?sap-ui-language=en");
		},

		iLookAtTheScreen : function () {
			return this;
		},

		iPressBrowserBack : function () {
			history.go(-1);
			return this;
		}
	});
});
