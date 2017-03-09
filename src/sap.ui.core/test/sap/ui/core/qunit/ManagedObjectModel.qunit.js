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
	setup: function() {
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
	teardown: function() {
		this.obj.destroy();
		this.obj = null;
	}
});

// check default settings
QUnit.test("Create a ManagedObject Model - Property Access", function(assert) {
	if (!this.obj._attachModifyAggregation) {
		// not checked in from core side
		equal(true, true, "Core does not yet support _attachModifyAggregation'");
		return;
	}

	// Check special handling for id property
	equal(this.oManagedObjectModel.getProperty("/@id"), "myObject", "ID must be 'myObject'");

	// access non existing
	equal(this.oManagedObjectModel.getProperty("/abc"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/abc/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/@id/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/value/def"), null, "Property does not exist");

	equal(this.oManagedObjectModel.getProperty("/stringValue/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/floatValue/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/intValue/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/stringArray/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/floatArray/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/intArray/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/booleanArray/def"), null, "Property does not exist");
	equal(this.oManagedObjectModel.getProperty("/objectValue/def"), null, "Property does not exist");

	// access existing with default values
	equal(this.oManagedObjectModel.getProperty("/value"), "", "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/stringValue"), "", "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/floatValue"), 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/intValue"), 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/stringArray").length, 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/floatArray").length, 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/intArray").length, 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/booleanArray").length, 0, "Property exists and has default value");
	equal(this.oManagedObjectModel.getProperty("/objectValue"), null, "Property exists and has default value");

	// set properties with absolute path
	equal(this.oManagedObjectModel.setProperty("/value", "hello"), true, "Property set");
	equal(this.oManagedObjectModel.getProperty("/value"), "hello", "Property exists and has new value");
	equal(this.oManagedObjectModel.setProperty("/abc", "hello"), false, "Property not set, because it does not exist");
	equal(this.oManagedObjectModel.getProperty("/abc"), null, "Property does not exist");
	equal(this.oManagedObjectModel.setProperty("value", "hello"), false, "Property not set, because it is not resolvable");

	//Access property of hidden aggregation
	equal(this.oManagedObjectModel.setProperty("/_hiddenObjects/0/value", "hidden"), true, "Property of hidden element set");

	equal(this.oManagedObjectModel.setProperty("value", "hello"), false, "Property not set, because it is not resolvable");

	//TODO: Do the above for several types
});


QUnit.test("ManagedObject Model  - Property Binding", function(assert) {
	equal(this.oManagedObjectModel.getProperty("/value"), "", "Property exists and has default value");
	var oPropertyBinding = this.oManagedObjectModel.bindProperty("/value");
	oPropertyBinding.attachChange(function() {
		equal(oPropertyBinding.getValue(), "hello", "Binding change event fired for property");
	});
	equal(this.oManagedObjectModel.setProperty("/value", "hello"), true, "Property set");
	//TODO: Do this for all properties
	equal(this.oManagedObjectModel.getProperty("/@className"), "sap.ui.test.TestElement", "Classname checked");
	equal(this.oManagedObjectModel.getProperty("/@asdasdasd"), null, "Not existing special node checked");

	equal(this.oManagedObjectModel.getProperty("value"), null, "No context and relative path");
});


QUnit.test("ManagedObject Model  - Aggregation Access", function(assert) {
	equal(this.oManagedObjectModel.getAggregation("/content"), null, "Access none existing aggregation is null");
	equal(this.oManagedObjectModel.getAggregation("/content/another/not/existing"), null, "Access none existing aggregation is null");
	equal(this.oManagedObjectModel.getAggregation("/singleAggr"), null, "Access a single aggregation that is not set");
	equal(this.oManagedObjectModel.getProperty("/singleAggr/length"), null, "Length or empty single aggregation");

	equal(this.oManagedObjectModel.getAggregation("/_hiddenObjects/@length"), 1, "Access length of hidden aggreggation");
	equal(this.oManagedObjectModel.getAggregation("/_hiddenObjects")[0].getId(), this.hiddenObject.getId(), "Access element of hidden aggreggation");

	equal(this.oManagedObjectModel.getProperty("/subObjects/length"), 0, "Length of empty aggregation");
	equal(this.oManagedObjectModel.getProperty("/subObjects/@length"), 0, "Property does not exist");

	var oResult = this.oManagedObjectModel.getAggregation("/subObjects");
	equal(oResult.length, 0, "Access a multi aggregation that is not set is empty array");
	equal(jQuery.isArray(oResult), true, "Access a multi aggregation that is not set is empty array");
});


QUnit.test("ManagedObject Model  - Aggregation Binding", function(assert) {
	equal(this.oManagedObjectModel.getAggregation("/singleAggr"), null, "Access a single aggregation that is not set");
	var oBinding = this.oManagedObjectModel.bindAggregation("/singleAggr");
	var that = this;
	var fHandler = function() {
		equal(oBinding.getValue() === that.subObj, true, "Binding change event fired for single aggregation");
		oBinding.detachChange(fHandler);
	};
	oBinding.attachChange(fHandler);
	this.obj.setSingleAggr(this.subObj);

	//check that no additional event is called
	equal(this.oManagedObjectModel.setProperty("/value", "hello"), true, "Property set");
});


QUnit.test("ManagedObject Model  - List Binding", function(assert) {
	equal(this.oManagedObjectModel.getAggregation("/subObjects").length === 0, true, "Access a multi aggregation that is not set");
	var oBinding = this.oManagedObjectModel.bindList("/subObjects");
	var oLengthBinding = this.oManagedObjectModel.bindProperty("/subObjects/@length");
	var that = this;
	var iCount = 1;
	var iCalls = 0;
	var fHandler = function() {
		iCalls++;
	};
	var fHandler2 = function() {
		equal(oLengthBinding.getValue(), iLength, "Lengthbinding called correctly");
	};

	oLengthBinding.attachChange(fHandler2);

	oBinding.attachChange(fHandler);
	iLength = 1;
	this.obj.addSubObj(this.subObj);
	equal(iCalls, iCount, "Binding change event fired for list aggregation");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Binding change event fired for list aggregation");

	iCount = 3;
	iLength = 1;
	this.obj.addSubObj(this.subObj);
	equal(iCalls, iCount, "Change event called " + iCount + " as expected, remove, add");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Binding change event fired for list aggregation");

	iCount = 4;
	iLength = 2;
	this.subObj2 = new sap.ui.test.TestElement("subObject1");
	this.obj.addSubObj(this.subObj2);
	equal(iCalls, iCount, "Change event called " + iCount + " as expected");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj, true, "Binding change event fired for list aggregation");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[1]) === that.subObj2, true, "Binding change event fired for list aggregation");

	iCount = 6;
	iIndex = 1;
	iLength = 1;

	this.obj.removeSubObj(this.subObj2);
	iLength = 2;
	this.obj.insertSubObj(this.subObj2, 0);
	equal(iCalls, iCount, "Change event called " + iCount + " as expected");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[1]) === that.subObj, true, "Binding change event fired for list aggregation");
	equal(that.oManagedObjectModel.getProperty("", oBinding.getContexts()[0]) === that.subObj2, true, "Binding change event fired for list aggregation");

	//check that no additional event is called
	equal(this.oManagedObjectModel.setProperty("/value", "hello"), true, "Property set");
	equal(this.oManagedObjectModel.getProperty("/subObjects/0/@className"), "sap.ui.test.TestElement", "Classname checked");
	equal(this.oManagedObjectModel.getProperty("/subObjects/1/@className"), "sap.ui.test.TestElement", "Classname checked");

	equal(this.oManagedObjectModel.getProperty("/subObjects/@id=subObject1/@className"), "sap.ui.test.TestElement", "Classname checked with id");

	equal(this.oManagedObjectModel.getProperty("subObjects/@id=subObject1/@className", this.obj), "sap.ui.test.TestElement", "Classname checked with element context");
	oBinding.getContexts()[1].sPath = "";
	equal(this.oManagedObjectModel.getProperty("abc", oBinding.getContexts()[1]), null, "BindingContext with none resolvable relative path");
	oBinding.detachChange(fHandler);
	oLengthBinding.detachChange(fHandler2);
});


QUnit.test("ManagedObject Model - getManagedObject", function(assert) {
	var oModel = this.oManagedObjectModel;

	function createContext(sPath) {
		return new sap.ui.model.Context(oModel, sPath);
	}

	ok(oModel.getManagedObject() === this.obj, "getManagedObject() returns the root of the control tree model");

	equal(oModel.getManagedObject("/subObjects/0"), null, "PATH: Path to single entry of empty multiple Aggregation");
	equal(oModel.getManagedObject("/singleAggr"), null, "PATH: Path to empty single Aggregation");
	equal(oModel.getManagedObject("/doesNotExist"), null, "PATH: Invalid Path");
	this.obj.addSubObj(this.subObj);
	this.obj.setSingleAggr(this.subObj2);
	ok(oModel.getManagedObject("/singleAggr") === this.subObj2, "PATH: Path to single Aggregation");
	equal(oModel.getManagedObject("/subObjects"), null, "PATH: Path to multiple Aggregation");
	ok(oModel.getManagedObject("/subObjects/0") === this.subObj, "PATH: Path to single entry of multiple Aggregation");
	equal(oModel.getManagedObject("/subObjects/0/value"), null, "PATH: Path to Property");

	this.obj.removeSubObj(this.subObj);
	this.obj.setSingleAggr(null);
	this.subObj2.addSubObj(this.subObj3);

	equal(oModel.getManagedObject(createContext("/subObjects/0")), null, "CONTEXT: Path to single entry of empty multiple Aggregation");
	equal(oModel.getManagedObject(createContext("/singleAggr")), null, "CONTEXT: Path to empty single Aggregation");
	equal(oModel.getManagedObject(createContext("/doesNotExist")), null, "CONTEXT: Invalid Path");
	this.obj.addSubObj(this.subObj);
	this.obj.setSingleAggr(this.subObj2);
	ok(oModel.getManagedObject(createContext("/singleAggr")) === this.subObj2, "CONTEXT: Path to single Aggregation");
	equal(oModel.getManagedObject(createContext("/subObjects")), null, "CONTEXT: Path to multiple Aggregation");
	ok(oModel.getManagedObject(createContext("/subObjects/0")) === this.subObj, "CONTEXT: Path to single entry of multiple Aggregation");
	equal(oModel.getManagedObject(createContext("/subObjects/0/value")), null, "CONTEXT: Path to Property");

	ok(oModel.getManagedObject("subObjects/0", createContext("/singleAggr")) === this.subObj3, "CONTEXT + PATH: Path to single entry of multiple Aggregation");
});


QUnit.test("ManagedObjectModel - Custom Data", function(assert) {
	var sCustomDataPath = "/@custom";

	equal(this.oManagedObjectModel.setProperty(sCustomDataPath + "/abc", "value abc"), true, "Property abc set as custom data");
	equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value abc", "Property abc is 'value abc' in custom data with absolute path");
	var oCustomContext = this.oManagedObjectModel.createBindingContext(sCustomDataPath);
	equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value abc", "Property abc is 'value abc' in custom data with context");
	equal(this.oManagedObjectModel.setProperty("abc", "value 2 abc", oCustomContext), true, "Property abc set to 'value 2 abc' in custom data with context");
	equal(this.oManagedObjectModel.getProperty("abc", oCustomContext), "value 2 abc", "Property abc is 'value 2 abc' in custom data with context");
	this.oManagedObjectModel.setData({xyz: "value xyz"}, true);
	equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/abc"), "value 2 abc", "Property abc is still 'value 2 abc' in custom data with absolute path after merged setData");
	equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "value xyz", "Property xyz is 'value xyz' in custom data with absolute path after merged setData");
	this.oManagedObjectModel.setData({def: "value def"});
	equal(this.oManagedObjectModel.getProperty(sCustomDataPath + "/def"), "value def", "Property def is 'value def' in custom data with absolute path after setData");
	ok(!this.oManagedObjectModel.getProperty(sCustomDataPath + "/xyz"), "Property xyz not available after setData");
	equal(this.oManagedObjectModel.getJSON(), "{\"def\":\"value def\"}", "getJSON returns the stringified custom data");
});