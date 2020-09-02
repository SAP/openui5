/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startAdaptation",
	"sap/ui/core/Element",
	"sap/ui/core/UIComponent",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function(
	RuntimeAuthoring,
	startAdaptation,
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

	QUnit.module("Given startAdaptation()", {
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

	QUnit.test("when called with valid parameters", function(assert) {
		setIsKeyUser(true);
		var oRootControl = new Element("rootControl");
		var oAppComponent = new UIComponent("appComponent");
		sandbox.stub(FlexUtils, "getAppComponentForControl")
			.callThrough()
			.withArgs(oRootControl)
			.returns(oAppComponent);
		this.aObjectsToBeDestroyed.push(oRootControl, oAppComponent);
		var oLoadPluginsStub = sandbox.stub().resolves();
		var oOnLoadStub = sandbox.stub();
		var oOnFailedStub = sandbox.stub();
		var oOnStopStub = sandbox.stub();

		return startAdaptation(
			{
				rootControl: oRootControl,
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
			assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "then correct root control was set");
		});
	});

	QUnit.test("when called with an invalid layer setting", function(assert) {
		setIsKeyUser(true);
		var sTestLayer = "TESTLAYER";
		var oRootControl = new Element("rootControl");
		this.aObjectsToBeDestroyed.push(oRootControl);
		return startAdaptation({
			rootControl: oRootControl,
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
		var oRootControl = new Element("rootControl");
		this.aObjectsToBeDestroyed.push(oRootControl);
		return startAdaptation({
			rootControl: oRootControl,
			flexSettings: {
				layer: sTestLayer,
				developerMode: true
			}
		}).then(function() {
			assert.ok(this.fnRtaStartStub.calledOnce, "then RuntimeAuthoring.start() is called");
			assert.ok(Log.error.notCalled, "then no error was logged");
		}.bind(this));
	});

	jQuery('#qunit-fixture').hide();
});