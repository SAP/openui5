/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function (
	Manifest,
	Loader,
	ManifestUtils,
	CompatibilityConnector,
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
			this.oLoadFlexDataStub = sandbox.stub(CompatibilityConnector, "loadChanges").returns("foo");
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
				componentData: {}
			};
			var oExpectedComponent = {
				name: "reference",
				appVersion: "appVersion"
			};
			var oExpectedProperties = {
				cacheKey: "cacheKey",
				siteId: "siteId",
				appDescriptor: this.oRawManifest,
				appName: "baseName"
			};

			assert.equal(Loader.loadFlexData(mPropertyBag), "foo", "the Loader returns whatever the CompatibilityConnector returns");
			assert.equal(this.oLoadFlexDataStub.callCount, 1, "the CompatibilityConnector was called");
			assert.equal(this.oGetAppVersionStub.callCount, 1, "the app version was retrieved from the Utils");
			assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
			assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
			assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedComponent, "the first argument is the component");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[1], oExpectedProperties, "the second argument is the property bag");
		});

		QUnit.test("when loadFlexData is called without app version ", function (assert) {
			var mPropertyBag = {
				manifest: this.oManifest,
				otherValue: "a",
				reference: "reference",
				componentData: {}
			};
			var oExpectedComponent = {
				name: "reference",
				appVersion: Utils.DEFAULT_APP_VERSION
			};
			var oExpectedProperties = {
				cacheKey: "cacheKey",
				siteId: "siteId",
				appDescriptor: this.oRawManifest,
				appName: "baseName"
			};
			this.oGetAppVersionStub.returns(undefined);

			assert.equal(Loader.loadFlexData(mPropertyBag), "foo", "the Loader returns whatever the CompatibilityConnector returns");
			assert.equal(this.oLoadFlexDataStub.callCount, 1, "the CompatibilityConnector was called");
			assert.equal(this.oGetAppVersionStub.callCount, 1, "the app version was retrieved from the Utils");
			assert.equal(this.oGetSiteIdStub.callCount, 1, "the siteId was retrieved from the Utils");
			assert.equal(this.oGetBaseCompNameStub.callCount, 1, "the name was retrieved from the Utils");
			assert.equal(this.oGetCacheKeyStub.callCount, 1, "the cache key was retrieved from the Utils");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[0], oExpectedComponent, "the first argument is the component");
			assert.deepEqual(this.oLoadFlexDataStub.firstCall.args[1], oExpectedProperties, "the second argument is the property bag");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
