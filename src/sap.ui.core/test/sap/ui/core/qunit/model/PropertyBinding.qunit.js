/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/PropertyBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, PropertyBinding, TestUtils) {
	/*global sinon, QUnit*/
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
	QUnit.test("_getBoundValue", function (assert) {
		const oBinding = {getValue() {}};
		this.mock(oBinding).expects("getValue").withExactArgs().returns("~vValue");
		const oHelper = {fnFormat() {}};
		this.mock(oHelper).expects("fnFormat").withExactArgs("~vValue").returns("~vFormattedValue");

		// code under test
		assert.strictEqual(
			PropertyBinding.prototype._getBoundValue.call(oBinding, oHelper.fnFormat), "~vFormattedValue");
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: no type, w/o update context", function (assert) {
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
	QUnit.test("_setBoundValue: no type, w/ update context", function (assert) {
		const oPropertyBinding = {
			sPath: "~sPath",
			getDataState() {}
		};
		this.mock(oPropertyBinding).expects("getDataState").withExactArgs().returns("~oDataState");
		const oUpdateContext = {setProperty() {}};
		this.mock(oUpdateContext).expects("setProperty").withExactArgs("~sPath", "~vValue");

		// code under test
		assert.strictEqual(
			PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", "~fnParse", oUpdateContext),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, sync", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			getContext() {},
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").returns();
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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
			getContext() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oHelper = {fnParse() {}};
		const oError = new Error("~oParseError");
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").throws(oError);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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
			getContext() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		const oError = new Error("~oValidateError");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").throws(oError);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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
			getContext() {},
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns("~vParsedValue");
		this.mock(oType).expects("validateValue").withExactArgs("~vParsedValue").returns();
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		const oError = new Error("~oError");
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue").throws(oError);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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
			getContext() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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

		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		this.mock(oDataState).expects("setInvalidValue").withExactArgs(undefined);
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue");

		// code under test
		fnValidateResolve();

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, context changed", function (assert) {
		const oType = {validateValue() {}};
		const oContext0 = {setProperty() {}};
		const oPropertyBinding = {
			sPath: "~sPath",
			oType: oType,
			getContext() {},
			getDataState() {}
		};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns({});
		oPropertyBindingMock.expects("getContext").withExactArgs().returns(oContext0);
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
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext1");
		this.mock(oContext0).expects("setProperty").withExactArgs("~sPath", "~vParsedValue", undefined, true);

		// code under test
		fnValidateResolve();

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, update context given", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			sPath: "~sPath",
			oType: oType,
			getContext() {},
			getDataState() {}
		};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns({});
		let fnParseResolve;
		const oParseValuePromise = new Promise(function(resolve, rejected) {
			fnParseResolve = resolve;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);
		const oTypeMock = this.mock(oType);
		oTypeMock.expects("validateValue").never();
		let bResolved = false;
		const oUpdateContext = {setProperty() {}};

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse,
				oUpdateContext);
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
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oNotUpdateContext");
		this.mock(oUpdateContext).expects("setProperty").withExactArgs("~sPath", "~vParsedValue", undefined, true);

		// code under test
		fnValidateResolve();

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});

	//*********************************************************************************************
[true, false].forEach((bContextChange) => {
	const sTitle = "_setBoundValue: with type, async, fnParse rejects, context change: " + bContextChange;
	QUnit.test(sTitle, function (assert) {
		const oPropertyBinding = {
			oType: "~oType",
			checkDataState() {},
			getContext() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext0");
		let fnParseReject;
		const oParseValuePromise = new Promise((resolve, rejected) => {
			fnParseReject = rejected;
		});
		const oHelper = {fnParse() {}};
		this.mock(oHelper).expects("fnParse").withExactArgs("~vValue").returns(oParseValuePromise);

		// code under test
		const oPromise = PropertyBinding.prototype._setBoundValue.call(oPropertyBinding, "~vValue", oHelper.fnParse);

		oPropertyBindingMock.expects("getContext").withExactArgs().returns(bContextChange ? "~oContext1" : "~oContext0");

		this.mock(oDataState).expects("setInvalidValue").withExactArgs("~vValue").exactly(bContextChange ? 0 : 1);
		oPropertyBindingMock.expects("checkDataState").withExactArgs().exactly(bContextChange ? 0 : 1);

		// code under test
		fnParseReject("~Error");

		return oPromise.then(() => {
			assert.ok(false);
		}, (oException) => {
			assert.strictEqual(oException, "~Error");
		});
	});
});

	//*********************************************************************************************
	QUnit.test("_setBoundValue: with type, async, validateValue rejects", function (assert) {
		const oType = {validateValue() {}};
		const oPropertyBinding = {
			oType: oType,
			checkDataState() {},
			getContext() {},
			getDataState() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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

		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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
			getContext() {},
			getDataState() {},
			setValue() {}
		};
		const oDataState = {setInvalidValue() {}};
		const oPropertyBindingMock = this.mock(oPropertyBinding);
		oPropertyBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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

		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		const oError = new Error("~oError");
		oPropertyBindingMock.expects("setValue").withExactArgs("~vParsedValue").throws(oError);
		oPropertyBindingMock.expects("getContext").withExactArgs().returns("~oContext");
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

	//*********************************************************************************************
[
	{internalType: "raw", expects: "getRawValue"},
	{internalType: "internal", expects: "getInternalValue"}
].forEach((oFixture) => {
	QUnit.test("getExternalValue calls " + oFixture.expects, function (assert) {
		const oBinding = {sInternalType: oFixture.internalType};
		oBinding[oFixture.expects] = () => {};
		this.mock(oBinding).expects(oFixture.expects).withExactArgs().returns("~vValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype.getExternalValue.call(oBinding), "~vValue");
	});
});

	//*********************************************************************************************
	QUnit.test("getExternalValue calls _getBoundValue", function (assert) {
		const oBinding = {_rawToExternal() {}, _getBoundValue() {}};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_rawToExternal").withExactArgs("~vValue").on(oBinding).returns("~notRelevant");
		oBindingMock.expects("_getBoundValue").withExactArgs(sinon.match.func).callsFake((fnFormat) => {
			// code under test
			fnFormat("~vValue");

			return "~vValue";
		});

		// code under test
		assert.strictEqual(PropertyBinding.prototype.getExternalValue.call(oBinding), "~vValue");
	});

	//*********************************************************************************************
[
	{internalType: "raw", expects: "_setRawValue"},
	{internalType: "internal", expects: "_setInternalValue"}
].forEach((oFixture) => {
	QUnit.test("_setExternalValue calls " + oFixture.expects, function (assert) {
		const oBinding = {sInternalType: oFixture.internalType};
		oBinding[oFixture.expects] = () => {};
		this.mock(oBinding).expects(oFixture.expects).withExactArgs("~vValue", "~oUpdateContext").returns("~vResult");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._setExternalValue.call(oBinding, "~vValue", "~oUpdateContext"),
			"~vResult");
	});
});

	//*********************************************************************************************
	QUnit.test("_setExternalValue calls _setBoundValue", function (assert) {
		const oBinding = {_externalToRaw() {}, _setBoundValue() {}};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_externalToRaw").withExactArgs("~vValue").on(oBinding).returns("~notRelevant");
		oBindingMock.expects("_setBoundValue")
			.withExactArgs("~vValue", sinon.match.func, "~oUpdateContext")
			.callsFake((vValue, fnParse) => {
				// code under test - _setBoundValue calls passed function with given value
				fnParse(vValue);

				return "~vResult";
			});

		// code under test
		assert.strictEqual(PropertyBinding.prototype._setExternalValue.call(oBinding, "~vValue", "~oUpdateContext"),
			 "~vResult");
	});

	//*********************************************************************************************
	QUnit.test("_setExternalValue logs warning", function (assert) {
		const oBinding = {fnFormatter() {}};
		this.oLogMock.expects("warning").withExactArgs("Tried to use twoway binding, but a formatter function is used");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._setExternalValue.call(oBinding, "~vValue"), undefined);
	});

	//*********************************************************************************************
	QUnit.test("setExternalValue calls _setExternalValue", function (assert) {
		const oBinding = {_setExternalValue() {}};
		this.mock(oBinding).expects("_setExternalValue").withExactArgs("~vValue").returns("~vResult");

		// code under test
		assert.strictEqual(PropertyBinding.prototype.setExternalValue.call(oBinding, "~vValue"), "~vResult");
	});

	//*********************************************************************************************
	QUnit.test("getInternalValue", function (assert) {
		const oBinding = {_rawToInternal() {}, _getBoundValue() {}};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_rawToInternal").withExactArgs("~vValue").on(oBinding).returns("~notRelevant");
		oBindingMock.expects("_getBoundValue").withExactArgs(sinon.match.func).callsFake((fnFormat) => {
			// code under test
			fnFormat("~vValue");

			return "~vValue";
		});

		// code under test
		assert.strictEqual(PropertyBinding.prototype.getInternalValue.call(oBinding), "~vValue");
	});

	//*********************************************************************************************
	QUnit.test("_setInternalValue", function (assert) {
		const oBinding = {_internalToRaw() {}, _setBoundValue() {}};
		const oBindingMock = this.mock(oBinding);
		oBindingMock.expects("_internalToRaw").withExactArgs("~vValue").on(oBinding).returns("~notRelevant");
		oBindingMock.expects("_setBoundValue")
			.withExactArgs("~vValue", sinon.match.func, "~oUpdateContext")
			.callsFake((vValue, fnParse) => {
				// code under test - _setBoundValue calls passed function with given value
				fnParse(vValue);

				return "~vResult";
			});

		// code under test
		assert.strictEqual(PropertyBinding.prototype._setInternalValue.call(oBinding, "~vValue", "~oUpdateContext"),
			"~vResult");
	});

	//*********************************************************************************************
	QUnit.test("setInternalValue calls _setInternalValue", function (assert) {
		const oBinding = {_setInternalValue() {}};
		this.mock(oBinding).expects("_setInternalValue").withExactArgs("~vValue").returns("~vResult");

		// code under test
		assert.strictEqual(PropertyBinding.prototype.setInternalValue.call(oBinding, "~vValue"), "~vResult");
	});

	//*********************************************************************************************
	QUnit.test("getRawValue", function (assert) {
		const oBinding = {_getBoundValue() {}};
		this.mock(oBinding).expects("_getBoundValue").withExactArgs(sinon.match.func).callsFake((fnFormat) => {
			// code under test
			assert.strictEqual(fnFormat("~vValue"), "~vValue");

			return "~vValue";
		});

		// code under test
		assert.strictEqual(PropertyBinding.prototype.getRawValue.call(oBinding), "~vValue");
	});

	//*********************************************************************************************
	QUnit.test("_setRawValue", function (assert) {
		const oBinding = {_setBoundValue() {}};
		this.mock(oBinding).expects("_setBoundValue")
			.withExactArgs("~vValue", sinon.match.func, "~oUpdatedContext")
			.callsFake((vValue, fnParse) => {
				// code under test
				assert.strictEqual(fnParse(vValue), vValue);

				return "~vResult";
			});

		// code under test
		assert.strictEqual(PropertyBinding.prototype._setRawValue.call(oBinding, "~vValue", "~oUpdatedContext"),
			"~vResult");
	});

	//*********************************************************************************************
	QUnit.test("setRawValue calls _setRawValue", function (assert) {
		const oBinding = {_setRawValue() {}};
		this.mock(oBinding).expects("_setRawValue").withExactArgs("~vValue").returns("~vResult");

		// code under test
		assert.strictEqual(PropertyBinding.prototype.setRawValue.call(oBinding, "~vValue"), "~vResult");
	});

	//*********************************************************************************************
	QUnit.test("_rawToExternal: no type, no formatter", function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToExternal.call({}, "~vValue"), "~vValue");
	});

	//*********************************************************************************************
	QUnit.test("_rawToExternal: with type", function (assert) {
		const oType = {formatValue() {}};
		const oBinding = {sInternalType: "~sInternalType", oType: oType};
		this.mock(oType).expects("formatValue").withExactArgs("~vValue", "~sInternalType").returns("~vFormattedValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToExternal.call(oBinding, "~vValue"), "~vFormattedValue");
	});

	//*********************************************************************************************
	QUnit.test("_rawToExternal: with formatter", function (assert) {
		const oBinding = {fnFormatter() {}};
		this.mock(oBinding).expects("fnFormatter").withExactArgs("~vValue").returns("~vFormattedValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToExternal.call(oBinding, "~vValue"), "~vFormattedValue");
	});

	//*********************************************************************************************
	QUnit.test("_rawToExternal: with type and formatter", function (assert) {
		const oType = {formatValue() {}};
		const oBinding = {
			sInternalType: "~sInternalType",
			oType: oType,
			fnFormatter() {}
		};
		this.mock(oType).expects("formatValue")
			.withExactArgs("~vValue", "~sInternalType")
			.returns("~vValueFormattedByType");
		this.mock(oBinding).expects("fnFormatter")
			.withExactArgs("~vValueFormattedByType")
			.returns("~vValueFormattedByFormatter");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToExternal.call(oBinding, "~vValue"),
			"~vValueFormattedByFormatter");
	});

	//*********************************************************************************************
	QUnit.test("_externalToRaw: no type", function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype._externalToRaw.call({}, "~vValue"), "~vValue");
	});

	//*********************************************************************************************
	QUnit.test("_externalToRaw: with type", function (assert) {
		const oType = {parseValue() {}};
		const oBinding = {sInternalType: "~sInternalType", oType: oType};
		this.mock(oType).expects("parseValue").withExactArgs("~vValue", "~sInternalType").returns("~vParsedValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._externalToRaw.call(oBinding, "~vValue"), "~vParsedValue");
	});

	//*********************************************************************************************
[
	{type: undefined, value: "foo"},
	{type: "~oType", value: null},
	{type: "~oType", value: undefined}
].forEach((oFixture, i) => {
	QUnit.test("_rawToInternal: w/o parsing " + oFixture.value, function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToInternal.call({oType: oFixture.type}, oFixture.value),
			oFixture.value);
	});
});

	//*********************************************************************************************
	QUnit.test("_rawToInternal: w/ parsing", function (assert) {
		const oType = {getModelFormat() {}};
		const oBinding = {oType: oType};
		const oFormat = {parse() {}};
		this.mock(oType).expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("parse").withExactArgs("~vValue").returns("~vParsedValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._rawToInternal.call(oBinding, "~vValue"), "~vParsedValue");
	});

	//*********************************************************************************************
[null, undefined].forEach((vValue) => {
	QUnit.test("_internalToRaw: w/o formatting, value=" + vValue, function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype._internalToRaw.call({}, vValue), vValue);
	});
});

	//*********************************************************************************************
	QUnit.test("_internalToRaw w/ formatting", function (assert) {
		const oType = {getModelFormat() {}};
		const oBinding = {oType: oType};
		const oFormat = {format() {}};
		this.mock(oType).expects("getModelFormat").withExactArgs().returns(oFormat);
		this.mock(oFormat).expects("format").withExactArgs("~vValue").returns("~vFormattedValue");

		// code under test
		assert.strictEqual(PropertyBinding.prototype._internalToRaw.call(oBinding, "~vValue"), "~vFormattedValue");
	});

	//*********************************************************************************************
	QUnit.test("getType", function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype.getType.call({oType: "~oType"}), "~oType");
	});

	//*********************************************************************************************
	QUnit.test("setFormatter", function (assert) {
		const oBinding = {};

		// code under test
		PropertyBinding.prototype.setFormatter.call(oBinding, "~fnFormatter");

		assert.strictEqual(oBinding.fnFormatter, "~fnFormatter");
	});

	//*********************************************************************************************
	QUnit.test("getFormatter", function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype.getFormatter.call({fnFormatter: "~fnFormatter"}), "~fnFormatter");
	});

	//*********************************************************************************************
	QUnit.test("getBindingMode", function (assert) {
		// code under test
		assert.strictEqual(PropertyBinding.prototype.getBindingMode.call({sMode: "~sMode"}), "~sMode");
	});

	//*********************************************************************************************
	QUnit.test("setBindingMode", function (assert) {
		const oBinding = {};

		// code under test
		PropertyBinding.prototype.setBindingMode.call(oBinding, "~sMode");

		assert.strictEqual(oBinding.sMode, "~sMode");
	});

	//*********************************************************************************************
	QUnit.test("resume", function (assert) {
		const oBinding = {checkUpdate() {}};
		this.mock(oBinding).expects("checkUpdate").withExactArgs(true);

		// code under test
		PropertyBinding.prototype.resume.call(oBinding);

		assert.strictEqual(oBinding.bSuspended, false);
	});
});