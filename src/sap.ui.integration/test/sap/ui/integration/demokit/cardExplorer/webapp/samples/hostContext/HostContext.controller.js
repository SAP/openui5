sap.ui.define([
		'sap/ui/core/mvc/Controller',
		"sap/base/Log",
		'sap/ui/integration/Host'
	], function(Controller, Log, Host) {
	"use strict";

	return Controller.extend("sap.ui.integration.sample.HostContext.HostContext", {

		onInit: function () {
			var oValues = {
				"sample/supplier/id/value": "3",
				"sample/supplier/title/value": "New Orleans Cajun Delights",
				"sample/category/id/value": "2",
				"sample/category/title/value": "Condiments"
			};

			var oHost = new Host();

			oHost.getContextValue = function (sPath) {
				return new Promise(function (resolve) {
					setTimeout(function () {
						resolve(oValues[sPath]);
					}, 1000); // timeout for testing
				});
			};

			this.getView().byId('card1').setHost(oHost);
		}
	});
});