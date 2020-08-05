/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery",
	"qunit/DynamicPageUtil",
	"sap/f/DynamicPage"
],
	function (
		Core,
		$,
		DynamicPageUtil,
		DynamicPage
	) {
		"use strict";

		var INITIAL_SCROLL_POSITION = 0,
			BIG_SCROLL_POSITION = 1000,
			oLibraryFactory = DynamicPageUtil.oFactory,
			oUtil = DynamicPageUtil.oUtil;

		function scrollingStatesOfStickyContent(assert, oDynamicPage) {
			var oDynamicPageContent = oDynamicPage.getContent(),
				iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.destroy();

		}

		function statesOfStickyContentWhileScrollingWhenPinUnpin(assert, oDynamicPage) {
			var oDynamicPageContent = oDynamicPage.getContent(),
				iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._pin();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._unPin();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			oDynamicPage._pin();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._unPin();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);

			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage.destroy();
		}

		function headerSnapExpandStateWhileScrolling(assert, oDynamicPage) {
			var oDynamicPageContent = oDynamicPage.getContent();

			oDynamicPage.setHeaderExpanded(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		}

		function headerDynamicVisibilityChange(assert, oDynamicPage) {
			var oDynamicPageContent = oDynamicPage.getContent();

			oDynamicPage.getHeader().setVisible(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);

			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(false);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");
			oDynamicPage.getHeader().setVisible(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage.destroy();
		}

		QUnit.module("Association value");

		QUnit.test("change the value", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/),
				sWrongStickySubheaderSource = "sWrongStickySubheaderSource",
				sStickyContentProviderId;

			oUtil.renderObject(oDynamicPage);

			sStickyContentProviderId = oDynamicPage.getContent().getId();

			assert.notEqual(oDynamicPage._oStickySubheader, null,  "There was setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sStickyContentProviderId,  "Sticky subheader provider is the control in content aggregation");

			oDynamicPage.setStickySubheaderProvider(null);
			Core.applyChanges();
			assert.equal(oDynamicPage._oStickySubheader, null,  "There was not setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), null,  "Sticky content is in sticky area");

			oDynamicPage.setStickySubheaderProvider(sWrongStickySubheaderSource);
			Core.applyChanges();
			assert.equal(oDynamicPage._oStickySubheader, null,  "There was not setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sWrongStickySubheaderSource,  "Sticky content is in sticky area");

			oDynamicPage.setStickySubheaderProvider(sStickyContentProviderId);
			Core.applyChanges();
			assert.notEqual(oDynamicPage._oStickySubheader, null,  "There was setted sticky subheader");
			assert.equal(oDynamicPage.getStickySubheaderProvider(), sStickyContentProviderId,  "Sticky content is in sticky area");

			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage sticky content position while scrolling");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has title and is without header", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, false  /*has header*/, false /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has title and is without header", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, false  /*has header*/, false /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and is without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			scrollingStatesOfStickyContent(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and pin/unpin");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			statesOfStickyContentWhileScrollingWhenPinUnpin(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while snap/expand header");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerSnapExpandStateWhileScrolling(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and changing the visibility of header");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and changing the visibility of header without content");

		QUnit.test("DynamicPage which has header without content and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();
			oUtil.renderObject(oDynamicPage);

			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oDynamicPage.getHeader().destroyContent();
			oUtil.renderObject(oDynamicPage);

			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage sticky content position while scrolling and rerendering iconTabBar");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/),
				oIconTabBar = oDynamicPage.getContent();

			assert.expect(2);

			oUtil.renderObject(oDynamicPage);

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();

			// Verify init state
			assert.ok(oIconTabBar._getStickySubheaderSticked(), "Sticky content is in sticky area");

			//Act: rerender
			oIconTabBar.rerender();

			// Check
			assert.ok(oIconTabBar._getStickySubheaderSticked(), "Sticky content is still in sticky area");

			// Cleanup
			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/),
				oDynamicPageContent = oDynamicPage.getContent(),
				iIntermediateHeightInHeader;

			oUtil.renderObject(oDynamicPage);

			iIntermediateHeightInHeader = oDynamicPage._getHeaderHeight() / 2;

			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage._setScrollPosition(BIG_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(iIntermediateHeightInHeader);
			oDynamicPage._adjustStickyContent();
			assert.ok(oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in sticky area");

			oDynamicPage._setScrollPosition(INITIAL_SCROLL_POSITION);
			oDynamicPage._adjustStickyContent();
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content while snap/expand");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/),
				oDynamicPageContent = oDynamicPage.getContent();

			oUtil.renderObject(oDynamicPage);

			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.setHeaderExpanded(false);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");
			oDynamicPage.setHeaderExpanded(true);
			assert.ok(!oDynamicPageContent._getStickySubheaderSticked(), "Sticky content is in the DOM of his provider");

			oDynamicPage.destroy();
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and snap/expand header");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerSnapExpandStateWhileScrolling(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and changing the visibility of header");

		QUnit.test("DynamicPage which has header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, true /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has not visible header and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, false /*header visible*/, false /*has title*/);

			oUtil.renderObject(oDynamicPage);
			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage with preservedHeaderStateOnScroll sticky content position while scrolling and changing the visibility of header without content");

		QUnit.test("DynamicPage which has header witout content and title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true /*has header*/, true /*header visible*/, true /*has title*/);

			oDynamicPage.getHeader().destroyContent();
			oUtil.renderObject(oDynamicPage);

			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.test("DynamicPage which has header without content and without title", function (assert) {
			var oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(true /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, false /*has title*/);

			oDynamicPage.getHeader().destroyContent();
			oUtil.renderObject(oDynamicPage);

			headerDynamicVisibilityChange(assert, oDynamicPage);
		});

		QUnit.module("DynamicPage - Conditional CSS applied when StickySubheaderProvider is present", {
			beforeEach: function () {
				// Arrange
				this.oDynamicPage = oLibraryFactory.getDynamicPageWithStickySubheader(false /*preserveHeaderStateOnScroll*/, true  /*has header*/, true /*header visible*/, true /*has title*/);
				oUtil.renderObject(this.oDynamicPage);
			},
			afterEach: function () {
				// Clean up
				this.oDynamicPage.destroy();
				this.oDynamicPage = null;
			}
		});

		QUnit.test("DynamicPage - " + DynamicPage.NAVIGATION_CLASS_NAME + " CSS class", function(assert) {
			// Assert
			assert.ok(this.oDynamicPage.hasStyleClass(DynamicPage.NAVIGATION_CLASS_NAME),
					"Dynamic Page has the " + DynamicPage.NAVIGATION_CLASS_NAME + ", " +
					"when we have StickySubheaderProvider.");

			// Act - Destroy the StickySubheaderProvider
			Core.byId(this.oDynamicPage.getStickySubheaderProvider()).destroy();
			oUtil.renderObject(this.oDynamicPage);

			// Assert
			assert.notOk(this.oDynamicPage.hasStyleClass(DynamicPage.NAVIGATION_CLASS_NAME),
					"Dynamic Page doesn't have the " + DynamicPage.NAVIGATION_CLASS_NAME + ", " +
					"when we don't have StickySubheaderProvider.");
		});
	});