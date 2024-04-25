/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/v4/lib/_AggregationHelper",
	"sap/ui/model/odata/v4/lib/_Helper"
], function (Log, SyncPromise, Filter, FilterOperator, _AggregationHelper, _Helper) {
	/*eslint camelcase: 0 */
	"use strict";

	const mustBeMocked = function () { throw new Error("Must be mocked"); };

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v4.lib._AggregationHelper", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
[false, true].forEach(function (bAsLeaf) {
	QUnit.test("beforeOverwritePlaceholder: success; marked as leaf: " + bAsLeaf, function () {
		var oCache = {},
			oElement = {
				"@$ui5._" : { // not present at oPlaceholder => must be ignored
					descendants : 42,
					filter : "~filter~",
					predicate : "('0')"
				},
				"@$ui5.node.level" : 9
			},
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();
		if (bAsLeaf) { // must not make a difference
			oElement["@$ui5.node.isExpanded"] = undefined;
			oPlaceholder["@$ui5.node.isExpanded"] = undefined;
		}
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("copyPrivateAnnotation")
			.withExactArgs(sinon.match.same(oPlaceholder), "cache", sinon.match.same(oElement));
		oHelperMock.expects("copyPrivateAnnotation")
			.withExactArgs(sinon.match.same(oPlaceholder), "spliced", sinon.match.same(oElement));

		// code under test
		_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);
	});
});

	//*********************************************************************************************
	QUnit.test("beforeOverwritePlaceholder: success; top pyramid", function () {
		var oCache = {},
			oElement = {
				"@$ui5._" : { // not present at oPlaceholder => must be ignored
					descendants : 42,
					filter : "~filter~",
					predicate : "('0')"
				},
				"@$ui5.node.level" : 9
			},
			// Note: level 0 is used for initial placeholders of 1st level cache in case
			// expandTo > 1
			oPlaceholder = _AggregationHelper.createPlaceholder(0, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("copyPrivateAnnotation")
			.withExactArgs(sinon.match.same(oPlaceholder), "cache", sinon.match.same(oElement));
		oHelperMock.expects("copyPrivateAnnotation")
			.withExactArgs(sinon.match.same(oPlaceholder), "spliced", sinon.match.same(oElement));

		// code under test
		_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);
	});

	//*********************************************************************************************
	QUnit.test("beforeOverwritePlaceholder: isExpanded", function (assert) {
		var oCache = {},
			oElement = {
				"@$ui5.node.isExpanded" : "~new~",
				"@$ui5.node.level" : 9
			},
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();
		assert.notOk("@$ui5.node.isExpanded" in oPlaceholder);
		const oHelperMock = this.mock(_Helper);
		oHelperMock.expects("copyPrivateAnnotation").thrice()
			.withExactArgs(sinon.match.same(oPlaceholder), "cache", sinon.match.same(oElement));
		oHelperMock.expects("copyPrivateAnnotation").thrice()
			.withExactArgs(sinon.match.same(oPlaceholder), "spliced", sinon.match.same(oElement));

		// code under test
		_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);

		assert.strictEqual(oElement["@$ui5.node.isExpanded"], "~new~", "unchanged");

		// Note: an initial placeholder cannot know "@$ui5.node.isExpanded"!
		_Helper.setPrivateAnnotation(oPlaceholder, "placeholder", 1);
		oPlaceholder["@$ui5.node.isExpanded"] = "~old~";

		// code under test
		_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);

		assert.strictEqual(oElement["@$ui5.node.isExpanded"], "~old~");

		delete oElement["@$ui5.node.isExpanded"];
		delete oPlaceholder["@$ui5.node.isExpanded"];

		// code under test
		_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);

		assert.notOk("@$ui5.node.isExpanded" in oElement, "undefined not explicitly stored");
	});

	//*********************************************************************************************
[
	[false, undefined], [true, undefined], [undefined, false], [undefined, true]
].forEach(function (aIsExpandedValues, i) {
	var sTitle = "beforeOverwritePlaceholder: Not a leaf anymore (or vice versa); #" + i;

	QUnit.test(sTitle, function (assert) {
		var oCache = {},
			oElement = {
				"@$ui5.node.isExpanded" : aIsExpandedValues[0],
				"@$ui5.node.level" : 9
			},
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();
		// Note: an initial placeholder cannot know "@$ui5.node.isExpanded"!
		_Helper.setPrivateAnnotation(oPlaceholder, "placeholder", 1);
		oPlaceholder["@$ui5.node.isExpanded"] = aIsExpandedValues[1];

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);
		}, new Error("Not a leaf anymore (or vice versa)"));

		assert.strictEqual(oElement["@$ui5.node.isExpanded"], aIsExpandedValues[0], "unchanged");
	});
});

	//*********************************************************************************************
	QUnit.test("beforeOverwritePlaceholder: unexpected element", function (assert) {
		this.mock(_AggregationHelper).expects("checkNodeProperty").never();

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder({}); // other args do not matter here
		}, new Error("Unexpected element"));
	});

	//*********************************************************************************************
	QUnit.test("beforeOverwritePlaceholder: wrong placeholder", function (assert) {
		var oCache = {},
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, null, {/*not oCache*/}, 42);
		}, new Error("Wrong placeholder"), "parent");

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, null, oCache, 41);
		}, new Error("Wrong placeholder"), "rank");

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, {"@$ui5.node.level" : 99},
				oCache, 42);
		}, new Error("Wrong placeholder"), "level");
	});

	//*********************************************************************************************
["descendants", "predicate"].forEach(function (sAnnotation) {
	var sTitle = "beforeOverwritePlaceholder: Unexpected structural change: " + sAnnotation;

	QUnit.test(sTitle, function (assert) {
		var oCache = {},
			oElement = {"@$ui5.node.level" : 9},
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty").never();
		_Helper.setPrivateAnnotation(oElement, sAnnotation, 0);
		_Helper.setPrivateAnnotation(oPlaceholder, sAnnotation, false);

		assert.throws(function () {
			// code under test
			_AggregationHelper.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42);
		}, new Error("Unexpected structural change: " + sAnnotation));
	});
});

	//*********************************************************************************************
	QUnit.test("beforeOverwritePlaceholder: $NodeProperty", function (assert) {
		var oCache = {},
			oElement = {"@$ui5.node.level" : 9},
			oError = new Error("Unexpected structural change: Some/NodeID from ... to ..."),
			oPlaceholder = _AggregationHelper.createPlaceholder(9, 42, oCache);

		this.mock(_AggregationHelper).expects("checkNodeProperty")
			.withExactArgs(sinon.match.same(oPlaceholder), sinon.match.same(oElement),
				"Some/NodeID")
			.throws(oError);

		assert.throws(function () {
			// code under test
			_AggregationHelper
				.beforeOverwritePlaceholder(oPlaceholder, oElement, oCache, 42, "Some/NodeID");
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("checkNodeProperty", function (assert) {
		var oHelperMock = this.mock(_Helper);

		oHelperMock.expects("drillDown").withExactArgs("~oOld~", "Some/NodeID").returns(undefined);
		oHelperMock.expects("drillDown").withExactArgs("~oNew~", "Some/NodeID").returns("42");

		// code under test
		_AggregationHelper.checkNodeProperty("~oOld~", "~oNew~", "Some/NodeID");

		oHelperMock.expects("drillDown").withExactArgs("~oOld~", "Some/NodeID").returns(undefined);
		oHelperMock.expects("drillDown").withExactArgs("~oNew~", "Some/NodeID").returns("42");

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkNodeProperty("~oOld~", "~oNew~", "Some/NodeID", true);
		}, new Error('Unexpected structural change: Some/NodeID from undefined to "42"'));

		oHelperMock.expects("drillDown").withExactArgs("~oOld~", "Some/NodeID").returns("42");
		oHelperMock.expects("drillDown").withExactArgs("~oNew~", "Some/NodeID").returns("42");

		// code under test
		_AggregationHelper.checkNodeProperty("~oOld~", "~oNew~", "Some/NodeID");

		oHelperMock.expects("drillDown").withExactArgs("~oOld~", "Some/NodeID").returns("42");
		oHelperMock.expects("drillDown").withExactArgs("~oNew~", "Some/NodeID").returns([23]);

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkNodeProperty("~oOld~", "~oNew~", "Some/NodeID");
		}, new Error('Unexpected structural change: Some/NodeID from "42" to [23]'));

		oHelperMock.expects("drillDown").withExactArgs("~oOld~", "Some/NodeID").returns("42");
		oHelperMock.expects("drillDown").withExactArgs("~oNew~", "Some/NodeID").returns(undefined);

		// code under test (BCP: 2380047659)
		_AggregationHelper.checkNodeProperty("~oOld~", "~oNew~", "Some/NodeID");
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
		iLevel : 3, // leaf level (after fully expanding visual grouping)
		sApply : "filter(TransactionCurrency eq 'EUR' and Region eq 'UK')"
			+ "/groupby((A,B,C),aggregate(Amount))"
	}, {
		oAggregation : {
			aggregate : {
				Amount : {
					grandTotal : true,
					subtotals : true,
					unit : "Currency"
				},
				SalesNumber : {
					max : true,
					min : true,
					subtotals : true
				}
			},
			group : { // intentionally out of order to test sorting
				C : {additionally : ["CountryText", "Texts/Country"]},
				A : {},
				B : {}
			},
			groupLevels : ["TransactionCurrency", "Region"]
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "TransactionCurrency ne 'EUR' and Region ne 'UK'",
			$count : true,
			$filter : "SalesNumber ge 100",
			$orderby : "Region desc"
		},
		iLevel : 0, // leaf level, bypassing visual grouping
		sApply : "filter(TransactionCurrency ne 'EUR' and Region ne 'UK')"
			+ "/groupby((TransactionCurrency,Region,A,B,C,CountryText,Texts/Country)"
				+ ",aggregate(Amount,Currency,SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate(SalesNumber with min as UI5min__SalesNumber"
				+ ",SalesNumber with max as UI5max__SalesNumber,$count as UI5__count),identity)",
		// Note: use this for download URL
		sFollowUpApply : "filter(TransactionCurrency ne 'EUR' and Region ne 'UK')"
			+ "/groupby((TransactionCurrency,Region,A,B,C,CountryText,Texts/Country)"
				+ ",aggregate(Amount,Currency,SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)",
		mExpectedAlias2MeasureAndMethod : {
			UI5max__SalesNumber : {measure : "SalesNumber", method : "max"},
			UI5min__SalesNumber : {measure : "SalesNumber", method : "min"}
		}
	}, {
		oAggregation : {
			aggregate : { // Note: intentionally not sorted
				Amount : {
					grandTotal : true,
					unit : "Currency",
					with : "average"
				},
				NetAmountAggregate : { // Note: intentionally no "with", although spec requires it
					name : "NetAmount"
				},
				GrossAmountCount : {
					grandTotal : true,
					name : "GrossAmount",
					with : "countdistinct"
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
			groupLevels : ["Currency"]
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
			groupLevels : ["Country"]
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
			search : "blue OR green",
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
		sApply : "filter(Region gt 'E')/search(blue OR green)"
			+ "/concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 100)/orderby(Region desc)"
			+ "/concat(aggregate($count as UI5__count),top(42)))",
		sFollowUpApply : "filter(Region gt 'E')/search(blue OR green)"
			+ "/groupby((Region),aggregate(SalesNumber))"
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
				SalesNumberSum : {grandTotal : true, name : "SalesNumber", with : "sum"}
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
					with : "average"
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
					with : "average"
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
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$filter : "SalesNumber ge 0"
		},
		sApply : "filter(Name eq 'Foo')/groupby((Region),aggregate(SalesNumber))"
			+ "/filter(SalesNumber ge 0)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {}
			},
			group : {
				Country : {additionally : ["CountryText", "Texts/Country"]},
				Region : {additionally : ["RegionText", "Texts/Region"]}
			}
		},
		sApply : "groupby((Country,Region,CountryText,Texts/Country,RegionText,Texts/Region)"
			+ ",aggregate(SalesNumber))"
	}, {
		oAggregation : {
			aggregate : {
				SalesAmount : {grandTotal : true, unit : "Currency"}
			},
			"grandTotal like 1.84" : true,
			group : {
				Country : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$count : true, // @see _AggregationCache#createGroupLevelCache
			$filter : "SalesAmount gt 0",
			$orderby : "Country desc",
			$skip : 42,
			$top : 99
		},
		sApply : "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesAmount,Currency))"
			+ "/filter(SalesAmount gt 0)/orderby(Country desc)"
			+ "/concat(aggregate(SalesAmount,Currency),aggregate($count as UI5__count)"
			+ ",skip(42)/top(99))",
		sFollowUpApply : "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesAmount,Currency))"
			+ "/filter(SalesAmount gt 0)/orderby(Country desc)/skip(42)/top(99)"
	}, {
		oAggregation : {
			aggregate : {
				SalesNumber : {grandTotal : true}
			},
			"grandTotal like 1.84" : true,
			group : {
				Country : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$count : true, // @see _AggregationCache#createGroupLevelCache
			$filter : "SalesNumber gt 0",
			$orderby : "Country desc"
			// no $skip/$top here
		},
		sApply : "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesNumber))"
			+ "/filter(SalesNumber gt 0)/orderby(Country desc)"
			+ "/concat(aggregate(SalesNumber),aggregate($count as UI5__count),identity)",
		sFollowUpApply : "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesNumber))"
			+ "/filter(SalesNumber gt 0)/orderby(Country desc)"
	}, {
		oAggregation : {
			aggregate : {
				SalesAmountSum : {
					grandTotal : true,
					name : "SalesAmount",
					unit : "Currency", // Note: unsupported in 1.84
					with : "sum"
				}
			},
			"grandTotal like 1.84" : true,
			group : {
				Country : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$count : true, // @see _AggregationCache#createGroupLevelCache
			$filter : "SalesAmountSum gt 0",
			$orderby : "Country desc"
			// no $skip/$top here
		},
		sApply : "filter(Name eq 'Foo')/groupby((Country)"
			+ ",aggregate(SalesAmount with sum as SalesAmountSum,Currency))"
			+ "/filter(SalesAmountSum gt 0)/orderby(Country desc)/concat("
			+ "aggregate(SalesAmountSum with sum as UI5grand__SalesAmountSum,Currency),"
			+ "aggregate($count as UI5__count),identity)",
		sFollowUpApply : "filter(Name eq 'Foo')/groupby((Country)"
			+ ",aggregate(SalesAmount with sum as SalesAmountSum,Currency))"
			+ "/filter(SalesAmountSum gt 0)/orderby(Country desc)"
	}, {
		oAggregation : {
			aggregate : {
				SalesAmountSum : {
					grandTotal : true,
					name : "SalesAmount",
					unit : "Currency" // Note: unsupported in 1.84
					// Note: intentionally no "with", although spec requires it
				}
			},
			"grandTotal like 1.84" : true,
			group : {
				Country : {}
			}
		},
		mQueryOptions : {
			$$filterBeforeAggregate : "Name eq 'Foo'",
			$count : true, // @see _AggregationCache#createGroupLevelCache
			$filter : "SalesAmountSum gt 0",
			$orderby : "Country desc",
			$skip : 42,
			$top : 99
		},
		sApply : "filter(Name eq 'Foo')/groupby((Country)"
			+ ",aggregate(SalesAmount as SalesAmountSum,Currency))"
			+ "/filter(SalesAmountSum gt 0)/orderby(Country desc)/concat("
			+ "aggregate(SalesAmountSum as UI5grand__SalesAmountSum,Currency),"
			+ "aggregate($count as UI5__count),skip(42)/top(99))",
		sFollowUpApply : "filter(Name eq 'Foo')/groupby((Country)"
			+ ",aggregate(SalesAmount as SalesAmountSum,Currency))"
			+ "/filter(SalesAmountSum gt 0)/orderby(Country desc)/skip(42)/top(99)"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmount : {subtotals : true}
			},
			group : { // Note: intentionally not sorted
				LifecycleStatus : {},
				CurrencyCode : {}
			},
			groupLevels : ["LifecycleStatus", "CurrencyCode"]
		},
		mQueryOptions : {
			$$leaves : true,
			$count : true,
			$orderby : "LifecycleStatus desc",
			$top : 3
		},
		sApply : "concat(groupby((CurrencyCode,LifecycleStatus))/aggregate($count as UI5__leaves)"
			+ ",groupby((LifecycleStatus),aggregate(GrossAmount))/orderby(LifecycleStatus desc)"
			+ "/concat(aggregate($count as UI5__count),top(3)))",
		sFollowUpApply : "groupby((LifecycleStatus),aggregate(GrossAmount))"
			+ "/orderby(LifecycleStatus desc)/top(3)"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmount : {subtotals : true}
			},
			// group is optional
			groupLevels : ["LifecycleStatus", "CurrencyCode"]
		},
		iLevel : 2, // ignore $$leaves!
		mQueryOptions : {
			$$filterBeforeAggregate : "LifecycleStatus eq 'X'",
			$$leaves : true,
			$count : true,
			$orderby : "LifecycleStatus desc",
			$top : 3
		},
		sApply : "filter(LifecycleStatus eq 'X')/groupby((CurrencyCode),aggregate(GrossAmount))"
			+ "/orderby(LifecycleStatus desc)/concat(aggregate($count as UI5__count),top(3))",
		sFollowUpApply : "filter(LifecycleStatus eq 'X')"
			+ "/groupby((CurrencyCode),aggregate(GrossAmount))/orderby(LifecycleStatus desc)/top(3)"
	}, {
		oAggregation : {
			aggregate : {
				GrossAmount : {grandTotal : true, subtotals : true}
			},
			// group is optional
			groupLevels : ["LifecycleStatus", "CurrencyCode"]
		},
		mQueryOptions : {
			$$leaves : true,
			$count : true,
			$top : 3
		},
		sApply : "concat(groupby((CurrencyCode,LifecycleStatus))/aggregate($count as UI5__leaves)"
			+ ",aggregate(GrossAmount)"
			+ ",groupby((LifecycleStatus),aggregate(GrossAmount))"
				+ "/concat(aggregate($count as UI5__count),top(3)))",
		sFollowUpApply : "groupby((LifecycleStatus),aggregate(GrossAmount))/top(3)"
	}].forEach(function (oFixture) {
		QUnit.test("buildApply with " + oFixture.sApply, function (assert) {
			var mAlias2MeasureAndMethod = {},
				sFollowUpApply = oFixture.sFollowUpApply || oFixture.sApply,
				iLevel = "iLevel" in oFixture ? oFixture.iLevel : 1,
				sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions),
				mResult;

			this.mock(_AggregationHelper).expects("checkTypeof").never();

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions,
				iLevel, false, mAlias2MeasureAndMethod);

			assert.deepEqual(mResult, {$apply : oFixture.sApply}, "sApply");
			assert.deepEqual(mAlias2MeasureAndMethod,
				oFixture.mExpectedAlias2MeasureAndMethod || {}, "mAlias2MeasureAndMethod");

			mAlias2MeasureAndMethod = {};

			// code under test
			mResult = _AggregationHelper.buildApply(oFixture.oAggregation,
				oFixture.mQueryOptions, iLevel, true, mAlias2MeasureAndMethod);

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
			aggregate : {A : {grandTotal : true}},
			"grandTotal like 1.84" : true,
			groupLevels : ["B"]
		},
		sError : "Cannot combine visual grouping with grand total"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, with : "average"}},
			"grandTotal like 1.84" : true
		},
		sError : "Cannot aggregate totals with 'average'"
	}, {
		oAggregation : {
			aggregate : {A : {grandTotal : true, with : "countdistinct"}},
			"grandTotal like 1.84" : true
		},
		sError : "Cannot aggregate totals with 'countdistinct'"
	}].forEach(function (oFixture) {
		QUnit.test("buildApply: " + oFixture.sError, function (assert) {
			assert.throws(function () {
				// code under test
				_AggregationHelper.buildApply(oFixture.oAggregation, {}, /*iLevel*/1);
			}, new Error(oFixture.sError));
		});
	});

	//*********************************************************************************************
[0, 1, 2].forEach(function (iLevel) {
	QUnit.test("buildApply: recursive hierarchy, iLevel=" + iLevel, function (assert) {
		var oAggregation = {hierarchyQualifier : "X"};

		this.mock(_AggregationHelper).expects("checkTypeof").never();
		this.mock(_AggregationHelper).expects("buildApply4Hierarchy")
			.withExactArgs(sinon.match.same(oAggregation), "~mQueryOptions~", iLevel === 0)
			.returns("~result~");

		assert.strictEqual(
			// code under test
			_AggregationHelper.buildApply(oAggregation, "~mQueryOptions~", iLevel),
			"~result~");
	});
});

	//*********************************************************************************************
[{
	sExpectedApply : "com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/Foo"
		+ ",HierarchyQualifier='X',NodeProperty='aNodeID',Levels=1)"
}, {
	sExpectedApply : "ancestors($root/Foo,X,aNodeID,filter(~$filter~),keep start)"
		+ "/com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/Foo"
		+ ",HierarchyQualifier='X',NodeProperty='aNodeID',Levels=1)",
	mQueryOptions : {$filter : "~$filter~"}
}, {
	sExpectedApply : "orderby(~$orderby~)/com.sap.vocabularies.Hierarchy.v1.TopLevels("
		+ "HierarchyNodes=$root/Foo,HierarchyQualifier='X',NodeProperty='aNodeID',Levels=1)",
	mQueryOptions : {$orderby : "~$orderby~"}
}, {
	oAggregation : {search : "~$search~"},
	sExpectedApply : "ancestors($root/Foo,X,aNodeID,search(~$search~),keep start)"
		+ "/com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/Foo"
		+ ",HierarchyQualifier='X',NodeProperty='aNodeID',Levels=1)"
}, {
	oAggregation : {search : "~$search~"},
	sExpectedApply : "ancestors($root/Foo,X,aNodeID,filter(~$filter~)/search(~$search~),keep start)"
		+ "/orderby(~$orderby~)/com.sap.vocabularies.Hierarchy.v1.TopLevels("
		+ "HierarchyNodes=$root/Foo,HierarchyQualifier='X',NodeProperty='aNodeID',Levels=1)",
	mQueryOptions : {$filter : "~$filter~", $orderby : "~$orderby~"}
}].forEach(function (mFixture, i) {
	QUnit.test("buildApply4Hierarchy: top levels of nodes, #" + i, function (assert) {
		var oAggregation = Object.assign({
				hierarchyQualifier : "X",
				$fetchMetadata : function () {},
				$metaPath : "/meta",
				$path : "/Foo"
			}, mFixture.oAggregation),
			mQueryOptions = Object.assign({
				// intentionally no $select here, e.g. some early call
				foo : "bar"
			}, mFixture.mQueryOptions),
			sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		this.mock(oAggregation).expects("$fetchMetadata")
			.withExactArgs("/meta/@Org.OData.Aggregation.V1.RecursiveHierarchy#X")
			.returns(SyncPromise.resolve({
				NodeProperty : {$PropertyPath : "aNodeID"},
				ParentNavigationProperty : {$NavigationPropertyPath : "aParentNavigation"}
			}));

		// code under test
		assert.deepEqual(_AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions), {
				$apply : mFixture.sExpectedApply,
				// no more $filter or $orderby!
				foo : "bar"
			});

		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
		assert.strictEqual(oAggregation.expandTo, 1, "defaulting");
		assert.strictEqual(oAggregation.$NodeProperty, "aNodeID");
		assert.strictEqual(oAggregation.$ParentNavigationProperty, "aParentNavigation");
		assert.notOk("$LimitedRank" in oAggregation, "unchanged");
	});
});

	//*********************************************************************************************
	QUnit.test("buildApply4Hierarchy: call from ODLB#applyParameters", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X",
				$fetchMetadata : function () {}
				// Note: these are missing in case of a relative binding
				// $metaPath : "/meta/path",
				// $path : "/Foo"
			};

		this.mock(oAggregation).expects("$fetchMetadata").never(); // do not rely on metadata

		// code under test
		assert.deepEqual(_AggregationHelper.buildApply4Hierarchy(oAggregation), {
				$apply : "com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root"
					+ ",HierarchyQualifier='X',NodeProperty='???',Levels=1)"
			});
		assert.notOk("$LimitedRank" in oAggregation, "unchanged");
		assert.strictEqual(oAggregation.expandTo, 1, "defaulting");
	});

	//*********************************************************************************************
	QUnit.test("buildApply4Hierarchy: $fetchMetadata async", function (assert) {
		var oAggregation = {
				hierarchyQualifier : "X",
				$fetchMetadata : function () {},
				$metaPath : "/meta/path",
				$path : "/some(0)/path"
			},
			// intentionally no $select here, e.g. some early call
			mQueryOptions = {foo : "bar"},
			oSyncPromise = new SyncPromise(function () {});

		this.mock(oAggregation).expects("$fetchMetadata").withExactArgs("/meta/path"
				+ "/@Org.OData.Aggregation.V1.RecursiveHierarchy#X")
			.returns(oSyncPromise);
		this.mock(oSyncPromise).expects("isFulfilled").returns(false);
		this.mock(oSyncPromise).expects("getResult").never();

		// code under test
		assert.deepEqual(_AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions), {
				$apply : "com.sap.vocabularies.Hierarchy.v1.TopLevels("
					+ "HierarchyNodes=$root/some(0)/path,HierarchyQualifier='X',NodeProperty='???'"
					+ ",Levels=1)",
				foo : "bar"
			});

		assert.notOk("$LimitedRank" in oAggregation, "unchanged");
		assert.notOk("$NodeProperty" in oAggregation);
		assert.strictEqual(oAggregation.expandTo, 1, "defaulting");
		assert.deepEqual(mQueryOptions, {foo : "bar"});
	});

	//*********************************************************************************************
[undefined, 1, 2, 3, Number.MAX_SAFE_INTEGER, Infinity].forEach(function (iExpandTo) {
	[false, true].forEach(function (bStored) {
		[false, true].forEach(function (bAllLevels) {
			[false, true].forEach(function (bExpandLevels) {
				[{
					DistanceFromRootProperty : {$PropertyPath : "DistFromRoot"},
					DrillStateProperty : {$PropertyPath : "myDrillState"},
					LimitedDescendantCountProperty : {$PropertyPath : "LtdDescendant_Count"}
				}, {
					DistanceFromRoot : {$Path : "DistFromRoot"},
					DrillState : {$Path : "myDrillState"},
					LimitedDescendantCount : {$Path : "LtdDescendant_Count"}
				}, {
					DistanceFromRoot : {$Path : "DistFromRoot"},
					DrillState : {$Path : "myDrillState"},
					LimitedDescendantCount : {$Path : "LtdDescendant_Count"},
					LimitedRank : {$Path : "LtdPreorderRank"}
				}].forEach((oRecursiveHierarchy, i) => {
					var sTitle = "buildApply4Hierarchy: top levels of nodes, $select, expandTo : "
						+ iExpandTo + ", property paths already stored: " + bStored
						+ ", all levels: " + bAllLevels
						+ ", expand levels: " + bExpandLevels
						+ ", Rec.Hier. #" + i;

					if (iExpandTo >= Number.MAX_SAFE_INTEGER && bAllLevels) {
						return;
					}

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {
				expandTo : iExpandTo,
				hierarchyQualifier : "X",
				$fetchMetadata : function () {},
				$metaPath : "/meta",
				$path : "/Foo"
			},
			oAggregationMock = this.mock(oAggregation),
			oExpectedAggregation = iExpandTo > 1 ? {
				$DistanceFromRoot : "DistFromRoot",
				$LimitedDescendantCount : "LtdDescendant_Count"
			} : {},
			iExpectedLevels = iExpandTo || 1,
			aExpectedSelect = iExpandTo > 1 || bExpandLevels
			? ["ID", "SomeNodeID", "DistFromRoot", "LtdDescendant_Count", "myDrillState"]
			: ["ID", "SomeNodeID", "myDrillState"],
			mQueryOptions = {
				$select : ["ID"],
				foo : "bar"
			},
			sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		if (bStored) {
			oAggregation.$Actions = "~actions~";
			oAggregation.$DrillState = "myDrillState";
			oAggregation.$NodeProperty = "SomeNodeID";
			oAggregation.$ParentNavigationProperty = "SomeParentNavigation";
		}
		if (bAllLevels) {
			aExpectedSelect = ["ID", "SomeNodeID", "DistFromRoot", "myDrillState"];
			oExpectedAggregation = {
				$DistanceFromRoot : "DistFromRoot"
			};
			if (bStored) {
				oAggregation.$DistanceFromRoot = "DistFromRoot";
			}
		} else if (bStored && (iExpandTo > 1 || bExpandLevels)) {
			oAggregation.$DistanceFromRoot = "DistFromRoot";
			oAggregation.$LimitedDescendantCount = "LtdDescendant_Count";
		}
		if (bExpandLevels) {
			oAggregation.$ExpandLevels = "~$ExpandLevels~";
			oExpectedAggregation.$ExpandLevels = "~$ExpandLevels~";
			oExpectedAggregation.$DistanceFromRoot = "DistFromRoot";
			if (!bAllLevels) {
				oExpectedAggregation.$LimitedDescendantCount = "LtdDescendant_Count";
			}
		}
		oAggregationMock.expects("$fetchMetadata").exactly(bStored ? 0 : 1)
			.withExactArgs("/meta/@Org.OData.Aggregation.V1.RecursiveHierarchy#X")
			.returns(SyncPromise.resolve({
				NodeProperty : {$PropertyPath : "SomeNodeID"},
				ParentNavigationProperty : {$NavigationPropertyPath : "SomeParentNavigation"}
			}));
		oAggregationMock.expects("$fetchMetadata").exactly(bStored ? 0 : 1)
			.withExactArgs("/meta/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy#X")
			.returns(SyncPromise.resolve(oRecursiveHierarchy));
		oAggregationMock.expects("$fetchMetadata").exactly(bStored ? 0 : 1)
			.withExactArgs("/meta/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyActions#X")
			.returns(SyncPromise.resolve("~actions~"));
		oExpectedAggregation = Object.assign({
			expandTo : iExpandTo || 1,
			hierarchyQualifier : "X",
			$fetchMetadata : oAggregation.$fetchMetadata, // remember the mock(!)
			$metaPath : "/meta",
			$path : "/Foo",
			$Actions : "~actions~",
			$DrillState : "myDrillState",
			$NodeProperty : "SomeNodeID",
			$ParentNavigationProperty : "SomeParentNavigation"
		}, oExpectedAggregation);

		assert.deepEqual(
			// code under test
			_AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions, bAllLevels),
			{
				$apply : bAllLevels || iExpandTo >= Number.MAX_SAFE_INTEGER
					? "com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/Foo"
					+ ",HierarchyQualifier='X',NodeProperty='SomeNodeID'"
					+ (bExpandLevels && !bAllLevels ? ",ExpandLevels=~$ExpandLevels~" : "")
					+ ")"
					: "com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root/Foo"
					+ ",HierarchyQualifier='X',NodeProperty='SomeNodeID',Levels=" + iExpectedLevels
					+ (bExpandLevels ? ",ExpandLevels=~$ExpandLevels~" : "")
					+ ")",
				$select : aExpectedSelect,
				foo : "bar"
			});

		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
		assert.strictEqual(oAggregation.$fetchMetadata, oExpectedAggregation.$fetchMetadata);
		if (bStored) {
			assert.notOk("$LimitedRank" in oAggregation, "unchanged");
		} else {
			const sLimitedRank
				= oRecursiveHierarchy.LimitedRank ? "LtdPreorderRank" : "LimitedRank";
			assert.strictEqual(oAggregation.$LimitedRank, sLimitedRank);
			oExpectedAggregation.$LimitedRank = sLimitedRank;
		}
		assert.deepEqual(oAggregation, oExpectedAggregation);
	});
				});
			});
		});
	});
});

	//*********************************************************************************************
[{
	sExpectedApply : "descendants($root/some(0)/path,XYZ,myID,filter(ID eq '42'),1)"
}, {
	sExpectedApply : "ancestors($root/some(0)/path,XYZ,myID,filter(~$filter~),keep start)"
		+ "/descendants($root/some(0)/path,XYZ,myID,filter(ID eq '42'),1)",
	mQueryOptions : {$filter : "~$filter~"}
}, {
	sExpectedApply : "descendants($root/some(0)/path,XYZ,myID,filter(ID eq '42'),1)"
		+ "/orderby(~$orderby~)",
	mQueryOptions : {$orderby : "~$orderby~"}
}, {
	oAggregation : {search : "~$search~"},
	sExpectedApply : "ancestors($root/some(0)/path,XYZ,myID,search(~$search~),keep start)"
		+ "/descendants($root/some(0)/path,XYZ,myID,filter(ID eq '42'),1)"
}, {
	oAggregation : {search : "~$search~"},
	sExpectedApply : "ancestors($root/some(0)/path,XYZ,myID,filter(~$filter~)/search(~$search~)"
		+ ",keep start)/descendants($root/some(0)/path,XYZ,myID,filter(ID eq '42'),1)"
		+ "/orderby(~$orderby~)",
	mQueryOptions : {$filter : "~$filter~", $orderby : "~$orderby~"}
}].forEach(function (mFixture, i) {
	[
		{DrillStateProperty : {$PropertyPath : "path/to/aDrillState"}},
		{DrillState : {$Path : "path/to/aDrillState"}}
	].forEach((oRecursiveHierarchy, j) => {
		[false, true].forEach((bStored) => {
			const sTitle = "buildApply4Hierarchy: children of a given parent, #" + i + ", #" + j
				+ ", $LimitedRank already stored: " + bStored;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = Object.assign({
				hierarchyQualifier : "XYZ",
				$fetchMetadata : function () {},
				$metaPath : "/meta/path",
				$path : "/some(0)/path"
			}, mFixture.oAggregation),
			oAggregationMock = this.mock(oAggregation),
			mQueryOptions = Object.assign({
				$$filterBeforeAggregate : "ID eq '42'",
				// Note: let's assume "myID" is a key property or needed on UI...
				$select : ["ID", "myID"], // by now, auto-$expand/$select must have finished
				foo : "bar"
			}, mFixture.mQueryOptions),
			sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		if (bStored) {
			oAggregation.$LimitedRank = "~LimitedRank~";
		}
		oAggregationMock.expects("$fetchMetadata")
			.withExactArgs("/meta/path/@Org.OData.Aggregation.V1.RecursiveHierarchy#XYZ")
			.returns(SyncPromise.resolve({
				NodeProperty : {$PropertyPath : "myID"},
				ParentNavigationProperty : {$NavigationPropertyPath : "myParentNavigation"}
			}));
		oAggregationMock.expects("$fetchMetadata")
			.withExactArgs("/meta/path/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy#XYZ")
			.returns(SyncPromise.resolve(oRecursiveHierarchy));
		oAggregationMock.expects("$fetchMetadata")
			.withExactArgs(
				"/meta/path/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyActions#XYZ")
			.returns(SyncPromise.resolve("~actions~"));

		// code under test
		assert.deepEqual(_AggregationHelper.buildApply4Hierarchy(oAggregation, mQueryOptions), {
				$apply : mFixture.sExpectedApply,
				// no more $filter or $orderby!
				$select : ["ID", "myID", "path/to/aDrillState"],
				foo : "bar"
			});

		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
		if (bStored) {
			assert.strictEqual(oAggregation.$LimitedRank, "~LimitedRank~", "unchanged");
		} else {
			assert.strictEqual(oAggregation.$LimitedRank, "path/to/LimitedRank",
				"derived from DrillState");
		}
		assert.strictEqual(oAggregation.$Actions, "~actions~");
		assert.strictEqual(oAggregation.$NodeProperty, "myID");
		assert.strictEqual(oAggregation.$ParentNavigationProperty, "myParentNavigation");
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("validateAggregation: checkTypeof for data aggregation", function (assert) {
		var oAggregation = {},
			oError = new Error();

		this.mock(_AggregationHelper).expects("checkTypeof")
			.withExactArgs(sinon.match.same(oAggregation), {
				aggregate : {
					"*" : {
						grandTotal : "boolean",
						max : "boolean",
						min : "boolean",
						name : "string",
						subtotals : "boolean",
						unit : "string",
						with : "string"
					}
				},
				"grandTotal like 1.84" : "boolean",
				grandTotalAtBottomOnly : "boolean",
				group : {
					"*" : {
						additionally : ["string"]
					}
				},
				groupLevels : ["string"],
				search : "string",
				subtotalsAtBottomOnly : "boolean"
			}, "$$aggregation")
			.throws(oError);

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation(oAggregation);
		}, oError);
	});

	//*********************************************************************************************
	QUnit.test("validateAggregation: checkTypeof for recursive hierarchy", function (assert) {
		var oAggregation = {hierarchyQualifier : "X"},
			oError = new Error();

		this.mock(_AggregationHelper).expects("checkTypeof")
			.withExactArgs(sinon.match.same(oAggregation), {
				expandTo : /^[1-9]\d*$/,
				hierarchyQualifier : "string",
				search : "string"
			}, "$$aggregation")
			.throws(oError);

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation(oAggregation, true);
		}, oError);

		assert.deepEqual(oAggregation, {hierarchyQualifier : "X"}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("validateAggregation: autoExpandSelect for recursive hierarchy", function (assert) {
		var oAggregation = {hierarchyQualifier : "X"};

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation(oAggregation, false);
		}, new Error("Missing parameter autoExpandSelect at model"));

		assert.deepEqual(oAggregation, {hierarchyQualifier : "X"}, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("validateAggregationAndSetPath: OK", function (assert) {
		var oAggregation = {hierarchyQualifier : "X"};

		this.mock(_AggregationHelper).expects("validateAggregation")
			.withExactArgs(sinon.match.same(oAggregation), "~bAutoExpandSelect~");
		this.mock(_AggregationHelper).expects("setPath")
			.withExactArgs(sinon.match.same(oAggregation), "/some(0)/path");

		// code under test
		_AggregationHelper.validateAggregationAndSetPath(oAggregation, "~bAutoExpandSelect~",
			"~fnFetchMetadata~", "/some(0)/path");

		assert.deepEqual(oAggregation, {
			hierarchyQualifier : "X",
			$fetchMetadata : "~fnFetchMetadata~"
		});
	});

	//*********************************************************************************************
	QUnit.test("validateAggregationAndSetPath: error", function (assert) {
		var oAggregation = {hierarchyQualifier : "X"},
			oError = new Error("...");

		this.mock(_AggregationHelper).expects("validateAggregation")
			.withExactArgs(sinon.match.same(oAggregation), "~bAutoExpandSelect~")
			.throws(oError);
		this.mock(_AggregationHelper).expects("setPath").never();

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregationAndSetPath(oAggregation, "~bAutoExpandSelect~",
				Function, "n/a");
		}, oError);

		assert.deepEqual(oAggregation, {hierarchyQualifier : "X"});
	});

	//*********************************************************************************************
	QUnit.test("validateAggregation: checkTypeof - examples", function (assert) {
		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				subTotalsAtBottomOnly : true
			});
		}, new Error("Unsupported property: '$$aggregation/subTotalsAtBottomOnly'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				grandTotalAtBottomOnly : "top"
			});
		}, new Error("Not a boolean value for '$$aggregation/grandTotalAtBottomOnly'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				groupLevels : "The1"
			});
		}, new Error("Not an array value for '$$aggregation/groupLevels'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				group : {
					The1 : {additional : ["TheOther"]}
				}
			});
		}, new Error("Unsupported property: '$$aggregation/group/The1/additional'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				group : {
					The1 : {additionally : "TheOther"}
				}
			});
		}, new Error("Not an array value for '$$aggregation/group/The1/additionally'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				aggregate : {
					foo : {
						subtotals : "top"
					}
				}
			});
		}, new Error("Not a boolean value for '$$aggregation/aggregate/foo/subtotals'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				aggregate : {
					foo : {
						unit : ["A", "B"]
					}
				}
			});
		}, new Error("Not a string value for '$$aggregation/aggregate/foo/unit'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				"grandTotal like 1.84" : "1.84"
			});
		}, new Error("Not a boolean value for '$$aggregation/grandTotal like 1.84'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				expandTo : 0,
				hierarchyQualifier : "X"
			}, true);
		}, new Error("Not a matching value for '$$aggregation/expandTo'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				expandTo : -1,
				hierarchyQualifier : "X"
			}, true);
		}, new Error("Not a matching value for '$$aggregation/expandTo'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.validateAggregation({
				search : true,
				hierarchyQualifier : "X"
			}, true);
		}, new Error("Not a string value for '$$aggregation/search'"));
	});

	//*********************************************************************************************
	QUnit.test("checkTypeof: primitive types", function (assert) {
		// code under test
		_AggregationHelper.checkTypeof(false, "boolean");

		// code under test
		_AggregationHelper.checkTypeof(0, "number");

		// code under test
		_AggregationHelper.checkTypeof("", "string");

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(undefined, "boolean", "some/path");
		}, new Error("Not a boolean value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(undefined, "number", "some/path");
		}, new Error("Not a number value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(undefined, "string", "some/path");
		}, new Error("Not a string value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(undefined, ["boolean"], "some/path");
		}, new Error("Not an array value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(null, ["boolean"], "some/path");
		}, new Error("Not an array value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(undefined, {}, "some/path");
		}, new Error("Not an object value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof([], {}, "some/path");
		}, new Error("Not an object value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof(null, {}, "some/path");
		}, new Error("Not an object value for 'some/path'"));

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof({invalid : "n/a"}, {}, "some/path");
		}, new Error("Unsupported property: 'some/path/invalid'"));
	});
	//TODO Allow for alternative types, e.g. @param {string|string[]}? --> ["string", ["string"]]
	// Idea: Any array with more than one entry would be a list of alternatives.
	// --> [["string", ["string"]]] means @param {Array<(string|Array<string>)>} ;-)

	//*********************************************************************************************
	QUnit.test("checkTypeof: array", function () {
		var oAggregationHelperMock = this.mock(_AggregationHelper),
			aValue = [{}, {}, {}];

		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(aValue), ["~type~"], "some/path")
			.callThrough(); // start the recursion
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(aValue[0]), "~type~", "some/path/0");
		// Note: we use a slash separated path syntax here, like JSONModel, not a JS syntax like
		// some.path[0] which might lead to strange effects for keys which are not identifiers...
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(aValue[1]), "~type~", "some/path/1");
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(aValue[2]), "~type~", "some/path/2");

		// code under test
		_AggregationHelper.checkTypeof(aValue, ["~type~"], "some/path");
	});

	//*********************************************************************************************
	QUnit.test("checkTypeof: object", function () {
		var oAggregationHelperMock = this.mock(_AggregationHelper),
			oType = {
				bar : "~bar~",
				foo : "~foo~",
				ignored : "n/a"
			},
			oValue = {
				bar : {},
				foo : {}
			};

		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(oValue), sinon.match.same(oType), "some/path")
			.callThrough(); // start the recursion
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(oValue.bar), "~bar~", "some/path/bar");
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(oValue.foo), "~foo~", "some/path/foo");

		// code under test
		_AggregationHelper.checkTypeof(oValue, oType, "some/path");
	});

	//*********************************************************************************************
	QUnit.test("checkTypeof: map", function () {
		var oAggregationHelperMock = this.mock(_AggregationHelper),
			oType = {
				"*" : "~type~"
			},
			mValue = {
				bar : {},
				foo : {}
			};

		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(mValue), sinon.match.same(oType), "some/path")
			.callThrough(); // start the recursion
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(mValue.bar), "~type~", "some/path/bar");
		oAggregationHelperMock.expects("checkTypeof")
			.withExactArgs(sinon.match.same(mValue.foo), "~type~", "some/path/foo");

		// code under test
		_AggregationHelper.checkTypeof(mValue, oType, "some/path");
	});

	//*********************************************************************************************
	QUnit.test("checkTypeof: regular expression", function (assert) {
		var oRegExp = /abc/i,
			oRegExpMock = this.mock(oRegExp);

		oRegExpMock.expects("test").withExactArgs("~value~").returns(true);

		// code under test
		_AggregationHelper.checkTypeof("~value~", oRegExp, "some/path");

		oRegExpMock.expects("test").withExactArgs("~value~").returns(false);

		assert.throws(function () {
			// code under test
			_AggregationHelper.checkTypeof("~value~", oRegExp, "some/path");
		}, new Error("Not a matching value for 'some/path'"));
	});

	//*********************************************************************************************
	QUnit.test("hasGrandTotal", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasGrandTotal(), undefined);

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
		return new Filter(sPath, FilterOperator.EQ, "foo");
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
	QUnit.test("splitFilter: " + i, function (assert) {
		assert.deepEqual(
			_AggregationHelper.splitFilter(oFixture.filter, {aggregate : {a1 : {}, a2 : {}}}),
			oFixture.result
		);
	});
});

	//*********************************************************************************************
	QUnit.test("hasMinOrMax", function (assert) {
		// code under test
		assert.strictEqual(_AggregationHelper.hasMinOrMax(), undefined);

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

		[
			"", "*", "measure1", "measure1/*", "measure3", "dimension1", "dimension1/property1",
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
		assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "rank"), 5);
		assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "parent"), oParentCache);
		assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "placeholder"), true);
	});

	//*********************************************************************************************
[undefined, "~filterBeforeAggregate~"].forEach((sFilterBeforeAggregate) => {
	QUnit.test(`dropFilter: sFilterBeforeAggregate=${sFilterBeforeAggregate}`, function (assert) {
		const oAggregation = {
			$fetchMetadata : function () {},
			$metaPath : "/meta",
			$path : "/Foo",
			expandTo : 42,
			hierarchyQualifier : "X",
			search : "covfefe"
		};
		const sAggregationJSON = JSON.stringify(oAggregation);
		const mQueryOptions = {
			$$filterBeforeAggregate : "n/a",
			$count : "~count~",
			$expand : "~expand~",
			$filter : "~filter~",
			$orderby : "~orderby~",
			$select : "~select~",
			custom : "~custom~",
			foo : "bar"
		};
		const sQueryOptionsJSON = JSON.stringify(mQueryOptions);
		const mExpectedQueryOptions = {
			custom : "~custom~",
			foo : "bar"
		};
		if (sFilterBeforeAggregate) {
			mExpectedQueryOptions.$$filterBeforeAggregate = sFilterBeforeAggregate;
		}
		this.mock(_AggregationHelper).expects("buildApply4Hierarchy")
			.withExactArgs({
				$fetchMetadata : sinon.match.func,
				$metaPath : "/meta",
				$path : "/Foo",
				expandTo : 42,
				hierarchyQualifier : "X"
			}, mExpectedQueryOptions)
			.returns("~result~");

		assert.strictEqual(
			// code under test
			_AggregationHelper.dropFilter(oAggregation, mQueryOptions, sFilterBeforeAggregate),
			"~result~");

		assert.strictEqual(JSON.stringify(oAggregation), sAggregationJSON, "unchanged");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bSubtotalsAtBottomOnly) {
	QUnit.test("extractSubtotals: at bottom only = " + bSubtotalsAtBottomOnly, function (assert) {
		var oAggregation = {
				aggregate : {
					A : {subtotals : true},
					B : {subtotals : true, unit : "U"},
					C : {name : "n/a", subtotals : true},
					NA : {},
					XX : {unit : "n/a"}
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
					A : {subtotals : true, unit : "U"},
					B : {subtotals : true, unit : "V"},
					C : {subtotals : true, unit : "W"}
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
	QUnit.test("getFilteredOrderby", function (assert) {
		function testWithLevels(sOrderby, aExpected) {
			var oAggregation = {
					aggregate : {
						SalesAmount : {subtotals : true, unit : "Currency"},
						SalesNumber : {unit : "One"}
					},
					group : { // Note: added by _AggregationHelper.buildApply before
						Country : {},
						Region : {additionally : ["RegionText", "Texts/Region"]},
						Segment : {additionally : ["SegmentText", "Texts/Segment"]}
					},
					groupLevels : ["Country", "Region"]
				};

			aExpected.forEach(function (sExpected, iLevel) {
				assert.strictEqual(
					// code under test
					_AggregationHelper.getFilteredOrderby(sOrderby, oAggregation, iLevel),
					sExpected, sOrderby + ", " + iLevel);
			});
		}

		testWithLevels("Currency,One,NotApplicable",
			["Currency,One", "Currency", "Currency", "Currency,One"]);
		testWithLevels("SalesAmount desc,SalesNumber,Country desc,Region,Segment asc", [
				"SalesAmount desc,SalesNumber,Country desc,Region,Segment asc",
				"SalesAmount desc,Country desc",
				"SalesAmount desc,Region",
				"SalesAmount desc,SalesNumber,Segment asc"
			]);
		testWithLevels(
			"Country,RegionText desc,Texts/Region asc,SegmentText desc,Texts/Segment asc", [
				"Country,RegionText desc,Texts/Region asc,SegmentText desc,Texts/Segment asc",
				"Country",
				"RegionText desc,Texts/Region asc",
				"SegmentText desc,Texts/Segment asc"
			]);

		// Note: w/o group levels, level must not make a difference
		[0, 1].forEach(function (iLevel) {
			var oAggregation = {
					aggregate : {
						Measure : {unit : "UnitOfMeasure"}
					},
					group : {
						Dimension : {additionally : ["Texts/Dimension"]}
					},
					groupLevels : [] // Note: added by _AggregationHelper.buildApply before
				},
				mInput2Output = {
					"Dimension %20desc%2CFoo asc" : "Dimension %20desc",
					"Dimension\tdesc,Foo asc" : "Dimension\tdesc",
					"Measure desc%2cDimension" : "Measure desc,Dimension",
					"NavigationProperty/$count" : "NavigationProperty/$count",
					"Texts/Dimension" : "Texts/Dimension",
					"UnitOfMeasure desc" : "UnitOfMeasure desc"
				};

			Object.keys(mInput2Output).forEach(function (sOrderby) {
				assert.strictEqual(
					// code under test
					_AggregationHelper.getFilteredOrderby(sOrderby, oAggregation, iLevel),
					mInput2Output[sOrderby], sOrderby + ", " + iLevel);
			});

			assert.strictEqual(
				// code under test
				_AggregationHelper.getFilteredOrderby(undefined, oAggregation, iLevel),
				undefined);
		});
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
			},
			oHelperMock = this.mock(_Helper);

		oHelperMock.expects("setAnnotation")
			.withExactArgs(sinon.match.same(oElement), "@$ui5.node.isExpanded", "~bIsExpanded~");
		oHelperMock.expects("setAnnotation")
			.withExactArgs(sinon.match.same(oElement), "@$ui5.node.isTotal", "~bIsTotal~");

		// code under test
		_AggregationHelper.setAnnotations(oElement, "~bIsExpanded~", "~bIsTotal~", "~iLevel~");

		assert.deepEqual(oElement, {
			"@$ui5.node.level" : "~iLevel~",
			group : "~group~",
			measure : "~measure~"
		});

		oHelperMock.expects("setAnnotation")
			.withExactArgs(sinon.match.same(oElement), "@$ui5.node.isExpanded", "~bIsExpanded~");
		oHelperMock.expects("setAnnotation")
			.withExactArgs(sinon.match.same(oElement), "@$ui5.node.isTotal", "~bIsTotal~");
		oHelperMock.expects("createMissing")
			.withExactArgs(sinon.match.same(oElement), ["Texts", "A"]);

		// code under test
		_AggregationHelper.setAnnotations(oElement, "~bIsExpanded~", "~bIsTotal~", "~iLevel~",
			["foo", "bar", "group", "measure", ["Texts", "A"]]);

		assert.deepEqual(oElement, {
			"@$ui5.node.level" : "~iLevel~",
			bar : null,
			foo : null,
			group : "~group~",
			measure : "~measure~"
		});
	});

	//*********************************************************************************************
	QUnit.test("setPath", function (assert) {
		var oAggregation = {};

		this.mock(_Helper).expects("getMetaPath").withExactArgs("/some(0)/path")
			.returns("/meta/path"); // unrealistic, but stronger

		// code under test
		_AggregationHelper.setPath(oAggregation, "/some(0)/path");

		assert.deepEqual(oAggregation, {
			$metaPath : "/meta/path",
			$path : "/some(0)/path"
		});

		// Note: no other call to _Helper.getMetaPath!

		// code under test
		_AggregationHelper.setPath(oAggregation, undefined);

		assert.deepEqual(oAggregation, {
			$metaPath : undefined,
			$path : undefined
		});
	});

	//*********************************************************************************************
	QUnit.test("getAllProperties", function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {
					x : {},
					y : {unit : "UnitY"}
				},
				group : {
					c : {}, // intentionally out of ABC order
					a : {additionally : ["TextA", "Texts/A"]},
					b : {}
				}
				// groupLevels : ["a", "b"]
			};

		assert.deepEqual(
			// code under test
			_AggregationHelper.getAllProperties(oAggregation),
			["x", "y", "c", "a", "b", "UnitY", "TextA", ["Texts", "A"]]);
	});

	//*********************************************************************************************
[false, true].forEach(function (bSubtotalsAtBottomOnly, i) {
	var sTitle = "getOrCreateExpandedObject: subtotalsAtBottomOnly = " + bSubtotalsAtBottomOnly;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = {subtotalsAtBottomOnly : bSubtotalsAtBottomOnly},
			oCollapsed,
			oExpanded,
			oExpectation,
			oGroupNode = {};

		oExpectation = this.mock(_AggregationHelper).expects("extractSubtotals")
			.withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oGroupNode),
				/*oCollapsed*/sinon.match.object, i ? /*oExpanded*/sinon.match.object : null);

		// code under test (1st time)
		oExpanded = _AggregationHelper.getOrCreateExpandedObject(oAggregation, oGroupNode);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "expanded"), oExpanded);
		assert.deepEqual(oExpanded, {"@$ui5.node.isExpanded" : true});
		oCollapsed = _Helper.getPrivateAnnotation(oGroupNode, "collapsed");
		assert.deepEqual(oCollapsed, {"@$ui5.node.isExpanded" : false});
		if (i) {
			assert.strictEqual(oExpectation.args[0][3], oExpanded);
		}

		assert.strictEqual(
			// code under test (2nd time)
			_AggregationHelper.getOrCreateExpandedObject(oAggregation, oGroupNode),
			oExpanded);

		assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "collapsed"), oCollapsed);

		// code under test
		assert.strictEqual(_AggregationHelper.getCollapsedObject(oGroupNode), oCollapsed);
	});
});

	//*********************************************************************************************
	QUnit.test("getOrCreateExpandedObject: subtotalsAtBottomOnly = undefined", function (assert) {
		var oAggregation = {subtotalsAtBottomOnly : undefined},
			oExpanded;

		this.mock(_Helper).expects("getPrivateAnnotation").never();
		this.mock(_Helper).expects("setPrivateAnnotation").never();
		this.mock(_AggregationHelper).expects("extractSubtotals").never();

		// code under test (1st time)
		oExpanded = _AggregationHelper.getOrCreateExpandedObject(oAggregation, {});

		assert.deepEqual(oExpanded, {"@$ui5.node.isExpanded" : true});

		assert.strictEqual(
			// code under test (2nd time)
			_AggregationHelper.getOrCreateExpandedObject(oAggregation, {}),
			oExpanded,
			"always the same");

		// check that no modification is possible
		assert.throws(function () {
			delete oExpanded["@$ui5.node.isExpanded"];
		});
		assert.throws(function () {
			oExpanded["@$ui5.node.isExpanded"] = false;
		});
		assert.throws(function () {
			oExpanded.foo = "bar";
		});
	});

	//*********************************************************************************************
	QUnit.test("getCollapsedObject: no private annotation", function (assert) {
		var oCollapsed;

		// code under test (1st time)
		oCollapsed = _AggregationHelper.getCollapsedObject({});

		assert.deepEqual(oCollapsed, {"@$ui5.node.isExpanded" : false});

		assert.strictEqual(
			// code under test (2nd time)
			_AggregationHelper.getCollapsedObject({}),
			oCollapsed,
			"always the same");

		// check that no modification is possible
		assert.throws(function () {
			delete oCollapsed["@$ui5.node.isExpanded"];
		});
		assert.throws(function () {
			oCollapsed["@$ui5.node.isExpanded"] = true;
		});
		assert.throws(function () {
			oCollapsed.foo = "bar";
		});
	});

	//*********************************************************************************************
[undefined, "", "sFilteredOrderby"].forEach(function (sFilteredOrderby) {
	var sTitle = "filterOrderby: sFilteredOrderby = " + sFilteredOrderby;

	QUnit.test(sTitle, function (assert) {
		var oAggregation = { // filled before by buildApply
				aggregate : {},
				group : {},
				groupLevels : ["a"]
			},
			mQueryOptions = {
				$orderby : "~$orderby~"
			};

		this.mock(_AggregationHelper).expects("getFilteredOrderby")
			.withExactArgs("~$orderby~", sinon.match.same(oAggregation), "~iLevel~")
			.returns(sFilteredOrderby);
		this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(mQueryOptions))
			.returns({
				$orderby : "n/a",
				foo : "bar"
			});

		// code under test
		assert.deepEqual(_AggregationHelper.filterOrderby(mQueryOptions, oAggregation, "~iLevel~"),
			sFilteredOrderby ? {
					$orderby : "sFilteredOrderby",
					foo : "bar"
				} : {
					foo : "bar"
				});
	});
});

	//*********************************************************************************************
	QUnit.test("removeUI5grand__", function (assert) {
		var oGrandTotal = {
				foo : "bar",
				UI5grand__SalesAmountSum : 123,
				"UI5grand__SalesAmountSum@odata.type" : "#Decimal"
			};

		// code under test
		_AggregationHelper.removeUI5grand__(oGrandTotal);

		assert.deepEqual(oGrandTotal, {
			foo : "bar",
			SalesAmountSum : 123,
			"SalesAmountSum@odata.type" : "#Decimal"
		});
	});

	//*********************************************************************************************
	QUnit.test("markSplicedStale", function (assert) {
		var oElement = {},
			aSpliced = [];

		// code under test
		_AggregationHelper.markSplicedStale(oElement);

		assert.deepEqual(oElement, {}, "unchanged");

		_Helper.setPrivateAnnotation(oElement, "spliced", aSpliced);

		// code under test
		_AggregationHelper.markSplicedStale(oElement);

		assert.strictEqual(aSpliced.$stale, true);
		assert.deepEqual(oElement, {"@$ui5._" : {spliced : []}}, "nothing else");
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForOutOfPlaceNodesData: below parent", function (assert) {
		const oOutOfPlace = {
			nodeFilters : ["~node2Filter~", "~node1Filter~", "~node3Filter~"],
			parentFilter : "~parentFilter~"
		};
		const sOutOfPlaceJSON = JSON.stringify(oOutOfPlace);
		const oAggregation = {
			expandTo : 99,
			hierarchyQualifier : "X",
			search : "~search~",
			$DrillState : "~$DrillState~",
			$ExpandLevels : "~$ExpandLevels~"
		};
		const sAggregationJSON = JSON.stringify(oAggregation);
		const mQueryOptions = {
			$$filterBeforeAggregate : "~filterBeforeAggregate~",
			$count : "~count~",
			$filter : "~filter~",
			$orderby : "~orderby~",
			custom : "~custom~"
		};
		const sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		this.mock(_AggregationHelper).expects("buildApply")
			.callsFake(function (oAggregation0, mQueryOptions0, iLevel) {
				assert.deepEqual(oAggregation0, {
					expandTo : 1,
					hierarchyQualifier : "X",
					$DrillState : "~$DrillState~"
				});
				assert.deepEqual(mQueryOptions0, {
					$$filterBeforeAggregate : "~parentFilter~",
					custom : "~custom~"
				});
				assert.strictEqual(iLevel, 1);

				mQueryOptions0.$apply = "~apply~";
				mQueryOptions0.$select = ["~select~", "~$DrillState~"];
				return mQueryOptions0;
			});

		// code under test
		const mResult = _AggregationHelper.getQueryOptionsForOutOfPlaceNodesData(oOutOfPlace,
			oAggregation, mQueryOptions);

		assert.deepEqual(mResult, {
			$$filterBeforeAggregate : "~parentFilter~",
			$apply : "~apply~",
			$filter : "~node1Filter~ or ~node2Filter~ or ~node3Filter~",
			$select : ["~select~"],
			$top : 3,
			custom : "~custom~"
		});
		assert.strictEqual(JSON.stringify(oAggregation), sAggregationJSON, "unchanged");
		assert.strictEqual(JSON.stringify(oOutOfPlace), sOutOfPlaceJSON, "unchanged");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForOutOfPlaceNodesData: root nodes", function (assert) {
		const oOutOfPlace = {
			nodeFilters : ["~node2Filter~", "~node1Filter~", "~node3Filter~"]
		};
		const sOutOfPlaceJSON = JSON.stringify(oOutOfPlace);
		const oAggregation = {
			expandTo : 99,
			hierarchyQualifier : "X",
			search : "~search~",
			$DrillState : "~$DrillState~",
			$ExpandLevels : "~$ExpandLevels~"
		};
		const sAggregationJSON = JSON.stringify(oAggregation);
		const mQueryOptions = {
			$count : "~count~",
			$filter : "~filter~",
			$orderby : "~orderby~",
			custom : "~custom~"
		};
		const sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		this.mock(_AggregationHelper).expects("buildApply")
			.callsFake(function (oAggregation0, mQueryOptions0, iLevel) {
				assert.deepEqual(oAggregation0, {
					expandTo : 1,
					hierarchyQualifier : "X",
					$DrillState : "~$DrillState~"
				});
				assert.deepEqual(mQueryOptions0, {custom : "~custom~"});
				assert.strictEqual(iLevel, 1);

				mQueryOptions0.$apply = "~apply~";
				mQueryOptions0.$select = ["~select~"];
				return mQueryOptions0;
			});

		// code under test
		const mResult = _AggregationHelper.getQueryOptionsForOutOfPlaceNodesData(oOutOfPlace,
			oAggregation, mQueryOptions);

		assert.deepEqual(mResult, {
			$apply : "~apply~",
			$filter : "~node1Filter~ or ~node2Filter~ or ~node3Filter~",
			$select : ["~select~"],
			$top : 3,
			custom : "~custom~"
		});
		assert.strictEqual(JSON.stringify(oAggregation), sAggregationJSON, "unchanged");
		assert.strictEqual(JSON.stringify(oOutOfPlace), sOutOfPlaceJSON, "unchanged");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("getQueryOptionsForOutOfPlaceNodesRank", function (assert) {
		const aOutOfPlaceByParent = [{
			nodeFilters : ["~node2Filter~", "~node1Filter~"],
			parentFilter : "~parent1Filter~"
		}, {
			nodeFilters : ["~node4Filter~", "~node5Filter~"],
			parentFilter : "~node2Filter~"
		}, {
			nodeFilters : ["~node3Filter~"]
		}];
		const sOutOfPlaceByParentJSON = JSON.stringify(aOutOfPlaceByParent);
		const oAggregation = {
			$DistanceFromRoot : "~$DistanceFromRoot~",
			$DrillState : "~$DrillState~",
			$LimitedDescendantCount : "~$LimitedDescendantCount~",
			$LimitedRank : "~$LimitedRank~",
			$metaPath : "~$metaPath~",
			$fetchMetadata : mustBeMocked
		};
		const mQueryOptions = {
			$apply : "~apply~",
			$count : "~count~",
			$filter : "~filter~",
			$orderby : "~orderby~",
			$select : "~select~",
			custom : "~custom~"
		};
		const sQueryOptionsJSON = JSON.stringify(mQueryOptions);

		this.mock(oAggregation).expects("$fetchMetadata").withExactArgs("~$metaPath~/")
			.returns(SyncPromise.resolve("~$metadata~"));
		this.mock(_Helper).expects("selectKeyProperties")
			.withExactArgs(sinon.match.object, "~$metadata~")
			.callsFake(function (mQueryOptions) {
				mQueryOptions.$select.push("~key~");
			});

		// code under test
		const mResult = _AggregationHelper.getQueryOptionsForOutOfPlaceNodesRank(
			aOutOfPlaceByParent, oAggregation, mQueryOptions);

		assert.deepEqual(mResult, {
			$apply : "~apply~",
			$filter : "~node1Filter~ or ~node2Filter~ or ~node3Filter~ or ~node4Filter~"
				+ " or ~node5Filter~ or ~parent1Filter~",
			$select : [
				"~$DistanceFromRoot~",
				"~$DrillState~",
				"~$LimitedDescendantCount~",
				"~$LimitedRank~",
				"~key~"
			],
			$top : 6,
			custom : "~custom~"
		});
		assert.strictEqual(
			JSON.stringify(aOutOfPlaceByParent), sOutOfPlaceByParentJSON, "unchanged");
		assert.strictEqual(JSON.stringify(mQueryOptions), sQueryOptionsJSON, "unchanged");
	});
});
