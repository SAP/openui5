/*global sinon, QUnit*/
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/base/util/isPlainObject",
	"sap/ui/base/DataType",
	"sap/ui/core/Lib",
	'sap/ui/core/library' // provides sap.ui.core data type and enums
], function (future, Log, ObjectPath, isPlainObject, DataType, Library) {
	"use strict";

	function random(values) {
		if (Array.isArray(values)) {
			return values[Math.floor(values.length * Math.random())];
		}
		return Math.floor(values * Math.random());
	}

	function nonEmptyArray(array) {
		return Array.isArray(array) && array.length > 0 ? array : null;
	}

	function makeLiteral(value) {
		if (Array.isArray(value)) {
			return "[" + value.map(makeLiteral).join(',') + "]";
		}
		if (typeof value === 'string' || value instanceof String) {
			return "'" + value.replace(/'/g, "\\'") + "'";
		}
		return String(value);
	}

	/*
	 * To facilitate actual/expected comparison even for bound functions,
	 * the following helper makes fn.bind(...) a noop.
	 */
	function unbindable(fn) {
		fn.bind = function () {
			return this;
		};
		return fn;
	}

	var oController = {
		handler: unbindable(function handler() { }),
		nested: {
			handler: unbindable(function nestedHandler() { })
		}
	};

	/**
	 * @deprecated
	 */
	window.globalUtil = {
		formatMessage: function() { return ""; }
	};

	// Note: 'module1' is a name that exists both in global namespace and as a local module in mModules
	var mModules = {
		module1: {
			handler: function() { return this; }
		}
	};

	/**
	 * @deprecated
	 */
	window.module1 = {
		globalHandler: function() { return this; }
	};

	var NAN = {};
	var ERROR = {};
	var PRIMITIVE_TYPES = {
		"any": {
			valid: [0, true, "abc", /xyz/, {}, [[0, true]]],
			parseValue: [
				{ input: '0', value: '0' },
				{ input: 'true', value: 'true' },
				{ input: '{"a":3}', value: '{"a":3}' },
				{ input: 'a\n\tb', value: 'a\n\tb' }
			]
		},
		"boolean": {
			valid: [false, true],
			invalid: ["yes", 0],
			parseValue: [
				{ input: 'false', value: false },
				{ input: 'true', value: true },
				{ input: '', value: false },
				{ input: 'xyz', value: false }
			]
		},
		"int": {
			valid: [0, -42, NaN, Infinity],
			invalid: ['0', 0.5],
			parseValue: [
				{ input: '0', value: 0 },
				{ input: '123', value: 123 },
				{ input: '123e4', value: 123 },
				{ input: '123f2', value: 123 },
				{ input: '123,8', value: 123 },
				{ input: '123.8', value: 123 },
				{ input: 'abc', value: NAN }
			]
		},
		"float": {
			valid: [0.5, 0, -1, Math.PI, NaN, Infinity],
			invalid: [null, undefined, "abc", {}],
			parseValue: [
				{ input: '0', value: 0 },
				{ input: '123', value: 123 },
				{ input: '123e4', value: 1230000 },
				{ input: '123f2', value: 123 },
				{ input: '123,8', value: 123 },
				{ input: '123.8', value: 123.8 },
				{ input: '.8', value: 0.8 },
				{ input: 'abc', value: NAN }
			]
		},
		"string": {
			// eslint-disable-next-line no-new-wrappers
			valid: ["a", "", new String("abc")],
			invalid: [0, true, {}],
			parseValue: [
				{ input: 'abc', value: 'abc' },
				{ input: '123', value: '123' },
				{ input: '', value: '' }
			]
		},
		"object": {
			valid: [{}, [], function () { }, String, document, null, {}],
			invalid: [undefined, "abc", 123],
			parseValue: [
				{ input: '{"x":2, "y":{"a":1,"b":2}}', value: { x: 2, y: { a: 1, b: 2 } } },
				{ input: '{"x":2, "y":[1,2,3]}', value: { x: 2, y: [1, 2, 3] } },
				{ input: '{x:2, y:{a:1,b:2}}', value: ERROR },
				{ input: '12', value: 12 } // TODO should be rejected, it's not an object
			]
		},
		"function": {
			valid: [function () { }, String, Object, null, undefined],
			invalid: [{}, "abc", ".abc"],
			parseValue: [
				{ input: '.handler', value: oController.handler, context: oController, compareMode: 'strict' },
				{ input: '.nested.handler', value: oController.nested.handler, context: oController, compareMode: 'strict' },
				/**
				 * @deprecated
				 */
				{ input: 'globalUtil.formatMessage', value: window.globalUtil.formatMessage, context: oController, compareMode: 'strict' },
				/**
				 * @deprecated
				 */
				{ input: 'globalUtil.formatMessage', value: window.globalUtil.formatMessage, context: undefined, compareMode: 'strict' },
				/**
				 * @deprecated
				 */
				{ input: 'globalUtil.formatMessage', value: window.globalUtil.formatMessage, context: undefined, locals: mModules, compareMode: 'strict' },
				{ input: 'module1.handler', context: oController, locals: mModules, thisContext: mModules.module1},
				{ input: 'module1.handler', context: undefined, locals: mModules, thisContext: mModules.module1},
				/**
				 * @deprecated
				 */
				{ input: 'module1.globalHandler', value: window.module1.globalHandler, context: undefined, compareMode: 'strict'},
				{ input: 'module1.globalHandler', value: ERROR, context: undefined, locals: mModules},
				{ input: '.handler', value: oController.handler, context: oController, locals: mModules, compareMode: 'strict' },
				{ input: '.handler', value: ERROR, context: undefined, compareMode: 'strict' },
				{ input: '.nested.handler', value: ERROR, context: undefined, compareMode: 'strict' },
				{ input: '.handler()', value: ERROR, context: oController, compareMode: 'strict' },
				{ input: '.handler["x"]', value: ERROR, context: oController, compareMode: 'strict' },
				{ input: '.hand..ler', value: ERROR, context: oController, compareMode: 'strict' },
				{ input: '.handler#1', value: ERROR, context: oController, compareMode: 'strict' }
			]
		}
	};



	QUnit.module("Basic");

	QUnit.test("constructor", function (assert) {
		assert.equal(typeof DataType, 'function', "DataType must be a function to allow instanceof operator");
		assert['throws'](function () {
			new DataType();
		}, Error, "DataType constructor must not be called and throws exception");
	});

	QUnit.test("static methods", function (assert) {
		assert.equal(typeof DataType.getType, 'function', "DataType must have a static function 'getType'");
		assert.equal(typeof DataType.createType, 'function', "DataType must have a static function 'createType'");
		assert.equal(DataType.getType("array"), undefined, "generic type 'array' should be hidden from 'getType' API");
	});



	QUnit.module("Primitive Types");

	Object.keys(PRIMITIVE_TYPES).forEach(function (type) {

		var oTypeSetup = PRIMITIVE_TYPES[type];
		var valid = nonEmptyArray(oTypeSetup.valid);
		var invalid = nonEmptyArray(oTypeSetup.invalid);
		var parseValue = nonEmptyArray(oTypeSetup.parseValue);

		QUnit.test("'" + type + "'", function (assert) {

			var typeObject = DataType.getType(type);
			assert.ok(typeObject, "type should exist");
			assert.strictEqual(typeObject.getBaseType(), undefined, "...should have no base type");
			assert.strictEqual(typeObject.getPrimitiveType(), typeObject, "...should return itself as its primitive type");
			assert.strictEqual(typeObject.getName(), type, "... should have the correct name");
			assert.strictEqual(typeObject.isArrayType(), false, "... must not be marked as array type");
			assert.strictEqual(typeObject.getComponentType(), undefined, "... must not have a component type");
			assert.strictEqual(typeObject.isEnumType(), false, "... must not be marked as enum type");
			assert.strictEqual(typeObject.getEnumValues(), undefined, "type should not have enum values");

			if (valid) {
				valid.forEach(function (value) {
					assert.equal(typeObject.isValid(value), true, makeLiteral(value) + " should be accepted");
				});
			}
			if (invalid) {
				invalid.forEach(function (value) {
					assert.equal(typeObject.isValid(value), false, makeLiteral(value) + " should not be accepted");
				});
			}

			if (parseValue) {
				parseValue.forEach(function (data) {
					try {
						var result = typeObject.parseValue(data.input, (data.context || data.locals) ? {
								context: data.context,
								locals: data.locals
							} : undefined);
						if (data.value === ERROR) {
							assert.ok(false, "parsing '" + data.input + "' should have failed");
						} else if (data.value === NAN) {
							assert.ok(result !== result, "parsing '" + data.input + "' should result in a NaN value"); //eslint-disable-line no-self-compare
						} else if (data.compareMode === 'strict') {
							assert.strictEqual(result, data.value, "parsing '" + data.input + "' should deliver the expected result");
						} else if (data.thisContext ) {
							assert.strictEqual(result(), data.thisContext, "context should be set");
						} else {
							assert.deepEqual(result, data.value, "parsing '" + data.input + "' should deliver the expected result");
						}
					} catch (e) {
						if (data.value === ERROR) {
							assert.ok(true, "parsing '" + data.input + "' failed as expected");
						} else {
							assert.ok(false, "parsing '" + data.input + "' failed unexpectedly with " + (e && e.messge || e));
						}
					}
				});
			}

			assert['throws'](function () {
				DataType.createType(type, {});
			}, Error, "primitive types can't be re-defined");

		});

	});



	QUnit.module("Array Types");

	QUnit.test("hidden type 'array'", function (assert) {
		var orig = window.array;
		delete window.array;
		assert.strictEqual(DataType.getType('array'), undefined, "lookup must not return type 'array'");

		window.array = DataType.createType("dummy", {}, 'any');
		assert.strictEqual(DataType.getType('array'), undefined, "lookup must not return type 'array' even if it exists as a global name");

		assert['throws'](function () {
			DataType.createType('array', {});
		}, Error, "hidden type 'array' can't be re-defined");

		window.array = orig;
	});

	Object.keys(PRIMITIVE_TYPES).forEach(function (type) {

		var oTypeSetup = PRIMITIVE_TYPES[type],
			valid = nonEmptyArray(oTypeSetup.valid),
			invalid = nonEmptyArray(oTypeSetup.invalid);

		QUnit.test("'" + type + "[]'", function (assert) {

			var typeObject = DataType.getType(type);
			var arrayTypeObject = DataType.getType(type + '[]');
			assert.ok(arrayTypeObject, "type '" + type + "[]' exists");
			assert.strictEqual(arrayTypeObject.getComponentType(), typeObject, "component type should be the expected type");
			assert.ok(
				arrayTypeObject.getBaseType() instanceof DataType && arrayTypeObject.getBaseType().getName() === 'array',
				"array types should have 'array' as base type");
			assert.strictEqual(arrayTypeObject.getName(), type + '[]', "type object should have the correct name");
			assert.strictEqual(arrayTypeObject.isArrayType(), true, "type should be marked as array type");
			assert.strictEqual(arrayTypeObject.isEnumType(), false, "type should not be marked as enum type");
			assert.strictEqual(arrayTypeObject.getEnumValues(), undefined, "type should not have enum values");

			// validity checks
			assert.strictEqual(arrayTypeObject.isValid([]), true, "empty array should be valid");

			if (valid) {
				var array, i;

				// singleton array
				array = [random(valid)];
				assert.strictEqual(arrayTypeObject.isValid(array), true, "singleton array with a valid components should be valid");

				// 5 valid components
				array = [];
				for (i = 0; i < 5; i++) {
					array[i] = random(valid);
				}
				assert.strictEqual(arrayTypeObject.isValid(array), true, "array with only valid components should be valid");

				if (invalid) {
					// 1 invalid
					array = [random(invalid)];
					assert.strictEqual(arrayTypeObject.isValid(array), false, "singleton array with an invalid component should be invalid" + makeLiteral(array));

					// 4 valid, 1 invalid
					array = [];
					for (i = 0; i < 5; i++) {
						array[i] = random(valid);
					}
					array[random(5)] = random(invalid);
					assert.strictEqual(arrayTypeObject.isValid(array), false, "array with one invalid component should be invalid");

				}
			}
		});

	});

	QUnit.test("multi-dim array types", function (assert) {
		var arrayType = DataType.getType('int[]');
		var twoDimArrayType = DataType.getType('int[][]');
		var multiDimArrayType = DataType.getType('int[][][][][]');

		assert.ok(twoDimArrayType, "a 2-dim int array type can be retrieved");
		assert.equal(twoDimArrayType.getComponentType(), arrayType, "component type should be the 1-dim int array");
		assert.ok(twoDimArrayType.isValid([[1], [2, 3], []]), "2-dim int array should be accepted");

		assert.ok(multiDimArrayType, "a 5-dim int array type can be retrieved");
		assert.ok(multiDimArrayType.isValid([[[[[1], [2, 3], []]]], [[[]]], []]), "5-dim int array should be accepted");

	});



	QUnit.module("Enum Types");

	/**
	 * @deprecated
	 */
	QUnit.test("Retrieve enum via global name (w/o registerEnum)", function (assert) {
		const oColorEnum = {
			Red: "Red",
			Yellow: "Yellow",
			Blue: "Blue"
		};
		ObjectPath.set("sap.test.GlobalColor", oColorEnum);

		const type = DataType.getType("sap.test.GlobalColor");
		assert.ok(type instanceof DataType, "type 'sap.test.GlobalColor' is a DataType");
		assert.equal(type.getName(), 'sap.test.GlobalColor', "type name");
		assert.equal(type.getDefaultValue(), "Red", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oColorEnum, "type should return the original enum object with keys and values");

		Object.entries(oColorEnum).forEach(([name, value]) => {
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		assert.ok(DataType.getType("sap.test.GlobalColor") === type, "multiple calls should return same type object");
	});

	QUnit.test("Register upfront with registerEnum", function (assert) {
		const oColorEnum = {
			Red: "Red",
			Yellow: "Yellow",
			Blue: "Blue"
		};
		DataType.registerEnum("sap.test.RegisteredColor", oColorEnum);

		const type = DataType.getType("sap.test.RegisteredColor");
		assert.ok(type instanceof DataType, "type 'sap.test.RegisteredColor' is a DataType");
		assert.equal(type.getName(), 'sap.test.RegisteredColor', "type name");
		assert.equal(type.getDefaultValue(), "Red", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oColorEnum, "type should return the original enum object with keys and values");

		Object.entries(oColorEnum).forEach(([name, value]) => {
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		assert.ok(DataType.getType("sap.test.RegisteredColor") === type, "multiple calls should return same type object");
	});

	QUnit.test("Auto-registered (top-level) Enum via Lib Proxy", async function (assert) {
		sap.ui.define("sap/test/enumlib/library", [
			"sap/ui/core/Lib"
		], function(Library) {
			const thisLib = Library.init({
				name: "sap.test.enumlib"
				// apiVersion: 1 - legacy scenario
			});
			thisLib.LibColor = {
				Red: "Red",
				Yellow: "Yellow",
				Blue: "Blue"
			};
			return thisLib;
		});

		await Library.load("sap.test.enumlib");
		const oColorEnum = sap.ui.require("sap/test/enumlib/library").LibColor;

		const type = DataType.getType("sap.test.enumlib.LibColor");
		assert.ok(type instanceof DataType, "type 'sap.test.enumlib.LibColor' is a DataType");
		assert.equal(type.getName(), 'sap.test.enumlib.LibColor', "type name");
		assert.equal(type.getDefaultValue(), "Red", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oColorEnum, "type should return the original enum object with keys and values");

		Object.entries(oColorEnum).forEach(([name, value]) => {
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		assert.ok(DataType.getType("sap.test.enumlib.LibColor") === type, "multiple calls should return same type object");
	});

	QUnit.test("Auto-registered (deeply nested) Enum via Lib Proxy", async function (assert) {
		sap.ui.define("sap/test/otherlib/library", [
			"sap/ui/core/Lib"
		], function(Library) {
			const thisLib = Library.init({
				name: "sap.test.otherlib"
				// apiVersion: 1 - legacy scenario
			});
			thisLib.deeply ??= {};
			thisLib.deeply.nested ??= {};
			thisLib.deeply.nested.LibColor = {
				Red: "Red",
				Yellow: "Yellow",
				Blue: "Blue"
			};
			return thisLib;
		});

		await Library.load("sap.test.otherlib");
		const oColorEnum = sap.ui.require("sap/test/otherlib/library").deeply.nested.LibColor;

		const type = DataType.getType("sap.test.otherlib.deeply.nested.LibColor");
		assert.ok(type instanceof DataType, "type 'sap.test.otherlib.deeply.nested.LibColor' is a DataType");
		assert.equal(type.getName(), 'sap.test.otherlib.deeply.nested.LibColor', "type name");
		assert.equal(type.getDefaultValue(), "Red", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oColorEnum, "type should return the original enum object with keys and values");

		Object.entries(oColorEnum).forEach(([name, value]) => {
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		assert.ok(DataType.getType("sap.test.otherlib.deeply.nested.LibColor") === type, "multiple calls should return same type object");
	});



	QUnit.module("Type Lookup");

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("non-existing type", function (assert) {
		var oWarningSpy = this.spy(Log, "warning");
		var oErrorSpy = this.spy(Log, "error");
		Log.setLevel(Log.Level.DEBUG);

		// check precondition
		assert.equal(typeof nonExistingType, "undefined", "[precondition] There should be no global var 'nonExistingType'");

		assert.strictEqual(DataType.getType("nonExistingType"), undefined, "for a non-existing type, undefined is returned");
		assert.ok(oErrorSpy.calledWith(sinon.match(/data type/).and(sinon.match(/could not be found/))), "access to non-existing type should produce an error message in the log");
		assert.ok(!oWarningSpy.called, "no warnings should be produced");

		// eslint-disable-next-line no-undef-init, prefer-const
		let expectedType = undefined;
		/**
		 * @deprecated w/o a global lookup, toString and hasOwnProperty won't be resolved to 'any'
		 */
		expectedType = DataType.getType("any");

		assert.strictEqual(DataType.getType("toString"), expectedType, "'toString' should not resolve to something");
		assert.strictEqual(DataType.getType("hasOwnProperty"), expectedType, "'hasOwnProperty' should not resolve to something");
	});

	/**
	 * @deprecated
	 */
	QUnit.test("invalid type", function (assert) {
		var oWarningSpy = this.spy(Log, "warning");
		var oErrorSpy = this.spy(Log, "error");
		Log.setLevel(Log.Level.DEBUG);

		// check precondition
		var vGlobalProperty = ObjectPath.get("sap.ui.base.Object");
		assert.ok(vGlobalProperty && !isPlainObject(vGlobalProperty), "[precondition] Object with name sap.ui.base.Object exists and is not a plain object");


		assert.strictEqual(DataType.getType("sap.ui.base.Object"), DataType.getType("any"), "access to an invalid type should fallback to type 'any'");
		assert.ok(oWarningSpy.calledWith(sinon.match(/not a valid data type/)), "access to an invalid type should produce a warning message in the log");
		assert.ok(oErrorSpy.called, "deprecation error should be logged");
		assert.ok(oErrorSpy.calledWith(sinon.match(/Defining types via globals is deprecated/)), "deprecation error should be logged");
	});



	QUnit.module("Type Creation");

	QUnit.test("type derived from string", function (assert) {
		var oWarningSpy = this.spy(Log, "warning");
		var oErrorSpy = this.spy(Log, "error");
		Log.setLevel(Log.Level.DEBUG);

		var oType = DataType.createType("myDerivedType", {
			isValid: function (oValue) {
				return /hello.*world/.test(oValue);
			}
		}, DataType.getType("string"));

		assert.ok(oType instanceof DataType, "type must be returned");
		assert.strictEqual(oType.getBaseType(), DataType.getType("string"), "base type must be 'string'");
		assert.equal(oType.isValid('hello world'), true, "validity check for good value should return true");
		assert.equal(oType.isValid('hello mars'), false, "validity check for bad value should return false");
		assert.ok(!oErrorSpy.called, "access to non-existing type should produce an error message in the log");
		assert.ok(!oWarningSpy.called, "no warnings should be produced");
		assert.strictEqual(DataType.getType("myDerivedType"), oType, "lookup must return the same type object");
	});

	QUnit.test("derive without base type", function (assert) {
		var oWarningSpy = this.spy(Log, "warning");
		var oErrorSpy = this.spy(Log, "error");
		Log.setLevel(Log.Level.DEBUG);

		var oType = DataType.createType("myTypeWithoutBase", {
			isValid: function (oValue) {
				return /hello.*world/.test(oValue);
			}
		});

		assert.ok(oType instanceof DataType, "type must be returned");
		assert.strictEqual(oType.getBaseType(), DataType.getType("any"), "base type must be implicitly 'any'");
		assert.equal(oType.isValid('hello world'), true, "validity check for good value should return true");
		assert.equal(oType.isValid('hello mars'), false, "validity check for bad value should return false");
		assert.ok(!oErrorSpy.called, "no errors should be produced");
		assert.ok(!oWarningSpy.called, "no warnings should be produced");
	});

	QUnit.test("logical AND of validity checks", function (assert) {

		var oType = DataType.createType("myStrangeBoolean", {
			isValid: function (oValue) {
				return /tr/.test(oValue);
			}
		}, DataType.getType("boolean"));

		assert.ok(oType instanceof DataType, "type must be returned");
		assert.strictEqual(oType.getBaseType(), DataType.getType("boolean"), "base type must be 'boolean'");
		assert.equal(oType.isValid(true), true, "combined validity check should accept 'true'");
		assert.equal(oType.isValid('nice try'), false, "validity check of base type must be applied");
		assert.equal(oType.isValid('true'), false, "validity check of base type must be applied");
		assert.equal(oType.isValid(false), false, "validity check of derived type must be applied");
	});

	QUnit.test("multiple levels of derivation", function (assert) {

		var oHelloPrefixType = DataType.createType("myHelloPrefixType", {
			isValid: function (oValue) {
				return /^hello/.test(oValue);
			}
		}, DataType.getType("string"));

		/* var oWorldSuffixType = */ DataType.createType("myWorldSuffixType", {
			isValid: function (oValue) {
				return /world$/.test(oValue);
			}
		}, oHelloPrefixType);

		var oType = DataType.getType("myWorldSuffixType");
		assert.ok(oType instanceof DataType, "type must be returned");
		assert.strictEqual(oType.getBaseType(), oHelloPrefixType, "base type must be HelloPrefixType");
		assert.strictEqual(oType.getPrimitiveType().getName(), "string", "primitive type must be 'string'");
		assert.equal(oType.isValid("hello"), false, "prefix alone is not enough");
		assert.equal(oType.isValid('world'), false, "suffix alone is not enough");
		assert.equal(oType.isValid('helloworld'), true, "both together are okay");
		assert.equal(oType.isValid('hello              world'), true, "both together are okay");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("re-defining a type", function (assert) {
		var oWarningSpy = this.spy(Log, "warning");
		var oErrorSpy = this.spy(Log, "error");
		Log.setLevel(Log.Level.DEBUG);

		var oType1 = DataType.createType("myNewType", {
			isValid: function (oValue) {
				return /hello.*world/.test(oValue);
			}
		}, DataType.getType("string"));

		assert.ok(oType1 instanceof DataType, "first creation should succeed");
		assert.ok(!oErrorSpy.called, "first creation must not log an error");
		assert.ok(!oWarningSpy.called, "first creation must not log a warning");

		var oType2 = DataType.createType("myNewType", {
			isValid: function (oValue) {
				return /hello.*world/.test(oValue);
			}
		}, DataType.getType("string"));
		assert.ok(!oErrorSpy.called, "re-defining a type must not log an error");
		assert.ok(oWarningSpy.calledWith(sinon.match(/re-?defined.*unsupported/i)), "re-defining a type must log a warning");
		assert.ok(oType2 instanceof DataType, "recreation must return a type");
		assert.notStrictEqual(oType1, oType2, "new type should differ from previous type with same name");
		assert.strictEqual(DataType.getType("myNewType"), oType2, "lookup returns new type");
	});



	QUnit.module("Specific Types");

	QUnit.test("ID", function (assert) {
		var type = DataType.getType("sap.ui.core.ID");
		assert.ok(!!type, "type 'sap.ui.core.ID' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.ID', "type name");
		assert.equal(type.getDefaultValue(), "", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");

		assert.equal(type.isValid("a"), true, "accepted value a");
		assert.equal(type.isValid("someid"), true, "accepted value someid");
		assert.equal(type.isValid("Z0_-:."), true, "accepted value z0_-:.");
		assert.equal(type.isValid("123"), false, "not accepted 123");
		assert.equal(type.isValid("#$%^"), false, "not accepted #$%^");
		assert.equal(type.isValid("-abc"), false, "not accepted -abc");
		assert.equal(type.isValid("__abc"), true, "accepted __abc");
		assert.equal(type.isValid(""), false, "not accepted empty string");
		assert.equal(type.isValid(" id"), false, "a partial match should not be valid");
		assert.equal(type.isValid("id id"), false, "a partial match should not be valid");
		assert.equal(type.isValid("id "), false, "a partial match should not be valid");
	});

	QUnit.test("AbsoluteCSSSize", function (assert) {
		var type = DataType.getType("sap.ui.core.AbsoluteCSSSize");
		assert.ok(!!type, "type 'sap.ui.core.AbsoluteCSSSize' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.AbsoluteCSSSize', "type name");
		assert.equal(type.getDefaultValue(), "", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");

		assert.equal(type.isValid("0"), true, "accepted value 0");
		assert.equal(type.isValid("10px"), true, "accepted value 10px");
		assert.equal(type.isValid("-22pt"), true, "accepted value -22pt");
		assert.equal(type.isValid("100%"), false, "percentage value must not be accepted");
		assert.equal(type.isValid("auto"), false, "special value 'auto' must not be accepted");
		assert.equal(type.isValid("inherit"), false, "special value 'inherit' must not be accepted");
		assert.equal(type.isValid("1"), false, "value other than 0 without unit must not be accepted");
		assert.equal(type.isValid(42), false, "number value must not be accepted");
		assert.equal(type.isValid({}), false, "object value must not be accepted");
		assert.equal(type.isValid(""), true, "empty string must be valid");
		assert.equal(type.isValid(" 20px"), false, "a partial match must not be valid");
		assert.equal(type.isValid("100% 20px"), false, "a partial match must not be valid");
		assert.equal(type.isValid("100% "), false, "a partial match must not be valid");
		assert.equal(type.isValid("100vh"), false, "viewport dimension must not be accepted");

		assert.equal(type.isValid("calc(100px - 20rem)"), true, "can substract two arguments");
		assert.equal(type.isValid("calc(100% - 20rem)"), false, "can not use percentages in calculations");
		assert.equal(type.isValid("calc(100px - 20%)"), false, "can not use percentages in calculations");
		assert.equal(type.isValid("calc(100rem- 20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100rem -20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100rem-20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100rem + 20rem)"), true, "can add two arguments");
		assert.equal(type.isValid("calc(100rem+ 20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(100rem +20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(100rem+20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(10 * 20rem)"), true, "can multiply two arguments");
		assert.equal(type.isValid("calc(10* 20rem)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(10rem *20)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(10rem*20)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(100rem / 20)"), true, "can divide two arguments");
		assert.equal(type.isValid("calc(100rem/ 20)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(100rem /20)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(100rem/20)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(2 * -20rem / 23)"), true, "arguments dont always need units");
		assert.equal(type.isValid("calc(2 * (-20rem / 23))"), true, "parenthesis can be used for grouping (simple)");
		assert.equal(type.isValid("calc(((2)) * (-20rem / (((14) + 23)))"), true, "parenthesis can be used for grouping (complex, no whitespace)");
		assert.equal(type.isValid("calc( ( ( 2 ) ) * ( -20rem / ( ( ( 14 ) + 23 ) ) )"), true, "parenthesis can be used for grouping (complex, whitespace)");
		assert.equal(type.isValid("calc(     2 ) ) * ( -20rem / ( ( ( 14 ) + 23     )"), true, "unbalanced parenthesis are not detected by the regexp");
		assert.equal(type.isValid("calc(100px)"), true, "a single value is valid");
		assert.equal(type.isValid("calc(10 3rem)"), false, "an operand is mandatory between values");  // this has a valid syntax but isn't a valid expression
		assert.equal(type.isValid("calc(10 + 3rem)"), true, "a valid calc() expression must be valid");  // this has a valid syntax but isn't a valid expression
		assert.equal(type.isValid("calc(100px-"), false, "can't substract undefined");
		assert.equal(type.isValid("calc(* - 100px)"), false, "arguments need to have digits");
	});

	QUnit.test("AbsoluteCSSSize[]", function (assert) {
		var type = DataType.getType("sap.ui.core.AbsoluteCSSSize[]");
		assert.ok(!!type, "type 'sap.ui.core.AbsoluteCSSSize[]' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.AbsoluteCSSSize[]', "type name");
		assert.equal(type.getDefaultValue(), null, "default value");
		assert.equal(type.getBaseType().getName(), "array", "base type is array");
		assert.equal(type.getPrimitiveType().getName(), "array", "primitive type is array");
		assert.equal(type.getComponentType().getName(), "sap.ui.core.AbsoluteCSSSize", "primitive type is AbsoluteCSSSize");

		assert.equal(type.isValid(["0"]), true, "accepted value 0");
		assert.equal(type.isValid(["10px", "20px"]), true, "accepted value 10px,20px");
		assert.equal(type.isValid(["-22pt", "10em", "50px"]), true, "accepted value with percentage: -22pt,10em,50px");
		assert.equal(type.isValid(["-22pt", "10%", "50px"]), false, "not accepted value -22pt,10%,50px");
		assert.equal(type.isValid(["-22pt", "calc(10rem / 2)", "50px"]), true, "calc() expressions are allowed as element values");
		assert.equal(type.isValid(["-22pt", "calc(10% / 2)", "50px"]), false, "calc() expressions are not allowed when they contain percentage values");
		assert.equal(type.isValid("1"), false, "isValid('1')");
		assert.equal(type.isValid([42]), false, "isValid([42])");
	});

	QUnit.test("CSSSize", function (assert) {
		var type = DataType.getType("sap.ui.core.CSSSize");
		assert.ok(!!type, "type 'sap.ui.core.CSSSize' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.CSSSize', "type name");
		assert.equal(type.getDefaultValue(), "", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");

		assert.equal(type.isValid("0"), true, "accepted value 0");
		assert.equal(type.isValid("10px"), true, "accepted value 10px");
		assert.equal(type.isValid("-22pt"), true, "accepted value -22pt");
		assert.equal(type.isValid("1"), false, "value other than 0 without unit must not be accepted");
		assert.equal(type.isValid(42), false, "number value must not be accepted");
		assert.equal(type.isValid({}), false, "object value must not be accepted");
		assert.equal(type.isValid(""), true, "empty string must be valid");
		assert.equal(type.isValid(" 20px"), false, "a partial match must not be valid");
		assert.equal(type.isValid("100% 20px"), false, "a partial match must not be valid");
		assert.equal(type.isValid("100% "), false, "a partial match must not be valid");

		assert.equal(type.isValid("1vh"), true, "viewport height is valid");
		assert.equal(type.isValid("-10vw"), true, "viewport width is valid");
		assert.equal(type.isValid("101vmin"), true, "vmin is valid");
		assert.equal(type.isValid("100vmax"), true, "vmax is valid");

		assert.equal(type.isValid("calc(100% - 20rem)"), true, "can substract two arguments");
		assert.equal(type.isValid("calc(100% - 20vw)"), true, "can substract viewport arguments as well");
		assert.equal(type.isValid("calc(100%- 20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100% -20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100%-20rem)"), false, "whitespace is mandatory around '-' operator");
		assert.equal(type.isValid("calc(100% + 20rem)"), true, "can add two arguments");
		assert.equal(type.isValid("calc(100%+ 20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(100% +20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(100%+20rem)"), false, "whitespace is mandatory around '+' operator");
		assert.equal(type.isValid("calc(10 * 20rem)"), true, "can multiply two arguments");
		assert.equal(type.isValid("calc(10* 20rem)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(100% *2)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(100%*2)"), true, "whitespace is optional around '*' operator");
		assert.equal(type.isValid("calc(100% / 2)"), true, "can divide two arguments");
		assert.equal(type.isValid("calc(100%/ 2)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(100% /2)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(100%/2)"), true, "whitespace is optional around '/' operator");
		assert.equal(type.isValid("calc(2 * -20rem / 23)"), true, "arguments dont always need units");
		assert.equal(type.isValid("calc(2 * (-20rem / 23))"), true, "parenthesis can be used for grouping (simple)");
		assert.equal(type.isValid("calc(((2)) * (-20rem / (((14) + 23)))"), true, "parenthesis can be used for grouping (complex, no whitespace)");
		assert.equal(type.isValid("calc( ( ( 2 ) ) * ( -20rem / ( ( ( 14 ) + 23 ) ) )"), true, "parenthesis can be used for grouping (complex, whitespace)");
		assert.equal(type.isValid("calc(     2 ) ) * ( -20rem / ( ( ( 14 ) + 23     )"), true, "unbalanced parenthesis are not detected by the regexp");
		assert.equal(type.isValid("calc(100%)"), true, "a single value is valid");
		assert.equal(type.isValid("calc(10 3rem)"), false, "an operand is mandatory between values");  // this has a valid syntax but isn't a valid expression
		assert.equal(type.isValid("calc(10 + 3rem)"), true, "a valid calc() expression must be valid");  // this has a valid syntax but isn't a valid expression
		assert.equal(type.isValid("calc(100%-"), false, "can't substract undefined");
		assert.equal(type.isValid("calc(* - 100%)"), false, "arguments need to have digits");
	});

	QUnit.test("CSSSize Case-Insensitive", function (assert) {
		var type = DataType.getType("sap.ui.core.CSSSize");

		assert.equal(type.isValid("10pX"), true, "accepted value 10pX");
		assert.equal(type.isValid("-22Pt"), true, "accepted value -22Pt");
		assert.equal(type.isValid("13CM"), true, "accepted value 13CM");
		assert.equal(type.isValid("1Vh"), true, "1Vh viewport height is valid");
		assert.equal(type.isValid("-10vW"), true, "-10vW viewport width is valid");
		assert.equal(type.isValid("101vMiN"), true, "101vMiN is valid");
		assert.equal(type.isValid("100VmAx"), true, "100VmAx is valid");
	});

	QUnit.test("CSSSize[]", function (assert) {
		var type = DataType.getType("sap.ui.core.CSSSize[]");
		assert.ok(!!type, "type 'sap.ui.core.CSSSize[]' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.CSSSize[]', "type name");
		assert.equal(type.getDefaultValue(), null, "default value");
		assert.equal(type.getBaseType().getName(), "array", "base type is array");
		assert.equal(type.getPrimitiveType().getName(), "array", "primitive type is array");
		assert.equal(type.getComponentType().getName(), "sap.ui.core.CSSSize", "primitive type is CSSSize");

		assert.equal(type.isValid(["0"]), true, "accepted value 0");
		assert.equal(type.isValid(["10px", "20px"]), true, "accepted value 10px,20px");
		assert.equal(type.isValid(["-22pt", "10%", "50px"]), true, "accepted value -22pt,10%,50px");
		assert.equal(type.isValid(["-22pt", "calc(10% / 2)", "50px"]), true, "calc() expressions are allowed as element values");
		assert.equal(type.isValid("1"), false, "isValid('1')");
		assert.equal(type.isValid([42]), false, "isValid([42])");
	});

	QUnit.test("CSSSizeShortHand", function (assert) {
		var type = DataType.getType("sap.ui.core.CSSSizeShortHand");
		assert.ok(!!type, "type 'sap.ui.core.CSSSizeShortHand' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");

		assert.equal(type.isValid("0"), true, "single 0 allowed");
		assert.equal(type.isValid("0px"), true, "0 with unit allowed");
		assert.equal(type.isValid("0 1px 1px 1px"), true, "0 1px 1px 1px allowed");
		assert.equal(type.isValid("1px 0 1px 1px"), true, "1px 0 1px 1px allowed");
		assert.equal(type.isValid("0 0 0 0"), true, "0 0 0 0 allowed");

		assert.equal(type.isValid("1px"), true, "1px allowed");
		assert.equal(type.isValid("1em 1ex"), true, "2 values allowed");
		assert.equal(type.isValid("1% 1in 1cm"), true, "3 values allowed");
		assert.equal(type.isValid("1mm 1pt 1pc 1px"), true, "4 values allowed");
		assert.equal(type.isValid("1px1px"), false, "values without space NOT allowed");

		assert.equal(type.isValid("auto"), true, "'auto' allowed");
		assert.equal(type.isValid("auto 1px -1px 1px"), true, "4 values with 'auto' at begin and -1px allowed");
		assert.equal(type.isValid("-auto 1px -1px 1px"), false, "4 values with '-auto' NOT allowed");
		assert.equal(type.isValid("1px auto 1px 1px"), true, "4 values with 'auto' in the middle");
		assert.equal(type.isValid("1px -1px -auto 1px"), false, "4 values with '-auto' in the midle and -1px NOT allowed");
		assert.equal(type.isValid("auto auto auto auto"), true, "4 times 'auto' allowed");

		assert.equal(type.isValid("inherit"), true, "inherit allowed");
		assert.equal(type.isValid("inherit inherit"), false, "inherit only once allowed");
		assert.equal(type.isValid("1px 1px inherit 1px"), false, "inherit NOT allowed with other valid values");
	});

	QUnit.test("enum sap.ui.core.TextAlign", async function (assert) {
		const oEnum = await new Promise((resolve, reject) => {
			sap.ui.require([
				"sap/ui/core/library"
			], (coreLibrary) => resolve(coreLibrary.TextAlign), reject);
		});

		// precondition
		assert.ok(oEnum && isPlainObject(oEnum), "[precondition] enum object should exist and be a plain object");

		var type = DataType.getType("sap.ui.core.TextAlign");
		assert.ok(!!type, "type 'sap.ui.core.TextAlign' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.TextAlign', "type name");
		assert.equal(type.getDefaultValue(), "Begin", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oEnum, "type should return the original enum object with keys and values");

		Object.keys(oEnum).forEach(function(name) {
			var value = oEnum[name];
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		assert.ok(DataType.getType("sap.ui.core.TextAlign") === type, "multiple calls should return same type object");
	});

	QUnit.test("enum sap.ui.core.Popup.Dock", async function (assert) {
		const oEnum = await new Promise((resolve, reject) => {
			sap.ui.require([
				"sap/ui/core/Popup"
			], (Popup) => resolve(Popup.Dock), reject);
		});

		// precondition
		assert.ok(oEnum && isPlainObject(oEnum), "[precondition] enum object should exist and be a plain object");

		var type = DataType.getType("sap.ui.core.Popup.Dock");
		assert.ok(!!type, "type 'sap.ui.core.Popup.Dock' exists");
		assert.ok(type instanceof DataType, "type is a DataType");
		assert.equal(type.getName(), 'sap.ui.core.Popup.Dock', "type name");
		assert.equal(type.getDefaultValue(), "begin top", "default value");
		assert.equal(type.getBaseType().getName(), "string", "base type is string");
		assert.equal(type.getPrimitiveType().getName(), "string", "primitive type is string");
		assert.ok(type.isEnumType(), "type should be marked as enum");
		assert.strictEqual(type.getEnumValues(), oEnum, "type should return the original enum object with keys and values");

		Object.keys(oEnum).forEach(function(name) {
			var value = oEnum[name];
			assert.equal(type.isValid(value), true, "accepts value " + value);
			assert.equal(type.parseValue(name), value, "'" + name + "' should be parsed as '" + value + "'");
		});
		assert.equal(type.isValid("something"), false, "should not accept 'something'");
		// TODO parsing of illegal values?
		assert.ok(DataType.getType("sap.ui.core.Popup.Dock") === type, "multiple calls should return same type object");
	});

	QUnit.test("type sap.ui.core.Collision", function (assert) {
		var oType = DataType.getType("sap.ui.core.Collision");

		assert.ok(!!oType, "type 'sap.ui.core.Collision' exists");
		assert.ok(oType instanceof DataType, "type is a DataType");
		assert.equal(oType.getBaseType().getName(), "string", "base type is string");
		assert.equal(oType.getPrimitiveType().getName(), "string", "primitive type is string");

		assert.equal(oType.isValid("flip"), true, "single 'flip' is allowed");
		assert.equal(oType.isValid("fit"), true, "single 'fit' is allowed");
		assert.equal(oType.isValid("flipfit"), true, "single 'flipfit' is allowed");
		assert.equal(oType.isValid("none"), true, "single 'none' is allowed");

		assert.equal(oType.isValid("flip flip"), true, "'flip flip' is allowed");
		assert.equal(oType.isValid("flip fit"), true, "'flip fit' is allowed");
		assert.equal(oType.isValid("flip flipfit"), true, "'flip flipfit' is allowed");
		assert.equal(oType.isValid("flip none"), true, "'flip none' is allowed");

		assert.equal(oType.isValid("fit flip"), true, "'fit flip' is allowed");
		assert.equal(oType.isValid("fit fit"), true, "'fit fit' is allowed");
		assert.equal(oType.isValid("fit flipfit"), true, "'fit flipfit' is allowed");
		assert.equal(oType.isValid("fit none"), true, "'fit none' is allowed");

		assert.equal(oType.isValid("flipfit flip"), true, "'flipfit flip' is allowed");
		assert.equal(oType.isValid("flipfit fit"), true, "'flipfit fit' is allowed");
		assert.equal(oType.isValid("flipfit flipfit"), true, "'flipfit flipfit' is allowed");
		assert.equal(oType.isValid("flipfit none"), true, "'flipfit none' is allowed");

		assert.equal(oType.isValid("none flip"), true, "'none flip' is allowed");
		assert.equal(oType.isValid("none fit"), true, "'none fit' is allowed");
		assert.equal(oType.isValid("none flipfit"), true, "'none flipfit' is allowed");
		assert.equal(oType.isValid("none none"), true, "'none none' is allowed");

		assert.equal(oType.isValid("MyCollision"), false, "any string other than provided by sap.ui.core.Popup.CollisionMode is not allowed");
		assert.equal(oType.isValid(42), false, "number value must not be accepted");
		assert.equal(oType.isValid({}), false, "object value must not be accepted");
		assert.equal(oType.isValid(""), false, "empty string must be valid");
	});

	QUnit.module("Normalizer");

	QUnit.test("basics", function (assert) {
		var _uri = DataType.getType("sap.ui.core.URI");
		var _string = DataType.getType("string");

		// preconditon for the test
		assert.ok(!!_uri, "[precondition] type 'URI' should exist");

		assert.ok(!_uri._fnNormalizer, "no normalizer should be set");
		assert.equal(_uri.isValid("http://www.sap.com"), true, "the given url should be valid for the URI type");
		assert.equal(_uri.normalize("http://www.sap.com"), "http://www.sap.com", "the url must not be normalized");
		_uri.setNormalizer(function (sValue) {
			return "/proxy/http/" + sValue.substr(7);
		});
		assert.ok(!!_uri._fnNormalizer, "normalizer should be set");
		assert.equal(_uri.normalize("http://www.sap.com"), "/proxy/http/www.sap.com", "the url should be normalized");
		assert.equal(_string.normalize("test"), "test", "the normalizer must not be applied for other types");
	});

});
