/*global QUnit, jQuery */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"jquery.sap.global",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/ColumnHeaderPopover",
	"sap/m/ColumnPopoverActionItem",
	"sap/m/ColumnPopoverCustomItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Label",
	"jquery.sap.mobile"
], function(
	createAndAppendDiv,
	jQuery,
	qutils,
	ColumnHeaderPopover,
	ColumnPopoverActionItem,
	ColumnPopoverCustomItem,
	JSONModel,
	Button,
	library,
	Label) {
	"use strict";
	createAndAppendDiv("content");

	function createCHP(sId) {

		var oData = [
			{
				type: "action",
				visible : false,
				text: "action",
				icon: "sap-icon://add-photo"
			},
			{
				type: "custom",
				visible : true,
				text: "custom",
				icon: "sap-icon://money-bills",
				content: new sap.m.Button()
			},
			{
				type: "action",
				visible : true,
				text: "action",
				icon: "sap-icon://add-photo"
			},
			{
				type: "custom",
				visible : true,
				text: "custom",
				icon: "sap-icon://money-bills",
				content: new sap.m.Input()
			}

			];


		function handlePressEvnt(oEvent) {
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show("action");
		}

		var oPopover = new ColumnHeaderPopover();

		var oModel = new JSONModel();
		oPopover.setModel(oModel);
		oModel.setData(oData);
		oPopover.bindItems("/", function(id, oContext) {
			var oItem = oContext.getObject();
			switch (oItem.type) {
				case "action":
					return new ColumnPopoverActionItem({
						visible: "{visible}",
						text: "{text}",
						icon: "{icon}",
						press: handlePressEvnt
					});
				case "custom":
					return new ColumnPopoverCustomItem({
						visible: "{visible}",
						text: "{text}",
						icon: "{icon}",
						content: oItem.content
					});
			}
		});

		return oPopover;
	}



QUnit.module("Initial Check");

QUnit.test("Overview rendered", function(assert){
	var oPopover = createCHP("test1");

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	sap.ui.getCore().applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");

	var sId = oRBPopover.getId();
	assert.ok(jQuery.sap.byId(sId), "columnHeaderPopover is rendered");
	assert.equal(oPopover.getItems().length, 4, "ColumnHeaderPopover has four items as aggregations");

	oButton.destroy();
	oPopover.destroy();
});

QUnit.test("Item render", function(assert){
	var oPopover = createCHP("test2");
	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});
	oButton.placeAt("content");
	sap.ui.getCore().applyChanges();
	oPopover.openBy(oButton);
	this.clock.tick(1000);

	var oRBPopover = oPopover.getAggregation("_popover");
	var $popover = oRBPopover.$();
	var $toolbar = $popover.find(".sapMTB");
	assert.ok($toolbar, "popover has a toolbar");

	var $spacer = $toolbar.find(".sapMTBSpacer");
	assert.ok($spacer, "toolbar has a spacer");

	var $buttons = $popover.find("button");
	assert.equal($buttons.length, 4, "Popover has four buttons");
	assert.equal($buttons[3].title, "Close", "last one item is close item");
	oButton.destroy();
	oPopover.destroy();
});




QUnit.module("Aggregation");

QUnit.test("update item", function(assert){
	var oPopover = createCHP("test3");
	var oItem1 = oPopover.getItems()[3];
	var oItem2 = new sap.m.ColumnPopoverActionItem({text: "Hello"});

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	sap.ui.getCore().applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(2000);

	oPopover.removeItem(oItem1);
	oPopover.addItem(oItem2);
	this.clock.tick(2000);

	assert.equal(oPopover.getItems().length, 4, "ColumnHeaderPopover has 4 items as aggregations");

	var oRBPopover = oPopover.getAggregation("_popover");

	var $popover = oRBPopover.$();
	var $buttons = $popover.find("button");
	assert.equal($buttons.length, 4, "Popover has four buttons");

	oButton.destroy();
	oPopover.destroy();
});



QUnit.module("ColumnPopoverItem");

QUnit.test("ColumnPopoverActionItem", function(assert){
	var oPopover = createCHP("test3");

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	sap.ui.getCore().applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");
	var oActionButtonDom = oRBPopover.$().find("button")[1];
	assert.equal(oActionButtonDom.title, "action", "property setting of text is correct");

	oButton.destroy();
	oPopover.destroy();
});

QUnit.test("ColumnPopoverCustomItem", function(assert){
	var oPopover = createCHP("test4");

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	sap.ui.getCore().applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");
	var oCustomButton1Dom = oRBPopover.$().find("button")[0];
	var oCustomButton1 = sap.ui.getCore().byId(oCustomButton1Dom.id);

	assert.equal(oCustomButton1Dom.title, "custom", "property setting of text is correct");
	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible");

	qutils.triggerEvent("tap", oCustomButton1.getId());

	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), true, "content of the first custom is visible after the first custom item is pressed");

	var oCustomButton2Dom = oRBPopover.$().find("button")[2];
	var oCustomButton2 = sap.ui.getCore().byId(oCustomButton2Dom.id);
	qutils.triggerEvent("tap", oCustomButton2.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible after the second custom item is pressed");
	assert.equal(oRBPopover.getContent()[2].getVisible(), true, "content of the second custom is visible after the second custom item is pressed");

	oCustomButton2.destroy();
	sap.ui.getCore().applyChanges();
	this.clock.tick(5000);

	assert.ok(oRBPopover.$().find("input"), "content of the second custom item is removed");

	qutils.triggerEvent("tap", oCustomButton1.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), true, "content of the first custom is still visible after the second custom item is deleted");

	oButton.destroy();
	oPopover.destroy();
});

});