/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise"
], function (jQuery, _ODataHelper, _Cache, _Helper, _SyncPromise) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0, max-nested-callbacks: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._ODataHelper", {
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
	[
		["/canonical1", undefined], //set context
		[undefined, "foo eq 42"], //set filter
		["/canonical2", "foo eq 42"] //set context and filter
	].forEach(function (oFixture) {
		QUnit.test("createCache: proxy interface, " + oFixture[0] + ", " + oFixture[1],
			function (assert) {
				var oBinding = {},
					oFilterPromise = oFixture[1] && Promise.resolve(oFixture[1]),
					oPathPromise = oFixture[0] && Promise.resolve(oFixture[0]),
					oCache = {
						read : function () {}
					},
					oCacheProxy,
					oReadResult = {};

				function createCache(sPath, sFilter) {
					assert.strictEqual(sPath, oFixture[0]);
					assert.strictEqual(sFilter, oFixture[1]);
					return oCache;
				}

				this.mock(oCache).expects("read").withExactArgs("$auto", "foo")
					.returns(Promise.resolve(oReadResult));

				// code under test
				oCacheProxy = _ODataHelper.createCache(oBinding, createCache, oPathPromise,
					oFilterPromise);

				assert.strictEqual(oCacheProxy.hasPendingChanges(), false);
				assert.strictEqual(typeof oCacheProxy.resetChanges, "function");
				assert.strictEqual(typeof oCacheProxy.setActive, "function");
				assert.throws(function () {
					oCacheProxy.post();
				}, "POST request not allowed");
				assert.throws(function () {
					oCacheProxy.update();
				}, "PATCH request not allowed");

				return oCacheProxy.read("$auto", "foo").then(function (oResult) {
					assert.strictEqual(oBinding.oCache, oCache);
					assert.strictEqual(oCache.$canonicalPath, oFixture[0]);
					assert.strictEqual(oResult, oReadResult);
				});
			});
	});

	//*********************************************************************************************
	QUnit.test("createCache: deactivates previous cache", function (assert) {
		var oBinding = {};

		// code under test
		_ODataHelper.createCache(oBinding, function () {});

		oBinding.oCache = { setActive : function () {} };
		this.mock(oBinding.oCache).expects("setActive").withExactArgs(false);

		// code under test
		_ODataHelper.createCache(oBinding, function () {});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, async", function (assert) {
		var oBinding = {},
			oCache = {
				setActive : function () {},
				read : function () { return Promise.resolve({}); }
			},
			oCacheMock = this.mock(oCache),
			oPathPromise = Promise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		return oBinding.oCache.read().then(function () {
			assert.strictEqual(oBinding.oCache, oCache);

			oCacheMock.expects("setActive").withExactArgs(false);
			oCacheMock.expects("setActive").withExactArgs(true);
			// code under test
			_ODataHelper.createCache(oBinding, createCache, oPathPromise);

			return oBinding.oCache.read().then(function () {
				assert.strictEqual(oBinding.oCache, oCache);
				assert.strictEqual(createCache.callCount, 1);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: use same cache for same path, sync", function (assert) {
		var oBinding = {},
			oCache = {setActive : function () {}},
			oCacheMock = this.mock(oCache),
			oPathPromise = _SyncPromise.resolve("p"),
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);

		oCacheMock.expects("setActive").withExactArgs(false);
		oCacheMock.expects("setActive").withExactArgs(true);

		// code under test
		_ODataHelper.createCache(oBinding, createCache, oPathPromise);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(createCache.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCache: create new cache for empty canonical path", function (assert) {
		var oBinding = {},
			oCache = {setActive : function () {}},
			createCache = this.spy(function () { return oCache; });

		// code under test
		_ODataHelper.createCache(oBinding, createCache, undefined);

		// code under test
		_ODataHelper.createCache(oBinding, createCache, undefined);

		assert.strictEqual(createCache.callCount, 2);
	});

	//*********************************************************************************************
	QUnit.test("createCache: cache proxy !== binding's cache", function (assert) {
		var oBinding = {},
			oCache = {read : function () {}},
			oPromise,
			oReadResult = {};

		this.mock(oCache).expects("read").returns(Promise.resolve(oReadResult));

		// create a binding asynchronously and read from it
		_ODataHelper.createCache(oBinding, function () {
			return {/*cache*/};
		}, Promise.resolve("Employees('42')"));
		oPromise = oBinding.oCache.read();

		// create a binding synchronously afterwards (overtakes the first one, but must win)
		_ODataHelper.createCache(oBinding, function () {
			return oCache;
		});

		assert.strictEqual(oBinding.oCache, oCache);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oBinding.oCache, oCache);
			assert.strictEqual(oResult, oReadResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchCanonicalPath fails", function (assert) {
		var oBinding = {
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			},
			oError = new Error("canonical path failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4._ODataHelper", sinon.match.same(oError));

		// code under test
		_ODataHelper.createCache(oBinding, unexpected, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCache: fetchFilter fails", function (assert) {
		var oBinding = {
				oModel : {
					reportError : function () {}
				},
				toString : function () {return "MyBinding";}
			},
			oError = new Error("request filter failure");

		function unexpected () {
			assert.ok(false, "unexpected call");
		}

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding",
				"sap.ui.model.odata.v4._ODataHelper", sinon.match.same(oError));

		// code under test
		_ODataHelper.createCache(oBinding, unexpected, undefined, Promise.reject(oError));

		// code under test
		return oBinding.oCache.read("$auto", "foo").catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	[
		{mQueryOptions : undefined, sPath : "foo", sQueryPath : "delegate/to/context"},
		{mQueryOptions : undefined, sPath : "foo", sQueryPath : undefined}
	].forEach(function (oFixture, i) {
		QUnit.test("getQueryOptions - delegating - " + i, function (assert) {
			var oBinding = {
					mQueryOptions : oFixture.mQueryOptions,
					sPath : oFixture.sPath
				},
				oContext = {
					getQueryOptions : function () {}
				},
				mResultingQueryOptions = {},
				sResultPath = "any/path";

			this.mock(_Helper).expects("buildPath")
				.withExactArgs(oBinding.sPath, oFixture.sQueryPath).returns(sResultPath);
			this.mock(oContext).expects("getQueryOptions")
				.withExactArgs(sResultPath)
				.returns(mResultingQueryOptions);

			// code under test
			assert.strictEqual(
				_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath, oContext),
				mResultingQueryOptions, "sQueryPath:" + oFixture.sQueryPath);

			// code under test
			assert.strictEqual(
				_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath, undefined),
				undefined, "no query options and no context");
		});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions ignores base context", function (assert) {
		var oBaseContext = {},
			oBinding = {
				mQueryOptions : undefined,
				sPath : "foo"
			};


		// code under test
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, "", oBaseContext), undefined,
			"no query options and base context ignored");
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions - query options and no path", function (assert) {
		var oBinding = {
				mQueryOptions : {}
			},
			oContext = {
				getQueryOptions : function () {}
			};

		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("getQueryOptions").never();

		// code under test
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding), oBinding.mQueryOptions,
			oContext);
		assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, ""), oBinding.mQueryOptions,
			oContext);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions - find in query options", function (assert) {
		var mEmployee2EquipmentOptions = {
				$orderby : "EquipmentId"
			},
			mTeam2EmployeeOptions = {
				"$expand" : {
					"Employee_2_Equipment" : mEmployee2EquipmentOptions
				},
				$orderby : "EmployeeId"
			},
			mParameters = {
				"$expand" : {
					"Team_2_Employees" : mTeam2EmployeeOptions,
					"Team_2_Manager" : null,
					"Team_2_Equipments" : true
				},
				"$orderby" : "TeamId",
				"sap-client" : "111"
			},
			oBinding = {
				oModel : {
					buildQueryOptions : function () {},
					mUriParameters : {"sap-client" : "111"}
				},
				mQueryOptions : mParameters,
				sPath : "any/path"
			},
			oContext = {
				getQueryOptions : function () {}
			},
			oModelMock = this.mock(oBinding.oModel),
			mResultingQueryOptions = {}; // content not relevant

		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("getQueryOptions").never();

		[
			{sQueryPath : "foo", mResult : undefined},
			{sQueryPath : "Team_2_Employees", mResult : mTeam2EmployeeOptions},
			{
				sQueryPath : "Team_2_Employees/Employee_2_Equipment",
				mResult : mEmployee2EquipmentOptions
			},
			{sQueryPath : "Team_2_Employees/Employee_2_Equipment/foo", mResult : undefined},
			{sQueryPath : "Team_2_Employees/foo/Employee_2_Equipment", mResult : undefined},
			{sQueryPath : "Team_2_Manager", mResult : undefined},
			{sQueryPath : "Team_2_Equipments", mResult : undefined},
			{
				sQueryPath : "Team_2_Employees(2)/Employee_2_Equipment('42')",
				mResult : mEmployee2EquipmentOptions
			},
			{
				sQueryPath : "15/Team_2_Employees/2/Employee_2_Equipment/42",
				mResult : mEmployee2EquipmentOptions
			}
		].forEach(function (oFixture, i) {
			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(oBinding.oModel.mUriParameters),
					oFixture.mResult ? sinon.match.same(oFixture.mResult) : undefined, true)
				.returns(mResultingQueryOptions);
			// code under test
			assert.strictEqual(_ODataHelper.getQueryOptions(oBinding, oFixture.sQueryPath),
				mResultingQueryOptions, "sQueryPath:" + oFixture.sQueryPath);
		});
	});
	//TODO handle encoding in getQueryOptions

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): with cache", function (assert) {
		var oBinding = {
				oCache : {
					hasPendingChanges : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oResult = {};

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("hasPendingChanges").withExactArgs(sPath).returns(oResult);

			assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, sPath), oResult,
				"path=" + sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): without cache", function (assert) {
		var oBinding = {
				sPath : "relative"
			},
			sBuildPath = "~/foo",
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper),
			oResult = {};

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, "foo"), false);
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, ""), false);

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("hasPendingChanges").withExactArgs(sBuildPath).returns(oResult);

			//code under test
			assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, undefined, sPath), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(sPath): without cache, base context", function (assert) {
		assert.strictEqual(
			_ODataHelper.hasPendingChanges({oContext : {}}, undefined, "foo"),
			false);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(bAskParent): with cache", function (assert) {
		var oChild1 = {},
			oChild2 = {},
			oBinding = {
				oCache : {
					hasPendingChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oHelperMock = this.mock(_ODataHelper),
			// remember the function, so that we can call it and nevertheless mock it to place
			// assertions on recursive calls
			fnHasPendingChanges = _ODataHelper.hasPendingChanges;

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(true);
			oHelperMock.expects("hasPendingChanges").never();

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), true,
				"cache returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild1), false)
				.returns(true);

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), true,
				"child1 returns true, bAskParent=" + bAskParent);

			oCacheMock.expects("hasPendingChanges").withExactArgs("").returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild1), false)
				.returns(false);
			oHelperMock.expects("hasPendingChanges").withExactArgs(sinon.match.same(oChild2), false)
				.returns(false);

			// code under test
			assert.strictEqual(fnHasPendingChanges(oBinding, bAskParent), false,
					"all return false, bAskParent=" + bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges(bAskParent): without cache", function (assert) {
		var oBinding = {
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oContext = {
				hasPendingChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oResult = {};

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, false), false);
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, true), false);

		oBinding.oContext = oContext;
		oContextMock.expects("hasPendingChanges").never();

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, false), false);

		oContextMock.expects("hasPendingChanges").withExactArgs(oBinding.sPath).returns(oResult);

		//code under test
		assert.strictEqual(_ODataHelper.hasPendingChanges(oBinding, true), oResult);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): with cache", function (assert) {
		var oBinding = {
				oCache : {
					resetChanges : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache);

		["foo", ""].forEach(function (sPath) {
			oCacheMock.expects("resetChanges").withExactArgs(sPath);

			_ODataHelper.resetChanges(oBinding, undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache", function (assert) {
		var oBinding = {
				sPath : "relative"
			},
			sBuildPath = "~/foo",
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext),
			oHelperMock = this.mock(_Helper);

		//code under test
		_ODataHelper.resetChanges(oBinding, undefined, "foo");
		_ODataHelper.resetChanges(oBinding, undefined, "");

		oBinding.oContext = oContext;
		["foo", ""].forEach(function (sPath) {
			oHelperMock.expects("buildPath").withExactArgs(oBinding.sPath, sPath)
				.returns(sBuildPath);
			oContextMock.expects("resetChanges").withExactArgs(sBuildPath);

			//code under test
			_ODataHelper.resetChanges(oBinding, undefined, sPath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(sPath): without cache, base context", function (assert) {
		_ODataHelper.resetChanges({oContext : {}}, undefined, "foo");
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): with cache", function (assert) {
		var oChild1 = {},
			oChild2 = {},
			oBinding = {
				oCache : {
					resetChanges : function () {}
				},
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oHelperMock = this.mock(_ODataHelper),
			// remember the function, so that we can call it and nevertheless mock it to place
			// assertions on recursive calls
			fnResetChanges = _ODataHelper.resetChanges;

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2]);
		[false, true].forEach(function (bAskParent) {
			oCacheMock.expects("resetChanges").withExactArgs("");
			oHelperMock.expects("resetChanges").withExactArgs(sinon.match.same(oChild1), false);
			oHelperMock.expects("resetChanges").withExactArgs(sinon.match.same(oChild2), false);

			// code under test
			fnResetChanges(oBinding, bAskParent);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache", function (assert) {
		var oBinding = {
				sPath : "relative",
				oModel : {
					getDependentBindings : function () {}
				}
			},
			oContext = {
				resetChanges : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getDependentBindings").atLeast(1)
			.withExactArgs(sinon.match.same(oBinding)).returns([]);

		//code under test
		_ODataHelper.resetChanges(oBinding, false);
		_ODataHelper.resetChanges(oBinding, true);

		oBinding.oContext = oContext;
		oContextMock.expects("resetChanges").never();

		//code under test
		_ODataHelper.resetChanges(oBinding, false);

		oContextMock.expects("resetChanges").withExactArgs(oBinding.sPath);

		//code under test
		_ODataHelper.resetChanges(oBinding, true);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges(bAskParent): without cache, base context", function (assert) {
		var oBinding = {
				oContext : {},
				oModel : {
					getDependentBindings : function () {
						return [];
					}
				}
			};

		//code under test
		_ODataHelper.resetChanges(oBinding, true);
	});

	//*********************************************************************************************
	QUnit.test("isRefreshable", function (assert) {
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : false}), true, "absolute");
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : true}), undefined,
			"relative - no context");
		assert.strictEqual(_ODataHelper.isRefreshable(
			{bRelative : true, oContext : {getBinding : function () {}}}), false,
			"relative - V4 context");
		assert.strictEqual(_ODataHelper.isRefreshable({bRelative : true, oContext : {}}), true,
			"relative - base context");
	});
});
