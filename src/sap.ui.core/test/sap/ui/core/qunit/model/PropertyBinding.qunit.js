/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, PropertyBinding, TestUtils) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.PropertyBinding", {
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

	//*********************************************************************************************
	QUnit.test("setType", function (assert) {
		const oBinding = {_fireChange() {}};
		const oBindingMock = this.mock(oBinding);

		oBindingMock.expects("_fireChange").withExactArgs().never();

		// code under test (no callback registered)
		PropertyBinding.prototype.setType.call(oBinding, "~oType0", "~sInternalType0");

		assert.strictEqual(oBinding.oType, "~oType0");
		assert.strictEqual(oBinding.sInternalType, "~sInternalType0");

		oBinding.fnTypeChangedCallback = () => {};
		oBindingMock.expects("fnTypeChangedCallback").withExactArgs().never();

		// code under test (callback registerd, but same type, no callback, no fireChange)
		PropertyBinding.prototype.setType.call(oBinding, "~oType0", "~sInternalType0");

		assert.strictEqual(oBinding.oType, "~oType0");
		assert.strictEqual(oBinding.sInternalType, "~sInternalType0");

		oBindingMock.expects("fnTypeChangedCallback").withExactArgs();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test (callback registerd, different type, callback and fireChange triggered)
		PropertyBinding.prototype.setType.call(oBinding, "~oType1", "~sInternalType1");

		assert.strictEqual(oBinding.oType, "~oType1");
		assert.strictEqual(oBinding.sInternalType, "~sInternalType1");

		// code under test (callback registerd, type reset, neither callback nor fireChange triggered)
		PropertyBinding.prototype.setType.call(oBinding, undefined, undefined);

		assert.strictEqual(oBinding.oType, undefined);
		assert.strictEqual(oBinding.sInternalType, undefined);
	});

	//*********************************************************************************************
	QUnit.test("registerTypeChanged", function (assert) {
		const oPropertyBinding = {};

		// code under test
		PropertyBinding.prototype.registerTypeChanged.call(oPropertyBinding, "~fnCallback");

		assert.strictEqual(oPropertyBinding.fnTypeChangedCallback, "~fnCallback");
	});
});