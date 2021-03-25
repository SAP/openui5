/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/TreeBindingAdapter",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, TreeAutoExpandMode, TreeBinding, TreeBindingAdapter, TestUtils) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.TreeBindingAdapter", {
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
	QUnit.test("getContexts: unresolved binding", function (assert) {
		var oBinding = {
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test - parameters are not relevant for this test
		assert.deepEqual(TreeBindingAdapter.prototype.getContexts.call(oBinding), []);
	});

	//*********************************************************************************************
[undefined, true].forEach(function (bCollapseRecursive, i) {
	QUnit.test("collapseToLevel: set number of expanded levels, " + i, function (assert) {
		var oBinding = {
				bCollapseRecursive : bCollapseRecursive,
				_fireChange : function () {},
				_mTreeState : {
					expanded : {}
				},
				setNumberOfExpandedLevels : function () {}
			};

		this.mock(oBinding).expects("setNumberOfExpandedLevels")
			.exactly(bCollapseRecursive ? 1 : 0)
			.withExactArgs(42);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Collapse});

		// code under test
		TreeBindingAdapter.prototype.collapseToLevel.call(oBinding, 42);
	});
});
});