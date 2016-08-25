/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/Device"
], function (jQuery, Opa5, opaTest, Press, BindingPath, Interactable, Properties, Device) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create");

	//*****************************************************************************
	opaTest("Create, modify and delete - all transient", function (Given, When, Then) {
		var vRealOData = jQuery.sap.getUriParameters().get("realOData"),
			bRealOData = /direct|proxy|true/.test(vRealOData),
			sModifiedNote = "Modified by OPA";

		Given.iStartMyAppInAFrame("../../../common/index.html?component=odata.v4.SalesOrders"
				+ "&sap-language=en"
				+ (bRealOData ? "&sap-server=test" : "")
				+ "&realOData=" + encodeURIComponent(vRealOData)
				// TestUtils.js does not support deletion via $batch
				+ ((!bRealOData) ? "&$direct=true" : ""));

		// Create, modify and delete of an unsaved sales order
		When.onTheMainPage.firstSalesOrderIsVisible();
		When.onTheMainPage.pressCreateSalesOrdersButton();
		Then.onTheCreateNewSalesOrderDialog.checkNewBuyerId("0100000000");
		Then.onTheCreateNewSalesOrderDialog.checkNewNote();
		Then.onTheMainPage.checkNote(0);

		When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote);
		Then.onTheCreateNewSalesOrderDialog.checkNewNote(sModifiedNote);
		Then.onTheMainPage.checkNote(0, sModifiedNote);

		When.onTheCreateNewSalesOrderDialog.confirmDialog();
		Then.onTheMainPage.checkID(0, "");
		When.onTheMainPage.selectSalesOrderWithId("");

		When.onTheMainPage.changeNote(0, sModifiedNote + "_2");
		Then.onTheMainPage.checkNote(0, sModifiedNote + "_2");

		When.onTheMainPage.deleteSelectedSalesOrder();
		When.onTheSalesOrderDeletionConfirmation.cancel();
		Then.onTheMainPage.checkID(0, "");

		When.onTheMainPage.deleteSelectedSalesOrder();
		When.onTheSalesOrderDeletionConfirmation.confirm();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkID(0);

		// Create a sales order, save, modify again, save and delete
		When.onTheMainPage.pressCreateSalesOrdersButton();
		When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote + "_save");
		When.onTheCreateNewSalesOrderDialog.confirmDialog();
		Then.onTheMainPage.checkID(0, "");
		When.onTheMainPage.pressSaveSalesOrdersButton();
		When.onTheSuccessInfo.confirm();
		if (bRealOData) {
			// TODO: TestUtils may support to provide JSON response/or generated keys...
			Then.onTheMainPage.checkDifferentID(0, "");
			// TODO: TestUtils does not support PATCH at all
			When.onTheMainPage.changeNote(0, sModifiedNote + "_3");
			When.onTheMainPage.pressSaveSalesOrdersButton();
		}
		When.onTheMainPage.deleteSelectedSalesOrder();
		When.onTheSalesOrderDeletionConfirmation.confirm();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkID(0);

		// Create a sales order, save and refresh
		When.onTheMainPage.pressCreateSalesOrdersButton();
		When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote + "_save");
		When.onTheCreateNewSalesOrderDialog.confirmDialog();
		Then.onTheMainPage.checkID(0, "");
		//persist new created sales order
		When.onTheMainPage.pressSaveSalesOrdersButton();
		When.onTheSuccessInfo.confirm();
		When.onTheMainPage.pressRefreshSalesOrdersButton();
		// in the list we got again the first entity
		Then.onTheMainPage.checkID(0);

		// Check for console errors and warnings
		Then.onTheMainPage.checkLog();

		// TODO: ensure that at the all created sales orders are deleted again (currently the last
		// create after the refresh remains)

		Then.iTeardownMyAppFrame();
	});
});
