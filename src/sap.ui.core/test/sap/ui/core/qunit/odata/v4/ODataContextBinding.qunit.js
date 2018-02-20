/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, SyncPromise, Binding, ChangeReason, ContextBinding, Context,
		_Cache, _Helper, ODataContextBinding, ODataModel, asODataParentBinding, TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$groupId", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({
				serviceUrl : "/service/?sap-client=111",
				synchronizationMode : "None"
			});
			this.oRequestorMock = this.mock(this.oModel.oRequestor);
			// ensure that the requestor does not trigger requests
			this.oRequestorMock.expects("request").never();
			// avoid that the cache requests actual metadata for faked responses
			this.mock(this.oModel.oRequestor).expects("fetchTypeForPath").atLeast(0)
				.returns(SyncPromise.resolve({}));
		}
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function (assert) {
		var oBinding,
			oExpectation = this.mock(this.oModel).expects("bindingCreated")
				.withExactArgs(sinon.match.object);

		oBinding = this.oModel.bindContext("/EMPLOYEES('42')");

		sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var oBinding = this.oModel.bindContext("/EMPLOYEES('42')");

		assert.ok(oBinding.hasOwnProperty("oCachePromise"));
		assert.ok(oBinding.hasOwnProperty("mCacheByContext"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("oOperation"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
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
		this.mock(oBinding).expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCachePromise = SyncPromise.resolve({});
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
		var sTitle = "applyParameters: operation binding, bAction: " + bAction;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.oModel.bindContext("/OperationImport(...)"),
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
				this.mock(oBinding).expects("fetchCache")
					.withExactArgs(sinon.match.same(oTargetContext))
					.callsFake(function () {
						this.oCachePromise = SyncPromise.resolve(oTargetCache);
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
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve(oContext ? oCache : undefined);
			});

		//code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

		oCache = undefined;
		oContext = undefined;

		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCachePromise = SyncPromise.resolve();
		});

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

		this.mock(ODataContextBinding.prototype).expects("fetchCache").withExactArgs(undefined)
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve(oCache);
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
				undefined, sinon.match.func, undefined, "/EMPLOYEES")
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
			.returns(SyncPromise.resolve("value"));

		oPromise = oBinding.fetchValue("/absolute/bar", oListener).then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
		assert.ok(oPromise.isFulfilled());
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (no read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs("group", "bar", sinon.match.func, undefined)
			// no read required! .callsArg(2)
			.returns(SyncPromise.resolve("value"));

		// code under test
		return oBinding.fetchValue("/absolute/bar", undefined, "group").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oExpectedError = new Error("Expected read failure"),
			oRejectedPromise = SyncPromise.reject(oExpectedError);

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
			sPath = "/absolute/navigation/bar",
			oResult = {};

		this.mock(oBinding).expects("getGroupId").never();
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oContextMock.expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), "group")
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oNestedBinding.fetchValue(sPath, oListener, "group").getResult(),
			oResult);

		assert.strictEqual(this.oModel.bindContext("navigation2").fetchValue("").getResult(),
			undefined,
			"Unresolved binding: fetchValue returns SyncPromise resolved with result undefined");
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/ cache, mismatch", function (assert) {
		var oBinding,
			oContext = {
				fetchValue : function () {},
				getPath : function () {return "/absolute";}
			},
			oListener = {},
			sPath = "/absolute/bar",
			oResult = {};

		this.mock(ODataContextBinding.prototype).expects("fetchCache").atLeast(1)
			.callsFake(function (oContext0) {
				this.oCachePromise = SyncPromise.resolve(oContext0 ? {} : undefined);
		});
		oBinding = this.oModel.bindContext("navigation", oContext, {$$groupId : "$direct"});
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs(sPath).returns(undefined);
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), "group")
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.fetchValue(sPath, oListener, "group").getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: suspended root binding", function (assert) {
		var oBinding = this.oModel.bindContext("~path~"),
			oRootBinding = {isSuspended : function () {}};

		this.mock(oBinding).expects("getRootBinding").withExactArgs().returns(oRootBinding);
		this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(true);

		assert.throws(function () {
			// code under test
			oBinding.fetchValue("~path~/bar");
		}, function (oError) {
			assert.strictEqual(oError.message, "Suspended binding provides no value");
			assert.strictEqual(oError.canceled, "noDebugLog");
			return true;
		}, "expect canceled error");
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
		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
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
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.fetchValue("/absolute/foo");
	});

	//*********************************************************************************************
	[{
		path : "/Unknown(...)",
		request : "/Unknown/@$ui5.overload",
		metadata : undefined,
		error : "Unknown operation: /Unknown(...)"
	}, {
		path : "/EntitySet(ID='1')/schema.EmptyOverloads(...)",
		request : "/EntitySet/schema.EmptyOverloads/@$ui5.overload",
		metadata : [],
		error : "Unsupported overloads for /EntitySet(ID='1')/schema.EmptyOverloads(...)"
	}, {
		path : "/EntitySet(ID='1')/schema.OverloadedFunction(...)",
		request : "/EntitySet/schema.OverloadedFunction/@$ui5.overload",
		metadata : [{$kind : "Function"}, {$kind : "Function"}],
		error : "Unsupported overloads for /EntitySet(ID='1')/schema.OverloadedFunction(...)"
	}].forEach(function (oFixture) {
		QUnit.test("execute: " + oFixture.error, function (assert) {
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs(oFixture.request)
				.returns(Promise.resolve(oFixture.metadata));
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to execute " + oFixture.path, sClassName, sinon.match.instanceOf(Error));

			return this.oModel.bindContext(oFixture.path)
				.execute() // code under test
				.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.message, oFixture.error);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("function, no execute", function (assert) {
		var oBinding, oBindingMock, oCachePromise;

		this.mock(_Cache).expects("createSingle").never();
		oBinding = this.oModel.bindContext("/FunctionImport(...)");

		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);
		oCachePromise = oBinding.oCachePromise;
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_fireChange").never();
		oBindingMock.expects("fetchCache").never();
		this.mock(this.oModel).expects("getDependentBindings").never();

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal(undefined, true);

		assert.strictEqual(oBinding.oCachePromise, oCachePromise, "must not recreate the cache");

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
	[false, true].forEach(function (bRelative) {
		var sTitle = "execute: OperationImport, relative (to base context): " + bRelative;

		QUnit.test(sTitle, function (assert) {
			var oBaseContext = this.oModel.createBindingContext("/"),
				sGroupId = "group",
				oOperationMetadata = {},
				sPath = (bRelative ? "" : "/") + "OperationImport(...)",
				oPromise,
				oBinding = this.oModel.bindContext(sPath, oBaseContext),
				oBindingMock = this.mock(oBinding),
				oModelMock = this.mock(this.oModel),
				that = this;

			function expectChangeAndRefreshDependent() {
				var oChild0 = {
						refreshInternal : function () {}
					},
					oChild1 = {
						refreshInternal : function () {}
					};

				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});
				oModelMock.expects("getDependentBindings")
					.withExactArgs(sinon.match.same(oBinding)).returns([oChild0, oChild1]);
				that.mock(oChild0).expects("refreshInternal").withExactArgs(sGroupId, true);
				that.mock(oChild1).expects("refreshInternal").withExactArgs(sGroupId, true);
			}

			oBindingMock.expects("checkSuspended").withExactArgs();
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/OperationImport/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			oBindingMock.expects("createCacheAndRequest").withExactArgs(sGroupId,
					"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
				.returns(SyncPromise.resolve({/*oResult*/}));
			expectChangeAndRefreshDependent();

			// code under test
			oPromise = oBinding.execute(sGroupId);

			assert.ok(oPromise instanceof Promise, "a Promise, not a SyncPromise");
			return oPromise.then(function (oResult) {
				assert.strictEqual(oResult, undefined);
			});
		});
	});
	// TODO function returning collection
	// TODO function overloads

	//*********************************************************************************************
	[false, true].forEach(function (bBaseContext) {
		["", "navigation2/navigation3"].forEach(function (sPathPrefix) {
			var sOperation = sPathPrefix ? sPathPrefix + "/schema.Operation" : "schema.Operation",
				sTitle = "execute: bound operation, relative binding " + sOperation
					+ (bBaseContext ? ", baseContext" : "");

			QUnit.test(sTitle, function (assert) {
				var that = this,
					oEntity = {},
					oExpectation,
					sGroupId = "group",
					oOperationMetadata = {},
					oRootBinding = {
						getRootBinding : function () { return oRootBinding; },
						isSuspended : function () { return false; }
					},
					oParentContext1 = createContext("/EntitySet(ID='1')/navigation1"),
					oParentContext2 = createContext("/EntitySet(ID='2')/navigation1"),
					oBinding = this.oModel.bindContext(sOperation + "(...)", oParentContext1,
						{$$groupId : "groupId"}),
					oBindingMock = this.mock(oBinding),
					oModelMock = this.mock(this.oModel);

				function createContext(sPath) {
					return bBaseContext
						? that.oModel.createBindingContext(sPath)
						: Context.create(that.oModel, oRootBinding, sPath);
				}

				function expectChangeAndRefreshDependent() {
					var oChild0 = {
							refreshInternal : function () {}
						},
						oChild1 = {
							refreshInternal : function () {}
						};

					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Change});
					oModelMock.expects("getDependentBindings")
						.withExactArgs(sinon.match.same(oBinding)).returns([oChild0, oChild1]);
					that.mock(oChild0).expects("refreshInternal").withExactArgs(sGroupId, true);
					that.mock(oChild1).expects("refreshInternal").withExactArgs(sGroupId, true);
				}

				this.mock(this.oModel.getMetaModel()).expects("fetchObject").twice()
					.withExactArgs("/EntitySet/navigation1/" + sOperation + "/@$ui5.overload")
					.returns(SyncPromise.resolve([oOperationMetadata]));

				// code under test - must not ask its context
				assert.strictEqual(oBinding.fetchValue().getResult(), undefined);

				if (bBaseContext) {
					oBindingMock.expects("createCacheAndRequest").withExactArgs(sGroupId,
						"/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
						sinon.match.same(oOperationMetadata), undefined);
				} else {
					oExpectation = oBindingMock.expects("createCacheAndRequest").withExactArgs(
						sGroupId, "/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
						sinon.match.same(oOperationMetadata), sinon.match.func);
					this.mock(oParentContext1).expects("getObject").on(oParentContext1)
						.withExactArgs(sPathPrefix).returns(oEntity);
				}
				expectChangeAndRefreshDependent();

				// code under test
				return oBinding.execute(sGroupId).then(function () {
					if (oExpectation) {
						//TODO avoid to trigger a request via getObject, which does not wait for
						// results anyway!
						assert.strictEqual(oExpectation.args[0][3](), oEntity);
					}

					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Context});
					oModelMock.expects("getDependentBindings").returns([]); // @see Context#destroy

					// code under test: setContext clears the cache
					oBinding.setContext(oParentContext2);

					if (bBaseContext) {
						oBindingMock.expects("createCacheAndRequest").withExactArgs(sGroupId,
							"/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), undefined);
					} else {
						oExpectation = oBindingMock.expects("createCacheAndRequest").withExactArgs(
							sGroupId, "/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), sinon.match.func);
						that.mock(oParentContext2).expects("getObject").on(oParentContext2)
							.withExactArgs(sPathPrefix).returns(oEntity);
					}
					expectChangeAndRefreshDependent();
					oBindingMock.expects("getGroupId").returns(sGroupId);

					// code under test: execute creates a new cache with the new path
					return oBinding.setParameter("foo", "bar").execute()
						.then(function () {
							if (oExpectation) {
								assert.strictEqual(oExpectation.args[0][3](), oEntity);
							}
						});
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: OperationImport, failure", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs("group",
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.reject(oError));
		oBindingMock.expects("_fireChange").never();
		oModelMock.expects("getDependentBindings").never();
		oModelMock.expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oError));

		// code under test
		return oBinding.execute("group").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: OperationImport, error in change handler", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs("group",
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.resolve({/*oResult*/}));
		oModelMock.expects("getDependentBindings").never();
		oModelMock.expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oError));

		oBinding.attachChange(function () {
			throw oError;
		});

		// code under test
		return oBinding.execute("group").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: invalid group ID", function (assert) {
		var oBinding = this.oModel.bindContext("/OperationImport(...)"),
			oError = new Error("Invalid");

		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.execute("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("execute: unresolved relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("schema.Operation(...)");

		assert.throws(function () {
			oBinding.execute();
		}, new Error("Unresolved binding: schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute: relative binding with deferred parent", function (assert) {
		var oBinding,
			oParentBinding = this.oModel.bindContext("/OperationImport(...)");

		oParentBinding.initialize();
		oBinding = this.oModel.bindContext("schema.Operation(...)",
			oParentBinding.getBoundContext());

		assert.throws(function () {
			oBinding.execute();
		}, new Error("Nested deferred operation bindings not supported: "
			+ "/OperationImport(...)/schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute: relative binding on transient context", function (assert) {
		var oBinding,
			oContext = {
				isTransient : function () { return true;},
				getPath: function () { return "/Employees/-1";}
			};

		oBinding = this.oModel.bindContext("schema.Operation(...)", oContext);

		assert.throws(function () {
			// code under test
			oBinding.execute();
		}, new Error("Execute for transient context not allowed: "
				+ "/Employees/-1/schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: FunctionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			sGroupId = "group",
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Function"},
			mParameters = {},
			sPath = "/FunctionImport(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "FunctionImport()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParameters),
				sinon.match.same(mQueryOptions), undefined)
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), false,
				"/FunctionImport/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue").withExactArgs("group").returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(sGroupId, sPath, oOperationMetadata),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound function", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			fnGetEntity = {}, // do not call!
			sGroupId = "group",
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Function"},
			mParameters = {},
			sPath = "/Entity('1')/navigation/bound.Function(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "Entity('1')/navigation/bound.Function()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParameters),
				sinon.match.same(mQueryOptions), sinon.match.same(fnGetEntity))
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue").withExactArgs("group").returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(sGroupId, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: ActionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			sGroupId = "group",
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Action"},
			mParameters = {},
			sPath = "/ActionImport(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "ActionImport",
			oSingleCache = {
				post : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParameters),
				sinon.match.same(mQueryOptions), undefined)
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), true,
				"/ActionImport/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("post")
			.withExactArgs("group", sinon.match.same(mParameters), undefined)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(sGroupId, sPath, oOperationMetadata),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, true);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound action", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			oEntity = {"@odata.etag" : "ETag"},
			fnGetEntity = this.spy(function () {
				return oEntity;
			}),
			sGroupId = "group",
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Action"},
			mParameters = {},
			sPath = "/Entity('1')/navigation/bound.Action(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "Entity('1')/navigation/bound.Action",
			oSingleCache = {
				post : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		oJQueryMock.expects("extend").withExactArgs({},
				sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParameters),
				sinon.match.same(mQueryOptions), sinon.match.same(oEntity))
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), true,
				"/Entity/navigation/bound.Action/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("post")
			.withExactArgs("group", sinon.match.same(mParameters), "ETag")
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(sGroupId, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, true);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(fnGetEntity.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: wrong $kind", function (assert) {
		var oBinding = this.oModel.bindContext("n/a(...)");

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest("group", "/OperationImport(...)", {$kind : "n/a"});
		}, new Error("Not an operation: /OperationImport(...)"));
	});

	//*********************************************************************************************
	QUnit.test("setParameter, execute: not deferred", function (assert) {
		var oBinding = this.oModel.bindContext("/OperationImport()");

		assert.throws(function () {
			oBinding.setParameter();
		}, new Error("The binding must be deferred: /OperationImport()"));
		assert.throws(function () {
			oBinding.execute();
		}, new Error("The binding must be deferred: /OperationImport()"));
	});

	//*********************************************************************************************
	QUnit.test("composable function", function (assert) {
		assert.throws(function () {
			this.oModel.bindContext("/OperationImport(...)/Property");
		}, new Error("The path must not continue after a deferred operation: "
			+ "/OperationImport(...)/Property"));
	});

	//*********************************************************************************************
	QUnit.test("setParameter: undefined", function (assert) {
		var oBinding = this.oModel.bindContext("/OperationImport(...)");

		// Note: don't really care about non-identifiers, but <code>null</code> must be protected
		[null, undefined, ""].forEach(function (sParameterName) {
			assert.throws(function () {
				oBinding.setParameter(sParameterName, "foo");
			}, new Error("Missing parameter name"));
		});
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
			fnOnRefresh = this.spy(function (oEvent) {
				var oElementContext = oBinding.getBoundContext();

				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
				assert.strictEqual(oElementContext.getBinding(), oBinding);
				assert.strictEqual(oElementContext.getIndex(), undefined);
				assert.strictEqual(oElementContext.getModel(), this.oModel);
				assert.strictEqual(oElementContext.getPath(), "/EMPLOYEES('42')");
			}),
			fnOnRemove = this.spy(function (oEvent) {
				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Remove);
				assert.strictEqual(oBinding.getBoundContext(), null);
				sinon.assert.called(oElementContext.destroy);
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
			oBindingMock = this.mock(ODataContextBinding.prototype),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEE('42')"),
			oChild0 = {
				refreshInternal : function () {}
			},
			oChild1 = {
				refreshInternal : function () {}
			},
			bCheckUpdate = {/*true or false*/};

		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			// Note: c'tor calls this.applyParameters() before this.setContext()
			this.oCachePromise = SyncPromise.resolve();
		});
		oBindingMock.expects("fetchCache").atLeast(1).withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve(oCache);
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

			oBinding.oCachePromise = SyncPromise.resolve({});
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
			fnOnRefresh = this.spy(function (oEvent) {
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
	QUnit.test("resumeInternal", function (assert) {
		var bCheckUpdate = {/* true or false */},
			oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.oModel.bindContext("TEAM_2_EMPLOYEE", oContext),
			oBindingMock = this.mock(oBinding),
			oDependent0 = {resumeInternal : function () {}},
			oDependent1 = {resumeInternal : function () {}},
			oFetchCacheExpectation,
			oFireChangeExpectation,
			oResumeInternalExpectation0,
			oResumeInternalExpectation1;

		oFetchCacheExpectation = oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			// check correct sequence: on fetchCache call, aggregated query options must be reset
			.callsFake(function () {
				assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
				assert.strictEqual(oBinding.mCacheByContext, undefined);
			});
		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns([oDependent0, oDependent1]);
		oResumeInternalExpectation0 = this.mock(oDependent0).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate));
		oResumeInternalExpectation1 = this.mock(oDependent1).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate));
		oFireChangeExpectation = oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});
		oBinding.mAggregatedQueryOptions = {$select : ["Team_Id"]};
		oBinding.mCacheByContext = {};

		// code under test
		oBinding.resumeInternal(bCheckUpdate);

		assert.ok(oResumeInternalExpectation0.calledAfter(oFetchCacheExpectation));
		assert.ok(oResumeInternalExpectation1.calledAfter(oFetchCacheExpectation));
		assert.ok(oFireChangeExpectation.calledAfter(oResumeInternalExpectation1));
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("resumeInternal: operation binding, bAction=" + bAction, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
				oBinding = this.oModel.bindContext("name.space.Operation(...)", oContext),
				oBindingMock = this.mock(oBinding);

			oBinding.oOperation.bAction = bAction;

			oBindingMock.expects("fetchCache").never();
			this.mock(this.oModel).expects("getDependentBindings").never();
			oBindingMock.expects("_fireChange").never();
			oBindingMock.expects("execute").exactly(bAction === false ? 1 : 0).withExactArgs();

			// code under test
			oBinding.resumeInternal();
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