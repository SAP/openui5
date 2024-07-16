/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"./DynamicPageUtil",
	"sap/f/DynamicPage",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/m/Input",
	"sap/m/Panel",
	"sap/m/Text",
	"sap/m/VBox",
	"sap/m/library",
	"sap/f/DynamicPageAccessibleLandmarkInfo",
	"sap/ui/core/mvc/XMLView",
	'sap/ui/core/Control',
	'sap/ui/core/IntervalTrigger',
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
],
function(
	AnimationMode,
	ControlBehavior,
	Element,
	Library,
	nextUIUpdate,
	$,
	DynamicPageUtil,
	DynamicPage,
	DynamicPageTitle,
	DynamicPageHeader,
	Device,
	ManagedObject,
	ComponentContainer,
	UIComponent,
	Input,
	Panel,
	Text,
	Vbox,
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
		PageBackgroundDesign = mLibrary.PageBackgroundDesign,
		ToolbarStyle = mLibrary.ToolbarStyle;

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
		assert.strictEqual(this.oDynamicPage.getHeaderPinned(),  false, "The headerPinned property is 'false' by default.");
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
			oStateChangeListener = this.spy();

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperSolid"), "Should have sapFDynamicPageContentWrapperSolid class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Solid, "Should have backgroundDesign property = 'Solid'");

		// act
		oDynamicPage.setBackgroundDesign("Standard");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperSolid"), "Should not have sapFDynamicPageContentWrapperSolid class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should have sapFDynamicPageContentWrapperStandard class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Standard, "Should have backgroundDesign property = 'Standard'");

		// act
		oDynamicPage.setBackgroundDesign("List");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should not have sapFDynamicPageContentWrapperStandard class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperList"), "Should have sapFDynamicPageContentWrapperList class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.List, "Should have backgroundDesign property = 'List'");

		// act
		oDynamicPage.setBackgroundDesign("Transparent");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperList"), "Should not have sapFDynamicPageContentWrapperList class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperTransparent"), "Should have sapFDynamicPageContentWrapperTransparent class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Transparent, "Should have backgroundDesign property = 'Transparent'");

		// act
		oDynamicPage.setBackgroundDesign(null);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.notOk($oDomRef.hasClass("sapFDynamicPageContentWrapperTransparent"), "Should not have sapFDynamicPageContentWrapperTransparent class");
		assert.ok($oDomRef.hasClass("sapFDynamicPageContentWrapperStandard"), "Should have sapFDynamicPageContentWrapperStandard class");
		assert.strictEqual(oDynamicPage.getBackgroundDesign(), PageBackgroundDesign.Standard, "Should have backgroundDesign property = 'Standard', which is default");
	});

	QUnit.module("DynamicPage - API - headerPinned property", {
		beforeEach: function () {

			// Setup
			this.oDynamicPage = oFactory.getDynamicPageWithHeaderPinned();
			this.oHeader = this.oDynamicPage.getHeader();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {

			// Clean up
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
			this.oHeader = null;
		}
	});

	QUnit.test("Pin button is pinned initially when all the requirements are met and the headerPinned property is true", function (assert) {

		// Assert
		assert.strictEqual(this.oDynamicPage._bPinned, true, "Internal pin flag of the DynamicPage is 'true'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), true, "The pin button of the header is pressed.");
	});

	QUnit.test("Pin button is pinned initially, but becomes unpinned once the headerPinned property of the DynamicPage is set to 'false'", function (assert) {

		// Act - Setting the headerPinned property to 'false' and forcing re-rendering
		this.oDynamicPage.setHeaderPinned(false);
		this.oDynamicPage.onAfterRendering();

		// Assert
		assert.strictEqual(this.oDynamicPage._bPinned, false, "Internal pin flag of the DynamicPage is 'false'");
		assert.strictEqual(this.oHeader._getPinButton().getPressed(), false, "The pin button of the header is not pressed.");
	});

	QUnit.test("The headerPinned property is altered and an event is fired when the pin button is toggled", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		var oDynamicPage = this.oDynamicPage,
			done = assert.async();
		this.oDynamicPage.attachEventOnce("pinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oDynamicPage._bPinned, false, "Internal pin flag of the DynamicPage is 'false'");
			assert.strictEqual(oDynamicPage.getHeaderPinned(), false, "headerPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "pinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating pin button press
		this.oDynamicPage._onPinUnpinButtonPress();
	});

	QUnit.test("The headerPinned property is altered and an event is fired when header is snapped by the user", function (assert) {

		// Assert
		assert.expect(3);

		// Arrange
		var oDynamicPage = this.oDynamicPage,
			done = assert.async();
		this.oDynamicPage.attachEventOnce("pinnedStateChange", function (oEvent) {

			// Assert
			assert.strictEqual(oDynamicPage._bPinned, false, "Internal pin flag of the DynamicPage is 'false'");
			assert.strictEqual(oDynamicPage.getHeaderPinned(), false, "headerPinned property is forced to 'false'");
			assert.strictEqual(oEvent.getParameter("pinned"), false, "pinnedStateChange event is fired with 'false' as parameter'");

			done();
		});

		// Act - Simulating snapping of header by user interaction
		this.oDynamicPage._snapHeader(true, true);
	});


	QUnit.test("The headerPinned property isn't altered and an event isn't fired when header is snapped by dimension change", function (assert) {

		// Assert
		assert.expect(8);

		// Arrange
		var fnPinChangeSpy = this.spy(),
			iDPOriginalHeight = this.oDynamicPage.getDomRef().style.height,
			oDynamicPage = this.oDynamicPage,
			oHeader = this.oHeader,
			done = assert.async();
		oDynamicPage.attachEventOnce("pinnedStateChange", fnPinChangeSpy);

		// Act - Simulating snapping of header by change of dimensions
		oDynamicPage.getDomRef().style.height = '100px';

		setTimeout(function() {
			// Assert
			assert.strictEqual(oDynamicPage._bPinned, false, "Internal pin flag of the DynamicPage is 'false'");
			assert.strictEqual(oHeader._getPinButton().getPressed(), false, "The pin button isn't pressed");
			assert.strictEqual(oDynamicPage.getHeaderPinned(), true, "headerPinned property is still 'true'");
			assert.strictEqual(fnPinChangeSpy.callCount, 0, "pinnedStateChange event isn't fired");

			// Act Simulating expanding of header by change of dimensions
			// It is expected to restore the pin status of the pin button to its previous - pressed state
			oDynamicPage.getDomRef().style.height = iDPOriginalHeight;

			setTimeout(function() {
				// Assert
				assert.strictEqual(oDynamicPage._bPinned, true, "Internal pin flag of the DynamicPage is restored to 'true'");
				assert.strictEqual(oHeader._getPinButton().getPressed(), true, "The pin button pressed status is restored to 'true'");
				assert.strictEqual(oDynamicPage.getHeaderPinned(), true, "headerPinned property is still 'true'");
				assert.strictEqual(fnPinChangeSpy.callCount, 0, "pinnedStateChange event isn't fired");

				// Clean Up
				fnPinChangeSpy.resetHistory();
				done();
			}, 420);
		}, 420);

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oDynamicPage.getHeader().$().addClass("sapFDynamicPageHeaderHidden");
		this.oDynamicPage._titleExpandCollapseWhenAllowed(true);

		// assert
		assert.notOk(this.oDynamicPage.getHeader().$().hasClass("sapFDynamicPageHeaderHidden"), "DynamicPage header is shown correctly");
	});

	QUnit.test("DynamicPage headerExpanded=false and no content renders header correctly snapped", function (assert) {
		// setup
		var oHeaderElement;
		this.oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// assert

		oHeaderElement = this.oDynamicPage.$().find(".sapFDynamicPageContentWrapper .sapFDynamicPageHeader");
		assert.notOk(oHeaderElement.length, "Snapped header is inside title area, not in the content");
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

	QUnit.test("DynamicPageTitle and DynamicPageHeader z-index (RTA)", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oDynamicPageHeader = oDynamicPage.getHeader();

		assert.strictEqual(this.oDynamicPage.$("header").css("z-index"), "3", "z-index of DynamicPageTitleWrapper is bigger than all FCL columns - begin, mid, end");
		assert.strictEqual(oDynamicPageTitle.$().css("z-index"), "4", "z-index of DynamicPageTitle is bigger than all FCL columns - begin, mid, end");
		assert.strictEqual(oDynamicPageHeader.$().css("z-index"), "3", "z-index of DynamicPageHeader is bigger than all FCL columns - begin, mid, end");
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

	QUnit.test("_toggleScrollingStyles is called onAfterRendering", function (assert) {
		var oSpy = this.spy(this.oDynamicPage, "_toggleScrollingStyles"),
			done = assert.async();

		this.stub(Device, "system").value({
			desktop: false,
			phone: false,
			tablet: true
		});

		//Act
		this.oDynamicPage.onAfterRendering();

		//Check
		setTimeout(function() {
			assert.ok(oSpy.called, "_toggleScrollingStyles is called");
			done();
		}, 0);
	});

	QUnit.test("'sapFDynamicPageContentFitContainer' is not added, when scrollbar is needed", function (assert) {
		// Arrange
		var oStub = this.stub(this.oDynamicPage, "_needsVerticalScrollBar").returns(true);

		//Act
		this.oDynamicPage.setFitContent(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.oDynamicPage._toggleScrollingStyles();

		// Assert
		assert.strictEqual(this.oDynamicPage.$contentFitContainer.hasClass("sapFDynamicPageContentFitContainer"), false,
		"'sapFDynamicPageContentFitContainer' class is not added");

		// Clean up
		oStub.restore();
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

	QUnit.test("Snapped header in content has solid background", function (assert) {
		var oDynamicPage = this.oDynamicPage;

		oDynamicPage._snapHeader();
		assert.ok(oDynamicPage.$headerInContentWrapper.hasClass("sapFDynamicPageHeaderSolid"),
			"The snapped header in content has solid background");

		oDynamicPage._expandHeader();
		assert.notOk(oDynamicPage.$headerInContentWrapper.hasClass("sapFDynamicPageHeaderSolid"),
			"The expanded header in content does not have solid background");
	});


	QUnit.test("Visibility of DynamicPageTitle taken in account by parent", function (assert) {

		// Arrange
		var done = assert.async(),
			oDynamicPage = this.oDynamicPage,
			oDynamicPageTitle = oDynamicPage.getTitle(),
			oStub = sinon.spy(this.oDynamicPage, "invalidate");


		//Act

		this.oDynamicPage._snapHeader(true);
		oDynamicPageTitle.setVisible(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		setTimeout(function() {

			// Assert
			assert.equal(this.oDynamicPage.$().find(".sapFDynamicPageContentWrapper").css("paddingTop"), "0px");

			// Clean up
			oStub.restore();
			oDynamicPageTitle.setVisible(true);
			done();
		}.bind(this));
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
		this.stub(Device, "system").value({
				desktop: false,
				phone: true,
				tablet: false
			});
		this.stub(this.oDynamicPageNoTitle, "getHeaderExpanded").returns(false);

		this.oDynamicPageNoTitle.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.ok(true, "No error is thrown");
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

			nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage Invisible Header", function (assert) {
		this.oDynamicPage.getHeader().setVisible(false);
		this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.ok(this.oDynamicPage.getTitle()._getExpandButton().$().hasClass("sapUiHidden"), "Title expand button is hidden");
	});

	QUnit.test("DynamicPage update of Header visibility", function (assert) {
		var oSpy = this.spy(this.oDynamicPage, "_updateTitlePositioning"),
			iAllocatedSpaceForTitleHeight,
			iActualTitleHeight;
		this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oSpy.resetHistory();

		// Act: hide the header
		this.oDynamicPage.getHeader().setVisible(false);
		this.oDynamicPage._onHeaderPropertyChange({current: false, name: "visible"}); // call the listener synchronously to speed up the test

		// Check
		iAllocatedSpaceForTitleHeight = parseInt(this.oDynamicPage.$().find(".sapFDynamicPageContentWrapper").css("paddingTop"));
		iActualTitleHeight = this.oDynamicPage._getTitleAreaHeight();

		assert.strictEqual(oSpy.callCount, 1, "Title positioning is updated");
		assert.strictEqual(iAllocatedSpaceForTitleHeight, iActualTitleHeight, "Title positioning is correct");
	});


	QUnit.module("DynamicPage - Rendering - Expand/collapse buttons", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			this.oDynamicPage.placeAt(TESTS_DOM_CONTAINER);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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

	QUnit.test("_updateTitleVisualState method", function (assert) {
		var oSpy;

		// setup
		this.oDynamicPage.getHeader().setVisible(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oSpy = this.spy(this.oDynamicPage, "_updateTitleVisualState");

		// act
		this.oDynamicPage.getHeader().setVisible(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// asert
		assert.ok(oSpy.callCount, 1, "Method is called when the visilibity of header is changed");
	});

	QUnit.test("no cut-off buttons", function (assert) {
		var iSnapPosition = this.oDynamicPage._getSnappingHeight(),
			oHeader = this.oDynamicPage.getHeader(),
			iScrollTop,
			iButtonOffsetTop;

		// assert initial setup (in the context of which the final check is valid)
		assert.notEqual(getComputedStyle( oHeader.getDomRef()).position, "static", "the header is css-positioned");
		assert.notEqual(getComputedStyle( this.oDynamicPage.$wrapper.get(0)).position, "static", "the scroll-container is css-positioned");

		// Act:
		// scroll just before snap
		// so that only the bottommost area of the headerContent is visible
		this.oDynamicPage._setScrollPosition(iSnapPosition - 5);

		// Check:
		// obtain the amount of top pixels that are in the overflow (i.e. pixels that are scrolled out of view)
		iScrollTop = this.oDynamicPage.$wrapper.scrollTop();
		// obtain the distance of the expand button from the top of the scrollable content
		iButtonOffsetTop = oHeader._getCollapseButton().getDomRef().offsetTop + oHeader.getDomRef().offsetTop;
		assert.ok(iButtonOffsetTop >= iScrollTop, "snap button is not in the overflow");
	});

	QUnit.test("_getSnappingHeight does not return negative values", function (assert) {
		// Аrrange
		var oDynamicPage = oFactory.getDynamicPageHeaderSnappedNoContent();

		// Аssert
		assert.strictEqual(oDynamicPage._canSnapHeaderOnScroll(), false, "Not enough content to snap with scroll");
		assert.ok(oDynamicPage._getSnappingHeight() >= 0, "Snapping height cannot be less than 0");

		// Clean-up
		oDynamicPage.destroy();
	});

	QUnit.test("buttons work when Header is destroyed and new one is set", function (assert) {
		// Arrange
		var oNewHeader = oFactory.getDynamicPageHeader(),
			oSpy = this.spy(oNewHeader, "attachEvent"),
			fnDone = assert.async();

		assert.expect(1);

		// Act
		this.oDynamicPage.destroyHeader();
		this.oDynamicPage.setHeader(oNewHeader);
		this.oDynamicPage.addEventDelegate({
			onAfterRendering: function () {
				// Assert
				assert.ok(oSpy.calledWith(DynamicPage.EVENTS.HEADER_VISUAL_INDICATOR_PRESS),
					"Press handler of expand/collapse buttons is set to the new Header");

				//Clean-up
				this.oDynamicPage.destroy();
				oSpy.reset();
				fnDone();
			}.bind(this)
		});
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
			oSpy = this.spy(this.oDynamicPage, "_onChildControlsHeightChange"),
			iHeightBeforeResize,
			oDummyControl,
			done = assert.async(),
			DummyControl = Control.extend("sap.m.DummyControl", {
				renderer: function(oRm) {
					oRm.openStart("div");
					oRm.openEnd();
					oRm.close("div");
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
				oSpy.resetHistory();
				oDynamicPage.invalidate();
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
		assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should be excluded from the tab chain");
		assert.notOk(this.oDynamicPageNoHeader.$().hasClass("sapFDynamicPageTitleClickEnabled"), "No DynamicPage Header - sapFDynamicPageTitleClickEnabled not added");

		this.oDynamicPageNoHeader.setToggleHeaderOnTitleClick(true);
		assert.equal(oTitle._getFocusSpan().is(":hidden"), true, "Focus span should still be excluded from the tab chain");
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

	QUnit.test("No scroll to snap empty header", function (assert) {
		var oDynamicPage = this.oDynamicPageWithEmptyHeader,
			oScrollSpy = this.spy(oDynamicPage, "_setScrollPosition");

		oDynamicPage.setHeaderExpanded(false);

		assert.ok(oScrollSpy.notCalled || oScrollSpy.alwaysCalledWithMatch(0), "No scroll to snap empty header");
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
			sOriginalMode = ControlBehavior.getAnimationMode();

		//setup
		ControlBehavior.setAnimationMode(AnimationMode.none);

		// Act: toggle to 'true'
		this.oDynamicPage.setShowFooter(true);

		// Check
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "footer is shown when the Animation mode is 'none'");

		// Act: toggle to 'false'
		this.oDynamicPage.setShowFooter(false);

		// Check
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "footer is hidden when the Animation mode is 'none'");

		//setup
		ControlBehavior.setAnimationMode(AnimationMode.minimal);

		// Act: toggle to 'true'
		this.oDynamicPage.setShowFooter(true);

		// Check
		assert.ok(!$footerWrapper.hasClass("sapUiHidden"), "footer is shown when the Animation mode is 'minimal'");

		// Act: toggle to 'false'
		this.oDynamicPage.setShowFooter(false);

		// Check
		assert.ok($footerWrapper.hasClass("sapUiHidden"), "footer is hidden when the Animation mode is 'minimal'");

		// Clean up
		ControlBehavior.setAnimationMode(sOriginalMode);
	});

	QUnit.test("DynamicPage Footer does not overlap content", function (assert) {
		var sOriginalMode = ControlBehavior.getAnimationMode(),
			oFooterBoundingClientRect,
			oContentBoundingClientRect;

		//setup
		ControlBehavior.setAnimationMode(AnimationMode.none);

		// Act: toggle to 'true'
		this.oDynamicPage.setShowFooter(true);
		// scroll to bottom
		this.oDynamicPage.$wrapper.scrollTop(this.oDynamicPage._getMaxScrollPosition());

		// Check
		oFooterBoundingClientRect = this.oDynamicPage.getFooter().getDomRef().getBoundingClientRect();
		oContentBoundingClientRect = this.oDynamicPage.getContent().getDomRef().getBoundingClientRect();
		assert.ok(oFooterBoundingClientRect.y > oContentBoundingClientRect.y + oContentBoundingClientRect.height, "footer does not overlap content");

		// Clean up
		ControlBehavior.setAnimationMode(sOriginalMode);
	});

	QUnit.test("Changing 'showFooter' property does not invalidate control", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oDynamicPage, "invalidate");

		// Act
		this.oDynamicPage.setShowFooter(false);

		// Assert
		assert.notOk(oSpy.called, "DynamicPage is not invalidated when 'showFooter' property is changed");
	});

	QUnit.test("When footer is visible, CSS class is applied to the DynamicPage", function (assert) {
		// Assert - when footer is visible, CSS class is applied
		assert.ok(this.oDynamicPage.$().hasClass("sapFDynamicPageFooterVisible"), "DynamicPage has CSS class");
		assert.strictEqual(this.oDynamicPage.$wrapper.css("scroll-padding-bottom"), "58px", "58px scroll padding bottom on the wrapper");

		// Act - toggle to 'false'
		this.oDynamicPage.setShowFooter(false);

		// Assert - when footer is not visible, CSS class is not applied
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPageFooterVisible"), "DynamicPage does not have CSS class");
		assert.strictEqual(this.oDynamicPage.$wrapper.css("scroll-padding-bottom"), "auto", "No scroll padding bottom on the wrapper");
	});


	/* --------------------------- DynamicPage Mobile Rendering ---------------------------------- */
	QUnit.module("DynamicPage - Rendering - Mobile", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		beforeEach: function () {
			oUtil.toMobileMode();
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		},
		after: function() {
			sinon.config.useFakeTimers = false;
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
		// Setup
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick();

		// Setup header too big to be preserved in the title area
		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;
		// Act
		oDynamicPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, true, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), false, "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		// Setup header ok to be preserved in the title area
		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);

		// Act
		oDynamicPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, false, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), true, "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	QUnit.test("DynamicPage Header snapped with height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oMockHeaderResizeWidthEvent = {size: {height: 300}, oldSize:{height: 0}, target: {id: this.oDynamicPage.getHeader().getId()}};
		// Setup
		oDynamicPage.setHeaderExpanded(false); // header is hidden
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick();

		// Setup header too big to be preserved in the title area
		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		// Act
		oDynamicPage._overridePreserveHeaderStateOnScroll();

		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, true, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), false, "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		// Setup header OK to be preserved in the title area
		oDynamicPage.getHeader().$().height(100);

		// Act
		oDynamicPage._onChildControlsHeightChange(oMockHeaderResizeWidthEvent);

		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, false, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), true, "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");
	});

	/* --------------------------- DynamicPage Tablet Rendering ---------------------------------- */

	QUnit.module("DynamicPage - Rendering - Tablet", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		beforeEach: function () {
			oUtil.toTabletMode();
			this.oDynamicPage = oFactory.getDynamicPage();
		},
		afterEach: function () {
			oUtil.toDesktopMode();
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("DynamicPage Header on tablet with header height bigger than 60% of DP height override 'preserveHeaderStateOnScroll' property", function (assert) {
		var oDynamicPage = this.oDynamicPage;
		// Setup
		oDynamicPage.setPreserveHeaderStateOnScroll(true);

		oUtil.renderObject(this.oDynamicPage);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick();

		// Setup header too big to be preserved in the title area
		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(300);
		oDynamicPage.getHeader().$().height(300);
		oDynamicPage._headerBiggerThanAllowedHeight = false;

		// Act
		oDynamicPage._overridePreserveHeaderStateOnScroll();

		// Check
		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, true, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), false, "preserveHeaderStateOnScroll should be overridden with 60% or bigger height");

		// Setup header ok to be preserved in the title area
		oDynamicPage.$().height(1000);
		oDynamicPage.getTitle().$().height(200);
		oDynamicPage.getHeader().$().height(200);

		// Act
		oDynamicPage._overridePreserveHeaderStateOnScroll();

		// Check
		assert.strictEqual(oDynamicPage._headerBiggerThanAllowedHeight, false, "flag is updated");
		assert.strictEqual(oDynamicPage._preserveHeaderStateOnScroll(), true, "preserveHeaderStateOnScroll should NOT be overridden with less than 60% height");

	});

	/* --------------------------- DynamicPage Events and Handlers ---------------------------------- */
	QUnit.module("DynamicPage Events, Handlers", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithBigContent();
		},
		afterEach: function () {
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
		var oTitlePressListenerSpy = this.spy(),
			oTitle = this.oDynamicPage.getTitle();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle._focus();
		this.oDynamicPage.getTitle().attachEvent("_titlePress", oTitlePressListenerSpy);

		QUnitUtils.triggerKeydown(oTitle.getDomRef(), KeyCodes.ENTER);

		assert.ok(oTitlePressListenerSpy.calledOnce, "Event was fired when ENTER key is pressed");
	});

	QUnit.test("DynamicPage On Title Press: onsapspace event", function (assert) {
		var oTitlePressListenerSpy = this.spy(),
			oTitle = this.oDynamicPage.getTitle();

		// Arrange
		oUtil.renderObject(this.oDynamicPage);
		oTitle._focus();
		this.oDynamicPage.getTitle().attachEvent("_titlePress", oTitlePressListenerSpy);

		QUnitUtils.triggerKeyup(oTitle.getDomRef(), KeyCodes.SPACE);

		assert.ok(oTitlePressListenerSpy.calledOnce, "Event was fired when SPACE key is pressed");
	});

	QUnit.test("DynamicPage On Title Press: onsapspace event with shift", function (assert) {
		var oTitlePressListenerSpy = this.spy(),
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
			oInput = new Input(),
			oEventMock = {
				srcControl: oInput,
				preventDefault: function () {}
			},
			oEventSpy = this.spy(oEventMock, "preventDefault");

		// Act
		oTitle.onsapspace(oEventMock);

		// Assert
		assert.ok(oEventSpy.notCalled, "preventDefault is not called");
	});

	QUnit.test("DynamicPage On Title Press: stateChange event is fired", function (assert) {
		var oStateChangeListenerSpy = this.spy(),
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
		var oStateChangeListenerSpy = this.spy(),
			oCollapseButton = this.oDynamicPage.getHeader()._getCollapseButton();

		this.oDynamicPage.getTitle().attachEvent("stateChange", oStateChangeListenerSpy);

		// Arrange
		oUtil.renderObject(this.oDynamicPage);

		// Act
		oCollapseButton.firePress();

		assert.ok(oStateChangeListenerSpy.calledOnce, "stateChange event was fired once when expand button was pressed");
	});

	QUnit.test("DynamicPage On Snap Header when not enough scrollHeight to snap with scroll and scrollTop > 0", function (assert) {
		var sHeight = "400px";

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
		assert.strictEqual(this.oDynamicPage._getScrollPosition(), 0,
			"Page is scrolled to top"); // because no more scrolled-out content

		// explicitly call the onscroll listener (to save a timeout in the test):
		this.oDynamicPage._toggleHeaderOnScroll({target: {scrollTop: 0}});

		// Assert
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is still snapped");
	});

	QUnit.test("DynamicPage toggles expand state on scroll when header is hidden", function (assert) {
		var iSnapBreakpoint;
		oUtil.renderObject(this.oDynamicPage);

		// Arrange
		iSnapBreakpoint = this.oDynamicPage._getSnappingHeight();
		this.oDynamicPage.getHeader().setVisible(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Arrange: scroll to snap
		this.oDynamicPage._setScrollPosition(iSnapBreakpoint + 10);
		// synchronously call the scroll listener to speed up the test
		this.oDynamicPage._toggleHeaderOnScroll();

		// Assert state arranged as expected:
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), false, "header is snapped");

		// Act: scroll to expand
		this.oDynamicPage._setScrollPosition(0);
		// synchronously call the scroll listener to speed up the test
		this.oDynamicPage._toggleHeaderOnScroll();

		// Assert
		assert.strictEqual(this.oDynamicPage.getHeaderExpanded(), true, "header is expanded");
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
		var oStateChangeListenerSpy = this.spy(),
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

	QUnit.test("DynamicPage is not attached to MouseOut/MouseOver events of title on tablet/phone device", function (assert) {
		oUtil.toMobileMode();
		// Setup
		var oVisualIndicatorMouseoOverSpy = this.spy(this.oDynamicPage, "_attachVisualIndicatorMouseOverHandlers"),
			oTitleMouseOverSpy = this.spy(this.oDynamicPage, "_attachTitleMouseOverHandlers");

		// Act
		oUtil.renderObject(this.oDynamicPage);

		// Assert
		assert.ok(oVisualIndicatorMouseoOverSpy.notCalled, "DynamicPage is not attached to MouseOut/MouseOver events of snap/expand button");
		assert.ok(oTitleMouseOverSpy.notCalled, "DynamicPage is not attached to MouseOut/MouseOver events of title");

		oUtil.toDesktopMode();
	});


	QUnit.test("DynamicPage header resize", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage,
			isHeaderSnappedWithScroll = function () {
				return this.oDynamicPage._getScrollPosition() >= this.oDynamicPage._getSnappingHeight();
			}.bind(this),
			oScrollPositionSpy;

		oHeader.addContent(new Panel({height: "100px"}));

		// setup
		oUtil.renderObject(this.oDynamicPage);
		this.oDynamicPage.setHeaderExpanded(false);

		// assert init state
		assert.ok(isHeaderSnappedWithScroll(), "header is snapped with scroll");

		//Act
		$oDynamicPage = this.oDynamicPage.$();
		$oDynamicPage.find('.sapMPanel').get(0).style.height = "300px";

		oScrollPositionSpy = this.spy(this.oDynamicPage, "_setScrollPosition");
		// explicitly call to avoid waiting for resize handler to detect change
		this.oDynamicPage._onChildControlsHeightChange({target: oHeader.getDomRef(),
			size: { height: 100 }, oldSize: { height: 0 }});

		// Check
		assert.ok(isHeaderSnappedWithScroll(), "header is still snapped with scroll");
		assert.strictEqual(oScrollPositionSpy.callCount, 0, "no adjusting of the scroll position when the modified header content is hidden");
	});

	QUnit.test("DynamicPage header resize with invalidation", function (assert) {
		var oHeader = this.oDynamicPage.getHeader(),
			oDeregisterSpy = this.spy(this.oDynamicPage, "_deRegisterResizeHandler"),
			oAdaptScrollPositionSpy = this.spy(this.oDynamicPage, "_adaptScrollPositionOnHeaderChange");

		oHeader.addContent(new Panel({height: "100px"}));

		// setup
		oUtil.renderObject(this.oDynamicPage);
		this.oDynamicPage.setHeaderExpanded(false);

		//Act
		oDeregisterSpy.resetHistory();
		oHeader.removeAllContent();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Check
		assert.ok(oDeregisterSpy.notCalled, "resize handler is not deregistered");
		// explicitly call to avoid waiting for resize handler to detect change
		this.oDynamicPage._onChildControlsHeightChange({target: oHeader.getDomRef(), size: {}, oldSize: {}});
		assert.ok(oAdaptScrollPositionSpy.called, "scroll position is adaptation is called");
	});

	QUnit.test("DynamicPage header resize after rerendering - pin button visibility is updated", function (assert) {
		// Arrange
		var oHeader = this.oDynamicPage.getHeader(),
			oTogglePinButtonVisibilitySpy;

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oUtil.renderObject(this.oDynamicPage);

		//Act - simulating invalidation of DynamicPage and rerendering
		this.oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oTogglePinButtonVisibilitySpy = this.spy(this.oDynamicPage, "_togglePinButtonVisibility");

		// Simulate resizeHandler call after Header resize (due to FCL columns resize)
		this.oDynamicPage._onChildControlsHeightChange({target: oHeader.getDomRef(),
			size: { height: 100 }, oldSize: { height: 0 }});

		// Assert
		assert.ok(oTogglePinButtonVisibilitySpy.calledOnce,
			"_togglePinButtonVisibility is called after resize (followed by rerendering)");
		assert.ok(oTogglePinButtonVisibilitySpy.calledWith(false),
			"_togglePinButtonVisibility is called with 'false' as preserveHeaderStateOnSroll is 'true'");
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

	QUnit.module("DynamicPage when Header height bigger than page height and fit content is placed inside", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPageWithFitContentWithBigHeader();
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("DynamicPage when Header height bigger than page height and fit content is placed inside", function (assert) {
		// arrange
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			$wrapper,
			$header;

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		$wrapper = oDynamicPage.$wrapper;
		$header = oHeader.$();

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		// assert
		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		// act
		oTitle.fireEvent("_titlePress");

		// assert
		assert.equal($wrapper.find($header).length > 0, true, "Header is in content area after expanding");
	});

	QUnit.test("DynamicPage with preserveHeaderStateOnScroll when Header height bigger than page height and fit content is placed inside", function (assert) {
		// arrange
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oHeader = oDynamicPage.getHeader(),
			$wrapper,
			$header;

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		$wrapper = oDynamicPage.$wrapper;
		$header = oHeader.$();

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		// assert
		assert.equal(oDynamicPage._preserveHeaderStateOnScroll(), true, "header is preserved on scroll");
		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		// act
		oTitle.fireEvent("_titlePress");

		// assert
		assert.equal($wrapper.find($header).length === 0, true, "Header is not moved to the content area");
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

	QUnit.test("Expand header updates title positioning", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oTitle = oDynamicPage.getTitle(),
			oUpdateSpy = this.spy(oDynamicPage, "_updateTitlePositioning");

		oDynamicPage.setHeaderExpanded(false);
		oUtil.renderObject(oDynamicPage);

		oDynamicPage.$().outerHeight("800px"); // set page height smaller than header height

		oDynamicPage._setScrollPosition(100);

		assert.equal(oDynamicPage._headerBiggerThanAllowedToBeExpandedInTitleArea(), true, "header is bigger than allowed to be expanded in title");

		oUpdateSpy.resetHistory();

		//act
		oTitle.fireEvent("_titlePress");
		assert.equal(oUpdateSpy.callCount, 1, "update of title position is called");
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
			oMockResizeWidthEvent = {size:{width: 100, height: 100}, oldSize:{height: 100}};

		this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll").returns(false);
		this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToBeExpandedInTitleArea").returns(true);

		// Final setup step: snap header => the expand button should become visible after rendering
		oDynamicPage.setHeaderExpanded(false);

		oUtil.renderObject(oDynamicPage);

		// Act
		oDynamicPage._onResize(oMockResizeWidthEvent);

		assert.ok(!oDynamicPage.getTitle()._getExpandButton().$().hasClass('sapUiHidden'), "expand button is visible");
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

	QUnit.test("DynamicPage _overridePreserveHeaderStateOnScroll() should be called, when a change of DynamicPage's height occurs and 'preserveHeaderStateOnScroll' is 'true'", function (assert) {
		// Arrange
		var oMockResizeWidthEvent = {size: {height: 500}, oldSize:{height: 100}},
			done = assert.async(),
			oDynamicPage = this.oDynamicPage,
			oSpy = this.spy(oDynamicPage, "_overridePreserveHeaderStateOnScroll");

		// Act
		oDynamicPage.addEventDelegate({
			"onAfterRendering": function() {
				setTimeout(function() {
					// Act
					oSpy.resetHistory();
					oDynamicPage._onResize(oMockResizeWidthEvent);

					// Assert
					assert.ok(oSpy.calledOnce, "_overridePreserveHeaderStateOnScroll called once");

					// Clean Up
					done();
				}, 200);
			}
		});

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedHeight is updated when on resizing, Header is moved and 'preserveHeaderStateOnScroll' is 'true'",
		function (assert) {
		// Arrange
		var oSpy,
			oDynamicPage = this.oDynamicPage,
			oMockResizeWidthEvent = {size: {height: 500}, oldSize:{height: 100}},
			oMockHeaderResizeWidthEvent = {size: {height: 500}, oldSize:{height: 0}, target: {id: this.oDynamicPage.getHeader().getId()}},
			done = assert.async();

		this.stub(oDynamicPage, "_headerBiggerThanAllowedToBeFixed").returns(true);

		// Act
		oDynamicPage.addEventDelegate({
			"onAfterRendering": function() {
				setTimeout(function() {
					// Act
					oSpy = this.spy(oDynamicPage, "_overridePreserveHeaderStateOnScroll");
					oDynamicPage._onResize(oMockResizeWidthEvent);
					oDynamicPage._onChildControlsHeightChange(oMockHeaderResizeWidthEvent);

					// Assert
					assert.ok(oSpy.called, "check for header constraints is made");
					assert.ok(oDynamicPage._headerBiggerThanAllowedHeight, "_headerBiggerThanAllowedHeight flag is correct");

					// Clean Up
					done();
				}.bind(this), 200);
			}.bind(this)
		});

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
	});

	QUnit.test("DynamicPage _overridePreserveHeaderStateOnScroll() shows the header when 'headerExpanded' is 'true'", function (assert) {
		// Arrange
		var oDynamicPage = this.oDynamicPage,
			oSpy = this.spy(oDynamicPage, "_setScrollPosition"),
			done = assert.async();

		// Act
		oDynamicPage.addEventDelegate({
			"onAfterRendering": function() {
					// Act
					oSpy.resetHistory();
					oDynamicPage._overridePreserveHeaderStateOnScroll();

					// Assert
					assert.notOk(oSpy.called, "no scrolling when the header is expanded");

					// Clean Up
					done();
			}
		});

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedHeight should be 'true' for Desktop when needed", function (assert) {
		// Arrange
		this.stub(this.oDynamicPage, "_headerBiggerThanAllowedToBeFixed").returns(true);
		this.stub(Device, "system").value({
				desktop: true,
				tablet: false,
				phone: false
		});

		//Act
		this.oDynamicPage._overridePreserveHeaderStateOnScroll();

		// Assert
		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedHeight, true,
			"Preserving header state on scroll is overriden for desktop too, when it is too big");
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

	QUnit.test("DynamicPage _moveHeaderToContentArea() should fire event", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oMoveHeaderSpy = this.spy(),
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		// Setup
		this.oDynamicPage.attachEvent("_moveHeader", oMoveHeaderSpy);
		oDynamicPage._moveHeaderToTitleArea();
		assert.equal($wrapper.find($header).length === 0, true, "Header is in not in the content area");
		oMoveHeaderSpy.resetHistory();

		// Act
		oDynamicPage._moveHeaderToContentArea();

		// Check
		assert.equal(oMoveHeaderSpy.callCount, 1, "the event is fired");
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

	QUnit.test("DynamicPage _moveHeaderToTitleArea() should fire event", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oMoveHeaderSpy = this.spy(),
			oHeader = oDynamicPage.getHeader(),
			$header = oHeader.$(),
			$wrapper = oDynamicPage.$wrapper;

		// Setup
		oDynamicPage.attachEvent("_moveHeader", oMoveHeaderSpy);
		assert.equal($wrapper.find($header).length > 0, true, "Header is in the content area initially");

		// Act
		oDynamicPage._moveHeaderToTitleArea();

		// Check
		assert.equal(oMoveHeaderSpy.callCount, 1, "the event is fired");
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
			oPinSpy = this.spy(this.oDynamicPage, "_updateTitlePositioning"),
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

	QUnit.test("DynamicPage pin state preserved upon rerendering", function (assert) {
		var $headerWrapper = this.oDynamicPage.$("header"),
			$contentWrapper = this.oDynamicPage.$("contentWrapper"),
			sHeaderId = this.oDynamicPage.getHeader().getId(),
			oPinSpy = this.spy(this.oDynamicPage, "_updateTitlePositioning"),
			oDynamicPageTitle = this.oDynamicPage.getTitle(),
			oDynamicPageHeader = this.oDynamicPage.getHeader(),
			$oDynamicPage =  this.oDynamicPage.$(),
			$oCollapseButton = oDynamicPageHeader.getAggregation("_collapseButton").$(),
			$oExpandButton = oDynamicPageTitle.getAggregation("_expandButton").$();

		assert.equal($contentWrapper.find("#" + sHeaderId).length, 1, "The header is in the Content wrapper initially");

		// Act
		this.oDynamicPage._pin(true); // forcing user interaction in order to change the headerPinned property
		this.oDynamicPage.invalidate(); //rerender while header is pinned
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.equal($headerWrapper.find("#" + sHeaderId).length, 1, "The header is in the Header wrapper when pinned");
		assert.ok(oPinSpy.called, "The ScrollBar is updated");
		assert.equal($oDynamicPage.hasClass("sapFDynamicPageHeaderPinned"), true, "Header is pinned, Pinned class applied to DynamicPage root element");
		assert.equal($oExpandButton.hasClass("sapUiHidden"), true, "Header is pinned, the Expand Button is not visible");
		assert.equal($oCollapseButton.hasClass("sapUiHidden"), false, "Header is pinned, the Collapse Button is visible");

	});

	QUnit.test("DynamicPage _canSnapHeaderOnScroll() should return the correct value", function (assert) {
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), true, "The header can snap");

		this.oDynamicPage.setContent(new Panel({height: "800px"}));
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), false, "The header cannot snap with scroll");

		this.oDynamicPage._moveHeaderToTitleArea();
		assert.equal(this.oDynamicPage._canSnapHeaderOnScroll(), false, "The header still cannot snap with scroll");
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
			iSnappingPosition = (getElementHeight($HeaderDom, true /* ceil */) || getElementHeight($TitleDom, true /* ceil */)) - DynamicPage.HEADER_CONTENT_PADDING_BOTTOM;

		assert.equal(this.oDynamicPage._getSnappingHeight(), iSnappingPosition, "DynamicPage snapping position is correct");
	});

	QUnit.test("DynamicPage _getScrollPosition() returns the correct initial Scroll position", function (assert) {
		assert.equal(this.oDynamicPage._getScrollPosition(), 0,
			"DynamicPage Scroll position is correct");
	});

	QUnit.test("DynamicPage preserves scroll position after rerendering", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage;

		//arrange
		oDynamicPage.setHeaderExpanded(false);
		oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);
		//act
		oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//assert
		assert.ok(oDynamicPage.$wrapper.scrollTop, iExpectedScrollPosition,
			"DynamicPage Scroll position is correct after rerender");
	});

	QUnit.test("DynamicPage preserves scroll position when navigating to another page and then comming back", function (assert) {
		var iExpectedScrollPosition = 500,
			oDynamicPage = this.oDynamicPage; // Scroll position of wrapper is set to 0 when navigating to another page

		//arrange
		oDynamicPage.$wrapper.scrollTop(iExpectedScrollPosition);
		oDynamicPage.addStyleClass("sapMNavItem");

		//act
		oDynamicPage.toggleStyleClass("sapMNavItemHidden", true);
		oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oDynamicPage.toggleStyleClass("sapMNavItemHidden", false);

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.ok(oDynamicPage._headerScrolledOut(), "Header is scrolled out after scrolling to the header`s very bottom");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() returns the correct value", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			fnSpy = this.spy(DynamicPage.prototype, "_togglePinButtonVisibility");

		this.stub(oDynamicPage, "_getEntireHeaderHeight");
		this.stub(oDynamicPage, "_getOwnHeight");

		var fnStubConfig = function (iHeaderHeight, iDynamicPageHeight) {
			oDynamicPage._getEntireHeaderHeight.returns(iHeaderHeight);
			oDynamicPage._getOwnHeight.returns(iDynamicPageHeight);
		};

		fnStubConfig(700, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), true,
			"DynamicPage Header is bigger than allowed");

		oDynamicPage._expandHeader();

		assert.ok(fnSpy.notCalled, "_togglePinButtonVisibility should not be called");

		fnStubConfig(100, 999);

		assert.strictEqual(this.oDynamicPage._headerBiggerThanAllowedToPin(), false,
			"DynamicPage Header is not bigger than allowed");

		oDynamicPage._expandHeader();

		assert.ok(fnSpy.calledOnce, "_togglePinButtonVisibility should be called");
	});

	QUnit.test("DynamicPage _headerBiggerThanAllowedToPin() is called on child resize", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			fnSpy = this.spy(oDynamicPage, "_headerBiggerThanAllowedToPin");

		this.stub(oDynamicPage, "_canSnapHeaderOnScroll").returns(false);

		// Act: resize the header (call the resize listener synchronously to save timeout in the test)
		oDynamicPage._onChildControlsHeightChange({target: oDynamicPage.getHeader().getDomRef(), size: {}, oldSize: {}});

		assert.ok(fnSpy.called, "_headerBiggerThanAllowedToPin is called");
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
		assert.equal(oActionsToolbar.getStyle(), ToolbarStyle.Clear, "actions toolbar has correct style");
	});

	QUnit.test("DynamicPageTitle _getNavigationActionsToolbar returns toolbar with correct style", function (assert) {
		var oNavActionsToolbar = this.oDynamicPage.getTitle()._getNavigationActionsToolbar();
		assert.equal(oNavActionsToolbar.getStyle(), ToolbarStyle.Clear, "nav-actions toolbar has correct style");
	});

	QUnit.test("DynamicPage _applyContextualSettings changes media classes" , function (assert) {
		// Arrange
		var oSpy = this.spy(ManagedObject.prototype, "_applyContextualSettings"),
			oContextualSettings = {contextualWidth: 800};

		// Act
		this.oDynamicPage._applyContextualSettings(oContextualSettings);

		// Assert
		assert.ok(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Tablet"), "Tablet class is applied");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop"), "Desktop class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop-XL"), "Desktop-XL class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Phone"), "Phone class is removed");
		assert.deepEqual(oSpy.getCall(0).args[0], oContextualSettings, "Contextual settings object is passed");

		// Act
		this.oDynamicPage._applyContextualSettings({contextualWidth: 500});

		// Assert
		assert.ok(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Phone"), "Phone class is applied");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Tablet"), "Tablet class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop"), "Desktop class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop-XL"), "Desktop-XL class is removed");

		// Act
		this.oDynamicPage._applyContextualSettings({contextualWidth: 1440});

		// Assert
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Phone"), "Phone class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Tablet"), "Tablet class is removed");
		assert.notOk(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop"), "Desktop class is removed");
		assert.ok(this.oDynamicPage.$().hasClass("sapFDynamicPage-Std-Desktop-XL"), "Desktop-XL class is applied");
	});

	QUnit.test("DynamicPage _needsVerticalScrollBar() floors the current max scrollHeight", function (assert) {
		// Arrange
		var iScrollHeight = this.oDynamicPage.$wrapper[0].scrollHeight;
		// mock the conditions of the tested scenario:
		this.oDynamicPage.$wrapper[0] = {
			scrollHeight: iScrollHeight,
			// the browser returns a ceiled value for <code>clientHeight</code>
			clientHeight: iScrollHeight - 1,
			getBoundingClientRect: function() {
				return {
					// the actual height is only a fraction of a pixel smaller than the scrollHeight
					height: (iScrollHeight - 0.1)
				};
			}
		};

		// Assert
		assert.strictEqual(this.oDynamicPage._needsVerticalScrollBar(), false,
			"no scrollbar needed");

	});

	QUnit.test("DynamicPage _needsVerticalScrollBar() allows 1px content overflow", function (assert) {
		// Arrange
		this.stub(this.oDynamicPage, "_getMaxScrollPosition").returns(1);

		// Assert: the page workarounds a known issue with VizChart that
		// overflows its container with 1px [in the case when it should fit in]
		// because of rounding issues
		assert.strictEqual(this.oDynamicPage._needsVerticalScrollBar(), false,
			"allows 1px content overflow");
	});

	QUnit.test("DynamicPage _getMaxScrollPosition() prevents 1px maxScrollPosition due to rounding", function (assert) {
		// Arrange
		var iScrollHeight = this.oDynamicPage.$wrapper[0].scrollHeight;
		// mock the conditions of the tested scenario:
		this.oDynamicPage.$wrapper[0] = {
			scrollHeight: iScrollHeight,
			// the browser returns a ceiled value for <code>clientHeight</code>
			clientHeight: iScrollHeight,
			getBoundingClientRect: function() {
				return {
					// the actual height is smaller than the scrollHeight
					height: (iScrollHeight - 1.1)
				};
			}
		};

		// Assert
		assert.strictEqual(this.oDynamicPage._getMaxScrollPosition(), 0,
			"no scrollbar needed");

	});

	QUnit.test("DynamicPage _toggleScrollingStyles is called on reredering", function (assert) {
		// Arrange
		var oSpy = this.spy(this.oDynamicPage, "_toggleScrollingStyles"),
			done = assert.async();

		// Act
		this.oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Assert
		setTimeout(function() {
			assert.strictEqual(oSpy.callCount, 1, "update of fitContainer class is called");
			done();
		}, 0);
	});

	QUnit.test("DynamicPage _toggleScrollingStyles is called after resize", function (assert) {
		// Arrange
		var oDynamicPage = this.oDynamicPage,
			oSpy = this.spy(oDynamicPage, "_toggleScrollingStyles"),
			sTitleId = oDynamicPage.getTitle().getId(),
			done = assert.async();

		oDynamicPage.addEventDelegate({
			"onAfterRendering": function() {
					// Act
					oSpy.resetHistory();
					oDynamicPage._onChildControlsHeightChange({target: { id: sTitleId }});

					assert.strictEqual(oSpy.callCount, 1, "update of scrolling styles is called");

					//Assert
					setTimeout(function() {
						assert.strictEqual(oSpy.callCount, 3, "update of scrolling styles is called again");
						done();
					}, 0);
			}
		});
		this.oDynamicPage.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
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
			iSnappingHeight = this.oDynamicPage._getSnappingHeight();

		//setup
		oDynamicPage._moveHeaderToTitleArea();
		$wrapper.scrollTop(iSnappingHeight - 10); // scroll to expand

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

	QUnit.test("Title position is updated after unpin", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			oSpy = this.spy(oDynamicPage, "_updateTitlePositioning");

		//setup
		oDynamicPage._pin();
		oDynamicPage._unPin();
		oSpy.resetHistory();

		//act
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oSpy.callCount, 1, "update is triggered");
	});

	QUnit.test("DynamicPage _toggleHeaderOnScroll when DynamicPage is out of view", function (assert) {
		var oDynamicPage = this.oDynamicPage,
			$domPlace = $("#qunit-fixture"),
			iSnappingHeight = oDynamicPage._getSnappingHeight(),
			oStub = this.stub(oDynamicPage, "_getEntireHeaderHeight").returns(200);

		oDynamicPage.setPreserveHeaderStateOnScroll(true);
		oDynamicPage.setHeaderExpanded(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oDynamicPage.getScrollDelegate().scrollTo(0, iSnappingHeight + 100);

		//act
		$domPlace.hide();
		oDynamicPage._onResize({
			size: {
				height: 0,
				width: 0
			},
			oldSize: {
				height: 900
			}
		});
		oDynamicPage._toggleHeaderOnScroll();

		//check
		assert.equal(oDynamicPage.getHeaderExpanded(), true, "header is still expanded");

		// clean up
		$domPlace.show();
		oStub.restore();
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
					nextUIUpdate.runSync()/*fake timer is used in module*/;
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

	QUnit.test("hidden title", function (assert) {
		//arrange
		this.oDynamicPage.setHeaderExpanded(false);
		this.oDynamicPage.getTitle().setVisible(false);
		this.oDynamicPage.getTitle().addSnappedContent(new Text());

		//act
		try {
			oUtil.renderObject(this.oDynamicPage);
			assert.ok(true, "no error upon rendering");
		} catch (e) {
			assert.notOk(e, "error upon rendering");
		}
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
			$oDynamicPageTitleSpan = oDynamicPage.getTitle()._getFocusSpan();

		assert.equal(oDynamicPage.getToggleHeaderOnTitleClick(), false, "Initially toggleHeaderOnTitleClick = false");
		assert.equal($oDynamicPageTitleSpan.is(":hidden"), true, "Initially the header title is not focusable");
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
			sAriaLabelValue = oFactory.getResourceBundle().getText("EXPANDED_HEADER");
		this.stub(this.oDynamicPage, "_shouldSnapOnScroll").returns(true);
		this.stub(this.oDynamicPage, "_canSnapHeaderOnScroll").returns(true);

		assert.equal($header.attr("role"), sRole,
			"DynamicPage Header role 'region'");
		assert.equal($header.attr("aria-label"), sAriaLabelValue,
			"DynamicPage Header aria-label is 'Header expanded'");

		sAriaLabelValue = oFactory.getResourceBundle().getText("SNAPPED_HEADER");
		this.oDynamicPage._toggleHeaderOnScroll();

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
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip, "The tooltip is correct");

		this.oDynamicPage._unPin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip, "The tooltip is correct");
	});

	QUnit.test("DynamicPage Header Pin button has the correct tooltip when changing preserveHeaderStateOnScroll", function (assert) {
		var oPinButton = this.oDynamicPage.getHeader()._getPinButton(),
			sPinTooltip = oFactory.getResourceBundle().getText("PIN_HEADER");

		this.oDynamicPage._pin();
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct: unchanged when preserveHeaderStateOnScroll is true");

		this.oDynamicPage.setPreserveHeaderStateOnScroll(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		assert.equal(oPinButton.getTooltip(), sPinTooltip,
			"The tooltip is correct: resetted when preserveHeaderStateOnScroll is false");
	});

	QUnit.test('DynamicPage - AriaLabelledBy attribute is set correctly on the footer toolbar', function (assert) {
		// Arrange
		var oFooter = this.oDynamicPage.getFooter(),
			$InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 1, "InvisibleText element exists in the DOM");
		assert.equal(oFooter.$().attr("aria-labelledby"), $InvisibleTextDomRef.attr('id'), "DynamicPage Footer aria-labelledby points to the invisible text control");
	});

	QUnit.test('DynamicPage - Hidden Invisible Text gets removed when footer aggregation is destroyed', function (assert) {
		// Arrange
		var oPage = this.oDynamicPage,
			oFooter = oPage.getFooter();

		// Act
		oPage.destroyFooter();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var $InvisibleTextDomRef = $("#" + oFooter.getId() + "-FooterActions-InvisibleText");

		// Assert
		assert.strictEqual($InvisibleTextDomRef.length, 0, "InvisibleText element is removed from the DOM");
	});

	QUnit.module("Title responsiveness", {
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
									'<m:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
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
				nextUIUpdate.runSync()/*fake timer is used in module*/;
				done();
			}.bind(this));
		},

		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
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
									'<m:Avatar src="../../sap/f/images/Woman_avatar_02.png" displaySize="S" class="sapUiTinyMarginEnd"/>',
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
				nextUIUpdate.runSync()/*fake timer is used in module*/;
				done();
			}.bind(this));
		},
		afterEach: function() {
			this.oUiComponentContainer.destroy();
		}
	});

	QUnit.test("Test flex-basis styles when areaShrinkRatio is set", function(assert) {
		// arrange
		var oTitle = Element.getElementById("comp---view--DynamicPageTitle"),
			oHeading = oTitle.$("left-inner"),
			oContent = oTitle.$("content"),
			oActions = oTitle.$("mainActions");

		// act
		oTitle.setAreaShrinkRatio("1:2:4");

		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
			oDynamicPageDOMElement = this.oDynamicPage.getDomRef(),
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
		var oUpdateMediaStyleSpy = this.spy(this.oDynamicPage, "_updateMediaStyle");

		// act
		this.oDynamicPage._updateMedia(0);

		// assert
		assert.ok(oUpdateMediaStyleSpy.notCalled, "Media styles were not changed");
	});

	QUnit.module("DynamicPage - ScrollToElement", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			// each item spans the entire row
			this.oDynamicPage.getContent().setDefaultSpan("XL12 L12 M12 S12");
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("ScrollToElement adds offset for sticky area", function(assert) {
		var oItemToScrollTo = this.oDynamicPage.getContent().getContent()[20],
			oItemDOMElement = oItemToScrollTo.getDomRef(),
			oScrollContainer = this.oDynamicPage.$("contentWrapper").get(0),
			iStrickyAreaHight,
			iOffsetDiff;

		// ensure the page is scrollable
		this.oDynamicPage.getDomRef().style.height = "500px";

		// Act
		this.oDynamicPage.getScrollDelegate().scrollToElement(oItemDOMElement);

		// Check
		iStrickyAreaHight = parseInt(oScrollContainer.style.paddingTop);
		iOffsetDiff = oItemDOMElement.getBoundingClientRect().top - oScrollContainer.getBoundingClientRect().top;

		assert.ok(iOffsetDiff >= iStrickyAreaHight, "the element is in the visible area");
	});

	QUnit.test("Back tab navigaton triggers Dynamic Page scroll accordingly", function(assert) {
		//Arrange
		var oVbox = new Vbox(),
			oDynamicPage = this.oDynamicPage,
			oContent = oDynamicPage.getContent();

		for (let i = 0; i < 100; i++) {
			oVbox.addItem(new Input({id: "input_" + i}));
		}
		oDynamicPage.removeAggregation("content");
		oDynamicPage.setContent(oVbox);

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		//Act
		assert.equal(oDynamicPage.$wrapper.css("scroll-padding-top"), oDynamicPage.$wrapper.css("padding-top"),
		"Scroll padding is equal to visual padding of scrolling wrapper");
		//Clean up
		oDynamicPage.setContent(oContent);
	});


	/* --------------------------- Accessibility -------------------------------------- */
	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oDynamicPage = oFactory.getDynamicPage();
			oUtil.renderObject(this.oDynamicPage);
		},
		afterEach: function () {
			this.oDynamicPage.destroy();
			this.oDynamicPage = null;
		}
	});

	QUnit.test("ARIA attributes", function(assert) {
		// Arrange
		var $oDynamicPage = this.oDynamicPage.$(),
		    sExpectedRoleDescription = Library.getResourceBundleFor("sap.f")
			    .getText(DynamicPage.ARIA_ROLE_DESCRIPTION);

		// Assert
		assert.strictEqual($oDynamicPage.attr('aria-roledescription'),sExpectedRoleDescription, "aria-roledescription is set");
	});

	QUnit.test("_setAriaRoleDescription/_getAriaRoleDescription", function(assert) {
		// Arrange
		var sRoleDescription = "Some Role Description";

		// Act
		this.oDynamicPage._setAriaRoleDescription(sRoleDescription);

		// Assert
		assert.strictEqual(this.oDynamicPage._getAriaRoleDescription(), sRoleDescription);
	});
});
