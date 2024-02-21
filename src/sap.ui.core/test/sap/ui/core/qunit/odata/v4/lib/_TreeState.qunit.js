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
		const oTreeState = new _TreeState("~sNodeProperty~");

		assert.ok(oTreeState instanceof _TreeState);
		assert.strictEqual(oTreeState.sNodeProperty, "~sNodeProperty~");
		assert.ok(oTreeState.oPredicate2ExpandLevels instanceof Map);
		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
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

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), undefined);

		oTreeState.oPredicate2ExpandLevels.set("foo", {bar : 42});
		oTreeState.oPredicate2ExpandLevels.set("baz", {qux : 23});

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), '[{"bar":42},{"qux":23}]');

		// code under test
		oTreeState.reset();

		assert.deepEqual(mapContent(oTreeState.oPredicate2ExpandLevels), []);
	});
});
