/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	InitialFlexAPI,
	PersistenceWriteAPI,
	Layer,
	startKeyUserAdaptation,
	RuntimeAuthoring,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	QUnit.module("Given startKeyUserAdaptation()", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with an object", function(assert) {
			sandbox.stub(InitialFlexAPI, "isKeyUser").resolves(true);
			sandbox.stub(RuntimeAuthoring.prototype, "start");
			sandbox.stub(PersistenceWriteAPI, "getChangesWarning").resolves({});
			return startKeyUserAdaptation({
				rootControl: oAppComponent
			})
			.then(function(oRta) {
				var oExpectedSettings = {
					developerMode: false,
					layer: Layer.CUSTOMER
				};
				assert.deepEqual(oRta.getFlexSettings(), oExpectedSettings, "the flex settings were properly set");
				assert.strictEqual(oRta.getRootControl(), oAppComponent.getId(), "then correct root control was set");
			});
		});
	});

	QUnit.done(function() {
		oAppComponent.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});