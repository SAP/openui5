/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/Context",
	"sap/ui/model/odata/v4/_Context"
], function (Context, _Context) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4._Context", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();
			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
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
	QUnit.test("requestValue", function (assert) {
		var oBinding = {
				requestValue : function () {}
			},
			sPath = "/foo",
			oContext = _Context.create(null, oBinding, sPath, 42),
			oPromise = {},
			sRelativePath = "bar";

		this.mock(oBinding).expects("requestValue")
			.withExactArgs(sRelativePath, 42)
			.returns(oPromise);

		assert.strictEqual(oContext.requestValue(sRelativePath), oPromise);
	});
});
