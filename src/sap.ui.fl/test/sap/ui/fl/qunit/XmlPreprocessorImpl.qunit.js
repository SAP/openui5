/*globals QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.XmlPreprocessorImpl");
jQuery.sap.require("sap.ui.fl.ChangePersistenceFactory");
jQuery.sap.require("sap.ui.fl.ChangePersistence");
jQuery.sap.require("sap.ui.fl.Utils");

(function(XmlPreprocessorImpl, ChangePersistenceFactory, ChangePersistence, Utils) {
	"use strict";

	QUnit.test("getCacheKey does return a cache key", function (assert) {
		var sCacheKey = "abc123";
		var sFlexReference = "theAppComponent";
		var mProperties = {
			componentId: sFlexReference
		};

		var oChangePersistence = new ChangePersistence(sFlexReference);
		this.stub(Utils, "getComponentClassName").returns(sFlexReference);
		this.stub(ChangePersistenceFactory, "getChangePersistenceForComponent").returns(oChangePersistence);
		this.stub(oChangePersistence, "getCacheKey").returns(Promise.resolve(sCacheKey));

		return XmlPreprocessorImpl.getCacheKey(mProperties).then(function (sReturnedCacheKey) {
			assert.equal(sReturnedCacheKey, sCacheKey);
		});
	});

}(sap.ui.fl.XmlPreprocessorImpl, sap.ui.fl.ChangePersistenceFactory, sap.ui.fl.ChangePersistence, sap.ui.fl.Utils));
