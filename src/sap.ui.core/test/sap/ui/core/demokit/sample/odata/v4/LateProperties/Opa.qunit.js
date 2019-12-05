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
		"sap/ui/test/opaQunit"
	], function (Any, Main, opaTest) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

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

			When.onTheMainPage.selectSalesOrderRow(2);
			When.onTheMainPage.pressEditDeliveryInRow(1);
			Then.onTheEditDeliveryDialog.checkThatControlsHaveContent();
			When.onTheEditDeliveryDialog.pressCancel();
			When.onTheMainPage.pressEditDeliveryInRow(3);
			Then.onTheEditDeliveryDialog.checkThatControlsHaveContent();
			When.onTheEditDeliveryDialog.pressCancel();

			When.onTheMainPage.selectSalesOrderRow(3);
			When.onTheMainPage.pressEditDeliveryInRow(1);
			Then.onTheEditDeliveryDialog.checkThatControlsHaveContent();
			When.onTheEditDeliveryDialog.pressCancel();
			When.onTheMainPage.pressEditDeliveryInRow(3);
			Then.onTheEditDeliveryDialog.checkThatControlsHaveContent();
			When.onTheEditDeliveryDialog.postponeDeliveryDateByOneDay();
			When.onTheEditDeliveryDialog.pressConfirm();

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
