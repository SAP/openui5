/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetFlexExtensionPointEnabled",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	SetFlexExtensionPointEnabled,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				content: {
					flexExtensionPointEnabled: "true"
				}
			});

			this.oChangeFalse = new Change({
				content: {
					flexExtensionPointEnabled: "false"
				}
			});

			this.oChangeEmpty = new Change({ content: { } });
			this.oChangeError = new Change({ content: { otherFlag: "test" } });
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with flexExtensionPointEnabled set to false", function (assert) {
			var oManifest = { "sap.ui5": { flexExtensionPointEnabled: "false" }};
			var oNewManifest = SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChange);
			assert.equal(oNewManifest["sap.ui5"].flexExtensionPointEnabled, "true", "flexExtensionPointEnabled is updated correctly.");

			oNewManifest = SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChangeFalse);
			assert.equal(oNewManifest["sap.ui5"].flexExtensionPointEnabled, "false", "flexExtensionPointEnabled is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with flexExtensionPointEnabled set to true", function (assert) {
			var oManifest = { "sap.ui5": { flexExtensionPointEnabled: "true" }};
			var oNewManifest = SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChange);
			assert.equal(oNewManifest["sap.ui5"].flexExtensionPointEnabled, "true", "flexExtensionPointEnabled is updated correctly.");

			oNewManifest = SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChangeFalse);
			assert.equal(oNewManifest["sap.ui5"].flexExtensionPointEnabled, "false", "flexExtensionPointEnabled is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change without sap.ui5/flexExtensionPointEnabled", function (assert) {
			var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.77"} }};
			var oNewManifest = SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChange);
			assert.equal(oNewManifest["sap.ui5"].flexExtensionPointEnabled, "true", "flexExtensionPointEnabled is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with incorrect change content", function (assert) {
			var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.77"} }};
			assert.throws(function() {
				SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChangeError);
			}, Error("No flexExtensionPointEnabled in change content provided"),
			"throws error");
			assert.throws(function() {
				SetFlexExtensionPointEnabled.applyChange(oManifest, this.oChangeEmpty);
			}, Error("No flexExtensionPointEnabled in change content provided"),
			"throws error");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
