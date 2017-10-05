/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (jQuery, Device, Opa5, opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - " +
		"Write via application groups with SubmitMode.Auto/.Direct");

	//*****************************************************************************
	["myAutoGroup", "$auto", "myDirectGroup", "$direct"].forEach(function (sGroupId) {
		opaTest("POST/PATCH SalesOrder via group: " + sGroupId, function (Given, When, Then) {
			var oExpectedPatchLog = {
					component : "sap.ui.model.odata.v4.ODataPropertyBinding",
					level : jQuery.sap.log.Level.ERROR,
					message: "Failed to update path /SalesOrderList/-1/Note",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				},
				oExpectedPostLog = {
					component : "sap.ui.model.odata.v4.ODataParentBinding",
					level : jQuery.sap.log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically"
				};

			if (!TestUtils.isRealOData()) {
				Opa5.assert.ok(true, "Test runs only with realOData=true");
				return;
			}

			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.SalesOrders",
					settings: {componentData : {updateGroupId : sGroupId}}
				}
			});

			When.onTheMainPage.firstSalesOrderIsVisible();

			// Test: create a new SalesOrder note -> error because initial Note property,
			// PATCH restarted automatically after note filled
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheErrorInfo.confirm();
			When.onTheCreateNewSalesOrderDialog.changeNote("My Note");
			When.onTheSuccessInfo.confirm();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			Then.onTheMainPage.checkNote(0, "My Note");

			// Test: update of SalesOrder note -> error, restart after note corrected
			When.onTheMainPage.changeNote(0, "RAISE_ERROR");
			When.onTheErrorInfo.confirm();
			When.onTheMainPage.changeNote(0, "My Note");
			Then.onTheMainPage.checkNote(0, "My Note");

			//TODO: analyse why we got the same log for PATCH 2 times for SubmitMode.Auto
			Then.onAnyPage.checkLog([oExpectedPostLog, oExpectedPatchLog, oExpectedPatchLog]);
			Then.iTeardownMyUIComponent();
		});
	});
});
