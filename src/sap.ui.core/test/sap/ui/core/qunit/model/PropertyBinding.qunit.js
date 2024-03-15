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

	//*********************************************************************************************
	QUnit.test("_setBoundValue: no type", function (assert) {
		const oPropertyBinding = {getDataState() {}, setValue() {}};
		const oDataState = {setInvalidValue() {}};
		this.mock(oPropertyBinding).expects("getDataState").withExactArgs().returns(oDataState);
		this.mock(oDataState).expects("setInvalidValue").withExactArgs(undefined);
		this.mock(oPropertyBinding).expects("setValue").withExactArgs("~vValue");

		// code under test
		assert.strictEqual(
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", "~fnParse"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, sync", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").returns();
		this.mock(oDataState).expects("setInvalidValue").withExactArgs(undefined);
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue");

		// code under test
		assert.strictEqual(
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, sync, error in fnParse", function (assert) {
		const oPropertyBinding = {
			oType: "~oType",
			checkDataState() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oHelper = {fnParse() {}};
		const oError = new Error("~oParseError");
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").throws(oError);
		this.mock(oDataState).expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		assert.throws(() => {
			// code under test
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, sync, error in validateValue", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			checkDataState() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		const oError = new Error("~oValidateError");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").throws(oError);
		this.mock(oDataState).expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		assert.throws(() => {
			// code under test
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, sync, error in setValue", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			checkDataState() {},
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").returns();
		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		const oError = new Error("~oError");
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue").throws(oError);
		oDataStateMock.expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		assert.throws(() => {
			// code under test
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		let fnParseResolve;
		const oParseValuePromise = new Promise(function(resolve, rejected) {
			fnParseResolve = resolve;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);
		const oTypeMock = this.mock(oType);
		oTypeMock.expects("validateValue").never();
		let bResolved = false;

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);
		oPromise.then(() => {
			bResolved = true;
		});

		assert.notOk(bResolved);

		let fnValidateResolve;
		const oValidateValuePromise = new Promise((resolve, rejected) => {
			fnValidateResolve = resolve;
		});
		oTypeMock.expects("validateValue").withExactArgs("~vParsedValue").returns(oValidateValuePromise);

		// code under test
		fnParseResolve("~vParsedValue");

		assert.notOk(bResolved);

		this.mock(oDataState).expects("setInvalidValue").withExactArgs(undefined);
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue");

		// code under test
		fnValidateResolve();

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, fnParse rejects", function (assert) {
		const oPropertyBinding = {
			oType: "~oType",
			checkDataState() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		let fnParseReject;
		const oParseValuePromise = new Promise((resolve, rejected) => {
			fnParseReject = rejected;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);

		this.mock(oDataState).expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		// code under test
		fnParseReject("~Error");

		return oPromise.then(() => {
			assert.ok(false);
		}, (oException) => {
			assert.strictEqual(oException, "~Error");
		});
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, validateValue rejects", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			checkDataState() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		let fnParseResolve;
		const oParseValuePromise = new Promise((resolve, rejected) => {
			fnParseResolve = resolve;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);
		const oTypeMock = this.mock(oType);
		oTypeMock.expects("validateValue").never();

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);

		let fnValidateReject;
		const oValidateValuePromise = new Promise(function(resolve, rejected) {
			fnValidateReject = rejected;
		});
		oTypeMock.expects("validateValue").withExactArgs("~vParsedValue").returns(oValidateValuePromise);

		// code under test
		fnParseResolve("~vParsedValue");

		this.mock(oDataState).expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		// code under test
		fnValidateReject("~Error");

		return oPromise.then(() => {
			assert.ok(false);
		}, (oException) => {
			assert.strictEqual(oException, "~Error");
		});
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, error in setValue", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			checkDataState() {},
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		let fnParseResolve;
		const oParseValuePromise = new Promise(function(resolve, rejected) {
			fnParseResolve = resolve;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);
		const oTypeMock = this.mock(oType);
		oTypeMock.expects("validateValue").never();

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);

		let fnValidateResolve;
		const oValidateValuePromise = new Promise((resolve, rejected) => {
			fnValidateResolve = resolve;
		});
		oTypeMock.expects("validateValue").withExactArgs("~vParsedValue").returns(oValidateValuePromise);

		// code under test
		fnParseResolve("~vParsedValue");

		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		const oError = new Error("~oError");
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue").throws(oError);
		oDataStateMock.expects("setInvalidValue").withExactArgs("~vValue");
		oPropertyBindingMock.expects("checkDataState").withExactArgs();

		// code under test
		fnValidateResolve();

		return oPromise.then(() => {
			assert.ok(false);
		}, (oException) => {
			assert.strictEqual(oException, oError);
		});
	});
});