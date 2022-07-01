/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/fiori/SetAbstract",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/sinon-4"
], function(
	SetAbstract,
	Change,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("applyChange", {
		beforeEach: function () {
			this.oChange = new Change({
				content: {
					"abstract": false
				}
			});

			this.oManifestEmpty = {};

			this.oChangeAbstractSetTrue = new Change({ content: { "abstract": true } });
			this.oChangeEmpty = new Change({ content: { } });
			this.oChangeError = new Change({ content: { otherFlag: "test" } });
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling '_applyChange' with abstract set to false", function (assert) {
			var oNewManifest = SetAbstract.applyChange(this.oManifestEmpty, this.oChange);
			assert.equal(oNewManifest["sap.fiori"].abstract, false, "abstract is set correctly.");

			oNewManifest = SetAbstract.applyChange(oNewManifest, this.oChange); //abstract is already set in manifest
			assert.equal(oNewManifest["sap.fiori"].abstract, false, "abstract is updated correctly.");
		});

		QUnit.test("when calling '_applyChange' with incorrect change content", function (assert) {
			assert.throws(function() {
				SetAbstract.applyChange(this.oManifestEmpty, this.oChangeAbstractSetTrue);
			}, Error("The current change value of property abstract is 'true'. Only allowed value for property abstract is boolean 'false'"),
			"throws error");

			var oManifest = { "sap.fiori": { "abstract": false }}; //abstract is not set in manifest

			assert.throws(function() {
				SetAbstract.applyChange(oManifest, this.oChangeAbstractSetTrue);
			}, Error("The current change value of property abstract is 'true'. Only allowed value for property abstract is boolean 'false'"),
			"throws error");

			assert.throws(function() {
				SetAbstract.applyChange(oManifest, this.oChangeError);
			}, Error("No abstract in change content provided"),
			"throws error");

			assert.throws(function() {
				SetAbstract.applyChange(oManifest, this.oChangeEmpty);
			}, Error("No abstract in change content provided"),
			"throws error");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
