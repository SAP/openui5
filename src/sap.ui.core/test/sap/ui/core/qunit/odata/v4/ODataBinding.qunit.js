/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataBinding",
	"sap/ui/model/odata/v4/SubmitMode",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, Binding, ChangeReason, Context, asODataBinding, SubmitMode,
		_Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataBinding";

	function mustBeMocked() { throw new Error("Must be mocked"); }

	/**
	 * Returns a function which must not be called. Use as a replacment for
	 * {@link sap.ui.model.odata.v4.ODataModel#getReporter} in cases where that reporter must not be
	 * used.
	 *
	 * @returns {function} - A function which must not be called
	 */
	function getForbiddenReporter() {
		return function () {
			throw new Error("must not be called");
		};
	}

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
			getResolvedPath : function () {}, // @see sap.ui.model.Binding#getResolvedPath
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
		assert.ok(oBinding.hasOwnProperty("sResumeChangeReason"));
		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding = new ODataBinding(),
			oCache = {
				deregisterChangeListener : function () {},
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
		this.mock(oCache).expects("deregisterChangeListener")
			.withExactArgs("", sinon.match.same(oBinding));
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
	QUnit.test("checkUpdate: success", function () {
		var oBinding = new ODataBinding({
				checkUpdateInternal : function () {},
				oModel : {
					getReporter : function () {
						return function () { throw new Error(); };
					}
				}
			});

		this.mock(oBinding).expects("checkUpdateInternal").withExactArgs("~bForceUpdate~")
			.resolves();

		// code under test
		oBinding.checkUpdate("~bForceUpdate~");
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: illegal parameter", function (assert) {
		assert.throws(function () {
			new ODataBinding().checkUpdate({/*false or true*/}, {/*additional argument*/});
		}, new Error("Only the parameter bForceUpdate is supported"));
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: checkUpdateInternal rejects", function () {
		var oBinding = new ODataBinding({
				checkUpdateInternal : function () {},
				oModel : {
					getReporter : function () {}
				}
			}),
			oError = new Error(),
			oPromise = Promise.reject(oError),
			fnReporter = sinon.spy();

		this.mock(oBinding).expects("checkUpdateInternal").withExactArgs("~bForceUpdate~")
			.returns(oPromise);
		this.mock(oBinding.oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oBinding.checkUpdate("~bForceUpdate~");

		return oPromise.catch(function () {
			sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
		});
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
[false, true].forEach((bRoot) => {
	QUnit.test(`requestRefresh: success, root = ${bRoot}`, function (assert) {
		var oBinding = new ODataBinding({
				oModel : {},
				refreshInternal : function () {}
			}),
			oPromise,
			bRefreshed = false;

		if (!bRoot) {
			oBinding.mParameters = {$$ownRequest : true};
		}
		this.mock(oBinding).expects("isRoot").exactly(bRoot ? 1 : 0).withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(false);
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true)
			.callsFake(function () {
				return new SyncPromise(function (resolve) {
					setTimeout(function () {
						bRefreshed = true;
						resolve("~");
					}, 0);
				});
			});

		oPromise = oBinding.requestRefresh("groupId");

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.ok(bRefreshed);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestRefresh: reject", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {},
				refreshInternal : function () {}
			}),
			oError = new Error();

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(false);
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId");
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "groupId", true)
			.rejects(oError);

		// code under test
		return oBinding.requestRefresh("groupId").then(function () {
			assert.ok(false);
		}, function (oResultingError) {
			assert.strictEqual(oResultingError, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh: reject", function () {
		var oBinding = new ODataBinding({
				oModel : {getReporter : function () {}}
			}),
			oError = new Error(),
			oPromise = Promise.reject(oError),
			fnReporter = sinon.spy();

		this.mock(oBinding).expects("requestRefresh").withExactArgs("groupId").returns(oPromise);
		this.mock(oBinding.oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oBinding.refresh("groupId");

		return oPromise.catch(function () {
			sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh: unsupported parameter bForceUpdate", function (assert) {
		var oBinding = new ODataBinding({});

		this.mock(oBinding).expects("requestRefresh").never();

		assert.throws(function () {
			// code under test
			oBinding.refresh(true);
		}, new Error("Unsupported parameter bForceUpdate"));
	});

	//*********************************************************************************************
[false, true].forEach((bHasParams) => {
	QUnit.test(`requestRefresh: not refreshable, but has params=${bHasParams}`, function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			});

		if (bHasParams) {
			oBinding.mParameters = {}; // no $$ownRequest here!
		}

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);

		assert.throws(function () {
			oBinding.requestRefresh();
		}, new Error("Refresh on this binding is not supported"));
	});
});

	//*********************************************************************************************
	QUnit.test("requestRefresh: pending changes", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			});

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(true);

		assert.throws(function () {
			oBinding.requestRefresh();
		}, new Error("Cannot refresh due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: invalid group ID", function (assert) {
		var oBinding = new ODataBinding({
				oModel : {}
			}),
			oError = new Error();

		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs(true).returns(false);
		this.mock(_Helper).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.requestRefresh("$invalid");
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
	QUnit.test("_hasPendingChanges", function (assert) {
		var oBinding = new ODataBinding({
				isResolved : function () {}
			}),
			oBindingMock = this.mock(oBinding),
			bResult = {/*some boolean*/};

		oBindingMock.expects("isResolved").withExactArgs().returns(false);
		oBindingMock.expects("hasPendingChangesForPath").never();
		oBindingMock.expects("hasPendingChangesInDependents").never();

		// code under test
		assert.strictEqual(oBinding._hasPendingChanges(), false);

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("", "~bIgnoreKeptAlive~")
			.returns(true);
		oBindingMock.expects("hasPendingChangesInDependents").never();

		// code under test
		assert.strictEqual(oBinding._hasPendingChanges("~bIgnoreKeptAlive~",
			"~sPathPrefix~"), true);

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("hasPendingChangesForPath").withExactArgs("", "~bIgnoreKeptAlive~")
			.returns(false);
		oBindingMock.expects("hasPendingChangesInDependents")
			.withExactArgs("~bIgnoreKeptAlive~", "~sPathPrefix~")
			.returns(bResult);

		// code under test
		assert.strictEqual(oBinding._hasPendingChanges("~bIgnoreKeptAlive~",
			"~sPathPrefix~"), bResult);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("_hasPendingChanges").withExactArgs("~bIgnoreKeptAlive~")
			.returns("~bResult~");

		// code under test
		assert.strictEqual(
			oBinding.hasPendingChanges("~bIgnoreKeptAlive~", {/*not passed to _hasPendingCh...*/}),
			"~bResult~");
	});

	//*********************************************************************************************
[false, true].forEach(function (bIgnoreKeptAlive) {
	["root", "$$ownRequest", "others"].forEach(function (sCase) {
	var sTitle = "hasPendingChangesForPath, bIgnoreKeptAlive = " + bIgnoreKeptAlive
			+ ", case = " + sCase;

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oCache = {
				hasPendingChangesForPath : function () {}
			},
			oExpectation,
			bIgnoreTransient = false,
			oTemplate = {
				mParameters : {},
				isRoot : mustBeMocked
			},
			oWithCachePromise = {unwrap : function () {}};

		if (sCase === "$$ownRequest") {
			oTemplate.mParameters.$$ownRequest = true;
		}
		if (bIgnoreKeptAlive) {
			switch (sCase) {
				case "root":
				case "$$ownRequest":
					bIgnoreTransient = true;
					break;

				case "others":
					bIgnoreTransient = undefined;
					break;

				// no default
			}
		}
		oBinding = new ODataBinding(oTemplate);
		oExpectation = this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.func, "some/path", true)
			.returns(oWithCachePromise);
		this.mock(oWithCachePromise).expects("unwrap").withExactArgs().returns("~vResult~");

		// code under test
		assert.strictEqual(oBinding.hasPendingChangesForPath("some/path", bIgnoreKeptAlive),
			"~vResult~");

		this.mock(oBinding).expects("isRoot").exactly(bIgnoreKeptAlive ? 1 : 0)
			.withExactArgs().returns(sCase === "root");
		this.mock(oCache).expects("hasPendingChangesForPath")
			.withExactArgs("~sCachePath~", bIgnoreKeptAlive, bIgnoreTransient)
			.returns("~bResult~");

		// code under test
		assert.strictEqual(oExpectation.firstCall.args[0](oCache, "~sCachePath~", oBinding),
			"~bResult~");
	});
	});
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
			b : oCache0,
			c : oCache1,
			d : oCache2
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
	QUnit.test("_resetChanges", function (assert) {
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
			.callsFake(function (_sPath, aPromises) {
				aPromises.push(oResetChangesForPathPromise);
			});
		oBindingMock.expects("resetChangesInDependents")
			.withExactArgs([oResetChangesForPathPromise], "~bIgnoreKeptAlive~")
			.callsFake(function (aPromises) {
				assert.strictEqual(aPromises, oExpectation.firstCall.args[1]);

				aPromises.push(oResetChangesInDependentsPromise);
			});
		oBindingMock.expects("resetInvalidDataState").withExactArgs();

		// code under test
		oResetChangesPromise = oBinding._resetChanges("~bIgnoreKeptAlive~");
		assert.ok(oResetChangesPromise instanceof Promise);

		return oResetChangesPromise.then(function (oResult) {
			assert.ok(oResetChangesForPathPromise.isFulfilled());
			assert.ok(oResetChangesInDependentsPromise.isFulfilled());
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("resetChanges", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("checkTransient").withExactArgs();
		this.mock(oBinding).expects("_resetChanges").withExactArgs()
			.returns("~bResult~");

		// code under test
		assert.strictEqual(oBinding.resetChanges({/*not passed to _resetChanges*/}), "~bResult~");
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
	QUnit.test("resetInvalidDataState", function () {
		new ODataBinding().resetInvalidDataState(); // the function exists and does not fail
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsPromise) {
	[{
		oTemplate : {sPath : "/absolute", bRelative : false}
	}, {
		oContext : {getPath : function () { return "/baseContext"; }},
		oTemplate : {sPath : "quasiAbsolute", bRelative : true}
	}, {
		oContext : Context.create({}, {}, "/v4Context"),
		oTemplate : {
			mParameters : {$$groupId : "myGroup"},
			sPath : "relativeWithParameters",
			bRelative : true
		}
	}, {
		oContext : Context.create({}, {}, "/v4Context"),
		oTemplate : {
			aChildCanUseCachePromises : [],
			oModel : {bAutoExpandSelect : true},
			mParameters : {$$aggregation : {/*irrelevant*/}},
			sPath : "relativeWithDataAggregation",
			bRelative : true
		},
		isDataAggregation : true
	}, {
		oContext : Context.create({}, {}, "/v4Context"),
		bIgnoreParentCache : true,
		oTemplate : {sPath : "ignoreParentCache", bRelative : true}
	}].forEach(function (oFixture) {
		var sTitle = "fetchOrGetQueryOptionsForOwnCache returns query options: "
				+ oFixture.oTemplate.sPath + "; query options as promise: " + bAsPromise;

		QUnit.test(sTitle, function (assert) {
			var oBinding,
				oBindingMock,
				mQueryOptions = {};

			oBinding = new ODataBinding(oFixture.oTemplate);
			oBinding.oModel = Object.assign({
				resolve : function () {}
			}, oFixture.oTemplate.oModel);
			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext))
				.returns("/resolved/path");
			oBinding.doFetchOrGetQueryOptions = function () {};
			oBindingMock = this.mock(oBinding);
			oBindingMock.expects("doFetchOrGetQueryOptions")
				.withExactArgs(sinon.match.same(oFixture.oContext))
				.returns(bAsPromise ? SyncPromise.resolve(mQueryOptions) : mQueryOptions);
			this.mock(_Helper).expects("isDataAggregation")
				.exactly(oFixture.isDataAggregation ? 1 : 0)
				.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(true);

			assert.deepEqual(
				// code under test
				oBinding.fetchOrGetQueryOptionsForOwnCache(oFixture.oContext,
					oFixture.bIgnoreParentCache), {
				sReducedPath : "/resolved/path",
				mQueryOptions : mQueryOptions
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchOrGetQueryOptionsForOwnCache: promise rejected", function (assert) {
		var oBinding = new ODataBinding({
				doFetchOrGetQueryOptions : mustBeMocked,
				oModel : {resolve : mustBeMocked},
				sPath : "/absolute",
				bRelative : false
			}),
			oContext = {},
			oError = new Error();

		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs("/absolute", sinon.match.same(oContext))
			.returns("/resolved/path");
		this.mock(oBinding).expects("doFetchOrGetQueryOptions")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.reject(oError));

		// code under test
		oBinding.fetchOrGetQueryOptionsForOwnCache(oContext).then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	[
		{sPath : "unresolvedRelative", bRelative : true},
		{oOperation : {}, sPath : "operation"},
		{isMeta : function () { return true; }, sPath : "/data##meta"}
	].forEach(function (oTemplate) {
		QUnit.test("fetchOrGetQueryOptionsForOwnCache returns undefined: " + oTemplate.sPath,
			function (assert) {
				var oBinding,
					sResolvedPath = oTemplate.bRelative ? undefined : "/resolved/path";

				oTemplate.oModel = {
					resolve : function () {}
				};
				// Note: no #doFetchOrGetQueryOptions available
				oBinding = new ODataBinding(oTemplate);
				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, undefined)
					.returns(sResolvedPath);

				// code under test
				assert.deepEqual(oBinding.fetchOrGetQueryOptionsForOwnCache(), {
					mQueryOptions : undefined,
					sReducedPath : sResolvedPath
				});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsPromise) {
	[{
		oContext : Context.create({}, {}, "/v4Context"),
		oTemplate : {
			oModel : {resolve : function () {}},
			sPath : "relativeWithEmptyParameters",
			mParameters : {},
			bRelative : true
		}
	}, {
		oContext : Context.create({}, {}, "/v4Context"),
		oTemplate : {
			oModel : {resolve : function () {}},
			sPath : "relativeWithNoParameters",
			bRelative : true
		}
	}].forEach(function (oFixture) {
		var sTitle = "fetchOrGetQueryOptionsForOwnCache returns undefined: "
				+ oFixture.oTemplate.sPath + "; query options as promise: " + bAsPromise;

		QUnit.test(sTitle, function (assert) {
			var oBinding = new ODataBinding(oFixture.oTemplate),
				oBindingMock = this.mock(oBinding),
				mQueryOptions = {$filter : "filterValue"};

			this.mock(oBinding.oModel).expects("resolve").twice()
				.withExactArgs(oBinding.sPath, sinon.match.same(oFixture.oContext))
				.returns("/resolved/path");
			oBinding.doFetchOrGetQueryOptions = function () {};
			oBindingMock.expects("doFetchOrGetQueryOptions")
				.withExactArgs(sinon.match.same(oFixture.oContext))
				.returns(bAsPromise ? SyncPromise.resolve({}) : {});

			// code under test
			assert.deepEqual(oBinding.fetchOrGetQueryOptionsForOwnCache(oFixture.oContext), {
				mQueryOptions : undefined,
				sReducedPath : "/resolved/path"
			});

			oBindingMock.expects("doFetchOrGetQueryOptions")
				.withExactArgs(sinon.match.same(oFixture.oContext))
				.returns(bAsPromise ? SyncPromise.resolve(mQueryOptions) : mQueryOptions);

			// code under test
			assert.deepEqual(oBinding.fetchOrGetQueryOptionsForOwnCache(oFixture.oContext), {
				mQueryOptions : mQueryOptions,
				sReducedPath : "/resolved/path"
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchOrGetQueryOptionsForOwnCache, auto-$expand/$select: can use parent's cache",
		function (assert) {
			var fnFetchMetadata = function () {},
				oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchOrGetQueryOptions : function () {},
					oModel : {
						bAutoExpandSelect : true,
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					mParameters : {}, // not a property binding
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

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
				.returns("/resolved/path");
			this.mock(oBinding).expects("doFetchOrGetQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(Promise.resolve(mCurrentBindingQueryOptions)));
			this.mock(_Helper).expects("isDataAggregation")
				.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
			oExpectation = this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withExactArgs(sinon.match.same(oContext), "relative",
					sinon.match.instanceOf(SyncPromise), false)
				.returns(SyncPromise.resolve("/reduced/path"));

			// code under test
			oQueryOptionsForOwnCachePromise = oBinding.fetchOrGetQueryOptionsForOwnCache(oContext);

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
	QUnit.test("fetchOrGetQueryOptionsForOwnCache, auto-$expand/$select: can't use parent's cache",
		function (assert) {
			var fnFetchMetadata = function () {},
				oBinding = new ODataBinding({
					mAggregatedQueryOptions : {},
					aChildCanUseCachePromises : [], // binding is a parent binding
					doFetchOrGetQueryOptions : function () {},
					oModel : {
						bAutoExpandSelect : true,
						oInterface : {
							fetchMetadata : fnFetchMetadata
						},
						resolve : function () {}
					},
					mParameters : {}, // not a property binding
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

			this.mock(oBinding.oModel).expects("resolve")
				.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
				.returns("/resolved/path");
			this.mock(oBinding).expects("doFetchOrGetQueryOptions")
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(Promise.resolve(mCurrentBindingQueryOptions)));
			this.mock(_Helper).expects("isDataAggregation")
				.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
			this.mock(oBinding).expects("updateAggregatedQueryOptions")
				.withExactArgs(sinon.match.same(mCurrentBindingQueryOptions));
			this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
				.withExactArgs(sinon.match.same(oContext), "relative",
					sinon.match.instanceOf(SyncPromise), false)
				.returns(SyncPromise.resolve(undefined));

			// code under test
			oQueryOptionsForOwnCachePromise = oBinding.fetchOrGetQueryOptionsForOwnCache(oContext);

			// query options of dependent bindings are aggregated synchronously after
			// fetchOrGetQueryOptionsForOwnCache
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
		[false, true].forEach(function (bHasQueryOptions) {
		QUnit.test("fetchOrGetQueryOptionsForOwnCache, auto-$expand/$select: non-parent binding, "
				+ "can use cache " + bCanUseCache + ", has query=" + bHasQueryOptions,
			function (assert) {
				var oBinding = new ODataBinding({
						doFetchOrGetQueryOptions : function () {},
						oModel : {
							bAutoExpandSelect : true,
							resolve : function () {}
						},
						// no mParameters here! (the only non-parent binding is ODPropertyBinding)
						sPath : "relative",
						bRelative : true
					}),
					oParentBinding = {
						fetchIfChildCanUseCache : function () {}
					},
					vQueryOptions = bHasQueryOptions
						? SyncPromise.resolve(Promise.resolve("~mLocalQueryOptions~"))
						: undefined,
					oContext = Context.create({}, oParentBinding, "/v4Context");

				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
					.returns("/resolved/path");
				this.mock(oBinding).expects("doFetchOrGetQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(vQueryOptions);
				this.mock(oParentBinding).expects("fetchIfChildCanUseCache")
					.withExactArgs(sinon.match.same(oContext), "relative",
						sinon.match.same(vQueryOptions), true)
					.returns(SyncPromise.resolve(bCanUseCache ? "/reduced/path" : undefined));

				// code under test
				return oBinding.fetchOrGetQueryOptionsForOwnCache(oContext)
					.then(function (oResult) {
						if (bCanUseCache) {
							assert.deepEqual(oResult, {
								sReducedPath : "/reduced/path",
								mQueryOptions : undefined
							});
						} else {
							assert.deepEqual(oResult, {
								sReducedPath : "/resolved/path",
								mQueryOptions : bHasQueryOptions ? "~mLocalQueryOptions~" : {}
							});
						}
					});
		});
		});
	});

	//*********************************************************************************************
	[{custom : "foo"}, {$$groupId : "foo"}].forEach(function (mParameters) {
		QUnit.test("fetchOrGetQueryOptionsForOwnCache, auto-$expand/$select: "
				+ "not only system query options",
			function (assert) {
				var oBinding = new ODataBinding({
						doFetchOrGetQueryOptions : function () {},
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
					mQueryOptions = {};

				this.mock(oBinding.oModel).expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
					.returns("/resolved/path");
				oBindingMock = this.mock(oBinding);
				oBindingMock.expects("doFetchOrGetQueryOptions")
					.withExactArgs(sinon.match.same(oContext))
					.returns(SyncPromise.resolve(mQueryOptions));

				// code under test
				assert.deepEqual(oBinding.fetchOrGetQueryOptionsForOwnCache(oContext), {
					mQueryOptions : mQueryOptions,
					sReducedPath : "/resolved/path"
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: absolute binding", function (assert) {
		var oOldCache = {},
			mLateQueryOptions = {},
			oBinding = new ODataBinding({
				oCache : oOldCache,
				oCachePromise : SyncPromise.resolve(null),
				doCreateCache : function () {},
				mLateQueryOptions : mLateQueryOptions,
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {},
					getReporter : getForbiddenReporter,
					waitForKeepAliveBinding : mustBeMocked
				},
				sPath : "/absolute",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			oNewCache = {},
			oContext = {},
			bIgnoreParentCache = {},
			mLocalQueryOptions = {};

		oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(undefined, sinon.match.same(bIgnoreParentCache))
			.returns(SyncPromise.resolve(Promise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/resolved/path"
			})));
		oBindingMock.expects("prepareDeepCreate")
			.withExactArgs(undefined, sinon.match.same(mLocalQueryOptions))
			.returns(false);
		oBindingMock.expects("fetchResourcePath").withExactArgs(undefined)
			.returns(SyncPromise.resolve("absolute"));
		this.mock(oBinding.oModel).expects("waitForKeepAliveBinding")
			.withExactArgs(sinon.match.same(oBinding))
			.callsFake(async function () {
				await "next tick";
				oBindingMock.expects("createAndSetCache")
					.withExactArgs(sinon.match.same(mLocalQueryOptions), "absolute", undefined,
						"~sGroupId~", sinon.match.same(oOldCache))
					.returns(oNewCache);
			});

		// code under test
		oBinding.fetchCache(oContext, bIgnoreParentCache, undefined, "~sGroupId~");

		assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
		assert.ok(oBinding.oCachePromise.isPending());

		return oBinding.oCachePromise.then(function () {
			assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
			assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
			assert.strictEqual(oBinding.oFetchCacheCallToken, undefined, "cleaned up");
		});
	});

	//*********************************************************************************************
	// fixture is [bQueryOptionsAsync, bResourcePathAsync]
	[[false, false], [false, true], [true, false], [true, true]].forEach(function (aFixture) {
		QUnit.test("fetchCache: relative binding with context, " + aFixture, function (assert) {
			var mLateQueryOptions = {},
				oBinding = new ODataBinding({
					oCache : null,
					oCachePromise : SyncPromise.resolve(null),
					doCreateCache : function () {},
					mLateQueryOptions : mLateQueryOptions,
					oModel : {
						oRequestor : {
							ready : function () { return SyncPromise.resolve(); }
						},
						mUriParameters : {},
						getReporter : getForbiddenReporter,
						waitForKeepAliveBinding : mustBeMocked
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
					? Promise.resolve("resourcePath") : "resourcePath");

			oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
				.withExactArgs(sinon.match.same(oContext), undefined)
				.returns(oQueryOptionsPromise);
			oBindingMock.expects("prepareDeepCreate")
				.withExactArgs(sinon.match.same(oContext), sinon.match.same(mLocalQueryOptions))
				.returns(false);
			oBindingMock.expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(oResourcePathPromise);
			this.mock(oBinding.oModel).expects("waitForKeepAliveBinding")
				.withExactArgs(sinon.match.same(oBinding))
				.callsFake(function () {
					oBindingMock.expects("createAndSetCache")
						.withExactArgs(sinon.match.same(mLocalQueryOptions), "resourcePath",
							sinon.match.same(oContext), undefined, null)
						.callsFake(function () {
							oBinding.oCache = oCache;
							return oCache;
						});
					return SyncPromise.resolve();
				});

			// code under test
			oBinding.fetchCache(oContext);

			assert.strictEqual(oBinding.oCache,
				!bQueryOptionsAsync && !bResourcePathAsync ? oCache : undefined);
			assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
			assert.strictEqual(oBinding.oCachePromise.isFulfilled(),
				!bQueryOptionsAsync && !bResourcePathAsync);

			return oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oCache0, oCache);
				assert.strictEqual(oBinding.sReducedPath, "/resolved/path");
				assert.strictEqual(oBinding.oFetchCacheCallToken, undefined, "cleaned up");
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
					mUriParameters : {},
					getReporter : getForbiddenReporter,
					waitForKeepAliveBinding : mustBeMocked
				},
				sPath : "/absolute",
				bRelative : false
			}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			mLocalQueryOptions = {},
			that = this;

		oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(undefined, undefined)
			.returns(SyncPromise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/reduced/path"
			}));
		oBindingMock.expects("createAndSetCache").never(); // Do not expect cache creation yet
		this.mock(oRequestor).expects("ready")
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				// Now that the requestor is ready, the cache must be created
				oBindingMock.expects("prepareDeepCreate")
					.withExactArgs(undefined, sinon.match.same(mLocalQueryOptions))
					.returns(false);
				oBindingMock.expects("fetchResourcePath").withExactArgs(undefined)
					.returns(SyncPromise.resolve("absolute"));
				let bWaitedForKeepAliveBinding = false;
				that.mock(oBinding.oModel).expects("waitForKeepAliveBinding")
					.withExactArgs(sinon.match.same(oBinding))
					.callsFake(function () {
						bWaitedForKeepAliveBinding = true;
						return SyncPromise.resolve();
					});
				oBindingMock.expects("createAndSetCache")
					.withExactArgs(sinon.match.same(mLocalQueryOptions), "absolute", undefined,
						undefined, null)
					.callsFake(function () {
						assert.strictEqual(bWaitedForKeepAliveBinding, true);
						return oCache;
					});
			})));

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCachePromise.isFulfilled(), false);
		assert.strictEqual(oBinding.oCache, undefined);
		return oBinding.oCachePromise.then(function (oResult) {
			assert.strictEqual(oResult, oCache);
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
							mUriParameters : {},
							getReporter : getForbiddenReporter
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

				oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
					.withExactArgs(sinon.match.same(oContext), undefined)
					.returns(oQueryOptionsPromise);
				oBindingMock.expects("fetchResourcePath")
					.withExactArgs(sinon.match.same(oContext))
					.returns(SyncPromise.resolve("resourcePath/relative"));
				this.mock(Object).expects("assign")
					.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
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
	QUnit.test("fetchCache: prepareDeepCreate prevents cache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					getReporter : getForbiddenReporter
				},
				bRelative : true
			}),
			oContext = {};

		this.mock(oBinding).expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext), undefined)
			.returns(SyncPromise.resolve({mQueryOptions : "~mQueryOptions~"}));
		this.mock(oBinding).expects("prepareDeepCreate")
			.withExactArgs(sinon.match.same(oContext), "~mQueryOptions~")
			.returns(true);
		this.mock(oBinding).expects("fetchResourcePath").never();

		// code under test
		oBinding.fetchCache(oContext);

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: previous cache", function (assert) {
		var oCache = {
				setActive : function () {}
			},
			oBinding = new ODataBinding({
				oCache : oCache,
				oCachePromise : SyncPromise.resolve(oCache),
				oModel : {
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					getReporter : getForbiddenReporter
				}
			});

		oBinding.sReducedPath = "~sReducedPath~";
		this.mock(oBinding).expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(undefined, undefined)
			.returns(SyncPromise.resolve({})); // no mQueryOptions or sReducedPath
		this.mock(oBinding).expects("prepareDeepCreate")
			.withExactArgs(undefined, undefined).returns(true);
		this.mock(oBinding).expects("fetchResourcePath").never();
		this.mock(oCache).expects("setActive").withExactArgs(false);

		// code under test
		oBinding.fetchCache();

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.sReducedPath, "~sReducedPath~", "unchanged");
		assert.deepEqual(oBinding.oFetchCacheCallToken, {oOldCache : undefined},
			"no old cache kept");
	});

	//*********************************************************************************************
[false, true].forEach(function (bSameCache) {
	const sTitle = "fetchCache: later calls to fetchCache exist, same cache=" + bSameCache;
	QUnit.test(sTitle, function (assert) {
		var oOldCache = {},
			oBinding = new ODataBinding({
				oCache : oOldCache,
				oCachePromise : SyncPromise.resolve(oOldCache),
				doCreateCache : function () {},
				oFetchCacheCallToken : {
					oOldCache : bSameCache ? oOldCache : "~n/a~"
				},
				oModel : {
					getReporter : function () {},
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {},
					waitForKeepAliveBinding : mustBeMocked
				},
				sPath : "relative",
				mParameters : {$$canonicalPath : true},
				bRelative : true,
				toString : function () { return "MyBinding"; }
			}),
			oBindingMock = this.mock(oBinding),
			oContext0 = {
				getPath : function () { return "/n/a"; }
			},
			oContext1 = {
				getPath : function () { return "/deep/path"; }
			},
			oModelMock = this.mock(oBinding.oModel),
			oNewCache = bSameCache ? oOldCache : {},
			mLocalQueryOptions = {},
			oPromise,
			fnReporter = sinon.spy();

		oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext0), undefined)
			.returns(SyncPromise.resolve({
				mQueryOptions : {},
				sReducedPath : "/reduced/path/1"
			}));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext0))
			.returns(SyncPromise.resolve(Promise.resolve("resourcePath0")));
		oModelMock.expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oBinding.fetchCache(oContext0);

		assert.strictEqual(oBinding.oCache, undefined);
		assert.strictEqual(oBinding.oFetchCacheCallToken.oOldCache, oOldCache);
		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
		oPromise = oBinding.oCachePromise;

		oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
			.withExactArgs(sinon.match.same(oContext1), undefined)
			.returns(SyncPromise.resolve({
				mQueryOptions : mLocalQueryOptions,
				sReducedPath : "/reduced/path/2"
			}));
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext1))
			.returns(SyncPromise.resolve(Promise.resolve("resourcePath1")));
		this.mock(oBinding.oModel).expects("waitForKeepAliveBinding")
			.withExactArgs(sinon.match.same(oBinding))
			.returns(SyncPromise.resolve());
		oBindingMock.expects("createAndSetCache")
			.withExactArgs(sinon.match.same(mLocalQueryOptions), "resourcePath1",
				sinon.match.same(oContext1), "~sGroupId~", sinon.match.same(oOldCache))
			.returns(oNewCache);
		oModelMock.expects("getReporter").withExactArgs().returns(getForbiddenReporter());

		// code under test - create new cache for this binding while other cache creation is pending
		oBinding.fetchCache(oContext1, undefined, undefined, "~sGroupId~");

		return SyncPromise.all([
			oPromise.then(function (oCache0) {
				assert.ok(bSameCache);
				assert.strictEqual(oCache0, oOldCache);
			}, function (oError) {
				assert.notOk(bSameCache);
				assert.strictEqual(oError.message,
					"Cache discarded as a new cache has been created");
				assert.strictEqual(oError.canceled, true);
			}),
			oBinding.oCachePromise.then(function (oCache0) {
				assert.strictEqual(oCache0, oNewCache);
			})
		]).then(function () {
			assert.strictEqual(oBinding.sReducedPath, "/reduced/path/2");
			if (bSameCache) {
				sinon.assert.callCount(fnReporter, 0);
			} else {
				sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.instanceOf(Error));
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchCache: fetchResourcePath fails", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				mCacheQueryOptions : {},
				oModel : {
					getReporter : function () {},
					oRequestor : {
						ready : function () { return SyncPromise.resolve(); }
					},
					mUriParameters : {}
				},
				bRelative : true,
				toString : function () { return "MyBinding"; }
			}),
			oBindingMock = this.mock(oBinding),
			mCacheQueryOptions = {},
			oContext = {},
			oError = new Error("canonical path failure"),
			fnReporter = sinon.spy();

		oBindingMock.expects("fetchOrGetQueryOptionsForOwnCache")
			.returns(SyncPromise.resolve({mQueryOptions : mCacheQueryOptions}));
		oBindingMock.expects("prepareDeepCreate")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(mCacheQueryOptions))
			.returns(false);
		oBindingMock.expects("fetchResourcePath")
			.withExactArgs(sinon.match.same(oContext))
			.returns(SyncPromise.reject(oError));
		oBindingMock.expects("createAndSetCache").never();
		this.mock(oBinding.oModel).expects("getReporter").withExactArgs().returns(fnReporter);

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
				sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
			}
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: bKeepQueryOptions and own cache", function (assert) {
		var oCache = {
				getResourcePath : function () {}
			},
			mCacheQueryOptions = {},
			mLateQueryOptions = {},
			oBinding = new ODataBinding({
				oCache : oCache,
				oCachePromise : SyncPromise.resolve(oCache),
				mCacheQueryOptions : mCacheQueryOptions,
				oFetchCacheCallToken : "~n/a~",
				mLateQueryOptions : mLateQueryOptions,
				oModel : {
					getReporter : getForbiddenReporter,
					oRequestor : {
						ready : function () {}
					}
				},
				bRelative : true
			}),
			oContext = {},
			oNewCache = {};

		this.mock(oCache).expects("getResourcePath").withExactArgs().returns("~resourcePath~");
		this.mock(oBinding).expects("createAndSetCache")
			.withExactArgs(sinon.match.same(oBinding.mCacheQueryOptions), "~resourcePath~",
				sinon.match.same(oContext), "~sGroupId~", sinon.match.same(oCache))
			.returns(oNewCache);
		this.mock(oBinding).expects("fetchOrGetQueryOptionsForOwnCache").never();
		this.mock(oBinding.oModel.oRequestor).expects("ready").never();
		this.mock(oBinding).expects("fetchResourcePath").never();

		// code under test
		oBinding.fetchCache(oContext, undefined, true, "~sGroupId~");

		assert.strictEqual(oBinding.oCache, undefined);
		assert.deepEqual(oBinding.oFetchCacheCallToken, {
			oOldCache : oCache
		});
		assert.strictEqual(oBinding.oFetchCacheCallToken.oOldCache, oCache);
		assert.ok(oBinding.oCachePromise.isPending());

		return oBinding.oCachePromise.then(function (oCache0) {
			assert.strictEqual(oCache0, oNewCache);
			assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
			assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: bKeepQueryOptions and no cache", function (assert) {
		var oCachePromise = SyncPromise.resolve(null),
			mCacheQueryOptions = {},
			mLateQueryOptions = {},
			oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : oCachePromise,
				mCacheQueryOptions : mCacheQueryOptions,
				mLateQueryOptions : mLateQueryOptions,
				oModel : {
					getReporter : getForbiddenReporter,
					oRequestor : {
						ready : function () {}
					}
				}
			});

		this.mock(oBinding).expects("createAndSetCache").never();
		this.mock(oBinding).expects("fetchOrGetQueryOptionsForOwnCache").never();
		this.mock(oBinding.oModel.oRequestor).expects("ready").never();
		this.mock(oBinding).expects("fetchResourcePath").never();

		// code under test
		oBinding.fetchCache(undefined, undefined, true);

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise, oCachePromise);
		assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
		assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("fetchCache: bKeepQueryOptions while oCachePromise is pending", function (assert) {
		var oCachePromise = SyncPromise.resolve(Promise.resolve()),
			mCacheQueryOptions = {},
			oCallToken = {},
			mLateQueryOptions = {},
			oBinding = new ODataBinding({
				oCache : undefined,
				oCachePromise : oCachePromise,
				mCacheQueryOptions : mCacheQueryOptions,
				oFetchCacheCallToken : oCallToken,
				mLateQueryOptions : mLateQueryOptions,
				oModel : {
					getReporter : getForbiddenReporter,
					oRequestor : {
						ready : function () {}
					}
				}
			});

		this.mock(oBinding).expects("createAndSetCache").never();
		this.mock(oBinding).expects("fetchOrGetQueryOptionsForOwnCache").never();
		this.mock(oBinding.oModel.oRequestor).expects("ready").never();
		this.mock(oBinding).expects("fetchResourcePath").never();

		assert.throws(function () {
			// code under test
			oBinding.fetchCache(undefined, undefined, true);
		}, new Error("Unsupported bKeepQueryOptions while oCachePromise is pending"));

		assert.strictEqual(oBinding.oCache, undefined);
		assert.strictEqual(oBinding.oCachePromise, oCachePromise);
		assert.strictEqual(oBinding.mCacheQueryOptions, mCacheQueryOptions);
		assert.strictEqual(oBinding.oFetchCacheCallToken, oCallToken);
		assert.strictEqual(oBinding.mLateQueryOptions, mLateQueryOptions);
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasLateQueryOptions) {
	[false, true].forEach(function (bOldCacheIsReused) {
	var sTitle = "createAndSetCache: absolute, bHasLateQueryOptions = " + bHasLateQueryOptions
			+ ", bOldCacheIsReused = " + bOldCacheIsReused;

	QUnit.test(sTitle, function (assert) {
		var mLateQueryOptions = {},
			oBinding = new ODataBinding({
				doCreateCache : function () {},
				mLateQueryOptions : bHasLateQueryOptions ? mLateQueryOptions : undefined,
				oModel : {
					mUriParameters : {}
				},
				bRelative : false
			}),
			oCache = {
				setLateQueryOptions : function () {}
			},
			mMergedQueryOptions = {},
			oOldCache = {
				deregisterChangeListener : function () {},
				setActive : function () {},
				setLateQueryOptions : function () {}
			},
			oNewCache = bOldCacheIsReused ? oOldCache : oCache,
			mQueryOptions = {};

		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mQueryOptions))
			.returns(mMergedQueryOptions);
		this.mock(oBinding).expects("doCreateCache")
			.withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions), undefined,
				undefined, "~sGroupId~", sinon.match.same(oOldCache))
			.returns(oNewCache);
		this.mock(oOldCache).expects("deregisterChangeListener").exactly(bOldCacheIsReused ? 0 : 1)
			.withExactArgs("", sinon.match.same(oBinding));
		this.mock(oOldCache).expects("setActive").exactly(bOldCacheIsReused ? 0 : 1)
			.withExactArgs(false);
		this.mock(oOldCache).expects("setLateQueryOptions")
			.exactly(bHasLateQueryOptions && bOldCacheIsReused ? 1 : 0)
			.withExactArgs(sinon.match.same(mLateQueryOptions));
		this.mock(oCache).expects("setLateQueryOptions")
			.exactly(bHasLateQueryOptions && !bOldCacheIsReused ? 1 : 0)
			.withExactArgs(sinon.match.same(mLateQueryOptions));

		assert.strictEqual(
			// code under test
			oBinding.createAndSetCache(mQueryOptions, "/resource/path", /*oContext*/undefined,
				"~sGroupId~", oOldCache),
			oNewCache
		);

		assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
		assert.strictEqual(oBinding.oCache, oNewCache);
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSharedRequest) {
	[false, true].forEach(function (bV4Context) {
		[false, true].forEach(function (bHasCaches) {
			[false, true].forEach(function (bHasLateQueryOptions) {
			var sTitle = "createAndSetCache: relative, create, V4Context=" + bV4Context
					+ ", shared=" + bSharedRequest + ", hasCaches=" + bHasCaches
					+ ", hasLateQueryOptions = " + bHasLateQueryOptions;

	QUnit.test(sTitle, function (assert) {
		var mLateQueryOptions = {},
			oBinding = new ODataBinding({
				doCreateCache : function () {},
				mLateQueryOptions : bHasLateQueryOptions ? mLateQueryOptions : undefined,
				oModel : {
					resolve : function () {},
					mUriParameters : {}
				},
				sPath : "relative",
				bRelative : true
			}),
			oCache = {
				setLateQueryOptions : function () {}
			},
			oContext = {},
			mMergedQueryOptions = {},
			oOldCache = {
				deregisterChangeListener : function () {},
				setActive : function () {}
			},
			mQueryOptions = {},
			iGeneration = {/*number*/};

		if (bSharedRequest) {
			oBinding.mParameters = {$$sharedRequest : true};
		}
		if (bV4Context) {
			oContext.getGeneration = function () {};
			this.mock(oContext).expects("getGeneration").withExactArgs()
				.returns(iGeneration);
		}
		if (bHasCaches) {
			oBinding.mCacheByResourcePath = {foo : "bar"};
		}
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mQueryOptions))
			.returns(mMergedQueryOptions);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/deep/resource/path");
		this.mock(oBinding).expects("doCreateCache")
			.withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions),
				sinon.match.same(oContext), "deep/resource/path", "~sGroupId~",
				sinon.match.same(oOldCache))
			.returns(oCache);
		this.mock(oCache).expects("setLateQueryOptions").exactly(bHasLateQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(mLateQueryOptions));
		this.mock(oOldCache).expects("deregisterChangeListener")
			.withExactArgs("", sinon.match.same(oBinding));
		this.mock(oOldCache).expects("setActive").withExactArgs(false);

		assert.strictEqual(
			// code under test
			oBinding.createAndSetCache(mQueryOptions, "/resource/path", oContext,
				"~sGroupId~", oOldCache),
			oCache
		);

		assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
		assert.strictEqual(oBinding.oCache, oCache);
		if (!bSharedRequest) {
			assert.strictEqual(oBinding.mCacheByResourcePath["/resource/path"], oCache);
		}
		if (bHasCaches) {
			assert.strictEqual(oBinding.mCacheByResourcePath.foo, "bar");
		} else if (bSharedRequest) {
			assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
		}
		assert.strictEqual(oCache.$deepResourcePath, "deep/resource/path");
		assert.strictEqual(oCache.$generation, bV4Context ? iGeneration : 0);
	});
			});
		});
	});
});

	//*********************************************************************************************
// undefined for the quasi-absolute binding (context has no getGeneration())
[undefined, false, true].forEach(function (bSameGeneration) {
	[false, true].forEach(function (bHasLateQueryOptions) {
		var sTitle = "createAndSetCache: reuse cache, bSameGeneration=" + bSameGeneration
				+ ", bHasLateQueryOptions=" + bHasLateQueryOptions;

	QUnit.test(sTitle, function (assert) {
		var mLateQueryOptions = {},
			oBinding = new ODataBinding({
				mLateQueryOptions : bHasLateQueryOptions ? mLateQueryOptions : undefined,
				oModel : {
					resolve : function () {},
					mUriParameters : {}
				},
				sPath : "relative",
				bRelative : true
			}),
			oCache = {
				$generation : bSameGeneration ? 23 : 42,
				setActive : function () {},
				setLateQueryOptions : function () {}
			},
			oContext = {};

		oBinding.mCacheByResourcePath = {};
		oBinding.mCacheByResourcePath["/resource/path"] = oCache;

		if (bSameGeneration !== undefined) {
			oContext.getGeneration = function () {};
			this.mock(oContext).expects("getGeneration").withExactArgs().returns(23);
		}
		this.mock(oCache).expects("setActive").withExactArgs(true);
		this.mock(oCache).expects("setLateQueryOptions").exactly(bHasLateQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(mLateQueryOptions));

		assert.strictEqual(
			// code under test
			oBinding.createAndSetCache({}, "/resource/path", oContext),
			oCache
		);
		assert.strictEqual(oBinding.oCache, oCache);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("createAndSetCache: no reuse due to older generation", function (assert) {
		var oBinding = new ODataBinding({
				doCreateCache : function () {},
				oModel : {
					resolve : function () {},
					mUriParameters : {}
				},
				mParameters : {},
				sPath : "relative",
				bRelative : true
			}),
			oCache0 = {
				$generation : 23
			},
			oCache1 = {},
			oContext = {
				getGeneration : function () {}
			},
			mMergedQueryOptions = {},
			oOldCache = {
				deregisterChangeListener : function () {},
				setActive : function () {}
			},
			mQueryOptions = {};

		oBinding.mCacheByResourcePath = {};
		oBinding.mCacheByResourcePath["/resource/path"] = oCache0;
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mQueryOptions)).returns(mMergedQueryOptions);
		this.mock(oContext).expects("getGeneration").withExactArgs().returns(42);
		this.mock(oBinding.oModel).expects("resolve")
			.withExactArgs(oBinding.sPath, sinon.match.same(oContext))
			.returns("/deep/resource/path");
		this.mock(oBinding).expects("doCreateCache")
			.withExactArgs("/resource/path", sinon.match.same(mMergedQueryOptions),
				sinon.match.same(oContext), "deep/resource/path", "~sGroupId~",
				sinon.match.same(oOldCache))
			.returns(oCache1);
		this.mock(oOldCache).expects("deregisterChangeListener")
			.withExactArgs("", sinon.match.same(oBinding));
		this.mock(oOldCache).expects("setActive").withExactArgs(false);

		assert.strictEqual(
			// code under test
			oBinding.createAndSetCache(mQueryOptions, "/resource/path", oContext,
				"~sGroupId~", oOldCache),
			oCache1
		);

		assert.strictEqual(oBinding.oCache, oCache1);
		assert.strictEqual(oBinding.mCacheQueryOptions, mMergedQueryOptions);
		assert.strictEqual(oBinding.mCacheByResourcePath["/resource/path"], oCache1);
		assert.strictEqual(oCache1.$deepResourcePath, "deep/resource/path");
		assert.strictEqual(oCache1.$generation, 42);
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: relative", function (assert) {
		var oBinding = new ODataBinding();

		// code under test
		assert.strictEqual(oBinding.getRelativePath("baz"), "baz");
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: relative to resolved path", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
		this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo/bar", "/foo/bar")
			.returns("");

		// code under test
		assert.strictEqual(oBinding.getRelativePath("/foo/bar"), "");
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: not relative to resolved path", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
		this.mock(_Helper).expects("getRelativePath").withExactArgs("/foo", "/foo/bar")
			.returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getRelativePath("/foo"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getRelativePath: return value context", function (assert) {
		var oBinding = new ODataBinding({
				oReturnValueContext : {getPath : function () {}}
			}),
			oHelperMock = this.mock(_Helper),
			sResult = {/*don't care*/};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo/bar");
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
				bRelative : true
			}),
			oContextResult = {},
			sPath = "foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

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
				bRelative : true
			}),
			oContextResult = {},
			sPath = "/foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

		// oBinding binding might still be relative but while bubbling up sPath is already absolute
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
				bRelative : true
			}),
			oContextResult = {},
			sPath = "/foo",
			fnProcessor = {},
			oPromise,
			bWithOrWithoutCache = {};

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
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
				bRelative : false
			}),
			sPath = "/foo",
			oPromise;

		this.mock(oBinding).expects("getRelativePath").withExactArgs(sPath).returns(undefined);
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
			});

		// code under test
		assert.strictEqual(oBinding.withCache({/*fnProcessor*/}, "", true).unwrap(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("withCache: no cache, not relative", function (assert) {
		var oBinding = new ODataBinding({
				oCache : null,
				oCachePromise : SyncPromise.resolve(null),
				bRelative : false
			});

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
				oContext : { // sap.ui.model.odata.v4.Context
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

		oBinding.oContext = {toString : function () { return "/Employees(ID='1')"; }};

		// code under test
		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /Employees(ID='1')|Employee_2_Team", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: resumed", function () {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRoot").never();
		this.mock(oBinding).expects("getResumeChangeReason").never();

		// code under test
		oBinding.checkSuspended();
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: suspended", function (assert) {
		var oBinding = new ODataBinding({
				toString : function () { return "/Foo"; }
			});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRoot").never();
		this.mock(oBinding).expects("getResumeChangeReason").never();

		// code under test
		assert.throws(function () {
			oBinding.checkSuspended();
		}, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: suspended, but never mind", function () {
		var oBinding = new ODataBinding({
				toString : function () { return "/Foo"; }
			});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResumeChangeReason").withExactArgs().returns(undefined);

		// code under test
		oBinding.checkSuspended(true);
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: suspended w/ resume change reason", function (assert) {
		var oBinding = new ODataBinding({
				toString : function () { return "/Foo"; }
			});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResumeChangeReason").withExactArgs().returns("bar");

		// code under test
		assert.throws(function () {
			oBinding.checkSuspended(true);
		}, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
	});

	//*********************************************************************************************
	QUnit.test("checkSuspended: suspended root", function (assert) {
		var oBinding = new ODataBinding({
				toString : function () { return "/Foo"; }
			});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		// Note: quasi-absolute would be realistic example
		this.mock(oBinding).expects("isRoot").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResumeChangeReason").never();

		// code under test
		assert.throws(function () {
			oBinding.checkSuspended(true);
		}, new Error("Must not call method when the binding's root binding is suspended: /Foo"));
	});

	//*********************************************************************************************
[undefined, "group"].forEach(function (sGroupId) {
	[false, true].forEach(function (bModifying) {
		var sTitle = "lockGroup: groupId=" + sGroupId + ", bModifying=" + bModifying;

	QUnit.test(sTitle, function (assert) {
		var oBinding = new ODataBinding({
				oModel : {lockGroup : function () {}}
			}),
			fnCancel = {},
			oGroupLock = {},
			bLocked = {/*boolean*/};

		this.mock(oBinding).expects("getGroupId").exactly(sGroupId || bModifying ? 0 : 1)
			.withExactArgs().returns("group");
		this.mock(oBinding).expects("getUpdateGroupId").exactly(bModifying && !sGroupId ? 1 : 0)
			.withExactArgs().returns("group");
		this.mock(oBinding.oModel).expects("lockGroup")
			.withExactArgs("group", sinon.match.same(oBinding), sinon.match.same(bLocked),
				sinon.match.same(bModifying), sinon.match.same(fnCancel))
			.returns(oGroupLock);

		// code under test
		assert.strictEqual(oBinding.lockGroup(sGroupId, bLocked, bModifying, fnCancel), oGroupLock);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters, $$aggregation", function () {
		// code under test
		new ODataBinding().checkBindingParameters({$$aggregation : []}, ["$$aggregation"]);
	});

	//*********************************************************************************************
	["$$groupId", "$$updateGroupId"].forEach(function (sParameter) {
		QUnit.test("checkBindingParameters, " + sParameter, function (assert) {
			var aAllowedParams = [sParameter],
				oBinding = new ODataBinding({
					oModel : {}
				}),
				oBindingParameters = {
					custom : "foo"
				};

			oBindingParameters[sParameter] = "$auto";

			this.mock(_Helper).expects("checkGroupId")
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
[
	"$$ignoreMessages", "$$sharedRequest"
].forEach(function (sName) {
	QUnit.test("checkBindingParameters, " + sName, function (assert) {
		var aAllowedParams = [sName],
			oBinding = new ODataBinding({}),
			mParameters = {};

		assert.throws(function () {
			mParameters[sName] = undefined;
			// code under test
			oBinding.checkBindingParameters(mParameters, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '" + sName + "': undefined"));
		assert.throws(function () {
			mParameters[sName] = "foo";
			// code under test
			oBinding.checkBindingParameters(mParameters, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '" + sName + "': foo"));

		[true, false].forEach(function (bValue) {
			mParameters[sName] = bValue;
			// code under test
			oBinding.checkBindingParameters(mParameters, aAllowedParams);
		});
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
	QUnit.test("checkBindingParameters: $$inheritExpandSelect with $expand", function (assert) {
		var aAllowedParams = ["$$inheritExpandSelect"],
			oBinding = new ODataBinding({
				oOperation : {}
			}),
			mParameters = Object.assign({
				$$inheritExpandSelect : true
			}, {$expand : {NavProperty : {}}});

		// code under test
		assert.throws(function () {
			oBinding.checkBindingParameters(mParameters, aAllowedParams);
		}, new Error("Must not set parameter $$inheritExpandSelect on a binding which has "
				+ "a $expand binding parameter"));
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
	QUnit.test("checkBindingParameters: $$getKeepAliveContext", function (assert) {
		var aAllowedParams = [
				"$$aggregation", "$$canonicalPath", "$$getKeepAliveContext", "$$sharedRequest"
			],
			oBinding = new ODataBinding({
				isRelative : function () {}
			});

		this.mock(oBinding).expects("isRelative").atLeast(0).returns(false);

		assert.throws(function () {
			oBinding.checkBindingParameters({$$getKeepAliveContext : "foo"}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$getKeepAliveContext': foo"));
		assert.throws(function () {
			oBinding.checkBindingParameters({$$getKeepAliveContext : false}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$getKeepAliveContext': false"));
		assert.throws(function () {
			oBinding.checkBindingParameters({$$getKeepAliveContext : undefined}, aAllowedParams);
		}, new Error("Unsupported value for binding parameter '$$getKeepAliveContext': undefined"));

		// code under test
		oBinding.checkBindingParameters({$$getKeepAliveContext : true}, aAllowedParams);

		assert.throws(function () {
			oBinding.checkBindingParameters({
				$$aggregation : {},
				$$getKeepAliveContext : true
			}, aAllowedParams);
		}, new Error("Cannot combine $$getKeepAliveContext and $$aggregation"));

		assert.throws(function () {
			oBinding.checkBindingParameters({
				$$canonicalPath : true,
				$$getKeepAliveContext : true
			}, aAllowedParams);
		}, new Error("Cannot combine $$getKeepAliveContext and $$canonicalPath"));

		assert.throws(function () {
			oBinding.checkBindingParameters({
				$$getKeepAliveContext : true,
				$$sharedRequest : true
			}, aAllowedParams);
		}, new Error("Cannot combine $$getKeepAliveContext and $$sharedRequest"));

		// code under test
		oBinding.checkBindingParameters({
			$$aggregation : {hierarchyQualifier : "X"},
			$$getKeepAliveContext : true
		}, aAllowedParams);
	});

	//*********************************************************************************************
	QUnit.test("checkBindingParameters: $$getKeepAliveContext && $$ownRequest", function (assert) {
		var oBinding = new ODataBinding({
				isRelative : function () {}
			});

		this.mock(oBinding).expects("isRelative").returns(true);

		assert.throws(function () {
			oBinding.checkBindingParameters({$$getKeepAliveContext : true},
				["$$getKeepAliveContext"]);
		}, new Error("$$getKeepAliveContext requires $$ownRequest in a relative binding"));
	});

	//*********************************************************************************************
[
	"$$canonicalPath",
	"$$clearSelectionOnFilter",
	"$$noPatch",
	"$$ownRequest",
	"$$patchWithoutSideEffects"
].forEach(function (sName) {
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
[true, false, undefined].forEach(function (bCachesOnly) {
	var sTitle = "removeCachesAndMessages: bCachesOnly=" + bCachesOnly;

	QUnit.test(sTitle, function (assert) {
		var oBinding = new ODataBinding({
				oCache : {removeMessages : function () {}}
			}),
			mCacheByResourcePath = {
				foo1 : {
					$deepResourcePath : "fooDeep1"
				},
				foo2 : {
					$deepResourcePath : "fooDeep2",
					removeMessages : function () {}
				},
				foo3 : {
					$deepResourcePath : "fooDeep3"
				}
			},
			oCacheMock = this.mock(oBinding.oCache),
			oHelperMock = this.mock(_Helper),
			that = this;

		oBinding.mCacheByResourcePath = undefined;
		oCacheMock.expects("removeMessages").exactly(bCachesOnly !== true ? 1 : 0)
			.withExactArgs();

		// code under test
		oBinding.removeCachesAndMessages("~base~path", bCachesOnly);

		oBinding.mCacheByResourcePath = mCacheByResourcePath;

		oCacheMock.expects("removeMessages").exactly(bCachesOnly !== true ? 1 : 0)
			.withExactArgs();

		oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep1", "~base~path~")
			.returns(false);
		oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep2", "~base~path~")
			.returns(true);
		that.mock(mCacheByResourcePath["foo2"]).expects("removeMessages")
			.exactly(bCachesOnly !== true ? 1 : 0)
			.withExactArgs();
		oHelperMock.expects("hasPathPrefix").withExactArgs("fooDeep3", "~base~path~")
			.returns(false);

		// code under test
		oBinding.removeCachesAndMessages("~base~path~", bCachesOnly);

		assert.deepEqual(oBinding.mCacheByResourcePath, {
			foo1 : {$deepResourcePath : "fooDeep1"},
			foo3 : {$deepResourcePath : "fooDeep3"}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("removeCachesAndMessages: w/o mCacheByResourcePath", function () {
		var oBinding = new ODataBinding({
				oCache : {removeMessages : function () {}}
			});

		this.mock(oBinding.oCache).expects("removeMessages").withExactArgs();

		// code under test (has cache)
		oBinding.removeCachesAndMessages("");

		// code under test (only cache)
		oBinding.removeCachesAndMessages("", true);

		oBinding.oCache = undefined;

		// code under test (no cache)
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
		this.mock(oBinding).expects("isTransient").withExactArgs().returns(false);
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
				getPath : function () {}
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
	QUnit.test("fetchResourcePath, V4 context, transient binding", function (assert) {
		var oBinding = new ODataBinding({
				sPath : "bindingPath",
				bRelative : true
			}),
			oContext = {
				fetchCanonicalPath : function () {},
				getPath : function () {}
			};

		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/A($uid=id-1-23)");
		this.mock(oBinding).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext).expects("fetchCanonicalPath").never();
		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/A($uid=id-1-23)", "bindingPath")
			.returns("/A($uid=id-1-23)/bindingPath");

		// code under test
		return oBinding.fetchResourcePath(oContext).then(function (sResourcePath) {
			assert.strictEqual(sResourcePath, "A($uid=id-1-23)/bindingPath");
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

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);

		// code under test (cannot set non-enum values)
		oBinding.setResumeChangeReason("foo");

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Context);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Context);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Change);
		oBinding.setResumeChangeReason(ChangeReason.Context);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);
		oBinding.setResumeChangeReason(ChangeReason.Context);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Sort);
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);
		oBinding.setResumeChangeReason(ChangeReason.Context);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Sort);

		// code under test
		oBinding.setResumeChangeReason(ChangeReason.Filter);
		oBinding.setResumeChangeReason(ChangeReason.Sort);
		oBinding.setResumeChangeReason(ChangeReason.Refresh);
		oBinding.setResumeChangeReason(ChangeReason.Change);
		oBinding.setResumeChangeReason(ChangeReason.Context);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Filter);
	});

	//*********************************************************************************************
	QUnit.test("getResumeChangeReason", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding),
			oDependentBinding = {
				getResumeChangeReason : function () {}
			},
			oDependentBinding1 = {
				getResumeChangeReason : function () {}
			},
			oDependentBinding2 = {
				getResumeChangeReason : function () {}
			},
			oDependentBindingMock = this.mock(oDependentBinding);

		oBindingMock.expects("getDependentBindings").withExactArgs().returns([]);

		// code under test
		assert.strictEqual(oBinding.getResumeChangeReason(), undefined);

		oBinding.sResumeChangeReason = ChangeReason.Refresh;
		oBindingMock.expects("getDependentBindings").withExactArgs().returns([]);

		// code under test
		assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);

		oBindingMock.expects("getDependentBindings").withExactArgs().returns([oDependentBinding]);
		oDependentBindingMock.expects("getResumeChangeReason").withExactArgs()
			.returns(undefined);

		// code under test
		assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);

		oBindingMock.expects("getDependentBindings").withExactArgs().returns([oDependentBinding]);
		oDependentBindingMock.expects("getResumeChangeReason").withExactArgs()
			.returns(ChangeReason.Change);

		// code under test
		assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Refresh);

		oBindingMock.expects("getDependentBindings").withExactArgs()
			.returns([oDependentBinding, oDependentBinding1, oDependentBinding2]);
		oDependentBindingMock.expects("getResumeChangeReason").withExactArgs()
			.returns(ChangeReason.Change);
		this.mock(oDependentBinding1).expects("getResumeChangeReason").withExactArgs()
			.returns(ChangeReason.Filter);
		this.mock(oDependentBinding2).expects("getResumeChangeReason").withExactArgs()
			.returns(ChangeReason.Sort);

		// code under test
		assert.strictEqual(oBinding.getResumeChangeReason(), ChangeReason.Filter);
});

	//*********************************************************************************************
["", "relative/path"].forEach(function (sRelativePath) {
	QUnit.test(`doDeregisterChangeListener: matching cache, path=${sRelativePath}`, function () {
		const oCache = {
			deregisterChangeListener : mustBeMocked
		};
		const oBinding = new ODataBinding({
			oCachePromise : SyncPromise.resolve(oCache)
		});

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");
		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("/absolute/path", "/resolved/path").returns(sRelativePath);
		this.mock(oCache).expects("deregisterChangeListener")
			.withExactArgs(sRelativePath, "~oListener~");

		// code under test
		oBinding.doDeregisterChangeListener("/absolute/path", "~oListener~");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bCache) {
	QUnit.test(`doDeregisterChangeListener: no ${bCache ? "matching " : ""} cache`, function () {
		const oBinding = new ODataBinding({
			oCachePromise : SyncPromise.resolve(bCache ? {} : null),
			oContext : {
				getBinding : mustBeMocked
			},
			bRelative : true
		});
		const oParentBinding = {
			doDeregisterChangeListener : mustBeMocked
		};

		this.mock(oBinding).expects("getResolvedPath").exactly(bCache ? 1 : 0)
			.withExactArgs().returns("/resolved/path");
		this.mock(_Helper).expects("getRelativePath").exactly(bCache ? 1 : 0)
			.withExactArgs("/absolute/path", "/resolved/path").returns(undefined);
		this.mock(oBinding.oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("doDeregisterChangeListener")
			.withExactArgs("/absolute/path", "~oListener~");

		// code under test
		oBinding.doDeregisterChangeListener("/absolute/path", "~oListener~");
	});
});

	//*********************************************************************************************
	QUnit.test("doDeregisterChangeListener: no cache and no valid context", function () {
		const oBinding = new ODataBinding();

		// code under test - unresolved
		oBinding.doDeregisterChangeListener();

		oBinding.oContext = {getBinding : "do not call"};

		// code under test - absolute with context
		oBinding.doDeregisterChangeListener();

		oBinding.bRelative = true;
		oBinding.oContext = {};

		// code under test - base context
		oBinding.doDeregisterChangeListener();
	});

	//*********************************************************************************************
	QUnit.test("allow for super calls", function (assert) {
		var oBinding = new ODataBinding();

		[
			"adjustPredicate",
			"destroy",
			"doDeregisterChangeListener",
			"hasPendingChangesForPath"
		].forEach(function (sMethod) {
			assert.strictEqual(asODataBinding.prototype[sMethod], oBinding[sMethod]);
		});
	});

	//*********************************************************************************************
	QUnit.test("assertSameCache", function (assert) {
		var oBinding = new ODataBinding({
				oCache : {}
			}),
			oCache = {
				toString : function () { return "~"; }
			};

		oBinding.assertSameCache(oBinding.oCache);

		try {
			oBinding.assertSameCache(oCache);
			assert.ok(false);
		} catch (oError) {
			assert.strictEqual(oError.message,
				oBinding + " is ignoring response from inactive cache: ~");
			assert.strictEqual(oError.canceled, true);
		}
	});

	//*********************************************************************************************
	QUnit.test("adjustPredicate", function (assert) {
		var oBinding = new ODataBinding({
				sReducedPath : "/A($uid=id-1-23)/A_2_B(id=42)"
			});

		// code under test
		oBinding.adjustPredicate("($uid=id-1-23)", "('foo')");

		assert.strictEqual(oBinding.sReducedPath, "/A('foo')/A_2_B(id=42)");

		// code under test (missing predicate not harmful)
		oBinding.adjustPredicate("('n/a')", "('bar')");

		assert.strictEqual(oBinding.sReducedPath, "/A('foo')/A_2_B(id=42)");
	});

	//*********************************************************************************************
	QUnit.test("requestAbsoluteSideEffects: nothing to do", function (assert) {
		var oBinding = new ODataBinding(),
			oHelperMock = this.mock(_Helper);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
		oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta")
			.returns(undefined);
		oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request1").returns(false);
		oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta")
			.returns(undefined);
		oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(false);

		assert.strictEqual(
			// code under test
			oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2"]),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("requestAbsoluteSideEffects: refresh", function (assert) {
		var oBinding = new ODataBinding({
				requestSideEffects : function () {}
			}),
			oHelperMock = this.mock(_Helper);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
		oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns("~1");
		oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta")
			.returns(undefined);
		oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(true);
		this.mock(oBinding).expects("requestSideEffects").withExactArgs("group", [""])
			.resolves("~");

		// code under test
		return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"])
			.then(function (vResult) {
				assert.strictEqual(vResult, "~");
			});
	});

	//*********************************************************************************************
	QUnit.test("requestAbsoluteSideEffects: refreshInternal", function (assert) {
		var oBinding = new ODataBinding({
				refreshInternal : function () {}
			}),
			oHelperMock = this.mock(_Helper);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
		oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta").returns("~1");
		oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta")
			.returns(undefined);
		oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(true);
		this.mock(oBinding).expects("refreshInternal").withExactArgs("", "group", true, true)
			.resolves("~");

		// code under test
		return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"])
			.then(function (vResult) {
				assert.strictEqual(vResult, "~");
			});
	});

	//*********************************************************************************************
	QUnit.test("requestAbsoluteSideEffects: sideEffects", function (assert) {
		var oBinding = new ODataBinding({
				requestSideEffects : function () {}
			}),
			oHelperMock = this.mock(_Helper);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved");
		oHelperMock.expects("getMetaPath").withExactArgs("/resolved").returns("/meta");
		oHelperMock.expects("getRelativePath").withExactArgs("/request1", "/meta")
			.returns("~1");
		oHelperMock.expects("getRelativePath").withExactArgs("/request2", "/meta")
			.returns(undefined);
		oHelperMock.expects("hasPathPrefix").withExactArgs("/meta", "/request2").returns(false);
		oHelperMock.expects("getRelativePath").withExactArgs("/request3", "/meta").returns("~3");
		this.mock(oBinding).expects("requestSideEffects").withExactArgs("group", ["~1", "~3"])
			.resolves("~");

		// code under test
		return oBinding.requestAbsoluteSideEffects("group", ["/request1", "/request2", "/request3"])
			.then(function (vResult) {
				assert.strictEqual(vResult, "~");
			});
	});

	//*********************************************************************************************
	QUnit.test("refreshSuspended", function () {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("getGroupId").never();
		this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Refresh);

		// code under test
		oBinding.refreshSuspended();
	});

	//*********************************************************************************************
	QUnit.test("refreshSuspended: with group ID", function (assert) {
		var oBinding = new ODataBinding();

		this.mock(oBinding).expects("getGroupId").thrice().withExactArgs().returns("myGroup");
		this.mock(oBinding).expects("setResumeChangeReason").withExactArgs(ChangeReason.Refresh);

		// code under test
		oBinding.refreshSuspended("myGroup");

		assert.throws(function () {
			// code under test
			oBinding.refreshSuspended("otherGroup");
		}, new Error(oBinding + ": Cannot refresh a suspended binding with group ID 'otherGroup' "
			+ "(own group ID is 'myGroup')"));
	});

	//*********************************************************************************************
	QUnit.test("getEventingParent", function (assert) {
		var oBinding = new ODataBinding({oModel : "~oModel~"});

		// code under test
		assert.strictEqual(oBinding.getEventingParent(), "~oModel~");
	});

	//*********************************************************************************************
	QUnit.test("fireDataRequested", function () {
		var oBinding = new ODataBinding({
				fireEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireEvent").withExactArgs("dataRequested", undefined, false, true);

		// code under test
		oBinding.fireDataRequested();

		oBindingMock.expects("fireEvent").withExactArgs("dataRequested", undefined, false, false);

		// code under test
		oBinding.fireDataRequested(true);
	});

	//*********************************************************************************************
	QUnit.test("fireDataReceived", function () {
		var oBinding = new ODataBinding({
				fireEvent : function () {}
			}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireEvent")
			.withExactArgs("dataReceived", "~oParameters~", false, true);

		// code under test
		oBinding.fireDataReceived("~oParameters~");

		oBindingMock.expects("fireEvent")
			.withExactArgs("dataReceived", "~oParameters~", false, false);

		// code under test
		oBinding.fireDataReceived("~oParameters~", true);
	});

	//*********************************************************************************************
	QUnit.test("isTransient", function (assert) {
		assert.notOk(new ODataBinding().isTransient());

		assert.notOk(new ODataBinding({sReducedPath : "/Foo"}).isTransient());

		assert.ok(new ODataBinding({sReducedPath : "/Foo($uid=1"}).isTransient());
	});

	//*********************************************************************************************
	QUnit.test("checkTransient", function (assert) {
		var oBinding = new ODataBinding(),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("isTransient").withExactArgs().returns(false);

		// code under test
		oBinding.checkTransient();

		oBindingMock.expects("isTransient").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oBinding.checkTransient();
		}, new Error("Must not call method when the binding is part of a deep create: "
			+ oBinding));
	});

	//*********************************************************************************************
	QUnit.test("prepareDeepCreate", function (assert) {
		var oBinding = new ODataBinding(),
			oContext = {
				getPath : function () { return "/SalesOrderList('1')/SO_2_BP"; }
			},
			oTransientContext = {
				getPath : function () { return "/SalesOrderList($uid=1)/SO_2_BP"; }
			},
			oVirtualContext = {
				getPath : function () { return "/SalesOrderList('1')/" + Context.VIRTUAL; },
				iIndex : Context.VIRTUAL
			};

		// code under test - no query options
		assert.ok(oBinding.prepareDeepCreate(oContext, undefined));

		// code under test - absolute
		assert.notOk(oBinding.prepareDeepCreate(undefined, {}));

		// code under test - virtual Context
		assert.ok(oBinding.prepareDeepCreate(oVirtualContext, {}));

		// code under test - non-virtual Context
		assert.notOk(oBinding.prepareDeepCreate(oContext, {}));

		// code under test - below transient Context, query options
		assert.ok(oBinding.prepareDeepCreate(oTransientContext, "~mQueryOptions~"));

		assert.strictEqual(oBinding.mCacheQueryOptions, "~mQueryOptions~");

		// code under test - below transient Context, no query options
		assert.ok(oBinding.prepareDeepCreate(oTransientContext, undefined));

		assert.strictEqual(oBinding.mCacheQueryOptions, undefined);
	});
});
