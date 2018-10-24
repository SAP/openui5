/*global QUnit */
sap.ui.define([
	"sap/ui/model/CompositeType",
	"sap/ui/model/CompositeBinding",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Float",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/base/util/deepEqual"
], function(
	CompositeType,
	CompositeBinding,
	ParseException,
	ValidateException,
	JSONModel,
	TypeFloat,
	TypeInteger,
	TypeString,
	TypeDate,
	deepEqual
) {
	"use strict";

	var MyCompositeType = CompositeType.extend("MyCompositeType", {
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


	function myFormatter(a, b, c) {
		return a + "-" + b + "-" + c;
	}

	function myCalculator(a, b, c) {
		return a + b + c;
	}

	QUnit.module("Basic functionality", {
		beforeEach: function() {
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
		}
	});

	QUnit.test("getValue/setValue", function(assert) {
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true, "getValue() returns array of bound model values");
		this.composite.setValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3, "setValue() does change model values for contained bindings");
	});

	QUnit.test("getExternalValue/setExternalValue", function(assert) {
		assert.equal(this.composite.getExternalValue(), "1 2 3", "getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("3 2 1");
		assert.equal(this.model.getProperty("/a"), 3, "setExternalValue() does change model values for contained bindings");
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
		assert.equal(this.model.getProperty("/a"), 3, "setExternalValue() does change model value for contained bindings");
		assert.throws(function(){this.composite.setExternalValue("0,0,0");}.bind(this),
			ValidateException, "validation throws ValidateExpception for invalid values");
	});

	QUnit.test("array type", function(assert) {
		this.composite.setType(null, "int[]");
		assert.deepEqual(this.composite.getExternalValue(), [1,2,3]);
		this.composite.setExternalValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3, "setExternalValue() does change model value for contained bindings");
	});

	QUnit.test("simple type", function(assert) {
		assert.throws(function(){this.composite.setType(new TypeFloat());}.bind(this),
			Error, "setting a simple type on a composite binding throws");
	});

	QUnit.test("suspend/resume", function(assert) {

		var done = assert.async();
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true, "getValue() returns array of bound model values");
		this.composite.attachChange(this, function() {
			assert.equal(deepEqual(this.getValue(), [666,2,3]), true, "getValue() returns array of bound model values");
			done();
		});
		this.composite.suspend();
		this.composite.setValue([3,2,1]);
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true, "getValue() returns array of bound model values");
		this.model.setProperty("/a",666);
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true, "getValue() returns array of bound model values");
		this.composite.resume();
	});

	QUnit.module("With inner types/formatters", {
		beforeEach: function() {
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
		}
	});

	QUnit.test("getValue/setValue", function(assert) {
		assert.equal(deepEqual(this.composite.getValue(), [1,2,3]), true, "getValue() returns array of bound model values");
		this.composite.setValue([3,2,1]);
		assert.equal(this.model.getProperty("/a"), 3, "setValue() does change model values for contained bindings");
	});

	QUnit.test("getExternalValue/setExternalValue", function(assert) {
		assert.equal(this.composite.getExternalValue(), "-1- 2.00 3", "getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("-3- 2.00 1");
		assert.equal(this.model.getProperty("/a"), 1, "setExternalValue() cannot change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1, "setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("getRawValue/setRawValue", function(assert) {
		assert.deepEqual(this.composite.getRawValue(), [1, 2, 3], "getRawValue() returns array of raw values");
		this.composite.setRawValue([3, 2, 1]);
		assert.equal(this.model.getProperty("/a"), 3, "setRawValue() can change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1, "setRawValue() does change model values for contained bindings");
	});

	QUnit.test("getInternalValue/setInternalValue", function(assert) {
		assert.deepEqual(this.composite.getInternalValue(), [1, 2, 3], "getInternalValue() returns array of values");
		this.composite.setInternalValue([3, 2, 1]);
		assert.equal(this.model.getProperty("/a"), 3, "setInternalValue() cann change value of binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1, "setInternalValue() does change model values for contained bindings");
		var aInternalValues = this.compositeinternal.getInternalValue();
		assert.deepEqual(aInternalValues[0], new Date(2018,3,30), "Internal value of Date is a Date object");
		assert.strictEqual(aInternalValues[1], 2, "Internal value of Float is a JavaScript number");
		this.compositeinternal.setInternalValue([new Date(2018,7,1), 5]);
		assert.equal(this.model.getProperty("/d"), "2018-08-01", "setInternalValue() accepts JS native values");
		assert.equal(this.model.getProperty("/e"), "5.000", "setInternalValue() accepts JS native values");
	});

	QUnit.test("with bUseRawValues", function(assert) {
		assert.equal(this.compositeraw.getExternalValue(), "1 2 3", "getExternalValue() returns space separated list of values");
		this.compositeraw.setExternalValue("3 2 1");
		assert.equal(this.model.getProperty("/a"), 3, "setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("with bUseRawValues and nested validation", function(assert) {
		assert.equal(this.compositeraw.getExternalValue(), "1 2 3", "getExternalValue() returns space separated list of values");
		assert.throws(function(){this.compositeraw.setExternalValue("3 2 6");}.bind(this),
				ValidateException, "throws ValidationException for invalid inner value");
	});

	QUnit.test("with composite type", function(assert) {
		this.composite.setType(new MyCompositeType());
		assert.equal(this.composite.getExternalValue(), "-1-,2.00,3", "getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("-3-,2.00,1");
		assert.equal(this.model.getProperty("/a"), 1, "setExternalValue() cannot change binding with formatter");
		assert.equal(this.model.getProperty("/c"), 1, "setExternalValue() does change model values for contained binding");
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
		this.compositeinternal.setInternalValue([new Date(2018,7,1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with composite type validating internal values", function(assert) {
		var oType = new MyInternalValueType();
		oType.validateValue = function(aValues) {
			assert.deepEqual(aValues[0], new Date(2018,7,1), "validateValue is called with internal date value");
			assert.strictEqual(aValues[1], 5, "validateValue is called with internal number value");
		};
		this.compositeinternal.setType(oType);
		this.compositeinternal.setInternalValue([new Date(2018,7,1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with composite type validating raw values", function(assert) {
		var oType = new MyRawValueType();
		oType.validateValue = function(aValues) {
			assert.equal(aValues[0], "2018-08-01", "validateValue is called with raw date value");
			assert.equal(aValues[1], "5.000", "validateValue is called with raw number value");
		};
		this.compositeinternal.setType(oType);
		this.compositeinternal.setInternalValue([new Date(2018,7,1), 5]);
		this.compositeinternal.setRawValue(["2018-08-01", "5.000"]);
	});

	QUnit.test("with raw value composite type", function(assert) {
		this.composite.setType(new MyRawValueType());
		assert.equal(this.composite.getExternalValue(), "1,2,3", "getExternalValue() returns space separated list of values");
		this.composite.setExternalValue("3,2,1");
		assert.equal(this.model.getProperty("/a"), 3, "setExternalValue() does change model values for contained bindings");
	});

	QUnit.test("with formatter", function(assert) {
		this.composite.setFormatter(myFormatter);
		assert.equal(this.composite.getExternalValue(), "-1--2.00-3", "getExternalValue() returns formatter values");
		this.composite.setFormatter(myCalculator);
		assert.equal(this.composite.getExternalValue(), "-1-2.003", "getExternalValue() returns string concatenated values");
	});

	QUnit.test("with bUseRawValues and formatter", function(assert) {
		this.compositeraw.setFormatter(myFormatter);
		assert.equal(this.compositeraw.getExternalValue(), "1-2-3", "getExternalValue() returns formatter values");
		this.compositeraw.setFormatter(myCalculator);
		assert.equal(this.compositeraw.getExternalValue(), 6, "getExternalValue() returns calculated value");
	});


	QUnit.module("Unresolved inner bindings", {
		beforeEach: function() {
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
		}
	});

	QUnit.test("isResolved", function(assert) {
		var context = this.model.createBindingContext("/obj");
		assert.equal(this.composite.isResolved(), false, "Not resolved because of unresolved inner bindings");
		this.composite.setContext(context);
		assert.equal(this.composite.isResolved(), true, "Resolved after binding context has been set");
	});

	QUnit.module("Use internal values", {
		beforeEach: function() {
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
		var oSpy1 = this.spy(this.binding1, "setInternalValue");
		var oSpy2 = this.spy(this.binding2, "setInternalValue");
		var oSpy3 = this.spy(this.binding3, "setInternalValue");

		var oTypeSpy = this.spy(this.type, "getModelFormat");

		this.compositeUseInternalValue.setExternalValue("1 2 3");

		assert.equal(oSpy1.callCount, 1, "setInternalValue() function should be called");
		assert.equal(oSpy2.callCount, 1, "setInternalValue() function should be called");
		assert.equal(oSpy3.callCount, 1, "setInternalValue() function should be called");
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
			return e.message === "Type EvilType has both 'bUseRawValues' & 'bUseInternalValues' set to true. Only one of them is allowed to be true";
		});
	});
});