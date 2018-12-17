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
				type: "action",
				visible : true,
				text: "action",
				icon: "sap-icon://meeting-room"
			},
			{
				type: "custom",
				visible : true,
				text: "custom",
				icon: "sap-icon://money-bills",
				content: new sap.m.Input()
			},
			{
				type: "action",
				visible : true,
				text: "sort",
				icon: "sap-icon://meeting-room"
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
	assert.equal(oPopover.getItems().length, 6, "ColumnHeaderPopover has 5 items as aggregations");

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
	assert.equal($buttons.length, 6, "columnHeaderPopover has six items");
	assert.equal($buttons[5].title, "Close", "last one item is close item");
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
	var $oActionButton = oRBPopover.$().find("button")[2];
	assert.equal($oActionButton.title, "action", "property setting of text is correct");

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
	var $oCustomButton1 = oRBPopover.$().find("button")[0];
	var oCustomButton1 = sap.ui.getCore().byId($oCustomButton1.id);

	assert.equal($oCustomButton1.title, "custom", "property setting of text is correct");
	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible");

	qutils.triggerEvent("tap", oCustomButton1.getId());

	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), true, "content of the first custom is visible");

	var $oCustomButton2 = oRBPopover.$().find("button")[3];
	var oCustomButton2 = sap.ui.getCore().byId($oCustomButton2.id);
	qutils.triggerEvent("tap", oCustomButton2.getId());
	this.clock.tick(500);

	assert.equal(oRBPopover.getContent()[1].getVisible(), false, "content of the first custom is not visible");
	assert.equal(oRBPopover.getContent()[2].getVisible(), true, "content of the second custom is visible");

	oButton.destroy();
	oPopover.destroy();
});

});