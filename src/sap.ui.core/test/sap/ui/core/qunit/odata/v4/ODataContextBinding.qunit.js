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
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel"
], function (ManagedObject, ChangeReason, ContextBinding, _Context, _ODataHelper, _Cache, _Helper,
		ODataContextBinding, ODataModel) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

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
	QUnit.test("setContext, relative path", function (assert) {
		var oContext = {},
			oBoundContext = {},
			oModel = this.oModel,
			oBinding = oModel.bindContext("relative"),
			oModelMock = this.mock(oModel);

		oModelMock.expects("resolve").withExactArgs("relative", sinon.match.same(oContext))
			.returns("/absolute");
		this.mock(oBinding).expects("_fireChange").twice()
			.withExactArgs({reason : ChangeReason.Context});
		this.mock(_Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/absolute")
			.returns(oBoundContext);

		// code under test
		oBinding.setContext(oContext);
		assert.strictEqual(oBinding.oContext, oContext);
		assert.strictEqual(oBinding.getBoundContext(), oBoundContext);

		oModelMock.expects("resolve").withExactArgs("relative", undefined)
			.returns(undefined);

		// reset parent binding fires change
		// code under test
		oBinding.setContext(undefined);
		assert.strictEqual(oBinding.oContext, undefined);
		assert.strictEqual(oBinding.getBoundContext(), null);

		oModelMock.expects("resolve").withExactArgs("relative", null)
			.returns(undefined);

		// set parent context to null does not change the bound context -> no change event
		// code under test
		oBinding.setContext(null);
		assert.strictEqual(oBinding.oContext, null);
		assert.strictEqual(oBinding.getBoundContext(), null);
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oModel = new ODataModel("/service/"),
			oBinding = oModel.bindContext("/EntitySet('foo')/child");

		this.mock(oBinding).expects("_fireChange").never();

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
			assert.strictEqual(oBinding.hasOwnProperty("mQueryOptions"), true);
			assert.deepEqual(oBinding.mQueryOptions,
				bAbsolute ? {"sap-client" : "111"} : undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
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

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.oSandbox.mock(oBinding);

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.oSandbox.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "bar", sinon.match.func)
			.callsArg(2)
			.returns(Promise.resolve("value"));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func).callsArg(1);

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (no read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.oSandbox.mock(oBinding);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();
		this.oSandbox.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "bar", sinon.match.func)
			// no read required! .callsArg(2)
			.returns(Promise.resolve("value"));

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oCacheMock = this.oSandbox.mock(oBinding.oCache),
			oExpectedError = new Error("Expected read failure"),
			oCachePromise = Promise.reject(oExpectedError);

		oCacheMock.expects("read").withExactArgs("$direct", "foo", sinon.match.func)
			.callsArg(2).returns(oCachePromise);
		oCacheMock.expects("read").withExactArgs("$direct", "bar", sinon.match.func)
			.returns(oCachePromise);
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

		this.oSandbox.mock(oBinding).expects("getGroupId").never();
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
	QUnit.test("updateValue: absolute binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", null, {$$groupId : "$direct"}),
			sPath = "SO_2_SOITEM/42",
			oResult = {};

		this.oSandbox.mock(oBinding).expects("fireEvent").never();
		this.oSandbox.mock(oBinding.oCache).expects("update")
			.withExactArgs("$direct", "bar", Math.PI, "edit('URL')", sPath)
			.returns(Promise.resolve(oResult));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup").withExactArgs("$direct");

		// code under test
		return oBinding.updateValue("bar", Math.PI, "edit('URL')", sPath)
			.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
	});

	//*********************************************************************************************
	QUnit.test("updateValue: relative binding", function (assert) {
		var oContext = {
				updateValue : function () {}
			},
			oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext),
			oResult = {};

		this.oSandbox.mock(oBinding).expects("fireEvent").never();
		this.oSandbox.mock(oBinding).expects("getGroupId").never();
		this.oSandbox.mock(oContext).expects("updateValue")
			.withExactArgs("bar", Math.PI, "edit('URL')", "PRODUCT_2_BP/BP_2_XYZ/42")
			.returns(Promise.resolve(oResult));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup").never();

		// code under test
		return oBinding.updateValue("bar", Math.PI, "edit('URL')", "BP_2_XYZ/42")
			.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
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
	QUnit.test("$$groupId", function (assert) {
		var oBinding,
			mParameters = {};

		this.mock(_ODataHelper).expects("buildBindingParameters").withExactArgs(mParameters)
			.returns({$$groupId : "foo"});

		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");

		// buildBindingParameters not called for relative binding
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oReadPromise = Promise.resolve();

		this.oSandbox.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "foo", sinon.match.func)
			.callsArg(2)
			.returns(oReadPromise);
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func)
			.callsArg(1);

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
	QUnit.test("execute function", function (assert) {
		var oCacheMock = this.oSandbox.mock(_Cache),
			done = assert.async(),
			oContextBinding,
			oHelperMock = this.oSandbox.mock(_Helper),
			oMetaModel = this.oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			sPath = "/FunctionImport(...)",
			oSingleCache = {
				refresh : function () {}
			},
			oSingleCacheMock = this.oSandbox.mock(oSingleCache);

		oCacheMock.expects("createSingle").never();

		oContextBinding = this.oModel.bindContext(sPath);

		oMetaModelMock.expects("requestObject")
			.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
			.returns(Promise.resolve({
				$kind : "FunctionImport",
				$Function : "schema.Function"
			}));
		oMetaModelMock.expects("requestObject").withExactArgs("/schema.Function")
			.returns(Promise.resolve([{
				$kind : "Function",
				$Parameter : [{
					$Name : "p1",
					$Type : "Edm.String"
				}, {
					$Name : "p2",
					$Type : "Edm.Int16"
				}, { // unused collection parameter must not lead to an error
					$Name : "p3",
					//$Nullable : true,
					$IsCollection : true
				}]
			}]));
		oHelperMock.expects("formatLiteral").withExactArgs("v'1", "Edm.String").returns("'v''1'");
		oHelperMock.expects("formatLiteral").withExactArgs(42, "Edm.Int16").returns("42");
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"FunctionImport(p1='v''1',p2=42)", {"sap-client" : "111"})
			.returns(oSingleCache);
		oSingleCacheMock.expects("refresh");

		// code under test
		oContextBinding.setParameter("p1", "v'1").setParameter("p2", 42).execute();

		oContextBinding.attachEventOnce("change", function (oEvent) {
			assert.deepEqual(oEvent.getParameters(), {reason : "refresh"});

			oHelperMock.expects("formatLiteral")
				.withExactArgs("v'2", "Edm.String").returns("'v''2'");
			oHelperMock.expects("formatLiteral")
				.withExactArgs(42, "Edm.Int16").returns("42");
			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor),
					"FunctionImport(p1='v''2',p2=42)", {"sap-client" : "111"})
				.returns(oSingleCache);
			oSingleCacheMock.expects("refresh");

			oContextBinding.attachEventOnce("change", done);

			// code under test
			oContextBinding.setParameter("p1", "v'2").execute();
		});
	});
	// TODO function returning collection
	// TODO function overloading

	//*********************************************************************************************
	[{
		result : undefined,
		message : "Unknown operation"
	}, {
		result : {$kind : "EntitySet"},
		message : "Not a FunctionImport"
	}].forEach(function (oFixture) {
		QUnit.test("execute, " + oFixture.message, function (assert) {
			var oContextBinding,
				done = assert.async(),
				oMetaModel = this.oModel.getMetaModel(),
				sPath = "/Employees(...)";

			this.oSandbox.mock(_Cache).expects("createSingle").never();

			oContextBinding = this.oModel.bindContext(sPath);

			this.oSandbox.mock(oMetaModel).expects("requestObject")
				.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
				.returns(Promise.resolve(oFixture.result));

			this.oLogMock.restore();
			this.oSandbox.stub(jQuery.sap.log, "error", function (sMessage, sDetail, sClass) {
				assert.strictEqual(sMessage, oFixture.message);
				assert.strictEqual(sDetail, sPath);
				assert.strictEqual(sClass, sClassName);
				done();
			});

			// code under test
			oContextBinding.execute();
		});
	});

	//*********************************************************************************************
	[{
		result : [{}, {}],
		message : "operation overloading"
	}, {
		result : [{$IsBound : true}],
		message : "bound operation"
	}, {
		result : [{$Parameter : [{$Name : "foo", $IsCollection : true}]}],
		message : "collection parameter"
	}].forEach(function (oFixture) {
		QUnit.test("execute, " + oFixture.message, function (assert) {
			var oContextBinding,
				done = assert.async(),
				oMetaModel = this.oModel.getMetaModel(),
				oMetaModelMock = this.oSandbox.mock(oMetaModel),
				sPath = "/FunctionImport(...)";

			oMetaModelMock.expects("requestObject")
				.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
				.returns(Promise.resolve({
					$kind : "FunctionImport",
					$Function : "schema.Function"
				}));
			oMetaModelMock.expects("requestObject").withExactArgs("/schema.Function")
				.returns(Promise.resolve(oFixture.result));
			this.oSandbox.mock(_Cache).expects("createSingle").never();
			this.oLogMock.restore();
			this.oSandbox.stub(jQuery.sap.log, "error", function (sMessage, sDetail, sClass) {
				assert.strictEqual(sMessage, "Unsupported: " + oFixture.message);
				assert.strictEqual(sDetail, sPath);
				assert.strictEqual(sClass, sClassName);
				done();
			});

			oContextBinding = this.oModel.bindContext(sPath);
			this.oSandbox.mock(oContextBinding).expects("refresh").never();

			// code under test
			oContextBinding.setParameter("foo", [42]).execute();
		});
	});

	//*********************************************************************************************
	QUnit.test("setParameter, execute: not deferred", function (assert) {
		var oContextBinding = this.oModel.bindContext("/Function()");

		assert.throws(function () {
			return oContextBinding.setParameter();
		}, /The binding must be deferred/);
		assert.throws(function () {
			return oContextBinding.execute();
		}, /The binding must be deferred/);
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
