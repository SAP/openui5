/*global QUnit, sinon */
sap.ui.define([
	"./data/JSONModelFakeService",
	"sap/m/Label",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/core/date/UI5Date",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/Context",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function (fakeService, Label, List, ListItem, UI5Date, VerticalLayout, Context, JSONModel, jQuery) {
	"use strict";

	QUnit.module("sap.ui.model.json.JSONModel", {
		afterEach: function () {
			if (this.oModel) {
				this.oModel.destroy();
			}
			if (this.oLabel) {
				this.oLabel.destroy();
			}
		},
		/**
		 * Gets the default model and a label having the model set as default model.
		 * @returns {Object<sap.m.Label|sap.ui.model.json.JSONModel>}
		 *   An object with the properties "oModel" and "oLabel" containing the created model and label
		 */
		createModelAndLabel() {
			const oModel = this.createModel();
			const oLabel = new Label({text: "testText"});
			oLabel.setModel(oModel);
			this.oLabel = oLabel;

			return {oLabel, oModel};
		},
		/**
		 * Gets the default JSON model.
		 * @returns {sap.ui.model.json.JSONModel} The model
		 */
		createModel() {
			this.oModel = new JSONModel({
				additionalData: {
					level1: {
						text: "level1",
						level2: {text: "level2"}
					}
				},
				rootproperty: "test1",
				teamMembers: [
					{firstName: "Andreas", lastName: "Klark"},
					{firstName: "Peter", lastName: "Miller"},
					{firstName: "Gina", lastName: "Rush"},
					{firstName: "Steave", lastName: "Ander"},
					{firstName: "Michael", lastName: "Spring"},
					{firstName: "Marc", lastName: "Green"},
					{firstName: "Frank", lastName: "Wallace"}
				]
			});
			return this.oModel;
		}
	});

	QUnit.test("test model setData", function(assert) {
		var obj1 = {a:true, b:false, c:false},
			obj2 = {c:true, d:false},
			objMerged = {a:true, b:false, c:true, d:false},
			arr1 = ["a", "b", "c"],
			arr2 = ["d", "e"],
			arrMerged = ["d", "e", "c"];
		var oModel = new JSONModel();
		oModel.setData(obj1);
		oModel.setData(obj2);
		assert.deepEqual(oModel.getData(), obj2, "setData object without merge");
		oModel.setData(obj1);
		oModel.setData(obj2, true);
		assert.deepEqual(oModel.getData(), objMerged, "setData object with merge");
		oModel.setData(arr1);
		oModel.setData(arr2);
		assert.deepEqual(oModel.getData(), arr2, "setData array without merge");
		oModel.setData(arr1);
		oModel.setData(arr2, true);
		assert.deepEqual(oModel.getData(), arrMerged, "setData array with merge");
		oModel.destroy();
	});

	QUnit.test("test model observation", function(assert) {
		var oData = {
			obj: {
				name1: "value1",
				name2: "value2",
				name3: "value3"
			},
			arr: [
				{ name: "value1" },
				{ name: "value2" },
				{ name: "value3" }
			],
			string: "abc123",
			number: 123,
			bool: true,
			func: function() {},
			date: UI5Date.getInstance(2022, 0, 1)
		};
		var oModel = new JSONModel(oData, true),
			oString = oModel.bindProperty("/string"),
			oNumber = oModel.bindProperty("/number"),
			oBool = oModel.bindProperty("/bool"),
			oDate = oModel.bindProperty("/date"),
			oObj = oModel.bindProperty("/obj"),
			oObjName = oModel.bindProperty("/obj/name1"),
			oArr = oModel.bindProperty("/arr"),
			oArrName = oModel.bindProperty("/arr/0/name"),
			bString = false,
			bNumber = false,
			bBool = false,
			bDate = false,
			bObj = false,
			bObjName = false,
			bArr = false,
			bArrName = false,
			iChangeCount = 0;

		oString.attachChange(function(){bString = true; iChangeCount++;});
		oNumber.attachChange(function(){bNumber = true; iChangeCount++;});
		oBool.attachChange(function(){bBool = true; iChangeCount++;});
		oDate.attachChange(function(){bDate = true; iChangeCount++;});
		oObj.attachChange(function(){bObj = true; iChangeCount++;});
		oObjName.attachChange(function(){bObjName = true; iChangeCount++;});
		oArr.attachChange(function(){bArr = true; iChangeCount++;});
		oArrName.attachChange(function(){bArrName = true; iChangeCount++;});

		assert.equal(typeof oData.obj, "object", "JSON object");
		assert.equal(Array.isArray(oData.arr), true, "JSON array");
		assert.equal(typeof oData.string, "string", "JSON string");
		assert.equal(typeof oData.number, "number", "JSON number");
		assert.equal(typeof oData.bool, "boolean", "JSON boolean");
		assert.equal(typeof oData.func, "function", "JSON function");
		assert.equal(oData.date instanceof Date, true, "JSON Date");

		assert.equal(oString.getValue(), "abc123", "String old value");
		oData.string = "def456";
		assert.equal(oString.getValue(), "def456", "String new value");
		assert.ok(bString, "String change event fired");

		assert.equal(oNumber.getValue(), 123, "Number old value");
		oData.number = 456;
		assert.equal(oNumber.getValue(), 456, "Number new value");
		assert.ok(bNumber, "Number change event fired");

		assert.equal(oBool.getValue(), true, "Boolean old value");
		oData.bool = false;
		assert.equal(oBool.getValue(), false, "Boolean new value");
		assert.ok(bBool, "Boolean change event fired");

		const oModelValue = oData.date;
		assert.strictEqual(oDate.getValue(), oModelValue, "Binding and model values are same");
		assert.strictEqual(oModelValue.getFullYear(), 2022, "Year of old model value is 2022");
		const oNewModelValue = UI5Date.getInstance(2024, 1, 3);
		oData.date = oNewModelValue;
		assert.strictEqual(oData.date, oNewModelValue, "Model value: " + oData.date + ", expected: " + oNewModelValue);
		assert.strictEqual(oDate.getValue(), oNewModelValue,
			"Binding value: " + oDate.getValue() + ", expected: " + oNewModelValue);
		assert.ok(bDate, "Date change event fired");

		assert.equal(oObj.getValue(), oData.obj, "Object old value");
		assert.equal(oObjName.getValue(), "value1", "Object name old value");
		oData.obj = { name1 : "other1" };
		assert.equal(oObj.getValue(), oData.obj, "Object new value");
		assert.equal(oObjName.getValue(), "other1", "Object name new value");
		assert.ok(bObj, "Object change event fired");
		assert.ok(bObjName, "Object name change event fired");

		assert.equal(oArr.getValue(), oData.arr, "Array old value");
		assert.equal(oArrName.getValue(), "value1", "Array name old value");
		oData.arr = [{ name : "other1" }];
		assert.equal(oArr.getValue(), oData.arr, "Array new value");
		assert.equal(oArrName.getValue(), "other1", "Array name new value");
		assert.ok(bArr, "Array change event fired");
		assert.ok(bArrName, "Array name change event fired");

		assert.equal(iChangeCount, 8, "All 8 change handlers have been called once");
		oModel.destroy();
	});

	QUnit.test("test model getProperty", function(assert) {
		const oModel = this.createModel();
		var value = oModel.getProperty("/teamMembers/6/lastName");
		assert.equal(value, "Wallace", "model value");
		value = oModel.getProperty("/rootproperty");
		assert.equal(value, "test1", "model value");
	});

	QUnit.test("test model getProperty with context", function(assert) {
		const oModel = this.createModel();
		var oContext = oModel.createBindingContext("/teamMembers");
		var value = oModel.getProperty("6/lastName", oContext);
		assert.equal(value, "Wallace", "model value");
		value = oModel.getProperty("/rootproperty");
		assert.equal(value, "test1", "model value");
	});

	QUnit.test("test model setProperty", function(assert) {
		const oModel = this.createModel();
		oModel.setProperty("/teamMembers/4/lastName", "Jackson");
		var value = oModel.getProperty("/teamMembers/4/lastName");
		assert.equal(value, "Jackson", "model value");
		oModel.setProperty("/rootproperty", "test2");
		value = oModel.getProperty("/rootproperty");
		assert.equal(value, "test2", "model value");
	});

	QUnit.test("test model setProperty on root", function(assert) {
		var oModel = new JSONModel({a:1}),
			oTest = {b:2};
		oModel.setProperty("/", oTest);
		assert.equal(oModel.getData(), oTest, "model data changed");
		oModel.destroy();
	});

	QUnit.test("test model setProperty with context", function(assert) {
		const oModel = this.createModel();
		var oContext = oModel.createBindingContext("/teamMembers");
		oModel.setProperty("4/lastName", "Smith", oContext);
		var value = oModel.getProperty("/teamMembers/4/lastName");
		assert.equal(value, "Smith", "model value");
		oModel.setProperty("/rootproperty", "test3", oContext);
		value = oModel.getProperty("/rootproperty");
		assert.equal(value, "test3", "model value");
	});

	QUnit.test("test getProperty on label", function(assert) {
		const {oLabel} = this.createModelAndLabel();
		assert.equal(oLabel.getText(),"testText", "old text value");
		oLabel.bindProperty("text", "/teamMembers/4/firstName");
		assert.equal(oLabel.getText(), "Michael", "text value from model");
	});

	QUnit.test("test model setProperty onlabel", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		oLabel.setText("test");
		assert.equal(oLabel.getText(),"test", "old text value");
		oLabel.bindProperty("text", "/teamMembers/1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/teamMembers/1/firstName", "Petre");
		assert.equal(oLabel.getText(), "Petre", "new text value from model");
	});

	QUnit.test("test model setProperty with invalid bindingContext and relative path", function(assert) {
		const oModel = this.createModel();
		var oContext = oModel.createBindingContext("/teamMembers/HorstDerGrosse");
		oModel.setProperty("firstName", "Peter", oContext);
		assert.expect(0);
	});

	QUnit.test("test model setProperty onlabel with bindingContext and relative path", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		var oContext = oModel.createBindingContext("/teamMembers");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("1/firstName", "Petri", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petri", "new text value from model");
	});
	/** @deprecated As of version 1.88.0, reason Model.prototype.setLegacySyntax */
	QUnit.test("test model setProperty onlabel with bindingContext and relative path (legacySyntax = true)", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		oModel.setLegacySyntax(true);
		var oContext = oModel.createBindingContext("/teamMembers");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("1/firstName", "Petro", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petro", "new text value from model");
		oModel.setLegacySyntax(false);
	});
	/** @deprecated As of version 1.88.0, reason Model.prototype.setLegacySyntax */
	QUnit.test("test model setProperty onlabel without bindingContext and relative path (legacySyntax = true)", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		oModel.setLegacySyntax(true);
		oLabel.setBindingContext(undefined);
		oLabel.bindProperty("text", "teamMembers/1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("teamMembers/1/firstName", "Petre", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petre", "new text value from model");
		oModel.setLegacySyntax(false);
	});
	/** @deprecated As of version 1.88.0, reason Model.prototype.setLegacySyntax */
	QUnit.test("test model setProperty onlabel with bindingContext and absolute path (legacySyntax = true)", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		oModel.setLegacySyntax(true);
		var oContext = oModel.createBindingContext("/teamMembers/HorstDerGrosse");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "/teamMembers/1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/teamMembers/1/firstName", "Petra", oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "Petra", "new text value from model");
		oModel.setLegacySyntax(false);
	});

	QUnit.test("test model setProperty onlabel with bindingContext and absolute path", function(assert) {
		const {oModel, oLabel} = this.createModelAndLabel();
		var oContext = oModel.createBindingContext("/teamMembers/HorstDerGrosse");
		oLabel.setBindingContext(oContext);
		oLabel.bindProperty("text", "/teamMembers/1/firstName");
		assert.equal(oLabel.getText(), "Peter", "text value from model");
		// modify model value
		oModel.setProperty("/teamMembers/1/firstName", "Petra");
		assert.equal(oLabel.getText(), "Petra", "new text value from model");
	});

	QUnit.test("test model getProperty with bindingContext and path = null", function(assert) {
		const oModel = this.createModel();
		var oContext = oModel.createBindingContext("/teamMembers");
		assert.equal(oModel.getProperty(null, oContext).length, 7, "array of teammembers");
	});

	QUnit.test("test createBindingContext with two models", function(assert) {
		const oModelChild = new JSONModel({
			pets: [{type: "ape", age: "1"}, {type: "bird", age: "2"}, {type: "cat", age: "3"}]
		});
		const oLayout = new VerticalLayout();
		const {oModel, oLabel} = this.createModelAndLabel();
		oLayout.addContent(oLabel);
		oLayout.setModel(oModel);
		oLayout.setBindingContext(oModel.createBindingContext("/teamMembers"));
		oLabel.setModel(oModelChild);
		oLabel.bindProperty("text", "/pets/0/type");
		assert.equal(oLabel.getText(), "ape", "text value from model");
		oModelChild.setProperty("/pets/0/type", "hamster");
		assert.equal(oLabel.getText(), "hamster", "new text value from model");
		oLayout.destroy();
		oModelChild.destroy();
	});

	QUnit.test("test model bindAggregation on List", function(assert) {
		const oModel = this.createModel();
		var oLB = new List("myLb");
		oLB.setModel(oModel);
		var oItemTemplate = new ListItem();

		oItemTemplate.bindProperty("title", "firstName").bindProperty("description", "lastName");
		oLB.bindAggregation("items", "/teamMembers", oItemTemplate);

		var listItems = oLB.getItems();
		assert.equal(listItems.length, 7, "length of items");

		const aTeamMembers = oModel.getObject("/teamMembers");
		listItems.forEach( function(item, i) {
			assert.equal(item.getTitle(), aTeamMembers[i].firstName, "firstName");
			assert.equal(item.getDescription(), aTeamMembers[i].lastName, "lastName");
		});

		oLB.destroy();
	});

	QUnit.test("test JSONModel JSON constructor", function(assert) {
		var testModel = new JSONModel({
			"foo": "The quick brown fox jumps over the lazy dog.",
			"bar": "ABCDEFG",
			"baz": [52, 97]
		});
		assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
		assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
		assert.equal(testModel.getProperty("/baz")[1], 97);
		testModel.destroy();
	});

	QUnit.test("test create binding context", function(assert) {
		const oModel = this.createModel();
		var oContext;
		oContext = oModel.createBindingContext("/root/test/subtest/name");
		assert.equal(oContext.getPath(), "/root/test/subtest/name", "newContext returnValue");

		oModel.createBindingContext("/root/test/subtest/name", null, function(context){
			assert.equal(context.getPath(), "/root/test/subtest/name", "newContext");
		});
		oModel.createBindingContext("root/test/subtest/name", null, function(context){
			assert.ok(context == null, "newContext");
		});
		oContext = new Context(oModel, "/myContext");
		// if spath starts with / ... context will be ignored, because path is absolute
		oModel.createBindingContext("/root/test/subtest/name", oContext, function(context){
			assert.equal(context.getPath(), "/root/test/subtest/name", "newContext");
		});
		oContext = new Context(oModel, "/myContext");
		oModel.createBindingContext("root/test/subtest/name", oContext, function(context){
			assert.equal(context.getPath(), "/myContext/root/test/subtest/name", "newContext");
		});
	});

	QUnit.test("test inheritance of context", function(assert) {
		const oModelChild = new JSONModel({
			pets: [{type: "ape", age: "1"}, {type: "bird", age: "2"}, {type: "cat", age: "3"}]
		});
		const {oModel, oLabel} = this.createModelAndLabel();
		oLabel.setBindingContext(undefined);
		let oContext = oModel.createBindingContext("/teamMembers");
		const oLayout = new VerticalLayout();
		oLayout.setModel(oModel);
		oLayout.setBindingContext(oContext);
		oLabel.setModel(oModelChild);
		oLabel.bindProperty("text", "/pets/0/type");
		oLayout.addContent(oLabel);
		assert.ok(oLabel.getBindingContext() == undefined, "context undefined");
		oContext = oModelChild.createBindingContext("/pets");
		oLabel.setBindingContext(oContext);
		assert.equal(oLabel.getBindingContext().getPath(), "/pets", "context set correctly");
		oModelChild.setProperty("0/type", "rat",oLabel.getBindingContext());
		assert.equal(oLabel.getText(), "rat", "new text value from model");
		oLayout.destroy();
		oModelChild.destroy();
	});

	QUnit.test("test JSONModel loadData: sync",function(assert) {
		var testModel = new JSONModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json", null, false);
		assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
		assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
		assert.equal(testModel.getProperty("/baz")[1], 97);
		testModel.destroy();
	});

	QUnit.test("test JSONModel loadData: sync - error",function(assert) {
		var testModel = new JSONModel();
		testModel.attachRequestCompleted(function(e) {
			var mParams = e.getParameters();

			assert.ok(mParams.errorobject.message);
			assert.equal(mParams.errorobject.statusCode, 404);
			assert.ok(mParams.errorobject.statusText);
			assert.ok(mParams.errorobject.responseText);

			assert.equal(mParams.url, "nothingThere.json");
			assert.notOk(mParams.async);
		});

		testModel.attachRequestFailed(function(e) {
			var mParams = e.getParameters();

			assert.ok(mParams.message);
			assert.equal(mParams.statusCode, 404);
			assert.ok(mParams.statusText);
			assert.ok(mParams.responseText);
		});

		testModel.loadData("nothingThere.json", null, false);
		testModel.destroy();
	});

	QUnit.test("test JSONModel loadData: async - error",function(assert) {
		var done = assert.async();
		var testModel = new JSONModel();
		testModel.attachRequestCompleted(function(e) {
			var mParams = e.getParameters();

			assert.ok(mParams.errorobject.message);
			assert.equal(mParams.errorobject.statusCode, 404);
			assert.ok(mParams.errorobject.statusText);
			assert.ok(mParams.errorobject.responseText);

			assert.equal(mParams.url, "nothingThere.json");
			assert.ok(mParams.async);
		});

		testModel.attachRequestFailed(function(e) {
			var mParams = e.getParameters();

			assert.ok(mParams.message);
			assert.equal(mParams.statusCode, 404);
			assert.ok(mParams.statusText);
			assert.ok(mParams.responseText);
			testModel.destroy();
			done();
		});

		testModel.loadData("nothingThere.json", null, true);
	});

	QUnit.test("test JSONModel loadData",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.attachRequestCompleted(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			testModel.destroy();
			done();          // resume normal testing
		});
	});

	QUnit.test("test JSONModel loadData: dataLoaded() [async, Promise(chained)]",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.dataLoaded().then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			testModel.destroy();
			done();          // resume normal testing
		});
	});

	QUnit.test("test JSONModel loadData [async, event]: multiple requests - merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json",null,true,null,true);
		testModel.attachRequestCompleted(function() {
			loadCount++;
			if (loadCount == 1) {
				// resume normal testing
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
				assert.equal(testModel.getProperty("/baz")[1], 97);
			} else {
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.equal(testModel.getProperty("/baz")[1], 97);
				assert.equal(testModel.getProperty("/merged"), true);
				testModel.destroy();
				done();
			}
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise(chained)]: multiple requests - merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json",null,true,null,true);
		// once the Promise resolves, everything is already merged
		testModel.dataLoaded().then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, event & Promise]: multiple requests - merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json",null,true,null,true);
		// one event handler call for each loadData call
		testModel.attachRequestCompleted(function() {
			loadCount++;
			if (loadCount == 1) {
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
				assert.equal(testModel.getProperty("/baz")[1], 97);
			} else {
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.equal(testModel.getProperty("/baz")[1], 97);
				assert.equal(testModel.getProperty("/merged"), true);
			}
		});
		// Only one promise for ALL loadData calls;
		// resolve: everything is already merged, the intermediate states are no seen anymore
		testModel.dataLoaded().then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise(single)]: multiple requests - merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();

		var pLoad1 = testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json").then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz")[1], 97);
		});

		var pLoad2 = testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json",null,true,null,true).then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			assert.equal(testModel.getProperty("/merged"), true);
		});

		Promise.all([pLoad1, pLoad2]).then(function() {
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, event]: multiple requests - no merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json");
		testModel.attachRequestCompleted(function() {
			loadCount++;
			if (loadCount == 1) {
				// resume normal testing
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
				assert.equal(testModel.getProperty("/baz")[1], 97);
			} else {
				assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
				assert.equal(testModel.getProperty("/merged"), true);
				testModel.destroy();
				done();
			}
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise]: multiple requests - no merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json");
		testModel.dataLoaded().then(function() {
			assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, event & Promise]: multiple requests - no merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json");

		// one event handler call for each loadData call
		testModel.attachRequestCompleted(function() {
			loadCount++;
			if (loadCount == 1) {
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
				assert.equal(testModel.getProperty("/baz")[1], 97);
			} else {
				assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
				assert.equal(testModel.getProperty("/merged"), true);
			}
		});

		// Only one promise for ALL loadData calls;
		// resolve: everything is already merged, the intermediate states are no seen anymore
		testModel.dataLoaded().then(function() {
			assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise(single)]: multiple requests - no merge",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();

		var p1 = testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata.json").then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz")[1], 97);
		});

		var p2 = testModel.loadData("test-resources/sap/ui/core/qunit/json/data/testdata2.json").then(function() {
			assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
			assert.equal(testModel.getProperty("/merged"), true);
		});

		// Only one promise for ALL loadData calls;
		// resolve: everything is already merged, the intermediate states are no seen anymore
		Promise.all([p1, p2]).then(function() {
			assert.ok(!testModel.getProperty("/foo"), "deleted as no merge");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.ok(!testModel.getProperty("/baz"), "deleted as no merge");
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise(chained)]: multiple requests with merge: 1. request slow",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();

		testModel.loadData("/fake/testdata3.json");
		testModel.loadData("/fake/testdata4.json");
		testModel.dataLoaded().then(function(oInfo) {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			assert.equal(testModel.getProperty("/merged"), true);
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData [async, Promise]: error during parse",function(assert){
		assert.expect(7);
		var done = assert.async();
		var testModel = new JSONModel();

		var p1 = testModel.loadData("/fake").catch(function(oError) {
			assert.equal(oError.message, "parsererror", "parse error leads to rejection - 1");
			assert.equal(oError.responseText, "ERROR!", "parse error leads to rejection - 1");
		});

		var p2 = testModel.loadData("/fake/broken.json").catch(function(oError) {
			assert.equal(oError.message, "parsererror", "parse error leads to rejection - 2");
			assert.equal(oError.responseText, '{"foo": "The quick brown fox jumps over the lazy dog.","bar": "ABCDEFGHIJ""baz": [52, 97]}', "parse error leads to rejection - 2");
		});

		var p3 = testModel.loadData("/fake/testdata4.json").then(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
			assert.equal(testModel.getProperty("/baz")[1], 97);
		});

		Promise.all([p1, p2, p3]).then(function() {
			testModel.destroy();
			done();
		});
	});

	QUnit.test("test JSONModel loadData: multiple requests with merge: 1. request slow",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("/fake/testdata3.json");
		testModel.loadData("/fake/testdata4.json");
		testModel.attachRequestCompleted(function(oInfo) {
			loadCount++;
			if (loadCount == 1) {
				assert.ok(oInfo.getParameter("url") == "/fake/testdata3.json", "first request");
			} else {
				// resume normal testing
				assert.ok(oInfo.getParameter("url") == "/fake/testdata4.json", "second request");
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.equal(testModel.getProperty("/baz")[1], 97);
				assert.equal(testModel.getProperty("/merged"), true);
				testModel.destroy();
				done();
			}
		});
	});

	QUnit.test("test JSONModel loadData: multiple requests with merge: 1. request slow: 1 throws exception",function(assert){
		var done = assert.async();
		var testModel = new JSONModel();
		var loadCount = 0;
		testModel.loadData("/fake");
		testModel.loadData("/fake/testdata4.json");
		testModel.attachRequestCompleted(function(oInfo) {
			loadCount++;
			if (loadCount == 1) {
				assert.ok(oInfo.getParameter("success") == false, "request fails");
				throw 'fake';
			} else {
				// resume normal testing
				assert.ok(oInfo.getParameter("url") == "/fake/testdata4.json", "second request");
				assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
				assert.equal(testModel.getProperty("/bar"), "ABCDEFGHIJ");
				assert.equal(testModel.getProperty("/baz")[1], 97);
				assert.equal(testModel.getProperty("/merged"), true);
				testModel.destroy();
				done();
			}
		});
	});

	QUnit.test("test JSONModel loadData constructor",function(assert){
		var done = assert.async();
		var testModel = new JSONModel("test-resources/sap/ui/core/qunit/json/data/testdata.json");
		testModel.attachRequestCompleted(function() {
			assert.equal(testModel.getProperty("/foo"), "The quick brown fox jumps over the lazy dog.");
			assert.equal(testModel.getProperty("/bar"), "ABCDEFG");
			assert.equal(testModel.getProperty("/baz")[1], 97);
			testModel.destroy();
			done();          // resume normal testing
		});
	});

	QUnit.test("test JSONListBinding context calculation", function(assert) {
		var oModel = new JSONModel(),
			oArrayData = [1, 2, 3],
			aContexts;
		oModel.setData(oArrayData);
		aContexts = oModel.bindList("/").getContexts();
		assert.equal(aContexts[0].getPath(), "/0");
		assert.equal(aContexts[1].getPath(), "/1");
		assert.equal(aContexts[2].getPath(), "/2");
		aContexts = oModel.bindList("", null).getContexts();
		assert.equal(aContexts.length, 0);
		aContexts = oModel.bindList("/", oModel.getContext("/0")).getContexts();
		assert.equal(aContexts[0].getPath(), "/0");
		assert.equal(aContexts[1].getPath(), "/1");
		assert.equal(aContexts[2].getPath(), "/2");
		aContexts = oModel.bindList("", oModel.getContext("/")).getContexts();
		assert.equal(aContexts[0].getPath(), "/0");
		assert.equal(aContexts[1].getPath(), "/1");
		assert.equal(aContexts[2].getPath(), "/2");
		aContexts = oModel.bindList("/", oModel.getContext("/")).getContexts();
		assert.equal(aContexts[0].getPath(), "/0");
		assert.equal(aContexts[1].getPath(), "/1");
		assert.equal(aContexts[2].getPath(), "/2");
		var oNestedArrayData = {
			"array" : oArrayData,
			"complex" : [1, 2, 3]
		};
		oModel.setData(oNestedArrayData);
		aContexts = oModel.bindList("/array", "").getContexts();
		assert.equal(aContexts[0].getPath(), "/array/0");
		assert.equal(aContexts[1].getPath(), "/array/1");
		assert.equal(aContexts[2].getPath(), "/array/2");
		aContexts = oModel.bindList("array", null).getContexts();
		assert.equal(aContexts.length, 0);
		aContexts = oModel.bindList("/array", oModel.getContext("/complex")).getContexts();
		assert.equal(aContexts[0].getPath(), "/array/0");
		assert.equal(aContexts[1].getPath(), "/array/1");
		assert.equal(aContexts[2].getPath(), "/array/2");
		aContexts = oModel.bindList("", oModel.getContext("/array")).getContexts();
		assert.equal(aContexts[0].getPath(), "/array/0");
		assert.equal(aContexts[1].getPath(), "/array/1");
		assert.equal(aContexts[2].getPath(), "/array/2");
		aContexts = oModel.bindList("array/", oModel.getContext("/")).getContexts();
		assert.equal(aContexts[0].getPath(), "/array/0");
		assert.equal(aContexts[1].getPath(), "/array/1");
		assert.equal(aContexts[2].getPath(), "/array/2");
		oModel.destroy();
	});

	QUnit.test("test JSON setJSON", function(assert) {
		var oModel = new JSONModel();
		var sJSON = '{"name":"John"}';
		oModel.setJSON(sJSON,false);
		assert.equal(oModel.getProperty("/name"), "John" , "parse test");
		oModel.destroy();
	});

	QUnit.test("test JSON setJSON error", function(assert) {
		var oModel = new JSONModel();
		var sJSON = '{"name":John}';
		var error = false;
		oModel.attachParseError(sJSON, function(oEvent){
			error = true;
			assert.equal(oEvent.sId, "parseError", "event type");
		});
		oModel.setJSON(sJSON,false);
		assert.ok(error, "error occurred");
		oModel.destroy();
	});

	QUnit.test("test JSON getJSON", function(assert) {
		var oModel = new JSONModel();
		var sJSON = '{"name":"John"}';
		oModel.setJSON(sJSON,false);
		assert.equal(oModel.getJSON(), sJSON, "get JSON test");
		oModel.destroy();
	});

	QUnit.test("test JSON getData", function(assert) {
		var oModel = new JSONModel();
		var sJSON = '{"name":"John"}';
		oModel.setJSON(sJSON,false);
		assert.equal(oModel.getData().name, "John", "get Data test");
		oModel.destroy();
	});
	/** @deprecated As of version 1.88.0, reason Model.prototype.setLegacySyntax */
	QUnit.test("test JSON compatible syntax", function(assert) {
		const oModel = this.createModel();
		oModel.setLegacySyntax(true);
		var value = oModel.getProperty("teamMembers/6/lastName");
		assert.equal(value, "Wallace", "model value");
		oModel.setProperty("teamMembers/4/lastName", "Jackson");
		value = oModel.getProperty("/teamMembers/4/lastName");
		assert.equal(value, "Jackson", "model value");
		var oContext = oModel.createBindingContext("teamMembers/6");
		value = oModel.getProperty("lastName", oContext);
		assert.equal(value, "Wallace", "model value");
	});
	/** @deprecated As of version 1.88.0, reason Model.prototype.setLegacySyntax */
	QUnit.test("test JSON compatible syntax fail", function(assert) {
		const oModel = this.createModel();
		oModel.setLegacySyntax(false);
		var value = oModel.getProperty("teamMembers/6/lastName");
		assert.equal(value, undefined, "model value");
		oModel.setProperty("/teamMembers/4/lastName", "Ander");
		try {
			oModel.setProperty("teamMembers/4/lastName", "Jackson");
		} catch (e) {
			assert.ok(false, "should not happen!");
		}
		value = oModel.getProperty("/teamMembers/4/lastName");
		assert.equal(value, "Ander", "model value");
		var oContext = oModel.createBindingContext("teamMembers/6");
		assert.equal(oContext, undefined, "model value");
	});

	QUnit.test("test JSONModel destroy", function(assert) {
		var testModel = new JSONModel();
		testModel.attachRequestCompleted(function() {
			assert.ok(false, "Request should be aborted!");
		});
		testModel.attachRequestFailed(function() {
			assert.ok(false, "Error handler should not be called when request is aborted via destroy!");
		});
		var spy = sinon.spy(jQuery, "ajax");
		testModel.loadData("testdata.json");
		testModel.destroy();
		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests should be still 1");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort");
		spy.restore();
	});

	QUnit.test("test JSONModel loadData after destroy", function(assert) {
		var spy = sinon.spy(jQuery, "ajax");
		var testModel = new JSONModel();

		testModel.attachRequestCompleted(function() {
			assert.ok(false, "Request should be aborted!");
		});
		testModel.attachRequestFailed(function() {
			assert.ok(false, "Error handler should not be called when request is aborted via destroy!");
		});

		testModel.loadData("testdata.json", null, true);
		testModel.destroy();
		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort");

		// call loaddata again
		testModel.loadData("testdata.json", null, true);

		assert.ok(testModel.bDestroyed, "Model should be destroyed");
		assert.equal(spy.callCount, 1, "number of requests should be still 1");
		assert.equal(spy.getCall(0).returnValue.statusText, "abort", "should be abort");
		spy.restore();
	});

	QUnit.test("bind Element", function(assert) {
		var oContext;
		const {oModel, oLabel} = this.createModelAndLabel();
		oModel.createBindingContext("/additionalData", null, function(context){
			oContext = context;
		});
		oLabel.setBindingContext(oContext);
		oLabel.bindElement("level1");
		assert.equal(oLabel.getBindingContext().getPath(), "/additionalData/level1", "context should be considered for element binding");
		oLabel.bindProperty("text","text");
		assert.equal(oLabel.getText(), "level1", "text value from model");
		oLabel.bindElement("level1/level2");
		assert.equal(oLabel.getText(), "level2", "text value from model");
		oLabel.unbindElement();
		assert.equal(oLabel.getText(), "", "text value from model");
	});

	QUnit.test("bind Element", function(assert) {
		var oContext;
		const {oModel, oLabel} = this.createModelAndLabel();
		oModel.createBindingContext("/additionalData", null, function(context){
			oContext = context;
		});
		oLabel.bindElement("level1");
		oLabel.setBindingContext(oContext);
		assert.equal(oLabel.getBindingContext().getPath(), "/additionalData/level1", "context should be considered for element binding");
		oLabel.bindProperty("text","text");
		assert.equal(oLabel.getText(), "level1", "text value from model");
		oLabel.bindElement("level1/level2");
		assert.equal(oLabel.getText(), "level2", "text value from model");
		oLabel.unbindElement();
		assert.equal(oLabel.getText(), "", "text value from model");
	});

	//*********************************************************************************************
	// DINC0180763
	QUnit.test("loadData: calls _ajax with jsonp=false", function () {
		const oModel = {
			_ajax() {},
			fireRequestSent() {}
		};
		this.mock(oModel).expects("fireRequestSent").withExactArgs({
			async: false, headers: "~mHeaders", info: "cache=~bCache;bMerge=~bMerge",
			infoObject: {cache: "~bCache", merge: "~bMerge"}, type: "~sType", url: "~sURL"
		});
		this.mock(oModel).expects("_ajax").withExactArgs({
			async: false, cache: "~bCache", data: "~oParameters", dataType: 'json', error: sinon.match.func,
			headers: "~mHeaders", jsonp: false, success: sinon.match.func, type: "~sType", url: "~sURL"
		});

		// code under test
		JSONModel.prototype.loadData.call(oModel, "~sURL", "~oParameters", false, "~sType", "~bMerge", "~bCache",
			"~mHeaders");
	});
});
