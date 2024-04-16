/* global QUnit */

sap.ui.define([
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/changes/Applier",
	"sap/ui/fl/apply/_internal/flexState/changes/UIChangesState",
	"sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils"
], function(
	Component,
	Applier,
	UIChangesState,
	VariantManagementState,
	FlexState,
	ManifestUtils,
	XmlPreprocessor,
	Utils,
	sinon,
	RtaQunitUtils
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("XmlPreprocessor.getCacheKey", {
		beforeEach() {
			sandbox.stub(Component, "getComponentById").returnsArg(0);
			sandbox.stub(Utils, "getAppComponentForControl")
			.withArgs("invalidComponent").returns(undefined)
			.withArgs("validComponent").returns("appComponent");
			sandbox.stub(Utils, "isVariantByStartupParameter").returns(false);
			sandbox.stub(ManifestUtils, "getFlexReferenceForControl")
			.withArgs("appComponent").returns("flexReference");
			sandbox.stub(Utils, "isApplicationComponent")
			.withArgs("appComponent").returns(true);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with a variant by startup parameter", async function(assert) {
			Utils.isVariantByStartupParameter.restore();
			sandbox.stub(Utils, "isVariantByStartupParameter").returns(true);

			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, undefined, "then caching is disabled");
		});

		QUnit.test("with no appComponent found for the component", async function(assert) {
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "invalidComponent"});
			assert.strictEqual(vCacheKey, XmlPreprocessor.NOTAG, "the correct cache key is returned");
		});

		QUnit.test("with no cacheKey returned from the backend", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").resolves({});
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, XmlPreprocessor.NOTAG, "the correct cache key is returned");
		});

		QUnit.test("with cacheKey but without variants", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").resolves({cacheKey: 'W/"abc123"'});
			sandbox.stub(VariantManagementState, "getAllCurrentVariants").returns([]);
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, "abc123", "the correct cache key is returned");
		});

		QUnit.test("with cacheKey and multiple variants", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").resolves({cacheKey: 'W/"abc123"'});
			sandbox.stub(VariantManagementState, "getAllCurrentVariants").returns([
				{
					getId: () => "otherVariant",
					getStandardVariant: () => false
				},
				{
					getId: () => "otherVariant1",
					getStandardVariant: () => false
				},
				{
					getId: () => "standardVariant",
					getStandardVariant: () => true
				}
			]);
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, "abc123-otherVariant-otherVariant1", "the correct cache key is returned");
		});
	});

	QUnit.module("XmlPreprocessor.process", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("detects the app variant id and requests the changes for it", function(assert) {
			var oView = {
				sId: "testView"
			};
			var sComponentName = "someComponentName";
			var sFlexReference = "someVariantName";
			var mProperties = {
				sync: false
			};

			var oComponentData = {
				startupParameters: {
					"sap-app-id": [sFlexReference]
				}
			};

			var oMockedComponent = {
				getComponentClassName() {
					return sComponentName;
				}
			};
			var oMockedAppComponent = {
				getManifestObject() {
					return {};
				},
				getManifest() {
					return {};
				},
				getManifestEntry() {
					return undefined;
				},
				getComponentData() {
					return oComponentData;
				}
			};
			sandbox.stub(Component, "getComponentById").returns(oMockedComponent);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "isApplication").returns(true);

			return XmlPreprocessor.process(oView, mProperties).then(function(oProcessedView) {
				assert.deepEqual(oProcessedView, oView, "the original view is returned");
			});
		});

		QUnit.test("skips the processing in case of a component whose type is not application", function(assert) {
			var oView = {
				sId: "testView"
			};
			var mProperties = {
				sync: false
			};
			var sComponentName = "someComponentName";

			var oComponentData = {
				startupParameters: {
					"sap-app-id": ["someId"]
				}
			};

			var oMockedAppComponent = {
				getManifest() {
					return {};
				},
				getManifestEntry() {
					return undefined;
				},
				getComponentData() {
					return oComponentData;
				},
				getComponentClassName() {
					return sComponentName;
				}
			};

			sandbox.stub(Component, "getComponentById").returns(oMockedAppComponent);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "isApplication").returns(true);
			const oApplierStub = sandbox.stub(Applier, "applyAllChangesForXMLView");

			return XmlPreprocessor.process(oView, mProperties).then(function(oProcessedView) {
				assert.deepEqual(oProcessedView, oView, "the original view is returned");
				assert.strictEqual(oApplierStub.callCount, 0, "the applier was not called");
			});
		});

		QUnit.test("applies all applicable changes", async function(assert) {
			const oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, "myAppComponent");
			const oApplierStub = sandbox.stub(Applier, "applyAllChangesForXMLView");
			const oWaitForInitStub = sandbox.stub(FlexState, "waitForInitialization");
			sandbox.stub(UIChangesState, "getAllApplicableUIChanges").returns([
				{ getSelector: () => { return { id: "testView--foo" }; } },
				{ getSelector: () => { return { id: "testView-bar" }; } },
				{ getSelector: () => { return { id: "testView1--foo1" }; } },
				{ getSelector: () => { return { id: "testView1-bar" }; }}
			]);
			await XmlPreprocessor.process({sId: "testView"}, {
				id: "testView",
				componentId: "myAppComponent"
			});
			assert.strictEqual(oWaitForInitStub.callCount, 1, "the FlexState init was waited for");
			assert.strictEqual(oApplierStub.lastCall.args[1].length, 1, "only one change was passed");
			assert.strictEqual(oApplierStub.lastCall.args[0].reference, "myAppComponent", "the reference was added to the properties");
			oAppComponent.destroy();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
