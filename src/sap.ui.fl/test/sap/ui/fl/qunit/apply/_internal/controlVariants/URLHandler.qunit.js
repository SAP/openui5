/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/controlVariants/URLHandler",
	"sap/ui/fl/variants/VariantManagement",
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Component",
	"sap/base/Log",
	"sap/ui/thirdparty/hasher",
	"sap/ui/thirdparty/sinon-4"
],
function(
	URLHandler,
	VariantManagement,
	VariantModel,
	Utils,
	jQuery,
	ManagedObjectObserver,
	Component,
	Log,
	hasher,
	sinon
) {
	"use strict";
	jQuery("#qunit-fixture").hide();
	var sandbox = sinon.sandbox.create();
	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function () {
			this.oAppComponent = new Component("appComponent");
			this.oModel = {
				_oHashData:  {
					hashParams: []
				},
				oAppComponent: this.oAppComponent
			};
			this.fnDestroyObserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "observe");
			this.fnDestroyUnobserverSpy = sandbox.spy(ManagedObjectObserver.prototype, "unobserve");
		},
		afterEach: function () {
			if (this.oAppComponent instanceof Component) {
				this.oAppComponent.destroy();
			}
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when getStoredHashParams() is called", function (assert) {
			this.oModel._oHashData.hashParams = ["expectedParameter1", "expectedParameter2"];
			assert.deepEqual(URLHandler.getStoredHashParams({model: this.oModel}), ["expectedParameter1", "expectedParameter2"], "then expected parameters are returned");
		});

		QUnit.test("when initialize() is called with oHashRegister.currentIndex set to null", function (assert) {
			assert.expect(3);
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						registerNavigationFilter: function(fnHandler) {
							assert.strictEqual(typeof fnHandler, "function", "then navigation filer was registered");
						},
						unregisterNavigationFilter: function() {
							assert.ok(false, "then de-registration for navigation filter should not be called");
						},
						parseShellHash: function() {}
					};
				}
			});
			sandbox.spy(URLHandler, "attachHandlers");
			var mPropertyBag = {model: this.oModel};
			URLHandler.initialize(mPropertyBag);
			var oHashRegister = {
				hashParams: [],
				controlPropertyObservers: [],
				variantControlIds: []
			};

			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy:true}); // remove component observer
			assert.ok(URLHandler.attachHandlers.calledWith(mPropertyBag), "then required handlers and observers were subscribed");
			assert.deepEqual(this.oModel._oHashData, oHashRegister, "then hash register object initialized");
		});

		QUnit.test("when attachHandlers is called for the first time with a variant management control's local id", function (assert) {
			var sVariantManagementReference = "sLocalControlId";
			URLHandler.initialize({model: this.oModel});
			URLHandler.attachHandlers({vmReference: sVariantManagementReference, updateURL: true, model: this.oModel});
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");

			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy:true}); // remove component observer
			assert.deepEqual(this.oModel._oHashData.variantControlIds, [sVariantManagementReference], "then the rendered control's local id added to the hash register");
		});

		QUnit.test("when attachHandlers() is called for the first time and updateURL set to false", function (assert) {
			URLHandler.initialize({model: this.oModel});

			// first call
			URLHandler.attachHandlers({vmReference:"mockControlId1", updateURL: false, model: this.oModel});
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");
			this.oModel.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy:true}); // remove component observer
			assert.deepEqual(this.oModel._oHashData.variantControlIds, [], "then the control id was not added to the hash register");

			// second call
			URLHandler.attachHandlers({vmReference: "mockControlId2", updateURL: false, model: this.oModel});
			assert.ok(this.fnDestroyObserverSpy.calledOnce, "then no new observers were listening to Component.destroy()");
		});

		QUnit.test("when app component is destroyed after attachHandlers() was already called", function (assert) {
			var sVariantManagementReference = "sLocalControlId";
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						registerNavigationFilter: function(fnHandler) {
							assert.strictEqual(typeof fnHandler, "function", "then navigation filer was registered");
						},
						unregisterNavigationFilter: function(fnHandler) {
							assert.strictEqual(typeof fnHandler, "function", "then navigation filer was de-registered");
						},
						parseShellHash: function() {}
					};
				}
			});

			URLHandler.initialize({model: this.oModel});

			this.oModel.destroy = function() {
				assert.ok(true, "then the passed VariantModel is destroyed");
			};

			this.oModel.oChangePersistence = {
				resetVariantMap: function() {
					assert.ok(true, "then resetMap() of the variant controller was called");
				}
			};
			URLHandler.attachHandlers({vmReference: sVariantManagementReference, updateURL: true, model: this.oModel}); // app component's destroy handlers are attached here

			var fnVariantSwitchPromiseStub = sandbox.stub();
			this.oModel._oVariantSwitchPromise = new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, 0);
			}).then(fnVariantSwitchPromiseStub);

			this.oAppComponent.destroy();

			return this.oModel._oVariantSwitchPromise.then(function() {
				var aCallArgs = this.fnDestroyUnobserverSpy.getCall(0).args;
				assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver unobserve() was called for the AppComponent");
				assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver unobserve() was called for the destroy() method");
				assert.ok(fnVariantSwitchPromiseStub.calledBefore(this.fnDestroyUnobserverSpy), "then first variant switch was resolved and then component's destroy callback was called");
			}.bind(this));
		});

		QUnit.test("when update() is called to update the URL with a hash register update", function (assert) {
			assert.expect(2);
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				updateURL: true,
				model: this.oModel
			};
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function(sServiceName) {
					if (sServiceName === "CrossApplicationNavigation") {
						return {
							toExternal: function(mParameters) {
								assert.strictEqual(mParameters.params[URLHandler.variantTechnicalParameterName], mPropertyBag.parameters, "then correct parameters were passed to be set for the URL hash");
							}
						};
					}
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});

			URLHandler.update(mPropertyBag);
			assert.deepEqual(this.oModel._oHashData.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});

		QUnit.test("when update() is called to update the URL without a hash register update", function (assert) {
			assert.expect(2);
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: false,
				updateURL: true,
				model: this.oModel
			};

			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function(sServiceName) {
					if (sServiceName === "CrossApplicationNavigation") {
						return {
							toExternal: function(mParameters) {
								assert.strictEqual(mParameters.params[URLHandler.variantTechnicalParameterName], mPropertyBag.parameters, "then correct parameters were passed to be set for the URL hash");
							}
						};
					}
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});

			URLHandler.update(mPropertyBag);
			assert.strictEqual(this.oModel._oHashData.hashParams.length, 0, "then hash register was not updated");
		});

		QUnit.test("when update() is called without a component", function (assert) {
			assert.expect(1);
			this.oAppComponent.destroy();
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateURL: true,
				model: this.oModel
			};
			this.oModel.oAppComponent = undefined;
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function(sServiceName) {
					if (sServiceName === "CrossApplicationNavigation") {
						return {
							toExternal: function(mParameters) {
								assert.strictEqual(mParameters.params[URLHandler.variantTechnicalParameterName], mPropertyBag.parameters, "then correct parameters were passed to be set for the URL hash");
							}
						};
					}
				}
			});
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			URLHandler.update(mPropertyBag);
		});

		QUnit.test("when update() is called to update hash register without a URL update", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				model: this.oModel
			};

			sandbox.stub(Utils, "getUshellContainer").callsFake(function() {
				assert.ok(false, "then hash related functions should not be called");
			});

			URLHandler.update(mPropertyBag);
			assert.deepEqual(this.oModel._oHashData.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});
	});

	QUnit.module("Given multiple variant management controls", {
		beforeEach: function () {
			this.oAppComponent = new Component("appComponent");
			this.oRegisterNavigationFilterStub = sandbox.stub();
			this.oDeRegisterNavigationFilterStub = sandbox.stub();
			// mock ushell services
			var sDefaultStatus = "Continue";
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function (sName) {
					if (sName === "URLParsing") {
						return {
							parseShellHash: function (oHashParams) {
								return {
									params: oHashParams.params
								};
							}
						};
					} else if (sName === "ShellNavigation") {
						return {
							NavigationFilterStatus: {
								Continue: sDefaultStatus
							},
							registerNavigationFilter: this.oRegisterNavigationFilterStub,
							unregisterNavigationFilter: this.oDeRegisterNavigationFilterStub
						};
					}
				}.bind(this)
			});
			this.sDefaultStatus = sDefaultStatus;

			// variant model
			this.oModel = new VariantModel({
				variantMgmtId1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					currentVariant: "variantMgmtId1",
					variants: [
						{
							key: "variantMgmtId1",
							layer: "VENDOR"
						}, {
							key: "variant1",
							layer: "VENDOR"
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
							layer: "VENDOR"
						}, {
							key: "variant2",
							layer: "VENDOR"
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
							layer: "VENDOR"
						}, {
							key: "variant3",
							layer: "VENDOR"
						}
					]
				}
			}, {
				_oChangePersistence: {
					_oVariantController: {
						assignResetMapListener: function () {
						}
					},
					resetVariantMap: function () {}
				}
			},
				this.oAppComponent
			);
			this.oSwitchToDefaultVariantStub = sandbox.stub(this.oModel, "switchToDefaultForVariantManagement");

			// variant management controls
			this.oVariantManagement1 = new VariantManagement("variantMgmtId1", {updateVariantInURL: true});
			this.oVariantManagement1.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			this.oVariantManagement2 = new VariantManagement("variantMgmtId2", {updateVariantInURL: true});
			this.oVariantManagement2.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);
			this.oVariantManagement3 = new VariantManagement("variantMgmtId3", {updateVariantInURL: true});
			this.oVariantManagement3.setModel(this.oModel, Utils.VARIANT_MODEL_NAME);

			// mock property bag for URLHandler.update
			this.mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				updateURL: true
			};
		},
		afterEach: function (assert) {
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
	}, function () {
		QUnit.test("when 3 variant management controls are rendered", function (assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			assert.ok(this.oModel._oHashData.controlPropertyObservers.length, 3, "then an observer for 'resetOnContextChange' was added for each control");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1, out of 3 controls", function (assert) {
			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 3, "the VariantModel.switchToDefaultForVariantManagement() is called three times");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId1", "then first VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[2][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 1 with a URL parameter, out of 3 controls", function (assert) {
			var oReturnObject = {params: {}};
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = [this.oVariantManagement1.getId()];
			sandbox.stub(Utils, "getParsedURLHash").returns(oReturnObject);
			this.oModel.oVariantController.getVariant = function(sVMReference, sVReference) {
				if (sVMReference === this.oVariantManagement1.getId() && sVReference === this.oVariantManagement1.getId()) {
					return true;
				}
			}.bind(this);

			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 2, "the VariantModel.switchToDefaultForVariantManagement() is called two times");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId3", "then third VM control was reset to default variant");

			delete this.oModel.oVariantController.getVariant;
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 2, out of 3 controls", function (assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 2, "then VariantModel.switchToDefaultForVariantManagement() is called twice");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control rendered at position 3, out of 3 controls", function (assert) {
			this.oVariantManagement3.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 1, "then VariantModel.switchToDefaultForVariantManagement() is called once");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when event 'modelContextChange' is fired on a control which is not there in the hash register", function (assert) {
			this.oModel._oHashData.variantControlIds.splice(1, 1);
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 0, "then VariantModel.switchToDefaultForVariantManagement() is not called");
		});

		QUnit.test("when event 'resetOnContextChange' is changed to false from true(default)", function (assert) {
			var done = assert.async();
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to true");
			sandbox.stub(this.oVariantManagement1, "detachEvent").callsFake(function (sEventName, fnCallBack) {
				if (sEventName === "modelContextChange") {
					assert.ok(typeof fnCallBack === "function", "then the event handler was detached from 'modelContextChange'");
					done();
				}
			});
			this.oVariantManagement1.setResetOnContextChange(false);
		});

		QUnit.test("when property 'resetOnContextChange' is changed to true from false", function (assert) {
			var done = assert.async();
			this.oVariantManagement1.setResetOnContextChange(false);
			assert.notOk(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to false");
			sandbox.stub(this.oVariantManagement1, "attachEvent").callsFake(function (sEventName, mParameters, fnCallBack) {
				if (sEventName === "modelContextChange") {
					assert.deepEqual(mParameters.model, this.oModel, "then the correct parameters were passed for the event handler");
					assert.ok(typeof fnCallBack === "function", "then the event handler was attached to 'modelContextChange'");
					done();
				}
			}.bind(this));
			this.oVariantManagement1.setResetOnContextChange(true);
		});

		QUnit.test("when the registered navigationFilter function is called and there is an error in hash parsing", function (assert) {
			var oLogErrorSpy = sandbox.spy(Log, "error");
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			assert.strictEqual(fnVariantIdChangeHandler({}), this.sDefaultStatus, "then the default navigation filter status was returned");
			assert.equal(oLogErrorSpy.callCount, 1, "then the error was logged");
		});

		QUnit.test("when the registered navigationFilter function is called and there is a variant parameter, belonging to no variant", function (assert) {
			sandbox.stub(URLHandler, "update").callsFake(function () {
				assert.ok(false, "URLHandler.update() should not be called");
			});

			var oHash = {params: {}};
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			oHash.params[URLHandler.variantTechnicalParameterName] = ["paramValue1", "paramValue2"];
			assert.strictEqual(fnVariantIdChangeHandler(oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when the registered navigationFilter function is called and there is a unchanged variant parameter, belonging to a variant", function (assert) {
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].currentVariant, "paramValue2"];
			sandbox.stub(URLHandler, "update").callsFake(function () {
				assert.ok(false, "URLHandler.update() should not be called");
			});
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			var oHash = {params: {}};
			oHash.params[URLHandler.variantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(fnVariantIdChangeHandler(oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when the registered navigationFilter function is called and there is a changed variant parameter, belonging to a variant", function (assert) {
			assert.expect(2);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "otherParamValue"];
			var mExpectedPropertyBag = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: true,
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant, this.oModel.oData["variantMgmtId2"].currentVariant, "otherParamValue"]
			};
			sandbox.stub(URLHandler, "update").callsFake(function (mPropertyBag) {
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "then URLHandler.update() was called with right parameters");
			});

			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			var oHash = {params: {}};
			oHash.params[URLHandler.variantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(fnVariantIdChangeHandler(oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when the registered navigationFilter function is called in UI Adaptation mode and there is a changed variant parameter, belonging to a variant", function (assert) {
			assert.expect(3);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "otherParamValue"];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToClear = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: false,
				parameters: []
			};
			var mExpectedPropertyBagToUpdate = {
				model: this.oModel,
				updateURL: false,
				updateHashEntry: true,
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant, this.oModel.oData["variantMgmtId2"].currentVariant, "otherParamValue"]
			};
			sandbox.stub(URLHandler, "update").callsFake(function (mPropertyBag) {
				if (mPropertyBag.parameters.length === 0) {
					assert.deepEqual(mPropertyBag, mExpectedPropertyBagToClear, "then URLHandler.update() was called with right parameters to clear URL");
				} else {
					assert.deepEqual(mPropertyBag, mExpectedPropertyBagToUpdate, "then URLHandler.update() was called with right parameters to update hash register");
				}
			});

			var oHash = {params: aParameterValues};
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			oHash.params[URLHandler.variantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(fnVariantIdChangeHandler(oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when the registered navigationFilter function is called in UI Adaptation mode and there is a changed variant parameter (default variant), belonging to a variant", function (assert) {
			assert.expect(3);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "variant3"];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToClear = {
				model: this.oModel,
				updateURL: true,
				updateHashEntry: false,
				parameters: []
			};
			var mExpectedPropertyBagToUpdate = {
				model: this.oModel,
				updateURL: false,
				updateHashEntry: true,
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant, this.oModel.oData["variantMgmtId2"].currentVariant]
			};
			sandbox.stub(URLHandler, "update").callsFake(function (mPropertyBag) {
				if (mPropertyBag.parameters.length === 0) {
					assert.deepEqual(mPropertyBag, mExpectedPropertyBagToClear, "then URLHandler.update() was called with right parameters to clear URL");
				} else {
					assert.deepEqual(mPropertyBag, mExpectedPropertyBagToUpdate, "then URLHandler.update() was called with right parameters to update hash register");
				}
			});

			var oHash = {params: aParameterValues};
			var fnVariantIdChangeHandler = this.oRegisterNavigationFilterStub.getCall(0).args[0];
			oHash.params[URLHandler.variantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(fnVariantIdChangeHandler(oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});
	});

	QUnit.module("Given URLHandler.updateVariantInURL() to update a new variant parameter in the URL", {
		before: function () {
			this.oModel = new VariantModel({
				variantMgmtId1: {
					defaultVariant: "variant1",
					originalDefaultVariant: "variant1",
					variants: [
						{
							author: "SAP",
							key: "variantMgmtId1",
							layer: "VENDOR",
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
				}
			}, {
				_oChangePersistence: {
					_oVariantController: {
						assignResetMapListener: function () {},
						getVariant: function() {}
					}
				}
			}, {});
		},
		beforeEach: function() {
			sandbox.stub(URLHandler, "update");
		},
		afterEach: function () {
			sandbox.restore();
		},
		after: function() {
			this.oModel.destroy();
		}
	}, function () {
		QUnit.test("when called with no variant URL parameter", function(assert) {
			var oParameters = {
				params: {}
			};

			var aModifiedUrlTechnicalParameters = ["variant0"];
			sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
			var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns(oParameters);
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant0", model: this.oModel});
			assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");
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

		QUnit.test("when called with encoded variant URL parameter for the same variant management", function(assert) {
			var aExistingParameters = ["Dummy::'123'/'456'", "variantMgmtId1"];
			var sTargetVariantId = "variant0";
			var oParameters = {
				params: {}
			};
			oParameters.params[URLHandler.variantTechnicalParameterName] = aExistingParameters.map(function(sExistingParameter) {
				return encodeURIComponent(sExistingParameter);
			});

			sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
			var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns(oParameters);
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: sTargetVariantId, model: this.oModel});
			assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");

			var oVariantIndexInURLReturn = { parameters: {}, index: 1 };
			oVariantIndexInURLReturn.parameters = [aExistingParameters[0]];
			assert.deepEqual(URLHandler.removeURLParameterForVariantManagement.returnValues[0], oVariantIndexInURLReturn, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.ok(URLHandler.update.calledWithExactly({
				parameters: [aExistingParameters[0], sTargetVariantId],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object as parameter");
		});

		QUnit.test("when called in standalone mode (without a ushell container)", function(assert) {
			var fnGetParsedURLHashStub = sandbox.stub(Utils, "getParsedURLHash").returns({});
			sandbox.spy(URLHandler, "removeURLParameterForVariantManagement");

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant0", model: this.oModel});

			assert.ok(fnGetParsedURLHashStub.calledOnce, "then url parameters requested once");
			assert.deepEqual(URLHandler.removeURLParameterForVariantManagement.returnValues[0], {
				index: -1
			}, "then URLHandler.removeURLParameterForVariantManagement() returns the correct parameters and index");
			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with no variant URL parameters", function(assert) {
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant1", model: this.oModel}); //default variant

			assert.strictEqual(URLHandler.update.callCount, 0, "then URLHandler.update() not called");
		});

		QUnit.test("when called for the default variant with a valid variant URL parameter for the same variant management", function(assert) {
			var oReturnObject = {params: {}};
			oReturnObject.params[URLHandler.variantTechnicalParameterName] = ["Dummy", "variantMgmtId1", "Dummy1"];
			sandbox.stub(Utils, "getParsedURLHash").returns(oReturnObject);

			sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant1", model: this.oModel}); //default variant

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "Dummy1"],
				updateURL: true,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with a parameter list excluding default variant");
		});

		QUnit.test("when called while in adaptation mode with variant parameters present in the hash register", function(assert) {
			// to verify ushell
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			// return parameters saved at the current index of the hash register
			sandbox.stub(URLHandler, "getStoredHashParams").returns(["Dummy", "variantMgmtId1", "Dummy1"]);
			sandbox.stub(this.oModel.oVariantController, "getVariant").withArgs("variantMgmtId1", "variantMgmtId1").returns(true);
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant0", model: this.oModel});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["Dummy", "variant0", "Dummy1"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the update parameter list but the url is not updated");
		});

		QUnit.test("when called while in adaptation mode and there are no variant parameters saved in the hash register", function(assert) {
			// to verify ushell
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant0", model: this.oModel});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["variant0"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with an empty parameter list");
		});

		QUnit.test("when called and there is no parameter saved in the hash register", function(assert) {
			// to verify ushell
			sandbox.stub(Utils, "getParsedURLHash").returns({params: {}});
			this.oModel._bDesignTimeMode = true;

			URLHandler.updateVariantInURL({vmReference: "variantMgmtId1", newVReference: "variant0", model: this.oModel});

			assert.ok(URLHandler.update.calledWith({
				parameters: ["variant0"],
				updateURL: false,
				updateHashEntry: true,
				model: this.oModel
			}), "then URLHandler.update() called with the correct object with an empty parameter list");
		});
	});

	QUnit.module("Given URLHandler.update to update hash parameters in URL", {
		beforeEach: function () {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Log, "warning");
			sandbox.stub(hasher, "replaceHash");
			this.oModel = {};
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when called to process silently, with an invalid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = { };
			var sParamValue = "testValue";
			var sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oMockedURLParser = {
				getHash : function() {
					return "";
				},
				parseShellHash : function() {
					return {
						params : oParameters
					};
				},
				constructShellHash : function(oParsedHash) {
					assert.deepEqual(oParsedHash.params[URLHandler.variantTechnicalParameterName], aNewParamValues, "then the new shell hash is created with the passed parameters");
					assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
					return sConstructedHashValue;
				}
			};

			Utils.getUshellContainer.returns({
				getService : function(sServiceName) {
					if (sServiceName === "URLParsing") {
						return oMockedURLParser;
					}
				}
			});

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL: true, silent:true});

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.ok(Log.warning.calledWith("Component instance not provided, so technical parameters in component data and browser history remain unchanged"), "then warning produced as component is invalid");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called to process silently, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = {};
			var sParamValue = "testValue";
			var sConstructedHashValue = "hashValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oTechnicalParameters = { };
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			this.oModel.oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData: function() {
					return this.oComponentData;
				}
			};

			var oMockedURLParser = {
				getHash : function() {
					return "";
				},
				parseShellHash : function() {
					return {
						params : oParameters
					};
				},
				constructShellHash : function(oParsedHash) {
					assert.deepEqual(oParsedHash.params[URLHandler.variantTechnicalParameterName], aNewParamValues, "then the new shell hash is created with the passed parameters");
					assert.notOk(hasher.changed.active, "then the hasher changed events are deactivated");
					return sConstructedHashValue;
				}
			};

			Utils.getUshellContainer.returns({
				getService : function(sServiceName) {
					if (sServiceName === "URLParsing") {
						return oMockedURLParser;
					}
				}
			});

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL: true, silent: true});

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.deepEqual(this.oModel.oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName], aNewParamValues, "then new parameter values were set as component's technical parameters");
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called without the silent parameter set, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = { };
			var sParamValue = "testValue";
			oParameters[URLHandler.variantTechnicalParameterName] = [sParamValue];

			var oTechnicalParameters = { };
			oTechnicalParameters[URLHandler.variantTechnicalParameterName] = sParamValue;
			this.oModel.oAppComponent = {
				oComponentData: {
					technicalParameters: oTechnicalParameters
				},
				getComponentData: function() {
					return this.oComponentData;
				}
			};

			var oCrossAppNav = {
				toExternal: sandbox.stub()
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
				parseShellHash: function () {
					return oMockParsedHash;
				}
			};

			Utils.getUshellContainer.returns({
				getService : function(sServiceName) {
					if (sServiceName === "CrossApplicationNavigation") {
						return oCrossAppNav;
					} else if (sServiceName === "URLParsing") {
						return oMockedURLParser;
					}
				}
			});
			var oExpectedResult = {
				target: {
					semanticObject: oMockParsedHash.semanticObject,
					action: oMockParsedHash.action,
					context: oMockParsedHash.contextRaw
				},
				params: { },
				appSpecificRoute: oMockParsedHash.appSpecificRoute,
				writeHistory: false
			};
			oExpectedResult.params[URLHandler.variantTechnicalParameterName] = aNewParamValues;

			URLHandler.update({model: this.oModel, parameters: aNewParamValues, updateURL:true});

			assert.deepEqual(this.oModel.oAppComponent.getComponentData().technicalParameters[URLHandler.variantTechnicalParameterName], aNewParamValues, "then new parameter values were set as component's technical parameters");
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(oCrossAppNav.toExternal.calledWithExactly(oExpectedResult), "then the CrossAppNavigation service was called with the correct parameters");
		});
	});
});