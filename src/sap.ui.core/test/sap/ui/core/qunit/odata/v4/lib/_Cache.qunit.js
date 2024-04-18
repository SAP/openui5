/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_Parser",
	"sap/ui/model/odata/v4/lib/_Requestor"
], function (Log, SyncPromise, ODataUtils, _Cache, _GroupLock, _Helper, _Parser, _Requestor) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._Cache",
		aTestData = "abcdefghijklmnopqrstuvwxyz".split("");

	/**
	 * Simulates an OData server response, limited to 26 items.
	 * @param {number} iIndex The index of the first item
	 * @param {number} iLength The length of the response
	 * @param {string|number} [vCount] The value for "@odata.count"
	 * @param {boolean} [bPredicates] Whether the result contains the key predicates
	 * @returns {object} A server response object
	 */
	function createResult(iIndex, iLength, vCount, bPredicates) {
		var oResult = {
				"@odata.context" : "$metadata#TEAMS",
				value : aTestData.slice(iIndex, iIndex + iLength).map(function (s) {
					return bPredicates
						? {key : s, "@$ui5._" : {predicate : "('" + s + "')"}}
						: {key : s};
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
	function defaultGetGroupProperty(sGroupId) {
		if (sGroupId === "$direct") {
			return "Direct";
		}
		if (sGroupId === "$auto") {
			return "Auto";
		}
		return "API";
	}

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._Cache", {
		beforeEach : function () {
			var oModelInterface = {
					fetchMetadata : function () {
						return SyncPromise.resolve(null);
					},
					fireDataReceived : function () {},
					fireDataRequested : function () {},
					getMessagesByPath : function () { return []; },
					reportStateMessages : function () {},
					updateMessages : function () {}
				};

			this.oModelInterfaceMock = this.mock(oModelInterface);
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			this.oRequestor = {
				buildQueryString : function () { return ""; },
				fetchType : function (mTypeForMetaPath, sMetaPath) {
					var oType = {
						$Key : ["key"],
						key : {$Type : "Edm.String"}
					};

					mTypeForMetaPath[sMetaPath] = oType;
					return SyncPromise.resolve(oType);
				},
				getGroupSubmitMode : function (sGroupId) {
					return defaultGetGroupProperty(sGroupId);
				},
				getModelInterface : function () {
					return oModelInterface;
				},
				getServiceUrl : function () { return "/~/"; },
				getUnlockedAutoCopy : function () {},
				hasChanges : function () {},
				isActionBodyOptional : function () {},
				lockGroup : function () { throw new Error("lockGroup mock missing"); },
				relocate : function () {},
				relocateAll : function () {},
				removeChangeRequest : function () {},
				removePost : function () {},
				reportTransitionMessages : function () {},
				request : function () {},
				waitForBatchResponseReceived : function () {}
			};
			this.oRequestorMock = this.mock(this.oRequestor);
		},

		/**
		 * Creates a collection cache. Only resource path and query options must be supplied. Uses
		 * this.oRequestor, does not sort query options.
		 *
		 * @param {string} sResourcePath The resource path
		 * @param {object} [mQueryOptions] The query options
		 * @param {string} [sDeepResourcePath] The deep resource path
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createCache : function (sResourcePath, mQueryOptions, sDeepResourcePath) {
			return _Cache.create(this.oRequestor, sResourcePath, mQueryOptions, false,
					sDeepResourcePath);
		},

		/**
		 * Calls CollectionCache#read after mocking the corresponding request. The response is
		 * limited to 26 items.
		 *
		 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache The collection cache
		 * @param {number} iStartOffset The start offset to compute the index within the cache
		 * @param {string} sUrl The service URL
		 * @param {number} iStart The index of the first item of the response ($skip)
		 * @param {number} iLength The length of the request ($top)
		 * @param {number} [iResponseLength=iLength] The number of entities in the response
		 * @param {function} [fnSubmit] The submit function of the request call
		 * @param {string|number} [vCount] The value for "@odata.count"
		 * @returns {Promise} A promise on the server response object
		 */
		mockRequestAndRead : function (oCache, iStartOffset, sUrl, iStart, iLength,
				iResponseLength, fnSubmit, vCount) {
			var oReadGroupLock = {
					getGroupId : function () { return "unrelated"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oPromise = Promise.resolve(createResult(iStart,
					iResponseLength !== undefined ? iResponseLength : iLength, vCount)),
				oUnlockedCopy = {
					getGroupId : function () { return "group"; }
				};

			this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy);
			this.mock(oReadGroupLock).expects("unlock").withExactArgs();

			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sUrl + "?$skip=" + iStart + "&$top=" + iLength,
					sinon.match.same(oUnlockedCopy), /*mHeaders*/undefined, /*oPayload*/undefined,
					fnSubmit)
				.returns(oPromise);

			return oCache.read(iStartOffset + iStart, iLength, 0, oReadGroupLock);
		},

		/**
		 * Creates a single cache. Only resource path must be supplied. Uses this.oRequestor, does
		 * not calculate key predicates, does not sort query options.
		 *
		 * @param {string} sResourcePath The resource path
		 * @param {object} [mQueryOptions] The query options.
		 * @param {boolean} [bPost] Whether the cache uses POST requests.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createSingle : function (sResourcePath, mQueryOptions, bPost) {
			return _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions,
				/*bSortExpandSelect*/false, /*bSharedRequest*/false,
				/*sOriginalResourcePath*/undefined, bPost);
		}
	});

	//*********************************************************************************************
	QUnit.test("_Cache basics", function (assert) {
		var mQueryOptions = {},
			sResourcePath = "TEAMS('42')",
			oCache;

		this.mock(_Cache.prototype).expects("setQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions)).twice()
			.callsFake(function () {
				assert.strictEqual(this.bSortExpandSelect, "bSortExpandSelect");
				assert.notOk(this.bSharedRequest);
			});
		this.mock(_Cache.prototype).expects("setResourcePath").twice()
			.withExactArgs(sResourcePath)
			.callsFake(function () {
				assert.notOk(this.bSharedRequest);
			});

		// code under test
		oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions,
			"bSortExpandSelect", "original/resource/path", "bSharedRequest");

		assert.strictEqual(oCache.iActiveUsages, 1);
		assert.deepEqual(oCache.mChangeListeners, {});
		assert.strictEqual(oCache.sOriginalResourcePath, "original/resource/path");
		assert.strictEqual(oCache.iInactiveSince, Infinity);
		assert.deepEqual(oCache.mChangeRequests, {});
		assert.deepEqual(oCache.mEditUrl2PatchPromise, {});
		assert.deepEqual(oCache.mPostRequests, {});
		assert.strictEqual(oCache.oPendingRequestsPromise, null);
		assert.strictEqual(oCache.getPendingRequestsPromise(), null);
		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
		assert.strictEqual(oCache.bSentRequest, false);
		assert.strictEqual(oCache.bSharedRequest, "bSharedRequest");
		assert.strictEqual(oCache.sReportedMessagesPath, undefined);
		assert.ok(oCache.hasOwnProperty("sReportedMessagesPath"));

		assert.throws(function () {
			// code under test
			oCache.getValue();
		}, new Error("Unsupported operation"));

		// code under test
		oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions, "bSortExpandSelect");

		assert.strictEqual(oCache.sOriginalResourcePath, sResourcePath);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#setQueryOptions defaulting", function (assert) {
		const oCache = new _Cache(this.oRequestor);

		// code under test
		oCache.setQueryOptions();

		assert.deepEqual(oCache.mQueryOptions, {});

		oCache.bSentRequest = true;

		assert.throws(() => {
			// code under test
			oCache.setQueryOptions();
		}, new Error("Cannot set query options: Cache has already sent a request"));
	});

	//*********************************************************************************************
	QUnit.test("_Cache#setResourcePath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')/name.space.Operation");

		oCache.mLateQueryOptions = {};
		oCache.mPropertyRequestByPath = {};
		oCache.oTypePromise = {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/TEAMS('23')").returns("/TEAMS");

		// code under test
		oCache.setResourcePath("TEAMS('23')");

		assert.strictEqual(oCache.sResourcePath, "TEAMS('23')");
		assert.strictEqual(oCache.sMetaPath, "/TEAMS");
		assert.strictEqual(oCache.oTypePromise, undefined);
		assert.ok(oCache.hasOwnProperty("oTypePromise"));
		assert.strictEqual(oCache.mLateQueryOptions, null);
		assert.deepEqual(oCache.mPropertyRequestByPath, {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#setProperty", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {},
			oEntityPromise = Promise.resolve(oEntity),
			oUpdateData = {},
			that = this;

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity", null, null, true)
			.returns(SyncPromise.resolve(oEntityPromise));
		oEntityPromise.then(function () {
			that.mock(_Helper).expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf", "~bUpdating~")
				.returns(oUpdateData);
			that.mock(_Helper).expects("updateAll")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
					sinon.match.same(oEntity), sinon.match.same(oUpdateData));
		});

		// code under test
		return oCache.setProperty("Address/City", "Walldorf", "path/to/entity", "~bUpdating~");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#get-/setQueryOptions", function (assert) {
		var sMetaPath = "/TEAMS",
			mNewQueryOptions = {},
			mQueryOptions = {},
			oCache;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sMetaPath, sinon.match.same(mQueryOptions), false, "bSortExpandSelect")
			.returns("?foo=bar");
		oCache = new _Cache(this.oRequestor, "TEAMS('42')", mQueryOptions, "bSortExpandSelect");
		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.sQueryString, "?foo=bar");

		// code under test
		assert.strictEqual(oCache.getQueryOptions(), mQueryOptions);

		this.mock(oCache).expects("checkSharedRequest").thrice().withExactArgs();
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sMetaPath, sinon.match.same(mNewQueryOptions), false,
				"bSortExpandSelect")
			.returns("?baz=boo");

		// code under test
		oCache.setQueryOptions(mNewQueryOptions);

		assert.strictEqual(oCache.mQueryOptions, mNewQueryOptions);
		assert.strictEqual(oCache.sQueryString, "?baz=boo");

		// code under test
		assert.strictEqual(oCache.getQueryOptions(), mNewQueryOptions);

		oCache.bSentRequest = true;

		// code under test
		assert.throws(function () {
			oCache.setQueryOptions(mQueryOptions);
		}, new Error("Cannot set query options: Cache has already sent a request"));

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(sMetaPath, sinon.match.same(mQueryOptions), false,
				"bSortExpandSelect")
			.returns("?foo=bar");

		// code under test
		oCache.setQueryOptions(mQueryOptions, true);

		assert.strictEqual(oCache.mQueryOptions, mQueryOptions);
		assert.strictEqual(oCache.sQueryString, "?foo=bar");

		// code under test
		assert.strictEqual(oCache.getQueryOptions(), mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("_Cache hierarchy", function (assert) {
		assert.ok(_Cache.create(this.oRequestor, "TEAMS") instanceof _Cache);
		assert.ok(_Cache.createSingle(this.oRequestor, "TEAMS('42')") instanceof _Cache);
		assert.ok(_Cache.createProperty(this.oRequestor, "TEAMS('42')/Team_Id") instanceof _Cache);
		assert.ok(_Cache.createProperty(this.oRequestor, "Singleton/Team_Id") instanceof _Cache);
	});

	//*********************************************************************************************
	QUnit.test("_Cache: single cache with optional meta path", function (assert) {
		var sMetaPath = "/com.sap.gateway.default.iwbep.tea_busi.v0001.TEAM",
			oSingleCache = _Cache.createSingle(this.oRequestor, "TEAMS('42')", {}, false, false,
				undefined, false, sMetaPath);

		assert.strictEqual(oSingleCache.sMetaPath, sMetaPath);
		assert.strictEqual(oSingleCache.oPromise, null);

		this.oRequestorMock.expects("fetchType").withExactArgs(sinon.match.object, sMetaPath)
			.returns(SyncPromise.resolve());

		// code under test
		oSingleCache.fetchTypes();
	});

	//*********************************************************************************************
[ // iStatus === -1 => The request is canceled
	{bCreated : false, oEntity : undefined, iStatus : 200, sPath : ""},
	{bCreated : true, oEntity : undefined, iStatus : 200, sPath : ""},
	{bCreated : false, oEntity : undefined, iStatus : 404, sPath : ""},
	{bCreated : false, oEntity : undefined, iStatus : 500, sPath : ""},
	{bCreated : true, oEntity : undefined, iStatus : 500, sPath : "EMPLOYEE_2_EQUIPMENTS"},
	{bCreated : true, oEntity : undefined, iStatus : 500, sPath : "", bMessagesToRestore : true},
	{bCreated : false, oEntity : undefined, iStatus : 500, sPath : "", bInactive : true},
	{bCreated : true, oEntity : undefined, iStatus : -1, sPath : "EMPLOYEE_2_EQUIPMENTS"},
	{bCreated : true, oEntity : undefined, iStatus : -1, sPath : "", bMessagesToRestore : true},
	{bCreated : false, oEntity : undefined, iStatus : -1, sPath : "", bInactive : true},
	{bCreated : false, oEntity : {"@odata.etag" : "AnotherETag"}, iStatus : 200, sPath : ""}
].forEach(function (oFixture) {
	QUnit.test("_Cache#_delete: from collection, status: " + oFixture.iStatus
			+ ", created: " + oFixture.bCreated
			+ (oFixture.oEntity ? " (ETagEntity)" : ""), function (assert) {
		var that = this,
			bAddDeleted = false,
			mQueryOptions = {foo : "bar"},
			oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')", mQueryOptions, false,
				"original/resource/path"),
			sEtag = 'W/"19770724000000.0000000"',
			aCacheData = [{}, {
				"@$ui5._" : {
					predicate : "('1')",
					transientPredicate : oFixture.bCreated ? "($uid=id-1-23)" : undefined
				},
				"@odata.etag" : sEtag
			}, {}],
			fnCallback = this.spy(),
			oDeleted = {index : "~insert~"},
			oError = new Error(""),
			oGroupLock = {getGroupId : function () {}},
			oHelperMock = this.mock(_Helper),
			oMessage1 = {code : "CODE1"},
			oMessage2 = {code : "CODE2", persistent : true},
			oMessageExpectation,
			aMessages = oFixture.bMessagesToRestore ? [oMessage1, oMessage2] : [],
			sPath = oFixture.sPath,
			oPromise,
			oRequestExpectation,
			oRequestPromise,
			oRestoreExpectation,
			bSuccess = oFixture.iStatus === 200 || oFixture.iStatus === 404;

		function checkCleanedUp() {
			assert.notOk("@$ui5.context.isDeleted" in aCacheData[1]);
			assert.deepEqual(aCacheData.$deleted, ["a", "b", "c"]);
			if (oFixture.bInactive) {
				sinon.assert.calledOnceWithExactly(fnCallback, 1, -1);
			} else {
				sinon.assert.calledTwice(fnCallback);
				sinon.assert.calledWithExactly(fnCallback.secondCall, "~insert~", 1);
			}
		}

		oRequestPromise = Promise.resolve().then(function () {
			var iOnFailure = bSuccess ? 0 : 1;

			that.mock(_Helper).expects("removeByPath")
				.withExactArgs(sinon.match.same(oCache.mChangeRequests), sPath + "('1')",
					sinon.match.same(oRequestPromise));
			if (oFixture.bInactive) {
				oCache.iActiveUsages = 0;
			}
			oMessageExpectation = that.oModelInterfaceMock.expects("updateMessages")
				.exactly(oFixture.bMessagesToRestore ? 1 : 0)
				.withExactArgs(undefined, oFixture.iStatus < 0
					? [oMessage1, oMessage2] : [oMessage1]);
			oRestoreExpectation = that.mock(oCache).expects("restoreElement").exactly(iOnFailure)
				.withExactArgs("~insert~", sinon.match.same(aCacheData[1]), 2,
					sinon.match.same(aCacheData), sPath)
				.callsFake(() => {
					assert.deepEqual(aCacheData.$deleted.length, 4);
				});
			if (oFixture.iStatus !== 200) {
				if (oFixture.iStatus < 0) { // simulate the cancel
					oError.canceled = true;

					// code under test - call fnCancel
					oRequestExpectation.args[0][6]();

					assert.strictEqual(oMessageExpectation.called, !!oFixture.bMessagesToRestore);
					assert.ok(oRestoreExpectation.called);
					checkCleanedUp();
				}
				throw oError;
			}
		});

		aCacheData.$byPredicate = {"('1')" : aCacheData[1]};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("addPendingRequest").never();
		this.mock(oCache).expects("removePendingRequest").never();
		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sPath)
			.returns(SyncPromise.resolve(aCacheData));
		oError.status = oFixture.iStatus;
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(aCacheData[1], "predicate").callThrough();
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(aCacheData[1], "transient").callThrough();
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(aCacheData[1], "transientPredicate").callThrough();
		this.oModelInterfaceMock.expects("getMessagesByPath")
			.withExactArgs("/" + oCache.sResourcePath + (sPath ? "/" + sPath : "") + "('1')", true)
			.returns(aMessages);
		this.oModelInterfaceMock.expects("updateMessages")
			.withExactArgs(sinon.match.same(aMessages));
		this.mock(oCache).expects("addDeleted")
			.withExactArgs(sinon.match.same(aCacheData), 1, "('1')", sinon.match.same(oGroupLock),
				oFixture.bCreated)
			.callsFake(function () {
				bAddDeleted = true;
				aCacheData.$deleted = ["a", "b", oDeleted, "c"];
				return oDeleted;
			});
		this.mock(oCache).expects("removeElement")
			.withExactArgs(1, "('1')", sinon.match.same(aCacheData), sPath)
			.callsFake(function () {
				assert.ok(bAddDeleted, "removeElement called after addDeleted");
			});
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("~group~");
		this.oRequestorMock.expects("relocateAll")
			.withExactArgs("$parked.~group~", "~group~", sinon.match.same(aCacheData[1]));
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/EMPLOYEES", sinon.match.same(mQueryOptions), true)
			.returns("?foo=bar");
		oRequestExpectation = this.oRequestorMock.expects("request")
			.withExactArgs("DELETE", "Equipments('1')?foo=bar", sinon.match.same(oGroupLock),
				{"If-Match" : sinon.match.same(oFixture.oEntity || aCacheData[1])}, undefined,
				undefined, sinon.match.func, undefined,
				"original/resource/path" + (sPath && "/" + sPath) + "('1')")
			.returns(oRequestPromise);
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests), sPath + "('1')",
				sinon.match.same(oRequestPromise));

		// code under test
		oPromise = oCache._delete(oGroupLock, "Equipments('1')", (sPath && sPath + "/") + "1",
			oFixture.oEntity, fnCallback);

		assert.strictEqual(aCacheData[1]["@$ui5.context.isDeleted"], true);
		sinon.assert.calledOnceWithExactly(fnCallback, 1, -1);

		return oPromise.then(function () {
			assert.ok(bSuccess);
			assert.deepEqual(aCacheData.$deleted, ["a", "b", "c"]);
			assert.notOk("('1')" in aCacheData.$byPredicate);
		}, function (oError0) {
			assert.notOk(bSuccess);
			assert.strictEqual(oError0, oError);
			checkCleanedUp();
		});
	});
});

	//TODO adjust paths in mChangeRequests?
	//TODO invoke update in case of isConcurrentModification?!
	//TODO do it anyway? what and when to return, result of remove vs. re-read?

	//*********************************************************************************************
[false, true].forEach(function (bLock) {
	QUnit.test("_Cache#_delete: nested entity" + (bLock ? "" : ", no lock"), function () {
		var oCache = new _Cache(this.oRequestor, "Equipments(Category='foo',ID='0815')",
				{$expand : {EQUIPMENT_2_EMPLOYEE : {EMPLOYEE_2_TEAM : true}}}),
			sEtag = 'W/"19770724000000.0000000"',
			oCacheData = {
				EMPLOYEE_2_TEAM : {
					"@$ui5._" : {
						predicate : "('23')"
					},
					"@odata.etag" : sEtag
				}
			},
			oGroupLock = bLock ? {getGroupId : function () {}} : null,
			sPath = "Equipments(Category='foo',ID='0815')/EQUIPMENT_2_EMPLOYEE/EMPLOYEE_2_TEAM",
			oUpdateData = {};

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EQUIPMENT_2_EMPLOYEE")
			.returns(SyncPromise.resolve(oCacheData));
		if (bLock) {
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("~group~");
			this.oRequestorMock.expects("relocateAll")
				.withExactArgs("$parked.~group~", "~group~",
					sinon.match.same(oCacheData["EMPLOYEE_2_TEAM"]));
			this.oRequestorMock.expects("request")
				.withExactArgs("DELETE", "TEAMS('23')", oGroupLock, {
						"If-Match" : sinon.match.same(oCacheData["EMPLOYEE_2_TEAM"])
					}, undefined, undefined, sinon.match.func, undefined, sPath)
				.returns(Promise.resolve());
		} else {
			this.oRequestorMock.expects("request").never();
			this.oModelInterfaceMock.expects("getMessagesByPath")
				.withExactArgs("/" + sPath, true).returns("~aMessages~");
			this.oModelInterfaceMock.expects("updateMessages")
				.withExactArgs("~aMessages~");
		}
		this.mock(_Helper).expects("makeUpdateData").withExactArgs(["EMPLOYEE_2_TEAM"], null)
			.returns(oUpdateData);
		this.mock(_Helper).expects("updateExisting")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "EQUIPMENT_2_EMPLOYEE",
				sinon.match.same(oCacheData), sinon.match.same(oUpdateData));

		// code under test
		return oCache._delete(oGroupLock, "TEAMS('23')", "EQUIPMENT_2_EMPLOYEE/EMPLOYEE_2_TEAM",
			null, /*fnCallback*/function () {});
	});
});

	//*********************************************************************************************
[
	{bFailure : false, bInactive : false},
	{bFailure : true, bInactive : false},
	{bFailure : true, bInactive : true}
].forEach(function (oFixture) {
	var sTitle = "_Cache#_delete: kept-alive context not in collection " + JSON.stringify(oFixture);

	QUnit.test(sTitle, function (assert) {
		var oCache = _Cache.create(this.oRequestor, "EMPLOYEES"),
			aCacheData = [],
			fnCallback = this.spy(),
			bDeleted = false,
			oGroupLock = new _GroupLock("group", "owner", true),
			aMessages = [];

		aCacheData.$byPredicate = {
			"('1')" : {
				"@$ui5._" : {predicate : "('1')"},
				"@odata.etag" : "etag"
			}
		};

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("restoreElement").never();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "")
			.returns(SyncPromise.resolve(aCacheData));
		this.oModelInterfaceMock.expects("getMessagesByPath")
			.withExactArgs("/EMPLOYEES('1')", true).returns(aMessages);
		this.oModelInterfaceMock.expects("updateMessages")
			.withExactArgs(sinon.match.same(aMessages));
		this.mock(oCache).expects("reset").exactly(oFixture.bFailure && oFixture.bInactive ? 1 : 0)
			.withExactArgs([]);
		this.oRequestorMock.expects("request")
			.withExactArgs("DELETE", "EMPLOYEES('1')", sinon.match.same(oGroupLock), {
					"If-Match" : "etag"
				}, undefined, undefined, sinon.match.func, undefined, "EMPLOYEES('1')")
			.returns(Promise.resolve().then(function () {
				if (oFixture.bInactive) {
					oCache.iActiveUsages = 0;
				}
				if (oFixture.bFailure) {
					throw "~oError~";
				}
				bDeleted = true;
			}));
		this.mock(oCache).expects("removeElement")
			.withExactArgs(undefined, "('1')", sinon.match.same(aCacheData), "")
			// symbolic value would lead to a stronger test, but the value is checked internally
			.returns(undefined);

		// code under test
		return oCache._delete(oGroupLock, "EMPLOYEES('1')", "('1')", "etag", fnCallback)
			.then(function () {
				assert.strictEqual(bDeleted, true);
				sinon.assert.calledOnceWithExactly(fnCallback, undefined, -1);
			}, function (oError) {
				assert.strictEqual(bDeleted, false);
				assert.strictEqual(oError, "~oError~");
				assert.strictEqual(fnCallback.callCount, oFixture.bInactive ? 1 : 2);
				sinon.assert.calledWithExactly(fnCallback.firstCall, undefined, -1);
				if (!oFixture.bInactive) {
					sinon.assert.calledWithExactly(fnCallback.secondCall, undefined, 1);
				}
			});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: from collection, no lock", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')"),
			aCacheData = [{}, {
				"@$ui5._" : {predicate : "('1')"}
			}, {}],
			fnCallback = this.spy(),
			oPromise;

		aCacheData.$byPredicate = {"('1')" : aCacheData[1]};
		aCacheData.$created = 0;
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("addPendingRequest").never();
		this.mock(oCache).expects("removePendingRequest").never();
		oCache.fetchValue = function () {};
		// no need for different tests for top level or nested collections because
		// fetchValue takes care to deliver corresponding elements
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS")
			.returns(SyncPromise.resolve(aCacheData));
		// not interested in buildQueryString
		this.oRequestorMock.expects("request").never();
		this.mock(oCache).expects("requestCount").never();
		this.mock(oCache).expects("removeElement")
			.withExactArgs(1, "('1')", sinon.match.same(aCacheData), "EMPLOYEE_2_EQUIPMENTS")
			.returns(1);
		this.oModelInterfaceMock.expects("getMessagesByPath")
			.withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_EQUIPMENTS('1')", true)
			.returns("~aMessages~");
		this.oModelInterfaceMock.expects("updateMessages")
			.withExactArgs("~aMessages~");

		// code under test
		oPromise = oCache._delete(null, "Equipments('1')", "EMPLOYEE_2_EQUIPMENTS/1", {},
			fnCallback);

		assert.ok(oPromise.isFulfilled());
		sinon.assert.calledOnceWithExactly(fnCallback, 1, -1);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("_Cache#_delete: nested in deep create", function (assert) {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList"),
			fnCallback = sinon.spy(),
			oElement = {},
			aElements = [{}, oElement, {}],
			oGroupLock = {},
			oHelperMock = this.mock(_Helper),
			aPostBodyCollection = ["~a~", "~b~", "~c~"],
			oPromise,
			oRemoveElementExpectation,
			fnReject = sinon.spy(function (oError) {
				assert.ok(oError instanceof Error);
				assert.strictEqual(oError.canceled, true);
				assert.strictEqual(oError.message, "Deleted from deep create");
				assert.deepEqual(aPostBodyCollection, ["~a~", "~c~"]);
				assert.ok(oRemoveElementExpectation.called);
				sinon.assert.calledOnceWithExactly(fnCallback, 1, -1);
			});

		oCache.fetchValue = function () {};
		aElements.$postBodyCollection = aPostBodyCollection;
		aElements.$created = 2;
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "SO_2_SOITEM")
			.returns(SyncPromise.resolve(aElements));
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate").returns("n/a");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "transient").returns("updateGroup");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "transientPredicate").returns("($uid=1)");
		this.mock(this.oRequestor).expects("removePost").never();
		oRemoveElementExpectation = this.mock(oCache).expects("removeElement")
			.withExactArgs(1, "($uid=1)", sinon.match.same(aElements), "SO_2_SOITEM");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "reject").returns(fnReject);
		oHelperMock.expects("cancelNestedCreates")
			.withExactArgs(sinon.match.same(oElement), "Deleted from deep create");

		// code under test
		oPromise = oCache._delete(oGroupLock, undefined, "SO_2_SOITEM/1", null, fnCallback);

		assert.strictEqual(oPromise.getResult(), undefined);
		assert.deepEqual(aPostBodyCollection, ["~a~", "~c~"]);
		assert.ok(fnReject.calledOnce);
	});

	//*********************************************************************************************
	QUnit.test("Cache#addDeleted", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES"),
			oDeleted0,
			oDeleted1,
			oDeleted2,
			oDeleted3,
			oDeleted4,
			oDeleted5,
			aElements = [],
			oGroupLock = {
				getGroupId : function () { return "group"; }
			};

		// code under test
		oDeleted0 = oCache.addDeleted(aElements, undefined, "('42')", oGroupLock);

		assert.deepEqual(oDeleted0, {
			created : undefined,
			groupId : "group",
			predicate : "('42')",
			index : undefined
		});
		assert.deepEqual(aElements, []); // to satisfy ESLint
		assert.deepEqual(aElements.$deleted, [oDeleted0]);
		assert.strictEqual(aElements.$deleted[0], oDeleted0);

		// code under test
		oDeleted1 = oCache.addDeleted(aElements, 5, "('5')", oGroupLock);

		assert.deepEqual(oDeleted1, {
			created : undefined,
			groupId : "group",
			predicate : "('5')",
			index : 5
		});
		assert.deepEqual(aElements.$deleted, [oDeleted0, oDeleted1]);
		assert.strictEqual(aElements.$deleted[1], oDeleted1);

		// code under test
		oDeleted2 = oCache.addDeleted(aElements, 0, "('0')", undefined, true);

		assert.deepEqual(oDeleted2, {
			created : true,
			groupId : undefined,
			predicate : "('0')",
			index : 0
		});
		assert.deepEqual(aElements.$deleted, [oDeleted0, oDeleted2, oDeleted1]);
		assert.strictEqual(aElements.$deleted[1], oDeleted2);

		// code under test
		oDeleted3 = oCache.addDeleted(aElements, 3, "('3')");

		assert.deepEqual(oDeleted3, {
			created : undefined,
			groupId : undefined,
			predicate : "('3')",
			index : 3
		});
		assert.deepEqual(aElements.$deleted, [oDeleted0, oDeleted2, oDeleted3, oDeleted1]);
		assert.strictEqual(aElements.$deleted[2], oDeleted3);

		// code under test
		oDeleted4 = oCache.addDeleted(aElements, 3, "('4')");

		assert.deepEqual(oDeleted4, {
			created : undefined,
			groupId : undefined,
			predicate : "('4')",
			index : 3
		});
		assert.deepEqual(aElements.$deleted,
			[oDeleted0, oDeleted2, oDeleted3, oDeleted4, oDeleted1]);
		assert.strictEqual(aElements.$deleted[3], oDeleted4);

		// code under test
		oDeleted5 = oCache.addDeleted(aElements, undefined, "('23')", oGroupLock);

		assert.deepEqual(aElements.$deleted,
			[oDeleted5, oDeleted0, oDeleted2, oDeleted3, oDeleted4, oDeleted1]);
	});

	//*********************************************************************************************
// undefined: not transient; false: transient predicate, but reinserted; true: transient
[undefined, false, true].forEach(function (bTransient) {
	["", "EMPLOYEE_2_EQUIPMENTS"].forEach(function (sPath) {
		[false, true].forEach(function (bDeleted) {
			const sTitle = "_Cache#removeElement, bTransient = " + bTransient + ", bDeleted="
				+ bDeleted + ", sPath = " + sPath;
			QUnit.test(sTitle, function (assert) {
				var sByPredicate,
					oCache = new _Cache(this.oRequestor, "EMPLOYEES('42')"),
					aCacheData = [{
						"@odata.etag" : "before"
					}, {
						"@$ui5._" : {predicate : "('1')"},
						"@odata.etag" : "etag"
					}, {
						"@odata.etag" : "after"
					}],
					oElement = aCacheData[1],
					iIndex,
					// Assume there is no more data on the server; if element at index 1 is created
					// on the client, then 1 element has been read from server otherwise all 3 are
					// read from the server
					iLimit = bTransient ? 1 : 3;

				oCache.adjustIndexes = mustBeMocked;
				if (sPath === "") {
					oCache.iLimit = iLimit;
				}
				aCacheData.$byPredicate = {"('1')" : oElement};
				aCacheData.$created = bTransient ? 2 : 0;
				oCache.iActiveElements = bTransient && !sPath ? 1 : 0;
				if (bTransient !== undefined) {
					aCacheData[1]["@$ui5._"].transientPredicate = "($uid=id-1-23)";
					aCacheData.$byPredicate["($uid=id-1-23)"] = oElement;
				}
				if (bDeleted) {
					oElement["@$ui5.context.isDeleted"] = true;
				}
				sByPredicate = JSON.stringify(aCacheData.$byPredicate);
				this.mock(_Cache).expects("getElementIndex")
					.withExactArgs(sinon.match.same(aCacheData), "('1')", 2)
					.returns(1);
				this.mock(_Helper).expects("addToCount")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sPath,
						sinon.match.same(aCacheData), -1);
				this.mock(oCache).expects("adjustIndexes")
					.withExactArgs(sPath, sinon.match.same(aCacheData), 1, -1);

				// code under test
				iIndex = oCache.removeElement(2, "('1')", aCacheData, sPath);

				assert.strictEqual(aCacheData.$created, bTransient ? 1 : 0);
				assert.strictEqual(oCache.iActiveElements, 0);
				assert.strictEqual(iIndex, 1);
				assert.deepEqual(aCacheData, [{
					"@odata.etag" : "before"
				}, {
					"@odata.etag" : "after"
				}]);
				assert.strictEqual(
					JSON.stringify(aCacheData.$byPredicate),
					bDeleted ? sByPredicate : "{}");
				if (sPath === "") {
					assert.strictEqual(oCache.iLimit, bTransient ? 1 : 2);
				} else {
					assert.notOk("iLimit" in oCache);
				}
			});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bJustDropped) {
	var sTitle = "_Cache#removeElement for a kept-alive context"
			+ (bJustDropped
				? " which just dropped out of the collection"
				: " outside the collection");

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES"),
			aCacheData = [{
				"@$ui5._" : {predicate : "('2')"},
				"@odata.etag" : "before"
			}],
			oElement = {
				"@$ui5._" : {predicate : "('1')", transientPredicate : "n/a"},
				"@odata.etag" : "etag"
			},
			iIndex;

		aCacheData.$byPredicate = {
			"('1')" : oElement,
			"('2')" : aCacheData[0]
		};
		aCacheData.$count = 42;
		aCacheData.$created = 0;
		oCache.iActiveElements = 0;
		oCache.iLimit = 42;
		this.mock(_Cache).expects("getElementIndex").exactly(bJustDropped ? 1 : 0)
			.withExactArgs(sinon.match.same(aCacheData), "('1')", 2).returns(-1);
		this.mock(_Helper).expects("addToCount").never();
		this.mock(oCache).expects("adjustIndexes").never();

		// code under test
		iIndex = oCache.removeElement(bJustDropped ? 2 : undefined, "('1')", aCacheData, "");

		assert.strictEqual(iIndex, bJustDropped ? -1 : undefined);
		assert.strictEqual(aCacheData.$count, 42);
		assert.strictEqual(aCacheData.$created, 0);
		assert.strictEqual(oCache.iActiveElements, 0);
		assert.strictEqual(oCache.iLimit, 42);
		assert.deepEqual(aCacheData, [{
			"@$ui5._" : {predicate : "('2')"},
			"@odata.etag" : "before"
		}]);
		assert.deepEqual(aCacheData.$byPredicate, {"('2')" : aCacheData[0]});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#removeElement for a created kept-alive context inside", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EMPLOYEES"),
			aElements = [{
				"@$ui5._" : {predicate : "('2')"},
				"@odata.etag" : "before"
			}, {
				"@$ui5._" : {predicate : "('1')", transientPredicate : "($uid=id-1-23)"},
				"@odata.etag" : "etag"
			}, {
				"@odata.etag" : "after"
			}],
			oElement = aElements[1],
			iIndex;

		aElements.$byPredicate = {
			"($uid=id-1-23)" : oElement,
			"('1')" : oElement,
			"('2')" : aElements[0]
		};
		aElements.$count = 42;
		aElements.$created = 23;
		oCache.iActiveElements = 19;
		oCache.aElements = aElements;
		oCache.iLimit = 42;
		this.mock(_Cache).expects("getElementIndex")
			.withExactArgs(sinon.match.same(aElements), "('1')", 2).returns(1);
		this.mock(_Helper).expects("addToCount")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(aElements), -1);
		this.mock(oCache).expects("adjustIndexes")
			.withExactArgs("", sinon.match.same(aElements), 1, -1);

		// code under test
		iIndex = oCache.removeElement(2, "('1')");

		assert.strictEqual(iIndex, 1);
		assert.strictEqual(aElements.$created, 22);
		assert.strictEqual(oCache.iActiveElements, 18);
		assert.strictEqual(oCache.iLimit, 42);
		assert.deepEqual(aElements, [{
			"@$ui5._" : {predicate : "('2')"},
			"@odata.etag" : "before"
		}, {
			"@odata.etag" : "after"
		}]);
		assert.deepEqual(aElements.$byPredicate, {"('2')" : aElements[0]});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#removeElement: index only", function (assert) {
		const oCache = new _Cache(this.oRequestor, "EMPLOYEES");
		const oElement = {"@$ui5._" : {predicate : "('1')"}};
		const oTransientElement = {
			"@$ui5._" : {predicate : "('2')", transientPredicate : "($uid=id-1-23)"}
		};
		const aCacheData = [oTransientElement, "0", undefined, "2", undefined, oElement, "5"];
		oCache.iLimit = 6;
		oCache.iActiveElements = 1;
		aCacheData.$byPredicate = {
			"('1')" : oElement,
			"('2')" : oTransientElement,
			"($uid=id-1-23)" : oTransientElement,
			"('5')" : "5"
		};
		aCacheData.$created = 1;

		this.mock(_Cache).expects("getElementIndex").never();
		this.mock(_Helper).expects("addToCount").thrice()
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(aCacheData), -1);
		const oCacheMock = this.mock(oCache);
		oCacheMock.expects("adjustIndexes").withExactArgs("", sinon.match.same(aCacheData), 5, -1);

		// code under test
		oCache.removeElement(5, undefined, aCacheData);

		assert.deepEqual(aCacheData, [oTransientElement, "0", undefined, "2", undefined, "5"]);
		assert.deepEqual(aCacheData.$byPredicate, {
			"('2')" : oTransientElement,
			"($uid=id-1-23)" : oTransientElement,
			"('5')" : "5"
		});
		assert.deepEqual(aCacheData.$created, 1);
		assert.strictEqual(oCache.iLimit, 5);
		assert.strictEqual(oCache.iActiveElements, 1);

		oCacheMock.expects("adjustIndexes").withExactArgs("", sinon.match.same(aCacheData), 0, -1);

		// code under test
		oCache.removeElement(0, undefined, aCacheData);

		assert.deepEqual(aCacheData, ["0", undefined, "2", undefined, "5"]);
		assert.deepEqual(aCacheData.$byPredicate, {"('5')" : "5"});
		assert.deepEqual(aCacheData.$created, 0);
		assert.strictEqual(oCache.iLimit, 5);
		assert.strictEqual(oCache.iActiveElements, 0);

		oCacheMock.expects("adjustIndexes").withExactArgs("", sinon.match.same(aCacheData), 3, -1);

		// code under test
		oCache.removeElement(3, undefined, aCacheData);

		assert.deepEqual(aCacheData, ["0", undefined, "2", "5"]);
		assert.deepEqual(aCacheData.$byPredicate, {"('5')" : "5"});
		assert.deepEqual(aCacheData.$created, 0);
		assert.strictEqual(oCache.iLimit, 4);
		assert.strictEqual(oCache.iActiveElements, 0);
	});

	//*********************************************************************************************
[undefined, "~path~"].forEach(function (sPath) {
	[false, true].forEach(function (bTransient) {
		[false, true].forEach(function (bDefault) {
			[42, 43].forEach((iLength) => {
	const sTitle = `_Cache#restoreElement, path=${sPath}, transient=${bTransient},
 default=${bDefault}, length=${iLength}`;

	QUnit.test(sTitle, function (assert) {
		const oCache = new _Cache(this.oRequestor, "TEAMS");
		oCache.iLimit = 234;
		oCache.iActiveElements = 1;
		const aElements = [];
		aElements.length = iLength;
		aElements.$byPredicate = {};
		aElements.$created = 2;
		if (bDefault) {
			oCache.aElements = aElements;
		}
		const sPath0 = sPath || ""; // to test defaulting
		this.mock(oCache).expects("adjustIndexes")
			.withExactArgs(sPath0, sinon.match.same(aElements), 42, 1, "~iDeletedIndex~");
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs("~oElement~", "transientPredicate")
			.returns(bTransient ? "($uid=id-1-23)" : undefined);
		oHelperMock.expects("addToCount")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sPath0,
				sinon.match.same(aElements), 1);
		this.mock(aElements).expects("splice").exactly(iLength > 42 ? 1 : 0)
			.withExactArgs(42, 0, "~oElement~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oElement~", "predicate")
			.returns("~predicate~");

		// code under test
		oCache.restoreElement(42, "~oElement~", "~iDeletedIndex~", bDefault ? undefined : aElements,
			sPath);

		assert.strictEqual(oCache.iLimit, bTransient || sPath ? 234 : 235);
		assert.strictEqual(aElements.$created, bTransient ? 3 : 2);
		assert.strictEqual(oCache.iActiveElements, bTransient && !sPath ? 2 : 1);
		assert.deepEqual(aElements.$byPredicate, {"~predicate~" : "~oElement~"});
		if (iLength <= 42) {
			assert.strictEqual(aElements[42], "~oElement~", "avoid #splice here");
		}
	});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#registerChangeListener", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.registerChangeListener("path", "listener");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#registerChangeListener: $$sharedRequest", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);

		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "", "listener2");

		oCache.registerChangeListener("path", "listener1");
		oCache.registerChangeListener("", "listener2");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#deregisterChangeListener", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		this.mock(_Helper).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path", "listener");

		oCache.deregisterChangeListener("path", "listener");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#deregisterChangeListener: $$sharedRequest", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);

		this.mock(_Helper).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "", "listener2");

		oCache.deregisterChangeListener("path", "listener1");
		oCache.deregisterChangeListener("", "listener2");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#hasChangeListeners", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		// code under test
		assert.strictEqual(oCache.hasChangeListeners(), false);

		oCache.registerChangeListener("path", "listener");

		// code under test
		assert.strictEqual(oCache.hasChangeListeners(), true);

		oCache.deregisterChangeListener("path", "listener");

		// code under test
		assert.strictEqual(oCache.hasChangeListeners(), false);
	});

	//*********************************************************************************************
[false, true].forEach(function (bPatch) {
	[false, true].forEach(function (bIgnoreTransient) {
		["foo/bar('baz')", ""].forEach(function (sRequestPath) {
		var sTitle = "_Cache#hasPendingChangesForPath: bPatch = " + bPatch
			+ ", bIgnoreTransient = " + bIgnoreTransient
			+ ", sRequestPath = " + sRequestPath;

		if (bPatch && bIgnoreTransient || !bIgnoreTransient && !sRequestPath) {
			return;
		}

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			bIgnored = bIgnoreTransient && !sRequestPath;

		function hasPendingChangesForPath(sPath) {
			return oCache.hasPendingChangesForPath(sPath, false, bIgnoreTransient);
		}

		oCache[bPatch ? "mChangeRequests" : "mPostRequests"][sRequestPath] = [
			{},
			{"@$ui5.context.isInactive" : false},
			{"@$ui5.context.isInactive" : true}
		];

		// code under test (active entities exists)
		assert.strictEqual(hasPendingChangesForPath("bar"), false);
		assert.strictEqual(hasPendingChangesForPath(""), !bIgnored);
		assert.strictEqual(hasPendingChangesForPath("foo"), !bIgnored);
		assert.strictEqual(hasPendingChangesForPath("foo/ba"), false);
		assert.strictEqual(hasPendingChangesForPath("foo/bar"), !bIgnored);
		assert.strictEqual(hasPendingChangesForPath("foo/bars"), false);
		assert.strictEqual(hasPendingChangesForPath("foo/bar/baz"), false);
		assert.strictEqual(hasPendingChangesForPath("foo/bar('baz')"), !bIgnored);
		assert.strictEqual(hasPendingChangesForPath("foo/bar('baz')/qux"), false);

		if (!bPatch) {
			oCache.mPostRequests["foo/bar('baz')"] = [{"@$ui5.context.isInactive" : true}];

			// code under test (only inactive entities)
			assert.strictEqual(hasPendingChangesForPath(""), false);
			assert.strictEqual(hasPendingChangesForPath("foo"), false);
			assert.strictEqual(hasPendingChangesForPath("foo/bar"), false);
			assert.strictEqual(hasPendingChangesForPath("foo/bar/baz"), false);

			oCache.mPostRequests["foo/bar('baz')"] = [{"@$ui5.context.isInactive" : 1}];

			// code under test (only "inactive with prevented activation" entities)
			assert.strictEqual(hasPendingChangesForPath(""), true);
			assert.strictEqual(hasPendingChangesForPath("foo"), true);
			assert.strictEqual(hasPendingChangesForPath("foo/bar"), true);
			assert.strictEqual(hasPendingChangesForPath("foo/bar/baz"), false);
		}
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#hasPendingChangesForPath: bIgnoreKeptAlive", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oDeletePromise = {/* no $isKeepAlive */},
			oPatchPromise1 = {
				$isKeepAlive : mustBeMocked
			},
			oPatchPromise2 = {
				$isKeepAlive : mustBeMocked
			};

		oCache.mChangeRequests = {
			bar : [oDeletePromise, oPatchPromise1],
			foo : [oPatchPromise1, oPatchPromise2]
		};
		assert.strictEqual(oCache.hasPendingChangesForPath("bar", false), true);
		this.mock(oPatchPromise1).expects("$isKeepAlive").withExactArgs().returns(true).twice();

		// code under test
		assert.strictEqual(oCache.hasPendingChangesForPath("bar", true), false);

		this.mock(oPatchPromise2).expects("$isKeepAlive").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oCache.hasPendingChangesForPath("foo", true), true);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: PATCHes", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache),
			oCall1,
			oCall2,
			oCall3;

		oCache.mChangeRequests = {
			"foo/ba" : ["foo/ba"],
			"foo/bar" : ["foo/bar/1", "foo/bar/2"],
			"foo/bar('1')" : ["foo/bar(1)"],
			"foo/bars" : ["foo/bars"],
			"foo/bar/baz" : ["foo/bar/baz"]
		};

		oCacheMock.expects("checkSharedRequest").withExactArgs();
		this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/bar/baz");
		oCall1 = this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/bar(1)");
		oCall2 = this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/bar/2");
		oCall3 = this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/bar/1");

		// code under test
		oCache.resetChangesForPath("foo/bar");

		sinon.assert.callOrder(oCall1, oCall2, oCall3);
		assert.deepEqual(oCache.mChangeRequests, {
			"foo/ba" : ["foo/ba"],
			"foo/bars" : ["foo/bars"]
		});

		oCacheMock.expects("checkSharedRequest").withExactArgs();
		this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/ba");
		this.oRequestorMock.expects("removeChangeRequest").withExactArgs("foo/bars");

		// code under test
		oCache.resetChangesForPath("");

		assert.deepEqual(oCache.mChangeRequests, {});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: remove POSTs with given path", function (assert) {
		var oBody0 = {"@$ui5._" : {transient : "update"}},
			oBody1 = {"@$ui5._" : {transient : "update2"}},
			oBody2 = {"@$ui5._" : {transient : "update"}},
			oBody3 = {"@$ui5._" : {transient : "update"}},
			oBody4 = {"@$ui5._" : {transient : "update"}},
			oBody5 = {"@$ui5._" : {
				transient : "$inactive.foo", transientPredicate : "($uid=123-3)"
			}},
			oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCall1,
			oCall2;

		oCache.mPostRequests = {
			"foo/ba" : [oBody0],
			"foo/bar" : [oBody1, oBody2],
			"foo/bars" : [oBody3],
			"foo/bar/baz" : [oBody4, oBody5]
		};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		oCall1 = this.oRequestorMock.expects("removePost")
			.withExactArgs("update", sinon.match.same(oBody2));
		oCall2 = this.oRequestorMock.expects("removePost")
			.withExactArgs("update2", sinon.match.same(oBody1));
		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody4));
		this.mock(_Helper).expects("resetInactiveEntity")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "($uid=123-3)",
				sinon.match.same(oBody5));
		this.oRequestorMock.expects("removePost").withArgs("$inactive.foo").never();

		// code under test
		oCache.resetChangesForPath("foo/bar");

		sinon.assert.callOrder(oCall1, oCall2);
		// resetChangesForPath will not clean up oCache.mPostRequests by itself, but via
		// _Requestor#removePost which is mocked here
		assert.deepEqual(oCache.mPostRequests, {
			"foo/ba" : [oBody0],
			"foo/bar" : [oBody1, oBody2],
			"foo/bars" : [oBody3],
			"foo/bar/baz" : [oBody4, oBody5]
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: top-level", function (assert) {
		var oBody0 = {"@$ui5._" : {transient : "update"}},
			oBody1 = {"@$ui5._" : {transient : "update"}},
			oBody2 = {"@$ui5._" : {
				transient : "$inactive.foo", transientPredicate : "($uid=123-3)"
			}},
			oCache = new _Cache(this.oRequestor, "TEAMS");

		oCache.mPostRequests = {
			"foo/ba" : [oBody0],
			"foo/bars" : [oBody1],
			"foo/bar/baz" : [oBody2]
		};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody0));
		this.oRequestorMock.expects("removePost").withExactArgs("update", sinon.match.same(oBody1));
		this.mock(_Helper).expects("resetInactiveEntity")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "($uid=123-3)",
				sinon.match.same(oBody2));
		this.oRequestorMock.expects("removePost").withArgs("$inactive.foo").never();

		// code under test
		oCache.resetChangesForPath("");

		// resetChangesForPath will not clean up oCache.mPostRequests by itself, but via
		// _Requestor#removePost which is mocked here
		assert.deepEqual(oCache.mPostRequests, {
			"foo/ba" : [oBody0],
			"foo/bars" : [oBody1],
			"foo/bar/baz" : [oBody2]
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#resetChangesForPath: inactive contexts", function () {
		var oPostBody = [
			{"@$ui5._" : {transient : "update"}},
			{"@$ui5._" : {transient : "$inactive.foo", transientPredicate : "($uid=123-3)"}},
			{"@$ui5._" : {transient : "$inactive.foo", transientPredicate : "($uid=123-3)"},
				"@$ui5.context.isInactive" : 1},
			{"@$ui5._" : {transient : "$inactive.foo", transientPredicate : "($uid=123-3)"},
				"@$ui5.context.isInactive" : true},
			{"@$ui5._" : {transient : "$inactive.foo", transientPredicate : "($uid=4711)"},
				"@$ui5.context.isInactive" : 1}
			],
			oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache);

		oCache.mPostRequests = {"foo/bar" : oPostBody};

		oCacheMock.expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("resetInactiveEntity")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "($uid=123-3)", oPostBody[2]);
		this.mock(this.oRequestor).expects("removePost").never();

		// code under test
		oCache.resetChangesForPath("($uid=123-3)");

		oCacheMock.expects("checkSharedRequest").withExactArgs();

		// code under test
		oCache.resetChangesForPath("(");

		oCacheMock.expects("checkSharedRequest").withExactArgs();

		// code under test
		oCache.resetChangesForPath("/foo/bar($uid=");

		oCacheMock.expects("checkSharedRequest").withExactArgs();

		// code under test
		oCache.resetChangesForPath("~");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#setActive", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		oCache.iActiveUsages = 99;
		oCache.mChangeRequests = {path : {}};
		oCache.mChangeListeners = {path1 : "~listener1~", path2 : "~listener2~"};

		// code under test
		oCache.setActive(true);

		assert.strictEqual(oCache.iActiveUsages, 100);
		assert.strictEqual(oCache.hasPendingChangesForPath("path"), true);
		assert.strictEqual(oCache.iInactiveSince, Infinity);

		// code under test
		oCache.setActive(false);

		assert.strictEqual(oCache.iActiveUsages, 99);
		assert.strictEqual(oCache.iInactiveSince, Infinity);
		assert.deepEqual(oCache.mChangeListeners, {path1 : "~listener1~", path2 : "~listener2~"});

		oCache.iActiveUsages = 1;

		this.mock(Date).expects("now").withExactArgs().returns(42);

		// code under test
		oCache.setActive(false);

		assert.strictEqual(oCache.iActiveUsages, 0);
		assert.strictEqual(oCache.iInactiveSince, 42);
		assert.deepEqual(oCache.mChangeListeners, {});

		// code under test
		oCache.setActive(true);

		assert.strictEqual(oCache.iActiveUsages, 1);
		assert.strictEqual(oCache.iInactiveSince, Infinity);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#checkSharedRequest: not shared", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS");

		oCache.checkSharedRequest();
	});

	//*********************************************************************************************
	QUnit.test("_Cache#checkSharedRequest: shared", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS", undefined, false, undefined, true);

		assert.throws(function () {
			oCache.checkSharedRequest();
		}, new Error(oCache + " is read-only"));
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products('42')"),
			oCacheMock = this.mock(_Cache),
			oData = [{
				foo : {
					bar : 42,
					empty : "",
					emptyList : [],
					list : [{/*created*/}, {/*created*/}, {}, {}],
					null : null,
					zero : 0
				}
			}],
			that = this;

		function drillDown(sPath, bCreateOnDemand) {
			return oCache.drillDown(oData, sPath, null, bCreateOnDemand).getResult();
		}

		oCache.sResourcePath = "Employees?$select=foo";
		oData.$byPredicate = {"('a')" : oData[0]};
		oData.$created = 0;
		oData[0].foo.list.$byPredicate = {
			"('0')" : oData[0].foo.list[2],
			"('1')" : oData[0].foo.list[3]
		};
		oData[0].foo.list.$count = 10;
		oData[0].foo.list.$tail = {};

		assert.strictEqual(drillDown(""), oData, "empty path");
		assert.strictEqual(drillDown("0"), oData[0], "0");
		assert.strictEqual(drillDown("('a')"), oData[0], "('a')");
		assert.strictEqual(drillDown("0/foo"), oData[0].foo, "0/foo");
		assert.strictEqual(drillDown("0/foo/bar"), oData[0].foo.bar, "0/foo/bar");
		assert.strictEqual(drillDown("0/foo/list/$count"), oData[0].foo.list.$count,
			"0/foo/list/$count");
		assert.strictEqual(drillDown("('a')/foo/list('1')"), oData[0].foo.list[3],
			"('a')/foo/list('1')");
		assert.strictEqual(drillDown("$count"), undefined, "$count");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/@$ui5._, invalid segment: @$ui5._",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/@$ui5._"), undefined, "@$ui5._");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/bar/invalid, invalid segment: invalid",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/bar/invalid"), undefined,
			"0/foo/bar/invalid");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/baz, invalid segment: baz",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/baz"), undefined, "0/foo/baz");
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/$count, invalid segment: $count",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/$count"), undefined, "0/foo/$count");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/$count/bar, invalid segment: $count",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/$count/bar"), undefined,
			"0/foo/$count/bar");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/bar('2'), invalid segment: bar('2')",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/bar('2')"), undefined,
			"0/bar('2')");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/null/$count, invalid segment: $count",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/null/$count"), undefined,
			"0/bar('2')");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/bar/toString, invalid segment: toString",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/bar/toString"), undefined,
			"0/foo/bar/toString");

		assert.strictEqual(
			oCache.drillDown({/*no advertised action found*/}, "#com.sap.foo.AcFoo").getResult(),
			undefined, "no error if advertised action is not found");

		assert.strictEqual(
			oCache.drillDown({/*no annotation found*/}, "@$ui5.context.isTransient").getResult(),
			undefined, "no error if annotation is not found");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/list/bar, invalid segment: bar",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/list/bar"), undefined, "0/foo/list/bar");

		["$byPredicate", "$created", "$tail", "length"].forEach(function (sProperty) {
			that.oLogMock.expects("error").withExactArgs("Failed to drill-down into 0/foo/list/"
				+ sProperty + ", invalid segment: " + sProperty, oCache.toString(), sClassName);

			assert.strictEqual(drillDown("0/foo/list/" + sProperty), undefined,
				"0/foo/list/" + sProperty);
		});

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/emptyList('0'), invalid segment: emptyList('0')",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/emptyList('0')"), undefined, "0/foo/emptyList('0')");

		this.oLogMock.expects("info").withExactArgs(
			"Failed to drill-down into 0/foo/emptyList/0/bar, invalid segment: 0",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("0/foo/emptyList/0/bar"), undefined, "0/foo/emptyList/0/bar");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into ('a')/0, invalid segment: 0",
			oCache.toString(), sClassName);

		assert.strictEqual(drillDown("('a')/0"), undefined, "('a')/0");

		oCacheMock.expects("from$skip")
			.withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
		oCacheMock.expects("from$skip")
			.withExactArgs("list", sinon.match.same(oData[0].foo)).returns("list");
		oCacheMock.expects("from$skip")
			.withExactArgs("1", sinon.match.same(oData[0].foo.list)).returns(3);
		assert.strictEqual(drillDown("('a')/foo/list/1"), oData[0].foo.list[3], "('a')/foo/list/1");

		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into ('a')/foo/list/5, invalid segment: 5",
			oCache.toString(), sClassName);

		this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").never();
		oCacheMock.expects("from$skip")
			.withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
		oCacheMock.expects("from$skip")
			.withExactArgs("list", sinon.match.same(oData[0].foo)).returns("list");
		oCacheMock.expects("from$skip")
			.withExactArgs("5", sinon.match.same(oData[0].foo.list)).returns(7);
		// Note: even bCreateOnDemand does not change this!
		assert.strictEqual(drillDown("('a')/foo/list/5", true), undefined,
			"('a')/foo/list/5: index 7 out of range in ('a')/foo/list");

		oCacheMock.expects("from$skip")
			.withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
		oCacheMock.expects("from$skip")
			.withExactArgs("empty", sinon.match.same(oData[0].foo)).returns("empty");
		assert.strictEqual(drillDown("('a')/foo/empty", /*bCreateOnDemand*/true), "");

		oCacheMock.expects("from$skip")
			.withExactArgs("foo", sinon.match.same(oData[0])).returns("foo");
		oCacheMock.expects("from$skip")
			.withExactArgs("zero", sinon.match.same(oData[0].foo)).returns("zero");
		assert.strictEqual(drillDown("('a')/foo/zero", /*bCreateOnDemand*/true), 0);
	});

	//*********************************************************************************************
	QUnit.test("_SingleCache#drillDown: missing property, no key predicate", function (assert) {
		var oCache = this.createSingle("Products('42')"),
			oData = {},
			oGroupLock = {};

		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/foo")
			.returns(SyncPromise.resolve({
				$kind : "Property",
				$Type : "some.ComplexType"
			}));
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oData), ".Permissions", "foo")
			.returns(undefined);
		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData), "", "foo/bar")
			.callsFake(function () {
				oData.foo = {bar : "baz"};
				return SyncPromise.resolve(Promise.resolve());
			});

		return oCache.drillDown(oData, "foo/bar", oGroupLock).then(function (vValue) {
			assert.strictEqual(vValue, "baz");
		});
	});

	//*********************************************************************************************
	QUnit.test("_CollectionCache#drillDown: missing property, no key predicate", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Products"),
			aData = [{}],
			oGroupLock = {};

		aData.$created = 0;
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/foo")
			.returns(SyncPromise.resolve({
				$kind : "Property",
				$Type : "some.ComplexType"
			}));
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(aData[0]), ".Permissions", "foo")
			.returns(undefined);
		this.mock(oCache).expects("fetchLateProperty").never();
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into 0/foo/bar, invalid segment: foo",
			oCache.toString(), sClassName);

		return oCache.drillDown(aData, "0/foo/bar", oGroupLock).then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bGotIt) {
	QUnit.test("_Cache#drillDown: fetch missing property, got it = " + bGotIt, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{
				entity : {
					"@$ui5._" : {predicate : "(23)"}, // required for fetchLateProperty
					foo : {}
				}
			}];

		oData.$byPredicate = {"('42')" : oData[0]};

		this.mock(_Helper).expects("getMetaPath").exactly(bGotIt ? 1 : 2)
			.withExactArgs("('42')/entity/foo/bar").returns("entity/foo/bar");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(bGotIt ? 1 : 2)
			.withExactArgs("/Products/entity/foo/bar")
			.returns(SyncPromise.resolve({
				$kind : "Property",
				$Type : "some.ComplexType"
			}));
		this.mock(_Helper).expects("getAnnotationKey").exactly(bGotIt ? 1 : 2)
			.withExactArgs(sinon.match.same(oData[0].entity.foo), ".Permissions", "bar")
			.returns(undefined);
		this.mock(oCache).expects("fetchLateProperty") // MUST not be repeated!
			.withExactArgs("~oGroupLock~", sinon.match.same(oData[0].entity),
				"('42')/entity", "foo/bar/baz")
			.callsFake(function () {
				if (bGotIt) {
					oData[0].entity.foo.bar = {baz : "qux"};
				}
				return SyncPromise.resolve(Promise.resolve());
			});
		this.oLogMock.expects("error").exactly(bGotIt ? 0 : 1).withExactArgs(
			"Failed to drill-down into ('42')/entity/foo/bar/baz, invalid segment: bar",
			"/~/Products", sClassName);

		return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", "~oGroupLock~")
			.then(function (vValue) {
				assert.strictEqual(vValue, bGotIt ? "qux" : undefined);
			});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAsInfo) {
	var sTitle = "_Cache#drillDown: unexpected missing property, bAsInfo=" + bAsInfo;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{
				entity : {
					"@$ui5._" : {predicate : "(23)"},
					foo : {}
				}
			}],
			oGroupLock = {};

		oData.$byPredicate = {"('42')" : oData[0]};

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("('42')/entity/foo/bar")
			.returns("entity/foo/bar");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/entity/foo/bar")
			.returns(SyncPromise.resolve({
				$kind : "Property",
				$Type : "some.ComplexType"
			}));
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs({}, ".Permissions", "bar")
			.returns(undefined);
		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData[0].entity),
				"('42')/entity", "foo/bar/baz")
			.returns(bAsInfo);
		this.oLogMock.expects(bAsInfo ? "info" : "error").withExactArgs(
			"Failed to drill-down into ('42')/entity/foo/bar/baz, invalid segment: bar",
			"/~/Products", sClassName);

		return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", oGroupLock)
			.then(function (vValue) {
				assert.strictEqual(vValue, undefined);
			});
	});
});

	//*********************************************************************************************
[0, "None"].forEach(function (vPermissions) {
	QUnit.test("_Cache#drillDown: @Core.Permissions: " + vPermissions, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{
				entity : {
					foo : {"bar@Core.Permissions" : vPermissions}
				}
			}];

		oData.$byPredicate = {"('42')" : oData[0]};
		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("('42')/entity/foo/bar")
			.returns("entity/foo/bar");
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oData[0].entity.foo), ".Permissions", "bar")
			.returns("bar@Core.Permissions");
		this.oModelInterfaceMock.expects("fetchMetadata").never();
		this.mock(oCache).expects("fetchLateProperty").never();

		// code under test
		return oCache.drillDown(oData, "('42')/entity/foo/bar/baz", {/*oGroupLock*/})
			.then(function (vValue) {
				assert.strictEqual(vValue, undefined);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: unread navigation property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{"@$ui5._" : {predicate : ("('42')")}}],
			oGroupLock = {};

		oData.$byPredicate = {"('42')" : oData[0]};

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("('42')/PRODUCT_2_BP").returns("PRODUCT_2_BP");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/PRODUCT_2_BP")
			.returns(SyncPromise.resolve({
				$kind : "NavigationProperty",
				$Type : "name.space.BusinessPartner"
			}));
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oData[0]), ".Permissions", "PRODUCT_2_BP")
			.returns(undefined);
		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oData[0]), "('42')",
				"PRODUCT_2_BP")
			.returns(false);
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into ('42')/PRODUCT_2_BP, invalid segment: PRODUCT_2_BP",
			oCache.toString(), sClassName);

		// code under test
		return oCache.drillDown(oData, "('42')/PRODUCT_2_BP", oGroupLock).then(function (sResult) {
			assert.strictEqual(sResult, undefined);
		});
	});

	//*********************************************************************************************
[
	[{"@$ui5._" : {predicate : ("('42')")}}], // PRODUCT_2_BP : undefined
	[{"@$ui5._" : {predicate : ("('42')")}, PRODUCT_2_BP : null}]
].forEach(function (oData, i) {
	QUnit.test("_Cache#drillDown: bCreateOnDemand, " + i, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oGroupLock = {};

		oData.$byPredicate = {"('42')" : oData[0]};
		// Note: expect no call to missingValue()
		this.oModelInterfaceMock.expects("fetchMetadata").never();
		this.mock(oCache).expects("fetchLateProperty").never();

		// code under test
		// Note: we assume bCreateOnDemand is only set in case of an "entity path"!
		return oCache.drillDown(oData, "('42')/PRODUCT_2_BP", oGroupLock, /*bCreateOnDemand*/true)
			.then(function (oResult) {
				assert.strictEqual(oResult, oData[0].PRODUCT_2_BP);
				assert.deepEqual(oData, [{
					"@$ui5._" : {predicate : ("('42')")},
					PRODUCT_2_BP : {}
				}]);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: stream property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", "~mQueryOptions~"),
			oData = [{productPicture : {}}],
			oHelperMock = this.mock(_Helper);

		oData.$byPredicate = {"('42')" : oData[0]};

		oHelperMock.expects("getMetaPath")
			.withExactArgs("('42')/productPicture/picture")
			.returns("productPicture/picture");
		oHelperMock.expects("isSelected")
			.withExactArgs("productPicture/picture", "~mQueryOptions~")
			.returns(true);
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/productPicture/picture")
			.returns(SyncPromise.resolve({$Type : "Edm.Stream"}));
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/~/Products", "('42')/productPicture/picture")
			.returns("/~/Products('42')/productPicture/picture");

		// code under test
		return oCache.drillDown(oData, "('42')/productPicture/picture").then(function (sResult) {
			assert.strictEqual(sResult, "/~/Products('42')/productPicture/picture");
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: stream property, missing parent", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{}];

		oData.$byPredicate = {"('42')" : oData[0]};

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("('42')/productPicture").returns("productPicture");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/productPicture")
			.returns(SyncPromise.resolve({$Type : "some.ComplexType"}));
		this.mock(_Helper).expects("getAnnotationKey")
			.withExactArgs(sinon.match.same(oData[0]), ".Permissions", "productPicture")
			.returns(undefined);
		this.oLogMock.expects("error").withExactArgs(
			"Failed to drill-down into ('42')/productPicture/picture, "
				+ "invalid segment: productPicture",
			oCache.toString(), sClassName);

		// code under test
		assert.strictEqual(oCache.drillDown(oData, "('42')/productPicture/picture").getResult(),
			undefined);
	});

	//*********************************************************************************************
["@mediaReadLink", "@odata.mediaReadLink"].forEach(function (sMediaReadLink) {
	QUnit.test("_Cache#drillDown: stream property w/ " + sMediaReadLink, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = [{
				productPicture : {}
			}];

		oData[0].productPicture["picture" + sMediaReadLink] = "/~/my/Picture";
		oData.$byPredicate = {"('42')" : oData[0]};

		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("('42')/productPicture/picture").returns("productPicture/picture");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/productPicture/picture")
			.returns(SyncPromise.resolve({$Type : "Edm.Stream"}));

		// code under test
		assert.strictEqual(oCache.drillDown(oData, "('42')/productPicture/picture").getResult(),
			"/~/my/Picture");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSingle) {
	const oData = bSingle
		? {SOITEM_2_PRODUCT : null}
		: [{"@$ui5.context.isTransient" : true}];
	if (!bSingle) {
		oData.$byPredicate = {"($uid=id-1-23)" : oData[0]};
	}
	const sData = JSON.stringify(oData);
	const sWhat = bSingle ? "null entity" : "transient entity";
	const iCount = bSingle ? 1 : 2;

	//*********************************************************************************************
	QUnit.test(`_Cache#drillDown: ${sWhat}, missing single properties`, function (assert) {
		const oCache = new _Cache(this.oRequestor, bSingle ? "SalesOrderItem('1')" : "Products");
		const sPrefix = bSingle ? "SOITEM_2_PRODUCT" : "($uid=id-1-23)";
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getMetaPath").exactly(iCount)
			.withExactArgs(sPrefix + "/Name").returns("meta/path/Name");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(iCount)
			.withExactArgs(oCache.sMetaPath + "/meta/path/Name")
			.returns(SyncPromise.resolve(Promise.resolve({
				$Type : "Edm.String"
			})));
		oHelperMock.expects("getMetaPath").exactly(iCount)
			.withExactArgs(sPrefix + "/Currency").returns("meta/path/Currency");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(iCount)
			.withExactArgs(oCache.sMetaPath + "/meta/path/Currency")
			.returns(SyncPromise.resolve(Promise.resolve({
				$DefaultValue : "EUR",
				$Type : "Edm.String"
			})));
		oHelperMock.expects("getMetaPath").exactly(iCount)
			.withExactArgs(sPrefix + "/Price").returns("meta/path/Price");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(iCount)
			.withExactArgs(oCache.sMetaPath + "/meta/path/Price")
			.returns(SyncPromise.resolve(Promise.resolve({
				$DefaultValue : "0.0",
				$Type : "Edm.Double"
			})));
		oHelperMock.expects("parseLiteral").exactly(iCount)
			.withExactArgs("0.0", "Edm.Double", sPrefix + "/Price")
			.returns(0);
		oHelperMock.expects("getMetaPath").exactly(iCount)
			.withExactArgs(sPrefix + "/ProductID")
			.returns("meta/path/ProductID");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(iCount)
			.withExactArgs(oCache.sMetaPath + "/meta/path/ProductID")
			.returns(SyncPromise.resolve(Promise.resolve({
				$DefaultValue : "",
				$Type : "Edm.String"
			})));

		// code under test
		return Promise.all([
			oCache.drillDown(oData, sPrefix + "/Name").then(function (sValue) {
				assert.strictEqual(sValue, null);
			}),
			oCache.drillDown(oData, sPrefix + "/Currency").then(function (sValue) {
				assert.strictEqual(sValue, "EUR");
			}),
			oCache.drillDown(oData, sPrefix + "/Price").then(function (sValue) {
				assert.strictEqual(sValue, 0);
			}),
			oCache.drillDown(oData, sPrefix + "/ProductID").then(function (sValue) {
				assert.strictEqual(sValue, "");
			})
		]).then(function () {
			assert.strictEqual(JSON.stringify(oData), sData, "cache unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test(`_Cache#drillDown: ${sWhat}, missing complex properties`, function (assert) {
		const oCache = new _Cache(this.oRequestor,
			bSingle ? "SalesOrders('1')" : "BusinessPartners");
		const sPrefix = bSingle ? "SOITEM_2_PRODUCT" : "($uid=id-1-23)";
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getMetaPath").exactly(3 * iCount/*steps*/)
			.withExactArgs(sPrefix + "/Address").returns("meta/path/Address");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(3 * iCount/*steps*/)
			.withExactArgs(oCache.sMetaPath + "/meta/path/Address")
			.returns(SyncPromise.resolve(Promise.resolve({
				$Type : "name.space.Address"
			})));
		oHelperMock.expects("getMetaPath").withExactArgs(sPrefix + "/Address/City")
			.returns("meta/path/Address/City");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs(oCache.sMetaPath + "/meta/path/Address/City")
			.returns(SyncPromise.resolve({
				$Type : "Edm.String"
			}));
		oHelperMock.expects("getMetaPath").withExactArgs(sPrefix + "/Address/unknown")
			.returns("meta/path/Address/unknown");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs(oCache.sMetaPath + "/meta/path/Address/unknown")
			.returns(SyncPromise.resolve(undefined));
		this.oLogMock.expects("error")
			.withExactArgs("Failed to drill-down into " + sPrefix + "/Address/unknown,"
				+ " invalid segment: unknown", "/~/" + oCache.sResourcePath, sClassName);
		oHelperMock.expects("getMetaPath").withExactArgs(sPrefix + "/Address/GeoLocation")
			.returns("meta/path/Address/GeoLocation");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs(oCache.sMetaPath + "/meta/path/Address/GeoLocation")
			.returns(SyncPromise.resolve({
				$Type : "name.space.GeoLocation"
			}));
		oHelperMock.expects("getMetaPath").withExactArgs(sPrefix + "/Address/GeoLocation/Longitude")
			.returns("meta/path/Address/GeoLocation/Longitude");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs(oCache.sMetaPath + "/meta/path/Address/GeoLocation/Longitude")
			.returns(SyncPromise.resolve({
				$DefaultValue : "0.0",
				$Type : "Edm.Decimal"
			}));

		// code under test
		return Promise.all([
			oCache.drillDown(oData, sPrefix + "/Address/City").then(function (sValue) {
				assert.strictEqual(sValue, null);
			}),
			oCache.drillDown(oData, sPrefix + "/Address/unknown").then(function (sValue) {
				assert.strictEqual(sValue, undefined);
			}),
			oCache.drillDown(oData, sPrefix + "/Address/GeoLocation/Longitude")
				.then(function (sValue) {
					assert.strictEqual(sValue, "0.0");
				})
		]).then(function () {
			assert.strictEqual(JSON.stringify(oData), sData, "cache unchanged");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: transient entity, navigation property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "SalesOrders"),
			oData = [{
				"@$ui5.context.isTransient" : true
			}];

		oData.$byPredicate = {"($uid=id-1-23)" : oData[0]};

		this.mock(_Helper).expects("getMetaPath").twice()
			.withExactArgs("($uid=id-1-23)/SO_2_BP")
			.returns("SO_2_BP");
		this.oModelInterfaceMock.expects("fetchMetadata").twice()
			.withExactArgs("/SalesOrders/SO_2_BP")
			.returns(SyncPromise.resolve(Promise.resolve({
				$kind : "NavigationProperty",
				$Type : "name.space.BusinessPartner"
			})));

		// code under test
		return oCache.drillDown(oData, "($uid=id-1-23)/SO_2_BP").then(function (oValue) {
			assert.strictEqual(oValue, null);
		}).then(function () {
			assert.deepEqual(oData[0], {"@$ui5.context.isTransient" : true}, "cache unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: missing property annotation", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", {$select : ["PostAddress"]}),
			oData = {
				WebAddress : "foo.bar",
				"WebAddress@some.Annotation" : {foo : {bar : "string"}},
				"EmailAddress@$ui5.noData" : true
			},
			oTransientData = {
				"@$ui5.context.isTransient" : true
			};

		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into WebAddress@some.Annotation/foo/missing, "
				+ "invalid segment: missing", "/~/Products",
				"sap.ui.model.odata.v4.lib._Cache");
		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into ProductID@missing.Annotation, "
				+ "invalid segment: ProductID@missing.Annotation", "/~/Products",
				"sap.ui.model.odata.v4.lib._Cache");
		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into WebAddress@missing.Annotation, "
				+ "invalid segment: WebAddress@missing.Annotation", "/~/Products",
				"sap.ui.model.odata.v4.lib._Cache");
		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into EmailAddress@missing.Annotation, "
				+ "invalid segment: EmailAddress@missing.Annotation", "/~/Products",
				"sap.ui.model.odata.v4.lib._Cache");
		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into PostAddress@missing.Annotation, "
				+ "invalid segment: PostAddress@missing.Annotation", "/~/Products",
				"sap.ui.model.odata.v4.lib._Cache");

		// code under test
		return Promise.all([
			// do not report error within annotation
			oCache.drillDown(oData, "WebAddress@some.Annotation/foo/missing"),
			// do not request the property if - transient
			oCache.drillDown(oTransientData, "ProductID@missing.Annotation"),
			// - property is already in the data
			oCache.drillDown(oData, "WebAddress@missing.Annotation"),
			// - annotation "Property@$ui5.noData" = true is in data
			oCache.drillDown(oData, "EmailAddress@missing.Annotation"),
			// - property is selected
			oCache.drillDown(oData, "PostAddress@missing.Annotation")
		]).then(function (aResults) {
			assert.deepEqual(aResults, [undefined, undefined, undefined, undefined, undefined]);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: late request for missing property annotation", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products"),
			oData = {};

		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/PostAddress")
			.returns(SyncPromise.resolve({}));
		this.mock(_Helper).expects("isSelected")
			.withExactArgs("PostAddress", {})
			.returns(false);
		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs("~oGroupLock~", sinon.match.same(oData), "",
				"PostAddress@some.Annotation")
			.callsFake(function () {
				oData["PostAddress@some.Annotation"] = "~value~";
				return SyncPromise.resolve(Promise.resolve());
			});

		// code under test
		return oCache.drillDown(oData, "PostAddress@some.Annotation", "~oGroupLock~")
			.then(function (sValue) {
				assert.strictEqual(sValue, "~value~");
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: missing Edm.Stream property annotation", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", "~mQueryOptions~"),
			oData = {},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("getMetaPath")
			.withExactArgs("Picture@odata.mediaContentType");
		oHelperMock.expects("getMetaPath")
			.withExactArgs("Picture")
			.returns("~PictureMetaPath~");
		oHelperMock.expects("isSelected")
			.withExactArgs("~PictureMetaPath~", "~mQueryOptions~")
			.returns(false);
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/~PictureMetaPath~")
			.returns(SyncPromise.resolve({$Type : "Edm.Stream"}));
		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs("~oGroupLock~", sinon.match.same(oData), "",
				"Picture@odata.mediaContentType")
			.callsFake(function () {
				oData["Picture@odata.mediaContentType"] = "image/jpg";
				return SyncPromise.resolve(Promise.resolve());
			});

		// code under test
		return oCache.drillDown(oData, "Picture@odata.mediaContentType", "~oGroupLock~")
			.then(function (sValue) {
				assert.strictEqual(sValue, "image/jpg");
			});
	});

	//*********************************************************************************************
[{
	oResponse : {},
	sResult : "/~/Products/Picture"
 }, {
	oResponse : {"Picture@odata.mediaReadLink" : "~odata.mediaReadLink~"},
	sResult : "~odata.mediaReadLink~"
 }, {
	oResponse : {"Picture@mediaReadLink" : "~mediaReadLink~"},
	sResult : "~mediaReadLink~"
  }, {
	oResponse : {Picture : "~somePicture~"},
	sResult : "~somePicture~"
}].forEach(function (oFixture) {
	QUnit.test("_Cache#drillDown: fetch Edm.Stream property late", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", "~mQueryOptions~"),
			bPictureInResponse = "Picture" in oFixture.oResponse, //missingValue is called only once
			oData = {};

		this.mock(_Helper).expects("getMetaPath").exactly(bPictureInResponse ? 1 : 2)
			.withExactArgs("Picture")
			.returns("~PictureMetaPath~");
		this.oModelInterfaceMock.expects("fetchMetadata").exactly(bPictureInResponse ? 1 : 2)
			.withExactArgs("/Products/~PictureMetaPath~")
			.returns(SyncPromise.resolve({$Type : "Edm.Stream"}));
		this.mock(_Helper).expects("isSelected")
			.withExactArgs("~PictureMetaPath~", "~mQueryOptions~")
			.returns(false);

		this.mock(oCache).expects("fetchLateProperty")
			.withExactArgs("~oGroupLock~", sinon.match.same(oData), "", "Picture")
			.callsFake(function () {
				if (!bPictureInResponse) {
					oData["Picture@$ui5.noData"] = true; // done by _Helper.updateSelected
				}
				Object.assign(oData, oFixture.oResponse);
				return SyncPromise.resolve(Promise.resolve());
			});

		// code under test
		return oCache.drillDown(oData, "Picture", "~oGroupLock~")
			.then(function (sValue) {
				assert.strictEqual(sValue, oFixture.sResult);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: do not fetch Edm.Stream property late twice", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", "~mQueryOptions~"),
			oData = {"Picture@$ui5.noData" : true};

		this.mock(_Helper).expects("isSelected").never();
		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("Picture")
			.returns("~PictureMetaPath~");
		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Products/~PictureMetaPath~")
			.returns(SyncPromise.resolve({$Type : "Edm.Stream"}));

		// code under test
		return oCache.drillDown(oData, "Picture", "~oGroupLock~").then(function (sResult) {
			assert.strictEqual(sResult, "/~/Products/Picture", "default for Edm.Stream");
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#drillDown: don't fetch Edm.Stream annotation late 2x", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Products", "~mQueryOptions~"),
			oData = {"Picture@$ui5.noData" : true},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("isSelected").never();
		oHelperMock.expects("getMetaPath")
			.withExactArgs("Picture@missing");
		oHelperMock.expects("getMetaPath")
			.withExactArgs("Picture")
			.returns("~PictureMetaPath~");
		this.oLogMock.expects("info")
			.withExactArgs("Failed to drill-down into Picture@missing, invalid segment: "
				+ "Picture@missing", "/~/Products", "sap.ui.model.odata.v4.lib._Cache");

		// code under test
		return oCache.drillDown(oData, "Picture@missing", "~oGroupLock~").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	[{
		bCanceled : false,
		sEntityPath : "patch/without/side/effects",
		$$patchWithoutSideEffects : true
	}, {
		bCanceled : false,
		sEntityPath : "('42')/path/to/entity"
	}, {
		bCanceled : false,
		sEntityPath : ""
	}, {
		bCanceled : true,
		sEntityPath : "path/to/entity"
	}, {
		bCanceled : true,
		sEntityPath : ""
	}, {
		bCanceled : false,
		sEntityPath : "('42')/path/to/unread/entity",
		$cached : true // #fetchValue for _GroupLock.$cached fails with oError.$cached === true
	}].forEach(function (oFixture) {
		var bCanceled = oFixture.bCanceled,
			sEntityPath = oFixture.sEntityPath,
			sTitle = "_Cache#update: " + (bCanceled ? "canceled" : "success")
				+ ", entity path: " + sEntityPath;

		QUnit.test(sTitle, function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "BusinessPartnerList",
					mQueryOptions, true, "original/resource/path"),
				oCacheMock = this.mock(oCache),
				oCacheUpdatePromise,
				oEntity = {
					"@odata.etag" : 'W/"19700101000000.0000000"',
					Address : {
						City : "Heidelberg"
					}
				},
				oEntityMatcher = sinon.match.same(oEntity),
				fnError = this.spy(),
				oError = new Error(),
				iExpectedCalls = oFixture.$$patchWithoutSideEffects ? 0 : 1,
				oFetchCachedError = new Error("Unexpected request: GET ..."),
				oFetchValueExpectation,
				sFullPath = "path/to/entity/Address/City",
				oGroupLock = {getGroupId : function () {}},
				oHelperMock = this.mock(_Helper),
				oOldData = {},
				oPatchResult = {
					"@odata.etag" : 'W/"20010101000000.0000000"',
					foo : "bar",
					ignore : "me",
					me : "too"
				},
				oPatchPromise = bCanceled ? Promise.reject(oError) : Promise.resolve(oPatchResult),
				fnPatchSent = this.spy(),
				oRequestCall,
				oRequestLock = {unlock : function () {}},
				mTypeForMetaPath = {},
				oUnlockCall,
				oUpdateData = {},
				oUpdateExistingCall,
				that = this;

			oError.canceled = bCanceled;
			oCache.fetchValue = function () {};
			oFetchValueExpectation = oCacheMock.expects("fetchValue")
				.withExactArgs(sinon.match.same(_GroupLock.$cached), sEntityPath);
			if (oFixture.$cached) {
				oCache.oPromise = null;
				oFetchCachedError.$cached = true;
				oFetchValueExpectation.throws(oFetchCachedError);
				oEntityMatcher = {"@odata.etag" : "*"};
			} else {
				oFetchValueExpectation.returns(SyncPromise.resolve(oEntity));
			}
			oCacheMock.expects("fetchTypes")
				.withExactArgs()
				.returns(SyncPromise.resolve(mTypeForMetaPath));
			oHelperMock.expects("buildPath").withExactArgs(sEntityPath, "Address/City")
				.returns(sFullPath);
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true)
				.returns("?foo=bar");
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], "Walldorf")
				.returns(oUpdateData);
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Address", "City"], oFixture.$cached ? undefined : "Heidelberg")
				.returns(oOldData);
			oHelperMock.expects("updateAll")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
					oEntityMatcher, sinon.match.same(oUpdateData));
			this.oRequestorMock.expects("relocateAll")
				.withExactArgs("$parked.group", "group", oEntityMatcher);
			oHelperMock.expects("buildPath")
				.withExactArgs("original/resource/path", oFixture.sEntityPath)
				.returns("~");
			oRequestCall = this.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
					sinon.match.same(oGroupLock), Object.assign({"If-Match" : oEntityMatcher},
						oFixture.$$patchWithoutSideEffects && {Prefer : "return=minimal"}),
					sinon.match.same(oUpdateData), sinon.match.func, sinon.match.func, undefined,
					"~", undefined, undefined, undefined, sinon.match.func)
				.returns(oPatchPromise);
			oHelperMock.expects("addByPath")
				.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
					sinon.match.same(oPatchPromise));
			oPatchPromise.then(function () {
				var sMetaPath = {/* {string} result of _Helper.getMetaPath(...)*/},
					sPath = {/* {string} result of _Helper.buildPath(...)*/};

				oHelperMock.expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
						sinon.match.same(oPatchPromise));
				oHelperMock.expects("buildPath").exactly(iExpectedCalls)
					.withExactArgs("/BusinessPartnerList", sEntityPath)
					.returns(sPath);
				oHelperMock.expects("getMetaPath").exactly(iExpectedCalls)
					.withExactArgs(sinon.match.same(sPath))
					.returns(sMetaPath);
				oCacheMock.expects("visitResponse").exactly(iExpectedCalls)
					.withExactArgs(sinon.match.same(oPatchResult),
						sinon.match.same(mTypeForMetaPath), sinon.match.same(sMetaPath),
						sEntityPath);
				oUpdateExistingCall = oHelperMock.expects("updateExisting")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
						oEntityMatcher,
						oFixture.$$patchWithoutSideEffects
						? {"@odata.etag" : oPatchResult["@odata.etag"]}
						: sinon.match.same(oPatchResult));
				oUnlockCall = that.mock(oRequestLock).expects("unlock").withExactArgs();
			}, function () {
				oCacheMock.expects("visitResponse").never();
				oHelperMock.expects("removeByPath").twice()
					.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
						sinon.match.same(oPatchPromise));
				oHelperMock.expects("updateExisting")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
						oEntityMatcher, sinon.match.same(oOldData));
				oRequestCall.args[0][6](); // call onCancel
			});

			// code under test
			oCacheUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
					"/~/BusinessPartnerList('0')", sEntityPath, undefined,
					oFixture.$$patchWithoutSideEffects, fnPatchSent)
				.then(function (oResult) {
					assert.notOk(fnError.called);
					assert.strictEqual(bCanceled, false);
					assert.strictEqual(oResult, undefined, "no result");
					if (oUpdateExistingCall.called) {
						assert.ok(oUpdateExistingCall.calledBefore(oUnlockCall),
							"cache update happens before unlock");
					}
				}, function (oResult) {
					assert.notOk(fnError.called);
					assert.strictEqual(bCanceled, true);
					assert.strictEqual(oResult, oError);
				});

			if (oFixture.$cached) {
				assert.deepEqual(oCache.oPromise.getResult(), {"@odata.etag" : "*"});
			}

			this.mock(this.oRequestor).expects("lockGroup")
				.withExactArgs("group", sinon.match.same(oCache), true)
				.returns(oRequestLock);

			assert.ok(fnPatchSent.notCalled, "patchSent handler not yet called");

			// code under test
			oRequestCall.args[0][5](); // call onSubmit

			assert.ok(fnPatchSent.calledOnceWithExactly(), "patchSent handler called once");

			return oCacheUpdatePromise;
		});
	});

	//*********************************************************************************************
[undefined, SyncPromise.resolve()].forEach(function (oPromise) {
	var sTitle = "_Cache#update: oError.$cached but this.oPromise === " + oPromise;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList"),
			oError = new Error();

		oError.$cached = true;
		oCache.oPromise = oPromise;
		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity")
			.throws(oError);

		assert.throws(function () {
			// code under test
			oCache.update({/*oGroupLock*/}, "Address/City", "Walldorf", /*fnError*/null,
				"/~/BusinessPartnerList('0')", "path/to/entity");
		}, oError);

		assert.strictEqual(oCache.oPromise, oPromise);
	});
});

	//*********************************************************************************************
	[false, true].forEach(function (bTransient) {
		["EUR", "", undefined].forEach(function (sUnitOrCurrencyValue, i) {
			QUnit.test("_Cache#update: updates unit, " + bTransient + ", " + i, function (assert) {
				var mQueryOptions = {},
					oCache = new _Cache(this.oRequestor, "ProductList", mQueryOptions, true),
					oCacheMock = this.mock(oCache),
					oEntity = {
						"@odata.etag" : 'W/"19700101000000.0000000"',
						ProductInfo : {
							Amount : "123"
						}
					},
					fnError = this.spy(),
					oGroupLock = {
						getGroupId : function () {},
						unlock : function () {}
					},
					oHelperMock = this.mock(_Helper),
					oPatchResult = {},
					oPatchPromise = Promise.resolve(oPatchResult),
					oPostBody = {},
					oUnitUpdateData = {},
					oUpdateData = {};

				if (bTransient) {
					_Helper.setPrivateAnnotation(oEntity, "postBody", oPostBody);
					_Helper.setPrivateAnnotation(oEntity, "transient", "group");
				}
				oCache.fetchValue = function () {};
				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity")
					.returns(SyncPromise.resolve(oEntity));
				this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
				oHelperMock.expects("deleteUpdating")
					.withExactArgs("ProductInfo/Amount", sinon.match.same(oEntity));
				oHelperMock.expects("makeUpdateData")
					.withExactArgs(["ProductInfo", "Amount"], "123")
					.returns(oUpdateData);
				oHelperMock.expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "path/to/entity",
						sinon.match.same(oEntity), sinon.match.same(oUpdateData));
				if (bTransient) {
					oHelperMock.expects("updateAll").withExactArgs({}, "path/to/entity",
						sinon.match.same(oPostBody), sinon.match.same(oUpdateData));
				}
				oHelperMock.expects("makeUpdateData")
					.withExactArgs(["ProductInfo", "Amount"], "123")
					.returns("n/a"); // not used in this test
				oCacheMock.expects("getValue")
					.withExactArgs("path/to/entity/ProductInfo/Pricing/Currency")
					.returns(sUnitOrCurrencyValue);
				if (sUnitOrCurrencyValue === undefined) {
					this.oLogMock.expects("debug").withExactArgs("Missing value for unit of measure"
							+ " path/to/entity/ProductInfo/Pricing/Currency"
							+ " when updating path/to/entity/ProductInfo/Amount",
						oCache.toString(),
						sClassName);
				} else {
					oHelperMock.expects("makeUpdateData")
						.withExactArgs(["ProductInfo", "Pricing", "Currency"], sUnitOrCurrencyValue)
						.returns(oUnitUpdateData);
					oHelperMock.expects("merge")
						.withExactArgs(sinon.match.same(bTransient ? oPostBody : oUpdateData),
							sinon.match.same(oUnitUpdateData));
				}
				if (bTransient) {
					this.mock(oGroupLock).expects("unlock").withExactArgs();
				} else {
					this.oRequestorMock.expects("buildQueryString")
						.withExactArgs("/ProductList", sinon.match.same(mQueryOptions), true)
						.returns("");
					this.oRequestorMock.expects("request")
						.withExactArgs("PATCH", "ProductList('0')", sinon.match.same(oGroupLock),
							{"If-Match" : sinon.match.same(oEntity)}, sinon.match.same(oUpdateData),
							sinon.match.func, sinon.match.func, undefined,
							oCache.sResourcePath + "/path/to/entity", undefined, undefined,
							undefined, sinon.match.func)
						.returns(oPatchPromise);
					oPatchPromise.then(function () {
						oHelperMock.expects("updateExisting")
							.withExactArgs(sinon.match.same(oCache.mChangeListeners),
								"path/to/entity", sinon.match.same(oEntity),
								sinon.match.same(oPatchResult));
					});
				}

				// code under test
				return oCache.update(oGroupLock, "ProductInfo/Amount", "123", fnError,
						"ProductList('0')", "path/to/entity", "Pricing/Currency")
					.then(function (oResult) {
						assert.notOk(fnError.called);
						assert.strictEqual(oResult, undefined, "no result");
					});
			});
		});
	});

	//*********************************************************************************************
	[{
		bCanceled : false,
		sGroupSubmitMode : "API"
	}, {
		bCanceled : true,
		sGroupSubmitMode : "API"
	}, {
		bCanceled : false,
		sGroupSubmitMode : "Auto"
	}, {
		bCanceled : true,
		sGroupSubmitMode : "Auto"
	}, {
		bCanceled : false,
		sGroupSubmitMode : "Auto",
		bHasChanges : true
	}].forEach(function (oFixture) {
		var bCanceled = oFixture.bCanceled,
			sGroupSubmitMode = oFixture.sGroupSubmitMode,
			sTitle = "_Cache#update: failure for group submit mode " + sGroupSubmitMode
				+ ", then " + (bCanceled ? "cancel" : "success")
				+ ", has changes: " + oFixture.bHasChanges;

		QUnit.test(sTitle, function (assert) {
			var mQueryOptions = {},
				oCache = new _Cache(this.oRequestor, "BusinessPartnerList", mQueryOptions),
				oCacheMock = this.mock(oCache),
				oCacheUpdatePromise0,
				oCacheUpdatePromise1,
				oEntity = {
					Address : {
						City : "Heidelberg",
						PostalCode : "69115"
					}
				},
				sEntityPath = "path/to/entity",
				fnError0 = this.spy(),
				fnError1 = this.spy(),
				oError1 = new Error(),
				oError2 = new Error(),
				mTypeForMetaPath = {},
				oFetchTypesPromise = SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)),
				sFullPath = "path/to/entity/Address/City",
				oGroupLock0 = {
					getGroupId : function () {}
				},
				oGroupLock1 = {
					getGroupId : function () {}
				},
				oHelperMock = this.mock(_Helper),
				oPatchResult = {},
				oPatchPromise0 = Promise.reject(oError1),
				oPatchPromise1 = Promise.resolve(oPatchPromise0),
				fnReject,
				fnResolve,
				oPatchPromise2 = new Promise(function (resolve, reject) {
					fnResolve = resolve;
					fnReject = reject;
				}),
				fnPatchSent = function () {},
				bPatchWithoutSideEffects,
				oRequestCall0,
				oRequestCall1,
				oRequestCall2,
				oRequestLock0 = {unlock : function () {}},
				oRequestLock1 = {unlock : function () {}},
				sUnitOrCurrencyPath,
				oUnlockCall,
				that = this;

			function expectPatchStart(iIndex, oGroupLock, sProperty, sOldValue, sNewValue) {
				oCacheMock.expects("fetchValue")
					.withExactArgs(sinon.match.same(_GroupLock.$cached), sEntityPath)
					.returns(SyncPromise.resolve(oEntity));
				oHelperMock.expects("buildPath").withExactArgs(sEntityPath, "Address/" + sProperty)
					.returns(sEntityPath + "/Address/" + sProperty);
				oHelperMock.expects("makeUpdateData")
					.withExactArgs(["Address", sProperty], sNewValue)
					.returns("~oUpdateData~" + iIndex);
				oHelperMock.expects("makeUpdateData")
					.withExactArgs(["Address", sProperty], sOldValue)
					.returns("~oOldData~" + iIndex);
				that.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
				that.oRequestorMock.expects("buildQueryString")
					.withExactArgs("/BusinessPartnerList", sinon.match.same(mQueryOptions), true)
					.returns("?foo=bar");
				oHelperMock.expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
						sinon.match.same(oEntity), "~oUpdateData~" + iIndex);
			}

			function expectPatchRequest(iIndex, oGroupLock, sProperty, bAtFront, oPatchPromise) {
				var oRequestCall;

				oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, sEntityPath)
					.returns("~");
				oRequestCall = that.oRequestorMock.expects("request")
					.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
						sinon.match.same(oGroupLock), {"If-Match" : sinon.match.same(oEntity)},
						"~oUpdateData~" + iIndex, sinon.match.func, sinon.match.func, undefined,
						"~", bAtFront, undefined, undefined, sinon.match.func)
					.returns(oPatchPromise);
				oCacheMock.expects("fetchTypes").withExactArgs().returns(oFetchTypesPromise);
				oHelperMock.expects("addByPath")
					.withExactArgs(sinon.match.same(oCache.mChangeRequests),
						sEntityPath + "/Address/" + sProperty, sinon.match.same(oPatchPromise));

				return oRequestCall;
			}

			oError2.canceled = true;
			oCache.fetchValue = function () {};
			expectPatchStart(0, oGroupLock0, "City", "Heidelberg", "Walldorf");
			oRequestCall0 = expectPatchRequest(0, oGroupLock0, "City", undefined, oPatchPromise0);
			SyncPromise.all([
				oPatchPromise0,
				oFetchTypesPromise
			]).catch(function () {
				oHelperMock.expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
						sinon.match.same(oPatchPromise0));
				that.oRequestorMock.expects("getGroupSubmitMode")
					.withExactArgs("group").returns(sGroupSubmitMode);
				that.oRequestorMock.expects("hasChanges")
					.exactly(sGroupSubmitMode === "Auto" ? 1 : 0)
					.withExactArgs("group", sinon.match.same(oEntity))
					.returns(oFixture.bHasChanges);
				oUnlockCall = that.mock(oRequestLock0).expects("unlock").withExactArgs();
				that.oRequestorMock.expects("lockGroup")
					.withExactArgs(
						sGroupSubmitMode === "API" || oFixture.bHasChanges
							? "group"
							: "$parked.group",
						sinon.match.same(oCache), true, true)
					.returns("~oRequestGroupLock~");
				oRequestCall2 = expectPatchRequest(0, "~oRequestGroupLock~", "City", true,
					oPatchPromise2);
				SyncPromise.all([
					oPatchPromise2,
					oFetchTypesPromise
				]).then(function () {
					oHelperMock.expects("removeByPath")
						.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
							sinon.match.same(oPatchPromise2));
					oHelperMock.expects("buildPath")
						.withExactArgs("/BusinessPartnerList", sEntityPath)
						.returns("~path~");
					oHelperMock.expects("getMetaPath").withExactArgs("~path~")
						.returns("~metapath~");
					oCacheMock.expects("visitResponse")
						.withExactArgs(sinon.match.same(oPatchResult),
							sinon.match.same(mTypeForMetaPath), "~metapath~", sEntityPath);
					oHelperMock.expects("updateExisting")
						.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
							sinon.match.same(oEntity), sinon.match.same(oPatchResult));
				}, function () {
					oHelperMock.expects("removeByPath").twice()
						.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
							sinon.match.same(oPatchPromise2));
					oHelperMock.expects("updateExisting")
						.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
							sinon.match.same(oEntity), "~oOldData~0");
					oRequestCall0.args[0][6](); // call onCancel
				});
			});

			// code under test - 1st PATCH
			oCacheUpdatePromise0 = oCache.update(oGroupLock0, "Address/City", "Walldorf", fnError0,
					"/~/BusinessPartnerList('0')", "path/to/entity", sUnitOrCurrencyPath,
					bPatchWithoutSideEffects, fnPatchSent)
				.then(function (oResult) {
					assert.notOk(bCanceled);
					sinon.assert.calledOnceWithExactly(fnError0, oError1);
					assert.strictEqual(oResult, undefined, "no result");
					assert.ok(oUnlockCall.calledBefore(oRequestCall2),
						"unlock called before second PATCH request");
				}, function (oError) {
					assert.ok(bCanceled);
					sinon.assert.calledOnceWithExactly(fnError0, oError1);
					assert.strictEqual(oError, oError2);
				});

			this.oRequestorMock.expects("lockGroup")
				.withExactArgs("group", sinon.match.same(oCache), true)
				.returns(oRequestLock0);

			// code under test - call fnSubmit of 1st PATCH
			oRequestCall0.args[0][5]();

			expectPatchStart(1, oGroupLock1, "PostalCode", "69115", "69190");
			oRequestCall1 = expectPatchRequest(1, oGroupLock1, "PostalCode", undefined,
				oPatchPromise1);
			oPatchPromise1.catch(function () {
				oHelperMock.expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mChangeRequests),
						"path/to/entity/Address/PostalCode", sinon.match.same(oPatchPromise1));
				that.mock(oRequestLock1).expects("unlock").withExactArgs()
					.callsFake(function () {
						// only if this has been unlocked too, the request is sent
						if (bCanceled) {
							fnReject(oError2);
						} else {
							fnResolve(oPatchResult);
						}
					});
			});

			// code under test - 2nd PATCH to be merged and skipped
			oCacheUpdatePromise1 = oCache.update(oGroupLock1, "Address/PostalCode", "69190",
					fnError1, "/~/BusinessPartnerList('0')", "path/to/entity", sUnitOrCurrencyPath,
					bPatchWithoutSideEffects, fnPatchSent)
				.then(function (oResult) {
					assert.notOk(bCanceled);
					sinon.assert.calledOnceWithExactly(fnError0, oError1);
					assert.strictEqual(oResult, undefined, "no result");
				}, function (oResult) {
					assert.ok(bCanceled);
					sinon.assert.calledOnceWithExactly(fnError0, oError1);
					assert.strictEqual(oResult, oError2);
				});

			this.oRequestorMock.expects("lockGroup")
				.withExactArgs("group", sinon.match.same(oCache), true)
				.returns(oRequestLock1);

			// code under test - call fnSubmit of 2nd PATCH
			oRequestCall1.args[0][5]();

			oHelperMock.expects("updateNonExisting")
				.withExactArgs("~oOldData~0", "~oOldData~1");

			// code under test - call fnMergeRequests
			assert.strictEqual(oRequestCall1.args[0][12](), "~oOldData~1");
			assert.strictEqual(oRequestCall0.args[0][12]("~oOldData~1"), undefined);

			return Promise.resolve([oCacheUpdatePromise0, oCacheUpdatePromise1]);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bError) {
	QUnit.test("_Cache#update: 2nd PATCH for an entity, error=" + bError, function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", "~mQueryOptions~"),
			oCacheMock = this.mock(oCache),
			oEntity = {
				"@odata.etag" : 'W/"19700101000000.0000000"',
				Address : {
					City : "Heidelberg"
				}
			},
			sEntityPath = "path/to/entity",
			fnError = this.spy(),
			oError = new Error(),
			sFullPath = "path/to/entity/Address/City",
			oGroupLock = {
				getGroupId : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oHelperMock = this.mock(_Helper),
			oPatchPromise0 = bError ? Promise.reject(oError) : Promise.resolve({}),
			oPatchPromise1 = Promise.resolve(oPatchPromise0),
			fnPatchSent = function () {},
			oRequestCall,
			oRequestLock = {unlock : function () {}},
			oUpdatePromise,
			that = this;

		oCache.mEditUrl2PatchPromise["/~/BusinessPartnerList('0')?foo=bar"] = oPatchPromise0;
		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sEntityPath)
			.returns(SyncPromise.resolve(oEntity));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve({}));
		oHelperMock.expects("makeUpdateData")
			.withExactArgs(["Address", "City"], "Walldorf")
			.returns("~oUpdateData~");
		oHelperMock.expects("makeUpdateData")
			.withExactArgs(["Address", "City"], "Heidelberg")
			.returns("~oOldData~");
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sEntityPath,
				sinon.match.same(oEntity), "~oUpdateData~");
		oHelperMock.expects("buildPath").withExactArgs(sEntityPath, "Address/City")
			.returns(sFullPath);
		oGroupLockMock.expects("getGroupId").withExactArgs().returns("group");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/BusinessPartnerList", "~mQueryOptions~", true)
			.returns("?foo=bar");
		oHelperMock.expects("buildPath")
			.withExactArgs(oCache.sResourcePath, sEntityPath)
			.returns("~");
		oRequestCall = this.oRequestorMock.expects("request")
			.withExactArgs("PATCH", "/~/BusinessPartnerList('0')?foo=bar",
				sinon.match.same(oGroupLock), {"If-Match" : sinon.match.same(oEntity)},
				"~oUpdateData~", sinon.match.func, sinon.match.func, undefined, "~", undefined,
				undefined, undefined, sinon.match.func)
			.returns(oPatchPromise1);
		oHelperMock.expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
				sinon.match.same(oPatchPromise1));
		oCacheMock.expects("visitResponse").never();
		oHelperMock.expects("updateExisting").never();
		this.oRequestorMock.expects("getGroupSubmitMode").never();
		this.oRequestorMock.expects("hasChanges").never();
		oPatchPromise1.catch(function () { /*finalize*/ }).finally(function () {
			oHelperMock.expects("removeByPath")
				.withExactArgs(sinon.match.same(oCache.mChangeRequests), sFullPath,
					sinon.match.same(oPatchPromise1));
			that.mock(oRequestLock).expects("unlock").withExactArgs();
		});

		// code under test
		oUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
			"/~/BusinessPartnerList('0')", "path/to/entity", undefined, false, fnPatchSent);

		this.oRequestorMock.expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oCache), true)
			.returns(oRequestLock);

		// code under test - call fnSubmit
		oRequestCall.args[0][5]();

		// code under test - call fnMergeRequests
		assert.strictEqual(oRequestCall.args[0][12](), "~oOldData~");

		return oUpdatePromise.then(function () {
			assert.notOk(bError);
			assert.notOk(fnError.called);
		}, function (oResult) {
			assert.ok(bError);
			sinon.assert.calledOnceWithExactly(fnError, oError);
			assert.strictEqual(oResult, oError);
		}).finally(function () {
			assert.deepEqual(oCache.mEditUrl2PatchPromise, {});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#update: failure, group submit mode Direct", function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}),
			oCacheMock = this.mock(oCache),
			oCacheUpdatePromise,
			oEntity = {
				"@odata.etag" : 'W/"19700101000000.0000000"',
				Address : {
					City : "Heidelberg"
				}
			},
			fnError = this.spy(),
			fnIsKeepAlive = "~fnIsKeepAlive~",
			oError = new Error(),
			oGroupLock = {getGroupId : function () {}},
			oPatchPromise = Promise.reject(oError),
			oRequestCall,
			oRequestLock = {unlock : function () {}},
			oUpdateData = {
				Address : {
					City : "Walldorf"
				}
			},
			that = this;

		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "('0')/path/to/entity")
			.returns(SyncPromise.resolve(oEntity));
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
		oRequestCall = this.oRequestorMock.expects("request")
			.withExactArgs("PATCH", "/~/BusinessPartnerList('0')",
				sinon.match.same(oGroupLock), {"If-Match" : sinon.match.same(oEntity)},
				oUpdateData, sinon.match.func, sinon.match.func, undefined,
				oCache.sResourcePath + "('0')/path/to/entity", undefined, undefined, undefined,
				sinon.match.func)
			.returns(oPatchPromise);
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests),
				"('0')/path/to/entity/Address/City", sinon.match(function (oPromise) {
					return oPromise === oPatchPromise
						&& oPromise.$isKeepAlive === "~fnIsKeepAlive~";
				}));
		this.oRequestorMock.expects("getGroupSubmitMode")
			.withExactArgs("group").returns("Direct");
		this.mock(_Helper).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests),
				"('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));

		oPatchPromise.catch(function () {
			that.mock(oRequestLock).expects("unlock").withExactArgs();
		});

		// code under test
		oCacheUpdatePromise = oCache.update(oGroupLock, "Address/City", "Walldorf", fnError,
				"/~/BusinessPartnerList('0')", "('0')/path/to/entity",
				/*sUnitOrCurrencyPath*/undefined, /*bPatchWithoutSideEffects*/undefined,
				function fnPatchSent() {}, fnIsKeepAlive)
			.then(function () {
				assert.ok(false);
			}, function (oResult) {
				sinon.assert.calledOnceWithExactly(fnError, oError);
				assert.strictEqual(oResult, oError);
			});

		this.mock(this.oRequestor).expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oCache), true)
			.returns(oRequestLock);

		// code under test
		oRequestCall.args[0][5](); // call onSubmit

		return oCacheUpdatePromise;
	});

	//*********************************************************************************************
[true, false].forEach(function (bCanceled) {
	var sTitle = "_Cache#update: failure w/o fnErrorCallback and oError.canceled: " + bCanceled;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}),
			oEntity = {
				"@odata.etag" : 'W/"19700101000000.0000000"',
				Address : {
					City : "Heidelberg"
				}
			},
			oError = new Error(),
			oGroupLock = {getGroupId : function () {}},
			oPatchPromise = Promise.reject(oError),
			oUpdateData = {
				Address : {
					City : "Walldorf"
				}
			};

		oError.canceled = bCanceled;
		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "('0')/path/to/entity")
			.returns(SyncPromise.resolve(oEntity));
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
		this.oRequestorMock.expects("request")
			.withExactArgs("PATCH", "/~/BusinessPartnerList('0')",
				sinon.match.same(oGroupLock), {"If-Match" : sinon.match.same(oEntity)},
				oUpdateData, sinon.match.func, sinon.match.func, undefined,
				oCache.sResourcePath + "('0')/path/to/entity", undefined, undefined, undefined,
				sinon.match.func)
			.returns(oPatchPromise);
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests),
				"('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));
		this.oRequestorMock.expects("getGroupSubmitMode").never();
		this.mock(_Helper).expects("updateExisting")
			.exactly(bCanceled ? 0 : 1)
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('0')/path/to/entity",
				sinon.match.same(oEntity), {Address : {City : "Heidelberg"}});
		this.mock(_Helper).expects("removeByPath")
			.withExactArgs(sinon.match.same(oCache.mChangeRequests),
				"('0')/path/to/entity/Address/City", sinon.match.same(oPatchPromise));

		// code under test
		return oCache.update(oGroupLock, "Address/City", "Walldorf",
				/*fnErrorCallback*/undefined, "/~/BusinessPartnerList('0')", "('0')/path/to/entity",
				undefined, undefined, function () {})
			.then(function () {
				assert.ok(false);
			}, function (oResult) {
				assert.strictEqual(oResult, oError);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#update: invalid entity path", function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}),
			oGroupLock = {getGroupId : function () {}};

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity")
			.returns(SyncPromise.resolve(undefined));
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");

		return oCache.update(oGroupLock, "foo", "bar", this.mock().never(),
			"/~/BusinessPartnerList('0')", "path/to/entity"
		).then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message,
				"Cannot update 'foo': 'path/to/entity' does not exist");
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#update: unexpected error", function (assert) {
		var oCache = new _Cache(this.oRequestor, "BusinessPartnerList", {}),
			oError = new Error("This call intentionally failed");

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to/entity")
			.throws(oError);

		assert.throws(function () {
			// code under test
			oCache.update(null, "foo", "bar", this.mock().never(), "/n/a", "path/to/entity");
		}, oError);
	});

	//*********************************************************************************************
	[{
		options : undefined,
		types : ["/TEAMS"]
	}, {
		options : {$select : ["foo"]},
		types : ["/TEAMS"]
	}, {
		options : {
			$expand : {
				MANAGER : null,
				TEAM_2_EMPLOYEES : {
					$expand : {
						"EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT" : null,
						"Address/Country" : null
					}
				}
			}
		},
		types : [
			"/TEAMS",
			"/TEAMS/MANAGER",
			"/TEAMS/TEAM_2_EMPLOYEES",
			"/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT",
			"/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENT/EQUIPMENT_2_PRODUCT",
			"/TEAMS/TEAM_2_EMPLOYEES/Address",
			"/TEAMS/TEAM_2_EMPLOYEES/Address/Country"
		]
	}].forEach(function (oFixture, i) {
		QUnit.test("Cache#fetchTypes #" + i, function (assert) {
			var oCache = new _Cache(this.oRequestor, "TEAMS('42')", oFixture.options),
				iCount = 0,
				that = this,
				aExpectations = oFixture.types.map(function (sPath) {
					return that.oRequestorMock.expects("fetchType")
						.withExactArgs(sinon.match.object, sPath)
						.returns(new Promise(function (resolve) {
							setTimeout(function () {
								iCount += 1;
								resolve();
							});
						}));
				}),
				oPromise;

			// code under test
			oPromise = oCache.fetchTypes();

			assert.strictEqual(oCache.fetchTypes(), oPromise, "second call returns same promise");
			return oPromise.then(function (mTypeForMetaPath) {
				aExpectations.forEach(function (oExpectation) {
					assert.strictEqual(oExpectation.args[0][0], mTypeForMetaPath);
				});
				assert.strictEqual(iCount, aExpectations.length);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#getTypes", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Foo"),
			oSyncPromise = {
				getResult : mustBeMocked
			};

		this.mock(oCache).expects("fetchTypes").withExactArgs().returns(oSyncPromise);
		this.mock(oSyncPromise).expects("getResult").withExactArgs().returns("~mTypeForMetaPath~");

		// code under test
		assert.strictEqual(oCache.getTypes(), "~mTypeForMetaPath~");
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: key predicates: ignore simple values", function () {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Foo"),
			oCacheMock = this.mock(oCache),
			oInstance = {results : ["Business Suite"]},
			mTypeForMetaPath = {};

		oCacheMock.expects("checkSharedRequest").never();
		oCacheMock.expects("calculateKeyPredicate").never();

		// code under test
		oCache.visitResponse("Business Suite", mTypeForMetaPath);

		// code under test
		oCache.visitResponse({value : ["Business Suite"]}, mTypeForMetaPath, undefined,
			undefined, 0);

		// code under test
		oCache.visitResponse(undefined, mTypeForMetaPath);

		// code under test
		oCache.visitResponse(null, mTypeForMetaPath);

		// code under test
		oCache.visitResponse("", mTypeForMetaPath);

		// code under test
		oCache.visitResponse(true, mTypeForMetaPath);

		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oInstance), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo").twice();

		// code under test
		oCache.visitResponse(oInstance, mTypeForMetaPath);

		// code under test
		oCache.visitResponse({value : [oInstance]}, mTypeForMetaPath, undefined, undefined, 0);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: key predicates: simple entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {},
			sPredicate = "('4711')",
			mTypeForMetaPath = {"/TEAMS" : {$Key : []}};

		this.mock(oCache).expects("checkSharedRequest").never();
		this.mock(_Helper).expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity),
				"/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate);
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: key predicates: with root entity meta path",
			function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oEntity = {},
			sPredicate = "('4711')",
			mTypeForMetaPath = {"/~/$Type" : {$Key : []}};

		this.mock(oCache).expects("checkSharedRequest").never();
		this.mock(_Helper).expects("getKeyPredicate").withExactArgs(sinon.match.same(oEntity),
			"/~/$Type", sinon.match.same(mTypeForMetaPath))
			.returns(sPredicate);
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse(oEntity, mTypeForMetaPath, "/~/$Type");

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: key predicates: nested", function (assert) {
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

		this.mock(oCache).expects("checkSharedRequest").never();
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
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar, "predicate"), sPredicate2);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar.baz, "predicate"), sPredicate3);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property, "predicate"), undefined);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.property.navigation, "predicate"),
			sPredicate4);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.noType, "predicate"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: key predicates: entity collection", function (assert) {
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

		this.mock(oCache).expects("checkSharedRequest").never();
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
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse(oEntity, mTypeForMetaPath);

		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity, "predicate"), sPredicate1);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[0], "predicate"), sPredicate2);
		assert.strictEqual(_Helper.getPrivateAnnotation(oEntity.bar[1], "predicate"), undefined);
		assert.strictEqual(oEntity.bar.$byPredicate[sPredicate2], oEntity.bar[0]);
		assert.notOk(undefined in oEntity.bar.$byPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: reportStateMessages; single entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')", {}, false,
				"original/resource/path"),
			aMessagesInBusinessPartner = [{/* any message object */}],
			aMessagesSalesOrder = [{/* any message object */}],
			aMessagesSalesOrderSchedules0 = [{/* any message object */}],
			aMessagesSalesOrderSchedules1 = [{/* any message object */}],
			aMessagesEmpty = [],
			oData = {
				messagesInSalesOrder : aMessagesSalesOrder,
				SO_2_BP : {
					messagesInBusinessPartner : aMessagesInBusinessPartner
				},
				SO_2_SCHDL : [{
					messagesInSalesOrderSchedule : aMessagesSalesOrderSchedules0,
					ScheduleKey : "42"
				}, {
					ScheduleKey : "43"
				}, {
					messagesInSalesOrderSchedule : aMessagesSalesOrderSchedules1,
					ScheduleKey : "44"
				}, {
					messagesInSalesOrderSchedule : null,
					ScheduleKey : "45"
				}, {
					messagesInSalesOrderSchedule : aMessagesEmpty,
					ScheduleKey : "46"
				}]
			},
			mExpectedMessages = {
				"" : aMessagesSalesOrder,
				SO_2_BP : aMessagesInBusinessPartner,
				"SO_2_SCHDL('42')" : aMessagesSalesOrderSchedules0,
				"SO_2_SCHDL('44')" : aMessagesSalesOrderSchedules1
			},
			mTypeForMetaPath = {
				"/SalesOrderList" : {
					"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messagesInSalesOrder"}
				},
				"/SalesOrderList/SO_2_BP" : {
					"@com.sap.vocabularies.Common.v1.Messages" :
						{$Path : "messagesInBusinessPartner"}
				},
				"/SalesOrderList/SO_2_SCHDL" : {
					"@com.sap.vocabularies.Common.v1.Messages" :
						{$Path : "messagesInSalesOrderSchedule"},
					$Key : ["ScheduleKey"],
					ScheduleKey : {
						$Type : "Edm.String"
					}
				}
			};

		// Note: no calls for null or empty array!
		this.mock(oCache).expects("checkSharedRequest").withExactArgs().exactly(4);
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, undefined);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath);

		assert.notOk("$created" in aMessagesInBusinessPartner);
		assert.notOk("$count" in aMessagesInBusinessPartner);
		assert.notOk("$created" in aMessagesSalesOrder);
		assert.notOk("$count" in aMessagesSalesOrder);
		assert.notOk("$created" in aMessagesSalesOrderSchedules0);
		assert.notOk("$count" in aMessagesSalesOrderSchedules0);
		assert.notOk("$created" in aMessagesSalesOrderSchedules1);
		assert.notOk("$count" in aMessagesSalesOrderSchedules1);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: reportStateMessages; nested; to 1 navigation property",
			function () {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')", {}, false,
				"original/resource/path"),
			aMessagesInBusinessPartner = [{/* any message object */}],
			oData = {
				messagesInBusinessPartner : aMessagesInBusinessPartner
			},
			mExpectedMessages = {
				SO_2_BP : aMessagesInBusinessPartner
			},
			mTypeForMetaPath = {
				"/SalesOrderList/SO_2_BP" : {
					"@com.sap.vocabularies.Common.v1.Messages" :
						{$Path : "messagesInBusinessPartner"}
				}
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, ["SO_2_BP"]);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_BP", "SO_2_BP");
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: reportStateMessages; nested; collection entity", function () {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList", {}, false,
				"original/resource/path"),
			aMessagesInBusinessPartner = [{/* any message object */}],
			oData = {
				messagesInBusinessPartner : aMessagesInBusinessPartner
			},
			mExpectedMessages = {
				"('0500000001')/SO_2_BP" : aMessagesInBusinessPartner
			},
			mTypeForMetaPath = {
				"/SalesOrderList/SO_2_BP" : {
					"@com.sap.vocabularies.Common.v1.Messages" :
						{$Path : "messagesInBusinessPartner"}
				}
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, ["('0500000001')/SO_2_BP"]);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_BP",
			"('0500000001')/SO_2_BP");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bMissingPredicate) {
		var sTitle = "Cache#visitResponse: reportStateMessages for new entity"
			+ ", bMissingPredicate=" + bMissingPredicate;

		QUnit.test(sTitle, function () {
			var oCache = new _Cache(this.oRequestor, "SalesOrderList", {}, false,
					"original/resource/path"),
				aMessages = [{/* any message object */}],
				oData = {
					Messages : aMessages,
					SalesOrderID : "0500000001"
				},
				mExpectedMessages = {},
				sTransientPredicate = "($uid=id-1-23)",
				sMessagePath = bMissingPredicate ? sTransientPredicate : "('0500000001')",
				mTypeForMetaPath = {
					"/SalesOrderList" : {
						"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "Messages"},
						$Key : ["SalesOrderID"],
						SalesOrderID : {
							$Type : "Edm.String"
						}
					}
				};

			if (bMissingPredicate) {
				delete oData.SalesOrderID; // missing key property -> no key predicate available
			}
			mExpectedMessages[sMessagePath] = aMessages;

			this.mock(oCache).expects("checkSharedRequest").withExactArgs();
			this.oModelInterfaceMock.expects("reportStateMessages")
				.withExactArgs("original/resource/path", mExpectedMessages, [sMessagePath]);

			// code under test
			oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList", sTransientPredicate);
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: reportStateMessages for new nested entity", function () {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList", {}, false,
				"original/resource/path"),
			aMessages = [{/* any message object */}],
			oData = {
				ItemPosition : "42",
				Messages : aMessages,
				SalesOrderID : "0500000001"
			},
			mExpectedMessages = {
				"('0500000001')/SO_2_SOITEM(SalesOrderID='0500000001',ItemPosition='42')" :
					aMessages
			},
			sTransientPredicate = "($uid=id-1-23)",
			mTypeForMetaPath = {
				"/SalesOrderList/SO_2_SOITEM" : {
					"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "Messages"},
					$Key : ["SalesOrderID", "ItemPosition"],
					ItemPosition : {
						$Type : "Edm.String"
					},
					SalesOrderID : {
						$Type : "Edm.String"
					}
				}
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages,
				["('0500000001')/SO_2_SOITEM(SalesOrderID='0500000001',ItemPosition='42')"]);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath, "/SalesOrderList/SO_2_SOITEM",
			"('0500000001')/SO_2_SOITEM" + sTransientPredicate);
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: no reportStateMessages if message property is not selected",
			function () {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')");

		this.mock(oCache).expects("checkSharedRequest").never();
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse({}, {
			"/SalesOrderList" : {
				"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messagesInSalesOrder"}
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#visitResponse: no reportStateMessages; message in complex type", function () {
		var oCache = new _Cache(this.oRequestor, "SalesOrderList('0500000001')"),
			oData = {};

		this.mock(_Helper).expects("drillDown")
			.withExactArgs(oData, ["foo", "bar", "messages"])
			.returns();
		this.mock(oCache).expects("checkSharedRequest").never();
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse(oData, {
			"/SalesOrderList" : {
				"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "foo/bar/messages"}
			}
		});
	});

	//*********************************************************************************************
	[
		{iStart : 0, bPredicate : false},
		{iStart : 13, bPredicate : false},
		{iStart : 23, bPredicate : true}
	].forEach(function (oFixture) {
		var sTitle = "visitResponse: reportStateMessages; collection with"
				+ (oFixture.bPredicate ? "" : "out") + " key properties, iStart="
				+ oFixture.iStart;

		QUnit.test(sTitle, function () {
			var oCache = new _Cache(this.oRequestor, "SalesOrderList", {}, false,
					"original/resource/path"),
				sFirst,
				oHelperMock = this.mock(_Helper),
				aMessagePathSegments = ["messagesInSalesOrder"],
				aMessagesSalesOrder0 = [{/* any message object */}],
				aMessagesSalesOrder1 = [{/* any message object */}],
				oData = {value : [{}, {}, {}]},
				mExpectedMessages = {},
				sSecond,
				sThird,
				mTypeForMetaPath = {
					"/SalesOrderList" : {
						"@com.sap.vocabularies.Common.v1.Messages" : {
							$Path : "messagesInSalesOrder"
						},
						$Key : ["SalesOrderID"],
						SalesOrderID : {
							$Type : "Edm.String"
						}
					}
				};

			if (oFixture.bPredicate) {
				sFirst = "('42')";
				sSecond = "('43')";
				sThird = "('44')";
			} else {
				sFirst = oFixture.iStart.toString();
				sSecond = (oFixture.iStart + 1).toString();
				sThird = (oFixture.iStart + 2).toString();
			}
			mExpectedMessages[sFirst] = aMessagesSalesOrder0;
			mExpectedMessages[sSecond] = aMessagesSalesOrder1;
			// $count and key predicates are also computed for messages array
			mExpectedMessages[sFirst].$count = 1;
			mExpectedMessages[sFirst].$byPredicate = {}; // no key predicates
			mExpectedMessages[sSecond].$count = 0;
			mExpectedMessages[sSecond].$byPredicate = {}; // no key predicates
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[0]), [])
				.returns(oFixture.bPredicate ? {SalesOrderID : "42"} : {});
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[1]), [])
				.returns(oFixture.bPredicate ? {SalesOrderID : "43"} : {});
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[2]), [])
				.returns(oFixture.bPredicate ? {SalesOrderID : "44"} : {});
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[0]), aMessagePathSegments)
				.returns(aMessagesSalesOrder0);
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[1]), aMessagePathSegments)
				.returns(aMessagesSalesOrder1);
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[2]), aMessagePathSegments)
				.returns([]);
			this.mock(oCache).expects("checkSharedRequest").withExactArgs().twice();
			this.oModelInterfaceMock.expects("reportStateMessages")
				.withExactArgs("original/resource/path", mExpectedMessages,
					[sFirst, sSecond, sThird]);

			// code under test
			oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, oFixture.iStart);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bPredicate) {
		var sTitle = "visitResponse: reportStateMessages; nested collection, key properties: "
				+ bPredicate;

		QUnit.test(sTitle, function () {
			var oCache = new _Cache(this.oRequestor, "SalesOrderList", {}, false,
					"original/resource/path"),
				oHelperMock = this.mock(_Helper),
				aMessages = [{/* any message object */}],
				oData = {
					value : [{
						SO_2_SOITEM : [{
							messages : []
						}, {
							messages : aMessages
						}]
					}]
				},
				mExpectedMessages = {},
				mTypeForMetaPath = {
					"/SalesOrderList" : {
						$Key : ["SalesOrderID"],
						SalesOrderID : {
							$Type : "Edm.String"
						}
					},
					"/SalesOrderList/SO_2_SOITEM" : {
						"@com.sap.vocabularies.Common.v1.Messages" : {
							$Path : "messages"
						},
						$Key : ["SalesOrderItemID"],
						SalesOrderItemID : {
							$Type : "Edm.String"
						}
					}
				};

			if (bPredicate) {
				oData.value[0].SalesOrderID = "42";
				oData.value[0].SO_2_SOITEM[0].SalesOrderItemID = "42.0";
				oData.value[0].SO_2_SOITEM[1].SalesOrderItemID = "42.1";
			}
			mExpectedMessages[bPredicate ? "('42')/SO_2_SOITEM('42.1')" : "5/SO_2_SOITEM/1"]
				= aMessages;

			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[0]), [])
				.returns(oData.value[0]);
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[0].SO_2_SOITEM[0]), [])
				.returns(oData.value[0].SO_2_SOITEM[0]);
			oHelperMock.expects("drillDown")
				.withExactArgs(sinon.match.same(oData.value[0].SO_2_SOITEM[1]), [])
				.returns(oData.value[0].SO_2_SOITEM[1]);
			oHelperMock.expects("drillDown")
				.withExactArgs(oData.value[0].SO_2_SOITEM[0], ["messages"])
				.returns([]);
			oHelperMock.expects("drillDown")
				.withExactArgs(oData.value[0].SO_2_SOITEM[1], ["messages"])
				.returns(aMessages);
			this.mock(oCache).expects("checkSharedRequest").withExactArgs();
			this.oModelInterfaceMock.expects("reportStateMessages")
				.withExactArgs("original/resource/path", mExpectedMessages,
					[bPredicate ? "('42')" : "5"]);

			// code under test
			oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, 5);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#visitResponse: longtextUrl/media link, no context", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation", {}, false,
				"original/resource/path"),
			oData = {
				id : "1",
				"picture1@odata.mediaReadLink" : "img_1.jpg",
				"picture2@mediaReadLink" : "img_2.jpg", // OData V4.01 format
				messages : [{
					longtextUrl : "Longtext(1)"
				}]
			},
			mExpectedMessages = {
				"" : [{longtextUrl : "/~/EntitySet('42')/Longtext(1)"}]
			},
			oType = {
				"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messages"},
				$Key : ["id"],
				id : {
					$Type : "Edm.Int32"
				}
			},
			mTypeForMetaPath = {
				"/EntitySet/Navigation" : oType
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, undefined);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath);

		assert.strictEqual(oData["picture1@odata.mediaReadLink"], "/~/EntitySet('42')/img_1.jpg");
		assert.strictEqual(oData["picture2@mediaReadLink"], "/~/EntitySet('42')/img_2.jpg");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#visitResponse: longtextUrl/media link, single response", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation", {}, false,
				"original/resource/path"),
			oData = {
				"@odata.context" : "../$metadata#foo",
				id : "1",
				"picture@odata.mediaReadLink" : "img_42.jpg",
				messages : [{
					longtextUrl : "Longtext(1)"
				}],
				foo : {
					"@odata.context" : "/foo/context",
					id : "2",
					"picture@odata.mediaReadLink" : "img_43.jpg",
					messages : [{
						longtextUrl : "Longtext(2)"
					}],
					bar : {
						id : "3",
						"picture@odata.mediaReadLink" : "img_44.jpg",
						messages : [{
							longtextUrl : "Longtext(3)"
						}]
					},
					baz : {
						"@odata.context" : "baz/context",
						id : "4",
						"picture@odata.mediaReadLink" : "img_45.jpg",
						messages : [{
							longtextUrl : "Longtext(4)"
						}]
					}
				}
			},
			mExpectedMessages = {
				"" : [{longtextUrl : "/~/Longtext(1)"}],
				foo : [{longtextUrl : "/foo/Longtext(2)"}],
				"foo/bar" : [{longtextUrl : "/foo/Longtext(3)"}],
				"foo/baz" : [{longtextUrl : "/foo/baz/Longtext(4)"}]
			},
			oType = {
				"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messages"},
				$Key : ["id"],
				id : {
					$Type : "Edm.Int32"
				}
			},
			mTypeForMetaPath = {
				"/EntitySet/Navigation" : oType,
				"/EntitySet/Navigation/foo" : oType,
				"/EntitySet/Navigation/foo/bar" : oType,
				"/EntitySet/Navigation/foo/baz" : oType
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs().exactly(4);
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, undefined);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath);

		// check adjusted cache
		assert.strictEqual(oData["picture@odata.mediaReadLink"], "/~/img_42.jpg");
		assert.strictEqual(oData.messages[0].longtextUrl, "/~/Longtext(1)");
		assert.strictEqual(oData.foo["picture@odata.mediaReadLink"], "/foo/img_43.jpg");
		assert.strictEqual(oData.foo.messages[0].longtextUrl, "/foo/Longtext(2)");
		assert.strictEqual(oData.foo.bar["picture@odata.mediaReadLink"], "/foo/img_44.jpg");
		assert.strictEqual(oData.foo.bar.messages[0].longtextUrl, "/foo/Longtext(3)");
		assert.strictEqual(oData.foo.baz["picture@odata.mediaReadLink"], "/foo/baz/img_45.jpg");
		assert.strictEqual(oData.foo.baz.messages[0].longtextUrl, "/foo/baz/Longtext(4)");
	});

	//*********************************************************************************************
	QUnit.test("_Cache#visitResponse: longtextUrl/media, collection response", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation", {}, false,
				"original/resource/path"),
			oData = {
				"@odata.context" : "../$metadata#foo",
				value : [{
					id : "1",
					"picture@odata.mediaReadLink" : "img_1.jpg",
					messages : [{
						longtextUrl : "Longtext(1)"
					}],
					"foo@odata.context" : "/foo/context",
					foo : [{
						id : "2",
						"picture@odata.mediaReadLink" : "img_2.jpg",
						messages : [{
							longtextUrl : "Longtext(2)"
						}],
						"bar@odata.context" : "bar/context",
						bar : [{
							id : "3",
							"picture@odata.mediaReadLink" : "img_3.jpg",
							messages : [{
								longtextUrl : "Longtext(3)"
							}]
						}]
					}]
				}]
			},
			mExpectedMessages = {
				"(1)" : [{longtextUrl : "/~/Longtext(1)"}],
				"(1)/foo(2)" : [{longtextUrl : "/foo/Longtext(2)"}],
				"(1)/foo(2)/bar(3)" : [{longtextUrl : "/foo/bar/Longtext(3)"}]
			},
			oType = {
				"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messages"},
				$Key : ["id"],
				id : {
					$Type : "Edm.Int32"
				}
			},
			mTypeForMetaPath = {
				"/EntitySet/Navigation" : oType,
				"/EntitySet/Navigation/foo" : oType,
				"/EntitySet/Navigation/foo/bar" : oType
			};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs().thrice();
		this.oModelInterfaceMock.expects("reportStateMessages")
			.withExactArgs("original/resource/path", mExpectedMessages, ["(1)"]);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath, undefined, undefined, 0);

		// check adjusted cache
		assert.strictEqual(oData.value[0]["picture@odata.mediaReadLink"], "/~/img_1.jpg");
		assert.strictEqual(oData.value[0].messages[0].longtextUrl, "/~/Longtext(1)");
		assert.strictEqual(oData.value[0].foo[0]["picture@odata.mediaReadLink"], "/foo/img_2.jpg");
		assert.strictEqual(oData.value[0].foo[0].messages[0].longtextUrl, "/foo/Longtext(2)");
		assert.strictEqual(oData.value[0].foo[0].bar[0]["picture@odata.mediaReadLink"],
			"/foo/bar/img_3.jpg");
		assert.strictEqual(oData.value[0].foo[0].bar[0].messages[0].longtextUrl,
			"/foo/bar/Longtext(3)");
	});

	//*********************************************************************************************
[false, true].forEach(function (bSharedRequest) {
	[false, true].forEach(function (bKeepReportedMessagesPath) {
		var sTitle = "_Cache#visitResponse: operation message; bSharedRequest = " + bSharedRequest
				+ "; bKeepReportedMessagesPath = " + bKeepReportedMessagesPath;

	QUnit.test(sTitle, function (assert) {
		var sResourcePath = "OperationImport",
			oCache = _Cache.createSingle(this.oRequestor, sResourcePath, {}, false, false,
				"original/resource/path"),
			oData = {
				messages : [{
					message : "text"
				}]
			},
			mExpectedMessages = {
				"" : [{
					message : "text"
				}]
			},
			mTypeForMetaPath = {
				"/OperationImport" : {
					"@com.sap.vocabularies.Common.v1.Messages" : {$Path : "messages"},
					$Key : ["id"],
					id : {$Type : "Edm.Int32"}
				}
			};

		oCache.bSharedRequest = bSharedRequest;
		oCache.sReportedMessagesPath = "~sReportedMessagesPath~";
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oModelInterfaceMock.expects("reportStateMessages").exactly(bSharedRequest ? 0 : 1)
			.withExactArgs("original/resource/path", mExpectedMessages, undefined);

		// code under test
		oCache.visitResponse(oData, mTypeForMetaPath, undefined, "", undefined,
			bKeepReportedMessagesPath);

		assert.strictEqual(oCache.sReportedMessagesPath, bSharedRequest || bKeepReportedMessagesPath
			? "~sReportedMessagesPath~"
			: "original/resource/path");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#patch", function (assert) {
		var oCache = new _Cache(this.oRequestor, "EntitySet('42')/Navigation"),
			oCacheValue = {},
			oData = {},
			sPath = "path/to/Entity";

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sPath)
			.returns(SyncPromise.resolve(oCacheValue));
		this.mock(_Helper).expects("updateExisting")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sPath,
				sinon.match.same(oCacheValue), sinon.match.same(oData));

		// code under test
		return oCache.patch(sPath, oData).then(function (vResult) {
			assert.strictEqual(vResult, oCacheValue);
		});
	});

	//*********************************************************************************************
[undefined, "~"].forEach(function (sReportedMessagesPath) {
	var sTitle = "_Cache#removeMessages, sReportedMessagesPath = " + sReportedMessagesPath;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')");

		oCache.sReportedMessagesPath = sReportedMessagesPath;

		this.oModelInterfaceMock.expects("reportStateMessages")
			.exactly(sReportedMessagesPath ? 1 : 0)
			.withExactArgs(sReportedMessagesPath, {});

		// code under test
		oCache.removeMessages();

		assert.strictEqual(oCache.sReportedMessagesPath, undefined);
		assert.ok(oCache.hasOwnProperty("sReportedMessagesPath"));
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#addPendingRequest, _Cache#removePendingRequest", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')"),
			oPendingRequestsPromise;

		assert.strictEqual(oCache.oPendingRequestsPromise, null);

		// code under test
		oCache.addPendingRequest();

		oPendingRequestsPromise = oCache.oPendingRequestsPromise;
		assert.ok(oPendingRequestsPromise instanceof SyncPromise);
		assert.strictEqual(oPendingRequestsPromise.$count, 1);

		// code under test
		assert.strictEqual(oCache.getPendingRequestsPromise(), oPendingRequestsPromise.getResult());

		// code under test
		oCache.addPendingRequest();

		assert.strictEqual(oCache.oPendingRequestsPromise, oPendingRequestsPromise);
		assert.strictEqual(oPendingRequestsPromise.$count, 2);

		// code under test
		oCache.removePendingRequest();

		assert.strictEqual(oCache.oPendingRequestsPromise, oPendingRequestsPromise);
		assert.strictEqual(oPendingRequestsPromise.isPending(), true);
		assert.strictEqual(oPendingRequestsPromise.$count, 1);

		// code under test
		oCache.removePendingRequest();

		assert.strictEqual(oCache.oPendingRequestsPromise, null);
		assert.strictEqual(oPendingRequestsPromise.isPending(), false);
		assert.strictEqual(oPendingRequestsPromise.getResult(), undefined);
		assert.strictEqual(oPendingRequestsPromise.$count, 0);

		// code under test
		oCache.removePendingRequest();

		assert.strictEqual(oCache.oPendingRequestsPromise, null);

		return oPendingRequestsPromise;
	});

	//*********************************************************************************************
[false, true].forEach(function (bTransient) {
	QUnit.test("_Cache#replaceElement, bTransient= " + bTransient, function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('0')"),
			oElement = {},
			aElements = [],
			oOldElement = {},
			sTransientPredicate = "($uid=id-1-23)",
			mTypeForMetaPath = {};

		aElements[3] = oOldElement;
		aElements.$byPredicate = {"('42')" : oOldElement};
		if (bTransient) {
			aElements.$byPredicate[sTransientPredicate] = oOldElement;
		}
		this.mock(_Cache).expects("getElementIndex")
			.withExactArgs(sinon.match.same(aElements), "('42')", 4)
			.returns(3);
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oOldElement), "transientPredicate")
			.returns(bTransient ? sTransientPredicate : undefined);
		this.mock(_Helper).expects("setPrivateAnnotation")
			.exactly(bTransient ? 1 : 0)
			.withExactArgs(sinon.match.same(oElement), "transientPredicate",
				sTransientPredicate);
		this.mock(_Helper).expects("copySelected")
			.withExactArgs(sinon.match.same(oOldElement), sinon.match.same(oElement));
		this.mock(_Helper).expects("restoreUpdatingProperties")
			.withExactArgs(sinon.match.same(oOldElement), sinon.match.same(oElement));
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/TEAMS", "TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS")
			.returns("/TEAMS/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS");
		this.mock(_Helper).expects("getMetaPath")
			.withExactArgs("/TEAMS/TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS")
			.returns("/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENTS");
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oElement), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/TEAM_2_EMPLOYEES/EMPLOYEE_2_EQUIPMENTS",
				"TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS('42')", undefined,
				"~bKeepReportedMessagesPath~");

		// code under test
		oCache.replaceElement(aElements, 4, "('42')", oElement, mTypeForMetaPath,
			"TEAM_2_EMPLOYEES('23')/EMPLOYEE_2_EQUIPMENTS", "~bKeepReportedMessagesPath~");

		assert.strictEqual(aElements[3], oElement);
		assert.strictEqual(aElements.$byPredicate["('42')"], oElement);
		assert.strictEqual(aElements.$byPredicate[sTransientPredicate],
			bTransient ? oElement : undefined);
		assert.strictEqual(aElements[3]["@$ui5.context.isTransient"],
			bTransient ? false : undefined);
	});
});

	//*********************************************************************************************
[false, true].forEach((bHasOldElement) => {
	const sTitle = "Cache#replaceElement for an element that has no index, bHasOldElement="
		+ bHasOldElement;
	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			aElements = [{a : "doNotTouch"}],
			oNewElement = {a : "4711", b : "0815"},
			oOldElement = bHasOldElement ? {a : "0815"} : undefined,
			mTypeForMetaPath = {};

		if (bHasOldElement) {
			aElements.$byPredicate = {doNotTouch : aElements[0], "('42')" : oOldElement};
			this.mock(_Helper).expects("copySelected")
				.withExactArgs(sinon.match.same(oOldElement), sinon.match.same(oNewElement));
		} else {
			aElements.$byPredicate = {doNotTouch : aElements[0]};
			this.mock(_Helper).expects("copySelected").never();
		}

		this.mock(_Cache).expects("getElementIndex").never();
		this.mock(_Helper).expects("restoreUpdatingProperties")
			.withExactArgs(sinon.match.same(oOldElement), sinon.match.same(oNewElement));
		this.mock(_Helper).expects("buildPath").withExactArgs("/TEAMS", "~")
			.returns("~path~");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("~path~")
			.returns("~meta~path~");
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oNewElement), sinon.match.same(mTypeForMetaPath),
				"~meta~path~", "~('42')", undefined, undefined);

		// code under test
		oCache.replaceElement(aElements, undefined, "('42')", oNewElement, mTypeForMetaPath, "~");

		assert.deepEqual(aElements, [{a : "doNotTouch"}]);
		assert.deepEqual(aElements.$byPredicate,
			{doNotTouch : aElements[0], "('42')" : oNewElement});
	});
});

	//*********************************************************************************************
[
	/*{index : undefined, keepAlive : false, ...}, combination is never called, use case invalid*/
	{index : undefined, keepAlive : true, lateQueryOptions : false},
	{index : undefined, keepAlive : true, lateQueryOptions : true},
	{index : 1, keepAlive : false, lateQueryOptions : false},
	{index : 1, keepAlive : false, lateQueryOptions : true},
	{index : 1, keepAlive : true, lateQueryOptions : false},
	{index : 1, keepAlive : true, lateQueryOptions : true},
	{index : -1, keepAlive : false, lateQueryOptions : false}
].forEach(function (oFixture) {
	["", "EMPLOYEE_2_EQUIPMENTS"].forEach(function (sPath) {
		// undefined => no $select at all ;-)
		[undefined, false, true].forEach(function (bMessagesAlreadySelected) {
			var mLateQueryOptions = oFixture.lateQueryOptions ? {} : null,
				sTitle = "_Cache#refreshSingle: iIndex = " + oFixture.index
					+ ", bKeepAlive = " + oFixture.keepAlive
					+ ", mLateQueryOptions = " + mLateQueryOptions
					+ ", sPath = " + sPath
					+ ", bMessagesAlreadySelected = " + bMessagesAlreadySelected;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {/*mQueryOptions*/},
				{/*bSortExpandSelect*/}),
			oCacheMock = this.mock(oCache),
			mCacheQueryOptions = {},
			fnDataRequested = this.spy(),
			sKeyPredicate = "('13')",
			oElement = {"@$ui5._" : {predicate : sKeyPredicate}},
			aElements = oFixture.index !== undefined ? [{}, oElement, {}] : [{}, {}],
			mExpectedQueryOptions = {
				$expand : {EMPLOYEE_2_TEAM : null},
				$select : ["Name"],
				foo : "bar",
				"sap-client" : "123"
			},
			oFetchValuePromise = Promise.resolve(aElements),
			oGroupLock = {},
			oPromise,
			mQueryOptionsClone = {
				$apply : "A.P.P.L.E.", // dropped
				$count : true, // dropped
				$expand : {EMPLOYEE_2_TEAM : null},
				$filter : "age gt 40", // dropped
				$orderby : "TEAM_ID desc", // dropped
				$search : "OR", // dropped
				$select : ["Name"],
				foo : "bar",
				"sap-client" : "123"
			},
			mQueryOptionsForPath = {},
			oResponse = {},
			mTypeForMetaPath = {},
			bWithMessages = oFixture.lateQueryOptions,
			bMessagesAnnotated = bWithMessages && sPath === "" && oFixture.keepAlive;

		if (bMessagesAlreadySelected) {
			mQueryOptionsClone.$select = ["Name", "SAP_Messages"];
			mExpectedQueryOptions.$select = ["Name", "SAP_Messages"];
		} else if (bMessagesAlreadySelected === undefined) {
			delete mQueryOptionsClone.$select;
			delete mExpectedQueryOptions.$select;
		} else if (bMessagesAnnotated) {
			mExpectedQueryOptions.$select = ["Name", "SAP_Messages"];
		}
		oCache.mLateQueryOptions = mLateQueryOptions;
		aElements.$byPredicate = {};
		aElements.$byPredicate[sKeyPredicate] = oElement;
		oCache.fetchValue = function () {};
		oCacheMock.expects("checkSharedRequest").withExactArgs();
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sPath)
			// Note: CollectionCache#fetchValue may be async, $cached just sends no new request!
			.returns(SyncPromise.resolve(oFetchValuePromise));
		this.mock(_Helper).expects("aggregateExpandSelect")
			.exactly(oFixture.keepAlive && oFixture.lateQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(mQueryOptionsClone),
				sinon.match.same(mLateQueryOptions));

		// code under test
		oPromise = oCache.refreshSingle(oGroupLock, sPath, oFixture.index, sKeyPredicate,
			oFixture.keepAlive, bWithMessages, fnDataRequested);

		assert.ok(oPromise.isFulfilled, "returned a SyncPromise");
		assert.strictEqual(oCache.bSentRequest, false);

		// simulate _Cache#setQueryOptions which is still allowed because of bSentRequest
		oCache.mQueryOptions = mCacheQueryOptions;
		this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata")
			.exactly(bWithMessages && sPath === "" ? 1 : 0)
			.withExactArgs("/Employees/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.returns(SyncPromise.resolve(bMessagesAnnotated ? "SAP_Messages" : undefined));
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mCacheQueryOptions), sPath)
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mQueryOptionsForPath))
			.returns(mQueryOptionsClone);
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("Employees('31')", sPath, sKeyPredicate)
			.returns("~");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, mExpectedQueryOptions, false,
				sinon.match.same(oCache.bSortExpandSelect))
			.returns("?$select=Name");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~?$select=Name", sinon.match.same(oGroupLock), undefined,
				undefined, sinon.match.same(fnDataRequested))
			.resolves(oResponse);
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));

		return oFetchValuePromise.then(function () {
			// we are AFTER refreshSingle's then-handler, but before the GET is responded to
			assert.strictEqual(oCache.bSentRequest, true);
			assert.strictEqual(aElements.$byPredicate[sKeyPredicate], oElement, "not replaced yet");

			oCacheMock.expects("replaceElement")
				.withExactArgs(sinon.match.same(aElements), oFixture.index, sKeyPredicate,
					sinon.match.same(oResponse), sinon.match.same(mTypeForMetaPath), sPath,
					bMessagesAlreadySelected === false && bMessagesAnnotated);

			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, oResponse);
			});
		});
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#refreshSingle: No key predicate known", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')");

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS")
			// Note: CollectionCache#fetchValue may be async, $cached just sends no new request!
			.returns(SyncPromise.resolve(Promise.resolve([{/* "No key predicate known" here */}])));
		this.mock(this.oRequestor.getModelInterface()).expects("fetchMetadata").never();
		this.mock(_Helper).expects("aggregateExpandSelect").never();
		this.mock(oCache).expects("fetchTypes").never();
		this.mock(this.oRequestor).expects("buildQueryString").never();
		this.mock(this.oRequestor).expects("request").never();

		// code under test
		return oCache.refreshSingle({/*oGroupLock*/}, "EMPLOYEE_2_EQUIPMENTS", 0, "($uid=id-1-23)",
				false, /*bWithMessages*/true)
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError.message, "No key predicate known");
			});
	});

	//*********************************************************************************************
[{
	mBindingQueryOptions : {
		$apply : "A.P.P.L.E.",
		$count : true, // dropped
		$expand : {EMPLOYEE_2_TEAM : null},
		$filter : "age gt 40", // is enhanced
		$orderby : "TEAM_ID desc", // dropped
		$search : "OR",
		$select : ["Name"],
		foo : "bar",
		"sap-client" : "123"
	},
	mQueryOptionsForRequest : {
		$apply : "A.P.P.L.E.",
		$expand : {EMPLOYEE_2_TEAM : null},
		$filter : "(age gt 40) and ~key filter~",
		$search : "OR",
		$select : ["Name"],
		foo : "bar",
		"sap-client" : "123"
	}
}, {
	mBindingQueryOptions : {$filter : "age gt 40 or age lt 20"},
	mQueryOptionsForRequest : {$filter : "(age gt 40 or age lt 20) and ~key filter~"}
}, { // with transient predicate
	mBindingQueryOptions : {},
	mQueryOptionsForRequest : {$filter : "~key filter~"},
	bWithTransientPredicate : true
}].forEach(function (oFixture, i) {
	[false, true].forEach(function (bRemoved) {
		var sTitle = "_Cache#refreshSingleWithRemove: removed=" + bRemoved + ", " + i;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {/*mQueryOptions*/},
				{/*bSortExpandSelect*/}),
			oCacheMock = this.mock(oCache),
			mCacheQueryOptions = {},
			// Note: due to the inner forEach, make sure oFixture is not modified by c.u.t.!
			oClonedQueryOptions = Object.assign({}, oFixture.mBindingQueryOptions),
			fnDataRequested = this.spy(),
			sKeyPredicate = "('13')",
			oElement = {"@$ui5._" : {predicate : sKeyPredicate}},
			aElements = [{}, oElement, {}],
			oFetchValuePromise = Promise.resolve(aElements),
			oGroupLock = {},
			fnOnRemove = this.spy(),
			oPromise,
			mQueryOptionsForPath = {},
			oResponse = bRemoved
				? {value : []}
				: {value : [{Foo : "Bar"}]}, // at least an entity is returned
			sTransientPredicate = "($uid=id-1-23)",
			mTypeForMetaPath = {},
			that = this;

		aElements.$byPredicate = {};
		aElements.$byPredicate[sKeyPredicate] = oElement;
		if (oFixture.bWithTransientPredicate) {
			aElements.$byPredicate[sTransientPredicate] = oElement;
			_Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
		}
		oCache.fetchValue = function () {};
		oCacheMock.expects("checkSharedRequest").withExactArgs();
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS")
			// Note: CollectionCache#fetchValue may be async, $cached just sends no new request!
			.returns(SyncPromise.resolve(oFetchValuePromise));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));

		// code under test
		oPromise = oCache.refreshSingleWithRemove(oGroupLock, "EMPLOYEE_2_EQUIPMENTS", 1, "~",
			false, fnDataRequested, fnOnRemove);

		assert.ok(oPromise.isFulfilled, "returned a SyncPromise");
		assert.strictEqual(oCache.bSentRequest, false);

		// simulate _Cache#setQueryOptions which is still allowed because of bSentRequest
		oCache.mQueryOptions = mCacheQueryOptions;
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mCacheQueryOptions), "EMPLOYEE_2_EQUIPMENTS")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mQueryOptionsForPath))
			.returns(oClonedQueryOptions);
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("Employees('31')", "EMPLOYEE_2_EQUIPMENTS")
			.returns("~");
		this.mock(_Helper).expects("getKeyFilter")
			.withExactArgs(sinon.match.same(oElement), "/Employees",
				sinon.match.same(mTypeForMetaPath))
			.returns("~key filter~");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, oFixture.mQueryOptionsForRequest, false,
				sinon.match.same(oCache.bSortExpandSelect))
			.returns("?$filter=...");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~?$filter=...", sinon.match.same(oGroupLock), undefined,
				undefined, sinon.match.same(fnDataRequested))
			.callsFake(function () {
				assert.strictEqual(oCache.bSentRequest, true);

				oCacheMock.expects("removeElement").exactly(bRemoved ? 1 : 0)
					.withExactArgs(1, sKeyPredicate, sinon.match.same(aElements),
						"EMPLOYEE_2_EQUIPMENTS");
				that.oModelInterfaceMock.expects("reportStateMessages")
					.exactly(bRemoved ? 1 : 0)
					.withExactArgs(oCache.sResourcePath, {}, ["EMPLOYEE_2_EQUIPMENTS('13')"]);
				oCacheMock.expects("replaceElement").exactly(bRemoved ? 0 : 1)
					.withExactArgs(sinon.match.same(aElements), 1, sKeyPredicate,
						sinon.match.same(oResponse.value[0]),
						sinon.match.same(mTypeForMetaPath), "EMPLOYEE_2_EQUIPMENTS");

				return Promise.resolve(oResponse);
			});

		return oPromise.then(function () {
			assert.deepEqual(arguments, {"0" : undefined});
			if (bRemoved) {
				sinon.assert.calledOnceWithExactly(fnOnRemove, false);
			}
		});
	});
	});
});

	//*********************************************************************************************
[
	{hasFilter : false, hasSearch : false, inCollection : true, secondQuery : false},
	/*{hasFilter : false, hasSearch : false, inCollection : false, secondQuery : false}, invalid*/
	{hasFilter : true, hasSearch : false, inCollection : true, secondQuery : true},
	{hasFilter : false, hasSearch : true, inCollection : false, secondQuery : true}
].forEach(function (oFixture) {
	var sTitle = "refreshSingleWithRemove: for (still existing) kept-alive element (in collection)"
		+ (oFixture.hasFilter ? ", binding has own filter" : "")
		+ (oFixture.hasSearch ? ", implicit filter via $search" : "")
		+ "; after refresh the entity exists and the context is"
		+ (oFixture.inCollection ? " in the collection" : " not in the collection");

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS", {/*mQueryOptions*/}),
			oCacheMock = this.mock(oCache),
			oCopySelectedExpectation,
			fnDataRequested = this.spy(),
			oElement = {"@$ui5._" : {predicate : "('13')"}},
			aElements = [oElement],
			oFetchValuePromise = Promise.resolve(aElements),
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			oGroupLockCopy = {},
			oInCollectionResponse = {
				"@odata.count" : oFixture.inCollection ? "1" : "0",
				value : []
			},
			oObjectMock = this.mock(Object),
			fnOnRemove = this.spy(),
			mQueryOptionsForInCollection = {
				$apply : "apply",
				$expand : "expand",
				$select : "select"
			},
			mQueryOptionsForPath = {},
			mQueryOptionsForPathCopy = {
				$apply : "apply",
				$expand : "expand",
				$select : "select"
			},
			oReadResponse = {value : [{}]}, // only cover cases that entity still exists
			oRemoveExpectation,
			oReplaceExpectation,
			mTypeForMetaPath = {};

		aElements.$byPredicate = {"('13')" : oElement};
		if (oFixture.hasFilter) {
			mQueryOptionsForPathCopy.$filter = mQueryOptionsForInCollection.$filter = "filter";
		}
		if (oFixture.hasSearch) {
			mQueryOptionsForPathCopy.$search = mQueryOptionsForInCollection.$search = "search";
		}

		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~")
			.returns(SyncPromise.resolve(oFetchValuePromise));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "~")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mQueryOptionsForPath))
			.returns(mQueryOptionsForPathCopy);
		this.mock(_Helper).expects("buildPath").withExactArgs("TEAMS", "~")
			.returns("~");
		this.mock(_Helper).expects("getKeyFilter")
			.withExactArgs(sinon.match.same(oElement), "/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns("~key filter~");
		this.mock(_Helper).expects("aggregateExpandSelect").never();
		oObjectMock.expects("assign")
			.withExactArgs({}, mQueryOptionsForPathCopy)
			.returns(mQueryOptionsForInCollection);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/TEAMS", mQueryOptionsForPathCopy, false,
				sinon.match.same(oCache.bSortExpandSelect))
			.returns("?readDataQuery");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~?readDataQuery", sinon.match.same(oGroupLock), undefined,
				undefined, sinon.match.same(fnDataRequested))
			.callsFake(function () {
				assert.strictEqual(oCache.bSentRequest, true);

				return Promise.resolve(oReadResponse);
			});
		this.oRequestorMock.expects("buildQueryString").exactly(oFixture.secondQuery ? 1 : 0)
			.withExactArgs("/TEAMS", mQueryOptionsForInCollection)
			.returns("?inCollectionQuery");
		this.mock(oGroupLock).expects("getUnlockedCopy").exactly(oFixture.secondQuery ? 1 : 0)
			.returns(oGroupLockCopy);
		this.oRequestorMock.expects("request").exactly(oFixture.secondQuery ? 1 : 0)
			.withExactArgs("GET", "~?inCollectionQuery", sinon.match.same(oGroupLockCopy))
			.callsFake(function () {
				assert.strictEqual(oCache.bSentRequest, true);

				return Promise.resolve(oInCollectionResponse);
			});
		oCopySelectedExpectation = this.mock(_Helper).expects("copySelected")
			.exactly(oFixture.inCollection ? 0 : 1)
			.withExactArgs(sinon.match.same(aElements.$byPredicate["('13')"]),
				sinon.match.same(oReadResponse.value[0]));
		oRemoveExpectation = oCacheMock.expects("removeElement")
			.exactly(oFixture.inCollection ? 0 : 1)
			.withExactArgs(0, "('13')", sinon.match.same(aElements), "~");
		oReplaceExpectation = oCacheMock.expects("replaceElement")
			.withExactArgs(sinon.match.same(aElements), oFixture.inCollection ? 0 : undefined,
				"('13')", sinon.match.same(oReadResponse.value[0]),
				sinon.match.same(mTypeForMetaPath), "~");

		// code under test
		return oCache.refreshSingleWithRemove(oGroupLock, "~", 0, "('13')", true,
			fnDataRequested, fnOnRemove).then(function () {
				if (oFixture.secondQuery) {
					assert.strictEqual(mQueryOptionsForInCollection.$expand, undefined);
					assert.strictEqual(mQueryOptionsForInCollection.$select, undefined);
					assert.strictEqual(mQueryOptionsForInCollection.$count, true);
					assert.strictEqual(mQueryOptionsForInCollection.$top, 0);
				}
				assert.strictEqual(mQueryOptionsForPathCopy.$apply, "apply");
				assert.strictEqual(mQueryOptionsForPathCopy.$search, undefined);
				if (!oFixture.inCollection) {
					assert.ok(oRemoveExpectation.calledAfter(oCopySelectedExpectation));
					assert.ok(oReplaceExpectation.calledAfter(oRemoveExpectation));
					sinon.assert.calledOnceWithExactly(fnOnRemove, true);
				}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshSingleWithRemove: for kept-alive element (not in list)", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS", {/*mQueryOptions*/}),
			oCacheMock = this.mock(oCache),
			fnDataRequested = this.spy(),
			oElement = {"@$ui5._" : {predicate : "('13')"}},
			aElements = [{a : "42"}],
			oExistenceResponse = {value : [{}]},
			oFetchValuePromise = Promise.resolve(aElements),
			oGroupLock = {},
			oObjectMock = this.mock(Object),
			fnOnRemove = this.spy(),
			mQueryOptionsForPath = {},
			mQueryOptionsForPathCopy = {$filter : "does~not~matter"},
			mTypeForMetaPath = {};

		aElements.$byPredicate = {"('13')" : oElement};

		oCache.fetchValue = function () {};
		oCache.mLateQueryOptions = {};

		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "~")
			.returns(SyncPromise.resolve(oFetchValuePromise));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "~")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mQueryOptionsForPath))
			.returns(mQueryOptionsForPathCopy);
		this.mock(_Helper).expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.same(mQueryOptionsForPathCopy),
				sinon.match.same(oCache.mLateQueryOptions));
		this.mock(_Helper).expects("buildPath").withExactArgs("TEAMS", "~").returns("~");
		this.mock(_Helper).expects("getKeyFilter")
			.withExactArgs(sinon.match.same(oElement), "/TEAMS", sinon.match.same(mTypeForMetaPath))
			.returns("~key filter~");
		oObjectMock.expects("assign")
			.withExactArgs({}, mQueryOptionsForPathCopy)
			.returns({/*does not matter*/});
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/TEAMS", {$filter : "~key filter~"}, false,
				sinon.match.same(oCache.bSortExpandSelect))
			.returns("?readDataQuery");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~?readDataQuery", sinon.match.same(oGroupLock), undefined,
				undefined, sinon.match.same(fnDataRequested))
			.resolves(oExistenceResponse);
		oCacheMock.expects("replaceElement")
			.withExactArgs(sinon.match.same(aElements), undefined, "('13')",
				sinon.match.same(oExistenceResponse.value[0]), sinon.match.same(mTypeForMetaPath),
				"~");

		// code under test
		return oCache.refreshSingleWithRemove(oGroupLock, "~", undefined, "('13')", true,
			fnDataRequested, fnOnRemove)
			.then(function () {
				assert.deepEqual(aElements, [{a : "42"}]);
			});
	});

	//*********************************************************************************************
	QUnit.test("refreshSingleWithRemove: server returns more than one entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {/*mQueryOptions*/},
				{/*bSortExpandSelect*/}),
			oCacheMock = this.mock(oCache),
			fnDataRequested = this.spy(),
			oElement = {"@$ui5._" : {predicate : "('13')"}},
			aElements = [{}, {}, {}, oElement],
			oFetchValuePromise = Promise.resolve(aElements),
			oGroupLock = {},
			mQueryOptionsForPath = {},
			oResult = {ID : "13"},
			mTypeForMetaPath = {};

		aElements.$byPredicate = {"('13')" : oElement};
		oCache.fetchValue = function () {};
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS")
			// Note: CollectionCache#fetchValue may be async, $cached just sends no new request!
			.returns(SyncPromise.resolve(oFetchValuePromise));
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "EMPLOYEE_2_EQUIPMENTS")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mQueryOptionsForPath))
			.returns({$filter : "age gt 40"});
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("Employees('31')", "EMPLOYEE_2_EQUIPMENTS")
			.returns("~");
		this.mock(_Helper).expects("getKeyFilter")
			.withExactArgs(sinon.match.same(oElement), "/Employees",
				sinon.match.same(mTypeForMetaPath))
			.returns("~key filter~");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", {$filter : "(age gt 40) and ~key filter~"}, false,
				sinon.match.same(oCache.bSortExpandSelect))
			.returns("?$filter=...");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~?$filter=...", sinon.match.same(oGroupLock), undefined,
				undefined, sinon.match.same(fnDataRequested))
			.resolves({value : [oResult, oResult]});

		// code under test
		return oCache.refreshSingleWithRemove(oGroupLock, "EMPLOYEE_2_EQUIPMENTS", 3, "~", false,
				fnDataRequested)
			.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message,
					"Unexpected server response, more than one entity returned.");
			});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#refreshSingleWithRemove: No key predicate known", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')");

		oCache.fetchValue = function () {};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "EMPLOYEE_2_EQUIPMENTS")
			// Note: CollectionCache#fetchValue may be async, $cached just sends no new request!
			.returns(SyncPromise.resolve(Promise.resolve([{/* "No key predicate known" here */}])));
		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve());
		this.mock(_Helper).expects("getKeyFilter").never();
		this.mock(_Helper).expects("aggregateExpandSelect").never();
		this.mock(this.oRequestor).expects("buildQueryString").never();
		this.mock(this.oRequestor).expects("request").never();

		// code under test
		return oCache.refreshSingleWithRemove({/*oGroupLock*/}, "EMPLOYEE_2_EQUIPMENTS", 0, "~")
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError.message, "No key predicate known");
			});
	});

	//*********************************************************************************************
	QUnit.test("Cache#[gs]etLateQueryOptions", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {});

		assert.strictEqual(oCache.getLateQueryOptions(), null);

		// code under test
		oCache.setLateQueryOptions({
			foo : "bar",
			$expand : {n : {$select : "p3"}},
			$filter : "filter",
			$select : ["p1", "p2"],
			$$ownRequest : true
		});

		assert.deepEqual(oCache.mLateQueryOptions, {
			$expand : {n : {$select : "p3"}},
			$select : ["p1", "p2"]
		});

		// code under test
		oCache.setLateQueryOptions({$expand : {n : {$select : "p3"}}});

		assert.deepEqual(oCache.mLateQueryOptions, {
			$expand : {n : {$select : "p3"}},
			$select : undefined
		});

		// code under test
		oCache.setLateQueryOptions({$select : ["p1", "p2"]});

		assert.deepEqual(oCache.mLateQueryOptions, {
			$expand : undefined,
			$select : ["p1", "p2"]
		});

		assert.strictEqual(oCache.getLateQueryOptions(), oCache.mLateQueryOptions);

		// code under test
		oCache.setLateQueryOptions(null);
		assert.strictEqual(oCache.getLateQueryOptions(), null);
	});

	//*********************************************************************************************
[undefined, "$auto.heroes"].forEach(function (sGroupId) {
	[false, true].forEach(function (bDataReceivedFails) {
		[false, true].forEach(function (bHasLateQueryOptions) {
			var sTitle = "Cache#fetchLateProperty: $select, group=" + sGroupId
				+ (bDataReceivedFails ? ", fireDataReceived fails" : "")
				+ ", has late query options: " + bHasLateQueryOptions;

	QUnit.test(sTitle, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {
				$apply : "A.P.P.L.E.", // ignored
				$count : true, // ignored
				$expand : "~expand~",
				$filter : "age gt 40", // ignored
				$orderby : "TEAM_ID desc", // ignored
				$search : "OR", // ignored
				$select : "~select~",
				foo : "bar", // ignored
				"sap-client" : "123" // ignored
			}),
			oData = {
				foo : {
					bar : "baz"
				}
			},
			oEntity = {foo : {}},
			oEventExpectation,
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			oHelperMock = this.mock(_Helper),
			oPromise,
			sRequestedPropertyPath = "foo/bar/baz",
			oRequestGroupLock = {},
			mQueryOptionsForPath = {},
			mTypeForMetaPath = {
				"~2~" : {}
			},
			oUpdateExpectation,
			that = this;

		if (sGroupId) {
			_Helper.setPrivateAnnotation(oEntity, "groupId", sGroupId);
		}
		if (bHasLateQueryOptions) {
			oCache.mLateQueryOptions = {};
		}
		oHelperMock.expects("getMetaPath").withExactArgs("").returns("~resMetaPath~");
		this.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath, "~resMetaPath~")
			.returns("~metaPath~");
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(bHasLateQueryOptions ? sinon.match.same(oCache.mLateQueryOptions) : {
				$select : "~select~",
				$expand : "~expand~"
			}, "")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), [sRequestedPropertyPath],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				"~metaPath~")
			.returns("~mQueryOptions~"); // no $expand here, simplifies visitQueryOptions!
		oHelperMock.expects("buildPath").withExactArgs("~metaPath~", undefined).returns("~2~");
		this.oRequestorMock.expects("fetchType").never();
		oHelperMock.expects("buildPath").withExactArgs(oCache.sResourcePath, "").returns("~/");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("~metaPath~", "~mQueryOptions~", false, true)
			.returns("?$select=~metaPath~");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("~metaPath~", sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~");
		this.mock(oGroupLock).expects("getUnlockedCopy").exactly(sGroupId ? 0 : 1)
			.withExactArgs().returns(oRequestGroupLock);
		this.oRequestorMock.expects("lockGroup").exactly(sGroupId ? 1 : 0)
			.withExactArgs(sGroupId, sinon.match.same(oCache)).returns(oRequestGroupLock);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined,
				undefined, sinon.match.func, undefined, "~metaPath~", undefined, false,
				"~mQueryOptions~")
			.callsFake(function () {
				var fnOnSubmit = arguments[5];

				return Promise.resolve().then(function () {
					that.oModelInterfaceMock.expects("fireDataRequested").withExactArgs("/~/");
					oEventExpectation = that.oModelInterfaceMock.expects("fireDataReceived")
						.withExactArgs(undefined, "/~/")
						.callsFake(function () {
							if (bDataReceivedFails) {
								throw "~oError~";
							}
						});

					fnOnSubmit(); // code under test

					return oData;
				});
			});
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath),
				"~metaPath~", "");
		oUpdateExpectation = oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oEntity), sinon.match.same(oData), [sRequestedPropertyPath]);

		// code under test
		oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "", sRequestedPropertyPath);

		return oPromise.then(function (oResult) {
			assert.notOk(bDataReceivedFails);
			assert.strictEqual(oResult, undefined);
			assert.ok(oEventExpectation.calledAfter(oUpdateExpectation));
		}, function (oError) {
			assert.ok(bDataReceivedFails);
			assert.strictEqual(oError, "~oError~");
		});
	});
		});
	});
});

	//*********************************************************************************************
["", "@property.annotation"].forEach(function (sAnnotation) {
	QUnit.test("Cache#fetchLateProperty: $select, nested entity", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees", {}),
			oData = {
				foo : {
					bar : "baz"
				}
			},
			oEntity = {foo : {}},
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			oHelperMock = this.mock(_Helper),
			oPromise,
			sRequestedPropertyPath = "foo/bar/baz",
			oRequestGroupLock = {},
			mQueryOptions = {
				$select : [sRequestedPropertyPath]
			},
			mQueryOptionsForPath = {},
			mTypeForMetaPath = {
				"/entity/meta/path" : {}
			};

		oCache.mLateQueryOptions = {};
		oHelperMock.expects("getMetaPath").withExactArgs("('31')/entity/path")
			.returns("entity/path");
		this.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('31')/entity/path")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), [sRequestedPropertyPath],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				"/Employees/entity/path")
			.returns(mQueryOptions);
		oHelperMock.expects("buildPath").withExactArgs("/Employees", "entity/path")
			.returns("/Employees/entity/path");
		oHelperMock.expects("buildPath").withExactArgs("/Employees/entity/path", undefined)
			.returns("/entity/meta/path");
		this.oRequestorMock.expects("fetchType").never();
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees/entity/path", sinon.match.same(mQueryOptions), false,
				true)
			.returns("?$select=~1");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees/entity/path", sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~");
		oHelperMock.expects("buildPath")
			.withExactArgs(oCache.sResourcePath, "('31')/entity/path")
			.returns("~/");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "groupId")
			.returns(undefined);
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined,
				undefined, sinon.match.func, undefined, "/Employees/entity/path", undefined, false,
				sinon.match.same(mQueryOptions))
			.resolves(oData);
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath + "/entity/path", "('31')/entity/path");
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntity), "predicate")
			.returns(undefined);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oData), "predicate")
			.returns("('AnyKeyPredicate')");
		oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('31')/entity/path",
				sinon.match.same(oEntity), sinon.match.same(oData), [sRequestedPropertyPath]);

		// code under test
		oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "('31')/entity/path",
			sRequestedPropertyPath + sAnnotation);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#fetchLateProperty: $expand", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees", {}),
			oData = {
				foo : {
					bar : "baz"
				}
			},
			oEntity = {},
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			oHelperMock = this.mock(_Helper),
			oPromise,
			mQueryOptions = {
				$expand : {
					foo : {
						$expand : {
							bar : {
								$expand : {
									baz : {$select : ["qux", "baz1"]}
								},
								$select : ["baz"]
							}
						},
						$select : ["foo1", "t/foo2"]
					}
				},
				$select : ["key"]
			},
			mQueryOptionsForPath = {},
			oRequestGroupLock = {},
			mRequestQueryOptions = {
				$expand : {
					foo : {
						$expand : {
							bar : {
								$expand : {
									baz : {
										$select : ["qux", "baz1"]
									}
								},
								$select : ["baz"]
							}
						},
						$select : ["foo1", "t/foo2"]
					}
				},
				$select : ["key"]
			},
			oTypeBar = {},
			oTypeBaz = {
				$Key : ["baz1"]
			},
			oTypeFoo = {
				$Key : ["foo1", {foo2 : "t/foo2"}]
			},
			mTypeForMetaPath = {
				"~" : {}
			},
			oUpdateSelectedCall,
			oVisitResponseCall;

		oCache.mLateQueryOptions = {};
		oHelperMock.expects("getMetaPath").withExactArgs("('1')/entity/path")
			.returns("entity/path");
		this.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath, "entity/path")
			.returns(oCache.sMetaPath + "/entity/path");
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('1')/entity/path")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["foo/bar/baz/qux"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath + "/entity/path")
			.returns(mQueryOptions);
		this.oRequestorMock.expects("fetchType").never();
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", undefined)
			.returns("~");
		oHelperMock.expects("buildPath").withExactArgs(undefined, "foo").returns("foo");
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", "foo")
			.returns(oCache.sMetaPath + "/entity/path/foo");
		this.oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath + "/entity/path/foo")
			.returns(SyncPromise.resolve(oTypeFoo));
		oHelperMock.expects("buildPath").withExactArgs("foo", "foo1").returns("foo/foo1");
		oHelperMock.expects("buildPath").withExactArgs("foo", "t/foo2").returns("foo/t/foo2");
		oHelperMock.expects("buildPath").withExactArgs("foo", "bar").returns("foo/bar");
		oHelperMock.expects("buildPath").withExactArgs(oCache.sMetaPath + "/entity/path", "foo/bar")
			.returns(oCache.sMetaPath + "/entity/path/foo/bar");
		this.oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath + "/entity/path/foo/bar")
			.returns(SyncPromise.resolve(oTypeBar));
		oHelperMock.expects("buildPath").withExactArgs("foo/bar", "baz").returns("foo/bar/baz");
		oHelperMock.expects("buildPath")
			.withExactArgs(oCache.sMetaPath + "/entity/path", "foo/bar/baz")
			.returns(oCache.sMetaPath + "/entity/path/foo/bar/baz");
		this.oRequestorMock.expects("fetchType")
			.withExactArgs(sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath + "/entity/path/foo/bar/baz")
			.returns(SyncPromise.resolve(oTypeBaz));
		oHelperMock.expects("buildPath")
			.withExactArgs("foo/bar/baz", "baz1").returns("foo/bar/baz/baz1");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath + "/entity/path", mRequestQueryOptions, false, true)
			.returns("?$expand=~1");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath + "/entity/path",
				sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~");
		oHelperMock.expects("buildPath")
			.withExactArgs(oCache.sResourcePath, "('1')/entity/path")
			.returns("~/");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~/?~", sinon.match.same(oRequestGroupLock), undefined,
				undefined, sinon.match.func, undefined, oCache.sMetaPath + "/entity/path",
				undefined, false, mRequestQueryOptions)
			.resolves(oData);
		oVisitResponseCall = this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath + "/entity/path", "('1')/entity/path");
		oUpdateSelectedCall = oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('1')/entity/path",
				sinon.match.same(oEntity), sinon.match.same(oData), [
					"foo/bar/baz/qux", "foo/foo1", "foo/t/foo2", "foo/bar/baz/baz1"
				]);

		// code under test - assuming foo, bar and baz are navigation properties
		oPromise = oCache.fetchLateProperty(oGroupLock, oEntity, "('1')/entity/path",
			"foo/bar/baz/qux");

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.ok((oUpdateSelectedCall.calledAfter(oVisitResponseCall)));
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#fetchLateProperty: parallel calls", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {}),
			oData = {
				"@odata.etag" : "etag",
				property : {foo : "foo", bar : "bar"}
			},
			oEntity = {},
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			oHelperMock = this.mock(_Helper),
			oPromise1,
			oPromise2,
			mQueryOptionsFoo = {$select : []},
			mQueryOptionsBar = {$select : []},
			mQueryOptionsForPath = {},
			mTypeForMetaPath = {
				"/Employees" : {}
			};

		oCache.mLateQueryOptions = {};
		this.mock(oCache).expects("getTypes").twice().withExactArgs().returns(mTypeForMetaPath);
		oHelperMock.expects("getQueryOptionsForPath").twice()
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property/foo"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath)
			.returns(mQueryOptionsFoo);
		oHelperMock.expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property/bar"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath)
			.returns(mQueryOptionsBar);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptionsFoo), false, true)
			.returns("?$select=property");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptionsBar), false, true)
			.returns("?$select=property");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~groupLock~");
		this.oModelInterfaceMock.expects("fireDataRequested").withExactArgs("/Employees('31')");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('31')?~",
				sinon.match.same("~groupLock~"), undefined,
				undefined, sinon.match.func, undefined, oCache.sMetaPath, undefined, false,
				sinon.match.same(mQueryOptionsFoo))
			.callsArg(5)
			.resolves(oData);
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oData), sinon.match.same(mTypeForMetaPath),
				oCache.sMetaPath, "");
		oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oEntity), sinon.match.same(oData), ["property/foo"])
			.callsFake(function () {
				assert.ok("Employees('31')?$select=property" in oCache.mPropertyRequestByPath,
					"still cached");
			});
		oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oEntity), sinon.match.same(oData), ["property/bar"])
			.callsFake(function () {
				oEntity["@odata.etag"] = "etag";
			});
		this.oModelInterfaceMock.expects("fireDataReceived")
			.withExactArgs(undefined, "/Employees('31')");

		// code under test
		oPromise1 = oCache.fetchLateProperty(oGroupLock, oEntity, "", "property/foo");
		oPromise2 = oCache.fetchLateProperty(oGroupLock, oEntity, "", "property/bar");

		return Promise.all([oPromise1, oPromise2]).then(function () {
			assert.deepEqual(oCache.mPropertyRequestByPath, {});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bSubmit) {
	QUnit.test("Cache#fetchLateProperty: request failed, submit=" + bSubmit, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')", {}),
			oEntity = {},
			oError = new Error(),
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			mQueryOptions = {$select : []},
			mQueryOptionsForPath = {};

		oCache.fetchValue = function () {};

		oCache.mLateQueryOptions = {};
		this.mock(oCache).expects("getTypes").withExactArgs().returns({});
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath)
			.returns(mQueryOptions);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptions), false, true)
			.returns("?~1");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~2");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~groupLock~");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('31')?~2", sinon.match.same("~groupLock~"),
				undefined, undefined, sinon.match.func, undefined, oCache.sMetaPath, undefined,
				false, sinon.match.same(mQueryOptions))
			.callsFake(function () {
				if (bSubmit) {
					arguments[5]();
				}
				return Promise.reject(oError);
			});
		this.mock(_Helper).expects("updateSelected").never();
		this.oModelInterfaceMock.expects("fireDataReceived").exactly(bSubmit ? 1 : 0)
			.withExactArgs(sinon.match.same(oError), "/Employees('31')");

		// Code under test
		return oCache.fetchLateProperty(oGroupLock, oEntity, "", "property")
			.then(function () {
				assert.ok(false);
			}, function (oResult) {
				assert.strictEqual(oResult, oError);
				assert.deepEqual(oCache.mPropertyRequestByPath, {});
			});
	});
});

	//*********************************************************************************************
[{
	error : "ETag changed",
	etag : "new",
	predicate : "('TEAM_01')"
}, {
	error : "Key predicate changed from ('TEAM_01') to ('TEAM_02')",
	etag : "old",
	predicate : "('TEAM_02')"
}].forEach(function (oFixture) {
	QUnit.test("Cache#fetchLateProperty: " + oFixture.error, function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees('31')/EMPLOYEE_2_TEAM", {}),
			oCacheData = {
				"@$ui5._" : {predicate : "('TEAM_01')"},
				"@odata.etag" : "old"
			},
			oData = {
				"@$ui5._" : {predicate : oFixture.predicate},
				"@odata.etag" : oFixture.etag
			},
			oEntityType = {
				$Key : ["key"]
			},
			oErrorMessage = "GET " + "Employees('31')/EMPLOYEE_2_TEAM?~1: " + oFixture.error,
			oGroupLock = {
				getUnlockedCopy : function () {}
			},
			mQueryOptions = {$select : []},
			mQueryOptionsForPath = {},
			oRequestGroupLock = {},
			mTypeForMetaPath = {
				"/Employees/EMPLOYEE_2_TEAM" : oEntityType
			};

		oCache.mLateQueryOptions = {
			$expand : {expand : {}},
			$select : ["select"]
		};
		this.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath)
			.returns(mQueryOptions);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(mQueryOptions), false, true)
			.returns("?~1");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.same(oCache.mQueryOptions), true)
			.returns("?~2");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oRequestGroupLock);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('31')/EMPLOYEE_2_TEAM?~2",
				sinon.match.same(oRequestGroupLock), undefined, undefined, sinon.match.func,
				undefined, oCache.sMetaPath, undefined, false, sinon.match.same(mQueryOptions))
			.callsArg(5)
			.resolves(oData);
		this.oModelInterfaceMock.expects("fireDataRequested")
			.withExactArgs("/Employees('31')/EMPLOYEE_2_TEAM");
		this.mock(_Helper).expects("updateSelected").never();
		this.oModelInterfaceMock.expects("fireDataReceived")
			.withExactArgs(sinon.match(function (oError) {
				return oError.message === oErrorMessage;
			}), "/Employees('31')/EMPLOYEE_2_TEAM");

		// Code under test
		return oCache.fetchLateProperty(oGroupLock, oCacheData, "", "property")
			.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, oErrorMessage);
				assert.deepEqual(oCache.mPropertyRequestByPath, {});
			});
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#fetchLateProperty: no late properties", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees");

		this.mock(oCache).expects("getTypes").withExactArgs().returns({});
		this.mock(_Helper).expects("intersectQueryOptions").never();
		this.oRequestorMock.expects("request").never();
		this.mock(_Helper).expects("updateSelected").never();

		assert.strictEqual(
			// code under test
			oCache.fetchLateProperty({/*oGroupLock*/}, {/*oCacheData*/}, "('1')", "property"),
			false
		);
	});

	//*********************************************************************************************
["@$ui5.foo/bar", "foo@$ui5.bar"].forEach(function (sAnnotation) {
	QUnit.test("Cache#fetchLateProperty: do not fetch client annotations", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees");

		oCache.mLateQueryOptions = {};
		this.mock(oCache).expects("getTypes").withExactArgs().returns({});
		this.mock(_Helper).expects("intersectQueryOptions").never();
		this.oRequestorMock.expects("request").never();
		this.mock(_Helper).expects("updateSelected").never();

		assert.strictEqual(
			// code under test
			oCache.fetchLateProperty({/*oGroupLock*/}, {/*oCacheData*/}, "('1')", sAnnotation),
			true
		);
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#fetchLateProperty: not a late property", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees"),
			mQueryOptionsForPath = {};

		oCache.mLateQueryOptions = {};
		this.mock(oCache).expects("getTypes").withExactArgs().returns({});
		this.mock(_Helper).expects("getMetaPath").withExactArgs("('1')").returns("");
		this.mock(_Helper).expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mLateQueryOptions), "('1')")
			.returns(mQueryOptionsForPath);
		this.mock(_Helper).expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptionsForPath), ["property"],
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				oCache.sMetaPath)
			.returns(undefined);
		this.oRequestorMock.expects("request").never();
		this.mock(_Helper).expects("updateSelected").never();

		assert.strictEqual(
			// code under test
			oCache.fetchLateProperty({/*oGroupLock*/}, {/*oCacheData*/}, "('1')", "property"),
			false
		);
	});

	//*********************************************************************************************
	QUnit.test("#getAllElements without path", function (assert) {
		var aAllElements,
			oCache = this.createCache("Employees"),
			oPromise = new SyncPromise(function () {});

		oCache.aElements = ["~oElement0~", oPromise, "~oElement2~"];
		oCache.aElements.$count = 3;

		// code under test
		aAllElements = oCache.getAllElements();
		assert.deepEqual(aAllElements, ["~oElement0~", undefined, "~oElement2~"]);

		assert.strictEqual(aAllElements.$count, 3);
	});

	//*********************************************************************************************
	QUnit.test("#getAllElements with relative path for drill down", function (assert) {
		var oCache = this.createCache("Employees");

		this.mock(oCache).expects("getValue").withExactArgs("~relativePath~")
			.returns("~elements~");

		// code under test
		assert.strictEqual(oCache.getAllElements("~relativePath~"), "~elements~");
	});

	//*********************************************************************************************
	QUnit.test("Cache#getDownloadQueryOptions", function (assert) {
		var mQueryOptions = {},
			oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false);

		// code under test
		assert.strictEqual(oCache.getDownloadQueryOptions(mQueryOptions), mQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("Cache#getDownloadUrl: empty path", function (assert) {
		var mDownloadQueryOptions = {},
			mQueryOptions = {},
			oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false),
			oHelperMock = this.mock(_Helper);

		oCache.sMetaPath = "/cache/meta/path";
		oHelperMock.expects("buildPath").withExactArgs("Employees", "").returns("resource/path");
		oHelperMock.expects("getMetaPath").withExactArgs("").returns("meta/path");
		oHelperMock.expects("buildPath").withExactArgs("/cache/meta/path", "meta/path")
			.returns("~");
		this.mock(oCache).expects("getDownloadQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions)).returns(mDownloadQueryOptions);
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs("~", sinon.match.same(mDownloadQueryOptions), false, true)
			.returns("?~query~");

		// code under test
		assert.strictEqual(oCache.getDownloadUrl(""), "/~/resource/path?~query~");
	});

	//*********************************************************************************************
	QUnit.test("Cache#getDownloadUrl: non-empty path", function (assert) {
		var mCustomQueryOptions = {},
			mDownloadQueryOptions = {},
			mQueryOptions = {},
			oCache = new _Cache(this.oRequestor, "Employees", mQueryOptions, false),
			oHelperMock = this.mock(_Helper),
			mQueryOptionsForPath = {},
			mResultingQueryOptions = {};

		oCache.sMetaPath = "/cache/meta/path";
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(mQueryOptions), "cache/path")
			.returns(mQueryOptionsForPath);
		oHelperMock.expects("merge")
			.withExactArgs({}, sinon.match.same(mCustomQueryOptions),
				sinon.match.same(mQueryOptionsForPath))
			.returns(mResultingQueryOptions);
		oHelperMock.expects("buildPath").withExactArgs("Employees", "cache/path")
			.returns("resource/path");
		oHelperMock.expects("getMetaPath").withExactArgs("cache/path").returns("meta/path");
		oHelperMock.expects("buildPath").withExactArgs("/cache/meta/path", "meta/path")
			.returns("~");
		this.mock(oCache).expects("getDownloadQueryOptions")
			.withExactArgs(sinon.match.same(mResultingQueryOptions)).returns(mDownloadQueryOptions);
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs("~", sinon.match.same(mDownloadQueryOptions), false, true)
			.returns("?~query~");

		// code under test
		assert.strictEqual(oCache.getDownloadUrl("cache/path", mCustomQueryOptions),
			"/~/resource/path?~query~");
	});

	//*********************************************************************************************
	QUnit.test("Cache#getResourcePath", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees");

		// code under test
		assert.strictEqual(oCache.getResourcePath(), "Employees");
	});

	//*********************************************************************************************
	QUnit.test("Cache#hasSentRequest", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees");

		oCache.bSentRequest = "bSentRequest";

		// code under test
		assert.strictEqual(oCache.hasSentRequest(), "bSentRequest");
	});

	//*********************************************************************************************
[{
	bindingFilter : "filter",
	count : 42,
	created : false,
	queryFilter : "filter"
}, {
	bindingFilter : undefined,
	count : 43,
	created : true,
	queryFilter : "~filter~"
}, {
	bindingFilter : "filter",
	count : 43,
	created : true,
	queryFilter : "(filter) and ~filter~"
}].forEach(function (oFixture) {
	QUnit.test("Cache#requestCount: " + JSON.stringify(oFixture), function (assert) {
		var oCache = this.createCache("Employees", {
				"sap-client" : "123",
				$apply : "apply",
				$count : true,
				$expand : "expand",
				$filter : oFixture.bindingFilter,
				$orderby : "orderby",
				$search : "search",
				$select : "select"
			}),
			oGroupLock = {getUnlockedCopy : function () {}},
			oGroupLockCopy = {},
			sQueryOptions = JSON.stringify(oCache.mQueryOptions);

		oCache.aElements.$created = oFixture.created ? 2 : 0;
		oCache.iActiveElements = oFixture.created ? 1 : 0;
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs()
			.returns(oFixture.created ? "~filter~" : undefined);
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, {
				"sap-client" : "123",
				$apply : "apply",
				$count : true,
				$filter : oFixture.queryFilter,
				$search : "search",
				$top : 0
			})
			.returns("?~");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy))
			.resolves({"@odata.count" : "42"});
		this.mock(_Helper).expects("setCount")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oCache.aElements), oFixture.count);

		// code under test
		return oCache.requestCount(oGroupLock).then(function () {
			assert.strictEqual(JSON.stringify(oCache.mQueryOptions), sQueryOptions, "unchanged");
			assert.strictEqual(oCache.iLimit, oFixture.count);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#requestCount: exclusive $filter before $top", function (assert) {
		var oCache = this.createCache("Employees", {$count : true}),
			oGroupLock = {getUnlockedCopy : function () {}},
			oGroupLockCopy = {};

		oCache.aElements.$created = 1;
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs().returns("~filter~");
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.object)
			.callsFake(function (_sMetaPath, mQueryOptions) {
				assert.deepEqual(Object.keys(mQueryOptions), ["$count", "$filter", "$top"]);
				return "?~";
			});
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy))
			.resolves({"@odata.count" : "42"});

		// code under test
		return oCache.requestCount(oGroupLock);
	});

	//*********************************************************************************************
[false, true].forEach(function (bRetryFailed) {
	var sTitle = "Cache#requestCount: failed with 404 for DELETE in same $batch, retry failed "
			+ "also: " + bRetryFailed;

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees", {$count : true}),
			oError = new Error("HTTP request failed because the previous request failed"),
			oGroupLock = {getUnlockedCopy : function () {}},
			oGroupLockCopy1 = {},
			oGroupLockCopy2 = {},
			oGroupLockMock = this.mock(oGroupLock),
			oRequestorMock = this.mock(this.oRequestor),
			oRetryError = new Error("Count failed");

		oError.cause = {status : 404};
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs()
			.returns(undefined);
		oRequestorMock.expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.object)
			.returns("?~");
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy1);
		oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy1))
			.rejects(oError);
		oGroupLockMock.expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy2);
		oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy2))
			.returns(bRetryFailed
				? Promise.reject(oRetryError)
				: Promise.resolve({"@odata.count" : "42"}));

		// code under test
		return oCache.requestCount(oGroupLock).then(function () {
			assert.notOk(bRetryFailed);
			assert.strictEqual(oCache.iLimit, 42);
		}, function (oError) {
			assert.ok(bRetryFailed);
			assert.strictEqual(oError, oRetryError);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#requestCount: fails with another error", function (assert) {
		var oCache = this.createCache("Employees", {$count : true}),
			oError = new Error("Another Error"), // GET for $count fails, no oError.cause!
			oGroupLock = {getUnlockedCopy : function () {}},
			oGroupLockCopy = {};

		this.mock(oCache).expects("getExclusiveFilter").withExactArgs()
			.returns(undefined);
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match.object)
			.returns("?~");
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oGroupLockCopy);
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "Employees?~", sinon.match.same(oGroupLockCopy))
			.rejects(oError);

		// code under test
		return oCache.requestCount(oGroupLock).then(function () {
			assert.ok(false, "unexpected");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#requestCount: nothing to do", function (assert) {
		var oRequestor = this.oRequestor,
			oCache = new _Cache(oRequestor, "Employees");

		oCache.iLimit = 42;
		this.mock(oRequestor).expects("request").never();

		// code under test
		return oCache.requestCount({}, "", undefined).then(function (iCount) {
			assert.strictEqual(iCount, 42);

			oCache = new _Cache(oRequestor, "Employees", {});
			oCache.iLimit = 42;

			// code under test
			return oCache.requestCount({}, "", undefined).then(function (iCount) {
				assert.strictEqual(iCount, 42);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#adjustIndexes: read requests", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees"); // must be a CollectionCache

		oCache.aReadRequests = [
			{iStart : 5, iEnd : 7},
			{iStart : 9, iEnd : 15},
			{iStart : 22, iEnd : 27}
		];

		// code under test
		oCache.adjustIndexes("", oCache.aElements, 9, 1);

		assert.deepEqual(oCache.aReadRequests, [
			{iStart : 5, iEnd : 7},
			{iStart : 10, iEnd : 16},
			{iStart : 23, iEnd : 28}
		]);

		// code under test
		oCache.adjustIndexes("", oCache.aElements, 9, -1);

		assert.deepEqual(oCache.aReadRequests, [
			{iStart : 5, iEnd : 7},
			{iStart : 9, iEnd : 15},
			{iStart : 22, iEnd : 27}
		]);

		// code under test
		oCache.adjustIndexes("", oCache.aElements, undefined, -1);

		assert.deepEqual(oCache.aReadRequests, [
			{iStart : 5, iEnd : 7},
			{iStart : 9, iEnd : 15},
			{iStart : 22, iEnd : 27}
		]);
	});

	//*********************************************************************************************
	QUnit.test("Cache#adjustIndexes: $deleted", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees"),
			aElements = [];

		aElements.$deleted = [
			{index : undefined}, {index : 0}, {index : 6}, {index : 7}, {index : 8}
		];

		// code under test
		oCache.adjustIndexes("foo", aElements, 6, -1);

		assert.deepEqual(aElements.$deleted,
			[{index : undefined}, {index : 0}, {index : 6}, {index : 6}, {index : 7}],
			"remove: a previously removed entity at the same index must not be moved");

		// code under test
		oCache.adjustIndexes("foo", aElements, undefined, -1);

		assert.deepEqual(aElements.$deleted,
			[{index : undefined}, {index : 0}, {index : 6}, {index : 6}, {index : 7}],
			"remove: an element outside the collection");

		// code under test
		oCache.adjustIndexes("foo", aElements, 6, 1, 2);

		assert.deepEqual(aElements.$deleted,
			[{index : undefined}, {index : 0}, {index : 6}, {index : 7}, {index : 8}],
			"re-insert: observe position in $deleted");

		aElements.$deleted = [{index : 0, created : true}, {index : 2}];

		// code under test
		oCache.adjustIndexes("foo", aElements, 0, 1, 0, true);

		assert.deepEqual(aElements.$deleted, [{index : 1, created : true}, {index : 3}],
			"insert a created entity at the start: a previously created one moves");

		aElements.$deleted = [{index : 2, created : true}, {index : 2}];

		// code under test
		oCache.adjustIndexes("foo", aElements, 2, 1, 0, true);

		assert.deepEqual(aElements.$deleted, [{index : 2, created : true}, {index : 3}],
			"insert a created entity at the end: only non-created entities move");
	});

	//*********************************************************************************************
	QUnit.test("Cache#adjustIndexes: no path and no aReadRequests", function () {
		const oCache = new _Cache(this.oRequestor, "Employees"); // would be an _AggregationCache

		oCache.adjustIndexes("", [], 1);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSharedRequest) {
	QUnit.test("CollectionCache: bSharedRequest = " + bSharedRequest, function (assert) {
		var oCache,
			mQueryOptions = {};

		this.mock(_Cache.prototype).expects("setQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions));
		this.mock(_Cache.prototype).expects("setResourcePath").withExactArgs("resource/path")
			.callsFake(function () {
				assert.notOk(this.bSharedRequest, "must not have been set yet");
			});

		// code under test
		oCache = _Cache.create(this.oRequestor, "resource/path", mQueryOptions,
			"bSortExpandSelect", "deep/resource/path", bSharedRequest);

		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
		assert.strictEqual(oCache.sOriginalResourcePath, "deep/resource/path");
		assert.strictEqual(oCache.bSharedRequest, bSharedRequest ? true : undefined);
		assert.strictEqual(oCache.iActiveElements, 0);
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#addTransientCollection: no initial data", function (assert) {
		var that = this;

		return new Promise(function (resolve) {
			var oCache = new _Cache(that.oRequestor, "SalesOrders('1')"),
				oCacheMock = that.mock(oCache),
				aElements,
				oHelperMock = that.mock(_Helper),
				oParent = {},
				oPostBody = {},
				oRoot = {};

			oCacheMock.expects("getValue").withExactArgs("path($uid=42)/to").returns(oParent);
			oCacheMock.expects("getValue").withExactArgs("path($uid=42)").returns(oRoot);
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(sinon.match.same(oParent), "postBody")
				.returns(oPostBody);
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(sinon.match.same(oRoot), "select", {})
				.returns({});
			oCacheMock.expects("checkSharedRequest").withExactArgs();
			oHelperMock.expects("getMetaPath").withExactArgs("to/collection").returns("meta/path");
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oRoot), "select", {"meta/path" : "~aSelect~"});
			oCacheMock.expects("fetchTypes").withExactArgs().resolves("~mTypeForMetaPath~");
			oHelperMock.expects("getMetaPath").withExactArgs("path($uid=42)/to/collection")
				.returns("meta/path");
			that.mock(that.oRequestor).expects("fetchType")
				.withExactArgs("~mTypeForMetaPath~", "/SalesOrders/meta/path")
				.callsFake(resolve);

			// code under test
			aElements = oCache.addTransientCollection("path($uid=42)/to/collection", "~aSelect~");

			assert.deepEqual(aElements, []);
			assert.strictEqual(oParent.collection, aElements);
			assert.strictEqual(aElements.$count, 0);
			assert.strictEqual(aElements.$created, 0);
			assert.deepEqual(aElements.$byPredicate, {});
			assert.strictEqual(typeof aElements.$postBodyCollection, "function");

			// code under test
			aElements.$postBodyCollection();

			assert.deepEqual(oPostBody.collection, []);
			assert.strictEqual(oPostBody.collection, aElements.$postBodyCollection);
		});
	});

	//*********************************************************************************************
	QUnit.test("Cache#addTransientCollection: initial data", function (assert) {
		var that = this;

		return new Promise(function (resolve) {
			var oCache = new _Cache(that.oRequestor, "SalesOrders('1')"),
				oCacheMock = that.mock(oCache),
				aElements,
				oHelperMock = that.mock(_Helper),
				oPostBody = {
					collection : ["~a~", "~b~"]
				},
				oParent = {
					"@$ui5._" : {
						postBody : oPostBody,
						transient : "updateGroup"
					},
					collection : [{}, {}]
				},
				oRoot = {
					"@$ui5._" : {
						select : {other : "$select"}
					}
				};

			oCache.fetchValue = function () {};
			oCacheMock.expects("getValue").withExactArgs("path($uid=42)/to").returns(oParent);
			oCacheMock.expects("getValue").withExactArgs("path($uid=42)").returns(oRoot);
			that.mock(oCache).expects("checkSharedRequest").withExactArgs();
			oHelperMock.expects("getMetaPath").withExactArgs("to/collection").returns("meta/path");
			oHelperMock.expects("uid").withExactArgs().returns("~uid0~");
			oHelperMock.expects("addPromise")
				.withExactArgs(sinon.match.same(oParent.collection[0])).returns("~promise0~");
			oHelperMock.expects("uid").withExactArgs().returns("~uid1~");
			oHelperMock.expects("addPromise")
				.withExactArgs(sinon.match.same(oParent.collection[1])).returns("~promise1~");
			that.mock(oCache).expects("fetchTypes").withExactArgs().resolves("~mTypeForMetaPath~");
			oHelperMock.expects("getMetaPath").withExactArgs("path($uid=42)/to/collection")
				.returns("meta/path");
			that.mock(that.oRequestor).expects("fetchType")
				.withExactArgs("~mTypeForMetaPath~", "/SalesOrders/meta/path")
				.callsFake(resolve);

			// code under test
			aElements = oCache.addTransientCollection("path($uid=42)/to/collection", "~aSelect~");

			assert.strictEqual(aElements, oParent.collection);
			assert.strictEqual(aElements.$count, 2);
			assert.strictEqual(aElements.$created, 2);
			assert.deepEqual(aElements, [{
				"@$ui5._" : {
					postBody : "~a~",
					promise : "~promise0~",
					transient : "updateGroup",
					transientPredicate : "($uid=~uid0~)"
				},
				"@$ui5.context.isTransient" : true
			}, {
				"@$ui5._" : {
					postBody : "~b~",
					promise : "~promise1~",
					transient : "updateGroup",
					transientPredicate : "($uid=~uid1~)"
				},
				"@$ui5.context.isTransient" : true
			}]);
			assert.deepEqual(aElements.$byPredicate, {
				"($uid=~uid0~)" : aElements[0],
				"($uid=~uid1~)" : aElements[1]
			});
			assert.strictEqual(aElements.$postBodyCollection, oPostBody.collection);
			assert.deepEqual(oRoot, {
				"@$ui5._" : {
					select : {other : "$select", "meta/path" : "~aSelect~"}
				}
			});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bTransferable) {
	QUnit.test(`Cache#getAndRemoveCollection: transferable=${bTransferable}`, function (assert) {
		const oCache = new _Cache(this.oRequestor, "SalesOrders('1')");
			oCache.fetchValue = function () {};
		const aCollection = [];
		if (bTransferable) {
			aCollection.$transfer = true;
		}
		const oParent = {
			collection : aCollection
		};

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to")
			.returns(SyncPromise.resolve(oParent));
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();

		// code under test
		assert.strictEqual(oCache.getAndRemoveCollection("path/to/collection"),
			bTransferable ? aCollection : undefined);

		if (bTransferable) {
			assert.notOk("collection" in oParent);
		} else {
			assert.strictEqual(oParent.collection, aCollection);
		}
		assert.notOk("$transfer" in aCollection);
	});
});

	//*********************************************************************************************
	QUnit.test("Cache#getAndRemoveCollection: empty", function (assert) {
		const oCache = new _Cache(this.oRequestor, "SalesOrders('1')");
		oCache.fetchValue = function () {};

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to")
			.returns(SyncPromise.resolve({}));
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();

		// code under test
		assert.strictEqual(oCache.getAndRemoveCollection("path/to/collection"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("Cache#getAndRemoveCollection: not a collection", function (assert) {
		const oCache = new _Cache(this.oRequestor, "SalesOrders('1')");
		oCache.fetchValue = function () {};
		const oParent = {
			value : "foo"
		};

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "path/to")
			.returns(SyncPromise.resolve(oParent));
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();

		assert.throws(function () {
			// code under test
			oCache.getAndRemoveCollection("path/to/value");
		}, new Error("path/to/value must point to a collection"));
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
			var oCache,
				oCacheMock,
				aData = [{key : "a"}, {key : "b"}, {key : "c"}],
				oMockResult = {
					"@odata.context" : "$metadata#TEAMS",
					value : aData.slice(oFixture.index, oFixture.index + oFixture.length)
				},
				oPromise,
				mQueryOptions = {},
				oReadGroupLock0 = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oReadGroupLock1 = {
					getGroupId : function () { return "group"; },
					unlock : function () {}
				},
				oRequestGroupLock = {
					getGroupId : function () { return "group"; }
				},
				sResourcePath = "Employees",
				mTypeForMetaPath = oFixture.types ? {
					"/Employees" : {
						$Key : ["key"],
						key : {$Type : "Edm.String"}
					}
				} : {},
				that = this;

			if (oFixture.serverCount) {
				oMockResult["@odata.count"] = oFixture.serverCount;
			}
			this.mock(oReadGroupLock0).expects("getUnlockedCopy").withExactArgs()
				.returns(oRequestGroupLock);
			this.mock(oReadGroupLock0).expects("unlock").withExactArgs();
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=" + oFixture.index + "&$top="
					+ oFixture.length, sinon.match.same(oRequestGroupLock), undefined, undefined,
					undefined)
				.resolves(oMockResult);
			this.spy(_Helper, "setCount");

			oCache = this.createCache(sResourcePath, mQueryOptions);
			oCacheMock = this.mock(oCache);
			oCacheMock.expects("fetchTypes").withExactArgs()
				.returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));
			this.spy(oCache, "fill");

			// code under test
			oPromise = oCache.read(oFixture.index, oFixture.length, 0, oReadGroupLock0);

			assert.ok(!oPromise.isFulfilled());
			assert.ok(!oPromise.isRejected());
			assert.ok(oCache.bSentRequest);
			sinon.assert.calledOnceWithExactly(oCache.fill, sinon.match.instanceOf(SyncPromise),
				oFixture.index, oFixture.index + oFixture.length);
			return oPromise.then(function (oResult) {
				var oExpectedResult = {
						"@odata.context" : "$metadata#TEAMS",
						value : oFixture.result
					},
					oPromise2;

				if (oFixture.types) {
					oFixture.result.forEach(function (oItem) {
						_Helper.setPrivateAnnotation(oItem, "predicate", "('" + oItem.key + "')");
					});
				}
				if (oFixture.count) {
					sinon.assert.calledOnceWithExactly(_Helper.setCount,
						sinon.match.same(oCache.mChangeListeners), "",
						sinon.match.same(oCache.aElements), oFixture.count);
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
				that.mock(oReadGroupLock1).expects("unlock").withExactArgs();

				// ensure that the same read does not invoke another request, but unlocks
				oPromise2 = oCache.read(oFixture.index, oFixture.length, 0, oReadGroupLock1);

				return oPromise2.then(function (oResult) {
					assert.deepEqual(oResult, oExpectedResult);
					assert.strictEqual(oResult.value.$count, oFixture.count);
				});
			});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bTransient) {
	[1, 3].forEach(function (iPrefetchLength) {
		[0, 2, 3].forEach(function (iStart) {
			var sTitle = "CollectionCache#read w/ created element, transient = " + bTransient
					+ ", prefetch = " + iPrefetchLength + ", start = " + iStart;

			if (iStart && !bTransient) {
				return;
			}

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			iCount = iStart <= 2 ? 1 : 0, // call count in case no delay needed
			fnDataRequested = function () {},
			aElements = [{ // a created element (transient or not)
				"@$ui5._" : {
					transient : bTransient ? "group" : undefined,
					transientPredicate : "($uid=id-17-4)"
				}
			}, { // a created element (transient or not)
				"@$ui5._" : {
					transient : bTransient ? "group" : undefined,
					transientPredicate : "($uid=id-1-23)"
				}
			}, { // a "normal" element
				"@$ui5._" : {
					predicate : "('42')"
				}
			}],
			iExpectedPrefetch = bTransient && iPrefetchLength < 2 ? 2 : iPrefetchLength,
			oGroupLock = {
				getGroupId : function () { return "group"; },
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oSyncPromise,
			oUnlockExpectation,
			that = this;

		oCache.aElements = aElements;
		oCache.aElements.$count = 1;
		oCache.aElements.$created = 2;
		oCache.iLimit = 1; // "the upper limit for the count": does not include created elements!
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(aElements), 0, 100, iExpectedPrefetch, 2 + 1)
			.returns([{start : iStart, end : 23}]);
		this.oRequestorMock.expects("waitForBatchResponseReceived").exactly(1 - iCount)
			.withExactArgs("group")
			.callsFake(function () {
				assert.ok(oUnlockExpectation.called, "unlocked");
				that.oRequestorMock.expects("getUnlockedAutoCopy")
					.withExactArgs(sinon.match.same(oGroupLock)).returns("~oUnlockedAutoCopy~");
				that.mock(oCache).expects("read")
					.withExactArgs(0, 100, iPrefetchLength, "~oUnlockedAutoCopy~",
						sinon.match.same(fnDataRequested))
					.returns("~oReadPromise~");
				// no special timing needed, #read fails if called before mocked
				return SyncPromise.resolve();
			});
		this.mock(oGroupLock).expects("getUnlockedCopy").exactly(iCount).withExactArgs()
			.returns("~oUnlockedCopy~");
		this.mock(oCache).expects("requestElements").exactly(iCount)
			.withExactArgs(iStart, 23, "~oUnlockedCopy~", bTransient ? 2 : 0,
				sinon.match.same(fnDataRequested));
		oUnlockExpectation = this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		oSyncPromise = oCache.read(0, 100, iPrefetchLength, oGroupLock, fnDataRequested);

		if (iCount) {
			assert.deepEqual(oSyncPromise.getResult(), {
				"@odata.context" : undefined,
				value : aElements
			});
		} else {
			return oSyncPromise.then(function (vResult) {
				assert.strictEqual(vResult, "~oReadPromise~");
			});
		}
	});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSideEffectsRefresh) {
	[false, true].forEach(function (bIndexIsSkip) {
		var sTitle = "CollectionCache#read: persisted inline creation rows; side-effects refresh = "
				+ bSideEffectsRefresh + "; 'index' is $skip = " + bIndexIsSkip;

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [{
				"@$ui5._" : {transient : "other"},
				"@$ui5.context.isTransient" : true
			}, {
				"@$ui5.context.isTransient" : false
			}, {
				"@$ui5.context.isTransient" : false
			}, {
				"@$ui5._" : {transient : "other"},
				"@$ui5.context.isTransient" : true
			}, {
				"@$ui5.context.isTransient" : false
			}],
			iExpectedPrefetch = bSideEffectsRefresh ? 3 : 0,
			oGroupLock = {
				getGroupId : function () { return "group"; },
				unlock : function () {}
			};

		oCache.aElements = aElements; // 3x persisted, 2x transient
		oCache.aElements.$created = 5;
		oCache.iLimit = 0; // "the upper limit for the count": does not include created elements!
		if (bSideEffectsRefresh) {
			oCache.oBackup = {};
		}
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(aElements), bIndexIsSkip ? 5 : 0, 100,
				iExpectedPrefetch, 5 + 0)
			.returns([]); // test is all about iExpectedPrefetch, skip the rest...
		this.oRequestorMock.expects("waitForBatchResponseReceived").never();
		this.mock(oCache).expects("requestElements").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, 100, 0, oGroupLock, null, bIndexIsSkip)
			.then(function (oResult) {
				assert.deepEqual(oResult, {
					"@odata.context" : undefined,
					value : bIndexIsSkip ? [] : aElements
				});
			});
	});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: no intervals", function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [{ // a transient element
				"@$ui5._" : {
					transient : "group",
					transientPredicate : "($uid=id-17-4)"
				}
			}],
			oGroupLock = {
				getGroupId : function () { return "group"; },
				unlock : function () {}
			};

		oCache.aElements = aElements;
		oCache.aElements.$count = 0;
		oCache.aElements.$created = 1;
		oCache.iLimit = 0; // "the upper limit for the count": does not include created elements!
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(aElements), 0, 100, 42, 1).returns([]);
		this.oRequestorMock.expects("waitForBatchResponseReceived").never();
		this.mock(oCache).expects("requestElements").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, 100, 42, oGroupLock).then(function (oResult) {
			assert.deepEqual(oResult, {
				"@odata.context" : undefined,
				value : aElements
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: delay due to multiple intervals", function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [{ // a transient element
				"@$ui5._" : {
					transient : "group",
					transientPredicate : "($uid=id-17-4)"
				}
			}],
			oGroupLock = {
				getGroupId : function () { return "group"; },
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oUnlockExpectation,
			that = this;

		oCache.aElements = aElements;
		oCache.aElements.$count = 0;
		oCache.aElements.$created = 1;
		oCache.iLimit = 0; // "the upper limit for the count": does not include created elements!
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(aElements), 0, 100, 42, 1).returns([{}, {}]);
		this.oRequestorMock.expects("waitForBatchResponseReceived")
			.withExactArgs("group")
			.callsFake(function () {
				assert.ok(oUnlockExpectation.called, "unlocked");
				that.oRequestorMock.expects("getUnlockedAutoCopy")
					.withExactArgs(sinon.match.same(oGroupLock)).returns("~oUnlockedAutoCopy~");
				that.mock(oCache).expects("read")
					.withExactArgs(0, 100, 42, "~oUnlockedAutoCopy~", "~fnDataRequested~")
					.returns("~oReadPromise~");
				// no special timing needed, #read fails if called before mocked
				return SyncPromise.resolve();
			});
		this.mock(oCache).expects("requestElements").never();
		oUnlockExpectation = this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, 100, 42, oGroupLock, "~fnDataRequested~").then(function (vResult) {
			assert.strictEqual(vResult, "~oReadPromise~");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: wait for oPendingRequestsPromise", function (assert) {
		var oCache = this.createCache("Employees"),
			fnDataRequested = function () {},
			oGroupLock = {},
			fnResolve,
			oPromise;

		oCache.oPendingRequestsPromise = new SyncPromise(function (resolve) {
			fnResolve = resolve;
		});
		oCache.aElements.$tail = new Promise(function () {}); // never resolved, must be ignored
		this.mock(ODataUtils).expects("_getReadIntervals").never();
		this.mock(oCache).expects("requestElements").never();

		// code under test
		oPromise = oCache.read(10, 20, 30, oGroupLock, fnDataRequested, "~bIndexIsSkip~");

		assert.strictEqual(oPromise.isPending(), true);

		this.mock(oCache).expects("read")
			.withExactArgs(10, 20, 30, sinon.match.same(oGroupLock),
				sinon.match.same(fnDataRequested), "~bIndexIsSkip~")
			.returns(42);
		fnResolve();

		return oPromise.then(function (vResult) {
			assert.strictEqual(vResult, 42);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: create & pending read", function (assert) {
		var oCache = this.createCache("Employees"),
			oCacheMock = this.mock(oCache),
			oCreateGroupLock = {getGroupId : function () {}},
			oCreatePromise,
			oReadPromise;

		oCacheMock.expects("checkSharedRequest").withExactArgs();
		oCacheMock.expects("addPendingRequest").never();
		oCacheMock.expects("removePendingRequest").never();
		this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs().returns("group");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees($uid=id-1-23)")
			.callsFake(function () {
				var fnSubmit = arguments[5];

				return Promise.resolve().then(function () {
					var oAddPendingRequestExpectation
							= oCacheMock.expects("addPendingRequest").withExactArgs();

					// code under test
					fnSubmit();

					assert.ok(oAddPendingRequestExpectation.called);
				}).then(function () {
					oCacheMock.expects("removePendingRequest").withExactArgs();

					return {};
				});
			});

		// code under test
		oReadPromise = this.mockRequestAndRead(oCache, 0, "Employees", 0, 3);
		oCreatePromise = oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "",
			"($uid=id-1-23)", {}, null, false, function fnSubmitCallback() {});

		return Promise.all([oReadPromise, oCreatePromise]).then(function () {
			assert.deepEqual(oCache.aElements, [
				{
					"@$ui5._" : {
						transientPredicate : "($uid=id-1-23)",
						deepCreate : false
					},
					"@$ui5.context.isTransient" : false
				},
				{key : "a", "@$ui5._" : {predicate : "('a')"}},
				{key : "b", "@$ui5._" : {predicate : "('b')"}},
				{key : "c", "@$ui5._" : {predicate : "('c')"}}
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: cancel create & pending read", function (assert) {
		var oCache = this.createCache("Employees"),
			oError = new Error(),
			oExpectation,
			aPromises,
			oUpdateGroupLock = {
				cancel : function () {},
				getGroupId : function () {}
			};

		oError.canceled = true;
		this.mock(oUpdateGroupLock).expects("getGroupId").twice().withExactArgs().returns("update");
		this.mock(oUpdateGroupLock).expects("cancel").withExactArgs();
		oExpectation = this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oUpdateGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees($uid=id-1-23)")
			.rejects(oError); // Note: fnCancel - see below
		this.mock(oCache).expects("addPendingRequest").never();
		this.mock(oCache).expects("removePendingRequest").never();

		// code under test
		aPromises = [
			oCache.create(oUpdateGroupLock, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)",
				{}).catch(function () {}),
			this.mockRequestAndRead(oCache, 1, "Employees", 0, 3)
		];
		oExpectation.args[0][6](); // simulate the requestor's callback on cancel

		return Promise.all(aPromises).then(function () {
			assert.deepEqual(oCache.aElements, [
				{key : "a", "@$ui5._" : {predicate : "('a')"}},
				{key : "b", "@$ui5._" : {predicate : "('b')"}},
				{key : "c", "@$ui5._" : {predicate : "('c')"}}
			]);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: removeElement & pending read (failing)", function (assert) {
		var oCache = this.createCache("Employees"),
			that = this;

		// prefill the cache
		return this.mockRequestAndRead(oCache, 0, "Employees", 0, 3).then(function () {
			var oReadPromise,
				oReadGroupLock = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oUnlockedCopy = {
					getGroupId : function () { return "group"; }
				};

			that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy);
			that.mock(oReadGroupLock).expects("unlock").withExactArgs();

			that.oRequestorMock.expects("request")
				.withExactArgs("GET", "Employees?$skip=3&$top=3",
					sinon.match.same(oUnlockedCopy), /*mHeaders*/undefined, /*oPayload*/undefined,
					/*fnSubmit*/undefined)
				.returns(Promise.reject(new Error()));

			// code under test
			oReadPromise = oCache.read(3, 3, 0, oReadGroupLock);
			oCache.removeElement(1, "('b')");

			return oReadPromise;
		}).then(function () {
			assert.ok(false);
		}, function () {
			assert.deepEqual(oCache.aElements, [
				{key : "a", "@$ui5._" : {predicate : "('a')"}},
				{key : "c", "@$ui5._" : {predicate : "('c')"}},
				undefined,
				undefined,
				undefined
			]);
			assert.deepEqual(oCache.aReadRequests, [], "cleaned up properly");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: removeElement & pending reads", function (assert) {
		var oCache = this.createCache("Employees"),
			oReadPromise1,
			fnResolve,
			that = this;

		// prefill the cache
		return this.mockRequestAndRead(oCache, 0, "Employees", 3, 3).then(function () {
			var oPromise = new Promise(function (resolve) {
					fnResolve = resolve;
				}),
				oReadGroupLock = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oReadPromise2,
				oUnlockedCopy = {
					getGroupId : function () { return "group"; }
				};

			that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy);
			that.mock(oReadGroupLock).expects("unlock").withExactArgs();
			that.oRequestorMock.expects("request")
				.withExactArgs("GET", "Employees?$skip=6&$top=3",
					sinon.match.same(oUnlockedCopy), /*mHeaders*/undefined, /*oPayload*/undefined,
					/*fnSubmit*/undefined)
				.returns(oPromise);

			// code under test
			oReadPromise1 = oCache.read(6, 3, 0, oReadGroupLock);
			oReadPromise2 = that.mockRequestAndRead(oCache, 0, "Employees", 1, 2);
			oCache.removeElement(4, "('e')");

			return oReadPromise2;
		}).then(function () {
			oCache.removeElement(4, "('f')");
			fnResolve(createResult(6, 3));
			return oReadPromise1;
		}).then(function () {
			assert.deepEqual(oCache.aElements, [
				undefined,
				{key : "b", "@$ui5._" : {predicate : "('b')"}},
				{key : "c", "@$ui5._" : {predicate : "('c')"}},
				{key : "d", "@$ui5._" : {predicate : "('d')"}},
				{key : "g", "@$ui5._" : {predicate : "('g')"}},
				{key : "h", "@$ui5._" : {predicate : "('h')"}},
				{key : "i", "@$ui5._" : {predicate : "('i')"}}
			]);
			assert.deepEqual(oCache.aReadRequests, [], "cleaned up properly");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: pending deletes", function (assert) {
		var oCache = this.createCache("Employees"),
			that = this;

		// prefill the cache
		return this.mockRequestAndRead(oCache, 0, "Employees", 0, 6).then(function () {
			var oDeleteGroupLock0 = {
					getGroupId : function () { return "delete"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oDeleteGroupLock1 = {
					getGroupId : function () { return "delete"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oDeleteGroupLock2 = {
					getGroupId : function () { return "delete"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oGroupLock = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oUnlockedCopy = {
					getGroupId : function () { return "$auto"; }
				};

			that.oRequestorMock.expects("request")
				.withArgs("DELETE", "Employees('b')", sinon.match.same(oDeleteGroupLock0))
				.resolves();
			that.oRequestorMock.expects("request")
				.withArgs("DELETE", "Employees('c')", sinon.match.same(oDeleteGroupLock1))
				.callsFake(function () { // a simple .resolves() resolves too early
					return new Promise(function (resolve) {
						setTimeout(resolve);
					});
				});
			that.oRequestorMock.expects("request")
				.withArgs("DELETE", "Employees('d')", sinon.match.same(oDeleteGroupLock2))
				.rejects(new Error());
			that.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
			that.oRequestorMock.expects("request")
				.withArgs("GET", "Employees?$filter=not%20(key%20eq%20'b'%20or%20key%20eq%20'c'"
					+ "%20or%20key%20eq%20'd')&$skip=3&$top=2", sinon.match.same(oUnlockedCopy))
				.resolves(createResult(6, 2));

			// code under test
			return Promise.all([
				oCache._delete(oDeleteGroupLock0, "Employees('b')", "1", null, function () {}),
				oCache._delete(oDeleteGroupLock1, "Employees('c')", "1", null, function () {}),
				oCache._delete(
					oDeleteGroupLock2, "Employees('d')", "1", null, function () {}
				).catch(function () {}),
				oCache.read(3, 2, 0, oGroupLock)
			]).then(function () {
				assert.deepEqual(
					oCache.aElements.map(function (oElement) {
						return _Helper.getPrivateAnnotation(oElement, "predicate");
					}),
					["('a')", "('d')", "('e')", "('f')", "('g')", "('h')"]
				);
			});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bServerDrivenPaging) {
	QUnit.test("CollectionCache#read: prefetch, SDP = " + bServerDrivenPaging, function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oReadGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			};

		oCache.bServerDrivenPaging = bServerDrivenPaging;
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oCache.aElements), 20, 6, bServerDrivenPaging ? 0 : 10,
				oCache.aElements.$created + oCache.iLimit)
			// Note: not necessarily a realistic example
			.returns([{start : 15, end : 31}]);
		this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oReadGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=15&$top=16", sinon.match.same(oUnlockedCopy),
				/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/ undefined)
			.returns(Promise.resolve(createResult(15, 16)));

		// code under test
		return oCache.read(20, 6, 10, oReadGroupLock).then(function (oResult) {
			assert.deepEqual(oResult, createResult(20, 6, undefined, true));
		});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected,
			oPromise = "~oPromise~";

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

		aExpected.fill(undefined, 0);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, undefined);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = 1024", function (assert) {
		var oCache = this.createCache("Employees"),
			oPromise = "~oPromise~";

		assert.deepEqual(oCache.aElements, []);

		// code under test
		oCache.fill(oPromise, 0, 1024);

		assert.deepEqual(oCache.aElements, new Array(1024).fill(oPromise, 0));
		assert.strictEqual(oCache.aElements.$tail, undefined);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = 1025, []", function (assert) {
		var oCache = this.createCache("Employees"),
			oPromise = "~oPromise~";

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
			oPromiseNew = "~oPromiseNew~",
			oPromiseOld = "~oPromiseOld~";

		oCache.aElements.length = 4096;
		oCache.aElements.fill(oPromiseOld, 2048); // many existing rows
		oCache.aElements.$tail = oPromiseOld;

		// code under test
		oCache.fill(oPromiseNew, 0, 1025);

		aExpected = new Array(4096);
		aExpected.fill(oPromiseNew, 0, 1025);
		// gap from 1025..2048
		aExpected.fill(oPromiseOld, 2048, 4096);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromiseOld);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iEnd = Infinity, [many rows]", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected,
			oPromiseNew = "~oPromiseNew~",
			oPromiseOld = "~oPromiseOld~";

		oCache.aElements.length = 4096;
		oCache.aElements.fill(oPromiseOld, 2048); // many existing rows

		// code under test
		oCache.fill(oPromiseNew, 0, Infinity);

		aExpected = new Array(4096);
		aExpected.fill(oPromiseNew, 0, 4096);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, oPromiseNew);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fill, iStart = 2000, iEnd = 3024, []", function (assert) {
		var oCache = this.createCache("Employees"),
			aExpected = new Array(3024),
			oPromise = "~oPromise~";

		assert.deepEqual(oCache.aElements, []);
		assert.strictEqual(oCache.aElements.$tail, undefined);

		// code under test
		oCache.fill(oPromise, 2000, 3024);

		aExpected.fill(oPromise, 2000, 3024);
		assert.deepEqual(oCache.aElements, aExpected);
		assert.strictEqual(oCache.aElements.$tail, undefined);
	});

	//*********************************************************************************************
[{
	oPromise : SyncPromise.resolve("c"),
	vValue : "c"
}, {
	oPromise : new SyncPromise(function () {}), // not (yet) resolved
	vValue : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("CollectionCache#getValue " + i, function (assert) {
		var oCache = this.createCache("Employees");

		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "('c')/key")
			.returns(oFixture.oPromise);
		this.mock(oFixture.oPromise).expects("caught").withExactArgs().exactly(i);

		// code under test
		assert.strictEqual(oCache.getValue("('c')/key"), oFixture.vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#getValue: sPath undefined", function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [];

		oCache.aElements = aElements;
		this.mock(oCache).expects("fetchValue").never();

		// code under test
		assert.strictEqual(oCache.getValue(), aElements);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#requestElements: clean up $tail again", function (assert) {
		var oCache = this.createCache("Employees"),
			oReadGroupLock0 = {
				getGroupId : function () { return "group"; }
			},
			oReadGroupLock1 = {
				getGroupId : function () { return "group"; },
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			fnResolve;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees", sinon.match.same(oReadGroupLock0),
				/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
			.returns(new Promise(function (resolve) {
				fnResolve = resolve;
			}));

		// code under test
		oCache.requestElements(0, Infinity, oReadGroupLock0);

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=0&$top=1",
				sinon.match.same(oReadGroupLock1), /*mHeaders*/undefined,
				/*oPayload*/undefined, /*fnSubmit*/ undefined)
			.returns(Promise.resolve(createResult(0, 1)));

		// code under test
		// MUST NOT clean up $tail
		oCache.requestElements(0, 1, oReadGroupLock1);

		return oCache.aElements[0].then(function () {
			fnResolve(createResult(0, 1));

			return oCache.aElements.$tail.then(function () {
				assert.strictEqual(oCache.aElements.$tail, undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#getExclusiveFilter: no created entities", function (assert) {
		var oCache = this.createCache("Employees");

		this.mock(oCache).expects("getTypes").never();

		// code under test
		assert.strictEqual(oCache.getExclusiveFilter(), undefined);
	});

	//*********************************************************************************************
[
	{single : true, filter : "not (EmployeeId eq '42')"},
	{deleted : true, filter : "not (EmployeeId eq '12' or EmployeeId eq '23')"},
	{single : true, deleted : true,
		filter : "not (EmployeeId eq '12' or EmployeeId eq '23' or EmployeeId eq '42')"},
	{multiple : true, filter : "not (EmployeeId eq '42' or EmployeeId eq '43')"}
].forEach(function (oFixture) {
	var sTitle = "CollectionCache#getExclusiveFilter: " + JSON.stringify(oFixture);

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees", {/*mQueryOptions*/}),
			oElement0 = {},
			oElement1 = {"@$ui5.context.isTransient" : true},
			oElement2 = {},
			oElement3 = {},
			oElement4 = {},
			oElement5 = {},
			oHelperMock = this.mock(_Helper),
			mTypeForMetaPath = {};

		this.mock(oCache).expects("getTypes").returns(mTypeForMetaPath);
		oCache.aElements.$created = 0;
		if (oFixture.single || oFixture.multiple) {
			oCache.aElements.unshift(oElement0);
			oCache.aElements.$created += 1;
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement0), oCache.sMetaPath,
					sinon.match.same(mTypeForMetaPath))
				.returns("EmployeeId eq '42'");
		}
		if (oFixture.deleted) {
			oCache.aElements.$deleted = [
				{created : true, predicate : "('23')"},
				{created : false, predicate : "('12')"}
			];
			oCache.aElements.$byPredicate = {"('23')" : oElement4, "('12')" : oElement5};
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement4), oCache.sMetaPath,
					sinon.match.same(mTypeForMetaPath))
				.returns("EmployeeId eq '23'");
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement5), oCache.sMetaPath,
					sinon.match.same(mTypeForMetaPath))
				.returns("EmployeeId eq '12'");
		}
		if (oFixture.multiple) {
			oCache.aElements.unshift(oElement1);
			oCache.aElements.unshift(oElement2);
			oCache.aElements.unshift(oElement3);
			oCache.aElements.$created += 3;
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement2), oCache.sMetaPath,
					sinon.match.same(mTypeForMetaPath))
				.returns("EmployeeId eq '43'");
			oHelperMock.expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oElement3), oCache.sMetaPath,
					sinon.match.same(mTypeForMetaPath))
				.returns(undefined); // simulate missing key property --> silently ignored
		}

		// code under test
		assert.strictEqual(oCache.getExclusiveFilter(), oFixture.filter);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#getQueryString: no exclusive filter", function (assert) {
		var oCache = this.createCache("Employees");

		oCache.sQueryString = "?foo=bar";
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oCache.getQueryString(), oCache.sQueryString);

		assert.strictEqual(oCache.sQueryString, "?foo=bar");
	});

	//*********************************************************************************************
["?foo=bar", ""].forEach(function (sQuery) {
	QUnit.test("CollectionCache#getQueryString: no own filter, query=" + sQuery, function (assert) {
		var oCache = this.createCache("Employees");

		oCache.sQueryString = sQuery;
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs()
			.returns("~exclusive~");
		this.mock(_Helper).expects("encode").withExactArgs("~exclusive~", false)
			.returns("~encoded~");

		// code under test
		assert.strictEqual(oCache.getQueryString(),
			sQuery ? sQuery + "&$filter=~encoded~" : "?$filter=~encoded~");

		assert.strictEqual(oCache.sQueryString, sQuery);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#getQueryString: own and exclusive filter", function (assert) {
		var oCache = this.createCache("Employees", {
				foo : "bar",
				$filter : "~own~"
			});

		oCache.bSortExpandSelect = "bSortExpandSelect";
		this.mock(oCache).expects("getExclusiveFilter").withExactArgs()
			.returns("~exclusive~");
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, {
				foo : "bar",
				$filter : "(~own~) and ~exclusive~"
			}, false, "bSortExpandSelect")
			.returns("?~");

		// code under test
		assert.strictEqual(oCache.getQueryString(), "?~");

		assert.strictEqual(oCache.mQueryOptions.$filter, "~own~");
	});

	//*********************************************************************************************
	[{
		iEnd : Infinity,
		sQueryString : "",
		iStart : 42,
		sResourcePath : "Employees?$skip=42"
	}, {
		iEnd : Infinity,
		sQueryString : "?foo",
		iStart : 42,
		sResourcePath : "Employees?foo&$skip=42"
	}, {
		iEnd : 55,
		sQueryString : "?foo",
		iStart : 42,
		sResourcePath : "Employees?foo&$skip=42&$top=13"
	}, {
		iEnd : 10,
		sQueryString : "?foo",
		iStart : 0,
		sResourcePath : "Employees?foo&$skip=0&$top=10"
	}, {
		iEnd : Infinity,
		sQueryString : "?foo",
		iStart : 0,
		sResourcePath : "Employees?foo"
	}, {
		iEnd : undefined, // undefined is treated as Infinity
		sQueryString : "",
		iStart : 42,
		sResourcePath : "Employees?$skip=42"
	}].forEach(function (oFixture, i) {
		QUnit.test("CollectionCache#getResourcePathWithQuery: " + i, function (assert) {
			var oCache = this.createCache("Employees");

			oCache.sQueryString = oFixture.sQueryString;

			// code under test
			assert.strictEqual(oCache.getResourcePathWithQuery(oFixture.iStart, oFixture.iEnd),
				oFixture.sResourcePath);
		});
	});

	//*********************************************************************************************
	[{
		iEnd : Infinity,
		sQueryString : "",
		iStart : 43,
		sResourcePath : "Employees?$skip=41"
	}, {
		iEnd : Infinity,
		sQueryString : "?foo",
		iStart : 43,
		sResourcePath : "Employees?foo&$skip=41"
	}, {
		iEnd : 56,
		sQueryString : "?foo",
		iStart : 43,
		sResourcePath : "Employees?foo&$skip=41&$top=13"
	}, {
		iEnd : 11,
		sQueryString : "?foo",
		iStart : 2,
		sResourcePath : "Employees?foo&$skip=0&$top=9"
	}, {
		iEnd : Infinity,
		sQueryString : "?foo",
		iStart : 2,
		sResourcePath : "Employees?foo"
	}, {
		iEnd : undefined, // undefined is treated as Infinity
		sQueryString : "",
		iStart : 43,
		sResourcePath : "Employees?$skip=41"
	}].forEach(function (oFixture, i) {
		var sTitle = "CollectionCache#getResourcePathWithQuery: with create #" + i;

		QUnit.test(sTitle, function (assert) {
			var oCache = this.createCache("Employees"),
				oCreateGroupLock0 = {getGroupId : function () {}},
				oCreateGroupLock1 = {getGroupId : function () {}};

			this.mock(oCache).expects("getQueryString").returns(oFixture.sQueryString);
			this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("create");
			this.oRequestorMock.expects("request").withArgs("POST", "Employees",
					sinon.match.same(oCreateGroupLock0))
				.callsArg(5) // fnSubmit
				.resolves({});
			oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)",
				{}, null, false, function fnSubmitCallback() {});
			this.mock(oCreateGroupLock1).expects("getGroupId").withExactArgs().returns("create");
			this.oRequestorMock.expects("request").withArgs("POST", "Employees",
				sinon.match.same(oCreateGroupLock1))
				.callsArg(5) // fnSubmit
				.resolves({});
			oCache.create(oCreateGroupLock1, SyncPromise.resolve("Employees"), "", "($uid=id-1-24)",
				{}, null, false, function fnSubmitCallback() {});

			// code under test
			assert.strictEqual(oCache.getResourcePathWithQuery(oFixture.iStart, oFixture.iEnd),
				oFixture.sResourcePath);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#getResourcePathWithQuery: not for created!", function (assert) {
		var oCache = this.createCache("Employees"),
			oCreateGroupLock0 = {getGroupId : function () {}},
			oCreateGroupLock1 = {getGroupId : function () {}};

		this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("create");
		this.oRequestorMock.expects("request").withArgs("POST", "Employees",
				sinon.match.same(oCreateGroupLock0))
			.callsArg(5) // fnSubmit
			.resolves({});
		oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "", "($uid=id-1-23)", {},
			null, false, function fnSubmitCallback() {});
		this.mock(oCreateGroupLock1).expects("getGroupId").withExactArgs().returns("create");
		this.oRequestorMock.expects("request").withArgs("POST", "Employees",
				sinon.match.same(oCreateGroupLock1))
			.callsArg(5) // fnSubmit
			.resolves({});
		oCache.create(oCreateGroupLock1, SyncPromise.resolve("Employees"), "", "($uid=id-1-24)", {},
			null, false, function fnSubmitCallback() {});

		// Note: we forbid ranges which contain created entities
		assert.throws(function () {
			// code under test
			oCache.getResourcePathWithQuery(0, 2);
		}, new Error("Must not request created element"));

		assert.throws(function () {
			// code under test
			oCache.getResourcePathWithQuery(1, 2);
		}, new Error("Must not request created element"));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#handleResponse", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement0 = {},
			oElement1 = {},
			oResult = {
				"@odata.context" : "~context~",
				value : [oElement0, oElement1]
			};

		oCache.aElements = [];
		oCache.aElements.$byPredicate = {};
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oResult), "~oFetchTypesResult~", undefined,
				undefined, 2)
			.callsFake(function () {
				_Helper.setPrivateAnnotation(oElement0, "predicate", "foo");
			});

		assert.strictEqual(
			// code under test
			oCache.handleResponse(oResult, 2, "~oFetchTypesResult~"),
			0);

		assert.strictEqual(oCache.sContext, "~context~");
		assert.strictEqual(oCache.aElements[2], oElement0);
		assert.strictEqual(oCache.aElements[3], oElement1);
		assert.strictEqual(oCache.aElements.$byPredicate["foo"], oElement0);
		assert.strictEqual(Object.keys(oCache.aElements.$byPredicate).length, 1);
	});

	//*********************************************************************************************
[true, false].forEach(function (bWithCount) {
	QUnit.test("CollectionCache#handleCount: " + bWithCount, function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [],
			oResult = {
				"@odata.count" : bWithCount ? "4" : undefined,
				value : [{}, {}] // only length is needed
			};

		oCache.mChangeListeners = "~mChangeListeners~";
		oCache.iActiveElements = aElements.$created = 2;
		oCache.aElements = aElements;
		oCache.iLimit = "~iLimit~";
		this.mock(_Helper).expects("setCount")
			.withExactArgs("~mChangeListeners~", "", sinon.match.same(aElements), 6)
			.exactly(bWithCount ? 1 : 0);

		assert.strictEqual(
			// code under test
			oCache.handleCount(/*oGroupLock*/null, 0, 2, 4, oResult, 0),
			undefined);

		assert.strictEqual(oCache.iLimit, bWithCount ? 4 : "~iLimit~");
	});
});

	//*********************************************************************************************
	[{
		sTitle : "empty read after @odata.count returned from server",
		iCount : 42,
		iStart : 100,
		iExpectedCount : 42,
		iExpectedLength : 42,
		iExpectedLimit : 42
	}, {
		sTitle : "short read without server length",
		iStart : 100,
		vValue : [{}],
		iExpectedCount : 101,
		iExpectedLength : 101,
		iExpectedLimit : 101
	}, {
		sTitle : "empty read without knowing length",
		iStart : 100,
		iExpectedCount : undefined,
		iExpectedLength : 100,
		iExpectedLimit : 100
	}, {
		sTitle : "empty read starting at 0",
		iStart : 0,
		iExpectedCount : 0,
		iExpectedLength : 0,
		iExpectedLimit : 0
	}, {
		sTitle : "empty read before @odata.count returned from server",
		iCount : 42,
		iStart : 30,
		iExpectedCount : 30,
		iExpectedLength : 30,
		iExpectedLimit : 30
	}, {
		iActive : 1,
		iCount : 3,
		iCreated : 3,
		iExpectedCount : 4,
		iExpectedLength : 6,
		iExpectedLimit : 3,
		iStart : 5,
		sTitle : "short read while created elements are present, @odata.count OK",
		vValue : [{}]
	}, {
		iActive : 2,
		iCreated : 3,
		aElements : [{}, {}, {}, {}, {}, {}],
		iExpectedCount : 5,
		iExpectedLength : 6,
		iExpectedLimit : 3,
		iOldCount : 5,
		iStart : 5,
		sTitle : "short read while created and inactive elements are present",
		vValue : [{}]
	}, {
		iCount : 4, // maybe unrealistic, but spec allows for this
		iCreated : 3,
		iExpectedCount : 6,
		iExpectedLength : 6,
		iExpectedLimit : 3,
		iStart : 5,
		sTitle : "short read while created elements are present, @odata.count wrong",
		vValue : [{}]
	}].forEach(function (oFixture) {
		QUnit.test("CollectionCache#handleCount: " + oFixture.sTitle, function (assert) {
			var oCache = this.createCache("Employees"),
				aElements = oFixture.aElements || [],
				oResult = {
					"@odata.context" : "foo",
					value : oFixture.vValue || []
				};

			oCache.mChangeListeners = "~mChangeListeners~";
			oCache.aElements = aElements;
			oCache.aElements.$count = oFixture.iOldCount;
			oCache.aElements.$created = oFixture.iCreated || 0;
			oCache.iActiveElements = oFixture.iActive || oCache.aElements.$created;
			if (oFixture.iCount) {
				oResult["@odata.count"] = "" + oFixture.iCount;
			}
			this.mock(_Helper).expects("setCount")
				.withExactArgs("~mChangeListeners~", "",
					sinon.match.same(oCache.aElements), oFixture.iExpectedCount);
			// prepare aElements for "short read without server length"
			oCache.handleResponse(oResult, oFixture.iStart, {});

			assert.strictEqual(
				// code under test
				oCache.handleCount(/*oGroupLock*/null, 0, oFixture.iStart, oFixture.iStart + 10,
					oResult, 0),
				undefined);

			assert.strictEqual(oCache.aElements.length, oFixture.iExpectedLength, "length");
			assert.strictEqual(oCache.iLimit, oFixture.iExpectedLimit, "iLimit");
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#handleCount: server-driven paging at end", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement5 = {},
			i,
			oReadPromise = {/* SyncPromise */}, // the promise for elements waiting to be read
			oResult = {
				"@odata.context" : "foo",
				"@odata.nextLink" : "~nextLink",
				value : [oElement5]
			};

		oCache.mChangeListeners = "~mChangeListeners~";
		oCache.aElements = new Array(10);
		oCache.aElements.fill(oReadPromise, 5, 10);
		oCache.aElements[5] = oElement5; // simulates #handleResponse
		oCache.aElements.$count = undefined;
		this.mock(_Helper).expects("setCount").never();

		assert.strictEqual(
			// code under test
			oCache.handleCount(/*oGroupLock*/null, 0, 5, 10, oResult, 0),
			undefined);

		assert.strictEqual(oCache.aElements.length, 6, "length");
		assert.strictEqual(oCache.iLimit, Infinity, "iLimit");
		assert.strictEqual(oCache.bServerDrivenPaging, true);
		for (i = 6; i < 10; i += 1) {
			assert.strictEqual(oCache.aElements[i], undefined);
			assert.notOk(oCache.aElements.hasOwnProperty(i));
		}
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#handleCount: server-driven paging for gap", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement10 = {},
			oElement5 = {},
			i,
			oReadPromise = {/* SyncPromise */}, // the promise for elements waiting to be read
			oResult = {
				"@odata.context" : "foo",
				"@odata.nextLink" : "~nextLink",
				value : [oElement5]
			};

		oCache.mChangeListeners = "~mChangeListeners~";
		oCache.aElements = [];
		oCache.aElements[10] = oElement10;
		oCache.aElements.fill(oReadPromise, 5, 10);
		oCache.aElements[5] = oElement5; // simulates #handleResponse
		oCache.aElements.$count = undefined;
		this.mock(_Helper).expects("setCount").never();

		assert.strictEqual(
			// code under test
			oCache.handleCount(/*oGroupLock*/null, 0, 5, 10, oResult, 0),
			undefined);

		assert.strictEqual(oCache.aElements.length, 11, "length");
		assert.strictEqual(oCache.iLimit, Infinity, "iLimit");
		assert.strictEqual(oCache.aElements[5], oElement5);
		assert.strictEqual(oCache.bServerDrivenPaging, true);
		for (i = 6; i < 10; i += 1) {
			assert.strictEqual(oCache.aElements[i], undefined);
			assert.notOk(oCache.aElements.hasOwnProperty(i));
		}
		assert.strictEqual(oCache.aElements[10], oElement10);
	});

	//*********************************************************************************************
[undefined, "same", "other"].forEach(function (sKeptETag) {
	var sTitle = "CollectionCache#handleResponse: kept-alive element, kept eTag=" + sKeptETag;

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			oElement0 = { // persisted
				"@my.name" : "oElement0" // to facilitate deepEqual below!
			},
			oElement1 = { // newly created
				"@my.name" : "oElement1",
				"@odata.etag" : "same"
			},
			oElement2 = { // newly created
				"@my.name" : "oElement2",
				"@odata.etag" : "same"
			},
			oElement3 = { // kept alive
				"@my.name" : "oElement3",
				"@odata.etag" : "same"
			},
			// oElement0 is placed in an unrealistic position here to make sure that newly created
			// ones are not searched for everywhere, but only in the range [0, $created[
			aElements = [oElement1, oElement2, 3, 4, 5, 6, 7, oElement0], // could be promises...
			oFetchTypesResult = {},
			oKeptElement = {
				"@odata.etag" : sKeptETag
			},
			oResult = {
				value : [oElement0, oElement1, oElement2, oElement3]
			};

		aElements.$byPredicate = {
			bar : oKeptElement,
			new1 : oElement1,
			new2 : oElement2
		};
		aElements.$created = 2;
		oCache.aElements = aElements;
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult),
				undefined, undefined, 2)
			.callsFake(function () {
				_Helper.setPrivateAnnotation(oElement0, "predicate", "foo");
				_Helper.setPrivateAnnotation(oElement1, "predicate", "new1");
				_Helper.setPrivateAnnotation(oElement2, "predicate", "new2");
				_Helper.setPrivateAnnotation(oElement3, "predicate", "bar");
			});
		this.mock(_Helper).expects("updateNonExisting").exactly(sKeptETag === "other" ? 0 : 1)
			.withExactArgs(sinon.match.same(oKeptElement), sinon.match.same(oElement3));
		this.mock(oCache).expects("hasPendingChangesForPath").exactly(sKeptETag === "other" ? 1 : 0)
			.withExactArgs("bar").returns(false);

		assert.strictEqual(
			// code under test
			oCache.handleResponse(oResult, 2, oFetchTypesResult),
			2);

		// Note: for each newly created, one undefined is written at the end of oResult, so to say
		assert.deepEqual(oCache.aElements, [oElement1, oElement2, oElement0,
			sKeptETag === "other" ? oElement3 : oKeptElement, undefined, undefined, 7, oElement0]);
		assert.strictEqual(oCache.aElements.$byPredicate["foo"], oElement0);
		assert.strictEqual(oCache.aElements.$byPredicate["new1"], oElement1);
		assert.strictEqual(oCache.aElements.$byPredicate["new2"], oElement2);
		assert.strictEqual(oCache.aElements.$byPredicate["bar"], oCache.aElements[3]);
		assert.deepEqual(Object.keys(oCache.aElements.$byPredicate),
			["bar", "new1", "new2", "foo"]);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#handleResponse: kept-alive element", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = { // kept alive
				"@my.name" : "oElement",
				"@odata.etag" : "same"
			},
			// oElement is placed in an unrealistic position here to make sure that newly created
			// ones are not searched for everywhere, but only in the range [0, $created[
			aElements = [1, 2, 3, 4, 5, 6, 7, oElement]; // could be promises...

		_Helper.setPrivateAnnotation(oElement, "predicate", "bar");
		aElements.$byPredicate = {bar : oElement};
		aElements.$created = 0;
		oCache.aElements = aElements;
		this.mock(oCache).expects("visitResponse"); // args do not matter for this test
		this.mock(_Helper).expects("updateNonExisting"); // args do not matter for this test

		assert.strictEqual(
			// code under test
			oCache.handleResponse({value : [oElement]}, 2, {/*oFetchTypesResult*/}),
			0);
	});

	//*********************************************************************************************
[false, true].forEach(function (bShortRead) {
	QUnit.test("CollectionCache#handleCount: short read=" + bShortRead, function (assert) {
		var oCache = this.createCache("Employees"),
			aElements = [0, 1, 2, 3, 4, 5, 6, 7], // could be promises...
			oResult = {
				value : [{}, {}, {}, {}] // only length is needed
			};

		oCache.aElements = aElements;
		oCache.aElements.$created = 2;

		assert.strictEqual(
			// code under test
			oCache.handleCount(/*oGroupLock*/null, 0, 2, bShortRead ? 8 : 6, oResult, 2),
			undefined);

		assert.deepEqual(oCache.aElements, bShortRead ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7]);
		assert.strictEqual(oCache.iLimit, bShortRead ? 2 : Infinity);
		assert.strictEqual(oCache.aElements.$count, undefined);
	});
});

	//*********************************************************************************************
["Auto", "API", "Direct"].forEach(function (sSubmitMode) {
	// Note: must be at least 2, see "newly created" below; if greater, not all "newly created" have
	// been read (because iFiltered is fixed to 2)
	[2, 3].forEach(function (iTransientElements) {
		// Note: undefined means "almost", that is, the $count tells us that we've seen 'em all
		[undefined, false, true].forEach(function (vShortRead) {
			[2, 3].forEach(function (iStart) {
				var bRequestCount = iTransientElements > 2 && (iStart > 2 || vShortRead === false),
					sTitle = "CollectionCache#handleCount: submit mode=" + sSubmitMode
						+ ", no. of transient=" + iTransientElements
						+ ", short read=" + vShortRead
						+ ", start=" + iStart;

				if (!bRequestCount && sSubmitMode !== "Auto") {
					return;
				}

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			iEnd = iStart + (vShortRead === true ? 5 : 4),
			oGroupLock = {
				getGroupId : function () {},
				getUnlockedCopy : function () {}
			},
			oResult = {
				"@odata.count" : vShortRead === false ? "42" : "4",
				value : [{}, {}, {}, {}] // only original length is needed
			};

		oCache.iActiveElements = 2;
		oCache.aElements = []; // don't care
		oCache.aElements.$count = 23;
		oCache.aElements.$created = 2;
		oCache.iLimit = "~iLimit~";
		this.oRequestorMock.expects("getUnlockedAutoCopy").exactly(bRequestCount ? 1 : 0)
			.withExactArgs(sinon.match.same(oGroupLock)).returns("~groupLock~");
		this.mock(oCache).expects("requestCount").exactly(bRequestCount ? 1 : 0)
			.withExactArgs("~groupLock~").returns("~oRequestCountPromise~");

		assert.strictEqual(
			// code under test
			oCache.handleCount(oGroupLock, iTransientElements, iStart, iEnd, oResult,
				/*iFiltered*/2),
			bRequestCount ? "~oRequestCountPromise~" : undefined);

		if (vShortRead === true) {
			assert.strictEqual(oCache.iLimit, bRequestCount ? iStart : 4 - 2);
			assert.strictEqual(oCache.aElements.$count, oCache.iLimit + 2);
		} else if (bRequestCount) {
			assert.strictEqual(oCache.aElements.$count, 23, "unchanged");
			assert.strictEqual(oCache.iLimit, "~iLimit~", "unchanged");
		} else {
			assert.strictEqual(oCache.iLimit, (vShortRead === undefined ? 4 : 42) - 2);
			assert.strictEqual(oCache.aElements.$count, oCache.iLimit + 2);
		}
	});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#handleResponse: kept-alive, update conflict", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {
				"@odata.etag" : "new"
			},
			aElements = [],
			oFetchTypesResult = {},
			oKeptElement = {
				"@odata.etag" : "old"
			},
			oResult = {
				value : [oElement]
			};

		aElements.$byPredicate = {
			"('foo')" : oKeptElement
		};
		oCache.aElements = aElements;

		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oResult), sinon.match.same(oFetchTypesResult),
				undefined, undefined, 2)
			.callsFake(function () {
				_Helper.setPrivateAnnotation(oElement, "predicate", "('foo')");
			});
		this.mock(oCache).expects("hasPendingChangesForPath").withExactArgs("('foo')")
			.returns(true);

		assert.throws(function () {
			// code under test
			oCache.handleResponse(oResult, 2, oFetchTypesResult);
		}, new Error("Modified on client and on server: Employees('foo')"));
	});

	//*********************************************************************************************
	[true, false].forEach(function (bTail) {
		QUnit.test("CollectionCache#requestElements: bTail = " + bTail, function (assert) {
			var oCache = this.createCache("Employees"),
				oCacheMock = this.mock(oCache),
				iEnd = 10,
				oGroupLock = {
					getGroupId : function () { return "group"; }
				},
				fnDataRequested = {},
				sResourcePath = {},
				oResult = {},
				iStart = 0,
				mTypeForMetaPath = {},
				oFetchPromise = Promise.resolve(mTypeForMetaPath),
				oPromise,
				oRequestPromise = Promise.resolve(oResult);

			oCache.bSentRequest = false;
			oCache.aElements.$tail = undefined;

			oCacheMock.expects("getResourcePathWithQuery").withExactArgs(iStart, iEnd)
				.returns(sResourcePath);
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sinon.match.same(sResourcePath), sinon.match.same(oGroupLock),
					/*mHeaders*/undefined, /*oPayload*/undefined, sinon.match.same(fnDataRequested))
				.returns(oRequestPromise);
			oCacheMock.expects("fetchTypes").withExactArgs().returns(oFetchPromise);
			oCacheMock.expects("handleResponse")
				.withExactArgs(sinon.match.same(oResult), iStart,
					sinon.match.same(mTypeForMetaPath))
				.returns("~iFiltered~");
			oCacheMock.expects("handleCount")
				.withExactArgs(sinon.match.same(oGroupLock), "~iTransientElements~", iStart, iEnd,
					sinon.match.same(oResult), "~iFiltered~"); // .returns(undefined)
			oCacheMock.expects("fill")
				.withExactArgs(sinon.match(function (oSyncPromise) {
					oPromise = oSyncPromise;
					if (bTail) {
						oCache.aElements.$tail = oPromise;
					}
					return oPromise instanceof SyncPromise;
				}), iStart, iEnd);

			// code under test
			oCache.requestElements(iStart, iEnd, oGroupLock, "~iTransientElements~",
				fnDataRequested);

			assert.strictEqual(oCache.bSentRequest, true);
			assert.strictEqual(oCache.aElements.$tail, bTail ? oPromise : undefined);

			return Promise.all([oFetchPromise, oRequestPromise, oPromise]).then(function () {
				assert.strictEqual(oCache.aElements.$tail, undefined);
			});
		});
	});

	//*********************************************************************************************
[false, true, undefined].forEach(function (bSuccess) { // undefined -> obsolete
	QUnit.test("CollectionCache#requestElements: success=" + bSuccess, function (assert) {
		var oCache = this.createCache("Employees"),
			oCacheMock = this.mock(oCache),
			oCheckRangeExpectation,
			iEnd = 10,
			oError = new Error(),
			oFillExpectation,
			iStart = 0,
			oFetchPromise = Promise.resolve("~mTypes~"),
			oHandleResponseExpectation,
			oPromise,
			oResetExpectation, // avoid "was used before it was defined"
			oRequestPromise = Promise.resolve().then(function () {
				oCheckRangeExpectation = oCacheMock.expects("checkRange")
					.exactly(bSuccess !== undefined ? 1 : 0)
					.withExactArgs(sinon.match.same(oPromise), iStart, iEnd);
				oResetExpectation = oCacheMock.expects("fill").exactly(bSuccess === false ? 1 : 0)
					.withExactArgs(undefined, iStart, iEnd);
				if (bSuccess === false) {
					throw oError;
				}
				return "~oResult~";
			});

		oCache.bSentRequest = false;

		oCacheMock.expects("getResourcePathWithQuery").withExactArgs(iStart, iEnd)
			.returns("~sResourcePath~");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~sResourcePath~", "~oGroupLock~", /*mHeaders*/undefined,
				/*oPayload*/undefined, "~fnDataRequested~")
			.returns(oRequestPromise);
		oCacheMock.expects("fetchTypes").withExactArgs().returns(oFetchPromise);
		oHandleResponseExpectation = oCacheMock.expects("handleResponse").exactly(bSuccess ? 1 : 0)
			.withExactArgs("~oResult~", iStart, "~mTypes~")
			.returns("~iFiltered~");
		oCacheMock.expects("handleCount").exactly(bSuccess ? 1 : 0)
			.withExactArgs("~oGroupLock~", 0, iStart, iEnd, "~oResult~", "~iFiltered~");
		oFillExpectation = oCacheMock.expects("fill")
			.withExactArgs(sinon.match.instanceOf(SyncPromise), iStart, iEnd);

		// code under test
		oPromise = oCache.requestElements(iStart, iEnd, "~oGroupLock~", 0, "~fnDataRequested~");

		assert.deepEqual(oCache.aReadRequests, [{iStart, iEnd, bObsolete : false}]);
		if (bSuccess === undefined) {
			oCache.aReadRequests[0].bObsolete = true;
		}
		assert.strictEqual(oCache.bSentRequest, true);
		assert.strictEqual(oFillExpectation.args[0][0], oPromise);

		return oPromise.then(function () {
			assert.ok(bSuccess);
			assert.ok(oCheckRangeExpectation.calledBefore(oHandleResponseExpectation));
		}, function (oRequestError) {
			assert.notOk(bSuccess);
			if (bSuccess === false) {
				assert.strictEqual(oRequestError, oError);
				assert.ok(oCheckRangeExpectation.calledBefore(oResetExpectation));
			} else {
				assert.ok(oRequestError.canceled);
				assert.strictEqual(oRequestError.message, "Request is obsolete");
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#requestElements: $filter=false", function (assert) {
		var oCache = this.createCache("Employees", {$filter : "false"}),
			oCacheMock = this.mock(oCache),
			oCheckRangeExpectation,
			iEnd = 10,
			oFillExpectation,
			iStart = 0,
			oHandleResponseExpectation,
			oPromise,
			oResult = {"@odata.count" : "0", value : []};

		oCache.bSentRequest = false;

		oCacheMock.expects("getResourcePathWithQuery").never();
		this.oRequestorMock.expects("request").never();
		oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve("~mTypes~"));
		oFillExpectation = oCacheMock.expects("fill")
			.withExactArgs(sinon.match.instanceOf(SyncPromise), iStart, iEnd);
		Promise.resolve().then(function () { // must be called asynchronously
			oCheckRangeExpectation = oCacheMock.expects("checkRange")
				.withExactArgs(sinon.match.same(oPromise), iStart, iEnd);
			oHandleResponseExpectation = oCacheMock.expects("handleResponse")
				.withExactArgs(oResult, iStart, "~mTypes~")
				.returns("~iFiltered~");
			oCacheMock.expects("handleCount")
				.withExactArgs("~oGroupLock~", 0, iStart, iEnd, oResult, "~iFiltered~");
		});

		// code under test
		oPromise = oCache.requestElements(iStart, iEnd, "~oGroupLock~", 0, "~fnDataRequested~");

		assert.deepEqual(oCache.aReadRequests, [{iStart, iEnd, bObsolete : false}]);

		assert.strictEqual(oCache.bSentRequest, true);
		assert.strictEqual(oFillExpectation.args[0][0], oPromise);

		return oPromise.then(function () {
			assert.ok(oCheckRangeExpectation.calledBefore(oHandleResponseExpectation));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#checkRange", function (assert) {
		var oCache = this.createCache("Employees");

		oCache.fill("~oPromise1~", 4, 7);
		// code under test
		oCache.checkRange("~oPromise1~", 4, 7);

		oCache.aElements[6] = {};
		assert.throws(function () {
			// code under test
			oCache.checkRange("~oPromise1~", 4, 7);
		}, new Error("Found data at an index being read from the back end"));

		oCache.fill("~oPromise2~", 1020, 1030); // sets $tail, never writes the promise
		// code under test
		oCache.checkRange("~oPromise2~", 1020, 1030);

		oCache.aElements = [];
		oCache.fill("~oPromise3~", 0, Infinity); // sets $tail, never writes the promise
		oCache.fill("~oPromise4~", 0, 4);
		oCache.aElements[2] = {};

		// code under test
		oCache.checkRange("~oPromise3~", 0, Infinity); // no checks due to $tail
		assert.throws(function () {
			// code under test
			oCache.checkRange("~oPromise4~", 0, 4);
		}, new Error("Found data at an index being read from the back end"));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, $skip=0", function (assert) {
		var oCache = this.createCache("Employees", undefined, "deep/resource/path"),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			};

		// be friendly to V8
		assert.ok(oCache instanceof _Cache);
		assert.ok("sContext" in oCache);
		assert.strictEqual(oCache.sOriginalResourcePath, "deep/resource/path");
		assert.deepEqual(oCache.aElements, []);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.ok("$count" in oCache.aElements);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.strictEqual(oCache.aElements.$created, 0);
		assert.ok("$tail" in oCache.aElements);
		assert.strictEqual(oCache.iLimit, Infinity);
		assert.ok("oSyncPromiseAll" in oCache);
		assert.strictEqual(oCache.bServerDrivenPaging, false);

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees", sinon.match.same(oUnlockedCopy),
				/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
			.resolves(createResult(0, 7));

		// code under test
		return oCache.read(1, 0, Infinity, oGroupLock).then(function (oResult) {
			assert.deepEqual(oResult, createResult(1, 0, undefined, true));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, no existing data", function (assert) {
		var oCache = this.createCache("Employees"),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			};

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=10", sinon.match.same(oUnlockedCopy),
				/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
			.resolves(createResult(10, 7));
		this.mock(oCache).expects("fill")
			.withExactArgs(sinon.match.instanceOf(SyncPromise), 10, Infinity)
			.callsFake(function (oPromise) {
				oCache.aElements.$tail = oPromise;
				// Note: do not enlarge oCache.aElements! do not fill oPromise into it!
			});

		// code under test
		return oCache.read(10, Infinity, 0, oGroupLock).then(function (oResult) {
			assert.deepEqual(oResult, createResult(10, 7, undefined, true));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: infinite prefetch, existing data", function (assert) {
		var oCache = this.createCache("Employees"),
			that = this;

		return this.mockRequestAndRead(oCache, 0, "Employees", 0, 10).then(function (oResult) {
			var oReadGroupLock = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oUnlockedCopy = {
					getGroupId : function () { return "group"; }
				};

			assert.deepEqual(oResult, createResult(0, 10, undefined, true));

			that.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy);
			that.mock(oReadGroupLock).expects("unlock").withExactArgs();
			that.oRequestorMock.expects("request")
				.withExactArgs("GET", "Employees?$skip=10", sinon.match.same(oUnlockedCopy),
					/*mHeaders*/undefined, /*oPayload*/undefined, /*fnSubmit*/undefined)
				.resolves(createResult(10, 7));

			// code under test
			return oCache.read(7, 3, Infinity, oReadGroupLock).then(function (oResult) {
				assert.deepEqual(oResult, createResult(7, 3, undefined, true));
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

		oCache.aElements.$tail = new Promise(function (resolve) {
			fnResolve = resolve;
		});
		this.mock(ODataUtils).expects("_getReadIntervals").never(); // not yet
		this.mock(oCache).expects("requestElements").never(); // not yet

		// code under test
		oPromise = oCache.read(0, 10, 42, "group", fnDataRequested, "~bIndexIsSkip~");

		// expect "back to start" in order to repeat check for $tail
		this.mock(oCache).expects("read")
			.withExactArgs(0, 10, 42, "group", sinon.match.same(fnDataRequested), "~bIndexIsSkip~")
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
			bCreateOnDemand = "bCreateOnDemand",
			oGroupLock0 = {
				unlock : function () {}
			},
			oReadPromise
				= this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26"),
			that = this;

		that.mock(oGroupLock0).expects("unlock").withExactArgs();

		// This may only happen when the read is finished
		oCacheMock.expects("registerChangeListener").withExactArgs("('c')/key", "~oListener~");
		oCacheMock.expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key",
				sinon.match.same(oGroupLock0), bCreateOnDemand)
			.returns(SyncPromise.resolve("c"));

		return Promise.all([
			oReadPromise,

			// code under test
			oCache.fetchValue(oGroupLock0, "('c')/key", {}, "~oListener~", bCreateOnDemand)
				.then(function (sResult) {
					var oGroupLock1 = {
							unlock : function () {}
						};

					assert.strictEqual(sResult, "c");

					that.mock(oGroupLock1).expects("unlock").withExactArgs();
					oCacheMock.expects("registerChangeListener").withExactArgs("('c')/key", null);
					oCacheMock.expects("drillDown")
						.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key",
							sinon.match.same(oGroupLock1), false)
						.returns(SyncPromise.resolve("c"));

					// code under test: now it must be delivered synchronously
					assert.strictEqual(
						oCache.fetchValue(oGroupLock1, "('c')/key", null, null, false).getResult(),
						"c");
				})
		]);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue includes $tail", function (assert) {
		var oCache = this.createCache("Employees"),
			bCreateOnDemand = "bCreateOnDemand",
			oGroupLock = {unlock : function () {}},
			oResult,
			oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()),
			that = this;

		assert.strictEqual(oCache.oSyncPromiseAll, undefined);
		oCache.aElements.push("0");
		oCache.aElements.push("1");
		oCache.aElements.push("2");
		oCache.aElements.$tail = "$";
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(SyncPromise).expects("all")
			.withExactArgs(["0", "1", "2", "$"])
			.returns(oSyncPromiseAll);
		oSyncPromiseAll.then(function () {
			that.mock(oCache).expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key",
					sinon.match.same(oGroupLock), bCreateOnDemand)
				.returns(SyncPromise.resolve("c"));
		});

		// code under test
		oResult = oCache.fetchValue(oGroupLock, "('c')/key", null, null, bCreateOnDemand)
			.then(function (sResult) {
				assert.strictEqual(sResult, "c");
			});

		assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
		assert.strictEqual(oResult.isPending(), true);

		// code under test (simulate an error)
		oCache.fill(undefined, 0, 3);

		assert.strictEqual(oCache.oSyncPromiseAll, undefined);
		return oResult;
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue without $tail, undefined element", function (assert) {
		var oCache = this.createCache("Employees"),
			bCreateOnDemand = "bCreateOnDemand",
			oGroupLock = {unlock : function () {}},
			oResult,
			oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()),
			that = this;

		assert.strictEqual(oCache.oSyncPromiseAll, undefined);
		// Note: this may happen as a result of that.fill(undefined, ...);
		oCache.aElements.push(undefined);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(SyncPromise).expects("all")
			.withExactArgs(sinon.match.same(oCache.aElements))
			.returns(oSyncPromiseAll);
		oSyncPromiseAll.then(function () {
			that.mock(oCache).expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "0/key",
					sinon.match.same(oGroupLock), bCreateOnDemand)
				.returns(SyncPromise.resolve("c"));
		});

		// code under test
		oResult = oCache.fetchValue(oGroupLock, "0/key", null, null, bCreateOnDemand)
			.then(function (sResult) {
				assert.strictEqual(sResult, "c");
			});

		assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
		assert.strictEqual(oResult.isPending(), true);

		return oResult;
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#fetchValue without $tail, oSyncPromiseAll", function (assert) {
		var oCache = this.createCache("Employees"),
			bCreateOnDemand = "bCreateOnDemand",
			oGroupLock = {unlock : function () {}},
			oResult,
			oSyncPromiseAll = SyncPromise.resolve(Promise.resolve()),
			that = this;

		oCache.oSyncPromiseAll = oSyncPromiseAll;
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(SyncPromise).expects("all").never();
		oSyncPromiseAll.then(function () {
			that.mock(oCache).expects("drillDown")
				.withExactArgs(sinon.match.same(oCache.aElements), "('c')/key",
					sinon.match.same(oGroupLock), bCreateOnDemand)
				.returns(SyncPromise.resolve("c"));
		});

		// code under test
		oResult = oCache.fetchValue(oGroupLock, "('c')/key", null, null, bCreateOnDemand)
			.then(function (sResult) {
				assert.strictEqual(sResult, "c");
			});

		assert.strictEqual(oCache.oSyncPromiseAll, oSyncPromiseAll);
		assert.strictEqual(oResult.isPending(), true);

		return oResult;
	});

	//*********************************************************************************************
[{
	fnArrange : function (oCache) {
		oCache.aElements.$byPredicate["('c')"] = {};
	},
	oGroupLock : {unlock : function () {}},
	sPath : "('c')/note",
	sTitle : "CollectionCache#fetchValue sync via key predicate"
}, {
	fnArrange : function (oCache) {
		oCache.aElements.push({});
	},
	oGroupLock : {unlock : function () {}},
	sPath : "0/note",
	sTitle : "CollectionCache#fetchValue sync via index"
}, {
	fnArrange : function (oCache) {
		oCache.aElements.$count = 0;
	},
	oGroupLock : _GroupLock.$cached,
	sPath : "$count",
	sTitle : "CollectionCache#fetchValue sync via $count"
}].forEach(function (oFixture) {
	QUnit.test(oFixture.sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			bCreateOnDemand = "bCreateOnDemand",
			fnDataRequested = null,
			oGroupLock = oFixture.oGroupLock,
			sPath = oFixture.sPath;

		oFixture.fnArrange(oCache);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oCache).expects("registerChangeListener").withExactArgs(sPath, "~oListener~");
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oCache.aElements), sPath, sinon.match.same(oGroupLock),
				bCreateOnDemand)
			.returns(SyncPromise.resolve("Note 1"));
		this.mock(SyncPromise).expects("all").never();

		assert.strictEqual(
			// code under test
			oCache.fetchValue(oGroupLock, sPath, fnDataRequested, "~oListener~", bCreateOnDemand)
				.getResult(), "Note 1");
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read(-1, 1)", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		this.oRequestorMock.expects("request").never();

		// code under test
		assert.throws(function () {
			oCache.read(-1, 1, 0);
		}, new Error("Illegal index -1, must be >= 0"));
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
		reads : [
			{index : 10, length : 2, requests : [{skip : 10, top : 2}]},
			{index : 5, length : 2, requests : [{skip : 5, top : 2}]}
		]
	}, {
		title : "second range overlaps before",
		reads : [
			{index : 5, length : 4, requests : [{skip : 5, top : 4}]},
			{index : 3, length : 4, requests : [{skip : 3, top : 2}]}
		]
	}, {
		title : "same range",
		reads : [
			{index : 1, length : 2, requests : [{skip : 1, top : 2}]},
			{index : 1, length : 2, requests : []}
		]
	}, {
		title : "second range overlaps after",
		reads : [
			{index : 3, length : 4, requests : [{skip : 3, top : 4}]},
			{index : 5, length : 4, requests : [{skip : 7, top : 2}]}
		]
	}, {
		title : "second range completely behind",
		reads : [
			{index : 5, length : 2, requests : [{skip : 5, top : 2}]},
			{index : 10, length : 2, requests : [{skip : 10, top : 2}]}
		]
	}, {
		title : "second range part of first range",
		reads : [
			{index : 5, length : 8, requests : [{skip : 5, top : 8}]},
			{index : 7, length : 2, requests : []}
		]
	}, {
		title : "first range part of second range",
		reads : [
			{index : 7, length : 2, requests : [{skip : 7, top : 2}]},
			{index : 5, length : 6, requests : [{skip : 5, top : 2}, {skip : 9, top : 2}]}
		]
	}, {
		title : "read more than available",
		reads : [
			{index : 10, length : 90, requests : [{skip : 10, top : 90}]},
			{index : 0, length : 100, requests : [{skip : 0, top : 10}]}
		],
		expectedMaxElements : 26
	}, {
		title : "read exactly max available",
		reads : [
			{index : 0, length : 26, requests : [{skip : 0, top : 26}]},
			{index : 26, length : 26, requests : [{skip : 26, top : 26}]},
			{index : 26, length : 26, requests : []}
		],
		expectedMaxElements : 26
	}, {
		title : "different ranges",
		reads : [
			{index : 2, length : 5, requests : [{skip : 2, top : 5}]},
			{index : 0, length : 2, requests : [{skip : 0, top : 2}]},
			{index : 1, length : 2, requests : []}
		]
	}].forEach(function (oFixture) {
		function mockRequestsAndCallRead(oRead, oCache, fnDataRequested) {
			var oGroupLock = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oGroupLockMock = this.mock(oGroupLock),
				that = this;

			oRead.requests.forEach(function (oRequest, i) {
				var iSkip = oRequest.skip,
					iTop = oRequest.top,
					oUnlockedCopy = {
						getGroupId : function () { return "group"; }
					};

				oGroupLockMock.expects("getUnlockedCopy").withExactArgs()
					.returns(oUnlockedCopy);
				that.oRequestorMock.expects("request")
					.withExactArgs("GET", "Employees?$skip=" + iSkip + "&$top=" + iTop,
						sinon.match.same(oUnlockedCopy), /*mHeaders*/undefined,
						/*oPayload*/undefined,
						/*fnSubmit*/i < 1 ? sinon.match.same(fnDataRequested) : undefined)
					.resolves(createResult(iSkip, iTop));
			});
			oGroupLockMock.expects("unlock").withExactArgs();
			return oCache.read(oRead.index, oRead.length, 0, oGroupLock, fnDataRequested);
		}

		QUnit.test("CollectionCache: multiple read, " + oFixture.title + " (sequentially)",
				function (assert) {
			var sResourcePath = "Employees",
				oCache = this.createCache(sResourcePath),
				fnDataRequested = this.spy(),
				oPromise = Promise.resolve(),
				that = this;

			oFixture.reads.forEach(function (oRead) {
				oPromise = oPromise.then(function () {
					var oReadPromise = mockRequestsAndCallRead.call(that, oRead, oCache,
							fnDataRequested);

					return oReadPromise.then(function (oResult) {
						assert.deepEqual(oResult.value,
							createResult(oRead.index, oRead.length, undefined, true).value);
					});
				});
			});
			return oPromise.then(function () {
				assert.notOk(fnDataRequested.called); // the requestor should call this
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

			oFixture.reads.forEach(function (oRead) {
				aPromises.push(
					mockRequestsAndCallRead.call(that, oRead, oCache, fnDataRequested)
					.then(function (oResult) {
						assert.deepEqual(oResult.value,
							createResult(oRead.index, oRead.length, undefined, true).value);
				}));
			});
			return Promise.all(aPromises).then(function () {
				assert.notOk(fnDataRequested.called); // the requestor should call this
				assert.strictEqual(oCache.aElements.$count, oFixture.expectedMaxElements);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: parallel reads beyond length", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath);

		return Promise.all([
			this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 30).then(function (oResult) {
				var oExpectedResult = createResult(0, 26, undefined, true);

				oExpectedResult.value.$count = 26;
				assert.deepEqual(oResult, oExpectedResult);
				assert.strictEqual(oCache.aElements.$count, 26);
			}),
			this.mockRequestAndRead(oCache, 0, sResourcePath, 30, 1).then(function (oResult) {
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
			var oCache = this.createCache("Employees"),
				that = this;

			return this.mockRequestAndRead(oCache, 0, "Employees", 10, bCount ? 30 : 10)
				.then(function (oResult) {
					var oExpectedResult = createResult(10, bCount ? 16 : 10, undefined, true);

					assert.deepEqual(oResult, oExpectedResult);
					assert.strictEqual(oCache.aElements.$count, bCount ? 26 : undefined);

					return that.mockRequestAndRead(oCache, 0, "Employees", 5, 3, 0)
						.then(function (oResult) {
							var oExpectedResult = createResult(5, 0);

							assert.deepEqual(oResult, oExpectedResult);
							assert.strictEqual(oCache.aElements.$count, undefined);
						});
				});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bInactive) {
	QUnit.test("CollectionCache#read: $count & create, bInactive=" + bInactive, function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			fnCancelCallback = sinon.spy(),
			iCountAfterCreate = bInactive ? 26 : 27,
			oCountChangeListener = {onChange : function () {}},
			oCountChangeListenerMock = this.mock(oCountChangeListener),
			oGroupLock = {
				cancel : function () {},
				getGroupId : function () {},
				unlock : function () {}
			},
			oPostRequest,
			sTransientPredicate = "($uid=id-1-23)",
			that = this;

		return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26")
			.then(function (oResult) {
				assert.strictEqual(oCache.aElements.$count, 26);
				assert.strictEqual(oResult.value.$count, 26);
				assert.strictEqual(oCache.iActiveElements, 0);
				assert.strictEqual(oCache.iLimit, 26);

				that.mock(oGroupLock).expects("getGroupId").twice().withExactArgs()
					.returns(bInactive ? "$inactive.$auto" : "$direct");
				oPostRequest = that.oRequestorMock.expects("request")
					.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
						sinon.match.object, sinon.match.func, sinon.match.func, undefined,
						sResourcePath + sTransientPredicate)
					.callsArg(5) // fnSubmit
					.resolves({});
				oCountChangeListenerMock.expects("onChange").exactly(bInactive ? 0 : 1)
					.withExactArgs(iCountAfterCreate, undefined);
				oCache.registerChangeListener("$count", oCountChangeListener);

				return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "",
					sTransientPredicate, {}, false, null, function fnSubmitCallback() {},
					fnCancelCallback);
			})
			.then(function () {
				var oReadGroupLock = {
						getGroupId : function () { return "unrelated"; },
						unlock : function () {}
					};

				that.mock(oReadGroupLock).expects("unlock").twice().withExactArgs();
				assert.strictEqual(
					oCache.read(0, 10, 0, oReadGroupLock).getResult().value.$count,
					iCountAfterCreate);
				assert.strictEqual(oCache.aElements.$count, iCountAfterCreate);
				assert.strictEqual(oCache.iLimit, 26);
				assert.strictEqual(oCache.iActiveElements, bInactive ? 0 : 1);

				oCountChangeListenerMock.expects("onChange").exactly(bInactive ? 0 : 1)
					.withExactArgs(26, undefined)
					.callsFake(function () {
						assert.strictEqual(fnCancelCallback.callCount, 0, "not yet");
					});
				that.mock(oGroupLock).expects("cancel").withExactArgs()
					.callsFake(function () {
						assert.strictEqual(fnCancelCallback.callCount, 1);
					});

				// code under test - cancel the create
				oPostRequest.args[0][6]();

				assert.strictEqual(
					oCache.read(0, 10, 0, oReadGroupLock).getResult().value.$count,
					26);
				assert.strictEqual(oCache.aElements.$count, 26);
				assert.strictEqual(oCache.iLimit, 26);
				assert.strictEqual(oCache.iActiveElements, 0);
			});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bResetAndKeep) {
	[undefined, true, 1].forEach(function (bInactive) {
		var sTitle = "CollectionCache#create: cleanUp callback, bResetAndKeep=" + bResetAndKeep
			+ ", bInactive=" + bInactive;

	QUnit.test(sTitle, function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oGroupLock = {
				cancel : function () {},
				getGroupId : function () {}
			},
			oPostRequest,
			sTransientPredicate = "($uid=id-1-23)",
			that = this;

		return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26")
			.then(function () {
				that.mock(oGroupLock).expects("getGroupId")
					.exactly(bResetAndKeep && bInactive ? 1 : 2)
					.withExactArgs().returns("$inactive.$auto");
				oPostRequest = that.oRequestorMock.expects("request")
					.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
						sinon.match.object, sinon.match.func, sinon.match.func, undefined,
						sResourcePath + sTransientPredicate)
					.callsArg(5) // fnSubmit
					.resolves({});
				return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "",
					sTransientPredicate, {}, null, false, function fnSubmitCallback() {});
			})
			.then(function () {
				assert.strictEqual(oCache.aElements.length, 11);
				assert.strictEqual(oCache.aElements.$created, 1);

				oCache.aElements[0]["@$ui5.context.isInactive"] = bInactive;

				that.mock(_Helper).expects("cancelNestedCreates")
					.exactly(bResetAndKeep && bInactive ? 0 : 1)
					.withExactArgs(sinon.match.same(oCache.aElements[0]),
						"Deep create of Employees canceled; group: $inactive.$auto");
				that.mock(_Helper).expects("removeByPath")
					.withExactArgs(sinon.match.same(oCache.mPostRequests), "",
						sinon.match.same(oCache.aElements[0]))
					.exactly(bResetAndKeep && bInactive ? 0 : 1);
				that.mock(_Helper).expects("resetInactiveEntity")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners),
						sTransientPredicate, sinon.match.same(oCache.aElements[0]))
					.exactly(bResetAndKeep && bInactive === 1 ? 1 : 0);
				that.mock(oGroupLock).expects("cancel").withExactArgs()
					.exactly(bResetAndKeep && bInactive ? 0 : 1);

				// code under test - cleanUp callback
				// reset edited inactive, keep inactive untouched, delete all other
				assert.strictEqual(oPostRequest.args[0][6](bResetAndKeep),
					bResetAndKeep && bInactive ? true : undefined);

				assert.strictEqual(oCache.aElements.length, bResetAndKeep && bInactive ? 11 : 10);
				assert.strictEqual(oCache.aElements.$created, bResetAndKeep && bInactive ? 1 : 0);
			});
	});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & delete, top level", function (assert) {
		var oCache = this.createCache("Employees"),
			that = this;

		return this.mockRequestAndRead(oCache, 0, "Employees", 0, 5, 5, undefined, 26)
			.then(function () {
				var oDeleteGroupLock = {
						getGroupId : function () { return "group"; },
						getUnlockedCopy : function () {},
						unlock : function () {}
					};

				that.oRequestorMock.expects("request")
					.withArgs("DELETE", "Employees('42')", sinon.match.same(oDeleteGroupLock))
					.resolves();
				that.spy(_Helper, "setCount");
				return oCache._delete(oDeleteGroupLock, "Employees('42')", "3", null,
						function () {})
					.then(function () {
						var oReadGroupLock = {unlock : function () {}};

						that.mock(oReadGroupLock).expects("unlock").withExactArgs();
						assert.strictEqual(
							oCache.read(0, 4, 0, oReadGroupLock).getResult().value.$count, 25);
						sinon.assert.calledOnceWithExactly(_Helper.setCount,
							sinon.match.same(oCache.mChangeListeners), "",
							sinon.match.same(oCache.aElements), 25);
					});
			});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read: $count & delete, nested", function (assert) {
		var oCache = this.createCache("Employees"),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			aList = createResult(0, 3, undefined, true).value,
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			},
			that = this;

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
			.returns(oUnlockedCopy);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withArgs("GET", "Employees?$skip=0&$top=5", sinon.match.same(oUnlockedCopy))
			.resolves({
				value : [{
					list : aList,
					"list@odata.count" : "26"
				}]
			});

		return oCache.read(0, 5, 0, oGroupLock).then(function () {
			var oDeleteGroupLock = {
					getGroupId : function () { return "group"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				};

			that.oRequestorMock.expects("request")
				.withArgs("DELETE", "Employees('b')", sinon.match.same(oDeleteGroupLock))
				.resolves();
			that.spy(_Helper, "setCount");
			return oCache._delete(oDeleteGroupLock, "Employees('b')", "0/list/1", null,
					function () {})
				.then(function () {
					var oFetchValueGroupLock = {unlock : function () {}};

					that.mock(oFetchValueGroupLock).expects("unlock").withExactArgs();
					assert.strictEqual(
						oCache.fetchValue(oFetchValueGroupLock, "0/list").getResult().$count, 25);
					sinon.assert.calledOnceWithExactly(_Helper.setCount,
						sinon.match.same(oCache.mChangeListeners), "0/list",
						sinon.match.same(aList), 25);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: fetch $count before read is finished", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oGroupLock0 = {unlock : function () {}},
			oListener = {
				onChange : function () {
					assert.ok(false);
				}
			},
			that = this;

		this.mock(oGroupLock0).expects("unlock").withExactArgs();

		return Promise.all([
			this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 10, 10, undefined, "26"),

			// code under test: wait until request is finished, do not fire to listener
			oCache.fetchValue(oGroupLock0, "$count", undefined, oListener).then(function (iCount) {
				var oGroupLock1 = {unlock : function () {}};

				assert.strictEqual(iCount, 26);

				that.mock(oGroupLock1).expects("unlock").withExactArgs();

				// code under test: now it must be delivered synchronously
				assert.strictEqual(oCache.fetchValue(oGroupLock1, "$count").getResult(), 26);
			})
		]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bDropTransientElement) {
	[false, true].forEach(function (bMissingPredicate) {
		[undefined, "~mQueryOptions~"].forEach(function (mLateQueryOptions) {
			[false, true].forEach(function (bDeepCreate) {
			var sTitle = "_Cache#create: bMissingPredicate: " + bMissingPredicate
					+ ", bDropTransientElement: " + bDropTransientElement
				+ ", mLateQueryOptions: " + mLateQueryOptions
				+ ", bDeepCreate: " + bDeepCreate;

		if (bMissingPredicate && bDropTransientElement) {
			return;
		}

		QUnit.test(sTitle, function (assert) {
			var oCache = new _Cache(this.oRequestor, "TEAMS", {/*mQueryOptions*/}),
				oCacheMock = this.mock(oCache),
				oCancelNestedExpectation,
				aCollection = [],
				oCountChangeListener = {onChange : function () {}},
				oCreatePromise,
				oGroupLock = {getGroupId : function () {}},
				oHelperMock = this.mock(_Helper),
				oInitialData = {
					ID : "",
					Name : "John Doe"
				},
				sPathInCache = "('0')/TEAM_2_EMPLOYEES",
				oPostBody = {},
				sPostPath = "TEAMS('0')/TEAM_2_EMPLOYEES",
				oPostResult = {
					ID : "7",
					Name : "John Doe"
				},
				aSelectForPath = ["ID", "Name"],
				sPredicate = "('7')",
				sTransientPredicate = "($uid=id-1-23)",
				oTransientPromiseWrapper,
				mTypeForMetaPath = {},
				oUpdateNestedExpectation;

			oCache.fetchValue = function () {};
			oCache.mLateQueryOptions = mLateQueryOptions;
			aCollection.$count = 0;
			aCollection.$created = 0;
			oHelperMock.expects("clone").withExactArgs(sinon.match.same(oInitialData))
				.returns(oPostBody);
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "postBody",
					sinon.match.same(oPostBody))
				.callThrough();
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "transientPredicate",
					sTransientPredicate)
				.callThrough();
			oCacheMock.expects("getValue").withExactArgs(sPathInCache).returns(aCollection);
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "transient", "updateGroup")
				.callThrough();
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "transient",
					sinon.match.instanceOf(Promise))
				.callThrough();
			this.spy(_Helper, "addByPath");
			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock),
					null, sinon.match.same(oPostBody), /*fnSubmit*/sinon.match.func,
					/*fnCancel*/sinon.match.func, undefined, sPostPath + sTransientPredicate)
				.callsArg(5) // fnSubmit
				.resolves(oPostResult);
			this.mock(oCache).expects("fetchTypes").withExactArgs()
				.returns(SyncPromise.resolve(mTypeForMetaPath));
			this.mock(oCountChangeListener).expects("onChange");
			this.mock(oCache).expects("visitResponse")
				.withExactArgs(sinon.match.same(oPostResult), sinon.match.same(mTypeForMetaPath),
					"/TEAMS/TEAM_2_EMPLOYEES", sPathInCache + sTransientPredicate, undefined, true);
			// simulate a lack of key predicate => the transient predicate is kept
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(sinon.match.same(oPostResult), "predicate")
				.returns(bMissingPredicate ? undefined : sPredicate);
			if (!bMissingPredicate) {
				oHelperMock.expects("setPrivateAnnotation")
					.withExactArgs(sinon.match.same(oInitialData), "predicate", sPredicate);
				oHelperMock.expects("updateTransientPaths").exactly(bDropTransientElement ? 0 : 1)
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate,
						sPredicate)
					.callThrough();
			}

			oHelperMock.expects("getQueryOptionsForPath").exactly(bDeepCreate ? 0 : 1)
				.withExactArgs(sinon.match.same(mLateQueryOptions || oCache.mQueryOptions),
					sPathInCache)
				.returns({$select : aSelectForPath});
			oCancelNestedExpectation = oHelperMock.expects("cancelNestedCreates")
				.withExactArgs(sinon.match.same(oInitialData), "Deep create of " + sPostPath
					+ " succeeded. Do not use this promise.");
			oHelperMock.expects("getPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "select")
				.returns("~$select~");
			oUpdateNestedExpectation = oHelperMock.expects("updateNestedCreates")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners),
					sinon.match.same(oCache.mQueryOptions),
					sPathInCache + (bMissingPredicate ? sTransientPredicate : sPredicate),
					sinon.match.same(oInitialData), sinon.match.same(oPostResult),
					"~$select~")
				.returns(bDeepCreate);
			oHelperMock.expects("updateSelected")
				.withExactArgs(sinon.match.same(oCache.mChangeListeners),
					sPathInCache + (bMissingPredicate ? sTransientPredicate : sPredicate),
					sinon.match.same(oInitialData), sinon.match.same(oPostResult),
					bDeepCreate ? undefined : aSelectForPath, undefined, true)
				.callsFake(function () {
					assert.strictEqual(arguments[3]["@$ui5.context.isTransient"], false);
					arguments[2]["@$ui5.context.isTransient"] = false;
					if (!bMissingPredicate) {
						oInitialData["@$ui5._"].predicate = sPredicate;
					}
					oInitialData.ID = oPostResult.ID;
				});
			oHelperMock.expects("setPrivateAnnotation")
				.withExactArgs(sinon.match.same(oInitialData), "deepCreate", bDeepCreate)
				.callThrough();
			// count is already updated when creating the transient entity
			oCache.registerChangeListener(sPathInCache + "/$count", oCountChangeListener);

			// code under test
			oCreatePromise = oCache.create(oGroupLock, SyncPromise.resolve(sPostPath), sPathInCache,
				sTransientPredicate, oInitialData, null, false, function fnSubmitCallback() {});

			// initial data is synchronously available
			assert.strictEqual(aCollection[0], oInitialData);
			assert.strictEqual(aCollection.$byPredicate[sTransientPredicate], oInitialData);
			assert.strictEqual(aCollection.$count, 1);
			assert.strictEqual(aCollection.$created, 1);

			oTransientPromiseWrapper = SyncPromise.resolve(oInitialData["@$ui5._"].transient);
			assert.ok(oTransientPromiseWrapper.isPending()); // of course...

			// request is added to mPostRequests
			assert.ok(_Helper.addByPath.calledTwice);
			sinon.assert.calledWithExactly(_Helper.addByPath.firstCall,
				{"('0')/TEAM_2_EMPLOYEES/$count" : [oCountChangeListener]},
				"('0')/TEAM_2_EMPLOYEES/$count", sinon.match.same(oCountChangeListener));
			sinon.assert.calledWithExactly(_Helper.addByPath.secondCall,
				sinon.match.same(oCache.mPostRequests), sPathInCache,
				sinon.match.same(oInitialData));

			oCache.registerChangeListener(sPathInCache + sTransientPredicate + "/Name", {
				onChange : function () {
					assert.ok(false, "No change event for Name");
				}
			});

			if (bDropTransientElement) { // side-effects refresh might drop transient element
				delete aCollection.$byPredicate[sTransientPredicate];
			}

			this.spy(_Helper, "removeByPath");
			return oCreatePromise.then(function (oEntityData) {
				var oExpectedPrivateAnnotation = {};

				assert.strictEqual(oTransientPromiseWrapper.getResult(), true);
				if (!bMissingPredicate) {
					oExpectedPrivateAnnotation.predicate = sPredicate;
				}
				oExpectedPrivateAnnotation.transientPredicate = sTransientPredicate;
				oExpectedPrivateAnnotation.deepCreate = bDeepCreate;
				assert.deepEqual(oEntityData, {
					"@$ui5._" : oExpectedPrivateAnnotation,
					"@$ui5.context.isTransient" : false,
					ID : "7",
					Name : "John Doe"
				});
				assert.strictEqual(aCollection[0].ID, "7", "from Server");
				assert.strictEqual(aCollection.$count, 1);
				assert.deepEqual(aSelectForPath, ["ID", "Name"], "$select unchanged");
				if (bDropTransientElement) {
					assert.notOk(sPredicate in aCollection.$byPredicate);
					assert.notOk(sTransientPredicate in aCollection.$byPredicate);
				} else {
					assert.strictEqual(aCollection.$byPredicate[sTransientPredicate],
						oInitialData, "still need access via transient predicate");
					if (!bMissingPredicate) {
						assert.strictEqual(aCollection.$byPredicate[sPredicate],
							oInitialData);
					}
				}
				sinon.assert.calledOnceWithExactly(_Helper.removeByPath,
					sinon.match.same(oCache.mPostRequests), sPathInCache,
					sinon.match.same(oInitialData));
				assert.ok(oCancelNestedExpectation.calledBefore(oUpdateNestedExpectation));
			});
		});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#create: with given sPath and delete before submit", function (assert) {
		var // real requestor to avoid reimplementing callback handling of _Requestor.request
			oRequestor = _Requestor.create("/~/", {
				getGroupProperty : defaultGetGroupProperty,
				onCreateGroup : function () {}
			}),
			oCache = new _Cache(oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache),
			aCollection = [],
			oCreatePromise,
			fnDeleteCallback = this.spy(),
			oEntity0 = {},
			oEntity1 = {},
			oEntityData,
			oGroupLock = {
				cancel : function () {},
				getGroupId : function () {},
				getSerialNumber : function () {},
				isCanceled : function () { return false; },
				unlock : function () {}
			},
			sPathInCache = "('0')/TEAM_2_EMPLOYEES",
			oPostPathPromise = SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES"),
			sTransientPredicate = "($uid=id-1-23)";

		aCollection.$byPredicate = {};
		aCollection.$created = 0;
		oCache.iActiveElements = 0;
		oCache.fetchValue = function () {};
		oCacheMock.expects("getValue").withExactArgs(sPathInCache).returns(aCollection);
		oCacheMock.expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
		this.mock(oGroupLock).expects("getGroupId")
			.thrice() // twice by _Cache#create and once by _Requestor#request
			.withExactArgs().returns("updateGroup");
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);
		this.spy(_Helper, "addByPath");
		this.spy(oRequestor, "request");
		oCacheMock.expects("adjustIndexes")
			.withExactArgs("('0')/TEAM_2_EMPLOYEES", sinon.match.same(aCollection), 0, 1, 0, true);

		// code under test
		oCreatePromise = oCache.create(oGroupLock, oPostPathPromise, sPathInCache,
			sTransientPredicate, oEntity0);

		assert.strictEqual(aCollection.$created, 1);
		assert.strictEqual(oCache.iActiveElements, 0); // since we create in a nested collection
		sinon.assert.calledOnceWithExactly(oRequestor.request, "POST",
			"TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock), null,
			/*oPayload*/sinon.match.object, /*fnSubmit*/sinon.match.func,
			/*fnCancel*/sinon.match.func, undefined,
			"TEAMS('0')/TEAM_2_EMPLOYEES" + sTransientPredicate);
		oEntityData = aCollection[0];
		// request is added to mPostRequests
		sinon.assert.calledOnceWithExactly(_Helper.addByPath,
			sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityData));

		// simulate a second create
		aCollection.unshift(oEntity1);
		aCollection.$created += 1;

		this.spy(_Helper, "removeByPath");
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), sPathInCache)
			.returns(SyncPromise.resolve(aCollection));
		this.mock(oGroupLock).expects("cancel").withExactArgs();
		aCollection.$count = 42;
		oCacheMock.expects("adjustIndexes")
			.withExactArgs("('0')/TEAM_2_EMPLOYEES", sinon.match.same(aCollection), 1, -1);

		// code under test
		oCache._delete(null, "TEAMS('0')/TEAM_2_EMPLOYEES",
			sPathInCache + "/1", //TODO sPathInCache + sTransientPredicate
			null, false, fnDeleteCallback);

		assert.strictEqual(aCollection.$count, 41);
		assert.strictEqual(aCollection.$created, 1);
		assert.strictEqual(aCollection[0], oEntity1);
		sinon.assert.calledOnceWithExactly(_Helper.removeByPath,
			sinon.match.same(oCache.mPostRequests), sPathInCache, sinon.match.same(oEntityData));
		return oCreatePromise.then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError.canceled, true);
			assert.strictEqual(oCache.iActiveElements, 0);
		});
	});

	//*********************************************************************************************
[
	{first : true},
	{first : false, atEnd : false},
	{first : false, atEnd : true}
].forEach(function (oFixture) {
	QUnit.test("_Cache#create: nested create, " + JSON.stringify(oFixture), function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS", {/*mQueryOptions*/}),
			oCacheMock = this.mock(oCache),
			aCollection = oFixture.first ? [] : [{}],
			iCount = aCollection.length,
			oCreatePromise,
			oInitialData = {},
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oHelperMock = this.mock(_Helper),
			aPostBodyCollection = _Helper.clone(aCollection);

		oCache.fetchValue = function () {};
		aCollection.$count = iCount;
		aCollection.$created = iCount;
		aCollection.$postBodyCollection = oFixture.first ? function () {} : aPostBodyCollection;
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(oInitialData))
			.returns("~oPostBody~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "postBody",
				sinon.match.same("~oPostBody~"));
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "transientPredicate",
				"($uid='1')");
		oCacheMock.expects("getValue").withExactArgs("($uid='0')/TEAM_2_EMPLOYEES")
			.returns(aCollection);
		oHelperMock.expects("addToCount")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "($uid='0')/TEAM_2_EMPLOYEES",
				sinon.match.same(aCollection), 1);
		if (oFixture.first) {
			this.mock(aCollection).expects("$postBodyCollection").withExactArgs()
				.callsFake(function () {
					aCollection.$postBodyCollection = aPostBodyCollection;
				});
		}
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "transient", "updateGroup");
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		oHelperMock.expects("addPromise")
			.withExactArgs(sinon.match.same(oInitialData))
			.returns("~oDeepCreatePromise~");

		// code under test
		oCreatePromise = oCache.create(oGroupLock, SyncPromise.resolve("EMPLOYEES"),
			"($uid='0')/TEAM_2_EMPLOYEES", "($uid='1')", oInitialData, oFixture.atEnd, null,
			function fnSubmitCallback() {});

		assert.strictEqual(oCreatePromise, "~oDeepCreatePromise~");
		assert.strictEqual(aCollection.length, iCount + 1);
		assert.strictEqual(aCollection.$created, iCount + 1);
		assert.strictEqual(aCollection[oFixture.atEnd ? 1 : 0], oInitialData);
		assert.strictEqual(oInitialData["@$ui5.context.isTransient"], true);
		assert.strictEqual(aCollection.$byPredicate["($uid='1')"], oInitialData);
		assert.strictEqual(aPostBodyCollection.length, iCount + 1);
		assert.deepEqual(aPostBodyCollection[oFixture.atEnd ? 1 : 0], "~oPostBody~");
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#create: $metadata fails", function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			aCollection = [],
			oCreatePromise,
			oEntityData = {},
			oError = new Error("This call intentionally failed"),
			fnErrorCallback = this.spy(),
			oGroupLock = {
				getGroupId : function () { return "updateGroup"; }
			},
			oPostPathPromise = SyncPromise.resolve("TEAMS('0')/TEAM_2_EMPLOYEES");

		aCollection.$created = 0;
		this.mock(oCache).expects("getValue").withExactArgs("('0')/TEAM_2_EMPLOYEES")
			.returns(aCollection);
		this.mock(oCache).expects("fetchTypes").twice().withExactArgs()
			.returns(SyncPromise.reject(oError));
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("POST", "TEAMS('0')/TEAM_2_EMPLOYEES", sinon.match.same(oGroupLock),
				null, /*oPayload*/sinon.match.object, /*fnSubmit*/sinon.match.func,
				/*fnCancel*/sinon.match.func, undefined,
				"TEAMS('0')/TEAM_2_EMPLOYEES($uid=id-1-23)");
		this.mock(oCache).expects("addPendingRequest").never();
		this.mock(oCache).expects("removePendingRequest").never();

		// code under test
		oCreatePromise = oCache.create(oGroupLock, oPostPathPromise, "('0')/TEAM_2_EMPLOYEES",
			"($uid=id-1-23)", oEntityData, false, fnErrorCallback);

		assert.deepEqual(aCollection, [{
			"@$ui5._" : {
				postBody : {},
				transient : "updateGroup",
				transientPredicate : "($uid=id-1-23)"
			},
			"@$ui5.context.isTransient" : true
		}]);
		assert.strictEqual(aCollection.$created, 1);
		sinon.assert.calledOnceWithExactly(fnErrorCallback, sinon.match.same(oError));

		return oCreatePromise.then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	[undefined, {}].forEach(function (oCacheData, i) {
		QUnit.test("_Cache#create: allowed for collections only - " + i, function (assert) {
			var oCache = new _Cache(this.oRequestor, "TEAMS"),
				oGroupLock = {getGroupId : function () {}},
				sPathInCache = "0/TEAM_2_MANAGER",
				sTransientPredicate = "($uid=id-1-23)";

			this.mock(oCache).expects("getValue").withExactArgs("0/TEAM_2_MANAGER")
				.returns(oCacheData);

			// code under test
			assert.throws(function () {
				oCache.create(oGroupLock, "TEAMS('01')/TEAM_2_MANAGER",
					sPathInCache, sTransientPredicate, {});
			}, new Error("Create is only supported for collections; '" + sPathInCache
				+ "' does not reference a collection"));
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: query params", function () {
		var oCache,
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			mQueryOptions = {},
			sQueryParams = "?query",
			sResourcePath = "Employees",
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			};

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, false)
			.returns(sQueryParams);

		oCache = this.createCache(sResourcePath, mQueryOptions);

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + sQueryParams + "&$skip=0&$top=5",
				sinon.match.same(oUnlockedCopy), undefined, undefined, undefined)
			.resolves({value : []});

		// code under test
		mQueryOptions.$select = "foo"; // modification must not affect cache
		return oCache.read(0, 5, 0, oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: error handling", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oError = {},
			oGroupLock0 = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oSuccess = createResult(0, 5),
			oUnlockedCopy0 = {
				getGroupId : function () { return "group"; }
			},
			that = this;

		this.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy0);
		this.mock(oGroupLock0).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5",
				sinon.match.same(oUnlockedCopy0), undefined, undefined, undefined)
			.rejects(oError);
		this.spy(oCache, "fill");

		// code under test
		return oCache.read(0, 5, 0, oGroupLock0).catch(function (oResult1) {
			var oGroupLock1 = {
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oUnlockedCopy1 = {
					getGroupId : function () { return "group"; }
				};

			assert.strictEqual(oResult1, oError);
			assert.ok(oCache.fill.calledTwice);
			sinon.assert.calledWithExactly(oCache.fill.firstCall,
				sinon.match.instanceOf(SyncPromise), 0, 5);
			sinon.assert.calledWithExactly(oCache.fill.secondCall, undefined, 0, 5);

			that.mock(oGroupLock1).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy1);
			that.mock(oGroupLock1).expects("unlock").withExactArgs();
			that.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?$skip=0&$top=5",
					sinon.match.same(oUnlockedCopy1), undefined, undefined, undefined)
				.resolves(oSuccess);

			// code under test
			return oCache.read(0, 5, 0, oGroupLock1).then(function (oResult2) {
				assert.deepEqual(oResult2, oSuccess);
			});
		});
	});

	//*********************************************************************************************
	//TODO move to _Cache!
	QUnit.test("CollectionCache: create entity and has pending changes", function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oCacheMock = this.mock(oCache),
			oEntityData = {name : "John Doe"},
			oGroupLock = {getGroupId : function () {}},
			oHelperMock = this.mock(_Helper),
			oPatchPromise1,
			oPatchPromise2,
			oPostResult = {},
			oPostPromise,
			oReadGroupLock = {
				getGroupId : function () { return "unrelated"; },
				unlock : function () {}
			},
			oReadPromise,
			sTransientPredicate = "($uid=id-1-23)",
			mTypeForMetaPath = {},
			oUpdateGroupLock0 = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oUpdateGroupLock1 = {getGroupId : function () {}};

		function isPostBody(oCandidate) {
			return _Helper.getPrivateAnnotation(oCache.aElements[0], "postBody") === oCandidate;
		}

		oCacheMock.expects("addPendingRequest").never();
		oCacheMock.expects("removePendingRequest").never();
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), true)
			.returns("?foo=bar");
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees?foo=bar", sinon.match.same(oGroupLock), null,
				sinon.match(isPostBody), sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			.callsFake(function () {
				var fnSubmit = arguments[5];

				return Promise.resolve().then(function () {
					var oAddPendingRequestExpectation
							= oCacheMock.expects("addPendingRequest").withExactArgs();

					// code under test
					fnSubmit();

					assert.ok(oAddPendingRequestExpectation.called);
				}).then(function () {
					oCacheMock.expects("removePendingRequest").withExactArgs();

					return oPostResult;
				});
			});

		// code under test
		oPostPromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "",
			sTransientPredicate, oEntityData, null, false, function fnSubmitCallback() {
			});

		assert.strictEqual(oCache.hasPendingChangesForPath(""), true, "pending changes for root");
		assert.strictEqual(oCache.hasPendingChangesForPath("foo"), false,
			"pending changes for non-root");

		assert.deepEqual(oCache.aElements[0], {
			name : "John Doe",
			"@$ui5._" : {
				postBody : {name : "John Doe"},
				transient : "updateGroup",
				transientPredicate : sTransientPredicate
			},
			"@$ui5.context.isTransient" : true
		});

		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate,
				sinon.match.same(oCache.aElements[0]), {bar : "baz"});
		oHelperMock.expects("updateAll")
			.withExactArgs({}, sTransientPredicate, sinon.match(isPostBody), {bar : "baz"});
		// called from the POST's success handler
		oHelperMock.expects("getQueryOptionsForPath")
			.withExactArgs(sinon.match.same(oCache.mQueryOptions), "")
			.returns({});
		oCacheMock.expects("visitResponse")
			.withExactArgs(sinon.match.same(oPostResult), sinon.match.same(mTypeForMetaPath),
				"/Employees", sTransientPredicate, undefined, true);
		oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate,
				sinon.match.same(oCache.aElements[0]), sinon.match.same(oPostResult), undefined,
				undefined, true);
		oHelperMock.expects("cancelNestedCreates")
			.withExactArgs(sinon.match.same(oCache.aElements[0]),
				"Deep create of Employees?foo=bar succeeded. Do not use this promise.");
		oHelperMock.expects("updateNestedCreates")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners),
				sinon.match.same(oCache.mQueryOptions), sTransientPredicate,
				sinon.match.same(oCache.aElements[0]), sinon.match.same(oPostResult), undefined);
		// The lock must be unlocked although no request is created
		this.mock(oUpdateGroupLock0).expects("unlock").withExactArgs();
		this.mock(oUpdateGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");

		// code under test
		oPatchPromise1 = oCache.update(oUpdateGroupLock0, "bar", "baz", this.spy(), "n/a",
			sTransientPredicate);

		this.mock(oUpdateGroupLock1).expects("getGroupId").withExactArgs().returns("anotherGroup");

		// code under test
		oPatchPromise2 = oCache.update(oUpdateGroupLock1, "bar", "qux", this.spy(), "n/a",
			sTransientPredicate);

		this.mock(oReadGroupLock).expects("unlock").withExactArgs();

		oReadPromise = oCache.read(0, 1, 0, oReadGroupLock);

		return Promise.all([
			oPatchPromise1.then(), // check that update returned a promise
			oPatchPromise2.then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, "The entity will be created via group "
					+ "'updateGroup'. Cannot patch via group 'anotherGroup'");
			}),
			oPostPromise.then(function () {
				assert.notOk(_Helper.hasPrivateAnnotation(oCache.aElements[0], "transient"));
				assert.strictEqual(oCache.hasPendingChangesForPath(""), false,
					"no more pending changes");
			}),
			oReadPromise.then(function (oResult) {
				assert.notOk("@odata.count" in oResult);
			})
		]);
	});

	//*********************************************************************************************
	//TODO move to _Cache!
	QUnit.test("CollectionCache: pending create forces update/_delete to fail", function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oCallbacks = {
				fnError : function () {},
				fnSubmit : function () {}
			},
			oCallbacksMock = this.mock(oCallbacks),
			oCreateGroupLock0 = {getGroupId : function () {}},
			oCreatePromise,
			oError = new Error(),
			oFailedPostPromise,
			oFetchTypesPromise = SyncPromise.resolve(Promise.resolve({
				"/Employees" : {
					$Key : ["ID"],
					ID : {
						$Type : "Edm.String"
					}
				}
			})),
			fnRejectPost,
			oRequestExpectation1,
			oRequestExpectation2,
			fnResolvePost,
			sTransientPredicate = "($uid=id-1-23)",
			that = this;

		function checkUpdateAndDeleteFailure() {
			var oDeleteGroupLock = {},
				oUpdateGroupLock = {getGroupId : function () {}};

			that.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs()
				.returns("updateGroup");

			// code under test
			oCache.update(oUpdateGroupLock, "foo", "baz", that.spy(), "n/a", sTransientPredicate)
				.then(function () {
					assert.ok(false, "unexpected success - update");
				}, function (oError) {
					assert.strictEqual(oError.message,
						"No 'update' allowed while waiting for server response",
						oError.message);
				});
			oCache._delete(oDeleteGroupLock, "n/a", /*TODO sTransientPredicate*/"0")
				.then(function () {
					assert.ok(false, "unexpected success - _delete");
				}, function (oError) {
					assert.strictEqual(oError.message,
						"No 'delete' allowed while waiting for server response",
						oError.message);
				});
		}

		function checkUpdateSuccess(sWhen) {
			var oUpdateGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				};

			that.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs()
				.returns("updateGroup");
			that.mock(oUpdateGroupLock).expects("unlock").withExactArgs();

			// code under test
			return oCache.update(oUpdateGroupLock, "foo", sWhen, that.spy(), "Employees",
					sTransientPredicate)
				.then(function () {
					assert.ok(true, "Update works " + sWhen);
					assert.strictEqual(
						_Helper.getPrivateAnnotation(oCache.aElements[0], "transient"),
						"updateGroup");
				});
		}

		oCallbacksMock.expects("fnError").never();
		oCallbacksMock.expects("fnSubmit").never();
		this.mock(this.oRequestor).expects("buildQueryString").twice()
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), true)
			.returns("?sap-client=111");
		this.mock(oCreateGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
		oRequestExpectation1 = this.oRequestorMock.expects("request");
		oRequestExpectation1.withExactArgs("POST", "Employees?sap-client=111",
				sinon.match.same(oCreateGroupLock0), null, sinon.match.object,
				sinon.match.func, sinon.match.func, undefined, "Employees" + sTransientPredicate)
			// Note: fnSubmit - see below
			.returns(oFailedPostPromise = new Promise(function (_resolve, reject) {
				fnRejectPost = reject;
			}));
		this.mock(oCache).expects("fetchTypes")
			.exactly(2 /*create*/ + 1 /*update*/ + 1 /*catch handler*/)
			.withExactArgs()
			.returns(oFetchTypesPromise);

		oCreatePromise = oCache.create(oCreateGroupLock0, SyncPromise.resolve("Employees"), "",
			sTransientPredicate, {}, false, oCallbacks.fnError, oCallbacks.fnSubmit);

		checkUpdateSuccess("before submitBatch").then(function () {
			var oCreateGroupLock1 = {getGroupId : function () {}};

			that.oRequestorMock.expects("lockGroup")
				.withExactArgs("updateGroup", sinon.match.same(oCache), true, true)
				.returns(oCreateGroupLock1);
			oRequestExpectation2 = that.oRequestorMock.expects("request");
			// immediately add the POST request again into queue
			oRequestExpectation2.withExactArgs("POST", "Employees?sap-client=111",
					sinon.match.same(oCreateGroupLock1), null, sinon.match.object, sinon.match.func,
					sinon.match.func, undefined, "Employees" + sTransientPredicate)
				// Note: fnSubmit - see below
				.returns(new Promise(function (resolve) {
						fnResolvePost = resolve;
					}));

			oCallbacksMock.expects("fnSubmit").withExactArgs();
			// simulate a submitBatch...
			oRequestExpectation1.args[0][5]();

			checkUpdateAndDeleteFailure();

			oCallbacksMock.expects("fnError").withExactArgs(sinon.match.same(oError));
			// ... leading to a failed POST
			fnRejectPost(oError);
			SyncPromise.all([
				oFailedPostPromise,
				oFetchTypesPromise
			]).then(undefined, function () {
				checkUpdateSuccess("with restarted POST").then(function () {
					oCallbacksMock.expects("fnSubmit").withExactArgs();
					// simulate a submitBatch leading to a successful POST
					oRequestExpectation2.args[0][5]();

					checkUpdateAndDeleteFailure();

					fnResolvePost({ID : "42"}); // this will resolve oCreatePromise, too
				});
			});
		});

		return oCreatePromise.then(function () {
			var oEntity = oCache.fetchValue(_GroupLock.$cached, sTransientPredicate).getResult(),
				oGroupLock = {getGroupId : function () {}};

			that.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", "Employees('42')?sap-client=111",
					sinon.match.same(oGroupLock), {"If-Match" : sinon.match.same(oEntity)},
					{foo : "baz2"}, sinon.match.func, sinon.match.func, undefined,
					"Employees('42')", undefined, undefined, undefined, sinon.match.func)
				.resolves({});

			// code under test
			return oCache.update(oGroupLock, "foo", "baz2", that.spy(), "Employees('42')",
				"('42')");
		});
	});

	//*********************************************************************************************
	//TODO move to _Cache!
	[
		{createGroupId : "$direct"},
		{createGroupId : "$auto"},
		{createGroupId : "myAuto"},
		{createGroupId : "myDirect"},
		{createGroupId : "$inactive.$auto", updateGroupId : "$auto",
			parkedGroupId : "$parked.$auto"}
	].forEach(function (oFixture) {
		// createGroupId is used in the group lock of the create()
		// updateGroupId is the corresponding ID for POSTs and PATCHes (default is createGroupId)
		// parkedGroupId is used when parking the request (default is "$parked." + updategroupId)
		QUnit.test("CollectionCache#create: relocate on failed POST for " + oFixture.createGroupId,
				function (assert) {
			var oCache = this.createCache("Employees"),
				oCreateGroupLock = {getGroupId : function () {}},
				oFailedPostPromise = SyncPromise.reject(new Error()),
				oFetchTypesPromise = SyncPromise.resolve({}),
				sParkedGroupId = oFixture.parkedGroupId || "$parked." + oFixture.createGroupId,
				oParkedGroupLock = {getGroupId : function () {}},
				mGroups = {
					$direct : "Direct",
					$auto : "Auto",
					myAuto : "Auto",
					myDirect : "Direct"
				},
				sTransientPredicate = "($uid=id-1-23)",
				sUpdateGroupId = oFixture.updateGroupId || oFixture.createGroupId,
				that = this;

			this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs()
				.returns(oFixture.createGroupId);
			this.mock(oCache).expects("fetchTypes")
				.exactly(2 /*create*/ + 1 /*catch handler*/)
				.returns(oFetchTypesPromise);
			this.oRequestorMock.expects("getGroupSubmitMode")
				.withExactArgs(sUpdateGroupId).returns(mGroups[sUpdateGroupId]);

			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null,
					sinon.match.object, sinon.match.func, sinon.match.func, undefined,
					"Employees" + sTransientPredicate)
				.callsArg(5) // fnSubmit
				.returns(oFailedPostPromise);

			this.oRequestorMock.expects("lockGroup")
				.withExactArgs(sParkedGroupId, sinon.match.same(oCache), true, true)
				.returns(oParkedGroupLock);
			this.oRequestorMock.expects("request")
				.withExactArgs("POST", "Employees", sinon.match.same(oParkedGroupLock), null,
					sinon.match.object, sinon.match.func, sinon.match.func, undefined,
					"Employees" + sTransientPredicate)
				.callsFake(function () {
					var fnSubmit = arguments[5];

					return Promise.resolve().then(function () {
						fnSubmit();
					}).then(function () {
						return {Name : "John Doe", Age : 47};
					});
				});

			// code under test
			oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "",
				sTransientPredicate, {Name : null}, false, function fnErrorCallback() {},
				function fnSubmitCallback() {});

			return oFailedPostPromise.then(undefined, function () {
				var oGroupLock0 = {getGroupId : function () {}},
					oGroupLock1 = {
						getGroupId : function () {},
						unlock : function () {}
					},
					oGroupLock2 = {
						getGroupId : function () {},
						unlock : function () {}
					},
					oPostBody = _Helper.getPrivateAnnotation(oCache.aElements[0], "postBody"),
					aPromises = [],
					sWrongGroupId = sUpdateGroupId === "$direct" ? "$auto" : "$direct";

				that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns(sWrongGroupId);
				// code under test - try to update via wrong $direct/auto group
				aPromises.push(oCache.update(oGroupLock0, "Name", "John Doe", that.spy(), "n/a",
						sTransientPredicate)
					.then(undefined, function (oError) {
						assert.strictEqual(oError.message, "The entity will be created via group '"
							+ sUpdateGroupId + "'. Cannot patch via group '" + sWrongGroupId + "'");
					}));

				that.mock(oGroupLock1).expects("getGroupId").withExactArgs()
					.returns(sUpdateGroupId);
				that.mock(oGroupLock1).expects("unlock").withExactArgs();
				that.oRequestorMock.expects("relocate")
					.withExactArgs(sParkedGroupId, sinon.match.same(oPostBody), sUpdateGroupId);

				if (oFixture.createGroupId === "$inactive.$auto") {
					oCache.setInactive(sTransientPredicate, false); // activate
				}
				// code under test - first update -> relocate
				aPromises.push(oCache.update(oGroupLock1, "Name", "John Doe", that.spy(), "n/a",
					sTransientPredicate));

				that.mock(oGroupLock2).expects("getGroupId").withExactArgs()
					.returns(sUpdateGroupId);
				that.mock(oGroupLock2).expects("unlock").withExactArgs();

				// code under test - second update -> do not relocate again
				aPromises.push(oCache.update(oGroupLock2, "Name", "John Doe1", that.spy(), "n/a",
					sTransientPredicate));

				return Promise.all(aPromises);
			});
		});
	});

	//*********************************************************************************************
	//TODO move to _Cache!
[false, true].forEach(function (bInactive) {
	[false, true].forEach(function (bAtEndOfCreated) {
		var sTitle = "CollectionCache: create entity without initial data, bInactive="
			+ bInactive + ", bAtEndOfCreated=" + bAtEndOfCreated;

	QUnit.test(sTitle, function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees"),
			oCountChangeListener = {onChange : function () {}},
			oCreateGroupLock = {getGroupId : function () {}},
			oHelperMock = this.mock(_Helper),
			oPromise,
			oResponseData = {},
			sTransientPredicate = "($uid=id-1-23)",
			oUpdateGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			};

		oCache.aElements.$count = 42;

		if (bAtEndOfCreated) {
			oCache.aElements.$created = 1;
			oCache.aElements.push({/*created*/});
			oCache.aElements.push({/*read*/});
		}
		this.mock(oCreateGroupLock).expects("getGroupId").withExactArgs()
			.returns(bInactive ? "$inactive.updateGroup" : "updateGroup");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			.callsFake(function () {
				var fnSubmit = arguments[5];

				return Promise.resolve().then(function () {
					fnSubmit();
				}).then(function () {
					return oResponseData;
				});
			});

		// code under test
		oPromise = oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "",
			sTransientPredicate, {}, bAtEndOfCreated, null, function fnSubmitCallback() {});

		if (bInactive) {
			assert.deepEqual(oCache.aElements[bAtEndOfCreated ? 1 : 0], {
				"@$ui5._" : {
					initialData : {},
					postBody : {},
					transient : "$inactive.updateGroup",
					transientPredicate : sTransientPredicate
				},
				"@$ui5.context.isInactive" : true,
				"@$ui5.context.isTransient" : true
			});
			assert.strictEqual(oCache.iActiveElements, 0);
		} else {
			assert.deepEqual(oCache.aElements[bAtEndOfCreated ? 1 : 0], {
				"@$ui5._" : {
					postBody : {},
					transient : "updateGroup",
					transientPredicate : sTransientPredicate
				},
				"@$ui5.context.isTransient" : true
			});
			assert.strictEqual(oCache.iActiveElements, 1);
		}

		this.mock(oUpdateGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
		oHelperMock.expects("updateAll")
			.withExactArgs({}, sTransientPredicate, sinon.match.object, {Name : "foo"});
		oCache.registerChangeListener("$count", oCountChangeListener);
		oHelperMock.expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate,
				sinon.match.same(oCache.aElements[bAtEndOfCreated ? 1 : 0]), {Name : "foo"})
			.callThrough();
		oHelperMock.expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), sTransientPredicate,
				sinon.match.same(oCache.aElements[bAtEndOfCreated ? 1 : 0]),
				sinon.match.same(oResponseData), undefined, undefined, true);
		oHelperMock.expects("updateNestedCreates")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners),
				sinon.match.same(oCache.mQueryOptions), sTransientPredicate,
				sinon.match.same(oCache.aElements[bAtEndOfCreated ? 1 : 0]),
				sinon.match.same(oResponseData), undefined);
		this.mock(oUpdateGroupLock).expects("unlock").withExactArgs();

		// code under test
		oCache.update(oUpdateGroupLock, "Name", "foo", this.spy(), undefined, sTransientPredicate);

		assert.strictEqual(oCache.aElements[bAtEndOfCreated ? 1 : 0]["@$ui5._"].transient,
			bInactive ? "$inactive.updateGroup" : "updateGroup");
		assert.strictEqual(
			_Helper.hasPrivateAnnotation(oCache.aElements[bAtEndOfCreated ? 1 : 0],
				"initialData"), bInactive);
		assert.strictEqual(
			oCache.aElements[bAtEndOfCreated ? 1 : 0]["@$ui5.context.isInactive"],
			bInactive ? true : undefined, "isInactive");
		assert.strictEqual(oCache.iActiveElements, bInactive ? 0 : 1);

		return oPromise;
	});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create inactive entity with initial data", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees"),
			oCanceledError = new Error(),
			oCreateGroupLock = {getGroupId : function () {}},
			oHelperMock = this.mock(_Helper),
			oInitialData = {foo : "bar"},
			sTransientPredicate = "($uid=id-1-23)";

		oCanceledError.canceled = true;

		this.mock(oCreateGroupLock).expects("getGroupId")
			.withExactArgs().returns("$inactive.updateGroup");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "postBody",
				sinon.match(oInitialData));
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "transientPredicate",
				sTransientPredicate);
		oHelperMock.expects("publicClone")
			.withExactArgs(sinon.match.same(oInitialData), true).returns("~oInitialData~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs({"@$ui5.context.isTransient" : true, foo : "bar"}, "initialData",
				"~oInitialData~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oInitialData), "transient",
				"$inactive.updateGroup");

		// rejecting the promise to make the test easier / skip irrelevant parts
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oCreateGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			.rejects(oCanceledError);

		// code under test
		oCache.create(oCreateGroupLock, SyncPromise.resolve("Employees"), "",
				sTransientPredicate, oInitialData)
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, oCanceledError);
			});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create entity, canceled", function (assert) {
		var oCache = this.createCache("Employees"),
			oCanceledError = new Error(),
			oGroupLock = {
				cancel : function () {},
				getGroupId : function () {}
			},
			sTransientPredicate = "($uid=id-1-23)";

		oCanceledError.canceled = true;

		this.mock(oGroupLock).expects("getGroupId").twice().withExactArgs().returns("updateGroup");
		this.mock(oGroupLock).expects("cancel").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			.callsArg(6) // fnCancel
			.rejects(oCanceledError);

		// code under test
		return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate,
			{}).then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, oCanceledError);
				assert.strictEqual(oCache.aElements.length, 0);
			});
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasEntityData) {
	var sTitle = "CollectionCache: creation fails, removePendingRequest called=" + bHasEntityData;

	QUnit.test(sTitle, function (assert) {
		var mQueryOptions = {},
			oCache = this.createCache("Employees", mQueryOptions),
			oCallbacks = {
				errorCallback : function () {},
				submitCallback : function () {}
			},
			oCallbacksMock = this.mock(oCallbacks),
			oCanceledError = new Error(),
			aCollection = [],
			oEntityData = {},
			oGroupLock = {getGroupId : function () {}},
			oHelperMock = this.mock(_Helper),
			oPostBody = {},
			oPostError = new Error(),
			oRetryExpectation,
			oRetryGroupLock = {getGroupId : function () {}},
			sTransientPredicate = "($uid=id-1-23)",
			oTransientPromiseWrapper,
			that = this;

		oCallbacksMock.expects("errorCallback").never();
		oCallbacksMock.expects("submitCallback").never();
		oCanceledError.canceled = true;
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(oEntityData))
			.returns(oPostBody);
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntityData), "postBody", sinon.match.same(oPostBody))
			.callThrough();
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oEntityData), "transientPredicate", sTransientPredicate)
			.callThrough();
		this.mock(oCache).expects("getValue").withExactArgs("").returns(aCollection);
		this.mock(oCache).expects("adjustIndexes")
			.withExactArgs("", sinon.match.same(aCollection), 0, 1, 0, true);
		this.mock(this.oRequestor).expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), true)
			.returns("?sap-client=111");
		oHelperMock.expects("setPrivateAnnotation").twice()
			.withExactArgs(sinon.match.same(oEntityData), "transient", "updateGroup")
			.callThrough();
		oHelperMock.expects("addByPath").twice()
			.withExactArgs(sinon.match.same(oCache.mPostRequests), "",
				sinon.match.same(oEntityData));
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oGroupLock),
				null, sinon.match.same(oPostBody), sinon.match.func, sinon.match.func,
				undefined, "Employees" + sTransientPredicate)
			.callsFake(function () {
				var fnSubmit = arguments[5];

				return Promise.resolve().then(function () {
						var oAddPendingRequestExpectation = that.mock(oCache)
								.expects("addPendingRequest").withExactArgs(),
							oSubmitCallbackExpectation
								= oCallbacksMock.expects("submitCallback").withExactArgs();

						oHelperMock.expects("setPrivateAnnotation")
							.withExactArgs(sinon.match.same(oEntityData), "transient",
								sinon.match.instanceOf(Promise))
							.callThrough();

						// code under test
						fnSubmit();

						assert.ok(oAddPendingRequestExpectation.called);
						assert.ok(oSubmitCallbackExpectation.called);
						oTransientPromiseWrapper
							= SyncPromise.resolve(oEntityData["@$ui5._"].transient);
						assert.ok(oTransientPromiseWrapper.isPending()); // of course...
					}).then(function () {
						var oRemovePendingRequestExpectation
							= that.mock(oCache).expects("removePendingRequest").withExactArgs();

						oCallbacksMock.expects("errorCallback")
							.withExactArgs(sinon.match.same(oPostError))
							.callsFake(function () {
								assert.ok(oRemovePendingRequestExpectation.called);
								assert.ok(oRetryExpectation.called);
							});

						throw oPostError;
					});
			});

		this.oRequestorMock.expects("lockGroup")
			.withExactArgs("updateGroup", sinon.match.same(oCache), true, true)
			.returns(oRetryGroupLock);
		// Note: fnCancel() would be called in this case, but we don't care here
		oRetryExpectation = this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees?sap-client=111", sinon.match.same(oRetryGroupLock),
				null, sinon.match.same(oPostBody), sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			.rejects(oCanceledError); // avoid endless loop
		this.mock(oCache).expects("fetchTypes").thrice().withExactArgs()
			.returns(SyncPromise.resolve({}));

		// code under test
		return oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate,
				oEntityData, false, oCallbacks.errorCallback, oCallbacks.submitCallback)
			.then(function () {
				assert.ok(false, "Unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, oCanceledError);
				assert.strictEqual(oTransientPromiseWrapper.getResult(), undefined);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache: read w/ transient context; wait for prefetch", function (assert) {
		var oCache = this.createCache("Employees"),
			oEntityData = {name : "John Doe"},
			oGroupLock = {getGroupId : function () {}},
			oReadGroupLock = {
				getGroupId : function () { return "unrelated"; },
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oReadResult = {value : [{}, {}]},
			sTransientPredicate = "($uid=id-1-23)",
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			},
			that = this;

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("updateGroup");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Employees", sinon.match.same(oGroupLock), null,
				sinon.match.object, sinon.match.func, sinon.match.func, undefined,
				"Employees" + sTransientPredicate)
			// Note: do not call fnSubmit() here, the context should remain transient!
			.returns(new Promise(function () {})); // never resolve
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees?$skip=0&$top=2", sinon.match.same(oUnlockedCopy),
				undefined, undefined, undefined)
			.resolves(oReadResult);

		oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "", sTransientPredicate,
			oEntityData);

		this.mock(oReadGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oReadGroupLock).expects("unlock").withExactArgs();

		// code under test
		return oCache.read(0, 1, 2, oReadGroupLock).then(function (oResult) {
			var oGroupLock0 = {
					getGroupId : function () { return "unrelated"; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				},
				oGroupLock1 = {unlock : function () {}};

			assert.strictEqual(oResult.value.length, 1);
			assert.ok(_Helper.getPrivateAnnotation(oResult.value[0], "transient"));
			assert.strictEqual(oResult.value[0].name, "John Doe");

			that.mock(oGroupLock0).expects("getUnlockedCopy").withExactArgs()
				.returns(oUnlockedCopy);
			that.mock(oGroupLock0).expects("unlock").withExactArgs();
			that.mock(oCache).expects("requestElements")
				.withExactArgs(3, 13, sinon.match.same(oUnlockedCopy), 0, undefined);

			// code under test
			return oCache.read(0, 3, 10, oGroupLock0).then(function (oResult) {
				assert.strictEqual(oResult.value.length, 3);
				assert.ok(_Helper.getPrivateAnnotation(oResult.value[0], "transient"));
				assert.strictEqual(oResult.value[0].name, "John Doe");
				assert.strictEqual(oResult.value[1], oReadResult.value[0]);
				assert.strictEqual(oResult.value[2], oReadResult.value[1]);

				that.mock(oGroupLock1).expects("unlock").withExactArgs();

				// code under test
				assert.strictEqual(
					oCache.fetchValue(oGroupLock1, sTransientPredicate + "/name").getResult(),
					"John Doe");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: create and delete transient entry", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/", {
				getGroupProperty : defaultGetGroupProperty,
				onCreateGroup : function () {}
			}),
			oCache = _Cache.create(oRequestor, "Employees"),
			oCreatePromise,
			oDeletePromise,
			oGroupLock = {
				cancel : function () {},
				getGroupId : function () {},
				getSerialNumber : function () {},
				isCanceled : function () { return false; },
				unlock : function () {}
			},
			oTransientElement,
			sTransientPredicate = "($uid=id-1-23)";

		this.spy(oRequestor, "request");
		this.mock(oCache).expects("fetchTypes").withExactArgs().returns(SyncPromise.resolve({}));
		this.mock(oGroupLock).expects("getGroupId")
			.thrice() // twice by _Cache#create and once by _Requestor#request
			.withExactArgs().returns("updateGroup");
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);

		// code under test
		oCreatePromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "",
			sTransientPredicate, {})
			.catch(function (oError) {
				assert.ok(oError.canceled);
			});

		assert.strictEqual(oCache.aElements.length, 1);
		oTransientElement = oCache.aElements[0];

		sinon.assert.calledOnceWithExactly(oRequestor.request, "POST", "Employees",
			sinon.match.same(oGroupLock), null, sinon.match.object, sinon.match.func,
			sinon.match.func, undefined, "Employees" + sTransientPredicate);
		this.spy(oRequestor, "removePost");
		this.mock(oGroupLock).expects("cancel").withExactArgs();

		// code under test
		oDeletePromise = oCache._delete(null, "n/a",
			/*TODO sTransientPredicate*/"0", null, false, function () {
				throw new Error();
			});

		sinon.assert.calledOnceWithExactly(oRequestor.removePost, "updateGroup",
			sinon.match(function (oParameter) {
				return oParameter === oTransientElement;
			}));
		assert.strictEqual(oCache.aElements.length, 0);
		assert.notOk(sTransientPredicate in oCache.aElements.$byPredicate);

		// wait for the promises to see potential asynchronous errors
		return Promise.all([oCreatePromise, oDeletePromise]);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache: delete created entity", function (assert) {
		// real requestor to avoid reimplementing callback handling of _Requestor.request
		var oRequestor = _Requestor.create("/~/", {
				getGroupProperty : defaultGetGroupProperty,
				getMessagesByPath : function () { return []; },
				onCreateGroup : function () {},
				updateMessages : function () {}
			}),
			oCache = _Cache.create(oRequestor, "Employees"),
			fnCallback = this.spy(),
			oCreatedPromise,
			oEntity = {EmployeeId : "4711", "@odata.etag" : "anyEtag"},
			sGroupId = "updateGroup",
			oGroupLock = {
				getGroupId : function () {},
				getSerialNumber : function () {},
				isCanceled : function () { return false; },
				unlock : function () {}
			},
			sTransientPredicate = "($uid=id-1-23)",
			mTypeForMetaPath = {
				"/Employees" : {
					$Key : ["EmployeeId"],
					EmployeeId : {
						$Type : "Edm.String"
					}
				}
			},
			that = this;

		this.mock(oGroupLock).expects("getGroupId")
			.twice() // once by _Cache#create and once by _Requestor#request
			.withExactArgs().returns(sGroupId);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oGroupLock).expects("getSerialNumber").withExactArgs().returns(42);
		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));

		oCreatedPromise = oCache.create(oGroupLock, SyncPromise.resolve("Employees"), "",
			sTransientPredicate, {}, null, false, function fnSubmitCallback() {});

		assert.strictEqual(oCache.aElements.$created, 1);

		// simulate submitBatch
		oRequestor.mBatchQueue[sGroupId][0][0].$submit();
		oRequestor.mBatchQueue[sGroupId][0][0].$resolve(oEntity);

		return oCreatedPromise.then(function () {
			var sEditUrl = "/~/Employees('4711')",
				oCacheData = oCache.fetchValue(_GroupLock.$cached, sTransientPredicate).getResult(),
				oDeleteGroupLock = {
					getGroupId : function () { return sGroupId; },
					getUnlockedCopy : function () {},
					unlock : function () {}
				};

			that.mock(oRequestor.oModelInterface).expects("getMessagesByPath")
				.withExactArgs("/Employees('4711')", true).returns("~aMessages~");
			that.mock(oRequestor.oModelInterface).expects("updateMessages")
				.withExactArgs("~aMessages~");
			that.mock(oRequestor).expects("request")
				.withExactArgs("DELETE", sEditUrl, sinon.match.same(oDeleteGroupLock),
					{"If-Match" : sinon.match.same(oCacheData)},
					undefined, undefined, sinon.match.func, undefined, "Employees('4711')")
				.returns(Promise.resolve());

			// code under test
			return oCache._delete(oDeleteGroupLock, sEditUrl, /*TODO sTransientPredicate*/"0",
					null, fnCallback)
				.then(function () {
					sinon.assert.calledOnceWithExactly(fnCallback, 0, -1);
					assert.strictEqual(oCache.aElements.length, 0);
					assert.strictEqual(oCache.aElements.$created, 0);
					assert.notOk("('4711')" in oCache.aElements.$byPredicate, "predicate gone");
					assert.notOk(sTransientPredicate in oCache.aElements.$byPredicate,
						"transient predicate gone");
			});
		});
	});

	//*********************************************************************************************
	[{ // no visible rows: discard everything except transient created element
		sExpectedKeys : "@",
		iExpectedLength : 1,
		iLength : 0,
		iStart : 4,
		bTransientElement : true,
		aValues : []
	}, { // no visible rows, but kept-alive entities
		sExpectedKeys : "", // aElements remains empty
		iExpectedLength : 0,
		sFilter : "key eq 'a6' or key eq 'a7'",
		aKeptAliveKeys : ["g", "h"],
		iLength : 0,
		iStart : 24,
		aValues : [{key : "g"}, {key : "h"}]
	}, { // only transient created element is visible: no GET
		sExpectedKeys : "@",
		iExpectedLength : 1,
		iLength : 1,
		iStart : 0,
		bTransientElement : true,
		aValues : []
	}, { // a single visible row (transient created element is kept)
		sExpectedKeys : "@a",
		iExpectedLength : 2,
		sFilter : "key eq 'a0'",
		iLength : 1,
		iStart : 1,
		bTransientElement : true,
		aValues : [{key : "a"}]
	}, { // a single visible row, but not at top
		sExpectedKeys : "...d",
		iExpectedLength : 4,
		sFilter : "key eq 'a3'",
		iLength : 1,
		iStart : 3,
		aValues : [{key : "d"}]
	}, { // multiple visible rows including a transient created element which is not part of GET
		sExpectedKeys : "@a",
		iExpectedLength : 2,
		sFilter : "key eq 'a0'",
		iLength : 2,
		iStart : 0,
		bTransientElement : true,
		aValues : [{key : "a"}]
	}, { // multiple visible rows
		sExpectedKeys : "ab",
		iExpectedLength : 2,
		sFilter : "key eq 'a0' or key eq 'a1'",
		iLength : 2,
		iStart : 0,
		aValues : [{key : "a"}, {key : "b"}]
	}, { // multiple visible rows, but not at top; unexpected order of response
		sExpectedKeys : "...de",
		iExpectedLength : 5,
		sFilter : "key eq 'a3' or key eq 'a4'",
		iLength : 2,
		iStart : 3,
		aValues : [{key : "e"}, {key : "d"}]
	}, { // short read and kept-alive entities
		sExpectedKeys : "........................yz",
		iExpectedLength : 26,
		sFilter : "key eq 'a24' or key eq 'a25' or key eq 'a6' or key eq 'a7'",
		aKeptAliveKeys : ["g", "h"],
		iLength : 40,
		iStart : 24,
		aValues : [{key : "y"}, {key : "z"}, {key : "g"}, {key : "h"}]
	}, { // single row, requestSideEffects on element from server
		sExpectedKeys : "abcdefghij",
		iExpectedLength : 10,
		sFilter : "key eq 'a1'",
		iLength : undefined,
		iStart : 1,
		aValues : [{key : "b"}]
	}].forEach(function (oFixture, iFixtureIndex) {
		QUnit.test("CollectionCache#requestSideEffects, " + iFixtureIndex, function (assert) {
			var oCreatedElement, // undefined or transient
				iLength = oFixture.iLength,
				iStart = oFixture.iStart,
				// read at least 10, at most 26
				iFillLength = Math.min(Math.max(iLength || 0, 10), 26),
				iFillStart = iStart < 10 ? 0 : iStart, // some old values due to previous paging
				iReceivedLength = oFixture.aValues.length,
				sResourcePath = "TEAMS('42')/Foo",
				oCache = this.createCache(sResourcePath),
				oCacheMock = this.mock(oCache),
				that = this,
				i;

			//TODO this.fetchValue(_GroupLock.$cached, "").then(...) would be needed in _Cache in
			// case we do not wait for read() to finish here!
			// Note: fill cache with more than just "visible" rows
			return this.mockRequestAndRead(oCache, 0, sResourcePath, iFillStart, iFillLength,
					iFillLength, undefined, "26")
				.then(function () {
					var iExpectedByPredicateLength,
						oGroupLock = {},
						oHelperMock = that.mock(_Helper),
						mMergedQueryOptions = {
							$apply : "A.P.P.L.E.", // must be kept
							$count : true, // dropped
							$expand : {expand : null},
							$filter : "filter", // is replaced completely
							$orderby : "orderby", // dropped
							$search : "search", // dropped
							$select : ["Name"],
							foo : "bar",
							"sap-client" : "123"
						},
						aPaths = ["ROOM_ID"],
						sPredicate,
						aPredicates,
						mQueryOptions = {},
						mQueryOptions0 = {
							$apply : "A.P.P.L.E.",
							$expand : {expand : null},
							$filter : oFixture.sFilter,
							$select : ["Name"],
							foo : "baz",
							"sap-client" : "123"
						},
						mQueryOptions1 = {
							$apply : "A.P.P.L.E.",
							$expand : "~",
							$filter : oFixture.sFilter,
							$select : "~",
							foo : "baz",
							"sap-client" : "123"
						},
						sTransientPredicate = "($uid=id-1-23)",
						oResult = {value : oFixture.aValues},
						bSingle = iLength === undefined,
						oTransient = {
							"@$ui5._" : {
								transient : "group",
								transientPredicate : sTransientPredicate
							},
							key : "@"
						},
						mTypeForMetaPath = {
							"/TEAMS/Foo" : {}
						};

					function getKeyFilter(oInstance) {
						return "key eq 'a" + aTestData.indexOf(oInstance.key) + "'";
					}

					aTestData[-1] = "@"; // predecessor of "A"
					aPredicates = aTestData.map(function (sKey) { return "('" + sKey + "')"; });
					if (oFixture.bTransientElement) { // add transient element
						oCreatedElement = oTransient;
						aPredicates.unshift("('@')");
						oCache.aElements.unshift(oCreatedElement);
						oCache.aElements.$created = 1;
						oCache.aElements.$byPredicate[sTransientPredicate] = oCreatedElement;
					} else {
						oCache.aElements.$created = 0;
					}
					aPredicates = aPredicates.slice(iStart, iStart + (bSingle ? 1 : iLength));
					if (oFixture.bTransientElement && iStart === 0) {
						aPredicates.shift(); // transient element not requested from binding
					}
					(oFixture.aKeptAliveKeys || []).forEach(function (sKey) {
						var sPredicate = "('" + sKey + "')";

						oCache.aElements.$byPredicate[sPredicate] = {key : sKey};
						aPredicates.push(sPredicate);
					});
					iExpectedByPredicateLength = iLength === undefined
						? Object.keys(oCache.aElements.$byPredicate).length
						: iReceivedLength + (oCreatedElement ? 1 : 0);
					oCacheMock.expects("checkSharedRequest").withExactArgs();
					that.mock(Object).expects("assign")
						.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
							sinon.match.same(oCache.mLateQueryOptions))
						.returns(mQueryOptions);
					that.mock(_Helper).expects("intersectQueryOptions")
						.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
							sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata),
							"/TEAMS/Foo", "", "~bWithMessages~")
						.returns(mMergedQueryOptions);
					oCache.beforeRequestSideEffects = function () {};
					oCacheMock.expects("beforeRequestSideEffects")
						.withExactArgs(sinon.match.same(mMergedQueryOptions))
						.callsFake(function (mQueryOptions2) {
							mQueryOptions2.foo = "baz";
						});
					oCacheMock.expects("keepOnlyGivenElements").exactly(bSingle ? 0 : 1)
						.withExactArgs(aPredicates).callThrough(); // too hard to refactor :-(
					// Note: fetchTypes() would have been invoked by read() already
					oCacheMock.expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
					oCache.beforeUpdateSelected = function () {};
					for (i = 0; i < iReceivedLength; i += 1) { // prepare request/response
						sPredicate = "('" + oFixture.aValues[i].key + "')";
						oHelperMock.expects("getKeyFilter").withExactArgs(
								sinon.match.same(oCache.aElements.$byPredicate[sPredicate]),
								"/TEAMS/Foo", sinon.match.same(mTypeForMetaPath))
							.callsFake(getKeyFilter);
						oCacheMock.expects("beforeUpdateSelected")
							.withExactArgs(sPredicate, sinon.match.same(oFixture.aValues[i]));
						oHelperMock.expects("updateSelected")
							.withExactArgs(sinon.match.same(oCache.mChangeListeners), sPredicate,
								sinon.match.same(oCache.aElements.$byPredicate[sPredicate]),
								sinon.match.same(oFixture.aValues[i]), sinon.match.same(aPaths),
								sinon.match.func);
					}
					if (iReceivedLength > 0) { // expect a GET iff. there is s.th. to do
						if (oFixture.aValues.length > 1) {
							mQueryOptions0.$top = mQueryOptions1.$top = oFixture.aValues.length;
						}
						that.mock(_Helper).expects("extractMergeableQueryOptions")
							.withExactArgs(mQueryOptions0).callThrough();
						that.mock(that.oRequestor).expects("buildQueryString")
							.withExactArgs("/TEAMS/Foo", mQueryOptions1, false, true)
							.returns("?bar");
						that.oRequestorMock.expects("request").withExactArgs("GET",
								"TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock), undefined,
								undefined, undefined, undefined, oCache.sMetaPath, undefined, false,
								{
									$expand : {expand : null},
									$select : ["Name"]
								}, sinon.match.same(oCache), sinon.match.func)
							.resolves(oResult);
						oCacheMock.expects("visitResponse").withExactArgs(
								sinon.match.same(oResult), sinon.match.same(mTypeForMetaPath),
								undefined, "", NaN, true)
							.callsFake(function () {
								for (i = 0; i < iReceivedLength; i += 1) {
									_Helper.setPrivateAnnotation(oFixture.aValues[i], "predicate",
										"('" + oFixture.aValues[i].key + "')");
								}
							});
					}

					// code under test
					return oCache.requestSideEffects(oGroupLock, aPaths, aPredicates, bSingle,
							"~bWithMessages~")
						.then(function () {
							var oElement,
								sKeys = "",
								i;

							if (oCreatedElement) {
								// transient elements are neither discarded nor updated
								assert.strictEqual(oCache.aElements.$created, 1);
								assert.strictEqual(oCache.aElements[0], oCreatedElement);
								assert.strictEqual(
									oCache.aElements.$byPredicate[sTransientPredicate],
									oCreatedElement);
								assert.strictEqual(oCache.aElements.$byPredicate["('@')"],
									undefined);
							} else {
								assert.strictEqual(oCache.aElements.$created, 0);
							}
							// compute condensed representation of all keys, "." is a gap
							for (i = 0; i < oCache.aElements.length; i += 1) {
								sKeys += oCache.aElements[i] && oCache.aElements[i].key || ".";
							}
							assert.strictEqual(sKeys, oFixture.sExpectedKeys);
							assert.strictEqual(oCache.aElements.length, oFixture.iExpectedLength,
								"length");
							assert.strictEqual(oCache.aElements.$count, 26, "$count is preserved");
							assert.strictEqual(Object.keys(oCache.aElements.$byPredicate).length,
								iExpectedByPredicateLength, "$byPredicate up-to-date");
							for (i = 0; i < oCache.aElements.length; i += 1) {
								oElement = oCache.aElements[i];
								if (oElement && oElement !== oTransient) {
									assert.strictEqual(
										oCache.aElements.$byPredicate[
											_Helper.getPrivateAnnotation(oElement, "predicate")],
										oElement);
								}
							}
						});
				});
		});
	});

	//*********************************************************************************************
[null, {}].forEach(function (mLateQueryOptions, i) {
	QUnit.test("CollectionCache#requestSideEffects: nothing to do #" + i, function (assert) {
		var mByPredicate = { // some dummy content
				"($uid=id-1-23)" : -1,
				"('@')" : -1,
				"('a')" : 0,
				"('b')" : 1
			},
			sByPredicateJSON = JSON.stringify(mByPredicate),
			aElements = [{
				"@$ui5._" : {
					predicate : "('@')",
					transientPredicate : "($uid=id-1-23)"
				},
				key : "@"
			}, {
				"@$ui5._" : {
					predicate : "('a')"
				},
				key : "a"
			}, {
				"@$ui5._" : {
					predicate : "('b')"
				},
				key : "b"
			}],
			sElementsJSON = JSON.stringify(aElements),
			aPaths = [],
			oPromise,
			mQueryOptions = {},
			sResourcePath = "TEAMS('42')/Foo",
			oCache = this.createCache(sResourcePath);

		// cache preparation
		oCache.aElements = aElements;
		oCache.aElements.$created = 1;
		oCache.aElements.$byPredicate = mByPredicate;
		oCache.mLateQueryOptions = mLateQueryOptions;

		this.mock(oCache).expects("getTypes").withExactArgs().returns({});
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
				sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
				"/TEAMS/Foo", "", undefined)
			.returns(null); // "nothing to do"
		oCache.beforeRequestSideEffects = function () {
			throw new Error("Do not call!");
		};
		this.mock(oCache).expects("keepOnlyGivenElements").never();
		this.mock(_Helper).expects("getKeyFilter").never();
		this.mock(_Helper).expects("selectKeyProperties").never();
		this.oRequestorMock.expects("buildQueryString").never();
		this.oRequestorMock.expects("request").never();

		// code under test
		oPromise = oCache.requestSideEffects(null, aPaths, 0, 1);

		assert.ok(oPromise instanceof SyncPromise);
		assert.strictEqual(oPromise.getResult(), undefined);
		assert.strictEqual(JSON.stringify(oCache.aElements), sElementsJSON);
		assert.strictEqual(oCache.aElements.$created, 1);
		assert.strictEqual(JSON.stringify(oCache.aElements.$byPredicate), sByPredicateJSON);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#requestSideEffects: no data to update", function (assert) {
		var sResourcePath = "TEAMS('42')/Foo",
			oCache = this.createCache(sResourcePath),
			that = this;

		// Note: fill cache with more than just "visible" rows
		return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 4, 4, undefined, "26")
			.then(function () {
				that.mock(oCache).expects("getTypes").withExactArgs().returns({});
				that.mock(_Helper).expects("intersectQueryOptions").returns({/*don't care*/});
				that.mock(oCache).expects("keepOnlyGivenElements").withExactArgs([])
					.returns([]);
				that.mock(_Helper).expects("getKeyFilter").never();
				that.mock(_Helper).expects("selectKeyProperties").never();
				that.oRequestorMock.expects("buildQueryString").never();
				that.oRequestorMock.expects("request").never();

				// code under test
				assert.strictEqual(oCache.requestSideEffects(null, null, [], false),
					SyncPromise.resolve());

				assert.strictEqual(oCache.aElements.$count, 26, "$count is preserved");
			});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#keepOnlyGivenElements: no data left", function (assert) {
		var sResourcePath = "TEAMS('42')/Foo",
			oCache = this.createCache(sResourcePath),
			oCacheMock = this.mock(oCache);

		// Note: fill cache with more than just "visible" rows
		return this.mockRequestAndRead(oCache, 0, sResourcePath, 1, 4, 4, undefined, "26")
			.then(function () {
				oCache.aElements[0] = undefined; // can result from a failed requestElements
				oCacheMock.expects("drop").withExactArgs(1, "('b')");
				oCacheMock.expects("drop").withExactArgs(2, "('c')");
				oCacheMock.expects("drop").withExactArgs(3, "('d')");
				oCacheMock.expects("drop").withExactArgs(4, "('e')");

				// code under test
				assert.deepEqual(oCache.keepOnlyGivenElements([]), []);

				assert.deepEqual(oCache.aElements, [], "all elements discarded");
				assert.strictEqual(oCache.aElements.$count, 26, "$count is preserved");
			});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#move", function (assert) {
		const oCache = this.createCache("n/a");

		const aElements = oCache.aElements = ["a", "b", "c", "d", "e", "f", "g", "h"];

		function deepEqual(aExpected) {
			assert.strictEqual(oCache.aElements, aElements, "same ref");
			assert.deepEqual(oCache.aElements, aExpected);
		}

		// code under test (nothing to do)
		oCache.move(4, 4, 3);

		deepEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);

		// code under test (nothing to do)
		oCache.move(1, 4, 0);

		deepEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);

		// code under test
		oCache.move(1, 4, 3);

		deepEqual(["a", "e", "f", "g", /**/"b", "c", "d"/**/, "h"]);

		// code under test (undo)
		oCache.move(4, 1, 3);

		deepEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);

		// code under test
		oCache.move(1, 5, 2);

		deepEqual(["a", "d", "e", "f", "g", /**/"b", "c"/**/, "h"]);

		// code under test (undo)
		oCache.move(5, 1, 2);

		deepEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);

		// code under test
		oCache.move(1, 3, 4);

		deepEqual(["a", "f", "g", /**/"b", "c", "d", "e"/**/, "h"]);

		// code under test (undo)
		oCache.move(3, 1, 4);

		deepEqual(["a", "b", "c", "d", "e", "f", "g", "h"]);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#move: no RangeError", function (assert) {
		const oCache = this.createCache("n/a");

		for (let i = 0; i < 1_000_000; i += 1) {
			oCache.aElements[i] = i;
		}

		// code under test (no "RangeError: Maximum call stack size exceeded")
		oCache.move(5_000, 10_000, 990_000);

		for (let i = 0; i < 5_000; i += 1) {
			if (oCache.aElements[i] !== i) {
				assert.ok(false);
				break;
			}
		}
		for (let i = 0; i < 990_000; i += 1) {
			if (oCache.aElements[10_000 + i] !== 5_000 + i) {
				assert.ok(false);
				break;
			}
		}
		for (let i = 0; i < 5_000; i += 1) {
			if (oCache.aElements[5_000 + i] !== 995_000 + i) {
				assert.ok(false);
				break;
			}
		}

		// code under test (undo)
		oCache.move(10_000, 5_000, 990_000);

		for (let i = 0; i < 1_000_000; i += 1) {
			if (oCache.aElements[i] !== i) {
				assert.ok(false);
				break;
			}
		}
	});

	//*********************************************************************************************
[
	{error : false, path : "EMPLOYEE_2_TEAM"},
	{error : false, path : "EMPLOYEE_2_TEAM/TEAM_2_MANAGER"},
	{error : true, path : "EMPLOYEE_2_EQUIPMENT"} // key predicate must not change here
].forEach(function (oFixture, i) {
	QUnit.test("CollectionCache#requestSideEffects: key property change #" + i, function (assert) {
		var oError = new Error(),
			oGroupLock = {},
			oHelperMock = this.mock(_Helper),
			mMergeableQueryOptions = {},
			mMergedQueryOptions = {},
			oNewValue = {
				"@$ui5._" : {predicate : "('c')"},
				Bar : {
					"@$ui5._" : {predicate : "(3)"}
				}
			},
			aPaths = ["n/a", "EMPLOYEE_2_TEAM", "EMPLOYEE"],
			mQueryOptions = {},
			sResourcePath = "TEAMS('42')/Foo",
			oCache = this.createCache(sResourcePath),
			that = this;

		// Note: fill cache with more than just "visible" rows
		return this.mockRequestAndRead(oCache, 0, sResourcePath, 0, 4, 4, undefined, "26")
			.then(function () {
				var mTypeForMetaPath = {};

				oCache.aElements[2].Bar = {
					"@$ui5._" : {predicate : "(2)"}
				};
				that.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
				that.mock(Object).expects("assign")
					.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
						sinon.match.same(oCache.mLateQueryOptions))
					.returns(mQueryOptions);
				oHelperMock.expects("intersectQueryOptions")
					.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
						sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata),
						"/TEAMS/Foo", "", undefined)
					.returns(mMergedQueryOptions);
				that.mock(oCache).expects("keepOnlyGivenElements").withExactArgs(["('c')"])
					.returns([oCache.aElements[2]]);
				oHelperMock.expects("getKeyFilter")
					.withExactArgs(sinon.match.same(oCache.aElements[2]), "/TEAMS/Foo",
						sinon.match.same(mTypeForMetaPath))
					.returns("~key_filter~");
				that.mock(_Helper).expects("extractMergeableQueryOptions")
					.withExactArgs({$filter : "~key_filter~"}).returns(mMergeableQueryOptions);
				that.mock(that.oRequestor).expects("buildQueryString")
					.withExactArgs("/TEAMS/Foo", {$filter : "~key_filter~"}, false, true)
					.returns("?bar");
				that.oRequestorMock.expects("request")
					.withExactArgs("GET", "TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock),
						undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined,
						false, sinon.match.same(mMergeableQueryOptions), sinon.match.same(oCache),
						sinon.match.func)
					.resolves({value : [oNewValue]});
				oHelperMock.expects("updateSelected")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('c')",
						sinon.match.same(oCache.aElements[2]), sinon.match.same(oNewValue),
						sinon.match.same(aPaths), sinon.match.func)
					.callsFake(function (_mChangeListeners, _sPath, _oTarget, _oSource, _aPaths,
						fnCheckKeyPredicate) {
							if (fnCheckKeyPredicate("('c')/" + oFixture.path)) {
								throw oError;
							}
						});

				// code under test
				return oCache
					.requestSideEffects(oGroupLock, aPaths, ["('c')"])
					.then(function () {
						assert.notOk(oFixture.error);
					}, function (oResult) {
						assert.ok(oFixture.error);
						assert.strictEqual(oResult, oError);
					});
			});
	});
});

	//*********************************************************************************************
	[[/*no data*/], [{}, {/*too much*/}]].forEach(function (aData, i) {
		var sTitle = "CollectionCache#requestSideEffects: unexpected response " + i;

		QUnit.test(sTitle, function (assert) {
			var oBeforeExpectation,
				oFilterExpectation,
				oGroupLock = {},
				mMergeableQueryOptions = {},
				mMergedQueryOptions = {},
				aPaths = [],
				mQueryOptions = {},
				sResourcePath = "TEAMS('42')/Foo",
				oCache = this.createCache(sResourcePath),
				oCacheMock = this.mock(oCache),
				that = this;

			// Note: fill cache with more than just "visible" rows
			return this.mockRequestAndRead(oCache, 0, sResourcePath, 1, 4, 4, undefined, "26")
				.then(function () {
					var mTypeForMetaPath = {};

					oCache.aElements[0] = undefined; // can result from a failed requestElements
					oCacheMock.expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
					that.mock(Object).expects("assign")
						.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
							sinon.match.same(oCache.mLateQueryOptions))
						.returns(mQueryOptions);
					that.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
							sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
							sinon.match.same(that.oRequestor.getModelInterface().fetchMetadata),
							"/TEAMS/Foo", "", undefined)
						.returns(mMergedQueryOptions);
					oCache.beforeRequestSideEffects = function () {};
					oBeforeExpectation = that.mock(oCache).expects("beforeRequestSideEffects")
						.withExactArgs(sinon.match.same(mMergedQueryOptions));
					oFilterExpectation = that.mock(oCache).expects("keepOnlyGivenElements")
						.withExactArgs(["('c')"]).returns([oCache.aElements[2]]);
					that.mock(_Helper).expects("getKeyFilter")
						.withExactArgs(sinon.match.same(oCache.aElements[2]), "/TEAMS/Foo",
							sinon.match.same(mTypeForMetaPath))
						.returns("~key_filter~");
					that.mock(_Helper).expects("extractMergeableQueryOptions")
						.withExactArgs({$filter : "~key_filter~"}).returns(mMergeableQueryOptions);
					that.mock(that.oRequestor).expects("buildQueryString")
						.withExactArgs("/TEAMS/Foo", {$filter : "~key_filter~"}, false, true)
						.returns("?bar");
					that.oRequestorMock.expects("request")
						.withExactArgs("GET", "TEAMS('42')/Foo?bar", sinon.match.same(oGroupLock),
							undefined, undefined, undefined, undefined, oCache.sMetaPath, undefined,
							false, sinon.match.same(mMergeableQueryOptions),
							sinon.match.same(oCache), sinon.match.func)
						.resolves({value : aData});
					oCacheMock.expects("visitResponse").never();

					// code under test
					return oCache
						.requestSideEffects(oGroupLock, aPaths, ["('c')"])
						.then(function () {
							assert.ok(false);
						}, function (oError) {
							assert.strictEqual(oError.message,
								"Expected 1 row(s), but instead saw " + aData.length);
							assert.ok(oBeforeExpectation.calledBefore(oFilterExpectation));
						});
				});
		});
	});

	//*********************************************************************************************
	// false: no request merging
	// undefined: another request merges its aPaths into the resulting GET request.
	//            Helper.updateSelected is not skipped.
	// true: the resulting GET request is merged. Helper.updateSelected is skipped (It would be
	//       done by the "other" request).
	[false, undefined, true].forEach(function (bSkip) {
		var sTitle = "CollectionCache#requestSideEffects: skip updateSelected: " + bSkip;

		QUnit.test(sTitle, function (assert) {
			var oElement = {"@$ui5._" : {predicate : "('c')"}},
				oGetRelativePathExpectation,
				oGroupLock = {},
				mIntersectedQueryOptions = {
					"sap-client" : "123",
					$expand : {expand : null},
					$select : ["Name"]
				},
				mMergeableQueryOptions = {},
				oNewValue = {value : [{"@$ui5._" : {predicate : "('c')"}}]},
				aPaths = ["EMPLOYEE"],
				mQueryOptions = {},
				mQueryOptionsForExtract
					= Object.assign({$filter : "~key_filter~"}, mIntersectedQueryOptions),
				sResourcePath = "TEAMS('42')/Foo",
				mTypeForMetaPath = {"/TEAMS/Foo" : "~type~"},
				oUpdateSelectedExpectation,
				oVisitResponseExpectation,
				oCache = this.createCache(sResourcePath);

			oCache.aElements.push(oElement);
			oCache.aElements.$byPredicate["('c')"] = oElement;

			this.mock(oCache).expects("getTypes").withExactArgs().returns(mTypeForMetaPath);
			this.mock(oCache).expects("checkSharedRequest").withExactArgs();
			this.mock(Object).expects("assign")
				.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
					sinon.match.same(oCache.mLateQueryOptions))
				.returns(mQueryOptions);
			this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
					sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
					sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
					"/TEAMS/Foo", "", undefined)
				.returns(mIntersectedQueryOptions);
			this.mock(oCache).expects("keepOnlyGivenElements").withExactArgs(["('c')"])
				.returns([oCache.aElements[0]]);
			this.mock(_Helper).expects("getKeyFilter")
				.withExactArgs(sinon.match.same(oCache.aElements[0]), "/TEAMS/Foo",
					sinon.match.same(mTypeForMetaPath))
				.returns("~key_filter~");
			this.mock(_Helper).expects("selectKeyProperties")
				.withExactArgs(sinon.match.same(mIntersectedQueryOptions), "~type~");
			this.mock(_Helper).expects("extractMergeableQueryOptions")
				.withExactArgs(mQueryOptionsForExtract).returns(mMergeableQueryOptions);
			this.mock(this.oRequestor).expects("buildQueryString")
				.withExactArgs("/TEAMS/Foo", mQueryOptionsForExtract, false, true)
				.returns("?bar");
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", sResourcePath + "?bar", sinon.match.same(oGroupLock),
					undefined, undefined, undefined, undefined, "/TEAMS/Foo", undefined, false,
					sinon.match.same(mMergeableQueryOptions), sinon.match.same(oCache),
					sinon.match.func)
				.callsFake(function () {
					if (bSkip === true) {
						assert.deepEqual(arguments[12](), aPaths,
							"arguments[12]: fnMergeRequests; returns its own paths");
					} else if (bSkip === undefined) {
						assert.strictEqual(arguments[12](["~another~", "~path~"]), undefined,
							"arguments[12]: fnMergeRequests, gets other parts as parameter");
					}
					return Promise.resolve(oNewValue);
				});

			oVisitResponseExpectation = this.mock(oCache).expects("visitResponse")
				.exactly(bSkip ? 0 : 1)
				.withExactArgs(sinon.match.same(oNewValue), sinon.match.same(mTypeForMetaPath),
					undefined, "", NaN, true);

			oUpdateSelectedExpectation = this.mock(_Helper).expects("updateSelected")
				.exactly(bSkip ? 0 : 1)
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "('c')",
					sinon.match.same(oElement), sinon.match.same(oNewValue.value[0]),
					bSkip === undefined ? ["EMPLOYEE", "~another~", "~path~"]
						: sinon.match.same(aPaths),
					sinon.match.func)
				.callThrough();
			if (bSkip === true) {
				oGetRelativePathExpectation
					= this.mock(_Helper).expects("getRelativePath").exactly(0);
			} else if (bSkip === false) {
				oGetRelativePathExpectation
					= this.mock(_Helper).expects("getRelativePath").exactly(1);
			} else {
				oGetRelativePathExpectation
					= this.mock(_Helper).expects("getRelativePath").exactly(3);
			}

			// code under test
			return oCache
				.requestSideEffects(oGroupLock, aPaths, ["('c')"])
				.then(function () {
					if (bSkip === false) {
						assert.deepEqual(oGetRelativePathExpectation.args, [["", "EMPLOYEE"]]);
						assert.ok(oVisitResponseExpectation
							.calledBefore(oUpdateSelectedExpectation));
					} else if (bSkip === undefined) {
						assert.deepEqual(oGetRelativePathExpectation.args, [
							["", "EMPLOYEE"],
							["", "~another~"],
							["", "~path~"]
						]);
					}
				});
		});
	});

	//*********************************************************************************************
[[], ["('3')"]].forEach(function (aKeptElementPredicates, i) {
	[undefined, "myGroup", "$auto"].forEach(function (sGroupId) {
		[false, true].forEach(function (bDeleted) {
			var sTitle = "CollectionCache#reset/restore; #" + i + ", sGroupId = " + sGroupId
					+ ", bDeleted = " + bDeleted;

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createCache("Employees"),
			oCacheMock = this.mock(oCache),
			oInactive = {"@$ui5.context.isInactive" : true}, // "inline creation row"
			oCreated = {}, // ordinary created persisted => not kept!
			oDeleted = {"@$ui5.context.isDeleted" : true},
			oActive = {"@$ui5.context.isInactive" : false}, // "inline creation row"
			mChangeListeners = {
				$count : "~listener~count~",
				"($uid=id-1-23)/bar" : "~listener[]~2~",
				"($uid=id-1-42)/baz" : "~listener[]~3~",
				"('0')/a" : "~listener[]~4~",
				"('1')/b" : "~listener[]~5~",
				"('2')/c" : "~listener[]~6~",
				"('3')/bar/baz" : "~listener[]~0~",
				"('3')/foo" : "~listener[]~1~",
				"('6')/foo" : "~listener[]~7~"
			},
			oElement0 = {},
			oElement1 = {},
			oElement2 = {},
			oTail = SyncPromise.resolve(),
			oTransient0 = {}, // "inline creation row" does not matter here
			oTransient1 = {},
			mByPredicate = {
				"($uid=id-1-23)" : oTransient0,
				"($uid=id-1-42)" : oTransient1,
				"('0')" : oInactive,
				"('1')" : oCreated,
				"('2')" : oActive,
				"('3')" : oElement0,
				"('6')" : oDeleted
			},
			aElements = [
				oInactive, oTransient0, oCreated, oTransient1, oActive, // created on client
				oElement0, oElement1, oElement2 // read from server
			];

		_Helper.setPrivateAnnotation(oInactive, "transientPredicate", "($uid=id-0-0)");
		_Helper.setPrivateAnnotation(oCreated, "transientPredicate", "($uid=id-0-1)");
		_Helper.setPrivateAnnotation(oActive, "transientPredicate", "($uid=id-0-2)");
		_Helper.setPrivateAnnotation(oInactive, "predicate", "('0')");
		_Helper.setPrivateAnnotation(oCreated, "predicate", "('1')");
		_Helper.setPrivateAnnotation(oActive, "predicate", "('2')");
		_Helper.setPrivateAnnotation(oTransient0, "transientPredicate", "($uid=id-1-23)");
		_Helper.setPrivateAnnotation(oTransient1, "transientPredicate", "($uid=id-1-42)");
		_Helper.setPrivateAnnotation(oTransient0, "transient", "$auto");
		_Helper.setPrivateAnnotation(oTransient1, "transient", "$auto");
		if (!i) { // show that oElement is not treated as transient (because of $created)
			_Helper.setPrivateAnnotation(oElement0, "transient", "$auto");
			_Helper.setPrivateAnnotation(oElement0, "transientPredicate", "($uid=id-17-4)");
		}
		_Helper.setPrivateAnnotation(oElement0, "predicate", "('3')");
		_Helper.setPrivateAnnotation(oElement1, "predicate", "('4')");
		_Helper.setPrivateAnnotation(oElement2, "predicate", "('5')");
		_Helper.setPrivateAnnotation(oDeleted, "predicate", "('6')");
		oCache.iActiveElements = 4;
		assert.strictEqual(oCache.oBackup, null, "be nice to V8");
		oCache.oBackup = "~oBackup~";
		oCache.mChangeListeners = Object.assign({
				"($uid=id-0-0)/n/a" : "~listener[]~n/a~",
				"($uid=id-0-1)/n/a" : "~listener[]~n/a~",
				"($uid=id-0-2)/n/a" : "~listener[]~n/a~"
			}, mChangeListeners);
		oCache.sContext = "foo";
		oCache.aElements = aElements;
		oCache.aElements.$byPredicate = Object.assign({
			"('4')" : oElement1,
			"('5')" : oElement2
		}, mByPredicate);
		oCache.aElements.$count = 23;
		oCache.aElements.$created = 5;
		oCache.aElements.$tail = oTail;
		oCache.iLimit = 42;
		if (bDeleted) {
			oCache.aElements.$deleted = {
				"('d1')" : {index : 209},
				"('d2')" : {index : 210}
			};
		}
		oCacheMock.expects("checkSharedRequest").exactly(sGroupId ? 1 : 0).withExactArgs();
		oCacheMock.expects("setQueryOptions").never();

		// code under test
		oCache.reset(aKeptElementPredicates.slice(), sGroupId);

		if (!i) {
			delete mChangeListeners["('3')/bar/baz"];
			delete mChangeListeners["('3')/foo"];
			delete mByPredicate["('3')"];
		}
		delete mChangeListeners["('1')/b"];
		delete mByPredicate["('1')"];
		if (!sGroupId) {
			delete mChangeListeners["('0')/a"];
			delete mChangeListeners["('2')/c"];
			delete mByPredicate["('0')"];
			delete mByPredicate["('2')"];

			assert.strictEqual(oCache.oBackup, "~oBackup~");

			// code under test (must not really restore anything)
			oCache.restore();

			assert.strictEqual(oCache.oBackup, null);
			assert.strictEqual(oCache.iActiveElements, 1, "iActiveElements changed");
			assert.strictEqual(oCache.aElements.$created, 2, "$created adjusted");
			assert.strictEqual(oCache.aElements.length, 2, "transient ones kept");
			assert.strictEqual(oCache.aElements[0], oTransient0);
			assert.strictEqual(oCache.aElements[1], oTransient1);
		} else if (sGroupId === "$auto") {
			delete mChangeListeners["($uid=id-1-23)/bar"];
			delete mChangeListeners["($uid=id-1-42)/baz"];
			delete mByPredicate["($uid=id-1-23)"];
			delete mByPredicate["($uid=id-1-42)"];

			assert.strictEqual(oCache.iActiveElements, 1);
			assert.strictEqual(oCache.aElements.$created, 2);
			assert.strictEqual(oCache.aElements.length, 2, "only inline creation rows kept");
			assert.strictEqual(oCache.aElements[0], oInactive);
			assert.strictEqual(oCache.aElements[1], oActive);
		} else {
			assert.strictEqual(oCache.iActiveElements, 3);
			assert.strictEqual(oCache.aElements.$created, 4);
			assert.strictEqual(oCache.aElements.length, 4);
			assert.strictEqual(oCache.aElements[0], oInactive);
			assert.strictEqual(oCache.aElements[1], oTransient0);
			assert.strictEqual(oCache.aElements[2], oTransient1);
			assert.strictEqual(oCache.aElements[3], oActive);
		}
		assert.deepEqual(oCache.mChangeListeners, mChangeListeners);
		assert.strictEqual(oCache.sContext, undefined);
		assert.strictEqual(oCache.aElements, aElements, "reference unchanged");
		assert.deepEqual(oCache.aElements.$byPredicate, mByPredicate);
		if (sGroupId !== "$auto") {
			assert.strictEqual(oCache.aElements.$byPredicate["($uid=id-1-23)"], oTransient0);
			assert.strictEqual(oCache.aElements.$byPredicate["($uid=id-1-42)"], oTransient1);
		}
		if (i) {
			assert.strictEqual(oCache.aElements.$byPredicate["('3')"], oElement0);
		}
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.ok("$count" in oCache.aElements); // needed for setCount()
		assert.strictEqual(oCache.aElements.$tail, oTail, "$tail unchanged");
		assert.strictEqual(oCache.iLimit, Infinity);
		if (bDeleted) {
			assert.deepEqual(oCache.aElements.$deleted, {
				"('d1')" : {index : undefined},
				"('d2')" : {index : undefined}
			});
		}

		if (sGroupId) {
			if (i) {
				oCache.aElements[10] = "n/a"; // could be a promise
				// just to be sure backup was complete
				oCache.mChangeListeners = {};
				oCache.aElements.$byPredicate = {};
			}
			oCacheMock.expects("checkSharedRequest").withExactArgs();

			// code under test
			oCache.restore(true);

			assert.strictEqual(oCache.oBackup, null);
			assert.strictEqual(oCache.iActiveElements, 4);
			assert.deepEqual(oCache.mChangeListeners, {
				$count : "~listener~count~",
				"($uid=id-0-0)/n/a" : "~listener[]~n/a~",
				"($uid=id-0-1)/n/a" : "~listener[]~n/a~",
				"($uid=id-0-2)/n/a" : "~listener[]~n/a~",
				"($uid=id-1-23)/bar" : "~listener[]~2~",
				"($uid=id-1-42)/baz" : "~listener[]~3~",
				"('0')/a" : "~listener[]~4~",
				"('1')/b" : "~listener[]~5~",
				"('2')/c" : "~listener[]~6~",
				"('3')/bar/baz" : "~listener[]~0~",
				"('3')/foo" : "~listener[]~1~",
				"('6')/foo" : "~listener[]~7~"
			});
			assert.strictEqual(oCache.sContext, "foo");
			assert.strictEqual(oCache.aElements, aElements, "reference unchanged");
			assert.strictEqual(oCache.aElements[0], oInactive);
			assert.strictEqual(oCache.aElements[1], oTransient0);
			assert.strictEqual(oCache.aElements[2], oCreated);
			assert.strictEqual(oCache.aElements[3], oTransient1);
			assert.strictEqual(oCache.aElements[4], oActive);
			assert.strictEqual(oCache.aElements[5], oElement0);
			assert.strictEqual(oCache.aElements[6], oElement1);
			assert.strictEqual(oCache.aElements[7], oElement2);
			assert.strictEqual(oCache.aElements.length, 8);
			assert.strictEqual(oCache.aElements.$count, 23);
			assert.strictEqual(oCache.aElements.$created, 5);
			assert.strictEqual(oCache.aElements.$tail, oTail, "$tail unchanged");
			assert.deepEqual(oCache.aElements.$byPredicate, {
				"($uid=id-1-23)" : oTransient0,
				"($uid=id-1-42)" : oTransient1,
				"('0')" : oInactive,
				"('1')" : oCreated,
				"('2')" : oActive,
				"('3')" : oElement0,
				"('4')" : oElement1,
				"('5')" : oElement2,
				"('6')" : oDeleted
			});
			assert.strictEqual(oCache.iLimit, 42);
		}
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#reset, shared cache", function (assert) {
		var oCache = this.createCache("Employees"),
			mChangeListeners = {"" : "~listeners~", path1 : "~listeners1~", path2 : "~listeners2~"},
			oElement0 = {id : 0},
			oElement1 = {id : 1},
			oElement2 = {id : 2},
			aElements = [oElement0, oElement1, oElement2],
			oFireChangeExpectation,
			oSetQueryOptionsExpectation;

		aElements.$byPredicate = {"(0)" : oElement0, "(1)" : oElement1, "(2)" : oElement2};
		oCache.aElements = aElements;
		oCache.mChangeListeners = mChangeListeners;
		oCache.sContext = "~context~";
		oCache.aElements.$count = oCache.iLimit = 3;
		oCache.aReadRequests = [{iStart : 1, iEnd : 2}, {iStart : 3, iEnd : 4}];

		oSetQueryOptionsExpectation = this.mock(oCache).expects("setQueryOptions")
			.withExactArgs("~mQueryOptions~", true);
		oFireChangeExpectation = this.mock(_Helper).expects("fireChange")
			.withExactArgs({"" : "~listeners~"}, "")
			.callsFake(function () {
				assert.deepEqual(oCache.aReadRequests, [
					{iStart : 1, iEnd : 2, bObsolete : true},
					{iStart : 3, iEnd : 4, bObsolete : true}
				]);
			});

		// code under test
		oCache.reset([], undefined, "~mQueryOptions~");

		assert.deepEqual(oCache.aReadRequests, [
			{iStart : 1, iEnd : 2, bObsolete : true},
			{iStart : 3, iEnd : 4, bObsolete : true}
		]);
		assert.strictEqual(oCache.aElements, aElements);
		assert.strictEqual(oCache.aElements.length, 0);
		assert.strictEqual(oCache.aElements.$created, 0);
		assert.strictEqual(oCache.aElements.$count, undefined);
		assert.deepEqual(oCache.aElements.$byPredicate, {});
		assert.strictEqual(oCache.iLimit, Infinity);
		assert.deepEqual(oCache.mChangeListeners, {"" : "~listeners~"});
		assert.ok(oSetQueryOptionsExpectation.calledBefore(oFireChangeExpectation));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#isDeletingInOtherGroup", function (assert) {
		var oCache = this.createCache("Employees");

		assert.strictEqual(oCache.isDeletingInOtherGroup("group"), false);

		oCache.aElements.$deleted = {};
		assert.strictEqual(oCache.isDeletingInOtherGroup("group"), false);

		oCache.aElements.$deleted = {a : {groupId : "group"}, b : {groupId : "group"}};
		assert.strictEqual(oCache.isDeletingInOtherGroup("group"), false);

		oCache.aElements.$deleted = {a : {groupId : "group"}, b : {groupId : "otherGroup"}};
		assert.strictEqual(oCache.isDeletingInOtherGroup("group"), true);
	});

	//*********************************************************************************************
[false, 1].forEach(function (bInactive) {
	QUnit.test(`CollectionCache#setInactive(${bInactive})`, function (assert) {
		const iActivateCount = bInactive ? 0 : 1;
		const oCache = this.createCache("Employees");
		oCache.iActiveElements = 42;
		this.mock(oCache).expects("getValue").withExactArgs("($uid=id-1-23)").returns("~oElement~");
		this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "($uid=id-1-23)",
				"~oElement~", {"@$ui5.context.isInactive" : bInactive});
		this.mock(_Helper).expects("deletePrivateAnnotation").exactly(iActivateCount)
			.withExactArgs("~oElement~", "initialData");
		this.mock(_Helper).expects("addToCount").exactly(iActivateCount)
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oCache.aElements), 1);

		// code under test
		oCache.setInactive("($uid=id-1-23)", bInactive);

		assert.strictEqual(oCache.iActiveElements, bInactive ? 42 : 43);
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#setEmpty", function (assert) {
		const oCache = this.createCache("Employees");

		// code under test
		oCache.setEmpty();

		assert.strictEqual(oCache.aElements.$count, 0);
		assert.strictEqual(oCache.iLimit, 0);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache", function (assert) {
		var oCache,
			mQueryOptions = {};

		this.mock(_Cache.prototype).expects("setQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions));
		this.mock(_Cache.prototype).expects("setResourcePath")
			.withExactArgs("resource/path")
			.callsFake(function () {
				assert.notOk(this.bSharedRequest, "must not have been set yet");
			});

		// code under test
		oCache = _Cache.createSingle(this.oRequestor, "resource/path", mQueryOptions,
			"bSortExpandSelect", "bSharedRequest", "original/resource/path", "bPost", "/meta/path");

		assert.strictEqual(oCache.oRequestor, this.oRequestor);
		assert.strictEqual(oCache.bSortExpandSelect, "bSortExpandSelect");
		assert.strictEqual(oCache.bSharedRequest, "bSharedRequest");
		assert.strictEqual(oCache.sOriginalResourcePath, "original/resource/path");
		assert.strictEqual(oCache.sMetaPath, "/meta/path");
		assert.strictEqual(oCache.bPost, "bPost");
		assert.strictEqual(oCache.bPosting, false);
		assert.strictEqual(oCache.oPromise, null);
	});

	//*********************************************************************************************
[{}, null].forEach(function (oExpectedResult) {
	QUnit.test("SingleCache#fetchValue, oExpectedResult = " + oExpectedResult, function (assert) {
		var oCache,
			oCacheMock,
			bCreateOnDemand = "bCreateOnDemand",
			fnDataRequested1 = {},
			fnDataRequested2 = {},
			oGroupLock1 = {
				unlock : function () {}
			},
			oGroupLock2 = {
				unlock : function () {}
			},
			sMetaPath = "~",
			oOldPromise,
			oPathExpectation,
			aPromises,
			mQueryOptions = {},
			sResourcePath = "Employees('1')",
			oResponseExpectation,
			mTypeForMetaPath = {};

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, true)
			.returns("?~");
		this.mock(_Cache.prototype).expects("fetchTypes")
			.returns(SyncPromise.resolve(Promise.resolve(mTypeForMetaPath)));

		oCache = _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions, true, false,
			undefined, false, sMetaPath);
		oCacheMock = this.mock(oCache);
		assert.strictEqual(oCache.oPromise, null);

		oCacheMock.expects("registerChangeListener").never();
		this.mock(oGroupLock1).expects("unlock").never();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", sinon.match.same(oGroupLock1), undefined,
				undefined, sinon.match.same(fnDataRequested1), undefined, sMetaPath)
			.returns(Promise.resolve(oExpectedResult).then(function () {
				oPathExpectation = oCacheMock.expects("buildOriginalResourcePath")
					.withExactArgs(sinon.match.same(oExpectedResult),
						sinon.match.same(mTypeForMetaPath), "fnGetOriginalResourcePath");
				oResponseExpectation = oCacheMock.expects("visitResponse")
					.withExactArgs(sinon.match.same(oExpectedResult),
						sinon.match.same(mTypeForMetaPath));
				oCacheMock.expects("registerChangeListener")
					.withExactArgs(undefined, "~oListener1~");
				oCacheMock.expects("drillDown")
					.withExactArgs(sinon.match.same(oExpectedResult), undefined,
						sinon.match.same(oGroupLock1), bCreateOnDemand)
					.returns(SyncPromise.resolve(oExpectedResult));
				oCacheMock.expects("drillDown")
					.withExactArgs(sinon.match.same(oExpectedResult), "foo",
						sinon.match.same(oGroupLock2), bCreateOnDemand)
					.returns(SyncPromise.resolve("bar"));
				oCacheMock.expects("drillDown")
					.withExactArgs(sinon.match.same(oExpectedResult), "foo",
						sinon.match.same(_GroupLock.$cached))
					.returns(SyncPromise.resolve("bar"));
				return oExpectedResult;
			}));

		// code under test
		assert.strictEqual(oCache.getValue("foo"), undefined, "before fetchValue");
		aPromises = [
			oCache.fetchValue(oGroupLock1, undefined, fnDataRequested1, "~oListener1~",
					bCreateOnDemand, "fnGetOriginalResourcePath")
				.then(function (oResult) {
					assert.strictEqual(oResult, oExpectedResult);
				})
		];
		oOldPromise = oCache.oPromise;
		assert.notStrictEqual(oOldPromise, null);

		assert.ok(oCache.bSentRequest);

		oCacheMock.expects("registerChangeListener").withExactArgs("foo", "~oListener2~");
		this.mock(oGroupLock2).expects("unlock").withExactArgs();

		// code under test
		aPromises.push(
			oCache.fetchValue(oGroupLock2, "foo", fnDataRequested2, "~oListener2~", bCreateOnDemand)
				.then(function (oResult) {
					assert.strictEqual(oResult, "bar");
					assert.strictEqual(oCache.getValue("foo"), "bar", "data available");
					assert.ok(oResponseExpectation.calledAfter(oPathExpectation));
				})
		);
		assert.strictEqual(oCache.oPromise, oOldPromise);

		assert.strictEqual(oCache.getValue("foo"), undefined, "data not yet available");

		aPromises.push(oOldPromise.then(function (oResult) {
			assert.strictEqual(oResult, oExpectedResult, "resolves with complete data from GET");
		}));

		return Promise.all(aPromises);
	});
});

	//*********************************************************************************************
	QUnit.test("_SingleCache#fetchValue: GET fails due to $cached", function (assert) {
		var oCache = this.createSingle("Employees('1')"),
			oError = new Error();

		this.oRequestorMock.expects("request")
			.withArgs("GET", "Employees('1')", sinon.match.same(_GroupLock.$cached))
			.throws(oError);

		assert.throws(function () {
			// code under test
			oCache.fetchValue(_GroupLock.$cached, "");
		}, oError);

		assert.strictEqual(oCache.bSentRequest, false);
	});

	//*********************************************************************************************
	QUnit.test("_SingleCache#getValue: drillDown asynchronous", function (assert) {
		var oCache = this.createSingle("Employees('1')"),
			oData = {},
			oDrillDownPromise = SyncPromise.resolve(Promise.resolve());

		oCache.oPromise = SyncPromise.resolve(oData);
		this.mock(oCache).expects("drillDown")
			.withExactArgs(sinon.match.same(oData), "foo", sinon.match.same(_GroupLock.$cached))
			.returns(oDrillDownPromise);
		this.mock(oDrillDownPromise).expects("isFulfilled").withExactArgs().returns(false);
		this.mock(oDrillDownPromise).expects("caught").withExactArgs();

		// code under test
		assert.strictEqual(oCache.getValue("foo"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#post: misc. errors", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true),
			oEntity = {},
			oGroupLock0 = {getGroupId : function () {}},
			oPostData = {},
			oPromise,
			oResult1 = {},
			oResult2 = {},
			that = this;

		assert.throws(function () {
			// code under test
			this.createSingle(sResourcePath).post({/*group lock*/});
		}, new Error("POST request not allowed"));

		assert.throws(function () {
			// code under test
			oCache.fetchValue({/*group lock*/});
		}, new Error("Cannot fetch a value before the POST request"));

		assert.notOk(oCache.bSentRequest);

		this.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock0),
				{"If-Match" : sinon.match.same(oEntity)}, sinon.match.same(oPostData),
				sinon.match.func)
			.resolves(oResult1);
		assert.strictEqual(oCache.oPromise, null);

		// code under test
		oPromise = oCache.post(oGroupLock0, oPostData, oEntity);

		assert.ok(!oPromise.isFulfilled());
		assert.ok(!oPromise.isRejected());
		assert.strictEqual(oCache.oPromise, oPromise);

		assert.throws(function () {
			// code under test
			oCache.post({/*group lock*/}, oPostData);
		}, new Error("Parallel POST requests not allowed"));

		return oPromise.then(function (oPostResult1) {
			var fnDataRequested = that.spy(),
				oGroupLock1 = {},
				oGroupLock2 = {unlock : function () {}},
				oPromise,
				aPromises = [];

			assert.strictEqual(oPostResult1, oResult1);

			that.mock(oGroupLock2).expects("unlock").withExactArgs();

			// code under test
			oPromise = oCache.fetchValue(oGroupLock2, "", fnDataRequested);

			aPromises.push(
				oPromise.then(function (oReadResult) {
					assert.strictEqual(oReadResult, oResult1);
					assert.strictEqual(fnDataRequested.callCount, 0);
				})
			);

			that.oRequestorMock.expects("request")
				.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock1), {},
					sinon.match.same(oPostData), undefined)
				.resolves(oResult2);

			// code under test
			oPromise = oCache.post(oGroupLock1, oPostData);

			assert.strictEqual(oCache.oPromise, oPromise);
			aPromises.push(
				oPromise.then(function (oPostResult2) {
					assert.strictEqual(oPostResult2, oResult2);
				})
			);

			return Promise.all(aPromises);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bOptional) {
		var sTitle = "SingleCache: Invoke Parameterless Actions with Empty Request Body: "
				+ bOptional;

		QUnit.test(sTitle, function (assert) {
			var oData = {"X-HTTP-Method" : "PUT"},
				oEntity = {},
				oGroupLock = {getGroupId : function () {}},
				oPromise,
				oRequestExpectation,
				oRequestLock = {unlock : function () {}},
				sResourcePath = "LeaveRequest('1')/Submit",
				oCache = this.createSingle(sResourcePath, undefined, true);

			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("group");
			this.oRequestorMock.expects("relocateAll")
				.withExactArgs("$parked.group", "group", sinon.match.same(oEntity));
			this.oRequestorMock.expects("isActionBodyOptional").withExactArgs().returns(bOptional);
			oRequestExpectation = this.oRequestorMock.expects("request")
				.withExactArgs("PUT", sResourcePath, sinon.match.same(oGroupLock),
					{"If-Match" : sinon.match.same(oEntity)},
					bOptional ? undefined : sinon.match.same(oData),
					sinon.match.func)
				.resolves();

			// code under test
			oPromise = oCache.post(oGroupLock, oData, oEntity);

			assert.strictEqual(oCache.oPromise, oPromise);
			assert.strictEqual(oCache.bSentRequest, true);

			this.oRequestorMock.expects("lockGroup")
				.withExactArgs("group", sinon.match.same(oCache), true)
				.returns(oRequestLock);

			// code under test
			oRequestExpectation.args[0][5](); // call onSubmit

			this.mock(oRequestLock).expects("unlock").withExactArgs();

			return oPromise.then(function () {
					assert.deepEqual(oData, {});
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: post w/o arguments", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true),
			oGroupLock = {};

		assert.strictEqual(oCache.bSharedRequest, false);

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oRequestorMock.expects("relocateAll").never();
		this.oRequestorMock.expects("isActionBodyOptional").never();
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), {}, undefined,
				undefined)
			.resolves();

		// code under test
		return oCache.post(oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache: bIgnoreETag w/o oEntity", function () {
		var oCache = this.createSingle("Foo", undefined, true),
			oGroupLock = {};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.oRequestorMock.expects("relocateAll").never();
		this.oRequestorMock.expects("isActionBodyOptional").never();
		this.oRequestorMock.expects("request")
			.withExactArgs("POST", "Foo", sinon.match.same(oGroupLock), {}, undefined, undefined)
			.resolves();

		// code under test
		return oCache.post(oGroupLock, undefined, undefined, true);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasETag) {
	[false, true].forEach(function (bHasSelect) {
		["$single", "any"].forEach(function (sGroupId) {
	const sTitle = "SingleCache: post for bound operation, has ETag: " + bHasETag + ", has $select:"
		+ bHasSelect + ", groupId=" + sGroupId;

	QUnit.test(sTitle, function (assert) {
		var mQueryOptions = bHasSelect ? {$select : "~select~"} : {},
			sResourcePath = "TEAMS(TeamId='42',IsActiveEntity=true)/name.space.EditAction",
			oCache = _Cache.createSingle(this.oRequestor, sResourcePath, mQueryOptions, true, false,
				undefined, true, "/TEAMS/name.space.EditAction/@$ui5.overload/0/$ReturnType/$Type"),
			oEntity = bHasETag ? {"@odata.etag" : 'W/"19700101000000.0000000"'} : {},
			oGroupLock = {getGroupId : function () {}},
			oGroupLockMock = this.mock(oGroupLock),
			oPathExpectation,
			oRequestExpectation,
			oRequestLock = {unlock : function () {}},
			oResult,
			oReturnValue = {},
			oResponseExpectation,
			mTypes = {},
			oUnlockExpectation;

		oGroupLockMock.expects("getGroupId").withExactArgs().returns(sGroupId);
		this.oRequestorMock.expects("relocateAll")
			.withExactArgs("$parked." + sGroupId, sGroupId, sinon.match.same(oEntity));
		this.oRequestorMock.expects("isActionBodyOptional").never();
		oRequestExpectation = this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock),
				{"If-Match" : bHasETag ? "*" : {}}, null,
				sGroupId !== "$single" ? sinon.match.func : false)
			.resolves(oReturnValue);
		this.mock(oCache).expects("fetchTypes")
			.withExactArgs()
			.resolves(mTypes);
		oPathExpectation = this.mock(oCache).expects("buildOriginalResourcePath")
			.withExactArgs(sinon.match.same(oReturnValue), sinon.match.same(mTypes),
				"fnGetOriginalResourcePath");
		oResponseExpectation = this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oReturnValue), sinon.match.same(mTypes));
		this.mock(_Helper).expects("updateSelected").exactly(bHasSelect ? 1 : 0)
			.withExactArgs({}, "", sinon.match.same(oReturnValue), sinon.match.same(oReturnValue),
				"~select~");

		// code under test
		oResult = oCache.post(oGroupLock, /*oData*/null, oEntity, /*bIgnoreETag*/true, undefined,
			"fnGetOriginalResourcePath");

		if (sGroupId !== "$single") {
			this.oRequestorMock.expects("lockGroup")
				.withExactArgs(sGroupId, sinon.match.same(oCache), true)
				.returns(oRequestLock);
			// code under test
			oRequestExpectation.args[0][5](); // call onSubmit

			oUnlockExpectation = this.mock(oRequestLock).expects("unlock").withExactArgs();
		}

		return oResult.then(function (oResult) {
				assert.strictEqual(oResult, oReturnValue);
				if (oUnlockExpectation) {
					assert.ok(oUnlockExpectation.calledAfter(oResponseExpectation));
				}
				assert.ok(oResponseExpectation.calledAfter(oPathExpectation));
			});
	});
		});
	});
});
	//TODO with an expand on 1..n navigation properties, compute the count of the nested collection
	//   --> comes with implementation of $$inheritExpandSelect

	//*********************************************************************************************
	QUnit.test("SingleCache: post failure", function (assert) {
		var sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true),
			oGroupLock = {},
			sMessage = "deliberate failure",
			oPostData = {},
			oPromise,
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), {},
				sinon.match.same(oPostData), undefined)
			.rejects(new Error(sMessage));

		// code under test
		oPromise = oCache.post(oGroupLock, oPostData).then(function () {
			assert.ok(false);
		}, function (oError) {
			var oGroupLock1 = {};

			assert.strictEqual(oError.message, sMessage);

			that.oRequestorMock.expects("request")
				.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock1), {},
					sinon.match.same(oPostData), undefined)
				.rejects(new Error(sMessage));

			// code under test
			return oCache.post(oGroupLock1, oPostData).then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, sMessage);
			});
		});
		assert.throws(function () {
			// code under test
			oCache.post({/*group lock*/}, oPostData);
		}, /Parallel POST requests not allowed/);
		return oPromise.catch(function () {});
	});

	//*********************************************************************************************
[false, true].forEach(function (bBound) {
	[false, true].forEach(function (bConfirm) {
		var sTitle = "SingleCache: post failure: strict handling, bound=" + bBound + ", confirm="
				+ bConfirm;

	QUnit.test(sTitle, function (assert) {
		var that = this,
			sResourcePath = "LeaveRequest('1')/Submit",
			oCache = this.createSingle(sResourcePath, undefined, true),
			oError = new Error("strict handling failed"),
			oEntity = {},
			mExpectedHeaders0 = {
				Prefer : "handling=strict"
			},
			mExpectedHeaders1 = {},
			oGroupLock = {
				getGroupId : function () {},
				getUnlockedCopy : function () {}
			},
			oPostData = {},
			oRequestExpectation,
			oRequestLock = {unlock : function () {}},
			oResponse = {},
			oResult,
			oUnlockExpectation,
			fnOnStrictHandlingFailed = sinon.spy(function (oError0) {
				assert.strictEqual(oError0, oError);
				assert.strictEqual(oCache.bPosting, false);
				if (oUnlockExpectation) {
					assert.ok(oUnlockExpectation.called, "unlocked");
				}

				return Promise.resolve().then(function () {
					if (!bConfirm) {
						return false;
					}
					assert.strictEqual(oCache.bPosting, false);
					that.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs()
						.returns("~GroupLockCopy~");
					that.oRequestorMock.expects("request")
						.withExactArgs("POST", sResourcePath, "~GroupLockCopy~", mExpectedHeaders1,
							sinon.match.same(oPostData), bBound ? sinon.match.func : undefined)
						.callsFake(function () {
							assert.strictEqual(oCache.bPosting, true);

							return Promise.resolve(oResponse);
						});
					that.mock(oCache).expects("visitResponse")
						.withExactArgs(sinon.match.same(oResponse), "~types~");

					return true;
				});
			});

		if (bBound) {
			mExpectedHeaders0["If-Match"] = mExpectedHeaders1["If-Match"] = oEntity;
		}
		oError.strictHandlingFailed = true;
		this.mock(oGroupLock).expects("getGroupId").exactly(bBound ? 1 : 0)
			.withExactArgs()
			.returns("groupId");
		this.mock(this.oRequestor).expects("relocateAll").exactly(bBound ? 1 : 0)
			.withExactArgs("$parked.groupId", "groupId", sinon.match.same(oEntity));
		oRequestExpectation = this.oRequestorMock.expects("request")
			.withExactArgs("POST", sResourcePath, sinon.match.same(oGroupLock), mExpectedHeaders0,
				sinon.match.same(oPostData), bBound ? sinon.match.func : undefined)
			.rejects(oError);
		this.mock(oCache).expects("fetchTypes").exactly(bConfirm ? 2 : 1)
			.withExactArgs().resolves("~types~");

		// code under test
		oResult = oCache.post(oGroupLock, oPostData, bBound ? oEntity : undefined, undefined,
			fnOnStrictHandlingFailed);

		if (bBound) {
			this.oRequestorMock.expects("lockGroup")
				.withExactArgs("groupId", sinon.match.same(oCache), true)
				.returns(oRequestLock);

			// code under test
			oRequestExpectation.args[0][5](); // call onSubmit

			oUnlockExpectation = this.mock(oRequestLock).expects("unlock").withExactArgs();
		}

		return oResult.then(function (oResult) {
				assert.ok(bConfirm);
				assert.strictEqual(oCache.bPosting, false);
				assert.strictEqual(oResult, oResponse);
			}, function (oCanceledError) {
				assert.notOk(bConfirm);
				assert.strictEqual(oCache.bPosting, false);
				assert.strictEqual(oCanceledError.message,
					"Action canceled due to strict handling");
				assert.strictEqual(oCanceledError.canceled, true);
			});
	});
	});
});

	//*********************************************************************************************
	QUnit.test("_Cache#toString", function (assert) {
		var oCache,
			mQueryOptions = {foo : "bar"},
			sResourcePath = "Employees";

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, undefined)
			.returns("?foo=bar");
		oCache = new _Cache(this.oRequestor, sResourcePath, mQueryOptions);

		assert.strictEqual(oCache.toString(), "/~/" + sResourcePath + "?foo=bar");
	});

	//*********************************************************************************************
	//TODO move to _Cache!
	QUnit.test("SingleCache: mChangeRequests", function (assert) {
		var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oCache = this.createSingle(sResourcePath),
			oError = new Error(),
			oGroupLock = {},
			oPatchPromise1 = Promise.resolve({
				"@odata.etag" : 'W/"19700101000000.9999999"',
				Note : "Some Note"
			}),
			oPatchPromise2 = Promise.reject(oError),
			oPromise = Promise.resolve({
				"@odata.etag" : 'W/"19700101000000.0000000"',
				Note : "Some Note"
			}),
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, sinon.match.same(oGroupLock), undefined, undefined,
				undefined, undefined, "/SOLineItemList")
			.returns(oPromise);
		// fill the cache
		return oCache.fetchValue(oGroupLock).then(function (oEntity) {
			var oGroupLock0 = {getGroupId : function () {}},
				oGroupLock1 = {getGroupId : function () {}},
				oRequestLock0 = {unlock : function () {}},
				oRequestLock1 = {unlock : function () {}},
				oUpdatePromise;

			that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
			that.oRequestorMock.expects("lockGroup")
				.withExactArgs("updateGroup", sinon.match.same(oCache), true)
				.returns(oRequestLock0);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock0),
					{"If-Match" : sinon.match.same(oEntity)}, {Note : "foo"}, sinon.match.func,
					sinon.match.func, undefined, oCache.sResourcePath, undefined, undefined,
					undefined, sinon.match.func)
				.callsFake(function () {
					arguments[5](); // fnSubmit
					return oPatchPromise1;
				});
			that.mock(oGroupLock1).expects("getGroupId").withExactArgs().returns("$direct");
			that.oRequestorMock.expects("lockGroup")
				.withExactArgs("$direct", sinon.match.same(oCache), true)
				.returns(oRequestLock1);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock1),
					{"If-Match" : sinon.match.same(oEntity)}, {Note : "bar"}, sinon.match.func,
					sinon.match.func, undefined, oCache.sResourcePath, undefined, undefined,
					undefined, sinon.match.func)
				.callsFake(function () {
					arguments[5](); // fnSubmit
					return oPatchPromise2;
				});

			// code under test
			oUpdatePromise = Promise.all([
				oCache.update(oGroupLock0, "Note", "foo", that.spy(), sResourcePath, "", undefined,
					false, sinon.spy()),
				oCache.update(oGroupLock1, "Note", "bar", that.spy(), sResourcePath, "", undefined,
					false, sinon.spy()
				).then(function () {
					assert.ok(false);
				}, function (oError0) {
					assert.strictEqual(oError0, oError);
				})
			]).then(function () {
				assert.deepEqual(oCache.mChangeRequests, {},
					"mChangeRequests empty when both patch requests are finished");
			});
			assert.deepEqual(oCache.mChangeRequests, {
				Note : [oPatchPromise1, oPatchPromise2]
			}, "mChangeRequests remembers both pending requests");

			return oUpdatePromise;
		});
	});

	//*********************************************************************************************
	//TODO move to _Cache!
	QUnit.test("SingleCache: update, hasPendingChanges and resetChanges", function (assert) {
		var sResourcePath = "SOLineItemList(SalesOrderID='0',ItemPosition='0')",
			oCache = this.createSingle(sResourcePath),
			oEntity = {
				"@odata.etag" : 'W/"19700101000000.0000000"',
				Note : "Some Note",
				Foo : "Bar"
			},
			oError = new Error(),
			oGroupLock = {},
			oHelperMock = this.mock(_Helper),
			oOldData = {Foo : "Bar"},
			oPatchPromise1 = Promise.reject(oError),
			oPatchPromise2 = Promise.reject(oError),
			oPromise = Promise.resolve(oEntity),
			that = this;

		function unexpected() {
			assert.ok(false);
		}

		function rejected(oError) {
			assert.strictEqual(oError.canceled, true);
		}

		oError.canceled = true;
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath, sinon.match.same(oGroupLock), undefined, undefined,
				undefined, undefined, "/SOLineItemList")
			.returns(oPromise);
		// fill the cache and register a listener
		return oCache.fetchValue(oGroupLock, "Note").then(function () {
			var oGroupLock0 = {getGroupId : function () {}},
				oGroupLock1 = {getGroupId : function () {}},
				aUpdatePromises;

			assert.strictEqual(oCache.hasPendingChangesForPath(""), false);
			that.mock(oGroupLock0).expects("getGroupId").withExactArgs().returns("updateGroup");
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Note"], "foo")
				.returns({Note : "foo"});
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Note"], "Some Note")
				.returns({Note : "Some Note"});
			oHelperMock.expects("updateNonExisting")
				.withExactArgs({Note : "Some Note"}, sinon.match.same(oOldData))
				.returns("~merged~");
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock0),
					{"If-Match" : sinon.match.same(oEntity)}, {Note : "foo"}, sinon.match.func,
					sinon.match.func, undefined, sResourcePath, undefined, undefined, undefined,
					sinon.match.func)
				.callsFake(function () {
					arguments[12](oOldData);

					return oPatchPromise1;
				});
			that.mock(oGroupLock1).expects("getGroupId").withExactArgs().returns("updateGroup");
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Foo"], "baz")
				.returns({Foo : "baz"});
			oHelperMock.expects("makeUpdateData")
				.withExactArgs(["Foo"], "Bar")
				.returns(oOldData);
			that.oRequestorMock.expects("request")
				.withExactArgs("PATCH", sResourcePath, sinon.match.same(oGroupLock1),
					{"If-Match" : sinon.match.same(oEntity)}, {Foo : "baz"}, sinon.match.func,
					sinon.match.func, undefined, sResourcePath, undefined, undefined, undefined,
					sinon.match.func)
				.callsFake(function () {
					assert.strictEqual(arguments[12](), oOldData);

					return oPatchPromise2;
				});
			that.oRequestorMock.expects("removeChangeRequest")
				.withExactArgs(sinon.match.same(oPatchPromise1));
			that.oRequestorMock.expects("removeChangeRequest")
				.withExactArgs(sinon.match.same(oPatchPromise2));

			// code under test
			aUpdatePromises = [
				oCache.update(oGroupLock0, "Note", "foo", that.spy(), sResourcePath)
					.then(unexpected, rejected),
				oCache.update(oGroupLock1, "Foo", "baz", that.spy(), sResourcePath)
					.then(unexpected, rejected)
			];

			assert.strictEqual(oCache.hasPendingChangesForPath(""), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("Note"), true);
			assert.strictEqual(oCache.hasPendingChangesForPath("bar"), false);

			// code under test
			oCache.resetChangesForPath("");

			return Promise.all(aUpdatePromises).then(function () {
				assert.deepEqual(oCache.mChangeRequests, {});
			});
		});
	});

	//*********************************************************************************************
[
	{lock : false, error : false},
	{lock : true, error : false},
	{lock : true, error : true},
	{lock : true, error : true, canceled : true},
	{lock : true, error : true, inactive : true}
].forEach(function (oFixture) {
	var sTitle = "SingleCache#_delete, followed by _fetchValue: root entity "
			+ JSON.stringify(oFixture);

	QUnit.test(sTitle, function (assert) {
		var oCache = this.createSingle("Employees('42')"),
			fnCallback = sinon.spy(),
			oData = {"@odata.etag" : 'W/"19770724000000.0000000"'},
			oError = new Error(),
			oExpectation,
			oFetchGroupLock = {},
			oMessage1 = {code : "CODE1"},
			oMessage2 = {code : "CODE2", persistent : true},
			aMessages = [oMessage1, oMessage2],
			oPromise,
			that = this;

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('42')", sinon.match.same(oFetchGroupLock), undefined,
				undefined, undefined, undefined, "/Employees")
			.resolves(oData);

		return oCache.fetchValue(oFetchGroupLock).then(function (oEntity) {
			var oDeleteGroupLock = oFixture.lock ? new _GroupLock("group", "owner", true) : null;

			that.oModelInterfaceMock.expects("getMessagesByPath")
				.withExactArgs("/Employees('42')", true).returns(aMessages);
			that.oModelInterfaceMock.expects("updateMessages")
				.withExactArgs(sinon.match.same(aMessages));
			oExpectation = that.oRequestorMock.expects("request").exactly(oFixture.lock ? 1 : 0)
				.withExactArgs("DELETE", "Employees('42')", sinon.match.same(oDeleteGroupLock),
					{"If-Match" : sinon.match.same(oEntity)},
					undefined, undefined, sinon.match.func, undefined, "Employees('42')")
				.returns(Promise.resolve().then(function () {
					if (oFixture.error) {
						if (oFixture.canceled) {
							oError.canceled = true;

							// code under test - simulate cancel
							oExpectation.args[0][6]();

							sinon.assert.calledTwice(fnCallback);
							sinon.assert.calledWithExactly(fnCallback.firstCall, undefined, -1);
							sinon.assert.calledWithExactly(fnCallback.secondCall, undefined, 1);
						}
						throw oError;
					}
				}));
			that.oModelInterfaceMock.expects("updateMessages").exactly(oFixture.error ? 1 : 0)
				.withExactArgs(undefined, oFixture.canceled ? [oMessage1, oMessage2] : [oMessage1]);

			// code under test
			oPromise = oCache._delete(oDeleteGroupLock, "Employees('42')", "", null, fnCallback);

			sinon.assert.calledOnceWithExactly(fnCallback, undefined, -1);
			if (oFixture.inactive) {
				oCache.iActiveUsages = 0;
			}

			return oPromise.then(function () {
				var oGroupLock = {unlock : function () {}};

				assert.notOk(oFixture.error);
				that.mock(oGroupLock).expects("unlock").withExactArgs();

				oCache.fetchValue(oGroupLock).then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.message, "Cannot read a deleted entity");
				});
			}, function (oError0) {
				assert.ok(oFixture.error);
				assert.strictEqual(oError0, oError);

				if (oFixture.inactive) {
					sinon.assert.calledOnceWithExactly(fnCallback, undefined, -1);
				} else {
					sinon.assert.calledTwice(fnCallback);
					sinon.assert.calledWithExactly(fnCallback.firstCall, undefined, -1);
					sinon.assert.calledWithExactly(fnCallback.secondCall, undefined, 1);
				}
			});
		});
	});
});

	//*********************************************************************************************
[null, {}].forEach(function (mLateQueryOptions) {
	[undefined, "Me"].forEach(function (sReadPath) {
		// false: no request merging
		// undefined: another request merges its aPaths into the request, which is initiated by
		//            requestSideEffects. Helper.updateAll is not skipped.
		// true: the request that is initiated by requestSideEffects is merged into another one.
		//       Helper.updateAll is skipped (It would be done by the "other" request).
		// -- see "callsFake" of the "request" expectation
		[false, undefined, true].forEach(function (bSkip) {
			var sTitle = "SingleCache#requestSideEffects, sResourcePath = " + sReadPath
				+ " mLateQueryOptions = " + mLateQueryOptions + " skip = " + bSkip;

		QUnit.test(sTitle, function (assert) {
			var sResourcePath = "Employees('42')",
				oCache = this.createSingle(sResourcePath, {}),
				oCacheMock = this.mock(oCache),
				oGetRelativePathExpectation,
				oGroupLock = {},
				mMergedQueryOptions = {
					"sap-client" : "123",
					$expand : {expand : null},
					$select : ["ROOM_ID"]
				},
				oNewValue = {},
				oOldValue = {"@$ui5._" : {predicate : "(~)"}},
				aPaths = ["ROOM_ID"],
				oPromise,
				mQueryOptions = {},
				mTypeForMetaPath = {},
				oUpdateSelectedExpectation,
				oVisitResponseExpectation;

			oCache.oPromise = SyncPromise.resolve(oOldValue); // from previous #fetchValue
			oCache.mLateQueryOptions = mLateQueryOptions;
			this.mock(Object).expects("assign")
				.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
					sinon.match.same(oCache.mLateQueryOptions))
				.returns(mQueryOptions);
			this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
					sinon.match.same(mQueryOptions),
					sinon.match.same(aPaths),
					sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata),
					"/Employees")
				.returns(mMergedQueryOptions);
			this.mock(_Helper).expects("extractMergeableQueryOptions")
				.withExactArgs(sinon.match.same(mMergedQueryOptions))
				.callThrough();
			this.oRequestorMock.expects("buildQueryString")
				.withExactArgs("/Employees", {
						"sap-client" : "123",
						$expand : "~",
						$select : "~"
					}, false, true)
				.returns("?~");
			this.oRequestorMock.expects("request")
				.withExactArgs("GET", (sReadPath || sResourcePath) + "?~",
					sinon.match.same(oGroupLock), undefined, undefined, undefined, undefined,
					oCache.sMetaPath, undefined, false, {
						$expand : {expand : null},
						$select : ["ROOM_ID"]
					}, sinon.match.same(oCache), sinon.match.func)
				.callsFake(function () {
					if (bSkip === true) {
						assert.deepEqual(arguments[12](), aPaths,
							"arguments[12]: fnMergeRequests; returns its own paths");
					} else if (bSkip === undefined) {
						assert.strictEqual(arguments[12](["~another~", "~path~"]), undefined,
							"arguments[12]: fnMergeRequests; gets other parts as parameter");
					}
					return Promise.resolve(oNewValue);
				});
			oCacheMock.expects("fetchTypes").withExactArgs()
				.returns(SyncPromise.resolve(mTypeForMetaPath));
			oCacheMock.expects("fetchValue")
				.withExactArgs(sinon.match.same(_GroupLock.$cached), "")
				.returns(SyncPromise.resolve(oOldValue));
			oVisitResponseExpectation = oCacheMock.expects("visitResponse")
				.exactly(bSkip ? 0 : 1)
				.withExactArgs(
					sinon.match.same(oNewValue).and(sinon.match({"@$ui5._" : {predicate : "(~)"}})),
					sinon.match.same(mTypeForMetaPath));
			oUpdateSelectedExpectation = this.mock(_Helper).expects("updateSelected")
				.exactly(bSkip ? 0 : 1)
				.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
					sinon.match.same(oOldValue), sinon.match.same(oNewValue),
					bSkip !== undefined ? sinon.match.same(aPaths)
						: ["ROOM_ID", "~another~", "~path~"],
					sinon.match.func)
				.callThrough();
			if (bSkip === true) {
				oGetRelativePathExpectation = this.mock(_Helper).expects("getRelativePath")
					.exactly(0);
			} else if (bSkip === false) {
				oGetRelativePathExpectation = this.mock(_Helper).expects("getRelativePath")
					.exactly(1);
			} else {
				oGetRelativePathExpectation = this.mock(_Helper).expects("getRelativePath")
					.exactly(3);
			}

			// code under test
			oPromise = oCache.requestSideEffects(oGroupLock, aPaths, sReadPath)
				.then(function () {
					if (bSkip === false) {
						assert.deepEqual(oGetRelativePathExpectation.args, [["", "ROOM_ID"]]);
						assert.ok(oVisitResponseExpectation
							.calledBefore(oUpdateSelectedExpectation));
					} else if (bSkip === undefined) {
						assert.deepEqual(oGetRelativePathExpectation.args, [
							["", "ROOM_ID"],
							["", "~another~"],
							["", "~path~"]
						]);
					}
				});

			assert.ok(!oPromise.isFulfilled());
			assert.ok(!oPromise.isRejected());
			oCacheMock.expects("fetchValue")
				.withExactArgs(sinon.match.same(_GroupLock.$cached), "").callThrough();

			// code under test: check that a "parallel" read does not wait for oPromise
			assert.strictEqual(oCache.fetchValue(_GroupLock.$cached, "").getResult(), oOldValue);

			return oPromise;
		});
		});
	});
});
	//TODO CollectionCache#refreshSingle claims that
	// "_Helper.updateExisting cannot be used because navigation properties cannot be handled"
	// --> what does that mean for us? @see CPOUI5UISERVICESV3-1992

	//*********************************************************************************************
[
	{error : false, path : "EMPLOYEE_2_TEAM"},
	{error : false, path : "EMPLOYEE_2_TEAM/TEAM_2_MANAGER"},
	{error : true, path : "EMPLOYEE_2_EQUIPMENT"} // key predicate must not change here
].forEach(function (oFixture, i) {
	QUnit.test("SingleCache#requestSideEffects: key property change #" + i, function (assert) {
		var sResourcePath = "Employees('42')",
			oCache = this.createSingle(sResourcePath, {
				"sap-client" : "123",
				$select : ["ROOM_ID"]
			}),
			oError = new Error(),
			oGroupLock = {},
			mMergeableQueryOptions = {},
			mMergedQueryOptions = {},
			oNewValue = {
				Bar : {
					"@$ui5._" : {predicate : "('new')"}
				}
			},
			oOldValue = {
				Bar : {
					"@$ui5._" : {predicate : "('old')"}
				}
			},
			aPaths = ["n/a", "EMPLOYEE_2_TEAM", "EMPLOYEE"],
			mQueryOptions = {},
			mTypeForMetaPath = {};

		oCache.oPromise = SyncPromise.resolve({}); // from previous #fetchValue*
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions")
			.withExactArgs(sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees")
			.returns(mMergedQueryOptions);
		this.mock(_Helper).expects("extractMergeableQueryOptions")
			.withExactArgs(sinon.match.same(mMergedQueryOptions)).returns(mMergeableQueryOptions);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mMergedQueryOptions), false, true)
			.returns("?~");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "~path~?~", sinon.match.same(oGroupLock), undefined, undefined,
				undefined, undefined, oCache.sMetaPath, undefined, false,
				sinon.match.same(mMergeableQueryOptions), sinon.match.same(oCache),
				sinon.match.func)
			.resolves(oNewValue);
		this.mock(oCache).expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(mTypeForMetaPath));
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "")
			.returns(SyncPromise.resolve(oOldValue));
		this.mock(oCache).expects("visitResponse")
			.withExactArgs(sinon.match.same(oNewValue), sinon.match.same(mTypeForMetaPath));
		this.mock(_Helper).expects("updateSelected")
			.withExactArgs(sinon.match.same(oCache.mChangeListeners), "",
				sinon.match.same(oOldValue), sinon.match.same(oNewValue), sinon.match.same(aPaths),
				sinon.match.func)
			.callsFake(function (_mChangeListeners, _sPath, _oTarget, _oSource, _aPaths,
				fnCheckKeyPredicate) {
					if (fnCheckKeyPredicate(oFixture.path)) {
						throw oError;
					}
			});

		// code under test
		return oCache.requestSideEffects(oGroupLock, aPaths, "~path~")
			.then(function () {
				assert.notOk(oFixture.error);
			}, function (oResult) {
				assert.ok(oFixture.error);
				assert.strictEqual(oResult, oError);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("SingleCache#requestSideEffects: no data read before", function (assert) {
		var oCache = this.createSingle("Employees('42')");

		assert.strictEqual(oCache.oPromise, null);
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("intersectQueryOptions").never();
		this.mock(oCache).expects("fetchValue").never();
		this.oRequestorMock.expects("buildQueryString").never();
		this.oRequestorMock.expects("request").never();
		this.mock(oCache).expects("fetchTypes").never();
		this.mock(_Helper).expects("updateExisting").never(); // ==> #patch also not called

		// code under test
		assert.strictEqual(oCache.requestSideEffects(), SyncPromise.resolve());
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#requestSideEffects: no need to GET anything", function (assert) {
		var oCache = this.createSingle("Employees('42')"),
			aPaths = ["ROOM_ID"],
			mQueryOptions = {};

		// a broken cache from a previous #fetchValue doesn't hurt
		oCache.oPromise = SyncPromise.reject(new Error("read failure"));
		oCache.oPromise.caught();
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
				sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees")
			.returns(null);
		this.mock(oCache).expects("fetchValue").never();
		this.oRequestorMock.expects("buildQueryString").never();
		this.oRequestorMock.expects("request").never();
		this.mock(oCache).expects("fetchTypes").never();
		this.mock(_Helper).expects("updateExisting").never(); // ==> #patch also not called

		// code under test
		assert.strictEqual(
			oCache.requestSideEffects({/*group lock*/}, aPaths),
			SyncPromise.resolve()
		);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#requestSideEffects: request fails", function (assert) {
		var oCache = this.createSingle("Employees('42')"),
			oCacheMock = this.mock(oCache),
			oError = new Error(),
			oGroupLock = {},
			mMergeableQueryOptions = {},
			mMergedQueryOptions = {},
			oOldValue = {},
			aPaths = ["ROOM_ID"],
			oPromise,
			mQueryOptions = {};

		oCache.oPromise = SyncPromise.resolve(oOldValue); // from previous #fetchValue
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
				sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees")
			.returns(mMergedQueryOptions);
		this.mock(_Helper).expects("extractMergeableQueryOptions")
			.withExactArgs(sinon.match.same(mMergedQueryOptions)).returns(mMergeableQueryOptions);
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mMergedQueryOptions), false, true)
			.returns("?~");
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "Employees('42')?~", sinon.match.same(oGroupLock), undefined,
				undefined, undefined, undefined, oCache.sMetaPath, undefined, false,
				sinon.match.same(mMergeableQueryOptions), sinon.match.same(oCache),
				sinon.match.func)
			.rejects(oError);
		oCacheMock.expects("fetchTypes").withExactArgs()
			.returns(SyncPromise.resolve(/*don't care*/));
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "")
			.returns(SyncPromise.resolve("ignored"));
		this.mock(_Helper).expects("updateExisting").never(); // ==> #patch also not called

		// code under test
		oPromise = oCache.requestSideEffects(oGroupLock, aPaths)
			.then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});

		oCacheMock.expects("fetchValue").twice()
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "").callThrough();

		// code under test: check that a "parallel" read does not wait for oPromise
		assert.strictEqual(oCache.fetchValue(_GroupLock.$cached, "").getResult(), oOldValue);

		return oPromise.then(function () {
				// code under test: check that a read afterwards returns the old value
				return oCache.fetchValue(_GroupLock.$cached, "").then(function (vResult) {
					assert.strictEqual(vResult, oOldValue);
				});
			});
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#requestSideEffects: $expand in intersection", function (assert) {
		var oCache = this.createSingle("Me"),
			oError = new Error("Unsupported collection-valued navigation property /Me/B/C"),
			aPaths = ["B/C"],
			mQueryOptions = {};

		oCache.oPromise = {/*from previous #fetchValue*/};
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
				sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Me")
			.throws(oError);
		this.mock(oCache).expects("fetchValue").never();

		assert.throws(function () {
			// code under test
			oCache.requestSideEffects({/*group lock*/}, aPaths);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#requestSideEffects: broken cache", function (assert) {
		var oCache = this.createSingle("Employees('42')"),
			oGroupLock = {},
			mMergedQueryOptions = {},
			aPaths = ["ROOM_ID"],
			mQueryOptions = {},
			oReadError = new Error("read failure");

		oCache.oPromise = SyncPromise.reject(oReadError); // from previous #fetchValue
		oCache.oPromise.caught();
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oCache.mQueryOptions),
				sinon.match.same(oCache.mLateQueryOptions))
			.returns(mQueryOptions);
		this.mock(_Helper).expects("intersectQueryOptions").withExactArgs(
				sinon.match.same(mQueryOptions), sinon.match.same(aPaths),
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata), "/Employees")
			.returns(mMergedQueryOptions);
		this.mock(oCache).expects("fetchValue").never();
		this.oRequestorMock.expects("buildQueryString").never();
		this.oRequestorMock.expects("request").never();
		this.mock(oCache).expects("fetchTypes").never();
		this.mock(_Helper).expects("updateExisting").never(); // ==> #patch also not called

		// code under test
		assert.throws(function () {
			oCache.requestSideEffects(oGroupLock, aPaths);
		}, new Error("/~/Employees('42'): Cannot call requestSideEffects, cache is broken:"
			+ " read failure"));
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#buildOriginalResourcePath: callback", function (assert) {
		var oCache = _Cache.createSingle(this.oRequestor, "Entity('1')/my.Action", {}, false,
				false, "old/original/resource/path", false, "meta/path"),
			oPredicateExpectation;

		oPredicateExpectation = this.mock(oCache).expects("calculateKeyPredicate")
			.withExactArgs("~oRootEntity~", "~mTypeForMetaPath~", "meta/path");

		// code under test
		oCache.buildOriginalResourcePath("~oRootEntity~", "~mTypeForMetaPath~", function (oValue) {
			assert.strictEqual(oValue, "~oRootEntity~");
			assert.ok(oPredicateExpectation.called);
			return "new/original/resource/path";
		});

		assert.strictEqual(oCache.sOriginalResourcePath, "new/original/resource/path");
	});

	//*********************************************************************************************
	QUnit.test("SingleCache#buildOriginalResourcePath: no callback", function (assert) {
		var oCache = _Cache.createSingle(this.oRequestor, "Entity('1')/my.Action", {}, false,
				false, "original/resource/path");

		this.mock(oCache).expects("calculateKeyPredicate").never();

		// code under test
		oCache.buildOriginalResourcePath("~oRootEntity~", "~mTypeForMetaPath~", undefined);

		assert.strictEqual(oCache.sOriginalResourcePath, "original/resource/path");
	});

	//*********************************************************************************************
	QUnit.test("PropertyCache#fetchValue: unsupported bCreateOnDemand", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, "Employees('1')");

		assert.throws(function () {
			// Note: other arguments must not matter here
			oCache.fetchValue(null, "", null, null, true);
		}, new Error("Unsupported argument: bCreateOnDemand"));
	});

	//*********************************************************************************************
[{
	in : {value : "some value"},
	out : "some value"
}, {
	in : null, // null value: null is returned due to "204 No Content"
	out : null
}, {
	in : 42, // $count: "a simple primitive integer value with media type text/plain"
	out : 42
}].forEach(function (oFixture) {
	QUnit.test("PropertyCache#fetchValue, value = " + oFixture.out, function (assert) {
		var oCache,
			oCacheMock,
			fnDataRequested1 = {},
			fnDataRequested2 = {},
			aFetchValuePromises,
			oGroupLock1 = {unlock : function () {}},
			oGroupLock2 = {unlock : function () {}},
			mQueryOptions = {},
			sResourcePath = "Employees('1')",
			that = this;

		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/Employees", sinon.match.same(mQueryOptions), false, undefined)
			.returns("?~");

		oCache = _Cache.createProperty(this.oRequestor, sResourcePath, mQueryOptions);
		oCacheMock = this.mock(oCache);

		this.mock(oGroupLock1).expects("unlock").never();
		oCacheMock.expects("registerChangeListener").never();

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?~", sinon.match.same(oGroupLock1), undefined,
				undefined, sinon.match.same(fnDataRequested1), undefined, "/Employees")
			.returns(Promise.resolve().then(function () {
					oCacheMock.expects("registerChangeListener").withExactArgs("", "~oListener1~");
					oCacheMock.expects("registerChangeListener").withExactArgs("", undefined);
					return oFixture.in;
				}));

		// code under test
		aFetchValuePromises = [
			oCache.fetchValue(oGroupLock1, "", fnDataRequested1, "~oListener1~")
				.then(function (oResult) {
					var oGroupLock3 = {unlock : function () {}};

					assert.strictEqual(oResult, oFixture.out);

					that.mock(oGroupLock3).expects("unlock").withExactArgs();

					assert.strictEqual(oCache.fetchValue(oGroupLock3, "").getResult(),
						oFixture.out);
				})
		];

		assert.ok(oCache.bSentRequest);

		oCacheMock.expects("registerChangeListener").withExactArgs("", "~oListener2~");
		this.mock(oGroupLock2).expects("unlock").withExactArgs();

		// code under test
		aFetchValuePromises.push(
			oCache.fetchValue(oGroupLock2, "", fnDataRequested2, "~oListener2~")
				.then(function (oResult) {
					assert.strictEqual(oResult, oFixture.out);
				})
		);

		return Promise.all(aFetchValuePromises);
	});
});

	//*********************************************************************************************
["foo('bar')/baz", "foo/$count", "Singleton/baz"].forEach(function (sResourcePath) {
	QUnit.test("PropertyCache#_delete", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, sResourcePath);

		// code under test
		assert.throws(function () {
			oCache._delete();
		}, new Error("Unsupported"));
	});
});

["foo('bar')/baz", "foo/$count", "Singleton/baz"].forEach(function (sResourcePath) {
	//*********************************************************************************************
	QUnit.test("PropertyCache#create", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, sResourcePath);

		// code under test
		assert.throws(function () {
			oCache.create();
		}, new Error("Unsupported"));
	});
});

["foo('bar')/baz", "foo/$count", "Singleton/baz"].forEach(function (sResourcePath) {
	//*********************************************************************************************
	QUnit.test("PropertyCache#update", function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, sResourcePath);

		// code under test
		assert.throws(function () {
			oCache.update();
		}, new Error("Unsupported"));
	});
});

	//*********************************************************************************************
	[{}, {"Bar/Baz" : {}}].forEach(function (mTypeForMetaPath) {
		var sTitle = "_Cache#calculateKeyPredicate: no key; " + JSON.stringify(mTypeForMetaPath);

		QUnit.test(sTitle, function (assert) {
			var oCache = new _Cache(this.oRequestor, "Foo"),
				oHelperMock = this.mock(_Helper),
				vInstance = {},
				sMetaPath = "Bar/Baz";

			oHelperMock.expects("getKeyPredicate").never();
			oHelperMock.expects("setPrivateAnnotation").never();

			// code under test
			assert.strictEqual(oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath),
				undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_Cache#calculateKeyPredicate: with key", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Foo"),
			oHelperMock = this.mock(_Helper),
			vInstance = {},
			sKeyPredicate = "(42)",
			sMetaPath = "Bar/Baz",
			mTypeForMetaPath = {"Bar/Baz" : {$Key : ["key"]}};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(vInstance), sMetaPath,
				sinon.match.same(mTypeForMetaPath))
			.returns(sKeyPredicate);
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(vInstance), "predicate",
				sinon.match.same(sKeyPredicate));

		// code under test
		assert.strictEqual(oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath),
			sKeyPredicate);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#calculateKeyPredicate: with key but no data for key", function () {
		var oCache = new _Cache(this.oRequestor, "Foo"),
			oHelperMock = this.mock(_Helper),
			vInstance = {},
			sMetaPath = "Bar/Baz",
			mTypeForMetaPath = {"Bar/Baz" : {$Key : ["key"]}};

		oHelperMock.expects("getKeyPredicate")
			.withExactArgs(sinon.match.same(vInstance), sMetaPath,
				sinon.match.same(mTypeForMetaPath))
			.returns(undefined);
		oHelperMock.expects("setPrivateAnnotation").never();

		// code under test
		oCache.calculateKeyPredicate(vInstance, mTypeForMetaPath, sMetaPath);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#visitResponse: compute count and calculate key predicates for single object",
			function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS('42')/Foo"),
			oCacheMock = this.mock(oCache),
			oResult = {
				// do not call calculateKeyPredicate for instance annotations
				"@instance.annotation" : {},
				foo : "bar",
				list : [{}, {}, {
					nestedList : [{}]
				}],
				property : {
					nestedList : [{}]
				},
				// do not call calculateKeyPredicate for instance annotations
				"property@instance.annotation" : {},
				list2 : [{}, {}, {}],
				"list2@odata.count" : "12",
				"list2@odata.nextLink" : "List2?skip=3",
				list3 : [{}, {}, {}],
				"list3@odata.nextLink" : "List3?skip=3",
				collectionValuedProperty : ["test1", "test2"],
				null : null,
				collectionWithNullValue : [null]
			},
			mTypeForMetaPath = {};

		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list[0]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list[1]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list[2]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list[2].nestedList[0]),
				sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/list/nestedList");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.property), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/property");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.property.nestedList[0]),
				sinon.match.same(mTypeForMetaPath), "/TEAMS/Foo/property/nestedList");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list2[0]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list2[1]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list2[2]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list3[0]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list3");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list3[1]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list3");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(oResult.list3[2]), sinon.match.same(mTypeForMetaPath),
				"/TEAMS/Foo/list3");

		// code under test
		oCache.visitResponse(oResult, mTypeForMetaPath);

		assert.strictEqual(oResult.list.$count, 3);
		assert.strictEqual(oResult.list.$created, 0);
		assert.strictEqual(oResult.list[2].nestedList.$count, 1);
		assert.strictEqual(oResult.list[2].nestedList.$created, 0);
		assert.strictEqual(oResult.property.nestedList.$count, 1);
		assert.strictEqual(oResult.property.nestedList.$created, 0);
		assert.strictEqual(oResult.list2.$count, 12);
		assert.strictEqual(oResult.list2.$created, 0);
		assert.ok("$count" in oResult.list3);
		assert.strictEqual(oResult.list3.$count, undefined);
		assert.strictEqual(oResult.list3.$created, 0);
		assert.strictEqual(oResult.collectionValuedProperty.$count, 2);
		assert.strictEqual(oResult.collectionValuedProperty.$created, 0);
		assert.strictEqual(oResult.collectionWithNullValue.$count, 1);
		assert.strictEqual(oResult.collectionWithNullValue.$created, 0);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#visitResponse: compute count and calculate key predicates for an array",
			function (assert) {
		var oCache = new _Cache(this.oRequestor, "TEAMS"),
			oCacheMock = this.mock(oCache),
			sPredicate0 = "(13)",
			sPredicate1 = "(42)",
			aResult = [{
				foo0 : "bar0",
				list0 : [{}]
			}, {
				foo : "bar",
				list : [{}, {}, {
					nestedList : [{}]
				}],
				property : {
					nestedList : [{}]
				},
				// do not call calculateKeyPredicate for instance annotations
				"property@instance.annotation" : {},
				list2 : [{}, {}, {}],
				"list2@odata.count" : "12",
				"list2@odata.nextLink" : "List2?skip=3",
				list3 : [{}, {}, {}],
				"list3@odata.nextLink" : "List3?skip=3",
				collectionValuedProperty : ["test1", "test2"],
				null : null,
				collectionWithNullValue : [null]
			}],
			mTypeForMetaPath = {};

		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[0]), sinon.match.same(mTypeForMetaPath),
				"/FOO")
			.callsFake(function () {
				_Helper.setPrivateAnnotation(aResult[0], "predicate", sPredicate0);
			});
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[0].list0[0]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list0")
			.callsFake(function () {
				_Helper.setPrivateAnnotation(aResult[0].list0[0], "predicate", "('nested')");
			});

		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1]), sinon.match.same(mTypeForMetaPath),
				"/FOO")
			.callsFake(function () {
				_Helper.setPrivateAnnotation(aResult[1], "predicate", sPredicate1);
			});
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list[0]), sinon.match.same(mTypeForMetaPath),
				"/FOO/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list[1]), sinon.match.same(mTypeForMetaPath),
				"/FOO/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list[2]), sinon.match.same(mTypeForMetaPath),
				"/FOO/list");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list[2].nestedList[0]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list/nestedList");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].property),
				sinon.match.same(mTypeForMetaPath), "/FOO/property");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].property.nestedList[0]),
				sinon.match.same(mTypeForMetaPath), "/FOO/property/nestedList");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list2[0]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list2[1]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list2[2]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list2");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list3[0]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list3");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list3[1]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list3");
		oCacheMock.expects("calculateKeyPredicate")
			.withExactArgs(sinon.match.same(aResult[1].list3[2]),
				sinon.match.same(mTypeForMetaPath), "/FOO/list3");
		this.oModelInterfaceMock.expects("reportStateMessages").never();

		// code under test
		oCache.visitResponse({value : aResult}, mTypeForMetaPath, "/FOO", undefined, 0);

		assert.strictEqual(aResult[1].list.$count, 3);
		assert.strictEqual(aResult[1].list.$created, 0);
		assert.strictEqual(aResult[1].list2.$count, 12);
		assert.strictEqual(aResult[1].list2.$created, 0);
		assert.ok("$count" in aResult[1].list3);
		assert.strictEqual(aResult[1].list3.$count, undefined);
		assert.strictEqual(aResult[1].list3.$created, 0);
		assert.strictEqual(aResult[1].list[2].nestedList.$count, 1);
		assert.strictEqual(aResult[1].list[2].nestedList.$created, 0);
		assert.strictEqual(aResult[1].property.nestedList.$count, 1);
		assert.strictEqual(aResult[1].property.nestedList.$created, 0);
		assert.strictEqual(aResult[1].collectionValuedProperty.$count, 2);
		assert.strictEqual(aResult[1].collectionValuedProperty.$created, 0);
		assert.strictEqual(aResult[1].collectionWithNullValue.$count, 1);
		assert.strictEqual(aResult[1].collectionWithNullValue.$created, 0);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read uses visitResponse", function (assert) {
		var sResourcePath = "Employees",
			oCache = this.createCache(sResourcePath),
			oCacheMock = this.mock(oCache),
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			oUnlockedCopy = {
				getGroupId : function () { return "group"; }
			},
			oValue0 = {},
			oValue1 = {},
			oData = {
				value : [oValue0, oValue1]
			};

		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns(oUnlockedCopy);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", sResourcePath + "?$skip=0&$top=3",
				sinon.match.same(oUnlockedCopy), undefined, undefined, undefined)
			.resolves(oData);
		oCacheMock.expects("visitResponse").withExactArgs(sinon.match.same(oData),
			sinon.match.object, undefined, undefined, 0);

		// code under test
		return oCache.read(0, 3, 0, oGroupLock).then(function () {
			assert.strictEqual(oCache.aElements[0], oValue0);
			assert.strictEqual(oCache.aElements[1], oValue1);
		});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#read waits for prefetch 'after'", async function (assert) {
		const oCache = this.createCache("Employees");
		const oGroupLock = {
			getUnlockedCopy : mustBeMocked,
			unlock : mustBeMocked
		};
		this.mock(_Helper).expects("getPrivateAnnotation").never();
		this.mock(this.oRequestor).expects("waitForBatchResponseReceived").never();
		oCache.aElements.push(...aTestData.slice(0, 5));
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oCache.aElements), 0, 5, 10, Infinity)
			.returns([{
				end : 15,
				start : 5 // [0..5[ already available, see above
			}]);
		const oGetUnlockedCopyExpectation = this.mock(oGroupLock).expects("getUnlockedCopy")
			.withExactArgs().returns("~unlockedCopy~");
		this.mock(oCache).expects("requestElements")
			.withExactArgs(5, 15, "~unlockedCopy~", 0, "~fnDataRequested~")
			.callsFake(() => {
				// just at the edge, there is a promise we need to wait for
				oCache.aElements[14] = Promise.resolve();
				// just beyond, there is a promise which never resolves and MUST be ignored
				oCache.aElements[15] = new Promise(() => {});
			});
		const oUnlockExpectation = this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		const oSyncPromise = oCache.read(0, 5, 10, oGroupLock, "~fnDataRequested~");

		assert.ok(oSyncPromise.isPending());
		assert.ok(oUnlockExpectation.calledAfter(oGetUnlockedCopyExpectation));

		await oSyncPromise; // no need to check result, it's defined by aElements way above
	});

	//*********************************************************************************************
[10, 30].forEach((iPrefetchLength) => {
	const sTitle = `CollectionCache#read waits for prefetch 'before', ${iPrefetchLength}`;

	QUnit.test(sTitle, async function (assert) {
		const oCache = this.createCache("Employees");
		const oGroupLock = {
			getUnlockedCopy : mustBeMocked,
			unlock : mustBeMocked
		};
		this.mock(_Helper).expects("getPrivateAnnotation").never();
		this.mock(this.oRequestor).expects("waitForBatchResponseReceived").never();
		oCache.aElements.splice(20, 0, ...aTestData.slice(20, 25));
		oCache.iLimit = 25; // simulate a known $count
		const iStart = iPrefetchLength === 10 ? 10 : 0; // Math.max(0, 20 - iPrefetchLength)
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oCache.aElements), 20, 5, iPrefetchLength, 25)
			.returns([{
				end : 20,
				start : iStart // [20..25[ already available, see above
			}]);
		const oGetUnlockedCopyExpectation = this.mock(oGroupLock).expects("getUnlockedCopy")
			.withExactArgs().returns("~unlockedCopy~");
		this.mock(oCache).expects("requestElements")
			.withExactArgs(iStart, 20, "~unlockedCopy~", 0, "~fnDataRequested~")
			.callsFake(() => {
				switch (iPrefetchLength) {
					case 10:
						// just at the edge, there is a promise we need to wait for
						oCache.aElements[10] = Promise.resolve();
						// just beyond, there is a promise which never resolves and MUST be ignored
						oCache.aElements[9] = new Promise(() => {});
						break;

					case 30:
						// just at the edge, there is a promise we need to wait for
						oCache.aElements[0] = Promise.resolve();
						// just beyond, there is a promise which never resolves and MUST be ignored
						oCache.aElements[55] = new Promise(() => {});
						break;

					default:
						throw iPrefetchLength;
				}
			});
		const oUnlockExpectation = this.mock(oGroupLock).expects("unlock").withExactArgs();

		// code under test
		const oSyncPromise = oCache.read(20, 5, iPrefetchLength, oGroupLock, "~fnDataRequested~");

		assert.ok(oSyncPromise.isPending());
		assert.ok(oUnlockExpectation.calledAfter(oGetUnlockedCopyExpectation));

		await oSyncPromise; // no need to check result, it's defined by aElements way above
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#addKeptElement", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate")
			.returns("('foo')");

		// code under test
		oCache.addKeptElement(oElement);

		assert.strictEqual(oCache.aElements.$byPredicate["('foo')"], oElement);
		assert.notOk(oCache.aElements.includes(oElement));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#removeKeptElement", function (assert) {
		var oCache = this.createCache("Employees");

		oCache.aElements.$byPredicate = {
			"('foo')" : "~foo~",
			"('bar')" : "~bar~"
		};
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();

		// code under test
		oCache.removeKeptElement("('foo')");

		assert.deepEqual(oCache.aElements.$byPredicate, {"('bar')" : "~bar~"});
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#doReplaceWith: no old element", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {};

		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("hasPrivateAnnotation").never();
		this.mock(_Helper).expects("getPrivateAnnotation").never();
		this.mock(_Helper).expects("setPrivateAnnotation").never();
		this.mock(oCache).expects("addKeptElement").withExactArgs(sinon.match.same(oElement));

		// code under test
		oCache.doReplaceWith(23, oElement);

		assert.strictEqual(oCache.aElements[23], oElement);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#doReplaceWith: old not created", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {},
			oOldElement = {};

		oCache.aElements[23] = oOldElement;
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(_Helper).expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oOldElement), "transientPredicate").returns(false);
		this.mock(_Helper).expects("getPrivateAnnotation").never();
		this.mock(_Helper).expects("setPrivateAnnotation").never();
		this.mock(oCache).expects("addKeptElement").withExactArgs(sinon.match.same(oElement));

		// code under test
		oCache.doReplaceWith(23, oElement);

		assert.strictEqual(oCache.aElements[23], oElement);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#doReplaceWith: transientPredicate", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {},
			oHelperMock = this.mock(_Helper),
			oOldElement = {};

		oCache.aElements[23] = oOldElement;
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oOldElement), "transientPredicate").returns(true);
		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "transientPredicate").returns(false);
		oHelperMock.expects("getPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "predicate").returns("~predicate~");
		oHelperMock.expects("setPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "transientPredicate", "~predicate~");
		this.mock(oCache).expects("addKeptElement").withExactArgs(sinon.match.same(oElement));

		// code under test
		oCache.doReplaceWith(23, oElement);

		assert.strictEqual(oCache.aElements[23], oElement);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#doReplaceWith: do not overwrite", function (assert) {
		var oCache = this.createCache("Employees"),
			oElement = {},
			oHelperMock = this.mock(_Helper),
			oOldElement = {};

		oCache.aElements[23] = oOldElement;
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oOldElement), "transientPredicate").returns(true);
		oHelperMock.expects("hasPrivateAnnotation")
			.withExactArgs(sinon.match.same(oElement), "transientPredicate").returns(true);
		oHelperMock.expects("getPrivateAnnotation").never();
		oHelperMock.expects("setPrivateAnnotation").never();
		this.mock(oCache).expects("addKeptElement").withExactArgs(sinon.match.same(oElement));

		// code under test
		oCache.doReplaceWith(23, oElement);

		assert.strictEqual(oCache.aElements[23], oElement);
	});

	//*********************************************************************************************
[undefined, "($uid=id-1-23)"].forEach((sTransientPredicate) => {
	[undefined, true].forEach((bIndexIsSkip) => {
	QUnit.test(`CollectionCache#drop, ${sTransientPredicate}, ${bIndexIsSkip}`, function (assert) {
		const oCache = this.createCache("Employees");
		oCache.aElements[23] = "~b~";
		oCache.aElements.$byPredicate = {
			"('a')" : "~a~",
			"('b')" : "~b~",
			"('c')" : "~c~"
		};
		oCache.aElements.$created = 7;
		oCache.iActiveElements = 5;
		oCache.iLimit = 42;
		if (sTransientPredicate) {
			oCache.aElements.$byPredicate[sTransientPredicate] = "~b~";
		}
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs("~b~", "transientPredicate").returns(sTransientPredicate);

		// code under test
		oCache.drop(bIndexIsSkip ? 23 - 7 : 23, "('b')", bIndexIsSkip);

		assert.strictEqual(23 in oCache.aElements, false);
		assert.strictEqual("('b')" in oCache.aElements.$byPredicate, false);
		assert.deepEqual(oCache.aElements.$byPredicate, {
			"('a')" : "~a~",
			"('c')" : "~c~"
		});
		assert.strictEqual(oCache.aElements.$created, sTransientPredicate ? 6 : 7);
		assert.strictEqual(oCache.iActiveElements, sTransientPredicate ? 4 : 5);
		assert.strictEqual(oCache.iLimit, sTransientPredicate ? 43 : 42);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("CollectionCache#drop: Must not drop a transient element", function (assert) {
		const oCache = this.createCache("Employees");
		oCache.aElements[23] = {"@$ui5.context.isTransient" : true};
		this.mock(_Helper).expects("getPrivateAnnotation").never();

		assert.throws(function () {
			// code under test
			oCache.drop(23, "n/a");
		}, new Error("Must not drop a transient element"));
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#setPersistedCollection", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "SalesOrders"),
			aElements = [{}, {}, {}];

		aElements.$created = 3;

		// code under test
		oCache.setPersistedCollection(aElements);

		assert.strictEqual(oCache.aElements, aElements);
		assert.strictEqual(oCache.iActiveElements, 3);
		assert.strictEqual(oCache.iLimit, 3);
	});

	//*********************************************************************************************
	QUnit.test("CollectionCache#isMissing", function (assert) {
		const oCache = _Cache.create(this.oRequestor, "SalesOrders");

		oCache.aElements = [{}];

		// code under test
		assert.notOk(oCache.isMissing(0));
		assert.ok(oCache.isMissing(1));

		oCache.$tail = Promise.resolve();
		oCache.aReadRequests = [{iStart : 5, iEnd : 8}, {iStart : 20, iEnd : 10000}];

		// code under test
		assert.notOk(oCache.isMissing(0));
		assert.ok(oCache.isMissing(4));
		assert.notOk(oCache.isMissing(5));
		assert.notOk(oCache.isMissing(7));
		assert.ok(oCache.isMissing(8));
		assert.ok(oCache.isMissing(19));
		assert.notOk(oCache.isMissing(20));
		assert.notOk(oCache.isMissing(9999));
		assert.ok(oCache.isMissing(10000));
	});

	//*********************************************************************************************
	QUnit.test("from$skip", function (assert) {
		var aCollection = [];

		// code under test - initial data of a create
		assert.strictEqual(_Cache.from$skip("1", aCollection), 1);

		// This is always set in aElements and in response data (from visitResponse)
		aCollection.$created = 3;

		// code under test
		assert.strictEqual(_Cache.from$skip("1", aCollection), 4);

		// code under test
		assert.strictEqual(_Cache.from$skip("1a"), "1a");
	});

	//*********************************************************************************************
	QUnit.test("getElementIndex", function (assert) {
		var sKeyPredicate = "(~)",
			oElement = {"@$ui5._" : {predicate : sKeyPredicate}},
			aElements = [{}, oElement];

		aElements.$byPredicate = {};
		aElements.$byPredicate[sKeyPredicate] = oElement;

		assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 0), 1);
		assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 1), 1);
		assert.strictEqual(_Cache.getElementIndex(aElements, sKeyPredicate, 2), 1);
	});
	// Q: What about the -1? Example: While a _delete for an entity is underway, a
	//  requestSideEffects is performed. If additionally the deleted row is not in the table's
	//  visible area (which only can happen for the grid table), requestSideEffects clears the cache
	//  data for this row, removeElement gets -1 and fails. replaceElement could simply ignore it.
	//  Use aReadRequests and adjustIndexes instead?
	// A: requestSideEffects now waits for pending DELETE and POST requests :-)

	//*********************************************************************************************
[false, true].forEach(function (bExists) {
	QUnit.test("create: bSharedRequest, created, bExists=" + bExists, function (assert) {
		var oCache;

		if (bExists) {
			this.oRequestor.$mSharedCollectionCacheByPath = {foo : "anotherCache"};
		}
		this.mock(_Helper).expects("getMetaPath").twice() // from _Cache.create and the constructor
			.withExactArgs("/resource/path").returns("/resource/metapath");
		this.oRequestorMock.expects("buildQueryString").twice()
			.withExactArgs("/resource/metapath", "mQueryOptions", false, "bSortExpandSelect")
			.returns("?~");

		// code under test
		oCache = _Cache.create(this.oRequestor, "resource/path", "mQueryOptions",
			"bSortExpandSelect", "deep/resource/path", true);

		assert.ok(oCache instanceof _Cache);
		assert.strictEqual(oCache.iActiveUsages, 1);
		assert.strictEqual(oCache.bSharedRequest, true);
		assert.strictEqual(this.oRequestor.$mSharedCollectionCacheByPath["resource/path?~"],
			oCache);
		if (bExists) {
			assert.strictEqual(this.oRequestor.$mSharedCollectionCacheByPath.foo, "anotherCache");
		}
	});
});

	//*********************************************************************************************
	QUnit.test("create: bSharedRequest, shared", function (assert) {
		var oCache = {
				setActive : function () {}
			};

		this.oRequestor.$mSharedCollectionCacheByPath = {
			"resource/path?~" : oCache
		};
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/resource/path")
			.returns("/resource/metapath");
		this.oRequestorMock.expects("buildQueryString")
			.withExactArgs("/resource/metapath", "mQueryOptions", false, "bSortExpandSelect")
			.returns("?~");
		this.mock(oCache).expects("setActive").withExactArgs(true);

		// code under test
		assert.strictEqual(
			_Cache.create(this.oRequestor, "resource/path", "mQueryOptions", "bSortExpandSelect",
				"deep/resource/path", true),
			oCache);
	});

	//*********************************************************************************************
	QUnit.test("create: bSharedRequest, cache size", function (assert) {
		var mSharedCollectionCacheByPath,
			iTimerValue = 0,
			i;

		// avoid that two caches get the same iInactiveSince so that we get a well-defined LRU order
		this.stub(Date, "now").callsFake(function () {
			iTimerValue += 1;
			return iTimerValue;
		});

		// the first cache is inactive, but remains until the limit is reached
		_Cache.create(this.oRequestor, "/0", {}, false, undefined, true).setActive(false);
		for (i = 1; i <= 100; i += 1) {
			_Cache.create(this.oRequestor, "/" + i, {}, false, undefined, true);
		}
		mSharedCollectionCacheByPath = this.oRequestor.$mSharedCollectionCacheByPath;
		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
		assert.ok("/0" in this.oRequestor.$mSharedCollectionCacheByPath);

		// code under test - one inactive cache while another one is reused
		_Cache.create(this.oRequestor, "/42", {}, false, undefined, true);

		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101,
			"no change when reusing a cache");

		// code under test
		_Cache.create(this.oRequestor, "/102", {}, false, undefined, true);

		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101,
			"one added, one removed");
		assert.notOk("/0" in mSharedCollectionCacheByPath);

		// code under test
		_Cache.create(this.oRequestor, "/0", {}, false, undefined, true);

		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 102,
			"all caches active, nothing removed");

		mSharedCollectionCacheByPath["/10"].setActive(false);
		mSharedCollectionCacheByPath["/20"].setActive(false);
		mSharedCollectionCacheByPath["/30"].setActive(false);
		mSharedCollectionCacheByPath["/0"].setActive(false);
		_Cache.create(this.oRequestor, "/103", {}, false, undefined, true);

		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
		assert.ok("/0" in this.oRequestor.$mSharedCollectionCacheByPath);
		assert.notOk("/10" in this.oRequestor.$mSharedCollectionCacheByPath);
		assert.notOk("/20" in this.oRequestor.$mSharedCollectionCacheByPath);
		assert.ok("/30" in this.oRequestor.$mSharedCollectionCacheByPath);

		// code under test
		_Cache.create(this.oRequestor, "/104", {}, false, undefined, true);

		assert.strictEqual(Object.keys(mSharedCollectionCacheByPath).length, 101);
		assert.notOk("/30" in mSharedCollectionCacheByPath);
	});

	//*********************************************************************************************
[{
	sTitle : "refreshKeptElements with one kept context",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {key : "Foo", "@$ui5._" : {predicate : "('Foo')"}}
	},
	sFilter : "~Foo~"
}, {
	sTitle : "refreshKeptElements with three kept contexts, two w/ and one w/o key property",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {key : "Foo", "@$ui5._" : {predicate : "('Foo')"}},
		"('Bar')" : {key : "Bar", "@$ui5._" : {predicate : "('Bar')"}},
		"('Baz')" : {"@$ui5._" : {predicate : "('Baz')"}}
	},
	sFilter : "~Bar~ or ~Foo~",
	iTop : 2
}, {
	sTitle : "refreshKeptElements with one kept context; after refresh kept element is deleted",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {bDeleted : true, key : "Foo", "@$ui5._" : {predicate : "('Foo')"}}
	},
	sFilter : "~Foo~"
}, {
	sTitle : "refreshKeptElements with two kept contexts;"
		+ " after refresh one kept element is deleted",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {bDeleted : true, key : "Foo", "@$ui5._" : {predicate : "('Foo')"}},
		"('Bar')" : {key : "Bar", "@$ui5._" : {predicate : "('Bar')"}}
	},
	sFilter : "~Bar~ or ~Foo~",
	iTop : 2
}, {
	sTitle : "refreshKeptElements with two kept contexts;"
		+ " after refresh all kept elements are deleted",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {bDeleted : true, key : "Foo", "@$ui5._" : {predicate : "('Foo')"}},
		"('Bar')" : {bDeleted : true, key : "Bar", "@$ui5._" : {predicate : "('Bar')"}}
	},
	sFilter : "~Bar~ or ~Foo~",
	iTop : 2
}, {
	sTitle : "transient predicates need to be ignored",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {key : "Foo", "@$ui5._" : {predicate : "('Foo')"}},
		"($uid=id-1-23)" : {"@$ui5._" : {transientPredicate : "($uid=id-1-23)"}},
		"('Bar')" : {
			key : "Bar",
			"@$ui5._" : {predicate : "('Bar')", transientPredicate : "($uid=id-1-00)"}
		},
		"($uid=id-1-00)" : {
			"@$ui5._" : {predicate : "('Bar')", transientPredicate : "($uid=id-1-00)"}
		},
		"($uid=id-1-42)" : {"@$ui5._" : {transientPredicate : "($uid=id-1-42)"}}
	},
	sFilter : "~Bar~ or ~Foo~",
	iTop : 2
}, {
	sTitle : "kept-alive elements w/ changes need to be ignored",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {key : "Foo", "@$ui5._" : {predicate : "('Foo')"}},
		"('Bar')" : {key : "Bar", "@$ui5._" : {predicate : "('Bar')"}},
		"('Baz')" : {bChanges : true, "@$ui5._" : {predicate : "('Baz')"}}
	},
	sFilter : "~Bar~ or ~Foo~",
	iTop : 2
}, {
	bDropApply : true,
	sTitle : "a created element is deleted",
	mKeptAliveElementsByPredicate : {
		"('Foo')" : {
			bDeleted : true,
			key : "Foo",
			"@$ui5._" : {predicate : "('Foo')", transientPredicate : "($uid=id-1-23)"}
		}
	},
	sFilter : "~Foo~"
}].forEach(function (oFixture) {
	QUnit.test(oFixture.sTitle, function (assert) {
		var mByPredicate = {},
			oCache = _Cache.create(this.oRequestor, "Employees", {}),
			oCacheMock = this.mock(oCache),
			oGroupLock = {},
			bHasLateQueryOptions = "iTop" in oFixture, // just to have some variance
			oHelperMock = this.mock(_Helper),
			mLateQueryOptions = {},
			mQueryOptionsCopy = {
				$apply : "A.P.P.L.E.",
				$count : true,
				$orderby : "~orderby~",
				$search : "~search~"
			},
			fnOnRemove = sinon.spy(),
			oResponse = {
				value : []
			},
			mTypes = {};

		oCache.mLateQueryOptions = bHasLateQueryOptions ? mLateQueryOptions : undefined;
		oHelperMock.expects("updateAll").never(); // except... see below
		oCacheMock.expects("removeElement").never(); // except... see below
		Object.keys(oFixture.mKeptAliveElementsByPredicate).forEach(function (sPredicate) {
			var oElement = oFixture.mKeptAliveElementsByPredicate[sPredicate];

			oCache.aElements.$byPredicate[sPredicate] = oElement;

			oCacheMock.expects("hasPendingChangesForPath")
				.exactly("key" in oElement || oElement.bChanges ? 1 : 0)
				.withExactArgs(sPredicate, "~bIgnorePendingChanges~")
				.returns(oElement.bChanges);
			oHelperMock.expects("getKeyFilter").exactly("key" in oElement ? 1 : 0)
				.withExactArgs(sinon.match.same(oElement), oCache.sMetaPath,
					sinon.match.same(mTypes))
				.returns("~" + oElement.key + "~");

			if (!oElement.bDeleted && "key" in oElement) {
				// this is only needed in case the kept entity is still available after refresh
				oResponse.value.push(oElement);
				mByPredicate[sPredicate] = oElement;

				oHelperMock.expects("updateAll")
					.withExactArgs(sinon.match.same(oCache.mChangeListeners), sPredicate,
						sinon.match.same(oElement), sinon.match.same(oElement));
			}
			if (oElement.bDeleted && "transientPredicate" in oElement["@$ui5._"]) {
				oCacheMock.expects("removeElement")
					.withExactArgs(-1, sPredicate)
					.returns(42);
			}
		});

		// calculateKeptElementQuery
		oHelperMock.expects("clone").withExactArgs(sinon.match.same(oCache.mQueryOptions))
			.returns(mQueryOptionsCopy);
		oHelperMock.expects("aggregateExpandSelect").exactly(bHasLateQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(mQueryOptionsCopy),
				sinon.match.same(oCache.mLateQueryOptions));
		this.mock(oCache.oRequestor).expects("buildQueryString")
			.withExactArgs(oCache.sMetaPath, sinon.match(function (oValue) {
				return oValue === mQueryOptionsCopy
					&& oValue.$filter === oFixture.sFilter
					&& "$top" in oValue === "iTop" in oFixture
					&& oValue.$top === oFixture.iTop
					&& (oFixture.bDropApply
					? !("$apply" in oValue)
					: oValue.$apply === "A.P.P.L.E.") // not dropped
					&& !("$count" in oValue)
					&& !("$orderby" in oValue)
					&& !("$search" in oValue);
			}), /*bDropSystemQueryOptions*/ false, /*bSortExpandSelect*/ true)
			.returns("?$filter=" + oFixture.sFilter);

		// refreshKeptElements
		oCacheMock.expects("checkSharedRequest").withExactArgs();
		oCacheMock.expects("getTypes").returns(mTypes);
		this.mock(this.oRequestor).expects("request")
			.withExactArgs("GET", "Employees?$filter=" + oFixture.sFilter,
				sinon.match.same(oGroupLock))
			.returns(Promise.resolve(oResponse));
		oCacheMock.expects("visitResponse")
			.withExactArgs(sinon.match.same(oResponse), sinon.match.same(mTypes), undefined,
				undefined, 0)
			.callsFake(function () {
				if (Object.keys(mByPredicate).length > 0) {
					oResponse.value.$byPredicate = mByPredicate;
				}
			});

		// code under test
		return oCache.refreshKeptElements(oGroupLock, fnOnRemove, oFixture.bDropApply,
			"~bIgnorePendingChanges~")
		.then(function (oResult) {
			var mByPredicateAfterRefresh = {},
				iCallCount = 0;

			assert.deepEqual(oResult, undefined);
			Object.keys(oFixture.mKeptAliveElementsByPredicate).forEach(function (sPredicate) {
				var oElement = oFixture.mKeptAliveElementsByPredicate[sPredicate],
					bCreated = "transientPredicate" in oElement["@$ui5._"];

				if (!oElement.bDeleted || bCreated) {
					mByPredicateAfterRefresh[sPredicate] = oElement;
				}
				if (oElement.bDeleted) {
					iCallCount += 1;
					sinon.assert.calledWithExactly(fnOnRemove, sPredicate,
						bCreated ? 42 : undefined);
				}
			});
			sinon.assert.callCount(fnOnRemove, iCallCount);
			assert.deepEqual(oCache.aElements.$byPredicate, mByPredicateAfterRefresh);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshKeptElements w/ deleteted element", function (assert) {
		const oCache = _Cache.create(this.oRequestor, "Employees", {});

		oCache.aElements.$byPredicate["('Foo')"] = {
			"@$ui5.context.isDeleted" : true,
			"@$ui5._" : {predicate : "('Foo')"}
		};

		this.mock(oCache).expects("hasPendingChangesForPath").never();
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache).expects("getTypes").never();
		this.mock(oCache.oRequestor).expects("request").never();

		// code under test
		assert.strictEqual(oCache.refreshKeptElements({/*GroupLock*/}, {/*fnOnRemove*/}),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("refreshKeptElements w/o kept-alive element", function (assert) {
		var oCache = _Cache.create(this.oRequestor, "Employees", {});

		this.mock(oCache).expects("getTypes").never();
		this.mock(oCache).expects("checkSharedRequest").withExactArgs();
		this.mock(oCache.oRequestor).expects("request").never();

		// code under test
		assert.strictEqual(oCache.refreshKeptElements({/*GroupLock*/}, {/*fnOnRemove*/}),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("getCreatedElements", function (assert) {
		var oCache = new _Cache(this.oRequestor, "Employees"),
			oCacheMock = this.mock(oCache),
			aCollection = ["a", "b", "c"],
			aReturnedCollection;

		oCacheMock.expects("getValue").withExactArgs("~some/path~").returns(undefined);

		// code under test
		assert.deepEqual(oCache.getCreatedElements("~some/path~"), []);

		aCollection.$created = 2;
		oCacheMock.expects("getValue").withExactArgs("~some/path~").returns(aCollection);

		// code under test
		aReturnedCollection = oCache.getCreatedElements("~some/path~");

		assert.deepEqual(aCollection, ["a", "b", "c"], "unchanged");
		assert.deepEqual(aReturnedCollection, ["a", "b"]);
	});

	//*********************************************************************************************
	QUnit.test("_Cache#createProperty: _SingletonPropertyCache", function (assert) {
		var oCache,
			oOtherQueryOptions = {custom : "other"},
			oQueryOptions = {custom : "query"},
			oSingleton0,
			oSingleton1;

		assert.strictEqual(this.oRequestor.$mSingletonCacheByPath, undefined);

		// code under test
		oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo/bar/baz", oQueryOptions);

		oSingleton0 = oCache.oSingleton;
		assert.ok(oCache instanceof _Cache);
		assert.ok(oSingleton0 instanceof _Cache);
		assert.strictEqual(oCache.sRelativePath, "foo/bar/baz");
		assert.deepEqual(oCache.mQueryOptions, {});
		assert.strictEqual(oSingleton0.mQueryOptions, oQueryOptions);
		assert.deepEqual(oSingleton0.oPromise.getResult(), {});
		assert.strictEqual(this.oRequestor.$mSingletonCacheByPath['Singleton{"custom":"query"}']
			, oSingleton0);

		// code under test (same singleton, other property, equal query options)
		oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo/bar/bas",
			{custom : "query"});

		oSingleton1 = oCache.oSingleton;
		assert.strictEqual(oCache.sRelativePath, "foo/bar/bas");
		assert.strictEqual(oSingleton1.mQueryOptions, oQueryOptions);
		assert.strictEqual(oSingleton1, oSingleton0);
		assert.strictEqual(this.oRequestor.$mSingletonCacheByPath['Singleton{"custom":"query"}']
			, oSingleton0);
		assert.deepEqual(oCache.mQueryOptions, {});

		// code under test (same singleton, same property, other query options)
		oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo/bar/baz",
			oOtherQueryOptions);

		oSingleton1 = oCache.oSingleton;
		assert.strictEqual(oCache.sRelativePath, "foo/bar/baz");
		assert.deepEqual(oCache.mQueryOptions, {});
		assert.notStrictEqual(oSingleton1, oSingleton0);
		assert.strictEqual(this.oRequestor.$mSingletonCacheByPath['Singleton{"custom":"query"}']
			, oSingleton0);
		assert.strictEqual(this.oRequestor.$mSingletonCacheByPath['Singleton{"custom":"other"}']
			, oSingleton1);
		assert.strictEqual(oCache.oSingleton.mQueryOptions, oOtherQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("_SingletonPropertyCache#reset", function () {
		var oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo/bar/baz");

		this.mock(oCache.oSingleton).expects("resetProperty").withExactArgs("foo/bar/baz");

		// code under test
		oCache.reset();
	});

	//*********************************************************************************************
[{
	oData : undefined,
	sPath : "foo",
	oResult : undefined
}, {
	oData : {},
	sPath : "foo/bar",
	oResult : {}
}, {
	oData : {
		"@odata.etag" : "etag",
		foo0 : "foo0",
		foo : "foo",
		foo2 : "foo1"
	},
	sPath : "foo",
	oResult : {
		foo0 : "foo0",
		foo2 : "foo1"
	}
}, {
	oData : {
		foo : {
			"@odata.etag" : "etag",
			bar : {
				"@odata.etag" : "etag",
				baz : "baz",
				baz1 : "baz1"
			},
			bar1 : "bar1"
		}
	},
	sPath : "foo/bar/baz",
	oResult : {
		foo : {
			bar : {
				baz1 : "baz1"
			},
			bar1 : "bar1"
		}
	}
}].forEach(function (oFixture) {
	QUnit.test("_SingleCache#resetProperty: sPath: " + oFixture.sPath, function (assert) {
		var oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo/bar/baz");

		oCache.oSingleton.oPromise = SyncPromise.resolve(oFixture.oData);

		// code under test
		oCache.oSingleton.resetProperty(oFixture.sPath);

		assert.deepEqual(oCache.oSingleton.getValue(""), oFixture.oResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_SingletonPropertyCache#fetchValue", function (assert) {
		var oCache,
			oHelperMock = this.mock(_Helper),
			aPromises = [],
			oSingletonMock;

		oCache = _Cache.createProperty(this.oRequestor, "Singleton/foo");
		oSingletonMock = this.mock(oCache.oSingleton);

		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Singleton/foo")
			.returns(SyncPromise.resolve({$kind : "Property", $Type : "Edm.String"}));
		oSingletonMock.expects("getLateQueryOptions")
			.returns(null);
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Singleton", "foo", {},
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata))
			.returns("~wrappedChildQueryOptions~");
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs(sinon.match.object, "~wrappedChildQueryOptions~");
		oSingletonMock.expects("setLateQueryOptions")
			.withExactArgs(sinon.match.object);
		oSingletonMock.expects("fetchValue")
			.withExactArgs("~groupLock~", "foo", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~")
			.resolves("~fooResult~");

		// code under test (first property for singleton, getLateQueryOptions returns null)
		aPromises.push(oCache.fetchValue("~groupLock~", "n/a", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~").then(function (oResult) {
				assert.strictEqual(oResult, "~fooResult~");
		}));

		oCache = _Cache.createProperty(this.oRequestor, "Singleton/bar");

		this.oModelInterfaceMock.expects("fetchMetadata")
			.withExactArgs("/Singleton/bar")
			.returns(SyncPromise.resolve({$kind : "Property", $Type : "Edm.String"}));
		oSingletonMock.expects("getLateQueryOptions")
			.returns("~mLateQueryOptions~");
		oHelperMock.expects("wrapChildQueryOptions")
			.withExactArgs("/Singleton", "bar", {},
				sinon.match.same(this.oRequestor.getModelInterface().fetchMetadata))
			.returns("~wrappedChildQueryOptions~");
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs("~mLateQueryOptions~", "~wrappedChildQueryOptions~");
		oSingletonMock.expects("setLateQueryOptions")
			.withExactArgs("~mLateQueryOptions~");
		oSingletonMock.expects("fetchValue")
			.withExactArgs("~groupLock~", "bar", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~")
			.resolves("~barResult0~");

		// code under test
		aPromises.push(oCache.fetchValue("~groupLock~", "n/a", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~").then(function (oResult) {
				assert.strictEqual(oResult, "~barResult0~");
		}));

		oSingletonMock.expects("fetchValue")
			.withExactArgs("~groupLock~", "bar", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~")
			.resolves("~barResult1~");

		// code under test (add $select to mLateQueryOptions only once)
		aPromises.push(oCache.fetchValue("~groupLock~", "n/a", "~fnDataRequested~", "~oListener~",
			"~bCreateOnDemand~").then(function (oResult) {
				assert.strictEqual(oResult, "~barResult1~");
		}));

		return Promise.all(aPromises);
	});
});
//TODO: resetCache if error in update?
// TODO we cannot update a single property with value null, because the read delivers "204 No
//      Content" and no oResult. -Hence we do not have the ETag et al.- We use the ETag header now!
//TODO key predicate calculation in the result of operations?
