/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/base/BindingInfo",
	"sap/ui/base/BindingParser",
	"sap/ui/base/DataType",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Context",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/type/String",
	"sap/ui/core/Control",
	"sap/ui/core/Component",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Sorter",
	"sap/ui/base/ManagedObjectMetadata",
	"sap/base/strings/escapeRegExp",
	"sap/base/util/isEmptyObject",
	"sap/base/util/ObjectPath",
	"sap/base/future",
	"sap/base/Log"
], function(BindingInfo, BindingParser, DataType, ManagedObject, Element, JSONModel, Context, ManagedObjectModel, StringType, Control, Component, UIComponent, Sorter, ManagedObjectMetadata, escapeRegExp, isEmptyObject, ObjectPath, future, Log) {
	"use strict";
	var mObjects = {};

	var MyEnum = {
		Good: 'Good',
		/* default */
		Better: 'Better',
		Best: 'Best'
	};

	DataType.registerEnum("MyEnum", MyEnum);

	// sample item object, will be used as aggregation content for defaultClass test
	const TestItem = ManagedObject.extend("sap.ui.core.TestItem", {
		metadata: {
			properties: {
				name: { type: "string", defaultValue: "hello" }
			}
		}
	});

	// define new types for testing
	var TestManagedObject = ManagedObject.extend("sap.ui.core.TestManagedObject", {
		metadata : {
			// ---- control specific ----
			library : "sap.ui.core",
			properties : {
				value : {type: "string", group: "Appearance", defaultValue: "", "bindable": true },
				stringValue : {type: "string", group: "Appearance", defaultValue: ""},
				floatValue : {type: "float", group: "Appearance", defaultValue: 0},
				intValue : {type: "int", group: "Appearance", defaultValue: 0},
				booleanValue : {type: "boolean", group: "Appearance", defaultValue: false},
				enumValue : {type: "MyEnum", group: "Appearance", defaultValue: MyEnum.Good},
				stringArray : {type: "string[]", group: "Appearance", defaultValue: []},
				floatArray : {type: "float[]", group: "Appearance", defaultValue: []},
				intArray : {type: "int[]", group: "Appearance", defaultValue: []},
				booleanArray : {type: "boolean[]", group: "Appearance", defaultValue: []},
				objectValue : {type: "object", group: "Misc", defaultValue: null},
				_hiddenValue: { type: "string", defaultValue: "", visibility: "hidden"},
				byValueArray: { type: "object[]", defaultValue: [], byValue: true}
			},
			aggregations : {
				singleAggr : { type : "sap.ui.core.TestManagedObject", altTypes : ["string"], multiple : false },
				singleBindableAggr : { type : "sap.ui.core.TestManagedObject", multiple : false, bindable: "bindable" },
				subObjects : { type : "sap.ui.core.TestManagedObject", multiple : true, singularName : "subObj"},
				elements : { type : "sap.ui.core.Element", multiple : true, bindable: "bindable"},
				skippedPropagation : { type: "sap.ui.core.Element", multiple: false },
				itemsWithDefaultClass: { type: "sap.ui.core.TestItem", defaultClass: TestItem, multiple: true}
			},
			associations : {
				selectedObject : { type : "sap.ui.core.TestManagedObject", multiple : false},
				associatedObjects : { type : "sap.ui.core.TestManagedObject", multiple : true, singularName : "associatedObj"},
				_hiddenObject: { type : "sap.ui.core.TestManagedObject", multiple : false, visibility: "hidden"},
				_hiddenObjects: { type : "sap.ui.core.TestManagedObject", multiple : true, visibility: "hidden"}
			},
			specialSettings: {
				metadataContexts: {
					type: "object",
					defaultValue: "{}",
					myprop:"test"
				}
			},
			events: {
				press: {}
			},
			defaultAggregation : "singleAggr",
			defaultProperty: "value"
		},

		init : function() {
			mObjects[this.getId()] = this;
			this.mSkipPropagation = {
				skippedPropagation: true
			};
		},

		exit : function() {
			delete mObjects[this.getId()];
		},

		// needed for grouping test
		addSubObjGroup : function(oGroup, oControl) {
			if (!oControl) {
				oControl = new TestManagedObject({value: oGroup.key, booleanValue: true});
			}
			this.addSubObj(oControl);
		}
	});

	var sapTestTestManagedObject = ManagedObject.extend("sap.test.TestManagedObject", {
		metadata: {
			// ---- control specific ----
			library: "sap.test",
			aggregations: {
				"multiplePublicItems": {
					type: "sap.ui.core.TestManagedObject",
					multiple: true
				},
				"multipleHiddenItems": {
					type: "sap.ui.core.TestManagedObject",
					multiple: true,
					visibility: "hidden"
				},
				"singlePublicItem": {
					type: "sap.ui.core.TestManagedObject",
					multiple: false
				},
				"singleHiddenItem": {
					type: "sap.ui.core.TestManagedObject",
					multiple: false,
					visibility: "hidden"
				}
			}
		},

		init: function() {
			mObjects[this.getId()] = this;
			this.setAggregation("singleHiddenItem", new TestManagedObject(this.getId() + "-singleHiddenItem"));
			this.addAggregation("multipleHiddenItems", new TestManagedObject(this.getId() + "-multipleHiddenItem1"));
			this.addAggregation("multipleHiddenItems", new TestManagedObject(this.getId() + "-multipleHiddenItem2"));
		},

		exit: function() {
			delete mObjects[this.getId()];
		}

	});


	//derive
	var TestManagedObjectDerived = TestManagedObject.extend("sap.ui.core.TestManagedObjectDerived", {});

	var changed = false;

	function byId(sId) {
		return mObjects[sId];
	}

	function toId(v) {
		if (Array.isArray(v)) {
			return v.map(toId);
		} else {
			return v && v.getId();
		}
	}

	// custom assertions
	QUnit.assert.equalSortedIds = function equalSortedIds(aActual, aExpected, sMsg) {
		var aIdActual = toId(aActual).sort();
		var aIdExpected = toId(aExpected).sort();
		this.deepEqual(aIdActual, aIdExpected, sMsg);
	};

	QUnit.assert.childOf = function childOf(sId, sParentId) {
		var oItem = byId(sId);
		sParentId = sParentId || "testObj";
		this.ok(!!oItem, "Item '" + sId + "' should exist");
		this.equal(oItem.getParent() && oItem.getParent().getId(), sParentId, "Item '" + sId + "' should have correct parent");
	};

	QUnit.assert.notChildOf = function notChildOf(sId, sParentId) {
		var oItem = byId(sId);
		sParentId = sParentId || "testObj";
		this.ok(!!oItem, "Item '" + sId + "' should exist");
		this.notEqual(oItem.getParent() && oItem.getParent().getId(), sParentId, "Item '" + sId + "' should have correct parent");
	};

	QUnit.assert.checkIfParentCleared = function checkIfParentCleared(oObj, sMsg) {
		var oParent = ManagedObject.prototype.getParent.call(oObj);
		this.ok(oParent == null, sMsg || "parent relationship must have been cleared");
	};

	QUnit.assert.checkIfDestroyed = function checkIfDestroyed(oObj) {
		try {
			oObj.setParent(this.obj);
			this.ok(false, "should not be reached");
		} catch (e) {
			this.ok(true, "setting the parent on a destroyed object should raise an exception");
		}
		this.checkIfParentCleared(oObj, "parent relationship for a destroyed object must have been cleared");
	};

	var oModel = new JSONModel({
		value: "testvalue",
		value2: "testvalue2",
		objectValue: {
			model: true
		},
		list: [{
				value: "testvalue1",
				intValue: 1,
				groupValue: "group1"
			},
			{
				value: "testvalue2",
				intValue: 2,
				groupValue: "group2"
			},
			{
				value: "testvalue3",
				intValue: 3,
				groupValue: null
			}
		]
	});

	function fnChange() {
		changed = true;
	}

	QUnit.module("Basic");

	QUnit.test("Object Creation", function(assert) {
		var obj = new TestManagedObject();
		assert.ok(obj, "obj must have been created");
		assert.ok(obj.getId, "obj must have a getter for the ID");
		assert.ok(obj.getId(), "obj must have a (generated) ID");
		assert.ok(obj.getId().length > 0, "generated ID must not be empty");

		var obj2 = new TestManagedObject();
		assert.ok(obj.getId() != obj2.getId(), "second generated ID must be different from the first one");
	});

	QUnit.test("Object Creation (ID given)", function(assert) {
		var obj = new TestManagedObject("myObject");
		assert.equal(obj.getId(), "myObject", "ID must be 'myObject'");
	});

	QUnit.test("getOwnModels", function(assert) {
		var parentObj = new TestManagedObject({
			models: { "testModelParent1": new JSONModel() }
		});

		var obj = new TestManagedObject({
			models: { "testModel1": new JSONModel() }
		});

		var obj1 = new TestManagedObject();

		parentObj.setSingleAggr(obj);
		obj.setModel(new JSONModel());
		obj.setModel(new JSONModel(), "testModel2");

		assert.ok(obj.getOwnModels(), "Map should be returned.");
		assert.ok(obj.getOwnModels().hasOwnProperty("undefined"), "Model 'undefined' should be available.");
		assert.ok(obj.getOwnModels().undefined.isA("sap.ui.model.json.JSONModel"), "Correct model instance should be available.");

		assert.ok(obj.getOwnModels().hasOwnProperty("testModel1"), "Model 'testModel1' should be available.");
		assert.ok(obj.getOwnModels().testModel1.isA("sap.ui.model.json.JSONModel"), "Correct model instance should be available.");

		assert.notOk(obj.getOwnModels().hasOwnProperty("testModelParent1"), "No propagated models should be returned.");

		assert.ok(obj.getOwnModels().hasOwnProperty("testModel2"), "Model 'testModel2' should be available.");
		assert.ok(obj.getOwnModels().testModel2.isA("sap.ui.model.json.JSONModel"), "Correct model instance should be available.");

		assert.deepEqual(obj1.getOwnModels(), {}, "No models are defined. Empty object is returned.");
	});

	QUnit.test("[legacy] ManagedObject.bindingParser is available/correctly set", function(assert) {
		// Before fixing this call would produce an error ("undefined is not a function")
		var sEscaped = BindingInfo.escape("{model>myPath}");
		assert.strictEqual('\\{model>myPath\\}', sEscaped, "Binding string correctly escaped");

		// asserts
		assert.strictEqual(ManagedObject.bindingParser, BindingParser.complexParser, "Default complex binding parser is correctly set");
		assert.strictEqual(ManagedObject.bindingParser, BindingInfo.parse, "ManagedObject.bindingParser function is in line with the BindingInfo.parse function");

		ManagedObject.bindingParser = BindingParser.simpleParser;

		assert.strictEqual(ManagedObject.bindingParser, BindingParser.simpleParser, "Default complex binding parser is correctly set");
		assert.strictEqual(ManagedObject.bindingParser, BindingInfo.parse, "ManagedObject.bindingParser function is in line with the BindingInfo.parse function");

		ManagedObject.bindingParser = BindingParser.complexParser;
	});

	QUnit.module("Property Metadata", {
		beforeEach: function() {
			this.clazz = ManagedObject.extend("sap.test.MetadataTestClass", {
				metadata: {
					library: "sap.test",
					properties: {
						propWithoutOwnDefault: {
							type: "string",
							defaultValue: null
						},
						propWithOwnDefault: {
							type: "string",
							defaultValue: "42"
						},
						propWithSameDefaultAsType: {
							type: "string",
							defaultValue: ""
						},
						propWithUndefinedDefault: {
							type: "string",
							defaultValue: undefined
						},
						propWithNoDefault: {
							type: "string"
						},
						enumValue: {
							type: "MyEnum",
							defaultValue: null
						}
					}
				}
			});
			this.metadata = this.clazz.getMetadata();
		}
	});

	QUnit.test("Property default values", function(assert) {
		var obj = new (this.clazz)();

		// initial default values  (from default property bag)
		assert.strictEqual(obj.getPropWithoutOwnDefault(), '', "a property without own default value should inherit the default value of the type");
		assert.strictEqual(obj.getPropWithOwnDefault(), '42', "a property with own default value should have that default value");
		assert.strictEqual(obj.getPropWithSameDefaultAsType(), '', "a property with own default value should have that default value");
		assert.strictEqual(obj.getPropWithUndefinedDefault(), undefined, "a property with a default value 'undefined' should have that default value");
		assert.strictEqual(obj.getPropWithNoDefault(), undefined, "a property with no default value should have 'undefined' as default value");
		assert.strictEqual(obj.getEnumValue(), MyEnum.Good, "a property with enum type and no own default value should inherit a default from the enum");

		// set 'other' values and restore default
		obj.setPropWithoutOwnDefault('other').setPropWithoutOwnDefault();
		obj.setPropWithOwnDefault('other').setPropWithOwnDefault();
		obj.setPropWithSameDefaultAsType('other').setPropWithSameDefaultAsType();
		obj.setPropWithUndefinedDefault('other').setPropWithUndefinedDefault();
		obj.setPropWithNoDefault('other').setPropWithNoDefault();
		obj.setEnumValue('Better').setEnumValue();

		// restored default values
		assert.strictEqual(obj.getPropWithoutOwnDefault(), '', "a property without own default value should inherit the default value of the type");
		assert.strictEqual(obj.getPropWithOwnDefault(), '42', "a property with own default value should have that default value");
		assert.strictEqual(obj.getPropWithSameDefaultAsType(), '', "a property with own default value should have that default value");
		assert.strictEqual(obj.getPropWithUndefinedDefault(), undefined, "a property with a default value 'undefined' should have that default value");
		assert.strictEqual(obj.getPropWithNoDefault(), undefined, "a property with no default value should have 'undefined' as default value");
		assert.strictEqual(obj.getEnumValue(), MyEnum.Good, "a property with enum type and no own default value should inherit a default from the enum");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Property default values with invalid types", function(assert) {
		const MyClazz = ManagedObject.extend("sap.test.InvalidMetadataTestClass", {
			metadata: {
				library: "sap.test",
				properties: {
					noType: {
						type: "noType",
						defaultValue: 42
					},
					noTypeNoDefault: {
						type: "noType",
						defaultValue: null
					}
				}
			}
		});

		const obj = new MyClazz();

		// initial default values  (from default property bag)
		assert.strictEqual(obj.getNoType(), 42, "a property with invalid type should keep a configured default value");
		assert.strictEqual(obj.getNoTypeNoDefault(), null, "a property with invalid type and without default should default to null");

		// set 'other' values and restore default
		obj.setNoType('other').setNoType();
		obj.setNoTypeNoDefault('other').setNoTypeNoDefault();

		// restored default values
		assert.strictEqual(obj.getNoType(), 42, "a property with invalid type should keep a configured default value");
		assert.strictEqual(obj.getNoTypeNoDefault(), null, "a property with invalid type and without default should default to null");
	});

	QUnit.test("Default value of dynamically created property", function(assert) {
		var obj = new (this.clazz)();

		this.metadata.addProperty("dynamicProperty", {type: "boolean", defaultValue: true});
		assert.strictEqual(obj.getProperty("dynamicProperty"), true, "The default value should be returned");

		obj.setProperty("dynamicProperty", false);
		assert.strictEqual(obj.getProperty("dynamicProperty"), false, "The value given in the setter should be returned");

		obj.destroy();
	});


	QUnit.module("Properties", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.obj.setModel(oModel);
		}, afterEach: function() {
			this.obj.destroy();
		}
	});

	QUnit.test("Accessor / Mutator functions", function(assert) {
		assert.equal(typeof this.obj.getValue, "function", "there should be a named 'get' function for a public property");
		assert.equal(typeof this.obj.setValue, "function", "there should be a named 'set' function for a public property");
	});

	QUnit.test("Set properties with different types", function(assert) {
		var that = this;
		var oDate = new Date();
		var SAME = {}; // special unique value
		var ERROR = new Error(); // special unique value

		function setAndTest(name, value, expected) {
			if (expected === ERROR) {
				assert['throws'](function() {
					that.obj.setProperty(name, value);
				}, function(err) {
					return err.message && err.message.indexOf(name) >= 0 && err.message.indexOf(that.obj.getMetadata().getName()) >= 0;
				}, "setting '" + name + "' to <" + value + "> should throw an error that mentiones property and class name");
			} else {
				var actual = that.obj.setProperty(name, value).getProperty(name);
				expected = expected === SAME ? value : expected;
				if (Array.isArray(actual)) {
					assert.notStrictEqual(actual, expected, "setting a value must not return the same array");
					assert.deepEqual(actual, expected, "setting '" + name + "' to <" + value + "> should return <" + expected + ">");
				} else {
					assert.strictEqual(actual, expected, "setting '" + name + "' to <" + value + "> should return <" + expected + ">");
				}
			}
		}

		setAndTest("stringValue", "test", SAME);
		setAndTest("stringValue", 23, "" + 23);
		setAndTest("stringValue", 23.45, "" + 23.45);
		setAndTest("stringValue", true, "" + true);
		setAndTest("stringValue", oDate, "" + oDate);
		// eslint-disable-next-line no-new-wrappers
		setAndTest("stringValue", new String("0815"), "0815");
		setAndTest("stringValue", null, '');
		setAndTest("stringValue", undefined, '');
		// no ERROR scenario for string types

		setAndTest("intValue", 23, SAME);
		setAndTest("intValue", null, 0);
		setAndTest("intValue", undefined, 0);
		setAndTest("intValue", "23", ERROR);
		setAndTest("intValue", 23.45, ERROR);
		setAndTest("intValue", true, ERROR);

		setAndTest("floatValue", 23.45, SAME);
		setAndTest("floatValue", 23, SAME);
		setAndTest("floatValue", null, 0.0);
		setAndTest("floatValue", undefined, 0.0);
		setAndTest("floatValue", "23", ERROR);
		setAndTest("floatValue", true, ERROR);

		setAndTest("booleanValue", false, SAME);
		setAndTest("booleanValue", true, SAME);
		setAndTest("booleanValue", null, false);
		setAndTest("booleanValue", undefined, false);
		setAndTest("booleanValue", 23.45, ERROR);
		setAndTest("booleanValue", 23, ERROR);
		setAndTest("booleanValue", "true", ERROR);

		setAndTest("objectValue", {
			a: 1,
			b: 'test',
			c: true
		}, SAME);
		setAndTest("objectValue", function() {}, SAME); // function is allowed
		setAndTest("objectValue", null, null);
		setAndTest("objectValue", undefined, null);
		setAndTest("objectValue", 23.45, ERROR);
		setAndTest("objectValue", 23, ERROR);
		setAndTest("objectValue", true, ERROR);
		setAndTest("objectValue", "true", ERROR);

		setAndTest("enumValue", MyEnum.Better, SAME);
		setAndTest("enumValue", 'Better', SAME);
		setAndTest("enumValue", null, MyEnum.Good);
		setAndTest("enumValue", undefined, MyEnum.Good);
		setAndTest("enumValue", 23.45, ERROR);
		setAndTest("enumValue", 23, ERROR);
		setAndTest("enumValue", "true", ERROR);

		setAndTest("stringArray", ["a", "b", "c"], SAME);
		setAndTest("stringArray", [], SAME);
		setAndTest("stringArray", ["a", 10, true], ["a", "10", "true"]);
		setAndTest("stringArray", "test", ["test"]);
		setAndTest("stringArray", null, []);
		setAndTest("stringArray", undefined, []);
		setAndTest("stringArray", 23, ERROR);
		setAndTest("stringArray", 23.45, ERROR);
		setAndTest("stringArray", true, ERROR);

		setAndTest("intArray", [1, 2, 3], SAME);
		setAndTest("intArray", [], SAME);
		setAndTest("intArray", null, []);
		setAndTest("intArray", undefined, []);
		setAndTest("intArray", [1, 2, 3.5], ERROR);
		setAndTest("intArray", ["a", 10, true], ERROR);
		setAndTest("intArray", "test", ERROR);
		setAndTest("intArray", 23, ERROR);
		setAndTest("intArray", 23.45, ERROR);
		setAndTest("intArray", true, ERROR);

		setAndTest("floatArray", [1.3, 2.5, 3.123], SAME);
		setAndTest("floatArray", [1, 2, 3.5], SAME);
		setAndTest("floatArray", [], SAME);
		setAndTest("floatArray", null, []);
		setAndTest("floatArray", undefined, []);
		setAndTest("floatArray", ["a", 10, true], ERROR);
		setAndTest("floatArray", "test", ERROR);
		setAndTest("floatArray", 23, ERROR);
		setAndTest("floatArray", 23.45, ERROR);
		setAndTest("floatArray", true, ERROR);

		setAndTest("booleanArray", [true, false, true], SAME);
		setAndTest("booleanArray", [], SAME);
		setAndTest("booleanArray", [true, false, 0], ERROR);
		setAndTest("booleanArray", null, []);
		setAndTest("booleanArray", undefined, []);
		setAndTest("booleanArray", ["a", 10, true], ERROR);
		setAndTest("booleanArray", "test", ERROR);
		setAndTest("booleanArray", 23, ERROR);
		setAndTest("booleanArray", 23.45, ERROR);
		setAndTest("booleanArray", true, ERROR);

		//hidden properties
		setAndTest("_hiddenValue", "test", SAME);
		setAndTest("_hiddenValue", 23, "" + 23);
		setAndTest("_hiddenValue", 23.45, "" + 23.45);
		setAndTest("_hiddenValue", true, "" + true);
		setAndTest("_hiddenValue", oDate, "" + oDate);
		// eslint-disable-next-line no-new-wrappers
		setAndTest("_hiddenValue", new String("0815"), "0815");
		setAndTest("_hiddenValue", null, '');
		setAndTest("_hiddenValue", undefined, '');

		setAndTest("unknown", "testtest", ERROR);
	});

	QUnit.test("By Value properties are deeply cloned", function(assert) {
		var aTestArray = [ {
				hugo: "is a",
				real: "deep",
				"array": ['as', "you"]
			}, {
				can: "see",
				so: {
					deep: [42],
					could: "ever be"
				}
			}];

		this.obj.setByValueArray(aTestArray);
		var aProperty = this.obj.getByValueArray();
		assert.equal(aTestArray.length, 2, "The test data has length 2");
		assert.equal(aProperty.length, 2, "The property value has also length 2");

		//length change from outside
		aTestArray[2] = { enhance: "me"};
		aProperty = this.obj.getByValueArray();
		assert.equal(aTestArray.length, 3, "Now the test data has length 3");
		assert.equal(aProperty.length, 2, "While the property value has still length 2");

		//change of an inner property
		assert.deepEqual(aProperty, this.obj.getByValueArray(), "The array values are equal before an inner change");
		aProperty[0].hugo = "is not a";
		var aValue = this.obj.getByValueArray();
		assert.notDeepEqual(aProperty, aValue, "Now they are now longer equal");
		assert.equal(aValue[0].hugo, "is a", "The inner property value has not changed");
	});

	QUnit.test("Escape property before setting", function(assert) {
		// cannot test actual escaping because it does not change the value when bindingSyntax is not set to "complex"
		sinon.spy(ManagedObject.bindingParser, "escape");

		// string
		ManagedObject.escapeSettingsValue("x");
		assert.equal(ManagedObject.bindingParser.escape.callCount, 1, "strings should be escaped by escapeSettingsValue");

		ManagedObject.escapeSettingsValue(41);
		assert.equal(ManagedObject.bindingParser.escape.callCount, 1, "non-strings should not be escaped by escapeSettingsValue");
	});

	QUnit.test("Bind / Unbind functions", function(assert) {
		assert.equal(typeof this.obj.bindValue, "function", "Named bind function for bindable property available");
		assert.equal(typeof this.obj.unbindValue, "function", "Named unbind function for bindable property available");
		assert.equal(typeof this.obj.bindStringValue, "undefined", "No named bind function for non-bindable property available");
		assert.equal(typeof this.obj.unbindStringValue, "undefined", "No named unbind function for non-bindable property available");
	});

	QUnit.test("Bind property", function(assert) {
		this.obj.bindProperty("value", "/value");
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
	});

	QUnit.test("Bind property OneTime", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "OneTime"
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "testvalue", "New model value must not be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "newvalue", "Control property change must not update model");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property OneWay", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "OneWay"
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "newvalue", "Control property change must not update model");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property OneWay - isPropertyBeingUpdated", function(assert) {
		assert.strictEqual(this.obj.isPropertyBeingUpdated("value"), false, "'isPropertyBeingUpdated' returns false before the property is bound");
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "OneWay"
		});

		assert.strictEqual(this.obj.isPropertyBeingUpdated("value"), false, "'isPropertyBeingUpdated' returns false when there's no change for the bound property");

		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");

		this.stub(this.obj, "setProperty").callsFake(() => {
			assert.strictEqual(this.obj.isPropertyBeingUpdated("value"), true, "'isPropertyBeingUpdated' returns true during the property value update");
		});

		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.setProperty.callCount, 1, "Setter is called");
		// restore
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property TwoWay", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "TwoWay"
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "othervalue", "Control property change must update model");
		assert.equal(this.obj.getProperty("value"), "othervalue", "New property value must be kept");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property TwoWay with formatter", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "TwoWay",
			formatter: function(sValue) {
				return sValue;
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "newvalue", "Control property change must not update model");
		assert.equal(this.obj.getProperty("value"), "othervalue", "New property value must be kept");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property TwoWay with type", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "TwoWay",
			type: new StringType()
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "othervalue", "Control property change must update model");
		assert.equal(this.obj.getProperty("value"), "othervalue", "New property value must be kept");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property TwoWay with type as string", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			mode: "TwoWay",
			type: "sap.ui.model.type.String"
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "othervalue", "Control property change must update model");
		assert.equal(this.obj.getProperty("value"), "othervalue", "New property value must be kept");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property TwoWay with unkown type as string", function(assert) {
		assert.throws(function() {
			this.obj.bindProperty("value", {
				path: "/value",
				mode: "TwoWay",
				type: "sap.unknown.Type"
			});
		}, "Raises unknown type error");
	});

	QUnit.test("Bind property TwoWay with formatter & parts", function(assert) {
		this.obj.bindProperty("value", {
			parts: [{
				path: "/value"
			}],
			mode: "TwoWay",
			formatter: function(sValue) {
				return sValue;
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue", "New model value must be reflected");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "newvalue", "Control property change must not update model");
		assert.equal(this.obj.getProperty("value"), "othervalue", "New property value must be kept");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property Composite with mixed binding modes", function(assert) {
		this.obj.bindProperty("value", {
			parts: [{
					path: "/value",
					mode: "OneWay"
				},
				{
					path: "/value",
					mode: "OneTime"
				}
			],
			formatter: function(value1, value2) {
				return value1 + "/" + value2;
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue/testvalue", "Property must return model value");
		oModel.setProperty("/value", "newvalue");
		assert.equal(this.obj.getProperty("value"), "newvalue/testvalue", "New model value must be reflected in oneway part only");
		this.obj.setProperty("value", "othervalue");
		assert.equal(oModel.getProperty("/value"), "newvalue", "Control property change must not update model");
		oModel.setProperty("/value", "testvalue");
	});

	QUnit.test("Bind property Composite: set different binding contexts for different models",
			function(assert) {
		var oBindingMock,
			oContext = new Context(oModel, "/"),
			oModel2 = new JSONModel({model2value : "foo"}),
			oContext2 = new Context(oModel2, "/");

		this.obj.setModel(oModel2, "model2")
				.bindProperty("value", {parts : [
					{path : "value"},
					{path : "model2>model2value"},
					{value : "static"}
				]});

		oBindingMock = this.mock(this.obj.getBindingInfo("value").binding);
		oBindingMock.expects("setContext")
			.withExactArgs(sinon.match.same(oContext),
				sinon.match.object.and(sinon.match.has("fnIsBindingRelevant", sinon.match.func)))
			.callsFake(function (oContext0, mParameters) {
				assert.strictEqual(mParameters.fnIsBindingRelevant(0), true);
				assert.strictEqual(mParameters.fnIsBindingRelevant(1), false);
				assert.strictEqual(mParameters.fnIsBindingRelevant(2), false);
			});

		// code under test
		this.obj.setBindingContext(oContext);

		oBindingMock.expects("setContext")
			.withExactArgs(sinon.match.same(oContext2),
				sinon.match.object.and(sinon.match.has("fnIsBindingRelevant", sinon.match.func)))
			.callsFake(function (oContext0, mParameters) {
				assert.strictEqual(mParameters.fnIsBindingRelevant(0), false);
				assert.strictEqual(mParameters.fnIsBindingRelevant(1), true);
				assert.strictEqual(mParameters.fnIsBindingRelevant(2), false);
			});

		// code under test
		this.obj.setBindingContext(oContext2, "model2");
	});

	QUnit.test("Bind property in settings", function(assert) {
		var obj = new TestManagedObject({
			value: "{/value}",
			objectValue: {
				path: "/objectValue"
			},
			models: oModel
		});
		assert.equal(obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(obj.getProperty("value"), "testvalue", "Property must return model value");
		assert.equal(obj.isBound("objectValue"), true, "isBound must return true for bound properties");
		assert.equal(obj.getProperty("objectValue").model, true, "Object must contain model property");
		obj.destroy();
		obj = new TestManagedObject({
			objectValue: {
				ui5object: true,
				local: true,
				path: "/objectValue"
			},
			models: oModel
		});
		assert.equal(obj.isBound("objectValue"), false, "isBound does return false if object contains ui5object");
		assert.equal(obj.getProperty("objectValue").local, true, "Object must contain local property");
		assert.equal(obj.getProperty("objectValue").ui5object, undefined, "Object must not contain ui5object anymore");
		obj.destroy();
	});

	QUnit.test("Bind property/pass event handler", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			events: {
				change: fnChange
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue", "Property must return model value");
		assert.equal(changed, true, "handler attached/change event fired");
		changed = false;
	});

	QUnit.test("Bind property with CompositeBinding/pass event handler", function(assert) {
		assert.expect(4);
		this.obj.bindProperty("value", {
			parts: [
				{
					path: "/value",
					events: {
						change: () => {assert.ok(true, "Part handler attached/change event fired");}
					}
				},
				{
					path: "/value"
				}
			],
			events: {
				change: fnChange
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue testvalue", "Property must return model value");
		assert.equal(changed, true, "handler attached/change event fired");
		changed = false;
	});

	QUnit.test("Unbind property", function(assert) {
		this.obj.bindProperty("value", "/value");
		this.obj.unbindProperty("value");
		assert.equal(this.obj.isBound("value"), false, "isBound must return false for unbound properties");
		assert.equal(this.obj.getProperty("value"), "", "Property value must be reset to default");
	});

	QUnit.test("Unbind property composite binding", function(assert) {
		var oPartBinding;
		this.obj.bindProperty("value", {
			parts: [
				{
					path: "/value",
					events: {
						change: () => {assert.ok(true, "Part handler attached/change event fired");}
					}
				},
				{
					path: "/value"
				}
			],
			events: {
				change: fnChange
			}
		});
		assert.equal(this.obj.isBound("value"), true, "isBound must return true for bound properties");
		assert.equal(this.obj.getProperty("value"), "testvalue testvalue", "Property must return model value");
		assert.equal(changed, true, "handler attached/change event fired");
		changed = false;
		oPartBinding = this.obj.getBinding("value").getBindings()[0];
		var oPartSpy = sinon.spy(oPartBinding, "destroy");
		assert.ok(oPartBinding.hasListeners("change"), "PartBinding has listeners attached");
		this.obj.unbindProperty("value");
		assert.equal(this.obj.isBound("value"), false, "isBound must return false for unbound properties");
		assert.equal(this.obj.getProperty("value"), "", "Property value must be reset to default");
		assert.ok(oPartSpy.calledOnce, "Destructor of part binding has been called");
		assert.notOk(oPartBinding.hasListeners("change"), "PartBinding has listeners detached");
	});

	QUnit.test("Bind unknown property", function(assert) {
		var bThrown = false;
		try {
			this.obj.bindProperty("unknown", "/testpath");
		} catch (e) {
			bThrown = true;
		}
		assert.ok(bThrown, "Must throw error on unknown property bind");
	});

	QUnit.test("Bind property: targetType", function(assert) {
		this.obj.bindProperty("value", {
			path: "/value",
			targetType: "any"
		});
		assert.equal(this.obj.getBinding("value").sInternalType, "any", "targetType is used");
		assert.notOk("targetType" in this.obj.getBindingInfo("value"), "targetType is moved into part");
	});

	QUnit.test("Bind property: targetType for composite", function(assert) {
		this.obj.bindProperty("value", {
			parts: [{
				path: "/value",
				targetType: "foo"
			}, {
				path: "/value",
				targetType: "bar"
			}],
			targetType: "any"
		});
		assert.equal(this.obj.getBinding("value").getBindings()[0].sInternalType, "foo");
		assert.equal(this.obj.getBinding("value").getBindings()[1].sInternalType, "bar");
		assert.equal(this.obj.getBinding("value").sInternalType, "any", "targetType is used");
	});


	QUnit.test("Binding creation: model set during object creation", function(assert) {
		var oModel = new JSONModel({test:"test"});

		var oMyObject = new TestManagedObject({
			value: {
				parts: [
					{
						path: "a>/test"
					},
					{
						value: "value"
					}
				]
			},
			models: {
				"a": oModel
			}
		});

		assert.ok(oMyObject.getBinding("value"), "CompositeBinding created");
		assert.equal(oMyObject.getValue(), "test value", "value set properly");
	});

	QUnit.test("Binding creation: model set after object creation", function(assert) {
		var oModel = new JSONModel({test:"test"});

		var oMyObject = new TestManagedObject({
			value: {
				parts: [
					{
						path: "a>/test"
					},
					{
						value: "value"
					}
				]
			}
		});

		oMyObject.setModel(oModel, "a");

		assert.ok(oMyObject.getBinding("value"), "CompositeBinding created");
		assert.equal(oMyObject.getValue(), "test value", "value set properly");
	});

	QUnit.module("Aggregations", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.subObj = new TestManagedObject();
			this.subObj2 = new TestManagedObject();
			this.subObj3 = new TestManagedObject();
			this.template = new TestManagedObject({
				value: "{value}"
			});
			this.obj.setModel(oModel);
		}
	});

	QUnit.test("Accessor / Mutator functions single aggregation", function(assert) {
		assert.ok(typeof this.obj.getSingleAggr, "function", "there should be a named get function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.setSingleAggr, "function", "there should be a named set function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.destroySingleAggr, "function", "there should be a named destroy function for a public 0..1 aggregation");
		// no 0..n methods
		assert.ok(typeof this.obj.addSingleAggr, "undefined", "there must be no named add function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.insertSingleAggr, "undefined", "there must be no named insert function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.removeSingleAggr, "undefined", "there must be no named remove function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.removeAllSingleAggr, "undefined", "there must be no named removeAll function for a public 0..1 aggregation");
		assert.ok(typeof this.obj.indexOfSingleAggr, "undefined", "there must be no named indexOf function for a public 0..1 aggregation");
	});

	QUnit.test("Set, get, unset and destroy single aggregation", function(assert) {

		// get
		assert.equal(this.obj.getAggregation("singleAggr"), undefined, "getter should return null/undefined for an empty aggregation");

		// set
		this.obj.setAggregation("singleAggr", this.subObj);
		assert.childOf(this.subObj.getId(), this.obj.getId());

		// get
		assert.equal(this.obj.getAggregation("singleAggr"), this.subObj, "getter should return the previously set object");

		// unset
		this.obj.setAggregation("singleAggr", null);
		assert.equal(this.obj.getAggregation("singleAggr"), undefined, "getter should return null/undefined after setting the aggregation to null");
		assert.notChildOf(this.subObj.getId(), this.obj.getId());
		assert.checkIfParentCleared(this.subObj);

		// destroy
		this.obj.setAggregation("singleAggr", this.subObj);
		this.obj.destroyAggregation("singleAggr");
		assert.equal(this.obj.getAggregation("singleAggr"), undefined, "Getter must not return an object");
		assert.checkIfDestroyed(this.subObj);
	});

	QUnit.test("invalidation of single aggregation", function(assert) {

		sinon.spy(this.obj, "invalidate");

		// set
		this.obj.setSingleAggr(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "set calls invalidate only called once");
		this.obj.invalidate.resetHistory();

		// set to null
		this.obj.setSingleAggr(null);
		assert.equal(this.obj.invalidate.callCount, 1, "set to null calls invalidate only once");
		this.obj.invalidate.resetHistory();

		// set another object
		this.obj.setSingleAggr(this.subObj2);
		this.obj.invalidate.resetHistory();
		this.obj.setSingleAggr(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "setting another object calls invalidate only once");
		this.obj.invalidate.resetHistory();

		// setting an object a second time
		this.obj.setSingleAggr(this.subObj);
		this.obj.invalidate.resetHistory();
		this.obj.setSingleAggr(this.subObj);
		// for a 0..n aggr, the "no-change" situation is easier to detect
		assert.equal(this.obj.invalidate.callCount, 0, "move within aggregation doesn't call invalidate");
		this.obj.invalidate.resetHistory();

		// moving a child elsewhere
		new TestManagedObject().addSubObj(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "moving child elsehwere calls invalidate only once");
		this.obj.invalidate.resetHistory();

		this.obj.invalidate.restore();
	});

	QUnit.test("Detect cycle when updating a single aggregation", function(assert) {

		// get
		this.obj.setAggregation("singleAggr", this.subObj);
		assert.throws(function() {
			this.subObj.setAggregation("singleAggr", this.obj);
		}, /cycle/i);
	});

	QUnit.test("Accessor / Mutator functions multiple aggregation", function(assert) {
		assert.equal(typeof this.obj.getSubObjects, "function", "there should be a named get function for a public 0..n aggregation");
		assert.equal(typeof this.obj.addSubObj, "function", "there should be a named add function for a public 0..n aggregation");
		assert.equal(typeof this.obj.removeSubObj, "function", "there should be a named remove function for a public 0..n aggregation");
		assert.equal(typeof this.obj.removeAllSubObjects, "function", "there should be a named removeAll function for a public 0..n aggregation");
		assert.equal(typeof this.obj.destroySubObjects, "function", "there should be a named destroy function for a public 0..n aggregation");
		assert.equal(typeof this.obj.indexOfSubObj, "function", "there should be a named indexOf function for a public 0..n aggregation");
		assert.equal(typeof this.obj.insertSubObj, "function", "there should be a named insert function for a public 0..n aggregation");
		// no 0..1 methods
		assert.equal(typeof this.obj.setSubObj, "undefined", "there must be no named set function for a public 0..n aggregation");
	});

	QUnit.test("Add, Get, Remove and Destroy multiple aggregation", function(assert) {
		var fnInvalidationSpy = sinon.spy(this.obj, "invalidate");

		this.obj.addAggregation("subObjects", this.subObj);
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj], "Getter must return objects array");
		assert.childOf(this.subObj.getId(), this.obj.getId());

		this.obj.removeAggregation("subObjects", this.subObj);
		assert.deepEqual(this.obj.getAggregation("subObjects"), [], "Getter must return empty array");

		this.obj.addAggregation("subObjects", this.subObj);
		this.obj.addAggregation("subObjects", this.subObj2);
		this.obj.addAggregation("subObjects", this.subObj3);
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj2, this.subObj3], "getter must return objects array");
		assert.childOf(this.subObj.getId(), this.obj.getId());
		assert.childOf(this.subObj2.getId(), this.obj.getId());
		this.obj.removeAggregation("subObjects", this.subObj2);
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj3], "Getter must return array with remaining objects");
		assert.checkIfParentCleared(this.subObj2);
		this.obj.removeAllAggregation("subObjects");
		assert.deepEqual(this.obj.getAggregation("subObjects", []), [], "Getter must return empty array");
		fnInvalidationSpy.resetHistory();
		this.obj.removeAllAggregation("subObjects");
		assert.ok(fnInvalidationSpy.notCalled, "there is no invalidation if there is no aggregation");
		assert.checkIfParentCleared(this.subObj);
		assert.checkIfParentCleared(this.subObj3);

		this.obj.addAggregation("subObjects", this.subObj);
		this.obj.addAggregation("subObjects", this.subObj2);
		this.obj.addAggregation("subObjects", this.subObj3);
		this.obj.destroyAggregation("subObjects");
		fnInvalidationSpy.resetHistory();
		this.obj.destroyAggregation("subObjects");
		assert.ok(fnInvalidationSpy.notCalled, "there is no invalidation if there is no aggregation");
		assert.checkIfDestroyed(this.subObj);
		assert.checkIfDestroyed(this.subObj2);
		assert.checkIfDestroyed(this.subObj3);
	});

	QUnit.test("invalidation of multiple aggregation", function(assert) {

		sinon.spy(this.obj, "invalidate");

		// add
		this.obj.addSubObj(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "add calls invalidate only called once");
		this.obj.invalidate.resetHistory();

		// insert
		this.obj.insertSubObj(this.subObj2, 0);
		assert.equal(this.obj.invalidate.callCount, 1, "insert calls invalidate only once");
		this.obj.invalidate.resetHistory();

		// remove
		this.obj.removeSubObj(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "remove calls invalidate only once");
		this.obj.invalidate.resetHistory();

		// destroy child
		this.subObj2.destroy();
		assert.equal(this.obj.invalidate.callCount, 1, "destroy of child calls invalidate only once");
		this.obj.invalidate.resetHistory();

		// adding an object a second time
		this.obj.addSubObj(this.subObj);
		this.obj.invalidate.resetHistory();
		this.obj.addSubObj(this.subObj);
		// subObj internally will be removed and added again
		assert.equal(this.obj.invalidate.callCount, 2, "move within aggregation calls invalidate atmost twice");
		this.obj.invalidate.resetHistory();

		// moving a child elsewhere
		new TestManagedObject().addSubObj(this.subObj);
		assert.equal(this.obj.invalidate.callCount, 1, "moving child elsehwere calls invalidate only once");
		this.obj.invalidate.resetHistory();

		this.obj.invalidate.restore();
	});

	QUnit.test("Detect cycle when updating a multiple aggregation", function(assert) {

		// get
		this.obj.addAggregation("subObjects", this.subObj);
		assert.throws(function() {
			this.subObj.addAggregation("subObjects", this.obj);
		}, /cycle/i);
	});

	QUnit.test("applySettings on a 'multiple' aggregation", function(assert) {
		this.obj.applySettings({
			subObjects: [this.subObj, this.subObj3]
		});
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj3], "all objects in a given array should have been nadded");

		this.obj.applySettings({
			subObjects: [this.subObj2]
		});
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj3, this.subObj2], "another call should append objects to the aggregation");
		this.obj.removeAllAggregation("subObjects");

		this.obj.applySettings({
			subObjects: this.subObj2
		});
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj2], "a single object should be treated like a singleton array");
		this.obj.removeAllAggregation("subObjects");

		this.obj.applySettings({
			subObjects: [
				[this.subObj3, this.subObj2], this.subObj
			]
		});
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj3, this.subObj2, this.subObj], "a nested array should have been resolved");
		this.obj.removeAllAggregation("subObjects");

		this.obj.applySettings({
			subObjects: [
				[this.subObj3, [this.subObj, [this.subObj2]]]
			]
		});
		assert.deepEqual(this.obj.getAggregation("subObjects"), [this.subObj3, this.subObj, this.subObj2], "multiple levels of nested arrays should have been resolved");
		this.obj.removeAllAggregation("subObjects");
	});

	QUnit.test("Add/Insert item twice", function(assert) {
		this.obj.addAggregation("subObjects", this.subObj);
		this.obj.addAggregation("subObjects", this.subObj2);
		this.obj.addAggregation("subObjects", this.subObj3);
		var N = this.obj.getAggregation("subObjects").length;

		for (var i = 0; i < N; i++) {
			this.obj.addAggregation("subObjects", this.obj.getAggregation("subObjects")[i]);
			assert.equalSortedIds(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj2, this.subObj3], "add(get(" + i + ")): there must be no duplicate Ids");
		}

		for (var i = 0; i < N; i++) {
			for (var j = 0; j < N + 1; j++) {
				this.obj.insertAggregation("subObjects", this.obj.getAggregation("subObjects")[i], j);
				assert.equalSortedIds(this.obj.getAggregation("subObjects"), [this.subObj, this.subObj2, this.subObj3], "insert(get(" + i + ")," + j + "): there must be no duplicate Ids");
			}
		}
	});

	QUnit.test("Set a multiple aggregation", function(assert) {
		assert["throws"](function() {
			this.obj.setAggregation("subObjects", this.subObj);
		}, null, "Must throw error on calling aggregation setter for a mutiple aggregation");
	});

	QUnit.test("Set unknown aggregation", function(assert) {
		assert["throws"](function() {
			this.obj.setAggregation("unknown", this.subObj);
		}, null, "Must throw error on unknown aggregation setter");
	});

	QUnit.test("Bind / Unbind functions multiple aggregation", function(assert) {
		assert.equal(typeof this.obj.bindElements, "function", "Named bind function for bindable multiple aggregation available");
		assert.equal(typeof this.obj.unbindElements, "function", "Named unbind function for bindable multiple aggregation available");
		assert.equal(typeof this.obj.bindSubObjects, "undefined", "No named bind function for non-bindable multiple aggregation available");
		assert.equal(typeof this.obj.unbindSubObjects, "undefined", "No named unbind function for non-bindable multiple aggregation available");
	});

	QUnit.test("Bind aggregation", function(assert) {
		this.obj.bindAggregation("subObjects", "/list", this.template);
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
	});

	QUnit.test("Bind aggregation with Owner", function(assert) {
		var oObjWithOwner = ManagedObject.runWithOwner(function() {
			return new TestManagedObject();
		}, "myOwnerComponent");

		// template
		oObjWithOwner.bindAggregation("subObjects", {
			path: "/list",
			template: new TestManagedObject("myTemplate")
		});
		var oBindingInfo = oObjWithOwner.getBindingInfo("subObjects");
		var oClone = oBindingInfo.factory("myCloneId");

		assert.equal(Component.getOwnerIdFor(oClone), "myOwnerComponent", "Owner Component ID is correctly propagated");
		assert.equal(oClone.getId(), "myTemplate-myCloneId", "Clone has correct ID");

		oClone.destroy();

		// factory given from outside
		oObjWithOwner.bindAggregation("subObjects", {
			path: "/list",
			factory: function(id) {
				return new TestManagedObject(id);
			}
		});
		oBindingInfo = oObjWithOwner.getBindingInfo("subObjects");
		oClone = oBindingInfo.factory("myTemplate-myCloneId");

		assert.equal(Component.getOwnerIdFor(oClone), "myOwnerComponent", "Owner Component ID is correctly propagated");
		assert.equal(oClone.getId(), "myTemplate-myCloneId", "Clone has correct ID");

		oClone.destroy();

		// switch owner
		oObjWithOwner.bindAggregation("subObjects", {
			path: "/list",
			factory: function(id) {
				return new TestManagedObject(id);
			}
		});
		oBindingInfo = oObjWithOwner.getBindingInfo("subObjects");
		oClone = oBindingInfo.factory("myTemplate-myCloneId");

		assert.equal(Component.getOwnerIdFor(oClone), "myOwnerComponent", "Owner Component ID is correctly propagated");
		assert.equal(oClone.getId(), "myTemplate-myCloneId", "Clone has correct ID");

		oClone.destroy();

		// new MO with different owner ID
		var oObjWithDifferentOwner = ManagedObject.runWithOwner(function() {
			return new TestManagedObject();
		}, "myOwnerComponent2");

		oObjWithDifferentOwner.bindAggregation("subObjects", {
			path: "/list",
			factory: oObjWithOwner.getBindingInfo("subObjects").factory
		});

		oBindingInfo = oObjWithDifferentOwner.getBindingInfo("subObjects");
		oClone = oBindingInfo.factory("myTemplate2-myCloneId");

		assert.equal(Component.getOwnerIdFor(oClone), "myOwnerComponent2", "Owner Component ID is correctly propagated via unwrapping");
		assert.equal(oClone.getId(), "myTemplate2-myCloneId", "Clone has correct ID");

		oClone.destroy();

		// owner is already scoped by factory defined by application
		oObjWithOwner.bindAggregation("subObjects", {
			path: "/list",
			factory: function(id) {
				return ManagedObject.runWithOwner(function() {
					return new TestManagedObject(id);
				}, "myAppOwnerComponent");
			}
		});

		oBindingInfo = oObjWithOwner.getBindingInfo("subObjects");
		oClone = oBindingInfo.factory("myAppTemplate-myCloneId");

		assert.equal(Component.getOwnerIdFor(oClone), "myAppOwnerComponent", "Original 'myAppOwnerComponent' is propagated to the clone");
		assert.equal(oClone.getId(), "myAppTemplate-myCloneId", "Clone has correct ID");

		oClone.destroy();

		// cleanup
		oObjWithOwner.destroy();
		oObjWithDifferentOwner.destroy();
	});

	QUnit.test("Bind aggregation reuse templates on updates", function(assert) {
		var aOldObjects, aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			}
		]);
		this.obj.bindAggregation("subObjects", "/changingList", this.template);
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aOldObjects = this.obj.getAggregation("subObjects");
		oModel.setProperty("/changingList", [{
				value: 4
			},
			{
				value: 5
			},
			{
				value: 6
			},
			{
				value: 7
			},
			{
				value: 8
			}
		]);
		assert.equal(this.obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		aNewObjects = this.obj.getAggregation("subObjects");
		assert.ok(aOldObjects[0] === aNewObjects[0], "First SubObject is reused after update");
		assert.ok(aOldObjects[1] === aNewObjects[1], "Second SubObject is reused after update");
		assert.ok(aOldObjects[2] === aNewObjects[2], "Third SubObject is reused after update");
	});

	QUnit.test("Bind aggregation don't reuse factory objects on updates", function(assert) {
		var aOldObjects, aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			}
		]);
		this.obj.bindAggregation("subObjects", "/changingList", function(sIdSuffix, oContext) {
			return this.template.clone(sIdSuffix);
		}.bind(this));
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aOldObjects = this.obj.getAggregation("subObjects");
		oModel.setProperty("/changingList", [{
				value: 4
			},
			{
				value: 5
			},
			{
				value: 6
			},
			{
				value: 7
			},
			{
				value: 8
			}
		]);
		assert.equal(this.obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		aNewObjects = this.obj.getAggregation("subObjects");
		assert.ok(aOldObjects[0] !== aNewObjects[0], "First SubObject is not reused after update");
		assert.ok(aOldObjects[1] !== aNewObjects[1], "Second SubObject is not reused after update");
		assert.ok(aOldObjects[2] !== aNewObjects[2], "Third SubObject is not reused after update");
	});

	QUnit.test("Bind aggregation reuse templates on updates with extended change detection", function(assert) {
		var aOldObjects, aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			}
		]);
		this.obj.bUseExtendedChangeDetection = true;
		this.obj.bindAggregation("subObjects", "/changingList", this.template);
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aOldObjects = this.obj.getAggregation("subObjects");
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 4
			},
			{
				value: 5
			},
			{
				value: 3
			}
		]);
		assert.equal(this.obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		aNewObjects = this.obj.getAggregation("subObjects");
		assert.ok(aOldObjects[0] === aNewObjects[0], "First SubObject is reused after update");
		assert.ok(aOldObjects[1] === aNewObjects[1], "Second SubObject is reused after update");
		assert.ok(aOldObjects[2] === aNewObjects[4], "Third SubObject is reused after update");
		this.obj.bUseExtendedChangeDetection = false;
	});

	QUnit.test("Bind aggregation reuse factory objects on updates with extended change detection", function(assert) {
		var aOldObjects, aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			}
		]);
		this.obj.bUseExtendedChangeDetection = true;
		this.obj.bindAggregation("subObjects", "/changingList", function(sIdSuffix, oContext) {
			return this.template.clone(sIdSuffix);
		}.bind(this));
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aOldObjects = this.obj.getAggregation("subObjects");
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 4
			},
			{
				value: 5
			},
			{
				value: 3
			}
		]);
		assert.equal(this.obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		aNewObjects = this.obj.getAggregation("subObjects");
		assert.ok(aOldObjects[0] === aNewObjects[0], "First SubObject is reused after update");
		assert.ok(aOldObjects[1] === aNewObjects[1], "Second SubObject is reused after update");
		assert.ok(aOldObjects[2] === aNewObjects[4], "Third SubObject is reused after update");
		this.obj.bUseExtendedChangeDetection = false;
	});

	QUnit.test("Bind aggregation template update contexts with extended change detection and named model", function(assert) {
		var obj = new TestManagedObject({
			models: {
				name: oModel
			}
		});
		var aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			},
			{
				value: 4
			},
			{
				value: 5
			}
		]);
		obj.bUseExtendedChangeDetection = true;
		obj.bindAggregation("subObjects", "name>/changingList", this.template);
		assert.equal(obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 4
			},
			{
				value: 5
			}
		]);
		assert.equal(obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aNewObjects = obj.getAggregation("subObjects");
		assert.equal(aNewObjects[0].getBindingContext("name").getPath(), "/changingList/0", "Binding context is set correctly");
		assert.equal(aNewObjects[1].getBindingContext("name").getPath(), "/changingList/1", "Binding context is set correctly");
		assert.equal(aNewObjects[2].getBindingContext("name").getPath(), "/changingList/2", "Binding context is set correctly");
		obj.bUseExtendedChangeDetection = false;
		obj.destroy();
	});

	QUnit.test("Bind aggregation factory update contexts with extended change detection and named model", function(assert) {
		var obj = new TestManagedObject({
			models: {
				name: oModel
			}
		});
		var aNewObjects;
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 2
			},
			{
				value: 3
			},
			{
				value: 4
			},
			{
				value: 5
			}
		]);
		obj.bUseExtendedChangeDetection = true;
		obj.bindAggregation("subObjects", "name>/changingList", function(sIdSuffix, oContext) {
			return this.template.clone(sIdSuffix);
		}.bind(this));
		assert.equal(obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(obj.getAggregation("subObjects", []).length, 5, "Aggregation length should match model list length");
		oModel.setProperty("/changingList", [{
				value: 1
			},
			{
				value: 4
			},
			{
				value: 5
			}
		]);
		assert.equal(obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		aNewObjects = obj.getAggregation("subObjects");
		assert.equal(aNewObjects[0].getBindingContext("name").getPath(), "/changingList/0", "Binding context is set correctly");
		assert.equal(aNewObjects[1].getBindingContext("name").getPath(), "/changingList/1", "Binding context is set correctly");
		assert.equal(aNewObjects[2].getBindingContext("name").getPath(), "/changingList/2", "Binding context is set correctly");
		obj.bUseExtendedChangeDetection = false;
		obj.destroy();
	});

	QUnit.test("Bind / Unbind functions", function(assert) {
		assert.equal(typeof this.obj.bindSingleBindableAggr, "function", "Named bind function for bindable single aggregation available");
		assert.equal(typeof this.obj.unbindSingleBindableAggr, "function", "Named unbind function for bindable single aggregation available");
		assert.equal(typeof this.obj.bindSingleAggr, "undefined", "No named bind function for non-bindable single aggregation available");
		assert.equal(typeof this.obj.unbindSingleAggr, "undefined", "No named unbind function for non-bindable single aggregation available");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Bind single aggregation", function(assert) {
		// This worked in the past so I add a test to not break it accidentally
		this.obj.bindAggregation("singleAggr", "/list", this.template);
		assert.equal(this.obj.isBound("singleAggr"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("singleAggr") instanceof TestManagedObject, true, "Aggregation is instance of TestManagedObject");
		assert.equal(this.obj.getAggregation("singleAggr").getValue(), "testvalue3", "Value matches the last array entry");
	});

	QUnit.test("Bind aggregation without templateShareable (default)", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");
		var oTemplate = new Element("template");

		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate
		}); // old behavior
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('elements');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === oTemplate, "binding info template");
		assert.ok(!oTemplate.bIsDestroyed, "Template is not destroyed");

		// when unbinding the aggregation, the template must not be destroyed, but it should be marked as a candidate for destroy
		this.obj.unbindAggregation("elements");
		assert.equal(this.obj.getAggregation("elements"), undefined, "Getter must not return an object");
		assert.ok(!oTemplate.bIsDestroyed, "Template is not destroyed");
		assert.ok(oTemplate._sapui_candidateForDestroy, "Template should be marked for destroy");

		// bind again with same template. Should remove the 'candidateForDestroy' marker
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('elements');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === oTemplate, "binding info template");
		assert.ok(!oTemplate.bIsDestroyed, "Template is not destroyed");
		assert.ok(!oTemplate._sapui_candidateForDestroy, "Template must no longer be marked for destroy");

		// doing the same re-bind operation without a preceding unbind should produce the same result
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('elements');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === oTemplate, "binding info template");
		assert.ok(!oTemplate.bIsDestroyed, "Template is not destroyed");
		assert.ok(!oTemplate._sapui_candidateForDestroy, "Template must no longer be marked for destroy");

		// unbind again
		this.obj.unbindAggregation("elements");
		assert.equal(this.obj.getAggregation("elements"), undefined, "Getter must not return an object");
		assert.ok(!oTemplate.bIsDestroyed, "Template is not destroyed");
		assert.ok(oTemplate._sapui_candidateForDestroy, "Template should be marked for destroy");

		// create new UI object with same Id (must not throw exception, class can differ)
		var oLogSpy = this.spy(Log, "debug");
		Log.setLevel(Log.Level.DEBUG);
		var oTemplateNew = new Control("template", {
			value: "{value}"
		});
		assert.ok(oLogSpy.calledWith(sinon.match(/destroying dangling template [\s\S]+ when creating new object with same ID/)), "destroyed elements should be reported with level debug");
		oLogSpy.restore();
		assert.ok(oTemplate.bIsDestroyed, "old Template should have been destroyed after object with same Id has been created");
		assert.checkIfDestroyed(oTemplate);

		// bind again with the new object
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplateNew
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");

		// delete the aggregating object -> should mark the new template for destroy
		this.obj.destroy();
		assert.ok(!oTemplateNew.bIsDestroyed, "Template is not destroyed");
		assert.ok(oTemplateNew._sapui_candidateForDestroy, "Template should be marked for destroy");

	});

	QUnit.test("Bind aggregation without templateShareable (default, Component)", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");

		var MyControl = Control.extend("MyControl", {
			metadata: {
				aggregations: {
					elements: "sap.ui.core.Element"
				}
			}
		});

		var MyComponent = UIComponent.extend("MyComponent", {
			createContent: function() {
				this.oMyTemplate = new Element("template");
				this.oMyRootControl = new MyControl({
					models: oModel,
					elements: {
						path: '/list',
						template: this.oMyTemplate
					}
				});
				return this.oMyRootControl;
			}
		});

		var oComponent = new MyComponent();
		assert.ok(oComponent.oMyTemplate, "component should have a reference to the template");
		assert.ok(oComponent.oMyRootControl, "component should have a reference to the template");
		assert.equal(oComponent.oMyRootControl.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(oComponent.oMyRootControl.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = oComponent.oMyRootControl.getBindingInfo('elements');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === oComponent.oMyTemplate, "binding info template");
		assert.ok(!oComponent.oMyTemplate.bIsDestroyed, "Template is not destroyed");

		// when destroying the component, the template should be desroyed as well
		var oLogSpy = this.spy(Log, "debug");
		Log.setLevel(Log.Level.DEBUG);
		oComponent.destroy();
		assert.ok(oLogSpy.calledWith(sinon.match(/destroying dangling template [\s\S]+ when destroying the owner component/)), "destroyed elements should be reported with level debug");
		oLogSpy.restore();

		assert.ok(oComponent.oMyTemplate.bIsDestroyed, "old Template should have been destroyed after object with same Id has been created");
		assert.checkIfDestroyed(oComponent.oMyTemplate);

	});

	QUnit.test("Bind aggregation and clone with different templateShareable values", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");

		// undefined

		var oTemplate = new Element();
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");
		assert.ok(typeof this.obj.getBindingInfo("elements").templateShareable !== 'boolean' && this.obj.getBindingInfo("elements").templateShareable, "default for templateShareable should be neither true nor false");

		var oLogSpy = this.spy(Log, "error");
		var oClone = this.obj.clone("clone");
		sinon.assert.calledWith(oLogSpy,
			sinon.match(/templateShareable/) // msg should contain the term templateShareable
			.and(sinon.match(/['"<]elements[>"']/)) // msg should contain the name of the aggregation
			.and(sinon.match(new RegExp('[\'"<]' + escapeRegExp(this.obj.getId()) + '[>"\']'))) // and the name of the aggregating object
		);
		oLogSpy.restore();

		assert.strictEqual(this.obj.getBindingInfo("elements").templateShareable, true, "after clone operation, templateShareable should have changed from MAYBE to true in origin");
		assert.strictEqual(oClone.getBindingInfo("elements").templateShareable, true, "after clone operation, templateShareable should have changed from MAYBE to true in clone");
		oClone.destroy();
		this.obj.unbindAggregation("elements");

		// false

		var oTemplate = new Element();
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate,
			templateShareable: false
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");
		assert.strictEqual(this.obj.getBindingInfo("elements").templateShareable, false, "value of templateShareable should be as specified");

		var oLogSpy = this.spy(Log, "error");
		var oClone = this.obj.clone("clone");
		sinon.assert.neverCalledWith(oLogSpy, sinon.match(/templateShareable/));
		oLogSpy.restore();

		assert.strictEqual(this.obj.getBindingInfo("elements").templateShareable, false, "after clone operation, templateShareable of origin still should be false");
		assert.strictEqual(oClone.getBindingInfo("elements").templateShareable, false, "after clone operation, templateShareable of clone also should be false");
		assert.ok(this.obj.getBindingInfo("elements").template !== oClone.getBindingInfo("elements").template, "templates should differ");
		oClone.destroy();
		this.obj.unbindAggregation("elements");

		// true

		var oTemplate = new Element();
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: oTemplate,
			templateShareable: true
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("elements", []).length, 3, "Aggregation length should match model list length");
		assert.strictEqual(this.obj.getBindingInfo("elements").templateShareable, true, "value of templateShareable should be as specified");

		var oLogSpy = this.spy(Log, "error");
		var oClone = this.obj.clone("clone");
		sinon.assert.neverCalledWith(oLogSpy, sinon.match(/templateShareable/));
		oLogSpy.restore();

		assert.strictEqual(this.obj.getBindingInfo("elements").templateShareable, true, "after clone operation, templateSharable of origin still should be false");
		assert.strictEqual(oClone.getBindingInfo("elements").templateShareable, true, "after clone operation, templateSharable of clone also should be false");
		assert.ok(this.obj.getBindingInfo("elements").template === oClone.getBindingInfo("elements").template, "templates should differ");
		oClone.destroy();
		this.obj.unbindAggregation("elements");

	});

	QUnit.test("Bind aggregation with templateShareable:true", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			templateShareable: true
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('subObjects');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === this.template, "binding info template");
		assert.ok(!this.template.bIsDestroyed, "Template is not destroyed");

		this.obj.unbindAggregation("subObjects");
		assert.equal(this.obj.getAggregation("subObjects"), undefined, "Getter must not return an object");
		assert.ok(!this.template.bIsDestroyed, "Template is not destroyed");
		assert.ok(!this.template._sapui_candidateForDestroy, "Template must not be marked for destroy");

	});

	QUnit.test("Bind aggregation with templateShareable:false", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			templateShareable: false
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('subObjects');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === this.template, "binding info template");
		assert.ok(!this.template.bIsDestroyed, "Template is not destroyed");

		this.obj.unbindAggregation("subObjects");
		assert.equal(this.obj.getAggregation("subObjects"), undefined, "Getter must not return an object");
		assert.ok(this.template.bIsDestroyed, "Template is destroyed");
		assert.checkIfDestroyed(this.template);
		assert.ok(!this.template._sapui_candidateForDestroy, "Template must not be marked for destroy");

	});

	QUnit.test("Bind aggregation with templateShareable:false and destroy object", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			templateShareable: false
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");

		var oBindingInfo = this.obj.getBindingInfo('subObjects');
		assert.ok(oBindingInfo, "binding info");
		assert.ok(oBindingInfo.template, "binding info template");
		assert.ok(oBindingInfo.template === this.template, "binding info template");
		assert.ok(!this.template.bIsDestroyed, "Template is not destroyed");

		this.obj.destroy();
		assert.equal(this.obj.getAggregation("subObjects"), undefined, "Getter must not return an object");
		assert.checkIfDestroyed(this.obj);
		assert.checkIfDestroyed(this.template);
		assert.ok(this.obj.bIsDestroyed, "obj is destroyed");
		assert.ok(this.template.bIsDestroyed, "Template is destroyed");

	});

	QUnit.test("Bind aggregation with length", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			length: 2
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 2, "Aggregation length should match defined length");
	});

	QUnit.test("Bind aggregation with startIndex/length", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			startIndex: 1,
			length: 5
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 2, "Aggregation length should match the rest of available length");
		assert.equal(this.obj.getAggregation("subObjects")[0].getProperty("value"), "testvalue2", "First aggregation entry should match second list entry");
	});

	QUnit.test("Bind aggregation/pass event handler", function(assert) {
		this.obj.bindAggregation("subObjects", {
			path: "/list",
			template: this.template,
			events: {
				change: fnChange
			}
		});
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 3, "Aggregation length should match model list length");
		assert.equal(changed, true, "handler attached/change event fired");
		changed = false;
	});

	QUnit.test("Bind aggregation with grouping", function(assert) {
		["value", "intValue", "groupValue"].forEach(function(sGroupProperty) {
			var binding, subobjects;
			this.obj.bindAggregation("subObjects", {
				path: "/list",
				template: this.template,
				sorter: new Sorter(sGroupProperty, false, true)
			});
			assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
			subobjects = this.obj.getAggregation("subObjects", []);
			assert.equal(subobjects.length, 6, "Aggregation length should match defined length plus headers");
			assert.equal(subobjects[0].getBooleanValue(), true, "Entry must be a header entry");
			assert.equal(subobjects[2].getBooleanValue(), true, "Entry must be a header entry");
			assert.equal(subobjects[4].getBooleanValue(), true, "Entry must be a header entry");

			binding = this.obj.getBinding("subObjects");
			binding.sort(); //ungroup
			subobjects = this.obj.getAggregation("subObjects", []);
			assert.equal(subobjects.length, 3, "Aggregation length should match array length");
			assert.equal(subobjects[0].getBooleanValue(), false, "Entry must not be a header entry");
			assert.equal(subobjects[1].getBooleanValue(), false, "Entry must not be a header entry");
			assert.equal(subobjects[2].getBooleanValue(), false, "Entry must not be a header entry");
		}.bind(this));
	});

	QUnit.test("Bind aggregation with grouping, but without grouping function", function(assert) {
		var binding, elements;
		this.obj.bindAggregation("elements", {
			path: "/list",
			template: new Element(),
			sorter: new Sorter("value", false, true)
		});
		assert.equal(this.obj.isBound("elements"), true, "isBound must return true for bound aggregations");
		elements = this.obj.getAggregation("elements", []);
		assert.equal(elements.length, 3, "Aggregation length should match array length");

		binding = this.obj.getBinding("elements");
		binding.sort(); //ungroup
		elements = this.obj.getAggregation("elements", []);
		assert.equal(elements.length, 3, "Aggregation length should match array length");
	});

	QUnit.test("Bind aggregation with grouping and header factory", function(assert) {
		["value", "intValue", "groupValue"].forEach(function(sGroupProperty) {
			var binding, subobjects;
			this.obj.bindAggregation("subObjects", {
				path: "/list",
				template: this.template,
				sorter: new Sorter(sGroupProperty, false, true),
				groupHeaderFactory: function(oGroup) {
					return new TestManagedObject({
						value: oGroup.key,
						booleanValue: true
					});
				}
			});
			assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
			subobjects = this.obj.getAggregation("subObjects", []);
			assert.equal(subobjects.length, 6, "Aggregation length should match defined length plus headers");
			assert.equal(subobjects[0].getBooleanValue(), true, "Entry must be a header entry");
			assert.equal(subobjects[2].getBooleanValue(), true, "Entry must be a header entry");
			assert.equal(subobjects[4].getBooleanValue(), true, "Entry must be a header entry");

			binding = this.obj.getBinding("subObjects");
			binding.sort(); //ungroup
			subobjects = this.obj.getAggregation("subObjects", []);
			assert.equal(subobjects.length, 3, "Aggregation length should match array length");
			assert.equal(subobjects[0].getBooleanValue(), false, "Entry must not be a header entry");
			assert.equal(subobjects[1].getBooleanValue(), false, "Entry must not be a header entry");
			assert.equal(subobjects[2].getBooleanValue(), false, "Entry must not be a header entry");
		}.bind(this));
	});

	QUnit.test("Unbind aggregation", function(assert) {
		this.obj.bindAggregation("subObjects", "/list", this.template);
		this.obj.unbindAggregation("subObjects");
		assert.equal(this.obj.isBound("subObjects"), false, "isBound must return false for bound aggregations");
		assert.equal(this.obj.getAggregation("subObjects", []).length, 0, "Aggregation must be reset after unbind");
	});

	QUnit.test("Bind unkown aggregation", function(assert) {
		var bThrown = false;
		try {
			this.obj.bindAggregation("unknown", "/testpath", this.template);
		} catch (e) {
			bThrown = true;
		}
		assert.ok(bThrown, "Must throw error on unknown aggregation bind");
	});

	QUnit.module("defaultClass");

	QUnit.test("ManagedObjects created from object-literals", function(assert) {
		// spy ObjectPath.get() to check if aggregations with default class don't probe the global namespace
		const oObjectPathGetSpy = this.spy(ObjectPath, "get");

		// Create aggregation content from object literals
		const oContainer = new TestManagedObject({
			itemsWithDefaultClass: [{
				name: "item 0"
			},
			{
				name: "item 1"
			}]
		});

		assert.equal(oObjectPathGetSpy.callCount, 0, "No access to global namespace for aggregations with 'defaultClass'");

		// check aggregation content
		oContainer.getItemsWithDefaultClass().forEach((obj, i) => {
			assert.ok(obj instanceof TestItem, "Aggregation Item was correctly instantiated from 'defaultClass'");
			assert.ok(obj.getName(), `item ${i}`, "Aggregation Item properties correctly passed to 'defaultClass' constructor");
		});

		oObjectPathGetSpy.restore();
	});

	QUnit.test("validation: defaultClass does not match aggregation type", function(assert) {
		assert.throws(() => {
			// sample item object, will be used as aggregation content for defaultClass test
			ManagedObject.extend("sap.ui.core.FaultyTestClass", {
				metadata: {
					aggregations: {
						items: { type: "sap.ui.core.TestItem", defaultClass: ManagedObject }
					}
				}
			});
		},
		new TypeError("The 'defaultClass' of the aggregation 'items' in 'sap.ui.core.FaultyTestClass' is not of type 'sap.ui.core.TestItem'."),
		"'defaultClass' definition not matching aggregation type leads to a TypeError");
	});

	QUnit.test("validation: defaultClass is defined together with altTypes containing 'object'", function(assert) {
		assert.throws(() => {
			// sample item object, will be used as aggregation content for defaultClass test
			ManagedObject.extend("sap.ui.core.FaultyTestClass", {
				metadata: {
					aggregations: {
						items: { type: "sap.ui.base.ManagedObject", defaultClass: ManagedObject, altTypes: ["string", "object"] }
					}
				}
			});
		},
		new TypeError("The aggregation 'items' in 'sap.ui.core.FaultyTestClass' must not defined a 'defaultClass' together with the altType 'object'."),
		"'defaultClass' definition together with 'altTypes' definition containing 'object' leads to a TypeError");
	});

	QUnit.test("validation: defaultClass property is defined, but nullish", function(assert) {
		assert.throws(() => {
			// sample item object, will be used as aggregation content for defaultClass test
			ManagedObject.extend("sap.ui.core.FaultyTestClass", {
				metadata: {
					aggregations: {
						items: { type: "sap.ui.base.ManagedObject", defaultClass: undefined }
					}
				}
			});
		},
		new TypeError("The 'defaultClass' of the aggregation 'items' in 'sap.ui.core.FaultyTestClass' is defined with a nullish value (undefined)."),
		"'defaultClass' definition with nullish value leads to a TypeError");
	});

	QUnit.module("Hidden Aggregations", {
		beforeEach: function() {
			this.testObj = new sapTestTestManagedObject("testObj", {
				multiplePublicItems: [
					new TestManagedObject("i1"),
					new TestManagedObject("i2")
				],
				multipleHiddenItems: [
					new TestManagedObject("i3"),
					new TestManagedObject("i4")
				],
				singlePublicItem: new TestManagedObject("i5"),
				singleHiddenItem: new TestManagedObject("i6")
			});
		},
		afterEach: function() {
			this.testObj.destroy();
		}
	});

	QUnit.test("Accessor / Mutator functions", function(assert) {
		assert.ok(!this.testObj.getMultipleHiddenItems, "there must be no named get function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.addMultipleHiddenItem, "there must be no named add function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.removeMultipleHiddenItem, "there must be no named remove function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.removeAllMultipleHiddenItems, "there must be no named removeAll function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.destroyMultipleHiddenItems, "there must be no named destroy function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.indexOfMultipleHiddenItem, "there must be no named indexOf function for a hidden 0..n aggregation");
		assert.ok(!this.testObj.insertMultipleHiddenItem, "there must be no named insert function for a hidden 0..n aggregation");

		assert.ok(!this.testObj.getSingleHiddenItem, "there must be no named get function for a hidden 0..1 aggregation");
		assert.ok(!this.testObj.setSingleHiddenItem, "there must be no named set function for a hidden 0..1 aggregation");
		assert.ok(!this.testObj.destroySingleHiddenItem, "there must be no named destroy function for a hidden 0..1 aggregation");
	});

	QUnit.test("Parent Relationship", function(assert) {
		assert.childOf("testObj-singleHiddenItem");
		assert.childOf("testObj-multipleHiddenItem1");
		assert.childOf("testObj-multipleHiddenItem2");
	});

	QUnit.test("Initial Settings (Apply Settings ignores hidden aggregations)", function(assert) {
		assert.notChildOf("i3");
		assert.notChildOf("i4");
		assert.notChildOf("i6");
		assert.equal(this.testObj.getAggregation("multipleHiddenItems").length, 2, "Number of aggregated multiple private items correct");
		assert.equal(this.testObj.getAggregation("singleHiddenItem").getId(), "testObj-singleHiddenItem", "Aggregated single private item correct");
	});

	QUnit.test("Destroy", function(assert) {
		this.testObj.destroyAggregation("multipleHiddenItems");
		this.testObj.destroyAggregation("singleHiddenItem");

		assert.equal(this.testObj.getAggregation("multipleHiddenItems", []).length, 0, "Number of aggregated multiple private items after destroy correct");
		assert.ok(!this.testObj.getAggregation("singleHiddenItem"), "No aggregated single private item after destroy");

		assert.ok(!byId("testObj-singleHiddenItem"), "Item 'testObj-singleHiddenItem' destroyed");
		assert.ok(!byId("testObj-multipleHiddenItem1"), "Item 'testObj-multipleHiddenItem1' destroyed");
		assert.ok(!byId("testObj-multipleHiddenItem2"), "Item 'testObj-multipleHiddenItem2' destroyed");
	});

	QUnit.module("[0..n] Associations", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.assocElement = new TestManagedObject();
			this.assocElement2 = new TestManagedObject();
		}
	});

	QUnit.test("Accessor / Mutator functions 0..1 public Association", function(assert) {
		assert.equal(typeof this.obj.getSelectedObject, "function", "there should be a named get function for a public 0..1 association");
		assert.equal(typeof this.obj.setSelectedObject, "function", "there should be a named set function for a public 0..1 association ");
		// no 0..n methods
		assert.equal(typeof this.obj.addSelectedObject, "undefined", "there must be no named add function for a public 0..1 association ");
		assert.equal(typeof this.obj.removeSelectedObject, "undefined", "there must be no named remove function for a public 0..1 association ");
		assert.equal(typeof this.obj.removeAllSelectedObject, "undefined", "there must be no named removeAll function for a public 0..1 association");
		// no aggregation methods
		assert.equal(typeof this.obj.destroySelectedObject, "undefined", "there must be no named destroy function for a public 0..1 association ");
		assert.equal(typeof this.obj.indexOfSelectedObject, "undefined", "there must be no named indexOf function for a public 0..1 association ");
		assert.equal(typeof this.obj.insertSelectedObject, "undefined", "there must be no named insert function for a public 0..1 association ");
	});

	QUnit.test("Accessor / Mutator functions private Associations", function(assert) {
		assert.equal(typeof this.obj.get_hiddenObject, "undefined", "there must be no named get function for a private 0..1 association");
		assert.equal(typeof this.obj.set_hiddenObject, "undefined", "there must be no named set function for a private 0..1 association ");
		// no 0..n methods
		assert.equal(typeof this.obj.add_hiddenObject, "undefined", "there must be no named add function for a private 0..1 association ");
		assert.equal(typeof this.obj.remove_hiddenObject, "undefined", "there must be no named remove function for a private 0..1 association ");
		assert.equal(typeof this.obj.removeAll_hiddenObject, "undefined", "there must be no named removeAll function for a private 0..1 association");
		// no aggregation methods
		assert.equal(typeof this.obj.destroy_hiddenObject, "undefined", "there must be no named destroy function for a private 0..1 association ");
		assert.equal(typeof this.obj.indexOf_hiddenObject, "undefined", "there must be no named indexOf function for a private 0..1 association ");
		assert.equal(typeof this.obj.insert_hiddenObject, "undefined", "there must be no named insert function for a private 0..1 association ");

		assert.equal(typeof this.obj.get_hiddenObjects, "undefined", "there must be no named get function for a private 0..1 association");
		assert.equal(typeof this.obj.set_hiddenObjects, "undefined", "there must be no named set function for a private 0..1 association ");
		// no 0..n methods
		assert.equal(typeof this.obj.add_hiddenObjects, "undefined", "there must be no named add function for a private 0..1 association ");
		assert.equal(typeof this.obj.remove_hiddenObjects, "undefined", "there must be no named remove function for a private 0..1 association ");
		assert.equal(typeof this.obj.removeAll_hiddenObjects, "undefined", "there must be no named removeAll function for a private 0..1 association");
		// no aggregation methods
		assert.equal(typeof this.obj.destroy_hiddenObjects, "undefined", "there must be no named destroy function for a private 0..1 association ");
		assert.equal(typeof this.obj.indexOf_hiddenObjects, "undefined", "there must be no named indexOf function for a private 0..1 association ");
		assert.equal(typeof this.obj.insert_hiddenObjects, "undefined", "there must be no named insert function for a private 0..1 association ");
	});

	QUnit.test("Accessor / Mutator functions public 0..n Associations", function(assert) {

		var Log = sap.ui.require("sap/base/Log");
		assert.ok(Log, "Log module should be available");
		assert.equal(typeof this.obj.getAssociatedObjects, "function", "there should be a named get function for a public 0..n association");
		assert.equal(typeof this.obj.addAssociatedObj, "function", "there should be a named add function for a public 0..n association");
		assert.equal(typeof this.obj.removeAssociatedObj, "function", "there should be a named remove function for a public 0..n association");
		assert.equal(typeof this.obj.removeAllAssociatedObjects, "function", "there should be a named removeAll function for a public 0..n association");
		assert.equal(typeof this.obj.removeAllAssociatedObj, "function", "wrongly named removeAll function must exist for compatibility reasons");
		var oLogSpy = this.spy(Log, "warning");
		Log.setLevel(Log.Level.DEBUG);
		this.obj.removeAllAssociatedObj();
		assert.ok(oLogSpy.calledWith(sinon.match(/deprecated/)), "calling the wrongly named function should log a warning message");
		oLogSpy.restore();

		// no 0..1 methods
		assert.equal(typeof this.obj.setAssociatedObj, "undefined", "there must be no named set function for a public 0..n association");
		// no association methods
		assert.equal(typeof this.obj.destroyAssociatedObj, "undefined", "there must be no named destroy function for a public 0..n association");
		assert.equal(typeof this.obj.indexOfAssociatedObj, "undefined", "there must be no named indexOf function for a public 0..n association");
		assert.equal(typeof this.obj.insertAssociatedObj, "undefined", "there must be no named insert function for a public 0..n association");
	});

	QUnit.test("Get from to 0..n Association", function(assert) {
		var result = this.obj.getAssociation("associatedObjects", []); // the second parameter is usually generated by XSLT
		assert.ok(result, "returned value must not be null");
		assert.ok(Array.isArray(result), "returned type must be an array");
		assert.equal(result.length, 0, "returned array must be empty");
	});

	QUnit.test("Add to 0..n Association", function(assert) {
		this.obj.addAssociation("associatedObjects", this.assocElement);
		var result = this.obj.getAssociation("associatedObjects", []);

		assert.ok(result, "returned value must not be null");
		assert.equal(typeof (result.length), "number", "returned type must be an array");
		assert.equal(result.length, 1, "returned array must have one entry");
		assert.equal(result[0], this.assocElement.getId(), "returned entry must be the ID of the associated object");
	});

	QUnit.test("Add more to 0..n Association", function(assert) {
		this.obj.addAssociation("associatedObjects", this.assocElement);
		var result = this.obj.addAssociation("associatedObjects", this.assocElement2);
		assert.equal(result.getId(), this.obj.getId(), "the returned item must be the object itself");

		result = this.obj.getAssociation("associatedObjects", []);

		assert.ok(result, "returned value must not be null");
		assert.equal(typeof (result.length), "number", "returned type must be an array");
		assert.equal(result.length, 2, "returned array must have two entries");
		assert.equal(result[0], this.assocElement.getId(), "first returned entry must be the ID of the first associated object");
		assert.equal(result[1], this.assocElement2.getId(), "second returned entry must be the ID of the second associated object");
	});

	QUnit.test("Modification of array returned as representation of 0..n Association", function(assert) {
		this.obj.addAssociation("associatedObjects", this.assocElement);
		var result = this.obj.getAssociation("associatedObjects", []);
		result[0] = "modified-value!";

		result = this.obj.getAssociation("associatedObjects", []);
		assert.equal(result[0], this.assocElement.getId(), "first returned entry must be the ID of the first associated object even after a copy had been modified");
	});

	QUnit.test("Remove from 0..n Association", function(assert) {
		this.obj.addAssociation("associatedObjects", this.assocElement);
		this.obj.addAssociation("associatedObjects", this.assocElement2);
		var result = this.obj.removeAssociation("associatedObjects", this.assocElement);
		assert.equal(result, this.assocElement.getId(), "returned value must be the ID of the removed object");

		var remaining = this.obj.getAssociation("associatedObjects", []);
		assert.ok(remaining, "returned value must not be null");
		assert.equal(typeof (remaining.length), "number", "returned type must be an array");
		assert.equal(remaining.length, 1, "returned array must have one entry");
		assert.equal(remaining[0], this.assocElement2.getId(), "remaining entry must be the ID of the second associated object");
	});

	QUnit.test("Remove from 0..n Association that does not exists or was never used", function(assert) {
		var result = this.obj.removeAssociation("associatedObjects", this.assocElement);

		assert.equal(result, null, "returned value must be null");
	});

	QUnit.test("Remove All from 0..n Association", function(assert) {
		this.obj.addAssociation("associatedObjects", this.assocElement2);
		this.obj.addAssociation("associatedObjects", this.assocElement); // add one more so removeAll has to remove two objects

		var result = this.obj.removeAllAssociation("associatedObjects");
		assert.ok(result, "returned value must not be null");
		assert.equal(typeof (result.length), "number", "returned type must be an array");
		assert.equal(result.length, 2, "returned array must have two entries");
		assert.equal(result[0], this.assocElement2.getId(), "first returned entry must be the ID of the first associated object");
		assert.equal(result[1], this.assocElement.getId(), "second returned entry must be the ID of the second associated object");

		var remaining = this.obj.getAssociation("associatedObjects", []);
		assert.ok(remaining.length == 0, "returned value must be an empty array");
		sinon.spy(this.obj, "invalidate");
		this.obj.removeAllAssociation("associatedObjects");
		assert.ok(this.obj.invalidate.notCalled, "there is no invalidation if there is no association");
	});

	QUnit.module("Cloning Elements", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.subObj = new TestManagedObject();
			this.subSubObj = new TestManagedObject();
			this.template = new TestManagedObject();
			this.associated1 = new TestManagedObject();
			this.associated2 = new TestManagedObject();
		},
		afterEach: function() {
			this.associated2.destroy();
			this.associated1.destroy();
			this.template.destroy();
			this.subSubObj.destroy();
			this.subObj.destroy();
			this.obj.destroy();
		}
	});

	QUnit.test("Clone Object - aggregation with alt type string", function(assert) {
		this.obj.setAggregation("singleAggr", '#$$^*^(^(^(:"|"|"S|A"S|}W{E+@_#aaaaaaaas');
		var oClone = this.obj.clone("clone");
		assert.ok(oClone instanceof TestManagedObject, "clone of object created");
		assert.equal(oClone.getId(), this.obj.getId() + "-clone", "id created with correct suffix");
	});

	QUnit.test("Clone Object", function(assert) {
		this.obj.addAggregation("subObjects", this.subObj);
		var oClone = this.obj.clone("clone");
		assert.ok(oClone instanceof TestManagedObject, "clone of object created");
		assert.equal(oClone.getId(), this.obj.getId() + "-clone", "id created with correct suffix");
		var result = oClone.getAggregation("subObjects", []);
		assert.equal(result.length, 1, "sub objects cloned");
		assert.ok(result[0] instanceof TestManagedObject, "subObject instance of TestManagedObject");
		assert.equal(result[0].getId(), this.subObj.getId() + "-clone", "id of cloned sub object created with correct suffix");
	});

	QUnit.test("Clone Object: properties", function(assert) {
		this.obj.setValue("test1");
		this.obj.setStringValue("test2");
		this.obj.setFloatValue(0.815);
		this.obj.setIntValue(1337);
		this.obj.setBooleanValue(true);
		this.obj.setEnumValue(MyEnum.Bad);
		this.obj.setStringArray(["a","b"]);
		this.obj.setFloatArray([1.2, 2.3]);
		this.obj.setIntArray([1,2,3,4]);
		this.obj.setBooleanArray([true,false,true,true]);
		this.obj.setObjectValue({a:1, b:2});
		this.obj.setProperty("_hiddenValue", "Magic Value");
		var oSpy = this.spy(this.obj.getMetadata(), "_oClass");

		var oClone = this.obj.clone(null, null, {
			cloneChildren: false
		});

		assert.strictEqual(oClone.getValue(), this.obj.getValue(), "property value of the clone should have the same value as in the original");
		assert.strictEqual(oClone.getStringValue(), this.obj.getStringValue(), "property stringValue of the clone should have the same value as in the original");
		assert.strictEqual(oClone.getFloatValue(), this.obj.getFloatValue(), "property floatValue of the clone should have the same value as in the original");
		assert.strictEqual(oClone.getIntValue(), this.obj.getIntValue(), "property intValue of the clone should have the same value as in the original");
		assert.strictEqual(oClone.getBooleanValue(), this.obj.getBooleanValue(), "property booleanValue of the clone should have the same value as in the original");
		assert.strictEqual(oClone.getEnumValue(), this.obj.getEnumValue(), "property enumValue of the clone should have the same value as in the original");
		assert.deepEqual(oClone.getStringArray(), this.obj.getStringArray(), "property stringArray of the clone should have a value equal to the value of the original");
		assert.notStrictEqual(oClone.getStringArray(), this.obj.getStringArray(), "property stringArray of the clone should not have the exact same value as in the original");
		assert.deepEqual(oClone.getFloatArray(), this.obj.getFloatArray(), "property floatArray of the clone should have a value equal to the value of the original");
		assert.notStrictEqual(oClone.getFloatArray(), this.obj.getFloatArray(), "property floatArray of the clone should not have the exact same value as in the original");
		assert.deepEqual(oClone.getIntArray(), this.obj.getIntArray(), "property intArray of the clone should have a value equal to the value of the original");
		assert.notStrictEqual(oClone.getIntArray(), this.obj.getIntArray(), "property intArray of the clone should not have the exact same value as in the original");
		assert.deepEqual(oClone.getBooleanArray(), this.obj.getBooleanArray(), "property booleanArray of the clone should have a value equal to the value of the original");
		assert.notStrictEqual(oClone.getBooleanArray(), this.obj.getBooleanArray(), "property booleanArray of the clone should not have the exact same value as in the original");
		assert.strictEqual(oClone.getObjectValue(), this.obj.getObjectValue(), "property objectValue of the clone should have the same value as in the original");
		assert.equal(oClone.getProperty("_hiddenValue"), "", "hidden propert must not be cloned");

		assert.equal(oSpy.callCount, 1);
		assert.equal(oSpy.args[0].length, 2);
		assert.equal(typeof oSpy.args[0][1], "object");
		assert.notOk("_hiddenValue" in oSpy.args[0][1], "property _hiddenValue must not be cloned");
	});

	QUnit.test("Clone Object: cloneChildren", function(assert) {
		this.obj.addAggregation("subObjects", this.subObj);
		var oClone = this.obj.clone(null, null, {
			cloneChildren: false
		});
		var result = oClone.getAggregation("subObjects", []);
		assert.equal(result.length, 0, "no children cloned");
		oClone = this.obj.clone(null, null, {
			cloneChildren: true
		});
		result = oClone.getAggregation("subObjects", []);
		assert.equal(result.length, 1, "children cloned");
	});

	QUnit.test("Clone Object: associations", function(assert) {
		this.obj.addAggregation("subObjects", this.subObj); // should be cloned
		this.subObj.addAggregation("subObjects", this.subSubObj); // should be cloned
		this.obj.setSelectedObject(this.associated1);
		this.obj.addAssociatedObj(this.subObj);
		this.obj.addAssociatedObj(this.associated2);
		this.obj.addAssociatedObj(this.subSubObj);
		this.obj.addAssociatedObj(this.obj);
		this.obj.setAssociation("_hiddenObject", this.associated1);
		this.obj.addAssociation("_hiddenObjects", this.subObj);
		this.obj.addAssociation("_hiddenObjects", this.associated2);
		var oSpy = this.spy(this.obj.getMetadata(), "_oClass");

		var oClone = this.obj.clone("-cl0ne", null, {
			cloneChildren: true
		});

		var oClonedSubObj = oClone.getAggregation("subObjects")[0];
		var oClonedSubSubObj = oClone.getAggregation("subObjects")[0].getAggregation("subObjects")[0];
		assert.strictEqual(oClone.getSelectedObject(), this.associated1.getId(),
				"an association to an 'external' object should remain the same in the clone");
		assert.strictEqual(oClone.getAssociatedObjects().length, 4,
				"the cloned association should have the expected cardinality");
		assert.strictEqual(oClone.getAssociatedObjects()[0], oClonedSubObj.getId(),
				"an association to a descendant should point to the cloned descendant");
		assert.strictEqual(oClone.getAssociatedObjects()[1], this.associated2.getId(),
				"an association to an external object should remain the same in the clone");
		assert.strictEqual(oClone.getAssociatedObjects()[2], oClonedSubSubObj.getId(),
				"an association to a 2nd level descendant should point to the cloned descendant");
		assert.strictEqual(oClone.getAssociatedObjects()[3], oClone.getId(),
				"an association to the cloned object should point to the clone");
		assert.equal(oClone.getAssociation("_hiddenObject", null), null, "hidden 0..1 association must not be cloned");
		assert.deepEqual(oClone.getAssociation("_hiddenObjects", []), [], "hidden 0..n association must not be cloned");

		assert.equal(oSpy.callCount, 3);
		assert.equal(oSpy.args[2].length, 2); // the root object is cloned last -> we're interested in the 3rd call
		assert.equal(typeof oSpy.args[2][1], "object");
		assert.notOk("_hiddenObject" in oSpy.args[0][1], "hidden association _hiddenObject must not have been added to the settings for the clone");
		assert.notOk("_hiddenObjects" in oSpy.args[0][1], "hideen association _hiddenObjects must not have been added to the settings for the clone");
	});

	QUnit.test("Clone Object: associations in nested binding template", function(assert) {
		assert.expect(5);
		var oModel = new JSONModel();
		oModel.setData({
			list: [{
				test: "test1",
				nestedList: [{
					test:"testNested"
				}]
			}]
		});
		this.obj.setModel(oModel);
		this.obj.bindAggregation("subObjects", {
			path:"/list",
			templateShareable:false,
			template: new TestManagedObject({
				id: "myOBJ",
				subObjects: {
					path: "nestedList",
					templateShareable:false,
					template: new TestManagedObject({
						id: "myOBJNested",
						selectedObject: "myOBJNested"
					})
				}
			})
		});

		var oClone = this.obj.clone("-cl0ne", null, {
			cloneChildren: true
		});
		assert.ok(oClone, "Clone created");
		var oFirstAggregatedChild = oClone.getAggregation("subObjects")[0];
		var oNestedTemplate = oFirstAggregatedChild.getBindingInfo("subObjects").template;
		assert.ok(oNestedTemplate, "Nested template exists");
		assert.equal(oNestedTemplate.getAssociation("selectedObject"), oNestedTemplate.getId(), "Association cloned correctly");

		var oNestedClone = oFirstAggregatedChild.getAggregation("subObjects")[0];
		assert.ok(oNestedClone, "Nested binding clone created");
		assert.equal(oNestedClone.getAssociation("selectedObject"), oNestedClone.getId(), "Association cloned correctly");
		oModel.destroy();
	});

	QUnit.test("Clone Object: cloneBinding:true/false", function(assert) {
		var oModel = new JSONModel();
		oModel.setData({
			testpath: [{
				test: "test1"
			}, {
				test: "test2"
			}]
		});
		this.obj.setModel(oModel);
		this.obj.bindAggregation("subObjects", "/testpath", this.template);
		assert.equal(this.obj.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		var oClone = this.obj.clone(null, null, {
			cloneChildren: false,
			cloneBindings: true
		});
		var result = oClone.getAggregation("subObjects", []);
		assert.equal(oClone.isBound("subObjects"), true, "isBound must return true for bound aggregations");
		assert.equal(result.length, 2, "children recreated via binding");
		var oClone = this.obj.clone(null, null, {
			cloneChildren: false,
			cloneBindings: false
		});
		var result = oClone.getAggregation("subObjects", []);
		assert.equal(result.length, 0, "children not cloned");
		assert.equal(oClone.isBound("subObjects"), false, "isBound must return false for bound aggregations");
		var oClone = this.obj.clone(null, null, {
			cloneChildren: true,
			cloneBindings: false
		});
		var result = oClone.getAggregation("subObjects", []);
		assert.equal(result.length, 2, "children cloned");
		assert.equal(oClone.isBound("subObjects"), false, "isBound must return false for bound aggregations");
	});

	QUnit.test("Clone Object: Nested ObjectBindings: cloneBinding:true/false", function(assert) {
		assert.expect(5);
		var oModel = new JSONModel();
		oModel.setData({
			testroot: [{
				testpath: [{
					test: "test1"
				}]
			}]
		});
		var oRootObject = new TestManagedObject();
		oRootObject.bindObject("/testroot/0");
		oRootObject.setModel(oModel);
		var oChildObject = new TestManagedObject();
		oChildObject.bindObject("testpath/0");
		oChildObject.bindProperty("value", {path:"test"});
		oRootObject.addAggregation("subObjects", oChildObject);
		assert.equal(oChildObject.getProperty("value"), "test1", "value of child object evaluated correctly");
		// clone object and add to the same aggregation so parent context stays stable
		var oClone = oChildObject.clone(null, null, {cloneBindings:true});
		oRootObject.addAggregation("subObjects", oClone);
		assert.equal(oClone.getProperty("value"), "test1", "value of child object evaluated correctly");
		assert.notStrictEqual(oChildObject.getObjectBinding(), oClone.getObjectBinding(),
			"Object binding of child object and clone should not share binding instance");
		oClone = oChildObject.clone(null, null, {cloneBindings:false});
		oRootObject.addAggregation("subObjects", oClone);
		assert.equal(oClone.isBound("value"), false, "value should not be bound");
		assert.equal(oClone.getObjectBinding(), undefined, "object should not be bound");
	});

	QUnit.test("Clone Object: events", function(assert) {
		var oSpy = this.spy();
		this.obj.attachEvent("press", oSpy, this.obj);
		var oClone = this.obj.clone();
		oClone.firePress();
		assert.strictEqual(oSpy.thisValues[0].getId(), oClone.getId());
	});

	QUnit.test("Clone Object: object property", function(assert) {
		var obj = new TestManagedObject({objectValue: {ui5object: true, path:"somePathProperty"}});
		var oSpy = sinon.spy(obj, "bindProperty");
		var oClone = obj.clone();
		assert.equal(oClone.getProperty("objectValue"), obj.getProperty("objectValue"));
		assert.equal(oClone.getProperty("objectValue").path, "somePathProperty");
		assert.equal(oSpy.callCount, 0);
	});

	QUnit.module("Invalidate");

	QUnit.test("ShouldKnowIfInvalidateIsSuppressed", function(assert) {
		var fnTestCase = function(sutSuppressedInvalidate, parentSuppressedInvalidate, expectedResult) {
			//Arrange
			var sut, result,
				parent = new ManagedObject();

			if (parentSuppressedInvalidate) {
				parent.iSuppressInvalidate = 1;
			}

			//System under Test
			sut = new ManagedObject();


			sut.oParent = parent;

			if (sutSuppressedInvalidate) {
				sut.iSuppressInvalidate = 1;
			}

			//Act
			result = sut.isInvalidateSuppressed();

			//Assert
			assert.strictEqual(result, expectedResult, "invalidate is supressed");
		};


		fnTestCase(true, false, true);
		fnTestCase(false, true, false);
		fnTestCase(true, true, true);

		//only if child and all parents do not suppress invalidate, it should be false
		fnTestCase(false, false, false);

	});

	QUnit.test("ShouldInvalidateWhenSettingAnAggregation", function(assert) {

		//Arrange
		var Dummy = Element.extend("sap.test.Dummy", {
			metadata: {
				aggregations: {
					"someAggregation": {
						type: "sap.test.Dummy",
						multiple: false
					}
				}
			}
		});

		var fnTestCase = function(supressInvalidate) {

			var sut,
				invalidateWasCalled = false,
				child = new Dummy();

			//System under Test
			sut = new Dummy();

			sut.invalidate = function() {
				invalidateWasCalled = true;
			};

			//Act
			sut.setAggregation("someAggregation", child, supressInvalidate);


			assert.strictEqual(invalidateWasCalled, !supressInvalidate, "invalidate was not called");
		};

		fnTestCase(true);
		fnTestCase(false);
	});

	QUnit.module("bind Object", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.subObj = new TestManagedObject();
			this.subObj2 = new TestManagedObject();
			this.subObj3 = new TestManagedObject();
			this.template = new TestManagedObject();
			this.obj.setModel(oModel);
		}
	});

	QUnit.test("Cleanup on destroy", function(assert) {
		var iExistingBindings = oModel.getBindings().length;

		this.obj.bindObject({
			path: "/list/0"
		});
		this.obj.bindObject({
			path: "late>/list/0"
		});
		this.obj.bindObject({
			path: "never>/list/0"
		});
		this.obj.bindProperty("value", "value");
		this.obj.bindProperty("intValue", "late>intValue");
		this.obj.bindProperty("stringValue", "never>value");

		// until now, only the default model bindings should exist
		assert.ok(typeof this.obj.mBindingInfos === 'object' && Object.keys(this.obj.mBindingInfos).length === 3, "there should be 3 binding infos");
		assert.ok(typeof this.obj.mObjectBindingInfos === 'object' && Object.keys(this.obj.mObjectBindingInfos).length === 3, "there should be 3 bound objects");
		assert.ok(typeof this.obj.mObjectBindingInfos.undefined === 'object' && this.obj.mObjectBindingInfos.undefined.binding, "there should be a ContextBinding for the default model");
		assert.ok(typeof this.obj.mObjectBindingInfos.late === 'object' && !this.obj.mObjectBindingInfos.late.binding, "there should be no ContextBinding yet for the late model");
		assert.ok(typeof this.obj.mObjectBindingInfos.never === 'object' && !this.obj.mObjectBindingInfos.never.binding, "there should be no ContextBinding yet for the never model");

		// after setting the late model, the corr. binding should exist
		this.obj.setModel(oModel, 'late');
		assert.ok(typeof this.obj.mBindingInfos === 'object' && Object.keys(this.obj.mBindingInfos).length === 3, "there still should be 3 binding infos");
		assert.ok(typeof this.obj.mObjectBindingInfos === 'object' && Object.keys(this.obj.mObjectBindingInfos).length === 3, "there still should be 3 bound objects");
		assert.ok(typeof this.obj.mObjectBindingInfos.undefined === 'object' && this.obj.mObjectBindingInfos.undefined.binding, "there still should be a ContextBinding for the default model");
		assert.ok(typeof this.obj.mObjectBindingInfos.late === 'object' && this.obj.mObjectBindingInfos.late.binding, "there should be a ContextBinding now for the late model");
		assert.ok(typeof this.obj.mObjectBindingInfos.never === 'object' && !this.obj.mObjectBindingInfos.never.binding, "there still should be no ContextBinding for the never model");

		// after destroying the object, all bindings should have gone
		this.obj.destroy();
		assert.ok(this.obj.mBindingInfos == null || Object.keys(this.obj.mBindingInfos).length === 0, "there should be no more binding infos");
		assert.ok(this.obj.mObjectBindingInfos == null || Object.keys(this.obj.mObjectBindingInfos).length === 0, "there should be no more bound objects");
		assert.equal(oModel.getBindings().length, iExistingBindings, "there should be the same number of bindings in the model as before starting the test");
	});

	QUnit.test("Bind object/pass event handler", function(assert) {
		this.obj.bindObject({
			path: "/list/0",
			events: {
				change: fnChange
			}
		});
		assert.equal(changed, true, "handler attached/change event fired");
		changed = false;
	});

	QUnit.test("Bind object with empty path", function(assert) {
		var oContext = oModel.createBindingContext("/list/0");
		this.obj.bindObject({
			path: "",
			events: {
				change: fnChange
			}
		});
		this.obj.setBindingContext(oContext);
		assert.equal(changed, true, "handler attached/change event fired");
		assert.ok(this.obj.getObjectBinding().getBoundContext() === oContext, "Bound context equals set context");
		changed = false;
		this.obj.setBindingContext(null);
	});

	QUnit.test("Throw an error in case of an invalid object binding configuration", function(assert){
		assert.throws(
			function () {
				return new TestManagedObject("testObjectWithInvalidObjectBinding", {
					objectBindings : function(){}
				});
			},
			new Error("binding must be a string or simple object"),
			"An error is thrown in case of an invalid object binding configuration"
		);
	});

	QUnit.test("Create object with single object binding with string configuration - default model", function(assert){
		var oTestManagedObject = new TestManagedObject("testObjectWithDefaultModelObjectBinding", {
			objectBindings : "/list/0"
		});
		var mObjectBindingInfos = oTestManagedObject.mObjectBindingInfos;
		assert.equal(Object.keys(mObjectBindingInfos).length, 1, "There is exactly one object binding defined.");
		assert.ok(mObjectBindingInfos.hasOwnProperty("undefined"), "The defined object binding is pointing to the default model.");
		assert.strictEqual(mObjectBindingInfos["undefined"].path, "/list/0", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["undefined"].model, undefined, "The model is the default model.");

		oTestManagedObject.destroy();
	});

	QUnit.test("Create object with single object binding with string configuration - named model", function(assert){
		var oTestManagedObject = new TestManagedObject("testObjectWithNamedModelObjectBinding", {
			objectBindings : "myModel>/list/0"
		});
		var mObjectBindingInfos = oTestManagedObject.mObjectBindingInfos;
		assert.equal(Object.keys(mObjectBindingInfos).length, 1, "There is exactly one object binding defined.");
		assert.ok(mObjectBindingInfos.hasOwnProperty("myModel"), "The defined object binding is pointing to the default model.");
		assert.strictEqual(mObjectBindingInfos["myModel"].path, "/list/0", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["myModel"].model, "myModel", "The model is the default model.");

		oTestManagedObject.destroy();
	});

	QUnit.test("Create object with single object binding - default model", function(assert){
		var oTestManagedObject = new TestManagedObject("testObjectWithDefaultModelObjectBinding", {
			objectBindings : {
				undefined: {path: "/list/0"}
			}
		});
		var mObjectBindingInfos = oTestManagedObject.mObjectBindingInfos;
		assert.equal(Object.keys(mObjectBindingInfos).length, 1, "There is exactly one object binding defined.");
		assert.ok(mObjectBindingInfos.hasOwnProperty("undefined"), "The defined object binding is pointing to the default model.");
		assert.strictEqual(mObjectBindingInfos["undefined"].path, "/list/0", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["undefined"].model, undefined, "The model is the default model.");

		oTestManagedObject.destroy();
	});

	QUnit.test("Create object with single object binding - named model", function(assert){
		var oTestManagedObject = new TestManagedObject("testObjectWithNamedModelObjectBinding", {
			objectBindings : {
				myModel: {path: "/list/0"}
			}
		});
		var mObjectBindingInfos = oTestManagedObject.mObjectBindingInfos;
		assert.equal(Object.keys(mObjectBindingInfos).length, 1, "There is exactly one object binding defined.");
		assert.ok(mObjectBindingInfos.hasOwnProperty("myModel"), "The defined object binding is pointing to the model named 'myModel'.");
		assert.strictEqual(mObjectBindingInfos["myModel"].path, "/list/0", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["myModel"].model, "myModel", "The model is named 'myModel'.");

		oTestManagedObject.destroy();
	});

	QUnit.test("Create object with multiple object bindings", function(assert){
		var oTestManagedObject = new TestManagedObject("testObjectWithMultipleObjectBindings", {
			objectBindings : {
				myModel: {path: "/list/0"},
				undefined: {path: "/entity/123"}
			}
		});
		var mObjectBindingInfos = oTestManagedObject.mObjectBindingInfos;
		assert.equal(Object.keys(mObjectBindingInfos).length, 2, "There are exactly two object bindings defined.");

		assert.ok(mObjectBindingInfos.hasOwnProperty("myModel"), "The defined object binding is pointing to the model named 'myModel'.");
		assert.strictEqual(mObjectBindingInfos["myModel"].path, "/list/0", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["myModel"].model, "myModel", "The model is named 'myModel'.");

		assert.ok(mObjectBindingInfos.hasOwnProperty("undefined"), "The defined object binding is pointing to the default model.");
		assert.strictEqual(mObjectBindingInfos["undefined"].path, "/entity/123", "The binding path is correct.");
		assert.strictEqual(mObjectBindingInfos["undefined"].model, undefined, "The model is the default model.");

		oTestManagedObject.destroy();
	});

	QUnit.test("ObjectBindings Elementcontext should be removed if model is not available anymore", function(assert){
		var oTestManagedObjectParent = new TestManagedObject("ParentObject", {
			models: {
				"undefined": oModel
			}
		});
		var oTestManagedObjectChild = new TestManagedObject("testObjectWithDefaultModelObjectBinding", {
			objectBindings : {
				undefined: {path: "/list/0"}
			}
		});
		oTestManagedObjectParent.addAggregation("subObjects", oTestManagedObjectChild);
		assert.ok(oTestManagedObjectChild.getBindingContext(), "BindingContext should be created");
		assert.equal(oTestManagedObjectChild.getBindingContext(), oTestManagedObjectChild.mElementBindingContexts["undefined"], "BindingContext is ElementbindingContext");

		oTestManagedObjectParent.setModel();
		assert.notOk(oTestManagedObjectChild.getBindingContext(), "BindingContext should be removed");

		oTestManagedObjectParent.destroy();
	});

	QUnit.test("ObjectBindings Elementcontext should not be removed if model is still available", function(assert){
		var oTestManagedObjectParent = new TestManagedObject("ParentObject", {
			models: {
				"undefined": oModel
			}
		});
		var oTestManagedObjectChild1 = new TestManagedObject("ParentObject", {
			models: {
				"undefined": oModel
			}
		});
		var oTestManagedObjectChild2 = new TestManagedObject("testObjectWithDefaultModelObjectBinding", {
			objectBindings : {
				undefined: {path: "/list/0"}
			}
		});
		oTestManagedObjectParent.addAggregation("subObjects", oTestManagedObjectChild1);
		oTestManagedObjectChild1.addAggregation("subObjects", oTestManagedObjectChild2);
		assert.ok(oTestManagedObjectChild2.getBindingContext(), "BindingContext should be created");
		assert.equal(oTestManagedObjectChild2.getBindingContext(), oTestManagedObjectChild2.mElementBindingContexts["undefined"], "BindingContext is ElementbindingContext");

		oTestManagedObjectChild1.setModel();
		assert.ok(oTestManagedObjectChild2.getBindingContext(), "BindingContext should still exist, as model is again propagated from the parent");

		oTestManagedObjectParent.destroy();
	});

	QUnit.module("ManagedObjectMetadata", {
		beforeEach: function() {
			this.obj = new TestManagedObject();
			this.obj2 = new TestManagedObjectDerived();
			this.obj3 = new sapTestTestManagedObject();
		}
	});

	QUnit.test("Check for generated IDs", function(assert) {
		var mIdChecks = {
			"foo--__bar04--baz": true,
			"foo--__bar04": true,
			"__bar04--baz": true,
			"__bar04": true,
			"__bar04--": true,
			"__bar04--foo": true,

			"foo__bar04": false,
			"foo__bar04--baz": false
		};

		for (var sId in mIdChecks) {
			var isGenerated = mIdChecks[sId];
			var isDetected = ManagedObjectMetadata.isGeneratedId(sId);

			assert.ok(isGenerated === isDetected,
				"Id \"" + sId + "\" is " + (isGenerated ? "generated" : "not generated") +
				", was detected as " + (isDetected ? "generated" : "not generated")
			);
		}


	});

	QUnit.test("Check Metadata defaults", function(assert) {
		assert.ok(this.obj.getMetadata().getDefaultAggregation() === this.obj.getMetadata().getAggregation("singleAggr"), "singleAggr is defaultAggregation");
		assert.ok(this.obj.getMetadata().getDefaultProperty() === this.obj.getMetadata().getDefaultProperty("value"), "value is defaultProperty");
		assert.ok(this.obj.getMetadata().getDefaultAggregationName() === "singleAggr", "singleAggr is defaultAggregationName");
		assert.ok(this.obj.getMetadata().getDefaultPropertyName() === "value", "value is defaultPropertyName");

		assert.ok(this.obj2.getMetadata().getDefaultAggregation() === this.obj.getMetadata().getAggregation("singleAggr"), "derived correctly, singleAggr is defaultAggregation");
		assert.ok(this.obj2.getMetadata().getDefaultProperty() === this.obj.getMetadata().getDefaultProperty("value"), "derived correctly, value is defaultProperty");
		assert.ok(this.obj2.getMetadata().getDefaultAggregationName() === "singleAggr", "derived correctly, singleAggr is defaultAggregationName");
		assert.ok(this.obj2.getMetadata().getDefaultPropertyName() === "value", "derived correctly, value is defaultPropertyName");

		assert.ok(this.obj3.getMetadata().getDefaultAggregation() === undefined, "undefined defaultAggregation");
		assert.ok(this.obj3.getMetadata().getDefaultProperty() === undefined, "undefined defaultProperty");
		assert.ok(this.obj3.getMetadata().getDefaultAggregationName() === null, "empty defaultAggregationName");
		assert.ok(this.obj3.getMetadata().getDefaultPropertyName() === null, "empty defaultPropertyName");
	});

	QUnit.test("Should keep the exception stack", function(assert) {
		assert.expect(2);

		function failingNamedFunction() {
			throw new Error("oh nose");
		}

		var FailingManagedObject = ManagedObject.extend("sap.ui.namespace.for.unitTests.FailingManagedObject", {
			init: function() {
				failingNamedFunction();
			}
		});

		// cannot use QUnit.assert.throws since the stack is not exposed here
		// this test cannot test the original problem that the exceptions source was not visible when try catch was used
		try {
			new FailingManagedObject("myId");
		} catch (ex) {
			assert.ok(ex.stack.indexOf("failingNamedFunction" > -1), "contained the named function in the stack");
		}

		assert.ok(!Element.getElementById("myId"), "object was deregistered");
	});

	QUnit.test("Registration of components: duplicate IDs", function(assert) {
		assert.expect(3);
		new Element("myId");
		assert.ok(Element.getElementById("myId"), "object should be initially registered");

		try {
			new Element("myId");
		} catch (ex) {
			assert.equal(ex.message, "Error: adding element with duplicate id 'myId'");
		}

		assert.ok(Element.getElementById("myId"), "object should still be registered");
	});

	QUnit.test("Registration of components: do not call unregister if register fails", function(assert) {

		assert.expect(4);

		var fnEmpty = function() {

		};
		var registrationObj = {
			register: fnEmpty,
			deregister: fnEmpty,
			init: fnEmpty
		};
		var register = sinon.stub(registrationObj, 'register').throws();
		var deregister = sinon.stub(registrationObj, 'deregister');
		var init = sinon.stub(registrationObj, 'init');

		var FailingManagedObject = ManagedObject.extend("sap.ui.namespace.for.unitTests.FailingManagedObject", registrationObj);


		try {
			new FailingManagedObject("myid");
		} catch (ex) {
			assert.ok(ex, "registration failed");
		}

		assert.equal(register.callCount, 1, "register was called");
		assert.equal(deregister.callCount, 0, "deregister should not be called as register fails");
		assert.equal(init.callCount, 0, "init should not be called as register fails");
	});

	QUnit.module("Contextual settings", {
		beforeEach: function() {
			this.obj1 = new TestManagedObject();
			this.obj2 = new TestManagedObject();
		},
		afterEach: function() {
			this.obj1.destroy();
			this.obj2.destroy();
		}
	});

	QUnit.test("Constructor and singleton", function(assert) {
		assert.ok(this.obj1._oContextualSettings, "A managed object has contextual settings by default");
		assert.equal(this.obj1._getContextualSettings(), ManagedObject._defaultContextualSettings, "The singleton object is used for the default contextual settings");
	});

	QUnit.test("Application of contextual settings", function(assert) {
		var oCustomSettings = {
			mySetting: 1
		};

		var oSpy = this.spy(ManagedObject.prototype, "_onContextualSettingsChanged");

		assert.ok(isEmptyObject(this.obj1._getContextualSettings()), "Initially the contextual settings object is empty");

		this.obj1._applyContextualSettings(oCustomSettings);
		var oReadSettings = this.obj1._getContextualSettings();

		assert.ok(oReadSettings === oCustomSettings, "Applied contextual settings on an object are saved on it");
		assert.ok(oSpy.calledOnce, "Hook method called");

		oSpy.restore();
	});

	QUnit.test("Propagation for single aggregations", function(assert) {
		var oCustomSettings = {
			mySetting: 1
		};

		// First add children
		this.obj1.setAggregation("singleAggr", this.obj2);

		// Then apply settings to the parent
		this.obj1._applyContextualSettings(oCustomSettings);

		var oReadSettings = this.obj2._getContextualSettings();
		assert.ok(oReadSettings === oCustomSettings, "Contextual settings are propagated to single aggregations");
	});

	QUnit.test("Propagation for multiple aggregations", function(assert) {
		var oCustomSettings = {
			mySetting: 1
		};

		// First add children
		this.obj1.addAggregation("subObjects", this.obj2);

		// Then apply settings to the parent
		this.obj1._applyContextualSettings(oCustomSettings);

		var oReadSettings = this.obj2._getContextualSettings();
		assert.ok(oReadSettings === oCustomSettings, "Contextual settings are propagated to multiple aggregations");
	});


	QUnit.test("Children receive the contextual settings of parents", function(assert) {
		var oCustomSettings = {
			mySetting: 1
		};

		var oSpy = this.spy(ManagedObject.prototype, "_onContextualSettingsChanged");

		// First apply settings
		this.obj1._applyContextualSettings(oCustomSettings);

		// Then add children
		this.obj1.setAggregation("singleAggr", this.obj2);

		this.obj2._getContextualSettings();

		assert.equal(this.obj1._getContextualSettings(), this.obj2._getContextualSettings(), "Contextual settings for both managed objects are the same js object");
		assert.equal(oSpy.callCount, 2, "Hook method called for both managed objects");

		oSpy.restore();
	});

	QUnit.test("Removing a managed object from the tree restores the default contextual settings", function(assert) {
		var oCustomSettings = {
			mySetting: 1
		};

		// First apply settings
		this.obj1._applyContextualSettings(oCustomSettings);

		// Then add children
		this.obj1.setAggregation("singleAggr", this.obj2);

		var oReadSettings = this.obj2._getContextualSettings();

		assert.ok(oReadSettings === oCustomSettings, "Initially the child has the parent's contextual settings");

		this.obj1.setAggregation("singleAggr", null);

		assert.ok(this.obj2._getContextualSettings() === ManagedObject._defaultContextualSettings, "Child now has the default contextual settings");

	});

	QUnit.test("SpecialSettings default values", function(assert) {
		var oControl = new TestManagedObject(),
			mSpecial = oControl.getMetadata()._mAllSpecialSettings;
		assert.ok(mSpecial["metadataContexts"].defaultValue, "Metadata context default value is set");
		assert.ok(mSpecial["metadataContexts"].type == "object", "Metadata context of type object");
		assert.ok(mSpecial["metadataContexts"].appData.myprop == "test", "Metadata context has appdata applied");

		oControl = new sapTestTestManagedObject();
		mSpecial = oControl.getMetadata()._mAllSpecialSettings;
		assert.ok(mSpecial["metadataContexts"].defaultValue === undefined, "Metadata context default value is not set");
		assert.ok(mSpecial["metadataContexts"].type === "object", "Metadata context of type not set");
		assert.ok(mSpecial["metadataContexts"].appData === null, "Metadata context has no appdata applied");
	});

	QUnit.module("Invalidation", {
		beforeEach: function() {
			this.obj1 = new TestManagedObject();
			this.obj2 = new TestManagedObject();
		},
		afterEach: function() {
			this.obj1.destroy();
			this.obj2.destroy();
		}
	});

	QUnit.test("suppressInvalidate on parent setProperty", function(assert) {
		//override setValue to suppress invalidation
		this.obj1.setValue = function(sValue) {
			ManagedObject.prototype.setProperty.call(this, "value", sValue, true);
		};

		this.obj1.setModel(oModel);
		var oMoMo = new ManagedObjectModel(this.obj1);
		this.obj2.setModel(oMoMo);
		this.obj1.addAggregation("subObjects", this.obj2);
		this.obj1.bindProperty("value", "/value");
		this.obj2.bindProperty("value", "/value");

		var oSpy = sinon.spy(this.obj2, "invalidate");
		this.obj1.setValue("a new value");
		assert.equal(oSpy.callCount, 1, 'invalidation on obj2 must be called');
	});

	QUnit.test("suppressInvalidate on parent addAggregation", function(assert) {
		//override addAggregation to suppress invalidation
		this.obj1.addAggregation = function(sName, oObj) {
			ManagedObject.prototype.addAggregation.call(this, sName, oObj, true);
		};

		this.obj1.setModel(oModel);
		this.obj1.bindProperty("value", "/value");
		this.obj2.bindProperty("value", "/value");

		var oSpy1 = sinon.spy(this.obj1, "invalidate");
		var oSpy2 = sinon.spy(this.obj2, "invalidate");
		this.obj1.addAggregation("subObjects", this.obj2);

		assert.equal(oSpy1.callCount, 0, 'invalidation on obj1 must not be called');
		assert.equal(oSpy2.callCount, 1, 'invalidation on obj2 must be called');
	});

	QUnit.module("Events", {
		afterEach: function () {
			this.oFixture.destroy();
		}
	});

	QUnit.test("when declared as a function", function (assert) {
		var oSpy = sinon.spy();
		this.oFixture = new TestManagedObject({
			press: oSpy
		});
		this.oFixture.firePress();
		assert.strictEqual(oSpy.callCount, 1);
	});

	QUnit.test("when declared as an array", function (assert) {
		assert.expect(3);
		var oScope = {};
		var sData = "foo";
		var oSpy = sinon.spy(function (oEvent, vData) {
			assert.strictEqual(this, oScope);
			assert.strictEqual(vData, sData);
		});
		this.oFixture = new TestManagedObject({
			press: [sData, oSpy, oScope]
		});
		this.oFixture.firePress();
		assert.strictEqual(oSpy.callCount, 1);
	});

	QUnit.test("when declared as an array with multiple events", function (assert) {
		assert.expect(6);

		// First event handler
		var oScope1 = {};
		var sData1 = "foo";
		var oSpy1 = sinon.spy(function (oEvent, vData) {
			assert.strictEqual(this, oScope1);
			assert.strictEqual(vData, sData1);
		});

		// Second event handler
		var oScope2 = { foo: "baz" };
		var sData2 = "bar";
		var oSpy2 = sinon.spy(function (oEvent, vData) {
			assert.strictEqual(this, oScope2);
			assert.strictEqual(vData, sData2);
		});
		this.oFixture = new TestManagedObject({
			press: [
				[sData1, oSpy1, oScope1],
				[sData2, oSpy2, oScope2]
			]
		});
		this.oFixture.firePress();
		assert.strictEqual(oSpy1.callCount, 1);
		assert.strictEqual(oSpy2.callCount, 1);
	});

	QUnit.test("when declared as an array with oData as an array", function (assert) {
		assert.expect(3);
		var oScope = {};
		var aData = ["foo"];
		var oSpy = sinon.spy(function (oEvent, vData) {
			assert.strictEqual(this, oScope);
			assert.strictEqual(vData, aData);
		});
		this.oFixture = new TestManagedObject({
			press: [aData, oSpy, oScope]
		});
		this.oFixture.firePress();
		assert.strictEqual(oSpy.callCount, 1);
	});

	QUnit.module("Skip propagation", {
		beforeEach: function() {
			this.model = new JSONModel({});
			this.parent = new TestManagedObject();
			this.parent.setModel(this.model);
		},
		afterEach: function() {
			this.model.destroy();
			this.parent.destroy();
		}
	});

	QUnit.test("With inherited model and inline child", function(assert) {
		var obj = new TestManagedObject({
			skippedPropagation: new Control()
		});
		this.parent.setSingleAggr(obj);
		assert.ok(obj.getSkippedPropagation().getModel() === undefined, "Model not propagated");
	});

	QUnit.test("With local model and inline child", function(assert) {
		var obj = new TestManagedObject({
			models: this.model,
			skippedPropagation: new Control()
		});
		assert.ok(obj.getSkippedPropagation().getModel() === undefined, "Model not propagated");
	});

	QUnit.test("With inherited model and added child", function(assert) {
		var obj = new TestManagedObject();
		this.parent.setSingleAggr(obj);
		obj.setSkippedPropagation(new Control());
		assert.ok(obj.getSkippedPropagation().getModel() === undefined, "Model not propagated");
	});

	QUnit.test("With local model and added child", function(assert) {
		var obj = new TestManagedObject({
			models: this.model
		});
		obj.setSkippedPropagation(new Control());
		assert.ok(obj.getSkippedPropagation().getModel() === undefined, "Model not propagated");
	});

	QUnit.module("isDestroyed / isDestroyStarted");

	QUnit.test("Require module - duplicate ID issue", function(assert) {
		assert.expect(1);
		var done = assert.async();
		sap.ui.define("my.Element", ["sap/ui/core/Element"], function(Element) {
			return Element.extend("my.Element", {
				init: function() {
					sap.ui.require(["sap/ui/core/Element"], function(Element) {
						try {
							new Element({id: "table"});
						} catch (exc) {
							assert.equal(exc.message, "Error: adding element with duplicate id 'table'", "duplicate ID error occured");
							done();
						}
					});
				}
			});
		});

		sap.ui.require(["my.Element"], function(Element) {
			var oElement = new Element();
			oElement.destroy();
			oElement = new Element();
			oElement.destroy();
		});
	});

	QUnit.test("Require module - check isDestroyStarted: no duplicate ID issue", function(assert) {
		assert.expect(2);
		var done = assert.async();

		sap.ui.define("my.Element2", ["sap/ui/core/Element"], function(Element) {
			return Element.extend("my.Element2", {
				init: function() {
					assert.ok(!this.isDestroyStarted(), "Element not yet destroyed");
					sap.ui.require(["sap/ui/core/Element"], function(Element) {
						assert.ok(this.isDestroyStarted(), "Must be marked as destroy started");
						done();
					}.bind(this));
				}
			});
		});

		sap.ui.require(["my.Element2"], function(Element) {
			var oElement = new Element();
			oElement.destroy();
		});
	});

	QUnit.test("Destroy Element: isDestroyed must return true", function(assert) {
		var done = assert.async();
		assert.expect(4);
		sap.ui.define("my.Element3", ["sap/ui/core/Element"], function(Element) {
			return Element.extend("my.Element3", {
			});
		});

		sap.ui.require(["my.Element3"], function(Element) {
			var oElement = new Element({id: "myElement"});
			assert.ok(!oElement.isDestroyed(), "Element not yet destroyed");
			assert.ok(!oElement.isDestroyStarted(), "Element not yet destroyed");
			oElement.destroy();
			assert.ok(oElement.isDestroyStarted(), "Must be marked as destroy started");
			assert.ok(oElement.isDestroyed(), "Must be marked as destroy started");
			done();
		});
	});

	QUnit.module("init/exit");

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Ensure that hooks do not return a value (future=false)", async function(assert) {
		future.active = false;
		const oFutureFatalSpy = sinon.spy(Log, "fatal");
		const aPromises = [];

		const MySampleManagedObject = ManagedObject.extend("sap.ui.core.MySampleManagedObject", {
			metadata: {
				properties: {
					name: { type: "string", defaultValue: "hello" }
				}
			},
			init: function() {
				return "init() shouldn't return a value.";
			},
			exit: function() {
				const oPromise = Promise.reject(new Error("exit() failed."));
				aPromises.push(oPromise);
				return oPromise;
			}
		});

		// init
		const oMySample = new MySampleManagedObject({
			id: "sample1"
		});
		assert.ok(oFutureFatalSpy.getCall(0).calledWith("[FUTURE FATAL] The registered Event Listener 'init' must not have a return value."), "init() should be logged correctly.");

		/**
		 * @deprecated
		 */
		const oErrorLogSpy = sinon.spy(Log, "error");

		// exit
		oMySample.destroy();

		await Promise.allSettled(aPromises);
		assert.ok(oFutureFatalSpy.getCall(1).calledWith("[FUTURE FATAL] The registered Event Listener 'exit' must not have a return value."), "exit() should be logged correctly.");

		/**
		 * @deprecated
	     */
		await (async () => {
			await Promise.allSettled(aPromises);
			assert.ok(oErrorLogSpy.getCall(0).calledWith("The registered Event Listener 'exit' of 'sample1' failed."), "Promise rejection caught successfully.");
			oErrorLogSpy.restore();
		})();

		oFutureFatalSpy.restore();

		future.active = undefined;
	});

	QUnit.test("Ensure that hooks do not return a value - init (future=true)", function(assert) {
		future.active = true;

		const MySampleManagedObject = ManagedObject.extend("sap.ui.core.MySampleManagedObject", {
			metadata: {
				properties: {
					name: { type: "string", defaultValue: "hello" }
				}
			},
			init: function() {
				return "init() shouldn't return a value.";
			}
		});
		assert.throws(() => {
			new MySampleManagedObject({
				id: "sample2"
			});
		}, new Error("The registered Event Listener 'init' must not have a return value."), "Error thrown because 'init' hook has a return value.");

		future.active = undefined;
	});

	QUnit.test("Ensure that hooks do not return a value - exit (future=true)", function(assert) {
		future.active = true;

		const aPromises = [];
		const MySampleManagedObject = ManagedObject.extend("sap.ui.core.MySampleManagedObject", {
			metadata: {
				properties: {
					name: { type: "string", defaultValue: "hello" }
				}
			},
			exit: function() {
				const oPromise = Promise.reject(new Error("exit() failed."));
				aPromises.push(oPromise);
				return oPromise;
			}
		});

		const oMySample = new MySampleManagedObject({
			id: "sample3"
		});

		assert.throws(() => {
			oMySample.destroy();
		}, new Error("The registered Event Listener 'exit' must not have a return value."), "Error thrown because 'exit' hook has a return value.");

		future.active = undefined;
	});
});
