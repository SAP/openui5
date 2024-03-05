/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_TreeState"
], function (Log, _Helper, _TreeState) {
	"use strict";

	const mustBeMocked = function () { throw new Error("Must be mocked"); };

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._TreeState", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		// code under test
		const oTreeState = new _TreeState("~sNodeProperty~", "~fnGetKeyFilter~");

		assert.ok(oTreeState instanceof _TreeState);
		assert.strictEqual(oTreeState.sNodeProperty, "~sNodeProperty~");
		assert.strictEqual(oTreeState.fnGetKeyFilter, "~fnGetKeyFilter~");
		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {});
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), []);
	});

	//*********************************************************************************************
	QUnit.test("expand/collapse", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		this.mock(_Helper).expects("getPrivateAnnotation").thrice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(_Helper).expects("drillDown").twice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels,
			{"~predicate~" : {NodeID : "~sNodeId~", Levels : 1}});

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels,
			{"~predicate~" : {NodeID : "~sNodeId~", Levels : 1}});

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {});
	});

	//*********************************************************************************************
	QUnit.test("collapse/expand", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		this.mock(_Helper).expects("getPrivateAnnotation").thrice()
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");
		this.mock(_Helper).expects("drillDown").twice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels,
			{"~predicate~" : {NodeID : "~sNodeId~", Levels : 0}});

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels,
			{"~predicate~" : {NodeID : "~sNodeId~", Levels : 0}});

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {});
	});

	//*********************************************************************************************
	QUnit.test("delete", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		oTreeState.mPredicate2ExpandLevels["foo"] = "bar";
		oTreeState.mPredicate2ExpandLevels["~predicate~"] = "~";
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");

		// code under test
		oTreeState.delete("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {foo : "bar"});
	});

	//*********************************************************************************************
["collapse", "delete", "expand"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": no sNodeProperty", function (assert) {
		const oTreeState = new _TreeState();

		oTreeState.mPredicate2ExpandLevels["foo"] = "bar";
		this.mock(_Helper).expects("drillDown").never();

		// code under test
		oTreeState[sMethod]("~oNode~");

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {foo : "bar"});
	});
});

	//*********************************************************************************************
	QUnit.test("getExpandLevels/reset", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.oOutOfPlace = "~oOutOfPlace~";

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), undefined);

		oTreeState.mPredicate2ExpandLevels["foo"] = {bar : 42};
		oTreeState.mPredicate2ExpandLevels["baz"] = {qux : 23};

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), '[{"bar":42},{"qux":23}]');

		// code under test
		oTreeState.reset();

		assert.deepEqual(oTreeState.mPredicate2ExpandLevels, {});
	});

	//*********************************************************************************************
	QUnit.test("setOutOfPlace/getOutOfPlaceGroupedByParent/reset", function (assert) {
		const fnGetKeyFilter = mustBeMocked;
		const oTreeState = new _TreeState("~sNodeProperty~", fnGetKeyFilter);

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), []);

		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent1~", "predicate")
			.returns("~parent1Predicate~");
		const oTreeStateMock = this.mock(oTreeState);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent1~")
			.returns("~parent1Filter~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode1~").returns("~node1Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode1~", "predicate")
			.returns("~node1Predicate~");

		// code under test
		oTreeState.setOutOfPlace("~oNode1~", "~oParent1~");

		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), [{
			nodeFilters : ["~node1Filter~"],
			nodePredicates : ["~node1Predicate~"],
			parentFilter : "~parent1Filter~",
			parentPredicate : "~parent1Predicate~"
		}]);

		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent2~", "predicate")
			.returns("~parent2Predicate~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent2~")
			.returns("~parent2Filter~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode3~").returns("~node3Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode3~", "predicate")
			.returns("~node3Predicate~");

		// code under test
		oTreeState.setOutOfPlace("~oNode3~", "~oParent2~");

		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), [{
			nodeFilters : ["~node1Filter~"],
			nodePredicates : ["~node1Predicate~"],
			parentFilter : "~parent1Filter~",
			parentPredicate : "~parent1Predicate~"
		}, {
			nodeFilters : ["~node3Filter~"],
			nodePredicates : ["~node3Predicate~"],
			parentFilter : "~parent2Filter~",
			parentPredicate : "~parent2Predicate~"
		}]);

		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oParent1~", "predicate")
			.returns("~parent1Predicate~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode2~").returns("~node2Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode2~", "predicate")
			.returns("~node2Predicate~");

		// code under test
		oTreeState.setOutOfPlace("~oNode2~", "~oParent1~");

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), [{
			nodeFilters : ["~node1Filter~", "~node2Filter~"],
			nodePredicates : ["~node1Predicate~", "~node2Predicate~"],
			parentFilter : "~parent1Filter~",
			parentPredicate : "~parent1Predicate~"
		}, {
			nodeFilters : ["~node3Filter~"],
			nodePredicates : ["~node3Predicate~"],
			parentFilter : "~parent2Filter~",
			parentPredicate : "~parent2Predicate~"
		}]);

		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode4~").returns("~node4Filter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode4~", "predicate")
			.returns("~node4Predicate~");

		// code under test
		oTreeState.setOutOfPlace("~oNode4~");

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), [{
			nodeFilters : ["~node1Filter~", "~node2Filter~"],
			nodePredicates : ["~node1Predicate~", "~node2Predicate~"],
			parentFilter : "~parent1Filter~",
			parentPredicate : "~parent1Predicate~"
		}, {
			nodeFilters : ["~node3Filter~"],
			nodePredicates : ["~node3Predicate~"],
			parentFilter : "~parent2Filter~",
			parentPredicate : "~parent2Predicate~"
		}, {
			nodeFilters : ["~node4Filter~"],
			nodePredicates : ["~node4Predicate~"]
		}]);

		// code under test
		oTreeState.reset();

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlaceGroupedByParent(), []);
	});
});
