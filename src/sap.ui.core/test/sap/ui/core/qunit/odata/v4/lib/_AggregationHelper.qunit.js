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
	/*global QUnit, sinon*/
	/*eslint camelcase: 0, no-warning-comments: 0 */
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
				Amount : {subtotals : true}
			},
			group : {
				"n/a" : {}
			},
			groupLevels : ["TransactionCurrency", "Region"]
		},
		iLevel : 1,
		sApply : "groupby((TransactionCurrency),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {subtotals : true}
			},
			group : {
				"n/a" : {}
			},
			groupLevels : ["TransactionCurrency", "Region"]
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "TransactionCurrency eq 'EUR'"
		},
		iLevel : 2,
		sApply : "filter(TransactionCurrency eq 'EUR')/groupby((Region),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {}
			},
			group : {
				C : {}, // intentionally out of order to test sorting
				A : {},
				B : {}
			},
			groupLevels : ["TransactionCurrency", "Region"]
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "TransactionCurrency eq 'EUR' and Region eq 'UK'"
		},
		iLevel : 3, // leaf level
		sApply : "filter(TransactionCurrency eq 'EUR' and Region eq 'UK')"
			+ "/groupby((A,B,C),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount : {
					grandTotal : true,
					unit : "Currency",
					"with" : "average"
				},
				NetAmountAggregate : { // Note: intentionally no "with", although spec requires it
					name : "NetAmount"
				},
				GrossAmountCount : {
					grandTotal : true,
					name : "GrossAmount",
					"with" : "countdistinct"
				}
			},
			grandTotalAtBottomOnly : false, // just to check validation
			group : {
				BillToParty : {}
			}
		},
		sApply : "concat(aggregate(Amount with average as Amount,Currency"
			+ ",GrossAmount with countdistinct as GrossAmountCount)"
			+ ",groupby((BillToParty),aggregate(Amount with average as Amount,Currency"
			+ ",GrossAmount with countdistinct as GrossAmountCount"
			+ ",NetAmount as NetAmountAggregate)))",
		sFollowUpApply : "groupby((BillToParty),aggregate(Amount with average as Amount,Currency"
			+ ",GrossAmount with countdistinct as GrossAmountCount"
			+ ",NetAmount as NetAmountAggregate))"
	}, {
		oAggregation : {
			aggregate : {
				Alias : { // Note: intentionally no "with", although spec requires it
					grandTotal : true,
					name : "Name"
				},
				GrossAmount : {
					grandTotal : true,
					unit : "Currency"
				},
				NetAmount : {
					grandTotal : true,
					unit : "Currency"
				}
			},
			grandTotalAtBottomOnly : true, // just to check validation
			group : {
				BillToParty : {}
			}
		},
		sApply : "concat(aggregate(Name as Alias,GrossAmount,Currency,NetAmount)"
			+ ",groupby((BillToParty),aggregate(Name as Alias,GrossAmount,Currency,NetAmount)))",
		sFollowUpApply :
			"groupby((BillToParty),aggregate(Name as Alias,GrossAmount,Currency,NetAmount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {
					grandTotal : true,
					unit : "Currency"
				}
			},
			group : {
				Currency : {}
			}
		},
		sApply : "concat(aggregate(Amount,Currency),groupby((Currency),aggregate(Amount)))",
		sFollowUpApply : "groupby((Currency),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {
					grandTotal : true,
					subtotals : true,
					unit : "Currency"
				}
			},
			groupLevels : ['Currency']
		},
		sApply : "concat(aggregate(Amount,Currency),groupby((Currency),aggregate(Amount)))",
		sFollowUpApply : "groupby((Currency),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {
					grandTotal : true,
					subtotals : true,
					unit : "Currency"
				},
				Currency : {
					grandTotal : true,
					subtotals : true
				}
			},
			groupLevels : ['Country']
		},
		sApply : "concat(aggregate(Amount,Currency),groupby((Country),aggregate(Amount,Currency)))",
		sFollowUpApply : "groupby((Country),aggregate(Amount,Currency))"
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
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			}
		},
		mQueryOptions : {
			$skip : 0,
			$top : Infinity // special case
		},
		sApply : "concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber)))",
		// Note: follow-up request not needed in this special case, due to $top : Infinity
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			},
			subtotalsAtBottomOnly : false // just to check validation
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Region gt 'E'",
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 0,
			$top : 42
		},
		sApply : "filter(Region gt 'E')"
			+ "/concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),top(42)))",
		sFollowUpApply : "filter(Region gt 'E')/groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/top(42)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true, subtotals : true} // no unit involved here!
			},
			group : {
				Region : {}
			},
			groupLevels : [],
			subtotalsAtBottomOnly : true // just to check validation
		},
		mQueryOptions : {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 42,
			$top : 99
		},
		sApply : "concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),skip(42)/top(99)))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/skip(42)/top(99)"
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
		sApply : "concat(aggregate(SalesNumber with sum as SalesNumberSum)"
			+ ",groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum)))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum))"
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
				SalesAmount : {grandTotal : true},
				SalesNumber : {subtotals : true} // no unit involved here!
			},
			// group is optional
			groupLevels : ["Region"]
		},
		mQueryOptions : {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc",
			$skip : 0,
			$top : 10
		},
		sApply : "concat(aggregate(SalesAmount),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),top(10)))",
		sFollowUpApply : "groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)/top(10)"
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
			UI5max__Amount : {measure : "Amount", method : "max"}
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
			UI5max__Amount : {measure : "Amount", method : "max"},
			UI5min__Amount : {measure : "Amount", method : "min"}
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
			UI5max__Amount : {measure : "Amount", method : "max"},
			UI5min__Amount : {measure : "Amount", method : "min"}
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
			UI5max__Amount : {measure : "Amount", method : "max"}
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
		sFollowUpApply : "groupby((BillToParty)"
			+ ",aggregate(Amount1 with average as Amount1Avg,Amount2))",
		mExpectedAlias2MeasureAndMethod : {
			UI5min__Amount1Avg : {measure : "Amount1Avg", method : "min"},
			UI5min__Amount2 : {measure : "Amount2", method : "min"},
			UI5max__Amount2 : {measure : "Amount2", method : "max"}
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
		sFollowUpApply : "aggregate(Amount1 with average as Amount1Avg,Amount2)",
		mExpectedAlias2MeasureAndMethod : {
			UI5min__Amount1Avg : {measure : "Amount1Avg", method : "min"},
			UI5min__Amount2 : {measure : "Amount2", method : "min"},
			UI5max__Amount2 : {measure : "Amount2", method : "max"}
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
				sFollowUpApply = oFixture.sFollowUpApply || oFixture.sApply,
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions),
				mResult;

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions,
				oFixture.iLevel, false, mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : oFixture.sApply}, "sApply");
			assert.deepEqual(mAlias2MeasureAndMethod,
				oFixture.mExpectedAlias2MeasureAndMethod || {}, "mAlias2MeasureAndMethod");

			mAlias2MeasureAndMethod = {};

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation,
				oFixture.mQueryOptions, oFixture.iLevel, true, mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : sFollowUpApply}, "sFollowUpApply");
			assert.deepEqual(mAlias2MeasureAndMethod, {}, "mAlias2MeasureAndMethod");

			assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON,
				"original mQueryOptions unchanged");
		});
	});

	//*********************************************************************************************
	QUnit.test("buildApply: normalizations", function (assert) {
		var oAggregation = {};

		// code under test
		_AggregationHelper.buildApply(oAggregation);

		assert.deepEqual(oAggregation, {
			aggregate : {},
			group : {},
			groupLevels : []
		});

		oAggregation = {
			group : {
				AlreadyThere : {}
			},
			groupLevels : ["foo", "AlreadyThere", "bar"]
		};

		// code under test
		_AggregationHelper.buildApply(oAggregation);

		assert.deepEqual(oAggregation, {
			aggregate : {},
			group : {
				AlreadyThere : {},
				bar : {},
				foo : {}
			},
			groupLevels : ["foo", "AlreadyThere", "bar"] // no sorting here!
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
			aggregate : {A : {}},
			group : {},
			subtotalsAtBottomOnly : "true"
		},
		sError : "Not a boolean value for 'subtotalsAtBottomOnly'"
	}, {
		oAggregation : {
			aggregate : {A : {}},
			group : {},
			grandTotalAtBottomOnly : "true"
		},
		sError : "Not a boolean value for 'grandTotalAtBottomOnly'"
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
	}].forEach(function (oFixture) {
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
[false, true].forEach(function (bSubtotalsAtBottomOnly) {
	QUnit.test("extractSubtotals: at bottom only = " + bSubtotalsAtBottomOnly, function (assert) {
		var oAggregation = {
				aggregate : {
					A : {},
					B : {unit : "U"},
					C : {name : "n/a"}
				},
				groupLevels : ["D"]
			},
			oCollapsed = {},
			oExpanded = bSubtotalsAtBottomOnly ? {} : null,
			oGroupNode = {
				"@$ui5.node.level" : 1,
				A : "a",
				B : null,
				C : "c",
				"C@odata.type" : "#Decimal",
				D : "d",
				U : "u"
			},
			sGroupNodeJSON = JSON.stringify(oGroupNode);

		// code under test
		_AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed, oExpanded);

		assert.deepEqual(oCollapsed, {
			A : "a",
			B : null,
			C : "c",
			U : "u"
		});
		if (oExpanded) {
			assert.deepEqual(oExpanded, {
				A : null,
				B : null,
				C : null,
				U : null
			});
		}
		assert.strictEqual(JSON.stringify(oGroupNode), sGroupNodeJSON, "unchanged");
	});
});

	//*********************************************************************************************
	QUnit.test("extractSubtotals: unit used as group level", function (assert) {
		var oAggregation = {
				aggregate : {
					A : {unit : "U"},
					B : {unit : "V"},
					C : {unit : "W"}
				},
				groupLevels : ["U", "V", "W"]
			},
			oCollapsed = {},
			oExpanded = {},
			oGroupNode = {
				"@$ui5.node.level" : 2,
				A : "a",
				B : null,
				C : "c",
				"C@odata.type" : "#Decimal",
				D : "d",
				U : "u",
				V : "v",
				W : "w"
			},
			sGroupNodeJSON = JSON.stringify(oGroupNode);

		// code under test
		_AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed, oExpanded);

		assert.deepEqual(oCollapsed, {
			A : "a",
			B : null,
			C : "c",
			U : "u",
			V : "v",
			W : "w"
		});
		assert.deepEqual(oExpanded, {
			A : null,
			B : null,
			C : null,
			W : null
		});
		assert.strictEqual(JSON.stringify(oGroupNode), sGroupNodeJSON, "unchanged");
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
				aggregate : {
					SalesAmount : {subtotals : true},
					SalesNumber : {}
				},
				group : { // Note: added by _AggregationHelper.buildApply before
					Country : {},
					Region : {},
					Segment : {}
				},
				groupLevels : ["Country", "Region"]
			},
			sOrderby = "SalesAmount desc,SalesNumber,Country desc,Region,Segment asc";

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Dimension %20desc%2CFoo asc", oAggregation, 1),
			"Dimension %20desc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Dimension\tdesc,Foo asc", oAggregation, 1),
			"Dimension\tdesc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("Measure desc%2cDimension", oAggregation, 1),
			"Measure desc,Dimension");

		// code under test
		assert.strictEqual(_AggregationHelper.filterOrderby(undefined, oAggregation, 1), undefined);

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby("NavigationProperty/$count", oAggregation, 1),
			"NavigationProperty/$count");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby(sOrderby, oAggregationWithLevels, 1),
			"SalesAmount desc,Country desc");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby(sOrderby, oAggregationWithLevels, 2),
			"SalesAmount desc,Region");

		// code under test
		assert.strictEqual(
			_AggregationHelper.filterOrderby(sOrderby, oAggregationWithLevels, 3),
			"SalesAmount desc,SalesNumber,Segment asc");
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

	//*********************************************************************************************
	QUnit.test("setAnnotations", function (assert) {
		var oElement = {
				group : "~group~",
				measure : "~measure~"
			};

		// code under test
		_AggregationHelper.setAnnotations(oElement, "~bIsExpanded~", "~bIsTotal~", "~iLevel~",
			["foo", "bar", "group", "measure"]);

		assert.deepEqual(oElement, {
			"@$ui5.node.isExpanded" : "~bIsExpanded~",
			"@$ui5.node.isTotal" : "~bIsTotal~",
			"@$ui5.node.level" : "~iLevel~",
			bar : null,
			foo : null,
			group : "~group~",
			measure : "~measure~"
		});
	});

	//*********************************************************************************************
	QUnit.test("getAllProperties", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					x : {},
					y : {unit : "UnitY"}
				},
				group: {
					c : {}, // intentionally out of ABC order
					a : {},
					b : {}
				}
				// groupLevels : ["a", "b"]
			};

		assert.deepEqual(
			// code under test
			_AggregationHelper.getAllProperties(oAggregation),
			["x", "y", "c", "a", "b", "UnitY"]);
	});

	//*********************************************************************************************
[undefined, false, true].forEach(function (bSubtotalsAtBottomOnly, i) {
	var sTitle = "getOrCreateExpandedOject: subtotalsAtBottomOnly = " + bSubtotalsAtBottomOnly;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {subtotalsAtBottomOnly : bSubtotalsAtBottomOnly},
			oCollapsed,
			oExpanded,
			oExpectation,
			oGroupNode = {};

		oExpectation = this.mock(_AggregationHelper).expects("extractSubtotals")
			.exactly(i ? 1 : 0)
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oGroupNode),
				/*oCollapsed*/sinon.match.object, i === 2 ? /*oExpanded*/sinon.match.object : null);

		// code under test (1st time)
		oExpanded = _AggregationHelper.getOrCreateExpandedOject(oAggregation, oGroupNode);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "expanded"), oExpanded);
		assert.deepEqual(oExpanded, {"@$ui5.node.isExpanded" : true});
		oCollapsed = _Helper.getPrivateAnnotation(oGroupNode, "collapsed");
		assert.deepEqual(oCollapsed, {"@$ui5.node.isExpanded" : false});
		if (i) {
			assert.strictEqual(oExpectation.args[0][2], oCollapsed);
		}
		if (i === 2) {
			assert.strictEqual(oExpectation.args[0][3], oExpanded);
		}

		assert.strictEqual(
			// code under test (2nd time)
			_AggregationHelper.getOrCreateExpandedOject(oAggregation, oGroupNode),
			oExpanded);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "collapsed"), oCollapsed);
	});
});
});