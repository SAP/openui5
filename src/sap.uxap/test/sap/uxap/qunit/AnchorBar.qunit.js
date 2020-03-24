/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./ObjectPageLayoutUtils',
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/uxap/AnchorBar",
	"sap/m/Button"
], function ($, utils, Device, Core, JSONModel, AnchorBar, Button) {
	"use strict";

	var iRenderingDelay = 2000,
		ANCHORBAR_CLASS_SELECTOR = ".sapUxAPAnchorBar",
		HIERARCHICAL_CLASS_SELECTOR = ".sapUxAPHierarchicalSelect",
		BREAK_POINTS = {
			Phone: 600,
			Tablet: 1024,
			Desktop: 2000
		};

	function checkButtonAriaAttribute(assert, oButton, sAttribute, sExpected, sMessage) {
		if (oButton.isA("sap.m.MenuButton")) {
			oButton = oButton._getButtonControl();
		}

		assert.strictEqual(oButton.$().attr(sAttribute), sExpected, sMessage);
	}

	QUnit.module("properties", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBar", {
				viewName: "view.UxAP-69_AnchorBar"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.placeAt('qunit-fixture');
			Core.applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.clock.restore();
		}
	});

	QUnit.test("Show/Hide Bar", function (assert) {
		assert.expect(3); //number of assertions

		// test whether it is visible by default
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar visible by default");

		// hide the anchor bar
		this.oObjectPage.setShowAnchorBar(false);

		// allow for re-render
		Core.applyChanges();

		// test whether it is hidden
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length, 0, "anchorBar hidden");

		// show the anchor bar back
		this.oObjectPage.setShowAnchorBar(true);

		// allow for re-render
		Core.applyChanges();
		assert.strictEqual(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0, true, "anchorBar displayed");

	});

	QUnit.test("Show/Hide popover", function (assert) {
		var oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		// initial assert
		assert.ok(oAnchorBarButton.isA("sap.m.MenuButton"), "MenuButton is correctly used when showAnchorBarPopover=true");

		//no longer show the popover
		this.oObjectPage.setShowAnchorBarPopover(false);

		// allow for re-render
		Core.applyChanges();
		oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		// assert
		assert.ok(oAnchorBarButton.isA("sap.m.Button"), "Button is correctly used when showAnchorBarPopover=false");
	});

	QUnit.test("Selected button", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			oLastSectionButton = aAnchorBarContent[aAnchorBarContent.length - 1],
			oMenuButton = aAnchorBarContent[1];

		oAnchorBar.setSelectedButton(oLastSectionButton);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oLastSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "select button programmatically");
		checkButtonAriaAttribute(assert, oLastSectionButton, "aria-checked", "true", "ARIA checked state should be true for the selected button");
		checkButtonAriaAttribute(assert, oFirstSectionButton, "aria-checked", "false", "ARIA checked state should be false for the unselected button");
		checkButtonAriaAttribute(assert, oMenuButton, "aria-checked", "false", "ARIA checked state should be false for the unselected split button");

		oAnchorBar.setSelectedButton(oMenuButton);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		checkButtonAriaAttribute(assert, oMenuButton, "aria-checked", "true", "ARIA checked state should be true for the selected split button");
	});

	QUnit.test("aria-checked is set correctly in _computeNextSectionInfo", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			oLastSectionButton = aAnchorBarContent[aAnchorBarContent.length - 1];

		// act
		oAnchorBar.setSelectedButton(oLastSectionButton);
		oAnchorBar._computeBarSectionsInfo();

		checkButtonAriaAttribute(assert, oFirstSectionButton, "aria-checked", "false", "ARIA checked state should be false for the unselected button");
		checkButtonAriaAttribute(assert, oLastSectionButton, "aria-checked", "true", "ARIA checked state should be true for the selected button");
	});

	QUnit.test("Selected button always set correctly", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButtonId = aAnchorBarContent[0].getId(),
			sInvalidButtonId = "InvalidId";

		oAnchorBar.setSelectedButton(oFirstSectionButtonId);

		assert.strictEqual(oAnchorBar.getSelectedButton(), oFirstSectionButtonId, "Selected button id is correct");

		oAnchorBar.setSelectedButton(sInvalidButtonId);

		assert.strictEqual(oAnchorBar.getSelectedButton(), oFirstSectionButtonId, "Selected button id is still the valid one");
	});

	QUnit.test("Custom button", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oCustomButton = this.oObjectPage.getSections()[0].getCustomAnchorBarButton(),
			aAnchorBarContent = oAnchorBar.getContent(),
			oFirstSectionButton = aAnchorBarContent[0],
			pressSpy = this.spy(oAnchorBar, "_requestScrollToSection");

		oFirstSectionButton.firePress();

		assert.ok(pressSpy.calledOnce, "firePress of custom AnchorBar button calls the scroll to section function");

		oCustomButton.setEnabled(false);

		// allow for scroling
		this.clock.tick(iRenderingDelay);

		assert.strictEqual(oFirstSectionButton.$().hasClass("sapUxAPAnchorBarButtonSelected"), true, "selection is preserved");
		assert.strictEqual(oFirstSectionButton.getEnabled(), false, "property change is propagated");
	});

	QUnit.test("Custom button for sub-section", function (assert) {
		//select button programatically
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oCustomButton = this.oObjectPage.getSections()[1].getSubSections()[0].getCustomAnchorBarButton(),
			oSecondSectionButton = oAnchorBar.getContent()[1],
			oSubSectionButton = oSecondSectionButton.getMenu().getItems()[0];

		//assert
		assert.strictEqual(oSubSectionButton.getText(), oCustomButton.getText(), "custom button text is propagated to the menu item");
		assert.strictEqual(oSubSectionButton.getIcon(), oCustomButton.getIcon(), "custom button icon is propagated to the menu item");
	});

	QUnit.test("Menu Button with long text should be able to have width, bigger than 12rem", function (assert) {
		var $menuButton = $("#UxAP-69_anchorBar--ObjectPageLayout-anchBar-UxAP-69_anchorBar--section16-anchor");

		assert.ok(parseInt($menuButton.css("width")) > (12 * parseInt($("body").css("font-size"))),
			"Max width style of MenuButton is overridden so that it is bigger than 12rem");
	});

	QUnit.test("Phone view", function (assert) {
		//display hierarchical select
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Phone + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);

		assert.ok(jQuery(ANCHORBAR_CLASS_SELECTOR).length > 0 && jQuery(HIERARCHICAL_CLASS_SELECTOR).is(":visible") == true, "display hierarchical select");
	});

	QUnit.test("AnchorBar is correctly resized after resize of its parent ObjectPageLayout", function (assert) {
		// Arrange
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oMediaRange,
			sRangeSet = Device.media.RANGESETS.SAP_STANDARD;

		// Act
		// Resizing ObjectPage to Phone breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Phone + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[0],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[0]);

		// Act
		// Resizing ObjectPage to Tablet breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Tablet + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[1],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[1]);

		// Act
		// Resizing ObjectPage to Desktop breakpoint
		this.oObjectPage.getDomRef().style.width = BREAK_POINTS.Desktop + "px";

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		oMediaRange = Device.media.getCurrentRange(sRangeSet, oAnchorBar._getWidth(oAnchorBar));

		// Assert
		assert.strictEqual(oMediaRange.name, Object.keys(BREAK_POINTS)[2],
				"AnchorBar is with the same media range as its parent ObjectPage on " + Object.keys(BREAK_POINTS)[2]);
	});

	QUnit.test("Anchors for sections with multiple subsection must have arrow-down icon", function (assert) {
		var $arrowDownIcons;

		$arrowDownIcons = this.oObjectPage.$().find(".sapUxAPAnchorBar .sapUxAPAnchorBarButton .sapMBtnIcon");
		assert.ok($arrowDownIcons.length === 2, "Anchorbar has 2 buttons with arrow-down icon");
	});

	QUnit.test("Arrow left nad arrow right buttons should have correct tooltips", function (assert) {
		var oArrowLeft = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollLeft"),
			oArrowRight = this.anchorBarView.byId("ObjectPageLayout-anchBar-arrowScrollRight"),
			oRB = Core.getLibraryResourceBundle("sap.uxap"),
			sArrowLeftTooltip = oRB.getText("TOOLTIP_OP_SCROLL_LEFT_ARROW"),
			sArrowRightTooltip = oRB.getText("TOOLTIP_OP_SCROLL_RIGHT_ARROW");

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "'");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "'");

		//act
		Core.getConfiguration().setRTL(true);
		Core.applyChanges();

		//assert
		assert.ok(oArrowLeft.getTooltip() === sArrowLeftTooltip, "Arrow left button should have tooltip '" + sArrowLeftTooltip + "' in RTL mode");
		assert.ok(oArrowRight.getTooltip() === sArrowRightTooltip, "Arrow left button should have tooltip '" + sArrowRightTooltip + "' in RTL mode");

		//cleanup
		Core.getConfiguration().setRTL(false);
	});

	QUnit.test("When using the objectPageNavigation the 'navigate' event is fired with the appropriate arguments", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oExpectedSection,
			oExpectedSubSection,
			navigateSpy = this.spy(this.oObjectPage, "fireNavigate");

		this.oObjectPage.setShowAnchorBarPopover(false);
		Core.applyChanges();

		oExpectedSection = this.oObjectPage.getSections()[1];
		oExpectedSubSection = oExpectedSection.getSubSections()[0];
		oAnchorBar.getContent()[1].firePress();

		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("section", oExpectedSection)), "Event fired has the correct section parameter attached");
		assert.ok(navigateSpy.calledWithMatch(sinon.match.has("subSection", oExpectedSubSection)), "Event fired has the correct subSection parameter attached");
	});

	var oModel = new JSONModel({
		sections: [
			{title: "my first section"},
			{title: "my second section"},
			{title: "my third section"},
			{title: "my fourth section"}
		],
		compositeTitle: "Title({0})",
		objectCount: 1
	});

	QUnit.module("custom setters", {
		beforeEach: function () {
			this.oAnchorBar = new AnchorBar();
			this.oAnchorBar.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.oAnchorBar = null;
		}
	});

	QUnit.test("AnchorBar - backgroundDesign", function (assert) {
		var $oDomRef = this.oAnchorBar.$();

		// assert
		assert.equal(this.oAnchorBar.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		this.oAnchorBar.setBackgroundDesign("Solid");
		Core.applyChanges();

		// assert
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarSolid"), "Should have sapUxAPAnchorBarSolid class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		this.oAnchorBar.setBackgroundDesign("Transparent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapUxAPAnchorBarSolid"), "Should not have sapUxAPAnchorBarSolid class");
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarTransparent"), "Should have sapUxAPAnchorBarTransparent class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		this.oAnchorBar.setBackgroundDesign("Translucent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapUxAPAnchorBarTransparent"), "Should not have sapUxAPAnchorBarTransparent class");
		assert.ok($oDomRef.hasClass("sapUxAPAnchorBarTranslucent"), "Should have sapUxAPAnchorBarTranslucent class");
		assert.strictEqual(this.oAnchorBar.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.module("simple binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			Core.applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			this.clock.restore();
		}
	});

	QUnit.test("Simple binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my first section", "binding in view correctly initialized");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/sections/0/title", "my updated title");
		oModel.refresh(true);

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title", "section title binding updates anchor bar button");
	});

	QUnit.test("Update by setTitle", function (assert) {

		var oSection = this.oObjectPage.getSections()[0];

		oSection.setTitle("my updated title again");
		this.clock.tick(iRenderingDelay);

		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0];

		assert.strictEqual(oSectionButton.getText(), "my updated title again", "section title set updates anchor bar button");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", "/sections/3/title");

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");
	});

	QUnit.test("Dynamic bind property OneTime", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title",
			mode: "OneTime"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "New model value must not be reflected");
		oModel.setProperty("/sections/3/title", "my fourth section");
	});

	QUnit.test("Dynamic bind property", function(assert) {
		var oSection = this.oObjectPage.getSections()[3];

		oSection.bindProperty("title", {
			path: "/sections/3/title"
		});

		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];

		assert.equal(oSectionButton.getProperty("text"), "my fourth section", "Property must return model value");

		oModel.setProperty("/sections/3/title", "newvalue");

		this.clock.tick(iRenderingDelay);

		oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[3];
		assert.equal(oSectionButton.getProperty("text"), "newvalue", "New model value must not be reflected");
	});

	QUnit.module("complex binding", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			Core.applyChanges();
			this.clock.tick(iRenderingDelay);
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
			this.oLastSectionButton = null;
			this.clock.restore();
		}
	});

	QUnit.test("Complex binding initialized from view", function (assert) {
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(1)", "complex title binding correct");
	});

	QUnit.test("Update by model change", function (assert) {
		//section title binding updates anchor bar button
		oModel.setProperty("/objectCount", 2);
		oModel.refresh(true);
		Core.applyChanges();

		// allow for re-render
		this.clock.tick(iRenderingDelay);
		var oSectionButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[1];

		assert.strictEqual(oSectionButton.getText(), "Title(2)", "section title binding updates anchor bar button");
	});

	QUnit.module("Private members", {
		beforeEach: function () {
			this.anchorBar = new AnchorBar();
		},
		afterEach: function () {
			this.anchorBar.destroy();
		}
	});

	QUnit.test("Assignment of _iREMSize, _iTolerance and _iOffset in onBeforeRendering method", function (assert) {
		var iFontSize = 16,
			fnCss = this.stub(jQuery, "css", function () {
				return iFontSize;
			});

		// assert
		assert.equal(this.anchorBar._iREMSize, 0, "Initial value of _iREMSize is 0");
		assert.equal(this.anchorBar._iTolerance, 0, "Initial value of _iTolerance is 0");
		assert.equal(this.anchorBar._iOffset, 0, "Initial value of _iOffset is 0");

		// act
		this.anchorBar.onBeforeRendering();

		// assert
		assert.equal(this.anchorBar._iREMSize, iFontSize, "After onBeforeRendering call the value of _iREMSize is changed to 16");
		assert.equal(this.anchorBar._iTolerance, iFontSize, "After onBeforeRendering call the value of _iTolerance is changed to 16");
		assert.equal(this.anchorBar._iOffset, iFontSize * 3, "After onBeforeRendering call the value of _iOffset is changed to 58");

		// cleanup
		fnCss.restore();
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.anchorBarView = sap.ui.xmlview("UxAP-69_anchorBarBinding", {
				viewName: "view.UxAP-69_AnchorBarBinding"
			});
			this.oObjectPage = this.anchorBarView.byId("ObjectPageLayout");
			this.anchorBarView.setModel(oModel);
			this.anchorBarView.placeAt('qunit-fixture');
			Core.applyChanges();
		},
		afterEach: function () {
			this.anchorBarView.destroy();
			this.oObjectPage = null;
		}
	});

	QUnit.test("Menu container has the correct role", function (assert) {
		var $oMenu = jQuery("#UxAP-69_anchorBarBinding--ObjectPageLayout-anchBar-scroll");

		assert.strictEqual($oMenu.attr("role"), "menubar", "Menu container has the menubar role.");
	});

	QUnit.test("Tooltip set on HierarchicalSelect", function (assert) {
		var oAnchorBar = this.oObjectPage.getAggregation("_anchorBar"),
			oSelect = oAnchorBar._getHierarchicalSelect(),
			oRB = Core.getLibraryResourceBundle("sap.uxap"),
			sExpectedTooltip = oRB.getText("ANCHOR_BAR_OVERFLOW");

		assert.strictEqual(oSelect.getTooltip(), sExpectedTooltip, "Tooltip correctly set.");
	});

	QUnit.test("Count information", function (assert) {
		var aAnchorBarContent = this.oObjectPage.getAggregation("_anchorBar").getContent(),
			iAnchorBarContentLength = aAnchorBarContent.length,
			oCurrentButton,
			iIndex;

		for (iIndex = 0; iIndex < iAnchorBarContentLength; iIndex++) {
			oCurrentButton = aAnchorBarContent[iIndex];
			// Convert the numbers to strings, since .attr would return a string
			// We need to add '+ 1' to the index for posinset, since posinset starts from 1, rather than 0
			checkButtonAriaAttribute(assert, oCurrentButton, "aria-setsize", iAnchorBarContentLength.toString(),
				"aria-setsize of the button indicates anchorBar's length correctly");
			checkButtonAriaAttribute(assert, oCurrentButton, "aria-posinset", (iIndex + 1).toString(),
				"aria-posinset indicates the correct position of the button");
		}
	});

	QUnit.test("ARIA role and role descrption of buttons", function (assert) {
		var aAnchorBarContent = this.oObjectPage.getAggregation("_anchorBar").getContent(),
			iAnchorBarContentLength = aAnchorBarContent.length,
			sAriaRoleDescription = Core.getLibraryResourceBundle("sap.uxap").getText("ANCHOR_BAR_MENUITEM"),
			oCurrentButton,
			iIndex;

		for (iIndex = 0; iIndex < iAnchorBarContentLength; iIndex++) {
			oCurrentButton = aAnchorBarContent[iIndex];
			checkButtonAriaAttribute(assert, oCurrentButton, "role", "menuitemradio",
				"aria role of the button is set correctly");
			checkButtonAriaAttribute(assert, oCurrentButton, "aria-roledescription", sAriaRoleDescription,
				"aria role description of the button is set correctly");
		}
	});

	QUnit.test("Enhance accessibility for submenu buttons is called", function (assert) {
		var	oAnchorBarButton = this.oObjectPage.getAggregation("_anchorBar").getContent()[0],
			oSplitButton = oAnchorBarButton._getButtonControl(),
			oMenu = oAnchorBarButton.getMenu(),
			accEnhanceSpy = this.spy(oMenu, "_fnEnhanceUnifiedMenuAccState");

		// act
		oSplitButton.fireArrowPress();

		// assert
		assert.ok(accEnhanceSpy.calledTwice, "Enhance accessibility function of the menu is called for 2 buttons");
	});

	QUnit.module("Rendering", {
		beforeEach: function () {
			this.oAnchorBarButton1 = new Button({text: "Section 1"});
			this.oAnchorBarButton2 = new Button({text: "Section 2"});
			this.oAnchorBar = new AnchorBar({
				content: [
					this.oAnchorBarButton1,
					this.oAnchorBarButton2
				]
			});
		},
		afterEach: function () {
			this.oAnchorBar.destroy();
			this.oAnchorBar = null;
			this.oAnchorBarButton = null;
		}
	});

	QUnit.test("content tabindex values", function (assert) {
		assert.expect(4);

		// act
		this.oAnchorBar.placeAt('qunit-fixture');
		Core.applyChanges();

		// assert
		this.oAnchorBar.getContent().forEach(function(oButton) {
			assert.strictEqual(oButton.$().attr('tabindex'), '-1', "All button has tabindex of -1 by default");
		});

		// act
		this.oAnchorBar.setSelectedButton(this.oAnchorBarButton2);

		assert.strictEqual(this.oAnchorBarButton2.$().attr('tabindex'), '0', "Selected button has tabindex of 0");
		assert.strictEqual(this.oAnchorBarButton1.$().attr('tabindex'), '-1', "Rest of the button remains with tabindex of -1");
	});

	QUnit.module("Scrolling", {
		beforeEach: function () {
			this.NUMBER_OF_SECTIONS = 15;
			this.NUMBER_OF_SUB_SECTIONS = 2;
			this.oObjectPage = utils.helpers.generateObjectPageWithSubSectionContent(utils.oFactory, this.NUMBER_OF_SECTIONS, this.NUMBER_OF_SUB_SECTIONS, true);
		},
		afterEach: function () {
			this.oObjectPage.destroy();
		}
	});

	QUnit.test("AnchorBar scrolled to section on width change", function (assert) {
		var oPage = this.oObjectPage,
			done = assert.async(),
			oSection = oPage.getSections()[14],
			oAnchorBar,
			sectionId = oSection.getId(),
			anchorBarStub,
			fnScrollToStub = function(sectionId) {
				// Assert
				assert.equal(anchorBarStub.callCount, 1, "AnchorBar is scrolled");
				assert.equal(anchorBarStub.args[0][0], sectionId, "AnchorBar scrolled to correct section");

				// Clean up
				anchorBarStub.restore();
				done();
			},
			fnOnDomReady = function() {
				oAnchorBar = oPage.getAggregation("_anchorBar");
				anchorBarStub = sinon.stub(oAnchorBar, "scrollToSection", fnScrollToStub);

				//act
				oPage.scrollToSection(sectionId, 0, null, true);
				oPage.getDomRef().style.width = 772	 + "px";
			};

		assert.expect(2);
		oPage.attachEventOnce("onAfterRenderingDOMReady", fnOnDomReady);
		this.oObjectPage.placeAt("qunit-fixture");
    });
});
