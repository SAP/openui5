/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/apply/_internal/changes/descriptor/Preprocessor",
	"sap/ui/fl/apply/_internal/changes/descriptor/Applier",
	"sap/ui/fl/apply/_internal/changes/descriptor/ui5/AddLibrary",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/apply/_internal/connectors/LrepConnector",
	"sap/ui/fl/apply/_internal/connectors/StaticFileConnector",
	"sap/ui/fl/Layer",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
],
function (
	Preprocessor,
	Applier,
	AddLibrary,
	FlexState,
	Storage,
	LrepConnector,
	StaticFileConnector,
	Layer,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Preprocessor", {
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

			this.fnFlexStateSpy = sandbox.spy(FlexState, "initialize");
			this.fnGetAppDescriptorChangesSpy = sandbox.spy(FlexState, "getAppDescriptorChanges");
			this.fnApplyChangeSpy = sandbox.spy(AddLibrary, "applyChange");
			this.fnApplierUtilsSpy = sandbox.spy(Applier, "applyChanges");

			this.fnStorageStub = sandbox.stub(Storage, "loadFlexData");
		},
		afterEach: function () {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'preprocessManifest' with three 'appdescr_ui5_addLibraries' changes ", function (assert) {
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

			this.fnStorageStub.resolves({ appDescriptorChanges: aChanges });

			return Preprocessor.preprocessManifest(this.oManifest, this.oConfig).then(function() {
				assert.equal(this.fnFlexStateSpy.callCount, 1, "FlexState was initialized once");
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
				assert.equal(this.fnApplierUtilsSpy.callCount, 1, "ApplierUtils.applyChanges is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 3, "AddLibrary.applyChange is called three times");
			}.bind(this));
		});

		QUnit.test("when calling 'preprocessManifest' with several different change types ", function (assert) {
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

			this.fnStorageStub.resolves({ appDescriptorChanges: aChanges });

			return Preprocessor.preprocessManifest(this.oManifest, this.oConfig).then(function() {
				assert.equal(this.fnFlexStateSpy.callCount, 1, "FlexState was initialized once");
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
				assert.equal(this.fnApplierUtilsSpy.callCount, 1, "ApplierUtils.applyChanges is called once");
				assert.equal(this.fnApplyChangeSpy.callCount, 1, "AddLibrary.applyChange is called once");
			}.bind(this));
		});

		QUnit.test("when calling 'preprocessManifest' with empty oManifest object ", function (assert) {
			return Preprocessor.preprocessManifest({}, this.oConfig).then(function() {
				assert.equal(this.fnFlexStateSpy.callCount, 0, "FlexState was initialized once");
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 0, "FlexState.getAppDescriptorChanges is not called");
				assert.equal(this.fnApplierUtilsSpy.callCount, 0, "ApplierUtils.applyChanges is not called");
				assert.equal(this.fnApplyChangeSpy.callCount, 0, "AddLibrary.applyChange is not called");
			}.bind(this));
		});

		QUnit.test("when calling 'preprocessManifest' with manifest of type 'component'", function (assert) {
			var oManifest = {"sap.app": { type: "component" }};
			return Preprocessor.preprocessManifest(oManifest, this.oConfig).then(function(oNewManifest) {
				assert.equal(this.fnFlexStateSpy.callCount, 0, "FlexState was initialized once");
				assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 0, "FlexState.getAppDescriptorChanges is not called");
				assert.equal(this.fnApplierUtilsSpy.callCount, 0, "ApplierUtils.applyChanges is not called");
				assert.equal(this.fnApplyChangeSpy.callCount, 0, "AddLibrary.applyChange is not called");
				assert.equal(oManifest, oNewManifest, "manifest is resolved and not changed");
			}.bind(this));
		});
	});

	QUnit.module("Applier", {
		beforeEach: function () {
			this.oConfig = {
				componentData: {},
				asyncHints: {},
				id: "componentId"
			};

			this.fnFlexStateSpy = sandbox.spy(FlexState, "initialize");
			this.fnGetAppDescriptorChangesSpy = sandbox.spy(FlexState, "getAppDescriptorChanges");
			this.fnApplyChangeSpy = sandbox.spy(AddLibrary, "applyChange");
			this.fnApplierUtilsSpy = sandbox.spy(Applier, "applyChanges");
		},
		afterEach: function () {
			FlexState.clearState();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when calling 'preprocessManifest' with one change and load changes-bundle only after second FlexState.initialize call", function (assert) {
			var sReference = "applier.test.reference";
			var oManifest = {"sap.app": {id: sReference, type: "application" }, "sap.ui5": {appVariantId: sReference}};

			var oStorageLoadFlexData = sandbox.spy(Storage, "loadFlexData");
			var oStorageCompleteFlexData = sandbox.spy(Storage, "completeFlexData");
			var oStaticFileConnectorSpy = sandbox.spy(StaticFileConnector, "loadFlexData");
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
						layer: Layer.VENDOR,
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

			return Preprocessor.preprocessManifest(oManifest, this.oConfig)
				.then(function() {
					assert.equal(this.fnFlexStateSpy.callCount, 1, "FlexState is initialized for the first time");
					assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is called once");
					assert.equal(this.fnApplierUtilsSpy.callCount, 1, "ApplierUtils.applyChanges is called once");
					assert.equal(this.fnApplyChangeSpy.callCount, 0, "AddLibrary.applyChange is not called as there are no descriptor changes");
					assert.equal(oLrepConnectorStub.callCount, 1, "LrepConnector is called once");
					assert.equal(oStaticFileConnectorSpy.callCount, 1, "StaticFileConnector is called once");
					assert.equal(oStorageLoadFlexData.callCount, 1, "Storage.loadFlexData is called once");
					assert.equal(oStorageCompleteFlexData.callCount, 0, "Storage.completeFlexData is not called");

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
					assert.equal(this.fnFlexStateSpy.callCount, 2, "FlexState is initialized for the second time");
					assert.equal(this.fnGetAppDescriptorChangesSpy.callCount, 1, "FlexState.getAppDescriptorChanges is still only called once");
					assert.equal(oStaticFileConnectorSpy.callCount, 2, "StaticFileConnector is called for the second time");
					assert.equal(oStorageLoadFlexData.callCount, 1, "Storage.loadFlexData is still called only once");
					assert.equal(oStorageCompleteFlexData.callCount, 1, "Storage.completeFlexData is called once");

					var aChanges = FlexState.getUIChanges(sReference);
					assert.equal(oLrepConnectorStub.callCount, 1, "only called once");
					assert.equal(aChanges.length, 2, "there are two UI changes");
					assert.equal(aChanges[0].getFileName(), "id_1581069458324_142_propertyChange", "first change comes from changes-bundle");
					assert.equal(aChanges[1].getFileName(), "id_1581069458324_200_propertyChange", "second change comes from LrepConnector");
				}.bind(this));
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
