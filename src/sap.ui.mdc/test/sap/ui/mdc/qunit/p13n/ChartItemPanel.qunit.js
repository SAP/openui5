/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/ChartItemPanel", "sap/ui/model/json/JSONModel", "sap/m/VBox", "sap/ui/thirdparty/sinon", "sap/ui/test/actions/Press", "sap/ui/core/Core", "sap/ui/core/library"
], function (ChartItemPanel, JSONModel, VBox, sinon, Press, oCore, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;
	var MDCRb = oCore.getLibraryResourceBundle("sap.ui.mdc");

	var oChartConfig = {
		allowedLayoutOptions: ["axis1", "category", "series"], templateConfig: [{kind: "Dimension"},{kind: "Measure"}]
	};

	oCore.applyChanges();

	QUnit.module("ChartItemPanelNew Unit tests", {
		beforeEach: function(){

			var aItems = [
				{
					label: "Test",
					name: "test",
					visible: true,
					kind: "Dimension",
					role: "category"
				},
				{
					label: "Test2",
					name: "test2",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test3",
					name: "test3",
					visible: true,
					kind: "Measure",
					role: "axis1"
				},
				{
					label: "Test4",
					name: "test4",
					visible: false,
					kind: "Measure",
					role: "axis1"
				}
			];

			this.oChartItemPanel = new ChartItemPanel({panelConfig: oChartConfig});
			this.oChartItemPanel.setP13nData(aItems);
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});

	QUnit.test("instantiate ChartItemPanel", function(assert){
		//var done = assert.async();
		assert.ok(this.oChartItemPanel);

		assert.ok(this.oChartItemPanel._oListControl, "Inner list control created");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly"); //3 visible Items, 2 Group Headers, 2 Templates
		assert.ok(this.oChartItemPanel.getEnableReorder(), "EnableReorder property is set to true");
		assert.ok(this.oChartItemPanel.getAggregation("_content") instanceof VBox, "Panel contains a VBox");
		assert.ok(this.oChartItemPanel.getAggregation("_content").getItems()[0].isA("sap.m.Table"), "VBox contains a table");
		assert.ok(this.oChartItemPanel._sContainerResizeListener, "Resize listener is created");

	}.bind(this));

	QUnit.test("_switchMobileMode", function(assert){
		var oCreateListControlSpy = sinon.spy(this.oChartItemPanel, "_createInnerListControl");
		var oBindListItemsSpy = sinon.spy(this.oChartItemPanel, "_bindListItems");
		assert.ok(!this.oChartItemPanel._bMobileMode, "Mobile mode is set to false");

		//Call with bMobile = false
		this.oChartItemPanel._switchMobileMode(false);
		assert.ok(!oCreateListControlSpy.called, "Table should not have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 3, "Table content has correct amount of cells");
		assert.ok(!oBindListItemsSpy.called, "List items were not rebound");

		//Call with bMobile = true
		this.oChartItemPanel._switchMobileMode(true);
		assert.ok(oCreateListControlSpy.calledOnce, "Table should have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 2, "Table content has correct amount of cells");
		assert.ok(oBindListItemsSpy.calledOnce, "List items were rebound");

		//Call with bMobile = false
		this.oChartItemPanel._switchMobileMode(false);
		assert.ok(oCreateListControlSpy.calledTwice, "Table should have changed");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");
		assert.ok(this.oChartItemPanel._oListControl.getItems()[1].getCells().length == 3, "Table content has correct amount of cells");
		assert.ok(oBindListItemsSpy.calledTwice, "List items were rebound");

	}.bind(this));

	QUnit.test("_bindListItems", function(assert){
		var oBindItemsSpy = sinon.spy(this.oChartItemPanel._oListControl, "bindItems");

		this.oChartItemPanel._bindListItems();

		assert.ok(oBindItemsSpy.calledOnce, "Items were bound to table");
		assert.ok(this.oChartItemPanel._oListControl.getItems().length == 7, "Table is filled correctly");

	}.bind(this));

	QUnit.test("_getPlaceholderTextForKind", function(assert){
		assert.ok(this.oChartItemPanel._getPlaceholderTextForTemplate() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER'), "Templatecorrect placeholder text");
	}.bind(this));

	QUnit.test("_getRoleSelect", function(assert){
		var oSelect = this.oChartItemPanel._getRoleSelect("Measure");

		assert.ok(oSelect.isA("sap.m.Select"), "Select is returned");
	}.bind(this));

	QUnit.test("_getNameComboBox", function(assert){
		var oSelect = this.oChartItemPanel._getNameComboBox("Measure");

		assert.ok(oSelect.isA("sap.m.ComboBox"), "ComboBox is returned");
	}.bind(this));

	QUnit.test("_updateAvailableRolesForItems", function(assert){
		//Arrange
		var aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		assert.ok(aItems.length == 6, "6 items are inside p13n model"); // 4 items + 2 templates

		aItems[0].availableRoles = [{"key": "axis1", "text": "Axis 1"}, {"key": "axis2", "text": "Axis 2"}, {"key": "axis3", "text": "Axis 3"}];
		this.oChartItemPanel._getP13nModel().setProperty("/items", aItems);

		//Act
		this.oChartItemPanel._updateAvailableRolesForItems();

		//Assert
		aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		assert.ok(aItems.length == 6, "6 items are inside p13n model");
		assert.ok(aItems[0].availableRoles.length == 1, "Incorrect roles have been deleted");
		assert.ok(aItems[0].availableRoles[0].key == "axis1", "Correct role was kept");

	}.bind(this));


	QUnit.test("onPressHide", function(assert){
		var done = assert.async();
		var oMockEvent = {getSource : function(){return {data : function(){return {propertyName: "test3"};}};}};
		var oUpdateIndexesSpy = sinon.spy(this.oChartItemPanel, "_updateVisibleIndexes");
		assert.ok(this.oChartItemPanel.getP13nData()[2].visible, "Item3 is visible");

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(!oEvent.getParameter("items").visible, "Item3 is invisible in parameter events");
			done();
		});

		this.oChartItemPanel._onPressHide(oMockEvent);

		assert.ok(oUpdateIndexesSpy.calledOnce, "Visible Index update called");
		assert.ok(!this.oChartItemPanel.getP13nData()[2].visible, "Item3 is invisible");

	}.bind(this));

	QUnit.test("setP13nData", function(assert){
		var oUpdateIndexesSpy = sinon.spy(this.oChartItemPanel, "_updateVisibleIndexes");
		var aItems = [
			{
				label: "Test-New",
				name: "test-new",
				visible: true,
				kind: "Dimension"
			},
			{
				label: "Test2-New",
				name: "test2-new",
				visible: true,
				kind: "Measure"
			}
		];

		this.oChartItemPanel.setP13nData(aItems);

		assert.ok(this.oChartItemPanel.getP13nData().length == 2, "Model has correct amount of items");
		assert.ok(this.oChartItemPanel.getP13nData()[0].availableRoles, "Item was updated with available Roles");
		assert.ok(!this.oChartItemPanel.getP13nData()[0].template, "Template property was added");
		assert.ok(this.oChartItemPanel.getP13nData()[1].availableRoles, "Item was updated with available Roles");
		assert.ok(!this.oChartItemPanel.getP13nData()[1].template, "Template property was added");
		assert.ok(oUpdateIndexesSpy.calledOnce, "Visible Index update called");

	}.bind(this));

	QUnit.test("_updateVisibleIndexes", function(assert){
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Dimension").length = 1, "Map contains one visible dimension");
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Measure").length = 2, "Map contains two visible measures");

		var aItems = this.oChartItemPanel._getP13nModel().getProperty("/items");
		aItems[0].visible = false;

		this.oChartItemPanel._updateVisibleIndexes();

		assert.ok(!this.oChartItemPanel._mVisibleIndexes.get("Dimension"), "No map entry exist for Dimensions");
		assert.ok(this.oChartItemPanel._mVisibleIndexes.get("Measure").length = 2, "Map contains two visible measures");
	}.bind(this));

	//TODO: OnChangeOfTemplateName

	QUnit.test("_getTemplateItems", function(assert){
		var aTemplates = this.oChartItemPanel._getTemplateItems();

		assert.ok(aTemplates.length == 2, "Two templates created");
		assert.ok(aTemplates[0].kind == "Dimension", "Template for Dimension was created");
		assert.ok(aTemplates[1].kind == "Measure", "Template for Measure was created");
	}.bind(this));

	QUnit.test("_getListControlConfig", function(assert){
		var oConfig = this.oChartItemPanel._getListControlConfig();

		assert.ok(oConfig.columns.length == 3, "3 Columns were created");
		assert.ok(oConfig.columns[0].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION'), "Column 1 has correct text");
		assert.ok(oConfig.columns[1].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_ROLE'), "Column 2 has correct text");
		assert.ok(oConfig.mode == "None", "Mode was set to None");

		this.oChartItemPanel._bMobileMode = true;
		oConfig = this.oChartItemPanel._getListControlConfig();
		assert.ok(oConfig.columns.length == 2, "2 Columns were created for mobile");
		assert.ok(oConfig.columns[0].getHeader().getText() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_DESCRIPTION')  + " / " + MDCRb.getText('chart.PERSONALIZATION_DIALOG_COLUMN_ROLE'), "Column 1 has correct text");
		assert.ok(oConfig.mode == "None", "Mode was set to None");
	}.bind(this));

	QUnit.test("_getCleanP13nItems", function(assert){
		assert.ok(this.oChartItemPanel._getCleanP13nItems().filter(function(it){return it.template;}).length == 0, "Template not inside clean p13n state");
		assert.ok(this.oChartItemPanel._getCleanP13nItems().length == 4, "Clean p13n state has correct length");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[0].name == "test", "Item 1 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[1].name == "test2", "Item 2 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[2].name == "test3", "Item 3 has correct name");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[3].name == "test4", "Item 4 has correct name");
	}.bind(this));

	QUnit.test("_fireChangeItems", function(assert){
		var done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "change event has been fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");

			assert.ok(oEvent.getParameter("items")[0].columnKey == "test", "Item 1 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[0].index == 0, "Item 1 has correct index");
			assert.ok(oEvent.getParameter("items")[0].visible, "Item 1 has correct visibility");
			assert.ok(oEvent.getParameter("items")[0].role == "category", "Item 1 has correct role");

			assert.ok(oEvent.getParameter("items")[1].columnKey == "test2", "Item 2 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[1].index == 1, "Item 2 has correct index");
			assert.ok(oEvent.getParameter("items")[1].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[1].role == "axis1", "Item 2 has correct role");

			assert.ok(oEvent.getParameter("items")[2].columnKey == "test3", "Item 3 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[2].index == 2, "Item 2 has correct index");
			assert.ok(oEvent.getParameter("items")[2].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[2].role == "axis1", "Item 3 has correct role");

			assert.ok(oEvent.getParameter("items")[3].columnKey == "test4", "Item 4 has correct columnKey");
			assert.ok(oEvent.getParameter("items")[3].index == 3, "Item 2 has correct index");
			assert.ok(!oEvent.getParameter("items")[3].visible, "Item 2 has correct visibility");
			assert.ok(oEvent.getParameter("items")[3].role == "axis1", "Item 4 has correct role");
			done();
		});

		this.oChartItemPanel._fireChangeItems();

	}.bind(this));

	QUnit.test("_updateEnableOfMoveButtons", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[1];

		//Select first dimension
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(!this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button disabled");
		assert.ok(!this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button disabled");
		assert.ok(!this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button disabled");
		assert.ok(!this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button disabled");

		//Select first measure
		oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(!this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button disabled");
		assert.ok(!this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button disabled");
		assert.ok(this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button enabled");
		assert.ok(this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button enabled");

		//Select second measure
		oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		this.oChartItemPanel._updateEnableOfMoveButtons(oTableItem);
		assert.ok(this.oChartItemPanel._getMoveTopButton().getEnabled(), "Top button enabled");
		assert.ok(this.oChartItemPanel._getMoveUpButton().getEnabled(), "Up button enabled");
		assert.ok(!this.oChartItemPanel._getMoveDownButton().getEnabled(), "Down button disabled");
		assert.ok(!this.oChartItemPanel._getMoveBottomButton().getEnabled(), "Bottom button disabled");

	}.bind(this));

	QUnit.test("_getMoveTopButton", function(assert){
		var oBtn = this.oChartItemPanel._getMoveTopButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveUpButton", function(assert){
		var oBtn = this.oChartItemPanel._getMoveUpButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveDownButton", function(assert){
		var oBtn = this.oChartItemPanel._getMoveDownButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getMoveBottomButton", function(assert){
		var oBtn = this.oChartItemPanel._getMoveBottomButton();
		assert.ok(oBtn, "Button exists");
		assert.ok(oBtn.isA("sap.m.Button"), "Button is type of sap.m.Button");

	}.bind(this));

	QUnit.test("_getListItemFromMoveButton & _addMoveButtons", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[1];

		this.oChartItemPanel._addMoveButtons(oTableItem);

		var oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveTopButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveUpButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveDownButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

		oListItem = this.oChartItemPanel._getListItemFromMoveButton(this.oChartItemPanel._getMoveBottomButton());
		assert.ok(oListItem, "ListItem exists");
		assert.ok(oListItem == oTableItem, "Button parent is correct");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToTop", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		var oEvent = {getSource : function() {return this.oChartItemPanel._getMoveTopButton();}.bind(this)};
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveToTop(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(1), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToUp", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[5];
		var oEvent = {getSource : function() {return this.oChartItemPanel._getMoveUpButton();}.bind(this)};
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveUp(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(1), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToDown", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		var oEvent = {getSource : function() {return this.oChartItemPanel._getMoveDownButton();}.bind(this)};
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveDown(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(2), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_onPressButtonMoveToBottom", function(assert){
		var oTableItem = this.oChartItemPanel._oListControl.getItems()[4];
		var oEvent = {getSource : function() {return this.oChartItemPanel._getMoveBottomButton();}.bind(this)};
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveSelectedItem");
		this.oChartItemPanel._addMoveButtons(oTableItem);

		this.oChartItemPanel._onPressButtonMoveToBottom(oEvent);

		assert.ok(oMoveSpy.calledWithExactly(2), "_moveSelectedItem was called");

	}.bind(this));

	QUnit.test("_moveItemsByIndex", function(assert){
		var oUpdateMoveSpy = sinon.spy(this.oChartItemPanel, "_updateEnableOfMoveButtons");
		var oHandleActivatedSpy = sinon.spy(this.oChartItemPanel, "_handleActivated");
		var done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._moveItemsByIndex(1,2);

		assert.ok(this.oChartItemPanel._getCleanP13nItems()[1].name == "test3", "Item was moved");
		assert.ok(this.oChartItemPanel._getCleanP13nItems()[2].name == "test2", "Item was moved");
		assert.ok(oUpdateMoveSpy.called, "UpdateMoveButtons was called");
		assert.ok(oHandleActivatedSpy, "_handleActivated was called");

	}.bind(this));

	QUnit.test("_getModelItemByTableItem", function(assert){
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[1]).name == "test", "_getModelItemByTableItem retured correct item for table row");
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[4]).name == "test2", "_getModelItemByTableItem retured correct item for table row");
		assert.ok(this.oChartItemPanel._getModelItemByTableItem(this.oChartItemPanel._oListControl.getItems()[5]).name == "test3", "_getModelItemByTableItem retured correct item for table row");
	}.bind(this));

	QUnit.test("_getMoveConfigForTableItem", function(assert){
		var oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[0]);
		assert.ok(oConfig == undefined, "No config returned for grouping row");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[1]);
		assert.ok(oConfig.aggregationRole == "Dimension", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 0, "Correct index returned returned");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[2]);
		assert.ok(oConfig.aggregationRole == "Dimension", "Correct aggregation role returned");
		assert.ok(oConfig.template == true, "Template field set");
		assert.ok(oConfig.currentIndex == 4, "Correct index returned returned"); //Templates are always at end of array due to sorting

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[3]);
		assert.ok(oConfig == undefined, "No config returned for grouping row");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[4]);
		assert.ok(oConfig.aggregationRole == "Measure", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 1, "Correct index returned returned");

		oConfig = this.oChartItemPanel._getMoveConfigForTableItem(this.oChartItemPanel._oListControl.getItems()[5]);
		assert.ok(oConfig.aggregationRole == "Measure", "Correct aggregation role returned");
		assert.ok(oConfig.template == false, "Template field not set");
		assert.ok(oConfig.currentIndex == 2, "Correct index returned returned");

	}.bind(this));

	QUnit.test("_onRearrange with dropPosition \"After\"", function(assert){
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		var oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[5],
			dropPosition: "After"
		};

		var oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		}};

		var done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(oMoveSpy.calledWithExactly(1,2), "moveItemsByIndex was called with correct parameters");

	}.bind(this));

	QUnit.test("_onRearrange with dropPosition \"Before\"", function(assert){
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		var oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[5],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[4],
			dropPosition: "Before"
		};

		var oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		}};

		var done = assert.async();

		this.oChartItemPanel.attachEvent("changeItems", function(oEvent){
			assert.ok(oEvent, "ChangeItems event was fired");
			assert.ok(oEvent.getParameter("items").length == 4, "Event has items parameter with correct length");
			assert.ok(oEvent.getParameter("items")[1].columnKey == "test3", "Item was moved");
			assert.ok(oEvent.getParameter("items")[2].columnKey == "test2", "Event has items parameter with correct length");
			done();
		});

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(oMoveSpy.calledWithExactly(2,1), "moveItemsByIndex was called with correct parameters");

	}.bind(this));

	QUnit.test("_onRearrange with invalid drop position on group row", function(assert){
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		var oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[3],
			dropPosition: "Before"
		};

		var oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		},
		preventDefault: function(){}};

		var oPreventDefaultSpy = sinon.spy(oMockEvent, "preventDefault");

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(!oMoveSpy.called, "moveItemsByIndex was not called");
		assert.ok(oPreventDefaultSpy.calledOnce, "preventDefault was called on event");

	}.bind(this));

	QUnit.test("_onRearrange with invalid drop position on different aggration role", function(assert){
		var oMoveSpy = sinon.spy(this.oChartItemPanel, "_moveItemsByIndex");

		var oMockParams = {
			draggedControl: this.oChartItemPanel._oListControl.getItems()[4],
			droppedControl: this.oChartItemPanel._oListControl.getItems()[1],
			dropPosition: "Before"
		};

		var oMockEvent = {getParameter : function(sParam){
			return oMockParams[sParam];
		},
		preventDefault: function(){}};

		var oPreventDefaultSpy = sinon.spy(oMockEvent, "preventDefault");

		this.oChartItemPanel._onRearrange(oMockEvent);

		assert.ok(!oMoveSpy.called, "moveItemsByIndex was not called");
		assert.ok(oPreventDefaultSpy.calledOnce, "preventDefault was called on event");

	}.bind(this));


	QUnit.module("SortPanel API only tests", {
		beforeEach: function(){
			this.oChartItemPanel = new ChartItemPanel();
			this.oChartItemPanel.placeAt("qunit-fixture");
		}.bind(this),
		afterEach: function(){
			this.oChartItemPanel.destroy();
		}.bind(this)
	});


	QUnit.test("Template ComboBox tests", function(assert){
		var oComboBox = this.oChartItemPanel._getTemplateComboBox("Measure");
		var mockEvent = {getSource: function(){return oComboBox;}};

		//Override for test
		this.oChartItemPanel._getCleanP13nItems = function(){return [];};

		assert.ok(oComboBox.isA("sap.m.ComboBox"), "ComboBox is returned");
		assert.ok(oComboBox.getPlaceholder() == MDCRb.getText('chart.PERSONALIZATION_DIALOG_TEMPLATE_PLACEHOLDER'), "ComboBox has correct placeholder");

		oComboBox.setValue("1234");
		this.oChartItemPanel.onChangeOfTemplateName(mockEvent);
		assert.equal(oComboBox.getValueState(), ValueState.Error, "Template ComboBox has error state");

		oComboBox.setValue("");
		this.oChartItemPanel.onChangeOfTemplateName(mockEvent);
		assert.equal(oComboBox.getValueState(), ValueState.None, "Error state is reset");


	}.bind(this));

	QUnit.test("_createListItem", function(assert){
		var oMockModelContext = {getObject : function(){return {kind: "Measure", name: "test5"};}};

		var oListItem = this.oChartItemPanel._createListItem("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 3, "List Item has 3 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[1].isA("sap.m.Select"), "Cell 2 is of type sap.m.Select");
		assert.ok(oListItem.getCells()[2].isA("sap.m.HBox"), "Cell 3 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[2].getItems().length == 1, "Cell 3 contains one item");
		assert.ok(oListItem.getCells()[2].getItems()[0].isA("sap.m.Button"), "Cell 3 contains a button");
		assert.ok(oListItem.getCells()[2].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[2].getItems()[0].getType() == "Transparent", "Button transparent");

	}.bind(this));

	QUnit.test("_createListItem with template", function(assert){
		var oMockModelContext = {getObject : function(){return {kind: "TestKind", template: true};}};

		var oListItem = this.oChartItemPanel._createListItem("anyId", oMockModelContext);

		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 1, "List Item has 1 cell");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");

	}.bind(this));

	QUnit.test("_createListItemMobile", function(assert){
		var oMockModelContext = {getObject : function(){return {kind: "Measure", name: "test6"};}};

		var oListItem = this.oChartItemPanel._createListItemMobile("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 2, "List Item has 2 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.VBox"), "Cell 1 is of type VBox");
		assert.ok(oListItem.getCells()[0].getItems().length == 2, "VBox has 2 items");
		assert.ok(oListItem.getCells()[0].getItems()[0].isA("sap.m.ComboBox"), "Item 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[0].getItems()[1].isA("sap.m.Select"), "Item 1 is of type sap.m.Select");
		assert.ok(oListItem.getCells()[1].isA("sap.m.HBox"), "Cell 2 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[1].getItems().length == 1, "Cell 2 contains one item");
		assert.ok(oListItem.getCells()[1].getItems()[0].isA("sap.m.Button"), "Cell 2 contains a button");
		assert.ok(oListItem.getCells()[1].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[1].getItems()[0].getType() == "Transparent", "Button transparent");

	}.bind(this));

	QUnit.test("_createListItemMobile with template", function(assert){
		var oMockModelContext = {getObject : function(){return {kind: "TestKindMobile", template: true};}};

		var oListItem = this.oChartItemPanel._createListItemMobile("anyId", oMockModelContext);
		assert.ok(oListItem, "List item was created");
		assert.ok(oListItem.isA("sap.m.ColumnListItem"), "List Item is of type sap.m.ColumnListItem");
		assert.ok(oListItem.getCells().length == 2, "List Item has 2 cells");
		assert.ok(oListItem.getCells()[0].isA("sap.m.ComboBox"), "Cell 1 is of type sap.m.ComboBox");
		assert.ok(oListItem.getCells()[1].isA("sap.m.HBox"), "Cell 2 is of type sap.m.HBox");
		assert.ok(oListItem.getCells()[1].getItems().length == 1, "Cell 2 contains one item");
		assert.ok(oListItem.getCells()[1].getItems()[0].isA("sap.m.Button"), "Cell 2 contains a button");
		assert.ok(oListItem.getCells()[1].getItems()[0].getIcon() == "sap-icon://decline", "Button has a delete icon");
		assert.ok(oListItem.getCells()[1].getItems()[0].getType() == "Transparent", "Button transparent");

	}.bind(this));

});
