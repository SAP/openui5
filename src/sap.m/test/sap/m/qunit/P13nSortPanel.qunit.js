/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nSortPanel",
	"sap/ui/model/json/JSONModel",
	"sap/m/P13nItem",
	"sap/m/P13nSortItem"
], function(
	qutils,
	createAndAppendDiv,
	P13nSortPanel,
	JSONModel,
	P13nItem,
	P13nSortItem
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
				"text": "Color"
			}, {
				"key": "c2",
				"text": "Number"
			}
		],
		"sortItems": [
			{
				"key": "s0",
				"columnKey": "c1",
				"operation": "Ascending"
			}, {
				"key": "s1",
				"columnKey": "c0",
				"operation": "Descending"
			}
		]
	};

	var bindSortPanel = function(oP13nSortPanel) {
		var oModel = new JSONModel(jQuery.extend(true, {}, gData));

		oP13nSortPanel.setModel(oModel);
		oP13nSortPanel.bindItems("/items", new P13nItem({
			columnKey: "{key}",
			text: "{text}",
			tooltip: "{tooltip}"
		}));
		oP13nSortPanel.bindSortItems("/sortItems", new P13nSortItem({
			key: "{key}",
			operation: "{operation}",
			columnKey: "{columnKey}"
		}));
	};

	QUnit.test("Default Values", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel({
			layoutMode: "Desktop"
		});

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getLayoutMode(), "Desktop", "getLayoutMode should be 'Desktop'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("bind Items test", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel();

		bindSortPanel(oP13nSortPanel);

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getItems().length, 3, "length of getItems should be 3");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("bind SortItems test", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel();

		bindSortPanel(oP13nSortPanel);

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = 2;
		assert.strictEqual(oP13nSortPanel.getSortItems().length, nItems, "length of getSortItems should be '" + nItems + "'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("test model update events", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel({
			removeSortItem: function(oEvent) {
				var params = oEvent.getParameters();
				var oModel = oP13nSortPanel.getModel();
				var oData = oModel.getData();
				oData.sortItems.forEach(function(oItem, iIndex) {
					if (oItem.key === params.key) {
						oData.sortItems.splice(iIndex, 1);
						oModel.setData(oData, true);
						return;
					}
				});
			},
			addSortItem: function(oEvent) {
				var params = oEvent.getParameters();
				var oModel = oP13nSortPanel.getModel();
				var oData = oModel.getData();
				var oSortItem = {
					key: params.key,
					columnKey: params.sortItemData.getColumnKey(),
					operation: params.sortItemData.getOperation()
				};
				if (params.index) {
					oData.sortItems.splice(params.index, 0, oSortItem);
				} else {
					oData.sortItems.push(oSortItem);
				}
				oModel.setData(oData, true);
			}
		});

		bindSortPanel(oP13nSortPanel);

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// Remove item
		var nItems = 1;
		var oConditionPanel = oP13nSortPanel._oSortPanel;
		oConditionPanel._handleRemoveCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);
		assert.strictEqual(oP13nSortPanel.getSortItems().length, nItems, "length of getSortItems should be '" + nItems + "'");

		// Add item
		nItems = 2;
		oConditionPanel._handleAddCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);

		// Change item
		var oConditionGrid = oConditionPanel._oConditionsGrid.getContent()[1];
		oConditionGrid.keyField.setSelectedKey("c0");
		oConditionPanel._changeField(oConditionGrid);

		assert.strictEqual(oP13nSortPanel.getSortItems().length, nItems, "length of getSortItems should be '" + nItems + "'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("bind named model", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel();

		var oModel = new JSONModel(jQuery.extend(true, {}, gData));
		oP13nSortPanel.setModel(oModel, "myModel");
		oP13nSortPanel.bindItems("myModel>/items", new P13nItem({
			columnKey: "{myModel>key}",
			text: "{myModel>text}",
			tooltip: "{myModel>tooltip}"
		}));
		oP13nSortPanel.bindSortItems("myModel>/sortItems", new P13nSortItem({
			key: "{myModel>key}",
			operation: "{myModel>operation}",
			columnKey: "{myModel>columnKey}"
		}));

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getSortItems().length, 2, "length of getSortItems should be 2'");
		assert.strictEqual(oP13nSortPanel.getSortItems().length, 2, "length of getSortItems should be 2'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("create with aggregations", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel({
			items: [
				new P13nItem({
					columnKey: "c0",
					text: "Name"
				}), new P13nItem({
					columnKey: "c1",
					text: "Color"
				}), new P13nItem({
					columnKey: "c2",
					text: "Number"
				})
			],
			sortItems: [
				new P13nSortItem({
					key: "s0",
					columnKey: "c1",
					operation: "Ascending"
				}), new P13nSortItem({
					key: "s1",
					columnKey: "c0",
					operation: "Descending"
				})
			]
		});
		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nSortPanel.getSortItems().length, 2, "length of getSortItems should be 2'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("create with addXXX", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel();

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		oP13nSortPanel.addItem(new P13nItem({
			columnKey: "c0",
			text: "Name"
		}));
		oP13nSortPanel.addItem(new P13nItem({
			columnKey: "c1",
			text: "Color"
		}));
		oP13nSortPanel.addItem(new P13nItem({
			columnKey: "c2",
			text: "Number"
		}));

		oP13nSortPanel.addSortItem(new P13nSortItem({
			key: "s0",
			columnKey: "c1",
			operation: "Ascending"
		}));
		oP13nSortPanel.addSortItem(new P13nSortItem({
			key: "s1",
			columnKey: "c0",
			operation: "Descending"
		}));
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nSortPanel.getSortItems().length, 2, "length of getSortItems should be 2'");

		// cleanup
		oP13nSortPanel.destroy();
	});

	QUnit.test("'none'", function(assert) {

		// system under test
		var oP13nSortPanel = new P13nSortPanel();

		bindSortPanel(oP13nSortPanel);

		// arrange
		oP13nSortPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nSortPanel.getItems().length, 3, "length of getItems should be 3");
		assert.strictEqual(oP13nSortPanel._oSortPanel.getKeyFields().length, 4, "length of getItems should be 4");

		// cleanup
		oP13nSortPanel.destroy();
	});

});