/* global QUnit */

sap.ui.define([
	"sap/ui/core/Manifest",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function (
	Manifest,
	ManifestUtils,
	Utils,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	var sReference = "fl.reference";

	QUnit.module("ManifestUtils.getFlexReference", {
		afterEach: function () {
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with 'sap-app-id'", function (assert) {
			var mPropertyBag = {
				componentData: {
					startupParameters: {
						"sap-app-id": ["oldAppId"]
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "oldAppId", "the old app var id is returned");
		});

		QUnit.test("with an appvar id (raw manifest)", function (assert) {
			var mPropertyBag = {
				componentData: {},
				manifest: {
					"sap.ui5": {
						appVariantId: "appVarId"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appVarId", "the new app var id is returned");
		});

		QUnit.test("with sap.ui5 component name (raw manifest)", function (assert) {
			var mPropertyBag = {
				componentData: {},
				manifest: {
					"sap.ui5": {
						componentName: "componentName"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "componentName.Component", "the componentName is returned");
		});

		QUnit.test("without old or new appvar id or componentName (raw manifest)", function (assert) {
			var oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
			var mPropertyBag = {
				componentData: {},
				manifest: {
					"sap-ui6": {
						appVariantId: "appVarId"
					}
				}
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
			assert.equal(oGetAppIdStub.callCount, 1, "the function was called");
		});

		QUnit.test("with an appvar id (manifest object)", function (assert) {
			var mPropertyBag = {
				componentData: {},
				manifest: new Manifest({
					"sap.ui5": {
						appVariantId: "appVarId"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appVarId", "the new app var id is returned");
		});

		QUnit.test("with sap.ui5 component name (manifest object)", function (assert) {
			var mPropertyBag = {
				componentData: {},
				manifest: new Manifest({
					"sap.ui5": {
						componentName: "componentName"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "componentName.Component", "the componentName is returned");
		});

		QUnit.test("without old or new appvar id or componentName (manifest object)", function (assert) {
			var oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
			var mPropertyBag = {
				componentData: {},
				manifest: new Manifest({
					"sap-ui6": {
						appVariantId: "appVarId"
					}
				})
			};
			assert.equal(ManifestUtils.getFlexReference(mPropertyBag), "appId.Component", "the app id is returned");
			assert.equal(oGetAppIdStub.callCount, 1, "the function was called");
		});
	});

	QUnit.module("ManifestUtils.getCacheKeyFromAsyncHints", {}, function() {
		QUnit.test("without async hints given", function(assert) {
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints({}, sReference), undefined, "nothing is returned");
		});

		QUnit.test("with filled async hints given", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference,
						cachebusterToken: "token"
					}
				]
			};
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints(oAsyncHints, sReference), "token", "the cachebusterToken is returned");
		});

		QUnit.test("with empty async hints given (<NO CHANGES>)", function(assert) {
			var oAsyncHints = {
				requests: [
					{
						name: "sap.ui.fl.changes",
						reference: sReference
					}
				]
			};
			assert.equal(ManifestUtils.getCacheKeyFromAsyncHints(oAsyncHints, sReference), "<NO CHANGES>", "nothing is returned");
		});
	});

	QUnit.module("ManifestUtils.getBaseComponentNameFromManifest", {
		beforeEach: function() {
			this.oGetAppIdStub = sandbox.stub(Utils, "getAppIdFromManifest").returns("appId");
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("without sap.ui5 entry", function(assert) {
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest({}), "appId", "the appId is returned");
			assert.equal(this.oGetAppIdStub.callCount, 1, "the function was called once");
		});

		QUnit.test("with sap.ui5 entry and componentName", function(assert) {
			var oManifest = {
				"sap.ui5": {
					componentName: "componentName"
				}
			};
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest(oManifest), "componentName", "the componentName is returned");
			assert.equal(this.oGetAppIdStub.callCount, 0, "the function was not called");
		});

		QUnit.test("with sap.ui5 entry but without componentName", function(assert) {
			var oManifest = {
				"sap.ui5": {
					name: "name"
				}
			};
			assert.equal(ManifestUtils.getBaseComponentNameFromManifest(oManifest), "appId", "the appId is returned");
			assert.equal(this.oGetAppIdStub.callCount, 1, "the function was called once");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
