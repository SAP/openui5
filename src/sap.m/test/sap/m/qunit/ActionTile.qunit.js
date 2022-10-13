/*global QUnit */
sap.ui.define([
	"sap/m/ActionTile",
	"sap/m/ActionTileContent",
	"sap/m/CustomAttribute",
	"sap/m/TileContent",
	"sap/m/library",
	"sap/m/FormattedText",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel"
], function(ActionTile,ActionTileContent,CustomAttribute,TileContent,library,FormattedText,Button,oCore,KeyCodes,jQuery,JSONModel) {
	"use strict";

	// shortcut for sap.m.FrameType
	var FrameType = library.FrameType;

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	//shortcut for sap.m.Priority
	var Priority = library.Priority;

	QUnit.module("Default Properties", {
		beforeEach: function() {
            this.oActionTile = new ActionTile();
		},
		afterEach: function() {
            this.oActionTile.destroy();
            this.oActionTile = null;
		}
	});

	QUnit.test("Check if default properties are added", function(assert) {
        assert.equal(this.oActionTile.getMode(), GenericTileMode.ActionMode, "Mode as ActionMode has been set");
        assert.equal(this.oActionTile.getFrameType(),FrameType.TwoByOne, "FrameType as TwoByOne has been set");

	});

    QUnit.module("S4 home Tiles", {
		beforeEach: function() {
			var oModel = new JSONModel({
				attributes: [
					{
						label: "Agreement Type:",
						value: "SA with release doc(LPA)"
					},
					{
						label: "Supplier",
						value: "Domestic US Supplier 1"
					},
					{
						label: "Target Net Value:",
						value: "1.500,00 EUR"
					},
					{
						label: "Attribute four",
						value: "Value four"
					},
					{
						label: "Attribute five",
						value: "Value five"
					}
				]
			});
            this.oToDo = new ActionTile("todo", {
				header: "Comparative Annual Totals",
				tileContent: new ActionTileContent("tileCont1", {
				priority: Priority.VeryHigh,
				priorityText: "Very High",
				attributes: {
					path: "/attributes",
					template: new CustomAttribute({
						label: "{label}",
						value: "{value}"
					})
				}
				}),
                actionButtons: [
					this.oActionButton1 = new Button()
				]
			}).placeAt("qunit-fixture");

			this.oToDo.setModel(oModel);

            this.oSituation = new ActionTile("situation", {
				header: "Comparative Annual Totals",
                headerImage: "sap-icon://alert",
                valueColor:"Critical",
				tileContent: new TileContent("tileCont2", {
					content: new FormattedText("frmt-txt2", {
						htmlText : "<span>This would be a situation long text description. it would have 3 lines of space, as a maximum else get truncated</span><p>Supplier<br>Domestic US Supplier 1</p><p>Due On:<br>28.09.2022</p> <p>Created On: <br>01.09.2022</p>"
					})
				}),
                actionButtons: [
					this.oActionButton1 = new Button()
				]
			}).placeAt("qunit-fixture");

			oCore.applyChanges();
		},
		afterEach: function() {
            this.oToDo.destroy();
            this.oToDo = null;

            this.oSituation.destroy();
            this.oSituation = null;
		}
	});

	QUnit.test("ToDo Card Tests", function(assert) {
        assert.equal(this.oToDo.getTileContent()[0].getPriority(), Priority.VeryHigh, "Priority has been set at Very High");
        assert.ok(document.getElementById("tileCont1-priority-value"),"Text has been rendered successfully");
        assert.equal(document.querySelector(".sapMContainer").children.length, 5, "All 5 custom attributes has been rendered successfully");
	});

    QUnit.test("Situation card tests", function(assert) {
        assert.ok(document.getElementById("situation-icon-image"), "Icon has been rendered successfully");
        assert.equal(this.oSituation.getTileContent()[0].getContent().getDomRef().children.length, 4, "All 4 P tags has been rendered successfully");
	});

	QUnit.test("Aria-Label Properties for ToDo Tiles", function(assert) {
		/**
		 * Arrange
		 * Getting focus on the Situation Tile
		 */
		var tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oToDo.$().trigger(tabDown);
		var tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oToDo.$().trigger(tabUp);
		//Act
		assert.equal(this.oToDo.getDomRef().getAttribute("aria-label"),this.oToDo._getAriaText(),"Aria-Label has rendered successfully first four attributes");
	});

	QUnit.test("Aria-Label Properties for Situation Tiles", function(assert) {
		/**
		 * Arrange
		 * Getting focus on the Situation Tile
		 */
		var tabDown = jQuery.Event("keydown");
		tabDown.keyCode = KeyCodes.TAB;
		this.oSituation.$().trigger(tabDown);
		var tabUp = jQuery.Event("keyup");
		tabUp.keyCode = KeyCodes.TAB;
		this.oSituation.$().trigger(tabUp);
		//Act
		assert.equal(this.oSituation.getDomRef().getAttribute("aria-label"),this.oSituation._getAriaText(),"Aria-Label has been rendered Successfully");
	});

	QUnit.test("Tooltip,aria-label generation on tasks cards when there are less than four attributes", function(assert) {
		//Arrange
		var oNewModel = new JSONModel({
			attributes: [
				{
					label: "Agreement Type:",
					value: "SA with release doc(LPA)"
				},
				{
					label: "Supplier",
					value: "Domestic US Supplier 1"
				}
			]
		});
		this.oToDo.setModel(oNewModel);
		oCore.applyChanges();
		this.oToDo.$().trigger("mouseenter");
		//Act
		var sToolTip = this.oToDo.getDomRef().getAttribute("title");
		var sAriaLabel = this.oToDo.getDomRef().getAttribute("aria-label");
		//Assert
		assert.equal(sToolTip,this.oToDo._getAriaAndTooltipText(),"Tooltip successfully generated");
		assert.equal(sAriaLabel,this.oToDo._getAriaText(),"Aria-label successfully generated");
	});

	QUnit.test("Setting the width through property", function(assert) {
		//Arrange
		this.oToDo.setWidth("25rem");
		oCore.applyChanges();
		//Assert
		assert.equal(getComputedStyle(this.oToDo.getDomRef()).width,"400px","Width set correctly");
	});

	QUnit.test("Setting pressEnabled property", function(assert) {
		assert.ok(this.oToDo.getDomRef().classList.contains("sapMPointer"),"Hand icon would be visible");
		this.oToDo.setPressEnabled(false);
		oCore.applyChanges();
		assert.ok(this.oToDo.getDomRef().classList.contains("sapMATAutoPointer"),"Hand icon won't be visible");
	});

	QUnit.test("Setting enableNavigationButton property", function(assert) {
		//Assert
		assert.notOk(this.oToDo.getEnableNavigationButton(),"By default enableActionButton property has been set to false");
		assert.ok(this.oToDo.hasStyleClass("sapMATHideActionButton"),"Style class has been added sucessfully");
		assert.notOk(this.oSituation.getEnableNavigationButton(),"By default enableActionButton property has been set to false");
		assert.ok(this.oSituation.hasStyleClass("sapMATHideActionButton"),"Style class has been added sucessfully");
		//Arrange
		this.oToDo.setEnableNavigationButton(true);
		this.oSituation.setEnableNavigationButton(true);
		oCore.applyChanges();
		//Assert
		assert.notOk(this.oToDo.hasStyleClass("sapMATHideActionButton"),"Style class should not get added");
		assert.notOk(this.oSituation.hasStyleClass("sapMATHideActionButton"),"Style class should not get added");
	});
});