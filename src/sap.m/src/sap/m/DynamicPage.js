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
				 * Determines whether Header will always be expanded.
				 */
				headerAlwaysExpanded: {type: "boolean", group: "Behaviour", defaultValue: false},

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
		this._bHeaderSnapped = false;
		this._bExpandingWithAClick = false;
	};

	DynamicPage.prototype.onBeforeRendering = function () {
		if (!this.getHeaderAlwaysExpanded()) {
			this._attachPinPressHandler();
		}

		this._attachTitlePressHandler();
		this._detachScrollHandler();
	};

	DynamicPage.prototype.onAfterRendering = function () {
		if (this.getHeaderAlwaysExpanded() && exists(this.getHeader())) {
			this.getHeader()._setShowPinBtn(false);
		}

		this._cacheDomElements();
		this._attachScrollHandler();
		this._updateScrollBar();
		this._attachResizeHandlers();
		this._attachPageChildrenAfterRenderingDelegates();
		this._updateMedia(this._getHeight(this));
	};

	DynamicPage.prototype.exit = function () {
		this._detachResizeHandlers();
	};

	DynamicPage.prototype.setShowFooter = function (bShowFooter) {
		var vResult = this.setProperty("showFooter", bShowFooter, true);
		this._toggleFooter(bShowFooter);
		return vResult;
	};

	/**
	 * PRIVATE METHODS
	 */

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

		if (bUseAnimations && !bShow) {
			jQuery.sap.delayedCall(DynamicPage.FOOTER_ANIMATION_DURATION, this, function () {
				this.$footerWrapper.toggleClass("sapUiHidden", !bShow);
			});
		} else {
			this.$footerWrapper.toggleClass("sapUiHidden", !bShow);
		}
	};

	/**
	 * Switches between snapped/expanded modes
	 * @private
	 */
	DynamicPage.prototype._toggleHeader = function () {
		if (this._shouldSnap()) {
			this._snapHeader();
			this._updateHeaderARIAState(false);
		} else if (this._shouldExpand()) {
			this._expandHeader();
			this._updateHeaderARIAState(true);
		}
	};

	/**
	 * Converts the header to snapped mode
	 * @private
	 */
	DynamicPage.prototype._snapHeader = function () {
		var oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		if (this._bPinned) {
			jQuery.sap.log.debug("DynamicPage :: aborted snapping, header is pinned", this);
			return;
		}

		this._bHeaderSnapped = true;
		jQuery.sap.log.debug("DynamicPage :: snapped header", this);

		if (exists(oDynamicPageTitle)) {
			if (exists(oDynamicPageTitle.getExpandedContent())) {
				oDynamicPageTitle._setShowExpandContent(false);
			}

			if (exists(oDynamicPageTitle.getSnappedContent())) {
				oDynamicPageTitle._setShowSnapContent(true);
			}

			if (exists(oDynamicPageHeader)) {
				oDynamicPageHeader.$().prependTo(this.$wrapper);
			}
		}

		this.$titleArea.toggleClass("sapMDynamicPageTitleSnapped", this._bHeaderSnapped);
	};

	/**
	 * Converts the header to expanded mode
	 * @private
	 */
	DynamicPage.prototype._expandHeader = function (bShouldAppendToTitle) {
		var oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		this._bHeaderSnapped = false;

		jQuery.sap.log.debug("DynamicPage :: expand header", this);

		if (exists(oDynamicPageTitle)) {
			if (exists(oDynamicPageTitle.getExpandedContent())) {
				oDynamicPageTitle._setShowExpandContent(true);
			}
			if (exists(oDynamicPageTitle.getSnappedContent())) {
				oDynamicPageTitle._setShowSnapContent(false);
			}

			if (bShouldAppendToTitle && exists(oDynamicPageHeader)) {
				oDynamicPageHeader.$().appendTo(this.$titleArea);
			}
		}

		this.$titleArea.toggleClass("sapMDynamicPageTitleSnapped", this._bHeaderSnapped);
	};

	/**
	 * Pins the header
	 * @private
	 */
	DynamicPage.prototype._pin = function () {
		if (!this._bPinned) {
			this._bPinned = true;
			this.getHeader().$().appendTo(this.$titleArea);
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
			this.getHeader().$().prependTo(this.$wrapper);
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
			&& !this._bHeaderSnapped && !this._bPinned;
	};

	/**
	 * Determines the if the header should expand
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldExpand = function () {
		return this._allowScroll() && this._getScrollPosition() < this._getSnappingHeight()
			&& this._bHeaderSnapped && !this._bPinned;
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
	 * @returns {boolean}
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
		if (exists(this.$wrapper) && !this.getHeaderAlwaysExpanded()) {
			return this.$wrapper[0].scrollHeight > this.$wrapper.innerHeight();
		} else {
			return false;
		}
	};

	/**
	 * Determines if the header is bigger than what's allowed. If the header becomes more than 60% of the screen heigth,
	 * it cannot be pinned. If it was already pinned, then unpin it.
	 * @param {Number} iHeight
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowed = function (iHeight) {
		var iTitleHeight = 0,
			iHeaderHeight = 0,
			oDynamicPageHeader = this.getHeader();

		if (!exists(oDynamicPageHeader)) {
			return false;
		}

		if (!isNaN(parseInt(iHeight, 10))) {
			iHeight = this.$().outerHeight();
		}

		if (exists(this.$title)) {
			iTitleHeight = this.$title.outerHeight();
		}

		if (exists(oDynamicPageHeader)) {
			iHeaderHeight = oDynamicPageHeader.$().outerHeight();
		}

		return iTitleHeight + iHeaderHeight > DynamicPage.HEADER_MAX_ALLOWED_PINNED_PERCENTAGE * iHeight;
	};

	/**
	 * Determines the height that is needed to correctly offset the "fake" scrollbar
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._measureOffsetHeight = function () {
		var iHeight = 0,
			bSnapped = this._bHeaderSnapped,
			bAlwaysShowExpanded = this.getHeaderAlwaysExpanded();

		if (bAlwaysShowExpanded || this._bPinned) {
			iHeight = this._getTitleHeight() + this._getHeaderHeight();
			jQuery.sap.log.debug("DynamicPage :: always show header :: title height + header height" + iHeight, this);
			return iHeight;
		}

		if (bSnapped || !exists(this.getTitle()) || !this._canSnap()) {
			iHeight = this._getTitleHeight();
			jQuery.sap.log.debug("DynamicPage :: snapped mode :: title height " + iHeight, this);
			return iHeight;
		}

		this._snapHeader();

		iHeight = this._getTitleHeight();

		if (this._shouldExpand() && !bSnapped) {
			this._expandHeader();
		}

		jQuery.sap.log.debug("DynamicPage :: snapped mode :: title height " + iHeight, this);
		return iHeight;
	};

	/**
	 * Updates the position/heigth of the "fake" scrollbar
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
	 * Updates the content area height. This is only applicable in the cases that a control (like the sap.m.Wizard)
	 * that manages its own content area (has it's own scrolling mechanism) and needs to occupy a 100% of the height
	 * that's left when you takeout the header and title space.
	 * @private
	 */
	DynamicPage.prototype._updateContentHeight = function () {
		if (this.getHeaderAlwaysExpanded()) {
			this.$("content").height((this._getHeight(this) - this._getTitleHeight() - this._getHeaderHeight()) + "px");
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
		return !this.getHeaderAlwaysExpanded();
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
		jQuery.sap.delayedCall(0, this, this._updateContentHeight);
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

		if (!this.getHeaderAlwaysExpanded() && oDynamicPageHeader) {
			if (this._headerBiggerThanAllowed(oEvent.size.height) || Device.system.phone) {
				this._unPin();
				oDynamicPageHeader._setShowPinBtn(false);
				oDynamicPageHeader._togglePinButton(false);
			} else {
				oDynamicPageHeader._setShowPinBtn(true);
			}
		}

		this._updateScrollBar();
		this._updateContentHeight();
		this._updateMedia(oEvent.size.width);
	};

	/**
	 * Handles the scrolling on the content.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onWrapperScroll = function (oEvent) {
		if (!this._bExpandingWithAClick) {
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
	 * Handles the title press event, which results in the snapping/expanding of the header.
	 * @private
	 */
	DynamicPage.prototype._onTitlePress = function () {
		if (!this.getHeaderAlwaysExpanded() && !this._headerBiggerThanAllowed()) {
			if (this._bHeaderSnapped) {
				this._bExpandingWithAClick = true;
				this._expandHeader(true);
			} else if (this._shouldSnap()) {
				this._snapHeader();
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

		this._updateScrollBar();
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
		if (this._sResizeHandlerId) {
			ResizeHandler.deregister(this._sResizeHandlerId);
		}

		if (this._sTitleResizeHandlerId) {
			ResizeHandler.deregister(this._sTitleResizeHandlerId);
		}

		if (this._sContentResizeHandlerId) {
			ResizeHandler.deregister(this._sContentResizeHandlerId);
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
			oTitle.attachEvent(DynamicPage.EVENTS.TITLE_PRESS, this._onTitlePress, this);
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
