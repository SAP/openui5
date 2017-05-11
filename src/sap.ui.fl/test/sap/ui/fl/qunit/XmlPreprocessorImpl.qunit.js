/*global QUnit*/
jQuery.sap.require("sap.ui.fl.XmlPreprocessorImpl");
jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.ChangePersistence");
jQuery.sap.require("sap.ui.fl.FlexControllerFactory");
jQuery.sap.require("sap.ui.fl.Utils");

(function(XmlPreprocessorImpl, ChangePersistenceFactory, ChangePersistence, FlexControllerFactory, Utils) {
	"use strict";

	QUnit.test("process is skipped if no cache key could be determined", function (assert) {
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
		var oChangePersistence = new ChangePersistence({name: sFlexReference, appVersion: sAppVersion});
		var oFlexControllerCreationStub = this.stub(FlexControllerFactory, "create");
		this.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		this.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		this.stub(Utils, "getComponentName").returns(sFlexReference);
		this.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(ChangePersistence.NOTAG));

		return XmlPreprocessorImpl.process(oView, mProperties).then(function (oProcessedView) {
			assert.equal(oFlexControllerCreationStub.callCount, 0, "no flex controller creation was created for processing");
			assert.deepEqual(oProcessedView, oView, "the original view is returned");
		});
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
			getManifest: function () {
				return {};
			}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		var oFlexControllerCreationStub = this.stub(FlexControllerFactory, "create").returns({
			processXmlView: function(oView, mProperties){
				return Promise.resolve(oView);
			}
		});
		this.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		this.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		this.stub(Utils, "getComponentName").returns(sFlexReference);
		this.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve("abc123"));

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
		var oFlexControllerCreationStub = this.stub(FlexControllerFactory, "create").returns({
			processXmlView: function(oView, mProperties){
				return Promise.resolve(oView);
			}
		});
		this.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);
		this.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		this.stub(Utils, "getComponentName").returns(sFlexReference);
		this.stub(Utils, "getAppVersionFromManifest").returns(sAppVersion);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.reject());

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
			}
		};
		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		this.stub(sap.ui.getCore(), "getComponent");
		this.stub(Utils, "getAppComponentForControl").returns(oMockedAppComponent);
		this.stub(Utils, "getComponentName");
		this.stub(Utils, "getAppVersionFromManifest");
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(sCacheKey));

		return XmlPreprocessorImpl.getCacheKey(mProperties).then(function (sReturnedCacheKey) {
			assert.equal(sReturnedCacheKey, sCacheKey);
		});
	});

}(sap.ui.fl.XmlPreprocessorImpl, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.ChangePersistence, sap.ui.fl.FlexControllerFactory, sap.ui.fl.Utils));
