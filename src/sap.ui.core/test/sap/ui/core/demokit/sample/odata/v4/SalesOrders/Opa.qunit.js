/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/Properties",
	"sap/ui/Device"
], function (jQuery, Opa5, opaTest, Properties, Device) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders");

	opaTest("Find view elements", function (Given, When, Then) {
		var sUrl = "../../../common/index.html?component=odata.v4.SalesOrders&realOData="
				+ encodeURIComponent(jQuery.sap.getUriParameters().get("realOData"));

		Given.iStartMyAppInAFrame(sUrl);

		Then.waitFor({
			controlType: "sap.m.Button",
			matchers : new Properties({text : "Delete"}),
			success : function (oControl) {
				var sTypeName,
					oView = Opa5.getWindow().sap.ui.core.Core().byId("MainView");

				// check for valid automatic type determination for each cell content in 1st row
				oView.byId("SalesOrders").getItems()[0].getCells().forEach(function (oCell) {
					var oBinding = oCell.getBinding("text");

					if (!oBinding) {
						return;
					}
					sTypeName = oBinding.getType() ? oBinding.getType().getName() : "";
					Opa5.assert.strictEqual(sTypeName.indexOf("sap.ui.model.odata.type"), 0,
						"Binding: " + oBinding.getPath() + " has ODataType: " + sTypeName);
				});

				// check no warnings and errors
				Opa5.getWindow().jQuery.sap.log.getLogEntries().forEach(function (oLog) {
					var sComponent = oLog.component || "";

					if ((sComponent.indexOf("sap.ui.model.odata.v4.") === 0
							|| sComponent.indexOf("sap.ui.model.odata.type.") === 0)
						&& oLog.level <= jQuery.sap.log.Level.WARNING) {
						Opa5.assert.ok(false, "Warning or error found: " + sComponent
							+ " Level: " + oLog.level + " Message: " + oLog.message );
					}
				});
				Then.iTeardownMyAppFrame();
			},
			errorMessage : "Delete button not found. Data from service could not be retrieved?"
		});
	});
});
