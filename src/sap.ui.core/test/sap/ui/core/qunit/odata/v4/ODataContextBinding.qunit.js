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
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oRequestorMock = this.oSandbox.mock(this.oModel.oRequestor);
			this.oRequestorMock.expects("request").never();
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

		this.oSandbox.mock(this.oModel).expects("resolve")
			.withExactArgs("foo", sinon.match.same(oContext))
			.returns("/absolute");
		this.oSandbox.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		this.oSandbox.mock(_Context).expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding), "/absolute")
			.returns(oBoundContext);

		assert.strictEqual(oBinding.initialize(), undefined, "no chaining");
		assert.strictEqual(oBinding.getBoundContext(), oBoundContext);
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oBinding = this.oModel.bindContext("foo");

		this.oSandbox.mock(this.oModel).expects("resolve")
			.returns(undefined /*relative path, no context*/);
		this.oSandbox.mock(oBinding).expects("_fireChange").never();

		oBinding.initialize();
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindContext: invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindContext(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path", function (assert) {
		var oContext = {},
			oBoundContext = {},
			oBinding = this.oModel.bindContext("relative"),
			oModelMock = this.mock(this.oModel);

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
		var oBinding = this.oModel.bindContext("/EntitySet('foo')/child");

		this.mock(oBinding).expects("_fireChange").never();

		oBinding.setContext(_Context.create(this.oModel, null, "/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')", "TEAM_2_EMPLOYEES(ID='1')", ""].forEach(function (sPath) {
		QUnit.test("bindContext, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = jQuery.sap.startsWith(sPath, "/"),
				oCache = {},
				oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
				oBinding;

			if (bAbsolute) {
				this.oSandbox.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);
			} else {
				this.oSandbox.mock(_Cache).expects("createSingle").never();
			}

			oBinding = this.oModel.bindContext(sPath, oContext);

			assert.ok(oBinding instanceof ODataContextBinding);
			assert.strictEqual(oBinding.getModel(), this.oModel);
			assert.strictEqual(oBinding.getContext(), oContext);
			assert.strictEqual(oBinding.getPath(), sPath);
			assert.strictEqual(oBinding.hasOwnProperty("oCache"), true, "oCache is initialized");
			assert.strictEqual(oBinding.oCache, bAbsolute ? oCache : undefined);
			assert.strictEqual(oBinding.hasOwnProperty("mQueryOptions"), true);
			assert.deepEqual(oBinding.mQueryOptions,
				bAbsolute ? {"sap-client" : "111"} : undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
			assert.strictEqual(oBinding.sGroupId, undefined);
			assert.strictEqual(oBinding.hasOwnProperty("sUpdateGroupId"), true);
			assert.strictEqual(oBinding.sUpdateGroupId, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("bindContext with parameters", function (assert) {
		var oBinding,
			oError = new Error("Unsupported ..."),
			oHelperMock,
			mParameters = {"$expand" : "foo", "$select" : "bar", "custom" : "baz"},
			mQueryOptions = {};

		oHelperMock = this.oSandbox.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(this.oModel.mUriParameters, mParameters, ["$expand", "$select"])
			.returns(mQueryOptions);
		this.oSandbox.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES(ID='1')",
				sinon.match.same(mQueryOptions));

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined,
			"do not propagate unchecked query options");

		//error for invalid parameters
		oHelperMock.expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.oModel.bindContext("/EMPLOYEES(ID='1')", null, mParameters);
		}, oError);

		//error for relative paths
		assert.throws(function () {
			this.oModel.bindContext("EMPLOYEE_2_TEAM(Team_Id='4711')", null, mParameters);
		}, new Error("Bindings with a relative path do not support parameters"));
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path", function (assert) {
		var oBinding,
			oCache = {
				refresh : function () {}
			},
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')");

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oCache).expects("refresh");
		this.oSandbox.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Refresh});

		oBinding.refresh(true);
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path, with application group", function (assert) {
		var oBinding,
			oCache = {
				refresh : function () {}
			},
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oError = new Error(),
			oHelperMock = this.oSandbox.mock(_ODataHelper);

		this.oSandbox.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oCache).expects("refresh");
		this.oSandbox.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Refresh});
		oHelperMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oBinding.refresh(true, "myGroup");

		assert.strictEqual(oBinding.sRefreshGroupId, "myGroup");

		oHelperMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oBinding.refresh(true, "$Invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oBinding,
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')");

		this.oSandbox.mock(_Cache).expects("createSingle").never();

		oBinding = this.oModel.bindContext("TEAM_2_EMPLOYEES(ID='1')", oContext);
		this.oSandbox.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding.refresh(true);
		}, new Error("Refresh on this binding is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			oBindingMock,
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		this.oRequestorMock.expects("request").returns(Promise.resolve({"ID" : "1"}));
		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);

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
	QUnit.test("requestValue: absolute binding (read required), with refresh", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.oSandbox.mock(oBinding),
			oPromise;

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.oSandbox.mock(oBinding.oCache).expects("read")
			.withExactArgs("myGroup", "bar", sinon.match.func)
			.callsArg(2)
			.returns(Promise.resolve("value"));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("myGroup", sinon.match.func).callsArg(1);
		oBinding.sRefreshGroupId = "myGroup";

		oPromise = oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});

		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		return oPromise;
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
		var oBinding = this.oModel.bindContext("/absolute", null,
				{$$groupId : "myGroup", $$updateGroupId : "myUpdateGroup"}),
			sPath = "SO_2_SOITEM/42",
			oResult = {};

		this.oSandbox.mock(oBinding).expects("fireEvent").never();
		this.oSandbox.mock(oBinding.oCache).expects("update")
			.withExactArgs("myUpdateGroup", "bar", Math.PI, "edit('URL')", sPath)
			.returns(Promise.resolve(oResult));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("myUpdateGroup");

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
		var oContextBinding = this.oModel.bindContext("SO_2_BP");

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
			oReturn = {};

		oContextBinding = this.oModel.bindContext("SO_2_BP");

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
	QUnit.test("$$groupId, $$updateGroupId", function (assert) {
		var oBinding,
			oHelperMock = this.oSandbox.mock(_ODataHelper),
			mParameters = {};

		this.oSandbox.mock(this.oModel).expects("getGroupId").twice()
			.withExactArgs().returns("baz");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "foo");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters).returns({});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "baz");

		// buildBindingParameters not called for relative binding
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBinding2 = this.oModel.bindContext("/absolute"),
			oModelMock = this.oSandbox.mock(this.oModel),
			oReadPromise = Promise.resolve();

		this.oSandbox.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "foo", sinon.match.func)
			.callsArg(2)
			.returns(oReadPromise);
		oModelMock.expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func)
			.callsArg(1);
		this.oSandbox.mock(oBinding2.oCache).expects("read")
			.withExactArgs("$auto", "bar", sinon.match.func)
			.callsArg(2)
			.returns(oReadPromise);
		oModelMock.expects("addedRequestToGroup")
			.withExactArgs("$auto", sinon.match.func)
			.callsArg(1);

		// code under test
		return Promise.all([oBinding.requestValue("foo"), oBinding2.requestValue("bar")]);
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
			oContextBinding,
			oContextBindingMock,
			oHelperMock = this.oSandbox.mock(_Helper),
			oMetaModel = this.oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			sPath = "/FunctionImport(...)",
			oSingleCache = {
				read : function () {}
			},
			oSingleCacheMock = this.oSandbox.mock(oSingleCache),
			that = this;

		oCacheMock.expects("createSingle").never();

		oContextBinding = this.oModel.bindContext(sPath);
		oContextBindingMock = this.oSandbox.mock(oContextBinding);

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
		oContextBindingMock.expects("getGroupId").returns("foo");
		oSingleCacheMock.expects("read").withExactArgs("foo").returns(Promise.resolve({}));
		oContextBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding.setParameter("p1", "v'1").setParameter("p2", 42)
			.execute().then(function (oResult) {
				assert.strictEqual(oContextBinding.oCache, oSingleCache);
				assert.strictEqual(oResult, undefined);

				oHelperMock.expects("formatLiteral")
					.withExactArgs("v'2", "Edm.String").returns("'v''2'");
				oHelperMock.expects("formatLiteral")
					.withExactArgs(42, "Edm.Int16").returns("42");
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(that.oModel.oRequestor),
						"FunctionImport(p1='v''2',p2=42)", {"sap-client" : "111"})
					.returns(oSingleCache);
				oContextBindingMock.expects("getGroupId").returns("foo");
				oSingleCacheMock.expects("read").withExactArgs("foo").returns(Promise.resolve({}));
				oContextBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});

				// code under test
				return oContextBinding.setParameter("p1", "v'2").execute();
			});
	});
	// TODO function returning collection
	// TODO function overloading

	//*********************************************************************************************
	QUnit.test("execute action, success", function (assert) {
		var oContextBinding,
			oContextBindingMock,
			oMetaModel = this.oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			oModelMock = this.oSandbox.mock(this.oModel),
			mParameters = {},
			sPath = "/ActionImport(...)",
			oSingleCache = {
				post : function () {},
				refresh : function () {}
			},
			oSingleCacheMock = this.oSandbox.mock(oSingleCache),
			that = this;

		oSingleCacheMock.expects("refresh").never();

		oMetaModelMock.expects("requestObject")
			.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
			.returns(Promise.resolve({
				$kind : "ActionImport",
				$Action : "schema.Action"
			}));
		oMetaModelMock.expects("requestObject").withExactArgs("/schema.Action")
			.returns(Promise.resolve([{$kind : "Action"}]));

		oContextBinding = this.oModel.bindContext(sPath, undefined, mParameters);
		oContextBindingMock = this.oSandbox.mock(oContextBinding);

		this.oSandbox.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(that.oModel.oRequestor), "ActionImport",
				{"sap-client" : "111"})
			.returns(oSingleCache);
		oContextBindingMock.expects("getGroupId").returns("foo");
		oSingleCacheMock.expects("post")
			.withExactArgs("foo", sinon.match.same(oContextBinding.oOperation.mParameters))
			.returns(Promise.resolve({}));
		oModelMock.expects("addedRequestToGroup").withExactArgs("foo");
		oContextBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding.execute().then(function (oResult) {
			assert.strictEqual(oResult, undefined);

			oContextBindingMock.expects("getGroupId").returns("foo");
			oSingleCacheMock.expects("post")
				.withExactArgs("foo", sinon.match.same(oContextBinding.oOperation.mParameters))
				.returns(Promise.resolve({}));
			oModelMock.expects("addedRequestToGroup").withExactArgs("foo");
			oContextBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			return oContextBinding.execute().then(function () {

				// code under test: must not refresh the cache
				oContextBinding.refresh(true);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, failure", function (assert) {
		var oCacheMock = this.oSandbox.mock(_Cache),
			sPath = "/ActionImport(...)",
			oContextBinding = this.oModel.bindContext(sPath),
			oMetaModel = this.oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			sMessage = "deliberate failure",
			oSingleCache = {
				post : function () {}
			};

		oMetaModelMock.expects("requestObject")
			.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
			.returns(Promise.resolve({
				$kind : "ActionImport",
				$Action : "schema.Action"
			}));
		oMetaModelMock.expects("requestObject").withExactArgs("/schema.Action")
			.returns(Promise.resolve([{$kind : "Action"}]));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.oSandbox.mock(oContextBinding).expects("getGroupId").returns("foo");
		this.oSandbox.mock(oSingleCache).expects("post")
			.withExactArgs("foo", sinon.match.same(oContextBinding.oOperation.mParameters))
			.returns(Promise.reject(new Error(sMessage)));
		this.oSandbox.mock(this.oModel).expects("addedRequestToGroup").withExactArgs("foo");
		this.oSandbox.mock(oContextBinding).expects("_fireChange").never();
		this.oLogMock.expects("error").withExactArgs(sMessage, sPath, sClassName);

		// code under test
		return oContextBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, sMessage);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, error in change handler", function (assert) {
		var oCacheMock = this.oSandbox.mock(_Cache),
			sPath = "/ActionImport(...)",
			oContextBinding = this.oModel.bindContext(sPath),
			oMetaModel = this.oModel.getMetaModel(),
			oMetaModelMock = this.oSandbox.mock(oMetaModel),
			sMessage = "deliberate failure",
			oSingleCache = {
				post : function () {
					return Promise.resolve();
				}
			};

		oMetaModelMock.expects("requestObject")
			.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
			.returns(Promise.resolve({
				$kind : "ActionImport",
				$Action : "schema.Action"
			}));
		oMetaModelMock.expects("requestObject").withExactArgs("/schema.Action")
			.returns(Promise.resolve([{$kind : "Action"}]));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.oLogMock.expects("error").withExactArgs(sMessage, sPath, sClassName);

		oContextBinding.attachChange(function () {
			throw new Error(sMessage);
		});

		// code under test
		return oContextBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, sMessage);
		});
	});

	//*********************************************************************************************
	[{
		result : undefined,
		message : "Unknown operation"
	}, {
		result : {$kind : "EntitySet"},
		message : "Not an ActionImport or FunctionImport"
	}].forEach(function (oFixture) {
		QUnit.test("execute, " + oFixture.message, function (assert) {
			var oContextBinding,
				oMetaModel = this.oModel.getMetaModel(),
				oMetaModelMock = this.oSandbox.mock(oMetaModel),
				sPath = "/Foo(...)";

			oMetaModelMock.expects("requestObject")
				.withExactArgs(undefined, oMetaModel.getMetaContext(sPath))
				.returns(Promise.resolve(oFixture.result));
			this.oSandbox.mock(_Cache).expects("createSingle").never();
			this.oLogMock.expects("error").withExactArgs(oFixture.message, sPath, sClassName);

			oContextBinding = this.oModel.bindContext(sPath);

			// code under test
			return oContextBinding.execute().then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, oFixture.message);
			});
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
				sMessage = "Unsupported: " + oFixture.message,
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
			this.oLogMock.expects("error").withExactArgs(sMessage, sPath, sClassName);

			oContextBinding = this.oModel.bindContext(sPath);

			// code under test
			return oContextBinding.setParameter("foo", [42]).execute().then(function () {
				assert.ok(false);
			}, function (oError) {
				assert.strictEqual(oError.message, sMessage);
			});
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
