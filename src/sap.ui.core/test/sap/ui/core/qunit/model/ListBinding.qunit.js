/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ListBinding, TestUtils) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.ListBinding", {
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
[{
	iMaximumPrefetchSize : 2,
	bUseExtendedChangeDetection : false,
	sExpectedError : "Unsupported operation: ~foo#getContexts, must not use both"
		+ " iMaximumPrefetchSize and bKeepCurrent"
} , {
	iMaximumPrefetchSize : 0,
	bUseExtendedChangeDetection : true,
	sExpectedError : "Unsupported operation: ~foo#getContexts, must not use bKeepCurrent if"
		+ " extended change detection is enabled"
}].forEach(function (oFixture, i) {
	QUnit.test("_checkKeepCurrentSupported: error cases, #" + i, function (assert) {
		var oBinding = {
				bUseExtendedChangeDetection : oFixture.bUseExtendedChangeDetection,
				getMetadata : function () {}
			},
			oMetadata = {getName : function () {}};

		this.mock(oBinding).expects("getMetadata").withExactArgs().returns(oMetadata);
		this.mock(oMetadata).expects("getName").withExactArgs().returns("~foo");

		// code under test
		assert.throws(function () {
			ListBinding.prototype._checkKeepCurrentSupported.call(oBinding,
				oFixture.iMaximumPrefetchSize);
		}, new Error(oFixture.sExpectedError));
	});
});
});