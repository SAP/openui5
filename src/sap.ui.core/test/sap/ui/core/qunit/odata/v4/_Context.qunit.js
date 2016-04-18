/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/_Context"
], function (jQuery, Context, _Context) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._Context", {
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
			sPath = "/foo";

		// see below for tests with oBinding parameter
		oContext = _Context.create(oModel, null, sPath);

		assert.ok(oContext instanceof Context);
		assert.strictEqual(oContext.getModel(), oModel);
		assert.strictEqual(oContext.getPath(), sPath);
		assert.strictEqual(oContext.toString(), sPath, "useful for debugging, logging etc.");
	});

	//*********************************************************************************************
	QUnit.test("path must be absolute", function (assert) {
		assert.throws(function () {
			_Context.create(null, null, "foo");
		}, new Error("Not an absolute path: foo"));
	});

	//*********************************************************************************************
	QUnit.test("path must not contain trailing slash", function (assert) {
		assert.throws(function () {
			_Context.create(null, null, "/");
		}, new Error("Unsupported trailing slash: /"));
		assert.throws(function () {
			_Context.create(null, null, "/foo/");
		}, new Error("Unsupported trailing slash: /foo/"));
	});

	//*********************************************************************************************
	QUnit.test("getObject, getProperty: not supported", function (assert) {
		var oContext = _Context.create(null, null, "/foo");

		assert.throws(function () {
			oContext.getObject();
		}, new Error("No synchronous access to data"));

		assert.throws(function () {
			oContext.getProperty();
		}, new Error("No synchronous access to data"));
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		assert.strictEqual(
			_Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees").toString(),
			"/Employees");
		assert.strictEqual(
			_Context.create(/*oModel=*/{}, /*oBinding=*/{}, "/Employees", 5).toString(),
			"/Employees[5]");
	});

	//*********************************************************************************************
	QUnit.test("requestValue", function (assert) {
		var oBinding = {
				requestValue : function () {}
			},
			oContext = _Context.create(null, oBinding, "/foo", 42),
			oResult = {},
			sPath = "bar";

		this.mock(oBinding).expects("requestValue").withExactArgs(sPath, 42)
			.returns(oResult);

		assert.strictEqual(oContext.requestValue(sPath), oResult);
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
				oContext = _Context.create(oModel, oBinding, "/foo", iIndex),
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
			oContext = _Context.create(oModel, oBinding, "/foo", 0),
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
			oContext = _Context.create(null, oBinding, "/foo"),
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
			oContext = _Context.create(null, oBinding, "/foo", 0),
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
