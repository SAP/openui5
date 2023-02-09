/*global QUnit */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/core/mvc/XMLView"
], function (Configuration, XMLView) {
	"use strict";

	QUnit.module("DesignMode, Controller Deactivation");

	QUnit.test("Configuration Accessors", function (assert) {
		assert.expect(3);

		var oConfig = Configuration;
		assert.equal(oConfig.getDesignMode(), true, "Design Mode is on");
		assert.equal(oConfig.getSuppressDeactivationOfControllerCode(), false, "SuppressDeactivationOfControllerCode is false");
		assert.equal(oConfig.getControllerCodeDeactivated(), true, "getControllerCodeDeactivated is true");
	});

	QUnit.test("Create a XMLView instance and check controller methods are replaced by empty ones", function (assert) {
		assert.expect(2);

		return XMLView.create({
			viewName: "test.designmode.test01"
		}).then(function (oView) {
			var oController = oView.getController();
			assert.ok(typeof oController !== "undefined", "Controller is not undefined");
			assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");
			oView.destroy();
		});
	});

});