/*global QUnit*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"qunit/DynamicPageUtil",
	"sap/ui/core/Core"
],
function (
	$,
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
				sAriaLabelledBy = oDynamicPage.getTitle().getHeading().getId();

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
		oSetPropertySpy.reset();

		oDynamicPage.setHeaderExpanded(true);
		assert.ok(oDynamicPage.getHeaderExpanded(), "header converted to expanded");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is expanded again");
		assert.ok(!oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", true, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		oSetPropertySpy.reset();

		oDynamicPage._snapHeader();
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "setting it to false via user interaction");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass));
		assert.ok(oSetPropertySpy.calledWith("headerExpanded", false, true));
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
	});

	QUnit.test("DynamicPage Header - expanding/collapsing by clicking the title", function (assert) {

		var oDynamicPage = this.oDynamicPage,
				$oDynamicPageHeader = oDynamicPage.getHeader().$(),
				oDynamicPageTitle = oDynamicPage.getTitle(),
				sAriaLabelledBy = oDynamicPageTitle.getHeading().getId(),
				$oDynamicPageTitleSpan = oDynamicPageTitle._getFocusSpan().$(),
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
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), undefined, "The header title is not focusable");
		assert.notOk(oDynamicPage.getTitle().$().attr("aria-labelledby"),
				"Since the header isn't toggleable, an aria-labelledby attribute shouldn't be rendered");

		oDynamicPage.setToggleHeaderOnTitleClick(true);

		oDynamicPageTitle.ontap(oFakeEvent);
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "After restoring toggleHeaderOnTitleClick to true, the header again expands on click");
		oUtil.testExpandedCollapsedARIA(assert, oDynamicPage, "true", sAriaLabelledBy, "Header is back to expanded");
		assert.strictEqual($oDynamicPageHeader.css("visibility"), "visible", "Header should be included in the tab chain again");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), 0, "The header title is focusable again");

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
		oDynamicPageTitle.rerender();
		oDynamicPageHeader.rerender();
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
});