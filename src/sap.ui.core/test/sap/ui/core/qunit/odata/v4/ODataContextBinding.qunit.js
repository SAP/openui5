/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/core/Rendering",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v4/Context",
	"sap/ui/model/odata/v4/ODataContextBinding",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/model/odata/v4/ODataParentBinding",
	"sap/ui/model/odata/v4/lib/_Cache",
	"sap/ui/model/odata/v4/lib/_GroupLock",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, Rendering, Binding, ChangeReason, ContextBinding, Context,
		ODataContextBinding, ODataModel, asODataParentBinding, _Cache, _GroupLock, _Helper) {
	"use strict";

	var aAllowedBindingParameters = ["$$canonicalPath", "$$groupId", "$$inheritExpandSelect",
			"$$ownRequest", "$$patchWithoutSideEffects", "$$updateGroupId"],
		sClassName = "sap.ui.model.odata.v4.ODataContextBinding";

	function mustBeMocked() { throw new Error("Must be mocked"); }

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.ODataContextBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create ODataModel
			this.oModel = new ODataModel({serviceUrl : "/service/?sap-client=111"});
			this.oModel.bSharedRequests = {/*false,true*/};
			this.oRequestorMock = this.mock(this.oModel.oRequestor);
			// ensure that the requestor does not invoke requests
			this.oRequestorMock.expects("request").never();
			// avoid that the cache requests actual metadata for faked responses
			this.mock(this.oModel.oRequestor.oModelInterface)
				.expects("fetchMetadata").atLeast(0)
				.returns(SyncPromise.resolve());
		},

		/**
		 * Calls <code>this.oModel.bindContext</code> using the given arguments, but avoids creating
		 * the prerendering task to unlock the read group lock.
		 *
		 * @returns {sap.ui.model.odata.v4.ODataContextBinding} The context binding
		 */
		bindContext : function () {
			try {
				this.stub(Rendering, "addPrerenderingTask");
				return this.oModel.bindContext.apply(this.oModel, arguments);
			} finally {
				Rendering.addPrerenderingTask.restore();
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

		assert.strictEqual(oExpectation.args[0][0], oBinding);
	});

	//*********************************************************************************************
	QUnit.test("constructor: no lock for relative bindings", function () {
		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();

		this.bindContext("EMPLOYEE_2_MANAGER", Context.create(this.oModel, {}, "/EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("constructor: lock when creating with base context", function () {
		var oContext = this.oModel.createBindingContext("/TEAMS('42')");

		this.mock(ODataContextBinding.prototype).expects("getGroupId").returns("myGroup");
		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock")
			.withExactArgs("myGroup", true);

		// code under test
		this.bindContext("TEAM_2_EMPLOYEES('Foo')", oContext);
	});

	//*********************************************************************************************
	QUnit.test("constructor: element context", function (assert) {
		var oBinding,
			oCreateMock,
			oElementContext = {};

		oCreateMock = this.mock(Context).expects("createNewContext")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.object, "/TEAMS('42')")
			.returns(oElementContext);

		// code under test
		oBinding = this.bindContext("/TEAMS('42')");

		assert.strictEqual(oBinding.getBoundContext(), oElementContext);
		assert.strictEqual(oCreateMock.args[0][1], oBinding);

		// code under test
		oBinding = this.bindContext("TEAM_2_MANAGER");

		assert.strictEqual(oBinding.getBoundContext(), null);
	});

	//*********************************************************************************************
	QUnit.test("constructor: create operation binding", function (assert) {
		var oBinding,
			bInheritExpandSelect = "false,true",
			mParameters = {},
			mParametersClone = {
				$$groupId : "group",
				$$inheritExpandSelect : bInheritExpandSelect,
				$$updateGroupId : "updateGroup"
			},
			fnParentBindingSpy = this.spy(asODataParentBinding, "call");

		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters))
			.returns(mParametersClone);
		this.mock(ODataContextBinding.prototype).expects("checkBindingParameters")
			.withExactArgs(sinon.match.same(mParametersClone), aAllowedBindingParameters);
		this.mock(ODataContextBinding.prototype).expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));

		// code under test
		oBinding = this.bindContext("/Operation(...)", null, mParameters);

		assert.strictEqual(oBinding.sGroupId, "group");
		assert.strictEqual(oBinding.bInheritExpandSelect, bInheritExpandSelect);
		assert.deepEqual(oBinding.oOperation, {
			bAction : undefined,
			bAdditionalQueryOptionsForRVC : undefined,
			mChangeListeners : {},
			mParameters : {},
			mRefreshParameters : {}
		});
		assert.strictEqual(oBinding.oReturnValueContext, null);
		assert.strictEqual(oBinding.sUpdateGroupId, "updateGroup");

		assert.ok(fnParentBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
[false, true].forEach(function (bOperation) {
	QUnit.test("bInitial, doSuspend, bAction: " + bOperation, function (assert) {
		var oBinding = bOperation ? this.bindContext("/OperationImport(...)")
				: this.bindContext("/EMPLOYEES('42')");

		assert.strictEqual(oBinding.bInitial, true);
		assert.strictEqual(oBinding.sResumeChangeReason, undefined);

		// code under test
		oBinding.doSuspend();

		assert.strictEqual(oBinding.sResumeChangeReason,
			bOperation ? undefined : ChangeReason.Change);

		return Promise.resolve().then(function () {
			assert.strictEqual(oBinding.bInitial, false);

			oBinding.sResumeChangeReason = "~";

			// code under test
			oBinding.doSuspend();

			assert.strictEqual(oBinding.sResumeChangeReason, "~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("be V8-friendly", function (assert) {
		var fnParentBindingSpy = this.spy(asODataParentBinding, "call"),
			oBinding = this.bindContext("/EMPLOYEES('42')");

		assert.ok(oBinding.hasOwnProperty("sGroupId"));
		assert.ok(oBinding.hasOwnProperty("bInheritExpandSelect"));
		assert.ok(oBinding.hasOwnProperty("oOperation"));
		assert.ok(oBinding.hasOwnProperty("mQueryOptions"));
		assert.ok(oBinding.hasOwnProperty("sUpdateGroupId"));

		assert.strictEqual(oBinding.bInheritExpandSelect, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, null);
		assert.strictEqual(oBinding.bHasFetchedExpandSelectProperties, false);

		assert.ok(fnParentBindingSpy.calledOnceWithExactly(sinon.match.same(oBinding)));
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("initialize: resolved, suspended = " + bSuspended, function (assert) {
			var oBinding = this.bindContext("/resolved");

			assert.strictEqual(oBinding.bInitial, true);
			this.mock(oBinding).expects("isResolved").withExactArgs()
				.callsFake(function () {
					assert.strictEqual(oBinding.bInitial, false);
					return true;
				});
			this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs()
				.returns(bSuspended);

			this.mock(oBinding).expects("_fireChange")
				.exactly(bSuspended ? 0 : 1)
				.withExactArgs({reason : ChangeReason.Change});

			// code under test
			oBinding.initialize();

			assert.strictEqual(oBinding.bInitial, false);
		});
	});

	//*********************************************************************************************
	QUnit.test("initialize: unresolved", function () {
		var oBinding = this.bindContext("unresolved");

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		oBinding.initialize();
	});

	//*********************************************************************************************
	QUnit.test("c'tor calls applyParameters", function (assert) {
		var oBinding,
			mParameters = {},
			mParametersClone = {};

		this.mock(_Helper).expects("clone").withExactArgs(sinon.match.same(mParameters))
			.returns(mParametersClone);
		this.mock(ODataContextBinding.prototype).expects("checkBindingParameters")
			.withExactArgs(sinon.match.same(mParametersClone), aAllowedBindingParameters);
		this.mock(ODataContextBinding.prototype).expects("applyParameters")
			.withExactArgs(sinon.match.same(mParametersClone));

		oBinding = new ODataContextBinding(this.oModel, "/EMPLOYEES", undefined, mParameters);

		assert.strictEqual(oBinding.mParameters, undefined, "c'tor does not set mParameters");
	});

	//*********************************************************************************************
	QUnit.test("applyParameters (as called by c'tor)", function (assert) {
		var oModelMock = this.mock(this.oModel),
			oBinding = this.bindContext("/EMPLOYEES"),
			mParameters = {
				$filter : "bar"
			},
			mQueryOptions = {
				$filter : "bar"
			};

		oModelMock.expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("fetchCache").withExactArgs(undefined)
			.callsFake(function () {
				this.oCachePromise = SyncPromise.resolve({});
			});
		this.mock(oBinding).expects("refreshInternal").never();
		this.mock(oBinding).expects("checkUpdate").never();
		this.mock(oBinding).expects("invoke").never();

		// code under test
		oBinding.applyParameters(mParameters);

		assert.deepEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
		assert.strictEqual(oBinding.mParameters, mParameters, "mParameters");
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		[undefined, false, true].forEach(function (bAction) {
			var sTitle = "applyParameters: operation binding, bAction=" + bAction + ", bSuspended="
					+ bSuspended;

			QUnit.test(sTitle, function (assert) {
				var oBinding = this.bindContext("/OperationImport(...)"),
					oBindingMock = this.mock(oBinding),
					bInvokeOperation = !bSuspended && bAction === false,
					oError = new Error(),
					oModelMock = this.mock(this.oModel),
					mParameters = {},
					oPromise = Promise.reject(oError),
					mQueryOptions = {},
					fnReporter = sinon.spy();

				oBinding.oOperation.bAction = bAction;

				oModelMock.expects("buildQueryOptions")
					.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
				oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
				oBindingMock.expects("fetchCache").never();
				oBindingMock.expects("refreshInternal").never();
				oBindingMock.expects("checkUpdate").never();
				oBindingMock.expects("invoke").exactly(bInvokeOperation ? 1 : 0)
					.withExactArgs().returns(oPromise);
				oModelMock.expects("getReporter").exactly(bInvokeOperation ? 1 : 0)
					.withExactArgs().returns(fnReporter);
				// code under test (as called by ODataParentBinding#changeParameters)
				oBinding.applyParameters(mParameters, ChangeReason.Filter);

				assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
				assert.strictEqual(oBinding.mParameters, mParameters);
				assert.strictEqual(oBinding.sResumeChangeReason, undefined);

				return oPromise.catch(function () {
					if (bInvokeOperation) {
						sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
					}
				});
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bSuspended) {
		QUnit.test("applyParameters: no operation binding, " + bSuspended, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/EMPLOYEES"),
				oBinding = this.bindContext("", oContext),
				oBindingMock = this.mock(oBinding),
				oError = new Error(),
				oModelMock = this.mock(this.oModel),
				mParameters = {},
				oPromise = Promise.reject(oError),
				mQueryOptions = {},
				fnReporter = sinon.spy();

			oModelMock.expects("buildQueryOptions")
				.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
			oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);
			oBindingMock.expects("fetchCache").exactly(bSuspended ? 0 : 1)
				.withExactArgs(sinon.match.same(oContext));
			if (bSuspended) {
				oBindingMock.expects("refreshInternal").never();
			} else {
				oBindingMock.expects("refreshInternal").withExactArgs("", undefined, true)
					.returns(oPromise);
				oModelMock.expects("getReporter").withExactArgs().returns(fnReporter);
			}
			oBindingMock.expects("checkUpdate").never();
			oBindingMock.expects("invoke").never();

			// code under test (as called by ODataParentBinding#changeParameters)
			oBinding.applyParameters(mParameters, ChangeReason.Change);

			assert.strictEqual(oBinding.mQueryOptions, mQueryOptions, "mQueryOptions");
			assert.strictEqual(oBinding.mParameters, mParameters);
			if (bSuspended) {
				assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);

				oModelMock.expects("buildQueryOptions")
					.withExactArgs(sinon.match.same(mParameters), true).returns(mQueryOptions);
				oBindingMock.expects("isRootBindingSuspended").withExactArgs().returns(bSuspended);

				// code under test (as called by ODataParentBinding#changeParameters)
				oBinding.applyParameters(mParameters);

				assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
			}

			return oPromise.catch(function () {
				if (!bSuspended) {
					sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("mixin", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')"),
			oMixin = {},
			aOverriddenFunctions = ["adjustPredicate", "destroy", "doDeregisterChangeListener",
				"doSetProperty", "doSuspend"];

		asODataParentBinding(oMixin);

		aOverriddenFunctions.forEach(function (sFunction) {
			assert.notStrictEqual(oBinding[sFunction], oMixin[sFunction], "overwrite " + sFunction);
		});
		Object.keys(oMixin).forEach(function (sKey) {
			if (!aOverriddenFunctions.includes(sKey)) {
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
	oReturnValueContext : {destroy : function () {}}
}].forEach(function (oFixture, i) {
	QUnit.test("setContext, relative path, " + i, function (assert) {
		var oBinding,
			oBindingPrototypeMock = this.mock(Binding.prototype),
			oContext = {
				getBinding : function () {},
				getPath : function () { return "/contextPath"; }
			},
			oModelMock = this.mock(this.oModel);

		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();
		oBinding = this.bindContext("relative");
		this.mock(oBinding).expects("checkSuspended").withExactArgs(true).twice();
		oModelMock.expects("resolve").thrice() // 2x setContext + createAndSetCache
			.withExactArgs("relative", sinon.match.same(oContext))
			.returns("/contextPath/relative");
		oBindingPrototypeMock.expects("setContext").on(oBinding)
			.withExactArgs(sinon.match.same(oContext));

		// code under test
		oBinding.setContext(oContext);

		assert.strictEqual(oBinding.getBoundContext().getPath(), "/contextPath/relative");

		oBinding.oContext = oContext;
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
		oBindingPrototypeMock.expects("setContext").on(oBinding).withExactArgs(undefined);

		// code under test: reset parent binding fires change
		oBinding.setContext(undefined);

		assert.strictEqual(oBinding.getBoundContext(), null);
		assert.strictEqual(oBinding.oParameterContext, null);
		assert.strictEqual(oBinding.oReturnValueContext, null);

		oBinding.oContext = undefined;

		// code under test: setting to null doesn't change the bound context -> no change event,
		// i.e. Binding#setContext is not called
		oBinding.setContext(null);

		assert.strictEqual(oBinding.getBoundContext(), null);
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

			oBinding.bHasFetchedExpandSelectProperties = true;
			this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
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
			if (oInitialContext) {
				this.mock(oBinding.getBoundContext()).expects("destroy").withExactArgs();
			}
			this.mock(Binding.prototype).expects("setContext").on(oBinding)
				.withExactArgs(sinon.match.same(oTargetContext));

			// code under test
			oBinding.setContext(oTargetContext);

			assert.strictEqual(oBinding.bHasFetchedExpandSelectProperties, false);
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

		oBindingMock.expects("checkSuspended").withExactArgs(true);
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

		oBindingMock.expects("checkSuspended").withExactArgs(true);
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
	QUnit.test("setContext on absolute binding", function (assert) {
		var oBinding = this.bindContext("/EntitySet('foo')/child");

		this.mock(oBinding).expects("checkSuspended").never();
		this.mock(oBinding).expects("_fireChange").never();

		oBinding.setContext(Context.create(this.oModel, null, "/EntitySet('bar')"));

		assert.strictEqual(oBinding.getContext().getPath(), "/EntitySet('bar')",
			"stored nevertheless");
		});

	//*********************************************************************************************
	QUnit.test("setContext: checkSuspended fails", function (assert) {
		var oContext = this.oModel.createBindingContext("/TEAMS"),
			oBinding = this.bindContext("TEAM_2_MANAGER", oContext),
			oError = new Error("This call intentionally failed");

		this.mock(oBinding).expects("checkSuspended").throws(oError);
		this.mock(oBinding.oElementContext).expects("destroy").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(Binding.prototype).expects("setContext").never();

		assert.throws(function () {
			// code under test
			oBinding.setContext(null);
		}, oError);

		assert.notStrictEqual(oBinding.oElementContext, null);
		assert.strictEqual(oBinding.oContext, oContext);
	});

	//*********************************************************************************************
	QUnit.test("bindContext: relative, base context, no parameters", function (assert) {
		var oBinding,
			oContext = this.oModel.createBindingContext("/TEAMS('TEAM_01')");

		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor),
				"TEAMS('TEAM_01')/TEAM_2_MANAGER", {"sap-client" : "111"}, false,
				sinon.match.same(this.oModel.bSharedRequests), "TEAMS('TEAM_01')/TEAM_2_MANAGER")
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
			.returns(Promise.resolve({ID : "1"}));
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path /EMPLOYEES(ID='1')", sClassName, sinon.match({canceled : true}));
		oBindingMock = this.mock(oBinding);
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}}, null);
		this.mock(oGroupLock1).expects("unlock").withExactArgs(true);

		// invoke read before refresh
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
		oBindingMock.expects("isRefreshWithoutBubbling").withExactArgs()
			.returns("~bPreventBubbling~");
		oBindingMock.expects("fireDataRequested").withExactArgs("~bPreventBubbling~");
		oBindingMock.expects("fireDataReceived").withExactArgs({data : {}}, "~bPreventBubbling~");
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
			.withExactArgs({error : oExpectedError}, null);
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
	QUnit.test("fetchValue: cache has changed", function (assert) {
		var oBinding,
			oCache,
			oCacheMock,
			oContext = this.oModel.createBindingContext("/Base"),
			oError = new Error(),
			oGroupLock = {unlock : function () {}},
			oODataContextBindingMock = this.mock(ODataContextBinding.prototype),
			that = this;

		oODataContextBindingMock.expects("lockGroup").withExactArgs("$direct", true)
			.returns(oGroupLock);
		oBinding = this.bindContext("relative", oContext, {$$groupId : "$direct"});
		oCache = oBinding.oCachePromise.getResult();
		oCacheMock = this.mock(oCache);
		this.mock(this.oModel).expects("resolve")
			.withExactArgs("relative", sinon.match.same(oContext))
			.returns("~");
		this.mock(oBinding).expects("getRelativePath").withExactArgs("/Base/relative/foo")
			.returns("foo");
		oCacheMock.expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "foo", sinon.match.func, undefined)
			.callsArg(2)
			.returns(SyncPromise.resolve(Promise.resolve()).then(function () {
				that.mock(oBinding).expects("assertSameCache")
					.withExactArgs(sinon.match.same(oCache))
					.throws(oError);
				return {};
			}));
		this.mock(oBinding).expects("fireDataReceived").withExactArgs({error : oError}, null);
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to read path ~", sClassName, sinon.match.same(oError));

		return oBinding.fetchValue("/Base/relative/foo").then(function () {
			assert.ok(false, "unexpected success");
		}, function (oResult) {
			assert.strictEqual(oResult, oError);
		});
	});

	//*********************************************************************************************
[
	{path : "name", value : "value"},
	{path : "name/complex", value : {complex : "value"}}
].forEach(function (oFixture) {
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
	QUnit.test("fetchValue: operation binding, path pointing to parent", function (assert) {
		var oContext = {
				getPath : function () { return "/Entity('42')"; },
				fetchValue : function () {}
			},
			oBinding = this.bindContext("name.space.Operation(...)", oContext),
			bCached = {},
			oListener = {},
			oResult = {};

		oBinding.oCachePromise = SyncPromise.resolve();
		this.mock(oBinding).expects("getRelativePath")
			.withExactArgs("/Entity('42')/name")
			.returns(undefined);
		this.mock(oContext).expects("fetchValue")
			.withExactArgs("/Entity('42')/name", sinon.match.same(oListener),
				sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			// code under test
			oBinding.fetchValue("/Entity('42')/name", oListener, bCached).getResult(),
			oResult
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
[false, true].forEach(function (bCached) {
	QUnit.test("fetchValue: relative binding w/o cache, bCached = " + bCached, function (assert) {
		var oContext = {
				fetchValue : function () {},
				getPath : function () { return "/absolute"; }
			},
			oListener = {},
			sPath = "/absolute/navigation/bar",
			oResult = {},
			oBinding = this.bindContext("navigation", oContext);

		if (bCached) {
			// never resolved, must be ignored
			oBinding.oCachePromise = new SyncPromise(function () {});
		}
		this.mock(oBinding).expects("doFetchExpandSelectProperties").exactly(bCached ? 0 : 1)
			.withExactArgs();
		this.mock(oContext).expects("fetchValue")
			.withExactArgs(sPath, sinon.match.same(oListener), sinon.match.same(bCached))
			.returns(SyncPromise.resolve(oResult));

		assert.strictEqual(
			// code under test
			oBinding.fetchValue(sPath, oListener, bCached).getResult(),
			oResult);
	});
});

	//*********************************************************************************************
	QUnit.test("fetchValue: relative binding w/ cache, mismatch", function (assert) {
		var bCached = {/*false,true*/},
			oBinding,
			oContext = {
				fetchValue : function () {},
				getPath : function () { return "/absolute"; }
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
		var oBinding = this.bindContext("~path~");

		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(true);

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
	QUnit.test("fetchValue: oCachePromise still pending", function (assert) {
		var oBinding = this.bindContext("/absolute"),
			oCache = oBinding.oCachePromise.getResult();

		oBinding.oCache = undefined;
		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		this.mock(oBinding).expects("getRelativePath").withExactArgs("/absolute/bar")
			.returns("bar");
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "bar", sinon.match.func, null)
			.returns(SyncPromise.resolve(42));
		this.mock(oBinding).expects("assertSameCache").withExactArgs(oCache);

		// code under test
		return oBinding.fetchValue("/absolute/bar", null, true).then(function (vResult) {
			assert.strictEqual(vResult, 42);
		});
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: oCachePromise became pending again", function (assert) {
		var oBinding = this.bindContext("/absolute"),
			oCache = oBinding.oCachePromise.getResult();

		oBinding.oCachePromise = new SyncPromise(function () {}); // never resolved, must be ignored
		this.mock(oBinding).expects("getRelativePath").withExactArgs("/absolute/bar")
			.returns("bar");
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(_GroupLock.$cached), "bar", sinon.match.func, null)
			.returns(SyncPromise.resolve(42));

		// code under test
		assert.strictEqual(oBinding.fetchValue("/absolute/bar", null, true).getResult(), 42);
	});

	//*********************************************************************************************
	QUnit.test("fetchValue: !bCached, wait for oCachePromise again", function (assert) {
		var oBinding = this.bindContext("/absolute"),
			oCache = oBinding.oCachePromise.getResult(),
			oGroupLock = {};

		oBinding.oCache = {/*do not use!*/};
		oBinding.oCachePromise = SyncPromise.resolve(Promise.resolve(oCache));
		oBinding.oReadGroupLock = undefined; // not interested in the initial case
		this.mock(oBinding).expects("getRelativePath").withExactArgs("/absolute/bar")
			.returns("bar");
		this.mock(oBinding).expects("lockGroup").withExactArgs().returns(oGroupLock);
		this.mock(oCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "bar", sinon.match.func, undefined)
			.returns(SyncPromise.resolve(42));
		this.mock(oBinding).expects("assertSameCache").withExactArgs(oCache);

		// code under test
		return oBinding.fetchValue("/absolute/bar").then(function (vResult) {
			assert.strictEqual(vResult, 42);
		});
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
	QUnit.test("read uses group ID", function () {
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
	QUnit.test("execute", function (assert) {
		assert.strictEqual(ODataContextBinding.prototype.execute,
			ODataContextBinding.prototype.invoke);
	});

	//*********************************************************************************************
	QUnit.test("invoke: absolute", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding,
			oGroupLock = {},
			mParameters = {},
			oPromise = {};

		this.mock(ODataContextBinding.prototype).expects("createReadGroupLock").never();
		oBinding = this.bindContext(sPath);
		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId", false, true);
		this.mock(oBinding).expects("lockGroup").withExactArgs("groupId", true)
			.returns(oGroupLock);
		this.mock(_Helper).expects("publicClone")
			.withExactArgs(sinon.match.same(oBinding.oOperation.mParameters), true)
			.returns(mParameters);
		this.mock(oBinding).expects("_invoke")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters),
				"~bIgnoreETag~", "~fnOnStrictHandlingFailed~", false)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.invoke("groupId", "~bIgnoreETag~", "~fnOnStrictHandlingFailed~", false),
			oPromise);
	});

	//*********************************************************************************************
	[false, true].forEach(function (bBaseContext) {
		QUnit.test("invoke: relative, bBaseContext=" + bBaseContext, function (assert) {
			var oContext = {
					getBinding : function () {},
					getPath : function () { return "/Employees('42')"; },
					isTransient : function () { return false; }
				},
				oBinding = this.bindContext("schema.Operation(...)", oContext),
				oGroupLock = {},
				mParameters = {},
				oParentBinding = {
					checkKeepAlive : function () {}
				},
				oPromise = {};

			if (bBaseContext) {
				delete oContext.getBinding;
				delete oContext.isTransient;
			} else {
				oContext.iIndex = 42;
				this.mock(oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
				this.mock(oParentBinding).expects("checkKeepAlive")
					.withExactArgs(sinon.match.same(oContext), true);
			}
			this.mock(oBinding).expects("checkSuspended").withExactArgs();
			this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId", false, true);
			this.mock(oBinding).expects("lockGroup")
				.withExactArgs("groupId", true).returns(oGroupLock);
			this.mock(_Helper).expects("publicClone")
				.withExactArgs(sinon.match.same(oBinding.oOperation.mParameters), true)
				.returns(mParameters);
			this.mock(oBinding).expects("_invoke")
				.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParameters),
					"~bIgnoreETag~", "~fnOnStrictHandlingFailed~",
					bBaseContext ? false : "~bReplaceWithRVC~")
				.returns(oPromise);

			assert.strictEqual(
				// code under test
				oBinding.invoke("groupId", "~bIgnoreETag~", "~fnOnStrictHandlingFailed~",
					bBaseContext ? false : "~bReplaceWithRVC~"),
				oPromise);
		});
	});

	//*********************************************************************************************
	QUnit.test("invoke: relative, bReplaceWithRVC, checkKeepAlive throws", function (assert) {
		var oContext = {
				getBinding : function () {},
				getPath : function () { return "/Employees('42')"; },
				iIndex : 42
			},
			oBinding = this.bindContext("schema.Operation(...)", oContext),
			oError = new Error("This call intentionally failed"),
			oParentBinding = {
				checkKeepAlive : function () {}
			};

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId", false, true);
		this.mock(oContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oParentBinding).expects("checkKeepAlive")
			.withExactArgs(sinon.match.same(oContext), true).throws(oError);
		this.mock(oBinding).expects("_invoke").never();

		assert.throws(function () {
			// code under test
			oBinding.invoke("groupId", false, null, true);
		}, function (oError0) {
			return oError0 === oError;
		});
	});

	//*********************************************************************************************
	QUnit.test("invoke: bReplaceWithRVC throws because of base context", function (assert) {
		var oContext = this.oModel.createBindingContext("/EMPLOYEES('42')"),
			oBinding = this.bindContext("schema.Operation(...)", oContext);

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId", false, true);
		this.mock(oBinding).expects("_invoke").never();

		assert.throws(function () {
			// code under test
			oBinding.invoke("groupId", false, null, true);
		}, new Error("Cannot replace this parent context: /EMPLOYEES('42')"));
	});

	//*********************************************************************************************
	QUnit.test("invoke: bReplaceWithRVC throws because of absolute binding", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)");

		this.mock(oBinding).expects("checkSuspended").withExactArgs();
		this.mock(_Helper).expects("checkGroupId").withExactArgs("groupId", false, true);
		this.mock(oBinding).expects("_invoke").never();

		assert.throws(function () {
			// code under test
			oBinding.invoke("groupId", false, null, true);
		}, new Error("Cannot replace when operation is not relative"));
	});

	//*********************************************************************************************
	QUnit.test("invoke: invalid group ID", function (assert) {
		var oBinding = this.bindContext("/OperationImport(...)"),
			oError = new Error("Invalid");

		this.mock(_Helper).expects("checkGroupId")
			.withExactArgs("$invalid", false, true).throws(oError);

		assert.throws(function () {
			oBinding.invoke("$invalid");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("invoke: unresolved relative binding", function (assert) {
		var oBinding = this.bindContext("schema.Operation(...)");

		assert.throws(function () {
			oBinding.invoke();
		}, new Error("Unresolved binding: schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("invoke: relative binding with deferred parent", function (assert) {
		var oBinding,
			oParentBinding = this.bindContext("/OperationImport(...)");

		oParentBinding.initialize();
		oBinding = this.bindContext("schema.Operation(...)", oParentBinding.getBoundContext());

		assert.throws(function () {
			oBinding.invoke();
		}, new Error("Nested deferred operation bindings not supported: "
			+ "/OperationImport(...)/schema.Operation(...)"));
	});

	//*********************************************************************************************
	QUnit.test("invoke: relative binding on transient context", function (assert) {
		var oBinding,
			oContext = {
				isTransient : function () { return true; },
				getPath : function () { return "/Employees($uid=id-1-23)"; }
			};

		oBinding = this.bindContext("schema.Operation(...)", oContext);

		assert.throws(function () {
			// code under test
			oBinding.invoke();
		}, new Error("Invoke for transient context not allowed: "
			+ "/Employees($uid=id-1-23)/schema.Operation(...)"));
	});

	//*********************************************************************************************
	[{
		path : "/Unknown(...)",
		request : "/Unknown/@$ui5.overload",
		metadata : undefined,
		request2 : "/Unknown",
		metadata2 : undefined,
		error : "Unknown operation: /Unknown(...)"
	}, {
		path : "/Unknown(...)",
		request : "/Unknown/@$ui5.overload",
		metadata : undefined,
		request2 : "/Unknown",
		metadata2 : {$kind : "Property"},
		error : "Unknown operation: /Unknown(...)"
	}, {
		path : "/Unknown(...)",
		request : "/Unknown/@$ui5.overload",
		metadata : undefined,
		request2 : "/Unknown",
		metadata2 : {$kind : "NavigationProperty"},
		error : "Unknown operation: /Unknown(...)" // Note: missing bReplaceWithRVC
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
	}].forEach(function (oFixture, i) {
		QUnit.test("_invoke: #" + i + " - " + oFixture.error, function (assert) {
			var oGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				},
				oMetaModelMock = this.mock(this.oModel.getMetaModel());

			oMetaModelMock.expects("fetchObject").withExactArgs(oFixture.request)
				.returns(SyncPromise.resolve(Promise.resolve(oFixture.metadata)));
			if (oFixture.request2) {
				oMetaModelMock.expects("fetchObject").withExactArgs(oFixture.request2)
					.returns(SyncPromise.resolve(oFixture.metadata2));
			}
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			this.mock(oGroupLock).expects("unlock").withExactArgs(true);
			this.mock(this.oModel).expects("reportError").withExactArgs(
				"Failed to invoke " + oFixture.path, sClassName, sinon.match.instanceOf(Error));
			this.mock(_Helper).expects("adjustTargetsInError")
				.withExactArgs(sinon.match.instanceOf(Error), oFixture.metadata2,
					oFixture.path + "/$Parameter", undefined);

			return this.bindContext(oFixture.path)
				._invoke(oGroupLock) // code under test
				.then(function () {
					assert.ok(false);
				}, function (oError) {
					assert.strictEqual(oError.message, oFixture.error);
				});
		});
	});

	//*********************************************************************************************
	QUnit.test("function, no invoke", function (assert) {
		var oBinding, oCachePromise;

		this.mock(_Cache).expects("createSingle").never();
		oBinding = this.bindContext("/FunctionImport(...)");

		assert.strictEqual(oBinding.oCache, null);
		assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		oCachePromise = oBinding.oCachePromise;
		this.mock(oBinding).expects("_fireChange").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("createReadGroupLock").never();
		this.mock(oBinding).expects("refreshDependentBindings").never();

		// code under test (as called by ODataBinding#refresh)
		assert.strictEqual(oBinding.refreshInternal("", undefined, true).isFulfilled(), true);

		assert.strictEqual(oBinding.oCachePromise, oCachePromise, "must not recreate the cache");

		return oBinding.fetchValue("/FunctionImport(...)").then(function (vValue) {
			assert.strictEqual(vValue, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("function, base context, no invoke", function (assert) {
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
		var sTitle = "_invoke: OperationImport, relative (to base context): " + bRelative;

		QUnit.test(sTitle, function (assert) {
			var oBaseContext = this.oModel.createBindingContext("/"),
				sPath = (bRelative ? "" : "/") + "OperationImport(...)",
				oBinding = this.bindContext(sPath, oBaseContext),
				oGroupLock = {getGroupId : function () {}},
				oPromise;

			this.mock(oBinding).expects("getResolvedPathWithReplacedTransientPredicates")
				.withExactArgs().returns("/OperationImport(...)");
			this.mock(this.oModel.getMetaModel()).expects("fetchObject")
				.withExactArgs("/OperationImport/@$ui5.overload")
				.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
			this.mock(oBinding).expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock), "/OperationImport(...)",
					"~oOperationMetadata~", "~mParameters~", undefined, "~bIgnoreETag~",
					"~fnOnStrictHandlingFailed~")
				.returns(SyncPromise.resolve("~oResult~"));
			this.mock(oBinding).expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Change});
			this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
			this.mock(oBinding).expects("refreshDependentBindings")
				.withExactArgs("", "groupId", true)
				.returns(SyncPromise.resolve(Promise.resolve()));
			this.mock(oBinding).expects("handleOperationResult")
				.withExactArgs("~oOperationMetadata~", "~oResult~", undefined)
				.returns(undefined);

			// code under test
			oPromise = oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~",
				"~fnOnStrictHandlingFailed~");

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
				sTitle = "_invoke: bound operation, relative binding " + sOperation
					+ (bBaseContext ? ", baseContext" : "");

			QUnit.test(sTitle, function (assert) {
				var that = this,
					oEntity = {},
					oExpectation,
					oGroupLock0 = {getGroupId : function () {}},
					sResolvedPath1 = "/EntitySet(ID='1')/navigation1/" + sOperation + "(...)",
					sResolvedPath2 = "/EntitySet(ID='2')/navigation1/" + sOperation + "(...)",
					oResponseEntity = {},
					oRootBinding = {
						getRootBinding : function () { return oRootBinding; },
						isSuspended : function () { return false; }
					},
					oParentContext1 = createContext("/EntitySet(ID='1')/navigation1"),
					oParentContext2 = createContext("/EntitySet(ID='2')/navigation1"),
					oBinding = this.bindContext(sOperation + "(...)", oParentContext1,
						{$$groupId : "groupId"}),
					oBindingMock = this.mock(oBinding);

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

				_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
				this.mock(this.oModel.getMetaModel()).expects("fetchObject").twice()
					.withExactArgs("/EntitySet/navigation1/" + sOperation + "/@$ui5.overload")
					.returns(SyncPromise.resolve(["~oOperationMetadata~"]));

				// code under test - must not ask its context
				assert.strictEqual(
					oBinding.fetchValue(oBinding.getBoundContext().getPath()).getResult(),
					undefined
				);

				if (bBaseContext) {
					oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock0), sResolvedPath1,
							"~oOperationMetadata~", "~mParameters~", undefined, "~bIgnoreETag~",
							undefined)
						.returns(Promise.resolve(oResponseEntity));
				} else {
					oExpectation = oBindingMock.expects("createCacheAndRequest")
						.withExactArgs(sinon.match.same(oGroupLock0), sResolvedPath1,
							"~oOperationMetadata~", "~mParameters~", sinon.match.func,
							"~bIgnoreETag~", undefined)
						.returns(Promise.resolve(oResponseEntity));
					this.mock(oParentContext1).expects("getValue").on(oParentContext1)
						.withExactArgs(sPathPrefix).returns(oEntity);
				}
				expectChangeAndRefreshDependent(oGroupLock0);
				oBindingMock.expects("handleOperationResult")
					.withExactArgs("~oOperationMetadata~", oResponseEntity, undefined)
					.returns(undefined);

				// code under test
				return oBinding._invoke(oGroupLock0, "~mParameters~", "~bIgnoreETag~")
				.then(function (oReturnValueContext) {
					var oGroupLock1 = {getGroupId : function () {}};

					assert.strictEqual(oReturnValueContext, undefined);
					if (oExpectation) {
						//TODO avoid to invoke a request via getObject, which does not wait for
						// results anyway!
						assert.strictEqual(oExpectation.args[0][4](), oEntity);
					}

					oBindingMock.expects("_fireChange")
						.withExactArgs({reason : ChangeReason.Context});
					// @see Context#destroy for element and parameter context
					that.mock(that.oModel).expects("getDependentBindings").returns([]).exactly(2);

					// code under test: setContext clears the cache
					oBinding.setContext(oParentContext2);

					if (bBaseContext) {
						oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock1), sResolvedPath2,
								"~oOperationMetadata~", "~mParameters~", undefined, "~bIgnoreETag~",
								undefined);
					} else {
						oExpectation = oBindingMock.expects("createCacheAndRequest")
							.withExactArgs(sinon.match.same(oGroupLock1), sResolvedPath2,
								"~oOperationMetadata~", "~mParameters~", sinon.match.func,
								"~bIgnoreETag~", undefined);
						that.mock(oParentContext2).expects("getValue").on(oParentContext2)
							.withExactArgs(sPathPrefix).returns(oEntity);
					}
					expectChangeAndRefreshDependent(oGroupLock1);
					oBindingMock.expects("handleOperationResult")
						.withExactArgs("~oOperationMetadata~", undefined, undefined)
						.returns(undefined);

					// code under test: invoke creates a new cache with the new path
					return oBinding.setParameter("foo", "bar")
						._invoke(oGroupLock1, "~mParameters~", "~bIgnoreETag~")
						.then(function (oReturnValueContext) {
							assert.strictEqual(oReturnValueContext, undefined);
							if (oExpectation) {
								assert.strictEqual(oExpectation.args[0][4](), oEntity);
							}
						});
				});
			});
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bOnCollection) {
		var sTitle = "_invoke: bound operation " + (bOnCollection ? "on a collection " : "")
				+ "with return value context";

		QUnit.test(sTitle, function (assert) {
			var oCache = {
					setResourcePath : function () {}
				},
				bDependentsRefreshed,
				oError = {},
				oGroupLock = {
					getGroupId : function () {},
					unlock : function () {}
				},
				oGroupLockMock = this.mock(oGroupLock),
				oRootBinding = {
					getRootBinding : function () { return oRootBinding; },
					isSuspended : function () { return false; }
				},
				sParentContextPath = bOnCollection ? "/TEAMS" : "/TEAMS('42')",
				oParentContext = Context.create(this.oModel, oRootBinding, sParentContextPath),
				oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
					{$$groupId : "groupId"}),
				oBindingMock = this.mock(oBinding),
				oMetaModelMock = this.mock(this.oModel.getMetaModel()),
				oModelMock = this.mock(this.oModel),
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
				.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
			oBinding.oCache = oCache; // "mock" createCacheAndRequest
			oBindingMock.expects("createCacheAndRequest")
				.withExactArgs(sinon.match.same(oGroupLock),
					sParentContextPath + "/name.space.Operation(...)", "~oOperationMetadata~",
					"~mParameters~", sinon.match.func, "~bIgnoreETag~", undefined)
				.returns(Promise.resolve("~ResponseEntity0~"));
			oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
			oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
			oBindingMock.expects("refreshDependentBindings").withExactArgs("", "groupId", true)
				.returns(asyncRefresh());
			oBindingMock.expects("handleOperationResult")
				.withExactArgs("~oOperationMetadata~", "~ResponseEntity0~", undefined)
				.returns("~oReturnValueContextFirstInvoke~");

			// code under test
			return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~")
			.then(function (oReturnValueContext0) {
				assert.strictEqual(oReturnValueContext0, "~oReturnValueContextFirstInvoke~");
				assert.strictEqual(bDependentsRefreshed, true);

				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
					.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
				oBindingMock.expects("createCacheAndRequest")
					.withExactArgs(sinon.match.same(oGroupLock),
						sParentContextPath + "/name.space.Operation(...)", "~oOperationMetadata~",
						"~mParameters~", sinon.match.func, "~bIgnoreETag~", undefined)
					.returns(Promise.resolve("~ResponseEntity1~"));
				oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
				oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
				oBindingMock.expects("refreshDependentBindings")
					.withExactArgs("", "groupId", true).returns(asyncRefresh());
				oBindingMock.expects("handleOperationResult")
					.withExactArgs("~oOperationMetadata~", "~ResponseEntity1~", undefined)
					.returns("~oReturnValueContextSecondInvoke~");

				// code under test
				return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~");
			}).then(function (oReturnValueContext1) {
				assert.strictEqual(oReturnValueContext1, "~oReturnValueContextSecondInvoke~");

				oMetaModelMock.expects("fetchObject")
					.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
					.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
				oBindingMock.expects("createCacheAndRequest")
					.withExactArgs(sinon.match.same(oGroupLock),
						sParentContextPath + "/name.space.Operation(...)",
						"~oOperationMetadata~", "~mParameters~", sinon.match.func, "~bIgnoreETag~",
						undefined)
					.returns(Promise.reject(oError));
				oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
				oGroupLockMock.expects("getGroupId").withExactArgs().returns("groupId");
				oBindingMock.expects("refreshDependentBindings").withExactArgs("", "groupId", true)
					.returns(SyncPromise.resolve(Promise.resolve()));
				that.mock(_Helper).expects("adjustTargetsInError")
					.withExactArgs({}, "~oOperationMetadata~", (bOnCollection
							? "/TEAMS"
							: "/TEAMS('42')") + "/name.space.Operation(...)/$Parameter",
						bOnCollection ? "/TEAMS" : "/TEAMS('42')");
				oModelMock.expects("reportError");

				// code under test
				return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~")
				.then(function () {
					assert.ok(false, "unexpected success");
				}, function (oError0) {
					assert.strictEqual(oError0, oError);
				});
			});
		});
	});

	//*********************************************************************************************
[false, true].forEach(function (bNavigationProperty) {
	var sTitle = "_invoke: bReplaceWithRVC, bNavigationProperty=" + bNavigationProperty;

	QUnit.test(sTitle, function (assert) {
		var oGroupLock = {
				getGroupId : function () {}
			},
			oMetaModelMock = this.mock(this.oModel.getMetaModel()),
			oOperationMetadata = bNavigationProperty ? {
				$kind : "NavigationProperty"
			} : "~oOperationMetadata~",
			oParentEntity = {},
			sPath = bNavigationProperty ? "ToTwin" : "name.space.Operation",
			oRootBinding = {
				doReplaceWith : function () {}
			},
			oParentContext = Context.create(this.oModel, oRootBinding, "/TEAMS('42')"),
			oBinding = this.bindContext(sPath + "(...)", oParentContext);

		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
		oMetaModelMock.expects("fetchObject")
			.withExactArgs("/TEAMS/" + sPath + "/@$ui5.overload")
			.returns(SyncPromise.resolve(Promise.resolve(
				bNavigationProperty ? undefined : [oOperationMetadata])));
		oMetaModelMock.expects("fetchObject").exactly(bNavigationProperty ? 1 : 0)
			.withExactArgs("/TEAMS/ToTwin").returns(SyncPromise.resolve(oOperationMetadata));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/TEAMS('42')/" + sPath + "(...)",
				sinon.match.same(oOperationMetadata), "~mParameters~", sinon.match.func,
				"~bIgnoreETag~", "~fnOnStrictHandlingFailed~")
			.returns(Promise.resolve("~oResponseEntity~"));
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oBinding).expects("refreshDependentBindings").withExactArgs("", "groupId", true)
			.returns(SyncPromise.resolve(Promise.resolve()));
		this.mock(oBinding).expects("handleOperationResult")
			.withExactArgs(oOperationMetadata, "~oResponseEntity~", true)
			.returns("~oResult~");

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~",
			"~fnOnStrictHandlingFailed~", /*bReplaceWithRVC*/true)
		.then(function (oResultingContext) {
			assert.strictEqual(oResultingContext, "~oResult~");
			assert.strictEqual(oBinding.oCache, null);
			assert.strictEqual(oBinding.oCachePromise.getResult(), null);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_invoke: bReplaceWithRVC w/o r.v.c.", function (assert) {
		var oError = new Error("Cannot replace w/o return value context"),
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oParentContext = Context.create(this.oModel, {/*oRootBinding*/}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext),
			oReportErrorExpectation,
			oResponseEntity = {};

		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
			.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/TEAMS('42')/name.space.Operation(...)",
				"~oOperationMetadata~", "~mParameters~", sinon.match.func, "~bIgnoreETag~",
				"~fnOnStrictHandlingFailed~")
			.returns(Promise.resolve(oResponseEntity));
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oBinding).expects("refreshDependentBindings").withExactArgs("", "groupId", true)
			.returns(SyncPromise.resolve(Promise.resolve()));
		this.mock(oBinding).expects("handleOperationResult")
			.withExactArgs("~oOperationMetadata~", oResponseEntity, true)
			.throws(oError);
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		oReportErrorExpectation = this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to invoke /TEAMS('42')/name.space.Operation(...)", sClassName,
			sinon.match.typeOf("error")); // Note: sinon.match.object does not match here :-(

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~",
			"~fnOnStrictHandlingFailed~", /*bReplaceWithRVC*/true)
		.then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.strictEqual(oReportErrorExpectation.args[0][2], oError);
		});
	});

	//*********************************************************************************************
	QUnit.test("_invoke: OperationImport, failure", function (assert) {
		var bDependentsRefreshed = false,
			sPath = "/OperationImport(...)",
			oBinding = this.bindContext(sPath),
			oError = new Error("deliberate failure"),
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			};

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/OperationImport(...)",
				"~oOperationMetadata~", "~mParameters~", undefined, "~bIgnoreETag~", undefined)
			.returns(SyncPromise.reject(oError));
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oBinding).expects("refreshDependentBindings").withExactArgs("", "groupId", true)
			.returns(new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}));
		this.mock(this.oModel).expects("reportError").withExactArgs(
			"Failed to invoke " + sPath, sClassName, sinon.match.same(oError));
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(_Helper).expects("adjustTargetsInError")
			.withExactArgs(sinon.match.same(oError), "~oOperationMetadata~",
				"/OperationImport(...)/$Parameter", undefined);

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
			assert.strictEqual(bDependentsRefreshed, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("_invoke: OperationImport, error in change handler", function (assert) {
		var sPath = "/OperationImport(...)",
			oBinding = this.bindContext(sPath),
			oError = new Error("deliberate failure"),
			oGroupLock = {unlock : function () {}},
			oModelMock = this.mock(this.oModel);

		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/OperationImport/@$ui5.overload")
			.returns(SyncPromise.resolve(["~oOperationMetadata~"]));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/OperationImport(...)",
				"~oOperationMetadata~", "~mParameters~", undefined, "~bIgnoreETag~", undefined)
			.returns(SyncPromise.resolve({/*oResult*/}));
		// Note: if control's handler fails, we don't care about state of dependent bindings
		this.mock(oBinding).expects("refreshDependentBindings").never();
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		oModelMock.expects("reportError").withExactArgs(
			"Failed to invoke " + sPath, sClassName, sinon.match.same(oError));

		oBinding.attachChange(function () {
			throw oError;
		});

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});

	//*********************************************************************************************
[{
	error : {}
}, {
	// no error -> nothing reported
}].forEach(function (oFixture, i) {
	QUnit.test("_invoke: bound operation failure with messages #" + i, function (assert) {
		var oParentContext = Context.create(this.oModel, {/*binding*/}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"}),
			oError = new Error("Operation failed"),
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oOperationMetadata = {
				$IsBound : true,
				$Parameter : [{
					$Name : "_it"
				}, {
					$Name : "Complex"
				}, {
					$Name : "Param"
				}]
			};

		oError.error = oFixture.error;
		oError.resourcePath = "~";
		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/TEAMS/name.space.Operation/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/TEAMS('42')/name.space.Operation(...)",
				sinon.match.same(oOperationMetadata), "~mParameters~", sinon.match.func,
				"~bIgnoreETag~", undefined)
			.rejects(oError);
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(_Helper).expects("adjustTargetsInError")
			.withExactArgs(sinon.match.same(oError), sinon.match.same(oOperationMetadata),
				"/TEAMS('42')/name.space.Operation(...)/$Parameter", "/TEAMS('42')");
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to invoke /TEAMS('42')/name.space.Operation(...)",
				sClassName, sinon.match.same(oError))
			.callsFake(function (_sLogMessage, _sReportingClassName, oError) {
				assert.strictEqual(oError.resourcePath, "~"); // unchanged
			});

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
[{
	error : {}
}, {
	// no error -> nothing reported
}].forEach(function (oFixture, i) {
	QUnit.test("_invoke: unbound operation failure with messages #" + i, function (assert) {
		var oBinding = this.bindContext("/ActionImport(...)", null, {$$groupId : "groupId"}),
			oError = new Error("Operation failed"),
			oGroupLock = {
				getGroupId : function () {},
				unlock : function () {}
			},
			oOperationMetadata = {
				$IsBound : false,
				$Parameter : [{
					$Name : "Complex"
				}, {
					$Name : "Param"
				}]
			};

		oError.error = oFixture.error;
		oError.resourcePath = "~";
		this.mock(this.oModel.getMetaModel()).expects("fetchObject")
			.withExactArgs("/ActionImport/@$ui5.overload")
			.returns(SyncPromise.resolve([oOperationMetadata]));
		this.mock(oBinding).expects("createCacheAndRequest")
			.withExactArgs(sinon.match.same(oGroupLock), "/ActionImport(...)",
				sinon.match.same(oOperationMetadata), "~mParameters~", undefined, "~bIgnoreETag~",
				undefined)
			.rejects(oError);
		this.mock(oGroupLock).expects("getGroupId").withExactArgs().returns("groupId");
		this.mock(oGroupLock).expects("unlock").withExactArgs(true);
		this.mock(_Helper).expects("adjustTargetsInError")
			.withExactArgs(sinon.match.same(oError), sinon.match.same(oOperationMetadata),
			"/ActionImport(...)/$Parameter", undefined);
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to invoke /ActionImport(...)",
				sClassName, sinon.match.same(oError))
			.callsFake(function (_sLogMessage, _sReportingClassName, oError) {
				assert.strictEqual(oError.resourcePath, "~"); // unchanged
			});

		// code under test
		return oBinding._invoke(oGroupLock, "~mParameters~", "~bIgnoreETag~").then(function () {
			assert.ok(false);
		}, function (oError0) {
			assert.strictEqual(oError0, oError);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("getReturnValueContextPath", function (assert) {
		const oBinding = this.bindContext(
				"/EntitySet(ID='1')/navigation1/schema.Operation(...)");
		const oContext = {getPath : function () {}};
		oBinding.oContext = oContext;
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = false;

		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("hasReturnValueContext").withExactArgs().returns(true);
		const oContextMock = this.mock(oContext);
		oContextMock.expects("getPath").withExactArgs()
			.returns("/Artists('42')");
		const oHelperMock = this.mock(_Helper);
		const oResponseEntity = {};
		oHelperMock.expects("getPrivateAnnotation").withExactArgs(oResponseEntity, "predicate")
			.returns("('77')");

		// code under test
		assert.strictEqual(
			oBinding.getReturnValueContextPath(oResponseEntity),
			"Artists('77')");

		oBindingMock.expects("hasReturnValueContext").withExactArgs().returns(true);
		oContextMock.expects("getPath").withExactArgs()
			.returns("/Artists");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs(oResponseEntity, "predicate")
			.returns("('77')");

		// code under test
		assert.strictEqual(
			oBinding.getReturnValueContextPath(oResponseEntity),
			"Artists('77')");
	});

	//*********************************************************************************************
	QUnit.test("getReturnValueContextPath: hasReturnValueContext = false", function (assert) {
		const oBinding = this.bindContext("/EntitySet(ID='1')/navigation1/schema.Operation(...)");
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = false;

		this.mock(oBinding).expects("hasReturnValueContext").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(oBinding.getReturnValueContextPath({/*oResponseEntity*/}), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getReturnValueContextPath with navigation property", function (assert) {
		const oBinding = this.bindContext(
				"/EntitySet(ID='1')/navigation1/schema.Operation(...)");
		const oContext = {getPath : mustBeMocked};
		oBinding.oContext = oContext;
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = true;
		this.mock(oBinding).expects("hasReturnValueContext").withExactArgs().returns(true);
		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/Teams('42')/TEAM_2_EMPLOYEES('1')");
		const oResponseEntity = {"~partner~" : "~oKeyProperties~"};
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(oResponseEntity, "predicate")
			.returns("('11')");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("Teams('42')/TEAM_2_EMPLOYEES('1')")
			.returns("Teams/TEAM_2_EMPLOYEES");
		const oMetaModel = {getObject : mustBeMocked};
		this.mock(this.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/Teams/TEAM_2_EMPLOYEES/$Partner")
			.returns("~partner~");
		this.mock(this.oModel).expects("getKeyPredicate")
			.withExactArgs("/Teams", "~oKeyProperties~")
			.returns("('23')");

		// code under test
		assert.strictEqual(
			oBinding.getReturnValueContextPath(oResponseEntity),
			"Teams('23')/TEAM_2_EMPLOYEES('11')");
	});

	//*********************************************************************************************
[{
	sCase : "no partner entity",
	iGetKeyPredicate : 0,
	sPredicate : "('11')",
	oResponseEntity : {/*no partner*/}
}, {
	sCase : "no key predicate",
	iGetKeyPredicate : 1,
	sPartnerPredicate : "~partnerPredicate~",
	sPredicate : undefined,
	oResponseEntity : {"~partner~" : "~partnerEntity~"}
}, {
	sCase : "no partner predicate",
	iGetKeyPredicate : 1,
	sPartnerPredicate : undefined,
	sPredicate : "('11')",
	oResponseEntity : {"~partner~" : "~partnerEntity~"}
}].forEach(function (oFixture) {
	const sTitle = "getReturnValueContextPath with navigation property: " + oFixture.sCase;
	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindContext("/EntitySet(ID='1')/navigation1/schema.Operation(...)");
		const oContext = {getPath : mustBeMocked};
		oBinding.oContext = oContext;
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = true;
		this.mock(oBinding).expects("hasReturnValueContext").withExactArgs().returns(true);
		this.mock(oContext).expects("getPath").withExactArgs()
			.returns("/Teams('42')/TEAM_2_EMPLOYEES('1')");
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs(oFixture.oResponseEntity, "predicate")
			.returns(oFixture.sPredicate);
		this.mock(_Helper).expects("getMetaPath").withExactArgs("Teams('42')/TEAM_2_EMPLOYEES('1')")
			.returns("Teams/TEAM_2_EMPLOYEES");
		const oMetaModel = {getObject : mustBeMocked};
		this.mock(this.oModel).expects("getMetaModel").withExactArgs().returns(oMetaModel);
		this.mock(oMetaModel).expects("getObject")
			.withExactArgs("/Teams/TEAM_2_EMPLOYEES/$Partner")
			.returns("~partner~");
		this.mock(oBinding.oModel).expects("getKeyPredicate").exactly(oFixture.iGetKeyPredicate)
			.withExactArgs("/Teams", "~partnerEntity~")
			.returns(oFixture.sPartnerPredicate);

		// code under test
		assert.strictEqual(oBinding.getReturnValueContextPath(oFixture.oResponseEntity), undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bound operation", function (assert) {
		const oBinding = this.bindContext(
				"/EntitySet(ID='1')/navigation1/schema.Operation(...)", null,
				{$$groupId : "groupId"});

		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(false);
		this.mock(oBinding).expects("hasReturnValueContext").never();
		this.mock(Context).expects("createNewContext").never();

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bound operation with RVC", function (assert) {
		var oCache = {
				setResourcePath : function () {}
			},
			oParentContext = Context.create(this.oModel, null, "/TEAMS"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"}),
			oResponseEntity = {};

		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
		oBinding.oCache = oCache; // "mock" createCacheAndRequest
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").returns(null);
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(oResponseEntity)
			.returns("TEAMS('77')");
		this.mock(Context).expects("createNewContext")
			.withExactArgs(sinon.match.same(this.oModel), sinon.match.same(oBinding),
				"/TEAMS('77')")
			.returns("~oReturnValueContext~");
		this.mock(oCache).expects("setResourcePath").withExactArgs("TEAMS('77')");

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity),
			"~oReturnValueContext~");
	});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bReplaceWithRVC", function (assert) {
		var oParentEntity = {},
			oResponseEntity = {},
			oResult = {
				setNewGeneration : function () {}
			},
			oRootBinding = {
				doReplaceWith : function () {}
			},
			oParentContext = Context.create(this.oModel, oRootBinding, "/TEAMS('42')"),
			oBinding = this.bindContext("ToTwin(...)", oParentContext);

		oBinding.oOperation.bAdditionalQueryOptionsForRVC = false;
		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").withExactArgs().returns(oParentEntity);
		this.mock(oParentContext).expects("patch").never();
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(oResponseEntity)
			.returns("~sReturnValueContextPath~");
		this.mock(Context).expects("createNewContext").never();
		this.mock(oRootBinding).expects("doReplaceWith")
			.withExactArgs(sinon.match.same(oParentContext), sinon.match.same(oResponseEntity),
				"('77')")
			.returns(oResult);
		this.mock(oResult).expects("setNewGeneration").withExactArgs();

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity, true),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bReplaceWithRVC and navigation property", function (assert) {
		const oRootBinding = {doReplaceWith : mustBeMocked};
		const oParentContext = Context.create(this.oModel, oRootBinding,
				"/TEAMS('42')/TEAM_2_EMPLOYEES(1)");
		const oBinding = this.bindContext("ToTwin(...)", oParentContext);
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = true;
		const oParentEntity = {};
		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('1')");
		const oResponseEntity = {};
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('11')");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").withExactArgs().returns(oParentEntity);
		this.mock(oParentContext).expects("patch").never();
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(oResponseEntity)
			.returns("/TEAMS('42')/TEAM_2_EMPLOYEES('11')");
		this.mock(Context).expects("createNewContext").never();
		const oResult = {setNewGeneration : mustBeMocked};
		this.mock(oRootBinding).expects("doReplaceWith")
			.withExactArgs(sinon.match.same(oParentContext), sinon.match.same(oResponseEntity),
				"('11')")
			.returns(oResult);
		this.mock(oResult).expects("setNewGeneration").withExactArgs();

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity, true),
			oResult);
	});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bReplaceWithRVC = true and keypredicate has changed",
			function (assert) {
		const oRootBinding = {};
		const oParentContext = Context.create(this.oModel, oRootBinding,
			"/TEAMS('42')/TEAM_2_EMPLOYEES(1)");
		const oBinding = this.bindContext("ToTwin(...)", oParentContext);
		oBinding.oOperation.bAdditionalQueryOptionsForRVC = true;
		const oParentEntity = {};
		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('1')");
		const oResponseEntity = {};
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", ("11"));
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").withExactArgs().returns(oParentEntity);
		this.mock(oParentContext).expects("patch").never();
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(oResponseEntity)
			.returns("/TEAMS('77')/TEAM_2_EMPLOYEES('11')");

		assert.throws(function () {
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity, true);
		}, new Error("Cannot replace due changed key predicates and navigation property in path"));
	});

	//*********************************************************************************************
	QUnit.test("handleOperationResult: bReplaceWithRVC w/o r.v.c.", function (assert) {
		var oParentContext = Context.create(this.oModel, {/*oRootBinding*/}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext),
			oResponseEntity = {};

		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('77')");

		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(false);
		this.mock(oParentContext).expects("getValue").never();
		this.mock(oParentContext).expects("patch").never();
		this.mock(oBinding).expects("getReturnValueContextPath").never();
		this.mock(Context).expects("createNewContext").never();

		assert.throws(function () {
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity, true);
		}, new Error("Cannot replace w/o return value context"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bReplaceWithRVC) {
	var sTitle = "handleOperationResult: bound operation w/o key predicates, bReplaceWithRVC="
			+ bReplaceWithRVC;

	QUnit.test(sTitle, function (assert) {
		var oParentContext = Context.create(this.oModel, {/*binding*/}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"});

		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").returns({/*oParentEntity*/});
		this.mock(oParentContext).expects("patch").never();
		// not needed w/o sResponsePredicate
		this.mock(oBinding).expects("getReturnValueContextPath").never();
		this.mock(Context).expects("createNewContext").never();

		if (bReplaceWithRVC) {
			assert.throws(function () {
				// code under test
				oBinding.handleOperationResult("~oOperationMetadata~", {/*oResponseEntity*/},
					 bReplaceWithRVC);
			}, new Error("Cannot replace w/o return value context"));
		} else {
			assert.strictEqual(
				// code under test
				oBinding.handleOperationResult("~oOperationMetadata~", {/*oResponseEntity*/},
					bReplaceWithRVC),
				undefined);
		}
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
	QUnit.test("handleOperationResult: bound operation "
			+ (oFixture.bRead ? "" : "on context w/o read ")
			+ "returning the same entity type with key " + oFixture.sId,
			function (assert) {
		var oParentContext = Context.create(this.oModel, {/*binding*/}, "/TEAMS('42')"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"}),
			oParentEntity = {},
			sPredicate = "('" + oFixture.sId + "')",
			oResponseEntity = {};

		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", sPredicate);
		oBinding.oCache = { // "mock" createCacheAndRequest
			setResourcePath : function () {}
		};
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue")
			.returns(oFixture.bRead ? oParentEntity : undefined);
		this.mock(oParentContext).expects("patch")
			.exactly(oFixture.bRead && oFixture.sId === "42" ? 1 : 0)
			.withExactArgs(sinon.match.same(oResponseEntity));
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(sinon.match.same(oResponseEntity))
			.returns("TEAMS" + sPredicate);
		this.mock(Context).expects("createNewContext")
			.withExactArgs(this.oModel, oBinding, "/TEAMS" + sPredicate)
			.returns("~oReturnValueContext~");
		this.mock(oBinding.oCache).expects("setResourcePath")
			.withExactArgs("TEAMS" + sPredicate);

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity),
			"~oReturnValueContext~");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSameId) {
	var sTitle = "handleOperationResult: bound action on navigation property updates binding"
			+ "parameter, " + bSameId;

	QUnit.test(sTitle, function (assert) {
		var oParentContext = Context.create(this.oModel, {/*binding*/},
				"/TEAMS('42')/TEAM_2_MANAGER"),
			oBinding = this.bindContext("name.space.Operation(...)", oParentContext,
				{$$groupId : "groupId"}),
			oParentEntity = {},
			oResponseEntity = {};

		_Helper.setPrivateAnnotation(oParentEntity, "predicate", "('42')");
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", bSameId ? "('42')" : "()");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetadata~").returns(true);
		this.mock(oParentContext).expects("getValue").returns(oParentEntity);
		this.mock(oParentContext).expects("patch").exactly(bSameId ? 1 : 0)
			.withExactArgs(sinon.match.same(oResponseEntity));
		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(oResponseEntity).returns(undefined);

		assert.strictEqual(
			// code under test
			oBinding.handleOperationResult("~oOperationMetadata~", oResponseEntity),
			undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: FunctionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			oGroupLock = {},
			oOperationMetadata = {$kind : "Function", $ReturnType : {$Type : "Edm.String"}},
			mParameters = {},
			mParametersCopy = {},
			sPath = "/FunctionImport(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "FunctionImport()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(mParameters))
			.returns(mParametersCopy);
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mQueryOptions);
		this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
			.withExactArgs(oOperationMetadata, mQueryOptions)
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
				sinon.match.same(mParametersCopy), sinon.match.same(mQueryOptions), undefined)
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.same(this.oModel.bSharedRequests), undefined, false,
				"/FunctionImport/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		oExpectation = this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "", undefined, undefined, false,
				sinon.match.func)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, mParameters),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.oOperation.mRefreshParameters, mParameters);

		// code under test
		assert.strictEqual(oExpectation.args[0][5](), sPath.slice(1));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: bound function", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			fnGetEntity = {}, // do not call!
			oGroupLock = {},
			oOperationMetadata = {$kind : "Function", $ReturnType : {$Type : "name.space.Type"}},
			mParameters = {},
			mParametersCopy = {},
			sPath = "/Entity('1')/navigation/bound.Function(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "Entity('1')/navigation/bound.Function()",
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		this.mock(Object).expects("assign").withExactArgs({},
				sinon.match.same(mParameters))
			.returns(mParametersCopy);
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mQueryOptions);
		this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
			.withExactArgs(oOperationMetadata, mQueryOptions)
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParametersCopy),
				sinon.match.same(mQueryOptions), sinon.match.same(fnGetEntity))
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.same(this.oModel.bSharedRequests), undefined, false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType/$Type")
			.returns(oSingleCache);
		oExpectation = this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "", undefined, undefined, false,
				sinon.match.func)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, mParameters,
				fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.oOperation.mRefreshParameters, mParameters);

		// code under test
		assert.strictEqual(oExpectation.args[0][5](), sPath.slice(1));
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: NavigationProperty w/ parameters", function (assert) {
		var oBinding = this.bindContext("n/a(...)", null, {$$inheritExpandSelect : true}),
			oGroupLock = {},
			oOperationMetadata = {$kind : "NavigationProperty"};

		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs(sinon.match.same(oOperationMetadata))
			.returns(true);
		this.mock(Object).expects("assign").never();
		this.mock(oBinding).expects("computeOperationQueryOptions").never();
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").never();
		this.mock(_Cache).expects("createSingle").never();
		assert.deepEqual(oBinding.oOperation, {
				bAction : undefined,
				bAdditionalQueryOptionsForRVC : undefined,
				mChangeListeners : {},
				mParameters : {},
				mRefreshParameters : {}
			});

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, "/Entity('0815')/ToTwin(...)",
				oOperationMetadata, {foo : "bar"});
		}, new Error("Unsupported parameters for navigation property"));

		assert.deepEqual(oBinding.oOperation, {
				bAction : undefined,
				bAdditionalQueryOptionsForRVC : undefined,
				mChangeListeners : {},
				mParameters : {},
				mRefreshParameters : {}
			}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: NavigationProperty", function (assert) {
		var oBinding = this.bindContext("n/a(...)", null, {$$inheritExpandSelect : true}),
			oExpectation,
			oOperationMetadata = {$kind : "NavigationProperty"},
			sPath = "/Entity('1')/ToTwin(...)",
			oResponseEntity = {},
			oSingleCache = {
				fetchValue : function () {}
			};

		this.oModel.bAutoExpandSelect = "~bAutoExpandSelect~";
		_Helper.setPrivateAnnotation(oResponseEntity, "predicate", "('2')");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter").twice()
			.withExactArgs(sinon.match.same(oOperationMetadata)).returns(true);
		this.mock(Object).expects("assign").withExactArgs({}, {}).returns("~mParametersCopy~");
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns("~mQueryOptions~");
		this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
			.withExactArgs(oOperationMetadata, "~mQueryOptions~")
			.returns("~mQueryOptions~");
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata), "~mParametersCopy~",
				"~mQueryOptions~", "~fnGetEntity~")
			.returns("~sResourcePath~");
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "~sResourcePath~",
				"~mQueryOptions~", "~bAutoExpandSelect~",
				sinon.match.same(this.oModel.bSharedRequests), undefined, false,
				"/Entity/ToTwin")
			.returns(oSingleCache);
		oExpectation = this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs("~oGroupLock~", "", undefined, undefined, false, sinon.match.func)
			.returns("~oPromise~");

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest("~oGroupLock~", sPath, oOperationMetadata,
				{/*mParameters*/}, /*do not call!*/"~fnGetEntity~"),
			"~oPromise~");
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.mCacheQueryOptions, "~mQueryOptions~");
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.deepEqual(oBinding.oOperation.mRefreshParameters, {/*mParameters*/});

		this.mock(oBinding).expects("getReturnValueContextPath")
			.withExactArgs(sinon.match.same(oResponseEntity))
			.returns("Entity('2')");

		// code under test
		assert.strictEqual(oExpectation.args[0][5](oResponseEntity), "Entity('2')");
	});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: ActionImport", function (assert) {
		var bAutoExpandSelect = {/*false, true*/},
			oBinding = this.bindContext("n/a(...)"),
			oExpectation,
			oGroupLock = {},
			oOperationMetadata = {$kind : "Action" /*no $ReturnType*/},
			mParameters = {},
			mParametersCopy = {},
			sPath = "/ActionImport(...)",
			oPromise = {},
			mQueryOptions = {},
			sResourcePath = "ActionImport",
			oSingleCache = {
				post : function () {}
			};

		this.oModel.bAutoExpandSelect = bAutoExpandSelect;
		this.mock(Object).expects("assign").withExactArgs({},
				sinon.match.same(mParameters))
			.returns(mParametersCopy);
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mQueryOptions);
		this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
			.withExactArgs(oOperationMetadata, mQueryOptions)
			.returns(mQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions").withExactArgs(sPath,
				sinon.match.same(oOperationMetadata), sinon.match.same(mParametersCopy),
				sinon.match.same(mQueryOptions), undefined)
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.same(this.oModel.bSharedRequests), undefined, true,
				"/ActionImport/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		oExpectation = this.mock(oSingleCache).expects("post")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParametersCopy),
				undefined, undefined, undefined, sinon.match.func)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, mParameters),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, true);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.oOperation.mRefreshParameters, mParameters);

		// code under test
		assert.strictEqual(oExpectation.args[0][5](), sPath.slice(1));
	});

	//*********************************************************************************************
	["return value context", "returns 'this'", "returns other", ""].forEach(function (sCase) {
		QUnit.test("createCacheAndRequest: bound action, " + sCase, function (assert) {
			var bAutoExpandSelect = {/*false, true*/},
				oBinding = this.bindContext("n/a(...)"),
				oDestroyExpectation,
				oEntity = {},
				oExpectation,
				fnGetEntity = this.spy(function () {
					return oEntity;
				}),
				fnGetOriginalResourcePath,
				oGroupLock = {},
				oHelperMock = this.mock(_Helper),
				oOperationMetadata = {
					$kind : "Action",
					$IsBound : true,
					$ReturnType : {$Type : "name.space.Type"}
				},
				mParameters = {},
				mParametersCopy = {},
				sPath = "/Entity('1')/navigation/bound.Action(...)",
				oPromise = {},
				mQueryOptions = {},
				sResourcePath = "Entity('1')/navigation/bound.Action",
				oResponseEntity = {},
				oReturnValueContext = {
					destroy : function () {}
				},
				oSingleCache = {
					post : function () {}
				};

			this.oModel.bAutoExpandSelect = bAutoExpandSelect;
			oBinding.oReturnValueContext = oReturnValueContext;
			oDestroyExpectation = this.mock(oReturnValueContext).expects("destroy").withExactArgs();
			this.mock(Object).expects("assign")
				.withExactArgs({}, sinon.match.same(mParameters))
				.returns(mParametersCopy);
			this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
				.returns(mQueryOptions);
			this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
				.withExactArgs(oOperationMetadata, mQueryOptions)
				.callsFake(() => {
					if (sCase === "returns other" || sCase === "returns 'this'") {
						oBinding.oOperation.bAdditionalQueryOptionsForRVC = false;
					}
					return mQueryOptions;
				});
			this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
				.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
					sinon.match.same(mParametersCopy), sinon.match.same(mQueryOptions),
					sinon.match.same(oEntity))
				.returns(sResourcePath);
			this.mock(_Cache).expects("createSingle")
				.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
					sinon.match.same(mQueryOptions), sinon.match.same(bAutoExpandSelect),
					sinon.match.same(this.oModel.bSharedRequests), undefined, true,
					"/Entity/navigation/bound.Action/@$ui5.overload/0/$ReturnType/$Type")
				.returns(oSingleCache);
			oExpectation = this.mock(oSingleCache).expects("post")
				.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(mParametersCopy),
					sinon.match.same(oEntity), "~bIgnoreETag~", undefined, sinon.match.func)
				.returns(oPromise);

			assert.strictEqual(
				// code under test
				oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, mParameters,
					fnGetEntity, "~bIgnoreETag~"),
				oPromise);
			assert.strictEqual(oBinding.oReturnValueContext, null);
			assert.ok(oDestroyExpectation.calledBefore(oExpectation));
			assert.strictEqual(oBinding.oOperation.bAction, true);
			assert.strictEqual(oBinding.oCache, oSingleCache);
			assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
			assert.strictEqual(oBinding.oOperation.mRefreshParameters, mParameters);
			assert.strictEqual(fnGetEntity.callCount, 1);

			fnGetOriginalResourcePath = oExpectation.args[0][5];
			switch (sCase) {
				case "return value context":
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					this.mock(oBinding).expects("getReturnValueContextPath")
						.withExactArgs(sinon.match.same(oResponseEntity))
						.returns("Entity('42')");

					// code under test ("getOriginalResourcePath")
					assert.strictEqual(fnGetOriginalResourcePath(oResponseEntity),
						"Entity('42')");
					break;

				case "returns 'this'":
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					this.mock(oBinding).expects("getReturnValueContextPath")
						.withExactArgs(sinon.match.same(oResponseEntity))
						.returns(undefined);
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
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(true);
					this.mock(oBinding).expects("getReturnValueContextPath")
						.withExactArgs(sinon.match.same(oResponseEntity))
						.returns(undefined);
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
					this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
						.withExactArgs(sinon.match.same(oOperationMetadata))
						.returns(false);
					this.mock(oBinding).expects("hasReturnValueContext").never();
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
			mParametersCopy = {},
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
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(mParameters))
			.returns(mParametersCopy);
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(mExpectedQueryOptions);
		this.mock(oBinding).expects("addQueryOptionsForReturnValueContext")
			.withExactArgs(oOperationMetadata, mExpectedQueryOptions)
			.returns(mExpectedQueryOptions);
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata),
				sinon.match.same(mParametersCopy), sinon.match.same(mExpectedQueryOptions),
				sinon.match.same(fnGetEntity))
			.returns(sResourcePath);
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), sResourcePath,
				sinon.match.same(mExpectedQueryOptions), sinon.match.same(bAutoExpandSelect),
				sinon.match.same(this.oModel.bSharedRequests), undefined, false,
				"/Entity/navigation/bound.Function/@$ui5.overload/0/$ReturnType/$Type")
			.returns(oSingleCache);
		this.mock(oSingleCache).expects("fetchValue")
			.withExactArgs(sinon.match.same(oGroupLock), "", undefined, undefined, false,
				sinon.match.func)
			.returns(oPromise);

		assert.strictEqual(
			// code under test
			oBinding.createCacheAndRequest(oGroupLock, sPath, oOperationMetadata, mParameters,
				fnGetEntity),
			oPromise);
		assert.strictEqual(oBinding.oOperation.bAction, false);
		assert.strictEqual(oBinding.oCache, oSingleCache);
		assert.strictEqual(oBinding.oCachePromise.getResult(), oSingleCache);
		assert.strictEqual(oBinding.oOperation.mRefreshParameters, mParameters);
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
[{
	$kind : "Function",
	$IsBound : true
}, {
	$kind : "Action",
	$IsBound : false
}].forEach(function (oOperationMetadata, i) {
	var sTitle = "createCacheAndRequest: bIgnoreETag; supported for bound actions only, #" + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindContext("n/a(...)"),
			oEntity = {},
			fnGetEntity = function () { return oEntity; };

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest({/*oGroupLock*/}, "/Foo(...)", oOperationMetadata,
				{/*mParameters*/}, fnGetEntity, /*bIgnoreETag*/true);
		}, new Error("Not a bound action: /Foo(...)"));
	});
});

	//*********************************************************************************************
[undefined, function () { return null; }].forEach(function (fnGetEntity, i) {
	QUnit.test("createCacheAndRequest: bIgnoreETag; fnGetEntity #" + i, function (assert) {
		var oBinding = this.bindContext("n/a(...)"),
			oOperationMetadata = {
				$kind : "Action",
				$IsBound : true
			};

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest({/*oGroupLock*/}, "/Foo(...)", oOperationMetadata,
				{/*mParameters*/}, fnGetEntity, /*bIgnoreETag*/true);
		}, new Error("Not a bound action: /Foo(...)"));
	});
});

	//*********************************************************************************************
	QUnit.test("createCacheAndRequest: Strict handling w/o action", function (assert) {
		var oBinding = this.bindContext("n/a(...)"),
			oOperationMetadata = {
				$kind : "notAnAction"
			};

		assert.throws(function () {
			// code under test
			oBinding.createCacheAndRequest({/*oGroupLock*/}, "/Foo(...)", oOperationMetadata,
				{/*mParameters*/}, {/*fnGetEntity*/}, {/*bIgnoreEtag*/},
				function () { /* fnOnStrictHandlingFailed*/ });
		}, new Error("Not an action: /Foo(...)"));
	});

	//*********************************************************************************************
[false, true].forEach(function (bRelative) {
	[false, true].forEach(function (bCallbackReturnsPromise) {
		var sTitle = "createCacheAndRequest: fnOnStrictHandlingFailed, relative=" + bRelative
				+ ", callbackReturnsPromise=" + bCallbackReturnsPromise;

	QUnit.test(sTitle, function (assert) {
		var oBinding = bRelative
				? this.bindContext("action(...)", Context.create(this.oModel, {}, "/bar"))
				: this.bindContext("/action(...)"),
			oError = new Error("message"),
			oExpectation,
			oModelMock = this.mock(this.oModel),
			oPromise = Promise.resolve(),
			fnOnStrictHandlingFailed = sinon.spy(function () {
				return bCallbackReturnsPromise ? oPromise : "foo";
			}),
			oOperationMetadata = {$kind : "Action"},
			sPath = "/ActionImport(...)",
			aRawMessages
				= ["~boundMessage0", "~boundMessage1", "~unboundMessage0", "~unboundMessage1"],
			oSingleCache = {
				post : function () {}
			};

		oError.error = {};

		this.mock(Object).expects("assign")
			.withExactArgs({}, "~mParameters~")
			.returns("~mParametersCopy~");
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns("~mQueryOptions~");
		this.mock(this.oModel.oRequestor).expects("getPathAndAddQueryOptions")
			.withExactArgs(sPath, sinon.match.same(oOperationMetadata), "~mParametersCopy~",
				"~mQueryOptions~", undefined)
			.returns("ActionImport");
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "ActionImport",
				"~mQueryOptions~", false,
				sinon.match.same(this.oModel.bSharedRequests), undefined, true,
				"/ActionImport/@$ui5.overload/0/$ReturnType")
			.returns(oSingleCache);
		oExpectation = this.mock(oSingleCache).expects("post")
			.withExactArgs("~oGroupLock~", "~mParametersCopy~", undefined, false, sinon.match.func,
				sinon.match.func);

		// code under test
		oBinding.createCacheAndRequest("~oGroupLock~", sPath, oOperationMetadata, "~mParameters~",
			undefined, false, fnOnStrictHandlingFailed);

		oBinding.oParameterContext = {getPath : function () {}};
		this.mock(oBinding.oParameterContext).expects("getPath").withExactArgs().returns("~Path~");
		if (bRelative) {
			this.mock(oBinding.oContext).expects("getPath")
				.withExactArgs()
				.returns("~contextPath~");
		}
		this.mock(_Helper).expects("adjustTargetsInError")
			.withExactArgs(sinon.match.same(oError), sinon.match.same(oOperationMetadata), "~Path~",
				bRelative ? "~contextPath~" : undefined);
		this.mock(_Helper).expects("extractMessages")
			.withExactArgs(sinon.match(function (oError) {
				return oError.error.$ignoreTopLevel === true;
			}))
			.returns(aRawMessages);

		oModelMock.expects("createUI5Message").withExactArgs(aRawMessages[0])
			.returns("~ui5message0");
		oModelMock.expects("createUI5Message").withExactArgs(aRawMessages[1])
			.returns("~ui5message1");
		oModelMock.expects("createUI5Message").withExactArgs(aRawMessages[2])
			.returns("~ui5message2");
		oModelMock.expects("createUI5Message").withExactArgs(aRawMessages[3])
			.returns("~ui5message3");

		// code under test - invoke onStrictHandlingFailed callback
		if (bCallbackReturnsPromise) {
			assert.strictEqual(oExpectation.args[0][4](oError), oPromise);
		} else {
			assert.throws(function () {
				oExpectation.args[0][4](oError);
			}, new Error("Not a promise: foo"));
		}

		assert.ok(fnOnStrictHandlingFailed.calledOnceWithExactly(["~ui5message0", "~ui5message1",
			"~ui5message2", "~ui5message3"]));
	});
	});
});
	//*********************************************************************************************
	QUnit.test("setParameter, invoke: not deferred", function (assert) {
		var oBinding = this.bindContext("/OperationImport()");

		assert.throws(function () {
			oBinding.setParameter();
		}, new Error("The binding must be deferred: /OperationImport()"));
		assert.throws(function () {
			oBinding.invoke();
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
[{}, undefined].forEach(function (vParam) {
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

		assert.strictEqual(oBinding.oElementContext, undefined);
		assert.strictEqual(oBinding.oOperation, undefined);
		assert.strictEqual(oBinding.oParameterContext, undefined);
		assert.strictEqual(oBinding.mParameters, undefined);
		assert.strictEqual(oBinding.mQueryOptions, undefined);
		assert.strictEqual(oBinding.oReturnValueContext, undefined);
	});

	//*********************************************************************************************
// undefined -> the reinsertion callback is not called because the binding already has another cache
[undefined, false, true].forEach(function (bSuccess) {
	QUnit.test("delete: empty path, deleteFromCache, success=" + bSuccess, function (assert) {
		var oBinding = this.bindContext(""),
			oBindingMock = this.mock(oBinding),
			oContext = {},
			oExpectation,
			oParentContext = Context.create(this.oModel, null, "/SalesOrders('42')"),
			oParent = {
				_fireChange : function () {},
				oElementContext : oParentContext,
				invoke : {},
				getContext : function () {},
				isRelative : function () { return false; }
			},
			oPromise,
			fnUndelete = sinon.spy(),
			that = this;

		oBindingMock.expects("fetchCache"); // so that setContext does not stumble over the mocks
		oBinding.setContext(oParentContext);

		oBindingMock.expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oBinding.oElementContext)).returns(oParentContext);
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});
		oExpectation = this.mock(oParentContext).expects("doDelete")
			.withExactArgs("~oGroupLock~", "SalesOrders('42')", "", null,
				sinon.match.same(oBinding), sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve().then(function () {
				if (bSuccess) {
					that.mock(oParentContext).expects("destroy").withExactArgs();
				} else {
					oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Add});
					throw "~Error~";
				}
			})));
		this.mock(oParentContext).expects("getBinding").withExactArgs().returns(oParent);

		// code under test
		oPromise = oBinding.delete("~oGroupLock~", "SalesOrders('42')", oContext, "~oETagEntity~",
			"~bDoNotRequestCount~", fnUndelete);

		assert.strictEqual(oParent.oElementContext, null);
		assert.ok(oContext.oDeletePromise.isPending());

		oParentContext.oDeletePromise = "~oDeletePromise~";

		// code under test
		oExpectation.args[0][5](undefined, -1);

		assert.strictEqual(oParentContext.oDeletePromise, "~oDeletePromise~");
		assert.notOk(fnUndelete.called);
		assert.ok(oContext.oDeletePromise.isPending());

		if (bSuccess === false) {
			// code under test
			oExpectation.args[0][5](undefined, 1);

			assert.strictEqual(oParentContext.oDeletePromise, null);
			sinon.assert.calledOnceWithExactly(fnUndelete);
		}

		return oPromise.then(function () {
			assert.ok(bSuccess);
			assert.ok(oContext.oDeletePromise.isFulfilled());
		}, function (oError) {
			assert.notOk(bSuccess);
			assert.strictEqual(oError, "~Error~");
			assert.strictEqual(oParent.oElementContext, oParentContext);
			assert.strictEqual(oParentContext.oDeletePromise, null);
			assert.strictEqual(fnUndelete.callCount, bSuccess === undefined ? 1 : 2);
			sinon.assert.alwaysCalledWithExactly(fnUndelete);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("delete: empty path, ODLB - delegate to ODLB", function (assert) {
		var oBinding = this.bindContext(""),
			oContext = {
				getValue : function () {}
			},
			oExpectation,
			oParentBinding = {
				delete : function () {},
				getContext : function () {}
				// no #invoke
			},
			oPromise,
			oRowContext = Context.create(this.oModel, null, "/SalesOrders('42')"),
			fnUndelete = sinon.spy();

		this.mock(oBinding).expects("fetchCache");
		oBinding.setContext(oRowContext);

		this.mock(oBinding).expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oBinding.oElementContext))
			.returns(oRowContext);
		this.mock(oRowContext).expects("getBinding").withExactArgs().returns(oParentBinding);
		this.mock(oContext).expects("getValue").withExactArgs().returns("~oETagEntity~");
		oExpectation = this.mock(oParentBinding).expects("delete")
			.withExactArgs("~oGroupLock~", "SalesOrders('42')", sinon.match.same(oRowContext),
				"~oETagEntity~", "~bDoNotRequestCount~", sinon.match.func)
			.returns(SyncPromise.resolve(Promise.resolve("~oResult~")));

		// code under test
		oPromise = oBinding.delete("~oGroupLock~", "SalesOrders('42')", oContext, "~oETagEntity~",
				"~bDoNotRequestCount~", fnUndelete
			).then(function (oDeleteResult) {
				assert.strictEqual(oDeleteResult, "~oResult~");

				assert.ok(oContext.oDeletePromise.isFulfilled());
				oRowContext.oDeletePromise = "~oDeletePromise";

				// code under test - callback
				oExpectation.args[0][5]();

				sinon.assert.calledOnceWithExactly(fnUndelete);
				assert.strictEqual(oRowContext.oDeletePromise, null);
			});

		assert.ok(oContext.oDeletePromise.isPending());

		return oPromise;
	});

	//*********************************************************************************************
[
	{success : true},
	{success : false},
	{success : false, newContext : false},
	{success : false, newContext : true}
].forEach(function (oFixture, i) {
	QUnit.test("delete: empty path, base context #" + i, function (assert) {
		var oContext = this.oModel.createBindingContext("/SalesOrders('42')"),
			oBinding = this.bindContext("", oContext),
			oBindingMock = this.mock(oBinding),
			oElementContext = oBinding.oElementContext,
			oNewContext,
			oPromise,
			that = this;

		oBindingMock.expects("_findEmptyPathParentContext")
			.withExactArgs(sinon.match.same(oElementContext))
			.returns(oElementContext);
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove});
		this.mock(oElementContext).expects("doDelete")
			.withExactArgs("~oGroupLock~", "SalesOrders('42')", "", null,
				sinon.match.same(oBinding), sinon.match.func)
			.returns(Promise.resolve().then(function () {
				if (oFixture.success) {
					that.mock(oElementContext).expects("destroy").withExactArgs();
				} else {
					oBindingMock.expects("_fireChange").exactly(("newContext" in oFixture) ? 0 : 1)
						.withExactArgs({reason : ChangeReason.Add});
					throw "~Error~";
				}
			}));

		// code under test
		oPromise = oBinding.delete("~oGroupLock~", "SalesOrders('42')", {/*_oContext*/},
			{/*_oETagEntity*/}, "~bDoNotRequestCount~", function () {});

		assert.strictEqual(oBinding.oElementContext, null);
		if ("newContext" in oFixture) {
			oBindingMock.expects("_fireChange")
				.withExactArgs({reason : ChangeReason.Context});
			oBinding.setContext(oFixture.newContext
				? this.oModel.createBindingContext("/SalesOrders('43')")
				: null);
			oNewContext = oBinding.oElementContext;
		} else {
			oNewContext = oElementContext;
		}

		return oPromise.then(function () {
			assert.ok(oFixture.success);
		}, function (oError) {
			assert.notOk(oFixture.success);
			assert.strictEqual(oError, "~Error~");
			assert.strictEqual(oBinding.oElementContext, oNewContext);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSuccess) {
	[null, {destroy : function () {}}].forEach(function (oReturnValueContext) {
		var sTitle = "delete, refreshInternal: success=" + bSuccess + ", RVC="
			+ !!oReturnValueContext;

		QUnit.test(sTitle, function (assert) {
			var oBinding = this.bindContext("/EMPLOYEES('42')"),
				oBindingMock = this.mock(oBinding),
				oElementContext = oBinding.getBoundContext(),
				that = this;

			oBinding.oReturnValueContext = oReturnValueContext;
			this.mock(oBinding).expects("_findEmptyPathParentContext")
				.withExactArgs(sinon.match.same(oBinding.oElementContext))
				.returns(oBinding.oElementContext);
			oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Remove})
				.callsFake(function () {
					assert.strictEqual(oBinding.oElementContext, null);
					assert.strictEqual(oBinding.oReturnValueContext, null);
					oBinding.setContext(null);
				});
			this.mock(oElementContext).expects("doDelete")
				.withExactArgs("myGroup", "EMPLOYEES('42')", "", null,
					sinon.match.same(oBinding), sinon.match.func)
				.returns(Promise.resolve().then(function () {
					if (bSuccess) {
						that.mock(oElementContext).expects("destroy").withExactArgs();
						if (oReturnValueContext) {
							that.mock(oReturnValueContext).expects("destroy").withExactArgs();
						}
					} else {
						oBindingMock.expects("_fireChange")
							.withExactArgs({reason : ChangeReason.Add})
							.callsFake(function () {
								assert.strictEqual(oBinding.oElementContext, oElementContext);
								if (oReturnValueContext) {
									assert.strictEqual(oBinding.oReturnValueContext,
										oReturnValueContext);
								}
							});
						throw "~Error~";
					}
				}));

			// code under test
			return oBinding.delete("myGroup", "EMPLOYEES('42')", {/*oContext*/},
				/*oETagEntity*/null, /*bDoNotRequestCount*/false, /*fnUndelete*/function () {}
			).then(function () {
				assert.ok(bSuccess);

				that.mock(oBinding).expects("createRefreshPromise").never();
				oBinding.attachChange(function (oEvent) {
					var oElementContext = oBinding.getBoundContext();

					assert.strictEqual(oEvent.getParameter("reason"), ChangeReason.Refresh);
					assert.strictEqual(oElementContext.getBinding(), oBinding);
					assert.strictEqual(oElementContext.getModelIndex(), undefined);
					assert.strictEqual(oElementContext.getModel(), this.oModel);
					assert.strictEqual(oElementContext.getPath(), "/EMPLOYEES('42')");
				});

				// code under test
				return oBinding.refreshInternal("", undefined, true);
			}, function (oError) {
				assert.notOk(bSuccess);
				assert.strictEqual(oError, "~Error~");
			});
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bHasChangeListeners) {
	[false, true].forEach(function (bKeepCacheOnError) {
		var sTitle = "refreshInternal: bHasChangeListeners=" + bHasChangeListeners
				+ ", bKeepCacheOnError=" + bKeepCacheOnError;

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataContextBinding.prototype),
			oContext = Context.createNewContext(this.oModel, {}, "/EMPLOYEE('42')"),
			bCheckUpdate = {/*true or false*/},
			bDependentsRefreshed = false,
			oDependentsPromise = new SyncPromise(function (resolve) {
				setTimeout(function () {
					bDependentsRefreshed = true;
					resolve();
				});
			}),
			fnFetchCache,
			oGroupLock = {},
			fnHasChangeListeners,
			sPath = {/*EMPLOYEES('42')*/},
			oRefreshResult;

		oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {foo : "bar"});

		oBinding.bHasFetchedExpandSelectProperties = true;
		this.mock(oBinding).expects("isRootBindingSuspended").withExactArgs().returns(false);
		this.mock(oBinding).expects("getGroupId").never();
		this.mock(oBinding).expects("setResumeChangeReason").never();
		fnHasChangeListeners = this.mock(oBinding.oCache).expects("hasChangeListeners")
			.withExactArgs().returns(bHasChangeListeners);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("myGroup", false)
			.returns(oGroupLock);
		this.mock(oBinding).expects("removeCachesAndMessages")
			.withExactArgs(sinon.match.same(sPath));
		fnFetchCache = oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, false,
				bKeepCacheOnError ? "myGroup" : undefined);
		this.mock(oBinding).expects("createRefreshPromise").exactly(bHasChangeListeners ? 1 : 0)
			.withExactArgs(bKeepCacheOnError).callThrough();
		this.mock(oBinding).expects("refreshDependentBindings")
			.withExactArgs(sinon.match.same(sPath), "myGroup", sinon.match.same(bCheckUpdate),
				bKeepCacheOnError)
			.returns(oDependentsPromise);

		// code under test
		oRefreshResult = oBinding.refreshInternal(sPath, "myGroup", bCheckUpdate, bKeepCacheOnError)
			.then(function () {
				assert.strictEqual(bDependentsRefreshed, true);
			});

		assert.strictEqual(oBinding.bHasFetchedExpandSelectProperties, false);
		sinon.assert.callOrder(fnHasChangeListeners, fnFetchCache);
		if (bHasChangeListeners) { // simulate fetchValue invoked by a property binding
			oBinding.resolveRefreshPromise(Promise.resolve());
		}
		return oRefreshResult;
	});
	});
});

	//*********************************************************************************************
	QUnit.test("refreshInternal: suspended", function (assert) {
		var oBinding,
			oBindingMock = this.mock(ODataContextBinding.prototype),
			oContext = Context.createNewContext(this.oModel, {}, "/EMPLOYEES('42')"),
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

		oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {foo : "bar"});

		oBinding.bHasFetchedExpandSelectProperties = true;
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
			.then(function () {
				assert.strictEqual(bDependentsRefreshed, true);
				assert.strictEqual(oBinding.bHasFetchedExpandSelectProperties, false);
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
		var oContext = bRelative
				? Context.createNewContext(this.oModel, {}, "/EMPLOYEES('42')")
				: undefined,
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
			fnReporter = sinon.spy(),
			that = this;

		oBindingMock.expects("isRootBindingSuspended").returns(false);
		oBindingMock.expects("isRoot").returns(false);
		oBindingMock.expects("createReadGroupLock").withExactArgs("myGroup", false);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, false,
				bKeepCacheOnError ? "myGroup" : undefined)
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oCache).expects("hasChangeListeners").withExactArgs().returns(true);
		oBindingMock.expects("createRefreshPromise").withExactArgs(bKeepCacheOnError).callThrough();
		oBindingMock.expects("fetchValue").withExactArgs("").callsFake(function () {
			oBinding.resolveRefreshPromise(oReadPromise);
			return SyncPromise.resolve(oReadPromise);
		});
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(fnReporter);
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise
					= Promise.resolve(bRelative ? oCache.getResourcePath() : "n/a");

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
				sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
			});
	});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bKeepCacheOnError) {
	var sTitle = "refreshInternal: bCheckUpdate=true, bKeepCacheOnError=" + bKeepCacheOnError;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.createNewContext(this.oModel, {}, "/EMPLOYEES('42')"),
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
			.withExactArgs(sinon.match.same(oContext), false, false,
				bKeepCacheOnError ? "myGroup" : undefined)
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oCache).expects("hasChangeListeners").withExactArgs().returns(true);
		oBindingMock.expects("createRefreshPromise").withExactArgs(bKeepCacheOnError).callThrough();
		oBindingMock.expects("fetchValue").never();
		oReadPromise.catch(function () {
			var iCallCount = bKeepCacheOnError ? 1 : 0,
				oResourcePathPromise = Promise.resolve(oCache.getResourcePath());

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
		var oContext = Context.createNewContext(this.oModel, {}, "/EMPLOYEES('42')"),
			oBinding = this.bindContext("EMPLOYEE_2_TEAM", oContext, {$$ownRequest : true}),
			oBindingMock = this.mock(oBinding),
			oError = new Error(),
			bIsRoot = "false,true",
			oNewCache = {
				hasChangeListeners : function () {}
			},
			oOldCache = oBinding.oCachePromise.getResult(),
			oReadPromise = Promise.reject(oError),
			fnReporter = sinon.spy(),
			oYetAnotherError = new Error(),
			that = this;

		oBindingMock.expects("isRootBindingSuspended").returns(false);
		oBindingMock.expects("isRoot").returns(bIsRoot);
		oBindingMock.expects("createReadGroupLock").withExactArgs("myGroup", bIsRoot);
		oBindingMock.expects("removeCachesAndMessages").withExactArgs("path");
		oBindingMock.expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext), false, false, "myGroup")
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oOldCache).expects("hasChangeListeners").withExactArgs().returns(true);
		oBindingMock.expects("createRefreshPromise").withExactArgs(true).callThrough();
		oBindingMock.expects("fetchValue").withExactArgs("").callsFake(function () {
			oBinding.resolveRefreshPromise(oReadPromise);
			return SyncPromise.resolve(oReadPromise);
		});
		this.mock(this.oModel).expects("getReporter").withExactArgs().returns(fnReporter);
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
				sinon.assert.calledOnceWithExactly(fnReporter, sinon.match.same(oError));
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
		oBindingMock.expects("fetchCache")
			.withExactArgs(undefined, false, false, "myGroup")
			.callsFake(function () {
				oBinding.oCache = oNewCache;
				oBinding.oCachePromise = SyncPromise.resolve(oNewCache);
			});
		this.mock(oOldCache).expects("hasChangeListeners").withExactArgs().returns(true);
		oBindingMock.expects("createRefreshPromise").withExactArgs(true).returns(oRefreshPromise);
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
				bInvoked = false,
				oInvokePromise = new Promise(function (resolve) {
					setTimeout(function () {
						bInvoked = true;
						resolve({/*oReturnValueContext*/});
					});
				}),
				oGroupLock = {},
				oPromise;

			oBinding.oCachePromise = SyncPromise.resolve({});
			oBinding.oOperation.bAction = bAction;
			oBinding.oOperation.mRefreshParameters = {};

			this.mock(oBinding).expects("createReadGroupLock").exactly(bAction === false ? 1 : 0)
				.withExactArgs("myGroup", true)
				.callsFake(function () {
					oBinding.oReadGroupLock = oGroupLock;
				});
			this.mock(oBinding).expects("getDependentBindings").never();
			this.mock(oBinding).expects("_invoke").exactly(bAction === false ? 1 : 0)
				.withExactArgs(sinon.match.same(oGroupLock),
					sinon.match.same(oBinding.oOperation.mRefreshParameters))
				.returns(oInvokePromise);

			// code under test
			oPromise = oBinding.refreshInternal("", "myGroup");

			assert.strictEqual(oBinding.oReadGroupLock, undefined);

			return oPromise.then(function () {
				assert.strictEqual(bInvoked, bAction === false);
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("refreshInternal: no cache", function () {
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
			assert.ok(fnOnRefresh.calledOnce);
		});
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsFromParameters: no $$inheritExpandSelect", function (assert) {
		var oBinding = this.bindContext("foo");

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsFromParameters(), {});

		oBinding = this.bindContext("foo", undefined, {$expand : "bar"});

		// code under test
		assert.deepEqual(oBinding.getQueryOptionsFromParameters(), {$expand : {bar : {}}});
	});

	//*********************************************************************************************
[
	{
		own : {foo : "bar"}, // some custom query option which have to survive always
		inherited : {$select : ["prop"], $expand : {Nav : {}}},
		expected : {foo : "bar", $select : ["prop"], $expand : {Nav : {}}}
	}, {
		own : {foo : "bar", $select : []},
		inherited : {$select : ["prop"]},
		expected : {foo : "bar", $select : ["prop"]}
	}, {
		own : {foo : "bar"},
		inherited : {$expand : {Nav : {}}},
		expected : {foo : "bar", $expand : {Nav : {}}}
	}, {
		own : {foo : "bar", $select : ["own", "both"]},
		inherited : {$select : ["inh", "both"]},
		expected : {foo : "bar", $select : ["own", "both", "inh"]}
	}
].forEach(function (oFixture, i) {
	QUnit.test("getQueryOptionsFromParameters: $$inheritExpandSelect #" + i, function (assert) {
		var oParentBinding = {
				getInheritableQueryOptions : function () {}
			},
			oContext = Context.create(this.oModel, oParentBinding, "/SalesOrderList('4711')"),
			oBinding = this.bindContext("bound.Operation(...)", oContext,
				Object.assign(oFixture.own, {$$inheritExpandSelect : true})),
			sInheritedQueryOptionsBefore = JSON.stringify(oFixture.inherited),
			sOwnQueryOptionsBefore = JSON.stringify(oBinding.mQueryOptions),
			mQueryOptions;

		this.mock(oParentBinding).expects("getInheritableQueryOptions").withExactArgs()
			.returns(oFixture.inherited);
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oBinding.mQueryOptions))
			.callThrough();

		// code under test
		mQueryOptions = oBinding.getQueryOptionsFromParameters();

		assert.deepEqual(mQueryOptions, oFixture.expected);
		// ensure that $select is before $expand, too
		assert.deepEqual(JSON.stringify(mQueryOptions), JSON.stringify(oFixture.expected));
		// own query options are still the same
		assert.deepEqual(JSON.stringify(oBinding.mQueryOptions), sOwnQueryOptionsBefore);
		// inherited query options are still the same
		assert.deepEqual(JSON.stringify(oFixture.inherited), sInheritedQueryOptionsBefore);
	});
});

	//*********************************************************************************************
	QUnit.test("doFetchOrGetQueryOptions", function (assert) {
		var oBinding = this.bindContext("foo"),
			oContext = {},
			oPromise = {};

		this.mock(oBinding).expects("fetchResolvedQueryOptions")
			.withExactArgs(sinon.match.same(oContext))
			.returns(oPromise);

		// code under test
		assert.strictEqual(oBinding.doFetchOrGetQueryOptions(oContext), oPromise);
	});

	//*********************************************************************************************
	QUnit.test("doCreateCache, ", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('1')"),
			oCache = {},
			sDeepResourcePath = "deep/resource/path";

		this.oModel.bAutoExpandSelect = "~bAutoExpandSelect~";
		this.oModel.bSharedRequests = "~bSharedRequests~";

		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "EMPLOYEES('1')",
				"~mCacheQueryOptions~", "~bAutoExpandSelect~", "~bSharedRequests~",
				sDeepResourcePath)
			.returns(oCache);

		// code under test
		assert.strictEqual(
			oBinding.doCreateCache("EMPLOYEES('1')", "~mCacheQueryOptions~", undefined,
				sDeepResourcePath),
			oCache);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: binding has sResumeChangeReason", function (assert) {
		var bCheckUpdate = {/* true or false */},
			oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("TEAM_2_EMPLOYEE", oContext),
			oDependent0 = {resumeInternal : function () {}},
			oDependent1 = {resumeInternal : function () {}},
			oFetchCacheExpectation,
			oFireChangeExpectation,
			sResumeChangeReason = {/*change or refresh*/},
			oResumeInternalExpectation0,
			oResumeInternalExpectation1;

		oBinding.sResumeChangeReason = sResumeChangeReason;
		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		oFetchCacheExpectation = this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			// check correct sequence: on fetchCache call, aggregated query options must be reset
			.callsFake(function () {
				assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
				assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
				assert.deepEqual(oBinding.mCanUseCachePromiseByChildPath, {});
			});
		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oDependent0, oDependent1]);
		oResumeInternalExpectation0 = this.mock(oDependent0).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate), true);
		oResumeInternalExpectation1 = this.mock(oDependent1).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate), true);
		oFireChangeExpectation = this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : sinon.match.same(sResumeChangeReason)});
		oBinding.mAggregatedQueryOptions = {$select : ["Team_Id"]};
		oBinding.bAggregatedQueryOptionsInitial = false;
		oBinding.mCanUseCachePromiseByChildPath = "~mCanUseCachePromiseByChildPath~";

		// code under test
		oBinding.resumeInternal(bCheckUpdate);

		assert.ok(oResumeInternalExpectation0.calledAfter(oFetchCacheExpectation));
		assert.ok(oResumeInternalExpectation1.calledAfter(oFetchCacheExpectation));
		assert.ok(oFireChangeExpectation.calledAfter(oResumeInternalExpectation1));
		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: binding has no sResumeChangeReason", function () {
		var bCheckUpdate = {/* true or false */},
			oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("TEAM_2_EMPLOYEE", oContext),
			oDependent0 = {resumeInternal : function () {}},
			oDependent1 = {resumeInternal : function () {}};

		oBinding.sResumeChangeReason = undefined;

		this.mock(oBinding).expects("removeCachesAndMessages").never();
		this.mock(oBinding).expects("fetchCache").never();
		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns([oDependent0, oDependent1]);
		this.mock(oDependent0).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate), false);
		this.mock(oDependent1).expects("resumeInternal")
			.withExactArgs(sinon.match.same(bCheckUpdate), false);
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		oBinding.resumeInternal(bCheckUpdate);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: binding has no sResumeChangeReason but parent has",
			function (assert) {
		var bCheckUpdate = {/* true or false */},
			oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("TEAM_2_EMPLOYEE", oContext);

		oBinding.sResumeChangeReason = undefined;

		this.mock(oBinding).expects("removeCachesAndMessages").withExactArgs("");
		this.mock(oBinding).expects("fetchCache")
			.withExactArgs(sinon.match.same(oContext))
			// check correct sequence: on fetchCache call, aggregated query options must be reset
			.callsFake(function () {
				assert.deepEqual(oBinding.mAggregatedQueryOptions, {});
				assert.strictEqual(oBinding.bAggregatedQueryOptionsInitial, true);
			});
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		oBinding.resumeInternal(bCheckUpdate, true);
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: suspend in change event of resume", function (assert) {
		var oBinding = this.bindContext("/TEAMS('42')", undefined);

		oBinding.sResumeChangeReason = ChangeReason.Change;
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change})
			.callsFake(function () {
				// simulate a suspend and a refresh
				oBinding.sResumeChangeReason = ChangeReason.Refresh;
			});

		// code under test
		oBinding.resumeInternal(true);

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Refresh);
	});

	//*********************************************************************************************
	[undefined, false, true].forEach(function (bAction) {
		QUnit.test("resumeInternal: operation binding, bAction=" + bAction, function () {
			var bCheckUpdate = {},
				oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
				oBinding = this.bindContext("name.space.Operation(...)", oContext),
				oBindingMock = this.mock(oBinding),
				oDependent0 = {resumeInternal : function () {}},
				oDependent1 = {resumeInternal : function () {}};

			oBinding.oOperation.bAction = bAction;

			oBindingMock.expects("fetchCache").never();
			this.mock(oBinding).expects("getDependentBindings")
				.withExactArgs()
				.returns([oDependent0, oDependent1]);
			this.mock(oDependent0).expects("resumeInternal")
				.withExactArgs(sinon.match.same(bCheckUpdate), false);
			this.mock(oDependent1).expects("resumeInternal")
				.withExactArgs(sinon.match.same(bCheckUpdate), false);
			oBindingMock.expects("_fireChange").never();
			oBindingMock.expects("invoke").never();

			// code under test
			oBinding.resumeInternal(bCheckUpdate);
		});
	});

	//*********************************************************************************************
	QUnit.test("resumeInternal: initial binding", function (assert) {
		var oBinding = this.bindContext("/EMPLOYEES('42')"),
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_fireChange").never();

		// code under test
		oBinding.suspend();

		assert.strictEqual(oBinding.sResumeChangeReason, ChangeReason.Change);
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		oBinding.resumeInternal();

		assert.strictEqual(oBinding.sResumeChangeReason, undefined);
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
	[
		"name.space.Operation(...)", // operation binding must have a context
		"/name.space.Operation(...)" // operation binding must be relative
	].forEach(function (sPath, i) {
		var sTitle = "isReturnValueLikeBindingParameter returns false due to ..., " + i;

		QUnit.test(sTitle, function (assert) {
			// code under test
			assert.notOk(this.bindContext(sPath).isReturnValueLikeBindingParameter());
		});
	});

	//*********************************************************************************************
	QUnit.test("isReturnValueLikeBindingParameter: NavigationProperty, $isCollection",
			function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("ToTwin(...)", oContext),
			oOperationMetadata = {
				$kind : "NavigationProperty",
				$isCollection : true
			};

		// code under test
		assert.notOk(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
	});

	//*********************************************************************************************
	QUnit.test("isReturnValueLikeBindingParameter: NavigationProperty, too many segments #1",
			function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("ToHere/ToThere(...)", oContext),
			oOperationMetadata = {
				$kind : "NavigationProperty"
			};

		this.mock(this.oModel.getMetaModel()).expects("getObject").never();

		// code under test
		assert.notOk(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
	});

	//*********************************************************************************************
	QUnit.test("isReturnValueLikeBindingParameter: NavigationProperty, too many segments #2",
			function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')/TEAM_2_EMPLOYEES"),
			oBinding = this.bindContext("ToTwin(...)", oContext),
			oOperationMetadata = {
				$kind : "NavigationProperty"
			};

		this.mock(this.oModel.getMetaModel()).expects("getObject").never();

		// code under test
		assert.notOk(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
	});
	// Note: bReplaceWithRVC invokes #checkKeepAlive which requires a "row context", thus
	// this.sPath = "(...)" cannot work; also v4.ODataModel#resolve would add a slash in between!

	//*********************************************************************************************
[{
	oParentMetaData : {
		$kind : "EntitySet",
		$NavigationPropertyBinding : {
			ToTwin : "TEAMS"
		},
		$Type : "wrong.Type"
	},
	sTitle : "wrong $Type"
}, {
	oParentMetaData : {
		$kind : "EntitySet",
		$Type : "some.Type"
	},
	sTitle : "no $NavigationPropertyBinding map"
}, {
	oParentMetaData : {
		$kind : "EntitySet",
		$NavigationPropertyBinding : {},
		$Type : "some.Type"
	},
	sTitle : "no $NavigationPropertyBinding entry"
}, {
	oParentMetaData : {
		$kind : "Singleton", // Note: sure, "/TEAMS('42')" is unrealistic in this case - simplicity!
		$NavigationPropertyBinding : {
			ToTwin : "TEAMS"
		},
		$Type : "some.Type"
	},
	sTitle : "Singleton"
}].forEach(function (oFixture) {
	var sTitle = "isReturnValueLikeBindingParameter: NavigationProperty, " + oFixture.sTitle;

	QUnit.test(sTitle, function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("ToTwin(...)", oContext),
			oOperationMetadata = {
				$kind : "NavigationProperty",
				$Type : "some.Type"
			};

		this.mock(this.oModel.getMetaModel()).expects("getObject").withExactArgs("/TEAMS")
			.returns(oFixture.oParentMetaData);

		// code under test
		assert.notOk(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
	});
});

	//*********************************************************************************************
	QUnit.test("isReturnValueLikeBindingParameter: NavigationProperty, OK", function (assert) {
		var oContext = Context.create(this.oModel, {}, "/TEAMS('42')"),
			oBinding = this.bindContext("ToTwin(...)", oContext),
			oOperationMetadata = {
				$kind : "NavigationProperty",
				$Type : "some.Type"
			};

		this.mock(this.oModel.getMetaModel()).expects("getObject").withExactArgs("/TEAMS")
			.returns({
				$kind : "EntitySet",
				$NavigationPropertyBinding : {
					ToTwin : "TEAMS"
				},
				$Type : "some.Type"
			});

		// code under test
		assert.ok(oBinding.isReturnValueLikeBindingParameter(oOperationMetadata));
	});

	//*********************************************************************************************
	[{
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')",
		contextMetaPath : "/TEAMS",
		$kind : "EntitySet",
		result : true
	}, { // operation binding's context must not address entity via navigation property
		additionalQueryOptionsForRVC : false,
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')/TEAM_2_MANAGER",
		result : false
	}, { // operation binding's context must address entity via navigation property
		additionalQueryOptionsForRVC : true,
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')/TEAM_2_MANAGER",
		result : true
	}, { // operation binding's context could address entity via navigation property
		additionalQueryOptionsForRVC : undefined,
		binding : "name.space.Operation(...)",
		context : "/TEAMS('42')/TEAM_2_MANAGER",
		result : true
	}, { // operation binding's context must not address a function import's return value
		binding : "name.space.Operation(...)",
		context : "/FunctionImport()",
		contextMetaPath : "/FunctionImport",
		$kind : "Function",
		result : false
	}].forEach(function (oFixture, i) {
		QUnit.test("hasReturnValueContext for context and binding path, " + i, function (assert) {
			var oContext = oFixture.context && Context.create(this.oModel, {}, oFixture.context),
				oBinding = this.bindContext(oFixture.binding, oContext);

			oBinding.oOperation.bAdditionalQueryOptionsForRVC
				= oFixture.additionalQueryOptionsForRVC;
			this.mock(oBinding).expects("isReturnValueLikeBindingParameter").never();
			if (oFixture.contextMetaPath) {
				this.mock(this.oModel.oMetaModel).expects("getObject")
					.withExactArgs(oFixture.contextMetaPath)
					.returns({$kind : oFixture.$kind});
			}

			// code under test
			assert.strictEqual(!!oBinding.hasReturnValueContext(), oFixture.result);
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
				$ReturnType : {
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

		// preparation - setting parameter
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

		this.mock(oBinding).expects("checkSuspended").withExactArgs(true);
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
		QUnit.test("getResolvedPathWithReplacedTransientPredicates: " + i, function (assert) {
			var oContext = Context.create(this.oModel, {}, "/TEAMS"),
				oContextMock = this.mock(oContext),
				oBinding = this.bindContext("foo", oContext),
				oHelperMock = this.mock(_Helper);

			this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(oFixture.sPath);

			if (oFixture.aFetchValues) {
				oFixture.aFetchValues.forEach(function (oFetchValue) {
					oContextMock.expects("getValue").withExactArgs(oFetchValue.sPath)
						.returns(oFetchValue.oEntity);
					oHelperMock.expects("getPrivateAnnotation")
						.withExactArgs(sinon.match.same(oFetchValue.oEntity), "predicate")
						.returns(oFetchValue.sPredicate);
				});
			}

			// code under test
			assert.strictEqual(oBinding.getResolvedPathWithReplacedTransientPredicates(),
				oFixture.sResult);
		});
	});

	//*********************************************************************************************
[{}, undefined].forEach(function (oEntity, i) {
	QUnit.test("getResolvedPathWithReplacedTransientPredicates error: no key predicates " + i,
			function (assert) {
		var sPath = "/TEAMS($uid=id-1-23)",
			oContext = Context.create(this.oModel, {}, sPath),
			oBinding = this.bindContext("", oContext);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(sPath);
		this.mock(oContext).expects("getValue").withExactArgs(sPath).returns(oEntity);
		this.mock(_Helper).expects("getPrivateAnnotation").exactly(oEntity ? 1 : 0)
			.withExactArgs(sinon.match.same(oEntity), "predicate")
			.returns(undefined);

		// code under test
		assert.throws(function () {
			oBinding.getResolvedPathWithReplacedTransientPredicates();
		}, new Error("No key predicate known at " + sPath));
	});
});

	//*********************************************************************************************
	QUnit.test("computeOperationQueryOptions", function (assert) {
		var oBinding = this.bindContext("bound.Operation(...)"),
			mMergedQueryOptions = {},
			mQueryOptions = {};

		this.mock(oBinding).expects("getQueryOptionsFromParameters").withExactArgs()
			.returns(mQueryOptions);
		this.mock(Object).expects("assign")
			.withExactArgs({}, sinon.match.same(oBinding.oModel.mUriParameters),
				sinon.match.same(mQueryOptions))
			.returns(mMergedQueryOptions);

		// code under test
		assert.strictEqual(oBinding.computeOperationQueryOptions(), mMergedQueryOptions);
	});

	//*********************************************************************************************
[false, true].forEach(function (bWithLateQueryOptions) {
	var sTitle = "refreshReturnValueContext, with late query options = " + bWithLateQueryOptions;

	QUnit.test(sTitle, function (assert) {
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

		oBinding.mLateQueryOptions = bWithLateQueryOptions ? {} : undefined;
		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns(bWithLateQueryOptions ? "~operationQueryOptions~" : mQueryOptions);
		this.mock(_Helper).expects("clone").exactly(bWithLateQueryOptions ? 1 : 0)
			.withExactArgs("~operationQueryOptions~").returns(mQueryOptions);
		this.mock(_Helper).expects("aggregateExpandSelect")
			.exactly(bWithLateQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(mQueryOptions),
				sinon.match.same(oBinding.mLateQueryOptions));
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "SalesOrderList('77')",
				sinon.match.same(mQueryOptions), true,
				sinon.match.same(this.oModel.bSharedRequests))
			.returns(oCache);
		this.mock(oBinding).expects("createReadGroupLock")
			.withExactArgs("group", true);
		this.mock(oReturnValueContext).expects("refreshDependentBindings")
			.withExactArgs("", "group", true, undefined)
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

		return oRefreshPromise.then(function () {
			assert.strictEqual(bDependentsRefreshed, true);
		});
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bKeepCacheOnError) {
	[false, true].forEach(function (bCheckFails) {
		var sTitle = "refreshReturnValueContext: keep cache on error: " + bKeepCacheOnError
				+ ", check fails: " + bCheckFails;

	QUnit.test(sTitle, function (assert) {
		var oBinding = this.bindContext("bound.Operation(...)",
				Context.create(this.oModel, {}, "/SalesOrderList('42')")),
			oCheckError = new Error("checkUpdateInternal intentionally failed"),
			oError = new Error("This call intentionally failed"),
			oNewCache = {},
			oOldCache = {
				setActive : mustBeMocked
			},
			oReturnValueContext = Context.create(this.oModel, oBinding, "/SalesOrderList('77')"),
			that = this;

		oBinding.oCache = oOldCache;
		oBinding.oCachePromise = SyncPromise.resolve(oOldCache);
		oBinding.mCacheQueryOptions = "~mCacheQueryOptions~";
		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding).expects("computeOperationQueryOptions").withExactArgs()
			.returns("~mQueryOptions~");
		this.mock(_Helper).expects("aggregateExpandSelect").never();
		this.mock(_Cache).expects("createSingle")
			.withExactArgs(sinon.match.same(this.oModel.oRequestor), "SalesOrderList('77')",
				"~mQueryOptions~", true, sinon.match.same(this.oModel.bSharedRequests))
			.returns(oNewCache);
		this.mock(oBinding).expects("createReadGroupLock").withExactArgs("group", true);
		this.mock(oReturnValueContext).expects("refreshDependentBindings")
			.withExactArgs("", "group", true, bKeepCacheOnError).callsFake(function () {
				that.mock(oOldCache).expects("setActive").exactly(bKeepCacheOnError ? 1 : 0)
					.withExactArgs(true);
				that.mock(oReturnValueContext).expects("checkUpdateInternal")
					.exactly(bKeepCacheOnError ? 1 : 0).withExactArgs()
					.returns(bKeepCacheOnError && bCheckFails
						? SyncPromise.reject(oCheckError)
						: SyncPromise.resolve());
				return Promise.reject(oError);
			});

		// code under test
		return oBinding.refreshReturnValueContext(oReturnValueContext, "group", bKeepCacheOnError)
			.then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError0) {
				assert.strictEqual(oError0,
					bKeepCacheOnError && bCheckFails ? oCheckError : oError);
				assert.strictEqual(oBinding.oCache,
					bKeepCacheOnError ? oOldCache : oNewCache);
				assert.strictEqual(oBinding.oCachePromise.getResult(),
					bKeepCacheOnError ? oOldCache : oNewCache);
				assert.strictEqual(oBinding.mCacheQueryOptions,
					bKeepCacheOnError ? "~mCacheQueryOptions~" : "~mQueryOptions~");
			});
	});
	});
});

	//*********************************************************************************************
[0, 1, 2].forEach(function (iOperation) {
	[false, true].forEach(function (bWithContext) {
		[false, true].forEach(function (bRecursionRejects) {
			var sTitle = "requestSideEffects, with context: " + bWithContext
					+ "; recursion rejects: " + bRecursionRejects
					+ "; operation setup #" + iOperation;

			QUnit.test(sTitle, function (assert) {
				// Note: w/o a context, the binding would be relative in real life
				var oBinding = this.bindContext("/Me/name.space.Operation(...)"),
					oCache = {
						requestSideEffects : function () {}
					},
					oCanceledError = new Error(),
					oContext = bWithContext
						? {getPath : function () {}}
						: undefined,
					oError = new Error(),
					sGroupId = "group",
					oGroupLock = {},
					oModelMock = this.mock(this.oModel),
					aPaths = [],
					oPromise = Promise.resolve({/*the updated data*/}),
					oResult,
					that = this;

				function expectVisitEtc(aPromises) {
					that.mock(oBinding).expects("visitSideEffects")
						.withExactArgs(sGroupId, sinon.match.same(aPaths),
							sinon.match.same(oContext), aPromises)
						.callsFake(function (_sGroupId, _aPaths, _oContext, aPromises) {
							aPromises.push(Promise.resolve());
							aPromises.push(Promise.reject(oCanceledError));
							if (bRecursionRejects) {
								aPromises.push(Promise.reject(oError));
							}
						});
					that.mock(oBinding).expects("refreshDependentListBindingsWithoutCache")
						.exactly(bRecursionRejects ? 0 : 1).withExactArgs().resolves("~");
				}

				oCanceledError.canceled = true;
				oBinding.oCache = oCache; // simulate invoke
				switch (iOperation) {
					case 0:
						oBinding.oOperation = null;
						break;

					case 1:
						oBinding.oReturnValueContext = "~truthy~";
						break;

					default:
						// oOperation, but no oReturnValueContext
				}
				this.mock(oBinding).expects("lockGroup").exactly(iOperation < 2 ? 1 : 0)
					.withExactArgs(sGroupId).returns(oGroupLock);
				if (bWithContext) {
					this.mock(oContext).expects("getPath").exactly(iOperation < 2 ? 1 : 0)
						.withExactArgs().returns("/Me");
				}
				this.mock(oCache).expects("requestSideEffects").exactly(iOperation < 2 ? 1 : 0)
					.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths),
						bWithContext ? "Me" : undefined)
					.callsFake(function () {
						expectVisitEtc([oPromise]);

						return oPromise;
					});
				if (iOperation >= 2) {
					expectVisitEtc([]);
				}
				oModelMock.expects("reportError")
					.withExactArgs("Failed to request side effects", sClassName,
						sinon.match.same(oCanceledError));
				if (bRecursionRejects) {
					oModelMock.expects("reportError")
						.withExactArgs("Failed to request side effects", sClassName,
							sinon.match.same(oError));
				}

				// code under test
				oResult = oBinding.requestSideEffects(sGroupId, aPaths, oContext);

				assert.ok(oResult.isPending(), "instanceof SyncPromise");

				return oResult.then(function (vValue) {
						assert.notOk(bRecursionRejects);
						assert.strictEqual(vValue, "~",
							"refreshDependentListBindingsWithoutCache finished");
					}, function (oError0) {
						assert.ok(bRecursionRejects);
						assert.strictEqual(oError0, oError);
					});
			});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: no cache", function (assert) {
		var oBinding = this.bindContext("/Me");

		// @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
		// @throws {Error} - If this binding does not use own data service requests
		assert.throws(function () {
			// code under test
			oBinding.requestSideEffects("group", [], {/*oContext*/});
		}, TypeError);
	});

	//*********************************************************************************************
	QUnit.test("requestSideEffects: fails", function (assert) {
		var oBinding = this.bindContext("/Me/Friends('42')"),
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

		oBinding.oCache = oCache; // simulate invoke
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
		this.mock(oCache).expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), "Me")
			.rejects(oError);
		this.mock(this.oModel).expects("reportError")
			.withExactArgs("Failed to request side effects", sClassName, sinon.match.same(oError));

		// code under test
		return oBinding.requestSideEffects(sGroupId, aPaths, oContext).then(function () {
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

				oBinding.oCache = oCache; // simulate invoke
				oBinding.oReturnValueContext = "~truthy~";
				if (sPath === "") {
					this.mock(oCache).expects("requestSideEffects").never();
				} else {
					this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId)
						.returns(oGroupLock);
					this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
					this.mock(oCache).expects("requestSideEffects")
						.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), "Me")
						.throws(oError);
				}
				this.mock(oBinding).expects("refreshReturnValueContext")
					.withExactArgs(sinon.match.same(oContext), sGroupId, true)
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
					.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths),
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
	QUnit.test("requestSideEffects: do not stifle errors", function (assert) {
		var oBinding = this.bindContext("/Me"),
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

		oBinding.oCache = oCache; // simulate invoke
		this.mock(oBinding).expects("lockGroup").withExactArgs(sGroupId).returns(oGroupLock);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/Me");
		this.mock(oCache).expects("requestSideEffects")
			.withExactArgs(sinon.match.same(oGroupLock), sinon.match.same(aPaths), "Me")
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
[{
	bHasInitialSelect : true
}, {
	bHasInitialSelect : false
}].forEach(function (oFixture) {
	var sTitle = "addQueryOptionsForReturnValueContext: bHasInitialSelect = "
			+ oFixture.bHasInitialSelect;

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindContext("/Operation(...)");
		const oMetaModel = {getObject : mustBeMocked};
		const oMetaModelMock = this.mock(oMetaModel);
		this.mock(oBinding.oModel).expects("getMetaModel").returns(oMetaModel);
		this.mock(oBinding).expects("getResolvedPath").returns("~resolvedPath~");
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getMetaPath").withExactArgs("~resolvedPath~").returns("/a/b/c");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetaData")
			.returns(true);
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs()
			.returns(true);
		oMetaModelMock.expects("getObject")
			.withExactArgs("/a/$NavigationPropertyBinding/b")
			.returns("~EntitySet~");
		oMetaModelMock.expects("getObject")
			.withExactArgs("/a/b/$Partner")
			.returns("~Partner~");
		oMetaModelMock.expects("getObject").withExactArgs("/~EntitySet~/~Partner~/")
			.returns("~SelectForPartner~");
		const mAdditionalQueryOptions = {$expand : {"~Partner~" : {}}};
		oHelperMock.expects("selectKeyProperties")
			.withExactArgs(mAdditionalQueryOptions.$expand["~Partner~"], "~SelectForPartner~");
		oMetaModelMock.expects("getObject")
			.exactly(oFixture.bHasInitialSelect ? 1 : 0)
			.withExactArgs("/~EntitySet~/")
			.returns("~SelectForEntitySet~");
		oHelperMock.expects("selectKeyProperties")
			.exactly(oFixture.bHasInitialSelect ? 1 : 0)
			.withExactArgs(mAdditionalQueryOptions, "~SelectForEntitySet~");
		const mQueryOptions = oFixture.bHasInitialSelect ? {$select : ["~select~"]} : {};
		oHelperMock.expects("clone").withExactArgs(mQueryOptions).returns("~clonedQueryOptions~");
		oHelperMock.expects("aggregateExpandSelect")
			.withExactArgs("~clonedQueryOptions~", mAdditionalQueryOptions);

		// code under test
		assert.strictEqual(
			oBinding.addQueryOptionsForReturnValueContext("~oOperationMetaData", mQueryOptions),
			"~clonedQueryOptions~");

		assert.strictEqual(
			oBinding.oOperation.bAdditionalQueryOptionsForRVC, true);
	});
});

	//*********************************************************************************************
[{
	bHasPartner : true,
	bHasEntitySet : false
}, {
	bHasPartner : false,
	bHasEntitySet : true
}].forEach(function (oFixture) {
	var sTitle = "addQueryOptionsForReturnValueContext: bHasPartner = "
			+ oFixture.bHasPartner + " && bHasEntitySet = " + oFixture.bHasEntitySet;

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindContext("/Operation(...)");
		const oMetaModel = {getObject : mustBeMocked};
		this.mock(oBinding.oModel).expects("getMetaModel").returns(oMetaModel);
		this.mock(oBinding).expects("getResolvedPath").returns("~resolvedPath~");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("~resolvedPath~").returns("/a/b/c");
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs("~oOperationMetaData")
			.returns(true);
		this.mock(oBinding).expects("hasReturnValueContext")
			.withExactArgs()
			.returns(true);
		const oMetaModelMock = this.mock(oMetaModel);
		oMetaModelMock.expects("getObject")
			.withExactArgs("/a/$NavigationPropertyBinding/b")
			.returns(oFixture.bHasEntitySet ? "~EntitySet~" : undefined);
		oMetaModelMock.expects("getObject")
			.withExactArgs("/a/b/$Partner")
			.returns(oFixture.bHasPartner ? "~Partner~" : undefined);

		// code under test
		assert.strictEqual(
			oBinding.addQueryOptionsForReturnValueContext("~oOperationMetaData", "~mQueryOptions~"),
			"~mQueryOptions~");

		assert.strictEqual(
			oBinding.oOperation.bAdditionalQueryOptionsForRVC, false);
	});
});

	//*********************************************************************************************
[{
	bIsReturnValueLikeBindingParameter : false,
	sMetaPath : "/a/b/c"
}, {
	bIsReturnValueLikeBindingParameter : true,
	bHasReturnValueContext : false,
	sMetaPath : "/a/b/c"
}, {
	bIsReturnValueLikeBindingParameter : true,
	bHasReturnValueContext : true,
	sMetaPath : "/a/b"
}].forEach(function (oFixture) {
	var sTitle = "addQueryOptionsForReturnValueContext: " + JSON.stringify(oFixture);

	QUnit.test(sTitle, function (assert) {
		const oBinding = this.bindContext("/Operation(...)");
		this.mock(oBinding).expects("getResolvedPath").returns("~resolvedPath~");
		this.mock(_Helper).expects("getMetaPath").withExactArgs("~resolvedPath~")
			.returns(oFixture.sMetaPath);
		const oOperationsMetadata = {};
		this.mock(oBinding).expects("isReturnValueLikeBindingParameter")
			.withExactArgs(sinon.match.same(oOperationsMetadata))
			.returns(oFixture.bIsReturnValueLikeBindingParameter);
		this.mock(oBinding).expects("hasReturnValueContext")
			.exactly(oFixture.bIsReturnValueLikeBindingParameter ? 1 : 0)
			.withExactArgs()
			.returns(oFixture.bHasReturnValueContext);

		const mQueryOptions = {};
		// code under test
		assert.strictEqual(
			oBinding.addQueryOptionsForReturnValueContext(oOperationsMetadata, mQueryOptions),
			mQueryOptions);

		assert.strictEqual(
			oBinding.oOperation.bAdditionalQueryOptionsForRVC, false);
	});
});

	//*********************************************************************************************
[
	Context.create({/*oModel*/}, {/*oBinding*/}, "/SalesOrderList($uid=1)"),
	null
].forEach(function (oContext, i) {
	[undefined, {}].forEach(function (mCacheQueryOptions, j) {
	QUnit.test("adjustPredicate: " + i + ", " + j, function () {
		var oBinding = this.bindContext("SO_2_BP", oContext);

		oBinding.mCacheQueryOptions = mCacheQueryOptions;
		this.mock(asODataParentBinding.prototype).expects("adjustPredicate")
			.on(oBinding).withExactArgs("($uid=1)", "('42')");
		this.mock(oBinding).expects("fetchCache").exactly(mCacheQueryOptions ? 1 : 0)
			.withExactArgs(sinon.match.same(oContext), true);
		if (oContext) {
			this.mock(oBinding.oElementContext).expects("adjustPredicate")
				.withExactArgs("($uid=1)", "('42')");
		}

		// code under test
		oBinding.adjustPredicate("($uid=1)", "('42')");
	});
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
	QUnit.test("doDeregisterChangeListener: super", function () {
		const oBinding = this.bindContext("/EMPLOYEES('42')");

		this.mock(asODataParentBinding.prototype).expects("doDeregisterChangeListener")
			.on(oBinding).withExactArgs("/absolute/path", "~oListener~");

		// code under test
		oBinding.doDeregisterChangeListener("/absolute/path", "~oListener~");
	});

	//*********************************************************************************************
[undefined, "", "relative/path"].forEach(function (sRelativePath, i) {
	QUnit.test(`doDeregisterChangeListener: operation binding, ${sRelativePath}`, function () {
		const oBinding = this.bindContext("/Operation(...)");

		this.mock(_Helper).expects("getRelativePath")
			.withExactArgs("/absolute/path", "/Operation(...)/$Parameter")
			.returns(sRelativePath);
		this.mock(_Helper).expects("removeByPath").exactly(i ? 1 : 0)
			.withExactArgs(sinon.match.same(oBinding.oOperation.mChangeListeners), sRelativePath,
				"~oListener~");
		this.mock(asODataParentBinding.prototype).expects("doDeregisterChangeListener")
			.exactly(i ? 0 : 1)
			.on(oBinding).withExactArgs("/absolute/path", sinon.match.same("~oListener~"));

		// code under test
		oBinding.doDeregisterChangeListener("/absolute/path", "~oListener~");
	});
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
}].forEach(function (oFixture) {
	QUnit.test("doSetProperty: operation binding path: " + oFixture.path, function (assert) {
		var oBinding = this.bindContext("/Operation(...)"),
			oGroupLock = {
				unlock : function () { }
			},
			oUpdateValue = {};

		if (oFixture.name) {
			oBinding.oOperation.bAction = true;
			this.mock(_Helper).expects("makeUpdateData")
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
		this.mock(_Helper).expects("makeUpdateData").withExactArgs(["foo"], "bar")
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
	QUnit.test("checkKeepAlive", function (assert) {
		var oBinding = this.bindContext("/path");

		assert.throws(function () {
			oBinding.checkKeepAlive({/*oContext*/});
		}, new Error("Unsupported " + oBinding));
	});

	//*********************************************************************************************
	QUnit.test("refreshDependentBindings", function (assert) {
		var oBinding = this.bindContext("/path"),
			aDependentBindings = [{
				refreshInternal : function () {}
			}, {
				refreshInternal : function () {}
			}],
			bDependent0Refreshed = false,
			oDependent0Promise = new Promise(function (resolve) { // no need for SyncPromise
				bDependent0Refreshed = true;
				resolve();
			}),
			bDependent1Refreshed = false,
			oDependent1Promise = new Promise(function (resolve) { // no need for SyncPromise
				bDependent1Refreshed = true;
				resolve();
			}),
			oPromise;

		this.mock(oBinding).expects("getDependentBindings").withExactArgs()
			.returns(aDependentBindings);
		this.mock(aDependentBindings[0]).expects("refreshInternal")
			.withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~")
			.returns(oDependent0Promise);
		this.mock(aDependentBindings[1]).expects("refreshInternal")
			.withExactArgs("resource/path/prefix", "group", "~bCheckUpdate~", "~bKeepCacheOnError~")
			.returns(oDependent1Promise);

		// code under test
		oPromise = oBinding.refreshDependentBindings("resource/path/prefix", "group",
			"~bCheckUpdate~", "~bKeepCacheOnError~");

		assert.ok(oPromise.isPending(), "a SyncPromise");
		return oPromise.then(function () {
			assert.strictEqual(bDependent0Refreshed, true);
			assert.strictEqual(bDependent1Refreshed, true);
		});
	});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: unresolved", function (assert) {
		var oBinding = this.bindContext("unresolved");

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			undefined);
	});

	//*********************************************************************************************
[false, true].forEach(function (bMatch) {
	QUnit.test("findContextForCanonicalPath: match=" + bMatch, function (assert) {
		var oBinding = this.bindContext("/SalesOrder('1')/SO_2_BP"),
			sCanonicalPath = bMatch ? "/BusinessPartner('2')" : "/BusinessPartner('3')";

		this.mock(oBinding.oElementContext).expects("getValue").withExactArgs()
			.returns({"@$ui5._" : {predicate : "1"}});
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve(sCanonicalPath));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			bMatch ? oBinding.oElementContext : undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: operation w/o RVC", function (assert) {
		var oBinding = this.bindContext("/Operation(...)");

		this.mock(oBinding.oElementContext).expects("getValue").never();
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").never();

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			undefined);
	});

	//*********************************************************************************************
[false, true].forEach(function (bMatch) {
	QUnit.test("findContextForCanonicalPath: operation w/ RVC, match=" + bMatch, function (assert) {
		var oBinding = this.bindContext("/Operation(...)"),
			sCanonicalPath = bMatch ? "/BusinessPartner('2')" : "/BusinessPartner('3')",
			oReturnValueContext = {
				fetchCanonicalPath : function () {},
				getPath : function () {},
				getValue : function () {}
			};

		oBinding.oReturnValueContext = oReturnValueContext;
		this.mock(oBinding.oElementContext).expects("getValue").never();
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").never();
		this.mock(oBinding.oReturnValueContext).expects("getValue").withExactArgs()
			.returns({"@$ui5._" : {predicate : "1"}});
		this.mock(oReturnValueContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.resolve(sCanonicalPath));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			bMatch ? oReturnValueContext : undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: fetchCanonicalPath fails", function (assert) {
		var oBinding = this.bindContext("/SalesOrder('1')/SO_2_BP");

		this.mock(oBinding.oElementContext).expects("getValue").withExactArgs()
			.returns({"@$ui5._" : {predicate : "1"}});
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").withExactArgs()
			.returns(SyncPromise.reject(new Error()));

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: no entity data in cache", function (assert) {
		var oBinding = this.bindContext("/SalesOrder('1')/SO_2_BP");

		this.mock(oBinding.oElementContext).expects("getValue").withExactArgs().returns(undefined);
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").never();

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("findContextForCanonicalPath: no key predicate", function (assert) {
		var oBinding = this.bindContext("/SalesOrder('1')/SO_2_BP");

		this.mock(oBinding.oElementContext).expects("getValue").withExactArgs().returns({});
		this.mock(oBinding.oElementContext).expects("fetchCanonicalPath").never();

		assert.strictEqual(
			// code under test
			oBinding.findContextForCanonicalPath("/BusinessPartner('2')"),
			undefined);
	});

	//*********************************************************************************************
[{$select : "~select~"}, {$expand : "~expand~"}].forEach(function (mParameters) {
	QUnit.test("doFetchExpandSelectProperties", function (assert) {
		var oBinding = this.bindContext("/SalesOrder('1')"),
			oContext = {
				fetchValue : function () {}
			},
			oContextMock = this.mock(oContext),
			oFetchPromise1 = Promise.reject("~oError1~"),
			oFetchPromise2 = Promise.reject("~oError2~"),
			oHelperMock = this.mock(_Helper),
			oModelMock = this.mock(this.oModel),
			fnReporter1 = this.spy(),
			fnReporter2 = this.spy();

		this.oModel.bAutoExpandSelect = true;
		oBinding.oContext = oContext;
		oBinding.mParameters = mParameters;
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/resolved/path");
		this.mock(this.oModel).expects("buildQueryOptions")
			.withExactArgs(sinon.match.same(mParameters), true).returns("~mQueryOptions~");
		oHelperMock.expects("convertExpandSelectToPaths").withExactArgs("~mQueryOptions~")
			.returns(["p1", "p2"]);
		oHelperMock.expects("buildPath").withExactArgs("/resolved/path", "p1")
			.returns("/resolved/path/p1");
		oContextMock.expects("fetchValue").withExactArgs("/resolved/path/p1")
			.returns(oFetchPromise1);
		oModelMock.expects("getReporter").returns(fnReporter1);
		oHelperMock.expects("buildPath").withExactArgs("/resolved/path", "p2")
			.returns("/resolved/path/p2");
		oContextMock.expects("fetchValue").withExactArgs("/resolved/path/p2")
			.returns(oFetchPromise2);
		oModelMock.expects("getReporter").returns(fnReporter2);

		// code under test
		oBinding.doFetchExpandSelectProperties();

		assert.strictEqual(oBinding.bHasFetchedExpandSelectProperties, true);

		// code under test - nothing happens when called again
		oBinding.doFetchExpandSelectProperties();

		return Promise.all([
			oFetchPromise1.catch(function () {}),
			oFetchPromise2.catch(function () {})
		]).then(function () {
			sinon.assert.calledOnceWithExactly(fnReporter1, "~oError1~");
			sinon.assert.calledOnceWithExactly(fnReporter2, "~oError2~");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("doFetchExpandSelectProperties: no autoExpandSelect", function () {
		var oBinding = this.bindContext("/SalesOrder('1')", null, {$select : "foo"});

		this.oModel.bAutoExpandSelect = false;
		this.mock(this.oModel).expects("buildQueryOptions").never();
		this.mock(_Helper).expects("convertExpandSelectToPaths").never();

		// code under test
		oBinding.doFetchExpandSelectProperties();
	});

	//*********************************************************************************************
	QUnit.test("doFetchExpandSelectProperties: no $expand/$select", function () {
		var oBinding = this.bindContext("/SalesOrder('1')", null, {foo : "bar"});

		this.oModel.bAutoExpandSelect = true;
		this.mock(this.oModel).expects("buildQueryOptions").never();
		this.mock(_Helper).expects("convertExpandSelectToPaths").never();

		// code under test
		oBinding.doFetchExpandSelectProperties();
	});
});
