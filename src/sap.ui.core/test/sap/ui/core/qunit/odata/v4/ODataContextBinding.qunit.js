/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/_Context",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, Binding, ChangeReason, ContextBinding, _Context, _ODataHelper,
		_Cache, _Helper, ODataContextBinding, ODataModel, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oLogMock = sinon.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oRequestorMock = sinon.mock(this.oModel.oRequestor);
			this.oRequestorMock.expects("request").never();
		},

		afterEach : function () {
			this.oLogMock.verify();
			this.oRequestorMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding1 = this.oModel.bindContext("/Employees(ID='1')"),
			oBinding2 = this.oModel.bindContext("Employee_2_Team"),
			oContext = {
				toString: function () {return "/Employees[1]";}
			};

		assert.strictEqual(oBinding1.toString(), sClassName + ": /Employees(ID='1')", "absolute");

		assert.strictEqual(oBinding2.toString(), sClassName + ": undefined|Employee_2_Team",
			"relative, unresolved");

		oBinding2 = this.oModel.bindContext("Employee_2_Team", oContext);

		assert.strictEqual(oBinding2.toString(), sClassName
			+ ": /Employees[1]|Employee_2_Team", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oContext = {},
			oBoundContext = {},
			oBinding = this.oModel.bindContext("foo", oContext);

		this.mock(this.oModel).expects("resolve")
			.withExactArgs("foo", sinon.match.same(oContext))
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
			oModelMock = this.mock(this.oModel),
			oSetContextSpy = this.spy(Binding.prototype, "setContext");

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
		assert.strictEqual(oSetContextSpy.callCount, 1);

		// reset parent binding fires change
		// code under test
		oBinding.setContext(undefined);
		assert.strictEqual(oBinding.oContext, undefined);
		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oSetContextSpy.callCount, 2);

		// set parent context to null does not change the bound context -> no change event
		// code under test
		oBinding.setContext(null);
		assert.strictEqual(oBinding.oContext, null);
		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oSetContextSpy.callCount, 2, "no addt'l change event");
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
				this.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);
			} else {
				this.mock(_Cache).expects("createSingle").never();
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

		oHelperMock = this.mock(_ODataHelper);
		oHelperMock.expects("buildQueryOptions")
			.withExactArgs(this.oModel.mUriParameters, mParameters,
				["$expand", "$filter", "$orderby", "$select"])
			.returns(mQueryOptions);
		this.mock(_Cache).expects("createSingle")
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

		this.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.mock(oCache).expects("refresh");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Refresh});

		oBinding.refresh();
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path, with application group", function (assert) {
		var oBinding,
			oCache = {
				refresh : function () {}
			},
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oError = new Error(),
			oHelperMock = this.mock(_ODataHelper);

		this.mock(_Cache).expects("createSingle").returns(oCache);

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);
		this.mock(oCache).expects("refresh");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Refresh});
		oHelperMock.expects("checkGroupId").withExactArgs("myGroup");

		// code under test
		oBinding.refresh("myGroup");

		assert.strictEqual(oBinding.sRefreshGroupId, "myGroup");

		oHelperMock.expects("checkGroupId").withExactArgs("$Invalid").throws(oError);

		// code under test
		assert.throws(function () {
			oBinding.refresh("$Invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding is not supported", function (assert) {
		var oBinding,
			oContext = _Context.create(this.oModel, null, "/TEAMS('TEAM_01')");

		this.mock(_Cache).expects("createSingle").never();

		oBinding = this.oModel.bindContext("TEAM_2_EMPLOYEES(ID='1')", oContext);
		this.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding.refresh();
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

		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_fireChange");
		oBindingMock.expects("fireDataReceived").withExactArgs();

		// trigger read before refresh
		oPromise = oBinding.requestValue("ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});
		oBinding.refresh();
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "bar", sinon.match.func)
			.callsArg(2)
			.returns(Promise.resolve("value"));
		this.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func).callsArg(1);

		return oBinding.requestValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("requestValue: absolute binding (read required), with refresh", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oPromise;

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("myGroup", "bar", sinon.match.func)
			.callsArg(2)
			.returns(Promise.resolve("value"));
		this.mock(this.oModel).expects("addedRequestToGroup")
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
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();
		this.mock(oBinding.oCache).expects("read")
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
			oCacheMock = this.mock(oBinding.oCache),
			oExpectedError = new Error("Expected read failure"),
			oCachePromise = Promise.reject(oExpectedError);

		oCacheMock.expects("read").withExactArgs("$direct", "foo", sinon.match.func)
			.callsArg(2).returns(oCachePromise);
		oCacheMock.expects("read").withExactArgs("$direct", "bar", sinon.match.func)
			.returns(oCachePromise);
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oExpectedError});
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /absolute", sClassName, sinon.match.same(oExpectedError));

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

		this.mock(oBinding).expects("getGroupId").never();
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("requestValue").withExactArgs("navigation/bar").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue("bar"), oPromise);

		oContextMock.expects("requestValue").withExactArgs("navigation").returns(oPromise);

		assert.strictEqual(oNestedBinding.requestValue(""), oPromise);
	});

	//*********************************************************************************************
	[undefined, "up"].forEach(function (sGroupId) {
		QUnit.test("updateValue: absolute binding", function (assert) {
			var oBinding = this.oModel.bindContext("/absolute", null,
					{$$updateGroupId : "myUpdateGroup"}),
				sPath = "SO_2_SOITEM/42",
				oResult = {};

			this.mock(oBinding).expects("fireEvent").never();
			this.mock(oBinding.oCache).expects("update")
				.withExactArgs(sGroupId || "myUpdateGroup", "bar", Math.PI, "edit('URL')", sPath)
				.returns(Promise.resolve(oResult));
			this.mock(this.oModel).expects("addedRequestToGroup")
				.withExactArgs(sGroupId || "myUpdateGroup");

			// code under test
			return oBinding.updateValue(sGroupId, "bar", Math.PI, "edit('URL')", sPath)
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	[undefined, "BP_2_XYZ/42"].forEach(function (sPath) {
		QUnit.test("updateValue: relative binding", function (assert) {
			var oContext = {
					updateValue : function () {}
				},
				oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext),
				oResult = {};

			this.mock(oBinding).expects("fireEvent").never();
			this.mock(oBinding).expects("getGroupId").never();
			this.mock(oContext).expects("updateValue")
				.withExactArgs("up", "bar", Math.PI, "edit('URL')",
					sPath ? "PRODUCT_2_BP/" + sPath : "PRODUCT_2_BP")
				.returns(Promise.resolve(oResult));
			this.mock(this.oModel).expects("addedRequestToGroup").never();

			// code under test
			return oBinding.updateValue("up", "bar", Math.PI, "edit('URL')", sPath)
				.then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("forbidden", function (assert) {
		var oContextBinding = this.oModel.bindContext("SO_2_BP");

		assert.throws(function () { //TODO implement
			oContextBinding.isInitial();
		}, new Error("Unsupported operation: v4.ODataContextBinding#isInitial"));

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
			oContextBindingMock = this.mock(ContextBinding.prototype),
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
			oHelperMock = this.mock(_ODataHelper),
			oModelMock = this.mock(this.oModel),
			mParameters = {};

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

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
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oHelperMock.expects("buildBindingParameters").withExactArgs(mParameters).returns({});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters not called for relative binding
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBinding2 = this.oModel.bindContext("/absolute"),
			oModelMock = this.mock(this.oModel),
			oReadPromise = Promise.resolve();

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "foo", sinon.match.func)
			.callsArg(2)
			.returns(oReadPromise);
		oModelMock.expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func)
			.callsArg(1);
		this.mock(oBinding2.oCache).expects("read")
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
	[{
		path : "/Unknown(...)",
		request1 : "/Unknown",
		metadata1 : undefined,
		error : "Unknown operation: Unknown"
	}, {
		path : "/EntitySet(...)",
		request1 : "/EntitySet",
		metadata1 : {$kind : "EntitySet"},
		error : "Not an operation: EntitySet"
	}, {
		path : "/ActionImport(...)",
		request1 : "/ActionImport",
		metadata1 : {$kind : "ActionImport", $Action : "schema.Action"},
		request2 : "/schema.Action",
		metadata2 : [{$kind : "Action"}]
	}, {
		path : "/FunctionImport(...)",
		request1 : "/FunctionImport",
		metadata1 : {$kind : "FunctionImport", $Function : "schema.Function"},
		request2 : "/schema.Function",
		metadata2 : [{$kind : "Function"}]
	}, {
		path : "/OverloadedActionImport(...)",
		request1 : "/OverloadedActionImport",
		metadata1 : {$kind : "ActionImport", $Action : "schema.Action"},
		request2 : "/schema.Action",
		metadata2 : [{$kind : "Action"}, {$kind : "Action"}],
		error : "Unsupported operation overloading: OverloadedActionImport"
	}, {
		path : "schema.Action(...)",
		context : "/EntitySet",
		request1 : "/schema.Action",
		metadata1 : [{$kind : "Action"}]
	}, {
		path : "/EntitySet/schema.Function(...)",
		request1 : "/schema.Function",
		metadata1 : [{$kind : "Function"}],
		error : "Functions without import not supported: schema.Function"
	}, {
		path : "/EntitySet/schema.OverloadedAction(...)",
		request1 : "/schema.OverloadedAction",
		metadata1 : [{$kind : "Action"}, {}],
		error : "Unsupported operation overloading: schema.OverloadedAction"
	}].forEach(function (oFixture) {
		QUnit.test("_requestOperationMetadata: " + oFixture.path, function (assert) {
			var oContextBinding = this.oModel.bindContext(oFixture.path),
				oMetaModel = this.oModel.getMetaModel(),
				oMetaModelMock = this.mock(oMetaModel),
				oParentBinding,
				oPromise,
				oResult = oFixture.metadata1;

			if (oFixture.context) {
				oParentBinding = this.oModel.bindContext(oFixture.context);
				oParentBinding.initialize();
				oContextBinding.setContext(oParentBinding.getBoundContext());
			}
			oMetaModelMock.expects("requestObject")
				.withExactArgs(oFixture.request1)
				.returns(Promise.resolve(oFixture.metadata1));
			if (oFixture.request2) {
				oMetaModelMock.expects("requestObject")
					.withExactArgs(oFixture.request2)
					.returns(Promise.resolve(oFixture.metadata2));
				oResult = oFixture.metadata2;
			}

			// code under test
			oPromise = oContextBinding._requestOperationMetadata();

			assert.strictEqual(oContextBinding._requestOperationMetadata(), oPromise);

			return oPromise.then(function (oMetadata) {
				if (oFixture.error) {
					assert.ok(false);
				} else {
					assert.strictEqual(oMetadata, oResult[0]);
				}
			}, function (oError) {
				assert.strictEqual(oError.message, oFixture.error);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("function, no execute", function (assert) {
		var oContextBinding = this.oModel.bindContext("/FunctionImport(...)");

		this.mock(oContextBinding).expects("_fireChange").never();

		assert.strictEqual(oContextBinding.oCache, undefined);
		oContextBinding.refresh();
		return oContextBinding.requestValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute function", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oContextBinding,
			oContextBindingMock,
			oHelperMock = this.mock(_Helper),
			oModelMock = this.mock(this.oModel),
			sPath = "/FunctionImport(...)",
			oSingleCache = {
				read : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache),
			that = this;

		oCacheMock.expects("createSingle").never();

		oContextBinding = this.oModel.bindContext(sPath);
		oContextBindingMock = this.mock(oContextBinding);

		oContextBindingMock.expects("_requestOperationMetadata").twice()
			.returns(Promise.resolve({
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
			}));
		oHelperMock.expects("formatLiteral").withExactArgs("v'1", "Edm.String").returns("'v''1'");
		oHelperMock.expects("formatLiteral").withExactArgs(42, "Edm.Int16").returns("42");
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"FunctionImport(p1='v''1',p2=42)", {"sap-client" : "111"})
			.returns(oSingleCache);
		oContextBindingMock.expects("getGroupId").returns("foo");
		oSingleCacheMock.expects("read").withExactArgs("foo").returns(Promise.resolve({}));
		oModelMock.expects("addedRequestToGroup").withExactArgs("foo");
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
				oSingleCacheMock.expects("read").withExactArgs("myGroupId")
					.returns(Promise.resolve({}));
				oModelMock.expects("addedRequestToGroup").withExactArgs("myGroupId");
				oContextBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});

				// code under test
				return oContextBinding.setParameter("p1", "v'2").execute("myGroupId");
			});
	});
	// TODO function returning collection
	// TODO function overloading

	//*********************************************************************************************
	QUnit.test("execute action, success", function (assert) {
		var oContextBinding,
			oContextBindingMock,
			oModelMock = this.mock(this.oModel),
			mParameters = {},
			sPath = "/ActionImport(...)",
			oSingleCache = {
				post : function () {},
				refresh : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache),
			that = this;

		oSingleCacheMock.expects("refresh").never();

		oContextBinding = this.oModel.bindContext(sPath, undefined, mParameters);
		oContextBindingMock = this.mock(oContextBinding);

		oContextBindingMock.expects("_requestOperationMetadata").twice()
			.returns(Promise.resolve({$kind : "Action"}));
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(that.oModel.oRequestor), "ActionImport",
				{"sap-client" : "111"}, false, true)
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

			oSingleCacheMock.expects("post")
				.withExactArgs("myGroupId",
					sinon.match.same(oContextBinding.oOperation.mParameters))
				.returns(Promise.resolve({}));
			oModelMock.expects("addedRequestToGroup").withExactArgs("myGroupId");
			oContextBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			return oContextBinding.execute("myGroupId").then(function () {

				// code under test: must not refresh the cache
				oContextBinding.refresh();
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("execute bound action, absolute binding", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oContextBinding = this.oModel.bindContext("/EntitySet(ID='1')/schema.Action(...)"),
			oContextBindingMock = this.mock(oContextBinding),
			oPostResult = {},
			oSingleCache = {
				post : function () {},
				read : function () {},
				refresh : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache);

		oSingleCacheMock.expects("refresh").never();
		oContextBindingMock.expects("_requestOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"EntitySet(ID='1')/schema.Action", {"sap-client" : "111"}, false, true)
			.returns(oSingleCache);
		oContextBindingMock.expects("getGroupId").returns("groupId");
		oSingleCacheMock.expects("post")
			.withExactArgs("groupId", {"foo" : 42, "bar" : "baz"})
			.returns(Promise.resolve(oPostResult));
		this.mock(this.oModel).expects("addedRequestToGroup").withExactArgs("groupId");
		oContextBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding
			.setParameter("foo", 42)
			.setParameter("bar", "baz")
			.execute();
	});

	//*********************************************************************************************
	QUnit.test("execute bound action, relative binding", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oContextBinding,
			oContextBindingMock,
			oModelMock = this.mock(this.oModel),
			oParentBinding1 = this.oModel.bindContext("/EntitySet(ID='1')/navigation1"),
			oParentBinding2 = this.oModel.bindContext("/EntitySet(ID='2')/navigation1"),
			oPostResult = {},
			oSingleCache = {
				post : function () {},
				read : function () {},
				refresh : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache),
			that = this;

		oParentBinding1.initialize();
		oParentBinding2.initialize();
		oContextBinding = this.oModel.bindContext("navigation2/schema.Action(...)",
			oParentBinding1.getBoundContext());
		oContextBindingMock = this.mock(oContextBinding);

		oSingleCacheMock.expects("refresh").never();
		oContextBindingMock.expects("_requestOperationMetadata").twice()
			.returns(Promise.resolve({$kind : "Action"}));
		oModelMock.expects("requestCanonicalPath")
			.withExactArgs(sinon.match.same(oParentBinding1.getBoundContext()))
			.returns(Promise.resolve("/EntitySet(ID='1')/navigation1"));
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"EntitySet(ID='1')/navigation1/navigation2/schema.Action", {"sap-client" : "111"},
				false, true)
			.returns(oSingleCache);
		oContextBindingMock.expects("getGroupId").twice().returns("groupId");
		oSingleCacheMock.expects("post")
			.withExactArgs("groupId", {})
			.returns(Promise.resolve(oPostResult));
		oModelMock.expects("addedRequestToGroup").withExactArgs("groupId");
		oContextBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding.execute().then(function () {
			oContextBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Context});

			// code under test: setContext clears the cache
			oContextBinding.setContext(oParentBinding2.getBoundContext());

			oModelMock.expects("requestCanonicalPath")
				.withExactArgs(sinon.match.same(oParentBinding2.getBoundContext()))
				.returns(Promise.resolve("/EntitySet(ID='2')/navigation1"));
			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(that.oModel.oRequestor),
					"EntitySet(ID='2')/navigation1/navigation2/schema.Action",
					{"sap-client" : "111"}, false, true)
				.returns(oSingleCache);
			oSingleCacheMock.expects("post")
				.withExactArgs("groupId", {"foo" : "bar"})
				.returns(Promise.resolve(oPostResult));
			oModelMock.expects("addedRequestToGroup").withExactArgs("groupId");
			oContextBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});

			// code under test: execute creates a new cache with the new path
			return oContextBinding.setParameter("foo", "bar").execute();
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, failure", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oPostError = new Error("deliberate failure"),
			sPath = "/ActionImport(...)",
			oContextBinding = this.oModel.bindContext(sPath),
			oSingleCache = {
				post : function () {}
			};

		this.mock(oContextBinding).expects("_requestOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.mock(oContextBinding).expects("getGroupId").returns("groupId");
		this.mock(oSingleCache).expects("post")
			.withExactArgs("groupId", sinon.match.same(oContextBinding.oOperation.mParameters))
			.returns(Promise.reject(oPostError));
		this.mock(this.oModel).expects("addedRequestToGroup").withExactArgs("groupId");
		this.mock(oContextBinding).expects("_fireChange").never();
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oPostError));

		// code under test
		return oContextBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oPostError);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, error in change handler", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oChangeHandlerError = new Error("deliberate failure"),
			sPath = "/ActionImport(...)",
			oContextBinding = this.oModel.bindContext(sPath),
			oSingleCache = {
				post : function () {
					return Promise.resolve();
				}
			};

		this.mock(oContextBinding).expects("_requestOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, oChangeHandlerError);

		oContextBinding.attachChange(function () {
			throw oChangeHandlerError;
		});

		// code under test
		return oContextBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oChangeHandlerError);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: invalid group ID", function (assert) {
		var oContextBinding = this.oModel.bindContext("/Function(...)"),
			oError = new Error("Invalid");

		this.mock(_ODataHelper).expects("checkGroupId")
			.withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			return oContextBinding.execute("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("execute, unresolved relative binding", function (assert) {
		var oContextBinding = this.oModel.bindContext("schema.Action(...)");

		assert.throws(function () {
			oContextBinding.execute();
		}, new Error("Unresolved binding: schema.Action(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute, relative binding with deferred parent", function (assert) {
		var oContextBinding,
			oParentBinding = this.oModel.bindContext("/FunctionImport(...)");

		oParentBinding.initialize();
		oContextBinding = this.oModel.bindContext("schema.Action(...)",
			oParentBinding.getBoundContext());

		assert.throws(function () {
			oContextBinding.execute();
		}, new Error("Nested deferred operation bindings not supported: "
			+ "/FunctionImport(...)/schema.Action(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute: collection parameter", function (assert) {
		var sPath = "/FunctionImport(...)",
			oContextBinding = this.oModel.bindContext(sPath),
			sMessage = "Unsupported: collection parameter";

		this.mock(oContextBinding).expects("_requestOperationMetadata")
			.returns(Promise.resolve({$Parameter : [{$Name : "foo", $IsCollection : true}]}));
		this.mock(_Cache).expects("createSingle").never();
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match(function (oError) {
				return oError.message === sMessage;
			}));

		// code under test
		return oContextBinding.setParameter("foo", [42]).execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, sMessage);
		});
	});

	//*********************************************************************************************
	QUnit.test("setParameter, execute: not deferred", function (assert) {
		var oContextBinding = this.oModel.bindContext("/Function()");

		assert.throws(function () {
			return oContextBinding.setParameter();
		}, new Error("The binding must be deferred: /Function()"));
		assert.throws(function () {
			return oContextBinding.execute();
		}, new Error("The binding must be deferred: /Function()"));
	});

	//*********************************************************************************************
	QUnit.test("composable function", function (assert) {
		assert.throws(function () {
			return this.oModel.bindContext("/Function(...)/Property");
		}, new Error("The path must not continue after a deferred operation: "
			+ "/Function(...)/Property"));
	});

	//*********************************************************************************************
	if (TestUtils.isRealOData()) {
		//*****************************************************************************************
		QUnit.test("Action import on navigation property", function (assert) {
			var oModel = new ODataModel({
					serviceUrl :
						TestUtils.proxy("/sap/opu/odata4/IWBEP/TEA/default/IWBEP/TEA_BUSI/0001/"),
					synchronizationMode : "None"
				}),
				oContextBinding = oModel.bindContext("EMPLOYEE_2_TEAM/" +
					"com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeManagerOfTeam(...)"),
				oParentBinding = oModel.bindContext("/EMPLOYEES('1')");

			oParentBinding.initialize();
			oContextBinding.setContext(oParentBinding.getBoundContext());
			return oContextBinding.setParameter("ManagerID", "3").execute();
		});
	}
});
