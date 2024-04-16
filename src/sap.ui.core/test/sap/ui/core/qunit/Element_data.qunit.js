/*global QUnit, sinon */
sap.ui.define([
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/ui/core/mvc/View",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(future, Log, Element, library, View, JSONModel, Button, nextUIUpdate) {
	"use strict";

	var ViewType = library.mvc.ViewType;

	QUnit.module("Custom Data", {
		beforeEach: function() {
			this.element = new Element();
		},
		afterEach: function() {
			this.element.destroy();
		}
	});

	QUnit.test("New Element and its data", function(assert) {
		var element = this.element;
		assert.equal(typeof element.data, "function", "element must have a 'data' function");
		assert.deepEqual(element.data(), {}, "element data should be empty");
	});

	QUnit.test("Adding and retrieving string data", function(assert) {
		var element = this.element;
		var returnValue = element.data("test", "abc");
		assert.ok(returnValue === element, "element must be returned");

		// retrieve the data
		var data = element.data("test");
		assert.equal(data, "abc", "Value 'abc' must be returned as data");

		// change the data
		element.data("test", "def");
		data = element.data("test");
		assert.equal(data, "def", "Value 'def' must be returned as data");

		// unknown key
		data = element.data("test2");
		assert.equal(data, null, "Value 'null' must be returned as data for unknown key");
	});


	QUnit.test("Removing data", function(assert) {
		var element = this.element;
		element.data("test", "def");

		// clear the data
		var returnValue = element.data("test", null);
		assert.ok(returnValue === element, "element must be returned");

		var data = element.data("test");
		assert.equal(data, null, "Value 'null' must be returned as data");

		assert.deepEqual(element.data(), {}, "element data should be empty");
	});


	QUnit.test("Adding and retrieving function data", function(assert) {
		assert.expect(3);
		function testFunction() {
			assert.ok(true, "this test only checks whether the function is executed");
			return "success";
		}
		var element = this.element;
		element.data("test_func", testFunction);
		var data = element.data("test_func");

		assert.equal(typeof data, "function", "Value must be a function");
		assert.equal(data(), "success", "The stored function should return the string 'success'");
	});


	QUnit.test("Adding and retrieving object data", function(assert) {
		var element = this.element;
		element.data("test_json", {"two":2});
		var data = element.data("test_json");

		assert.equal(typeof data, "object", "Value must be an object");
		assert.ok(data.two, "The stored object should have a property 'two'");
		assert.equal(data.two, 2, "The stored object should have a property 'two' with value 2");

		element.data("test_win", window);
		assert.strictEqual(element.data("test_win"), window, "Value must be the window object");
	});


	QUnit.test("Retrieving all data", function(assert) {
		var element = this.element;
		function testFunction() {
			assert.ok(true, "this test only checks whether the function is executed");
			return "success";
		}
		element.data("test_func", testFunction);
		element.data("test_json", {"two":2});
		element.data("test_win", window);

		var data = element.data();
		assert.equal(typeof data, "object", "Value must be an object");
		assert.ok(data.test_func, "The stored object should have a property 'test_func'");
		assert.ok(data.test_json, "The stored object should have a property 'test_json'");
		assert.ok(data.test_win, "The stored object should have a property 'test_win'");
		assert.equal(data.test_json.two, 2, "The stored object for key 'test_json' should have a property 'two' with value 2");

		element.data("test_func", null);
		element.data("test_json", null);
		element.data("test_win", null);

		data = element.data();
		assert.deepEqual(element.data(), {}, "element data should be empty");
	});


	QUnit.test("Setting multiple data", function(assert) {
		var element = this.element;
		element.data({
			test_func: "f",
			test_json: {"two":2},
			test_win: "w"
		});
		var data = element.data();

		assert.equal(typeof data, "object", "Value must be an object");
		assert.ok(data.test_func, "The stored object should have a property 'test_func'");
		assert.ok(data.test_json, "The stored object should have a property 'test_json'");
		assert.ok(data.test_win, "The stored object should have a property 'test_win'");

		assert.equal(data.test_json.two, 2, "The stored object for key 'test_json' should have a property 'two' with value 2");

		element.data(null);

		data = element.data();
		assert.deepEqual(element.data(), {}, "element data should be empty");
	});

	QUnit.test("Negative Test: invalid arguments", function(assert) {
		var element = this.element;
		assert.throws(function() { element.data(1); }, "Getting data with a key of type number should raise an error");
		assert.throws(function() { element.data(3.14); }, "Getting data with a key of type number should raise an error");
		assert.throws(function() { element.data(true); }, "Getting data with a key of type boolean should raise an error");
		assert.throws(function() { element.data(undefined); }, "Getting data with a key of type undefined should raise an error"); // TODO why does undefined behave differently to null?
		/* TODO clarify why keys in setters are not checked
		assert.throws(function() { element.data(1, "some value"); }, "Getting data with a key of type number should raise an error");
		assert.throws(function() { element.data(3.14, "some value"); }, "Getting data with a key of type number should raise an error");
		assert.throws(function() { element.data(true, "some value"); }, "Getting data with a key of type boolean should raise an error");
		assert.throws(function() { element.data(undefined, "some value"); }, "Getting data with a key of type undefined should raise an error");
		*/
	});

	QUnit.test("Cloning elements with data", function(assert) {
		var element = this.element;
		element.data({
			string_data: "abc",
			object_data: {"two":2}
		});

		var clone = element.clone();

		var string_data = clone.data("string_data");
		assert.equal(string_data, "abc", "The string data of the cloned object should be 'abc' as well");

		var object_data = clone.data("object_data");
		assert.equal(object_data.two, 2, "The object data of the cloned object should be the same as the original");
		object_data.two = 3;

		var object_data_ori = clone.data("object_data");
		assert.equal(object_data_ori.two, 3, "The object data of the original object should be changed as well, as only the reference to it is cloned");
	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Calling data() after destroy (future=false)", function(assert) {
		future.active = false;

		// Setup: create an element, add some custom data and destroy it
		this.stub(Log, "error");
		var element = new Element();
		element.data("test", "value");
		element.destroy();

		// Act/Assert

		// get value for a single key
		Log.error.resetHistory();
		assert.strictEqual(element.data("test"), null, "no more custom data after destroy");
		assert.strictEqual(Log.error.callCount, 0);

		// get all key/value pairs
		Log.error.resetHistory();
		assert.deepEqual(element.data(), {}, "no more custom data after destroy");
		assert.strictEqual(Log.error.callCount, 0);

		// destroy  all
		Log.error.resetHistory();
		assert.strictEqual(element.data(null), element, "data(null) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(null) should not have modified aggregation 'customData'");
		assert.strictEqual(Log.error.callCount, 0);

		// add single key/value pairs
		Log.error.resetHistory();
		assert.strictEqual(element.data("a", "b"), element, "data(key,value) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(key,value) should not have modified aggregation 'customData'");
		assert.ok(Log.error.calledWith(sinon.match(/Cannot create custom data on an already destroyed element/)));

		// remove single key/value pairs
		Log.error.resetHistory();
		assert.strictEqual(element.data("a", null), element, "data(key,null) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(key,value) should not have modified aggregation 'customData'");
		assert.strictEqual(Log.error.callCount, 0);

		// add single key/value pair with DOM
		Log.error.resetHistory();
		assert.strictEqual(element.data("a", "b", false), element, "data(key,value,bool) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(key,value,bool) should not have modified aggregation 'customData'");
		assert.ok(Log.error.calledWith(sinon.match(/Cannot create custom data on an already destroyed element/)));

		// add single key/value pair with DOM
		Log.error.resetHistory();
		assert.strictEqual(element.data("a", "b", true), element, "data(key,value,bool) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(key,value,bool) should not have modified aggregation 'customData'");
		assert.ok(Log.error.calledWith(sinon.match(/Cannot create custom data on an already destroyed element/)));

		// add multiple key/value pairs
		Log.error.resetHistory();
		assert.strictEqual(element.data({a:"b",b:"c"}), element, "data({data}) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data({data}) should not have modified aggregation 'customData'");
		assert.ok(Log.error.calledWith(sinon.match(/Cannot create custom data on an already destroyed element/)));

		future.active = undefined;
	});

	QUnit.test("Calling data() after destroy (future=true)", function(assert) {
		future.active = true;
		// Setup: create an element, add some custom data and destroy it

		this.stub(Log, "error");
		var element = new Element({
			id: "myElement"
		});
		element.data("test", "value");
		element.destroy();

		// Act/Assert

		// get value for a single key
		Log.error.resetHistory();
		assert.strictEqual(element.data("test"), null, "no more custom data after destroy");
		assert.strictEqual(Log.error.callCount, 0);

		// get all key/value pairs
		Log.error.resetHistory();
		assert.deepEqual(element.data(), {}, "no more custom data after destroy");
		assert.strictEqual(Log.error.callCount, 0);

		// destroy  all
		Log.error.resetHistory();
		assert.strictEqual(element.data(null), element, "data(null) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(null) should not have modified aggregation 'customData'");
		assert.strictEqual(Log.error.callCount, 0);

		// add single key/value pairs
		Log.error.resetHistory();
		assert.throws(() => { element.data("a", "b"); }, new Error("Cannot create custom data on an already destroyed element 'Element sap.ui.core.Element#myElement'"), "Error thrown because calling data(key,value) after destroy");

		// remove single key/value pairs
		Log.error.resetHistory();
		assert.strictEqual(element.data("a", null), element, "data(key,null) should return the element itself");
		assert.strictEqual(element.getAggregation("customData"), null, "data(key,value) should not have modified aggregation 'customData'");
		assert.strictEqual(Log.error.callCount, 0);

		// add single key/value pair with DOM
		Log.error.resetHistory();
		assert.throws(() => { element.data("a", "b", false); }, new Error("Cannot create custom data on an already destroyed element 'Element sap.ui.core.Element#myElement'"), "Error thrown because calling data(key,value,bool) after destroy");

		// add single key/value pair with DOM
		Log.error.resetHistory();
		assert.throws(() => { element.data("a", "b", true); }, new Error("Cannot create custom data on an already destroyed element 'Element sap.ui.core.Element#myElement'"), "Error thrown because calling data(key,value,bool) after destroy");

		// add multiple key/value pairs
		Log.error.resetHistory();
		assert.throws(() => { element.data({a:"b",b:"c"}); }, new Error("Cannot create custom data on an already destroyed element 'Element sap.ui.core.Element#myElement'"), "Error thrown because calling data({data}) after destroy");

		future.active = undefined;
	});

	// Data Binding

	QUnit.test("Data Binding", function(assert) {
		var element = this.element;
		var oModel = new JSONModel({
			firstName: "Peter",
			lastName: "Pan"
		});
		element.setModel(oModel);
		element.data("myKey", "{/lastName}");

		var data = element.data("myKey");
		assert.equal(data, "Pan", "The data must be the bound string 'Pan'");

		oModel.setData({
			firstName: "Hans",
			lastName: "Wurst"
		});

		data = element.data("myKey");
		assert.equal(data, "Wurst", "The data must be the bound string 'Wurst'");
	});


	/*** XMLView usage ***/

	QUnit.test("Usage in XML View declaration with binding", function(assert) {
		var xml = '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" '
			+ 'xmlns:app="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">'
			+ '<Button id="myBtn" text="test" app:coords="{/data}"></Button></mvc:View>';
		// instantiate the View
		return View.create({
			type: ViewType.XML,
			definition: xml
		}).then(function(myView) {
			// create a Model with some dummy data and assign it to the View
			var oModel = new JSONModel({
				data : {
					x : 100,
					y : 250
				}
			});
			myView.setModel(oModel);

			var btn = myView.byId("myBtn");
			assert.ok(btn && btn instanceof Button, "The Button instance from the XML View should exist");

			var data = btn.data("coords");
			assert.ok(data && typeof data === "object", "Data object should be attached to the Button");
			assert.equal(data.x, 100, "Data object should contain the original data");
		});

	});

	/**
	 * @deprecated As of version 1.120
	 */
	QUnit.test("Write Data to HTML (future=false)", async function(assert) {
		future.active = false;

		var btn = new Button({text:"Hello"});

		btn.data("test", "some payload", true);
		btn.data("test2", "some other payload");
		btn.data("test3", 42, true);
		btn.data("test4", true, true);
		btn.data("test5", {"test":"nope"}, true);

		btn.placeAt("content");
		await nextUIUpdate();

		var $btn = btn.$();
		assert.equal($btn.attr("data-test"), "some payload", "the 'test' data should be written to DOM");
		assert.equal($btn.attr("data-test2"), undefined, "the 'test2' data should NOT be written to DOM");
		assert.equal($btn.attr("data-test3"), undefined, "the 'test3' data should NOT be written to DOM");
		assert.equal($btn.attr("data-test4"), undefined, "the 'test4' data should NOT be written to DOM");
		assert.equal($btn.attr("data-test5"), undefined, "the 'test5' data should NOT be written to DOM");

		future.active = undefined;
	});

	QUnit.test("Write Data to HTML (future=true)", async function(assert) {
		future.active = true;
		var btn = new Button({text:"Hello"});

		btn.data("test", "some payload", true);
		btn.data("test2", "some other payload");
		btn.data("test3", 42, true);
		btn.data("test4", true, true);
		btn.data("test5", {"test":"nope"}, true);

		btn.placeAt("content");
		await assert.rejects(nextUIUpdate(), "nextUIUpdate rejected because no string value was provided to CustomData");

		future.active = undefined;
	});
});