/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Opa5, TestUtils) {
	"use strict";

	return {
		writeNonDeferredGroup : function (Given, When, Then, sGroupId) {
			var aExpectedLogs = [{
					component : "sap.ui.model.odata.v4.ODataParentBinding",
					level : jQuery.sap.log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically"
				}],
				oExpectedPatchLog = {
					component : "sap.ui.model.odata.v4.ODataPropertyBinding",
					level : jQuery.sap.log.Level.ERROR,
					message: "Failed to update path /SalesOrderList/-1/Note",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				};

		if (!TestUtils.isRealOData()) {
			Opa5.assert.ok(true, "Test runs only with realOData=true");
			return;
		}

		TestUtils.setData("sap.ui.core.sample.odata.v4.SalesOrders.updateGroupId", sGroupId);

		When.onTheMainPage.firstSalesOrderIsVisible();

		// Test: create a new SalesOrder with erroneous Note property,
		// POST restarted automatically after note corrected
		When.onTheMainPage.createInvalidSalesOrderViaAPI();
		When.onTheErrorInfo.confirm();
		When.onTheMainPage.changeNote(0, "My Note");
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkNote(0, "My Note");

		// Test: update of SalesOrder note -> error, restart after note corrected
		When.onTheMainPage.changeNote(0, "RAISE_ERROR");
		When.onTheErrorInfo.confirm();
		When.onTheMainPage.changeNote(0, "My patched Note");
		Then.onTheMainPage.checkNote(0, "My patched Note");
		aExpectedLogs.push(oExpectedPatchLog);
		//TODO: analyse why we got the same log for PATCH 2 times for SubmitMode.Auto
		aExpectedLogs.push(oExpectedPatchLog);

		// CleanUp: delete created SalesOrder again via given group ID
		When.onTheMainPage.selectFirstSalesOrder();
		When.onTheMainPage.deleteSelectedSalesOrderViaGroupId(sGroupId);
		Then.onTheMainPage.checkID(0);

		Then.onAnyPage.checkLog(aExpectedLogs);
	}};
});