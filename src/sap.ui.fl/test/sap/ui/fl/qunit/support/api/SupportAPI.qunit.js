/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexObjectState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/support/_internal/extractChangeDependencies",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/support/api/SupportAPI",
	"sap/ui/fl/util/IFrame",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Component,
	ComponentContainer,
	UIChangesState,
	VariantManagementState,
	FlexObjectState,
	FlexState,
	ManifestUtils,
	extractChangeDependencies,
	Settings,
	SupportAPI,
	IFrame,
	Utils,
	sinon
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("When the SupportAPI is called with the app running in an iframe", {
		async beforeEach() {
			this.oIFrame = new IFrame({
				url: "support/api/testPage.html",
				title: "myIFrame",
				id: "application-semanticObject-action"
			});
			this.oIFrame.placeAt("qunit-fixture");
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						getIntent: () => {
							return {
								semanticObject: "semanticObject",
								action: "action"
							};
						}
					};
				}
			});
			await this.oIFrame.waitForInit();

			// wait for the app inside the iframe to be ready
			let bReady = false;
			do {
				if (this.oIFrame.getDomRef()?.contentWindow?.flSupportTestAppReady) {
					await this.oIFrame.getDomRef().contentWindow.flSupportTestAppReady;
					bReady = true;
				} else {
					await new Promise((resolve) => {
						setTimeout(resolve, 16);
					});
				}
			} while (!bReady);

			// stub the modules inside the iframe
			const oInsideIFrameModules = await new Promise((resolve) => {
				this.oIFrame.getDomRef().contentWindow.sap.ui.require([
					"sap/ui/fl/Utils",
					"sap/ui/fl/initial/_internal/ManifestUtils",
					"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState"
				], (FlUtils, ManifestUtils, UIChangesState) => {
					resolve({FlUtils, ManifestUtils, UIChangesState});
				});
			});
			sandbox.stub(oInsideIFrameModules.FlUtils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: {
							oContainer: {
								getComponentInstance: () => {
									return "myInsideIFrameComponentInstance";
								}
							}
						}
					};
				}
			});
			sandbox.stub(oInsideIFrameModules.ManifestUtils, "getFlexReferenceForControl").returns("myInsideIFrameFlexReference");
			sandbox.stub(oInsideIFrameModules.UIChangesState, "getAllUIChanges").resolves(["myInsideIFrameChange"]);
		},
		afterEach() {
			sandbox.restore();
			this.oIFrame.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.deepEqual(aAllChanges, ["myInsideIFrameChange"], "then the change from the iFrame is returned");
		});
	});

	QUnit.module("When the SupportAPI is called with a standalone app without iframe", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(false);
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const oGetAllChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns(["myChange"]);
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(oGetAllChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myChange"], "then the change is returned");
		});
	});

	QUnit.module("When the SupportAPI is called with an app embedded in a FLP sandbox", {
		async beforeEach() {
			const oComponent = await Component.create({
				name: "testComponentAsync",
				id: "testComponentAsync"
			});
			this.oComponentContainer = new ComponentContainer({
				component: oComponent,
				async: true
			});
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: oComponent
					};
				}
			});

			this.getFlexReferenceForControlSpy = sandbox.spy(ManifestUtils, "getFlexReferenceForControl");
			this.getAllUIChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges")
			.resolves(["myFlpChange"]);
			this.getObjectDataSelectorStub = sandbox.stub(FlexState, "getFlexObjectsDataSelector")
			.returns({
				get: () => {
					return ["objectDataSelector"];
				}
			});
			this.getDirtyFlexObjectsStub = sandbox.stub(FlexObjectState, "getDirtyFlexObjects")
			.returns(["dirtyFlexObjects"]);
			this.getCompleteDependencyMapStub = sandbox.stub(FlexObjectState, "getCompleteDependencyMap")
			.returns("completeDependencyMap");
			this.getLiveDependencyMapStub = sandbox.stub(FlexObjectState, "getLiveDependencyMap")
			.returns("liveDependencyMap");
			this.getVariantManagementMapStub = sandbox.stub(VariantManagementState, "getVariantManagementMap")
			.returns({
				get: () => {
					return "variantManagementMap";
				}
			});
		},
		afterEach() {
			sandbox.restore();
			this.oComponentContainer.destroy();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", async function(assert) {
			const aAllChanges = await SupportAPI.getAllUIChanges();
			assert.strictEqual(this.getAllUIChangesStub.getCall(0).args[0], "testComponentAsync", "then the correct reference is passed");
			assert.deepEqual(aAllChanges, ["myFlpChange"], "then the change is returned");
		});

		QUnit.test("when getFlexObjectInfo is called", async function(assert) {
			const oFlexObjectInfos = await SupportAPI.getFlexObjectInfos();

			assert.strictEqual(
				this.getFlexReferenceForControlSpy.callCount,
				1,
				"then the flex reference is fetched"
			);
			assert.strictEqual(
				this.getObjectDataSelectorStub.callCount,
				1,
				"then the object data selector is fetched"
			);
			assert.deepEqual(
				oFlexObjectInfos.allFlexObjects,
				["objectDataSelector"],
				"then the object data selectors are returned"
			);
			assert.strictEqual(
				this.getDirtyFlexObjectsStub.callCount,
				1,
				"then the dirty flex objects are fetched"
			);
			assert.strictEqual(
				this.getDirtyFlexObjectsStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the dirty flex objects function"
			);
			assert.deepEqual(
				oFlexObjectInfos.dirtyFlexObjects,
				["dirtyFlexObjects"],
				"then the dirty flex objects are returned"
			);
			assert.strictEqual(
				this.getCompleteDependencyMapStub.callCount,
				1,
				"then the complete dependency map is fetched"
			);
			assert.strictEqual(
				this.getCompleteDependencyMapStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the complete dependency map function"
			);
			assert.strictEqual(
				oFlexObjectInfos.completeDependencyMap,
				"completeDependencyMap",
				"then the complete dependency map is returned"
			);
			assert.strictEqual(
				this.getLiveDependencyMapStub.called,
				true,
				"then the live dependency map is fetched"
			);
			assert.strictEqual(
				this.getLiveDependencyMapStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the live dependency map function"
			);
			assert.strictEqual(oFlexObjectInfos.liveDependencyMap,
				"liveDependencyMap",
				"then the live dependency map is returned"
			);
			assert.strictEqual(
				this.getVariantManagementMapStub.callCount,
				1,
				"then the variant management map is fetched"
			);
			assert.strictEqual(
				oFlexObjectInfos.variantManagementMap,
				"variantManagementMap",
				"then the variant management map is returned"
			);
			assert.strictEqual(
				this.getAllUIChangesStub.callCount,
				1,
				"then the all UI changes are fetched"
			);
			assert.strictEqual(
				this.getAllUIChangesStub.getCall(0).args[0],
				"testComponentAsync",
				"then the flex reference is passed to the all UI changes function"
			);
		});

		QUnit.test("when getFlexSettings is called", async function(assert) {
			const oSettings = await Settings.getInstance();
			oSettings.mySampleGetter = function() {
				return "mySampleValue";
			};
			const oGetFlexSettingsStub = sandbox.stub(oSettings.getMetadata(), "getProperties").returns({
				sampleKey: { _sGetter: "mySampleGetter" },
				versioning: { _sGetter: "getVersioning" }
			});
			const oFlexSettings = await SupportAPI.getFlexSettings();

			assert.strictEqual(
				oGetFlexSettingsStub.callCount,
				1,
				"then the flex settings are fetched"
			);
			assert.strictEqual(
				oFlexSettings[0].key,
				"sampleKey",
				"then the flex settings key is returned"
			);
			assert.strictEqual(
				oFlexSettings[0].value,
				"mySampleValue",
				"then the flex settings value is returned"
			);
		});

		QUnit.test("when getChangeDependencies is called", async function(assert) {
			const oExtractChangeDependenciesStub = sandbox.stub(extractChangeDependencies, "extract").returns("dependencyMap");
			const oChangeDependencies = await SupportAPI.getChangeDependencies();

			assert.strictEqual(
				oExtractChangeDependenciesStub.callCount,
				1,
				"then the change dependencies are extracted"
			);
			assert.strictEqual(
				oChangeDependencies,
				"dependencyMap",
				"then the dependency map is returned"
			);
		});
	});

	QUnit.module("When the SupportAPI is called without an app but available FLP sandbox", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(true);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						getIntent: () => {
							return {
								semanticObject: "semanticObject",
								action: "action"
							};
						}
					};
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", function(assert) {
			const oGetAllChangesStub = sandbox.stub(UIChangesState, "getAllUIChanges").returns(["myFlpChange"]);
			return SupportAPI.getAllUIChanges()
			.catch(function(oError) {
				assert.strictEqual(oError.message, "Possible cFLP scenario, but the iFrame can't be found", "then an error is thrown");
				assert.strictEqual(oGetAllChangesStub.callCount, 0, "then no changes are fetched");
			});
		});
	});

	QUnit.module("When the SupportAPI is called with standalone app and without application container defined", {
		beforeEach() {
			sandbox.stub(Utils, "getUshellContainer").returns(false);
			sandbox.stub(Utils, "getUShellService").resolves({
				getCurrentApplication: () => {
					return {
						componentInstance: null
					};
				}
			});
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when getAllUIChanges is called", function(assert) {
			return SupportAPI.getAllUIChanges()
			.catch(function(oError) {
				assert.strictEqual(oError.message, "No application component found", "then an error is thrown");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});