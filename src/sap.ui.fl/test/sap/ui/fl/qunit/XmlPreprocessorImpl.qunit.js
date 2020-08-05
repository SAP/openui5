/*global QUnit*/

sap.ui.define([
	"sap/ui/fl/XmlPreprocessorImpl",
	"sap/ui/fl/ChangePersistenceFactory",
	"sap/ui/fl/ChangePersistence",
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/thirdparty/jquery"
],
function(
	XmlPreprocessorImpl,
	ChangePersistenceFactory,
	ChangePersistence,
	FlexControllerFactory,
	Utils,
	Log,
	sinon,
	jQuery
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given sap.ui.fl.XmlPreprocessorImpl", {
		afterEach: function () {
			sandbox.restore();
		}
	});

	QUnit.test("process xml view is called if cache key could be determined", function (assert) {
		var oView = {
			sId: "testView"
		};
		var sFlexReference = "someName";
		var sAppVersion = "1.0.0";
		var mProperties = {
			sync: false
		};
		var oMockedComponent = {
			getComponentClassName: function () {
				return sFlexReference;
			}
		};
		var oMockedAppComponent = {
			getManifestObject: function () {
				return {};
			},
			getManifest: function () {
				return {};
			},
			getManifestEntry: function () {}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		var oFlexControllerCreationStub = sandbox.stub(FlexControllerFactory, "create").returns({
			processXmlView: function(oView) {
				return Promise.resolve(oView);
			}
		});
		sandbox.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getComponentName").returns(sFlexReference);
		sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		sandbox.stub(Utils, "isApplication").returns(true);
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		sandbox.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve("abc123"));

		return XmlPreprocessorImpl.process(oView, mProperties).then(function (oProcessedView) {
			assert.equal(oFlexControllerCreationStub.callCount, 1, "a flex controller was created for processing");
			assert.deepEqual(oProcessedView, oView, "a processed view is returned");
		});
	});

	QUnit.test("xml view is returned even if problem happen when getting cache key", function (assert) {
		var oView = {
			sId: "testView"
		};
		var sFlexReference = "someName";
		var sAppVersion = "1.0.0";
		var mProperties = {
			sync: false
		};
		var oMockedComponent = {
			getComponentClassName: function () {
				return sFlexReference;
			}
		};
		var oMockedAppComponent = {
			getManifest: function () {
				return {};
			}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		var oFlexControllerCreationStub = sandbox.stub(FlexControllerFactory, "create").returns({
			processXmlView: function(oView) {
				return Promise.resolve(oView);
			}
		});
		sandbox.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getComponentName").returns(sFlexReference);
		sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		sandbox.stub(Utils, "isApplication").returns(true);
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);

		return XmlPreprocessorImpl.process(oView, mProperties).then(function (oProcessedView) {
			assert.equal(oFlexControllerCreationStub.callCount, 0, "no flex controller creation was created for processing");
			assert.deepEqual(oProcessedView, oView, "the original view is returned");
		});
	});

	QUnit.test("getCacheKey does return a cache key", function (assert) {
		var sCacheKey = "abc123";
		var sFlexReference = "theAppComponent";
		var mProperties = {
			componentId: sFlexReference
		};
		var oMockedAppComponent = {
			getManifest: function () {
				return {};
			},
			getManifestEntry: function () {}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		sandbox.stub(sap.ui.getCore(), "getComponent");
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getComponentName");
		sandbox.stub(Utils, "getAppVersionFromManifest");
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		sandbox.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(sCacheKey));

		return XmlPreprocessorImpl.getCacheKey(mProperties).then(function (sReturnedCacheKey) {
			assert.equal(sReturnedCacheKey, sCacheKey);
		});
	});

	QUnit.test("getCacheKey disallows view caching in case of an variant by startup parameters", function (assert) {
		var sFlexReference = "theAppComponent";
		var mProperties = {
			componentId: sFlexReference
		};
		var oComponentData = {
			startupParameters: {
				"sap-app-id": ["someId"]
			}
		};
		var oMockedAppComponent = {
			getManifest: function () {
				return {};
			},
			getComponentData: function () {
				return oComponentData;
			},
			getManifestEntry: function () {}
		};
		sandbox.stub(sap.ui.getCore(), "getComponent");
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);

		return XmlPreprocessorImpl.getCacheKey(mProperties).then(function (response) {
			assert.ok(!response, "an 'undefined' was returned to prevent the view caching");
		});
	});

	QUnit.test("detects the app variant id and requests the changes for it", function (assert) {
		var oView = {
			sId: "testView"
		};
		var sComponentName = "someComponentName";
		var sFlexReference = "someVariantName";
		var sAppVersion = "1.0.0";
		var sValidCacheKey = "someVeryValidKey";
		var mProperties = {
			sync: false
		};

		var oComponentData = {
			startupParameters: {
				"sap-app-id": [sFlexReference]
			}
		};

		var oMockedComponent = {
			getComponentClassName: function () {
				return sComponentName;
			}
		};
		var oMockedAppComponent = {
			getManifestObject: function () {
				return {};
			},
			getManifest: function () {
				return {};
			},
			getManifestEntry: function () {
				return undefined;
			},
			getComponentData: function () {
				return oComponentData;
			}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		var oFlexControllerCreationStub = sandbox.stub(FlexControllerFactory, "create").returns({
			processXmlView: function(oView) {
				return Promise.resolve(oView);
			}
		});
		sandbox.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		sandbox.stub(Utils, "isApplication").returns(true);
		sandbox.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		sandbox.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(sValidCacheKey));

		return XmlPreprocessorImpl.process(oView, mProperties).then(function (oProcessedView) {
			assert.equal(oFlexControllerCreationStub.callCount, 1, "a flex controller creation was triggered for the xml processing");
			assert.equal(oFlexControllerCreationStub.getCall(0).args[0], sFlexReference, "the controller for the variant was created");
			assert.deepEqual(oProcessedView, oView, "the original view is returned");
		});
	});


	QUnit.test("skips the processing in case of a synchronous view", function (assert) {
		var oView = {
			sId: "testView"
		};
		var mProperties = {
			sync: true
		};

		var oLoggerSpy = sandbox.spy(Log, "warning");

		var oProcessedView = XmlPreprocessorImpl.process(oView, mProperties);

		assert.equal(oLoggerSpy.callCount, 1, "one warning was raised");
		assert.equal(oLoggerSpy.getCall(0).args[0], "Flexibility feature for applying changes on an XML view is only available for " +
			"asynchronous views; merge is be done later on the JS controls.");
		assert.deepEqual(oProcessedView, oView, "the original view is returned");
	});

	QUnit.test("skips the processing in case of a component whose type is not application", function (assert) {
		var oView = {
			sId: "testView"
		};
		var mProperties = {
			sync: false
		};
		var sComponentName = "someComponentName";
		var sAppVersion = "1.0.0";

		var oComponentData = {
			startupParameters: {
				"sap-app-id": ["someId"]
			}
		};

		var oMockedAppComponent = {
			getManifest: function () {
				return {};
			},
			getManifestEntry: function () {
				return undefined;
			},
			getComponentData: function () {
				return oComponentData;
			},
			getComponentClassName: function () {
				return sComponentName;
			}
		};

		sandbox.stub(sap.ui.getCore(), "getComponent").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		sandbox.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		sandbox.stub(Utils, "isApplication").returns(true);

		return XmlPreprocessorImpl.process(oView, mProperties).then(function (oProcessedView) {
			assert.deepEqual(oProcessedView, oView, "the original view is returned");
		});
	});

	QUnit.done(function () {
		jQuery('#qunit-fixture').hide();
	});
});
