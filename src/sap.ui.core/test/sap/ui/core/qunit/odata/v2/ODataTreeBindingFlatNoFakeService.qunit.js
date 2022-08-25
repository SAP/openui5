/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/odata/ODataTreeBindingFlat",
	"sap/ui/test/TestUtils"
], function (Log, ODataTreeBindingFlat, TestUtils) {
	/*global QUnit*/
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
	QUnit.test("getContexts: unresolved binding", function (assert) {
		var oBinding = {
				isResolved : function () {}
			};

		this.mock(oBinding).expects("isResolved").withExactArgs().returns(false);

		// code under test - parameters are not relevant for this test
		assert.deepEqual(ODataTreeBindingFlat.prototype.getContexts.call(oBinding), []);
	});

	//*********************************************************************************************
	QUnit.test("_calcIndexDelta", function (assert) {
		var oCollapsedNode0 = {
				initiallyCollapsed : false,
				isDeepOne : false,
				magnitude : 2, // subtracts 2 from collapsed delta
				serverIndex : 1
			},
			oCollapsedNode1 = {
				initiallyCollapsed : false,
				isDeepOne : false,
				magnitude : 1, // subtracts 1 from collapsed delta
				serverIndex : 4
			},
			oExpandedNode0 = {
				children : ["child0", "child1"], // adds 2 to the expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 0
			},
			oExpandedNode1 = {
				children : ["child0", "child1"], // will be ignored for expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 2
			},
			oExpandedNode2 = {
				children : ["child0", "child1"], // adds 2 to expanded delta
				initiallyCollapsed : true,
				isDeepOne : false,
				serverIndex : 3
			},
			oBinding = {
				_aCollapsed : [oCollapsedNode0, oCollapsedNode1],
				_aExpanded : [oExpandedNode0, oExpandedNode1, oExpandedNode2],
				_getRelatedServerIndex : function () {}
			},
			oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oCollapsedNode0).returns(1);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oCollapsedNode1).returns(4);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode0).returns(0);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode1).returns(2);
		oBindingMock.expects("_getRelatedServerIndex").withExactArgs(oExpandedNode2).returns(3);

		// code under test
		assert.strictEqual(ODataTreeBindingFlat.prototype._calcIndexDelta.call(oBinding, 5), 1);
	});
});