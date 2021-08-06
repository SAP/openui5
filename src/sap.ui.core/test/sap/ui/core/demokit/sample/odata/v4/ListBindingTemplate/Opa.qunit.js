/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.ListBindingTemplate");

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
