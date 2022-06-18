/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startAdaptation",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	RuntimeAuthoring,
	startAdaptation,
	FeaturesAPI,
	PersistenceWriteAPI,
	Layer,
	jQuery,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	QUnit.module("Given startAdaptation()", {
		beforeEach: function () {
			sandbox.stub(RuntimeAuthoring.prototype, "start");
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with valid parameters", function(assert) {
			var oLoadPluginsStub = sandbox.stub().resolves();
			var oOnStartStub = sandbox.stub();
			var oOnFailedStub = sandbox.stub();
			var oOnStopStub = sandbox.stub();

			return startAdaptation(
				{
					rootControl: oAppComponent,
					flexSettings: {
						layer: Layer.USER,
						developerMode: false
					}
				},
				oLoadPluginsStub,
				oOnStartStub,
				oOnFailedStub,
				oOnStopStub
			).then(function(oRta) {
				assert.ok(oLoadPluginsStub.calledOnce, "then the passed plugin modifier function is called");
				assert.deepEqual(oRta.getFlexSettings(), {layer: Layer.USER, developerMode: false}, "the flexSettings are correct");
				assert.strictEqual(oRta.mEventRegistry.start.pop().fFunction, oOnStartStub, "then the passed on start handler is registered as event handler");
				assert.strictEqual(oRta.mEventRegistry.failed.pop().fFunction, oOnFailedStub, "then the passed on failed handler is registered as event handler");
				assert.strictEqual(oRta.mEventRegistry.stop.pop().fFunction, oOnStopStub, "then the passed on stop handler is registered as event handler");
				assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "then correct root control was set");
			});
		});

		QUnit.test("when called without flexSettings", function(assert) {
			var oLoadPluginsStub = sandbox.stub().resolves();
			var oOnStartStub = sandbox.stub();
			var oOnFailedStub = sandbox.stub();
			var oOnStopStub = sandbox.stub();
			sandbox.stub(FeaturesAPI, "isKeyUser").resolves(true);

			return startAdaptation(
				{
					rootControl: oAppComponent
				},
				oLoadPluginsStub,
				oOnStartStub,
				oOnFailedStub,
				oOnStopStub
			).then(function(oRta) {
				assert.ok(oLoadPluginsStub.calledOnce, "then the passed plugin modifier function is called");
				assert.deepEqual(oRta.getFlexSettings(), {layer: Layer.CUSTOMER, developerMode: false}, "the default flexSettings are passed");
				assert.strictEqual(oRta.mEventRegistry.start.pop().fFunction, oOnStartStub, "then the passed on start handler is registered as event handler");
				assert.strictEqual(oRta.mEventRegistry.failed.pop().fFunction, oOnFailedStub, "then the passed on failed handler is registered as event handler");
				assert.strictEqual(oRta.mEventRegistry.stop.pop().fFunction, oOnStopStub, "then the passed on stop handler is registered as event handler");
				assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "then correct root control was set");
			});
		});

		QUnit.test("when called with an invalid layer setting", function(assert) {
			return startAdaptation({
				rootControl: oAppComponent,
				flexSettings: {
					layer: "testLayer"
				}
			}).catch(function(oError) {
				assert.ok(oError instanceof Error, "then promise was rejected with an error");
				assert.strictEqual(oError.message, "An invalid layer is passed", "then the correct message is returned");
			});
		});
	});

	QUnit.done(function() {
		oAppComponent.destroy();
		jQuery("#qunit-fixture").hide();
	});
});