sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/fl/FakeLrepLocalStorage"
], function (
	Opa5,
	FakeLrepLocalStorage
) {
	"use strict";

	return Opa5.extend("sap.ui.rta.dttool.integration.pages.Common", {

		constructor: function (oConfig) {
			Opa5.apply(this, arguments);

			this._oConfig = oConfig;
		},

		iStartMyApp: function (oOptions) {
			oOptions = oOptions || {};
			oOptions.componentConfig = {
				name: "sap.ui.rta.dttool"
			};
			this.iStartMyUIComponent(oOptions);
		},
		iResetAllChanges: function () {
			FakeLrepLocalStorage.deleteChanges();
		}
	});
});



