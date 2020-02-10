/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (jQuery, Log, SyncPromise, Binding, ChangeReason, Context, asODataBinding, SubmitMode,
		_Helper) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataBinding";

	/**
	 * Constructs a test object.
	 *
	 * @param {object} [oTemplate]
	 *   A template object to fill the binding, all properties are copied
	 */
	function ODataBinding(oTemplate) {
		asODataBinding.call(this);

		Object.assign(this, {
			getDependentBindings : function () {}, // implemented by all sub-classes
			//Returns the metadata for the class that this object belongs to.
			getMetadata : function () {
				return {
					getName : function () {
						return sClassName;
					}
				};
			},
			hasPendingChangesInDependents : function () {}, // implemented by all sub-classes
			isMeta : function () { return false; },
			isSuspended : Binding.prototype.isSuspended,
			resetChangesInDependents : function () {} // implemented by all sub-classes
		}, oTemplate);
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataBinding", {
		before : function () {
			asODataBinding(ODataBinding.prototype);
		},

		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("initialize members for mixin", function (assert) {
		var oBinding = new ODataBinding();

		assert.ok(oBinding.hasOwnProperty("mCacheByResourcePath"));
		assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.ok(oBinding.hasOwnProperty("mCacheQueryOptions"));
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
		assert.ok(oBinding.hasOwnProperty("oFetchCacheCallToken"));
		assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);
		assert.ok(oBinding.hasOwnProperty("mLateQueryOptions"));
		assert.strictEqual(oBinding.mLateQueryOptions, undefined);
		assert.ok(oBinding.hasOwnProperty("sReducedPath"));
		assert.strictEqual(oBinding.sReducedPath, undefined);
		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding = new ODataBinding(),
			oCache = {
				setActive : function () {}
			},
			// we might become asynchronous due to auto $expand/$select reading $metadata
			oPromise = Promise.resolve(oCache);

		oBinding.mCacheByResourcePath = {};
		oBinding.oCache = oCache;
		oBinding.oCachePromise = SyncPromise.resolve(oPromise);
		oBinding.mCacheQueryOptions = {};
		oBinding.oContext = {}; // @see sap.ui.model.Binding's c'tor
		oBinding.oFetchCacheCallToken = {};
		this.mock(oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
		assert.strictEqual(oBinding.oContext, undefined);
		assert.strictEqual(oBinding.oFetchCacheCallToken, undefined);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("destroy binding w/o cache", function (assert) {
		var oBinding = new ODataBinding();

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: success", function (assert) {
		var oBinding = new ODataBinding({
				checkUpdateInternal : function () {},
				oModel : {
					reportError : function () {}
				}
			}),
			bForceUpdate = {/*false or true*/};

		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(sinon.match.same(bForceUpdate))
			.resolves();
		this.mock(oBinding.oModel).expects("reportError").never();

		// code under test
		oBinding.checkUpdate(bForceUpdate);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: illegal parameter", function (assert) {
		assert.throws(function () {
			new ODataBinding().checkUpdate({/*false or true*/}, {/*additional argument*/});
		}, new Error("Only the parameter bForceUpdate is supported"));
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: checkUpdateInternal rejects", function (assert) {
		var oBinding = new ODataBinding({
				checkUpdateInternal : function () {},
				oModel : {
					reportError : function () {}
				},
				toString : function () { return "~"; }
			}),
			oError = new Error(),
			bForceUpdate = {/*false or true*/},
			oPromise = Promise.reject(oError);

		this.mock(oBinding).expects("checkUpdateInternal")
			.withExactArgs(sinon.match.same(bForceUpdate))
			.returns(oPromise);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to update ~", sClassName, sinon.match.same(oError));

		// code under test
		oBinding.checkUpdate(bForceUpdate);

		return oPromise.catch(function () {}); // wait for the error, but ignore it
	});

	//*********************************************************************************************
	QUnit.test("destroy binding w/ rejected cache promise", function (assert) {
		var oBinding = new ODataBinding();

		oBinding.oCachePromise = SyncPromise.reject(new Error());

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), true);
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sGroupId : "group"
			});

		assert.strictEqual(oBinding.getGroupId(), "group");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId: relative, inherits group from context", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {
					getGroupId : function () {}
				},
				bRelative : true
			});

		this.mock(oBinding.oContext).expects("getGroupId").withExactArgs().returns("group");

		// code under test
		assert.strictEqual(oBinding.getGroupId(), "group");
	});

	//*********************************************************************************************
	[
		{bRelative : false}, // absolute
		{bRelative : true}, // relative, unresolved
		{bRelative : true, oContext : {/*not a v4.Context*/}} // quasi-absolute
	].forEach(function (oFixture, i) {
		QUnit.test("getGroupId: inherits group from model, " + i, function (assert) {
			var oBinding = new ODataBinding({
					oContext : oFixture.oContext,
					oModel : {
						getGroupId : function () {}
					},
					bRelative : oFixture.bRelative
				});

			this.mock(oBinding.oModel).expects("getGroupId").withExactArgs().returns("group");

			// code under test
			assert.strictEqual(oBinding.getGroupId(), "group");
		});
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: own group", function (assert) {
		var oBinding = new ODataBinding({
				sUpdateGroupId : "group"
			});

		assert.strictEqual(oBinding.getUpdateGroupId(), "group");
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId: relative, inherits group from context", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {
					getUpdateGroupId : function () {}
				},
				bRelative : true
			});

		this.mock(oBinding.oContext).expects("getUpdateGroupId").withExactArgs().returns("group");

		// code under test
		assert.strictEqual(oBinding.getUpdateGroupId(), "group");
	});

	//*********************************************************************************************
	[
		{bRelative : false}, // absolute
		{bRelative : true}, // relative, unresolved
		{bRelative : true, oContext : {/*not a v4.Context*/}} // quasi-absolute
	].forEach(function (oFixture, i) {
		QUnit.test("getUpdateGroupId: inherits group from model, " + i, function (assert) {
			var oBinding = new ODataBinding({
					oContext : oFixture.oContext,
					oModel : {
						getUpdateGroupId : function () {}
					},
					bRelative : oFixture.bRelative
				});

			this.mock(oBinding.oModel).expects("getUpdateGroupId").withExactArgs().returns("group");

			// code under test
			assert.strictEqual(oBinding.getUpdateGroupId(), "group");
		});
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oBinding = new ODataBinding();

		assert.throws(function () { //TODO implement
			oBinding.isInitial();
		}, new Error("Unsupported operation: isInitial"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: success", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				},
				refreshInternal : function () {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true)
			.resolves();

		oBinding.refresh("groupId");
	});

	//*********************************************************************************************
	QUnit.test("refresh: reject", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {
					checkGroupId : function () {}
				},
				refreshInternal : function () {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true)
			.rejects(new Error());

		// code under test - must not cause "Uncaught (in promise)"
		oBinding.refresh("groupId");
	});

	//*********************************************************************************************
	QUnit.test("refresh: not refreshable", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		assert.throws(function () {
			oBinding.refresh();
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh: pending changes", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
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

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").returns(false);
		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.refresh("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	[{
		path : "/absolute",
		context : undefined,
		result : true
	}, {
		path : "relative",
		context : undefined,
		result : false
	}, {
		path : "quasiAbsolute",
		context : {getPath : function () {}},
		result : true
	}, {
		path : "relativeToV4Context",
		context : {getPath : function () {}, getBinding : function () {}},
		result : false
	}].forEach(function (oFixture, i) {
		QUnit.test("isRoot, " + i, function (assert) {
			var oBinding = new ODataBinding({
				oContext : oFixture.context,
				sPath : oFixture.path,
				bRelative : !oFixture.path.startsWith("/")
			});

			assert.strictEqual(!!oBinding.isRoot(), oFixture.result);
		});
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
	QUnit.test("hasPendingChangesForPath", function (assert) {
		var oBinding = new ODataBinding({}),
			oCache = {
				hasPendingChangesForPath : function () {}
			},
			sCachePath = {/*string*/},
			oExpectation,
			sPath = "foo",
			bResult = {/*true or undefined*/},
			oResult = {},
			oWithCachePromise = {unwrap : function () {}};

		oExpectation = this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func, sPath, true)
			.returns(oWithCachePromise);
		this.mock(oWithCachePromise).expects("unwrap").withExactArgs().returns(oResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath(sPath), oResult);

		this.mock(oCache).expects("hasPendingChangesForPath")
			.withExactArgs(sinon.match.same(sCachePath))
			.returns(bResult);

		// code under test
		assert.strictEqual(oExpectation.firstCall.args[0](oCache, sCachePath), bResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChangesInCaches", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			}),
			oCache0 = {
				$deepResourcePath : "A('42')/A_2_B",
				hasPendingChangesForPath : function () {}
			},
			oCache1 = {
				$deepResourcePath : "A('42')/A_2_B/B_2_B",
				hasPendingChangesForPath : function () {}
			},
			oCache2 = {
				$deepResourcePath : "A('42')/A_2_B/B_2_C/C_2_B",
				hasPendingChangesForPath : function () {}
			};

		// code under test
		assert.notOk(oBinding.hasPendingChangesInCaches());

		// simulate cached caches
		oBinding.mCacheByResourcePath = {
			"A('42')" : {$deepResourcePath : "not considered cache"},
			"b" : oCache0,
			"c" : oCache1,
			"d" : oCache2
		};

		this.mock(oCache0).expects("hasPendingChangesForPath").withExactArgs("").returns(false);
		this.mock(oCache1).expects("hasPendingChangesForPath").withExactArgs("").returns(true);
		this.mock(oCache2).expects("hasPendingChangesForPath").never();

		// code under test
		assert.ok(oBinding.hasPendingChangesInCaches("A('42')"));

		// code under test
		assert.notOk(oBinding.hasPendingChangesInCaches("A('77')"));
	});

	//*********************************************************************************************
	QUnit.test("resetChanges", function (assert) {
		var oBinding = new ODataBinding(),
			oExpectation,
			oBindingMock = this.mock(oBinding),
			oResetChangesForPathPromise = SyncPromise.resolve(new Promise(function (resolve) {
				setTimeout(resolve.bind(null, "foo"), 2);
			})),
			oResetChangesInDependentsPromise = SyncPromise.resolve(new Promise(function (resolve) {
				setTimeout(resolve.bind(null, "bar"), 3);
			})),
			oResetChangesPromise;

		oBindingMock.expects("checkSuspended").withExactArgs();
		oExpectation = oBindingMock.expects("resetChangesForPath").withExactArgs("", [])
			.callsFake(function (sPath, aPromises) {
				aPromises.push(oResetChangesForPathPromise);
			});
		oBindingMock.expects("resetChangesInDependents")
			.withExactArgs([oResetChangesForPathPromise])
			.callsFake(function (aPromises) {
				assert.strictEqual(aPromises, oExpectation.firstCall.args[1]);

				aPromises.push(oResetChangesInDependentsPromise);
			});
		oBindingMock.expects("resetInvalidDataState").withExactArgs();

		// code under test
		oResetChangesPromise = oBinding.resetChanges();
		assert.ok(oResetChangesPromise instanceof Promise);

		return oResetChangesPromise.then(function (oResult) {
			assert.ok(oResetChangesForPathPromise.isFulfilled());
			assert.ok(oResetChangesInDependentsPromise.isFulfilled());
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChangesForPath", function (assert) {
		var oBinding = new ODataBinding(),
			oCache = {
				resetChangesForPath : function () {}
			},
			oExpectation,
			sPath = {/*string*/},
			oPromise = SyncPromise.resolve(),
			aPromises = [],
			oUnwrappedWithCachePromise = {};

		oExpectation = this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func, sinon.match.same(sPath))
			.returns(oPromise);
		this.mock(oPromise).expects("unwrap").withExactArgs().returns(oUnwrappedWithCachePromise);

		// code under test
		oBinding.resetChangesForPath(sPath, aPromises);

		assert.deepEqual(aPromises, [oUnwrappedWithCachePromise]);
		assert.strictEqual(aPromises[0], oUnwrappedWithCachePromise);

		// check that the function passed to withCache works as expected
		this.mock(oCache).expects("resetChangesForPath").withExactArgs(sinon.match.same(sPath));

		// code under test
		oExpectation.firstCall.args[0](oCache, sPath);

		return oPromise;
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
				var oBinding,
					oBindingMock,
					mQueryOptions = {},
					oResult;

				oFixture.oTemplate.oModel = {
					resolve : function () {}
				};
				oBinding = new ODataBinding(oFixture.oTemplate);
				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext))
					.returns("/resolved/path");
				oBinding.doFetchQueryOptions = function () {};
				oBindingMock = this.mock(oBinding);
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				oResult = oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult();

				assert.strictEqual(oResult.sReducedPath, "/resolved/path");
				assert.strictEqual(oResult.mQueryOptions, mQueryOptions);
		});
	});

	//*********************************************************************************************
	[
		{sPath : "unresolvedRelative", bRelative : true},
		{oOperation : {}, sPath : "operation"},
		{isMeta : function () { return true; }, sPath : "/data##meta"}
	].forEach(function (oTemplate) {
		QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oTemplate.sPath,
			function (assert) {
				var oBinding;

				oTemplate.oModel = {
					resolve : function () {}
				};
				oBinding = new ODataBinding(oTemplate);
				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, undefined)
					.returns("/resolved/path");

				// code under test
				assert.deepEqual(oBinding.fetchQueryOptionsForOwnCache().getResult(), {
					mQueryOptions : undefined,
					sReducedPath : "/resolved/path"
				});
		});
	});

	//*********************************************************************************************
	[
		{
			oContext : Context.create({}, {}, "/v4Context"),
			oTemplate : {
				oModel : {resolve : function () {}},
				sPath : "relativeWithEmptyParameters",
				mParameters : {},
				bRelative : true
			}
		},
		{
			oContext : Context.create({}, {}, "/v4Context"),
			oTemplate : {
				oModel : {resolve :function () {}},
				sPath : "relativeWithNoParameters",
				bRelative : true
			}
		}
	].forEach(function (oFixture) {
		QUnit.test("fetchQueryOptionsForOwnCache returns undefined: " + oFixture.oTemplate.sPath,
			function (assert) {
				var oBinding = new ODataBinding(oFixture.oTemplate),
					oBindingMock = this.mock(oBinding),
					mQueryOptions = {"$filter" : "filterValue"};

				this.mock(oBinding.oModel).expects("resolve").twice()
					.withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext))
					.returns("/resolved/path");
				oBinding.doFetchQueryOptions = function () {};
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve({}));

				// code under test
				assert.deepEqual(
					oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(),
					{
						mQueryOptions : undefined,
						sReducedPath : "/resolved/path"
					});

				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oFixture.oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				assert.deepEqual(
					oBinding.fetchQueryOptionsForOwnCache(oFixture.oContext).getResult(),
					{
						mQueryOptions : mQueryOptions,
						sReducedPath : "/resolved/path"
					});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can use parent binding cache",
		function (assert) {
			var fnFetchMetadata = function () {},
				oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchQueryOptions : function () {},
					oModel : {
						bAutoExpandSelect : true,
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					sPath : "relative",
					bRelative : true,
					updateAggregatedQueryOptions : function () {} // binding is a parent binding
				}),
				mConvertedBindingQueryOptions = {},
				mCurrentBindingQueryOptions = {},
				oExpectation,
				oParentBinding = {
					fetchIfChildCanUseCache : function () {}
				},
				oContext = Context.create({}, oParentBinding, "/v4Context"),
				oQueryOptionsForOwnCachePromise;

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
				.returns("/resolved/path");
			this.mock(oBinding).expects("doFetchQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
			this.mock(_Helper).expects("getMetaPath")
				.withExactArgs("/resolved/path")
				.returns("/resolved/metaPath");
			this.mock(_Helper).expects("fetchResolvedSelect")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/metaPath",
					mCurrentBindingQueryOptions)
				.returns(SyncPromise.resolve(mConvertedBindingQueryOptions));
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mConvertedBindingQueryOptions));
			oExpectation = this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withArgs(sinon.match.same(oContext), "relative")
				.returns(SyncPromise.resolve("/reduced/path"));

			// code under test
			oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);

			return oQueryOptionsForOwnCachePromise.then(function (mQueryOptionsForOwnCache) {
				assert.deepEqual(mQueryOptionsForOwnCache, {
					mQueryOptions : undefined,
					sReducedPath : "/reduced/path"
				});
				return oExpectation.firstCall.args[2].then(function (mAggregatedQueryOptions) {
					assert.strictEqual(mAggregatedQueryOptions, oBinding.mAggregatedQueryOptions,
						"fetchIfChildCanUseCache called with oQueryOptionsPromise");
				});
			});
		});

	//*********************************************************************************************
	QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: can't use parent binding cache",
		function (assert) {
			var fnFetchMetadata = function () {},
				oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchQueryOptions : function () {},
					oModel : {
						bAutoExpandSelect : true,
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					sPath : "relative",
					bRelative : true,
					updateAggregatedQueryOptions : function () {} // binding is a parent binding
				}),
				mConvertedBindingQueryOptions = {},
				mCurrentBindingQueryOptions = {},
				aChildCanUseCachePromises,
				oParentBinding = {
					fetchIfChildCanUseCache : function () {}
				},
				oContext = Context.create({}, oParentBinding, "/v4Context"),
				oQueryOptionsForOwnCachePromise;

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
				.returns("/resolved/path");
			this.mock(oBinding).expects("doFetchQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(mCurrentBindingQueryOptions));
			this.mock(_Helper).expects("getMetaPath")
				.withExactArgs("/resolved/path")
				.returns("/resolved/metaPath");
			this.mock(_Helper).expects("fetchResolvedSelect")
				.withExactArgs(sinon.match.same(fnFetchMetadata), "/resolved/metaPath",
					mCurrentBindingQueryOptions)
				.returns(SyncPromise.resolve(mConvertedBindingQueryOptions));
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mConvertedBindingQueryOptions));
			this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withArgs(sinon.match.same(oContext), "relative")
				.returns(SyncPromise.resolve(undefined));

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
				assert.strictEqual(mQueryOptionsForOwnCache.sReducedPath, "/resolved/path");
				assert.strictEqual(mQueryOptionsForOwnCache.mQueryOptions,
					oBinding.mAggregatedQueryOptions);
				assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
			});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bCanUseCache) {
		QUnit.test("fetchQueryOptionsForOwnCache, auto-$expand/$select: non-parent binding, "
				+ "can use cache " + bCanUseCache,
			function (assert) {
				var oBinding = new ODataBinding({
						doFetchQueryOptions : function () {},
						oModel : {
							bAutoExpandSelect : true,
							resolve : function () {}
						},
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

				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
					.returns("/resolved/path");
				this.mock(oBinding).expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(oQueryOptionsPromise);
				this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
					.withExactArgs(sinon.match.same(oContext), "relative",
						sinon.match.same(oQueryOptionsPromise))
					.returns(SyncPromise.resolve(bCanUseCache ? "/reduced/path" : undefined));

				// code under test
				oQueryOptionsForOwnCachePromise = oBinding.fetchQueryOptionsForOwnCache(oContext);

				return oQueryOptionsForOwnCachePromise.then(function (oResult) {
					assert.strictEqual(oResult.sReducedPath,
						bCanUseCache ? "/reduced/path" : "/resolved/path");
					assert.strictEqual(oResult.mQueryOptions,
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
						doFetchQueryOptions : function () {},
						oModel : {
							bAutoExpandSelect : true,
							resolve : function () {}
						},
						mParameters : mParameters,
						sPath : "relative",
						bRelative : true
					}),
					oBindingMock,
					oContext = Context.create({}, {}, "/v4Context"),
					mQueryOptions = {},
					oResult;

				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
					.returns("/resolved/path");
				oBindingMock = this.mock(oBinding);
				oBindingMock.expects("doFetchQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				oResult = oBinding.fetchQueryOptionsForOwnCache(oContext).getResult();

				assert.strictEqual(oResult.mQueryOptions, mQueryOptions);
				assert.strictEqual(oResult.sReducedPath, "/resolved/path");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: no own cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				doCreateCache : function () {},
				mLateQueryOptions : {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				},
				sPath : "relative",
				bRelative : true
			}),
			oContext = {},
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve(Promise.resolve({
				mQueryOptions : undefined,
				sReducedPath : "/resolved/path"
			})));
		oBindingMock.expects("doCreateCache").never();

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, undefined);
		assert.strictEqual(oBinding.mLateQueryOptions, undefined);
		assert.ok(oBinding.oCachePromise.isPending());

		return oBinding.oCachePromise.then(function () {
			assert.strictEqual(oBinding.oCache, null);
			assert.strictEqual(oBinding.oCachePromise.getResult(), null);
			assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
			assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				doCreateCache : function () {},
				mLateQueryOptions : {},
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
			.returns(SyncPromise.resolve(Promise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/resolved/path"
			})));
		oBindingMock.expects("fetchResourcePath").withExactArgs(undefined)
			.returns(SyncPromise.resolve("absolute"));
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("absolute", sinon.match.same(mResultingQueryOptions), undefined)
			.returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, undefined);
		assert.strictEqual(oBinding.mLateQueryOptions, undefined);
		assert.ok(oBinding.oCachePromise.isPending());

		return oBinding.oCachePromise.then(function () {
			assert.strictEqual(oBinding.oCache, oCache);
			assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
			assert.strictEqual(oCache.$resourcePath, undefined);
			assert.strictEqual(oBinding.mCacheQueryOptions, mResultingQueryOptions);
			assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
		});
	});

	//*********************************************************************************************
	// fixture is [bQueryOptionsAsync, bResourcePathAsync]
	[[false, false], [false, true], [true, false], [true, true]].forEach(function (aFixture) {
		QUnit.test("fetchCache: relative binding with context, " + aFixture, function (assert) {
			var oBinding = new ODataBinding({
					oCache : null,
					oCachePromise : SyncPromise.resolve(null),
					doCreateCache : function () {},
					mLateQueryOptions : {},
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
				oContext = {
					getPath : function () { return "/contextPath"; }
				},
				mLocalQueryOptions = {},
				oQueryOptions = {
					mQueryOptions : mLocalQueryOptions,
					sReducedPath : "/resolved/path"
				},
				bQueryOptionsAsync = aFixture[0],
				oQueryOptionsPromise = SyncPromise.resolve(bQueryOptionsAsync
					? Promise.resolve(oQueryOptions) : oQueryOptions),
				bResourcePathAsync = aFixture[1],
				oResourcePathPromise = SyncPromise.resolve(bResourcePathAsync
					? Promise.resolve("resourcePath") : "resourcePath"),
				mResultingQueryOptions = {};

			oBindingMock.expects("fetchQueryOptionsForOwnCache")
				.withExactArgs(sinon.match.same(oContext))
				.returns(oQueryOptionsPromise);
			oBindingMock.expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(oResourcePathPromise);
			this.mock(jQuery).expects("extend")
				.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(mLocalQueryOptions))
				.returns(mResultingQueryOptions);
			this.mock(_Helper).expects("buildPath").withExactArgs("/contextPath", "relative")
				.returns("/built/path");
			oBindingMock.expects("doCreateCache")
				.withExactArgs("resourcePath", sinon.match.same(mResultingQueryOptions),
					sinon.match.same(oContext), "built/path")
				.returns(oCache);

			// code under test
			oBinding.fetchCache(oContext);

			assert.strictEqual(oBinding.oCache,
				!bQueryOptionsAsync && !bResourcePathAsync ? oCache : undefined);
			assert.strictEqual(oBinding.mLateQueryOptions, undefined);
			assert.strictEqual(oBinding.oCachePromise.isFulfilled(),
				!bQueryOptionsAsync && !bResourcePathAsync);

			return oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oCache0, oCache);
				assert.strictEqual(oCache0.$deepResourcePath, "built/path");
				assert.strictEqual(oCache0.$resourcePath, "resourcePath");
				assert.strictEqual(oBinding.mCacheQueryOptions, mResultingQueryOptions);
				assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
			});
		});
	});

	//*********************************************************************************************
	[
		undefined, // use old context for second call
		{ // base context
			getPath : function () { return "/deep/path"; }
		},
		{ // no return value context ID
			getPath : function () { return "/deep/path"; },
			getReturnValueContextId : function () { return undefined; }
		},
		{ // different return value context ID
			getPath : function () { return "/deep/path"; },
			getReturnValueContextId : function () { return 43; }
		}
	].forEach(function (oContext, i) {
		var sTitle = "fetchCache: called second time, " + (oContext ? "create a new " : "reuse ")
				+ "cache - " + i;

		QUnit.test(sTitle, function (assert) {
			var oBinding = new ODataBinding({
					oCache : null,
					oCachePromise : SyncPromise.resolve(null),
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
				oCache = {
					setActive : function () {}
				},
				oCache1 = {},
				oCacheMock = this.mock(oCache),
				oContext0 = {
					getPath : function () { return "/deep/path"; },
					getReturnValueContextId : function () { return 42; }
				},
				oJQueryMock = this.mock(jQuery),
				mLocalQueryOptions = {},
				mResultingQueryOptions = {};

			oBindingMock.expects("fetchQueryOptionsForOwnCache")
				.withExactArgs(sinon.match.same(oContext0))
				.returns(SyncPromise.resolve({
					mQueryOptions : mLocalQueryOptions,
					sReducedPath : "/reduced/path"
				}));
			oBindingMock.expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext0))
				.returns(SyncPromise.resolve("resourcePath/relative"));
			oJQueryMock.expects("extend")
				.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(mLocalQueryOptions))
				.returns(mResultingQueryOptions);
			oBindingMock.expects("doCreateCache")
				.withExactArgs("resourcePath/relative", sinon.match.same(mResultingQueryOptions),
					sinon.match.same(oContext0), "deep/path/relative")
				.returns(oCache);

			// code under test
			oBinding.fetchCache(oContext0);

			return oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oBinding.oCache, oCache);
				assert.strictEqual(oCache0.$returnValueContextId, 42);

				return oCache0;
			}).then(function (oCache0) {
				var oContext1 = oContext ? oContext : oContext0,
					mResultingQueryOptions1 = {};

				oCacheMock.expects("setActive").withExactArgs(false);
				oBindingMock.expects("fetchQueryOptionsForOwnCache")
					.withExactArgs(sinon.match.same(oContext1))
					.returns(SyncPromise.resolve({
						mQueryOptions : mLocalQueryOptions,
						sReducedPath : "/reduced/path"
					}));
				oBindingMock.expects("fetchResourcePath")
					.withExactArgs(sinon.match.same(oContext1))
					.returns(SyncPromise.resolve("resourcePath/relative"));
				oJQueryMock.expects("extend")
					.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
						sinon.match.same(mLocalQueryOptions))
					.returns(mResultingQueryOptions1);

				if (oContext) {
					oBindingMock.expects("doCreateCache")
						.withExactArgs("resourcePath/relative",
							sinon.match.same(mResultingQueryOptions1),
							sinon.match.same(oContext1), "deep/path/relative")
						.returns(oCache1);
					oCacheMock.expects("setActive").withExactArgs(true).never();
				} else {
					oCacheMock.expects("setActive").withExactArgs(true);
				}

				// code under test
				oBinding.fetchCache(oContext1);

				return oBinding.oCachePromise;
			}).then(function (oCache0) {
				assert.strictEqual(oBinding.oCache, oContext ? oCache1 : oCache);
				assert.strictEqual(oCache0, oContext ? oCache1 : oCache);
				assert.strictEqual(oBinding.sReducedPath, "/reduced/path");
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: requestor is not ready", function (assert) {
		var oRequestor = {
				ready : function () {}
			},
			oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
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
			.returns(SyncPromise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/reduced/path"
			}));
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
		assert.strictEqual(oBinding.oCache, undefined);
		return oBinding.oCachePromise.then(function (oResult) {
			assert.strictEqual(oBinding.mCacheQueryOptions, mResultingQueryOptions);
			assert.strictEqual(oResult, oCache);
			assert.strictEqual(oBinding.oCache, oCache);
			assert.strictEqual(oBinding.sReducedPath, "/reduced/path");
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bIsParentBinding) {
		QUnit.skip("fetchCache: auto-$expand/$select, parent binding " + bIsParentBinding,
			function (assert) {
				var oBinding = new ODataBinding({
						oCache : null,
						oCachePromise : SyncPromise.resolve(null),
						doCreateCache : function () {},
						oModel : {
							bAutoExpandSelect : true,
							oRequestor : {
								ready : function () { return SyncPromise.resolve(); }
							},
							mUriParameters : {}
						},
						sPath : "relative",
						aChildCanUseCachePromises : bIsParentBinding ? [] : undefined,
						bRelative : true
					}),
					oBindingMock = this.mock(oBinding),
					oCache = {},
					oContext = {},
					oDependentCanUseCachePromise,
					mLocalQueryOptions = {},
					oQueryOptionsPromise = SyncPromise.resolve(mLocalQueryOptions),
					mResultingQueryOptions = {};

				oBindingMock.expects("fetchQueryOptionsForOwnCache")
					.withExactArgs(sinon.match.same(oContext))
					.returns(oQueryOptionsPromise);
				oBindingMock.expects("fetchResourcePath")
					.withExactArgs(sinon.match.same(oContext))
					.returns(SyncPromise.resolve("resourcePath/relative"));
				this.mock(jQuery).expects("extend")
					.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
						sinon.match.same(mLocalQueryOptions))
					.returns(mResultingQueryOptions);
				oBindingMock.expects("doCreateCache")
					.withExactArgs("resourcePath/relative",
						sinon.match.same(mResultingQueryOptions), sinon.match.same(oContext))
					.returns(oCache);

				// code under test
				oBinding.fetchCache(oContext);

				// property bindings can't have dependent bindings and do not wait for dependent
				// options
				assert.strictEqual(oBinding.oCache, !bIsParentBinding ? oCache : undefined);
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
					assert.strictEqual(oBinding.oCache, oCache);
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
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
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
			oContext = {
				getPath : function () { return "/deep/path"; }
			},
			mLocalQueryOptions = {},
			mResultingQueryOptions = {};

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/reduced/path"
			}));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve("resourcePath/quasiAbsolute"));
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("resourcePath/quasiAbsolute", sinon.match.same(mResultingQueryOptions),
				sinon.match.same(oContext), "deep/path/quasiAbsolute")
			.returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
		assert.strictEqual(oCache.$resourcePath, "resourcePath/quasiAbsolute");
		assert.strictEqual(oBinding.mCacheQueryOptions, mResultingQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: relative to virtual context", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					}
				},
				bRelative : true
			}),
			oContext = {
				iIndex : Context.VIRTUAL
			};

		this.mock(oBinding).expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.resolve({}));

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: operation binding", function (assert) {
		var oCachePromise = SyncPromise.resolve({
				setActive : function () {}
			}),
			oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : oCachePromise,
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					resolve : function () {}
				},
				oOperation : {},
				sPath : "/Operation(...)"
			});

		this.mock(oBinding.oModel).expects("resolve").withExactArgs(oBinding.sPath, undefined)
			.returns("/Operation(...)");

		// code under test
		oBinding.fetchCache({/*oContext: not needed*/});

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.sReducedPath, "/Operation(...)");
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
	});

	//*********************************************************************************************
	[
		null,
		{ setActive : function () {} }
	].forEach(function (oCache, i) {
		QUnit.test("fetchCache: previous cache, " + i, function (assert) {
			var oBinding = new ODataBinding({
					oCache : oCache,
					oCachePromise : SyncPromise.resolve(oCache),
					fetchQueryOptionsForOwnCache : function () {
						return SyncPromise.resolve({/*don't care, no own cache*/});
					},
					oModel : {
						oRequestor : {
							ready : function () { return SyncPromise.resolve(); }
						}
					}
				});

			if (oCache) {
				this.mock(oCache).expects("setActive").withExactArgs(false);
			}

			// code under test
			oBinding.fetchCache();

			assert.strictEqual(oBinding.oCache, null);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: use same cache for same path", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {}
				},
				mParameters : {"$$canonicalPath" : true},
				bRelative : true
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {
				setActive : function () {}
			},
			oCacheMock = this.mock(oCache),
			oContext = {
				getPath : function () { return "/n/a"; }
			},
			oResourcePathPromise = SyncPromise.resolve(Promise.resolve("resourcePath"));

		oBindingMock.expects("fetchQueryOptionsForOwnCache").twice()
			.returns(SyncPromise.resolve({
				mQueryOptions : {},
				sReducedPath : "/reduced/path"
			}));
		oBindingMock.expects("fetchResourcePath").twice()
			.withExactArgs(sinon.match.same(oContext))
			.returns(oResourcePathPromise);
		oBindingMock.expects("doCreateCache").returns(oCache);

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, undefined);

		return oBinding.oCachePromise.then(function () {
			assert.strictEqual(oBinding.oCache, oCache);

			oCacheMock.expects("setActive").withExactArgs(false);
			oCacheMock.expects("setActive").withExactArgs(true);

			// code under test
			oBinding.fetchCache(oContext); // must not create new cache

			return oBinding.oCachePromise.then(function (oCache1) {
				assert.strictEqual(oCache1, oCache);
				assert.strictEqual(oBinding.oCache, oCache);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: no cache reuse for absolute bindings", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
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
			.returns(SyncPromise.resolve({mQueryOptions : {}}));
		oBindingMock.expects("doCreateCache").twice().returns(oCache);
		this.mock(oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCache, oCache);

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCache, oCache);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: later calls to fetchCache exist => discard cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				doCreateCache : function () {},
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					reportError : function () {},
					mUriParameters : {}
				},
				sPath : "relative",
				mParameters : {"$$canonicalPath" : true},
				bRelative : true,
				toString : function () {return "MyBinding";}
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext0 = {
				getPath : function () { return "/n/a"; }
			},
			oContext1 = {
				getPath : function () { return "/deep/path"; }
			},
			mLocalQueryOptions = {},
			oPromise,
			mResultingQueryOptions = {};

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext0))
			.returns(SyncPromise.resolve({
				mQueryOptions : {},
				sReducedPath : "/reduced/path/1"
			}));
		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext1))
			.returns(SyncPromise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/reduced/path/2"
			}));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext0))
			.returns(SyncPromise.resolve(Promise.resolve("resourcePath0")));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext1))
			.returns(SyncPromise.resolve(Promise.resolve("resourcePath1")));
		this.mock(jQuery).expects("extend")
			.withExactArgs(true, {}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mLocalQueryOptions))
			.returns(mResultingQueryOptions);
		oBindingMock.expects("doCreateCache")
			.withExactArgs("resourcePath1", sinon.match.same(mResultingQueryOptions),
				sinon.match.same(oContext1), "deep/path/relative")
			.returns(oCache);

		oBinding.fetchCache(oContext0);
		oPromise = oBinding.oCachePromise;

		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding", sClassName,
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
		]).then(function () {
			assert.strictEqual(oBinding.sReducedPath, "/reduced/path/2");
			assert.strictEqual(oBinding.oCache, oCache);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: fetchResourcePath fails", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				mCacheQueryOptions : {},
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
			oContext = {},
			oError = new Error("canonical path failure");

		oBindingMock.expects("fetchQueryOptionsForOwnCache")
			.returns(SyncPromise.resolve({mQueryOptions : {}}));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.reject(oError));
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs("Failed to create cache for binding MyBinding", sClassName,
				sinon.match.same(oError));

		// code under test
		oBinding.fetchCache(oContext);

		return oBinding.oCachePromise.then(
			function () {
				assert.ok(false, "unexpected success");
			},
			function (oError0) {
				assert.strictEqual(oError0, oError);
				assert.strictEqual(oBinding.mCacheQueryOptions, undefined,
					"cache query options stored at binding are reset");
				assert.strictEqual(oBinding.oCache, undefined);
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: relative", function (assert) {
		var oBinding = new ODataBinding();

		// code under test
		assert.strictEqual(oBinding.getRelativePath("baz"), "baz");
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: relative to resolved path", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "bar",
				bRelative : true,
				oReturnValueContext : {}
			});

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs("bar", sinon.match.same(oBinding.oContext)).returns("/foo/bar");
		this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo/bar", "/foo/bar")
			.returns("");

		// code under test
		assert.strictEqual(oBinding.getRelativePath("/foo/bar"), "");
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: not relative to resolved path", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "bar",
				bRelative : true
			});

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs("bar", sinon.match.same(oBinding.oContext)).returns("/foo/bar");
		this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo", "/foo/bar")
			.returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getRelativePath("/foo"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: return value context", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {resolve : function () {}},
				sPath : "bar",
				bRelative : true,
				oReturnValueContext : {getPath : function () {}}
			}),
			oHelperMock = this.mock(_Helper),
			sResult = {/*don't care*/};

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs("bar", sinon.match.same(oBinding.oContext)).returns("/foo/bar");
		oHelperMock.expects("getRelativePath").withExactArgs("/foo/baz", "/foo/bar")
			.returns(undefined);
		this.mock(oBinding.oReturnValueContext).expects("getPath").withExactArgs()
			.returns("/return");
		oHelperMock.expects("getRelativePath").withExactArgs("/foo/baz", "/return")
			.returns(sResult);

		// code under test
		assert.strictEqual(oBinding.getRelativePath("/foo/baz"), sResult);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSync) {
	[false, true].forEach(function (bCachePromisePending) {
		var sTitle = "withCache: cache hit; " + (bSync ? "use oCache" : "use cache promise")
				+ "; cache promise " + (bCachePromisePending ? "pending" : "fulfilled");

		QUnit.test(sTitle, function (assert) {
			var oCache = {},
				oBinding = new ODataBinding({
					oCache : !bSync && bCachePromisePending ? undefined : oCache,
					oCachePromise : bCachePromisePending
						? SyncPromise.resolve(Promise.resolve(oCache))
						: SyncPromise.resolve(oCache)
				}),
				oCallbackResult = {},
				sPath = "/foo",
				oProcessor = {
					fnProcessor : function () {}
				},
				oPromise;

			this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("~");
			this.mock(oProcessor).expects("fnProcessor")
				.withExactArgs(sinon.match.same(oCache), "~", sinon.match.same(oBinding))
				.returns(oCallbackResult);

			// code under test
			oPromise = oBinding.withCache(oProcessor.fnProcessor, sPath, bSync);

			if (bSync || !bCachePromisePending) {
				assert.strictEqual(oPromise.isFulfilled(), true);
				assert.strictEqual(oPromise.getResult(), oCallbackResult);
			}
			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, oCallbackResult);
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("withCache: cache hit, no path", function (assert) {
		var oCache = {},
			oBinding = new ODataBinding({
				oCache : undefined,
				oCachePromise : SyncPromise.resolve(Promise.resolve(oCache))
			}),
			oCallbackResult = {},
			oProcessor = {
				fnProcessor : function () {}
			};

		this.mock(oBinding).expects("getRelativePath").withExactArgs("").returns("~");
		this.mock(oProcessor).expects("fnProcessor")
			.withExactArgs(sinon.match.same(oCache), "~", sinon.match.same(oBinding))
			.returns(oCallbackResult);

		// code under test
		return oBinding.withCache(oProcessor.fnProcessor).then(function (oResult) {
			assert.strictEqual(oResult, oCallbackResult);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bSync) {
	var sTitle = "withCache: bubbling up, called with relative sPath; bSync = " + bSync;

	QUnit.test(sTitle, function (assert) {
		var oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCache : bSync ? null : {/*must not be used*/},
				oCachePromise : bSync ? {/*must not be used*/} : SyncPromise.resolve(null),
				oContext : oContext,
				sPath : "binding/path",
				isRelative : function () {}
			}),
			oContextResult = {},
			sPath = "foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(_Helper).expects("buildPath").withExactArgs(oBinding.sPath, sPath).returns("~");
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.same(fnProcessor), "~", bSync,
				sinon.match.same(bWithOrWithoutCache))
			.returns(oContextResult);

		// code under test
		oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);

		assert.strictEqual(oPromise.unwrap(), oContextResult);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSync) {
	var sTitle = "withCache: bubbling up, called with absolute path; bSync = " + bSync;

	QUnit.test(sTitle, function (assert) {
		var oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCache : bSync ? null : {/*must not be used*/},
				oCachePromise : bSync ? {/*must not be used*/} : SyncPromise.resolve(null),
				oContext : oContext,
				isRelative : function () {}
			}),
			oContextResult = {},
			sPath = "/foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

		// oBinding binding might still be relative but while bubbling up sPath is already absolute
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(_Helper).expects("buildPath").never();
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.same(fnProcessor), sPath, bSync,
				sinon.match.same(bWithOrWithoutCache))
			.returns(oContextResult);

		// code under test - simulate a call from Context#withCache
		oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);

		assert.strictEqual(oPromise.unwrap(), oContextResult);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSync) {
	var sTitle = "withCache: bubbling up, relative path does not match; bSync = " + bSync;

	QUnit.test(sTitle, function (assert) {
		var oCache = {},
			oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCache : bSync ? oCache : {/*must not be used*/},
				oCachePromise : bSync ? {/*must not be used*/} : SyncPromise.resolve(oCache),
				oContext : oContext,
				sPath : "binding/path",
				isRelative : function () {}
			}),
			oContextResult = {},
			sPath = "/foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.same(fnProcessor), sPath, bSync,
				sinon.match.same(bWithOrWithoutCache))
			.returns(oContextResult);

		// code under test
		oPromise = oBinding.withCache(fnProcessor, sPath, bSync, bWithOrWithoutCache);

		assert.strictEqual(oPromise.unwrap(), oContextResult);
	});
});

	//*********************************************************************************************
	QUnit.test("withCache: absolute, but with V4 context", function (assert) {
		var oCache = {},
			oContext = {
				withCache : function () {}
			},
			oBinding = new ODataBinding({
				oCache : oCache,
				oCachePromise : SyncPromise.resolve(oCache),
				oContext : oContext,
				sPath : "binding/path",
				isRelative : function () {}
			}),
			sPath = "/foo",
			oPromise;

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oContext).expects("withCache").never();

		// code under test
		oPromise = oBinding.withCache({/*fnProcessor*/}, sPath);

		assert.strictEqual(oPromise.unwrap(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("withCache: operation w/o cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				oOperation : {}
			});

		// code under test
		assert.strictEqual(oBinding.withCache().unwrap(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("withCache: operation w/o cache, processor called", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				oOperation : {}
			}),
			oCallbackResult = {},
			sPath = "/foo",
			oProcessor = {
				fnProcessor : function () {}
			},
			oPromise;

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns("~");
		this.mock(oProcessor).expects("fnProcessor")
			.withExactArgs(null, "~", sinon.match.same(oBinding))
			.returns(oCallbackResult);

		// code under test
		oPromise
			= oBinding.withCache(oProcessor.fnProcessor, sPath, false, /*bWithOrWithoutCache*/true);

		assert.strictEqual(oPromise.unwrap(), oCallbackResult);
	});

	//*********************************************************************************************
	QUnit.test("withCache: use oCache, but cache computation is pending", function (assert) {
		var oBinding = new ODataBinding({
				oCache : undefined,
				oCachePromise : SyncPromise.resolve(Promise.resolve(null))
//				isRelative : function () {}
			});

		// code under test
		assert.strictEqual(oBinding.withCache({/*fnProcessor*/}, "", true).unwrap(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("withCache: no cache, not relative", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				isRelative : function () {}
			});

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.withCache().unwrap(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getRootBinding: absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "/Employees",
				bRelative : false
			});

		// code under test
		assert.strictEqual(oBinding.getRootBinding(), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getRootBinding: quasi-absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {/*base context, has no method getBinding*/},
				sPath : "SO_2_SCHEDULE",
				bRelative : true
			});

		// code under test
		assert.strictEqual(oBinding.getRootBinding(), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getRootBinding: relative, unresolved binding", function (assert) {
		var oBinding = new ODataBinding({
				oContext : undefined,
				sPath : "SO_2_SCHEDULE",
				bRelative : true
			});

		// code under test
		assert.strictEqual(oBinding.getRootBinding(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getRootBinding: relative, resolved binding", function (assert) {
		var oParentBinding = {
				getRootBinding : function () {}
			},
			oBinding = new ODataBinding({
				oContext :  { // sap.ui.model.odata.v4.Context
					getBinding : function () { return oParentBinding; }
				},
				sPath : "SO_2_SCHEDULE",
				bRelative : true
			});

		this.mock(oParentBinding).expects("getRootBinding")
			.withExactArgs()
			.returns(oParentBinding);

		// code under test
		assert.strictEqual(oBinding.getRootBinding(), oParentBinding);
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding = new ODataBinding({
				bRelative : false,
				sPath : "/Employees(ID='1')"
			});

		// code under test
		assert.strictEqual(oBinding.toString(), sClassName + ": /Employees(ID='1')", "absolute");

		oBinding.sPath = "Employee_2_Team";
		oBinding.bRelative = true;

		// code under test
		assert.strictEqual(oBinding.toString(), sClassName + ": undefined|Employee_2_Team",
			"relative, unresolved");

		oBinding.oContext = {toString : function () {return "/Employees(ID='1')";}};

		// code under test
		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /Employees(ID='1')|Employee_2_Team", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: resumed", function (assert) {
		var oBinding = new ODataBinding(),
			oRootBinding = new ODataBinding();

		this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").returns(false);

		// code under test
		oBinding.checkSuspended();
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: unresolved", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("getRootBinding").returns(undefined);

		// code under test
		oBinding.checkSuspended();
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: suspended", function (assert) {
		var oBinding = new ODataBinding({
				toString : function () {return "/Foo";}
			}),
			oRootBinding = new ODataBinding();

		this.mock(oBinding).expects("getRootBinding").returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").returns(true);

		// code under test
		assert.throws(function () {
			oBinding.checkSuspended();
		}, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
	});

	//*********************************************************************************************
[undefined, "group"].forEach(function (sGroupId) {
	QUnit.test("lockGroup: groupId=" + sGroupId, function (assert) {
		var oBinding = new ODataBinding({
				oModel : {lockGroup : function () {}}
			}),
			fnCancel = {},
			oGroupLock = {},
			bLocked = {/*boolean*/},
			bModifying = {/*boolean*/};

		this.mock(oBinding).expects("getGroupId").exactly(sGroupId ? 0 : 1)
			.withExactArgs().returns("group");
		this.mock(oBinding.oModel).expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oBinding), sinon.match.same(bLocked),
				sinon.match.same(bModifying), sinon.match.same(fnCancel))
			.returns(oGroupLock);

		// code under test
		assert.strictEqual(oBinding.lockGroup(sGroupId, bLocked, bModifying, fnCancel), oGroupLock);
	});
});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, $$aggregation", function (assert) {
		// code under test
		new ODataBinding().checkBindingParameters({$$aggregation : []}, ["$$aggregation"]);
	});

	//*********************************************************************************************
	["$$groupId", "$$updateGroupId"].forEach(function (sParameter) {
		QUnit.test("checkBindingParameters, " + sParameter, function (assert) {
			var aAllowedParams = [sParameter],
				oBinding = new ODataBinding({
					oModel : {
						checkGroupId : function () {}
					}
				}),
				oBindingParameters = {
					custom : "foo"
				};

			oBindingParameters[sParameter] = "$auto";

			this.mock(oBinding.oModel).expects("checkGroupId")
				.withExactArgs("$auto", false,
					"Unsupported value for binding parameter '" + sParameter + "': ");

			// code under test
			oBinding.checkBindingParameters(oBindingParameters, aAllowedParams);

			assert.throws(function () {
				oBinding.checkBindingParameters(oBindingParameters, []);
			}, new Error("Unsupported binding parameter: " + sParameter));
		});
	});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, $$inheritExpandSelect", function (assert) {
		var aAllowedParams = ["$$inheritExpandSelect"],
			oBinding = new ODataBinding({
				oOperation : {}
			});

		assert.throws(function () {
			oBinding.checkBindingParameters({$$inheritExpandSelect : undefined}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$inheritExpandSelect': undefined"));
		assert.throws(function () {
			oBinding.checkBindingParameters({$$inheritExpandSelect : "foo"}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$inheritExpandSelect': foo"));

		// code under test
		oBinding.checkBindingParameters({$$inheritExpandSelect : true}, aAllowedParams);
		oBinding.checkBindingParameters({$$inheritExpandSelect : false}, aAllowedParams);
	});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, $$inheritExpandSelect, no operation binding",
		function (assert) {
		var aAllowedParams = ["$$inheritExpandSelect"],
			oBinding = new ODataBinding();

		assert.throws(function () {
			oBinding.checkBindingParameters({$$inheritExpandSelect : true}, aAllowedParams);
		}, new Error("Unsupported binding parameter $$inheritExpandSelect: "
				+ "binding is not an operation binding"));
	});

	//*********************************************************************************************
	[{$expand : {NavProperty : {}}}, {$select : "p0,p1"}].forEach(function (mExpandOrSelect, i) {
		QUnit.test("checkBindingParameters: $$inheritExpandSelect with $expand or $select, " + i,
			function (assert) {
			var aAllowedParams = ["$$inheritExpandSelect"],
				oBinding = new ODataBinding({
					oOperation : {}
				}),
				mParameters = jQuery.extend({
					$$inheritExpandSelect : true
				}, mExpandOrSelect);

			// code under test
			assert.throws(function () {
				oBinding.checkBindingParameters(mParameters, aAllowedParams);
			}, new Error("Must not set parameter $$inheritExpandSelect on a binding which has "
					+ "a $expand or $select binding parameter"));
		});
	});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, $$operationMode", function (assert) {
		var aAllowedParams = ["$$operationMode"],
			oBinding = new ODataBinding();

		assert.throws(function () {
			oBinding.checkBindingParameters({$$operationMode : "Client"}, aAllowedParams);
		}, new Error("Unsupported operation mode: Client"));
		assert.throws(function () {
			oBinding.checkBindingParameters({$$operationMode : SubmitMode.Auto}, aAllowedParams);
		}, new Error("Unsupported operation mode: Auto"));
		assert.throws(function () {
			oBinding.checkBindingParameters({$$operationMode : "any"}, aAllowedParams);
		}, new Error("Unsupported operation mode: any"));

		// code under test
		oBinding.checkBindingParameters({$$operationMode : "Server"}, aAllowedParams);
	});

	//*********************************************************************************************
["$$canonicalPath", "$$noPatch", "$$ownRequest", "$$patchWithoutSideEffects"]
	.forEach(function (sName) {
		QUnit.test("checkBindingParameters, " + sName, function (assert) {
			var aAllowedParameters = [sName],
				oBinding = new ODataBinding(),
				mParameters = {};

			["foo", false, undefined].forEach(function (sValue) {
				mParameters[sName] = sValue;
				assert.throws(function () {
					// code under test
					oBinding.checkBindingParameters(mParameters, aAllowedParameters);
				}, new Error("Unsupported value for binding parameter '" + sName + "': " + sValue));
			});

			mParameters[sName] = true;

			// code under test
			oBinding.checkBindingParameters(mParameters, aAllowedParameters);
		});
});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, unknown $$-parameter", function (assert) {
		var oBinding = new ODataBinding();

		assert.throws(function () {
			oBinding.checkBindingParameters({$$someName : "~"}, ["$$someName"]);
		}, new Error("Unknown binding-specific parameter: $$someName"));
	});

	//*********************************************************************************************
[{
	mExpectedCacheByResourcePath : {},
	aDeepPathsForReportBoundMessages : ["A/B(42)/C", "A/B(42)/CD", "A/B(43)/D"],
	sPrefix : "A"
}, {
	mExpectedCacheByResourcePath : {
		"A/B(42)/CD" : {
			$deepResourcePath : "A/B(42)/CD"
		},
		"B(43)/D" : {
			$deepResourcePath : "A/B(43)/D"
		}
	},
	aDeepPathsForReportBoundMessages : ["A/B(42)/C"],
	sPrefix : "A/B(42)/C"
}, {
	mExpectedCacheByResourcePath : {
		"B(43)/D" : {
			$deepResourcePath : "A/B(43)/D"
		}
	},
	aDeepPathsForReportBoundMessages : ["A/B(42)/C", "A/B(42)/CD"],
	sPrefix : "A/B(42)"
}, {
	mExpectedCacheByResourcePath : {},
	aDeepPathsForReportBoundMessages : ["A/B(42)/C", "A/B(42)/CD", "A/B(43)/D"],
	sPrefix : "A/B"
}, {
	mExpectedCacheByResourcePath : {},
	aDeepPathsForReportBoundMessages : ["A/B(42)/C", "A/B(42)/CD", "A/B(43)/D"],
	sPrefix : ""
}].forEach(function (oFixture) {
	[true, false, undefined].forEach(function (bCachesOnly) {
	var sTitle = "removeCachesAndMessages: sPrefix=" + oFixture.sPrefix + ", bCachesOnly="
			+ bCachesOnly;

	QUnit.test(sTitle, function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					reportBoundMessages : function () {},
					resolve : function () {}
				},
				sPath : {/*string*/}
			}),
			mCacheByResourcePath = {
				"A/B(42)/C" : {
					$deepResourcePath : "A/B(42)/C"
				},
				"A/B(42)/CD" : {
					$deepResourcePath : "A/B(42)/CD"
				},
				"B(43)/D" : {
					$deepResourcePath : "A/B(43)/D"
				}
			},
			oModelMock = this.mock(oBinding.oModel);

		oBinding.mCacheByResourcePath = undefined;
		this.mock(oBinding.oModel).expects("resolve").exactly(bCachesOnly !== true ? 2 : 0)
			.withExactArgs(sinon.match.same(oBinding.sPath), sinon.match.same(oBinding.oContext))
			.returns("/~");
		oModelMock.expects("reportBoundMessages").exactly(bCachesOnly !== true ? 2 : 0)
			.withExactArgs("~", {});

		// code under test
		oBinding.removeCachesAndMessages(oFixture.sPrefix, bCachesOnly);

		oBinding.mCacheByResourcePath = mCacheByResourcePath;
		oFixture.aDeepPathsForReportBoundMessages.forEach(function (sDeepPath) {
			oModelMock.expects("reportBoundMessages").exactly(bCachesOnly !== true ? 1 : 0)
				.withExactArgs(sDeepPath, {});
		});

		// code under test
		oBinding.removeCachesAndMessages(oFixture.sPrefix, bCachesOnly);

		assert.deepEqual(oBinding.mCacheByResourcePath, oFixture.mExpectedCacheByResourcePath);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("removeCachesAndMessages: with unresolved path", function (assert) {
		var oBinding = new ODataBinding({
				oContext : {},
				oModel : {
					reportBoundMessages : function () {},
					resolve : function () {}
				},
				sPath : "TEAM_2_EMPLOYEES"
			});

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
			.returns(undefined);
		this.mock(oBinding.oModel).expects("reportBoundMessages").never();

		// code under test
		oBinding.removeCachesAndMessages("");
	});

	//*********************************************************************************************
	QUnit.test("fetchResourcePath for unresolved binding", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "SO_2_SOITEM",
				bRelative : true
			});

		// code under test
		return oBinding.fetchResourcePath().then(function (sResourcePath) {
			assert.strictEqual(sResourcePath, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchResourcePath for absolute binding", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "/SalesOrderList",
				bRelative : false
			});

		// code under test
		return oBinding.fetchResourcePath({/*oContext*/}).then(function (sResourcePath) {
			assert.strictEqual(sResourcePath, "SalesOrderList");
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bCallWithContext, i) {
		[undefined, true].forEach(function (bCanonicalPath, j) {
			QUnit.test("fetchResourcePath, base context, " + i + ", " + j, function (assert) {
				var oBinding,
					oContext = {
						getPath : function () {}
					},
					mTemplate = {sPath : "SO_2_SOITEM", bRelative : true};

				if (bCanonicalPath) {
					mTemplate.mParameters = {$$canonicalPath : true};
				}
				if (!bCallWithContext) {
					mTemplate.oContext = oContext;
				}
				oBinding = new ODataBinding(mTemplate);
				this.mock(oContext).expects("getPath").withExactArgs()
					.returns("/SalesOrderList('42')");
				this.mock(_Helper).expects("buildPath")
					.withExactArgs("/SalesOrderList('42')", "SO_2_SOITEM")
					.returns("/SalesOrderList('42')/SO_2_SOITEM");

				// code under test
				return oBinding.fetchResourcePath(bCallWithContext ? oContext : undefined)
					.then(function (sResourcePath) {
						assert.strictEqual(sResourcePath, "SalesOrderList('42')/SO_2_SOITEM");
					});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchResourcePath, V4 context, no canonical path", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "bindingPath",
				bRelative : true
			}),
			oContext = {
				fetchCanonicalPath : function () {},
				getPath : function () {}
			};

		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/SalesOrderList('42')/SO_2_BP");
		this.mock(oContext).expects("fetchCanonicalPath").never();
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/SalesOrderList('42')/SO_2_BP", "bindingPath")
			.returns("/SalesOrderList('42')/SO_2_BP/bindingPath");

		// code under test
		return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
			assert.strictEqual(sResourcePath, "SalesOrderList('42')/SO_2_BP/bindingPath");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchResourcePath, V4 context, canonical path", function (assert) {
		var oBinding = new ODataBinding({
				mParameters : {$$canonicalPath : true},
				sPath : "bindingPath",
				bRelative : true
			}),
			oContext = {
				fetchCanonicalPath : function () {},
				getPath : function() {}
			};

		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/SalesOrderList('42')/SO_2_BP");
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/BusinessPartnerList('77')"));
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/BusinessPartnerList('77')", "bindingPath")
			.returns("/BusinessPartnerList('77')/bindingPath");

		// code under test
		return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
			assert.strictEqual(sResourcePath, "BusinessPartnerList('77')/bindingPath");
		});
	});

	//*********************************************************************************************
	[undefined, true].forEach(function (bCanonicalPath) {
		[
			"/A/1",
			"/A/1/SO_2_BP(id=42)",
			"/A($uid=id-1-23)",
			"/A($uid=id-1-23)/A_2_B(id=42)"
		].forEach(function (sContextPath) {
			var sTitle = "fetchResourcePath, V4 context, $$canonicalPath " + bCanonicalPath
					+ ", path: " + sContextPath;

			QUnit.test(sTitle, function (assert) {
				var mTemplate = bCanonicalPath
						? {mParameters : {$$canonicalPath : true}, sPath : "c", bRelative : true}
						: {sPath : "c", bRelative : true},
					oBinding = new ODataBinding(mTemplate),
					oContext = {
						fetchCanonicalPath : function () {},
						getPath : function () {}
					},
					sFetchCanonicalPath = "/canonicalPath";

				this.mock(oContext).expects("getPath").withExactArgs().returns(sContextPath);
				this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
					.returns(SyncPromise.resolve(sFetchCanonicalPath));
				this.mock(_Helper).expects("buildPath")
					.withExactArgs(sFetchCanonicalPath, "c")
					.returns("/canonicalPath/c");

				// code under test
				return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
					assert.strictEqual(sResourcePath, "canonicalPath/c");
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchResourcePath, fetchCanonicalPath rejects", function (assert) {
		var oBinding = new ODataBinding({bRelative : true, mParameters : {$$canonicalPath : true}}),
			oContext = {
				fetchCanonicalPath : function () {},
				getPath : function () {}
			},
			oError = {};

		this.mock(oContext).expects("getPath").withExactArgs().returns("/SalesOrderList/1");
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject(oError));

		// code under test
		return oBinding.fetchResourcePath(oContext).then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("isRootBindingSuspended", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding),
			bResult = {/*true or false */},
			oRootBinding = new ODataBinding();

		oBindingMock.expects("getRootBinding").withExactArgs().returns(undefined);

		// code under test - no root binding
		assert.notOk(oBinding.isRootBindingSuspended());

		oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(bResult);

		// code under test - with root binding
		assert.strictEqual(oBinding.isRootBindingSuspended(), bResult);
	});

	//*********************************************************************************************
	QUnit.test("getRootBindingResumePromise", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding),
			oResumePromise = {},
			oRootBinding = new ODataBinding({getResumePromise : function () {}});

		oBindingMock.expects("getRootBinding").withExactArgs().returns(undefined);

		// code under test - no root binding
		assert.strictEqual(oBinding.getRootBindingResumePromise(), SyncPromise.resolve());

		oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
		this.mock(oRootBinding).expects("getResumePromise").withExactArgs()
			.returns(oResumePromise);

		// code under test - with root binding
		assert.strictEqual(oBinding.getRootBindingResumePromise(), oResumePromise);
	});

	//*********************************************************************************************
	QUnit.test("setResumeChangeReason", function (assert) {
		var oBinding = new ODataBinding();

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Change);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Sort);
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Filter);
		oBinding.setResumeChangeReason(ChangeReason.Sort);
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Filter);
	});

	//*********************************************************************************************
	QUnit.test("doDeregisterChangeListener", function (assert) {
		var oBinding = new ODataBinding(),
			oCache = {
				deregisterChange : function () {}
			},
			oListener = {},
			sPath = "foo";

		oBinding.oCache = oCache;
		this.mock(oCache).expects("deregisterChange")
			.withExactArgs(sPath, sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener(sPath, oListener);
	});

	//*********************************************************************************************
	QUnit.test("allow for super calls", function (assert) {
		var oBinding = new ODataBinding();

		assert.strictEqual(asODataBinding.prototype.doDeregisterChangeListener,
			oBinding.doDeregisterChangeListener);
		assert.strictEqual(asODataBinding.prototype.destroy, oBinding.destroy);
		assert.strictEqual(asODataBinding.prototype.hasPendingChangesForPath,
			oBinding.hasPendingChangesForPath);
	});
});