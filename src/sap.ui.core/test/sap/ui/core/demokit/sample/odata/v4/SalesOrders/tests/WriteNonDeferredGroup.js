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
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically"
				}],
				oExpectedPatchLog1 = {
					component : "sap.ui.model.odata.v4.Context",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList"
//					details : "Error occurred while processing the request"
				};

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});

			TestUtils.setData("sap.ui.core.sample.odata.v4.SalesOrders.updateGroupId", sGroupId);

			When.onTheMainPage.firstSalesOrderIsVisible();
			if (TestUtils.isRealOData()) {
				// Test: create a new SalesOrder with erroneous Note property,
				// POST restarted automatically after note corrected
				When.onTheMainPage.createInvalidSalesOrderViaAPI();
				When.onTheMessagePopover.close();
				When.onTheMainPage.changeNoteInSalesOrders(0, "My Note");
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkNote(0, "My Note");

				// Test: update of SalesOrder note -> error, restart after note corrected
				When.onTheMainPage.changeNoteInSalesOrders(0, "RAISE_ERROR");
				When.onTheMessagePopover.selectMessage(
					"Property `Note` value `RAISE_ERROR` not allowed!");
				Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
					originalMessage : {
						code : "OO/000",
						message : "Property `Note` value `RAISE_ERROR` not allowed!"
					}
				});
				When.onTheMessagePopover.close();
				When.onTheMainPage.changeNoteInSalesOrders(0, "My patched Note");
				Then.onTheMainPage.checkNote(0, "My patched Note");
				aExpectedLogs.push({
					component : "sap.ui.model.odata.v4.Context",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				});
				if (sGroupId.includes("irect")) { // Note: better check group submit mode, but how?
					//TODO avoid duplicate reporting in case PATCH is not retried
					aExpectedLogs.push({
						component : "sap.ui.model.odata.v4.ODataPropertyBinding",
						level : Log.Level.ERROR,
						message: "Failed to update path /SalesOrderList",
						details : "Property `Note` value `RAISE_ERROR` not allowed!"
					});
				}

				When.onTheMainPage.selectFirstSalesOrder();
				if (sGroupId.includes("auto")) {
					When.onTheMainPage.pressCreateSalesOrderItemButton();
					When.onTheSuccessInfo.confirm();
					When.onTheMainPage.changeQuantityInLineItem(0, 0);
					When.onTheMessagePopover.close(); // error because invalid quantity
					When.onTheMainPage.changeNoteInLineItem(0, "patched line item Note");
					When.onTheMessagePopover.close(); // still got error because invalid quantity
					When.onTheMainPage.changeQuantityInLineItem(0, 1);
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
			} else {
				// $auto or $direct, but no save button needed
				When.onTheMainPage.changeNoteInSalesOrders(1, "204");
				When.onTheMainPage.changeNoteInSalesOrders(1, "*");
				Then.onTheMainPage.checkNote(1, "You have used the new ETag!", true);
				// reset @odata.etag
				When.onTheMainPage.pressRefreshSalesOrdersButton();
				When.onTheMainPage.changeNoteInSalesOrders(1, "ETag");
				Then.onTheMainPage.checkNote(1, "Sending ETag header...", true);
				When.onTheMainPage.changeNoteInSalesOrders(1, "*");
				Then.onTheMainPage.checkNote(1, "You have used the new ETag!", true);

				Then.onAnyPage.checkLog([]);
			}

			Then.iTeardownMyUIComponent();
		}
	};
});