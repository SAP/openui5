/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataBinding"
], function (jQuery, SyncPromise, _Helper, Context, asODataBinding) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var sModuleName = "sap.ui.model.odata.v4.ODataBinding";

	/**
	 * Constructs a test object.
	 *
	 * @param {object} [oTemplate]
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataBinding(oTemplate) {
		jQuery.extend(this, oTemplate);
	}

	asODataBinding(ODataBinding.prototype);

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataBinding", {
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
	QUnit.test("getGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sGroupId : "foo"
			});

		assert.strictEqual(oBinding.getGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: relative, inherits group", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					getGroupId : function () {}
				},
				bRelative : true
			}),
			oContext = {
				getGroupId : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getGroupId").twice()
			.withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");

		oBinding.oContext = oContext;
		oContextMock.expects("getGroupId").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromModel");

		oContextMock.expects("getGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sUpdateGroupId : "foo"
			});

		assert.strictEqual(oBinding.getUpdateGroupId(), "foo");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: relative, inherits group", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					getUpdateGroupId : function () {}
				},
				bRelative : true
			}),
			oContext = {
				getUpdateGroupId : function () {}
			},
			oContextMock = this.mock(oContext);

		this.mock(oBinding.oModel).expects("getUpdateGroupId").twice()
			.withExactArgs().returns("fromModel");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oBinding.oContext = oContext;
		oContextMock.expects("getUpdateGroupId").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oContextMock.expects("getUpdateGroupId").withExactArgs().returns("fromContext");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromContext");
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = new ODataBinding();

		assert.throws(function () { //TODO implement
			oBinding.isInitial();
		}, new Error("Unsupported operation: isInitial"));

		assert.throws(function () { //TODO implement
			oBinding.resume();
		}, new Error("Unsupported operation: resume"));

		assert.throws(function () { //TODO implement
			oBinding.suspend();
		}, new Error("Unsupported operation: suspend"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: success", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				},
				refreshInternal : function () {}
			});

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("groupId", true);

		oBinding.refresh("groupId");
	});

	//*********************************************************************************************
	QUnit.test("refresh: not refreshable", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(false);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(true);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Cannot refresh due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: invalid group ID", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				}
			}),
			oError = new Error();

		this.mock(oBinding).expects("isRefreshable").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.refresh("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("isRefreshable", function (assert) {
		var oBinding = new ODataBinding({bRelative : false});
		assert.strictEqual(oBinding.isRefreshable(), true, "absolute");

		oBinding = new ODataBinding({bRelative : true});
		assert.strictEqual(oBinding.isRefreshable(), undefined, "relative - no context");

		oBinding = new ODataBinding({
			bRelative : true,
			oContext : {
				getBinding : function () {}
			}
		});
		assert.strictEqual(oBinding.isRefreshable(), false, "relative - V4 context");

		oBinding = new ODataBinding({
			bRelative : true,
			oContext : {}
		});
		assert.strictEqual(oBinding.isRefreshable(), true, "relative - base context");
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding),
			bResult = {/*some boolean*/};

		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), true);

		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oBindingMock.expects("hasPendingChangesInDependents").withExactArgs().returns(bResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), bResult);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bHasCache) {
		var sTitle = "hasPendingChangesForPath: cache is " + (bHasCache ? "" : "not yet ")
				+ "available";
		QUnit.test(sTitle, function (assert) {
			var oBinding = new ODataBinding(),
				oCache = {
					hasPendingChangesForPath : function () {}
				},
				oExpectation,
				sPath = "foo",
				bResult = {/*true or false*/},
				oPromise = SyncPromise.resolve(bHasCache ? bResult : Promise.resolve(bResult));

			oExpectation = this.mock(oBinding)
				.expects("withCache").withExactArgs(sinon.match.func, sPath).returns(oPromise);

			// code under test
			assert.strictEqual(oBinding.hasPendingChangesForPath(sPath),
				bHasCache ? bResult : false);

			// check that the function passed to withCache works as expected
			this.mock(oCache).expects("hasPendingChangesForPath").withExactArgs(sPath)
				.returns(bResult);
			assert.strictEqual(oExpectation.firstCall.args[0](oCache, sPath), bResult);

			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesForPath: catch the promise", function (assert) {
		var oBinding = new ODataBinding(),
			oError = new Error("fail intentionally");

		this.mock(oBinding).expects("withCache").returns(SyncPromise.reject(oError));
		this.oLogMock.expects("error").withExactArgs("Error in hasPendingChangesForPath", oError,
			sModuleName);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath("foo"), false);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInDependents", function (assert) {
		var oCache1 = {
				hasPendingChangesForPath : function () {}
			},
			oCache31 = {
				hasPendingChangesForPath : function () {}
			},
			oCache32 = {
				hasPendingChangesForPath : function () {}
			},
			oChild1 = new ODataBinding({
				oCachePromise : SyncPromise.resolve(oCache1)
			}),
			oChild2 = new ODataBinding({
				oCachePromise : SyncPromise.resolve()
			}),
			oChild3 = new ODataBinding({
				mCacheByContext : {
					"/Foo/1" : oCache31,
					"/Foo/2" : oCache32
				},
				oCachePromise : SyncPromise.resolve(Promise.resolve())
			}),
			oBinding = new ODataBinding({
				oModel : {
					getDependentBindings : function () {}
				}
			}),
			oChild1CacheMock = this.mock(oCache1),
			oChild1Mock = this.mock(oChild1),
			oChild2Mock = this.mock(oChild2),
			oChild3Mock = this.mock(oChild3),
			oChild3CacheMock1 = this.mock(oCache31),
			oChild3CacheMock2 = this.mock(oCache32);

		this.mock(oBinding.oModel).expects("getDependentBindings").exactly(7)
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2, oChild3]);
		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		oChild1Mock.expects("hasPendingChangesInDependents").never();
		oChild2Mock.expects("hasPendingChangesInDependents").never();
		oChild3Mock.expects("hasPendingChangesInDependents").never();
		oChild3CacheMock1.expects("hasPendingChangesForPath").never();
		oChild3CacheMock2.expects("hasPendingChangesForPath").never();

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), true);

		oChild1CacheMock.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild1Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild2Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);
		oChild3CacheMock1.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3CacheMock2.expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		oChild3Mock.expects("hasPendingChangesInDependents").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesInDependents(), false);
	});

	//*********************************************************************************************
	QUnit.test("resetChanges", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("resetChangesForPath").withExactArgs("");
		oBindingMock.expects("resetChangesInDependents").withExactArgs();
		oBindingMock.expects("resetInvalidDataState").withExactArgs();

		// code under test
		oBinding.resetChanges();
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath", function (assert) {
		var oBinding = new ODataBinding(),
			oCache = {
				resetChangesForPath : function () {}
			},
			oExpectation,
			sPath = "foo",
			oPromise = SyncPromise.resolve(Promise.resolve());

		oExpectation = this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func, sPath).returns(oPromise);

		// code under test
		oBinding.resetChangesForPath(sPath);

		// check that the function passed to withCache works as expected
		this.mock(oCache).expects("resetChangesForPath").withExactArgs(sPath);
		oExpectation.firstCall.args[0](oCache, sPath);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: withCache rejects sync", function (assert) {
		var oBinding = new ODataBinding(),
			oError = new Error("fail intentionally");

		this.mock(oBinding).expects("withCache").returns(SyncPromise.reject(oError));
		this.oLogMock.expects("error").withExactArgs("Error in resetChangesForPath", oError,
			sModuleName);

		// code under test
		assert.throws(function () {
			oBinding.resetChangesForPath("foo");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath: withCache rejects async", function (assert) {
		var oBinding = new ODataBinding(),
			oError = new Error("fail intentionally"),
			oPromise = SyncPromise.resolve(Promise.reject(oError));

		this.mock(oBinding).expects("withCache").returns(oPromise);
		this.oLogMock.expects("error").withExactArgs("Error in resetChangesForPath", oError,
			sModuleName);

		// code under test
		oBinding.resetChangesForPath("foo");

		return oPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("resetChangesInDependents", function (assert) {
		var oCache = {
				resetChangesForPath : function () {}
			},
			oCache31 = {
				resetChangesForPath : function () {}
			},
			oCache32 = {
				resetChangesForPath : function () {}
			},
			oChild1 = new ODataBinding({
				oCachePromise : SyncPromise.resolve(oCache)
			}),
			oChild2 = new ODataBinding({
				oCachePromise : SyncPromise.resolve()
			}),
			oChild3 = new ODataBinding({
				oCachePromise : SyncPromise.resolve(Promise.resolve()),
				mCacheByContext : {
					"/Foo/1" : oCache31,
					"/Foo/2" : oCache32
				}
			}),
			oBinding = new ODataBinding({
				oModel : {
					getDependentBindings : function () {}
				}
			});

		this.mock(oBinding.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild1, oChild2, oChild3]);
		this.mock(oCache).expects("resetChangesForPath").withExactArgs("");
		this.mock(oChild1).expects("resetChangesInDependents").withExactArgs();
		this.mock(oChild1).expects("resetInvalidDataState").withExactArgs();
		this.mock(oChild2).expects("resetChangesInDependents").withExactArgs();
		this.mock(oChild2).expects("resetInvalidDataState").withExactArgs();
		this.mock(oChild3).expects("resetChangesInDependents").withExactArgs();
		this.mock(oChild3).expects("resetInvalidDataState").never();
		this.mock(oCache31).expects("resetChangesForPath").withExactArgs("");
		this.mock(oCache32).expects("resetChangesForPath").withExactArgs("");

		// code under test
		oBinding.resetChangesInDependents();
	});

	//*********************************************************************************************
	[
		{
			oTemplate : {oModel : {}, sPath : "/absolute", bRelative : false}
		}, {
			oContext : {getPath : function () { return "/baseContext"; }},
			oTemplate : {oModel : {}, sPath : "quasiAbsolute", bRelative : true}
		}, {
			oContext : Context.create({}, {}, "/v4Context"),
			oTemplate : {
				oModel : {},
				sPath : "relativeWithParameters",
				mParameters : {"$$groupId" : "myGroup"},
				bRelative : true
			}
		}
	].forEach(function (oFixture) {
		QUnit.test("fetchQueryOptionsForOwnCache returns query options:" + oFixture.oTemplate.sPath,
			function (assert) {
				var oBinding = new ODataBinding(oFixture.oTemplate),
					oBindingMock,
					mQueryOptions = {};

				oBinding.doFetchQueryOptions = function () {};
				oBindingMock = this.mock(oBinding);
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				assert.strictEqual(
					oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(),
					mQueryOptions);
		});
	});

	//*********************************************************************************************
	[
		{oModel : {}, sPath : "unresolvedRelative", bRelative : true},
		{oModel : {}, oOperation : {}, sPath : "operation"}
	].forEach(function (oTemplate) {
		QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oTemplate.sPath,
			function (assert) {
				var oBinding = new ODataBinding(oTemplate);

				// code under test
				assert.strictEqual(oBinding.fetchQueryOptionsForOwnCache().getResult(),
					undefined);
		});
	});

	//*********************************************************************************************
	[
		{
			oContext : Context.create({}, {}, "/v4Context"),
			oTemplate : {
				oModel : {},
				sPath : "relativeWithEmptyParameters",
				mParameters : {},
				bRelative : true
			}
		},
		{
			oContext : Context.create({}, {}, "/v4Context"),
			oTemplate : {oModel : {}, sPath : "relativeWithNoParameters", bRelative : true}
		}
	].forEach(function (oFixture) {
		QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oFixture.oTemplate.sPath,
			function (assert) {
				var oBinding = new ODataBinding(oFixture.oTemplate),
					oBindingMock = this.mock(oBinding),
					mQueryOptions = {"$filter" : "filterValue"};

				oBinding.doFetchQueryOptions = function () {};
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve({}));

				// code under test
				assert.strictEqual(
					oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(),
					undefined);

				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				assert.deepEqual(
					oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(),
					mQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can use parent binding cache",
		function (assert) {
			var oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchQueryOptions : function () {},
					oModel : {bAutoExpandSelect : true},
					sPath : "relative",
					bRelative : true,
					updateAggregatedQueryOptions : function () {} // binding is a parent binding
				}),
				mCurrentBindingQueryOptions = {},
				oExpectation,
				oParentBinding = {
					fetchIfChildCanUseCache : function () {}
				},
				oContext = Context.create({}, oParentBinding, "/v4Context"),
				oQueryOptionsForOwnCachePromise;

			this.mock(oBinding).expects("doFetchQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
			oExpectation = this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withArgs(sinon.match.same(oContext), "relative")
				.returns(SyncPromise.resolve(true));

			// code under test
			oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);

			return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
				assert.strictEqual(mQueryOptionsForOwnCache, undefined);
				return oExpectation.firstCall.args[2].then(function (mAggregatedQueryOptions) {
					assert.strictEqual(mAggregatedQueryOptions, oBinding.mAggregatedQueryOptions,
						"fetchIfChildCanUseCache called with oQueryOptionsPromise");
				});
			});
		});

	//*********************************************************************************************
	QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can't use parent binding cache",
		function (assert) {
			var oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchQueryOptions : function () {},
					oModel : {bAutoExpandSelect : true},
					sPath : "relative",
					bRelative : true,
					updateAggregatedQueryOptions : function () {} // binding is a parent binding
				}),
				mCurrentBindingQueryOptions = {},
				aChildCanUseCachePromises,
				oParentBinding = {
					fetchIfChildCanUseCache : function () {}
				},
				oContext = Context.create({}, oParentBinding, "/v4Context"),
				oQueryOptionsForOwnCachePromise;

			this.mock(oBinding).expects("doFetchQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
			this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withArgs(sinon.match.same(oContext), "relative")
				.returns(SyncPromise.resolve(false));

			// code under test
			oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);

			// query options of dependent bindings are aggregated synchronously after
			// fetchQueryOptionsForOwnCache
			oBinding.aChildCanUseCachePromises = aChildCanUseCachePromises = [
				SyncPromise.resolve(Promise.resolve()),
				SyncPromise.resolve(Promise.resolve())
			];

			return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
				assert.strictEqual(aChildCanUseCachePromises[0].isFulfilled(), true);
				assert.strictEqual(aChildCanUseCachePromises[1].isFulfilled(), true);
				assert.strictEqual(mQueryOptionsForOwnCache, oBinding.mAggregatedQueryOptions);
				assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
			});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCanUseCache) {
		QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: non-parent binding, "
				+ "can use cache " + bCanUseCache,
			function (assert) {
				var oBinding = new ODataBinding({
						oModel : {bAutoExpandSelect : true},
						sPath : "relative",
						bRelative : true
					}),
					mLocalQueryOptions = {},
					oParentBinding = {
						fetchIfChildCanUseCache : function () {}
					},
					oQueryOptionsPromise = SyncPromise.resolve(mLocalQueryOptions),
					oContext = Context.create({}, oParentBinding, "/v4Context"),
					oQueryOptionsForOwnCachePromise;

				oBinding.doFetchQueryOptions = function () {};
				this.mock(oBinding).expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(oQueryOptionsPromise);
				this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
					.withExactArgs(sinon.match.same(oContext), "relative",
						sinon.match.same(oQueryOptionsPromise))
					.returns(SyncPromise.resolve(bCanUseCache));

				// code under test
				oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);

				return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
					assert.strictEqual(mQueryOptionsForOwnCache,
						bCanUseCache ? undefined : mLocalQueryOptions);
				});
		});
	});

	//*********************************************************************************************
	[{custom : "foo"}, {$$groupId : "foo"}].forEach(function (mParameters) {
		QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: "
				+ "not only system query options",
			function (assert) {
				var oBinding = new ODataBinding({
						oModel : {bAutoExpandSelect : true},
						mParameters : mParameters,
						sPath : "relative",
						bRelative : true
					}),
					oBindingMock,
					oContext = Context.create({}, {}, "/v4Context"),
					mQueryOptions = {};

				oBinding.doFetchQueryOptions = function () {};
				oBindingMock = this.mock(oBinding);
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				assert.strictEqual(oBinding.fetchQueryOptionsForOwnCache(oContext).getResult(),
					mQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: no own cache", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined)
			.returns(SyncPromise.resolve(undefined));
		oBindingMock.expects("doCreateCache").never();

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {}
				},
				sPath : "/absolute",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext = {},
			mLocalQueryOptions = {},
			mResultingQueryOptions = {};

		oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined)
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("absolute", sinon.match.same(mResultingQueryOptions), undefined)
			.returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
		assert.strictEqual(oCache.$canonicalPath, undefined);
	});

	//*********************************************************************************************
	// fixture is [bQueryOptionsAsync, bCanonicalPathAsync]
	[[false, false], [false, true], [true, false], [true, true]].forEach(function (aFixture) {
		QUnit.test("fetchCache: relative binding with context, " + aFixture, function (assert) {
			var oBinding = new ODataBinding({
					oCachePromise : SyncPromise.resolve(),
					doCreateCache : function () {},
					oModel : {
						oRequestor : {
							ready : function () { return SyncPromise.resolve(); }
						},
						mUriParameters : {}
					},
					sPath : "relative",
					bRelative : true
				}),
				oBindingMock = this.mock(oBinding),
				oCache = {},
				bCanonicalPathAsync = aFixture[1],
				oCanonicalPathPromise = SyncPromise.resolve(bCanonicalPathAsync
					? Promise.resolve("/canonicalPath") : "/canonicalPath"),
				oContext = {fetchCanonicalPath : function () {}},
				mLocalQueryOptions = {},
				bQueryOptionsAsync = aFixture[0],
				oQueryOptionsPromise = SyncPromise.resolve(bQueryOptionsAsync
					? Promise.resolve(mLocalQueryOptions) : mLocalQueryOptions),
				mResultingQueryOptions = {};

			oBindingMock.expects("fetchQueryOptionsForOwnCache")
				.withExactArgs(sinon.match.same(oContext))
				.returns(oQueryOptionsPromise);
			this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
				.returns(oCanonicalPathPromise);
			this.mock(jQuery).expects("extend")
				.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(mLocalQueryOptions))
				.returns(mResultingQueryOptions);
			oBindingMock.expects("doCreateCache")
				.withExactArgs("canonicalPath/relative", sinon.match.same(mResultingQueryOptions),
					sinon.match.same(oContext))
				.returns(oCache);

			// code under test
			oBinding.fetchCache(oContext);

			assert.strictEqual(oBinding.oCachePromise.isFulfilled(),
				!bQueryOptionsAsync && !bCanonicalPathAsync);
			return oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oCache0, oCache);
				assert.strictEqual(oCache0.$canonicalPath, "/canonicalPath");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: requestor is not ready", function (assert) {
		var oRequestor = {
				ready : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : oRequestor,
					mUriParameters : {}
				},
				sPath : "/absolute",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			mLocalQueryOptions = {},
			mResultingQueryOptions = {},
			that = this;

		oBindingMock.expects("fetchQueryOptionsForOwnCache").withExactArgs(undefined)
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		oBindingMock.expects("doCreateCache").never(); // Do not expect cache creation yet
		this.mock(oRequestor).expects("ready")
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				// Now that the requestor is ready, the cache must be created
				that.mock(jQuery).expects("extend")
					.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
						sinon.match.same(mLocalQueryOptions))
					.returns(mResultingQueryOptions);
				oBindingMock.expects("doCreateCache")
					.withExactArgs("absolute", sinon.match.same(mResultingQueryOptions), undefined)
					.returns(oCache);
			})));

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), false);
		return oBinding.oCachePromise.then(function (oResult) {
			assert.strictEqual(oResult, oCache);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bIsParentBinding) {
		QUnit.skip("fetchCache: auto-$expand/$select, parent binding " + bIsParentBinding,
			function (assert) {
				var oBinding = new ODataBinding({
						oCachePromise : SyncPromise.resolve(),
						doCreateCache : function () {},
						oModel : {
							bAutoExpandSelect : true,
							mUriParameters : {}
						},
						sPath : "relative",
						aChildCanUseCachePromises : bIsParentBinding ? [] : undefined,
						bRelative : true
					}),
					oBindingMock = this.mock(oBinding),
					oCache = {},
					oContext = {
						fetchCanonicalPath : function () {
							return SyncPromise.resolve("/canonicalPath");
						}
					},
					oDependentCanUseCachePromise,
					mLocalQueryOptions = {},
					oQueryOptionsPromise = SyncPromise.resolve(mLocalQueryOptions),
					mResultingQueryOptions = {};

				oBindingMock.expects("fetchQueryOptionsForOwnCache")
					.withExactArgs(sinon.match.same(oContext))
					.returns(oQueryOptionsPromise);
				this.mock(jQuery).expects("extend")
					.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
						sinon.match.same(mLocalQueryOptions))
					.returns(mResultingQueryOptions);
				oBindingMock.expects("doCreateCache")
					.withExactArgs("canonicalPath/relative",
						sinon.match.same(mResultingQueryOptions), sinon.match.same(oContext))
					.returns(oCache);

				// code under test
				oBinding.fetchCache(oContext);

				// property bindings can't have dependent bindings and do not wait for dependent options
				assert.strictEqual(oBinding.oCachePromise.isFulfilled(), !bIsParentBinding);
				if (bIsParentBinding) {
					// dependent query options computation requires metadata => set asynchronously
					oDependentCanUseCachePromise = SyncPromise.resolve(Promise.resolve()
						.then(function () {
							oBinding.mAggregatedQueryOptions = {$select : ["dependentPath"]};
						}
					));
					// dependent binding sets query option promise synchronously *after* parent
					// binding's call to fetchCache
					oBinding.aChildCanUseCachePromises.push(oDependentCanUseCachePromise);
				}
				return oBinding.oCachePromise.then(function (oCache0) {
					assert.strictEqual(oCache0, oCache);
					if (bIsParentBinding) {
						assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
						assert.strictEqual(oBinding.mAggregatedQueryOptions.$select[0],
							"dependentPath");
					}
				});
			}
		);
	});
//TODO May dependent bindings be created asynchronously e.g. in case of async views?

	//*********************************************************************************************
	QUnit.test("fetchCache: quasi-absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				},
				sPath : "quasiAbsolute",
				bRelative : true
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext = {getPath : function () {}},
			mLocalQueryOptions = {},
			mResultingQueryOptions = {};

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/contextPath");
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("contextPath/quasiAbsolute", sinon.match.same(mResultingQueryOptions),
				sinon.match.same(oContext))
			.returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
		assert.strictEqual(oCache.$canonicalPath, "/contextPath");
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: relative to virtual context", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				},
				bRelative : true
			}),
			oContext = {
				getIndex : function () {}
			};

		this.mock(oBinding).expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve({}));
		this.mock(oContext).expects("getIndex").withExactArgs()
			.returns(-2);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: operation binding", function (assert) {
		var oCachePromise = SyncPromise.resolve({
				setActive : function () {}
			}),
			oBinding = new ODataBinding({
				oCachePromise : oCachePromise,
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				},
				oOperation : {}
			});

		// code under test
		oBinding.fetchCache({/*oContext: not needed*/});

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
	});

	//*********************************************************************************************
	[
		SyncPromise.resolve(undefined),
		SyncPromise.resolve({ setActive : function () {} })
	].forEach(function (oCachePromise, i) {
		QUnit.test("fetchCache: deactivates previous cache, " + i, function (assert) {
			var oBinding = new ODataBinding({
					oCachePromise : oCachePromise,
					fetchQueryOptionsForOwnCache : function () {
						return SyncPromise.resolve(undefined);
					},
					oModel : {
						oRequestor : {
							ready : function () { return SyncPromise.resolve(); }
						}
					},
					bRelative : true
				}),
				oCache = oCachePromise && oCachePromise.getResult();

			if (oCache) {
				this.mock(oCache).expects("setActive").withExactArgs(false);
			}

			// code under test
			oBinding.fetchCache();
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: use same cache for same path", function (assert) {
		var oBinding = new ODataBinding({
			oCachePromise : SyncPromise.resolve(),
			doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {}
				},
				bRelative : true
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {
				setActive : function () {}
			},
			oCacheMock = this.mock(oCache),
			oCanonicalPathPromise = SyncPromise.resolve(Promise.resolve("/canonicalPath")),
			oContext = {fetchCanonicalPath : function () {}};

		oBindingMock.expects("fetchQueryOptionsForOwnCache").twice()
			.returns(SyncPromise.resolve({}));
		this.mock(oContext).expects("fetchCanonicalPath").twice()
			.returns(oCanonicalPathPromise);
		oBindingMock.expects("doCreateCache").returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		return oBinding.oCachePromise.then(function () {
			oCacheMock.expects("setActive").withExactArgs(false);
			oCacheMock.expects("setActive").withExactArgs(true);

			// code under test
			oBinding.fetchCache(oContext); // must not create new cache

			return oBinding.oCachePromise.then(function (oCache1) {
				assert.strictEqual(oCache1, oCache);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: no cache reuse for absolute bindings", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {}
				},
				sPath : "/EMPLOYEES",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {setActive : function () {}};

		oBindingMock.expects("fetchQueryOptionsForOwnCache").twice()
			.returns(SyncPromise.resolve({}));
		oBindingMock.expects("doCreateCache").twice().returns(oCache);
		this.mock(oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.fetchCache();

		// code under test
		oBinding.fetchCache();
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: later calls to fetchCache exist => discard cache", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					reportError : function () {},
					mUriParameters : {}
				},
				bRelative : true,
				toString : function () {return "MyBinding";}
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext0 = {fetchCanonicalPath : function () {}},
			oContext1 = {fetchCanonicalPath : function () {}},
			mLocalQueryOptions = {},
			oPromise,
			mResultingQueryOptions = {};

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext0))
			.returns(SyncPromise.resolve({}));
		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext1))
			.returns(SyncPromise.resolve(mLocalQueryOptions));
		this.mock(oContext0)
			.expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve(Promise.resolve("/canonicalPath0")));
		this.mock(oContext1)
			.expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve(Promise.resolve("/canonicalPath1")));
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("canonicalPath1", sinon.match.same(mResultingQueryOptions),
				sinon.match.same(oContext1))
			.returns(oCache);

		oBinding.fetchCache(oContext0);
		oPromise = oBinding.oCachePromise;

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding", sModuleName,
				sinon.match.instanceOf(Error));

		// create new cache for this binding while other cache creation is pending
		oBinding.fetchCache(oContext1);
		return SyncPromise.all([
			oPromise.then(function () {
				assert.ok(false, "Expected a rejected cache-promise");
			}, function (oError) {
				assert.strictEqual(oError.message,
					"Cache discarded as a new cache has been created");
				assert.strictEqual(oError.canceled, true);
			}),
			oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oCache0, oCache);
			})
		]);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: fetchCanonicalPath fails", function (assert) {
		var oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					reportError : function () {},
					mUriParameters : {}
				},
				bRelative : true,
				toString : function () {return "MyBinding";}
			}),
			oBindingMock = this.mock(oBinding),
			oContext = {fetchCanonicalPath : function () {}},
			oError = new Error("canonical path failure");

		oBindingMock.expects("fetchQueryOptionsForOwnCache").returns(SyncPromise.resolve({}));
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject(oError));
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding", sModuleName,
				sinon.match.same(oError));

		// code under test
		oBinding.fetchCache(oContext);

		return oBinding.oCachePromise.then(
			function () {
				assert.ok(false, "unexpected success");
			},
			function (oError0) {
				assert.strictEqual(oError0, oError);
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath", function (assert) {
		var oAbsoluteBinding = new ODataBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "/foo"
			}),
			oRelativeBinding = new ODataBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "bar",
				bRelative : true
			});

		this.mock(oRelativeBinding.oModel).expects("resolve").exactly(5)
			.withExactArgs("bar", sinon.match.same(oRelativeBinding.oContext)).returns("/foo/bar");

		assert.strictEqual(oRelativeBinding.getRelativePath("baz"), "baz");
		assert.strictEqual(oRelativeBinding.getRelativePath("/foo/bar/baz"), "baz");
		assert.strictEqual(oRelativeBinding.getRelativePath("/foo/bar('baz')"), "('baz')");
		assert.strictEqual(oRelativeBinding.getRelativePath("/foo"), undefined);
		assert.strictEqual(oRelativeBinding.getRelativePath("/foo"), undefined);
		assert.strictEqual(oRelativeBinding.getRelativePath("/wrong/foo/bar"), undefined,
			"no error, binding must pass on to the parent binding for a better error message");

		this.mock(oAbsoluteBinding.oModel).expects("resolve")
			.withExactArgs("/foo", sinon.match.same(oAbsoluteBinding.oContext)).returns("/foo");
		assert.throws(function () {
			oAbsoluteBinding.getRelativePath("/wrong");
		}, new Error("/wrong: invalid path, must start with /foo"));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bAsync) {
		QUnit.test("withCache: cache hit, async=" + bAsync, function (assert) {
			var oCache = {},
				oBinding = new ODataBinding({
					oCachePromise : bAsync ? SyncPromise.resolve(Promise.resolve(oCache))
						: SyncPromise.resolve(oCache)
				}),
				oCallbackResult = {},
				fnCallback = sinon.stub().returns(oCallbackResult),
				oPromise;

			this.mock(oBinding).expects("getRelativePath").withExactArgs("foo").returns("~");

			// code under test
			oPromise = oBinding.withCache(fnCallback, "foo").then(function (oResult) {
				assert.strictEqual(oResult, oCallbackResult);

				sinon.assert.calledWithExactly(fnCallback, sinon.match.same(oCache), "~");
			});
			if (!bAsync) {
				assert.strictEqual(oPromise.isFulfilled(), true);
			}
			return oPromise;
		});
	});

	//*********************************************************************************************
	QUnit.test("withCache: cache hit, no path", function (assert) {
		var oCache = {},
			oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(Promise.resolve(oCache)),
				oContext : oContext
			}),
			oCallbackResult = {},
			fnCallback = sinon.stub().returns(oCallbackResult);

		this.mock(oBinding).expects("getRelativePath").withExactArgs("").returns("");
		this.mock(oContext).expects("withCache").never();

		// code under test
		return oBinding.withCache(fnCallback).then(function (oResult) {
			assert.strictEqual(oResult, oCallbackResult);

			sinon.assert.calledWithExactly(fnCallback, sinon.match.same(oCache), "");
		});
	});

	//*********************************************************************************************
	QUnit.test("withCache: no cache, but context, relative path", function (assert) {
		var oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				oContext : oContext,
				sPath : "binding/path"
			}),
			fnCallback = {},
			oContextResult = {},
			sPath = "foo";

		this.mock(_Helper).expects("buildPath").withExactArgs(oBinding.sPath, sPath).returns("~");
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), "~")
			.returns(oContextResult);

		// code under test
		return oBinding.withCache(fnCallback, sPath).then(function (oResult) {
			assert.strictEqual(oResult, oContextResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("withCache: no cache, but context, absolute path", function (assert) {
		var oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				oContext : oContext
			}),
			fnCallback = {},
			oContextResult = {},
			sPath = "/foo";

		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), sPath)
			.returns(oContextResult);

		// code under test
		return oBinding.withCache(fnCallback, sPath).then(function (oResult) {
			assert.strictEqual(oResult, oContextResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("withCache: cache miss, but context", function (assert) {
		var oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve({}),
				oContext : oContext,
				sPath : "binding/path"
			}),
			fnCallback = {},
			oContextResult = {},
			sPath = "/foo";

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.same(fnCallback), sPath)
			.returns(oContextResult);

		// code under test
		return oBinding.withCache(fnCallback, sPath).then(function (oResult) {
			assert.strictEqual(oResult, oContextResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("withCache: operation w/o cache", function (assert) {
		var oContext = {
				withCache : function () {}
			},
			fnCallback = {},
			oBinding = new ODataBinding({
				oCachePromise : SyncPromise.resolve(),
				oContext : oContext,
				oOperation : {}
			}),
			sPath = "/foo";

		this.mock(oContext).expects("withCache").never();

		// code under test
		return oBinding.withCache(fnCallback, sPath).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bBaseContext) {
		var sTitle = "withCache: no cache, " + (bBaseContext ? "base" : "no") + " context";

		QUnit.test(sTitle, function (assert) {
			var oBinding = new ODataBinding({
					oCachePromise : SyncPromise.resolve(),
					oContext : bBaseContext ? {} : undefined
				}),
				fnCallback = {};

			// code under test
			return oBinding.withCache(fnCallback, "foo").then(function (oResult) {
				assert.strictEqual(oResult, undefined);
			});
		});
	});
});