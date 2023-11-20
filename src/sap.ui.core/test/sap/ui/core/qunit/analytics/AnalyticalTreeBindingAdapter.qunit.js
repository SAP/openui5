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
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : {groupID : "~groupID"},
				_autoExpandPaging : function () {},
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [
				{context : "~oContext0", groupID : "~groupID"},
				{context : "~oContext1", groupID : "~otherGroupID"}
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
				{context : "~oContext0", groupID : "~groupID"},
				{context : "~oContext1", groupID : "~otherGroupID"}
		])), 3);
		oBindingMock.expects("_autoExpandPaging").withExactArgs();

		// code under test
		aResult = AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true,
			3, 2);

		assert.strictEqual(aResult, aNodes);
		assert.deepEqual(aResult, [{context : "~oContext0", groupID : "~groupID"}]);
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
});