/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/initial/_internal/Storage",
	"sap/ui/fl/Utils",
	"sap/ui/fl/write/api/Version",
	"sap/ui/thirdparty/sinon-4"
], function(
	Manifest,
	Loader,
	ManifestUtils,
	JsObjectConnector,
	ApplyStorage,
	Utils,
	Version,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Loader", {
		beforeEach: function() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
			this.oFlexDataResponse = {
				changes: [
					{
						fileName: "1",
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
						fileName: "2",
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
						fileName: "3",
						selector: "ProductDetail--GeneralForm--generalForm",
						dependentSelector: {
							movedElements: [
								"ProductDetail--GeneralForm--productLabel"
							]
						}
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
			this.oGetSiteIdStub = sandbox.stub(Utils, "getSiteIdByComponentData").returns("siteId");
			this.oGetBaseCompNameStub = sandbox.stub(ManifestUtils, "getBaseComponentNameFromManifest").returns("baseName");
			this.oGetCacheKeyStub = sandbox.stub(ManifestUtils, "getCacheKeyFromAsyncHints").returns("cacheKey");
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when loadFlexData is called with all information", function (assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: {},
				version: Version.Number.Draft,
				allContexts: true
			};

			var oExpectedProperties = {
				reference: "reference",
				componentName: "baseName",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				version: Version.Number.Draft,
				allContexts: true
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, this.oFlexDataResponse, "the Loader loads data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
				assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
				assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
				var mPassedPropertyBag = this.oLoadFlexDataStub.firstCall.args[0];
				assert.deepEqual(mPassedPropertyBag, oExpectedProperties, "and is the property bag");
			}.bind(this));
		});

		QUnit.test("when loadFlexData is called without app version and all contexts", function (assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: {}
			};

			var oExpectedProperties = {
				reference: "reference",
				cacheKey: "cacheKey",
				siteId: "siteId",
				preview: undefined,
				appDescriptor: this.oRawManifest,
				componentName: "baseName",
				version: undefined,
				allContexts: undefined
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, this.oFlexDataResponse, "the Loader tries to load data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
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
		}].forEach(function (oTestData) {
			QUnit.test("when loadFlexData is called with a ovp app and " + oTestData.details, function (assert) {
				var mPropertyBag = {
					manifest: oTestData.manifest,
					otherValue: "a",
					reference: "reference",
					componentData: {}
				};

				return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
					var aChanges = oResult.changes.changes;
					assert.equal(aChanges.length, 3, "three changes are loaded");
					assert.equal(aChanges[0].fileName, "1", "the file name of the first change is correct - MUST BE THE SAME");
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
					assert.equal(aChanges[1].fileName, "2", "the file name of the third change is correct");
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
					assert.equal(aChanges[2].fileName, "3", "the file name of the forth change is correct - MUST BE THE SAME");
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

		QUnit.test("when loadFlexData is called with a non-ovp app", function (assert) {
			var mPropertyBag = {
				manifest: Object.assign({}, this.oManifest),
				otherValue: "a",
				reference: "reference",
				componentData: {}
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				var aChanges = oResult.changes.changes;
				assert.equal(aChanges.length, 3, "three changes are loaded");
				assert.equal(aChanges[0].fileName, "1", "the file name of the first change is correct");
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
				assert.equal(aChanges[1].fileName, "2", "the file name of the second change is correct");
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
				assert.equal(aChanges[2].fileName, "3", "the file name of the third change is correct");
				assert.deepEqual(aChanges[2].selector, "ProductDetail--GeneralForm--generalForm", "the selector of the third change is correct");
				assert.deepEqual(aChanges[2].dependentSelector, {
					movedElements: ["ProductDetail--GeneralForm--productLabel"]
				}, "the dependent selector of the third change is correct");
			});
		});
	});

	QUnit.module("partialFlexState", {
		beforeEach: function() {
			this.oStorageCompleteFlexDataStub = sandbox.spy(ApplyStorage, "completeFlexData");
			this.oStorageLoadFlexDataStub = sandbox.spy(ApplyStorage, "loadFlexData");
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
		},
		afterEach: function () {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when 'loadChanges' is called to with partialFlexData", function (assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: {},
				partialFlexData: {changes: [{partial: "something"}]}
			};

			return Loader.loadFlexData(mPropertyBag).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes.changes[0];
				assert.equal(oChange.partial, "something", "one dummy partial state change was loaded correctly");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 1, "and Storage.completeFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 0, "and the Storage.loadFlexData function was NOT called");
			}.bind(this));
		});

		QUnit.test("when 'loadChanges' is called without partialFlexData", function (assert) {
			var sCacheKey = "abc";
			var oPreview = {
				maxLayer: "PARTNER",
				reference: "SeleniumListReportAdaptation.Component"
			};
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: {},
				asyncHints: {
					requests: [{
						name: "sap.ui.fl.changes",
						reference: "test.app",
						cachebusterToken: sCacheKey,
						preview: oPreview
					}]
				}
			};

			return Loader.loadFlexData(mPropertyBag).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 0, "no changes were loaded");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 0, "and Storage.completeFlexData was NOT called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 1, "and Storage.loadFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].cacheKey, sCacheKey, "the cache key was passed correct");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].preview, oPreview, "the preview section was passed correct");
			}.bind(this));
		});

		QUnit.test("when 'loadChanges' is called with reinitialize", function (assert) {
			var sCacheKey = "abc";

			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: {},
				reInitialize: true,
				asyncHints: {
					requests: [{
						name: "sap.ui.fl.changes",
						reference: "test.app",
						cachebusterToken: sCacheKey
					}]
				}
			};
			return Loader.loadFlexData(mPropertyBag).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 0, "no changes were loaded");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 0, "and Storage.completeFlexData was NOT called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 1, "and Storage.loadFlexData was called");
				assert.equal(this.oStorageLoadFlexDataStub.getCall(0).args[0].cacheKey, undefined, "the cache key was NOT passed");
			}.bind(this));
		});
	});

	QUnit.module("Given new connector configuration in bootstrap", {
		beforeEach: function() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
		},
		afterEach: function () {
			JsObjectConnector.storage.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and static preload when loading flex data, get name/reference from mComponent", function (assert) {
			// simulate a component-preload
			sap.ui.require.preload({
				"test/app/changes/changes-bundle.json": '[{"otherDummy":true}]'
			});

			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: {}
			};

			return Loader.loadFlexData(mPropertyBag).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 1, "one change was loaded");
				var oChange = oResult.changes.changes[0];
				assert.equal(oChange.otherDummy, true, "the change dummy data is correctly loaded");
			});
		});
	});


	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
