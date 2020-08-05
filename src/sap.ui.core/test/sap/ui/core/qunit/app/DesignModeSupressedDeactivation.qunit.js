/*global QUnit */
sap.ui.define([
	"sap/ui/core/mvc/HTMLView",
	"sap/ui/commons/Button" // used in HTML view
], function(HTMLView) {
	"use strict";

	QUnit.module("Tests for sap/ui/core/Configuration: DesignMode with supressed deactivation of controller code");

	QUnit.test("Get Design Mode and Suppression of Deactivation of Controller Code", function(assert) {
		assert.expect(2);

		var designMode = sap.ui.getCore().getConfiguration().getDesignMode();
		assert.equal(designMode, true, "Design Mode is on");

		var suppressDeactivationOfControllerCode = sap.ui.getCore().getConfiguration().getSuppressDeactivationOfControllerCode();
		assert.equal(suppressDeactivationOfControllerCode, true, "Suppression of Deactivation of Controller Code is on");

	});

	QUnit.test("Create an HTMLView instance and check controller methods are not replaced by empty ones", function(assert){
		assert.expect(6);
		return HTMLView.create({
			viewName: "example.designmode.test01"
		}).then(function(oView) {
			var oController = oView.getController();

			//check lifecycle hooks
			assert.equal(oController.onInit(), "aString", "Controller method has a return, i.e. method implementation was not replaced");
			assert.equal(oController.onExit(), "aString", "Controller method has a return, i.e. method implementation was not replaced");
			assert.equal(oController.onBeforeRendering(), "aString", "Controller method has a return, i.e. method implementation was not replaced");
			assert.equal(oController.onAfterRendering(), "aString", "Controller method has a return, i.e. method implementation was not replaced");

			//other methods
			assert.equal(oController.method1(), "aString", "Controller method has a return, i.e. method implementation was not replaced");
			assert.equal(oController.method2(), "aString", "Controller method has a return, i.e. method implementation was not replaced");

			oView.destroy();
		});
	});

	QUnit.test("Create an HTMLView instance and check controller methods from base class(es) were not replaced", function(assert){
		assert.expect(1);

		return HTMLView.create({
			viewName: "example.designmode.test01"
		}).then(function(oView) {

			//assert.equal(designMode, true, "Custom Data set properly");
			var oController = oView.getController();

			//as example, try "byId"
			var oButton = oController.byId("Button01");
			assert.notEqual(typeof oButton, "undefined", "Tested method byId");
		});
	});

});