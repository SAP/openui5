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
});