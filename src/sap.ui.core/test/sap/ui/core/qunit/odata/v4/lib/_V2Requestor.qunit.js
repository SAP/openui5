/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_V2Requestor"
], function (jQuery, asV2Requestor) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
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

	//*****************************************************************************************
	[{ // test dropSystemQueryOptions
		dropSystemQueryOptions : true,
		expectedResultHandlerCalls : [{key : "foo", value : "bar"}],
		queryOptions : {
			"$expand" : {"baz" : true, "nested" : {"$expand" : "xyz", "$select" : "uvw"}},
			"$select" : "abc",
			"foo" : "bar"
		}
	}, { // simple tests for $select
		expectedResultHandlerCalls : [{key : "$select", value : "foo,bar"}],
		expectedResultHandlerCallsSorted : [{key : "$select", value : "bar,foo"}],
		queryOptions : {"$select" : "foo,bar"} // $select as string
	}, {
		expectedResultHandlerCalls : [{key : "$select", value : "foo,bar"}],
		expectedResultHandlerCallsSorted : [{key : "$select", value : "bar,foo"}],
		queryOptions : {
			"$select" : ["foo", "bar"]
		}
	}, { // simple $expand tests
		expectedResultHandlerCalls : [
			{key : "$expand", value : "baz,bar"},
			{key : "$select", value : "baz/*,bar/*,*"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "bar,baz"},
			{key : "$select", value : "*,bar/*,baz/*"}
		],
		queryOptions : {
			"$expand" : {"baz" : true, "bar" : true}
		}
	}, {
		expectedResultHandlerCalls : [
			{key : "$expand", value : "xyz,bar"},
			{key : "$select", value : "foo,xyz/*,bar/*"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "bar,xyz"},
			{key : "$select", value : "bar/*,foo,xyz/*"}
		],
		queryOptions : {
			"$select" : ["foo"],
			"$expand" : {"xyz" : true, "bar" : true}
		}
	}, {
		expectedResultHandlerCalls : [
			{key : "$expand", value : "baz,bar"},
			{key : "$select", value : "baz/*,bar/cde,bar/abc,*"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "bar,baz"},
			{key : "$select", value : "*,bar/abc,bar/cde,baz/*"}
		],
		queryOptions : {
			"$expand" : {
				"baz" : true,
				"bar" : {
					"$select" : ["cde", "abc"]
				}
			}
		}
	}, {
		expectedResultHandlerCalls : [
			{key : "$expand", value : "baz,bar"},
			{key : "$select", value : "baz/*,bar/cde,bar/abc,*"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "bar,baz"},
			{key : "$select", value : "*,bar/abc,bar/cde,baz/*"}
		],
		queryOptions : {
			"$expand" : {
				"baz" : true,
				"bar" : {
					"$select" : "cde,abc" // $select as string
				}
			}
		}
	}, { // test nested $expand structure
		expectedResultHandlerCalls : [
			{key : "$expand", value : "foo,foo/bar,baz"},
			{key : "$select", value : "foo/xyz,foo/bar/*,baz/*,abc"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "baz,foo,foo/bar"},
			{key : "$select", value : "abc,baz/*,foo/bar/*,foo/xyz"}
		],
		queryOptions : {
			"$expand" : {
				"foo" : {
					"$select" : "xyz",
					"$expand" : {
						"bar" : true
					}
				},
				"baz" : true
			},
			"$select" : "abc"
		}
	}].forEach(function (oFixture, i) {
		var sTitle = "doConvertSystemQueryOptions (V2): " + i + ", mQueryOptions"
				+ JSON.stringify(oFixture.queryOptions);

		/**
		 * Executes the test for doConvertSystemQueryOptions.
		 *
		 * @param {string} sCurrentTitle The test title
		 * @param {object[]} aExpectedResultHandlerCalls An array of expected result handler calls.
		 *   Each array element is an object with a key and a value property.
		 * @param {boolean} bSorted Indicates whether to sort the $expand and $select entries
		 */
		function executeTest(sCurrentTitle, aExpectedResultHandlerCalls, bSorted) {
			QUnit.test(sCurrentTitle, function (assert) {
				var fnResultHandlerSpy = this.spy(),
					oRequestor = {};

				asV2Requestor(oRequestor);

				// code under test
				oRequestor.doConvertSystemQueryOptions(oFixture.queryOptions, fnResultHandlerSpy,
					oFixture.dropSystemQueryOptions, bSorted);

				assert.strictEqual(fnResultHandlerSpy.callCount,
					aExpectedResultHandlerCalls.length);
				aExpectedResultHandlerCalls.forEach(function (oResult, i) {
					var sCurrentKey = fnResultHandlerSpy.args[i][0],
						sCurrentValue = fnResultHandlerSpy.args[i][1];

					assert.strictEqual(sCurrentKey + "=" + sCurrentValue,
							oResult.key + "=" + oResult.value);
				});

			});
		}

		executeTest(sTitle, oFixture.expectedResultHandlerCalls);

		if (oFixture.expectedResultHandlerCallsSorted) {
			executeTest("(sorted) " + sTitle, oFixture.expectedResultHandlerCallsSorted, true);
		}
	});

	//*****************************************************************************************
	["foo", undefined, null].forEach(function (vExpandOption) {
		var sTitle = "doConvertSystemQueryOptions (V2): wrong $expand : " + vExpandOption;

		QUnit.test(sTitle, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.throws(function () {
				oRequestor.doConvertSystemQueryOptions({"$expand" : vExpandOption});
			}, new Error("$expand must be a valid object"));
		});
	});

	//*****************************************************************************************
	[{
		queryOptions : {"$foo" : "bar"},
		error : "Unsupported system query option: $foo"
	}, {
		queryOptions : {
			"$expand" : {
				"foo" : {
					"$bar" : "baz"
				}
			}
		},
		error : "Unsupported query option in $expand: $bar"
	}, {
		queryOptions : {
			"$expand" : {
				"foo" : {
					"bar" : "baz"
				}
			}
		},
		error : "Unsupported query option in $expand: bar"
	}].forEach(function (oFixture) {
		var sTitle = "doConvertSystemQueryOptions (V2): unsupported system query options : "
				+ JSON.stringify(oFixture.queryOptions);

		QUnit.test(sTitle, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.throws(function () {
				oRequestor.doConvertSystemQueryOptions(oFixture.queryOptions, function () {});
			}, new Error(oFixture.error));
		});
	});
});