/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (jQuery, SyncPromise, BaseContext, Context, _GroupLock, _Helper) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.Context", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
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
		assert.strictEqual(oContext.getIndex(), 42);
		assert.strictEqual(oContext.created(), undefined);

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
	QUnit.test("getIndex() adds 1 when there is a created context", function (assert) {
		var oBinding = {},
			oContext;

		oContext = Context.create(null/*oModel*/, oBinding, "/foo", 42);

		assert.strictEqual(oContext.getIndex(), 42);

		// simulate ODataListBinding#create
		oBinding.aContexts = [];
		oBinding.aContexts[-1] = {};

		assert.strictEqual(oContext.getIndex(), 43);
	});

	//*********************************************************************************************
	QUnit.test("path must be absolute", function (assert) {
		assert.throws(function () {
			Context.create(null, null, "foo");
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
	[undefined, "bar"].forEach(function (sPath) {
		QUnit.test("fetchValue, relative", function (assert) {
			var bCached = {/*false,true*/},
				oBinding = {
					fetchValue : function () {}
				},
				oContext = Context.create(null, oBinding, "/foo", 42),
				oListener = {},
				oResult = {};

			this.mock(_Helper).expects("buildPath").withExactArgs("/foo", sPath).returns("/~");
			this.mock(oBinding).expects("fetchValue")
				.withExactArgs("/~", sinon.match.same(oListener), sinon.match.same(bCached))
				.returns(oResult);

			assert.strictEqual(oContext.fetchValue(sPath, oListener, bCached), oResult);
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
		var oContext = Context.create(null, {}, "/foo/-2", -2),
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
		{aBindingHasPendingChanges : [false, false], bResult : false}
	].forEach(function (oFixture, i) {
		QUnit.test("hasPendingChanges: " + i, function (assert) {
			var oModel = {
					getDependentBindings : function () {}
				},
				oBinding0 = {
					hasPendingChanges : function () {}
				},
				oBinding1 = {
					hasPendingChanges : function () {}
				},
				oParentBinding = {},
				oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES('42')", 13);

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

			// code under test
			assert.strictEqual(oContext.hasPendingChanges(), oFixture.bResult);
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
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			oClone = {},
			oData = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.resolve(oData));
		this.mock(_Helper).expects("publicClone").withExactArgs(sinon.match.same(oData))
			.returns(oClone);

		// code under test
		assert.strictEqual(oContext.getObject("bar"), oClone);
	});

	//*********************************************************************************************
	QUnit.test("getObject: unexpected error", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oModel = {
				reportError : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo"),
			oError = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.reject(oError));
		this.mock(oModel).expects("reportError").withExactArgs("Unexpected error",
			"sap.ui.model.odata.v4.Context", sinon.match.same(oError));

		// code under test
		assert.strictEqual(oContext.getObject("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getObject: not found in cache", function (assert) {
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
		assert.strictEqual(oContext.getObject("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getObject: unresolved", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, true)
			.returns(SyncPromise.resolve(Promise.resolve(42)));

		//code under test
		assert.strictEqual(oContext.getObject("bar"), undefined);
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
		this.mock(oContext).expects("getPath").withExactArgs("bar").returns("~");
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
			this.mock(oContext).expects("getPath").withExactArgs("bar").returns("~");
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
	[42, null].forEach(function (vResult) {
		QUnit.test("requestProperty: primitive result " + vResult, function (assert) {
			var oBinding = {
					checkSuspended : function () {}
				},
				oContext = Context.create(null, oBinding, "/foo"),
				oSyncPromise = SyncPromise.resolve(Promise.resolve(vResult));

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, undefined)
				.returns(oSyncPromise);

			//code under test
			return oContext.requestProperty("bar").then(function (vActual) {
				assert.strictEqual(vActual, vResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: structured result", function (assert) {
		var oBinding = {
				checkSuspended : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 1),
			oSyncPromise = SyncPromise.resolve(Promise.resolve({}));

		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, undefined)
			.returns(oSyncPromise);

		//code under test
		return oContext.requestProperty("bar").then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, "Accessed value is not primitive: /foo/bar");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: external", function (assert) {
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
			oType = {
				formatValue : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo", 42),
			oSyncPromiseType = SyncPromise.resolve(Promise.resolve(oType)),
			oSyncPromiseValue = SyncPromise.resolve(1234);

		this.mock(oContext).expects("fetchValue").withExactArgs("bar", null, undefined)
			.returns(oSyncPromiseValue);
		this.mock(oMetaModel).expects("fetchUI5Type").withExactArgs("/foo/bar")
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
	[false, true].forEach(function (bFailure) {
		QUnit.test("delete: " + (bFailure ? "failure" : "success"), function (assert) {
			var oBinding = {
					checkSuspended : function () {}
				},
				oGroupLock = new _GroupLock(),
				oModel = {
					checkGroupId : function () {},
					lockGroup : function () {},
					reportError : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
				oError = new Error();

			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(oModel).expects("checkGroupId").withExactArgs("myGroup");
			this.mock(oModel).expects("lockGroup").withExactArgs("myGroup", true, oContext)
				.returns(oGroupLock);
			this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock))
				.returns(bFailure ? Promise.reject(oError) : Promise.resolve());
			if (bFailure) {
				this.mock(oGroupLock).expects("unlock").withExactArgs(true);
				this.mock(oModel).expects("reportError")
					.withExactArgs("Failed to delete " + oContext, "sap.ui.model.odata.v4.Context",
						oError);
			}

			// code under test
			return oContext.delete("myGroup").then(function () {
				assert.notOk(bFailure);
			}, function (oError0) {
				assert.ok(bFailure);
				assert.strictEqual(oError0, oError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: success", function (assert) {
		var oBinding = {
				_delete : function () {}
			},
			oGroupLock = {},
			oModel = {},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42);

		this.mock(oContext).expects("fetchCanonicalPath")
			.withExactArgs().returns(SyncPromise.resolve("/EMPLOYEES('1')"));
		this.mock(oBinding).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "EMPLOYEES('1')",
				sinon.match.same(oContext))
			.returns(Promise.resolve());

		// code under test
		return oContext._delete(oGroupLock).then(function (oResult) {
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
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/-1", -1,
				new Promise(function () {}));

		this.mock(oBinding).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), "n/a", sinon.match.same(oContext))
			.returns(Promise.resolve());

		// code under test
		return oContext._delete(oGroupLock).then(function (oResult) {
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
				sinon.match.same(oContext))
			.returns(Promise.reject(oError));

		// code under test
		return oContext._delete(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.strictEqual(oContext.getBinding(), oBinding);
			assert.strictEqual(oContext.getIndex(), 42);
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
		assert.strictEqual(oContext.oModel, undefined);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate", function (assert) {
		var oModel = {
				getDependentBindings : function () {}
			},
			oBinding1 = {
				checkUpdate : function () {}
			},
			oBinding2 = {
				checkUpdate : function () {}
			},
			oParentBinding = {},
			oContext = Context.create(oModel, oParentBinding, "/EMPLOYEES/42", 42);

		this.mock(oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oContext))
			.returns([oBinding1, oBinding2]);
		this.mock(oBinding1).expects("checkUpdate").withExactArgs();
		this.mock(oBinding2).expects("checkUpdate").withExactArgs();

		// code under test
		oContext.checkUpdate();
	});

	//*********************************************************************************************
	QUnit.test("setIndex", function (assert) {
		var oContext = Context.create({/*oModel*/}, {/*oBinding*/}, "/EMPLOYEES('42')", 42);

		oContext.setIndex(23);
		assert.strictEqual(oContext.getIndex(), 23);
	});

	//*********************************************************************************************
	QUnit.test("refresh", function (assert) {
		var bAllowRemoval = {/*false, true, undefined*/},
			oBinding = {
				refreshSingle : function () {}
			},
			oGroupLock = {},
			oModel = {
				checkGroupId : function () {},
				lockGroup : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/EMPLOYEES/42", 42),
			oPromise = Promise.resolve();

		this.mock(oModel).expects("checkGroupId");
		this.mock(oModel).expects("lockGroup").withExactArgs("myGroup", true, oContext)
			.returns(oGroupLock);
		this.mock(oBinding).expects("refreshSingle")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oGroupLock),
				sinon.match.same(bAllowRemoval))
			.returns(oPromise);

		// code under test
		oContext.refresh("myGroup", bAllowRemoval);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("refresh, error, no list binding", function (assert) {
		assert.throws(function () {
			// code under test
			Context.create({}, {}, "/EMPLOYEES/42").refresh();
		}, new Error("Refresh is only supported for contexts of a list binding"));
	});

	//*********************************************************************************************
	QUnit.test("refresh, error handling: invalid group", function (assert) {
		var oBinding = {
				refreshSingle : function () {}
			},
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
	QUnit.test("withCache: absolute path", function (assert) {
		var oBinding = {
				withCache : function () {}
			},
			fnCallback = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {};

		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), "/foo").returns(oResult);

		assert.strictEqual(oContext.withCache(fnCallback, "/foo"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("withCache: relative path", function (assert) {
		var oBinding = {
				withCache : function () {}
			},
			fnCallback = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES('42')", 42),
			oResult = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("/EMPLOYEES('42')", "foo")
			.returns("~");
		this.mock(oBinding).expects("withCache")
			.withExactArgs(sinon.match.same(fnCallback), "~").returns(oResult);

		assert.strictEqual(oContext.withCache(fnCallback, "foo"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("withCache: virtual context", function (assert) {
		var oBinding = {},
			oContext = Context.create({/*oModel*/}, oBinding, "/EMPLOYEES/-2", -2),
			oResult;

		this.mock(_Helper).expects("buildPath").never();

		// code under test
		oResult = oContext.withCache();

		assert.strictEqual(oResult.isFulfilled(), true);
		assert.strictEqual(oResult.getResult(), undefined);
	});
});
