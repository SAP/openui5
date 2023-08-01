/* global QUnit */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Component",
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor",
	"sap/ui/fl/apply/api/ControlVariantApplyAPI",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	Log,
	Component,
	FlexState,
	ManifestUtils,
	XmlPreprocessor,
	ControlVariantApplyAPI,
	ChangePersistence,
	ChangePersistenceFactory,
	FlexControllerFactory,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("XmlPreprocessor.getCacheKey", {
		beforeEach() {
			sandbox.stub(Component, "get").returnsArg(0);
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
			sandbox.stub(ControlVariantApplyAPI, "getVariantModel").resolves({
				getVariantManagementControlIds() {
					return [];
				},
				getCurrentControlVariantIds() {
					return [];
				}
			});
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, "abc123", "the correct cache key is returned");
		});

		QUnit.test("with cacheKey and multiple variants", async function(assert) {
			sandbox.stub(FlexState, "getStorageResponse").resolves({cacheKey: 'W/"abc123"'});
			sandbox.stub(ControlVariantApplyAPI, "getVariantModel").resolves({
				getVariantManagementControlIds() {
					return ["vmControl1", "vmControl2", "vmControl3"];
				},
				getCurrentControlVariantIds() {
					return ["vmControl1", "otherVariant", "otherVariant1"];
				}
			});
			const vCacheKey = await XmlPreprocessor.getCacheKey({componentId: "validComponent"});
			assert.strictEqual(vCacheKey, "abc123-otherVariant-otherVariant1", "the correct cache key is returned");
		});
	});

	QUnit.module("XmlPreprocessor.process", {
		afterEach: function() {
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
				getComponentClassName: function() {
					return sComponentName;
				}
			};
			var oMockedAppComponent = {
				getManifestObject: function() {
					return {};
				},
				getManifest: function() {
					return {};
				},
				getManifestEntry: function() {
					return undefined;
				},
				getComponentData: function() {
					return oComponentData;
				}
			};
			var oChangePersistence = new ChangePersistence({name: sFlexReference});
			var oFlexControllerCreationStub = sandbox.stub(FlexControllerFactory, "create").returns({
				processXmlView: function(oView) {
					return Promise.resolve(oView);
				}
			});
			sandbox.stub(Component, "get").returns(oMockedComponent);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "isApplication").returns(true);
			sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);

			return XmlPreprocessor.process(oView, mProperties).then(function(oProcessedView) {
				assert.equal(oFlexControllerCreationStub.callCount, 1, "a flex controller creation was triggered for the xml processing");
				assert.equal(oFlexControllerCreationStub.getCall(0).args[0], sFlexReference, "the controller for the variant was created");
				assert.deepEqual(oProcessedView, oView, "the original view is returned");
			});
		});

		QUnit.test("skips the processing in case of a synchronous view", function(assert) {
			var oView = {
				sId: "testView"
			};
			var mProperties = {
				sync: true
			};

			var oLoggerSpy = sandbox.spy(Log, "warning");

			var oProcessedView = XmlPreprocessor.process(oView, mProperties);

			assert.equal(oLoggerSpy.callCount, 1, "one warning was raised");
			assert.equal(oLoggerSpy.getCall(0).args[0], "Flexibility feature for applying changes on an XML view is only available for " +
				"asynchronous views; merge is be done later on the JS controls.");
			assert.deepEqual(oProcessedView, oView, "the original view is returned");
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
				getManifest: function() {
					return {};
				},
				getManifestEntry: function() {
					return undefined;
				},
				getComponentData: function() {
					return oComponentData;
				},
				getComponentClassName: function() {
					return sComponentName;
				}
			};

			sandbox.stub(Component, "get").returns(oMockedAppComponent);
			sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
			sandbox.stub(Utils, "isApplication").returns(true);

			return XmlPreprocessor.process(oView, mProperties).then(function(oProcessedView) {
				assert.deepEqual(oProcessedView, oView, "the original view is returned");
			});
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
