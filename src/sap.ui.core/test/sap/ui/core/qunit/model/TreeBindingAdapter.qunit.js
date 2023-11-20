/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/TreeAutoExpandMode",
	"sap/ui/model/TreeBinding",
	"sap/ui/model/TreeBindingAdapter"
], function (Log, ChangeReason, TreeAutoExpandMode, TreeBinding, TreeBindingAdapter) {
	/*global QUnit,sinon*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.TreeBindingAdapter", {
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
[{
	mParameters : undefined,
	sAutoExpandMode : TreeAutoExpandMode.Sequential,
	bCollapseRecursive : true
}, {
	mParameters : {collapseRecursive : false},
	sAutoExpandMode : TreeAutoExpandMode.Sequential,
	bCollapseRecursive : false
}, {
	mParameters : {collapseRecursive : null},
	sAutoExpandMode : TreeAutoExpandMode.Sequential,
	bCollapseRecursive : false
}, {
	mParameters : {autoExpandMode : "~autoExpandMode", collapseRecursive : true},
	sAutoExpandMode : "~autoExpandMode",
	bCollapseRecursive : true
}, {
	mParameters : {collapseRecursive : "truthy"},
	sAutoExpandMode : TreeAutoExpandMode.Sequential,
	bCollapseRecursive : true
}].forEach(function (oFixture) {
	QUnit.test("initialization: applying on TreeBinding instance", function (assert) {
		var oBinding = new TreeBinding({/*oModel*/}, "/path", /*oContext*/undefined,
				/*aFilters*/undefined, oFixture.mParameters),
			aMethodNames = Object.keys(TreeBindingAdapter.prototype);

		aMethodNames.forEach(function (sMethodName) {
			oBinding[sMethodName] = function () {};
		});
		assert.strictEqual(oBinding._bIsAdapted, undefined);
		this.mock(TreeBindingAdapter.prototype).expects("_createTreeState").withExactArgs();
		this.mock(TreeBindingAdapter.prototype).expects("setAutoExpandMode")
			.withExactArgs(oFixture.sAutoExpandMode);

		// code under test
		TreeBindingAdapter.apply(oBinding);

		aMethodNames.forEach(function (sMethodName) {
			assert.strictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
		});
		assert.strictEqual(oBinding.bCollapseRecursive, oFixture.bCollapseRecursive);
		assert.strictEqual(oBinding._bIsAdapted, true);
		assert.strictEqual(oBinding._iPageSize, 0);
		if (!oFixture.mParameters) {
			assert.deepEqual(oBinding.mParameters, {});
		} else {
			assert.strictEqual(oBinding.mParameters, oFixture.mParameters);
		}
		assert.deepEqual(oBinding._aRowIndexMap, []);
		assert.strictEqual(oBinding._iThreshold, 0);
	});
});

	//*********************************************************************************************
	QUnit.test("initialization: skipped for non-TreeBinding", function (assert) {
		var oBinding = {},
			aMethodNames = Object.keys(TreeBindingAdapter.prototype);

		aMethodNames.forEach(function (sMethodName) {
			oBinding[sMethodName] = function () {};
		});

		// code under test
		TreeBindingAdapter.apply(oBinding);

		aMethodNames.forEach(function (sMethodName) {
			assert.notStrictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
		});
	});

	//*********************************************************************************************
	QUnit.test("initialization: skip if already applied", function (assert) {
		var oBinding = new TreeBinding({/*oModel*/}, "/path"),
			aMethodNames = Object.keys(TreeBindingAdapter.prototype);

		oBinding._bIsAdapted = true; // simulate already applied
		oBinding._iThreshold = "~_iThreshold";

		// code under test
		TreeBindingAdapter.apply(oBinding);

		// functions and members are not overwritten
		aMethodNames.forEach(function (sMethodName) {
			assert.notStrictEqual(oBinding[sMethodName], TreeBindingAdapter.prototype[sMethodName]);
		});
		assert.strictEqual(oBinding._iThreshold, "~_iThreshold");
	});

	//*********************************************************************************************
	QUnit.test("getContexts: delegates to _getContextsOrNodes", function (assert) {
		var oBinding = new TreeBinding({/*oModel*/}, "/path");

		TreeBindingAdapter.apply(oBinding);

		this.mock(oBinding).expects("_getContextsOrNodes")
			.withExactArgs(false, "~iStartIndex", "~iLength", "~iThreshold")
			.returns("~result");

		// code under test
		assert.strictEqual(oBinding.getContexts("~iStartIndex", "~iLength", "~iThreshold"),
			"~result");
	});

	//*********************************************************************************************
	QUnit.test("getNodes: delegates to _getContextsOrNodes", function (assert) {
		var oBinding = new TreeBinding({/*oModel*/}, "/path");

		TreeBindingAdapter.apply(oBinding);

		this.mock(oBinding).expects("_getContextsOrNodes")
			.withExactArgs(true, "~iStartIndex", "~iLength", "~iThreshold")
			.returns("~result");

		// code under test
		assert.strictEqual(oBinding.getNodes("~iStartIndex", "~iLength", "~iThreshold"),
			"~result");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: unresolved binding", function (assert) {
		var oBinding = {
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test - parameters are not relevant for this test
		assert.deepEqual(TreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding), []);
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: iStartIndex is undefined", function (assert) {
		var oBinding = {
				_oRootNode : "~oRootNode",
				_iThreshold : "~threshold",
				oModel : {iSizeLimit : "~iSizeLimit"},
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isInitial : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [];

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("isInitial").withExactArgs().returns(false);
		this.mock(Math).expects("max").withExactArgs("~threshold", 0).returns("~newThreshold");
		oBindingMock.expects("_buildTree").withExactArgs(0, "~iSizeLimit");
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs("~oRootNode", 0, "~iSizeLimit")
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap").withExactArgs(sinon.match.same(aNodes), 0);

		// code under test
		assert.deepEqual(TreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, false),
			[]);

		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
	});

	//*********************************************************************************************
	QUnit.test("_getContextsOrNodes: iStartIndex is set", function (assert) {
		var oBinding = {
				_oRootNode : "~oRootNode",
				_iThreshold : "~threshold",
				_buildTree : function () {},
				_retrieveNodeSection : function () {},
				_updateRowIndexMap : function () {},
				isInitial : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aNodes = [],
			aResult;

		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("isInitial").withExactArgs().returns(false);
		this.mock(Math).expects("max").withExactArgs("~threshold", 5).returns("~newThreshold");
		oBindingMock.expects("_buildTree").withExactArgs(11, 50);
		oBindingMock.expects("_retrieveNodeSection")
			.withExactArgs("~oRootNode", 11, 50)
			.returns(aNodes);
		oBindingMock.expects("_updateRowIndexMap").withExactArgs(sinon.match.same(aNodes), 11);

		// code under test
		aResult = TreeBindingAdapter.prototype._getContextsOrNodes.call(oBinding, true, 11, 50, 5);

		assert.deepEqual(aResult, []);
		assert.strictEqual(oBinding._iThreshold, "~newThreshold");
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