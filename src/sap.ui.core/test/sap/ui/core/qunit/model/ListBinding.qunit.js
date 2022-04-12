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
	QUnit.test("_updateLastStartAndLength: error cases, #" + i, function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				bUseExtendedChangeDetection : oFixture.bUseExtendedChangeDetection,
				getMetadata : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oMetadata = {getName : function () {}},
			oMetadataMock = this.mock(oMetadata);

		oBindingMock.expects("getMetadata").withExactArgs().returns(oMetadata);
		oMetadataMock.expects("getName").withExactArgs().returns("~foo");

		// code under test
		assert.throws(function () {
			ListBinding.prototype._updateLastStartAndLength.call(oBinding, /*iStartIndex*/0,
				/*iLength*/3, oFixture.iMaximumPrefetchSize, /*bKeepCurrent*/true);
		}, new Error(oFixture.sExpectedError));

		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
	});
});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: bKeepCurrent = false", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				bUseExtendedChangeDetection : true
			};

		// code under test
		ListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			"~iMaximumPrefetchSize", /*bKeepCurrent*/false);

		assert.strictEqual(oBinding.iLastStartIndex, "~start");
		assert.strictEqual(oBinding.iLastLength, "~length");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: keep last start and last length", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				bUseExtendedChangeDetection : false
			};

		// code under test
		ListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			/*iMaximumPrefetchSize*/undefined, /*bKeepCurrent*/true);

		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
	});
});