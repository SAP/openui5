/*global QUnit*/
jQuery.sap.require("sap.ui.fl.XmlPreprocessorImpl");
jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.ChangePersistence");
jQuery.sap.require("sap.ui.fl.FlexControllerFactory");
jQuery.sap.require("sap.ui.fl.Utils");

(function(XmlPreprocessorImpl, ChangePersistenceFactory, ChangePersistence, FlexControllerFactory, Utils) {
	"use strict";

	QUnit.test("process is skipped if no cache key could be determined", function (assert) {
		var oView = {};
		var sFlexReference = "someName";
		var mPorpertyBag = {
			sync: false
		};
		var oMockedComponent = {
			getComponentClassName: function () {
				return sFlexReference;
			}
		};

		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		var oFlexControllerCreationStub = this.stub(FlexControllerFactory, "create");
		this.stub(oChangePersistence, "getCacheKey").returns(ChangePersistence.NOTAG);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent");

		this.stub(sap.ui.getCore(), "getComponent").returns(oMockedComponent);

		return XmlPreprocessorImpl.process(oView, mPorpertyBag).then(function () {
			assert.equal(oFlexControllerCreationStub.callCount, 0, "no flex controller creation was created for processing");
		});
	});

	QUnit.test("getCacheKey does return a cache key", function (assert) {
		var sCacheKey = "abc123";
		var sFlexReference = "theAppComponent";
		var mProperties = {
			componentId: sFlexReference
		};

		var oChangePersistence = new ChangePersistence({name: sFlexReference});
		this.stub(Utils, "getComponentClassName").returns(sFlexReference);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(sCacheKey));

		return XmlPreprocessorImpl.getCacheKey(mProperties).then(function (sReturnedCacheKey) {
			assert.equal(sReturnedCacheKey, sCacheKey);
		});
	});

}(sap.ui.fl.XmlPreprocessorImpl, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.ChangePersistence, sap.ui.fl.FlexControllerFactory, sap.ui.fl.Utils));
