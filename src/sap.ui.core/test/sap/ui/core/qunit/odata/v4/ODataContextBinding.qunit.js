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
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, SyncPromise, Binding, ChangeReason, ContextBinding, Context,
		_Cache, _GroupLock, _Helper, ODataContextBinding, ODataModel, asODataParentBinding,
		TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$groupId", "$$inheritExpandSelect", "$$ownRequest",
			"$$updateGroupId"],
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
		assert.ok(oBinding.hasOwnProperty("bInheritExpandSelect"));
		assert.ok(oBinding.hasOwnProperty("oOperation"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
		assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
		assert.strictEqual(oBinding.aChildCanUseCachePromises.length, 0);
		assert.strictEqual(oBinding.bInheritExpandSelect, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, null);
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
	[false, undefined].forEach(function (bInheritExpandSelect) {
		QUnit.test("applyParameters (as called by c'tor), inheritExpandSelect="
			+ bInheritExpandSelect, function (assert) {
			var mBindingParameters = {
					$$groupId : "foo",
					$$inheritExpandSelect : bInheritExpandSelect,
					$$updateGroupId : "update foo"
				},
				sGroupId = "foo",
				oModelMock = this.mock(this.oModel),
				oBinding = this.oModel.bindContext("/EMPLOYEES"),
				mParameters = {
					$$groupId : "foo",
					$$inheritExpandSelect : bInheritExpandSelect,
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
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
				.returns(mBindingParameters);
			this.mock(oBinding).expects("fetchCache").withExactArgs(undefined).callsFake(function () {
				this.oCachePromise = SyncPromise.resolve({});
			});
			this.mock(oBinding).expects("checkUpdate").withExactArgs();

			// code under test
			oBinding.applyParameters(mParameters);

			assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
			assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
			assert.strictEqual(oBinding.bInheritExpandSelect, bInheritExpandSelect,
				"bInheritExpandSelect");
			assert.deepEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
			assert.strictEqual(oBinding.mParameters, mParameters, "mParameters");
		});
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$inheritExpandSelect, no operation binding", function (assert) {
		var oBinding = this.oModel.bindContext("/NotAnOperation"),
			oBindingMock = this.mock(oBinding),
			oModelMock = this.mock(this.oModel),
			mParameters = {$$inheritExpandSelect : true};

		oModelMock.expects("buildBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
			.returns({
				$$groupId : "myGroup",
				$$inheritExpandSelect : true,
				$$updateGroupId : "myUpdateGroup"
			});
		oModelMock.expects("buildQueryOptions").never();
		oBindingMock.expects("checkUpdate").never();
		oBindingMock.expects("execute").never();
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("refreshInternal").never();

		assert.throws(function () {
			// code under test
			oBinding.applyParameters(mParameters);
		}, new Error("Unsupported binding parameter $$inheritExpandSelect: "
			+ "binding is not an operation binding"));

		assert.strictEqual(oBinding.sGroupId, undefined, "group id not set");
		assert.strictEqual(oBinding.sUpdateGroupId, undefined, "update group id not set");
	});

	//*********************************************************************************************
	[{$expand : {NavProperty : {}}}, {$select : "p0,p1"}].forEach(function (mExpandOrSelect, i) {
		QUnit.test("applyParameters: $$inheritExpandSelect with $expand or $select, " + i,
			function (assert) {
				var oBinding = this.oModel.bindContext("BoundOperation(...)"),
					oBindingMock = this.mock(oBinding),
					oModelMock = this.mock(this.oModel),
					mParameters = {$$inheritExpandSelect : true};

				oModelMock.expects("buildBindingParameters")
					.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
					.returns(jQuery.extend({
						$$groupId : "myGroup",
						$$inheritExpandSelect : true,
						$$updateGroupId : "myUpdateGroup"
					}, mExpandOrSelect));
				oModelMock.expects("buildQueryOptions").never();
				oBindingMock.expects("checkUpdate").never();
				oBindingMock.expects("execute").never();
				oBindingMock.expects("fetchCache").never();
				oBindingMock.expects("refreshInternal").never();

				// code under test
				assert.throws(function () {
					oBinding.applyParameters(mParameters);
				}, new Error("Must not set parameter $$inheritExpandSelect on binding which has "
						+ "$expand or $select"));

				assert.strictEqual(oBinding.sGroupId, undefined, "group id not set");
				assert.strictEqual(oBinding.sUpdateGroupId, undefined, "update group id not set");
		});
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
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
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
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
	[true, false].forEach(function (bInheritExpandSelect, i) {
		QUnit.test("applyParameters: action binding, " + i, function (assert) {
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
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
				.returns({
					$$groupId : sGroupId,
					$$inheritExpandSelect : bInheritExpandSelect,
					$$updateGroupId : sUpdateGroupId
				});
			oBindingMock.expects("checkUpdate").never();
			oBindingMock.expects("execute").never();
			oBindingMock.expects("fetchCache").never();
			oBindingMock.expects("refreshInternal").never();

			// code under test (as called by ODataParentBinding#changeParameters)
			oBinding.applyParameters(mParameters, ChangeReason.Filter);

			assert.strictEqual(oBinding.bInheritExpandSelect, bInheritExpandSelect,
				"bInheritExpandSelect");
			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
			assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
			assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
			assert.strictEqual(oBinding.mParameters, mParameters);
		});
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
			.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
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
	[null, {destroy : function () {}}].forEach(function (oReturnValueContext, i) {
		QUnit.test("setContext, relative path, " + i, function (assert) {
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

			oBinding.oReturnValueContext = oReturnValueContext;
			this.mock(oBinding.getBoundContext()).expects("destroy").withExactArgs();
			if (oReturnValueContext) {
				this.mock(oBinding.oReturnValueContext).expects("destroy").withExactArgs();
			}

			// code under test: reset parent binding fires change
			oBinding.setContext(undefined);

			assert.strictEqual(oBinding.oContext, undefined);
			assert.strictEqual(oBinding.getBoundContext(), null);
			assert.strictEqual(oBinding.oReturnValueContext, null);
			assert.strictEqual(oSetContextSpy.callCount, 2);

			// code under test: setting to null doesn't change the bound context -> no change event
			oBinding.setContext(null);

			assert.strictEqual(oBinding.oContext, null);
			assert.strictEqual(oBinding.getBoundContext(), null);
			assert.strictEqual(oSetContextSpy.callCount, 2, "no addt'l change event");
		});
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
			oGroupLock1 = new _GroupLock(),
			oGroupLock2 = new _GroupLock(),
			oModelMock = this.mock(this.oModel),
			oPromise;

		oBinding = this.oModel.bindContext("/EMPLOYEES(ID='1')", oContext,
			{$$groupId : "$direct"}); // to prevent that the context is asked for the group ID

		oModelMock.expects("lockGroup").withExactArgs("$direct", undefined)
			.returns(oGroupLock1);
		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "EMPLOYEES(ID='1')?sap-client=111", sinon.match.same(oGroupLock1),
				undefined, undefined, sinon.match.func, undefined, "/EMPLOYEES")
			.callsArg(5)
			.returns(Promise.resolve({"ID" : "1"}));
		oModelMock.expects("reportError").withExactArgs(
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

		this.mock(oBinding).expects("createRefreshGroupLock").withExactArgs("group", true)
			.returns(oGroupLock2);

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal("group", true);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oBindingMock = this.mock(oBinding),
			oGroupLock = {},
			oListener = {},
			oPromise;

		this.mock(this.oModel).expects("lockGroup").withExactArgs("$direct", undefined)
			.returns(oGroupLock);
		oBindingMock.expects("getRelativePath").withExactArgs("/absolute/bar").returns("bar");
		oBindingMock.expects("fireDataRequested").withExactArgs();
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "bar", sinon.match.func,
				sinon.match.same(oListener))
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
			oBindingMock = this.mock(oBinding),
			oGroupLock = new _GroupLock("group");

		this.mock(this.oModel).expects("lockGroup")
			.withExactArgs("$auto", undefined)
			.returns(oGroupLock);
		oBindingMock.expects("fireDataRequested").never();
		oBindingMock.expects("fireDataReceived").never();
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "bar", sinon.match.func, undefined)
			// no read required! .callsArg(2)
			.returns(SyncPromise.resolve("value"));

		// code under test
		return oBinding.fetchValue("/absolute/bar").then(function (vValue) {
			assert.strictEqual(vValue, "value");
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (failure)", function (assert) {
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oCacheMock = this.mock(oBinding.oCachePromise.getResult()),
			oExpectedError = new Error("Expected read failure"),
			oGroupLock1 = new _GroupLock(),
			oGroupLock2 = new _GroupLock(),
			oModelMock = this.mock(this.oModel),
			oRejectedPromise = SyncPromise.reject(oExpectedError);

		oModelMock.expects("lockGroup").withExactArgs("$direct", undefined).returns(oGroupLock1);
		oModelMock.expects("lockGroup").withExactArgs("$direct", undefined).returns(oGroupLock2);
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock1), "foo", sinon.match.func, undefined)
			.callsArg(2).returns(oRejectedPromise);
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock2), "bar", sinon.match.func, undefined)
			.returns(oRejectedPromise);
		this.mock(oBinding).expects("fireDataReceived")
			.withExactArgs({error : oExpectedError});
		this.mock(oGroupLock1).expects("unlock").withExactArgs(true);
		this.mock(oGroupLock2).expects("unlock").withExactArgs(true);
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
			.withExactArgs(sPath, sinon.match.same(oListener))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oNestedBinding.fetchValue(sPath, oListener).getResult(),
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
			.withExactArgs(sPath, sinon.match.same(oListener))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.fetchValue(sPath, oListener).getResult(),
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
	QUnit.test("$$groupId, $$ownRequest, $$updateGroupId", function (assert) {
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
		var oBinding = this.oModel.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oGroupLock = new _GroupLock();

		this.mock(this.oModel).expects("lockGroup").withExactArgs("$direct", undefined)
			.returns(oGroupLock);
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "foo", sinon.match.func, undefined)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.fetchValue("/absolute/foo");
	});

	//*********************************************************************************************
	QUnit.test("execute: absolute", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oGroupLock = {},
			oPromise = {};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
		this.mock(this.oModel).expects("lockGroup").withExactArgs("groupId", true)
			.returns(oGroupLock);
		this.mock(oBinding).expects("_execute")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		// code under test
		assert.strictEqual(oBinding.execute("groupId"), oPromise);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bBaseContext) {
		QUnit.test("execute: relative, bBaseContext=" + bBaseContext, function (assert) {
			var oContext = {
					isTransient : function () { return false;},
					getPath: function () { return "/Employees('42')";}
				},
				oBinding = this.oModel.bindContext("schema.Operation(...)", oContext),
				oGroupLock = {},
				oPromise = {};

			if (bBaseContext) {
				delete oContext.isTransient;
			}
			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
			this.mock(this.oModel).expects("lockGroup").withExactArgs("groupId", true)
				.returns(oGroupLock);
			this.mock(oBinding).expects("_execute")
				.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

			// code under test
			assert.strictEqual(oBinding.execute("groupId"), oPromise);
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
		QUnit.test("_execute: " + oFixture.error, function (assert) {
			var oGroupLock = new _GroupLock();

			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs(oFixture.request)
				.returns(Promise.resolve(oFixture.metadata));
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to execute " + oFixture.path, sClassName, sinon.match.instanceOf(Error));
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);

			return this.oModel.bindContext(oFixture.path)
				._execute(oGroupLock) // code under test
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
		oBindingMock.expects("createRefreshGroupLock").never();
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
		this.mock(oBinding).expects("createRefreshGroupLock").never();
		assert.strictEqual(oBinding.oCachePromise.getResult(), undefined);

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal(undefined, true);

		return oBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		var sTitle = "_execute: OperationImport, relative (to base context): " + bRelative;

		QUnit.test(sTitle, function (assert) {
			var oBaseContext = this.oModel.createBindingContext("/"),
				oGroupLock = new _GroupLock("groupId"),
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
				that.mock(oChild0).expects("refreshInternal").withExactArgs("groupId", true);
				that.mock(oChild1).expects("refreshInternal").withExactArgs("groupId", true);
			}

			oBindingMock.expects("getGroupId").returns("groupId");
			this.mock(oGroupLock).expects("setGroupId").withExactArgs("groupId");
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/OperationImport/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock), "/OperationImport(...)",
					sinon.match.same(oOperationMetadata), undefined)
				.returns(SyncPromise.resolve({/*oResult*/}));
			expectChangeAndRefreshDependent();

			// code under test
			oPromise = oBinding._execute(oGroupLock);

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
				sTitle = "_execute: bound operation, relative binding " + sOperation
					+ (bBaseContext ? ", baseContext" : "");

			QUnit.test(sTitle, function (assert) {
				var that = this,
					oEntity = {},
					oExpectation,
					oGroupLock = new _GroupLock("groupId"),
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
					that.mock(oChild0).expects("refreshInternal").withExactArgs("groupId", true);
					that.mock(oChild1).expects("refreshInternal").withExactArgs("groupId", true);
				}

				this.mock(oGroupLock).expects("setGroupId").twice().withExactArgs("groupId");
				this.mock(this.oModel.getMetaModel()).expects("fetchObject").twice()
					.withExactArgs("/EntitySet/navigation1/" + sOperation + "/@$ui5.overload")
					.returns(SyncPromise.resolve([oOperationMetadata]));
				oBindingMock.expects("hasReturnValueContext").twice()
					.withExactArgs(sinon.match.same(oOperationMetadata))
					.returns(false);

				// code under test - must not ask its context
				assert.strictEqual(oBinding.fetchValue().getResult(), undefined);

				if (bBaseContext) {
					oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock),
							"/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), undefined);
				} else {
					oExpectation = oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock),
							"/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), sinon.match.func);
					this.mock(oParentContext1).expects("getObject").on(oParentContext1)
						.withExactArgs(sPathPrefix).returns(oEntity);
				}
				expectChangeAndRefreshDependent();

				// code under test
				return oBinding._execute(oGroupLock).then(function (oReturnValueContext) {
					assert.strictEqual(oReturnValueContext, undefined);
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
						oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock),
								"/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
								sinon.match.same(oOperationMetadata), undefined);
					} else {
						oExpectation = oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock),
								"/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
								sinon.match.same(oOperationMetadata), sinon.match.func);
						that.mock(oParentContext2).expects("getObject").on(oParentContext2)
							.withExactArgs(sPathPrefix).returns(oEntity);
					}
					expectChangeAndRefreshDependent();
					oBindingMock.expects("getGroupId").returns("groupId");

					// code under test: execute creates a new cache with the new path
					return oBinding.setParameter("foo", "bar")._execute(oGroupLock)
						.then(function (oReturnValueContext) {
							assert.strictEqual(oReturnValueContext, undefined);
							if (oExpectation) {
								assert.strictEqual(oExpectation.args[0][3](), oEntity);
							}
						});
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_execute: bound operation with return value context", function (assert) {
		var oContextMock = this.mock(Context),
			oError = {},
			oGroupLock = new _GroupLock("groupId"),
			oOperationMetadata = {},
			oRootBinding = {
				getRootBinding : function () { return oRootBinding; },
				isSuspended : function () { return false; }
			},
			oParentContext = Context.create(this.oModel, oRootBinding, "/TEAMS('42')"),
			oBinding = this.oModel.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"}),
			oBindingMock = this.mock(oBinding),
			oModelMock = this.mock(this.oModel),
			oResponseEntity = {},
			oReturnValueContextFirstExecute = {destroy : function () {}},
			oReturnValueContextSecondExecute = {destroy : function () {}},
			that = this;

		this.mock(oGroupLock).expects("setGroupId").withExactArgs("groupId").thrice();
		this.mock(this.oModel.getMetaModel()).expects("fetchObject").thrice()
			.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
		oBindingMock.expects("createCacheAndRequest").twice()
			.withExactArgs(sinon.match.same(oGroupLock),
				"/TEAMS('42')/name.space.Operation(...)",
				sinon.match.same(oOperationMetadata), sinon.match.func)
			.returns(Promise.resolve(oResponseEntity));
		oBindingMock.expects("_fireChange").twice().withExactArgs({reason : ChangeReason.Change});
		oModelMock.expects("getDependentBindings").twice()
			.withExactArgs(sinon.match.same(oBinding)).returns([]);
		oBindingMock.expects("hasReturnValueContext").twice()
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(true);
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/TEAMS('77')")
			.returns(oReturnValueContextFirstExecute);
		oContextMock.expects("create")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/TEAMS('77')")
			.returns(oReturnValueContextSecondExecute);

		// code under test
		return oBinding._execute(oGroupLock).then(function (oReturnValueContext0) {
			assert.strictEqual(oReturnValueContext0, oReturnValueContextFirstExecute);

			that.mock(oReturnValueContextFirstExecute).expects("destroy").withExactArgs();

			// code under test
			return oBinding._execute(oGroupLock).then(function (oReturnValueContext1) {
				var oChild0 = {
						refreshInternal : function () {}
					},
					oChild1 = {
						refreshInternal : function () {}
					};

				assert.strictEqual(oReturnValueContext1, oReturnValueContextSecondExecute);

				oBindingMock.expects("createCacheAndRequest")
					.withExactArgs(sinon.match.same(oGroupLock),
						"/TEAMS('42')/name.space.Operation(...)",
						sinon.match.same(oOperationMetadata), sinon.match.func)
					.returns(Promise.reject(oError));
				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});
				oModelMock.expects("getDependentBindings")
					.withExactArgs(sinon.match.same(oBinding)).returns([oChild0, oChild1]);
				that.mock(oChild0).expects("refreshInternal").withExactArgs("groupId", true);
				that.mock(oChild1).expects("refreshInternal").withExactArgs("groupId", true);
				that.mock(oReturnValueContextSecondExecute).expects("destroy").withExactArgs();
				oModelMock.expects("reportError");

				// code under test
				return oBinding._execute(oGroupLock).then(function () {
					assert.ok(false, "unexpected success");
				}, function (oError0) {
					assert.strictEqual(oError0, oError);
					assert.strictEqual(oBinding.oReturnValueContext, null);
				});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_execute: OperationImport, failure", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oGroupLock = new _GroupLock(),
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs(sinon.match.same(oGroupLock),
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.reject(oError));
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
		oModelMock.expects("getDependentBindings").withExactArgs(sinon.match.same(oBinding))
			.returns([]);
		oModelMock.expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oError));
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		return oBinding._execute(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("_execute: OperationImport, error in change handler", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.oModel.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oGroupLock = new _GroupLock(),
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs(sinon.match.same(oGroupLock),
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.resolve({/*oResult*/}));
		// Note: if control's handler fails, we don't care about state of dependent bindings
		oModelMock.expects("getDependentBindings").never();
		oModelMock.expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oError));

		oBinding.attachChange(function () {
			throw oError;
		});

		// code under test
		return oBinding._execute(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: FunctionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			oGroupLock = {},
			bHasReturnValueContext = {},
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
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(bHasReturnValueContext);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), false,
				"/FunctionImport/@$ui5.overload/0/$ReturnType",
				sinon.match.same(bHasReturnValueContext))
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound function", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			fnGetEntity = {}, // do not call!
			oGroupLock = {},
			bHasReturnValueContext = {},
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
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(bHasReturnValueContext);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType",
				sinon.match.same(bHasReturnValueContext))
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: ActionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.oModel.bindContext("n/a(...)"),
			oGroupLock = {},
			bHasReturnValueContext = {},
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
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(bHasReturnValueContext);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), true,
				"/ActionImport/@$ui5.overload/0/$ReturnType",
				sinon.match.same(bHasReturnValueContext))
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("post")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters), undefined)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata),
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
			oGroupLock = {},
			bHasReturnValueContext = {},
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
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(bHasReturnValueContext);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect), true,
				"/Entity/navigation/bound.Action/@$ui5.overload/0/$ReturnType",
				sinon.match.same(bHasReturnValueContext))
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("post")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters), "ETag")
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, true);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(fnGetEntity.callCount, 1);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound function, $$inheritExpandSelect", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oContext = Context.create(this.oModel, {
				mCacheQueryOptions : {$expand : {"NavProperty" : {}}, $select : ["p0"]}
			}, "/foo"),
			oBinding = this.oModel.bindContext("bound.Function(...)", oContext,
				{$$inheritExpandSelect : true}),
			fnGetEntity = {}, // do not call!
			oGroupLock = {},
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Function"},
			mParameters = {},
			sPath = "/Entity('1')/navigation/bound.Function(...)",
			oPromise = {},
			mQueryOptions = {"functionQueryOption" : "bar"},
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
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(true);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				{"functionQueryOption" : "bar", $expand : {"NavProperty" : {}}, $select : ["p0"]},
				sinon.match.same(bAutoExpandSelect), false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType", true)
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: wrong $kind", function (assert) {
		var oBinding = this.oModel.bindContext("n/a(...)"),
			oGroupLock = {},
			oOperationMetadata = {$kind : "n/a"};

		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(false);

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, "/OperationImport(...)", oOperationMetadata);
		}, new Error("Not an operation: /OperationImport(...)"));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: $$inheritExpandSelect w/o return value context",
		function (assert) {
			var oBinding = this.oModel.bindContext("bound.Operation(...)", null,
					{$$inheritExpandSelect : true}),
				oGroupLock = {},
				oOperationMetadata = {$kind : "Function"};

			this.mock(oBinding).expects("hasReturnValueContext")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(false);

			assert.throws(function () {
				// code under test
				oBinding.createCacheAndRequest(oGroupLock, "/Entity('0815')/bound.Operation(...)",
					oOperationMetadata);
			}, new Error("Must not set parameter $$inheritExpandSelect on binding which has "
				+ "no return value context"));
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
			oModelMock = this.mock(this.oModel),
			oReturnValueContext = Context.create(this.oModel, {}, "/bar");

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

		oBinding = this.oModel.bindContext("relative");
		oBinding.setContext(oContext);
		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding.oElementContext).expects("destroy").withExactArgs();
		this.mock(oBinding.oReturnValueContext).expects("destroy").withExactArgs();
		oBindingMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();
	});

	//*********************************************************************************************
	QUnit.test("_delete: empty path -> delegate to parent context", function (assert) {
		var oBinding = this.oModel.bindContext(""),
			oContext = Context.create(this.oModel, null, "/SalesOrders/7"),
			oGroupLock = new _GroupLock("myGroup"),
			oResult = {};

		oBinding.setContext(oContext);
		this.mock(oContext).expects("_delete").withExactArgs(sinon.match.same(oGroupLock))
			.returns(oResult);

		assert.strictEqual(oBinding._delete(oGroupLock, "SalesOrders('42')"), oResult);
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
			bCheckUpdate = {/*true or false*/},
			oGroupLock = {};

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

		this.mock(oBinding).expects("createRefreshGroupLock").withExactArgs("myGroup", false)
			.returns(oGroupLock);
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
	[{
		path : "/EMPLOYEES('42')",
		title : "absolute"
	}, {
		path : "EMPLOYEES('42')",
		title : "relative with base context"
	}].forEach(function (oFixture) {
		QUnit.test("refreshInternal & fetchValue: " + oFixture.title, function (assert) {
			var oContext = this.oModel.createBindingContext("/"),
				oBinding = this.oModel.bindContext(oFixture.path, oContext),
				oCache = {
					fetchValue : function () {}
				},
				oRefreshGroupLock = {};

			this.mock(oBinding).expects("createRefreshGroupLock").withExactArgs("myGroup", true)
				.callsFake(function () {
					oBinding.oRefreshGroupLock = oRefreshGroupLock;
				});
			this.mock(_Cache).expects("createSingle").returns(oCache);

			//code under test
			oBinding.refreshInternal("myGroup");

			this.mock(this.oModel).expects("lockGroup")
				.withExactArgs("$auto", sinon.match.same(oRefreshGroupLock))
				.returns(oRefreshGroupLock);
			this.mock(oCache).expects("fetchValue")
				.withExactArgs(sinon.match.same(oRefreshGroupLock), "", sinon.match.func, undefined)
				.returns(SyncPromise.resolve({}));

			//code under test
			oBinding.fetchValue("");

			assert.deepEqual(oBinding.oRefreshGroupLock, undefined);
		});
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("refreshInternal, bAction=" + bAction, function (assert) {
			var oBinding = this.oModel.bindContext("/FunctionImport(...)"),
				oGroupLock = new _GroupLock("myGroup");

			oBinding.oCachePromise = SyncPromise.resolve({});
			oBinding.oOperation.bAction = bAction;

			this.mock(oBinding).expects("createRefreshGroupLock").exactly(bAction === false ? 1 : 0)
				.withExactArgs("myGroup", true)
				.callsFake(function () {
					oBinding.oRefreshGroupLock = oGroupLock;
				});
			this.mock(this.oModel).expects("getDependentBindings").never();
			this.mock(oBinding).expects("_execute").exactly(bAction === false ? 1 : 0)
				.withExactArgs(sinon.match.same(oGroupLock));

			//code under test
			oBinding.refreshInternal("myGroup");

			assert.strictEqual(oBinding.oRefreshGroupLock, undefined);
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
			oBinding._delete({/*oGroupLock*/}, "EMPLOYEES('42')");
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
				assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
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
		oBinding.bAggregatedQueryOptionsInitial = false;
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
	[{
		$kind : "Action"
	}, {
		$kind : "Action",
		$IsBound : true
	}, {
		$kind : "Action",
		$IsBound : true,
		$ReturnType : {
			$isCollection : true
		}
	}, {
		$kind : "Action",
		$IsBound : true,
		$ReturnType : {
			//$isCollection : false is default
		}
	}, {
		$kind : "Action",
		$IsBound : true,
		$ReturnType : {},
		$Parameter : [{
			$Name : "_it"
		}],
		$EntitySetPath : "_it/navigation_or_typecast"
	}].forEach(function (oOperationMetadata, i) {
		QUnit.test("hasReturnValueContext returns false due to metadata, " + i, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
				oBinding = this.oModel.bindContext("name.space.Operation(...)", oContext);

			// code under test
			assert.notOk(oBinding.hasReturnValueContext(oOperationMetadata));
		});
	});

	//*********************************************************************************************
	[{
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')",
		contextMetaPath : "/TEAMS",
		$kind : "EntitySet",
		result : true
	}, { // operation binding's context must not address entity via navigation property
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')/TEAM_2_MANAGER",
		result : false
	}, { // operation binding must have a context
		binding : "/TEAMS('42')/name.space.Operation(...)",
		result : false
	}, { // operation binding must be relative
		binding : "/TEAMS('42')/name.space.Operation(...)",
		context : "/DOES_NOT_MATTER",
		result : false
	}, { // operation binding's context must not address a function import's return value
		binding : "name.space.Operation(...)",
		context : "/FunctionImport()",
		contextMetaPath : "/FunctionImport",
		$kind : "Function",
		result : false
	}].forEach(function (oFixture, i) {
		QUnit.test("hasReturnValueContext for context and binding path, " + i, function (assert) {
			var oContext = oFixture.context && Context.create(this.oModel, {}, oFixture.context),
				oBinding = this.oModel.bindContext(oFixture.binding, oContext),
				oOperationMetadata = {
					$kind : "Action",
					$IsBound : true,
					$EntitySetPath : "_it",
					$Parameter : [{
						$Type : "special.cases.ArtistsType",
						$Name : "_it",
						$Nullable : false
					}],
					$ReturnType: {
						$Type : "special.cases.ArtistsType"
					}
				};

			if (oFixture.contextMetaPath) {
				this.mock(this.oModel.oMetaModel).expects("getObject")
					.withExactArgs(oFixture.contextMetaPath)
					.returns({$kind : oFixture.$kind});
			}

			// code under test
			assert.strictEqual(!!oBinding.hasReturnValueContext(oOperationMetadata),
				oFixture.result);
		});
	});

	//*********************************************************************************************
	QUnit.test("hasReturnValueContext for non-V4 context", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')"),
			oBinding = this.oModel.bindContext("name.space.Operation(...)", oContext),
			oOperationMetadata = {
				$kind : "Action",
				$IsBound : true,
				$EntitySetPath : "_it",
				$Parameter : [{
					$Type : "special.cases.ArtistsType",
					$Name : "_it",
					$Nullable : false
				}],
				$ReturnType: {
					$Type : "special.cases.ArtistsType"
				}
			};

		this.mock(this.oModel.oMetaModel).expects("getObject").never();

		// code under test
		assert.strictEqual(!!oBinding.hasReturnValueContext(oOperationMetadata), false);
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