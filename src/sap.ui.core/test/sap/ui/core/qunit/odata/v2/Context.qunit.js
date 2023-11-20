/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Context",
	"sap/ui/model/_Helper",
	"sap/ui/model/odata/v2/Context"
], function (Log, SyncPromise, BaseContext, _Helper, Context) {
	/*global QUnit, sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.Context", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oContext,
			oTransientParent = {oSyncCreatePromise : "~parentCreatePromise"};

		// code under test
		oContext = new Context("~oModel", "/~sPath");

		assert.ok(oContext instanceof Context);
		assert.ok(oContext instanceof BaseContext);
		// constructor parameters
		assert.strictEqual(oContext.oModel, "~oModel");
		assert.strictEqual(oContext.sPath, "/~sPath");
		// additional properties
		assert.strictEqual(oContext.oCreatePromise, undefined);
		assert.strictEqual(oContext.sDeepPath, "/~sPath");
		assert.strictEqual(oContext.bForceRefresh, false);
		assert.strictEqual(oContext.bPreliminary, false);
		assert.ok("mSubContexts" in oContext);
		assert.strictEqual(oContext.mSubContexts, undefined);
		assert.ok("oTransientParent" in oContext);
		assert.strictEqual(oContext.oTransientParent, undefined);

		// code under test
		oContext = new Context("~oModel", "/~sPath", "/~sDeepPath");

		assert.strictEqual(oContext.sDeepPath, "/~sDeepPath");

		// code under test
		oContext = new Context("~oModel", "/~sPath", undefined, "~oSyncCreatePromise");

		assert.strictEqual(oContext.oCreatePromise, undefined);
		assert.strictEqual(oContext.oSyncCreatePromise, "~oSyncCreatePromise");
		assert.strictEqual(oContext.bInactive, false);
		assert.ok(oContext.oStartActivationPromise instanceof SyncPromise);
		assert.ok(oContext.oStartActivationPromise.isFulfilled());
		assert.strictEqual(oContext.oStartActivationPromise.getResult(), undefined);
		assert.ok(oContext.hasOwnProperty("fnStartActivation"));
		assert.strictEqual(oContext.fnStartActivation, undefined);
		assert.ok(oContext.oActivatedPromise instanceof SyncPromise);
		assert.ok(oContext.oActivatedPromise.isFulfilled());
		assert.strictEqual(oContext.oActivatedPromise.getResult(), undefined);
		assert.ok(oContext.hasOwnProperty("fnActivate"));
		assert.strictEqual(oContext.fnActivate, undefined);

		// code under test
		oContext = new Context("~oModel", "/~sPath", undefined, "~oSyncCreatePromise", "~inactive",
			oTransientParent);

		assert.strictEqual(oContext.oCreatePromise, undefined);
		assert.strictEqual(oContext.oSyncCreatePromise, "~parentCreatePromise");
		assert.strictEqual(oContext.bInactive, true);
		assert.ok(oContext.oStartActivationPromise instanceof SyncPromise);
		assert.ok(oContext.oStartActivationPromise.isPending());
		assert.ok(oContext.oActivatedPromise instanceof SyncPromise);
		assert.ok(oContext.oActivatedPromise.isPending());
		assert.strictEqual(oContext.oTransientParent, oTransientParent);

		// code under test
		oContext.fnStartActivation("~startResult");

		assert.ok(oContext.oStartActivationPromise.isFulfilled());
		assert.strictEqual(oContext.oStartActivationPromise.getResult(), "~startResult");

		// code under test
		oContext.fnActivate("~result");

		assert.ok(oContext.oActivatedPromise.isFulfilled());
		assert.strictEqual(oContext.oActivatedPromise.getResult(), "~result");
	});

	//*********************************************************************************************
	QUnit.test("setForceRefresh and isRefreshForced", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isRefreshForced(), false);
		oContext.setForceRefresh("~bForceFrefresh");
		assert.strictEqual(oContext.isRefreshForced(), "~bForceFrefresh");
	});

	//*********************************************************************************************
	QUnit.test("setPreliminary and isPreliminary", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isPreliminary(), false);
		oContext.setPreliminary("~bPreliminary");
		assert.strictEqual(oContext.isPreliminary(), "~bPreliminary");
	});

	//*********************************************************************************************
	QUnit.test("setUpdated and isUpdated", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isUpdated(), false);
		oContext.setUpdated("~bUpdated");
		assert.strictEqual(oContext.isUpdated(), "~bUpdated");
	});

	//*********************************************************************************************
	QUnit.test("setDeepPath and getDeepPath", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.getDeepPath(), "~sPath");
		oContext.setDeepPath("/~deepPath");
		assert.strictEqual(oContext.getDeepPath(), "/~deepPath");
	});

	//*********************************************************************************************
	[
		{isUpdated : true, result : true},
		{isUpdated : "true", result : "true"},
		{isUpdated : undefined, isRefreshForced : true, result : true},
		{isUpdated : undefined, isRefreshForced : false, result : false},
		{isUpdated : undefined, isRefreshForced : undefined, result : undefined},
		{isUpdated : false, isRefreshForced : true, result : true},
		{isUpdated : false, isRefreshForced : "true", result : "true"}
	].forEach(function (oFixture, i) {
		QUnit.test("hasChanged #" + i, function (assert) {
			var oContext = new Context("~oModel", "~sPath");

			oContext.setUpdated(oFixture.isUpdated);
			oContext.setForceRefresh(oFixture.isRefreshForced);

			// code under test
			assert.strictEqual(oContext.hasChanged(), oFixture.result);
		});
	});

	//*********************************************************************************************
	QUnit.test("isTransient: without create promise", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.isTransient(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("isTransient: successful creation", function (assert) {
		var fnResolve,
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				fnResolve = resolve;
			}),
			oContext = new Context("~oModel", "~sPath", /*sDeepPath*/undefined, oSyncPromise);

		// code under test
		assert.strictEqual(oContext.isTransient(), true);

		fnResolve();

		// code under test
		assert.strictEqual(oContext.isTransient(), false);

		return oSyncPromise;
	});

	//*********************************************************************************************
	QUnit.test("isTransient: failed creation", function (assert) {
		var fnReject,
			oSyncPromise = new SyncPromise(function (resolve, reject) {
				fnReject = reject;
			}),
			oContext = new Context("~oModel", "~sPath", /*sDeepPath*/undefined, oSyncPromise);

		// code under test
		assert.strictEqual(oContext.isTransient(), true);

		fnReject();

		// code under test
		assert.strictEqual(oContext.isTransient(), false);

		return oSyncPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("created: no create promise", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.created(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("created: resolved create promise", function (assert) {
		var oContext = new Context("~oModel", "~sPath", /*sDeepPath*/undefined,
				SyncPromise.resolve("~oCreateResult")),
			oPromise;

		// code under test
		oPromise = oContext.created();

		assert.ok(oPromise instanceof Promise);
		assert.strictEqual(oContext.oCreatePromise, oPromise);

		// code under test - reuse promise
		assert.strictEqual(oContext.created(), oPromise);

		return oPromise.then(function (oCreatedResult) {
			assert.strictEqual(oCreatedResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("created: rejected create promise", function (assert) {
		var oContext = new Context("~oModel", "~sPath", /*sDeepPath*/undefined,
				SyncPromise.reject("~oError"));

		// code under test
		return oContext.created().then(function () {
				assert.ok(false, "unexpected success");
			}, function (oError) {
				assert.strictEqual(oError, "~oError");
			});
	});

	//*********************************************************************************************
	QUnit.test("resetCreatedPromise", function (assert) {
		var oContext = {oCreatePromise : "~pCreate", oSyncCreatePromise : "~pSyncCreate"};

		// code under test
		Context.prototype.resetCreatedPromise.call(oContext);

		assert.strictEqual(oContext.oCreatePromise, undefined);
		assert.strictEqual(oContext.oSyncCreatePromise, undefined);
	});

	//*********************************************************************************************
	QUnit.test("startActivation", function (assert) {
		var oContext = new Context("~oModel", "/~sPath", undefined, undefined, /*bInactive*/false);

		assert.strictEqual(oContext.bInactive, false);

		// code under test
		oContext.startActivation();

		assert.strictEqual(oContext.bInactive, false, "startActivation has no effect on active context");

		oContext = new Context("~oModel", "/~sPath", undefined, undefined, /*bInactive*/true);

		assert.strictEqual(oContext.bInactive, true);
		this.mock(oContext).expects("fnStartActivation").withExactArgs();

		// code under test
		oContext.startActivation();

		assert.strictEqual(oContext.bInactive, true);
	});

	//*********************************************************************************************
	QUnit.test("cancelActivation", function (assert) {
		var oContext = new Context("~oModel", "/~sPath", undefined, undefined, /*bInactive*/true),
			fnPreviousStartActivation = oContext.fnStartActivation,
			oPreviousStartActivationPromise = oContext.oStartActivationPromise;

		assert.strictEqual(oContext.bInactive, true);

		// code under test
		oContext.cancelActivation();

		assert.strictEqual(oContext.bInactive, true);
		assert.notStrictEqual(oContext.fnStartActivation, fnPreviousStartActivation);
		assert.notStrictEqual(oContext.oStartActivationPromise, oPreviousStartActivationPromise);
		assert.ok(oContext.oStartActivationPromise instanceof SyncPromise);
		assert.ok(oContext.oStartActivationPromise.isPending());

		// code under test
		oContext.fnStartActivation("~startResult");

		assert.ok(oContext.oStartActivationPromise.isFulfilled());
		assert.strictEqual(oContext.oStartActivationPromise.getResult(), "~startResult");
	});


	//*********************************************************************************************
	QUnit.test("finishActivation", function (assert) {
		var oContext = new Context("~oModel", "/~sPath", undefined, undefined, /*bInactive*/false);

		assert.strictEqual(oContext.bInactive, false);

		// code under test
		oContext.finishActivation();

		assert.strictEqual(oContext.bInactive, false);

		oContext = new Context("~oModel", "/~sPath", undefined, undefined, /*bInactive*/true);

		assert.strictEqual(oContext.bInactive, true);
		this.mock(oContext).expects("fnActivate").withExactArgs();

		// code under test
		oContext.finishActivation();

		assert.strictEqual(oContext.bInactive, false);
	});

	//*********************************************************************************************
	QUnit.test("fetchActivated", function (assert) {
		var oContext = {oActivatedPromise : "~oActivatedPromise"};

		// code under test
		assert.strictEqual(Context.prototype.fetchActivated.call(oContext), "~oActivatedPromise");
	});

	//*********************************************************************************************
	QUnit.test("fetchActivationStarted", function (assert) {
		var oContext = {oStartActivationPromise : "~oStartActivationPromise"};

		// code under test
		assert.strictEqual(Context.prototype.fetchActivationStarted.call(oContext), "~oStartActivationPromise");
	});

	//*********************************************************************************************
	QUnit.test("isInactive", function (assert) {
		var oContext = {bInactive : "~bInactive"};

		// code under test
		assert.strictEqual(Context.prototype.isInactive.call(oContext), "~bInactive");
	});

	//*********************************************************************************************
	QUnit.test("delete: inactive context", function (assert) {
		var oPromise,
			oModel = {
				_discardEntityChanges : function () {},
				_getKey : function () {},
				checkUpdate : function () {}
			},
			oContext = new Context(oModel, "/~sPath");

		this.mock(oContext).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(true);
		this.mock(oModel).expects("_getKey")
			.withExactArgs(sinon.match.same(oContext))
			.returns("~sKey");
		this.mock(oModel).expects("_discardEntityChanges")
			.withExactArgs("~sKey", /*bDeleteEntity*/true);
		this.mock(oModel).expects("checkUpdate").withExactArgs();

		// code under test
		oPromise = oContext.delete();

		assert.ok(oPromise instanceof Promise);
		return oPromise.then(function (oResult) {
			assert.strictEqual(oResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("delete: transient context", function (assert) {
		var oModel = {
				resetChanges : function () {}
			},
			oContext = new Context(oModel, "/~sPath");

		this.mock(oContext).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext).expects("getPath").withExactArgs().returns("/~ContextPath");
		this.mock(oModel).expects("resetChanges")
			.withExactArgs(["/~ContextPath"], /*bAll=abort deferred requests*/false,
				/*bDeleteCreatedEntities*/true)
			.returns("~oPromise");

		// code under test
		assert.strictEqual(oContext.delete(), "~oPromise");
	});

	//*********************************************************************************************
[true, false].forEach(function (bSuccess) {
	QUnit.test("delete: persistent context, remove successful: " + bSuccess, function (assert) {
		var fnError, fnSuccess, oPromise,
			oModel = {
				remove : function () {},
				_resolveGroup : function () {}
			},
			oContext = new Context(oModel, "/~sPath"),
			mParameters = {
				changeSetId : "~changeSetId",
				groupId : "~groupId",
				refreshAfterChange : "~refreshAfterChange"
			};

		this.mock(oContext).expects("getModel").withExactArgs().returns(oModel);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(false);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~path");
		this.mock(oModel).expects("_resolveGroup").withExactArgs("~path")
			.returns({groupId : "~defaultGroupId", changeSetId : "~defaultChangeSetId"});
		this.mock(_Helper).expects("merge")
			.withExactArgs(sinon.match.object, sinon.match.same(mParameters))
			.callsFake(function (mPresetParameters/*, mParameters*/) {
				assert.strictEqual(mPresetParameters.changeSetId, "~defaultChangeSetId");
				assert.strictEqual(mPresetParameters.context, oContext);
				assert.strictEqual(typeof mPresetParameters.error, "function");
				assert.strictEqual(mPresetParameters.groupId, "~defaultGroupId");
				assert.strictEqual(typeof mPresetParameters.success, "function");
				assert.strictEqual(Object.keys(mPresetParameters).length, 5);
				fnError = mPresetParameters.error;
				fnSuccess = mPresetParameters.success;

				return "~mRemoveParameters";
			});
		// abort handler returned by ODataModel#remove is ignored
		this.mock(oModel).expects("remove")
			.withExactArgs("", "~mRemoveParameters")
			.callsFake(function () {
				if (bSuccess) {
					// code under test
					fnSuccess("~callbackArguments");
				} else {
					// code under test
					fnError("~ErrorArgument");
				}
			});

		// code under test
		oPromise = oContext.delete(mParameters);

		return oPromise.then(function (vResultSuccess) {
			assert.strictEqual(vResultSuccess, undefined,
				"Context#delete ignores success handler parameters");
			assert.ok(bSuccess);
		}, function (vResultError) {
			assert.strictEqual(vResultError, "~ErrorArgument",
				"Context#delete propagates error handler parameter");
			assert.notOk(bSuccess);
		});
	});
});

	//*********************************************************************************************
	QUnit.test("delete: persistent context, unsupported parameter", function (assert) {
		var oContext = new Context("~oModel", "/~sPath"),
			mParameters = {foo : "~bar"};

		this.mock(Array.prototype).expects("includes").withExactArgs("foo")
			.callsFake(function (/*sParameterKey*/) {
				assert.deepEqual(this, ["changeSetId", "groupId", "refreshAfterChange"]);

				return false;
			});

		assert.throws(function () {
			// code under test
			oContext.delete(mParameters);
		 }, new Error("Parameter 'foo' is not supported"));
	});

	//*********************************************************************************************
	QUnit.test("addSubContext", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		oContext.addSubContext("navProperty", "~oSubContext0", /*bIsCollection*/false);
		oContext.addSubContext("navProperty2", "~oSubContext1", /*bIsCollection*/true);
		oContext.addSubContext("navProperty2", "~oSubContext2", /*bIsCollection*/true);

		assert.deepEqual(oContext.mSubContexts, {
			navProperty : "~oSubContext0",
			navProperty2 : ["~oSubContext1", "~oSubContext2"]
		});
	});

	//*********************************************************************************************
	QUnit.test("getSubContexts", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		oContext.mSubContexts = "~subContexts";

		// code under test
		assert.strictEqual(oContext.getSubContexts(), "~subContexts");
	});

	//*********************************************************************************************
	QUnit.test("hasTransientParent", function (assert) {
		var oContext = new Context("~oModel", "~sPath", undefined, undefined, undefined,
				"~transientParent");

		// code under test
		assert.strictEqual(oContext.hasTransientParent(), true);

		oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.hasTransientParent(), false);
	});

	//*********************************************************************************************
	QUnit.test("hasSubContexts", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		// code under test
		assert.strictEqual(oContext.hasSubContexts(), false);

		oContext.mSubContexts = {foo : "~subContext"};

		// code under test
		assert.strictEqual(oContext.hasSubContexts(), true);
	});

	//*********************************************************************************************
	QUnit.test("removeSubContext", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		oContext.mSubContexts = {
			foo : "~subContext0",
			bar : ["~subContext1", "~subContext2"]
		};

		// code under test
		oContext.removeSubContext("~subContext0");

		assert.deepEqual(oContext.mSubContexts, {
			bar : ["~subContext1", "~subContext2"]
		});

		// code under test
		oContext.removeSubContext("~subContext1");

		assert.deepEqual(oContext.mSubContexts, {
			bar : ["~subContext2"]
		});

		// code under test
		oContext.removeSubContext("~subContext2");

		assert.deepEqual(oContext.mSubContexts, undefined);

		// code under test
		oContext.removeSubContext("~subContext42");
	});

	//*********************************************************************************************
	QUnit.test("removeSubContext: non matching single entry", function (assert) {
		var oContext = new Context("~oModel", "~sPath");

		oContext.mSubContexts = {foo: "~subContext0"};

		// code under test
		oContext.removeSubContext("~subContext1");

		assert.deepEqual(oContext.mSubContexts, {foo: "~subContext0"});
	});

	//*********************************************************************************************
	QUnit.test("removeFromTransientParent", function (assert) {
		var oParent = new Context("~oModel", "~sParentPath"),
			oContext = new Context("~oModel", "~sPath", undefined, undefined, undefined, oParent);

		this.mock(oParent).expects("removeSubContext").withExactArgs(sinon.match.same(oContext));

		// code under test
		oContext.removeFromTransientParent();

		assert.strictEqual(oContext.oTransientParent, undefined);

		// code under test
		oContext.removeFromTransientParent();
	});

	//*********************************************************************************************
	QUnit.test("getSubContextsArray", function (assert) {
		var oContext = new Context("~oModel", "~sPath"),
			oSubContext0 = new Context("~oModel", "~sPath0"),
			oSubContext1 = new Context("~oModel", "~sPath1"),
			oSubContext2 = new Context("~oModel", "~sPath2");

		// code under test
		assert.deepEqual(oContext.getSubContextsArray(), []);

		oContext.mSubContexts = {
			foo : oSubContext0,
			bar : [oSubContext1, oSubContext2]
		};

		// code under test
		assert.deepEqual(oContext.getSubContextsArray(),
			[oSubContext0, oSubContext1, oSubContext2]);

		this.mock(oSubContext0).expects("getSubContextsArray")
			.withExactArgs("~bRecursive")
			.returns(["~oSubContext0.0"]);
		this.mock(oSubContext1).expects("getSubContextsArray")
			.withExactArgs("~bRecursive")
			.returns(["~oSubContext1.0", "~oSubContext1.1"]);
		this.mock(oSubContext2).expects("getSubContextsArray")
			.withExactArgs("~bRecursive")
			.returns([]);

		// code under test
		assert.deepEqual(oContext.getSubContextsArray("~bRecursive"),
			[oSubContext0, "~oSubContext0.0", oSubContext1, "~oSubContext1.0", "~oSubContext1.1",
			oSubContext2]);
	});

	//*********************************************************************************************
	QUnit.test("getSubContextsAsPath, getSubContextsAsKey", function (assert) {
		var oContext = new Context("~oModel", "~sPath"),
			oSubContext0 = new Context("~oModel", "/~sPath0"),
			oSubContext1 = new Context("~oModel", "/~sPath1");

		this.mock(oContext).expects("getSubContextsArray")
			.withExactArgs("~bRecursive")
			.twice()
			.returns([oSubContext0, oSubContext1]);

		// code under test
		assert.deepEqual(oContext.getSubContextsAsPath("~bRecursive"), ["/~sPath0", "/~sPath1"]);

		// code under test
		assert.deepEqual(oContext.getSubContextsAsKey("~bRecursive"), ["~sPath0", "~sPath1"]);
	});
});
