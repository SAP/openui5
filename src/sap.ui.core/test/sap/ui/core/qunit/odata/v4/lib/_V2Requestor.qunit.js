/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/lib/_V2Requestor",
	"sap/ui/model/odata/ODataUtils"
], function (jQuery, DateFormat, _SyncPromise, asV2Requestor, ODataUtils) {
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
				"__count": "3",
				"__next": "...?$skiptoken=12",
				"results" : [{"String" : "foo"}, {"Boolean" : true}]
			}
		},
		oExpectedResult : {
			"@odata.count" : "3", // Note: v4.ODataModel uses IEEE754Compatible=true
			"@odata.nextLink" : "...?$skiptoken=12",
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
		QUnit.test("doConvertResponse, " + i, function (assert) {
			var oRequestor = {fnFetchEntityContainer : function () {}},
				oRequestorMock = this.mock(oRequestor);

			asV2Requestor(oRequestor);

			oRequestorMock.expects("convertNonPrimitive")
				.withExactArgs(sinon.match.same(oFixture.oResponsePayload.d))
				.returns(oFixture.bIsCollection
					? oFixture.oResponsePayload.d.results
					: oFixture.oResponsePayload.d);

			// code under test
			assert.deepEqual(oRequestor.doConvertResponse(oFixture.oResponsePayload),
				oFixture.oExpectedResult);
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
			oType = {property : {$Type : "Edm.Double"}};

		asV2Requestor(oRequestor);
		oRequestorMock.expects("getTypeForName").twice().withExactArgs("TypeQName").returns(oType);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("42", "Edm.Double", "TypeQName", "property")
			.returns(42);

		// code under test
		oRequestor.convertNonPrimitive(oObject);

		assert.deepEqual(oObject, {"complex" : {"property" : 42}});
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, value null", function (assert) {
		var oConvertedObject,
			oObject = {
				__metadata : {type : "TypeQName"},
				complex : null
			},
			oRequestor = {};

		asV2Requestor(oRequestor);
		this.mock(oRequestor).expects("getTypeForName").withExactArgs("TypeQName").returns({});

		// code under test
		oConvertedObject = oRequestor.convertNonPrimitive(oObject);

		assert.deepEqual(oConvertedObject, {complex : null});
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, collection of complex values", function (assert) {
		var oConvertedObject,
			oObject = {
				__metadata : {type : "TypeQName"},
				complexCollection : {
					results : [
						{__metadata : {type : "TypeQName"}, property : "42"},
						{__metadata : {type : "TypeQName"}, property : "77"}
					]
				}
			},
			oRequestor = {},
			oRequestorMock = this.mock(oRequestor),
			oType = {property : {$Type : "Edm.Double"}};

		asV2Requestor(oRequestor);
		oRequestorMock.expects("getTypeForName").thrice().withExactArgs("TypeQName").returns(oType);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("42", "Edm.Double", "TypeQName", "property")
			.returns(42);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("77", "Edm.Double", "TypeQName", "property")
			.returns(77);

		// code under test
		oConvertedObject = oRequestor.convertNonPrimitive(oObject);

		assert.deepEqual(oConvertedObject, {
			"complexCollection" : [
				{"property" : 42},
				{"property" : 77}
			]
		});
	});

	//*********************************************************************************************
	QUnit.test("convertNonPrimitive, __deferred (& 'for' loop & recursion)", function (assert) {
		var fnConvertNonPrimitive,
			oObject = {
				__metadata : {type : "TypeQName"},
				complex : {},
				missing : null,
				Products : {
					__deferred: {}
				},
				property : "42"
			},
			oRequestor = {},
			oType = {property : {$Type : "Edm.Double"}};

		asV2Requestor(oRequestor);
		// remember original function, do not call mock as "code under test" ;-)
		fnConvertNonPrimitive = oRequestor.convertNonPrimitive.bind(oRequestor);

		this.mock(oRequestor).expects("getTypeForName").withExactArgs("TypeQName").returns(oType);
		this.mock(oRequestor).expects("convertNonPrimitive")
			.withExactArgs(sinon.match.same(oObject.complex))
			.returns(oObject.complex);
		this.mock(oRequestor).expects("convertPrimitive")
			.withExactArgs(oObject.property, "Edm.Double", "TypeQName", "property")
			.returns(42);

		// code under test
		fnConvertNonPrimitive(oObject);

		assert.deepEqual(oObject, {
			complex : {},
			missing : null,
			property : 42
		}, "__deferred navigation property deleted");
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
		{sType : "Edm.Date", sConvertMethod : "convertDate"},
		{sType : "Edm.DateTimeOffset", sConvertMethod : "convertDateTimeOffset"},
		{sType : "Edm.Decimal"},
		{sType : "Edm.Double", sConvertMethod : "convertDoubleSingle"},
		{sType : "Edm.Guid"},
		{sType : "Edm.Int16"},
		{sType : "Edm.Int32"},
		{sType : "Edm.Int64"},
		{sType : "Edm.SByte"},
		{sType : "Edm.Single", sConvertMethod : "convertDoubleSingle"},
		{sType : "Edm.String"},
		{sType : "Edm.TimeOfDay", sConvertMethod : "convertTimeOfDay"}
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
	}, {
		input : "A/A/",
		output :"A_A_"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertBinary, " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertBinary(oFixture.input), oFixture.output);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertDate, success", function (assert) {
		var oRequestor = {};

		asV2Requestor(oRequestor);

		// code under test
		assert.strictEqual(oRequestor.convertDate("\/Date(1395705600000)\/"), "2014-03-25");
	});

	//*********************************************************************************************
	[{
		input : "/Date(1395705600001)/",
		expectedError : "Cannot convert Edm.DateTime value '/Date(1395705600001)/' to Edm.Date" +
			" because it contains a time of day"
	}, {
		input : "a/Date(0000000000000)/",
		expectedError : "Not a valid Edm.DateTime value 'a/Date(0000000000000)/'"
	}, {
		input : "/Date(0000000000000)/e",
		expectedError : "Not a valid Edm.DateTime value '/Date(0000000000000)/e'"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertDate, error " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			assert.throws(function () {
				// code under test
				return oRequestor.convertDate(oFixture.input);
			}, new Error(oFixture.expectedError));
		});
	});

	//*********************************************************************************************
	[{
		input : "/Date(1420529121547+0000)/",
		output : "2015-01-06T07:25:21.547Z"
	}, {
		input : "/Date(1420529121547+0500)/",
		output : "2015-01-06T12:25:21.547+05:00"
	}, {
		input : "/Date(1420529121547+1500)/",
		output : "2015-01-06T22:25:21.547+15:00"
	}, {
		input : "/Date(1420529121547+0530)/",
		output : "2015-01-06T12:55:21.547+05:30"
	}, {
		input : "/Date(1420529121547+0030)/",
		output : "2015-01-06T07:55:21.547+00:30"
	}, {
		input : "/Date(1420529121547-0530)/",
		output : "2015-01-06T01:55:21.547-05:30"
	}, {
		input : "/Date(1395752399000)/", // DateTime in V2
		output : "2014-03-25T12:59:59.000Z"  // must be interpreted as UTC
	}].forEach(function (oFixture, i) {
		QUnit.test("convertDateTimeOffset, success " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertDateTimeOffset(oFixture.input), oFixture.output);
		});
	});

	//*********************************************************************************************
	[{
		input : "a/Date(0000000000000+0000)/",
		expectedError : "Not a valid Edm.DateTimeOffset value 'a/Date(0000000000000+0000)/'"
	}, {
		input : "/Date(0000000000000+0000)/e",
		expectedError : "Not a valid Edm.DateTimeOffset value '/Date(0000000000000+0000)/e'"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertDateTimeOffset, error " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			assert.throws(function () {
				// code under test
				return oRequestor.convertDateTimeOffset(oFixture.input);
			}, new Error(oFixture.expectedError));
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
		QUnit.test("convertDoubleSingle, " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertDoubleSingle(oFixture.input),
				oFixture.output);
		});
	});

	//*********************************************************************************************
	[{
		input : "PT11H33M55S",
		output : "11:33:55"
	}, {
		input : "PT11H",
		output : "11:00:00"
	}, {
		input : "PT33M",
		output : "00:33:00"
	}, {
		input : "PT55S",
		output : "00:00:55"
	}, {
		input : "PT11H33M55.1234567S",
		output : "11:33:55.1234567"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertTimeOfDay, success " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertTimeOfDay(oFixture.input), oFixture.output);
		});
	});

	//*********************************************************************************************
	[{
		input : "APT11H33M55S",
		expectedError : "Not a valid Edm.Time value 'APT11H33M55S'"
	}, {
		input : "PT11H33M55S123",
		expectedError : "Not a valid Edm.Time value 'PT11H33M55S123'"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertTimeOfDay, error " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			assert.throws(function () {
				// code under test
				return oRequestor.convertTimeOfDay(oFixture.input);
			}, new Error(oFixture.expectedError));
		});
	});

	//*********************************************************************************************
	[{ // test dropSystemQueryOptions
		dropSystemQueryOptions : true,
		expectedResultHandlerCalls : [{key : "foo", value : "bar"}],
		queryOptions : {
			"$expand" : {"baz" : true, "nested" : {"$expand" : "xyz", "$select" : "uvw"}},
			"$select" : "abc",
			"$orderby" : "abc",
			"foo" : "bar"
		}
	}, { // simple tests for $count
		expectedResultHandlerCalls : [{key : "$inlinecount", value : "allpages"}],
		expectedResultHandlerCallsSorted : [{key : "$inlinecount", value : "allpages"}],
		queryOptions : {"$count" : true}
	}, {
		expectedResultHandlerCalls : [{key : "$inlinecount", value : "none"}],
		expectedResultHandlerCallsSorted : [{key : "$inlinecount", value : "none"}],
		queryOptions : {"$count" : false}
	}, { // simple tests for $orderby
		expectedResultHandlerCalls : [{key : "$orderby", value : "foo,bar"}],
		expectedResultHandlerCallsSorted : [{key : "$orderby", value : "foo,bar"}],
		queryOptions : {"$orderby" : "foo,bar"}
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
			{key : "$orderby", value : "foo,bar"},
			{key : "$select", value : "foo/xyz,foo/bar/*,baz/*,abc"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "baz,foo,foo/bar"},
			{key : "$orderby", value : "foo,bar"},
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
			"$select" : "abc",
			"$orderby" : "foo,bar"
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
				oRequestor.doConvertSystemQueryOptions("Foo", oFixture.queryOptions,
					fnResultHandlerSpy, oFixture.dropSystemQueryOptions, bSorted);

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

	//*********************************************************************************************
	["foo", undefined, null].forEach(function (vExpandOption) {
		var sTitle = "doConvertSystemQueryOptions (V2): wrong $expand : " + vExpandOption;

		QUnit.test(sTitle, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.throws(function () {
				oRequestor.doConvertSystemQueryOptions("Foo", {"$expand" : vExpandOption});
			}, new Error("$expand must be a valid object"));
		});
	});

	//*********************************************************************************************
	[{
		queryOptions : {"$foo" : "bar"},
		error : "Unsupported system query option: $foo"
	}, {
		queryOptions : {
			"$expand" : {
				"foo" : {
					"$orderby" : "bar"
				}
			}
		},
		error : "Unsupported query option in $expand: $orderby"
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
					"$count" : true
				}
			}
		},
		error : "Unsupported query option in $expand: $count"
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
				oRequestor.doConvertSystemQueryOptions("Foo", oFixture.queryOptions,
					function () {});
			}, new Error(oFixture.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("doConvertSystemQueryOptions: $filter", function (assert) {
		var sFilter = "foo eq 'bar'",
			oRequestor = {},
			fnResultHandlerSpy = sinon.spy();

		asV2Requestor(oRequestor);

		this.mock(oRequestor).expects("convertFilter")
			.withExactArgs(sFilter, "Foo").returns("~");

		// code under test
		oRequestor.doConvertSystemQueryOptions("Foo", {$filter : sFilter},
			fnResultHandlerSpy);

		sinon.assert.calledOnce(fnResultHandlerSpy);
		sinon.assert.calledWithExactly(fnResultHandlerSpy, "$filter", "~");
	});

	//*********************************************************************************************
	[
		"Boolean", "Byte", "Decimal", "Double", "Guid", "Int16", "Int32", "Int64", "SByte",
		"Single", "String"
	].forEach(function (sType) {
		sType = "Edm." + sType;

		QUnit.test("formatPropertyAsLiteral: " + sType, function (assert) {
			var sKeyPredicate = "(~)",
				oProperty = {
					"$kind" : "Property",
					"$Type" : sType
				},
				oRequestor = {},
				sResult,
				vValue = {};

			asV2Requestor(oRequestor);

			this.mock(ODataUtils).expects("formatValue")
				.withExactArgs(sinon.match.same(vValue), sType)
				.returns(sKeyPredicate);

			// code under test
			sResult = oRequestor.formatPropertyAsLiteral(vValue, oProperty);

			assert.strictEqual(sResult, sKeyPredicate);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral: Edm.Date", function (assert) {
		var oExpectation,
			oFormatOptions,
			sKeyPredicate = "(~)",
			oProperty = {
				"$kind" : "Property",
				"$Type" : "Edm.Date",
				"$v2Type" : "Edm.DateTime"
			},
			oRequestor = {},
			sResult,
			vV2Value = {},
			vV4Value = {};

		asV2Requestor(oRequestor);

		oExpectation = this.mock(DateFormat.prototype).expects("parse")
			.withExactArgs(sinon.match.same(vV4Value)).returns(vV2Value);
		this.mock(ODataUtils).expects("formatValue")
			.withExactArgs(sinon.match.same(vV2Value), "Edm.DateTime")
			.returns(sKeyPredicate);

		// code under test
		sResult = oRequestor.formatPropertyAsLiteral(vV4Value, oProperty);

		assert.strictEqual(sResult, sKeyPredicate);
		oFormatOptions = oExpectation.firstCall.thisValue.oFormatOptions;
		assert.deepEqual(oFormatOptions.pattern, "yyyy-MM-dd");
		assert.strictEqual(oFormatOptions.UTC, true);
	});

	//*********************************************************************************************
	[undefined, "Edm.DateTime"].forEach(function (sV2Type) {
		var sTitle = "formatPropertyAsLiteral: Edm.DateTimeOffset, v2Type=" + sV2Type;

		QUnit.test(sTitle, function (assert) {
			var oExpectation,
				oFormatOptions,
				sKeyPredicate = "(~)",
				oProperty = {
					"$kind" : "Property",
					"$Type" : "Edm.DateTimeOffset",
					"$v2Type" : sV2Type
				},
				oRequestor = {},
				sResult,
				vV2Value = {},
				vV4Value = {};

			asV2Requestor(oRequestor);

			oExpectation = this.mock(DateFormat.prototype).expects("parse")
				.withExactArgs(sinon.match.same(vV4Value)).returns(vV2Value);
			this.mock(ODataUtils).expects("formatValue")
				.withExactArgs(sinon.match.same(vV2Value), sV2Type || "Edm.DateTimeOffset")
				.returns(sKeyPredicate);

			// code under test
			sResult = oRequestor.formatPropertyAsLiteral(vV4Value, oProperty);

			assert.strictEqual(sResult, sKeyPredicate);
			oFormatOptions = oExpectation.firstCall.thisValue.oFormatOptions;
			assert.deepEqual(oFormatOptions.pattern, "yyyy-MM-dd'T'HH:mm:ss.SSSZ");
			assert.strictEqual(oFormatOptions.UTC, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral: Edm.TimeOfDay", function (assert) {
		var oDate = {
				getTime : function () {}
			},
			oExpectation,
			oFormatOptions,
			sKeyPredicate = "(~)",
			oProperty = {
				"$kind" : "Property",
				"$Type" : "Edm.TimeOfDay",
				"$v2Type" : "Edm.Time"
			},
			oRequestor = {},
			sResult,
			iTicks = 42,
			vV4Value = {};

		asV2Requestor(oRequestor);

		oExpectation = this.mock(DateFormat.prototype).expects("parse")
			.withExactArgs(sinon.match.same(vV4Value)).returns(oDate);
		this.mock(oDate).expects("getTime").withExactArgs().returns(iTicks);
		this.mock(ODataUtils).expects("formatValue")
			.withExactArgs({__edmType : "Edm.Time", ms : iTicks}, "Edm.Time")
			.returns(sKeyPredicate);

		// code under test
		sResult = oRequestor.formatPropertyAsLiteral(vV4Value, oProperty);

		assert.strictEqual(sResult, sKeyPredicate);
		oFormatOptions = oExpectation.firstCall.thisValue.oFormatOptions;
		assert.deepEqual(oFormatOptions.pattern, "HH:mm:ss");
		assert.strictEqual(oFormatOptions.UTC, true);
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral: examples", function (assert) {
		var oRequestor = {};

		asV2Requestor(oRequestor);

		[
			{value : 3.14, type : "Edm.Single", result : "3.14f"},
			{value : 3.14, type : "Edm.Double", result : "3.14d"},
			{value : "3.14", type : "Edm.Decimal", result : "3.14m"},
			{value : "3.14", type : "Edm.Int64", result : "3.14l"},
			{value : "2015-05-23", type : "Edm.Date", v2type : "Edm.DateTime",
				result : "datetime'2015-05-23T00:00:00'"},
			{value : "2015-05-23T13:47:26Z", type : "Edm.DateTimeOffset",
				result : "datetimeoffset'2015-05-23T13:47:26Z'"},
			// The value is intermediately converted to a Date (V2 model format) resulting in a loss
			// of timezone information
			{value : "2015-05-23T18:47:26+0500", type : "Edm.DateTimeOffset",
				result : "datetimeoffset'2015-05-23T13:47:26Z'"},
			{value : "2015-05-23T13:47:26Z", type : "Edm.DateTimeOffset",
				v2type: "Edm.DateTime", result : "datetime'2015-05-23T13:47:26'"},
			{value : "13:47:26", type : "Edm.TimeOfDay", v2type: "Edm.Time",
				result : "time'PT13H47M26S'"}
			// TODO V2 literal formatting does not support milliseconds
			// {value : "13:47:26.123", type : "Edm.TimeOfDay", v2type: "Edm.Time",
			// 	result : "time'PT13H47M26.123S'"},
		].forEach(function (oFixture) {
			assert.strictEqual(oRequestor.formatPropertyAsLiteral(oFixture.value, {
					$Type : oFixture.type,
					$v2Type : oFixture.v2type
				}),
				oFixture.result,
				(oFixture.v2type || oFixture.type) + " " + oFixture.value);
		});
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral: invalid date/time values", function (assert) {
		var oRequestor = {};

		asV2Requestor(oRequestor);

		["Edm.Date", "Edm.DateTimeOffset", "Edm.TimeOfDay"].forEach(function (sType) {
			assert.throws(function () {
				oRequestor.formatPropertyAsLiteral("foo", {$Type : sType});
			}, new Error("Not a valid " + sType + " value: foo"));
		});
	});

	//*********************************************************************************************
	QUnit.test("formatPropertyAsLiteral: unsupported types", function (assert) {
		var oProperty = {},
			oRequestor = {},
			vValue = {};

		asV2Requestor(oRequestor);

		["Edm.Binary", "Edm.Stream", "Foo"].forEach(function (sType) {
			oProperty.$Type = sType;
			assert.throws(function () {
				oRequestor.formatPropertyAsLiteral(vValue, oProperty);
			}, new Error("Type '" + sType + "' in the key predicate is not supported"));
		});
	});

	//*********************************************************************************************
	[
		{literal : "false", type : "Edm.Boolean"},
		{literal : "true", type : "Edm.Boolean"},
		{literal : "42", type : "Edm.Byte"},
		{literal : "2017-05-25", type : "Edm.Date", v2type : "Edm.DateTime",
			result : "foo/bar eq datetime'2017-05-25T00:00:00'"},
		{literal : "null", type : "Edm.Date", v2type : "Edm.DateTime",
			result : "foo/bar eq null"},
		{literal : "2017-05-25T17:42:43Z", type : "Edm.DateTimeOffset",
			result : "foo/bar eq datetimeoffset'2017-05-25T17:42:43Z'"},
		{literal : "null", type : "Edm.DateTimeOffset", result : "foo/bar eq null"},
		{literal : "3.14", type : "Edm.Decimal", result : "foo/bar eq 3.14m"},
		{literal : "3.14", type : "Edm.Double", result : "foo/bar eq 3.14d"},
		{literal : "936DA01F-9ABD-4D9D-80C7-02AF85C822A8", type : "Edm.Guid",
			result : "foo/bar eq guid'936DA01F-9ABD-4D9D-80C7-02AF85C822A8'"},
		{literal : "42", type : "Edm.Int16"},
		{literal : "42", type : "Edm.Int32"},
		{literal : "42", type : "Edm.Int64", result : "foo/bar eq 42l"},
		{literal : "42", type : "Edm.SByte"},
		{literal : "3.14", type : "Edm.Single", result : "foo/bar eq 3.14f"},
		{literal : "'baz'", type : "Edm.String"},
		{literal : "18:59:59", type : "Edm.TimeOfDay", v2type : "Edm.Time",
			result : "foo/bar eq time'PT18H59M59S'"},
		{literal : "null", type : "Edm.TimeOfDay", v2type : "Edm.Time",
			result : "foo/bar eq null"}
	].forEach(function (oFixture) {
		QUnit.test("convertFilter: " + oFixture.type, function (assert) {
			var sFilter = "foo/bar eq " + oFixture.literal,
				oProperty = {$Type : oFixture.type, $v2Type : oFixture.v2type},
				oRequestor = {
					oModelInterface : {fnFetchMetadata : function () {}}
				},
				sResourcePath = "MyEntitySet";

			asV2Requestor(oRequestor);

			this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
				.withExactArgs("/" + sResourcePath + "/foo/bar")
				.returns(_SyncPromise.resolve(oProperty));

			// code under test
			assert.strictEqual(oRequestor.convertFilter(sFilter, sResourcePath),
				oFixture.result || sFilter);
		});
	});
	// TODO milliseconds in DateTimeOffset and TimeOfDay

	//*********************************************************************************************
	[{
		v4 : "3.14 eq foo",
		v2 : "3.14d eq foo"
	}, {
		v4 : "foo eq bar",
		v2 : "foo eq bar"
	}, {
		v4 : "3.14 eq 3.14",
		error : "Cannot convert filter for V2, saw literals on both sides of 'eq' at 6"
	}].forEach(function (oFixture) {
		QUnit.test("convertFilter: " + oFixture.v4, function (assert) {
			var oProperty = {$Type : "Edm.Double"},
				oRequestor = {
					oModelInterface : {fnFetchMetadata : function () {}}
				},
				sResourcePath = "MyEntitySet";

			asV2Requestor(oRequestor);

			// simply declare all properties to be Edm.Double so that a conversion is necessary
			this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata").atLeast(0)
				.returns(_SyncPromise.resolve(oProperty));

			// code under test
			if (oFixture.error) {
				assert.throws(function () {
					oRequestor.convertFilter(oFixture.v4, sResourcePath);
				}, new Error(oFixture.error + ": " + oFixture.v4));
			} else {
				assert.strictEqual(oRequestor.convertFilter(oFixture.v4, sResourcePath),
					oFixture.v2);
			}
		});
	});

	//*********************************************************************************************
	[{
		property : {$Type : "Edm.Binary"},
		literal : "'1qkYNh/P5uvZ0zA+siScD='",
		error : "foo/bar: Unsupported type: Edm.Binary"
	}, {
		property : undefined,
		literal : 1,
		error : "Invalid filter path: foo/bar"
	}].forEach(function (oFixture) {
		QUnit.test("convertFilter: " + oFixture.error, function (assert) {
			var oRequestor = {
					oModelInterface : {
						fnFetchMetadata : function () {
						}
					}
				},
				sResourcePath = "MyEntitySet";

			asV2Requestor(oRequestor);

			this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
				.withExactArgs("/" + sResourcePath + "/foo/bar")
				.returns(_SyncPromise.resolve(oFixture.property));

			// code under test
			assert.throws(function () {
				oRequestor.convertFilter("foo/bar eq " + oFixture.literal, sResourcePath);
			}, new Error(oFixture.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("ready()", function (assert) {
		var oRequestor = {
				oModelInterface : {
					fnFetchEntityContainer : function () {}
				}
			},
			oSyncPromise;

		asV2Requestor(oRequestor);

		this.mock(oRequestor.oModelInterface).expects("fnFetchEntityContainer")
			.returns(_SyncPromise.resolve(Promise.resolve({})));

		// code under test
		oSyncPromise = oRequestor.ready();

		assert.strictEqual(oSyncPromise.isFulfilled(), false);
		return oSyncPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("getTypeForName", function (assert) {
		var oRequestor = {
				oModelInterface : {
					fnFetchMetadata : function () {}
				}
			},
			oType = {};

		asV2Requestor(oRequestor);

		this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
			.withExactArgs("/my.Type").returns(_SyncPromise.resolve(oType));

		// code under test
		assert.strictEqual(oRequestor.getTypeForName("my.Type"), oType);
		assert.strictEqual(oRequestor.getTypeForName("my.Type"), oType);
	});
});