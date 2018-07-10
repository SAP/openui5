/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/odata/v4/lib/_AggregationHelper"
], function (jQuery, _AggregationHelper) {
	/*global QUnit*/
	/*eslint no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	[{
		oAggregation : {},
		sApply : ""
	}, {
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
			groupLevels : ["TransactionCurrency"]
		},
		sApply : "groupby((TransactionCurrency),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount : {
					"with" : "average"
				},
				NetAmountAggregate : {
					name : "NetAmount"
				},
				GrossAmountSum : {
					name : "GrossAmount",
					"with" : "sum"
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty),aggregate(Amount with average as Amount"
			+ ",GrossAmount with sum as GrossAmountSum,NetAmount as NetAmountAggregate))"
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
				Amount : {
					max : true
				}
			},
			group : {
				BillToParty : {}
			}
		},
		sApply : "groupby((BillToParty),aggregate(Amount))"
			+ "/concat(aggregate(Amount with max as UI5max__Amount),identity)",
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
	}].forEach(function (oFixture) {
		QUnit.test("buildApply with " + oFixture.sApply, function (assert) {
			var mAlias2MeasureAndMethod = {},
				mResult;

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation, null,
				mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : oFixture.sApply});
			if (oFixture.mExpectedAlias2MeasureAndMethod) {
				assert.deepEqual(mAlias2MeasureAndMethod, oFixture.mExpectedAlias2MeasureAndMethod);
			}
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
	QUnit.test("buildApply with mQueryOptions, 1st request", function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {
						max : true,
						min : true
					}
				},
				group : {
					Name : {}
				},
				groupLevels : []
			},
			mQueryOptions = {
				$count : true,
				$filter : "SalesNumber ge 100",
				$orderby : "Name desc"
			};

		assert.deepEqual(_AggregationHelper.buildApply(oAggregation, mQueryOptions), {
			$apply : "groupby((Name),aggregate(SalesNumber))"
				+ "/filter(SalesNumber ge 100)/orderby(Name desc)"
				+ "/concat(aggregate(SalesNumber with min as UI5min__SalesNumber,"
				+ "SalesNumber with max as UI5max__SalesNumber),identity)",
			$count : true
		});
		assert.deepEqual(mQueryOptions, {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Name desc"
		}, "unmodified");
	});

	//*********************************************************************************************
	QUnit.test("buildApply with mQueryOptions, 2nd request", function (assert) {
		var oAggregation = {
				aggregate : {
					SalesNumber : {/*no min/max*/}
				},
				group : {
					Name : {}
				},
				groupLevels : []
			},
			mQueryOptions = {
				$count : true,
				$filter : "SalesNumber ge 100",
				$orderby : "Name desc"
			};

		assert.deepEqual(_AggregationHelper.buildApply(oAggregation, mQueryOptions), {
			$apply : "groupby((Name),aggregate(SalesNumber))"
				+ "/filter(SalesNumber ge 100)/orderby(Name desc)",
			$count : true
		});
		assert.deepEqual(mQueryOptions, {
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Name desc"
		}, "unmodified");
	});

	//*********************************************************************************************
	[{
		oAggregation : {
			aggregate : {},
			group : {A : {}, B : {}},
			groupLevels : ["A", "B"]
		},
		sError : "More than one group level: A,B"
	}, {
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
	}].forEach(function (oFixture, i) {
		QUnit.test("buildApply: " + oFixture.sError, function (assert) {
			assert.throws(function () {
				// code under test
				_AggregationHelper.buildApply(oFixture.oAggregation);
			}, new Error(oFixture.sError));
		});
	});

	//*********************************************************************************************
	QUnit.test("hasMinOrMax", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax(), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({}), false);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({Measure : {min : true}}), true);

		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax({Measure : {max : true}}), true);
	});
});