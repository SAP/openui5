/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/ODataMetadata",
	"sap/ui/test/TestUtils",
	"sap/ui/thirdparty/datajs"
], function (Log, ODataMetadata, TestUtils, OData) {
	/*global QUnit*/
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataMetadata (ODataMetadataNoFakeService)", {
		beforeEach : function () {
			var oLoadMetadataStub = this.stub(ODataMetadata.prototype, "_loadMetadata");

			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();

			// Stub ODataMetadata so that the constructor can be called w/o cachekey
			// With cachekey also the CacheManager needs to be stubbed.
			oLoadMetadataStub.callsFake(function () {
				return new Promise(function () {});
			});
			this.sUrl = "/some/url";
			this.oMetadata = new ODataMetadata(this.sUrl, {});
			oLoadMetadataStub.restore();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[true, false].forEach(function (bResolve) {
	var sTitle = "pLoadedWithReject: metadata loading " + ( bResolve ? "successful" : "failed" );

	QUnit.test(sTitle, function (assert) {
		var oHandlers = {
				resolved : function () {},
				rejected : function () {}
			},
			oHandlersMock = this.mock(oHandlers);

		// test the behavior of the pLoadedWithReject promise created in the constructor
		assert.ok(this.oMetadata.pLoadedWithReject, "pLoadedWithReject promise exists");
		// check that the pLoaded promise has the correct behavior
		if (bResolve) {
			oHandlersMock.expects("resolved");
			oHandlersMock.expects("rejected").never();
			this.oMetadata.fnResolve();
		} else {
			oHandlersMock.expects("resolved").never();
			oHandlersMock.expects("rejected");
			this.oMetadata.fnReject();
		}
		return this.oMetadata.pLoadedWithReject.then(oHandlers.resolved, oHandlers.rejected);
	});
});

	//*********************************************************************************************
	QUnit.test("pLoaded resolves successfully", function (assert) {
		var oHandlers = {
				resolved : function () {},
				rejected : function () {}
			},
			oHandlersMock = this.mock(oHandlers);

		// test the behavior of the pLoaded promise created in the constructor
		assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
		oHandlersMock.expects("resolved");
		oHandlersMock.expects("rejected").never();
		this.oMetadata.fnResolve();
		return this.oMetadata.pLoaded.then(oHandlers.resolved, oHandlers.rejected);
	});

	//*********************************************************************************************
	QUnit.test("pLoaded resolves successfully after reject", function (assert) {
		var that = this;

		// test the behavior of the pLoaded promise created in the constructor
		assert.ok(this.oMetadata.pLoaded, "pLoaded promise exists");
		this.oMetadata.fnReject();
		return this.oMetadata.pLoadedWithReject.catch(function () {
			that.oMetadata.fnResolve();
			return that.oMetadata.pLoaded;
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bReject) {
	var sTitle = "loaded returns " + ( bReject ? "pLoadedWithReject" : "pLoaded" );

	QUnit.test(sTitle, function (assert) {
		// code under test
		assert.strictEqual(this.oMetadata.loaded(bReject),
			bReject ? this.oMetadata.pLoadedWithReject : this.oMetadata.pLoaded);
	});
});

	//*********************************************************************************************
	QUnit.test("_handleLoaded calls fnResolve", function (assert) {
		var mResolvedParams = {entitySets : []};

		this.mock(this.oMetadata).expects("fnResolve").withExactArgs(mResolvedParams);

		// code under test
		this.oMetadata._handleLoaded({}, {}, /*bSuppressEvents*/true);
	});

	//*********************************************************************************************
	QUnit.test("_loadMetadata _handleError calls fnReject", function (assert) {
		var oError = {
				message : "Message",
				request : "Request",
				response : {
					statusCode : 503,
					statusText : "Status text",
					body : "Response body"
				}
			},
			oMetadataMock,
			oODataMock = this.mock(OData),
			oRequest = {};

		oError.statusCode = oError.response.statusCode;
		oError.statusText = oError.response.statusText;
		oError.responseText = oError.response.body;
		oMetadataMock = this.mock(this.oMetadata);
		oMetadataMock.expects("fnReject").withExactArgs(oError);
		oMetadataMock.expects("_createRequest").withExactArgs(this.sUrl).returns(oRequest);
		oODataMock.expects("request").callsFake(function (oRequest, fnHandleSuccess, fnHandleError, fnMetadata) {
			fnHandleError(oError);
			return {};
		});

		// code under test
		return this.oMetadata._loadMetadata(undefined, /*bSuppressEvents*/true).catch(function () {
			oODataMock.restore();
		});
	});
});