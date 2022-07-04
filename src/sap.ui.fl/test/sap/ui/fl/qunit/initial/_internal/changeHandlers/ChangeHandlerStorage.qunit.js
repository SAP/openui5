/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Control",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	JsControlTreeModifier,
	Control,
	ChangeHandlerStorage,
	Layer,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("ChangeHandlerStorage without standard predefined change handlers", {
		beforeEach: function() {
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
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("registerPredefinedChangeHandlers", function(assert) {
			var sChangeType = "myFancyChangeType";

			var mChangeHandlers = {};
			mChangeHandlers[sChangeType] = this.oValidChangeHandler1;
			ChangeHandlerStorage.registerPredefinedChangeHandlers(undefined, mChangeHandlers);
			return ChangeHandlerStorage.getChangeHandler(sChangeType, "", undefined, JsControlTreeModifier, Layer.VENDOR).then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler, this.oValidChangeHandler1, "the change handler is returned");
			}.bind(this));
		});

		QUnit.test("registerChangeHandlersForLibrary", function(assert) {
			assert.expect(6);
			var oErrorLogStub = sandbox.stub(Log, "error");
			var oRequireStub = sandbox.stub(sap.ui, "require");
			oRequireStub
				.withArgs(["sap/ui/fl/notThere.flexibility"])
				.callsFake(function(sModuleName, fnSuccess, fnError) {
					fnError(new Error("myFancyError"));
				});
			oRequireStub.callThrough();
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
				return ChangeHandlerStorage.getChangeHandler("hideControl", "myFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})

			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the default Change Handler was registered");

				return ChangeHandlerStorage.getChangeHandler("doSomethingElse", "myNotSoFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			}.bind(this))
			.then(function(oChangeHandler) {
				assert.ok(oChangeHandler, "the change handlers in the flexibility file were registered");

				return ChangeHandlerStorage.getChangeHandler("doSomething", "myNotSoFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.then(function(oChangeHandler) {
				assert.ok(oChangeHandler, "the change handlers in the flexibility file were registered");

				return ChangeHandlerStorage.getChangeHandler("unhideControl", "myFancyFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			})
			.then(function(oChangeHandler) {
				assert.deepEqual(oChangeHandler, this.oValidChangeHandler1, "the default Change Handler was registered");

				return ChangeHandlerStorage.getChangeHandler("hideControl", "myUnavailableFancyControl", undefined, JsControlTreeModifier, Layer.VENDOR);
			}.bind(this))
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No Change handler registered for the Control and Change type", "the function rejects");
				assert.ok(oErrorLogStub.lastCall.args[0].indexOf("Flexibility change handler registration failed.\nControlType: myUnavailableFancyControl\n") > -1, "and the correct error is thrown");
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
			var oRequireStub = sandbox.stub(sap.ui, "require");
			oRequireStub
				.withArgs(["anyString"])
				.callsFake(function(sModuleName, fnSuccess) {
					fnSuccess({
						hideControl: "default"
					});
				});
			oRequireStub.callThrough();
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
			var oRequireStub = sandbox.stub(sap.ui, "require");
			oRequireStub
				.withArgs(["sap/ui/fl/notThere.flexibility"])
				.callsFake(function(sModuleName, fnSuccess, fnError) {
					fnError(new Error("myFancyError"));
				});
			oRequireStub.callThrough();
			sandbox.stub(JsControlTreeModifier, "getChangeHandlerModulePath").returns("sap/ui/fl/notThere.flexibility");
			return ChangeHandlerStorage.getChangeHandler("doSomething", "myFancyControl", oControl, JsControlTreeModifier, Layer.CUSTOMER)

			.catch(function(oError) {
				assert.ok(oErrorStub.lastCall.args[0].indexOf("Flexibility registration for control myControl failed to load module") > -1, "the function rejects");
				assert.strictEqual(oError.message, "No Change handler registered for the Control and Change type", "the function rejects");
				oControl.destroy();
			});
		});
	});

	QUnit.module("ChangeHandlerStorage handles the PUBLIC layer the same way as USER", {
		beforeEach: function() {
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
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when registering something for the USER Layer", function (assert) {
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
				.then(function (oChangeHandler) {
					assert.equal(oChangeHandler, this.oValidChangeHandler1, "the change handler is registered for the USER layer");
				}.bind(this))
				.then(ChangeHandlerStorage.getChangeHandler.bind(undefined, "doSomething", "myFancyControl", undefined, JsControlTreeModifier, Layer.PUBLIC))
				.then(function (oChangeHandler) {
					assert.equal(oChangeHandler, this.oValidChangeHandler1, "the change handler is also registered for the PUBLIC layer");
				}.bind(this));
		});

		QUnit.test("when registering something for the USER Layer but not for the PUBLIC layer", function (assert) {
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
				.then(function (oChangeHandler) {
					assert.equal(oChangeHandler, this.oValidChangeHandler1, "the USER layer still determines the PUBLIC layer change handler");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});