/*global QUnit*/

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerStorage",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	ChangeHandlerStorage,
	jQuery,
	sinon
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	QUnit.module("ChangeHandlerStorage without standard predefined change handlers", {
		beforeEach: function() {
			// when the library is loaded the library loads the predefined change handlers
			ChangeHandlerStorage.clearAll();

			this.oValidChangeHandler = {
				applyChange: sandbox.stub(),
				revertChange: sandbox.stub(),
				completeChangeContent: sandbox.stub()
			};
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("registerPredefinedChangeHandlers / getDeveloperModeChangeChangeRegistryItem", function(assert) {
			var sChangeType = "myFancyChangeType";
			assert.notOk(ChangeHandlerStorage.getDeveloperModeChangeChangeRegistryItem(sChangeType), "the change type was not registered yet");

			var mChangeHandlers = {};
			mChangeHandlers[sChangeType] = this.oValidChangeHandler;
			ChangeHandlerStorage.registerPredefinedChangeHandlers(undefined, mChangeHandlers);
			var oChangeRegistryItem = ChangeHandlerStorage.getDeveloperModeChangeChangeRegistryItem(sChangeType);
			return oChangeRegistryItem.getChangeHandler().then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler, this.oValidChangeHandler, "the change handler is returned");
			}.bind(this));
		});

		QUnit.test("registerChangeHandlersForLibrary", function(assert) {
			var oErrorLogStub = sandbox.stub(Log, "error");
			var oRequireStub = sandbox.stub(sap.ui, "require");
			oRequireStub.withArgs(["sap/ui/fl/notThere.flexibility"])
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
					unhideControl: this.oValidChangeHandler
				}
			};
			var mDefaultChangeHandler = {
				hideControl: this.oValidChangeHandler
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers(mDefaultChangeHandler, {});
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.ok(ChangeHandlerStorage.isChangeHandlerRegistered("myFancyControl", "hideControl"), "the default Change Handler was registered");
				assert.ok(ChangeHandlerStorage.isChangeHandlerRegistered("myNotSoFancyControl", "doSomethingElse"), "the change handlers in the flexibility file were registered");
				assert.ok(ChangeHandlerStorage.isChangeHandlerRegistered("myNotSoFancyControl", "doSomething"), "the change handlers in the flexibility file were registered");
				assert.ok(ChangeHandlerStorage.isChangeHandlerRegistered("myFancyFancyControl", "unhideControl"), "the default Change Handler was registered");
				assert.notOk(ChangeHandlerStorage.isChangeHandlerRegistered("myUnavailableFancyControl", "hideControl"), "the faulty Change Handler was not registered");
				assert.ok(oErrorLogStub.lastCall.args[0].indexOf("Flexibility change handler registration failed.\nControlType: myUnavailableFancyControl\n") > -1, "and the correct error is thrown");

				var oChangeRegistryItem = ChangeHandlerStorage.getRegistryItem("myFancyFancyControl", "unhideControl");
				return oChangeRegistryItem.getChangeHandler();
			})
			.then(function(oChangeHandler) {
				assert.strictEqual(oChangeHandler, this.oValidChangeHandler, "the change handler is returned");
			}.bind(this));
		});

		QUnit.test("registering a developermode change with something else than 'default'", function(assert) {
			var oErrorLogStub = sandbox.stub(Log, "error");
			var mChangeHandlers = {
				myFancyControl: {
					hideControl: this.oValidChangeHandler
				},
				myFancyFancyControl: {
					unhideControl: this.oValidChangeHandler
				}
			};
			var mDeveloperModeHandlers = {
				hideControl: this.oValidChangeHandler
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers(undefined, mDeveloperModeHandlers);
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.notOk(ChangeHandlerStorage.isChangeHandlerRegistered("myFancyControl", "hideControl"), "the faulty Change Handler was not registered");
				assert.equal(oErrorLogStub.callCount, 1, "and an error was logged");
				assert.equal(oErrorLogStub.lastCall.args[0], "You can't use a custom change handler for the following Developer Mode change type: hideControl. Please use 'default' instead.", "and the error is correct");
				assert.ok(ChangeHandlerStorage.isChangeHandlerRegistered("myFancyFancyControl", "unhideControl"), "the other Change Handler was registered");
			});
		});

		QUnit.test("registering a change in the wrong layer", function(assert) {
			var oErrorLogStub = sandbox.stub(Log, "error");
			var mChangeHandlers = {
				myFancyControl: {
					unhideControl: {
						changeHandler: this.oValidChangeHandler,
						layers: {
							myFancyLayer: true
						}
					}
				}
			};
			ChangeHandlerStorage.registerPredefinedChangeHandlers({}, {});
			return ChangeHandlerStorage.registerChangeHandlersForLibrary(mChangeHandlers).then(function() {
				assert.notOk(ChangeHandlerStorage.isChangeHandlerRegistered("myFancyControl", "unhideControl"), "the faulty Change Handler was not registered");
				assert.equal(oErrorLogStub.callCount, 1, "and an error was logged");
				assert.equal(oErrorLogStub.lastCall.args[0], "The Layer 'myFancyLayer' is not supported. Please only use supported layers", "and the error is correct");
			});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});