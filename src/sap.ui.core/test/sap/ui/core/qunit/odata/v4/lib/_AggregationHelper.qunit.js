/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, Filter, FilterOperator, _AggregationHelper, _Helper) {
	/*global QUnit*/
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[{
		oAggregation : {
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty))"
	}, {
		oAggregation : {
			group : { // Note: intentionally not sorted
				TransactionCurrency : {},
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty,TransactionCurrency))"
	}, {
		oAggregation : {
			// group is optional
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {}
			},
			// group is optional
			groupLevels : ["TransactionCurrency", "Region"]
		},
		sApply : "groupby((TransactionCurrency,Region),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {}
			},
			// group is optional
			groupLevels : ["TransactionCurrency", "Region", "Country"]
		},
		sApply : "groupby((TransactionCurrency,Region,Country),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount : {
					"with" : "average" // Note: allowed, as long as no totals are requested
				},
				NetAmountAggregate : {
					name : "NetAmount"
				},
				GrossAmountSum : {
					name : "GrossAmount",
					"with" : "countdistinct" // Note: allowed, as long as no totals are requested
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty),aggregate(Amount with average as Amount"
			+ ",GrossAmount with countdistinct as GrossAmountSum,NetAmount as NetAmountAggregate))"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmountInTransactionCurrency : {},
				NetAmountInTransactionCurrency : {}
			},
			group : {
				BillToParty : {},
				TextProperty : {},
				TransactionCurrency : {}
			}
		},
		sApply : "groupby((BillToParty,TextProperty,TransactionCurrency)"
			+ ",aggregate(GrossAmountInTransactionCurrency,NetAmountInTransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmountInTransactionCurrency : {subtotals : true}
			},
			group : {
				BillToParty : {}
				// TransactionCurrency : {} - optional
			},
			// some use case where unit appears as "standalone" dimension
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency,BillToParty)"
			+ ",aggregate(GrossAmountInTransactionCurrency))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case,
			$top : Infinity // special case
		},
		sApply : "concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber)))",
		sFollowUpApply : // Note: follow-up request not needed in this case
			"concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber)))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Region gt 'E'",
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 0, // special case
			$top : 42
		},
		sApply : "filter(Region gt 'E')"
			+ "/concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),top(41)))",
		sFollowUpApply : "filter(Region gt 'E')"
			+ "/concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/top(41))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			},
			groupLevels : []
		},
		mQueryOptions : {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 42,
			$top : 99
		},
		sApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),skip(41)/top(99))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/skip(41)/top(99)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumberSum : {grandTotal : true, name : "SalesNumber", "with" : "sum"}
			},
			group : {
				Region : {}
			}
		},
		iLevel : 1, // include grandTotal
		sApply : "concat(aggregate(SalesNumber with sum as UI5grand__SalesNumberSum)"
			+ ",groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum)))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true}
			},
			group : {
				Region : {}
			}
		},
		iLevel : 2, // ignore grandTotal!
		sApply : "groupby((Region),aggregate(SalesNumber))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case
			$top : Infinity // special case
		},
		// Note: sap.chart.Chart would never do this, min/max is needed for paging only
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/concat(aggregate(Amount with max as UI5max__Amount),identity)",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true, min : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$count : true,
			$filter : "Amount ge 100",
			$orderby : "BillToParty desc",
			$skip : 0, // special case
			$top : 42
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)"
			+ "/concat(aggregate(Amount with min as UI5min__Amount"
			+ ",Amount with max as UI5max__Amount,$count as UI5__count),top(42))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)/top(42)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"},
			"UI5min__Amount" : {measure : "Amount", method : "min"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true, min : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$count : true,
			$filter : "Amount ge 100",
			$orderby : "BillToParty desc",
			$skip : 42,
			$top : 99
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)"
			+ "/concat(aggregate(Amount with min as UI5min__Amount"
			+ ",Amount with max as UI5max__Amount,$count as UI5__count),skip(42)/top(99))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/filter(Amount ge 100)/orderby(BillToParty desc)/skip(42)/top(99)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"},
			"UI5min__Amount" : {measure : "Amount", method : "min"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount : {max : true}
			},
			group : {
				BillToParty : {}
			}
		},
		mQueryOptions : {
			$skip : 0, // special case
			$top : 0 // not really a special case
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/concat(aggregate(Amount with max as UI5max__Amount),top(0))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount))/top(0)", // Note: not useful
		mExpectedAlias2MeasureAndMethod : {
			"UI5max__Amount" : {measure : "Amount", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount2 : {
					max : true,
					min : true
				},
				Amount1Avg : {
					min : true,
					name : "Amount1",
					"with" : "average"
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty)"
			+ ",aggregate(Amount1 with average as Amount1Avg,Amount2))"
			+ "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg,"
			+ "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5min__Amount1Avg" : {measure : "Amount1Avg", method : "min"},
			"UI5min__Amount2" : {measure : "Amount2", method : "min"},
			"UI5max__Amount2" : {measure : "Amount2", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : {
				Amount1Avg : {
					min : true,
					name : "Amount1",
					"with" : "average"
				},
				Amount2 : {
					max : true,
					min : true
				}
			}
		},
		sApply : "aggregate(Amount1 with average as Amount1Avg,Amount2)"
			+ "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg,"
			+ "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
		mExpectedAlias2MeasureAndMethod : {
			"UI5min__Amount1Avg" : {measure : "Amount1Avg", method : "min"},
			"UI5min__Amount2" : {measure : "Amount2", method : "min"},
			"UI5max__Amount2" : {measure : "Amount2", method : "max"}
		}
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {}
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'"
		},
		sApply : "filter(Name eq 'Foo')/groupby((Region),aggregate(SalesNumber))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {}
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$filter : "SalesNumber ge 0"
		},
		sApply : "filter(Name eq 'Foo')/groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 0)"
	}].forEach(function (oFixture) {
		QUnit.test("buildApply with " + oFixture.sApply, function (assert) {
			var mAlias2MeasureAndMethod = {},
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions),
				mResult;

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions,
				oFixture.iLevel, false, mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : oFixture.sApply}, "sApply");
			if (oFixture.mExpectedAlias2MeasureAndMethod) {
				assert.deepEqual(mAlias2MeasureAndMethod, oFixture.mExpectedAlias2MeasureAndMethod,
					"mAlias2MeasureAndMethod");
			}

			if (oFixture.sFollowUpApply) {
				mAlias2MeasureAndMethod = {};

				// code under test
				mResult = _AggregationHelper.buildApply(oFixture.oAggregation,
					oFixture.mQueryOptions, oFixture.iLevel, true, mAlias2MeasureAndMethod);

				assert.deepEqual(mResult, {$apply : oFixture.sFollowUpApply}, "sFollowUpApply");
				assert.deepEqual(mAlias2MeasureAndMethod, {}, "mAlias2MeasureAndMethod");
			}

			assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON,
				"original mQueryOptions unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("buildApply: optional mAlias2MeasureAndMethod", function (assert) {
		// mAlias2MeasureAndMethod is optional in _AggregationHelper.buildApply
		assert.deepEqual(_AggregationHelper.buildApply({
				aggregate : {
					Amount : {max : true}
				},
				group : {
					BillToParty : {}
				}
			}),
			{$apply : "groupby((BillToParty),aggregate(Amount))"
				+ "/concat(aggregate(Amount with max as UI5max__Amount),identity)"});
	});

	//*********************************************************************************************
	QUnit.test("buildApply: no $apply needed", function (assert) {
		assert.deepEqual(_AggregationHelper.buildApply({}), {});
	});

	//*********************************************************************************************
	[{
		oAggregation : {
			aggregate : {},
			group : {A : {foo : "bar"}}
		},
		sError : "Unsupported 'foo' at property: A"
	}, {
		oAggregation : {
			aggregate : {A : {foo : "bar"}},
			group : {}
		},
		sError : "Unsupported 'foo' at property: A"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : "true"}},
			group : {}
		},
		sError : "Not a boolean value for 'subtotals' at property: A"
	}, {
		oAggregation : {
			aggregate : {},
			foo : {},
			group : {}
		},
		sError : "Unsupported 'foo'"
	}, {
		oAggregation : {
			aggregate : {},
			group : []
		},
		sError : "Not a object value for 'group'"
	}, {
		oAggregation : {
			aggregate : {},
			group : {},
			groupLevels : {}
		},
		sError : "Not a array value for 'groupLevels'"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, "with" : "average"}}
		},
		sError : "Cannot aggregate totals with 'average'"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, "with" : "countdistinct"}}
		},
		sError : "Cannot aggregate totals with 'countdistinct'"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : true, "with" : "average"}}
		},
		sError : "Cannot aggregate totals with 'average'"
	}, {
		oAggregation : {
			aggregate : {A : {subtotals : true, "with" : "countdistinct"}}
		},
		sError : "Cannot aggregate totals with 'countdistinct'"
	}].forEach(function (oFixture, i) {
		QUnit.test("buildApply: " + oFixture.sError, function (assert) {
			assert.throws(function () {
				// code under test
				_AggregationHelper.buildApply(oFixture.oAggregation);
			}, new Error(oFixture.sError));
		});
	});

	//*********************************************************************************************
	QUnit.test("hasGrandTotal", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal(), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({A : {}}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({B : {grandTotal : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal({A : {}, B : {grandTotal : true}}),
			true);
	});

	//*********************************************************************************************
	QUnit.test("splitFilter: oAggregation or oAggregation.aggregate empty", function (assert) {
		var oFilter = {};

		assert.deepEqual(_AggregationHelper.splitFilter(oFilter), [oFilter]);
		assert.deepEqual(_AggregationHelper.splitFilter(oFilter, null), [oFilter]);
		assert.deepEqual(_AggregationHelper.splitFilter(oFilter, {}), [oFilter]);
	});

	//*********************************************************************************************
	function and() {
		return new Filter(Array.prototype.slice.call(arguments), true);
	}

	function f(sPath) {
		return new Filter(sPath, FilterOperator.EQ, 'foo');
	}

	function or() {
		return new Filter(Array.prototype.slice.call(arguments), false);
	}

[{
	filter : f("a1"),
	result : [f("a1"), undefined]
}, {
	filter : f("b"),
	result : [undefined, f("b")]
}, {
	filter : or(f("b1"), f("b2")),
	result : [undefined, or(f("b1"), f("b2"))]
}, {
	filter : or(f("a1"), f("b")),
	result : [or(f("a1"), f("b")), undefined]
}, {
	filter : and(f("a1"), f("a2")),
	result : [and(f("a1"), f("a2")), undefined]
}, {
	filter : and(f("b"), f("a1")),
	result : [f("a1"), f("b")]
}, {
	filter : and(f("a1"), f("a2"), f("b")),
	result : [and(f("a1"), f("a2")), f("b")]
}, {
	filter : and(f("a2"), f("b1"), f("b2")),
	result : [f("a2"), and(f("b1"), f("b2"))]
}, {
	filter : and(f("a1"), and(f("a2"), f("b"))),
	result : [and(f("a1"), f("a2")), f("b")]
}].forEach(function (oFixture, i) {
	QUnit.test("splitFilter: " + i , function (assert) {
		assert.deepEqual(
			_AggregationHelper.splitFilter(oFixture.filter, {aggregate : {a1 : {}, a2 : {} }}),
			oFixture.result
		);
	});
});

	//*********************************************************************************************
	QUnit.test("hasMinOrMax", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax(), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({A : {}}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({B : {min : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({B : {max : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({A : {}, B : {max : true}}), true);

	});

	//*********************************************************************************************
	QUnit.test("isAffected", function (assert) {
		var oAggregation = {
				aggregate : {
					measure1 : {},
					"complex1/measure2" : {},
					alias : {name : "measure3"}
				},
				group : {
					dimension1 : {}, // assuming a structured type with property1, property2
					"complex2/dimension2" : {}
				},
				groupLevels : ["level1", "complex3/level2"]
			};

		// code under test
		assert.notOk(_AggregationHelper.isAffected(oAggregation, [],
			["foo", "bar", "meas", "dim", "lev"]));

		["", "*", "measure1", "measure1/*", "measure3", "dimension1", "dimension1/property1",
			"dimension1/*", "level1", "complex1", "complex1/*", "complex2", "complex2/*",
			"complex3", "complex3/*"
		].forEach(function (sSideEffectPath) {
			// code under test
			assert.ok(_AggregationHelper.isAffected(oAggregation, [], [sSideEffectPath]),
				sSideEffectPath);

			// code under test
			assert.ok(
				_AggregationHelper.isAffected(oAggregation, [], ["foo", sSideEffectPath, "bar"]),
				sSideEffectPath);
		});

		// code under test
		assert.notOk(_AggregationHelper.isAffected(oAggregation, [
			new Filter("bar", FilterOperator.EQ, "baz")
		], ["foo"]));

		// code under test
		assert.ok(_AggregationHelper.isAffected(oAggregation, [
			new Filter("bar", FilterOperator.EQ, "baz")
		], ["foo", "bar"]));

		// code under test
		assert.ok(_AggregationHelper.isAffected(oAggregation, [
			new Filter("foo/bar", FilterOperator.EQ, "baz")
		], ["foo"]));

		// code under test
		assert.notOk(_AggregationHelper.isAffected(oAggregation, [
			new Filter("foobar", FilterOperator.EQ, "baz")
		], ["foo"]));

		// code under test
		assert.ok(_AggregationHelper.isAffected(oAggregation, [
			new Filter("foo/bar/baz", FilterOperator.EQ, "qux")
		], ["foo/*"]));

		// code under test
		assert.ok(_AggregationHelper.isAffected(oAggregation, [
			new Filter("foo", FilterOperator.EQ, "baz"),
			new Filter("bar", FilterOperator.EQ, "baz")
		], ["bar"]));

		// code under test
		assert.ok(_AggregationHelper.isAffected(oAggregation, [
			new Filter({filters : [
				new Filter("foo", FilterOperator.EQ, "baz"),
				new Filter("bar", FilterOperator.EQ, "baz")
			]})
		], ["foo"]));
	});

	//*********************************************************************************************
	QUnit.test("createPlaceholder", function (assert) {
		var oParentCache = {},
			// code under test
			oPlaceholder = _AggregationHelper.createPlaceholder(3, 5, oParentCache);

		assert.strictEqual(oPlaceholder["@$ui5.node.level"], 3);
		assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "index"), 5);
		assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "parent"), oParentCache);
	});

	//*********************************************************************************************
	QUnit.test("filterAggregation - optional group entry", function (assert) {
		var oAggregation = {
			aggregate : {
				MeasureWithoutTotal : {},
				MeasureWithTotal : {subtotals : true}
			},
			group : {
				// GroupedDimension : {},
				UngroupedDimension : {}
			},
			groupLevels : ["GroupedDimension"]
		};

		assert.deepEqual(_AggregationHelper.filterAggregation(oAggregation, 1), {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {},
			groupLevels : ["GroupedDimension"],
			$groupBy : ["GroupedDimension"],
			$missing : ["UngroupedDimension", "MeasureWithoutTotal"]
		});
	});

	//*********************************************************************************************
	[{
		iLevel : 1,
		oResult : {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {},
			groupLevels : ["GroupedDimension1"],
			$groupBy : ["GroupedDimension1"],
			$missing : ["GroupedDimension2", "UngroupedDimension1", "UngroupedDimension2",
				"MeasureWithoutTotal"]
		}
	}, {
		iLevel : 2,
		oResult : {
			aggregate : {
				MeasureWithTotal : {subtotals : true}
			},
			group : {},
			groupLevels : ["GroupedDimension2"],
			$groupBy : ["GroupedDimension1", "GroupedDimension2"],
			$missing : ["UngroupedDimension1", "UngroupedDimension2", "MeasureWithoutTotal"]
		}
	}, {
		iLevel : 3,
		oResult : {
			aggregate : {
				MeasureWithoutTotal : {},
				MeasureWithTotal : {subtotals : true}
			},
			group : {
				UngroupedDimension1 : {},
				UngroupedDimension2 : {}
			},
			groupLevels : [],
			$groupBy : ["GroupedDimension1", "GroupedDimension2", "UngroupedDimension1",
				"UngroupedDimension2"],
			$missing : []
		}
	}].forEach(function (oFixture) {
		QUnit.test("filterAggregation: level " + oFixture.iLevel, function (assert) {
			var oAggregation = {
				aggregate : {
					MeasureWithoutTotal : {},
					MeasureWithTotal : {subtotals : true}
				},
				group : { // intentionally in this order to test sorting
					UngroupedDimension2 : {},
					UngroupedDimension1 : {},
					GroupedDimension1 : {}
				},
				groupLevels : ["GroupedDimension1", "GroupedDimension2"]
			};

			assert.deepEqual(
				_AggregationHelper.filterAggregation(oAggregation, oFixture.iLevel),
				oFixture.oResult
			);
		});
	});

	//*********************************************************************************************
	QUnit.test("filterOrderby", function (assert) {
		var oAggregation = {
				aggregate : {
					Measure : {}
				},
				group : {
					Dimension : {}
				},
				groupLevels : [] // Note: added by _AggregationHelper.buildApply before
			},
			oAggregationWithLevels = {
				aggregate : {},
				group : {},
				groupLevels : ["Dimension"]
			};

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Dimension %20desc%2COtherDimension asc", oAggregation),
			"Dimension %20desc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Dimension\tdesc,OtherDimension asc", oAggregation),
			"Dimension\tdesc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Dimension desc", oAggregationWithLevels),
			"Dimension desc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Measure desc%2cDimension", oAggregation),
			"Measure desc,Dimension");

		// code under test
		assert.strictEqual(_AggregationHelper.filterOrderby(undefined, {}), undefined);

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("NavigationProperty/$count", []),
			"NavigationProperty/$count");
	});
	//TODO Also support orderbyItems that start with a type cast?
	// See "11.2.5.2 System Query Option $orderby":
	// "A special case of such an expression is a property path terminating on a primitive property.
	// A type cast using the qualified entity type name is required to order by a property defined
	// on a derived type."
	//
	// ABNF:
	// orderby     = '$orderby' EQ orderbyItem *( COMMA orderbyItem )
	// orderbyItem = commonExpr [ RWS ( 'asc' / 'desc' ) ]
	// commonExpr = (... / firstMemberExpr / ...)[...]
	// firstMemberExpr = memberExpr / inscopeVariableExpr [ "/" memberExpr ]
	// memberExpr = [ qualifiedEntityTypeName "/" ] ( propertyPathExpr / boundFunctionExpr )
	// inscopeVariableExpr : not supported
	// boundFunctionExpr : not supported
	// qualifiedEntityTypeName = odataIdentifier 1*( "." odataIdentifier )
	// propertyPathExpr : /-separated path of odataIdentifier or qualified names;
	//   otherwise not supported (e.g. $count)
	// complexProperty : probably not supported by current service implementations
});