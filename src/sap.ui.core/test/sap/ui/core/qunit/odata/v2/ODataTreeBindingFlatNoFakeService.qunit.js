/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/_Helper",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/odata/ODataTreeBindingFlat"
], function (Log, _Helper, ChangeReason, Filter, TreeBinding, ODataTreeBindingFlat) {
	/*global QUnit,sinon*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataTreeBindingFlat";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataTreeBindingFlat (ODataTreeBindingFlatNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("ODataTreeBindingFlat: basic test", function (assert) {
		var oTreeBinding = new TreeBinding("model", "/path");

		// code under test
		ODataTreeBindingFlat.call(oTreeBinding);

		assert.deepEqual(oTreeBinding.mParameters, {});
		assert.strictEqual(oTreeBinding._iPageSize, 0);
		assert.deepEqual(oTreeBinding._aNodes, []);
		assert.deepEqual(oTreeBinding._aNodeCache, []);
		assert.deepEqual(oTreeBinding._aCollapsed, []);
		assert.deepEqual(oTreeBinding._aExpanded, []);
		assert.deepEqual(oTreeBinding._aRemoved, []);
		assert.deepEqual(oTreeBinding._aAdded, []);
		assert.deepEqual(oTreeBinding._aNodeChanges, []);
		assert.deepEqual(oTreeBinding._aAllChangedNodes, []);
		assert.deepEqual(oTreeBinding._mSubtreeHandles, {});
		assert.strictEqual(oTreeBinding._iLowestServerLevel, null);
		assert.deepEqual(oTreeBinding._aExpandedAfterSelectAll, []);
		assert.deepEqual(oTreeBinding._mSelected, {});
		assert.deepEqual(oTreeBinding._mDeselected, {});
		assert.strictEqual(oTreeBinding._bSelectAll, false);
		assert.strictEqual(oTreeBinding._iLengthDelta, 0);
		assert.strictEqual(oTreeBinding.bCollapseRecursive, true);
		assert.strictEqual(oTreeBinding._bIsAdapted, true);
		assert.strictEqual(oTreeBinding._bReadOnly, true);
		assert.deepEqual(oTreeBinding._aPendingRequests, []);
		assert.deepEqual(oTreeBinding._aPendingChildrenRequests, []);
		assert.deepEqual(oTreeBinding._aPendingSubtreeRequests, []);
		assert.strictEqual(oTreeBinding._bSubmitChangesCalled, false);
	});

	//*********************************************************************************************
[{Foo : true}, {}].forEach(function (mChangedEntities, i) {
		QUnit.test("_hasChangedEntity: no changes detected, " + i, function (assert) {
		var oBinding = {
				_map : function () {}
			},
			bResult;

		this.mock(oBinding).expects("_map").withExactArgs(sinon.match.func)
			.callsFake(function (fnMap) {
				var oRecursionBreaker = {broken : false};

				fnMap({key : "notMatched"}, oRecursionBreaker);
				fnMap(/*server index node not yet read*/undefined, oRecursionBreaker);
				assert.strictEqual(oRecursionBreaker.broken, false);
			});

		// code under test
		bResult = ODataTreeBindingFlat.prototype._hasChangedEntity.call(oBinding, mChangedEntities);

		assert.strictEqual(bResult, false);
	});
});

	//*********************************************************************************************
[{
	call0 : {bBrokenValue : true, sKey : "~changedEntityKey"}
}, {
	call0 : {bBrokenValue : false, sKey : "foo"},
	call1 : {bBrokenValue : true, sKey : "~changedEntityKey"}
}].forEach(function (oFixture, i) {
	QUnit.test("_hasChangedEntity: changes detected, " + i, function (assert) {
		var oBinding = {
				_map : function () {}
			},
			mChangedEntities = {"~changedEntityKey" : true},
			bResult;

		this.mock(oBinding).expects("_map").withExactArgs(sinon.match.func)
			.callsFake(function (fnMap) {
				var oRecursionBreaker = {broken : false};

				fnMap({key : oFixture.call0.sKey}, oRecursionBreaker);
				assert.strictEqual(oRecursionBreaker.broken, oFixture.call0.bBrokenValue,
					"key: " + oFixture.call0.sKey);

				if (!oRecursionBreaker.broken) {
					// if oRecursionBreaker.broken is true ODataTreeBindingFlat#_map stops iterating
					fnMap({key : oFixture.call1.sKey}, oRecursionBreaker);
					assert.strictEqual(oRecursionBreaker.broken, oFixture.call1.bBrokenValue,
						"key: " + oFixture.call1.sKey);
				}
			});

		// code under test
		bResult = ODataTreeBindingFlat.prototype._hasChangedEntity.call(oBinding, mChangedEntities);

		assert.strictEqual(bResult, true);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: delegates to _getContextsOrNodes", function (assert) {
		this.mock(ODataTreeBindingFlat.prototype).expects("_getContextsOrNodes")
			.withExactArgs(false, "~iStartIndex", "~iLength", "~iThreshold")
			.returns("~result");

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype.getContexts.call(ODataTreeBindingFlat.prototype,
				"~iStartIndex", "~iLength", "~iThreshold"),
			"~result");
	});

	//*********************************************************************************************
	QUnit.test("getNodes: delegates to _getContextsOrNodes", function (assert) {
		this.mock(ODataTreeBindingFlat.prototype).expects("_getContextsOrNodes")
			.withExactArgs(true, "~iStartIndex", "~iLength", "~iThreshold")
			.returns("~result");

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype.getNodes.call(ODataTreeBindingFlat.prototype,
				"~iStartIndex", "~iLength", "~iThreshold"),
			"~result");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
		var oBinding = {
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test - parameters are not relevant for this test
		assert.deepEqual(ODataTreeBindingFlat.prototype._getContextsOrNodes.call(oBinding), []);
	});

	//*********************************************************************************************
[{
	inputParameters : undefined,
	expectedParameters : {groupId : "~groupId", refreshAfterChange : false}
}, {
	inputParameters : {bar : "~baz", groupId : "~value0", refreshAfterChange : "~value1"},
	expectedParameters : {bar : "~baz", groupId : "~groupId", refreshAfterChange : false}
}].forEach(function (oFixture, i) {
	QUnit.test("createEntry: resolved binding, #" + i, function (assert) {
		var oBinding = {
				oModel : {
					_resolveGroup : function () {},
					createEntry : function () {}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("/foo")
			.returns({groupId : "~groupId"});
		this.mock(oBinding.oModel).expects("createEntry")
			.withExactArgs("/foo", sinon.match(function (mParameters0) {
				if (oFixture.inputParameters) {
					assert.strictEqual(mParameters0, oFixture.inputParameters);
				}
				assert.deepEqual(mParameters0, oFixture.expectedParameters);

				return true;
			}))
			.returns("~createdContext");

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype.createEntry.call(oBinding, oFixture.inputParameters),
			"~createdContext");
	});
});

	//*********************************************************************************************
	QUnit.test("createEntry: unresolved binding", function (assert) {
		var oBinding = {
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.oLogMock.expects("warning")
			.withExactArgs("ODataTreeBindingFlat: createEntry failed, as the binding path could not"
				+ " be resolved.");

		// code under test - parameters are not relevant for this test
		assert.strictEqual(ODataTreeBindingFlat.prototype.createEntry.call(oBinding), undefined);
	});

	//*********************************************************************************************
[{
	parameters: {expand : "~expand"},
	error: new Error("Parameter 'expand' is not supported")
 }, {
	parameters: {inactive : "~inactive"},
	error: new Error("Parameter 'inactive' is not supported")
}].forEach((oFixture) => {
	QUnit.test("createEntry: unsupported parameter", function (assert) {
		const oBinding = {
				getResolvedPath() {}
			};
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sPath");

		assert.throws(() => {
			// code under test
			ODataTreeBindingFlat.prototype.createEntry.call(oBinding, oFixture.parameters);
		}, oFixture.error );
	});
});
	/**
	 * @deprecated As of version 1.104.0
	 */
	QUnit.test("submitChanges: unresolved binding", function (assert) {
		var oBinding = {
				getPath : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oBinding).expects("getPath").withExactArgs().returns("~path");
		this.oLogMock.expects("error")
			.withExactArgs("#submitChanges failed: binding is unresolved", "~path", sClassName);

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);
	});
	/**
	 * @deprecated As of version 1.104.0
	 */
	QUnit.test("submitChanges: call ODataModel#submitChanges", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : false,
				oModel : {
					_resolveGroup : function () {},
					submitChanges : function () {}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("/foo")
			.returns({groupId : "~groupId"});
		this.mock(oBinding.oModel).expects("submitChanges").withExactArgs({groupId : "~groupId"});

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);

		assert.strictEqual(oBinding._bSubmitChangesCalled, true);
	});
	/**
	 * @deprecated As of version 1.104.0
	 */
	QUnit.test("submitChanges: call ODataModel#submitChanges (w/ mParameters)", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : false,
				oModel : {
					_resolveGroup : function () {},
					submitChanges : function () {}
				},
				getResolvedPath : function () {}
			},
			mParameters = {groupId : "~oldGroup"};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("/foo")
			.returns({groupId : "~groupId"});
		this.mock(oBinding.oModel).expects("submitChanges")
			.withExactArgs(sinon.match.same(mParameters).and(sinon.match({groupId : "~groupId"})));

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding, mParameters);

		assert.strictEqual(oBinding._bSubmitChangesCalled, true);
	});

	//*********************************************************************************************
	QUnit.test("_submitChanges: binding is unresolved", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : "~foo",
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, {/*mParameters*/});

		assert.strictEqual(oBinding._bSubmitChangesCalled, false);
	});

	//*********************************************************************************************
	QUnit.test("_submitChanges: groupId doesn't match", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : "~bar",
				oModel : {_resolveGroup : function () {}},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("/foo")
			.returns({groupId : "~groupId"});

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, {groupId : "changes"});

		assert.strictEqual(oBinding._bSubmitChangesCalled, false);
	});

	//*********************************************************************************************
	QUnit.test("_submitChanges: does nothing if there are no hierarchy changes and the call was not"
			+ " trigged by ODataTreeBindingFlat#submitChanges", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : false,
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns({
				added : [],
				creationCancelled : [],
				moved : [],
				removed : []
			});

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, {/*mParameters*/});

		assert.strictEqual(oBinding._bSubmitChangesCalled, false);
	});

	//*********************************************************************************************
	QUnit.test("_submitChanges: overrides success handler and calls _generateSubmitData if there "
			+ "are no hierarchy changes but the call was triggered by "
			+ "ODataTreeBindingFlat#submitChanges", function (assert) {
		var oBinding = {
				_bSubmitChangesCalled : true,
				_generateSubmitData : function () {},
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {
				added : [],
				creationCancelled : [],
				moved : [],
				removed : []
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, {/*mParameters*/});

		assert.strictEqual(oBinding._bSubmitChangesCalled, false);
	});

	//*********************************************************************************************
[
	[{statusCode : "200"}, {statusCode : "300"}],
	[{statusCode : "200"}, {statusCode : "199"}]
].forEach(function (aChangeResponses, i) {
	QUnit.test("_submitChanges: error in change response, success handler does nothing: " + i,
			function (assert) {
		var oBinding = {
				_generateSubmitData : function () {},
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {},
			oResponseData = {__batchResponses : [{__changeResponses : aChangeResponses}]};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		// code under test: success handler does nothing
		mParameters.success(oResponseData);
	});
});

	//*********************************************************************************************
[false, true].forEach(function(bRestoreTreeStateSupported) {
	var sTitle = "_submitChanges: successful submit, _isRestoreTreeStateSupported="
			+ bRestoreTreeStateSupported + "; call "
			+ (bRestoreTreeStateSupported ? "_restoreTreeState" : "_refresh");

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oModel : {submitChanges : function () {}},
				_generateSubmitData : function () {},
				_isRestoreTreeStateSupported : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				_restoreTreeState : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {},
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sResolvedPath");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		this.mock(oBinding).expects("_isRestoreTreeStateSupported")
			.withExactArgs()
			.returns(bRestoreTreeStateSupported);
		this.mock(oBinding).expects("_restoreTreeState")
			.withExactArgs(sinon.match.same(oOptimizedChanges))
			.exactly(bRestoreTreeStateSupported ? 1 : 0)
			.returns(Promise.resolve());
		this.mock(oBinding).expects("_refresh")
			.withExactArgs(true)
			.exactly(bRestoreTreeStateSupported ? 0 : 1);

		// code under test
		mParameters.success(oResponseData);
	});
});

	//*********************************************************************************************
	QUnit.test("_submitChanges: _restoreTreeState returns rejected promise", function (assert) {
		var oBinding = {
				oModel : {submitChanges : function () {}},
				_generateSubmitData : function () {},
				_isRestoreTreeStateSupported : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				_restoreTreeState : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {},
			oPromise = Promise.reject("~error"),
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sResolvedPath");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		this.mock(oBinding).expects("_isRestoreTreeStateSupported").withExactArgs().returns(true);
		this.mock(oBinding).expects("_restoreTreeState")
			.withExactArgs(sinon.match.same(oOptimizedChanges))
			.returns(oPromise);
		this.oLogMock.expects("error")
			.withExactArgs("Tree state restoration request failed for binding: ~sResolvedPath",
				"~error", sClassName);
		this.mock(oBinding).expects("_refresh").withExactArgs(true);

		// code under test
		mParameters.success(oResponseData);

		return oPromise.catch(function () {});
	});

	//*********************************************************************************************
[false, true].forEach(function(bRefresh, i) {
	QUnit.test("_submitChanges: successful submit but generating submit data failed, don't restore"
			+ " tree state but refresh if not yet rereshed; #" + i, function (assert) {
		var oBinding = {
				bRefresh : "~bRefresh",
				oModel : {
					_resolveGroup : function () {},
					submitChanges : function () {}
				},
				_generateSubmitData : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {groupId : "~groupId"},
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]},
			that = this;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sResolvedPath");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("~sResolvedPath")
			.returns({groupId : "~groupId"});
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func)
			.callsFake(function (oOptimizedChanges, fnError) {
				that.oLogMock.expects("error")
					.withExactArgs("Tree state restoration request failed for binding: "
						+ "~sResolvedPath", "~error", sClassName);

				// code under test
				fnError("~error");
			});

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		assert.strictEqual(oBinding.bRefresh, false);

		oBinding.bRefresh = bRefresh;
		this.mock(oBinding).expects("_refresh").withExactArgs(true).exactly(bRefresh ? 0 : 1);

		// code under test
		mParameters.success(oResponseData);
	});
});

	//*********************************************************************************************
[
	{},
	{__batchResponses : []},
	{__batchResponses : [{}]},
	{__batchResponses : [{__changeResponses : []}]}
].forEach(function (oResponseData, i) {
	var sTitle = "_submitChanges: success handler logs warning if batch responses or change"
			+ " responses are missing: " + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				_generateSubmitData : function () {},
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		this.oLogMock.expects("warning")
			.withExactArgs("#submitChanges: no change response in batch response", "/foo",
				sClassName);

		// code under test
		mParameters.success(oResponseData, "~oResponse");
	});
});

	//*********************************************************************************************
	QUnit.test("_submitChanges: success handler logs no warning if no request was sent",
			function (assert) {
		var oBinding = {
				_generateSubmitData : function () {},
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			},
			oOptimizedChanges = {foo : [], bar : ["baz"]},
			mParameters = {};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(oOptimizedChanges);
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs(sinon.match.same(oOptimizedChanges), sinon.match.func);

		// code under test
		ODataTreeBindingFlat.prototype._submitChanges.call(oBinding, mParameters);

		// code under test
		mParameters.success({}, /*no request*/undefined);
	});

	//*********************************************************************************************
["~sNewlyGeneratedId", undefined].forEach(function (sNewlyGeneratedId) {
	[true, false, undefined].forEach(function (bIsTransient) {
	var sTitle = "_ensureHierarchyNodeIDForContext: use isTransient, bIsTransient=" + bIsTransient
			+ ", sNewlyGeneratedId=" + sNewlyGeneratedId;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oModel : {setProperty : function () {}},
				oTreeProperties : {"hierarchy-node-for" : "foo"}
			},
			oContext = {// a sap.ui.model.odata.v2.Context instance
				getProperty : function () {},
				isTransient : function () {}
			};

		this.mock(oContext).expects("getProperty").withExactArgs("foo").returns(sNewlyGeneratedId);
		this.mock(oContext).expects("isTransient").withExactArgs().returns(bIsTransient);
		this.mock(oBinding.oModel).expects("setProperty")
			//TODO: replace with uid mock
			.withExactArgs("foo", /* uid */sinon.match.string, sinon.match.same(oContext))
			.exactly(bIsTransient !== true || sNewlyGeneratedId ? 0 : 1);

		// code under test
		ODataTreeBindingFlat.prototype._ensureHierarchyNodeIDForContext.call(oBinding, oContext);
	});
	});
});

	//*********************************************************************************************
[
	{restoreTreeStateSupported : undefined, result : true},
	{restoreTreeStateSupported : false, result : true},
	{restoreTreeStateSupported : true, result : false}
].forEach(function (oFixture, i) {
	QUnit.test("_isRefreshAfterChangeAllowed: #" + i, function (assert) {
		var oBinding = {
				_isRestoreTreeStateSupported : function () {}
			};

		this.mock(oBinding).expects("_isRestoreTreeStateSupported")
			.withExactArgs()
			.returns(oFixture.restoreTreeStateSupported);

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype._isRefreshAfterChangeAllowed.call(oBinding),
			oFixture.result);
	});
});

[{
	binding : {_bRestoreTreeStateAfterChange : undefined, aApplicationFilters : undefined},
	result : undefined
}, {
	binding : {_bRestoreTreeStateAfterChange : false, aApplicationFilters : undefined},
	result : false
}, {
	binding : {_bRestoreTreeStateAfterChange : false, aApplicationFilters : []},
	result : false
}, {
	binding : {_bRestoreTreeStateAfterChange : true, aApplicationFilters : ["~foo"]},
	result : false
}, {
	binding : {_bRestoreTreeStateAfterChange : true, aApplicationFilters : undefined},
	result : true
}, {
	binding : {_bRestoreTreeStateAfterChange : true, aApplicationFilters : []},
	result : true
}].forEach(function (oFixture, i) {
	//*********************************************************************************************
	QUnit.test("_isRestoreTreeStateSupported: #" + i, function (assert) {
		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype._isRestoreTreeStateSupported.call(oFixture.binding),
			oFixture.result);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bRestoreTreeStateSupported) {
	var sTitle = "_generateSubmitData: for moved nodes (restoreTreeStateSupported="
			+ bRestoreTreeStateSupported + ")";

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oModel : {
					_resolveGroup : function () {},
					setProperty : function () {}
				},
				oTreeProperties : {
					"hierarchy-node-for" : "~hierarchyNode",
					"hierarchy-parent-node-for" : "~hierarchyParentNode"
				},
				_generatePreorderPositionRequest : function () {},
				_generateSiblingsPositionRequest : function () {},
				_isRestoreTreeStateSupported : function () {},
				getResolvedPath : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oModelMock = this.mock(oBinding.oModel),
			fnNewNode = function (oContext) {
				return {
					context : oContext,
					parent : {context : {getProperty : function () {}}}
				};
			},
			oOptimizedChanges = {
				added : [],
				moved : [fnNewNode("context0"), fnNewNode("context1")],
				removed : [],
				creationCancelled : []
			};

		oBindingMock.expects("getResolvedPath").withExactArgs().returns("/foo");
		oModelMock.expects("_resolveGroup").withExactArgs("/foo").returns({groupId : "~groupId"});
		this.mock(oOptimizedChanges.moved[0].parent.context).expects("getProperty")
			.withExactArgs("~hierarchyNode")
			.returns("~parentID0");
		oModelMock.expects("setProperty")
			.withExactArgs("~hierarchyParentNode", "~parentID0", "context0");
		oBindingMock.expects("_isRestoreTreeStateSupported")
			.withExactArgs()
			.returns(bRestoreTreeStateSupported);
		oBindingMock.expects("_generatePreorderPositionRequest")
			.withExactArgs(sinon.match.same(oOptimizedChanges.moved[0]),
				{groupId : "~groupId", error : "~fnRestoreRequestErrorHandler"})
			.exactly(bRestoreTreeStateSupported ? 1 : 0);
		oBindingMock.expects("_generateSiblingsPositionRequest")
			.withExactArgs(sinon.match.same(oOptimizedChanges.moved[0]),
				{groupId : "~groupId", error : "~fnRestoreRequestErrorHandler"})
			.exactly(bRestoreTreeStateSupported ? 1 : 0);
		this.mock(oOptimizedChanges.moved[1].parent.context).expects("getProperty")
			.withExactArgs("~hierarchyNode")
			.returns("~parentID1");
		oModelMock.expects("setProperty")
			.withExactArgs("~hierarchyParentNode", "~parentID1", "context1");
		oBindingMock.expects("_isRestoreTreeStateSupported")
			.withExactArgs()
			.returns(bRestoreTreeStateSupported);
		oBindingMock.expects("_generatePreorderPositionRequest")
			.withExactArgs(sinon.match.same(oOptimizedChanges.moved[1]),
				{groupId : "~groupId", error : "~fnRestoreRequestErrorHandler"})
			.exactly(bRestoreTreeStateSupported ? 1 : 0);
		oBindingMock.expects("_generateSiblingsPositionRequest")
			.withExactArgs(sinon.match.same(oOptimizedChanges.moved[1]),
				{groupId : "~groupId", error : "~fnRestoreRequestErrorHandler"})
			.exactly(bRestoreTreeStateSupported ? 1 : 0);

		// code under test
		ODataTreeBindingFlat.prototype._generateSubmitData.call(oBinding, oOptimizedChanges,
			"~fnRestoreRequestErrorHandler");
	});
});

	//*********************************************************************************************
	QUnit.test("_generateDeleteRequest: for added node", function (assert) {
		var oBinding = {
				oModel : {_discardEntityChanges : function () {}}
			},
			oNode = {
				context : {getPath : function () {}},
				nodeState : {added : true}
			};

		this.mock(oNode.context).expects("getPath").withExactArgs().returns("/~key");
		this.mock(oBinding.oModel).expects("_discardEntityChanges").withExactArgs("~key", /*bDeleteEntity*/true);

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype._generateDeleteRequest.call(oBinding, oNode),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("_generateDeleteRequest: for persisted node", function (assert) {
		var oBinding = {
				oModel : {
					_resolveGroup : function () {},
					remove : function () {}
				},
				getResolvedPath : function () {}
			},
			oNode = {
				context : {getPath : function () {}},
				nodeState : {added : false}
			};

		this.mock(oNode.context).expects("getPath").withExactArgs().returns("~path");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/foo");
		this.mock(oBinding.oModel).expects("_resolveGroup")
			.withExactArgs("/foo")
			.returns({groupId : "~groupId"});
		this.mock(oBinding.oModel).expects("remove")
			.withExactArgs("~path", {groupId : "~groupId", refreshAfterChange : false})
			.returns("~requestHandle");

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype._generateDeleteRequest.call(oBinding, oNode),
			"~requestHandle");
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: unresolved binding", function (assert) {
		var oBinding = {isResolved : function () {}};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._hasPendingChanges.call(oBinding), false);
	});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: w/o changed nodes", function (assert) {
		var oBinding = {_aAllChangedNodes : [], isResolved : function () {}};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._hasPendingChanges.call(oBinding), false);
	});

	//*********************************************************************************************
[
	{added : [{/*node*/}], creationCancelled : [], moved : [], removed : []},
	{added : [], creationCancelled : [], moved : [{/*node*/}], removed : []},
	{added : [], creationCancelled : [], moved : [], removed : [{/*node*/}]}
].forEach(function (oOptimizedChanges, i) {
	QUnit.test("_hasPendingChanges: with changed nodes: " + i, function (assert) {
		var oBinding = {
				_aAllChangedNodes : [{/*node*/}],
				_optimizeChanges : function () {},
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns(oOptimizedChanges);

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._hasPendingChanges.call(oBinding),
			true);
	});
});

	//*********************************************************************************************
	QUnit.test("_hasPendingChanges: cancelled creations", function (assert) {
		var oBinding = {
				_aAllChangedNodes : [{/*node*/}],
				_optimizeChanges : function () {},
				isResolved : function () {}
			},
			aChangedEntityKeys = ["foo", "baz"];

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns({
				added : [],
				moved : [],
				removed : [],
				creationCancelled : [{key : "foo"}, {key : "bar"}]
			});

		// code under test
		assert.strictEqual(
			ODataTreeBindingFlat.prototype._hasPendingChanges.call(oBinding, aChangedEntityKeys),
			false);

		assert.deepEqual(aChangedEntityKeys, ["baz"]);
	});

	//*********************************************************************************************
	QUnit.test("_getPendingChanges: unresolved binding", function (assert) {
		var oBinding = {isResolved : function () {}};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(ODataTreeBindingFlat.prototype._getPendingChanges.call(oBinding), {});
	});

	//*********************************************************************************************
	QUnit.test("_getPendingChanges", function (assert) {
		var oBinding = {
				oTreeProperties : {
					"hierarchy-node-for" : "keyPropertyName",
					"hierarchy-parent-node-for" : "parentKeyPropertyName"
				},
				_optimizeChanges : function () {},
				isResolved : function () {}
			},
			oNode0 = {key : "node0", parent : {context : {getProperty : function () {}}}},
			oNode1 = {key : "node1", parent : {context : {getProperty : function () {}}}},
			oNode2 = {key : "node2", parent : {context : {getProperty : function () {}}}},
			oNode3 = {key : "node3", parent : {context : {getProperty : function () {}}}};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns({
				added : [oNode0, oNode1],
				moved : [oNode2, oNode3],
				removed : [{key : "node4"}, {key : "node5"}],
				creationCancelled : [{key : "node6"}, {key : "node7"}]
			});
		this.mock(oNode0.parent.context).expects("getProperty")
			.withExactArgs("keyPropertyName")
			.returns("parentNode0");
		this.mock(oNode1.parent.context).expects("getProperty")
			.withExactArgs("keyPropertyName")
			.returns("parentNode1");
		this.mock(oNode2.parent.context).expects("getProperty")
			.withExactArgs("keyPropertyName")
			.returns("parentNode2");
		this.mock(oNode3.parent.context).expects("getProperty")
			.withExactArgs("keyPropertyName")
			.returns("parentNode3");

		// code under test
		assert.deepEqual(ODataTreeBindingFlat.prototype._getPendingChanges.call(oBinding), {
			node0 : {parentKeyPropertyName : "parentNode0"},
			node1 : {parentKeyPropertyName : "parentNode1"},
			node2 : {parentKeyPropertyName : "parentNode2"},
			node3 : {parentKeyPropertyName : "parentNode3"},
			node4 : {},
			node5 : {},
			node6 : null,
			node7 : null
		});
	});

	//*********************************************************************************************
	QUnit.test("_resetChanges: unresolved binding", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBindingFlat.prototype._resetChanges.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_resetChanges: binding has no changes", function (assert) {
		var oBinding = {
				_aAllChangedNodes : [],
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");

		// code under test
		ODataTreeBindingFlat.prototype._resetChanges.call(oBinding);
	});

	//*********************************************************************************************
["~someBindingPath", "~path/to/entity", "entity/to/~path"].forEach(function (sPath, i) {
	QUnit.test("_resetChanges: aPaths doesn't match binding #" + i, function (assert) {
		var oBinding = {
				_aAllChangedNodes : ["~change"],
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");

		// code under test
		ODataTreeBindingFlat.prototype._resetChanges.call(oBinding, [sPath]);
	});
});

	//*********************************************************************************************
[undefined, ["foo", "~path", "bar"]].forEach(function (aPaths) {
	QUnit.test("_resetChanges: " + (aPaths ? "with" : "without") + " aPaths", function (assert) {
		var oBinding = {
				_aAdded : ["~change0", "~change1"],
				_aAllChangedNodes : ["~change0", "~change1", "~change2", "~change3"],
				_aRemoved : ["~change2", "~change3"],
				_cleanTreeStateMaps : function () {},
				_fireChange : function () {},
				getResolvedPath : function () {}
			},
			oTreeBindingFlatMock = this.mock(ODataTreeBindingFlat);

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");
		oTreeBindingFlatMock.expects("_resetMovedOrRemovedNode").withExactArgs("~change2");
		oTreeBindingFlatMock.expects("_resetMovedOrRemovedNode").withExactArgs("~change3");
		oTreeBindingFlatMock.expects("_resetParentState").withExactArgs("~change0");
		oTreeBindingFlatMock.expects("_resetParentState").withExactArgs("~change1");
		this.mock(oBinding).expects("_cleanTreeStateMaps").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Change});

		// code under test
		ODataTreeBindingFlat.prototype._resetChanges.call(oBinding, aPaths);

		assert.deepEqual(oBinding._mSubtreeHandles, {});
		assert.deepEqual(oBinding._aAdded, []);
		assert.deepEqual(oBinding._aRemoved, []);
		assert.deepEqual(oBinding._aAllChangedNodes, []);
		assert.deepEqual(oBinding._aNodeCache, []);
	});
});

	//*********************************************************************************************
[{
	inputNode : {foo : "bar", parent : null},
	expectedResult : {foo : "bar", parent : null}
}, {
	inputNode : {foo : "bar", parent : {initiallyIsLeaf : false}},
	expectedResult : {foo : "bar", parent : {initiallyIsLeaf : false, addedSubtrees : []}}
}, {
	inputNode : {foo : "bar", parent : {initiallyIsLeaf : true, nodeState : {}}},
	expectedResult : {
		foo : "bar",
		parent : {
			initiallyIsLeaf : true,
			addedSubtrees : [],
			nodeState : {collapsed : false, expanded : false, isLeaf : true}
		}
	}
}].forEach(function (oFixture, i) {
	QUnit.test("_resetParentState: #" + i, function (assert) {
		// code under test
		ODataTreeBindingFlat._resetParentState(oFixture.inputNode);

		assert.deepEqual(oFixture.inputNode, oFixture.expectedResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_resetMovedOrRemovedNode", function (assert) {
		var oNode = {
				containingSubtreeHandle : "~containingSubtreeHandle",
				level : "~level",
				nodeState : {reinserted : "~reinserted", removed : "~removed"},
				originalLevel : "~originalLevel",
				originalParent : "~originalParent",
				parent : "~parent"
			};

		this.mock(ODataTreeBindingFlat).expects("_resetParentState")
			.withExactArgs(sinon.match.same(oNode));

		// code under test
		ODataTreeBindingFlat._resetMovedOrRemovedNode(oNode);

		assert.deepEqual(oNode, {
			level : "~originalLevel",
			nodeState : {},
			originalLevel : "~originalLevel",
			originalParent : "~originalParent",
			parent : "~originalParent"
		});
	});

	//*********************************************************************************************
["leaf", "collapsed"].forEach(function (sDrillState) {
	var sTitle = "_addServerIndexNodes: node has initiallyIsLeaf (drill state = " + sDrillState + ")";

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				_iLowestServerLevel : null,
				_aNodes : [],
				_mSelected : {},
				oContext : "~oContext",
				oModel : {
					getContext() {},
					getKey() {},
					resolveDeep() {}
				},
				sPath : "~sPath",
				oTreeProperties : {
					"hierarchy-drill-state-for" : "drillStateFor",
					"hierarchy-level-for" : "levelFor",
					"hierarchy-node-descendant-count-for" : "nodeDescendantCountFor"
				}
			},
			oData = {
				__count : "1",
				results : [{
					drillStateFor : sDrillState,
					levelFor : "~level",
					nodeDescendantCountFor : "~magnitude"
				}]
			},
			oExpectedNode = {
				addedSubtrees : [],
				children : [],
				context : "~context",
				initiallyCollapsed : false,
				initiallyIsLeaf : false,
				isDeepOne : false,
				key : "~key('42')",
				level : "~level",
				magnitude : "~magnitude",
				nodeState : {
					collapsed : false,
					expanded : false,
					isLeaf : false,
					selected : false
				},
				originalLevel : "~level",
				originalParent  : null,
				parent : null,
				serverIndex : 0
			};

		if (sDrillState === "leaf") {
			oExpectedNode.initiallyIsLeaf = true;
			oExpectedNode.nodeState.isLeaf = true;
		} else if (sDrillState === "collapsed") {
			oExpectedNode.initiallyCollapsed = true;
			oExpectedNode.nodeState.collapsed = true;
		}

		this.mock(oBinding.oModel).expects("getKey").withExactArgs(sinon.match.same(oData.results[0]))
			.returns("~key('42')");
		this.mock(oBinding.oModel).expects("resolveDeep").withExactArgs("~sPath", "~oContext").returns("~deepPath");
		this.mock(oBinding.oModel).expects("getContext").withExactArgs("/~key('42')", "~deepPath('42')")
			.returns("~context");

		// code under test
		ODataTreeBindingFlat.prototype._addServerIndexNodes.call(oBinding, oData, 0);

		assert.strictEqual(oBinding._bLengthFinal, true);
		assert.deepEqual(oBinding._aNodes, [oExpectedNode]);
		assert.strictEqual(oBinding._iLowestServerLevel, "~level");
	});
});

	//*********************************************************************************************
["leaf", "collapsed"].forEach(function (sDrillState) {
	var sTitle = "_createChildNode: node has initiallyIsLeaf (drill state = " + sDrillState + ")";

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				_mSelected : {},
				oContext : "~oContext",
				oModel : {
					getContext() {},
					getKey() {},
					resolveDeep() {}
				},
				sPath : "~sPath",
				oTreeProperties : {
					"hierarchy-drill-state-for" : "drillStateFor"
				}
			},
			oEntry = {drillStateFor : sDrillState},
			oParent = {
				children : [],
				level : 3,
				serverIndex : "~serverIndex"
			},
			oExpectedNode = {
				addedSubtrees : [],
				children : [],
				containingServerIndex : "~serverIndex",
				context : "~context",
				initiallyCollapsed : false,
				initiallyIsLeaf : false,
				isDeepOne : true,
				key : "~key('42')",
				level : 4,
				magnitude : 0,
				nodeState : {
					collapsed : false,
					expanded : false,
					isLeaf : false,
					selected : false
				},
				originalLevel : 4,
				originalParent : oParent,
				parent : oParent,
				positionInParent : 42
			},
			oResult;

		if (sDrillState === "leaf") {
			oExpectedNode.initiallyIsLeaf = true;
			oExpectedNode.nodeState.isLeaf = true;
		} else if (sDrillState === "collapsed") {
			oExpectedNode.initiallyCollapsed = true;
			oExpectedNode.nodeState.collapsed = true;
		}

		this.mock(oBinding.oModel).expects("getKey").withExactArgs(sinon.match.same(oEntry)).returns("~key('42')");
		this.mock(oBinding.oModel).expects("resolveDeep").withExactArgs("~sPath", "~oContext").returns("~deepPath");
		this.mock(oBinding.oModel).expects("getContext").withExactArgs("/~key('42')", "~deepPath('42')")
			.returns("~context");

		// code under test
		oResult = ODataTreeBindingFlat.prototype._createChildNode.call(oBinding, oEntry, oParent, 42);

		assert.deepEqual(oResult, oExpectedNode);
		assert.strictEqual(oResult, oParent.children[42]);
	});
});

	//*********************************************************************************************
	QUnit.test("_collectDeepNodes", function (assert) {
		var fnCallback, aResult,
			oBinding = {
				_collectServerSections : function () {},
				_map : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oNode0 = {
				children : "~children0",
				initiallyCollapsed : true,
				nodeState : {expanded : true}
			},
			oNode1 = {
				children : "~children1",
				initiallyIsLeaf : true,
				nodeState : {expanded : true}
			},
			oNode2 = {
				children : "~children2",
				isDeepOne : true,
				nodeState : {expanded : true}
			},
			oNode3 = {nodeState : {expanded : false}};

		oBindingMock.expects("_map")
			.withExactArgs(sinon.match.func)
			.callsFake(function (fnFunction) {
				fnCallback = fnFunction;
			});

		// code under test
		aResult = ODataTreeBindingFlat.prototype._collectDeepNodes.call(oBinding);

		assert.deepEqual(aResult, []);

		oBindingMock.expects("_collectServerSections")
			.withExactArgs("~children0")
			.returns("~aChildSection0");
		oBindingMock.expects("_collectServerSections")
			.withExactArgs("~children1")
			.returns("~aChildSection1");
		oBindingMock.expects("_collectServerSections")
			.withExactArgs("~children2")
			.returns("~aChildSection2");

		// code under test
		[undefined, null, oNode0, oNode1, oNode2, oNode3].forEach(fnCallback);

		assert.deepEqual(aResult, [
			{aChildSections : "~aChildSection0", oParentNode : oNode0},
			{aChildSections : "~aChildSection1", oParentNode : oNode1},
			{aChildSections : "~aChildSection2", oParentNode : oNode2}
		]);
	});

	//*********************************************************************************************
[true, false].forEach(function (bHasCollapsedNodes) {
	var sTitle = "_executeRestoreTreeState: success, " + (bHasCollapsedNodes ? "with" : "without")
			+ " collapsed nodes";

	QUnit.test(sTitle, function (assert) {
		var fnCollapseNodesCallback, fnResolve, pResult,
			oBinding = {
				_aCollapsed : bHasCollapsedNodes
					? [{key : "~collapsed0"}, {key : "~collapsed1"}]
					: [],
				_aNodes : "~aNodes",
				_adaptSections : function () {},
				_collectDeepNodes : function () {},
				_collectServerSections : function () {},
				_filterChangesForDeepSections : function () {},
				_filterChangeForServerSections : function () {},
				_map : function () {},
				_optimizeOptimizedChanges : function () {},
				_restoreChildren : function () {},
				_restoreServerIndexNodes : function () {},
				collapse : function () {},
				resetData : function () {}
			},
			oBindingMock = this.mock(oBinding),
			mFilteredDeepNodeChanges = {
				"~parent1" : "~change1",
				"~parent2" : "~change2"
			},
			aDeepNodeSections = [{
				aChildSections : [{iSkip : 0, iTop : 5}],
				oParentNode : {key : "~parent0"}
			}, {
				aChildSections : [],
				oParentNode : {key : "~parent1"}
			}, {
				aChildSections : [{iSkip : 0, iTop : 3}, {iSkip : 10, iTop : 5}],
				oParentNode : {key : "~parent2"}
			}],
			oResponseDeepNode0 = {/*oResponse*/},
			oResponseDeepNode1 = {statusCode : 0}, // request aborted
			oResponseDeepNode2 = {/*oResponse*/},
			pDeepNode0 = Promise.resolve(oResponseDeepNode0),
			pDeepNode1 = Promise.reject(oResponseDeepNode1),
			pDeepNode2 = new Promise(function (resolve) {
				fnResolve = resolve;
			}),
			oResponseServerIndexNodes0 = {/*oResponse*/},
			oResponseServerIndexNodes1 = {/*oResponse*/},
			aSections = [{iSkip : 5, iTop : 10}, {iSkip : 42, iTop : 13}],
			pServerIndexNodes0 = Promise.resolve(oResponseServerIndexNodes0),
			pServerIndexNodes1 = Promise.resolve(oResponseServerIndexNodes1);

		oBindingMock.expects("_collectServerSections").withExactArgs("~aNodes").returns(aSections);
		oBindingMock.expects("_optimizeOptimizedChanges")
			.withExactArgs("~optimizedChanges")
			.returns("~optimizedOptimizedChanges");
		oBindingMock.expects("_filterChangeForServerSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns("~filteredServerIndexChanges");
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aSections), "~filteredServerIndexChanges");
		oBindingMock.expects("_restoreServerIndexNodes")
			.withExactArgs(5, 10, true)
			.returns(pServerIndexNodes0);
		oBindingMock.expects("_restoreServerIndexNodes")
			.withExactArgs(42, 13, false)
			.returns(pServerIndexNodes1);
		oBindingMock.expects("_filterChangesForDeepSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns(mFilteredDeepNodeChanges);
		oBindingMock.expects("_collectDeepNodes").withExactArgs().returns(aDeepNodeSections);
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aDeepNodeSections[1].aChildSections), "~change1",
				{ignoreMagnitude: true, indexName: "positionInParent"});
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aDeepNodeSections[2].aChildSections), "~change2",
				{ignoreMagnitude : true, indexName : "positionInParent"});
		oBindingMock.expects("_restoreChildren")
			.withExactArgs(sinon.match.same(aDeepNodeSections[0].oParentNode), 0, 5)
			.returns(pDeepNode0);
		oBindingMock.expects("_restoreChildren")
			.withExactArgs(sinon.match.same(aDeepNodeSections[2].oParentNode), 0, 3)
			.returns(pDeepNode1);
		oBindingMock.expects("_restoreChildren")
			.withExactArgs(sinon.match.same(aDeepNodeSections[2].oParentNode), 10, 5)
			.returns(pDeepNode2);
		oBindingMock.expects("resetData").withExactArgs(true);

		// code under test
		pResult = ODataTreeBindingFlat.prototype._executeRestoreTreeState.call(oBinding,
			"~optimizedChanges");

		assert.ok(pResult instanceof Promise);

		oBindingMock.expects("_map")
			.withExactArgs(sinon.match.func)
			.exactly(bHasCollapsedNodes ? 1 : 0)
			.callsFake(function (fnCallback) {
				fnCollapseNodesCallback = fnCallback;
			});

		// code under test
		fnResolve(oResponseDeepNode2);

		return Promise.all([
			pResult, pServerIndexNodes0, pServerIndexNodes1, pDeepNode0, pDeepNode2,
			pDeepNode0.catch(function () {/* rejected as expected*/})
		]).then(function (aResult) {
			var oNode, oRecursionBreaker = {broken : false};

			assert.deepEqual(aResult[0], [
				{responseData : {}},
				{responseData : {}},
				{responseData : {}},
				{error : oResponseDeepNode1},
				{responseData : {}}
			]);
			assert.strictEqual(aResult[0][0].responseData, oResponseServerIndexNodes0);
			assert.strictEqual(aResult[0][1].responseData, oResponseServerIndexNodes1);
			assert.strictEqual(aResult[0][2].responseData, oResponseDeepNode0);
			assert.strictEqual(aResult[0][3].error, oResponseDeepNode1);
			assert.strictEqual(aResult[0][4].responseData, oResponseDeepNode2);

			if (bHasCollapsedNodes) {
				// code under test
				fnCollapseNodesCallback(undefined, oRecursionBreaker);

				assert.strictEqual(oRecursionBreaker.broken, false);

				// code under test
				fnCollapseNodesCallback({key : "notCollapsed"}, oRecursionBreaker);

				assert.strictEqual(oRecursionBreaker.broken, false);

				oNode = {key : "~collapsed1"};
				oBindingMock.expects("collapse").withExactArgs(sinon.match.same(oNode), true);

				// code under test
				fnCollapseNodesCallback(oNode, oRecursionBreaker);

				assert.strictEqual(oRecursionBreaker.broken, false);

				oNode = {key : "~collapsed0"};
				oBindingMock.expects("collapse").withExactArgs(sinon.match.same(oNode), true);

				// code under test
				fnCollapseNodesCallback(oNode, oRecursionBreaker);

				assert.strictEqual(oRecursionBreaker.broken, true);
			}
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_executeRestoreTreeState: all aborted", function (assert) {
		var pResult,
			oBinding = {
				_aCollapsed : [],
				_aNodes : "~aNodes",
				_adaptSections : function () {},
				_collectDeepNodes : function () {},
				_collectServerSections : function () {},
				_filterChangesForDeepSections : function () {},
				_filterChangeForServerSections : function () {},
				_map : function () {},
				_optimizeOptimizedChanges : function () {},
				_restoreChildren : function () {},
				_restoreServerIndexNodes : function () {},
				resetData : function () {}
			},
			oBindingMock = this.mock(oBinding),
			mFilteredDeepNodeChanges = {
				"~parent0" : "~change0"
			},
			aDeepNodeSections = [{
				aChildSections : [{iSkip : 0, iTop : 5}],
				oParentNode : {key : "~parent0"}
			}],
			oResponseDeepNode0 = {statusCode : 0}, // request aborted
			pDeepNode0 = Promise.reject(oResponseDeepNode0),
			oResponseServerIndexNodes0 = {statusCode : 0}, // request aborted
			aSections = [{iSkip : 5, iTop : 10}],
			pServerIndexNodes0 = Promise.reject(oResponseServerIndexNodes0);

		oBindingMock.expects("_collectServerSections").withExactArgs("~aNodes").returns(aSections);
		oBindingMock.expects("_optimizeOptimizedChanges")
			.withExactArgs("~optimizedChanges")
			.returns("~optimizedOptimizedChanges");
		oBindingMock.expects("_filterChangeForServerSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns("~filteredServerIndexChanges");
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aSections), "~filteredServerIndexChanges");
		oBindingMock.expects("_restoreServerIndexNodes")
			.withExactArgs(5, 10, true)
			.returns(pServerIndexNodes0);
		oBindingMock.expects("_filterChangesForDeepSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns(mFilteredDeepNodeChanges);
		oBindingMock.expects("_collectDeepNodes").withExactArgs().returns(aDeepNodeSections);
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aDeepNodeSections[0].aChildSections), "~change0",
				{ignoreMagnitude: true, indexName: "positionInParent"});
		oBindingMock.expects("_restoreChildren")
			.withExactArgs(sinon.match.same(aDeepNodeSections[0].oParentNode), 0, 5)
			.returns(pDeepNode0);
		oBindingMock.expects("resetData").withExactArgs(true);
		oBindingMock.expects("_map").never();

		// code under test
		pResult = ODataTreeBindingFlat.prototype._executeRestoreTreeState.call(oBinding,
			"~optimizedChanges");

		assert.ok(pResult instanceof Promise);

		return Promise.all([
			pResult,
			pServerIndexNodes0.catch(function () {/* rejected as expected*/}),
			pDeepNode0.catch(function () {/* rejected as expected*/})
		]).then(function (aResult) {
			assert.strictEqual(aResult[0], undefined);
		});
	});

	//*********************************************************************************************
["~errorMessage", {value : "~errorMessage"}].forEach(function (vMessage, i) {
	QUnit.test("_executeRestoreTreeState: #" + i, function (assert) {
		var pResult,
			oBinding = {
				_aCollapsed : [],
				_aNodes : "~aNodes",
				_adaptSections : function () {},
				_collectDeepNodes : function () {},
				_collectServerSections : function () {},
				_filterChangesForDeepSections : function () {},
				_filterChangeForServerSections : function () {},
				_map : function () {},
				_optimizeOptimizedChanges : function () {},
				_restoreChildren : function () {},
				_restoreServerIndexNodes : function () {},
				resetData : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oResponseServerIndexNodes0 = { // server error
				message : vMessage,
				statusCode : 500
			},
			aSections = [{iSkip : 5, iTop : 10}],
			pServerIndexNodes0 = Promise.reject(oResponseServerIndexNodes0);

		oBindingMock.expects("_collectServerSections").withExactArgs("~aNodes").returns(aSections);
		oBindingMock.expects("_optimizeOptimizedChanges")
			.withExactArgs("~optimizedChanges")
			.returns("~optimizedOptimizedChanges");
		oBindingMock.expects("_filterChangeForServerSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns("~filteredServerIndexChanges");
		oBindingMock.expects("_adaptSections")
			.withExactArgs(sinon.match.same(aSections), "~filteredServerIndexChanges");
		oBindingMock.expects("_restoreServerIndexNodes")
			.withExactArgs(5, 10, true)
			.returns(pServerIndexNodes0);
		oBindingMock.expects("_filterChangesForDeepSections")
			.withExactArgs("~optimizedOptimizedChanges")
			.returns({/*mFilteredDeepNodeChanges*/});
		oBindingMock.expects("_collectDeepNodes").withExactArgs().returns([/*aDeepNodeSections*/]);
		oBindingMock.expects("resetData").withExactArgs(true);
		oBindingMock.expects("_map").never();

		// code under test
		pResult = ODataTreeBindingFlat.prototype._executeRestoreTreeState.call(oBinding,
			"~optimizedChanges");

		assert.ok(pResult instanceof Promise);

		return Promise.all([
			pResult,
			pServerIndexNodes0.catch(function () {/* rejected as expected*/})
		]).then(function (aResult) {
			assert.ok(false, "unexpected success");
		}, function (oError) {
			assert.ok(oError instanceof Error);
			assert.strictEqual(oError.message, "Tree state restoration request failed. Complete or"
				+ " partial tree state might get lost. Error: ~errorMessage");
		});
	});
});

	//*********************************************************************************************
[{
	nodeKey : "~foo",
	drillState : "collapsed",
	expectedIsDeepOne : false,
	expectedInitiallyCollapsed : true
}, {
	nodeKey : "~bar",
	drillState : "leaf",
	expectedIsDeepOne : true,
	expectedInitiallyCollapsed : false
}].forEach(function (oFixture, i) {
	QUnit.test("_updateNodeInfoAfterSave: " + i, function (assert) {
		var oNode0 = {context : {getProperty : function () {}}},
			oNode1 = {context : {getProperty : function () {}}},
			oContextMock0 = this.mock(oNode0.context),
			oContextMock1 = this.mock(oNode1.context),
			oBinding = {
				_aAdded : [oNode0],
				oTreeProperties : {
					"hierarchy-drill-state-for" : "drillState",
					"hierarchy-node-for" : "nodeKey"
				}
			},
			aEntities = [{nodeKey : "~baz"}, {nodeKey : "~foo"}];

		oContextMock0.expects("getProperty").withExactArgs("nodeKey").returns(oFixture.nodeKey);
		oContextMock0.expects("getProperty")
			.withExactArgs("drillState")
			.returns(oFixture.drillState);

		// code under test - added node
		ODataTreeBindingFlat.prototype._updateNodeInfoAfterSave.call(oBinding, oNode0, aEntities);

		assert.deepEqual(oNode0.isDeepOne, oFixture.expectedIsDeepOne);
		assert.deepEqual(oNode0.initiallyCollapsed, oFixture.expectedInitiallyCollapsed);
		assert.deepEqual(oNode0.newIsDeepOne, undefined);
		assert.deepEqual(oNode0.newInitiallyCollapsed, undefined);

		oContextMock1.expects("getProperty").withExactArgs("nodeKey").returns(oFixture.nodeKey);
		oContextMock1.expects("getProperty")
			.withExactArgs("drillState")
			.returns(oFixture.drillState);

		// code under test - moved node
		ODataTreeBindingFlat.prototype._updateNodeInfoAfterSave.call(oBinding, oNode1, aEntities);

		assert.deepEqual(oNode1.isDeepOne, undefined);
		assert.deepEqual(oNode1.initiallyCollapsed, undefined);
		assert.deepEqual(oNode1.newIsDeepOne, oFixture.expectedIsDeepOne);
		assert.deepEqual(oNode1.newInitiallyCollapsed, oFixture.expectedInitiallyCollapsed);
	});
});

	//*********************************************************************************************
	QUnit.test("_generatePreorderPositionRequest: unresolved binding", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataTreeBindingFlat.prototype._generatePreorderPositionRequest.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_generatePreorderPositionRequest: resolved binding", function (assert) {
		var fnSuccess,
			oData = {results : "~aResults"},
			oModel = {
				createCustomParams : function () {},
				read : function () {}
			},
			oBinding = {
				_aTreeKeyProperties : ["~key1", "~key0"],
				aApplicationFilters : [new Filter("~prop", "EQ", "~value")],
				sGroupId : "~unusedGroupId",
				oModel : oModel,
				mParameters : "~mParameters",
				aSorters : "~aSorters",
				oTreeProperties : {
					"hierarchy-drill-state-for" : "~drillState",
					"hierarchy-level-for" : "~level",
					"hierarchy-node-descendant-count-for" : "~descendantCount",
					"hierarchy-node-for" : "~nodeKey",
					"hierarchy-preorder-rank-for" : "~preorderRank"
				},
				_getHeaders() {},
				_updateNodeInfoAfterSave : function () {},
				getNumberOfExpandedLevels : function () {},
				getResolvedPath : function () {}
			},
			oNode = {
				context : {
					getProperty : function () {}
				}
			},
			oNodeContextMock = this.mock(oNode.context),
			mParameters = {
				error : "~fnError",
				groupId : "~groupID",
				success : function () {}
			},
			oParametersMock = this.mock(mParameters),
			mURLParameters = {};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		oNodeContextMock.expects("getProperty").withExactArgs("~key0").returns("~value0");
		oNodeContextMock.expects("getProperty").withExactArgs("~key1").returns("~value1");
		this.mock(oBinding).expects("getNumberOfExpandedLevels")
			.withExactArgs()
			.returns("~iExpandedLevels");
		oParametersMock.expects("success").never();
		this.mock(_Helper).expects("extend")
			.withExactArgs({}, "~mParameters")
			.returns(mURLParameters);
		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(mURLParameters)
				.and(sinon.match.has("select",
					"~key0,~key1,~nodeKey,~descendantCount,~drillState,~preorderRank")))
			.returns("~URLParameters");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oModel).expects("read")
			.withExactArgs("~resolvedPath", {
				error : "~fnError",
				filters : [
					new Filter({
						filters : [
							oBinding.aApplicationFilters[0],
							new Filter("~key0", "EQ", "~value0"),
							new Filter("~key1", "EQ", "~value1"),
							new Filter("~level", "LE", "~iExpandedLevels")
						],
						and : true})
				],
				groupId : "~groupID",
				headers : "~headers",
				sorters : "~aSorters",
				success : sinon.match.func,
				urlParameters : "~URLParameters"
			})
			.callsFake(function (sResolvedPath, mParameters0) {
				fnSuccess = mParameters0.success;
			});

		// code under test
		ODataTreeBindingFlat.prototype._generatePreorderPositionRequest.call(oBinding, oNode,
			mParameters);

		this.mock(oBinding).expects("_updateNodeInfoAfterSave")
			.withExactArgs(sinon.match.same(oNode), "~aResults");
		oParametersMock.expects("success")
			.withExactArgs(sinon.match.same(oData), "~foo", "~bar")
			.on(null);

		// code under test
		fnSuccess(oData, "~foo", "~bar");
	});

	//*********************************************************************************************
	QUnit.test("_generatePreorderPositionRequest: resolved binding, defaults", function (assert) {
		var fnSuccess,
			oModel = {
				createCustomParams : function () {},
				read : function () {}
			},
			oBinding = {
				_aTreeKeyProperties : ["~key1", "~key0"],
				aApplicationFilters : undefined,
				sGroupId : "~groupID",
				oModel : oModel,
				mParameters : "~mParameters",
				aSorters : [], // cannot be undefined
				oTreeProperties : {
					"hierarchy-drill-state-for" : "~drillState",
					"hierarchy-level-for" : "~level",
					"hierarchy-node-descendant-count-for" : "~descendantCount",
					"hierarchy-node-for" : "~nodeKey",
					"hierarchy-preorder-rank-for" : "~preorderRank"
				},
				_getHeaders() {},
				_updateNodeInfoAfterSave : function () {},
				getNumberOfExpandedLevels : function () {},
				getResolvedPath : function () {}
			},
			oNode = {
				context : {
					getProperty : function () {}
				}
			},
			oNodeContextMock = this.mock(oNode.context),
			mURLParameters = {};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		oNodeContextMock.expects("getProperty").withExactArgs("~key0").returns("~value0");
		oNodeContextMock.expects("getProperty").withExactArgs("~key1").returns("~value1");
		this.mock(oBinding).expects("getNumberOfExpandedLevels")
			.withExactArgs()
			.returns("~iExpandedLevels");
		this.mock(_Helper).expects("extend")
			.withExactArgs({}, "~mParameters")
			.returns(mURLParameters);
		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(mURLParameters)
				.and(sinon.match.has("select",
					"~key0,~key1,~nodeKey,~descendantCount,~drillState,~preorderRank")))
			.returns("~URLParameters");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oModel).expects("read")
			.withExactArgs("~resolvedPath", {
				error : undefined,
				filters : [
					new Filter({
						filters : [
							new Filter("~key0", "EQ", "~value0"),
							new Filter("~key1", "EQ", "~value1"),
							new Filter("~level", "LE", "~iExpandedLevels")
						],
						and : true})
				],
				groupId : "~groupID",
				headers : "~headers",
				sorters : [],
				success : sinon.match.func,
				urlParameters : "~URLParameters"
			})
			.callsFake(function (sResolvedPath, mParameters0) {
				fnSuccess = mParameters0.success;
			});

		// code under test
		ODataTreeBindingFlat.prototype._generatePreorderPositionRequest.call(oBinding, oNode);

		this.mock(oBinding).expects("_updateNodeInfoAfterSave")
			.withExactArgs(sinon.match.same(oNode), []);

		// code under test
		fnSuccess({/*oData*/}, "~foo", "~bar");
	});

	//*********************************************************************************************
	QUnit.test("_calcIndexDelta", function (assert) {
		var oCollapsedNode0 = {
				initiallyCollapsed : false,
				isDeepOne : false,
				magnitude : 2, // subtracts 2 from collapsed delta
				serverIndex : 1
			},
			oCollapsedNode1 = {
				initiallyCollapsed : false,
				isDeepOne : false,
				magnitude : 1, // subtracts 1 from collapsed delta
				serverIndex : 4
			},
			oExpandedNode0 = {
				children : ["child0", "child1"], // adds 2 to the expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 0
			},
			oExpandedNode1 = {
				children : ["child0", "child1"], // will be ignored for expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 2
			},
			oExpandedNode2 = {
				children : ["child0", "child1"], // adds 2 to expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 3
			},
			oBinding = {
				_aCollapsed : [oCollapsedNode0, oCollapsedNode1],
				_aExpanded : [oExpandedNode0, oExpandedNode1, oExpandedNode2],
				_getRelatedServerIndex : function () {}
			},
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oCollapsedNode0).returns(1);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oCollapsedNode1).returns(4);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode0).returns(0);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode1).returns(2);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode2).returns(3);

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._calcIndexDelta.call(oBinding, 5), 1);
	});

	//*********************************************************************************************
	QUnit.test("_requestServerIndexNodes: calls _getHeaders", function (assert) {
		const oBinding = {
			_aPendingRequests: [],
			oModel: {
				read() {}
			},
			oTreeProperties: {
				"hierarchy-level-for": "~hierarchy-level-for"
			},
			_getHeaders() {},
			getNumberOfExpandedLevels() {},
			getResolvedPath() {}
		};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("getNumberOfExpandedLevels").withExactArgs().returns(13);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		oBindingMock.expects("_getHeaders").withExactArgs().returns("~headers");
		const oReadExpectation = this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: sinon.match.func,
				filters: [new Filter({filters: [new Filter("~hierarchy-level-for", "LE", 13)], and: true})],
				groupId: undefined, // not relevant for this test
				headers: "~headers",
				sorters: [],
				success: sinon.match.func,
				urlParameters: ["$skip=3", "$top=142", "$inlinecount=allpages"]
			})
			.returns("~oReadHandle");

		// code under test
		const oResultPromise = ODataTreeBindingFlat.prototype._requestServerIndexNodes.call(oBinding, 3, 42, 100);

		assert.deepEqual(oBinding._aPendingRequests,
			[{oRequestHandle: "~oReadHandle", iSkip: 3, iTop: 142, iThreshold: 100}]);
		assert.ok(oResultPromise instanceof Promise);

		// code under test
		oReadExpectation.args[0][1].success("~oData");

		return oResultPromise.then((oResult) => {
			assert.deepEqual(oResult, {oData: "~oData", iSkip: 3, iTop: 142});
			assert.deepEqual(oBinding._aPendingRequests, []);
		});
	});

	//*********************************************************************************************
	QUnit.test("_requestChildren: calls _getHeaders", function (assert) {
		const oBinding = {
			_aPendingChildrenRequests: [],
			oModel: {
				read() {}
			},
			oTreeProperties: {
				"hierarchy-node-for": "~hierarchy-node-for",
				"hierarchy-parent-node-for": "~hierarchy-parent-node-for"
			},
			_getHeaders() {},
			getResolvedPath() {}
		};
		const oParentNode = {
			key: "~parentNodeKey",
			context: {
				getProperty() {}
			}
		};
		this.mock(oParentNode.context).expects("getProperty")
			.withExactArgs("~hierarchy-node-for")
			.returns("~sHierarchyNodeValue");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		const oReadExpectation = this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: sinon.match.func,
				filters: [
					new Filter({
						filters: [new Filter("~hierarchy-parent-node-for", "EQ", "~sHierarchyNodeValue")],
						and: true
					})],
				groupId: undefined, // not relevant for this test
				headers: "~headers",
				sorters: [],
				success: sinon.match.func,
				urlParameters: ["$skip=~skip", "$top=~top", "$inlinecount=allpages"]
			})
			.returns("~oReadHandle");

		// code under test
		const oResultPromise = ODataTreeBindingFlat.prototype._requestChildren.call(oBinding, oParentNode,
			"~skip", "~top");

		assert.deepEqual(oBinding._aPendingChildrenRequests,
			[{sParent: "~parentNodeKey", oRequestHandle: "~oReadHandle", iSkip: "~skip", iTop: "~top"}]);
		assert.ok(oResultPromise instanceof Promise);

		// code under test
		oReadExpectation.args[0][1].success("~oData");

		return oResultPromise.then((oResult) => {
			assert.deepEqual(oResult, {oData: "~oData", iSkip: "~skip", iTop: "~top"});
			assert.deepEqual(oBinding._aPendingChildrenRequests, []);
		});
	});

	//*********************************************************************************************
	QUnit.test("_requestSubTree: calls _getHeaders", function (assert) {
		const oBinding = {
			_aPendingSubtreeRequests: [],
			oModel: {
				read() {}
			},
			oTreeProperties: {
				"hierarchy-level-for": "~hierarchy-level-for",
				"hierarchy-node-for": "~hierarchy-node-for"
			},
			_getHeaders() {},
			getResolvedPath() {}
		};
		const oParentNode = {
			key: "~parentNodeKey",
			context: {
				getProperty() {}
			}
		};
		this.mock(oParentNode.context).expects("getProperty")
			.withExactArgs("~hierarchy-node-for")
			.returns("~sHierarchyNodeForProperty");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		const oExpectedNodeFilter = new Filter("~hierarchy-node-for", "EQ", "~sHierarchyNodeForProperty");
		const oExpectedLevelFilter = new Filter("~hierarchy-level-for", "LE", "~iLevel");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		const oReadExpectation = this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: sinon.match.func,
				filters: [new Filter({filters: [oExpectedNodeFilter, oExpectedLevelFilter], and: true})],
				groupId: undefined, // not relevant for this test
				headers: "~headers",
				sorters: [],
				success: sinon.match.func,
				urlParameters: []
			})
			.returns("~oReadHandle");

		// code under test
		const oResultPromise = ODataTreeBindingFlat.prototype._requestSubTree.call(oBinding, oParentNode, "~iLevel");

		assert.deepEqual(oBinding._aPendingSubtreeRequests,
			[{sParent: "~parentNodeKey", iLevel: "~iLevel", oRequestHandle: "~oReadHandle"}]);
		assert.ok(oResultPromise instanceof Promise);

		// code under test
		oReadExpectation.args[0][1].success("~oData");

		return oResultPromise.then((oResult) => {
			assert.deepEqual(oResult, {oData: "~oData", iLevel: "~iLevel", sParent: "~parentNodeKey"});
			assert.deepEqual(oBinding._aPendingSubtreeRequests, []);
		});
	});

	//*********************************************************************************************
	QUnit.test("_generateSiblingsPositionRequest: calls _getHeaders", function (assert) {
		const oBinding = {
			oModel: {
				createCustomParams() {},
				read() {}
			},
			mParameters: {foo: "~bar"},
			oTreeProperties: {
				"hierarchy-sibling-rank-for": "~hierarchy-sibling-rank-for"
			},
			_getHeaders() {}
		};
		const oNode = {
			context: {
				getPath() {}
			}
		};
		this.mock(oNode.context).expects("getPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding.oModel).expects("createCustomParams")
			.withExactArgs(sinon.match((oParams) => {
				assert.notStrictEqual(oParams, oBinding.mParameters);
				assert.deepEqual(oParams, {
					foo: "~bar",
					select: "~hierarchy-sibling-rank-for"
				});
				return true;
			}))
			.returns("~mCustomParams");
		this.mock(oBinding).expects("_getHeaders").withExactArgs().returns("~headers");
		this.mock(oBinding.oModel).expects("read")
			.withExactArgs("~sAbsolutePath", {
				error: "~error",
				groupId: "~groupId",
				headers: "~headers",
				success: "~success",
				urlParameters: "~mCustomParams"
			})
			.returns("~oReadHandle");
		const mParameters = {
			error: "~error",
			groupId: "~groupId",
			success: "~success"
		};

		// code under test
		ODataTreeBindingFlat.prototype._generateSiblingsPositionRequest.call(oBinding, oNode, mParameters);
	});
});
