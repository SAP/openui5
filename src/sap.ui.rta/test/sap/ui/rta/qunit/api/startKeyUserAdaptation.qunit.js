/* global QUnit */

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/api/startKeyUserAdaptation",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	RuntimeAuthoring,
	startKeyUserAdaptation,
	FeaturesAPI,
	PersistenceWriteAPI,
	Layer,
	sinon,
	RtaQunitUtils
) {
	"use strict";
	var sandbox = sinon.createSandbox();
	var oAppComponent = RtaQunitUtils.createAndStubAppComponent(sinon);

	QUnit.module("Given startKeyUserAdaptation()", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when called with an object", function(assert) {
			sandbox.stub(FeaturesAPI, "isKeyUser").resolves(true);
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