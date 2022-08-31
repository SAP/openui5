/*global QUnit */
sap.ui.define([
	"sap/ui/core/Configuration"
], function (Configuration) {
	"use strict";

	return function _createDesignModeTests(ViewClass) {
		QUnit.module("DesignMode, Controller Deactivation", {
			beforeEach: function() {
				this.stub(Configuration.prototype, "getDesignMode").returns(true);
				this.stub(Configuration.prototype, "getSuppressDeactivationOfControllerCode").returns(false);
			}
		});

		QUnit.test("Configuration Accessors", function (assert) {
			assert.expect(3);

			var oConfig = Configuration;
			assert.equal(oConfig.getDesignMode(), true, "Design Mode is on");
			assert.equal(oConfig.getSuppressDeactivationOfControllerCode(), false, "SuppressDeactivationOfControllerCode is false");
			assert.equal(oConfig.getControllerCodeDeactivated(), true, "getControllerCodeDeactivated is true");
		});

		QUnit.test("Create a XMLView instance and check controller methods are replaced by empty ones", function (assert) {
			assert.expect(2);

			return ViewClass.create({
				viewName: "test.designmode.test01"
			}).then(function(oView) {
				var oController = oView.getController();

				assert.ok(typeof oController !== "undefined", "Controller is not undefined");
				assert.ok(oController["_sap.ui.core.mvc.EmptyControllerImpl"], "Controller is an empty Controller");

				oView.destroy();
			});
		});



		QUnit.module("DesignMode, Suppressed Deactivation of Controller Code", {
			beforeEach: function() {
				this.stub(Configuration.prototype, "getDesignMode").returns(true);
				this.stub(Configuration.prototype, "getSuppressDeactivationOfControllerCode").returns(true);
			}
		});

		QUnit.test("Configuration Accessors", function (assert) {
			assert.expect(3);

			var oConfig = Configuration;
			assert.equal(oConfig.getDesignMode(), true, "Design Mode is on");
			assert.equal(oConfig.getSuppressDeactivationOfControllerCode(), true, "SuppressDeactivationOfControllerCode is true");
			assert.equal(oConfig.getControllerCodeDeactivated(), false, "getControllerCodeDeactivated is false");
		});

		QUnit.test("Create an XMLView instance and check controller methods are not replaced by empty ones", function(assert){
			assert.expect(6);
			return ViewClass.create({
				viewName: "test.designmode.test01"
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

		QUnit.test("Create an XMLView instance and check controller methods from base class(es) were not replaced", function(assert){
			assert.expect(1);

			return ViewClass.create({
				viewName: "test.designmode.test01"
			}).then(function(oView) {

				//assert.equal(designMode, true, "Custom Data set properly");
				var oController = oView.getController();

				//as example, try "byId"
				var oButton = oController.byId("Button01");
				assert.notEqual(typeof oButton, "undefined", "Tested method byId");
			});
		});
	};

});