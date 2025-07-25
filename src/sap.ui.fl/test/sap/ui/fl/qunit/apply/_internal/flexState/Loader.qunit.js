/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/initial/api/Version",
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/thirdparty/sinon-4"
], function(
	Manifest,
	JsObjectConnector,
	Loader,
	ManifestUtils,
	ApplyStorage,
	Version,
	Settings,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oComponentData = {
		startupParameters: {
			hcpApplicationId: ["siteId"]
		}
	};

	QUnit.module("Loader", {
		beforeEach() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
			this.oFlexDataResponse = {
				changes: [
					{
						fileName: "c1",
						selector: {
							id: "ProductDetail--GeneralForm--generalForm",
							idIsLocal: false
						},
						dependentSelector: {
							movedElements: [
								{
									id: "ProductDetail--GeneralForm--productLabel",
									idIsLocal: false
								},
								{
									id: "ProductDetail--GeneralForm--productLabel2",
									idIsLocal: false
								}
							],
							anotherElement: {
								id: "ProductDetail--GeneralForm--anotherProductLabel",
								idIsLocal: false
							}
						}
					}, {
						fileName: "c2",
						selector: {
							id: "ProductDetail--GeneralForm--generalForm",
							idIsLocal: true
						},
						dependentSelector: {
							movedElements: [
								{
									id: "ProductDetail--GeneralForm--productLabel",
									idIsLocal: true
								}
							]
						}
					}, {
						fileName: "c3",
						selector: "ProductDetail--GeneralForm--generalForm",
						dependentSelector: {
							movedElements: [
								"ProductDetail--GeneralForm--productLabel"
							]
						}
					}, {
						fileName: "4c", // Invalid file name (id must not start with number)
						selector: "ProductDetail--GeneralForm--generalForm",
						dependentSelector: {
							movedElements: [
								"ProductDetail--GeneralForm--productLabel"
							]
						}
					}, {
						fileName: "some_appDescr_change_without_selector"
					}
				],
				variantDependentControlChanges: [],
				compVariants: [],
				variantChanges: [],
				variants: [],
				variantManagementChanges: []
			};
			this.oLoadFlexDataStub = sandbox.stub(ApplyStorage, "loadFlexData").resolves(this.oFlexDataResponse);
			this.oCompleteFlexDataStub = sandbox.stub(ApplyStorage, "completeFlexData").resolves("complete");
			this.oGetBaseCompNameStub = sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			this.oGetCacheKeyStub = sandbox.stub(ManifestUtils, "getCacheKeyFromAsyncHints").returns("cacheKey");
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when loadFlexData is called with all information", function(assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: oComponentData,
				version: Version.Number.Draft,
				allContexts: true,
				adaptationId: "id_1234",
				skipLoadBundle: true
			};

			var oExpectedProperties = {
				reference: "reference",
				componentName: "baseName",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				version: Version.Number.Draft,
				allContexts: true,
				adaptationId: "id_1234",
				skipLoadBundle: true
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, this.oFlexDataResponse, "the Loader loads data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oLoadFlexDataStub.getCall(0).args[0].siteId, "siteId", "the siteId was retrieved from the Utils");
				assert.equal(this.oLoadFlexDataStub.getCall(0).args[0].skipLoadBundle, true, "the bundle loading was skipped");
				assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
				assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
				var mPassedPropertyBag = this.oLoadFlexDataStub.firstCall.args[0];
				assert.deepEqual(mPassedPropertyBag, oExpectedProperties, "and is the property bag");
			}.bind(this));
		});

		QUnit.test("when loadFlexData is called without app version and all contexts", function(assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: oComponentData
			};

			var oExpectedProperties = {
				reference: "reference",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				componentName: "baseName",
				version: undefined,
				allContexts: undefined,
				adaptationId: undefined,
				skipLoadBundle: undefined
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, this.oFlexDataResponse, "the Loader tries to load data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oLoadFlexDataStub.getCall(0).args[0].siteId, "siteId", "the siteId was retrieved from the Utils");
				assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
				assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
				assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedProperties, "the first argument are the properties");
			}.bind(this));
		});

		[{
			details: "with a manifest object",
			manifest: new Manifest({"sap.ovp": {}})
		}, {
			details: "with a manifest JSON",
			manifest: {"sap.ovp": {}}
		}].forEach(function(oTestData) {
			QUnit.test(`when loadFlexData is called with a ovp app and ${oTestData.details}`, function(assert) {
				var mPropertyBag = {
					manifest: oTestData.manifest,
					otherValue: "a",
					reference: "reference",
					componentData: oComponentData
				};

				return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
					var aChanges = oResult.changes.changes;
					assert.strictEqual(aChanges.length, 4, "four changes are loaded");
					assert.equal(aChanges[0].fileName, "c1", "the file name of the first change is correct - MUST BE THE SAME");
					assert.deepEqual(aChanges[0].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the first change is correct");
					assert.deepEqual(aChanges[0].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}, {
							id: "ProductDetail--GeneralForm--productLabel2",
							idIsLocal: true
						}],
						anotherElement: {
							id: "ProductDetail--GeneralForm--anotherProductLabel",
							idIsLocal: true
						}
					}, "the dependent selector of the first change is correct");
					assert.equal(aChanges[1].fileName, "c2", "the file name of the third change is correct");
					assert.deepEqual(aChanges[1].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the third change is correct");
					assert.deepEqual(aChanges[1].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}]
					}, "the dependent selector of the second change is correct");
					assert.equal(aChanges[2].fileName, "c3", "the file name of the forth change is correct - MUST BE THE SAME");
					assert.deepEqual(aChanges[2].selector, {
						id: "ProductDetail--GeneralForm--generalForm",
						idIsLocal: true
					}, "the selector of the forth change is correct");
					assert.deepEqual(aChanges[2].dependentSelector, {
						movedElements: [{
							id: "ProductDetail--GeneralForm--productLabel",
							idIsLocal: true
						}]
					}, "the dependent selector of the forth change is correct");
				});
			});
		});

		QUnit.test("when loadFlexData is called with a non-ovp app", function(assert) {
			const mPropertyBag = {
				manifest: { ...this.oManifest },
				otherValue: "a",
				reference: "reference",
				componentData: oComponentData
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				const aChanges = oResult.changes.changes;
				assert.strictEqual(aChanges.length, 4, "four changes are loaded");
				assert.equal(aChanges[0].fileName, "c1", "the file name of the first change is correct");
				assert.deepEqual(aChanges[0].selector, {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: false
				}, "the selector of the first change is correct");
				assert.deepEqual(aChanges[0].dependentSelector, {
					movedElements: [{
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: false
					}, {
						id: "ProductDetail--GeneralForm--productLabel2",
						idIsLocal: false
					}],
					anotherElement: {
						id: "ProductDetail--GeneralForm--anotherProductLabel",
						idIsLocal: false
					}
				}, "the dependent selector of the first change is correct");
				assert.equal(aChanges[1].fileName, "c2", "the file name of the second change is correct");
				assert.deepEqual(aChanges[1].selector, {
					id: "ProductDetail--GeneralForm--generalForm",
					idIsLocal: true
				}, "the selector of the second change is correct");
				assert.deepEqual(aChanges[1].dependentSelector, {
					movedElements: [{
						id: "ProductDetail--GeneralForm--productLabel",
						idIsLocal: true
					}]
				}, "the dependent selector of the second change is correct");
				assert.equal(aChanges[2].fileName, "c3", "the file name of the third change is correct");
				assert.deepEqual(aChanges[2].selector, "ProductDetail--GeneralForm--generalForm", "the selector of the third change is correct");
				assert.deepEqual(aChanges[2].dependentSelector, {
					movedElements: ["ProductDetail--GeneralForm--productLabel"]
				}, "the dependent selector of the third change is correct");
			});
		});
	});

	QUnit.module("partialFlexData", {
		beforeEach() {
			this.oStorageCompleteFlexDataStub = sandbox.spy(ApplyStorage, "completeFlexData");
			this.oStorageLoadFlexDataStub = sandbox.spy(ApplyStorage, "loadFlexData");
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'loadChanges' is called to with partialFlexData", function(assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: oComponentData,
				partialFlexData: {changes: [{partial: "something"}]}
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes.changes[0];
				assert.equal(oChange.partial, "something", "one dummy partial state change was loaded correctly");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 1, "and Storage.completeFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 0, "and the Storage.loadFlexData function was NOT called");
			}.bind(this));
		});

		QUnit.test("when 'loadChanges' is called without partialFlexData", function(assert) {
			var sCacheKey = "abc";
			var oPreview = {
				maxLayer: "PARTNER",
				reference: "SeleniumListReportAdaptation"
			};
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: oComponentData,
				asyncHints: {
					requests: [{
						name: "sap.ui.fl.changes",
						reference: "test.app",
						cachebusterToken: sCacheKey,
						preview: oPreview
					}]
				}
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes.changes.length, 0, "no changes were loaded");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 0, "and Storage.completeFlexData was NOT called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 1, "and Storage.loadFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].cacheKey, sCacheKey, "the cache key was passed correct");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].preview, oPreview, "the preview section was passed correct");
			}.bind(this));
		});

		QUnit.test("when 'loadChanges' is called with reinitialize", function(assert) {
			var sCacheKey = "abc";

			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: oComponentData,
				reInitialize: true,
				asyncHints: {
					requests: [{
						name: "sap.ui.fl.changes",
						reference: "test.app",
						cachebusterToken: sCacheKey
					}]
				}
			};
			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes.changes.length, 0, "no changes were loaded");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 0, "and Storage.completeFlexData was NOT called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 1, "and Storage.loadFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].cacheKey, undefined, "the cache key was NOT passed");
			}.bind(this));
		});
	});

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
		},
		afterEach() {
			JsObjectConnector.storage.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and static preload when loading flex data, get name/reference from mComponent", async function(assert) {
			// simulate a component-preload
			sap.ui.require.preload({
				"test/app/changes/changes-bundle.json": '[{"otherDummy":true}]'
			});

			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: oComponentData
			};

			const oResult = await Loader.loadFlexData(mPropertyBag);
			assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
			const oChange = oResult.changes.changes[0];
			assert.equal(oChange.otherDummy, true, "the change dummy data is correctly loaded");
		});
	});

	QUnit.module("Load variant author name", {
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When load variant author name is triggered and feature is not available", async function(assert) {
			const oBackEndResult = {
				compVariants: {
					comp_id1: "comp_name1"
				},
				variants: {
					id1: "name1"
				}
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsVariantAuthorNameAvailable() {
					return false;
				}
			});
			const oStubLoadVariantsAuthors = sandbox.stub(ApplyStorage, "loadVariantsAuthors").resolves(oBackEndResult);

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, {}, "then empty result is returned");
			assert.equal(oStubLoadVariantsAuthors.callCount, 0, "then correct function of storage is not called");
		});

		QUnit.test("When load variant author name is triggered and the settings are not loaded (i.e. '<NO CACHE>' mentioned in the asyncHints)", async function(assert) {
			sandbox.stub(Settings, "getInstanceOrUndef");
			const oStubLoadVariantsAuthors = sandbox.stub(ApplyStorage, "loadVariantsAuthors");

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, {}, "then empty result is returned");
			assert.equal(oStubLoadVariantsAuthors.callCount, 0, "then correct function of storage is not called");
		});

		QUnit.test("When load variant author name is triggered and feature is available", async function(assert) {
			const oBackEndResult = {
				compVariants: {
					comp_id1: "comp_name1"
				},
				variants: {
					id1: "name1"
				}
			};
			sandbox.stub(Settings, "getInstanceOrUndef").returns({
				getIsVariantAuthorNameAvailable() {
					return true;
				}
			});
			const oStubLoadVariantsAuthors = sandbox.stub(ApplyStorage, "loadVariantsAuthors").resolves(oBackEndResult);

			const oResult = await Loader.loadVariantsAuthors("test.app");
			assert.deepEqual(oResult, oBackEndResult, "then result is get from LRep back end");
			assert.equal(oStubLoadVariantsAuthors.callCount, 1, "then correct function of storage is called");
			assert.equal(oStubLoadVariantsAuthors.getCall(0).args[0], "test.app", "with correct reference");
		});
	});

	QUnit.module("misc", {
		beforeEach() {
			this.oFlexDataResponse = {
				appDescriptorChanges: [{changeType: "changeType", fileName: "appDescriptorChange1"}, {changeType: "changeType", fileName: "appDescriptorChange$"}],
				annotationChanges: [{changeType: "changeType", fileName: "annotationChange1"}, {changeType: "changeType", fileName: "annotationChange%"}],
				changes: [{changeType: "changeType", fileName: "change1"}, {changeType: "changeType", fileName: "change&"}],
				comp: {
					variants: [{changeType: "changeType", fileName: "variant1"}, {changeType: "changeType", fileName: "variant@"}],
					changes: [{changeType: "changeType", fileName: "compChange1"}, {changeType: "changeType", fileName: "compChange#"}],
					defaultVariants: [{changeType: "changeType", fileName: "defaultVariant1"}, {changeType: "changeType", fileName: "defaultVariant$"}],
					standardVariants: [{changeType: "changeType", fileName: "standardVariant1"}, {changeType: "changeType", fileName: "standardVariant%"}]
				},
				variants: [{changeType: "changeType", fileName: "variant1"}, {changeType: "changeType", fileName: "variant@"}],
				variantChanges: [{changeType: "changeType", fileName: "variantChange1"}, {changeType: "changeType", fileName: "variantChange#"}],
				variantDependentControlChanges: [{changeType: "changeType", fileName: "varDepControlChange1"}, {changeType: "changeType", fileName: "varDepControlChange$"}],
				variantManagementChanges: [{changeType: "changeType", fileName: "variantManagementChange1"}, {changeType: "changeType", fileName: "variantManagementChange%"}]
			};
			this.oLoadFlexDataStub = sandbox.stub(ApplyStorage, "loadFlexData").resolves(this.oFlexDataResponse);
			sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			const oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(oRawManifest);
		},
		afterEach() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("invalidFileNames", async function(assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "reference"
			};

			const oResult = await Loader.loadFlexData(mPropertyBag);
			assert.equal(oResult.changes.appDescriptorChanges.length, 1, "the appDescriptorChanges are filtered");
			assert.equal(oResult.changes.annotationChanges.length, 1, "the annotationChanges are filtered");
			assert.equal(oResult.changes.changes.length, 1, "the changes are filtered");
			assert.equal(oResult.changes.comp.changes.length, 1, "the comp.changes are filtered");
			assert.equal(oResult.changes.comp.defaultVariants.length, 1, "the comp.defaultVariants are filtered");
			assert.equal(oResult.changes.comp.standardVariants.length, 1, "the comp.standardVariants are filtered");
			assert.equal(oResult.changes.variants.length, 1, "the variants are filtered");
			assert.equal(oResult.changes.variantChanges.length, 1, "the variantChanges are filtered");
			assert.equal(oResult.changes.variantDependentControlChanges.length, 1, "the variantDependentControlChanges are filtered");
			assert.equal(oResult.changes.variantManagementChanges.length, 1, "the variantManagementChanges are filtered");
		});

		QUnit.test("deactivateChanges", async function(assert) {
			const mPropertyBag = {
				manifest: this.oManifest,
				reference: "reference"
			};
			this.oFlexDataResponse.changes.push({
				fileName: "deactivateChange",
				changeType: "deactivateChanges",
				content: {
					changeIds: ["appDescriptorChange1", "annotationChange1", "variantChange1"]
				}
			}, {
				fileName: "deactivateChange2",
				changeType: "deactivateChanges",
				content: {
					changeIds: ["change1", "compChange1"]
				}
			});

			const oResult = await Loader.loadFlexData(mPropertyBag);
			assert.strictEqual(oResult.changes.appDescriptorChanges.length, 0, "the appDescriptorChanges are filtered");
			assert.strictEqual(oResult.changes.annotationChanges.length, 0, "the annotationChanges are filtered");
			assert.strictEqual(oResult.changes.changes.length, 0, "the changes are filtered");
			assert.strictEqual(oResult.changes.comp.changes.length, 0, "the comp.changes are filtered");
			assert.strictEqual(oResult.changes.comp.defaultVariants.length, 1, "the comp.defaultVariants are filtered");
			assert.strictEqual(oResult.changes.comp.standardVariants.length, 1, "the comp.standardVariants are filtered");
			assert.strictEqual(oResult.changes.variants.length, 1, "the variants are filtered");
			assert.strictEqual(oResult.changes.variantChanges.length, 0, "the variantChanges are filtered");
			assert.strictEqual(oResult.changes.variantDependentControlChanges.length, 1, "the variantDependentControlChanges are filtered");
			assert.strictEqual(oResult.changes.variantManagementChanges.length, 1, "the variantManagementChanges are filtered");
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
