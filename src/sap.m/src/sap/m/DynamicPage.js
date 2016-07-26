/*!
 * ${copyright}
 */

// Provides control sap.m.DynamicPage.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ScrollBar",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device"
], function (jQuery, library, Control, ScrollBar, ResizeHandler, Device) {
	"use strict";

	/**
	 * Constructor for a new Dynamic Page.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A DynamicPage is a control that is used as a layout for an application. It consists of a title, a header,
	 * content and a footer. Additionally it offers dynamic behavior when scrolling,
	 * where part of the header snaps to the title.
	 * Disclaimer: this control is in beta state - incompatible API changes may be done before its official public release. Use at your own discretion.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.m.DynamicPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicPage = Control.extend("sap.m.DynamicPage", /** @lends sap.m.DynamicPage.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Determines whether the header is scrollable.
				 * <b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example
				 * when the control is rendered with a screen size of tablet or mobile and dynamic page title and header
				 * are with height bigger than given threshold.
				 */
				headerScrollable: {type: "boolean", group: "Behaviour", defaultValue: true},

				/**
				 * Determines whether the header is expanded.
				 * <b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example
				 * when the expanded header is larger than the available screen area. For those cases a warning is logged.
				 * The header can be also expanded/collapsed by user interaction, which requires the property to be
				 * internally mutated by the control to reflect the changed state.
				 */
				headerExpanded: {type: "boolean", group: "Behaviour", defaultValue: true},

				/**
				 * Determines whether the footer will be visible.
				 */
				showFooter: {type: "boolean", group: "Behaviour", defaultValue: false}
			},
			aggregations: {
				/**
				 * Dynamic Page Layout Title managed internally by the DynamicPage control.
				 */
				title: {type: "sap.m.DynamicPageTitle", multiple: false},

				/**
				 * Dynamic Page Layout Header.
				 */
				header: {type: "sap.m.ISnappable", multiple: false},

				/**
				 * Dynamic Page Layout Content.
				 */
				content: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * Dynamic Page Layout Floating Footer.
				 */
				footer: {type: "sap.m.IBar", multiple: false},

				/**
				 * Dynamic Page Layout Custom ScrollBar.
				 */
				_scrollBar: {type: "sap.ui.core.ScrollBar", multiple: false, visibility: "hidden"}
			}
		}
	});

	function exists(vObject) {
		if (arguments.length === 1) {
			return Array.isArray(vObject) ? vObject.length > 0 : !!vObject;
		}

		return Array.prototype.slice.call(arguments).every(function (oObject) {
			return exists(oObject);
		});
	}

	var bUseAnimations = sap.ui.getCore().getConfiguration().getAnimation();

	/**
	 * STATIC MEMBERS
	 */
	DynamicPage.HEADER_MAX_ALLOWED_PINNED_PERCENTAGE = 0.6;

	DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE = 0.6;

	DynamicPage.FOOTER_ANIMATION_DURATION = 350;

	DynamicPage.BREAK_POINTS = {
		TABLET: 1024,
		PHONE: 600
	};

	DynamicPage.EVENTS = {
		TITLE_PRESS: "_titlePress",
		PIN_UNPIN_PRESS: "_pinUnpinPress"
	};

	DynamicPage.MEDIA = {
		INVISIBLE: "sapUiHidden",
		PHONE: "sapMDynamicPage-Std-Phone",
		TABLET: "sapMDynamicPage-Std-Tablet",
		DESKTOP: "sapMDynamicPage-Std-Desktop"
	};

	/**
	 * LIFECYCLE METHODS
	 */
	DynamicPage.prototype.init = function () {
		this._bPinned = false;
		this._bHeaderInTitleArea = false;
		this._bExpandingWithAClick = false;
		this._headerBiggerThanAllowedHeight = false;
	};

	DynamicPage.prototype.onBeforeRendering = function () {
		if (this._allowScroll()) {
			this._attachPinPressHandler();
		}

		this._attachTitlePressHandler();
		this._detachScrollHandler();
	};

	DynamicPage.prototype.onAfterRendering = function () {
		var bHeaderScrollable = this._allowScroll();

		if (!bHeaderScrollable && exists(this.getHeader())) {
			this.getHeader()._setShowPinBtn(false);
		}

		this._cacheDomElements();
		this._detachResizeHandlers();
		this._attachResizeHandlers();
		this._updateMedia(this._getWidth(this));

		if (bHeaderScrollable) {
			this._attachScrollHandler();
			this._updateScrollBar();
			this._attachPageChildrenAfterRenderingDelegates();
		} else {
			// Ensure that in this tick DP and it's aggregations are rendered
			jQuery.sap.delayedCall(0, this, this._overrideHeaderNotScrollableRule);
		}
	};

	DynamicPage.prototype.exit = function () {
		this._detachResizeHandlers();
	};

	DynamicPage.prototype.setShowFooter = function (bShowFooter) {
		var vResult = this.setProperty("showFooter", bShowFooter, true);
		this._toggleFooter(bShowFooter);
		return vResult;
	};

	DynamicPage.prototype.setHeaderExpanded = function (bHeaderExpanded) {
		if (this.getHeaderExpanded() === bHeaderExpanded) {
			return this;
		}

		this._titleExpandCollapseWhenAllowed();
		return this;
	};

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * If the header is bigger than the allowed height the control will be invalidated and rendered with scrollable header
	 * @private
	 * @returns {boolean} is rule overridden
	 */
	DynamicPage.prototype._overrideHeaderNotScrollableRule = function () {
		var bHeaderScrollable = this._allowScroll();

		if (!Device.system.desktop && this._headerBiggerThanAllowedToBeFixed() && !bHeaderScrollable) {
			this._headerBiggerThanAllowedHeight = true;
			this.invalidate();
			return true;
		} else {
			this._headerBiggerThanAllowedHeight = false;
			return false;
		}
	};

	/**
	 * Hide/show the footer container
	 * @param bShow
	 * @private
	 */
	DynamicPage.prototype._toggleFooter = function (bShow) {
		var oFooter = this.getFooter();

		if (!exists(oFooter)) {
			return;
		}

		oFooter.toggleStyleClass("sapMDynamicPageActualFooterControlShow", bShow);
		oFooter.toggleStyleClass("sapMDynamicPageActualFooterControlHide", !bShow);
		this.toggleStyleClass("sapMDynamicPageFooterSpacer", bShow);

		if (bUseAnimations){
			if (!bShow) {
				jQuery.sap.delayedCall(DynamicPage.FOOTER_ANIMATION_DURATION, this, function () {
					this.$footerWrapper.toggleClass("sapUiHidden", !this.getShowFooter());
				});
			} else {
				this.$footerWrapper.toggleClass("sapUiHidden", !this.getShowFooter());
			}

			jQuery.sap.delayedCall(DynamicPage.FOOTER_ANIMATION_DURATION, this, function () {
				oFooter.removeStyleClass("sapMDynamicPageActualFooterControlShow");
			});
		}
	};

	/**
	 * Switches between snapped/expanded modes
	 * @private
	 */
	DynamicPage.prototype._toggleHeader = function () {
		if (this._shouldSnap()) {
			this._snapHeader(true);
			this._updateHeaderARIAState(false);

		} else if (this._shouldExpand()) {

			this._expandHeader();
			this._updateHeaderARIAState(true);

		} else if (!this._bPinned && this._bHeaderInTitleArea) {
			this._moveHeaderToContentArea();
		}
	};

	/**
	 * Converts the header to snapped mode
	 * @param {boolean} bAppendHeaderToContent
	 * @private
	 */

	DynamicPage.prototype._snapHeader = function (bAppendHeaderToContent) {
		var oDynamicPageTitle = this.getTitle();

		if (this._bPinned) {
			jQuery.sap.log.debug("DynamicPage :: aborted snapping, header is pinned", this);
			return;
		}

		jQuery.sap.log.debug("DynamicPage :: snapped header", this);

		if (exists(oDynamicPageTitle)) {
			if (exists(oDynamicPageTitle.getExpandedContent())) {
				oDynamicPageTitle._setShowExpandContent(false);
			}

			if (exists(oDynamicPageTitle.getSnappedContent())) {
				oDynamicPageTitle._setShowSnapContent(true);
			}

			if (bAppendHeaderToContent) {
				this._moveHeaderToContentArea();
			}
		}

		if (!exists(this.$titleArea)) {
			jQuery.sap.log.warning("DynamicPage :: couldn't snap header. There's no title.", this);
			return;
		}

		this.setProperty("headerExpanded", false, true);
		this.$titleArea.addClass("sapMDynamicPageTitleSnapped");
	};

	/**
	 * Converts the header to expanded mode
	 * @param {boolean} bAppendHeaderToTitle
	 * @private
	 */
	DynamicPage.prototype._expandHeader = function (bAppendHeaderToTitle) {
		var oDynamicPageTitle = this.getTitle();
		jQuery.sap.log.debug("DynamicPage :: expand header", this);

		if (exists(oDynamicPageTitle)) {
			if (exists(oDynamicPageTitle.getExpandedContent())) {
				oDynamicPageTitle._setShowExpandContent(true);
			}
			if (exists(oDynamicPageTitle.getSnappedContent())) {
				oDynamicPageTitle._setShowSnapContent(false);
			}

			if (bAppendHeaderToTitle) {
				this._moveHeaderToTitleArea();
			}
		}

		if (!exists(this.$titleArea)) {
			jQuery.sap.log.warning("DynamicPage :: couldn't expand header. There's no title.", this);
			return;
		}

		this.setProperty("headerExpanded", true, true);
		this.$titleArea.removeClass("sapMDynamicPageTitleSnapped");
	};

	/**
	 * Toggles the header visibility
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderVisibility = function (bShow) {
		var oDynamicPageHeader = this.getHeader();
		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().toggleClass("sapMDynamicPageHeaderHidden", !bShow);
		}
	};

	/**
	 * Appends header to content area
	 * @private
	 */
	DynamicPage.prototype._moveHeaderToContentArea = function () {
		var oDynamicPageHeader = this.getHeader();
		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().prependTo(this.$wrapper);
			this._bHeaderInTitleArea = false;
		}
	};

	/**
	 * Appends header to title area
	 * @private
	 */
	DynamicPage.prototype._moveHeaderToTitleArea = function () {
		var oDynamicPageHeader = this.getHeader();
		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().appendTo(this.$titleArea);
			this._bHeaderInTitleArea = true;
		}
	};

	/**
	 * Scrolls the content to the snap point(header`s height + 1)
	 * @private
	 */
	DynamicPage.prototype._scrollToSnapHeader = function () {
		var iNewScrollPos = this._getSnappingHeight() + 1;
		this.$wrapper && this.$wrapper.scrollTop(iNewScrollPos);
		Device.system.desktop && this._getScrollBar().setScrollPosition(iNewScrollPos);
	};

	/**
	 * Pins the header
	 * @private
	 */
	DynamicPage.prototype._pin = function () {
		if (!this._bPinned) {
			this._bPinned = true;
			this._moveHeaderToTitleArea();
			this.getHeader()._updateARIAPinButtonState(this._bPinned);
		}
	};

	/**
	 * Unpins the header
	 * @private
	 */
	DynamicPage.prototype._unPin = function () {
		if (this._bPinned) {
			this._bPinned = false;
			this.getHeader()._updateARIAPinButtonState(this._bPinned);
		}
	};

	/**
	 * Restores the Header Pin Button`s focus.
	 * @private
	 */
	DynamicPage.prototype._restorePinButtonFocus = function () {
		this.getHeader()._focusPinButton();
	};

	/**
	 * Determines the appropriate position of the scrollbar based on what the device is.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getScrollPosition = function () {
		if (Device.system.desktop) {
			return this._getScrollBar().getScrollPosition();
		} else {
			return this.$wrapper.scrollTop();
		}
	};

	/**
	 * Determines the if the header should snap
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldSnap = function () {
		return this._allowScroll() && this._getScrollPosition() > this._getSnappingHeight()
			&& this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines the if the header should expand
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldExpand = function () {
		return this._allowScroll() && this._getScrollPosition() < this._getSnappingHeight()
			&& !this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines if the header is scrolled out completely
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerScrolledOut = function () {
		return this._getScrollPosition() > this._getSnappingHeight();
	};

	/**
	 * Determines if the header is allowed to snap,
	 * it`s not pinned, not already snapped and snap on scroll is allowed
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerSnapAllowed = function () {
		return this._allowScroll() && this.getHeaderExpanded() && !this._bPinned;
	};
	/**
	 * Determines if it's possible for the header to snap
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._canSnap = function () {
		return this._getSnappingHeight() ? this.$wrapper[0].scrollHeight > this._getSnappingHeight() && this._allowScroll() : false;
	};

	/**
	 * Determines the appropriate height at which the header can snap
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getSnappingHeight = function () {
		return this._getHeaderHeight() || this._getTitleHeight();
	};

	/**
	 * Determines if the control would need a scrollbar.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._needsVerticalScrollBar = function () {
		if (exists(this.$wrapper) && this._allowScroll()) {
			return this.$wrapper[0].scrollHeight > this.$wrapper.innerHeight();
		} else {
			return false;
		}
	};

	/**
	 * Retrieves the height of the Dynamic Page control
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getOwnHeight = function () {
		return this._getHeight(this);
	};

	/**
	 * Determines the combined height of the title and the header
	 * @returns {Number} the combined height of the title and the header
	 * @private
	 */
	DynamicPage.prototype._getEntireHeaderHeight = function () {
		var iTitleHeight = 0,
			iHeaderHeight = 0,
			oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageTitle)) {
			iTitleHeight = oDynamicPageTitle.$().outerHeight();
		}

		if (exists(oDynamicPageHeader)) {
			iHeaderHeight = oDynamicPageHeader.$().outerHeight();
		}

		return iTitleHeight + iHeaderHeight;
	};

	/**
	 * Determines if the header is bigger than what's allowed for it to snap.
	 * If the header becomes more than the screen height, it shouldn't be snapped while scrolling.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowedToExpandWithACommand = function () {
		return this._getEntireHeaderHeight() > this._getOwnHeight();
	};

	/**
	 * Determines if the header is bigger than what's allowed for it to be pinned.
	 * If the header becomes more than 60% of the screen height it cannot be pinned.
	 * @param {Number} iControlHeight
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowedToPin = function (iControlHeight) {
		if (!(typeof iControlHeight === "number" && !isNaN(parseInt(iControlHeight, 10)))) {
			iControlHeight = this._getOwnHeight();
		}

		return this._getEntireHeaderHeight() > DynamicPage.HEADER_MAX_ALLOWED_PINNED_PERCENTAGE * iControlHeight;
	};

	/*
	 * Determines if the header is bigger than the allowed height
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowedToBeFixed = function () {
		var iControlHeight = this._getOwnHeight();

		return this._getEntireHeaderHeight() > DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE * iControlHeight;
	};

	/**
	 * Determines the height that is needed to correctly offset the "fake" scrollbar
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._measureOffsetHeight = function () {
		var iHeight = 0,
			bSnapped = !this.getHeaderExpanded();

		if (!this._allowScroll() || this._bPinned) {
			iHeight = this._getTitleHeight() + this._getHeaderHeight();
			jQuery.sap.log.debug("DynamicPage :: always show header :: title height + header height" + iHeight, this);
			return iHeight;
		}

		if (bSnapped || !exists(this.getTitle()) || !this._canSnap()) {
			iHeight = this._getTitleHeight();
			jQuery.sap.log.debug("DynamicPage :: snapped mode :: title height " + iHeight, this);
			return iHeight;
		}

		this._snapHeader(true);

		iHeight = this._getTitleHeight();

		if (this._shouldExpand() && !bSnapped) {
			this._expandHeader();
		}

		jQuery.sap.log.debug("DynamicPage :: snapped mode :: title height " + iHeight, this);
		return iHeight;
	};

	/**
	 * Updates the position/height of the "fake" scrollbar
	 * @private
	 */
	DynamicPage.prototype._updateScrollBar = function () {
		var oScrollBar;

		if (Device.system.desktop && this._allowScroll()) {
			oScrollBar = this._getScrollBar();
			oScrollBar.setContentSize(this._measureOffsetHeight() + this.$wrapper[0].scrollHeight + "px");
			oScrollBar.toggleStyleClass("sapUiHidden", !this._needsVerticalScrollBar());
			this.toggleStyleClass("sapMDynamicPageWithScroll", this._needsVerticalScrollBar());
		}

		jQuery.sap.delayedCall(0, this, this._updateScrollBarOffset);
	};

	/**
	 * Updates the title area/footer offset. Since the "real" scroll bar starts at just below the title and since the "fake"
	 * scrollbar doesn't shift the content of the title/footer, it is necessary to offset this ourselves, so it looks natural.
	 * @private
	 */
	DynamicPage.prototype._updateScrollBarOffset = function () {
		var sStyleAttribute = sap.ui.getCore().getConfiguration().getRTL() ? "left" : "right",
			iOffsetWidth = this._needsVerticalScrollBar() ? jQuery.position.scrollbarWidth() + "px" : 0,
			oFooter = this.getFooter();

		this.$titleArea.css("padding-" + sStyleAttribute, iOffsetWidth);
		if (exists(oFooter)) {
			oFooter.$().css(sStyleAttribute, iOffsetWidth);
		}
	};

	/**
	 * Updates the Header ARIA ARIA state according to Header Expanded / Snapped state.
	 * @param {Boolean} bExpanded determines if the header is expanded or snapped.
	 * @private
	 */
	DynamicPage.prototype._updateHeaderARIAState = function (bExpanded) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._updateARIAState(bExpanded);
		}
	};

	/**
	 * Updates the media size of the control based on its own width, not on the entire screen size (which media query does).
	 * This is necessary, because the control will be embedded in other controls (like the sap.m.FlexibleColumnLayout),
	 * thus it will not be using all of the screens width, but despite that the paddings need to be appropriate.
	 * @param {Number} iWidth - the actual width of the control
	 * @private
	 */
	DynamicPage.prototype._updateMedia = function (iWidth) {
		if (iWidth === 0) {
			this._updateMediaStyle(DynamicPage.MEDIA.INVISIBLE);
		} else if (iWidth <= DynamicPage.BREAK_POINTS.PHONE) {
			this._updateMediaStyle(DynamicPage.MEDIA.PHONE);
		} else if (iWidth <= DynamicPage.BREAK_POINTS.TABLET) {
			this._updateMediaStyle(DynamicPage.MEDIA.TABLET);
		} else {
			this._updateMediaStyle(DynamicPage.MEDIA.DESKTOP);
		}
	};

	/**
	 * It puts the appropriate classes on the control based on the current media size.
	 * @param {string} sCurrentMedia
	 * @private
	 */
	DynamicPage.prototype._updateMediaStyle = function (sCurrentMedia) {
		Object.keys(DynamicPage.MEDIA).forEach(function (sMedia) {
			var bEnable = sCurrentMedia === DynamicPage.MEDIA[sMedia];
			this.toggleStyleClass(DynamicPage.MEDIA[sMedia], bEnable);
		}, this);
	};

	/**
	 * Determines the visibility of the snapped/expanded content.
	 * @private
	 */
	DynamicPage.prototype._updateSnappedExpandedContent = function () {
		var oDynamicPageTitle = this.getTitle();
		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._setShowSnapContent(oDynamicPageTitle._getShowSnapContent());
			oDynamicPageTitle._setShowExpandContent(oDynamicPageTitle._getShowExpandContent());
		}
	};

	/**
	 * Determines the height of a control safely. If the control doesn't exist it returns 0,
	 * so it doesn't confuse any calculations based on it. If it exists it just returns its dom element height.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the height of the control
	 */
	DynamicPage.prototype._getHeight = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerHeight() || 0;
	};

	/**
	 * Determines the width of a control safely. If the control doesn't exist it returns 0,
	 * so it doesn't confuse any calculations based on it. If it exists it just returns its dom element width.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the width of the control
	 */
	DynamicPage.prototype._getWidth = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerWidth() || 0;
	};

	/**
	 * Determines the height of the Title, if it's not present it returns 0
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getTitleHeight = function () {
		return this._getHeight(this.getTitle());
	};

	/**
	 * Determines the height of the Header, if it's not present it returns 0
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getHeaderHeight = function () {
		return this._getHeight(this.getHeader());
	};

	/**
	 * Determines if the presence of scroll (on the control itself) is allowed.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._allowScroll = function () {
		return this._headerBiggerThanAllowedHeight || this.getHeaderScrollable();
	};

	/**
	 * Lazily retrieves the "fake" scrollbar
	 * @returns {sap.ui.core.ScrollBar} - the "fake" scrollbar
	 * @private
	 */
	DynamicPage.prototype._getScrollBar = function () {
		if (!exists(this.getAggregation("_scrollBar"))) {
			var oVerticalScrollBar = new ScrollBar(this.getId() + "-vertSB", {
				vertical: true,
				size: "100%",
				scrollPosition: 0,
				scroll: this._onScrollBarScroll.bind(this)
			});
			this.setAggregation("_scrollBar", oVerticalScrollBar, true);
		}

		return this.getAggregation("_scrollBar");
	};

	/**
	 * Caches the dom elements in a jQuery wrapper for later reuse
	 * @private
	 */
	DynamicPage.prototype._cacheDomElements = function () {
		var oTitle = this.getTitle(),
			oFooter = this.getFooter();

		if (exists(oTitle)) {
			this.$title = oTitle.$();
		}

		if (exists(oFooter)) {
			this.$footer = oFooter.$();
			this.$footerWrapper = this.$("footerWrapper");
		}

		this.$titleArea = this.$("header");
		this.$wrapper = this.$("contentWrapper");
		this.$content = this.$("content");
	};

	/**
	 * EVENT HANDLERS
	 */

	/**
	 * Mark the event for components that need to know if the event was handled.
	 * This allows drag scrolling of the control
	 * @param {jQuery.Event} oEvent
	 */
	DynamicPage.prototype.ontouchmove = function (oEvent) {
		oEvent.setMarked();
	};

	/**
	 * React when the aggregated child controls are re-rendered in order to adjust the update
	 * the scrollbar and content height properly.
	 * @private
	 */
	DynamicPage.prototype._onChildControlsAfterRendering = function () {
		this._updateSnappedExpandedContent();
		jQuery.sap.delayedCall(0, this, this._updateScrollBar);
	};

	/**
	 * React when the aggregated child controls are changes its height in order to adjust the update the scrollbar.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onChildControlsHeightChange = function (oEvent) {
		if (oEvent.size.height !== oEvent.oldSize.height && !this._bExpandingWithAClick) {
			this._updateScrollBar();
		}

		this._bExpandingWithAClick = false;
	};

	/**
	 * Handles the resize event of the DynamicPage.
	 * It unpins the header if it has reached it's threshold, it updates the "fake" scroll height.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onResize = function (oEvent) {
		var oDynamicPageHeader = this.getHeader();

		if (this._allowScroll() && oDynamicPageHeader) {
			if (this._headerBiggerThanAllowedToPin(oEvent.size.height) || Device.system.phone) {
				this._unPin();
				oDynamicPageHeader._setShowPinBtn(false);
				oDynamicPageHeader._togglePinButton(false);
			} else {
				oDynamicPageHeader._setShowPinBtn(true);
			}
		}

		this._updateScrollBar();
		this._updateMedia(oEvent.size.width);
	};

	/**
	 * Handles the scrolling on the content.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onWrapperScroll = function (oEvent) {
		if (!Device.system.desktop || !this._bExpandingWithAClick) {
			this._toggleHeader();
		}

		if (Device.system.desktop && this._allowScroll()) {
			if (this.allowCustomScroll === true && oEvent.target.scrollTop > 0) {
				this.allowCustomScroll = false;
				return;
			}

			this.allowInnerDiv = true;
			this._getScrollBar().setScrollPosition(oEvent.target.scrollTop);
			this.toggleStyleClass("sapMDynamicPageWithScroll", this._needsVerticalScrollBar());
		}
	};

	/**
	 * Handles the scrolling on the "fake" scrollbar.
	 * @private
	 */
	DynamicPage.prototype._onScrollBarScroll = function () {
		this._toggleHeader();

		if (this.allowInnerDiv === true) {
			this.allowInnerDiv = false;
			return;
		}

		this.allowCustomScroll = true;
		this.$wrapper.scrollTop(this._getScrollBar().getScrollPosition());
	};

	/**
	 * Еxpands/collapses the header when allowed to do so by the internal rules of the <code>DynamicPage</code>.
	 * @private
	 */
	DynamicPage.prototype._titleExpandCollapseWhenAllowed = function () {
		if (this._headerBiggerThanAllowedToExpandWithACommand()) {
			jQuery.sap.log.warning("DynamicPage :: couldn't expand header. There isn't enough space for it to fit on the screen", this);
			return;
		}

		// Header scrolling is not allowed or there is no enough content scroll bar to appear
		if (!this._allowScroll() || !this._needsVerticalScrollBar()) {
			if (!this.getHeaderExpanded()) {
				// Show header, pushing the content down
				this._toggleHeaderVisibility(true);
				this._expandHeader(false);
			} else {
				// Hide header, pulling the content up
				this._toggleHeaderVisibility(false);
				this._snapHeader(false);
			}
		} else if (!this.getHeaderExpanded()) {
			// Header is already snapped, then expand
			this._bExpandingWithAClick = true;
			this._expandHeader(true);
		} else if (this._headerSnapAllowed()) {
			if (this._headerScrolledOut()) {
				// Header is scrolled out completely, then snap
				this._snapHeader(true);
			} else {
				// Header is not scrolled out completely, and there scroll to snap
				this._scrollToSnapHeader();
			}
		}
	};

	/**
	 * Handles the pin/unpin button press event, which results in the pinning/unping of the header.
	 * @private
	 */
	DynamicPage.prototype._onPinUnpinButtonPress = function (oEvent) {
		if (this._bPinned) {
			this._unPin(oEvent);
		} else {
			this._pin(oEvent);
			this._restorePinButtonFocus();
		}
	};


	/**
	 * ATTACH/DETACH HANDLERS
	 */

	/**
	 * Attaches resize handlers on DynamicPage, DynamicPageTitle DOM Element and DynamicPageContent DOM Element
	 * @private
	 */
	DynamicPage.prototype._attachResizeHandlers = function () {
		var fnChildControlSizeChangeHandler = this._onChildControlsHeightChange.bind(this);

		if (!this._sResizeHandlerId) {
			this._sResizeHandlerId = ResizeHandler.register(this, this._onResize.bind(this));
		}

		if (!this._sTitleResizeHandlerId && exists(this.$title)) {
			this._sTitleResizeHandlerId = ResizeHandler.register(this.$title[0], fnChildControlSizeChangeHandler);
		}

		if (!this._sContentResizeHandlerId && exists(this.$content)) {
			this._sContentResizeHandlerId = ResizeHandler.register(this.$content[0], fnChildControlSizeChangeHandler);
		}
	};

	/**
	 * Detaches resize handlers on DynamicPage, DynamicPAgeTitle DOM Element and DynamicPageContent DOM Element
	 * @private
	 */
	DynamicPage.prototype._detachResizeHandlers = function () {
		this._deRegisterHandler("_sResizeHandlerId");
		this._deRegisterHandler("_sTitleResizeHandlerId");
		this._deRegisterHandler("_sContentResizeHandlerId");
	};

	/**
	 * De-registers the given handler
	 * @param {string} sHandler handler
	 * @private
	 */
	DynamicPage.prototype._deRegisterHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}
	};

	/**
	 * Attaches a delegate for DynamicPage's child controls 'onAfterRendering' lifecycle events
	 * @private
	 */
	DynamicPage.prototype._attachPageChildrenAfterRenderingDelegates = function () {
		var oTitle = this.getTitle(),
			oContent = this.getContent(),
			fnOnPageChildrenAfterRenderingHandler = {onAfterRendering: this._onChildControlsAfterRendering.bind(this)};

		if (exists(oTitle)) {
			oTitle.addEventDelegate(fnOnPageChildrenAfterRenderingHandler);
		}

		if (exists(oContent)) {
			oContent.addEventDelegate(fnOnPageChildrenAfterRenderingHandler);
		}
	};

	/**
	 * Attaches the Title press handlers
	 * @private
	 */
	DynamicPage.prototype._attachTitlePressHandler = function () {
		var oTitle = this.getTitle();
		if (exists(oTitle) && !this._bAlreadyAttachedTitlePressHandler) {
			oTitle.attachEvent(DynamicPage.EVENTS.TITLE_PRESS, this._titleExpandCollapseWhenAllowed, this);
			this._bAlreadyAttachedTitlePressHandler = true;
		}
	};

	/**
	 * Attaches the Pin/Unpin Button press handler
	 * @private
	 */
	DynamicPage.prototype._attachPinPressHandler = function () {
		var oHeader = this.getHeader();

		if (exists(oHeader) && !this._bAlreadyAttachedPinPressHandler) {
			oHeader.attachEvent(DynamicPage.EVENTS.PIN_UNPIN_PRESS, this._onPinUnpinButtonPress, this);
			this._bAlreadyAttachedPinPressHandler = true;
		}
	};

	/**
	 * Attaches the scroll the content scroll handler using the 'native' scroll event
	 * @private
	 */
	DynamicPage.prototype._attachScrollHandler = function () {
		this.$wrapper.on("scroll", this._onWrapperScroll.bind(this));
	};

	/**
	 * Detaches the scroll the content scroll handler using the 'native' scroll event
	 * @private
	 */
	DynamicPage.prototype._detachScrollHandler = function () {
		if (this.$wrapper) {
			this.$wrapper.unbind("scroll");
		}
	};

	return DynamicPage;

}, /* bExport= */ false);
