jQuery.sap.require("sap.ui.model.base.ManagedObjectModel");

var mObjects = {};

// define new types for testing
sap.ui.core.Element.extend("sap.ui.test.TestElement", {
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
			objectValue: {
				type: "object",
				group: "Misc",
				defaultValue: null
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

	init: function() {
		mObjects[this.getId()] = this;
	},

	exit: function() {
		delete mObjects[this.getId()];
	},

	// needed for grouping test
	addSubObjGroup: function(oGroup, oControl) {
		if (!oControl) {
			oControl = new sap.ui.test.TestElement({
				value: oGroup.key,
				booleanValue: true
			});
		}
		this.addSubObj(oControl);
	}
});

var oModel = new sap.ui.model.json.JSONModel({
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
	beforeEach: function() {
		this.obj = new sap.ui.test.TestElement("myObject");
		this.subObj = new sap.ui.test.TestElement();
		this.subObj2 = new sap.ui.test.TestElement();
		this.subObj3 = new sap.ui.test.TestElement();
		this.hiddenObject = new sap.ui.test.TestElement({value: "hidden"});
		this.obj.addAggregation("_hiddenObjects", this.hiddenObject);
		this.template = new sap.ui.test.TestElement({
			value: "{value}"
		});
		this.obj.setModel(oModel);
		this.oManagedObjectModel = new sap.ui.model.base.ManagedObjectModel(this.obj);
	},
	afterEach: function() {
		this.obj.destroy();
		this.obj = null;
	}
});

// check default settings
QUnit.test("Create a ManagedObject Model - Property Access", function(assert) {

	var oModel = this.oManagedObjectModel;

	// Check special handling for id property
	assert.equal(oModel.getProperty("/@id"), "myObject", "ID must be 'myObject'");
	assert.equal(oModel.getProperty("/@id"), "myObject", "ID must be 'myObject'");

	// access non existing
	var aNonExistingPropertyPaths = [
		"/abc",
		"/abc/def",
		"/@id/def",
		"/value/def",
		"/stringValue/def",
		"/floatValue/def",
		"/intValue/def",
		"/stringArray/def",
		"/floatArray/def",
		"/intArray/def",
		"/booleanArray/def",
		"/objectValue/def"
	];
	for (var i = 0; i < aNonExistingPropertyPaths.length; i++) {
		assert.equal(oModel.getProperty(aNonExistingPropertyPaths[i]), null, "Property " + aNonExistingPropertyPaths[i] + " does not exist");
	}

	// access existing with default values
	var mProperties = this.obj.getMetadata().getAllProperties();
	for (var n in mProperties) {
		var oProperty = mProperties[n],
			oValue = oModel.getProperty("/" + oProperty.name);
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

	// Access property of hidden aggregation
	assert.equal(oModel.setProperty("/_hiddenObjects/0/value", "hidden1"), true, "Property of hidden element set");

	// context not given
	assert.equal(oModel.setProperty("value", "hello"), false, "Property not set, because it is not resolvable without a context");

	// context given
	var oContext = oModel.getContext("/");
	assert.equal(oModel.setProperty("value", "hello1", oContext), true, "Property set, because context is resolvable");
	assert.equal(oModel.getProperty("value", oContext), "hello1", "Property has correct value, because context is resolvable");
});

QUnit.test("ManagedObject Model  - Property Binding - Registration and Housekeeping", function(assert) {
	var oModel = this.oManagedObjectModel;
	var fnPropertyChangeHandler = function() {
		assert.equal(false, true, "Binding change fired unexpected");
	};
	// create a property binding with a relative path
	var oRootObject = oModel.getRootObject();

	oRootObject.bindProperty("value",{path:"stringValue"});
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		properties: ["stringValue"]
	}),false,"The 'stringValue' property is not observed");
	oRootObject.setModel(oModel);
	assert.equal(oModel._oObserver.isObserved(oRootObject, {
		properties: ["stringValue"]
	}),false,"The 'stringValue' property is not observed");
	oRootObject.setBindingContext(oModel.getContext("/"));
	assert.equal(oModel._oObserver.isObserved(oRootObject, {
				properties: ["stringValue"]
			}),true,"The 'stringValue' property is observed");
	assert.equal(oModel._mObservedCount.properties["myObject/@stringValue"], 1, "1 binding after there context is set for 'myObject/@stringValue'");

	// create a property binding with an absolute path
	var oBinding1 = oModel.bindProperty("/value");
	assert.equal(oModel._oObserver.isObserved(oRootObject, {
		properties: ["value"]
	}),false,"The 'value' property is not observed");
	assert.equal(oModel._mObservedCount.properties["myObject/@value"], undefined, "No binding is stored for 'myObject/@value'");
	// adding a change handler causes the addBinding call on the model. This will add the change handler.
	oBinding1.attachChange(fnPropertyChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oRootObject, {
		properties: ["value"]
	}),true,"The 'value' property is observed");
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
		properties: ["value"]
	}),true,"The 'value' property is still observed");
	assert.equal(oModel._mObservedCount.properties["myObject/@value"], 1, "1 binding is stored for 'myObject/@value'");
	//detach the last change handler, now the model should not have any internal handlers to the _change
	oBinding1.detachChange(fnPropertyChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oRootObject, {
		properties: ["value"]
	}),false,"The 'value' property is not observed");
	assert.equal(oModel._mObservedCount.properties["myObject/@value"], undefined, "No binding is stored for 'myObject/@value'");
});

QUnit.test("ManagedObject Model  - Single Aggregation Binding - Registration and Housekeeping", function(assert) {
	var oModel = this.oManagedObjectModel;
	var fnAggregationChangeHandler = function() {
		assert.equal(true, false, "Binding change fired unexpected");
	};
	// create a aggregation binding
	var oBinding1 = oModel.bindAggregation("/singleAggr");
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["singleAggr"]
	}),false,"The 'singleAggr' aggregation is not observed");
	assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], undefined , "No bindings are stored for 'myObject/@singleAggr'");

	// adding a change handler causes the addBinding call on the model. This will add the change handler.
	oBinding1.attachChange(fnAggregationChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["singleAggr"]
	}),true,"The 'singleAggr' aggregation is observed");
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
		aggregations: ["singleAggr"]
	}),true,"The 'singleAggr' aggregation is still observed");
	// detach the last change handler, now the model should not have any internal handlers to the _change
	oBinding1.detachChange(fnAggregationChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["singleAggr"]
	}),false,"The 'singleAggr' aggregation is not observed");
	assert.equal(oModel._mObservedCount.aggregations["myObject/@singleAggr"], undefined , "No bindings are stored for 'myObject/@singleAggr'");
});

QUnit.test("ManagedObject Model  - Multi Aggregation Binding - Registration and Housekeeping", function(assert) {
	var oModel = this.oManagedObjectModel;
	var fnAggregationChangeHandler = function() {
		assert.equal(true, false, "Binding change fired unexpected");
	};
	// create a aggregation binding
	var oBinding1 = oModel.bindAggregation("/subObjects");
	// as there is no change handler attached to the property binding, the handler is not yet registerd
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["subObjects"]
	}),false,"The 'subObjects' aggregation is not observed");
	assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], undefined , "No bindings are stored for 'myObject/@subObjects'");
	// adding a change handler causes the addBinding call on the model. This will add the change handler.
	oBinding1.attachChange(fnAggregationChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["subObjects"]
	}),true,"The 'subObjects' aggregation is observed");
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
		aggregations: ["subObjects"]
	}),true,"The 'subObjects' aggregation is still observed");
	// detach the last change handler, now the model should not have any internal handlers to the _change
	oBinding1.detachChange(fnAggregationChangeHandler);
	assert.equal(oModel._oObserver.isObserved(oModel._oObject, {
		aggregations: ["subObjects"]
	}),false,"The 'subObjects' aggregation is not observed");
	assert.equal(oModel._mObservedCount.aggregations["myObject/@subObjects"], undefined , "No bindings are stored for 'myObject/@subObjects'");
});

QUnit.test("ManagedObject Model  - Property Binding - Value Checks", function(assert) {

	var oModel = this.oManagedObjectModel;

	assert.equal(oModel.getProperty("/value"), "", "Property exists and has default value");

	var sExpectedValue = "hello"
	var fnPropertyChangeHandler = function() {
		assert.equal(oPropertyBinding.getValue(), sExpectedValue, "Binding change event fired for property value with " + sExpectedValue);
	};
	var oPropertyBinding = oModel.bindProperty("/value");
	oPropertyBinding.attachChange(fnPropertyChangeHandler);


	assert.equal(oModel.setProperty("/value", "hello"), true, "Property set");
	// TODO: Do this for all properties
	assert.equal(oModel.getProperty("/@className"), "sap.ui.test.TestElement", "Classname checked");
	assert.equal(oModel.getProperty("/value/@bound"), false, "Value property is not bound");

	var oControl = oModel.getRootObject();
	oControl.bindProperty("stringValue", {path:"/value"});
	oControl.setModel(oModel);
	assert.equal(oModel.getProperty("/stringValue/@bound"), true, "stringValue property is bound");

	sExpectedValue = "value";
	oControl.setValue("value");
	assert.equal(oControl.getStringValue(), "value", "stringValue property is updated");

	sExpectedValue = "fromStringValue";
	oControl.setStringValue("fromStringValue"); // causes binding change

	var oBindingInfo = oModel.getProperty("/stringValue/@bindingInfo");

	assert.equal(oBindingInfo.binding.getPath(), "/value", "BindingInfo contains correct path");
	assert.equal(oBindingInfo.binding.getPath(), oModel.getProperty("/stringValue/@binding/getPath"), "BindingInfo contains correct path");
	assert.equal(oBindingInfo.binding.getPath(), oModel.getProperty("/stringValue/@bindingInfo/binding/getPath"), "BindingInfo contains correct path");
	var oBindingInfoBinding = oModel.bindProperty("/stringValue/@bindingInfo");
	oBindingInfoBinding.attachChange(function() {
		iCount++;
	});
	var iCount = 0;
	oControl.bindProperty("stringValue", {path:"/booleanValue", type:"sap.ui.model.type.Boolean"});
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
	oPropertyBinding.attachChange(function() {
		assert.equal(false, true, "Error: This should never be called for a property that does not exist");
	});
	assert.equal(oModel.setProperty("/notExist", "hello"), false, "Property not set");
	oPropertyBinding.checkUpdate();

});


QUnit.test("ManagedObject Model  - Aggregation Access", function(assert) {
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
	assert.equal(jQuery.isArray(oResult), true, "Access a multi aggregation that is not set is empty array");
});


QUnit.test("ManagedObject Model  - Aggregation Binding", function(assert) {
	assert.equal(this.oManagedObjectModel.getAggregation("/singleAggr"), null, "Access a single aggregation that is not set");
	var oBinding = this.oManagedObjectModel.bindAggregation("/singleAggr");
	var that = this;
	var fHandler = function() {
		assert.equal(oBinding.getValue() === that.subObj, true, "Binding change event fired for single aggregation");
		oBinding.detachChange(fHandler);
	};
	oBinding.attachChange(fHandler);
	this.obj.setSingleAggr(this.subObj);

	// check that no additional event is called
	assert.equal(this.oManagedObjectModel.getProperty("/singleAggr"), this.subObj, "Aggregation can be accessed");

	// bind to an aggregation that does not exist
	var oBinding = this.oManagedObjectModel.bindAggregation("/notExist");
	assert.equal(oBinding.getPath(), "/notExist", "Binding path is correctly set for aggregation binding");
});


QUnit.test("ManagedObject Model  - List Binding", function(assert) {
	assert.equal(this.oManagedObjectModel.getAggregation("/subObjects").length === 0, true, "Access a multi aggregation that is not set");
	var oBinding = this.oManagedObjectModel.bindList("/subObjects"),
		oLengthBinding = this.oManagedObjectModel.bindProperty("/subObjects/@length"),
		that = this,
		iCount = 1,
		iCalls = 0,
		fHandler = function() {
			iCalls++;
		},
		fHandler2 = function() {
			assert.equal(oLengthBinding.getValue(), iLength, "Length binding called correctly");
		};
	oLengthBinding.attachChange(fHandler2);
	oBinding.attachChange(fHandler);

	iLength = 1;
	this.obj.addSubObj(this.subObj);
	assert.equal(iCalls, iCount, "Binding change event fired for list aggregation");
	assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Contexts are correctly applied");

	iCount = 1;
	iLength = 1;
	this.obj.addSubObj(this.subObj);
	assert.equal(iCalls, iCount, "Change event called " + iCount + " as expected, remove, add");
	assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Contexts are correctly applied");

	iCount = 2;
	iLength = 2;
	this.subObj2 = new sap.ui.test.TestElement("subObject1");
	this.obj.addSubObj(this.subObj2);
	assert.equal(iCalls, iCount, "Change event called " + iCount + " as expected");
	assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Contexts are correctly applied");
	assert.equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[1]) === that.subObj2, true, "Contexts are correctly applied");

	iCount = 4;
	iIndex = 1;
	iLength = 1;

	this.obj.removeSubObj(this.subObj2);
	iLength = 2;
	this.obj.insertSubObj(this.subObj2, 0);
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


QUnit.test("ManagedObject Model - getManagedObject", function(assert) {
	var oModel = this.oManagedObjectModel;

	function createContext(sPath) {
		return new sap.ui.model.Context(oModel, sPath);
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


QUnit.test("ManagedObjectModel - Custom Data", function(assert) {
	var sCustomDataPath = "/@custom";

	assert.equal(this.oManagedObjectModel.setProperty(sCustomDataPath + "/abc", "value abc"), true, "Property abc set as custom data");
	assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value abc", "Property abc is 'value abc' in custom data with absolute path");
	var oCustomContext = this.oManagedObjectModel.createBindingContext(sCustomDataPath);
	assert.equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value abc", "Property abc is 'value abc' in custom data with context");
	assert.equal(this.oManagedObjectModel.setProperty("abc", "value 2 abc", oCustomContext), true, "Property abc set to 'value 2 abc' in custom data with context");
	assert.equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value 2 abc", "Property abc is 'value 2 abc' in custom data with context");
	this.oManagedObjectModel.setData({xyz: "value xyz"}, true);
	assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value 2 abc", "Property abc is still 'value 2 abc' in custom data with absolute path after merged setData");
	assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "value xyz", "Property xyz is 'value xyz' in custom data with absolute path after merged setData");
	this.oManagedObjectModel.setData({def: "value def"});
	assert.equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/def"), "value def", "Property def is 'value def' in custom data with absolute path after setData");
	assert.ok(!this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "Property xyz not available after setData");
	assert.equal(this.oManagedObjectModel.getJSON(), "{\"def\":\"value def\"}", "getJSON returns the stringified custom data");
});

QUnit.test("ManagedObjectModel - Generic Testing for sap.m Controls", function(assert) {
	sap.ui.getCore().loadLibrary("sap.m");
	assert.equal(true, true, "Not activted");
	return;
	// this generic test loops over all controls in sap.m and checks whether a property binding in the model causes a change.
	// currently there are some controls and properties backlisted.

	// test values for types
	// maybe we can cover more types
	var mTestProperties = {
		"string" : ["", "\\", "{}","ÄÖÜß"],
		"boolean" : [true, false],
		"int" : [1, 2, 1000000000000],
		"float" : [1.1, 2, 1000000000000.000000001]
	}
	var mBlackList = {
		"sap.m.DatePicker" : {
			"displayFormatType": true
		},
		"sap.m.DateTimeInput" : {
			"valueFormat": true
		},
		"sap.m.TimePicker" : {
			"localeId": true
		},
		"sap.m.TimePickerSlider" : {
			"selectedValue": true
		},
		"sap.m.UploadCollection": {
			"noDataText" : true,
			"noDataDescription": true,
			"instantUpload": true
		},
		"sap.m.TableSelectDialog": {
			"noDataText" : true
		},
		"sap.m.FeedContent": {
			"contentText" : true
		},
		"sap.m.MaskInput": {
			"placeholderSymbol" : true
		},
		"sap.m.NewsContent": {
			"contentText" : true
		},
		"sap.m.NewsContent": {
			"contentText" : true
		},
		"sap.m.SplitContainer": {
			"masterButtonText" : true,
			"backgroundOpacity" : [0,0.5,0.9,1]
		},
		"sap.m.Input": {
			"selectedKey" : true
		},
		"sap.m.Select": {
			"selectedItemId" : true
		},
		"sap.m.SelectList": {
			"selectedItemId" : true
		},
		"sap.m.ComboBox": {
			"selectedItemId" : true
		},
		"sap.m.SelectDialog": {
			"noDataText" : true
		},
		"sap.m.SegmentedButton": {
			"selectedKey" : true
		},
		"sap.m.ListBase": {
			"noDataText" : true
		},
		"sap.m.IconTabBar": {
			"selectedKey" : true,
			"showSelection" : true
		},
		"sap.m.GrowingList": {
			"triggerText" : true,
			"scrollToLoad" : true,
			"threshold": true
		},
		"sap.m.GenericTile": {
			"header" : true
		},
		"sap.m.Carousel": {
			"showBusyIndicator" : true
		},
		"sap.m.App": {
			"backgroundOpacity" : [0,0.5,0.9,1]
		},
		"sap.m.Shell": {
			"backgroundOpacity" : [0,0.5,0.9,1]
		},
		"sap.m._overflowToolbarHelpers.OverflowToolbarAssociativePopover" : true, // not processed at all
		"sap.m.HeaderContainerItemContainer" : true, // not processed at all
		"sap.m.TimePickerSliders" : true // not processed at all
	};

	// get the controls from sap.m
	var oLib = sap.ui.getCore().getLoadedLibraries()["sap.m"],
		aControls = oLib.controls;

	for (var i = 0; i < aControls.length; i++) {
		var sControlName = aControls[i];

		if (sControlName in mBlackList && mBlackList[sControlName] === true) {
			continue;
		}

		jQuery.sap.require(sControlName);
		var oControl = new (jQuery.sap.getObject(sControlName));
		var oModel = new sap.ui.model.base.ManagedObjectModel(oControl);
		var iBindingCount = 0;
		var mProperties = oControl.getMetadata().getProperties();
		for (var n in mProperties) {
			var oProperty = mProperties[n],
				aTestValues = mTestProperties[oProperty.type];
			if (sControlName in mBlackList) {
				if (mBlackList[sControlName][n] === true) {
					continue;
				} else if (mBlackList[sControlName][n]) {
					aTestValues = mBlackList[sControlName][n]
				}
			}
			var iCount = 0;
			var oBinding = oModel.bindProperty("/" + n);
			oModel.addBinding(oBinding);
			oBinding.attachChange(function(oEvent) {
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

		}
		assert.equal(oModel.aBindings.length, iBindingCount, iBindingCount + " Bindings are available in the model ");
		oModel.destroy();
		assert.equal(oModel.aBindings.length, 0, "No more bindings after destroy");
	}

});

QUnit.test("ManagedObjectModel - Marker interface sap.ui.core.IDScope handling", function(assert) {
	var sContent = sView = jQuery('#view').html();

	var oView = sap.ui.xmlview({
		viewContent: sView
	});

	sinon.spy(oView, "byId");

	var sIdPrefix = oView.getId() + "--";

	var oManagedObjectModel = new sap.ui.model.base.ManagedObjectModel(oView);

	var oButton1 = oManagedObjectModel.getProperty("/#button1");

	assert.ok(oButton1, "There is a button");
	assert.equal(oButton1.getId(),sIdPrefix + "button1","We get the button");
	ok(oView.byId.called, "As the view has the marker interface sap.ui.core.IDScope the byId method is called");

	var oButton2 = oView.byId("button2");
	var sText = oManagedObjectModel.getProperty("/#button2/text");
	assert.equal(sText, oButton2.getText(), "We get the buttons text");

	var oPanel = oManagedObjectModel.getProperty("/#panel");

	assert.ok(oPanel, "There is a panel");
	assert.equal(oPanel.getId(),sIdPrefix + "panel","We get the correct panel");
});

