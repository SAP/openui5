/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/apply/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function (
	Manifest,
	Loader,
	ManifestUtils,
	JsObjectConnector,
	ApplyStorage,
	Layer,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Loader", {
		beforeEach: function() {
			this.oRawManifest = {
				property: "value"
			};
			this.oManifest = new Manifest(this.oRawManifest);
			this.oLoadFlexDataStub = sandbox.stub(ApplyStorage, "loadFlexData").resolves("load");
			this.oCompleteFlexDataStub = sandbox.stub(ApplyStorage, "completeFlexData").resolves("complete");
			this.oGetAppVersionStub = sandbox.stub(Utils, "getAppVersionFromManifest").returns("appVersion");
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
				draftLayer: Layer.CUSTOMER
			};

			var oExpectedProperties = {
				reference: "reference",
				appVersion: "appVersion",
				componentName: "baseName",
				cacheKey: "cacheKey",
				siteId: "siteId",
				appDescriptor: this.oRawManifest,
				draftLayer: Layer.CUSTOMER
			};

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, "load", "the Loader loads data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oGetAppVersionStub.callCount, 1, "the app version was retrieved from the Utils");
				assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
				assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
				assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
				var mPassedPropertyBag = this.oLoadFlexDataStub.firstCall.args[0];
				assert.equal(Object.keys(mPassedPropertyBag).length, 7, "the first argument has the right amount of keys");
				assert.deepEqual(mPassedPropertyBag, oExpectedProperties, "and is the property bag");
			}.bind(this));
		});

		QUnit.test("when loadFlexData is called without app version ", function (assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: {}
			};

			var oExpectedProperties = {
				reference: "reference",
				appVersion: "DEFAULT_APP_VERSION",
				cacheKey: "cacheKey",
				siteId: "siteId",
				appDescriptor: this.oRawManifest,
				componentName: "baseName",
				draftLayer: undefined
			};
			this.oGetAppVersionStub.returns();

			return Loader.loadFlexData(mPropertyBag).then(function(oResult) {
				assert.equal(oResult.changes, "load", "the Loader tries to load data");
				assert.equal(this.oLoadFlexDataStub.callCount, 1, "the Storage.loadFlexData was called");
				assert.equal(this.oCompleteFlexDataStub.callCount, 0, "the Storage.completeFlexData was not called");
				assert.equal(this.oGetAppVersionStub.callCount, 1, "the app version was retrieved from the Utils");
				assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
				assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
				assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
				assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedProperties, "the first argument is the component");
			}.bind(this));
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
				partialFlexData: {changes: {partial: "something"}}
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
			var mPropertyBag = {
				manifest: this.oManifest,
				reference: "test.app",
				componentData: {}
			};
			return Loader.loadFlexData(mPropertyBag).then(function (oResult) {
				assert.equal(oResult.changes.changes.length, 0, "no changes were loaded");
				assert.equal(this.oStorageCompleteFlexDataStub.callCount, 0, "and Storage.completeFlexData was NOT called");
				assert.equal(this.oStorageLoadFlexDataStub.callCount, 1, "and Storage.loadFlexData was called");
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
			JsObjectConnector.oStorage.clear();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and static preload when loading flex data, get name/reference from mComponent", function (assert) {
			// simulate a component-preload
			jQuery.sap.registerPreloadedModules({
				version : "2.0",
				name : "test.app",
				modules : {
					"test/app/changes/changes-bundle.json" : '[{"otherDummy":true}]'
				}
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
