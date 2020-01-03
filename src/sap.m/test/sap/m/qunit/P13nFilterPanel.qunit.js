/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nFilterPanel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/json/JSONModel",
	"sap/m/P13nItem",
	"sap/m/P13nFilterItem",
	"sap/m/library",
	"sap/m/P13nOperationsHelper"
], function(
	qutils,
	createAndAppendDiv,
	P13nFilterPanel,
	DateFormat,
	JSONModel,
	P13nItem,
	P13nFilterItem,
	mobileLibrary,
	P13nOperationsHelper
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("content");



	QUnit.module("Properties", {
		beforeEach: function() {
		},
		afterEach: function() {
		}
	});

	var gData = {
		"items": [
			{
				"key": "c0",
				"text": "Name"
			}, {
				"key": "c1",
				"text": "Date",
				"type": "date"
			}, {
				"key": "c2",
				"text": "Number",
				"tooltip": "My Tooltip",
				"maxlength": "10",
				"type": "numeric"
			}
		],
		"filterItems": [
			{
				"key": "f0",
				"columnKey": "c2",
				"operation": "BT",
				"value1": "1",
				"value2": "100"
			}, {
				"key": "f1",
				"columnKey": "c0",
				"operation": "GT",
				"value1": "A",
				"value2": ""
			}, {
				"key": "f2",
				"exclude": true,
				"columnKey": "c1",
				"operation": "EQ",
				"value1": DateFormat.getDateInstance().format(new Date()),
				"value2": DateFormat.getDateInstance().format(new Date())
			}
		]
	};
	var bindFilterPanel = function(oP13nFilterPanel) {
		var oModel = new JSONModel(jQuery.extend(true, {}, gData));
		oP13nFilterPanel.setModel(oModel);
		oP13nFilterPanel.bindItems("/items", new P13nItem({
			columnKey: "{key}",
			text: "{text}",
			tooltip: "{tooltip}",
			type: "{type}",
			maxLength: "{maxlength}"
		}));
		oP13nFilterPanel.bindFilterItems("/filterItems", new P13nFilterItem({
			key: "{key}",
			exclude: "{exclude}",
			columnKey: "{columnKey}",
			operation: "{operation}",
			value1: "{value1}",
			value2: "{value2}"
		}));
	};

	QUnit.test("Default Values", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel({
			maxIncludes: -1,
			maxExcludes: 2,
			layoutMode: "Desktop"
		});

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = "-1";
		assert.strictEqual(oP13nFilterPanel.getMaxIncludes(), nItems, "getMaxIncludes should be '" + nItems + "'");
		nItems = "2";
		assert.strictEqual(oP13nFilterPanel.getMaxExcludes(), nItems, "getMaxExcludes should be '" + nItems + "'");

		assert.strictEqual(oP13nFilterPanel.getLayoutMode(), "Desktop", "getLayoutMode should be 'Desktop'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("bind Items test", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel();

		bindFilterPanel(oP13nFilterPanel);

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = 3;
		assert.strictEqual(oP13nFilterPanel.getItems().length, nItems, "length of getItems should be '" + nItems + "'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("bind FilterItems test", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel();

		bindFilterPanel(oP13nFilterPanel);

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = 3;
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, nItems, "length of getFilterItems should be '" + nItems + "'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("test operations", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel();

		oP13nFilterPanel.setIncludeOperations([
			mobileLibrary.P13nConditionOperation.BT, mobileLibrary.P13nConditionOperation.EQ, mobileLibrary.P13nConditionOperation.Contains, mobileLibrary.P13nConditionOperation.StartsWith, mobileLibrary.P13nConditionOperation.EndsWith, mobileLibrary.P13nConditionOperation.LT, mobileLibrary.P13nConditionOperation.LE, mobileLibrary.P13nConditionOperation.GT
		]);

		oP13nFilterPanel.setExcludeOperations([
			mobileLibrary.P13nConditionOperation.EQ, mobileLibrary.P13nConditionOperation.StartsWith, mobileLibrary.P13nConditionOperation.GT
		]);

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = 8;
		assert.strictEqual(oP13nFilterPanel.getIncludeOperations().length, nItems, "length of getIncludeOperations should be '" + nItems + "'");
		nItems = 3;
		assert.strictEqual(oP13nFilterPanel.getExcludeOperations().length, nItems, "length of getExcludeOperations should be '" + nItems + "'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("test model update events", function(assert) {

		var removeSpy = sinon.spy(function(oEvent) {
			var params = oEvent.getParameters();
			var oModel = oP13nFilterPanel.getModel();
			var oData = oModel.getData();
			oData.filterItems.forEach(function(oItem, iIndex) {
				if (oItem.key === params.key) {
					oData.filterItems.splice(iIndex, 1);
					oModel.setData(oData, true);
					return;
				}
			});
		});

		var updateSpy = sinon.spy(function(oEvent) {
			var params = oEvent.getParameters();
			var oFilterItemData = params.filterItemData;
			assert.ok(oFilterItemData instanceof P13nFilterItem, "oFilterItemData should be of type P13nFilterItem");
			assert.strictEqual(oFilterItemData.getValue1(), "foo", "new Value1 value should be 'foo'");
		});

		var addSpy = sinon.spy(function(oEvent) {
			var params = oEvent.getParameters();
			var oModel = oP13nFilterPanel.getModel();
			var oData = oModel.getData();
			var oFilterItemData = params.filterItemData;
			assert.strictEqual(oFilterItemData.getValue1(), "new", "added condition Value1 value should be 'new'");
			if (params.index) {
				oData.filterItems.splice(params.index, 0, oFilterItemData);
			} else {
				oData.filterItems.push(oFilterItemData);
			}
			oModel.setData(oData, true);
		});

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel({
			removeFilterItem: removeSpy,
			updateFilterItem: updateSpy,
			addFilterItem: addSpy
		});

		bindFilterPanel(oP13nFilterPanel);

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();


		// Change item
		var oConditionPanel = oP13nFilterPanel._oIncludeFilterPanel;
		var oConditionGrid = oConditionPanel._oConditionsGrid.getContent()[1];
		var sValue1 = "foo";
		oConditionGrid.value1.setValue(sValue1);
		oConditionPanel._changeField(oConditionGrid);
		assert.strictEqual(oP13nFilterPanel.getFilterItems()[1].getValue1(), sValue1, "Value1 of first condition must be '" + sValue1 + "'.");

		// Remove item
		var nItems = 2;
		oConditionPanel._handleRemoveCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, nItems, "length of getFilterItems should be '" + nItems + "'");

		// Add item
		nItems = 3;
		oConditionPanel._handleAddCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);
		oConditionGrid = oConditionPanel._oConditionsGrid.getContent()[1];
		oConditionGrid.value1.setValue("new");
		oConditionPanel._changeField(oConditionGrid);
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, nItems, "length of getFilterItems should be '" + nItems + "'");

		// check that all event handlers are called
		assert.ok(removeSpy.called, "removeFilterItem was called");
		assert.ok(updateSpy.called, "updateFilterItem was called");
		assert.ok(addSpy.called, "addFilterItem was called");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("bind named model", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel();

		var oModel = new JSONModel(jQuery.extend(true, {}, gData));
		oP13nFilterPanel.setModel(oModel, "myModel");
		oP13nFilterPanel.bindItems("myModel>/items", new P13nItem({
			columnKey: "{myModel>key}",
			text: "{myModel>text}",
			tooltip: "{myModel>tooltip}",
			type: "{myModel>type}",
			maxLength: "{myModel>maxlength}"
		}));
		oP13nFilterPanel.bindFilterItems("myModel>/filterItems", new P13nFilterItem({
			key: "{myModel>key}",
			exclude: "{myModel>exclude}",
			columnKey: "{myModel>columnKey}",
			operation: "{myModel>operation}",
			value1: "{myModel>value1}",
			value2: "{myModel>value2}"
		}));

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nFilterPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, 3, "length of getFilterItems should be 3'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("create with aggregations", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel({
			items: [
				new P13nItem({
					columnKey: "c0",
					text: "Name"
				}), new P13nItem({
					columnKey: "c1",
					text: "Date",
					type: "date"
				}), new P13nItem({
					columnKey: "c2",
					text: "Number",
					tooltip: "My Tooltip",
					maxLength: "10",
					type: "numeric"
				})
			],
			filterItems: [
				new P13nFilterItem({
					key: "f0",
					columnKey: "c2",
					operation: "BT",
					value1: "1",
					value2: "100"
				}), new P13nFilterItem({
					key: "f1",
					columnKey: "c0",
					operation: "GT",
					value1: "A",
					value2: ""
				}), new P13nFilterItem({
					key: "f2",
					exclude: true,
					columnKey: "c1",
					operation: "EQ",
					value1: DateFormat.getDateInstance().format(new Date()),
					value2: DateFormat.getDateInstance().format(new Date())
				})
			]
		});

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nFilterPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, 3, "length of getFilterItems should be 3'");

		// cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.test("create with addXXX", function(assert) {

		// system under test
		var oP13nFilterPanel = new P13nFilterPanel();

		// arrange
		oP13nFilterPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		oP13nFilterPanel.addItem(new P13nItem({
			columnKey: "c0",
			text: "Name"
		}));
		oP13nFilterPanel.addItem(new P13nItem({
			columnKey: "c1",
			text: "Date",
			type: "date"
		}));
		oP13nFilterPanel.addItem(new P13nItem({
			columnKey: "c2",
			text: "Number",
			tooltip: "My Tooltip",
			maxLength: "10",
			type: "numeric"
		}));
		oP13nFilterPanel.addFilterItem(new P13nFilterItem({
			key: "f0",
			columnKey: "c2",
			operation: "BT",
			value1: "1",
			value2: "100"
		}));
		oP13nFilterPanel.addFilterItem(new P13nFilterItem({
			key: "f1",
			columnKey: "c0",
			operation: "GT",
			value1: "A",
			value2: ""
		}));
		oP13nFilterPanel.addFilterItem(new P13nFilterItem({
			key: "f2",
			exclude: true,
			columnKey: "c1",
			operation: "EQ",
			value1: DateFormat.getDateInstance().format(new Date()),
			value2: DateFormat.getDateInstance().format(new Date())
		}));
		sap.ui.getCore().applyChanges();
		// assertions
		assert.strictEqual(oP13nFilterPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nFilterPanel.getFilterItems().length, 3, "length of getFilterItems should be 3'");

		// cleanup
		oP13nFilterPanel.destroy();

	});

	QUnit.test("Include and Exclude operations list", function (assert) {
		// Arrange
		var oP13nFilterPanel = new P13nFilterPanel();

		// Assert
		assert.strictEqual(
			JSON.stringify(oP13nFilterPanel._aIncludeOperations),
			'{"default":["EQ","BT","LT","LE","GT","GE"],' +
			'"string":["Contains","EQ","BT","StartsWith","EndsWith","LT","LE","GT","GE"],' +
			'"date":["EQ","BT","LT","LE","GT","GE"],' +
			'"time":["EQ","BT","LT","LE","GT","GE"],"datetime":["EQ","BT","LT","LE","GT","GE"],' +
			'"numeric":["EQ","BT","LT","LE","GT","GE"],' +
			'"numc":["Contains","EQ","BT","EndsWith","LT","LE","GT","GE"],' +
			'"boolean":["EQ"]}',
			"Include operations list should match"
		);
		assert.strictEqual(
			JSON.stringify(oP13nFilterPanel._aExcludeOperations),
			'{"default":["EQ"]}',
			"Exclude operations list should match"
		);

		// Cleanup
		oP13nFilterPanel.destroy();
	});

	QUnit.module("Internal methods", {
		beforeEach: function () {
			this.oFP = new P13nFilterPanel();
		},
		afterEach: function () {
			this.oFP.destroy();
			this.oFP = null;
		}
	});

	QUnit.test("_updateOperations", function (assert) {
		// Arrange
		var oSetIncludeOperationsSpy = sinon.spy(this.oFP, "setIncludeOperations"),
			oSetExcludeOperationsSpy = sinon.spy(this.oFP, "setExcludeOperations");

		// Act
		this.oFP._updateOperations();

		// Assert
		assert.ok(oSetIncludeOperationsSpy.called, "Include setter called");
		assert.ok(oSetExcludeOperationsSpy.called, "Exclude setter called");

		// Cleanup
		oSetIncludeOperationsSpy.restore();
		oSetExcludeOperationsSpy.restore();
	});

	QUnit.test("_enableEnhancedExcludeOperations", function (assert) {
		// Arrange
		var oUpdateOperationsSpy = sinon.spy(this.oFP, "_updateOperations"),
			oSetEnhancedExcludeOperationsSpy = sinon.spy(this.oFP._oOperationsHelper, "setUseExcludeOperationsExtended");

		// Act
		this.oFP._enableEnhancedExcludeOperations();

		// Assert
		assert.strictEqual(oUpdateOperationsSpy.callCount, 1, "_updateOperations called once");
		assert.strictEqual(oSetEnhancedExcludeOperationsSpy.callCount, 1, "setUseExcludeOperationsExtended called once");

		// Cleanup
		oUpdateOperationsSpy.restore();
		oSetEnhancedExcludeOperationsSpy.restore();
	});

});