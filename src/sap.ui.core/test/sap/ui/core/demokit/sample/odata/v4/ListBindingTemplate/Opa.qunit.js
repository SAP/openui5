/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/ListBindingTemplate/SandboxModel" // preload only
], function (Helper, Any, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.ListBindingTemplate");

	//*****************************************************************************
	opaTest("Start list binding template app and check log", function (Given, When, Then) {
		When.onAnyPage.applySupportAssistant();
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.ListBindingTemplate"
			}
		});

		Then.onAnyPage.checkLog();
		Then.onAnyPage.analyzeSupportAssistant();
		Then.iTeardownMyUIComponent();
	});
});
