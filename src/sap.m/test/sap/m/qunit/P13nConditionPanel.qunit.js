/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/P13nConditionPanel",
	"sap/ui/core/library",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/type/Time",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/odata/type/Boolean"
], function(
	createAndAppendDiv,
	P13nConditionPanel,
	coreLibrary,
	NumberFormat,
	String,
	Int16,
	Single,
	Double,
	Decimal,
	modelTypeDate,
	typeDate,
	Time,
	typeTime,
	DateTime,
	Boolean,
	typeBoolean
) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	// shortcut for sap.m.P13nConditionOperation (which is not exported by any other module)
	var P13nConditionOperation = sap.m.P13nConditionOperation;


	// prepare DOM
	createAndAppendDiv("content");



	(function() {
		QUnit.module("Properties", {
			beforeEach: function() {
			},
			afterEach: function() {
			}
		});

		var fillConditionPanel = function(oP13nConditionPanel) {
			var aOperations = [ P13nConditionOperation.BT,
							   P13nConditionOperation.EQ,
							   P13nConditionOperation.Contains,
							   P13nConditionOperation.StartsWith,
							   P13nConditionOperation.EndsWith,
							   P13nConditionOperation.LT,
							   P13nConditionOperation.LE,
							   P13nConditionOperation.GT ];

			var oKeyField1 = {key: "", text: "(none)"};
			var oKeyField2 = {key: "CompanyCode", text: "Code"};
			var oKeyField3 = {key: "CompanyName", text: "Name", type: "string", maxLength: "20"};
			var oKeyField4 = {key: "Date", text: "Date",  type: "date"};
			var oKeyField5 = {key: "column1", text: "Column1"};
			var oKeyField6 = {key: "Column2", text: "Column2"};
			var oKeyField7 = {key: "Numeric", text: "Numeric", type: "numeric", scale: "10", precision: "2"};
			var oKeyField8 = {key: "Time", text: "Time", type: "time"};
			var oKeyField9 = {key: "Boolean", text: "Boolean", type: "boolean"};
			var oKeyField10 = {key: "Numc", text: "Numc", type: "numc", formatSettings: { isDigitSequence: true, maxLength: 10}};
			var oKeyField11 = {key: "DateTime", text: "Date Time", type: "datetime", formatSettings: { displayFormat: "Date"}};
			var aKeyFields = [oKeyField1,oKeyField2,oKeyField3,oKeyField4,oKeyField5,oKeyField6,oKeyField7,oKeyField8,oKeyField9,oKeyField10,oKeyField11];

			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.BT, "keyField": "Numeric", "value1": "1", "value2": "10"};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyCode", "value1": "a", "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var aConditions = [oCondition0, oCondition1, oCondition2];


			oP13nConditionPanel.setKeyFields(aKeyFields);
			oP13nConditionPanel.setOperations(aOperations);
			oP13nConditionPanel.setConditions(aConditions);

		};


		QUnit.test("Default Values", function(assert) {

			var nItems = 0;

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel();

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "length of getConditions should be '" + nItems + "'");
			assert.strictEqual(oP13nConditionPanel.getKeyFields().length, nItems, "length of getKeyFields should be '" + nItems + "'");
			assert.strictEqual(oP13nConditionPanel.getOperations().length, nItems, "length of getOperations should be '" + nItems + "'");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("get/SetConditions test", function(assert) {

			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.Ascending, "keyField": "Date", "value1": "", "value2": ""};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.Ascending, "keyField": "CompanyCode", "value1": "", "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.Descending, "keyField": "CompanyName", "value1": "", "value2": ""};
			var aConditions = [oCondition0, oCondition1];

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			oP13nConditionPanel.setConditions(aConditions);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var nItems = 2;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");


			oP13nConditionPanel.addCondition(oCondition2);

			// assertions
			nItems = 3;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");


			oP13nConditionPanel.removeCondition(oCondition1);

			// assertions
			nItems = 2;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");


			oP13nConditionPanel.insertCondition(oCondition1);

			// assertions
			nItems = 3;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");


			oP13nConditionPanel.removeAllConditions();

			// assertions
			nItems = 0;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");

			// cleanup
			oP13nConditionPanel.destroy();
		});


		QUnit.test("get/SetKeyFields test", function(assert) {

			var oKeyField1 = {key: "", text: "(none)"};
			var oKeyField2 = {key: "CompanyCode", text: "Code"};
			var oKeyField3 = {key: "CompanyName", text: "Name"};
			var oKeyField4 = {key: "Date", text: "Date"};
			var oKeyField5 = {key: "column1", text: "Column1"};
			var oKeyField6 = {key: "Column2", text: "Column2"};
			var aKeyFields = [oKeyField1,oKeyField2,oKeyField3,oKeyField4,oKeyField5];

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});


			oP13nConditionPanel.setKeyFields(aKeyFields);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var nItems = 5;
			assert.strictEqual(oP13nConditionPanel.getKeyFields().length, nItems, "getKeyFields should return '" + nItems + "' items.");


			oP13nConditionPanel.addKeyField(oKeyField6);

			// assertions
			nItems = 6;
			assert.strictEqual(oP13nConditionPanel.getKeyFields().length, nItems, "getKeyFields should return '" + nItems + "' items.");


			oP13nConditionPanel.removeAllKeyFields();

			// assertions
			nItems = 0;
			assert.strictEqual(oP13nConditionPanel.getKeyFields().length, nItems, "getKeyFields should return '" + nItems + "' items.");

			// cleanup
			oP13nConditionPanel.destroy();
		});


		QUnit.test("get/SetOperations test", function(assert) {

			var aOperations = [ P13nConditionOperation.BT,
							   P13nConditionOperation.EQ,
							   P13nConditionOperation.Contains,
							   P13nConditionOperation.StartsWith,
							   P13nConditionOperation.EndsWith,
							   P13nConditionOperation.LT,
							   P13nConditionOperation.LE,
							   P13nConditionOperation.GT ];


			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			oP13nConditionPanel.setOperations(aOperations);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var nItems = 8;
			assert.strictEqual(oP13nConditionPanel.getOperations().length, nItems, "getOperations should return '" + nItems + "' items.");


			oP13nConditionPanel.addOperation(P13nConditionOperation.GE);

			// assertions
			nItems = 9;
			assert.strictEqual(oP13nConditionPanel.getOperations().length, nItems, "getOperations should return '" + nItems + "' items.");


			oP13nConditionPanel.removeAllOperations();

			// assertions
			nItems = 0;
			assert.strictEqual(oP13nConditionPanel.getOperations().length, nItems, "getOperations should return '" + nItems + "' items.");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("trigger add and remove test", function(assert) {

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			oP13nConditionPanel._handleRemoveCondition(oP13nConditionPanel._oConditionsGrid, oP13nConditionPanel._oConditionsGrid.getContent()[0]);

			var nItems = 2;
			assert.strictEqual(oP13nConditionPanel._oConditionsGrid.getContent().length, nItems, "# Condition grids should should be '" + nItems + "' after a Remove.");

			// assertions
			oP13nConditionPanel._handleAddCondition(oP13nConditionPanel._oConditionsGrid, oP13nConditionPanel._oConditionsGrid.getContent()[0]);

			nItems = 3;
			assert.strictEqual(oP13nConditionPanel._oConditionsGrid.getContent().length, nItems, "# Condition grids should should be '" + nItems + "' after a Remove.");


			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("_changeField does not remove condition if there is no event provided", function (assert) {

			// arrange
			var oConditionGrid, oConditionsMap,
				oP13nConditionPanel = new P13nConditionPanel({
				displayFormat: "Date"
				}),
				oCondition = {
					"key": "i1",
					"text": "",
					"operation": P13nConditionOperation.GT,
					"keyField": "Date",
					"value1": new Date(0),
					"value2": ""
				};

			fillConditionPanel(oP13nConditionPanel);
			oP13nConditionPanel.setConditions([oCondition]);
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// act
			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			oP13nConditionPanel._changeField(oConditionGrid);
			oConditionsMap = oP13nConditionPanel._oConditionsMap;

			// assert
			assert.ok(oConditionsMap.i1, "Condition is not removed");
			assert.equal(oConditionsMap.i1.value, "Date: >Jan 1, 1970", "Condition value is correct");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("change KeyField, Operation and Value test", function(assert) {

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[1];
			oConditionGrid.keyField.setSelectedKey("CompanyName");
			oP13nConditionPanel._handleSelectionChangeOnKeyField(oP13nConditionPanel._oConditionsGrid, oConditionGrid);

			var sKeyField = "CompanyName";
			assert.strictEqual(oP13nConditionPanel.getConditions()[1].keyField, sKeyField, "KeyFields of first condition must be '" + sKeyField + "'.");



			oConditionGrid.operation.setSelectedIndex(2);
			oP13nConditionPanel._handleChangeOnOperationField(oP13nConditionPanel._oConditionsGrid, oConditionGrid);

			var sOperation = "Contains";
			assert.strictEqual(oP13nConditionPanel.getConditions()[1].operation, sOperation, "Operation of first condition must be '" + sOperation + "'.");


			oConditionGrid.value1.setValue("foo");
			oP13nConditionPanel._changeField(oConditionGrid);

			var sValue1 = "foo";
			assert.strictEqual(oP13nConditionPanel.getConditions()[1].value1, sValue1, "Value1 of first condition must be '" + sValue1 + "'.");


			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("test ContainerMode", function(assert) {

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1,
				containerQuery : true
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			oP13nConditionPanel._handleAddCondition(oP13nConditionPanel._oConditionsGrid, oP13nConditionPanel._oConditionsGrid.getContent()[0]);

			assert.strictEqual(oP13nConditionPanel.getContainerQuery(), true, "ContainerQuery must be true!");


			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("test AlwaysShowAddIcon", function(assert) {

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1,
				alwaysShowAddIcon : true
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(oP13nConditionPanel.getAlwaysShowAddIcon(), true, "AlwaysShowAddIcon must be true!");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("test layoutMode", function(assert){

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1,
				layoutMode : "Desktop"
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(oP13nConditionPanel.getLayoutMode(), "Desktop", "LayoutMode must be Desktop!");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("new GroupCondition showIfGrouped must be true", function(assert) {
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.GroupAscending, "keyField": "CompanyCode", "value1": "", "value2": "", showIfGrouped: true};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.GroupDescending, "keyField": "CompanyName", "value1": "", "value2": "", showIfGrouped: false};
			var aConditions = [oCondition1, oCondition2];

			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			oP13nConditionPanel.setConditions(aConditions);
			oP13nConditionPanel.setKeyFields([{key: "CompanyCode", text: "Code"}, {key: "CompanyName", text: "Name"}, {key: "group3", text: "Group3"}]);
			oP13nConditionPanel.setOperations([ P13nConditionOperation.GroupAscending, P13nConditionOperation.GroupDescending ]);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var nItems = 2;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");

			oP13nConditionPanel._handleAddCondition(oP13nConditionPanel._oConditionsGrid, oP13nConditionPanel._oConditionsGrid.getContent()[1]);
			oP13nConditionPanel._oConditionsGrid.getContent()[2].keyField.setSelectedKey("group3");

			nItems = 3;
			assert.strictEqual(oP13nConditionPanel._oConditionsGrid.getContent().length, nItems, "# Condition grids should should be '" + nItems + "' after an Add.");
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "getConditions should return '" + nItems + "' items.");
			assert.ok(oP13nConditionPanel.getConditions()[2].showIfGrouped, "showIfGrouped value should return true");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		/* QUnit.test("testing Paste in value fields", function(assert) {
			// system under test
			var oP13nConditionPanel = new sap.m.P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			oConditionGrid.value1.onpaste( {});

			// assertions
			//assert.strictEqual(oP13nConditionPanel.getLayoutMode(), "Desktop", "LayoutMode must be Desktop!");

			// cleanup
			oP13nConditionPanel.destroy();
		}); */

		QUnit.test("testing maxLength of KeyField", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[2];
			//oConditionGrid.value1.onpaste();

			// assertions
			assert.strictEqual(oConditionGrid.value1.getMaxLength(), 20, "maxLength must be 20!");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("validate conditions", function(assert){
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			// make the between condition invalid
			oConditionGrid.value1.setValue("");

			oP13nConditionPanel.validateConditions();

			// assertions
			assert.strictEqual(oConditionGrid.value1.getValueState(), ValueState.Warning, "ValueState must be Warning!");

			oP13nConditionPanel.removeValidationErrors();
			assert.strictEqual(oConditionGrid.value1.getValueState(), ValueState.None, "ValueState must be None!");

			oP13nConditionPanel.validateConditions();
			oP13nConditionPanel.removeInvalidConditions();
			var nItems = 2;
			assert.strictEqual(oP13nConditionPanel.getConditions().length, nItems, "length of getConditions should be '" + nItems + "'");


			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("testing condition paginator", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(!!oP13nConditionPanel._bPaginatorButtonsVisible, false, "Paginator buttons are not shown!");

			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.BT, "keyField": "CompanyCode", "value1": "1", "value2": "10"};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyCode", "value1": "a", "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition3 = { "key": "i3", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition4 = { "key": "i4", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition5 = { "key": "i5", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition6 = { "key": "i6", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition7 = { "key": "i7", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition8 = { "key": "i8", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition9 = { "key": "i9", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var oCondition10 = { "key": "i10", "text": "", "operation": P13nConditionOperation.LT, "keyField": "CompanyName", "value1": "g", "value2": ""};
			var aConditions = [oCondition0, oCondition1, oCondition2, oCondition3, oCondition4, oCondition5, oCondition6, oCondition7, oCondition8, oCondition9, oCondition10];
			oP13nConditionPanel.setConditions(aConditions);

			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(!!oP13nConditionPanel._bPaginatorButtonsVisible, true, "Paginator buttons are shown!");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("testing keyField types", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyName", "value1": "foo", "value2": ""};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "Date", "value1": new Date(0), "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "Time", "value1": new Date(0), "value2": ""};
			var oCondition3 = { "key": "i3", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "Boolean", "value1": true, "value2": ""};
			var oCondition4 = { "key": "i4", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "Numeric", "value1": 1.5, "value2": ""};
			var oCondition5 = { "key": "i5", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "Numc", "value1": "0000001234", "value2": ""};
			var oCondition6 = { "key": "i6", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "DateTime", "value1": new Date(0), "value2": ""};
			oP13nConditionPanel.setConditions([oCondition0, oCondition1, oCondition2, oCondition3, oCondition4, oCondition5, oCondition6]);

			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			assert.strictEqual(oConditionGrid.value1.getValue(), "foo", "value1 of condition 0  must be foo!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[1];
			var d = new Date(0);
			assert.strictEqual(oConditionGrid.value1.getDateValue().toDateString(), d.toDateString(),  "value1 of condition 1 must be date!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[2];
			assert.strictEqual(oConditionGrid.value1.getDateValue().toTimeString(), d.toTimeString(),  "value1 of condition 2 must be time!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[3];
			assert.strictEqual(oConditionGrid.value1.getSelectedIndex(), 2, "value1 of condition 3 must be select control with selected index 2!");

			var oFormatter = NumberFormat.getFloatInstance();
			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[4];
			assert.equal(oFormatter.parse(oConditionGrid.value1.getValue()), 1.5, "value1 of condition 4 must be number 1.5");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[5];
			assert.equal(oConditionGrid.value1.getValue(), "1234", "value1 of condition 5 must be 1234");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[6];
			assert.equal(oConditionGrid.value1.getValue(), "Jan 1, 1970", "value1 of condition 5 must be 'Jan 1, 1970'");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("testing keyField typeInstance", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			var aOperations = [ P13nConditionOperation.BT,
				P13nConditionOperation.EQ,
				P13nConditionOperation.Contains,
				P13nConditionOperation.StartsWith,
				P13nConditionOperation.EndsWith,
				P13nConditionOperation.LT,
				P13nConditionOperation.LE,
				P13nConditionOperation.GT ];

			var oKeyField2 = {key: "CompanyCode", text: "Code", typeInstance: new String()};
			var oKeyField3 = {key: "CompanyName", text: "Name", typeInstance: new String({}, {maxLength: 20})};
			var oKeyField5 = {key: "int16", text: "int16", typeInstance: new Int16()};
			var oKeyField6 = {key: "single", text: "single", typeInstance: new Single({maxIntegerDigits: 5, maxFractionDigits: 2})};
			var oKeyField7 = {key: "double", text: "double", typeInstance: new Double({maxIntegerDigits: 10,maxFractionDigits: 3})};
			var oKeyField8 = {key: "decimal", text: "decimal", typeInstance: new Decimal({}, {precision: 24,scale: 3})};
			var oKeyField9 = {key: "date", text: "date", typeInstance: new modelTypeDate({UTC: false,style: "long",strictParsing: true})};
			var oKeyField10 = {key: "odatadate", text: "odata date", typeInstance: new typeDate({UTC: false, style: "long", strictParsing: true})};
			var oKeyField11 = {key: "time", text: "time", typeInstance: new Time({UTC: false, style: "short", strictParsing: true})};
			var oKeyField12 = {key: "odatatime", text: "odata time", typeInstance: new typeTime({UTC: false, style: "short", strictParsing: true})};
			var oKeyField13 = {key: "datetime", text: "Datetime", typeInstance: new DateTime({UTC: false, style: "short", strictParsing: true}, {displayFormat: "Date"})};
			var oKeyField14 = {key: "numc", text: "Numc", typeInstance: new String({}, {isDigitSequence: true, maxLength: 10})};
	//		var oKeyField15= {key: "stringdate", text: "StringDate", typeInstance: new sap.ui.comp.odata.type.StringDate({UTC: false, style: "long", strictParsing: true})};
			var oKeyField16 = {key: "boolean", text: "boolean", typeInstance: new Boolean()};
			var oKeyField17 = {key: "odatabool", text: "odata Bool", typeInstance: new typeBoolean()};
			var aKeyFields = [oKeyField2,oKeyField3,oKeyField5,oKeyField6,oKeyField7,oKeyField8,oKeyField9,oKeyField10,oKeyField11,oKeyField12,oKeyField13,oKeyField14,oKeyField16,oKeyField17];

			oP13nConditionPanel.setKeyFields(aKeyFields);
			oP13nConditionPanel.setOperations(aOperations);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyName", "value1": "foo", "value2": ""};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyName", "value1": "1234567890123456789012", "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "int16", "value1": 30000, "value2": ""};
			var oCondition3 = { "key": "i3", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "single", "value1": 1.5, "value2": ""};
			var oCondition4 = { "key": "i4", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "double", "value1": 15000.67, "value2": ""};
			var oCondition5 = { "key": "i5", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "decimal", "value1": "15000.67", "value2": ""};
			var oCondition6 = { "key": "i6", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "date", "value1": new Date(0), "value2": ""};
			var oCondition7 = { "key": "i7", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "time", "value1": new Date(0), "value2": ""};
			var oCondition8 = { "key": "i8", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "numc", "value1": "0000000011", "value2": ""};
			var oCondition9 = { "key": "i9", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "boolean", "value1": true, "value2": ""};
			var oCondition10 = { "key": "i10", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "odatabool", "value1": true, "value2": ""};
			var oCondition11 = { "key": "i11", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "datetime", "value1": new Date(0), "value2": ""};

			oP13nConditionPanel.setConditions([oCondition0, oCondition1, oCondition2, oCondition3, oCondition4, oCondition5, oCondition6, oCondition7, oCondition8, oCondition9]);

			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			assert.strictEqual(oConditionGrid.value1.getValue(), "foo", "value1 of condition 0 must be foo!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[1];
			assert.strictEqual(oConditionGrid.value1.getValue(), "1234567890123456789012", "value1 of condition 1 must be 1234567890123456789012");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[2];
			assert.strictEqual(oConditionGrid.value1.getValue(), "30,000",  "value1 of condition 2 must be 30,000");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[3];
			assert.strictEqual(oConditionGrid.value1.getValue(), "1.5", "value1 of condition 3 must be 1.5!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[4];
			assert.equal(oConditionGrid.value1.getValue(), "15,000.67", "value1 of condition 4 must be number 15,000.67");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[5];
			assert.equal(oConditionGrid.value1.getValue(), "15,000.670", "value1 of condition 5 must be number 15,000.670");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[6];
			var d = new Date(0);
			assert.equal(oConditionGrid.value1.getDateValue().toDateString(), d.toDateString(), "value1 of condition 6 must be " + d.toDateString());

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[7];
			assert.equal(oConditionGrid.value1.getDateValue().toTimeString(), d.toTimeString(), "value1 of condition 7 must be " + d.toDateString());

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[8];
			assert.equal(oConditionGrid.value1.getValue(), "11", "value1 of condition 8 must be 11");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[9];
			assert.equal(oConditionGrid.value1.getSelectedIndex(), 2, "value1 of condition 9 must be true");


			oP13nConditionPanel.setConditions([oCondition10, oCondition11]);
			sap.ui.getCore().applyChanges();

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			assert.equal(oConditionGrid.value1.getSelectedIndex(), 2, "value1 of condition 0 must be true");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[1];
			assert.equal(oConditionGrid.value1.getValue(), "1/1/70", "value1 of condition 1 must be '1/1/70'");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.test("testing empty operator", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});

			var aOperations = [
				P13nConditionOperation.EQ,
				P13nConditionOperation.Empty];

			var oKeyField2 = {key: "CompanyName", text: "Name", typeInstance: new String()};
			var oKeyField5 = {key: "int16", text: "int16", typeInstance: new Int16()};
			var aKeyFields = [oKeyField2,oKeyField5];

			oP13nConditionPanel.setKeyFields(aKeyFields);
			oP13nConditionPanel.setOperations(aOperations); //, "string");

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyName", "value1": "foo", "value2": ""};
			var oCondition1 = { "key": "i1", "text": "", "operation": P13nConditionOperation.Empty, "keyField": "CompanyName", "value1": "xxx", "value2": ""};
			var oCondition2 = { "key": "i2", "text": "", "operation": P13nConditionOperation.Empty, "keyField": "int16", "value1": 1, "value2": ""};

			oP13nConditionPanel.setConditions([oCondition0, oCondition1, oCondition2]);

			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[0];
			assert.strictEqual(oConditionGrid.value1.getValue(), "foo", "value1 of condition 0 must be foo!");
			assert.strictEqual(oConditionGrid.value1.getVisible(), true, "value1 control is visible!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[1];
			assert.strictEqual(oConditionGrid.value1.getVisible(), false, "value1 control is NOT visible!");

			oConditionGrid = oP13nConditionPanel._oConditionsGrid.getContent()[2];
			assert.strictEqual(oConditionGrid.value1.getVisible(), false, "value1 control is NOT visible!");

			// cleanup
			oP13nConditionPanel.destroy();
		});


		QUnit.test("testing suggest callback", function(assert) {
			// system under test
			var oP13nConditionPanel = new P13nConditionPanel({
				maxConditions: -1
			});
			oP13nConditionPanel._fSuggestCallback = function(oControl, sKey) {
				return {};
			};
			var spy = sinon.spy(oP13nConditionPanel, "_fSuggestCallback");
			fillConditionPanel(oP13nConditionPanel);

			// arrange
			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			var oCondition0 = { "key": "i0", "text": "", "operation": P13nConditionOperation.EQ, "keyField": "CompanyName", "value1": "foo", "value2": ""};
			oP13nConditionPanel.setConditions([oCondition0]);

			oP13nConditionPanel.placeAt("content");
			sap.ui.getCore().applyChanges();

			// assertions
			assert.strictEqual(spy.called, true, "suggest callback called!");

			// cleanup
			oP13nConditionPanel.destroy();
		});

		QUnit.module("Date Format Options BCP: 0020751294 0000389830 2019", {
			beforeEach: function () {
				this.oCP = new P13nConditionPanel();
			},
			afterEach: function () {
				this.oCP.destroy();
			},
			getFirstDatePicker: function () {
				return this.oCP.findAggregatedObjects(true, function (oControl) {
					return oControl.isA("sap.m.DatePicker");
				})[0];
			}
		});

		QUnit.test("style property", function(assert) {
			// Arrange
			var oTypeInstance = new modelTypeDate(),
				oDateFieldObject,
				oDatePicker;

			oTypeInstance.setFormatOptions({style: "short"});
			oDateFieldObject = {key: "Date", text: "Date", type: "date", typeInstance: oTypeInstance};

			// Act
			this.oCP.setKeyFields([oDateFieldObject]);

			// Assert
			oDatePicker = this.getFirstDatePicker();
			assert.strictEqual(oDatePicker.getDisplayFormat(), "short", "Display format should equal 'short'.");

			// Act
			oTypeInstance.setFormatOptions({style: "long", pattern: "YYYY-MM-DD"});
			this.oCP.setKeyFields([oDateFieldObject]);

			// Assert
			oDatePicker = this.getFirstDatePicker();
			assert.strictEqual(oDatePicker.getDisplayFormat(), "long",
				"Display format should equal 'long' and 'style' should take precedence over 'pattern'.");
		});

		QUnit.test("pattern property", function (assert) {
			// Arrange
			var oTypeInstance = new modelTypeDate(),
				oDateFieldObject,
				oDatePicker;

			oTypeInstance.setFormatOptions({pattern: "YYYY-MM-DD"});
			oDateFieldObject = {key: "Date", text: "Date", type: "date", typeInstance: oTypeInstance};

			// Act
			this.oCP.setKeyFields([oDateFieldObject]);

			// Assert
			oDatePicker = this.getFirstDatePicker();
			assert.strictEqual(oDatePicker.getDisplayFormat(), "YYYY-MM-DD",
				"Display format should equal 'YYYY-MM-DD'.");
		});

	}());
});
