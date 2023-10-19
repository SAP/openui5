/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/LateProperties/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/LateProperties/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.LateProperties");

		//*****************************************************************************
		opaTest("Start late properties app, check UI, check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.LateProperties"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

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
		});

		QUnit.start();
	});
});
