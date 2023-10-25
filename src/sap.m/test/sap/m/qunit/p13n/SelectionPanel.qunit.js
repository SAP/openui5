/* global QUnit */
sap.ui.define([
	"sap/m/p13n/SelectionPanel",
	"sap/m/VBox",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/sinon",
	"sap/ui/core/Core",
	"sap/m/Input",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/ui/model/json/JSONModel"
], function(SelectionPanel, VBox, Element, Library, sinon, oCore, Input, merge, mLibrary, JSONModel) {
	"use strict";

	// shortcut for sap.m.ListType
	var ListType = mLibrary.ListType;

	// shortcut for sap.m.MultiSelectMode
	var MultiSelectMode = mLibrary.MultiSelectMode;

	QUnit.module("API Tests", {
		getTestData: function() {
			return [
				{
					visible: true,
					name: "key1",
					label: "Field 1",
					group: "G1"
				},
				{
					visible: true,
					name: "key2",
					label: "Field 2",
					group: "G1",
					active: true
				},
				{
					visible: true,
					name: "key3",
					label: "Field 3",
					group: "G1"
				},
				{
					visible: false,
					name: "key4",
					label: "Field 4",
					group: "G2"
				},
				{
					visible: false,
					name: "key5",
					label: "Field 5",
					group: "G2"
				},
				{
					visible: false,
					name: "key6",
					label: "Field 6",
					group: "G2",
					tooltip: "Some Tooltip"
				}
			];
		},
		beforeEach: function(){

			this.aVisible = ["key1", "key2", "key3"];

			this.oSelectionPanel = new SelectionPanel();
			this.oSelectionPanel.setItemFactory(function(){
				return new VBox();
			});
			this.oSelectionPanel.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.sDefaultGroup = null;
			this.oP13nData = null;
			this.oSelectionPanel.destroy();
		}
	});

	QUnit.test("check instantiation", function(assert){
		assert.ok(this.oSelectionPanel, "Panel created");
		this.oSelectionPanel.setP13nData(this.getTestData());
		assert.ok(this.oSelectionPanel.getModel(this.oSelectionPanel.P13N_MODEL).isA("sap.ui.model.json.JSONModel"), "Model has been set");
	});

	QUnit.test("Check column toggle", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var oList = this.oSelectionPanel._oListControl;

		assert.equal(oList.getColumns().length, 2, "Two columns");

		this.oSelectionPanel.showFactory(true);
		assert.equal(oList.getColumns().length, 1, "One column");

		this.oSelectionPanel.showFactory(false);
		assert.equal(oList.getColumns().length, 2, "Two columns");
	});

	QUnit.test("Check 'active' icon'", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		assert.ok(this.oSelectionPanel._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is active");

		//Mock what happens during runtime if a filter is made inactive
		var aAllInactive = this.getTestData();
		aAllInactive[1].active = false;
		this.oSelectionPanel.setP13nData(aAllInactive);
		assert.ok(!this.oSelectionPanel._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is NOT active");

		//Mock what happens during runtime if a filter is made active
		this.getTestData()[1].active = true;
		this.oSelectionPanel.setP13nData(this.getTestData());
		assert.ok(this.oSelectionPanel._oListControl.getItems()[1].getCells()[1].getItems()[0].getVisible(), "Item is filtered (active)");
	});

	QUnit.test("Check acc information on 'active' state & activeColumn is provided", function(assert){

		this.oSelectionPanel.setP13nData(this.getTestData());
		this.oSelectionPanel.setActiveColumn("Active");

		this.oSelectionPanel._oListControl.getItems().forEach(function(oItem, iIndex){

			var oInvisibleText = oItem.getCells()[1].getItems()[1];

			//The second item has been set to active in the test data --> screen reader should announce this information
			if (iIndex === 1) {
				assert.equal(oInvisibleText.getText(), Library.getResourceBundleFor("sap.m").getText("p13n.ACTIVESTATE_ACTIVE"), "No field is active, all items shall be announced as ACTIVE");
			} else {
				assert.equal(oInvisibleText.getText(), Library.getResourceBundleFor("sap.m").getText("p13n.ACTIVESTATE_INACTIVE"), "No field is active, all items shall be announced as INACTIVE");
			}
		});

	});

	QUnit.test("Check acc information on 'active' state --> no text provided, hence no reader information", function(assert){

		this.oSelectionPanel.setP13nData(this.getTestData());
		this.oSelectionPanel.setActiveColumn("");

		this.oSelectionPanel._oListControl.getItems().forEach(function(oItem, iIndex){

			var aSecondCellItems = oItem.getCells()[1].getItems();
			assert.equal(aSecondCellItems.length, 1, "Only one item, no invisible text has been created witohut column text for active information");

		});

	});

	QUnit.test("Check 'fieldColumn' dynamic update", function(assert){
		this.oSelectionPanel.setFieldColumn("Test");
		assert.equal(this.oSelectionPanel.getFieldColumn(), "Test", "Text has been updated as expected");
		this.oSelectionPanel.setFieldColumn("Test2");
		assert.equal(this.oSelectionPanel.getFieldColumn(), "Test2", "Text has been updated as expected");
	});

	QUnit.test("Check 'activeColumn' dynamic update", function(assert){
		this.oSelectionPanel.setActiveColumn("Test");
		assert.equal(this.oSelectionPanel.getActiveColumn(), "Test", "Text has been updated as expected");
		this.oSelectionPanel.setActiveColumn("Test2");
		assert.equal(this.oSelectionPanel.getActiveColumn(), "Test2", "Text has been updated as expected");
	});

	QUnit.test("Check 'getSelectedFields' ", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());
		assert.equal(this.oSelectionPanel.getSelectedFields().length, this.aVisible.length, "Amount of selected fields is equal to initially visible fields");
	});

	QUnit.test("Check '_addMoveButtons' ", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		this.oSelectionPanel._oSelectedItem = this.oSelectionPanel._oListControl.getItems()[0];

		this.oSelectionPanel._addMoveButtons(this.oSelectionPanel._oSelectedItem);
		assert.equal(this.oSelectionPanel._oSelectedItem.getCells()[1].getItems().length, 5, "Item does contain move buttons after being selected");
	});

	QUnit.test("Check 'removeButtons' ", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		this.oSelectionPanel._oSelectedItem = this.oSelectionPanel._oListControl.getItems()[0];

		this.oSelectionPanel._addMoveButtons(this.oSelectionPanel._oSelectedItem);
		this.oSelectionPanel._removeMoveButtons();
		assert.equal(this.oSelectionPanel._oSelectedItem.getCells()[1].getItems().length, 1, "Item does not contain move buttons");
	});

	QUnit.test("Check hover event handling", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var nFirstHovered = this.oSelectionPanel._oListControl.getItems()[1].getDomRef();
		this.oSelectionPanel._hoverHandler({
			currentTarget: nFirstHovered
		});

		assert.ok(this.oSelectionPanel._oHoveredItem, "Hovered item is kept separately");

		//Hovered item has the move buttons
		assert.deepEqual(this.oSelectionPanel._oListControl.getItems()[1], this.oSelectionPanel._getMoveButtonContainer().getParent(), "The hovered item holds the move buttons");
		var oIconSecondTableItem = this.oSelectionPanel._oListControl.getItems()[1].getCells()[1].getItems()[0];
		assert.equal(oIconSecondTableItem.getVisible(), false, "The filtered icon is invisible as the table item holds the move buttons");

		var nSecondHovered = this.oSelectionPanel._oListControl.getItems()[0].getDomRef();
		this.oSelectionPanel._hoverHandler({
			currentTarget: nSecondHovered
		});

		//The prior hovered item does no longer contain the move buttons and the active icon is visible again
		assert.notDeepEqual(this.oSelectionPanel._oListControl.getItems()[1], this.oSelectionPanel._getMoveButtonContainer().getParent(), "The hovered item does not hold the move buttons anymore");
		assert.equal(oIconSecondTableItem.getVisible(), true, "The filtered icon is visible again as the table item does no longer hold the move buttons");
	});

	QUnit.test("Check focus event handling", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var nFirstHovered = this.oSelectionPanel._oListControl.getItems()[1].getDomRef();
		this.oSelectionPanel._focusHandler({
			currentTarget: nFirstHovered
		});

		assert.ok(this.oSelectionPanel._oHoveredItem, "Focused item is kept separately");

		//Focused item has the move buttons
		assert.deepEqual(this.oSelectionPanel._oListControl.getItems()[1], this.oSelectionPanel._getMoveButtonContainer().getParent(), "The hovered item holds the move buttons");
		var oIconSecondTableItem = this.oSelectionPanel._oListControl.getItems()[1].getCells()[1].getItems()[0];
		assert.equal(oIconSecondTableItem.getVisible(), false, "The filtered icon is invisible as the table item holds the move buttons");

		var nSecondHovered = this.oSelectionPanel._oListControl.getItems()[0].getDomRef();
		this.oSelectionPanel._focusHandler({
			currentTarget: nSecondHovered
		});

		//The prior focused item does no longer contain the move buttons and the active icon is visible again
		assert.notDeepEqual(this.oSelectionPanel._oListControl.getItems()[1], this.oSelectionPanel._getMoveButtonContainer().getParent(), "The hovered item does not hold the move buttons anymore");
		assert.equal(oIconSecondTableItem.getVisible(), true, "The filtered icon is visible again as the table item does no longer hold the move buttons");
	});

	QUnit.test("Check deselectAll focus handling", function(assert){
		//Arrange
		this.oSelectionPanel.setP13nData(this.getTestData());
		var oUpdateEnableOfMoveButtonsSpy = sinon.spy(this.oSelectionPanel, "_updateEnableOfMoveButtons");

		var oClearAllButton = this.oSelectionPanel.getAggregation("_content").getItems()[0]._clearAllButton;

		//Act
		oClearAllButton.focus();
		var oFocusedControl = oCore.getCurrentFocusedControlId();
		oClearAllButton.firePress();
		var oNewFocusedControl = oCore.getCurrentFocusedControlId();


		//Assert
		//Focus was set to "false"
		assert.ok(oUpdateEnableOfMoveButtonsSpy.calledWith(sinon.match.any, false), "Focus was not changed");
		assert.ok(this.oSelectionPanel._oHoveredItem === undefined, "No hovered item set");
		assert.equal(oFocusedControl, oNewFocusedControl, "Focused control stayed the same");
	});

	QUnit.test("Check '_handleActivated'", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var oHoveredItem = this.oSelectionPanel._oListControl.getItems()[1];

		oHoveredItem.getCells()[1].getItems()[0].setVisible(true);//Set icon to visible --> check that the handler sets it to visible: false

		//execute hover handler
		this.oSelectionPanel._handleActivated(oHoveredItem);

		//check that movement buttons have been added
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveTopButton()) > -1, "Move Top Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveUpButton()) > -1, "Move Up Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveDownButton()) > -1, "Move Down Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveBottomButton()) > -1, "Move Bottom Button found");

		//check that the icon has been set to visible: false
		assert.ok(!oHoveredItem.getCells()[1].getItems()[0].getVisible(), "active icon is not visible");
	});

	QUnit.test("Check '_handleActivated' for deselction and icon", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var oHoveredItem = this.oSelectionPanel._oListControl.getItems()[1];

		//execute hover handler
		this.oSelectionPanel._handleActivated(oHoveredItem);

		//check that movement buttons have been added
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveTopButton()) > -1, "Move Top Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveUpButton()) > -1, "Move Up Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveDownButton()) > -1, "Move Down Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveBottomButton()) > -1, "Move Bottom Button found");

		//uncheck the item in the model and execute activation logic again --> no move buttons and the icon is enabled
		var aTestData = this.getTestData();
		aTestData[1].visible = false;
		this.oSelectionPanel.setP13nData(aTestData);
		oHoveredItem = this.oSelectionPanel._oListControl.getItems()[1];
		this.oSelectionPanel._handleActivated(oHoveredItem);

		//check that the icon has been set to visible: false
		assert.ok(oHoveredItem.getCells()[1].getItems()[0].getVisible(), "active icon is visible");

		//check that movement buttons have been removed
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveTopButton()) === -1, "Move Top Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveUpButton()) === -1, "Move Up Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveDownButton()) === -1, "Move Down Button found");
		assert.ok(oHoveredItem.getCells()[1].getItems().indexOf(this.oSelectionPanel._getMoveBottomButton()) === -1, "Move Bottom Button found");
	});

	QUnit.test("Check 'enableReorder'", function(assert){
		this.oSelectionPanel.setEnableReorder(true);
		assert.equal(this.oSelectionPanel.getAggregation("_template").aDelegates.length, 1, "Hover event delegate registered");

		this.oSelectionPanel.setEnableReorder(false);
		assert.equal(this.oSelectionPanel.getAggregation("_template").aDelegates.length, 0, "No hover event delegate registered");
	});

	QUnit.test("Check keyboard mode upon 'Show Values' switch", function(assert){
		this.oSelectionPanel.setEnableReorder(true);

		this.oSelectionPanel.showFactory(true);

		assert.equal(this.oSelectionPanel._oListControl.getKeyboardMode(), "Edit", "List is in edit mode");

		this.oSelectionPanel.showFactory(false);

		assert.equal(this.oSelectionPanel._oListControl.getKeyboardMode(), "Navigation", "List is in navigation mode");

	});

	QUnit.test("Use growing only when necessary (e.g. factory provided)", function(assert){

		assert.ok(this.oSelectionPanel._oListControl.getGrowing(), "Growing enabled as factory is provided");

		this.oSelectionPanel.setItemFactory();

		assert.ok(!this.oSelectionPanel._oListControl.getGrowing(), "Growing disabled as no factory is provided");

	});

	QUnit.test("Check 'enableCount' property", function(assert){
		this.oSelectionPanel.setP13nData(this.getTestData());

		var aColumns = [
			"Fields",
			"Test"
		];

		//Feature is disabled by default
		this.oSelectionPanel._setPanelColumns(aColumns);

		var sTextFirstColumn = this.oSelectionPanel._oListControl.getColumns()[0].getHeader().getText();
		assert.equal(sTextFirstColumn, "Fields", "The text is similar to the provided text");

		//enable the feature
		this.oSelectionPanel.setEnableCount(true);
		this.oSelectionPanel._setPanelColumns(aColumns);//update the columns
		var oRB = Library.getResourceBundleFor("sap.m");
		sTextFirstColumn = this.oSelectionPanel._oListControl.getColumns()[0].getHeader().getText();

		assert.equal(sTextFirstColumn, "Fields " + oRB.getText("p13n.HEADER_COUNT", [3, 6]), "The text has been enhanced with a count (3 are selected, 6 are available)");

	});

	QUnit.test("Check selection count after filtering the table control", function(assert) {
		this.oSelectionPanel.setP13nData(this.getTestData());
		var aColumns = [
			"Fields",
			"Test"
		];
		this.oSelectionPanel.setEnableCount(true);
		this.oSelectionPanel._setPanelColumns(aColumns);//update the columns

		this.oSelectionPanel._filterList(false, "Field 4"); // --> only show key4
		assert.equal(this.oSelectionPanel._oListControl.getItems().length, 1, "Only one item found");

		var aItems = Object.assign([], this.oSelectionPanel.getP13nData());
		aItems[3].visible = true;
		this.oSelectionPanel.setP13nData(aItems);

		this.oSelectionPanel._selectTableItem(this.oSelectionPanel._oListControl.getItems()[0]);
		var oRB = Library.getResourceBundleFor("sap.m");
		var sTextFirstColumn = this.oSelectionPanel._oListControl.getColumns()[0].getHeader().getText();

		//Note: this test serves to check that also filtered lists still "remember" the complete selection state
		assert.equal(sTextFirstColumn, "Fields " + oRB.getText("p13n.HEADER_COUNT", [4, 6]), "The text has been enhanced with a count (4 are selected, 6 are available)");
	});

	QUnit.test("Check selection count after filtering and resetting the p13n data", function(assert) {

		// Prepare the panel --> 3 items selected
		this.oSelectionPanel.setEnableCount(true);

		this.oSelectionPanel.setP13nData(this.getTestData());
		var aColumns = [
			"Fields",
			"Test"
		];

		this.oSelectionPanel._setPanelColumns(aColumns);//update the columns

		// Select an additonal item --> 4 items selected
		var aNew = merge([], this.getTestData());
		aNew[3].visible = true;
		this.oSelectionPanel.setP13nData(aNew);

		//filter the list (e.g. 'Show Selected')
		this.oSelectionPanel._filterList(true);

		//Reset the p13n data
		this.oSelectionPanel.setP13nData(this.getTestData());

		var oRB = Library.getResourceBundleFor("sap.m");
		var sTextFirstColumn = this.oSelectionPanel._oListControl.getColumns()[0].getHeader().getText();

		assert.equal(sTextFirstColumn, "Fields " + oRB.getText("p13n.HEADER_COUNT", [3, 6]), "3 are selected, 6 are available");
	});

	QUnit.test("Check reset of hover logic on data update", function(assert){

		this.oSelectionPanel.setP13nData(this.getTestData());

		//not yet any item selected
		assert.notOk(this.oSelectionPanel._oSelectedItem, "Item is not selected");

		//Select the first item
		this.oSelectionPanel._oListControl.fireSelectionChange({
			selectAll: false,
			listItem: this.oSelectionPanel._oListControl.getItems()[0],
			listItems: this.oSelectionPanel._oListControl.getItems()
		});

		//check that an item is selected & move buttons are provided
		assert.ok(this.oSelectionPanel._oSelectedItem, "Item is selected");

		//trigger update the personalization data (mock updates such as 'Reset')
		this.oSelectionPanel.setP13nData(this.getTestData());
		assert.notOk(this.oSelectionPanel._oSelectedItem, "Item is not selected");

	});

	QUnit.test("Check toggling 'setEnableReorder'", function(assert){

		this.oSelectionPanel.setP13nData(this.getTestData());
		var aColumns = this.oSelectionPanel._oListControl.getColumns();
		assert.equal(aColumns.length, 2, "Reordering is enabled by default --> two columns (+1 for reordering)");

		this.oSelectionPanel.setActiveColumn("TestActiveColumnText");
		this.oSelectionPanel.setEnableReorder(false);
		aColumns = this.oSelectionPanel._oListControl.getColumns();
		assert.equal(aColumns.length, 2, "Reordering has been disabled --> two columns (+1 since active text is still provided)");

		this.oSelectionPanel.setActiveColumn(undefined);
		this.oSelectionPanel.setEnableReorder(false);
		aColumns = this.oSelectionPanel._oListControl.getColumns();
		assert.equal(aColumns.length, 1, "Reordering has been disabled --> only the fieldColumn is used");
	});

	QUnit.test("Check labelFor reference on label (WITH acc children)", function(assert){
        this.oSelectionPanel.setItemFactory(function(oContext){

            var oContainer = new VBox({
                items: [
                    new Input("testAccInput" + oContext.getProperty("name"), {})
                ]
            });

            oContainer.getIdForLabel = function() {
                return oContainer.getItems()[0].getId();
            };

            return oContainer;
        });

		this.oSelectionPanel.setP13nData(this.getTestData());
		this.oSelectionPanel.showFactory(true);

		var aItems = this.oSelectionPanel._oListControl.getItems();

		aItems.forEach(function(oItem, iIndex){
			var oLabel = oItem.getCells()[0].getItems()[0];
			var sLabelFor = Element.getElementById(oLabel.getLabelFor()).getIdForLabel();
			var sKey = "key" + (iIndex + 1);
			assert.equal(sLabelFor, "testAccInput" + sKey, "Label for assocation points to children element");
		});
    });

	QUnit.test("Check type of inner item depending if values are shown", function(assert){

		this.oSelectionPanel.setP13nData(this.getTestData());
		var oInnerTable = this.oSelectionPanel._oListControl;
		var aItems = oInnerTable.getItems();

		//In case the factory is not shown, the item should be clickable/active in case its selected
		aItems.forEach(function(oItem){
			if (oItem.getSelected()) {
				assert.equal(oItem.getType(), ListType.Active, "The list item is set to active");
			} else {
				assert.equal(oItem.getType(), ListType.Inactive, "The list item is set to active");
			}
		});

		this.oSelectionPanel.showFactory(true);

		//Once the factory is shown, the item should be inactive since move buttons are disabled
		aItems.forEach(function(oItem){
			assert.equal(oItem.getType(), ListType.Inactive, "The list item is set to inactive");
		});

	});

	QUnit.test("Check fieldColumn can by dynamically updated", function(assert){

		const oSelectionPanel = new SelectionPanel();

		assert.equal(oSelectionPanel.getFieldColumn(), "Field", "The default has been provided");

		oSelectionPanel.setFieldColumn("Test");
		assert.equal(oSelectionPanel.getFieldColumn(), "Test", "The updated text has been set");

	});

	QUnit.test("Check fieldColumn can be bound", function(assert){

		const testText = "Test 2";

		const oModel = new JSONModel({
			panelText: testText
		});

		const oSelectionPanel = new SelectionPanel({
			fieldColumn: "{testP13nModel>/panelText}"
		});

		oSelectionPanel.setModel(oModel, "testP13nModel");

		assert.equal(oSelectionPanel.getFieldColumn(), testText, "The updated text has been set");

	});

	QUnit.test("Check 'multiSelectMode'", function(assert) {
		var oPanel = this.oSelectionPanel;

		assert.equal(oPanel._oListControl.getMultiSelectMode(), MultiSelectMode.ClearAll, "Correct default value for 'multiSelectMode' set in inner ListControl.");

		oPanel.setMultiSelectMode(MultiSelectMode.Default);
		assert.equal(oPanel._oListControl.getMultiSelectMode(), MultiSelectMode.Default, "Correct value forwarded to inner ListControl.");

		oPanel.setMultiSelectMode(MultiSelectMode.SelectAll);
		assert.equal(oPanel._oListControl.getMultiSelectMode(), MultiSelectMode.SelectAll, "Correct value forwarded to inner ListControl.");
	});
});