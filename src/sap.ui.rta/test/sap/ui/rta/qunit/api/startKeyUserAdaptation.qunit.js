/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	RuntimeAuthoring,
	startKeyUserAdaptation,
	Element,
	UIComponent,
	Settings,
	FeaturesAPI,
	FlexUtils,
	Log,
	sinon
) {
	"use strict";
	var sandbox = sinon.sandbox.create();

	function setIsKeyUser(bIsKeyUser) {
		sandbox.stub(FeaturesAPI, "isKeyUser").resolves(bIsKeyUser);
	}

	QUnit.module("Given startKeyUserAdaptation()", {
		beforeEach: function () {
			sandbox.spy(Log, "error");
			this.fnRtaStartStub = sandbox.stub(RuntimeAuthoring.prototype, "start").resolves();
			this.aObjectsToBeDestroyed = [];
		},
		afterEach: function () {
			Settings._instance = undefined;
			this.aObjectsToBeDestroyed.forEach(function(oObject) {
				oObject.destroy();
			});
			sandbox.restore();
		}
	});

	QUnit.test("when called", function(assert) {
		var done = assert.async();
		setIsKeyUser(true);
		var oRootControl = new Element("rootControl");
		var oAppComponent = new UIComponent("appComponent");
		sandbox.stub(FlexUtils, "getAppComponentForControl")
			.callThrough()
			.withArgs(oRootControl)
			.returns(oAppComponent);
		this.aObjectsToBeDestroyed.push(oRootControl, oAppComponent);

		return startKeyUserAdaptation({rootControl: oRootControl})
			.then(function() {
				var oRta = this.fnRtaStartStub.getCall(0).thisValue;
				sandbox.stub(oRta, "destroy");
				oRta.attachEventOnce("stop", function() {
					assert.ok(oRta.destroy.calledOnce, "then destroy() was called when stop() was called");
					done();
				});
				assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "then correct root control was set");
				sandbox.stub(oRta, "_handleReloadOnExit").resolves();
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
		var oRootControl = new Element("rootControl");
		this.aObjectsToBeDestroyed.push(oRootControl);
		return startKeyUserAdaptation({rootControl: oRootControl})
			.catch(function(oError) {
				assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
				assert.ok(Log.error.calledOnce, "then an error was logged");
				assert.ok(oError instanceof Error, "then an error was thrown");
			}.bind(this));
	});

	QUnit.test("when called and flex settings could not be loaded", function(assert) {
		sandbox.stub(Settings, "getInstance").rejects();
		var oRootControl = new Element("rootControl");
		this.aObjectsToBeDestroyed.push(oRootControl);
		return startKeyUserAdaptation({rootControl: oRootControl})
			.catch(function(oError) {
				assert.ok(this.fnRtaStartStub.notCalled, "then RuntimeAuthoring.start() was not called");
				assert.ok(Log.error.calledOnce, "then an error was logged");
				assert.ok(oError instanceof Error, "then an error was thrown");
			}.bind(this));
	});

	jQuery('#qunit-fixture').hide();
});