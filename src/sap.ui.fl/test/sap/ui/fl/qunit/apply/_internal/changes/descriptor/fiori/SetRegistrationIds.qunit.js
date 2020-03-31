/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	SetRegistrationIds,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange1 = new Change({
				content: {
					registrationIds: ["F0001"]
				}
			});
			this.oChange2 = new Change({
				content: {
					registrationIds: ["F0002", "F0003"]
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' without sap.fiori/registraionIds node in manifest", function (assert) {
			var oManifest = { "sap.app": { id: "test.app"}};
			var oNewManifest = SetRegistrationIds.applyChange(oManifest, this.oChange1);
			assert.deepEqual(oNewManifest["sap.fiori"].registrationIds, ["F0001"], "sap.fiori/registraionIds is created correctly.");
		});

		QUnit.test("when calling '_applyChange' with sap.fiori/registraionIds node in manifest", function (assert) {
			var oManifest = { "sap.app": { id: "test.app"}, "sap.fiori": {registraionIds: ["random"]}};
			var oNewManifest = SetRegistrationIds.applyChange(oManifest, this.oChange2);
			assert.deepEqual(oNewManifest["sap.fiori"].registrationIds, ["F0002", "F0003"], "sap.fiori/registraionIds is overwritten correctly.");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
