/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/core/Component",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4"
], function(
	VariantModel,
	VariantManagement,
	URLHandler,
	Utils,
	Layer,
	ControlVariantApplyAPI,
	Component,
	hasher,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var fnStubTechnicalParameterValues = function (aUrlTechnicalParameters) {
		sandbox.stub(this.oModel, "getLocalId").withArgs(this.oDummyControl.getId(), this.oAppComponent).returns("variantMgmtId1");
		sandbox.spy(URLHandler, "update");
		sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variant1").returns(true);
		sandbox.stub(hasher, "replaceHash");
		sandbox.stub(Utils, "getUshellContainer").returns({
			getService: function(sServiceName) {
				switch (sServiceName) {
					case "URLParsing":
						return {parseShellHash: function () {}, constructShellHash: function() {return "constructedHash";}};
					case "ShellNavigation":
						return {registerNavigationFilter: function() {}, unregisterNavigationFilter: function() {}};
					case "CrossApplicationNavigation":
						return {toExternal: function() {}};
				}
			}
		});
		var oReturnObject = {
			params: {}
		};
		oReturnObject.params[URLHandler.variantTechnicalParameterName] = aUrlTechnicalParameters;
		sandbox.stub(Utils, "getParsedURLHash").returns(oReturnObject);
	};

	var fnStubUpdateCurrentVariant = function () {
		sandbox.stub(this.oModel, "updateCurrentVariant").returns(Promise.resolve());
	};

	var fnCheckUpdateCurrentVariantCalled = function (assert, sVariantManagement, sVariant) {
		assert.ok(this.oModel.updateCurrentVariant.calledOnce, "then variantModel.updateCurrentVariant called once");
		assert.ok(this.oModel.updateCurrentVariant.calledWithExactly(sVariantManagement, sVariant, this.oAppComponent), "then variantModel.updateCurrentVariant called to activate the target variant");
	};

	var fnCheckActivateVariantErrorResponse = function (assert, sExpectedError, sReceivedError) {
		assert.equal(sReceivedError, sExpectedError, "then Promise.reject() with the appropriate error message returned");
		assert.equal(this.oModel.updateCurrentVariant.callCount, 0, "then variantModel.updateCurrentVariant not called");
	};

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function() {
			this.oData = {
				variantMgmtId1: {
					defaultVariant: "variantMgmtId1",
					originalDefaultVariant: "variantMgmtId1",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true
						},
						{
							author: "Me",
							key: "variant1",
							layer: Layer.CUSTOMER,
							title: "variant B",
							favorite: false,
							visible: true
						}
					]
				}
			};

			var oMockFlexController = {
				_oChangePersistence: {
					_oVariantController: {
						getVariant: function () {},
						assignResetMapListener: function() {}
					}
				}
			};

			this.oDummyControl = new VariantManagement("dummyControl");

			this.oAppComponent = new Component("AppComponent");
			this.oModel = new VariantModel(this.oData, oMockFlexController, this.oAppComponent);
			this.oAppComponent.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			this.oComponent = new Component("EmbeddedComponent");
			sandbox.stub(Utils, "getAppComponentForControl")
				.callThrough()
				.withArgs(this.oDummyControl).returns(this.oAppComponent)
				.withArgs(this.oComponent).returns(this.oAppComponent);
		},
		afterEach: function() {
			sandbox.restore();
			this.oModel.destroy();
			this.oAppComponent.destroy();
			this.oComponent.destroy();
			this.oDummyControl.destroy();
		}
	}, function() {
		QUnit.test("when calling 'clearVariantParameterInURL' with a control as parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			fnStubTechnicalParameterValues.call(this, aUrlTechnicalParameters);

			ControlVariantApplyAPI.clearVariantParameterInURL({control: this.oDummyControl});

			assert.ok(Utils.getParsedURLHash.calledTwice, "then variant parameter values were requested; once for read and write each");
			assert.deepEqual(URLHandler.update.getCall(0).args[0], {
				parameters: [aUrlTechnicalParameters[0]],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel,
				silent: false
			}, "then URLHandler.update called with the desired arguments");
		});

		QUnit.test("when calling 'clearVariantParameterInURL' without a parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			fnStubTechnicalParameterValues.call(this, aUrlTechnicalParameters);
			ControlVariantApplyAPI.clearVariantParameterInURL({});

			assert.ok(Utils.getParsedURLHash.calledOnce, "then variant parameter values are requested once for writing new parameters");
			assert.ok(URLHandler.update.calledWithExactly({
				updateURL: true,
				updateHashEntry: false,
				model: sinon.match.object,
				parameters: [],
				silent: true
			}), "then all variant URL parameter values are cleared");
			assert.ok(hasher.replaceHash.calledWith("constructedHash"), "then constructed hash passed to hasher");
		});

		QUnit.test("when calling 'activateVariant' with a control id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "dummyControl",
				variantReference: "variant1"
			})
			.then(function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent.getId(),
				variantReference: "variant1"
			})
			.then(function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variant1"
			})
			.then(function () {
				fnCheckUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid variant reference", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variantInvalid"
			})
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "A valid control or component, and a valid variant/ID combination are required", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with a random object", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: {},
				variantReference: "variant1"
			})
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "A valid variant management control or component (instance or ID) should be passed as parameter", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with an invalid id", function(assert) {
			fnStubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "invalidId",
				variantReference: "variant1"
			})
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "No valid component or control found for the provided ID", oError.message);
				}.bind(this)
			);
		});

		QUnit.test("when calling 'activateVariant' with a control with an invalid variantModel", function(assert) {
			fnStubUpdateCurrentVariant.call(this);
			this.oAppComponent.setModel(null, Utils.VARIANT_MODEL_NAME);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function() {},
				function (oError) {
					fnCheckActivateVariantErrorResponse.call(this, assert, "No variant management model found for the passed control or application component", oError.message);
				}.bind(this)
			);
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
