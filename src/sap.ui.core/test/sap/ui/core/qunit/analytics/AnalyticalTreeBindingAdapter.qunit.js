/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/analytics/AnalyticalTreeBindingAdapter",
	"sap/ui/test/TestUtils"
], function (Log, TreeAutoExpandMode, AnalyticalTreeBindingAdapter, TestUtils) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.analytics.AnalyticalTreeBindingAdapter", {
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
	QUnit.test("_getContextsOrNodes: iStartIndex is undefined", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : {groupID : "changes"},
				oModel : {iSizeLimit : "~iSizeLimit"},
				_autoExpandPaging : function () {},
				_buildTree : function () {},
				_isRunningInAutoExpand : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				getLength : function () {},
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
		oBindingMock.expects("_isRunningInAutoExpand")
			.withExactArgs(TreeAutoExpandMode.Bundled)
			.returns(true);
		oBindingMock.expects("getLength").withExactArgs().returns(2);
		oBindingMock.expects("_autoExpandPaging").withExactArgs();

		// code under test
		assert.deepEqual(
			AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, false),
			["~oContext"]);

		assert.strictEqual(oBinding._iPageSize, "~iSizeLimit");
		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: iStartIndex is set", function (assert) {
		var oBinding = {
				_oRootNode : {groupID : "changes"},
				_iThreshold : "~threshold",
				_oWatermark : {groupID : "changes"},
				_buildTree : function () {},
				_isRunningInAutoExpand : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				getLength : function () {},
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
		oBindingMock.expects("_isRunningInAutoExpand")
			.withExactArgs(TreeAutoExpandMode.Bundled)
			.returns(true);
		oBindingMock.expects("getLength").withExactArgs().returns(15);

		// code under test
		aResult = AnalyticalTreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true,
			11, 50, 5);

		assert.deepEqual(aResult, [{context : "~oContext"}]);
		assert.strictEqual(oBinding._iPageSize, 50);
		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
	});
});