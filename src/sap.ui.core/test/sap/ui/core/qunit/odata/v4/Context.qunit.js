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
		assert.strictEqual(oContext.isDeleted(), false);
		assert.strictEqual(oContext.isInactive(), undefined);
		assert.strictEqual(oContext.isKeepAlive(), false);
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);

		// code under test
		oContext = Context.create(oModel, oBinding, sPath, 42, undefined, false);

		assert.strictEqual(oContext.isInactive(), undefined, "bInactive: false -> undefined");

		// code under test
		oContext = Context.create(oModel, oBinding, sPath, 42,
			new SyncPromise(function (resolve) {
				fnResolve = resolve;
			}), true);

		assert.strictEqual(oContext.isInactive(), true);

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
	QUnit.test("getGeneration: after Context.createNewContext", function (assert) {
		var oBinding = {},
			oContext1,
			oContext2,
			oModel = {},
			sPath = "/foo";

		oContext1 = Context.createNewContext(oModel, oBinding, sPath);
		oContext2 = Context.createNewContext(oModel, oBinding, sPath);

		// code under test
		assert.ok(oContext1.getGeneration() > 0);
		assert.strictEqual(oContext1.getGeneration(), oContext1.getGeneration());
		assert.ok(oContext2.getGeneration() > oContext1.getGeneration());

		// code under test
		oContext1.setNewGeneration();

		assert.ok(oContext1.getGeneration() > oContext2.getGeneration());
	});

	//*********************************************************************************************
	QUnit.test("getGeneration: after Context.create", function (assert) {
		var oBinding = {
				getGeneration : function () {}
			},
			oContext;

		oContext = Context.create({/*oModel*/}, oBinding, "/foo/bar");

		this.mock(oBinding).expects("getGeneration").withExactArgs().returns(23);

		// code under test
		assert.strictEqual(oContext.getGeneration(), 23);

		// code under test
		assert.strictEqual(oContext.getGeneration(true), 0);
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
		var oBinding = {
				isFirstCreateAtEnd : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext0 = Context.create(null/*oModel*/, oBinding, "/foo", 42),
			oContext1 = Context.create(null/*oModel*/, {/*ODCB*/}, "/foo"),
			iResult = {/*a number*/};

		oBindingMock.expects("isFirstCreateAtEnd").withExactArgs().returns(undefined);
		this.mock(oContext0).expects("getModelIndex").returns(iResult);

		// code under test
		assert.strictEqual(oContext0.getIndex(), iResult);

		this.mock(oContext1).expects("getModelIndex").never();

		// code under test
		assert.strictEqual(oContext1.getIndex(), undefined);

		oBindingMock.expects("isFirstCreateAtEnd").exactly(6).withExactArgs().returns(true);
		// simulate ODataListBinding#create (4x at the end)
		oBinding.bFirstCreateAtEnd = true;
		oBinding.iCreatedContexts = 4;

		// code under test
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -1).getIndex(), 0);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -4).getIndex(), 3);

		// simulate a read
		oBinding.bLengthFinal = true;
		oBinding.iMaxLength = 6;

		// code under test
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", 0).getIndex(), 0);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", 5).getIndex(), 5);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -1).getIndex(), 6);
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", -4).getIndex(), 9);
		// simulate a kept-alive context not in the collection
		assert.strictEqual(Context.create(null/*oModel*/, oBinding, "/foo", undefined).getIndex(),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("path must be absolute", function (assert) {
		assert.throws(function () {
			Context.create(null, null, "foo");
		}, new Error("Not an absolute path: foo"));

		assert.throws(function () {
			Context.createNewContext(null, null, "foo");
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
			Context.createNewContext(null, null, "/");
		}, new Error("Unsupported trailing slash: /"));
		assert.throws(function () {
			Context.createNewContext(null, null, "/foo/");
		}, new Error("Unsupported trailing slash: /foo/"));
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oContext,
			fnResolve;

		assert.strictEqual(
			// code under test
			Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees('42')").toString(),
			"/Employees('42')");

		assert.strictEqual(
			// code under test
			Context.create({}, {}, "/Employees('42')", 5).toString(),
			"/Employees('42')[5]");

		oContext = Context.create({}, {}, "/Employees($uid=123)", -1,
			new SyncPromise(function (resolve) {
				fnResolve = resolve;
			}));

		// code under test
		assert.strictEqual(oContext.toString(), "/Employees($uid=123)[-1;transient]");

		fnResolve();
		return oContext.created().then(function () {
			// code under test
			assert.strictEqual(oContext.toString(), "/Employees($uid=123)[-1;createdPersisted]");
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bAutoExpandSelect) {
	[false, true].forEach(function (bHeaderContext) {
		[undefined, "", "bar"].forEach(function (sPath) {
			var sTitle = "fetchValue: relative, path=" + sPath + ", headerContext=" + bHeaderContext
					+ " , autoExpandSelect=" + bAutoExpandSelect;

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
					getMetaModel : function () { return oMetaModel; },
					resolve : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/foo", 42),
				oListener = {},
				oResult = {};

			if (bHeaderContext) {
				oBinding.getHeaderContext = function () {};
				this.mock(oBinding).expects("getHeaderContext")
					.withExactArgs().returns({/* some other Context */});
			}
			this.mock(oModel).expects("resolve")
				.withExactArgs(sPath, sinon.match.same(oContext)).returns("/~");
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
[undefined, "", "/foo"].forEach(function (sPath) {
	QUnit.test("fetchValue: header context, path=" + JSON.stringify(sPath), function (assert) {
		var oBinding = {
				fetchValue : function () {},
				getHeaderContext : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			aElements = [];

		aElements.$count = 42;
		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);
		this.mock(oBinding).expects("fetchValue")
			.withExactArgs("/foo", "~listener~", "bCached")
			.returns(SyncPromise.resolve(Promise.resolve(aElements)));

		return oContext.fetchValue(sPath, "~listener~", "bCached").then(function (oResult) {
			assert.deepEqual(oResult, {$count : 42});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAutoExpandSelect) {
	["$count", "/foo/$count"].forEach(function (sPath) {
		var sTitle = "fetchValue: header context, autoExpandSelect=" + bAutoExpandSelect
				+ ", path=" + sPath;

	QUnit.test(sTitle + sPath, function (assert) {
		var oBinding = {
				fetchValue : function () {},
				getBaseForPathReduction : function () {},
				getHeaderContext : function () {}
			},
			oMetaModel = {
				getReducedPath : function () {}
			},
			oModel = {
				bAutoExpandSelect : bAutoExpandSelect,
				getMetaModel : function () { return oMetaModel; },
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo");

		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);
		this.mock(oModel).expects("resolve")
			.withExactArgs("$count", sinon.match.same(oContext)).returns("/~");
		if (bAutoExpandSelect) {
			this.mock(oBinding).expects("getBaseForPathReduction").withExactArgs().returns("/base");
			this.mock(oMetaModel).expects("getReducedPath").withExactArgs("/~", "/base")
				.returns("/reduced");
		}
		this.mock(oBinding).expects("fetchValue")
			.withExactArgs(bAutoExpandSelect ? "/reduced" : "/~", "~listener~", "bCached")
			.returns(SyncPromise.resolve(Promise.resolve(42)));

		return oContext.fetchValue(sPath, "~listener~", "bCached").then(function (iCount) {
			assert.deepEqual(iCount, 42);
		});
	});
	});
});
	//*********************************************************************************************
["invalid", "/foo/invalid"].forEach(function (sPath) {
	QUnit.test("fetchValue: header context, path=" + sPath, function (assert) {
		var oBinding = {
				fetchValue : function () {},
				getHeaderContext : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo");

		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);

		assert.throws(function () {
			oContext.fetchValue(sPath, "~listener~", "bCached");
		}, new Error("Invalid header path: invalid"));
	});
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
					oCache : {},
					hasPendingChanges : function () {}
					// no hasPendingChangesInDependents
				},
				oBinding1 = {
					// no hasPendingChanges
					hasPendingChangesInDependents : function () {}
				},
				oParentBinding = {
					hasPendingChangesForPath : function () {}
				},
				sPath = "/EMPLOYEES('42')",
				oContext = Context.create(oModel, oParentBinding, sPath, 13);

			this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
			this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
			this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
			this.mock(oParentBinding).expects("hasPendingChangesForPath").withExactArgs(sPath)
				.returns(false);
			this.mock(oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oContext))
				.returns([oBinding0, oBinding1]);
			this.mock(oBinding0).expects("hasPendingChanges").withExactArgs()
				.returns(oFixture.aBindingHasPendingChanges[0]);
			this.mock(oBinding1).expects("hasPendingChangesInDependents").withExactArgs()
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
			var oBinding = {
					hasPendingChangesForPath : function () {}
				},
				oModel = {
					getDependentBindings : function () {},
					withUnresolvedBindings : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/TEAMS('1')", 0);

			this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
			this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
			this.mock(oContext).expects("isDeleted").withExactArgs().exactly(bTransient ? 0 : 1)
				.returns(false);
			this.mock(oBinding).expects("hasPendingChangesForPath").exactly(bTransient ? 0 : 1)
				.withExactArgs("/TEAMS('1')").returns(false);
			this.mock(oModel).expects("getDependentBindings").exactly(bTransient ? 0 : 1)
				.withExactArgs(sinon.match.same(oContext)).returns([]);
			this.mock(oModel).expects("withUnresolvedBindings").exactly(bTransient ? 0 : 1)
				.withExactArgs("hasPendingChangesInCaches", "TEAMS('1')").returns(false);

			// code under test
			assert.strictEqual(oContext.hasPendingChanges(), bTransient);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bDeleted) {
	QUnit.test("hasPendingChanges: deleted=" + bDeleted, function (assert) {
		var oBinding = {
				hasPendingChangesForPath : function () {}
			},
			oModel = {
				getDependentBindings : function () {},
				withUnresolvedBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/TEAMS('1')", 0);

		this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(bDeleted);
		this.mock(oBinding).expects("hasPendingChangesForPath").exactly(bDeleted ? 0 : 1)
			.withExactArgs("/TEAMS('1')").returns(false);
		this.mock(oModel).expects("getDependentBindings").exactly(bDeleted ? 0 : 1)
			.withExactArgs(sinon.match.same(oContext)).returns([]);
		this.mock(oModel).expects("withUnresolvedBindings").exactly(bDeleted ? 0 : 1)
			.withExactArgs("hasPendingChangesInCaches", "TEAMS('1')").returns(false);

		// code under test
		assert.strictEqual(oContext.hasPendingChanges(), bDeleted);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bForPath) {
	QUnit.test("hasPendingChanges: for path=" + bForPath, function (assert) {
		var oBinding = {
				hasPendingChangesForPath : function () {}
			},
			oModel = {
				getDependentBindings : function () {},
				withUnresolvedBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/TEAMS('1')", 0);

		this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oBinding).expects("hasPendingChangesForPath")
			.withExactArgs("/TEAMS('1')").returns(bForPath);
		this.mock(oModel).expects("getDependentBindings").exactly(bForPath ? 0 : 1)
			.withExactArgs(sinon.match.same(oContext)).returns([]);
		this.mock(oModel).expects("withUnresolvedBindings").exactly(bForPath ? 0 : 1)
			.withExactArgs("hasPendingChangesInCaches", "TEAMS('1')").returns(false);

		// code under test
		assert.strictEqual(oContext.hasPendingChanges(), bForPath);
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
			new SyncPromise(function (resolve) {
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
				oModel = {
					resolve : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/foo"),
				oSyncPromise = SyncPromise.resolve(vResult);

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
				.returns(oSyncPromise);
			this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
				.returns("/foo/bar");

			//code under test
			assert.strictEqual(oContext.getProperty("bar"), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("getProperty: structured result", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo", 1),
			oSyncPromise = SyncPromise.resolve({});

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);
		this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
			.returns("~");

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
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo"),
			oSyncPromise = SyncPromise.resolve(Promise.resolve(42));

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);
		this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
			.returns("/foo/bar");

		//code under test
		assert.strictEqual(oContext.getProperty("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getProperty: not found in cache", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oError = new Error("Unexpected request: GET /foo/bar"),
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo");

		oError.$cached = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.reject(oError));
		this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
			.returns("/foo/bar");

		// code under test
		assert.strictEqual(oContext.getProperty("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getProperty: rejected", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo"),
			sMessage = "read error",
			oPromise = Promise.reject(new Error(sMessage)),
			oSyncPromise = SyncPromise.resolve(oPromise);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(oSyncPromise);
		this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
			.returns("/foo/bar");
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
					},
					resolve : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/foo", 42),
				oType = {
					formatValue : function () {}
				},
				oResolvedType = bTypeIsResolved ? oType : Promise.resolve(oType),
				oSyncPromiseType = SyncPromise.resolve(oResolvedType),
				oSyncPromiseValue = SyncPromise.resolve(1234);

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
				.returns(oSyncPromiseValue);
			this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
				.returns("~");
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
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo"),
			oContextMock = this.mock(oContext),
			oModelMock = this.mock(oModel);

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
		oModelMock.expects("resolve").withExactArgs("/resolved/bar", sinon.match.same(oContext))
			.returns("/resolved/bar");
		oContextMock.expects("fetchValue")
			.withExactArgs("/resolved/baz", null, undefined)
			.resolves(null); // no need to return a SyncPromise
		oModelMock.expects("resolve").withExactArgs("/resolved/baz", sinon.match.same(oContext))
			.returns("/resolved/baz");

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
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo", 1);

		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", sinon.match(function (oPromise) {
				return oPromise.isFulfilled() && isEmptyObject(oPromise.getResult());
			}))
			.resolves("/resolved/path"); // no need to return a SyncPromise
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("/resolved/path", null, undefined)
			.resolves({}); // no need to return a SyncPromise
		this.mock(oModel).expects("resolve").withExactArgs("/resolved/path",
				sinon.match.same(oContext))
			.returns("/resolved/path");

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
				},
				resolve : function () {}
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
		this.mock(oModel).expects("resolve").withExactArgs("/resolved/path",
				sinon.match.same(oContext))
			.returns("/resolved/path");
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
			oSyncPromise = SyncPromise.resolve().then(function () { throw oError; });

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
	["myGroup", null].forEach(function (sGroupId) {
		var sTitle = "delete: success, transient = " + bTransient + ", sGroupId = " + sGroupId;

		if (!bTransient && sGroupId === null) {
			return;
		}

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
			oDeletePromise,
			oGroupLock = {
				getGroupId : function () {}
			},
			oModel = {
				getAllBindings : function () {},
				isApiGroup : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/Foo/Bar('42')", 42),
			oPromise = SyncPromise.resolve(Promise.resolve()),
			that = this;

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(bTransient);
		this.mock(_Helper).expects("checkGroupId").exactly(bTransient ? 0 : 1)
			.withExactArgs("myGroup");
		this.mock(oBinding).expects("lockGroup").exactly(bTransient ? 0 : 1)
			.withExactArgs("myGroup", true, true).returns(oGroupLock);
		this.mock(oContext).expects("_delete")
			.withExactArgs(bTransient ? null : sinon.match.same(oGroupLock), null,
				bTransient ? true : "~bDoNotRequestCount~")
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
		oDeletePromise = oContext.delete(sGroupId, "~bDoNotRequestCount~");

		assert.ok(oDeletePromise instanceof Promise);
		assert.strictEqual(oContext.isDeleted(), true);

		// code under test
		assert.strictEqual(oContext.toString(), "/Foo/Bar('42')[42;deleted]");

		return oDeletePromise.then(function () {
			assert.ok(true);
			assert.strictEqual(oContext.isDeleted(), false);
		}, function () {
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
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oModel = {
				isApiGroup : function () {},
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oContextMock = this.mock(oContext);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("myGroup");
		this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup", true, true)
			.returns(oGroupLock);
		oContextMock.expects("checkUpdate").never();
		oContextMock.expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), null, "~bDoNotRequestCount~")
			.returns(Promise.resolve().then(function () {
				oContextMock.expects("checkUpdate").withExactArgs();
				throw oError;
			}));
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(oModel).expects("reportError")
			.withExactArgs("Failed to delete /EMPLOYEES/42[42;deleted]",
				"sap.ui.model.odata.v4.Context", oError);

		// code under test
		return oContext.delete("myGroup", "~bDoNotRequestCount~").then(function () {
			assert.notOk(true);
		}, function (oError0) {
			assert.ok(true);
			assert.strictEqual(oError0, oError);
			assert.strictEqual(oContext.isDeleted(), false);
		});
	});

	//*********************************************************************************************
	QUnit.test("delete: failure w/o lock", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oError = new Error(),
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('1')", undefined);

		oContext.bKeepAlive = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("_delete").withExactArgs(null, null, true).rejects(oError);
		this.mock(oContext).expects("checkUpdate").withExactArgs();
		this.mock(oModel).expects("reportError")
			.withExactArgs("Failed to delete /EMPLOYEES('1');deleted",
				"sap.ui.model.odata.v4.Context", oError);

		// code under test
		return oContext.delete(null, "~bDoNotRequestCount~").then(function () {
			assert.notOk(true);
		}, function (oError0) {
			assert.ok(true);
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("delete: no lock, but not a kept-alive context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();

		// code under test
		assert.throws(function () {
			oContext.delete(null);
		}, new Error("Cannot delete " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("delete: no lock, but kept-alive context in the collection", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/0", 0);

		oContext.bKeepAlive = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();

		// code under test
		assert.throws(function () {
			oContext.delete(null);
		}, new Error("Cannot delete " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("delete: error in checkSuspended", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42),
			oError = new Error("suspended");

		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);

		assert.throws(function () {
			oContext.delete("$auto");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("delete: error in checkGroupId", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oError = new Error("invalid group");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oContext.delete("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("delete: already deleted", function (assert) {
		var oContext = Context.create("~oModel~", "~oBinding~", "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(true);
		this.mock(oContext).expects("_delete").never();

		assert.throws(function () {
			oContext.delete("myGroup");
		}, new Error("Must not delete twice: " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("_delete: success", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oBinding).expects("_delete")
			.withExactArgs("~oGroupLock~", "EMPLOYEES('1')", sinon.match.same(oContext),
				"~oETagEntity~", "~bDoNotRequestCount~")
			.returns("~result~");

		// code under test
		return oContext._delete("~oGroupLock~", "~oETagEntity~", "~bDoNotRequestCount~")
			.then(function (oResult) {
				assert.strictEqual(oResult, "~result~");
			});
	});

	//*********************************************************************************************
	QUnit.test("_delete: no lock", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oBinding).expects("_delete")
			.withExactArgs(null, "n/a", sinon.match.same(oContext), null, true)
			.returns("~result~");

		assert.strictEqual(
			// code under test
			oContext._delete(undefined, "~oETagEntity~", "~bDoNotRequestCount~"),
			"~result~");
	});

	//*********************************************************************************************
	QUnit.test("_delete: failure", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oError = new Error(),
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oBinding).expects("_delete")
			.withExactArgs("~oGroupLock~", "EMPLOYEES('1')", sinon.match.same(oContext), undefined,
				undefined)
			.returns(Promise.reject(oError));

		// code under test
		return oContext._delete("~oGroupLock~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: failure in fetchCanonicalPath", function (assert) {
		var oError = new Error(),
			oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject(oError));

		// code under test
		return oContext._delete("~oGroupLock~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bfnOnBeforeDestroy) {
	var sTitle = "destroy" + (bfnOnBeforeDestroy ? ", with onBeforeDestroy call back" : "");

	QUnit.test(sTitle, function (assert) {
		var oBinding1 = {
				setContext : function () {}
			},
			oBinding2 = {
				setContext : function () {}
			},
			bCallbackCalled,
			iGeneration,
			oGetDependentBindingsCall,
			oModel = {
				getDependentBindings : function () {}
			},
			oParentBinding = {},
			oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42,
				SyncPromise.resolve(), "~bInactive~");

		if (bfnOnBeforeDestroy) {
			oContext.fnOnBeforeDestroy = function () {
				bCallbackCalled = true;
				assert.equal(oGetDependentBindingsCall.getCalls().length, 0); // called before
				assert.ok(oContext.oModel);
				assert.ok(oContext.oBinding);
				assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
			};
		}
		oContext.bKeepAlive = "~bKeepAlive~";
		oContext.setNewGeneration();
		iGeneration = oContext.getGeneration(true);

		oGetDependentBindingsCall = this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("setContext").withExactArgs(undefined);
		this.mock(oBinding2).expects("setContext").withExactArgs(undefined);
		this.mock(BaseContext.prototype).expects("destroy").on(oContext).withExactArgs();

		// code under test
		oContext.destroy();

		assert.strictEqual(oContext.oBinding, undefined);
		assert.strictEqual(oContext.oModel, undefined);
		assert.strictEqual(oContext.sPath, "/EMPLOYEES/42");
		assert.strictEqual(oContext.iIndex, 42); // Note: sPath and iIndex mainly define #toString
		assert.strictEqual(oContext.bKeepAlive, undefined);
		assert.strictEqual(oContext.created(), undefined);
		assert.strictEqual(oContext.getGeneration(true), iGeneration, "generation is kept");
		assert.strictEqual(oContext.isInactive(), undefined);
		assert.strictEqual(oContext.isTransient(), undefined);
		assert.strictEqual(oContext.toString(), "/EMPLOYEES/42[42;destroyed]");

		if (bfnOnBeforeDestroy) {
			assert.ok(bCallbackCalled);
		}
	});
});

	//*********************************************************************************************
	QUnit.test("checkUpdate", function () {
		var oModel = {
				getDependentBindings : function () {}
			},
			oBinding1 = {
				checkUpdate : function () {}
			},
			oBinding2 = {
				checkUpdate : function () {}
			},
			oContext = Context.create(oModel, {/*oParentBinding*/}, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("checkUpdate").withExactArgs();
		this.mock(oBinding2).expects("checkUpdate").withExactArgs();

		// code under test
		oContext.checkUpdate();
	});

	//*********************************************************************************************
	QUnit.test("checkUpdateInternal", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			bBinding1Updated = false,
			oBinding1 = {
				checkUpdateInternal : function () {
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
				checkUpdateInternal : function () {
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
		oPromise = oContext.checkUpdateInternal();

		assert.strictEqual(oPromise.isFulfilled(), false);
		return oPromise.then(function () {
			assert.strictEqual(bBinding1Updated, true);
			assert.strictEqual(bBinding2Updated, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh: list binding, reject", function () {
		var oModel = {
				getReporter : function () {}
			},
			oContext = Context.create(oModel, {/*oBinding*/}, "/EMPLOYEES/42", 42),
			oError = new Error(),
			oPromise = Promise.reject(oError),
			fnReporter = sinon.spy();

		this.mock(oContext).expects("requestRefresh").withExactArgs("groupId", "bAllowRemoval")
			.returns(oPromise);
		this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oContext.refresh("groupId", "bAllowRemoval");

		return oPromise.catch(function () {
			sinon.assert.calledOnce(fnReporter);
			sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh: context binding, reject", function () {
		var oModel = {
				getReporter : function () {}
			},
			oContext = Context.create(oModel, {/*oBinding*/}, "/EMPLOYEES('42')"),
			oError = new Error(),
			oPromise = Promise.reject(oError),
			fnReporter = sinon.spy();

		this.mock(oContext).expects("requestRefresh").withExactArgs("groupId").returns(oPromise);
		this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oContext.refresh("groupId");

		return oPromise.catch(function () {
			sinon.assert.calledOnce(fnReporter);
			sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
		});
	});

	//*********************************************************************************************
	QUnit.test("replaceWith", function () {
		var oBinding = {
				checkSuspended : function () {},
				doReplaceWith : function (/*oOldContext, oElement, sPredicate*/) {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 0),
			oOtherContext = {
				oBinding : oBinding,
				iIndex : undefined,
				bKeepAlive : true,
				getValue : function () {}
			};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oOtherContext).expects("getValue").withExactArgs().returns("~value~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~value~", "predicate")
			.returns("('23')");
		this.mock(oBinding).expects("doReplaceWith").withExactArgs(oContext, "~value~", "('23')");

		// code under test
		oContext.replaceWith(oOtherContext);
	});

	//*********************************************************************************************
	QUnit.test("replaceWith: transient context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES($uid=1)", 0,
					SyncPromise.resolve(Promise.resolve()));

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		// #toString calls #isTransient, mock neither of them

		assert.throws(function () {
			// code under test
			oContext.replaceWith();
		}, new Error("Cannot replace " + oContext));
	});

	//*********************************************************************************************
[false, true].forEach(function (bWrongBinding) {
	var sTitle = "replaceWith: "
			+ (bWrongBinding ? "not the same list binding" : "already in the collection");

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 1),
			oOtherContext = bWrongBinding
				? Context.create({/*oModel*/}, {/*not oBinding*/}, "/TEAMS('1')", 0)
				: Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('1')", /*not undefined*/0);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);

		assert.throws(function () {
			// code under test
			oContext.replaceWith(oOtherContext);
		}, new Error("Cannot replace with " + oOtherContext));
	});
});

	//*********************************************************************************************
	QUnit.test("replaceWith: other context not kept alive", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES($uid=1)", 0,
					SyncPromise.resolve(Promise.resolve())),
			oOtherContext = {
				bKeepAlive : false
			};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);

		assert.throws(function () {
			// code under test
			oContext.replaceWith(oOtherContext);
		}, new Error("Cannot replace with " + oOtherContext));
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh, list binding", function (assert) {
		var bAllowRemoval = {/*false, true, undefined*/},
			oBinding = {
				checkSuspended : function () {},
				getContext : function () { return null; },
				isRelative : function () { return false; },
				lockGroup : function () {},
				refreshSingle : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oGroupLock = {},
			oModel = {
				withUnresolvedBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oPromise,
			bRefreshed = false;

		this.mock(_Helper).expects("checkGroupId");
		oBindingMock.expects("lockGroup").withExactArgs("myGroup", true).returns(oGroupLock);
		oBindingMock.expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(false);
		oBindingMock.expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock),
				sinon.match.same(bAllowRemoval))
			.callsFake(function () {
				return new SyncPromise(function (resolve) {
					setTimeout(function () {
						bRefreshed = true;
						resolve("~");
					}, 0);
				});
			});
		this.mock(oModel).expects("withUnresolvedBindings")
			.withExactArgs("removeCachesAndMessages", "EMPLOYEES/42");

		// code under test
		oPromise = oContext.requestRefresh("myGroup", bAllowRemoval);

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
			assert.ok(bRefreshed);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bReturnValueContext) {
		QUnit.test("requestRefresh, context binding, " + bReturnValueContext, function (assert) {
			var oBinding = {
					checkSuspended : function () {},
					getContext : function () { return {}; },
					isRelative : function () { return false; },
					refreshReturnValueContext : function () {},
					requestRefresh : function () {}
				},
				oBindingMock = this.mock(oBinding),
				oModel = {
					withUnresolvedBindings : function () {}
				},
				oModelMock = this.mock(oModel),
				oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
				oContextMock = this.mock(oContext),
				oPromise,
				bRefreshed = false;

			function doRefresh() {
				return new SyncPromise(function (resolve) {
					setTimeout(function () {
						bRefreshed = true;
						resolve("~");
					}, 0);
				});
			}

			this.mock(_Helper).expects("checkGroupId").withExactArgs("myGroup");
			oBindingMock.expects("checkSuspended").withExactArgs();
			oContextMock.expects("hasPendingChanges").withExactArgs().returns(false);
			if (bReturnValueContext) {
				oBindingMock.expects("refreshReturnValueContext")
					.withExactArgs(sinon.match.same(oContext), "myGroup")
					.callsFake(doRefresh);
				oBindingMock.expects("requestRefresh").never();
			} else {
				oBindingMock.expects("refreshReturnValueContext")
					.withExactArgs(sinon.match.same(oContext), "myGroup")
					.returns(null);
				oBindingMock.expects("requestRefresh").withExactArgs("myGroup")
					.callsFake(doRefresh);
			}
			oModelMock.expects("withUnresolvedBindings")
				.withExactArgs("removeCachesAndMessages", "EMPLOYEES('42')");

			// code under test
			oPromise = oContext.requestRefresh("myGroup");

			assert.ok(oPromise instanceof Promise);
			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
				assert.ok(bRefreshed);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: bAllowRemoval on bound context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(_Helper).expects("checkGroupId").withExactArgs("myGroup");
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(false);

		assert.throws(function () {
			// code under test
			oContext.requestRefresh("myGroup", undefined);
		}, new Error("Unsupported parameter bAllowRemoval: undefined"));
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: invalid group", function (assert) {
		var oBinding = {},
			oError = new Error(),
			sGroupId = "$foo",
			oModel = {};

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);

		assert.throws(function () {
			// code under test
			Context.create(oModel, oBinding, "/EMPLOYEES", 42).requestRefresh(sGroupId);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: has pending changes", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			sGroupId = "myGroup",
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oContext.requestRefresh(sGroupId);
		}, new Error("Cannot refresh entity due to pending changes: /EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("withCache: absolute path", function (assert) {
		var oBinding = {
				withCache : function () {}
			},
			fnCallback = {},
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {},
			bSync = {/*boolean*/},
			bWithOrWithoutCache = {/*boolean*/};

		this.mock(oModel).expects("resolve")
			.withExactArgs("/foo", sinon.match.same(oContext)).returns("/foo");
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
			oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {},
			bSync = {/*boolean*/},
			bWithOrWithoutCache = {/*boolean*/};

		this.mock(oModel).expects("resolve")
			.withExactArgs("foo", sinon.match.same(oContext)).returns("~");
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
	QUnit.test("patch", function () {
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
	QUnit.test("requestSideEffects: error cases 1/2", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getObject : function () { assert.ok(false, "use only when mocked"); }
			},
			oModel = {
				getMetaModel : function () { return oMetaModel; }
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

		this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer")
			.returns(undefined);

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects([""]);
		}, new Error("Missing metadata"));
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: error cases 2/2", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getObject : function (sPath) {
					assert.strictEqual(sPath, "/$EntityContainer");
					return "~container~";
				}
			},
			oModel = {
				getMetaModel : function () { return oMetaModel; }
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		[
			undefined,
			"fo*o",
			"fo*o/*",
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

		assert.throws(function () {
			// code under test
			oContext.requestSideEffects(["/~container~wrong~path"]);
		}, new Error("Path must start with '/~container~/': /~container~wrong~path"));
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
	absolute : true,
	auto : false,
	text : "no auto group, absolute paths"
}, {
	async : true,
	auto : true,
	group : "group",
	parked : "$parked.group",
	text : "wait and unpark for auto group"
}, {
	absolute : true,
	async : true,
	auto : true,
	group : "group",
	parked : "$parked.group",
	text : "wait and unpark for auto group, absolute paths"
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
		var aAbsolutePaths = oFixture.absolute ? ["/foo", "/bar", "/baz"] : [],
			oRootBinding = {
				getResolvedPath : function () {}
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
			aFilteredPaths = [],
			oMetaModel = {
				getAllPathReductions : function () {},
				getObject : function () {}
			},
			oMetaModelMock = this.mock(oMetaModel),
			oModel = {
				isAutoGroup : function () {},
				getMetaModel : function () { return oMetaModel; },
				oRequestor : {
					relocateAll : function () {},
					waitForRunningChangeRequests : function () {}
				},
				requestSideEffects : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
			oExpectation,
			sGroupId = oFixture.group || "any",
			aPathExpressions = [
				{$PropertyPath : "TEAM_ID"},
				{$NavigationPropertyPath : "EMPLOYEE_2_MANAGER"},
				{$PropertyPath : "Address/*"},
				{$NavigationPropertyPath : ""},
				{$PropertyPath : "*"},
				"",
				"*",
				"EMPLOYEE_2_TEAM/*",
				"MANAGER_ID"
			],
			oPromise,
			oWaitPromise = oFixture.async ? Promise.resolve() : SyncPromise.resolve(),
			that = this;

		function setExpectation() {
			oExpectation = that.mock(oContext).expects("requestSideEffectsInternal")
				// Note: $select not yet sorted
				.withExactArgs(sinon.match.same(aFilteredPaths), sGroupId)
				.returns(SyncPromise.resolve({}));
			that.mock(oModel).expects("requestSideEffects")
				.withExactArgs(sGroupId, aAbsolutePaths)
				.returns(SyncPromise.resolve({}));
		}

		if (oFixture.absolute) {
			aPathExpressions = aPathExpressions.concat([
				{$PropertyPath : "/~container~/foo"},
				{$NavigationPropertyPath : "/~container~/bar"},
				"/~container~/baz"
			]);
		}
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(oFixture.group);
		this.mock(oRootBinding).expects("getResolvedPath").withExactArgs().returns("/base");
		this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer")
			.returns("~container~");
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/TEAM_ID", "/base")
			.returns(["/base/TEAM_ID", "/reduced/TEAM_ID"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_MANAGER", "/base")
			.returns(["/base/EMPLOYEE_2_MANAGER"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/Address/*", "/base").returns(["/base/Address/*"]);
		oMetaModelMock.expects("getAllPathReductions").twice()
			.withExactArgs("/EMPLOYEES('42')", "/base").returns(["/base/"]);
		oMetaModelMock.expects("getAllPathReductions").twice()
			.withExactArgs("/EMPLOYEES('42')/*", "/base").returns(["/base/*"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/MANAGER_ID", "/base").returns(["/base/MANAGER_ID"]);
		oMetaModelMock.expects("getAllPathReductions")
			.withExactArgs("/EMPLOYEES('42')/EMPLOYEE_2_TEAM/*", "/base")
			.returns(["/base/EMPLOYEE_2_TEAM/*"]);
		this.mock(_Helper).expects("filterPaths")
			.withExactArgs(aAbsolutePaths, [
				"/base/TEAM_ID", "/reduced/TEAM_ID", "/base/EMPLOYEE_2_MANAGER",
				"/base/Address/*", "/base/", "/base/*", "/base/", "/base/*",
				"/base/EMPLOYEE_2_TEAM/*", "/base/MANAGER_ID"
			])
			.returns(aFilteredPaths);
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
		oPromise = oContext.requestSideEffects(aPathExpressions, oFixture.group)
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
				getMetaModel : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);
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
	[false, true].forEach(function (bAbsolute) {
		var sTitle = "requestSideEffects: promise rejected, bAuto = " + bAuto + ", bAbsolute = "
				+ bAbsolute;

	QUnit.test(sTitle, function (assert) {
		var oRootBinding = {
				getResolvedPath : function () {}
			},
			oBinding = {
				checkSuspended : function () {},
				getPath : function () { return "/EMPLOYEES('42')"; },
				getRootBinding : function () { return oRootBinding; },
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getAllPathReductions : function () {},
				getObject : function () {}
			},
			oModel = {
				getMetaModel : function () { return oMetaModel; },
				isAutoGroup : function () {},
				oRequestor : {
					relocateAll : function () {},
					waitForRunningChangeRequests : function () {}
				},
				requestSideEffects : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')"),
			oError = new Error("Failed intentionally"),
			oResult;

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs(undefined);
		this.mock(oRootBinding).expects("getResolvedPath").withExactArgs().returns("/base");
		this.mock(oMetaModel).expects("getObject").withExactArgs("/$EntityContainer")
			.returns("~container~");
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
			.returns(bAbsolute ? SyncPromise.resolve() : SyncPromise.reject(oError));
		this.mock(oModel).expects("requestSideEffects")
			.withExactArgs("update", ["/EMPLOYEES"])
			.returns(bAbsolute ? SyncPromise.reject(oError) : SyncPromise.resolve());

		// code under test
		oResult = oContext.requestSideEffects([
			{$PropertyPath : "TEAM_ID"},
			{$NavigationPropertyPath : "/~container~/EMPLOYEES"}
		]);

		assert.ok(oResult instanceof Promise);

		return oResult.then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
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

		// code under test
		assert.strictEqual(oContext.requestSideEffectsInternal([], "groupId"), undefined);

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
		oReturnValueContext = Context.createNewContext({}, oOperationBinding,
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
[false, true].forEach(function (bBinding) {
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
				// getBoundContext : function () {},
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
	QUnit.test("doSetProperty: fetchUpdateData fails", function (assert) {
		var oBinding = {
				doSetProperty : function () {}
			},
			oMetaModel = {
				fetchUpdateData : function () {}
			},
			oModel = {
				bAutoExpandSelect : false,
				getMetaModel : function () {
					return oMetaModel;
				}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
		that = this;

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(true);
		this.mock(oContext).expects("getValue").never();
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "~sPath~", false, true)
			.callsFake(function (fnProcessor) {
				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("~sPath~", "~vValue~", "~oGroupLock~");
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("~sPath~", sinon.match.same(oContext), false)
					.returns(SyncPromise.resolve(Promise.reject(oError)));

				return fnProcessor({/*oCache*/}, "~sPath~", oBinding);
			});

		// code under test
		return oContext.doSetProperty("~sPath~", "~vValue~", "~oGroupLock~").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: deleted", function (assert) {
		var oModel = {getMetaModel : function () {}},
			oContext = Context.create(oModel, {/*oBinding*/}, "/ProductList('HT-1000')"),
			oGroupLock = {
				unlock : function () {}
			};

		this.mock(oContext).expects("isDeleted").twice().withExactArgs().returns(true);
		this.mock(oContext).expects("getValue").never();
		this.mock(oContext).expects("withCache").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		assert.throws(function () {
			oContext.doSetProperty("~sPath~", "~sValue~", oGroupLock);
		}, new Error("must not modify a deleted entity: " + oContext));

		assert.throws(function () {
			oContext.doSetProperty("~sPath~", "~sValue~", null);
		}, new Error("must not modify a deleted entity: " + oContext));
	});

	//*********************************************************************************************
[false, true].forEach(function (bHasValue) {
	QUnit.test("doSetProperty: withCache fails, bHasValue=" + bHasValue, function (assert) {
		var oBinding = {},
			oModel = {
				bAutoExpandSelect : false,
				getMetaModel : function () {
					return {}; // do not use
				}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed");

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").withExactArgs()
			// BCP: 2270087626, oCachePromise might still be pending
			.returns(bHasValue ? "~getValue~" : undefined);
		this.mock(_Helper).expects("getPrivateAnnotation").exactly(bHasValue ? 1 : 0)
			.withExactArgs("~getValue~", "transient")
			.returns("group"); // POST is not in flight
		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func,
				"~sPath~", /*bSync*/false, /*bWithOrWithoutCache*/true)
			.returns(SyncPromise.reject(oError));

		// code under test
		return oContext.doSetProperty("~sPath~", "~vValue~", "~oGroupLock~").then(function () {
			assert.ok(false, "Unexpected success");
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
[function (_assert, _oModelMock, _oBinding, _oBindingMock, _fnErrorCallback, _fnPatchSent,
		_fnIsKeepAlive, oError) {
	return Promise.reject(oError); // #update fails
}, function (assert, _oModelMock, oBinding, oBindingMock, _fnErrorCallback, fnPatchSent,
		fnIsKeepAlive, oError) {
	// simulate a failed PATCH via Context#setProperty
	oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();

	// code under test: fnPatchSent
	fnPatchSent();

	// code under test
	assert.strictEqual(fnIsKeepAlive(), "~bKeepAlive~");

	oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(false);

	return Promise.reject(oError); // #update fails
}, function () {
	// simulate a PATCH for a newly created entity (PATCH is merged into POST -> no events)
	return Promise.resolve("n/a"); // #update succeeds
}, function (_assert, oModelMock, oBinding, oBindingMock, fnErrorCallback, fnPatchSent, _oError,
		oContext) {
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
	oContext.oModel = undefined; // simulate destroy
	fnErrorCallback(oError);
	fnErrorCallback(oError); // no patchCompleted event if it is already fired

	oBindingMock.expects("firePatchSent").on(oBinding).withExactArgs();
	fnPatchSent();

	oBindingMock.expects("firePatchCompleted").on(oBinding).withExactArgs(true);

	return Promise.resolve("n/a"); // #update succeeds after retry
}].forEach(function (fnScenario, i) {
	[undefined, true].forEach(function (bInactive) {
		var sTitle = "doSetProperty: scenario " + i + ", bInactive=" + bInactive;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				fireCreateActivate : function () {},
				firePatchCompleted : function () {},
				firePatchSent : function () {},
				getResolvedPath : function () {},
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
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')", 42,
				bInactive ? new SyncPromise(function () {}) : /*oCreatePromise*/undefined,
				bInactive),
			oError = new Error("This call intentionally failed"),
			bSkipRetry = i === 1,
			vWithCacheResult = {},
			that = this;

		if (bInactive) {
			assert.strictEqual(
				// code under test
				oContext.toString(),
				"/BusinessPartnerList('0100000000')[42;inactive]");
		}
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").never();
		this.mock(oContext).expects("isKeepAlive").withExactArgs().on(oContext)
			.exactly(i === 1 ? 1 : 0).returns("~bKeepAlive~");
		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func,
			"some/relative/path", /*bSync*/false, /*bWithOrWithoutCache*/true)
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
				oBindingMock.expects("getResolvedPath").atLeast(1) // fnErrorCallback also needs it
					.withExactArgs()
					.returns("/resolved/binding/path");
				oModelMock.expects("resolve").atLeast(1) // fnErrorCallback also needs it
					.withExactArgs("some/relative/path", sinon.match.same(oContext))
					.returns("/resolved/data/path");
				that.mock(_Helper).expects("getRelativePath")
					.withExactArgs("/entity/path", "/resolved/binding/path")
					.returns("helper/path");
				oBindingMock.expects("fireCreateActivate").exactly(bInactive ? 1 : 0)
					.withExactArgs(sinon.match.same(oContext));
				that.mock(oMetaModel).expects("getUnitOrCurrencyPath")
					.withExactArgs("/resolved/data/path")
					.returns("unit/or/currency/path");
				that.mock(oCache).expects("update")
					.withExactArgs(sinon.match.same(oGroupLock), "property/path", "new value",
						/*fnErrorCallback*/bSkipRetry ? undefined : sinon.match.func, "/edit/url",
						"helper/path", "unit/or/currency/path",
						sinon.match.same(bPatchWithoutSideEffects), /*fnPatchSent*/sinon.match.func,
						/*fnIsKeepAlive*/sinon.match.func)
					.callsFake(function () {
						assert.strictEqual(oContext.isInactive(), bInactive ? false : undefined);
						return SyncPromise.resolve(
							fnScenario(assert, that.mock(oModel), oBinding, oBindingMock,
								/*fnErrorCallback*/arguments[3], /*fnPatchSent*/arguments[8],
								/*fnIsKeepAlive*/arguments[9], oError, oContext));
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
});

	//*********************************************************************************************
	QUnit.test("doSetProperty: return value context", function () {
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
						/*fnPatchSent*/sinon.match.func, /*fnIsKeepAlive*/sinon.match.func)
					.resolves();

				return fnProcessor(oCache, "some/relative/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: reduce path", function () {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				getBaseForPathReduction : function () {},
				getResolvedPath : function () {},
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
			oModelMock = this.mock(oModel),
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			oFetchUpdateDataResult = {
				editUrl : "/edit/url",
				entityPath : "/entity/path",
				propertyPath : "property/path"
			},
			that = this;

		this.mock(oContext).expects("getValue").never();
		oModelMock.expects("resolve")
			.withExactArgs("some/relative/path", sinon.match.same(oContext))
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
					bPatchWithoutSideEffects = {/*false,true*/};

				that.mock(oBinding).expects("doSetProperty")
					.withExactArgs("/reduced/path", "new value", sinon.match.same(oGroupLock));
				that.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("/reduced/path", sinon.match.same(oContext), false)
					.returns(SyncPromise.resolve(oFetchUpdateDataResult));
				that.mock(oBinding).expects("getResolvedPath").withExactArgs()
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
						/*fnPatchSent*/sinon.match.func, /*fnIsKeepAlive*/sinon.match.func)
					.resolves();

				return fnProcessor(oCache, "/reduced/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("some/relative/path", "new value", oGroupLock);
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: oGroupLock = null", function () {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				//isPatchWithoutSideEffects: must not be called
				getResolvedPath : function () {},
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
				}
			},
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')"),
			that = this;

		this.mock(oContext).expects("isTransient").never();
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
					that.mock(oBinding).expects("getResolvedPath").withExactArgs()
						.returns("/resolved/binding/path");
					that.mock(_Helper).expects("getRelativePath")
						.withExactArgs("/entity/path", "/resolved/binding/path")
						.returns("helper/path");
					that.mock(oCache).expects("setProperty")
						.withExactArgs("property/path", "new value", "helper/path", "~bUpdating~")
						.resolves();
				});

				return fnProcessor(oCache, "/cache/path", oBinding);
			});

		// code under test (no group lock!)
		return oContext.doSetProperty("/some/absolute/path", "new value",
			/*oGroupLock*/undefined, /*bSkipRetry n/a */undefined, "~bUpdating~");
	});

	//*********************************************************************************************
[SyncPromise.resolve(), undefined].forEach(function (vValue) {
	QUnit.test("doSetProperty: invocation of ODB#doSetProperty", function () {
		var oBinding = {
				oContext : {},
				doSetProperty : function () {},
				getResolvedPath : function () {},
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
			.withExactArgs(sinon.match.func, "/some/absolute/path", /*bSync*/false,
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

				if (vValue === undefined) {
					that.mock(oBinding).expects("getResolvedPath").withExactArgs()
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
							/*fnPatchSent*/sinon.match.func, /*fnIsKeepAlive*/sinon.match.func)
						.resolves();
				}

				return fnProcessor(oCache, "/cache/path", oBinding);
			});

		// code under test
		return oContext.doSetProperty("/some/absolute/path", "new value", oGroupLock, bSkipRetry);
	});
});

	//*********************************************************************************************
[undefined, true].forEach(function (bSuccess) {
	var sTitle = "doSetProperty: repeat while POST is in flight; bSuccess=" + bSuccess;

	QUnit.test(sTitle, function (assert) {
		var oModel = {
				bAutoExpandSelect : true,
				getMetaModel : function () {
					return {}; // do not use
				},
				getReporter : function () {}
			},
			oPostPromise = Promise.resolve(bSuccess),
			oContext = Context.create(oModel, /*oBinding*/null, "/ProductList($uid=123)", 0,
				SyncPromise.resolve(oPostPromise)), // transient while POST is in flight
			oContextMock = this.mock(oContext),
			oError = new Error("catch me if you can"),
			oExpectation,
			oGroupLock = {
				getUnlockedCopy : function () {},
				unlock : function () {}
			},
			fnReporter = sinon.spy();

		oContextMock.expects("isTransient").withExactArgs().returns(true);
		oContextMock.expects("doSetProperty")
			.withExactArgs("~sPath~", "~vValue~", sinon.match.same(oGroupLock), "~bSkipRetry~")
			.callThrough(); // start the recursion
		oContextMock.expects("getValue").withExactArgs().returns("~getValue~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~getValue~", "transient")
			.returns(oPostPromise);
		this.mock(oGroupLock).expects("unlock").withExactArgs();
		this.mock(oGroupLock).expects("getUnlockedCopy").withExactArgs().returns("~unlockedCopy~");
		oContextMock.expects("doSetProperty").withExactArgs("~sPath~", "~vValue~", null, true, true)
			.rejects(oError); // to prove error handling
		this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);
		oExpectation = oContextMock.expects("doSetProperty")
			.withExactArgs("~sPath~", "~vValue~", "~unlockedCopy~", "~bSkipRetry~")
			.returns("~result~"); // to prove timing and error handling
		oPostPromise.then(function () {
			var oCreatedPromise = new Promise(function (resolve) {
					setTimeout(resolve, 0); // to prove timing
				});

			assert.notOk(oExpectation.called);
			oContextMock.expects("created").exactly(bSuccess ? 1 : 0).withExactArgs()
				.returns(oCreatedPromise);
			oCreatedPromise.then(function () {
				assert.strictEqual(oExpectation.called, !bSuccess);
			});
		});

		// code under test
		return oContext.doSetProperty("~sPath~", "~vValue~", oGroupLock, "~bSkipRetry~")
			.then(function (vResult) {
				assert.strictEqual(vResult, "~result~");
				sinon.assert.calledOnce(fnReporter);
				sinon.assert.calledWithExactly(fnReporter, oError);
			});
	});
});

	//*********************************************************************************************
[undefined, true].forEach(function (bRetry) {
	[null, "new value"].forEach(function (vValue) {
	QUnit.test("setProperty: " + vValue + ", retry = " + bRetry, function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				lockGroup : function () {}
			},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oGroupLock = {},
			vWithCacheResult = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("group");
		this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true)
			.returns(oGroupLock);
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", vValue, sinon.match.same(oGroupLock), !bRetry)
			// allow check that #withCache's result is propagated
			.returns(SyncPromise.resolve(vWithCacheResult));

		// code under test
		return oContext.setProperty("some/relative/path", vValue, "group", bRetry)
			.then(function (vResult) {
				assert.strictEqual(vResult, vWithCacheResult);
			});
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
				reportError : function () {},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = new Error("This call intentionally failed"),
			oGroupLock = {
				unlock : function () {}
			},
			oGroupLockMock = this.mock(oGroupLock),
			oPromise;

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("group");
		this.mock(oBinding).expects("lockGroup").withExactArgs("group", true, true)
			.returns(oGroupLock);
		oGroupLockMock.expects("unlock").never(); // not yet
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", "new value", sinon.match.same(oGroupLock), true)
			.returns(SyncPromise.resolve(Promise.reject(oError)));
		this.mock(oModel).expects("resolve")
			.withExactArgs("some/relative/path", sinon.match.same(oContext))
			.returns("/resolved/path");
		this.mock(oModel).expects("reportError")
			.withExactArgs("Failed to update path /resolved/path", "sap.ui.model.odata.v4.Context",
				sinon.match.same(oError));

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
			oModel = {
				reportError : function () {},
				resolve : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')"),
			oError = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("lockGroup").never();
		this.mock(oContext).expects("doSetProperty")
			.withExactArgs("some/relative/path", "new value", null, true)
			.callsFake(function () {
				oContext.oModel = undefined; // must even work when the context is destroyed then
				return SyncPromise.resolve(Promise.reject(oError));
			});
		this.mock(oModel).expects("resolve")
			.withExactArgs("some/relative/path", sinon.match.same(oContext))
			.returns("/resolved/path");
		this.mock(oModel).expects("reportError")
			.withExactArgs("Failed to update path /resolved/path", "sap.ui.model.odata.v4.Context",
				sinon.match.same(oError));

		// code under test
		return oContext.setProperty("some/relative/path", "new value", null)
			.then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);

				// code under test
				assert.strictEqual(oContext.toString(), "/ProductList('HT-1000');destroyed");
			});
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
[false, true].forEach(function (bSuccess) {
	QUnit.test("expand: success=" + bSuccess, function () {
		var oBinding = {
				expand : function () {}
			},
			oModel = {
				getReporter : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/path"),
			oError = new Error(),
			oPromise = bSuccess ? Promise.resolve() : Promise.reject(oError),
			fnReporter = sinon.spy();

		this.mock(oContext).expects("isExpanded").withExactArgs().returns(false);
		this.mock(oBinding).expects("expand").withExactArgs(sinon.match.same(oContext))
			.returns(oPromise);
		this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);

		// code under test
		oContext.expand();

		return oPromise.then(function () {
			sinon.assert.notCalled(fnReporter);
		}, function () {
			sinon.assert.calledOnce(fnReporter);
			sinon.assert.calledWithExactly(fnReporter, sinon.match.same(oError));
		});
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
	QUnit.test("expand/collapse: not expandable", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path"),
		oContextMock = this.mock(oContext);

		this.mock(oContext).expects("isExpanded").twice().withExactArgs().returns({/*anything*/});

		assert.throws(function () {
			// code under test
			oContext.expand();
		}, new Error("Not expandable: " + oContext));

		oContextMock.expects("getProperty").withExactArgs("@$ui5.node.level")
			.returns({/*anything*/});
		assert.throws(function () {
			// code under test
			oContext.collapse();
		}, new Error("Not expandable: " + oContext));

		oContextMock.expects("getProperty").withExactArgs("@$ui5.node.level").returns(0);
		assert.throws(function () {
			// code under test
			oContext.collapse();
		}, new Error("Not expandable: " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("collapse", function () {
		var oBinding = {
				collapse : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/path");

		this.mock(oContext).expects("getProperty").withExactArgs("@$ui5.node.level")
			.returns({/*anything*/});
		this.mock(oContext).expects("isExpanded").withExactArgs().returns(true);
		this.mock(oBinding).expects("collapse").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.collapse();
	});

	//*********************************************************************************************
	QUnit.test("collapse: already collapsed", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("getProperty").withExactArgs("@$ui5.node.level")
			.returns({/*anything*/});
		this.mock(oContext).expects("isExpanded").withExactArgs().returns(false);

		assert.throws(function () {
			// code under test
			oContext.collapse();
		}, new Error("Already collapsed: " + oContext));
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
	QUnit.test("resetKeepAlive", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/path");

		oContext.bKeepAlive = "bTrueOrFalse";
		oContext.fnOnBeforeDestroy = "fnOnBeforeDestroy";

		// code under test
		oContext.resetKeepAlive();

		assert.strictEqual(oContext.bKeepAlive, false);
		assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive", function (assert) {
		var done = assert.async(),
			oBinding = {
				checkKeepAlive : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oError = new Error(),
			oMetaModel = {
				fetchObject : function () {
					assert.ok(false); // use only when mocked
				}
			},
			oModel = {
				bAutoExpandSelect : true,
				getMetaModel : function () { return oMetaModel; },
				getReporter : function () {
					return function (oError0) {
						assert.strictEqual(oError0, oError);
						done();
					};
				}
			},
			oContext = Context.create(oModel, oBinding, "/path");

		this.mock(oContext).expects("isTransient").exactly(3).withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").exactly(3).withExactArgs("/path");
		this.mock(oBinding).expects("checkKeepAlive").exactly(3)
			.withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive("bTrueOrFalse");
		assert.strictEqual(oContext.isKeepAlive(), "bTrueOrFalse");
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);

		oContext.fnOnBeforeDestroy = "foo";

		// code under test
		oContext.setKeepAlive(false, "fnOnBeforeDestroy", true);
		assert.strictEqual(oContext.isKeepAlive(), false);
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);

		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves("path/to/messages");
		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oContext), "path/to/messages", {})
			.resolves("/reduced/path");
		this.mock(oContext).expects("fetchValue").withExactArgs("/reduced/path")
			.rejects(oError);

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
		assert.strictEqual(oContext.isKeepAlive(), true);
		assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: forbidden by the binding", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/path"),
			oError = new Error();

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").withExactArgs("/path");
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
	QUnit.test("setKeepAlive: bRequestMessages w/o autoExpandSelect", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oModel = {
				bAutoExpandSelect : false
			},
			oContext = Context.create(oModel, oBinding, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").withExactArgs("/path");
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
		this.mock(_Helper).expects("getMetaPath").never();

		assert.throws(function () {
			// code under test
			oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
		}, new Error("Missing parameter autoExpandSelect at model"));

		assert.strictEqual(oContext.isKeepAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: missing messages annotation", function (assert) {
		var done = assert.async(),
			oBinding = {
				checkKeepAlive : function () {}
			},
			oMetaModel = {
				fetchObject : function () {}
			},
			oModel = {
				bAutoExpandSelect : true,
				getMetaModel : function () { return oMetaModel; },
				getReporter : function () {
					return function (oError) {
						assert.strictEqual(oError.message,
							"Missing @com.sap.vocabularies.Common.v1.Messages");
						done();
					};
				}
			},
			oContext = Context.create(oModel, oBinding, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").withExactArgs("/path");
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves(undefined);

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: fetchIfChildCanUse fails", function (assert) {
		var done = assert.async(),
			oBinding = {
				checkKeepAlive : function () {},
				fetchIfChildCanUseCache : function () {}
			},
			oError = new Error(),
			oMetaModel = {
				fetchObject : function () {}
			},
			oModel = {
				bAutoExpandSelect : true,
				getMetaModel : function () { return oMetaModel; },
				getReporter : function () {
					return function (oError0) {
						assert.strictEqual(oError0, oError);
						done();
					};
				}
			},
			oContext = Context.create(oModel, oBinding, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").withExactArgs("/path");
		this.mock(oBinding).expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext));
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves("path/to/messages");
		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oContext), "path/to/messages", {})
			.rejects(oError);

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
	});

	//*********************************************************************************************
	QUnit.test("refreshDependentBindings", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			oContext = Context.create(oModel, {/*oBinding*/}, "/path"),
			aDependentBindings = [{
				refreshInternal : function () {}
			}, {
				refreshInternal : function () {}
			}],
			oDependent0Promise = {},
			oDependent1Promise = {},
			oResult = {};

		this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext))
			.returns(aDependentBindings);
		this.mock(aDependentBindings[0]).expects("refreshInternal")
			.withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~")
			.returns(oDependent0Promise);
		this.mock(aDependentBindings[1]).expects("refreshInternal")
			.withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~")
			.returns(oDependent1Promise);
		this.mock(SyncPromise).expects("all").withExactArgs(sinon.match(function (aValues) {
			assert.strictEqual(aValues[0], oDependent0Promise);
			assert.strictEqual(aValues[1], oDependent1Promise);
			return aValues.length === 2;
		})).returns(oResult);

		assert.strictEqual(
			// code under test
			oContext.refreshDependentBindings("resource/path/prefix", "group", "~bCheckUpdate~",
				"~bKeepCacheOnError~"),
			oResult
		);
	});
});
