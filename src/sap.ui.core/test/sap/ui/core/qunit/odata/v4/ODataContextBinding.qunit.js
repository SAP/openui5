/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, Binding, ChangeReason, ContextBinding, Context, _Cache, _Helper,
		_SyncPromise, ODataContextBinding, ODataModel, asODataParentBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$groupId", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

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
			// ensure that the requestor does not trigger requests
			this.oRequestorMock.expects("request").never();
			// avoid that the cache requests actual metadata for faked responses
			sinon.stub(this.oModel.oRequestor, "fetchTypeForPath")
				.returns(_SyncPromise.resolve({}));
		},

		afterEach : function () {
			this.oLogMock.verify();
			this.oRequestorMock.verify();
		}
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function (assert) {
		var oBinding,
			oCreatedBinding;

		this.stub(this.oModel, "bindingCreated", function (oBinding) {
			oCreatedBinding = oBinding;
		});

		oBinding = this.oModel.bindContext("/EMPLOYEES('42')");

		assert.strictEqual(oCreatedBinding, oBinding, "bindingCreated() has been called");
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var oBinding = this.oModel.bindContext("/EMPLOYEES('42')");

		assert.ok(oBinding.hasOwnProperty("oCachePromise"));
		assert.ok(oBinding.hasOwnProperty("mCacheByContext"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("oOperation"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sRefreshGroupId"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
		assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
	});

	//*********************************************************************************************
	QUnit.test("c'tor initializes oCachePromise and calls applyParameters", function (assert) {
		var oBinding,
			mParameters = {},
			mParametersClone = {};

		this.mock(jQuery).expects("extend").withExactArgs(true, {}, sinon.match.same(mParameters))
			.returns(mParametersClone);
		this.mock(ODataContextBinding.prototype).expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));

		oBinding = new ODataContextBinding(this.oModel, "/EMPLOYEES", undefined, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined, "c'tor does not set mParameters");
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters (as called by c'tor)", function (assert) {
		var mBindingParameters = {
				$$groupId : "foo",
				$$updateGroupId : "update foo"
			},
			sGroupId = "foo",
			oModelMock = this.mock(this.oModel),
			oBinding = this.oModel.bindContext("/EMPLOYEES"),
			mParameters = {
				$$groupId : "foo",
				$$updateGroupId : "update foo",
				$filter : "bar"
			},
			mQueryOptions = {
				$filter : "bar"
			},
			sUpdateGroupId = "update foo";

		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), ["$$groupId", "$$updateGroupId"])
			.returns(mBindingParameters);
		this.stub(oBinding, "fetchCache", function (oContext) {
			assert.strictEqual(oContext, undefined);
			this.oCachePromise = _SyncPromise.resolve({});
		});
		this.mock(oBinding).expects("checkUpdate").withExactArgs();

		// code under test
		oBinding.applyParameters(mParameters);

		assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
		assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
		assert.deepEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
		assert.strictEqual(oBinding.mParameters, mParameters, "mParameters");
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function(bAction) {
		var sTitle = "applyParameters: function binding, bAction: " + bAction;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.oModel.bindContext("/FunctionImport(...)"),
				oBindingMock = this.mock(oBinding),
				sGroupId = "foo",
				oModelMock = this.mock(this.oModel),
				mParameters = {},
				mQueryOptions = {},
				sUpdateGroupId = "update foo";

			oBinding.oOperation.bAction = bAction;

			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
			oModelMock.expects("buildBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), ["$$groupId", "$$updateGroupId"])
				.returns({
					$$groupId : sGroupId,
					$$updateGroupId : sUpdateGroupId
				});
			oBindingMock.expects("checkUpdate").never();
			oBindingMock.expects("execute").exactly(bAction === false ? 1 : 0).withExactArgs();
			oBindingMock.expects("fetchCache").never();
			oBindingMock.expects("refreshInternal").never();

			// code under test (as called by ODataParentBinding#changeParameters)
			oBinding.applyParameters(mParameters, ChangeReason.Filter);

			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
			assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
			assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
			assert.strictEqual(oBinding.mParameters, mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: action binding", function (assert) {
		var oBinding = this.oModel.bindContext("/ActionImport(...)"),
			oBindingMock = this.mock(oBinding),
			sGroupId = "foo",
			oModelMock = this.mock(this.oModel),
			mParameters = {},
			mQueryOptions = {},
			sUpdateGroupId = "update foo";

		oBinding.oOperation.bAction = true;

		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), ["$$groupId", "$$updateGroupId"])
			.returns({
				$$groupId : sGroupId,
				$$updateGroupId : sUpdateGroupId
			});
		oBindingMock.expects("checkUpdate").never();
		oBindingMock.expects("execute").never();
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("refreshInternal").never();

		// code under test (as called by ODataParentBinding#changeParameters)
		oBinding.applyParameters(mParameters, ChangeReason.Filter);

		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
		assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
		assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
		assert.strictEqual(oBinding.mParameters, mParameters);
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: no operation binding", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EMPLOYEES"),
			oBinding = this.oModel.bindContext("", oContext),
			oBindingMock = this.mock(oBinding),
			sGroupId = "foo",
			oModelMock = this.mock(this.oModel),
			mParameters = {},
			mQueryOptions = {},
			sUpdateGroupId = "update foo";

		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), ["$$groupId", "$$updateGroupId"])
			.returns({
				$$groupId : sGroupId,
				$$updateGroupId : sUpdateGroupId
			});
		oBindingMock.expects("checkUpdate").never();
		oBindingMock.expects("execute").never();
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		oBindingMock.expects("refreshInternal").withExactArgs(undefined, true);

		// code under test (as called by ODataParentBinding#changeParameters)
		oBinding.applyParameters(mParameters, ChangeReason.Filter);

		assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
		assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
		assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
		assert.strictEqual(oBinding.mParameters, mParameters);
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.oModel.bindContext("/EMPLOYEES('42')"),
			oMixin = {};

		asODataParentBinding(oMixin);

		Object.keys(oMixin).forEach(function (sKey) {
			assert.strictEqual(oBinding[sKey], oMixin[sKey]);
		});
	});

	//*********************************************************************************************
	QUnit.test("toString", function (assert) {
		var oBinding = this.oModel.bindContext("/Employees(ID='1')");

		assert.strictEqual(oBinding.toString(), sClassName + ": /Employees(ID='1')", "absolute");

		oBinding = this.oModel.bindContext("Employee_2_Team");

		assert.strictEqual(oBinding.toString(), sClassName + ": undefined|Employee_2_Team",
				"relative, unresolved");

		oBinding = this.oModel.bindContext("Employee_2_Team",
			Context.create(this.oModel, /*oBinding*/{}, "/Employees", 1));

		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /Employees[1]|Employee_2_Team", "relative, V4 context resolved");

		oBinding = this.oModel.bindContext("Employee_2_Team",
				this.oModel.createBindingContext("/Employees(ID='1')") );

		assert.strictEqual(oBinding.toString(), sClassName
			+ ": /Employees(ID='1')|Employee_2_Team", "relative, base context, resolved");
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path", function (assert) {
		var oBinding = this.oModel.bindContext("relative"),
			oContext = {
				getBinding : function () {},
				getPath : function () {}
			},
			oModelMock = this.mock(this.oModel),
			oSetContextSpy = this.spy(Binding.prototype, "setContext");

		oModelMock.expects("resolve").withExactArgs("relative", sinon.match.same(oContext))
			.returns("/absolute1");
		this.mock(oBinding).expects("_fireChange").twice()
			.withExactArgs({reason : ChangeReason.Context});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oContext, oContext);
		assert.strictEqual(oBinding.getBoundContext().getPath(), "/absolute1");
		assert.strictEqual(oSetContextSpy.callCount, 1);

		this.mock(oBinding.getBoundContext()).expects("destroy").withExactArgs();

		// code under test: reset parent binding fires change
		oBinding.setContext(undefined);

		assert.strictEqual(oBinding.oContext, undefined);
		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oSetContextSpy.callCount, 2);

		// code under test: setting to null doesn't change the bound context -> no change event
		oBinding.setContext(null);

		assert.strictEqual(oBinding.oContext, null);
		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oSetContextSpy.callCount, 2, "no addt'l change event");
	});

	//*********************************************************************************************
	[{
		sInit : "base", sTarget : undefined
	}, {
		sInit : "base", sTarget : "base"
	}, {
		sInit : "base", sTarget : "v4"
	}, {
		sInit : "v4", sTarget : "base"
	}, {
		sInit : "v4", sTarget : "v4"
	}, {
		sInit : undefined, sTarget : "base"
	}].forEach(function (oFixture) {
		QUnit.test("change context:" + oFixture.sInit + "->" + oFixture.sTarget, function (assert) {
			var oModel = this.oModel,
				oInitialContext = createContext(oFixture.sInit, "/EMPLOYEES(ID='1')"),
				oBinding = oModel.bindContext("EMPLOYEE_2_TEAM", oInitialContext),
				oTargetCache = {},
				oTargetContext = createContext(oFixture.sTarget, "/EMPLOYEES(ID='2')"),
				oModelMock = this.mock(this.oModel);

			function createContext(sType, sPath) {
				if (sType === "base") {
					return oModel.createBindingContext(sPath);
				}
				if (sType === "v4") {
					return Context.create(oModel, null/*oBinding*/, sPath);
				}

				return undefined;
			}

			if (oFixture.sTarget === "base") {
				this.stub(oBinding, "fetchCache", function (oContext0) {
					assert.strictEqual(oContext0, oTargetContext);
					this.oCachePromise = _SyncPromise.resolve(oTargetCache);
				});
			}
			if (oTargetContext) {
				oModelMock.expects("resolve")
					.withExactArgs("EMPLOYEE_2_TEAM", sinon.match.same(oTargetContext))
					.returns("/EMPLOYEES(ID='2')/EMPLOYEE_2_TEAM");
			}
			this.mock(oBinding).expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Context});
			if (oInitialContext) {
				this.mock(oBinding.getBoundContext()).expects("destroy").withExactArgs();
			}

			// code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.oContext, oTargetContext);
			if (oTargetContext) {
				assert.strictEqual(oBinding.getBoundContext().getPath(),
					"/EMPLOYEES(ID='2')/EMPLOYEE_2_TEAM");
			}
			return oBinding.oCachePromise.then(function (oCache) {
				assert.strictEqual(oCache,
					oFixture.sTarget === "base" ? oTargetCache : undefined);
			});
		});
	});


	//*********************************************************************************************
	QUnit.test("setContext, relative path with parameters", function (assert) {
		var oBinding = this.oModel.bindContext("TEAM_2_MANAGER", null, {$select : "Name"}),
			oCache = {},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		this.stub(oBinding, "fetchCache", function (oContext0) {
			assert.strictEqual(oContext0, oContext);
			this.oCachePromise = _SyncPromise.resolve(oContext0 ? oCache : undefined);
		});

		//code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

		oCache = undefined;
		oContext = undefined;

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oBinding = this.oModel.bindContext("/EntitySet('foo')/child");

		this.mock(oBinding).expects("_fireChange").never();

		oBinding.setContext(Context.create(this.oModel, null, "/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
	});

	//*********************************************************************************************
	QUnit.test("bindContext: relative, base context, no parameters", function (assert) {
		var oBinding,
			oContext = this.oModel.createBindingContext("/TEAMS('TEAM_01')");

		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"TEAMS('TEAM_01')/TEAM_2_MANAGER", {"sap-client": "111"}, false)
			.returns({});

		//code under test
		oBinding = this.oModel.bindContext("TEAM_2_MANAGER", oContext);

		assert.deepEqual(oBinding.mQueryOptions, {});
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.sUpdateGroupId, undefined);
	});

	//*********************************************************************************************
	QUnit.test("bindContext w/o parameters", function (assert) {
		var oCache = {},
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oBinding;

		this.stub(ODataContextBinding.prototype, "fetchCache", function (oContext0) {
			// context ignored for absolute binding
			assert.strictEqual(oContext0, undefined);
			this.oCachePromise = _SyncPromise.resolve(oCache);
		});

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);

		assert.ok(oBinding instanceof ODataContextBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES(ID='1')");
		assert.ok(oBinding.oCachePromise, "oCache is initialized");
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
		assert.strictEqual(oBinding.hasOwnProperty("mQueryOptions"), true);
		assert.deepEqual(oBinding.mQueryOptions, {});
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.hasOwnProperty("sUpdateGroupId"), true);
		assert.strictEqual(oBinding.sUpdateGroupId, undefined);
		assert.strictEqual(oBinding.hasOwnProperty("mCacheByContext"), true);
		assert.strictEqual(oBinding.mCacheByContext, undefined);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindContext with invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.oModel.bindContext(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindContext with invalid parameters", function (assert) {
		var oError = new Error("Unsupported ...");

		this.mock(this.oModel).expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.oModel.bindContext("/EMPLOYEES(ID='1')", null, {});
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			oBindingMock,
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext,
			{$$groupId : "$direct"}); // to prevent that the context is asked for the group ID

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "EMPLOYEES(ID='1')?sap-client=111", "$direct", undefined,
				undefined, sinon.match.func)
			.callsArg(5)
			.returns(Promise.resolve({"ID" : "1"}));
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EMPLOYEES(ID='1')", sClassName, sinon.match({canceled : true}));
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});

		// trigger read before refresh
		oPromise = oBinding.fetchValue("/EMPLOYEES(ID='1')/ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal(undefined, true);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oListener = {},
			oPromise;

		oBindingMock.expects("getRelativePath").withExactArgs("/absolute/bar").returns("bar");
		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs("$direct", "bar", sinon.match.func, sinon.match.same(oListener))
			.callsArg(2)
			.returns(_SyncPromise.resolve("value"));

		oPromise = oBinding.fetchValue("/absolute/bar", oListener).then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
		assert.ok(oPromise.isFulfilled());
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required), with refresh", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oPromise;

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs("myGroup", "bar", sinon.match.func, undefined)
			.callsArg(2)
			.returns(_SyncPromise.resolve("value"));
		oBinding.sRefreshGroupId = "myGroup";

		oPromise = oBinding.fetchValue("/absolute/bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});

		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (no read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs("$direct", "bar", sinon.match.func, undefined)
			// no read required! .callsArg(2)
			.returns(_SyncPromise.resolve("value"));

		return oBinding.fetchValue("/absolute/bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oExpectedError = new Error("Expected read failure"),
			oRejectedPromise = _SyncPromise.reject(oExpectedError);

		oCacheMock.expects("fetchValue")
			.withExactArgs("$direct", "foo", sinon.match.func, undefined)
			.callsArg(2).returns(oRejectedPromise);
		oCacheMock.expects("fetchValue")
			.withExactArgs("$direct", "bar", sinon.match.func, undefined)
			.returns(oRejectedPromise);
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oExpectedError});
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /absolute", sClassName, sinon.match.same(oExpectedError));

		oBinding.fetchValue("/absolute/foo").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
		return oBinding.fetchValue("/absolute/bar").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
		// TODO should we destroy oElementContext in this case?
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oNestedBinding,
			oListener = {},
			oResult = {};

		this.mock(oBinding).expects("getGroupId").never();
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("fetchValue")
			.withExactArgs("/absolute/navigation/bar", sinon.match.same(oListener))
			.returns(_SyncPromise.resolve(oResult));

		assert.strictEqual(
			oNestedBinding.fetchValue("/absolute/navigation/bar", oListener).getResult(),
			oResult);

		assert.strictEqual(this.oModel.bindContext("navigation2").fetchValue("").getResult(),
			undefined,
			"Unresolved binding: fetchValue returns _SyncPromise resolved with result undefined");
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oNestedBinding,
			oListener = {},
			sPath = "/absolute/navigation/bar",
			oResult = {};

		this.mock(oBinding).expects("getGroupId").never();
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("fetchValue").withExactArgs(sPath, sinon.match.same(oListener))
			.returns(_SyncPromise.resolve(oResult));

		assert.strictEqual(oNestedBinding.fetchValue(sPath, oListener).getResult(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/ cache, mismatch", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oNestedBinding,
			oListener = {},
			sPath = "/absolute/bar",
			oResult = {};

		this.mock(oBinding).expects("getGroupId").never();
		this.stub(ODataContextBinding.prototype, "fetchCache", function () {
			this.oCachePromise = _SyncPromise.resolve({});
		});
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext, {$$groupId : "$direct"});

		this.mock(oNestedBinding).expects("getRelativePath")
			.withExactArgs(sPath).returns(undefined);
		oContextMock.expects("fetchValue").withExactArgs(sPath, sinon.match.same(oListener))
			.returns(_SyncPromise.resolve(oResult));

		assert.strictEqual(oNestedBinding.fetchValue(sPath, oListener).getResult(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: absolute binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oListener = {};

		this.mock(oBinding.oCachePromise.getResult()).expects("deregisterChange")
			.withExactArgs("foo", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: cache is not yet available", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oCache = {
				deregisterChange : function () {}
			};

		// simulate pending cache creation
		oBinding.oCachePromise = _SyncPromise.resolve(Promise.resolve(oCache));
		this.mock(oCache).expects("deregisterChange").never();

		oBinding.deregisterChange("foo", {});

		return oBinding.oCachePromise.then();
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding resolved", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, {}, "/Products('1')"),
			oListener = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "foo")
			.returns("~foo~");
		this.mock(oContext).expects("deregisterChange")
			.withExactArgs("~foo~", sinon.match.same(oListener));

		oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext);

		oBinding.deregisterChange("foo", oListener);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding unresolved", function (assert) {
		this.oModel.bindContext("PRODUCT_2_BP")
			.deregisterChange("foo", {}); // nothing must happen
	});

	//*********************************************************************************************
	QUnit.test("events", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ContextBinding.prototype),
			mEventParameters = {},
			oReturn = {};

		oBinding = this.oModel.bindContext("SO_2_BP");

		["change", "dataRequested", "dataReceived"].forEach(function (sEvent) {
			oBindingMock.expects("attachEvent")
				.withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);

			assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});

		assert.throws(function () {
			oBinding.attachDataStateChange();
		}, new Error("Unsupported event 'DataStateChange': v4.ODataContextBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("$$groupId, $$updateGroupId", function (assert) {
		var oBinding,
			oModelMock = this.mock(this.oModel),
			mParameters = {
				$select : "ProductID",
				$apply: "filter(Amount gt 5)"
			};

		oModelMock.expects("getGroupId").withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		oModelMock.expects("buildBindingParameters").withExactArgs(mParameters,
				aAllowedBindingParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oModelMock.expects("buildBindingParameters").withExactArgs(mParameters,
				aAllowedBindingParameters)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(mParameters, aAllowedBindingParameters).returns({});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", {}, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters also called for relative binding
		oModelMock.expects("buildBindingParameters").withExactArgs(mParameters,
				aAllowedBindingParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
	});

	//*********************************************************************************************
	QUnit.test("read uses group ID", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"});

		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs("$direct", "foo", sinon.match.func, undefined)
			.returns(_SyncPromise.resolve());

		// code under test
		oBinding.fetchValue("/absolute/foo");
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
		metadata1 : [{$kind : "Function"}]
	}, {
		path : "/EntitySet/schema.OverloadedAction(...)",
		request1 : "/schema.OverloadedAction",
		metadata1 : [{$kind : "Action"}, {}],
		error : "Unsupported operation overloading: schema.OverloadedAction"
	}].forEach(function (oFixture) {
		QUnit.test("_fetchOperationMetadata: " + oFixture.path, function (assert) {
			var oBinding = this.oModel.bindContext(oFixture.path),
				oMetaModel = this.oModel.getMetaModel(),
				oMetaModelMock = this.mock(oMetaModel),
				oParentBinding,
				oPromise,
				oResult = oFixture.metadata1;

			if (oFixture.context) {
				oParentBinding = this.oModel.bindContext(oFixture.context);
				oParentBinding.initialize();
				oBinding.setContext(oParentBinding.getBoundContext());
			}
			oMetaModelMock.expects("fetchObject")
				.withExactArgs(oFixture.request1)
				.returns(Promise.resolve(oFixture.metadata1));
			if (oFixture.request2) {
				oMetaModelMock.expects("fetchObject")
					.withExactArgs(oFixture.request2)
					.returns(Promise.resolve(oFixture.metadata2));
				oResult = oFixture.metadata2;
			}

			// code under test
			oPromise = oBinding._fetchOperationMetadata();

			assert.strictEqual(oBinding._fetchOperationMetadata(), oPromise);

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
		var oBinding = this.oModel.bindContext("/FunctionImport(...)");

		this.mock(oBinding).expects("_fireChange").never();
		this.mock(this.oModel).expects("getDependentBindings").never();
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal(undefined, true);

		return oBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("function, base context, no execute", function (assert) {
		var oBaseContext = this.oModel.createBindingContext("/"),
			oBinding = this.oModel.bindContext("FunctionImport(...)", oBaseContext);

		this.mock(oBinding).expects("_fireChange").never();
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal(undefined, true);

		return oBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	[
		{bBaseContext : false, bAutoExpandSelect : false},
		{bBaseContext : false, bAutoExpandSelect : true},
		{bBaseContext : true, bAutoExpandSelect : false},
		{bBaseContext : true, bAutoExpandSelect : true}
	].forEach(function (oFixture, i) {
		QUnit.test("execute function, " + i, function (assert) {
			var oBaseContext = this.oModel.createBindingContext("/"),
				oBinding,
				oBindingMock,
				oCacheMock = this.mock(_Cache),
				oExecutePromise,
				oHelperMock = this.mock(_Helper),
				sPath = (oFixture.bBaseContext ? "" : "/") + "FunctionImport(...)",
				jQueryMock = this.mock(jQuery),
				oQueryOptions = {},
				oSingleCache = {
					hasPendingChangesForPath : function () {},
					fetchValue : function () {}
				},
				oSingleCacheMock = this.mock(oSingleCache),
				that = this;
			/*
			 * Sets up the mocks necessary for a test of execute.
			 * @param {string} sFooVar The variable part of the parameter "føø"
			 * @param {string} [sGroupId] The group ID for execute
			 */
			function mockForExecute(sFooVar, sGroupId) {
				oBindingMock.expects("_fetchOperationMetadata")
					.returns(Promise.resolve({
						$kind : "Function",
						$Parameter : [{
							$Name : "føø",
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
				oHelperMock.expects("formatLiteral")
					.withExactArgs("bãr'" + sFooVar, "Edm.String")
					.returns("'bãr''" + sFooVar + "'");
				oHelperMock.expects("formatLiteral").withExactArgs(42, "Edm.Int16").returns("42");
				jQueryMock.expects("extend")
					.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
						sinon.match.same(oBinding.mQueryOptions))
					.returns(oQueryOptions);
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(that.oModel.oRequestor),
						"FunctionImport(f%C3%B8%C3%B8='b%C3%A3r''" + sFooVar + "',p2=42)",
						sinon.match.same(oQueryOptions), oFixture.bAutoExpandSelect)
					.returns(oSingleCache);
				if (!sGroupId) {
					oBindingMock.expects("getGroupId").returns("foo");
				}
				oSingleCacheMock.expects("fetchValue")
					.withExactArgs(sGroupId || "foo").returns(_SyncPromise.resolve({}));
				oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
			}

			oCacheMock.expects("createSingle").never();
			this.oModel.bAutoExpandSelect = oFixture.bAutoExpandSelect;

			oBinding = this.oModel.bindContext(sPath, oBaseContext);
			oBindingMock = this.mock(oBinding);

			assert.strictEqual(oBinding.oOperation.bAction, undefined);

			mockForExecute("1");

			// code under test - initial, no group ID
			oExecutePromise = oBinding.setParameter("føø", "bãr'1").setParameter("p2", 42)
				.execute().then(function (oResult) {
					assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
					assert.strictEqual(oResult, undefined);
					assert.strictEqual(oBinding.oOperation.bAction, false);

					mockForExecute("2", "group");

					// code under test
					oBinding.setParameter("føø", "bãr'2");

					assert.strictEqual(oBinding.oOperation.bAction, undefined);

					// code under test - groupID given, execute creates new cache
					return oBinding.execute("group").then(function () {
						assert.strictEqual(oBinding.oOperation.bAction, false);

						oBindingMock.expects("fetchCache").never();
						oBindingMock.expects("execute").withExactArgs("refreshGroup");
						that.mock(that.oModel).expects("getDependentBindings").never();

						// code under test (as called by ODataBinding#refresh)
						oBinding.refreshInternal("refreshGroup", true);
					});
				});
			assert.ok(oExecutePromise instanceof Promise, "a Promise, not a SyncPromise");
			return oExecutePromise;
		});
	});
	// TODO function returning collection
	// TODO function overloading

	//*********************************************************************************************
	[true, false].forEach(function (bAutoExpandSelect, i) {
		QUnit.test("execute action, success, " + i, function (assert) {
			var oBinding,
				oBindingMock,
				mParameters = {},
				sPath = "/ActionImport(...)",
				mQueryOptions = {},
				oSingleCache = {
					post : function () {}
				},
				oSingleCacheMock = this.mock(oSingleCache),
				that = this;

			oBinding = this.oModel.bindContext(sPath, undefined, mParameters);
			oBindingMock = this.mock(oBinding);
			this.oModel.bAutoExpandSelect = bAutoExpandSelect;

			oBindingMock.expects("_fetchOperationMetadata").twice()
				.returns(Promise.resolve({$kind : "Action"}));
			this.mock(jQuery).expects("extend").twice()
				.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(oBinding.mQueryOptions))
				.returns(mQueryOptions);
			this.mock(_Cache).expects("createSingle").twice()
				.withExactArgs(sinon.match.same(that.oModel.oRequestor), "ActionImport",
					sinon.match.same(mQueryOptions), bAutoExpandSelect, true)
				.returns(oSingleCache);
			oBindingMock.expects("getGroupId").returns("foo");
			oSingleCacheMock.expects("post")
				.withExactArgs("foo", sinon.match.same(oBinding.oOperation.mParameters),
					undefined)
				.returns(_SyncPromise.resolve({}));
			oBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			return oBinding.execute().then(function (oResult) {
				assert.strictEqual(oResult, undefined);
				assert.strictEqual(oBinding.oOperation.bAction, true, "action detected");

				oSingleCacheMock.expects("post")
					.withExactArgs("myGroupId",
						sinon.match.same(oBinding.oOperation.mParameters), undefined)
					.returns(_SyncPromise.resolve({}));
				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});

				// code under test
				return oBinding.execute("myGroupId").then(function () {
					oBindingMock.expects("fetchCache").never();
					that.mock(that.oModel).expects("getDependentBindings").never();

					// code under test (as called by ODataBinding#refresh)
					oBinding.refreshInternal(undefined, true);

					assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache,
						"must not recreate the cache");

					// code under test
					assert.throws(function () {
						oBinding.deleteFromCache("$direct", sPath);
					}, new Error("Cannot delete a deferred operation"));
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("execute bound action, absolute binding", function (assert) {
		var oBinding = this.oModel.bindContext("/EntitySet(ID='1')/schema.Action(...)",
				{/*dummy context*/}),
			oBindingMock = this.mock(oBinding),
			oCacheMock = this.mock(_Cache),
			oPostResult = {},
			mQueryOptions = {},
			oSingleCache = {
				hasPendingChangesForPath : function () {},
				post : function () {},
				read : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache),
			that = this;

		oBindingMock.expects("_fetchOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		this.mock(jQuery).expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"EntitySet(ID='1')/schema.Action", sinon.match.same(mQueryOptions), false, true)
			.returns(oSingleCache);
		oBindingMock.expects("getGroupId").returns("groupId");
		oSingleCacheMock.expects("post")
			.withExactArgs("groupId", {"foo" : 42, "bar" : "baz"}, undefined)
			.returns(_SyncPromise.resolve(oPostResult));
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oBinding
			.setParameter("foo", 42)
			.setParameter("bar", "baz")
			.execute().then(function () {
				oBindingMock.expects("fetchCache").never();
				that.mock(that.oModel).expects("getDependentBindings").never();

				// code under test (as called by ODataBinding#refresh)
				oBinding.refreshInternal(undefined, true);

				assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache,
					"must not recreate the cache");
			});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bBaseContext) {
		["", "navigation2/navigation3"].forEach(function (sPathPrefix) {
			var sAction = sPathPrefix ? sPathPrefix + "/schema.Action" : "schema.Action",
				sBaseContext = bBaseContext ? ", baseContext" : "";

			function createContext(oModel, sPath) {
				return bBaseContext ? oModel.createBindingContext(sPath)
					: Context.create(oModel, {}, sPath);
			}

			QUnit.test("execute bound action, relative binding " + sAction + sBaseContext,
				function (assert) {
					var oBinding,
						oBindingMock,
						oCacheMock = this.mock(_Cache),
						oParentContext1 = createContext(this.oModel,
								"/EntitySet(ID='1')/navigation1"),
						oParentContext2 = createContext(this.oModel,
								"/EntitySet(ID='2')/navigation1"),
						oPostResult = {},
						mQueryOptions = {"sap-client" : "111"},
						oSingleCache = {
							deregisterChange : function () {},
							post : function () {},
							read : function () {},
							setActive : function () {}
						},
						oSingleCacheMock = this.mock(oSingleCache),
						that = this;

					oBinding = this.oModel.bindContext(sAction + "(...)", oParentContext1,
						{$$groupId : "groupId"});
					oBindingMock = this.mock(oBinding);

					// code under test - must not ask its context
					assert.strictEqual(oBinding.fetchValue().getResult(), undefined);

					oBindingMock.expects("_fetchOperationMetadata")
						.returns(_SyncPromise.resolve({$kind : "Action"}));
					if (!bBaseContext) {
						this.mock(oParentContext1).expects("fetchCanonicalPath")
							.withExactArgs()
							.returns(_SyncPromise.resolve("/EntitySet(ID='1')/navigation1"));
						this.mock(oParentContext1).expects("fetchValue")
							.withExactArgs(sPathPrefix)
							.returns(_SyncPromise.resolve(Promise.resolve({
								"@odata.etag" : "etag"
							})));
					}
					oCacheMock.expects("createSingle")
						.withExactArgs(sinon.match.same(this.oModel.oRequestor),
							"EntitySet(ID='1')/navigation1/" + sAction, mQueryOptions, false, true)
						.returns(oSingleCache);
					oSingleCacheMock.expects("post")
						.withExactArgs("groupId", {}, bBaseContext ? undefined : "etag")
						.returns(_SyncPromise.resolve(oPostResult));
					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Change});

					// code under test
					return oBinding.execute().then(function () {
						oBindingMock.expects("_fireChange")
							.withExactArgs({reason : ChangeReason.Context});

						// code under test: setContext clears the cache
						oBinding.setContext(oParentContext2);

						oBindingMock.expects("_fetchOperationMetadata")
							.returns(Promise.resolve({$kind : "Action"}));
						if (!bBaseContext) {
							that.mock(oParentContext2).expects("fetchCanonicalPath")
								.withExactArgs()
								.returns(Promise.resolve("/EntitySet(ID='2')/navigation1"));
							that.mock(oParentContext2).expects("fetchValue")
								.withExactArgs(sPathPrefix)
								.returns(_SyncPromise.resolve(Promise.resolve({}))); // no ETag
						}
						oCacheMock.expects("createSingle")
							.withExactArgs(sinon.match.same(that.oModel.oRequestor),
								"EntitySet(ID='2')/navigation1/" + sAction, mQueryOptions, false,
								true)
							.returns(oSingleCache);
						oSingleCacheMock.expects("post")
							.withExactArgs("groupId", {"foo" : "bar"}, undefined)
							.returns(_SyncPromise.resolve(oPostResult));
						oBindingMock.expects("_fireChange")
							.withExactArgs({reason : ChangeReason.Change});

						// code under test: execute creates a new cache with the new path
						return oBinding.setParameter("foo", "bar").execute();
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, failure", function (assert) {
		var sPath = "/ActionImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oCacheMock = this.mock(_Cache),
			oPostError = new Error("deliberate failure"),
			oSingleCache = {
				post : function () {}
			};

		this.mock(oBinding).expects("_fetchOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.mock(oBinding).expects("getGroupId").returns("groupId");
		this.mock(oSingleCache).expects("post")
			.withExactArgs("groupId", sinon.match.same(oBinding.oOperation.mParameters),
				undefined)
			.returns(Promise.reject(oPostError));
		this.mock(oBinding).expects("_fireChange").never();
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oPostError));

		// code under test
		return oBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oPostError);
			assert.strictEqual(oBinding.oOperation.bAction, true, "action detected");
		});
	});

	//*********************************************************************************************
	QUnit.test("execute action, error in change handler", function (assert) {
		var sPath = "/ActionImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oCacheMock = this.mock(_Cache),
			oChangeHandlerError = new Error("deliberate failure"),
			oSingleCache = {
				post : function () {
					return Promise.resolve();
				}
			};

		this.mock(oBinding).expects("_fetchOperationMetadata")
			.returns(Promise.resolve({$kind : "Action"}));
		oCacheMock.expects("createSingle")
			.withArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport")
			.returns(oSingleCache);
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oChangeHandlerError));

		oBinding.attachChange(function () {
			throw oChangeHandlerError;
		});

		// code under test
		return oBinding.execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError, oChangeHandlerError);
			assert.strictEqual(oBinding.oOperation.bAction, true, "action detected");
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: invalid group ID", function (assert) {
		var oBinding = this.oModel.bindContext("/Function(...)"),
			oError = new Error("Invalid");

		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.execute("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("execute, unresolved relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("schema.Action(...)");

		assert.throws(function () {
			oBinding.execute();
		}, new Error("Unresolved binding: schema.Action(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute, relative binding with deferred parent", function (assert) {
		var oBinding,
			oParentBinding = this.oModel.bindContext("/FunctionImport(...)");

		oParentBinding.initialize();
		oBinding = this.oModel.bindContext("schema.Action(...)",
			oParentBinding.getBoundContext());

		assert.throws(function () {
			oBinding.execute();
		}, new Error("Nested deferred operation bindings not supported: "
			+ "/FunctionImport(...)/schema.Action(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute, relative binding on transient context", function (assert) {
		var oBinding,
			oContext = {
				isTransient : function () { return true;},
				getPath: function () { return "/Employees/-1";}
			};

		oBinding = this.oModel.bindContext("schema.Action(...)", oContext);

		assert.throws(function () {
			// code under test
			oBinding.execute();
		}, new Error("Execute for transient context not allowed: "
				+ "/Employees/-1/schema.Action(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute: collection parameter", function (assert) {
		var sPath = "/FunctionImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			sMessage = "Unsupported: collection parameter";

		this.mock(oBinding).expects("_fetchOperationMetadata")
			.returns(Promise.resolve({$Parameter : [{$Name : "foo", $IsCollection : true}]}));
		this.mock(_Cache).expects("createSingle").never();
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match(function (oError) {
				return oError.message === sMessage;
			}));

		// code under test
		return oBinding.setParameter("foo", [42]).execute().then(function () {
			assert.ok(false);
		}, function (oError) {
			assert.strictEqual(oError.message, sMessage);
		});
	});

	//*********************************************************************************************
	QUnit.test("setParameter, execute: not deferred", function (assert) {
		var oBinding = this.oModel.bindContext("/Function()");

		assert.throws(function () {
			oBinding.setParameter();
		}, new Error("The binding must be deferred: /Function()"));
		assert.throws(function () {
			oBinding.execute();
		}, new Error("The binding must be deferred: /Function()"));
	});

	//*********************************************************************************************
	QUnit.test("composable function", function (assert) {
		assert.throws(function () {
			this.oModel.bindContext("/Function(...)/Property");
		}, new Error("The path must not continue after a deferred operation: "
			+ "/Function(...)/Property"));
	});

	//*********************************************************************************************
	QUnit.test("setParameter: undefined", function (assert) {
		var oBinding = this.oModel.bindContext("/Function(...)");
		assert.throws(function () {
			oBinding.setParameter("foo", undefined);
		}, new Error("Missing value for parameter: foo"));
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding = this.oModel.bindContext("relative"),
			oBindingMock = this.mock(ContextBinding.prototype),
			oContext = Context.create(this.oModel, {}, "/foo"),
			oModelMock = this.mock(this.oModel);

		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();

		oBinding = this.oModel.bindContext("relative");
		oBinding.setContext(oContext);
		this.mock(oBinding.oElementContext).expects("destroy").withExactArgs();
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.oCachePromise, undefined);
		assert.strictEqual(oBinding.oContext, undefined,
			"context removed as in ODPropertyBinding#destroy");

		oBinding = this.oModel.bindContext("/absolute", oContext);
		this.mock(oBinding.oElementContext).expects("destroy").withExactArgs();
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("_delete: empty path -> delegate to parent context", function (assert) {
		var oBinding = this.oModel.bindContext(""),
			oContext = Context.create(this.oModel, null, "/SalesOrders/7"),
			oResult = {};

		oBinding.setContext(oContext);
		this.mock(oContext).expects("delete").withExactArgs("myGroup").returns(oResult);

		assert.strictEqual(oBinding._delete("myGroup", "SalesOrders('42')"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_delete: empty path, base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/SalesOrders('42')"),
			oBinding = this.oModel.bindContext("", oContext);

		this.mock(oBinding).expects("deleteFromCache");

		// code under test
		oBinding._delete("myGroup", "SalesOrders('42')");
	});

	//*********************************************************************************************
	QUnit.test("_delete: success", function (assert) {
		var oBinding = this.oModel.bindContext("/EMPLOYEES('42')"),
			oElementContext = oBinding.getBoundContext(),
			fnOnRefresh = sinon.spy(function (oEvent) {
				var oElementContext = oBinding.getBoundContext();

				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
				assert.strictEqual(oElementContext.getBinding(), oBinding);
				assert.strictEqual(oElementContext.getIndex(), undefined);
				assert.strictEqual(oElementContext.getModel(), this.oModel);
				assert.strictEqual(oElementContext.getPath(), "/EMPLOYEES('42')");
			}),
			fnOnRemove = sinon.spy(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Remove);
				assert.strictEqual(oBinding.getBoundContext(), null);
				sinon.assert.called(oElementContext.destroy, "already destroyed");
			}),
			oPromise = {};

		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs("myGroup", "EMPLOYEES('42')", "", sinon.match.func)
			.callsArg(3).returns(oPromise);
		oBinding.attachChange(fnOnRemove);
		this.spy(oElementContext, "destroy");

		// code under test
		assert.strictEqual(oBinding._delete("myGroup", "EMPLOYEES('42')"), oPromise);

		sinon.assert.calledOnce(fnOnRemove);
		oBinding.detachChange(fnOnRemove);
		oBinding.attachChange(fnOnRefresh);

		// code under test
		oBinding.refreshInternal();
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal", function (assert) {
		var oCache = {},
			oBinding,
			oContext = Context.create(this.oModel, {}, "/EMPLOYEE('42')"),
			oChild0 = {
				refreshInternal : function () {}
			},
			oChild1 = {
				refreshInternal : function () {}
			},
			bCheckUpdate = {/*true or false*/};

		this.stub(ODataContextBinding.prototype, "fetchCache", function (oContext0) {
			// Note: c'tor calls this.applyParameters() before this.setContext()
			this.oCachePromise = _SyncPromise.resolve(oContext0 ? oCache : undefined);
		});
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM", oContext, {"foo" : "bar"});
		oBinding.mCacheByContext = {};
		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild0, oChild1]);
		this.mock(oChild0).expects("refreshInternal")
			.withExactArgs("myGroup", sinon.match.same(bCheckUpdate));
		this.mock(oChild1).expects("refreshInternal")
			.withExactArgs("myGroup", sinon.match.same(bCheckUpdate));

		//code under test
		oBinding.refreshInternal("myGroup", bCheckUpdate);

		assert.deepEqual(oBinding.mCacheByContext, undefined);
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("refreshInternal, bAction=" + bAction, function (assert) {
			var oBinding = this.oModel.bindContext("/FunctionImport(...)");

			oBinding.oCachePromise = _SyncPromise.resolve({});
			oBinding.oOperation.bAction = bAction;

			this.mock(this.oModel).expects("getDependentBindings").never();
			this.mock(oBinding).expects("execute").exactly(bAction === false ? 1 : 0)
				.withExactArgs("myGroup");

			//code under test
			oBinding.refreshInternal("myGroup");
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: no cache", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.oModel.bindContext("TEAM_2_EMPLOYEE", oContext),
			oChild0 = {
				refreshInternal : function () {}
			},
			oChild1 = {
				refreshInternal : function () {}
			},
			bCheckUpdate = {/*true or false*/};

		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding)).returns([oChild0, oChild1]);
		this.mock(oChild0).expects("refreshInternal")
			.withExactArgs("myGroup", sinon.match.same(bCheckUpdate));
		this.mock(oChild1).expects("refreshInternal")
			.withExactArgs("myGroup", sinon.match.same(bCheckUpdate));

		//code under test
		oBinding.refreshInternal("myGroup", bCheckUpdate);

	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: deleted relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("relative", Context.create(this.oModel, {}, "/foo")),
			fnOnRefresh = sinon.spy(function (oEvent) {
				var oElementContext = oBinding.getBoundContext();

				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
				assert.strictEqual(oElementContext.getBinding(), oBinding);
				assert.strictEqual(oElementContext.getIndex(), undefined);
				assert.strictEqual(oElementContext.getModel(), this.oModel);
				assert.strictEqual(oElementContext.getPath(), "/foo/relative");
			});

		oBinding.oElementContext = null; // simulate a delete
		oBinding.attachChange(fnOnRefresh);

		// code under test
		oBinding.refreshInternal();

		sinon.assert.calledOnce(fnOnRefresh);
	});

	//*********************************************************************************************
	QUnit.test("_delete: pending changes", function (assert) {
		var oBinding = this.oModel.bindContext("/EMPLOYEES('42')");

		this.mock(oBinding).expects("hasPendingChanges").withExactArgs().returns(true);
		this.mock(oBinding).expects("deleteFromCache").never();
		this.mock(oBinding).expects("_fireChange").never();

		assert.throws(function () {
			oBinding._delete("myGroup", "EMPLOYEES('42')");
		}, new Error("Cannot delete due to pending changes"));
	});

	//*********************************************************************************************
	QUnit.test("doFetchQueryOptions", function (assert) {
		var oBinding = this.oModel.bindContext("foo");

		// code under test
		assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), {});

		oBinding = this.oModel.bindContext("foo", undefined, {"$expand" : "bar"});

		// code under test
		assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), {"$expand" : {"bar" : {}}});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bAutoExpandSelect, i) {
		QUnit.test("doCreateCache, " + i, function (assert) {
			var oBinding = this.oModel.bindContext("/EMPLOYEES('1')"),
				oCache = {},
				mCacheQueryOptions = {};

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;

			this.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES('1')",
					sinon.match.same(mCacheQueryOptions), bAutoExpandSelect)
				.returns(oCache);

			// code under test
			assert.strictEqual(oBinding.doCreateCache("EMPLOYEES('1')", mCacheQueryOptions),
				oCache);
		});
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
				oBinding = oModel.bindContext("EMPLOYEE_2_TEAM/" +
					"com.sap.gateway.default.iwbep.tea_busi.v0001.AcChangeManagerOfTeam(...)"),
				oParentBinding = oModel.bindContext("/EMPLOYEES('1')", null,
					{$expand : "EMPLOYEE_2_TEAM"});

			// ensure object of bound action is loaded
			return oParentBinding.getBoundContext().requestObject().then(function () {
				oBinding.setContext(oParentBinding.getBoundContext());
				return oBinding.setParameter("ManagerID", "3").execute();
			});
		});
	}
});