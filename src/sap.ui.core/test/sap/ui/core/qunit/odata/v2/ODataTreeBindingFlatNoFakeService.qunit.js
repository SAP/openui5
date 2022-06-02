/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/ODataTreeBindingFlat",
	"sap/ui/test/TestUtils"
], function (Log, ODataTreeBindingFlat, TestUtils) {
	/*global QUnit,sinon*/
	"use strict";

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
	QUnit.test("_getCorrectChangeGroup: getResolvedPath is called", function (assert) {
		var oBinding = {
				oModel : {_resolveGroup : function () {}},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_resolveGroup").withExactArgs("~resolvedPath")
			.returns({groupId : "~changeGroup"});

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._getCorrectChangeGroup.call(oBinding),
			"~changeGroup");
	});

	//*********************************************************************************************
	QUnit.test("createEntry: getResolvedPath is called", function (assert) {
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
	QUnit.test("submitChanges: getResolvedPath is called", function (assert) {
		var oBinding = {
				_optimizeChanges : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oBinding).expects("_optimizeChanges").withExactArgs().returns(undefined);
		this.oLogMock.expects("warning")
			.withExactArgs("ODataTreeBindingFlat: submitChanges failed, because the binding-path"
				+ " could not be resolved.");

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);
	});

	//*********************************************************************************************
[false, true].forEach(function(bRestoreTreeStateSupported) {
	var sTitle = "submitChanges: successful submit, _isRestoreTreeStateSupported="
			+ bRestoreTreeStateSupported + "; call "
			+ (bRestoreTreeStateSupported ? "_restoreTreeState" : "_refresh");
	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				oModel : {
					submitChanges : function () {}
				},
				_generateSubmitData : function () {},
				_getCorrectChangeGroup : function () {},
				_isRestoreTreeStateSupported : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				_restoreTreeState : function () {},
				getResolvedPath : function () {}
			},
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]},
			fnSuccess;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns("~oOptimizedChanges");
		this.mock(oBinding).expects("_getCorrectChangeGroup")
			.withExactArgs("~sAbsolutePath")
			.returns("~groupId");
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs("~oOptimizedChanges", sinon.match.func);
		this.mock(oBinding.oModel).expects("submitChanges")
			.withExactArgs({
				error : sinon.match.func,
				groupId : "~groupId",
				success : sinon.match.func
			})
			.callsFake(function (mParameters) {
				fnSuccess = mParameters.success;
			});

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);

		this.mock(oBinding).expects("_isRestoreTreeStateSupported")
			.withExactArgs()
			.returns(bRestoreTreeStateSupported);
		this.mock(oBinding).expects("_restoreTreeState")
			.withExactArgs("~oOptimizedChanges")
			.exactly(bRestoreTreeStateSupported ? 1 : 0)
			.returns(Promise.resolve());
		this.mock(oBinding).expects("_refresh")
			.withExactArgs(true)
			.exactly(bRestoreTreeStateSupported ? 0 : 1);

		// code under test - ODataModel#processSuccess calls the success handler with response data
		fnSuccess(oResponseData);
	});
});

	//*********************************************************************************************
	QUnit.test("submitChanges: _restoreTreeState returns rejected promise", function (assert) {
		var oBinding = {
				oModel : {
					submitChanges : function () {}
				},
				_generateSubmitData : function () {},
				_getCorrectChangeGroup : function () {},
				_isRestoreTreeStateSupported : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				_restoreTreeState : function () {},
				getResolvedPath : function () {}
			},
			oError = {message: "~message", stack: "~stack"},
			oPromise = Promise.reject(oError),
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]},
			fnSuccess;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns("~oOptimizedChanges");
		this.mock(oBinding).expects("_getCorrectChangeGroup")
			.withExactArgs("~sAbsolutePath")
			.returns("~groupId");
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs("~oOptimizedChanges", sinon.match.func);
		this.mock(oBinding.oModel).expects("submitChanges")
			.withExactArgs({
				error : sinon.match.func,
				groupId : "~groupId",
				success : sinon.match.func
			})
			.callsFake(function (mParameters) {
				fnSuccess = mParameters.success;
			});

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);

		this.mock(oBinding).expects("_isRestoreTreeStateSupported").withExactArgs().returns(true);
		this.mock(oBinding).expects("_restoreTreeState")
			.withExactArgs("~oOptimizedChanges")
			.returns(oPromise);
		this.oLogMock.expects("error")
			.withExactArgs("ODataTreeBindingFlat - ~message", "~stack");
		this.mock(oBinding).expects("_refresh").withExactArgs(true);

		// code under test - ODataModel#processSuccess calls the success handler with response data
		fnSuccess(oResponseData);

		return oPromise.catch(function () {});
	});

	//*********************************************************************************************
	QUnit.test("submitChanges: successful submit, restore request failed, "
			+ "don't restore tree state, refresh instead", function (assert) {
		var oBinding = {
				oModel : {
					submitChanges : function () {}
				},
				_generateSubmitData : function () {},
				_getCorrectChangeGroup : function () {},
				_optimizeChanges : function () {},
				_refresh : function () {},
				getResolvedPath : function () {}
			},
			oResponseData = {__batchResponses : [{__changeResponses : [{statusCode : "200"}]}]},
			fnSuccess,
			that = this;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~sAbsolutePath");
		this.mock(oBinding).expects("_optimizeChanges")
			.withExactArgs()
			.returns("~oOptimizedChanges");
		this.mock(oBinding).expects("_getCorrectChangeGroup")
			.withExactArgs("~sAbsolutePath")
			.returns("~groupId");
		this.mock(oBinding).expects("_generateSubmitData")
			.withExactArgs("~oOptimizedChanges", sinon.match.func)
			.callsFake(function (oOptimizedChanges, fnError) {
				that.oLogMock.expects("error")
					.withExactArgs("ODataTreeBindingFlat - Tree state restoration request failed. "
						+ "~message", "~stack");

				// code under test
				fnError({message: "~message", stack: "~stack"});
			});
		this.mock(oBinding.oModel).expects("submitChanges")
			.withExactArgs({
				error : sinon.match.func,
				groupId : "~groupId",
				success : sinon.match.func
			})
			.callsFake(function (mParameters) {
				fnSuccess = mParameters.success;
			});

		// code under test
		ODataTreeBindingFlat.prototype.submitChanges.call(oBinding);

		this.mock(oBinding).expects("_refresh").withExactArgs(true);

		// code under test - ODataModel#processSuccess calls the success handler with response data
		fnSuccess(oResponseData);
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
				oModel : {setProperty : function () {}},
				oTreeProperties : {
					"hierarchy-node-for" : "~hierarchyNode",
					"hierarchy-parent-node-for" : "~hierarchyParentNode"
				},
				_generatePreorderPositionRequest : function () {},
				_generateSiblingsPositionRequest : function () {},
				_getCorrectChangeGroup : function () {},
				_isRestoreTreeStateSupported : function () {}
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

		oBindingMock.expects("_getCorrectChangeGroup").withExactArgs().returns("~groupId");
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
});