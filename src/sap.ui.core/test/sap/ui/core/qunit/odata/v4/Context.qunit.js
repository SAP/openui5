/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise"
], function (jQuery, BaseContext, _ODataHelper, Context, _Helper, _SyncPromise) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.Context", {
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
	QUnit.test("create", function (assert) {
		var oContext,
			oModel = {},
			oBinding = {},
			sPath = "/foo";

		// see below for tests with oBinding parameter
		oContext = Context.create(oModel, oBinding, sPath, 42);

		assert.ok(oContext instanceof BaseContext);
		assert.strictEqual(oContext.getModel(), oModel);
		assert.strictEqual(oContext.getBinding(), oBinding);
		assert.strictEqual(oContext.getPath(), sPath);
		assert.strictEqual(oContext.getIndex(), 42);
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
		assert.strictEqual(
			Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees").toString(),
			"/Employees");
		assert.strictEqual(
			Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees", 5).toString(),
			"/Employees[5]");
	});

	//*********************************************************************************************
	QUnit.test("fetchValue", function (assert) {
		var oBinding = {
				fetchValue : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 42),
			oListener = {},
			oResult = {},
			sPath = "bar";

		this.mock(oBinding).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), 42)
			.returns(oResult);

		assert.strictEqual(oContext.fetchValue(sPath, oListener), oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchAbsoluteValue", function (assert) {
		var oBinding = {
				fetchAbsoluteValue : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 42),
			oResult = {},
			sPath = "bar";

		this.mock(oBinding).expects("fetchAbsoluteValue").withExactArgs(sPath).returns(oResult);

		assert.strictEqual(oContext.fetchAbsoluteValue(sPath), oResult);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange", function (assert) {
		var oBinding = {
				deregisterChange : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 42),
			oListener = {},
			sPath = "bar";

		this.mock(oBinding).expects("deregisterChange")
			.withExactArgs(sPath, sinon.match.same(oListener), 42);

		oContext.deregisterChange(sPath, oListener);
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges", function (assert) {
		var oBinding = {
				hasPendingChanges : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 42),
			oResult = {},
			sPath = "bar";

		this.mock(_Helper).expects("buildPath").withExactArgs(42, sPath).returns("~bar~");
		this.mock(oBinding).expects("hasPendingChanges").withExactArgs("~bar~").returns(oResult);

		assert.strictEqual(oContext.hasPendingChanges(sPath), oResult);
	});

	//*********************************************************************************************
	[{value : 42}, undefined].forEach(function (oData) {
		QUnit.test("requestObject " + JSON.stringify(oData), function (assert) {
			var oContext = Context.create(null, null, "/foo"),
				oPromise,
				oSyncPromise = _SyncPromise.resolve(Promise.resolve(oData));

			this.mock(oContext).expects("fetchValue").withExactArgs("bar")
				.returns(oSyncPromise);

			//code under test
			oPromise = oContext.requestObject("bar");

			assert.ok(oPromise instanceof Promise);

			return oPromise.then(function (oResult) {
				assert.deepEqual(oResult, oData);
				if (oResult) {
					assert.notStrictEqual(oResult, oData);
				}
			});
		});
	});

	//*********************************************************************************************
	[{value : 42}, undefined].forEach(function (oData) {
		QUnit.test("getObject: " + JSON.stringify(oData), function (assert) {
			var oContext = Context.create(null, null, "/foo"),
				oResult,
				oSyncPromise = _SyncPromise.resolve(oData);

			this.mock(oContext).expects("fetchValue").withExactArgs("bar")
				.returns(oSyncPromise);

			//code under test
			oResult = oContext.getObject("bar");

			assert.deepEqual(oResult, oData);
			if (oResult) {
				assert.notStrictEqual(oResult, oData);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("getObject: unresolved", function (assert) {
		var oContext = Context.create(null, null, "/foo"),
			oSyncPromise = _SyncPromise.resolve(Promise.resolve(42));

		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
			.returns(oSyncPromise);

		//code under test
		assert.strictEqual(oContext.getObject("bar"), undefined);
	});

	//*********************************************************************************************
	[42, null].forEach(function (vResult) {
		QUnit.test("getProperty: primitive result " + vResult, function (assert) {
			var oContext = Context.create(null, null, "/foo"),
				oSyncPromise = _SyncPromise.resolve(vResult);

			this.mock(oContext).expects("fetchValue").withExactArgs("bar")
				.returns(oSyncPromise);

			//code under test
			assert.strictEqual(oContext.getProperty("bar"), vResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("getProperty: structured result", function (assert) {
		var oContext = Context.create(null, null, "/foo", 1),
			oSyncPromise = _SyncPromise.resolve({});

		this.mock(oContext).expects("getPath").withExactArgs("bar").returns("~");
		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
			.returns(oSyncPromise);

		//code under test
		assert.throws(function () {
			oContext.getProperty("bar");
		}, new Error("Accessed value is not primitive: ~"));
	});

	//*********************************************************************************************
	QUnit.test("getProperty: unresolved", function (assert) {
		var oContext = Context.create(null, null, "/foo"),
			oSyncPromise = _SyncPromise.resolve(Promise.resolve(42));

		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
			.returns(oSyncPromise);

		//code under test
		assert.strictEqual(oContext.getProperty("bar"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getProperty: rejected", function (assert) {
		var oContext = Context.create(null, null, "/foo"),
			oPromise = Promise.reject("read error"),
			oSyncPromise = _SyncPromise.resolve(oPromise);

		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
			.returns(oSyncPromise);

		return oPromise["catch"](function () {
			//code under test
			assert.strictEqual(oContext.getProperty("bar"), undefined);
		});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bTypeIsResolved) {
		QUnit.test("getProperty: external, bTypeIsResolved=" + bTypeIsResolved, function (assert) {
			var oMetaModel = {
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
				oContext = Context.create(oModel, null, "/foo", 42),
				oResolvedType = bTypeIsResolved ? oType : Promise.resolve(oType),
				oSyncPromiseType = _SyncPromise.resolve(oResolvedType),
				oSyncPromiseValue = _SyncPromise.resolve(1234);

			this.mock(oContext).expects("getPath").withExactArgs("bar").returns("~");
			this.mock(oContext).expects("fetchValue").withExactArgs("bar")
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
			var oContext = Context.create(null, null, "/foo"),
				oSyncPromise = _SyncPromise.resolve(Promise.resolve(vResult));

			this.mock(oContext).expects("fetchValue").withExactArgs("bar")
				.returns(oSyncPromise);

			//code under test
			return oContext.requestProperty("bar").then(function (vActual) {
				assert.strictEqual(vActual, vResult);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestProperty: structured result", function (assert) {
		var oContext = Context.create(null, null, "/foo", 1),
			oSyncPromise = _SyncPromise.resolve(Promise.resolve({}));

		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
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
		var oMetaModel = {
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
			oContext = Context.create(oModel, null, "/foo", 42),
			oSyncPromiseType = _SyncPromise.resolve(Promise.resolve(oType)),
			oSyncPromiseValue = _SyncPromise.resolve(1234);

		this.mock(oContext).expects("fetchValue").withExactArgs("bar")
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
	[undefined, "edit('URL')"].forEach(function (sEditUrl) {
		QUnit.test("updateValue, editUrl=" + sEditUrl, function (assert) {
			var oBinding = {
					updateValue : function () {}
				},
				oModel = {
					requestCanonicalPath : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/foo", 42),
				oResult = {},
				sPropertyName = "bar",
				vValue = Math.PI;

			this.mock(_Helper).expects("buildPath").withExactArgs(42, "SO_2_SOITEM/42")
				.returns("~");
			this.mock(oContext).expects("requestCanonicalPath")
				.exactly(sEditUrl ? 0 : 1)
				.withExactArgs()
				.returns(Promise.resolve("/edit('URL')"));
			this.mock(oBinding).expects("updateValue")
				.withExactArgs("up", sPropertyName, vValue, "edit('URL')", "~")
				.returns(Promise.resolve(oResult));

			return oContext.updateValue("up", sPropertyName, vValue, sEditUrl, "SO_2_SOITEM/42")
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("updateValue: error handling", function (assert) {
		var oBinding = {
				updateValue : function () {}
			},
			oModel = {
				requestCanonicalPath : function () {}
			},
			oContext = Context.create(oModel, oBinding, "/foo", 0),
			oError = new Error();

		this.mock(oContext).expects("requestCanonicalPath")
			.withExactArgs()
			.returns(Promise.reject(oError)); // rejected!
		this.mock(oBinding).expects("updateValue").never();

		return oContext.updateValue("up", "bar", Math.PI).then(function (oResult0) {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
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
			oSyncPromise = _SyncPromise.resolve(Promise.resolve("/EMPLOYEES(ID='1')"));

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		oPromise = oContext.requestCanonicalPath();

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oResult) {
			assert.deepEqual(oResult, "/EMPLOYEES(ID='1')");
		});
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: success", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oSyncPromise = _SyncPromise.resolve("/EMPLOYEES(ID='1')");

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		assert.strictEqual(oContext.getCanonicalPath(), "/EMPLOYEES(ID='1')");
	});

	//*********************************************************************************************
	QUnit.test("getCanonicalPath: unresolved", function (assert) {
		var oContext = Context.create(null, null, "/EMPLOYEES/42"),
			oSyncPromise = _SyncPromise.resolve(Promise.resolve("/EMPLOYEES(ID='1')"));

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
			oSyncPromise = _SyncPromise.resolve().then(function () {throw oError;});

		this.mock(oContext).expects("fetchCanonicalPath").withExactArgs().returns(oSyncPromise);

		//code under test
		assert.throws(function () {
			oContext.getCanonicalPath();
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptions", function (assert) {
		var oBinding = {},
			oContext = Context.create(null, oBinding, "/EMPLOYEES/42"),
			sPath = "foo/bar",
			mResult = {};

		this.mock(_ODataHelper).expects("getQueryOptions")
			.withExactArgs(sinon.match.same(oBinding), sPath)
			.returns(mResult);

		// code under test
		assert.strictEqual(oContext.getQueryOptions(sPath), mResult);
	});
});
