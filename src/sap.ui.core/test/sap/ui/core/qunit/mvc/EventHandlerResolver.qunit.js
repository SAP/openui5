/* global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/EventHandlerResolver",
	"sap/base/future",
	"sap/base/Log",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/String"
], function(Control, JSONModel, EventHandlerResolver, future, Log, IntegerType, DateType, StringType) {
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

	var mLocals = {
		someMethod: function() {
			thisContext = this;
		},
		someFormatter: function() {
			return "#" + Array.prototype.slice.call(arguments).join(",") + "#";
		}
	};

	QUnit.module("sap.ui.core.mvc.EventHandlerResolver - handler function", {
		beforeEach: function() {
			thisContext = null;

			oController = {
				fnControllerMethod: function() {
					thisContext = this;
				},
				ns: {
					deepMethod: function() {
					}
				}
			};

			window.testEventHandlerResolver = {
				subobject: {
					someGlobalMethod: function() {
						thisContext = this;
					}
				}
			};

			window.someGlobalMethodOnWindow = function() {
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

	/**
	 * @deprecated
	 */
	QUnit.test("Plain handler resolution (future=false)", function(assert) {
		future.active = false;
		var fnController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod", oController)[0];
		assert.equal(fnController, oController.fnControllerMethod, "Controller method should be found");

		/**
		 * @deprecated
		 */
		(() => {
			var fnGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod", oController)[0];
			assert.equal(fnGlobal, window.testEventHandlerResolver.subobject.someGlobalMethod, "Global method should be found");
		})();

		var fnGlobal = EventHandlerResolver.resolveEventHandler("ns.deepMethod", oController);
		assert.strictEqual(fnGlobal, undefined, "Function name with deeper path shouldn't be searched in the controller");
		future.active = undefined;
	});

	QUnit.test("Plain handler resolution (future=true)", function(assert) {
		future.active = true;
		var fnController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod", oController)[0];
		assert.equal(fnController, oController.fnControllerMethod, "Controller method should be found");

		/**
		 * @deprecated
		 */
		(() => {
			var fnGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod", oController)[0];
			assert.equal(fnGlobal, window.testEventHandlerResolver.subobject.someGlobalMethod, "Global method should be found");
		})();

		assert.throws(() => {
				EventHandlerResolver.resolveEventHandler("ns.deepMethod", oController);
			},
			new Error("Event handler name 'ns.deepMethod' could not be resolved to an event handler function"),
			"Function name with deeper path shouldn't be searched in the controller");
		future.active = undefined;
	});

	QUnit.test("Handler resolution when parentheses are present", function(assert) {
		sinon.spy(oController, "fnControllerMethod");
		var fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod()", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(oController.fnControllerMethod.callCount, 1, "Controller method should be called");

		oController.fnControllerMethod.resetHistory();
		var fnFromController2 = EventHandlerResolver.resolveEventHandler("fnControllerMethod()", oController)[0];
		fnFromController2(oDummyEvent);
		assert.equal(oController.fnControllerMethod.callCount, 1, "Controller method without dot should be called");

		/**
		 * @deprecated
		 */
		(() => {
			sinon.spy(window.testEventHandlerResolver.subobject, "someGlobalMethod");
			var fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod()", oController)[0];
			fnFromGlobal(oDummyEvent);
			assert.equal(window.testEventHandlerResolver.subobject.someGlobalMethod.callCount, 1, "Global method should be called once");

			sinon.spy(window, "someGlobalMethodOnWindow");
			fnFromGlobal = EventHandlerResolver.resolveEventHandler("someGlobalMethodOnWindow()", oController)[0];
			fnFromGlobal(oDummyEvent);
			assert.equal(window.someGlobalMethodOnWindow.callCount, 1, "Global method without dot should be called once");
		})();
	});

	QUnit.test("Handler resolution with local variables", function(assert) {
		var oSpy = this.spy(mLocals, "someMethod");
		// immediately call the resolving handler
		EventHandlerResolver.resolveEventHandler("Module.someMethod()", oController, {Module: mLocals})[0]();
		assert.equal(oSpy.callCount, 1, "Module method should be called once");
		oSpy.resetHistory();

		// without parentheses
		EventHandlerResolver.resolveEventHandler("Module.someMethod", oController, {Module: mLocals})[0]();
		assert.equal(oSpy.callCount, 1, "Module method should be called once");
		oSpy.resetHistory();

		// test without associated controller
		EventHandlerResolver.resolveEventHandler("Module.someMethod()", null, {Module: mLocals})[0]();
		assert.equal(oSpy.callCount, 1, "Module method should be called once");
		oSpy.resetHistory();

		// without parentheses
		EventHandlerResolver.resolveEventHandler("Module.someMethod", null, {Module: mLocals})[0]();
		assert.equal(oSpy.callCount, 1, "Module method should be called once");
	});

	/**
	 * @deprecated
	 */
	QUnit.test("Log warning for usage of not properly XML-required modules", function(assert) {
		future.active = false;
		var logSpy = sinon.spy(Log, "warning");

		// immediately call the resolving handler
		EventHandlerResolver.resolveEventHandler("Module.someMethod()", oController, {Module: {}});
		assert.ok(logSpy.calledWith(sinon.match(/Event handler name 'Module.someMethod\(\)' could not be resolved to an event handler function/)));
		logSpy.resetHistory();

		// test without associated controller
		EventHandlerResolver.resolveEventHandler("Module.someMethod()", null, {Module: {}});
		assert.ok(logSpy.calledWith(sinon.match(/Event handler name 'Module.someMethod\(\)' could not be resolved to an event handler function/)));

		logSpy.restore();
		future.active = undefined;
	});

	QUnit.test("Throw error for usage of not properly XML-required modules (future=true)", function(assert) {
		future.active = true;

		const sExpectedMessage = "Event handler name 'Module.someMethod()' could not be resolved to an event handler function";
		// immediately call the resolving handler
		assert.throws(() => EventHandlerResolver.resolveEventHandler("Module.someMethod()", oController, {Module: {}}),
			new Error(sExpectedMessage),
			"Error thrown");
		// test without associated controller
		assert.throws(() => EventHandlerResolver.resolveEventHandler("Module.someMethod()", null, {Module: {}}),
			new Error(sExpectedMessage),
			"Error thrown");
		future.active = undefined;
	});

	QUnit.test("'this' context when no parenthese is present", function(assert) {
		// controller functions
		var vResolvedHandler = EventHandlerResolver.resolveEventHandler(".fnControllerMethod", oController);
		vResolvedHandler[0].call(vResolvedHandler[1], oDummyEvent);
		assert.equal(thisContext, oController, "Controller method should be called with controller as 'this' context");
		thisContext = "wrong"; // to make sure non-calls don't accidentally get the correct value

		// controller functions without dot
		vResolvedHandler = EventHandlerResolver.resolveEventHandler("fnControllerMethod", oController);
		vResolvedHandler[0].call(vResolvedHandler[1], oDummyEvent);
		assert.equal(thisContext, oController, "Controller method without dot should be called with controller as 'this' context");
		thisContext = "wrong";

		/**
		 * @deprecated
		 */
		(() => {
			// global functions
			vResolvedHandler = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod", oController);
			vResolvedHandler[0].call(vResolvedHandler[1], oDummyEvent);
			assert.equal(thisContext, oController, "Global method should be called with controller as 'this' context when there's no parenthese");
			thisContext = "wrong";

			// global functions without dot
			vResolvedHandler = EventHandlerResolver.resolveEventHandler("someGlobalMethodOnWindow", oController);
			vResolvedHandler[0].call(vResolvedHandler[1], oDummyEvent);
			assert.equal(thisContext, oController, "Global method without dot should be called with oController as 'this' context when there's no parenthese");
			thisContext = "wrong";
		})();

		// with local variables
		vResolvedHandler = EventHandlerResolver.resolveEventHandler("Module.someMethod", oController, {Module: mLocals});
		vResolvedHandler[0].call(vResolvedHandler[1], oDummyEvent);
		assert.equal(thisContext, oController, "XML-required module should be called with oController as 'this' context when there's no parenthese");
		thisContext = "wrong";
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

		/**
		 * @deprecated
		 */
		(() => {
			// global functions
			var fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod()", oController)[0];
			fnFromGlobal(oDummyEvent);
			assert.equal(thisContext, window.testEventHandlerResolver.subobject, "Global method should be called with testEventHandlerResolver.subobject as 'this' context");
			thisContext = "wrong";

			// global functions without dot
			fnFromGlobal = EventHandlerResolver.resolveEventHandler("someGlobalMethodOnWindow()", oController)[0];
			fnFromGlobal(oDummyEvent);
			assert.equal(thisContext, undefined, "Global method without dot should be called with undefined as 'this' context");
			thisContext = "wrong";

			// global functions with .call()
			fnFromGlobal = EventHandlerResolver.resolveEventHandler("testEventHandlerResolver.subobject.someGlobalMethod.call($controller)", oController)[0];
			fnFromGlobal(oDummyEvent);
			assert.equal(thisContext, oController, "Global method should be called with controller as 'this' context when set using .call($controller)");
			thisContext = "wrong";
		})();

		// with local variables
		var fnFromModule = EventHandlerResolver.resolveEventHandler("Module.someMethod()", oController, {Module: mLocals})[0];
		fnFromModule(oDummyEvent);
		assert.equal(thisContext, mLocals, "XML-required module should be called with the module as 'this' context");
		thisContext = "wrong";

		// with local variables and with .call()
		fnFromModule = EventHandlerResolver.resolveEventHandler("Module.someMethod.call($controller)", oController, {Module: mLocals})[0];
		fnFromModule(oDummyEvent);
		assert.equal(thisContext, oController, "XML-required module should be called with controller as 'this' context when set using .call($controller)");
		thisContext = "wrong";
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

			oModel = new JSONModel({
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
			{src: ".fnControllerMethod(null)", expected: null, message: "Static null value should be correctly given"}
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


	QUnit.test("bound values with controller method", function(assert) {
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
			'.fnControllerMethod(${path:\'/someModelProperty\',formatter: \'.myFormatter\'})': "#someModelValue#",   // single quotes escaped
			".fnControllerMethod(${path:\"/someModelProperty\",formatter: \".myFormatter\"})": "#someModelValue#"   // double quotes escaped
		};

		for (var sTestString in mTestSet) {
			spy.resetHistory();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController)[0];
			fnFromController(oDummyEvent);
			assert.deepEqual(spy.args[0], [mTestSet[sTestString]], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("bound values with XML-required modules", function(assert) {
		var methodSpy = this.spy(mLocals, "someMethod");
		var fnFromModule;
		var mTestSet = {
			"Module.someMethod(${/someModelProperty})": "someModelValue",   // plain, absolute binding path
			"  Module.someMethod (   ${/someModelProperty}	)  ": "someModelValue",   // some whitespace fun
			"Module.someMethod(${secondModel>someSecondModelProperty})": "someSecondModelValue",   // relative path using element binding, in named model
			"Module.someMethod(${path:'/someModelProperty'})": "someModelValue",  // complex syntax, entry-level
			"Module.someMethod(${path:'/someModelProperty', formatter: 'Module.someFormatter'})": "#someModelValue#",   // complex syntax with formatter
			"Module.someMethod(${path:'/someModelProperty', formatter: 'Module.someFormatter', type: 'sap.ui.model.type.String'})": "#someModelValue#",   // complex syntax with type
			// does not work, deep nesting of parts is not supported in EventHandlerResolver:
			//"Module.someMethod(${parts: ['/someModelProperty'], formatter: 'Module.someFormatter'})": "#someModelValue,someModelValue#",   // complex syntax with mixed parts
			"Module.someMethod(${$parameters>/someEventParameter})": "someEventParameterValue",  // another model (event parameters)
			"Module.someMethod(${$source>/someControlProperty})": "someControlPropertyValue",   // the event source model
			"Module.someMethod('Value is: ' + ${/someModelProperty})": "Value is: someModelValue",   // “calculated fields” (template string)
			"Module.someMethod(${/someModelProperty} + ',' + ${/someModelProperty})": "someModelValue,someModelValue",   // attention, also a calculated field!
			"Module.someMethod(\"Value is: \" + ${path:'/someModelProperty', formatter: 'Module.someFormatter', type: 'sap.ui.model.type.String'})": "Value is: #someModelValue#",   // calculated field with complex binding syntax
			// not allowed to use binding expressions inside because the entire string is a binding expression:
			//"Module.someMethod({= ${/someModelProperty} + ${/someModelProperty}})": "someModelValuesomeModelValue",   // expression binding
			"Module.someMethod({x: 'y', z: {a: ${/someModelProperty}}})": {x: 'y', z: {a: "someModelValue"}},   // binding in object
			'Module.someMethod(${path:\'/someModelProperty\',formatter: \'Module.someFormatter\'})': "#someModelValue#",   // single quotes escaped
			"Module.someMethod(${path:\"/someModelProperty\",formatter: \"Module.someFormatter\"})": "#someModelValue#"   // double quotes escaped
		};

		for (var sTestString in mTestSet) {
			methodSpy.resetHistory();
			fnFromModule = EventHandlerResolver.resolveEventHandler(sTestString, oController, {Module: mLocals})[0];
			fnFromModule(oDummyEvent);
			assert.deepEqual(methodSpy.args[0], [mTestSet[sTestString]], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("multiple parameters", function(assert) {
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController;
		var mTestSet = { // now the values are arrays
			".fnControllerMethod('test',${/someModelProperty})": ["test", "someModelValue"],   // two parameters
			".fnControllerMethod( 'test' ,	${/someModelProperty}	)": ["test", "someModelValue"]   // some whitespace fun
		};

		for (var sTestString in mTestSet) {
			spy.resetHistory();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController)[0];
			fnFromController(oDummyEvent);
			assert.deepEqual(spy.args[0], mTestSet[sTestString], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});


	QUnit.test("types", function(assert) {
		var mLocals = {
			IntegerType,
			DateType
		};
		var spy = sinon.spy(oController, "fnControllerMethod");
		var fnFromController;
		var mTestSet = {
			".fnControllerMethod(${path:'/someNumberProperty', type: 'IntegerType', targetType: 'int'})": 49,   // complex syntax with type
			".fnControllerMethod(${path:'/someNumberProperty', type: 'IntegerType', targetType: 'string'})": "49",   // type conversion
			".fnControllerMethod(${path:'/someDateProperty', type: 'DateType', formatOptions: {pattern: 'dd.MM.yyyy',source: {pattern: 'yyyy-MM-dd'}}})": "29.10.2011"   // type with format options
		};

		for (var sTestString in mTestSet) {
			spy.resetHistory();
			fnFromController = EventHandlerResolver.resolveEventHandler(sTestString, oController, mLocals)[0];
			fnFromController(oDummyEvent);
			assert.strictEqual(spy.args[0][0], mTestSet[sTestString], "Bound model property value should be correctly calculated for: " + sTestString);
		}
	});

	/**
	 * @deprecated
	 */
	QUnit.test("error cases (and edge cases) (future=false)", function(assert) {
		future.active = false;
		var fnFromController;

		// unclosed braces
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty)", oController)[0];
			fnFromController(oDummyEvent);
		} , function(err){
			return err.message.indexOf("no closing braces found") > -1;
		}, "Correct error should be thrown for non-matching braces");

		// unresolvable formatter
		var spy = sinon.spy(Log, "error");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${path:'/someModelProperty', formatter: '.myNotExistingFormatter'})", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 1, "Error should be logged for unresolvable formatter");
		assert.ok(spy.args[0][0].indexOf("formatter function .myNotExistingFormatter not found") > -1, "Error should be logged for unresolvable formatter");

		// globals within the expression
		spy = sinon.spy(Log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(Math.max(1))", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 2, "Warning should be logged for globals inside parameter section");
		assert.ok(spy.args[0][0].indexOf("Unsupported global identifier") > -1, "Warning should be logged for globals inside parameter section");
		Log.warning.restore();

		// wrong expression syntax
		assert.throws(function(){
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty} + {/someModelProperty})", oController)[0];
			fnFromController(oDummyEvent);
		}, function(err){
			return err.message.indexOf("Expected IDENTIFIER") > -1;
		}, "Error should be thrown for expression syntax error");

		// no expressions within
		spy = sinon.spy(Log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod({= 'abc'})", oController)[0];
		assert.equal(spy.callCount, 1, "Warning should be logged for expressions inside parameter section");
		assert.ok(spy.args[0][0].indexOf("event handler parameter contains a binding expression") > -1, "Warning should be logged for expressions inside parameter section");
		Log.warning.restore();
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
		spy = sinon.spy(Log, "warning");
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
		future.active = undefined;
	});

	QUnit.test("error cases (and edge cases) (future=true)", function(assert) {
		future.active = true;
		let fnFromController;

		// unclosed braces
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty)", oController)[0];
			fnFromController(oDummyEvent);
		} , (err) => {
			return err.message.indexOf("no closing braces found") > -1;
		}, "Correct error should be thrown for non-matching braces");

		// unresolvable formatter
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${path:'/someModelProperty', formatter: '.myNotExistingFormatter'})", oController)[0];
		assert.throws(() => fnFromController(oDummyEvent),
			new Error("formatter function .myNotExistingFormatter not found!"),
			"Error should be thrown for unresolvable formatter");

		// globals within the expression
		const spy = sinon.spy(Log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(Math.max(1))", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 2, "Warning should be logged for globals inside parameter section");
		assert.ok(spy.args[0][0].indexOf("Unsupported global identifier") > -1, "Warning should be logged for globals inside parameter section");
		Log.warning.restore();

		// wrong expression syntax
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty} + {/someModelProperty})", oController)[0];
			fnFromController(oDummyEvent);
		}, (err) => {
			return err.message.indexOf("Expected IDENTIFIER") > -1;
		}, "Error should be thrown for expression syntax error");

		// no expressions within
		assert.throws(() => EventHandlerResolver.resolveEventHandler(".fnControllerMethod({= 'abc'})", oController),
			new Error("It looks like an event handler parameter contains a binding expression ({=...}). This is not allowed because the entire event handler is already considered an expression: .fnControllerMethod({= 'abc'})"),
			"Error should be thrown for expressions inside parameter section");
		assert.throws(() => {
			fnFromController(oDummyEvent);
		}, (err) => {
			return true; // browser-dependent message
		}, "Error should be thrown for expressions inside parameter section");

		// starting with a brace
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler("(${/someModelProperty})", oController)[0];
			fnFromController(oDummyEvent);
		}, (err) => {
			return err.message.indexOf("starts with a bracket") > -1;
		}, "Error should be thrown when starting with a bracket");

		// wrong binding path
		/*	TODO: help the user detect such issues without making too much noise when an empty value is perfectly fine
		spy = sinon.spy(Log, "warning");
		fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/thisdoesnotExist})", oController)[0];
		fnFromController(oDummyEvent);
		assert.equal(spy.callCount, 1, "Warning should be logged for empty values (which may indicate wrong bindings)");
		assert.ok(spy.args[0][0].indexOf("EventHandlerResolver: no value was returned") > -1, "Warning should be logged for empty values (which may indicate wrong bindings)");
		*/

		// too many closing braces
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(${/someModelProperty}})", oController)[0];
			fnFromController(oDummyEvent);
		}, (err) => {
			return err.message.indexOf("but instead saw }") > -1;
		}, "Error should be thrown for too many closing braces");

		// non-closed single quotes
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod('x)", oController)[0];
			fnFromController(oDummyEvent);
		}, (err) => {
			return err.message.indexOf("Bad") > -1;
		}, "Error should be thrown for non-closed single quotes");

		// non-closed double quotes
		assert.throws(() => {
			fnFromController = EventHandlerResolver.resolveEventHandler(".fnControllerMethod(\"x)", oController)[0];
			fnFromController(oDummyEvent);
		}, (err) => {
			return err.message.indexOf("Bad") > -1;
		}, "Error should be thrown for non-closed double quotes");
		future.active = undefined;
	});

	QUnit.module("sap.ui.core.mvc.EventHandlerResolver - parse()");

	QUnit.test("one event handler", function (assert) {
		assert.deepEqual(EventHandlerResolver.parse(".fnControllerMethod"), [".fnControllerMethod"]);
	});

	QUnit.test("several event handlers", function (assert) {
		assert.deepEqual(
			EventHandlerResolver.parse(".fnControllerMethod; globalFunction"),
			[".fnControllerMethod", "globalFunction"]
		);
	});

	QUnit.test("several event handlers with trailing semicolon", function (assert) {
		assert.deepEqual(
			EventHandlerResolver.parse(".fnControllerMethod; globalFunction;"),
			[".fnControllerMethod", "globalFunction"]
		);
	});

	QUnit.test("several event handlers with parameters", function (assert) {
		assert.deepEqual(
			EventHandlerResolver.parse(".fnControllerMethod; .fnControllerMethod(${  path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'}    ); globalFunction"),
			[".fnControllerMethod", ".fnControllerMethod(${  path:'/someModelProperty', formatter: '.myFormatter', type: 'sap.ui.model.type.String'}    )", "globalFunction"]
		);
	});

	QUnit.test("several event handlers with parameters and string literals", function (assert) {
		assert.deepEqual(
			EventHandlerResolver.parse(".fnControllerMethod('bad);luck'); .fnControllerMethod(\"\\\");\"); globalFunction"),
			[".fnControllerMethod('bad);luck')", ".fnControllerMethod(\"\\\");\")", "globalFunction"]
		);
	});
});
