/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/changeHandler/MoveControls",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	Log,
	JsControlTreeModifier,
	Control,
	MoveControls,
	ChangeHandlerStorage,
	Layer,
	sinon,
	FlQUnitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("ChangeHandlerStorage without standard predefined change handlers", {
		beforeEach() {
			// when the library is loaded the library loads the predefined change handlers
			ChangeHandlerStorage.clearAll();

			this.oValidChangeHandler1 = {
				name: "name1",
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
			this.oValidChangeHandler2 = {
				name: "name2",
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("registerPredefinedChangeHandlers", function(assert) {
			var sChangeType = "myFancyChangeType";

			var mChangeHandlers = {};
			mChangeHandlers[sChangeType] = this.oValidChangeHandler1;
			ChangeHandlerStorage.registerPredefinedChangeHandlers(undefined, mChangeHandlers);
			return ChangeHandlerStorage.getChangeHandler(sChangeType, "", undefined, JsControlTreeModifier, Layer.VENDOR)
			.then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler, this.oValidChangeHandler1, "the change handler is returned");
			}.bind(this));
		});

		QUnit.test("registerChangeHandlersForLibrary", function(assert) {
			assert.expect(6);
			var oErrorLogStub = sandbox.stub(Log, "error");
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/fl/notThere.flexibility"],
					stub: new Error("myFancyError"),
					error: true
				}
			]);
			var mChangeHandlers = {
				myFancyControl: {
					hideControl: "default"
				},
				myNotSoFancyControl: "sap/ui/fl/test/registry/TestChangeHandlers",
				myUnavailableFancyControl: "sap/ui/fl/notThere",
				myFancyFancyControl: {
					unhideControl: this.oValidChangeHandler1
				}
			};
			var mDefaultChangeHandler = {
				hideControl: this.oValidChangeHandler1
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers(mDefaultChangeHandler, {});
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				return ChangeHandlerStorage.getChangeHandler(
					"hideControl",
					"myFancyControl",
					undefined,
					JsControlTreeModifier,
					Layer.VENDOR
				);
			})

			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the default Change Handler was registered");
				return ChangeHandlerStorage.getChangeHandler(
					"doSomethingElse",
					"myNotSoFancyControl",
					undefined,
					JsControlTreeModifier,
					Layer.VENDOR
				);
			}.bind(this))
			.then(function(oChangeHandler) {
				assert.ok(oChangeHandler, "the change handlers in the flexibility file were registered");
				return ChangeHandlerStorage.getChangeHandler(
					"doSomething",
					"myNotSoFancyControl",
					undefined,
					JsControlTreeModifier,
					Layer.VENDOR
				);
			})
			.then(function(oChangeHandler) {
				assert.ok(oChangeHandler, "the change handlers in the flexibility file were registered");
				return ChangeHandlerStorage.getChangeHandler(
					"unhideControl",
					"myFancyFancyControl",
					undefined,
					JsControlTreeModifier,
					Layer.VENDOR
				);
			})
			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the default Change Handler was registered");
				return ChangeHandlerStorage.getChangeHandler(
					"hideControl",
					"myUnavailableFancyControl",
					undefined,
					JsControlTreeModifier,
					Layer.VENDOR
				);
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Change handler registered for the Control and Change type", "the function rejects");
				const oErrorLogStubCalls = oErrorLogStub.getCalls();
				const sExpectedErrorMessage = "Flexibility change handler registration failed.\nControlType: myUnavailableFancyControl\n";
				// In very rare occasions, the CH registration of the libraries might still be ongoing, which can log parallel errors
				// during the test execution. This is why we need to check for the error message in all calls.
				assert.ok(
					oErrorLogStubCalls.some((oCall) => oCall.args[0].indexOf(sExpectedErrorMessage) > -1),
					"and the correct error is thrown"
				);
			});
		});

		QUnit.test("registering a developermode change with something else than 'default'", function(assert) {
			var oErrorLogStub = sandbox.stub(Log, "error");
			var mChangeHandlers = {
				myFancyControl: {
					hideControl: this.oValidChangeHandler2
				},
				myFancyFancyControl: {
					unhideControl: this.oValidChangeHandler1
				}
			};
			var mDeveloperModeHandlers = {
				hideControl: this.oValidChangeHandler1
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers(undefined, mDeveloperModeHandlers);
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.equal(oErrorLogStub.callCount, 1, "and an error was logged");
				assert.equal(oErrorLogStub.lastCall.args[0], "You can't use a custom change handler for the following Developer Mode change type: hideControl. Please use 'default' instead.", "and the error is correct");

				return ChangeHandlerStorage.getChangeHandler("hideControl", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})

			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the faulty Change Handler was not registered");
				return ChangeHandlerStorage.getChangeHandler("unhideControl", "myFancyFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			}.bind(this))
			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the other Change Handler was registered");
			}.bind(this));
		});

		QUnit.test("registering a change in the wrong layer", function(assert) {
			assert.expect(3);
			var oErrorLogStub = sandbox.stub(Log, "error");
			var mChangeHandlers = {
				myFancyControl: {
					unhideControl: {
						changeHandler: this.oValidChangeHandler1,
						layers: {
							myFancyLayer: true
						}
					}
				}
			};
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.equal(oErrorLogStub.callCount, 1, "and an error was logged");
				assert.equal(oErrorLogStub.lastCall.args[0], "The Layer 'myFancyLayer' is not supported. Please only use supported layers", "and the error is correct");

				return ChangeHandlerStorage.getChangeHandler("unhideControl", "myFancyControl", undefined, JsControlTreeModifier, "myFancyLayer");
			})

			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Change handler registered for the Control and Change type", "the function rejects");
			});
		});

		QUnit.test("getChangeHandler with a wrong layer", function(assert) {
			assert.expect(1);
			var mChangeHandlers = {
				myFancyControl: {
					unhideControl: {
						changeHandler: this.oValidChangeHandler1,
						layers: {
							CUSTOMER: false
						}
					}
				}
			};
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)

			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "unhideControl", "myFancyControl", undefined, JsControlTreeModifier, Layer.CUSTOMER))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "Change type unhideControl not enabled for layer CUSTOMER", "the function rejects");
			});
		});

		QUnit.test("instanceSpecific change handlers", function(assert) {
			var mChangeHandlers = {
				myFancyControl: {
					myFancyChangeType: {
						changeHandler: this.oValidChangeHandler1
					}
				}
			};
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/test/registry/TestChangeHandlers.flexibility");
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)

			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "doSomething", "myFancyControl", undefined, JsControlTreeModifier, Layer.CUSTOMER))
			.then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler.dummyId, "testChangeHandler-doSomething", "the instance specific change handler was returned");
			});
		});

		QUnit.test("instanceSpecific change handlers using default", function(assert) {
			var oGetModulePathStub = sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("anyString");
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["anyString"],
					stub: {
						hideControl: "default"
					}
				}
			]);
			var oControl = {foo: "bar"};
			var mChangeHandlers = {
				myFancyControl: {
					hideControl: {
						changeHandler: this.oValidChangeHandler1,
						layers: {
							CUSTOMER: false
						}
					}
				}
			};
			var mDefaultChangeHandler = {
				hideControl: this.oValidChangeHandler1
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers(mDefaultChangeHandler, {});
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)

			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "hideControl", "myFancyControl", oControl, JsControlTreeModifier, Layer.CUSTOMER))
			.then(function(oChangeHandler) {
				assert.deepEqual(oGetModulePathStub.lastCall.args[0], oControl, "the control was passed to the modifier");
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the instance specific change handler was returned");
			}.bind(this));
		});

		QUnit.test("instanceSpecific change handler - module not retrievable", function(assert) {
			assert.expect(2);
			var oErrorStub = sandbox.stub(Log, "error");
			var oControl = new Control("myControl");
			FlQUnitUtils.stubSapUiRequire(sandbox, [
				{
					name: ["sap/ui/fl/notThere.flexibility"],
					stub: new Error("myFancyError"),
					error: true
				}
			]);
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/notThere.flexibility");
			return ChangeHandlerStorage.getChangeHandler("doSomething", "myFancyControl", oControl, JsControlTreeModifier, Layer.CUSTOMER)

			.catch(function(oError) {
				assert.ok(oErrorStub.lastCall.args[0].indexOf("Flexibility registration for control myControl failed to load module") > -1, "the function rejects");
				assert.strictEqual(oError.message, "No Change handler registered for the Control and Change type", "the function rejects");
				oControl.destroy();
			});
		});

		QUnit.test("getChangeHandler with explicit registered changeHandler path", function(assert) {
			var sExplicitRegisteredChangeHandlerPath = "sap.ui.fl.changeHandler.MoveControls";
			var mChangeHandlers = {
				myFancyControl: {
					moveControls: sExplicitRegisteredChangeHandlerPath
				}
			};
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)
			.then(function() {
				return ChangeHandlerStorage.getChangeHandler("moveControls", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.then(function(oReturnedChangeHandler) {
				assert.equal(oReturnedChangeHandler, MoveControls, "then correct loaded changehandler is returned");
			});
		});
	});

	QUnit.module("ChangeHandlerStorage handles the PUBLIC layer the same way as USER", {
		beforeEach() {
			// when the library is loaded the library loads the predefined change handlers
			ChangeHandlerStorage.clearAll();

			this.oValidChangeHandler1 = {
				name: "name1",
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
			this.oValidChangeHandler2 = {
				name: "name2",
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when registering something for the USER Layer", function(assert) {
			var mChangeHandlers = {
				myFancyControl: {
					doSomething: {
						changeHandler: this.oValidChangeHandler1,
						layers: {
							USER: true
						}
					}
				}
			};
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)
			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "doSomething", "myFancyControl", undefined, JsControlTreeModifier, Layer.USER))
			.then(function(oChangeHandler) {
				assert.equal(oChangeHandler, this.oValidChangeHandler1, "the change handler is registered for the USER layer");
			}.bind(this))
			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "doSomething", "myFancyControl", undefined, JsControlTreeModifier, Layer.PUBLIC))
			.then(function(oChangeHandler) {
				assert.equal(oChangeHandler, this.oValidChangeHandler1, "the change handler is also registered for the PUBLIC layer");
			}.bind(this));
		});

		QUnit.test("when registering something for the USER Layer but not for the PUBLIC layer", function(assert) {
			var mChangeHandlers1 = {
				myFancyControl: {
					doSomething: {
						changeHandler: this.oValidChangeHandler1,
						layers: {
							USER: true,
							PUBLIC: false
						}
					}
				}
			};
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers1)
			.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "doSomething", "myFancyControl", undefined, JsControlTreeModifier, Layer.PUBLIC))
			.then(function(oChangeHandler) {
				assert.equal(oChangeHandler, this.oValidChangeHandler1, "the USER layer still determines the PUBLIC layer change handler");
			}.bind(this));
		});
	});

	QUnit.module("registerChangeHandlersForLibrary / getChangeHandler with incomplete information", {
		beforeEach() {
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getChangeHandler: CHandler not providing all functions", function(assert) {
			var oCHandler1 = {
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
			var oCHandler2 = {
				applyChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
			var oCHandler3 = {
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub()
			};
			var mChangeHandlers = {
				myFancyControl: {
					missingApply: oCHandler1,
					missingRevert: oCHandler2,
					missingComplete: oCHandler3
				}
			};

			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers)
			.then(function() {
				return ChangeHandlerStorage.getChangeHandler("missingApply", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.catch(function(oError) {
				assert.strictEqual(oError.message, "The ChangeHandler is either not available or does not have all required functions", "the correct error is thrown");

				return ChangeHandlerStorage.getChangeHandler("missingRevert", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.catch(function(oError) {
				assert.strictEqual(oError.message, "The ChangeHandler is either not available or does not have all required functions", "the correct error is thrown");

				return ChangeHandlerStorage.getChangeHandler("missingComplete", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.catch(function(oError) {
				assert.strictEqual(oError.message, "The ChangeHandler is either not available or does not have all required functions", "the correct error is thrown");
			});
		});

		QUnit.test("registerChangeHandlersForLibrary: not enough information", function(assert) {
			var mChangeHandlers = {
				myFancyControl: {
					missing: false
				}
			};

			var oLogStub = sandbox.stub(Log, "error");
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.strictEqual(oLogStub.callCount, 1, "one error was logged");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});