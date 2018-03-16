sap.ui.define([
	'sap/ui/test/Opa5'
], function (Opa5) {
	"use strict";

	function getFrameUrl(sHash) {
		sHash = sHash || "";
		var sUrl = jQuery.sap.getResourcePath("sap/ui/core/tutorial/odatav4/index.html");

		return sUrl + "#" + sHash;
	}

	return Opa5.extend("sap.ui.core.tutorial.odatav4.test.integration.arrangements.Arrangement", {

		constructor : function (oConfig) {
			Opa5.apply(this, arguments);

			this._oConfig = oConfig;
		},

		iStartMyApp : function (oOptions) {
			oOptions = oOptions || {};

			this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash));
		}
	});
});