/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Log, Opa5, TestUtils) {
	"use strict";

	return {
		writeNonDeferredGroup : function (sGroupId, sUIComponent, Given, When, Then) {
			var aExpectedLogs = [{
					component : "sap.ui.model.odata.v4.ODataParentBinding",
					level : Log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically"
				}],
				oExpectedPatchLog0 = {
					component : "sap.ui.model.odata.v4.ODataPropertyBinding",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				},
				oExpectedPatchLog1 = {
					component : "sap.ui.model.odata.v4.ODataPropertyBinding",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList",
					details : "Error occurred while processing the request"
				};

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});

			TestUtils.setData("sap.ui.core.sample.odata.v4.SalesOrders.updateGroupId", sGroupId);

			When.onTheMainPage.firstSalesOrderIsVisible();

			// Test: create a new SalesOrder with erroneous Note property,
			// POST restarted automatically after note corrected
			When.onTheMainPage.createInvalidSalesOrderViaAPI();
			When.onTheMessagePopover.close();
			When.onTheMainPage.changeNoteInSalesOrders(0, "My Note");
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkNote(0, "My Note");

			// Test: update of SalesOrder note -> error, restart after note corrected
			When.onTheMainPage.changeNoteInSalesOrders(0, "RAISE_ERROR");
			When.onTheMessagePopover.close();
			When.onTheMainPage.changeNoteInSalesOrders(0, "My patched Note");
			Then.onTheMainPage.checkNote(0, "My patched Note");
			aExpectedLogs.push(oExpectedPatchLog0);
			if (sGroupId.includes("irect")) { // Note: better check group submit mode, but how?
				//TODO avoid duplicate reporting in case PATCH is not retried
				aExpectedLogs.push(oExpectedPatchLog0);
			}

			When.onTheMainPage.selectFirstSalesOrder();
			if (sGroupId.includes("auto")) {
				When.onTheMainPage.pressCreateSalesOrderItemButton();
				When.onTheSuccessInfo.confirm();
				When.onTheMainPage.changeQuantityInFirstLineItem(0);
				When.onTheMessagePopover.close(); // error because invalid quantity
				When.onTheMainPage.changeNoteInFirstLineItem("patched line item Note");
				When.onTheMessagePopover.close(); // still got error because invalid quantity
				When.onTheMainPage.changeQuantityInFirstLineItem(1);
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "patched line item Note");
				aExpectedLogs.push(oExpectedPatchLog1);
				aExpectedLogs.push(oExpectedPatchLog1);
				aExpectedLogs.push(oExpectedPatchLog1);
				// get ETag before deletion
				When.onTheMainPage.pressRefreshSelectedSalesOrdersButton();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "patched line item Note");
			}

			// CleanUp: delete created SalesOrder again via given group ID
			When.onTheMainPage.deleteSelectedSalesOrderViaGroupId(sGroupId);
			Then.onTheMainPage.checkID(0);

			Then.onAnyPage.checkLog(aExpectedLogs);

			Then.iTeardownMyUIComponent();
		}
	};
});