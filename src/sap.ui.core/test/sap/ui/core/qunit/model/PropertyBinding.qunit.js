/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function (Log, PropertyBinding, TestUtils) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.PropertyBinding", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var oBinding = new PropertyBinding("~oModel", "~sPath", "~oContext", "~mParameters");

		// test propagation to base class constructor
		assert.strictEqual(oBinding.getModel(), "~oModel");
		assert.strictEqual(oBinding.getPath(), "~sPath");
		assert.strictEqual(oBinding.getContext(), "~oContext");
		assert.strictEqual(oBinding.mParameters, "~mParameters");

		assert.ok(oBinding.hasOwnProperty("fnFormatter"));
		assert.strictEqual(oBinding.fnFormatter, undefined);
		assert.ok(oBinding.hasOwnProperty("sInternalType"));
		assert.strictEqual(oBinding.sInternalType, undefined);
		assert.ok(oBinding.hasOwnProperty("sMode"));
		assert.strictEqual(oBinding.sMode, undefined);
		assert.ok(oBinding.hasOwnProperty("oType"));
		assert.strictEqual(oBinding.oType, undefined);
	});
});