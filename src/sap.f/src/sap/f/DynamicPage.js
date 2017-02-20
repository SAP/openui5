/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPage.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/ScrollBar",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/Device"
], function (jQuery, library, Control, ScrollBar, ResizeHandler, ScrollEnablement, Device) {
	"use strict";

	/**
	 * Constructor for a new <code>DynamicPage</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A layout control, representing a web page, consisting of a title, header with dynamic behavior, a content area, and an optional floating footer.
	 *
	 * <h3>Overview</h3>
	 *
	 * The control consist of several components:
	 *
	 * <ul><li>{@link sap.f.DynamicPageTitle DynamicPageTitle} - consists of a heading
	 * on the left side, content in the middle, and actions on the right. The displayed
	 * content changes based on the current mode of the {@link sap.f.DynamicPageHeader
	 * DynamicPageHeader}.</li>
	 * <li>{@link sap.f.DynamicPageHeader DynamicPageHeader} - a generic container, which
	 * can contain a single layout control and does not care about the content alignment
	 * and responsiveness. The header works in two modes - expanded and snapped and its
	 * behavior can be adjusted with the help of different properties.</li>
	 * <li>Content area - a generic container, which can have a single UI5 layout control
	 * and does not care about the content alignment and responsiveness.</li>
	 * <li>Footer - positioned at the bottom with a small offset and used for additional
	 * actions, the footer floats above the content. It can be any {@link sap.m.IBar}
	 * control.</li></ul>
	 *
	 * <h3>Usage</h3>
	 *
	 * Use the <code>DynamicPage</code> if you need to have a title, that is always visible
	 * and a header, that has configurable Expanding/Snapping functionality.
	 * If you don't need the Expanding/Snapping functionality it is better to use the
	 * {@link sap.m.Page} as a lighter control.
	 *
	 * <ul><b>Notes:</b>
	 * <li>If you're displaying a {@link sap.m.FlexBox} with non-adaptive content
	 * (doesn't stretch to fill the available space), it is recommended to set the
	 * <code>fitContainer</code> property of the {@link sap.m.FlexBox FlexBox} to
	 * <code>false</code>.</li>
	 * <li>If you are displaying a {@link sap.ui.table.Table}, keep in mind that it is
	 * non-adaptive and may cause unpredicted behavior for the <code>DynamicPage</code>
	 * on smaller screen sizes, such as mobile.</li>
	 * <li>Snapping of the {@link sap.f.DynamicPageTitle DynamicPageTitle} is not supported in the following case:
	 * When the <code>DynamicPage</code> has a scroll bar, the control usually scrolls to the snapping point - the point,
	 * where the {@link sap.f.DynamicPageHeader DynamicPageHeader} is scrolled out completely.
	 * However, when there is a scroll bar, but not enough content to reach the snapping point,
	 * the snapping is not possible using scrolling.</li></ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The responsive behavior of the <code>DynamicPage</code> depends on the behavior of
	 * the content that is displayed.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42
	 * @alias sap.f.DynamicPage
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DynamicPage = Control.extend("sap.f.DynamicPage", /** @lends sap.f.DynamicPage.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				 * Preserves the current header state when scrolling.
				 * For example, if the user expands the header by clicking on the title and then scrolls down the page, the header will remain expanded.
				 * <br><b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example,
				 * when the control is rendered on tablet or mobile and the control`s title and header
				 * are with height larger than the given threshold.
				 */
				preserveHeaderStateOnScroll: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether the header is expanded.
				 *
				 * The header can be also expanded/collapsed by user interaction,
				 * which requires the property to be internally mutated by the control to reflect the changed state.
				 *
				 * <b>Note:</b> Please be aware that initially collapsed header state is not supported, so <code>headerExpanded</code> should not be set to <code>false</code> when initializing the control.
				 */
				headerExpanded: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether the the user can switch between the expanded/collapsed states of the
				 * <code>DynamicPageHeader</code> by clicking on the <code>DynamicPageTitle</code>. If set to
				 * <code>false</code>, the <code>DynamicPageTitle</code> is not clickable and the application
				 * must provide other means for expanding/collapsing the <code>DynamicPageHeader</code>, if necessary.
				 */
				toggleHeaderOnTitleClick: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether the footer is visible.
				 */
				showFooter: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Optimizes <code>DynamicPage</code> responsiveness on small screens and behavior
				 * when expanding/collapsing the <code>DynamicPageHeader</code>.
				 *
				 * <b>Note:</b> It is recommended to use this property when displaying content
				 * of adaptive controls that stretch to fill the available space,
				 * such as {@link sap.ui.table.Table} and  {@link sap.ui.table.AnalyticalTable}.
				 */
				fitContent: {type: "boolean", group: "Behavior", defaultValue: false}
			},
			aggregations: {
				/**
				 * <code>DynamicPage</code> title.
				 */
				title: {type: "sap.f.DynamicPageTitle", multiple: false},

				/**
				 * <code>DynamicPage</code> header.
				 */
				header: {type: "sap.f.DynamicPageHeader", multiple: false},

				/**
				 * <code>DynamicPage</code> content.
				 */
				content: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * <code>DynamicPage</code> floating footer.
				 */
				footer: {type: "sap.m.IBar", multiple: false},

				/**
				 * <code>DynamicPage</code> custom <code>ScrollBar</code>.
				 */
				_scrollBar: {type: "sap.ui.core.ScrollBar", multiple: false, visibility: "hidden"}
			}
		}
	});

	function exists(vObject) {
		if (arguments.length === 1) {
			// Check if vObject is an Array or jQuery empty object,
			// by looking for the inherited property "length" via the "in" operator.
			// If yes - check if the "length" is positive.
			// If not - cast the vObject to Boolean.
			return vObject && ("length" in vObject) ? vObject.length > 0 : !!vObject;
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
		PHONE: "sapFDynamicPage-Std-Phone",
		TABLET: "sapFDynamicPage-Std-Tablet",
		DESKTOP: "sapFDynamicPage-Std-Desktop"
	};

	DynamicPage.RESIZE_HANDLER_ID = {
		PAGE: "_sResizeHandlerId",
		TITLE: "_sTitleResizeHandlerId",
		CONTENT: "_sContentResizeHandlerId"
	};

	/**
	 * LIFECYCLE METHODS
	 */
	DynamicPage.prototype.init = function () {
		this._bPinned = false;
		this._bHeaderInTitleArea = false;
		this._bExpandingWithAClick = false;
		this._headerBiggerThanAllowedHeight = false;
		this._oScrollHelper = new ScrollEnablement(this, this.getId() + "-content", {
			horizontal: false,
			vertical: true
		});
	};

	DynamicPage.prototype.onBeforeRendering = function () {
		if (!this._preserveHeaderStateOnScroll()) {
			this._attachPinPressHandler();
		}

		this._attachTitlePressHandler();
		this._detachScrollHandler();
	};

	DynamicPage.prototype.onAfterRendering = function () {
		if (this._preserveHeaderStateOnScroll()) {
			// Ensure that in this tick DP and it's aggregations are rendered
			jQuery.sap.delayedCall(0, this, this._overridePreserveHeaderStateOnScroll);
		}

		this._bPinned = false;
		this._cacheDomElements();
		this._detachResizeHandlers();
		this._attachResizeHandlers();
		this._updateMedia(this._getWidth(this));
		this._attachScrollHandler();
		this._updateScrollBar();
		this._attachPageChildrenAfterRenderingDelegates();
		this._resetPinButtonState();
	};

	DynamicPage.prototype.exit = function () {
		this._detachResizeHandlers();
		if (this._oScrollHelper) {
			this._oScrollHelper.destroy();
		}
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

	DynamicPage.prototype.setPreserveHeaderStateOnScroll = function (bPreserveHeaderStateOnScroll) {
		var vResult = this.setProperty("preserveHeaderStateOnScroll", bPreserveHeaderStateOnScroll, false);

		if (bPreserveHeaderStateOnScroll || this._shouldExpand()) {
			this.setHeaderExpanded(true);
		}

		return vResult;
	};

	DynamicPage.prototype.setToggleHeaderOnTitleClick = function (bToggleHeaderOnTitleClick) {
		var vResult = this.setProperty("toggleHeaderOnTitleClick", bToggleHeaderOnTitleClick, true);

		this.$().toggleClass("sapFDynamicPageTitleClickEnabled", bToggleHeaderOnTitleClick);

		return vResult;
	};

	DynamicPage.prototype.setFitContent = function (bFitContent) {
		var vResult = this.setProperty("fitContent", bFitContent, true);

		if (exists(this.$())) {
			this._updateFitContainer();
		}

		return vResult;
	};

	DynamicPage.prototype.getScrollDelegate = function () {
		return this._oScrollHelper;
	};

	/**
	 * PRIVATE METHODS
	 */

	/**
	 * If the header is larger than the allowed height, the <code>preserveHeaderStateOnScroll</code> property will be ignored
	 * and the header can be expanded or collapsed on page scroll.
	 * @private
	 * @returns {boolean} is rule overridden
	 */
	DynamicPage.prototype._overridePreserveHeaderStateOnScroll = function () {
		if (!this._shouldOverridePreserveHeaderStateOnScroll()) {
			this._headerBiggerThanAllowedHeight = false;
			return;
		}

		this._headerBiggerThanAllowedHeight = true;
		this._moveHeaderToContentArea();
		this._updateScrollBar();
	};

	/**
	 * Determines if the <code>preserveHeaderStateOnScroll</code> should be ignored.
	 * @private
	 * @returns {boolean}
	 */
	DynamicPage.prototype._shouldOverridePreserveHeaderStateOnScroll = function () {
		return !Device.system.desktop && this._headerBiggerThanAllowedToBeFixed() && this._preserveHeaderStateOnScroll();
	};

	/**
	 * Hides/shows the footer container.
	 * @param bShow
	 * @private
	 */
	DynamicPage.prototype._toggleFooter = function (bShow) {
		var oFooter = this.getFooter();

		if (!exists(this.$())) {
			return;
		}

		if (!exists(oFooter)) {
			return;
		}

		oFooter.toggleStyleClass("sapFDynamicPageActualFooterControlShow", bShow);
		oFooter.toggleStyleClass("sapFDynamicPageActualFooterControlHide", !bShow);

		this._toggleFooterSpacer(bShow);

		if (bUseAnimations){
			if (!bShow) {
				jQuery.sap.delayedCall(DynamicPage.FOOTER_ANIMATION_DURATION, this, function () {
					this.$footerWrapper.toggleClass("sapUiHidden", !this.getShowFooter());
				});
			} else {
				this.$footerWrapper.toggleClass("sapUiHidden", !this.getShowFooter());
			}

			jQuery.sap.delayedCall(DynamicPage.FOOTER_ANIMATION_DURATION, this, function () {
				oFooter.removeStyleClass("sapFDynamicPageActualFooterControlShow");
			});
		}

		this._updateScrollBar();
	};

	/**
	 * Hides/shows the footer spacer.
	 * @param {boolean} bToggle
	 * @private
	 */
	DynamicPage.prototype._toggleFooterSpacer = function (bToggle) {
		var $footerSpacer = this.$("spacer");

		if (exists($footerSpacer)) {
			$footerSpacer.toggleClass("sapFDynamicPageContentWrapperSpacer", bToggle);
		}

		if (exists(this.$contentFitContainer)) {
			this.$contentFitContainer.toggleClass("sapFDynamicPageContentFitContainerFooterVisible", bToggle);
		}
	};

	/**
	 * Switches between expanded/collapsed (snapped) modes.
	 * @private
	 */
	DynamicPage.prototype._toggleHeader = function () {
		if (this._preserveHeaderStateOnScroll()) {
			return;
		}

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
	 * Converts the header to collapsed (snapped) mode.
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
		this.$titleArea.addClass("sapFDynamicPageTitleSnapped");
	};

	/**
	 * Converts the header to expanded mode.
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
		this.$titleArea.removeClass("sapFDynamicPageTitleSnapped");
	};

	/**
	 * Toggles the header visibility in such a way, that the page content is pushed down or pulled up.
	 * The method is used, when <code>preserveHeaderStateOnScroll</code> is enabled.
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderVisibility = function (bShow) {
		var bExpanded = this.getHeaderExpanded(),
			oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		if (this._bPinned) {
			jQuery.sap.log.debug("DynamicPage :: header toggle aborted, header is pinned", this);
			return;
		}

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._setShowExpandContent(bExpanded);
			oDynamicPageTitle._setShowSnapContent(!bExpanded);
		}

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().toggleClass("sapFDynamicPageHeaderHidden", !bShow);
			this._updateScrollBar();
		}
	};

	/**
	 * Appends header to content area.
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
	 * Appends header to title area.
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
	 * Scrolls the content to the snap point(header`s height + 1).
	 * @private
	 */
	DynamicPage.prototype._scrollToSnapHeader = function () {
		this._setScrollPosition(this._getSnappingHeight() + 1);
	};

	/**
	 * Pins the header.
	 * @private
	 */
	DynamicPage.prototype._pin = function () {
		if (!this._bPinned) {
			this._bPinned = true;
			this._moveHeaderToTitleArea();
			this._updateScrollBar();
			this._togglePinButtonARIAState(this._bPinned);
		}
	};

	/**
	 * Unpins the header.
	 * @private
	 */
	DynamicPage.prototype._unPin = function () {
		if (this._bPinned) {
			this._bPinned = false;
			this._togglePinButtonARIAState(this._bPinned);
		}
	};

	/**
	 * Shows/Hides the header pin button
	 * @param {Boolean} bToggle
	 * @private
	 */
	DynamicPage.prototype._togglePinButtonVisibility = function (bToggle) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._setShowPinBtn(bToggle);
		}
	};

	/**
	 * Toggles the header pin button pressed state
	 * @param {Boolean} bPressed
	 * @private
	 */
	DynamicPage.prototype._togglePinButtonPressedState = function (bPressed) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._togglePinButton(bPressed);
		}
	};

	/**
	 * Toggles the header pin button ARIA State
	 * @param {Boolean} bPinned
	 * @private
	 */
	DynamicPage.prototype._togglePinButtonARIAState = function (bPinned) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._updateARIAPinButtonState(bPinned);
		}
	};

	/**
	 * Resets the header pin button state
	 * @private
	 */
	DynamicPage.prototype._resetPinButtonState = function () {
		if (this._preserveHeaderStateOnScroll()) {
			this._togglePinButtonVisibility(false);
		} else {
			this._togglePinButtonPressedState(false);
			this._togglePinButtonARIAState(false);
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
	 * Determines the appropriate position of the <code>ScrollBar</code> based on the used device.
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
	 * Sets the appropriate scroll position of the <code>ScrollBar</code> and <code>DynamicPage</code> content wrapper,
	 * based on the used device.
	 * @param {Number} iNewScrollPosition
	 * @private
	 */
	DynamicPage.prototype._setScrollPosition = function (iNewScrollPosition) {
		if (exists(this.$wrapper)) {
			this.$wrapper.scrollTop(iNewScrollPosition);
			Device.system.desktop && this._getScrollBar().setScrollPosition(iNewScrollPosition);
		}
	};

	/**
	 * Determines if the header should collapse (snap).
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldSnap = function () {
		return !this._preserveHeaderStateOnScroll() && this._getScrollPosition() > this._getSnappingHeight()
			&& this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines if the header should expand.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldExpand = function () {
		return !this._preserveHeaderStateOnScroll() && this._getScrollPosition() < this._getSnappingHeight()
			&& !this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines if the header is scrolled out completely.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerScrolledOut = function () {
		return this._getScrollPosition() > this._getSnappingHeight();
	};

	/**
	 * Determines if the header is allowed to collapse (snap),
	 * not pinned, not already collapsed (snapped) and <code>preserveHeaderStateOnScroll</code> is <code>false</code>.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerSnapAllowed = function () {
		return !this._preserveHeaderStateOnScroll() && this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines if it's possible for the header to collapse (snap) on scroll.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._canSnapHeaderOnScroll = function () {
		return this._getMaxScrollPosition() > (this._getSnappingHeight() + 1);
	};

	/**
	 * Determines the appropriate height at which the header can collapse (snap).
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getSnappingHeight = function () {
		return this._getHeaderHeight() || this._getTitleHeight();
	};

	/**
	 * Determines the maximum scroll position, depending on the content size.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getMaxScrollPosition = function() {
		var $wrapperDom;

		if (exists(this.$wrapper)) {
			$wrapperDom = this.$wrapper[0];
			return $wrapperDom.scrollHeight - Math.ceil($wrapperDom.getBoundingClientRect().height);
		}
		return 0;
	};

	/**
	 * Determines if the control would need a <code>ScrollBar</code>.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._needsVerticalScrollBar = function () {
		return this._getMaxScrollPosition() > 0;
	};

	/**
	 * Retrieves the height of the <code>DynamicPage</code> control.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getOwnHeight = function () {
		return this._getHeight(this);
	};

	/**
	 * Determines the combined height of the title and the header.
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
	 * Determines if the header is larger than what's allowed for it to be pinned.
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
	 * Determines if the header is larger than the allowed height.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowedToBeFixed = function () {
		var iControlHeight = this._getOwnHeight();

		return this._getEntireHeaderHeight() > DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE * iControlHeight;
	};

	/**
	 * Determines the height that is needed to correctly offset the <code>ScrollBar</code>,
	 * when <code>preserveHeaderStateOnScroll</code> is set to <code>false</code>.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._measureScrollBarOffsetHeight = function () {
		var iHeight = 0,
			bSnapped = !this.getHeaderExpanded();

		if (this._preserveHeaderStateOnScroll() || this._bPinned) {
			iHeight = this._getTitleAreaHeight();
			jQuery.sap.log.debug("DynamicPage :: preserveHeaderState is enabled or header pinned :: title area height" + iHeight, this);
			return iHeight;
		}

		if (bSnapped || !exists(this.getTitle()) || !this._canSnapHeaderOnScroll()) {
			iHeight = this._getTitleHeight();
			jQuery.sap.log.debug("DynamicPage :: header snapped :: title height " + iHeight, this);
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
	 * Updates the position/height of the <code>ScrollBar</code>
	 * @private
	 */
	DynamicPage.prototype._updateScrollBar = function () {
		var oScrollBar,
			bScrollBarNeeded,
			bNeedUpdate;

		if (!Device.system.desktop || !exists(this.$wrapper)) {
			return;
		}

		oScrollBar = this._getScrollBar();
		oScrollBar.setContentSize(this._measureScrollBarOffsetHeight() + this.$wrapper[0].scrollHeight + "px");

		bScrollBarNeeded = this._needsVerticalScrollBar();
		bNeedUpdate = this.bHasScrollbar !== bScrollBarNeeded;
		if (bNeedUpdate) {
			oScrollBar.toggleStyleClass("sapUiHidden", !bScrollBarNeeded);
			this.toggleStyleClass("sapFDynamicPageWithScroll", bScrollBarNeeded);
			this.bHasScrollbar = bScrollBarNeeded;
			jQuery.sap.delayedCall(0, this, this._updateFitContainer);
		}

		jQuery.sap.delayedCall(0, this, this._updateScrollBarOffset);

	};

	DynamicPage.prototype._updateFitContainer = function (bNeedsVerticalScrollBar) {
		var bNoScrollBar = typeof bNeedsVerticalScrollBar !== 'undefined' ? !bNeedsVerticalScrollBar : !this._needsVerticalScrollBar(),
			bFitContent = this.getFitContent(),
			bToggleClass = bFitContent || bNoScrollBar;

		this.$contentFitContainer.toggleClass("sapFDynamicPageContentFitContainer", bToggleClass);
	};


	/**
	 * Updates the title area/footer offset. Since the "real" scroll bar starts at just below the title and since the "fake"
	 * <code>ScrollBar</code> doesn't shift the content of the title/footer, it is necessary to offset this ourselves, so it looks natural.
	 * @private
	 */
	DynamicPage.prototype._updateScrollBarOffset = function () {
		var sStyleAttribute = sap.ui.getCore().getConfiguration().getRTL() ? "left" : "right",
			iOffsetWidth = this._needsVerticalScrollBar() ? jQuery.sap.scrollbarSize().width + "px" : 0,
			oFooter = this.getFooter();

		this.$titleArea.css("padding-" + sStyleAttribute, iOffsetWidth);
		if (exists(oFooter)) {
			oFooter.$().css(sStyleAttribute, iOffsetWidth);
		}
	};

	/**
	 * Updates the Header ARIA state depending on the <code>DynamicPageHeader</code> expanded/collapsed (snapped) state.
	 * @param {Boolean} bExpanded determines if the header is expanded or collapsed (snapped).
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
	 * This is necessary, because the control will be embedded in other controls (like the <code>sap.f.FlexibleColumnLayout<code>),
	 * thus it will not be using all of the screen width, but despite that the paddings need to be appropriate.
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
	 * Determines the height of a control safely. If the control doesn't exist it returns 0,
	 * so it doesn't confuse any calculations based on it. If it exists it just returns its DOM element height.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the height of the control
	 */
	DynamicPage.prototype._getHeight = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerHeight() || 0;
	};

	/**
	 * Determines the width of a control safely. If the control doesn't exist it returns 0,
	 * so it doesn't confuse any calculations based on it. If it exists it just returns its DOM element width.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the width of the control
	 */
	DynamicPage.prototype._getWidth = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerWidth() || 0;
	};

	/**
	 * Determines the height of the <code>DynamicPage</code> outer header DOM element (the title area),
	 * the wrapper of the <code>DynamicPageTitle</code> and <code>DynamicPageHeader</code>.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getTitleAreaHeight = function () {
		return exists(this.$titleArea) ? this.$titleArea.outerHeight() || 0 : 0;
	};

	/**
	 * Determines the height of the <code>DynamicPageTitle</code> and if it's not present it returns 0.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getTitleHeight = function () {
		return this._getHeight(this.getTitle());
	};

	/**
	 * Determines the height of the <code>DynamicPageHeader</code> and if it's not present it returns 0.
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
	DynamicPage.prototype._preserveHeaderStateOnScroll = function () {
		return this.getPreserveHeaderStateOnScroll() && !this._headerBiggerThanAllowedHeight;
	};

	/**
	 * Lazily retrieves the "fake" <code>ScrollBar</code>.
	 * @returns {sap.ui.core.ScrollBar} the "fake" <code>ScrollBar</code>
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
	 * Caches the <code>DynamicPage</code> DOM elements in a jQuery object for later reuse.
	 * @private
	 */
	DynamicPage.prototype._cacheDomElements = function () {
		var oFooter = this.getFooter();

		if (exists(oFooter)) {
			this.$footer = oFooter.$();
			this.$footerWrapper = this.$("footerWrapper");
		}

		this.$wrapper = this.$("contentWrapper");
		this.$contentFitContainer = this.$("contentFitContainer");
		this.$titleArea = this.$("header");

		this._cacheTitleDom();
	};

	/**
	 * Caches the <code>DynamicPageTitle</code> DOM element as jQuery object for later reuse,
	 * used when <code>DynamicPageTitle</code> is re-rendered (<code>_onChildControlAfterRendering</code> method)
	 * to ensure the <code>DynamicPageTitle</code> DOM reference is the current one.
	 * @private
	 */
	DynamicPage.prototype._cacheTitleDom = function () {
		var oTitle = this.getTitle();

		if (exists(oTitle)) {
			this.$title = oTitle.$();
		}
	};

	/**
	 * EVENT HANDLERS
	 */

	/**
	 * Marks the event for components that need to know if the event was handled.
	 * This allows drag scrolling of the control.
	 * @param {jQuery.Event} oEvent
	 */
	DynamicPage.prototype.ontouchmove = function (oEvent) {
		oEvent.setMarked();
	};

	/**
	 * Reacts to the <code>DynamicPage</code> child controls re-rendering, updating the <code>ScrollBar</code> size.
	 * In case <code>DynamicPageTitle</code> is re-rendering, the <code>DynamicPageTitle</code> DOM reference and resize handlers should be also updated.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onChildControlAfterRendering = function (oEvent) {
		if (oEvent.srcControl instanceof sap.f.DynamicPageTitle ) {
			this._cacheTitleDom();
			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE);
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE, this.$title[0], this._onChildControlsHeightChange.bind(this));
		}
		jQuery.sap.delayedCall(0, this, this._updateScrollBar);
	};


	/**
	 * Reacts when the aggregated child controls change their height
	 * in order to adjust the update the <code>ScrollBar</code>.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onChildControlsHeightChange = function (oEvent) {
		var bNeedsVerticalScrollbar = this._needsVerticalScrollBar();

		// FitContaner needs to be updated, when height is changed and scroll bar appear, to enable calc of original height
		if (bNeedsVerticalScrollbar) {
			this._updateFitContainer(bNeedsVerticalScrollbar);
		}

		if (!this._bExpandingWithAClick) {
			this._updateScrollBar();
		}

		this._bExpandingWithAClick = false;
	};

	/**
	 * Handles the resize event of the <code>DynamicPage</code>.
	 * Unpins the header when its size threshold has been reached and updates the "fake" <code>ScrollBar</code> height.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onResize = function (oEvent) {
		var oDynamicPageHeader = this.getHeader();

		if (!this._preserveHeaderStateOnScroll() && oDynamicPageHeader) {
			if (this._headerBiggerThanAllowedToPin(oEvent.size.height) || Device.system.phone) {
				this._unPin();
				this._togglePinButtonVisibility(false);
				this._togglePinButtonPressedState(false);
			} else {
				this._togglePinButtonVisibility(true);
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

		if (Device.system.desktop) {
			if (this.allowCustomScroll === true && oEvent.target.scrollTop > 0) {
				this.allowCustomScroll = false;
				return;
			}

			this.allowInnerDiv = true;
			this._getScrollBar().setScrollPosition(oEvent.target.scrollTop);
			this.toggleStyleClass("sapFDynamicPageWithScroll", this._needsVerticalScrollBar());
		}
	};

	/**
	 * Handles the scrolling on the "fake" <code>ScrollBar</code>.
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
	 * Handles the title press event and prevents the collapse/expand, if necessary
	 * @private
	 */
	DynamicPage.prototype._onTitlePress = function () {
		if (this.getToggleHeaderOnTitleClick()) {
			this._titleExpandCollapseWhenAllowed();
		}
	};

	/**
	 * Еxpands/collapses the header when allowed to do so by the internal rules of the <code>DynamicPage</code>.
	 * @private
	 */
	DynamicPage.prototype._titleExpandCollapseWhenAllowed = function () {
		// Header scrolling is not allowed or there is no enough content scroll bar to appear
		if (this._preserveHeaderStateOnScroll() || !this._needsVerticalScrollBar()) {
			if (!this.getHeaderExpanded()) {
				// Show header, pushing the content down
				this._expandHeader(false);
				this._toggleHeaderVisibility(true);
			} else {
				// Hide header, pulling the content up
				this._snapHeader(false);
				this._toggleHeaderVisibility(false);
			}

		} else if (!this.getHeaderExpanded()) {
			// Header is already snapped, then expand
			this._bExpandingWithAClick = true;
			this._expandHeader(true);

		} else if (this._headerSnapAllowed()) {

			if (this._headerScrolledOut()) {
				// Header is scrolled out completely, then snap
				this._snapHeader(true);
			} else if (this._canSnapHeaderOnScroll()){
				// Header is not scrolled out completely, then scroll to snap
				this._scrollToSnapHeader();
			} else {
				jQuery.sap.log.warning("DynamicPage :: couldn't snap header. There isn't enough content to be scrolled", this);
			}
		}
	};

	/**
	 * Handles the pin/unpin button press event, which results in the pinning/unpinning of the <code>DynamicPageHeader</code>.
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
	 * Attaches resize handlers on <code>DynamicPage</code>, <code>DynamicPageTitle</code> DOM Element
	 * and <code>DynamicPage</code> content DOM Element.
	 * @private
	 */
	DynamicPage.prototype._attachResizeHandlers = function () {
		var fnChildControlSizeChangeHandler = this._onChildControlsHeightChange.bind(this);

		this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.PAGE, this, this._onResize.bind(this));

		if (exists(this.$title)) {
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE, this.$title[0], fnChildControlSizeChangeHandler);
		}

		if (exists(this.$contentFitContainer)) {
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.CONTENT, this.$contentFitContainer[0], fnChildControlSizeChangeHandler);
		}
	};

	/**
	 * Registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @param {Object} oObject
	 * @param {Function} fnHandler
	 * @private
	 */
	DynamicPage.prototype._registerResizeHandler = function (sHandler, oObject, fnHandler) {
		if (!this[sHandler]) {
			this[sHandler] = ResizeHandler.register(oObject, fnHandler);
		}
	};

	/**
	 * Detaches resize handlers on <code>DynamicPage</code>, <code>DynamicPageTitle</code> DOM Element
	 * and <code>DynamicPage</code> content DOM Element.
	 * @private
	 */
	DynamicPage.prototype._detachResizeHandlers = function () {
		this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.PAGE);
		this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE);
		this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.CONTENT);
	};

	/**
	 * De-registers resize handler.
	 * @param {string} sHandler the handler ID
	 * @private
	 */
	DynamicPage.prototype._deRegisterResizeHandler = function (sHandler) {
		if (this[sHandler]) {
			ResizeHandler.deregister(this[sHandler]);
			this[sHandler] = null;
		}
	};

	/**
	 * Attaches a delegate for the <code>DynamicPage</code> child controls <code>onAfterRendering</code> lifecycle events.
	 * @private
	 */
	DynamicPage.prototype._attachPageChildrenAfterRenderingDelegates = function () {
		var oTitle = this.getTitle(),
			oContent = this.getContent(),
			oPageChildrenAfterRenderingDelegate = {onAfterRendering: this._onChildControlAfterRendering.bind(this)};

		if (exists(oTitle)) {
			oTitle.addEventDelegate(oPageChildrenAfterRenderingDelegate);
		}

		if (exists(oContent)) {
			oContent.addEventDelegate(oPageChildrenAfterRenderingDelegate);
		}
	};

	/**
	 * Attaches the <code>DynamicPageTitle</code> press handler.
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
	 * Attaches the <code>DynamicPageHeader</code> pin/unpin button press handler.
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
	 * Attaches the <code>DynamicPage</code> content scroll handler.
	 * @private
	 */
	DynamicPage.prototype._attachScrollHandler = function () {
		this.$wrapper.on("scroll", this._onWrapperScroll.bind(this));
	};

	/**
	 * Detaches the the <code>DynamicPage</code> content scroll handler.
	 * @private
	 */
	DynamicPage.prototype._detachScrollHandler = function () {
		if (this.$wrapper) {
			this.$wrapper.unbind("scroll");
		}
	};

	return DynamicPage;

}, /* bExport= */ true);
