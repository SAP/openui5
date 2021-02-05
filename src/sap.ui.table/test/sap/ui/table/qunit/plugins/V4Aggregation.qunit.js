/*global QUnit */

sap.ui.define([
	"sap/ui/table/plugins/V4Aggregation"
], function(V4Aggregation) {
	"use strict";

	QUnit.module("Tests on AggregateInfo", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				name: "Info1",
				path: "prop1",
				key: true
			}, {
				name: "Info2",
				path: "prop2",
				key: true,
				groupable: true
			}, {
				name: "Info3",
				path: "prop3",
				groupable: true
			}, {
				name: "Info4",
				path: "prop4",
				groupable: true
			}, {
				name: "Info5",
				path: "prop5",
				extension: {
					defaultAggregate: {}
				}
			}, {
				name: "Info6",
				path: "prop6",
				extension: {
					defaultAggregate: {}
				},
				unit: "Info3"
			}, {
				name: "Info7",
				path: "prop7",
				extension: {
					defaultAggregate: {}
				},
				groupable: true
			}, {
				name: "Info8",
				path: "prop8",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: ["Info1", "Info3", "Info4"]
					}
				}
			}, {
				name: "Info9",
				path: "prop9",
				unit: "Info3",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: []
					}
				}
			}, {
				name: "Info10",
				path: "prop10",
				extension: {
					defaultAggregate: {
						contextDefiningProperties: ["Info4", "Info5"]
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
			visible: ["Info3"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "2 grouped properties",
		aggregationInfo: {
			visible: ["Info3", "Info4"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {}, prop4: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "Only grouped keys",
		aggregationInfo: {
			visible: ["Info2"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "1 aggregated property",
		aggregationInfo: {
			visible: ["Info5"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop5: {}},
		expectedGroupLevels: []
	}, {
		label: "2 aggregated property",
		aggregationInfo: {
			visible: ["Info5", "Info6"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop5: {}, prop6: {unit: "prop3"}},
		expectedGroupLevels: []
	}, {
		label: "2 aggregated property with totals",
		aggregationInfo: {
			visible: ["Info5", "Info6"],
			subtotals: ["Info5", "Info6"],
			grandTotal: ["Info6"]
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop5: {grandTotal: false, subtotals: true}, prop6: {grandTotal: true, subtotals: true, unit: "prop3"}},
		expectedGroupLevels: []
	}, {
		label: "1 property aggregated and grouped",
		aggregationInfo: {
			visible: ["Info7"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop7: {}},
		expectedAggregate: {},
		expectedGroupLevels: []
	}, {
		label: "Aggregated property with context-defining properties",
		aggregationInfo: {
			visible: ["Info8"],
			groupLevels: []
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {}, prop4: {}},
		expectedAggregate: {prop8: {}},
		expectedGroupLevels: []
	}, {
		label: "Aggregated property with unit and empty context-defining properties",
		aggregationInfo: {
			visible: ["Info9"],
			groupLevels: []
		},
		expectedGroup: {prop1: {}, prop2: {}},
		expectedAggregate: {prop9: {unit: "prop3"}},
		expectedGroupLevels: []
	}, {
		label: "Aggregated property - non-groupable context-defining proporties are not kept",
		aggregationInfo: {
			visible: ["Info10"],
			groupLevels: []
		},
		expectedGroup: {prop1: {}, prop2: {}, prop4: {}},
		expectedAggregate: {prop10: {}},
		expectedGroupLevels: []
	}, {
		label: "Group levels",
		aggregationInfo: {
			visible: ["Info3", "Info7"],
			groupLevels: ["Info7", "Info3"]
		},
		expectedGroup: {prop1: {}, prop2: {}, prop3: {}, prop7: {}},
		expectedAggregate: {},
		expectedGroupLevels: ["prop7", "prop3"]
	}];

	aTestData.forEach(function(oData) {
		QUnit.test(oData.label, function(assert) {
			this.oPlugin.setAggregationInfo(oData.aggregationInfo);
			assert.equal(JSON.stringify(this.oPlugin._mGroup), JSON.stringify(oData.expectedGroup), "check grouped properties");
			assert.equal(JSON.stringify(this.oPlugin._mAggregate), JSON.stringify(oData.expectedAggregate), "check aggregated properties");
			assert.equal(JSON.stringify(this.oPlugin._aGroupLevels), JSON.stringify(oData.expectedGroupLevels), "check group levels");
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
				visible: ["Info5"],
				subtotals: ["Info5"],
				grandTotal: ["Info5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal + Subtotals");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Info5"],
				grandTotal: ["Info5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Info5"],
				subtotals: ["Info5"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: false,
				fixedBottom: false
			}), "Subtotals");

			oSetRowCountConstraints.reset();
			this.oPlugin.setAggregationInfo({
				visible: ["Info5"]
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

			this.oPlugin.setPropertyInfos([
				{
					name: "Info1",
					path: "prop1",
					key: true
				},
				{
					name: "Info2",
					path: "prop2",
					groupable: true
				},
				{
					name: "Info3",
					path: "prop3",
					groupable: true,
					groupingDetails: {
						formatter: function(oContext, sPropertyName) {return "Info3 > " +  sPropertyName;}
					}
				}
			]);

			this.oPlugin.setAggregationInfo({
				visible: ["Info1", "Info2", "Info3"],
				groupLevels: ["Info2", "Info3"]
			});
		}
	});

	var aTestData2 = [{
		label: "Leaf row",
		context: {},
		expectedType: undefined,
		expectedLevel: undefined,
		expectedTitle: undefined,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Summary row (Grand total)",
		context: {"@$ui5.node.isTotal": true, "@$ui5.node.level": 0},
		expectedType: "Summary",
		expectedLevel: 0,
		expectedTitle: undefined,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Summary row (Subtotal)",
		context: {"@$ui5.node.isTotal": true, "@$ui5.node.level": 1},
		expectedType: "Summary",
		expectedLevel: 1,
		expectedTitle: undefined,
		expectedExpandable: false,
		expectedExpanded: false
	}, {
		label: "Group header row - default format",
		context: {"@$ui5.node.level": 1, "@$ui5.node.isExpanded": false, "@$ui5.node.isTotal": true},
		expectedType: "GroupHeader",
		expectedLevel: 1,
		expectedTitle: "XXX",
		expectedExpandable: true,
		expectedExpanded: false
	}, {
		label: "Group header row (expanded) - default format",
		context: {"@$ui5.node.level": 1, "@$ui5.node.isExpanded": true},
		expectedType: "GroupHeader",
		expectedLevel: 1,
		expectedTitle: "XXX",
		expectedExpandable: true,
		expectedExpanded: true
	}, {
		label: "Group header row - custom format",
		context: {"@$ui5.node.level": 2, "@$ui5.node.isExpanded": false},
		expectedType: "GroupHeader",
		expectedLevel: 2,
		expectedTitle: "Info3 > prop3",
		expectedExpandable: true,
		expectedExpanded: false
	}, {
		label: "Group header row (expanded) - custom format",
		context: {"@$ui5.node.level": 2, "@$ui5.node.isExpanded": true},
		expectedType: "GroupHeader",
		expectedLevel: 2,
		expectedTitle: "Info3 > prop3",
		expectedExpandable: true,
		expectedExpanded: true
	}];

	aTestData2.forEach(function(oData) {
		QUnit.test(oData.label, function(assert) {
			var oContext = {
				getValue: function(sKey) {
					return oData.context[sKey];
				},
				getProperty: function() {
					return "XXX";
				},
				getPath: function() {
					return "";
				},
				getModel: function() {
					return {
						getMetaModel: function() {
							return {
								getMetaPath: function() {
									return "";
								},
								getUI5Type: function() {
									return new sap.ui.model.odata.type.String();
								}
							};
						}
					};
				}
			};

			var oState = {context: oContext, Type: {Summary: "Summary", GroupHeader: "GroupHeader"}};
			this.oPlugin.updateRowState(oState);
			assert.equal(oState.type, oData.expectedType, "check row type: " + oData.expectedType);
			assert.equal(oState.level, oData.expectedLevel, "check row level: " + oData.expectedLevel);
			assert.equal(oState.title, oData.expectedTitle, "check row title: " + oData.expectedTitle);
			assert.equal(oState.expandable, oData.expectedExpandable, "check row expandable: " + oData.expectedExpandable);
			assert.equal(oState.expanded, oData.expectedExpanded, "check row expanded: " + oData.expectedExpanded);
		});
	});
});