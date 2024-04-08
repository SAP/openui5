/* global QUnit */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4"
], function(
	_omit,
	Log,
	Component,
	URLHandler,
	ControlVariantApplyAPI,
	VariantManagement,
	VariantModel,
	Layer,
	Utils,
	hasher,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function stubTechnicalParameterValues(aUrlTechnicalParameters) {
		sandbox.stub(this.oModel, "getLocalId").withArgs(this.oDummyControl.getId(), this.oAppComponent).returns("variantMgmtId1");
		sandbox.spy(URLHandler, "update");
		sandbox.stub(this.oModel, "getVariant").withArgs("variant1", "variantMgmtId1").returns({simulate: "foundVariant"});
		sandbox.stub(hasher, "replaceHash");
		this.fnParseShellHashStub = sandbox.stub().callsFake(function() {
			if (!this.bCalled) {
				var oReturnObject = {
					params: {}
				};
				oReturnObject.params[URLHandler.variantTechnicalParameterName] = aUrlTechnicalParameters;
				this.bCalled = true;
				return oReturnObject;
			}
			return {};
		}.bind(this));
		sandbox.stub(this.oModel, "getUShellService").callsFake(function(sServiceName) {
			switch (sServiceName) {
				case "URLParsing":
					return {
						parseShellHash: this.fnParseShellHashStub,
						constructShellHash() {return "constructedHash";}
					};
				case "ShellNavigationInternal":
					return {registerNavigationFilter() {}, unregisterNavigationFilter() {}};
				case "Navigation":
					return {navigate() {}};
				default:
					return undefined;
			}
		}.bind(this));
	}

	function stubUpdateCurrentVariant() {
		sandbox.stub(this.oModel, "updateCurrentVariant").resolves();
	}

	function checkUpdateCurrentVariantCalled(assert, sVariantManagement, sVariant) {
		assert.ok(this.oModel.updateCurrentVariant.calledOnce, "then variantModel.updateCurrentVariant called once");
		assert.ok(this.oModel.updateCurrentVariant.calledWithExactly({
			variantManagementReference: sVariantManagement,
			newVariantReference: sVariant,
			appComponent: this.oAppComponent
		}), "then variantModel.updateCurrentVariant called to activate the target variant");
	}

	function checkActivateVariantErrorResponse(assert, sExpectedError, sReceivedError) {
		assert.equal(sReceivedError, sExpectedError, "then Promise.reject() with the appropriate error message returned");
		assert.equal(this.oModel.updateCurrentVariant.callCount, 0, "then variantModel.updateCurrentVariant not called");
	}

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
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

			this.oDummyControl = new VariantManagement("dummyControl");

			this.oAppComponent = new Component("AppComponent");
			this.oModel = new VariantModel(this.oData, {
				flexController: {},
				appComponent: this.oAppComponent
			});
			return this.oModel.initialize()
			.then(function() {
				this.oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				this.oComponent = new Component("EmbeddedComponent");
				sandbox.stub(this.oModel, "waitForVMControlInit").resolves();
				sandbox.stub(Utils, "getAppComponentForControl")
				.callThrough()
				.withArgs(this.oDummyControl).returns(this.oAppComponent)
				.withArgs(this.oComponent).returns(this.oAppComponent);
			}.bind(this));
		},
		afterEach() {
			sandbox.restore();
			this.oModel.destroy();
			this.oAppComponent.destroy();
			this.oComponent.destroy();
			this.oDummyControl.destroy();
		}
	}, function() {
		QUnit.test("when calling 'clearVariantParameterInURL' with a control as parameter", function(assert) {
			var aUrlTechnicalParameters = ["fakevariant", "variant1"];
			stubTechnicalParameterValues.call(this, aUrlTechnicalParameters);

			ControlVariantApplyAPI.clearVariantParameterInURL({control: this.oDummyControl});

			assert.ok(this.fnParseShellHashStub.calledTwice, "then variant parameter values were requested; once for read and write each");
			assert.deepEqual(_omit(URLHandler.update.getCall(0).args[0], "model"), {
				parameters: [aUrlTechnicalParameters[0]],
				updateURL: true,
				updateHashEntry: true,
				silent: false
			}, "then URLHandler.update called with the desired arguments");
		});

		QUnit.test("when calling 'clearVariantParameterInURL' without a VariantModel available", function(assert) {
			sandbox.stub(Log, "error");
			sandbox.stub(this.oAppComponent, "getModel").returns(undefined);
			sandbox.spy(URLHandler, "update");
			ControlVariantApplyAPI.clearVariantParameterInURL({control: this.oDummyControl});
			assert.strictEqual(URLHandler.update.callCount, 0, "the URLHandler was not called");
			assert.strictEqual(Log.error.lastCall.args[0], "Variant model could not be found on the provided control", "an error was logged");
		});

		QUnit.test("when calling 'activateVariant' with a control id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "dummyControl",
				variantReference: "variant1"
			})
			.then(function() {
				assert.equal(this.oModel.waitForVMControlInit.callCount, 1, "the function waits for the control");
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent.getId(),
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a component", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variant1"
			})
			.then(function() {
				checkUpdateCurrentVariantCalled.call(this, assert, "variantMgmtId1", "variant1");
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid variant reference", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: this.oComponent,
				variantReference: "variantInvalid"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(this, assert, "A valid control or component, and a valid variant/ID combination are required", oError.message);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a random object", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: {},
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(this, assert, "A valid variant management control or component (instance or ID) should be passed as parameter", oError.message);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with an invalid id", function(assert) {
			stubUpdateCurrentVariant.call(this);

			return ControlVariantApplyAPI.activateVariant({
				element: "invalidId",
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(this, assert, "No valid component or control found for the provided ID", oError.message);
			}.bind(this));
		});

		QUnit.test("when calling 'activateVariant' with a control with an invalid variantModel", function(assert) {
			stubUpdateCurrentVariant.call(this);
			this.oAppComponent.setModel(null, ControlVariantApplyAPI.getVariantModelName());

			return ControlVariantApplyAPI.activateVariant({
				element: this.oDummyControl,
				variantReference: "variant1"
			})
			.then(function() {
				assert.ok(false, "should not resolve");
			})
			.catch(function(oError) {
				checkActivateVariantErrorResponse.call(this, assert, "No variant management model found for the passed control or application component", oError.message);
			}.bind(this));
		});

		QUnit.test("when calling 'attachVariantApplied' when the model is already set on the app component", function(assert) {
			var fnDone = assert.async();
			var oCallbackStub = sinon.stub();
			var oModelAttachStub = sandbox.stub(this.oModel, "attachVariantApplied").callsFake(function() {
				var mExpectedPropertyBag = {
					vmControlId: "vmcontrolId",
					control: this.oAppComponent,
					callback: oCallbackStub,
					callAfterInitialVariant: true
				};
				var mPropertyBag = oModelAttachStub.lastCall.args[0];
				assert.equal(oModelAttachStub.callCount, 1, "the model was called");
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "the function is called with the correct properties");
				fnDone();
			});
			ControlVariantApplyAPI.attachVariantApplied({
				selector: this.oAppComponent,
				vmControlId: "vmcontrolId",
				callback: oCallbackStub,
				callAfterInitialVariant: true
			});
		});

		QUnit.test("when calling 'attachVariantApplied' when the model is still not set on the component", function(assert) {
			var fnDone = assert.async();
			var oCallbackStub = sinon.stub();
			this.oAppComponent.setModel(undefined, ControlVariantApplyAPI.getVariantModelName());
			var oModelAttachStub = sandbox.stub(this.oModel, "attachVariantApplied").callsFake(function() {
				var mExpectedPropertyBag = {
					vmControlId: "vmcontrolId",
					control: this.oAppComponent,
					callback: oCallbackStub,
					callAfterInitialVariant: true
				};
				var mPropertyBag = oModelAttachStub.lastCall.args[0];
				assert.equal(oModelAttachStub.callCount, 1, "the model was called");
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "the function is called with the correct properties");
				fnDone();
			});
			ControlVariantApplyAPI.attachVariantApplied({
				selector: this.oAppComponent,
				vmControlId: "vmcontrolId",
				callback: oCallbackStub,
				callAfterInitialVariant: true
			});
			this.oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
		});

		QUnit.test("when calling 'detachVariantApplied' when the model is already set on the app component", function(assert) {
			var fnDone = assert.async();
			var oModelDetachStub = sandbox.stub(this.oModel, "detachVariantApplied").callsFake(function() {
				var aArguments = oModelDetachStub.lastCall.args;
				assert.equal(oModelDetachStub.callCount, 1, "the model was called");
				assert.equal(aArguments[0], "vmcontrolId", "the function is called with the correct properties");
				assert.equal(aArguments[1], this.oAppComponent.getId(), "the function is called with the correct properties");
				fnDone();
			});
			ControlVariantApplyAPI.detachVariantApplied({
				selector: this.oAppComponent,
				vmControlId: "vmcontrolId"
			});
		});

		QUnit.test("when calling 'detachVariantApplied' when the model is still not set on the app component", function(assert) {
			var fnDone = assert.async();
			this.oAppComponent.setModel(undefined, ControlVariantApplyAPI.getVariantModelName());
			var oModelDetachStub = sandbox.stub(this.oModel, "detachVariantApplied").callsFake(function() {
				var aArguments = oModelDetachStub.lastCall.args;
				assert.equal(oModelDetachStub.callCount, 1, "the model was called");
				assert.equal(aArguments[0], "vmcontrolId", "the function is called with the correct properties");
				assert.equal(aArguments[1], this.oAppComponent.getId(), "the function is called with the correct properties");
				fnDone();
			});
			ControlVariantApplyAPI.detachVariantApplied({
				selector: this.oAppComponent,
				vmControlId: "vmcontrolId"
			});
			this.oAppComponent.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
