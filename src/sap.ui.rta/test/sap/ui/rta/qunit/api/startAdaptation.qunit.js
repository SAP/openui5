/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startAdaptation",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	RuntimeAuthoring,
	startAdaptation,
	Settings,
	FeaturesAPI,
	Log,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();

	function setIsKeyUser(bIsKeyUser) {
		sandbox.stub(FeaturesAPI, "isKeyUser").resolves(bIsKeyUser);
	}

	QUnit.module("Given startAdaptation()", {
		beforeEach: function () {
			sandbox.spy(Log, "error");
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.fnRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").resolves();
		},
		afterEach: function () {
			Settings._instance = undefined;
			this.oMockedAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with valid parameters", function(assert) {
			setIsKeyUser(true);
			var oLoadPluginsStub = sandbox.stub().resolves();
			var oOnLoadStub = sandbox.stub();
			var oOnFailedStub = sandbox.stub();
			var oOnStopStub = sandbox.stub();

			return startAdaptation(
				{
					rootControl: this.oMockedAppComponent,
					flexSettings: {
						layer: "CUSTOMER",
						developerMode: true
					}
				},
				oLoadPluginsStub,
				oOnLoadStub,
				oOnFailedStub,
				oOnStopStub
			).then(function(oRta) {
				assert.ok(oLoadPluginsStub.calledOnce, "then the passed plugin modifier function is called");
				assert.strictEqual(oRta.mEventRegistry.start.pop().fFunction, oOnLoadStub, "then the passed on load handler is registered on eventhandler");
				assert.strictEqual(oRta.mEventRegistry.failed.pop().fFunction, oOnFailedStub, "then the passed on failed handler is registered on eventhandler");
				assert.strictEqual(oRta.mEventRegistry.stop.pop().fFunction, oOnStopStub, "then the passed on stop handler is registered on eventhandler");
				assert.strictEqual(oRta.getRootControl(), this.oMockedAppComponent.getId(), "then correct root control was set");
			}.bind(this));
		});

		QUnit.test("when called with an invalid layer setting", function(assert) {
			setIsKeyUser(true);
			var sTestLayer = "TESTLAYER";
			return startAdaptation({
				rootControl: this.oMockedAppComponent,
				flexSettings: {
					layer: sTestLayer,
					developerMode: true
				}
			}).catch(function(oError) {
				assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
				assert.ok(oError instanceof Error, "then promise was rejected with an error");
				assert.strictEqual(oError.message, "An invalid layer is passed", "then the correct message is returned");
			}.bind(this));
		});

		QUnit.test("when called with an invalid root control", function(assert) {
			setIsKeyUser(true);
			return startAdaptation({rootControl: {}})
				.catch(function(oError) {
					assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
					assert.ok(oError instanceof Error, "then promise was rejected with an error");
					assert.strictEqual(oError.message, "An invalid root control was passed", "then the correct message is returned");
				}.bind(this));
		});

		QUnit.test("when called with 'user' layer and the user is not a key user", function(assert) {
			setIsKeyUser(false);
			var sTestLayer = "USER";
			return startAdaptation({
				rootControl: this.oMockedAppComponent,
				flexSettings: {
					layer: sTestLayer,
					developerMode: true
				}
			}).then(function() {
				assert.ok(this.fnRtaStartStub.calledOnce, "then RuntimeAuthoring.start() is called");
				assert.ok(Log.error.notCalled, "then no error was logged");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});