/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/FilterType",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataTreeBinding",
	"sap/ui/model/Sorter"
], function (Log, ChangeReason, Context, Filter, FilterProcessor, FilterType, CountMode, OperationMode,
		ODataTreeBinding, Sorter) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataTreeBinding (ODataTreeBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor: all parameters set", function (assert) {
		var aApplicationFilters = [new Filter("propertyPath", "GE", "foo")],
			oBinding,
			oContext = {},
			oModel = {
				checkFilter : function () {},
				bPreliminaryContext : "bPreliminaryContextFromModel"
			},
			mParameters = {
				countMode : "CountMode",
				groupId : "group",
				numberOfExpandedLevels : 42,
				operationMode : OperationMode.Client,
				rootLevel : 23,
				threshold : 77,
				transitionMessagesOnly : "truthy",
				usePreliminaryContext : "bUsePreliminaryContext",
				useServersideApplicationFilters : "bUseServersideApplicationFilters"
			},
			aSorters = [new Sorter("propertyPath")];

		this.mock(oModel).expects("checkFilter")
			.withExactArgs(sinon.match.same(aApplicationFilters));

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, aApplicationFilters, mParameters,
			aSorters);

		assert.strictEqual(oBinding.getModel(), oModel);
		assert.strictEqual(oBinding.getPath(), "path");
		assert.strictEqual(oBinding.getContext(), oContext);
		assert.deepEqual(oBinding.aFilters, []);
		assert.deepEqual(oBinding.aApplicationFilters, aApplicationFilters);
		assert.strictEqual(oBinding.mParameters, mParameters);
		assert.deepEqual(oBinding.aSorters, aSorters);
		assert.deepEqual(oBinding.oFinalLengths, {});
		assert.deepEqual(oBinding.oLengths, {});
		assert.deepEqual(oBinding.oKeys, {});
		assert.strictEqual(oBinding.bNeedsUpdate, false);
		assert.strictEqual(oBinding._bRootMissing, false);
		assert.strictEqual(oBinding.bSkipDataEvents, false);
		assert.strictEqual(oBinding.sFilterParams, "");
		assert.deepEqual(oBinding.mNormalizeCache, {});
		assert.deepEqual(oBinding.mRequestHandles, {});
		assert.strictEqual(oBinding.oRootContext, null);
		assert.strictEqual(oBinding.bInitial, true);
		assert.deepEqual(oBinding._mLoadedSections, {});
		assert.strictEqual(oBinding._iPageSize, 0);
		assert.strictEqual(oBinding.bClientOperation, true);
		assert.strictEqual(oBinding.bThresholdRejected, false);
		assert.strictEqual(oBinding.iTotalCollectionCount, null);
		assert.strictEqual(oBinding.oAllKeys, null);
		assert.strictEqual(oBinding.oAllLengths, null);
		assert.strictEqual(oBinding.oAllFinalLengths, null);
		assert.strictEqual(oBinding.bRefresh, false);

		// parameters
		assert.strictEqual(oBinding.iNumberOfExpandedLevels, 42);
		assert.strictEqual(oBinding.iRootLevel, 23);
		assert.strictEqual(oBinding.sCountMode, "CountMode");
		assert.strictEqual(oBinding.sGroupId, "group");
		assert.strictEqual(oBinding.sOperationMode, OperationMode.Client);
		assert.strictEqual(oBinding.iThreshold, 77);
		assert.strictEqual(oBinding.bUseServersideApplicationFilters,
			"bUseServersideApplicationFilters");
		assert.strictEqual(oBinding.bUsePreliminaryContext, "bUsePreliminaryContext");
		assert.strictEqual(oBinding.bTransitionMessagesOnly, true);
	});

	//*********************************************************************************************
	QUnit.test("constructor: with single Filter object", function (assert) {
		var oApplicationFilter = new Filter("propertyPath", "GE", "foo"),
			oBinding,
			oContext = {},
			oModel = {
				checkFilter : function () {}
			},
			oModelMock = this.mock(oModel),
			oNotAFilter = {/*not a Filter*/};

		oModelMock.expects("checkFilter").withExactArgs([oApplicationFilter]);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, oApplicationFilter);

		assert.deepEqual(oBinding.aApplicationFilters, [oApplicationFilter]);

		oModelMock.expects("checkFilter").withExactArgs(sinon.match.same(oNotAFilter));

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, oNotAFilter);

		assert.deepEqual(oBinding.aApplicationFilters, oNotAFilter);
	});

	//*********************************************************************************************
	QUnit.test("constructor: multiple Application filters are grouped", function (assert) {
		var oBinding,
			aFilters = ["~filter0", "~filter1"],
			oModel = {checkFilter: function () {}};

		this.mock(FilterProcessor).expects("groupFilters")
			.withExactArgs(sinon.match.same(aFilters))
			.returns("~groupedFilters");
		this.mock(oModel).expects("checkFilter").withExactArgs(["~groupedFilters"]);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", /*oContext*/{}, aFilters);

		assert.deepEqual(oBinding.aApplicationFilters, ["~groupedFilters"]);
	});

	//*********************************************************************************************
	QUnit.test("constructor: parameter defaulting, logging", function (assert) {
		var oBinding,
			oContext = {},
			oModel = {
				checkFilter : function () {},
				sDefaultCountMode : "ModelDefaultCountMode",
				sDefaultOperationMode : OperationMode.Default,
				bPreliminaryContext : "bPreliminaryContext"
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("checkFilter").withExactArgs([]);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext);

		assert.deepEqual(oBinding.aSorters, []);
		assert.deepEqual(oBinding.aApplicationFilters, []);
		assert.strictEqual(oBinding.bClientOperation, false);

		// parameters
		assert.strictEqual(oBinding.iNumberOfExpandedLevels, 0);
		assert.strictEqual(oBinding.iRootLevel, 0);
		assert.strictEqual(oBinding.sCountMode, "ModelDefaultCountMode");
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.sOperationMode, OperationMode.Server);
		assert.strictEqual(oBinding.iThreshold, 0);
		assert.strictEqual(oBinding.bUseServersideApplicationFilters, false);
		assert.strictEqual(oBinding.bUsePreliminaryContext, "bPreliminaryContext");
		assert.strictEqual(oBinding.bTransitionMessagesOnly, false);

		oModelMock.expects("checkFilter").withExactArgs([]);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, undefined,
			{batchGroupId : "group"});

		assert.strictEqual(oBinding.sGroupId, "group");

		oModelMock.expects("checkFilter").withExactArgs([]);
		this.oLogMock.expects("fatal").withExactArgs("To use an ODataTreeBinding at least "
			+ "one CountMode must be supported by the service!");

		// code under test - logging
		oBinding = new ODataTreeBinding(oModel, "path", oContext, undefined,
			{countMode : CountMode.None});

		assert.strictEqual(oBinding.sCountMode, CountMode.None);
	});

	//*********************************************************************************************
	QUnit.test("setContext: context unchanged", function (assert) {
		var oBinding = {
				oContext : "oContext",
				_fireChange : function () {}
			},
			oNewContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oNewContextMock = this.mock(oNewContext);

		oNewContextMock.expects("isPreliminary").returns(false);
		oNewContextMock.expects("isUpdated").returns(false);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("oContext", sinon.match.same(oNewContext))
			.returns(false);
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, "oContext");
	});

	//*********************************************************************************************
	QUnit.test("setContext: context undefined, unchanged", function (assert) {
		var oBinding = {};

		this.mock(Context).expects("hasChanged")
			.withExactArgs(undefined, undefined)
			.returns(false);

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, undefined);

		assert.strictEqual(oBinding.oContext, undefined);
	});

	//*********************************************************************************************
	QUnit.test("setContext: context changed, absolute", function (assert) {
		var oBinding = {
				oContext : "oContext",
				isRelative : function () {}
			},
			oNewContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oNewContextMock = this.mock(oNewContext);

		oNewContextMock.expects("isPreliminary").returns(false);
		oNewContextMock.expects("isUpdated").returns(false);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("oContext", sinon.match.same(oNewContext))
			.returns(true);
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
	});

	//*********************************************************************************************
[{
	bIsPreliminary : true,
	bIsUpdated : false,
	bSameContext : false,
	bUsePreliminary : true
}, {
	bIsPreliminary : false,
	bIsUpdated : false,
	bSameContext : false,
	bUsePreliminary : false
}, {
	bIsPreliminary : false,
	bIsUpdated : false,
	bSameContext : true,
	bUsePreliminary : true
}, {
	bIsPreliminary : false,
	bIsUpdated : true,
	bSameContext : false,
	bUsePreliminary : true
}, {
	bIsPreliminary : false,
	bIsUpdated : true,
	bSameContext : true,
	bUsePreliminary : false
}].forEach(function (oFixture, i) {
	QUnit.test("setContext: context changed, relative, resolved, " + i, function (assert) {
		var oNewContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oBinding = {
				oContext : oFixture.bSameContext ? oNewContext : "oContext",
				_fireChange : function () {},
				_initialize : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				resetData : function () {},
				bUsePreliminaryContext : oFixture.bUsePreliminary
			},
			oBindingMock = this.mock(oBinding),
			oExpectation,
			oNewContextMock = this.mock(oNewContext);

		oNewContextMock.expects("isPreliminary").withExactArgs().returns(oFixture.bIsPreliminary);
		oNewContextMock.expects("isUpdated").withExactArgs().returns(oFixture.bIsUpdated);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(oFixture.bSameContext ? oNewContext : "oContext",
				sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("sResolvedPath");
		oBindingMock.expects("resetData").withExactArgs();
		oExpectation = oBindingMock.expects("_initialize").withExactArgs(sinon.match.func);
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Context})
			.on(oBinding);
		oExpectation.callsArgOn(0, oBinding);

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
	});
});

	//*********************************************************************************************
[undefined, "oAllKeys", "oKeys", "_aNodes"].forEach(function (sProperty, i) {
	QUnit.test("setContext: context changed, relative, unresolved, " + i, function (assert) {
		var oBinding = {
				oContext : "oContext",
				_fireChange : function () {},
				_initialize : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				resetData : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oNewContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			},
			oNewContextMock = this.mock(oNewContext);

		if (sProperty) {
			oBinding[sProperty] = /*non-empty object*/{foo : "bar"};
		}

		oNewContextMock.expects("isPreliminary").withExactArgs().returns(false);
		oNewContextMock.expects("isUpdated").withExactArgs().returns(false);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("oContext", sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		oBindingMock.expects("resetData").exactly(sProperty ? 1 : 0).withExactArgs();
		oBindingMock.expects("_fireChange").exactly(sProperty ? 1 : 0)
			.withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: preliminary context, not used", function (assert) {
		var oBinding = {
				oContext : "oContext",
				_fireChange : function () {},
				bUsePreliminaryContext : false
			},
			oNewContext = {
				isPreliminary : function () {}
			};

		this.mock(oNewContext).expects("isPreliminary").returns(true);
		this.mock(Context).expects("hasChanged").never();
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, "oContext", "context unchanged");
	});

	//*********************************************************************************************
	QUnit.test("setContext: context is no longer preliminary and updated", function (assert) {
		var oBinding = {
				_fireChange : function () {},
				bUsePreliminaryContext : true
			},
			oNewContext = {
				isPreliminary : function () {},
				isUpdated : function () {}
			};

		oBinding.oContext = oNewContext;

		this.mock(oNewContext).expects("isPreliminary").returns(false);
		this.mock(oNewContext).expects("isUpdated").returns(true);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Context});
		this.mock(Context).expects("hasChanged").never();

		// code under test
		ODataTreeBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext, "context unchanged");
	});

	//*********************************************************************************************
[{"~changedEntityKey" : true}, {Foo : true}, {}, undefined].forEach(function (mChangedEntities, i) {
	QUnit.test("_refresh: test with given mChangedEntities: " + i, function (assert) {
		var oBinding = {
				_hasChangedEntity : function () {},
				_fireRefresh : function () {},
				_isRefreshAfterChangeAllowed : function () {},
				resetData : function () {}
			},
			bExpectChange = !mChangedEntities || mChangedEntities["~changedEntityKey"];

		this.mock(oBinding).expects("_isRefreshAfterChangeAllowed")
			.withExactArgs()
			.exactly(mChangedEntities ? 1 : 0)
			.returns(true);
		this.mock(oBinding).expects("_hasChangedEntity")
			.withExactArgs(mChangedEntities)
			.returns(bExpectChange ? true : false)
			.exactly(mChangedEntities ? 1 : 0);
		this.mock(oBinding).expects("resetData").exactly(bExpectChange ? 1 : 0);
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason: ChangeReason.Refresh})
			.exactly(bExpectChange ? 1 : 0);

		// code under test
		ODataTreeBinding.prototype._refresh.call(oBinding, /*bForceUpdate*/undefined,
			mChangedEntities, /*mEntityTypes*/undefined);

		assert.strictEqual(oBinding.bNeedsUpdate, bExpectChange ? false : undefined);
		assert.strictEqual(oBinding.bRefresh, bExpectChange ? true : undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("_refresh: don't check _hasChangedEntity if refreshAfterChange is not allowed",
			function (assert) {
		var oBinding = {
				_hasChangedEntity : function () {},
				_fireRefresh : function () {},
				_isRefreshAfterChangeAllowed : function () {},
				resetData : function () {}
			};

		this.mock(oBinding).expects("_isRefreshAfterChangeAllowed").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasChangedEntity").never();
		this.mock(oBinding).expects("resetData").never();
		this.mock(oBinding).expects("_fireRefresh").never();

		// code under test
		ODataTreeBinding.prototype._refresh.call(oBinding, /*bForceUpdate*/undefined,
			"~mChangedEntities", /*mEntityTypes*/undefined);

		assert.strictEqual(oBinding.bNeedsUpdate, undefined);
		assert.strictEqual(oBinding.bRefresh, undefined);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: uses getResolvedPath", function (assert) {
		var oBinding = {
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBinding.prototype._refresh.call(oBinding, /*bForceUpdate*/undefined,
			/*mChangedEntities*/undefined, "~mEntityTypes");
	});

	//*********************************************************************************************
[{"~changedEntityKey" : true}, {Foo : true}, {}].forEach(function (mChangedEntities, i) {
	QUnit.test("_hasChangedEntity: " + i, function (assert) {
		var oBinding = {
				oKeys : {
					"foo" : ["baz", "bar"],
					"~nodeKeys" : ["foobar", "~changedEntityKey"]
				}
			},
			bExpectChange = mChangedEntities["~changedEntityKey"],
			bResult;

		// code under test
		bResult = ODataTreeBinding.prototype._hasChangedEntity.call(oBinding, mChangedEntities);

		assert.strictEqual(bResult, bExpectChange ? true : false);
	});
});

	//*********************************************************************************************
["~resolvedPath", undefined].forEach(function (sResolvedPath, i) {
	QUnit.test("getDownloadUrl: getResolvedPath is called, " + i, function (assert) {
		var oBinding = {
				oModel : {_createRequestUrl : function () {}},
				getFilterParams : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getFilterParams").withExactArgs().returns(undefined);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(sResolvedPath);
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs(sResolvedPath, null, [])
			.exactly(sResolvedPath ? 1 : 0)
			.returns("~requestUrl");

		// code under test
		assert.strictEqual(ODataTreeBinding.prototype.getDownloadUrl.call(oBinding),
			sResolvedPath ? "~requestUrl" : undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("_getEntityType: getResolvedPath is called", function (assert) {
		var oBinding = {
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBinding.prototype._getEntityType.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_loadSingleRootNodeByNavigationProperties: no resolved path", function (assert) {
		var oBinding = {
				mRequestHandles : {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_loadSingleRootNodeByNavigationProperties: with resolved path", function (assert) {
		var oBinding = {
				oModel : {read : function () {}},
				mRequestHandles : {},
				_getHeaders() {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~resolvedPath", sinon.match.object.and(sinon.match.has("groupId"))
				.and(sinon.match.has("success")).and(sinon.match.has("error")))
			.returns("~readHandler");

		// code under test
		ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties.call(oBinding,
			/*sNodeId*/ undefined, "~requestKey");

		assert.strictEqual(oBinding.mRequestHandles["~requestKey"], "~readHandler");
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: initial", function (assert) {
		var oBinding = {
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(true);

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, /*iStartIndex*/ undefined,
				/*iLength*/undefined, /*iThreshold*/undefined),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: returns V2 Contexts with tree annotations", function (assert) {
		var oBinding = {
				bHasTreeAnnotations : true,
				_getContextsForNodeId : function () {},
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getContextsForNodeId")
			.withExactArgs(null, "~iStartIndex", "~ilength", "~iThreshold")
			.returns("~V2Context[]");

		// code under test
		assert.strictEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, "~iStartIndex", "~ilength",
				"~iThreshold"),
			"~V2Context[]");

		assert.strictEqual(oBinding.bDisplayRootNode, true);
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: returns existing single V2 root context", function (assert) {
		var oModel = {
				isList : function () {}
			},
			oBinding = {
				bDisplayRootNode : true, //TODO: how can this be set initially
				oModel : oModel,
				sPath : "~sPath",
				// oRootContext is only set in _loadSingleRootNodeByNavigationProperties with an
				// OData V2 context instance
				oRootContext : "~V2RootContext",
				getContext : function () {},
				getResolvedPath : function () {},
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("getContext").withExactArgs().returns("~oContext");
		this.mock(oModel).expects("isList").withExactArgs("~sPath", "~oContext").returns(false);

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, "~iStartIndex", "~ilength",
				"~iThreshold"),
			["~V2RootContext"]);
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: missing root", function (assert) {
		var oModel = {
				isList : function () {}
			},
			oBinding = {
				_bRootMissing : true,
				bDisplayRootNode : true, //TODO: how can this be set initially
				oModel : oModel,
				sPath : "~sPath",
				getContext : function () {},
				getResolvedPath : function () {},
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("getContext").withExactArgs().returns("~oContext");
		this.mock(oModel).expects("isList").withExactArgs("~sPath", "~oContext").returns(false);

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, "~iStartIndex", "~ilength",
				"~iThreshold"),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: calls _loadSingleRootNodeByNavigationProperties and returns []",
			function (assert) {
		var oModel = {
				isList : function () {}
			},
			oBinding = {
				_iPageSize : "~iPageSize",
				bDisplayRootNode : true, //TODO: how can this be set initially
				oModel : oModel,
				sPath : "~sPath",
				_loadSingleRootNodeByNavigationProperties : function () {},
				getContext : function () {},
				getResolvedPath : function () {},
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("getContext").withExactArgs().returns("~oContext");
		this.mock(oModel).expects("isList").withExactArgs("~sPath", "~oContext").returns(false);
		this.mock(oBinding).expects("_loadSingleRootNodeByNavigationProperties")
			.withExactArgs("~resolvedPath", "null-~iStartIndex-~iPageSize-~iThreshold");

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, "~iStartIndex", "~ilength",
				"~iThreshold"),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getRootContexts: returns V2 Contexts without tree annotations", function (assert) {
		var oModel = {
				isList : function () {}
			},
			oBinding = {
				_iPageSize : "~iPageSize",
				oModel : oModel,
				iNumberOfExpandedLevels : "~iNumberOfExpandedLevels",
				sPath : "~sPath",
				_getContextsForNodeId : function () {},
				_getNavPath : function () {},
				getContext : function () {},
				getPath : function () {},
				getResolvedPath : function () {},
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("getContext").withExactArgs().returns("~oContext");
		this.mock(oModel).expects("isList").withExactArgs("~sPath", "~oContext").returns(false);
		this.mock(oBinding).expects("getPath").withExactArgs().returns("~getPath");
		this.mock(oBinding).expects("_getNavPath").withExactArgs("~getPath").returns("~navPath");
		this.mock(oBinding).expects("_getContextsForNodeId")
			.withExactArgs("~resolvedPath/~navPath", "~iStartIndex", "~ilength", "~iThreshold", {
				navPath : "~navPath",
				numberOfExpandedLevels : "~iNumberOfExpandedLevels"
			})
			.returns("~V2Context[]");

		// code under test
		assert.strictEqual(
			ODataTreeBinding.prototype.getRootContexts.call(oBinding, "~iStartIndex", "~ilength",
				"~iThreshold"),
			"~V2Context[]");
	});

	//*********************************************************************************************
	QUnit.test("_loadSingleRootNodeByNavigationProperties: success handler sets V2 Context as root"
			+ " context", function (assert) {
		var oModel = {
				_getKey : function () {},
				callAfterUpdate : function () {},
				getContext : function () {},
				read : function () {}
			},
			oBinding = {
				sGroupId : "~sGroupId",
				oModel : oModel,
				_getHeaders() {},
				_getNavPath : function () {},
				_processODataObject : function () {},
				getPath : function () {},
				mRequestHandles : {},
				getResolvedPath : function () {}
			},
			oExpectation,
			oV2Context = {
				getObject : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		oExpectation = this.mock(oModel).expects("read").withExactArgs("~resolvedPath", {
			error : sinon.match.func, groupId : "~sGroupId", headers : "~headers", success : sinon.match.func
		}).returns("~readHandle");

		// code under test
		ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties.call(oBinding,
			"~sNodeId", "~sRequestKey");

		assert.strictEqual(oBinding.mRequestHandles["~sRequestKey"], "~readHandle");

		this.mock(oBinding).expects("getPath").withExactArgs().returns("~getPath");
		this.mock(oBinding).expects("_getNavPath").withExactArgs("~getPath").returns("~navPath");
		this.mock(oModel).expects("_getKey").withExactArgs("~oData").returns("~key");
		this.mock(oModel).expects("getContext").withExactArgs("/~key").returns(oV2Context);
		this.mock(oV2Context).expects("getObject").withExactArgs().returns("~object");
		this.mock(oBinding).expects("_processODataObject")
			.withExactArgs("~object", "~sNodeId", "~navPath");
		this.mock(oModel).expects("callAfterUpdate").withExactArgs(sinon.match.func);

		// code under test
		oExpectation.args[0][1].success("~oData");

		assert.strictEqual(oBinding.oRootContext, oV2Context);
		assert.strictEqual(oBinding.bNeedsUpdate, true);
		assert.notOk(oBinding.mRequestHandles.hasOwnProperty("~sRequestKey"));
	});

	//*********************************************************************************************
	QUnit.test("_loadSingleRootNodeByNavigationProperties: error handler sets _bRootMissing to"
			+ " true", function (assert) {
		var oModel = {
				read : function () {}
			},
			oBinding = {
				sGroupId : "~sGroupId",
				oModel : oModel,
				oRootContext : "~oldRootContext",
				mRequestHandles : {},
				_getHeaders() {},
				fireDataReceived : function () {},
				getResolvedPath : function () {}
			},
			oError = {statusCode : 400},
			oExpectation;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		oExpectation = this.mock(oModel).expects("read").withExactArgs("~resolvedPath", {
			error : sinon.match.func, groupId : "~sGroupId", headers : "~headers", success : sinon.match.func
		}).returns("~readHandle");

		// code under test
		ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties.call(oBinding,
			"~sNodeId", "~sRequestKey");

		assert.strictEqual(oBinding.mRequestHandles["~sRequestKey"], "~readHandle");

		// code under test
		oExpectation.args[0][1].error(oError);

		assert.strictEqual(oBinding._bRootMissing, true);
		assert.strictEqual(oBinding.bNeedsUpdate, true);
		assert.strictEqual(oBinding.oRootContext, "~oldRootContext"); //TODO: not modified, why?
		assert.notOk(oBinding.mRequestHandles.hasOwnProperty("~sRequestKey"));
	});

	//*********************************************************************************************
	QUnit.test("getNodeContexts: initial", function (assert) {
		var oBinding = {
				isInitial : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(true);

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getNodeContexts.call(oBinding, /*oContext*/ undefined,
				/*iStartIndex*/ undefined, /*iLength*/undefined, /*iThreshold*/undefined),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getNodeContexts: with neither tree annotations nor navigation path",
			function (assert) {
		var oBinding = {
				bHasTreeAnnotations : false,
				isInitial : function () {},
				_getNavPath : function () {}
			},
			oContext = {
				getPath : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~getPath");
		this.mock(oBinding).expects("_getNavPath").withExactArgs("~getPath").returns(undefined);

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype.getNodeContexts.call(oBinding, oContext,
				/*iStartIndex*/ undefined, /*iLength*/undefined, /*iThreshold*/undefined),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("getNodeContexts: with navigation path and without tree annotations",
			function (assert) {
		var oModel = {
				resolve : function () {}
			},
			oBinding = {
				bHasTreeAnnotations : false,
				oModel : oModel,
				oNavigationPaths : {"~navPath" : "~foo"},
				isInitial : function () {},
				_getContextsForNodeId : function () {},
				_getNavPath : function () {}
			},
			oContext = {
				getPath : function () {}
			};

		this.mock(oBinding).expects("isInitial").withExactArgs().returns(false);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~getPath");
		this.mock(oBinding).expects("_getNavPath").withExactArgs("~getPath").returns("~navPath");
		this.mock(oModel).expects("resolve").withExactArgs("~navPath", sinon.match.same(oContext))
			.returns("~resolvedPath");
		this.mock(oBinding).expects("_getContextsForNodeId")
			.withExactArgs("~resolvedPath", "~iStartIndex", "~ilength", "~iThreshold", {
				navPath : "~foo"
			})
			.returns("~V2Context[]");

		// code under test
		assert.strictEqual(
			ODataTreeBinding.prototype.getNodeContexts.call(oBinding, oContext, "~iStartIndex",
				"~ilength", "~iThreshold"),
			"~V2Context[]");
	});
	/** @deprecated As of version 1.102.0, reason OperationMode.Auto */
	QUnit.test("_getContextsForNodeId: with operation mode 'Auto' and without"
			+ " iTotalCollectionCount", function (assert) {
		var oBinding = {
				bCollectionCountRequested : true,
				sOperationMode : OperationMode.Auto,
				iTotalCollectionCount : null
			};

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype._getContextsForNodeId.call(oBinding, "~sNodeId",
					"~iStartIndex", "~iLength", "~iThreshold", "~mRequestParameters"),
				[]);
	});

	//*********************************************************************************************
	QUnit.test("_getContextsForNodeId: no keys for node ID available", function (assert) {
		var oModel = {
				getServiceMetadata : function () {}
			},
			oBinding = {
				_mLoadedSections : {"~sNodeId" : [{length : 100, startIndex : 0}]},
				_iPageSize : 50,
				oFinalLengths : {},
				oKeys : {},
				oModel : oModel,
				sOperationMode : OperationMode.Default
			};

		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns({/*not relevant*/});

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype._getContextsForNodeId.call(oBinding, "~sNodeId",
					/*iStartIndex*/0, /*iLength*/20, /*iThreshold*/100, "~mRequestParameters"),
				[]);
	});

	//*********************************************************************************************
	QUnit.test("_getContextsForNodeId: node ID available", function (assert) {
		var oModel = {
				getContext() {},
				getServiceMetadata() {},
				resolveDeep() {}
			},
			oBinding = {
				_mLoadedSections : {},
				_iPageSize : 50,
				bClientOperation : true,
				oContext : "~oContext",
				oFinalLengths : {},
				oKeys : {"~sNodeId" : ["~sKey(id='0')", undefined]},
				oLengths : {"~sNodeId" : 2},
				oModel : oModel,
				sOperationMode : OperationMode.Default,
				sPath : "~sPath"
			};

		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns({/*not relevant*/});
		// SNOW: CS20230006644418
		this.mock(oModel).expects("resolveDeep").withExactArgs("~sPath", "~oContext").returns("~sDeepPath");
		this.mock(oModel).expects("getContext").withExactArgs("/~sKey(id='0')", "~sDeepPath(id='0')")
			.returns("~V2Context");

		// code under test
		assert.deepEqual(
			ODataTreeBinding.prototype._getContextsForNodeId.call(oBinding, "~sNodeId",
					/*iStartIndex*/0, /*iLength*/20, /*iThreshold*/100, "~mRequestParameters"),
				["~V2Context", undefined]);
	});

	//*********************************************************************************************
	QUnit.test("initialize", function (assert) {
		var oModel = {
				oMetadata : {isLoaded : function () {}}
			},
			oBinding = {
				_fireRefresh : function () {},
				bInitial : true,
				_initialize : function () {},
				isResolved : function () {},
				oModel : oModel
			},
			oBindingMock = this.mock(oBinding),
			oExpectation,
			oMetadataMock = this.mock(oModel.oMetadata);

		oMetadataMock.expects("isLoaded").returns(false);

		// code under test: metadata not loaded
		assert.strictEqual(ODataTreeBinding.prototype.initialize.call(oBinding), oBinding);

		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(false);
		oBindingMock.expects("_fireRefresh").withExactArgs({reason : ChangeReason.Refresh});

		// code under test: metadata loaded, unresolved binding
		assert.strictEqual(ODataTreeBinding.prototype.initialize.call(oBinding), oBinding);

		oMetadataMock.expects("isLoaded").withExactArgs().returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oExpectation = oBindingMock.expects("_initialize").withExactArgs(sinon.match.func);
		oBindingMock.expects("_fireRefresh").withExactArgs({reason : ChangeReason.Refresh});
		oExpectation.callsArgOn(0, oBinding);

		// code under test: metadata loaded, resolved binding
		assert.strictEqual(ODataTreeBinding.prototype.initialize.call(oBinding), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_initialize", function (assert) {
		var oBinding = {
				_applyAdapter : function () {},
				_getEntityType : function () {},
				_hasTreeAnnotations : function () {},
				_processSelectParameters : function () {}
			},
			fnFireEvent = "~fnFireEvent";

		this.mock(oBinding).expects("_hasTreeAnnotations").withExactArgs()
			.returns("~bHasTreeAnnotations");
		this.mock(oBinding).expects("_getEntityType").withExactArgs()
			.returns("~oEntityType");
		this.mock(oBinding).expects("_processSelectParameters").withExactArgs();
		this.mock(oBinding).expects("_applyAdapter").withExactArgs(fnFireEvent);

		// code under test
		assert.strictEqual(ODataTreeBinding.prototype._initialize
			.call(oBinding , fnFireEvent), oBinding);

		assert.strictEqual(oBinding.bInitial, false);
		assert.strictEqual(oBinding.bHasTreeAnnotations, "~bHasTreeAnnotations");
		assert.strictEqual(oBinding.oEntityType, "~oEntityType");
	});

	//*********************************************************************************************
	QUnit.test("_applyAdapter: without tree annotations", function () {
		var oAdapter = {apply : function () {}},
			oBinding = {
				bHasTreeAnnotations : false,
				oNavigationPaths : {}
			},
			oEventProvider = {fnFireEvent : function () {}},
			oExpectation;

		oExpectation = this.mock(sap.ui).expects("require")
			.withExactArgs(["sap/ui/model/odata/ODataTreeBindingAdapter"], sinon.match.func);
		this.mock(oAdapter).expects("apply").withExactArgs(sinon.match.same(oBinding));
		this.mock(oEventProvider).expects("fnFireEvent").withExactArgs();
		oExpectation.callsArgWith(1, oAdapter);

		// code under test
		ODataTreeBinding.prototype._applyAdapter.call(oBinding, oEventProvider.fnFireEvent);
	});

	//*********************************************************************************************
[{
	sModuleName : "sap/ui/model/odata/ODataTreeBindingAdapter",
	oTreeProperties : {}
},{
	sModuleName : "sap/ui/model/odata/ODataTreeBindingFlat",
	sOperationMode : OperationMode.Server,
	oTreeProperties : {
		"hierarchy-node-descendant-count-for" : "foo"
	}
}].forEach(function (oFixture, i) {
	QUnit.test("_applyAdapter: with tree annotations, " + i, function () {
		var oAdapter = {apply : function () {}},
			oMetadata = {_getEntityTypeByPath : function () {}},
			oBinding = {
				getResolvedPath : function () {},
				bHasTreeAnnotations : true,
				oModel : {
					oMetadata : oMetadata
				},
				sOperationMode : oFixture.sOperationMode,
				mParameters : {},
				oTreeProperties : oFixture.oTreeProperties
			},
			oEntityType = {property : []},
			oEventProvider = {fnFireEvent : function () {}},
			oExpectation;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~resolvedPath")
			.returns(oEntityType);

		oExpectation = this.mock(sap.ui).expects("require")
			.withExactArgs([oFixture.sModuleName], sinon.match.func);
		this.mock(oAdapter).expects("apply").withExactArgs(sinon.match.same(oBinding));
		this.mock(oEventProvider).expects("fnFireEvent").withExactArgs();
		oExpectation.callsArgWith(1, oAdapter);

		// code under test
		ODataTreeBinding.prototype._applyAdapter.call(oBinding, oEventProvider.fnFireEvent);
	});
});

	//*********************************************************************************************
	QUnit.test("_applyAdapter: error case", function () {
		var oBinding = {bHasTreeAnnotations : false};

		this.oLogMock.expects("error").withExactArgs("Neither hierarchy annotations, "
				+ "nor navigation properties are specified to build the tree.",
			sinon.match.same(oBinding));
		this.mock(sap.ui).expects("require").never();

		// code under test
		ODataTreeBinding.prototype._applyAdapter.call(oBinding, function () {});
	});

	//*********************************************************************************************
	QUnit.test("_loadCompleteTreeWithAnnotations: add $top to URLParams", function (assert) {
		var oBinding = {
				sGroupId : "~groupId",
				oModel : {read : function () {}},
				mRequestHandles : {},
				bSkipDataEvents : true,
				aSorters : "~sorters",
				iTotalCollectionCount : "~count",
				_getHeaders() {},
				getResolvedPath : function () {}
			},
			aUrlParams = ["~custom"];

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~resolvedPath", {
				headers : "~headers",
				urlParameters : sinon.match.same(aUrlParams)
					.and(sinon.match(["~custom", "$top=~count"])),
				success : sinon.match.func,
				error : sinon.match.func,
				sorters : "~sorters",
				groupId : "~groupId"
			});

		// code under test
		ODataTreeBinding.prototype._loadCompleteTreeWithAnnotations.call(oBinding, aUrlParams);
	});

	//*********************************************************************************************
[null, 0].forEach(function (vTotalCollectionCount) {
	var sTitle = "_loadCompleteTreeWithAnnotations: don't add $top to URLParams: "
			+ "TotalCollectionCount = " + vTotalCollectionCount;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				sGroupId : "~groupId",
				oModel : {read : function () {}},
				mRequestHandles : {},
				bSkipDataEvents : true,
				aSorters : "~sorters",
				iTotalCollectionCount : vTotalCollectionCount,
				_getHeaders() {},
				getResolvedPath : function () {}
			},
			aUrlParams = ["~custom"];

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~resolvedPath", {
				headers : "~headers",
				urlParameters : sinon.match.same(aUrlParams)
					.and(sinon.match(["~custom"])),
				success : sinon.match.func,
				error : sinon.match.func,
				sorters : "~sorters",
				groupId : "~groupId"
			});

		// code under test
		ODataTreeBinding.prototype._loadCompleteTreeWithAnnotations.call(oBinding, aUrlParams);
	});
});

	//*********************************************************************************************
	QUnit.test("_isRefreshAfterChangeAllowed", function (assert) {
		// code under test
		assert.strictEqual(ODataTreeBinding.prototype._isRefreshAfterChangeAllowed(), true);
	});

	//*********************************************************************************************
[
	{filter: [], groupFilter: undefined, resultFilter: []},
	{filter: ["filter0"], groupFilter: undefined, resultFilter: ["filter0"]},
	{filter: ["filter0", "filter1"], groupFilter: "~groupedFilters", resultFilter: ["~groupedFilters"]}
].forEach(function (oFixture, i) {
	QUnit.test("filter: group filters of type Application #" + i, function (assert) {
		var oBinding = {
				aApplicationFilters: "~oldFilters",
				oModel: {checkFilter: function () {}},
				_fireRefresh: function () {},
				resetData: function () {}
			};

		this.mock(oBinding.oModel).expects("checkFilter").withExactArgs(oFixture.filter);
		this.mock(FilterProcessor).expects("groupFilters")
			.withExactArgs(sinon.match.same(oFixture.filter))
			.exactly(oFixture.groupFilter ? 1 : 0)
			.returns(oFixture.groupFilter);
		this.mock(oBinding).expects("resetData").withExactArgs();
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason: ChangeReason.Filter});

		// code under test
		ODataTreeBinding.prototype.filter.call(oBinding, oFixture.filter, FilterType.Application);

		assert.deepEqual(oBinding.aApplicationFilters, oFixture.resultFilter);
	});
});

	//*********************************************************************************************
	QUnit.test("getFilterInfo", function (assert) {
		var oGroupedApplicationFilter = {
				getAST : function () {}
			},
			oBinding = {
				aApplicationFilters : [oGroupedApplicationFilter]
			};

		this.mock(oGroupedApplicationFilter).expects("getAST")
			.withExactArgs("~bIncludeOrigin")
			.returns("~AST");

		// code under test
		assert.strictEqual(ODataTreeBinding.prototype.getFilterInfo.call(oBinding, "~bIncludeOrigin"), "~AST");

		oBinding.aApplicationFilters = [];

		// code under test
		assert.strictEqual(ODataTreeBinding.prototype.getFilterInfo.call(oBinding), null);
	});

	//*********************************************************************************************
	QUnit.test("getFilterInfo: integrative test", function (assert) {
		var oApplicationFilter = new Filter("propertyPath", "GE", "foo"),
			oBinding,
			oContext = {},
			oModel = {
				checkFilter : function () {}
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("checkFilter").withExactArgs([oApplicationFilter]);

		oBinding = new ODataTreeBinding(oModel, "path", oContext, oApplicationFilter);

		// code under test
		assert.deepEqual(oBinding.getFilterInfo(), {
			left: {path: "propertyPath", type: "Reference"},
			op: ">=",
			right: {type: "Literal", value: "foo"},
			type: "Binary"
		});
		assert.deepEqual(oBinding.aApplicationFilters, [oApplicationFilter]);

		oApplicationFilter = new Filter("propertyPath", "LE", "bar");
		oModelMock.expects("checkFilter").withExactArgs(oApplicationFilter);

		oBinding.filter(oApplicationFilter, FilterType.Application);

		// code under test
		assert.deepEqual(oBinding.getFilterInfo(), {
			left: {path: "propertyPath", type: "Reference"},
			op: "<=",
			right: {type: "Literal", value: "bar"},
			type: "Binary"
		});
		assert.deepEqual(oBinding.aApplicationFilters, [oApplicationFilter]);

		oModelMock.expects("checkFilter").withExactArgs(undefined);

		oBinding.filter(undefined, FilterType.Application);

		// code under test
		assert.deepEqual(oBinding.getFilterInfo(), null);
		assert.deepEqual(oBinding.aApplicationFilters, []);
	});

	//*********************************************************************************************
	QUnit.test("_loadSubTree: success case", function (assert) {
		var oLoadSubTreePromise, oReadExpectation,
			oBinding = {
				bHasTreeAnnotations: true,
				oModel: {
					callAfterUpdate: function () {},
					getKey: function () {},
					read: function () {}
				},
				mRequestHandles: {},
				bSkipDataEvents: true,
				aSorters: "~aSorters",
				_createKeyMap: function () {},
				_getHeaders() {},
				_importCompleteKeysHierarchy: function () {},
				_updateNodeKey: function () {},
				getResolvedPath: function () {}
			},
			oBindingMock = this.mock(oBinding),
			oData = {results: ["~oData"]},
			oModelMock = this.mock(oBinding.oModel),
			aParams = ["~sTreeBindingParams"];

		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		oBindingMock.expects("_getHeaders").withExactArgs().returns("~headers");
		oReadExpectation = oModelMock.expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: sinon.match.func,
				groupId: undefined,
				headers: "~headers",
				sorters: "~aSorters",
				success: sinon.match.func,
				urlParameters: sinon.match.same(aParams)
			})
			.returns("~oReadHandle");

		// code under test
		oLoadSubTreePromise = ODataTreeBinding.prototype._loadSubTree.call(oBinding, "~oNode", aParams);

		assert.deepEqual(oBinding.mRequestHandles, {"loadSubTree-~sTreeBindingParams": "~oReadHandle"});

		oModelMock.expects("getKey").withExactArgs("~oData").returns("~sParentKey");
		oBindingMock.expects("_updateNodeKey").withExactArgs("~oNode", "~sParentKey");
		oBindingMock.expects("_createKeyMap").withExactArgs(sinon.match.same(oData.results), true).returns("~mKeys");
		oBindingMock.expects("_importCompleteKeysHierarchy").withExactArgs("~mKeys");
		oModelMock.expects("callAfterUpdate").withExactArgs(sinon.match.func);

		// code under test
		oReadExpectation.args[0][1].success(oData);

		assert.deepEqual(oBinding.mRequestHandles, {});
		assert.deepEqual(oBinding.bNeedsUpdate, true);

		return oLoadSubTreePromise.then(function (oData0) {
			assert.strictEqual(oData0, oData);
		});
	});

	//*********************************************************************************************
	QUnit.test("_loadSubNodes: calls _getHeaders", function (assert) {
		const oBinding = {
			oFinalLengths: {"~sNodeId": 5},
			oModel: {
				read() {}
			},
			mRequestHandles: {},
			bSkipDataEvents: true,
			_getHeaders() {}
		};
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sNodeId", {
				error: sinon.match.func,
				groupId: undefined, // not relevant for this test
				headers: "~headers",
				sorters: undefined, // not relevant for this test
				success: sinon.match.func,
				urlParameters: "~aParams"
			})
			.returns("~oReadHandle");

		// code under test - start index, length and threshold are not relevant for this use case
		ODataTreeBinding.prototype._loadSubNodes.call(oBinding, "~sNodeId", /*iStartIndex*/undefined,
			/*iLength*/undefined, /*iThreshold*/undefined, "~aParams");

		assert.strictEqual(oBinding.bSkipDataEvents, false);
		assert.deepEqual(oBinding.mRequestHandles, {"~sNodeId-undefined-undefined-undefined": "~oReadHandle"});
	});
	/** @deprecated As of version 1.120.0, reason OperationMode.Auto */
	QUnit.test("_getCountForCollection: calls _getHeaders", function () {
		const oBinding = {
			sCountMode: CountMode.Inline,
			bHasTreeAnnotations: true,
			oModel: {
				read() {}
			},
			sOperationMode: OperationMode.Auto,
			_getHeaders() {},
			getResolvedPath() {}
		};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: sinon.match.func,
				groupId: undefined, // not relevant for this test
				headers: "~headers",
				success: sinon.match.func,
				urlParameters: ["$top=0", "$inlinecount=allpages"]
			});

		// code under test
		ODataTreeBinding.prototype._getCountForCollection.call(oBinding);
	});
	/** @deprecated As of version 1.120.0, reason OperationMode.Auto */
	QUnit.test("_getCountForCollection: don't call _getHeaders for $count request", function () {
		const oBinding = {
			sCountMode: CountMode.Request,
			bHasTreeAnnotations: true,
			oModel: {
				read() {}
			},
			sOperationMode: OperationMode.Auto,
			getResolvedPath() {}
		};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath/$count", {
				error: sinon.match.func,
				groupId: undefined, // not relevant for this test
				headers: undefined,
				success: sinon.match.func,
				urlParameters: []
			});

		// code under test
		ODataTreeBinding.prototype._getCountForCollection.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_getCountForNodeId: don't call _getHeaders for $count request", function () {
		const oBinding = {
			oModel: {
				read() {}
			},
			getFilterParams() {}
		};
		this.mock(oBinding).expects("getFilterParams").withExactArgs().returns(undefined);
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sNodeId/$count", {
				error: sinon.match.func,
				groupId: undefined, // not relevant for this test
				sorters: undefined, // not relevant for this test
				success: sinon.match.func,
				urlParameters: []
			});

		// code under test
		ODataTreeBinding.prototype._getCountForNodeId.call(oBinding, "~sNodeId");
	});

	//*********************************************************************************************
[
	{bTransitionMessagesOnly: true, result: {"sap-messages": "transientOnly"}},
	{bTransitionMessagesOnly: false, result: undefined}
].forEach((oFixture) => {
	QUnit.test("_getHeaders: bTransitionMessagesOnly=" + oFixture.bTransitionMessagesOnly, function (assert) {
		const oBinding = {
			bTransitionMessagesOnly: oFixture.bTransitionMessagesOnly
		};

		// code under test
		assert.deepEqual(ODataTreeBinding.prototype._getHeaders.call(oBinding), oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("_processODataObject", function (assert) {
		const oBinding = {
			oFinalLengths : {},
			oKeys : {},
			oLengths : {},
			_processODataObject() {},
			getModel() {}
		};
		const oModel = {_getObject() {}, getProperty() {}};
		this.mock(oBinding).expects("getModel").withExactArgs().returns(oModel);
		const aData = ["sRef"];
		this.mock(oModel).expects("_getObject").withExactArgs("sPath").returns(aData);
		this.mock(oModel).expects("getProperty").withExactArgs("/sRef").returns("~oObject");
		this.mock(oBinding).expects("_processODataObject").withExactArgs("~oObject", "/sRef/foo", "bar");

		// code under test
		ODataTreeBinding.prototype._processODataObject.call(oBinding, {"foo" : "baz"}, "sPath", "foo/bar");

		assert.strictEqual(oBinding.oKeys.sPath, aData);
		assert.strictEqual(oBinding.oLengths.sPath, aData.length);
		assert.strictEqual(oBinding.oFinalLengths.sPath, true);
	});
});