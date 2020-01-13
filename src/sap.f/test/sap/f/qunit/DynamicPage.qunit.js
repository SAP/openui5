/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"qunit/DynamicPageUtil",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/ui/Device",
	"sap/ui/core/Core",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Configuration",
	"sap/m/OverflowToolbarButton",
	"sap/m/library",
	"sap/f/DynamicPageAccessibleLandmarkInfo",
	"sap/ui/core/mvc/XMLView",
	'sap/ui/core/Control',
	'sap/ui/core/IntervalTrigger',
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
],
function (
	$,
	DynamicPageUtil,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageHeader,
	Device,
	Core,
	ComponentContainer,
	UIComponent,
	Configuration,
	OverflowToolbarButton,
	mLibrary,
	DynamicPageAccessibleLandmarkInfo,
	XMLView,
	Control,
	IntervalTrigger,
	QUnitUtils,
	KeyCodes
) {
	"use strict";

	var TESTS_DOM_CONTAINER = DynamicPageUtil.sTestsDomContainer,
		oFactory = DynamicPageUtil.oFactory,
		oUtil = DynamicPageUtil.oUtil,
		PageBackgroundDesign = mLibrary.PageBackgroundDesign;

	/* --------------------------- DynamicPage API -------------------------------------- */
	QUnit.module("DynamicPage - API ", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Instantiation", function (assert) {
		assert.ok(this.oDynamicPage, "The DynamicPage has instantiated successfully");
		assert.ok(this.oDynamicPage.getTitle(), "The DynamicPage Title has instantiated successfully");
		assert.ok(this.oDynamicPage.getHeader(), "The DynamicPage Header has instantiated successfully");
	});

	QUnit.test("Enabling preserveHeaderStateOnScroll should mutate headerExpanded", function (assert) {
		this.oDynamicPage._snapHeader();

		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is false, header collapsed");
		assert.ok(!this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is false");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!this.oDynamicPage.getHeaderExpanded(), "The DynamicPage`s headerExpanded is preserved");
		assert.ok(this.oDynamicPage.getPreserveHeaderStateOnScroll(), "The DynamicPage preserveHeaderStateOnScroll is true");
	});

	QUnit.test("Using setHeaderExpanded does not make DynamicPageTitle fire stateChange event", function (assert) {
		// arrange
		var oTitle = this.oDynamicPage.getTitle(),
			oStateChangeListener = sinon.spy();

		oTitle.attachEvent("stateChange", oStateChangeListener);

		// act
		this.oDynamicPage.setHeaderExpanded(!this.oDynamicPage.getHeaderExpanded());

		// assert
		assert.ok(!oStateChangeListener.called, "stateChange event was not fired");
	});

	QUnit.test("DynamicPage landmark info is set correctly", function (assert) {
		var oLandmarkInfo = new DynamicPageAccessibleLandmarkInfo({
			rootRole: "Region",
			rootLabel: "Root",
			contentRole: "Main",
			contentLabel: "Content",
			headerRole: "Banner",
			headerLabel: "Header",
			footerRole: "Region",
			footerLabel: "Footer"
		});

		this.oDynamicPage.setLandmarkInfo(oLandmarkInfo);
		Core.applyChanges();

		assert.strictEqual(this.oDynamicPage.$().attr("role"), "region", "Root role is set correctly.");
		assert.strictEqual(this.oDynamicPage.$().attr("aria-label"), "Root", "Root label is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("content").attr("role"), "main", "Content role is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("content").attr("aria-label"), "Content", "Content label is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("header").attr("role"), "banner", "Header role is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("header").attr("aria-label"), "Header", "Header label is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("footerWrapper").attr("role"), "region", "Footer role is set correctly.");
		assert.strictEqual(this.oDynamicPage.$("footerWrapper").attr("aria-label"), "Footer", "Footer label is set correctly.");
	});

	QUnit.test("DynamicPage - backgroundDesign property", function(assert) {
		var oDynamicPage = this.oDynamicPage,
				$oDomRef = oDynamicPage.$wrapper;

		// assert
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Standard, "Should have backgroundDesign property = 'Standard'");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should have sapFDynamicPageContentWrapperStandard class");

		// act
		oDynamicPage.setBackgroundDesign("Solid");
		Core.applyChanges();

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperSolid"), "Should have sapFDynamicPageContentWrapperSolid class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Solid, "Should have backgroundDesign property = 'Solid'");

		// act
		oDynamicPage.setBackgroundDesign("Standard");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperSolid"), "Should not have sapFDynamicPageContentWrapperSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should have sapFDynamicPageContentWrapperStandard class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Standard, "Should have backgroundDesign property = 'Standard'");

		// act
		oDynamicPage.setBackgroundDesign("List");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should not have sapFDynamicPageContentWrapperStandard class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperList"), "Should have sapFDynamicPageContentWrapperList class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.List, "Should have backgroundDesign property = 'List'");

		// act
		oDynamicPage.setBackgroundDesign("Transparent");
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperList"), "Should not have sapFDynamicPageContentWrapperList class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperTransparent"), "Should have sapFDynamicPageContentWrapperTransparent class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Transparent, "Should have backgroundDesign property = 'Transparent'");

		// act
		oDynamicPage.setBackgroundDesign(null);
		Core.applyChanges();

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperTransparent"), "Should not have sapFDynamicPageContentWrapperTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should have sapFDynamicPageContentWrapperStandard class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Standard, "Should have backgroundDesign property = 'Standard', which is default");
	});

	QUnit.module("DynamicPage - API - header initially snapped", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageHeaderSnapped();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	// BCP: 1880276579 - tests if initially snapped header is excluded from tab chain
	QUnit.test("DynamicPage headerExpanded=false header excluded from tab chain", function (assert) {
		var $oDynamicPageHeader = this.oDynamicPage.getHeader().$();

		assert.strictEqual($oDynamicPageHeader.css("visibility"), "hidden", "Header should be excluded from the tab chain");
	});

	QUnit.test("DynamicPage headerExpanded=false pin button visibility", function (assert) {
		var $oPinButton = this.oDynamicPage.getHeader()._getPinButton().$();

		assert.ok($oPinButton.hasClass("sapUiHidden"), "Pin header button should not be visible initially");

		this.oDynamicPage.setHeaderExpanded(true);
		assert.notOk($oPinButton.hasClass("sapUiHidden"), "Pin header button should be visible again");

		this.oDynamicPage.setHeaderExpanded(false);
		assert.ok($oPinButton.hasClass("sapUiHidden"), "Pin header button should be hidden again");
	});

	QUnit.test("DynamicPage headerExpanded=false expand via header should reset the property value", function (assert) {
		// act
		this.oDynamicPage.setHeaderExpanded(null);

		// asert
		assert.ok(this.oDynamicPage.getHeaderExpanded(), "DynamicPage headerExpanded value is default");

		// act
		this.oDynamicPage.setHeaderExpanded(false);

		// asert
		assert.notOk(this.oDynamicPage.getHeaderExpanded(), "DynamicPage header is snapped");

		// act
		this.oDynamicPage.setHeaderExpanded(undefined);

		// asert
		assert.ok(this.oDynamicPage.getHeaderExpanded(), "DynamicPage headerExpanded value is default");
	});

	QUnit.module("DynamicPage - API - header initially snapped without content", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageHeaderSnappedNoContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	// BCP: 1880249493 - tests if initially empty page with snapped header expands correctly on click
	QUnit.test("DynamicPage headerExpanded=false expand header with click", function (assert) {
		// setup
		this.oDynamicPage.setContent(oFactory.getContent(500));
		Core.applyChanges();
		this.oDynamicPage.getHeader().$().addClass("sapFDynamicPageHeaderHidden");
		this.oDynamicPage._titleExpandCollapseWhenAllowed(true);

		// assert
		assert.notOk(this.oDynamicPage.getHeader().$().hasClass("sapFDynamicPageHeaderHidden"), "DynamicPage header is shown correctly");
	});

	/* --------------------------- DynamicPage Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.toDesktopMode(); //ensure the test will execute correctly even on mobile devices
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Page, Title and Header rendered", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader(),
			oDynamicPageFooter = oDynamicPage.getFooter(),
			$oDynamicPageTitleSnappedWrapper = oDynamicPageTitle.$('snapped-wrapper'),
			$oDynamicPageTitleExpandedWrapper = oDynamicPageTitle.$('expand-wrapper'),
			$oDynamicPageHeader = oDynamicPageHeader.$(),
			$oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oDynamicPageTitle.getAggregation("_expandButton").$();

		assert.ok(oUtil.exists(oDynamicPage), "The DynamicPage has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageTitle), "The DynamicPage Title has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader), "The DynamicPage Header has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageFooter), "The DynamicPage Footer has rendered successfully");
		assert.ok(oUtil.exists(oDynamicPageHeader.getAggregation("_pinButton").$()),
			"The DynamicPage Header Pin Button has rendered successfully");
		assert.equal($oExpandButton.length > 0, true, "The Expand Button is rendered");
		assert.equal($oCollapseButton.length > 0, true, "The Collapse button is rendered");
		assert.equal($oDynamicPageTitleSnappedWrapper.length > 0, true, "The DynamicPage Title snapped content is rendered");
		assert.equal($oDynamicPageTitleExpandedWrapper.length > 0, true, "The DynamicPage Title expanded content is rendered");

		assert.ok($oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is not empty - sapFDynamicPageHeaderWithContent is added");
		assert.ok(!oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is not empty - sapFDynamicPageTitleOnly is not added");
	});

	QUnit.test("DynamicPage ScrollBar rendered", function (assert) {
		assert.ok(this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar has rendered successfully");
	});

	QUnit.test("BCP: 1870261908 Header title cursor CSS reset is applied", function (assert) {
		// Arrange
		var $MainHeading = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainHeading"),
			$MainContent = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainContent"),
			$MainActions = this.oDynamicPage.$().find(".sapFDynamicPageTitleMainActions");

		/**
		 * Asserts if proper CSS reset for cursor is applied to provided DOM element
		 * @param {object} assert object
		 * @param {object} oDomElement DOM element to be tested
		 */
		function assertCSSReset(assert, oDomElement) {
			assert.strictEqual(window.getComputedStyle(oDomElement).cursor, "default",
				"Proper CSS reset is applied to element");
		}

		// Assert
		assertCSSReset(assert, $MainHeading[0]);
		assertCSSReset(assert, $MainContent[0]);
		assertCSSReset(assert, $MainActions[0]);
	});

	QUnit.module("DynamicPage - Rendering - No Title", {
		beforeEach: function () {
			this.oDynamicPageNoTitle = oFactory.getDynamicPageNoTitle();
			oUtil.renderObject(this.oDynamicPageNoTitle);
		},
		afterEach: function () {
			this.oDynamicPageNoTitle.destroy();
			this.oDynamicPageNoTitle = null;
		}
	});

	QUnit.test("DynamicPage Title not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitle.getTitle()), "The DynamicPage Title has not rendered");
		assert.ok(this.oDynamicPageNoTitle.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.test("DynamicPage with no Title is rendered without error", function (assert) {
		var oDeviceStub = this.stub(Device, "system",  {
					desktop: false,
					phone: true,
					tablet: false
				}),
			oHeaderExpandedStub = this.stub(this.oDynamicPageNoTitle, "getHeaderExpanded", function () {
				return false;
			});

		this.oDynamicPageNoTitle.rerender();

		assert.ok(true, "No error is thrown");

		oDeviceStub.restore();
		oHeaderExpandedStub.restore();
	});

	QUnit.test("DynamicPage pin button does not toggle collapse arrow visibility", function (assert) {
		var oPinButton = this.oDynamicPageNoTitle.getHeader()._getPinButton();

		// act
		oPinButton.firePress();

		// assert
		assert.ok(this.oDynamicPageNoTitle.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Invisible Title", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.getTitle().setVisible(false);

			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Invisible Title", function (assert) {
		assert.ok(this.oDynamicPage.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Invisible Header", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.getHeader().setVisible(false);

			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Invisible Header", function (assert) {
		assert.ok(this.oDynamicPage.getTitle()._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
	});


	QUnit.module("DynamicPage - Rendering - Expand/collapse buttons", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Removed Header content", function (assert) {
		this.oDynamicPage.getHeader().removeAllContent();

		assert.ok(this.oDynamicPage.getTitle()._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
		assert.ok(this.oDynamicPage.getHeader()._getCollapseButton().$().hasClass("sapUiHidden"), "Header collapse button is hidden");
	});

	QUnit.module("DynamicPage - Rendering - Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
			oUtil.renderObject(this.oDynamicPageWithPreserveHeaderStateOnScroll);
		},
		afterEach: function () {
			this.oDynamicPageWithPreserveHeaderStateOnScroll.destroy();
			this.oDynamicPageWithPreserveHeaderStateOnScroll = null;
		}
	});

	QUnit.test("DynamicPage Header rendered within Header Wrapper", function (assert) {
		var $headerWrapper = this.oDynamicPageWithPreserveHeaderStateOnScroll.$("header"),
			sHeaderId = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getId();

		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The Header is in the Header Wrapper");
	});

	QUnit.test("DynamicPage Pin button is hidden", function (assert) {
		var $pinButton = this.oDynamicPageWithPreserveHeaderStateOnScroll.getHeader().getAggregation("_pinButton").$();

		// assert
		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button not rendered");

		// act
		this.oDynamicPageWithPreserveHeaderStateOnScroll._snapHeader();
		this.oDynamicPageWithPreserveHeaderStateOnScroll._expandHeader();

		// assert
		assert.ok($pinButton.hasClass("sapUiHidden"), "The DynamicPage Header Pin Button is hidden");
	});

	QUnit.module("DynamicPage - Rendering lifecycle", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("resizeListener is not called before the control is rerendered", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			oSpy = sinon.spy(this.oDynamicPage, "_onChildControlsHeightChange"),
			iHeightBeforeResize,
			oDummyControl,
			done = assert.async(),
			DummyControl = Control.extend("sap.m.DummyControl", {
				renderer: function(oRm) {
					oRm.write("<div></div>");
				}
			});

		DummyControl.prototype.onAfterRendering = function() {
			// will cause the <code>ResizeHandler.prototype.checkSizes<code>
			// to be executed *synchronously*
			IntervalTrigger.addListener(function() {
				// content non important
			});
		};

		this.oDynamicPage.addEventDelegate({
			"onAfterRendering": function() {
				iHeightBeforeResize = oDynamicPage.getDomRef().offsetHeight;
				oDummyControl = new DummyControl();
				oDummyControl.addEventDelegate({
					"onAfterRendering": function() {
						// assert
						assert.strictEqual(oSpy.callCount, 0, "dynamicPage resize listener not called");
						done();
					}
				});

				oDynamicPage.getHeader().addContent(oDummyControl);
				oDynamicPage.getDomRef().style.height = (iHeightBeforeResize / 2) + "px";
				oSpy.reset();
				oDynamicPage.invalidate();
				oDynamicPage.rerender();
				oDynamicPage.removeEventDelegate(this);
			}
		});
		this.oDynamicPage.placeAt("qunit-fixture");
	});

	QUnit.module("DynamicPage - Rendering - No Header", {
		beforeEach: function () {
			this.oDynamicPageNoHeader = oFactory.getDynamicPageNoHeader();
			oUtil.renderObject(this.oDynamicPageNoHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoHeader.destroy();
			this.oDynamicPageNoHeader = null;
		}
	});

	QUnit.test("DynamicPage Header not rendered", function (assert) {
		var oTitle = this.oDynamicPageNoHeader.getTitle();

		assert.ok(!oUtil.exists(this.oDynamicPageNoHeader.getHeader()), "The DynamicPage Header does not exist.");
		assert.ok(oTitle._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
		assert.equal(oTitle._getFocusSpan().$().attr("tabindex"), undefined, "Focus span should be excluded from the tab chain");
		assert.notOk(this.oDynamicPageNoHeader.$().hasClass("sapFDynamicPageTitleClickEnabled"), "No DynamicPage Header - sapFDynamicPageTitleClickEnabled not added");

		this.oDynamicPageNoHeader.setToggleHeaderOnTitleClick(true);
		assert.equal(oTitle._getFocusSpan().$().attr("tabindex"), undefined, "Focus span should still be excluded from the tab chain");
		assert.notOk(this.oDynamicPageNoHeader.$().hasClass("sapFDynamicPageTitleClickEnabled"), "No DynamicPage Header - sapFDynamicPageTitleClickEnabled not added");
	});

	QUnit.module("DynamicPage - Rendering - Empty Header", {
		beforeEach: function () {
			this.oDynamicPageWithEmptyHeader = oFactory.getDynamicPageWithEmptyHeader();
			oUtil.renderObject(this.oDynamicPageWithEmptyHeader);
		},
		afterEach: function () {
			this.oDynamicPageWithEmptyHeader.destroy();
			this.oDynamicPageWithEmptyHeader = null;
		}
	});

	QUnit.test("DynamicPage Header style classes", function (assert) {
		var oDynamicPage = this.oDynamicPageWithEmptyHeader,
			$oDynamicPageHeader = oDynamicPage.$();

		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderWithContent"),
			"The DynamicPage Header is empty - sapFDynamicPageHeaderWithContent not added");
		assert.ok(!$oDynamicPageHeader.hasClass("sapFDynamicPageHeaderPinnable"),
			"The DynamicPage Header is pinnable, but it`s empty - sapFDynamicPageHeaderPinnable not added");
		assert.ok(oDynamicPage.$titleArea.hasClass("sapFDynamicPageTitleOnly"),
			"The DynamicPage Header is empty and has Title only - sapFDynamicPageTitleOnly is added");
	});

	QUnit.module("DynamicPage - Rendering - No Title and No Header", {
		beforeEach: function () {
			this.oDynamicPageNoTitleAndHeader = oFactory.getDynamicPageNoTitleAndHeader();
			oUtil.renderObject(this.oDynamicPageNoTitleAndHeader);
		},
		afterEach: function () {
			this.oDynamicPageNoTitleAndHeader.destroy();
			this.oDynamicPageNoTitleAndHeader = null;
		}
	});

	QUnit.test("DynamicPage Title and Header not rendered", function (assert) {
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getTitle()), "The DynamicPage Title has not rendered");
		assert.ok(!oUtil.exists(this.oDynamicPageNoTitleAndHeader.getHeader()), "The DynamicPage Header has not rendered ");
	});

	QUnit.module("DynamicPage - Rendering - Footer Visibility", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Footer visibility", function (assert) {
		// Arrange
		var $footerWrapper = this.oDynamicPage.$footerWrapper,
			oFooter = this.oDynamicPage.getFooter(),
			$footer = oFooter.$();

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible initially");

		// Act - Trigger show animation
		this.oDynamicPage.setShowFooter(true);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the beginning of the show animation.");
		assert.ok($footer.hasClass(DynamicPage.SHOW_FOOTER_CLASS_NAME),
		"Footer has the " + DynamicPage.SHOW_FOOTER_CLASS_NAME + " CSS class at the beginning of the show animation");

		// Act - Simulate end of animation
		this.oDynamicPage._onToggleFooterAnimationEnd(oFooter);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the end of the show animation.");
		assert.notOk($footer.hasClass(DynamicPage.SHOW_FOOTER_CLASS_NAME),
		"Footer hasn't applied " + DynamicPage.SHOW_FOOTER_CLASS_NAME + " CSS class at end of the show animation");

		// Act - Trigger hide animation
		this.oDynamicPage.setShowFooter(false);

		// Assert
		assert.notOk($footerWrapper.hasClass("sapUiHidden"), "Footer is visible at the beginning of the hide animation.");
		assert.ok($footer.hasClass(DynamicPage.HIDE_FOOTER_CLASS_NAME),
		"Footer has the " + DynamicPage.HIDE_FOOTER_CLASS_NAME + " CSS class at the beginning of the hide animation");

		// Act - Simulate end of animation
		this.oDynamicPage._onToggleFooterAnimationEnd(oFooter);

		// Assert
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "Footer is not visible at the end of the hide animation.");
		assert.notOk($footer.hasClass(DynamicPage.HIDE_FOOTER_CLASS_NAME),
		"Footer hasn't applied " + DynamicPage.HIDE_FOOTER_CLASS_NAME + " CSS class at end of the hide animation");
	});

	QUnit.test("DynamicPage Footer visibility when animations disabled", function (assert) {
		var $footerWrapper = this.oDynamicPage.$("footerWrapper"),
			sOriginalMode = Core.getConfiguration().getAnimationMode();

		//setup
		Core.getConfiguration().setAnimationMode(Configuration.AnimationMode.none);

		// Act: toggle to 'true'
		this.oDynamicPage.setShowFooter(true);

		// Check
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "footer is shown");

		// Act: toggle to 'false'
		this.oDynamicPage.setShowFooter(false);

		// Check
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "footer is hidden");

		// Clean up
		Core.getConfiguration().setAnimationMode(sOriginalMode);
	});

	/* --------------------------- DynamicPage Mobile Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Mobile", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toMobileMode();
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Pin button not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.getHeader().getAggregation("_pinButton").$()[0],
			"The DynamicPage Header Pin Button not rendered");
	});

	QUnit.test("DynamicPage ScrollBar not rendered on mobile", function (assert) {
		assert.ok(!this.oDynamicPage.$("vertSB")[0], "DynamicPage ScrollBar not rendered");
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		Core.applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Tablet Rendering ---------------------------------- */

	QUnit.module("DynamicPage - Rendering - Tablet", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			oUtil.toTabletMode();
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		Core.applyChanges();
		this.clock.tick();

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		assert.ok(!oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Events and Handlers ---------------------------------- */
	QUnit.module("DynamicPage Events, Handlers", {
		beforeEach: function () {
			sinon.config.useFakeTimers = true;
			this.oDynamicPage = oFactory.getDynamicPageWithBigContent();
		},
		afterEach: function () {
			sinon.config.useFakeTimers = false;
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press: title press handler should be called", function (assert) {
		var oTitlePressSpy = this.spy(DynamicPage.prototype, "_titleExpandCollapseWhenAllowed"),
			oTitle = this.oDynamicPage.getTitle();

		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oTitlePressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Title Press: onsapenter event", function (assert) {
		var oTitlePressListenerSpy = sinon.spy(),
			oTitle = this.oDynamicPage.getTitle();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle._focus();
		this.oDynamicPage.getTitle().attachEvent("_titlePress", oTitlePressListenerSpy);

		QUnitUtils.triggerKeydown(oTitle.getDomRef(), KeyCodes.ENTER);

		assert.ok(oTitlePressListenerSpy.calledOnce, "Event was fired when ENTER key is pressed");
	});

	QUnit.test("DynamicPage On Title Press: onsapspace event", function (assert) {
		var oTitlePressListenerSpy = sinon.spy(),
			oTitle = this.oDynamicPage.getTitle();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle._focus();
		this.oDynamicPage.getTitle().attachEvent("_titlePress", oTitlePressListenerSpy);

		QUnitUtils.triggerKeyup(oTitle.getDomRef(), KeyCodes.SPACE);

		assert.ok(oTitlePressListenerSpy.calledOnce, "Event was fired when SPACE key is pressed");
	});

	QUnit.test("DynamicPage On Title Press: onsapspace event with shift", function (assert) {
		var oTitlePressListenerSpy = sinon.spy(),
			oTitle = this.oDynamicPage.getTitle();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle._focus();
		this.oDynamicPage.getTitle().attachEvent("_titlePress", oTitlePressListenerSpy);

		QUnitUtils.triggerKeyup(oTitle.getDomRef(), KeyCodes.SPACE, true /*Shift*/);

		assert.strictEqual(oTitlePressListenerSpy.callCount, 0, "Event was not fired when ENTER key is pressed");
	});

	QUnit.test("preventDefault is not called when event target is not the title of the DynamicPage", function (assert) {
		// Arrange
		var oTitle = this.oDynamicPage.getTitle(),
			oInput = new sap.m.Input(),
			oEventMock = {
				srcControl: oInput,
				preventDefault: function () {}
			},
			oEventSpy = sinon.spy(oEventMock, "preventDefault");

		// Act
		oTitle.onsapspace(oEventMock);

		// Assert
		assert.ok(oEventSpy.notCalled, "preventDefault is not called");
	});

	QUnit.test("DynamicPage On Title Press: stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oTitle = this.oDynamicPage.getTitle();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle.fireEvent("_titlePress");

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when title was pressed");
	});

	QUnit.test("DynamicPage On Pin Button Press", function (assert) {
		var oPinPressSpy = this.spy(DynamicPage.prototype, "_onPinUnpinButtonPress"),
			oPinButton = this.oDynamicPage.getHeader()._getPinButton();

		oUtil.renderObject(this.oDynamicPage);
		oPinButton.firePress();

		assert.ok(oPinPressSpy.calledOnce, "Title Pin Press Handler is called");
	});

	QUnit.test("DynamicPage On Collapse Button Press", function (assert) {
		var oCollapseButtonPressSpy = this.spy(DynamicPage.prototype, "_onCollapseHeaderVisualIndicatorPress"),
			oCollapseButtonPressSpy2 = this.spy(DynamicPageHeader.prototype, "_onCollapseButtonPress"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Arrange
		oCollapseButton.firePress();

		// Assert
		assert.ok(oCollapseButtonPressSpy.calledOnce, "DPage: Collapse Header Visual Indicator Press Handler is called");
		assert.ok(oCollapseButtonPressSpy2.calledOnce, "DPageHeader: Collapse Header Visual Indicator Press Handler is called");
	});

	QUnit.test("DynamicPage On Expand Button Press stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.firePress();

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when expand button was pressed");
	});

	QUnit.test("DynamicPage On Snap Header when not enough scrollHeight to snap with scroll and scrollTop > 0", function (assert) {
		var sHeight = "400px",
			aAcceptableValues = Device.browser.edge ? [0, 1] : [0]; // due to different MS browsers calculation

		this.oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to snap on scroll
		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Arrange state:
		this.oDynamicPage.$().height(sHeight); // ensure not enough scrollHeight to snap with scrolling
		this.oDynamicPage.$().width("300px");
		this.oDynamicPage._setScrollPosition(10); // scrollTop > 0

		// Assert state arranged as expected:
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), true, "header is expanded");
		assert.ok(!this.oDynamicPage._canSnapHeaderOnScroll(), "not enough scrollHeight to snap with scroll");
		assert.equal(this.oDynamicPage._needsVerticalScrollBar(), true, "enough scrollHeight to scroll");

		// Act: toggle title to snap the header
		this.oDynamicPage._titleExpandCollapseWhenAllowed();

		// Assert context changed as expected:
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.ok(!this.oDynamicPage._needsVerticalScrollBar(), "not enough scrollHeight to scroll");//because header was hidden during snap
		assert.ok(aAcceptableValues.indexOf(this.oDynamicPage._getScrollPosition()) !== -1,
			"Page is scrolled to top"); // because no more scrolled-out content

		// explicitly call the onscroll listener (to save a timeout in the test):
		this.oDynamicPage._toggleHeaderOnScroll({target: {scrollTop: 0}});

		// Assert
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is still snapped");
	});

	QUnit.test("DynamicPage On Collapse Button MouseOver", function (assert) {
		var oCollapseButtonMouseOverSpy = this.spy(DynamicPage.prototype, "_onVisualIndicatorMouseOver"),
			oCollapseButtonMouseOverSpy2 = this.spy(DynamicPageHeader.prototype, "_onCollapseButtonMouseOver"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.$().trigger("mouseover");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oCollapseButtonMouseOverSpy.calledOnce, "DPage: Collapse Header Visual Indicator MouseOver Handler is called");
		assert.ok(oCollapseButtonMouseOverSpy2.calledOnce, "DPageHeader: Collapse Header Visual Indicator MouseOver Handler is called");
		assert.ok($oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state applied");
	});

	QUnit.test("DynamicPage On Collapse Button MouseOut", function (assert) {
		var oCollapseButtonMouseOutSpy = this.spy(DynamicPage.prototype, "_onVisualIndicatorMouseOut"),
			oCollapseButtonMouseOutSpy2 = this.spy(DynamicPageHeader.prototype, "_onCollapseButtonMouseOut"),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.$().trigger("mouseout");
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oCollapseButtonMouseOutSpy.calledOnce, "DP: Collapse Header Visual Indicator MouseOut Handler is called");
		assert.ok(oCollapseButtonMouseOutSpy2.calledOnce, "DPHeader: Collapse Header Visual Indicator MouseOut Handler is called");
		assert.ok(!$oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state removed");
	});

	QUnit.test("DynamicPage On Expand Button Press", function (assert) {
		var oExpandButtonPressSpy = this.spy(DynamicPage.prototype, "_onExpandHeaderVisualIndicatorPress"),
			oExpandButtonPressSpy2 = this.spy(DynamicPageTitle.prototype, "_onExpandButtonPress"),
			oExpandButton = this.oDynamicPage.getTitle()._getExpandButton();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oExpandButton.firePress();

		assert.ok(oExpandButtonPressSpy.calledOnce, "DPage: Expand Header Visual Indicator Press Handler is called");
		assert.ok(oExpandButtonPressSpy2.calledOnce, "DPageTitle: Expand Header Visual Indicator Press Handler is called");
	});

	QUnit.test("DynamicPage On Expand Button Press stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = sinon.spy(),
			oExpandButton = this.oDynamicPage.getTitle()._getExpandButton();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oExpandButton.firePress();

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when expand button was pressed");
	});

	QUnit.test("DynamicPage Title MouseOver", function (assert) {
		var oTitleMouseOverSpy = this.spy(DynamicPage.prototype, "_onTitleMouseOver"),
			oTitleMouseOverSpy2 = this.spy(DynamicPageTitle.prototype, "onmouseover"),
			oTitle = this.oDynamicPage.getTitle(),
			$oDynamicPage;

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oTitle.onmouseover();
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "DP: Expand Header Visual Indicator MouseOver Handler is called");
		assert.ok(oTitleMouseOverSpy2.calledOnce, "DPTitle: Expand Header Visual Indicator MouseOver Handler is called");
		assert.ok($oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state applied");
	});

	QUnit.test("DynamicPage Title MouseOut", function (assert) {
		var oTitleMouseOverSpy = this.spy(DynamicPage.prototype, "_onTitleMouseOut"),
			oTitleMouseOverSpy2 = this.spy(DynamicPageTitle.prototype, "onmouseout"),
			oTitle = this.oDynamicPage.getTitle(),
			$oDynamicPage;

		// Act
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oTitle.onmouseout();
		$oDynamicPage = this.oDynamicPage.$();

		// Assert
		assert.ok(oTitleMouseOverSpy.calledOnce, "DP: Expand Header Visual Indicator MouseOut Handler is called");
		assert.ok(oTitleMouseOverSpy2.calledOnce, "DPTitle: Expand Header Visual Indicator MouseOut Handler is called");
		assert.ok(!$oDynamicPage.hasClass("sapFDynamicPageTitleForceHovered"), "DPageTitle hover state removed");
	});

	QUnit.test("DynamicPage header resize", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage,
			isHeaderSnappedWithScroll = function () {
				return this.oDynamicPage._getScrollPosition() >= this.oDynamicPage._getSnappingHeight();
			}.bind(this);

		oHeader.addContent(new sap.m.Panel({height: "100px"}));

		// setup
		oUtil.renderObject(this.oDynamicPage);
		this.oDynamicPage.setHeaderExpanded(false);

		// assert init state
		assert.ok(isHeaderSnappedWithScroll(), "header is snapped with scroll");

		//Act
		$oDynamicPage = this.oDynamicPage.$();
		$oDynamicPage.find('.sapMPanel').get(0).style.height = "300px";
		// explicitly call to avoid waiting for resize handler to detect change
		this.oDynamicPage._onChildControlsHeightChange({target: oHeader.getDomRef()});

		// Check
		assert.ok(isHeaderSnappedWithScroll(), "header is still snapped with scroll");
	});

	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage On Title Press when Header State Preserved On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithPreserveHeaderOnScroll();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press", function (assert) {
		var oTitle = this.oDynamicPage.getTitle(),
			oHeader = this.oDynamicPage.getHeader();

		oUtil.renderObject(this.oDynamicPage);

		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header visible by default");

		oTitle.fireEvent("_titlePress");
		assert.ok(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header snapped and hidden");

		oTitle.fireEvent("_titlePress");
		assert.ok(!oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), "Header expanded and visible again");
	});

	QUnit.module("DynamicPage when Header height bigger than page height", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBigHeaderContent();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage On Title Press", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle();

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		//act
		oTitle.fireEvent("_titlePress");
		assert.equal(oDynamicPage._bHeaderInTitleArea, false, "Header is not added to the title");
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "Header is expanded");
		assert.equal(oDynamicPage._getScrollPosition(), 0, "scroll position is correct");
	});

	QUnit.test("Expand header updates scrollbar", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oScrollSpy = this.spy(oDynamicPage, "_onWrapperScroll"),
			done = assert.async();

		assert.expect(2);

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		oScrollSpy.reset();

		//act
		oTitle.fireEvent("_titlePress");
		setTimeout(function() {
			assert.equal(oScrollSpy.callCount, 1, "listener for updating the custom scrollBar position is called");
			done();
		}, 0);
	});

	QUnit.test("expand shows the visual indicator", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oExpandButton = oDynamicPage.getTitle()._getExpandButton(),
			oCollapseButton = oDynamicPage.getHeader()._getCollapseButton(),
			oSpy = this.spy(oDynamicPage, "_scrollBellowCollapseVisualIndicator"),
			iCollapseButtonBottom,
			iDynamicPageBottom;

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		//act: expand via the 'expand' visual indicator
		oExpandButton.firePress();

		// check
		assert.equal(oSpy.callCount, 1, "scroll to show the 'collapse' visual indicator is called");

		iCollapseButtonBottom =  Math.round(Math.abs(oCollapseButton.getDomRef().getBoundingClientRect().bottom));
		iDynamicPageBottom = Math.round(Math.abs(this.oDynamicPage.getDomRef().getBoundingClientRect().bottom));

		// check position
		assert.ok(Math.abs(iCollapseButtonBottom - iDynamicPageBottom) <= 1, "CollapseButton is at the bottom of the page, pos: " + iCollapseButtonBottom);
	});

	QUnit.test("Expand button of snapped header preserved on resize", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oStubCanScroll = this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll", function () {
				return false;
			}),
			oStubHeaderHeight = this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToBeExpandedInTitleArea", function () {
				return true;
			}),
			oMockResizeWidthEvent = {size:{width: 100}};

		// Final setup step: snap header => the expand button should become visible after rendering
		oDynamicPage.setHeaderExpanded(false);

		oUtil.renderObject(oDynamicPage);

		// Act
		oDynamicPage._onResize(oMockResizeWidthEvent);

		assert.ok(!oDynamicPage.getTitle()._getExpandButton().$().hasClass('sapUiHidden'), "expand button is visible");

		//cleanup
		oStubCanScroll.restore();
		oStubHeaderHeight.restore();
	});


	/* --------------------------- DynamicPage Private functions ---------------------------------- */
	QUnit.module("DynamicPage - Private functions", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _shouldOverridePreserveHeaderStateOnScroll() should return 'true' for Desktop when needed", function (assert) {
		// Arrange
		var oPreserveHeaderStateStub = this.stub(this.oDynamicPage, "_preserveHeaderStateOnScroll", function () {
				return true;
			}),
			oBiggerHeaderStub = this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToBeFixed", function () {
				return true;
			}),
			oDeviceStub = this.stub(Device, "system", {
					desktop: true,
					tablet: false,
					phone: false
			});

			// Assert
			assert.strictEqual(this.oDynamicPage._shouldOverridePreserveHeaderStateOnScroll(), true,
				"Preserving header state on scroll is overriden for desktop too, when it is too big");

			// Clean up
			oPreserveHeaderStateStub.restore();
			oBiggerHeaderStub.restore();
			oDeviceStub.restore();
	});

	QUnit.test("DynamicPage _expandHeader() should hide Snapped Content and show Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._expandHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), true, "Snapped Content is not visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), false, "Expanded Content is visible initially");
	});

	QUnit.test("DynamicPage _snapHeader() should show Snapped Content and hide Expand Content", function (assert) {
		var $titleSnap = this.oDynamicPage.getTitle().$("snapped-wrapper"),
			$titleExpand = this.oDynamicPage.getTitle().$("expand-wrapper");

		this.oDynamicPage._snapHeader();

		assert.equal($titleSnap.hasClass("sapUiHidden"), false, "Snapped Content is visible initially");
		assert.equal($titleExpand.hasClass("sapUiHidden"), true, "Expanded Content is not visible initially");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea() should move the Header from title are to content area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in content area initially");

		oDynamicPage._moveHeaderToTitleArea();
		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");

		oDynamicPage._moveHeaderToContentArea();
		assert.equal($wrapper.find($header).length > 0, true, "Header is back in the content area");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$HeaderDom = this.oDynamicPage.getHeader().getDomRef(),
			iHeaderHeight = getElementHeight($HeaderDom, true /* ceil */),
			iScrollPositionBefore = iHeaderHeight + 100, // pick position greater than snapping height
			iExpectedScrollPositionAfter = iScrollPositionBefore + iHeaderHeight; // add iHeaderHeight as the header will be moved into the content area

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//check
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "scroll position of content is offset");
	});

	QUnit.test("DynamicPage _moveHeaderToContentArea(true) should offset the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			iHeaderHeight = getElementHeight(oHeader.getDomRef(), true /* ceil */),
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = iHeaderHeight; // header height is added

		// setup
		oDynamicPage._moveHeaderToTitleArea();
		assert.strictEqual(oDynamicPage._getScrollPosition(), iScrollPositionBefore, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToContentArea(true);

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "Scroll position is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea() should move the header from the content area to the title area", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$titleWrapper = oDynamicPage.$("header"),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area initially");

		oDynamicPage._moveHeaderToTitleArea();

		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");
		assert.equal($titleWrapper.find($header).length > 0, true, "Header is in not in the title area");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should offset the scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			iHeaderHeight = getElementHeight(oHeader.getDomRef(), true /* ceil */),
			iScrollPositionBefore = iHeaderHeight + 100,
			iExpectedScrollPositionAfter = 100; // iHeaderHeight should be substracted

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iScrollPositionBefore);

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPositionAfter, "Scroll position of the content area is correctly offset");
	});

	QUnit.test("DynamicPage _moveHeaderToTitleArea(true) should preserve the top scroll position of the content", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			iScrollPositionBefore = 0,
			iExpectedScrollPositionAfter = 0; // should remain 0 as the header is still expanded

		assert.strictEqual(iScrollPositionBefore, 0, "Scroll position is the top of the content area");

		//act
		oDynamicPage._moveHeaderToTitleArea(true);

		//assert
		assert.equal($wrapper.scrollTop(), iExpectedScrollPositionAfter, "Scroll position is still the top of the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderVisibility() should show/hide the DynamicPAge`s Header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$();

		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), false, "Header is visible initially");

		oDynamicPage._toggleHeaderVisibility(false);
		assert.ok($header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is not visible");

		oDynamicPage._toggleHeaderVisibility(true);
		assert.ok(!$header.hasClass("sapFDynamicPageHeaderHidden"), true, "Header is visible again");
	});

	QUnit.test("DynamicPage _pin()/_unPin()", function (assert) {
		var $headerWrapper = this.oDynamicPage.$("header"),
			$contentWrapper = this.oDynamicPage.$("contentWrapper"),
			sHeaderId = this.oDynamicPage.getHeader().getId(),
			oPinSpy = this.spy(this.oDynamicPage, "_updateScrollBar"),
			oDynamicPageTitle = this.oDynamicPage.getTitle(),
			oDynamicPageHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage =  this.oDynamicPage.$(),
			$oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oDynamicPageTitle.getAggregation("_expandButton").$();

		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper initially");

		// Act
		this.oDynamicPage._pin();

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header is in the Header wrapper when pinned");
		assert.ok(oPinSpy.called, "The ScrollBar is updated");
		assert.equal($oDynamicPage.hasClass("sapFDynamicPageHeaderPinned"), true, "Header is pinned, Pinned class applied to DynamicPage root element");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is pinned, the Expand Button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is pinned, the Collapse Button is visible");

		// Act
		this.oDynamicPage._unPin();

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header remains in the header wrapper when unpinned until scroll");
		assert.equal($oDynamicPage.hasClass("sapFDynamicPageHeaderPinned"), false, "Header is unpinned, Pinned class is not applied to DynamicPage root element");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is unpinned and expanded, the Collapse button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is unpinned and expanded, the Expand button is not visible");

	});

	QUnit.test("DynamicPage _canSnapHeaderOnScroll() should return the correct value", function (assert) {
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), true, "The header can snap");
	});

	QUnit.test("DynamicPage _shouldExpandOnScroll() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldExpandOnScroll(), false, "DynamicPage should not expand initially");
	});

	QUnit.test("DynamicPage _shouldSnapOnScroll() returns false initially", function (assert) {
		assert.equal(this.oDynamicPage._shouldSnapOnScroll(), false, "DynamicPage should not snap initially");
	});

	QUnit.test("DynamicPage _getTitleHeight() returns the correct Title height", function (assert) {
		assert.equal(this.oDynamicPage._getTitleHeight(), getElementHeight(this.oDynamicPage.getTitle().getDomRef()),
			"DynamicPage Title height is correct");
	});

	QUnit.test("DynamicPage _getHeaderHeight() returns the Header height", function (assert) {
		var iActualHeaderHeight = getElementHeight(this.oDynamicPage.getHeader().getDomRef());

		assert.equal(this.oDynamicPage._getHeaderHeight(), iActualHeaderHeight, "DynamicPage Header height is correct");
	});

	QUnit.test("DynamicPage _getSnappingHeight() returns the correct Snapping position", function (assert) {
		var $HeaderDom = this.oDynamicPage.getHeader().getDomRef(),
			$TitleDom = this.oDynamicPage.getTitle().getDomRef(),
			iSnappingPosition = getElementHeight($HeaderDom, true /* ceil */) || getElementHeight($TitleDom, true /* ceil */);

		assert.equal(this.oDynamicPage._getSnappingHeight(), iSnappingPosition, "DynamicPage snapping position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct initial Scroll position", function (assert) {
		assert.equal(this.oDynamicPage._getScrollPosition(), 0,
			"DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(Math.ceil(this.oDynamicPage._getScrollPosition()), iExpectedScrollPosition, "DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct scroll position upon wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar");

		//arrange
		this.oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		this.oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "custom scrollBar scrollPosition is correct");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is called once after wrapper scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			$wrapper = oDynamicPage.$wrapper,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//arrange
		$wrapper.scrollTop(iExpectedScrollPosition);

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oDynamicPageScrollBar.getScrollPosition(), iExpectedScrollPosition, "ScrollBar Scroll position is correct");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(oScrollPositionSpy.calledOnce, true, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage scrollbar.setScrollPosition() is not called again after custom scrollBar scroll", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			oDynamicPageScrollBar = this.oDynamicPage.getAggregation("_scrollBar"),
			oScrollPositionSpy;

		//arrange
		oDynamicPageScrollBar.setScrollPosition(iExpectedScrollPosition);
		oScrollPositionSpy = sinon.spy(oDynamicPageScrollBar, "setScrollPosition");

		//act
		oDynamicPage._onScrollBarScroll();

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPosition, "DynamicPage Scroll position is correct");

		//act
		oDynamicPage._onWrapperScroll({target: {scrollTop: 500}});

		//assert
		assert.equal(oScrollPositionSpy.called, false, "scrollBar scrollPosition setter is not called again");
	});

	QUnit.test("DynamicPage preserves scroll position after rerendering", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			oSetScrollPositionSpy;

		//arrange
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);
		oDynamicPage._onWrapperScroll({target: {scrollTop: iExpectedScrollPosition}});
		oSetScrollPositionSpy = this.spy(oDynamicPage, "_setScrollPosition");
		//act
		oDynamicPage.rerender();

		//assert
		assert.ok(oSetScrollPositionSpy.calledWith, iExpectedScrollPosition,
			"DynamicPage Scroll position is correct after rerender");
	});

	QUnit.test("DynamicPage preserves scroll position when navigating to another page and then comming back", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage,
			oStub = this.stub(this.oDynamicPage, "_getScrollPosition", function () {
				return 0;
			}); // Scroll position of wrapper is set to 0 when navigating to another page

		//arrange
		oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);
		oDynamicPage._onWrapperScroll({target: {scrollTop: iExpectedScrollPosition}});

		//act
		oDynamicPage._offsetContentOnMoveHeader();
		oStub.restore(); // restore getScrollPosition to return the real scroll value

		//assert
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPosition,
			"DynamicPage Scroll position is correct after navigating to another page and then comming back");
	});

	QUnit.test("DynamicPage _headerSnapAllowed() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage;


		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed initially");

		oDynamicPage._pin();
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is pinned");

		oDynamicPage._unPin();
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after unpinning");

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because preserveHeaderStateOnScroll is true");

		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed because preserveHeaderStateOnScroll is false");

		oDynamicPage._snapHeader(true);
		assert.ok(!oDynamicPage._headerSnapAllowed(), "Header snapping not allowed because header is snapped already");

		oDynamicPage._expandHeader(true);
		assert.ok(oDynamicPage._headerSnapAllowed(), "Header snapping allowed after expanding");
	});

	QUnit.test("DynamicPage _headerScrolledOut() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			iScrolledOutPoint = oTitle.$().outerHeight() + oHeader.$().outerHeight();

		assert.ok(!oDynamicPage._headerScrolledOut(), "Header is not scrolled out initially");

		oDynamicPage._setScrollPosition(iScrolledOutPoint);
		Core.applyChanges();

		assert.ok(oDynamicPage._headerScrolledOut(), "Header is scrolled out after scrolling to the header`s very bottom");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			},
			fnSpy = this.spy(DynamicPage.prototype, "_togglePinButtonVisibility");

		fnStubConfig(700, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), true,
			"DynamicPage Header is bigger than allowed");

		oDynamicPage._expandHeader();

		assert.ok(fnSpy.notCalled, "_togglePinButtonVisibility should not be called");

		oSandBox.restore();

		fnStubConfig(100, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), false,
			"DynamicPage Header is not bigger than allowed");

		oDynamicPage._expandHeader();

		assert.ok(fnSpy.calledOnce, "_togglePinButtonVisibility should be called");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() is called on child resize", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnSpy = oSandBox.spy(oDynamicPage, "_headerBiggerThanAllowedToPin");

		oSandBox.stub(oDynamicPage, "_canSnapHeaderOnScroll").returns(false);

		// Act: resize the header (call the resize listener synchronously to save timeout in the test)
		oDynamicPage._onChildControlsHeightChange({target: oDynamicPage.getHeader().getDomRef()});

		assert.ok(fnSpy.called, "_headerBiggerThanAllowedToPin is called");

		oSandBox.restore();
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToBeExpandedInTitleArea() returns the correct value on desktop", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			},
			iSmallHeaderHeight = 700,
			iLargeHeaderHeight = 1100,
			iPageHeight = 1000,
			iNoHeaderHeight = 0,
			iNoPageHeight = 0;

		// act (1) -  Header`s height is smaller than the Page`s height.
		fnStubConfig(iSmallHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"DynamicPage Header is not bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (2) - Header`s height is bigger than the Page`s height.
		fnStubConfig(iLargeHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true,
			"DynamicPage Header is bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (3) - Header`s height and Page`s height are 0.
		fnStubConfig(iNoHeaderHeight, iNoPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"When Header is not on the page return false");

		oSandBox.restore();
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToBeExpandedInTitleArea() returns the correct value on mobile", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSandBox = sinon.sandbox.create(),
			fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
				oSandBox.stub(oDynamicPage, "_getEntireHeaderHeight").returns(iHeaderHeight);
				oSandBox.stub(oDynamicPage, "_getOwnHeight").returns(iDynamicPageHeight);
			},
			iSmallHeaderHeight = 100,
			iLargeHeaderHeight = 400,
			iPageHeight = 1000,
			iNoHeaderHeight = 0,
			iNoPageHeight = 0;

		// act (1) -  Header`s height is smaller than the Page`s height.
		oUtil.toMobileMode();
		fnStubConfig(iSmallHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"DynamicPage Header is not bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (2) - Header`s height is bigger than 1/3 (0.3) of the Page`s height.
		fnStubConfig(iLargeHeaderHeight, iPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true,
			"DynamicPage Header is bigger than allowed to be expanded in the non-scrollable area");

		oSandBox.restore();

		// act (3) - Header`s height and Page`s height are 0.
		fnStubConfig(iNoHeaderHeight, iNoPageHeight);

		// assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), false,
			"When Header is not on the page return false");

		// cleanup
		oSandBox.restore();
		oUtil.toDesktopMode();
	});

	QUnit.test("DynamicPage _getEntireHeaderHeight() return correct values", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader();

		assert.equal(oDynamicPage._getEntireHeaderHeight(),
			oTitle.$().outerHeight() + oHeader.$().outerHeight(), "correct with both header and title");

		oDynamicPage.setTitle(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oHeader.$().outerHeight(), "correct with only header");

		oDynamicPage.setTitle(oTitle);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), oTitle.$().outerHeight(), "correct with only title");

		oDynamicPage.setTitle(null);
		oDynamicPage.setHeader(null);
		assert.equal(oDynamicPage._getEntireHeaderHeight(), 0, "correct with no header and no title");
	});

	QUnit.test("DynamicPage _hasVisibleTitleAndHeader returns correct state" , function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = oDynamicPage.getHeader(),
			aHeaderContent = oHeader.getContent();

		// Assert
		assert.ok(aHeaderContent.length, "Content aggregation is set");
		assert.ok(oDynamicPage._hasVisibleTitleAndHeader(), "Title and Header are visible");

		// Act
		oHeader.destroyContent();

		// Assert
		assert.notOk(oDynamicPage._hasVisibleTitleAndHeader(), "Header is not visible");
	});

	QUnit.test("DynamicPageTitle _getActionsToolbar returns toolbar with correct style", function (assert) {
		var oActionsToolbar = this.oDynamicPage.getTitle()._getActionsToolbar();
		assert.equal(oActionsToolbar.getStyle(), sap.m.ToolbarStyle.Clear, "actions toolbar has correct style");
	});

	QUnit.test("DynamicPageTitle _getNavigationActionsToolbar returns toolbar with correct style", function (assert) {
		var oNavActionsToolbar = this.oDynamicPage.getTitle()._getNavigationActionsToolbar();
		assert.equal(oNavActionsToolbar.getStyle(), sap.m.ToolbarStyle.Clear, "nav-actions toolbar has correct style");
	});

	/* --------------------------- DynamicPage Toggle Header On Scroll ---------------------------------- */
	QUnit.module("DynamicPage - Toggle Header On Scroll", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithExpandSnapContent();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height preserves expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		$wrapper.scrollTop(iSnappingHeight - 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is still expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iSnappingHeight = oDynamicPage._getSnappingHeight();

		//arrange
		oDynamicPage.getScrollDelegate().scrollTo(0, iSnappingHeight + 1);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll for position <= snapping height when header in title preserves the expanded state", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$header = this.oDynamicPage.getHeader().$(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = $header.outerHeight();

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		$wrapper.scrollTop(iHeaderHeight - 10); // scroll to expand

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is expanded");
		assert.equal($wrapper.find($header).length > 0, true, "Header is still in the content area");
	});

	QUnit.test("Scrolling from expanded header in title to position > snapping height snaps the header", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oHeader = this.oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$HeaderDom = oHeader.getDomRef(),
			$wrapper = oDynamicPage.$wrapper,
			iHeaderHeight = getElementHeight($HeaderDom, true),
			iTestScrollPosition = iHeaderHeight + 100, // pick position greater than snapping height => will require snap
			iExpectedScrollPosition = iTestScrollPosition + iHeaderHeight;

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		oDynamicPage.getScrollDelegate().scrollTo(0, iTestScrollPosition);

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), false, "header is snapped");
		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area");
		assert.equal(oDynamicPage._getScrollPosition(), iExpectedScrollPosition, "Scroll position is correctly offset");
	});

	QUnit.module("DynamicPage - Header initially collapsed", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true}", function (assert) {
		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = this.oDynamicPage.getHeader();

		//arrange
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.setPreserveHeaderStateOnScroll(true); // will toggle the value of headerExpanded
		this.oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(this.oDynamicPage);

		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is still false");
		assert.strictEqual(this.oDynamicPage.$titleArea.hasClass(sSnappedClass), true);
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), true, "Header is hidden");
	});

	QUnit.test("Expand and Collapse buttons initial visibility", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			oTitle = this.oDynamicPage.getTitle(),
			$oCollapseButton,
			$oExpandButton;

		// Act
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.setPreserveHeaderStateOnScroll(true); // will toggle the value of headerExpanded
		this.oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		oUtil.renderObject(this.oDynamicPage);
		$oCollapseButton = oHeader.getAggregation("_collapseButton").$();
		$oExpandButton = oTitle.getAggregation("_expandButton").$();

		// Assert
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, Collapsed button is not visible");
	});

	function assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {
		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			oTitle = oDynamicPage.getTitle(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header"),
			$oCollapseButton = oHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oTitle.getAggregation("_expandButton").$(),
			iActualScrollPosition = oDynamicPage._getScrollPosition();

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), false, "The DynamicPage getHeaderExpanded is false");
		assert.ok(oDynamicPage.$titleArea.hasClass(sSnappedClass), "title has snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), !bExpectedHeaderInContent, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal(iActualScrollPosition, iExpectedScrollPosition, "Scroll position is correct");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), false, "Header is collapsed, Expand button is visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), true, "Header is collapsed, Collapsed button is not visible");
	}

	function assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition) {

		var sSnappedClass = "sapFDynamicPageTitleSnapped",
			oHeader = oDynamicPage.getHeader(),
			oTitle = oDynamicPage.getTitle(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper,
			$titleWrapper = oDynamicPage.$("header"),
			$oCollapseButton = oHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oTitle.getAggregation("_expandButton").$(),
			iActualScrollPosition = oDynamicPage._getScrollPosition();

		iExpectedScrollPosition = iExpectedScrollPosition || 0;

		assert.strictEqual(oDynamicPage.getHeaderExpanded(), true, "The DynamicPage getHeaderExpanded is true");
		assert.strictEqual(oDynamicPage.$titleArea.hasClass(sSnappedClass), false, "title does not have snapped css-class");
		assert.strictEqual(oHeader.$().hasClass("sapFDynamicPageHeaderHidden"), false, "Header visibility is correct");
		assert.equal($titleWrapper.find($header).length > 0, !bExpectedHeaderInContent, "Header in the title value is correct");
		assert.equal($wrapper.find($header).length > 0, bExpectedHeaderInContent, "Header in the content value is correct");
		assert.equal(iActualScrollPosition, iExpectedScrollPosition, "Scroll position is correct");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is expanded, Expand button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is expanded, Collapsed button is visible");
	}

	function getElementHeight($Element, bCeil) {
		var iElementHeight;

		if (!$Element) {
			return 0;
		}

		iElementHeight = $Element.getBoundingClientRect().height;

		return bCeil ? Math.ceil(iElementHeight) : iElementHeight;
	}

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = true,
			iExpectedScrollPosition;

		//arrange
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		iExpectedScrollPosition = oDynamicPage._getSnappingHeight();

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: true; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("{headerExpanded: false; preserveHeaderStateOnScroll: false; _canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0;

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap

		//act
		oUtil.renderObject(oDynamicPage);

		//assert
		assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bExpectedHeaderInContent = false,
			iExpectedScrollPosition = 0,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
				//assert
				assertHeaderSnapped(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				assertHeaderExpanded(assert, bExpectedHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can enable headerExpanded when {_canSnapHeaderOnScroll: true}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition,
			done = assert.async();

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(300)); // enough content to allow snap
		oDynamicPage.addEventDelegate({
			onAfterRendering: function() {
			iExpectedScrollPosition = oDynamicPage._getSnappingHeight();
				//assert
				assertHeaderSnapped(assert, bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				oDynamicPage.setHeaderExpanded(true);
				iExpectedScrollPosition = 0;
				assertHeaderExpanded(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
				done();
			}
		});
		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("onAfterRendering can modify preserveHeaderStateOnScroll when {_canSnapHeaderOnScroll: false}", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			bHeaderInContent = true,
			iExpectedScrollPosition = 0,
			done = assert.async(),
			oDelegateFirstRendering = {
				onAfterRendering: function() {
					//assert
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					oDynamicPage.removeEventDelegate(oDelegateFirstRendering);
					oDynamicPage.setPreserveHeaderStateOnScroll(true); // causes invalidation, so check in next rendering:
					Core.applyChanges();
					assertHeaderSnapped(assert, !bHeaderInContent, oDynamicPage, iExpectedScrollPosition);
					done();
				}
			};

		//arrange
		oDynamicPage.setPreserveHeaderStateOnScroll(false);
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.setContent(oFactory.getContent(1)); // not enough content to allow snap
		oDynamicPage.addEventDelegate(oDelegateFirstRendering);

		//act
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.test("DynamicPage._setScrollPosition dependency on scroll delegate", function (assert) {

		var oDynamicPage = this.oDynamicPage,
			done = assert.async(),
			iNewScrollPosition = 10,
			oDelegate;

		oDelegate = {
			onAfterRendering: function() {
				setTimeout(function() {
					//check
					assert.ok(oDynamicPage.getScrollDelegate().hasOwnProperty("_$Container"), "scroll delegate has property _$Container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container.length, 1, "scroll delegate obtained reference to page container");
					assert.strictEqual(oDynamicPage.getScrollDelegate()._$Container[0], oDynamicPage.$wrapper[0], "scroll delegate container reference is wrapper reference");

					//act
					oDynamicPage._setScrollPosition(iNewScrollPosition);
					//check
					assert.strictEqual(oDynamicPage._getScrollPosition(), iNewScrollPosition, "scroll position is correct");
					done();
				}, 0);
			}
		};

		oDynamicPage.addEventDelegate(oDelegate);
		oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
	});

	QUnit.module("DynamicPage - toggleHeaderOnTitleClick", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageToggleHeaderFalse();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage toggleHeaderOnTitleClick initial behavior", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$oDynamicPageTitleSpan = oDynamicPage.getTitle()._getFocusSpan().$();

		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), false, "Initially toggleHeaderOnTitleClick = false");
		assert.equal($oDynamicPageTitleSpan.attr("tabindex"), undefined, "Initially the header title is not focusable");
	});

	/* --------------------------- DynamicPage ARIA ---------------------------------- */
	QUnit.module("DynamicPage - ARIA State", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Header has the correct Aria state", function (assert) {
		var $header = this.oDynamicPage.getHeader().$(),
			sRole = "region",
			sAriaExpandedValue = "true",
			sAriaLabelValue = oFactory.getResourceBundle().getText("EXPANDED_HEADER");
		this.stub(this.oDynamicPage, "_shouldSnapOnScroll", function () {
			return true;
		});
		this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll", function () {
			return true;
		});

		assert.equal($header.attr("role"), sRole,
			"DynamicPage Header role 'region'");
		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");

		sAriaExpandedValue = "false";
		sAriaLabelValue = oFactory.getResourceBundle().getText("SNAPPED_HEADER");
		this.oDynamicPage._toggleHeaderOnScroll();

		assert.equal($header.attr("aria-expanded"), sAriaExpandedValue,
			"DynamicPage Header aria-expanded 'true'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct Aria state", function (assert) {
		var $pinButton = this.oDynamicPage.getHeader()._getPinButton().$(),
			sAriaPressedValue = "false",
			sAriaControlsValue = this.oDynamicPage.getHeader().getId();

		assert.equal($pinButton.attr("aria-controls"), sAriaControlsValue,
			"DynamicPage Header Pin button aria-controls points to the Header");
		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'false'");

		$pinButton.trigger('tap');
		sAriaPressedValue = "true";

		assert.equal($pinButton.attr("aria-pressed"), sAriaPressedValue,
			"DynamicPage Header  Pin button aria-pressed 'true'");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when pin and unpin", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip, "The tooltip is correct");

		this.oDynamicPage._unPin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip, "The tooltip is correct");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when changing preserveHeaderStateOnScroll", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER"),
			sUnPinTooltip = oFactory.getResourceBundle().getText("UNPIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		Core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sUnPinTooltip,
			"The tooltip is correct: unchanged when preserveHeaderStateOnScroll is true");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(false);
		Core.applyChanges();
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct: resetted when preserveHeaderStateOnScroll is false");
	});

	QUnit.module("Title responsiveness", {
		beforeEach: function(assert) {

			var oXmlString = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap" xmlns:m="sap.m" xmlns:f="sap.f" displayBlock="true" height="100%">',
					'<f:DynamicPageTitle id="DynamicPageTitle" primaryArea="Begin">',
						'<f:expandedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:expandedHeading>',
						'<f:snappedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<f:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
									'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'</m:FlexBox>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:snappedHeading>',
						'<f:expandedContent>',
							'<m:Text text="Senior Developer" />',
						'</f:expandedContent>',
						'<f:snappedContent>',
						   '<m:Text text="Senior Developer" />',
						'</f:snappedContent>',
						'<f:content>',
							'<m:OverflowToolbar>',
								'<m:Button text="KPI 1" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 2" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 3" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 4" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 5" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 6" class="sapUiTinyMargin"/>',
							'</m:OverflowToolbar>',
						'</f:content>',
						'<f:actions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://copy"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://delete"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://add"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://paste"/>',
						'</f:actions>',
						'<f:navigationActions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://full-screen" tooltip="Enter Full Screen Mode"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://decline" tooltip="Close column"/>',
						'</f:navigationActions>',
					'</f:DynamicPageTitle>',
				'</mvc:View>'
			].join('');

			var Comp,
				done = assert.async();

			XMLView.create({
				id: "comp---view",
				definition: oXmlString
			}).then(function (oView) {
				Comp = UIComponent.extend("test", {
					metadata: {
						manifest : {
							"sap.app": {
								"id": "test",
								"type": "application"
							}
						}
					},
					createContent : function() {
						return oView;
					}
				});

				this.oUiComponent = new Comp("comp");
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponent
				});

				this.oUiComponentContainer.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
				done();
			}.bind(this));
		},

		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Test flex-basis styles are set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle");

		// assert
		assert.notEqual(oTitle.$("content").css("flex-basis"), "auto", "FlexBasis must be set on 'content' div.");
		assert.notEqual(oTitle.$("mainActions").css("flex-basis"), "auto", "FlexBasis must be set on 'mainActions' div.");
	});

	QUnit.test("Test flex-basis styles change when an action is added", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			nOldFlexBasis = parseInt(oTitle.$("mainActions").css("flex-basis")),
			nNewFlexBasis;

		// act
		oTitle.addAction(new OverflowToolbarButton({
			type: "Transparent",
			icon: "sap-icon://copy"
		}));

		Core.applyChanges();

		nNewFlexBasis = parseInt(oTitle.$("mainActions").css("flex-basis"));

		// assert
		assert.ok(nNewFlexBasis > nOldFlexBasis, "New flex-basis value should be greater since an action was added.");
	});

	QUnit.module("Title responsiveness shrink factors", {
		beforeEach: function(assert) {

			var oXmlString = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns="sap.uxap" xmlns:m="sap.m" xmlns:f="sap.f" displayBlock="true" height="100%">',
					'<f:DynamicPageTitle id="DynamicPageTitle">',
						'<f:expandedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:expandedHeading>',
						'<f:snappedHeading>',
							'<m:FlexBox wrap="Wrap" fitContainer="true" alignItems="Center">',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<f:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
									'<m:Title text="Denise Smith" wrapping="true" class="sapUiTinyMarginEnd"/>',
								'</m:FlexBox>',
								'<m:FlexBox wrap="NoWrap" fitContainer="true" alignItems="Center" class="sapUiTinyMarginEnd">',
									'<m:ObjectMarker type="Favorite" class="sapUiTinyMarginEnd"/>',
									'<m:ObjectMarker type="Flagged"/>',
									'<m:Button icon="sap-icon://private" type="Transparent"/>',
									'<m:Button icon="sap-icon://arrow-down" type="Transparent"/>',
								'</m:FlexBox>',
							'</m:FlexBox>',
						'</f:snappedHeading>',
						'<f:expandedContent>',
							'<m:Text text="Senior Developer" />',
						'</f:expandedContent>',
						'<f:snappedContent>',
						   '<m:Text text="Senior Developer" />',
						'</f:snappedContent>',
						'<f:content>',
							'<m:OverflowToolbar>',
								'<m:Button text="KPI 1" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 2" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 3" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 4" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 5" class="sapUiTinyMargin"/>',
								'<m:Button text="KPI 6" class="sapUiTinyMargin"/>',
							'</m:OverflowToolbar>',
						'</f:content>',
						'<f:actions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://copy"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://delete"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://add"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://paste"/>',
						'</f:actions>',
						'<f:navigationActions>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://full-screen" tooltip="Enter Full Screen Mode"/>',
							'<m:OverflowToolbarButton type="Transparent" icon="sap-icon://decline" tooltip="Close column"/>',
						'</f:navigationActions>',
					'</f:DynamicPageTitle>',
				'</mvc:View>'
			].join('');

			var Comp,
				done = assert.async();

			XMLView.create({
				id: "comp---view",
				definition: oXmlString
			}).then(function (oView) {
				Comp = UIComponent.extend("test", {
					metadata: {
						manifest : {
							"sap.app": {
								"id": "test",
								"type": "application"
							}
						}
					},
					createContent : function() {
						return oView;
					}
				});

				this.oUiComponent = new Comp("comp");
				this.oUiComponentContainer = new ComponentContainer({
					component : this.oUiComponent
				});

				this.oUiComponentContainer.placeAt(TESTS_DOM_CONTAINER);
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Test flex-basis styles when primaryArea=Middle", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setPrimaryArea("Middle");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1.6, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 1, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 1.6, "Actions shrink factor is correct");
	});

	QUnit.test("Test flex-basis styles when primaryArea=Begin and areaShrinkRatio is set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setAreaShrinkRatio("1:2:4");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 2, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 4, "Actions shrink factor is correct");
	});

	QUnit.test("Test flex-basis styles when primaryArea=Middle and areaShrinkRatio is set", function(assert) {
		// arrange
		var oTitle = Core.byId("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setPrimaryArea("Middle");
		oTitle.setAreaShrinkRatio("1:2:4");

		Core.applyChanges();

		// assert
		assert.equal(parseFloat(oHeading.css("flex-shrink")).toFixed(1), 1, "Heading shrink factor is correct");
		assert.equal(parseFloat(oContent.css("flex-shrink")).toFixed(1), 2, "Content shrink factor is correct");
		assert.equal(parseFloat(oActions.css("flex-shrink")).toFixed(1), 4, "Actions shrink factor is correct");
	});


	QUnit.module("DynamicPage - Preserving scroll position", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("Toggling page visibility preserves the scroll", function(assert) {
		var SCROLL_POSITION = 200,
			oDynamicPageDOMElement = document.getElementById(this.oDynamicPage.getId()),
			iActualSetScrollPosition;

		// arrange - store the actual reached scroll position, as the container might not have enough scroll height
		this.oDynamicPage._setScrollPosition(SCROLL_POSITION);
		iActualSetScrollPosition = this.oDynamicPage._getScrollPosition();


		// act
		oDynamicPageDOMElement.style.display = 'none';

		// assert
		assert.strictEqual(this.oDynamicPage._getHeight(this.oDynamicPage), 0,
			"Dynamic Page is hidden");

		// act
		oDynamicPageDOMElement.style.display = 'flex';

		// assert
		assert.notEqual(this.oDynamicPage._getHeight(this.oDynamicPage), 0,
			"DynamicPage is visible again");
		assert.strictEqual(this.oDynamicPage._getScrollPosition(), iActualSetScrollPosition,
			"Scroll position " + iActualSetScrollPosition + "is preserved.");
	});

	QUnit.test("Calling _updateMedia with falsy value should not take action", function(assert) {
		// setup
		var oUpdateMediaStyleSpy = sinon.spy(this.oDynamicPage, "_updateMediaStyle");

		// act
		this.oDynamicPage._updateMedia(0);

		// assert
		assert.ok(oUpdateMediaStyleSpy.notCalled, "Media styles were not changed");
	});
});
