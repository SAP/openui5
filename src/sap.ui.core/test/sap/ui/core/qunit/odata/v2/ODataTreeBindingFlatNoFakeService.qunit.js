/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/odata/ODataTreeBindingFlat",
	"sap/ui/test/TestUtils"
], function (Log, TreeBinding, ODataTreeBindingFlat, TestUtils) {
	/*global QUnit,sinon*/
	"use strict";

	var sClassName = "sap.ui.model.odata.ODataTreeBindingFlat";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.ODataTreeBindingFlat (ODataTreeBindingFlatNoFakeService)", {
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
}].forEach(function (oFixture) {
	QUnit.test("createEntry: resolved binding", function (assert) {
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

	//*********************************************************************************************
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

	//*********************************************************************************************
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
				oModel : {deleteCreatedEntry : function () {}}
			},
			oNode = {
				context : "~oContext",
				nodeState : {added : true}
			};

		this.mock(oBinding.oModel).expects("deleteCreatedEntry").withExactArgs("~oContext");

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
});