/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/SetMinUI5Version",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetMinUI5Version,
	Change,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				content: {
					minUI5Version: "1.75.3"
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with a change containing one library downgrade", function (assert) {
			var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.72.0"} }};
			var oNewManifest = SetMinUI5Version.applyChange(oManifest, this.oChange);
			assert.equal(oNewManifest["sap.ui5"].dependencies.minUI5Version, "1.75.3", "minUI5Version is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with a change containing one library upgrade", function (assert) {
			var oManifest = { "sap.ui5": { dependencies: { minUI5Version: "1.77"} }};
			var oNewManifest = SetMinUI5Version.applyChange(oManifest, this.oChange);
			assert.equal(oNewManifest["sap.ui5"].dependencies.minUI5Version, "1.77", "minUI5Version is updated correctly.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
