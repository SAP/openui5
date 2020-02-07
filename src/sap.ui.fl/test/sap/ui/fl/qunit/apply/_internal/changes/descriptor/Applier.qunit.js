/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Applier,
	AddLibrary,
	FlexState,
	Storage,
	LrepConnector,
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

		QUnit.test("when calling 'preprocessManifest' with empty oManifest object ", function (assert) {
			return Applier.preprocessManifest({}, this.oConfig).then(function() {
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 0, "FlexState.getAppDescriptorChanges is not called");
				assert.equal(this.fnApplyChangeSpy.callCount, 0, "AddLibrary.applyChange is not called");
			}.bind(this));
		});

		QUnit.test("when calling 'preprocessManifest' with component manifest ", function (assert) {
			var oManifest = {"sap.app": { type: "component" }};
			return Applier.preprocessManifest(oManifest, this.oConfig).then(function(oNewManifest) {
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 0, "FlexState.getAppDescriptorChanges is not called");
				assert.equal(this.fnApplyChangeSpy.callCount, 0, "AddLibrary.applyChange is not called");
				assert.equal(oManifest, oNewManifest, "manifest is resolved and not changed");
			}.bind(this));
		});

		QUnit.test("when calling 'preprocessManifest' with one change and load changes-bundle only after second FlexState.initialize call", function (assert) {
			var sReference = "applier.test.reference";
			var oManifest = {"sap.app": {id: sReference, type: "application" }, "sap.ui5": {appVariantId: sReference}};

			var oLrepConnectorStub = sandbox.stub(LrepConnector, "loadFlexData").resolves({
				appDescriptorChanges: [],
				changes: [
					{
						fileName: "id_1581069458324_200_propertyChange",
						fileType: "change",
						changeType: "propertyChange",
						reference: "applier.test.reference.Component",
						packageName: "$TMP",
						content: {property: "busy", newValue: true},
						selector: {
							id: "applierreference.listreport::sap.suite.ui.generic.template.ListReport.view.ListReport::YY1_BONUSPLANMEL--addEntry",
							type: "sap.m.Button",
							idIsLocal: false
						},
						layer: "VENDOR",
						namespace: "applier/test/reference/changes/",
						creation: "2020-02-07T09:57:43.523Z",
						validAppVersions: {creation: "1.0.0", from: "1.0.0", to: "1.0.0"},
						jsOnly: false,
						variantReference: "",
						appDescriptorChange: false
					}
				],
				variants: [],
				variantChanges: [],
				variantDependentControlChanges: [],
				variantManagementChanges: [],
				ui2personalization: {}
			});

			return Applier.preprocessManifest(oManifest, this.oConfig)
				.then(function() {
					jQuery.sap.registerPreloadedModules({
						version: "2.0",
						modules: {"applier/test/reference/changes/changes-bundle.json":'[{"fileName":"id_1581069458324_142_propertyChange","fileType":"change","changeType":"propertyChange","reference":"applier.test.reference.Component","packageName":"$TMP","content":{"property":"busy","newValue":true},"selector":{"id":"applierreference.listreport::sap.suite.ui.generic.template.ListReport.view.ListReport::YY1_BONUSPLANMEL--addEntry","type":"sap.m.Button","idIsLocal":false},"layer":"VENDOR","texts":{},"namespace":"applier/test/reference/changes/","projectId":"applier.test","creation":"2020-02-07T09:57:43.523Z","originalLanguage":"EN","conditions":{},"context":"","support":{"generator":"Change.createInitialFileContent","service":"","user":"","sapui5Version":"1.75.0-SNAPSHOT","sourceChangeFileName":"","compositeCommand":""},"oDataInformation":{},"dependentSelector":{},"validAppVersions":{"creation":"1.0.0","from":"1.0.0","to":"1.0.0"},"jsOnly":false,"variantReference":"","appDescriptorChange":false}]'}
					});
					return FlexState.initialize({
						componentId: this.oConfig.id,
						reference: sReference,
						componentData: this.oConfig.componentData,
						rawManifest: oManifest
					});
				}.bind(this))
				.then(function() {
					var aChanges = FlexState.getUIChanges(sReference);
					assert.equal(oLrepConnectorStub.callCount, 1, "only called once");
					assert.equal(aChanges.length, 2, "there are two change");
					assert.equal(aChanges[0].getFileName(), "id_1581069458324_142_propertyChange", "first change comes from changes-bundle");
					assert.equal(aChanges[1].getFileName(), "id_1581069458324_200_propertyChange", "second change comes from LrepConnector");
				});
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
