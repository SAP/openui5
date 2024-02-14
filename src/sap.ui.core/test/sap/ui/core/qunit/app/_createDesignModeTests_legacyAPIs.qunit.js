/*global QUnit sinon*/
sap.ui.define([
	"sap/base/config",
	"sap/ui/base/DesignTime"
], function (BaseConfiguration, DesignTime) {
	"use strict";

	return function _createDesignModeTests(ViewClass) {
		var oBaseConfigStub, createBaseConfigStub = function (bDesignMode, bSuppressDeactivationOfControllerCode) {
			oBaseConfigStub = sinon.stub(BaseConfiguration, "get");
			oBaseConfigStub.callsFake(function(mParameters) {
				switch (mParameters.name) {
					case "sapUiXxDesignMode":
						return bDesignMode;
					case "sapUiXxSuppressDeactivationOfControllerCode":
						return bSuppressDeactivationOfControllerCode;
					default:
						return oBaseConfigStub.wrappedMethod.call(this, mParameters);
				}
			});
		};
		QUnit.module("DesignMode, Controller Deactivation", {
			beforeEach: function() {
				createBaseConfigStub(true, false);
			},
			afterEach: function() {
				oBaseConfigStub.restore();
			}
		});

		QUnit.test("Configuration Accessors", function (assert) {
			assert.expect(3);

			assert.equal(DesignTime.isDesignModeEnabled(), true, "Design Mode is on");
			assert.equal(DesignTime.isControllerCodeDeactivationSuppressed(), false, "SuppressDeactivationOfControllerCode is false");
			assert.equal(DesignTime.isControllerCodeDeactivated(), true, "isControllerCodeDeactivated is true");
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
				createBaseConfigStub(true, true);
			},
			afterEach: function() {
				oBaseConfigStub.restore();
			}
		});

		QUnit.test("Configuration Accessors", function (assert) {
			assert.expect(3);

			assert.equal(DesignTime.isDesignModeEnabled(), true, "Design Mode is on");
			assert.equal(DesignTime.isControllerCodeDeactivationSuppressed(), true, "SuppressDeactivationOfControllerCode is true");
			assert.equal(DesignTime.isControllerCodeDeactivated(), false, "isControllerCodeDeactivated is false");
		});

		QUnit.test("Create an XMLView instance and check controller methods are not replaced by empty ones", function(assert){
			assert.expect(6);
			return ViewClass.create({
				viewName: "test.designmode.test01"
			}).then(function(oView) {
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