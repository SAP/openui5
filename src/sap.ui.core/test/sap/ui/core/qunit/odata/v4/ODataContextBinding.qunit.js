/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/test/TestUtils"
], function (jQuery, Log, SyncPromise, Binding, ChangeReason, ContextBinding, Context,
		ODataContextBinding, ODataModel, asODataParentBinding, _Cache, _GroupLock, _Helper,
		TestUtils) {
	/*global QUnit, sinon */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	var aAllowedBindingParameters = ["$$canonicalPath", "$$groupId", "$$inheritExpandSelect",
			"$$ownRequest", "$$patchWithoutSideEffects", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
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
			this.mock(this.oModel.oRequestor.oModelInterface)
				.expects("fetchMetadata").atLeast(0)
				.returns(SyncPromise.resolve());
		},

		afterEach : function () {
			return TestUtils.awaitRendering();
		},

		/**
		 * Calls <code>this.oModel.bindContext</code> using the given arguments, but avoids creating
		 * the prerendering task to unlock the read group lock.
		 *
		 * @returns {sap.ui.model.odata.v4.ODataContextBinding} The context binding
		 */
		bindContext : function () {
			try {
				this.stub(sap.ui.getCore(), "addPrerenderingTask");
				return this.oModel.bindContext.apply(this.oModel, arguments);
			} finally {
				sap.ui.getCore().addPrerenderingTask.restore();
			}
		}
	});

	//*********************************************************************************************
	QUnit.test("bindingCreated", function (assert) {
		var oBinding,
			oExpectation = this.mock(this.oModel).expects("bindingCreated")
				.withExactArgs(sinon.match.object);

		this.mock(ODataContextBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		oBinding = this.bindContext("/EMPLOYEES('42')");

		sinon.assert.calledWithExactly(oExpectation, sinon.match.same(oBinding));
	});

	//*********************************************************************************************
	QUnit.test("constructor: no lock for relative bindings", function (assert) {
		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();

		this.bindContext("EMPLOYEE_2_MANAGER", Context.create(this.oModel, {}, "/EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("constructor: lock when creating with base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')");

		this.mock(ODataContextBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		// code under test
		this.bindContext("TEAM_2_EMPLOYEES('Foo')", oContext);
	});

	//*********************************************************************************************
	QUnit.test("constructor: create operation binding", function (assert) {
		var oParentBindingSpy = this.spy(asODataParentBinding, "call"),
			oBinding = this.bindContext("/Operation(...)");

		assert.ok(oBinding.hasOwnProperty("mCacheByResourcePath"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("bInheritExpandSelect"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.strictEqual(oBinding.bInheritExpandSelect, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, null);
		assert.deepEqual(oBinding.oOperation, {
			bAction : undefined,
			mChangeListeners : {},
			mParameters : {},
			sResourcePath : undefined
		});

		assert.ok(oParentBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var oParentBindingSpy = this.spy(asODataParentBinding, "call"),
			oBinding = this.bindContext("/EMPLOYEES('42')");

		assert.ok(oBinding.hasOwnProperty("mCacheByResourcePath"));
		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("bInheritExpandSelect"));
		assert.ok(oBinding.hasOwnProperty("oOperation"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.strictEqual(oBinding.bInheritExpandSelect, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, null);

		assert.ok(oParentBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("initialize: absolute, suspended = " + bSuspended, function (assert) {
			var oBinding = this.bindContext("/absolute"),
				oBindingMock = this.mock(oBinding);

			oBindingMock.expects("getRootBinding").withExactArgs().returns(oBinding);
			oBindingMock.expects("isSuspended").withExactArgs().returns(bSuspended);

			oBindingMock.expects("_fireChange")
				.exactly(bSuspended ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			oBinding.initialize();
		});
	});

	//*********************************************************************************************
	QUnit.test("initialize: relative, unresolved", function (assert) {
		var oBinding = this.bindContext("relative");

		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("initialize: relative, resolved, bSuspended = " + bSuspended, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/EMPLOYEES"),
				oBinding = this.bindContext("relative", oContext),
				oBindingMock = this.mock(oBinding),
				oRootBinding = {isSuspended : function () {}};

			oBindingMock.expects("getRootBinding").withExactArgs().returns(oRootBinding);
			this.mock(oRootBinding).expects("isSuspended").withExactArgs().returns(bSuspended);
			oBindingMock.expects("_fireChange")
				.exactly(bSuspended ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			oBinding.initialize();
		});
	});

	//*********************************************************************************************
	QUnit.test("c'tor calls applyParameters", function (assert) {
		var oBinding,
			mParameters = {},
			mParametersClone = {};

		this.mock(jQuery).expects("extend").withExactArgs(true, {}, sinon.match.same(mParameters))
			.returns(mParametersClone);
		this.mock(ODataContextBinding.prototype).expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));

		oBinding = new ODataContextBinding(this.oModel, "/EMPLOYEES", undefined, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined, "c'tor does not set mParameters");
	});

	//*********************************************************************************************
	[false, undefined].forEach(function (bInheritExpandSelect) {
		QUnit.test("applyParameters (as called by c'tor), inheritExpandSelect="
			+ bInheritExpandSelect, function (assert) {
			var sGroupId = "foo",
				oModelMock = this.mock(this.oModel),
				oBinding = this.bindContext("/EMPLOYEES"),
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
			this.mock(oBinding).expects("checkBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
			this.mock(oBinding).expects("fetchCache").withExactArgs(undefined)
				.callsFake(function () {
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
	[false, true].forEach(function (bSuspended) {
		[undefined, false, true].forEach(function (bAction) {
			var sTitle = "applyParameters: operation binding, bAction=" + bAction + ", bSuspended="
					+ bSuspended;

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindContext("/OperationImport(...)"),
					oBindingMock = this.mock(oBinding),
					sGroupId = "foo",
					sUpdateGroupId = "update foo",
					oModelMock = this.mock(this.oModel),
					mParameters = {
						$$groupId : sGroupId,
						$$updateGroupId : sUpdateGroupId
					},
					mQueryOptions = {};

				oBinding.oOperation.bAction = bAction;

				oBindingMock.expects("checkBindingParameters")
					.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
				oModelMock.expects("buildQueryOptions")
					.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
				oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
				oBindingMock.expects("checkUpdateInternal").never();
				oBindingMock.expects("execute").exactly(bSuspended || bAction !== false ? 0 : 1)
					.withExactArgs();
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
	});

	//*********************************************************************************************
	[true, false].forEach(function (bInheritExpandSelect, i) {
		QUnit.test("applyParameters: action binding, " + i, function (assert) {
			var oBinding = this.bindContext("/ActionImport(...)"),
				oBindingMock = this.mock(oBinding),
				sGroupId = "foo",
				sUpdateGroupId = "update foo",
				oModelMock = this.mock(this.oModel),
				mParameters = {
					$$groupId : sGroupId,
					$$inheritExpandSelect : bInheritExpandSelect,
					$$updateGroupId : sUpdateGroupId
				},
				mQueryOptions = {};

			oBinding.oOperation.bAction = true;

			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
			oBindingMock.expects("checkBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
			oBindingMock.expects("checkUpdateInternal").never();
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
	[false, true].forEach(function (bSuspended) {
		QUnit.test("applyParameters: no operation binding, " + bSuspended, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/EMPLOYEES"),
				oBinding = this.bindContext("", oContext),
				oBindingMock = this.mock(oBinding),
				sGroupId = "foo",
				sUpdateGroupId = "update foo",
				oModelMock = this.mock(this.oModel),
				mParameters = {
					$$groupId : sGroupId,
					$$updateGroupId : sUpdateGroupId
				},
				mQueryOptions = {};

			oBindingMock.expects("checkBindingParameters")
				.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters);
			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
			oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
			oBindingMock.expects("checkUpdateInternal").never();
			oBindingMock.expects("execute").never();
			oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1)
				.withExactArgs(sinon.match.same(oContext));
			if (bSuspended) {
				oBindingMock.expects("refreshInternal").never();
			} else {
				oBindingMock.expects("refreshInternal").withExactArgs("", undefined, true)
					.returns(SyncPromise.reject(new Error())); // avoid "Uncaught (in promise)"
			}

			// code under test (as called by ODataParentBinding#changeParameters)
			oBinding.applyParameters(mParameters, ChangeReason.Filter);

			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
			assert.strictEqual(oBinding.sGroupId, sGroupId, "sGroupId");
			assert.strictEqual(oBinding.sUpdateGroupId, sUpdateGroupId, "sUpdateGroupId");
			assert.strictEqual(oBinding.mParameters, mParameters);
		});
	});

	//*********************************************************************************************
	QUnit.test("applyParameters: $$inheritExpandSelect, no operation binding", function (assert) {
		var oBinding = this.bindContext("/NotAnOperation"),
			oError = new Error(),
			mParameters = {
				$$groupId : "Group",
				$$inheritExpandSelect : true,
				$$updateGroupId : "UpdateGroup"
			};

		this.mock(oBinding).expects("checkBindingParameters")
			.withExactArgs(sinon.match.same(mParameters), aAllowedBindingParameters)
			.throws(oError);
		this.mock(this.oModel).expects("buildQueryOptions").never();

		oBinding.sGroupId = "MyGroup";
		oBinding.sUpdateGroupId = "MyUpdateGroup";

		// code under test
		assert.throws(function () {
			oBinding.applyParameters(mParameters);
		}, oError);

		assert.strictEqual(oBinding.sGroupId, "MyGroup", "group id not set");
		assert.strictEqual(oBinding.sUpdateGroupId, "MyUpdateGroup", "update group id not set");
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')"),
			oMixin = {};

		asODataParentBinding(oMixin);

		assert.notStrictEqual(oBinding["destroy"], oMixin["destroy"], "overwrite destroy");
		assert.notStrictEqual(oBinding["doDeregisterChangeListener"],
			oMixin["doDeregisterChangeListener"], "overwrite doDeregisterChangeListener");
		assert.notStrictEqual(oBinding["doSetProperty"],
			oMixin["doSetProperty"], "overwrite doSetProperty");
		Object.keys(oMixin).forEach(function (sKey) {
			if (sKey !== "destroy" && sKey !== "doDeregisterChangeListener"
					&& sKey !== "doSetProperty") {
				assert.strictEqual(oBinding[sKey], oMixin[sKey], sKey);
			}
		});
	});

	//*********************************************************************************************
[{
	oParameterContext : {destroy : function () {}},
	oReturnValueContext : null
}, {
	oParameterContext : null,
	oReturnValueContext : { destroy : function () {}}
}].forEach(function (oFixture, i) {
	QUnit.test("setContext, relative path, " + i, function (assert) {
		var oBinding,
			oContext = {
				getBinding : function () {},
				getPath : function () { return "/contextPath"; }
			},
			oModelMock = this.mock(this.oModel),
			oSetContextSpy = this.spy(Binding.prototype, "setContext");

		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();
		oBinding = this.bindContext("relative");
		oModelMock.expects("resolve").twice()
			.withExactArgs("relative", sinon.match.same(oContext))
			.returns("/contextPath/relative");
		this.mock(oBinding).expects("_fireChange").twice()
			.withExactArgs({reason : ChangeReason.Context});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oContext, oContext);
		assert.strictEqual(oBinding.getBoundContext().getPath(), "/contextPath/relative");
		assert.strictEqual(oSetContextSpy.callCount, 1);

		oBinding.oParameterContext = oFixture.oParameterContext;
		oBinding.oReturnValueContext = oFixture.oReturnValueContext;
		this.mock(oBinding.getBoundContext()).expects("destroy").withExactArgs();
		if (oFixture.oParameterContext) {
			this.mock(oBinding.oParameterContext).expects("destroy").withExactArgs();
		}
		if (oFixture.oReturnValueContext) {
			this.mock(oBinding.oReturnValueContext).expects("destroy").withExactArgs();
		}

		oModelMock.expects("resolve").withExactArgs("relative", undefined).returns(undefined);

		// code under test: reset parent binding fires change
		oBinding.setContext(undefined);

		assert.strictEqual(oBinding.oContext, undefined);
		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oBinding.oParameterContext, null);
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
						this.oCache = oTargetCache;
						this.oCachePromise = SyncPromise.resolve(oTargetCache);
					});
			}
			if (oTargetContext) {
				oModelMock.expects("resolve").exactly(oFixture.sTarget === "v4" ? 2 : 1)
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
					oFixture.sTarget === "base" ? oTargetCache : null);
			});
		});
	});


	//*********************************************************************************************
	QUnit.test("setContext, relative path with parameters", function (assert) {
		var oBinding = this.bindContext("TEAM_2_MANAGER", null, {$select : "Name"}),
			oBindingMock = this.mock(oBinding),
			oCache = {},
			oContext = Context.create(this.oModel, /*oBinding*/{}, "/TEAMS", 1);

		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				this.oCache = oContext ? oCache : null;
				this.oCachePromise = SyncPromise.resolve(this.oCache);
			});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

		oCache = null;
		oContext = undefined;

		oBindingMock.expects("fetchCache").withExactArgs(undefined).callsFake(function () {
			this.oCache = null;
			this.oCachePromise = SyncPromise.resolve(null);
		});

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
	});

	//*********************************************************************************************
	QUnit.test("setContext on resolved binding", function (assert) {
		var oBinding = this.bindContext("/EntitySet('foo')/child");

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
				"TEAMS('TEAM_01')/TEAM_2_MANAGER", {"sap-client": "111"}, false, sinon.match.func)
			.returns({});

		// code under test
		oBinding = this.bindContext("TEAM_2_MANAGER", oContext);

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
				this.oCache = oCache;
				this.oCachePromise = SyncPromise.resolve(oCache);
			});

		// code under test
		oBinding = this.bindContext("/EMPLOYEES(ID='1')", oContext);

		assert.ok(oBinding instanceof ODataContextBinding);
		assert.strictEqual(oBinding.getModel(), this.oModel);
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.strictEqual(oBinding.getPath(), "/EMPLOYEES(ID='1')");
		assert.strictEqual(oBinding.oCache, oCache);
		assert.ok(oBinding.oCachePromise, "oCache is initialized");
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
		assert.strictEqual(oBinding.hasOwnProperty("mQueryOptions"), true);
		assert.deepEqual(oBinding.mQueryOptions, {});
		assert.strictEqual(oBinding.hasOwnProperty("sGroupId"), true);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.hasOwnProperty("sUpdateGroupId"), true);
		assert.strictEqual(oBinding.sUpdateGroupId, undefined);
		assert.strictEqual(oBinding.hasOwnProperty("mCacheByResourcePath"), true);
		assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
	});

	//*********************************************************************************************
	["/", "foo/"].forEach(function (sPath) {
		QUnit.test("bindContext with invalid path: " + sPath, function (assert) {
			assert.throws(function () {
				this.bindContext(sPath);
			}, new Error("Invalid path: " + sPath));
		});
	});

	//*********************************************************************************************
	QUnit.test("bindContext with invalid parameters", function (assert) {
		var oError = new Error("Unsupported ...");

		this.mock(this.oModel).expects("buildQueryOptions").throws(oError);

		assert.throws(function () {
			this.bindContext("/EMPLOYEES(ID='1')", null, {});
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("refresh cancels pending read", function (assert) {
		var oBinding,
			oBindingMock,
			oContext = Context.create(this.oModel, null, "/TEAMS('TEAM_01')"),
			oGroupLock1 = {unlock : function () {}},
			oGroupLock2 = {},
			oPromise;

		this.mock(ODataContextBinding.prototype).expects("lockGroup")
			.withExactArgs("$direct", true)
			.returns(oGroupLock1);
		oBinding = this.bindContext("/EMPLOYEES(ID='1')", oContext,
			{$$groupId : "$direct"}); // to prevent that the context is asked for the group ID

		this.oRequestorMock.expects("request")
			.withExactArgs("GET", "EMPLOYEES(ID='1')?sap-client=111", sinon.match.same(oGroupLock1),
				undefined, undefined, sinon.match.func, undefined, "/EMPLOYEES")
			.callsArg(5)
			.returns(Promise.resolve({"ID" : "1"}));
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EMPLOYEES(ID='1')", sClassName, sinon.match({canceled : true}));
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}});
		this.mock(oGroupLock1).expects("unlock").withExactArgs(true);

		// trigger read before refresh
		oPromise = oBinding.fetchValue("/EMPLOYEES(ID='1')/ID").then(function () {
			assert.ok(false, "First read has to be canceled");
		}, function (oError1) {
			assert.strictEqual(oError1.canceled, true);
			// no Error is logged because error has canceled flag
		});

		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("group", true)
			.returns(oGroupLock2);

		// code under test (as called by ODataBinding#refresh)
		oBinding.refreshInternal("", "group", true);

		return oPromise;
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (read required)", function (assert) {
		var oBinding = this.bindContext("/absolute"),
			oBindingMock = this.mock(oBinding),
			oGroupLock = {},
			oListener = {},
			oPromise;

		oBinding.oReadGroupLock = undefined; // not interested in the initial case
		oBindingMock.expects("lockGroup").withExactArgs().returns(oGroupLock);
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
		var oBinding = this.bindContext("/absolute"),
			oBindingMock = this.mock(oBinding),
			oGroupLock = {};

		oBinding.oReadGroupLock = undefined; // not interested in the initial case
		oBindingMock.expects("lockGroup").withExactArgs().returns(oGroupLock);
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
	[true, false].forEach(function (bSuccess, i) {
		QUnit.test("fetchValue: absolute binding (access cached value) #" + i, function (assert) {
			var oBinding = this.bindContext("/absolute"),
				oBindingMock = this.mock(oBinding),
				oError = {},
				oReadGroupLock = {},
				oReadPromise = bSuccess ? SyncPromise.resolve("value") : SyncPromise.reject(oError);

			oBinding.oReadGroupLock = oReadGroupLock;
			this.mock(oBinding).expects("lockGroup").never();
			this.mock(this.oModel).expects("reportError").never();
			oBindingMock.expects("fireDataRequested").never();
			oBindingMock.expects("fireDataReceived").never();
			this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
				.withExactArgs(sinon.match.same(_GroupLock.$cached), "bar", sinon.match.func, null)
				// no read required! .callsArg(2)
				.returns(oReadPromise);
			this.mock(oBinding).expects("resolveRefreshPromise")
				.withExactArgs(sinon.match.same(oReadPromise))
				.returns(oReadPromise);

			// code under test
			return oBinding.fetchValue("/absolute/bar", null, true).then(function (vValue) {
				assert.ok(bSuccess);
				assert.strictEqual(vValue, "value");
				assert.strictEqual(oBinding.oReadGroupLock, oReadGroupLock);
			}, function (oError0) {
				assert.ok(!bSuccess);
				assert.strictEqual(oError0, oError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: absolute binding (failure)", function (assert) {
		var oBinding,
			oCacheMock,
			oExpectedError = new Error("Expected read failure"),
			oGroupLock1 = {unlock : function () {}},
			oGroupLock2 = {unlock : function () {}},
			oODataContextBindingMock = this.mock(ODataContextBinding.prototype),
			oRejectedPromise = SyncPromise.reject(oExpectedError);

		oODataContextBindingMock.expects("lockGroup").withExactArgs("$direct", true)
			.returns(oGroupLock1);
		oBinding = this.bindContext("/absolute", undefined, {$$groupId : "$direct"});
		oCacheMock = this.mock(oBinding.oCachePromise.getResult());
		oODataContextBindingMock.expects("lockGroup").withExactArgs().returns(oGroupLock2);
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
[
	{path : "name", value : "value"},
	{path : "name/complex", value : {complex : "value"}}
].forEach( function (oFixture) {
	var sTitle = "fetchValue: operation binding returns $Parameter path: " + oFixture.path;
	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)"),
			oListener = {};

		oBinding.oCachePromise = SyncPromise.resolve({/* cache must be ignored! */});
		oBinding.setParameter("name", oFixture.value);
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/OperationImport(...)/$Parameter/" + oFixture.path)
			.returns("$Parameter/" + oFixture.path);
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), oFixture.path,
				sinon.match.same(oListener));

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/OperationImport(...)/$Parameter/" + oFixture.path,
				oListener).getResult(),
			"value"
		);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchValue: operation binding, not clear which $Parameter", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)");

		oBinding.oCachePromise = SyncPromise.resolve({/* cache must be ignored! */});
		oBinding.setParameter("undefined", "n/a");
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/OperationImport(...)/$Parameter")
			.returns("$Parameter");
		this.mock(_Helper).expects("addByPath").never();

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/OperationImport(...)/$Parameter").getResult(),
			undefined
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: operation binding, complex $Parameter value", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)"),
			oListener = {};

		oBinding.oCachePromise = SyncPromise.resolve({/* cache must be ignored! */});
		oBinding.setParameter("address", {city : "Walldorf"});
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/OperationImport(...)/$Parameter/address/city")
			.returns("$Parameter/address/city");
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "address/city",
				sinon.match.same(oListener));

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/OperationImport(...)/$Parameter/address/city", oListener)
				.getResult(),
			"Walldorf"
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: operation binding, not $Parameter, no cache", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)");

		oBinding.setParameter("bar", "n/a");
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/OperationImport(...)/foo/bar")
			.returns("foo/bar");

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/OperationImport(...)/foo/bar").getResult(),
			undefined
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: operation binding with invalid parameter", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)");

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/OperationImport(...)/$Parameter/foo").getResult(),
			null
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue : Unresolved binding: resolve with undefined", function (assert) {
		assert.strictEqual(
			// code under test
			this.bindContext("navigation2").fetchValue("").getResult(),
			undefined
		);
		assert.strictEqual(
			// code under test
			this.bindContext("navigation2").fetchValue("$Parameter/foo").getResult(),
			undefined
		);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/o cache", function (assert) {
		var bCached = {/*false,true*/},
			oContext = {
				fetchValue : function () {},
				getPath : function () {return "/absolute";}
			},
			oListener = {},
			sPath = "/absolute/navigation/bar",
			oResult = {},
			oBinding = this.bindContext("navigation", oContext);

		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			// code under test
			oBinding.fetchValue(sPath, oListener, bCached).getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/ cache, mismatch", function (assert) {
		var bCached = {/*false,true*/},
			oBinding,
			oContext = {
				fetchValue : function () {},
				getPath : function () {return "/absolute";}
			},
			oListener = {},
			sPath = "/absolute/bar",
			oResult = {};

		this.mock(ODataContextBinding.prototype).expects("fetchCache").atLeast(1)
			.callsFake(function (oContext0) {
				this.oCache = oContext0 ? {} : null;
				this.oCachePromise = SyncPromise.resolve(this.oCache);
		});
		oBinding = this.bindContext("navigation", oContext, {$$groupId : "$direct"});
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs(sPath).returns(undefined);
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			oBinding.fetchValue(sPath, oListener, bCached).getResult(),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: suspended root binding", function (assert) {
		var oBinding = this.bindContext("~path~"),
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

		oBinding = this.bindContext("SO_2_BP");

		[
			"AggregatedDataStateChange",
			"change",
			"dataReceived",
			"dataRequested",
			"DataStateChange",
			"patchCompleted",
			"patchSent"
		].forEach(function (sEvent) {
			oBindingMock.expects("attachEvent")
				.withExactArgs(sEvent, sinon.match.same(mEventParameters)).returns(oReturn);

			assert.strictEqual(oBinding.attachEvent(sEvent, mEventParameters), oReturn);
		});

		assert.throws(function () {
			oBinding.attachEvent("unsupportedEvent");
		}, new Error("Unsupported event 'unsupportedEvent': v4.ODataContextBinding#attachEvent"));
	});

	//*********************************************************************************************
	QUnit.test("$$groupId, $$updateGroupId", function (assert) {
		var oBinding,
			oModelMock = this.mock(this.oModel);

		oModelMock.expects("getGroupId").twice().withExactArgs().returns("baz");
		oModelMock.expects("getUpdateGroupId").twice().withExactArgs().returns("fromModel");

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined,
			{$$groupId : "foo", $$updateGroupId : "bar"});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", undefined, {$$groupId : "foo"});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// code under test
		oBinding = this.oModel.bindContext("/EMPLOYEES('4711')", {}, {});
		assert.strictEqual(oBinding.getGroupId(), "baz");
		assert.strictEqual(oBinding.getUpdateGroupId(), "fromModel");

		// checkBindingParameters also called for relative binding
		oBinding = this.oModel.bindContext("EMPLOYEE_2_TEAM", undefined,
			{$$groupId : "foo", $$updateGroupId : "bar"});
		assert.strictEqual(oBinding.getGroupId(), "foo");
		assert.strictEqual(oBinding.getUpdateGroupId(), "bar");
	});

	//*********************************************************************************************
	QUnit.test("read uses group ID", function (assert) {
		var oBinding = this.bindContext("/absolute", undefined, {$$groupId : "$direct"}),
			oGroupLock = {};

		oBinding.oReadGroupLock = oGroupLock;
		this.mock(oBinding.oCachePromise.getResult()).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "foo", sinon.match.func, undefined)
			.returns(SyncPromise.resolve());

		// code under test
		oBinding.fetchValue("/absolute/foo");
	});

	//*********************************************************************************************
	QUnit.test("execute: absolute", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding,
			oGroupLock = {},
			oPromise = {};

		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();
		oBinding = this.bindContext(sPath);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
		this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
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
				oBinding = this.bindContext("schema.Operation(...)", oContext),
				oGroupLock = {},
				oPromise = {};

			if (bBaseContext) {
				delete oContext.isTransient;
			}
			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(this.oModel).expects("checkGroupId").withExactArgs("groupId");
			this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
				.returns(oGroupLock);
			this.mock(oBinding).expects("_execute")
				.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

			// code under test
			assert.strictEqual(oBinding.execute("groupId"), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("execute: invalid group ID", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)"),
			oError = new Error("Invalid");

		this.mock(oBinding.oModel).expects("checkGroupId").withExactArgs("$invalid").throws(oError);

		assert.throws(function () {
			oBinding.execute("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("execute: unresolved relative binding", function (assert) {
		var oBinding = this.bindContext("schema.Operation(...)");

		assert.throws(function () {
			oBinding.execute();
		}, new Error("Unresolved binding: schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("execute: relative binding with deferred parent", function (assert) {
		var oBinding,
			oParentBinding = this.bindContext("/OperationImport(...)");

		oParentBinding.initialize();
		oBinding = this.bindContext("schema.Operation(...)", oParentBinding.getBoundContext());

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
				getPath: function () { return "/Employees($uid=id-1-23)";}
			};

		oBinding = this.bindContext("schema.Operation(...)", oContext);

		assert.throws(function () {
			// code under test
			oBinding.execute();
		}, new Error("Execute for transient context not allowed: "
			+ "/Employees($uid=id-1-23)/schema.Operation(...)"));
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
		error : "Expected a single overload, but found 0 for"
			+ " /EntitySet(ID='1')/schema.EmptyOverloads(...)"
	}, {
		path : "/EntitySet(ID='1')/schema.OverloadedFunction(...)",
		request : "/EntitySet/schema.OverloadedFunction/@$ui5.overload",
		metadata : [{$kind : "Function"}, {$kind : "Function"}],
		error : "Expected a single overload, but found 2 for"
			+ " /EntitySet(ID='1')/schema.OverloadedFunction(...)"
	}].forEach(function (oFixture) {
		QUnit.test("_execute: " + oFixture.error, function (assert) {
			var oGroupLock = {
					getGroupId :  function () {},
					unlock : function () {}
				};

			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs(oFixture.request)
				.returns(Promise.resolve(oFixture.metadata));
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to execute " + oFixture.path, sClassName, sinon.match.instanceOf(Error));

			return this.bindContext(oFixture.path)
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
		oBinding = this.bindContext("/FunctionImport(...)");

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		oCachePromise = oBinding.oCachePromise;
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_fireChange").never();
		oBindingMock.expects("fetchCache").never();
		oBindingMock.expects("createReadGroupLock").never();
		oBindingMock.expects("getDependentBindings").never();

		// code under test (as called by ODataBinding#refresh)
		assert.strictEqual(oBinding.refreshInternal("", undefined, true).isFulfilled(), true);

		assert.strictEqual(oBinding.oCachePromise, oCachePromise, "must not recreate the cache");

		return oBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("function, base context, no execute", function (assert) {
		var oBaseContext = this.oModel.createBindingContext("/"),
			oBinding = this.bindContext("FunctionImport(...)", oBaseContext);

		this.mock(oBinding).expects("_fireChange").never();
		this.mock(oBinding).expects("createReadGroupLock").never();
		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);

		// code under test (as called by ODataBinding#refresh)
		assert.strictEqual(oBinding.refreshInternal("", undefined, true).isFulfilled(), true);

		return oBinding.fetchValue("").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bRelative) {
		var sTitle = "_execute: OperationImport, relative (to base context): " + bRelative;

		QUnit.test(sTitle, function (assert) {
			var oBaseContext = this.oModel.createBindingContext("/"),
				oGroupLock = {getGroupId : function () {}},
				oOperationMetadata = {},
				sPath = (bRelative ? "" : "/") + "OperationImport(...)",
				sResolvedPath = "/OperationImport(...)",
				oPromise,
				oBinding = this.bindContext(sPath, oBaseContext),
				oBindingMock = this.mock(oBinding);

			oBindingMock.expects("getResolvedPath").withExactArgs().returns(sResolvedPath);
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/OperationImport/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock), "/OperationImport(...)",
					sinon.match.same(oOperationMetadata), undefined)
				.returns(SyncPromise.resolve({/*oResult*/}));
			oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			oBindingMock.expects("refreshDependentBindings").withExactArgs("", "groupId", true)
				.returns(SyncPromise.resolve(Promise.resolve()));

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
					oGroupLock0 = {getGroupId : function () {}},
					oOperationMetadata = {},
					oRootBinding = {
						getRootBinding : function () { return oRootBinding; },
						isSuspended : function () { return false; }
					},
					oParentContext1 = createContext("/EntitySet(ID='1')/navigation1"),
					oParentContext2 = createContext("/EntitySet(ID='2')/navigation1"),
					oBinding = this.bindContext(sOperation + "(...)", oParentContext1,
						{$$groupId : "groupId"}),
					oBindingMock = this.mock(oBinding),
					oModelMock = this.mock(this.oModel);

				function createContext(sPath) {
					return bBaseContext
						? that.oModel.createBindingContext(sPath)
						: Context.create(that.oModel, oRootBinding, sPath);
				}

				function expectChangeAndRefreshDependent(oGroupLock) {
					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Change});
					that.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
					oBindingMock.expects("refreshDependentBindings")
						.withExactArgs("", "groupId", true)
						.returns(SyncPromise.resolve(Promise.resolve()));
				}

				this.mock(this.oModel.getMetaModel()).expects("fetchObject").twice()
					.withExactArgs("/EntitySet/navigation1/" + sOperation + "/@$ui5.overload")
					.returns(SyncPromise.resolve([oOperationMetadata]));
				oBindingMock.expects("isReturnValueLikeBindingParameter").twice()
					.withExactArgs(sinon.match.same(oOperationMetadata))
					.returns(false);
				oBindingMock.expects("hasReturnValueContext").twice()
					.withExactArgs(sinon.match.same(oOperationMetadata))
					.returns(false);

				// code under test - must not ask its context
				assert.strictEqual(
					oBinding.fetchValue(oBinding.getBoundContext().getPath()).getResult(),
					undefined
				);

				if (bBaseContext) {
					oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock0),
							"/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), undefined);
				} else {
					oExpectation = oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock0),
							"/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
							sinon.match.same(oOperationMetadata), sinon.match.func);
					this.mock(oParentContext1).expects("getValue").on(oParentContext1)
						.withExactArgs(sPathPrefix).returns(oEntity);
				}
				expectChangeAndRefreshDependent(oGroupLock0);

				// code under test
				return oBinding._execute(oGroupLock0).then(function (oReturnValueContext) {
					var oGroupLock1 = {getGroupId : function () {}};

					assert.strictEqual(oReturnValueContext, undefined);
					if (oExpectation) {
						//TODO avoid to trigger a request via getObject, which does not wait for
						// results anyway!
						assert.strictEqual(oExpectation.args[0][3](), oEntity);
					}

					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Context});
					// @see Context#destroy for element and parameter context
					oModelMock.expects("getDependentBindings").returns([]).exactly(2);

					// code under test: setContext clears the cache
					oBinding.setContext(oParentContext2);

					if (bBaseContext) {
						oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock1),
								"/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
								sinon.match.same(oOperationMetadata), undefined);
					} else {
						oExpectation = oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock1),
								"/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
								sinon.match.same(oOperationMetadata), sinon.match.func);
						that.mock(oParentContext2).expects("getValue").on(oParentContext2)
							.withExactArgs(sPathPrefix).returns(oEntity);
					}
					expectChangeAndRefreshDependent(oGroupLock1);

					// code under test: execute creates a new cache with the new path
					return oBinding.setParameter("foo", "bar")._execute(oGroupLock1)
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
	[false, true].forEach(function (bOnCollection) {
		var sTitle = "_execute: bound operation " + (bOnCollection ? "on a collection " : "")
				+ "with return value context";

		QUnit.test(sTitle, function (assert) {
			var oContextMock = this.mock(Context),
				bDependentsRefreshed,
				oError = {},
				oGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				},
				oGroupLockMock = this.mock(oGroupLock),
				oOperationMetadata = {},
				oRootBinding = {
					getRootBinding : function () { return oRootBinding; },
					isSuspended : function () { return false; }
				},
				sParentContextPath = bOnCollection ? "/TEAMS" : "/TEAMS('42')",
				oParentContext = Context.create(this.oModel, oRootBinding, sParentContextPath),
				oParentContextMock = this.mock(oParentContext),
				oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
					{$$groupId : "groupId"}),
				oBindingMock = this.mock(oBinding),
				oMetaModelMock = this.mock(this.oModel.getMetaModel()),
				oModelMock = this.mock(this.oModel),
				oParentEntity = {},
				oResponseEntity = {},
				oReturnValueContextFirstExecute = {destroy : function () {}},
				oReturnValueContextSecondExecute = {destroy : function () {}},
				that = this;

			function asyncRefresh() {
				bDependentsRefreshed = false;
				return new SyncPromise(function (resolve) {
					setTimeout(function () {
						bDependentsRefreshed = true;
						resolve();
					});
				});
			}

			oMetaModelMock.expects("fetchObject")
				.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			if (!bOnCollection) {
				_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
			}
			_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock),
					sParentContextPath + "/name.space.Operation(...)",
					sinon.match.same(oOperationMetadata), sinon.match.func)
				.returns(Promise.resolve(oResponseEntity));
			oBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});
			oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
			oBindingMock.expects("refreshDependentBindings")
				.withExactArgs("", "groupId", true).returns(asyncRefresh());
			oBindingMock.expects("isReturnValueLikeBindingParameter")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(true);
			oBindingMock.expects("hasReturnValueContext")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(true);
			oParentContextMock.expects("getValue")
				.returns(oParentEntity);
			oContextMock.expects("createReturnValueContext")
				.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
					"/TEAMS('77')")
				.returns(oReturnValueContextFirstExecute);

			// code under test
			return oBinding._execute(oGroupLock).then(function (oReturnValueContext0) {
				assert.strictEqual(oReturnValueContext0, oReturnValueContextFirstExecute);
				assert.strictEqual(bDependentsRefreshed, true);

				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
					.returns(SyncPromise.resolve([oOperationMetadata]));
				oBindingMock.expects("createCacheAndRequest")
					.withExactArgs(sinon.match.same(oGroupLock),
						sParentContextPath + "/name.space.Operation(...)",
						sinon.match.same(oOperationMetadata), sinon.match.func)
					.returns(Promise.resolve(oResponseEntity));
				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});
				oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
				oBindingMock.expects("refreshDependentBindings")
					.withExactArgs("", "groupId", true).returns(asyncRefresh());
				oBindingMock.expects("isReturnValueLikeBindingParameter")
					.withExactArgs(sinon.match.same(oOperationMetadata))
					.returns(true);
				oBindingMock.expects("hasReturnValueContext")
					.withExactArgs(sinon.match.same(oOperationMetadata))
					.returns(true);
				oParentContextMock.expects("getValue")
					.returns(oParentEntity);
				that.mock(oReturnValueContextFirstExecute).expects("destroy").withExactArgs();
				oContextMock.expects("createReturnValueContext")
					.withExactArgs(sinon.match.same(that.oModel), sinon.match.same(oBinding),
						"/TEAMS('77')")
					.returns(oReturnValueContextSecondExecute);

				// code under test
				return oBinding._execute(oGroupLock);
			}).then(function (oReturnValueContext1) {
				assert.strictEqual(oReturnValueContext1, oReturnValueContextSecondExecute);

				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
					.returns(SyncPromise.resolve([oOperationMetadata]));
				oBindingMock.expects("createCacheAndRequest")
					.withExactArgs(sinon.match.same(oGroupLock),
						sParentContextPath + "/name.space.Operation(...)",
						sinon.match.same(oOperationMetadata), sinon.match.func)
					.returns(Promise.reject(oError));
				oBindingMock.expects("_fireChange")
					.withExactArgs({reason : ChangeReason.Change});
				oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
				oBindingMock.expects("refreshDependentBindings").withExactArgs("", "groupId", true)
					.returns(SyncPromise.resolve(Promise.resolve()));
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
	[{
		sId : "42",
		bRead : true
	}, {
		sId : "42",
		bRead : false
	}, {
		sId : "77",
		bRead : true
	}].forEach(function (oFixture) {
		QUnit.test("_execute: bound operation " + (oFixture.bRead ? "" : "on context w/o read ") +
				"returning the same entity type with key " + oFixture.sId,
				function (assert) {
			var oParentContext = Context.create(this.oModel, {/*binding*/}, "/TEAMS('42')"),
				oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
					{$$groupId : "groupId"}),
				oBindingMock = this.mock(oBinding),
				oGroupLock = {getGroupId : function () {}},
				oOperationMetadata = {},
				oParentEntity = {},
				oResponseEntity = {};

			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
			_Helper.setPrivateAnnotation(oResponseEntity, "predicate",
					"('" + oFixture.sId + "')");
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock),
					"/TEAMS('42')/name.space.Operation(...)",
					sinon.match.same(oOperationMetadata), sinon.match.func)
				.returns(Promise.resolve(oResponseEntity));
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			oBindingMock.expects("getDependentBindings").withExactArgs().returns([]);
			oBindingMock.expects("isReturnValueLikeBindingParameter")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(true);
			oBindingMock.expects("hasReturnValueContext")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(true);
			this.mock(oParentContext).expects("getValue")
				.returns(oFixture.bRead ? oParentEntity : undefined);
			this.mock(oParentContext).expects("patch")
				.exactly(oFixture.bRead && oFixture.sId === "42" ? 1 : 0)
				.withExactArgs(sinon.match.same(oResponseEntity));

			// code under test
			return oBinding._execute(oGroupLock).then(function (oReturnValueContext) {
				// expect the return value context in any case, even when synchronized
				assert.strictEqual(oReturnValueContext.getPath(),
						"/TEAMS('" + oFixture.sId + "')");
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSameId) {
		var sTitle = "_execute: bound action on navigation property updates binding parameter, "
				+ bSameId;

		QUnit.test(sTitle, function (assert) {
			var oParentContext = Context.create(this.oModel, {/*binding*/},
					"/TEAMS('42')/TEAM_2_MANAGER"),
				oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
					{$$groupId : "groupId"}),
				oBindingMock = this.mock(oBinding),
				oGroupLock = {getGroupId : function () {}},
				oOperationMetadata = {},
				oParentEntity = {},
				oResponseEntity = {};

			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/TEAMS/TEAM_2_MANAGER/name.space.Operation/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
			_Helper.setPrivateAnnotation(oResponseEntity, "predicate", bSameId ? "('42')" : "()");
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock),
					"/TEAMS('42')/TEAM_2_MANAGER/name.space.Operation(...)",
					sinon.match.same(oOperationMetadata), sinon.match.func)
				.returns(Promise.resolve(oResponseEntity));
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			oBindingMock.expects("getDependentBindings").withExactArgs().returns([]);
			oBindingMock.expects("isReturnValueLikeBindingParameter")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(true);
			oBindingMock.expects("hasReturnValueContext")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(false);
			this.mock(oParentContext).expects("getValue")
				.returns(oParentEntity);
			this.mock(oParentContext).expects("patch").exactly(bSameId ? 1 : 0)
				.withExactArgs(sinon.match.same(oResponseEntity));

			// code under test
			return oBinding._execute(oGroupLock).then(function (oReturnValueContext) {
				// expect no return value context
				assert.strictEqual(oReturnValueContext, undefined);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("_execute: OperationImport, failure", function (assert) {
		var bDependentsRefreshed = false,
			sPath = "/OperationImport(...)",
			oBinding = this.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs(sinon.match.same(oGroupLock),
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.reject(oError));
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		oBindingMock.expects("refreshDependentBindings").withExactArgs("", "groupId", true)
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}));
		oModelMock.expects("reportError").withExactArgs(
			"Failed to execute " + sPath, sClassName, sinon.match.same(oError));
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);

		// code under test
		return oBinding._execute(oGroupLock).then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.strictEqual(bDependentsRefreshed, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("_execute: OperationImport, error in change handler", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.bindContext(sPath),
			oBindingMock = this.mock(oBinding),
			oError = new Error("deliberate failure"),
			oGroupLock = {unlock : function () {}},
			oModelMock = this.mock(this.oModel),
			oOperationMetadata = {};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		oBindingMock.expects("createCacheAndRequest").withExactArgs(sinon.match.same(oGroupLock),
				"/OperationImport(...)", sinon.match.same(oOperationMetadata), undefined)
			.returns(SyncPromise.resolve({/*oResult*/}));
		// Note: if control's handler fails, we don't care about state of dependent bindings
		oBindingMock.expects("getDependentBindings").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
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
	[{
		error : {
			details : [
				{target : "_it"},
				{target : "_it/Name"},
				{target : "bar"},
				{target : null},
				{}
			],
			target : "foo"
		},
		reported : {
			details : [
				{target : ""},
				{target : "Name"},
				{},
				{},
				{}
			]
		}
	}, {
		error : {target : "_it"},
		reported : {target : ""}
	}, {
		error : {target : "_it/Name"},
		reported : {target : "Name"}
	}, {
		error : {},
		reported : {}
	}, {
		// no error -> nothing reported
	}].forEach(function (oFixture, i) {
		QUnit.test("_execute: bound operation failure with messages #" + i, function (assert) {
			var oParentContext = Context.create(this.oModel, {/*binding*/}, "/TEAMS('42')"),
				oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
					{$$groupId : "groupId"}),
				oBindingMock = this.mock(oBinding),
				oError = new Error("Operation failed"),
				oGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				},
				oOperationMetadata = {
					$IsBound : true,
					$Parameter : [{
						$Name : "_it"
					}]
				};

			oError.error = oFixture.error;
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
				.returns(SyncPromise.resolve([oOperationMetadata]));
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock),
					"/TEAMS('42')/name.space.Operation(...)",
					sinon.match.same(oOperationMetadata), sinon.match.func)
				.rejects(oError);
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);
			this.mock(this.oModel).expects("reportError")
				.withExactArgs("Failed to execute /TEAMS('42')/name.space.Operation(...)",
					sClassName, sinon.match.same(oError))
				.callsFake(function (sLogMessage, sReportingClassName, oError) {
					assert.strictEqual(oError.resourcePath, "TEAMS('42')");
					assert.deepEqual(oError.error, oFixture.reported);
				});

			// code under test
			return oBinding._execute(oGroupLock).then(function () {
				assert.ok(false);
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: FunctionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			oGroupLock = {},
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Function", $ReturnType : {$Type : "Edm.String"}},
			mParameters = {},
			sPath = "/FunctionImport(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "FunctionImport()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		oJQueryMock.expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		oJQueryMock.expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(oBinding.mQueryOptions))
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
				sinon.match.same(mParameters), sinon.match.same(mQueryOptions), undefined)
			.returns(sResourcePath);
		oExpectation = this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.func, false, "/FunctionImport/@$ui5.overload/0/$ReturnType", false)
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);

		// code under test
		assert.strictEqual(oExpectation.args[0][4](), sPath.slice(1));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound function", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			fnGetEntity = {}, // do not call!
			oGroupLock = {},
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Function", $ReturnType : {$Type : "name.space.Type"}},
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
		oExpectation = this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.func, false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType", true)
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);

		// code under test
		assert.strictEqual(oExpectation.args[0][4](), sPath.slice(1));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: ActionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			oGroupLock = {},
			oJQueryMock = this.mock(jQuery),
			oOperationMetadata = {$kind : "Action" /*no $ReturnType*/},
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
		oExpectation = this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.func, true, "/ActionImport/@$ui5.overload/0/$ReturnType", undefined)
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("post")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters), undefined)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, true);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);

		// code under test
		assert.strictEqual(oExpectation.args[0][4](), sPath.slice(1));
	});

	//*********************************************************************************************
	["return value context", "returns 'this'", "returns other", ""].forEach(function (sCase) {
		QUnit.test("createCacheAndRequest: bound action, " + sCase, function (assert) {
			var bAutoExpandSelect = {/*false, true*/},
				oBinding = this.bindContext("n/a(...)"),
				oEntity = {},
				oExpectation,
				fnGetEntity = this.spy(function () {
					return oEntity;
				}),
				fnGetOriginalResourcePath,
				oGroupLock = {},
				oHelperMock = this.mock(_Helper),
				oJQueryMock = this.mock(jQuery),
				oOperationMetadata = {
					$kind : "Action",
					$ReturnType : {$Type : "name.space.Type"}
				},
				mParameters = {},
				sPath = "/Entity('1')/navigation/bound.Action(...)",
				oPromise = {},
				mQueryOptions = {},
				sResourcePath = "Entity('1')/navigation/bound.Action",
				oResponseEntity = {},
				oSingleCache = {
					post : function () {}
				};

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;
			oJQueryMock.expects("extend")
				.withExactArgs({}, sinon.match.same(oBinding.oOperation.mParameters))
				.returns(mParameters);
			oJQueryMock.expects("extend").
				withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(oBinding.mQueryOptions))
				.returns(mQueryOptions);
			this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
				.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
					sinon.match.same(mParameters), sinon.match.same(mQueryOptions),
					sinon.match.same(oEntity))
				.returns(sResourcePath);
			oExpectation = this.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
					sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
					sinon.match.func, true,
					"/Entity/navigation/bound.Action/@$ui5.overload/0/$ReturnType", true)
				.returns(oSingleCache);
			this.mock(oSingleCache).expects("post")
				.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters),
					sinon.match.same(oEntity))
				.returns(oPromise);

			assert.strictEqual(
				// code under test
				oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata,
					fnGetEntity),
				oPromise);
			assert.strictEqual(oBinding.oOperation.bAction, true);
			assert.strictEqual(oBinding.oCache, oSingleCache);
			assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
			assert.strictEqual(fnGetEntity.callCount, 1);

			fnGetOriginalResourcePath = oExpectation.args[0][4];
			switch (sCase) {
				case "return value context":
					this.mock(oBinding).expects("hasReturnValueContext")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter").never();
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oResponseEntity), "predicate")
						.returns("('42')");

					// code under test ("getOriginalResourcePath")
					assert.strictEqual(fnGetOriginalResourcePath(oResponseEntity),
						"Entity('42')");
					break;

				case "returns 'this'":
					this.mock(oBinding).expects("hasReturnValueContext")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(false);
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oEntity), "predicate")
						.returns("('42')");
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oResponseEntity), "predicate")
						.returns("('42')");

					// code under test ("getOriginalResourcePath")
					assert.strictEqual(fnGetOriginalResourcePath(oResponseEntity),
						"Entity('1')/navigation");
					break;

				case "returns other":
					this.mock(oBinding).expects("hasReturnValueContext")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(false);
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oEntity), "predicate")
						.returns("('42')");
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oResponseEntity), "predicate")
						.returns("('23')");

					// code under test ("getOriginalResourcePath")
					assert.strictEqual(fnGetOriginalResourcePath(oResponseEntity),
						"Entity('1')/navigation/bound.Action(...)");
					break;

				default:
					this.mock(oBinding).expects("hasReturnValueContext")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(false);
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(false);
					oHelperMock.expects("getPrivateAnnotation").never();

					// code under test ("getOriginalResourcePath")
					assert.strictEqual(fnGetOriginalResourcePath(oResponseEntity),
						"Entity('1')/navigation/bound.Action(...)");
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: $$inheritExpandSelect", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oContext = Context.create(this.oModel, {}, "/foo"),
			oBinding = this.bindContext("bound.Function(...)", oContext,
				{$$inheritExpandSelect : true}),
			mExpectedQueryOptions = {},
			fnGetEntity = {}, // do not call!
			oGroupLock = {},
			oOperationMetadata = {$kind : "Function", $ReturnType : {$Type : "name.space.Type"}},
			mParameters = {},
			sPath = "/Entity('1')/navigation/bound.Function(...)",
			oPromise = {},
			sResourcePath = "Entity('1')/navigation/bound.Function()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(true);
		this.mock(jQuery).expects("extend")
			.withExactArgs({}, sinon.match.same(oBinding.oOperation.mParameters))
			.returns(mParameters);
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mExpectedQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
				sinon.match.same(mParameters), sinon.match.same(mExpectedQueryOptions),
				sinon.match.same(fnGetEntity))
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mExpectedQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.func, false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType", true)
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock)).returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.mCacheQueryOptions, mExpectedQueryOptions);
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: wrong $kind", function (assert) {
		var oBinding = this.bindContext("n/a(...)"),
			oGroupLock = {},
			oOperationMetadata = {$kind : "n/a"};

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, "/OperationImport(...)", oOperationMetadata);
		}, new Error("Not an operation: /OperationImport(...)"));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: $$inheritExpandSelect on wrong binding",
		function (assert) {
			var oBinding = this.bindContext("bound.Operation(...)", null,
					{$$inheritExpandSelect : true}),
				oGroupLock = {},
				oOperationMetadata = {$kind : "Function"};

			this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
				.withExactArgs(sinon.match.same(oOperationMetadata))
				.returns(false);
			this.mock(oBinding).expects("hasReturnValueContext").never();

			assert.throws(function () {
				// code under test
				oBinding.createCacheAndRequest(oGroupLock, "/Entity('0815')/bound.Operation(...)",
					oOperationMetadata);
			}, new Error("Must not set parameter $$inheritExpandSelect on this binding"));
	});

	//*********************************************************************************************
	QUnit.test("setParameter, execute: not deferred", function (assert) {
		var oBinding = this.bindContext("/OperationImport()");

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
			this.bindContext("/OperationImport(...)/Property");
		}, new Error("The path must not continue after a deferred operation: "
			+ "/OperationImport(...)/Property"));
	});

	//*********************************************************************************************
	QUnit.test("setParameter: undefined", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)");

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
[{}, undefined].forEach( function(vParam) {
	QUnit.test("setParameter: change listeners", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)"),
			vValue = {};

		if (vParam) {
			oBinding.oOperation.mParameters["foo"] = vParam;
		}

		this.mock(_Helper).expects("informAll")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "foo",
				sinon.match.same(oBinding.oOperation.mParameters["foo"]),
				sinon.match.same(vValue));

		// code under test
		oBinding.setParameter("foo", vValue);

		assert.strictEqual(oBinding.oOperation.bAction, undefined);
		assert.strictEqual(oBinding.oOperation.mParameters["foo"], vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oBinding,
			oBindingPrototypeMock = this.mock(ContextBinding.prototype),
			oModelMock = this.mock(this.oModel),
			oParameterContext = Context.create(this.oModel, {}, "/Operation(...)/$Parameter"),
			oParentBindingPrototypeMock = this.mock(asODataParentBinding.prototype),
			oReturnValueContext = Context.create(this.oModel, {}, "/bar");

		oBinding = this.bindContext("relative"); // unresolved: no element context
		oBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();

		oBinding = this.bindContext("relative", Context.create(this.oModel, {}, "/foo"));
		oBinding.mCacheByResourcePath = {/*mCacheByResourcePath*/};
		oBinding.oOperation = {bAction : undefined};
		oBinding.oParameterContext = oParameterContext;
		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding.oElementContext).expects("destroy").withExactArgs();
		this.mock(oParameterContext).expects("destroy").withExactArgs();
		this.mock(oReturnValueContext).expects("destroy").withExactArgs();
		oBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oParentBindingPrototypeMock.expects("destroy").on(oBinding).withExactArgs();
		oModelMock.expects("bindingDestroyed").withExactArgs(sinon.match.same(oBinding));

		// code under test
		oBinding.destroy();

		assert.strictEqual(oBinding.mCacheByResourcePath, undefined);
		assert.strictEqual(oBinding.oElementContext, undefined);
		assert.strictEqual(oBinding.oOperation, undefined);
		assert.strictEqual(oBinding.oParameterContext, undefined);
		assert.strictEqual(oBinding.mParameters, undefined);
		assert.strictEqual(oBinding.mQueryOptions, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, undefined);
	});

	//*********************************************************************************************
[null, {destroy : function () {}}].forEach(function (oReturnValueContext, i) {
	QUnit.test("_destroyContextAfterDelete " + i, function (assert) {
		var oBinding = this.bindContext("/SalesOrders('42')"),
			oElementContext = oBinding.getBoundContext();

		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oElementContext).expects("destroy").withExactArgs();
		if (oReturnValueContext) {
			this.mock(oReturnValueContext).expects("destroy").withExactArgs();
		}
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs(sinon.match({reason : ChangeReason.Remove}));

		// code under test
		oBinding._destroyContextAfterDelete();

		assert.strictEqual(oBinding.oElementContext, null);
		if (oReturnValueContext) {
			assert.strictEqual(oBinding.oReturnValueContext, null);
		}
	});
});

	//*********************************************************************************************
	QUnit.test("_delete: empty path, ODCB - call deleteFromCache", function (assert) {
		var oBinding = this.bindContext(""),
			oContext = Context.create(this.oModel, null, "/SalesOrders('42')"),
			oGroupLock = {},
			oParent = {execute : {}, _destroyContextAfterDelete : function () {}},
			oResult = {};

		this.mock(oBinding).expects("fetchCache");
		oBinding.setContext(oContext);

		this.mock(oBinding).expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oBinding.oElementContext))
			.returns(oContext);
		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs(sinon.match.same(oGroupLock), "SalesOrders('42')", "", undefined,
				sinon.match.func)
			.callsArg(4).returns(oResult);
		this.mock(oContext).expects("getBinding").withExactArgs().returns(oParent);
		this.mock(oParent).expects("_destroyContextAfterDelete").withExactArgs();

		// code under test
		assert.strictEqual(oBinding._delete(oGroupLock, "SalesOrders('42')"), oResult);
	});

	//*********************************************************************************************
	QUnit.test("_delete: empty path, ODLB - delegate to ODLB", function (assert) {
		var oBinding = this.bindContext(""),
			oContext = Context.create(this.oModel, null, "/SalesOrders('42')"),
			oETagEntity = {},
			oGroupLock = {},
			oParent = {},
			oResult = {};

		this.mock(oBinding).expects("fetchCache");
		oBinding.setContext(oContext);

		this.mock(oBinding).expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oBinding.oElementContext))
			.returns(oContext);
		this.mock(oContext).expects("getBinding").withExactArgs().returns(oParent);
		this.mock(oBinding).expects("fetchValue").withExactArgs("", undefined, true)
			.returns(SyncPromise.resolve(oETagEntity));
		this.mock(oContext).expects("_delete")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(oETagEntity))
			.returns(SyncPromise.resolve(oResult));

		// code under test
		oBinding._delete(oGroupLock, "SalesOrders('42')").then(function (oDeleteResult) {
			assert.strictEqual(oDeleteResult, oResult);
		});
	});

	//*********************************************************************************************
	QUnit.test("_delete: empty path, base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/SalesOrders('42')"),
			oBinding = this.bindContext("", oContext),
			oGroupLock = {},
			oResult = {};

		this.mock(oBinding).expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oBinding.oElementContext))
			.returns(oBinding.oElementContext);
		this.mock(oBinding).expects("deleteFromCache")
			.withExactArgs(sinon.match.same(oGroupLock), "SalesOrders('42')", "", undefined,
				sinon.match.func)
			.callsArg(4).returns(oResult);
		this.mock(oBinding).expects("_destroyContextAfterDelete");

		// code under test
		assert.strictEqual(oBinding._delete(oGroupLock, "SalesOrders('42')"), oResult);
	});

	//*********************************************************************************************
	[null, {destroy : function () {}}].forEach(function (oReturnValueContext, i) {
		QUnit.test("_delete: success, " + i, function (assert) {
			var oBinding = this.bindContext("/EMPLOYEES('42')"),
				oElementContext = oBinding.getBoundContext(),
				fnOnRefresh = this.spy(function (oEvent) {
					var oElementContext = oBinding.getBoundContext();

					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
					assert.strictEqual(oElementContext.getBinding(), oBinding);
					assert.strictEqual(oElementContext.getModelIndex(), undefined);
					assert.strictEqual(oElementContext.getModel(), this.oModel);
					assert.strictEqual(oElementContext.getPath(), "/EMPLOYEES('42')");
				}),
				fnOnRemove = this.spy(function (oEvent) {
					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Remove);
					sinon.assert.called(oElementContext.destroy);
					assert.strictEqual(oBinding.getBoundContext(), null);
					if (oReturnValueContext) {
						sinon.assert.called(oReturnValueContext.destroy);
						assert.strictEqual(oBinding.oReturnValueContext, null);
					}
				}),
				oPromise = {};

			oBinding.oReturnValueContext = oReturnValueContext;
			this.mock(oBinding).expects("_findEmptyPathParentContext")
				.withExactArgs(sinon.match.same(oBinding.oElementContext))
				.returns(oBinding.oElementContext);
			this.mock(oBinding).expects("deleteFromCache")
				.withExactArgs("myGroup", "EMPLOYEES('42')", "", undefined, sinon.match.func)
				.callsArg(4).returns(oPromise);
			oBinding.attachChange(fnOnRemove);
			this.spy(oElementContext, "destroy");
			if (oReturnValueContext) {
				this.spy(oReturnValueContext, "destroy");
			}

			// code under test
			assert.strictEqual(oBinding._delete("myGroup", "EMPLOYEES('42')"), oPromise);

			sinon.assert.calledOnce(fnOnRemove);
			oBinding.detachChange(fnOnRemove);
			oBinding.attachChange(fnOnRefresh);
			this.mock(oBinding).expects("createRefreshPromise").withExactArgs();

			// code under test
			return oBinding.refreshInternal("", undefined, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataContextBinding.prototype),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEE('42')"),
			bCheckUpdate = {/*true or false*/},
			bDependentsRefreshed = false,
			oDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			oGroupLock = {},
			bKeepCacheOnError = {/*true or false*/},
			sPath = {/*EMPLOYEES('42')*/},
			oRefreshResult;

		oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {"foo" : "bar"});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("getGroupId").never();
		this.mock(oBinding).expects("setResumeChangeReason").never();
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false)
			.returns(oGroupLock);
		this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs(sinon.match.same(sPath));
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext));
		this.mock(oBinding).expects("createRefreshPromise").withExactArgs().callThrough();
		this.mock(oBinding).expects("refreshDependentBindings")
			.withExactArgs(sinon.match.same(sPath), "myGroup", sinon.match.same(bCheckUpdate),
				sinon.match.same(bKeepCacheOnError))
			.returns(oDependentsPromise);

		// code under test
		oRefreshResult = oBinding.refreshInternal(sPath, "myGroup", bCheckUpdate, bKeepCacheOnError)
			.then(function () {
				assert.strictEqual(bDependentsRefreshed, true);
			});

		oBinding.resolveRefreshPromise(); // simulate fetchValue triggered by a property binding
		return oRefreshResult;
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: suspended", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataContextBinding.prototype),
			oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"),
			bCheckUpdate = {/*true or false*/},
			bDependentsRefreshed = false,
			oDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			sGroupId = {},
			bKeepCacheOnError = {/*true or false*/},
			sPath = {/*EMPLOYEES('42')*/};

		oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {"foo" : "bar"});

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);
		this.mock(oBinding).expects("refreshSuspended").withExactArgs(sinon.match.same(sGroupId));
		this.mock(oBinding).expects("createReadGroupLock").never();
		this.mock(oBinding).expects("removeCachesAndMessages").never();
		oBindingMock.expects("fetchCache").never();
		this.mock(oBinding).expects("refreshDependentBindings")
			.withExactArgs(sinon.match.same(sPath), sGroupId, sinon.match.same(bCheckUpdate),
				sinon.match.same(bKeepCacheOnError))
			.returns(oDependentsPromise);

		// code under test
		return oBinding.refreshInternal(sPath, sGroupId, bCheckUpdate, bKeepCacheOnError)
			.then(function (oResult) {
				assert.strictEqual(bDependentsRefreshed, true);
			});
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
				oBinding = this.bindContext(oFixture.path, oContext),
				oCache = {
					fetchValue : function () {}
				},
				oReadGroupLock = {};

			this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", true)
				.callsFake(function () {
					oBinding.oReadGroupLock = oReadGroupLock;
				});
			this.mock(_Cache).expects("createSingle").returns(oCache);

			// code under test
			oBinding.refreshInternal("", "myGroup", true);

			this.mock(oCache).expects("fetchValue")
				.withExactArgs(sinon.match.same(oReadGroupLock), "", sinon.match.func, undefined)
				.returns(SyncPromise.resolve({}));

			// code under test
			oBinding.fetchValue("");

			assert.deepEqual(oBinding.oReadGroupLock, undefined);
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bKeepCacheOnError) {
	[false, true].forEach(function (bRelative) {
		var sTitle = "refreshInternal: bCheckUpdate=false, bKeepCacheOnError=" + bKeepCacheOnError
			+ ", bRelative=" + bRelative;

	QUnit.test(sTitle, function (assert) {
		var oContext = bRelative ? Context.create(this.oModel, {}, "/EMPLOYEES('42')") : undefined,
			oBinding = this.bindContext(
				bRelative ? "EMPLOYEE_2_TEAM" : "/EMPLOYEES('42')/EMPLOYEE_2_TEAM", oContext,
				{$$ownRequest : true}),
			oBindingMock = this.mock(oBinding),
			oCache = oBinding.oCachePromise.getResult(),
			oError = new Error(),
			oNewCache = {
				setActive : function () {}
			},
			oReadPromise = Promise.reject(oError),
			that = this;

		oBindingMock.expects("isRootBindingSuspended").returns(false);
		oBindingMock.expects("isRoot").returns(false);
		oBindingMock.expects("createReadGroupLock").withExactArgs("myGroup", false);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		oBindingMock.expects("createRefreshPromise").withExactArgs().callThrough();
		oBindingMock.expects("fetchValue").withExactArgs("").callsFake(function () {
			oBinding.resolveRefreshPromise(oReadPromise);
			return SyncPromise.resolve(oReadPromise);
		});
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise = Promise.resolve(bRelative ? oCache.$resourcePath : "n/a");

			if (bRelative) {
				assert.ok(oCache.$resourcePath);
			} else {
				assert.notOk("$resourcePath" in oCache);
			}
			oBindingMock.expects("fetchResourcePath").exactly(iCallCount)
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oCache).expects("setActive").exactly(iCallCount).withExactArgs(true);
				oBindingMock.expects("checkUpdateInternal").exactly(iCallCount).withExactArgs()
					.callsFake(function () {
						assert.strictEqual(oBinding.oCache, oCache);
						assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

						return SyncPromise.resolve();
					});
			});
		});

		// code under test
		return oBinding.refreshInternal("path", "myGroup", false, bKeepCacheOnError)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
				if (bKeepCacheOnError) {
					assert.strictEqual(oBinding.oCache, oCache);
					assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
				} else {
					assert.notStrictEqual(oBinding.oCachePromise.getResult(), oCache);
				}
			});
	});

	});
});

	//*********************************************************************************************
[false, true].forEach(function (bKeepCacheOnError) {
	var sTitle = "refreshInternal: bCheckUpdate=true, bKeepCacheOnError=" + bKeepCacheOnError;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"),
			oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {$$ownRequest : true}),
			oBindingMock = this.mock(oBinding),
			oCache = oBinding.oCachePromise.getResult(),
			oError = new Error(),
			oNewCache = {
				setActive : function () {}
			},
			oReadPromise = Promise.reject(oError),
			oRefreshPromise1,
			oRefreshPromise2,
			that = this;

		oBindingMock.expects("isRootBindingSuspended").twice().returns(false);
		oBindingMock.expects("isRoot").twice().returns(false);
		oBindingMock.expects("createReadGroupLock").twice().withExactArgs("myGroup", false);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		oBindingMock.expects("createRefreshPromise").withExactArgs().callThrough();
		oBindingMock.expects("fetchValue").never();
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise = Promise.resolve(oCache.$resourcePath);

			oBindingMock.expects("fetchResourcePath").exactly(iCallCount)
				.withExactArgs(sinon.match.same(oContext))
				.returns(SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oCache).expects("setActive").exactly(iCallCount).withExactArgs(true);
				oBindingMock.expects("checkUpdateInternal").exactly(iCallCount).withExactArgs()
					.callsFake(function () {
						assert.strictEqual(oBinding.oCache, oCache);
						assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

						return SyncPromise.resolve();
					});
			});
		});

		// code under test
		oRefreshPromise1 = oBinding.refreshInternal("path", "myGroup", true, bKeepCacheOnError)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
			});
		oRefreshPromise2 = oBinding.refreshInternal("path", "myGroup", true, bKeepCacheOnError)
			.then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oError);
			});
		oBinding.resolveRefreshPromise(oReadPromise); // simulate fetchValue by property binding

		return Promise.all([oRefreshPromise1, oRefreshPromise2]).then(function () {
			if (bKeepCacheOnError) {
				assert.strictEqual(oBinding.oCache, oCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);
			} else {
				assert.notStrictEqual(oBinding.oCache, oCache);
				assert.notStrictEqual(oBinding.oCachePromise.getResult(), oCache);
			}
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bFetchResourcePathFails) {
	var sTitle = "refreshInternal: bCheckUpdate=false, bKeepCacheOnError=true, fetchValue fails"
		+ ", parent context has changed in the meantime, fetchResourcePath fails="
		+ bFetchResourcePathFails;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create(this.oModel, {}, "/EMPLOYEES('42')"),
			oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {$$ownRequest : true}),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			bIsRoot = "false,true",
			oNewCache = {},
			oOldCache = oBinding.oCachePromise.getResult(),
			oReadPromise = Promise.reject(oError),
			oYetAnotherError = new Error(),
			that = this;

		oBindingMock.expects("isRootBindingSuspended").returns(false);
		oBindingMock.expects("isRoot").returns(bIsRoot);
		oBindingMock.expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache").withExactArgs(sinon.match.same(oContext))
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		oBindingMock.expects("createRefreshPromise").withExactArgs().callThrough();
		oBindingMock.expects("fetchValue").withExactArgs("").callsFake(function () {
			oBinding.resolveRefreshPromise(oReadPromise);
			return SyncPromise.resolve(oReadPromise);
		});
		oReadPromise.catch(function () {
			var oResourcePathPromise = Promise.resolve("n/a");

			oBindingMock.expects("fetchResourcePath")
				.withExactArgs(sinon.match.same(oContext))
				.returns(bFetchResourcePathFails
					? SyncPromise.reject(oYetAnotherError)
					: SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oOldCache).expects("setActive").never();
				oBindingMock.expects("checkUpdateInternal").never();
			});
		});

		// code under test
		return oBinding.refreshInternal("path", "myGroup", false, true).then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError,
					bFetchResourcePathFails ? oYetAnotherError : oError);
				assert.strictEqual(oBinding.oCache, oNewCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oNewCache);
			});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: bKeepCacheOnError, checkUpdateInternal async", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')/EMPLOYEE_2_TEAM"),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			bIsRoot = "false,true",
			oNewCache = {},
			oOldCache = oBinding.oCachePromise.getResult(),
			oRefreshPromise = Promise.reject(oError),
			oYetAnotherError = new Error(),
			that = this;

		oBindingMock.expects("isRootBindingSuspended").returns(false);
		oBindingMock.expects("isRoot").returns(bIsRoot);
		oBindingMock.expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache").withExactArgs(undefined)
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		oBindingMock.expects("createRefreshPromise").withExactArgs().returns(oRefreshPromise);
		oBindingMock.expects("fetchValue").never();
		oBindingMock.expects("refreshDependentBindings")
			.withExactArgs("path", "myGroup", true, true);
		oRefreshPromise.catch(function () {
			var oResourcePathPromise = Promise.resolve("n/a");

			oBindingMock.expects("fetchResourcePath").withExactArgs(undefined)
				.returns(SyncPromise.resolve(oResourcePathPromise));
			oResourcePathPromise.then(function () {
				that.mock(oOldCache).expects("setActive").withExactArgs(true);
				oBindingMock.expects("checkUpdateInternal").withExactArgs()
					.callsFake(function () {
						assert.strictEqual(oBinding.oCache, oOldCache);
						assert.strictEqual(oBinding.oCachePromise.getResult(), oOldCache);

						return Promise.reject(oYetAnotherError);
					});
			});
		});

		// code under test
		return oBinding.refreshInternal("path", "myGroup", true, true).then(function () {
				assert.ok(false);
			}, function (oReturnedError) {
				assert.strictEqual(oReturnedError, oYetAnotherError);
				assert.strictEqual(oBinding.oCache, oOldCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(), oOldCache);
			});
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("refreshInternal, bAction=" + bAction, function (assert) {
			var oBinding = this.bindContext("/FunctionImport(...)"),
				bExecuted = false,
				oExecutePromise = new Promise(function (resolve) {
					setTimeout(function () {
						bExecuted = true;
						resolve({/*oReturnValueContext*/});
					});
				}),
				oGroupLock = {},
				oPromise;

			oBinding.oCachePromise = SyncPromise.resolve({});
			oBinding.oOperation.bAction = bAction;

			this.mock(oBinding).expects("createReadGroupLock").exactly(bAction === false ? 1 : 0)
				.withExactArgs("myGroup", true)
				.callsFake(function () {
					oBinding.oReadGroupLock = oGroupLock;
				});
			this.mock(oBinding).expects("getDependentBindings").never();
			this.mock(oBinding).expects("_execute").exactly(bAction === false ? 1 : 0)
				.withExactArgs(sinon.match.same(oGroupLock))
				.returns(oExecutePromise);

			// code under test
			oPromise = oBinding.refreshInternal("", "myGroup");

			assert.strictEqual(oBinding.oReadGroupLock, undefined);

			return oPromise.then(function (oResult) {
				assert.strictEqual(bExecuted, bAction === false);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: no cache", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("TEAM_2_EMPLOYEE", oContext),
			oChild0 = {
				refreshInternal : function () {}
			},
			oChild1 = {
				refreshInternal : function () {}
			},
			bCheckUpdate = {/*true or false*/},
			bKeepCacheOnError = {/*true or false*/},
			sResourcePathPrefix = "TEAMS('42')";

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("getDependentBindings")
			.withExactArgs()
			.returns([oChild0, oChild1]);
		this.mock(oChild0).expects("refreshInternal")
			.withExactArgs(sResourcePathPrefix, "myGroup", sinon.match.same(bCheckUpdate),
				sinon.match.same(bKeepCacheOnError));
		this.mock(oChild1).expects("refreshInternal")
			.withExactArgs(sResourcePathPrefix, "myGroup", sinon.match.same(bCheckUpdate),
				sinon.match.same(bKeepCacheOnError));

		// code under test
		return oBinding.refreshInternal(sResourcePathPrefix, "myGroup", bCheckUpdate,
			bKeepCacheOnError);
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: deleted relative binding", function (assert) {
		var oBinding = this.bindContext("relative", Context.create(this.oModel, {}, "/foo")),
			fnOnRefresh = this.spy(function (oEvent) {
				var oElementContext = oBinding.getBoundContext();

				assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
				assert.strictEqual(oElementContext.getBinding(), oBinding);
				assert.strictEqual(oElementContext.getModelIndex(), undefined);
				assert.strictEqual(oElementContext.getModel(), this.oModel);
				assert.strictEqual(oElementContext.getPath(), "/foo/relative");
			});

		oBinding.oElementContext = null; // simulate a delete
		oBinding.attachChange(fnOnRefresh);

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("getGroupId").withExactArgs().returns("$auto");

		// code under test
		return oBinding.refreshInternal("").then(function () {
			sinon.assert.calledOnce(fnOnRefresh);
		});
	});

	//*********************************************************************************************
	QUnit.test("doFetchQueryOptions", function (assert) {
		var oBinding = this.bindContext("foo");

		// code under test
		assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), {});

		oBinding = this.bindContext("foo", undefined, {"$expand" : "bar"});

		// code under test
		assert.deepEqual(oBinding.doFetchQueryOptions().getResult(), {"$expand" : {"bar" : {}}});
	});

	//*********************************************************************************************
	[true, false].forEach(function (bAutoExpandSelect, i) {
		QUnit.test("doCreateCache, " + i, function (assert) {
			var oBinding = this.bindContext("/EMPLOYEES('1')"),
				oCache = {},
				mCacheQueryOptions = {},
				oCreateSingleExpectation,
				sDeepResourcePath = "deep/resource/path",
				fnGetOriginalResourcePath;

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;

			oCreateSingleExpectation = this.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES('1')",
					sinon.match.same(mCacheQueryOptions), bAutoExpandSelect, sinon.match.func)
				.returns(oCache);

			// code under test
			assert.strictEqual(
				oBinding.doCreateCache("EMPLOYEES('1')", mCacheQueryOptions, undefined,
					sDeepResourcePath),
				oCache);

			fnGetOriginalResourcePath = oCreateSingleExpectation.args[0][4];

			// code under test
			assert.strictEqual(fnGetOriginalResourcePath(), sDeepResourcePath);
		});
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal", function (assert) {
		var bCheckUpdate = {/* true or false */},
			oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("TEAM_2_EMPLOYEE", oContext),
			oBindingMock = this.mock(oBinding),
			oDependent0 = {resumeInternal : function () {}},
			oDependent1 = {resumeInternal : function () {}},
			oFetchCacheExpectation,
			oFireChangeExpectation,
			sResumeChangeReason = {/*change or refresh*/},
			oResumeInternalExpectation0,
			oResumeInternalExpectation1;

		oBinding.sResumeChangeReason = sResumeChangeReason;
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		oFetchCacheExpectation = oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			// check correct sequence: on fetchCache call, aggregated query options must be reset
			.callsFake(function () {
				assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
				assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
			});
		this.mock(oBinding).expects("getDependentBindings")
			.withExactArgs()
			.returns([oDependent0, oDependent1]);
		oResumeInternalExpectation0 = this.mock(oDependent0).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate));
		oResumeInternalExpectation1 = this.mock(oDependent1).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate));
		oFireChangeExpectation = oBindingMock.expects("_fireChange")
			.withExactArgs({reason : sinon.match.same(sResumeChangeReason)});
		oBinding.mAggregatedQueryOptions = {$select : ["Team_Id"]};
		oBinding.bAggregatedQueryOptionsInitial = false;

		// code under test
		oBinding.resumeInternal(bCheckUpdate);

		assert.ok(oResumeInternalExpectation0.calledAfter(oFetchCacheExpectation));
		assert.ok(oResumeInternalExpectation1.calledAfter(oFetchCacheExpectation));
		assert.ok(oFireChangeExpectation.calledAfter(oResumeInternalExpectation1));
		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("resumeInternal: operation binding, bAction=" + bAction, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
				oBinding = this.bindContext("name.space.Operation(...)", oContext),
				oBindingMock = this.mock(oBinding);

			oBinding.oOperation.bAction = bAction;

			oBindingMock.expects("fetchCache").never();
			this.mock(oBinding).expects("getDependentBindings").never();
			oBindingMock.expects("_fireChange").never();
			oBindingMock.expects("execute").exactly(bAction === false ? 1 : 0).withExactArgs();

			// code under test
			oBinding.resumeInternal();
		});
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: initial binding", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')");

		oBinding.suspend();

		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.resume();
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
		var sTitle = "isReturnValueLikeBindingParameter returns false due to metadata, " + i;

		QUnit.test(sTitle, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
				oBinding = this.bindContext("name.space.Operation(...)", oContext);

			// code under test
			assert.notOk(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
		});
	});

	//*********************************************************************************************
	[{ // operation binding must have a context
		binding : "TEAMS('42')/name.space.Operation(...)"
	}, { // operation binding must be relative
		binding : "/TEAMS('42')/name.space.Operation(...)"
	}].forEach(function (oFixture, i) {
		var sTitle = "isReturnValueLikeBindingParameter returns false due to ..., " + i;

		QUnit.test(sTitle, function (assert) {
			var oContext = oFixture.context && Context.create(this.oModel, {}, oFixture.context),
				oBinding = this.bindContext("name.space.Operation(...)", oContext);

			assert.notOk(
				// code under test
				oBinding.isReturnValueLikeBindingParameter(/*oOperationMetadata not used*/));
		});
	});

	//*********************************************************************************************
	QUnit.test("hasReturnValueContext: isReturnValueLikeBindingParameter returns false",
			function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oContext),
			oOperationMetadata = {};

		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs(sinon.match.same(oOperationMetadata)).returns(false);
		this.mock(this.oModel.oMetaModel).expects("getObject").never();

		// code under test
		assert.notOk(oBinding.hasReturnValueContext(oOperationMetadata));
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
	}, { // operation binding's context must not address a function import's return value
		binding : "name.space.Operation(...)",
		context : "/FunctionImport()",
		contextMetaPath : "/FunctionImport",
		$kind : "Function",
		result : false
	}].forEach(function (oFixture, i) {
		QUnit.test("hasReturnValueContext for context and binding path, " + i, function (assert) {
			var oContext = oFixture.context && Context.create(this.oModel, {}, oFixture.context),
				oBinding = this.bindContext(oFixture.binding, oContext),
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

			this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
				.withExactArgs(sinon.match.same(oOperationMetadata)).returns(true);
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
	QUnit.test("isReturnValueLikeBindingParameter for non-V4 context", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oContext),
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
		assert.strictEqual(!!oBinding.isReturnValueLikeBindingParameter(oOperationMetadata), false);

		oBinding = this.bindContext("name.space.Operation(...)");

		// code under test (without context)
		assert.strictEqual(!!oBinding.isReturnValueLikeBindingParameter(oOperationMetadata), false);
	});

	//*********************************************************************************************
	QUnit.test("getParameterContext - no operation binding", function (assert) {
		var oBinding = this.bindContext("/Employee('42')");

		// code under test
		assert.throws(function () {
			oBinding.getParameterContext();
		}, new Error("Not a deferred operation binding: " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("getParameterContext - unbound operation", function (assert) {
		// code under test
		var oBinding = this.bindContext("/Operation(...)");

		assert.ok(oBinding.oParameterContext);
		assert.strictEqual(oBinding.getParameterContext(), oBinding.oParameterContext);
		assert.strictEqual(oBinding.oParameterContext.getPath(), "/Operation(...)/$Parameter");

		// preparation - seting parameter
		oBinding.oCachePromise = SyncPromise.resolve({/* cache must be ignored! */});
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/Operation(...)/$Parameter/name")
			.returns("$Parameter/name");
		this.mock(_Helper).expects("addByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "name", null);

		// code under test value setting
		oBinding.setParameter("name", "value");
		assert.strictEqual(oBinding.oParameterContext.getProperty("name"), "value");
	});

	//*********************************************************************************************
	QUnit.test("getParameterContext bound operation (context switch)", function (assert) {
		var oBinding = this.bindContext("schema.Operation(...)");

		// code under test
		assert.strictEqual(oBinding.oParameterContext, null);

		// code under test - context switch
		oBinding.setContext(Context.create(this.oModel, {}, "/Employee('42')"));
		assert.ok(oBinding.oParameterContext);
		assert.strictEqual(
			oBinding.oParameterContext.getPath(),
			"/Employee('42')/schema.Operation(...)/$Parameter"
		);

		this.mock(oBinding.oParameterContext).expects("destroy").withExactArgs();

		oBinding.setContext(null);
		// code under test
		assert.strictEqual(oBinding.oParameterContext, null);
	});

	//*********************************************************************************************
	[{
		sPath : undefined,
		sResult : undefined
	}, {
		sPath : "/TEAMS('ABC-1')",
		sResult : "/TEAMS('ABC-1')"
	}, {
		sPath : "/TEAMS($uid=id-1-23)",
		aFetchValues : [{
			oEntity : {},
			sPath : "/TEAMS($uid=id-1-23)",
			sPredicate : "('13')"
		}],
		sResult : "/TEAMS('13')"
	}, {
		sPath : "/TEAMS($uid=id-1-23)/TEAM_2_EMPLOYEES",
		aFetchValues : [{
			oEntity : {},
			sPath : "/TEAMS($uid=id-1-23)",
			sPredicate : "('13')"
		}],
		sResult : "/TEAMS('13')/TEAM_2_EMPLOYEES"
	}, {
		sPath : "/TEAMS($uid=id-1-23)/TEAM_2_EMPLOYEES($uid=id-1-24)",
		aFetchValues : [{
			oEntity : {},
			sPath : "/TEAMS($uid=id-1-23)",
			sPredicate : "('13')"
		}, {
			oEntity : {},
			sPath : "/TEAMS($uid=id-1-23)/TEAM_2_EMPLOYEES($uid=id-1-24)",
			sPredicate : "('6')"
		}],
		sResult : "/TEAMS('13')/TEAM_2_EMPLOYEES('6')"
	}].forEach(function (oFixture, i) {
		QUnit.test("getResolvedPath: " + i, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS"),
				oContextMock = this.mock(oContext),
				oBinding = this.bindContext("foo", oContext),
				oHelperMock = this.mock(_Helper);

			this.mock(this.oModel).expects("resolve").withExactArgs("foo",
				sinon.match.same(oBinding.oContext)).returns(oFixture.sPath);

			if (oFixture.aFetchValues) {
				oFixture.aFetchValues.forEach(function (oFetchValue){
					oContextMock.expects("getValue").withExactArgs(oFetchValue.sPath)
						.returns(oFetchValue.oEntity);
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oFetchValue.oEntity), "predicate")
						.returns(oFetchValue.sPredicate);
				});
			}

			// code under test
			assert.strictEqual(oBinding.getResolvedPath(), oFixture.sResult);
		});
	});

	//*********************************************************************************************
[{}, undefined].forEach(function (oEntity, i) {
	QUnit.test("getResolvedPath error: no key predicates " + i, function (assert) {
		var sPath = "/TEAMS($uid=id-1-23)",
			oContext = Context.create(this.oModel, {}, sPath),
			oBinding = this.bindContext("", oContext);

		this.mock(this.oModel).expects("resolve").withExactArgs(oBinding.sPath,
			sinon.match.same(oBinding.oContext)).returns(sPath);
		this.mock(oContext).expects("getValue").withExactArgs(sPath).returns(oEntity);
		this.mock(_Helper).expects("getPrivateAnnotation").exactly(oEntity ? 1 : 0)
			.withExactArgs(sinon.match.same(oEntity), "predicate")
			.returns(undefined);

		// code under test
		assert.throws(function () {
			oBinding.getResolvedPath();
		}, new Error("No key predicate known at " + sPath));
	});
});

	//*********************************************************************************************
	[{
		parent : {$expand : {"Nav" : {}}, $select : ["prop"], $filter : "~"},
		expected : {$expand : {"Nav" : {}}, $select : ["prop"], "sap-client" : "111", foo : "bar"}
	}, {
		parent : {$expand : {"Nav" : {}}},
		expected : {$expand : {"Nav" : {}}, "sap-client" : "111", foo : "bar"}
	}, {
		parent : {$select : ["prop"]},
		expected : {$select : ["prop"], "sap-client" : "111", foo : "bar"}
	}].forEach(function (oFixture, i) {
		[false, true].forEach(function (bInherit) {
			QUnit.test("computeOperationQueryOptions, " + i + "," + bInherit, function (assert) {
				var oContext = Context.create(this.oModel, {
						mCacheQueryOptions : oFixture.parent
					}, "/SalesOrderList('4711')"),
					oBinding = this.bindContext("bound.Operation(...)", oContext,
						{foo : "bar", $$inheritExpandSelect : bInherit});

				this.mock(jQuery).expects("extend").withExactArgs({},
					sinon.match.same(oBinding.oModel.mUriParameters),
					sinon.match.same(oBinding.mQueryOptions))
					.returns({"sap-client" : "111", foo : "bar"});

				// code under test
				assert.deepEqual(oBinding.computeOperationQueryOptions(),
					bInherit ? oFixture.expected : {"sap-client" : "111", foo : "bar"});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshReturnValueContext", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/SalesOrderList('42')"),
			oBinding = this.bindContext("bound.Operation(...)", oContext),
			oCache = {},
			bDependentsRefreshed = false,
			oDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			mQueryOptions = {},
			oReturnValueContext = Context.create(this.oModel, oBinding, "/SalesOrderList('77')"),
			oRefreshPromise;

		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mQueryOptions);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "SalesOrderList('77')",
				sinon.match.same(mQueryOptions), true)
			.returns(oCache);
		this.mock(oBinding).expects("createReadGroupLock")
			.withExactArgs("group", true);
		this.mock(oBinding).expects("refreshDependentBindings").withExactArgs("", "group", true)
			.returns(oDependentsPromise);

		// code under test
		oRefreshPromise = oBinding.refreshReturnValueContext(oReturnValueContext, "group");

		assert.strictEqual(oRefreshPromise.isPending(), true);
		assert.strictEqual(oBinding.mCacheQueryOptions, mQueryOptions);
		assert.strictEqual(oBinding.oCache, oCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oCache);

		// code under test
		assert.strictEqual(
			oBinding.refreshReturnValueContext(oBinding.getBoundContext(), "group"),
			null);

		return oRefreshPromise.then(function (oResult) {
			assert.strictEqual(bDependentsRefreshed, true);
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bWithContext) {
		[false, true].forEach(function (bRecursionRejects) {
			var sTitle = "requestSideEffects, with context: " + bWithContext
					+ "; recursion rejects: " + bRecursionRejects;

			QUnit.test(sTitle, function (assert) {
				// Note: w/o a context, the binding would be relative in real life
				var oBinding = this.bindContext("/Me/name.space.Operation(...)"),
					oCache = {
						requestSideEffects : function () {}
					},
					oContext = bWithContext
						? {getPath : function () {}}
						: undefined,
					oError = new Error(),
					sGroupId = "group",
					oGroupLock = {},
					aPaths = [],
					oPromise = Promise.resolve({/*the updated data*/}),
					oResult,
					that = this;

				oBinding.oCache = oCache; // simulate execute
				this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId)
					.returns(oGroupLock);
				if (bWithContext) {
					this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
				}
				this.mock(oCache).expects("requestSideEffects")
					.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {},
						bWithContext ? "Me" : undefined)
					.callsFake(function (oGroupLock, aPaths, mNavigationPropertyPaths) {
						that.mock(oBinding).expects("visitSideEffects")
							.withExactArgs(sGroupId, sinon.match.same(aPaths),
								sinon.match.same(oContext),
								sinon.match.same(mNavigationPropertyPaths), [oPromise])
							.callsFake(function (sGroupId, aPaths, oContext,
									mNavigationPropertyPaths, aPromises) {
								aPromises.push(Promise.resolve());
								if (bRecursionRejects) {
									aPromises.push(Promise.reject(oError));
								}
							});

						return oPromise;
					});
				if (bRecursionRejects) {
					this.mock(this.oModel).expects("reportError")
						.withExactArgs("Failed to request side effects", sClassName,
							sinon.match.same(oError));
				}

				// code under test
				oResult = oBinding.requestSideEffects(sGroupId, aPaths, oContext);

				assert.ok(oResult.isPending(), "instanceof SyncPromise");

				return oResult.then(function () {
						assert.notOk(bRecursionRejects);
					}, function (oError0) {
						assert.ok(bRecursionRejects);
						assert.strictEqual(oError0, oError);
					});
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: no cache", function (assert) {
		var oBinding = this.bindContext("/Me/name.space.Operation(...)");

		// @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
		// @throws {Error} - If this binding does not use own data service requests
		assert.throws(function () {
			// code under test
			oBinding.requestSideEffects("group", [], {/*oContext*/});
		}, TypeError);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: fails", function (assert) {
		var oBinding = this.bindContext("/Me/name.space.Operation(...)"),
			oCache = {
				requestSideEffects : function () {}
			},
			oContext = {
				getPath : function () {}
			},
			oError = new Error(),
			sGroupId = "group",
			oGroupLock = {},
			aPaths = [];

		oBinding.oCache = oCache; // simulate execute
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
		this.mock(oCache).expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {}, "Me")
			.rejects(oError);
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oError));

		// code under test
		return oBinding.requestSideEffects(sGroupId, aPaths, oContext).then(function (vResult) {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0, oError);
			});
	});

	//*********************************************************************************************
	["", "A"].forEach(function (sPath) {
		//*****************************************************************************************
		[false, true].forEach(function (bReturnValueContext) {
			var sTitle = "requestSideEffects: context refresh required; is return value context: "
					+ bReturnValueContext + "; empty path: " + !sPath;

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindContext("/Me/name.space.Operation(...)"),
					oCache = {
						requestSideEffects : function () {}
					},
					oContext = {
						getPath : function () {}
					},
					oError = new Error("Unsupported collection-valued navigation property /Me/A"),
					sGroupId = "group",
					oGroupLock = {},
					aPaths = [sPath],
					oRefreshInternalPromise = {},
					oRefreshPromise = bReturnValueContext ? SyncPromise.resolve() : null;

				oBinding.oCache = oCache; // simulate execute
				if (sPath === "") {
					this.mock(oCache).expects("requestSideEffects").never();
				} else {
					this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId)
						.returns(oGroupLock);
					this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
					this.mock(oCache).expects("requestSideEffects")
						.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {},
							"Me")
						.throws(oError);
				}
				this.mock(oBinding).expects("refreshReturnValueContext")
					.withExactArgs(sinon.match.same(oContext), sGroupId)
					.returns(oRefreshPromise);
				this.mock(oBinding).expects("refreshInternal").exactly(bReturnValueContext ? 0 : 1)
					.withExactArgs("", sGroupId, true, true)
					.returns(oRefreshInternalPromise);
				this.mock(this.oModel).expects("getDependentBindings").never();
				this.mock(oBinding).expects("getDependentBindings").never();

				// code under test
				assert.strictEqual(oBinding.requestSideEffects(sGroupId, aPaths, oContext),
					bReturnValueContext ? oRefreshPromise : oRefreshInternalPromise
				);
			});
		});

		//*****************************************************************************************
		QUnit.test("requestSideEffects: binding refresh required; empty path: " + !sPath,
				function (assert) {
			var oParentContext = Context.create(this.oModel, null, "/Me"),
				oBinding = this.bindContext("Address", oParentContext),
				oCache = {
					requestSideEffects : function () {}
				},
				oError = new Error("Unsupported collection-valued navigation property /Me/A"),
				sGroupId = "group",
				oGroupLock = {},
				aPaths = [sPath],
				oPromise = {};

			oBinding.oCache = oCache; // mock cache creation
			if (sPath === "") {
				this.mock(oCache).expects("requestSideEffects").never();
			} else {
				this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId)
					.returns(oGroupLock);
				this.mock(oCache).expects("requestSideEffects")
					.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {},
						undefined)
					.throws(oError);
			}
			this.mock(oBinding).expects("refreshReturnValueContext").never();
			this.mock(oBinding).expects("refreshInternal").withExactArgs("", sGroupId, true, true)
				.returns(oPromise);
			this.mock(this.oModel).expects("getDependentBindings").never();
			this.mock(oBinding).expects("getDependentBindings").never();

			// code under test
			assert.strictEqual(oBinding.requestSideEffects(sGroupId, aPaths), oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: do not stifle exceptions", function (assert) {
		var oBinding = this.bindContext("/Me/name.space.Operation(...)"),
			oCache = {
				requestSideEffects : function () {}
			},
			oContext = {
				getPath : function () {},
				refresh : function () {}
			},
			oError = new TypeError("Unexpected error"),
			sGroupId = "group",
			oGroupLock = {},
			aPaths = [];

		oBinding.oCache = oCache; // simulate execute
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
		this.mock(oCache).expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), {}, "Me")
			.throws(oError);
		this.mock(oContext).expects("refresh").never();

		assert.throws(function () {
			// code under test
			oBinding.requestSideEffects(sGroupId, aPaths, oContext);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("getDependentBindings", function (assert) {
		var oBinding = this.bindContext("~path~"),
			aDependentBindings = [];

		this.mock(this.oModel).expects("getDependentBindings")
			.withExactArgs(sinon.match.same(oBinding))
			.returns(aDependentBindings);

		// code under test
		assert.strictEqual(oBinding.getDependentBindings(), aDependentBindings);
	});

	//*********************************************************************************************
[
	Context.create({/*oModel*/}, {/*oBinding*/}, "/SalesOrderList($uid=1)"),
	null
].forEach(function (oContext, i) {
	QUnit.test("adjustPredicate: " + i, function (assert) {
		var oBinding = this.bindContext("SO_2_BP", oContext);

		if (oContext) {
			this.mock(oBinding.oElementContext).expects("adjustPredicate")
				.withExactArgs("($uid=1)", "('42')");
		}

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')");
	});
});

	//*********************************************************************************************
	QUnit.test("requestObject - resolved binding", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')"),
			oBoundContextMock = this.mock(oBinding.oElementContext),
			aResult = [{/*Promise*/}, {/*Promise*/}];

		oBoundContextMock.expects("requestObject").withExactArgs(undefined).returns(aResult[0]);
		oBoundContextMock.expects("requestObject").withExactArgs("name").returns(aResult[1]);

		// code under test
		assert.strictEqual(oBinding.requestObject(), aResult[0]);
		assert.strictEqual(oBinding.requestObject("name"), aResult[1]);
	});

	//*********************************************************************************************
	QUnit.test("requestObject - unresolved binding", function (assert) {
		var oBinding = this.bindContext("Player('0815')");

		// code under test
		return oBinding.requestObject().then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});

	});

	//*********************************************************************************************
	QUnit.test("doDeregisterChangeListener: super", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')"),
			oListener = {},
			sPath = "foo";

		this.mock(asODataParentBinding.prototype).expects("doDeregisterChangeListener")
			.on(oBinding).withExactArgs(sPath, sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener(sPath, oListener);
	});

	//*********************************************************************************************
	QUnit.test("doDeregisterChangeListener: operation binding", function (assert) {
		var oBinding = this.bindContext("/Operation(...)"),
			oHelperMock = this.mock(_Helper),
			oListener = {};

		this.mock(asODataParentBinding.prototype).expects("doDeregisterChangeListener")
			.on(oBinding).withExactArgs("$Parameterfoo", sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener("$Parameterfoo", oListener);

		oHelperMock.expects("removeByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "bar",
					sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener("$Parameter/bar", oListener);

		oHelperMock.expects("removeByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "bar/foo",
				sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener("$Parameter/bar/foo", oListener);

		oHelperMock.expects("removeByPath")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "",
				sinon.match.same(oListener));

		// code under test
		oBinding.doDeregisterChangeListener("$Parameter", oListener);
	});

	//*********************************************************************************************
	QUnit.test("doSetProperty: non operational binding", function (assert) {
		var oBinding = this.bindContext("/Employee('42')"),
			oGroupLock = {},
			sPath = "foo",
			vValue = "bar";

		// code under test
		assert.strictEqual(oBinding.doSetProperty(sPath, vValue, oGroupLock), undefined);
	});

	//*********************************************************************************************
[{
	expected : undefined,
	name : undefined,
	path : "$ParameterFoo",
	update : []
}, {
	expected : SyncPromise.resolve(),
	name : "",
	path : "$Parameter",
	update : []
}, {
	expected : SyncPromise.resolve(),
	name : "foo",
	path : "$Parameter/foo",
	update : ["foo"]
}, {
	expected : SyncPromise.resolve(),
	name : "foo",
	path : "$Parameter/foo/bar",
	update : ["foo", "bar"]
}, {
	expected : SyncPromise.resolve(),
	name : "foo",
	path : "$Parameter/foo/bar/any",
	update : ["foo", "bar", "any"]
}].forEach(function(oFixture) {
	QUnit.test("doSetProperty: operation binding path: " + oFixture.path, function (assert) {
		var oBinding = this.bindContext("/Operation(...)"),
			oGroupLock = {
				unlock : function () { }
			},
			oUpdateValue = {};

		if (oFixture.name) {
			oBinding.oOperation.bAction = true;
			this.mock(_Cache).expects("makeUpdateData")
				.withExactArgs(oFixture.update, "bar")
				.returns(oUpdateValue);
			this.mock(_Helper).expects("updateAll")
				.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "",
					sinon.match.same(oBinding.oOperation.mParameters),
					sinon.match.same(oUpdateValue));
		}

		// code under test
		assert.strictEqual(
			oBinding.doSetProperty(oFixture.path, "bar", oGroupLock),
			oFixture.expected);

		assert.strictEqual(oBinding.oOperation.bAction, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("doSetProperty: no group lock", function (assert) {
		var oBinding = this.bindContext("/Operation(...)"),
			oUpdateValue = {};

		oBinding.oOperation.bAction = true;
		this.mock(_Cache).expects("makeUpdateData").withExactArgs(["foo"], "bar")
			.returns(oUpdateValue);
		this.mock(_Helper).expects("updateAll")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), "",
				sinon.match.same(oBinding.oOperation.mParameters), sinon.match.same(oUpdateValue));

		assert.strictEqual(
			// code under test
			oBinding.doSetProperty("$Parameter/foo", "bar", null),
			SyncPromise.resolve()
		);

		assert.strictEqual(oBinding.oOperation.bAction, undefined);
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