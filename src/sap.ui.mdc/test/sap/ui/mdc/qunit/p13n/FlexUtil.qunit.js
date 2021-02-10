/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/FlexUtil", "sap/ui/mdc/Table", "sap/ui/mdc/Chart", "sap/ui/mdc/FilterBar"
], function (FlexUtil, Table, Chart, FilterBar) {
	"use strict";

		var aExistingItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true
			},
			{
				id: "IDYear",
				name: "year",
				label: "Year",
				visible: true
			}
		];

	QUnit.module("FlexUtil API 'getArrayDeltaChanges' tests for Table (Selection)", {
		getTableDeltaConfig: function(aChangedItems) {
			return {
				control: this.oTable,
				changedState: aChangedItems,
				existingState: aExistingItems,
				deltaAttributes: ["name"],
				changeOperations: {
					add: "addColumn",
					remove: "removeColumn",
					move: "moveColumn"
				}
			};
		},
		beforeEach: function () {
			this.oTable = new Table("TestTable",{});
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});
	//----------------------- Table ------------------------------
	QUnit.test("addColumn", function (assert) {
		//adding (selecting) a Column should result in one Change
		var aChangedItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				position: 0
			},
			{
				id: "IDYear",
				name: "year",
				label: "Year",
				visible: true,
				position: 1
			},
			{
				id: undefined,
				name: "country",
				label: "Country",
				visible: true//set 'Country' to visible
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getTableDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addColumn", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "country", "Correct property has been added");

	});


	QUnit.test("removeColumn", function (assert) {
		//removing (deselecting) a Column should result in one Change
		var aChangedItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				position: 0
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getTableDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeColumn", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");
	});


	QUnit.test("move column", function (assert) {
		//moving a Column should result in two Changes: remove + add

		var aChangedItems = [
			{
				id: "IDYear",
				name: "year",//swapped with name
				label: "Year",
				visible: true,
				position: 0
			},
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				position: 1
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getTableDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "moveColumn", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");
	});

	var aChartExisting = [
		{
			id: "IDName",
			name: "name",
			label: "Name",
			visible: true,
			role: "dimension"
		},
		{
			id: "IDYear",
			name: "year",
			label: "Year",
			visible: true,
			role: "dimension"
		}
	];

	QUnit.module("FlexUtil API 'getArrayDeltaChanges' tests for Chart (Selection)", {
		getChartDeltaConfig: function(aChangedItems) {
			return {
				control: this.oChart,
				changedState: aChangedItems,
				existingState: aChartExisting,
				deltaAttributes: ["name", "role"],
				changeOperations: {
					add: "addItem",
					remove: "removeItem",
					move: "moveItem"
				}
			};
		},
		beforeEach: function () {
			//mock data --> usually the settings class provides this
			this.oChart = new Chart("TestChart",{});
		},
		afterEach: function () {
			this.oChart.destroy();
		}
	});

	QUnit.test("addChartItem", function (assert) {
		//adding (selecting) a ChartItem should result in one Change

		var aChangedItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				role: "dimension"
			},
			{
				id: "IDYear",
				name: "year",
				label: "Year",
				visible: true,
				role: "dimension"
			},
			{
				id: undefined,
				name: "country",
				label: "Country",
				visible: true,//set visible
				role: "measure"
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getChartDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oChart.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addItem", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "country", "Correct property has been added");
	});

	QUnit.test("removeChartItem", function (assert) {
		//removing (deselecting) a ChartItem should result in one Change

		var aChangedItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				role: "dimension"
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getChartDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oChart.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeItem", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");
	});

	QUnit.test("move item", function (assert) {
		//moving a ChartItem should result in two Changes: remove + add

		var aChangedItems = [
			{
				id: "IDYear",
				name: "year",
				label: "Year",
				visible: true,
				role: "measure"
			},
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				role: "dimension"
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getChartDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oChart.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "moveItem", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");
	});


	QUnit.test("changeRole", function (assert) {
		//changing (change Select) the role of an existing chartItem should result in two changes: remove old sorter + add new sorter

		var aChangedItems = [
			{
				id: "IDName",
				name: "name",
				label: "Name",
				visible: true,
				role: "dimension"
			},
			{
				id: "IDYear",
				name: "year",
				label: "Year",
				visible: true,
				role: "series"
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getChartDeltaConfig(aChangedItems));

		assert.strictEqual(aChanges.length, 2, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oChart.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeItem", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");

		assert.strictEqual(aChanges[1].selectorElement.sId, this.oChart.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[1].changeSpecificData.changeType, "addItem", "Correct change type has been set");
		assert.strictEqual(aChanges[1].changeSpecificData.content.name, "year", "Correct property has been added");

	});

	var aSortState = [
		{
			name: "name",
			label: "Name",
			visible: true,
			descending: false
		},
		{
			name: "year",
			label: "Year",
			visible: true,
			descending: false
		}
	];

	//----------------------- Sorting ------------------------------
	QUnit.module("FlexUtil API 'processResult' tests for Sorting", {
		getSortDeltaConfig: function(aChangedItems) {
			return {
				control: this.oTable,
				changedState: aChangedItems,
				existingState: aSortState,
				deltaAttributes: ["name", "descending"],
				changeOperations: {
					add: "addSort",
					remove: "removeSort",
					move: "moveSort"
				}
			};
		},
		beforeEach: function () {
			this.oTable = new Table("TestTable",{});
		},
		afterEach: function () {
			this.oTable.destroy();
		}
	});

	QUnit.test("addSort", function (assert) {
		//adding (selecting) a Sorter --> one change

		var aChangedSorters = [
			{
				name: "name",
				label: "Name",
				visible: true,
				descending: false
			},
			{
				name: "year",
				label: "Year",
				visible: true,
				descending: false
			},
			{
				name: "country",
				label: "Country",
				visible: true,
				descending: false
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getSortDeltaConfig(aChangedSorters));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addSort", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "country", "Correct property has been added");
	});


	QUnit.test("removeSort", function (assert) {
		//removing (deselecting) a Sorter --> once change

		var aChangedSorters = [
			{
				name: "name",
				label: "Name",
				visible: true,
				descending: false
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getSortDeltaConfig(aChangedSorters));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeSort", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");

	});

	QUnit.test("moveSort", function (assert) {
		//move Sorter --> one change (moveSort)
		var aChangedSorters = [
			{
				name: "year",
				label: "Year",
				visible: true,
				descending: false
			},
			{
				name: "name",
				label: "Name",
				visible: true,
				descending: false
			}
		];

		var aChanges = FlexUtil.getArrayDeltaChanges(this.getSortDeltaConfig(aChangedSorters));

		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oTable.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "moveSort", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "year", "Correct property has been added");
	});

	//----------------------- Conditions ------------------------------
	QUnit.module("FlexUtil API 'getConditionDeltaChanges' tests for filtering", {
		beforeEach: function () {
			this.oFilterBar = new FilterBar("TestFB",{});
		},
		afterEach: function () {
			this.oFilterBar.destroy();
		}
	});

	QUnit.test("check 'addCondition'",function(assert){
		var aOrigConditions = [
			{
				"operator": "EQ",
				"values": [
					"Test"
				]
			}
		];

		var aChanges = FlexUtil._diffConditionPath("Test", aOrigConditions, [], this.oFilterBar);
		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oFilterBar.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "addCondition", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Test", "Correct property has been added");
	});

	QUnit.test("check 'removeCondition'",function(assert){
		var aShadowConditions = [
			{
				"operator": "EQ",
				"values": [
					"Test"
				]
			}
		];

		var aChanges = FlexUtil._diffConditionPath("Test",[], aShadowConditions, this.oFilterBar);
		assert.strictEqual(aChanges.length, 1, "Correct amount of changes has been created");
		assert.strictEqual(aChanges[0].selectorElement.sId, this.oFilterBar.getId(), "the correct selectorElement has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.changeType, "removeCondition", "Correct change type has been set");
		assert.strictEqual(aChanges[0].changeSpecificData.content.name, "Test", "Correct property has been added");
	});
});
