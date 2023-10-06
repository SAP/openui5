/* eslint-disable default-case */
/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/ColumnHeaderPopover",
	"sap/m/ColumnPopoverActionItem",
	"sap/m/ColumnPopoverCustomItem",
	"sap/m/ColumnPopoverSortItem",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/MessageToast",
	"sap/ui/core/Item"
], function(
	Core,
	Element,
	createAndAppendDiv,
	qutils,
	ColumnHeaderPopover,
	ColumnPopoverActionItem,
	ColumnPopoverCustomItem,
	ColumnPopoverSortItem,
	JSONModel,
	Button,
	Input,
	MessageToast,
	Item) {
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
				content: new Button()
			},
			{
				type: "action",
				visible : true,
				text: "action2",
				icon: "sap-icon://add-photo"
			},
			{
				type: "custom",
				visible : true,
				text: "custom",
				icon: "sap-icon://money-bills",
				content: new Input()
			}

			];


		function handlePressEvnt(oEvent) {
			MessageToast.show("action");
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
	Core.applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");

	assert.ok(oRBPopover.getDomRef(), "columnHeaderPopover is rendered");
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
	Core.applyChanges();
	oPopover.openBy(oButton);
	this.clock.tick(1000);

	var oRBPopover = oPopover.getAggregation("_popover");
	var $popover = oRBPopover.$();
	var $toolbar = $popover.find(".sapMTB");
	assert.ok($toolbar, "popover has a toolbar");

	var $spacer = $toolbar.find(".sapMTBSpacer");
	assert.ok($spacer, "toolbar has a spacer");

	var $buttons = $popover.find("button");

	var sDefaultLanguage = Core.getConfiguration().getLanguage();
	// Set language to english to test te text of the close button
	Core.getConfiguration().setLanguage("en-US");

	var oRB = Core.getLibraryResourceBundle("sap.m");
	var sCloseText = oRB.getText("COLUMNHEADERPOPOVER_CLOSE_BUTTON");

	assert.equal($buttons.length, 4, "Popover has four buttons");
	assert.equal($buttons[3].title, sCloseText, "last visible item is close button");

	// Set language back to default
	Core.getConfiguration().setLanguage(sDefaultLanguage);

	oButton.destroy();
	oPopover.destroy();
});

QUnit.module("Aggregation");

QUnit.test("update item", function(assert){
	var oPopover = createCHP("test3");
	var oItem1 = oPopover.getItems()[3];
	var oItem2 = new ColumnPopoverActionItem({text: "Hello"});

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	Core.applyChanges();

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
	assert.expect(4);

	var oPopover = createCHP("test3");

	var oButton = new Button({text : "open columnHeaderPopover"});

	oButton.placeAt("content");
	Core.applyChanges();

	oPopover.getItems()[2].attachPress(function() {
		assert.ok(document.activeElement === oButton.getFocusDomRef(), "Focus is on the Button which opened the Popover before");
		assert.ok(bPopoverClosed, "Popover closed");
	});

	oButton.getDomRef().focus();
	oPopover.openBy(oButton);

	var bPopoverClosed = false;
	oPopover.getAggregation("_popover").attachBeforeClose(function() {
		bPopoverClosed = true;
	});

	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");

	var oActionButton = Element.closestTo(oRBPopover.$().find("button")[1]);
	assert.equal(oActionButton.getTooltip(), "action2", "property setting of text is correct");
	assert.equal(oActionButton.getIcon(), "sap-icon://add-photo", "property setting of icon is correct");

	oActionButton.firePress();

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
	Core.applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");
	var oCustomButton1Dom = oRBPopover.$().find("button")[0];
	var oCustomButton1 = Core.byId(oCustomButton1Dom.id);

	assert.equal(oCustomButton1Dom.title, "custom", "property setting of text is correct");
	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible");

	qutils.triggerEvent("tap", oCustomButton1.getId());

	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), true, "content of the first custom is visible after the first custom item is pressed");

	var oCustomButton2Dom = oRBPopover.$().find("button")[2];
	var oCustomButton2 = Core.byId(oCustomButton2Dom.id);
	qutils.triggerEvent("tap", oCustomButton2.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible after the second custom item is pressed");
	assert.equal(oRBPopover.getContent()[2].getVisible(), true, "content of the second custom is visible after the second custom item is pressed");

	oCustomButton2.destroy();
	Core.applyChanges();
	this.clock.tick(5000);

	assert.ok(oRBPopover.$().find("input"), "content of the second custom item is removed");

	qutils.triggerEvent("tap", oCustomButton1.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), true, "content of the first custom is still visible after the second custom item is deleted");

	oButton.destroy();
	oPopover.destroy();
});

QUnit.test("ColumnPopoverSortItem", function(assert){
	var oPopover = createCHP("test5");
	var oSortItem1 = new ColumnPopoverSortItem({
		items:[
			new Item({ text: "item1"})
		]
	});
	var oSortItem2 = new ColumnPopoverSortItem({
		items:[
			new Item({ text: "item1", key: "item1"}),
			new Item({ text: "item2", key: "item2"})
		]
	});

	oPopover.addItem(oSortItem1);
	oPopover.addItem(oSortItem2);

	var oSortEventSpy = sinon.spy(function(oEvent) {
		oSortEventSpy._mEventParameters = oEvent.mParameters;
	});
	oSortItem2.attachSort(oSortEventSpy);

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	Core.applyChanges();

	oButton.getFocusDomRef().focus();
	oPopover.openBy(oButton);
	this.clock.tick(500);

	var oRBPopover = oPopover.getAggregation("_popover");
	var $popover = oRBPopover.$();

	var oSortButtonDom1 = oRBPopover.$().find("button")[3];
	var oSortButtonDom2 = oRBPopover.$().find("button")[4];
	var oSortButton1 = Core.byId(oSortButtonDom1.id);
	var oSortButton2 = Core.byId(oSortButtonDom2.id);

	assert.equal(oSortButtonDom1.title, "Sort", "two sort items are rendered");
	assert.equal(oSortButtonDom2.title, "Sort", "two sort items are rendered");

	qutils.triggerEvent("tap", oSortButton1.getId());
	assert.ok(document.activeElement === oButton.getFocusDomRef(), "Focus is on the Button which opened the Popover before");
	this.clock.tick(500);

	assert.equal($popover[0].style.display, "none", "columnHeaderPopover is closed");

	oButton.getFocusDomRef().focus();
	oPopover.openBy(oButton);
	this.clock.tick(500);

	qutils.triggerEvent("tap", oSortButton2.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.$().find("li").length, 2, "sort children are rendered");

	var oSortItemDom = oRBPopover.$().find("li")[0];
	var oSortItem = Core.byId(oSortItemDom.id);

	qutils.triggerEvent("tap", oSortItem.getId());
	this.clock.tick(500);

	assert.ok(document.activeElement === oButton.getFocusDomRef(), "Focus is on the Button which opened the Popover before " + document.activeElement.id);
	assert.ok(oSortEventSpy.calledOnce, "The SortEvent event was called once");
	assert.equal(oSortEventSpy._mEventParameters.property, "item1", "sort parameter is correct");
	assert.equal($popover[0].style.display, "none", "columnHeaderPopover is closed");

	oButton.destroy();
	oPopover.destroy();
});

QUnit.test("item visibility", function(assert){
	var oPopover = createCHP("test6");
	var oItem1 = oPopover.getItems()[0];

	var oButton = new Button({
		text : "open columnHeaderPopover",
		press: function(){
			oPopover.openBy(this);
		}
	});

	oButton.placeAt("content");
	Core.applyChanges();

	oPopover.openBy(oButton);
	this.clock.tick(2000);

	assert.equal(oPopover.getAggregation("_popover").$().find("button").length, 4, "Popover has 4 buttons");

	oPopover.getAggregation("_popover").close();
	this.clock.tick(2000);

	oItem1.setVisible(true);

	oPopover.openBy(oButton);
	this.clock.tick(2000);

	assert.equal(oPopover.getAggregation("_popover").$().find("button").length, 5, "Popover has 5 buttons");

	oPopover.getAggregation("_popover").close();
	this.clock.tick(2000);

	oItem1.setVisible(false);

	oPopover.openBy(oButton);
	this.clock.tick(2000);

	assert.equal(oPopover.getAggregation("_popover").$().find("button").length, 4, "Popover has 4 buttons");

	oButton.destroy();
	oPopover.destroy();
});

});