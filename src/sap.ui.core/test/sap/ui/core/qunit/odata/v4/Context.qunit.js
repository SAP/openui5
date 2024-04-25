/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, BaseContext, Context, _Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.Context";

	function mustBeMocked() { throw new Error("Must be mocked"); }

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
		assert.strictEqual(oContext.isSelected(), false);
		assert.ok(oContext.hasOwnProperty("fnOnBeforeDestroy"));
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);
		assert.strictEqual(oContext.oDeletePromise, null);
		assert.strictEqual(oContext.bFiringCreateActivate, false);

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

		assert.throws(function () {
			// code under test
			oContext.setPersisted();
		}, new Error("Not 'created persisted'"));

		fnResolve("bar");
		return oCreatedPromise.then(function () {
			assert.strictEqual(bCreatedPromisePending, false, "Created Promise resolved");
		});
	});

	//*********************************************************************************************
	QUnit.test("setPersisted", function (assert) {
		const oContext
			= Context.create({/*oModel*/}, {/*oBinding*/}, "/foo", 42, SyncPromise.resolve());
		oContext.bInactive = false; // "was created in an inactive state and has been activated"

		// code under test
		oContext.setPersisted();

		assert.strictEqual(oContext.isInactive(), undefined);
		assert.strictEqual(oContext.isTransient(), undefined);
		assert.strictEqual(oContext.created(), undefined);

		assert.throws(function () {
			// code under test
			oContext.setPersisted();
		}, new Error("Not 'created persisted'"));
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
	QUnit.test("getIndex/getModelIndex: return index after destroy", function (assert) {
		const oContext = Context.create(undefined/*oModel*/, undefined/*oBinding*/, "/foo", 42);

		// code under test
		assert.strictEqual(oContext.getIndex(), 42);
		// code under test
		assert.strictEqual(oContext.getModelIndex(), 42);
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
[false, true].forEach(function (bSelected) {
	QUnit.test("toString; bSelected=" + bSelected, function (assert) {
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

		oContext = Context.create({}, {
				getHeaderContext : true,
				onKeepAliveChanged : function () {}
			}, "/Employees($uid=123)", -1,
			new SyncPromise(function (resolve) {
				fnResolve = resolve;
			}));
		oContext.bSelected = bSelected;

		// code under test
		assert.strictEqual(oContext.toString(), bSelected
			? "/Employees($uid=123)[-1;transient;selected]"
			: "/Employees($uid=123)[-1;transient]");

		fnResolve();
		return oContext.created().then(function () {
			// code under test
			assert.strictEqual(oContext.toString(), bSelected
				? "/Employees($uid=123)[-1;createdPersisted;selected]"
				: "/Employees($uid=123)[-1;createdPersisted]");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("toString; selected outside the collection", function (assert) {
		var oContext = Context.create({}, {getHeaderContext : true}, "/Employees('1')"),
			oContextMock = this.mock(oContext);

		oContextMock.expects("isSelected").returns(true);

		// code under test
		assert.strictEqual(oContext.toString(), "/Employees('1');selected");

		oContextMock.expects("isSelected").returns(false);

		// code under test
		assert.strictEqual(oContext.toString(), "/Employees('1')");
	});

	//*********************************************************************************************
[false, true].forEach(function (bAutoExpandSelect) {
	[false, true].forEach(function (bHeaderContext) {
		var sTitle = "fetchValue: relative, path='bar', headerContext=" + bHeaderContext
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
				.withExactArgs("bar", sinon.match.same(oContext)).returns("/~");
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

			assert.strictEqual(oContext.fetchValue("bar", oListener, bCached), oResult);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bHeaderContext) {
	[undefined, ""].forEach(function (sPath) {
		var sTitle = "fetchValue: relative, path=" + sPath + ", headerContext=" + bHeaderContext;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				fetchValue : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/foo", 42);

		if (bHeaderContext) {
			oBinding.getHeaderContext = function () {};
			this.mock(oBinding).expects("getHeaderContext")
				.withExactArgs().returns({/* some other Context */});
		}
		this.mock(oBinding).expects("fetchValue").withExactArgs("/foo", "~oListener~", "~bCached~")
			.returns("~value~");

		assert.strictEqual(oContext.fetchValue(sPath, "~oListener~", "~bCached~"), "~value~");
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
			oContext = Context.create(null, oBinding, "/foo");

		oContext.bSelected = "~selected~";

		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);
		this.mock(oBinding).expects("fetchValue")
			.withExactArgs("/foo/$count", null, "bCached")
			.returns(SyncPromise.resolve(Promise.resolve(42)));

		return oContext.fetchValue(sPath, null, "bCached").then(function (oResult) {
			assert.deepEqual(oResult,
				{"@$ui5.context.isSelected" : "~selected~", $count : 42});
		});
	});
});

	//*********************************************************************************************
[undefined, "", "/foo"].forEach(function (sPath) {
	const sTitle = "fetchValue: header context; error case, path=" + JSON.stringify(sPath);

	QUnit.test(sTitle, function (assert) {
		const oContext = Context.create(null, {
			getHeaderContext : () => oContext
		}, "/foo");

		assert.throws(function () {
			oContext.fetchValue(sPath, "~listener~");
		}, new Error("Cannot register change listener for header context object"));
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bAutoExpandSelect) {
	["$count", "/foo/$count", "@$ui5.context.isSelected", "/foo/@$ui5.context.isSelected"]
			.forEach(function (sPath) {
		var sTitle = "fetchValue: header context, autoExpandSelect=" + bAutoExpandSelect
				+ ", path=" + sPath;

	QUnit.test(sTitle, function (assert) {
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

		oContext.bSelected = "~selected~";

		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);
		if (sPath.includes("$count")) {
			this.mock(oModel).expects("resolve")
				.withExactArgs("$count", sinon.match.same(oContext)).returns("/~");
			if (bAutoExpandSelect) {
				this.mock(oBinding).expects("getBaseForPathReduction")
					.withExactArgs().returns("/base");
				this.mock(oMetaModel).expects("getReducedPath")
					.withExactArgs("/~", "/base").returns("/reduced");
			}
			this.mock(oBinding).expects("fetchValue")
				.withExactArgs(bAutoExpandSelect ? "/reduced" : "/~", "~listener~", "bCached")
				.returns(SyncPromise.resolve(Promise.resolve(42)));
		} else {
			assert.notOk(oContext.mChangeListeners);

			this.mock(oBinding).expects("fetchValue").never();
			this.mock(_Helper).expects("addByPath")
				.withExactArgs(sinon.match.object, "", "~listener~")
				.callsFake((mChangeListeners) => {
					assert.strictEqual(mChangeListeners, oContext.mChangeListeners);
					assert.deepEqual(mChangeListeners, {});
				});
		}

		return oContext.fetchValue(sPath, "~listener~", "bCached").then(function (vValue) {
			assert.strictEqual(vValue, sPath.includes("$count") ? 42 : "~selected~");
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
					_hasPendingChanges : function () {}
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
			this.mock(oParentBinding).expects("hasPendingChangesForPath").withExactArgs(sPath)
				.returns(false);
			this.mock(oModel).expects("getDependentBindings")
				.withExactArgs(sinon.match.same(oContext))
				.returns([oBinding0, oBinding1]);
			this.mock(oBinding0).expects("_hasPendingChanges").withExactArgs(false, sPath)
				.returns(oFixture.aBindingHasPendingChanges[0]);
			this.mock(oBinding1).expects("hasPendingChangesInDependents")
				.withExactArgs(false, sPath)
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
	[false, true, undefined, 1].forEach(function (bInactive) {
		QUnit.test("hasPendingChanges: inactive=" + bInactive, function (assert) {
			var oBinding = {
					hasPendingChangesForPath : function () {}
				},
				oModel = {
					getDependentBindings : function () {},
					withUnresolvedBindings : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/TEAMS('1')", 0);

			this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
			this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
			this.mock(oContext).expects("isInactive").withExactArgs().returns(bInactive);
			this.mock(oBinding).expects("hasPendingChangesForPath")
				.exactly(bInactive === true ? 1 : 0)
				.withExactArgs("/TEAMS('1')").returns(false);
			this.mock(oModel).expects("getDependentBindings")
				.exactly(bInactive === true ? 1 : 0)
				.withExactArgs(sinon.match.same(oContext)).returns([]);
			this.mock(oModel).expects("withUnresolvedBindings")
				.exactly(bInactive === true ? 1 : 0)
				.withExactArgs("hasPendingChangesInCaches", "TEAMS('1')").returns(false);

			// code under test
			assert.strictEqual(oContext.hasPendingChanges(), bInactive !== true);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bDeletePending) {
	QUnit.test("hasPendingChanges: deleted, bDeletePending=" + bDeletePending, function (assert) {
		var oBinding = {
				hasPendingChangesForPath : function () {}
			},
			oModel = {
				getDependentBindings : function () {},
				withUnresolvedBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/TEAMS('1')", 0);

		oContext.oDeletePromise = bDeletePending
			? new SyncPromise(function () {})
			: SyncPromise.resolve();
		this.stub(oContext, "toString"); // called by SinonJS, would call #isTransient :-(
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("hasPendingChangesForPath").exactly(bDeletePending ? 0 : 1)
			.withExactArgs("/TEAMS('1')").returns(false);
		this.mock(oModel).expects("getDependentBindings").exactly(bDeletePending ? 0 : 1)
			.withExactArgs(sinon.match.same(oContext)).returns([]);
		this.mock(oModel).expects("withUnresolvedBindings").exactly(bDeletePending ? 0 : 1)
			.withExactArgs("hasPendingChangesInCaches", "TEAMS('1')").returns(false);

		// code under test
		assert.strictEqual(oContext.hasPendingChanges(), bDeletePending);
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
		this.mock(oModel).expects("reportError").withExactArgs("Unexpected error", sClassName,
			sinon.match.same(oError));

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

		// code under test
		assert.strictEqual(oContext.getValue("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getParent: throws error if not a list binding's context", function (assert) {
		const oNode = Context.create({/*oModel*/}, {/*oBinding*/}, "/foo");

		assert.throws(function () {
			// code under test
			oNode.getParent();
		}, new Error("Not a list binding's context: " + oNode));
	});

	//*********************************************************************************************
	QUnit.test("getParent", function (assert) {
		const oBinding = {fetchOrGetParent : mustBeMocked};
		const oNode = Context.create({/*oModel*/}, oBinding, "/foo");

		this.mock(oBinding).expects("fetchOrGetParent").withExactArgs(sinon.match.same(oNode))
			.returns("~oParentNode~");

		// code under test
		assert.strictEqual(oNode.getParent(), "~oParentNode~");
	});

	//*********************************************************************************************
	QUnit.test("requestParent: throws error if not a list binding's context", function (assert) {
		const oNode = Context.create({/*oModel*/}, {/*oBinding*/}, "/foo");

		assert.throws(function () {
			// code under test
			oNode.requestParent();
		}, new Error("Not a list binding's context: " + oNode));
	});

	//*********************************************************************************************
	QUnit.test("requestParent", async function (assert) {
		const oBinding = {fetchOrGetParent : mustBeMocked};
		const oNode = Context.create({/*oModel*/}, oBinding, "/foo");

		this.mock(oBinding).expects("fetchOrGetParent").withExactArgs(sinon.match.same(oNode), true)
			.returns("~oParentNode~");

		// code under test
		const oPromise = oNode.requestParent();

		assert.ok(oPromise instanceof Promise);
		assert.strictEqual(await oPromise, "~oParentNode~");
	});

	//*********************************************************************************************
	QUnit.test("getProperty", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/foo", 1);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchPrimitiveValue")
			.withExactArgs("some/path", "~bExternalFormat~", true)
			.returns(SyncPromise.resolve("~any~"));

		// code under test
		assert.strictEqual(oContext.getProperty("some/path", "~bExternalFormat~"), "~any~");
	});

	//*********************************************************************************************
	[42, null].forEach(function (vResult) {
		QUnit.test("fetchPrimitiveValue: primitive result " + vResult, function (assert) {
			var oModel = {
					resolve : function () {}
				},
				oContext = Context.create(oModel, {/*oBinding*/}, "/foo");

			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, undefined)
				.returns(SyncPromise.resolve(vResult));
			this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
				.returns("/foo/bar");

			// code under test
			assert.strictEqual(oContext.fetchPrimitiveValue("bar").getResult(), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchPrimitiveValue: structured result", function (assert) {
		var oModel = {
				resolve : function () {}
			},
			oContext = Context.create(oModel, {/*oBinding*/}, "/foo", 1),
			oError,
			oSyncPromise;

		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, undefined)
			.returns(SyncPromise.resolve({}));
		this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
			.returns("/foo/bar");

		// code under test
		oSyncPromise = oContext.fetchPrimitiveValue("bar");

		assert.strictEqual(oSyncPromise.isRejected(), true);
		oError = oSyncPromise.getResult();
		assert.strictEqual(oError.isNotPrimitive, true);
		assert.strictEqual(oError.message, "Accessed value is not primitive: /foo/bar");
		oSyncPromise.caught();
	});

	//*********************************************************************************************
	QUnit.test("getProperty: structured result", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/foo", 1),
			oError = new Error("Accessed value is not primitive: ~");

		oError.isNotPrimitive = true;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchPrimitiveValue").withExactArgs("bar", undefined, true)
			.returns(SyncPromise.reject(oError));

		// code under test
		assert.throws(function () {
			oContext.getProperty("bar");
		}, oError);
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

		// code under test
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
		this.mock(oContext).expects("fetchPrimitiveValue").withExactArgs("bar", undefined, true)
			.returns(SyncPromise.reject(oError));

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
		this.mock(oContext).expects("fetchPrimitiveValue").withExactArgs("bar", undefined, true)
			.returns(oSyncPromise);
		this.oLogMock.expects("warning").withExactArgs(sMessage, "bar", sClassName);

		return oPromise.catch(function () {
			// code under test
			assert.strictEqual(oContext.getProperty("bar"), undefined);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bTypeIsResolved) {
		var sTitle = "fetchPrimitiveValue: external, bTypeIsResolved=" + bTypeIsResolved;

		QUnit.test(sTitle, function (assert) {
			var oMetaModel = {
					fetchUI5Type : function () {}
				},
				oModel = {
					getMetaModel : function () {
						return oMetaModel;
					},
					resolve : function () {}
				},
				oContext = Context.create(oModel, {/*oBinding*/}, "/foo", 42),
				oType = {
					formatValue : function () {}
				},
				oResolvedType = bTypeIsResolved ? oType : Promise.resolve(oType),
				oResult,
				oSyncPromiseType = SyncPromise.resolve(oResolvedType),
				oSyncPromiseValue = SyncPromise.resolve(1234);

			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, "~bCached~")
				.returns(oSyncPromiseValue);
			this.mock(oModel).expects("resolve").withExactArgs("bar", sinon.match.same(oContext))
				.returns("~");
			this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("~")
				.returns(oSyncPromiseType);
			if (bTypeIsResolved) {
				this.mock(oType).expects("formatValue").withExactArgs(1234, "string")
					.returns("1,234");
			}

			// code under test
			oResult = oContext.fetchPrimitiveValue("bar", true, "~bCached~");

			if (bTypeIsResolved) {
				assert.strictEqual(oResult.getResult(), "1,234");
			} else {
				assert.ok(oResult.isPending());
			}
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
			oContextMock = this.mock(oContext);

		oBindingMock.expects("checkSuspended").withExactArgs();
		oBindingMock.expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "bar", undefined, true)
			.resolves("/resolved/bar"); // no need to return a SyncPromise
		oBindingMock.expects("fetchIfChildCanUseCache")
			.withExactArgs(oContext, "baz", undefined, true)
			.resolves("/resolved/baz"); // no need to return a SyncPromise
		oContextMock.expects("fetchPrimitiveValue")
			.withExactArgs("/resolved/bar", "~bExternalFormat~")
			.resolves(42); // no need to return a SyncPromise
		oContextMock.expects("fetchPrimitiveValue")
			.withExactArgs("/resolved/baz", "~bExternalFormat~")
			.resolves(null); // no need to return a SyncPromise

		// code under test
		return oContext.requestProperty(["bar", "baz"], "~bExternalFormat~")
			.then(function (aActual) {
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
			.withExactArgs(oContext, "bar", undefined, true)
			.resolves(undefined); // no need to return a SyncPromise
		this.mock(oContext).expects("fetchValue").never();
		this.oLogMock.expects("error")
			.withExactArgs("Not a valid property path: bar", undefined, sClassName);

		// code under test
		return oContext.requestProperty("bar").then(function (vActual) {
			assert.strictEqual(vActual, undefined);
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

		// code under test
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

		// code under test
		assert.strictEqual(oContext.getCanonicalPath(), "/EMPLOYEES('1')");
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: unresolved", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oSyncPromise = SyncPromise.resolve(Promise.resolve("/EMPLOYEES('1')"));

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		// code under test
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

		// code under test
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
[
	{transient : false, groupId : "myGroup"},
	{transient : true, groupId : "myGroup"},
	{transient : true, groupId : null},
	{transient : true, groupId : null, hierarchy : true}
].forEach(function (oFixture) {
	QUnit.test("delete: success " + JSON.stringify(oFixture), function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				delete : function () {},
				getHeaderContext : function () {},
				lockGroup : function () {},
				onKeepAliveChanged : function () {},
				mParameters : {}
			},
			oContext = Context.create("~oModel~", oBinding, "/Foo/Bar('42')", 42,
				oFixture.transient ? new SyncPromise(function () {}) : /*oCreatePromise*/undefined),
			oDeletePromise,
			oExpectation,
			bSelected = !!oFixture.groupId;

		if (oFixture.hierarchy) {
			oBinding.mParameters.$$aggregation = {hierarchyQualifier : "X"};
		}
		oContext.bSelected = bSelected;
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").exactly(oFixture.transient ? 0 : 1)
			.withExactArgs("myGroup", false, true);
		this.mock(oContext).expects("fetchCanonicalPath").exactly(oFixture.transient ? 0 : 1)
			.withExactArgs().returns(SyncPromise.resolve("/Bar('23')"));
		this.mock(oBinding).expects("lockGroup").exactly(oFixture.transient ? 0 : 1)
			.withExactArgs("myGroup", true, true).returns("~oGroupLock~");
		oExpectation = this.mock(oBinding).expects("delete")
			.withExactArgs(oFixture.transient ? null : "~oGroupLock~",
				oFixture.transient ? undefined : "Bar('23')", sinon.match.same(oContext), null,
				oFixture.transient ? true : "~bDoNotRequestCount~",
				sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve()));

		// code under test
		oDeletePromise = oContext.delete(oFixture.groupId, "~bDoNotRequestCount~");

		assert.ok(oDeletePromise instanceof Promise);

		oContext.oDeletePromise = "~oDeletePromise~";
		assert.strictEqual(oContext.toString(), "/Foo/Bar('42')[42;deleted]");
		assert.strictEqual(oContext.isDeleted(), true);

		// code under test
		assert.strictEqual(oContext.isSelected(), false, "selection hidden while deleted");

		// code under test - callback
		oExpectation.args[0][5]();

		assert.strictEqual(oContext.oDeletePromise, null);

		// code under test
		assert.strictEqual(oContext.isSelected(), bSelected);

		return oDeletePromise;
	});
});

	//*********************************************************************************************
["myGroup", null].forEach(function (sGroupId) {
	QUnit.test("delete: oBinding.delete fails, sGroupId=" + sGroupId, function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				delete : function () {},
				lockGroup : function () {},
				mParameters : "~mParameters~"
			},
			oGroupLock = {
				unlock : function () {}
			},
			oContext = Context.create("~oModel~", oBinding, "/Foo/Bar('42')");

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isKeepAlive").exactly(sGroupId ? 0 : 1)
			.withExactArgs().returns(true);
		this.mock(_Helper).expects("checkGroupId").exactly(sGroupId ? 1 : 0)
			.withExactArgs("myGroup", false, true);
		this.mock(oContext).expects("fetchCanonicalPath").exactly(sGroupId ? 1 : 0).withExactArgs()
			.returns(SyncPromise.resolve("/EMPLOYEES('42')"));
		this.mock(oBinding).expects("lockGroup").exactly(sGroupId ? 1 : 0)
			.withExactArgs(sGroupId, true, true).returns(oGroupLock);
		this.mock(oBinding).expects("delete")
			.withExactArgs(sGroupId ? sinon.match.same(oGroupLock) : null,
				sGroupId ? "EMPLOYEES('42')" : undefined, sinon.match.same(oContext), null,
				sGroupId ? "~bDoNotRequestCount~" : true, sinon.match.func)
			.returns(Promise.reject("~oError~"));
		this.mock(oGroupLock).expects("unlock").exactly(sGroupId ? 1 : 0).withExactArgs(true);

		// code under test
		return oContext.delete(sGroupId, "~bDoNotRequestCount~").then(function () {
			assert.notOk(true);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("delete: fetchCanonicalPath fails", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				delete : function () {},
				lockGroup : function () {},
				mParameters : {$$aggregation : {hierarchyQualifier : "X"}}
			},
			oModel = {
				isApiGroup : mustBeMocked
			},
			oContext = Context.create(oModel, oBinding, "/Foo/Bar('42')", 42),
			oGroupLock = {
				unlock : function () {}
			};

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oModel).expects("isApiGroup").withExactArgs("myGroup").returns(false);
		this.mock(_Helper).expects("checkGroupId").withExactArgs("myGroup", false, true);
		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject("~oError~"));
		this.mock(oBinding).expects("lockGroup").withExactArgs("myGroup", true, true)
			.returns(oGroupLock);
		this.mock(oBinding).expects("delete").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		return oContext.delete("myGroup", "~bDoNotRequestCount~").then(function () {
			assert.notOk(true);
		}, function (oError) {
			assert.strictEqual(oError, "~oError~");
		});
	});

	//*********************************************************************************************
	QUnit.test("delete: data aggregation", function (assert) {
		var oBinding = {
				mParameters : "~mParameters~"
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(true);

		assert.throws(function () {
			// code under test
			oContext.delete();
		}, new Error("Cannot delete " + oContext + " when using data aggregation"));
	});

	//*********************************************************************************************
	QUnit.test("delete: recursive hierarchy, restrictions not met", function (assert) {
		const oBinding = {
			checkSuspended : function () {},
			getUpdateGroupId : mustBeMocked,
			mParameters : {$$aggregation : {hierarchyQualifier : "X"}}
		};
		const oModel = {
			isApiGroup : mustBeMocked
		};

		const oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42");
		assert.throws(function () {
			// code under test
			oContext.delete();
		}, new Error("Unsupported kept-alive context: " + oContext));

		oContext.iIndex = 42;
		this.mock(oBinding).expects("getUpdateGroupId").withExactArgs().returns("~groupId~");
		this.mock(oModel).expects("isApiGroup").twice().withExactArgs("~groupId~").returns(true);

		assert.throws(function () {
			// code under test
			oContext.delete();
		}, new Error("Unsupported group ID: ~groupId~"));

		oContext.iIndex = 0;

		assert.throws(function () {
			// code under test
			oContext.delete("~groupId~");
		}, new Error("Unsupported group ID: ~groupId~"));
	});

	//*********************************************************************************************
	QUnit.test("delete: no lock, but not a kept-alive context", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				mParameters : "~mParameters~"
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42);

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();

		// code under test
		assert.throws(function () {
			oContext.delete(null);
		}, new Error("Cannot delete " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("delete: no lock, but kept-alive context in the collection", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				mParameters : "~mParameters~"
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/0", 0);

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isKeepAlive").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			oContext.delete(null);
		}, new Error("Cannot delete " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("delete: error in checkSuspended", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				mParameters : "~mParameters~"
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42),
			oError = new Error("suspended");

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs().throws(oError);

		assert.throws(function () {
			oContext.delete("$auto");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("delete: error in checkGroupId", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				mParameters : "~mParameters~"
			},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oError = new Error("invalid group");

		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs("~mParameters~").returns(false);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId")
			.withExactArgs("$invalid", false, true).throws(oError);

		assert.throws(function () {
			oContext.delete("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("delete: already deleted", function (assert) {
		var oContext = Context.create("~oModel~", "~oBinding~", "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("isDeleted").withExactArgs().thrice().returns(true);

		assert.throws(function () {
			oContext.delete("myGroup");
		}, new Error("Must not delete twice: " + oContext));
	});

	//*********************************************************************************************
[false, true].forEach(function (bFailure) {
	QUnit.test("doDelete: " + (bFailure ? "failure" : "success"), function (assert) {
		var aAllBindings = [
				{removeCachesAndMessages : function () {}},
				{removeCachesAndMessages : function () {}}
			],
			oBinding = {
				deleteFromCache : function () {}
			},
			aDependentBindings = [
				{setContext : function () {}},
				{setContext : function () {}}
			],
			oModel = {
				getAllBindings : function () {},
				getDependentBindings : function () {},
				isApiGroup : function () {},
				reportError : function () {}
			},
			oContext = Context.create(oModel, "~oBinding~", "/Foo/Bar('42')", 42),
			oExpectation0,
			oExpectation1,
			oGroupLock = {
				getGroupId : function () {}
			},
			oPromise,
			that = this;

		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("~groupID~");
		this.mock(oModel).expects("isApiGroup").withExactArgs("~groupID~").returns(true);
		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext)).returns(aDependentBindings);
		oExpectation0 = this.mock(aDependentBindings[0]).expects("setContext")
			.withExactArgs(undefined);
		oExpectation1 = this.mock(aDependentBindings[1]).expects("setContext")
			.withExactArgs(undefined);

		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs(sinon.match.same(oGroupLock), "~sEditUrl~", "~sPath~", "~oETagEntity~",
				"~fnCallback~")
			.returns(SyncPromise.resolve(Promise.resolve()).then(function () {
				that.mock(oModel).expects("getAllBindings").exactly(bFailure ? 0 : 1)
					.withExactArgs().returns(aAllBindings);
				that.mock(aAllBindings[0]).expects("removeCachesAndMessages")
					.exactly(bFailure ? 0 : 1)
					.withExactArgs("Foo/Bar('42')", true);
				that.mock(aAllBindings[1]).expects("removeCachesAndMessages")
					.exactly(bFailure ? 0 : 1)
					.withExactArgs("Foo/Bar('42')", true);
				that.mock(oModel).expects("reportError").exactly(bFailure ? 1 : 0)
					.withExactArgs("Failed to delete /Foo/Bar('42')", sClassName, "~oError~");
				that.mock(oContext).expects("checkUpdate").exactly(bFailure ? 1 : 0)
					.withExactArgs();
				if (bFailure) {
					oContext.oModel = undefined; // simulate destruction
					throw "~oError~";
				}
			}));

		// code under test
		oPromise = oContext.doDelete(oGroupLock, "~sEditUrl~", "~sPath~", "~oETagEntity~",
			oBinding, "~fnCallback~");

		assert.ok(oContext.oDeletePromise.isPending());
		assert.ok(oExpectation0.called);
		assert.ok(oExpectation1.called);

		return oPromise.then(function () {
			assert.notOk(bFailure);
			assert.ok(oContext.oDeletePromise.isFulfilled());
		}, function (oError) {
			assert.ok(bFailure);
			assert.strictEqual(oError, "~oError~");
		});
	});
});

	//*********************************************************************************************
[null, {getGroupId : function () {}}].forEach(function (oGroupLock) {
	QUnit.test("doDelete: no groupLock, no API group", function () {
		var oBinding = {
				deleteFromCache : function () {}
			},
			oModel = {
				getAllBindings : function () {},
				isApiGroup : function () {}
			},
			oContext = Context.create(oModel, "~oBinding~", "/Foo/Bar('42')", 42);

		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs(sinon.match.same(oGroupLock), "~sEditUrl~", "~sPath~", "~oETagEntity~",
				"~fnCallback~")
			.returns(SyncPromise.resolve());
		if (oGroupLock) {
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("~groupID~");
			this.mock(oModel).expects("isApiGroup").withExactArgs("~groupID~").returns(false);
		}
		this.mock(oModel).expects("getAllBindings").withExactArgs().returns([]);

		// code under test
		return oContext.doDelete(oGroupLock, "~sEditUrl~", "~sPath~", "~oETagEntity~",
			oBinding, "~fnCallback~");
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
		oContext.oDeletePromise = "~oDeletePromise~";
		oContext.mChangeListeners = "~mChangeListeners~";
		oContext.setNewGeneration();
		iGeneration = oContext.getGeneration(true);

		oGetDependentBindingsCall = this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("setContext").withExactArgs(undefined);
		this.mock(oBinding2).expects("setContext").withExactArgs(undefined);
		this.mock(BaseContext.prototype).expects("destroy").on(oContext).twice().withExactArgs();

		// code under test
		oContext.destroy();

		assert.strictEqual(oContext.oBinding, undefined);
		assert.strictEqual(oContext.oModel, undefined);
		assert.strictEqual(oContext.sPath, "/EMPLOYEES/42");
		assert.strictEqual(oContext.iIndex, 42); // Note: sPath and iIndex mainly define #toString
		assert.strictEqual(oContext.bKeepAlive, undefined);
		assert.strictEqual(oContext.oDeletePromise, "~oDeletePromise~");
		assert.strictEqual(oContext.created(), undefined);
		assert.strictEqual(oContext.getGeneration(true), iGeneration, "generation is kept");
		assert.strictEqual(oContext.isInactive(), undefined);
		assert.strictEqual(oContext.isTransient(), undefined);
		assert.strictEqual(oContext.toString(), "/EMPLOYEES/42[42;destroyed]");
		assert.notOk("mChangeListeners" in oContext);

		if (bfnOnBeforeDestroy) {
			assert.ok(bCallbackCalled);
		}

		// code under test
		oContext.destroy();
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

		oContext.oModel = undefined;

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
			sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
			sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
				getValue : function () {},
				isDeleted : function () {},
				isKeepAlive : function () {}
			};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oOtherContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oOtherContext).expects("isKeepAlive").withExactArgs().returns(true);
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
	QUnit.test("replaceWith: deleted context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('1')");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isDeleted").withExactArgs().thrice().returns(true);

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
[
	{bDeleted : false, bKeepAlive : false},
	{bDeleted : true, bKeepAlive : true}
].forEach(function (oFixture) {
	QUnit.test("replaceWith: other context = " + JSON.stringify(oFixture), function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES($uid=1)", 0,
					SyncPromise.resolve(Promise.resolve())),
			oOtherContext = {
				isDeleted : function () {},
				isKeepAlive : function () {}
			};

		oOtherContext.oBinding = oBinding;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oOtherContext).expects("isDeleted").withExactArgs().returns(oFixture.bDeleted);
		this.mock(oOtherContext).expects("isKeepAlive").exactly(oFixture.bDeleted ? 0 : 1)
			.withExactArgs().returns(oFixture.bKeepAlive);

		assert.throws(function () {
			// code under test
			oContext.replaceWith(oOtherContext);
		}, new Error("Cannot replace with " + oOtherContext));
	});
});

	//*********************************************************************************************
	QUnit.test("requestRefresh, list binding", function (assert) {
		var bAllowRemoval = {/*false, true, undefined*/},
			oBinding = {
				checkSuspended : function () {},
				getContext : function () { return null; },
				isRelative : function () { return false; },
				lockGroup : function () {},
				refreshSingle : function () {},
				mParameters : {}
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
					requestRefresh : function () {},
					mParameters : {}
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
				checkSuspended : function () {},
				mParameters : {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')");

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
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES", 42),
			oError = new Error(),
			sGroupId = "$foo";

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId).throws(oError);

		assert.throws(function () {
			// code under test
			oContext.requestRefresh(sGroupId);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: has pending changes", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				mParameters : {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')"),
			sGroupId = "myGroup";

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("hasPendingChanges").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oContext.requestRefresh(sGroupId);
		}, new Error("Cannot refresh entity due to pending changes: /EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("requestRefresh: $$aggregation", function (assert) {
		var oBinding = {
				mParameters : {
					$$aggregation : {}
				}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/42", 42),
			sGroupId = "myGroup";

		this.mock(_Helper).expects("checkGroupId").withExactArgs(sGroupId);

		assert.throws(function () {
			// code under test
			oContext.requestRefresh(sGroupId);
		}, new Error("Cannot refresh " + oContext + " when using data aggregation"));
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
	QUnit.test("isAncestorOf", function (assert) {
		const oBinding = {
			isAncestorOf : mustBeMocked
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')");
		this.mock(oBinding).expects("isAncestorOf")
			.withExactArgs(sinon.match.same(oContext), "~oNode~").returns("~result~");

		// code under test
		assert.strictEqual(oContext.isAncestorOf("~oNode~"), "~result~");
	});

	//*********************************************************************************************
	QUnit.test("isAncestorOf: wrong binding", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')");

		assert.throws(function () {
			// code under test
			oContext.isAncestorOf();
		}, new Error("Missing recursive hierarchy"));
	});

	//*********************************************************************************************
[undefined, {}, {parent : undefined}, {nextSibling : undefined},
	{nextSibling : undefined, parent : undefined}].forEach(function (mParameters, i) {
	QUnit.test("move: no move happens, " + i, async function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);

		// code under test
		const oPromise = oContext.move(mParameters);

		assert.ok(oPromise instanceof Promise);
		assert.strictEqual(await oPromise, undefined);
	});
});

	//*********************************************************************************************
[null, Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')", 23)].forEach((oParent) => {
	[undefined, null, Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('24')", 24)]
		.forEach((oSibling) => {
	QUnit.test(`move: parent=${oParent}, nextSibling=${oSibling}`, function (assert) {
		const oBinding = {
			move : mustBeMocked
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42);
		this.mock(oContext).expects("isAncestorOf")
			.withExactArgs(sinon.match.same(oParent)).returns(false);
		let bResolved = false;
		this.mock(oBinding).expects("move")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oParent),
				sinon.match.same(oSibling))
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bResolved = true;
					resolve(); // Note: without a defined result
				}, 0);
			}));

		// code under test
		const oPromise = oContext.move({nextSibling : oSibling, parent : oParent});

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function () {
			assert.ok(bResolved, "not too soon");
		});
	});
	});
});

	//*********************************************************************************************
	QUnit.test("move: Unsupported parent context", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		const oParent = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')", 23);
		this.mock(oContext).expects("isAncestorOf").withExactArgs(sinon.match.same(oParent))
			.returns(true);

		assert.throws(function () {
			// code under test
			oContext.move({parent : oParent});
		}, new Error("Unsupported parent context: " + oParent));
	});

	//*********************************************************************************************
	QUnit.test("move: fails", function (assert) {
		const oBinding = {
			move : mustBeMocked
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42);
		const oParent = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')", 23);
		this.mock(oContext).expects("isAncestorOf").withExactArgs(sinon.match.same(oParent))
			.returns(false);
		this.mock(oBinding).expects("move")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oParent), undefined)
			.returns(SyncPromise.reject("~error~"));

		// code under test
		const oPromise = oContext.move({parent : oParent});

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function () {
			assert.ok(false, "unexpected success");
		}, function (vError) {
			assert.strictEqual(vError, "~error~");
		});
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; deleted", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oContext).expects("isDeleted").withExactArgs().atLeast(1).returns(true);

		assert.throws(function () {
			// code under test
			oContext.move({parent : null});
		}, new Error("Cannot move " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; transient", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oContext).expects("isDeleted").withExactArgs().atLeast(1).returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().atLeast(1).returns(true);

		assert.throws(function () {
			// code under test
			oContext.move({parent : null});
		}, new Error("Cannot move " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; outside collection", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')");
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oContext).expects("isDeleted").withExactArgs().atLeast(1).returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().atLeast(1).returns(false);

		assert.throws(function () {
			// code under test
			oContext.move({parent : null});
		}, new Error("Cannot move " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; parent deleted", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		const oParent = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')", 23);
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oParent).expects("isDeleted").withExactArgs().atLeast(1).returns(true);

		assert.throws(function () {
			// code under test
			oContext.move({parent : oParent});
		}, new Error("Cannot move to " + oParent));
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; parent transient", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		const oParent = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')", 23);
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oParent).expects("isDeleted").withExactArgs().atLeast(1).returns(false);
		this.mock(oParent).expects("isTransient").withExactArgs().atLeast(1).returns(true);

		assert.throws(function () {
			// code under test
			oContext.move({parent : oParent});
		}, new Error("Cannot move to " + oParent));
	});

	//*********************************************************************************************
	QUnit.test("move: Cannot move; parent outside collection", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);
		const oParent = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('23')");
		// Note: cannot easily mock #toString which calls #isDeleted etc.
		this.mock(oParent).expects("isDeleted").withExactArgs().atLeast(1).returns(false);
		this.mock(oParent).expects("isTransient").withExactArgs().atLeast(1).returns(false);

		assert.throws(function () {
			// code under test
			oContext.move({parent : oParent});
		}, new Error("Cannot move to " + oParent));
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
			.returns("~result~");
		this.mock(oCache).expects("patch").withExactArgs(sPath, sinon.match.same(oData));

		// code under test
		assert.strictEqual(oContext.patch(oData), "~result~");
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: error cases 1/2", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				isResolved : function () { return true; }
			},
			oMetaModel = {
				getObject : mustBeMocked
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
	QUnit.test("requestSideEffectsInternal without own cache: list binding refresh in progress",
			function (assert) {
		var oListBinding = {
				oCache : undefined, // looks like a refresh in progress
				// getBoundContext : function () {},
				getContext : function () { return {}; },
				getPath : function () { return "TEAM_2_EMPLOYEES"; },
				toString : mustBeMocked
			},
			oMetaModel = {},
			oModel = {
				getMetaModel : function () { return oMetaModel; }
			},
			oContext = Context.create(oModel, oListBinding, "/TEAMS('1')/TEAM_2_EMPLOYEES('2')");

		// code under test
		assert.strictEqual(oContext.requestSideEffectsInternal(["ID"], "groupId"), undefined);
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
	QUnit.test("requestSideEffects: error on deleted context", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {
				getMetaModel : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES('42')");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("isDeleted").withExactArgs().thrice().returns(true);
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

		this.mock(oContext).expects("isDeleted").withExactArgs().twice().returns(false);
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

		this.mock(oContext).expects("isDeleted").exactly(6).withExactArgs().returns(true);
		this.mock(oContext).expects("getValue").never();
		this.mock(oContext).expects("withCache").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs();

		assert.throws(function () {
			oContext.doSetProperty("~sPath~", "~sValue~", oGroupLock);
		}, new Error("Must not modify a deleted entity: " + oContext));

		assert.throws(function () {
			oContext.doSetProperty("~sPath~", "~sValue~", null);
		}, new Error("Must not modify a deleted entity: " + oContext));
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

	//********************************************************************************************
[false, true].forEach((bGroupLock) => {
	QUnit.test("doSetProperty: @$ui5.context.isSelected, group lock=" + bGroupLock, function () {
		const oBinding = {doSetProperty : mustBeMocked, getResolvedPath : mustBeMocked};
		const oMetaModel = {fetchUpdateData : mustBeMocked};
		const oModel = {getMetaModel : mustBeMocked};
		const oContext = Context.create(oModel, oBinding, "/ProductList('HT-1000')");

		this.mock(oModel).expects("getMetaModel").returns(oMetaModel);
		this.mock(oContext).expects("isDeleted").twice().withExactArgs().returns(false);
		this.mock(oContext).expects("setSelected").withExactArgs("~bSelected~");
		this.mock(oContext).expects("isTransient").never();
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "@$ui5.context.isSelected", false, true)
			.callsFake((fnProcessor) => {
				const oCache = {setProperty : mustBeMocked, update : mustBeMocked};
				this.mock(oBinding).expects("doSetProperty")
					.withExactArgs("/cache/path", "~bSelected~", /*oGroupLock*/null);
				this.mock(oMetaModel).expects("fetchUpdateData")
					.withExactArgs("@$ui5.context.isSelected", sinon.match.same(oContext), true)
					.returns(SyncPromise.resolve({
						entityPath : "/entity/path",
						propertyPath : "@$ui5.context.isSelected"
					}));
				this.mock(oBinding).expects("getResolvedPath").withExactArgs()
					.returns("/resolved/binding/path");
				this.mock(_Helper).expects("getRelativePath")
					.withExactArgs("/entity/path", "/resolved/binding/path")
					.returns("helper/path");
				this.mock(oCache).expects("setProperty")
					.withExactArgs("@$ui5.context.isSelected", "~bSelected~", "helper/path",
						undefined)
					.resolves();
				this.mock(oCache).expects("update").never();

				return fnProcessor(oCache, "/cache/path", oBinding);
			});

		let oGroupLock = null;
		if (bGroupLock) {
			oGroupLock = {unlock : mustBeMocked};
			this.mock(oGroupLock).expects("unlock").withExactArgs();
		}

		// code under test
		oContext.doSetProperty("@$ui5.context.isSelected", "~bSelected~", oGroupLock);
	});
});

	//*********************************************************************************************
	QUnit.test("doSetProperty: header context and @$ui5.context.isSelected", function (assert) {
		const oBinding = {getHeaderContext : mustBeMocked};
		const oModel = {
			getMetaModel : function () {}
		};
		const oHeaderContext = Context.create(oModel, oBinding, "/ProductList");

		this.mock(oHeaderContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oHeaderContext).expects("setSelected").withExactArgs("~bSelected~");
		this.mock(oBinding).expects("getHeaderContext").returns(oHeaderContext);

		assert.strictEqual(
			// code under test
			oHeaderContext.doSetProperty("@$ui5.context.isSelected", "~bSelected~", null),
			SyncPromise.resolve());
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
		.withExactArgs("Failed to update path /resolved/data/path", sClassName,
			sinon.match.same(oError));
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
	[undefined, {}, {activate : true}, {activate : false}].forEach(function (oInactive, j) {
		var sTitle = "doSetProperty: scenario: " + i + ", " + j;

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
			oError = new Error("This call intentionally failed"),
			bFireCreateActivate = oInactive && "activate" in oInactive,
			oFireCreateActivateExpectation,
			bFiringCreateActivate = !(oInactive === undefined || "activate" in oInactive),
			oGroupLock = {},
			bInactive,
			oMetaModel = {
				fetchUpdateData : function () {},
				getUnitOrCurrencyPath : function () {}
			},
			oModel = {
				getMetaModel : function () {
					return oMetaModel;
				},
				getReporter : function () {},
				reportError : function () {},
				resolve : function () {}
			},
			oModelMock = this.mock(oModel),
			oContext = Context.create(oModel, oBinding, "/BusinessPartnerList('0100000000')", 42,
				oInactive ? new SyncPromise(function () {}) : /*oCreatePromise*/undefined,
				!!oInactive),
			fnReporter = sinon.spy(),
			oSetPropertyExpectation,
			bSkipRetry = i === 1,
			vWithCacheResult = {},
			that = this;

		if (oInactive) {
			bInactive = oInactive.activate ? false : 1;
			assert.strictEqual(
				// code under test
				oContext.toString(),
				"/BusinessPartnerList('0100000000')[42;inactive]");
		}
		oContext.bFiringCreateActivate = bFiringCreateActivate;
		this.mock(oContext).expects("isDeleted").exactly(bFireCreateActivate ? 4 : 3)
			.withExactArgs().returns(false);
		this.mock(oContext).expects("getValue").never();
		this.mock(oContext).expects("isEffectivelyKeptAlive").withExactArgs().on(oContext)
			.exactly(i === 1 ? 1 : 0).returns("~bKeepAlive~");
		this.mock(oContext).expects("withCache").withExactArgs(sinon.match.func,
			"some/relative/path", /*bSync*/false, /*bWithOrWithoutCache*/true)
			.callsFake(function (fnProcessor) {
				var oCache = {
						setInactive : mustBeMocked,
						setProperty : mustBeMocked,
						update : mustBeMocked
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
				if (bFireCreateActivate) {
					oSetPropertyExpectation = that.mock(oCache).expects("setProperty")
						.withExactArgs("property/path", "new value", "helper/path", undefined)
						.returns(SyncPromise.reject("~error~"));
					oModelMock.expects("getReporter").withExactArgs()
						.returns(fnReporter);
					oFireCreateActivateExpectation = oBindingMock.expects("fireCreateActivate")
						.withExactArgs(sinon.match.same(oContext))
						.callsFake(function () {
							assert.strictEqual(oContext.bFiringCreateActivate, true);
						})
						.returns(oInactive.activate);
					that.mock(oCache).expects("setInactive")
						.withExactArgs("helper/path", bInactive);
				}
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
						assert.strictEqual(oContext.bFiringCreateActivate, bFiringCreateActivate);
						assert.strictEqual(oContext.isInactive(),
							bFiringCreateActivate || bInactive);
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
				if (bFireCreateActivate) {
					assert.ok(oSetPropertyExpectation.calledBefore(oFireCreateActivateExpectation));
					sinon.assert.calledOnceWithExactly(fnReporter, "~error~");
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
			fnReporter = sinon.spy(),
			oResult;

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
		oResult = oContext.doSetProperty("~sPath~", "~vValue~", oGroupLock, "~bSkipRetry~");

		assert.ok(oResult instanceof SyncPromise, "@returns {sap.ui.base.SyncPromise}");

		return oResult.then(function (vResult) {
				assert.strictEqual(vResult, "~result~");
				sinon.assert.calledOnceWithExactly(fnReporter, oError);
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
			.withExactArgs("Failed to update path /resolved/path", sClassName,
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
			.withExactArgs("Failed to update path /resolved/path", sClassName,
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
	QUnit.test("adjustPredicate: callback=" + bCallback, function (assert) {
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
			sinon.assert.calledOnceWithExactly(fnPathChanged, "/SalesOrderList($uid=1)/SO_2_BP",
				"/SalesOrderList('42')/SO_2_BP");
		}
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	QUnit.test("expand: success=" + bSuccess, function (assert) {
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
			assert.notOk(fnReporter.called);
		}, function () {
			sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
[true, 1, false, undefined].forEach(function (bInactive) {
	QUnit.test("resetChanges, w/o oDeletePromise, bInactive=" + bInactive, function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				getParameterContext : "must not be called",
				resetChangesForPath : function () {}
			},
			oModel = {
				getDependentBindings : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/path"),
			oResetChangesPromise;

		oContext.bInactive = bInactive;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("resetChangesForPath")
			.withExactArgs("/path", sinon.match.array);
		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext)).returns([]);

		// code under test
		oResetChangesPromise = oContext.resetChanges();

		assert.strictEqual(oContext.bInactive, bInactive ? true : bInactive);

		return oResetChangesPromise;
	});
});

	//*********************************************************************************************
	QUnit.test("resetChanges, promise enrichment", function (assert) {
		var oBinding = {
				checkSuspended : function () {},
				resetChangesForPath : function () {}
			},
			oModel = {
				getDependentBindings : function () {}
			},
			oDependentWithCache = {
				oCache : {},
				_resetChanges : function () {}
			},
			oDependentWithOutCache = {
				resetChangesInDependents : function () {},
				resetInvalidDataState : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/path"),
			oError = new Error("deletion cancelled"),
			oDeletePromise = Promise.reject(oError),
			oResetChangesPromise,
			oResetChangesForPathPromise = SyncPromise.resolve(new Promise(function (resolve) {
				setTimeout(resolve.bind(null, "foo"));
			})),
			oPrivateResetChangesPromise = SyncPromise.resolve(new Promise(function (resolve) {
				setTimeout(resolve.bind(null, "bar"));
			})),
			oResetChangesInDependentPromise = SyncPromise.resolve(new Promise(function (resolve) {
				setTimeout(resolve.bind(null, "baz"));
			}));

		oContext.oDeletePromise = oDeletePromise;
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oBinding).expects("resetChangesForPath")
			.withExactArgs("/path", sinon.match.array)
			.callsFake(function (_sPath, aPromises) {
				assert.strictEqual(aPromises.length, 1);
				aPromises[0].catch(function (oError0) {
					assert.strictEqual(oError0, oError);
				});
				aPromises.push(oResetChangesForPathPromise);
			});
		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oDependentWithCache, oDependentWithOutCache]);
		this.mock(oDependentWithCache).expects("_resetChanges")
			.withExactArgs("/path").returns(oPrivateResetChangesPromise);
		this.mock(oDependentWithOutCache).expects("resetInvalidDataState")
			.withExactArgs();
		this.mock(oDependentWithOutCache).expects("resetChangesInDependents")
			.withExactArgs(sinon.match.array, "/path")
			.callsFake(function (aPromises, _sPathPrefix) {
				assert.strictEqual(aPromises.length, 3);
				aPromises[0].catch(function (oError0) {
					assert.strictEqual(oError0, oError);
				});
				assert.strictEqual(aPromises[1], oResetChangesForPathPromise);
				assert.strictEqual(aPromises[2], oPrivateResetChangesPromise);
				aPromises.push(oResetChangesInDependentPromise);
			});

		// code under test
		oResetChangesPromise = oContext.resetChanges();

		assert.ok(oResetChangesPromise instanceof Promise);

		return oResetChangesPromise.then(function (oResult) {
			assert.ok(oResetChangesForPathPromise.isFulfilled());
			assert.ok(oPrivateResetChangesPromise.isFulfilled());
			assert.ok(oResetChangesInDependentPromise.isFulfilled());
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
[undefined, false].forEach(function (bInactive) {
	var sTitle = "resetChanges: throws error on transient but not inactive context, bInactive="
		+ bInactive;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path", -1,
				new SyncPromise(function () {}), bInactive);

		this.mock(oContext).expects("isTransient").withExactArgs().twice().returns(true);
		this.mock(oContext).expects("isInactive").withExactArgs().twice().returns(bInactive);

		assert.throws(function () {
			// code under test
			oContext.resetChanges();
		}, new Error("Cannot reset: /path[-1;transient]"));
	});
});

	//*********************************************************************************************
	QUnit.test("resetChanges: throws error on header context", function (assert) {
		var oBinding = {getHeaderContext : function () {}},
			oContext = Context.create({/*oModel*/}, oBinding, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("getHeaderContext").withExactArgs().returns(oContext);

		assert.throws(function () {
			// code under test
			oContext.resetChanges();
		}, new Error("Cannot reset: /path"));
	});

	//*********************************************************************************************
	QUnit.test("resetChanges: throws error on parameter context", function (assert) {
		var oBinding = {oOperation : {}, getParameterContext : function () {}},
			oContext = Context.create({/*oModel*/}, oBinding, "/Operation(...)/$Parameter");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oBinding).expects("getParameterContext").withExactArgs().returns(oContext);

		assert.throws(function () {
			// code under test
			oContext.resetChanges();
		}, new Error("Cannot reset: /Operation(...)/$Parameter"));
	});

	//*********************************************************************************************
	QUnit.test("resetChanges: throws error for a virtual context", function (assert) {
		var oContext = Context.create({/*oModel*/}, {}, "/foo/" + Context.VIRTUAL, Context.VIRTUAL);

		assert.throws(function () {
			// code under test
			oContext.resetChanges();
		}, new Error("Cannot reset: /foo/-9007199254740991[-9007199254740991]"));
	});

	//*********************************************************************************************
	QUnit.test("resetKeepAlive", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		oContext.bKeepAlive = "bTrueOrFalse";
		oContext.bSelected = "~bSelected~";
		oContext.fnOnBeforeDestroy = "fnOnBeforeDestroy";

		// code under test
		oContext.resetKeepAlive();

		assert.strictEqual(oContext.bKeepAlive, false);
		assert.strictEqual(oContext.bSelected, false);
		assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive", function (assert) {
		var done = assert.async(),
			oBinding = {
				checkKeepAlive : function () {},
				fetchIfChildCanUseCache : function () {},
				onKeepAliveChanged : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			oMetaModel = {
				fetchObject : mustBeMocked
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

		this.mock(oContext).expects("isTransient").exactly(4).withExactArgs().returns(false);
		this.mock(_Helper).expects("getPredicateIndex").exactly(4).withExactArgs("/path");
		oBindingMock.expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext), "bTrueOrFalse");
		oBindingMock.expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				assert.strictEqual(oContext.bKeepAlive, "bTrueOrFalse");
			});

		// code under test
		oContext.setKeepAlive("bTrueOrFalse");
		assert.strictEqual(oContext.isKeepAlive(), "bTrueOrFalse");
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);

		oContext.fnOnBeforeDestroy = "foo";
		oBindingMock.expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext), false);
		oBindingMock.expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive(false, "fnOnBeforeDestroy", true);
		assert.strictEqual(oContext.isKeepAlive(), false);
		assert.strictEqual(oContext.fnOnBeforeDestroy, undefined);

		oBindingMock.expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext), true);
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves("path/to/messages");
		oBindingMock.expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oContext), "path/to/messages", undefined, true)
			.resolves("/reduced/path");
		this.mock(oContext).expects("fetchValue").withExactArgs("/reduced/path")
			.rejects(oError);
		oBindingMock.expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
		assert.strictEqual(oContext.isKeepAlive(), true);
		assert.strictEqual(oContext.fnOnBeforeDestroy, "fnOnBeforeDestroy");
		oBindingMock.expects("checkKeepAlive").withExactArgs(sinon.match.same(oContext), false);
		oBindingMock.expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext));

		oContext.oDeletePromise = "~deletePromise~";

		// code under test - reset kept-alive on a deleted context
		oContext.setKeepAlive(false);

		assert.strictEqual(oContext.isKeepAlive(), false);
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
			.withExactArgs(sinon.match.same(oContext), true).throws(oError);

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
		}, new Error("Unsupported context: " + oContext));

		assert.strictEqual(oContext.isKeepAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: deleted", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("isDeleted").withExactArgs().thrice().returns(true);

		assert.throws(function () {
			// code under test
			oContext.setKeepAlive(true);
		}, new Error("Unsupported context: " + oContext));

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
		this.mock(oBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext), true);
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
				checkKeepAlive : function () {},
				onKeepAliveChanged : function () {}
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
		this.mock(oBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext), true);
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves(undefined);
		this.mock(oBinding).expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
	});

	//*********************************************************************************************
	QUnit.test("setKeepAlive: fetchIfChildCanUse fails", function (assert) {
		var done = assert.async(),
			oBinding = {
				checkKeepAlive : function () {},
				fetchIfChildCanUseCache : function () {},
				onKeepAliveChanged : function () {}
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
		this.mock(oBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext), true);
		this.mock(_Helper).expects("getMetaPath").withExactArgs("/path").returns("/meta/path");
		this.mock(oMetaModel).expects("fetchObject")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Common.v1.Messages/$Path")
			.resolves("path/to/messages");
		this.mock(oBinding).expects("fetchIfChildCanUseCache")
			.withExactArgs(sinon.match.same(oContext), "path/to/messages", undefined, true)
			.rejects(oError);
		this.mock(oBinding).expects("onKeepAliveChanged").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.setKeepAlive(true, "fnOnBeforeDestroy", true);
	});

	//*********************************************************************************************
	QUnit.test("setInactive", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {}
			},
			oModel = {
				bAutoExpandSelect : false
			},
			oContext = Context.create(oModel, oBinding, "/path");

		assert.strictEqual(oContext.bInactive, undefined);

		// code under test
		assert.throws(function () {
			oContext.setInactive();
		}, new Error("Not inactive: undefined"));

		oContext.bInactive = false;

		// code under test
		assert.throws(function () {
			oContext.setInactive();
		}, new Error("Not inactive: false"));

		oContext.bInactive = true;

		// code under test
		oContext.setInactive();

		assert.strictEqual(oContext.bInactive, true);

		oContext.bInactive = 1;

		// code under test
		oContext.setInactive();

		assert.strictEqual(oContext.bInactive, true);
	});

	//*********************************************************************************************
[false, true].forEach(function (bIsHeaderContext) {
	[false, true].forEach(function (bHasChangeListeners) {
		if (!bIsHeaderContext && bHasChangeListeners) {
			return; // unrealistic
		}
		const sTitle = `setSelected: is header context=${bIsHeaderContext},
			with change listeners=${bHasChangeListeners}`;

	QUnit.test(sTitle, function () {
		const oBinding = {getHeaderContext : mustBeMocked, _getAllExistingContexts : mustBeMocked};
		// Note: oBinding is optional, it might already be missing in certain cases!
		const oContext = Context.create({/*oModel*/}, oBinding, "/some/path", 42);

		if (bHasChangeListeners) {
			oContext.mChangeListeners = "~mChangeListeners~";
		}
		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oBinding).expects("getHeaderContext").returns(bIsHeaderContext ? oContext : null);
		if (bIsHeaderContext) {
			const aRowContexts = [
				{setSelected : mustBeMocked},
				{setSelected : mustBeMocked}
			];
			this.mock(oBinding).expects("_getAllExistingContexts").withExactArgs()
				.returns(aRowContexts);
			aRowContexts.forEach((oRowContext) => {
				this.mock(oRowContext).expects("setSelected").withExactArgs("~selected~");
			});
		}
		this.mock(_Helper).expects("fireChange").exactly(bHasChangeListeners ? 1 : 0)
			.withExactArgs("~mChangeListeners~", "", "~selected~");
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "")
			.callsFake((fnProcessor) => {
				const oCache = {setProperty : mustBeMocked};
				this.mock(oCache).expects("setProperty")
					.withExactArgs("@$ui5.context.isSelected", "~selected~", "~sPath~");

				return fnProcessor(oCache, "~sPath~");
			});
		this.mock(oContext).expects("doSetSelected").withExactArgs("~selected~");

		// code under test
		oContext.setSelected("~selected~");
	});
	});
});

	//*********************************************************************************************
	QUnit.test("setSelected: binding destroyed", function () {
		const oBinding = {
			getHeaderContext : mustBeMocked
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/some/path", 42);

		this.mock(oContext).expects("isDeleted").withExactArgs().returns(false);
		this.mock(oBinding).expects("getHeaderContext").returns(undefined);
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "")
			.callsFake((fnProcessor) => {
				oContext.oBinding = undefined;

				return fnProcessor({}, "~sPath~");
			});
		this.mock(oContext).expects("doSetSelected").withExactArgs(true);

		// code under test - binding destroyed
		oContext.setSelected(true);
	});

	//*********************************************************************************************
	QUnit.test("setSelected: flag already set", function () {
		const oBinding = {
			getHeaderContext : mustBeMocked,
			onKeepAliveChanged : mustBeMocked
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/some/path", 42);

		oContext.mChangeListeners = "~mChangeListeners~";
		this.mock(oContext).expects("isDeleted").twice().withExactArgs().returns(false);
		this.mock(oBinding).expects("getHeaderContext").twice().returns(undefined);
		this.mock(_Helper).expects("fireChange").withExactArgs("~mChangeListeners~", "", true);
		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "")
			.callsFake((fnProcessor) => {
				const oCache = {setProperty : mustBeMocked};
				this.mock(oCache).expects("setProperty")
					.withExactArgs("@$ui5.context.isSelected", true, "~sPath~");

				return fnProcessor(oCache, "~sPath~");
			});
		this.mock(oBinding).expects("onKeepAliveChanged").twice().withExactArgs(oContext);

		// code under test
		oContext.setSelected(true);

		// code under test
		oContext.setSelected(true);
	});

	//*********************************************************************************************
	QUnit.test("setSelected: error handling", function (assert) {
		const oBinding = {
			getHeaderContext : function () {}
		};
		let oContext = Context.create({/*oModel*/}, oBinding, "/some/path", 42);

		this.mock(oContext).expects("isDeleted").thrice().withExactArgs().returns(true); // toString

		assert.throws(function () {
			// code under test
			oContext.setSelected(true);
		}, new Error("Must not select a deleted entity: " + oContext));

		// Note: it's about the binding, not the index!
		oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/some/path", 42);

		assert.throws(function () {
			// code under test
			oContext.setSelected(false);
		}, new Error("Unsupported context: " + oContext));
	});

	//*********************************************************************************************
	QUnit.test("doSetSelected", function (assert) {
		// Note: oBinding is optional, it might already be missing in certain cases!
		let oContext = Context.create({/*oModel*/}, /*oBinding*/undefined, "/some/path", 42);

		// code under test
		assert.strictEqual(oContext.isSelected(), false);

		// code under test
		oContext.doSetSelected(true);

		assert.strictEqual(oContext.isSelected(), true);

		// code under test
		assert.strictEqual(oContext.toString(), "/some/path[42;selected]");

		// code under test
		oContext.doSetSelected(false);

		assert.strictEqual(oContext.isSelected(), false);

		// code under test
		assert.strictEqual(oContext.toString(), "/some/path[42]");

		oContext = Context.create({/*oModel*/}, {
			getHeaderContext : true,
			onKeepAliveChanged : function () {}
		}, "/some/path", 42);

		this.mock(oContext.oBinding).expects("onKeepAliveChanged")
			.withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				assert.strictEqual(oContext.bSelected, "~selected~");
			});

		// code under test
		oContext.doSetSelected("~selected~");
	});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: explicitly", function (assert) {
		var oBinding = {
				checkKeepAlive : function () {},
				onKeepAliveChanged : function () {},
				mParameters : {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/TEAMS('1')");

		oContext.setKeepAlive(true);
		this.mock(_Helper).expects("isDataAggregation").never();

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), true);
	});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: header context", function (assert) {
		var oBinding = {
				getHeaderContext : function () {
					return oHeaderContext; // eslint-disable-line no-use-before-define
				},
				onKeepAliveChanged : function () {},
				mParameters : {}
			},
			oHeaderContext = Context.create({/*oModel*/}, oBinding, "/TEAMS");

		oHeaderContext.bSelected = true;
		this.mock(_Helper).expects("isDataAggregation").never();

		// code under test
		assert.strictEqual(oHeaderContext.isEffectivelyKeptAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: implicitly", function (assert) {
		var oBinding = {
				getHeaderContext : function () {},
				isRelative : mustBeMocked,
				onKeepAliveChanged : function () {},
				mParameters : {}
			},
			oBindingMock = this.mock(oBinding),
			oContext = Context.create({/*oModel*/}, oBinding, "/TEAMS('1')");

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), false);

		oContext.bSelected = true;
		oBindingMock.expects("isRelative").withExactArgs().returns(false);
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), true);

		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		// Note: #isDataAggregation not invoked

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: $$sharedRequest", function (assert) {
		var oBinding = {
				mParameters : {$$sharedRequest : true}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/TEAMS('1')");

		this.mock(oContext).expects("isSelected").never();
		this.mock(_Helper).expects("isDataAggregation").never();

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), false);
	});

	//*********************************************************************************************
[
	"/TEAMS('1')/TEAM_2_EMPLOYEES('2')",
	"/TEAMS/0/TEAM_2_EMPLOYEES('2')"
].forEach(function (sContextPath) {
	const sTitle = "isEffectivelyKeptAlive: $$ownRequest, context path: " + sContextPath;
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				checkKeepAlive : function () {},
				getHeaderContext : function () {},
				onKeepAliveChanged : function () {},
				isRelative : function () { return true; },
				mParameters : {$$ownRequest : true}
			},
			oContext = Context.create({/*oModel*/}, oBinding, sContextPath);

		oContext.bSelected = true;
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), true);
	});
});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: data aggregation", function (assert) {
		var oBinding = {
				getHeaderContext : function () {},
				onKeepAliveChanged : function () {},
				isRelative : function () { return false; },
				mParameters : {}
			},
			oContext = Context.create({/*oModel*/}, oBinding, "/TEAMS('1')");

		oContext.bSelected = true;
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(true);

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), false);
	});

	//*********************************************************************************************
	QUnit.test("isEffectivelyKeptAlive: no key predicate", function (assert) {
		const oBinding = {
			getHeaderContext : function () {},
			onKeepAliveChanged : function () {},
			isRelative : function () { return false; },
			mParameters : {}
		};
		const oContext = Context.create({/*oModel*/}, oBinding, "/SalesOrderList('0')/Messages/0");

		oContext.bSelected = true;
		this.mock(_Helper).expects("isDataAggregation")
			.withExactArgs(sinon.match.same(oBinding.mParameters)).returns(false);

		// code under test
		assert.strictEqual(oContext.isEffectivelyKeptAlive(), false);
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

	//*********************************************************************************************
	QUnit.test("getAndRemoveCollection", function (assert) {
		var oCache = {
				getAndRemoveCollection : function () {}
			},
			oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path"),
			oExpectation;

		oExpectation = this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "relative/path", true)
			.returns(SyncPromise.resolve("~valueFromWithCache~"));

		// code under test
		assert.strictEqual(oContext.getAndRemoveCollection("relative/path"),
			"~valueFromWithCache~");

		this.mock(oCache).expects("getAndRemoveCollection").withExactArgs("cache/path")
			.returns("~value~");

		// code under test
		assert.strictEqual(oExpectation.args[0][0](oCache, "cache/path"), "~value~");
	});

	//*********************************************************************************************
	QUnit.test("getAndRemoveCollection: withCache fails", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");

		this.mock(oContext).expects("withCache")
			.withExactArgs(sinon.match.func, "relative/path", true)
			.returns(SyncPromise.reject("~oError~"));

		// code under test
		assert.throws(function () {
			oContext.getAndRemoveCollection("relative/path");
		}, "~oError~");
	});

	//*********************************************************************************************
	QUnit.test("deregisterChangeListener", function (assert) {
		const oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/path");
		let oListener = {
			getPath : () => "foo"
		};

		// code under test
		assert.strictEqual(oContext.deregisterChangeListener(), false, "no mChangeListeners");

		oContext.mChangeListeners = {};

		// code under test
		assert.strictEqual(oContext.deregisterChangeListener(oListener), false, "wrong path");

		oListener = {
			getPath : () => "@$ui5.context.isSelected"
		};
		this.mock(_Helper).expects("removeByPath")
			.withExactArgs(sinon.match.same(oContext.mChangeListeners), "",
				sinon.match.same(oListener));

		// code under test
		assert.strictEqual(oContext.deregisterChangeListener(oListener), true);
	});

	//*********************************************************************************************
[0, 1].forEach(function (iFailureIndex) {
	QUnit.test("updateAfterCreate, fail=" + iFailureIndex, function () {
		var oModel = {
				getDependentBindings : function () {},
				getReporter : function () {}
			},
			oContext = Context.create(oModel, {/*oBinding*/}, "/path"),
			aDependents = [
				{updateAfterCreate : function () {}},
				{updateAfterCreate : function () {}}
			],
			fnReporter = sinon.spy(),
			that = this;

		this.mock(oModel).expects("getDependentBindings").withExactArgs(sinon.match.same(oContext))
			.returns(aDependents);
		this.mock(oModel).expects("getReporter").withExactArgs().returns(fnReporter);
		// each test lets another dependent's updateAfterCreate fail to see that it is reported
		aDependents.forEach(function (oDependent, i) {
			that.mock(oDependent).expects("updateAfterCreate")
				.withExactArgs("~bSkipRefresh~", "~group~")
				.returns(i === iFailureIndex
					? SyncPromise.reject("~oError~")
					: SyncPromise.resolve());
		});

		// code under test
		oContext.updateAfterCreate("~bSkipRefresh~", "~group~");

		sinon.assert.calledOnceWithExactly(fnReporter, "~oError~");
	});
});
});
