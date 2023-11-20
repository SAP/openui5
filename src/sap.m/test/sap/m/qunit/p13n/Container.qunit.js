/* global QUnit */
sap.ui.define([
	"sap/m/p13n/Container",
	"sap/m/p13n/AbstractContainerItem",
	"sap/m/Button",
	"sap/ui/core/Core"
], function (P13nContainer, AbstractContainerItem, Button, oCore) {
	"use strict";

	QUnit.module("P13nContainer API tests", {
		beforeEach: function(){
			this.oP13nContainer = new P13nContainer();

			this.oP13nContainer.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function(){
			this.oP13nContainer.destroy();
		}
	});

	QUnit.test("instantiate P13nContainer", function(assert){
		assert.ok(this.oP13nContainer);
	});

	QUnit.test("check inner content", function(assert){
		assert.ok(this.oP13nContainer._getTabBar().getVisible(), "IconTabBar used by default");
		assert.notEqual(this.oP13nContainer.getCurrentViewContent(), this.oP13nContainer.getView("$default"),"No list layout used by default");
	});

	QUnit.test("check inner content layout switch", function(assert){

		this.oP13nContainer.setListLayout(true);

		assert.ok(!this.oP13nContainer._getTabBar().getVisible(), "IconTabBar set to invisible");
		assert.ok(this.oP13nContainer.getView("$default"), "List layout used");

		this.oP13nContainer.setListLayout(false);

		assert.ok(this.oP13nContainer._getTabBar().getVisible(), "IconTabBar set to visible");
		assert.notEqual(this.oP13nContainer.getCurrentViewContent(), this.oP13nContainer.getView("$default"), "List layout not used");
	});

	QUnit.test("check panel add (IconTabBar)", function(assert){

		this.oP13nContainer.setListLayout(false);

		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel1",
			content: new Button()
		}));
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel2",
			content: new Button()
		}));
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel3",
			content: new Button()
		}));

		var oIconTabBar = this.oP13nContainer._getTabBar();

		assert.equal(oIconTabBar.getItems().length, 3, "IconTabBar with 3 tabs");

		assert.equal(oIconTabBar.getItems()[0].getText(), "panel1", "tab correct text");
		assert.equal(oIconTabBar.getItems()[1].getText(), "panel2", "tab correct text");
		assert.equal(oIconTabBar.getItems()[2].getText(), "panel3", "tab correct text");
	});

	QUnit.test("check panel add (List)", function(assert){

		this.oP13nContainer.setListLayout(true);

		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel1",
			text: "panel1",
			content: new Button()
		}));
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel2",
			text: "panel2",
			content: new Button()
		}));
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel3",
			text: "panel3",
			content: new Button()
		}));

		var oList = this.oP13nContainer._getNavigationList();

		assert.equal(oList.getItems().length, 3, "List with 3 tabs");

		assert.equal(oList.getItems()[0].getTitle(), "panel1", "tab correct text");
		assert.equal(oList.getItems()[1].getTitle(), "panel2", "tab correct text");
		assert.equal(oList.getItems()[2].getTitle(), "panel3", "tab correct text");
	});

	QUnit.test("check separator", function (assert) {
		this.oP13nContainer.setListLayout(true);

		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel1",
			text: "panel1",
			content: new Button()
		}));
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel2",
			text: "panel2",
			content: new Button()
		}));
		this.oP13nContainer.addSeparator();
		this.oP13nContainer.addView(new AbstractContainerItem({
			key: "panel3",
			text: "panel3",
			content: new Button()
		}));

		var oList = this.oP13nContainer._getNavigationList();

		assert.ok(oList.getItems()[1].hasStyleClass("sapMMenuDivider"));
		assert.notOk(oList.getItems()[2].hasStyleClass("sapMMenuDivider"));
	});
});
