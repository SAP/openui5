import Log from "sap/base/Log";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import _AggregationHelper from "sap/ui/model/odata/v4/lib/_AggregationHelper";
import _Helper from "sap/ui/model/odata/v4/lib/_Helper";
QUnit.module("sap.ui.model.odata.v4.lib._AggregationHelper", {
    beforeEach: function () {
        this.oLogMock = this.mock(Log);
        this.oLogMock.expects("warning").never();
        this.oLogMock.expects("error").never();
    }
});
[{
        oAggregation: {
            group: {
                BillToParty: {}
            }
        },
        sApply: "groupby((BillToParty))"
    }, {
        oAggregation: {
            group: {
                TransactionCurrency: {},
                BillToParty: {}
            }
        },
        sApply: "groupby((BillToParty,TransactionCurrency))"
    }, {
        oAggregation: {
            groupLevels: ["TransactionCurrency"]
        },
        sApply: "groupby((TransactionCurrency))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: { subtotals: true }
            },
            group: {
                "n/a": {}
            },
            groupLevels: ["TransactionCurrency", "Region"]
        },
        iLevel: 1,
        sApply: "groupby((TransactionCurrency),aggregate(Amount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: { subtotals: true }
            },
            group: {
                "n/a": {}
            },
            groupLevels: ["TransactionCurrency", "Region"]
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "TransactionCurrency eq 'EUR'"
        },
        iLevel: 2,
        sApply: "filter(TransactionCurrency eq 'EUR')/groupby((Region),aggregate(Amount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: {}
            },
            group: {
                C: {},
                A: {},
                B: {}
            },
            groupLevels: ["TransactionCurrency", "Region"]
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "TransactionCurrency eq 'EUR' and Region eq 'UK'"
        },
        iLevel: 3,
        sApply: "filter(TransactionCurrency eq 'EUR' and Region eq 'UK')" + "/groupby((A,B,C),aggregate(Amount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: {
                    grandTotal: true,
                    subtotals: true,
                    unit: "Currency"
                },
                SalesNumber: {
                    max: true,
                    min: true,
                    subtotals: true
                }
            },
            group: {
                C: { additionally: ["CountryText", "Texts/Country"] },
                A: {},
                B: {}
            },
            groupLevels: ["TransactionCurrency", "Region"]
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "TransactionCurrency ne 'EUR' and Region ne 'UK'",
            $count: true,
            $filter: "SalesNumber ge 100",
            $orderby: "Region desc"
        },
        iLevel: 0,
        sApply: "filter(TransactionCurrency ne 'EUR' and Region ne 'UK')" + "/groupby((TransactionCurrency,Region,A,B,C,CountryText,Texts/Country)" + ",aggregate(Amount,Currency,SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)" + "/concat(aggregate(SalesNumber with min as UI5min__SalesNumber" + ",SalesNumber with max as UI5max__SalesNumber,$count as UI5__count),identity)",
        sFollowUpApply: "filter(TransactionCurrency ne 'EUR' and Region ne 'UK')" + "/groupby((TransactionCurrency,Region,A,B,C,CountryText,Texts/Country)" + ",aggregate(Amount,Currency,SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)",
        mExpectedAlias2MeasureAndMethod: {
            UI5max__SalesNumber: { measure: "SalesNumber", method: "max" },
            UI5min__SalesNumber: { measure: "SalesNumber", method: "min" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount: {
                    grandTotal: true,
                    unit: "Currency",
                    "with": "average"
                },
                NetAmountAggregate: {
                    name: "NetAmount"
                },
                GrossAmountCount: {
                    grandTotal: true,
                    name: "GrossAmount",
                    "with": "countdistinct"
                }
            },
            grandTotalAtBottomOnly: false,
            group: {
                BillToParty: {}
            }
        },
        sApply: "concat(aggregate(Amount with average as Amount,Currency" + ",GrossAmount with countdistinct as GrossAmountCount)" + ",groupby((BillToParty),aggregate(Amount with average as Amount,Currency" + ",GrossAmount with countdistinct as GrossAmountCount" + ",NetAmount as NetAmountAggregate)))",
        sFollowUpApply: "groupby((BillToParty),aggregate(Amount with average as Amount,Currency" + ",GrossAmount with countdistinct as GrossAmountCount" + ",NetAmount as NetAmountAggregate))"
    }, {
        oAggregation: {
            aggregate: {
                Alias: {
                    grandTotal: true,
                    name: "Name"
                },
                GrossAmount: {
                    grandTotal: true,
                    unit: "Currency"
                },
                NetAmount: {
                    grandTotal: true,
                    unit: "Currency"
                }
            },
            grandTotalAtBottomOnly: true,
            group: {
                BillToParty: {}
            }
        },
        sApply: "concat(aggregate(Name as Alias,GrossAmount,Currency,NetAmount)" + ",groupby((BillToParty),aggregate(Name as Alias,GrossAmount,Currency,NetAmount)))",
        sFollowUpApply: "groupby((BillToParty),aggregate(Name as Alias,GrossAmount,Currency,NetAmount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: {
                    grandTotal: true,
                    unit: "Currency"
                }
            },
            group: {
                Currency: {}
            }
        },
        sApply: "concat(aggregate(Amount,Currency),groupby((Currency),aggregate(Amount)))",
        sFollowUpApply: "groupby((Currency),aggregate(Amount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: {
                    grandTotal: true,
                    subtotals: true,
                    unit: "Currency"
                }
            },
            groupLevels: ["Currency"]
        },
        sApply: "concat(aggregate(Amount,Currency),groupby((Currency),aggregate(Amount)))",
        sFollowUpApply: "groupby((Currency),aggregate(Amount))"
    }, {
        oAggregation: {
            aggregate: {
                Amount: {
                    grandTotal: true,
                    subtotals: true,
                    unit: "Currency"
                },
                Currency: {
                    grandTotal: true,
                    subtotals: true
                }
            },
            groupLevels: ["Country"]
        },
        sApply: "concat(aggregate(Amount,Currency),groupby((Country),aggregate(Amount,Currency)))",
        sFollowUpApply: "groupby((Country),aggregate(Amount,Currency))"
    }, {
        oAggregation: {
            aggregate: {
                GrossAmountInTransactionCurrency: {},
                NetAmountInTransactionCurrency: {}
            },
            group: {
                BillToParty: {},
                TextProperty: {},
                TransactionCurrency: {}
            }
        },
        sApply: "groupby((BillToParty,TextProperty,TransactionCurrency)" + ",aggregate(GrossAmountInTransactionCurrency,NetAmountInTransactionCurrency))"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: { grandTotal: true, subtotals: true }
            },
            group: {
                Region: {}
            }
        },
        mQueryOptions: {
            $skip: 0,
            $top: Infinity
        },
        sApply: "concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber)))",
        sFollowUpApply: "groupby((Region),aggregate(SalesNumber))"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: { grandTotal: true, subtotals: true }
            },
            group: {
                Region: {}
            },
            search: "blue OR green",
            subtotalsAtBottomOnly: false
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Region gt 'E'",
            $count: true,
            $filter: "SalesNumber ge 100",
            $orderby: "Region desc",
            $skip: 0,
            $top: 42
        },
        sApply: "filter(Region gt 'E')/search(blue OR green)" + "/concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)" + "/concat(aggregate($count as UI5__count),top(42)))",
        sFollowUpApply: "filter(Region gt 'E')/search(blue OR green)" + "/groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)/top(42)"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: { grandTotal: true, subtotals: true }
            },
            group: {
                Region: {}
            },
            groupLevels: [],
            subtotalsAtBottomOnly: true
        },
        mQueryOptions: {
            $count: true,
            $filter: "SalesNumber ge 100",
            $orderby: "Region desc",
            $skip: 42,
            $top: 99
        },
        sApply: "concat(aggregate(SalesNumber),groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)" + "/concat(aggregate($count as UI5__count),skip(42)/top(99)))",
        sFollowUpApply: "groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)/skip(42)/top(99)"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumberSum: { grandTotal: true, name: "SalesNumber", "with": "sum" }
            },
            group: {
                Region: {}
            }
        },
        iLevel: 1,
        sApply: "concat(aggregate(SalesNumber with sum as SalesNumberSum)" + ",groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum)))",
        sFollowUpApply: "groupby((Region),aggregate(SalesNumber with sum as SalesNumberSum))"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: { grandTotal: true }
            },
            group: {
                Region: {}
            }
        },
        iLevel: 2,
        sApply: "groupby((Region),aggregate(SalesNumber))"
    }, {
        oAggregation: {
            aggregate: {
                SalesAmount: { grandTotal: true },
                SalesNumber: { subtotals: true }
            },
            groupLevels: ["Region"]
        },
        mQueryOptions: {
            $count: true,
            $filter: "SalesNumber ge 100",
            $orderby: "Region desc",
            $skip: 0,
            $top: 10
        },
        sApply: "concat(aggregate(SalesAmount),groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)" + "/concat(aggregate($count as UI5__count),top(10)))",
        sFollowUpApply: "groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 100)/orderby(Region desc)/top(10)"
    }, {
        oAggregation: {
            aggregate: {
                Amount: { max: true }
            },
            group: {
                BillToParty: {}
            }
        },
        mQueryOptions: {
            $skip: 0,
            $top: Infinity
        },
        sApply: "groupby((BillToParty),aggregate(Amount))" + "/concat(aggregate(Amount with max as UI5max__Amount),identity)",
        sFollowUpApply: "groupby((BillToParty),aggregate(Amount))",
        mExpectedAlias2MeasureAndMethod: {
            UI5max__Amount: { measure: "Amount", method: "max" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount: { max: true, min: true }
            },
            group: {
                BillToParty: {}
            }
        },
        mQueryOptions: {
            $count: true,
            $filter: "Amount ge 100",
            $orderby: "BillToParty desc",
            $skip: 0,
            $top: 42
        },
        sApply: "groupby((BillToParty),aggregate(Amount))" + "/filter(Amount ge 100)/orderby(BillToParty desc)" + "/concat(aggregate(Amount with min as UI5min__Amount" + ",Amount with max as UI5max__Amount,$count as UI5__count),top(42))",
        sFollowUpApply: "groupby((BillToParty),aggregate(Amount))" + "/filter(Amount ge 100)/orderby(BillToParty desc)/top(42)",
        mExpectedAlias2MeasureAndMethod: {
            UI5max__Amount: { measure: "Amount", method: "max" },
            UI5min__Amount: { measure: "Amount", method: "min" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount: { max: true, min: true }
            },
            group: {
                BillToParty: {}
            }
        },
        mQueryOptions: {
            $count: true,
            $filter: "Amount ge 100",
            $orderby: "BillToParty desc",
            $skip: 42,
            $top: 99
        },
        sApply: "groupby((BillToParty),aggregate(Amount))" + "/filter(Amount ge 100)/orderby(BillToParty desc)" + "/concat(aggregate(Amount with min as UI5min__Amount" + ",Amount with max as UI5max__Amount,$count as UI5__count),skip(42)/top(99))",
        sFollowUpApply: "groupby((BillToParty),aggregate(Amount))" + "/filter(Amount ge 100)/orderby(BillToParty desc)/skip(42)/top(99)",
        mExpectedAlias2MeasureAndMethod: {
            UI5max__Amount: { measure: "Amount", method: "max" },
            UI5min__Amount: { measure: "Amount", method: "min" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount: { max: true }
            },
            group: {
                BillToParty: {}
            }
        },
        mQueryOptions: {
            $skip: 0,
            $top: 0
        },
        sApply: "groupby((BillToParty),aggregate(Amount))" + "/concat(aggregate(Amount with max as UI5max__Amount),top(0))",
        sFollowUpApply: "groupby((BillToParty),aggregate(Amount))/top(0)",
        mExpectedAlias2MeasureAndMethod: {
            UI5max__Amount: { measure: "Amount", method: "max" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount2: {
                    max: true,
                    min: true
                },
                Amount1Avg: {
                    min: true,
                    name: "Amount1",
                    "with": "average"
                }
            },
            group: {
                BillToParty: {}
            }
        },
        sApply: "groupby((BillToParty)" + ",aggregate(Amount1 with average as Amount1Avg,Amount2))" + "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg," + "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
        sFollowUpApply: "groupby((BillToParty)" + ",aggregate(Amount1 with average as Amount1Avg,Amount2))",
        mExpectedAlias2MeasureAndMethod: {
            UI5min__Amount1Avg: { measure: "Amount1Avg", method: "min" },
            UI5min__Amount2: { measure: "Amount2", method: "min" },
            UI5max__Amount2: { measure: "Amount2", method: "max" }
        }
    }, {
        oAggregation: {
            aggregate: {
                Amount1Avg: {
                    min: true,
                    name: "Amount1",
                    "with": "average"
                },
                Amount2: {
                    max: true,
                    min: true
                }
            }
        },
        sApply: "aggregate(Amount1 with average as Amount1Avg,Amount2)" + "/concat(aggregate(Amount1Avg with min as UI5min__Amount1Avg," + "Amount2 with min as UI5min__Amount2,Amount2 with max as UI5max__Amount2),identity)",
        sFollowUpApply: "aggregate(Amount1 with average as Amount1Avg,Amount2)",
        mExpectedAlias2MeasureAndMethod: {
            UI5min__Amount1Avg: { measure: "Amount1Avg", method: "min" },
            UI5min__Amount2: { measure: "Amount2", method: "min" },
            UI5max__Amount2: { measure: "Amount2", method: "max" }
        }
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: {}
            },
            group: {
                Region: {}
            }
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Name eq 'Foo'",
            $filter: "SalesNumber ge 0"
        },
        sApply: "filter(Name eq 'Foo')/groupby((Region),aggregate(SalesNumber))" + "/filter(SalesNumber ge 0)"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: {}
            },
            group: {
                Country: { additionally: ["CountryText", "Texts/Country"] },
                Region: { additionally: ["RegionText", "Texts/Region"] }
            }
        },
        sApply: "groupby((Country,Region,CountryText,Texts/Country,RegionText,Texts/Region)" + ",aggregate(SalesNumber))"
    }, {
        oAggregation: {
            aggregate: {
                SalesAmount: { grandTotal: true, unit: "Currency" }
            },
            "grandTotal like 1.84": true,
            group: {
                Country: {}
            }
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Name eq 'Foo'",
            $count: true,
            $filter: "SalesAmount gt 0",
            $orderby: "Country desc",
            $skip: 42,
            $top: 99
        },
        sApply: "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesAmount,Currency))" + "/filter(SalesAmount gt 0)/orderby(Country desc)" + "/concat(aggregate(SalesAmount,Currency),aggregate($count as UI5__count)" + ",skip(42)/top(99))",
        sFollowUpApply: "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesAmount,Currency))" + "/filter(SalesAmount gt 0)/orderby(Country desc)/skip(42)/top(99)"
    }, {
        oAggregation: {
            aggregate: {
                SalesNumber: { grandTotal: true }
            },
            "grandTotal like 1.84": true,
            group: {
                Country: {}
            }
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Name eq 'Foo'",
            $count: true,
            $filter: "SalesNumber gt 0",
            $orderby: "Country desc"
        },
        sApply: "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesNumber))" + "/filter(SalesNumber gt 0)/orderby(Country desc)" + "/concat(aggregate(SalesNumber),aggregate($count as UI5__count),identity)",
        sFollowUpApply: "filter(Name eq 'Foo')/groupby((Country),aggregate(SalesNumber))" + "/filter(SalesNumber gt 0)/orderby(Country desc)"
    }, {
        oAggregation: {
            aggregate: {
                SalesAmountSum: {
                    grandTotal: true,
                    name: "SalesAmount",
                    unit: "Currency",
                    "with": "sum"
                }
            },
            "grandTotal like 1.84": true,
            group: {
                Country: {}
            }
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Name eq 'Foo'",
            $count: true,
            $filter: "SalesAmountSum gt 0",
            $orderby: "Country desc"
        },
        sApply: "filter(Name eq 'Foo')/groupby((Country)" + ",aggregate(SalesAmount with sum as SalesAmountSum,Currency))" + "/filter(SalesAmountSum gt 0)/orderby(Country desc)/concat(" + "aggregate(SalesAmountSum with sum as UI5grand__SalesAmountSum,Currency)," + "aggregate($count as UI5__count),identity)",
        sFollowUpApply: "filter(Name eq 'Foo')/groupby((Country)" + ",aggregate(SalesAmount with sum as SalesAmountSum,Currency))" + "/filter(SalesAmountSum gt 0)/orderby(Country desc)"
    }, {
        oAggregation: {
            aggregate: {
                SalesAmountSum: {
                    grandTotal: true,
                    name: "SalesAmount",
                    unit: "Currency"
                }
            },
            "grandTotal like 1.84": true,
            group: {
                Country: {}
            }
        },
        mQueryOptions: {
            $$filterBeforeAggregate: "Name eq 'Foo'",
            $count: true,
            $filter: "SalesAmountSum gt 0",
            $orderby: "Country desc",
            $skip: 42,
            $top: 99
        },
        sApply: "filter(Name eq 'Foo')/groupby((Country)" + ",aggregate(SalesAmount as SalesAmountSum,Currency))" + "/filter(SalesAmountSum gt 0)/orderby(Country desc)/concat(" + "aggregate(SalesAmountSum as UI5grand__SalesAmountSum,Currency)," + "aggregate($count as UI5__count),skip(42)/top(99))",
        sFollowUpApply: "filter(Name eq 'Foo')/groupby((Country)" + ",aggregate(SalesAmount as SalesAmountSum,Currency))" + "/filter(SalesAmountSum gt 0)/orderby(Country desc)/skip(42)/top(99)"
    }, {
        oAggregation: {
            aggregate: {
                GrossAmount: { subtotals: true }
            },
            group: {
                LifecycleStatus: {},
                CurrencyCode: {}
            },
            groupLevels: ["LifecycleStatus", "CurrencyCode"]
        },
        mQueryOptions: {
            $$leaves: true,
            $count: true,
            $orderby: "LifecycleStatus desc",
            $top: 3
        },
        sApply: "concat(groupby((CurrencyCode,LifecycleStatus))/aggregate($count as UI5__leaves)" + ",groupby((LifecycleStatus),aggregate(GrossAmount))/orderby(LifecycleStatus desc)" + "/concat(aggregate($count as UI5__count),top(3)))",
        sFollowUpApply: "groupby((LifecycleStatus),aggregate(GrossAmount))" + "/orderby(LifecycleStatus desc)/top(3)"
    }, {
        oAggregation: {
            aggregate: {
                GrossAmount: { subtotals: true }
            },
            groupLevels: ["LifecycleStatus", "CurrencyCode"]
        },
        iLevel: 2,
        mQueryOptions: {
            $$filterBeforeAggregate: "LifecycleStatus eq 'X'",
            $$leaves: true,
            $count: true,
            $orderby: "LifecycleStatus desc",
            $top: 3
        },
        sApply: "filter(LifecycleStatus eq 'X')/groupby((CurrencyCode),aggregate(GrossAmount))" + "/orderby(LifecycleStatus desc)/concat(aggregate($count as UI5__count),top(3))",
        sFollowUpApply: "filter(LifecycleStatus eq 'X')" + "/groupby((CurrencyCode),aggregate(GrossAmount))/orderby(LifecycleStatus desc)/top(3)"
    }, {
        oAggregation: {
            aggregate: {
                GrossAmount: { grandTotal: true, subtotals: true }
            },
            groupLevels: ["LifecycleStatus", "CurrencyCode"]
        },
        mQueryOptions: {
            $$leaves: true,
            $count: true,
            $top: 3
        },
        sApply: "concat(groupby((CurrencyCode,LifecycleStatus))/aggregate($count as UI5__leaves)" + ",aggregate(GrossAmount)" + ",groupby((LifecycleStatus),aggregate(GrossAmount))" + "/concat(aggregate($count as UI5__count),top(3)))",
        sFollowUpApply: "groupby((LifecycleStatus),aggregate(GrossAmount))/top(3)"
    }].forEach(function (oFixture) {
    QUnit.test("buildApply with " + oFixture.sApply, function (assert) {
        var mAlias2MeasureAndMethod = {}, sFollowUpApply = oFixture.sFollowUpApply || oFixture.sApply, iLevel = "iLevel" in oFixture ? oFixture.iLevel : 1, sQueryOptionsJSON = JSON.stringify(oFixture.mQueryOptions), mResult;
        mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions, iLevel, false, mAlias2MeasureAndMethod);
        assert.deepEqual(mResult, { $apply: oFixture.sApply }, "sApply");
        assert.deepEqual(mAlias2MeasureAndMethod, oFixture.mExpectedAlias2MeasureAndMethod || {}, "mAlias2MeasureAndMethod");
        mAlias2MeasureAndMethod = {};
        mResult = _AggregationHelper.buildApply(oFixture.oAggregation, oFixture.mQueryOptions, iLevel, true, mAlias2MeasureAndMethod);
        assert.deepEqual(mResult, { $apply: sFollowUpApply }, "sFollowUpApply");
        assert.deepEqual(mAlias2MeasureAndMethod, {}, "mAlias2MeasureAndMethod");
        assert.strictEqual(JSON.stringify(oFixture.mQueryOptions), sQueryOptionsJSON, "original mQueryOptions unchanged");
    });
});
QUnit.test("buildApply: normalizations", function (assert) {
    var oAggregation = {};
    _AggregationHelper.buildApply(oAggregation);
    assert.deepEqual(oAggregation, {
        aggregate: {},
        group: {},
        groupLevels: []
    });
    oAggregation = {
        group: {
            AlreadyThere: {}
        },
        groupLevels: ["foo", "AlreadyThere", "bar"]
    };
    _AggregationHelper.buildApply(oAggregation);
    assert.deepEqual(oAggregation, {
        aggregate: {},
        group: {
            AlreadyThere: {},
            bar: {},
            foo: {}
        },
        groupLevels: ["foo", "AlreadyThere", "bar"]
    });
});
QUnit.test("buildApply: optional mAlias2MeasureAndMethod", function (assert) {
    assert.deepEqual(_AggregationHelper.buildApply({
        aggregate: {
            Amount: { max: true }
        },
        group: {
            BillToParty: {}
        }
    }), { $apply: "groupby((BillToParty),aggregate(Amount))" + "/concat(aggregate(Amount with max as UI5max__Amount),identity)" });
});
QUnit.test("buildApply: no $apply needed", function (assert) {
    assert.deepEqual(_AggregationHelper.buildApply({}), {});
});
[{
        oAggregation: {
            aggregate: { A: { grandTotal: true } },
            "grandTotal like 1.84": true,
            groupLevels: ["B"]
        },
        sError: "Cannot combine visual grouping with grand total"
    }, {
        oAggregation: {
            aggregate: { A: { grandTotal: true, "with": "average" } },
            "grandTotal like 1.84": true
        },
        sError: "Cannot aggregate totals with 'average'"
    }, {
        oAggregation: {
            aggregate: { A: { grandTotal: true, "with": "countdistinct" } },
            "grandTotal like 1.84": true
        },
        sError: "Cannot aggregate totals with 'countdistinct'"
    }].forEach(function (oFixture) {
    QUnit.test("buildApply: " + oFixture.sError, function (assert) {
        assert.throws(function () {
            _AggregationHelper.buildApply(oFixture.oAggregation, {}, 1);
        }, new Error(oFixture.sError));
    });
});
QUnit.test("buildApply: checkTypeof", function (assert) {
    var oAggregation = {}, oError = new Error();
    this.mock(_AggregationHelper).expects("checkTypeof").withExactArgs(sinon.match.same(oAggregation), {
        aggregate: {
            "*": {
                grandTotal: "boolean",
                max: "boolean",
                min: "boolean",
                name: "string",
                subtotals: "boolean",
                unit: "string",
                "with": "string"
            }
        },
        "grandTotal like 1.84": "boolean",
        grandTotalAtBottomOnly: "boolean",
        group: {
            "*": {
                additionally: ["string"]
            }
        },
        groupLevels: ["string"],
        search: "string",
        subtotalsAtBottomOnly: "boolean"
    }, "$$aggregation").throws(oError);
    assert.throws(function () {
        _AggregationHelper.buildApply(oAggregation);
    }, oError);
});
QUnit.test("buildApply: checkTypeof - examples", function (assert) {
    assert.throws(function () {
        _AggregationHelper.buildApply({
            subTotalsAtBottomOnly: true
        });
    }, new Error("Unsupported property: '$$aggregation/subTotalsAtBottomOnly'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            grandTotalAtBottomOnly: "top"
        });
    }, new Error("Not a boolean value for '$$aggregation/grandTotalAtBottomOnly'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            groupLevels: "The1"
        });
    }, new Error("Not an array value for '$$aggregation/groupLevels'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            group: {
                The1: { additional: ["TheOther"] }
            }
        });
    }, new Error("Unsupported property: '$$aggregation/group/The1/additional'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            group: {
                The1: { additionally: "TheOther" }
            }
        });
    }, new Error("Not an array value for '$$aggregation/group/The1/additionally'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            aggregate: {
                foo: {
                    subtotals: "top"
                }
            }
        });
    }, new Error("Not a boolean value for '$$aggregation/aggregate/foo/subtotals'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            aggregate: {
                foo: {
                    unit: ["A", "B"]
                }
            }
        });
    }, new Error("Not a string value for '$$aggregation/aggregate/foo/unit'"));
    assert.throws(function () {
        _AggregationHelper.buildApply({
            "grandTotal like 1.84": "1.84"
        });
    }, new Error("Not a boolean value for '$$aggregation/grandTotal like 1.84'"));
});
QUnit.test("checkTypeof: primitive types", function (assert) {
    _AggregationHelper.checkTypeof(false, "boolean");
    _AggregationHelper.checkTypeof(0, "number");
    _AggregationHelper.checkTypeof("", "string");
    assert.throws(function () {
        _AggregationHelper.checkTypeof(undefined, "boolean", "some/path");
    }, new Error("Not a boolean value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(undefined, "number", "some/path");
    }, new Error("Not a number value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(undefined, "string", "some/path");
    }, new Error("Not a string value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(undefined, ["boolean"], "some/path");
    }, new Error("Not an array value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(null, ["boolean"], "some/path");
    }, new Error("Not an array value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(undefined, {}, "some/path");
    }, new Error("Not an object value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof([], {}, "some/path");
    }, new Error("Not an object value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof(null, {}, "some/path");
    }, new Error("Not an object value for 'some/path'"));
    assert.throws(function () {
        _AggregationHelper.checkTypeof({ invalid: "n/a" }, {}, "some/path");
    }, new Error("Unsupported property: 'some/path/invalid'"));
});
QUnit.test("checkTypeof: array", function () {
    var oAggregationHelperMock = this.mock(_AggregationHelper), aValue = [{}, {}, {}];
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(aValue), ["~type~"], "some/path").callThrough();
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(aValue[0]), "~type~", "some/path/0");
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(aValue[1]), "~type~", "some/path/1");
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(aValue[2]), "~type~", "some/path/2");
    _AggregationHelper.checkTypeof(aValue, ["~type~"], "some/path");
});
QUnit.test("checkTypeof: object", function () {
    var oAggregationHelperMock = this.mock(_AggregationHelper), oType = {
        bar: "~bar~",
        foo: "~foo~",
        ignored: "n/a"
    }, oValue = {
        bar: {},
        foo: {}
    };
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(oValue), sinon.match.same(oType), "some/path").callThrough();
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(oValue.bar), "~bar~", "some/path/bar");
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(oValue.foo), "~foo~", "some/path/foo");
    _AggregationHelper.checkTypeof(oValue, oType, "some/path");
});
QUnit.test("checkTypeof: map", function () {
    var oAggregationHelperMock = this.mock(_AggregationHelper), oType = {
        "*": "~type~"
    }, mValue = {
        bar: {},
        foo: {}
    };
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(mValue), sinon.match.same(oType), "some/path").callThrough();
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(mValue.bar), "~type~", "some/path/bar");
    oAggregationHelperMock.expects("checkTypeof").withExactArgs(sinon.match.same(mValue.foo), "~type~", "some/path/foo");
    _AggregationHelper.checkTypeof(mValue, oType, "some/path");
});
QUnit.test("hasGrandTotal", function (assert) {
    assert.strictEqual(_AggregationHelper.hasGrandTotal({}), false);
    assert.strictEqual(_AggregationHelper.hasGrandTotal({ A: {} }), false);
    assert.strictEqual(_AggregationHelper.hasGrandTotal({ B: { grandTotal: true } }), true);
    assert.strictEqual(_AggregationHelper.hasGrandTotal({ A: {}, B: { grandTotal: true } }), true);
});
QUnit.test("splitFilter: oAggregation or oAggregation.aggregate empty", function (assert) {
    var oFilter = {};
    assert.deepEqual(_AggregationHelper.splitFilter(oFilter), [oFilter]);
    assert.deepEqual(_AggregationHelper.splitFilter(oFilter, null), [oFilter]);
    assert.deepEqual(_AggregationHelper.splitFilter(oFilter, {}), [oFilter]);
});
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
        filter: f("a1"),
        result: [f("a1"), undefined]
    }, {
        filter: f("b"),
        result: [undefined, f("b")]
    }, {
        filter: or(f("b1"), f("b2")),
        result: [undefined, or(f("b1"), f("b2"))]
    }, {
        filter: or(f("a1"), f("b")),
        result: [or(f("a1"), f("b")), undefined]
    }, {
        filter: and(f("a1"), f("a2")),
        result: [and(f("a1"), f("a2")), undefined]
    }, {
        filter: and(f("b"), f("a1")),
        result: [f("a1"), f("b")]
    }, {
        filter: and(f("a1"), f("a2"), f("b")),
        result: [and(f("a1"), f("a2")), f("b")]
    }, {
        filter: and(f("a2"), f("b1"), f("b2")),
        result: [f("a2"), and(f("b1"), f("b2"))]
    }, {
        filter: and(f("a1"), and(f("a2"), f("b"))),
        result: [and(f("a1"), f("a2")), f("b")]
    }].forEach(function (oFixture, i) {
    QUnit.test("splitFilter: " + i, function (assert) {
        assert.deepEqual(_AggregationHelper.splitFilter(oFixture.filter, { aggregate: { a1: {}, a2: {} } }), oFixture.result);
    });
});
QUnit.test("hasMinOrMax", function (assert) {
    assert.strictEqual(_AggregationHelper.hasMinOrMax({}), false);
    assert.strictEqual(_AggregationHelper.hasMinOrMax({ A: {} }), false);
    assert.strictEqual(_AggregationHelper.hasMinOrMax({ B: { min: true } }), true);
    assert.strictEqual(_AggregationHelper.hasMinOrMax({ B: { max: true } }), true);
    assert.strictEqual(_AggregationHelper.hasMinOrMax({ A: {}, B: { max: true } }), true);
});
QUnit.test("isAffected", function (assert) {
    var oAggregation = {
        aggregate: {
            measure1: {},
            "complex1/measure2": {},
            alias: { name: "measure3" }
        },
        group: {
            dimension1: {},
            "complex2/dimension2": {}
        },
        groupLevels: ["level1", "complex3/level2"]
    };
    assert.notOk(_AggregationHelper.isAffected(oAggregation, [], ["foo", "bar", "meas", "dim", "lev"]));
    ["", "*", "measure1", "measure1/*", "measure3", "dimension1", "dimension1/property1", "dimension1/*", "level1", "complex1", "complex1/*", "complex2", "complex2/*", "complex3", "complex3/*"].forEach(function (sSideEffectPath) {
        assert.ok(_AggregationHelper.isAffected(oAggregation, [], [sSideEffectPath]), sSideEffectPath);
        assert.ok(_AggregationHelper.isAffected(oAggregation, [], ["foo", sSideEffectPath, "bar"]), sSideEffectPath);
    });
    assert.notOk(_AggregationHelper.isAffected(oAggregation, [
        new Filter("bar", FilterOperator.EQ, "baz")
    ], ["foo"]));
    assert.ok(_AggregationHelper.isAffected(oAggregation, [
        new Filter("bar", FilterOperator.EQ, "baz")
    ], ["foo", "bar"]));
    assert.ok(_AggregationHelper.isAffected(oAggregation, [
        new Filter("foo/bar", FilterOperator.EQ, "baz")
    ], ["foo"]));
    assert.notOk(_AggregationHelper.isAffected(oAggregation, [
        new Filter("foobar", FilterOperator.EQ, "baz")
    ], ["foo"]));
    assert.ok(_AggregationHelper.isAffected(oAggregation, [
        new Filter("foo/bar/baz", FilterOperator.EQ, "qux")
    ], ["foo/*"]));
    assert.ok(_AggregationHelper.isAffected(oAggregation, [
        new Filter("foo", FilterOperator.EQ, "baz"),
        new Filter("bar", FilterOperator.EQ, "baz")
    ], ["bar"]));
    assert.ok(_AggregationHelper.isAffected(oAggregation, [
        new Filter({ filters: [
                new Filter("foo", FilterOperator.EQ, "baz"),
                new Filter("bar", FilterOperator.EQ, "baz")
            ] })
    ], ["foo"]));
});
QUnit.test("createPlaceholder", function (assert) {
    var oParentCache = {}, oPlaceholder = _AggregationHelper.createPlaceholder(3, 5, oParentCache);
    assert.strictEqual(oPlaceholder["@$ui5.node.level"], 3);
    assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "index"), 5);
    assert.strictEqual(_Helper.getPrivateAnnotation(oPlaceholder, "parent"), oParentCache);
});
[false, true].forEach(function (bSubtotalsAtBottomOnly) {
    QUnit.test("extractSubtotals: at bottom only = " + bSubtotalsAtBottomOnly, function (assert) {
        var oAggregation = {
            aggregate: {
                A: { subtotals: true },
                B: { subtotals: true, unit: "U" },
                C: { name: "n/a", subtotals: true },
                NA: {},
                XX: { unit: "n/a" }
            },
            groupLevels: ["D"]
        }, oCollapsed = {}, oExpanded = bSubtotalsAtBottomOnly ? {} : null, oGroupNode = {
            "@$ui5.node.level": 1,
            A: "a",
            B: null,
            C: "c",
            "C@odata.type": "#Decimal",
            D: "d",
            U: "u"
        }, sGroupNodeJSON = JSON.stringify(oGroupNode);
        _AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed, oExpanded);
        assert.deepEqual(oCollapsed, {
            A: "a",
            B: null,
            C: "c",
            U: "u"
        });
        if (oExpanded) {
            assert.deepEqual(oExpanded, {
                A: null,
                B: null,
                C: null,
                U: null
            });
        }
        assert.strictEqual(JSON.stringify(oGroupNode), sGroupNodeJSON, "unchanged");
    });
});
QUnit.test("extractSubtotals: unit used as group level", function (assert) {
    var oAggregation = {
        aggregate: {
            A: { subtotals: true, unit: "U" },
            B: { subtotals: true, unit: "V" },
            C: { subtotals: true, unit: "W" }
        },
        groupLevels: ["U", "V", "W"]
    }, oCollapsed = {}, oExpanded = {}, oGroupNode = {
        "@$ui5.node.level": 2,
        A: "a",
        B: null,
        C: "c",
        "C@odata.type": "#Decimal",
        D: "d",
        U: "u",
        V: "v",
        W: "w"
    }, sGroupNodeJSON = JSON.stringify(oGroupNode);
    _AggregationHelper.extractSubtotals(oAggregation, oGroupNode, oCollapsed, oExpanded);
    assert.deepEqual(oCollapsed, {
        A: "a",
        B: null,
        C: "c",
        U: "u",
        V: "v",
        W: "w"
    });
    assert.deepEqual(oExpanded, {
        A: null,
        B: null,
        C: null,
        W: null
    });
    assert.strictEqual(JSON.stringify(oGroupNode), sGroupNodeJSON, "unchanged");
});
QUnit.test("getFilteredOrderby", function (assert) {
    function testWithLevels(sOrderby, aExpected) {
        var oAggregation = {
            aggregate: {
                SalesAmount: { subtotals: true, unit: "Currency" },
                SalesNumber: { unit: "One" }
            },
            group: {
                Country: {},
                Region: { additionally: ["RegionText", "Texts/Region"] },
                Segment: { additionally: ["SegmentText", "Texts/Segment"] }
            },
            groupLevels: ["Country", "Region"]
        };
        aExpected.forEach(function (sExpected, iLevel) {
            assert.strictEqual(_AggregationHelper.getFilteredOrderby(sOrderby, oAggregation, iLevel), sExpected, sOrderby + ", " + iLevel);
        });
    }
    testWithLevels("Currency,One,NotApplicable", ["Currency,One", "Currency", "Currency", "Currency,One"]);
    testWithLevels("SalesAmount desc,SalesNumber,Country desc,Region,Segment asc", [
        "SalesAmount desc,SalesNumber,Country desc,Region,Segment asc",
        "SalesAmount desc,Country desc",
        "SalesAmount desc,Region",
        "SalesAmount desc,SalesNumber,Segment asc"
    ]);
    testWithLevels("Country,RegionText desc,Texts/Region asc,SegmentText desc,Texts/Segment asc", [
        "Country,RegionText desc,Texts/Region asc,SegmentText desc,Texts/Segment asc",
        "Country",
        "RegionText desc,Texts/Region asc",
        "SegmentText desc,Texts/Segment asc"
    ]);
    [0, 1].forEach(function (iLevel) {
        var oAggregation = {
            aggregate: {
                Measure: { unit: "UnitOfMeasure" }
            },
            group: {
                Dimension: { additionally: ["Texts/Dimension"] }
            },
            groupLevels: []
        }, mInput2Output = {
            "Dimension %20desc%2CFoo asc": "Dimension %20desc",
            "Dimension\tdesc,Foo asc": "Dimension\tdesc",
            "Measure desc%2cDimension": "Measure desc,Dimension",
            "NavigationProperty/$count": "NavigationProperty/$count",
            "Texts/Dimension": "Texts/Dimension",
            "UnitOfMeasure desc": "UnitOfMeasure desc"
        };
        Object.keys(mInput2Output).forEach(function (sOrderby) {
            assert.strictEqual(_AggregationHelper.getFilteredOrderby(sOrderby, oAggregation, iLevel), mInput2Output[sOrderby], sOrderby + ", " + iLevel);
        });
        assert.strictEqual(_AggregationHelper.getFilteredOrderby(undefined, oAggregation, iLevel), undefined);
    });
});
QUnit.test("setAnnotations", function (assert) {
    var oElement = {
        group: "~group~",
        measure: "~measure~"
    };
    _AggregationHelper.setAnnotations(oElement, "~bIsExpanded~", "~bIsTotal~", "~iLevel~");
    assert.deepEqual(oElement, {
        "@$ui5.node.isExpanded": "~bIsExpanded~",
        "@$ui5.node.isTotal": "~bIsTotal~",
        "@$ui5.node.level": "~iLevel~",
        group: "~group~",
        measure: "~measure~"
    });
    this.mock(_Helper).expects("createMissing").withExactArgs(sinon.match.same(oElement), ["Texts", "A"]);
    _AggregationHelper.setAnnotations(oElement, "~bIsExpanded~", "~bIsTotal~", "~iLevel~", ["foo", "bar", "group", "measure", ["Texts", "A"]]);
    assert.deepEqual(oElement, {
        "@$ui5.node.isExpanded": "~bIsExpanded~",
        "@$ui5.node.isTotal": "~bIsTotal~",
        "@$ui5.node.level": "~iLevel~",
        bar: null,
        foo: null,
        group: "~group~",
        measure: "~measure~"
    });
});
QUnit.test("getAllProperties", function (assert) {
    var oAggregation = {
        aggregate: {
            x: {},
            y: { unit: "UnitY" }
        },
        group: {
            c: {},
            a: { additionally: ["TextA", "Texts/A"] },
            b: {}
        }
    };
    assert.deepEqual(_AggregationHelper.getAllProperties(oAggregation), ["x", "y", "c", "a", "b", "UnitY", "TextA", ["Texts", "A"]]);
});
[undefined, false, true].forEach(function (bSubtotalsAtBottomOnly, i) {
    var sTitle = "getOrCreateExpandedObject: subtotalsAtBottomOnly = " + bSubtotalsAtBottomOnly;
    QUnit.test(sTitle, function (assert) {
        var oAggregation = { subtotalsAtBottomOnly: bSubtotalsAtBottomOnly }, oCollapsed, oExpanded, oExpectation, oGroupNode = {};
        oExpectation = this.mock(_AggregationHelper).expects("extractSubtotals").exactly(i ? 1 : 0).withExactArgs(sinon.match.same(oAggregation), sinon.match.same(oGroupNode), sinon.match.object, i === 2 ? sinon.match.object : null);
        oExpanded = _AggregationHelper.getOrCreateExpandedObject(oAggregation, oGroupNode);
        assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "expanded"), oExpanded);
        assert.deepEqual(oExpanded, { "@$ui5.node.isExpanded": true });
        oCollapsed = _Helper.getPrivateAnnotation(oGroupNode, "collapsed");
        assert.deepEqual(oCollapsed, { "@$ui5.node.isExpanded": false });
        if (i) {
            assert.strictEqual(oExpectation.args[0][2], oCollapsed);
        }
        if (i === 2) {
            assert.strictEqual(oExpectation.args[0][3], oExpanded);
        }
        assert.strictEqual(_AggregationHelper.getOrCreateExpandedObject(oAggregation, oGroupNode), oExpanded);
        assert.strictEqual(_Helper.getPrivateAnnotation(oGroupNode, "collapsed"), oCollapsed);
    });
});
[undefined, "", "sFilteredOrderby"].forEach(function (sFilteredOrderby) {
    var sTitle = "filterOrderby: sFilteredOrderby = " + sFilteredOrderby;
    QUnit.test(sTitle, function (assert) {
        var oAggregation = {
            aggregate: {},
            group: {},
            groupLevels: ["a"]
        }, mQueryOptions = {
            $orderby: "~$orderby~"
        };
        this.mock(_AggregationHelper).expects("getFilteredOrderby").withExactArgs("~$orderby~", sinon.match.same(oAggregation), "~iLevel~").returns(sFilteredOrderby);
        this.mock(Object).expects("assign").withExactArgs({}, sinon.match.same(mQueryOptions)).returns({
            $orderby: "n/a",
            foo: "bar"
        });
        assert.deepEqual(_AggregationHelper.filterOrderby(mQueryOptions, oAggregation, "~iLevel~"), sFilteredOrderby ? {
            $orderby: "sFilteredOrderby",
            foo: "bar"
        } : {
            foo: "bar"
        });
    });
});
QUnit.test("removeUI5grand__", function (assert) {
    var oGrandTotal = {
        foo: "bar",
        UI5grand__SalesAmountSum: 123,
        "UI5grand__SalesAmountSum@odata.type": "#Decimal"
    };
    _AggregationHelper.removeUI5grand__(oGrandTotal);
    assert.deepEqual(oGrandTotal, {
        foo: "bar",
        SalesAmountSum: 123,
        "SalesAmountSum@odata.type": "#Decimal"
    });
});