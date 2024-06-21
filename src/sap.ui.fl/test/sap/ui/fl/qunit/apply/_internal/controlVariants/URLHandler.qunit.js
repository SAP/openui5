/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	ManagedObjectObserver,
	Component,
	URLHandler,
	ManifestUtils,
	ControlVariantApplyAPI,
	VariantManagement,
	VariantModel,
	Layer,
	hasher,
	sinon
) {
	"use strict";
	document.getElementById("qunit-fixture").style.display = "none";
	var sandbox = sinon.createSandbox();

	QUnit.module("Given an instance of VariantModel", {
		beforeEach() {
			this.oAppComponent = new Component("appComponent");
			this.oModel = {
				oAppComponent: this.oAppComponent,
				destroy: sandbox.stub().resolves(),
				getUShellService() {}
			};
			this.fnDestroyObserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			this.fnDestroyUnobserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "unobserve");
			this.oGetUShellServiceStub = sandbox.stub(this.oModel, "getUShellService");
			this.oModel._oVariantSwitchPromise = Promise.resolve();
		},
		afterEach() {
			if (this.oAppComponent instanceof Component) {
				this.oAppComponent.destroy();
			}
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when initialize() is called, followed by a getStoredHashParams() call ", function(assert) {
			assert.expect(4);
			this.oGetUShellServiceStub.returns({
				registerNavigationFilter(fnHandler) {
					assert.strictEqual(typeof fnHandler, "function", "then navigation filter was registered");
				},
				unregisterNavigationFilter() {
					assert.ok(false, "then de-registration for navigation filter should not be called");
				},
				parseShellHash() {}
			});

			sandbox.spy(URLHandler, "attachHandlers");
			var mPropertyBag = {model: this.oModel};
			URLHandler.initialize(mPropertyBag);
			var oHashRegister = {
				hashParams: [],
				controlPropertyObservers: [],
				variantControlIds: []
			};

			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy: true}); // remove component observer
			assert.ok(URLHandler.attachHandlers.calledWith(mPropertyBag), "then required handlers and observers were subscribed");
			assert.deepEqual(this.oModel._oHashData, oHashRegister, "then hash register object initialized");

			this.oModel._oHashData.hashParams = ["expectedParameter1", "expectedParameter2"];
			assert.deepEqual(
				URLHandler.getStoredHashParams({model: this.oModel}),
				["expectedParameter1", "expectedParameter2"],
				"then expected parameters are returned"
			);
		});

		QUnit.test("when registerControl is called for a variant management control's local id", function(assert) {
			var sVariantManagementReference = "sLocalControlId";
			URLHandler.initialize({model: this.oModel});
			URLHandler.registerControl({vmReference: sVariantManagementReference, updateURL: true, model: this.oModel});
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");

			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy: true}); // remove component observer
			assert.deepEqual(
				this.oModel._oHashData.variantControlIds,
				[sVariantManagementReference],
				"then the rendered control's local id added to the hash register"
			);
		});

		QUnit.test("when attachHandlers() is called", function(assert) {
			URLHandler.initialize({model: this.oModel});

			// first call
			URLHandler.attachHandlers({vmReference: "mockControlId1", updateURL: false, model: this.oModel});
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");
			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy: true}); // remove component observer

			// second call
			URLHandler.attachHandlers({vmReference: "mockControlId2", updateURL: false, model: this.oModel});
			assert.ok(this.fnDestroyObserverSpy.calledOnce, "then no new observers were listening to Component.destroy()");
		});

		QUnit.test("when app component is destroyed after attachHandlers() was already called", function(assert) {
			var sVariantManagementReference = "sLocalControlId";

			this.oGetUShellServiceStub.returns({
				registerNavigationFilter(fnHandler) {
					assert.strictEqual(typeof fnHandler, "function", "then navigation filter was registered");
				},
				unregisterNavigationFilter(fnHandler) {
					assert.strictEqual(typeof fnHandler, "function", "then navigation filer was de-registered");
				},
				parseShellHash() {}
			});

			URLHandler.initialize({model: this.oModel});

			this.oModel.destroy = sandbox.stub().callsFake(function() {
				assert.ok(true, "then the passed VariantModel is destroyed");
			});
			URLHandler.attachHandlers(
				{vmReference: sVariantManagementReference, updateURL: true, model: this.oModel}
			); // app component's destroy handlers are attached here

			var fnVariantSwitchPromiseStub = sandbox.stub();
			this.oModel._oVariantSwitchPromise = new Promise(function(resolve) {
				setTimeout(function() {
					resolve();
				}, 0);
			}).then(fnVariantSwitchPromiseStub);

			this.oAppComponent.destroy();

			return this.oModel._oVariantSwitchPromise.then(function() {
				var aCallArgs = this.fnDestroyUnobserverSpy.getCall(0).args;
				assert.equal(this.oModel.destroy.callCount, 1, "then variant model resetMap() was called");
				assert.deepEqual(
					aCallArgs[0],
					this.oAppComponent,
					"then ManagedObjectObserver unobserve() was called for the AppComponent"
				);
				assert.strictEqual(
					aCallArgs[1].destroy,
					true,
					"then ManagedObjectObserver unobserve() was called for the destroy() method"
				);
				assert.ok(
					fnVariantSwitchPromiseStub.calledBefore(this.fnDestroyUnobserverSpy),
					"then first variant switch was resolved and then component's destroy callback was called"
				);
			}.bind(this));
		});

		QUnit.test("when update() is called to update the URL with a hash register update", function(assert) {
			URLHandler.initialize({model: this.oModel});
			assert.expect(2);
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				updateURL: true,
				model: this.oModel
			};

			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});

			this.oGetUShellServiceStub.withArgs("Navigation").returns({
				navigate(mParameters) {
					assert.strictEqual(
						mParameters.params[URLHandler.variantTechnicalParameterName],
						mPropertyBag.parameters,
						"then correct parameters were passed to be set for the URL hash"
					);
				}
			});

			URLHandler.update(mPropertyBag);
			assert.deepEqual(this.oModel._oHashData.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});

		QUnit.test("when update() is called to update the URL without a hash register update", function(assert) {
			URLHandler.initialize({model: this.oModel});
			assert.expect(2);
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: false,
				updateURL: true,
				model: this.oModel
			};

			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});

			this.oGetUShellServiceStub.withArgs("Navigation").returns({
				navigate(mParameters) {
					assert.strictEqual(
						mParameters.params[URLHandler.variantTechnicalParameterName],
						mPropertyBag.parameters,
						"then correct parameters were passed to be set for the URL hash"
					);
				}
			});

			URLHandler.update(mPropertyBag);
			assert.strictEqual(this.oModel._oHashData.hashParams.length, 0, "then hash register was not updated");
		});

		QUnit.test("when update() is called without a component", function(assert) {
			assert.expect(1);
			this.oAppComponent.destroy();
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateURL: true,
				model: this.oModel
			};
			this.oModel.oAppComponent = undefined;

			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});

			this.oGetUShellServiceStub.withArgs("Navigation").returns({
				navigate(mParameters) {
					assert.strictEqual(
						mParameters.params[URLHandler.variantTechnicalParameterName],
						mPropertyBag.parameters,
						"then correct parameters were passed to be set for the URL hash"
					);
				}
			});

			URLHandler.update(mPropertyBag);
		});

		QUnit.test("when update() is called to update hash register without a URL update", function(assert) {
			URLHandler.initialize({model: this.oModel});
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				model: this.oModel
			};

			this.oGetUShellServiceStub.callsFake(function() {
				assert.ok(false, "then hash related functions should not be called");
			});

			URLHandler.update(mPropertyBag);
			assert.deepEqual(this.oModel._oHashData.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});

		QUnit.test("when update() is called to update hash register with a URL update, but the parameters didn't change", function(assert) {
			URLHandler.initialize({model: this.oModel});
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				updateURL: true,
				model: this.oModel
			};

			var oReturnObject = {params: {}};
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = ["testParam1", "testParam2"];
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oReturnObject;
				}
			});

			this.oGetUShellServiceStub.withArgs("Navigation").returns({
				navigate() {
					assert.ok(false, "but 'navigate' should not be called");
				}
			});

			URLHandler.update(mPropertyBag);
			assert.ok(true, "update is called");
		});
	});

	function stubURLParsing(aParameterValues) {
		this.oGetUShellServiceStub.withArgs("URLParsing").returns({
			parseShellHash: () => {
				const params = {};
				params[URLHandler.variantTechnicalParameterName] = aParameterValues;
				return {params};
			}
		});
	}

	QUnit.module("Given multiple variant management controls", {
		beforeEach() {
			this.oAppComponent = new Component("appComponent");
			this.oRegisterNavigationFilterStub = sandbox.stub();
			this.oDeRegisterNavigationFilterStub = sandbox.stub();

			// mock ushell services
			var sDefaultStatus = "Continue";

			this.oModel = new VariantModel(
				{
					variantMgmtId1: {
						defaultVariant: "variant1",
						originalDefaultVariant: "variant1",
						currentVariant: "variantMgmtId1",
						variants: [
							{
								key: "variantMgmtId1",
								layer: Layer.VENDOR
							}, {
								key: "variant1",
								layer: Layer.VENDOR
							}
						]
					},
					variantMgmtId2: {
						defaultVariant: "variantMgmtId2",
						originalDefaultVariant: "variantMgmtId2",
						currentVariant: "variant2",
						variants: [
							{
								key: "variantMgmtId2",
								layer: Layer.VENDOR
							}, {
								key: "variant2",
								layer: Layer.VENDOR
							}
						]
					},
					variantMgmtId3: {
						defaultVariant: "variantMgmtId3",
						originalDefaultVariant: "variantMgmtId3",
						currentVariant: "variantMgmtId3",
						variants: [
							{
								key: "variantMgmtId3",
								layer: Layer.VENDOR
							}, {
								key: "variant3",
								layer: Layer.VENDOR
							}
						]
					}
				}, {
					flexController: {},
					appComponent: this.oAppComponent
				}
			);
			this.sDefaultStatus = sDefaultStatus;
			this.oGetUShellServiceStub = sandbox.stub(this.oModel, "getUShellService");
			this.oGetUShellServiceStub.withArgs("ShellNavigationInternal").returns({
				NavigationFilterStatus: {
					Continue: sDefaultStatus
				},
				registerNavigationFilter: this.oRegisterNavigationFilterStub,
				unregisterNavigationFilter: this.oDeRegisterNavigationFilterStub
			});

			return this.oModel.initialize()
			.then(function() {
				this.oSwitchToDefaultVariantStub = sandbox.stub(this.oModel, "switchToDefaultForVariantManagement");

				// variant management controls
				this.oVariantManagement1 = new VariantManagement("variantMgmtId1", {updateVariantInURL: true});
				this.oVariantManagement1.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				this.oVariantManagement2 = new VariantManagement("variantMgmtId2", {updateVariantInURL: true});
				this.oVariantManagement2.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());
				this.oVariantManagement3 = new VariantManagement("variantMgmtId3", {updateVariantInURL: true});
				this.oVariantManagement3.setModel(this.oModel, ControlVariantApplyAPI.getVariantModelName());

				// mock property bag for URLHandler.update
				this.mPropertyBag = {
					parameters: ["testParam1", "testParam2"],
					updateHashEntry: true,
					updateURL: true
				};
			}.bind(this));
		},
		afterEach(assert) {
			var done = assert.async();
			this.oDeRegisterNavigationFilterStub.onCall(0).callsFake(function() {
				sandbox.restore();
				done();
			});
			this.oVariantManagement1.destroy();
			this.oVariantManagement2.destroy();
			this.oVariantManagement3.destroy();
			if (this.oAppComponent instanceof Component) {
				this.oAppComponent.destroy();
			}
		}
	}, function() {
		QUnit.test("when 3 variant management controls are rendered", function(assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			assert.ok(
				this.oModel._oHashData.controlPropertyObservers.length,
				3,
				"then an observer for 'resetOnContextChange' was added for each control"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1, out of 3 controls", function(assert) {
			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(
				this.oSwitchToDefaultVariantStub.callCount,
				3,
				"the VariantModel.switchToDefaultForVariantManagement() is called three times"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[0][0],
				"variantMgmtId1",
				"then first VM control was reset to default variant"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[1][0],
				"variantMgmtId2",
				"then second VM control was reset to default variant"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[2][0],
				"variantMgmtId3",
				"then third VM control was reset to default variant"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1 with a URL parameter, out of 3 controls", function(assert) {
			var oReturnObject = {params: {}};
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = [this.oVariantManagement1.getId()];

			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oReturnObject;
				}
			});
			sandbox.stub(this.oModel, "getVariant").callsFake(function(sVReference, sVMReference) {
				if (sVMReference === this.oVariantManagement1.getId() && sVReference === this.oVariantManagement1.getId()) {
					return {simulate: "foundVariant"};
				}
				return undefined;
			}.bind(this));

			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(
				this.oSwitchToDefaultVariantStub.callCount,
				2,
				"the VariantModel.switchToDefaultForVariantManagement() is called two times"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[0][0],
				"variantMgmtId2",
				"then second VM control was reset to default variant"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[1][0],
				"variantMgmtId3",
				"then third VM control was reset to default variant"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 2, out of 3 controls", function(assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(
				this.oSwitchToDefaultVariantStub.callCount,
				2,
				"then VariantModel.switchToDefaultForVariantManagement() is called twice"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[0][0],
				"variantMgmtId2",
				"then second VM control was reset to default variant"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[1][0],
				"variantMgmtId3",
				"then third VM control was reset to default variant"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 3, out of 3 controls", function(assert) {
			this.oVariantManagement3.fireEvent("modelContextChange");
			assert.equal(
				this.oSwitchToDefaultVariantStub.callCount,
				1,
				"then VariantModel.switchToDefaultForVariantManagement() is called once"
			);
			assert.equal(
				this.oSwitchToDefaultVariantStub.args[0][0],
				"variantMgmtId3",
				"then third VM control was reset to default variant"
			);
		});

		QUnit.test("when event 'modelContextChange' is fired on a control which is not there in the hash register", function(assert) {
			this.oModel._oHashData.variantControlIds.splice(1, 1);
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(
				this.oSwitchToDefaultVariantStub.callCount,
				0,
				"then VariantModel.switchToDefaultForVariantManagement() is not called"
			);
		});

		QUnit.test("when event 'resetOnContextChange' is changed to false from true(default)", function(assert) {
			var done = assert.async();
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to true");
			sandbox.stub(this.oVariantManagement1, "detachEvent").callsFake(function(sEventName, fnCallBack) {
				if (sEventName === "modelContextChange") {
					assert.ok(typeof fnCallBack === "function", "then the event handler was detached from 'modelContextChange'");
					done();
				}
			});
			this.oVariantManagement1.setResetOnContextChange(false);
		});

		QUnit.test("when property 'resetOnContextChange' is changed to true from false", function(assert) {
			var done = assert.async();
			this.oVariantManagement1.setResetOnContextChange(false);
			assert.notOk(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to false");
			sandbox.stub(this.oVariantManagement1, "attachEvent").callsFake(function(sEventName, mParameters, fnCallBack) {
				if (sEventName === "modelContextChange") {
					assert.deepEqual(mParameters.model, this.oModel, "then the correct parameters were passed for the event handler");
					assert.ok(typeof fnCallBack === "function", "then the event handler was attached to 'modelContextChange'");
					done();
				}
			}.bind(this));
			this.oVariantManagement1.setResetOnContextChange(true);
		});

		QUnit.test("when the registered navigationFilter function is called and there is an error in hash parsing", function(assert) {
			this.oGetUShellServiceStub.callThrough().withArgs("URLParsing").throws();
			var oLogErrorSpy = sandbox.spy(Log, "error");
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(fnVariantIdChangeHandler(), this.sDefaultStatus, "then the default navigation filter status was returned");
			assert.equal(oLogErrorSpy.callCount, 1, "then the error was logged");
		});

		QUnit.test("when the registered navigationFilter function is called and there is a variant parameter, belonging to no variant", function(assert) {
			sandbox.stub(URLHandler, "update").callsFake(() => {
				assert.notOk(true, "then update is incorrectly called");
			});

			const fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			stubURLParsing.call(this, ["nonExistingVariant"]);
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there is an unchanged variant URL parameter", function(assert) {
			var aParameterValues = [this.oModel.oData.variantMgmtId1.currentVariant, "paramValue2"];
			stubURLParsing.call(this, aParameterValues);
			sandbox.stub(URLHandler, "update").callsFake(function() {
				assert.notOk(true, "then update is called incorrectly");
			});
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there are unchanged variant URL parameters for two different variant managements", function(assert) {
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.currentVariant,
				this.oModel.oData.variantMgmtId2.currentVariant,
				"otherParamValue"
			];

			stubURLParsing.call(this, aParameterValues);

			sandbox.stub(URLHandler, "update").callsFake(function() {
				assert.notOk(true, "then update is called incorrectly");
			});

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there are changed variant URL parameters", function(assert) {
			assert.expect(2);
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId2.defaultVariant,
				"otherParamValue"
			];

			stubURLParsing.call(this, aParameterValues);

			var mExpectedPropertyBag = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					this.oModel.oData.variantMgmtId2.currentVariant,
					"otherParamValue"
				]
			};
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "then URLHandler.update() was called with right parameters");
			});

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there is one changed variant URL parameter", function(assert) {
			assert.expect(2);
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant, // changed
				this.oModel.oData.variantMgmtId2.currentVariant,
				"otherParamValue"
			];

			stubURLParsing.call(this, aParameterValues);

			var mExpectedPropertyBag = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					this.oModel.oData.variantMgmtId2.currentVariant,
					"otherParamValue"
				]
			};
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "then URLHandler.update() was called with right parameters");
			});

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called and there are two variant parameters belonging to the same variant management", function(assert) {
			assert.expect(2);
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId1.currentVariant,
				"otherParamValue"
			];
			var mExpectedPropertyBag = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					"otherParamValue"
				]
			};
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "then URLHandler.update() was called with right parameters");
			});

			stubURLParsing.call(this, aParameterValues);

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called in UI Adaptation mode and there is a changed variant parameter, belonging to a variant", function(assert) {
			assert.expect(2);
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId2.defaultVariant,
				"otherParamValue"
			];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToUpdate = {
				model: this.oModel,
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				parameters: [
					this.oModel.oData.variantMgmtId1.currentVariant,
					this.oModel.oData.variantMgmtId2.currentVariant,
					"otherParamValue"
				]
			};
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				assert.deepEqual(
					mPropertyBag,
					mExpectedPropertyBagToUpdate,
					"then URLHandler.update() was called with right parameters to update hash register"
				);
			});

			stubURLParsing.call(this, aParameterValues);

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});

		QUnit.test("when the registered navigationFilter function is called in UI Adaptation mode and there is a changed variant parameter (default variant), belonging to a variant", function(assert) {
			assert.expect(2);
			var aParameterValues = [
				this.oModel.oData.variantMgmtId1.defaultVariant,
				this.oModel.oData.variantMgmtId2.defaultVariant,
				"variant3"
			];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToUpdate = {
				model: this.oModel,
				updateURL: !this.oModel._bDesignTimeMode,
				updateHashEntry: true,
				parameters: [this.oModel.oData.variantMgmtId1.currentVariant, this.oModel.oData.variantMgmtId2.currentVariant]
			};
			sandbox.stub(URLHandler, "update").callsFake(function(mPropertyBag) {
				assert.deepEqual(
					mPropertyBag,
					mExpectedPropertyBagToUpdate,
					"then URLHandler.update() was called with right parameters to update hash register"
				);
			});

			stubURLParsing.call(this, aParameterValues);

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(
				fnVariantIdChangeHandler("DummyHash"),
				this.sDefaultStatus,
				"then the default navigation filter status was returned"
			);
		});
	});

	QUnit.module("Given URLHandler.updateVariantInURL() to update a new variant parameter in the URL", {
		beforeEach() {
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl").returns("someComponentName");
			this.oModel = new VariantModel({
				variantMgmtId1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant0",
							layer: "CUSTOMER",
							title: "variant A",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant1",
							layer: "CUSTOMER",
							title: "variant B",
							favorite: false,
							visible: true
						}
					]
				},
				variantMgmtId2: {
					defaultVariant: "variant21",
					originalDefaultVariant: "variant21",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId2",
							layer: Layer.VENDOR,
							title: "Standard",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant20",
							layer: "CUSTOMER",
							title: "variant A",
							favorite: true,
							visible: true
						}, {
							author: "Me",
							key: "variant21",
							layer: "CUSTOMER",
							title: "variant B",
							favorite: false,
							visible: true
						}
					]
				}
			},
			{
				flexController: {},
				appComponent: { getId() { return "testid"; } }
			});

			this.oGetUShellServiceStub = sandbox.stub(this.oModel, "getUShellService");
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {}
			});

			return this.oModel.initialize()
			.then(function() {
				sandbox.stub(URLHandler, "update");
			});
		},
		afterEach() {
			this.oModel.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with no variant URL parameter", function(assert) {
			var oParameters = {
				params: {}
			};

			var aModifiedUrlTechnicalParameters = ["variant0"];
			sandbox.stub(this.oModel, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns({simulate: "foundVariant"});
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oParameters;
				}
			});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				model: this.oModel
			});
			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");
			assert.deepEqual(URLHandler.removeURLParameterForVariantManagement.returnValues[0], {
				parameters: [],
				index: -1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: aModifiedUrlTechnicalParameters,
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object as parameter");
		});

		QUnit.test("when called when a parameter is already present for another VM", function(assert) {
			var aExistingParameters = ["variantMgmtId1"];
			var sTargetVariantId = "variant20";
			var oParameters = {
				params: {
				}
			};
			oParameters.params[URLHandler.variantTechnicalParameterName] = aExistingParameters;

			sandbox.stub(this.oModel, "getVariant").withArgs("variantMgmtId1", "variantMgmtId2").returns({});
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oParameters;
				}
			});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId2",
				newVReference: sTargetVariantId,
				model: this.oModel
			});
			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");

			var oVariantIndexInURLReturn = {parameters: ["variantMgmtId1"], index: -1};
			oVariantIndexInURLReturn.parameters = [aExistingParameters[0]];
			assert.deepEqual(
				URLHandler.removeURLParameterForVariantManagement.returnValues[0],
				oVariantIndexInURLReturn,
				"then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index"
			);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [aExistingParameters[0], sTargetVariantId],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object as parameter");
		});

		QUnit.test("when called with encoded variant URL parameter for the same variant management", function(assert) {
			var aExistingParameters = ["Dummy::'123'/'456'", "variantMgmtId1"];
			var sTargetVariantId = "variant0";
			var oParameters = {
				params: {}
			};
			oParameters.params[URLHandler.variantTechnicalParameterName] = aExistingParameters.map(function(sExistingParameter) {
				return encodeURIComponent(sExistingParameter);
			});

			sandbox.stub(this.oModel, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns({simulate: "foundVariant"});
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oParameters;
				}
			});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: sTargetVariantId,
				model: this.oModel
			});
			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");

			var oVariantIndexInURLReturn = {parameters: {}, index: 1};
			oVariantIndexInURLReturn.parameters = [aExistingParameters[0]];
			assert.deepEqual(
				URLHandler.removeURLParameterForVariantManagement.returnValues[0],
				oVariantIndexInURLReturn,
				"then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index"
			);
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [aExistingParameters[0], sTargetVariantId],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object as parameter");
		});

		QUnit.test("when called in standalone mode (without a ushell container)", function(assert) {
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {};
				}
			});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				model: this.oModel
			});

			assert.ok(this.oGetUShellServiceStub.called, "then url parameters requested");
			assert.deepEqual(URLHandler.removeURLParameterForVariantManagement.returnValues[0], {
				index: -1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with no variant URL parameters", function(assert) {
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {};
				}
			});

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant1",
				model: this.oModel
			}); // default variant

			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with a valid variant URL parameter for the same variant management", function(assert) {
			var oReturnObject = {params: {}};
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = ["Dummy", "variantMgmtId1", "Dummy1"];
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return oReturnObject;
				}
			});

			sandbox.stub(this.oModel, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns({simulate: "foundVariant"});

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant1",
				model: this.oModel
			}); // default variant

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "Dummy1"],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with a parameter list excluding default variant");
		});

		QUnit.test("when called while in adaptation mode with variant parameters present in the hash register", function(assert) {
			// to verify ushell
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});
			// return parameters saved at the current index of the hash register
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["Dummy", "variantMgmtId1", "Dummy1"]);
			sandbox.stub(this.oModel, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns({simulate: "foundVariant"});
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				model: this.oModel
			});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "variant0", "Dummy1"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the update parameter list but the url is not updated");
		});

		QUnit.test("when called while in adaptation mode and there are no variant parameters saved in the hash register", function(assert) {
			// to verify ushell
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				model: this.oModel
			});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["variant0"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with an empty parameter list");
		});

		QUnit.test("when called and there is no parameter saved in the hash register", function(assert) {
			// to verify ushell
			this.oGetUShellServiceStub.withArgs("URLParsing").returns({
				parseShellHash() {
					return {params: {}};
				}
			});
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({
				vmReference: "variantMgmtId1",
				newVReference: "variant0",
				model: this.oModel
			});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["variant0"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with an empty parameter list");
		});
	});

	QUnit.module("Given URLHandler.update to update hash parameters in URL", {
		beforeEach() {
			sandbox.stub(Log, "warning");
			sandbox.stub(hasher, "replaceHash");
			this.oModel = {
				getUShellService() {}
			};
			this.oGetUShellServiceStub = sandbox.stub(this.oModel, "getUShellService");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called to process silently, with an invalid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = {};
			var sParamValue = "testValue";
			var sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oMockedURLParser = {
				getHash() {
					return "";
				},
				parseShellHash() {
					return {
						params: oParameters
					};
				},
				constructShellHash(oParsedHash) {
					assert.deepEqual(
						oParsedHash.params[URLHandler.variantTechnicalParameterName],
						aNewParamValues,
						"then the new shell hash is created with the passed parameters"
					);
					assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
					return sConstructedHashValue;
				}
			};

			this.oGetUShellServiceStub.withArgs("URLParsing").returns(oMockedURLParser);

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL: true, silent: true});

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.ok(Log.warning.calledWith(
				"Component instance not provided, so technical parameters in component data and browser history remain unchanged"
			), "then warning produced as component is invalid");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called to process silently, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = {};
			var sParamValue = "testValue";
			var sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oTechnicalParameters = {};
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			this.oModel.oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData() {
					return this.oComponentData;
				}
			};

			var oMockedURLParser = {
				getHash() {
					return "";
				},
				parseShellHash() {
					return {
						params: oParameters
					};
				},
				constructShellHash(oParsedHash) {
					assert.deepEqual(
						oParsedHash.params[URLHandler.variantTechnicalParameterName],
						aNewParamValues,
						"then the new shell hash is created with the passed parameters"
					);
					assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
					return sConstructedHashValue;
				}
			};

			this.oGetUShellServiceStub.withArgs("URLParsing").returns(oMockedURLParser);

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL: true, silent: true});

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.deepEqual(
				this.oModel.oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then new parameter values were set as component's technical parameters"
			);
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called without the silent parameter set, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = {};
			var sParamValue = "testValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oTechnicalParameters = {};
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			this.oModel.oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData() {
					return this.oComponentData;
				}
			};

			var oUshellNav = {
				navigate: sandbox.stub()
			};

			var oMockParsedHash = {
				semanticObject: "semanticObject",
				action: "action",
				contextRaw: "context",
				params: oParameters,
				appSpecificRoute: "appSpecificRoute",
				writeHistory: false
			};
			var oMockedURLParser = {
				parseShellHash() {
					return oMockParsedHash;
				}
			};

			this.oGetUShellServiceStub.withArgs("URLParsing").returns(oMockedURLParser);
			this.oGetUShellServiceStub.withArgs("Navigation").returns(oUshellNav);

			var oExpectedResult = {
				target: {
					semanticObject: oMockParsedHash.semanticObject,
					action: oMockParsedHash.action,
					context: oMockParsedHash.contextRaw
				},
				params: {},
				appSpecificRoute: oMockParsedHash.appSpecificRoute,
				writeHistory: false
			};
			oExpectedResult.params[URLHandler.variantTechnicalParameterName] = aNewParamValues;

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL: true});

			assert.deepEqual(
				this.oModel.oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName],
				aNewParamValues,
				"then new parameter values were set as component's technical parameters"
			);
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(
				oUshellNav.navigate.calledWithExactly(oExpectedResult),
				"then the ushell navigation service was called with the correct parameters"
			);
		});

		QUnit.test("when clearAllVariantURLParameters is called without variants in the url", function(assert) {
			var oMockedURLParser = {
				parseShellHash() {
					return {
						params: {
							myFancyParameter: "foo"
						}
					};
				}
			};
			this.oGetUShellServiceStub.withArgs("URLParsing").returns(oMockedURLParser);

			var oUpdateStub = sandbox.stub(URLHandler, "update");
			URLHandler.clearAllVariantURLParameters({model: this.oModel});
			assert.strictEqual(oUpdateStub.callCount, 0, "the update function was not called");
		});
	});
});