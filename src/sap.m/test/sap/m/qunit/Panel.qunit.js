/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Label",
	"sap/ui/Device",
	"sap/m/Title",
	"sap/m/OverflowToolbar"
], function(
	qutils,
	Panel,
	Text,
	Button,
	mobileLibrary,
	Toolbar,
	Label,
	Device,
	Title,
	OverflowToolbar
) {
	// shortcut for sap.m.PanelAccessibleRole
	var PanelAccessibleRole = mobileLibrary.PanelAccessibleRole;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;


	QUnit.module("API", {
		beforeEach: function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		}
	});

	QUnit.test("Call to setWidth() with string value 100px", function (assert) {
		this.oPanel.setWidth("100px");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getWidth(), "100px", "should set the size to 100px");
	});

	QUnit.test("Call to setWidth() with string value 59%", function (assert) {
		this.oPanel.setWidth("59%");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getWidth(), "59%", "should set the size to 59%");
	});

	QUnit.test("Call to setWidth() with string value 10em", function (assert) {
		this.oPanel.setWidth("10em");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getWidth(), "10em", "should set the size to 10em");
	});

	QUnit.test("Call to setWidth() with string value 10rem", function (assert) {
		this.oPanel.setWidth("10rem");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getWidth(), "10rem", "should set the size to 10rem");
	});

	QUnit.test("Call to setWidth() with string value auto", function (assert) {
		this.oPanel.setWidth("auto");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getWidth(), "auto", "should set the size to auto");
	});

	QUnit.test("Call to setHeight() with string value 100px", function (assert) {
		this.oPanel.setHeight("100px");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getHeight(), "100px", "should set the size to 100px");
	});

	QUnit.test("Call to setHeight() with string value 59%", function (assert) {
		this.oPanel.setHeight("59%");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getHeight(), "59%", "should set the size to 59%");
	});

	QUnit.test("Call to setHeight() with string value 10em", function (assert) {
		this.oPanel.setHeight("10em");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getHeight(), "10em", "should set the size to 10em");
	});

	QUnit.test("Call to setHeight() with string value 10rem", function (assert) {
		this.oPanel.setHeight("10rem");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getHeight(), "10rem", "should set the size to 10rem");
	});

	QUnit.test("Call to setHeight() with string value auto", function (assert) {
		this.oPanel.setHeight("auto");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getHeight(), "auto", "should set the size to auto");
	});

	QUnit.test("Call to setExpandable() with boolean value true", function (assert) {
		this.oPanel.setExpandable(true);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getExpandable(), true, "should set the expandable property to true");
		assert.notStrictEqual(this.oPanel.oIconCollapsed, undefined, "should create an icon");
	});

	QUnit.test("Call to setExpanded() with null value", function (assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(null);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getExpanded(), false, "should set the expanded property to false");
	});

	QUnit.test("Default Panel backgroundDesign", function (assert) {
		assert.strictEqual(this.oPanel.getBackgroundDesign(), BackgroundDesign.Translucent, "should be sap.m.BackgroundDesign.Translucent");
	});

	QUnit.test("Default accessibleRole", function (assert) {
		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Form, "should be sap.m.PanelAccessibleRole.Form");
	});

	QUnit.test("Call to setAccessibleRole() with Region value", function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Region, "should set the accessibleRole property to Region");
		assert.strictEqual(this.oPanel.$().attr("role"), "region", "should set the role attribute in the DOM to region");
	});

	QUnit.test("Call to setAccessibleRole() with Form value", function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Form);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Form, "should set the accessibleRole property to Form");
		assert.strictEqual(this.oPanel.$().attr("role"), "form", "should set the role attribute in the DOM to form");
	});

	QUnit.test("Call to setAccessibleRole() with Complementary value", function (assert) {
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Complementary);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.getAccessibleRole(), PanelAccessibleRole.Complementary, "should set the accessibleRole property to Complementary");
		assert.strictEqual(this.oPanel.$().attr("role"), "complementary", "should set the role attribute in the DOM to complementary");
	});

	QUnit.module("Events", {
		createPanel: function (options) {
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oPanel.destroy();
			this.oPanel = null;
		}
	});

	QUnit.test("Changing the expand property from true to false", function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('expand');
			});

		this.createPanel({ expanded: true });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(false);

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire expand event once");
		assert.strictEqual(bPassedArg, false, "should pass false as argument");
	});

	QUnit.test("Changing the expand property from false to true", function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('expand');
			});

		this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(true);

		assert.strictEqual(fnEventSpy.callCount, 1, "should fire expand event once");
		assert.strictEqual(bPassedArg, true, "should pass true as argument");
	});

	QUnit.test("triggeredByInteraction when setting expanded by a setter", function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
			});

		this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel.setExpanded(true);

		assert.notOk(bPassedArg, "Event should be triggered by a setter");
	});

	QUnit.test("triggeredByInteraction when setting expanded by an user interaction", function(assert) {
		var bPassedArg,
			fnEventSpy = sinon.spy(function (oEvent) {
				bPassedArg = oEvent.getParameter('triggeredByInteraction');
			});

		this.createPanel({ expanded: false });
		this.oPanel.attachExpand(fnEventSpy);
		this.oPanel._getIcon().firePress();

		assert.ok(bPassedArg, "Event should be triggered by an user interaction");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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

	QUnit.test("Header toolbar should override header text", function(assert) {
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();

		var $header = this.oPanel.$().find(".sapMPanelHdr");

		assert.equal($header.length, 0, "Header text should not be rendered.");
	});

	QUnit.module("CSS classes", {
		beforeEach: function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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
		assert.ok(jQuery("h2:first-of-type", $panel).hasClass("sapMPanelHdr"), "should have sapMPanelHdr class present on first header");
	});

	QUnit.test("Expandable panel with headerText", function(assert) {
		this.oPanel.setExpandable(true);
		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelWrappingDiv").length, 1, "should have wrapping div with sapMPanelWrappingDiv class");
		assert.strictEqual($panel.find(".sapMPanelExpandablePart").length, 1, "should have content area with sapMPanelExpandablePart class");
	});

	QUnit.test("Expandable and expanded panel with headerText", function(assert) {
		var panel = new Panel({
			headerText: "test",
			expandable: true,
			expanded: true
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().find(".sapMPanelWrappingDiv").length, 1, "should have wrapping div with sapMPanelWrappingDiv class");
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivExpanded class");
	});

	QUnit.test("Expandable and expanded panel with headerToolbar", function(assert) {
		var panel = new Panel({
			headerToolbar: this.createToolbar(),
			expandable: true,
			expanded: true
		}).placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivTb").length, 1, "should have wrapping div with sapMPanelWrappingDivTb class");
		assert.strictEqual(panel.$().find(".sapMPanelWrappingDivTbExpanded").length, 1, "should have wrapping div with sapMPanelWrappingDivTbExpanded class");
		assert.strictEqual(panel.$().find(".sapMPanelHeaderTB").length, 1, "should have a toolbar with sapMPanelHeaderToolbar class");
	});

	QUnit.test("Expandable panel with headerToolbar and infoToolbar", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		this.oPanel.setAggregation("infoToolbar", this.createToolbar());

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();
		var oInfoToolbarWrapper = jQuery(".sapMPanelExpandablePart")[0];

		assert.strictEqual($panel.find(".sapMPanelWrappingDivTb").length, 1, "should have wrapping div with sapMPanelWrappingDivTb class");
		assert.strictEqual($panel.find(".sapMPanelExpandablePart").length, 2, "should have infoToolbar and content area with sapMPanelExpandablePart class");
		assert.strictEqual(jQuery(oInfoToolbarWrapper).is("div"), true, "InfoToolbar should be wrapped in div");
		assert.strictEqual($panel.find(".sapMPanelHeaderTB").length, 1, "should have a toolbar with sapMPanelHeaderToolbar class");
		assert.strictEqual($panel.find(".sapMPanelInfoTB").length, 1, "should have a toolbar with sapMPanelInfoToolbar class");
	});

	QUnit.test("Expandable Panel when expanded", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(true);

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelExpandableIcon").length, 1, "should have sapMPanelExpandableIcon class present once");
		assert.strictEqual($panel.find(".sapMPanelExpandableIconExpanded").length, 1, "should have sapMPanelExpandableIconExpanded class present once");
		assert.strictEqual($panel.find(".sapMPanelWrappingDivExpanded").length, 1, "should have sapMPanelWrappingDivExpanded class present once");
	});

	QUnit.test("Expandable Panel when collapsed", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(false);

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelExpandableIcon").length, 1, "should have sapMPanelExpandableIcon class present once");
		assert.strictEqual($panel.find(".sapMPanelExpandableIconExpanded").length, 0, "should NOT have sapMPanelExpandableIconExpanded class present");
		assert.strictEqual($panel.find(".sapMPanelWrappingDivExpanded").length, 0, "should NOT have sapMPanelWrappingDivExpanded class present");
	});

	QUnit.test("Panel with solid backgroundDesign", function(assert) {
		this.oPanel.setBackgroundDesign(BackgroundDesign.Solid);
		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGSolid").length, 1, "should have sapMPanelBGSolid class present once");
	});

	QUnit.test("Panel with transparent backgroundDesign", function(assert) {
		this.oPanel.setBackgroundDesign(BackgroundDesign.Transparent);
		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGTransparent").length, 1, "should have sapMPanelBGTransparent class present once");
	});

	QUnit.test("Panel with translucent backgroundDesign", function(assert) {
		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGTranslucent").length, 1, "should have sapMPanelBGTranslucent class present once");
	});

	QUnit.test("Overflow should be hidden with expandable = true and expanded = false", function (assert) {

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
		sap.ui.getCore().applyChanges();

		var oInfoToolbarWrapper = jQuery("#OverflowToolbar1");

		// Assert
		assert.strictEqual(jQuery(oInfoToolbarWrapper).is(":visible"), false, "OverflowToolbar should be hidden");

		// cleanup
		oPanel.destroy();
	});

	QUnit.module("Computed styles", {
		beforeEach: function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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

	QUnit.test("Sizes should be equal to the ones set through the setters", function(assert) {
		this.oPanel.setWidth("400px");
		this.oPanel.setHeight("300px");

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.width(), 400, "width === 400");
		assert.strictEqual($panel.height(), 300, "Height === 300");
	});

	QUnit.test("Content for panel with 200px height when headerToolbar and infoToolbar are 100px", function(assert) {
		this.oPanel.setHeight("200px");
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		this.oPanel.setAggregation("infoToolbar", this.createToolbar("50px"));

		sap.ui.getCore().applyChanges();

		var $content = this.oPanel.$().find(".sapMPanelContent");

		assert.equal($content.outerHeight(), 100, "should be 100px");
	});

	QUnit.test("Line heigh should equal the height of the header when header toolbar is not present", function(assert) {
		var $header = this.oPanel.$().find(".sapMPanelHdr");

		assert.strictEqual($header.css("height"), $header.css("lineHeight"), "Height and line height should be equal");
	});

	QUnit.test("Content of expandable Panel when expanded", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(true);

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelContent").css("display"), "block", "should have display:block style present");
	});

	QUnit.test("Content of expandable Panel when collapsed", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setExpanded(false);

		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelContent").css("display"), "none", "should have display:none style present");
	});

	QUnit.test("Panel with solid backgroundDesign", function(assert) {
		this.oPanel.setBackgroundDesign(BackgroundDesign.Solid);
		sap.ui.getCore().applyChanges();

		var $panel = this.oPanel.$();

		assert.strictEqual($panel.find(".sapMPanelBGSolid").css("background-color"), "rgb(255, 255, 255)",
			"should have background-color:rgb(255, 255, 255) style present");
	});

	QUnit.test("Expandable panel with headerToolbar - toolbar should not have border", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		sap.ui.getCore().applyChanges();

		var $toolbar = this.oPanel.$().find(".sapMTB");

		assert.equal($toolbar.css("border-bottom-width"), "0px", "toolbar border should be 0px");
	});

	QUnit.test("Expandable panel with headerToolbar - toolbar should not have padding-left", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		sap.ui.getCore().applyChanges();

		var $toolbar = this.oPanel.$().find(".sapMTB");

		assert.equal($toolbar.css("padding-left"), "0px", "toolbar padding-left should be 0px");
	});

	QUnit.test("Expandable panel with headerToolbar - toolbar child should have margin-left: 3rem", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		sap.ui.getCore().applyChanges();

		var fontSize = parseInt(jQuery("body").css("font-size"));
		var $toolbar = this.oPanel.$().find(".sapMTB");

		assert.equal(parseInt($toolbar.css("margin-left")), 3 * fontSize, "toolbar margin-left should be " + (3 * fontSize) + "px");
	});

	QUnit.test("Expandable panel with headerToolbar - first toolbar child should not have margin-left", function(assert) {
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar("50px"));
		sap.ui.getCore().applyChanges();

		var $toolbar = this.oPanel.$().find(".sapMTB");
		var $firstToolbarChild = $toolbar.children().eq(0);

		assert.equal($firstToolbarChild.css("margin-left"), "0px", "first toolbar child margin-left should be 0px");
	});

	QUnit.test("Expandable panel with headerText - headerText should not have padding-left", function(assert) {
		this.oPanel.setExpandable(true);
		sap.ui.getCore().applyChanges();

		var $header = this.oPanel.$().find(".sapMPanelHdr");

		assert.equal($header.css("padding-left"), "0px", "headerText padding-left should be 0px");
	});

	QUnit.test("Container Padding Classes", function (assert) {
		// System under Test + Act
		var oContainer = new Panel(),
			sContentSelector = ".sapMPanelContent",
			sResponsiveSize = (Device.resize.width <= 599 ? "0px" : (Device.resize.width <= 1023 ? "16px" : "16px 32px")), // eslint-disable-line no-nested-ternary
			aResponsiveSize = sResponsiveSize.split(" "),
			$container,
			$containerContent;

		// Act
		oContainer.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		oContainer.addStyleClass("sapUiNoContentPadding");
		$containerContent = oContainer.$().find(sContentSelector);

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiNoContentPadding");
		oContainer.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oContainer.removeStyleClass("sapUiContentPadding");
		oContainer.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

		// Cleanup
		oContainer.destroy();
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
		beforeEach: function () {
			this.oPanel = new Panel({
				headerText: "Panel Header",
				content: [
					new Text({text: "This is a Text control"}),
					new Button({text: "Click me"})
				]
			});

			this.oPanel.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
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

	QUnit.test("Panel with header text and content", function(assert) {
		var $panel = this.oPanel.$(),
			sPanelHeaderId = this.oPanel.getId() + '-header';

		assert.strictEqual($panel.attr("aria-labelledby"), sPanelHeaderId, "should have a labelledby reference to the header");
	});

	QUnit.test("Panel with header text and header toolbar", function(assert) {
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), this.oPanel.getHeaderToolbar().getTitleId(), "should have a labelledby reference to the toolbar title.");
	});

	QUnit.test("Expandable panel in IE and Edge", function(assert) {
		this.stub(sap.ui.Device, "browser", { msie: true });
		var oPanel = new Panel({
				expandable: true,
				accessibleRole: PanelAccessibleRole.Region
			}),
			sPanelHeaderId = oPanel.getId() + '-header',
			sHeaderToolbarTitleId, sNewHeaderToolbarTitleId;

		oPanel.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oPanel.$().attr("aria-labelledby"), sPanelHeaderId, "should have a labelledby reference to the header");
		assert.strictEqual(oPanel.oIconCollapsed.$().attr("aria-labelledby"), sPanelHeaderId, "should have collapse button having a labelledby reference to the header");

		oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();
		sHeaderToolbarTitleId = oPanel.getHeaderToolbar().getTitleId();

		assert.strictEqual(oPanel.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have a labelledby reference to the toolbar title");
		assert.strictEqual(oPanel.oIconCollapsed.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have collapse button having a labelledby reference to the toolbar title");

		// Initialize new header toolbar
		oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();
		sNewHeaderToolbarTitleId = oPanel.getHeaderToolbar().getTitleId();

		assert.notStrictEqual(sHeaderToolbarTitleId, sNewHeaderToolbarTitleId, "The new header toolbar should have different id than the initial one");
		assert.strictEqual(oPanel.$().attr("aria-labelledby"), sNewHeaderToolbarTitleId, "should have a labelledby reference to the new toolbar title");
		assert.strictEqual(oPanel.oIconCollapsed.$().attr("aria-labelledby"), sNewHeaderToolbarTitleId, "should have collapse button having a labelledby reference to the new toolbar title");

		oPanel.destroy();
	});

	QUnit.test("Expandable panel with headerText and header toolbar", function(assert) {
		this.stub(sap.ui.Device, "browser", { msie: false });
		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();

		var sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have a labelledby reference to the toolbar title");
		assert.strictEqual(this.oPanel.oIconCollapsed.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with headerText and reinitialized header toolbar", function(assert) {
		this.stub(sap.ui.Device, "browser", { msie: false });
		var sHeaderToolbarTitleId, sNewHeaderToolbarTitleId;

		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Region);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();
		sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		// Initialize new header toolbar
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();
		sNewHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.notStrictEqual(sHeaderToolbarTitleId, sNewHeaderToolbarTitleId, "The new header toolbar should have different id than the initial one");
		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sNewHeaderToolbarTitleId, "should have a labelledby reference to the new toolbar title");
		assert.strictEqual(this.oPanel.oIconCollapsed.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with role Form", function(assert) {
		var sHeaderToolbarTitleId;
		this.oPanel.setExpandable(true);
		this.oPanel.setAccessibleRole(PanelAccessibleRole.Form);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();

		sHeaderToolbarTitleId = this.oPanel.getHeaderToolbar().getTitleId();

		assert.strictEqual(this.oPanel.$().attr("aria-labelledby"), sHeaderToolbarTitleId, "should have a labelledby reference to the new toolbar title");
		assert.strictEqual(this.oPanel.oIconCollapsed.$().attr("aria-labelledby"), undefined, "should have collapse button with no labelledby reference to the toolbar title");
	});

	QUnit.test("Expandable panel with aria-controls attribute", function(assert) {
		var sContentId;
		this.oPanel.setExpandable(true);
		this.oPanel.setAggregation("headerToolbar", this.createToolbar());
		sap.ui.getCore().applyChanges();

		sContentId = this.oPanel.getDomRef("content").id;
		assert.strictEqual(this.oPanel.oIconCollapsed.$().attr("aria-controls"), sContentId,
				"an aria-controls attribute with reference to the content should be added to the collapse button");
	});
});