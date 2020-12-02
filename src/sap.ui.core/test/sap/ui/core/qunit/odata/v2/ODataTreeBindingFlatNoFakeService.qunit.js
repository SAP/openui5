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
});