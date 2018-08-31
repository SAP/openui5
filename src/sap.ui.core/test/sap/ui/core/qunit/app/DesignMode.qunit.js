/*global QUnit */
sap.ui.define([], function () {
	"use strict";

	QUnit.module("sap/ui/core/Configuration: DesignMode enabled");

	QUnit.test("Get Design Mode", function (assert) {
		assert.expect(1);

		var designMode = sap.ui.getCore().getConfiguration().getDesignMode();
		assert.equal(designMode, true, "Design Mode is on");

	});

	QUnit.test("Create an HTMLView instance and check controller methods are replaced by empty ones", function (assert) {
		assert.expect(2);

		var oView = sap.ui.htmlview("example.designmode.test01");
		var oController = oView.getController();

		assert.ok(typeof oController !== "undefined", "Controller is not undefined");
		assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");

		oView.destroy();
	});

	QUnit.test("Create a XMLView instance and check controller methods are replaced by empty ones", function (assert) {
		assert.expect(2);

		var oView = sap.ui.xmlview("example.designmode.test01");
		var oController = oView.getController();

		assert.ok(typeof oController !== "undefined", "Controller is not undefined");
		assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");

		oView.destroy();
	});

});