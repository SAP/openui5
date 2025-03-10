/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/app/SetTitle",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetTitle,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with title", function(assert) {
			const oManifest = {
				"sap.app": {
					id: "custom.app.variant",
					title: "{{title}}"
				}
			};
			const oNewManifest = SetTitle.applyChange(oManifest);
			assert.equal(oNewManifest["sap.app"].title, "{{custom.app.variant_sap.app.title}}");
		});

		QUnit.test("when calling 'getCondenserInfo'", function(assert) {
			const oCondenserInfo = SetTitle.getCondenserInfo();
			assert.equal(oCondenserInfo.classification, "lastOneWins");
			assert.equal(oCondenserInfo.uniqueKey, "manifestSetTitle");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
