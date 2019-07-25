/* global QUnit */

sap.ui.define([
	"sap/ui/fl/variants/util/URLHandler",
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
	var sVariantParameterName = "sap-ui-fl-control-variant-id";
	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function () {
			this.oAppComponent = new Component("appComponent");
			this._oHashRegister = {
				hashParams : []
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
		QUnit.test("when calling 'getCurrentHashParamsFromRegister' with oHashRegister.currentIndex not set to null", function (assert) {
			this._oHashRegister = {
				hashParams : ["expectedParameter1", "expectedParameter2"]
			};
			assert.deepEqual(URLHandler.getCurrentHashParamsFromRegister.call(this), ["expectedParameter1", "expectedParameter2"], "then expected parameters are returned");
		});

		QUnit.test("when calling 'initialize' with oHashRegister.currentIndex set to null", function (assert) {
			sandbox.stub(URLHandler, "_setOrUnsetCustomNavigationForParameter");
			URLHandler.initialize.call(this);
			var oHashRegister = {
				hashParams: [],
				observers: [],
				variantControlIds: []
			};
			assert.deepEqual(this._oHashRegister, oHashRegister, "then hash register object initialized");
			assert.ok(URLHandler._setOrUnsetCustomNavigationForParameter.calledOnce, "then URLHandler._setOrUnsetCustomNavigationForParameter() called once");
			assert.ok(URLHandler._setOrUnsetCustomNavigationForParameter.calledOn(this), "then URLHandler._setOrUnsetCustomNavigationForParameter() called once");
		});

		QUnit.test("when calling 'attachHandlers' for the first time with a variant management control's local id", function (assert) {
			var sVariantManagementReference = "sLocalControlId";
			URLHandler.initialize.call(this);
			URLHandler.attachHandlers.call(this, sVariantManagementReference, true);
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");
			this.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy:true}); // remove component observer
			assert.deepEqual(this._oHashRegister.variantControlIds, [sVariantManagementReference], "then the rendered control's local id added to the hash register");
		});

		QUnit.test("when calling 'attachHandlers' for the first time and updateURL set to false", function (assert) {
			URLHandler.initialize.call(this);

			// first call
			URLHandler.attachHandlers.call(this, "mockControlId1", false);
			var aCallArgs = this.fnDestroyObserverSpy.getCall(0).args;
			assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver observers the AppComponent");
			assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver observers the destroy() method");
			this.oComponentDestroyObserver.unobserve(this.oAppComponent, {destroy:true}); // remove component observer
			assert.deepEqual(this._oHashRegister.variantControlIds, [], "then the control id was not added to the hash register");

			// second call
			URLHandler.attachHandlers.call(this, "mockControlId2", false);
			assert.ok(this.fnDestroyObserverSpy.calledOnce, "then no new observers were listening to Component.destroy()");
		});

		QUnit.test("when app component is destroyed after 'attachHandlers' was already called", function (assert) {
			var sVariantManagementReference = "sLocalControlId";
			URLHandler.initialize.call(this);

			this.destroy = function() {
				assert.ok(true, "then the VariantModel passed as context is destroyed");
			};

			this.oChangePersistence = {
				resetVariantMap: function() {
					assert.ok(true, "then resetMap() of the variant controller was called");
				}
			};
			URLHandler.attachHandlers.call(this, sVariantManagementReference, true); // app component's destroy handlers are attached here

			sandbox.stub(URLHandler, "_setOrUnsetCustomNavigationForParameter").callsFake(function(bSet) {
				assert.strictEqual(bSet, false, "then _setOrUnsetCustomNavigationForParameter called with a false value");
			});
			var fnVariantSwitchPromiseStub = sandbox.stub();
			this._oVariantSwitchPromise = new Promise(function (resolve) {
				setTimeout(function () {
					resolve();
				}, 0);
			}).then(fnVariantSwitchPromiseStub);

			this.oAppComponent.destroy();

			return this._oVariantSwitchPromise.then(function() {
				var aCallArgs = this.fnDestroyUnobserverSpy.getCall(0).args;
				assert.deepEqual(aCallArgs[0], this.oAppComponent, "then ManagedObjectObserver unobserve() was called for the AppComponent");
				assert.strictEqual(aCallArgs[1].destroy, true, "then ManagedObjectObserver unobserve() was called for the destroy() method");
				assert.ok(fnVariantSwitchPromiseStub.calledBefore(this.fnDestroyUnobserverSpy), "then first variant switch was resolved and then component's destroy callback was called");
			}.bind(this));
		});

		QUnit.test("when calling '_setOrUnsetCustomNavigationForParameter' with ShellNavigation service, to register a navigation filter", function (assert) {
			var fnRegisterNavigationFilter = sandbox.stub();
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						registerNavigationFilter: fnRegisterNavigationFilter
					};
				}
			});
			URLHandler._setOrUnsetCustomNavigationForParameter.call(this, true);
			assert.strictEqual(fnRegisterNavigationFilter.getCall(0).args[0].toString(), URLHandler._navigationFilter.bind(this).toString(),
				"then the URLHandler._navigationFilter() is passed to registerNavigationFilter of ShellNavigation service");
		});

		QUnit.test("when calling '_setOrUnsetCustomNavigationForParameter' with ShellNavigation service, to deregister a navigation filter", function (assert) {
			var fnUnRegisterNavigationFilter = sandbox.stub();
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						unregisterNavigationFilter: fnUnRegisterNavigationFilter
					};
				}
			});
			URLHandler._setOrUnsetCustomNavigationForParameter.call(this, false);
			assert.strictEqual(fnUnRegisterNavigationFilter.getCall(0).args[0].toString(), URLHandler._navigationFilter.bind(this).toString(),
				"then the URLHandler._navigationFilter() is passed to unregisterNavigationFilter of ShellNavigation service");
		});

		QUnit.test("when calling 'update' to update the URL with a hash register update", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true,
				updateURL: true
			};

			sandbox.stub(URLHandler, "_setTechnicalURLParameterValues");

			URLHandler.update.call(this, mPropertyBag);
			assert.ok(URLHandler._setTechnicalURLParameterValues.calledWithExactly(this.oAppComponent, mPropertyBag.parameters),
				"then URLHandler._setTechnicalURLParameterValues() with the required parameters");
			assert.deepEqual(this._oHashRegister.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});

		QUnit.test("when calling 'update' to update the URL without a hash register update", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: false,
				updateURL: true
			};

			sandbox.stub(URLHandler, "_setTechnicalURLParameterValues");

			URLHandler.update.call(this, mPropertyBag);
			assert.ok(URLHandler._setTechnicalURLParameterValues.calledWithExactly(this.oAppComponent, mPropertyBag.parameters),
				"then URLHandler._setTechnicalURLParameterValues() with the required parameters");
			assert.strictEqual(this._oHashRegister.hashParams.length, 0, "then hash register was not updated");
		});

		QUnit.test("when calling 'update' without a component", function (assert) {
			this.oAppComponent.destroy();
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateURL: true
			};
			this.oAppComponent = { id : "TestComponent" };

			sandbox.stub(URLHandler, "_setTechnicalURLParameterValues");

			URLHandler.update.call(this, mPropertyBag);
			assert.ok(URLHandler._setTechnicalURLParameterValues.calledWithExactly(this.oAppComponent, mPropertyBag.parameters),
				"then URLHandler._setTechnicalURLParameterValues() with the required parameters");
		});

		QUnit.test("when calling 'update' to update hash register without a URL update", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateHashEntry: true
			};

			sandbox.stub(URLHandler, "_setTechnicalURLParameterValues");

			URLHandler.update.call(this, mPropertyBag);
			assert.strictEqual(URLHandler._setTechnicalURLParameterValues.callCount, 0,
				"then URLHandler._setTechnicalURLParameterValues() not called");
			assert.deepEqual(this._oHashRegister.hashParams, mPropertyBag.parameters, "then hash register was updated");
		});
	});

	QUnit.module("Given multiple variant management controls", {
		beforeEach: function () {
			this.oAppComponent = new Component("appComponent");

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
					}
				}
			});

			this.oSwitchToDefaultVariantStub = sandbox.stub(this.oModel, "switchToDefaultForVariantManagement");

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
							}
						};
					}
				}
			});
			this.sDefaultStatus = sDefaultStatus;

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
		afterEach: function () {
			if (this.oAppComponent instanceof Component) {
				this.oAppComponent.destroy();
			}
			this.oModel.destroy();
			this.oVariantManagement1.destroy();
			this.oVariantManagement2.destroy();
			this.oVariantManagement3.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when 3 variant management controls are rendered", function (assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			assert.ok(this.oModel._oHashRegister.observers.length, 3, "then an observer for 'resetOnContextChange' was added for each control");
		});

		QUnit.test("when 'modelContextChange' is fired on a control rendered at position 1, out of 3 controls", function (assert) {
			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 3, "the VariantModel.switchToDefaultForVariantManagement() is called three times");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId1", "then first VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[2][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when 'modelContextChange' is fired on a control rendered at position 1 with a URL parameter, out of 3 controls", function (assert) {
			sandbox.stub(this.oModel, "getVariantIndexInURL")
				.callThrough()
				.withArgs(this.oVariantManagement1.getId())
				.returns({index: 0});
			this.oVariantManagement1.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 2, "the VariantModel.switchToDefaultForVariantManagement() is called two times");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when 'modelContextChange' is fired on a control rendered at position 2, out of 3 controls", function (assert) {
			assert.ok(this.oVariantManagement1.getResetOnContextChange(), "then by default 'resetOnContextChange' is set to true");
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 2, "then VariantModel.switchToDefaultForVariantManagement() is called twice");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId2", "then second VM control was reset to default variant");
			assert.equal(this.oSwitchToDefaultVariantStub.args[1][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when 'modelContextChange' is fired on a control rendered at position 3, out of 3 controls", function (assert) {
			this.oVariantManagement3.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 1, "then VariantModel.switchToDefaultForVariantManagement() is called once");
			assert.equal(this.oSwitchToDefaultVariantStub.args[0][0], "variantMgmtId3", "then third VM control was reset to default variant");
		});

		QUnit.test("when 'modelContextChange' is fired on a control which is not there in the hash register", function (assert) {
			this.oModel._oHashRegister.variantControlIds.splice(1, 1);
			this.oVariantManagement2.fireEvent("modelContextChange");
			assert.equal(this.oSwitchToDefaultVariantStub.callCount, 0, "then VariantModel.switchToDefaultForVariantManagement() is not called");
		});



		QUnit.test("when 'resetOnContextChange' is changed to false from true(default)", function (assert) {
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

		QUnit.test("when 'resetOnContextChange' is changed to true from false", function (assert) {
			var done = assert.async();
			this.oVariantManagement1.setResetOnContextChange(false);
			assert.notOk(this.oVariantManagement1.getResetOnContextChange(), "then initially 'resetOnContextChange' is set to true");
			sandbox.stub(this.oVariantManagement1, "attachEvent").callsFake(function (sEventName, fnCallBack) {
				if (sEventName === "modelContextChange") {
					assert.ok(typeof fnCallBack === "function", "then the event handler was attached to 'modelContextChange'");
					done();
				}
			});
			this.oVariantManagement1.setResetOnContextChange(true);
		});

		QUnit.test("when '_navigationFilter' is called and there is an error in hash parsing", function (assert) {
			var oLogErrorSpy = sandbox.spy(Log, "error");
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, {}), this.sDefaultStatus, "then the default navigation filter status was returned");
			assert.equal(oLogErrorSpy.callCount, 1, "then the error was logged");
		});

		QUnit.test("when '_navigationFilter' is called and there is no variant parameter", function (assert) {
			this.updateEntry = function () {
				assert.ok(false, "VariantModel.updateEntry() should not be called");
			};
			var oHash = {params: {}};
			oHash.params[this.oModel.sVariantTechnicalParameterName] = ["paramValue1", "paramValue2"];
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when '_navigationFilter' is called and there is a variant parameter, belonging to no variant", function (assert) {
			var aParameterValues = ["paramValue1", "paramValue2"];
			sandbox.stub(URLHandler, "update").callsFake(function () {
				assert.ok(false, "URLHandler.update() should not be called");
			});

			var oHash = {params: {}};
			oHash.params[this.oModel.sVariantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when '_navigationFilter' is called and there is a unchanged variant parameter, belonging to a variant", function (assert) {
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].currentVariant, "paramValue2"];
			sandbox.stub(URLHandler, "update").callsFake(function () {
				assert.ok(false, "URLHandler.update() should not be called");
			});

			var oHash = {params: {}};
			oHash.params[this.oModel.sVariantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when '_navigationFilter' is called and there is a changed variant parameter, belonging to a variant", function (assert) {
			assert.expect(2);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "otherParamValue"];
			var mExpectedPropertyBag = {
				updateURL: true,
				updateHashEntry: true,
				parameters: [this.oModel.oData["variantMgmtId1"].currentVariant, this.oModel.oData["variantMgmtId2"].currentVariant, "otherParamValue"]
			};
			sandbox.stub(URLHandler, "update").callsFake(function (mPropertyBag) {
				assert.deepEqual(mPropertyBag, mExpectedPropertyBag, "then URLHandler.update() was called with right parameters");
			});

			var oHash = {params: {}};
			oHash.params[this.oModel.sVariantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when '_navigationFilter' is called in UI Adaptation mode and there is a changed variant parameter, belonging to a variant", function (assert) {
			assert.expect(3);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "otherParamValue"];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToClear = {
				updateURL: true,
				updateHashEntry: false,
				parameters: []
			};
			var mExpectedPropertyBagToUpdate = {
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
			oHash.params[this.oModel.sVariantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});

		QUnit.test("when '_navigationFilter' is called in UI Adaptation mode and there is a changed variant parameter (default variant), belonging to a variant", function (assert) {
			assert.expect(3);
			var aParameterValues = [this.oModel.oData["variantMgmtId1"].defaultVariant, this.oModel.oData["variantMgmtId2"].defaultVariant, "variant3"];
			this.oModel._bDesignTimeMode = true;
			var mExpectedPropertyBagToClear = {
				updateURL: true,
				updateHashEntry: false,
				parameters: []
			};
			var mExpectedPropertyBagToUpdate = {
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
			oHash.params[this.oModel.sVariantTechnicalParameterName] = aParameterValues;
			assert.strictEqual(URLHandler._navigationFilter.call(this.oModel, oHash), this.sDefaultStatus, "then the default navigation filter status was returned");
		});
	});

	QUnit.module("Given URLHandler._setTechnicalURLParameterValues", {
		beforeEach: function () {
			sandbox.stub(Utils, "getUshellContainer");
			sandbox.stub(Log, "warning");
			sandbox.stub(hasher, "replaceHash");
			this.sVariantTechnicalParameterName = "sap-ui-fl-control-variant-id";
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
			oParameters[sVariantParameterName] = [sParamValue];

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
					assert.deepEqual(oParsedHash.params[sVariantParameterName], aNewParamValues, "then the new shell hash is created with the passed parameters");
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

			URLHandler._setTechnicalURLParameterValues.call(this, {}, aNewParamValues, true);

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.ok(Log.warning.calledWith("Component instance not provided, so technical parameters in component data and browser history remain unchanged"), "then warning produced as component is invalid");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called to process silently, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = { };
			var sParamValue = "testValue";
			var sConstructedHashValue = "hashValue";
			oParameters[sVariantParameterName] = [sParamValue];

			var oTechnicalParameters = { };
			oTechnicalParameters[sVariantParameterName] = sParamValue;
			var oComponent = {
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
					assert.deepEqual(oParsedHash.params[sVariantParameterName], aNewParamValues, "then the new shell hash is created with the passed parameters");
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

			URLHandler._setTechnicalURLParameterValues.call(this, oComponent, aNewParamValues, true);

			assert.ok(hasher.replaceHash.calledWith(sConstructedHashValue), "then hasher.replaceHash is called with the correct hash");
			assert.deepEqual(oComponent.getComponentData().technicalParameters[sVariantParameterName], aNewParamValues, "then new parameter values were set as component's technical parameters");
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(hasher.changed.active, "then the hasher changed events are activated again");
		});

		QUnit.test("when called without the silent parameter set, with a valid component and some parameter values", function(assert) {
			var aNewParamValues = ["testValue1", "testValue2"];
			var oParameters = { };
			var sParamValue = "testValue";
			oParameters[sVariantParameterName] = [sParamValue];

			var oTechnicalParameters = { };
			oTechnicalParameters[sVariantParameterName] = sParamValue;
			var oComponent = {
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
			oExpectedResult.params[sVariantParameterName] = aNewParamValues;

			URLHandler._setTechnicalURLParameterValues.call(this, oComponent, aNewParamValues);

			assert.deepEqual(oComponent.getComponentData().technicalParameters[sVariantParameterName], aNewParamValues, "then new parameter values were set as component's technical parameters");
			assert.ok(Log.warning.notCalled, "then no warning for invalid component was produced");
			assert.ok(oCrossAppNav.toExternal.calledWithExactly(oExpectedResult), "then the CrossAppNavigation service was called with the correct parameters");
		});
	});
});