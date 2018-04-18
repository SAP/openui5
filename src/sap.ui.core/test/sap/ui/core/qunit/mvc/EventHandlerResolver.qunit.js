/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/EventHandlerResolver"
], function(Control, JSONModel, EventHandlerResolver) {
	"use strict";

	var oController;
	var thisContext;
	var oDummySource;

	var DummyControl = Control.extend("test.DummyControl", {
		metadata: {
			properties: {
				someControlProperty: "string"
			}
		}
	});

	var oDummyEvent = {
		getSource: function() {
			return oDummySource;
		},
		mParameters: {
			someEventParameter: "someEventParameterValue"
		}
	};




	QUnit.module("sap.ui.core.mvc.EventHandlerResolver - handler function", {
		beforeEach: function() {
			thisContext = null;

			oController = {
				fnControllerMethod: function(){
					thisContext = this;
				}
			};

			window.testEventHandlerResolver = {
				subobject: {
					someGlobalMethod: function(){
						thisContext = this;
					}
				}
			};

			window.someGlobalMethodOnWindow = function(){
				thisContext = this;
			};

			oDummySource = new DummyControl();
		},

		afterEach: function() {
			oController = null;
			window.testEventHandlerResolver = null;
			oDummySource.destroy();
		}
	});


	QUnit.test("Plain handler resolution", function(assert) {
		var fnController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod", oController)[0];
		assert.equal(fnController, oController.fnControllerMethod, "Controller method should be found");

		var fnGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod", oController)[0];
		assert.equal(fnGlobal, window.testEventHandlerResolver.subobject.someGlobalMethod, "Global method should be found");
	});

	QUnit.test("Handler resolution when parentheses are present", function(assert) {
		sinon.spy(oController, "fnControllerMethod");
		var fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod()", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(oController.fnControllerMethod.callCount, 1, "Controller method should be called");

		oController.fnControllerMethod.reset();
		var fnFromController = EventHandlerResolver.resolveEventHandler("fnControllerMethod()", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(oController.fnControllerMethod.callCount, 1, "Controller method without dot should be called");

		sinon.spy(testEventHandlerResolver.subobject, "someGlobalMethod");
		var fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod()", oController)[0];
		fnFromGlobal(oDummyEvent);
		assert.equal(testEventHandlerResolver.subobject.someGlobalMethod.callCount, 1, "Global method should be called once");

		sinon.spy(window, "someGlobalMethodOnWindow");
		fnFromGlobal = EventHandlerResolver.resolveEventHandler("someGlobalMethodOnWindow()", oController)[0];
		fnFromGlobal(oDummyEvent);
		assert.equal(someGlobalMethodOnWindow.callCount, 1, "Global method without dot should be called once");
	});

	QUnit.test("'this' context when parentheses are present", function(assert) {
		// controller functions
		var fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod()", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(thisContext, oController, "Controller method should be called with controller as 'this' context");
		thisContext = "wrong"; // to make sure non-calls don't accidentally get the correct value

		// controller functions without dot
		fnFromController = EventHandlerResolver.resolveEventHandler("fnControllerMethod()", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(thisContext, oController, "Controller method without dot should be called with controller as 'this' context");
		thisContext = "wrong";

		// global functions
		var fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod()", oController)[0];
		fnFromGlobal(oDummyEvent);
		assert.equal(thisContext, testEventHandlerResolver.subobject, "Global method should be called with testEventHandlerResolver.subobject as 'this' context");
		thisContext = "wrong";

		// global functions without dot
		fnFromGlobal = EventHandlerResolver.resolveEventHandler("someGlobalMethodOnWindow()", oController)[0];
		fnFromGlobal(oDummyEvent);
		assert.equal(thisContext, undefined, "Global method without dot should be called with undefined as 'this' context");
		thisContext = "wrong";

		// global functions with .call()
		/* bug in expression parser, already being fixed in v4 branch   TODO
		fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod.call($controller)", oController)[0];
		fnFromGlobal(oDummyEvent);
		assert.equal(thisContext, oController, "Global method should be called with controller as 'this' context when set using .call($controller)");
		thisContext = "wrong";
		*/
	});




	QUnit.module("sap.ui.core.mvc.EventHandlerResolver - parameter resolution", {
		beforeEach: function() {
			oController = {
				fnControllerMethod: function(){},
				myFormatter: function() {
					return "#" + Array.prototype.slice.call(arguments).join(",") + "#";
				}
			};

			window.testEventHandlerResolver = {
				subobject: {
					someGlobalMethod: function(){}
				}
			};

			oDummySource = new DummyControl({someControlProperty: "someControlPropertyValue"});

			var oModel = new JSONModel({
				someModelProperty: "someModelValue",
				someDateProperty: '2011-10-29',
				someNumberProperty: 49
			});
			oDummySource.setModel(oModel);

			var oModel = new JSONModel({
				subnode: {
					someSecondModelProperty: "someSecondModelValue"
				}
			});
			oDummySource.setModel(oModel, "secondModel");
			oDummySource.bindElement({path: "/subnode", model: "secondModel"});
		},

		afterEach: function() {
			oController = null;
			window.testEventHandlerResolver = null;
			oDummySource.getModel().destroy();
			oDummySource.getModel("secondModel").destroy();
			oDummySource.destroy();
		}
	});


	QUnit.test("static values", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var aTests = [
			{src: ".fnControllerMethod(\"test\")", expected: "test", message: "Static value with double quotes within double quotes should be correctly given"},
			{src: ".fnControllerMethod('test')", expected: "test", message: "Static value with single quotes within double quotes should be correctly given"},
			{src: '.fnControllerMethod("test")', expected: "test", message: "Static value with double quotes within single quotes should be correctly given"},
			{src: '.fnControllerMethod(\'test\')', expected: "test", message: "Static value with single quotes within single quotes should be correctly given"},
			{src: ".fnControllerMethod(true)", expected: true, message: "Boolean static value 'true' should be correctly given"},
			{src: ".fnControllerMethod(false)", expected: false, message: "Boolean static value 'false' should be correctly given"},
			{src: ".fnControllerMethod(49)", expected: 49, message: "Static number value should be correctly given"},
			{src: ".fnControllerMethod(49.95)", expected: 49.95, message: "Static float value should be correctly given"},
			{src: ".fnControllerMethod({'x': 'y'})", expected: {'x': 'y'}, message: "Static object value should be correctly given"},
			{src: ".fnControllerMethod({x: 'y'})", expected: {'x': 'y'}, message: "Static object value should be correctly given"},
			{src: ".fnControllerMethod({x: 'y', z: {a: 1}})", expected: {'x': 'y', z: {a: 1}}, message: "Static object value should be correctly given"},
			{src: ".fnControllerMethod(null)", expected: null, message: "Static null value should be correctly given"},
		];

		var fnFromController;
		for (var i = 0; i < aTests.length; i++) {
			fnFromController = EventHandlerResolver.resolveEventHandler(aTests[i].src, oController)[0];
			fnFromController(oDummyEvent);
			assert.deepEqual(spy.args[i], [aTests[i].expected], aTests[i].message);
		}
	});


	QUnit.test("Special value: $controller", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod($controller)", oController)[0];
		fnFromController(oDummyEvent);
		assert.deepEqual(spy.args[0], [oController], "Parameter $controller should be given as the controller instance");
	});


	QUnit.test("Special value: $event", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod($event)", oController)[0];
		fnFromController(oDummyEvent);
		assert.deepEqual(spy.args[0], [oDummyEvent], "Parameter $event should be given as the event object");
	});


	QUnit.test("bound values", function(assert) { // CAUTION: this is a map and IE is particularly sensitive to duplicate keys in a map even if they don't look duplicate here (e.g. due to escaped quotes)
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController;
		var mTestSet = {
			".fnControllerMethod(${/someModelProperty})": "someModelValue",   // plain, absolute binding path
			"  .fnControllerMethod (   ${/someModelProperty}	)  ": "someModelValue",   // some whitespace fun
			".fnControllerMethod(${secondModel>someSecondModelProperty})": "someSecondModelValue",   // relative path using element binding, in named model
			".fnControllerMethod(${path:'/someModelProperty'})": "someModelValue",  // complex syntax, entry-level
			".fnControllerMethod(${path:'/someModelProperty', formatter: '.myFormatter'})": "#someModelValue#",   // complex syntax with formatter
			".fnControllerMethod(${path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'})": "#someModelValue#",   // complex syntax with type
			// does not work, deep nesting of parts is not supported in EventHandlerResolver:
			//".fnControllerMethod(${parts: ['/someModelProperty'], formatter: '.myFormatter'})": "#someModelValue,someModelValue#",   // complex syntax with mixed parts
			".fnControllerMethod(${$parameters>/someEventParameter})": "someEventParameterValue",  // another model (event parameters)
			".fnControllerMethod(${$source>/someControlProperty})": "someControlPropertyValue",   // the event source model
			".fnControllerMethod('Value is: ' + ${/someModelProperty})": "Value is: someModelValue",   // “calculated fields” (template string)
			".fnControllerMethod(${/someModelProperty} + ',' + ${/someModelProperty})": "someModelValue,someModelValue",   // attention, also a calculated field!
			".fnControllerMethod(\"Value is: \" + ${path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'})": "Value is: #someModelValue#",   // calculated field with complex binding syntax
			// not allowed to use binding expressions inside because the entire string is a binding expression:
			//".fnControllerMethod({= ${/someModelProperty} + ${/someModelProperty}})": "someModelValuesomeModelValue",   // expression binding
			".fnControllerMethod({x: 'y', z: {a: ${/someModelProperty}}})": {x: 'y', z: {a: "someModelValue"}},   // binding in object
			'.fnControllerMethod(${path:\'/someModelProperty\',formatter: \'.myFormatter\'})': "#someModelValue#",   // quotes escaped
			".fnControllerMethod(${formatter: \".myFormatter\",path:\"/someModelProperty\"})": "#someModelValue#"   // quotes escaped, inverted (swap of arguments needed for test to pass in IE because map may not have duplicate keys!)
		};

		for (var sTestString in mTestSet) {
			spy.reset();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController)[0];
			fnFromController(oDummyEvent);
			assert.deepEqual(spy.args[0], [mTestSet[sTestString]], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("multiple parameters", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController;
		var mTestSet = { // now the values are arrays
			".fnControllerMethod('test',${/someModelProperty})": ["test", "someModelValue"],   // two parameters
			".fnControllerMethod( 'test' ,	${/someModelProperty}	)": ["test", "someModelValue"],   // some whitespace fun
		};

		for (var sTestString in mTestSet) {
			spy.reset();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController)[0];
			fnFromController(oDummyEvent);
			assert.deepEqual(spy.args[0], mTestSet[sTestString], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("types", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController;
		var mTestSet = {
			".fnControllerMethod(${path:'/someNumberProperty', type: 'sap.ui.model.type.Integer', targetType: 'int'})": 49,   // complex syntax with type
			".fnControllerMethod(${path:'/someNumberProperty', type: 'sap.ui.model.type.Integer', targetType: 'string'})": "49",   // type conversion
			".fnControllerMethod(${path:'/someDateProperty', type: 'sap.ui.model.type.Date', formatOptions: {pattern: 'dd.MM.yyyy',source: {pattern: 'yyyy-MM-dd'}}})": "29.10.2011"   // type with format options
		};

		for (var sTestString in mTestSet) {
			spy.reset();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController)[0];
			fnFromController(oDummyEvent);
			assert.strictEqual(spy.args[0][0], mTestSet[sTestString], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("error cases (and edge cases)", function(assert) {
		var fnFromController;

		// unclosed braces
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty)", oController)[0];
			fnFromController(oDummyEvent);
		} , function(err){
			return err.message.indexOf("no closing braces found") > -1;
		}, "Correct error should be thrown for non-matching braces");

		// unresolvable formatter
		var spy = sinon.spy(jQuery.sap.log, "error");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${path:'/someModelProperty', formatter: '.myNotExistingFormatter'})", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 1, "Error should be logged for unresolvable formatter");
		assert.ok(spy.args[0][0].indexOf("formatter function .myNotExistingFormatter not found") > -1, "Error should be logged for unresolvable formatter");

		// globals within the expression
		spy = sinon.spy(jQuery.sap.log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(Math.max(1))", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 2, "Warning should be logged for globals inside parameter section");
		assert.ok(spy.args[0][0].indexOf("Unsupported global identifier") > -1, "Warning should be logged for globals inside parameter section");
		jQuery.sap.log.warning.restore();

		// wrong expression syntax
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty} + {/someModelProperty})", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("Expected IDENTIFIER") > -1;
		}, "Error should be thrown for expression syntax error");

		// no expressions within
		spy = sinon.spy(jQuery.sap.log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod({= 'abc'})", oController)[0];
		assert.equal(spy.callCount, 1, "Warning should be logged for expressions inside parameter section");
		assert.ok(spy.args[0][0].indexOf("event handler parameter contains a binding expression") > -1, "Warning should be logged for expressions inside parameter section");
		jQuery.sap.log.warning.restore();
		assert.throws(function(){
			fnFromController(oDummyEvent);
		}, function(err){
			return true; // browser-dependent message
		}, "Error should be thrown for expressions inside parameter section");

		// starting with a brace
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler("(${/someModelProperty})", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("starts with a bracket") > -1;
		}, "Error should be thrown when starting with a bracket");

		// wrong binding path
		/*	TODO: help the user detect such issues without making too much noise when an empty value is perfectly fine
		spy = sinon.spy(jQuery.sap.log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/thisdoesnotExist})", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 1, "Warning should be logged for empty values (which may indicate wrong bindings)");
		assert.ok(spy.args[0][0].indexOf("EventHandlerResolver: no value was returned") > -1, "Warning should be logged for empty values (which may indicate wrong bindings)");
		*/

		// too many closing braces
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty}})", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("but instead saw }") > -1;
		}, "Error should be thrown for too many closing braces");

		// non-closed single quotes
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod('x)", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("Bad") > -1;
		}, "Error should be thrown for non-closed single quotes");

		// non-closed double quotes
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(\"x)", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("Bad") > -1;
		}, "Error should be thrown for non-closed double quotes");
	});
});