/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/Change",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Applier,
	AddLibrary,
	Change,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	function convertChanges(aChanges) {
		return aChanges.map(function(oChange) {
			return new Change(oChange);
		});
	}

	QUnit.module("applyChange", {
		beforeEach: function (assert) {
			var done = assert.async();

			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/TestApplierManifest.json")
				.done(function(oTestApplierManifestResponse) {
					this.oManifest = oTestApplierManifestResponse;
					done();
				}.bind(this));

			this.fnApplyChangeSpy = sandbox.spy(AddLibrary, "applyChange");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'preprocessManifest' with one descriptor change ", function (assert) {
			var aChanges = [{
				changeType: "appdescr_ui5_addLibraries",
				content: {
					libraries: {
						"descriptor.mocha133": {
							minVersion: "1.44"
						}
					}
				}
			}];

			aChanges = convertChanges(aChanges);

			var oNewManifest = Applier.applyChanges(this.oManifest, aChanges);
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "AddLibrary.applyChange is called once");

			// library is added!
			var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
			var oExpectedNewLib = {minVersion: "1.44"};
			assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
			assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
		});

		QUnit.test("when calling 'preprocessManifest' with three conflicting 'appdescr_ui5_addLibraries' changes ", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.40.0"
							}
						}
					}
				}, {
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.60.9"
							}
						}
					}
				}
			];

			aChanges = convertChanges(aChanges);

			var oNewManifest = Applier.applyChanges(this.oManifest, aChanges);
			assert.equal(this.fnApplyChangeSpy.callCount, 3, "AddLibrary.applyChange is called three times");

			// last change wins!
			var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
			var oExpectedNewLib = {minVersion: "1.60.9"};
			assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
			assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
		});

		QUnit.test("when calling 'preprocessManifest' with several change types ", function (assert) {
			var aChanges = [
				{
					changeType: "appdescr_ui5_addLibraries",
					content: {
						libraries: {
							"descriptor.mocha133": {
								minVersion: "1.44"
							}
						}
					}
				}, {
					changeType: "appdescr_ovp_addNewCard",
					content: {}
				}, {
					changeType: "appdescr_app_addNewInbound",
					content: {}
				}
			];

			aChanges = convertChanges(aChanges);

			var oNewManifest = Applier.applyChanges(this.oManifest, aChanges);
			assert.equal(this.fnApplyChangeSpy.callCount, 1, "AddLibrary.applyChange is called once");

			var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
			var oExpectedNewLib = {minVersion: "1.44"};
			assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
			assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
