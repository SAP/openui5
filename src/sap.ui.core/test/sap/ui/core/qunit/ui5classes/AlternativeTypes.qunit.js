/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/model/json/JSONModel",
	"sap/ui/testlib/TestButton"
], function (createAndAppendDiv, JSONModel, TestButton) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("target");

	var oModel = new JSONModel({
		teamMembers: [
			{ firstName: "Andreas", lastName: "Klark" },
			{ firstName: "Peter", lastName: "Miller" },
			{ firstName: "Gina", lastName: "Rush" },
			{ firstName: "Steave", lastName: "Ander" },
			{ firstName: "Michael", lastName: "Spring" },
			{ firstName: "Marc", lastName: "Green" },
			{ firstName: "Frank", lastName: "Wallace" }
		]
	});

	QUnit.test("clone", function (assert) {
		var oButton = new TestButton({
			text: "a text text",
			tooltip: "a tooltip text"
		});
		var oDolly = oButton.clone("some");
		assert.ok(oDolly instanceof TestButton, "clone must return an element");
		assert.equal(oDolly.getText(), oButton.getText(), "property text must have equal values");
		assert.equal(oDolly.getTooltip(), oButton.getTooltip(), "property tooltip must have equal values");
	});

	QUnit.test("bind property via settings", function (assert) {
		var oButton = new TestButton({
			text: "{firstName}",
			tooltip: "{lastName}"
		});
		oButton.setModel(oModel);
		oButton.bindElement("/teamMembers/0");
		oButton.placeAt("target");
		assert.equal(oButton.getText(), "Andreas", "binding of text");
		assert.equal(oButton.getTooltip(), "Klark", "binding of tooltip");
		oButton.destroy();
	});

	QUnit.test("bind property via bind...", function (assert) {
		var oButton = new TestButton({
		});
		oButton.setModel(oModel);
		oButton.bindElement("/teamMembers/0");
		oButton.bindProperty("text", "firstName");
		oButton.bindProperty("tooltip", "lastName");
		oButton.placeAt("target");
		assert.equal(oButton.getText(), "Andreas", "binding of text");
		assert.equal(oButton.getTooltip(), "Klark", "binding of tooltip");
		oButton.destroy();
	});
});