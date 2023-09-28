sap.ui.define([
	"sap/m/Table",
	"sap/m/table/ColumnWidthController",
	"sap/ui/core/CustomData"
], function(Table, ColumnWidthController, CustomData) {
	"use strict";
	/* global QUnit */

	QUnit.module("API tests", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oWidthController = new ColumnWidthController({
				control: this.oTable
			});
		}
	});

	QUnit.test("Check default configuration", function(assert){

		assert.ok(this.oWidthController, "The controller is instanciable");
		assert.equal(this.oWidthController.getTargetAggregation(), "columns", "Target aggregation is properly set up");
		assert.deepEqual(this.oWidthController.getChangeOperations(), {
			set: "setColumnWidth"
		}, "Proper change types configured");

	});

	QUnit.test("Check delta calculation (only one value which changed)", function(assert){

		var aWidthChanges = this.oWidthController.getDelta({
			control: this.oTable,
			existingState: {
				testA: "30px"
			},
			changedState: {
				testA: "40px"
			}
		});

		assert.equal(aWidthChanges.length, 1, "One change created as the width is changed");

		assert.equal(aWidthChanges[0].changeSpecificData.content.key, "testA", "Key provided");
		assert.equal(aWidthChanges[0].changeSpecificData.content.value, "40px", "Width provided");
		assert.equal(aWidthChanges[0].selectorElement, this.oTable, "Selector (table) provided");
	});

	QUnit.test("Check delta calculation (no changes)", function(assert){

		var aWidthChanges = this.oWidthController.getDelta({
			control: this.oTable,
			existingState: {
				testA: "30px"
			},
			changedState: {
				testA: "30px"
			}
		});

		assert.equal(aWidthChanges.length, 0, "Value is unchanged, no change created");
	});

	QUnit.test("Check delta calculation (multiple values, only one change)", function(assert){

		var aWidthChanges = this.oWidthController.getDelta({
			control: this.oTable,
			existingState: {
				testA: "30px",
				testB: "30px"
			},
			changedState: {
				testA: "35px",
				testB: "30px"
			}
		});

		assert.equal(aWidthChanges.length, 1, "Only one Value is changed, one change created");
		assert.equal(aWidthChanges[0].changeSpecificData.content.value, "35px", "Width provided");
		assert.equal(aWidthChanges[0].selectorElement, this.oTable, "Selector (table) provided");
	});

	QUnit.test("Check delta calculation (multiple values, multiple changes)", function(assert){

		var aWidthChanges = this.oWidthController.getDelta({
			control: this.oTable,
			existingState: {
				testA: "30px",
				testB: "30px"
			},
			changedState: {
				testA: "35px",
				testB: "40px"
			}
		});

		assert.equal(aWidthChanges.length, 2, "Only one Value is changed, one change created");
		assert.equal(aWidthChanges[0].changeSpecificData.content.key, "testA", "Width provided");
		assert.equal(aWidthChanges[0].changeSpecificData.content.value, "35px", "Width provided");
		assert.equal(aWidthChanges[0].selectorElement, this.oTable, "Selector (table) provided");
		assert.equal(aWidthChanges[1].changeSpecificData.content.key, "testB", "Width provided");
		assert.equal(aWidthChanges[1].changeSpecificData.content.value, "40px", "Width provided");
		assert.equal(aWidthChanges[1].selectorElement, this.oTable, "Selector (table) provided");
	});

	QUnit.test("Check #getCurrentState", function(assert){

		const config = JSON.stringify({
			aggregations: {
				columns: {
					"testA": {
						width: "50px"
					}
				}
			}
		});

		const xConfig = new CustomData({
			key: "xConfig",
			value: config
		});

		xConfig.setValue(config);

		this.oTable.addCustomData(xConfig);

		const currentState = this.oWidthController.getCurrentState();

		assert.deepEqual({
			testA: "50px"
		}, currentState, "The state is properly retrieved using the xConfig");
	});

});