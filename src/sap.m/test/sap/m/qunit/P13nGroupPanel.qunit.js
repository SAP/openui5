/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nGroupPanel",
	"sap/m/P13nGroupItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/P13nItem"
], function(
	qutils,
	createAndAppendDiv,
	P13nGroupPanel,
	P13nGroupItem,
	JSONModel,
	P13nItem
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
		"groupItems": [
			{
				"key": "s0",
				"columnKey": "c1",
				"operation": "Ascending",
				"showIfGrouped": true
			}, {
				"key": "s1",
				"columnKey": "c0",
				"operation": "Descending",
				"showIfGrouped": false
			}
		]
	};

	var bindGroupPanel = function(oP13nGroupPanel) {
		var oModel = new JSONModel(jQuery.extend(true, {}, gData));

		oP13nGroupPanel.setModel(oModel);
		oP13nGroupPanel.bindItems("/items", new P13nItem({
			columnKey: "{key}",
			text: "{text}",
			tooltip: "{tooltip}"
		}));
		oP13nGroupPanel.bindGroupItems("/groupItems", new P13nGroupItem({
			key: "{key}",
			operation: "{operation}",
			columnKey: "{columnKey}",
			showIfGrouped: "{showIfGrouped}"
		}));
	};

	QUnit.test("Default Values", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel({
			layoutMode: "Desktop"
		});

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getLayoutMode(), "Desktop", "getLayoutMode should be 'Desktop'");

		oP13nGroupPanel.setContainerQuery(true);
		assert.strictEqual(oP13nGroupPanel.getContainerQuery(), true, "getContainerQuery should return true");

		oP13nGroupPanel.setMaxGroups(5);
		assert.strictEqual(oP13nGroupPanel.getMaxGroups(), "5", "getMaxGroups should return 5");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("Validation Tests", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel({
			layoutMode: "Desktop"
		});

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.validateConditions(), true, "validateConditions should return true");

		oP13nGroupPanel.removeInvalidConditions();
		oP13nGroupPanel.removeValidationErrors();

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("bind Items test", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		bindGroupPanel(oP13nGroupPanel);

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getItems().length, 3, "length of getItems should be 3");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("bind GroupItems test", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		bindGroupPanel(oP13nGroupPanel);

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		var nItems = 2;
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, nItems, "length of getGroupItems should be '" + nItems + "'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("Insert Remove GroupItems test", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		bindGroupPanel(oP13nGroupPanel);

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		oP13nGroupPanel.insertGroupItem(new P13nGroupItem({
			columnKey: "c1",
			operation: "Ascending",
			showIfGrouped: true
		}));

		// assertions
		var nItems = 3;
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, nItems, "length of getGroupItems should be '" + nItems + "'");

		oP13nGroupPanel.removeAllGroupItems();
		nItems = 0;
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, nItems, "length of getGroupItems should be '" + nItems + "'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("test model update events", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel({
			removeGroupItem: function(oEvent) {
				var params = oEvent.getParameters();
				var oModel = oP13nGroupPanel.getModel();
				var oData = oModel.getData();
				oData.groupItems.forEach(function(oItem, iIndex) {
					if (oItem.key === params.key) {
						oData.groupItems.splice(iIndex, 1);
						oModel.setData(oData, true);
						return;
					}
				});
			},
			addGroupItem: function(oEvent) {
				var params = oEvent.getParameters();
				var oModel = oP13nGroupPanel.getModel();
				var oData = oModel.getData();
				var oGroupItem = {
					key: params.key,
					columnKey: params.groupItemData.getColumnKey(),
					operation: params.groupItemData.getOperation(),
					showIfGrouped: params.groupItemData.getShowIfGrouped()
				};
				if (params.index) {
					oData.groupItems.splice(params.index, 0, oGroupItem);
				} else {
					oData.groupItems.push(oGroupItem);
				}
				oModel.setData(oData, true);
			}
		});

		bindGroupPanel(oP13nGroupPanel);

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		// Remove item
		var nItems = 1;
		var oConditionPanel = oP13nGroupPanel._oGroupPanel;
		oConditionPanel._handleRemoveCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, nItems, "length of getGroupItems should be '" + nItems + "'");

		// Add item
		nItems = 2;
		oConditionPanel._handleAddCondition(oConditionPanel._oConditionsGrid, oConditionPanel._oConditionsGrid.getContent()[0]);

		// Change item
		var oConditionGrid = oConditionPanel._oConditionsGrid.getContent()[1];
		oConditionGrid.keyField.setSelectedKey("c0");
		oConditionPanel._changeField(oConditionGrid);

		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, nItems, "length of getGroupItems should be '" + nItems + "'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("bind named model", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		var oModel = new JSONModel(jQuery.extend(true, {}, gData));

		oP13nGroupPanel.setModel(oModel, "myModel");
		oP13nGroupPanel.bindItems("myModel>/items", new P13nItem({
			columnKey: "{myModel>key}",
			text: "{myModel>text}",
			tooltip: "{myModel>tooltip}"
		}));
		oP13nGroupPanel.bindGroupItems("myModel>/groupItems", new P13nGroupItem({
			key: "{myModel>key}",
			operation: "{myModel>operation}",
			columnKey: "{myModel>columnKey}",
			showIfGrouped: "{myModel>showIfGrouped}"
		}));

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, 2, "length of getGroupItems should be 2'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("create with aggregations", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel({
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
			groupItems: [
				new P13nGroupItem({
					key: "s0",
					columnKey: "c1",
					operation: "Ascending",
					showIfGrouped: true
				}), new P13nGroupItem({
					key: "s1",
					columnKey: "c0",
					operation: "Descending",
					showIfGrouped: false
				})
			]
		});
		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, 2, "length of getGroupItems should be 2'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("create with addXXX", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		oP13nGroupPanel.addItem(new P13nItem({
			columnKey: "c0",
			text: "Name"
		}));
		oP13nGroupPanel.addItem(new P13nItem({
			columnKey: "c1",
			text: "Color"
		}));
		oP13nGroupPanel.addItem(new P13nItem({
			columnKey: "c2",
			text: "Number"
		}));

		oP13nGroupPanel.addGroupItem(new P13nGroupItem({
			key: "s0",
			columnKey: "c1",
			operation: "Ascending",
			showIfGrouped: true
		}));
		oP13nGroupPanel.addGroupItem(new P13nGroupItem({
			key: "s1",
			columnKey: "c0",
			operation: "Descending",
			showIfGrouped: false
		}));
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getItems().length, 3, "length of getItems should be 3'");
		assert.strictEqual(oP13nGroupPanel.getGroupItems().length, 2, "length of getGroupItems should be 2'");

		// cleanup
		oP13nGroupPanel.destroy();
	});

	QUnit.test("'none'", function(assert) {

		// system under test
		var oP13nGroupPanel = new P13nGroupPanel();

		bindGroupPanel(oP13nGroupPanel);

		// arrange
		oP13nGroupPanel.placeAt("content");
		sap.ui.getCore().applyChanges();

		// assertions
		assert.strictEqual(oP13nGroupPanel.getItems().length, 3, "length of getItems should be 3");
		assert.strictEqual(oP13nGroupPanel._oGroupPanel.getKeyFields().length, 4, "length of getItems should be 4");

		// cleanup
		oP13nGroupPanel.destroy();
	});

});