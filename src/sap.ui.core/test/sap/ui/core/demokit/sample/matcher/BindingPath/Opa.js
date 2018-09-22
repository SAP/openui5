/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/matchers/AggregationFilled',
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5'
], function (BindingPath, AggregationFilled, opaTest, Opa5) {
	"use strict";

	QUnit.module("Binding Path");

	Opa5.extendConfig({
		viewNamespace: "view.",
		autoWait : true
	});

	opaTest("Should match the binding path for selected item", function (Given, When, Then) {

		// Arrange
		Given.iStartMyAppInAFrame("webapp/index.html");

		// Act
		When.waitFor({
			id: "productList",
			viewName: "Main",
			matchers: new AggregationFilled({ name : "items" }),
			success: function (oList) {
				oList.setSelectedItem(oList.getItems()[0]);
			},
			errorMessage: "Could not select the first item"
		});

		// Assert
		Then.waitFor({
			controlType: "sap.m.StandardListItem",
			matchers: new BindingPath({path: "/ProductCollection/0"}),
			success: function (aItems) {
				Opa5.assert.ok(aItems[0].getSelected(),
					"The binding path for selected item was matched");
			},
			errorMessage: "The binding path for selected item was not matched"
		});

		// Tear down should always be done in real use case
		// In this sample we commented it out so you can see the result.
		// If no globals is activated,
		// IE will fail because the frame with an id will be recognized as global.
		if (QUnit.config.noglobals) {
			Then.iTeardownMyAppFrame();
		}
	});

	QUnit.start();

});
