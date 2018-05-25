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

	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function (assert) {
			this._oHashRegister = {
				currentIndex: undefined,
				hashParams : []
			};
			this.oComponent = {};
		},
		afterEach: function (assert) {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when calling 'initializeHashRegister' with a context", function (assert) {
			this.sVariantTechnicalParameterName = "myParamName";
			sandbox.stub(VariantUtil, "_setCustomNavigationForParameter");
			VariantUtil.initializeHashRegister.call(this);
			var oHashRegister = {
				currentIndex: null,
				hashParams: []
			};
			assert.deepEqual(this._oHashRegister, oHashRegister, "then hash register object initialized");
			assert.ok(VariantUtil._setCustomNavigationForParameter.calledOnce, "then VariantUtil._setCustomNavigationForParameter() called once");
			assert.ok(VariantUtil._setCustomNavigationForParameter.calledOn(this), "then VariantUtil._setCustomNavigationForParameter() called once");
		});
		QUnit.test("when calling 'attachHashHandlers' with _oHashRegister.currentIndex set to null", function (assert) {
			assert.expect(3);
			this._oHashRegister.currentIndex = null;
			VariantUtil.initializeHashRegister.call(this);
			sandbox.stub(VariantUtil, "_navigationHandler").callsFake(function() {
				assert.ok(true, "then VariantUtil._navigationHandler() was called intitally on attaching hash handler functions");
			});
			sandbox.stub(HashChanger, "getInstance").callsFake(function() {
				return {
					attachEvent: function(sEvtName, fnEventHandler) {
						assert.strictEqual(sEvtName, "hashChanged", "then 'hashChanged' attachEvent is called for HashChanger.getInstance()");
						assert.strictEqual(fnEventHandler.toString(), VariantUtil._navigationHandler.toString(), "then VariantUtil._navigationHandler() attached to this 'hashChanged' event");
					}
				};
			});

			VariantUtil.attachHashHandlers.call(this);
		});
		QUnit.test("when calling 'attachHashHandlers' with _oHashRegister.currentIndex not set to null", function (assert) {
			this._oHashRegister.currentIndex = 0;
			sandbox.stub(VariantUtil, "_navigationHandler");
			VariantUtil.attachHashHandlers.call(this);
			assert.strictEqual(VariantUtil._navigationHandler.callCount, 0, "then VariantUtil._navigationHandler() not called");
		});
		QUnit.test("when calling '_setCustomNavigationForParameter' with ShellNavigation service", function (assert) {
			var fnRegisterNavigationFilter = sandbox.stub();
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function() {
					return {
						registerNavigationFilter: fnRegisterNavigationFilter
					};
				}
			});
			VariantUtil._setCustomNavigationForParameter.call(this);
			assert.strictEqual(fnRegisterNavigationFilter.getCall(0).args[0].toString(), VariantUtil._navigationFilter.bind(this).toString(),
				"then the VariantUtil._navigationFilter() is passed to registerNavigationFilter of ShellNavigation service");
		});
		QUnit.test("when calling 'updateHasherEntry' to update the URL with a hash register update", function (assert) {
			var mPropertyBag = {
				component: { id : "TestComponent" },
				parameters: ["testParam1", "testParam2"],
				ignoreRegisterUpdate: false,
				updateURL: true
			};

			this._oHashRegister.currentIndex = 0;
			this.sVariantTechnicalParameterName = "testTechnicalParamName";

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(mPropertyBag.component, this.sVariantTechnicalParameterName, mPropertyBag.parameters),
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
			this.sVariantTechnicalParameterName = "testTechnicalParamName";

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(mPropertyBag.component, this.sVariantTechnicalParameterName, mPropertyBag.parameters),
				"then Utils.setTechnicalURLParameterValues() with the required parameters");
			assert.notOk(this._oHashRegister.hashParams[this._oHashRegister.currentIndex], "then hash register for the current index was not updated");
		});
		QUnit.test("when calling 'updateHasherEntry' without a component", function (assert) {
			var mPropertyBag = {
				parameters: ["testParam1", "testParam2"],
				updateURL: true
			};
			this.oComponent = { id : "TestComponent" };
			this.sVariantTechnicalParameterName = "testTechnicalParamName";

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.ok(Utils.setTechnicalURLParameterValues.calledWithExactly(this.oComponent, this.sVariantTechnicalParameterName, mPropertyBag.parameters),
				"then Utils.setTechnicalURLParameterValues() with the required parameters");
		});
		QUnit.test("when calling 'updateHasherEntry' to update hash register without a URL update", function (assert) {
			var mPropertyBag = {
				component: { id : "TestComponent" },
				parameters: ["testParam1", "testParam2"]
			};

			this._oHashRegister.currentIndex = 0;
			this.sVariantTechnicalParameterName = "testTechnicalParamName";

			sandbox.stub(Utils, "setTechnicalURLParameterValues");

			VariantUtil.updateHasherEntry.call(this, mPropertyBag);
			assert.strictEqual(Utils.setTechnicalURLParameterValues.callCount, 0,
				"then Utils.setTechnicalURLParameterValues() not called");
			assert.deepEqual(this._oHashRegister.hashParams[this._oHashRegister.currentIndex], mPropertyBag.parameters, "then hash register for the current index was updated");
		});
		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex set to null and 'Unknown' navigation direction", function (assert) {
			this._oHashRegister.currentIndex = null;
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			this.updateHasherEntry = sandbox.stub();

			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Unknown";
					}
				};
			});

			sandbox.stub(Utils, "getParsedURLHash").returns({
				params: {
					"testTechnicalParamName": ["newEntry"]
				}
			});

			VariantUtil._navigationHandler.call(this);
			assert.strictEqual(this._oHashRegister.currentIndex, 0, "then the oHashRegister.currentIndex is initialized to 0");
			assert.ok(this.updateHasherEntry.calledWithExactly({
				parameters: ["newEntry"]
			}), "then VarintModel.updateHasherEntry() called with the required parameters");
		});
		QUnit.test("when calling '_navigationHandler' with _oHashRegister.currentIndex > 0 and 'Unknown' navigation direction", function (assert) {
			this._oHashRegister = {
				currentIndex: 5,
				hashParams: [["Test0"], ["Test1"], ["Test2"]]
			};
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			this.updateHasherEntry = sandbox.stub();
			this.switchToDefaultVariant = sandbox.stub();
			sandbox.stub(History, "getInstance").callsFake(function () {
				return {
					getDirection: function () {
						return "Unknown";
					}
				};
			});

			sandbox.stub(Utils, "getParsedURLHash").returns({
				params: {
					"testTechnicalParamName": ["newEntry"]
				}
			});

			VariantUtil._navigationHandler.call(this);
			assert.deepEqual(this._oHashRegister.hashParams, [], "then _oHashRegister.hashParams is reset");
			assert.strictEqual(this.switchToDefaultVariant.getCall(0).args.length, 0, "then  VariantModel.switchToDefaultVariant() called with no parameters");
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
				]
			};
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
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
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
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
				]
			};
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
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
				hashParams: []
			};
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			this.updateHasherEntry = sandbox.stub();

			sandbox.stub(Utils, "getParsedURLHash").returns({
				params: {
					"testTechnicalParamName": ["newEntry"]
				}
			});

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
				]
			};
			this.switchToDefaultVariant = sandbox.stub();
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			this.updateHasherEntry = sandbox.stub();

			sandbox.stub(Utils, "getParsedURLHash").returns({
				params: {
					"testTechnicalParamName": ["newEntry"]
				}
			});

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
			assert.ok(this.switchToDefaultVariant.getCall(0).calledWithExactly("existingParameter2"), "then VariantModel.switchToDefaultVariant() called with existing hash parameters for the incremented index");
			assert.ok(this.switchToDefaultVariant.getCall(1).calledWithExactly("existingParameter3"), "then VariantModel.switchToDefaultVariant() called with existing hash parameters for the incremented index");
		});
	});
	QUnit.module("Given an instance of VariantModel", {
		beforeEach: function (assert) {
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			var sCustomStatus = "Custom";
			var sDefaultStatus = "Continue";
			sandbox.stub(Utils, "getUshellContainer").returns({
				getService: function(sName) {
					if (sName === "URLParsing") {
						return {
							parseShellHash: function(oHashParams) {
								return {
									params: oHashParams.params,
									appSpecificRoute: oHashParams.appSpecificRoute
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
		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with old hash containing variant parameters only", function (assert) {
			assert.expect(3);
			var oOldHash = {
				params: {
					testTechnicalParamName: ["testParam1"]
				},
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: { },
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
		});
		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with new hash containing variant parameters only", function (assert) {
			assert.expect(3);
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			var oOldHash = {
				params: { },
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: {
					testTechnicalParamName: ["testParam1"]
				},
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
		});
		QUnit.test("when '_navigationFilter' is called from ushell ShellNavigation service, with both old and new hash containing variant parameters", function (assert) {
			assert.expect(3);
			this.sVariantTechnicalParameterName = "testTechnicalParamName";
			var oOldHash = {
				params: {
					testTechnicalParamName: ["testParam2"]
				},
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: {
					testTechnicalParamName: ["testParam1"]
				},
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.deepEqual(vStatus, this.oCustomNavigationStatus, "then the correct status object was returned");
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
				params: {
					testTechnicalParamName: ["testParam2"]
				},
				appSpecificRoute: "XXoldHashAppRoute"
			};
			var oNewHash = {
				params: {
					testTechnicalParamName: ["testParam1"],
					testParamName: "testParamValue"
				},
				appSpecificRoute: "XXnewHashAppRoute"
			};
			var vStatus = VariantUtil._navigationFilter.call(this, oNewHash, oOldHash);
			assert.strictEqual(vStatus, this.sDefaultStatus, "then the correct status object was returned");
		});
	});

	QUnit.start();
});
