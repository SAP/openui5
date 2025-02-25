/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/analytics/AnalyticalTreeBindingAdapter"
], function (Log, TreeAutoExpandMode, AnalyticalTreeBindingAdapter) {
	/*global QUnit,sinon*/
	"use strict";
	const sClassName = "sap.ui.model.analytics.AnalyticalTreeBindingAdapter";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.AnalyticalTreeBindingAdapter", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
		var oBinding = {
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test - parameters are not relevant for this test
		assert.deepEqual(AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding),
			[]);
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: iStartIndex is undefined, no watermark", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : undefined,
				oModel : {iSizeLimit : "~iSizeLimit"},
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [{context : "~oContext"}];

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		this.mock(Math).expects("max").withExactArgs("~threshold", 0).returns("~newThreshold");
		oBindingMock.expects("_buildTree").withExactArgs(0, "~iSizeLimit");
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs(sinon.match.same(oBinding._oRootNode), 0, "~iSizeLimit")
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap").withExactArgs(sinon.match.same(aNodes), 0);

		// code under test
		assert.deepEqual(
			AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, false),
			["~oContext"]);

		assert.strictEqual(oBinding._iPageSize, "~iSizeLimit");
		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: iStartIndex is set, no watermark", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : undefined,
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [{context : "~oContext"}],
			aResult;

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_buildTree").withExactArgs(11, 50);
		this.mock(Math).expects("max").withExactArgs("~threshold", 5).returns("~newThreshold");
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs(sinon.match.same(oBinding._oRootNode), 11, 50)
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap").withExactArgs(sinon.match.same(aNodes), 11);

		// code under test
		aResult = AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true,
			11, 50, 5);

		assert.deepEqual(aResult, [{context : "~oContext"}]);
		assert.strictEqual(oBinding._iPageSize, 50);
		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: with watermark, no paging needed", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : {groupID : "~groupID"},
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [
				{context : "~oContext0", groupID : "~otherGroupID"},
				{context : "~oContext1", groupID : "~groupID"}
			],
			aResult;

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_buildTree").withExactArgs(3, 2);
		this.mock(Math).expects("max").withExactArgs("~threshold", 0).returns("~newThreshold");
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs(sinon.match.same(oBinding._oRootNode), 3, 2)
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap")
			.withExactArgs(sinon.match.same(aNodes).and(sinon.match([
				{context : "~oContext0", groupID : "~otherGroupID"},
				{context : "~oContext1", groupID : "~groupID"}
			])), 3);

		// code under test
		aResult = AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true,
			3, 2);

		assert.deepEqual(aResult, [
			{context : "~oContext0", groupID : "~otherGroupID"},
			{context : "~oContext1", groupID : "~groupID"}
		]);
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: with watermark, paging needed", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes", absoluteNodeIndex : -1},
				_iThreshold : "~threshold",
				_oWatermark : {groupID : "~groupID", lastWatermarkNodeIndex : 42},
				_autoExpandPaging : function () {},
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [
				{context : "~oContext0", absoluteNodeIndex : 41},
				{context : "~oContext1", absoluteNodeIndex : 42},
				{context : "~oContext2", absoluteNodeIndex : 43},
				{context : "~oContext3", absoluteNodeIndex : 44}
			],
			aResult;

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_buildTree").withExactArgs(3, 4);
		this.mock(Math).expects("max").withExactArgs("~threshold", 0).returns("~newThreshold");
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs(sinon.match.same(oBinding._oRootNode), 3, 4)
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap")
			.withExactArgs(sinon.match.same(aNodes).and(sinon.match([
				{context : "~oContext0", absoluteNodeIndex : 41},
				{context : "~oContext1", absoluteNodeIndex : 42},
				{context : "~oContext2", absoluteNodeIndex : 43},
				{context : "~oContext3", absoluteNodeIndex : 44}
		])), 3);
		oBindingMock.expects("_autoExpandPaging").withExactArgs();

		// code under test
		aResult = AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true, 3, 4);

		assert.strictEqual(aResult, aNodes);
		assert.deepEqual(aResult, [
			{context : "~oContext0", absoluteNodeIndex : 41},
			{context : "~oContext1", absoluteNodeIndex : 42},
			{context : "~oContext2", absoluteNodeIndex : 43}
		]);
	});

	//*********************************************************************************************
	QUnit.test("getLength: no root node", function (assert) {
		// code under test
		assert.strictEqual(
			AnalyticalTreeBindingAdapter.prototype.getLength.call({/*oBinding*/}),
			0);
	});

	//*********************************************************************************************
[{
	oBinding : {
		_oRootNode : {magnitude : 42, numberOfTotals : 13},
		_oWatermark : undefined
	},
	iResult : 55
}, {
	oBinding : {
		_oRootNode : {magnitude : 123, numberOfTotals : 15},
		_oWatermark : {/*any watermark*/}
	},
	iResult : 139
}].forEach(function (oFixture, i) {
	QUnit.test("getLength: with root node, #" + i, function (assert) {
		// code under test
		assert.strictEqual(
			AnalyticalTreeBindingAdapter.prototype.getLength.call(oFixture.oBinding),
			oFixture.iResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_getIndexBeforeFirstMissingNode", function (assert) {
		const oBinding = {
			mFinalLength: {"~groupID": true},
			_getIndexBeforeFirstMissingNode() {}
		};
		const oNode = {absoluteNodeIndex: 42, children: []};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_getIndexBeforeFirstMissingNode").never();
		const _getIndexBeforeFirstMissingNode = AnalyticalTreeBindingAdapter.prototype._getIndexBeforeFirstMissingNode;
		// code under test
		assert.strictEqual(_getIndexBeforeFirstMissingNode.call(oBinding, oNode), 42);

		const oLeaf0 = {absoluteNodeIndex: 43, isLeaf: true};
		const oLeaf1 = {absoluteNodeIndex: 44, isLeaf: true};
		oNode.children = [oLeaf0, oLeaf1];

		// code under test
		assert.strictEqual(_getIndexBeforeFirstMissingNode.call(oBinding, oNode), 44);

		const oExpanded2 = {groupID: "~groupID", isLeaf: false};
		oNode.children = [oLeaf0, oLeaf1, oExpanded2];
		oBindingMock.expects("_getIndexBeforeFirstMissingNode")
			.withExactArgs(sinon.match.same(oExpanded2))
			.returns("~iWatermarkIndex");

		// code under test
		assert.strictEqual(_getIndexBeforeFirstMissingNode.call(oBinding, oNode), "~iWatermarkIndex");

		const oLeaf3 = {absoluteNodeIndex: 51, isLeaf: true};
		oNode.children = [oLeaf0, oLeaf1, oExpanded2, oLeaf3];
		oBindingMock.expects("_getIndexBeforeFirstMissingNode")
			.withExactArgs(sinon.match.same(oExpanded2))
			.returns("~iWatermarkIndex");

		// code under test
		assert.strictEqual(_getIndexBeforeFirstMissingNode.call(oBinding, oNode), 51);

		oBinding.mFinalLength["~groupID"] = false;
		oBindingMock.expects("_getIndexBeforeFirstMissingNode")
			.withExactArgs(sinon.match.same(oExpanded2))
			.returns("~iWatermarkIndex");

		// code under test
		assert.strictEqual(_getIndexBeforeFirstMissingNode.call(oBinding, oNode), "~iWatermarkIndex");
	});

	//*********************************************************************************************
[true, false].forEach((bMoveWatermark) => {
	QUnit.test("_loadChildContexts: calls _getIndexBeforeFirstMissingNode; move watermark: " + bMoveWatermark,
			function (assert) {
		const oBinding = {
			aAggregationLevel: [],
			mFinalLength: {"~groupID": false},
			_oWatermark: undefined,
			_createSumNode() {},
			_getIndexBeforeFirstMissingNode() {},
			_isRunningInAutoExpand() {},
			getGroupSize() {}
		};
		const oNode = {
			absoluteNodeIndex: "~absoluteNodeIndex",
			autoExpand: 1,
			children: [],
			context: "~oContext",
			groupID: "~groupID",
			isLeaf: false,
			level: "~level",
			magnitude: 10,
			nodeState: {sections: []},
			numberOfTotals: 5,
			parent: {
				absoluteNodeIndex: "~parentNodeAbsoluteNodeIndex",
				autoExpand: "~parentNodeAutoExpand",
				context: "~parentNodeContext",
				groupID: "~parentNodeGroupID",
				level: "~parentNodeLevel"
			},
			positionInParent: "~positionInParent"
		};

		this.mock(oBinding).expects("_isRunningInAutoExpand").withExactArgs(TreeAutoExpandMode.Bundled).returns(true);
		this.mock(oBinding).expects("getGroupSize")
			.withExactArgs("~oContext", "~level")
			.returns(bMoveWatermark ? -1 : 3);
		this.mock(oBinding).expects("_createSumNode")
			.withExactArgs(sinon.match.same(oNode))
			.exactly(bMoveWatermark ? 0 : 1)
			.returns("~sumNode");
		this.mock(oBinding).expects("_getIndexBeforeFirstMissingNode")
			.withExactArgs(sinon.match.same(oNode))
			.returns("~IndexBeforeFirstMissingNode");
		this.oLogMock.expects("debug").withExactArgs(bMoveWatermark
			? "WATERMARK: at '~groupID' (~absoluteNodeIndex) and start index 0 with last complete node index"
				+ " ~IndexBeforeFirstMissingNode --> moved to '~parentNodeGroupID' (~parentNodeAbsoluteNodeIndex) and"
				+ " start index ~positionInParent"
			: "WATERMARK: at '~groupID' (~absoluteNodeIndex) and start index 3 with last complete node index"
				+ " ~IndexBeforeFirstMissingNode",
			undefined, sClassName);

		// code under test
		AnalyticalTreeBindingAdapter.prototype._loadChildContexts.call(oBinding, oNode, "~oRecursionDetails");

		assert.strictEqual(oNode.children.length, bMoveWatermark ? 0 : 3);
		assert.strictEqual(oNode.sumNode, bMoveWatermark ? undefined : "~sumNode");
		assert.strictEqual(oNode.magnitude, bMoveWatermark ? 10 : 13);
		assert.strictEqual(oNode.numberOfTotals, bMoveWatermark ? 5 : 6);
		assert.deepEqual(oBinding._oWatermark, bMoveWatermark
			? {
				absoluteNodeIndex: "~parentNodeAbsoluteNodeIndex",
				autoExpand: "~parentNodeAutoExpand",
				context: "~parentNodeContext",
				groupID: "~parentNodeGroupID",
				lastWatermarkNodeIndex: "~IndexBeforeFirstMissingNode",
				level: "~parentNodeLevel",
				startIndex: "~positionInParent"
			}
			: {
				absoluteNodeIndex: "~absoluteNodeIndex",
				autoExpand: 1,
				context: "~oContext",
				groupID: "~groupID",
				lastWatermarkNodeIndex: "~IndexBeforeFirstMissingNode",
				level: "~level",
				startIndex: 3
			});
	});
});

	//*********************************************************************************************
[false, true].forEach((bHasSibling) => {
	QUnit.test("collapse: calls _getIndexBeforeFirstMissingNode, has sibling: " + bHasSibling, function (assert) {
		const oBinding = {
			_mTreeState: {expanded: {}, selected: {}},
			_oWatermark: {
				groupID: "~groupID/watermark/node"
			},
			bCollapseRecursive: true,
			_autoExpandPaging() {},
			_getIndexBeforeFirstMissingNode() {},
			_isRunningInAutoExpand() {},
			_updateTreeState() {},
			findNode() {}
		};
		const oParentNode = {
			children: [{/*child node*/}]
		};
		const oNode = {
			nodeState: {groupID: "~groupID"},
			parent: oParentNode,
			positionInParent: 1
		};
		oParentNode.children.push(oNode);
		if (bHasSibling) {
			oParentNode.children.push("~sibling node");
		}
		this.mock(oBinding).expects("findNode").withExactArgs(42).returns(oNode);
		this.mock(oBinding).expects("_updateTreeState").withExactArgs({groupID: "~groupID", expanded: false});
		this.mock(oBinding).expects("_isRunningInAutoExpand").withExactArgs(TreeAutoExpandMode.Bundled).returns(true);
		this.mock(oBinding).expects("_getIndexBeforeFirstMissingNode")
			.withExactArgs(sinon.match.same(bHasSibling ? "~sibling node" : oNode))
			.returns("~lastWatermarkNodeIndex");
		this.mock(oBinding).expects("_autoExpandPaging").withExactArgs();


		// code under test
		AnalyticalTreeBindingAdapter.prototype.collapse.call(oBinding, 42);

		assert.strictEqual(oNode.nodeState.selectAllMode, false);
	});
});
});