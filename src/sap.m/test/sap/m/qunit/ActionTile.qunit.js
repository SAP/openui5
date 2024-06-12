/*global QUnit */
sap.ui.define([
	"sap/m/ActionTile",
	"sap/m/ActionTileContent",
	"sap/m/TileAttribute",
	"sap/m/TileContent",
	"sap/m/library",
	"sap/m/FormattedText",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/model/json/JSONModel",
	"sap/m/ContentConfig",
	"sap/ui/core/theming/Parameters",
	"sap/m/Link",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
], function(
	ActionTile,
	ActionTileContent,
	TileAttribute,
	TileContent,
	library,
	FormattedText,
	Button,
	oCore,
	Library,
	KeyCodes,
	jQuery,
	JSONModel,
	ContentConfig,
	Parameters,
	Link,
	nextUIUpdate,
	Element
) {
	"use strict";

	// shortcut for sap.m.FrameType
	var FrameType = library.FrameType;

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	//shortcut for sap.m.Priority
	var Priority = library.Priority;

	//shortcut for sap.m.ContentConfigType
	var ContentConfigType = library.ContentConfigType;

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
		beforeEach: async function() {
			var oModel = new JSONModel({
				attributes: [
					{
						label: "Agreement Type:",
						type: ContentConfigType.Text,
						text:"SAP",
						href:"https://www.sap.com/"
					},
					{
						label: "Supplier",
						type: ContentConfigType.Link,
						text:"SAP",
						href:"https://www.sap.com/"
					},
					{
						label: "Target Net Value:",
						type: ContentConfigType.Link,
						text:"SAP",
						href:"https://www.sap.com/"
					},
					{
						label: "Attribute four",
						type: ContentConfigType.Link,
						text:"SAP",
						href:"https://www.sap.com/"
					},
					{
						label: "Attribute five",
						type: ContentConfigType.Link,
						text:"SAP",
						href:"https://www.sap.com/"
					}
				]
			});
            this.oToDo = new ActionTile("todo", {
				header: "Comparative Annual Totals",
				url: "https://www.sap.com/",
				tileContent: new ActionTileContent("tileCont1", {
				priority: Priority.VeryHigh,
				linkPress: Function.prototype,
				priorityText: "Very High",
				attributes: {
					path: "/attributes",
					template: new TileAttribute({
						label: "{label}",
						contentConfig: new ContentConfig({
							type:"{type}",
							text:"{text}",
							href:"{href}"
						})
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
				url: "https://www.sap.com/",
                headerImage: "sap-icon://alert",
                valueColor:"Critical",
				priority: Priority.VeryHigh,
				priorityText: "Very High",
				tileContent: new TileContent("tileCont2", {
					content: new FormattedText("frmt-txt2", {
						htmlText : "<span>This would be a situation long text description. it would have 3 lines of space, as a maximum else get truncated</span><p>Supplier<br>Domestic US Supplier 1</p><p>Due On:<br>28.09.2022</p> <p>Created On: <br>01.09.2022</p>"
					})
				}),
                actionButtons: [
					this.oActionButton1 = new Button()
				]
			}).placeAt("qunit-fixture");

			await nextUIUpdate();
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
		assert.equal(this.oSituation.getDomRef().tagName,'A',"Tile has been rendered as anchor tag  as expected");
	});

    QUnit.test("Situation card tests", function(assert) {
        assert.ok(document.getElementById("situation-icon-image"), "Icon has been rendered successfully");
        assert.equal(this.oSituation.getTileContent()[0].getContent().getDomRef().children.length, 4, "All 4 P tags has been rendered successfully");
		assert.equal(this.oToDo.getDomRef().tagName,'A',"Tile has been rendered as anchor tag  as expected");
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

	QUnit.test("Tooltip,aria-label generation on tasks cards when there are less than four attributes", async function(assert) {
		//Arrange
		var oNewModel = new JSONModel({
			attributes: [
				{
					label: "Agreement Type:",
					type: ContentConfigType.Text,
					text:"SAP"
				},
				{
					label: "Supplier",
					type: ContentConfigType.Link,
					text:"SAP",
					href:"https://www.sap.com/"
				}
			]
		});
		this.oToDo.setModel(oNewModel);
		await nextUIUpdate();
		this.oToDo.getDomRef().dispatchEvent(new Event("mouseenter"));
		//Act
		var sToolTip = this.oToDo.getDomRef().getAttribute("title");
		var sAriaLabel = this.oToDo.getDomRef().getAttribute("aria-label");
		//Assert
		assert.equal(sToolTip,this.oToDo._getAriaAndTooltipText(),"Tooltip successfully generated");
		assert.equal(sAriaLabel,this.oToDo._getAriaText(),"Aria-label successfully generated");
	});

	QUnit.test("Setting the width through property", async function(assert) {
		//Arrange
		this.oToDo.setWidth("25rem");
		await nextUIUpdate();
		//Assert
		assert.equal(getComputedStyle(this.oToDo.getDomRef()).width,"400px","Width set correctly");
	});

	QUnit.test("Setting pressEnabled property", async function(assert) {
		assert.ok(this.oToDo.getDomRef().classList.contains("sapMPointer"),"Hand icon would be visible");
		this.oToDo.setPressEnabled(false);
		await nextUIUpdate();
		assert.ok(this.oToDo.getDomRef().classList.contains("sapMAutoPointer"),"Hand icon won't be visible");
	});

	QUnit.test("Setting enableNavigationButton property", async function(assert) {
		//Assert
		assert.notOk(this.oToDo.getEnableNavigationButton(),"By default enableActionButton property has been set to false");
		assert.ok(this.oToDo.hasStyleClass("sapMATHideActionButton"),"Style class has been added sucessfully");
		assert.notOk(this.oSituation.getEnableNavigationButton(),"By default enableActionButton property has been set to false");
		assert.ok(this.oSituation.hasStyleClass("sapMATHideActionButton"),"Style class has been added sucessfully");
		//Arrange
		this.oToDo.setEnableNavigationButton(true);
		this.oSituation.setEnableNavigationButton(true);
		await nextUIUpdate();
		//Assert
		assert.notOk(this.oToDo.hasStyleClass("sapMATHideActionButton"),"Style class should not get added");
		assert.notOk(this.oSituation.hasStyleClass("sapMATHideActionButton"),"Style class should not get added");
	});

	QUnit.test("Priority text will not be rendered on the ToDo cards", function(assert) {
		var sPriority = Library.getResourceBundleFor("sap.m").getText("TEXT_CONTENT_PRIORITY");
		assert.notOk(document.querySelector("#tileCont1-priority-value").innerText.includes(sPriority),"Priority text is not rendered inside the tile");
	});

	QUnit.test("Priority text will not be rendered on the tooltip of the ToDo cards", function(assert) {
		var sPriority = Library.getResourceBundleFor("sap.m").getText("TEXT_CONTENT_PRIORITY");
		assert.notOk(this.oToDo.getTileContent()[0].getAltText().includes(sPriority),"Priority text is not rendered inside the tooltip");
	});

	QUnit.test("Border radius has been set to 0.25 rem in non-horizon themes", function(assert) {
		var sBorderRadius,fnDone;
		sBorderRadius = Parameters.get({name:"sapTile_BorderCornerRadius",
		callback: function (sBRadius) {
			var boundFn = fnPerformAssertion.bind(this);
			boundFn(sBRadius);
			fnDone();
		}.bind(this)});
		function fnPerformAssertion(sExpectedValue) {
			assert.equal(getComputedStyle(this.oToDo.getDomRef()).borderRadius.slice(0,-2) * 1,sExpectedValue.slice(0,-3) * 16,"Border-radius has been set to the sapTile_BorderCornerRadius parameter");
		}
		if (sBorderRadius) {
			var boundFn = fnPerformAssertion.bind(this);
			boundFn(sBorderRadius);
		} else {
			fnDone = assert.async();
		}
	});

	QUnit.test("One press event has been attached to the link after rerendering the tile", async function(assert) {
		this.oToDo.setHeader("Demo Tile");
		await nextUIUpdate();
		var oLink = this.oToDo.getTileContent()[0].getAttributes()[1].getContentConfig().getInnerControl();
		assert.equal(oLink.mEventRegistry.press.length,1,"Only one event has been attached to the press event of the link");

	});

	QUnit.test("ActionTile on whether the height is set to auto when dynamicHeight is enabled", async function (assert) {
		var iOriginalHeight = getComputedStyle(this.oToDo.getDomRef()).height.slice(0,-2) * 1;
		this.oToDo.setEnableDynamicHeight(true);
		this.oToDo.getTileContent()[0].addAggregation({
			label: "Agreement Type:",
			type: ContentConfigType.Text,
			text:"SAP"
		});
		await nextUIUpdate();
		var iCurrentHeight = getComputedStyle(this.oToDo.getDomRef()).height.slice(0,-2) * 1;
		assert.ok(iCurrentHeight > iOriginalHeight,"Height has been increased dynamically");
	});

	QUnit.test("ActionTileContent: Header Link Support Tests", async function (assert) {
		//setup action tile content
		var oActionTileContent = new ActionTileContent("action-tile-content", {
			headerLink: new Link(),
			attributes: [
				new TileAttribute({
					label: "Test Attribute",
					contentConfig: new ContentConfig({
						type:"Text",
						text:"Test Value"
					})
				})
			]
		});

		//render action tile
		var oActionTile = new ActionTile("action-tile", {
			header: "My Action Tile",
			tileContent: oActionTileContent
		});
		oActionTile.placeAt("qunit-fixture");
		await nextUIUpdate();

		//should only render header link if present
		assert.ok(document.getElementById("action-tile-content-header-link"), "header link rendered");

		//should only render priority if present
		oActionTileContent.setHeaderLink();
		oActionTileContent.setPriority("Medium");
		oActionTileContent.setPriorityText("Medium Priority");
		await nextUIUpdate();
		assert.ok(document.getElementById("action-tile-content-priority-value"), "priority rendered");

		//should render header link even if priority is present
		var sLinkText = "My Custom Link";
		oActionTileContent.setHeaderLink(new Link({ text: sLinkText }));
		await nextUIUpdate();
		assert.ok(document.getElementById("action-tile-content-header-link"), "header link rendered");

		//should return the correct tooltip and aria-label
		oActionTile.getDomRef().dispatchEvent(new Event("mouseenter"));
		var sToolTip = oActionTile.getDomRef().getAttribute("title");
		var sAriaLabel = oActionTile.getDomRef().getAttribute("aria-label");
		assert.equal(sToolTip, oActionTile._getAriaAndTooltipText(), "tooltip successfully generated");
		assert.equal(sAriaLabel, oActionTile._getAriaText(), "aria-label successfully generated");
		assert.ok(sToolTip.includes(sLinkText) && sAriaLabel.includes(sLinkText), "link text present in tooltip and aria-label");

		//Cleanup
		oActionTile.destroy();
		oActionTileContent.destroy();
	});

	QUnit.test("ActionTileContent: Priority Support Tests", async function (assert) {
		//setup action tile content
		var oActionTileContent = new ActionTileContent("action-tile-content", {
			headerLink: new Link(),
			attributes: [
				new TileAttribute({
					label: "Test Attribute",
					contentConfig: new ContentConfig({
						type:"Text",
						text:"Test Value"
					})
				})
			]
		});

		//render action tile
		var oActionTile = new ActionTile("action-tile", {
			header: "My Action Tile",
			tileContent: oActionTileContent
		});
		oActionTile.placeAt("qunit-fixture");
		await nextUIUpdate();

		//should not render header container or priority text if priority is not specified
		assert.notOk(document.getElementById("action-tile-header-container"), "header container not rendered");
		assert.notOk(document.getElementById("action-tile-priority-text"), "priority text is not rendered");

		//should render header container and priority text if priority is specified
		var sPriority = "Medium";
		var sPriorityText = "Medium Priority";
		oActionTile.setPriority(sPriority);
		oActionTile.setPriorityText(sPriorityText);
		await nextUIUpdate();
		assert.ok(document.getElementById("action-tile-header-container"), "header container is rendered");
		assert.ok(document.getElementById("action-tile-priority-text"), "priority text is rendered");
		assert.ok(document.getElementById("action-tile-priority-text").classList.contains(sPriority), "priority style class is applied");

		//should return the correct tooltip and aria-label
		oActionTile.getDomRef().dispatchEvent(new Event("mouseenter"));
		var sToolTip = oActionTile.getDomRef().getAttribute("title");
		var sAriaLabel = oActionTile.getDomRef().getAttribute("aria-label");
		assert.equal(sToolTip, oActionTile._getAriaAndTooltipText(), "tooltip successfully generated");
		assert.equal(sAriaLabel, oActionTile._getAriaText(), "aria-label successfully generated");
		assert.ok(sToolTip.includes(sPriorityText) && sAriaLabel.includes(sPriorityText), "priority text present in tooltip and aria-label");

		//Cleanup
		oActionTile.destroy();
		oActionTileContent.destroy();
	});

	QUnit.test("ActionTileContent: IconFrame Support Tests", async function (assert) {
		//setup action tile content
		var oActionTileContent = new ActionTileContent("action-tile-content", {
			headerLink: new Link(),
			attributes: [
				new TileAttribute({
					label: "Test Attribute",
					contentConfig: new ContentConfig({
						type:"Text",
						text:"Test Value"
					})
				})
			]
		});

		//render action tile
		var oActionTile = new ActionTile("action-tile", {
			header: "My Action Tile",
			headerImage: "sap-icon://workflow-tasks",
			tileContent: oActionTileContent
		});
		oActionTile.placeAt("qunit-fixture");
		await nextUIUpdate();

		//should not render icon frame container if enableIconFrame is not specified or false
		assert.notOk(document.getElementById("action-tile-icon-frame"), "icon frame not rendered");

		//should render icon frame if enableIconFrame is true
		oActionTile.setEnableIconFrame(true);
		await nextUIUpdate();

		assert.ok(document.getElementById("action-tile-icon-frame"), "icon frame is rendered");
		assert.ok(Element.getElementById("action-tile-icon-frame").isA("sap.m.Avatar"), "icon frame is an avatar control");
		assert.ok(document.getElementsByClassName("sapMGTIconFrameBadge").length === 0, "badge icon not rendered");

		//should render badge icon if badgeIcon and badgeValueState are specified
		oActionTile.setEnableIconFrame(true);
		oActionTile.setBadgeIcon("sap-icon://high-priority");
		oActionTile.setBadgeValueState("Error");
		await nextUIUpdate();

		assert.ok(document.getElementsByClassName("sapMGTIconFrameBadge").length === 1, "badge icon is rendered");

		//should not render badge icon if badgeIcon is not specified
		oActionTile.setBadgeIcon("");
		await nextUIUpdate();

		assert.ok(document.getElementsByClassName("sapMGTIconFrameBadge").length === 0, "badge icon not rendered");

		//Cleanup
		oActionTile.destroy();
		oActionTileContent.destroy();
	});

	QUnit.test("The text and priority are centered aligned with the icon", function (assert) {
		//setup action tile content
		var oHeaderContainer = this.oSituation.getDomRef("header-container");
		assert.equal(getComputedStyle(oHeaderContainer).justifyContent,"center","Text aligned to the center");
	});
});