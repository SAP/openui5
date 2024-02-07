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
		assert.ok(oTreeState.oExpandLevels instanceof Map);
		assert.deepEqual(mapContent(oTreeState.oExpandLevels), []);
	});

	//*********************************************************************************************
	QUnit.test("expand/collapse", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		this.mock(_Helper).expects("drillDown").thrice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels),
			[["~sNodeId~", {NodeID : "~sNodeId~", Levels : 1}]]);

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels),
			[["~sNodeId~", {NodeID : "~sNodeId~", Levels : 1}]]);

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels), []);
	});

	//*********************************************************************************************
	QUnit.test("collapse/expand", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		this.mock(_Helper).expects("drillDown").thrice()
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels),
			[["~sNodeId~", {NodeID : "~sNodeId~", Levels : 0}]]);

		// code under test
		oTreeState.collapse("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels),
			[["~sNodeId~", {NodeID : "~sNodeId~", Levels : 0}]]);

		// code under test
		oTreeState.expand("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels), []);
	});

	//*********************************************************************************************
	QUnit.test("delete", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		oTreeState.oExpandLevels.set("foo", "bar");
		oTreeState.oExpandLevels.set("~sNodeId~", "~");
		this.mock(_Helper).expects("drillDown")
			.withExactArgs("~oNode~", "~sNodeProperty~")
			.returns("~sNodeId~");

		// code under test
		oTreeState.delete("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels), [["foo", "bar"]]);
	});

	//*********************************************************************************************
["collapse", "delete", "expand"].forEach(function (sMethod) {
	QUnit.test(sMethod + ": no sNodeProperty", function (assert) {
		const oTreeState = new _TreeState();

		oTreeState.oExpandLevels.set("foo", "bar");
		this.mock(_Helper).expects("drillDown").never();

		// code under test
		oTreeState[sMethod]("~oNode~");

		assert.deepEqual(mapContent(oTreeState.oExpandLevels), [["foo", "bar"]]);
	});
});

	//*********************************************************************************************
	QUnit.test("getExpandLevels/reset", function (assert) {
		const oTreeState = new _TreeState("~sNodeProperty~");

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), undefined);

		oTreeState.oExpandLevels.set("foo", {bar : 42});
		oTreeState.oExpandLevels.set("baz", {qux : 23});

		// code under test
		assert.strictEqual(oTreeState.getExpandLevels(), '[{"bar":42},{"qux":23}]');

		// code under test
		oTreeState.reset();

		assert.deepEqual(mapContent(oTreeState.oExpandLevels), []);
	});
});
