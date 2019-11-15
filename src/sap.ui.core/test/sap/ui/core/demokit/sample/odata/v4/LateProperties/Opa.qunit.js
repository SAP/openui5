/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/LateProperties/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Any, Main, opaTest, TestUtils) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		function checkThatControlsInEditDeliveryDialogAreNotEmpty(Then) {
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("SalesOrderID");
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("Note");
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("CompanyName");
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("WebAddress");
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("ItemKey");
			Then.onTheEditDeliveryDialog.checkNonEmptyContent("DeliveryDate", true);
		}

		QUnit.module("sap.ui.core.sample.odata.v4.LateProperties", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		opaTest("Start late properties app, check UI, check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.LateProperties"
				}
			});

			When.onTheMainPage.selectSalesOrder(2);
			When.onTheMainPage.pressEditDelivery(1);
			checkThatControlsInEditDeliveryDialogAreNotEmpty(Then);
			When.onTheEditDeliveryDialog.pressCancel();
			When.onTheMainPage.pressEditDelivery(3);
			When.onTheEditDeliveryDialog.pressCancel();

			When.onTheMainPage.selectSalesOrder(3);
			When.onTheMainPage.pressEditDelivery(1);
			When.onTheEditDeliveryDialog.pressCancel();
			When.onTheMainPage.pressEditDelivery(3);
			checkThatControlsInEditDeliveryDialogAreNotEmpty(Then);
			When.onTheEditDeliveryDialog.changeDeliveryDate();
			When.onTheEditDeliveryDialog.pressConfirm();

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
