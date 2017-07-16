/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Requestor",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/test/TestUtils"
], function (jQuery, _Cache, _Helper, _Requestor, _SyncPromise, TestUtils) {
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

	/**
	 * Returns an empty type for every path in order to ensure that no key predicate is calculated.
	 * @returns {_SyncPromise} A sync promise that resolves with an empty type
	 */
	function defaultFetchType() {
		return _SyncPromise.resolve({});
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () {return "";},
				getServiceUrl : function () {return "/~/";},
				relocate : function () {},
				removePatch : function () {},
				removePost : function () {},
				request : function () {}
			};
			this.oRequestorMock = sinon.mock(this.oRequestor);
		},

		afterEach : function () {
			this.oRequestorMock.verify();
			this.oLogMock.verify();
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
			return _Cache.create(this.oRequestor, sResourcePath, defaultFetchType, mQueryOptions,
				false);
		},
		/**
		 * Creates a collection cache. Only resource path and query options must be supplied. Uses
		 * this.oRequestor, does not calculate key predicates, does not sort query options.
		 *
		 * @param {string} sResourcePath The resource path
		 * @param {object} [mQueryOptions] The query options.
		 * @param {boolean} [bPost] Whether the cache uses POST requests.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createSingle : function (sResourcePath, mQueryOptions, bPost) {
			return _Cache.createSingle(this.oRequestor, sResourcePath, defaultFetchType,
				mQueryOptions, false, bPost);
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
			sResourcePath = "~",
			oCache;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sinon.match.same(mQueryOptions), false, "bSortExpandSelect")
			.returns("?foo=bar");

		// code under test
		oCache = new _Cache(this.oRequestor, sResourcePath, defaultFetchType, mQueryOptions,
			"bSortExpandSelect");

		assert.strictEqual(oCache.bActive, true);
		assert.deepEqual(oCache.mChangeListeners, {});
		assert.deepEqual(oCache.mPatchRequests, {});
		assert.deepEqual(oCache.mPostRequests, {});
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.sResourcePath, "~");
		assert.strictEqual(oCache.sQueryString, "?foo=bar");
		assert.strictEqual(oCache.fnFetchType, defaultFetchType);
		assert.strictEqual(oCache.oTypePromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_Cache hierarchy", function (assert) {
		assert.ok(_Cache.create(this.oRequestor, "TEAMS", defaultFetchType) instanceof _Cache);
		assert.ok(_Cache.createSingle(this.oRequestor, "TEAMS('42')", defaultFetchType)
			instanceof _Cache);
		assert.ok(_Cache.createProperty(this.oRequestor) instanceof _Cache);
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCount) {
		[200, 404, 500].forEach(function (iStatus) {
			QUnit.test("_Cache#_delete: from collection, status: " + iStatus + ", bCount: "
					+ bCount, function (assert) {
				var oCache = new _Cache(this.oRequestor, "EMPLOYEES('42'), defaultFetchType",
						{foo : "bar"}),
					sEtag = 'W/"19770724000000.0000000"',
					aCacheData = [{
						"@odata.etag" : "before"
					}, {
						"@$ui5.predicate" : "('42')",
						"@odata.etag" : sEtag
					}, {
						"@odata.etag" : "after"
					}],
					fnCallback = sinon.spy(),
					oError = new Error(""),
					oPromise;

				aCacheData.$count = bCount ? 3 : undefined;
				aCacheData.$byPredicate = {"('42')" : aCacheData[1]};
				oCache.fetchValue = function () {};
				// no need for different tests for top level or nested collections because
				// fetchValue takes care to deliver corresponding elements
				this.mock(oCache).expects("fetchValue")
					.withExactArgs("groupId", "EMPLOYEE_2_EQUIPMENTS")
					.returns(_SyncPromise.resolve(aCacheData));

				this.spy(_Helper, "updateCache");
				oError.status = iStatus;
				this.oRequestorMock.expects("buildQueryString").returns("?foo=bar");
				this.oRequestorMock.expects("request")
					.withExactArgs("DELETE", "Equipments('1')?foo=bar", "groupId",
						{"If-Match" : sEtag})
					.returns(iStatus === 200 ? Promise.resolve({}) : Promise.reject(oError));

				// code under test
				oPromise = oCache._delete("groupId", "Equipments('1')", "EMPLOYEE_2_EQUIPMENTS/1",
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
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES", defaultFetchType),
			aCacheData = [{"$ui5.deleting" : true}];

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs("groupId", "1/EMPLOYEE_2_EQUIPMENTS")
			.returns(_SyncPromise.resolve(aCacheData));

		// code under test
		oCache._delete("groupId", "Equipments('0')", "1/EMPLOYEE_2_EQUIPMENTS/0").then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, "Must not delete twice: Equipments('0')");
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: from collection, parallel delete", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES", defaultFetchType),
			aCacheData = [],
			fnCallback = sinon.spy(),
			oSuccessor = {};

		aCacheData[42] = {};
		aCacheData[43] = oSuccessor;
		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs("groupId", "")
			.returns(_SyncPromise.resolve(aCacheData));

		this.stub(this.oRequestor, "request", function () {
			// simulate another delete while this one is waiting for its promise
			aCacheData.splice(0, 1);
			return Promise.resolve();
		});

		// code under test
		return oCache._delete("groupId", "EMPLOYEES('42')", "42", fnCallback)
			.then(function () {
				assert.strictEqual(aCacheData[41], oSuccessor);
				sinon.assert.calledWith(fnCallback, 41);
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: nested entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')", defaultFetchType,
				{$expand : {EMPLOYEE_2_TEAM : true}}),
			sEtag = 'W/"19770724000000.0000000"',
			oCacheData = {
				"EMPLOYEE_2_TEAM" : {
					"@odata.etag" : sEtag
				}
			},
			fnCallback = sinon.spy();


		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs("groupId", "")
			.returns(_SyncPromise.resolve(oCacheData));
		this.oRequestorMock.expects("request")
			.withExactArgs("DELETE", "TEAMS('23')", "groupId", {"If-Match" : sEtag})
			.returns(Promise.resolve({}));

		// code under test
		return oCache._delete("groupId", "TEAMS('23')", "EMPLOYEE_2_TEAM", fnCallback)
			.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
				assert.deepEqual(oCacheData, {
					"EMPLOYEE_2_TEAM" : null
				});
				sinon.assert.calledOnce(fnCallback);
				sinon.assert.calledWithExactly(fnCallback);
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#addByPath", function (assert) {
		var oCache = new _Cache(this.oRequestor),
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
		var oCache = new _Cache(this.oRequestor),
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
		var oCache = new _Cache(this.oRequestor);

		this.mock(oCache).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.registerChange("path", "listener");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#deregisterChange", function (assert) {
		var oCache = new _Cache(this.oRequestor);

		this.mock(oCache).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.deregisterChange("path", "listener");
	});

	//*********************************************************************************************
	[true, false].forEach(function (bPatch) {
		QUnit.test("_Cache#hasPendingChangesForPath: bPatch = " + bPatch, function (assert) {
			var oCache = new _Cache(this.oRequestor);

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
		var oCache = new _Cache(this.oRequestor),
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
		var oBody0 = {"@$ui5.transient" : "update"},
			oBody1 = {"@$ui5.transient" : "update2"},
			oBody2 = {"@$ui5.transient" : "update"},
			oBody3 = {"@$ui5.transient" : "update"},
			oBody4 = {"@$ui5.transient" : "update"},
			oCache = new _Cache(this.oRequestor),
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
		var oCache = new _Cache(this.oRequestor);

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
		var oCache = new _Cache(this.oRequestor),
			oData = [{
				foo : {
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
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCanceled) {
		QUnit.test("_Cache#update: " + (bCanceled ? "canceled" : "success"), function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "/BusinessPartnerList", defaultFetchType,
					mQueryOptions, true),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = sinon.spy(),
				oError = new Error(),
				sFullPath = "path/to/entity/Address/City",
				oHelperMock = this.mock(_Helper),
				oOldData = {},
				oPatchResult = {},
				oPatchPromise = bCanceled ? Promise.reject(oError) : Promise.resolve(oPatchResult),
				oRequestCall,
				oStaticCacheMock = this.mock(_Cache),
				oUpdateData = {};

			oError.canceled = bCanceled;
			oCache.fetchValue = function () {};
			oCacheMock.expects("fetchValue")
				.withExactArgs("group", "path/to/entity").returns(_SyncPromise.resolve(oEntity));
			oHelperMock.expects("buildPath").withExactArgs("path/to/entity", "Address/City")
				.returns(sFullPath);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs(sinon.match.same(mQueryOptions), true)
				.returns("?foo=bar");
			oStaticCacheMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf")
				.returns(oUpdateData);
			oHelperMock.expects("updateCache")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
			oRequestCall = this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/BusinessPartnerList('0')?foo=bar", "group", {
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
			return oCache.update("group", "Address/City", "Walldorf", fnError,
					"/BusinessPartnerList('0')", "path/to/entity")
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
	[false, true].forEach(function (bCanceled) {
		var sTitle = "_Cache#update: failure, then " + (bCanceled ? "cancel" : "success");
		QUnit.test(sTitle, function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "/BusinessPartnerList", defaultFetchType,
					mQueryOptions),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = sinon.spy(),
				oError1 = new Error(),
				oError2 = new Error(),
				sFullPath = "path/to/entity/Address/City",
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
				.withExactArgs("group", "path/to/entity").returns(_SyncPromise.resolve(oEntity));
			oHelperMock.expects("buildPath").withExactArgs("path/to/entity", "Address/City")
				.returns(sFullPath);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs(sinon.match.same(mQueryOptions), true).returns("?foo=bar");
			oStaticCacheMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf")
				.returns(oUpdateData);
			oHelperMock.expects("updateCache")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
			this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/BusinessPartnerList('0')?foo=bar", "group", {
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
				oRequestCall = that.oRequestorMock.expects("request")
					.withExactArgs("PATCH", "/BusinessPartnerList('0')?foo=bar", "group", {
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
			return oCache.update("group", "Address/City", "Walldorf", fnError,
					"/BusinessPartnerList('0')", "path/to/entity")
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
	["$direct", "$auto"].forEach(function (sGroupId) {
		QUnit.test("_Cache#update: failure, group " + sGroupId, function (assert) {
			var oCache = new _Cache(this.oRequestor, "/BusinessPartnerList", defaultFetchType, {}),
				oCacheMock = this.mock(oCache),
				sETag = 'W/"19700101000000.0000000"',
				oEntity = {
					"@odata.etag" : sETag,
					"Address" : {
						"City" : "Heidelberg"
					}
				},
				fnError = sinon.spy(),
				oError = new Error(),
				oPatchPromise = Promise.reject(oError),
				oUpdateData = {
					"Address" : {
						"City" : "Walldorf"
					}
				};

			oCache.fetchValue = function () {};
			oCacheMock.expects("fetchValue")
				.withExactArgs(sGroupId, "path/to/entity").returns(_SyncPromise.resolve(oEntity));
			this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/BusinessPartnerList('0')", sGroupId, {
						"If-Match" : sETag
					}, oUpdateData, undefined, sinon.match.func)
				.returns(oPatchPromise);

			// code under test
			return oCache.update(sGroupId, "Address/City", "Walldorf", fnError,
					"/BusinessPartnerList('0')", "path/to/entity")
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
		var oCache = new _Cache(this.oRequestor, "/BusinessPartnerList", defaultFetchType, {});

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs("groupId", "path/to/entity").returns(_SyncPromise.resolve(undefined));

		return oCache.update(
			"groupId", "foo", "bar", sinon.spy(), "/BusinessPartnerList('0')", "path/to/entity"
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
			"TEAMS('42')" : {$Key : ["TeamId"]}
		}
	}, {
		options : {$select : ["foo"]},
		types : {
			"TEAMS('42')" : {$Key : ["TeamId"]}
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
				}
			}
		},
		types : {
			"TEAMS('42')" : {$Key : ["TeamId"]},
			"TEAMS('42')/MANAGER" : {$Key : ["ManagerId"]},
			"TEAMS('42')/TEAM_2_EMPLOYEES" : {$Key : ["EmployeeId"]},
			"TEAMS('42')/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT" : {$Key : ["EquipmentId"]},
			"TEAMS('42')/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT" :
				{$Key : ["ProductId"]},
			"TEAMS('42')/TEAM_2_EMPLOYEES/Address" : {$kind : "ComplexType"},
			"TEAMS('42')/TEAM_2_EMPLOYEES/Address/Country" : {$Key : ["CountryId"]}
		}
	}].forEach(function (oFixture) {
		QUnit.test("Cache#fetchTypes", function (assert) {
			var oBinding = {
					fetchType : function () {}
				},
				oBindingMock = this.mock(oBinding),
				oCache,
				oPromise;

			Object.keys(oFixture.types).forEach(function (sPath) {
				oBindingMock.expects("fetchType").withExactArgs(sPath)
					.returns(Promise.resolve(oFixture.types[sPath]));
				if (!oFixture.types[sPath].$Key) {// expect it in the result only if it has a $Key
					delete oFixture.types[sPath];
				}
			});
			// create after the mocks have been set up, otherwise they won't be called
			oCache = new _Cache(this.oRequestor, "TEAMS('42')", oBinding.fetchType,
					oFixture.options);

			// code under test
			oPromise = oCache.fetchTypes();
			assert.strictEqual(oCache.fetchTypes(), oPromise, "second call returns same promise");
			return oPromise.then(function (mTypeForPath) {
				assert.deepEqual(mTypeForPath, oFixture.types);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: no entity", function (assert) {
		var sResourcePath = "~foo~",
			oCache = new _Cache(this.oRequestor, sResourcePath),
			oEntity = {};

		// code under test
		oCache.calculateKeyPredicates(oEntity, {});

		assert.strictEqual(oEntity["@$ui5.predicate"], undefined);
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: simple entity", function (assert) {
		var sResourcePath = "~foo~",
			oCache = new _Cache(this.oRequestor, sResourcePath),
			oEntity = {},
			sPredicate = "(predicate='4711')",
			mTypeForPath = {"~foo~" : {}};

		this.mock(_Helper).expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~"]), sinon.match.same(oEntity), true)
			.returns(sPredicate);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForPath);

		assert.strictEqual(oEntity["@$ui5.predicate"], sPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: nested entities", function (assert) {
		var sResourcePath = "~foo~",
			oCache = new _Cache(this.oRequestor, sResourcePath),
			oEntity = {
				bar : {
					baz : {}
				},
				no : 4,
				qux : null
			},
			oHelperMock = this.mock(_Helper),
			sPredicate1 = "(foo='4711')",
			sPredicate2 = "(bar='42')",
			sPredicate3 = "(baz='67')",
			mTypeForPath = {
				"~foo~" : {},
				"~foo~/bar" : {},
				"~foo~/bar/baz" : {},
				"~foo~/qux" : {}
			};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~"]), sinon.match.same(oEntity), true)
			.returns(sPredicate1);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~/bar"]),
				sinon.match.same(oEntity.bar), true)
			.returns(sPredicate2);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~/bar/baz"]),
				sinon.match.same(oEntity.bar.baz), true)
			.returns(sPredicate3);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForPath);

		assert.strictEqual(oEntity["@$ui5.predicate"], sPredicate1);
		assert.strictEqual(oEntity.bar["@$ui5.predicate"], sPredicate2);
		assert.strictEqual(oEntity.bar.baz["@$ui5.predicate"], sPredicate3);
	});

	//*********************************************************************************************
	QUnit.test("Cache#calculateKeyPredicates: entity collection", function (assert) {
		var sResourcePath = "~foo~",
			oCache = new _Cache(this.oRequestor, sResourcePath),
			oEntity = {
				bar : [{}, {}]
			},
			oHelperMock = this.mock(_Helper),
			sPredicate1 = "(foo='4711')",
			sPredicate2 = "(bar='42')",
			mTypeForPath = {
				"~foo~" : {},
				"~foo~/bar" : {}
			};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~"]), sinon.match.same(oEntity), true)
			.returns(sPredicate1);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~/bar"]),
				sinon.match.same(oEntity.bar[0]), true)
			.returns(sPredicate2);
		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(mTypeForPath["~foo~/bar"]),
				sinon.match.same(oEntity.bar[1]), true)
			.returns(undefined);

		// code under test
		oCache.calculateKeyPredicates(oEntity, mTypeForPath);

		assert.strictEqual(oEntity["@$ui5.predicate"], sPredicate1);
		assert.strictEqual(oEntity.bar[0]["@$ui5.predicate"], sPredicate2);
		assert.strictEqual(oEntity.bar[1]["@$ui5.predicate"], undefined);
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
				mTypeForPath = oFixture.types ? {
					"Employees" : {
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
				.returns(Promise.resolve(mTypeForPath));

			// code under test
			oPromise = oCache.read(oFixture.index, oFixture.length, "group");

			assert.ok(!oPromise.isFulfilled());
			assert.ok(!oPromise.isRejected());
			return oPromise.then(function (oResult) {
				var oExpectedResult = {
						"@odata.context" : "$metadata#TEAMS",
						value : oFixture.result
					};

				if (oFixture.types) {
					oFixture.result.forEach(function (oItem) {
						oItem["@$ui5.predicate"] = "('" + oItem.key + "')";
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
							oCache.aElements.$byPredicate[oItem["@$ui5.predicate"]],
							oCache.aElements[oFixture.index + i]);
					});
				} else {
					assert.notOk(undefined in oCache.aElements.$byPredicate);
				}

				// ensure that the same read does not trigger another request
				return oCache.read(oFixture.index, oFixture.length).then(function (oResult) {
					assert.deepEqual(oResult, oExpectedResult);
					assert.strictEqual(oResult.value.$count, oFixture.count);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue", function (assert) {
		var oCache = _Cache.create(this.oRequestor),
			oCacheMock = this.mock(oCache),
			fnDataRequested = {},
			oListener = {},
			oResult;

		oCacheMock.expects("checkActive");
		oCacheMock.expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "").returns("elements");

		// code under test
		assert.strictEqual(oCache.fetchValue("group", "").getResult(), "elements");

		oCacheMock.expects("registerChange")
			.withExactArgs("42/foo/bar", sinon.match.same(oListener));
		oCacheMock.expects("read")
			.withExactArgs(42, 1, "group", sinon.match.same(fnDataRequested))
			.returns(_SyncPromise.resolve(Promise.resolve([{}])));
		oCacheMock.expects("checkActive");
		oCacheMock.expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "42/foo/bar").returns("baz");

		// code under test
		oResult = oCache.fetchValue("group", "42/foo/bar", fnDataRequested, oListener);

		assert.strictEqual(oResult.isFulfilled(), false);
		return oResult.then(function (vValue) {
			assert.strictEqual(vValue, "baz");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read(-1, 1) w/o create", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.oRequestorMock.expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(-1, 1);
		}, new Error("Illegal index -1, must be >= 0"));

		oCache.aElements[-1] = {}; // mock a transient entity

		// code under test
		assert.throws(function () {
			oCache.read(-2, 1);
		}, new Error("Illegal index -2, must be >= -1"));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read(1, -1)", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.oRequestorMock.expects("request").never();

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
				fnDataRequested = sinon.spy(),
				oPromise = Promise.resolve(),
				that = this;

			oFixture.expectedRequests.forEach(function (oRequest, i) {
				that.mockRequest(sResourcePath, oRequest.skip, oRequest.top,
					i < 2 ? fnDataRequested : undefined);
			});

			oFixture.reads.forEach(function (oRead) {
				oPromise = oPromise.then(function () {
					return oCache.read(oRead.index, oRead.length, undefined, fnDataRequested)
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
				fnDataRequested = sinon.spy(),
				aPromises = [],
				that = this;

			oFixture.expectedRequests.forEach(function (oRequest, i) {
				that.mockRequest(sResourcePath, oRequest.skip, oRequest.top,
					i < 2 ? fnDataRequested : undefined);
			});

			oFixture.reads.forEach(function (oRead) {
				aPromises.push(oCache.read(oRead.index, oRead.length, undefined, fnDataRequested)
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
			oCache.read(0, 30).then(function (oResult) {
				var oExpectedResult = createResult(0, 26);

				oExpectedResult.value.$count = 26;
				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, 26);
			}),
			oCache.read(30, 1).then(function (oResult) {
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

			return oCache.read(10, bCount ? 30 : 10).then(function (oResult) {
				var oExpectedResult = createResult(10, bCount ? 16 : 10);

				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, bCount ? 26 : undefined);

				return oCache.read(5, 3).then(function (oResult) {
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
			that = this;

		this.mockRequest(sResourcePath,0, 10, undefined, "26");

		return oCache.read(0, 10).then(function (oResult) {
			assert.strictEqual(oCache.aElements.$count, 26);
			assert.strictEqual(oResult.value.$count, 26);

			that.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", "$direct", null, sinon.match.object,
					sinon.match.func, sinon.match.func)
				.returns(Promise.resolve({}));
			return oCache.create("$direct", "Employees", "").then(function () {
				assert.strictEqual(oCache.read(0, 10).getResult().value.$count, 27,
					"now including the created element");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & delete, top level", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			that = this;

		this.oRequestorMock.expects("request").withArgs("GET")
			.returns(Promise.resolve({
				"@odata.count" : "26",
				"value" : [{}, {}, {}, {}, {}]
			}));

		return oCache.read(0, 5).then(function (oResult) {
			that.oRequestorMock.expects("request").withArgs("DELETE").returns(Promise.resolve());
			that.spy(_Helper, "updateCache");
			return oCache._delete("group", "Employees('42')", "3", function () {})
				.then(function () {
					assert.strictEqual(oCache.read(0, 4).getResult().value.$count, 25);
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
			aList = [{}, {}, {}],
			that = this;

		this.oRequestorMock.expects("request").withArgs("GET")
			.returns(Promise.resolve({
				"value" : [{
					"list" : aList,
					"list@odata.count" : "26"
				}]
			}));

		return oCache.read(0, 5).then(function (oResult) {
			that.oRequestorMock.expects("request").withArgs("DELETE").returns(Promise.resolve());
			that.spy(_Helper, "updateCache");
			return oCache._delete("group", "Employees('42')", "0/list/1", function () {})
				.then(function () {
					assert.strictEqual(
						oCache.fetchValue("group", "0/list").getResult().$count, 25);
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

		oCache.read(0, 10);

		// code under test: wait until request is finished, do not fire to listener
		return oCache.fetchValue("group", "$count", undefined, oListener).then(function (iCount) {
			assert.strictEqual(iCount, 26);

			// code under test: now it must be delivered synchronously
			assert.strictEqual(oCache.fetchValue(undefined, "$count").getResult(), 26);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: Promise as vPostPath", function (assert) {
		var oCache = new _Cache(this.oRequestor),
			oPostPathPromise = _SyncPromise.resolve("TEAMS");

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs("$cached", "")
			.returns(_SyncPromise.resolve([]));
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "TEAMS", "updateGroup", null, /*oPayload*/sinon.match.object,
				/*fnSubmit*/sinon.match.func, /*fnCancel*/sinon.match.func)
			.returns(_SyncPromise.resolve({}));

		// code under test
		return oCache.create("updateGroup", oPostPathPromise, "", {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: with given sPath", function (assert) {
		var oBody,
			oCache = new _Cache(this.oRequestor),
			oCacheDataForParent = {
				TEAM_2_EMPLOYEES : []
			},
			oCacheMock = this.mock(oCache),
			oCountChangeListener = {onChange : sinon.spy()},
			oCreatePromise,
			oIdChangeListener = {onChange : sinon.spy()},
			sPathInCache = "0/TEAM_2_EMPLOYEES",
			oPostPathPromise = _SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES");

		oCache.fetchValue = function () {};
		oCacheDataForParent.TEAM_2_EMPLOYEES.$count = 0;
		oCacheMock.expects("fetchValue")
			.withExactArgs("$cached", "0")
			.returns(_SyncPromise.resolve(oCacheDataForParent));
		sinon.spy(oCache, "addByPath");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", "updateGroup", null,
				sinon.match(function (oPayload) {
					oBody = oPayload;
					return true;
				}), /*fnSubmit*/sinon.match.func,
				/*fnCancel*/sinon.match.func)
			.returns(_SyncPromise.resolve(Promise.resolve({
				ID : "7",
				Name : "John Doe"
			})));

		// code under test
		oCreatePromise = oCache.create("updateGroup", oPostPathPromise, sPathInCache,
			{ID : "", Name : "John Doe"});

		// initial data is synchronously available
		assert.strictEqual(oCacheDataForParent.TEAM_2_EMPLOYEES[-1].Name, "John Doe");
		assert.strictEqual(oCacheDataForParent.TEAM_2_EMPLOYEES[-1].ID, "");
		assert.strictEqual(oCacheDataForParent.TEAM_2_EMPLOYEES.$count, 0);

		// request is added to mPostRequests
		sinon.assert.calledWithExactly(oCache.addByPath, oCache.mPostRequests, sPathInCache, oBody);

		oCache.registerChange(sPathInCache + "/-1/Name", function () {
			assert.notOk(true, "No change event for Name");
		});
		oCache.registerChange(sPathInCache + "/-1/ID", oIdChangeListener);
		oCache.registerChange(sPathInCache + "/$count", oCountChangeListener);
		sinon.spy(oCache, "removeByPath");
		return oCreatePromise.then(function () {
			assert.strictEqual(oCacheDataForParent.TEAM_2_EMPLOYEES[-1].ID, "7", "from Server");
			assert.strictEqual(oIdChangeListener.onChange.callCount, 1);
			assert.strictEqual(oCacheDataForParent.TEAM_2_EMPLOYEES.$count, 1);
			assert.strictEqual(oCountChangeListener.onChange.callCount, 1);
			sinon.assert.calledWithExactly(oCache.removeByPath, oCache.mPostRequests, sPathInCache,
				oBody);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#create: with given sPath and delete before submit", function (assert) {
		var oBody,
			// real requestor to avoid reimplementing callback handling of _Requestor.request
			oRequestor = _Requestor.create("/~/"),
			oCache = new _Cache(oRequestor),
			oCacheDataForParent = {
				TEAM_2_EMPLOYEES : []
			},
			oCacheMock = this.mock(oCache),
			fnCancelCallback = sinon.spy(),
			oCreatePromise,
			fnDeleteCallback = sinon.spy(),
			sPathInCache = "0/TEAM_2_EMPLOYEES",
			oPostPathPromise = _SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES");

		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs("$cached", "0")
			.returns(_SyncPromise.resolve(oCacheDataForParent));
		sinon.spy(oCache, "addByPath");
		sinon.spy(oRequestor, "request");

		// code under test
		oCreatePromise = oCache.create("updateGroup", oPostPathPromise, sPathInCache,
			{ID : "", Name : "John Doe"}, fnCancelCallback);

		sinon.assert.calledWithExactly(oRequestor.request, "POST", "TEAMS('0')/TEAM_2_EMPLOYEES",
			"updateGroup", null, /*oPayload*/sinon.match.object, /*fnSubmit*/sinon.match.func,
			/*fnCancel*/sinon.match.func);
		oBody = oRequestor.request.args[0][4];
		// request is added to mPostRequests
		sinon.assert.calledWithExactly(oCache.addByPath, oCache.mPostRequests, sPathInCache, oBody);
		sinon.spy(oCache, "removeByPath");

		oCacheMock.expects("fetchValue")
			.withExactArgs("updateGroup", sPathInCache)
			.returns(_SyncPromise.resolve(oCacheDataForParent.TEAM_2_EMPLOYEES));

		// code under test
		oCache._delete("updateGroup",  "TEAMS('0')/TEAM_2_EMPLOYEES", sPathInCache + "/-1",
			fnDeleteCallback);

		sinon.assert.calledWithExactly(oCache.removeByPath, oCache.mPostRequests, sPathInCache,
			oBody);
		return oCreatePromise.then(function () {
			assert.notOk(true, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.canceled, true);
		});
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function(oCacheData, i) {
		QUnit.test("_Cache#create: allowed for collections only - " + i, function (assert) {
			var oCache = new _Cache(this.oRequestor),
				sPathInCache = "0/TEAM_2_MANAGER";

			oCache.fetchValue = function () {};
			this.mock(oCache).expects("fetchValue")
				.withExactArgs("$cached", "0")
				.returns(_SyncPromise.resolve({TEAM_2_MANAGER : oCacheData}));

			// code under test
			assert.throws(function () {
				oCache.create("updateGroup", "TEAMS('01')/TEAM_2_MANAGER", sPathInCache, {});
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
			.withExactArgs(sinon.match.same(mQueryParams), false, false)
			.returns(sQueryParams);

		oCache = this.createCache(sResourcePath, mQueryParams, false);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + sQueryParams + "&$skip=0&$top=5", undefined,
				undefined, undefined, undefined)
			.returns(Promise.resolve({value: []}));

		// code under test
		mQueryParams.$select = "foo"; // modification must not affect cache
		return oCache.read(0, 5);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: error handling", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oError = {},
			oSuccess = createResult(0, 5);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined, undefined,
				undefined, undefined)
			.returns(Promise.reject(oError));
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5", undefined, undefined,
				undefined, undefined)
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
	QUnit.test("CollectionCache: create entity and has pending changes", function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oEntityData = {name : "John Doe"},
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
			.withExactArgs(sinon.match.same(mQueryOptions), true)
			.returns("?foo=bar");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees?foo=bar", "updateGroup", null,
				sinon.match(transientCacheData), sinon.match.func, sinon.match.func)
			.returns(Promise.resolve(oPostResult));
		// called from update
		oHelperMock.expects("updateCache")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "-1",
				sinon.match(transientCacheData), {bar : "baz"});
		// called from the POST's success handler
		oHelperMock.expects("getSelectForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "")
			.returns(aSelect);
		oHelperMock.expects("updateCacheAfterPost")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "-1",
				sinon.match(transientCacheData), sinon.match.same(oPostResult),
				sinon.match.same(aSelect));

		// code under test
		oPostPromise = oCache.create("updateGroup", "Employees", "", oEntityData);

		assert.strictEqual(oCache.hasPendingChangesForPath(""), true, "pending changes for root");
		assert.strictEqual(oCache.hasPendingChangesForPath("foo"), false,
			"pending changes for non-root");

		assert.notStrictEqual(oCache.aElements[-1], oEntityData, "'create' copies initial data");
		assert.deepEqual(oCache.aElements[-1], {
			name : "John Doe",
			"@$ui5.transient" : "updateGroup"
		});

		// code under test
		oPatchPromise1 = oCache.update("updateGroup", "bar", "baz", sinon.spy(), "n/a", "-1");
		oPatchPromise2 = oCache.update("anotherGroup", "bar", "qux", sinon.spy(), "n/a", "-1");
		oReadPromise = oCache.read(-1, 1);

		return Promise.all([
			oPatchPromise1.then(), // check that update returned a promise
			oPatchPromise2.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, "The entity will be created via group "
					+ "'updateGroup'. Cannot patch via group 'anotherGroup'");
			}),
			oPostPromise.then(function () {
				assert.notOk("@$ui5.transient" in oCache.aElements[-1]);
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
		var oCache = this.createCache("Employees"),
			oCreatePromise,
			oError = new Error(),
			fnErrorCallback = sinon.spy(),
			oFailedPostPromise,
			fnRejectPost,
			oRequestExpectation1,
			oRequestExpectation2,
			fnResolvePost,
			that = this;

		function checkUpdateAndDeleteFailure() {
			// code under test
			oCache.update("updateGroup", "foo", "baz", sinon.spy(), "n/a", "-1").then(function () {
				assert.ok(false, "unexpected success - update");
			}, function (oError) {
				assert.strictEqual(oError.message,
					"No 'update' allowed while waiting for server response",
					oError.message);

			});
			oCache._delete("updateGroup", "n/a", "-1").then(function () {
				assert.ok(false, "unexpected success - _delete");
			}, function (oError) {
				assert.strictEqual(oError.message,
					"No 'delete' allowed while waiting for server response",
					oError.message);

			});
		}

		function checkUpdateSuccess(sWhen) {
			// code under test
			return oCache.update("updateGroup", "foo", sWhen, sinon.spy(), "Employees", "-1")
				.then(function () {
					assert.ok(true, "Update works " + sWhen);
					assert.strictEqual(oCache.aElements[-1]["@$ui5.transient"], "updateGroup");
				});
		}

		oRequestExpectation1 = this.oRequestorMock.expects("request");
		oRequestExpectation1.withExactArgs("POST", "Employees", "updateGroup", null,
				sinon.match.object, sinon.match.func, sinon.match.func)
			.returns(oFailedPostPromise = new Promise(function (resolve, reject) {
				fnRejectPost = reject;
			}));

		oCreatePromise = oCache.create("updateGroup", "Employees", "", {}, undefined,
			fnErrorCallback);

		checkUpdateSuccess("before submitBatch").then(function () {
			oRequestExpectation2 = that.oRequestorMock.expects("request");
			// immediately add the POST request again into queue
			oRequestExpectation2.withExactArgs("POST", "Employees", "updateGroup", null,
					sinon.match.object, sinon.match.func, sinon.match.func)
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
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "Employees", "updateGroup",
					{"If-Match" : undefined}, {foo : "baz2"}, undefined,
					sinon.match.func)
				.returns(Promise.resolve({}));

			// code under test
			return oCache.update("updateGroup", "foo", "baz2", sinon.spy(), "Employees", "-1");
		});
	});

	//*********************************************************************************************
	["$direct", "$auto"].forEach(function (sUpdateGroupId) {
		QUnit.test("CollectionCache#create: relocate on failed POST for " + sUpdateGroupId,
				function (assert) {
			var oCache = this.createCache("Employees"),
				oFailedPostPromise = Promise.reject(new Error()),
				that = this;

			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", sUpdateGroupId, null, sinon.match.object,
					sinon.match.func, sinon.match.func)
				.returns(oFailedPostPromise);

			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", "$parked." + sUpdateGroupId, null,
					sinon.match.object, sinon.match.func, sinon.match.func)
				.returns(Promise.resolve({Name: "John Doe", Age: 47}));

			// code under test
			oCache.create(sUpdateGroupId, "Employees", "", {Name: null});

			return oFailedPostPromise.then(undefined, function () {
				var aPromises = [],
					sWrongGroupId = sUpdateGroupId === "$direct" ? "$auto" : "$direct";

				// code under test - try to update via wrong $direct/auto group
				aPromises.push(oCache.update(sWrongGroupId, "Name", "John Doe", sinon.spy(), "n/a",
						"-1")
					.then(undefined, function(oError) {
						assert.strictEqual(oError.message, "The entity will be created via group '"
							+ sUpdateGroupId + "'. Cannot patch via group '" + sWrongGroupId + "'");
					}));

				that.oRequestorMock.expects("relocate")
					.withExactArgs("$parked." + sUpdateGroupId, oCache.aElements[-1],
						sUpdateGroupId);

				// code under test - first update -> relocate
				aPromises.push(oCache.update(sUpdateGroupId, "Name", "John Doe", sinon.spy(), "n/a",
					"-1"));

				// code under test - second update -> do not relocate again
				aPromises.push(oCache.update(sUpdateGroupId, "Name", "John Doe1", sinon.spy(),
					"n/a", "-1"));

				return Promise.all(aPromises);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity without initial data", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees");

		// code under test
		oCache.create("updateGroup", "Employees", "");

		assert.deepEqual(oCache.aElements[-1], {
			"@$ui5.transient" : "updateGroup"
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity, canceled", function (assert) {
		var oCache = this.createCache("Employees"),
			oCanceledError = new Error(),
			bFnCancelCallbackCalled = false;

		oCanceledError.canceled = true;

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", "updateGroup", null, sinon.match.object,
				sinon.match.func, sinon.match.func)
			.callsArg(6)
			.returns(Promise.reject(oCanceledError));

		// code under test
		return oCache.create("updateGroup", "Employees", "", undefined, function () {
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
			oReadResult = {value : [{}, {}]};

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", "updateGroup", null, sinon.match.object,
				sinon.match.func, sinon.match.func)
			.returns(new Promise(function () {})); // never resolve
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=0&$top=2", "$direct", undefined,
				undefined, undefined)
			.returns(Promise.resolve(oReadResult));

		oCache.create("updateGroup", "Employees", "", oEntityData);

		// code under test
		return oCache.read(-1, 3, "$direct").then(function (oResult) {
			assert.strictEqual(oResult.value.length, 3);
			assert.ok(oResult.value[0]["@$ui5.transient"]);
			assert.strictEqual(oResult.value[1], oReadResult.value[0]);
			assert.strictEqual(oResult.value[2], oReadResult.value[1]);

			// code under test
			oResult = oCache.read(-1, 1, "$direct").getResult();
			assert.strictEqual(oResult.value.length, 1);
			assert.strictEqual(oResult.value[0].name, "John Doe");

			// code under test
			oResult = oCache.fetchValue("$direct", "-1/name").getResult();
			assert.strictEqual(oResult, "John Doe");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create and delete transient entry", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/"),
			oCache = _Cache.create(oRequestor, "Employees"),
			fnCancelCallback = sinon.spy(),
			oDeletePromise,
			oTransientElement;

		this.spy(oRequestor, "request");

		oCache.create("updateGroup", "Employees", "", {}, fnCancelCallback)
			.catch(function (oError) {
				assert.ok(oError.canceled);
			});

		assert.ok(-1 in oCache.aElements);
		oTransientElement = oCache.aElements[-1];

		sinon.assert.calledWithExactly(oRequestor.request, "POST", "Employees", "updateGroup", null,
			sinon.match.object, sinon.match.func, sinon.match.func);
		this.spy(oRequestor, "removePost");
		this.spy(_Helper, "updateCache");

		// code under test
		oDeletePromise = oCache._delete("$auto", "n/a", "-1", function () {
			throw new Error();
		});

		sinon.assert.calledWithExactly(oRequestor.removePost, "updateGroup",
			sinon.match(function (oParameter) {
				return oParameter === oTransientElement;
			}));
		sinon.assert.calledOnce(fnCancelCallback);
		assert.notOk(-1 in oCache.aElements);

		// wait for delete promise to see potential asynchronous errors
		return oDeletePromise;
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: delete created entity", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/"),
			oCache = _Cache.create(oRequestor, "Employees"),
			fnCallback = sinon.spy(),
			oCreatedPromise,
			oEntity = {EmployeeId: "4711", "@odata.etag" : "anyEtag"},
			sGroupId = "updateGroup",
			that = this;


		oCreatedPromise = oCache.create(sGroupId, "Employees", "", {}, function () {
			throw new Error();
		});

		// simulate submitBatch
		oRequestor.mBatchQueue[sGroupId][0][0].$resolve(oEntity);

		return oCreatedPromise.then(function () {
			that.mock(oRequestor).expects("request")
				.withExactArgs("DELETE", "/Employees('4711')", "$auto",
					{"If-Match" : "anyEtag"})
				.returns(Promise.resolve());

			// code under test
			return oCache._delete("$auto", "/Employees('4711')", "-1", fnCallback)
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
			oListener1 = {},
			oListener2 = {},
			mQueryParams = {},
			sResourcePath = "Employees('1')",
			mTypeForPath = {},
			that = this;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sinon.match.same(mQueryParams), false, true).returns("?~");
		this.mock(_Cache.prototype).expects("fetchTypes")
			.returns(Promise.resolve(mTypeForPath));

		oCache = _Cache.createSingle(this.oRequestor, sResourcePath, defaultFetchType, mQueryParams,
			true);
		oCacheMock = this.mock(oCache);

		oCacheMock.expects("registerChange").withExactArgs(undefined, sinon.match.same(oListener1));
		oCacheMock.expects("registerChange").withExactArgs("foo", sinon.match.same(oListener2));
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", "group", undefined, undefined,
				sinon.match.same(fnDataRequested1))
			.returns(Promise.resolve(oExpectedResult).then(function () {
					that.mock(oCache).expects("calculateKeyPredicates")
						.withExactArgs(oExpectedResult, mTypeForPath);
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
		return Promise.all([
			oCache.fetchValue("group", undefined, fnDataRequested1, oListener1)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
				}),
			oCache.fetchValue("group", "foo", fnDataRequested2, oListener2)
				.then(function (oResult) {
					assert.strictEqual(oResult, "bar");
				})
		]);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#post", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath),
			fnDataRequested = sinon.spy(),
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
			sResourcePath = "Employees";

		this.oRequestorMock.expects("buildQueryString").returns("?foo=bar");
		oCache = new _Cache(this.oRequestor, sResourcePath);

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
			.withExactArgs("GET", sResourcePath, "groupId", undefined, undefined, undefined)
			.returns(oPromise);
		// fill the cache
		return oCache.fetchValue("groupId").then(function () {
			var oUpdatePromise;

			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, "updateGroupId", {"If-Match" : sETag},
					{Note : "foo"}, undefined, sinon.match.func)
				.returns(oPatchPromise1);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, "$direct", {"If-Match" : sETag},
					{Note : "bar"}, undefined, sinon.match.func)
				.returns(oPatchPromise2);

			// code under test
			oUpdatePromise = Promise.all([
				oCache.update("updateGroupId", "Note", "foo", sinon.spy(), sResourcePath),
				oCache.update("$direct", "Note", "bar", sinon.spy(), sResourcePath)
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
			.withExactArgs("GET", sResourcePath, "groupId", undefined, undefined, undefined)
			.returns(oPromise);
		// fill the cache and register a listener
		return oCache.fetchValue("groupId", "Note").then(function () {
			var aUpdatePromises;

			assert.strictEqual(oCache.hasPendingChangesForPath(""), false);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, "updateGroupId", {"If-Match" : sETag},
					{Note : "foo"}, undefined, sinon.match.func)
				.returns(oPatchPromise1);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, "updateGroupId", {"If-Match" : sETag},
					{Foo : "baz"}, undefined, sinon.match.func)
				.returns(oPatchPromise2);
			that.oRequestorMock.expects("removePatch")
				.withExactArgs(sinon.match.same(oPatchPromise1));
			that.oRequestorMock.expects("removePatch")
				.withExactArgs(sinon.match.same(oPatchPromise2));

			// code under test
			aUpdatePromises = [
				oCache.update("updateGroupId", "Note", "foo", sinon.spy(), sResourcePath)
					.then(unexpected, rejected),
				oCache.update("updateGroupId", "Foo", "baz", sinon.spy(), sResourcePath)
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
		var sResourcePath = "/SalesOrderList(SalesOrderID='0')",
			oCache = this.createSingle(sResourcePath),
			sEditUrl = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oReadResult = {};

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, "groupId", undefined, undefined, undefined)
			.returns(Promise.resolve(oReadResult));
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oReadResult), "invalid/path").returns(undefined);

		return oCache.update("groupId", "foo", "bar", sEditUrl, sinon.spy(), "invalid/path")
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
			.withExactArgs("GET", "Employees('42')", "groupId", undefined, undefined, undefined)
			.returns(Promise.resolve(oData));

		return oCache.fetchValue("groupId").then(function () {
			var fnCallback = sinon.spy();

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
			oListener1 = {},
			oListener2 = {},
			mQueryParams = {},
			sResourcePath = "Employees('1')";

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sinon.match.same(mQueryParams), false, undefined).returns("?~");

		oCache = _Cache.createProperty(this.oRequestor, sResourcePath, mQueryParams);
		oCacheMock = this.mock(oCache);

		oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener1));
		oCacheMock.expects("registerChange").withExactArgs("", sinon.match.same(oListener2));
		oCacheMock.expects("registerChange").withExactArgs("", undefined);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", "group", undefined, undefined,
				sinon.match.same(fnDataRequested1))
			.returns(Promise.resolve().then(function () {
					oCacheMock.expects("checkActive").exactly(3);
					return {value : oExpectedResult};
				}));

		return Promise.all([
			oCache.fetchValue("group", "", fnDataRequested1, oListener1)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);

					assert.strictEqual(oCache.fetchValue("group", "").getResult(), oExpectedResult);
				}),
			oCache.fetchValue("group", "", fnDataRequested2, oListener2)
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
				})
		]);
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
				"null" : null
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
		return oCache.read(0, 3, "group").then(function () {
			assert.strictEqual(oCache.aElements[0], oValue0);
			assert.strictEqual(oCache.aElements[1], oValue1);
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
					"/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/")),
				sResourcePath = "TEAMS('TEAM_01')",
				oCache = _Cache.createSingle(oRequestor, sResourcePath, defaultFetchType);

			return oCache.fetchValue().then(function (oResult) {
				assert.deepEqual(oResult, oExpectedResult);
			});
		});
	}
});
//TODO: resetCache if error in update?
// TODO we cannot update a single property with value null, because the read delivers "204 No
//      Content" and no oResult. Hence we do not have the ETag et al.
//TODO key predicate calculation in the result of operations?
