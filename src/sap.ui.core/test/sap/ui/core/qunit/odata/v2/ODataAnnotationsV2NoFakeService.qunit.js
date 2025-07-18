sap.ui.define([
	"sap/ui/model/odata/v2/ODataAnnotations",
	"sap/ui/thirdparty/jquery"
], function(ODataAnnotations, jQuery) {
	"use strict";

	/*global QUnit, sinon*/
	QUnit.module("sap.ui.model.odata.v2.ODataAnnotations (ODataAnnotationsV2NoFakeService)");

[true, false, undefined, "~vInvalidValue"].forEach((vWithCredentials) => {
	QUnit.test(`constructor sets withCredentials to: '${vWithCredentials === true ? true : false}'`, function (assert) {
		const oMetadata = {
			loaded() {}
		};
		this.mock(oMetadata).expects("loaded").withExactArgs().returns("~pMetadataLoaded");
		this.mock(ODataAnnotations.prototype).expects("setHeaders").withExactArgs("~oHeaders");
		this.mock(ODataAnnotations.prototype).expects("addSource").withExactArgs("~sSource").returns("~pLoaded");

		// code under test
		const oODataAnnotations = new ODataAnnotations(oMetadata, {source: "~sSource", headers: "~oHeaders",
			withCredentials: vWithCredentials, skipMetadata: true});

		assert.strictEqual(oODataAnnotations.bWithCredentials, (vWithCredentials === true ? true : false));
		assert.strictEqual(oODataAnnotations._oMetadata, oMetadata);
		assert.strictEqual(oODataAnnotations._pLoaded, "~pLoaded");
		assert.deepEqual(oODataAnnotations._mCustomHeaders, {});
		assert.deepEqual(oODataAnnotations._mAnnotations, {});
		assert.strictEqual(oODataAnnotations._hasErrors, false);
		assert.strictEqual(oODataAnnotations.sCacheKey, undefined);
	});
});

[true, false].forEach((bWithCredentials) => {
	QUnit.test(`_loadUrl ${bWithCredentials ? "does" : "does not"} propagate withCredentials`, function (assert) {
		const oODataAnnotations = {
			bWithCredentials: bWithCredentials,
			_getHeaders() {},
			_loadURL() {}
		};
		const mSource = {
			data: "~sData",
			type: "url" // has to be set to 'url' or else assert throws error
		};
		const oAjaxRequest = {
			done() {},
			fail() {}
		};
		this.mock(oODataAnnotations).expects("_getHeaders").withExactArgs().returns("~oHeaders");
		this.mock(jQuery).expects("ajax")
			.withExactArgs(sinon.match((mAjaxOptions) => {
				assert.strictEqual(mAjaxOptions.url, "~sData");
				assert.strictEqual(mAjaxOptions.async, true);
				assert.deepEqual(mAjaxOptions.headers, "~oHeaders");
				if (bWithCredentials) {
					assert.strictEqual(mAjaxOptions.xhrFields.withCredentials, bWithCredentials);
				} else {
					assert.ok(!mAjaxOptions.hasOwnProperty("xhrFields"));
				}
				return true;
			}))
			.returns(oAjaxRequest);
		this.mock(oAjaxRequest).expects("done").withExactArgs(sinon.match.func).returns(oAjaxRequest);
		this.mock(oAjaxRequest).expects("fail").withExactArgs(sinon.match.func).returns();

		// code under test
		ODataAnnotations.prototype._loadUrl.call(oODataAnnotations, mSource);
	});
});
});