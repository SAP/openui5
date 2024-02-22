/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/v4/lib/_Helper",
	"sap/ui/model/odata/v4/lib/_TreeState"
], function (Log, _Helper, _TreeState) {
	"use strict";

	const mapContent = (oMap) => [...oMap.entries()];
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
		assert.ok(oTreeState.oPredicate2ExpandLevels instanceof Map);
		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
		assert.ok("oOutOfPlace" in oTreeState);
		assert.strictEqual(oTreeState.oOutOfPlace, undefined);
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

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels),
			[["~predicate~", {NodeID : "~sNodeId~", Levels : 1}]]);

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels),
			[["~predicate~", {NodeID : "~sNodeId~", Levels : 1}]]);

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
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

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels),
			[["~predicate~", {NodeID : "~sNodeId~", Levels : 0}]]);

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels),
			[["~predicate~", {NodeID : "~sNodeId~", Levels : 0}]]);

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
	});

	//*********************************************************************************************
	QUnit.test("delete", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		oTreeState.oPredicate2ExpandLevels.set("foo", "bar");
		oTreeState.oPredicate2ExpandLevels.set("~predicate~", "~");
		this.mock(_Helper).expects("getPrivateAnnotation")
			.withExactArgs("~oNode~", "predicate").returns("~predicate~");

		// code under test
		oTreeState.delete("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), [["foo", "bar"]]);
	});

	//*********************************************************************************************
["collapse", "delete", "expand"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": no sNodeProperty", function (assert) {
		const oTreeState = new _TreeState();

		oTreeState.oPredicate2ExpandLevels.set("foo", "bar");
		this.mock(_Helper).expects("drillDown").never();

		// code under test
		oTreeState[sMethod]("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), [["foo", "bar"]]);
	});
});

	//*********************************************************************************************
	QUnit.test("getExpandLevels/reset", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");
		oTreeState.oOutOfPlace = "~oOutOfPlace~";

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), undefined);

		oTreeState.oPredicate2ExpandLevels.set("foo", {bar : 42});
		oTreeState.oPredicate2ExpandLevels.set("baz", {qux : 23});

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), '[{"bar":42},{"qux":23}]');

		// code under test
		oTreeState.reset();

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
		assert.strictEqual(oTreeState.oOutOfPlace, undefined);
	});

	//*********************************************************************************************
	QUnit.test("setOutOfPlace/getOutOfPlace (w/ parent)", function (assert) {
		const fnGetKeyFilter = mustBeMocked;
		const oTreeState = new _TreeState("~sNodeProperty~", fnGetKeyFilter);

		// code under test
		assert.strictEqual(oTreeState.getOutOfPlace(), undefined);

		const oTreeStateMock = this.mock(oTreeState);
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode1~").returns("~node1Filter~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent~")
			.returns("~parentFilter~");
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode1~", "predicate")
			.returns("~predicate1~");

		// code under test
		oTreeState.setOutOfPlace("~oNode1~", "~oParent~");

		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oNode2~").returns("~node2Filter~");
		oTreeStateMock.expects("fnGetKeyFilter").withExactArgs("~oParent~")
			.returns("~parentFilter~");
		oHelperMock.expects("getPrivateAnnotation").withExactArgs("~oNode2~", "predicate")
			.returns("~predicate2~");

		// code under test
		oTreeState.setOutOfPlace("~oNode2~", "~oParent~");

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlace(), {
			nodeFilters : ["~node1Filter~", "~node2Filter~"],
			nodePredicates : ["~predicate1~", "~predicate2~"],
			parentFilter : "~parentFilter~"
		});
	});

	//*********************************************************************************************
	QUnit.test("setOutOfPlace/getOutOfPlace (w/o parent)", function (assert) {
		const fnGetKeyFilter = mustBeMocked;
		const oTreeState = new _TreeState("~sNodeProperty~", fnGetKeyFilter);

		// code under test
		assert.strictEqual(oTreeState.getOutOfPlace(), undefined);

		this.mock(oTreeState).expects("fnGetKeyFilter").withExactArgs("~oNode~")
			.returns("~nodeFilter~");
		this.mock(_Helper).expects("getPrivateAnnotation").withExactArgs("~oNode~", "predicate")
			.returns("~predicate~");

		// code under test
		oTreeState.setOutOfPlace("~oNode~");

		// code under test
		assert.deepEqual(oTreeState.getOutOfPlace(), {
			parentFilter : undefined,
			nodeFilters : ["~nodeFilter~"],
			nodePredicates : ["~predicate~"]
		});
	});
});
