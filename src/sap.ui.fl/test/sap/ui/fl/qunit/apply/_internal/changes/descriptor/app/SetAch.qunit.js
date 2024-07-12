/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetAch",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetAch,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = { "sap.app": { ach: "CA-UI5-ABA" }};
			this.oManifestEmpty = {};

			this.oChange = new AppDescriptorChange({ content: { ach: "CA-UI5-ABA-AIDX"} });
			this.oChangeEmpty = new AppDescriptorChange({ content: { } });
			this.oChangeError = new AppDescriptorChange({ content: { otherProperty: "test" } });
			this.oChangeObject = new AppDescriptorChange({ content: { ach: {} } });
			this.oChangeArray = new AppDescriptorChange({ content: { ach: [] } });
			this.oChangeInt = new AppDescriptorChange({ content: { ach: 1 } });
			this.oChangeBoolean = new AppDescriptorChange({ content: { ach: true } });
			this.oChangeUnsupported = new AppDescriptorChange({ content: { ach: "NOT-SUPPORTED-ACH"} });
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with supported ach regex", function(assert) {
			let oNewManifest = SetAch.applyChange(this.oManifest, this.oChange);
			assert.equal(oNewManifest["sap.app"].ach, "CA-UI5-ABA-AIDX", "ach is updated correctly");

			oNewManifest = SetAch.applyChange(this.oManifestEmpty, this.oChange);
			assert.equal(oNewManifest["sap.app"].ach, "CA-UI5-ABA-AIDX", "ach is set correctly");
		});

		QUnit.test("when calling '_applyChange' with incorrect type or content and unsupported ach regex", function(assert) {
			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeError);
			}, Error("No 'Application Component Hierarchy' (ACH) in change content provided"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeEmpty);
			}, Error("No 'Application Component Hierarchy' (ACH) in change content provided"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeObject);
			}, Error("The current change value type of property ach is 'object'. Only allowed type for poperty ach is string"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeArray);
			}, Error("The current change value type of property ach is 'object'. Only allowed type for poperty ach is string"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeInt);
			}, Error("The current change value type of property ach is 'number'. Only allowed type for poperty ach is string"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeBoolean);
			}, Error("The current change value type of property ach is 'boolean'. Only allowed type for poperty ach is string"),
			"throws error");

			assert.throws(function() {
				SetAch.applyChange(this.oManifest, this.oChangeUnsupported);
			}, Error("The current change value of property ach is 'NOT-SUPPORTED-ACH'. Supported values for property ach is the regular expression /^([a-zA-Z0-9]{2,3})(-[a-zA-Z0-9]{1,6})*$/"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
