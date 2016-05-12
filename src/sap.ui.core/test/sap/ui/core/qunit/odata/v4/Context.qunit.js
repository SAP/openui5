/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_SyncPromise"
], function (jQuery, BaseContext, Context, _SyncPromise) {
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
			oResult = {},
			sPath = "bar";

		this.mock(oBinding).expects("fetchValue").withExactArgs(sPath, 42)
			.returns(oResult);

		assert.strictEqual(oContext.fetchValue(sPath), oResult);
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
	[undefined, 0, 42].forEach(function (iIndex) {
		QUnit.test("updateValue (PropertyBinding -> "
			+ (iIndex === undefined ? "Context" : "List") + "Binding)", function (assert) {
			var oBinding = {
					updateValue : function () {}
				},
				oModel = {
					requestCanonicalPath : function () {}
				},
				oContext = Context.create(oModel, oBinding, "/foo", iIndex),
				oResult = {},
				sPropertyName = "bar",
				vValue = Math.PI;

			this.mock(oModel).expects("requestCanonicalPath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(Promise.resolve("/edit('URL')"));
			this.mock(oBinding).expects("updateValue")
				.withExactArgs("up", sPropertyName, vValue, "edit('URL')",
					iIndex === undefined ? undefined : "" + iIndex)
				.returns(Promise.resolve(oResult));

			return oContext.updateValue("up", sPropertyName, vValue).then(function (oResult0) {
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

		this.mock(oModel).expects("requestCanonicalPath")
			.withExactArgs(sinon.match.same(oContext))
			.returns(Promise.reject(oError)); // rejected!
		this.mock(oBinding).expects("updateValue").never();

		return oContext.updateValue("up", "bar", Math.PI).then(function (oResult0) {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("updateValue (Context/ListBinding -> ContextBinding)", function (assert) {
		var oBinding = {
				updateValue : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo"),
			oResult = {},
			sPropertyName = "bar",
			vValue = Math.PI;

		this.mock(oBinding).expects("updateValue")
			.withExactArgs("up", sPropertyName, vValue, "edit('URL')", "SO_2_SOITEM/42")
			.returns(oResult);

		assert.strictEqual(
			oContext.updateValue("up", sPropertyName, vValue, "edit('URL')", "SO_2_SOITEM/42"),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("updateValue (Context/ListBinding -> ListBinding)", function (assert) {
		var oBinding = {
				updateValue : function () {}
			},
			oContext = Context.create(null, oBinding, "/foo", 0),
			oResult = {},
			sPropertyName = "bar",
			vValue = Math.PI;

		this.mock(oBinding).expects("updateValue")
			.withExactArgs("up", sPropertyName, vValue, "edit('URL')", "0/SO_2_SOITEM/42")
			.returns(oResult);

		assert.strictEqual(
			oContext.updateValue("up", sPropertyName, vValue, "edit('URL')", "SO_2_SOITEM/42"),
			oResult);
	});
});
