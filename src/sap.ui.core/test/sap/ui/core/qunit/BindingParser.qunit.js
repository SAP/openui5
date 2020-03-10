/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"jquery.sap.strings",
	"sap/ui/base/BindingParser",
	"sap/ui/base/ExpressionParser",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/InvisibleText",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/String",
	"sap/base/Log"
], function (jQuery, jQuery0, BindingParser, ExpressionParser, ManagedObject, InvisibleText, Filter,
	Sorter, JSONModel, Currency, Date, String, Log) {
	/*global QUnit, sinon */
	/*eslint no-warning-comments: 0 */
	"use strict";

	var enclosingContext;

	var oController = {
			mytype : String,
			myformatter : function($) { return $; },
			mytest: function(value) { return true; },
			mycompare: function(a, b) { return 0; },
			myInstancedType : new Date({
				pattern : "yyyy-MM-dd"
			}),
			myeventHandler: function () {}
		},
		oGlobalContext = {
			module1: {
				formatter : function($) { return $; },
				check : function(iValue) { return iValue > 100; },
				fn: function() {
					enclosingContext = this;
					return "fn";
				},
				ns: {
					fn: function() {
						enclosingContext = this;
						return "ns";
					}
				}
			},
			Global: {
				ns: undefined
			},
			formatter: function($) { return $; }
		},
		Global = {
			type : String,
			joiningFormatter : function () {
				return Array.prototype.join.call(arguments);
			},
			formatter : function($) { return $; },
			test: function(value) { return true; },
			compare: function(a, b) { return 0; },
			instancedType : new Date({
				pattern : "yyyy-MM-dd"
			}),
			eventHandler: function () {},
			ns: {
				global: function() {
					enclosingContext = this;
					return "global";
				}
			}
		},
		parse = ManagedObject.bindingParser,
		TestControl = ManagedObject.extend("TestControl", {
			metadata: {
				properties: {
					any: "any",
					text: "string"
				}
			}
		});

	window.Global = Global;

	function checkTextFragments(assert, fnFormatter) {
		assert.strictEqual(fnFormatter.textFragments,
			"sap.ui.base.BindingParser: composeFormatters",
			"'textFragments' (mis)used as debug information");
	}

	//*********************************************************************************************
	QUnit.module("sap.ui.base.BindingParser", {
		beforeEach : function (assert) {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();

			// create spies for all functions that are not referenced as constructors
			for ( var n in oController ) {
				if ( typeof oController[n] === 'function' && n !== 'mytype' ) {
					this.spy(oController, n);
				}
			}

			// custom assertion: actual function calls the expected function on the expected 'this'
			this.assertBoundTo = function(fnActual, fnExpected, fnExpectedThis, sMessage) {
				assert.ok(typeof fnActual === 'function' && typeof fnExpected === 'function' && typeof fnExpected.reset === 'function',
						"(assertion precondition) actual must be a function, expected must be a spy");
				fnExpected.reset();
				fnActual.call(/* arbitrary this */{}, /* arbitrary args */ "some", 42 );
				assert.ok(fnExpected.calledOnce && fnExpected.calledOn(fnExpectedThis) && fnExpected.calledWithExactly("some", 42), sMessage);
			};
		}
	});

	QUnit.test("Binding Parser", function (assert) {
		assert.strictEqual(parse, BindingParser.complexParser, "configuration should have set the right binding parser");
	});

	QUnit.test("Simple Binding", function(assert) {
		var o = parse("{model>path}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.model, "model", "binding info should contain the expected model name");
		assert.strictEqual(o.path, "path", "binding info should contain the expected pathg");
	});

	QUnit.test("Complex Binding (no quotes)", function(assert) {
		var o = parse("{model: \"some\", path: \"path\"}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.model, "some", "binding info should contain the expected model name");
		assert.strictEqual(o.path, "path", "binding info should contain the expected pathg");
	});

	QUnit.test("Complex Binding (double quotes)", function(assert) {
		var o = parse("{\"model\": \"some\", path: \"path\"}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.model, "some", "binding info should contain the expected model name");
		assert.strictEqual(o.path, "path", "binding info should contain the expected pathg");
	});

	QUnit.test("Complex Binding (single quotes)", function(assert) {
		var o = parse("{'model': \"some\", path: \"path\"}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.model, "some", "binding info should contain the expected model name");
		assert.strictEqual(o.path, "path", "binding info should contain the expected pathg");
	});

	QUnit.test("Single Binding with global formatter", function (assert) {
		var o = parse("{path:'something', formatter: 'Global.formatter'}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.strictEqual(o.type, undefined, "parse should not return a type name");
		assert.strictEqual(o.formatter, Global.formatter, "parse should return the global formatter function");
	});

	QUnit.test("Single Binding with local formatter", function (assert) {
		var o = parse("{path:'something', formatter: '.myformatter'}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.strictEqual(o.type, undefined, "parse should not return a type name");
		this.assertBoundTo(o.formatter, oController.myformatter, oController, "parse should return the local formatter function");
	});

	QUnit.test("Single Binding with global type", function (assert) {
		var o = parse("{path:'something', type: 'Global.type'}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.type instanceof String, "parse should return the global type");
		assert.strictEqual(o.formatter, undefined, "parse should return no formatter");
	});

	QUnit.test("Single Binding with required type", function (assert) {
		var o = parse("{path:'something', type: 'myType'}", /*oContext*/null, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/true, /*bPreferContext*/false,
			/*mLocals*/{myType: String});
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.type instanceof String, "parse should return the type required from mLocals");
		assert.strictEqual(o.formatter, undefined, "parse should return no formatter");
	});

	QUnit.test("Single Binding with local type", function (assert) {
		var o = parse("{path:'something', type: '.mytype'}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.type instanceof String, "parse should return the global type");
		assert.strictEqual(o.formatter, undefined, "parse should return no formatter");
	});

	QUnit.test("Single Binding with global event", function (assert) {
		var o = parse("{path:'something', events: {event: 'Global.eventHandler'}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.strictEqual(o.events.event, Global.eventHandler, "parse should return the global event handler function");
	});

	QUnit.test("Single Binding with local event", function (assert) {
		var o = parse("{path:'something', events: {event: '.myeventHandler'}}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		this.assertBoundTo(o.events.event, oController.myeventHandler, oController, "parse should return the local event handler function");
	});

	QUnit.test("Single Binding with $ in property name", function (assert) {
		var o = parse("{$params : 0, path:'something'}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.ok(o.hasOwnProperty("$params"), "binding info should have a property with name $params");
		o = parse("Some text {$params : 0, path:'something'}");
		assert.strictEqual(typeof o, "object", "parse should return a binding info");
		assert.ok(Array.isArray(o.parts) && o.parts.length === 1 && typeof o.parts[0] === "object", "binding info should contain a parts array with one element");
		assert.ok(o.parts[0].hasOwnProperty("$params"), "part should have a property with name $params");
	});

	QUnit.test("Single Binding with constraint regex", function (assert) {
		var o = parse("{path:'something' , type:'sap.ui.model.type.String', constraints:{search: '@'}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.type instanceof String, "parse should return the global type");
		assert.strictEqual(o.formatter, undefined, "parse should return the name of the formatter function");
		assert.deepEqual(o.type.oConstraints.search, /@/, "parse should return the search constraint as regex");
	});

	QUnit.test("Single Binding with instanced type", function (assert) {
		var o = parse("{path:'something', type: 'Global.instancedType'}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.type instanceof Date, "parse should return the global type");
		assert.strictEqual(o.formatter, undefined, "parse should return the name of the formatter function");
	});

	QUnit.test("Single Binding with one filter", function (assert) {
		var o = parse("{path:'something', filters: {path:'someFilterPath', operator:'EQ', value1:'someCompareValue'}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.filters instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.sPath, "someFilterPath", "filter path should return the specified path");
		assert.strictEqual(o.filters.oValue1, "someCompareValue", "compare value should be as defined");
		assert.strictEqual(o.filters.sOperator, "EQ", "operator should be as defined");
	});

	QUnit.test("Single Binding with filter and custom global test function", function (assert) {
		var o = parse("{path:'something', filters: {path:'someFilterPath', test:'Global.test'}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.filters instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.sPath, "someFilterPath", "filter path should return the specified path");
		assert.strictEqual(o.filters.fnTest, Global.test, "test function should be resolved");
	});

	QUnit.test("Single Binding with filter and custom local test function", function (assert) {
		var o = parse("{path:'something', filters: {path:'someFilterPath', test:'.mytest'}}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.filters instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.sPath, "someFilterPath", "filter path should return the specified path");
		this.assertBoundTo(o.filters.fnTest, oController.mytest, oController, "test function should be resolved");
	});

	QUnit.test("Single Binding with multiple filters", function (assert) {
		var o = parse("{path:'something', filters: [{path:'someFilterPath', operator:'EQ', value1:'someCompareValue'},{path:'someFilterPath2', operator:'BT', value1: 'someCompareValue', value2: 'someOtherCompareValue'}]}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.filters.length, 2, "two filters should be defined");
		assert.ok(o.filters[0] instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters[0].sPath, "someFilterPath", "filter path should return the specified path");
		assert.strictEqual(o.filters[0].oValue1, "someCompareValue", "compare value should be as defined");
		assert.strictEqual(o.filters[0].sOperator, "EQ", "parse should return the name of the formatter function");
		assert.ok(o.filters[1] instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters[1].sPath, "someFilterPath2", "filter path should return the specified path");
		assert.strictEqual(o.filters[1].oValue1, "someCompareValue", "compare value should be as defined");
		assert.strictEqual(o.filters[1].sOperator, "BT", "parse should return the name of the formatter function");
		assert.strictEqual(o.filters[1].oValue2, "someOtherCompareValue", "compare value should be as defined");
	});

	QUnit.test("Filter Operator 'Any' with a valid nested filter (value2)", function (assert) {
		var o = parse("{path:'something', filters: { path: 'someField', operator: 'Any', variable: 'd', condition: { " +
				"and: true, filters: [" +
					"{path:'d/someFilterPath', operator:'EQ', value1:'someCompareValue'}," +
					"{path:'s/someFilterPath2', operator:'BT', value1: 'someCompareValue', value2: 'someOtherCompareValue'}]}}}");
		assert.strictEqual(typeof o, "object", "parse should return a binding info object");
		assert.ok(o.filters instanceof Filter, "binding info should contain a single filter");
		assert.strictEqual(o.filters.sOperator, "Any", "filter should have the expected operator");
		assert.strictEqual(o.filters.sVariable, "d", "identifier (value1) should remain the same string");
		assert.ok(o.filters.oCondition instanceof Filter, "nested filter (value2) should be resolved to a Filter object");
		// some further assertions to check that the nested filter has been resolved properly
		assert.strictEqual(o.filters.oCondition.bAnd, true, "nested filter should have the 'and' flag set");
		assert.strictEqual(Array.isArray(o.filters.oCondition.aFilters) ? o.filters.oCondition.aFilters.length : -1, 2, "nested filter should have a filters array of length 2");
		assert.ok(o.filters.oCondition.aFilters[0] instanceof Filter, "items in filters array also should have been resolved");
	});

	QUnit.test("Filter Operator 'All' with a valid nested filter (value2)", function (assert) {
		var o = parse("{path:'something', filters: { path: 'someField', operator: 'All', variable: 'd', condition: { " +
				"and: true, filters: [" +
					"{path:'d/someFilterPath', operator:'EQ', value1:'someCompareValue'}," +
					"{path:'s/someFilterPath2', operator:'BT', value1: 'someCompareValue', value2: 'someOtherCompareValue'}]}}}");
		assert.strictEqual(typeof o, "object", "parse should return a binding info object");
		assert.ok(o.filters instanceof Filter, "binding info should contain a single filter");
		assert.strictEqual(o.filters.sOperator, "All", "filter should have the expected operator");
		assert.strictEqual(o.filters.sVariable, "d", "identifier (variable) should remain the same string");
		assert.ok(o.filters.oCondition instanceof Filter, "boolean expression (condition) should be resolved to a Filter object");
		// some further assertions to check that the nested filter has been resolved properly (not complete)
		assert.strictEqual(o.filters.oCondition.bAnd, true, "nested filter should have the 'and' flag set");
		assert.strictEqual(Array.isArray(o.filters.oCondition.aFilters) ? o.filters.oCondition.aFilters.length : -1, 2, "nested filter should have a filters array of length 2");
		assert.ok(o.filters.oCondition.aFilters[0] instanceof Filter, "items in filters array also should have been resolved");
	});

	QUnit.test("Filter Operator other than 'Any'/'All' with a nested filter (negative test)", function (assert) {
		// nested filter should not be resolved for operators other than Any / All
		var o = parse("{path:'something', filters: { path: 'someField', operator: 'BT', value1: 'd', value2: {path:'d/someFilterPath', operator:'EQ', value1:'someCompareValue'}}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.ok(o.filters instanceof Filter, "binding info should contain a single filter");
		assert.strictEqual(o.filters.sOperator, "BT", "filter should have the expected operator");
		assert.strictEqual(o.filters.oValue1, "d", "value1 should remain the same");
		assert.strictEqual(typeof o.filters.oValue2, "object", "value2 should be an object...");
		assert.notOk(o.filters.oValue2 instanceof Filter, "...but not a Filter");
	});

	QUnit.test("Filter Operator 'Any' with multiple nested filters (negative test)", function (assert) {
		// A filter with operator 'Any' must not accept multiple (an array of) filters in 'value2'
		assert.throws(function() {
			parse("{path:'something', filters: { path: 'someField', operator: 'Any', variable: 'd', condition: [" +
						"{path:'d/someFilterPath', operator:'EQ', value1:'someCompareValue'}," +
						"{path:'s/someFilterPath2', operator:'BT', value1: 'someCompareValue', value2: 'someOtherCompareValue'}]}}");
		}, /operator.*any.*instance.*filter/i, "operator 'Any' shouldn't accept array of conditions");
	});

	QUnit.test("Single Binding with deeply nested filters", function (assert) {
		var o = parse("{path:'something', filters: { and:false, filters: [" +
							"{path:'someFilterPath1', operator:'EQ', value1:'someCompareValue1'}," +
							"{and: true, filters: [" +
								"{path:'someFilterPath1', operator:'EQ', value1: 'someCompareValue2'}," +
								"{path:'someFilterPath2', operator:'EQ', value1: 'someCompareValue3'}" +
							"]}" +
						"]}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.ok(o.filters instanceof Filter, "parse should return the specified filter");
		assert.ok('bAnd' in o.filters, "filter should have a property 'bAnd'");
		assert.notStrictEqual(o.filters.bAnd, false, "filter should have bAnd == false (=or)"); // ideally should be strictEqual
		assert.ok(Array.isArray(o.filters.aFilters), "filter should have an array of nested filters");
		assert.strictEqual(o.filters.aFilters.length, 2, "nested filters array should have 2 entries");
		assert.ok(o.filters.aFilters[0] instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.aFilters[0].sPath, "someFilterPath1", "filter path should return the specified path");
		assert.strictEqual(o.filters.aFilters[0].oValue1, "someCompareValue1", "compare value should be as defined");
		assert.strictEqual(o.filters.aFilters[0].sOperator, "EQ", "parse should return the name of the formatter function");
		assert.ok(o.filters.aFilters[1] instanceof Filter, "parse should return the specified filter");
		assert.ok(o.filters.aFilters[1].bAnd, true, "filter should be 'and'");
		assert.ok(Array.isArray(o.filters.aFilters[1].aFilters), "filter should have an array of nested filters");
		assert.strictEqual(o.filters.aFilters[1].aFilters.length, 2, "nested filters array should have 2 entries");
		assert.ok(o.filters.aFilters[1].aFilters[0] instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.aFilters[1].aFilters[0].sPath, "someFilterPath1", "deep nested filter should have a path");
		assert.strictEqual(o.filters.aFilters[1].aFilters[0].oValue1, "someCompareValue2", "deep nested filter should have a value");
		assert.strictEqual(o.filters.aFilters[1].aFilters[0].sOperator, "EQ", "nested filter operator should be defined");
		assert.ok(o.filters.aFilters[1].aFilters[0] instanceof Filter, "parse should return the specified filter");
		assert.strictEqual(o.filters.aFilters[1].aFilters[1].sPath, "someFilterPath2", "deep nested filter should have a path");
		assert.strictEqual(o.filters.aFilters[1].aFilters[1].oValue1, "someCompareValue3", "deep nested filter should have a value");
		assert.strictEqual(o.filters.aFilters[1].aFilters[1].sOperator, "EQ", "nested filter operator should be defined");
	});

	QUnit.test("Single Binding with one sorter", function (assert) {
		var o = parse("{path:'something', sorter: {path:'someSortPath', descending: false}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.sorter instanceof Sorter, "parse should return the specified sorter");
		assert.strictEqual(o.sorter.sPath, "someSortPath", "sorter path should return the specified path");
		assert.strictEqual(o.sorter.bDescending, false, "sort should not be descending");
	});

	QUnit.test("Single Binding with sorter and custom global comparator function", function (assert) {
		var o = parse("{path:'something', sorter: {path:'someSortPath', comparator: 'Global.compare'}}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.sorter instanceof Sorter, "parse should return the specified sorter");
		assert.strictEqual(o.sorter.sPath, "someSortPath", "sorter path should return the specified path");
		assert.strictEqual(o.sorter.fnCompare, Global.compare, "compare function should be resolved");
	});

	QUnit.test("Single Binding with sorter and custom local comparator function", function (assert) {
		var o = parse("{path:'something', sorter: {path:'someSortPath', comparator: '.mycompare'}}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.ok(o.sorter instanceof Sorter, "parse should return the specified sorter");
		assert.strictEqual(o.sorter.sPath, "someSortPath", "sorter path should return the specified path");
		this.assertBoundTo(o.sorter.fnCompare, oController.mycompare, oController, "compare function should be resolved");
	});

	QUnit.test("Single Binding with multiple sorters", function (assert) {
		var o = parse("{path:'something', sorter: [{path:'someSortPath', descending: false}, {path:'someOtherSortPath', descending: true}]}");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(o.parts, undefined, "binding info should not be a composite binding info");
		assert.strictEqual(o.path, "something", "path should be as specified");
		assert.strictEqual(o.sorter.length, 2, "two filters should be defined");
		assert.ok(o.sorter[0] instanceof Sorter, "parse should return the specified sorter");
		assert.strictEqual(o.sorter[0].sPath, "someSortPath", "sorter path should return the specified path");
		assert.strictEqual(o.sorter[0].bDescending, false, "sort should not be descending");
		assert.ok(o.sorter[1] instanceof Sorter, "parse should return the specified sorter");
		assert.strictEqual(o.sorter[1].sPath, "someOtherSortPath", "sorter path should return the specified path");
		assert.strictEqual(o.sorter[1].bDescending, true, "sort should be descending");
	});

	QUnit.test("Complex binding with formatter", function (assert) {
		var o = parse("{parts: [ {path:'something', type: 'Global.type'}, {path: '/lastName'}, {path:'address/firstName', formatter: '.myformatter'} ], formatter: 'Global.formatter'}", oController);
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(typeof o.parts, "object", "binding info should be a composite binding info");
		assert.strictEqual(o.parts.length, 3, "binding info should contain three parts");
		assert.strictEqual(o.parts[0].path, "something", "parse should return the correct path for part 1");
		assert.ok(o.parts[0].type instanceof String, "parse should return the global type for part 1");
		assert.strictEqual(o.parts[0].formatter, undefined, "parse should not return a formatter for part 2");
		assert.strictEqual(o.parts[1].path, "/lastName", "parse should return the correct path for part 2");
		assert.strictEqual(o.parts[1].type, undefined, "parse should not return a type for part 2");
		assert.strictEqual(o.parts[1].formatter, undefined, "parse should not return a formatter for part 2");
		assert.strictEqual(o.parts[2].path, "address/firstName", "parse should return the correct path for part 3");
		assert.strictEqual(o.parts[2].type, undefined, "parse should not return a type for part 3");
		this.assertBoundTo(o.parts[2].formatter, oController.myformatter, oController, "parse should return the local formatter function for part 3");
		assert.strictEqual(o.formatter, Global.formatter, "parse should return the Global formatter for the complex binding");
	});

	QUnit.test("Embedded Binding (single)", function (assert) {
		var o = parse("Some prefix {path:'something', type: 'Global.type'} and some suffix");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(typeof o.parts, "object", "binding info should be a composite binding info");
		assert.strictEqual(o.parts.length, 1, "binding info should contain a single part");
		assert.ok(o.parts[0].type instanceof String, "parse should return the global type");
		assert.strictEqual(typeof o.formatter, "function", "parse should return a formatter function");
	});

	QUnit.test("Embedded Binding (multiple)", function (assert) {
		var o = parse("Some prefix {path:'something', type: 'Global.type'}, some other {/lastName} and some {address/firstName} suffix");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(typeof o.parts, "object", "binding info should be a composite binding info");
		assert.strictEqual(o.parts.length, 3, "binding info should contain three parts");
		assert.strictEqual(o.parts[0].path, "something", "parse should return the correct path for part 1");
		assert.ok(o.parts[0].type instanceof String, "parse should return the global type for part 1");
		assert.strictEqual(o.parts[0].formatter, undefined, "parse should not return a formatter for part 2");
		assert.strictEqual(o.parts[1].path, "/lastName", "parse should return the correct path for part 2");
		assert.strictEqual(o.parts[1].type, undefined, "parse should not return a type for part 2");
		assert.strictEqual(o.parts[1].formatter, undefined, "parse should not return a formatter for part 2");
		assert.strictEqual(o.parts[2].path, "address/firstName", "parse should return the correct path for part 3");
		assert.strictEqual(o.parts[2].type, undefined, "parse should not return a type for part 3");
		assert.strictEqual(o.parts[2].formatter, undefined, "parse should not return a formatter for part 3");
		assert.strictEqual(typeof o.formatter, "function", "parse should return a formatter function");
	});

	QUnit.test("Derived Formatter", function (assert) {
		var o = parse("Some prefix {path:'something', type: 'Global.type'}, some other {/lastName} and some {address/firstName} suffix");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(typeof o.parts, "object", "binding info should be a composite binding info");
		assert.strictEqual(o.parts.length, 3, "binding info should contain three parts");
		assert.strictEqual(o.formatter("abc","123","--"), "Some prefix abc, some other 123 and some -- suffix", "formatter should produce the correct string");
	});

	QUnit.test("Keep binding Strings", function (assert) {
		var o = parse("Some prefix {path:'something', type: 'Global.type'}, some other {/lastName} and some {address/firstName} suffix");
		assert.ok(!o.bindingString, "binding String should not exist in binding info object");
		BindingParser._keepBindingStrings = true;
		o = parse("Some prefix {path:'something', type: 'Global.type'}, some other {/lastName} and some {address/firstName} suffix");
		assert.ok(o.bindingString, "binding String should exist in binding info object");
		assert.strictEqual(o.bindingString, "Some prefix {path:'something', type: 'Global.type'}, some other {/lastName} and some {address/firstName} suffix", "bindingString stored correctly");
		BindingParser._keepBindingStrings = false;
	});

	QUnit.test("Escaping", function (assert) {
		var o = parse("Some pre\\{fix {path:'something', type: 'Global.type'}, some\\} other {/lastName} and } some {address/firstName} suffix");
		assert.strictEqual(typeof o, "object", "parse should return an object");
		assert.strictEqual(typeof o.parts, "object", "binding info should be a composite binding info");
		assert.strictEqual(o.parts.length, 3, "binding info should contain three parts");
		assert.strictEqual(o.formatter("","",""), "Some pre{fix , some} other  and } some  suffix", "formatter should produce the correct string");

		// without unescaping
		assert.strictEqual(parse("A simple value string"), undefined, "for a simple string, parse should not return an object");
		assert.strictEqual(parse("A simple string with an \\{escaped opening brace"), undefined, "for a string with escaped chars, parse still should not return an object");
		assert.strictEqual(parse("A simple string with an escaped closing \\}brace"), undefined, "for a string with escaped chars, parse still should not return an object");
		assert.strictEqual(parse("A simple \\\\string with an escaped backslash"), undefined, "for a string with escaped chars, parse still should not return an object");
		assert.strictEqual(parse("A simple \\\\string with multiple \\{escaped\\\} chars"), undefined, "for a string with escaped chars, parse still should not return an object");

		// with unescaping
		assert.strictEqual(parse("A simple value string",null,true), undefined, "for a simple string, parse should not return an unescaped string even when instructed to do so");
		assert.strictEqual(parse("A simple \\\\string with multiple \\{escaped\\\} chars",null,true), "A simple \\string with multiple {escaped} chars", "for a string with escaped chars, parse should return an unescaped string when instructed to do so");
	});

	QUnit.test("Context Object", function (assert) {
		var o = parse("Some prefix {path:'something', type: '.mytype', events: {event: '.myeventHandler'}}, some other {path:'/lastName', formatter: '.myformatter'}", oController);
		assert.strictEqual(o.parts.length, 2, "binding info should contain two parts");
		assert.ok(o.parts[0].type instanceof String, "parse should return the controller type for part 1");
		this.assertBoundTo(o.parts[0].events.event, oController.myeventHandler, oController, "event handler for part 1 should have been resolved to eventhandler function from controller");
		this.assertBoundTo(o.parts[1].formatter, oController.myformatter, oController, "formatter for part 2 should have been resolved to formatter function from controller");
	});

	QUnit.test("Context Object with instanced type", function (assert) {
		var o = parse("{path:'something', type: '.myInstancedType'}", oController);
		assert.ok(o.type instanceof Date, "parse should return the controller type");
	});


	[{
		expression: "{= ${birthday/day} > 10 && ${birthday/month} > 0 && ${birthday/month} < 4}",
		parts: [{path: 'birthday/day'}, {path: 'birthday/month'}, {path: 'birthday/month'}]
	}, {
		expression: "{= ${path:'birthday/day',model:'special}Name'} > 10}",
		parts: [{path: 'birthday/day', model:'special}Name'}]
	}].forEach(function(oFixture, iIndex) {

		QUnit.test("Expression binding: " + oFixture.expression , function (assert) {
			var oBindingInfo,
				oContext = {},
				oParseResult = {
					result: {
						formatter: function () {/*empty*/},
						parts: oFixture.parts
					},
					at: oFixture.expression.length - 1
				};

			this.mock(ExpressionParser).expects("parse").withExactArgs(sinon.match.func,
					oFixture.expression, 2, null, sinon.match.same(oContext))
				.returns(oParseResult);

			oBindingInfo = parse(oFixture.expression, oContext, false, false, true);

			assert.deepEqual(oBindingInfo, {
				formatter: oParseResult.result.formatter,
				parts: oFixture.parts
			}, "binding info in success case");
		});
	});

	QUnit.test("} in complex binding property value", function (assert) {
		var o = parse("{path:'birthday/day',model:'special}Name'}");
		assert.strictEqual(typeof o, "object", "parse returns an object");
		assert.strictEqual(o.path, "birthday/day");
		assert.strictEqual(o.model, "special}Name");
	});

	QUnit.test("Expression binding: propagate ExpressionParser exception", function (assert) {
		var oError = new Error("error message"),
			sInput = "{=invalid}";

		this.mock(ExpressionParser).expects("parse")
			.withExactArgs(sinon.match.func, sInput, 2, null, null)
			.throws(oError);

		assert.throws(function () {
			parse(sInput);
		}, oError);
	});

	QUnit.test("Expression binding: expression binding must end with }", function (assert) {
		var sInput = "{='foo',}",
			sMsg = "Expected '}' and instead saw ',' in expression binding {='foo',} at position 7";

		this.mock(ExpressionParser).expects("parse")
			.withExactArgs(sinon.match.func, sInput, 2, null, null)
			.returns({at: sInput.length - 2, result: {}});

		assert.throws(function () {
			parse(sInput);
		}, {message : sMsg, name : "SyntaxError"});
	});

	QUnit.test("mergeParts w/o root formatter", function (assert) {
		var oBindingInfo = {
				parts : [
					parse("{:= ${/foo} + '>' + ${path:'/bar'}}"),
					{formatter : function (oValue) { return "*" + oValue + "*"; }, path : "/foo"},
					parse("{:= ${/bar} + '<' + ${path:'/foo'}}")
				]
			},
			oModel = new JSONModel({bar : "world", foo : "hello"}),
			oControl = new TestControl({
				models: oModel
			});

		BindingParser.mergeParts(oBindingInfo);

		oControl.bindProperty("text", oBindingInfo);
		assert.strictEqual(oControl.getText(), "hello>world *hello* world<hello");
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts w/o any formatter", function (assert) {
		var oBindingInfo = {
				parts : [
					{parts : [{path : '/foo'}, {path : '/bar'}]},
					{parts : [{path : '/bar'}, {path : '/foo'}]}
				]
			},
			oModel = new JSONModel({bar : "world", foo : "hello"}),
			oControl = new TestControl({
				models: oModel
			});

		BindingParser.mergeParts(oBindingInfo);

		assert.deepEqual(oBindingInfo.parts,
			[{path : '/foo'}, {path : '/bar'}, {path : '/bar'}, {path : '/foo'}]);
		oControl.bindProperty("text", oBindingInfo);
		assert.strictEqual(oControl.getText(), "hello world world hello");
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts w/ root formatter", function (assert) {
		var oModel = new JSONModel({bar : "world", foo : "hello"}),
			oControl = new TestControl({
				models: oModel
			}),
			oBindingInfo = {
				formatter : function () {
					assert.strictEqual(this, oControl, "formatter: 'this' is kept");
					return "*" + Array.prototype.join.call(arguments) + "*";
				},
				parts : [
					parse("{:= ${/foo} + '>' + ${path:'/bar'}}"),
					{path : "/foo"},
					parse("{:= ${/bar} + '<' + ${path:'/foo'}}")
				]
			};

		BindingParser.mergeParts(oBindingInfo);

		oControl.bindProperty("text", oBindingInfo);
		assert.strictEqual(oControl.getText(), "*hello>world,hello,world<hello*");
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts w/ root formatter JSON.stringify", function (assert) {
		var oBindingInfo = {
				formatter : function () {
					// turn arguments into a real array and return its JSON representation
					var aArray = Array.prototype.slice.apply(arguments);
					return JSON.stringify.call(JSON, aArray);
				},
				parts : [
					parse("{:= ${/foo} + '>' + ${path:'/bar'}}"),
					{path : "/foo"},
					{parts : [{path : '/forty2'}]} // Note: 42 should not be turned into a string!
				]
			},
			oModel = new JSONModel({bar : "world", foo : "hello", forty2 : 42}),
			oControl = new TestControl({
				models: oModel
			});

		BindingParser.mergeParts(oBindingInfo);

		oControl.bindProperty("text", oBindingInfo);
		assert.strictEqual(oControl.getText(), '["hello>world","hello",42]');
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts w/ root formatter: 'textFragments' kept", function (assert) {
		var oBindingInfo = {
				formatter : function () {},
				parts : [
					parse("{:= ${/foo} + '>' + ${path:'/bar'}}"),
					{path : "/foo"},
					parse("{:= ${/bar} + '<' + ${path:'/foo'}}")
				]
			};

		oBindingInfo.formatter.textFragments = "abc";

		BindingParser.mergeParts(oBindingInfo);

		assert.strictEqual(oBindingInfo.formatter.textFragments, "abc", "'textFragments' kept");
	});

	QUnit.test("mergeParts fails for unsupported properties", function (assert) {
		assert.throws(function () {
			BindingParser.mergeParts({
				parts : [
					{foo : "bar"}, // w/o parts, all properties are supported
					{formatter : function () {}, mode : "OneWay", parts : []}
				]
			});
		}, /Unsupported property: mode/);
	});
	//TODO have mergeParts fail on hierarchies with more than two levels?

	QUnit.test("mergeParts fails for unsupported properties, error is logged", function (assert) {
		var sBinding
			= "{:= ${parts:[{path:'/foo'},{path:'/bar'}],type:'sap.ui.model.type.Currency'} }",
			oBindingInfo;

		this.oLogMock.expects("error")
			.withExactArgs("Cannot merge parts: Unsupported property: type", sBinding,
				"sap.ui.base.BindingParser");

		//TODO complex binding with type: does not work (but is left untouched by mergeParts())
		oBindingInfo = parse(sBinding);
//		assert.throws(function () {
//			oControl.bindProperty("text", oBindingInfo);
//			assert.strictEqual(oControl.getText(), "foo0.00", "foo0.00");
//		});

		assert.strictEqual(oBindingInfo.parts.length, 1,
			"# embedded bindings in composite binding");
		assert.ok(oBindingInfo.parts[0].type instanceof Currency);
	});

	QUnit.test("mergeParts with constants and part with empty path", function (assert) {
		var oBindingInfo = {
				formatter : function () {
					// turn arguments into a real array and return its JSON representation
					var aArray = Array.prototype.slice.apply(arguments);
					return JSON.stringify.call(JSON, aArray);
				},
				parts : [
					{path : '/foo'},
					{parts : [{path : '/foo'}, {path : '/bar'}]},
					{path : ''},
					"",
					false,
					0,
					{foo : "bar"},
					null,
					undefined,
					[]
				]
			},
			aExpectedArray = [
				"hello", "hello world", "moon", "", false, 0, {foo : "bar"}, null, undefined, []
			],
			oModel = new JSONModel({bar : "world", baz : "moon", foo : "hello"}),
			oControl = new TestControl({
				models: oModel
			});

		BindingParser.mergeParts(oBindingInfo);

		assert.deepEqual(oBindingInfo.parts,
			[{path : '/foo'}, {path : '/foo'}, {path : '/bar'}, {path : ''}]);
		oControl.bindProperty("text", oBindingInfo);
		oControl.setBindingContext(oModel.createBindingContext('/baz'));
		assert.strictEqual(oControl.getText(), JSON.stringify(aExpectedArray));
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts with constants only", function (assert) {
		var oBindingInfo = {
				parts : [
					"",
					false,
					0
				]
			},
			oControl = new TestControl();

		BindingParser.mergeParts(oBindingInfo);

		assert.deepEqual(oBindingInfo.parts, []);
		oControl.bindProperty("text", oBindingInfo);
		assert.strictEqual(oControl.getText(), " false 0");
		checkTextFragments(assert, oBindingInfo.formatter);
	});

	QUnit.test("mergeParts with single constant", function (assert) {
		["", false, 0, null, undefined, []].forEach(function (vConstant) {
			var oBindingInfo = {parts : [vConstant]},
				oControl = new TestControl();

			BindingParser.mergeParts(oBindingInfo);

			assert.deepEqual(oBindingInfo.parts, []);
			checkTextFragments(assert, oBindingInfo.formatter);

			assert.strictEqual(oBindingInfo.formatter(), vConstant);

			// Note: sap.ui.base.ManagedObject#validateProperty maps null to undefined
			oControl.bindProperty("any", oBindingInfo);
			assert.strictEqual(oControl.getAny(), oControl.validateProperty("any", vConstant));

			oControl.bindProperty("text", oBindingInfo);
			assert.strictEqual(oControl.getText(), oControl.validateProperty("text", vConstant));
		});
	});

	QUnit.test("functionsNotFound", function (assert) {
		//TODO "{parts:[{path:'/foo',formatter:'foo'},{path:'/bar',formatter:'bar'}]}"
		//     formatters inside parts are not supported?!

		var sBinding = "{path:'/foo',formatter:'foo'} {path:'/bar',formatter:'.bar'}",
			oBindingInfo;

		// bTolerateFunctionsNotFound = false
		this.oLogMock.expects("error").withExactArgs("formatter function foo not found!");
		this.oLogMock.expects("error").withExactArgs("formatter function .bar not found!");

		parse(sBinding, null, true, /*bTolerateFunctionsNotFound*/false);

		// bTolerateFunctionsNotFound = true
		oBindingInfo = parse(sBinding, null, true, /*bTolerateFunctionsNotFound*/true);

		assert.deepEqual(oBindingInfo.functionsNotFound, ["foo", ".bar"]);
	});

	QUnit.test("Expression binding: usage in composite binding", function (assert) {
		var oBindingInfo,
			oControl = new TestControl(),
			oModel = new JSONModel({p1 : 0, p2 : "foo", p3 : "bar", p4 : 1});

		oControl.setModel(oModel);
		oControl.setModel(oModel, "model");

		// code under test
		oBindingInfo = parse("prefix {= ${/p1} + 10} {= ${/p2} + ${/p3}} {= ${/p4} + 20}");

		assert.strictEqual(oBindingInfo.formatter(0, "foo", "bar", 1), "prefix 10 foobar 21");
		assert.strictEqual(oBindingInfo.parts.length, 4,
			"# embedded bindings in composite binding");
		assert.strictEqual(oBindingInfo.parts[0].path, "/p1");
		assert.strictEqual(oBindingInfo.parts[1].path, "/p2");
		assert.strictEqual(oBindingInfo.parts[2].path, "/p3");
		assert.strictEqual(oBindingInfo.parts[3].path, "/p4");

		// code under test
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foobar 21", "prefix 10 foobar 21");

		// composite binding with simple binding (no parts) + binding with parts
		oBindingInfo = parse("prefix {= ${/p1} + 10} {/p2}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foo", "prefix 10 foo");

		// ...the other way 'round
		oBindingInfo = parse("prefix {/p2} {= ${/p1} + 10}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix foo 10", "prefix foo 10");

		// composite binding with simple binding syntax: model>path
		oBindingInfo = parse("prefix {= ${model>/p1} + 10} {model>/p2}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foo",
			"composite binding with simple binding syntax: model>path");

		// composite binding with complex binding syntax: path
		oBindingInfo = parse("prefix {= ${path:'/p1'} + 10} {path:'/p2'}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foo",
			"composite binding with complex binding syntax: path");

		// composite binding with complex binding syntax: model
		oBindingInfo = parse("prefix {= ${model:'model',path:'/p1'} + 10} {path:'/p2'}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foo",
			"composite binding with complex binding syntax: model");

		// constant expression
		oBindingInfo = parse("prefix {= 10} {/p2}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 10 foo", "prefix 10 foo");

		// complex binding with parts
		oBindingInfo = parse("prefix {parts:[{path:'/p1'},{path:'/p2'},{path:'/p3'}],"
			+ "formatter:'Global.joiningFormatter'}");
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "prefix 0,foo,bar", "prefix 0,foo,bar");
	});

	QUnit.test("Expression binding: use global context", function (assert) {
		var oBindingInfo,
			oControl = new TestControl(),
			oModel = new JSONModel({value : 99, p1 : "foo", p2 : "bar"});

		oControl.setModel(oModel);

		oBindingInfo = parse("{= module1.check(${/value}) ? ${/p1} : ${/p2}}", /*oContext*/null,
			/*bUnescape*/false, /*bTolerateFunctionsNotFound*/false,
			/*bStaticContext*/false, /*bPreferContext*/false, /*mGlobals*/oGlobalContext);
		oControl.bindProperty("text", oBindingInfo);

		assert.strictEqual(oControl.getText(), "bar", "bar");
	});

	QUnit.test("parseExpression: uses Expression.parse", function (assert) {
		var sInput = "foo",
			iStart = 0,
			oResult = {};

		this.mock(ExpressionParser).expects("parse")
			.withExactArgs(sinon.match.func, sInput, iStart, undefined).returns(oResult);

		assert.strictEqual(BindingParser.parseExpression(sInput, iStart), oResult);
	});

	QUnit.test("parseExpression: oEnv, mGlobals", function (assert) {
		var oEnv = {},
			mGlobals = {},
			sInput = "foo",
			iStart = 0,
			oResult = {};

		this.mock(ExpressionParser).expects("parse")
			.withExactArgs(sinon.match.func, sInput, iStart, sinon.match.same(mGlobals))
			.returns(oResult);

		// code under test
		assert.strictEqual(BindingParser.parseExpression(sInput, iStart, oEnv, mGlobals), oResult);
	});
	//TODO how to really test that oEnv is passed to resolveEmbeddedBinding.bind?

	QUnit.test("parseExpression: resolving", function (assert) {
		var sExpression = "[${/blue}?'blue':'red']",
			oInvisibleText = new InvisibleText(),
			oResult = BindingParser.parseExpression(sExpression, 1),
			oModel = new JSONModel({blue: false});

		assert.strictEqual(oResult.at, sExpression.length - 1);
		oInvisibleText.setModel(oModel);
		oInvisibleText.bindProperty("text", oResult.result);
		assert.strictEqual(oInvisibleText.getText(), "red");

		oModel.setProperty("/blue", true);
		assert.strictEqual(oInvisibleText.getText(), "blue");
	});

	QUnit.test("Expression binding: one time binding", function (assert) {
		var oModel = new JSONModel({blue: false}),
			oInvisibleText = new InvisibleText({models : oModel});

		oInvisibleText.bindProperty("text", parse("{:= ${/blue} ? 'blue' : 'red' }"));
		assert.strictEqual(oInvisibleText.getText(), "red");

		oModel.setProperty("/blue", true);
		assert.strictEqual(oInvisibleText.getText(), "red", "one time binding -> value unchanged");

		oInvisibleText.bindProperty("text", parse("{/blue} {:= 'green' }"));
		assert.strictEqual(oInvisibleText.getText(), "true green");
	});

	QUnit.test("Expression binding: one time binding inside composite binding", function (assert) {
		var oModel = new JSONModel({blue: false}),
			oInvisibleText = new InvisibleText({models : oModel});

		oInvisibleText.bindProperty("text", parse("*{:= ${/blue} ? 'blue' : 'red' }*"));
		assert.strictEqual(oInvisibleText.getText(), "*red*");

		oModel.setProperty("/blue", true);
		assert.strictEqual(oInvisibleText.getText(), "*red*", "one time binding -> value unchanged");
	});

	QUnit.test("Local functions are bound to context", function (assert) {
		var sBinding = "{path : '/', formatter : '.foo'}",
			oBindingInfo,
			oScope = {
				foo : function () {
					assert.strictEqual(this, oBindingInfo, "no Function#bind() used");
				}
			};

		oBindingInfo = parse(sBinding, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/true);

		oBindingInfo.formatter();
	});

	QUnit.test("Scope access w/o dot", function (assert) {
		var sBinding1 = "{path : '/', formatter : 'foo'}",
			sBinding2 = "{path : '/', formatter : 'Global.formatter'}",
			oBindingInfo,
			oScope = {
				foo : function () {}
			};

		oBindingInfo = parse(sBinding1, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/true);

		assert.strictEqual(oBindingInfo.formatter, undefined);
		assert.deepEqual(oBindingInfo.functionsNotFound, ["foo"]);

		oBindingInfo = parse(sBinding1, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/true, /*bPreferContext*/true);

		assert.strictEqual(oBindingInfo.formatter, oScope.foo);

		oBindingInfo = parse(sBinding2, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/true);

		assert.strictEqual(oBindingInfo.formatter, Global.formatter);
	});

	QUnit.test("Scope access w/o dot by given static context", function (assert) {
		var sBinding1 = "{path : '/', formatter : 'foo'}",
			sBinding2 = "{path : '/', formatter : 'Global.formatter'}",
			sBinding3 = "{path : '/', formatter : 'module1.formatter'}",
			sBinding4 = "{path : '/', formatter : 'module1.fn'}",
			sBinding5 = "{path : '/', formatter : 'module1.ns.fn'}",
			sBinding6 = "{path : '/', formatter : 'Global.ns.global'}",
			sBinding7 = "{path : '/', formatter : 'formatter'}",
			oBindingInfo,
			oScope = {
				foo : function () {}
			};

		oBindingInfo = parse(sBinding1, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter, undefined);
		assert.deepEqual(oBindingInfo.functionsNotFound, ["foo"]);

		oBindingInfo = parse(sBinding1, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/true, /*bPreferContext*/true,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter, oScope.foo);
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		oBindingInfo = parse(sBinding2, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter, undefined);
		assert.deepEqual(oBindingInfo.functionsNotFound, ["Global.formatter"]);

		oBindingInfo = parse(sBinding3, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter.toString(),
			oGlobalContext.module1.formatter.bind(oGlobalContext.module1).toString());
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		oBindingInfo = parse(sBinding4, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter.toString(),
			oGlobalContext.module1.fn.bind(oGlobalContext.module1).toString());

		oBindingInfo.formatter();
		assert.strictEqual(enclosingContext, oGlobalContext.module1);
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		oBindingInfo = parse(sBinding5, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter.toString(),
			oGlobalContext.module1.ns.fn.bind(oGlobalContext.module1.ns.fn).toString());

		oBindingInfo.formatter();
		assert.strictEqual(enclosingContext, oGlobalContext.module1.ns);
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		oBindingInfo = parse(sBinding6, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/true, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter, undefined);
		assert.deepEqual(oBindingInfo.functionsNotFound, ["Global.ns.global"]);

		oBindingInfo = parse(sBinding6, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false);

		assert.strictEqual(oBindingInfo.formatter.toString(),
			Global.ns.global.toString());

		oBindingInfo.formatter();
		assert.strictEqual(enclosingContext, oBindingInfo);
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		oBindingInfo = parse(sBinding7, oScope, /*bUnescape*/false,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			/*mGlobals*/oGlobalContext);

		assert.strictEqual(oBindingInfo.formatter,
			oGlobalContext.formatter, "function module");
		assert.deepEqual(oBindingInfo.functionsNotFound, undefined);

		// cleanup
		enclosingContext = null;
	});

	QUnit.test("Expression binding with embedded composite binding", function (assert) {
		var sBinding
			= "{:= ${parts:['m2>/foo',{path:'/bar'}],formatter:'Global.joiningFormatter'} }",
			oModel = new JSONModel({"bar" : 1}),
			oModel2 = new JSONModel({"foo" : 0}),
			oInvisibleText = new InvisibleText({models : {undefined : oModel, "m2" : oModel2}});

		// code under test
		oInvisibleText.bindProperty("text", parse(sBinding));

		assert.strictEqual(oInvisibleText.getText(), "0,1");
		oModel.setProperty("/bar", 42);
		assert.strictEqual(oInvisibleText.getText(), "0,1", "one time binding -> value unchanged");
	});

	QUnit.test("Single expression binding, no mergeParts needed", function (assert) {
		var oModel = new JSONModel({"foo" : 0, "bar" : 1}),
			oInvisibleText = new InvisibleText({models : oModel});

		this.mock(BindingParser).expects("mergeParts").never();

		// code under test
		oInvisibleText.bindProperty("text", parse("{:= ${/foo} + ${/bar} }"));

		assert.strictEqual(oInvisibleText.getText(), "1");
		oModel.setProperty("/foo", 42);
		assert.strictEqual(oInvisibleText.getText(), "1", "one time binding -> value unchanged");
	});

	QUnit.test("BindingParser.simpleParser.escape", function (assert) {
		assert.strictEqual(BindingParser.simpleParser.escape("{foo}"), "{foo}");
	});

	QUnit.test("BindingParser.complexParser.escape", function (assert) {
		assert.strictEqual(BindingParser.complexParser.escape("{foo}"), "\\{foo\\}");
	});

	QUnit.test("BindingParser.parseExpression", function (assert) {
		var sInput = "[${namespace==='GWSAMPLE_BASIC']/entityType",
			sMessage = "no closing braces found in '" + sInput + "' after pos:2";

		this.oLogMock.expects("error")
			.withExactArgs(sMessage, undefined, "sap.ui.base.ExpressionParser");
		assert.throws(function () {
			BindingParser.parseExpression(sInput, 1);
		}, new SyntaxError(sMessage));
	});

	QUnit.test("BindingParser.simpleParser", function (assert) {
		assert.deepEqual(BindingParser.simpleParser("{/some/random/path}"), {
			"path": "/some/random/path"
		});
		assert.deepEqual(BindingParser.simpleParser("/some/random/path}"), undefined);
		assert.deepEqual(BindingParser.simpleParser("{/some/random/path"), undefined);
	});
});
