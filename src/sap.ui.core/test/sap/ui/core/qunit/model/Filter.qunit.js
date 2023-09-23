/* global  QUnit */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Configuration, Filter, FilterOperator) {
	"use strict";

	var sDefaultLanguage = Configuration.getLanguage();

	QUnit.module("sap.ui.model.Filter", {
		beforeEach : function () {
			Configuration.setLanguage("en-US");
		},

		afterEach : function () {
			Configuration.setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("Filter getters", function (assert) {
		var bAnd = "~truthy~",
			bCaseSensitive = "~bCaseSensitive~",
			fnComparator = function () {},
			sCondition = "condition",
			aFilters = [new Filter("path2", "operator", "value1")],
			sOperator = "operator",
			sPath = "path",
			fnTest = function () {},
			sValue1 = "value1",
			sValue2 = "value2",
			sVariable = "variable",
			oFilterInfo = {
				and : bAnd,
				caseSensitive : bCaseSensitive,
				comparator : fnComparator,
				condition : sCondition,
				filters : aFilters,
				operator : sOperator,
				path : sPath,
				test : fnTest,
				value1 : sValue1,
				value2 : sValue2,
				variable : sVariable
			},
			oFilter = new Filter(oFilterInfo);

		// code under test (object notation of vFilterInfo used in constructor)
		assert.strictEqual(oFilter.isAnd(), true);
		assert.strictEqual(oFilter.isCaseSensitive(), bCaseSensitive);
		assert.deepEqual(oFilter.getFilters(), aFilters);
		assert.notStrictEqual(oFilter.getFilters(), aFilters);
		assert.strictEqual(oFilter.getComparator(), fnComparator);
		assert.strictEqual(oFilter.getCondition(), sCondition);
		assert.strictEqual(oFilter.getOperator(), sOperator);
		assert.strictEqual(oFilter.getPath(), sPath);
		assert.strictEqual(oFilter.getValue1(), sValue1);
		assert.strictEqual(oFilter.getValue2(), sValue2);
		assert.strictEqual(oFilter.getVariable(), sVariable);
		assert.strictEqual(oFilter.getTest(), fnTest);

		oFilter = new Filter(sPath, sOperator, sValue1, sValue2);

		// code under test (non-object notation used in constructor)
		assert.strictEqual(oFilter.getPath(), sPath);
		assert.strictEqual(oFilter.getOperator(), sOperator);
		assert.strictEqual(oFilter.getValue1(), sValue1);
		assert.strictEqual(oFilter.getValue2(), sValue2);

		delete oFilterInfo.filters;
		delete oFilterInfo.and;
		oFilterInfo.aFilters = aFilters;
		oFilterInfo.bAnd = 0; // some falsy value
		oFilter = new Filter(oFilterInfo);

		// code under test (legacy names used in constructor)
		assert.strictEqual(oFilter.isAnd(), false);
		assert.deepEqual(oFilter.getFilters(), aFilters);
		assert.notStrictEqual(oFilter.getFilters(), aFilters);

		// code under test (aFilters is undefined)
		assert.strictEqual(new Filter({
			path : sPath,
			operator : sOperator,
			value1 : sValue1
		}).getFilters(), undefined);
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare with language tag", function (assert) {
		var oConfigurationMock = this.mock(Configuration);

		oConfigurationMock.expects("getLanguageTag").withExactArgs().returns("foo");
		this.mock(String.prototype).expects("localeCompare")
			.withExactArgs("~b", "foo")
			.on("~a")
			.returns("bar");

		// code under test
		assert.strictEqual(Filter.defaultComparator("~a", "~b"), "bar");

		// Otherwise, the call in "afterEach" leads to an error.
		oConfigurationMock.verify();
	});

	//*********************************************************************************************
	QUnit.test("defaultComparator: localeCompare for different locales", function (assert) {
		Configuration.setLanguage("de");

		// code under test
		assert.strictEqual(Filter.defaultComparator("ä", "z"), -1);

		Configuration.setLanguage("sv");

		// code under test
		assert.strictEqual(Filter.defaultComparator("ä", "z"), 1);
	});

	QUnit.test("constructor - create Filter Any/All - ok", function (assert) {
		// "Any", object syntax
		var oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.Any,
			variable: "d",
			condition: new Filter(FilterOperator.EQ, 200)
		});
		assert.ok(oFilter.getMetadata().isA("sap.ui.model.Filter"), "Filter created");
		assert.ok(true, "Filter 'Any' is created without an error");

		// "Any" without variable and condition (object syntax)
		oFilter = new Filter({
			path: "Order_Details",
			operator: FilterOperator.Any
		});
		assert.ok(true, "Filter 'Any' is created without an error");
	});

	QUnit.test("constructor - wrong args", function (assert) {
		var sLegacyAnyAll = "The filter operators 'Any' and 'All' are only supported with the "
				+ "parameter object notation.";

		//"Any" and "All" with legacy syntax
		assert.throws(
			function() {
				return new Filter("test", FilterOperator.Any, "notSupported", new Filter());
			},
			new Error(sLegacyAnyAll),
			"'Any' is not accepted with legacy syntax"
		);
		assert.throws(
			function() {
				return new Filter("test", FilterOperator.All, "notSupported", new Filter());
			},
			new Error(sLegacyAnyAll),
			"'All' is not accepted with legacy syntax"
		);
		assert.throws(
			function() {
				return new Filter("test", FilterOperator.Any);
			},
			new Error(sLegacyAnyAll),
			"'Any' is not accepted with legacy syntax and missing 3rd and 4th argument"
		);

		// "Any" with missing args, object syntax
		assert.throws(
			function() {
				return new Filter({
					path: "foo",
					operator: FilterOperator.Any,
					variable: "blub"
				});
			},
			new Error("When using the filter operator 'Any', a lambda variable and a condition have"
				+ " to be given or neither."),
			"Error thrown if condition is Missing in 'Any'."
		);

		// "All" with missing args, object syntax
		assert.throws(
			function() {
				return new Filter({
					path: "foo",
					operator: FilterOperator.All,
					variable: "blub"
				});
			},
			new Error("When using the filter operator 'Any' or 'All', a valid instance of "
				+ "sap.ui.model.Filter has to be given as argument 'condition'."),
			"Error thrown if condition is Missing in 'All'."
		);

		// "All" with no args, object syntax
		assert.throws(
			function() {
				return new Filter({
					path: "foo",
					operator: FilterOperator.All
				});
			},
			new Error("When using the filter operators 'Any' or 'All', a string has to be given as "
				+ "argument 'variable'."),
			"Error thrown if no args are given with 'All' operator"
		);
	});

	QUnit.test("Simple filters", function (assert) {

		assert.deepEqual(new Filter("path", FilterOperator.EQ, "value").getAST(), {
			type: "Binary",
			op: "==",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "EQ operator");

		assert.deepEqual(new Filter("path", FilterOperator.NE, "value").getAST(), {
			type: "Binary",
			op: "!=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "NE operator");

		assert.deepEqual(new Filter("path", FilterOperator.GT, "value").getAST(), {
			type: "Binary",
			op: ">",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "GT operator");

		assert.deepEqual(new Filter("path", FilterOperator.LT, "value").getAST(), {
			type: "Binary",
			op: "<",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "LT operator");

		assert.deepEqual(new Filter("path", FilterOperator.GE, "value").getAST(), {
			type: "Binary",
			op: ">=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "GE operator");

		assert.deepEqual(new Filter("path", FilterOperator.LE, "value").getAST(), {
			type: "Binary",
			op: "<=",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "LE operator");

		assert.deepEqual(new Filter("path", FilterOperator.BT, "value1", "value2").getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Binary",
				op: ">=",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "<=",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "BT operator");

		assert.deepEqual(new Filter("path", FilterOperator.NB, "value1", "value2").getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "<",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: ">",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "NB operator");

		assert.deepEqual(new Filter("path", FilterOperator.Contains, "value").getAST(), {
			type: "Call",
			name: "contains",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "Contains operator");

		assert.deepEqual(new Filter("path", FilterOperator.StartsWith, "value").getAST(), {
			type: "Call",
			name: "startswith",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "StartsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.EndsWith, "value").getAST(), {
			type: "Call",
			name: "endswith",
			args: [
				{
					type: "Reference",
					path: "path"
				},
				{
					type: "Literal",
					value: "value"
				}
			]
		}, "EndsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotContains, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "contains",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotContains operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotStartsWith, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "startswith",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotStartsWith operator");

		assert.deepEqual(new Filter("path", FilterOperator.NotEndsWith, "value").getAST(), {
			type: "Unary",
			op: "!",
			arg: {
				type: "Call",
				name: "endswith",
				args: [
					{
						type: "Reference",
						path: "path"
					},
					{
						type: "Literal",
						value: "value"
					}
				]
			}
		}, "NotEndsWith operator");
	});

	QUnit.test("Multi filters", function (assert) {
		var oFilter;

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Binary",
			op: "==",
			left: {
				type: "Reference",
				path: "path"
			},
			right: {
				type: "Literal",
				value: "value"
			}
		}, "Multifilter containing a single filter");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "Multifilter containing two filters ORed");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2"),
			new Filter("path", FilterOperator.EQ, "value3")
		]);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "||",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path"
					},
					right: {
						type: "Literal",
						value: "value3"
					}
				}
			}
		}, "Multifilter containing three filters ORed");

		oFilter = new Filter([
			new Filter("path", FilterOperator.EQ, "value1"),
			new Filter("path", FilterOperator.EQ, "value2")
		], true);
		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value1"
				}
			},
			right: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "path"
				},
				right: {
					type: "Literal",
					value: "value2"
				}
			}
		}, "Multifilter containing two filters ANDed");

		oFilter = new Filter([
			new Filter([
				new Filter("path1", FilterOperator.EQ, "value1"),
				new Filter("path1", FilterOperator.EQ, "value2")
			]),
			new Filter([
				new Filter("path2", FilterOperator.EQ, "value1"),
				new Filter("path2", FilterOperator.EQ, "value2")
			])
		], true);

		assert.deepEqual(oFilter.getAST(), {
			type: "Logical",
			op: "&&",
			left: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path1"
					},
					right: {
						type: "Literal",
						value: "value1"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path1"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				}
			},
			right: {
				type: "Logical",
				op: "||",
				left: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path2"
					},
					right: {
						type: "Literal",
						value: "value1"
					}
				},
				right: {
					type: "Binary",
					op: "==",
					left: {
						type: "Reference",
						path: "path2"
					},
					right: {
						type: "Literal",
						value: "value2"
					}
				}
			}
		}, "Multifilter nested OR in AND");

	});

	QUnit.test("Lambda filters", function (assert) {
		var oFilter;

		oFilter = new Filter({
			operator: "Any",
			path: "path",
			variable: "item",
			condition: new Filter("item/path", FilterOperator.EQ, "value")
		});
		assert.deepEqual(oFilter.getAST(), {
			type: "Lambda",
			op: "Any",
			ref: {
				type: "Reference",
				path: "path"
			},
			variable: {
				type: "Variable",
				name: "item"
			},
			condition: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "item/path"
				},
				right: {
					type: "Literal",
					value: "value"
				}
			}
		}, "Lambdafilter Any");

		oFilter = new Filter({
			operator: "All",
			path: "path",
			variable: "item",
			condition: new Filter("item/path", FilterOperator.EQ, "value")
		});
		assert.deepEqual(oFilter.getAST(), {
			type: "Lambda",
			op: "All",
			ref: {
				type: "Reference",
				path: "path"
			},
			variable: {
				type: "Variable",
				name: "item"
			},
			condition: {
				type: "Binary",
				op: "==",
				left: {
					type: "Reference",
					path: "item/path"
				},
				right: {
					type: "Literal",
					value: "value"
				}
			}
		}, "Lambdafilter All");
	});

	QUnit.test("Origin information", function (assert) {
		assert.equal(new Filter("path", FilterOperator.EQ, "value").getAST(true).origin, "EQ");
		assert.equal(new Filter("path", FilterOperator.NE, "value").getAST(true).origin, "NE");
		assert.equal(new Filter("path", FilterOperator.GT, "value").getAST(true).origin, "GT");
		assert.equal(new Filter("path", FilterOperator.LT, "value").getAST(true).origin, "LT");
		assert.equal(new Filter("path", FilterOperator.BT, "value").getAST(true).origin, "BT");
		assert.equal(new Filter("path", FilterOperator.NB, "value").getAST(true).origin, "NB");
		assert.equal(new Filter("path", FilterOperator.Contains, "value").getAST(true).origin, "Contains");
		assert.equal(new Filter("path", FilterOperator.StartsWith, "value").getAST(true).origin, "StartsWith");
		assert.equal(new Filter("path", FilterOperator.EndsWith, "value").getAST(true).origin, "EndsWith");
		assert.equal(new Filter("path", FilterOperator.NotContains, "value").getAST(true).origin, "NotContains");
		assert.equal(new Filter("path", FilterOperator.NotStartsWith, "value").getAST(true).origin, "NotStartsWith");
		assert.equal(new Filter("path", FilterOperator.NotEndsWith, "value").getAST(true).origin, "NotEndsWith");
		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value"),
			new Filter("path", FilterOperator.EQ, "value")
		], false).getAST(true).origin, "OR");
		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value"),
			new Filter("path", FilterOperator.EQ, "value")
		], true).getAST(true).origin, "AND");

		assert.equal(new Filter([
			new Filter("path", FilterOperator.EQ, "value")
		], false).getAST(true).origin, "EQ", "Multifilter with single filter should have inner filter origin");


	});

	//*********************************************************************************************
	QUnit.test("Static never fulfilled filter", function(assert) {
		assert.ok(Filter.NONE instanceof Filter);
		assert.strictEqual(Filter.NONE.getPath(), "/");
		assert.strictEqual(typeof Filter.NONE.getOperator(), "function");
		assert.strictEqual(Filter.NONE.getOperator()(), false);
	});
});