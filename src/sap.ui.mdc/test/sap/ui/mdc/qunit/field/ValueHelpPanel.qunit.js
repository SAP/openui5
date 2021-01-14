/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/field/ValueHelpPanel",
	"sap/ui/mdc/field/DefineConditionPanel",
	"sap/ui/model/type/Integer",
	"sap/m/Button"
], function(
		qutils,
		ConditionModel,
		Condition,
		ValueHelpPanel,
		DefineConditionPanel,
		IntegerType,
		Button
		) {
	"use strict";

	var oValueHelpPanel;

	QUnit.module("ValueHelpPanel", {
		beforeEach: function() {
			oValueHelpPanel = new ValueHelpPanel();
		},
		afterEach: function() {
			oValueHelpPanel.destroy();
		}
	});

	QUnit.test("Basic tests", function(assert) {
		assert.equal(oValueHelpPanel != null, true, "instance can be created");
	});

	QUnit.test("showTokenizer", function(assert) {
		oValueHelpPanel.placeAt("content");
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer default is true");
		oValueHelpPanel.setShowTokenizer(true);
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer should be still true");
		oValueHelpPanel.setShowTokenizer(false);
		assert.equal(oValueHelpPanel.getShowTokenizer(), false, "showTokenizer changed");
		oValueHelpPanel.setShowTokenizer(true);
		assert.equal(oValueHelpPanel.getShowTokenizer(), true, "showTokenizer changed back to true");
	});

	QUnit.test("setFilterbar", function(assert) {

		assert.notOk(oValueHelpPanel._oFilterVBox.getVisible(), "VBox for FilterBar invisible");

		oValueHelpPanel.placeAt("content");
		var oFilterBar = new Button("B1");
		oFilterBar.triggerSearch = function() {}; // to fake FilterBar
		sinon.spy(oFilterBar, "triggerSearch");
		oValueHelpPanel.setFilterbar(oFilterBar);

		sap.ui.getCore().applyChanges();

		assert.ok(oValueHelpPanel._oFilterbar != null, "filterbar added");

		assert.ok(oValueHelpPanel.getShowFilterbar(), "showFilterbar default is true");
		assert.ok(oValueHelpPanel._oFilterVBox.getVisible(), "VBox for FilterBar visible");
		oValueHelpPanel.setShowFilterbar(false);
		assert.notOk(oValueHelpPanel.getShowFilterbar(), "showFilterbar change to false");
		assert.notOk(oValueHelpPanel._oFilterVBox.getVisible(), "VBox for FilterBar invisible");
		oValueHelpPanel.setShowFilterbar(true);
		assert.ok(oValueHelpPanel.getShowFilterbar(), "showFilterbar change to true");
		assert.ok(oValueHelpPanel._oFilterVBox.getVisible(), "VBox for FilterBar visible");

		oValueHelpPanel.setFilterbar(null);
		assert.ok(oValueHelpPanel._oFilterbar == null, "filterbar should be removed");
		assert.notOk(oValueHelpPanel._oFilterVBox.getVisible(), "VBox for FilterBar invisible");

		oFilterBar.destroy();
	});

	QUnit.test("setTable", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);

		sap.ui.getCore().applyChanges();

		assert.equal(oValueHelpPanel._oTable != null, true, "table added");
		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.ok(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar invisible");

		oValueHelpPanel.setTable(null);
		assert.equal(oValueHelpPanel._oTable == null, true, "table should be removed");

		oTable.destroy();
	});

	QUnit.test("getTable", function(assert) {
		assert.notOk(oValueHelpPanel.getTable(), "No table returned");

		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);
		assert.equal(oValueHelpPanel.getTable(), oTable, "existing table returned");

		oTable.destroy();
	});

	QUnit.test("setDefineConditions", function(assert) {
		oValueHelpPanel.placeAt("content");
		var oDefineConditions = new DefineConditionPanel("DCP");
		oValueHelpPanel.setDefineConditions(oDefineConditions);
		sap.ui.getCore().applyChanges();

		assert.equal(oValueHelpPanel._oDefineConditionPanel != null, true, "defineCondition added");
		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.ok(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar invisible");
		assert.ok(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions Bound");
		assert.ok(oDefineConditions.getBinding("conditions"), "DefineConditions conditions Bound");
		assert.ok(oDefineConditions.getBinding("inputOK"), "DefineConditions inputOK Bound");

		oValueHelpPanel.setDefineConditions(null);
		assert.equal(oValueHelpPanel._oDefineConditionPanel == null, true, "defineCondition should be removed");
	});

	QUnit.test("Table and DefineConditions", function(assert) {

		oValueHelpPanel.placeAt("content");
		var oTable = new Button("B1");
		oValueHelpPanel.setTable(oTable);
		var oDefineConditions = new DefineConditionPanel("DCP");
		oValueHelpPanel.setDefineConditions(oDefineConditions);
		oValueHelpPanel.setConditions([
									   Condition.createCondition("BT", ["A", "Z"]),
									   Condition.createCondition("GE", ["B"]),
									   Condition.createItemCondition("X", "Test")
									   ]);
		sap.ui.getCore().applyChanges();

		var oIconTabBar = oValueHelpPanel.byId("iconTabBar");
		assert.notOk(oIconTabBar.hasStyleClass("sapMdcNoHeader"), "Header of IconTabBar visible");
		assert.ok(!!oTable.getDomRef(), "Table rendered");
		assert.notOk(!!oDefineConditions.getDomRef(), "DefineConditions not rendered");
		assert.notOk(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions not Bound");
		assert.notOk(oDefineConditions.getBinding("conditions"), "DefineConditions conditions not Bound");

		var oHeader = oIconTabBar._getIconTabHeader();
		var aItems = oHeader.getItems();
		assert.ok(aItems[0].getText().search("\\(1\\)") >= 0, "item count for table-selection");
		assert.ok(aItems[1].getText().search("\\(2\\)") >= 0, "item count for define conditions");
		var oTokenizerPanel = oValueHelpPanel.byId("VHPTokenizerPanel");
		assert.ok(oTokenizerPanel.getHeaderText().search("\\(3\\)") >= 0, "item count for Tokenizer title");

		oHeader.setSelectedItem(aItems[1]);
		sap.ui.getCore().applyChanges();

		assert.notOk(!!oTable.getDomRef(), "Table not rendered");
		assert.ok(!!oDefineConditions.getDomRef(), "DefineConditions rendered");
		assert.ok(oDefineConditions.getBinding("formatOptions"), "DefineConditions formatOptions Bound");
		assert.ok(oDefineConditions.getBinding("conditions"), "DefineConditions conditions Bound");

		oValueHelpPanel.setConditions([]);
		assert.notOk(aItems[0].getText().search("\\(") >= 0, "item count not shown for table-selection");
		assert.notOk(aItems[1].getText().search("\\(") >= 0, "item count not shown for define conditions");
		assert.notOk(oTokenizerPanel.getHeaderText().search("\\(") >= 0, "item count not shown for Tokenizer title");

		oTable.destroy();
	});

	QUnit.test("with ConditionModel", function(assert) {
		oValueHelpPanel.placeAt("content");

		var oConditionModel = new ConditionModel();
		oConditionModel.addCondition("Quantity", Condition.createCondition("GT", [1]));

		var oDataType = new IntegerType();
		var oFormatOptions = {
				valueType: oDataType,
				maxConditions: -1
		};

		oValueHelpPanel.bindProperty("conditions", {path: 'cm>/conditions/Quantity'});
		oValueHelpPanel.setModel(oConditionModel, "cm");
		oValueHelpPanel.setFormatOptions(oFormatOptions);

		sap.ui.getCore().applyChanges();

		oValueHelpPanel.setShowTokenizer(false);
		oValueHelpPanel.setShowTokenizer(true);
		var aTokens = oValueHelpPanel._oTokenizer.getTokens();
		assert.equal(aTokens.length, 1, "one Token should exist inside Tokenizer");
		assert.equal(aTokens[0].getText(), ">1", "Token text");

		// remove the token from the Tokenizer
		var oToken = oValueHelpPanel._oTokenizer.getTokens()[0];
		oValueHelpPanel._oTokenizer.fireTokenDelete({ tokens: [oToken] });
		assert.equal(oConditionModel.getConditions("Quantity").length, 0, "ConditionModel should be empty");

		oDataType.destroy();
	});

	QUnit.test("remove all tokens", function(assert) {

		oValueHelpPanel.setConditions([
		                               Condition.createCondition("EQ", ["1", "Text"]),
		                               Condition.createCondition("EQ", ["2"])
		                               ]);
		sap.ui.getCore().applyChanges();

		var oButton = oValueHelpPanel.byId("removeAllBtn");
		oButton.firePress();

		var aConditions = oValueHelpPanel.getConditions();
		assert.equal(aConditions.length, 0, "No conditions");

	});

});
