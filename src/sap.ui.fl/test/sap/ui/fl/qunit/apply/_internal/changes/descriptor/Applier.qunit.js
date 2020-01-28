/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Applier,
	AddLibrary,
	FlexState,
	Storage,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("applyChange", {
		beforeEach: function (assert) {
			var done = assert.async();
			this.oConfig = {
				componentData: {},
				asyncHints: {},
				id: "componentId"
			};

			jQuery.getJSON("test-resources/sap/ui/fl/qunit/testResources/descriptorChanges/TestApplierManifest.json")
				.done(function(oTestApplierManifestResponse) {
					this.oManifest = oTestApplierManifestResponse;
					done();
				}.bind(this));

			this.fnGetAppDescriptorChangesSpy = sandbox.spy(FlexState, "getAppDescriptorChanges");
			this.fnApplyChangeSpy = sandbox.spy(AddLibrary, "applyChange");
		},
		afterEach: function () {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'preprocessManifest' with one descriptor change ", function (assert) {
			var aChanges = [{
				fileName: "manifest",
				namespace: "apps/target.descriptor/changes/",
				fileType: "change",
				layer: "CUSTOMER",
				reference: "target.descriptor",
				changeType: "appdescr_ui5_addLibraries",
				content: {
					libraries: {
						"descriptor.mocha133": {
							minVersion: "1.44"
						}
					}
				}
			}];

			sandbox.stub(Storage, "loadFlexData").resolves({ appDescriptorChanges: aChanges });

			return Applier.preprocessManifest(this.oManifest, this.oConfig).then(function(oNewManifest) {
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "AddLibrary.applyChange is called once");

				// library is added!
				var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
				var oExpectedNewLib = {minVersion: "1.44"};
				assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
				assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");

				var oSapmLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.m"];
				var oExpectedSapmLib = {minVersion: "1.72"};
				assert.equal(oSapmLib.minVersion, oExpectedSapmLib.minVersion, "minVersion is correct");
				assert.equal(oSapmLib.lazy, oExpectedSapmLib.lazy, "lazy is correct");

				var oSapmeLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"];
				var oExpectedSapmeLib = {minVersion: "1.71.3", lazy: true};
				assert.equal(oSapmeLib.minVersion, oExpectedSapmeLib.minVersion, "minVersion is correct");
				assert.equal(oSapmeLib.lazy, oExpectedSapmeLib.lazy, "lazy is correct");

				var oUshellLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"];
				var oExpectedUshellLib = {minVersion: "1.73.0", lazy: false};
				assert.equal(oUshellLib.minVersion, oExpectedUshellLib.minVersion, "minVersion is correct");
				assert.equal(oUshellLib.lazy, oExpectedUshellLib.lazy, "lazy is correct");
			}.bind(this));
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

			sandbox.stub(Storage, "loadFlexData").resolves({ appDescriptorChanges: aChanges });

			return Applier.preprocessManifest(this.oManifest, this.oConfig).then(function(oNewManifest) {
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 3, "AddLibrary.applyChange is called three times");

				// last change wins!
				var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
				var oExpectedNewLib = {minVersion: "1.60.9"};
				assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
				assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");

				// should be unchanged!
				var oUshellLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.ushell"];
				var oExpectedUshellLib = {minVersion: "1.73.0", lazy: false};
				assert.equal(oUshellLib.minVersion, oExpectedUshellLib.minVersion, "minVersion is correct");
				assert.equal(oUshellLib.lazy, oExpectedUshellLib.lazy, "lazy is correct");

				// should be unchanged!
				var oSapmLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.m"];
				var oExpectedSapmLib = {minVersion: "1.72"};
				assert.equal(oSapmLib.minVersion, oExpectedSapmLib.minVersion, "minVersion is correct");
				assert.equal(oSapmLib.lazy, oExpectedSapmLib.lazy, "lazy is correct");

				// should be unchanged!
				var oSapmeLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["sap.me"];
				var oExpectedSapmeLib = {minVersion: "1.71.3", lazy: true};
				assert.equal(oSapmeLib.minVersion, oExpectedSapmeLib.minVersion, "minVersion is correct");
				assert.equal(oSapmeLib.lazy, oExpectedSapmeLib.lazy, "lazy is correct");
			}.bind(this));
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

			sandbox.stub(Storage, "loadFlexData").resolves({ appDescriptorChanges: aChanges });

			return Applier.preprocessManifest(this.oManifest, this.oConfig).then(function(oNewManifest) {
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "AddLibrary.applyChange is called once");

				var oNewLib = oNewManifest["sap.ui5"]["dependencies"]["libs"]["descriptor.mocha133"];
				var oExpectedNewLib = {minVersion: "1.44"};
				assert.equal(oNewLib.minVersion, oExpectedNewLib.minVersion, "minVersion is correct");
				assert.equal(oNewLib.lazy, oExpectedNewLib.lazy, "lazy is correct");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
