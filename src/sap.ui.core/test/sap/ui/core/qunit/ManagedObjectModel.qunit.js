sap.ui.define([
	"sap/m/CustomListItem",
	"sap/m/DatePicker",
	"sap/m/Input",
	"sap/m/List",
	"sap/m/Select",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/ui/core/Item",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Date",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (CustomListItem, DatePicker, Input, List, Select, Text, VBox, Element, Item, XMLView,
			 ManagedObjectModel, JSONModel, BooleanType, DateType, Context, Filter, FilterOperator) {
	/*global QUnit */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var mObjects = {};

	var sXmlViewContent =
		"<mvc:View height=\"100%\" xmlns:mvc=\"sap.ui.core.mvc\" xmlns:core=\"sap.ui.core\" xmlns=\"sap.m\" " +
		"	displayBlock=\"true\">" +
		"	<Panel id=\"panel\">" +
		"		<content>" +
		"			<Button text=\"Button\" id=\"button1\" />" +
		"			<Button text=\"Text of button 2\" id=\"button2\" />" +
		"			<Text text=\"Text\" id=\"text\" />" +
		"			<Panel id=\"innerPanel\">" +
		"				<content>" +
		"					<Input value=\"The inner input\" id=\"input\" />" +
		"				</content>" +
		"			</Panel>" +
		"		</content>" +
		"	</Panel>" +
		"	<Panel id=\"neighborPanel\">" +
		"		<content>" +
		"			<Input value=\"the neighbor\" id=\"neighborInput\" />" +
		"		</content>" +
		"	</Panel>" +
		"	<Select id=\"list\">" +
		"		<items>" +
		"			<core:Item key=\"a\" text=\"a\" id=\"listA\"/>" +
		"			<core:Item key=\"b\" text=\"b\" id=\"listB\"/>" +
		"		</items>" +
		"	</Select>" +
		"</mvc:View>";

	//	define new types for testing
	var TestElement = Element.extend("sap.ui.test.TestElement", {
		metadata: {
			// ---- control specific ----
			library: "sap.ui.core",
			properties: {
				value: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				stringValue: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				},
				floatValue: {
					type: "float",
					group: "Appearance",
					defaultValue: 0
				},
				intValue: {
					type: "int",
					group: "Appearance",
					defaultValue: 0
				},
				booleanValue: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				},
				stringArray: {
					type: "string[]",
					group: "Appearance",
					defaultValue: []
				},
				floatArray: {
					type: "float[]",
					group: "Appearance",
					defaultValue: []
				},
				intArray: {
					type: "int[]",
					group: "Appearance",
					defaultValue: []
				},
				booleanArray: {
					type: "boolean[]",
					group: "Appearance",
					defaultValue: []
				},
				objectArray: {
					type: "object[]",
					group: "Data",
					defaultValue: [],
					byValue: true
				},
				objectValue: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},
				_hiddenProperty: {
					type: "string",
					visibility: "hidden"
				}
			},
			aggregations: {
				singleAggr: {
					type: "sap.ui.test.TestElement",
					multiple: false
				},
				subObjects: {
					type: "sap.ui.test.TestElement",
					multiple: true,
					singularName: "subObj"
				},
				elements: {
					type: "sap.ui.core.Element",
					multiple: true
				},
				_hiddenObjects: {
					type: "sap.ui.test.TestElement",
					multiple: true,
					visibility: "hiddden"
				},
				altType: {
					type: "sap.m.Text",
					multiple: false,
					altTypes: [
						"string", "int", "boolean"
					]
				}
			},
			associations: {
				selectedObject: {
					type: "sap.ui.test.TestElement",
					multiple: false
				},
				associatedObjects: {
					type: "sap.ui.test.TestElement",
					multiple: true,
					singularName: "associatedObj"
				}
			}
		},

		init: function () {
			mObjects[this.getId()] = this;
		},

		exit: function () {
			delete mObjects[this.getId()];
		},

		// needed for grouping test
		addSubObjGroup: function (oGroup, oControl) {
			if (!oControl) {
				oControl = new TestElement({
					value: oGroup.key,
					booleanValue: true
				});
			}
			this.addSubObj(oControl);
		}
	});

	var TestList = Element.extend("sap.ui.test.TestList", {
		metadata: {
			properties: {
				pageProp: {
					type: "object"
				}
			},
			aggregations: {
				selects: {type: "sap.ui.test.TestSelect", multiple: true},
				paging: {type: "sap.ui.test.TestItem", multiple: true},
				assetPages: {type: "sap.ui.test.TestItem", multiple: true}
			}
		},
		/**
		 * Each wrapped page has an asset attachment within
		 */
		updateAssetPages: function() {
			this.updateAggregation.apply(this, ["assetPages"]);
			var aPages = this.getAssetPages();

			for (var i = 0; i < aPages.length; i++) {
				if (!aPages[i].asset) {
					aPages[i].asset = "Asset " + i;
				}
			}
		}

	});

	var TestSelect = Element.extend("sap.ui.test.TestSelect", {
		metadata: {
			properties: {
				selected: {type: "string"},
				pages: {type: "object[]"}
			},
			aggregations: {
				items: {type: "sap.ui.test.TestItem", multiple: true}
			}
		}
	});

	var TestItem = Element.extend("sap.ui.test.TestItem", {
		metadata: {
			properties: {
				key: {type: "string"},
				text: {type: "string"}
			}
		}
	});

	var oModel = new JSONModel({
		value: "testvalue",
		value2: "testvalue2",
		objectValue: {
			model: true
		},
		list: [
			{
				value: "testvalue1",
				intValue: 1,
				groupValue: "group1"
			}, {
				value: "testvalue2",
				intValue: 2,
				groupValue: "group2"
			}, {
				value: "testvalue3",
				intValue: 3,
				groupValue: null
			}
		]
	});

	QUnit.module("ManagedObject Model", {
		beforeEach: function () {
			this.obj = new TestElement("myObject");
			this.subObj = new TestElement();
			this.subObj2 = new TestElement();
			this.subObj3 = new TestElement();
			this.hiddenObject = new TestElement({
				value: "hidden"
			});
			this.obj.addAggregation("_hiddenObjects", this.hiddenObject);
			this.template = new TestElement({
				value: "{value}"
			});
			this.obj.setModel(oModel);
			this.oManagedObjectModel = new ManagedObjectModel(this.obj);
		},
		afterEach: function () {
			this.obj.destroy();
			this.obj = null;
		}
	});

	//	check default settings
	QUnit.test("Create a ManagedObject Model - Property Access", function (assert) {

		var oModel = this.oManagedObjectModel;

		// Check special handling for id property
		assert.equal(oModel.getProperty("/@id"), "myObject", "ID must be 'myObject'");
		assert.equal(oModel.getProperty("/id"), "myObject", "ID must be 'myObject'");//access also via id

		// access non existing
		var aNonExistingPropertyPaths = [
			"/abc", "/abc/def", "/@id/def", "/value/def", "/stringValue/def", "/floatValue/def", "/intValue/def", "/stringArray/def", "/floatArray/def", "/intArray/def", "/booleanArray/def", "/objectValue/def"
		];
		for (var i = 0; i < aNonExistingPropertyPaths.length; i++) {
			assert.equal(oModel.getProperty(aNonExistingPropertyPaths[i]), null, "Property " + aNonExistingPropertyPaths[i] + " does not exist");
		}

		// access existing with default values
		var mProperties = this.obj.getMetadata().getAllProperties();
		for (var n in mProperties) {
			var oProperty = mProperties[n], oValue = oModel.getProperty("/" + oProperty.name);
			if (Array.isArray(oValue)) {
				assert.equal(oValue.length, oProperty.defaultValue.length, "Property " + oProperty.name + " exists and has expected default value");
			} else {
				assert.equal(oValue, oProperty.defaultValue, "Property " + oProperty.name + " exists and has expected default value");
			}
		}

		// set properties with absolute path
		assert.equal(oModel.setProperty("/value", "hello"), true, "Property set");
		assert.equal(oModel.getProperty("/value"), "hello", "Property exists and has new value");
		assert.notOk(oModel.setProperty("/value", "hello"), "Property not set, because it already has the same value");
		assert.equal(oModel.setProperty("/abc", "hello"), false, "Property not set, because it does not exist");
		assert.equal(oModel.getProperty("/abc"), null, "Property does not exist");
		assert.equal(oModel.setProperty("value", "hello"), false, "Property not set, because it is not resolvable");

		// Access property of hidden property
		assert.equal(oModel.setProperty("/_hiddenProperty", "hidden"), true, "The hidden property is set");
		assert.equal(oModel.getProperty("/_hiddenProperty"), "hidden", "The hidden property is retrieved from the model");
		// Access property of hidden aggregation
		assert.equal(oModel.setProperty("/_hiddenObjects/0/value", "hidden1"), true, "Property of hidden element set");
		assert.equal(oModel.getProperty("/_hiddenObjects/0/value"), "hidden1", "The value for the hidden object is retrieved");

		// context not given
		assert.equal(oModel.setProperty("value", "hello"), false, "Property not set, because it is not resolvable without a context");
		// empty property context would point to property
		assert.equal(oModel.setProperty("", {operator: "EQ", values: [1, 2]}), false,
			"Property not set, because it is not resolvable without a context");

		// context given
		var oContext = oModel.getContext("/");
		assert.equal(oModel.setProperty("value", "hello1", oContext), true, "Property set, because context is resolvable");
		assert.equal(oModel.getProperty("value", oContext), "hello1", "Property has correct value, because context is resolvable");

		//context to property
		oContext = oModel.getContext("/objectArray/0/");
		assert.equal(oModel.setProperty("", {operator: "EQ", values: [1, 2]}, oContext), true,
			"Property set, because context is resolvable");
	});


	QUnit.test("Change of property shall only filter resolved bindings", function(assert) {
		var oModel = this.oManagedObjectModel,
			oBinding = oModel.bindProperty("objectArray");

		oModel.addBinding(oBinding);

		var oUpdateSpy = this.spy(oBinding, "checkUpdate");

		// code under test
		assert.equal(oModel.setProperty("/value", "hello"), true, "Property set");
		assert.equal(oUpdateSpy.notCalled, true, "The update is not called");
	});

	QUnit.test("ManagedObject Model  - Property Binding - Registration and Housekeeping", function (assert) {
		var oModel = this.oManagedObjectModel;
		var fnPropertyChangeHandler = function () {
			assert.equal(false, true, "Binding change fired unexpected");
		};
		// create a property binding with a relative path
		var oRootObject = oModel.getRootObject();

		oRootObject.bindProperty("value", {
			path: "stringValue"
		});
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			properties: [
				"stringValue"
			]
		}), false, "The 'stringValue' property is not observed");
		oRootObject.setModel(oModel);
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"stringValue"
			]
		}), false, "The 'stringValue' property is not observed");
		oRootObject.setBindingContext(oModel.getContext("/"));
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"stringValue"
			]
		}), true, "The 'stringValue' property is observed");
		assert.equal(oModel._mObservedCount.properties["myObject/@stringValue"], 1, "1 binding after there context is set for 'myObject/@stringValue'");

		// create a property binding with an absolute path
		var oBinding1 = oModel.bindProperty("/value");
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"value"
			]
		}), false, "The 'value' property is not observed");
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], undefined, "No binding is stored for 'myObject/@value'");
		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding1.attachChange(fnPropertyChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"value"
			]
		}), true, "The 'value' property is observed");
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], 1, "1 binding is stored for 'myObject/@value'");
		// create a second binding
		var oBinding2 = oModel.bindProperty("/value");
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], 1, "Still only 1 binding binding is stored for 'myObject/@value'");
		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding2.attachChange(fnPropertyChangeHandler);
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], 2, "2 binding binding is stored for 'myObject/@value'");
		// detach the one change handler, now the model should still have any internal handlers to the _change
		oBinding2.detachChange(fnPropertyChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"value"
			]
		}), true, "The 'value' property is still observed");
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], 1, "1 binding is stored for 'myObject/@value'");
		//detach the last change handler, now the model should not have any internal handlers to the _change
		oBinding1.detachChange(fnPropertyChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oRootObject, {
			properties: [
				"value"
			]
		}), false, "The 'value' property is not observed");
		assert.equal(oModel._mObservedCount.properties["myObject/@value"], undefined, "No binding is stored for 'myObject/@value'");
	});

	QUnit.test("ManagedObject Model  - Single Aggregation Binding - Registration and Housekeeping", function (assert) {
		var oModel = this.oManagedObjectModel;
		var fnAggregationChangeHandler = function () {
			assert.equal(true, false, "Binding change fired unexpected");
		};
		// create a aggregation binding
		var oBinding1 = oModel.bindAggregation("/singleAggr");
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"singleAggr"
			]
		}), false, "The 'singleAggr' aggregation is not observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], undefined, "No bindings are stored for 'myObject/@singleAggr'");

		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding1.attachChange(fnAggregationChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"singleAggr"
			]
		}), true, "The 'singleAggr' aggregation is observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], 1, "1 binding is stored for 'myObject/@singleAggr'");
		// create a second binding
		var oBinding2 = oModel.bindProperty("/singleAggr");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], 1, "Still only 1 binding binding is stored for 'myObject/@singleAggr'");
		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding2.attachChange(fnAggregationChangeHandler);
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], 2, "2 binding binding is stored for 'myObject/@singleAggr'");
		// detach the one change handler, now the model should still have any internal handlers to the _change
		oBinding2.detachChange(fnAggregationChangeHandler);
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], 1, "1 binding is stored for 'myObject/@singleAggr'");
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"singleAggr"
			]
		}), true, "The 'singleAggr' aggregation is still observed");
		// detach the last change handler, now the model should not have any internal handlers to the _change
		oBinding1.detachChange(fnAggregationChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"singleAggr"
			]
		}), false, "The 'singleAggr' aggregation is not observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], undefined, "No bindings are stored for 'myObject/@singleAggr'");
	});

	QUnit.test("ManagedObject Model  - Multi Aggregation Binding - Registration and Housekeeping", function (assert) {
		var oModel = this.oManagedObjectModel;
		var fnAggregationChangeHandler = function () {
			assert.equal(true, false, "Binding change fired unexpected");
		};
		// create a aggregation binding
		var oBinding1 = oModel.bindAggregation("/subObjects");
		// as there is no change handler attached to the property binding, the handler is not yet registerd
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"subObjects"
			]
		}), false, "The 'subObjects' aggregation is not observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], undefined, "No bindings are stored for 'myObject/@subObjects'");
		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding1.attachChange(fnAggregationChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"subObjects"
			]
		}), true, "The 'subObjects' aggregation is observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], 1, "1 binding is stored for 'myObject/@subObjects'");
		// create a second binding
		var oBinding2 = oModel.bindProperty("/subObjects");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], 1, "Still only 1 binding binding is stored for 'myObject/@subObjects'");
		// adding a change handler causes the addBinding call on the model. This will add the change handler.
		oBinding2.attachChange(fnAggregationChangeHandler);
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], 2, "2 binding binding is stored for 'myObject/@subObjects'");
		// detach the one change handler, now the model should still have any internal handlers to the _change
		oBinding2.detachChange(fnAggregationChangeHandler);
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], 1, "1 binding is stored for 'myObject/@subObjects'");
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"subObjects"
			]
		}), true, "The 'subObjects' aggregation is still observed");
		// detach the last change handler, now the model should not have any internal handlers to the _change
		oBinding1.detachChange(fnAggregationChangeHandler);
		assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
			aggregations: [
				"subObjects"
			]
		}), false, "The 'subObjects' aggregation is not observed");
		assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], undefined, "No bindings are stored for 'myObject/@subObjects'");
	});

	QUnit.test("ManagedObject Model  - Property Binding - Value Checks", function (assert) {

		var oModel = this.oManagedObjectModel;

		assert.equal(oModel.getProperty("/value"), "", "Property exists and has default value");

		var sExpectedValue = "hello";
		var fnPropertyChangeHandler = function () {
			assert.equal(oPropertyBinding.getValue(), sExpectedValue, "Binding change event fired for property value with " + sExpectedValue);
		};
		var oPropertyBinding = oModel.bindProperty("/value");
		oPropertyBinding.attachChange(fnPropertyChangeHandler);

		assert.equal(oModel.setProperty("/value", "hello"), true, "Property set");
		// TODO: Do this for all properties
		assert.equal(oModel.getProperty("/@className"), "sap.ui.test.TestElement", "Classname checked");
		assert.equal(oModel.getProperty("/value/@bound"), false, "Value property is not bound");

		var oControl = oModel.getRootObject();
		oControl.bindProperty("stringValue", {
			path: "/value"
		});
		oControl.setModel(oModel);
		assert.equal(oModel.getProperty("/stringValue/@bound"), true, "stringValue property is bound");

		this.spy(oPropertyBinding, "checkUpdate");
		var oPropertyBinding2 = oModel.bindProperty("/intValue");
		this.spy(oPropertyBinding2, "checkUpdate");
		sExpectedValue = "value";
		oControl.setValue("value");
		assert.equal(oControl.getStringValue(), "value", "stringValue property is updated");
		assert.ok(oPropertyBinding.checkUpdate.called, "checkUpdate on value-binding called");
		assert.notOk(oPropertyBinding2.checkUpdate.called, "checkUpdate on intValue-binding not called");

		sExpectedValue = "fromStringValue";
		oControl.setStringValue("fromStringValue"); // causes binding change

		var oBindingInfo = oModel.getProperty("/stringValue/@bindingInfo");

		assert.equal(oBindingInfo.binding.getPath(), "/value", "BindingInfo contains correct path");
		assert.equal(oBindingInfo.binding.getPath(), oModel.getProperty("/stringValue/@binding/getPath"), "BindingInfo contains correct path");
		assert.equal(oBindingInfo.binding.getPath(), oModel.getProperty("/stringValue/@bindingInfo/binding/getPath"), "BindingInfo contains correct path");
		var oBindingInfoBinding = oModel.bindProperty("/stringValue/@bindingInfo");
		oBindingInfoBinding.attachChange(function () {
			iCount++;
		});
		var iCount = 0;
		oControl.bindProperty("stringValue", {
			path: "/booleanValue",
			type: "sap.ui.model.type.Boolean"
		});
		assert.equal(iCount, 1, "BindingInfo has changed");
		assert.equal(oControl.getProperty("booleanValue"), false, "Boolean is still false via type");
		assert.equal(oControl.setProperty("stringValue", "true"), oControl, "Changed the stringValue");
		assert.equal(oControl.getProperty("booleanValue"), true, "Boolean is true via type");
		assert.equal(oControl.setProperty("stringValue", "false"), oControl, "Changed the stringValue");
		assert.equal(oControl.getProperty("booleanValue"), false, "Boolean is true via type");
		assert.equal(oControl.setProperty("stringValue", "X"), oControl, "Changed the stringValue");
		assert.equal(oControl.getProperty("booleanValue"), true, "Boolean is true via type");
		assert.equal(oControl.setProperty("stringValue", ""), oControl, "Changed the stringValue");
		assert.equal(oControl.getProperty("booleanValue"), false, "Boolean is false via type");

		assert.equal(oModel.getProperty("/@asdasdasd"), null, "Not existing special node checked");
		assert.equal(oModel.getProperty("value"), null, "No context and relative path");

		// bind to a property that does not exist
		var oPropertyBinding = oModel.bindProperty("/notExist");
		oPropertyBinding.attachChange(function () {
			assert.equal(false, true, "Error: This should never be called for a property that does not exist");
		});
		assert.equal(oModel.setProperty("/notExist", "hello"), false, "Property not set");
		oPropertyBinding.checkUpdate();

	});

	QUnit.test("ManagedObject Model  - Aggregation Access", function (assert) {
		var oModel = this.oManagedObjectModel;
		assert.equal(oModel.getAggregation("/content"), null, "Access none existing aggregation is null");
		assert.equal(oModel.getAggregation("/content/another/not/existing"), null, "Access none existing aggregation is null");
		assert.equal(oModel.getAggregation("/singleAggr"), null, "Access a single aggregation that is not set");
		assert.equal(oModel.getProperty("/singleAggr/length"), null, "Length or empty single aggregation");

		assert.equal(oModel.getAggregation("/_hiddenObjects/@length"), 1, "Access length of hidden aggreggation");
		assert.equal(oModel.getAggregation("/_hiddenObjects")[0].getId(), this.hiddenObject.getId(), "Access element of hidden aggreggation");

		assert.equal(oModel.getProperty("/subObjects/length"), 0, "Length of empty aggregation");
		assert.equal(oModel.getProperty("/subObjects/@length"), 0, "Property does not exist");

		var oResult = oModel.getAggregation("/subObjects");
		assert.equal(oResult.length, 0, "Access a multi aggregation that is not set is empty array");
		assert.equal(Array.isArray(oResult), true, "Access a multi aggregation that is not set is empty array");
	});

	QUnit.test("ManagedObject Model  - Aggregations with altType", function (assert) {
		var oModel = this.oManagedObjectModel;
		var oAltObject = new TestElement({
			altType: "{obj>/altType}"
		});
		oAltObject.setModel(oModel, "obj");
		assert.equal(oAltObject.getAggregation("altType"), null, "As there is currently no content in the altType we retrieve null");

		//changing via an altType
		this.obj.setAggregation("altType", "String");
		assert.equal(oAltObject.getAggregation("altType"), "String", "Setting the string altType on the control feeds this type to the model");
		this.obj.setAggregation("altType", 42);
		assert.equal(oAltObject.getAggregation("altType"), 42, "Setting the number altType on the control feeds this type to the model");

		this.obj.setAggregation("altType", true);
		assert.equal(oAltObject.getAggregation("altType"), true, "Setting the number altType on the control feeds this type to the model");
	});

	QUnit.test("ManagedObject Model  - Aggregation Binding", function (assert) {
		assert.equal(this.oManagedObjectModel.getAggregation("/singleAggr"), null, "Access a single aggregation that is not set");
		var oBinding = this.oManagedObjectModel.bindAggregation("/singleAggr");
		var that = this;
		var fHandler = function () {
			assert.equal(oBinding.getValue() === that.subObj, true, "Binding change event fired for single aggregation");
			oBinding.detachChange(fHandler);
		};
		oBinding.attachChange(fHandler);
		this.subObj.setSingleAggr(this.subObj2); // to have child hierarchy
		this.obj.setSingleAggr(this.subObj);

		// check that no additional event is called
		assert.equal(this.oManagedObjectModel.getProperty("/singleAggr"), this.subObj, "Aggregation can be accessed");

		// check childs are observed
		assert.ok(this.oManagedObjectModel._oObserver.isObserved(this.subObj), "Child is observed");
		assert.ok(this.oManagedObjectModel._oObserver.isObserved(this.subObj2), "Child of child is observed");

		// bind to an aggregation that does not exist
		var oBinding = this.oManagedObjectModel.bindAggregation("/notExist");
		assert.equal(oBinding.getPath(), "/notExist", "Binding path is correctly set for aggregation binding");
	});

	QUnit.test("ManagedObject Model  - List Binding", function (assert) {
		assert.equal(this.oManagedObjectModel.getAggregation("/subObjects").length === 0, true, "Access a multi aggregation that is not set");
		var oBinding = this.oManagedObjectModel.bindList("/subObjects"),
			oLengthBinding = this.oManagedObjectModel.bindProperty("/subObjects/@length"),
			that = this,
			iCount = 1,
			iCalls = 0,
			iLength,
			aContexts,
			fHandler = function() {
				iCalls++;
			},
			fHandler2 = function() {
				assert.equal(oLengthBinding.getValue(), iLength, "Length binding called correctly");
			};
		oLengthBinding.attachChange(fHandler2);
		oBinding.attachChange(fHandler);

		iLength = 1;
		this.subObj.addSubObj(this.subObj3); // to have child hierarchy
		this.obj.addSubObj(this.subObj);
		assert.equal(iCalls, iCount, "Binding change event fired for list aggregation");

		aContexts = oBinding.getContexts();
		assert.equal(that.oManagedObjectModel.getProperty("", aContexts[0]) === that.subObj, true, "Contexts are correctly applied");

		// check childs are observed
		assert.ok(this.oManagedObjectModel._oObserver.isObserved(this.subObj), "Child is observed");
		assert.ok(this.oManagedObjectModel._oObserver.isObserved(this.subObj3), "Child of child is observed");

		iCount = 1;
		iLength = 1;
		this.obj.addSubObj(this.subObj);
		assert.equal(iCalls, iCount, "Change event called " + iCount + " as expected, remove, add");

		iCount = 2;
		iLength = 2;
		this.subObj2 = new TestElement("subObject1");
		this.obj.addSubObj(this.subObj2);
		assert.equal(iCalls, iCount, "Change event called " + iCount + " as expected");

		assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Contexts are correctly applied");
		assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[1]) === that.subObj2, true, "Contexts are correctly applied");

		iCount = 4;
		iLength = 1;

		var aSubObjects = this.oManagedObjectModel.getProperty("/subObjects/");
		assert.equal(aSubObjects.length, 2, "There are two sub objects in the list binding");
		this.obj.removeSubObj(this.subObj2);
		aSubObjects = this.oManagedObjectModel.getProperty("/subObjects/");
		assert.equal(aSubObjects.length, 1, "After removal there is one sub object in the list binding");
		iLength = 2;
		this.obj.insertSubObj(this.subObj2, 0);
		aSubObjects = this.oManagedObjectModel.getProperty("/subObjects/");
		assert.equal(aSubObjects.length, 2, "After inserting again there are two sub object in the list binding");
		assert.equal(iCalls, iCount, "Change event called " + iCount + " as expected");
		assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[1]) === that.subObj, true, "Contexts are correctly applied");
		assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj2, true, "Contexts are correctly applied");

		// check that no additional event is called
		assert.equal(this.oManagedObjectModel.setProperty("/value", "hello"), true, "Property set");
		assert.equal(this.oManagedObjectModel.getProperty("/subObjects/0/@className"), "sap.ui.test.TestElement", "Classname checked");
		assert.equal(this.oManagedObjectModel.getProperty("/subObjects/1/@className"), "sap.ui.test.TestElement", "Classname checked");

		assert.equal(this.oManagedObjectModel.getProperty("/subObjects/@id=subObject1/@className"), "sap.ui.test.TestElement", "Classname checked with id");

		assert.equal(this.oManagedObjectModel.getProperty("subObjects/@id=subObject1/@className", this.obj), "sap.ui.test.TestElement", "Classname checked with element context");
		oBinding.getContexts()[1].sPath = "";
		assert.equal(this.oManagedObjectModel.getProperty("abc", oBinding.getContexts()[1]), null, "BindingContext with none resolvable relative path");
		oBinding.detachChange(fHandler);
		oLengthBinding.detachChange(fHandler2);
	});

	QUnit.test("ManagedObject Model  - List Binding (length & startIndex)", function (assert) {
		const oBinding = this.oManagedObjectModel.bindList("/subObjects");
		const fHandler = function() {}; // just a dummy handler
		oBinding.attachChange(fHandler);

		this.obj.addSubObj(this.subObj);
		this.obj.addSubObj(this.subObj2);
		this.obj.addSubObj(this.subObj3);

		let aContexts = oBinding.getContexts(0, 2);
		assert.equal(aContexts.length, 2, "Contexts length");
		assert.equal(this.oManagedObjectModel.getProperty("", aContexts[0]) === this.subObj, true, "Contexts[0] are correctly applied");
		assert.equal(this.oManagedObjectModel.getProperty("", aContexts[1]) === this.subObj2, true, "Contexts[1] are correctly applied");

		aContexts = oBinding.getContexts(1, 2);
		assert.equal(aContexts.length, 2, "Contexts length");
		assert.equal(this.oManagedObjectModel.getProperty("", aContexts[0]) === this.subObj2, true, "Contexts[0] are correctly applied");
		assert.equal(this.oManagedObjectModel.getProperty("", aContexts[1]) === this.subObj3, true, "Contexts[1] are correctly applied");

		aContexts = oBinding.getContexts(-1, 1);
		assert.equal(aContexts.length, 1, "Contexts length");
		assert.equal(this.oManagedObjectModel.getProperty("", aContexts[0]) === this.subObj3, true, "Contexts[0] are correctly applied");
	});

	QUnit.test("ManagedObject Model - getManagedObject", function (assert) {
		var oModel = this.oManagedObjectModel;

		function createContext(sPath) {
			return new Context(oModel, sPath);
		}

		assert.ok(oModel.getManagedObject() === this.obj, "getManagedObject() returns the root of the control tree model");

		assert.equal(oModel.getManagedObject("/subObjects/0"), null, "PATH: Path to single entry of empty multiple Aggregation");
		assert.equal(oModel.getManagedObject("/singleAggr"), null, "PATH: Path to empty single Aggregation");
		assert.equal(oModel.getManagedObject("/doesNotExist"), null, "PATH: Invalid Path");
		this.obj.addSubObj(this.subObj);
		this.obj.setSingleAggr(this.subObj2);
		assert.ok(oModel.getManagedObject("/singleAggr") === this.subObj2, "PATH: Path to single Aggregation");
		assert.equal(oModel.getManagedObject("/subObjects"), null, "PATH: Path to multiple Aggregation");
		assert.ok(oModel.getManagedObject("/subObjects/0") === this.subObj, "PATH: Path to single entry of multiple Aggregation");
		assert.equal(oModel.getManagedObject("/subObjects/0/value"), null, "PATH: Path to Property");

		this.obj.removeSubObj(this.subObj);
		this.obj.setSingleAggr(null);
		this.subObj2.addSubObj(this.subObj3);

		assert.equal(oModel.getManagedObject(createContext("/subObjects/0")), null, "CONTEXT: Path to single entry of empty multiple Aggregation");
		assert.equal(oModel.getManagedObject(createContext("/singleAggr")), null, "CONTEXT: Path to empty single Aggregation");
		assert.equal(oModel.getManagedObject(createContext("/doesNotExist")), null, "CONTEXT: Invalid Path");
		this.obj.addSubObj(this.subObj);
		this.obj.setSingleAggr(this.subObj2);
		assert.ok(oModel.getManagedObject(createContext("/singleAggr")) === this.subObj2, "CONTEXT: Path to single Aggregation");
		assert.equal(oModel.getManagedObject(createContext("/subObjects")), null, "CONTEXT: Path to multiple Aggregation");
		assert.ok(oModel.getManagedObject(createContext("/subObjects/0")) === this.subObj, "CONTEXT: Path to single entry of multiple Aggregation");
		assert.equal(oModel.getManagedObject(createContext("/subObjects/0/value")), null, "CONTEXT: Path to Property");

		assert.ok(oModel.getManagedObject("subObjects/0", createContext("/singleAggr")) === this.subObj3, "CONTEXT + PATH: Path to single entry of multiple Aggregation");
	});

	QUnit.test("ManagedObjectModel - Custom Data", function (assert) {
		var sCustomDataPath = "/@custom";

		assert.equal(this.oManagedObjectModel.setProperty(sCustomDataPath + "/abc", "value abc"), true, "Property abc set as custom data");
		assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value abc", "Property abc is 'value abc' in custom data with absolute path");
		var oCustomContext = this.oManagedObjectModel.createBindingContext(sCustomDataPath);
		assert.equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value abc", "Property abc is 'value abc' in custom data with context");
		assert.equal(this.oManagedObjectModel.setProperty("abc", "value 2 abc", oCustomContext), true, "Property abc set to 'value 2 abc' in custom data with context");
		assert.equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value 2 abc", "Property abc is 'value 2 abc' in custom data with context");
		this.oManagedObjectModel.setData({
			xyz: "value xyz"
		}, true);
		assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value 2 abc", "Property abc is still 'value 2 abc' in custom data with absolute path after merged setData");
		assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "value xyz", "Property xyz is 'value xyz' in custom data with absolute path after merged setData");
		this.oManagedObjectModel.setData({
			def: "value def"
		});
		assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/def"), "value def", "Property def is 'value def' in custom data with absolute path after setData");
		assert.ok(!this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "Property xyz not available after setData");
		assert.equal(this.oManagedObjectModel.getJSON(), "{\"def\":\"value def\"}", "getJSON returns the stringified custom data");
	});

	QUnit.skip("ManagedObjectModel - Generic Testing for sap.m Controls", function (assert) {

		/*
		 * Helper to execute an async function for each element in an array, the executions are chained.
		 */
		function chained(array, callback, initialValue) {
			return array.reduce(function(chain, item) {
				return chain.then(function(previousResult) {
					return callback(item, previousResult);
				});
			}, Promise.resolve(initialValue));
		}

		return sap.ui.getCore().loadLibrary("sap.m", {async: true}).then(function(oLib) {

			// this generic test loops over all controls in sap.m and checks whether a property binding in the model causes a change.
			// currently there are some controls and properties excluded.

			// test values for types
			// maybe we can cover more types
			var mTestProperties = {
				"string": [
					"", "\\", "{}", "ÄÖÜß"
				],
				"boolean": [
					true, false
				],
				"int": [
					1, 2, 1000000000000
				],
				"float": [
					1.1, 2, 10000000.00000001
				]
			};
			var mExcluded = {
				"sap.m.DatePicker": {
					"displayFormatType": true
				},
				"sap.m.DateTimeInput": {
					"valueFormat": true
				},
				"sap.m.TimePicker": {
					"localeId": true
				},
				"sap.m.TimePickerSlider": {
					"selectedValue": true
				},
				"sap.m.UploadCollection": {
					"noDataText": true,
					"noDataDescription": true,
					"instantUpload": true
				},
				"sap.m.TableSelectDialog": {
					"noDataText": true
				},
				"sap.m.FeedContent": {
					"contentText": true
				},
				"sap.m.MaskInput": {
					"placeholderSymbol": true
				},
				"sap.m.NewsContent": {
					"contentText": true
				},
				"sap.m.SplitContainer": {
					"masterButtonText": true,
					"backgroundOpacity": [
						0, 0.5, 0.9, 1
					]
				},
				"sap.m.Input": {
					"selectedKey": true
				},
				"sap.m.Select": {
					"selectedItemId": true
				},
				"sap.m.SelectList": {
					"selectedItemId": true
				},
				"sap.m.ComboBox": {
					"selectedItemId": true
				},
				"sap.m.SelectDialog": {
					"noDataText": true
				},
				"sap.m.SegmentedButton": {
					"selectedKey": true
				},
				"sap.m.ListBase": {
					"noDataText": true
				},
				"sap.m.IconTabBar": {
					"selectedKey": true,
					"showSelection": true
				},
				"sap.m.GrowingList": {
					"triggerText": true,
					"scrollToLoad": true,
					"threshold": true
				},
				"sap.m.GenericTile": {
					"header": true
				},
				"sap.m.Carousel": {
					"showBusyIndicator": true
				},
				"sap.m.App": {
					"backgroundOpacity": [
						0, 0.5, 0.9, 1
					]
				},
				"sap.m.Shell": {
					"backgroundOpacity": [
						0, 0.5, 0.9, 1
					]
				},
				"sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover": true, // not processed at all
				"sap.m.HeaderContainerItemContainer": true, // not processed at all
				"sap.m.TimePickerSliders": true
				// not processed at all
			};

			return chained(oLib.controls, function(sControlName) {

				if (sControlName in mExcluded && mExcluded[sControlName] === true) {
					return;
				}

				return new Promise(function(resolve, reject) {
					sap.ui.require([sControlName.replace(/\./g, "/")], function(ControlClass) {
						var oControl = new ControlClass();
						var oModel = new ManagedObjectModel(oControl);
						var iBindingCount = 0;
						var mProperties = oControl.getMetadata().getProperties();
						for (var n in mProperties) {
							var oProperty = mProperties[n], aTestValues = mTestProperties[oProperty.type];
							if (sControlName in mExcluded) {
								if (mExcluded[sControlName][n] === true) {
									continue;
								} else if (mExcluded[sControlName][n]) {
									aTestValues = mExcluded[sControlName][n];
								}
							}
							/* eslint-disable no-loop-func */
							var iCount = 0;
							var oBinding = oModel.bindProperty("/" + n);
							oModel.addBinding(oBinding);
							oBinding.attachChange(function (oEvent) {
								iCount++;
								assert.equal(oEvent.getSource().getValue() === oControl.getProperty(n), true, "Change Event fired for control " + sControlName + "-" + oEvent.getSource().getPath());
							});
							iBindingCount++;
							if (oProperty.type && aTestValues) {
								for (var j = 0; j < aTestValues.length; j++) {
									iCount = 0;
									var iExpectedCount = 0;
									if (aTestValues[j] !== oProperty.get(oControl)) { // ignore the default values. they will never cause a change event
										iExpectedCount = 1;
									}
									oProperty.set(oControl, aTestValues[j]);
									assert.equal(iCount, iExpectedCount, "Exactly " + iExpectedCount + " property change events fired for " + sControlName + "-" + n);
									assert.equal(oModel.getProperty("/" + n) === oControl.getProperty(n), true, "Checking Properties in model and on control " + sControlName + "-" + n);
								}
							}
							/* eslint-enable no-loop-func */
						}
						assert.equal(oModel.getBindings().length, iBindingCount, iBindingCount + " Bindings are available in the model ");
						oModel.destroy();
						assert.equal(oModel.getBindings().length, 0, "No more bindings after destroy");
						resolve();
					}, reject);
				});
			});
		});
	});

	QUnit.test("Check Update with binding test function", function (assert) {
		var aTrueBindings = [];
		var oModel = this.oManagedObjectModel;
		var oBinding1 = oModel.bindProperty("/value");
		var oBinding2 = oModel.bindProperty("/stringValue");
		var oBinding3 = oModel.bindProperty("/floatValue");
		oModel.addBinding(oBinding1);
		oModel.addBinding(oBinding2);
		oModel.addBinding(oBinding3);

		assert.equal(oModel.getBindings().length, 3, "There are three bindings");

		var fnFilter = function (oBinding) {
			if (oBinding == oBinding1) {
				aTrueBindings.push(oBinding);
				return true;
			}
			return false;
		};

		oModel.checkUpdate(true, false, fnFilter);
		assert.equal(aTrueBindings.length, 1, "The test is called an delivers true for one binding");
		assert.deepEqual(aTrueBindings[0], oBinding1, "And this is exactly the first binding");
	});

	QUnit.test("Check Update with binding test function async", function (assert) {
		var aTrueBindings = [];
		var oModel = this.oManagedObjectModel;
		var oBinding1 = oModel.bindProperty("/value");
		var oBinding2 = oModel.bindProperty("/stringValue");
		var oBinding3 = oModel.bindProperty("/floatValue");
		oModel.addBinding(oBinding1);
		oModel.addBinding(oBinding2);
		oModel.addBinding(oBinding3);

		assert.equal(oModel.getBindings().length, 3, "There are three bindings");

		var fnFilter = function (oBinding) {
			if (oBinding == oBinding1) {
				aTrueBindings.push(oBinding);
				return true;
			}
			return false;
		};

		this.spy(oBinding1, "checkUpdate");
		this.spy(oBinding2, "checkUpdate");
		this.spy(oBinding3, "checkUpdate");
		var fnDone = assert.async();
		oModel.checkUpdate(true, true, fnFilter);
		oModel.checkUpdate(false, true, fnFilter); // to test forceUpdate wins
		setTimeout(function() { // wait for Model update
			assert.equal(aTrueBindings.length, 1, "The test is called an delivers true for one binding");
			assert.deepEqual(aTrueBindings[0], oBinding1, "And this is exactly the first binding");
			assert.ok(oBinding1.checkUpdate.calledWith(true), "checkUpdate called as forced");
			assert.ok(oBinding1.checkUpdate.calledOnce, "checkUpdate called only once");
			assert.notOk(oBinding2.checkUpdate.called, "checkUpdate not called on other Binding");
			assert.notOk(oBinding3.checkUpdate.called, "checkUpdate not called on other Binding");
			fnDone();
		}, 0);
	});

	QUnit.test("Check Update with different binding test function async", function (assert) {
		var aTrueBindings = [];
		var oModel = this.oManagedObjectModel;
		var oBinding1 = oModel.bindProperty("/value");
		var oBinding2 = oModel.bindProperty("/stringValue");
		var oBinding3 = oModel.bindProperty("/floatValue");
		oModel.addBinding(oBinding1);
		oModel.addBinding(oBinding2);
		oModel.addBinding(oBinding3);

		assert.equal(oModel.getBindings().length, 3, "There are three bindings");

		var fnFilter1 = function (oBinding) {
			if (oBinding == oBinding1) {
				aTrueBindings.push(oBinding);
				return true;
			}
			return false;
		};
		var fnFilter2 = function (oBinding) {
			if (oBinding == oBinding2) {
				aTrueBindings.push(oBinding);
				return true;
			}
			return false;
		};

		this.spy(oBinding1, "checkUpdate");
		this.spy(oBinding2, "checkUpdate");
		this.spy(oBinding3, "checkUpdate");
		oModel.checkUpdate(true, true, fnFilter1);
		oModel.checkUpdate(true, true, fnFilter2);
		oModel.checkUpdate(false, false, fnFilter2);
		assert.ok(oBinding1.checkUpdate.calledOnce, "checkUpdate called only once");
		assert.ok(oBinding2.checkUpdate.calledOnce, "checkUpdate called only once");
		assert.ok(oBinding3.checkUpdate.calledOnce, "checkUpdate called only once");
	});

	QUnit.test("ManagedObject Model - handle object properties", function(assert) {
		var oData = {value: "A string", text: "A text"};
		var oModel = new JSONModel({
			data: oData
		});

		this.obj.setModel(oModel);
		this.obj.bindProperty("objectValue", "/data");

		var oInput = new Input({
			value: "{$obj>/objectValue/value}"
		});
		oInput.setModel(this.oManagedObjectModel, "$obj");

		assert.equal("A string", oInput.getValue(), "The value from the JSON model is obtained");
		oInput.setValue("A new string");
		assert.equal("A new string", oInput.getValue(), "The value from the JSON model is updated");
	});

	QUnit.test("ManagedObject Model  - handle array properties", function (assert) {
		var aData = [{operator: "EQ", values: [1, 2]}];
		var oModel = new JSONModel({
			data: aData
		});

		var iPropertyChange = 0;
		var sPropertyChangePath;
		var fnHandlePropertyChange = function (oEvent) {
			iPropertyChange++;
			sPropertyChangePath = oEvent.getParameter("path");
		};
		oModel.attachPropertyChange(fnHandlePropertyChange);

		this.obj.setModel(oModel);
		this.obj.bindProperty("objectArray", "/data");
		this.spy(this.oManagedObjectModel, "checkUpdate");

		var iChange = 0;
		var fnHandleChange = function (oEvent) {
			if (oEvent.getParameter("name") === "objectArray") {
				iChange++;
			}
		};
		this.obj.attachEvent("_change", fnHandleChange);

		var fnFormatter = function (aConditions) {
			if (aConditions[0]) {
				return aConditions[0].operator + ": " + aConditions[0].values[0] + ", " + aConditions[0].values[1];
			}
		};
		var oText1 = new Text("T1", {
			text: {path: "/data", formatter: fnFormatter}
		});
		oText1.setModel(oModel);
		var oText2 = new Text("T2", {
			text: {path: "$obj>/objectArray", formatter: fnFormatter}
		});
		oText2.setModel(this.oManagedObjectModel, "$obj");

		var oInput = new Input({
			value: "{$obj>/objectArray/0/values/0}"
		});
		oInput.setModel(this.oManagedObjectModel, "$obj");

		// if array is updated with same content no update should be triggered on bindings
		aData = aData.slice(0);
		this.oManagedObjectModel.setProperty("/objectArray", aData);
		assert.notOk(this.oManagedObjectModel.checkUpdate.called, "ManagedObjectModel checkUpdate not called");

		assert.deepEqual(this.obj.getObjectArray(), aData, "The data is in the original element");
		assert.equal(oText1.getText(), "EQ: 1, 2", "Text bound to model");
		assert.equal(oText2.getText(), "EQ: 1, 2", "Text bound to ManagedObjectModel");
		assert.equal(oInput.getValue(), "1", "The first value of data is in the input");

		//now change the input with the input value a part of the object array
		oInput.setValue(3);//hier is no int
		var fnDone = assert.async();

		setTimeout(function () {
			var aNewData = [{operator: "EQ", values: ["3", 2]}];
			assert.ok(this.oManagedObjectModel.checkUpdate.called, "ManagedObjectModel checkUpdate called");
			assert.deepEqual(this.obj.getObjectArray(), aNewData, "The new data is in the original element");
			assert.deepEqual(oModel.getProperty("/data"), aNewData, "The new data is also in the model");
			assert.equal(oText1.getText(), "EQ: 3, 2", "Text bound to model");
			assert.equal(oText2.getText(), "EQ: 3, 2", "Text bound to ManagedObjectModel");
			assert.equal(iPropertyChange, 1, "propertyChange Event fired on outerModel");
			assert.equal(sPropertyChangePath, "/data", "propertyChange Event path");
			assert.equal(iChange, 1, " _Change Event fired on control");

			iPropertyChange = 0;
			iChange = 0;
			aData = this.obj.getObjectArray();
			aData[0].values[0] = 4;
			this.obj.setObjectArray(aData); // not sure if this is still a real use case
			setTimeout(function () {
				assert.deepEqual(oModel.getProperty("/data"), [{
					operator: "EQ",
					values: [4, 2]
				}], "The new data is also in the model");
				assert.equal(oInput.getValue(), "4", "The first value of data is in the input");
				assert.equal(oText1.getText(), "EQ: 4, 2", "Text bound to model");
				assert.equal(oText2.getText(), "EQ: 4, 2", "Text bound to ManagedObjectModel");
				assert.equal(iPropertyChange, 1, "propertyChange Event fired on outerModel");
				assert.equal(sPropertyChangePath, "/data", "propertyChange Event path");
				assert.equal(iChange, 1, " _Change Event fired on control");

				iPropertyChange = 0;
				iChange = 0;
				aData = [{operator: "EQ", values: [5, 6]}];
				this.obj.setObjectArray(aData);
				setTimeout(function () {
					assert.deepEqual(oModel.getProperty("/data"), [{
						operator: "EQ",
						values: [5, 6]
					}], "The new data is also in the model");
					assert.equal(oInput.getValue(), "5", "The first value of data is in the input");
					assert.equal(oText1.getText(), "EQ: 5, 6", "Text bound to model");
					assert.equal(oText2.getText(), "EQ: 5, 6", "Text bound to ManagedObjectModel");
					assert.equal(iPropertyChange, 1, "propertyChange Event fired on outerModel");
					assert.equal(sPropertyChangePath, "/data", "propertyChange Event path");
					assert.equal(iChange, 1, " _Change Event fired on control");

					oText1.destroy();
					oText2.destroy();
					oInput.destroy();
					fnDone();
				}, 0);
			}.bind(this), 0);
		}.bind(this), 0);
	});

	QUnit.module("ManagedObject Model", {
		beforeEach: function() {
			return XMLView.create({
				definition: sXmlViewContent
			}).then(function(oView) {
				this.oView = oView;
				this.oModel = new ManagedObjectModel(oView);
			}.bind(this));
		},
		afterEach: function() {
			this.oModel.destroy();
			this.oView.destroy();
		}
	});

	QUnit.test("ManagedObjectModel - Marker interface sap.ui.core.IDScope handling", function (assert) {
		var oManagedObjectModel = this.oModel;
		var oView = this.oView;

		this.spy(oView, "byId");
		var sIdPrefix = oView.getId() + "--";

		var oButton1 = oManagedObjectModel.getProperty("/#button1");

		assert.ok(oButton1, "There is a button");
		assert.equal(oButton1.getId(), sIdPrefix + "button1", "We get the button");
		assert.ok(oView.byId.called, "As the view has the marker interface sap.ui.core.IDScope the byId method is called");

		var oButton2 = oView.byId("button2");
		var sText = oManagedObjectModel.getProperty("/#button2/text");
		assert.equal(sText, oButton2.getText(), "We get the buttons text");

		var oPanel = oManagedObjectModel.getProperty("/#panel");

		assert.ok(oPanel, "There is a panel");
		assert.equal(oPanel.getId(), sIdPrefix + "panel", "We get the correct panel");

		//Check whether observer works on property bindings with ids
		var oPropertyBinding = oManagedObjectModel.bindProperty("/#button2/text");
		var iPropertyChangeCount = 0;
		oPropertyBinding.attachChange(function () {
			iPropertyChangeCount++;
		});
		oButton2.setText("Changed");
		assert.equal(iPropertyChangeCount, 1, "Button text property binding change was fired");
		assert.equal("Changed", oButton2.getText(), "Button Text was updated");

		//Check whether observer works on list bindings with ids
		var oListBinding = oManagedObjectModel.bindList("/#panel/content");
		var iListChangeCount = 0;
		oListBinding.attachChange(function () {
			iListChangeCount++;
		});
		oPanel.removeContent(oButton2);
		assert.equal(iListChangeCount, 1, "content list binding change was fired");
		oPanel.addContent(oButton2);
		assert.equal(iListChangeCount, 2, "content list binding change was fired");
	});

	QUnit.test("BCP: 002075129400001541162020", function (assert) {
		var oManagedObjectModel = this.oModel,
			oButton = oManagedObjectModel.getProperty("/#button2"),
			oContentBinding = oManagedObjectModel.bindList("/#panel/content"),
			iContentChangeCount = 0,
			oInput = oManagedObjectModel.getProperty("/#input"),
			oInnerContentBinding = oManagedObjectModel.bindList("/#innerPanel/content"),
			iInnerContentChangeCount = 0,
			oInnerPanel = oManagedObjectModel.getProperty("/#innerPanel"),
			oNeighborContentBinding = oManagedObjectModel.bindList("/#neighborPanel/content"),
			iNeighborContentChangeCount = 0,
			oNeighborInput = oManagedObjectModel.getProperty("/#neighborInput");

		oContentBinding.attachChange(function () {
			iContentChangeCount = iContentChangeCount + 1;
		});
		oInnerContentBinding.attachChange(function () {
			iInnerContentChangeCount = iInnerContentChangeCount + 1;
		});
		oNeighborContentBinding.attachChange(function () {
			iNeighborContentChangeCount = iNeighborContentChangeCount + 1;
		});

		// code under test - a single list binding is changed
		oButton.setText("changed if child");
		assert.strictEqual(iContentChangeCount, 1, "content list binding change was fired");
		assert.strictEqual(iInnerContentChangeCount, 0, "inner list binding not affected");
		assert.strictEqual(iNeighborContentChangeCount, 0, "neighbor list binding not affected");

		// code under test - a list binding inside an hierarchy is changed
		oInput.setValue("Changed");
		assert.strictEqual(iContentChangeCount, 2, "content list binding change was fired");
		assert.strictEqual(iInnerContentChangeCount, 1, "inner list binding change");
		assert.strictEqual(iNeighborContentChangeCount, 0, "neighbor list binding not affected");

		// code under test - only the relevant binding is changed
		oNeighborInput.setValue("Neighbor Changed");
		assert.strictEqual(iContentChangeCount, 2, "content list binding not affected");
		assert.strictEqual(iInnerContentChangeCount, 1, "inner list not affected");
		assert.strictEqual(iNeighborContentChangeCount, 1, "neighbor list binding change was fired");

		// code under test - check for empty content
		oInnerPanel.removeContent(oInput);
		assert.strictEqual(iContentChangeCount, 2, "content list binding not affected");
		assert.strictEqual(iInnerContentChangeCount, 2, "inner list binding change");
		assert.strictEqual(iNeighborContentChangeCount, 1, "neighbor list binding not affected");
	});

	QUnit.test("BCP: 002075129400001541162020 (with filtered bindings)", function (assert) {
		var oManagedObjectModel = this.oModel,
			oBinding = oManagedObjectModel.bindList("/#list/items"),
			iBindingChangeCount = 0,
			oBindingEmpty = oManagedObjectModel
				.bindList("/#list/items", null, null, [new Filter("text", FilterOperator.EQ, "c")]),
			iBindingEmptyChangeCount = 0,
			oBindingEQa = oManagedObjectModel
				.bindList("/#list/items", null, null, [new Filter("text", FilterOperator.EQ, "a")]),
			iBindingEQaChangeCount = 0,
			oBindingNEa = oManagedObjectModel
				.bindList("/#list/items", null, null, [new Filter("text", FilterOperator.NE, "a")]),
			iBindingNEaChangeCount = 0,
			oItemA = oManagedObjectModel.getProperty("/#listA");

		oBinding.attachChange( function () {
			iBindingChangeCount = iBindingChangeCount + 1;
		});
		oBindingEmpty.attachChange( function () {
			iBindingEmptyChangeCount = iBindingEmptyChangeCount + 1;
		});
		oBindingEQa.attachChange( function () {
			iBindingEQaChangeCount = iBindingEQaChangeCount + 1;
		});
		oBindingNEa.attachChange( function () {
			iBindingNEaChangeCount = iBindingNEaChangeCount + 1;
		});

		assert.strictEqual(oBinding.getLength(), 2);
		assert.strictEqual(oBindingEmpty.getLength(), 0);
		assert.strictEqual(oBindingEQa.getLength(), 1);
		assert.strictEqual(oBindingNEa.getLength(), 1);

		// code under test - filtering not affected
		oItemA.setKey("c");
		assert.strictEqual(iBindingChangeCount, 1);
		assert.strictEqual(iBindingEmptyChangeCount, 1);
		assert.strictEqual(iBindingEQaChangeCount, 1);
		assert.strictEqual(iBindingNEaChangeCount, 1);

		assert.strictEqual(oBindingEmpty.getLength(), 0);

		// code under test - filtering affected
		oItemA.setText("c");
		assert.strictEqual(iBindingChangeCount, 2);
		assert.strictEqual(iBindingEmptyChangeCount, 2);
		assert.strictEqual(iBindingEQaChangeCount, 2);
		assert.strictEqual(iBindingNEaChangeCount, 2);

		assert.strictEqual(oBindingEmpty.getLength(), 1);
		assert.strictEqual(oBindingEQa.getLength(), 0);
		assert.strictEqual(oBindingNEa.getLength(), 2);
	});

	QUnit.module("Binding against ManagedObject Model of a bound control", {
		beforeEach: function () {
			this.aItems0 = [
				{
					key: "one",
					text: "One"
				},
				{
					key: "two",
					text: "Two"
				},
				{
					key: "three",
					text: "Three"
				}
			];

			this.aItems1 = [
				{
					key: "three",
					text: "Three"
				},
				{
					key: "two",
					text: "Two"
				},
				{
					key: "one",
					text: "One"
				}
			];

			var aPageArray = [];

			for (var i = 0; i < 4711; i++) {
				aPageArray.push( {
					key: i,
					text: "Push for " + i
				});
			}


			this.oJSONModel = new JSONModel({
				list: [
					{
						selected: "one",
						items: this.aItems0,
						pages: []
					},
					{
						selected: "three",
						items: this.aItems1,
						pages: []
					}, {
						selected: "paging",
						items: [],
						pages: aPageArray
					}
				],
				pager: aPageArray,
				pageMe: {
					pages: [
						{
							page: aPageArray
						}
					]
				}
			});

			this._oModelList = new TestList({
				models: this.oJSONModel,
				pageProp: "{/pageMe}",
				selects: {
					path: "/list",
					template: new TestSelect({
						selected: "{selected}",
						pages: "{pages}",
						items: {
							path: "items",
							template: new TestItem({
								key: "{key}",
								text: "{text}"
							})
						}
					})
				},
				paging: {
					path: "/pager",
					template: new TestItem({
						key: "{key}",
						text: "{text}"
					})
				},
				assetPages: {
					path: "/pager",
					template: new TestItem({
						key: "{key}",
						text: "{text}"
					})
				}
			});
			this.oMOModel = new ManagedObjectModel(this._oModelList);
		},
		afterEach: function () {
			this._oModelList.destroy();
			this._oModelList = null;
		}
	});

	QUnit.test("Swap aggregation", function (assert) {
		var oBoundList = new List({
			models: this.oMOModel,
			items: {
				path: "/selects",
				template: new CustomListItem({
					content: [
						new Select({
							selectedKey: "{selected}",
							items: {
								path: "items",
								template: new Item({
									key: "{key}",
									text: "{text}"
								})
							}
						})
					]
				})
			}
		});

		var aSelect = oBoundList.getItems();
		var oSelect0 = aSelect[0].getContent()[0];
		var oSelect1 = aSelect[1].getContent()[0];

		function itemsToArray(oSelect) {
			var aItems = oSelect.getItems(), aArray = [];

			for (var i = 0; i < aItems.length; i++) {
				aArray.push({
					key: aItems[i].getKey(),
					text: aItems[i].getText()
				});
			}


			return aArray;
		}


		assert.equal(oSelect0.getSelectedKey(), "one", "The first entry is selected that is 'one'");
		assert.deepEqual(itemsToArray(oSelect0), this.aItems0, "The items are the items of the first list entry");

		assert.equal(oSelect1.getSelectedKey(), "three", "The first entry is selected that is 'three'");
		assert.deepEqual(itemsToArray(oSelect1), this.aItems1, "The items are the items of the second list entry");

		//now swap
		var list = this.oJSONModel.getProperty("/list");
		this.oJSONModel.setProperty("/list", [
			list[1], list[0]
		]);

		assert.equal(oSelect0.getSelectedKey(), "three", "The first entry is selected that is 'one'");
		assert.deepEqual(itemsToArray(oSelect0), this.aItems1, "The items are the items of the second list entry");

		assert.equal(oSelect1.getSelectedKey(), "one", "The first entry is selected that is 'three'");
		assert.deepEqual(itemsToArray(oSelect1), this.aItems0, "The items are the items of the first list entry");

		oBoundList.destroy();
	});

	QUnit.test("Paging in an aggregation (no own update Method)", function(assert) {
		var oAggregationPageList = new List({
			models: this.oMOModel,
			growing: true,
			growingThreshold: 50,
			items: {
				path: "/paging",
				template: new CustomListItem({
					content: [
						new Text( {text: "{text}" })
					]
				})
			}
		});

		var iMaxItemCount = oAggregationPageList.getMaxItemsCount();

		assert.equal(iMaxItemCount, 4711, "There are 4711 items");
		assert.equal(50, oAggregationPageList.getItems(true).length, "Initially there are 50 items");

		var oGrowingDelegate = oAggregationPageList._oGrowingDelegate;
		assert.ok(oGrowingDelegate, 'There is a growing delegate');

		// now grow
		oGrowingDelegate.requestNewPage();
		assert.equal(100, oAggregationPageList.getItems(true).length, "After paging there are 100 items");

		oGrowingDelegate.requestNewPage();
		assert.equal(150, oAggregationPageList.getItems(true).length, "After paging there are 150 items");

		oAggregationPageList.destroy();
	});

	QUnit.test("Paging in an aggregation (own update Method)", function(assert) {
		var oAggregationPageList = new List({
			models: this.oMOModel,
			growing: true,
			growingThreshold: 50,
			items: {
				path: "/assetPages",
				template: new CustomListItem({
					content: [
						new Text( {text: "{text}" })
					]
				})
			}
		});

		var iMaxItemCount = oAggregationPageList.getMaxItemsCount();

		assert.equal(iMaxItemCount, 4711, "There are 4711 items");
		assert.equal(50, oAggregationPageList.getItems(true).length, "Initially there are 50 items");

		var oGrowingDelegate = oAggregationPageList._oGrowingDelegate;
		assert.ok(oGrowingDelegate, 'There is a growing delegate');

		// now grow
		oGrowingDelegate.requestNewPage();
		assert.equal(100, oAggregationPageList.getItems(true).length, "After paging there are 100 items");

		oGrowingDelegate.requestNewPage();
		assert.equal(150, oAggregationPageList.getItems(true).length, "After paging there are 150 items");

		oAggregationPageList.destroy();
	});

	QUnit.test("Paging in parts of a property that comes from an aggregation", function(assert) {
		var oAggregationPropertyPageList = new List({
			models: this.oMOModel,
			growing: true,
			growingThreshold: 50,
			items: {
				path: "/selects/2/pages",
				template: new CustomListItem({
					content: [
						new Text( {text: "{text}" })
					]
				})
			}
		});

		var iMaxItemCount = oAggregationPropertyPageList.getMaxItemsCount();

		assert.equal(iMaxItemCount, 4711, "There are 4711 items");
		assert.equal(50, oAggregationPropertyPageList.getItems(true).length, "Initially there are 50 items");

		var oGrowingDelegate = oAggregationPropertyPageList._oGrowingDelegate;
		assert.ok(oGrowingDelegate, 'There is a growing delegate');

		// now grow
		oGrowingDelegate.requestNewPage();
		assert.equal(100, oAggregationPropertyPageList.getItems(true).length, "After paging there are 100 items");

		oGrowingDelegate.requestNewPage();
		assert.equal(150, oAggregationPropertyPageList.getItems(true).length, "After paging there are 150 items");

		oAggregationPropertyPageList.destroy();
	});

	QUnit.test("Paging in parts of a property", function(assert) {
		var oPropertyPageList = new List({
			models: this.oMOModel,
			growing: true,
			growingThreshold: 50,
			items: {
				path: "/pageProp/pages/0/page",
				template: new CustomListItem({
					content: [
						new Text( {text: "{text}" })
					]
				})
			}
		});

		var iMaxItemCount = oPropertyPageList.getMaxItemsCount();

		assert.equal(iMaxItemCount, 4711, "There are 4711 items");
		assert.equal(50, oPropertyPageList.getItems(true).length, "Initially there are 50 items");

		var oGrowingDelegate = oPropertyPageList._oGrowingDelegate;
		assert.ok(oGrowingDelegate, 'There is a growing delegate');

		// now grow
		oGrowingDelegate.requestNewPage();
		assert.equal(100, oPropertyPageList.getItems(true).length, "After paging there are 100 items");

		oGrowingDelegate.requestNewPage();
		assert.equal(150, oPropertyPageList.getItems(true).length, "After paging there are 150 items");

		oPropertyPageList.destroy();
	});
});
