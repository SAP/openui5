/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataTreeBinding",
	"sap/ui/model/Sorter",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, Context, Filter, CountMode, OperationMode, ODataTreeBinding, Sorter,
		TestUtils) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataTreeBinding (ODataTreeBindingNoFakeService)", {
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
	QUnit.test("constructor: all parameters set", function (assert) {
		var aApplicationFilters = [new Filter("propertyPath", "GE", "foo")],
			oBinding,
			oContext = {},
			oModel = {
				checkFilterOperation : function () {},
				bPreliminaryContext : "bPreliminaryContextFromModel"
			},
			mParameters = {
				countMode : "CountMode",
				groupId : "group",
				numberOfExpandedLevels : 42,
				operationMode : OperationMode.Client,
				rootLevel : 23,
				threshold : 77,
				usePreliminaryContext : "bUsePreliminaryContext",
				useServersideApplicationFilters : "bUseServersideApplicationFilters"
			},
			aSorters = [new Sorter("propertyPath")];

		this.mock(oModel).expects("checkFilterOperation")
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
	});


	//*********************************************************************************************
	QUnit.test("constructor: with single Filter object", function (assert) {
		var oApplicationFilter = new Filter("propertyPath", "GE", "foo"),
			oBinding,
			oContext = {},
			oModel = {
				checkFilterOperation : function () {}
			},
			oModelMock = this.mock(oModel),
			oNotAFilter = {/*not a Filter*/};

		oModelMock.expects("checkFilterOperation").withExactArgs([oApplicationFilter]);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, oApplicationFilter);

		assert.deepEqual(oBinding.aApplicationFilters, [oApplicationFilter]);

		oModelMock.expects("checkFilterOperation").withExactArgs(sinon.match.same(oNotAFilter));

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, oNotAFilter);

		assert.deepEqual(oBinding.aApplicationFilters, oNotAFilter);
	});

	//*********************************************************************************************
	QUnit.test("constructor: parameter defaulting, logging", function (assert) {
		var oBinding,
			oContext = {},
			oModel = {
				checkFilterOperation : function () {},
				sDefaultCountMode : "ModelDefaultCountMode",
				sDefaultOperationMode : OperationMode.Default,
				bPreliminaryContext : "bPreliminaryContext"
			},
			oModelMock = this.mock(oModel);

		oModelMock.expects("checkFilterOperation").withExactArgs(undefined);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext);

		assert.deepEqual(oBinding.aSorters, []);
		//TODO why not [] as default for aApplicationFilters like in TreeBinding?
		assert.strictEqual(oBinding.aApplicationFilters, undefined);
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

		oModelMock.expects("checkFilterOperation").withExactArgs(undefined);

		// code under test
		oBinding = new ODataTreeBinding(oModel, "path", oContext, undefined,
			{batchGroupId : "group"});

		assert.strictEqual(oBinding.sGroupId, "group");

		oModelMock.expects("checkFilterOperation").withExactArgs(undefined);
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
}].forEach(function (oFixture) {
	var sDetails = "preliminary context:" + oFixture.bIsPreliminary
			+ ", use preliminary context:" + oFixture.bUsePreliminary
			+ ", context updated:" + oFixture.bIsUpdated
			+ ", same context:" + oFixture.bSameContext;

	QUnit.test("setContext: context changed, relative, resolved, " + sDetails, function (assert) {
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
			oNewContextMock = this.mock(oNewContext);

		oNewContextMock.expects("isPreliminary").withExactArgs().returns(oFixture.bIsPreliminary);
		oNewContextMock.expects("isUpdated").withExactArgs().returns(oFixture.bIsUpdated);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(oFixture.bSameContext ? oNewContext : "oContext",
				sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("sResolvedPath");
		oBindingMock.expects("resetData").withExactArgs();
		oBindingMock.expects("_initialize").withExactArgs();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

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
				resetData : function () {},
				oKeys : {
					"~nodeKeys" : ["~changedEntityKey"]
				}
			},
			bExpectChange = !mChangedEntities || mChangedEntities["~changedEntityKey"];

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
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~resolvedPath", sinon.match.object.and(sinon.match.has("groupId"))
				.and(sinon.match.has("success")).and(sinon.match.has("error")))
			.returns("~readHandler");

		// code under test
		ODataTreeBinding.prototype._loadSingleRootNodeByNavigationProperties.call(oBinding,
			/*sNodeId*/ undefined, "~requestKey");

		assert.strictEqual(oBinding.mRequestHandles["~requestKey"], "~readHandler");
	});
});