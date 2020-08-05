/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, isEmptyObject, SyncPromise, BaseContext, Context, _Helper) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.Context", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("VIRTUAL", function (assert) {
		assert.throws(function () {
			Context.VIRTUAL = 42;
		}, TypeError, "immutable");

		assert.strictEqual(Context.VIRTUAL, -9007199254740991/*Number.MIN_SAFE_INTEGER*/);
	});

	//*********************************************************************************************
	QUnit.test("create", function (assert) {
		var oBinding = {},
			oContext,
			oCreatedPromise,
			bCreatedPromisePending = true,
			oModel = {},
			sPath = "/foo",
			fnResolve;

		// see below for tests with oBinding parameter
		// no createdPromise
		oContext = Context.create(oModel, oBinding, sPath, 42);

		assert.ok(oContext instanceof BaseContext);
		assert.strictEqual(oContext.getModel(), oModel);
		assert.strictEqual(oContext.getBinding(), oBinding);
		assert.strictEqual(oContext.getPath(), sPath);
		assert.strictEqual(oContext.getModelIndex(), 42);
		assert.strictEqual(oContext.created(), undefined);
		assert.strictEqual(oContext.getReturnValueContextId(), undefined);
		assert.strictEqual(oContext.isKeepAlive(), false);

		// code under test
		oContext = Context.create(oModel, oBinding, sPath, 42,
			new Promise(function (resolve, reject) {
				fnResolve = resolve;
			}));

		// code under test
		oCreatedPromise = oContext.created();

		assert.ok(oCreatedPromise instanceof Promise, "Instance of Promise");
		oCreatedPromise.then(function (oResult) {
				bCreatedPromisePending = false;
				assert.strictEqual(oResult, undefined, "create promise resolves w/o data ('bar')");
			}, function () {
				bCreatedPromisePending = false;
			});
		assert.ok(bCreatedPromisePending, "Created Promise still pending");

		fnResolve("bar");
		return oCreatedPromise.then(function () {
			assert.strictEqual(bCreatedPromisePending, false, "Created Promise resolved");
		});
	});

	//*********************************************************************************************
	QUnit.test("createReturnValueContext", function (assert) {
		var oBinding = {},
			oContext,
			oModel = {},
			sPath = "/foo";

		// code under test (return value context)
		oContext = Context.createReturnValueContext(oModel, oBinding, sPath);

		assert.notEqual(oContext.getReturnValueContextId(), undefined);
		assert.strictEqual(oContext.getReturnValueContextId(), oContext.getReturnValueContextId());

		// code under test (return value contexts have different IDs)
		assert.notEqual(
			Context.createReturnValueContext(oModel, oBinding, sPath).getReturnValueContextId(),
			oContext.getReturnValueContextId());
	});

	//*********************************************************************************************
	[
		{getReturnValueContextId : function () {}},
		{},
		undefined
	].forEach(function (oParentContext, i) {
		QUnit.test("getReturnValueContextId: relative - " + i, function (assert) {
			var oBinding = {
					oContext : oParentContext,
					bRelative : true
				},
				oContext,
				oModel = {},
				vReturnValueContextId = {};

			oContext = Context.create(oModel, oBinding, "/foo/bar");

			if (i === 0) {
				this.mock(oParentContext).expects("getReturnValueContextId")
					.withExactArgs().returns(vReturnValueContextId);
			}

			// code under test
			assert.strictEqual(oContext.getReturnValueContextId(),
				i === 0 ? vReturnValueContextId : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("getReturnValueContextId: absolute binding", function (assert) {
		var oParentContext = {getReturnValueContextId : function () {}},
			oBinding = {
				// context is set even if not used because binding is absolute
				oContext : oParentContext,
				bRelative : false
			},
			oContext,
			oModel = {};

		oContext = Context.create(oModel, oBinding, "/foo/bar");

		this.mock(oParentContext).expects("getReturnValueContextId").never();

		// code under test
		assert.strictEqual(oContext.getReturnValueContextId(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getModelIndex() adds number of created contexts", function (assert) {
		var oBinding = {},
			oContext;

		oContext = Context.create(null/*oModel*/, oBinding, "/foo", 42);

		assert.strictEqual(oContext.getModelIndex(), 42);

		// simulate ODataListBinding#create (7x)
		oBinding.iCreatedContexts = 7;

		assert.strictEqual(oContext.getModelIndex(), 49);

		// simulate setKeepAlive and removal from the collection
		oContext.iIndex = undefined;

		assert.strictEqual(oContext.getModelIndex(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getIndex()", function (assert) {
		var oBinding = {},
			oContext = Context.create(null/*oModel*/, oBinding, "/foo", 42),
			iResult = {/*a number*/};

		this.mock(oContext).expects("getModelIndex").returns(iResult);

		// code under test
		assert.strictEqual(oContext.getIndex(), iResult);

		// simulate ODataListBinding#create (4x at the end)
		oBinding.bCreatedAtEnd = true;
		oBinding.iMaxLength = 6;

		// code under test
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", 0).getIndex(), 0);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", 5).getIndex(), 5);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -1).getIndex(), 6);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -4).getIndex(), 9);
		// simulate a kept context not in the collection
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", undefined).getIndex(),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("path must be absolute", function (assert) {
		assert.throws(function () {
			Context.create(null, null, "foo");
		}, new Error("Not an absolute path: foo"));

		assert.throws(function () {
			Context.createReturnValueContext(null, null, "foo");
		}, new Error("Not an absolute path: foo"));
	});

	//*********************************************************************************************
	QUnit.test("path must not contain trailing slash", function (assert) {
		assert.throws(function () {
			Context.create(null, null, "/");
		}, new Error("Unsupported trailing slash: /"));
		assert.throws(function () {
			Context.create(null, null, "/foo/");
		}, new Error("Unsupported trailing slash: /foo/"));

		assert.throws(function () {
			Context.createReturnValueContext(null, null, "/");
		}, new Error("Unsupported trailing slash: /"));
		assert.throws(function () {
			Context.createReturnValueContext(null, null, "/foo/");
		}, new Error("Unsupported trailing slash: /foo/"));
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oContext,
			fnResolve;

		assert.strictEqual(Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees").toString(),
			"/Employees");
		assert.strictEqual(Context.create({}, {}, "/Employees", 5).toString(), "/Employees[5]");
		oContext = Context.create({}, {}, "/Employees", -1,
			new Promise(function (resolve) {
				fnResolve = resolve;
			}));
		assert.strictEqual(oContext.toString(), "/Employees[-1|transient]");

		fnResolve();
		return oContext.created().then(function () {
			assert.strictEqual(oContext.toString(), "/Employees[-1]");
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bAutoExpandSelect) {
	[undefined, "bar"].forEach(function (sPath) {
		var sTitle = "fetchValue: relative, path=" + sPath + ", autoExpandSelect="
				+ bAutoExpandSelect;

		QUnit.test(sTitle, function (assert) {
			var bCached = {/*false,true*/},
				oBinding = {
					fetchValue : function () {},
					getBaseForPathReduction : function () {}
				},
				oMetaModel = {
					getReducedPath : function () {}
				},
				oModel = {
					bAutoExpandSelect : bAutoExpandSelect,
					getMetaModel : function () { return oMetaModel; }
				},
				oContext = Context.create(oModel, oBinding, "/foo", 42),
				oListener = {},
				oResult = {};

			this.mock(_Helper).expects("buildPath").withExactArgs("/foo", sPath).returns("/~");
			if (bAutoExpandSelect) {
				this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs()
					.returns("/base");
				this.mock(oMetaModel).expects("getReducedPath").withExactArgs("/~", "/base")
					.returns("/reduced");
			}
			this.mock(oBinding).expects("fetchValue")
				.withExactArgs(bAutoExpandSelect ? "/reduced" : "/~", sinon.match.same(oListener),
					sinon.match.same(bCached))
				.returns(oResult);

			assert.strictEqual(oContext.fetchValue(sPath, oListener, bCached), oResult);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("fetchValue: /bar", function (assert) {
		var bCached = {/*false,true*/},
			oBinding = {
				fetchValue : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 42),
			oListener = {},
			oResult = {},
			sPath = "/bar";

		this.mock(oBinding).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(oResult);

		assert.strictEqual(oContext.fetchValue(sPath, oListener, bCached), oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue for a virtual context", function (assert) {
		var oContext = Context.create(null, {}, "/foo/" + Context.VIRTUAL, Context.VIRTUAL),
			oResult;

		// code under test
		oResult = oContext.fetchValue("bar");

		assert.strictEqual(oResult.isFulfilled(), true);
		assert.strictEqual(oResult.getResult(), undefined);
	});

	//*********************************************************************************************
	[
		{aBindingHasPendingChanges : [true], bResult : true},
		{aBindingHasPendingChanges : [false, true], bResult : true},
		{
			aBindingHasPendingChanges : [false, false],
			bUnresolvedBindingHasPendingChanges : true,
			bResult : true
		}, {
			aBindingHasPendingChanges : [false, false],
			bUnresolvedBindingHasPendingChanges : false,
			bResult : false
		}
	].forEach(function (oFixture, i) {
		QUnit.test("hasPendingChanges: " + i, function (assert) {
			var oModel = {
					getDependentBindings : function () {},
					withUnresolvedBindings : function () {}
				},
				oBinding0 = {
					hasPendingChanges : function () {}
				},
				oBinding1 = {
					hasPendingChanges : function () {}
				},
				oParentBinding = {},
				sPath = "/EMPLOYEES('42')",
				oContext = Context.create(oModel, oParentBinding, sPath, 13);

			this.mock(oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oContext))
				.returns([oBinding0, oBinding1]);
			this.mock(oBinding0).expects("hasPendingChanges")
				.withExactArgs()
				.returns(oFixture.aBindingHasPendingChanges[0]);
			this.mock(oBinding1).expects("hasPendingChanges")
				.withExactArgs()
				.exactly(oFixture.aBindingHasPendingChanges[0] ? 0 : 1)
				.returns(oFixture.aBindingHasPendingChanges[1]);
			this.mock(oModel).expects("withUnresolvedBindings")
				.withExactArgs("hasPendingChangesInCaches", "EMPLOYEES('42')")
				.exactly(oFixture.hasOwnProperty("bUnresolvedBindingHasPendingChanges") ? 1 : 0)
				.returns(oFixture.bUnresolvedBindingHasPendingChanges);

			// code under test
			assert.strictEqual(oContext.hasPendingChanges(), oFixture.bResult);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bTransient) {
		QUnit.test("hasPendingChanges: transient context = " + bTransient, function (assert) {
			var oModel = {
					getDependentBindings : function () {},
					withUnresolvedBindings : function () {}
				},
				oContext = Context.create(oModel, {/*oBinding*/}, "/TEAMS", 0);

			this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
			this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
			this.mock(oModel).expects("getDependentBindings").exactly(bTransient ? 0 : 1)
				.withExactArgs(sinon.match.same(oContext)).returns([]);
			this.mock(oModel).expects("withUnresolvedBindings").exactly(bTransient ? 0 : 1)
				.withExactArgs("hasPendingChangesInCaches", "TEAMS").returns(false);

			// code under test
			assert.strictEqual(oContext.hasPendingChanges(), bTransient);
		});
	});

	//*********************************************************************************************
	QUnit.test("isTransient", function (assert) {
		var oBinding = {},
			oContext = Context.create(null, oBinding, "/foo", 42),
			fnResolve;

		// code under test
		assert.notOk(oContext.isTransient(), "no created Promise -> not transient");

		oContext = Context.create(null, oBinding, "/foo", 42,
			new Promise(function (resolve, reject) {
				fnResolve = resolve;
			}));

		// code under test
		assert.ok(oContext.isTransient(), "unresolved created Promise -> transient");

		fnResolve();
		return oContext.created().then(function () {
			// code under test
			assert.notOk(oContext.isTransient(), "resolved -> not transient");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestObject", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			oClone = {},
			oData = {},
			oPromise,
			oSyncPromise = SyncPromise.resolve(Promise.resolve(oData));

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
			.returns(oSyncPromise);
		this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oData))
			.returns(oClone);

		// code under test
		oPromise = oContext.requestObject("bar");

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, oClone);
		});
	});

	//*********************************************************************************************
	QUnit.test("getObject", function (assert) {
		var oCacheData = {},
			oContext = Context.create(null, {/*oBinding*/}, "/foo"),
			oResult = {};

		this.mock(oContext).expects("getValue").withExactArgs("bar")
			.returns(oCacheData);
		this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oCacheData))
			.returns(oResult);

		// code under test
		assert.strictEqual(oContext.getObject("bar"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("getValue", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			oData = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.resolve(oData));

		// code under test
		assert.strictEqual(oContext.getValue("bar"), oData);
	});

	//*********************************************************************************************
	QUnit.test("getValue: unexpected error", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oError = {},
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.reject(oError));
		this.mock(oModel).expects("reportError").withExactArgs("Unexpected error",
			"sap.ui.model.odata.v4.Context", sinon.match.same(oError));

		// code under test
		assert.strictEqual(oContext.getValue("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getValue: not found in cache", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oError = new Error("Unexpected request: GET /foo/bar"),
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo");

		oError.$cached = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.reject(oError));
		this.mock(oModel).expects("reportError").never();

		// code under test
		assert.strictEqual(oContext.getValue("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getValue: unresolved", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.resolve(Promise.resolve(42)));

		//code under test
		assert.strictEqual(oContext.getValue("bar"), undefined);
	});

	//*********************************************************************************************
	[42, null].forEach(function (vResult) {
		QUnit.test("getProperty: primitive result " + vResult, function (assert) {
			var oBinding = {
					checkSuspended : function () {}
				},
				oContext = Context.create(null, oBinding, "/foo"),
				oSyncPromise = SyncPromise.resolve(vResult);

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
				.returns(oSyncPromise);

			//code under test
			assert.strictEqual(oContext.getProperty("bar"), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("getProperty: structured result", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 1),
			oSyncPromise = SyncPromise.resolve({});

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("buildPath").withExactArgs("/foo", "bar").returns("~");
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);

		//code under test
		assert.throws(function () {
			oContext.getProperty("bar");
		}, new Error("Accessed value is not primitive: ~"));
	});

	//*********************************************************************************************
	QUnit.test("getProperty: unresolved", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			oSyncPromise = SyncPromise.resolve(Promise.resolve(42));

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);

		//code under test
		assert.strictEqual(oContext.getProperty("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getProperty: not found in cache", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oError = new Error("Unexpected request: GET /foo/bar"),
			oContext = Context.create(null, oBinding, "/foo");

		oError.$cached = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.reject(oError));

		// code under test
		assert.strictEqual(oContext.getProperty("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getProperty: rejected", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			sMessage = "read error",
			oPromise = Promise.reject(new Error(sMessage)),
			oSyncPromise = SyncPromise.resolve(oPromise);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);
		this.oLogMock.expects("warning")
			.withExactArgs(sMessage, "bar", "sap.ui.model.odata.v4.Context");

		return oPromise.catch(function () {
			//code under test
			assert.strictEqual(oContext.getProperty("bar"), undefined);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bTypeIsResolved) {
		QUnit.test("getProperty: external, bTypeIsResolved=" + bTypeIsResolved, function (assert) {
			var oBinding = {
					checkSuspended : function () {}
				},
				oMetaModel = {
					fetchUI5Type : function () {}
				},
				oModel = {
					getMetaModel : function () {
						return oMetaModel;
					}
				},
				oContext = Context.create(oModel, oBinding, "/foo", 42),
				oType = {
					formatValue : function () {}
				},
				oResolvedType = bTypeIsResolved ? oType : Promise.resolve(oType),
				oSyncPromiseType = SyncPromise.resolve(oResolvedType),
				oSyncPromiseValue = SyncPromise.resolve(1234);

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(_Helper).expects("buildPath").withExactArgs("/foo", "bar").returns("~");
			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
				.returns(oSyncPromiseValue);
			this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("~")
				.returns(oSyncPromiseType);
			if (bTypeIsResolved) {
				this.mock(oType).expects("formatValue").withExactArgs(1234, "string")
					.returns("1,234");
			}

			//code under test
			assert.strictEqual(oContext.getProperty("bar", true),
				bTypeIsResolved ? "1,234" : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: primitive result", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext = Context.create(null, oBinding, "/foo"),
			oContextMock = this.mock(oContext);

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves("/resolved/bar"); // no need to return a SyncPromise
		oBindingMock.expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "baz", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves("/resolved/baz"); // no need to return a SyncPromise
		oContextMock.expects("fetchValue")
			.withExactArgs("/resolved/bar", null, undefined)
			.resolves(42); // no need to return a SyncPromise
		oContextMock.expects("fetchValue")
			.withExactArgs("/resolved/baz", null, undefined)
			.resolves(null); // no need to return a SyncPromise

		//code under test
		return oContext.requestProperty(["bar", "baz"]).then(function (aActual) {
			assert.deepEqual(aActual, [42, null]);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: path cannot be requested", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves(undefined); // no need to return a SyncPromise
		this.mock(oContext).expects("fetchValue").never();
		this.oLogMock.expects("error").withExactArgs("Not a valid property path: bar", undefined,
			"sap.ui.model.odata.v4.Context");

		//code under test
		return oContext.requestProperty("bar").then(function (vActual) {
			assert.strictEqual(vActual, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: structured result", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 1);

		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves("/resolved/path"); // no need to return a SyncPromise
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("/resolved/path", null, undefined)
			.resolves({}); // no need to return a SyncPromise

		//code under test
		return oContext.requestProperty("bar").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Accessed value is not primitive: /resolved/path");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: external", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oMetaModel = {
				fetchUI5Type : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				}
			},
			oType = {
				formatValue : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo", 42),
			oSyncPromiseType = SyncPromise.resolve(Promise.resolve(oType)),
			oSyncPromiseValue = SyncPromise.resolve(1234);

		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves("/resolved/path"); // no need to return a SyncPromise
		this.mock(oContext).expects("fetchValue").withExactArgs("/resolved/path", null, undefined)
			.returns(oSyncPromiseValue);
		this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("/resolved/path")
			.returns(oSyncPromiseType);
		this.mock(oType).expects("formatValue").withExactArgs(1234, "string")
			.returns("1,234");

		//code under test
		return oContext.requestProperty("bar", true).then(function (oResult) {
			assert.strictEqual(oResult, "1,234");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchCanonicalPath", function (assert) {
		var oMetaModel = {
				fetchCanonicalPath : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				}
			},
			oContext = Context.create(oModel, null, "/EMPLOYEES/42"),
			oPromise = {};

		this.mock(oMetaModel).expects("fetchCanonicalPath")
			.withExactArgs(sinon.match.same(oContext))
			.returns(oPromise);

		// code under test
		assert.strictEqual(oContext.fetchCanonicalPath(), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("requestCanonicalPath", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oPromise,
			oSyncPromise = SyncPromise.resolve(Promise.resolve("/EMPLOYEES('1')"));

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		oPromise = oContext.requestCanonicalPath();

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oResult) {
			assert.deepEqual(oResult, "/EMPLOYEES('1')");
		});
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: success", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oSyncPromise = SyncPromise.resolve("/EMPLOYEES('1')");

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		assert.strictEqual(oContext.getCanonicalPath(), "/EMPLOYEES('1')");
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: unresolved", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oSyncPromise = SyncPromise.resolve(Promise.resolve("/EMPLOYEES('1')"));

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		assert.throws(function () {
			oContext.getCanonicalPath();
		}, new Error("Result pending"));
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: failure", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oError = new Error("Intentionally failed"),
			oSyncPromise = SyncPromise.resolve().then(function () {throw oError;});

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		assert.throws(function () {
			oContext.getCanonicalPath();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForPath: delegation to parent binding", function (assert) {
		var oBinding = {
				getQueryOptionsForPath : function () {}
			},
			oContext = Context.create(null, oBinding, "/EMPLOYEES/42"),
			sPath = "any/path",
			mResult = {};

		this.mock(oBinding).expects("getQueryOptionsForPath").withExactArgs(sPath).returns(mResult);

		// code under test
		assert.strictEqual(oContext.getQueryOptionsForPath(sPath), mResult);
	});

	//*********************************************************************************************
	QUnit.test("getGroupId", function (assert) {
		var oBinding = {
				getGroupId : function () {}
			},
			oContext = Context.create(null, oBinding, "/EMPLOYEES/42"),
			sResult = "myGroup";

		this.mock(oBinding).expects("getGroupId").withExactArgs().returns(sResult);

		// code under test
		assert.strictEqual(oContext.getGroupId(), sResult);
	});

	//*********************************************************************************************
	QUnit.test("getUpdateGroupId", function (assert) {
		var oBinding = {
				getUpdateGroupId : function () {}
			},
			oContext = Context.create(null, oBinding, "/EMPLOYEES/42"),
			sResult = "myGroup";

		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns(sResult);

		// code under test
		assert.strictEqual(oContext.getUpdateGroupId(), sResult);
	});

	//*********************************************************************************************
[false, true].forEach(function (bTransient) {
	[undefined, "myGroup"].forEach(function (sGroupId) {
		var sTitle = "delete: success, transient = " + bTransient + ", group ID = " + sGroupId;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			aBindings = [
				{removeCachesAndMessages : function () {}},
				{removeCachesAndMessages : function () {}},
				{removeCachesAndMessages : function () {}}
			],
			oGroupLock = {},
			oModel = {
				checkGroupId : function () {},
				getAllBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/Foo/Bar('42')", 42),
			oPromise = Promise.resolve(),
			that = this;

		this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
		this.mock(oContext).expects("hasPendingChanges").exactly(bTransient ? 0 : 1).withExactArgs()
			.returns(false);
		this.mock(oBinding).expects("lockGroup")
			.withExactArgs(!sGroupId && bTransient ? "$direct" : sGroupId, true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock))
			.returns(oPromise);
		oPromise.then(function () {
			that.mock(oModel).expects("getAllBindings").withExactArgs().returns(aBindings);
			that.mock(aBindings[0]).expects("removeCachesAndMessages")
				.withExactArgs("Foo/Bar('42')", true);
			that.mock(aBindings[1]).expects("removeCachesAndMessages")
				.withExactArgs("Foo/Bar('42')", true);
			that.mock(aBindings[2]).expects("removeCachesAndMessages")
				.withExactArgs("Foo/Bar('42')", true);
		});

		// code under test
		return oContext.delete(sGroupId).then(function () {
			assert.ok(true);
		}, function (oError0) {
			assert.notOk(true);
		});
	});

	});
});

	//*********************************************************************************************
	QUnit.test("delete: failure", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			oError = new Error(),
			oGroupLock = {unlock : function () {}},
			oModel = {
				checkGroupId : function () {},
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("checkGroupId").withExactArgs("myGroup");
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs()
			// check before deletion and twice while reporting the error
			.exactly(3)
			.returns(true);
		this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup", true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock))
			.returns(Promise.reject(oError));
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(oModel).expects("reportError")
			.withExactArgs("Failed to delete " + oContext, "sap.ui.model.odata.v4.Context",
				oError);

		// code under test
		return oContext.delete("myGroup").then(function () {
			assert.notOk(true);
		}, function (oError0) {
			assert.ok(true);
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("delete: error in checkGroupId and checkSuspended", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oBindingMock = this.mock(oBinding),
			sGroupId = "$invalid",
			oModel = {
				checkGroupId : function () {}
			},
			oModelMock = this.mock(oModel),
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oError0 = new Error("invalid group"),
			oError1 = new Error("suspended");

		oModelMock.expects("checkGroupId").withExactArgs(sGroupId).throws(oError0);
		oBindingMock.expects("checkSuspended").never();

		assert.throws(function () {
			oContext.delete(sGroupId);
		}, oError0);

		oModelMock.expects("checkGroupId").withExactArgs("$auto");
		oBindingMock.expects("checkSuspended").withExactArgs().throws(oError1);

		assert.throws(function () {
			oContext.delete("$auto");
		}, oError1);
	});

	//*********************************************************************************************
	QUnit.test("delete: pending changes", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			sGroupId = "$auto",
			oModel = {
				checkGroupId : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			oContext.delete(sGroupId);
		}, new Error("Cannot delete due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("_delete: success", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oETagEntity = {},
			oGroupLock = {},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath")
			.withExactArgs().returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oBinding).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')",
				sinon.match.same(oContext), sinon.match.same(oETagEntity))
			.returns(Promise.resolve());

		// code under test
		return oContext._delete(oGroupLock, oETagEntity).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.strictEqual(oContext.oBinding, oBinding);
			assert.strictEqual(oContext.oModel, oModel);
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: transient", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oGroupLock = {},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES($uid=id-1-23)", -1,
				new Promise(function () {}));

		this.mock(oBinding).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "n/a", sinon.match.same(oContext))
			.returns(Promise.resolve());

		// code under test
		return oContext._delete(oGroupLock, {}).then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.strictEqual(oContext.oBinding, oBinding);
			assert.strictEqual(oContext.oModel, oModel);
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: failure", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oError = new Error(),
			oGroupLock = {},
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath")
			.withExactArgs().returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oBinding).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')",
				sinon.match.same(oContext), undefined)
			.returns(Promise.reject(oError));

		// code under test
		return oContext._delete(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.strictEqual(oContext.getBinding(), oBinding);
			assert.strictEqual(oContext.getModelIndex(), 42);
			assert.strictEqual(oContext.getModel(), oModel);
			assert.strictEqual(oContext.getPath(), "/EMPLOYEES/42");
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: failure in fetchCanonicalPath", function (assert) {
		var oBinding = {},
			oError = new Error(),
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath")
			.withExactArgs().returns(SyncPromise.reject(oError));

		// code under test
		return oContext._delete({}).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			oBinding1 = {
				setContext : function () {}
			},
			oBinding2 = {
				setContext : function () {}
			},
			oParentBinding = {},
			oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("setContext").withExactArgs(undefined);
		this.mock(oBinding2).expects("setContext").withExactArgs(undefined);
		this.mock(BaseContext.prototype).expects("destroy").on(oContext).withExactArgs();

		// code under test
		oContext.destroy();

		assert.strictEqual(oContext.oBinding, undefined);
		assert.strictEqual(oContext.oModel, undefined/*TODO oModel*/);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			bBinding1Updated = false,
			oBinding1 = {
				checkUpdate : function () {
					return new SyncPromise(function (resolve) {
						setTimeout(function () {
							bBinding1Updated = true;
							resolve();
						});
					});
				}
			},
			bBinding2Updated = false,
			oBinding2 = {
				checkUpdate : function () {
					return new SyncPromise(function (resolve) {
						setTimeout(function () {
							bBinding2Updated = true;
							resolve();
						});
					});
				}
			},
			oParentBinding = {},
			oPromise,
			oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);

		// code under test
		oPromise = oContext.checkUpdate();

		assert.strictEqual(oPromise.isFulfilled(), false);
		return oPromise.then(function () {
			assert.strictEqual(bBinding1Updated, true);
			assert.strictEqual(bBinding2Updated, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh, list binding", function (assert) {
		var bAllowRemoval = {/*false, true, undefined*/},
			oBinding = {
				checkSuspended : function () {},
				getContext : function () { return null; },
				isRelative : function () { return false; },
				lockGroup : function () {},
				refresh : function () {},
				refreshSingle : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oGroupLock = {},
			oModel = {
				checkGroupId : function () {},
				withUnresolvedBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("checkGroupId");
		oBindingMock.expects("lockGroup").withExactArgs("myGroup", true).returns(oGroupLock);
		oBindingMock.expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(false);
		oBindingMock.expects("refresh").never();
		oBindingMock.expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock),
				sinon.match.same(bAllowRemoval));
		this.mock(oModel).expects("withUnresolvedBindings")
			.withExactArgs("removeCachesAndMessages", "EMPLOYEES/42");

		// code under test
		oContext.refresh("myGroup", bAllowRemoval);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bReturnValueContext) {
		QUnit.test("refresh, context binding, " + bReturnValueContext, function (assert) {
			var oBinding = {
					checkSuspended : function () {},
					getContext : function () { return {}; },
					isRelative : function () { return false; },
					refresh : function () {},
					refreshReturnValueContext : function () {}
				},
				oBindingMock = this.mock(oBinding),
				oModel = {
					checkGroupId : function () {},
					withUnresolvedBindings : function () {}
				},
				oModelMock = this.mock(oModel),
				oContext =  Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
				oContextMock = this.mock(oContext);

			oModelMock.expects("checkGroupId").withExactArgs("myGroup");
			oBindingMock.expects("checkSuspended").withExactArgs();
			oContextMock.expects("hasPendingChanges").withExactArgs().returns(false);
			oBindingMock.expects("refreshReturnValueContext")
				.withExactArgs(sinon.match.same(oContext), "myGroup")
				.returns(bReturnValueContext);
			oBindingMock.expects("refresh").withExactArgs("myGroup")
				.exactly(bReturnValueContext ? 0 : 1);
			oModelMock.expects("withUnresolvedBindings")
				.withExactArgs("removeCachesAndMessages", "EMPLOYEES('42')");

			// code under test
			oContext.refresh("myGroup");

			oModelMock.expects("checkGroupId").withExactArgs("myGroup");
			oBindingMock.expects("checkSuspended").withExactArgs();
			oContextMock.expects("hasPendingChanges").withExactArgs().returns(false);

			assert.throws(function () {
				// code under test
				oContext.refresh("myGroup", undefined);
			}, new Error("Unsupported parameter bAllowRemoval: undefined"));
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh, error handling: invalid group", function (assert) {
		var oBinding = {},
			oError = new Error(),
			sGroupId = "$foo",
			oModel = {
				checkGroupId : function () {}
			};

		this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);

		assert.throws(function () {
			// code under test
			Context.create(oModel, oBinding, "/EMPLOYEES", 42).refresh(sGroupId);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh, error handling: has pending changes", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			sGroupId = "myGroup",
			oModel = {
				checkGroupId : function () {}
			},
			oContext =  Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oContext.refresh(sGroupId);
		}, new Error("Cannot refresh entity due to pending changes: /EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("withCache: absolute path", function (assert) {
		var oBinding = {
				withCache : function () {}
			},
			fnCallback = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {},
			bSync = {/*boolean*/},
			bWithOrWithoutCache = {/*boolean*/};

		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), "/foo", sinon.match.same(bSync),
				sinon.match.same(bWithOrWithoutCache))
			.returns(oResult);

		assert.strictEqual(
			oContext.withCache(fnCallback, "/foo", bSync, bWithOrWithoutCache),
			oResult
		);
	});

	//*********************************************************************************************
	QUnit.test("withCache: relative path", function (assert) {
		var oBinding = {
				withCache : function () {}
			},
			fnCallback = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {},
			bSync = {/*boolean*/},
			bWithOrWithoutCache = {/*boolean*/};

		this.mock(_Helper).expects("buildPath").withExactArgs("/EMPLOYEES('42')", "foo")
			.returns("~");
		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), "~", sinon.match.same(bSync),
				sinon.match.same(bWithOrWithoutCache))
			.returns(oResult);

		assert.strictEqual(
			oContext.withCache(fnCallback, "foo", bSync, bWithOrWithoutCache),
			oResult
		);
	});

	//*********************************************************************************************
	QUnit.test("withCache: virtual context", function (assert) {
		var oBinding = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/" + Context.VIRTUAL,
				Context.VIRTUAL),
			oResult;

		this.mock(_Helper).expects("buildPath").never();

		// code under test
		oResult = oContext.withCache();

		assert.strictEqual(oResult.isFulfilled(), true);
		assert.strictEqual(oResult.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("patch", function (assert) {
		var oCache = {
				patch : function () {}
			},
			oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')"),
			oData = {},
			sPath = "path/to/context";

		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func, "")
			.callsArgWith(0, oCache, sPath)
			.returns(Promise.resolve());
		this.mock(oCache).expects("patch").withExactArgs(sPath, sinon.match.same(oData));

		// code under test
		return oContext.patch(oData);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: error cases", function (assert) {
		var oRootBinding = {
				getContext : function () {},
				getPath : function () {}
			},
			oBinding = {
				checkSuspended : function () {},
				getRootBinding : function () { return oRootBinding; },
				isResolved : function () { return true; }
			},
			oModel = {
				checkGroupId : function () {},
				getMetaModel : function () {},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects();
		}, new Error("Missing edm:(Navigation)PropertyPath expressions"));

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects([]);
		}, new Error("Missing edm:(Navigation)PropertyPath expressions"));

		[
			undefined,
			"foo",
			{},
			{$AnnotationPath : "foo"},
			{$If : [true, {$PropertyPath : "TEAM_ID"}]}, // "a near miss" ;-)
			{$PropertyPath : ""},
			{$PropertyPath : "foo*"},
			{$PropertyPath : "foo*/*"},
			{$NavigationPropertyPath : undefined},
			{$NavigationPropertyPath : "*"},
			{$NavigationPropertyPath : "*foo"},
			{$NavigationPropertyPath : "foo/*"}
		].forEach(function (oPath) {
			var sJSON = JSON.stringify(oPath);

			assert.throws(function () {
				// code under test
				oContext.requestSideEffects([oPath]);
			}, new Error("Not an edm:(Navigation)PropertyPath expression: " + sJSON), sJSON);
		});
	});

	//*********************************************************************************************
[{
	async : true,
	auto : true,
	parked : "$parked.any",
	text : "wait and unpark for auto group (no group ID)"
}, {
	async : false,
	auto : true,
	parked : "$parked.any",
	text : "unpark for auto group (no group ID)"
}, {
	auto : false,
	text : "no auto group"
}, {
	async : true,
	auto : true,
	group : "group",
	parked : "$parked.group",
	text : "wait and unpark for auto group"
}, {
	async : false,
	auto : true,
	group : "group",
	parked : "$parked.group",
	text : "unpark for auto group"
}, {
	auto : false,
	group : "different",
	text : "different group ID"
}].forEach(function (oFixture) {
	QUnit.test("requestSideEffects: " + oFixture.text, function (assert) {
		var oRootContext = {},
			oRootBinding = {
				getContext : function () { return oRootContext; },
				getPath : function () { return "root/path"; }
			},
			oBinding = {
				oCache : {
					hasChangeListeners : function () { return false; }
				},
				checkSuspended : function () {},
				getRootBinding : function () { return oRootBinding; },
				getPath : function () { return "/EMPLOYEES('42')"; },
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getAllPathReductions : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			oModel = {
				checkGroupId : function () {},
				isAutoGroup : function () {},
				getMetaModel : function () { return oMetaModel; },
				oRequestor : {
					relocateAll : function () {},
					waitForRunningChangeRequests : function () {}
				},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
			oExpectation,
			sGroupId = oFixture.group || "any",
			oPromise,
			oWaitPromise = oFixture.async ? Promise.resolve() : SyncPromise.resolve(),
			that = this;

		function setExpectation() {
			oExpectation = that.mock(oContext).expects("requestSideEffectsInternal")
				// Note: $select not yet sorted
				.withExactArgs(["/base/TEAM_ID", "/reduced/TEAM_ID", "/base/EMPLOYEE_2_MANAGER",
					"/base/Address/*", "/base/", "/base/*"], sGroupId)
				.returns(SyncPromise.resolve({}));
		}

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs(oFixture.group);
		this.mock(oModel).expects("resolve")
			.withExactArgs("root/path", sinon.match.same(oRootContext))
			.returns("/base");
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/TEAM_ID", "/base")
			.returns(["/base/TEAM_ID", "/reduced/TEAM_ID"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_MANAGER", "/base")
			.returns(["/base/EMPLOYEE_2_MANAGER"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/Address/*", "/base").returns(["/base/Address/*"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')", "/base").returns(["/base/"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/*", "/base").returns(["/base/*"]);
		this.mock(oContext).expects("getUpdateGroupId").exactly(oFixture.group ? 0 : 1)
			.withExactArgs().returns("any");
		this.mock(oModel).expects("isAutoGroup").withExactArgs(sGroupId).returns(oFixture.auto);
		this.mock(oModel.oRequestor).expects("waitForRunningChangeRequests")
			.exactly(oFixture.auto ? 1 : 0)
			.withExactArgs(sGroupId).returns(SyncPromise.resolve(oWaitPromise));

		if (oFixture.auto) {
			oWaitPromise.then(function () {
				that.mock(oModel.oRequestor).expects("relocateAll").exactly(oFixture.auto ? 1 : 0)
					.withExactArgs(oFixture.parked, sGroupId);
				setExpectation();
			});
		} else {
			setExpectation();
		}

		// code under test
		oPromise = oContext.requestSideEffects([{
				$PropertyPath : "TEAM_ID"
			}, {
				$NavigationPropertyPath : "EMPLOYEE_2_MANAGER"
			}, {
				$PropertyPath : "Address/*"
			}, {
				$NavigationPropertyPath : ""
			}, {
				$PropertyPath : "*"
			}], oFixture.group)
			.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
			});

		assert.ok(oPromise instanceof Promise);
		if (oExpectation) {
			assert.ok(oExpectation.called, "requestSideEffectsInternal called synchronously");
		}
		return oPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: invalid different group ID", function (assert) {
		var oBinding = {
				oCachePromise : SyncPromise.resolve({/*oCache*/}),
				checkSuspended : function () {}
			},
			sGroupId = "$invalid",
			oError = new Error("Invalid group ID: " + sGroupId),
			oModel = {
				checkGroupId : function () {},
				getMetaModel : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);
		this.mock(oContext).expects("requestSideEffectsInternal").never();

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects([{$PropertyPath : "TEAM_ID"}], sGroupId);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: suspended binding", function (assert) {
		var oBinding = {
				oCachePromise : SyncPromise.resolve({/*oCache*/}),
				checkSuspended : function () {}
			},
			oModel = {
				getMetaModel : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
			oError = new Error("Must not call...");

		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);
		this.mock(oContext).expects("requestSideEffectsInternal").never();

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects();
		}, oError);
	});

	//*********************************************************************************************
[false, true].forEach(function (bAuto) {
	QUnit.test("requestSideEffects: promise rejected, bAuto = " + bAuto, function (assert) {
		var oRootContext = {},
			oRootBinding = {
				getContext : function () { return oRootContext; },
				getPath : function () { return "root/path"; }
			},
			oBinding = {
				checkSuspended : function () {},
				getPath : function () { return "/EMPLOYEES('42')"; },
				getRootBinding : function () { return oRootBinding; },
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getAllPathReductions : function () {}
			},
			oModel = {
				checkGroupId : function () {},
				getMetaModel : function () { return oMetaModel; },
				isAutoGroup : function () {},
				oRequestor : {
					relocateAll : function () {},
					waitForRunningChangeRequests : function () {}
				},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
			oError = new Error("Failed intentionally"),
			oResult;

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs(undefined);
		this.mock(oModel).expects("resolve")
			.withExactArgs("root/path", sinon.match.same(oRootContext))
			.returns("/base");
		this.mock(oMetaModel).expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/TEAM_ID", "/base").returns(["/base/TEAM_ID"]);
		this.mock(oContext).expects("getUpdateGroupId").withExactArgs().returns("update");
		this.mock(oModel.oRequestor).expects("waitForRunningChangeRequests").exactly(bAuto ? 1 : 0)
			.withExactArgs("update").returns(SyncPromise.resolve());
		this.mock(oModel.oRequestor).expects("relocateAll").exactly(bAuto ? 1 : 0)
			.withExactArgs("$parked.update", "update");
		this.mock(oModel).expects("isAutoGroup").withExactArgs("update").returns(bAuto);
		this.mock(oContext).expects("requestSideEffectsInternal")
			.withExactArgs(["/base/TEAM_ID"], "update")
			.returns(SyncPromise.reject(oError));

		// code under test
		oResult = oContext.requestSideEffects([{$PropertyPath : "TEAM_ID"}]);

		assert.ok(oResult instanceof Promise);

		return oResult.then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffectsInternal: binding with cache", function (assert) {
		var oBinding = {
				oCache : {},
				getContext : function () {},
				getPath : function () { return "/TEAMS"; },
				requestSideEffects : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/TEAMS('42')"),
			bSideEffectsRequested = false,
			oPromise = new Promise(function (resolve) {
				window.setTimeout(function () {
					bSideEffectsRequested = true;
					resolve();
				});
			}),
			oResultPromise;

		this.mock(oBinding).expects("requestSideEffects")
			.withExactArgs("groupId", ["Name", "TeamBudget"], sinon.match.same(oContext))
			.returns(oPromise);

		// code under test
		oResultPromise = oContext.requestSideEffectsInternal([
			"/TEAMS('42')/Name",
			"/TEAMS('42')/TeamBudget"
		], "groupId");

		assert.strictEqual(oResultPromise.isPending(), true, "a SyncPromise");
		return oResultPromise.then(function () {
			assert.strictEqual(bSideEffectsRequested, true);
		});
	});

	//*********************************************************************************************
[function (oBinding, oTargetBinding, oTargetContext) {
	// bubble up to good target:
	// oBinding > oParentBinding > oTargetBinding
	// oParentBinding has no cache
	// --> please think of "/..." as "/TEAMS('1')"
	var oParentBinding = {
			oCache : null,
			getBoundContext : function () {},
			getContext : function () { return oTargetContext; },
			getPath : function () { return "TEAM_2_MANAGER"; }
		},
		oParentContext = Context.create({}, oParentBinding, "/.../TEAM_2_MANAGER");

	this.mock(oBinding).expects("getContext")
		.returns(oParentContext);
	this.mock(oBinding).expects("getPath")
		.returns("Manager_to_Team");
	this.mock(oTargetBinding).expects("getPath")
		.returns("/...");
	this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
}, function (oBinding, oTargetBinding, oTargetContext) {
	// bubble up through empty path:
	// oBinding > oIntermediateBinding > oParentBinding > oTargetBinding
	// oIntermediateBinding has cache, but empty path
	// oParentBinding has cache, but empty path
	// --> please think of "/..." as "/TEAMS('1')"
	var oIntermediateBinding = {
			getBoundContext : function () {},
			getContext : function () { /*return oParentContext;*/ },
			getPath : function () { return ""; }
		},
		oIntermediateContext = Context.create({}, oIntermediateBinding,
			"/.../TEAM_2_MANAGER"),
		oParentBinding = {
			oCache : {
				hasChangeListeners : function () { return true; }
			},
			getBoundContext : function () {},
			getContext : function () { return oTargetContext; },
			getPath : function () { return ""; }
		},
		oParentContext = Context.create({}, oParentBinding, "/.../TEAM_2_MANAGER");

	this.mock(oBinding).expects("getContext")
		.returns(oIntermediateContext);
	this.mock(oBinding).expects("getPath")
		.returns("TEAM_2_MANAGER/Manager_to_Team");
	this.mock(oIntermediateBinding).expects("getContext").returns(oParentContext);
	this.mock(oTargetBinding).expects("getPath")
		.returns("/...");
	this.mock(oTargetBinding.oCache).expects("hasChangeListeners")
		.returns(true);
}, function (oBinding, oTargetBinding, oTargetContext) {
	// do not bubble up into return value context w/o change listeners (@see BCP: 1980108040):
	// oBinding > oTargetBinding > oOperationBinding
	// oTargetBinding has empty path and is relative to operation binding's return value context
	// --> please think of "/..." as "/TEAMS('1')/some.Operation(...)"
	var oOperationBinding = {
			oCache : {
				hasChangeListeners : function () { return false; }
			},
			// oReturnValueContext : oReturnValueContext,
			getContext : function () { return null; },
			getPath : function () { return "/..."; }
		},
		oReturnValueContext = Context.createReturnValueContext({}, oOperationBinding,
			"/...");

	this.mock(oBinding).expects("getContext")
		.returns(oTargetContext);
	this.mock(oBinding).expects("getPath")
		.returns("TEAM_2_MANAGER/Manager_to_Team");
	this.mock(oTargetBinding).expects("getPath")
		.returns("");
	this.mock(oTargetBinding).expects("getContext")
		.returns(oReturnValueContext);
	this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
}, function (oBinding, oTargetBinding, oTargetContext) {
	// do not bubble up into error case:
	// oBinding > oTargetBinding > oListBinding
	// oTargetBinding has empty path
	// oListBinding has no cache
	// --> please think of "/..." as "/Department(...)/DEPARTMENT_2_TEAMS('1')"
	var oDepartmentContext = {},
		oListBinding = {
			oCache : null,
			getContext : function () { return oDepartmentContext; },
			getPath : function () { return "..."; } // DEPARTMENT_2_TEAMS
		},
		oListContext = Context.create({}, oListBinding, "/...");

	this.mock(oBinding).expects("getContext")
		.returns(oTargetContext);
	this.mock(oBinding).expects("getPath")
		.returns("TEAM_2_MANAGER/Manager_to_Team");
	this.mock(oTargetBinding).expects("getPath")
		.returns("");
	this.mock(oTargetBinding).expects("getContext")
		.returns(oListContext);
	this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
}, function (oBinding, oTargetBinding, oTargetContext) {
	// do not bubble up too far: once a binding with own cache has been found, only empty paths
	// may be skipped!
	// oBinding > oTargetBinding > oWrongBinding
	// oTargetBinding has empty path
	// oWrongBinding has no cache and non-empty path: bubbling must go back to oTargetBinding!
	// --> please think of "/..." as "/Department(...)/DEPARTMENT_2_TEAMS('1')"
	var oDepartmentContext = {},
		oWrongBinding = {
			oCache : null,
			getContext : function () { return oDepartmentContext; },
			getPath : function () { return "..."; } // DEPARTMENT_2_TEAMS('1')
		},
		oWrongContext = Context.create({}, oWrongBinding, "/...");

	this.mock(oBinding).expects("getContext")
		.returns(oTargetContext);
	this.mock(oBinding).expects("getPath")
		.returns("TEAM_2_MANAGER/Manager_to_Team");
	this.mock(oTargetBinding).expects("getPath")
		.returns("");
	this.mock(oTargetBinding).expects("getContext")
		.returns(oWrongContext);
	this.mock(oTargetBinding.oCache).expects("hasChangeListeners").never();
}].forEach(function (fnArrange, i) {

	QUnit.test("requestSideEffectsInternal: no own cache #" + i, function (assert) {
		var oBinding = {
				oCache : null,
				getBoundContext : function () {},
				getContext : function () {},
				getPath : function () {}
			},
			// this is where we call #requestSideEffectsInternal
			oContext = Context.create({}, oBinding, "/.../TEAM_2_MANAGER/Manager_to_Team"),
			bSideEffectsRequested = false,
			oPromise = new Promise(function (resolve) {
				window.setTimeout(function () {
					bSideEffectsRequested = true;
					resolve();
				});
			}),
			oTargetBinding = {
				oCache : {
					hasChangeListeners : function () {}
				},
				getBoundContext : function () {},
				getContext : function () {},
				getPath : function () {},
				requestSideEffects : function () {} // this is where we bubble to
			},
			oTargetContext = Context.create({}, oTargetBinding, "/...");

		fnArrange.call(this, oBinding, oTargetBinding, oTargetContext);
		this.mock(oTargetBinding).expects("requestSideEffects")
			.withExactArgs("group", [
					"TEAM_2_MANAGER/Manager_to_Team/TEAM_ID",
					"TEAM_2_MANAGER/Manager_to_Team/NAME",
					"TEAM_2_MANAGER/Manager_to_Team"
				], oTargetContext)
			.returns(oPromise);


		// code under test
		return oContext.requestSideEffectsInternal([
				"/.../TEAM_2_MANAGER/Manager_to_Team/TEAM_ID",
				"/.../TEAM_2_MANAGER/Manager_to_Team/NAME",
				"/.../TEAM_2_MANAGER/Manager_to_Team"
			], "group"
		).then(function () {
			assert.strictEqual(bSideEffectsRequested, true);
		});
	});

});

	//*********************************************************************************************
[false, true].forEach(function (bBinding, i) {
	var sTitle = "requestSideEffectsInternal: delegate up"
			+ (bBinding ? " and request on binding" : "");

	QUnit.test(sTitle, function (assert) {
		var oParentContext = {
				getPath : function () { return "/SalesOrder('42')"; },
				requestSideEffectsInternal : function () {}
			},
			oBinding = {
				oCache : {},
				getContext : function () { return oParentContext; },
				getPath : function () { return "SO_2_SOITEM"; },
				requestSideEffects : function () {}
			},
			oContext = Context.create({}, oBinding, "/SalesOrder('42')/SO_2_SOITEM('0010')"),
			oHelperMock = this.mock(_Helper),
			bSideEffectsRequested = false,
			oPromise1 = new Promise(function (resolve) {
				window.setTimeout(function () {
					bSideEffectsRequested = true;
					resolve();
				});
			}),
			oPromise2 = Promise.resolve();

		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrder('42')/Note", "/SalesOrder('42')/SO_2_SOITEM('0010')")
			.returns(undefined);
		this.mock(oParentContext).expects("requestSideEffectsInternal")
			.withExactArgs(["/SalesOrder('42')/Note"], "groupId")
			.returns(oPromise1);
		oHelperMock.expects("getRelativePath").exactly(bBinding ? 1 : 0)
			.withExactArgs("/SalesOrder('42')/SO_2_SOITEM('0010')/Currency",
				"/SalesOrder('42')/SO_2_SOITEM('0010')")
			.returns("Currency");
		this.mock(oBinding).expects("requestSideEffects").exactly(bBinding ? 1 : 0)
			.withExactArgs("groupId", ["Currency"], oContext)
			.returns(oPromise2);

		// code under test
		return oContext.requestSideEffectsInternal(
			bBinding
				? ["/SalesOrder('42')/Note", "/SalesOrder('42')/SO_2_SOITEM('0010')/Currency"]
				: ["/SalesOrder('42')/Note"],
			"groupId"
		).then(function () {
			assert.strictEqual(bSideEffectsRequested, true);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffectsInternal: delegate up refreshes binding", function (assert) {
		var oParentContext = {
				getPath : function () { return "/SalesOrder('42')"; },
				requestSideEffectsInternal : function () {}
			},
			oBinding = {
				oCache : {},
				getContext : function () { return oParentContext; },
				getPath : function () { return "SO_2_SOITEM"; },
				requestSideEffects : function () {}
			},
			sPath = "/SalesOrder('42')/SO_2_SOITEM('0010')",
			oContext = Context.create({}, oBinding, sPath),
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEM('0010')/*", sPath)
			.returns("*");
		oHelperMock.expects("getRelativePath").withExactArgs(
				"/SalesOrderList('42')/SO_2_SOITEM('0010')/SOITEM_2_SO/SO_2_SOITEM", sPath)
			.returns("SOITEM_2_SO/SO_2_SOITEM");
		oHelperMock.expects("getRelativePath")
			.withExactArgs("/SalesOrderList('42')/SO_2_SOITEM", sPath)
			.returns(undefined);
		this.mock(oParentContext).expects("requestSideEffectsInternal")
			.withExactArgs(["/SalesOrderList('42')/SO_2_SOITEM"], "groupId")
			.callsFake(function () {
				oBinding.oCache = undefined; // simulate a refresh
				return SyncPromise.resolve("~");
			});
		this.mock(oBinding).expects("requestSideEffects").never();

		// code under test
		return oContext.requestSideEffectsInternal([
			"/SalesOrderList('42')/SO_2_SOITEM('0010')/*",
			"/SalesOrderList('42')/SO_2_SOITEM('0010')/SOITEM_2_SO/SO_2_SOITEM",
			"/SalesOrderList('42')/SO_2_SOITEM"
			], "groupId"
		).then(function (aResult) {
			assert.deepEqual(aResult, ["~"]);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffectsInternal without own cache: error case unsupported list binding",
			function (assert) {
		var oListBinding = {
				oCache : null,
//				getBoundContext : function () {},
				getContext : function () { return {}; },
				getPath : function () { return "TEAM_2_EMPLOYEES"; },
				toString : function () { return "Foo Bar"; }
			},
			oMetaModel = {},
			oModel = {
				getMetaModel : function () { return oMetaModel; }
			},
			oContext = Context.create(oModel, oListBinding, "/TEAMS('1')/TEAM_2_EMPLOYEES('2')");

		assert.throws(function () {
			// code under test
			oContext.requestSideEffectsInternal(["ID"], "groupId");
		}, new Error("Not a context binding: " + oListBinding));
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: error on transient context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {
				checkGroupId : function () {},
				getMetaModel : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext).expects("requestSideEffectsInternal").never();

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects();
		}, new Error("Unsupported context: " + oContext));
	});

	//*********************************************************************************************
	// Test error when requestSideEffects is called on a (header) context which was stored before
	// the binding becomes unresolved.
	QUnit.test("requestSideEffects: error on unresolved binding", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				isResolved : function () { return false; }
			},
			oModel = {
				checkGroupId : function () {},
				getMetaModel : function () {}
			},
			oHeaderContext = Context.create(oModel, oBinding, "/EMPLOYEES");

		this.mock(oHeaderContext).expects("requestSideEffectsInternal").never();

		assert.throws(function () {
			// code under test
			oHeaderContext.requestSideEffects([{$PropertyPath : "TEAM_ID"}]);
		}, new Error("Cannot request side effects of unresolved binding's context: /EMPLOYEES"));
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: fetchUpdataData fails", function (assert) {
		var oBinding = {
				doSetProperty : function () {}
			},
			oMetaModel = {
				fetchUpdateData : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
		that = this;

		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "some/relative/path", false, true)
			.callsFake(function (fnProcessor) {
				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("some/relative/path", undefined, undefined);
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("some/relative/path", sinon.match.same(oContext), true)
					.returns(SyncPromise.resolve(Promise.reject(oError)));

				return fnProcessor({/*oCache*/}, "some/relative/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("some/relative/path").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: withCache fails", function (assert) {
		var oBinding = {},
			oMetaModel = {},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed");

		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func,
			"some/relative/path", /*bSync*/false, /*bWithOrWithoutCache*/true)
			.returns(SyncPromise.reject(oError));

		// code under test
		return oContext.doSetProperty("some/relative/path").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
[function (oModelMock, oBinding, oBindingMock, fnErrorCallback, fnPatchSent, oError) {
	return Promise.reject(oError); // #update fails
}, function (oModelMock, oBinding, oBindingMock, fnErrorCallback, fnPatchSent, oError) {
	// simulate a failed PATCH via Context#setProperty
	oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();

	// code under test: fnPatchSent
	fnPatchSent();

	oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(false);

	return Promise.reject(oError); // #update fails
}, function () {
	// simulate a PATCH for a newly created entity (PATCH is merged into POST -> no events)
	return Promise.resolve("n/a"); // #update succeeds
}, function (oModelMock, oBinding, oBindingMock, fnErrorCallback, fnPatchSent) {
	// simulate repeating a patch if first request failed
	var oError = new Error("500 Internal Server Error");

	oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();

	// code under test: fnPatchSent
	fnPatchSent();

	oModelMock.expects("reportError").twice()
		.withExactArgs("Failed to update path /resolved/data/path",
			"sap.ui.model.odata.v4.Context", sinon.match.same(oError));
	oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(false);

	// code under test: simulate retry; call fnErrorCallback and then fnPatchSent
	fnErrorCallback(oError);
	fnErrorCallback(oError); // no patchCompleted event if it is already fired

	oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();
	fnPatchSent();

	oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(true);

	return Promise.resolve("n/a"); // #update succeeds after retry
}].forEach(function (fnScenario, i) {
	var sTitle = "doSetProperty: scenario " + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				firePatchCompleted : function () {},
				firePatchSent : function () {},
				getUpdateGroupId : function () {},
				isPatchWithoutSideEffects : function () {},
				sPath : "binding/path"
			},
			oBindingMock = this.mock(oBinding),
			oGroupLock = {},
			oMetaModel = {
				fetchUpdateData : function () {},
				getUnitOrCurrencyPath : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				},
				reportError : function () {},
				resolve : function () {}
			},
			oModelMock = this.mock(oModel),
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			oError = new Error("This call intentionally failed"),
			bSkipRetry = i === 1,
			vWithCacheResult = {},
			that = this;

		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func,
			"some/relative/path",  /*bSync*/false, /*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oCache = {
						update : function () {}
					},
					bPatchWithoutSideEffects = {/*false,true*/},
					oUpdatePromise;

				oBindingMock.expects("doSetProperty")
					.withExactArgs("cache/path", "new value", sinon.match.same(oGroupLock));
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("some/relative/path", sinon.match.same(oContext), false)
					.returns(SyncPromise.resolve({
						editUrl : "/edit/url",
						entityPath : "/entity/path",
						propertyPath : "property/path"
					}));
				oBindingMock.expects("firePatchCompleted").never();
				oBindingMock.expects("firePatchSent").never();
				oBindingMock.expects("isPatchWithoutSideEffects").withExactArgs()
					.returns(bPatchWithoutSideEffects);
				oModelMock.expects("resolve").atLeast(1) // fnErrorCallback also needs it
					.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
					.returns("/resolved/binding/path");
				oModelMock.expects("resolve").atLeast(1) // fnErrorCallback also needs it
					.withExactArgs("some/relative/path", sinon.match.same(oContext))
					.returns("/resolved/data/path");
				that.mock(_Helper).expects("getRelativePath")
					.withExactArgs("/entity/path", "/resolved/binding/path")
					.returns("helper/path");
				that.mock(oMetaModel).expects("getUnitOrCurrencyPath")
					.withExactArgs("/resolved/data/path")
					.returns("unit/or/currency/path");
				that.mock(oCache).expects("update")
					.withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value",
						/*fnErrorCallback*/bSkipRetry ? undefined : sinon.match.func, "/edit/url",
						"helper/path", "unit/or/currency/path",
						sinon.match.same(bPatchWithoutSideEffects), /*fnPatchSent*/sinon.match.func)
					.callsFake(function () {
						return SyncPromise.resolve(
							fnScenario(that.mock(oModel), oBinding, oBindingMock,
								/*fnErrorCallback*/arguments[3], /*fnPatchSent*/arguments[8],
								oError));
					});

				// code under test
				oUpdatePromise = fnProcessor(oCache, "cache/path", oBinding);

				assert.strictEqual(oUpdatePromise.isPending(), true);

				return oUpdatePromise.then(function (vResult) {
					if (i > 1) {
						assert.strictEqual(vResult, undefined);
					} else {
						assert.ok(false, "Unexpected success");
					}

					return vWithCacheResult; // allow check that #withCache's result is propagated
				}, function (oError0) {
					assert.ok(i < 2);
					assert.strictEqual(oError0, oError);

					throw oError;
				});
			});

		// code under test
		return oContext.doSetProperty("some/relative/path", "new value", oGroupLock, bSkipRetry)
			.then(function (vResult) {
				if (i > 1) {
					assert.strictEqual(vResult, vWithCacheResult);
				} else {
					assert.ok(false, "Unexpected success");
				}
			}, function (oError0) {
				assert.ok(i < 2);
				assert.strictEqual(oError0, oError);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("doSetProperty: return value context", function (assert) {
		var oGroupLock = {},
			oMetaModel = {
				fetchUpdateData : function () {},
				getReducedPath : function () {},
				getUnitOrCurrencyPath : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				},
				resolve : function () {}
			},
			oContext = Context.create(oModel, {}, "/context/path"),
			oFetchUpdateDataResult = {
				editUrl : "/edit/url",
				entityPath : "/entity/path",
				propertyPath : "property/path"
			},
			that = this;

		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "some/relative/path", /*bSync*/false,
				/*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oBinding = {
						oContext : {},
						doSetProperty : function () {},
						isPatchWithoutSideEffects : function () {},
						sPath : "binding/path",
						oReturnValueContext : {
							getPath : function () {}
						}
					},
					oCache = {
						update : function () {}
					},
					oHelperMock = that.mock(_Helper),
					oModelMock = that.mock(oModel),
					bPatchWithoutSideEffects = {/*false,true*/};

				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("some/relative/path", "new value", sinon.match.same(oGroupLock));
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("some/relative/path", sinon.match.same(oContext), false)
					.returns(SyncPromise.resolve(oFetchUpdateDataResult));
				that.mock(oBinding.oReturnValueContext).expects("getPath").withExactArgs()
					.returns("/return/value/context/path");
				oHelperMock.expects("getRelativePath")
					.withExactArgs("/entity/path", "/return/value/context/path")
					.returns("helper/path");
				oModelMock.expects("resolve")
					.withExactArgs("some/relative/path", sinon.match.same(oContext))
					.returns("/resolved/data/path");
				that.mock(oBinding).expects("isPatchWithoutSideEffects")
					.withExactArgs()
					.returns(bPatchWithoutSideEffects);
				that.mock(oMetaModel).expects("getUnitOrCurrencyPath")
					.withExactArgs("/resolved/data/path")
					.returns("unit/or/currency/path");

				that.mock(oCache).expects("update")
					.withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value",
						/*fnErrorCallback*/sinon.match.func, "/edit/url", "helper/path",
						"unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects),
						/*fnPatchSent*/sinon.match.func)
					.resolves();

				return fnProcessor(oCache, "some/relative/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: reduce path", function (assert) {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				getBaseForPathReduction : function () {},
				isPatchWithoutSideEffects : function () {},
				sPath : "binding/path"
			},
			oGroupLock = {},
			oMetaModel = {
				fetchUpdateData : function () {},
				getReducedPath : function () {},
				getUnitOrCurrencyPath : function () {}
			},
			oModel = {
				bAutoExpandSelect : true,
				getMetaModel : function () {
					return oMetaModel;
				},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			oFetchUpdateDataResult = {
				editUrl : "/edit/url",
				entityPath : "/entity/path",
				propertyPath : "property/path"
			},
			that = this;

		this.mock(_Helper).expects("buildPath")
			.withExactArgs("/BusinessPartnerList('0100000000')", "some/relative/path")
			.returns("/~");
		this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs()
			.returns("/base/path");
		this.mock(oMetaModel).expects("getReducedPath")
			.withExactArgs("/~", "/base/path")
			.returns("/reduced/path");
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "/reduced/path", /*bSync*/false,
				/*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oCache = {
						update : function () {}
					},
					oModelMock = that.mock(oModel),
					bPatchWithoutSideEffects = {/*false,true*/};

				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("/reduced/path", "new value", sinon.match.same(oGroupLock));
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("/reduced/path", sinon.match.same(oContext), false)
					.returns(SyncPromise.resolve(oFetchUpdateDataResult));
				oModelMock.expects("resolve")
					.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
					.returns("/resolved/binding/path");
				oModelMock.expects("resolve")
					.withExactArgs("/reduced/path", sinon.match.same(oContext))
					.returns("/resolved/data/path");
				that.mock(_Helper).expects("getRelativePath")
					.withExactArgs("/entity/path", "/resolved/binding/path")
					.returns("helper/path");
				that.mock(oBinding).expects("isPatchWithoutSideEffects").withExactArgs()
					.returns(bPatchWithoutSideEffects);
				that.mock(oMetaModel).expects("getUnitOrCurrencyPath")
					.withExactArgs("/resolved/data/path")
					.returns("unit/or/currency/path");

				that.mock(oCache).expects("update")
					.withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value",
						/*fnErrorCallback*/sinon.match.func, "/edit/url", "helper/path",
						"unit/or/currency/path", sinon.match.same(bPatchWithoutSideEffects),
						/*fnPatchSent*/sinon.match.func)
					.resolves();

				return fnProcessor(oCache, "/reduced/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: oGroupLock = null", function (assert) {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				//isPatchWithoutSideEffects: must not be called
				sPath : "binding/path"
			},
			oFetchUpdateDataResult = {
				editUrl : "/edit/url",
				entityPath : "/entity/path",
				propertyPath : "property/path"
			},
			oFetchUpdateDataResultPromise = Promise.resolve(oFetchUpdateDataResult),
			oMetaModel = {
				fetchUpdateData : function () {}
				//getUnitOrCurrencyPath: must not be called
			},
			oModel = {
				bAutoExpandSelect : false, // avoid path reduction
				getMetaModel : function () {
					return oMetaModel;
				},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			that = this;

		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "/some/absolute/path", /*bSync*/false,
				/*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oCache = {
						setProperty : function () {}
						//update: must not be called
					};

				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("/cache/path", "new value", undefined);
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("/some/absolute/path", sinon.match.same(oContext), true)
					.returns(SyncPromise.resolve(oFetchUpdateDataResultPromise));
				oFetchUpdateDataResultPromise.then(function () {
					that.mock(oModel).expects("resolve")
						.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
						.returns("/resolved/binding/path");
					that.mock(_Helper).expects("getRelativePath")
						.withExactArgs("/entity/path", "/resolved/binding/path")
						.returns("helper/path");
					that.mock(oCache).expects("setProperty")
						.withExactArgs("property/path", "new value", "helper/path")
						.resolves();
				});

				return fnProcessor(oCache, "/cache/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("/some/absolute/path", "new value");
	});

	//*********************************************************************************************
[SyncPromise.resolve(), undefined].forEach(function (vValue) {
	QUnit.test("doSetProperty: invocation of ODB#doSetProperty", function (assert) {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				isPatchWithoutSideEffects : function () {},
				sPath : "binding/path"
			},
			oFetchUpdateDataResult = {
				editUrl : "/edit/url",
				entityPath : "/entity/path",
				propertyPath : "property/path"
			},
			oGroupLock = {},
			oMetaModel = {
				fetchUpdateData : function () {},
				getUnitOrCurrencyPath : function () {}
			},
			oModel = {
				bAutoExpandSelect : false,
				getMetaModel : function () {
					return oMetaModel;
				},
				resolve : function () {}
			},
			bSkipRetry = {/*true, false*/},
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			that = this;

		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "/some/absolute/path",  /*bSync*/false,
				/*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oCache = {
						update : function () {}
					},
					oModelMock = that.mock(oModel),
					bPatchWithoutSideEffects = {/*false,true*/};

				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("/cache/path", "new value", sinon.match.same(oGroupLock))
					.returns(vValue);
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("/some/absolute/path", sinon.match.same(oContext), false)
					.exactly(vValue ? 0 : 1)
					.returns(SyncPromise.resolve(oFetchUpdateDataResult));

				if (vValue == undefined) {
					oModelMock.expects("resolve")
						.withExactArgs(oBinding.sPath, sinon.match.same(oBinding.oContext))
						.returns("/resolved/binding/path");
					oModelMock.expects("resolve")
						.withExactArgs("/some/absolute/path", sinon.match.same(oContext))
						.returns("/resolved/data/path");
					that.mock(_Helper).expects("getRelativePath")
						.withExactArgs("/entity/path", "/resolved/binding/path")
						.returns("helper/path");
					that.mock(oBinding).expects("isPatchWithoutSideEffects").withExactArgs()
						.returns(bPatchWithoutSideEffects);
					that.mock(oMetaModel).expects("getUnitOrCurrencyPath")
						.withExactArgs("/resolved/data/path")
						.returns("unit/or/currency/path");

					that.mock(oCache).expects("update")
						.withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value",
							/*fnErrorCallback*/bSkipRetry ? undefined : sinon.match.func,
							"/edit/url", "helper/path", "unit/or/currency/path",
							sinon.match.same(bPatchWithoutSideEffects),
							/*fnPatchSent*/sinon.match.func)
						.resolves();
				}

				return fnProcessor(oCache, "/cache/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("/some/absolute/path", "new value", oGroupLock, bSkipRetry);
	});
});

	//*********************************************************************************************
[null, "new value"].forEach(function (vValue) {
	QUnit.test("setProperty: " + vValue, function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			oModel = {
				checkGroupId : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oGroupLock = {},
			vWithCacheResult = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs("group");
		this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", vValue, sinon.match.same(oGroupLock), true)
			// allow check that #withCache's result is propagated
			.returns(SyncPromise.resolve(vWithCacheResult));

		// code under test
		return oContext.setProperty("some/relative/path", vValue, "group").then(function (vResult) {
			assert.strictEqual(vResult, vWithCacheResult);
		});
	});
});

	//*********************************************************************************************
[String, {}].forEach(function (vForbiddenValue) {
	QUnit.test("setProperty: Not a primitive value: " + vForbiddenValue, function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/ProductList('HT-1000')");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("doSetProperty").never();

		assert.throws(function () {
			// code under test
			oContext.setProperty("some/relative/path", vForbiddenValue);
		}, new Error("Not a primitive value"));
	});
});

	//*********************************************************************************************
	QUnit.test("setProperty: doSetProperty fails, unlock oGroupLock", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			oModel = {
				checkGroupId : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
			oGroupLock = {
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oPromise;

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("checkGroupId").withExactArgs("group");
		this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true)
			.returns(oGroupLock);
		oGroupLockMock.expects("unlock").never(); // not yet
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", "new value", sinon.match.same(oGroupLock), true)
			.returns(SyncPromise.resolve(Promise.reject(oError)));

		// code under test
		oPromise = oContext.setProperty("some/relative/path", "new value", "group");

		assert.ok(oPromise instanceof Promise);

		oGroupLockMock.expects("unlock").withExactArgs(true);

		return oPromise.then(function () {
				oPromise.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("setProperty: null as group ID", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/ProductList('HT-1000')"),
			oError = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("lockGroup").never();
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", "new value", null, true)
			.returns(SyncPromise.reject(oError));

		// code under test
		return oContext.setProperty("some/relative/path", "new value", null)
			.then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	QUnit.test("adjustPredicates: nothing to do", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			oContext = Context.create(oModel, {}, "/SalesOrderList('42')/SO_2_BP"),
			fnPathChanged = sinon.spy();

		this.mock(oModel).expects("getDependentBindings").never();

		// code under test
		oContext.adjustPredicate("($uid=1)", "('42')", fnPathChanged);

		assert.strictEqual(oContext.sPath, "/SalesOrderList('42')/SO_2_BP");
		sinon.assert.callCount(fnPathChanged, 0);
	});

	//*********************************************************************************************
[false, true].forEach(function (bCallback) {
	QUnit.test("adjustPredicates: callback=" + bCallback, function (assert) {
		var oBinding = {},
			oBinding1 = {
				adjustPredicate : function () {}
			},
			oBinding2 = {
				adjustPredicate : function () {}
			},
			fnPathChanged = sinon.spy(),
			oModel = {
				getDependentBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/SalesOrderList($uid=1)/SO_2_BP");

		this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')");
		this.mock(oBinding2).expects("adjustPredicate").withExactArgs("($uid=1)", "('42')");

		// code under test
		oContext.adjustPredicate("($uid=1)", "('42')", bCallback ? fnPathChanged : undefined);

		assert.strictEqual(oContext.sPath, "/SalesOrderList('42')/SO_2_BP");
		if (bCallback) {
			sinon.assert.calledWith(fnPathChanged, "/SalesOrderList($uid=1)/SO_2_BP",
				"/SalesOrderList('42')/SO_2_BP");
		}
	});
});

	//*********************************************************************************************
	QUnit.test("adjustPredicate: transient predicate as key property value", function (assert) {
		var oBinding = {},
			oModel = {
				getDependentBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo(bar='($uid=1)')");

		this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext))
			.returns([]);

		// code under test
		oContext.adjustPredicate("($uid=1)", "('42')");

		assert.strictEqual(oContext.sPath, "/foo(bar='($uid=1)')");
	});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	QUnit.test("expand: success=" + bSuccess, function (assert) {
		var oBinding = {
				expand : function () {}
			},
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/path"),
			oError = new Error(),
			oPromise = bSuccess ? Promise.resolve() : Promise.reject(oError);

		this.mock(oContext).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oBinding).expects("expand").withExactArgs(sinon.match.same(oContext))
			.returns(oPromise);
		if (!bSuccess) {
			this.mock(oModel).expects("reportError")
				.withExactArgs("Failed to expand " + oContext, "sap.ui.model.odata.v4.Context",
					sinon.match.same(oError));
		}

		// code under test
		oContext.expand();

		return oPromise.catch(function () {});
	});
});

	//*********************************************************************************************
	QUnit.test("expand: already expanded", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("isExpanded").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oContext.expand();
		}, new Error("Already expanded: " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("expand: not expandable", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("isExpanded").withExactArgs().returns({/*anything*/});

		assert.throws(function () {
			// code under test
			oContext.expand();
		}, new Error("Not expandable: " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("isExpanded", function (assert) {
		var oBinding = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/path"),
			oContextMock = this.mock(oContext);

		oContextMock.expects("getProperty").withExactArgs("@$ui5.node.isExpanded")
			.returns("~anything~");

		// code under test
		assert.strictEqual(oContext.isExpanded(), "~anything~");
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate")
			.returns("('foo')");
		this.mock(oBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive("bTrueOrFalse");

		assert.strictEqual(oContext.isKeepAlive(), "bTrueOrFalse");
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: forbidden by the binding", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/path"),
			oError = new Error();

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate")
			.returns("('foo')");
		this.mock(oBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext)).throws(oError);

		assert.throws(function () {
			// code under test
			oContext.setKeepAlive(true);
		}, oError);

		assert.strictEqual(oContext.isKeepAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: transient", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oContext.setKeepAlive(true);
		}, new Error("Unsupported transient context " + oContext));

		assert.strictEqual(oContext.isKeepAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: no predicate", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").withExactArgs().returns("~value~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate")
			.returns(undefined);

		assert.throws(function () {
			// code under test
			oContext.setKeepAlive(true);
		}, new Error("No key predicate known at /path"));

		assert.strictEqual(oContext.isKeepAlive(), false);
	});
});
