/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetDescription"
], function(
	SetDescription
) {
	"use strict";

	QUnit.module("applyChange", {
		beforeEach() {
			this.oManifest = {
				"sap.app": {
					id: "custom.app.variant",
					description: "{{description}}"
				}};

			this.oManifestWithoutDescription = {
				"sap.app": {
					id: "custom.app.variant"
				}};
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with description", function(assert) {
			const oNewManifest = SetDescription.applyChange(this.oManifest);
			assert.equal(oNewManifest["sap.app"].description, "{{custom.app.variant_sap.app.description}}");
		});

		QUnit.test("when calling '_applyChange' with description and empty manifest", function(assert) {
			const oNewManifest = SetDescription.applyChange(this.oManifestWithoutDescription);
			assert.equal(oNewManifest["sap.app"].description, "{{custom.app.variant_sap.app.description}}");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
