/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/fl/variants/VariantModel",
	"sap/ui/fl/variants/util/VariantUtil",
	"sap/ui/fl/Utils",
	"sap/ui/core/routing/HashChanger",
	"sap/ui/core/routing/History",
	"sap/ui/thirdparty/sinon-4"
],
function(
	VariantModel,
	VariantUtil,
	Utils,
	HashChanger,
	History,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sVariantParameterName = "sap-ui-fl-control-variant-id";
	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function (assert) {
			this._oHashRegister = {
				currentIndex: undefined,
				hashParams : [],
				variantControlIds : []
			};
			this.oComponent = { };
		},
		afterEach: function (assert) {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling 'getCurrentHashParamsFromRegister' with oHashRegister.currentIndex not set to null", function (assert) {
			this._oHashRegister = {
				currentIndex: 0,
				hashParams : [
					["expectedParameter1", "expectedParameter2"],
					["unExpectedParameter"]
				]
			};
			assert.deepEqual(VariantUtil.getCurrentHashParamsFromRegister.call(this), ["expectedParameter1", "expectedParameter2"], "then expected parameters are returned");
		});

		QUnit.test("when calling 'initializeHashRegister' with oHashRegister.currentIndex set to null", function (assert) {
			sandbox.stub(VariantUtil, "_setOrUnsetCustomNavigationForParameter");
			VariantUtil.initializeHashRegister.call(this);
			var oHashRegister = {
				currentIndex: null,
				hashParams: [],
				variantControlIds: []
			};
			assert.deepEqual(this._oHashRegister, oHashRegister, "then hash register object initialized");
			assert.ok(VariantUtil._setOrUnsetCustomNavigationForParameter.calledOnce, "then VariantUtil._setOrUnsetCustomNavigationForParameter() called once");
			assert.ok(VariantUtil._setOrUnsetCustomNavigationForParameter.calledOn(this), "then VariantUtil._setOrUnsetCustomNavigationForParameter() called once");
		});

		QUnit.test("when calling 'attachHashHandlers' with _oHashRegister.currentIndex set to null", function (assert) {
			assert.expect(5);
			var done = assert.async();
			var iIndex = 0;
			var aHashEvents = [{
				name: "hashReplaced",
				handler: "_handleHashReplaced"
			}, {
				name: "hashChanged",
				handler: "_navigationHandler"
			}];

			this._oHashRegister.currentIndex = null;
			VariantUtil.initializeHashRegister.call(this);
			sandbox.stub(VariantUtil, "_navigationHandler").callsFake(function() {
				assert.ok(true, "then VariantUtil._navigationHandler() was called intitally on attaching hash handler functions");
			});

			sandbox.stub(HashChanger, "getInstance").callsFake(function() {
				return {
					attachEvent: function(sEvtName, fnEventHandler) {
						assert.strictEqual(sEvtName, aHashEvents[iIndex].name, "then '" + aHashEvents[iIndex].name + "' attachEvent is called for HashChanger.getInstance()");
						assert.strictEqual(fnEventHandler.toString(), VariantUtil[aHashEvents[iIndex].handler].toString(), "then VariantUtil." + aHashEvents[iIndex].handler + " attached to '" + aHashEvents[iIndex].name + "'  event");
						if (iIndex === 1) {
							done();
						}
						iIndex++;
					}
				};
			});

			VariantUtil.attachHashHandlers.call(this);
		});

		QUnit.test("when Component is destroyed after 'attachHashHandlers' was already called", function (assert) {
			assert.expect(8);
			var iIndex = 0;
			this._oHashRegister.currentIndex = null;
			var aHashEvents = [{
				name: "hashReplaced",
				handler: "_handleHashReplaced"
			}, {
				name: "hashChanged",
				handler: "_navigationHandler"
			}];

			VariantUtil.initializeHashRegister.call(this);
			sandbox.stub(VariantUtil, "_navigationHandler");
			sandbox.stub(HashChanger, "getInstance").callsFake(function() {
				return {
					attachEvent: function () { },
					detachEvent: function(sEvtName, fnEventHandler) {
						assert.strictEqual(sEvtName, aHashEvents[iIndex].name, "then '" + aHashEvents[iIndex].name + "' detachEvent is called for HashChanger.getInstance()");
						assert.strictEqual(fnEventHandler.toString(), VariantUtil[aHashEvents[iIndex].handler].toString(), "then VariantUtil." + aHashEvents[iIndex].handler + " detached for '" + aHashEvents[iIndex].name + "' event");
						iIndex++;
					}
				};
			});

			this.destroy = function() {
				assert.ok(true, "then the VariantModel passed as context is destroyed");
			};
			this.oComponent.destroy = function() {
				assert.ok(true, "then the original Component.destroy() is also called");
			};
			this.oVariantController = {
				resetMap: function() {
					assert.ok(true, "then resetMap() of the variant controller was called");
				}
			};
			VariantUtil.attachHashHandlers.call(this);

			sandbox.stub(VariantUtil, "_setOrUnsetCustomNavigationForParameter").callsFake(function(bSet) {
				assert.strictEqual(bSet, false, "then _setOrUnsetCustomNavigationForParameter called with a false value");
			});
			this.oComponent.destroy();
		});

		QUnit.test("when calling 'attachHashHandlers' with _oHashRegister.currentIndex not set to null", function (assert) {
			this._oHashRegister.currentIndex = 0;
			sandbox.stub(VariantUtil, "_navigationHandler");
			VariantUtil.attachHashHandlers.call(this);
			assert.strictEqual(VariantUtil._navigationHandler.callCount, 0, "then VariantUtil._navigationHandler() not called");
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
			VariantUtil._setOrUnsetCustomNavigationForParameter.call(this, true);
			assert.strictEqual(fnRegisterNavigationFilter.getCall(0).args[0].toString(), VariantUtil._navigationFilter.toString(),
				"then the VariantUtil._navigationFilter() is passed to registerNavigationFilter of ShellNavigation service");
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
			VariantUtil._setOrUnsetCustomNavigationForParameter.call(this, false);
			assert.strictEqual(fnUnRegisterNavigationFilter.getCall(0).args[0].toString(), VariantUtil._navigationFilter.toString(),
				"then the VariantUtil._navigationFilter() is passed to unregisterNavigationFilter of ShellNavigation service");
		});

		QUnit.test("when calling 'updateHasherEntry' to update the URL with a hash register update", function (assert) {
			var mPropertyBag = {
				component: { id : "TestComponent" },
				parameters: ["testParam1", "testParam2"],
				ignoreRegisterUpdate: false,
				updateURL: true
			};

			this._oHashRegister.currentIndex = 0;

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(mPropertyBag.component, sVariantParameterName, mPropertyBag.parameters),
				"then Utils.setTechnicalURLParameterValues() with the required parameters");
			assert.deepEqual(this._oHashRegister.hashParams[this._oHashRegister.currentIndex], mPropertyBag.parameters, "then hash register for the current index was updated");
		});

		QUnit.test("when calling 'updateHasherEntry' to update the URL without a hash register update", function (assert) {
			var mPropertyBag = {
				component: { id : "TestComponent" },
				parameters: ["testParam1", "testParam2"],
				ignoreRegisterUpdate: true,
				updateURL: true
			};

			this._oHashRegister.currentIndex = 0;

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(mPropertyBag.component, sVariantParameterName, mPropertyBag.parameters),
				"then Utils.setTechnicalURLParameterValues() with the required parameters");
			assert.notOk(this._oHashRegister.hashParams[this._oHashRegister.currentIndex], "then hash register for the current index was not updated");
		});

		QUnit.test("when calling 'updateHasherEntry' without a component", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateURL: true
			};
			this.oComponent = { id : "TestComponent" };

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(this.oComponent, sVariantParameterName, mPropertyBag.parameters),
				"then Utils.setTechnicalURLParameterValues() with the required parameters");
		});

		QUnit.test("when calling 'updateHasherEntry' to update hash register without a URL update", function (assert) {
			var mPropertyBag = {
				component: { id : "TestComponent" },
				parameters: ["testParam1", "testParam2"]
			};

			this._oHashRegister.currentIndex = 0;

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.strictEqual(Utils.setTechnicalURLParameterValues.callCount, 0,
				"then Utils.setTechnicalURLParameterValues() not called");
			assert.deepEqual(this._oHashRegister.hashParams[this._oHashRegister.currentIndex], mPropertyBag.parameters, "then hash register for the current index was updated");
		});

		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex set to null and 'Unknown' navigation direction", function (assert) {
			this._oHashRegister.currentIndex = null;
			this.updateHasherEntry = sandbox.stub();

			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Unknown";
					}
				};
			});

			var oMockParsedURL = {
				params: { }
			};
			oMockParsedURL.params[sVariantParameterName] = ["newEntry"];

			sandbox.stub(Utils, "getParsedURLHash").returns(oMockParsedURL);

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 0, "then the oHashRegister.currentIndex is initialized to 0");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: ["newEntry"]
			}), "then VarintModel.updateHasherEntry() called with the required parameters");
		});

		QUnit.test("when calling '_navigationHandler' with parsed URL hash returning undefined", function (assert) {
			this._oHashRegister.currentIndex = null;
			this.updateHasherEntry = sandbox.stub();
			sandbox.stub(Utils, "getParsedURLHash").returns(undefined);

			VariantUtil._navigationHandler.call(this);
			assert.ok(this.updateHasherEntry.called, "then no errors occur");
		});

		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex > 0 and 'Unknown' navigation direction", function (assert) {
			this._oHashRegister = {
				currentIndex: 5,
				hashParams: [["Test0"], ["Test1"], ["Test2"]],
				variantControlIds: [["variantManagement0"], ["variantManagement1"], ["variantManagement2"]]
			};
			this.updateHasherEntry = sandbox.stub();
			this.switchToDefaultForVariant = sandbox.stub();
			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Unknown";
					}
				};
			});

			var oMockParsedURL = {
				params: { }
			};
			oMockParsedURL.params[sVariantParameterName] = ["newEntry"];

			sandbox.stub(Utils, "getParsedURLHash").returns(oMockParsedURL);

			VariantUtil._navigationHandler.call(this);
			assert.deepEqual(this._oHashRegister.hashParams, [], "then _oHashRegister.hashParams is reset");
			assert.deepEqual(this._oHashRegister.variantControlIds, [], "then _oHashRegister.variantControlIds is reset");
			assert.strictEqual(this.switchToDefaultForVariant.getCall(0).args.length, 0, "then  VariantModel.switchToDefaultForVariant() called with no parameters");
			assert.strictEqual(this._oHashRegister.currentIndex, 0, "then the oHashRegister.currentIndex is reset to 0");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: ["newEntry"]
			}), "then VariantModel.updateHasherEntry() called with new variant hash parameters, URL update and _oHashRegister update");
		});

		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex > 0 and 'Backwards' navigation direction", function (assert) {
			this._oHashRegister = {
				currentIndex: 2,
				hashParams: [
					[],
					["backwardParameter"]
				],
				variantControlIds: [["variantManagement0"], ["variantManagement1", "variantManagement2"]]
			};
			this.updateHasherEntry = sandbox.stub();
			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Backwards";
					}
				};
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 1, "then the oHashRegister.currentIndex is decreased by 1");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: this._oHashRegister.hashParams[1],
				updateURL: true,
				ignoreRegisterUpdate: true
			}), "then VariantModel.updateHasherEntry() called with variant hash parameters from previous index, URL update and no _oHashRegister update");
		});

		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex set to 0 and 'Backwards' navigation direction", function (assert) {
			this._oHashRegister = {
				currentIndex: 0
			};
			this.updateHasherEntry = sandbox.stub();
			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Backwards";
					}
				};
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, -1, "then the oHashRegister.currentIndex is decreased by 1");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: [],
				updateURL: true,
				ignoreRegisterUpdate: true
			}), "then VariantModel.updateHasherEntry() called with empty variant hash parameters, URL update and no _oHashRegister update");
		});

		QUnit.test("when calling '_navigationHandler' with 'Forwards' navigation direction", function (assert) {
			this._oHashRegister = {
				currentIndex: 0,
				hashParams: [
					[],
					["forwardParameter"]
				],
				variantControlIds: [["variantManagement0", "variantManagement1"], ["variantManagement2"]]
			};
			this.updateHasherEntry = sandbox.stub();
			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Forwards";
					}
				};
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 1, "then the oHashRegister.currentIndex is increased by 1");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: this._oHashRegister.hashParams[1],
				updateURL: true,
				ignoreRegisterUpdate: true
			}), "then VariantModel.updateHasherEntry() called with variant hash parameters from next index, URL update and no _oHashRegister update");
		});

		QUnit.test("when calling '_navigationHandler' with 'NewEntry' navigation direction, with no existing parameters for the new index", function (assert) {
			this._oHashRegister = {
				currentIndex: 0,
				hashParams: [],
				variantControlIds: []
			};
			this.updateHasherEntry = sandbox.stub();

			var oMockParsedURL = {
				params: { }
			};
			oMockParsedURL.params[sVariantParameterName] = ["newEntry"];

			sandbox.stub(Utils, "getParsedURLHash").returns(oMockParsedURL);

			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "NewEntry";
					}
				};
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 1, "then the oHashRegister.currentIndex is increased by 1");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: ["newEntry"]
			}), "then VariantModel.updateHasherEntry() called with variant hash parameters from next index, URL update and no _oHashRegister update");
		});

		QUnit.test("when calling '_navigationHandler' with 'NewEntry' navigation direction, with existing parameters for the new index", function (assert) {
			this._oHashRegister = {
				currentIndex: 0,
				hashParams: [
					["existingParameter1"],
					["existingParameter2", "existingParameter3"]
				],
				variantControlIds: [["variantManagement0"], ["variantManagement1", "variantManagement2"]]
			};
			this.switchToDefaultForVariantManagement = sandbox.stub();
			this.updateHasherEntry = sandbox.stub();

			var oMockParsedURL = {
				params: { }
			};
			oMockParsedURL.params[sVariantParameterName] = ["newEntry"];

			sandbox.stub(Utils, "getParsedURLHash").returns(oMockParsedURL);

			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "NewEntry";
					}
				};
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 1, "then the oHashRegister.currentIndex is increased by 1");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: ["newEntry"]
			}), "then VariantModel.updateHasherEntry() called with variant hash parameters from next index, URL update and no _oHashRegister update");
			assert.ok(this.switchToDefaultForVariantManagement.getCall(0).calledWithExactly("variantManagement1"), "then VariantModel.switchToDefaultForVariant() called with existing hash parameters for the incremented index");
			assert.ok(this.switchToDefaultForVariantManagement.getCall(1).calledWithExactly("variantManagement2"), "then VariantModel.switchToDefaultForVariant() called with existing hash parameters for the incremented index");
		});

		QUnit.test("when calling '_navigationHandler' by HashChanger 'hashChanged' event, when hash was replaced", function (assert) {
			var oEventReturn = {
				newHash: "newMockHash"
			};
			var oHashChanger = HashChanger.getInstance();
			var oHashRegister = {
				currentIndex: 999,
				hashParams: [
					["existingParameter1"]
				],
				variantControlIds: [["variantManagement0"]]
			};
			this._oHashRegister = jQuery.extend(true, {}, oHashRegister);

			sandbox.spy(VariantUtil, "_navigationHandler");
			oHashChanger.attachEvent("hashChanged", VariantUtil._navigationHandler, this);
			VariantUtil._handleHashReplaced.call(this, {
				getParameter : function() {
					return oEventReturn.newHash;
				}
			});
			assert.strictEqual(this._sReplacedHash, oEventReturn.newHash, "then initially when hash is replaced, _sReplacedHash set to the replaced hash");
			HashChanger.getInstance().fireEvent("hashChanged", oEventReturn);
			assert.strictEqual(this._sReplacedHash, undefined, "then _sReplacedHash doesn't exist, after HashChanger 'hashChanged' event was fired");
			assert.deepEqual(this._oHashRegister, oHashRegister, "then _oHashRegister values remain unchanged");
		});

		QUnit.test("when '_handleHashReplaced' is called from the HashChanger 'hashReplaced' event", function (assert) {
			var oEventReturn = {
				sHash: "newMockHash"
			};
			this._oHashRegister = {
				currentIndex: null,
				hashParams: [],
				variantControlIds: []
			};
			this.oComponent = {
				destroy: function () {
				}
			};
			sandbox.stub(VariantUtil, "_navigationHandler");
			VariantUtil.attachHashHandlers.call(this);
			HashChanger.getInstance().fireEvent("hashReplaced", oEventReturn);
			assert.strictEqual(this._sReplacedHash, oEventReturn.sHash, "then hash is replaced, _sReplacedHash set to the replaced hash");
		});
	});

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function (assert) {
			var sCustomStatus = "Custom";
			var sDefaultStatus = "Continue";
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function(sName) {
					if (sName === "URLParsing") {
						return {
							parseShellHash: function(oHashParams) {
								return {
									params: oHashParams.params,
									appSpecificRoute: oHashParams.appSpecificRoute,
									misMatchingProperty: oHashParams.misMatchingProperty
								};
							}
						};
					} else if (sName === "ShellNavigation") {
						return {
							NavigationFilterStatus: {
								Continue: sDefaultStatus,
								Custom: sCustomStatus
							},
							hashChanger: {
								fireEvent: function(sEventName, oHashObject) {
									assert.strictEqual(sEventName, "hashChanged", "hashChanged event was fired for ShellNavigation.hashChanger");
									assert.deepEqual(oHashObject, {
										newHash: "newHashAppRoute",
										oldHash: "oldHashAppRoute"
									}, "then the correct payload was passed to the hashChanged event");
								}
							}
						};
					}
				}
			});

			this.oCustomNavigationStatus = {
				status: sCustomStatus
			};
			this.sDefaultStatus = sDefaultStatus;
		},
		afterEach: function (assert) {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with hashes which cannot be parsed ", function (assert) {
			assert.expect(1);
			Utils.getUshellContainer.returns({
				getService: function(sName) {
					if (sName === "URLParsing") {
						return {
							parseShellHash: function(oHashParams) { } // returns undefined
						};
					}  else if (sName === "ShellNavigation") {
						return {
							NavigationFilterStatus: {
								Continue: this.sDefaultStatus,
								Custom: this.oCustomNavigationStatus.status
							}
						};
					}
				}.bind(this)
			});

			var vStatus = VariantUtil._navigationFilter.call(this, { }, { });
			assert.deepEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with old hash containing variant parameters only", function (assert) {
			assert.expect(3);

			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			oOldHash.params[sVariantParameterName] = ["testParam1"];

			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with new hash containing variant parameters only", function (assert) {
			assert.expect(3);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			oNewHash.params[sVariantParameterName] = ["testParam1"];

			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with both old and new hash containing variant parameters", function (assert) {
			assert.expect(3);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			oOldHash.params[sVariantParameterName] = ["testParam1"];

			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			oNewHash.params[sVariantParameterName] = ["testParam2"];

			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with both old and new hash containing same variant parameters", function (assert) {
			assert.expect(1);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			oOldHash.params[sVariantParameterName] = ["testParam1"];

			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			oNewHash.params[sVariantParameterName] = ["testParam1"];

			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with both old and new hash containing variant parameters containing different parsed properties", function (assert) {
			assert.expect(1);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute",
				misMatchingProperty: "mismatch1"
			};
			oOldHash.params[sVariantParameterName] = ["testParam1"];

			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute",
				misMatchingProperty: "mismatch2"
			};
			oNewHash.params[sVariantParameterName] = ["testParam2"];

			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with both old and new hash not containing variant parameters", function (assert) {
			assert.expect(1);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.strictEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});

		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with variant parameters along with other parameters", function (assert) {
			assert.expect(1);
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			oOldHash.params[sVariantParameterName] = ["testParam1"];

			var oNewHash = {
				params: {
					testParamName: "testParamValue"
				},
				appSpecificRoute: "XXnewHashAppRoute"
			};
			oNewHash.params[sVariantParameterName] = ["testParam2"];

			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.strictEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});
	});

	QUnit.start();
});
