/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (jQuery, _Cache, _Helper, _Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aTestData = "abcdefghijklmnopqrstuvwxyz".split("");

	function createResult(iIndex, iLength) {
		return {
			"@odata.context" : "$metadata#TEAMS",
			value : aTestData.slice(iIndex, iIndex + iLength)
		};
	}

	function mockRequest(oRequestorMock, sUrl, iStart, iLength) {
		oRequestorMock.expects("request")
			.withExactArgs("GET", sUrl + "?$skip=" + iStart + "&$top=" + iLength, undefined)
			.returns(Promise.resolve(createResult(iStart, iLength)));
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("_Cache is not a constructor", function (assert) {
		assert.strictEqual(typeof _Cache, "object");
	});

	//*********************************************************************************************
	[
		{index : 1, length : 1, result : ["b"]},
		{index : 0, length : 2, result : ["a", "b"]},
		{index : 4, length : 5, result : []},
		{index : 1, length : 5, result : ["b", "c"]}
	].forEach(function (oFixture) {
		QUnit.test("read(" + oFixture.index + ", " + oFixture.length + ")", function (assert) {
			var oRequestor = _Requestor.create("/~/"),
				sResourcePath = "Employees",
				oCache = _Cache.create(oRequestor, sResourcePath),
				oPromise,
				aData = ["a", "b", "c"],
				oMockResult = {
					"@odata.context" : "$metadata#TEAMS",
					value : aData.slice(oFixture.index, oFixture.index + oFixture.length)
				};

			this.mock(oRequestor).expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=" + oFixture.index + "&$top="
					+ oFixture.length, "group")
				.returns(Promise.resolve(oMockResult));

			// code under test
			oPromise = oCache.read(oFixture.index, oFixture.length, "group");

			assert.ok(oPromise instanceof Promise, "returns a Promise");
			return oPromise.then(function (aResult) {
				assert.deepEqual(aResult, {
					"@odata.context" : "$metadata#TEAMS",
					value : oFixture.result
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("read and drill-down", function (assert) {
		var oExpectedResult = {
				// "@odata.context"
				value : [{
					foo : {
						bar : 42,
						"null" : null
					}
				}]
			},
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees",
			oCache = _Cache.create(oRequestor, sResourcePath, {$select : "foo"}),
			aPromises = [];

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath + "?$select=foo&$skip=0&$top=1", undefined)
			.returns(Promise.resolve(oExpectedResult));

		assert.throws(function () {
			oCache.read(0, 0, undefined, "");
		}, new Error("Cannot drill-down for length 0"));
		aPromises.push(oCache.read(0, 1, undefined, "").then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult.value[0],
				"empty path drills down into single array element");
		}));
		assert.throws(function () {
			oCache.read(0, 2, undefined, "");
		}, new Error("Cannot drill-down for length 2"));
		aPromises.push(oCache.read(0, 1, undefined, "foo").then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult.value[0].foo);
		}));
		aPromises.push(oCache.read(0, 1, undefined, "foo/bar").then(function (oResult) {
			assert.strictEqual(oResult, 42);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees?$select=foo&$skip=0&$top=1"
				+ " via foo/bar/invalid, invalid segment: invalid",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(0, 1, undefined, "foo/bar/invalid").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees?$select=foo&$skip=0&$top=1"
				+ " via foo/null/invalid, invalid segment: invalid",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(0, 1, undefined, "foo/null/invalid").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees?$select=foo&$skip=0&$top=1"
				+ " via foo/baz, invalid segment: baz",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(0, 1, undefined, "foo/baz").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("read(-1, 1)", function (assert) {
		var oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees",
			oCache = _Cache.create(oRequestor, sResourcePath);

		this.mock(oRequestor).expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(-1, 1);
		}, new Error("Illegal index -1, must be >= 0"));
	});

	//*********************************************************************************************
	QUnit.test("read(1, -1)", function (assert) {
		var oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees",
			oCache = _Cache.create(oRequestor, sResourcePath);

		this.mock(oRequestor).expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(1, -1);
		}, new Error("Illegal length -1, must be >= 0"));
	});

	//*********************************************************************************************
	[{
		title : "second range completely before",
		reads : [{index : 10, length : 2}, {index : 5, length : 2}],
		expectedRequests : [{skip : 10, top : 2}, {skip : 5, top : 2}]
	}, {
		title : "second range overlaps before",
		reads : [{index : 5, length : 4}, {index : 3, length : 4}],
		expectedRequests : [{skip : 5, top : 4}, {skip : 3, top : 2}]
	}, {
		title : "same range",
		reads : [{index : 1, length : 2}, {index : 1, length : 2}],
		expectedRequests : [{skip : 1, top : 2}],
		expectedCallbackCount : 1
	}, {
		title : "second range overlaps after",
		reads : [{index : 3, length : 4}, {index : 5, length : 4}],
		expectedRequests : [{skip : 3, top : 4}, {skip : 7, top : 2}]
	}, {
		title : "second range completely behind",
		reads : [{index : 5, length : 2}, {index : 10, length : 2}],
		expectedRequests : [{skip : 5, top : 2}, {skip : 10, top : 2}]
	}, {
		title : "second range part of first range",
		reads : [{index : 5, length : 8}, {index : 7, length : 2}],
		expectedRequests : [{skip : 5, top : 8}],
		expectedCallbackCount : 1
	}, {
		title : "first range part of second range",
		reads : [{index : 7, length : 2}, {index : 5, length : 6}],
		expectedRequests : [{skip : 7, top : 2}, {skip : 5, top : 2}, {skip : 9, top : 2}]
	}, {
		title : "read more than available",
		reads : [{index : 10, length : 90}, {index : 0, length : 100}],
		expectedRequests : [{skip : 10, top : 90}, {skip : 0, top : 10}]
	}, {
		title : "read exactly max available",
		reads : [{index : 0, length : 26}, {index : 26, length : 26}, {index : 26, length : 26}],
		expectedRequests : [{skip : 0, top : 26}, {skip : 26, top : 26}]
	}, {
		title : "different ranges",
		reads : [{index : 2, length : 5}, {index : 0, length : 2}, {index : 1, length : 2}],
		expectedRequests : [{skip : 2, top : 5}, {skip : 0, top : 2}]
	}].forEach(function (oFixture) {
		QUnit.test("multiple read, " + oFixture.title + " (sequentially)", function (assert) {
			var iDataRequestedCount = 0,
				fnDataRequested = function () {iDataRequestedCount++;},
				oRequestor = _Requestor.create("/~/"),
				sResourcePath = "Employees",
				oCache = _Cache.create(oRequestor, sResourcePath),
				oPromise = Promise.resolve(),
				oRequestorMock = this.mock(oRequestor);

			oFixture.expectedRequests.forEach(function (oRequest) {
				mockRequest(oRequestorMock, sResourcePath, oRequest.skip, oRequest.top);
			});

			oFixture.reads.forEach(function (oRead) {
				oPromise = oPromise.then(function () {
					return oCache.read(oRead.index, oRead.length, undefined, undefined,
							fnDataRequested)
						.then(function (oResult) {
							assert.deepEqual(oResult, createResult(oRead.index, oRead.length));
					});
				});
			});
			return oPromise.then(function () {
				// expect by default 2 calls of the callback
				assert.strictEqual(iDataRequestedCount,
					oFixture.expectedCallbackCount ? oFixture.expectedCallbackCount : 2,
					"data requested called");
			});
		});

		QUnit.test("multiple read, " + oFixture.title + " (parallel)", function (assert) {
			var iDataRequestedCount = 0,
				fnDataRequested = function () {iDataRequestedCount++;},
				oRequestor = _Requestor.create("/~/"),
				sResourcePath = "Employees",
				oCache = _Cache.create(oRequestor, sResourcePath),
				aPromises = [],
				oRequestorMock = this.mock(oRequestor);

			oFixture.expectedRequests.forEach(function (oRequest) {
				mockRequest(oRequestorMock, sResourcePath, oRequest.skip, oRequest.top);
			});

			oFixture.reads.forEach(function (oRead) {
				aPromises.push(oCache.read(oRead.index, oRead.length, undefined, undefined,
						fnDataRequested)
					.then(function (oResult) {
						assert.deepEqual(oResult, createResult(oRead.index, oRead.length));
				}));
			});
			return Promise.all(aPromises).then(function () {
				// expect by default 2 calls of the callback
				assert.strictEqual(iDataRequestedCount,
					oFixture.expectedCallbackCount ? oFixture.expectedCallbackCount : 2,
					"data requested called");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("convertQueryOptions", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oExpand = {};

		oCacheMock.expects("convertExpand")
			.withExactArgs(sinon.match.same(oExpand)).returns("expand");

		assert.deepEqual(_Cache.convertQueryOptions({
			foo : "bar",
			$expand : oExpand,
			$filter : "BuyerName eq 'SAP'",
			$orderby : "GrossAmount asc",
			$select : ["select1", "select2"]
		}), {
			foo : "bar",
			$expand : "expand",
			$filter : "BuyerName eq 'SAP'",
			$orderby : "GrossAmount asc",
			$select : "select1,select2"
		});

		assert.deepEqual(_Cache.convertQueryOptions({
			$select : "singleSelect"
		}), {
			$select : "singleSelect"
		});

		assert.strictEqual(_Cache.convertQueryOptions(undefined), undefined);

		["$format", "$id", "$inlinecount", "$search", "$skip", "$skiptoken", "$top"
		].forEach(function (sSystemOption) {
			assert.throws(function () {
				var mQueryOptions = {};

				mQueryOptions[sSystemOption] = "foo";
				_Cache.convertQueryOptions(mQueryOptions);
			}, new RegExp("Unsupported system query option \\" + sSystemOption));
		});
	});

	//*********************************************************************************************
	QUnit.test("convertExpandOptions", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oExpand = {};

		oCacheMock.expects("convertExpand")
			.withExactArgs(sinon.match.same(oExpand)).returns("expand");

		assert.strictEqual(_Cache.convertExpandOptions("foo", {
			$expand : oExpand,
			$select : ["select1", "select2"]
		}), "foo($expand=expand;$select=select1,select2)");

		assert.strictEqual(_Cache.convertExpandOptions("foo", {}), "foo");
	});

	//*********************************************************************************************
	QUnit.test("convertExpand", function (assert) {
		var oOptions = {};

		["Address", null].forEach(function (vValue) {
			assert.throws(function () {
				_Cache.convertExpand(vValue);
			}, new Error("$expand must be a valid object"));
		});

		this.mock(_Cache).expects("convertExpandOptions")
			.withExactArgs("baz", sinon.match.same(oOptions)).returns("baz(options)");

		assert.strictEqual(_Cache.convertExpand({
			foo : true,
			bar : null,
			baz : oOptions
		}), "foo,bar,baz(options)");
	});

	//*********************************************************************************************
	QUnit.test("buildQueryString", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oConvertedQueryParams = {},
			oQueryParams = {};

		oCacheMock.expects("convertQueryOptions")
			.withExactArgs(undefined).returns(undefined);

		assert.strictEqual(_Cache.buildQueryString(undefined), "");

		oCacheMock.expects("convertQueryOptions")
			.withExactArgs(oQueryParams).returns(oConvertedQueryParams);
		this.mock(_Helper).expects("buildQuery")
			.withExactArgs(sinon.match.same(oConvertedQueryParams)).returns("?query");

		assert.strictEqual(_Cache.buildQueryString(oQueryParams), "?query");
	});

	//*********************************************************************************************
	QUnit.test("buildQueryString examples", function (assert) {
		[{
			o : {foo : ["bar", "€"], $select : "IDÖ"},
			s : "foo=bar&foo=%E2%82%AC&$select=ID%C3%96"
		}, {
			o : {$select : ["ID"]},
			s : "$select=ID"
		}, {
			o : {$select : ["ID", "Name"]},
			s : "$select=ID,Name"
		}, {
			o : {$expand : {SO_2_BP : true, SO_2_SOITEM : true}},
			s : "$expand=SO_2_BP,SO_2_SOITEM"
		}, {
			o : {$expand : {SO_2_BP : true, SO_2_SOITEM : {$select : "CurrencyCode"}}},
			s : "$expand=SO_2_BP,SO_2_SOITEM($select=CurrencyCode)"
		}, {
			o : {
				$expand : {
					SO_2_BP : true,
					SO_2_SOITEM : {
						$select : ["ItemPosition", "Note"]
					}
				}
			},
			s : "$expand=SO_2_BP,SO_2_SOITEM($select=ItemPosition,Note)"
		}, {
			o : {
				$expand : {
					SO_2_BP : true,
					SO_2_SOITEM : {
						$expand : {
							SOITEM_2_PRODUCT : {
								$expand : {
									PRODUCT_2_BP : true
								},
								$filter : "CurrencyCode eq 'EUR'",
								$select : "CurrencyCode"
							},
							SOITEM_2_SO : true
						}
					}
				},
				"sap-client" : "003"
			},
			s : "$expand=SO_2_BP,SO_2_SOITEM($expand=SOITEM_2_PRODUCT($expand=PRODUCT_2_BP;"
				+ "$filter=CurrencyCode%20eq%20'EUR';$select=CurrencyCode),SOITEM_2_SO)"
				+ "&sap-client=003"
		}].forEach(function (oFixture) {
			assert.strictEqual(_Cache.buildQueryString(oFixture.o, false), "?" + oFixture.s,
				oFixture.s);
		});
	});

	//*********************************************************************************************
	QUnit.test("query params", function (assert) {
		var oCache,
			mQueryParams = {},
			sQueryParams = "?query",
			oRequestor,
			sResourcePath = "Employees";

		this.mock(_Cache).expects("buildQueryString")
			.withExactArgs(sinon.match.same(mQueryParams))
			.returns(sQueryParams);

		oRequestor = _Requestor.create("/~/");
		oCache = _Cache.create(oRequestor, sResourcePath, mQueryParams);

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath + sQueryParams + "&$skip=0&$top=5", undefined)
			.returns(Promise.resolve({value: []}));

		// code under test
		mQueryParams.$select = "foo"; // modification must not affect cache
		return oCache.read(0, 5);
	});

	//*********************************************************************************************
	QUnit.test("error handling", function (assert) {
		var oError = {},
			oRequestor = _Requestor.create("/~/"),
			oSuccess = createResult(0, 5),
			sResourcePath = "Employees",
			oCache = _Cache.create(oRequestor, sResourcePath),
			oRequestorMock = this.mock(oRequestor);

		oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined)
			.returns(Promise.reject(oError));
		oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined)
			.returns(Promise.resolve(oSuccess));

		// code under test
		return oCache.read(0, 5).catch(function (oResult1) {
			assert.strictEqual(oResult1, oError);
			return oCache.read(0, 5).then(function (oResult2) {
				assert.deepEqual(oResult2, oSuccess);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("read single employee", function (assert) {
		var oCache,
			iDataRequestedCount = 0,
			fnDataRequested = function () {iDataRequestedCount++;},
			oExpectedResult = {},
			aPromises = [],
			mQueryParams = {
				"sap-client" : "300"
			},
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')";

		this.mock(_Cache).expects("buildQueryString")
			.withExactArgs(mQueryParams).returns("?~");
		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath + "?~", "group")
			.returns(Promise.resolve(oExpectedResult));

		oCache = _Cache.createSingle(oRequestor, sResourcePath, mQueryParams);
		aPromises.push(oCache.read("group", undefined, fnDataRequested).then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult);
		}));
		assert.strictEqual(iDataRequestedCount, 1, "data requested called only once");
		aPromises.push(oCache.read("group", undefined, fnDataRequested).then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult);
		}));
		return Promise.all(aPromises).then(function () {
			assert.strictEqual(iDataRequestedCount, 1, "data requested called only once");
		});
	});

	//*********************************************************************************************
	QUnit.test("read single property", function (assert) {
		var oExpectedResult = {value : "John Doe"},
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')/Name",
			oCache;

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath, undefined)
			.returns(Promise.resolve(oExpectedResult));

		// code under test
		oCache = _Cache.createSingle(oRequestor, sResourcePath, undefined, /*bSingleProperty*/true);

		assert.throws(function () {
			oCache.post();
		}, /POST request not allowed/);
		return oCache.read().then(function (sName) {
			assert.strictEqual(sName, "John Doe", "automatic {value : ...} unwrapping");
		});
	});

	//*********************************************************************************************
	QUnit.test("read single null value", function (assert) {
		var oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')/DateOfBirth",
			oCache;

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath, undefined)
			.returns(Promise.resolve(undefined)); // 204 No Content

		// code under test
		oCache = _Cache.createSingle(oRequestor, sResourcePath, undefined, /*bSingleProperty*/true);

		return oCache.read().then(function (sName) {
			assert.strictEqual(sName, null, "automatic {value : ...} unwrapping");
		});
	});

	//*********************************************************************************************
	QUnit.test("read single employee, drill-down", function (assert) {
		var oExpectedResult = {
				foo : {
					bar : 42,
					"null" : null
				}
			},
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')",
			oCache = _Cache.createSingle(oRequestor, sResourcePath),
			aPromises = [];

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath, undefined)
			.returns(Promise.resolve(oExpectedResult));

		aPromises.push(oCache.read(undefined, "foo").then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult.foo);
		}));
		aPromises.push(oCache.read(undefined, "foo/bar").then(function (oResult) {
			assert.strictEqual(oResult, 42);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees('1')/foo/bar/invalid, invalid segment: invalid",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(undefined, "foo/bar/invalid").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees('1')/foo/null/invalid, invalid segment: invalid",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(undefined, "foo/null/invalid").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into Employees('1')/foo/baz, invalid segment: baz",
			null, "sap.ui.model.odata.v4.lib._Cache");
		aPromises.push(oCache.read(undefined, "foo/baz").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		}));
		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("update", function (assert) {
		var sEditUrl = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			sETag = 'W/"19700101000000.0000000"',
			fnResolve,
			oPatchPromise = new Promise(function (resolve, reject) {
				fnResolve = resolve;
			}),
			oProduct = {},
			oPromise = Promise.resolve({
				value : [{
					SalesOrderID : "0",
					SO_2_SOITEM : [{
						"@odata.etag" : sETag,
						Note : "Some Note",
						SideEffect : "before",
						SOITEM_2_PRODUCT : oProduct // let's assume we had expanded this
					}]
				}]
			}),
			oRequestor = _Requestor.create("/"),
			oRequestorMock = this.mock(oRequestor),
			sResourcePath = "/SalesOrderList(SalesOrderID='0')",
			// server responds with different value, e.g. upper case, and side effect
			oResult = {
				"@odata.etag" : 'W/"19700101000000.9999999"',
				Note : "FOO",
				NotSelected : "ignore me",
				SideEffect : "after"
				// SOITEM_2_PRODUCT not present in PATCH response!
			},
			oCache = _Cache.create(oRequestor, sResourcePath, {$expand : {SO_2_SOITEM : true}});

		oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$expand=SO_2_SOITEM&$skip=0&$top=1", "groupId")
			.returns(oPromise);
		oCache.read(0, 1, "groupId"); // triggers GET
		oRequestorMock.expects("request")
			.withExactArgs("PATCH", sEditUrl, "updateGroupId", {"If-Match" : sETag}, {Note : "foo"})
			.returns(oPatchPromise);

		return oPromise.then(function () {
			var oUpdatePromise
				// code under test
				= oCache.update("updateGroupId", "Note", "foo", sEditUrl, "0/SO_2_SOITEM/0")
					.then(function (oResult1) {
						assert.strictEqual(oResult1, oResult, "A Promise for the PATCH request");
						return oCache.read(0, 1, undefined, "SO_2_SOITEM/0")
							.then(function (oResult0) {
								assert.strictEqual(oResult0["@odata.etag"], oResult["@odata.etag"],
									"@odata.etag has been updated");
								assert.strictEqual(oResult0.Note, oResult.Note,
									"Note has been updated with server's response");
								assert.strictEqual(oResult0.SideEffect, oResult.SideEffect,
									"SideEffect has been updated with server's response");
								assert.strictEqual("NotSelected" in oResult0, false,
									"Cache not updated with properties not selected by GET");
								assert.strictEqual(oResult0.SOITEM_2_PRODUCT, oProduct,
									"Navigational properties not lost by cache update");
							});
					});

			oCache.read(0, 1, undefined, "SO_2_SOITEM/0").then(function (oResult0) {
				assert.strictEqual(oResult0.Note, "foo",
					"Note has been updated with user input");

				// now it's time for the server's response
				fnResolve(oResult);
			});
			return oUpdatePromise;
		});
	});
	// TODO fnLog of drillDown in CollectionCache#update

	//*********************************************************************************************
	QUnit.test("SingleCache: post", function (assert) {
		var fnDataRequested = sinon.spy(),
			sGroupId = "group",
			oPostData = {},
			oPromise,
			oRequestor = _Requestor.create("/~/"),
			oRequestorMock = this.mock(oRequestor),
			sResourcePath = "LeaveRequest('1')/Submit",
			oCache = _Cache.createSingle(oRequestor, sResourcePath, undefined, false, true),
			oResult1 = {},
			oResult2 = {};

		oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sGroupId, undefined, oPostData)
			.returns(Promise.resolve(oResult1));
		oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sGroupId, undefined, oPostData)
			.returns(Promise.resolve(oResult2));

		// code under test
		assert.throws(function () {
			oCache.refresh();
		}, /Refresh not allowed when using POST/);
		assert.throws(function () {
			oCache.read();
		}, /Read before a POST request/);
		oPromise = oCache.post(sGroupId, oPostData).then(function (oPostResult1) {
			assert.strictEqual(oPostResult1, oResult1);
			return Promise.all([
				oCache.read("foo", "", fnDataRequested).then(function (oReadResult) {
					assert.strictEqual(oReadResult, oResult1);
					assert.strictEqual(fnDataRequested.callCount, 0);
				}),
				oCache.post(sGroupId, oPostData).then(function (oPostResult2) {
					assert.strictEqual(oPostResult2, oResult2);
				})
			]);
		});
		assert.throws(function () {
			oCache.post(sGroupId, oPostData);
		}, /Parallel POST requests not allowed/);
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: post failure", function (assert) {
		var sGroupId = "group",
			sMessage = "deliberate failure",
			oPostData = {},
			oPromise,
			oRequestor = _Requestor.create("/~/"),
			oRequestorMock = this.mock(oRequestor),
			sResourcePath = "LeaveRequest('1')/Submit",
			oCache = _Cache.createSingle(oRequestor, sResourcePath, undefined, false, true);

		oRequestorMock.expects("request").twice()
			.withExactArgs("POST", sResourcePath, sGroupId, undefined, oPostData)
			.returns(Promise.reject(new Error(sMessage)));

		// code under test
		oPromise = oCache.post(sGroupId, oPostData).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, sMessage);
			return oCache.post(sGroupId, oPostData).then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, sMessage);
			});
		});
		assert.throws(function () {
			oCache.post(sGroupId, oPostData);
		}, /Parallel POST requests not allowed/);
		return oPromise.catch(function () {});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		QUnit.test("read single employee (real OData)", function (assert) {
			var oExpectedResult = {
					"@odata.context" : "$metadata#TEAMS/$entity",
					"Team_Id" : "TEAM_01",
					Name : "Business Suite",
					MEMBER_COUNT : 2,
					MANAGER_ID : "3",
					BudgetCurrency : "USD",
					Budget : "555.55"
				},
				oRequestor = _Requestor.create(TestUtils.proxy(
					"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/")),
				sResourcePath = "TEAMS('TEAM_01')",
				oCache = _Cache.createSingle(oRequestor, sResourcePath);

			return oCache.read().then(function (oResult) {
				assert.deepEqual(oResult, oExpectedResult);
			});
		});
	}

	//*********************************************************************************************
	QUnit.test("SingleCache.refresh - basics", function (assert) {
		var oCache,
			oPromise,
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')";

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath, undefined)
			.returns(Promise.resolve({}));

		oCache = _Cache.createSingle(oRequestor, sResourcePath);
		oPromise = oCache.read();

		return oPromise.then(function () {
			oCache.refresh();
			assert.strictEqual(oCache.oPromise, undefined, "Cached promise is cleared");
		});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache.refresh - cancel pending requests", function (assert) {
		var oCache,
			aPromises = [],
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees('1')";

		this.mock(oRequestor).expects("request").twice()
			.withExactArgs("GET", sResourcePath, undefined)
			.onFirstCall().returns(Promise.resolve({}))
			.onSecondCall().returns(Promise.resolve({}));

		oCache = _Cache.createSingle(oRequestor, sResourcePath);

		aPromises.push(oCache.read().then(function () {
			assert.ok(false, "Refresh shall cancel this read");
		}).catch(function (oError) {
			assert.strictEqual(oError.canceled, true, "Canceled error thrown");
			assert.strictEqual(oError.message,
				"Refresh canceled pending request: /~/Employees('1')");
		}));

		oCache.refresh();
		// a read after refresh triggers a second request; if read fails test framework protocols
		// the failure: Promise rejected during SingleCache.refresh...
		aPromises.push(oCache.read());
		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("_Cache.refresh - basics", function (assert) {
		var oCache,
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees";

		this.mock(oRequestor).expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=20", undefined)
			.returns(Promise.resolve(createResult(0, 10)));

		oCache = _Cache.create(oRequestor, sResourcePath);

		// read 20 but receive only 10 to simulate a short read to set iMaxElements
		return oCache.read(0, 20).then(function () {
			var aElements = oCache.aElements;

			oCache.refresh();
			assert.strictEqual(oCache.sContext, undefined, "sContext after refresh");
			assert.strictEqual(oCache.iMaxElements, -1, "iMaxElements after refresh");
			assert.strictEqual(oCache.aElements.length, 0, "aElements after refresh");
			assert.notStrictEqual(oCache.aElements, aElements,
				"different aElements arrays after refresh");
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache.refresh - cancel pending requests", function (assert) {
		var oCache,
			aPromises = [],
			oRequestor = _Requestor.create("/~/"),
			sResourcePath = "Employees";

		this.mock(oRequestor).expects("request").twice()
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=10", undefined)
			.returns(Promise.resolve(createResult(0, 10)));

		oCache = _Cache.create(oRequestor, sResourcePath);

		aPromises.push(oCache.read(0, 10).then(function () {
			assert.ok(false, "Refresh shall cancel this read");
		}).catch(function (oError) {
			assert.strictEqual(oError.canceled, true, "Canceled error thrown");
			assert.strictEqual(oError.message,
				"Refresh canceled pending request: /~/Employees?$skip=0&$top=10");
			// Elements for read after refresh must not be removed from the elements array
			assert.strictEqual(oCache.aElements[9], "j", "elements array must not be cleared");
		}));

		oCache.refresh();
		// a read after refresh triggers a second request; if read fails test framework protocols
		// the failure: Promise rejected during _Cache.refresh...
		aPromises.push(oCache.read(0, 10));
		return Promise.all(aPromises);
	});

	//*********************************************************************************************
	QUnit.test("_Cache.toString", function (assert) {
		var oCache,
			oRequestor = _Requestor.create("/~/"),
			mQueryParams = {$select : "ID"},
			sResourcePath = "Employees",
			sResourcePathSingle = "Employees('1')";

		oCache = _Cache.create(oRequestor, sResourcePath, mQueryParams);
		assert.strictEqual(oCache.toString(), "/~/" + sResourcePath + "?$select=ID&");

		oCache = _Cache.createSingle(oRequestor, sResourcePathSingle);
		assert.strictEqual(oCache.toString(), "/~/" + sResourcePathSingle);
	});

	//*********************************************************************************************
	[{
		// absolute property binding
		sEditUrl : "ProductList('HT-1000')",
		oGetResult : {
			// "value" is a fixed name here (see "11 Individual Property or Operation Response")
			value : "MyName"
		},
		sResourcePath : "ProductList('HT-1000')/Name",
		bSingleProperty : true
	}, {
		// relative property binding
		sEditUrl : "ProductList('HT-1000')",
		sETag : 'W/"19700101000000.0000000"',
		oGetResult : {
			"@odata.etag" : 'W/"19700101000000.0000000"',
			HERE_2_THERE : {},
			Name : "MyName",
			SideEffect : "before"
		},
		sReadPath : "Name",
		sResourcePath : "ProductList('HT-1000')"
	}, {
		// relative list binding (relative context binding is very similar!)
		sEditUrl : "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
		sETag : 'W/"19700101000000.0000000"',
		oGetResult : {
			SalesOrderID : "0",
			SO_2_SOITEM : [{
				"@odata.etag" : 'W/"19700101000000.0000000"',
				HERE_2_THERE : {},
				Name : "MyName",
				SideEffect : "before"
			}]
		},
		sReadPath : "SO_2_SOITEM",
		sResourcePath : "SalesOrderList(SalesOrderID='0')?$expand=SO_2_SOITEM",
		sUpdatePath : "SO_2_SOITEM/0"
	}].forEach(function (o) {
		QUnit.test("SingleCache.update: " + o.sResourcePath, function (assert) {
			var fnResolve,
				oPatchPromise = new Promise(function (resolve, reject) {
					fnResolve = resolve;
				}),
				oRequestor = _Requestor.create("/"),
				oRequestorMock = this.mock(oRequestor),
				oCache = _Cache.createSingle(oRequestor, o.sResourcePath, null, o.bSingleProperty),
				// server responds with different value, e.g. upper case, and side effect
				oResult = {
					"@odata.etag" : 'W/"19700101000000.9999999"',
					Name : "FOO",
					NotSelected : "ignore me",
					SideEffect : "after"
					// SOITEM_2_PRODUCT not present in PATCH response!
				},
				oUpdatePromise;

			oRequestorMock.expects("request")
				.withExactArgs("GET", o.sResourcePath, "groupId")
				.returns(Promise.resolve(o.oGetResult));
			oCache.read("groupId", o.sReadPath); // triggers GET
			oRequestorMock.expects("request")
				.withExactArgs("PATCH", o.sEditUrl, "up", {"If-Match" : o.sETag}, {Name : "foo"})
				.returns(oPatchPromise);

			// code under test
			oUpdatePromise = oCache.update("up", "Name", "foo", o.sEditUrl, o.sUpdatePath)
				.then(function (oResult1) {
					assert.strictEqual(oResult1, oResult, "A Promise for the PATCH request");

					return oCache.read(undefined, o.sUpdatePath).then(function (vResult0) {
						if (o.bSingleProperty) {
							assert.strictEqual(vResult0, oResult.Name,
								"value has been updated with server's response");
						} else {
							assert.strictEqual(vResult0["@odata.etag"], oResult["@odata.etag"],
								"@odata.etag has been updated");
							assert.strictEqual(vResult0.Name, oResult.Name,
								"Name has been updated with server's response");
							assert.strictEqual(vResult0.SideEffect, oResult.SideEffect,
								"SideEffect has been updated with server's response");
							assert.strictEqual("NotSelected" in vResult0, false,
								"Cache not updated with properties not selected by GET");
							assert.deepEqual(vResult0.HERE_2_THERE, {/*details omitted*/},
								"Navigational properties not lost by cache update");
						}
					});
				});
			oCache.read(undefined, o.sUpdatePath).then(function (vResult0) {
				if (o.bSingleProperty) {
					assert.strictEqual(vResult0, "foo",
						"value has been updated with user input");
				} else {
					assert.strictEqual(vResult0.Name, "foo",
						"Name has been updated with user input");
				}

				// now it's time for the server's response
				fnResolve(oResult);
			});
			return oUpdatePromise;
		});
	});
	// TODO fnLog of drillDown in SingleCache#update
});