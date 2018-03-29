/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/lib/_V2Requestor"
], function (jQuery, SyncPromise, DateFormat, ODataUtils, _Helper, _Parser, _Requestor,
		asV2Requestor) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._V2Requestor", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
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
				"__count" : "3",
				"__next" : "...?$skiptoken=12",
				"results" : [{
					"__metadata" : {},
					"String" : "foo"
				}, {
//					"__metadata" : {},
					"Boolean" : true
				}]
			}
		},
		oExpectedResult : {
			"@odata.count" : "3", // Note: v4.ODataModel uses IEEE754Compatible=true
			"@odata.nextLink" : "...?$skiptoken=12",
			"value" : [{"__metadata" : {}, "String" : "foo"}, {"Boolean" : true}]
		}
	}, {
		bIsCollection : true,
		oResponsePayload : {
			"d" : {
				"results" : [{
					"__metadata" : {},
					"String" : "foo"
				}, {
//					"__metadata" : {},
					"Boolean" : true
				}]
			}
		},
		oExpectedResult : {
			"value" : [{"__metadata" : {}, "String" : "foo"}, {"Boolean" : true}]
		}
	}, {
		bIsCollection : false,
		oResponsePayload : {
			"d" : {
				"__metadata" : {},
				"String" : "foo"
			}
		},
		//TODO "__metadata" : {} is actually unexpected here, in real life
		oExpectedResult : {"__metadata" : {}, "String" : "foo"}
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
	QUnit.test("doConvertResponse, 2.2.7.2.3 RetrieveComplexType Request", function (assert) {
		var oPayload = {},
			oRequestor = {},
			oResponsePayload = {
				// /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
				// FlightCollection(carrid='...',connid='...',fldate=datetime'...')/flightDetails
				"d" : {
					"flightDetails" : {
						"__metadata" : {
							"type" : "RMTSAMPLEFLIGHT.FlightDetails"
						}
					}
				}
			};

		asV2Requestor(oRequestor);
		this.mock(oRequestor).expects("convertNonPrimitive")
			.withExactArgs(sinon.match.same(oResponsePayload.d.flightDetails))
			.returns(oPayload);

		// code under test
		assert.strictEqual(oRequestor.doConvertResponse(oResponsePayload), oPayload);
	});

	//*********************************************************************************************
	[{
		"d" : {
			// "An optional "__metadata" name/value pair..."
			"readMe1st" : {}
		}
	}, {
		"d" : {
			// "An optional "__metadata" name/value pair..."
			"ID" : 0,
			"Name" : "Food"
		}
	}].forEach(function (oResponsePayload, i) {
		QUnit.test("doConvertResponse, not 2.2.7.2.3 RetrieveComplexType: " + i, function (assert) {
			var oPayload = {},
				oRequestor = {};

			asV2Requestor(oRequestor);
			this.mock(oRequestor).expects("convertNonPrimitive")
				.withExactArgs(sinon.match.same(oResponsePayload.d))
				.returns(oPayload);

			// code under test
			assert.strictEqual(oRequestor.doConvertResponse(oResponsePayload), oPayload);
		});
	});

	//*********************************************************************************************
	QUnit.test("doConvertResponse, 2.2.7.2.4 RetrievePrimitiveProperty Req.", function (assert) {
		var sMetaPath = "/FlightCollection/fldate",
			sOutput = "2017-08-10T00:00:00Z",
			oProperty = {},
			oRequestor = {
				oModelInterface : {fnFetchMetadata : function () {}}
			},
			oResponsePayload = {
				// /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
				// FlightCollection(carrid='...',connid='...',fldate=datetime'...')/fldate
				"d" : {
					"fldate": "/Date(1502323200000)/"
				}
			};

		asV2Requestor(oRequestor);
		this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
			.withExactArgs(sMetaPath)
			.returns(SyncPromise.resolve(oProperty));
		this.mock(oRequestor).expects("convertPrimitive")
			.withExactArgs(oResponsePayload.d.fldate, sinon.match.same(oProperty), sMetaPath,
				"fldate")
			.returns(sOutput);

		// code under test
		assert.deepEqual(
			oRequestor.doConvertResponse(oResponsePayload, sMetaPath),
			{value : sOutput});
	});

	//*********************************************************************************************
	QUnit.test("doConvertResponse, 2.2.7.2.3 & 2.2.7.2.4: null", function (assert) {
		var sMetaPath = "/FlightCollection/fldate",
			oRequestor = {},
			oResponsePayload = {
				// /sap/opu/odata/IWFND/RMTSAMPLEFLIGHT/
				// FlightCollection(carrid='...',connid='...',fldate=datetime'...')/fldate
				"d" : {
					"fldate": null
				}
			};

		asV2Requestor(oRequestor);
		this.mock(oRequestor).expects("convertPrimitive").never();

		// code under test
		assert.deepEqual(
			oRequestor.doConvertResponse(oResponsePayload, sMetaPath),
			{value : null});
	});

	//*********************************************************************************************
	QUnit.test("doConvertResponse, 2.2.7.5 collection of primitives", function (assert) {
		var sMetaPath = "/__FAKE__GetAllFlightDates/@$ui5.overload/0/$ReturnType",
			sOutput0 = "2017-08-10T00:00:00Z",
			sOutput1 = "2017-08-10T00:00:01Z",
			oProperty = {},
			oRequestor = {
				oModelInterface : {fnFetchMetadata : function () {}}
			},
			oRequestorMock = this.mock(oRequestor),
			oResponsePayload = {
				"d" : { // Note: DataServiceVersion : 2.0
					"results" : [
						"/Date(1502323200000)/",
						"/Date(1502323201000)/"
					]
				}
			};

		asV2Requestor(oRequestor);
		this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata").withExactArgs(sMetaPath)
			.returns(SyncPromise.resolve(oProperty));
		oRequestorMock.expects("convertNonPrimitive").never();
		oRequestorMock.expects("convertPrimitive").withExactArgs(oResponsePayload.d.results[0],
				sinon.match.same(oProperty), sMetaPath, "")
			.returns(sOutput0);
		oRequestorMock.expects("convertPrimitive").withExactArgs(oResponsePayload.d.results[1],
				sinon.match.same(oProperty), sMetaPath, "")
			.returns(sOutput1);

		// code under test
		assert.deepEqual(
			oRequestor.doConvertResponse(oResponsePayload, sMetaPath),
			{value : [sOutput0, sOutput1]});
	});
	//TODO test with __count/__next?

	//*********************************************************************************************
	QUnit.test("doConvertResponse, 2.2.7.5 empty collection", function (assert) {
		var sMetaPath = "/__FAKE__GetAllFlightDates/@$ui5.overload/0/$ReturnType",
			oRequestor = {},
			oRequestorMock = this.mock(oRequestor),
			oResponsePayload = {
				"d" : { // Note: DataServiceVersion : 2.0
					"results" : []
				}
			};

		asV2Requestor(oRequestor);
		oRequestorMock.expects("convertNonPrimitive").never();
		oRequestorMock.expects("convertPrimitive").never();

		// code under test
		assert.deepEqual(
			oRequestor.doConvertResponse(oResponsePayload, sMetaPath),
			{value : []});
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
			.withExactArgs("42", {$Type : "Edm.Double"}, "TypeQName", "property")
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
			.withExactArgs("42", {$Type : "Edm.Double"}, "TypeQName", "property")
			.returns(42);
		oRequestorMock.expects("convertPrimitive")
			.withExactArgs("77", {$Type : "Edm.Double"}, "TypeQName", "property")
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
			.withExactArgs(oObject.property, {$Type : "Edm.Double"}, "TypeQName", "property")
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
				oRequestor.convertNonPrimitive(oObject);
			}, new Error("Cannot convert structured value without type information in "
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
				if (oFixture.sType === "Edm.DateTimeOffset") {
					this.mock(oRequestor).expects(oFixture.sConvertMethod)
						.withExactArgs(sinon.match.same(vV2Value), {$Type : oFixture.sType})
						.returns(vV4Value);
				} else {
					this.mock(oRequestor).expects(oFixture.sConvertMethod)
						.withExactArgs(sinon.match.same(vV2Value))
						.returns(vV4Value);
				}
			} else {
				vV4Value = vV2Value; // no conversion
			}

			// code under test
			assert.strictEqual(oRequestor.convertPrimitive(vV2Value, {$Type : oFixture.sType},
				"property", "Type"), vV4Value);
		});
	});

	//*********************************************************************************************
	QUnit.test("convertPrimitive, unknown and undefined type", function (assert) {
		var oRequestor = {};

		asV2Requestor(oRequestor);

		// code under test
		assert.throws(function () {
			oRequestor.convertPrimitive("foo", {$Type : "Unknown"}, "Type", "Property");
		}, new Error("Type 'Unknown' of property 'Property' in type 'Type' is unknown; "
			+ "cannot convert value: foo"));
		assert.throws(function () {
			oRequestor.convertPrimitive("foo", undefined, "Type", "Property");
		}, new Error("Type 'undefined' of property 'Property' in type 'Type' is unknown; "
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

		// code under test
		assert.strictEqual(oRequestor.convertDate("\/Date(-327628800000)\/"), "1959-08-15");
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
		output : "2015-01-06T07:25:21Z"
	}, {
		input : "/Date(1420529121547+0500)/",
		output : "2015-01-06T12:25:21+05:00"
	}, {
		input : "/Date(1420529121547+1500)/",
		output : "2015-01-06T22:25:21+15:00"
	}, {
		input : "/Date(1420529121547+0530)/",
		output : "2015-01-06T12:55:21+05:30"
	}, {
		input : "/Date(1420529121547+0030)/",
		output : "2015-01-06T07:55:21+00:30"
	}, {
		input : "/Date(1420529121547-0530)/",
		output : "2015-01-06T01:55:21-05:30"
	}, {
		input : "/Date(1420529121547-0530)/",
		output : "2015-01-06T01:55:21-05:30",
		precision : 0
	}, {
		input : "/Date(1420529121547-0530)/",
		output : "2015-01-06T01:55:21.547000-05:30",
		precision : 6
	}, {
		input : "/Date(1395752399000)/", // DateTime in V2
		output : "2014-03-25T12:59:59Z"  // must be interpreted as UTC
	}, {
		input : "/Date(-327628800000)/", // DateTime in V2 before 1970
		output : "1959-08-15T00:00:00Z"
	}].forEach(function (oFixture, i) {
		QUnit.test("convertDateTimeOffset, success " + i, function (assert) {
			var oRequestor = {};

			asV2Requestor(oRequestor);

			// code under test
			assert.strictEqual(oRequestor.convertDateTimeOffset(oFixture.input,
				{$Precision : oFixture.precision}), oFixture.output);
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
				return oRequestor.convertDateTimeOffset(oFixture.input, {});
			}, new Error(oFixture.expectedError));
		});
	});

	//*********************************************************************************************
	// This test assumes that the precisions in this test are not used in other tests
	QUnit.test("convertDateTimeOffset, DateTimeInstance map callCount", function (assert) {
		var oDateFormatMock = this.mock(DateFormat),
			oRequestor = {};

		asV2Requestor(oRequestor);

		oRequestor.convertDateTimeOffset("/Date(1395752399000)/", {$Precision : 42});
		// after calling #getDateTimeInstance, there is no further call with the same precision
		oDateFormatMock.expects("getDateTimeInstance").never();

		// code under test
		oRequestor.convertDateTimeOffset("/Date(1395752399000)/", {$Precision : 42});
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
		// def at root and baz in foo are complex properties for which two nested simple properties
		// are selected in V4  -> In V2 these complex properties have to be selected once
		expectedResultHandlerCalls : [
			{key : "$expand", value : "foo,foo/bar,baz"},
			{key : "$orderby", value : "foo,bar"},
			{key : "$select", value : "foo/xyz,foo/baz,foo/bar/*,baz/*,abc,def"}
		],
		expectedResultHandlerCallsSorted : [
			{key : "$expand", value : "baz,foo,foo/bar"},
			{key : "$orderby", value : "foo,bar"},
			{key : "$select", value : "abc,baz/*,def,foo/bar/*,foo/baz,foo/xyz"}
		],
		queryOptions : {
			"$expand" : {
				"foo" : {
					"$select" : ["xyz", "baz/qux", "baz/quux"],
					"$expand" : {
						"bar" : true
					}
				},
				"baz" : true
			},
			"$select" : "abc,def/ghi,def/jkl",
			"$orderby" : "foo,bar"
		}
	}, { // garbage in, garbage out - do not touch if there is a type cast
		expectedResultHandlerCalls : [
			{key : "$select", value : "foo/name.space.OtherType"}
		],
		queryOptions : {
			"$select" : "foo/name.space.OtherType"
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
				oRequestor.doConvertSystemQueryOptions("/Foo", oFixture.queryOptions,
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
				oRequestor.doConvertSystemQueryOptions("/Foo", {"$expand" : vExpandOption});
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
				oRequestor.doConvertSystemQueryOptions("/Foo", oFixture.queryOptions,
					function () {});
			}, new Error(oFixture.error));
		});
	});

	//*********************************************************************************************
	QUnit.test("doConvertSystemQueryOptions: $filter", function (assert) {
		var sFilter = "foo eq 'bar'",
			oRequestor = {},
			fnResultHandlerSpy = this.spy();

		asV2Requestor(oRequestor);

		this.mock(oRequestor).expects("convertFilter")
			.withExactArgs(sFilter, "/Foo").returns("~");

		// code under test
		oRequestor.doConvertSystemQueryOptions("/Foo", {$filter : sFilter},
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
				sMetaPath = "/MyEntitySet",
				oProperty = {$Type : oFixture.type, $v2Type : oFixture.v2type},
				oRequestor = {
					oModelInterface : {fnFetchMetadata : function () {}}
				};

			asV2Requestor(oRequestor);

			this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
				.withExactArgs(sMetaPath + "/foo/bar")
				.returns(SyncPromise.resolve(oProperty));

			// code under test
			assert.strictEqual(oRequestor.convertFilter(sFilter, sMetaPath),
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
		v4 : "3.14 eq bar and baz",
		v2 : "3.14d eq bar and baz"
	}, {
		v4 : "foo ne 3.14 or baz",
		v2 : "foo ne 3.14d or baz"
	}, {
		v4 : "foo and 3.14 lt baz",
		v2 : "foo and 3.14d lt baz"
	}, {
		v4 : "foo or baz lt 3.14",
		v2 : "foo or baz lt 3.14d"
	}, {
		v4 : "foo and bar gt 3.14 or baz eq null",
		v2 : "foo and bar gt 3.14d or baz eq null"
	}, {
		v4 : "not foo",
		v2 : "not foo"
	}, {
		v4 : "not (foo gt 3.14)",
		v2 : "not (foo gt 3.14d)"
	}, {
		v4 : "3.14 eq 3.14",
		error : "saw literals on both sides of 'eq' at 6"
	}, {
		v4 : "length(foo) gt 20",
		v2 : "length(foo) gt 20"
	}, {
		v4 : "20 lt length(foo)",
		v2 : "20 lt length(foo)"
	}, {
		v4 : "length('foo') gt length(bar)",
		v2 : "length('foo') gt length(bar)"
	}, {
		v4 : "substring(foo,2,5) eq 'bar'",
		v2 : "substring(foo,2,5) eq 'bar'"
	}, {
		v4 : "day(2017-12-16) gt 0",
		error : "ambiguous type for the literal at 5"
	}, {
		v4 : "floor(42.5) eq 42",
		error : "ambiguous type for the literal at 7"
	}, {
		v4 : "0 lt day(2017-12-16)",
		error : "ambiguous type for the literal at 10"
	}, {
		v4 : "42 eq floor(42.5)",
		error : "ambiguous type for the literal at 13"
	}, {
		v4 : "floor(foo) eq 42",
		v2 : "floor(foo) eq 42d"
	}, {
		v4 : "floor(round(foo)) eq 42",
		v2 : "floor(round(foo)) eq 42d"
	}, {
		v4 : "startswith(foo,'bar') eq true",
		v2 : "startswith(foo,'bar') eq true"
	}, {
		v4 : "contains(concat(foo,bar),substring(baz,5,2))",
		v2 : "substringof(substring(baz,5,2),concat(foo,bar))"
	}, {
		v4 : "contains(foo)", // wrong actually, but should not generate a syntax error
		v2 : "substringof(foo)"
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
				.returns(SyncPromise.resolve(oProperty));

			// code under test
			if (oFixture.error) {
				assert.throws(function () {
					oRequestor.convertFilter(oFixture.v4, sResourcePath);
				}, new Error("Cannot convert filter to V2, " + oFixture.error + ": "
					+ oFixture.v4));
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
			var sMetaPath = "/MyEntitySet",
				oRequestor = {
					oModelInterface : {fnFetchMetadata : function () {}}
				};

			asV2Requestor(oRequestor);

			this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
				.withExactArgs(sMetaPath + "/foo/bar")
				.returns(SyncPromise.resolve(oFixture.property));

			// code under test
			assert.throws(function () {
				oRequestor.convertFilter("foo/bar eq " + oFixture.literal, sMetaPath);
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
			.returns(SyncPromise.resolve(Promise.resolve({})));

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
				oModelInterface : {fnFetchMetadata : function () {}}
			},
			oType = {};

		asV2Requestor(oRequestor);

		this.mock(oRequestor.oModelInterface).expects("fnFetchMetadata")
			.withExactArgs("/my.Type").returns(SyncPromise.resolve(oType));

		// code under test
		assert.strictEqual(oRequestor.getTypeForName("my.Type"), oType);
		assert.strictEqual(oRequestor.getTypeForName("my.Type"), oType);
	});

	//*********************************************************************************************
	[{
		iCallCount : 1,
		mHeaders : { "DataServiceVersion" : "2.0" },
		bVersionOptional : true
	}, {
		iCallCount : 2,
		mHeaders : {},
		bVersionOptional : true
	}, {
		iCallCount : 2,
		mHeaders : {},
		bVersionOptional : false
	}, {
		iCallCount : 1,
		mHeaders : { "DataServiceVersion" : "1.0" },
		bVersionOptional : true
	}].forEach(function (oFixture, i) {
		QUnit.test("doCheckVersionHeader, success cases - " + i, function (assert) {
			var oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0"),
				fnGetHeader = this.spy(function (sHeaderKey) {
					return oFixture.mHeaders[sHeaderKey];
				});

			// code under test
			oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar",
				oFixture.bVersionOptional);

			assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
			if (oFixture.iCallCount === 2) {
				assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
			}
			assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
		});
	});

	//*********************************************************************************************
	[{
		iCallCount : 1,
		sError : "value 'foo' in response for /Foo('42')/Bar",
		mHeaders : { "DataServiceVersion" : "foo" }
	}, {
		iCallCount : 2,
		sError : "'OData-Version' header with value 'baz' in response for /Foo('42')/Bar",
		mHeaders : { "OData-Version" : "baz" }
	}].forEach(function (oFixture, i) {
		QUnit.test("doCheckVersionHeader, error cases - " + i, function (assert) {
			var oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0"),
				fnGetHeader = this.spy(function (sHeaderKey) {
					return oFixture.mHeaders[sHeaderKey];
				});

			assert.throws(function () {
				// code under test
				oRequestor.doCheckVersionHeader(fnGetHeader, "Foo('42')/Bar");
			}, new Error("Expected 'DataServiceVersion' header with value '1.0' or '2.0' but "
				+ "received " + oFixture.sError));

			assert.strictEqual(fnGetHeader.calledWithExactly("DataServiceVersion"), true);
			if (oFixture.iCallCount === 2) {
				assert.strictEqual(fnGetHeader.calledWithExactly("OData-Version"), true);
			}
			assert.strictEqual(fnGetHeader.callCount, oFixture.iCallCount);
		});
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: OperationImport", function (assert) {
		var oModelInterface = {
				fnFetchMetadata : null // do not call!
			},
			oOperationMetadata = {
				"$Parameter" : [{
					"$Name" : "Foo",
					"$Type" : "Edm.Int16"
				}, {
					"$Name" : "ID",
					"$Type" : "Edm.String"
				}]
			},
			mParameters = {"ID" : "1", "Foo" : 42, "n/a" : NaN},
			mQueryOptions = {},
			oRequestor = _Requestor.create("/", oModelInterface, undefined, undefined, "2.0"),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs(42, oOperationMetadata.$Parameter[0]).returns("42");
		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs("1", oOperationMetadata.$Parameter[1]).returns("'1'");

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/OperationImport(...)", oOperationMetadata,
				mParameters, mQueryOptions),
			"OperationImport");
		assert.deepEqual(mQueryOptions, {"ID" : "'1'", "Foo" : "42"});
		assert.deepEqual(mParameters, {});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAction) {
		var sTitle = "getPathAndAddQueryOptions: bound " + (bAction ? "action" : "function");

		QUnit.test(sTitle, function (assert) {
			var oEntity = {"Foo" : 42, "ID" : "1"},
				oModelInterface = {fnFetchMetadata : function () {}},
				oOperationMetadata = {
					"$IsBound" : true,
					"$Parameter" : [{ // "$Name" : null, "$Nullable" : false,
						"$Type" : "com.sap.ui5.OData.EdmTypes"
					}, {
						"$Name" : "Bar" //, "$Type" : "Edm.Boolean"
					}]
				},
				mParameters = {"Bar" : true},
				mQueryOptions = {},
				oRequestor = _Requestor.create("/", oModelInterface, undefined, undefined, "2.0"),
				oRequestorMock = this.mock(oRequestor),
				oTypeMetadata = { // "$kind" : "EntityType",
					"$Key" : ["ID", "Foo"],
					"Foo" : {
						"$kind" : "Property",
						"$Type" : "Edm.Int16"
					},
					"ID" : {
						"$kind" : "Property",
						"$Type" : "Edm.String"
					}
				};

			this.mock(oModelInterface).expects("fnFetchMetadata")
				.withExactArgs("/com.sap.ui5.OData.EdmTypes")
				.returns(SyncPromise.resolve(oTypeMetadata));
			oRequestorMock.expects("formatPropertyAsLiteral").withExactArgs("1", oTypeMetadata.ID)
				.returns("'1'");
			oRequestorMock.expects("formatPropertyAsLiteral").withExactArgs(42, oTypeMetadata.Foo)
				.returns("42");
			oRequestorMock.expects("formatPropertyAsLiteral")
				.withExactArgs(true, oOperationMetadata.$Parameter[1]).returns("true");

			assert.strictEqual(
				// code under test
				oRequestor.getPathAndAddQueryOptions(
					"/EdmTypesCollection('1')/com.sap.ui5.OData.ResetEdmTypes(...)",
					oOperationMetadata, mParameters, mQueryOptions,
					bAction ? oEntity : function () { return oEntity; }),
				"ResetEdmTypes");
			assert.deepEqual(mQueryOptions, {"Bar" : "true", "Foo" : "42", "ID" : "'1'"});
			assert.deepEqual(mParameters, {});
		});
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: Operation w/o parameters", function (assert) {
		var oOperationMetadata = {},
			mParameters = {foo : "bar"},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		this.mock(oRequestor).expects("formatPropertyAsLiteral").never();

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Operation(...)", oOperationMetadata,
				mParameters),
			"some.Operation");
		assert.deepEqual(mParameters, {});
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: $v2HttpMethod", function (assert) {
		var oOperationMetadata = {$v2HttpMethod : "PUT"},
			mParameters = {foo : "bar"},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		assert.strictEqual(
			// code under test
			oRequestor.getPathAndAddQueryOptions("/some.Operation(...)", oOperationMetadata,
				mParameters),
			"some.Operation");
		assert.deepEqual(mParameters, {"X-HTTP-Method" : oOperationMetadata.$v2HttpMethod});
	});

	//*********************************************************************************************
	QUnit.test("getPathAndAddQueryOptions: collection parameter", function (assert) {
		var oOperationMetadata = {$Parameter : [{$Name : "foo", $IsCollection : true}]},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		assert.throws(function () {
			// code under test
			oRequestor.getPathAndAddQueryOptions("/ActionImport(...)", oOperationMetadata,
				{"foo" : [42]});
		}, new Error("Unsupported collection-valued parameter: foo"));
	});

	//*****************************************************************************************
	QUnit.test("isChangeSetOptional", function (assert) {
		var oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		assert.strictEqual(oRequestor.isChangeSetOptional(), false);
	});

	//*****************************************************************************************
	QUnit.test("isActionBodyOptional", function (assert) {
		var oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		assert.strictEqual(oRequestor.isActionBodyOptional(), true);
	});

	//*****************************************************************************************
	QUnit.test("convertKeyPredicate: simple string predicate", function (assert) {
		var oEntityType = {
				$Key : ["KeyProperty"],
				KeyProperty : {$Type : "Edm.String"}
			},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("/my/path('foo')").returns("/my/path");
		this.mock(oRequestor).expects("fetchTypeForPath").withExactArgs("/my/path")
			.returns(SyncPromise.resolve(oEntityType));
		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("('foo')")
			.returns({"" : "'foo'"});

		assert.strictEqual(oRequestor.convertKeyPredicate("('foo')", "/my/path('foo')"), "('foo')");
	});

	//*****************************************************************************************
	QUnit.test("convertKeyPredicate: simple non-string predicate", function (assert) {
		var oEntityType = {
				$Key : ["KeyProperty"],
				KeyProperty : {$Type : "Edm.Foo"}
			},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("/my/path(42)").returns("/my/path");
		this.mock(oRequestor).expects("fetchTypeForPath").withExactArgs("/my/path")
			.returns(SyncPromise.resolve(oEntityType));
		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("(42)").returns({"" : "42"});
		this.mock(_Helper).expects("parseLiteral").withExactArgs("42", "Edm.Foo", "/my/path(42)")
			.returns(42);
		this.mock(oRequestor).expects("formatPropertyAsLiteral")
			.withExactArgs(42, sinon.match.same(oEntityType.KeyProperty)).returns("~42~");

		assert.strictEqual(oRequestor.convertKeyPredicate("(42)", "/my/path(42)"), "(~42~)");
	});

	//*****************************************************************************************
	QUnit.test("convertKeyPredicate: named non-string predicate, encoded", function (assert) {
		var oEntityType = {
				$Key : ["føø"],
				"føø" : {$Type : "Edm.Foo"}
			},
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0");

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("/my/path(f%C3%B8%C3%B8=42)").returns("/my/path");
		this.mock(oRequestor).expects("fetchTypeForPath").withExactArgs("/my/path")
			.returns(SyncPromise.resolve(oEntityType));
		this.mock(_Parser).expects("parseKeyPredicate").withExactArgs("(føø=42)")
			.returns({"føø" : "42"});
		this.mock(_Helper).expects("parseLiteral")
			.withExactArgs("42", "Edm.Foo", "/my/path(f%C3%B8%C3%B8=42)")
			.returns(42);
		this.mock(oRequestor).expects("formatPropertyAsLiteral")
			.withExactArgs(42, sinon.match.same(oEntityType["føø"])).returns("~bãr~");

		assert.strictEqual(
			oRequestor.convertKeyPredicate("(f%C3%B8%C3%B8=42)", "/my/path(f%C3%B8%C3%B8=42)"),
			"(f%C3%B8%C3%B8=~b%C3%A3r~)");
	});

	//*****************************************************************************************
	QUnit.test("convertKeyPredicate: compound predicate", function (assert) {
		var oEntityType = {
				$Key : ["p1", "p2", "p3"],
				p1 : {$Type : "Edm.Double"},
				p2 : {$Type : "Edm.String"},
				p3 : {$Type : "Edm.Double"}
			},
			oHelperMock = this.mock(_Helper),
			oParserMock = this.mock(_Parser),
			oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0"),
			oRequestorMock = this.mock(oRequestor);

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("/my/path(p1=1,p2='2',p3=3)").returns("/my/path");
		oRequestorMock.expects("fetchTypeForPath").withExactArgs("/my/path")
			.returns(SyncPromise.resolve(oEntityType));
		oParserMock.expects("parseKeyPredicate").withExactArgs("(p1=1,p2='2',p3=3)")
			.returns({"p1" : "1", "p2" : "'2'", "p3" : "3"});
		oHelperMock.expects("parseLiteral")
			.withExactArgs("1", "Edm.Double", "/my/path(p1=1,p2='2',p3=3)").returns(1);
		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs(1, sinon.match.same(oEntityType.p1)).returns("1d");
		oHelperMock.expects("parseLiteral")
			.withExactArgs("3", "Edm.Double", "/my/path(p1=1,p2='2',p3=3)").returns(3);
		oRequestorMock.expects("formatPropertyAsLiteral")
			.withExactArgs(3, sinon.match.same(oEntityType.p3)).returns("3d");

		assert.strictEqual(
			oRequestor.convertKeyPredicate("(p1=1,p2='2',p3=3)", "/my/path(p1=1,p2='2',p3=3)"),
			"(p1=1d,p2='2',p3=3d)");
	});

	//*****************************************************************************************
	["", "?$select=*"].forEach(function (sQuery) {
		QUnit.test("convertResourcePath: query=" + sQuery, function (assert) {
			var oRequestor = _Requestor.create("/", undefined, undefined, undefined, "2.0"),
				oRequestorMock = this.mock(oRequestor);

			oRequestorMock.expects("convertKeyPredicate")
				.withExactArgs("(42)", "/Foo/Bar(42)")
				.returns("(~42~)");
			oRequestorMock.expects("convertKeyPredicate")
				.withExactArgs("(23)", "/Foo/Bar(42)/Baz/Qux(23)")
				.returns("(~23~)");

			assert.strictEqual(oRequestor.convertResourcePath("Foo/Bar(42)/Baz/Qux(23)" + sQuery),
				"Foo/Bar(~42~)/Baz/Qux(~23~)" + sQuery);
		});
	});
});