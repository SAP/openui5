/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetTitle,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with title", function (assert) {
			var oManifest = {
				"sap.app": {
					id: "custom.app.variant",
					title: "{{title}}"
				}
			};
			var oNewManifest = SetTitle.applyChange(oManifest);
			assert.equal(oNewManifest["sap.app"].title, "{{custom.app.variant_sap.app.title}}");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
