/*global QUnit */
sap.ui.define([
	"sap/ui/base/DesignTime",
	"sap/ui/core/mvc/XMLView"
], function (DesignTime, XMLView) {
	"use strict";

	QUnit.module("DesignMode, Suppressed Deactivation of Controller Code");

	QUnit.test("Configuration Accessors", function (assert) {
		assert.expect(3);

		assert.equal(DesignTime.isDesignModeEnabled(), true, "Design Mode is on");
		assert.equal(DesignTime.isControllerCodeDeactivationSuppressed(), true, "SuppressDeactivationOfControllerCode is true");
		assert.equal(DesignTime.isControllerCodeDeactivated(), false, "isControllerCodeDeactivated is false");
	});

	QUnit.test("Create an XMLView instance and check controller methods are not replaced by empty ones", function (assert) {
		assert.expect(6);
		return XMLView.create({
			viewName: "test.designmode.test01"
		}).then(function (oView) {
			var oController = oView.getController();

			//check lifecycle hooks
			oController.onInit();
			assert.equal(oController._onInitCalled, true, "Controller method implementation was not replaced");
			oController.onExit();
			assert.equal(oController._onExitCalled, true, "Controller method implementation was not replaced");
			oController.onBeforeRendering();
			assert.equal(oController._onBeforeRenderingCalled, true, "Controller method implementation was not replaced");
			oController.onAfterRendering();
			assert.equal(oController._onAfterRenderingCalled, true, "Controller method implementation was not replaced");

			//other methods
			assert.equal(oController.method1(), "aString", "Controller method has a return, i.e. method implementation was not replaced");
			assert.equal(oController.method2(), "aString", "Controller method has a return, i.e. method implementation was not replaced");

			oView.destroy();
		});
	});

	QUnit.test("Create an XMLView instance and check controller methods from base class(es) were not replaced", function (assert) {
		assert.expect(1);

		return XMLView.create({
			viewName: "test.designmode.test01"
		}).then(function (oView) {

			//assert.equal(designMode, true, "Custom Data set properly");
			var oController = oView.getController();

			//as example, try "byId"
			var oButton = oController.byId("Button01");
			assert.notEqual(typeof oButton, "undefined", "Tested method byId");
		});
	});

});