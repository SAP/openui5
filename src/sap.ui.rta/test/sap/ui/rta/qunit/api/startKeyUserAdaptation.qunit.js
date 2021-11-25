/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	RuntimeAuthoring,
	startKeyUserAdaptation,
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

	QUnit.module("Given startKeyUserAdaptation()", {
		beforeEach: function () {
			sandbox.spy(Log, "error");
			this.oMockedAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox);
			this.fnRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").resolves();
			this.aObjectsToBeDestroyed = [];
		},
		afterEach: function () {
			Settings._instance = undefined;
			this.oMockedAppComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called and restart is not needed", function(assert) {
			var done = assert.async();
			setIsKeyUser(true);
			startKeyUserAdaptation({rootControl: this.oMockedAppComponent})
				.then(function() {
					var oRta = this.fnRtaStartStub.getCall(0).thisValue;
					sandbox.stub(oRta, "destroy");
					oRta.attachEventOnce("stop", function() {
						assert.ok(oRta.destroy.calledOnce, "then destroy() was called when stop() was called");
						done();
					});
					assert.strictEqual(oRta.getRootControl(), this.oMockedAppComponent.getId(), "then correct root control was set");
					sandbox.stub(oRta, "_handleReloadOnExit").resolves(oRta._RELOAD.NOT_NEEDED);
					oRta.stop(true);
				}.bind(this));
		});

		QUnit.test("when called with an invalid root control", function(assert) {
			setIsKeyUser(true);
			return startKeyUserAdaptation({rootControl: {}})
				.catch(function(oError) {
					assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
					assert.ok(oError instanceof Error, "then promise was rejected with an error");
				}.bind(this));
		});

		QUnit.test("when called and the user is not a key user", function(assert) {
			setIsKeyUser(false);
			return startKeyUserAdaptation({rootControl: this.oMockedAppComponent})
				.catch(function(oError) {
					assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
					assert.ok(oError instanceof Error, "then an error was thrown");
				}.bind(this));
		});

		QUnit.test("when called and flex settings could not be loaded", function(assert) {
			sandbox.stub(Settings, "getInstance").rejects();
			return startKeyUserAdaptation({rootControl: this.oMockedAppComponent})
				.catch(function(oError) {
					assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
					assert.ok(oError instanceof Error, "then an error was thrown");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});