/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/_Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ContextBinding, _Context, _ODataHelper, _Cache,
		ODataContextBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oSandbox = sinon.sandbox.create();

			this.oLogMock = this.oSandbox.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel("/service/?sap-client=111");
		},

		afterEach : function () {
			this.oSandbox.verifyAndRestore();
		}
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oContext = {},
			oBoundContext = {},
			oBinding = this.oModel.bindContext("foo", oContext);

		this.mock(this.oModel).expects("resolve").withExactArgs("foo", sinon.match.same(oContext))
			.returns("/absolute");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		this.mock(_Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/absolute")
			.returns(oBoundContext);

		assert.strictEqual(oBinding.initialize(), undefined, "no chaining");
		assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oBinding = this.oModel.bindContext("foo");

		this.mock(this.oModel).expects("resolve")
			.returns(undefined /*relative path, no context*/);
		this.mock(oBinding).expects("_fireChange").never();

		oBinding.initialize();
	});

	//*********************************************************************************************
	//TODO support nested context bindings
	QUnit.skip("setContext, change event", function (assert) {
		var oContext = {},
			oBinding = this.oModel.bindContext("foo");

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		oBinding.setContext(oContext);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindContext: invalid path: " + sPath, function (assert) {
			var oModel = new ODataModel("/service/");

			assert.throws(function () {
				oModel.bindContext(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("relative path", function (assert) {
		var oModel = new ODataModel("/service/"),
			oBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () {
			oBinding.setContext("/SalesOrders(ID='1')");
		}, new Error("Nested context bindings are not supported"));
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oModel = new ODataModel("/service/"),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		oBinding.setContext(_Context.create(oModel, null, "/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')", "TEAM_2_EMPLOYEES(ID='1')", ""].forEach(function (sPath) {
		QUnit.test("bindContext, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = jQuery.sap.startsWith(sPath, "/"),
				oModel = new ODataModel("/service/?sap-client=111"),
				oCache = {},
				oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
				oBinding;

			if (bAbsolute) {
				this.oSandbox.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);
			} else {
				this.oSandbox.mock(_Cache).expects("createSingle").never();
			}

			oBinding = oModel.bindContext(sPath, oContext);

			assert.ok(oBinding instanceof ODataContextBinding);
			assert.strictEqual(oBinding.getModel(), oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindContext with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oHelperMock,
			oModel = new ODataModel("/service/?sap-client=111"),
			mParameters = {"$expand" : "foo", "$select" : "bar", "custom" : "baz"},
			mQueryOptions = {};

		oHelperMock = this.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(oModel.mUriParameters, mParameters, ["$expand", "$select"])
			.returns(mQueryOptions);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(oModel.oRequestor), "EMPLOYEES(ID='1')",
				sinon.match.same(mQueryOptions));

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			oModel.bindContext("EMPLOYEE_2_TEAM(Team_Id='4711')", null, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path", function (assert) {
		var oCache = {
				refresh : function () {}
			},
			oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oBinding;

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oCache).expects("refresh");
		this.oSandbox.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Refresh});

		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oBinding;

		this.oSandbox.mock(_Cache).expects("createSingle").never();

		oBinding = oModel.bindContext("TEAM_2_EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			oBindingMock,
			oModel = new ODataModel("/service/?sap-client=111"),
			oContext = _Context.create(oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		this.oSandbox.mock(oModel.oRequestor).expects("request")
			.returns(Promise.resolve({"ID" : "1"}));
		oBinding = oModel.bindContext("/EMPLOYEES(ID='1')", oContext);

		oBindingMock = this.oSandbox.mock(oBinding);
		oBindingMock.expects("_fireChange");
		oBindingMock.expects("fireDataReceived").withExactArgs();

		// trigger read before refresh
		oPromise = oBinding.requestValue("ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});
		oBinding.refresh(true);
		return oPromise;
	});
	// TODO bSuspended? In v2 it is ignored (check with core)

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oBindingMock = this.oSandbox.mock(oBinding);

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();

		this.oSandbox.mock(oBinding.oCache).expects("read").withArgs("", "bar").callsArg(2)
			.returns(Promise.resolve("value"));

		this.oSandbox.mock(oBinding.getModel()).expects("dataRequested").withArgs("").callsArg(1);

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (no read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oBindingMock = this.oSandbox.mock(oBinding),
			oCacheMock = this.oSandbox.mock(oBinding.oCache);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();

		oCacheMock.expects("read").withArgs("", "bar").returns(Promise.resolve("value"));

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oCacheMock = this.oSandbox.mock(oBinding.oCache),
			oExpectedError = new Error("Expected read failure"),
			oCachePromise = Promise.reject(oExpectedError);

		oCacheMock.expects("read").withArgs("", "foo").callsArg(2).returns(oCachePromise);
		oCacheMock.expects("read").withArgs("", "bar").returns(oCachePromise);
		this.oSandbox.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oExpectedError});
		this.oLogMock.expects("error").withExactArgs("Failed to read path /absolute",
			oExpectedError, "sap.ui.model.odata.v4.ODataContextBinding");

		oBinding.requestValue("foo").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
		return oBinding.requestValue("bar").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oNestedBinding,
			oPromise = {};

		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.oSandbox.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("requestValue").withExactArgs("navigation/bar").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue("bar"), oPromise);

		oContextMock.expects("requestValue").withExactArgs("navigation").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue(""), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oModel = new ODataModel("/service/"),
			oContextBinding = oModel.bindContext("SO_2_BP");

		assert.throws(function () { //TODO implement
			oContextBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataContextBinding#isInitial"));

		assert.throws(function () { //TODO implement
			oContextBinding.refresh(false);
		}, new Error("Unsupported operation: v4.ODataContextBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () {
			oContextBinding.refresh("foo"/*truthy*/);
		}, new Error("Unsupported operation: v4.ODataContextBinding#refresh, "
			+ "bForceUpdate must be true"));
		assert.throws(function () { //TODO implement
			oContextBinding.refresh(true, "");
		}, new Error("Unsupported operation: v4.ODataContextBinding#refresh, "
				+ "sGroupId parameter must not be set"));

		assert.throws(function () { //TODO implement
			oContextBinding.resume();
		}, new Error("Unsupported operation: v4.ODataContextBinding#resume"));

		assert.throws(function () { //TODO implement
			oContextBinding.suspend();
		}, new Error("Unsupported operation: v4.ODataContextBinding#suspend"));
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oContextBinding,
			oContextBindingMock = this.oSandbox.mock(ContextBinding.prototype),
			mEventParameters = {},
			oModel = new ODataModel("/service/"),
			oReturn = {};

		oContextBinding = oModel.bindContext("SO_2_BP");

		["change", "dataRequested", "dataReceived"].forEach(function (sEvent) {
			oContextBindingMock.expects("attachEvent")
				.withExactArgs(sEvent, mEventParameters).returns(oReturn);

			assert.strictEqual(oContextBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});

		assert.throws(function () {
			oContextBinding.attachDataStateChange();
		}, new Error("Unsupported event 'DataStateChange': v4.ODataContextBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("Use model's groupId", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oReadPromise = Promise.resolve();

		this.oSandbox.mock(oBinding.oModel).expects("getGroupId").withExactArgs()
			.returns("groupId");
		this.oSandbox.mock(oBinding.oCache).expects("read").withArgs("groupId").callsArg(2)
			.returns(oReadPromise);
		this.oSandbox.mock(oBinding.oModel).expects("dataRequested").withArgs("groupId");

		// code under test
		return oBinding.requestValue("foo");
	});

	//*********************************************************************************************
	QUnit.test("function, no execute", function (assert) {
		var oContextBinding = this.oModel.bindContext("/FunctionImport(...)");

		this.oSandbox.mock(oContextBinding).expects("_fireChange").never();

		assert.strictEqual(oContextBinding.oCache, undefined);
		oContextBinding.refresh(true);
		return oContextBinding.requestValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("function, execute", function (assert) {
		var oCache = {},
			oCacheMock = this.oSandbox.mock(_Cache),
			oContextBinding,
			oContextBindingMock,
			mParameters = {},
			mQueryOptions = {};

		this.oSandbox.mock(_ODataHelper).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
				sinon.match.same(mParameters), ["$expand", "$select"])
			.returns(mQueryOptions);
		oCacheMock.expects("createSingle").never();

		oContextBinding = this.oModel.bindContext("/FunctionImport(...)", undefined, mParameters);
		oContextBindingMock = this.oSandbox.mock(oContextBinding);

		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "FunctionImport()",
				sinon.match.same(mQueryOptions), true)
			.returns(oCache);
		oContextBindingMock.expects("refresh").withExactArgs(true);

		// code under test
		oContextBinding.execute();

		assert.strictEqual(oContextBinding.oCache, oCache);

		// second execute must not recreate the cache
		oContextBindingMock.expects("refresh").withExactArgs(true);

		// code under test
		oContextBinding.execute();
	});
	//TODO execute: support structured return type
	//TODO execute: support collection return type

	//*********************************************************************************************
	QUnit.test("execute on non-deferred", function (assert) {
		var oContextBinding = this.oModel.bindContext("/Employees(ID='42')");

		assert.throws(function () {
			oContextBinding.execute();
		}, /The binding must be deferred: \/Employees\(ID='42'\)/);
	});

	//*********************************************************************************************
	QUnit.test("function on relative binding", function (assert) {
		assert.throws(function () {
			return this.oModel.bindContext("Function(...)");
		}, /Deferred bindings with a relative path are not supported: Function\(\.\.\.\)/);
	});

	//*********************************************************************************************
	QUnit.test("composable function", function (assert) {
		assert.throws(function () {
			return this.oModel.bindContext("/Function(...)/Property");
		}, /Composable functions are not supported: \/Function\(\.\.\.\)\/Property/);
	});
});
