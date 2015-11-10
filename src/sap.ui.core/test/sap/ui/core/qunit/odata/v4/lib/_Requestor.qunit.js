/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Requestor", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("Requestor is an object, not a constructor function", function (assert) {
		assert.strictEqual(typeof Requestor, "object");
	});

	//*********************************************************************************************
	[{ // predefined headers can be overridden, but are not modified for later
		defaultHeaders : {"Accept" : "application/json;odata.metadata=full"},
		requestHeaders : {"OData-MaxVersion" : "5.0", "OData-Version" : "4.1"},
		result : {
			"Accept" : "application/json;odata.metadata=full",
			"OData-MaxVersion" : "5.0",
			"OData-Version" : "4.1"
		}
	}, {
		defaultHeaders : undefined,
		requestHeaders : undefined,
		result : {}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : undefined,
		result : {"Accept-Language" : "ab-CD"}
	}, {
		defaultHeaders : undefined,
		requestHeaders : {"Accept-Language" : "ab-CD"},
		result : {"Accept-Language" : "ab-CD"}
	}, {
		defaultHeaders : {"Accept-Language" : "ab-CD"},
		requestHeaders : {"foo" : "bar"},
		result : {"Accept-Language" : "ab-CD", "foo" : "bar"}
	}].forEach(function (mHeaders) {
		function clone(o) {
			return o && JSON.parse(JSON.stringify(o));
		}

		QUnit.test("request, headers: " + JSON.stringify(mHeaders), function (assert) {
			var mDefaultHeaders = clone(mHeaders.defaultHeaders),
				oDeferred = new jQuery.Deferred(),
				oPromise,
				mRequestHeaders = clone(mHeaders.requestHeaders),
				oRequestor = Requestor.create("/sap/opu/local_v4/IWBEP/TEA_BUSI/",
					mDefaultHeaders),
				oResult = {},
				// add predefined request headers for OData v4
				mResultHeaders = jQuery.extend({}, {
					"Accept" : "application/json;odata.metadata=minimal",
					"OData-MaxVersion" : "4.0",
					"OData-Version" : "4.0"
				}, mHeaders.result);

			oDeferred.resolve(oResult);
			this.oSandbox.mock(jQuery).expects("ajax")
				.withExactArgs("/sap/opu/local_v4/IWBEP/TEA_BUSI/Employees", {
					headers : mResultHeaders,
					method : "GET"
				}).returns(oDeferred);

			// code under test
			oPromise = oRequestor.request("GET", "Employees", mRequestHeaders);

			assert.deepEqual(mDefaultHeaders, mHeaders.defaultHeaders,
				"caller's map is unchanged");
			assert.deepEqual(mRequestHeaders, mHeaders.requestHeaders,
				"caller's map is unchanged");
			assert.ok(oPromise instanceof Promise);
			return oPromise.then(function(result){
					assert.strictEqual(result, oResult);
				});
		});
	});
	//TODO check that service URL ends with a slash!
});
