/*global QUnit*/
sap.ui.define([
	"./DynamicPageUtil",
	"sap/ui/core/Core"
],
function (
	DynamicPageUtil,
	Core
) {
	"use strict";

	var oFactory = DynamicPageUtil.oFactory,
		oUtil = DynamicPageUtil.oUtil;

	/* --------------------------- DynamicPage Header API ---------------------------------- */
	QUnit.module("DynamicPage Header - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header root tag", function (assert) {
		var oHeader = this.oDynamicPage.getHeader();

		assert.strictEqual(oHeader.getDomRef().tagName, "SECTION", "The root tag is 'section'");
	});

	QUnit.test("DynamicPage Header default aggregation", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
				sHeaderDefaultAggregation = oHeader.getMetadata().getDefaultAggregationName();

		assert.strictEqual(sHeaderDefaultAggregation, "content", "The default aggregation is 'content'");
	});

	QUnit.test("DynamicPage Header pinnable and not pinnable", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
				oPinButton = oHeader.getAggregation("_pinButton");

		oHeader.setPinnable(false);
		Core.applyChanges();

		assert.ok(!oPinButton.$()[0],
				"The DynamicPage Header Pin Button not rendered");

		oHeader.setPinnable(true);
		Core.applyChanges();

		assert.ok(oPinButton.$()[0],
				"The DynamicPage Header Pin Button rendered");

		assert.equal(oPinButton.$().hasClass("sapUiHidden"), false,
				"The DynamicPage Header Pin Button is visible");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing through the API", function (assert) {
		var oDynamicPage = this.oDynamicPage,
				$oDynamicPageHeader = oDynamicPage.getHeader().$(),
				sSnappedClass = "sapFDynamicPageTitleSnapped",
				oSetPropertySpy = this.spy(oDynamicPage, "setProperty"),
				sAriaLabelledBy = oDynamicPage.getTitle().getHeading().getId(),
				iHeaderHeight = parseInt(oDynamicPage._getHeaderHeight());

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.ok(oDynamicPage.getHeaderExpanded(), "initial value for the headerExpanded prop is true");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Initial aria-labelledby references");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));

		oDynamicPage.setHeaderExpanded(false);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false under regular conditions works");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is now snapped");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
		assert.strictEqual(parseInt($oDynamicPageHeader[0].style.height), iHeaderHeight, "Header height is fixed");
		assert.strictEqual($oDynamicPageHeader[0].style.overflow, "hidden", "Header height is restricted");
		oSetPropertySpy.resetHistory();

		oDynamicPage.setHeaderExpanded(true);
		assert.ok(oDynamicPage.getHeaderExpanded(), "header converted to expanded");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is expanded again");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", true, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		assert.strictEqual($oDynamicPageHeader[0].style.height, "", "Header height is restored to the default value");
		assert.strictEqual($oDynamicPageHeader[0].style.overflow, "", "Header overflow is restored to the default value");
		oSetPropertySpy.resetHistory();

		oDynamicPage._snapHeader();
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false via user interaction");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
		assert.strictEqual(parseInt($oDynamicPageHeader[0].style.height), iHeaderHeight, "Header height is fixed");
		assert.strictEqual($oDynamicPageHeader[0].style.overflow, "hidden", "Header height is restricted");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oDynamicPage = this.oDynamicPage,
				$oDynamicPageHeader = oDynamicPage.getHeader().$(),
				oDynamicPageTitle = oDynamicPage.getTitle(),
				sAriaLabelledBy = oDynamicPageTitle.getHeading().getId(),
				$oDynamicPageTitleSpan = oDynamicPageTitle._getFocusSpan(),
				oPinButton = oDynamicPage.getHeader()._getPinButton(),
				oFakeEvent = {
					srcControl: oDynamicPageTitle
				};

		this.oDynamicPage._bHeaderInTitleArea = true;

		assert.equal(oDynamicPage.getHeaderExpanded(), true, "Initially the header is expanded");
		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), true, "Initially toggleHeaderOnTitleClick = true");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), 0, "Initially the header title is focusable");

		oDynamicPageTitle.ontap(oFakeEvent);

		assert.equal(oDynamicPage.getHeaderExpanded(), false, "After one click, the header is collapsed");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is collapsed after tap");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");

		oDynamicPage.setToggleHeaderOnTitleClick(false);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "The header is still collapsed, because toggleHeaderOnTitleClick = false");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be still excluded from the tab chain");
		assert.equal($oDynamicPageTitleSpan.is(":hidden"), true, "The header title is not focusable");
		assert.notOk(oDynamicPage.getTitle().$().attr("aria-labelledby"),
				"Since the header isn't toggleable, an aria-labelledby attribute shouldn't be rendered");

		oDynamicPage.setToggleHeaderOnTitleClick(true);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is back to expanded");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		assert.equal($oDynamicPageTitleSpan.is(":visible"), true, "The header title is focusable again");

		oPinButton.firePress();
		oDynamicPageTitle.ontap(oFakeEvent);

		assert.equal(oDynamicPage.getHeaderExpanded(), false, "After one click, the header is collapsed even it's pinned");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "false", sAriaLabelledBy, "Header is collapsed after tap");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
		assert.strictEqual(oPinButton.getPressed(), false, "Pin button pressed state should be reset.");
		assert.strictEqual(oDynamicPage.$().hasClass("sapFDynamicPageHeaderPinned"), false, "DynamicPage header should be unpinned.");
	});

	QUnit.test("DynamicPage toggle header indicators visibility", function (assert) {
		var oDynamicPageTitle = this.oDynamicPage.getTitle(),
				oDynamicPageHeader = this.oDynamicPage.getHeader(),
				oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton"),
				oExpandButton = oDynamicPageTitle.getAggregation("_expandButton"),
				$oCollapseButton = oCollapseButton.$(),
				$oExpandButton = oExpandButton.$();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=true, pinned=false
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "The Collapse button should be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "The Expand Button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "The Collapse button is visible");

		// Act
		this.oDynamicPage.setToggleHeaderOnTitleClick(false);

		// Assert: toggleHeaderOnTitleClick=false, headerExpanded=true, pinned=false
		// Expected is both the buttons to be hidden
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "The Collapse button should not be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Title click is not enabled, the Collapse button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Title click is not enabled, the Expand button is not visible");

		// Act
		this.oDynamicPage.setToggleHeaderOnTitleClick(true);
		this.oDynamicPage._pin();

		// Act: re-render the Title and Header
		oDynamicPageTitle.invalidate();
		oDynamicPageHeader.invalidate();
		Core.applyChanges();
		$oCollapseButton = oCollapseButton.$();
		$oExpandButton = oExpandButton.$();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=true, pinned=true
		// Expected is expand button to be hidden and collapse button to be visible after the Title and Header re-rendering
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "The Collapse button should be visible");
		assert.equal(oDynamicPageTitle._getShowExpandButton(), false, "The Expand button should not be visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is pinned, the Expand button is visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is pinned, the Collapse button is not visible");

		// Act
		this.oDynamicPage._unPin();
		this.oDynamicPage._snapHeader();

		// Assert: toggleHeaderOnTitleClick=true, headerExpanded=false, pinned=false;
		// Expected: Expand button to be visible and Collapse button to be hidden
		assert.equal(oDynamicPageTitle._getShowExpandButton(), true, "The Expand button should be visible");
		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "The Collapse button should not be visible");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, the Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, the Collapse button is not visible");
	});

	QUnit.test("DynamicPage expand/collapse button visibility", function (assert) {
		var oDynamicPageHeader = this.oDynamicPage.getHeader();

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "Collapse button should be visible when the header content has content");

		oDynamicPageHeader.destroyContent();

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), false, "Collapse button should be hidden when the header content has no content");

		oDynamicPageHeader.addContent(oFactory.getContent(1));

		assert.equal(oDynamicPageHeader._getShowCollapseButton(), true, "Collapse button should be visible when the header content has content");
	});

	QUnit.test("Collapse button visibility on invalidation", function (assert) {
		// Arrange
		var oDynamicPageHeader = this.oDynamicPage.getHeader();
		this.oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(this.oDynamicPage);

		var oCollapseButton = oDynamicPageHeader._getCollapseButton();

		// Act
		this.oDynamicPage.setHeaderExpanded(true);
		oCollapseButton.invalidate();
		// Assert
		assert.ok(!oCollapseButton.hasStyleClass("sapUiHidden"), "Collapse button doesn`t have unrendered 'sapUiHidden' class");
	});

	QUnit.test("DynamicPage Header - backgroundDesign", function(assert) {
		var oDynamicPageHeader = this.oDynamicPage.getHeader(),
				$oDomRef = oDynamicPageHeader.$();

		// assert
		assert.equal(oDynamicPageHeader.getBackgroundDesign(), null, "Default value of backgroundDesign property = null");

		// act
		oDynamicPageHeader.setBackgroundDesign("Solid");
		Core.applyChanges();

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderSolid"), "Should have sapFDynamicPageHeaderSolid class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Solid", "Should have backgroundDesign property = 'Solid'");

		// act
		oDynamicPageHeader.setBackgroundDesign("Transparent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageHeaderSolid"), "Should not have sapFDynamicPageHeaderSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderTransparent"), "Should have sapFDynamicPageHeaderTransparent class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Transparent", "Should have backgroundDesign property = 'Transparent'");

		// act
		oDynamicPageHeader.setBackgroundDesign("Translucent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageHeaderTransparent"), "Should not have sapFDynamicPageHeaderTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageHeaderTranslucent"), "Should have sapFDynamicPageHeaderTranslucent class");
		assert.strictEqual(oDynamicPageHeader.getBackgroundDesign(), "Translucent", "Should have backgroundDesign property = 'Translucent'");
	});

	QUnit.test("Sets icon to 'sap-icon://pushpin-on' when theme is 'Horizon'", function (assert) {
		// Arrange
		var oHeader = this.oDynamicPage.getHeader(),
			pinButton = oHeader._getPinButton();

		this.applyTheme = function(sTheme, fnCallback) {
			this.sRequiredTheme = sTheme;
			if (Core.getConfiguration().getTheme() === this.sRequiredTheme && Core.isThemeApplied()) {
				if (typeof fnCallback === "function") {
					fnCallback.bind(this)();
					fnCallback = undefined;
				}
			} else {
				Core.attachThemeChanged(fnThemeApplied.bind(this));
				Core.applyTheme(sTheme);
			}

			function fnThemeApplied(oEvent) {
				Core.detachThemeChanged(fnThemeApplied);
				if (Core.getConfiguration().getTheme() === this.sRequiredTheme && Core.isThemeApplied()) {
					if (typeof fnCallback === "function") {
						fnCallback.bind(this)();
						fnCallback = undefined;
					}
				} else {
					setTimeout(fnThemeApplied.bind(this, oEvent), 1500);
				}
			}
		};

		// Act
		var done = assert.async();
		this.applyTheme("sap_horizon", function () {

			// Assert
			assert.strictEqual(pinButton.getIcon(), "sap-icon://pushpin-on", "Icon is set to 'sap-icon://pushpin-on'");

			done();
		});
  });
});