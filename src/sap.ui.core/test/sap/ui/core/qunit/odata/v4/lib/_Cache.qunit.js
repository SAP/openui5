/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/test/TestUtils"
], function (jQuery, SyncPromise, _Cache, _GroupLock, _Helper, _Requestor, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aTestData = "abcdefghijklmnopqrstuvwxyz".split("");

	/**
	 * Simulates an OData server response, limited to 26 items.
	 * @param {number} iIndex The index of the first item
	 * @param {number} iLength The length of the response
	 * @param {string|number} [vCount] The value for "@odata.count"
	 * @returns {object} A server response object
	 */
	function createResult(iIndex, iLength, vCount) {
		var oResult = {
				"@odata.context" : "$metadata#TEAMS",
				value : aTestData.slice(iIndex, iIndex + iLength).map(function (s) {
					return {key : s};
				})
			};

		if (vCount !== undefined) {
			oResult["@odata.count"] = String(vCount);
		}
		return oResult;
	}


	/*
	 * Simulation of {@link sap.ui.model.odata.v4.ODataModel#getGroupProperty}
	 */
	function defaultGetGroupProperty(sGroupId, sPropertyName) {
		if (sGroupId === "$direct") {
			return "Direct";
		}
		if (sGroupId === "$auto") {
			return "Auto";
		}
		return "API";
	}

	/**
	 * Replacement for Array#fill which IE does not support.
	 *
	 * @param {any[]} a
	 *   Some array
	 * @param {any} v
	 *   Some value
	 * @param {number} i
	 *   Start index
	 * @param {number} [n=a.length]
	 *   End index (exclusive)
	 * @returns {any[]}
	 *   <code>a</code>
	 */
	function fill(a, v, i, n) {
		if (n === undefined) {
			n = a.length;
		}

		while (i < n) {
			a[i] = v;
			i += 1;
		}

		return a;
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () {return "";},
				fetchTypeForPath : function () {return SyncPromise.resolve({}); },
				getGroupSubmitMode : function (sGroupId) {
					return defaultGetGroupProperty(sGroupId);
				},
				getServiceUrl : function () {return "/~/";},
				isActionBodyOptional : function () {},
				relocate : function () {},
				removePatch : function () {},
				removePost : function () {},
				request : function () {}
			};
			this.oRequestorMock = this.mock(this.oRequestor);
		},

		/**
		 * Creates a collection cache. Only resource path and query options must be supplied. Uses
		 * this.oRequestor, does not calculate key predicates, does not sort query options.
		 *
		 * @param {string} sResourcePath The resource path
		 * @param {object} [mQueryOptions] The query options.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createCache : function (sResourcePath, mQueryOptions) {
			return _Cache.create(this.oRequestor, sResourcePath, mQueryOptions, false);
		},

		/**
		 * Creates a single cache. Only resource path and query options must be supplied. Uses
		 * this.oRequestor, does not calculate key predicates, does not sort query options.
		 *
		 * @param {string} sResourcePath The resource path
		 * @param {object} [mQueryOptions] The query options.
		 * @param {boolean} [bPost] Whether the cache uses POST requests.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createSingle : function (sResourcePath, mQueryOptions, bPost) {
			return _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions, false, bPost);
		},

		/**
		 * Mocks a server request for a CollectionCache. The response is limited to 26 items.
		 *
		 * @param {string} sUrl The service URL
		 * @param {number} iStart The index of the first item of the response
		 * @param {number} iLength The length of the request
		 * @param {function} fnSubmit The submit function of the request call
		 * @param {string|number} [vCount] The value for "@odata.count"
		 * @returns {Promise} A promise on the server response object
		 */
		mockRequest : function (sUrl, iStart, iLength, fnSubmit, vCount) {
			var oPromise = Promise.resolve(createResult(iStart, iLength, vCount));

			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sUrl + "?$skip=" + iStart + "&$top=" + iLength,
					/*sGroupId*/undefined, /*mHeaders*/undefined, /*oPayload*/undefined, fnSubmit)
				.returns(oPromise);

			return oPromise;
		}
	});

	//*********************************************************************************************
	QUnit.test("_Cache basics", function (assert) {
		var mQueryOptions = {},
			sResourcePath = "TEAMS('42')",
			oCache;

		this.mock(_Cache.prototype).expects("setQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions));
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS('42')").returns("/TEAMS");

		// code under test
		oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions,
			"bSortExpandSelect");

		assert.strictEqual(oCache.bActive, true);
		assert.deepEqual(oCache.mChangeListeners, {});
		assert.strictEqual(oCache.sMetaPath, "/TEAMS");
		assert.deepEqual(oCache.mPatchRequests, {});
		assert.deepEqual(oCache.mPostRequests, {});
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, sResourcePath);
		assert.strictEqual(oCache.bSentReadRequest, false);
		assert.strictEqual(oCache.oTypePromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#setQueryOptions", function (assert) {
		var sMetaPath = "/TEAMS",
			mNewQueryOptions = {},
			mQueryOptions = {},
			oCache;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sMetaPath, sinon.match.same(mQueryOptions), false, "bSortExpandSelect")
			.returns("?foo=bar");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sMetaPath, sinon.match.same(mNewQueryOptions), false,
				"bSortExpandSelect")
			.returns("?baz=boo");

		oCache = new _Cache(this.oRequestor, "TEAMS('42')", mQueryOptions, "bSortExpandSelect");
		assert.strictEqual(oCache.sQueryString, "?foo=bar");

		// code under test
		oCache.setQueryOptions(mNewQueryOptions);

		assert.strictEqual(oCache.mQueryOptions, mNewQueryOptions);
		assert.strictEqual(oCache.sQueryString, "?baz=boo");

		oCache.bSentReadRequest = true;

		// code under test
		assert.throws(function () {
			oCache.setQueryOptions(mQueryOptions);
		}, new Error("Cannot set query options: Cache has already sent a read request"));
	});

	//*********************************************************************************************
	QUnit.test("_Cache hierarchy", function (assert) {
		assert.ok(_Cache.create(this.oRequestor, "TEAMS") instanceof _Cache);
		assert.ok(_Cache.createSingle(this.oRequestor, "TEAMS('42')") instanceof _Cache);
		assert.ok(_Cache.createProperty(this.oRequestor, "TEAMS('42')/Team_Id") instanceof _Cache);
	});

	//*********************************************************************************************
	QUnit.test("_Cache: single cache with optional meta path", function (assert) {
		var sMetaPath = "/com.sap.gateway.default.iwbep.tea_busi.v0001.TEAM",
			oSingleCache = _Cache.createSingle(this.oRequestor, "TEAMS('42')", undefined, false,
				false, sMetaPath);

		assert.strictEqual(oSingleCache.sMetaPath, sMetaPath);

		this.mock(this.oRequestor).expects("fetchTypeForPath").withExactArgs(sMetaPath)
			.returns(SyncPromise.resolve());

		// code under test
		oSingleCache.fetchTypes();
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCount) {
		[200, 404, 500].forEach(function (iStatus) {
			QUnit.test("_Cache#_delete: from collection, status: " + iStatus + ", bCount: "
					+ bCount, function (assert) {
				var mQueryOptions = {foo : "bar"},
					oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')", mQueryOptions),
					sEtag = 'W/"19770724000000.0000000"',
					aCacheData = [{
						"@odata.etag" : "before"
					}, {
						"@$ui5._" : {"predicate" : "('42')"},
						"@odata.etag" : sEtag
					}, {
						"@odata.etag" : "after"
					}],
					fnCallback = this.spy(),
					oError = new Error(""),
					oGroupLock = new _GroupLock("groupId"),
					oPromise;

				aCacheData.$count = bCount ? 3 : undefined;
				aCacheData.$byPredicate = {"('42')" : aCacheData[1]};
				oCache.fetchValue = function () {};
				// no need for different tests for top level or nested collections because
				// fetchValue takes care to deliver corresponding elements
				this.mock(oCache).expects("fetchValue")
					.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEE_2_EQUIPMENTS")
					.returns(SyncPromise.resolve(aCacheData));

				this.spy(_Helper, "updateCache");
				oError.status = iStatus;
				this.oRequestorMock.expects("buildQueryString")
					.withExactArgs("/EMPLOYEES", sinon.match.same(mQueryOptions), true)
					.returns("?foo=bar");
				this.oRequestorMock.expects("request")
					.withExactArgs("DELETE", "Equipments('1')?foo=bar",
						sinon.match.same(oGroupLock), {"If-Match" : sEtag})
					.returns(iStatus === 200 ? Promise.resolve({}) : Promise.reject(oError));

				// code under test
				oPromise = oCache._delete(oGroupLock, "Equipments('1')", "EMPLOYEE_2_EQUIPMENTS/1",
						fnCallback)
					.then(function (oResult) {
						assert.ok(iStatus !== 500, "unexpected success");
						assert.strictEqual(oResult, undefined);
						assert.strictEqual(aCacheData.$count, bCount ? 2 : undefined);
						if (bCount) {
							sinon.assert.calledWithExactly(_Helper.updateCache,
								sinon.match.same(oCache.mChangeListeners), "EMPLOYEE_2_EQUIPMENTS",
								sinon.match.same(aCacheData), {$count : 2});
						} else {
							sinon.assert.notCalled(_Helper.updateCache);
						}
						assert.deepEqual(aCacheData, [{
							"@odata.etag" : "before"
						}, {
							"@odata.etag" : "after"
						}]);
						assert.deepEqual(aCacheData.$byPredicate, {});
						sinon.assert.calledOnce(fnCallback);
						sinon.assert.calledWithExactly(fnCallback, 1, aCacheData);
					}, function (oError0) {
						assert.ok(iStatus === 500, JSON.stringify(oError0));
						assert.strictEqual(aCacheData.$count, bCount ? 3 : undefined);
						assert.strictEqual(oError0, oError);
						assert.strictEqual(aCacheData[1]["@odata.etag"], sEtag);
						assert.notOk("$ui5.deleting" in aCacheData[1]);
						sinon.assert.notCalled(fnCallback);
					});

				assert.strictEqual(aCacheData[1]["$ui5.deleting"], true);

				return oPromise;
			});
		});
	});
	//TODO adjust paths in mPatchRequests?
	//TODO trigger update in case of isConcurrentModification?!
	//TODO do it anyway? what and when to return, result of remove vs. re-read?

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: from collection, must not delete twice", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES"),
			aCacheData = [{"$ui5.deleting" : true}],
			oGroupLock = new _GroupLock("groupId");

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "1/EMPLOYEE_2_EQUIPMENTS")
			.returns(SyncPromise.resolve(aCacheData));

		// code under test
		oCache._delete(oGroupLock, "Equipments('0')", "1/EMPLOYEE_2_EQUIPMENTS/0")
			.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, "Must not delete twice: Equipments('0')");
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: from collection, parallel delete", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES"),
			aCacheData = [],
			fnCallback = this.spy(),
			oGroupLock = new _GroupLock("groupId"),
			oSuccessor = {};

		aCacheData[42] = {};
		aCacheData[43] = oSuccessor;
		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "")
			.returns(SyncPromise.resolve(aCacheData));

		this.mock(this.oRequestor).expects("request").callsFake(function () {
			// simulate another delete while this one is waiting for its promise
			aCacheData.splice(0, 1);
			return Promise.resolve();
		});

		// code under test
		return oCache._delete(oGroupLock, "EMPLOYEES('42')", "42", fnCallback)
			.then(function () {
				assert.strictEqual(aCacheData[41], oSuccessor);
				sinon.assert.calledWith(fnCallback, 41);
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: nested entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')",
				{$expand : {EMPLOYEE_2_TEAM : true}}),
			sEtag = 'W/"19770724000000.0000000"',
			oCacheData = {
				"EMPLOYEE_2_TEAM" : {
					"@odata.etag" : sEtag
				}
			},
			fnCallback = this.spy(),
			oGroupLock = new _GroupLock("groupId"),
			oUpdateData = {};


		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "")
			.returns(SyncPromise.resolve(oCacheData));
		this.oRequestorMock.expects("request")
			.withExactArgs("DELETE", "TEAMS('23')", sinon.match.same(oGroupLock),
				{"If-Match" : sEtag})
			.returns(Promise.resolve({}));
		this.mock(_Cache).expects("makeUpdateData").withExactArgs(["EMPLOYEE_2_TEAM"], null)
			.returns(oUpdateData);
		this.mock(_Helper).expects("updateCache")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oCacheData), sinon.match.same(oUpdateData));

		// code under test
		return oCache._delete(oGroupLock, "TEAMS('23')", "EMPLOYEE_2_TEAM", fnCallback)
			.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
				sinon.assert.calledOnce(fnCallback);
				sinon.assert.calledWithExactly(fnCallback);
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#addByPath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			mMap = {};

		oCache.addByPath(mMap, "path1", "item1");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		oCache.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"], "path2" : ["item2"]});

		oCache.addByPath(mMap, "path3", undefined);
		assert.deepEqual(mMap, {"path1" : ["item1"], "path2" : ["item2"]});

		oCache.addByPath(mMap, "path1", "item3");
		assert.deepEqual(mMap, {"path1" : ["item1", "item3"], "path2" : ["item2"]});

		oCache.addByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1", "item3"], "path2" : ["item2"]});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#removeByPath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			mMap = {"path1": ["item1", "item2"]};

		oCache.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		oCache.removeByPath(mMap, "path2", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		oCache.removeByPath(mMap, "path1", "item2");
		assert.deepEqual(mMap, {"path1" : ["item1"]});

		oCache.removeByPath(mMap, "path1", "item1");
		assert.deepEqual(mMap, {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#registerChange", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		this.mock(oCache).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.registerChange("path", "listener");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#deregisterChange", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		this.mock(oCache).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.deregisterChange("path", "listener");
	});

	//*********************************************************************************************
	[true, false].forEach(function (bPatch) {
		QUnit.test("_Cache#hasPendingChangesForPath: bPatch = " + bPatch, function (assert) {
			var oCache = new _Cache(this.oRequestor, "TEAMS");

			oCache[bPatch ? "mPatchRequests" : "mPostRequests"]["foo/bar/baz"] = [{}];

			assert.strictEqual(oCache.hasPendingChangesForPath("bar"), false);
			assert.strictEqual(oCache.hasPendingChangesForPath(""), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo"), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/ba"), false);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar"), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bars"), false);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/ba"), false);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baz"), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baze"), false);
			assert.strictEqual(oCache.hasPendingChangesForPath("foo/bar/baz/qux"), false);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: PATCHes", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCall1,
			oCall2;

		oCache.mPatchRequests = {
			"foo/ba" : ["foo/ba"],
			"foo/bar" : ["foo/bar/1", "foo/bar/2"],
			"foo/bars" : ["foo/bars"],
			"foo/bar/baz" : ["foo/bar/baz"]
		};

		oCall1 = this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/2");
		oCall2 = this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/1");
		this.oRequestorMock.expects("removePatch").withExactArgs("foo/bar/baz");

		// code under test
		oCache.resetChangesForPath("foo/bar");

		sinon.assert.callOrder(oCall1, oCall2);
		assert.deepEqual(oCache.mPatchRequests, {
			"foo/ba" : ["foo/ba"],
			"foo/bars" : ["foo/bars"]
		});

		this.oRequestorMock.expects("removePatch").withExactArgs("foo/ba");
		this.oRequestorMock.expects("removePatch").withExactArgs("foo/bars");

		// code under test
		oCache.resetChangesForPath("");

		assert.deepEqual(oCache.mPatchRequests, {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: POSTs", function (assert) {
		var oBody0 = {"@$ui5._" : {"transient" : "update"}},
			oBody1 = {"@$ui5._" : {"transient" : "update2"}},
			oBody2 = {"@$ui5._" : {"transient" : "update"}},
			oBody3 = {"@$ui5._" : {"transient" : "update"}},
			oBody4 = {"@$ui5._" : {"transient" : "update"}},
			oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCall1,
			oCall2;

		oCache.mPostRequests = {
			"foo/ba" : [oBody0],
			"foo/bar" : [oBody1, oBody2],
			"foo/bars" : [oBody3],
			"foo/bar/baz" : [oBody4]
		};

		oCall1 = this.oRequestorMock.expects("removePost")
			.withExactArgs("update", sinon.match.same(oBody2));
		oCall2 = this.oRequestorMock.expects("removePost")
			.withExactArgs("update2", sinon.match.same(oBody1));
		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody4));

		// code under test
		oCache.resetChangesForPath("foo/bar");

		sinon.assert.callOrder(oCall1, oCall2);
		assert.deepEqual(oCache.mPostRequests, {
			"foo/ba" : [oBody0],
			"foo/bars" : [oBody3]
		});

		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody0));
		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody3));

		// code under test
		oCache.resetChangesForPath("");

		assert.deepEqual(oCache.mPostRequests, {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache: setActive & checkActive", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		oCache.mPatchRequests = {"path" : {}};

		// code under test
		oCache.setActive(true);

		assert.strictEqual(oCache.hasPendingChangesForPath("path"), true);

		// code under test
		oCache.checkActive();

		// code under test
		oCache.setActive(false);

		assert.strictEqual(oCache.hasPendingChangesForPath(), false);

		try {
			// code under test
			oCache.checkActive();

			assert.ok(false);
		} catch (e) {
			assert.strictEqual(e.message, "Response discarded: cache is inactive");
			assert.ok(e.canceled);
		}
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products('42')"),
			oData = [{
				foo : {
					"@$ui5._" : {"predicate" : "(42)"},
					bar : 42,
					list : [{}, {}],
					"null" : null
				}
			}];

		oCache.sResourcePath = "Employees?$select=foo";
		oData.$byPredicate = {"('a')" : oData[0]};
		oData[0].foo.list.$byPredicate = {
			"('0')" : oData[0].foo.list[0],
			"('1')" : oData[0].foo.list[1]
		};
		oData[0].foo.list.$count = 10;

		assert.strictEqual(oCache.drillDown(oData, ""), oData, "empty path");
		assert.strictEqual(oCache.drillDown(oData, "0"), oData[0], "0");
		assert.strictEqual(oCache.drillDown(oData, "('a')"), oData[0], "('a')");
		assert.strictEqual(oCache.drillDown(oData, "0/foo"), oData[0].foo, "0/foo");
		assert.strictEqual(oCache.drillDown(oData, "0/foo/bar"), oData[0].foo.bar, "0/foo/bar");
		assert.strictEqual(oCache.drillDown(oData, "0/foo/null/invalid"), undefined,
			"0/foo/null/invalid");
		assert.strictEqual(oCache.drillDown(oData, "0/foo/list/$count"), oData[0].foo.list.$count,
			"0/foo/list/$count");
		assert.strictEqual(oCache.drillDown(oData, "('a')/foo/list('1')"), oData[0].foo.list[1],
			"('a')/foo/list('1')");
		assert.strictEqual(oCache.drillDown(oData, "$count"), undefined, "$count");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/@$ui5._, invalid segment: @$ui5._",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/@$ui5._"), undefined, "@$ui5._");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/bar/invalid, invalid segment: invalid",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/bar/invalid"), undefined,
			"0/foo/bar/invalid");

		this.oLogMock.expects("error").withExactArgs(
				"Failed to drill-down into 0/foo/baz, invalid segment: baz",
				oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/baz"), undefined, "0/foo/baz");
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/$count, invalid segment: $count",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/$count"), undefined, "0/foo/$count");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/$count/bar, invalid segment: $count",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/$count/bar"), undefined,
			"0/foo/$count/bar");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/bar('2'), invalid segment: bar('2')",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/bar('2')"), undefined,
			"0/bar('2')");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/null/$count, invalid segment: $count",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/null/$count"), undefined,
			"0/bar('2')");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/bar/toString, invalid segment: toString",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		assert.strictEqual(oCache.drillDown(oData, "0/foo/bar/toString"), undefined,
			"0/foo/bar/toString");

		assert.strictEqual(oCache.drillDown({/*no advertised action found*/}, "#com.sap.foo.AcFoo"),
			undefined, "no error if advertised action is not found");
	});

	//*********************************************************************************************
	QUnit.test("_SingleCache#drillDown: stream property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products('42')"),
			oData = {productPicture : {}};

		this.oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/Products/productPicture/picture", true)
			.returns(SyncPromise.resolve("Edm.Stream"));

		// code under test
		assert.strictEqual(oCache.drillDown(oData, "productPicture/picture"),
			"/~/Products('42')/productPicture/picture");
	});

	//*********************************************************************************************
	QUnit.test("_CollectionCache#drillDown: stream property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{productPicture : {}}];

		oData.$byPredicate = {"('42')": oData[0]};

		this.oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/Products/productPicture/picture", true)
			.returns(SyncPromise.resolve("Edm.Stream"));

		// code under test
		assert.strictEqual(oCache.drillDown(oData, "('42')/productPicture/picture"),
			"/~/Products('42')/productPicture/picture");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: stream property, missing parent", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products('42')");

		this.oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/Products/productPicture", true)
			.returns(SyncPromise.resolve("some.ComplexType"));
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into productPicture/picture, invalid segment: productPicture",
			oCache.toString(), "sap.ui.model.odata.v4.lib._Cache");

		// code under test
		assert.strictEqual(oCache.drillDown({}, "productPicture/picture"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: stream property w/ read link", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products('42')"),
			oData = {
				productPicture : {
					"picture@odata.mediaReadLink" : "my/Picture"
				}
			};

		this.oRequestorMock.expects("fetchTypeForPath")
			.withExactArgs("/Products/productPicture/picture", true)
			.returns(SyncPromise.resolve("Edm.Stream"));
		this.mock(_Helper).expects("makeAbsolute")
			.withExactArgs("my/Picture", this.oRequestor.getServiceUrl())
			.returns("/~~~/");

		// code under test
		assert.strictEqual(oCache.drillDown(oData, "productPicture/picture"), "/~~~/");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCanceled) {
		QUnit.test("_Cache#update: " + (bCanceled ? "canceled" : "success"), function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "BusinessPartnerList",
					mQueryOptions, true),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = this.spy(),
				oError = new Error(),
				sFullPath = "path/to/entity/Address/City",
				oGroupLock = new _GroupLock("group"),
				oGroupLockClone = new _GroupLock("group"),
				oHelperMock = this.mock(_Helper),
				oOldData = {},
				oPatchResult = {},
				oPatchPromise = bCanceled ? Promise.reject(oError) : Promise.resolve(oPatchResult),
				oRequestCall,
				oStaticCacheMock = this.mock(_Cache),
				oUpdateData = {};

			oError.canceled = bCanceled;
			oCache.fetchValue = function () {};
			this.mock(oGroupLock).expects("getUnlockedCopy").returns(oGroupLockClone);
			oCacheMock.expects("fetchValue")
				.withExactArgs(sinon.match.same(oGroupLockClone), "path/to/entity")
				.returns(SyncPromise.resolve(oEntity));
			oHelperMock.expects("buildPath").withExactArgs("path/to/entity", "Address/City")
				.returns(sFullPath);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true)
				.returns("?foo=bar");
			oStaticCacheMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf")
				.returns(oUpdateData);
			oHelperMock.expects("updateCache")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
			oRequestCall = this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
					sinon.match.same(oGroupLock), {
						"If-Match" : sETag
					}, sinon.match.same(oUpdateData), undefined, sinon.match.func)
				.returns(oPatchPromise);
			oCacheMock.expects("addByPath")
				.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
					sinon.match.same(oPatchPromise));
			oPatchPromise.then(function () {
				oCacheMock.expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
						sinon.match.same(oPatchPromise));
				oHelperMock.expects("updateCache")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
						sinon.match.same(oEntity), sinon.match.same(oPatchResult));
			}, function () {
				oCacheMock.expects("removeByPath").twice()
					.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
						sinon.match.same(oPatchPromise));
				oStaticCacheMock.expects("makeUpdateData")
					.withExactArgs(["Address", "City"], "Heidelberg")
					.returns(oOldData);
				oHelperMock.expects("updateCache")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
						sinon.match.same(oEntity), sinon.match.same(oOldData));
				oRequestCall.args[0][6](); // call onCancel
			});

			// code under test
			return oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
					"/~/BusinessPartnerList('0')", "path/to/entity")
				.then(function (oResult) {
					sinon.assert.notCalled(fnError);
					assert.strictEqual(bCanceled, false);
					assert.strictEqual(oResult, oPatchResult);
				}, function (oResult) {
					sinon.assert.notCalled(fnError);
					assert.strictEqual(bCanceled, true);
					assert.strictEqual(oResult, oError);
				});
		});
	});

	//*********************************************************************************************
	["EUR", "", undefined].forEach(function (sUnitOrCurrencyValue, i) {
		QUnit.test("_Cache#update: updates unit, " + i, function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "ProductList", mQueryOptions, true),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Pricing" : {
						"Currency" : sUnitOrCurrencyValue
					},
					"ProductInfo" : {
						"Amount" : "123"
					}
				},
				fnError = this.spy(),
				oGroupLock = new _GroupLock("group"),
				oHelperMock = this.mock(_Helper),
				oPatchResult = {},
				oPatchPromise = Promise.resolve(oPatchResult),
				oStaticCacheMock = this.mock(_Cache),
				oUnitUpdateData = {},
				oUpdateData = {};

			oCache.fetchValue = function () {};
			oCacheMock.expects("fetchValue")
				.withExactArgs(new _GroupLock("group"), "path/to/entity")
				.returns(SyncPromise.resolve(oEntity));
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs("/ProductList", sinon.match.same(mQueryOptions), true)
				.returns("");
			oStaticCacheMock.expects("makeUpdateData")
				.withExactArgs(["ProductInfo", "Amount"], "123")
				.returns(oUpdateData);
			oHelperMock.expects("updateCache")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
			if (sUnitOrCurrencyValue === undefined) {
				this.oLogMock.expects("debug").withExactArgs(
					"Missing value for unit of measure path/to/entity/Pricing/Currency "
						+ "when updating path/to/entity/ProductInfo/Amount",
					oCache.toString(),
					"sap.ui.model.odata.v4.lib._Cache");
			} else {
				oStaticCacheMock.expects("makeUpdateData")
					.withExactArgs(["Pricing", "Currency"], sUnitOrCurrencyValue)
					.returns(oUnitUpdateData);
				this.mock(jQuery).expects("extend")
					.withExactArgs(true, sinon.match.same(oUpdateData),
						sinon.match.same(oUnitUpdateData));
			}
			this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "ProductList('0')", sinon.match.same(oGroupLock), {
						"If-Match" : sETag
					}, sinon.match.same(oUpdateData), undefined, sinon.match.func)
				.returns(oPatchPromise);
			oPatchPromise.then(function () {
				oHelperMock.expects("updateCache")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
						sinon.match.same(oEntity), sinon.match.same(oPatchResult));
			});

			// code under test
			return oCache.update(oGroupLock, "ProductInfo/Amount", "123", fnError,
					"ProductList('0')", "path/to/entity", "Pricing/Currency")
				.then(function (oResult) {
					sinon.assert.notCalled(fnError);
					assert.strictEqual(oResult, oPatchResult);
				});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCanceled) {
		var sTitle = "_Cache#update: failure, then " + (bCanceled ? "cancel" : "success");
		QUnit.test(sTitle, function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "BusinessPartnerList", mQueryOptions),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = this.spy(),
				oError1 = new Error(),
				oError2 = new Error(),
				sFullPath = "path/to/entity/Address/City",
				oGroupLock = new _GroupLock("group"),
				oGroupLock2 = new _GroupLock("group"),
				oHelperMock = this.mock(_Helper),
				oOldData = {},
				oPatchResult = {},
				oPatchPromise = Promise.reject(oError1),
				oPatchPromise2 = bCanceled
					? Promise.reject(oError2)
					: Promise.resolve(oPatchResult),
				oRequestCall,
				oStaticCacheMock = this.mock(_Cache),
				oUpdateData = {},
				that = this;

			oError2.canceled = true;
			oCache.fetchValue = function () {};
			oCacheMock.expects("fetchValue")
				.withExactArgs(new _GroupLock("group"), "path/to/entity")
				.returns(SyncPromise.resolve(oEntity));
			oHelperMock.expects("buildPath").withExactArgs("path/to/entity", "Address/City")
				.returns(sFullPath);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true)
				.returns("?foo=bar");
			oStaticCacheMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf")
				.returns(oUpdateData);
			oHelperMock.expects("updateCache")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
			this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
					sinon.match.same(oGroupLock), {
						"If-Match" : sETag
					}, sinon.match.same(oUpdateData), undefined, sinon.match.func)
				.returns(oPatchPromise);
			oCacheMock.expects("addByPath")
				.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
					sinon.match.same(oPatchPromise));
			oPatchPromise.catch(function () {
				oCacheMock.expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
						sinon.match.same(oPatchPromise));
				that.mock(oGroupLock).expects("getUnlockedCopy").returns(oGroupLock2);
				oRequestCall = that.oRequestorMock.expects("request")
					.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
						sinon.match.same(oGroupLock2), {
							"If-Match" : sETag
						}, sinon.match.same(oUpdateData), undefined, sinon.match.func)
					.returns(oPatchPromise2);
				oCacheMock.expects("addByPath")
					.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
						sinon.match.same(oPatchPromise2));
				oPatchPromise2.then(function () {
					oCacheMock.expects("removeByPath")
						.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
							sinon.match.same(oPatchPromise2));
					oHelperMock.expects("updateCache")
						.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
							sinon.match.same(oEntity), sinon.match.same(oPatchResult));
				}, function () {
					oCacheMock.expects("removeByPath").twice()
						.withExactArgs(sinon.match.same(oCache.mPatchRequests), sFullPath,
							sinon.match.same(oPatchPromise2));
					oStaticCacheMock.expects("makeUpdateData")
						.withExactArgs(["Address", "City"], "Heidelberg")
						.returns(oOldData);
					oHelperMock.expects("updateCache")
						.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
							sinon.match.same(oEntity), sinon.match.same(oOldData));
					oRequestCall.args[0][6](); // call onCancel
				});
			});

			// code under test
			return oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
					"/~/BusinessPartnerList('0')", "path/to/entity")
				.then(function (oResult) {
					assert.notOk(bCanceled);
					sinon.assert.calledOnce(fnError);
					sinon.assert.calledWithExactly(fnError, oError1);
					assert.strictEqual(oResult, oPatchResult);
				}, function (oResult) {
					assert.ok(bCanceled);
					sinon.assert.calledOnce(fnError);
					sinon.assert.calledWithExactly(fnError, oError1);
					assert.strictEqual(oResult, oError2);
				});
		});
	});

	//*********************************************************************************************
	["$direct", "$auto", "myDirect", "myAuto"].forEach(function (sGroupId) {
		QUnit.test("_Cache#update: failure, group " + sGroupId, function (assert) {
			var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = this.spy(),
				oError = new Error(),
				oGroupLock = new _GroupLock(sGroupId),
				mGroups = {
					"$direct" : "Direct",
					"$auto" : "Auto",
					"myAuto" : "Auto",
					"myDirect" : "Direct"
				},
				oPatchPromise = Promise.reject(oError),
				oUpdateData = {
					"Address" : {
						"City" : "Walldorf"
					}
				};

			oCache.fetchValue = function () {};
			oCacheMock.expects("fetchValue")
				.withExactArgs(new _GroupLock(sGroupId), "path/to/entity")
				.returns(SyncPromise.resolve(oEntity));
			this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/~/BusinessPartnerList('0')",
					sinon.match.same(oGroupLock), {
						"If-Match" : sETag
					}, oUpdateData, undefined, sinon.match.func)
				.returns(oPatchPromise);
			this.oRequestorMock.expects("getGroupSubmitMode")
				.withExactArgs(sGroupId).returns(mGroups[sGroupId]);

			// code under test
			return oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
					"/~/BusinessPartnerList('0')", "path/to/entity")
				.then(function (oResult) {
					assert.ok(false);
				}, function (oResult) {
					sinon.assert.calledOnce(fnError);
					sinon.assert.calledWithExactly(fnError, oError);
					assert.strictEqual(oResult, oError);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#update: invalid entity path", function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {});

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(new _GroupLock("groupId"), "path/to/entity")
			.returns(SyncPromise.resolve(undefined));

		return oCache.update(
			new _GroupLock("groupId"), "foo", "bar", this.mock().never(),
			"/~/BusinessPartnerList('0')", "path/to/entity"
		).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message,
				"Cannot update 'foo': 'path/to/entity' does not exist");
		});
	});

	//*********************************************************************************************
	[{
		options : undefined,
		types : {
			"/TEAMS" : {$Key : ["TeamId"]}
		}
	}, {
		options : {$select : ["foo"]},
		types : {
			"/TEAMS" : {$Key : ["TeamId"]}
		}
	}, {
		options : {
			$expand : {
				"MANAGER" : null,
				"TEAM_2_EMPLOYEES" : {
					$expand : {
						"EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT" : null,
						"Address/Country" : null
					}
				},
				"EntityWithComplexKey" : null
			}
		},
		types : {
			"/TEAMS" : {$Key : ["TeamId"]},
			"/TEAMS/MANAGER" : {$Key : ["ManagerId"]},
			"/TEAMS/TEAM_2_EMPLOYEES" : {$Key : ["EmployeeId"]},
			"/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT" : {$Key : ["EquipmentId"]},
			"/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT" :
				{$Key : ["ProductId"]},
			"/TEAMS/TEAM_2_EMPLOYEES/Address" : {$kind : "ComplexType"},
			"/TEAMS/TEAM_2_EMPLOYEES/Address/Country" : {$Key : ["CountryId"]},
			"/TEAMS/EntityWithComplexKey" :
				{$Key : [{"key1" : "a/b/id"}, {"key2" : "c/id"}, {"key3" : "key"}]},
			"/TEAMS/EntityWithComplexKey/a/b" : {$kind : "ComplexType"},
			"/TEAMS/EntityWithComplexKey/c" : {$kind : "ComplexType"}
		}
	}].forEach(function (oFixture, i) {
		QUnit.test("Cache#fetchTypes #" + i, function (assert) {
			var oCache,
				oPromise,
				that = this;

			Object.keys(oFixture.types).forEach(function (sPath) {
				that.oRequestorMock.expects("fetchTypeForPath").withExactArgs(sPath)
					.returns(Promise.resolve(oFixture.types[sPath]));
			});
			// create after the mocks have been set up, otherwise they won't be called
			oCache = new _Cache(this.oRequestor, "TEAMS('42')", oFixture.options);

			// code under test
			oPromise = oCache.fetchTypes();

			assert.strictEqual(oCache.fetchTypes(), oPromise, "second call returns same promise");
			return oPromise.then(function (mTypeForMetaPath) {
				assert.deepEqual(mTypeForMetaPath, oFixture.types);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: ignore simple values", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Name");

		this.mock(_Helper).expects("getKeyPredicate").never();

		// code under test
		oCache.calculateKeyPredicates("Business Suite", {});

		// code under test
		oCache.calculateKeyPredicates({results : ["Business Suite"]}, {});
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: simple entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {},
			sPredicate = "('4711')",
			mTypeForMetaPath = {"/TEAMS" : {$Key : []}};

		this.mock(_Helper).expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity),
				"/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: nested", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {
				bar : {
					baz : {}
				},
				property : {
					navigation : {} // an navigation property within a complex type
				},
				no : 4,
				noType : {},
				qux : null
			},
			oHelperMock = this.mock(_Helper),
			sPredicate1 = "(foo='4711')",
			sPredicate2 = "(bar='42')",
			sPredicate3 = "(baz='67')",
			sPredicate4 = "(entity='23')",
			mTypeForMetaPath = {
				"/TEAMS" : {$Key : []},
				"/TEAMS/bar" : {$Key : []},
				"/TEAMS/bar/baz" : {$Key : []},
				"/TEAMS/property" : {},
				"/TEAMS/property/navigation" : {$Key : []},
				"/TEAMS/qux" : {$Key : []}
			};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity), "/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate1);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity.bar), "/TEAMS/bar",
				sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate2);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity.bar.baz), "/TEAMS/bar/baz",
				sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate3);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity.property.navigation),
				"/TEAMS/property/navigation", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate4);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar, "predicate"), sPredicate2);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar.baz, "predicate"), sPredicate3);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property, "predicate"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property.navigation, "predicate"),
			sPredicate4);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.noType, "predicate"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: entity collection", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {
				bar : [{}, {}]
			},
			oHelperMock = this.mock(_Helper),
			sPredicate1 = "(foo='4711')",
			sPredicate2 = "(bar='42')",
			mTypeForMetaPath = {
				"/TEAMS" : {$Key : []},
				"/TEAMS/bar" : {$Key : []}
			};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity), "/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate1);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity.bar[0]), "/TEAMS/bar",
				sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate2);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(oEntity.bar[1]), "/TEAMS/bar",
				sinon.match.same(mTypeForMetaPath))
			.returns(undefined);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[0], "predicate"), sPredicate2);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[1], "predicate"), undefined);
		assert.strictEqual(oEntity.bar.$byPredicate[sPredicate2], oEntity.bar[0]);
		assert.notOk(undefined in oEntity.bar.$byPredicate);
	});

	//*********************************************************************************************
	[
		{index : 1, length : 1, result : [{key : "b"}], types : true},
		{index : 0, length : 2, result : [{key : "a"}, {key : "b"}], types : true},
		{index : 4, length : 5, result : []}, // don't set count, it can be anything between 0 and 4
		{index : 5, length : 6, serverCount : "2", result : [], count : 2},
		{index : 1, length : 5, result : [{key : "b"}, {key : "c"}], count : 3, types : false}
	].forEach(function (oFixture) {
		QUnit.test("CollectionCache#read(" + oFixture.index + ", " + oFixture.length + ")",
				function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath),
				oCacheMock = this.mock(oCache),
				aData = [{key : "a"}, {key : "b"}, {key : "c"}],
				oMockResult = {
					"@odata.context" : "$metadata#TEAMS",
					value : aData.slice(oFixture.index, oFixture.index + oFixture.length)
				},
				oPromise,
				mQueryParams = {},
				mTypeForMetaPath = oFixture.types ? {
					"/Employees" : {
						$Key : ["key"],
						key : {$Type : "Edm.String"}
					}
				} : {};

			if (oFixture.serverCount) {
				oMockResult["@odata.count"] = oFixture.serverCount;
			}
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=" + oFixture.index + "&$top="
					+ oFixture.length, "group", undefined, undefined, undefined)
				.returns(Promise.resolve().then(function () {
						oCacheMock.expects("checkActive").twice();
						return oMockResult;
					}));
			this.spy(_Helper, "updateCache");

			oCache = this.createCache(sResourcePath, mQueryParams);
			oCacheMock = this.mock(oCache);
			oCacheMock.expects("fetchTypes").withExactArgs()
				.returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));
			this.spy(oCache, "fill");

			// code under test
			oPromise = oCache.read(oFixture.index, oFixture.length, 0, "group");

			assert.ok(!oPromise.isFulfilled());
			assert.ok(!oPromise.isRejected());
			assert.ok(oCache.bSentReadRequest);
			sinon.assert.calledWithExactly(oCache.fill, sinon.match.instanceOf(SyncPromise),
				oFixture.index, oFixture.index + oFixture.length);
			return oPromise.then(function (oResult) {
				var oExpectedResult = {
						"@odata.context" : "$metadata#TEAMS",
						value : oFixture.result
					};

				if (oFixture.types) {
					oFixture.result.forEach(function (oItem) {
						_Helper.setPrivateAnnotation(oItem, "predicate", "('" + oItem.key + "')");
					});
				}
				if (oFixture.count) {
					sinon.assert.calledWithExactly(_Helper.updateCache,
						sinon.match.same(oCache.mChangeListeners), "",
						sinon.match.same(oCache.aElements), {$count : oFixture.count});
				}
				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oResult.value.$count, oFixture.count);
				if (oFixture.types) {
					oFixture.result.forEach(function (oItem, i) {
						assert.strictEqual(
							oCache.aElements.$byPredicate[
								_Helper.getPrivateAnnotation(oItem, "predicate")],
							oCache.aElements[oFixture.index + i]);
					});
				} else {
					assert.notOk(undefined in oCache.aElements.$byPredicate);
				}

				// ensure that the same read does not trigger another request
				return oCache.read(oFixture.index, oFixture.length, 0).then(function (oResult) {
					assert.deepEqual(oResult, oExpectedResult);
					assert.strictEqual(oResult.value.$count, oFixture.count);
				});
			});
		});
	});

	//*********************************************************************************************
	[{ // no prefetch
		range : [0, 10, 0],
		expected : {start : 0, length : 10}
	}, {
		range : [40, 10, 0],
		expected : {start : 40, length : 10}
	}, {
		current : [[40, 50]],
		range : [40, 10, 0],
		expected : {start : 40, length : 10}
	}, {
		current : [[50, 110]],
		range : [100, 20, 0],
		expected : {start : 100, length : 20}
	}, { // initial read with prefetch
		range : [0, 10, 100],
		expected : {start : 0, length : 110}
	}, { // iPrefetchLength / 2 available on both sides
		current : [[0, 110]],
		range : [50, 10, 100],
		expected : {start : 50, length : 10}
	}, { // missing a row at the end
		current : [[0, 110]],
		range : [51, 10, 100],
		expected : {start : 51, length : 110}
	}, { // missing a row before the start
		current : [[100, 260]],
		range : [149, 10, 100],
		expected : {start : 49, length : 110}
	}, { // missing a row before the start, do not read beyond 0
		current : [[40, 200]],
		range : [89, 10, 100],
		expected : {start : 0, length : 99}
	}, { // missing data on both sides, do not read beyond 0
		range : [430, 10, 100],
		expected : {start : 330, length : 210}
	}, { // missing data on both sides, do not read beyond 0
		current : [[40, 100]],
		range : [89, 10, 100],
		expected : {start : 0, length : 199}
	}, { // transient context
		range : [-1, 10, 100],
		bTransient : true,
		expected : {start : -1, length : 110}
	}, { // fetch all data
		range : [0, 0, Infinity],
		expected : {start : 0, length : Infinity}
	}, { // fetch all data with offset
		range : [1, 0, Infinity],
		expected : {start : 0, length : Infinity}
	}].forEach(function (oFixture) {
		QUnit.test("CollectionCache#getReadRange: " + oFixture.range, function (assert) {
			var oCache = _Cache.create(this.oRequestor, "TEAMS"),
				aElements = [],
				oResult;

			// prepare elements array
			if (oFixture.current) {
				oFixture.current.forEach(function (aRange) {
					var i, n;

					for (i = aRange[0], n = aRange[1]; i < n; i++) {
						aElements[i] = i;
					}
				});
			}
			if (oFixture.bTransient) {
				aElements[-1] = -1;
			}
			oCache.aElements = aElements;

			oResult = oCache.getReadRange(oFixture.range[0], oFixture.range[1], oFixture.range[2]);

			assert.deepEqual(oResult, oFixture.expected);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: prefetch", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.mock(oCache).expects("getReadRange").withExactArgs(20, 6, 10)
			.returns({start : 15, length : 16}); // Note: not necessarily a realistic example
		this.mockRequest(sResourcePath, 15, 16);

		// code under test
		return oCache.read(20, 6, 10).then(function (oResult) {
			assert.deepEqual(oResult, createResult(20, 6));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected,
			oPromise = {};

		assert.deepEqual(oCache.aElements, []);

		// code under test
		oCache.fill(oPromise, 0, 3);

		assert.deepEqual(oCache.aElements, [oPromise, oPromise, oPromise]);

		// code under test
		oCache.fill(oPromise, 5, 7);

		aExpected = [oPromise, oPromise, oPromise, undefined, undefined, oPromise, oPromise];
		assert.deepEqual(oCache.aElements, aExpected);

		// code under test
		oCache.fill(oPromise, 10, Infinity);

		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromise);

		assert.throws(function () {
			// code under test
			oCache.fill({/*yet another promise*/}, 0, Infinity);
		}, new Error(
			"Cannot fill from 0 to Infinity, $tail already in use, # of elements is 7"));
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromise);

		// code under test
		oCache.fill(undefined, 0, Infinity);

		fill(aExpected, undefined, 0);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, undefined);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = 1024", function (assert) {
		var oCache = this.createCache("Employees"),
			oPromise = {};

		assert.deepEqual(oCache.aElements, []);

		// code under test
		//TODO 20000 is too much for Chrome?!
		oCache.fill(oPromise, 0, 1024);

		assert.deepEqual(oCache.aElements, fill(new Array(1024), oPromise, 0));
		assert.strictEqual(oCache.aElements.$tail, undefined);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = 1025, []", function (assert) {
		var oCache = this.createCache("Employees"),
			oPromise = {};

		assert.deepEqual(oCache.aElements, []);

		// code under test
		oCache.fill(oPromise, 0, 1025);

		assert.deepEqual(oCache.aElements, []);
		assert.strictEqual(oCache.aElements.$tail, oPromise);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = 1025, [many rows] & $tail", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected,
			oPromiseNew = {},
			oPromiseOld = {};

		oCache.aElements.length = 4096;
		fill(oCache.aElements, oPromiseOld, 2048); // many existing rows
		oCache.aElements.$tail = oPromiseOld;

		// code under test
		oCache.fill(oPromiseNew, 0, 1025);

		aExpected = new Array(4096);
		fill(aExpected, oPromiseNew, 0, 1025);
		// gap from 1025..2048
		fill(aExpected, oPromiseOld, 2048, 4096);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromiseOld);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = Infinity, [many rows]", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected,
			oPromiseNew = {},
			oPromiseOld = {};

		oCache.aElements.length = 4096;
		fill(oCache.aElements, oPromiseOld, 2048); // many existing rows

		// code under test
		oCache.fill(oPromiseNew, 0, Infinity);

		aExpected = new Array(4096);
		fill(aExpected, oPromiseNew, 0, 4096);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromiseNew);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#requestElements: clean up $tail again", function (assert) {
		var oCache = this.createCache("Employees"),
			fnResolve;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees", /*sGroupId*/undefined, /*mHeaders*/undefined,
				/*oPayload*/undefined, /*fnSubmit*/undefined)
			.returns(new Promise(function (resolve, reject) {
				fnResolve = resolve;
			}));

		// code under test
		oCache.requestElements(0, Infinity);

		this.mockRequest("Employees", 0, 1);

		// code under test
		// MUST NOT clean up $tail
		oCache.requestElements(0, 1);

		return oCache.aElements[0].then(function () {
			fnResolve(createResult(0, 1));

			return oCache.aElements.$tail.then(function () {
				assert.strictEqual(oCache.aElements.$tail, undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, $skip=0", function (assert) {
		var oCache = this.createCache("Employees");

		// be friendly to V8
		assert.ok(oCache instanceof _Cache);
		assert.ok("sContext" in oCache);
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.ok("$tail" in oCache.aElements);
		assert.strictEqual(oCache.iLimit, Infinity);
		assert.ok("oSyncPromiseAll" in oCache);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees", /*sGroupId*/undefined, /*mHeaders*/undefined,
				/*oPayload*/undefined, /*fnSubmit*/undefined)
			.returns(Promise.resolve(createResult(0, 7)));

		// code under test
		return oCache.read(1, 0, Infinity).then(function (oResult) {
			assert.deepEqual(oResult, createResult(1, 6));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, no existing data", function (assert) {
		var oCache = this.createCache("Employees");

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=10", /*sGroupId*/undefined,
				/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
			.returns(Promise.resolve(createResult(10, 7)));
		this.mock(oCache).expects("fill")
			.withExactArgs(sinon.match.instanceOf(SyncPromise), 10, Infinity)
			.callsFake(function (oPromise) {
				oCache.aElements.$tail = oPromise;
				// Note: do not enlarge oCache.aElements! do not fill oPromise into it!
			});

		// code under test
		return oCache.read(10, Infinity, 0).then(function (oResult) {
			assert.deepEqual(oResult, createResult(10, 7));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, existing data", function (assert) {
		var oCache = this.createCache("Employees"),
			that = this;

		this.mockRequest("Employees", 0, 10);

		return oCache.read(0, 10).then(function (oResult) {
			assert.deepEqual(oResult, createResult(0, 10));

			that.oRequestorMock.expects("request")
				.withExactArgs("GET", "Employees?$skip=10", /*sGroupId*/undefined,
					/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
				.returns(Promise.resolve(createResult(10, 7)));

			// code under test
			return oCache.read(1, 0, Infinity).then(function (oResult) {
				assert.deepEqual(oResult, createResult(1, 16));
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: wait for $tail", function (assert) {
		var oCache = this.createCache("Employees"),
			fnDataRequested = {},
			oNewPromise = {},
			oPromise,
			fnResolve;

		oCache.aElements.$tail = new Promise(function (resolve, reject) {
			fnResolve = resolve;
		});
		this.mock(oCache).expects("getReadRange").never(); // not yet
		this.mock(oCache).expects("requestElements").never(); // not yet

		// code under test
		oPromise = oCache.read(0, 10, 42, "group", fnDataRequested);

		// expect "back to start" in order to repeat check for $tail
		this.mock(oCache).expects("read")
			.withExactArgs(0, 10, 42, "group", sinon.match.same(fnDataRequested))
			.returns(oNewPromise);
		fnResolve();

		return oPromise.then(function (oPromise0) {
			assert.strictEqual(oPromise0, oNewPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oCacheMock = this.mock(oCache),
			oListener = {},
			oReadPromise = this.mockRequest(sResourcePath, 0, 10, undefined, "26");

		oReadPromise.then(function () {
			// This may only happen when the read is finished
			oCacheMock.expects("registerChange")
				.withExactArgs("('c')/key", sinon.match.same(oListener));
			oCacheMock.expects("checkActive").twice(); // from read and fetchValue
			oCacheMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key").returns("c");
		});

		oCache.read(0, 10, 0); //TODO what about returning this promise to QUnit?

		// code under test
		return oCache.fetchValue("group", "('c')/key", {}, oListener).then(function (sResult) {
			assert.strictEqual(sResult, "c");

			oCacheMock.expects("registerChange").withExactArgs("('c')/key", undefined);
			oCacheMock.expects("checkActive");
			oCacheMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key").returns("c");

			// code under test: now it must be delivered synchronously
			assert.strictEqual(oCache.fetchValue(undefined, "('c')/key").getResult(), "c");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue includes $tail", function (assert) {
		var oCache = this.createCache("Employees"),
			oResult,
			oSyncPromiseAll = Promise.resolve(),
			that = this;

		assert.strictEqual(oCache.oSyncPromiseAll, undefined);
		oCache.aElements.push("0");
		oCache.aElements.push("1");
		oCache.aElements.push("2");
		oCache.aElements.$tail = "$";
		this.mock(SyncPromise).expects("all")
			.withExactArgs(["0", "1", "2", "$"])
			.returns(oSyncPromiseAll);
		oSyncPromiseAll.then(function () {
			that.mock(oCache).expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key").returns("c");
		});

		// code under test
		oResult = oCache.fetchValue("group", "('c')/key").then(function (sResult) {
			assert.strictEqual(sResult, "c");
		});

		assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);

		// code under test (simulate an error)
		oCache.fill(undefined, 0, 3);

		assert.strictEqual(oCache.oSyncPromiseAll, undefined);
		return oResult;
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue without $tail", function (assert) {
		var oCache = this.createCache("Employees");

		this.mock(SyncPromise).expects("all")
			.withExactArgs(sinon.match.same(oCache.aElements))
			.returns(SyncPromise.resolve());
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key").returns("c");

		// code under test
		return oCache.fetchValue("group", "('c')/key").then(function (sResult) {
			assert.strictEqual(sResult, "c");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue without $tail, oSyncPromiseAll", function (assert) {
		var oCache = this.createCache("Employees");

		oCache.oSyncPromiseAll = SyncPromise.resolve();
		this.mock(SyncPromise).expects("all").never();
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key").returns("c");

		// code under test
		return oCache.fetchValue("group", "('c')/key").then(function (sResult) {
			assert.strictEqual(sResult, "c");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read(-1, 1) w/o create", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.oRequestorMock.expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(-1, 1, 0);
		}, new Error("Illegal index -1, must be >= 0"));

		oCache.aElements[-1] = {}; // mock a transient entity

		// code under test
		assert.throws(function () {
			oCache.read(-2, 1, 0);
		}, new Error("Illegal index -2, must be >= -1"));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read(1, -1)", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.oRequestorMock.expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(1, -1, 0);
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
		expectedRequests : [{skip : 1, top : 2}]
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
		expectedRequests : [{skip : 5, top : 8}]
	}, {
		title : "first range part of second range",
		reads : [{index : 7, length : 2}, {index : 5, length : 6}],
		expectedRequests : [{skip : 7, top : 2}, {skip : 5, top : 2}, {skip : 9, top : 2}]
	}, {
		title : "read more than available",
		reads : [{index : 10, length : 90}, {index : 0, length : 100}],
		expectedRequests : [{skip : 10, top : 90}, {skip : 0, top : 10}],
		expectedMaxElements : 26
	}, {
		title : "read exactly max available",
		reads : [{index : 0, length : 26}, {index : 26, length : 26}, {index : 26, length : 26}],
		expectedRequests : [{skip : 0, top : 26}, {skip : 26, top : 26}],
		expectedMaxElements : 26
	}, {
		title : "different ranges",
		reads : [{index : 2, length : 5}, {index : 0, length : 2}, {index : 1, length : 2}],
		expectedRequests : [{skip : 2, top : 5}, {skip : 0, top : 2}]
	}].forEach(function (oFixture) {
		QUnit.test("CollectionCache: multiple read, " + oFixture.title + " (sequentially)",
				function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath),
				fnDataRequested = this.spy(),
				oPromise = Promise.resolve(),
				that = this;

			oFixture.expectedRequests.forEach(function (oRequest, i) {
				that.mockRequest(sResourcePath, oRequest.skip, oRequest.top,
					i < 2 ? fnDataRequested : undefined);
			});

			oFixture.reads.forEach(function (oRead) {
				oPromise = oPromise.then(function () {
					return oCache.read(oRead.index, oRead.length, 0, undefined, fnDataRequested)
						.then(function (oResult) {
							assert.deepEqual(oResult.value,
								createResult(oRead.index, oRead.length).value);
					});
				});
			});
			return oPromise.then(function () {
				sinon.assert.notCalled(fnDataRequested); // the requestor should call this
				assert.strictEqual(oCache.aElements.$count, oFixture.expectedMaxElements);
			});
		});

		QUnit.test("CollectionCache: multiple read, " + oFixture.title + " (parallel)",
				function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath),
				fnDataRequested = this.spy(),
				aPromises = [],
				that = this;

			oFixture.expectedRequests.forEach(function (oRequest, i) {
				that.mockRequest(sResourcePath, oRequest.skip, oRequest.top,
					i < 2 ? fnDataRequested : undefined);
			});

			oFixture.reads.forEach(function (oRead) {
				aPromises.push(oCache.read(oRead.index, oRead.length, 0, undefined, fnDataRequested)
					.then(function (oResult) {
						assert.deepEqual(oResult.value,
							createResult(oRead.index, oRead.length).value);
				}));
			});
			return Promise.all(aPromises).then(function () {
				sinon.assert.notCalled(fnDataRequested); // the requestor should call this
				assert.strictEqual(oCache.aElements.$count, oFixture.expectedMaxElements);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: parallel reads beyond length", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.mockRequest(sResourcePath, 0, 30);
		this.mockRequest(sResourcePath, 30, 1);

		return Promise.all([
			oCache.read(0, 30, 0).then(function (oResult) {
				var oExpectedResult = createResult(0, 26);

				oExpectedResult.value.$count = 26;
				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, 26);
			}),
			oCache.read(30, 1, 0).then(function (oResult) {
				var oExpectedResult = createResult(0, 0);

				oExpectedResult.value.$count = 26;
				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, 26);
			})
		]);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCount) {
		var sTitle = "CollectionCache#read: collection cleared after successful read, $count ="
				+ bCount;
		QUnit.test(sTitle, function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache( sResourcePath);

			this.mockRequest( sResourcePath, 10, bCount ? 30 : 10);
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=5&$top=3", undefined, undefined,
					undefined, undefined)
				.returns(Promise.resolve(createResult(5, 0)));

			return oCache.read(10, bCount ? 30 : 10, 0).then(function (oResult) {
				var oExpectedResult = createResult(10, bCount ? 16 : 10);

				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, bCount ? 26 : undefined);

				return oCache.read(5, 3, 0).then(function (oResult) {
					var oExpectedResult = createResult(5, 0);

					assert.deepEqual(oResult, oExpectedResult);
					assert.strictEqual(oCache.aElements.$count, undefined);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & create", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oGroupLock = new _GroupLock("$direct"),
			that = this;

		this.mockRequest(sResourcePath, 0, 10, undefined, "26");

		return oCache.read(0, 10, 0).then(function (oResult) {
			assert.strictEqual(oCache.aElements.$count, 26);
			assert.strictEqual(oResult.value.$count, 26);

			that.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
					sinon.match.object, sinon.match.func, sinon.match.func)
				.returns(Promise.resolve({}));
			that.mock(_Helper).expects("getKeyPredicate").returns("('foo')");
			return oCache.create(oGroupLock, "Employees", "").then(function () {
				assert.strictEqual(oCache.read(0, 10, 0).getResult().value.$count, 27,
					"now including the created element");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & delete, top level", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oGroupLock = {},
			that = this;

		this.oRequestorMock.expects("request").withArgs("GET")
			.returns(Promise.resolve({
				"@odata.count" : "26",
				"value" : [{}, {}, {}, {}, {}]
			}));

		return oCache.read(0, 5, 0).then(function (oResult) {
			that.oRequestorMock.expects("request").withArgs("DELETE").returns(Promise.resolve());
			that.spy(_Helper, "updateCache");
			return oCache._delete(oGroupLock, "Employees('42')", "3", function () {})
				.then(function () {
					assert.strictEqual(oCache.read(0, 4, 0).getResult().value.$count, 25);
					sinon.assert.calledWithExactly(_Helper.updateCache,
						sinon.match.same(oCache.mChangeListeners), "",
						sinon.match.same(oCache.aElements), {$count : 25});
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & delete, nested", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oGroupLock = {},
			aList = [{}, {}, {}],
			that = this;

		this.oRequestorMock.expects("request").withArgs("GET")
			.returns(Promise.resolve({
				"value" : [{
					"list" : aList,
					"list@odata.count" : "26"
				}]
			}));

		return oCache.read(0, 5, 0).then(function (oResult) {
			that.oRequestorMock.expects("request").withArgs("DELETE").returns(Promise.resolve());
			that.spy(_Helper, "updateCache");
			return oCache._delete(oGroupLock, "Employees('42')", "0/list/1", function () {})
				.then(function () {
					assert.strictEqual(
						oCache.fetchValue(undefined, "0/list").getResult().$count, 25);
					sinon.assert.calledWithExactly(_Helper.updateCache,
						sinon.match.same(oCache.mChangeListeners), "0/list",
						sinon.match.same(aList), {$count : 25});
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: fetch $count before read is finished", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oListener = {
				onChange : function () {
					assert.ok(false);
				}
			};

		this.mockRequest(sResourcePath, 0, 10, undefined, "26");

		oCache.read(0, 10, 0); //TODO what about returning this promise to QUnit?

		// code under test: wait until request is finished, do not fire to listener
		return oCache.fetchValue("group", "$count", undefined, oListener).then(function (iCount) {
			assert.strictEqual(iCount, 26);

			// code under test: now it must be delivered synchronously
			assert.strictEqual(oCache.fetchValue(undefined, "$count").getResult(), 26);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: Promise as vPostPath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oGroupLock = new _GroupLock("updateGroup"),
			oPostPathPromise = SyncPromise.resolve("TEAMS"),
			mTypeForMetaPath = {};

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(new _GroupLock("$cached"), "")
			.returns(SyncPromise.resolve([]));
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "TEAMS", sinon.match.same(oGroupLock), null,
				/*oPayload*/sinon.match.object, /*fnSubmit*/sinon.match.func,
				/*fnCancel*/sinon.match.func)
			.returns(SyncPromise.resolve({}));
		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.object, "/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns("(~)");

		// code under test
		return oCache.create(oGroupLock, oPostPathPromise, "", {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: with given sPath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache),
			aCollection = [],
			oCountChangeListener = {onChange : function () {}},
			oCreatePromise,
			oGroupLock = new _GroupLock("updateGroup"),
			oIdChangeListener = {onChange : function () {}},
			oInitialData = {ID : "", Name : "John Doe", "@$ui5.foo" : "bar"},
			oEntityData = jQuery.extend({}, oInitialData),
			oEntityDataCleaned = {ID : "", Name : "John Doe"},
			sPathInCache = "0/TEAM_2_EMPLOYEES",
			sPostPath = "TEAMS('0')/TEAM_2_EMPLOYEES",
			mTypeForMetaPath = {};

		oCache.fetchValue = function () {};
		aCollection.$count = 0;
		oCacheMock.expects("fetchValue")
			.withExactArgs(new _GroupLock("$cached"), "0/TEAM_2_EMPLOYEES")
			.returns(SyncPromise.resolve(aCollection));
		this.mock(jQuery).expects("extend").withExactArgs(true, {}, sinon.match.same(oInitialData))
			.returns(oEntityData);
		this.mock(_Requestor).expects("cleanPayload").withExactArgs(sinon.match.same(oEntityData))
			.returns(oEntityDataCleaned);
		this.spy(oCache, "addByPath");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock),
				null, sinon.match.same(oEntityDataCleaned), /*fnSubmit*/sinon.match.func,
				/*fnCancel*/sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve({
				ID : "7",
				Name : "John Doe"
			})));
		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.object, "/TEAMS/TEAM_2_EMPLOYEES",
				sinon.match.same(mTypeForMetaPath))
			.returns("(~)");
		this.mock(oCountChangeListener).expects("onChange");
		this.mock(oIdChangeListener).expects("onChange");

		// code under test
		oCreatePromise = oCache.create(oGroupLock, sPostPath, sPathInCache, oInitialData);

		// initial data is synchronously available
		assert.strictEqual(aCollection[-1], oEntityDataCleaned);
		assert.strictEqual(aCollection.$count, 0);

		// request is added to mPostRequests
		sinon.assert.calledWithExactly(oCache.addByPath, sinon.match.same(oCache.mPostRequests),
			sPathInCache, sinon.match.same(oEntityDataCleaned));

		oCache.registerChange(sPathInCache + "/-1/Name", function () {
			assert.notOk(true, "No change event for Name");
		});
		oCache.registerChange(sPathInCache + "/-1/ID", oIdChangeListener);
		oCache.registerChange(sPathInCache + "/$count", oCountChangeListener);
		this.spy(oCache, "removeByPath");
		return oCreatePromise.then(function () {
			assert.strictEqual(aCollection[-1].ID, "7", "from Server");
			assert.strictEqual(_Helper.getPrivateAnnotation(aCollection[-1], "predicate"), "(~)");
			assert.strictEqual(aCollection.$count, 1);
			sinon.assert.calledWithExactly(oCache.removeByPath,
				sinon.match.same(oCache.mPostRequests), sPathInCache,
				sinon.match.same(oEntityDataCleaned));
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: with given sPath and delete before submit", function (assert) {
		var oBody,
			// real requestor to avoid reimplementing callback handling of _Requestor.request
			oRequestor = _Requestor.create("/~/", {fnGetGroupProperty : defaultGetGroupProperty}),
			oCache = new _Cache(oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache),
			aCollection = [],
			fnCancelCallback = this.spy(),
			oCreatePromise,
			fnDeleteCallback = this.spy(),
			oGroupLock = new _GroupLock("updateGroup"),
			sPathInCache = "0/TEAM_2_EMPLOYEES",
			oPostPathPromise = SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES");

		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs(new _GroupLock("$cached"), "0/TEAM_2_EMPLOYEES")
			.returns(SyncPromise.resolve(aCollection));
		this.spy(oCache, "addByPath");
		this.spy(oRequestor, "request");

		// code under test
		oCreatePromise = oCache.create(oGroupLock, oPostPathPromise, sPathInCache,
			{ID : "", Name : "John Doe"}, fnCancelCallback);

		sinon.assert.calledWithExactly(oRequestor.request, "POST", "TEAMS('0')/TEAM_2_EMPLOYEES",
			sinon.match.same(oGroupLock), null, /*oPayload*/sinon.match.object,
			/*fnSubmit*/sinon.match.func, /*fnCancel*/sinon.match.func);
		oBody = oRequestor.request.args[0][4];
		// request is added to mPostRequests
		sinon.assert.calledWithExactly(oCache.addByPath, sinon.match.same(oCache.mPostRequests),
			sPathInCache, sinon.match.same(oBody));
		this.spy(oCache, "removeByPath");

		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), sPathInCache)
			.returns(SyncPromise.resolve(aCollection));

		// code under test
		oCache._delete(oGroupLock, "TEAMS('0')/TEAM_2_EMPLOYEES", sPathInCache + "/-1",
			fnDeleteCallback);

		sinon.assert.calledWithExactly(oCache.removeByPath, sinon.match.same(oCache.mPostRequests),
			sPathInCache, sinon.match.same(oBody));
		return oCreatePromise.then(function () {
			assert.notOk(true, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.canceled, true);
		});
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function(oCacheData, i) {
		QUnit.test("_Cache#create: allowed for collections only - " + i, function (assert) {
			var oCache = new _Cache(this.oRequestor, "TEAMS"),
				sPathInCache = "0/TEAM_2_MANAGER";

			oCache.fetchValue = function () {};
			this.mock(oCache).expects("fetchValue")
				.withExactArgs(new _GroupLock("$cached"), "0/TEAM_2_MANAGER")
				.returns(SyncPromise.resolve(oCacheData));

			// code under test
			assert.throws(function () {
				oCache.create(new _GroupLock("updateGroup"), "TEAMS('01')/TEAM_2_MANAGER",
					sPathInCache, {});
			}, new Error("Create is only supported for collections; '" + sPathInCache
				+ "' does not reference a collection"));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: query params", function (assert) {
		var oCache,
			mQueryParams = {},
			sQueryParams = "?query",
			sResourcePath = "Employees";

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryParams), false, false)
			.returns(sQueryParams);

		oCache = this.createCache(sResourcePath, mQueryParams, false);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + sQueryParams + "&$skip=0&$top=5", undefined,
				undefined, undefined, undefined)
			.returns(Promise.resolve({value: []}));

		// code under test
		mQueryParams.$select = "foo"; // modification must not affect cache
		return oCache.read(0, 5, 0);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: error handling", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oError = {},
			oSuccess = createResult(0, 5),
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined, undefined,
				undefined, undefined)
			.returns(Promise.reject(oError));
		this.spy(oCache, "fill");

		// code under test
		return oCache.read(0, 5, 0).catch(function (oResult1) {
			assert.strictEqual(oResult1, oError);
			sinon.assert.calledWithExactly(oCache.fill, sinon.match.instanceOf(SyncPromise), 0, 5);
			sinon.assert.calledWithExactly(oCache.fill, undefined, 0, 5);

			that.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined, undefined,
					undefined, undefined)
				.returns(Promise.resolve(oSuccess));

			// code under test
			return oCache.read(0, 5, 0).then(function (oResult2) {
				assert.deepEqual(oResult2, oSuccess);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity and has pending changes", function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oEntityData = {name : "John Doe"},
			oGroupLock = new _GroupLock("updateGroup"),
			oHelperMock = this.mock(_Helper),
			oPatchPromise1,
			oPatchPromise2,
			oPostResult = {},
			oPostPromise,
			oReadPromise,
			aSelect = [];

		function transientCacheData(oCacheValue) {
			return oCache.aElements[-1] === oCacheValue;
		}

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), true)
			.returns("?foo=bar");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees?foo=bar", oGroupLock, null,
				sinon.match(transientCacheData), sinon.match.func, sinon.match.func)
			.returns(Promise.resolve(oPostResult));
		// called from update
		oHelperMock.expects("updateCache")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "-1",
				sinon.match(transientCacheData), {bar : "baz"});
		// called from the POST's success handler
		oHelperMock.expects("getKeyPredicate").returns("('foo')");
		oHelperMock.expects("getSelectForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "")
			.returns(aSelect);
		oHelperMock.expects("updateCacheAfterPost")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "-1",
				sinon.match(transientCacheData), sinon.match.same(oPostResult),
				sinon.match.same(aSelect));

		// code under test
		oPostPromise = oCache.create(oGroupLock, "Employees", "", oEntityData);

		assert.strictEqual(oCache.hasPendingChangesForPath(""), true, "pending changes for root");
		assert.strictEqual(oCache.hasPendingChangesForPath("foo"), false,
			"pending changes for non-root");

		assert.notStrictEqual(oCache.aElements[-1], oEntityData, "'create' copies initial data");
		assert.deepEqual(oCache.aElements[-1], {
			name : "John Doe",
			"@$ui5._" : {"transient" : "updateGroup"}
		});

		// The lock must be unlocked although no request is created
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		oPatchPromise1 = oCache.update(oGroupLock, "bar", "baz", this.spy(), "n/a", "-1");
		oPatchPromise2 = oCache.update(new _GroupLock("anotherGroup"), "bar", "qux", this.spy(),
			"n/a", "-1");
		oReadPromise = oCache.read(-1, 1, 0);

		return Promise.all([
			oPatchPromise1.then(), // check that update returned a promise
			oPatchPromise2.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, "The entity will be created via group "
					+ "'updateGroup'. Cannot patch via group 'anotherGroup'");
			}),
			oPostPromise.then(function () {
				assert.notOk(_Helper.hasPrivateAnnotation(oCache.aElements[-1], "transient"));
				assert.strictEqual(oCache.hasPendingChangesForPath(""), false,
					"no more pending changes");
			}),
			oReadPromise.then(function (oResult) {
				assert.notOk("@odata.count" in oResult);
			})
		]);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: pending create forces update/_delete to fail", function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oCreateGroupLock = new _GroupLock("updateGroup"),
			oCreatePromise,
			oError = new Error(),
			fnErrorCallback = this.spy(),
			oFailedPostPromise,
			fnRejectPost,
			oRequestExpectation1,
			oRequestExpectation2,
			fnResolvePost,
			that = this;

		function checkUpdateAndDeleteFailure() {
			// code under test
			oCache.update(new _GroupLock("updateGroup"), "foo", "baz", that.spy(), "n/a", "-1")
				.then(function () {
					assert.ok(false, "unexpected success - update");
				}, function (oError) {
					assert.strictEqual(oError.message,
						"No 'update' allowed while waiting for server response",
						oError.message);

				});
			oCache._delete(new _GroupLock("updateGroup"), "n/a", "-1").then(function () {
				assert.ok(false, "unexpected success - _delete");
			}, function (oError) {
				assert.strictEqual(oError.message,
					"No 'delete' allowed while waiting for server response",
					oError.message);

			});
		}

		function checkUpdateSuccess(sWhen) {
			// code under test
			return oCache.update(new _GroupLock("updateGroup"), "foo", sWhen, that.spy(),
					"Employees", "-1")
				.then(function () {
					assert.ok(true, "Update works " + sWhen);
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[-1], "transient"),
						"updateGroup");
				});
		}

		this.mock(this.oRequestor).expects("buildQueryString").twice()
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), true)
			.returns("?sap-client=111");
		oRequestExpectation1 = this.oRequestorMock.expects("request");
		oRequestExpectation1.withExactArgs("POST", "Employees?sap-client=111",
				sinon.match.same(oCreateGroupLock), null, sinon.match.object,
				sinon.match.func, sinon.match.func)
			.returns(oFailedPostPromise = new Promise(function (resolve, reject) {
				fnRejectPost = reject;
			}));
		this.mock(_Helper).expects("getKeyPredicate").returns("('foo')");

		oCreatePromise = oCache.create(oCreateGroupLock, "Employees", "", {},
			undefined, fnErrorCallback);

		checkUpdateSuccess("before submitBatch").then(function () {
			oRequestExpectation2 = that.oRequestorMock.expects("request");
			// immediately add the POST request again into queue
			oRequestExpectation2.withExactArgs("POST", "Employees?sap-client=111",
					new _GroupLock("updateGroup"), null, sinon.match.object, sinon.match.func,
					sinon.match.func)
				.returns(new Promise(function (resolve) {
						fnResolvePost = resolve;
					}));

			// simulate a submitBatch leading to a failed POST
			oRequestExpectation1.args[0][5]();

			checkUpdateAndDeleteFailure();

			fnRejectPost(oError);

			oFailedPostPromise.then(undefined, function () {
				assert.ok(fnErrorCallback.calledWithExactly(oError));
				checkUpdateSuccess("with restarted POST").then(function () {
					// simulate a submitBatch leading to a successful POST
					oRequestExpectation2.args[0][5]();

					checkUpdateAndDeleteFailure();

					fnResolvePost({}); // this will resolve oCreatePromise, too
				});
			});
		});

		return oCreatePromise.then(function () {
			var oGroupLock = new _GroupLock("updateGroup");

			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "Employees?sap-client=111", sinon.match.same(oGroupLock),
					{"If-Match" : undefined}, {foo : "baz2"}, undefined,
					sinon.match.func)
				.returns(Promise.resolve({}));

			// code under test
			return oCache.update(oGroupLock, "foo", "baz2", that.spy(),"Employees", "-1");
		});
	});

	//*********************************************************************************************
	["$direct", "$auto", "myAuto", "myDirect"].forEach(function (sUpdateGroupId) {
		QUnit.test("CollectionCache#create: relocate on failed POST for " + sUpdateGroupId,
				function (assert) {
			var oCache = this.createCache("Employees"),
				oFailedPostPromise = Promise.reject(new Error()),
				oGroupLock = new _GroupLock(sUpdateGroupId),
				mGroups = {
					"$direct" : "Direct",
					"$auto" : "Auto",
					"myAuto" : "Auto",
					"myDirect" : "Direct"
				},
				that = this;

			this.oRequestorMock.expects("getGroupSubmitMode")
				.withExactArgs(sUpdateGroupId).returns(mGroups[sUpdateGroupId]);

			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
					sinon.match.object, sinon.match.func, sinon.match.func)
				.returns(oFailedPostPromise);

			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", new _GroupLock("$parked." + sUpdateGroupId),
					null, sinon.match.object, sinon.match.func, sinon.match.func)
				.returns(Promise.resolve({Name: "John Doe", Age: 47}));
			this.mock(_Helper).expects("getKeyPredicate").returns("('foo')");

			// code under test
			oCache.create(oGroupLock, "Employees", "", {Name: null});

			return oFailedPostPromise.then(undefined, function () {
				var aPromises = [],
					sWrongGroupId = sUpdateGroupId === "$direct" ? "$auto" : "$direct";

				// code under test - try to update via wrong $direct/auto group
				aPromises.push(oCache.update(new _GroupLock(sWrongGroupId), "Name", "John Doe",
						that.spy(), "n/a", "-1")
					.then(undefined, function(oError) {
						assert.strictEqual(oError.message, "The entity will be created via group '"
							+ sUpdateGroupId + "'. Cannot patch via group '" + sWrongGroupId + "'");
					}));

				that.oRequestorMock.expects("relocate")
					.withExactArgs("$parked." + sUpdateGroupId, oCache.aElements[-1],
						sUpdateGroupId);

				// code under test - first update -> relocate
				aPromises.push(oCache.update(new _GroupLock(sUpdateGroupId), "Name", "John Doe",
					that.spy(), "n/a", "-1"));

				// code under test - second update -> do not relocate again
				aPromises.push(oCache.update(new _GroupLock(sUpdateGroupId), "Name", "John Doe1",
					that.spy(), "n/a", "-1"));

				return Promise.all(aPromises);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity without initial data", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees"),
			oPromise;

		this.oRequestorMock.expects("request").returns(Promise.resolve({}));
		this.mock(_Helper).expects("getKeyPredicate").returns("('foo')");

		// code under test
		oPromise = oCache.create(new _GroupLock("updateGroup"), "Employees", "");

		assert.deepEqual(oCache.aElements[-1], {
			"@$ui5._" : {"transient" : "updateGroup"}
		});
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity, canceled", function (assert) {
		var oCache = this.createCache("Employees"),
			oCanceledError = new Error(),
			bFnCancelCallbackCalled = false,
			oGroupLock = new _GroupLock("updateGroup");

		oCanceledError.canceled = true;

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func)
			.callsArg(6)
			.returns(Promise.reject(oCanceledError));

		// code under test
		return oCache.create(oGroupLock, "Employees", "", undefined, function () {
				bFnCancelCallbackCalled = true;
			}).then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, oCanceledError);
				assert.notOk(-1 in oCache.aElements);
				assert.ok(bFnCancelCallbackCalled);
			});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: read w/ transient context", function (assert) {
		var oCache = this.createCache("Employees"),
			oEntityData = {name : "John Doe"},
			oGroupLock = new _GroupLock("updateGroup"),
			oReadResult = {value : [{}, {}]};

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func)
			.returns(new Promise(function () {})); // never resolve
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=0&$top=2", undefined, undefined,
				undefined, undefined)
			.returns(Promise.resolve(oReadResult));

		oCache.create(oGroupLock, "Employees", "", oEntityData);

		// code under test
		return oCache.read(-1, 3, 0).then(function (oResult) {
			assert.strictEqual(oResult.value.length, 3);
			assert.ok(_Helper.getPrivateAnnotation(oResult.value[0], "transient"));
			assert.strictEqual(oResult.value[1], oReadResult.value[0]);
			assert.strictEqual(oResult.value[2], oReadResult.value[1]);

			// code under test
			oResult = oCache.read(-1, 1, 0).getResult();
			assert.strictEqual(oResult.value.length, 1);
			assert.strictEqual(oResult.value[0].name, "John Doe");

			// code under test
			oResult = oCache.fetchValue(undefined, "-1/name").getResult();
			assert.strictEqual(oResult, "John Doe");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create and delete transient entry", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/", {fnGetGroupProperty : defaultGetGroupProperty}),
			oCache = _Cache.create(oRequestor, "Employees"),
			fnCancelCallback = this.spy(),
			oCreatePromise,
			oDeletePromise,
			oGroupLock = new _GroupLock("updateGroup"),
			oTransientElement;

		this.spy(oRequestor, "request");

		oCreatePromise = oCache.create(oGroupLock, "Employees", "", {}, fnCancelCallback)
			.catch(function (oError) {
				assert.ok(oError.canceled);
			});

		assert.ok(-1 in oCache.aElements);
		oTransientElement = oCache.aElements[-1];

		sinon.assert.calledWithExactly(oRequestor.request, "POST", "Employees",
			sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func,
			sinon.match.func);
		this.spy(oRequestor, "removePost");
		this.spy(_Helper, "updateCache");

		// code under test
		oDeletePromise = oCache._delete(new _GroupLock("$auto"), "n/a", "-1", function () {
			throw new Error();
		});

		sinon.assert.calledWithExactly(oRequestor.removePost, "updateGroup",
			sinon.match(function (oParameter) {
				return oParameter === oTransientElement;
			}));
		sinon.assert.calledOnce(fnCancelCallback);
		assert.notOk(-1 in oCache.aElements);

		// wait for the promises to see potential asynchronous errors
		return Promise.all([oCreatePromise, oDeletePromise]);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: delete created entity", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/", {fnGetGroupProperty : defaultGetGroupProperty}),
			oCache = _Cache.create(oRequestor, "Employees"),
			fnCallback = this.spy(),
			oCreatedPromise,
			oEntity = {EmployeeId: "4711", "@odata.etag" : "anyEtag"},
			sGroupId = "updateGroup",
			oGroupLock = new _GroupLock(sGroupId),
			mTypeForMetaPath = {},
			that = this;

		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.object, "/Employees", sinon.match.same(mTypeForMetaPath))
			.returns("(~)");

		oCreatedPromise = oCache.create(oGroupLock, "Employees", "", {}, function () {
			throw new Error();
		});

		// simulate submitBatch
		oRequestor.mBatchQueue[sGroupId][0][0].$resolve(oEntity);

		return oCreatedPromise.then(function () {
			that.mock(oRequestor).expects("request")
				.withExactArgs("DELETE", "/~/Employees('4711')", new _GroupLock("$auto"),
					{"If-Match" : "anyEtag"})
				.returns(Promise.resolve());

			// code under test
			return oCache._delete(new _GroupLock("$auto"), "/~/Employees('4711')", "-1", fnCallback)
				.then(function () {
					sinon.assert.calledOnce(fnCallback);
					assert.notOk(-1 in oCache.aElements, "ok");
			});
		});
	});
	//TODO: oCache._delete in resolve handler for that.oRequestor.request("DELETE"...
	//if (vDeleteProperty === -1) { // TODO might be string, might be result of failed indexOf

	//*********************************************************************************************
	QUnit.test("SingleCache#fetchValue", function (assert) {
		var oCache,
			oCacheMock,
			fnDataRequested1 = {},
			fnDataRequested2 = {},
			oExpectedResult = {},
			aFetchValuePromises,
			oListener1 = {},
			oListener2 = {},
			sMetaPath = "~",
			mQueryParams = {},
			sResourcePath = "Employees('1')",
			mTypeForMetaPath = {},
			that = this;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryParams), false, true)
			.returns("?~");
		this.mock(_Cache.prototype).expects("fetchTypes")
			.returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));

		oCache = _Cache.createSingle(this.oRequestor, sResourcePath, mQueryParams, true, undefined,
			sMetaPath);
		oCacheMock = this.mock(oCache);

		oCacheMock.expects("registerChange").withExactArgs(undefined, sinon.match.same(oListener1));
		oCacheMock.expects("registerChange").withExactArgs("foo", sinon.match.same(oListener2));
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", "group", undefined, undefined,
				sinon.match.same(fnDataRequested1), undefined, sMetaPath)
			.returns(Promise.resolve(oExpectedResult).then(function () {
					that.mock(oCache).expects("calculateKeyPredicates")
						.withExactArgs(oExpectedResult, mTypeForMetaPath);
					that.mock(_Cache).expects("computeCount")
						.withExactArgs(sinon.match.same(oExpectedResult));
					oCacheMock.expects("checkActive").twice();
					oCacheMock.expects("drillDown")
						.withExactArgs(sinon.match.same(oExpectedResult), undefined)
						.returns(oExpectedResult);
					oCacheMock.expects("drillDown")
						.withExactArgs(sinon.match.same(oExpectedResult), "foo")
						.returns("bar");
					return oExpectedResult;
				}));

		// code under test
		aFetchValuePromises = [
			oCache.fetchValue("group", undefined, fnDataRequested1, oListener1)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
			})
		];

		assert.ok(oCache.bSentReadRequest);

		// code under test
		aFetchValuePromises.push(
			oCache.fetchValue("group", "foo", fnDataRequested2, oListener2)
				.then(function (oResult) {
					assert.strictEqual(oResult, "bar");
				})
		);

		return Promise.all(aFetchValuePromises);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#post", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath),
			fnDataRequested = this.spy(),
			sGroupId = "group",
			oPostData = {},
			oPromise,
			oResult1 = {},
			oResult2 = {};

		// code under test
		assert.throws(function () {
			oCache.post();
		}, new Error("POST request not allowed"));

		oCache = this.createSingle(sResourcePath, undefined, true);

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sGroupId, {"If-Match" : "etag"},
				sinon.match.same(oPostData))
			.returns(Promise.resolve(oResult1));
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sGroupId, {"If-Match" : undefined},
				sinon.match.same(oPostData))
			.returns(Promise.resolve(oResult2));

		// code under test
		assert.throws(function () {
			oCache.fetchValue();
		}, new Error("Cannot fetch a value before the POST request"));

		assert.notOk(oCache.bSentReadRequest);
		oPromise = oCache.post(sGroupId, oPostData, "etag").then(function (oPostResult1) {
			assert.strictEqual(oPostResult1, oResult1);
			return Promise.all([
				oCache.fetchValue("foo", "", fnDataRequested).then(function (oReadResult) {
					assert.strictEqual(oReadResult, oResult1);
					assert.strictEqual(fnDataRequested.callCount, 0);
				}),
				oCache.post(sGroupId, oPostData).then(function (oPostResult2) {
					assert.strictEqual(oPostResult2, oResult2);
				})
			]);
		});
		assert.ok(!oPromise.isFulfilled());
		assert.ok(!oPromise.isRejected());
		assert.throws(function () {
			oCache.post(sGroupId, oPostData);
		}, new Error("Parallel POST requests not allowed"));
		return oPromise;
	});

	//*********************************************************************************************
	[false, true].forEach(function (bOptional) {
		var sTitle = "SingleCache: Invoke Parameterless Actions with Empty Request Body: "
				+ bOptional;

		QUnit.test(sTitle, function (assert) {
			var oData = {"X-HTTP-Method" : "PUT"},
				sETag = "ETag",
				sGroupId = "group",
				sResourcePath = "LeaveRequest('1')/Submit",
				oCache = this.createSingle(sResourcePath, undefined, true);

			this.oRequestorMock.expects("isActionBodyOptional").withExactArgs().returns(bOptional);
			this.oRequestorMock.expects("request")
				.withExactArgs("PUT", sResourcePath, sGroupId, {"If-Match" : sETag},
					bOptional ? undefined : sinon.match.same(oData))
				.resolves();

			// code under test
			return oCache.post(sGroupId, oData, sETag).then(function () {
					assert.deepEqual(oData, {});
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: post w/o arguments", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true);

		this.oRequestorMock.expects("isActionBodyOptional").never();
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, undefined, {"If-Match" : undefined}, undefined)
			.resolves();

		// code under test
		return oCache.post();
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: post failure", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true),
			sGroupId = "group",
			sMessage = "deliberate failure",
			oPostData = {},
			oPromise;

		this.oRequestorMock.expects("request").twice()
			.withExactArgs("POST", sResourcePath, sGroupId, {"If-Match" : undefined},
				sinon.match.same(oPostData))
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
	QUnit.test("_Cache#toString", function (assert) {
		var oCache,
			mQueryOptions = {"foo" : "bar"},
			sResourcePath = "Employees";

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, undefined)
			.returns("?foo=bar");
		oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions);

		assert.strictEqual(oCache.toString(), "/~/" + sResourcePath + "?foo=bar");
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: mPatchRequests", function (assert) {
		var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oCache = this.createSingle(sResourcePath),
			oError = new Error(),
			sETag = 'W/"19700101000000.0000000"',
			oPatchPromise1 = Promise.resolve({
				"@odata.etag" : 'W/"19700101000000.9999999"',
				Note : "Some Note"
			}),
			oPatchPromise2 = Promise.reject(oError),
			oPromise = Promise.resolve({
				"@odata.etag" : sETag,
				Note : "Some Note"
			}),
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, new _GroupLock("groupId"), undefined, undefined,
				undefined, undefined, "/SOLineItemList")
			.returns(oPromise);
		// fill the cache
		return oCache.fetchValue(new _GroupLock("groupId")).then(function () {
			var oUpdatePromise;

			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, new _GroupLock("updateGroupId"),
					{"If-Match" : sETag}, {Note : "foo"}, undefined, sinon.match.func)
				.returns(oPatchPromise1);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, new _GroupLock("$direct"),
					{"If-Match" : sETag}, {Note : "bar"}, undefined, sinon.match.func)
				.returns(oPatchPromise2);

			// code under test
			oUpdatePromise = Promise.all([
				oCache.update(new _GroupLock("updateGroupId"), "Note", "foo", that.spy(),
					sResourcePath),
				oCache.update(new _GroupLock("$direct"), "Note", "bar", that.spy(), sResourcePath)
					.then(function () {
						assert.ok(false);
					}, function (oError0) {
						assert.strictEqual(oError0, oError);
					})
			]).then(function () {
				assert.deepEqual(oCache.mPatchRequests, {},
					"mPatchRequests empty when both patch requests are finished");
			});
			assert.deepEqual(oCache.mPatchRequests, {
				"Note" : [oPatchPromise1, oPatchPromise2]
			}, "mPatchRequests remembers both pending requests");

			return oUpdatePromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: update, hasPendingChanges and resetChanges", function (assert) {
		var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oCache = this.createSingle(sResourcePath),
			oError = new Error(),
			sETag = 'W/"19700101000000.0000000"',
			oPatchPromise1 = Promise.reject(oError),
			oPatchPromise2 = Promise.reject(oError),
			oPromise = Promise.resolve({
				"@odata.etag" : sETag,
				Note : "Some Note",
				Foo : "Bar"
			}),
			that = this;

		function unexpected () {
			assert.ok(false);
		}

		function rejected(oError) {
			assert.strictEqual(oError.canceled, true);
		}

		oError.canceled = true;
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, new _GroupLock("groupId"), undefined, undefined,
				undefined, undefined, "/SOLineItemList")
			.returns(oPromise);
		// fill the cache and register a listener
		return oCache.fetchValue(new _GroupLock("groupId"), "Note").then(function () {
			var aUpdatePromises;

			assert.strictEqual(oCache.hasPendingChangesForPath(""), false);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, new _GroupLock("updateGroupId"),
					{"If-Match" : sETag}, {Note : "foo"}, undefined, sinon.match.func)
				.returns(oPatchPromise1);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, new _GroupLock("updateGroupId"),
					{"If-Match" : sETag}, {Foo : "baz"}, undefined, sinon.match.func)
				.returns(oPatchPromise2);
			that.oRequestorMock.expects("removePatch")
				.withExactArgs(sinon.match.same(oPatchPromise1));
			that.oRequestorMock.expects("removePatch")
				.withExactArgs(sinon.match.same(oPatchPromise2));

			// code under test
			aUpdatePromises = [
				oCache.update(new _GroupLock("updateGroupId"), "Note", "foo", that.spy(),
						sResourcePath)
					.then(unexpected, rejected),
				oCache.update(new _GroupLock("updateGroupId"), "Foo", "baz", that.spy(),
						sResourcePath)
					.then(unexpected, rejected)
			];

			assert.strictEqual(oCache.hasPendingChangesForPath(""), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("Note"), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("bar"), false);

			// code under test
			oCache.resetChangesForPath("");

			return Promise.all(aUpdatePromises).then(function () {
				assert.deepEqual(oCache.mPatchRequests, {});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#update: invalid path", function (assert) {
		var sResourcePath = "SalesOrderList(SalesOrderID='0')",
			oCache = this.createSingle(sResourcePath),
			sEditUrl = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oGroupLock = new _GroupLock("groupId"),
			oReadResult = {};

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, new _GroupLock("groupId"), undefined, undefined,
				undefined, undefined, "/SalesOrderList")
			.returns(Promise.resolve(oReadResult));
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oReadResult), "invalid/path").returns(undefined);

		return oCache.update(oGroupLock, "foo", "bar", sEditUrl, this.spy(), "invalid/path")
			.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message,
					"Cannot update 'foo': 'invalid/path' does not exist");
			});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#_delete, followed by _fetchValue: root entity", function (assert) {
		var oCache = this.createSingle("Employees('42')"),
			sEtag = 'W/"19770724000000.0000000"',
			oData = {
				"@odata.etag" : sEtag
			},
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('42')", "groupId", undefined, undefined, undefined,
				undefined, "/Employees")
			.returns(Promise.resolve(oData));

		return oCache.fetchValue("groupId").then(function () {
			var fnCallback = that.spy();

			that.oRequestorMock.expects("request")
				.withExactArgs("DELETE", "Employees('42')", "groupId", {"If-Match" : sEtag})
				.returns(Promise.resolve({}));

			// code under test
			return oCache._delete("groupId", "Employees('42')", "", fnCallback)
				.then(function (oResult) {
					assert.strictEqual(oResult, undefined);
					sinon.assert.calledOnce(fnCallback);
					sinon.assert.calledWithExactly(fnCallback);

					oCache.fetchValue().then(function () {
						assert.ok(false);
					}, function (oError) {
						assert.strictEqual(oError.message, "Cannot read a deleted entity");
					});
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("PropertyCache#fetchValue", function (assert) {
		var oCache,
			oCacheMock,
			fnDataRequested1 = {},
			fnDataRequested2 = {},
			oExpectedResult = {},
			aFetchValuePromises,
			oListener1 = {},
			oListener2 = {},
			mQueryParams = {},
			sResourcePath = "Employees('1')";

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryParams), false, undefined)
			.returns("?~");

		oCache = _Cache.createProperty(this.oRequestor, sResourcePath, mQueryParams);
		oCacheMock = this.mock(oCache);

		oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener1));
		oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener2));
		oCacheMock.expects("registerChange").withExactArgs("", undefined);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", "group", undefined, undefined,
				sinon.match.same(fnDataRequested1), undefined, "/Employees")
			.returns(Promise.resolve().then(function () {
					oCacheMock.expects("checkActive").exactly(3);
					return {value : oExpectedResult};
				}));

		// code under test
		aFetchValuePromises = [
			oCache.fetchValue("group", "", fnDataRequested1, oListener1)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
					assert.strictEqual(oCache.fetchValue("group", "").getResult(), oExpectedResult);
				})
		];

		assert.ok(oCache.bSentReadRequest);

		// code under test
		aFetchValuePromises.push(
			oCache.fetchValue("group", "", fnDataRequested2, oListener2)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
				})
		);

		return Promise.all(aFetchValuePromises);
	});

	//*********************************************************************************************
	QUnit.test("PropertyCache#_delete", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, "foo");

		// code under test
		assert.throws(function () {
			oCache._delete();
		}, new Error("Unsupported"));
	});

	//*********************************************************************************************
	QUnit.test("PropertyCache#create", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, "foo");

		// code under test
		assert.throws(function () {
			oCache.create();
		}, new Error("Unsupported"));
	});

	//*********************************************************************************************
	QUnit.test("PropertyCache#update", function(assert) {
		var oCache = _Cache.createProperty(this.oRequestor, "foo");

		// code under test
		assert.throws(function () {
			oCache.update();
		}, new Error("Unsupported"));
	});

	//*********************************************************************************************
	QUnit.test("_Cache.computeCount", function(assert) {
		var oResult = {
				"foo" : "bar",
				"list" : [{}, {}, {
					"nestedList" : [{}]
				}],
				"property" : {
					"nestedList" : [{}]
				},
				"list2" : [{}, {}, {}],
				"list2@odata.count" : "12",
				"list2@odata.nextLink" : "List2?skip=3",
				"list3" : [{}, {}, {}],
				"list3@odata.nextLink" : "List3?skip=3",
				"collectionValuedProperty" : ["test1", "test2"],
				"null" : null,
				"collectionWithNullValue" : [null]
			};

		this.spy(_Helper, "updateCache");

		// code under test
		_Cache.computeCount(oResult);

		sinon.assert.calledWithExactly(_Helper.updateCache, {}, "", oResult.list, {$count : 3});
		assert.strictEqual(oResult.list.$count, 3);
		sinon.assert.calledWithExactly(_Helper.updateCache, {}, "", oResult.list2, {$count : 12});
		assert.strictEqual(oResult.list2.$count, 12);
		assert.ok("$count" in oResult.list3);
		assert.strictEqual(oResult.list3.$count, undefined);
		assert.strictEqual(oResult.list[2].nestedList.$count, 1);
		assert.strictEqual(oResult.property.nestedList.$count, 1);
		assert.strictEqual(oResult.collectionValuedProperty.$count, 2);
		assert.strictEqual(oResult.collectionWithNullValue.$count, 1);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read uses computeCount", function(assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oValue0 = {},
			oValue1 = {},
			oData = {
				value : [oValue0, oValue1]
			};

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=3", "group", undefined, undefined,
				undefined)
			.returns(Promise.resolve(oData));
		this.mock(_Cache).expects("computeCount").withExactArgs(sinon.match.same(oData));

		// code under test
		return oCache.read(0, 3, 0, "group").then(function () {
			assert.strictEqual(oCache.aElements[0], oValue0);
			assert.strictEqual(oCache.aElements[1], oValue1);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#refreshSingle", function(assert) {
		var fnDataRequested = this.spy(),
			sKeyPredicate = "('13')",
			oElement = {"@$ui5._" : {"predicate" : sKeyPredicate}},
			aElements = [{}, oElement],
			sResourcePath = "Employees",
			mQueryOptionsCopy = {$filter: "foo", $count: true, $orderby: "bar", $select: "Name"},
			oCache = this.createCache(sResourcePath,
				{$filter: "foo", $count: true, $orderby: "bar", $select: "Name"}),
			oCacheMock = this.mock(oCache),
			oPromise,
			sQueryString = "?$select=Name",
			oResponse = {},
			mTypeForMetaPath = {};

		this.mock(jQuery).expects("extend")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions))
			.returns(mQueryOptionsCopy);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, {$select: "Name"}, false,
				oCache.bSortExpandSelect)
			.returns(sQueryString);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + sKeyPredicate + sQueryString, "group", undefined,
				undefined, sinon.match.same(fnDataRequested))
			.returns(Promise.resolve(oResponse));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Cache).expects("computeCount")
			.withExactArgs(sinon.match.same(oResponse));
		oCacheMock.expects("calculateKeyPredicates")
			.withExactArgs(sinon.match.same(oResponse), mTypeForMetaPath);

		oCache.aElements = aElements;
		oCache.aElements.$byPredicate = {};

		// code under test
		oPromise = oCache.refreshSingle("group", 1, fnDataRequested);
		assert.ok(oPromise.isFulfilled, "returned a SyncPromise");

		assert.strictEqual(oCache.bSentReadRequest, true);
		assert.deepEqual(oCache.aElements, aElements);
		assert.strictEqual(oCache.aElements[1], oElement);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.strictEqual(oCache.aElements[1], oResponse);
			assert.strictEqual(oCache.aElements.$byPredicate[sKeyPredicate], oResponse);
		});
	});

	//*********************************************************************************************
	[{
		mBindingQueryOptions : {$filter: "age gt 40"},
		iIndex : 1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'"},
		sQueryString : "?$filter=(age%20gt%2040)%20and%20ID%20eq%20'0'",
		mQueryOptionsForRequest : {$filter: "(age gt 40) and ID eq '0'"},
		bRemoved : true
	}, {
		mBindingQueryOptions : {$filter: "age gt 40"},
		iIndex : 1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'"},
		sQueryString : "?$filter=%28age%20gt%2040%29%20and%20ID%20eq%20'0'",
		mQueryOptionsForRequest : {$filter: "(age gt 40) and ID eq '0'"},
		bRemoved : false
	}, {
		mBindingQueryOptions : {$filter: "age gt 40 or age lt 20"},
		iIndex : 1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'", "Name" : "'Foo'"},
		sQueryString : "?$filter=(age%20gt%2040%20or%20age%20lt%2020)%20and%20ID%20eq%20'0'%20"
			+ "and%20Name%20eq%20'Foo'",
			mQueryOptionsForRequest : {$filter: "(age gt 40 or age lt 20) and ID eq '0'"
				+ " and Name eq 'Foo'"},
		bRemoved : true
	}, {
		mBindingQueryOptions : {$filter: "age gt 40"},
		iIndex : 1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'", "Name" : "'Foo'"},
		sQueryString : "?$filter=age%20gt%2040%20and%20ID%20eq%20'0'%20"
			+ "and%20Name%20eq%20'Foo'",
		mQueryOptionsForRequest : {$filter: "(age gt 40) and ID eq '0' and Name eq 'Foo'"},
		bRemoved : false
	}, {
		mBindingQueryOptions : {},
		iIndex : 1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'", "Name" : "'Foo'"},
		sQueryString : "?$filter=ID%20eq%20'0'%20and%20Name%20eq%20'Foo'",
		mQueryOptionsForRequest : {$filter: "ID eq '0' and Name eq 'Foo'"},
		bRemoved : false
	}, { // with transient
		mBindingQueryOptions : {},
		iIndex : -1,
		sKeyPredicate : "('0')",
		mKeyProperties : {"ID" : "'0'", "Name" : "'Foo'"},
		sQueryString : "?$filter=ID%20eq%20'0'%20and%20Name%20eq%20'Foo'",
		mQueryOptionsForRequest : {$filter: "ID eq '0' and Name eq 'Foo'"},
		bRemoved : true
	}].forEach(function (oFixture) {
		var sTitle = "CollectionCache#refreshSingleWithRemove: removed=" + oFixture.bRemoved;

		QUnit.test(sTitle, function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath, {$filter: "age gt 40"}),
				oCacheMock = this.mock(oCache),
				fnDataRequested = this.spy(),
				oElement = {"@$ui5._" : {"predicate" : oFixture.sKeyPredicate}},
				aElements = [{}, {}, {}],
				oGroupLock = new _GroupLock(),
				mTypeForMetaPath = {},
				fnOnRemove = this.spy(),
				oPromiseFetchTypes = SyncPromise.resolve(mTypeForMetaPath),
				oPromise,
				oResponse = oFixture.bRemoved
								? {value : []}
								: {value : [{Foo : "Bar"}]}, // at least an entity is returned
				oPromiseRequest = Promise.resolve(oResponse),
				that = this;

			// cache preparation
			oCache.iLimit = 2;
			aElements[oFixture.iIndex] = oElement;
			oCache.aElements = aElements;
			oCache.aElements.$count = 2;
			oCache.aElements.$byPredicate = {};
			oCache.aElements.$byPredicate[oFixture.sKeyPredicate] =  oElement;
			this.spy(_Helper, "updateCache");

			this.mock(jQuery).expects("extend")
				.withExactArgs({}, sinon.match.same(oCache.mQueryOptions))
				.returns(oFixture.mBindingQueryOptions);
			oCacheMock.expects("fetchTypes")
				.withExactArgs()
				.callsFake(function () {
					that.oRequestorMock.expects("request")
						.withExactArgs("GET", sResourcePath + oFixture.sQueryString,
							sinon.match.same(oGroupLock), undefined, undefined,
							sinon.match.same(fnDataRequested))
						.returns(oPromiseRequest);
					return oPromiseFetchTypes;
				});
			this.mock(_Helper).expects("getKeyProperties")
				.withExactArgs(oElement, "/" + sResourcePath, sinon.match.same(mTypeForMetaPath))
				.returns(oFixture.mKeyProperties);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs(oCache.sMetaPath, oFixture.mQueryOptionsForRequest, false,
					oCache.bSortExpandSelect)
				.returns(oFixture.sQueryString);
			oCacheMock.expects("calculateKeyPredicates")
				.exactly(oFixture.bRemoved ? 0 : 1)
				.withExactArgs(sinon.match.same(oResponse.value[0]),
					sinon.match.same(mTypeForMetaPath));
			this.mock(_Cache).expects("computeCount")
				.exactly(oFixture.bRemoved ? 0 : 1)
				.withExactArgs(sinon.match.same(oResponse.value[0]));

			// code under test
			oPromise = oCache.refreshSingleWithRemove(oGroupLock, oFixture.iIndex, fnDataRequested,
				fnOnRemove);

			assert.strictEqual(oCache.bSentReadRequest, true);
			return oPromise.then(function () {
				if (oFixture.bRemoved) {
					assert.deepEqual(oCache.aElements[1], {});
					assert.deepEqual(oCache.aElements.$byPredicate[oFixture.sKeyPredicate],
						undefined);
					assert.strictEqual(oCache.iLimit, 1);

					sinon.assert.calledWithExactly(_Helper.updateCache,
						sinon.match.same(oCache.mChangeListeners), "",
						sinon.match.same(aElements), {$count : 1});
					sinon.assert.calledOnce(fnOnRemove);
				} else {
					assert.strictEqual(oCache.aElements[1], oResponse.value[0]);
					assert.strictEqual(oCache.aElements.$byPredicate[oFixture.sKeyPredicate],
						oResponse.value[0]);
					assert.strictEqual(oCache.iLimit, 2);
				}
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRemoved) {
		QUnit.test("refreshSingleWithRemove: parallel delete, " + bRemoved, function(assert) {
			var fnOnRemove = this.spy(),
				sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath, {$filter: "age gt 40"}),
				oCacheMock = this.mock(oCache),
				oElement = {"@$ui5._" : {"predicate" : "('3')"}},
				aElements = [{}, {}, {}, oElement],
				oGroupLock = new _GroupLock(),
				oResult = {"ID" : "3"},
				mTypeForMetaPath = {};

			// cache preparation
			oCache.aElements = aElements;
			oCache.aElements.$byPredicate = {"('3')" : oElement};

			oCacheMock.expects("fetchTypes").withExactArgs()
				.returns(SyncPromise.resolve(mTypeForMetaPath));
			this.mock(_Helper).expects("getKeyProperties")
				.withExactArgs(oElement, "/" + sResourcePath, sinon.match.same(mTypeForMetaPath))
				.returns({"ID" : "'3'"});
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs(oCache.sMetaPath, {$filter: "(age gt 40) and ID eq '3'"}, false,
					oCache.bSortExpandSelect)
				.returns("?$filter=%28age%20gt%2040%29%20and%20ID%20eq%20'3'");
			this.oRequestorMock.expects("request")
				.withExactArgs("GET",
					sResourcePath + "?$filter=%28age%20gt%2040%29%20and%20ID%20eq%20'3'",
					sinon.match.same(oGroupLock), undefined, undefined, undefined)
				.callsFake(function () {
					// simulate another delete while this one is waiting for its promise
					oCache.aElements.splice(0, 1);
					return Promise.resolve(bRemoved ? {value : []} : {value : [oResult]});
				});

			// code under test
			return oCache.refreshSingleWithRemove(oGroupLock, 3, undefined, fnOnRemove)
				.then(function () {
					if (bRemoved) {
						sinon.assert.calledWithExactly(fnOnRemove, 2);
					} else {
						assert.strictEqual(oCache.aElements[2], oResult);
					}
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingleWithRemove: server returns more than one entity", function(assert) {
		var fnOnRemove = this.spy(),
			sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath, {$filter: "age gt 40"}),
			oCacheMock = this.mock(oCache),
			oElement = {"@$ui5._" : {"predicate" : "('3')"}},
			aElements = [{}, {}, {}, oElement],
			oResult = {"ID" : "3"},
			mTypeForMetaPath = {};

		// cache preparation
		oCache.aElements = aElements;
		oCache.aElements.$byPredicate = {"('3')" : oElement};

		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getKeyProperties")
			.returns({"ID" : "'3'"});
		this.oRequestorMock.expects("buildQueryString")
			.returns("?$filter=%28age%20gt%2040%29%20and%20ID%20eq%20'3'");
		this.oRequestorMock.expects("request")
			.callsFake(function () {
				return Promise.resolve({value : [oResult, oResult]});
			});

		// code under test
		return oCache.refreshSingleWithRemove("group", 3, undefined, fnOnRemove)
			.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message,
					"Unexpected server response, more than one entity returned.");
			});
	});

	//*********************************************************************************************
	QUnit.test("makeUpdateData", function(assert) {
		assert.deepEqual(_Cache.makeUpdateData(["Age"], 42), {"Age" : 42});
		assert.deepEqual(_Cache.makeUpdateData(["Address", "City"], "Walldorf"),
			{"Address" : {"City" : "Walldorf"}});
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		QUnit.test("SingleCache: read employee (real OData)", function (assert) {
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
					"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/"), {
						fnFetchMetadata : function () {
							return SyncPromise.resolve({});
						},
						fnGetGroupProperty : defaultGetGroupProperty
					}),
				sResourcePath = "TEAMS('TEAM_01')",
				oCache = _Cache.createSingle(oRequestor, sResourcePath);

			return oCache.fetchValue().then(function (oResult) {
				delete oResult["@odata.metadataEtag"];
				assert.deepEqual(oResult, oExpectedResult);
			});
		});
	}
});
//TODO: resetCache if error in update?
// TODO we cannot update a single property with value null, because the read delivers "204 No
//      Content" and no oResult. Hence we do not have the ETag et al.
//TODO key predicate calculation in the result of operations?
