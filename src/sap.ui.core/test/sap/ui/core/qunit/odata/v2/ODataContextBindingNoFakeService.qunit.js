/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/ContextBinding",
	"sap/ui/model/odata/v2/ODataContextBinding"
], function (Log, ChangeReason, BaseContext, ContextBinding, ODataContextBinding) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataContextBinding (ODataContextBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
[true, false, undefined].forEach(function (bCreatePreliminary) {
	QUnit.test("checkUpdate: createPreliminaryContext " + bCreatePreliminary, function (assert) {
		var oContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oModel = {
				createBindingContext : function () {}
			},
			oBinding = new ODataContextBinding(oModel, "path", oContext, {
				createPreliminaryContext : bCreatePreliminary,
				expand : "foo",
				select : "bar",
				usePreliminaryContext : true
			}),
			mExpectedParameters = bCreatePreliminary
				? {expand : "foo", select : "bar", usePreliminaryContext : true}
				: {createPreliminaryContext : undefined, expand : "foo", select : "bar",
					usePreliminaryContext : true};

		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oContext).expects("isUpdated").withExactArgs().returns(false);
		this.mock(Object).expects("assign")
			.exactly(bCreatePreliminary ? 1 : 0)
			.withExactArgs({}, oBinding.mParameters)
			.callThrough();
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("path", sinon.match.same(oContext), mExpectedParameters)
			.returns("newContext");
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});
		// mimic binding initialization
		oBinding.bInitial = false;
		oBinding.oElementContext = "currentContext";

		// code under test
		oBinding.checkUpdate();

		assert.strictEqual(oBinding.oElementContext, "newContext");
	});
});
	//*********************************************************************************************
[true, false].forEach(function (bV2Context) {
	var sTitle = "_refresh: Call getResolvedPath; binding has a " + (bV2Context ? "V2" : "standard")
			+ " parent context " + bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : bV2Context
					? {isTransient : function () {}}
					: "~context",
				oModel : {createBindingContext : function () {}},
				mParameters : "~parameters",
				sPath : "~path",
				fireDataRequested : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if (bV2Context) {
			this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oBinding.oContext), "~parameters",
				sinon.match.func, true)
			.returns("~oV2Context");

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRequest, true);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bV2Context) {
	var sTitle = "_refresh: Create preliminary context; binding has a "
			+ (bV2Context ? "V2" : "standard") + " parent context " + bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : bV2Context
					? {isTransient : function () {}}
					: "~context",
				bCreatePreliminaryContext : true,
				oModel : {
					createBindingContext : function () {},
					_updateContext : function () {}
				},
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				fireDataRequested : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oV2Context = {
				sPath : "~oContextPath",
				setPreliminary : function() {}
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if (bV2Context) {
			this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		oModelMock.expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oBinding.oContext), "~parameters",
				sinon.match.func, true)
			.returns(oV2Context);
		this.mock(oV2Context).expects("setPreliminary").withExactArgs(true);
		oModelMock.expects("_updateContext")
			.withExactArgs(oV2Context, "~resolvedPath");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}, undefined);
		oModelMock.expects("_updateContext")
			.withExactArgs(oV2Context, "~oContextPath");

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			oV2Context);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bV2Context) {
	var sTitle = "_refresh: createBindingContext set element context; binding has a "
			+ (bV2Context ? "V2" : "standard") + " parent context " + bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oExpectation,
			oBinding = {
				oContext : bV2Context
					? {isTransient : function () {}}
					: "~context",
				oModel : {
					createBindingContext : function () {},
					_updateContext : function () {},
					callAfterUpdate : function () {}
				},
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				fireDataRequested : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oElementContextArg = {
				getObject : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if (bV2Context) {
			this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		oExpectation = this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oBinding.oContext), "~parameters",
				sinon.match.func, true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}, undefined);
		// createBindingContext callback mocks
		this.mock(BaseContext).expects("hasChanged")
			.withExactArgs(oElementContextArg, undefined)
			.returns(true);
		this.mock(oElementContextArg).expects("getObject")
			.withExactArgs("~parameters")
			.returns("~oData");
		this.mock(oBinding.oModel).expects("callAfterUpdate")
			.withExactArgs(sinon.match.func);

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);
		oExpectation.callArgWith(3, oElementContextArg);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			oElementContextArg);
	});
});

	//*********************************************************************************************
	QUnit.test("_refresh: parent context is transient", function (assert) {
		var oBinding = {
				oContext : {
					isTransient : function () {}
				},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding.oContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("initialize: unresolved binding leads to null as oElementContext",
			function (assert) {
		var oBinding = {
				bInitial : true,
				oModel : {
					oMetadata : {
						isLoaded : function () {}
					}
				},
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oBoundContext;

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, null);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, null);
	});

	//*********************************************************************************************
	QUnit.test("initialize: parent context is transient", function (assert) {
		var oParentContext = {
				isPreliminary : function () {},
				isTransient : function () {}
			},
			oBinding = {
				oContext : oParentContext,
				bInitial : true,
				oModel : {
					oMetadata : {
						isLoaded : function () {}
					}
				},
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oParentContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oParentContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});

	//*********************************************************************************************
[false, true].forEach(function (bV2Context) {
	var sTitle = "initialize: if createBindingContext cannot return a context instance,"
			+ " oElementContext is set to null; binding has a " + (bV2Context ? "V2" : "standard")
			+ " parent context " + bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oModel = {
				oMetadata : {
					isLoaded : function () {}
				},
				_isReloadNeeded : function () {},
				createBindingContext : function () {}
			},
			oParentContext = {isPreliminary : function () {}},
			oBinding = {
				oContext : oParentContext,
				bInitial : true,
				oModel : oModel,
				sPath : "~sPath",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oParentContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if (bV2Context) {
			oParentContext.isTransient = function () {};
			this.mock(oParentContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded")
			.withExactArgs("~resolvedPath", undefined)
			.returns(false);
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~sPath", sinon.match.same(oParentContext),
				/*this.mParameters*/undefined, /*fnCallBack*/sinon.match.func,
				/*ReloadNeeded*/false)
			.returns(null);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});
});

	//*********************************************************************************************
	QUnit.test("initialize: create preliminary context different to current oElementContext,"
			+ " updates oElementContext with the OData V2 context returned by"
			+ " ODataModel#createBindingContext", function (assert) {
		var oParentContext = {
				isPreliminary : function () {},
				isTransient : function () {}
			},
			oModel = {
				oMetadata : {
					loaded : function () {},
					isLoaded : function () {}
				},
				_isReloadNeeded : function () {},
				createBindingContext : function () {}
			},
			oBinding = {
				oContext : oParentContext,
				bCreatePreliminaryContext : true,
				oElementContext : "~oldElementContext",
				bInitial : true,
				oModel : oModel,
				sPath : "~sPath",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oPromise = Promise.resolve(),
			oV2Context = {
				setPreliminary : function () {}
			};

		this.mock(oParentContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oParentContext).expects("isTransient").withExactArgs().returns(undefined);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded")
			.withExactArgs("~resolvedPath", undefined)
			.returns(false);
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~sPath", sinon.match.same(oParentContext),
				/*this.mParameters*/undefined, /*fnCallBack*/sinon.match.func,
				/*ReloadNeeded*/false)
			.returns(oV2Context);
		this.mock(oV2Context).expects("setPreliminary").withExactArgs(true);
		this.mock(oModel.oMetadata).expects("loaded").withExactArgs().returns(oPromise);

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			oV2Context);

		// change event is fired asynchronously
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		return oPromise.then(function () {/*nothing to do*/});
	});

	//*********************************************************************************************
	QUnit.test("initialize: oElementContext is set in callback handler passed to"
			+ " ODataModel#createBindingContext", function (assert) {
		var oExpectation,
			oModel = {
				oMetadata : {
					isLoaded : function () {}
				},
				_isReloadNeeded : function () {},
				createBindingContext : function () {}
			},
			oBinding = {
				oElementContext : "~oldElementContext",
				bInitial : true,
				oModel : oModel,
				sPath : "~sPath",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oV2Context = {
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded")
			.withExactArgs("~resolvedPath", undefined)
			.returns(false);
		oExpectation = this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~sPath", /*this.oContext*/undefined, /*this.mParameters*/undefined,
				/*fnCallBack*/sinon.match.func, /*ReloadNeeded*/false)
			.returns(oV2Context);

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			"~oldElementContext");

		this.mock(oV2Context).expects("isUpdated").withExactArgs().returns("~bUpdated");
		this.mock(oV2Context).expects("isRefreshForced").withExactArgs().returns("~bForceRefresh");
		this.mock(BaseContext).expects("hasChanged")
			.withExactArgs(sinon.match.same(oV2Context), "~oldElementContext")
			.returns(true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}, "~bForceRefresh", "~bUpdated");

		// code under test - call back handler is called with a V2 context
		oExpectation.args[0][3](oV2Context);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			oV2Context);
	});

	//*********************************************************************************************
	QUnit.test("checkUpdate: oElementContext is set with the result of"
			+ " ODataModel#createBindingContext", function (assert) {
		var oBinding = {
				oElementContext : "~oldElementContext",
				bInitial : false,
				oModel : {
					createBindingContext : function () {}
				},
				mParameters : {},
				sPath : "~sPath",
				bPendingRequest : false,
				_fireChange : function () {}
			},
			oBoundContext;

		this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~sPath", /*this.oContext*/undefined,
				sinon.match.same(oBinding.mParameters))
			.returns("~v2Context");
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.checkUpdate.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, "~v2Context");

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, "~v2Context");
	});

	//*********************************************************************************************
	QUnit.test("getBoundContext: oElementContext is returned", function (assert) {
		var oBinding = {
				oElementContext : "~elementContext"
			};

		// code under test
		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			"~elementContext");
	});

	//*********************************************************************************************
	QUnit.test("setContext: unresolved context", function (assert) {
		var oBinding = {
				oContext : "~context",
				oElementContext : "~oElementContext",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(BaseContext).expects("hasChanged")
			.withExactArgs("~context", undefined)
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});

	//*********************************************************************************************
[{ // skip context propagation because sResolvedPath is falsy
	navigationProperty : undefined,
	resolvedPath : undefined,
	skipTransientContextPropagation : true
}, { // skip context propagation because a navigation property was detected
	navigationProperty : "~navigationProperty",
	resolvedPath : "~resolvedPath",
	skipTransientContextPropagation : true
}, { // don't skip context propagation for resolved paths without navigation properties
	navigationProperty : "",
	resolvedPath : "~resolvedPath",
	skipTransientContextPropagation : false
}].forEach(function (oFixture, i) {
	var sTitle = "setContext: context is transient; no context propagation for navigation "
			+ "properties #" + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oContext : "~context",
				oElementContext : "~oOldElementContext",
				oModel : {
					oMetadata : {_splitByLastNavigationProperty : function () {}},
					_getObject : function () {},
					_isReloadNeeded : function () {},
					createBindingContext : function () {}
				},
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oNewContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isTransient : function () {},
				isUpdated : function () {}
			};

		this.mock(oNewContext).expects("isRefreshForced").withExactArgs().returns(false);
		this.mock(oNewContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oNewContext).expects("isTransient").withExactArgs().returns(true);
		this.mock(oNewContext).expects("isUpdated").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(BaseContext).expects("hasChanged")
			.withExactArgs("~context", sinon.match.same(oNewContext))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath")
			.withExactArgs()
			.returns(oFixture.resolvedPath);
		this.mock(oBinding.oModel.oMetadata).expects("_splitByLastNavigationProperty")
			.withExactArgs(oFixture.resolvedPath)
			.exactly(oFixture.resolvedPath ? 1 : 0)
			.returns({lastNavigationProperty : oFixture.navigationProperty});
		this.mock(oBinding.oModel).expects("_getObject")
			.withExactArgs("~path", sinon.match.same(oNewContext))
			.exactly(oFixture.skipTransientContextPropagation ? 0 : 1)
			.returns("~oData");
		this.mock(oBinding.oModel).expects("_isReloadNeeded")
			.withExactArgs(oFixture.resolvedPath, "~parameters")
			.exactly(oFixture.skipTransientContextPropagation ? 0 : 1)
			.returns(false);
		this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oNewContext), "~parameters", sinon.match.func,
				false)
			.exactly(oFixture.skipTransientContextPropagation ? 0 : 1)
			.returns(undefined);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bV2Context) {
	var sTitle = "setContext: bound context cannot be determined synchronously, use V2 context: "
			+ bV2Context;
	QUnit.test(sTitle, function (assert) {
		var oModel = {
				_getObject : function () {},
				_isReloadNeeded : function () {},
				createBindingContext : function () {}
			},
			oBinding = {
				oContext : "~context",
				oElementContext : "~oOldElementContext",
				oModel : oModel,
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oNewContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		this.mock(oNewContext).expects("isRefreshForced").withExactArgs().returns(false);
		this.mock(oNewContext).expects("isPreliminary").withExactArgs().returns(false);
		if (bV2Context) {
			oNewContext.isTransient = function () {};
			this.mock(oNewContext).expects("isTransient").withExactArgs().returns(undefined);
		}
		this.mock(oNewContext).expects("isUpdated").withExactArgs().returns(false);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(BaseContext).expects("hasChanged")
			.withExactArgs("~context", sinon.match.same(oNewContext))
			.returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_getObject")
			.withExactArgs("~path", sinon.match.same(oNewContext))
			.returns("~oData");
		this.mock(oModel).expects("_isReloadNeeded")
			.withExactArgs("~resolvedPath", "~parameters")
			.returns(false);
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oNewContext), "~parameters",
				sinon.match.func, false)
			.returns(null);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bV2Context) {
	QUnit.test("setContext: bound context is created preliminary, use V2 context: " + bV2Context,
			function (assert) {
		var oExpectation,
			oBaseContextMock = this.mock(BaseContext),
			oModel = {
				_getObject : function () {},
				_isReloadNeeded : function () {},
				_updateContext : function () {},
				createBindingContext : function () {}
			},
			oBinding = {
				oContext : "~context",
				bCreatePreliminaryContext : true,
				oElementContext : "~oOldElementContext",
				oModel : oModel,
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			},
			oBindingContext = {
				setPreliminary : function () {},
				sPath : "~oBindingContextPath"
			},
			oBindingMock = this.mock(oBinding),
			oModelMock = this.mock(oModel),
			oNewContextFunctionArgument = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};
		this.mock(oNewContextFunctionArgument).expects("isRefreshForced")
			.withExactArgs()
			.returns(false);
		this.mock(oNewContextFunctionArgument).expects("isPreliminary")
			.withExactArgs()
			.returns(false);
		if (bV2Context) {
			oNewContextFunctionArgument.isTransient = function () {};
			this.mock(oNewContextFunctionArgument).expects("isTransient")
				.withExactArgs()
				.returns(undefined);
		}
		this.mock(oNewContextFunctionArgument).expects("isUpdated")
			.withExactArgs()
			.returns(false);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		oBaseContextMock.expects("hasChanged")
			.withExactArgs("~context", sinon.match.same(oNewContextFunctionArgument))
			.returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		oModelMock.expects("_getObject")
			.withExactArgs("~path", sinon.match.same(oNewContextFunctionArgument))
			.returns("~oData");
		oModelMock.expects("_isReloadNeeded")
			.withExactArgs("~resolvedPath", "~parameters")
			.returns(false);
		oExpectation = oModelMock.expects("createBindingContext")
			.withExactArgs("~path", sinon.match.same(oNewContextFunctionArgument), "~parameters",
				sinon.match.func, false)
			.returns(oBindingContext);
		this.mock(oBindingContext).expects("setPreliminary").withExactArgs(true);
		oModelMock.expects("_updateContext")
			.withExactArgs(sinon.match.same(oBindingContext), "~resolvedPath");
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}, false);
		oModelMock.expects("_updateContext")
			.withExactArgs(sinon.match.same(oBindingContext), "~oBindingContextPath");

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding, oNewContextFunctionArgument);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			oBindingContext);

		oBinding.bCreatePreliminaryContext = false;
		oBaseContextMock.expects("hasChanged")
			.withExactArgs("~oV2Context", sinon.match.same(oBindingContext))
			.returns(true);
		oBindingMock.expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context}, false, false);

		// code under test - call callback handler with a V2 context
		oExpectation.callArgWith(3, "~oV2Context");

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			"~oV2Context");
	});
});

	//*********************************************************************************************
	QUnit.test("_fireChange: no oElementContext", function (assert) {
		var oBinding = {};

		this.mock(ContextBinding.prototype).expects("_fireChange").on(oBinding)
			.withExactArgs("~mParameters");

		// code under test
		ODataContextBinding.prototype._fireChange.call(oBinding, "~mParameters");
	});

	//*********************************************************************************************
	QUnit.test("_fireChange: with oElementContext", function (assert) {
		var oBinding = {
				oElementContext : {
					isUpdated : function () {},
					setForceRefresh : function () {},
					setUpdated : function () {}
				}
			},
			oContextMock = this.mock(oBinding.oElementContext);

		oContextMock.expects("isUpdated").withExactArgs().returns("~bOldUpdated");
		oContextMock.expects("setForceRefresh").withExactArgs("~bForceUpdate");
		oContextMock.expects("setUpdated").withExactArgs("~bUpdated");
		this.mock(ContextBinding.prototype).expects("_fireChange").on(oBinding)
			.withExactArgs("~mParameters");
		oContextMock.expects("setForceRefresh").withExactArgs(false);
		oContextMock.expects("setUpdated").withExactArgs("~bOldUpdated");

		// code under test
		ODataContextBinding.prototype._fireChange.call(oBinding, "~mParameters", "~bForceUpdate",
			"~bUpdated");
	});
});