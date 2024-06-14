/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetCloudDevAdaptationStatus",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetCloudDevAdaptationStatus,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = { "sap.fiori": { cloudDevAdaptationStatus: "released" }};
			this.oManifestEmpty = {};

			this.oChangeReleased = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: "released"} });
			this.oChangeDeprecated = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: "deprecated"} });
			this.oChangeObsolete = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: "obsolete"} });
			this.oChangeEmpty = new AppDescriptorChange({ content: { } });
			this.oChangeError = new AppDescriptorChange({ content: { otherProperty: "test" } });
			this.oChangeObject = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: {} } });
			this.oChangeArray = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: [] } });
			this.oChangeInt = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: 1 } });
			this.oChangeBoolean = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: true } });
			this.oChangeUnsupported = new AppDescriptorChange({ content: { cloudDevAdaptationStatus: "rElEaSeD"} });
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with supported status", function(assert) {
			var oNewManifest = SetCloudDevAdaptationStatus.applyChange(this.oManifestEmpty, this.oChangeReleased);
			assert.equal(oNewManifest["sap.fiori"].cloudDevAdaptationStatus, "released", "cloudDevAdaptationStatus is set correctly");

			oNewManifest = SetCloudDevAdaptationStatus.applyChange(oNewManifest, this.oChangeDeprecated);
			assert.equal(oNewManifest["sap.fiori"].cloudDevAdaptationStatus, "deprecated", "cloudDevAdaptationStatus is updated correctly");

			oNewManifest = SetCloudDevAdaptationStatus.applyChange(oNewManifest, this.oChangeObsolete);
			assert.equal(oNewManifest["sap.fiori"].cloudDevAdaptationStatus, "obsolete", "cloudDevAdaptationStatus is updated correctly");
		});

		QUnit.test("when calling '_applyChange' with incorrect type or content and unsupported status", function(assert) {
			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeError);
			}, Error("No cloudDevAdaptationStatus in change content provided"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeEmpty);
			}, Error("No cloudDevAdaptationStatus in change content provided"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeObject);
			}, Error("The current change value type of property cloudDevAdaptationStatus is 'object'. Only allowed type for poperty cloudDevAdaptationStatus is string"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeArray);
			}, Error("The current change value type of property cloudDevAdaptationStatus is 'object'. Only allowed type for poperty cloudDevAdaptationStatus is string"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeInt);
			}, Error("The current change value type of property cloudDevAdaptationStatus is 'number'. Only allowed type for poperty cloudDevAdaptationStatus is string"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeBoolean);
			}, Error("The current change value type of property cloudDevAdaptationStatus is 'boolean'. Only allowed type for poperty cloudDevAdaptationStatus is string"),
			"throws error");

			assert.throws(function() {
				SetCloudDevAdaptationStatus.applyChange(this.oManifest, this.oChangeUnsupported);
			}, Error("The current change value of property cloudDevAdaptationStatus is 'rElEaSeD'. Supported values for property cloudDevAdaptationStatus are released|deprecated|obsolete"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
