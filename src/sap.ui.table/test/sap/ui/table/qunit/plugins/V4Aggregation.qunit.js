/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/plugins/V4Aggregation",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	V4Aggregation,
	TableUtils
) {
	"use strict";

	TableUtils.getResourceBundle();

	QUnit.module("Aggregation info", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				key: "Property1",
				path: "prop1",
				isKey: true
			}, {
				key: "Property2",
				path: "prop2",
				isKey: true,
				groupable: true
			}, {
				key: "Property3",
				path: "prop3",
				groupable: true,
				text: "Property4"
			}, {
				key: "Property4",
				path: "prop4",
				groupable: true
			}, {
				key: "Property5",
				path: "prop5",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {}
				}
			}, {
				key: "Property6",
				path: "prop6",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {}
				},
				unit: "Property4"
			}, {
				key: "Property7",
				path: "prop7",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {}
				},
				groupable: true
			}, {
				key: "Property8",
				path: "prop8",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {
						contextDefiningProperties: ["Property1", "Property3", "Property4"]
					}
				}
			}, {
				key: "Property9",
				path: "prop9",
				unit: "Property3",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {
						contextDefiningProperties: []
					}
				}
			}, {
				key: "Property10",
				path: "prop10",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {
						contextDefiningProperties: ["Property4", "Property5"]
					}
				}
			}]);
		},
		afterEach: function() {
			this.oPlugin.destroy();
		}
	});

	const aTestData = [{
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
		label: "undefined aggregation info",
		aggregationInfo: {},
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
		expectedAggregate: {prop5: {subtotals: true}, prop6: {grandTotal: true, subtotals: true, unit: "prop4"}},
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
	}, {
		label: "Search",
		testData: [{
			aggregationInfo: {
				visible: ["Property1", "Property2"],
				search: "Property"
			},
			expectedGroup: {prop1: {}, prop2: {}},
			expectedAggregate: {},
			expectedGroupLevels: [],
			expectedSearch: "Property"
		}, {
			aggregationInfo: {
				visible: ["Property1", "Property2"]
			},
			expectedGroup: {prop1: {}, prop2: {}},
			expectedAggregate: {},
			expectedGroupLevels: []
		}]
	}];

	aTestData.forEach(function(oData) {
		QUnit.test(oData.label, function(assert) {
			const aTestData = oData.testData || [oData];

			aTestData.forEach(function(oData) {
				const bEmptyAggregationInfo = oData.aggregationInfo == null || Object.keys(oData.aggregationInfo).length === 0;
				const bExpectedTotalsSetting = bEmptyAggregationInfo ? undefined : true;
				const oUpdateAggregationSpy = this.spy(this.oPlugin, "updateAggregation");

				this.oPlugin.setAggregationInfo(oData.aggregationInfo);

				const mAggregationInfo = this.oPlugin.getAggregationInfo();
				assert.equal(oUpdateAggregationSpy.callCount, 1, "updateAggregation is called only once");

				if (bEmptyAggregationInfo) {
					assert.equal(mAggregationInfo, undefined, "aggregation info is undefined");
				} else {
					assert.deepEqual(mAggregationInfo.group, oData.expectedGroup, "grouped properties");
					assert.deepEqual(mAggregationInfo.aggregate, oData.expectedAggregate, "aggregated properties");
					assert.deepEqual(mAggregationInfo.groupLevels, oData.expectedGroupLevels, "group levels");
					assert.strictEqual(mAggregationInfo.grandTotalAtBottomOnly, bExpectedTotalsSetting, "grandTotalAtBottomOnly");
					assert.strictEqual(mAggregationInfo.subtotalsAtBottomOnly, bExpectedTotalsSetting, "subtotalsAtBottomOnly");
					assert.strictEqual(mAggregationInfo.search, oData.expectedSearch, "search parameter");
				}

				oUpdateAggregationSpy.restore();
			}, this);
		});
	});

	QUnit.test("Property 'groupSummary'", function(assert) {
		const mExpectedAggregationInfo = {
			group: {prop1: {}, prop2: {}},
			groupLevels: [],
			aggregate: {prop5: {grandTotal: true}},
			grandTotalAtBottomOnly: true,
			search: undefined
		};

		this.oPlugin.setGroupSummary("None");
		this.oPlugin.setAggregationInfo({
			visible: ["Property5"],
			subtotals: ["Property5"],
			grandTotal: ["Property5"]
		});
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change to 'None' before setting aggregation info");

		this.oPlugin.setGroupSummary("Top");
		mExpectedAggregationInfo.aggregate.prop5.subtotals = true;
		mExpectedAggregationInfo.subtotalsAtBottomOnly = undefined;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change to 'Top'");

		this.oPlugin.setGroupSummary("Bottom");
		mExpectedAggregationInfo.subtotalsAtBottomOnly = true;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change to 'Bottom'");

		this.oPlugin.setGroupSummary("TopAndBottom");
		mExpectedAggregationInfo.subtotalsAtBottomOnly = false;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change to 'TopAndBottom'");
	});

	QUnit.test("Properties 'totalSummaryOnTop' and 'totalSummaryOnBottom'", function(assert) {
		const mExpectedAggregationInfo = {
			group: {prop1: {}, prop2: {}},
			groupLevels: [],
			aggregate: {prop5: {subtotals: true}},
			subtotalsAtBottomOnly: true,
			search: undefined
		};

		this.oPlugin.setTotalSummaryOnTop("Off");
		this.oPlugin.setTotalSummaryOnBottom("Off");
		this.oPlugin.setAggregationInfo({
			visible: ["Property5"],
			subtotals: ["Property5"],
			grandTotal: ["Property5"]
		});
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change both to 'Off' before setting aggregation info");

		this.oPlugin.setTotalSummaryOnTop("On");
		mExpectedAggregationInfo.aggregate.prop5.grandTotal = true;
		mExpectedAggregationInfo.grandTotalAtBottomOnly = undefined;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnTop' to 'On'");

		this.oPlugin.setTotalSummaryOnBottom("On");
		mExpectedAggregationInfo.grandTotalAtBottomOnly = false;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnBottom' to 'On'");

		this.oPlugin.setTotalSummaryOnTop("Off");
		mExpectedAggregationInfo.grandTotalAtBottomOnly = true;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnTop' to 'Off'");

		this.oPlugin.setTotalSummaryOnBottom("Off");
		delete mExpectedAggregationInfo.aggregate.prop5.grandTotal;
		delete mExpectedAggregationInfo.grandTotalAtBottomOnly;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnBottom' to 'Off'");

		this.oPlugin.setTotalSummaryOnTop("Fixed");
		mExpectedAggregationInfo.aggregate.prop5.grandTotal = true;
		mExpectedAggregationInfo.grandTotalAtBottomOnly = undefined;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnTop' to 'Fixed'");

		this.oPlugin.setTotalSummaryOnBottom("Fixed");
		mExpectedAggregationInfo.grandTotalAtBottomOnly = false;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnBottom' to 'Fixed'");

		this.oPlugin.setTotalSummaryOnTop("Off");
		mExpectedAggregationInfo.grandTotalAtBottomOnly = true;
		assert.deepEqual(this.oPlugin.getAggregationInfo(), mExpectedAggregationInfo, "Change 'totalSummaryOnTop' to 'Off'");
	});

	QUnit.module("Row count constraints", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				key: "Property1",
				path: "prop1",
				aggregatable: true,
				aggregationDetails: {
					customAggregate: {}
				}
			}]);
		},
		afterEach: function() {
			this.oPlugin.destroy();
		}
	});

	["Defaults", {
		totalSummaryOnTop: "On",
		totalSummaryOnBottom: "On"
	}, {
		totalSummaryOnTop: "Fixed",
		totalSummaryOnBottom: "Off"
	}, {
		totalSummaryOnTop: "Off",
		totalSummaryOnBottom: "Fixed"
	}, {
		totalSummaryOnTop: "Fixed",
		totalSummaryOnBottom: "Fixed"
	}].forEach(function(mTestData) {
		QUnit.test(JSON.stringify(mTestData), function(assert) {
			const oSetRowCountConstraints = this.spy(this.oPlugin, "setRowCountConstraints");

			this.oPlugin.setTotalSummaryOnTop(mTestData.totalSummaryOnTop);
			this.oPlugin.setTotalSummaryOnBottom(mTestData.totalSummaryOnBottom);
			this.stub(this.oPlugin, "getTableBinding").returns({setAggregation: function() {}});

			const bFixedTopEnabled = this.oPlugin.getTotalSummaryOnTop() === "Fixed";
			const bFixedBottomEnabled = this.oPlugin.getTotalSummaryOnBottom() === "Fixed";

			this.oPlugin.setAggregationInfo({
				visible: ["Property1"],
				subtotals: ["Property1"],
				grandTotal: ["Property1"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal + Subtotals");

			oSetRowCountConstraints.resetHistory();
			this.oPlugin.setAggregationInfo({
				visible: ["Property1"],
				grandTotal: ["Property1"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: bFixedTopEnabled,
				fixedBottom: bFixedBottomEnabled
			}), "GrandTotal");

			oSetRowCountConstraints.resetHistory();
			this.oPlugin.setAggregationInfo({
				visible: ["Property1"],
				subtotals: ["Property1"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: false,
				fixedBottom: false
			}), "Subtotals");

			oSetRowCountConstraints.resetHistory();
			this.oPlugin.setAggregationInfo({
				visible: ["Property1"]
			});
			assert.ok(oSetRowCountConstraints.calledOnceWithExactly({
				fixedTop: false,
				fixedBottom: false
			}), "No totals");
		});
	});

	QUnit.module("Row state calculation", {
		beforeEach: function() {
			this.oPlugin = new V4Aggregation();

			this.oPlugin.setPropertyInfos([{
				key: "Property1",
				path: "prop1",
				label: "Property 1",
				text: "Property2"
			}, {
				key: "Property2",
				path: "prop2",
				label: "Property 2"
			}, {
				key: "Property3",
				path: "prop3",
				label: "Property 3",
				groupingDetails: {
					formatter: function(oContext, sPropertyName) { return "Property3 > " + sPropertyName; }
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
		},
		afterEach: function() {
			this.oPlugin.destroy();
		}
	});

	const aTestData2 = [{
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
			const oContext = {
				getProperty: function(sPath) {
					return sPath.startsWith("@$ui5") ? oData.context[sPath] : sPath + "_value";
				}
			};

			const oState = {context: oContext, Type: {Summary: "Summary", GroupHeader: "GroupHeader"}};
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
		const oContextData = {"@$ui5.node.level": 1, "@$ui5.node.isExpanded": false};
		const oContext = {
			getProperty: function(sPath) {
				return oContextData[sPath];
			}
		};
		const oState = {context: oContext, Type: {Summary: "Summary", GroupHeader: "GroupHeader"}};
		const oExpectedError = new Error("The group header title must be a string or undefined");
		const that = this;

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

	QUnit.module("Cell content visibility", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				columns: (function() {
					const aColumns = [];
					for (let i = 0; i < 7; i++) {
						const oColumn = TableQUnitUtils.createTextColumn({id: "col" + i});
						this.spy(oColumn, "_setCellContentVisibilitySettings");
						aColumns.push(oColumn);
					}
					return aColumns;
				}.bind(this))()
			});

			this.oPlugin = new V4Aggregation();
			this.oTable.addDependent(this.oPlugin);
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertColumnCellVisibilitySettings: function(assert, mExpectedSettings, sTitle, bSkipReset) {
			this.oPlugin.getTable().getColumns().forEach(function(oColumn) {
				const sColumnId = oColumn.getId();
				const oSpy = oColumn._setCellContentVisibilitySettings;
				let sMessagePrefix = sTitle ? sTitle + ": " : "";

				sMessagePrefix += sColumnId + " - ";

				if (mExpectedSettings && mExpectedSettings[sColumnId]) {
					assert.ok(oSpy.calledOnceWithExactly(mExpectedSettings[sColumnId]), sMessagePrefix + "set settings");
					assert.deepEqual(oSpy.firstCall.args[0], mExpectedSettings[sColumnId], sMessagePrefix + "settings");
				} else if (!bSkipReset) {
					assert.ok(oSpy.calledOnceWithExactly(), sMessagePrefix + "reset settings");
				}

				oSpy.resetHistory();
			});
		}
	});

	QUnit.test("findOn", function(assert) {
		assert.ok(V4Aggregation.findOn(this.oTable) === this.oPlugin, "Plugin found on dependents aggregation via V4Aggregation.findOn");
	});

	QUnit.test("No column state", function(assert) {
		this.oPlugin.setAggregationInfo({
			visible: []
		});
		this.assertColumnCellVisibilitySettings(assert);
	});

	QUnit.test("Set column state", function(assert) {
		this.oPlugin.setAggregationInfo({
			visible: [],
			columnState: {
				col0: {},
				col1: {subtotals: true, grandTotal: false},
				col2: {subtotals: false, grandTotal: true},
				col4: {subtotals: true},
				col5: {grandTotal: true}
			}
		});

		this.assertColumnCellVisibilitySettings(assert, {
			col0: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: false, total: false}
			},
			col1: {
				groupHeader: {expanded: false, collapsed: true},
				summary: {group: true, total: false}
			},
			col2: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: false, total: true}
			},
			col4: {
				groupHeader: {expanded: false, collapsed: true},
				summary: {group: true, total: false}
			},
			col5: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: false, total: true}
			}
		});
	});

	QUnit.test("Property 'groupSummary'", function(assert) {
		const mExpectedSettings = {
			col0: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: false, total: false}
			},
			col1: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: true, total: true}
			}
		};

		this.oPlugin.setGroupSummary("None");
		this.oPlugin.setAggregationInfo({
			visible: [],
			columnState: {
				col0: {subtotals: false, grandTotal: false},
				col1: {subtotals: true, grandTotal: true}
			}
		});
		this.assertColumnCellVisibilitySettings(assert, mExpectedSettings, "Change to 'None' before setting aggregation info", true);

		this.oPlugin.setGroupSummary("Top");
		mExpectedSettings.col1.groupHeader.expanded = true;
		this.assertColumnCellVisibilitySettings(assert, mExpectedSettings, "Change to 'Top'", true);

		this.oPlugin.setGroupSummary("Bottom");
		mExpectedSettings.col1.groupHeader.collapsed = true;
		mExpectedSettings.col1.groupHeader.expanded = false;
		this.assertColumnCellVisibilitySettings(assert, mExpectedSettings, "Change to 'Bottom'", true);

		this.oPlugin.setGroupSummary("TopAndBottom");
		mExpectedSettings.col1.groupHeader.expanded = true;
		this.assertColumnCellVisibilitySettings(assert, mExpectedSettings, "Change to 'TopAndBottom'", true);
	});

	QUnit.skip("Plugin deactivation", function(assert) { // Can't be tested, because the plugin cannot be activated (needs a table with V4 binding).
		this.oPlugin.setAggregationInfo({
			visible: [],
			columnState: {
				col0: {type: "groupable"}
			}
		});
		this.assertColumnCellVisibilitySettings(assert, {
			col0: {
				groupHeader: {expanded: false, collapsed: false},
				summary: {group: false, total: false}
			}
		}, "Before destruction");

		this.oPlugin.deactivate();
		this.assertColumnCellVisibilitySettings(assert, "After destruction");
	});
});