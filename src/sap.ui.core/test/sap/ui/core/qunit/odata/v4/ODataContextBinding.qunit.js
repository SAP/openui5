/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/_ODataHelper",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_SyncPromise",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, Binding, ChangeReason, ContextBinding, _ODataHelper, Context,
		_Cache, _Helper, _SyncPromise, ODataContextBinding, ODataModel, TestUtils) {
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
			oBinding2 = this.oModel.bindContext("Employee_2_Team");

		assert.strictEqual(oBinding1.toString(), sClassName + ": /Employees(ID='1')", "absolute");

		assert.strictEqual(oBinding2.toString(), sClassName + ": undefined|Employee_2_Team",
			"relative, unresolved");

		oBinding2 = this.oModel.bindContext("Employee_2_Team",
			Context.create(this.oModel, /*oBinding*/{}, "/Employees", 1));

		assert.strictEqual(oBinding2.toString(), sClassName
			+ ": /Employees[1]|Employee_2_Team", "relative, resolved");
	});

	//*********************************************************************************************
	QUnit.test("initialize, resolved path", function (assert) {
		var oContext = Context.create(this.oModel, /*oBinding*/{}, "/Employees", 1),
			oBinding = this.oModel.bindContext("foo", oContext);

		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		assert.strictEqual(oBinding.initialize(), undefined, "no chaining");
	});

	//*********************************************************************************************
	QUnit.test("initialize, unresolved path", function () {
		var oBinding = this.oModel.bindContext("foo");

		this.mock(oBinding).expects("_fireChange").never();

		oBinding.initialize();
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
		this.mock(Context).expects("create")
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
	QUnit.test("setContext, relative path with parameters", function (assert) {
		var oBinding = this.oModel.bindContext("TEAM_2_MANAGER", null, {$select : "Name"}),
			oCache = {
				deregisterChange : function () {}
			},
			sCanonicalPath = "/TEAMS(Team_Id='4711')",
			oCacheProxy = {
				promise : Promise.resolve(oCache)
			},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1),
			oPathPromise = Promise.resolve(sCanonicalPath),
			that = this;

		this.mock(_Helper).expects("buildPath")
			.withExactArgs(sCanonicalPath.slice(1), "TEAM_2_MANAGER").returns("~path~");
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "~path~", {
					$select: ["Name"],
					"sap-client" : "111"
				})
			.returns(oCache);
		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		this.mock(_ODataHelper).expects("createCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.func,
				sinon.match.same(oPathPromise))
			.callsArgWith(1, sCanonicalPath)
			.returns(oCacheProxy);

		//code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCache, oCacheProxy);

		return oCacheProxy.promise.then(function (oCache) {
			assert.strictEqual(oBinding.oCache, oCache);

			_ODataHelper.createCacheProxy.restore();
			that.mock(_ODataHelper).expects("createCacheProxy").never();
			that.mock(oCache).expects("deregisterChange").withExactArgs();

			// code under test
			oBinding.setContext();

			assert.strictEqual(oBinding.oCache, undefined,
				"cache must not be created because context is undefined");
		});
	});

	//*********************************************************************************************
	QUnit.test("setContext, relative path w/ parameters, proxy promise rejects", function (assert) {
		var oBinding = this.oModel.bindContext("TEAM_2_MANAGER", null, {$select : "Name"}),
			oError = new Error("Failed to compute canonical path..."),
			oCacheProxy = {
				promise : Promise.reject(oError)
			},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1),
			oPathPromise = Promise.reject(oError);

		this.mock(_Cache).expects("createSingle").never();
		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		this.mock(_ODataHelper).expects("createCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.func,
				sinon.match.same(oPathPromise))
			.returns(oCacheProxy);
		this.mock(oBinding.oModel).expects("reportError")
			.withExactArgs(
				"Failed to create cache for binding " +
					"sap.ui.model.odata.v4.ODataContextBinding: /TEAMS[1]|TEAM_2_MANAGER",
				"sap.ui.model.odata.v4.ODataContextBinding",
				sinon.match.same(oError)
			);

		//code under test
		oBinding.setContext(oContext);

		return oCacheProxy.promise.catch(function (oError0) {
			assert.strictEqual(oError0, oError);
		});
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
	["/EMPLOYEES(ID='1')", "TEAM_2_MANAGER", ""].forEach(function (sPath) {
		QUnit.test("bindContext w/o parameters, sPath = '" + sPath + "'", function (assert) {
			var bAbsolute = sPath[0] === "/",
				oCache = {},
				oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
				oBinding;

			this.mock(_Cache).expects("createSingle")
				.exactly(bAbsolute ? 1 : 0)
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1), {
					"sap-client" : "111"
				}).returns(oCache);

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
			assert.strictEqual(oBinding.hasOwnProperty("mCacheByContext"), true);
			assert.strictEqual(oBinding.mCacheByContext, undefined);
		});
	});

	//*********************************************************************************************
	["/EMPLOYEES(ID='1')", "EMPLOYEE_2_TEAM(Team_Id='4711')"].forEach(function (sPath) {
		QUnit.test("bindContext with parameters, path " + sPath, function (assert) {
			var oBinding,
				oHelperMock,
				mParameters = {},
				mQueryOptions = {};

			oHelperMock = this.mock(_ODataHelper);
			oHelperMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(this.oModel.mUriParameters),
					sinon.match.same(mParameters),
					["$expand", "$filter", "$orderby", "$select"])
				.returns(mQueryOptions);
			oHelperMock.expects("buildBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
				.returns({$$groupId : "group", $$updateGroupId : "updateGroup"});
			this.mock(_Cache).expects("createSingle")
				.exactly((sPath[0] === "/") ? 1 : 0)
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sPath.slice(1),
					sinon.match.same(mQueryOptions));

			oBinding = this.oModel.bindContext(sPath, null, mParameters);

			assert.strictEqual(oBinding.mParameters, undefined,
				"do not propagate unchecked query options");
			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions);
			assert.strictEqual(oBinding.sGroupId, "group");
			assert.strictEqual(oBinding.sUpdateGroupId, "updateGroup");
		});
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

		this.mock(_ODataHelper).expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.oModel.bindContext("/EMPLOYEES(ID='1')", null, {});
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh absolute path", function (assert) {
		var oBinding,
			oCache = {
				refresh : function () {}
			},
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')");

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
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
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
	QUnit.test("refresh on relative binding with parameters", function (assert) {
		var oBinding = this.oModel.bindContext("TEAM_2_MANAGER", null, {$select : "Name"}),
			oCache = {refresh : function () {}},
			oCachePromise = Promise.resolve(oCache),
			oCacheProxy = {promise : oCachePromise},
			oContext = Context.create(this.oModel, null, "/TEAMS", 1),
			oHelperMock = this.mock(_ODataHelper),
			oPathPromise = Promise.resolve("/canonical");

		this.mock(_Cache).expects("createSingle").never();
		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		oHelperMock.expects("createCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.func,
				sinon.match.same(oPathPromise))
			.returns(oCacheProxy);
		this.mock(oCache).expects("refresh").never();
		oBinding.setContext(oContext);
		oBinding.mCacheByContext = {"/TEAMS('1')" : oCache, "/TEAMS('42')" : {}};

		return oCachePromise.then(function () {
			//code under test
			assert.throws(function () {
				oBinding.refresh();
			}, new Error("Refresh on this binding is not supported"));
		});
	});

	//*********************************************************************************************
	QUnit.test("refresh on relative binding w/o parameters is not supported", function (assert) {
		var oBinding,
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')");

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
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oPromise;

		this.oRequestorMock.expects("request").returns(Promise.resolve({"ID" : "1"}));
		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext);

		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_fireChange");
		oBindingMock.expects("fireDataReceived").withExactArgs();

		// trigger read before refresh
		oPromise = oBinding.fetchValue("ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});
		oBinding.refresh();
		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oListener = {},
			oPromise;

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "bar", sinon.match.func, sinon.match.same(oListener))
			.callsArg(2)
			.returns(_SyncPromise.resolve("value"));
		this.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func).callsArg(1);

		oPromise = oBinding.fetchValue("bar", oListener).then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
		assert.ok(oPromise.isFulfilled());
		return oPromise;
	});

	//*********************************************************************************************
	[{
		abs : "/absolute/bar",
		rel : "bar"
	}, {
		abs : "/absolute",
		rel : ""
	}].forEach(function (oFixture) {
		QUnit.test("fetchAbsoluteValue: absolute binding: " + oFixture.abs, function (assert) {
			var oBinding = this.oModel.bindContext("/absolute"),
				oResult = {};

			this.mock(oBinding).expects("fetchValue").withExactArgs(oFixture.rel).returns(oResult);

			assert.strictEqual(oBinding.fetchAbsoluteValue(oFixture.abs), oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchAbsoluteValue: absolute binding, mismatch", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute");

		this.mock(oBinding).expects("fetchValue").never();

		return oBinding.fetchAbsoluteValue("/other/path").then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required), with refresh", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oPromise;

		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs();
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("myGroup", "bar", sinon.match.func, undefined)
			.callsArg(2)
			.returns(_SyncPromise.resolve("value"));
		this.mock(this.oModel).expects("addedRequestToGroup")
			.withExactArgs("myGroup", sinon.match.func).callsArg(1);
		oBinding.sRefreshGroupId = "myGroup";

		oPromise = oBinding.fetchValue("bar").then(function (vValue) {
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
		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "bar", sinon.match.func, undefined)
			// no read required! .callsArg(2)
			.returns(_SyncPromise.resolve("value"));

		return oBinding.fetchValue("bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oCacheMock = this.mock(oBinding.oCache),
			oExpectedError = new Error("Expected read failure"),
			oCachePromise = _SyncPromise.resolve(Promise.reject(oExpectedError));

		oCacheMock.expects("read").withExactArgs("$direct", "foo", sinon.match.func, undefined)
			.callsArg(2).returns(oCachePromise);
		oCacheMock.expects("read").withExactArgs("$direct", "bar", sinon.match.func, undefined)
			.returns(oCachePromise);
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oExpectedError});
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /absolute", sClassName, sinon.match.same(oExpectedError));

		oBinding.fetchValue("foo").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
		return oBinding.fetchValue("bar").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.strictEqual(oError, oExpectedError);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oContext,
			oContextMock,
			oHelperMock = this.mock(_Helper),
			oNestedBinding,
			oListener = {},
			oPromise = {};

		this.mock(oBinding).expects("getGroupId").never();
		oBinding.initialize();
		oContext = oBinding.getBoundContext();
		oContextMock = this.mock(oContext);
		oNestedBinding = this.oModel.bindContext("navigation", oContext);

		oHelperMock.expects("buildPath").withExactArgs("navigation", "bar").returns("~bar~");
		oContextMock.expects("fetchValue").withExactArgs("~bar~", oListener)
			.returns(oPromise);

		assert.strictEqual(oNestedBinding.fetchValue("bar", oListener), oPromise);

		assert.strictEqual(this.oModel.bindContext("navigation2").fetchValue("").getResult(),
			undefined,
			"Unresolved binding: fetchValue returns _SyncPromise resolved with result undefined");
	});

	//*********************************************************************************************
	["/TEAMS/0", "/TEAMS/0/TEAM_2_MANAGER/bar"].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding:" + sPath, function (assert) {
			var oBinding = this.oModel.bindContext("TEAM_2_MANAGER"),
				oContext = Context.create(this.oModel, undefined, "/TEAMS/0"),
				oPromise,
				oResult = {};

			this.mock(oBinding).expects("fetchValue").never();

			// code under test, binding unresolved
			oPromise = oBinding.fetchAbsoluteValue(sPath);

			assert.strictEqual(oPromise.isFulfilled(), true);
			assert.strictEqual(oPromise.getResult(), undefined);

			oBinding.setContext(oContext);
			this.mock(oContext).expects("fetchAbsoluteValue")
				.withExactArgs(sPath).returns(oResult);

			// code under test, binding resolved
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath), oResult);
		});
	});

	//*********************************************************************************************
	["/SalesOrderList/1", "/SalesOrderList/1/SO_2_SCHDL_DIFF/bar"].forEach(function (sPath) {
		QUnit.test("fetchAbsoluteValue: relative binding w/ cache: " + sPath, function (assert) {
			var oBinding = this.oModel.bindContext("SO_2_SCHDL", undefined, {}),
				oCache = {
					promise : Promise.resolve(),
					read : function () {}
				},
				oContext = Context.create(this.oModel, undefined, "/SalesOrderList/1"),
				oContextMock = this.mock(oContext),
				oResult = {};

			this.mock(_ODataHelper).expects("createCacheProxy").returns(oCache);
			oBinding.setContext(oContext);

			oContextMock.expects("fetchAbsoluteValue").withExactArgs(sPath).returns(oResult);

			// code under test
			assert.strictEqual(oBinding.fetchAbsoluteValue(sPath), oResult);
		});
	});

	//*********************************************************************************************
	[{
		abs : "/SalesOrderList/1/SO_2_SCHDL/bar",
		rel : "bar"
	}, {
		abs : "/SalesOrderList/1/SO_2_SCHDL",
		rel : ""
	}].forEach(function (oFixture) {
		QUnit.test("fetchAbsoluteValue: relative binding w/ cache: " + oFixture.abs,
			function (assert) {
				var oBinding = this.oModel.bindContext("SO_2_SCHDL", undefined, {}),
					oCache = {
						promise : Promise.resolve(),
						read : function () {}
					},
					oContext = Context.create(this.oModel, undefined, "/SalesOrderList/1"),
					oResult = {};

				this.mock(_ODataHelper).expects("createCacheProxy").returns(oCache);
				oBinding.setContext(oContext);

				this.mock(oCache).expects("read").withArgs("$auto", oFixture.rel)
					.returns(_SyncPromise.resolve(oResult));

				// code under test
				return oBinding.fetchAbsoluteValue(oFixture.abs).then(function (oResult0) {
					assert.strictEqual(oResult0, oResult);
				});
			});
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
	QUnit.test("updateValue: relative binding", function (assert) {
		var oBinding,
			oContext = {
				getPath : function () {},
				updateValue : function () {}
			},
			oContextMock = this.mock(oContext),
			oResult = {};

		oContextMock.expects("getPath").returns("/ProductList/0"); // called in bindContext
		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "BP_2_XYZ/42")
			.returns("~BP_2_XYZ/42~");
		oContextMock.expects("updateValue")
			.withExactArgs("up", "bar", Math.PI, "edit('URL')", "~BP_2_XYZ/42~")
			.returns(Promise.resolve(oResult));
		this.mock(this.oModel).expects("addedRequestToGroup").never();

		oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext);

		this.mock(oBinding).expects("fireEvent").never();
		this.mock(oBinding).expects("getGroupId").never();

		// code under test
		return oBinding.updateValue("up", "bar", Math.PI, "edit('URL')", "BP_2_XYZ/42")
			.then(function (oResult0) {
				assert.strictEqual(oResult0, oResult);
			});
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: absolute binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oListener = {};

		this.mock(oBinding.oCache).expects("deregisterChange")
			.withExactArgs("foo", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding resolved", function (assert) {
		var oContext = {
				deregisterChange : function () {},
				getPath : function () {
					return "/Products('1')";
				}
			},
			oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext),
			oListener = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "foo")
			.returns("~foo~");
		this.mock(oContext).expects("deregisterChange")
			.withExactArgs("~foo~", sinon.match.same(oListener));

		oBinding.deregisterChange("foo", oListener);
	});

	//*********************************************************************************************
	QUnit.test("deregisterChange: relative binding unresolved", function (assert) {
		this.oModel.bindContext("PRODUCT_2_BP")
			.deregisterChange("foo", {}); // nothing must happen
	});

	//*********************************************************************************************
	QUnit.test("hasPendingChanges: with and without cache", function (assert) {
		var oBinding = this.oModel.bindContext("PRODUCT_2_BP", undefined, {}),
			oBindingMock = this.mock(oBinding),
			oCacheProxy = {
				promise: Promise.resolve()
			},
			oContext = Context.create(this.oModel, null, "/Products('1')"),
			oPathPromise = Promise.resolve("/canonical"),
			oResult = {};

		oBindingMock.expects("_hasPendingChanges").withExactArgs("PRODUCT_2_BP")
			.returns(oResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), oResult);

		this.mock(oContext).expects("requestCanonicalPath").withExactArgs().returns(oPathPromise);
		this.mock(_ODataHelper).expects("createCacheProxy")
			.withExactArgs(sinon.match.same(oBinding), sinon.match.func,
				sinon.match.same(oPathPromise))
			.returns(oCacheProxy);
		oBinding.setContext(oContext);
		oBindingMock.expects("_hasPendingChanges").withExactArgs("").returns(oResult);

		// code under test
		assert.strictEqual(oBinding.hasPendingChanges(), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: absolute binding", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute"),
			oResult = {};

		this.mock(oBinding.oCache).expects("hasPendingChanges").withExactArgs("foo")
			.returns(oResult);

		assert.strictEqual(oBinding._hasPendingChanges("foo"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: relative binding resolved", function (assert) {
		var oContext = {
				hasPendingChanges : function () {},
				getPath : function () {
					return "/Products('1')";
				}
			},
			oBinding = this.oModel.bindContext("PRODUCT_2_BP", oContext),
			oResult = {};

		this.mock(_Helper).expects("buildPath").withExactArgs("PRODUCT_2_BP", "foo")
			.returns("~foo~");
		this.mock(oContext).expects("hasPendingChanges").withExactArgs("~foo~").returns(oResult);

		assert.strictEqual(oBinding._hasPendingChanges("foo"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: relative binding unresolved", function (assert) {
		assert.strictEqual(this.oModel.bindContext("PRODUCT_2_BP")._hasPendingChanges("foo"),
			false);
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
				.withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);

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

		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowedBindingParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowedBindingParameters)
			.returns({$$groupId : "foo"});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		oHelperMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters).returns({});
		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// buildBindingParameters also called for relative binding
		oHelperMock.expects("buildBindingParameters").withExactArgs(sinon.match.same(mParameters),
				aAllowedBindingParameters)
			.returns({$$groupId : "foo", $$updateGroupId : "bar"});
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM", undefined, mParameters);
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
	});

	//*********************************************************************************************
	QUnit.test("getGroupId", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBinding2 = this.oModel.bindContext("/absolute"),
			oModelMock = this.mock(this.oModel),
			oReadPromise = _SyncPromise.resolve();

		this.mock(oBinding.oCache).expects("read")
			.withExactArgs("$direct", "foo", sinon.match.func, undefined)
			.callsArg(2)
			.returns(oReadPromise);
		oModelMock.expects("addedRequestToGroup")
			.withExactArgs("$direct", sinon.match.func)
			.callsArg(1);
		this.mock(oBinding2.oCache).expects("read")
			.withExactArgs("$auto", "bar", sinon.match.func, undefined)
			.callsArg(2)
			.returns(oReadPromise);
		oModelMock.expects("addedRequestToGroup")
			.withExactArgs("$auto", sinon.match.func)
			.callsArg(1);

		// code under test
		return Promise.all([oBinding.fetchValue("foo"), oBinding2.fetchValue("bar")]);
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
		return oContextBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute function", function (assert) {
		var oCacheMock = this.mock(_Cache),
			oContextBinding,
			oContextBindingMock,
			oExecutePromise,
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
		oHelperMock.expects("formatLiteral").withExactArgs("bãr'1", "Edm.String")
			.returns("'bãr''1'");
		oHelperMock.expects("formatLiteral").withExactArgs(42, "Edm.Int16").returns("42");
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"FunctionImport(f%C3%B8%C3%B8='b%C3%A3r''1',p2=42)", {"sap-client" : "111"})
			.returns(oSingleCache);
		oContextBindingMock.expects("getGroupId").returns("foo");
		oSingleCacheMock.expects("read").withExactArgs("foo").returns(_SyncPromise.resolve({}));
		oModelMock.expects("addedRequestToGroup").withExactArgs("foo");
		oContextBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oExecutePromise = oContextBinding.setParameter("føø", "bãr'1").setParameter("p2", 42)
			.execute().then(function (oResult) {
				assert.strictEqual(oContextBinding.oCache, oSingleCache);
				assert.strictEqual(oResult, undefined);

				oHelperMock.expects("formatLiteral")
					.withExactArgs("bãr'2", "Edm.String").returns("'bãr''2'");
				oHelperMock.expects("formatLiteral")
					.withExactArgs(42, "Edm.Int16").returns("42");
				oCacheMock.expects("createSingle")
					.withExactArgs(sinon.match.same(that.oModel.oRequestor),
						"FunctionImport(f%C3%B8%C3%B8='b%C3%A3r''2',p2=42)", {"sap-client" : "111"})
					.returns(oSingleCache);
				oSingleCacheMock.expects("read").withExactArgs("myGroupId")
					.returns(_SyncPromise.resolve({}));
				oModelMock.expects("addedRequestToGroup").withExactArgs("myGroupId");
				oContextBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});

				// code under test
				return oContextBinding.setParameter("føø", "bãr'2").execute("myGroupId");
			});
		assert.ok(oExecutePromise instanceof Promise, "a Promise, not a SyncPromise");
		return oExecutePromise;
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
			.returns(_SyncPromise.resolve({}));
		oModelMock.expects("addedRequestToGroup").withExactArgs("foo");
		oContextBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding.execute().then(function (oResult) {
			assert.strictEqual(oResult, undefined);

			oSingleCacheMock.expects("post")
				.withExactArgs("myGroupId",
					sinon.match.same(oContextBinding.oOperation.mParameters))
				.returns(_SyncPromise.resolve({}));
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
			.returns(_SyncPromise.resolve(oPostResult));
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
				deregisterChange : function () {},
				post : function () {},
				read : function () {},
				refresh : function () {}
			},
			oSingleCacheMock = this.mock(oSingleCache),
			that = this;

		oParentBinding1.initialize();
		oParentBinding2.initialize();
		oContextBinding = this.oModel.bindContext("navigation2/schema.Action(...)",
			oParentBinding1.getBoundContext(), {$$groupId : "groupId"});
		oContextBindingMock = this.mock(oContextBinding);

		oSingleCacheMock.expects("refresh").never();
		oContextBindingMock.expects("_requestOperationMetadata").twice()
			.returns(Promise.resolve({$kind : "Action"}));
		this.mock(oParentBinding1.getBoundContext()).expects("requestCanonicalPath")
			.withExactArgs().returns(Promise.resolve("/EntitySet(ID='1')/navigation1"));
		oCacheMock.expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"EntitySet(ID='1')/navigation1/navigation2/schema.Action", {"sap-client" : "111"},
				false, true)
			.returns(oSingleCache);
		oSingleCacheMock.expects("post")
			.withExactArgs("groupId", {})
			.returns(_SyncPromise.resolve(oPostResult));
		oModelMock.expects("addedRequestToGroup").withExactArgs("groupId");
		oContextBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change});

		// code under test
		return oContextBinding.execute().then(function () {
			oContextBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Context});

			// code under test: setContext clears the cache
			oContextBinding.setContext(oParentBinding2.getBoundContext());

			that.mock(oParentBinding2.getBoundContext()).expects("requestCanonicalPath")
				.withExactArgs().returns(Promise.resolve("/EntitySet(ID='2')/navigation1"));
			oCacheMock.expects("createSingle")
				.withExactArgs(sinon.match.same(that.oModel.oRequestor),
					"EntitySet(ID='2')/navigation1/navigation2/schema.Action",
					{"sap-client" : "111"}, false, true)
				.returns(oSingleCache);
			oSingleCacheMock.expects("post")
				.withExactArgs("groupId", {"foo" : "bar"})
				.returns(_SyncPromise.resolve(oPostResult));
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
			"Failed to execute " + sPath, sClassName, sinon.match.same(oChangeHandlerError));

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
	QUnit.test("setParameter: undefined", function (assert) {
		var oContextBinding = this.oModel.bindContext("/Function(...)");
		assert.throws(function () {
			return oContextBinding.setParameter("foo", undefined);
		}, new Error("Missing value for parameter: foo"));
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
