/* global QUnit */

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetRegistrationIds",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetRegistrationIds,
	AppDescriptorChange,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach() {
			this.oChange1 = new AppDescriptorChange({
				content: {
					registrationIds: ["F0001"]
				}
			});
			this.oChange2 = new AppDescriptorChange({
				content: {
					registrationIds: ["F0002", "F0003"]
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' without sap.fiori/registraionIds node in manifest", function(assert) {
			var oManifest = { "sap.app": { id: "test.app"}};
			var oNewManifest = SetRegistrationIds.applyChange(oManifest, this.oChange1);
			assert.deepEqual(oNewManifest["sap.fiori"].registrationIds, ["F0001"], "sap.fiori/registraionIds is created correctly.");
		});

		QUnit.test("when calling '_applyChange' with sap.fiori/registraionIds node in manifest", function(assert) {
			var oManifest = { "sap.app": { id: "test.app"}, "sap.fiori": {registraionIds: ["random"]}};
			var oNewManifest = SetRegistrationIds.applyChange(oManifest, this.oChange2);
			assert.deepEqual(oNewManifest["sap.fiori"].registrationIds, ["F0002", "F0003"], "sap.fiori/registraionIds is overwritten correctly.");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
