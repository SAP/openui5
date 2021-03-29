/*global QUnit */

sap.ui.define([
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/table/utils/TableUtils"
], function(V4Aggregation, TableUtils) {
	"use strict";

	TableUtils.getResourceBundle();

	QUnit.module("Tests on AggregateInfo", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				name: "Property1",
				path: "prop1",
				key: true
			}, {
				name: "Property2",
				path: "prop2",
				key: true,
				groupable: true
			}, {
				name: "Property3",
				path: "prop3",
				groupable: true,
				text: "Property4"
			}, {
				name: "Property4",
				path: "prop4",
				groupable: true
			}, {
				name: "Property5",
				path: "prop5",
				extension: {
					defaultAggregate: {}
				}
			}, {
				name: "Property6",
				path: "prop6",
				extension: {
					defaultAggregate: {}
				},
				unit: "Property4"
			}, {
				name: "Property7",
				path: "prop7",
				extension: {
					defaultAggregate: {}
				},
				groupable: true
			}, {
				name: "Property8",
				path: "prop8",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: ["Property1", "Property3", "Property4"]
					}
				}
			}, {
				name: "Property9",
				path: "prop9",
				unit: "Property3",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: []
					}
				}
			}, {
				name: "Property10",
				path: "prop10",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: ["Property4", "Property5"]
					}
				}
			}]);
		}
	});

	var aTestData = [{
		label: "Empty aggregation info",
		aggregationInfo: {},
		expectedGroup: undefined,
		expectedAggregate: undefined,
		expectedGroupLevels: undefined
	}, {
		label: "null aggregation info",
		aggregationInfo: null,
		expectedGroup: undefined,
		expectedAggregate: undefined,
		expectedGroupLevels: undefined
	}, {
		label: "1 grouped property",
		aggregationInfo: {
			visible: ["Property3"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {additionally: ["prop4"]}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "2 grouped properties",
		aggregationInfo: {
			visible: ["Property3", "Property4"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {additionally: ["prop4"]}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "Only grouped keys",
		aggregationInfo: {
			visible: ["Property2"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "1 aggregated property",
		aggregationInfo: {
			visible: ["Property5"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop5: {}},
		expectedGroupLevels: []
	}, {
		label: "2 aggregated property",
		aggregationInfo: {
			visible: ["Property5", "Property6"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop5: {}, prop6: {unit: "prop4"}},
		expectedGroupLevels: []
	}, {
		label: "2 aggregated property with totals",
		aggregationInfo: {
			visible: ["Property3", "Property5", "Property6"],
			subtotals: ["Property5", "Property6"],
			grandTotal: ["Property6"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {additionally: []}},
		expectedAggregate: {prop5: {grandTotal: false, subtotals: true}, prop6: {grandTotal: true, subtotals: true, unit: "prop4"}},
		expectedGroupLevels: []
	}, {
		label: "1 property aggregated and grouped",
		aggregationInfo: {
			visible: ["Property7"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop7: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "Aggregated property with context-defining properties",
		aggregationInfo: {
			visible: ["Property8", "Property10"],
			groupLevels: []
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {}, prop4: {}, prop5: {}},
		expectedAggregate: {prop8: {}, prop10: {}},
		expectedGroupLevels: []
	}, {
		label: "Aggregated property with unit and empty context-defining properties",
		aggregationInfo: {
			visible: ["Property9"],
			groupLevels: []
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop9: {unit: "prop3"}},
		expectedGroupLevels: []
	}, {
		label: "Group levels",
		aggregationInfo: {
			visible: ["Property3", "Property7"],
			groupLevels: ["Property7", "Property3"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {additionally: ["prop4"]}, prop7: {}},
		expectedAggregate: {},
		expectedGroupLevels: ["prop7", "prop3"]
	}, {
		label: "Totals for an aggregatable property that is also groupable",
		aggregationInfo: {
			visible: ["Property2", "Property7"],
			subtotals: ["Property7"],
			grandTotal: ["Property7"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop7: {grandTotal: true, subtotals: true}},
		expectedGroupLevels: []
	}, {
		label: "Group level that isn't visible",
		aggregationInfo: {
			visible: ["Property7"],
			groupLevels: ["Property3"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop7: {}, prop3: {additionally: ["prop4"]}},
		expectedAggregate: {},
		expectedGroupLevels: ["prop3"]
	}];

	aTestData.forEach(function(oData) {
		QUnit.test(oData.label, function(assert) {
			this.oPlugin.setAggregationInfo(oData.aggregationInfo);
			var mAggregationInfo = this.oPlugin.getAggregationInfo();
			assert.equal(JSON.stringify(mAggregationInfo.group), JSON.stringify(oData.expectedGroup), "check grouped properties");
			assert.equal(JSON.stringify(mAggregationInfo.aggregate), JSON.stringify(oData.expectedAggregate), "check aggregated properties");
			assert.equal(JSON.stringify(mAggregationInfo.groupLevels), JSON.stringify(oData.expectedGroupLevels), "check group levels");
		});
	});

	["Defaults", {
		totalSummaryOnTop: "On",
		totalSummaryOnBottom: "On"
	}, {
		totalSummaryOnTop: "Fixed",
		totalSummaryOnBottom: "Off"
	}].forEach(function(mTestData) {
		QUnit.test("Row count constraints - " + JSON.stringify(mTestData), function(assert) {
			var oSetRowCountConstraints = this.spy(this.oPlugin, "setRowCountConstraints");

			this.oPlugin.setTotalSummaryOnTop(mTestData.totalSummaryOnTop);
			this.oPlugin.setTotalSummaryOnBottom(mTestData.totalSummaryOnBottom);
			this.stub(this.oPlugin, "getTableBinding").returns({setAggregation: function(){}});

			var bFixedTopEnabled = this.oPlugin.getTotalSummaryOnTop() === "Fixed";
			var bFixedBottomEnabled = this.oPlugin.getTotalSummaryOnBottom() === "Fixed";

			this.oPlugin.setAggregationInfo({
				visible: ["Property5"],
				subtotals: ["Property5"],
				grandTotal: ["Property5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal + Subtotals");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Property5"],
				grandTotal: ["Property5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Property5"],
				subtotals: ["Property5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: false,
				fixedBottom: false
			}), "Subtotals");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Property5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: false,
				fixedBottom: false
			}), "No totals");
		});
	});

	QUnit.module("Tests on row state calculation", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				name: "Property1",
				path: "prop1",
				label: "Property 1",
				text: "Property2"
			}, {
				name: "Property2",
				path: "prop2",
				label: "Property 2"
			}, {
				name: "Property3",
				path: "prop3",
				label: "Property 3",
				groupingDetails: {
					formatter: function(oContext, sPropertyName) {return "Property3 > " + sPropertyName;}
				}
			}]);

			this.oPlugin.setAggregationInfo({
				visible: ["Property1", "Property2", "Property3"],
				groupLevels: ["Property1", "Property2", "Property3"]
			});

			this.oGroupHeaderFormatter = this.stub().callsFake(function(oContext, sProperty) {
				if (sProperty === "Property3") {
					return "Property 3 > prop3_value";
				}
			});
			this.oPlugin.setGroupHeaderFormatter(this.oGroupHeaderFormatter);
		}
	});

	var aTestData2 = [{
		label: "Leaf row",
		context: {},
		expectedType: undefined,
		expectedLevel: undefined,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Summary row (Grand total)",
		context: {"@$ui5.node.isTotal": true, "@$ui5.node.level": 0},
		expectedType: "Summary",
		expectedLevel: 1,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Summary row (Subtotal)",
		context: {"@$ui5.node.isTotal": true, "@$ui5.node.level": 1},
		expectedType: "Summary",
		expectedLevel: 2,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Group header row - default format for a property with a text property",
		context: {"@$ui5.node.level": 1, "@$ui5.node.isExpanded": false},
		expectedType: "GroupHeader",
		expectedLevel: 1,
		expectedTitle: TableUtils.getResourceText("TBL_ROW_GROUP_TITLE_FULL", ["Property 1", "prop1_value", "prop2_value"]),
		expectedTitleProperty: "Property1",
		expectedExpandable: true,
		expectedExpanded: false
	}, {
		label: "Group header row - default format for a property without a text property",
		context: {"@$ui5.node.level": 2, "@$ui5.node.isExpanded": false, "@$ui5.node.isTotal": true},
		expectedType: "GroupHeader",
		expectedLevel: 2,
		expectedTitle: TableUtils.getResourceText("TBL_ROW_GROUP_TITLE", ["Property 2", "prop2_value"]),
		expectedTitleProperty: "Property2",
		expectedExpandable: true,
		expectedExpanded: false
	}, {
		label: "Group header row (expanded) - default format for a property without a text property",
		context: {"@$ui5.node.level": 2, "@$ui5.node.isExpanded": true},
		expectedType: "GroupHeader",
		expectedLevel: 2,
		expectedTitle: TableUtils.getResourceText("TBL_ROW_GROUP_TITLE", ["Property 2", "prop2_value"]),
		expectedTitleProperty: "Property2",
		expectedExpandable: true,
		expectedExpanded: true
	}, {
		label: "Group header row - custom format",
		context: {"@$ui5.node.level": 3, "@$ui5.node.isExpanded": false},
		expectedType: "GroupHeader",
		expectedLevel: 3,
		expectedTitle: "Property 3 > prop3_value",
		expectedTitleProperty: "Property3",
		expectedExpandable: true,
		expectedExpanded: false
	}, {
		label: "Group header row (expanded) - custom format",
		context: {"@$ui5.node.level": 3, "@$ui5.node.isExpanded": true},
		expectedType: "GroupHeader",
		expectedLevel: 3,
		expectedTitle: "Property 3 > prop3_value",
		expectedTitleProperty: "Property3",
		expectedExpandable: true,
		expectedExpanded: true
	}];

	aTestData2.forEach(function(oData) {
		QUnit.test(oData.label, function(assert) {
			var oContext = {
				getValue: function(sKey) {
					return oData.context[sKey];
				},
				getProperty: function(sPath) {
					return sPath + "_value";
				}
			};

			var oState = {context: oContext, Type: {Summary: "Summary", GroupHeader: "GroupHeader"}};
			this.oPlugin.updateRowState(oState);
			assert.equal(oState.type, oData.expectedType, "check row type: " + oData.expectedType);
			assert.equal(oState.level, oData.expectedLevel, "check row level: " + oData.expectedLevel);
			assert.equal(oState.expandable, oData.expectedExpandable, "check row expandable: " + oData.expectedExpandable);
			assert.equal(oState.expanded, oData.expectedExpanded, "check row expanded: " + oData.expectedExpanded);

			assert.equal(oState.title, oData.expectedTitle, "check row title: '" + oData.expectedTitle + "'");
			if (oData.expectedTitle !== undefined) {
				assert.ok(this.oGroupHeaderFormatter.calledOnceWithExactly(oContext, oData.expectedTitleProperty), "Calling the groupHeaderFormatter");
			} else {
				assert.equal(this.oGroupHeaderFormatter.callCount, 0, "Calling the groupHeaderFormatter");
			}
		});
	});

	QUnit.test("Invalid return value of the group header formatter", function(assert) {
		var oContextData = {"@$ui5.node.level": 1, "@$ui5.node.isExpanded": false};
		var oContext = {
			getValue: function(sKey) {
				return oContextData[sKey];
			},
			getProperty: function(sPath) {}
		};
		var oState = {context: oContext, Type: {Summary: "Summary", GroupHeader: "GroupHeader"}};
		var oExpectedError = new Error("The group header title must be a string or undefined");
		var that = this;

		this.oPlugin.setGroupHeaderFormatter(function() {
			return null;
		});
		assert.throws(function() {
			that.oPlugin.updateRowState(oState);
		}, oExpectedError, "'null'");

		this.oPlugin.setGroupHeaderFormatter(function() {
			return {};
		});
		assert.throws(function() {
			that.oPlugin.updateRowState(oState);
		}, oExpectedError, "object");

		this.oPlugin.setGroupHeaderFormatter(function() {
			return true;
		});
		assert.throws(function() {
			that.oPlugin.updateRowState(oState);
		}, oExpectedError, "boolean");
	});
});