/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_V2Requestor"
], function (jQuery, asV2Requestor) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._V2Requestor", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	[{
		// empty object
	},{
		mFinalHeaders : {
			"Content-Type" : "foo"
		},
		mPredefinedPartHeaders : {
			"Accept" : "foo"
		},
		mPredefinedRequestHeaders : {
			"Accept" : "foo",
			"MaxDataServiceVersion" : "foo",
			"DataServiceVersion" : "foo",
			"X-CSRF-Token" : "foo"
		}
	}].forEach(function (oRequestor) {
		QUnit.test("check headers (V2): ", function (assert) {
			asV2Requestor(oRequestor);

			assert.deepEqual(oRequestor.mFinalHeaders, {
				"Content-Type" : "application/json;charset=UTF-8"
			});

			assert.deepEqual(oRequestor.mPredefinedPartHeaders, {
				"Accept" : "application/json"
			});

			assert.deepEqual(oRequestor.mPredefinedRequestHeaders, {
				"Accept" : "application/json",
				"MaxDataServiceVersion" : "2.0",
				"DataServiceVersion" : "2.0",
				"X-CSRF-Token" : "Fetch"
			});
		});
	});

	//*****************************************************************************************
	[{
		sCase : "Multiple Entities",
		oResponsePayload : {
			"d" : {
				"results" : [{
					"foo" : "bar"
				}]
			}
		},
		oExpectedResult : {
			"value" : [{
				"foo" : "bar"
			}]
		}
	}, {
		sCase : "Single Entity",
		oResponsePayload : {
			"d" : {
				"foo" : "bar"
			}
		},
		oExpectedResult : {
			"foo" : "bar"
		}
	}].forEach(function (oFixture) {
		QUnit.test("doConvertResponseToV4 (V2): " + oFixture.sCase, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.deepEqual(oRequestor.doConvertResponseToV4(oFixture.oResponsePayload),
				oFixture.oExpectedResult);
		});
	});
});