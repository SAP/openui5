/* global  QUnit */
sap.ui.define([
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function(
	Filter,
	FilterOperator
) {
	"use strict";

	var sVariableError = "When using the filter operators 'Any' or 'All', a string has to be given as argument 'variable'.";
	var sConditionError = "When using the filter operator 'Any' or 'All', a valid instance of sap.ui.model.Filter has to be given as argument 'condition'.";
	var sOneMissing = "When using the filter operator 'Any', a lambda variable and a condition have to be given or neither.";
	var sLegacyAnyAll = "The filter operators 'Any' and 'All' are only supported with the parameter object notation.";

	QUnit.module("sap.ui.model.Filter: Unsupported Filter Operators");

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
			new Error(sOneMissing),
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
			new Error(sConditionError),
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
			new Error(sVariableError),
			"Error thrown if no args are given with 'All' operator"
		);
	});

	QUnit.module("sap.ui.model.Filter: Filter AST generation");

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
});