/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/lib/_V2Requestor"
], function (jQuery, _SyncPromise, asV2Requestor) {
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
	}, {
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

	//*********************************************************************************************
	[{
		bIsCollection : true,
		oResponsePayload : {
			"d" : {
				"results" : [{"String" : "foo"}, {"Boolean" : true}]
			}
		},
		oExpectedResult : {
			"value" : [{"String" : "foo"}, {"Boolean" : true}]
		}
	}, {
		bIsCollection : false,
		oResponsePayload : {
			"d" : {"String" : "foo"}
		},
		oExpectedResult : {"String" : "foo"}
	}, {
		bIsCollection : false,
		oResponsePayload : {
			"d" : {
				"__metadata" : {},
				"results" : "foo"
			}
		},
		oExpectedResult : {"__metadata" : {}, "results" : "foo"}
	}].forEach(function (oFixture, i) {
		QUnit.test("doFetchV4Response, " + i, function (assert) {
			var oObject  = oFixture.bIsCollection
					? oFixture.oResponsePayload.d.results
					: oFixture.oResponsePayload.d,
				oRequestor = {fnFetchEntityContainer : function () {}},
				oRequestorMock = this.mock(oRequestor),
				mTypeByName = {};

			asV2Requestor(oRequestor);

			oRequestorMock.expects("fnFetchEntityContainer").withExactArgs()
				.returns(_SyncPromise.resolve(mTypeByName));
			oRequestorMock.expects("convertNonPrimitive")
				.withExactArgs(sinon.match.same(oObject), sinon.match.same(mTypeByName));

			// code under test
			return oRequestor.doFetchV4Response(oFixture.oResponsePayload)
				.then(function (oPayload) {
					assert.deepEqual(oPayload, oFixture.oExpectedResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, complex value", function (assert) {
		var oObject = {
				__metadata : {type : "TypeQName"},
				complex : {__metadata : {type : "TypeQName"}, property : "42"}
			},
			oRequestor = {},
			oRequestorMock = this.mock(oRequestor),
			mTypeByName = {"TypeQName" : {property : {$Type : "Edm.Double"}}};

		asV2Requestor(oRequestor);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("42", "Edm.Double", "TypeQName", "property")
			.returns(42);

		// code under test
		oRequestor.convertNonPrimitive(oObject, mTypeByName);

		assert.strictEqual(oObject.__metadata, undefined, "V2 inline metadata deleted");
		assert.strictEqual(oObject.complex.property, 42);
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, value null", function (assert) {
		var oObject = {
				__metadata : {type : "TypeQName"},
				complex : null
			},
			oRequestor = {};

		asV2Requestor(oRequestor);

		// code under test
		oRequestor.convertNonPrimitive(oObject, {} /*mTypeByName not accessed by code under test*/);

		assert.strictEqual(oObject.__metadata, undefined, "V2 inline metadata deleted");
		assert.strictEqual(oObject.complex, null);
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, collection of complex values", function (assert) {
		var oObject = {
				__metadata : {type : "TypeQName"},
				complexCollection : [
					{__metadata : {type : "TypeQName"}, property : "42"},
					{__metadata : {type : "TypeQName"}, property : "77"}
				]
			},
			oRequestor = {},
			oRequestorMock = this.mock(oRequestor),
			mTypeByName = {"TypeQName" : {property : {$Type : "Edm.Double"}}};

		asV2Requestor(oRequestor);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("42", "Edm.Double", "TypeQName", "property")
			.returns(42);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("77", "Edm.Double", "TypeQName", "property")
			.returns(77);

		// code under test
		oRequestor.convertNonPrimitive(oObject, mTypeByName);

		assert.strictEqual(oObject.__metadata, undefined, "V2 inline metadata deleted");
		assert.strictEqual(oObject.complexCollection[0].property, 42);
		assert.strictEqual(oObject.complexCollection[1].property, 77);
	});

	//*********************************************************************************************
	[{}, undefined].forEach(function (oInlineMetadata, i) {
		QUnit.test("convertNonPrimitive, __metadata.type missing, " + i, function (assert) {
			var oObject = {
					__metadata : oInlineMetadata,
					property : "foo"
				},
				oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.throws(function () {
				oRequestor.convertNonPrimitive(oObject, {});
			}, new Error("Cannot convert complex value without type information in "
					+ "__metadata.type: " + JSON.stringify(oObject)));
		});
	});

	//*********************************************************************************************
	[
		{sType : "Edm.Binary", sConvertMethod : "convertBinary"},
		{sType : "Edm.Boolean"},
		{sType : "Edm.Byte"},
		{sType : "Edm.Decimal"},
		{sType : "Edm.Double", sConvertMethod : "convertDoubleFloatSingle"},
		{sType : "Edm.Guid"},
		{sType : "Edm.Int16"},
		{sType : "Edm.Int32"},
		{sType : "Edm.Int64"},
		{sType : "Edm.SByte"},
		{sType : "Edm.Single", sConvertMethod : "convertDoubleFloatSingle"},
		{sType : "Edm.String"}
	].forEach(function (oFixture) {
		QUnit.test("convertPrimitive, " + oFixture.sType, function (assert) {
			var oRequestor = {},
				vV2Value = {},
				vV4Value = {};

			asV2Requestor(oRequestor);
			if (oFixture.sConvertMethod) {
				this.mock(oRequestor).expects(oFixture.sConvertMethod)
					.withExactArgs(sinon.match.same(vV2Value))
					.returns(vV4Value);
			} else {
				vV4Value = vV2Value; // no conversion
			}

			// code under test
			assert.strictEqual(oRequestor.convertPrimitive(vV2Value, oFixture.sType, "property",
				"Type"), vV4Value);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertPrimitive, unknown type", function (assert) {
		var oRequestor = {};

		asV2Requestor(oRequestor);

		// code under test
		assert.throws(function () {
			oRequestor.convertPrimitive("foo", "Unknown", "Type", "Property");
		}, new Error("Type 'Unknown' of property 'Property' in type 'Type' is unknown; "
			+ "cannot convert value: foo"));
	});

	//*********************************************************************************************
	[{
		input : "A+A+",
		output : "A-A-"
	},
	{
		input : "A/A/",
		output :"A_A_"
	}	].forEach(function (oFixture, i) {
		QUnit.test("convertBinary, " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertBinary(oFixture.input), oFixture.output);
		});
	});
	//*********************************************************************************************
	[{
		input : "1.0000000000000001E63",
		output : 1.0000000000000001E63
	}, {
		input : "NaN",
		output : "NaN"
	}, {
		input : "INF",
		output : "INF"
	}, {
		input : "-INF",
		output : "-INF"
	}, {
		input : 42,
		output : 42
	}].forEach(function (oFixture, i) {
		QUnit.test("convertDoubleFloatSingle, " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertDoubleFloatSingle(oFixture.input),
				oFixture.output);
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