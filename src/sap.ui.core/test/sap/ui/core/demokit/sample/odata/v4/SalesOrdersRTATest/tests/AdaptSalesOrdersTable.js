/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Opa5, TestUtils) {
	"use strict";

	return {
		AdaptSalesOrdersTable : function (Given, When, Then, sUIComponent) {
			if (!TestUtils.isRealOData()) {
				Opa5.assert.ok(true, "Test runs only with real OData");
				return;
			}

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrdersRTA"
				}
			});

		// SalesOrdersTable
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUISalesOrdersTable/);

			Then.onAdaptUIDialog.checkCheckBoxIsSelected("SalesOrderID", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("CompanyName", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("GrossAmount", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("CurrencyCode", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("Note", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("LifecycleStatusDesc", true);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("ChangedAt", true);


			// uncheck SalesOrderID
			When.onAdaptUIDialog.checkCheckBox("SalesOrderID");

			// check LifecycleStatus
			When.onAdaptUIDialog.checkCheckBox("LifecycleStatus");

			When.onAdaptUIDialog.applyDialog();
			Then.onTheMainPageRTA.checkNewColumnAppears("SalesOrders", "N", 7);

			// unheck LifecycleStatus
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUISalesOrdersTable/);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("LifecycleStatus", true);
			When.onAdaptUIDialog.checkCheckBox("LifecycleStatus");

			When.onAdaptUIDialog.applyDialog();

		// SalesOrderDetails
			When.onTheMainPage.selectSalesOrder(1);
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUISalesOrdersDetails/);

			// uncheck SalesOrderID
			When.onAdaptUIDialog.checkCheckBox("SalesOrderID");

			// check LifecycleStatus
			When.onAdaptUIDialog.checkCheckBox("LifecycleStatus");

			When.onAdaptUIDialog.applyDialog();
			Then.onTheMainPageRTA.checkNewPropertyAppears(/RTA_LifecycleStatus1/);

			// uncheck LifecycleStatus
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUISalesOrdersDetails/);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("LifecycleStatus", true);
			When.onAdaptUIDialog.checkCheckBox("LifecycleStatus");

			When.onAdaptUIDialog.applyDialog();

		// BusinessPartner
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUIBusinessPartner/);

			// uncheck BusinessPartnerID
			When.onAdaptUIDialog.checkCheckBox("BusinessPartnerID");

			// check BusinessPartnerRole
			When.onAdaptUIDialog.checkCheckBox("BusinessPartnerRole");

			When.onAdaptUIDialog.applyDialog();
			Then.onTheMainPageRTA.checkNewPropertyAppears(/RTA_BusinessPartnerRole2/);


			// unheck BusinessPartnerRole
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUIBusinessPartner/);
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("BusinessPartnerRole", true);
			When.onAdaptUIDialog.checkCheckBox("BusinessPartnerRole");
			When.onAdaptUIDialog.applyDialog();

		// SalesOrdersLineItem
			When.onTheMainPageRTA.pressAdaptUIButton(/AdaptUISalesOrderLineItems/);
			// uncheck SalesOrderID
			When.onAdaptUIDialog.checkCheckBox("ProductID");
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("ProductID", false);

			// check NoteLanguage
			When.onAdaptUIDialog.checkCheckBox("NoteLanguage");
			Then.onAdaptUIDialog.checkCheckBoxIsSelected("NoteLanguage", true);
			When.onAdaptUIDialog.applyDialog();

			Then.onTheMainPageRTA.checkNewColumnAppears("SalesOrderLineItems", "E", 12);

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		}
	};
});