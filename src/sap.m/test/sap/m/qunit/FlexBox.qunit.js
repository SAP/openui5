sap.ui.define([
	"sap/m/FlexBox",
	"sap/ui/core/HTML",
	"jquery.sap.global",
	"sap/m/Image",
	"sap/m/FlexItemData",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/VBox"
], function(FlexBox, HTML, jQuery, Image, FlexItemData, Device, Button, VBox) {
	/*global document, jQuery, sap, QUnit*/
	"use strict";

	var styleElem = document.createElement("style");
	styleElem.textContent =
		".sapMFlexItem {" +
		"	padding: 1rem;" +
		"	border: 1px solid black;" +
		"	box-sizing: border-box;" +
		"}";
	document.head.appendChild(styleElem);


	var DOM_RENDER_LOCATION = "qunit-fixture";

	// Helper function to create the flexboxes for the tests
	var getFlexBoxWithItems = function(oBoxConfig, vItemTemplates, vItemConfigs) {
		var box = new FlexBox(oBoxConfig),
			item = null,
			i = 0;

		// Fill item templates with default HTML control if only an integer is given
		if (typeof vItemTemplates === "number") {
			var j = vItemTemplates;
			vItemTemplates = [];
			while (j) {
				vItemTemplates.push(HTML);
				j--;
			}
		}

		// Fill item configuration with default content if only an integer is given
		if (typeof vItemConfigs === "number") {
			var k = vItemConfigs;
			vItemConfigs = [];
			while (k) {
				vItemConfigs.push({
					content: "<div class='items'>" + k + "</div>"
				});
				k--;
			}
			vItemConfigs.reverse();
		}

		while (i < vItemTemplates.length) {
			item = new vItemTemplates[i](vItemConfigs[i] ? vItemConfigs[i] : {});
			box.addItem(item);
			i++;
		}

		return box;
	};

	QUnit.module("Visibility", {
		beforeEach: function() {
			this.oBoxConfig = {
				id: "flexbox",
				visible: false
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = [
				{
				content: "<div class='items'>1</div>"
				},
				{
				content: "<div class='items'>2</div>"
				},
				{
				content: "<div class='items'>3</div>",
				visible: false
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.fixture = jQuery.sap.byId(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("FlexBox visible:false", function(assert) {
		assert.ok(!jQuery(".sapMFlexBox", this.fixture).length, "Flex Box should not be rendered initially");
	});

	QUnit.test("FlexBox visible:true - Item 3 visible:false", function(assert) {
		this.oBox.setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.ok(jQuery(".sapMFlexBox", this.fixture).length, "Flex Box should now be rendered");
		assert.equal(jQuery(".sapMFlexBox > .sapMFlexItem:not(.sapUiHiddenPlaceholder)", this.fixture).length, 2, "Only two items should be rendered");
	});

	QUnit.test("Item 3 visible:true", function(assert) {
		this.oBox.setVisible(true);
		this.oBox.getItems()[2].setVisible(true);
		sap.ui.getCore().applyChanges();
		assert.equal(jQuery(".sapMFlexBox > .sapMFlexItem:not(.sapUiHiddenPlaceholder)", this.fixture).length, 3, "Three items should now be rendered");
	});

	QUnit.module("Render Type", {
		beforeEach: function() {
			this.oBoxConfig = {
				renderType: "List"
			};
			this.vItemTemplates = [
				Image,
				HTML,
				HTML
			];
			this.vItemConfigs = [
				{},
				{
					content: "<div class='items'>2</div>",
					layoutData: new FlexItemData({
						growFactor: 2,
						baseSize: "58%"
					})
				},
				{
					content: "<div class='items'>3</div>"
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("List", function(assert) {
		assert.equal(this.oBox.$().get(0).tagName, "UL", "Flex Box should be rendered as UL");
		assert.equal(this.oBox.$().find(".sapMFlexItem:first-child").get(0).tagName, "LI", "First item of Flex Box should be rendered as LI");
		assert.equal(this.oBox.$().find(".sapMFlexItem:nth-child(2)").get(0).tagName, "LI", "Second item of Flex Box should be rendered as LI");
	});

	QUnit.test("Div", function(assert) {
		this.oBox.setRenderType("Div");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oBox.$().get(0).tagName, "DIV", "Flex Box should now be rendered as DIV");
		assert.equal(this.oBox.$().find(".sapMFlexItem:first-child").get(0).tagName, "DIV", "First item of Flex Box should be rendered as DIV");
		assert.equal(this.oBox.$().find(".sapMFlexItem:nth-child(2)").get(0).tagName, "DIV", "Second item of Flex Box should be rendered as DIV");
	});

	QUnit.test("Bare", function(assert) {
		this.oBox.setRenderType("Bare");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oBox.getItems()[0].$().get(0).tagName, "IMG", "First item of Flex Box should now be rendered as IMG");
		if (!Device.browser.phantomJS && !Device.browser.internet_explorer) {// TODO remove after the end of support for Internet Explorer
			assert.equal(this.oBox.getItems()[1].getDomRef().style.flexGrow, "2", "Inline style for grow factor is set on second item");
			assert.equal(this.oBox.getItems()[1].getDomRef().style.flexBasis, "58%", "Inline style for base size is set on second item");
		}
	});

	QUnit.module("Inline vs. block display", {
		beforeEach: function() {
			this.oBoxConfig = {
				displayInline: true
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = 3;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Inline", function(assert) {
		this.oBox.setDisplayInline(true);
		// phantomjs wants to add the webkit prefix here...
		assert.equal(this.oBox.$().css('display'), (Device.browser.phantomJS ? "-webkit-" : "") + "inline-flex", "Flex Box display property should be set to inline");
	});

	QUnit.test("Block", function(assert) {
		this.oBox.setDisplayInline(false);
		// phantomjs wants to add the webkit prefix here...
		assert.equal(this.oBox.$().css('display'), (Device.browser.phantomJS ? "-webkit-" : "") + "flex", "Flex Box display property should be set to block");
	});

	QUnit.module("Fit Container", {
		beforeEach: function() {
			this.oBoxConfig = {
				displayInline: true
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = 3;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Height 100%", function(assert) {
		jQuery.sap.byId(DOM_RENDER_LOCATION).css("height", "123px");
		this.oBox.setFitContainer(true);
		assert.equal(this.oBox.$().css('height'), "123px", "Flex Box height property should be set to 100%");
		jQuery.sap.byId(DOM_RENDER_LOCATION).css("height", "");
	});

	QUnit.module("Width and height", {
		beforeEach: function() {
			this.oBoxConfig = {
				displayInline: true
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = 3;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Set explicit dimensions", function(assert) {
		this.oBox.setWidth("388px");
		this.oBox.setHeight("398px");
		sap.ui.getCore().applyChanges();
		assert.equal(this.oBox.$().css('width'), "388px", "Flex Box width property should be set correctly");
		assert.equal(this.oBox.$().css('height'), "398px", "Flex Box height property should be set correctly");
	});

	QUnit.module("Background Design", {
		beforeEach: function() {
			this.oBoxConfig = {
				displayInline: true
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = [
				{
				content: "<div class='items'>1</div>"
				},
				{
				content: "<div class='items'>2</div>"
				},
				{
				content: "<div class='items'>3</div>",
				layoutData: new FlexItemData({})
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("FlexBox Solid", function(assert) {
		this.oBox.setBackgroundDesign("Solid");
		assert.ok(this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("FlexBox Transparent", function(assert) {
		this.oBox.setBackgroundDesign("Transparent");
		assert.ok(this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("FlexBox Translucent", function(assert) {
		this.oBox.setBackgroundDesign("Translucent");
		assert.ok(this.oBox.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		assert.ok(!this.oBox.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
	});

	QUnit.test("Flex item Solid", function(assert) {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Solid");
		assert.ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("Flex item Transparent", function(assert) {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Transparent");
		assert.ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is not set");
	});

	QUnit.test("Flex item Translucent", function(assert) {
		var oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
		oItem3LayoutData.setBackgroundDesign("Translucent");
		assert.ok(oItem3LayoutData.$().hasClass("sapMFlexBoxBGTranslucent"), "HTML class for Translucent is set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGTransparent"), "HTML class for Transparent is not set");
		assert.ok(!oItem3LayoutData.$().hasClass("sapMFlexBoxBGSolid"), "HTML class for Solid is not set");
	});

	QUnit.module("Direction", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = 3;
			this.vItemConfigs = 3;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef();
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef();
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Row Reverse", function(assert) {
		this.oBox.setDirection("RowReverse");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) < 0, "Item 1 should be placed to the right of Item 2");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem2DomRef.getBoundingClientRect().left) < 0, "Item 2 should be placed to the right of Item 3");
	});

	QUnit.test("Column", function(assert) {
		this.oBox.setDirection("Column");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 1 should be placed above Item 2");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) > 0, "Item 2 should be placed above Item 3");
	});

	QUnit.test("Column Reverse", function(assert) {
		this.oBox.setDirection("ColumnReverse");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) < 0, "Item 1 should be placed below Item 2");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) < 0, "Item 2 should be placed below Item 3");
	});

	QUnit.test("Row", function(assert) {
		this.oBox.setDirection("Row");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) > 0, "Item 1 should be placed to the left of Item 2");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem2DomRef.getBoundingClientRect().left) > 0, "Item 2 should be placed to the left of Item 3");
	});

	QUnit.module("Re-ordering", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = 3;
			this.vItemConfigs = [
				{
				content: "<div class='items'>1</div>",
				layoutData: new FlexItemData({order: 1})
				},
				{
				content: "<div class='items'>2</div>",
				layoutData: new FlexItemData({order: 2})
				},
				{
				content: "<div class='items'>3</div>",
				layoutData: new FlexItemData({order: 3})
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			this.oItem2LayoutData = this.oBox.getItems()[1].getLayoutData();
			this.oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef();
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef();
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("3 - 1 - 2", function(assert) {
		this.oItem1LayoutData.setOrder(3);
		this.oItem2LayoutData.setOrder(1);
		this.oItem3LayoutData.setOrder(2);
		assert.ok((this.oItem2DomRef.getBoundingClientRect().left - this.oItem3DomRef.getBoundingClientRect().left) < 0, "Item 3 should be placed to the right of Item 2");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().left - this.oItem1DomRef.getBoundingClientRect().left) < 0, "Item 1 should be placed to the right of Item 3");
	});

	QUnit.module("Positioning", {
		beforeEach: function() {
			this.oBoxConfig = {
				width: "388px",
				height: "398px"
			};
			this.vItemTemplates = 3;
			this.vItemConfigs = [
				{
				content: "<div class='items'>1</div>",
				layoutData: new FlexItemData({})
				},
				{
				content: "<div class='items'>2</div>"
				},
				{
				content: "<div class='items'>3</div>"
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oBoxDomRef = this.oBox.getDomRef();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Justify Content/Align Items: Center/Center", function(assert) {
		this.oBox.setJustifyContent("Center");
		this.oBox.setAlignItems("Center");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 130) <= 1, "Item 1 should be placed at the horizontal center");
		assert.ok(Math.round(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 173) <= 1, "Item 1 should be placed at the vertical center");
	});

	QUnit.test("Justify Content/Align Items: End/End", function(assert) {
		this.oBox.setJustifyContent("End");
		this.oBox.setAlignItems("End");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 259) <= 1, "Item 1 should be placed at the horizontal end");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 346) <= 2, "Item 1 should be placed at the vertical end");
	});

	QUnit.test("Justify Content/Align Items: Space Between/Baseline", function(assert) {
		this.oItem1DomRef.style.fontSize = "40px";
		this.oBox.setJustifyContent("SpaceBetween");
		this.oBox.setAlignItems("Baseline");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left) === 0, "Item 1 should be placed at the horizontal start");
		assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 179) <= 1, "Item 2 should be placed at the horizontal center");
		assert.ok(Math.abs(this.oItem3DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 345) <= 1, "Item 3 should be placed at the horizontal end");
		if (!Device.browser.phantomJS) {	// Baseline is not supported for align-items by phantomjs
			assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 22) <= 1, "Item 2 should be pushed down to align with Item 1 baseline");
		}
		this.oItem1DomRef.style.fontSize = "";
	});

	QUnit.test("Justify Content/Align Items: Space Around/Stretch", function(assert) {
		this.oBox.setJustifyContent("SpaceAround");
		this.oBox.setAlignItems("Stretch");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 43) <= 1, "Item 1 should be placed at the horizontal start");
		assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 173) <= 1, "Item 2 should be placed at the horizontal center");
		assert.ok(Math.abs(this.oItem3DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left - 302) <= 1, "Item 3 should be placed at the horizontal end");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) === 0, "Item 1 should stretch to the vertical end");
	});

	QUnit.test("Justify Content/Align Items: Start/Start", function(assert) {
		this.oBox.setJustifyContent("Start");
		this.oBox.setAlignItems("Start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().left - this.oBoxDomRef.getBoundingClientRect().left) === 0, "Item 1 should be placed at the horizontal start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
	});

	QUnit.test("Align Self: Start", function(assert) {
		this.oBox.setAlignItems("Stretch");
		this.oItem1LayoutData.setAlignSelf("Start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok(Math.abs(this.oBoxDomRef.getBoundingClientRect().bottom - this.oItem1DomRef.getBoundingClientRect().bottom - 346) <= 2, "Item 1 should not be stretched");
	});

	QUnit.test("Align Self: Center", function(assert) {
		this.oItem1LayoutData.setAlignSelf("Center");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 173) <= 1, "Item 1 should be placed at the vertical center");
	});

	QUnit.test("Align Self: End", function(assert) {
		this.oItem1LayoutData.setAlignSelf("End");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 346) <= 2, "Item 1 should be placed at the vertical end");
	});

	QUnit.test("Align Self: Baseline", function(assert) {
		this.oItem2DomRef.style.fontSize = "40px";
		this.oItem1LayoutData.setAlignSelf("Baseline");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok(Math.abs(this.oBoxDomRef.getBoundingClientRect().bottom - this.oItem1DomRef.getBoundingClientRect().bottom - 346) <= 2, "Item 1 should not be stretched");
		this.oItem2DomRef.style.fontSize = "";
	});

	QUnit.test("Align Self: Stretch", function(assert){
		this.oItem1LayoutData.setAlignSelf("Stretch");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) === 0, "Item 1 should stretch to the vertical end");
		this.oBox.setAlignItems("Start");
		this.oItem1LayoutData.setAlignSelf("Auto");
	});

	QUnit.module("Multi-line", {
		beforeEach: function() {
			this.oBoxConfig = {
			};
			this.vItemTemplates = 4;
			this.vItemConfigs = 4;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.setWidth("388px");
			this.oBox.setHeight("398px");
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
			this.oBoxDomRef = this.oBox.getDomRef();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
			this.oItem4DomRef = this.oBox.getItems()[3].getDomRef().parentNode;
			this.oItem1DomRef.style.width = "100%";
			this.oItem2DomRef.style.width = "50%";
			this.oItem3DomRef.style.width = "50%";
			this.oItem1DomRef.style.minHeight = "100px";
			this.oItem2DomRef.style.minHeight = "75px";
			this.oItem3DomRef.style.minHeight = "75px";
			this.oItem4DomRef.style.minHeight = "50px";
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Wrapping: No Wrap", function(assert) {
		this.oBox.setWrap("NoWrap");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) === 0, "Item 1 should be on the same line as Item 2");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
		assert.ok((this.oItem3DomRef.getBoundingClientRect().top - this.oItem4DomRef.getBoundingClientRect().top) === 0, "Item 3 should be on the same line as Item 4");
	});

	QUnit.test("Wrapping: Wrap", function(assert) {
		this.oBox.setWrap("Wrap");
		assert.ok((this.oItem4DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 4 should be in a line below Item 2");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) > 0, "Item 2 should be in a line below Item 1");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
	});

	QUnit.test("Wrapping: Wrap Reverse", function(assert) {
		this.oBox.setWrap("WrapReverse");
		assert.ok((this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().top) < 0, "Item 4 should be in a line above Item 2");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().top) < 0, "Item 2 should be in a line above Item 1");
		assert.ok((this.oItem2DomRef.getBoundingClientRect().top - this.oItem3DomRef.getBoundingClientRect().top) === 0, "Item 2 should be on the same line as Item 3");
	});

	QUnit.test("Align Content: Start", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("Start");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly below Item 1");
		assert.ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 4 should be directly below Item 2");
	});

	QUnit.test("Align Content: Center", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("Center");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 86) <= 2, "Item 1 should be placed towards the vertical center");
		assert.ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly below Item 1");
		assert.ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 4 should be directly below Item 2");
	});

	QUnit.test("Align Content: End", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("End");
		assert.ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
		assert.ok(Math.round(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) === 0, "Item 2 should be directly above Item 4");
		assert.ok(Math.round(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) === 0, "Item 1 should be directly above Item 2");
	});

	QUnit.test("Align Content: Space Between", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("SpaceBetween");
		assert.ok((this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) === 0, "Item 1 should be placed at the vertical start");
		assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 186) <= 2, "Item 2 should be placed at the vertical center");
		assert.ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
	});

	QUnit.test("Align Content: Space Around", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("SpaceAround");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 28) <= 1, "Item 1 should be placed below the vertical start");
		assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top - 186) <= 2, "Item 2 should be placed at the vertical center");
		assert.ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom + 28) <= 1, "Item 4 should be placed above the vertical end");
	});

	QUnit.test("Align Content: Stretch", function(assert) {
		this.oBox.setWrap("Wrap");
		this.oBox.setAlignContent("Stretch");
		assert.ok(Math.abs(this.oItem1DomRef.getBoundingClientRect().top - this.oBoxDomRef.getBoundingClientRect().top) <= 1, "Item 1 should be placed at the vertical start");
		assert.ok(Math.abs(this.oItem2DomRef.getBoundingClientRect().top - this.oItem1DomRef.getBoundingClientRect().bottom) <= 1, "Item 2 should be placed directly below Item 1");
		assert.ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().top - this.oItem2DomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed directly below Item 2");
		assert.ok(Math.abs(this.oItem4DomRef.getBoundingClientRect().bottom - this.oBoxDomRef.getBoundingClientRect().bottom) <= 1, "Item 4 should be placed at the vertical end");
	});

	QUnit.module("Flexibility", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = 3;
			this.vItemConfigs = [
				{
				content: "<div class='items'>1</div>",
				layoutData: new FlexItemData({})
				},
				{
				content: "<div class='items'>2</div>",
				layoutData: new FlexItemData({})
				},
				{
				content: "<div class='items'>3</div>",
				layoutData: new FlexItemData({})
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.setWidth("388px");
			this.oBox.setHeight("398px");
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			this.oItem1LayoutData = this.oBox.getItems()[0].getLayoutData();
			this.oItem2LayoutData = this.oBox.getItems()[1].getLayoutData();
			this.oItem3LayoutData = this.oBox.getItems()[2].getLayoutData();
			sap.ui.getCore().applyChanges();
			this.oItem1DomRef = this.oBox.getItems()[0].getDomRef().parentNode;
			this.oItem2DomRef = this.oBox.getItems()[1].getDomRef().parentNode;
			this.oItem3DomRef = this.oBox.getItems()[2].getDomRef().parentNode;
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Growing", function(assert) {
		this.oItem1LayoutData.setGrowFactor(1);
		this.oItem2LayoutData.setGrowFactor(2);
		this.oItem3LayoutData.setGrowFactor(3);
		assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 86) <= 1, "Width of Item 1 should be 86 (is " + this.oItem1DomRef.offsetWidth + ")");
		assert.ok(Math.abs(this.oItem2DomRef.offsetWidth - 129) <= 1, "Width of Item 2 should be 129 (is " + this.oItem2DomRef.offsetWidth + ")");
		assert.ok(Math.abs(this.oItem3DomRef.offsetWidth - 173) <= 1, "Width of Item 3 should be 173 (is " + this.oItem3DomRef.offsetWidth + ")");
	});

	QUnit.test("Shrinking", function(assert) {
		this.oItem1LayoutData.setShrinkFactor(1);
		this.oItem2LayoutData.setShrinkFactor(2);
		this.oItem3LayoutData.setShrinkFactor(3);
		this.oItem1DomRef.style.width = "100%";
		this.oItem2DomRef.style.width = "100%";
		this.oItem3DomRef.style.width = "100%";
		if (Device.browser.internet_explorer || Device.browser.phantomJS) {
			// IE 10-11, PhantomJS miscalculate the width of the flex items when box-sizing: border-box// TODO remove after the end of support for Internet Explorer
			assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 247) <= 1, "Width of Item 1 should be 247 (is " + this.oItem1DomRef.offsetWidth + ")");
			assert.ok(Math.abs(this.oItem2DomRef.offsetWidth - 107) <= 1, "Width of Item 2 should be 107 (is " + this.oItem2DomRef.offsetWidth + ")");
			assert.ok(Math.abs(this.oItem3DomRef.offsetWidth - 34) <= 1, "Width of Item 3 should be 34 (is " + this.oItem3DomRef.offsetWidth + ")");
		} else {
			assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 244) <= 1, "Width of Item 1 should be 244 (is " + this.oItem1DomRef.offsetWidth + ")");
			assert.ok(Math.abs(this.oItem2DomRef.offsetWidth - 101) <= 1, "Width of Item 2 should be 101 (is " + this.oItem2DomRef.offsetWidth + ")");
			assert.ok(Math.abs(this.oItem3DomRef.offsetWidth - 43) <= 1, "Width of Item 3 should be 43 (is " + this.oItem3DomRef.offsetWidth + ")");
		}
	});

	QUnit.test("Base Size", function(assert) {
		this.oItem1LayoutData.setBaseSize("20%");
		this.oItem2LayoutData.setBaseSize("30%");
		this.oItem3LayoutData.setBaseSize("50%");
		assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 78) <= 1, "Width of Item 1 should be 78 (is " + this.oItem1DomRef.offsetWidth + ")");
		assert.ok(Math.abs(this.oItem2DomRef.offsetWidth - 116) <= 1, "Width of Item 2 should be 116 (is " + this.oItem2DomRef.offsetWidth + ")");
		assert.ok(Math.abs(this.oItem3DomRef.offsetWidth - 194) <= 1, "Width of Item 3 should be 194 (is " + this.oItem3DomRef.offsetWidth + ")");
	});

	QUnit.test("Min Height", function(assert) {
		this.oBox.setAlignItems("Start");
		this.oItem1LayoutData.setMinHeight("200px");
		assert.ok(Math.abs(this.oItem1DomRef.offsetHeight - 200) <= 1, "Height of Item 1 should be 200 (is " + this.oItem1DomRef.offsetHeight + ")");
	});

	QUnit.test("Max Height", function(assert) {
		this.oItem1LayoutData.setMaxHeight("60px");
		assert.ok(Math.abs(this.oItem1DomRef.offsetHeight - 60) <= 1, "Height of Item 1 should be 60 (is " + this.oItem1DomRef.offsetHeight + ")");
	});

	QUnit.test("Min Width", function(assert) {
		this.oItem1LayoutData.setMinWidth("200px");
		assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 200) <= 1, "Width of Item 1 should be 200 (is " + this.oItem1DomRef.offsetWidth + ")");
	});

	QUnit.test("Max Width", function(assert) {
		this.oItem1LayoutData.setGrowFactor(1);
		this.oItem1LayoutData.setMaxWidth("60px");
		assert.ok(Math.abs(this.oItem1DomRef.offsetWidth - 60) <= 1, "Width of Item 1 should be 60 (is " + this.oItem1DomRef.offsetWidth + ")");
	});

	QUnit.module("Item Aggregation", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = 3;
			this.vItemConfigs = 3;
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oItem1 = this.oBox.getItems()[0];
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Add Item", function(assert) {
		this.oItem5 = new HTML("item5", {
			content: "<div class='items'>5</div>"
		});
		this.oBox.addItem(this.oItem5);
		sap.ui.getCore().applyChanges();
		assert.ok(this.oItem5.getDomRef(), "Item 5 should be rendered");
	});

	QUnit.test("Insert Item", function(assert) {
		this.oItem6 = new HTML("item6", {
			content: "<div class='items'>6</div>"
		});
		this.oBox.insertItem(this.oItem6, 2);
		sap.ui.getCore().applyChanges();
		var oFlexItem6 = this.oItem6.getDomRef().parentNode;
		assert.ok(this.oItem6.getDomRef(), "Item 6 should be rendered");
		assert.equal(Array.prototype.indexOf.call(oFlexItem6.parentNode.children, oFlexItem6), 2, "Item 6 should be rendered as the third element");
	});

	QUnit.test("Remove Item", function(assert) {
		assert.ok((this.oItem1.getDomRef().parentElement.parentElement === this.oBox.getDomRef()), "Item 1 is present");
		this.oBox.removeItem(this.oItem1);
		sap.ui.getCore().applyChanges();
		assert.ok((this.oItem1.getDomRef().parentElement.parentElement !== this.oBox.getDomRef()), "Item 1 should have been removed");
	});

	QUnit.test("Remove All Items", function(assert) {
		this.oBox.removeAllItems();
		sap.ui.getCore().applyChanges();
		assert.equal(this.oBox.getDomRef().children.length, 0, "All items should have been removed");
	});

	QUnit.module("Nested FlexBoxes", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = [
				VBox,
				HTML,
				HTML
			];
			this.vItemConfigs = [
				{
				layoutData: new FlexItemData({
					baseSize: "0",
					growFactor: 3
				})
				},
				{
				content: "<div class='items'>2</div>",
				layoutData: new FlexItemData({})
				},
				{
				content: "<div class='items'>3</div>",
				layoutData: new FlexItemData({})
				}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oItem1 = this.oBox.getItems()[0];
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("Rendered without wrapper", function(assert) {
		assert.ok(this.oItem1.getDomRef().classList.contains("sapMVBox"), "Inner VBox should be rendered without a wrapper");
	});

	QUnit.test("Class names duplication check", function(assert) {
		var aClassesList = this.oItem1.getDomRef().className.split(" ");
		var iClassesLength = aClassesList.length;
		var iClassesLengthWithoutDuplicate = Array.from(new Set(aClassesList)).toString().split(",").length;

		assert.equal(iClassesLength, iClassesLengthWithoutDuplicate, "There are no duplicated class names" );
	});

	QUnit.module("FlexItemData", {
		beforeEach: function() {

			this.oLayoutData = new FlexItemData({
				styleClass: "class1"
			});

			this.oBox = new FlexBox({
				items: [
					new sap.m.Button({
						text : "Text",
						layoutData: this.oLayoutData
					})
				]
			});

			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {

			this.oLayoutData = null;

			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("FlexItemData properties", function(assert) {

		assert.ok(this.oBox.$()[0].firstChild.classList.contains('class1'), "class1 is added");

		this.oLayoutData.setStyleClass('class2');
		sap.ui.getCore().applyChanges();

		assert.ok(this.oBox.$()[0].firstChild.classList.contains('class2'), "class2 is added");

		this.oBox.setRenderType("Bare");
		sap.ui.getCore().applyChanges();

		assert.ok(this.oBox.$()[0].firstChild.classList.contains('class2'), "class2 is added");

		this.oLayoutData.setStyleClass('class3');
		sap.ui.getCore().applyChanges();

		assert.ok(this.oBox.$()[0].firstChild.classList.contains('class3'), "class3 is added");
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oBoxConfig = {};
			this.vItemTemplates = [
				FlexBox,
				FlexBox
			];
			this.vItemConfigs = [
				{},
				{}
			];
			this.oBox = getFlexBoxWithItems(this.oBoxConfig, this.vItemTemplates, this.vItemConfigs);
			this.oBox.placeAt(DOM_RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oBox.destroy();
			this.oBox = null;
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		assert.ok(!!this.oBox.getAccessibilityInfo, "FlexBox has a getAccessibilityInfo function");
		var oInfo = this.oBox.getAccessibilityInfo();
		assert.ok(!!oInfo, "getAccessibilityInfo returns a info object");
		assert.ok(oInfo.role === undefined || oInfo.editable === null, "AriaRole");
		assert.ok(oInfo.type === undefined || oInfo.editable === null, "Type");
		assert.ok(oInfo.description === undefined || oInfo.editable === null, "Description");
		assert.ok(oInfo.focusable === undefined || oInfo.editable === null, "Focusable");
		assert.ok(oInfo.enabled === undefined || oInfo.editable === null, "Enabled");
		assert.ok(oInfo.editable === undefined || oInfo.editable === null, "Editable");
		assert.ok(oInfo.children && oInfo.children.length == 2, "Children");
	});
});
