/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Context',
	"sap/ui/model/odata/v2/ODataContextBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, BaseContext, ODataContextBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint no-warning-comments: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataContextBinding (ODataContextBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
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
	QUnit.test("_refresh: Call getResolvedPath", function (assert) {
		var oBinding = {
				oContext : "~context",
				oModel : {createBindingContext : function () {}},
				mParameters : "~parameters",
				sPath : "~path",
				fireDataRequested : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~path", "~context", "~parameters", sinon.match.func, true)
			.returns("~context");

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRequest, true);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: Create preliminary context", function (assert) {
		var oBinding = {
				oContext : "~context",
				oModel : {
					createBindingContext : function () {},
					_updateContext : function () {}
				},
				mParameters : "~parameters",
				sPath : "~path",
				_fireChange : function () {},
				fireDataRequested : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				bCreatePreliminaryContext : true
			},
			oContext = {
				sPath: "~oContextPath",
				setPreliminary : function() {}
			},
			oBoundContext,
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		oModelMock.expects("createBindingContext")
			.withExactArgs("~path", "~context", "~parameters", sinon.match.func, true)
			.returns(oContext);
		this.mock(oContext).expects("setPreliminary").withExactArgs(true);
		oModelMock.expects("_updateContext")
			.withExactArgs(oContext, "~resolvedPath");
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({ reason: ChangeReason.Context }, undefined);
		oModelMock.expects("_updateContext")
			.withExactArgs(oContext, "~oContextPath");

		// code under test
		ODataContextBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, oContext);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, oContext);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: createBindingContext set element context", function (assert) {
		var oBinding = {
				oContext : "~context",
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
			oBoundContext,
			oElementContextArg = {
				getObject : function () {}
			},
			oExpectation;

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireDataRequested").withExactArgs();
		oExpectation = this.mock(oBinding.oModel).expects("createBindingContext")
			.withExactArgs("~path", "~context", "~parameters", sinon.match.func, true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({ reason: ChangeReason.Context }, undefined);
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

		assert.strictEqual(oBinding.oElementContext, oElementContextArg);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, oElementContextArg);
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
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, null);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, null);
	});

	//*********************************************************************************************
	QUnit.test("initialize: if createBindingContext cannot return an OData V2 Context,"
			+ " oElementContext is set to null", function (assert) {
		var oParentContext = {
				isPreliminary : function () {}
			},
			oModel = {
				oMetadata : {
					isLoaded : function () {}
				},
				_isReloadNeeded : function () {},
				createBindingContext : function () {}
			},
			oBoundContext,
			oBinding = {
				oContext : oParentContext,
				bInitial : true,
				oModel : oModel,
				sPath : "~sPath",
				_fireChange : function () {},
				getResolvedPath : function () {},
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oParentContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded").withExactArgs("~resolvedPath", undefined)
			.returns(false);
		this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~sPath", sinon.match.same(oParentContext),
				/*this.mParameters*/undefined, /*fnCallBack*/sinon.match.func,
				/*ReloadNeeded*/false)
			.returns(null);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, null);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, null);
	});

	//*********************************************************************************************
	QUnit.test("initialize: create preliminary context different to current oElementContext,"
			+ " updates oElementContext with the OData V2 context returned by"
			+ " ODataModel#createBindingContext", function (assert) {
		var oParentContext = {
				isPreliminary : function () {}
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
			oBoundContext,
			oPromise = Promise.resolve(),
			oV2Context = {
				setPreliminary : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		this.mock(oParentContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded").withExactArgs("~resolvedPath", undefined)
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

		assert.strictEqual(oBinding.oElementContext, oV2Context);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, oV2Context);

		// change event is fired asynchronously
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

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
			oBoundContext,
			oV2Context = {
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_isReloadNeeded").withExactArgs("~resolvedPath", undefined)
			.returns(false);
		oExpectation = this.mock(oModel).expects("createBindingContext")
			.withExactArgs("~sPath", /*this.oContext*/undefined, /*this.mParameters*/undefined,
				/*fnCallBack*/sinon.match.func, /*ReloadNeeded*/false)
			.returns(oV2Context);


		// code under test
		ODataContextBinding.prototype.initialize.call(oBinding);

		assert.strictEqual(oBinding.oElementContext, "~oldElementContext", "not yet changed");

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, "~oldElementContext");

		this.mock(oV2Context).expects("isUpdated").withExactArgs().returns("~bUpdated");
		this.mock(oV2Context).expects("isRefreshForced").withExactArgs().returns("~bForceRefresh");
		this.mock(BaseContext).expects("hasChanged")
		.withExactArgs(sinon.match.same(oV2Context), "~oldElementContext")
			.returns(true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason: ChangeReason.Context}, "~bForceRefresh", "~bUpdated");

		// code under test - call back handler is called with a V2 context
		oExpectation.args[0][3](oV2Context);

		assert.strictEqual(oBinding.oElementContext, oV2Context);

		// code under test - getBoundContext returns V2 Context
		oBoundContext = ODataContextBinding.prototype.getBoundContext.call(oBinding);

		assert.strictEqual(oBoundContext, oV2Context);
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
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

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
			.withExactArgs({ reason: ChangeReason.Context });

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
	});

	//*********************************************************************************************
	QUnit.test("setContext: context is transient", function (assert) {
		var oBinding = {
				oContext : "~context",
				oElementContext : "~oOldElementContext",
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
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

		// code under test
		ODataContextBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding), null);
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
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Context});

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
				bCreatePreliminaryContext: true,
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
				sPath: "~oBindingContextPath"
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
			.withExactArgs({reason: ChangeReason.Context}, false);
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
			.withExactArgs({reason: ChangeReason.Context}, false, false);

		// code under test - call callback handler with a V2 context
		oExpectation.callArgWith(3, "~oV2Context");

		assert.strictEqual(ODataContextBinding.prototype.getBoundContext.call(oBinding),
			"~oV2Context");
	});
});
});