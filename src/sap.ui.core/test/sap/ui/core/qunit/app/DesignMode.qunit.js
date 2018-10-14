/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/mvc/HTMLView",
	"sap/ui/commons/Button" // used in HTML view
], function (XMLView, HTMLView) {
	"use strict";

	QUnit.module("sap/ui/core/Configuration: DesignMode enabled");

	QUnit.test("Get Design Mode", function (assert) {
		assert.expect(1);

		var designMode = sap.ui.getCore().getConfiguration().getDesignMode();
		assert.equal(designMode, true, "Design Mode is on");

	});

	QUnit.test("Create an HTMLView instance and check controller methods are replaced by empty ones", function (assert) {
		assert.expect(2);

		return HTMLView.create({
			viewName: "example.designmode.test01"
		}).then(function(oView) {
			var oController = oView.getController();

			assert.ok(typeof oController !== "undefined", "Controller is not undefined");
			assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");

			oView.destroy();
		});
	});

	QUnit.test("Create a XMLView instance and check controller methods are replaced by empty ones", function (assert) {
		assert.expect(2);

		return XMLView.create({
			viewName: "example.designmode.test01"
		}).then(function(oView) {
			var oController = oView.getController();

			assert.ok(typeof oController !== "undefined", "Controller is not undefined");
			assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");

			oView.destroy();
		});

	});

});