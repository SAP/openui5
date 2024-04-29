/*global QUnit, sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/deepEqual",
	"sap/ui/base/DataType",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/BindingMode",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/CompositeType",
	"sap/ui/model/Context",
	"sap/ui/model/ParseException",
	"sap/ui/model/PropertyBinding",
	"sap/ui/model/StaticBinding",
	"sap/ui/model/ValidateException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String"
], function (Log, Localization, deepEqual, DataType, UI5Date, BindingMode, CompositeBinding, CompositeType,
		Context, ParseException, PropertyBinding, StaticBinding, ValidateException, JSONModel,
		TypeDate, TypeFloat, TypeInteger, TypeString
) {
	"use strict";

	var sDefaultLanguage = Localization.getLanguage(),
		MyCompositeType = CompositeType.extend("MyCompositeType", {
		constructor: function() {
			CompositeType.apply(this);
			this.sName = "MyCompositeType";
		},
		formatValue: function(aValues) {
			return aValues.join(",");
		},
		parseValue: function(sValue) {
			return sValue.split(",");
		},
		validateValue: function(aValues) {
			if (aValues[0] == 0) {
				throw new ValidateException("Value must not be zero");
			}
		}
	});

	var MyAsyncCompositeType = CompositeType.extend("MyCompositeType", {
		constructor: function() {
			CompositeType.apply(this);
			this.sName = "MyAsyncCompositeType";
		},
		formatValue: function(aValues) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(aValues.join(","));
				}, 0);
			});
		},
		parseValue: function(sValue) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(sValue.split(","));
				}, 0);
			});
		},
		validateValue: function(aValues) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					if (aValues[0] == 0) {
						reject(new ValidateException("Value must not be zero"));
					} else {
						resolve();
					}
				}, 0);
			});
		}
	});

	var MyRawValueType = MyCompositeType.extend("MyRawValueType", {
		constructor: function() {
			MyCompositeType.apply(this);
			this.sName = "MyRawValueType";
			this.bUseRawValues = true;
		}
	});

	var MyInternalValueType = MyCompositeType.extend("MyInternalValueType", {
		constructor: function() {
			MyCompositeType.apply(this);
			this.sName = "MyInternalValueType";
			this.bUseInternalValues = true;
		},
		parseValue: function(oValue) {
			if (Array.isArray(oValue)) {
				return oValue;
			}
			return oValue.split(" ");
		}
	});

	var MyPartialUpdateType = MyCompositeType.extend("MyPartialUpdateType", {
		constructor: function() {
			MyCompositeType.apply(this);
			this.sName = "MyPartialUpdateType";
		},
		formatValue: function(aValues) {
			return aValues[1];
		},
		parseValue: function(oValue) {
			return [undefined, oValue, undefined];
		}
	});


	function myFormatter(a, b, c) {
		return a + "-" + b + "-" + c;
	}

	function myCalculator(a, b, c) {
		return a + b + c;
	}

	QUnit.module("sap.ui.model.CompositeBinding: Basic functionality", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.model = new JSONModel({
				a: 1,
				b: 2,
				c: 3,
				obj: {
					a: 1,
					b: 2,
					c: 3
				}
			});
			this.binding1 = this.model.bindProperty("/a");
			this.binding2 = this.model.bindProperty("/b");
			this.binding3 = this.model.bindProperty("/c");
			this.composite = new CompositeBinding([this.binding1, this.binding2, this.binding3]);
		},
		afterEach: function() {
			this.model = null;
			this.binding1 = null;
			this.binding2 = null;
			this.binding3 = null;
			this.composite = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("getValue/setValue", function(assert) {
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true,
			"getValue() returns array of bound model values");
		this.composite.setValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3, "setValue() does change model values for contained bindings");
	});

	QUnit.test("getExternalValue/setExternalValue", function(assert) {
		assert.equal(this.composite.getExternalValue(), "1 2 3",
			"getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("3 2 1");
		assert.equal(this.model.getProperty("/a"), 3,
			"setExternalValue() does change model values for contained bindings");
	});

	//*********************************************************************************************
[{
	sMethod: "_setRawValue",
	bInternalValues: false,
	bRawValues: true
}, {
	sMethod: "_setInternalValue",
	bInternalValues: true,
	bRawValues: false
}, {
	sMethod: "_setExternalValue",
	bInternalValues: false,
	bRawValues: false
}].forEach(function (oFixture) {
	QUnit.test(`setExternalValue /w async type and context changed for method ${oFixture.sMethod}`, function (assert) {
		const oBinding1 = {
			getBindingMode() {},
			getContext() {}
		};
		const oBinding2 = {
			getBindingMode() {},
			getContext() {}
		};
		const oCompositeBinding = {
			aBindings: [oBinding1, oBinding2],
			sInternalType: "string",
			bInternalValues: oFixture.bInternalValues,
			bRawValues: oFixture.bRawValues,
			oType: {
				getParseWithValues() {},
				parseValue() {},
				validateValue() {}
			},
			getDataState() {},
			getValidateValues() {},
			getValue() {}
		};
		const oDataState = {
			setInvalidValue() {},
			setValue() {}
		};
		this.mock(DataType).expects("getType").withExactArgs("string").returns("~oType");
		const oCompositeBindingMock = this.mock(oCompositeBinding);
		oCompositeBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oBindingMock1 = this.mock(oBinding1);
		oBindingMock1.expects("getContext").withExactArgs().returns("~oUpdateContext1");
		const oBindingMock2 = this.mock(oBinding2);
		oBindingMock2.expects("getContext").withExactArgs().returns("~oUpdateContext2");
		const oTypeMock = this.mock(oCompositeBinding.oType);
		oTypeMock.expects("getParseWithValues").withExactArgs().returns(false);
		oTypeMock.expects("parseValue")
			.withExactArgs("~vValue", "string", undefined)
			.returns(["~vParsedValue1", "~vParsedValue2"]);
		oCompositeBindingMock.expects("getValidateValues")
			.withExactArgs(["~vParsedValue1", "~vParsedValue2"])
			.returns("~aValidateValues");
		oTypeMock.expects("validateValue")
			.withExactArgs("~aValidateValues").returns(Promise.resolve());

		// code under test
		const oPromise = CompositeBinding.prototype.setExternalValue.call(oCompositeBinding, "~vValue");

		// After validation the contexts have changed due to the async nature of the type's validation
		oBindingMock1.expects("getContext").withExactArgs().returns("~oNewContext1");
		oBindingMock2.expects("getContext").withExactArgs().returns("~oNewContext1");
		oBinding1[oFixture.sMethod] = () => {};
		oBinding2[oFixture.sMethod] = () => {};
		oBindingMock1.expects("getBindingMode").withExactArgs().returns(BindingMode.TwoWay);
		oBindingMock1.expects(oFixture.sMethod).withExactArgs("~vParsedValue1" , "~oUpdateContext1");
		oBindingMock2.expects("getBindingMode").withExactArgs().returns(BindingMode.TwoWay);
		oBindingMock2.expects(oFixture.sMethod).withExactArgs("~vParsedValue2" , "~oUpdateContext2");
		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		oCompositeBindingMock.expects("getValue").withExactArgs().returns("~vValue");
		oDataStateMock.expects("setValue").withExactArgs("~vValue");

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});
});

//*********************************************************************************************
[{
	sMethod: "_setRawValue",
	bInternalValues: false,
	bRawValues: true
}, {
	sMethod: "_setInternalValue",
	bInternalValues: true,
	bRawValues: false
}, {
	sMethod: "_setExternalValue",
	bInternalValues: false,
	bRawValues: false
}].forEach(function (oFixture) {
	const sTitle = `setExternalValue /w async type and w/o context changed for method ${oFixture.sMethod}`;
	QUnit.test(sTitle, function (assert) {
		const oBinding1 = {
			getBindingMode() {},
			getContext() {}
		};
		const oBinding2 = {
			getBindingMode() {},
			getContext() {}
		};
		const oCompositeBinding = {
			aBindings: [oBinding1, oBinding2],
			sInternalType: "string",
			bInternalValues: oFixture.bInternalValues,
			bRawValues: oFixture.bRawValues,
			oType: {
				getParseWithValues() {},
				parseValue() {},
				validateValue() {}
			},
			getDataState() {},
			getValidateValues() {},
			getValue() {}
		};
		const oDataState = {
			setInvalidValue() {},
			setValue() {}
		};
		this.mock(DataType).expects("getType").withExactArgs("string").returns("~oType");
		const oCompositeBindingMock = this.mock(oCompositeBinding);
		oCompositeBindingMock.expects("getDataState").withExactArgs().returns(oDataState);
		const oBindingMock1 = this.mock(oBinding1);
		oBindingMock1.expects("getContext").withExactArgs().returns("~oUpdateContext1");
		const oBindingMock2 = this.mock(oBinding2);
		oBindingMock2.expects("getContext").withExactArgs().returns("~oUpdateContext2");
		const oTypeMock = this.mock(oCompositeBinding.oType);
		oTypeMock.expects("getParseWithValues").withExactArgs().returns(false);
		oTypeMock.expects("parseValue")
			.withExactArgs("~vValue", "string", undefined)
			.returns(["~vParsedValue1", "~vParsedValue2"]);
		oCompositeBindingMock.expects("getValidateValues")
			.withExactArgs(["~vParsedValue1", "~vParsedValue2"])
			.returns("~aValidateValues");
		oTypeMock.expects("validateValue")
			.withExactArgs("~aValidateValues").returns(Promise.resolve());

		// code under test
		const oPromise = CompositeBinding.prototype.setExternalValue.call(oCompositeBinding, "~vValue");

		// After validation the contexts have changed due to the async nature of the type's validation
		oBindingMock1.expects("getContext").withExactArgs().returns("~oUpdateContext1");
		oBindingMock2.expects("getContext").withExactArgs().returns("~oUpdateContext2");
		oBinding1[oFixture.sMethod] = () => {};
		oBinding2[oFixture.sMethod] = () => {};
		oBindingMock1.expects("getBindingMode").withExactArgs().returns(BindingMode.TwoWay);
		oBindingMock1.expects(oFixture.sMethod).withExactArgs("~vParsedValue1" , undefined);
		oBindingMock2.expects("getBindingMode").withExactArgs().returns(BindingMode.TwoWay);
		oBindingMock2.expects(oFixture.sMethod).withExactArgs("~vParsedValue2" , undefined);
		const oDataStateMock = this.mock(oDataState);
		oDataStateMock.expects("setInvalidValue").withExactArgs(undefined);
		oCompositeBindingMock.expects("getValue").withExactArgs().returns("~vValue");
		oDataStateMock.expects("setValue").withExactArgs("~vValue");

		return oPromise.then((vResult) => {
			assert.strictEqual(vResult, undefined);
		});
	});
});

	QUnit.test("disabled methods", function(assert) {
		assert.equal(this.composite.getContext(), null, "getContext() always returns null");
		assert.equal(this.composite.getModel(), null, "getModel() always returns null");
		assert.equal(this.composite.getPath(), null, "getPath() always returns null");
	});

	QUnit.test("change event", function(assert) {
		this.composite.attachChange(function() {
			assert.equal(this.composite.getExternalValue(), "1 2 4");
		}.bind(this));
		this.model.setProperty("/c", 4);
	});

	QUnit.test("formatter function", function(assert) {
		this.composite.setFormatter(myFormatter);
		assert.equal(this.composite.getExternalValue(), "1-2-3");
		this.composite.setFormatter(myCalculator);
		assert.equal(this.composite.getExternalValue(), 6);
	});

	QUnit.test("composite type", function(assert) {
		this.composite.setType(new MyCompositeType());
		assert.equal(this.composite.getExternalValue(), "1,2,3");
		this.composite.setExternalValue("3,2,1");
		assert.equal(this.model.getProperty("/a"), 3,
			"setExternalValue() does change model value for contained bindings");
		assert.throws(function(){this.composite.setExternalValue("0,0,0");}.bind(this),
			ValidateException, "validation throws ValidateExpception for invalid values");
	});

	QUnit.test("async composite type", function(assert) {
		var that = this;
		this.composite.setType(new MyAsyncCompositeType());
		var p1 = this.composite.getExternalValue().then(function(oValue) {
			assert.equal(oValue, "1,2,3");
		});
		var p2 = this.composite.setExternalValue("3,2,1").then(function(oValue) {
			assert.equal(that.model.getProperty("/a"), 3,
				"setExternalValue() does change model value for contained bindings");
		});
		var p3 = this.composite.setExternalValue("0,0,0").catch(function(oException) {
			assert.ok(oException instanceof ValidateException, "Rejects with ValidateException for invalid values");
		});
		return Promise.all([p1, p2, p3]);
	});

	QUnit.test("with partial update", function(assert) {
		var oType = new MyPartialUpdateType();
		oType.validateValue = function(aValues) {
			assert.equal(aValues[0], 1, "validateValue is called with all values");
			assert.equal(aValues[1], 4, "validateValue is called with all values");
			assert.equal(aValues[2], 3, "validateValue is called with all values");
		};
		this.composite.setType(oType);
		this.composite.setExternalValue(4); // MyPartialUpdateType returns given value as second part
		assert.equal(this.model.getProperty("/a"), 1, "first value is unchanged");
		assert.equal(this.model.getProperty("/b"), 4, "second value is changed with partial update");
		assert.equal(this.model.getProperty("/c"), 3, "third value is unchanged");
	});

	QUnit.test("array type", function(assert) {
		this.composite.setType(null, "int[]");
		assert.deepEqual(this.composite.getExternalValue(), [1,2,3]);
		this.composite.setExternalValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3,
			"setExternalValue() does change model value for contained bindings");
	});

	QUnit.test("simple type", function(assert) {
		assert.throws(function(){this.composite.setType(new TypeFloat());}.bind(this),
			Error, "setting a simple type on a composite binding throws");
	});

	QUnit.test("suspend/resume", function(assert) {

		var done = assert.async();
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true,
			"getValue() returns array of bound model values");
		this.composite.attachChange(this, function() {
			assert.equal(deepEqual(this.getValue(), [666,2,3]), true, "getValue() returns array of bound model values");
			done();
		});
		this.composite.suspend();
		this.composite.setValue([3,2,1]);
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true,
			"getValue() returns array of bound model values");
		this.model.setProperty("/a",666);
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true,
			"getValue() returns array of bound model values");
		this.composite.resume();
	});

	//**********************************************************************************************
	QUnit.test("constructor", function (assert) {
		var aBindings = [],
			oBinding = new CompositeBinding(aBindings, "~bRawValues", "~bInternalValues");

		// CompositeBinding has its own #getModel and #getPath methods always returning null; values passed to the base
		// class constructor are not used there
		assert.strictEqual(oBinding.oModel, null, "model passed to PropertyBinding c'tor");
		assert.strictEqual(oBinding.sPath, "", "path passed to PropertyBinding c'tor");
		assert.strictEqual(oBinding.aValues, null);
		assert.strictEqual(oBinding.bRawValues, "~bRawValues");
		assert.strictEqual(oBinding.bPreventUpdate, false);
		assert.strictEqual(oBinding.bInternalValues, "~bInternalValues");
		assert.ok(oBinding.hasOwnProperty("aOriginalValues"));
		assert.strictEqual(oBinding.aOriginalValues, undefined);
		assert.ok(oBinding.hasOwnProperty("fnChangeHandler"));
		assert.strictEqual(oBinding.fnChangeHandler, undefined);
		assert.ok(oBinding.hasOwnProperty("fnDataStateChangeHandler"));
		assert.strictEqual(oBinding.fnDataStateChangeHandler, undefined);

	});

[{
	aModels : [{}, null /*static binding*/],
	bMultipleModels : false
}, {
	aModels : [null /*static binding*/, {}],
	bMultipleModels : false
}, {
	aModels : [{}, {}], // two different models
	bMultipleModels : true
}, {
	aModels : [{}], // same model
	bMultipleModels : false
}].forEach(function (oFixture, i) {
	QUnit.test("constructor, bMultipleModels, # " + i, function (assert) {
		var aBinding0 = {getModel : function () {}},
			aBinding1 = {getModel : function () {}},
			aModels = oFixture.aModels;

		this.mock(aBinding0).expects("getModel").withExactArgs().returns(aModels[0]);
		this.mock(aBinding1).expects("getModel").withExactArgs()
			.returns(aModels[aModels.length === 1 ? 0 : 1]);

		// code under test
		assert.strictEqual(new CompositeBinding([aBinding0, aBinding1]).bMultipleModels,
			oFixture.bMultipleModels);
	});
});

	QUnit.test("CheckUpdate, multiple models: Model is destroyed ", function(assert) {
		var oBinding0 = {getModel : function () {}},
			oBinding1 = {getModel : function () {}},
			oBinding2 = {getModel : function () {}},
			oCompositeBinding = {
				aBindings : [oBinding0, oBinding1, oBinding2],
				bMultipleModels : true
			};

		this.mock(oBinding0).expects("getModel").withExactArgs().returns({bDestroyed : false});
		this.mock(oBinding1).expects("getModel").withExactArgs().returns(null); // static binding
		this.mock(oBinding2).expects("getModel").withExactArgs().returns({bDestroyed : true});

		// code under test
		CompositeBinding.prototype.checkUpdate.call(oCompositeBinding);
	});

	QUnit.test("CompositeBinding: setType, no parts ignoring messages", function(assert) {
		var oCompositeBinding = {
				aBindings : []
			},
			oType = new MyCompositeType();

		this.mock(oType).expects("getPartsIgnoringMessages").withExactArgs().returns([]);

		// code under test
		CompositeBinding.prototype.setType.call(oCompositeBinding, oType, "~internalType");
	});

	QUnit.test("CompositeBinding: setType, some parts ignoring messages", function(assert) {
		var oSimpleBinding = {
				getIgnoreMessages : function () {},
				getType : function () {},
				setIgnoreMessages : function () {},
				supportsIgnoreMessages : function () {}
			},
			aBindings = [
				Object.assign({}, oSimpleBinding),
				Object.assign({}, oSimpleBinding),
				Object.assign({}, oSimpleBinding),
				Object.assign({}, oSimpleBinding)
			],
			oCompositeBinding = {aBindings : aBindings},
			oType = new MyCompositeType();

		this.mock(oType).expects("getPartsIgnoringMessages").withExactArgs().returns([1, 2, 3, 4]);
		// propagates message, index not part of the result of getPartsIgnoringMessages
		this.mock(aBindings[0]).expects("supportsIgnoreMessages").never();
		this.mock(aBindings[0]).expects("getIgnoreMessages").never();
		this.mock(aBindings[0]).expects("setIgnoreMessages").never();
		// shall ignore messages, but does not support the feature
		this.mock(aBindings[1]).expects("supportsIgnoreMessages").withExactArgs().returns(false);
		this.mock(aBindings[1]).expects("getIgnoreMessages").never();
		this.mock(aBindings[1]).expects("setIgnoreMessages").never();
		// shall ignore messages, but the binding parameter is already set
		this.mock(aBindings[2]).expects("supportsIgnoreMessages").withExactArgs().returns(true);
		this.mock(aBindings[2]).expects("getIgnoreMessages").withExactArgs().returns("~anyValue");
		this.mock(aBindings[2]).expects("setIgnoreMessages").never();
		// shall ignore messages and the binding parameter is not set
		this.mock(aBindings[3]).expects("supportsIgnoreMessages").withExactArgs().returns(true);
		this.mock(aBindings[3]).expects("getIgnoreMessages").withExactArgs().returns(undefined);
		this.mock(aBindings[3]).expects("setIgnoreMessages").withExactArgs(true);

		// code under test
		CompositeBinding.prototype.setType.call(oCompositeBinding, oType, "~internalType");
	});

	QUnit.test("CompositeBinding: setType calls processPartTypes", function(assert) {
		var oPart0 = {getType : function () {}},
			oPart1 = {getType : function () {}},
			oCompositeBinding = {
				aBindings : [oPart0, oPart1]
			},
			oType = new MyCompositeType();

		this.mock(oType).expects("getPartsIgnoringMessages").withExactArgs().returns([]);
		this.mock(oPart0).expects("getType").withExactArgs().returns("~type0");
		this.mock(oPart1).expects("getType").withExactArgs().returns("~type1");
		this.mock(oType).expects("processPartTypes").withExactArgs(["~type0", "~type1"]);

		// code under test
		CompositeBinding.prototype.setType.call(oCompositeBinding, oType, "~internalType");
	});

	QUnit.test("CompositeBinding: setType, register binding parts for type changes", function(assert) {
		const oPart0 = {getType() {}, registerTypeChanged() {}};
		const oPart1 = {getType() {}, registerTypeChanged() {}};
		const oPart2 = {getType() {}, registerTypeChanged() {}};
		const oCompositeBinding = {aBindings : [oPart0, oPart1, oPart2]};
		const oCompositeType = new CompositeType();
		const oCompositeTypeMock = this.mock(oCompositeType);
		const oPart0Mock = this.mock(oPart0);
		const oPart1Mock = this.mock(oPart1);
		const oPart2Mock = this.mock(oPart2);
		const oPropertyBindingMock = this.mock(PropertyBinding.prototype);

		oPropertyBindingMock.expects("setType").withExactArgs(oCompositeType, "~internalType").callThrough();
		oCompositeTypeMock.expects("getPartsIgnoringMessages").withExactArgs().returns([]);
		oCompositeTypeMock.expects("getUseRawValues").withExactArgs();
		oCompositeTypeMock.expects("getUseInternalValues").withExactArgs();
		oPart0Mock.expects("getType").withExactArgs().returns("~type0");
		oPart1Mock.expects("getType").withExactArgs().returns("~type1");
		oPart2Mock.expects("getType").withExactArgs().returns("~type2");
		oCompositeTypeMock.expects("processPartTypes").withExactArgs(["~type0", "~type1", "~type2"]);
		oPart0Mock.expects("registerTypeChanged").never();
		oPart1Mock.expects("registerTypeChanged").never();
		oPart2Mock.expects("registerTypeChanged").never();
		oCompositeTypeMock.expects("getPartsListeningToTypeChanges").withExactArgs().returns([]);

		// code under test (no relevant type)
		CompositeBinding.prototype.setType.call(oCompositeBinding, oCompositeType, "~internalType");

		oPropertyBindingMock.expects("setType").withExactArgs(oCompositeType, "~internalType").callThrough();
		oCompositeTypeMock.expects("getPartsIgnoringMessages").withExactArgs().returns([]);
		oCompositeTypeMock.expects("getUseRawValues").withExactArgs();
		oCompositeTypeMock.expects("getUseInternalValues").withExactArgs();
		oPart0Mock.expects("getType").withExactArgs().returns("~type0");
		oPart1Mock.expects("getType").withExactArgs().returns("~type1");
		oPart2Mock.expects("getType").withExactArgs().returns("~type2");
		oCompositeTypeMock.expects("processPartTypes").withExactArgs(["~type0", "~type1", "~type2"]);
		oCompositeTypeMock.expects("getPartsListeningToTypeChanges").withExactArgs().returns([0,2]);
		const oExpectation0 = oPart0Mock.expects("registerTypeChanged").withExactArgs(sinon.match.func);
		oPart1Mock.expects("registerTypeChanged").never();
		const oExpectation2 = oPart2Mock.expects("registerTypeChanged").withExactArgs(sinon.match.func);

		// code under test (relevant types for binding part 0 and 2)
		CompositeBinding.prototype.setType.call(oCompositeBinding, oCompositeType, "~internalType");

		oPart0Mock.expects("getType").withExactArgs().returns("~type0");
		oPart1Mock.expects("getType").withExactArgs().returns("~type1");
		oPart2Mock.expects("getType").withExactArgs().returns("~type2");
		oCompositeTypeMock.expects("processPartTypes").withExactArgs(["~type0", "~type1", "~type2"]);

		// code under test (callback triggered via binding part0 type change)
		oExpectation0.firstCall.args[0]();

		oPart0Mock.expects("getType").withExactArgs().returns("~type0");
		oPart1Mock.expects("getType").withExactArgs().returns("~type1");
		oPart2Mock.expects("getType").withExactArgs().returns("~type2");
		oCompositeTypeMock.expects("processPartTypes").withExactArgs(["~type0", "~type1", "~type2"]);

		// code under test (callback triggered via binding part2 type change)
		oExpectation2.firstCall.args[0]();

		oPropertyBindingMock.expects("setType").withExactArgs(null, "~internalType").callThrough();
		CompositeBinding.prototype.setType.call(oCompositeBinding, null, "~internalType");

		// code under test (change part2 inner type after composite type was reset)
		oExpectation2.firstCall.args[0]();
	});

	QUnit.module("sap.ui.model.CompositeBinding: With inner types/formatters", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.model = new JSONModel({
				a: 1,
				b: 2,
				c: 3,
				d: "2018-04-30",
				e: "2.000"
			});
			this.binding1 = this.model.bindProperty("/a");
			this.binding1.setFormatter(function(value) {return "-" + value + "-";});
			this.binding2 = this.model.bindProperty("/b");
			this.binding2.setType(new TypeFloat({decimals: 2}), "string");
			this.binding3 = this.model.bindProperty("/c");
			this.binding3.setType(new TypeInteger(null, {maximum: 5}), "string");
			this.composite = new CompositeBinding([this.binding1, this.binding2, this.binding3]);
			this.compositeraw = new CompositeBinding([this.binding1, this.binding2, this.binding3], true);
			this.binding4 = this.model.bindProperty("/d");
			this.binding4.setType(new TypeDate({pattern: "dd.MM.yyyy", source: { pattern: "yyyy-MM-dd" }}), "string");
			this.binding5 = this.model.bindProperty("/e");
			this.binding5.setType(new TypeFloat({decimals: 1, source: { decimals: 3 }}), "string");
			this.compositeinternal = new CompositeBinding([this.binding4, this.binding5]);
		},
		afterEach: function() {
			this.model = null;
			this.binding1 = null;
			this.binding2 = null;
			this.binding3 = null;
			this.binding4 = null;
			this.binding5 = null;
			this.composite = null;
			this.compositeraw = null;
			this.compositeinternal = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("getValue/setValue", function(assert) {
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true,
			"getValue() returns array of bound model values");
		this.composite.setValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3, "setValue() does change model values for contained bindings");
	});

	QUnit.test("getExternalValue/setExternalValue", function(assert) {
		assert.equal(this.composite.getExternalValue(), "-1- 2.00 3",
			"getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("-3- 2.00 1");
		assert.equal(this.model.getProperty("/a"), 1,
			"setExternalValue() cannot change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1,
			"setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("setExternalValue with undefined values", function(assert) {
		this.composite.setExternalValue("-3- 2.00");
		assert.equal(this.model.getProperty("/c"), 3,
			"setExternalValue() does change does not change value, if it is undefined");
	});

	QUnit.test("getRawValue/setRawValue", function(assert) {
		assert.deepEqual(this.composite.getRawValue(), [1, 2, 3], "getRawValue() returns array of raw values");
		this.composite.setRawValue([3, 2, 1]);
		assert.equal(this.model.getProperty("/a"), 3, "setRawValue() can change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1, "setRawValue() does change model values for contained bindings");
	});

	QUnit.test("setRawValue with undefined values", function(assert) {
		this.composite.setRawValue([3,2]);
		assert.equal(this.model.getProperty("/c"), 3,
			"setRawValue() does change does not change value, if it is undefined");
	});

	QUnit.test("getInternalValue/setInternalValue", function(assert) {
		assert.deepEqual(this.composite.getInternalValue(), [1, 2, 3], "getInternalValue() returns array of values");
		this.composite.setInternalValue([3, 2, 1]);
		assert.equal(this.model.getProperty("/a"), 3, "setInternalValue() cann change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1,
			"setInternalValue() does change model values for contained bindings");
		var aInternalValues = this.compositeinternal.getInternalValue();
		assert.deepEqual(aInternalValues[0], UI5Date.getInstance(2018, 3, 30),
			"Internal value of Date is a Date object");
		assert.strictEqual(aInternalValues[1], 2, "Internal value of Float is a JavaScript number");
		this.compositeinternal.setInternalValue([UI5Date.getInstance(2018, 7, 1), 5]);
		assert.equal(this.model.getProperty("/d"), "2018-08-01", "setInternalValue() accepts JS native values");
		assert.equal(this.model.getProperty("/e"), "5.000", "setInternalValue() accepts JS native values");
	});

	QUnit.test("setInternalValue with undefined values", function(assert) {
		this.composite.setRawValue([3,2]);
		assert.equal(this.model.getProperty("/c"), 3,
			"setInternalValue() does change does not change value, if it is undefined");
	});

	QUnit.test("internal type set to raw/internal", function(assert) {
		var oType = new MyCompositeType();
		this.compositeinternal.setType(oType, "raw");
		var aValues = this.compositeinternal.getExternalValue();
		assert.equal(aValues[0], "2018-04-30", "getExternalValue returns raw date value");
		assert.equal(aValues[1], "2.000", "getExternalValue returns raw number value");
		this.compositeinternal.setType(oType, "internal");
		aValues = this.compositeinternal.getExternalValue();
		assert.deepEqual(aValues[0], UI5Date.getInstance(2018, 3, 30), "getExternalValue returns internal date value");
		assert.strictEqual(aValues[1], 2, "getExternalValue returns internal number value");
	});

	QUnit.test("with bUseRawValues", function(assert) {
		assert.equal(this.compositeraw.getExternalValue(), "1 2 3",
			"getExternalValue() returns space separated list of values");
		this.compositeraw.setExternalValue("3 2 1");
		assert.equal(this.model.getProperty("/a"), 3,
			"setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("with bUseRawValues and nested validation", function(assert) {
		assert.equal(this.compositeraw.getExternalValue(), "1 2 3",
			"getExternalValue() returns space separated list of values");
		assert.throws(function(){this.compositeraw.setExternalValue("3 2 6");}.bind(this),
				ValidateException, "throws ValidationException for invalid inner value");
	});

	QUnit.test("with composite type", function(assert) {
		this.composite.setType(new MyCompositeType());
		assert.equal(this.composite.getExternalValue(), "-1-,2.00,3",
			"getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("-3-,2.00,1");
		assert.equal(this.model.getProperty("/a"), 1, "setExternalValue() cannot change binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1,
			"setExternalValue() does change model values for contained binding");
		assert.throws(function(){this.composite.setExternalValue("-3-,abc,1");}.bind(this),
				ParseException, "throws ParseException for invalid inner value");
	});

	QUnit.test("with composite type validating external values", function(assert) {
		var oType = new MyCompositeType();
		oType.validateValue = function(aValues) {
			assert.equal(aValues[0], "01.08.2018", "validateValue is called with external date value");
			assert.equal(aValues[1], "5.0", "validateValue is called with external number value");
		};
		this.compositeinternal.setType(oType);
		this.compositeinternal.setExternalValue("01.08.2018,5.0");
		this.compositeinternal.setInternalValue([UI5Date.getInstance(2018, 7, 1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with composite type validating internal values", function(assert) {
		var oType = new MyInternalValueType();
		oType.validateValue = function(aValues) {
			assert.deepEqual(aValues[0], UI5Date.getInstance(2018, 7, 1),
				"validateValue is called with internal date value");
			assert.strictEqual(aValues[1], 5, "validateValue is called with internal number value");
		};
		this.compositeinternal.setType(oType);
		this.compositeinternal.setInternalValue([UI5Date.getInstance(2018, 7, 1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with composite type validating raw values", function(assert) {
		var oType = new MyRawValueType();
		oType.validateValue = function(aValues) {
			assert.equal(aValues[0], "2018-08-01", "validateValue is called with raw date value");
			assert.equal(aValues[1], "5.000", "validateValue is called with raw number value");
		};
		this.compositeinternal.setType(oType);
		this.compositeinternal.setInternalValue([UI5Date.getInstance(2018, 7, 1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with raw value composite type", function(assert) {
		this.composite.setType(new MyRawValueType());
		assert.equal(this.composite.getExternalValue(), "1,2,3",
			"getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("3,2,1");
		assert.equal(this.model.getProperty("/a"), 3,
			"setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("with formatter", function(assert) {
		this.composite.setFormatter(myFormatter);
		assert.equal(this.composite.getExternalValue(), "-1--2.00-3", "getExternalValue() returns formatter values");
		this.composite.setFormatter(myCalculator);
		assert.equal(this.composite.getExternalValue(), "-1-2.003",
			"getExternalValue() returns string concatenated values");
	});

	QUnit.test("with bUseRawValues and formatter", function(assert) {
		this.compositeraw.setFormatter(myFormatter);
		assert.equal(this.compositeraw.getExternalValue(), "1-2-3", "getExternalValue() returns formatter values");
		this.compositeraw.setFormatter(myCalculator);
		assert.equal(this.compositeraw.getExternalValue(), 6, "getExternalValue() returns calculated value");
	});


	QUnit.module("sap.ui.model.CompositeBinding: Unresolved inner bindings", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.model = new JSONModel({
				a: 1,
				obj: {
					b: 2,
					c: 3
				}
			});
			this.binding1 = this.model.bindProperty("/a");
			this.binding2 = this.model.bindProperty("b");
			this.binding3 = this.model.bindProperty("c");
			this.composite = new CompositeBinding([this.binding1, this.binding2, this.binding3]);
		},
		afterEach: function() {
			this.model = null;
			this.binding1 = null;
			this.binding2 = null;
			this.binding3 = null;
			this.composite = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("isResolved", function(assert) {
		var context = this.model.createBindingContext("/obj");
		assert.equal(this.composite.isResolved(), false, "Not resolved because of unresolved inner bindings");
		this.composite.setContext(context);
		assert.equal(this.composite.isResolved(), true, "Resolved after binding context has been set");
	});

	QUnit.module("sap.ui.model.CompositeBinding: Use internal values", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.type = new TypeString();

			this.model = new JSONModel({
				a: 1,
				b: 2,
				c: 3
			});
			this.binding1 = this.model.bindProperty("/a");
			this.model.addBinding(this.binding1);

			this.binding2 = this.model.bindProperty("/b");
			this.binding2.setType(this.type);
			this.model.addBinding(this.binding2);

			this.binding3 = this.model.bindProperty("/c");
			this.model.addBinding(this.binding3);

			this.compositeUseInternalValue = new CompositeBinding([this.binding1, this.binding2, this.binding3]);
			this.compositeUseInternalValue.setType(new MyInternalValueType());
		},
		afterEach: function() {
			this.type = null;
			this.model = null;
			this.binding1 = null;
			this.binding2 = null;
			this.binding3 = null;
			this.compositeUseInternalValue = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Call getInternalValue()", function(assert) {
		var oSpy1 = this.spy(this.binding1, "getInternalValue");
		var oSpy2 = this.spy(this.binding2, "getInternalValue");
		var oSpy3 = this.spy(this.binding3, "getInternalValue");

		var oTypeSpy = this.spy(this.type, "getModelFormat");

		this.compositeUseInternalValue.getExternalValue();

		assert.equal(oSpy1.callCount, 1, "getInternalValue() function should be called");
		assert.equal(oSpy2.callCount, 1, "getInternalValue() function should be called");
		assert.equal(oSpy3.callCount, 1, "getInternalValue() function should be called");
		assert.equal(oTypeSpy.callCount, 1, "getModelFormat() function should be called");
	});

	QUnit.test("Call setInternalValue()", function(assert) {
		var oSpy1 = this.spy(this.binding1, "_setInternalValue");
		var oSpy2 = this.spy(this.binding2, "_setInternalValue");
		var oSpy3 = this.spy(this.binding3, "_setInternalValue");

		var oTypeSpy = this.spy(this.type, "getModelFormat");

		this.compositeUseInternalValue.setExternalValue("1 2 3");

		assert.equal(oSpy1.callCount, 1, "_setInternalValue() function should be called");
		assert.equal(oSpy2.callCount, 1, "_setInternalValue() function should be called");
		assert.equal(oSpy3.callCount, 1, "_setInternalValue() function should be called");
		assert.equal(oTypeSpy.callCount, 1, "getModelFormat() function should be called");
	});

	QUnit.test("Call getInternalValue() with null values", function(assert) {
		this.type = new TypeString();
		var oModelFormat = this.type.getModelFormat();

		this.model.setData({
			a: null,
			b: null,
			c: null
		});

		var oSpy1 = this.spy(this.binding1, "getInternalValue");
		var oSpy2 = this.spy(this.binding2, "getInternalValue");
		var oSpy3 = this.spy(this.binding3, "getInternalValue");

		var oParseSpy = this.spy(oModelFormat, "parse");

		this.compositeUseInternalValue.getExternalValue();

		assert.equal(oSpy1.callCount, 1, "getInternalValue() function should be called");
		assert.ok(oSpy1.returned(null), "getInternalValue() should return null");

		assert.equal(oSpy2.callCount, 1, "getInternalValue() function should be called");
		assert.ok(oSpy2.returned(null), "getInternalValue() should return null");
		assert.ok(oParseSpy.notCalled, "The model format is not used");

		assert.equal(oSpy3.callCount, 1, "getInternalValue() function should be called");
		assert.ok(oSpy3.returned(null), "getInternalValue() should return null");
	});

	QUnit.test("Call setInternalValue() with null values", function(assert) {
		this.type = new TypeString();
		var oModelFormat = this.type.getModelFormat();

		var oSpy1 = this.spy(this.binding1, "setValue");
		var oSpy2 = this.spy(this.binding2, "setValue");

		var oFormatSpy = this.spy(oModelFormat, "format");

		this.compositeUseInternalValue.setExternalValue([null, null]);

		assert.equal(oSpy1.callCount, 1, "setValue() should be called");
		assert.ok(oSpy1.calledWith(null), "setValue() should be called with null");
		assert.equal(oSpy2.callCount, 1, "setValue() should be called");
		assert.ok(oSpy2.calledWith(null), "setValue() should be called with null");
		assert.ok(oFormatSpy.notCalled, "The model format is not used");
	});

	QUnit.test("Throw Error if bUseRawValues & bUseInternalValues are true", function(assert) {
		var EvilType = MyCompositeType.extend("EvilType", {
			constructor: function() {
				MyCompositeType.apply(this);
				this.sName = "EvilType";
				this.bUseRawValues = true;
				this.bUseInternalValues = true;
			}
		});

		var oCompositeBinding = new CompositeBinding([this.binding1, this.binding2, this.binding3], true);
		assert.throws(function() {oCompositeBinding.setType(new EvilType());}, function(e) {
			return e.message === "Type EvilType has both 'bUseRawValues' & 'bUseInternalValues' set to true."
				+ " Only one of them is allowed to be true";
		});
	});

	QUnit.module("sap.ui.model.CompositeBinding: Use mixed binding modes", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach: function() {
			Localization.setLanguage("en-US");
			this.model = new JSONModel({
				a: "1",
				b: "2",
				c: "3"
			});
			this.binding1 = this.model.bindProperty("/a");
			this.binding1.setBindingMode(BindingMode.TwoWay);

			this.binding2 = this.model.bindProperty("/b");
			this.binding2.setBindingMode(BindingMode.OneWay);

			this.binding3 = this.model.bindProperty("/c");
			this.binding3.setBindingMode(BindingMode.OneTime);

			this.composite = new CompositeBinding([this.binding1, this.binding2, this.binding3]);
			this.composite.setBindingMode(BindingMode.TwoWay);
			this.composite.attachChange(function() {});
			this.composite.initialize();

		},
		afterEach: function() {
			this.model = null;
			this.binding1 = null;
			this.binding2 = null;
			this.binding3 = null;
			this.composite = null;
			// reset the language
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Call setExtermalValue", function(assert) {
		this.composite.setExternalValue("4 5 6");

		assert.equal(this.model.getProperty("/a"), "4", "Property a gets updated");
		assert.equal(this.model.getProperty("/b"), "2", "Property b stays unchanged");
		assert.equal(this.model.getProperty("/c"), "3", "Property b stays unchanged");
		assert.equal(this.composite.getExternalValue(), "4 2 3", "Composite returns matching value");
	});

	QUnit.test("Call setInternalValue", function(assert) {
		this.composite.setInternalValue(["4", "5", "6"]);

		assert.equal(this.model.getProperty("/a"), "4", "Property a gets updated");
		assert.equal(this.model.getProperty("/b"), "2", "Property b stays unchanged");
		assert.equal(this.model.getProperty("/c"), "3", "Property b stays unchanged");
		assert.equal(this.composite.getExternalValue(), "4 2 3", "Composite returns matching value");
	});

	QUnit.test("Call setRawValue", function(assert) {
		this.composite.setRawValue(["4", "5", "6"]);

		assert.equal(this.model.getProperty("/a"), "4", "Property a gets updated");
		assert.equal(this.model.getProperty("/b"), "2", "Property b stays unchanged");
		assert.equal(this.model.getProperty("/c"), "3", "Property b stays unchanged");
		assert.equal(this.composite.getExternalValue(), "4 2 3", "Composite returns matching value");
	});

	QUnit.test("Binding update dependent on mode", function(assert) {
		var oSpy = this.spy(this.composite, "_fireChange");
		assert.equal(this.composite.getExternalValue(), "1 2 3", "Initial value");

		this.model.setProperty("/a", "4");
		assert.ok(oSpy.calledOnce, "fireChange has been called on composite binding");
		assert.equal(this.composite.getExternalValue(), "4 2 3", "Value is updated for TwoWay");
		oSpy.resetHistory();

		this.model.setProperty("/b", "5");
		assert.ok(oSpy.calledOnce, "fireChange has been called on composite binding");
		assert.equal(this.composite.getExternalValue(), "4 5 3", "Value is updated for OneWay");
		oSpy.resetHistory();

		this.model.setProperty("/c", "6");
		assert.ok(oSpy.notCalled, "fireChange has not been called on composite binding");
		assert.equal(this.composite.getExternalValue(), "4 5 3", "Value is not updated for OneTime");
		oSpy.resetHistory();
	});

	//*********************************************************************************************
	QUnit.module("sap.ui.model.CompositeBinding", {
		before() {
			this.__ignoreIsolatedCoverage__ = true;
		},
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		}
	});

	//**********************************************************************************************
	QUnit.test("setContext: propagate null context", function () {
		var aBindings = [
				new PropertyBinding({}, ""),
				new StaticBinding("")
			],
			oCompositeBinding = new CompositeBinding(aBindings);

		this.mock(aBindings[0]).expects("getModel").never();
		this.mock(aBindings[0]).expects("getContext").returns("~oBindingContext0");
		this.mock(aBindings[0]).expects("isRelative").returns(false);
		this.mock(aBindings[0]).expects("setContext").withExactArgs(null);
		this.mock(aBindings[1]).expects("getModel").never();
		this.mock(aBindings[1]).expects("getContext").returns("~oBindingContext0");
		this.mock(aBindings[1]).expects("isRelative").returns(false);
		this.mock(aBindings[1]).expects("setContext").withExactArgs(null);

		this.mock(oCompositeBinding).expects("checkUpdate").never();

		// code under test
		oCompositeBinding.setContext(null);
	});

	//**********************************************************************************************
	QUnit.test("setContext: no context propagation if the context's model is already destroyed",
			function () {
		var aBindings = [new PropertyBinding(/*model*/undefined, "")],
			oCompositeBinding = new CompositeBinding(aBindings),
			oContext = new Context(/*model*/{}, "");

		this.mock(oContext).expects("getModel").returns(/*destroyed context*/undefined);
		this.mock(aBindings[0]).expects("getContext").never();
		this.mock(aBindings[0]).expects("isRelative").never();
		this.mock(aBindings[0]).expects("setContext").never();

		this.mock(oCompositeBinding).expects("checkUpdate").never();

		// code under test
		oCompositeBinding.setContext(oContext);
	});

	//**********************************************************************************************
[undefined, {}, {foo : "bar"}].forEach(function (mParameters, i) {
	var sTitle = "setContext: propagate context if context update is required; mParameters without "
			+ "'fnIsBindingRelevant' does not affect old behavior; " + i;

	QUnit.test(sTitle, function () {
		var oModel = {},
			aBindings = [
				new PropertyBinding(oModel, ""), // same model
				new PropertyBinding({}, ""), // different model
				new StaticBinding("") // no model
			],
			oBindingMock0 = this.mock(aBindings[0]),
			oBindingMock1 = this.mock(aBindings[1]),
			oBindingMock2 = this.mock(aBindings[2]),
			oCompositeBinding = new CompositeBinding(aBindings),
			oContext = new Context(oModel, "");

		this.mock(oContext).expects("getModel").returns(oModel);

		// aBindings[0]
		oBindingMock0.expects("getModel").returns(oModel);
		oBindingMock0.expects("getContext").returns("~oBindingContext0");
		oBindingMock0.expects("isRelative")
			.returns(false); // return value irrelevant; scenario does not cover call of checkUpdate
		oBindingMock0.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// aBindings[1]
		oBindingMock1.expects("getModel").returns({/*different model*/});
		oBindingMock1.expects("getContext").never();
		oBindingMock1.expects("isRelative").never();
		oBindingMock1.expects("setContext").never();

		// aBindings[2]
		oBindingMock2.expects("getModel").returns(null);
		oBindingMock2.expects("getContext").never();
		oBindingMock2.expects("isRelative").never();
		oBindingMock2.expects("setContext").never();

		this.mock(oCompositeBinding).expects("checkUpdate").never();

		// code under test
		oCompositeBinding.setContext(oContext, mParameters);
	});
});

	//**********************************************************************************************
	QUnit.test("setContext: context propagation decision via callback function", function () {
		var aBindings = [
				new PropertyBinding({}, ""),
				new PropertyBinding({}, "")
			],
			oBindingMock0 = this.mock(aBindings[0]),
			oBindingMock1 = this.mock(aBindings[1]),
			oCompositeBinding = new CompositeBinding(aBindings),
			oContext = new Context({}, ""),
			mParameters = {fnIsBindingRelevant : function () {}},
			mParametersMock = this.mock(mParameters);

		this.mock(oContext).expects("getModel")
			.returns(undefined); // return value irrelevant; value not required for test scenario

		// aBindings[0]
		mParametersMock.expects("fnIsBindingRelevant").withExactArgs(0).returns(false);
		oBindingMock0.expects("getContext").never();
		oBindingMock0.expects("isRelative").never();
		oBindingMock0.expects("setContext").never();

		// aBindings[1]
		mParametersMock.expects("fnIsBindingRelevant").withExactArgs(1).returns(true);
		oBindingMock1.expects("getContext").returns("oBindingContext1");
		oBindingMock1.expects("isRelative")
			.returns(false); // return value irrelevant; scenario does not cover call of checkUpdate
		oBindingMock1.expects("setContext").withExactArgs(sinon.match.same(oContext));

		this.mock(oCompositeBinding).expects("checkUpdate").never();

		// code under test
		oCompositeBinding.setContext(oContext, mParameters);
	});

	//**********************************************************************************************
	QUnit.test("setContext: check if checkUpdate is required", function () {
		var oModel = {},
			aBindings = [
				new PropertyBinding(oModel, ""),
				new PropertyBinding(oModel, ""),
				new PropertyBinding(oModel, ""),
				new PropertyBinding(oModel, "")
			],
			oBindingMock0 = this.mock(aBindings[0]),
			oBindingMock1 = this.mock(aBindings[1]),
			oBindingMock2 = this.mock(aBindings[2]),
			oBindingMock3 = this.mock(aBindings[3]),
			oCompositeBinding = new CompositeBinding(aBindings),
			oContext = new Context(oModel, ""),
			oContextMock = this.mock(Context),
			oDataState = {getControlMessages : function () {}};

		this.mock(oContext).expects("getModel").returns(oModel);

		// aBindings[0]
		oBindingMock0.expects("getModel").returns(oModel);
		oBindingMock0.expects("getContext").returns("~oBindingContext0");
		oBindingMock0.expects("isRelative").returns(false);
		oContextMock.expects("hasChanged").never();
		oBindingMock0.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// aBindings[1]
		oBindingMock1.expects("getModel").returns(oModel);
		oBindingMock1.expects("getContext").returns("oBindingContext1");
		oBindingMock1.expects("isRelative").returns(true);
		oContextMock.expects("hasChanged")
			.withExactArgs("oBindingContext1", sinon.match.same(oContext))
			.returns(false);
		oBindingMock1.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// aBindings[2]
		oBindingMock2.expects("getModel").returns(oModel);
		oBindingMock2.expects("getContext").returns("oBindingContext2");
		oBindingMock2.expects("isRelative").returns(true);
		oContextMock.expects("hasChanged")
			.withExactArgs("oBindingContext2", sinon.match.same(oContext))
			.returns(true);
		oBindingMock2.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// aBindings[3]
		oBindingMock3.expects("getModel").returns(oModel);
		oBindingMock3.expects("getContext").returns("oBindingContext3");
		oBindingMock3.expects("isRelative").never();
		oContextMock.expects("hasChanged").never();
		oBindingMock3.expects("setContext").withExactArgs(sinon.match.same(oContext));

		this.mock(oCompositeBinding).expects("getDataState").returns(oDataState);
		this.mock(oDataState).expects("getControlMessages").returns([]);
		this.mock(oCompositeBinding).expects("checkUpdate").withExactArgs(0);

		// code under test
		oCompositeBinding.setContext(oContext);
	});

	//**********************************************************************************************
[{
	binding0 : {checkUpdate : true, newContext : true},
	binding1 : {checkUpdate : false, newContext : false},
	bForceUpdate : true
}, {
	binding0 : {checkUpdate : false, newContext : false},
	binding1 : {checkUpdate : true, newContext : true},
	bForceUpdate : true
}, {
	binding0 : {checkUpdate : true, newContext : false},
	binding1 : {checkUpdate : false, newContext : true},
	bForceUpdate : true
}, {
	binding0 : {checkUpdate : false, newContext : true},
	binding1 : {checkUpdate : true, newContext : false},
	bForceUpdate : false
}].forEach(function (oFixture, i) {
	[0, 42].forEach(function (iControlMessages) {
	var sTitle = "setContext: check if checkUpdate is called with bForceUpdate; " + i
			+ "; control messages: " + iControlMessages;

	QUnit.test(sTitle, function () {
		var oModel = {},
			aBindings = [
				new PropertyBinding(oModel, ""),
				new PropertyBinding(oModel, "")
			],
			oBindingMock0 = this.mock(aBindings[0]),
			oBindingMock1 = this.mock(aBindings[1]),
			oCompositeBinding = new CompositeBinding(aBindings),
			oContext = new Context(oModel, ""),
			oContextMock = this.mock(Context),
			oDataState = {getControlMessages : function () {}};

		this.mock(oContext).expects("getModel").returns(oModel);

		// aBindings[0]
		oBindingMock0.expects("getModel").returns(oModel);
		oBindingMock0.expects("getContext")
			.returns(oFixture.binding0.newContext ? "foo" : oContext);
		oBindingMock0.expects("isRelative").returns(true);
		oContextMock.expects("hasChanged")
			.withExactArgs(sinon.match.same(oContext).or("foo"), sinon.match.same(oContext))
			.returns(oFixture.binding0.checkUpdate);
		oBindingMock0.expects("setContext").withExactArgs(sinon.match.same(oContext));

		// aBindings[1]
		oBindingMock1.expects("getModel").returns(oModel);
		oBindingMock1.expects("getContext")
			.returns(oFixture.binding1.newContext ? "foo" : oContext);
		oBindingMock1.expects("isRelative").returns(true)
			.exactly(!oFixture.binding0.checkUpdate ? 1 : 0);
		oContextMock.expects("hasChanged")
			.withExactArgs(sinon.match.same(oContext).or("foo"), sinon.match.same(oContext))
			.returns(oFixture.binding1.checkUpdate)
			.exactly(!oFixture.binding0.checkUpdate ? 1 : 0);
		oBindingMock1.expects("setContext").withExactArgs(sinon.match.same(oContext));


		if (oFixture.bForceUpdate) {
			this.mock(oCompositeBinding).expects("getDataState").returns(oDataState);
			this.mock(oDataState).expects("getControlMessages")
				.returns(new Array(iControlMessages));
			this.mock(oCompositeBinding).expects("checkUpdate").withExactArgs(iControlMessages);
		} else {
			this.mock(oCompositeBinding).expects("checkUpdate").withExactArgs(false);
		}

		// code under test
		oCompositeBinding.setContext(oContext);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("getResolvedPath", function (assert) {
		var oModel = {},
			oCompositeBinding = new CompositeBinding([
				new PropertyBinding(oModel, ""),
				new PropertyBinding(oModel, "")
			]);

		// code under test
		assert.strictEqual(oCompositeBinding.getResolvedPath(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("destroy", function (assert) {
		var oCompositeDestroyCall, oPart0DestroyCall, oPart1DestroyCall,
			oModel = {},
			oPart0 = new PropertyBinding(oModel, ""),
			oPart1 = new PropertyBinding(oModel, ""),
			oCompositeBinding = new CompositeBinding([oPart0, oPart1]);

		oPart0DestroyCall = this.mock(oPart0).expects("destroy").withExactArgs();
		oPart1DestroyCall = this.mock(oPart1).expects("destroy").withExactArgs();
		oCompositeDestroyCall = this.mock(PropertyBinding.prototype).expects("destroy")
			.withExactArgs().on(oCompositeBinding);

		// code under test
		oCompositeBinding.destroy();

		assert.ok(oCompositeDestroyCall.calledAfter(oPart0DestroyCall));
		assert.ok(oCompositeDestroyCall.calledAfter(oPart1DestroyCall));
	});
});