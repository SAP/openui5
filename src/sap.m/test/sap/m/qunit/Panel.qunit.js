/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/m/Title",
	"sap/m/OverflowToolbar",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function(
	Panel,
	Text,
	Button,
	mobileLibrary,
	Toolbar,
	Label,
	Device,
	Title,
	OverflowToolbar,
	jQuery,
	nextUIUpdate,
	qutils,
	KeyCodes
) {
	"use strict";

	// shortcut for sap.m.PanelAccessibleRole
	var PanelAccessibleRole = mobileLibrary.PanelAccessibleRole;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;


	QUnit.module("API", {
		beforeEach: async function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		}
	});

	QUnit.test("Call to setWidth() with string value 100px", function (assert) {
		this.oPanel.setWidth("100px");

		assert.strictEqual(this.oPanel.getWidth(), "100px", "should set the size to 100px");
	});

	QUnit.test("Call to setWidth() with string value 59%", function (assert) {
		this.oPanel.setWidth("59%");

		assert.strictEqual(this.oPanel.getWidth(), "59%", "should set the size to 59%");
	});

	QUnit.test("Call to setWidth() with string value 10em", function (assert) {
		this.oPanel.setWidth("10em");

		assert.strictEqual(this.oPanel.getWidth(), "10em", "should set the size to 10em");
	});

	QUnit.test("Call to setWidth() with string value 10rem", function (assert) {
		this.oPanel.setWidth("10rem");

		assert.strictEqual(this.oPanel.getWidth(), "10rem", "should set the size to 10rem");
	});

	QUnit.test("Call to setWidth() with string value auto", function (assert) {
		this.oPanel.setWidth("auto");

		assert.strictEqual(this.oPanel.getWidth(), "auto", "should set the size to auto");
	});

	QUnit.test("Call to setHeight() with string value 100px", function (assert) {
		this.oPanel.setHeight("100px");

		assert.strictEqual(this.oPanel.getHeight(), "100px", "should set the size to 100px");
	});

	QUnit.test("Call to setHeight() with string value 59%", function (assert) {
		this.oPanel.setHeight("59%");

		assert.strictEqual(this.oPanel.getHeight(), "59%", "should set the size to 59%");
	});

	QUnit.test("Call to setHeight() with string value 10em", function (assert) {
		this.oPanel.setHeight("10em");

		assert.strictEqual(this.oPanel.getHeight(), "10em", "should set the size to 10em");
	});

	QUnit.test("Call to setHeight() with string value 10rem", function (assert) {
		this.oPanel.setHeight("10rem");

		assert.strictEqual(this.oPanel.getHeight(), "10rem", "should set the size to 10rem");
	});

	QUnit.test("Call to setHeight() with string value auto", function (assert) {
		this.oPanel.setHeight("auto");

		assert.strictEqual(this.oPanel.getHeight(), "auto", "should set the size to auto");
	});

	QUnit.test("Call to setExpandable() with boolean value true", async function (assert) {
		this.oPanel.setExpandable(true);
		await nextUIUpdate();

		assert.strictEqual(this.oPanel.getExpandable(), true, "should set the expandable property to true");
		assert.notStrictEqual(this.oPanel._oExpandButton, undefined, "should create an icon");
	});

	QUnit.test("Call to setExpanded() with null value", async function (assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(null);
		await nextUIUpdate();

		assert.strictEqual(this.oPanel.getExpanded(), false, "should set the expanded property to false");
	});

	QUnit.test("Default Panel backgroundDesign", function (assert) {
		assert.strictEqual(this.oPanel.getBackgroundDesign(), BackgroundDesign.Translucent, "should be sap.m.BackgroundDesign.Translucent");
	});

	QUnit.test("Default accessibleRole", function (assert) {
		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Form, "should be sap.m.PanelAccessibleRole.Form");
	});

	QUnit.test("Call to setAccessibleRole() with Region value", async function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		await nextUIUpdate();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Region, "should set the accessibleRole property to Region");
		assert.strictEqual(this.oPanel.$().attr("role"), "region", "should set the role attribute in the DOM to region");
	});

	QUnit.test("Call to setAccessibleRole() with Form value", async function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Form);
		await nextUIUpdate();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Form, "should set the accessibleRole property to Form");
		assert.strictEqual(this.oPanel.$().attr("role"), "form", "should set the role attribute in the DOM to form");
	});

	QUnit.test("Call to setAccessibleRole() with Complementary value", async function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Complementary);
		await nextUIUpdate();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Complementary, "should set the accessibleRole property to Complementary");
		assert.strictEqual(this.oPanel.$().attr("role"), "complementary", "should set the role attribute in the DOM to complementary");
	});

	QUnit.test("Default Panel stickyHeader", function (assert) {
		assert.strictEqual(this.oPanel.getStickyHeader(), false, "should be false");
	});

	QUnit.test("Call to setStickyHeader() with boolean value true", function (assert) {
		this.oPanel.setStickyHeader(true);

		assert.strictEqual(this.oPanel.getStickyHeader(), true, "should set the stickyHeader property to true");
	});

	QUnit.module("Events", {
		createPanel: async function (options) {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				],
				expandable: true,
				expanded: options.expanded
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		}
	});

	QUnit.test("Changing the expand property from true to false", async function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('expand');
			});

		await this.createPanel({ expanded: true });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(false);

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire expand event once");
		assert.strictEqual(bPassedArg, false, "should pass false as argument");
	});

	QUnit.test("Changing the expand property from false to true", async function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('expand');
			});

		await this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(true);

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire expand event once");
		assert.strictEqual(bPassedArg, true, "should pass true as argument");
	});

	QUnit.test("triggeredByInteraction when setting expanded by a setter", async function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
			});

		await this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(true);

		assert.notOk(bPassedArg, "Event should be triggered by a setter");
	});

	QUnit.test("triggeredByInteraction when setting expanded by an user interaction", async function(assert) {
		var bPassedArg, bExpand,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
				bExpand = oEvent.getParameter('expand');
			});

		await this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.ontap({
			target: this.oPanel._oExpandButton.getDomRef()
		});

		assert.ok(bPassedArg, "Event should be triggered by an user interaction");
		assert.ok(bExpand, "The expand parameter should be true");
	});

	QUnit.test("onsapspace()", async function(assert) {
		var bPassedArg, bExpand,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
				bExpand = oEvent.getParameter('expand');
			});

		await this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.onsapspace({
			target: this.oPanel.getDomRef().querySelector(".sapMPanelWrappingDiv"),
			preventDefault: function () {},
			originalEvent: {
				repeat: false
			}
		});

		var fnTapSpy = this.spy(this.oPanel, "ontap");

		this.oPanel.onsapspace({
			target: this.oPanel.getDomRef().querySelector(".sapMPanelWrappingDiv"),
			preventDefault: function () {},
			originalEvent: {
				repeat: true
			}
		});

		assert.ok(bPassedArg, "Event should be triggered by an user interaction");
		assert.ok(bExpand, "Event should be triggered by an user interaction");
		assert.notOk(fnTapSpy.called, "The event action is not repeated");
	});

	QUnit.test("onsapenter()", async function(assert) {
		var bPassedArg, bExpand,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
				bExpand = oEvent.getParameter('expand');
			});

		await this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.onsapenter({
			target: this.oPanel._oExpandButton.getDomRef()
		});

		assert.ok(bPassedArg, "Event should be triggered by an user interaction");
		assert.ok(bExpand, "Event should be triggered by an user interaction");
	});

	QUnit.test("ontap()", async function(assert) {
		await this.createPanel({ expanded: false });
		this.oPanel.ontap({
			target: this.oPanel.getDomRef('content')
		});

		assert.notOk(this.oPanel.getExpanded(), "Triggering tap on the content should not expand the Panel");

		this.oPanel.ontap({
			target: this.oPanel._oExpandButton.getDomRef()
		});

		assert.ok(this.oPanel.getExpanded(), "Triggering tap on the content should not expand the Panel");
	});

	QUnit.module("Rendering", {
		beforeEach: async function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		},
		createToolbar: function () {
			return new Toolbar({
				content : [new Label({
					text : "Panel header"
				})]
			});
		}
	});

	QUnit.test("Header toolbar should override header text", async function(assert) {
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();

		var $header = this.oPanel.$().find(".sapMPanelHdr");

		assert.equal($header.length, 0, "Header text should not be rendered.");
	});

	QUnit.module("CSS classes", {
		beforeEach: async function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				],
				stickyHeader: true
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		},
		createToolbar: function () {
			return new Toolbar({
				content: [
					new Label({text: "Panel header"})
				],
				height: "50px"
			});
		}
	});

	QUnit.test("Panel with header text and content", function(assert) {
		var $panel = this.oPanel.$();

		assert.ok($panel.hasClass("sapMPanel"), "should have sapMPanel class on root element");
		assert.ok(jQuery(".sapMPanelHeadingDiv div:first-child", $panel).hasClass("sapMPanelHdr"), "should have sapMPanelHdr class present on first header");
	});

	QUnit.test("Expandable panel with headerText", async function(assert) {
		this.oPanel.setExpandable(true);
		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelWrappingDiv").length, 1, "should have wrapping div with sapMPanelWrappingDiv class");
		assert.strictEqual($panel.find(".sapMPanelExpandablePart").length, 1, "should have content area with sapMPanelExpandablePart class");
	});

	QUnit.test("Expandable and expanded panel with headerText", async function(assert) {
		// Arrange
		var panel = new Panel({
			headerText: "test",
			expandable: true,
			expanded: true
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDiv").length, 1, "should have wrapping div with sapMPanelWrappingDiv class");
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivExpanded class");

		// Act
		panel.setExpanded(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(panel.$().hasClass(".sapMPanelWrappingDivExpanded"), "sapMPanelWrappingDivExpanded class should be removed");

		// Act
		panel.setExpanded(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivExpanded class");

		// Clean up
		panel.destroy();
	});

	QUnit.test("Expandable and expanded panel with headerToolbar", async function(assert) {
		// Arrange
		var panel = new Panel({
			headerToolbar: this.createToolbar(),
			expandable: true,
			expanded: true
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		// Assert
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivTb").length, 1, "should have wrapping div with sapMPanelWrappingDivTb class");
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivTbExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivTbExpanded class");
		assert.strictEqual(panel.$().find(".sapMPanelHeaderTB").length, 1, "should have a toolbar with sapMPanelHeaderToolbar class");

		// Act
		panel.setExpanded(false);
		await nextUIUpdate();

		// Assert
		assert.notOk(panel.$().hasClass(".sapMPanelWrappingDivTbExpanded"), "sapMPanelWrappingDivTbExpanded class should be removed");

		// Act
		panel.setExpanded(true);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivTbExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivTbExpanded class");

		// Clean up
		panel.destroy();
	});

	QUnit.test("Expandable panel with headerToolbar and infoToolbar", async function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		this.oPanel.setAggregation("infoToolbar", this.createToolbar());

		await nextUIUpdate();

		var $panel = this.oPanel.$();
		var oInfoToolbarWrapper = jQuery(".sapMPanelExpandablePart")[0];

		assert.strictEqual($panel.find(".sapMPanelWrappingDivTb").length, 1, "should have wrapping div with sapMPanelWrappingDivTb class");
		assert.strictEqual($panel.find(".sapMPanelExpandablePart").length, 2, "should have infoToolbar and content area with sapMPanelExpandablePart class");
		assert.strictEqual(jQuery(oInfoToolbarWrapper).is("div"), true, "InfoToolbar should be wrapped in div");
		assert.strictEqual($panel.find(".sapMPanelHeaderTB").length, 1, "should have a toolbar with sapMPanelHeaderToolbar class");
		assert.strictEqual($panel.find(".sapMPanelInfoTB").length, 1, "should have a toolbar with sapMPanelInfoToolbar class");
	});

	QUnit.test("Expandable Panel expanded/collapsed", async function(assert) {
		// Act
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(true);
		await nextUIUpdate();

		var oButton = this.oPanel._oExpandButton;

		// Assert
		assert.strictEqual(oButton.getSrc(), "sap-icon://slim-arrow-down", "should have sapMPanelExpandableButton class present once");

		// Act
		this.oPanel.setExpanded(false);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oButton.getSrc(), "sap-icon://slim-arrow-right", "should have sapMPanelExpandableButton class present once");
	});

	QUnit.test("Panel with solid backgroundDesign", async function(assert) {
		this.oPanel.setBackgroundDesign(BackgroundDesign.Solid);
		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGSolid").length, 1, "should have sapMPanelBGSolid class present once");
	});

	QUnit.test("Panel with transparent backgroundDesign", async function(assert) {
		this.oPanel.setBackgroundDesign(BackgroundDesign.Transparent);
		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGTransparent").length, 1, "should have sapMPanelBGTransparent class present once");
	});

	QUnit.test("Panel with translucent backgroundDesign", function(assert) {
		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGTranslucent").length, 1, "should have sapMPanelBGTranslucent class present once");
	});

	QUnit.test("Overflow should be hidden with expandable = true and expanded = false", async function (assert) {

		// Arrange
		var oPanel = new Panel({
			headerText: "Panel Header",
			expandable: true,
			expanded: false,
			infoToolbar: new OverflowToolbar({
				id: "OverflowToolbar1",
				content: new Button({
					text: "In toolbar"
				})
			}),
			content: new Button({
				text: "In toolbar"
			 })
		});

		// Act
		oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		var oInfoToolbarWrapper = jQuery("#OverflowToolbar1");

		// Assert
		assert.strictEqual(jQuery(oInfoToolbarWrapper).is(":visible"), false, "OverflowToolbar should be hidden");

		// cleanup
		oPanel.destroy();
	});

	QUnit.test("Panel with sticky header should have sapMPanelStickyHeadingDiv class", function(assert) {
		var $panel = this.oPanel.$();

		assert.ok(jQuery(".sapMPanelHeadingDiv", $panel).hasClass("sapMPanelStickyHeadingDiv"), "should have sapMPanelStickyHeadingDiv class present on first header");
	});

	QUnit.module("Computed styles", {
		beforeEach: async function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		},
		createToolbar: function (sHeight) {
			return new Toolbar({
				content: [
					new Label({text: "Panel header"})
				],
				height: sHeight
			});
		}
	});

	QUnit.test("Sizes should be equal to the ones set through the setters", async function(assert) {
		this.oPanel.setWidth("400px");
		this.oPanel.setHeight("300px");

		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.width(), 400, "width === 400");
		assert.strictEqual($panel.height(), 300, "Height === 300");
	});

	QUnit.test("Content for panel with 200px height when headerToolbar and infoToolbar are 100px", async function(assert) {
		this.oPanel.setHeight("200px");
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		this.oPanel.setAggregation("infoToolbar", this.createToolbar("50px"));

		await nextUIUpdate();

		var $content = this.oPanel.$().find(".sapMPanelContent");

		assert.equal($content.outerHeight(), 100, "should be 100px");
	});

	QUnit.test("Content height should always be the panel's height ", async function(assert) {
		// Arrange
		var oContentDom;

		// Act
		this.oPanel.setHeaderText("");
		this.oPanel.setHeight("200px");

		await nextUIUpdate();
		oContentDom = this.oPanel.getDomRef("content");

		// Assert
		assert.equal(oContentDom.offsetHeight, 200, "Content height should be 200px");

		// Act
		this.oPanel.setHeight("50%");
		await nextUIUpdate();

		// Assert
		assert.equal(oContentDom.offsetHeight, 500, "Content height should be 500px - the full panel's height (50% of the quinit-fixture container height");
	});

	QUnit.test("Content of expandable Panel when expanded",async function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(true);

		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelContent").css("display"), "block", "should have display:block style present");
	});

	QUnit.test("Content of expandable Panel when collapsed", async function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(false);

		await nextUIUpdate();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelContent").css("display"), "none", "should have display:none style present");
	});

	QUnit.test("Expandable panel with headerToolbar - toolbar should not have border", async function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		await nextUIUpdate();

		var $toolbar = this.oPanel.$().find(".sapMTB");

		assert.equal($toolbar.css("border-bottom-width"), "0px", "toolbar border should be 0px");
	});

	QUnit.test("Expandable panel with headerToolbar - first toolbar child should not have margin-left", async function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		await nextUIUpdate();

		var $toolbar = this.oPanel.$().find(".sapMTB");
		var $firstToolbarChild = $toolbar.children().eq(0);

		assert.equal($firstToolbarChild.css("margin-left"), "0px", "first toolbar child margin-left should be 0px");
	});

	QUnit.test("Container height exception handling", function (assert) {
		// System under Test + Act
		var oContainer = new Panel({height: "100px"});
		var oSpy = this.spy(oContainer, "_setContentHeight");

		// Act
		oContainer._setContentHeight();

		// Assert
		assert.strictEqual(oSpy.threw(), false, "Should not have thrown any exceptions.");

		// Cleanup
		oSpy.restore();
		oContainer.destroy();
	});

	QUnit.module("ARIA attributes", {
		beforeEach: async function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		},
		createToolbar: function () {
			return new Toolbar({
				content : [new Title({
					text : "Panel header"
				})]
			});
		}
	});

	QUnit.test("Panel with header text and content", async function(assert) {
		var $panel = this.oPanel.$(),
			sPanelHeaderId = this.oPanel.getId() + '-header',
			sHeadingDiv = $panel.find(".sapMPanelHeadingDiv");

		assert.strictEqual(sHeadingDiv.attr("role"), "heading", "Should have a heading element wrapping the header button.");
		assert.strictEqual(sHeadingDiv.attr("aria-level"), "2", "Should have a heading element with aria-level=2");
		assert.strictEqual($panel.attr("aria-labelledby"), sPanelHeaderId, "should have a labelledby reference to the header");

		this.oPanel.setExpandable(true);
		await nextUIUpdate();

		assert.notOk($panel.attr("aria-labelledby"), "should not have a labelledby reference to the header, when there is no headerToolbar");
	});

	QUnit.test("Panel with header text and header toolbar", async function(assert) {
		var sHeadingDiv = this.oPanel.$().find(".sapMPanelHeadingDiv");

		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();

		assert.notOk(sHeadingDiv.attr("role"), "Should not have a heading element wrapper.");
		assert.notOk(sHeadingDiv.attr("aria-level"), "Should not have an aria-level set");
		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), this.oPanel.getHeaderToolbar().getTitleId(), "should have a labelledby reference to the toolbar title.");
	});

	QUnit.test("Expandable panel with headerText and header toolbar", async function(assert) {
		this.stub(Device, "browser").value({ msie: false });
		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();

		var sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have a labelledby reference to the toolbar title");
		assert.strictEqual(this.oPanel._oExpandButton.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with headerText and reinitialized header toolbar", async function(assert) {
		this.stub(Device, "browser").value({ msie: false });
		var sHeaderToolbarTitleId, sNewHeaderToolbarTitleId;

		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();
		sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		// Initialize new header toolbar
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();
		sNewHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.notStrictEqual(sHeaderToolbarTitleId, sNewHeaderToolbarTitleId, "The new header toolbar should have different id than the initial one");
		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sNewHeaderToolbarTitleId, "should have a labelledby reference to the new toolbar title");
		assert.strictEqual(this.oPanel._oExpandButton.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with role Form", async function(assert) {
		var sHeaderToolbarTitleId;
		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Form);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();

		sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have a labelledby reference to the new toolbar title");
		assert.strictEqual(this.oPanel._oExpandButton.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with aria-controls attribute", async function(assert) {
		var sContentId;
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		await nextUIUpdate();

		sContentId = this.oPanel.getDomRef("content").id;
		assert.strictEqual(this.oPanel._oExpandButton.$().attr("aria-controls"), sContentId,
				"an aria-controls attribute with reference to the content should be added to the collapse button");
	});

	QUnit.test("aria-labelledby", async function (assert) {
		var oPanel = new Panel();

		oPanel.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oPanel.$().attr("aria-labelledby"), undefined, "There should be no aria-labelledby when there's no header or headerText");

		oPanel.destroy();
	});
});