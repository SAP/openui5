/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPage.
sap.ui.define([
	"./library",
	"sap/ui/core/Control",
	"sap/ui/core/Core",
	"sap/m/ScrollBar",
	"sap/m/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Configuration",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/Device",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"./DynamicPageRenderer",
	"sap/base/Log",
	"sap/ui/dom/getScrollbarSize",
	"sap/ui/core/library"
], function(
	library,
	Control,
	Core,
	ScrollBar,
	mLibrary,
	ManagedObjectObserver,
	ResizeHandler,
	Configuration,
	ScrollEnablement,
	Device,
	DynamicPageTitle,
	DynamicPageHeader,
	DynamicPageRenderer,
	Log,
	getScrollbarSize,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.m.PageBackgroundDesign
	var PageBackgroundDesign = mLibrary.PageBackgroundDesign;

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
	 * the snapping is not possible using scrolling.</li>
	 * <li>When using {@link sap.ui.layout.form.Form},
	 * {@link sap.m.Panel}, {@link sap.m.Table} and {@link sap.m.List} controls in the content of
	 * <code>DynamicPage</code>, you need to adjust their left text offset if you want to achieve vertical alignment
	 * between the <code>sap.f.DynamicPageHeader</code>`s  content and <code>DynamicPage</code>`s content.
	 * For more information, see the documentation for the <code>content</code> aggregation.</li></ul>
	 *
	 * <h3>Responsive Behavior</h3>
	 *
	 * The responsive behavior of the <code>DynamicPage</code> depends on the behavior of
	 * the content that is displayed. To adjust the <code>DynamicPage</code> content
	 * padding, the <code>sapUiContentPadding</code>, <code>sapUiNoContentPadding</code>,
	 * and <code>sapUiResponsiveContentPadding</code> CSS classes can be used.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.42
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/dynamic-page-layout/ Dynamic Page}
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
				 *
				 * <b>Note:</b> Based on internal rules, the value of the property is not always taken into account - for example,
				 * when the control`s title and header are with height larger than the given threshold.
				 */
				preserveHeaderStateOnScroll: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether the header is expanded.
				 *
				 * The header can be also expanded/collapsed by user interaction,
				 * which requires the property to be internally mutated by the control to reflect the changed state.
				 *
				 * <b>Note:</b> As of version 1.48, you can initialize the control in collapsed header state by setting this property to <code>false</code>.
				 */
				headerExpanded: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether the user can switch between the expanded/collapsed states of the
				 * <code>DynamicPageHeader</code> by clicking on the <code>DynamicPageTitle</code>
				 * or by using the expand/collapse visual indicators,
				 * positioned at the bottom of the <code>DynamicPageTitle</code> and the <code>DynamicPageHeader</code>.
				 * If set to <code>false</code>, the <code>DynamicPageTitle</code> is not clickable,
				 * the visual indicators are not available and the application
				 * must provide other means for expanding/collapsing the <code>DynamicPageHeader</code>, if necessary.
				 *
				 * <b>Note: </b> This property is taken into account only if a non-empty <code>header</code> aggregation is provided.
				 */
				toggleHeaderOnTitleClick: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether the footer is visible.
				 */
				showFooter: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines the background color of <code>DynamicPage</code>.
				 *
				 * @since 1.68
				 */
				backgroundDesign : {type: "sap.m.PageBackgroundDesign", group: "Appearance", defaultValue: PageBackgroundDesign.Standard},

				/**
				 * Optimizes <code>DynamicPage</code> responsiveness on small screens and behavior
				 * when expanding/collapsing the <code>DynamicPageHeader</code>.
				 *
				 * <b>Note:</b> It is recommended to use this property when displaying content
				 * of adaptive controls that stretch to fill the available space. Such controls may be
				 * {@link sap.ui.table.Table} and {@link sap.ui.table.AnalyticalTable} depending on their settings.
				 */
				fitContent: {type: "boolean", group: "Behavior", defaultValue: false}
			},
			associations: {
				/**
				 * Association of Controls / IDs, that provide sticky subheader content. All controls
				 * that provide this content have to implement the
				 * <code>sap.f.IDynamicPageStickyContent</code> interface.
				 *
				 * @since 1.65
				 */
				stickySubheaderProvider: {type: "sap.f.IDynamicPageStickyContent", multiple: false}
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
				 *
				 * <b>Note: </b> You can change the default paddings by adding the following CSS classes:
				 * <ul>
				 * <li><code>sapUiContentPadding</code></li>
				 * <li><code>sapUiNoContentPadding</code></li>
				 * <li><code>sapUiResponsiveContentPadding</code></li>
				 * </ul>
				 * For more information, see
				 * {@link topic:c71f6df62dae47ca8284310a6f5fc80a Using Container Content Padding CSS Classes}.
				 *
				 * <b>Note:</b> The SAP Fiori Design guidelines require that the
				 * <code>DynamicPageHeader</code>'s content and the <code>DynamicPage</code>'s content
				 * are aligned vertically. When using {@link sap.ui.layout.form.Form},
				 * {@link sap.m.Panel}, {@link sap.m.Table} and {@link sap.m.List} in the content area of
				 * <code>DynamicPage</code>, if the content is not already aligned, you need to adjust
				 * their left text offset to achieve the vertical alignment. To do this, apply the
				 * <code>sapFDynamicPageAlignContent</code> CSS class to them and set their <code>width</code>
				 * property to <code>auto</code> (if not set by default).
				 *
				 * Example:
				 *
				 * <pre>
				 * <code> &lt;Panel class=“sapFDynamicPageAlignContent” width=“auto”&gt;&lt;/Panel&gt; </code>
				 * </pre>
				 *
				 * Please keep in mind that the alignment is not possible in the following cases:
				 * <ul>
				 * <li> When the controls are placed in an {@link sap.ui.layout.Grid} or other layout
				 * controls that use <code>overflow:hidden</code> CSS property</li>
				 * <li> In case any of the following CSS classes is applied to
				 * <code>DynamicPage</code>: <code>sapUiContentPadding</code>,
				 * <code>sapUiNoContentPadding</code> or <code>sapUiResponsiveContentPadding</code></li>
				 * </ul>
				 *
				 */
				content: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * <code>DynamicPage</code> floating footer.
				 */
				footer: {type: "sap.m.IBar", multiple: false},

				/**
				 * Accessible landmark settings to be applied on the containers of the <code>sap.f.DynamicPage</code> control.
				 *
				 * If not set, no landmarks will be written.
				 *
				 * @since 1.61
				 */
				landmarkInfo : {type : "sap.f.DynamicPageAccessibleLandmarkInfo", multiple : false},

				/**
				 * <code>DynamicPage</code> custom <code>ScrollBar</code>.
				 */
				_scrollBar: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			dnd: { draggable: false, droppable: true },
			designtime: "sap/f/designtime/DynamicPage.designtime"
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

	// Determines if DOM element has both width and height.
	// @param {DOM Element} oElement
	// @returns {boolean}
	function hasDOMElementSize(oElement) {
		var oClientRect;

		if (!oElement) {
			return false;
		}

		oClientRect = oElement.getBoundingClientRect();

		return !!(oClientRect.width && oClientRect.height);
	}

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

	/**
	 * STATIC MEMBERS
	 */
	DynamicPage.HEADER_MAX_ALLOWED_PINNED_PERCENTAGE = 0.6;

	DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE = 0.6;

	DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_ON_MOBILE = 0.3;

	DynamicPage.BREAK_POINTS = {
		TABLET: 1024,
		PHONE: 600
	};

	DynamicPage.EVENTS = {
		TITLE_PRESS: "_titlePress",
		TITLE_MOUSE_OVER: "_titleMouseOver",
		TITLE_MOUSE_OUT: "_titleMouseOut",
		PIN_UNPIN_PRESS: "_pinUnpinPress",
		VISUAL_INDICATOR_MOUSE_OVER: "_visualIndicatorMouseOver",
		VISUAL_INDICATOR_MOUSE_OUT: "_visualIndicatorMouseOut",
		HEADER_VISUAL_INDICATOR_PRESS: "_headerVisualIndicatorPress",
		TITLE_VISUAL_INDICATOR_PRESS: "_titleVisualIndicatorPress"
	};

	DynamicPage.MEDIA = {
		PHONE: "sapFDynamicPage-Std-Phone",
		TABLET: "sapFDynamicPage-Std-Tablet",
		DESKTOP: "sapFDynamicPage-Std-Desktop"
	};

	DynamicPage.RESIZE_HANDLER_ID = {
		PAGE: "_sResizeHandlerId",
		TITLE: "_sTitleResizeHandlerId",
		HEADER: "_sHeaderResizeHandlerId",
		CONTENT: "_sContentResizeHandlerId"
	};

	DynamicPage.DIV = "div";
	DynamicPage.HEADER = "header";
	DynamicPage.FOOTER = "footer";

	DynamicPage.SHOW_FOOTER_CLASS_NAME = "sapFDynamicPageActualFooterControlShow";
	DynamicPage.HIDE_FOOTER_CLASS_NAME = "sapFDynamicPageActualFooterControlHide";

	// Class which is added to the DynamicPage if we have additional navigation (e.g. IconTabBar)
	DynamicPage.NAVIGATION_CLASS_NAME = "sapFDynamicPageNavigation";

	/**
	 * LIFECYCLE METHODS
	 */
	DynamicPage.prototype.init = function () {
		this._bPinned = false;
		this._bHeaderInTitleArea = false;
		this._bExpandingWithAClick = false;
		this._bSuppressToggleHeaderOnce = false;
		this._headerBiggerThanAllowedHeight = false;
		this._oStickySubheader = null;
		this._bStickySubheaderInTitleArea = false;
		/* TODO remove after 1.62 version */
		this._bMSBrowser = Device.browser.internet_explorer || Device.browser.edge || false;
		this._oScrollHelper = new ScrollEnablement(this, this.getId() + "-content", {
			horizontal: false,
			vertical: true
		});
		this._oHeaderObserver = null;
		this._oSubHeaderAfterRenderingDelegate = {onAfterRendering: function() {
				this._bStickySubheaderInTitleArea = false; // reset the flag as the stickySubHeader is freshly rerendered with the iconTabBar
				this._adjustStickyContent();
			}};
	};

	DynamicPage.prototype.onBeforeRendering = function () {
		if (!this._preserveHeaderStateOnScroll()) {
			this._attachPinPressHandler();
		}

		this._attachTitlePressHandler();
		this._attachVisualIndicatorsPressHandlers();
		this._attachVisualIndicatorMouseOverHandlers();
		this._attachTitleMouseOverHandlers();
		this._addStickySubheaderAfterRenderingDelegate();
		this._detachScrollHandler();
		this._toggleAdditionalNavigationClass();
	};

	DynamicPage.prototype.onAfterRendering = function () {

		var bShouldSnapWithScroll,
			iCurrentScrollPosition;

		if (this._preserveHeaderStateOnScroll()) {
			// Ensure that in this tick DP and it's aggregations are rendered
			setTimeout(this._overridePreserveHeaderStateOnScroll.bind(this), 0);
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

		if (!this.getHeaderExpanded()) {
			this._snapHeader(false);

			bShouldSnapWithScroll = this.getHeader() && !this.getPreserveHeaderStateOnScroll() && this._canSnapHeaderOnScroll();

			if (bShouldSnapWithScroll) {
				iCurrentScrollPosition = this._getScrollBar().getScrollPosition();
				this._setScrollPosition(iCurrentScrollPosition ? iCurrentScrollPosition : this._getSnappingHeight());
			} else {
				this._toggleHeaderVisibility(false);
				this._moveHeaderToTitleArea();
			}
		}

		this._updateToggleHeaderVisualIndicators();
		this._updateTitleVisualState();
	};

	DynamicPage.prototype.exit = function () {
		this._detachResizeHandlers();
		if (this._oScrollHelper) {
			this._oScrollHelper.destroy();
		}

		if (this._oHeaderObserver) {
			this._oHeaderObserver.disconnect();
		}

		if (this._oStickySubheader) {
			this._oStickySubheader.removeEventDelegate(this._oSubHeaderAfterRenderingDelegate);
		}
	};

	DynamicPage.prototype.setShowFooter = function (bShowFooter) {
		var vResult = this.setProperty("showFooter", bShowFooter, true);

		this._toggleFooter(bShowFooter);

		return vResult;
	};

	DynamicPage.prototype.setHeader = function (oHeader) {
		var oOldHeader;

		if (oHeader === oOldHeader) {
			return;
		}

		oOldHeader = this.getHeader();

		if (oOldHeader) {
			if (this._oHeaderObserver) {
				this._oHeaderObserver.disconnect();
			}
			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER);
			oOldHeader.detachEvent(DynamicPage.EVENTS.PIN_UNPIN_PRESS, this._onPinUnpinButtonPress);
			this._bAlreadyAttachedPinPressHandler = false;
			oOldHeader.detachEvent(DynamicPage.EVENTS.HEADER_VISUAL_INDICATOR_PRESS, this._onCollapseHeaderVisualIndicatorPress);
			this._bAlreadyAttachedHeaderIndicatorPressHandler = false;
			oOldHeader.detachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OVER, this._onVisualIndicatorMouseOver);
			oOldHeader.detachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OUT, this._onVisualIndicatorMouseOut);
			this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler = false;
			this._bAlreadyAttachedHeaderObserver = false;
		}

		this.setAggregation("header", oHeader);

		return this;
	};

	DynamicPage.prototype.setStickySubheaderProvider = function (sStickySubheaderProviderId) {
		var oOldStickySubheaderProvider,
			sOldStickySubheaderProviderId = this.getStickySubheaderProvider();

		if (sStickySubheaderProviderId === sOldStickySubheaderProviderId) {
			return this;
		}

		oOldStickySubheaderProvider = Core.byId(sOldStickySubheaderProviderId);

		if (this._oStickySubheader && oOldStickySubheaderProvider) {
			oOldStickySubheaderProvider._returnStickyContent();
			oOldStickySubheaderProvider._setStickySubheaderSticked(false);
			this._oStickySubheader.removeEventDelegate(this._oSubHeaderAfterRenderingDelegate);
			this._bAlreadyAddedStickySubheaderAfterRenderingDelegate = false;

			this._oStickySubheader = null;
		}

		this.setAssociation("stickySubheaderProvider", sStickySubheaderProviderId);

		return this;
	};

	DynamicPage.prototype.setHeaderExpanded = function (bHeaderExpanded) {
		bHeaderExpanded	= this.validateProperty("headerExpanded", bHeaderExpanded);

		if (this._bPinned) { // operation not allowed
			return this;
		}

		if (this.getHeaderExpanded() === bHeaderExpanded) {
			return this;
		}

		if (this.getDomRef()) {
			this._titleExpandCollapseWhenAllowed();
		}

		this.setProperty("headerExpanded", bHeaderExpanded, true);

		return this;
	};

	DynamicPage.prototype.setToggleHeaderOnTitleClick = function (bToggleHeaderOnTitleClick) {
		var bHeaderExpanded = this.getHeaderExpanded(),
			vResult = this.setProperty("toggleHeaderOnTitleClick", bToggleHeaderOnTitleClick, true);

		bToggleHeaderOnTitleClick = this.getProperty("toggleHeaderOnTitleClick");
		this._updateTitleVisualState();
		this._updateToggleHeaderVisualIndicators();
		this._updateARIAStates(bHeaderExpanded);

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
	 */
	DynamicPage.prototype._overridePreserveHeaderStateOnScroll = function () {
		if (!this._shouldOverridePreserveHeaderStateOnScroll()) {
			this._headerBiggerThanAllowedHeight = false;
			return;
		}

		this._headerBiggerThanAllowedHeight = true;

		//move the header to content
		if (this.getHeaderExpanded()) {
			this._moveHeaderToContentArea(true);
		} else {
			this._adjustSnap(); // moves the snapped header to content if possible
		}
		this._updateScrollBar();
	};

	/**
	 * Determines if the <code>preserveHeaderStateOnScroll</code> should be ignored.
	 * @private
	 * @returns {boolean}
	 */
	DynamicPage.prototype._shouldOverridePreserveHeaderStateOnScroll = function () {
		return this._headerBiggerThanAllowedToBeFixed() && this._preserveHeaderStateOnScroll();
	};

	/**
	 * Hides/shows the footer container.
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleFooter = function (bShow) {
		var oFooter = this.getFooter(),
			bUseAnimations;

		if (!exists(this.$()) || !exists(oFooter) || !exists(this.$footerWrapper)) {
			return;
		}

		bUseAnimations = Core.getConfiguration().getAnimationMode() !== Configuration.AnimationMode.none;
		this._toggleFooterSpacer(bShow);

		if (bUseAnimations) {
			this._toggleFooterAnimation(bShow, oFooter);
		} else {
			this.$footerWrapper.toggleClass("sapUiHidden", !bShow);
		}

		this._updateScrollBar();
	};

	/**
	 * Animates the footer.
	 * @param {boolean} bShow
	 * @param {object} oFooter
	 * @private
	 */
	DynamicPage.prototype._toggleFooterAnimation = function(bShow, oFooter) {

		this.$footerWrapper.bind("webkitAnimationEnd animationend",
		this._onToggleFooterAnimationEnd.bind(this, oFooter));

		if (bShow) {
			this.$footerWrapper.removeClass("sapUiHidden");
		}

		oFooter.toggleStyleClass(DynamicPage.SHOW_FOOTER_CLASS_NAME, bShow);
		oFooter.toggleStyleClass(DynamicPage.HIDE_FOOTER_CLASS_NAME, !bShow);
	};

	/**
	 * Footer animation end handler.
	 * @param {object} oFooter
	 * @private
	 */
	DynamicPage.prototype._onToggleFooterAnimationEnd = function(oFooter) {

		this.$footerWrapper.unbind("webkitAnimationEnd animationend");

		if (oFooter.hasStyleClass(DynamicPage.HIDE_FOOTER_CLASS_NAME)) {
			this.$footerWrapper.addClass("sapUiHidden");
			oFooter.removeStyleClass(DynamicPage.HIDE_FOOTER_CLASS_NAME);
		} else {
			oFooter.removeStyleClass(DynamicPage.SHOW_FOOTER_CLASS_NAME);
		}
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
	 * Toggles header content visibility style depending on the snapped/expanded state to exclude/include it from the tab chain.
	 * @param {boolean} bTabbable
	 * @private
	 */

	DynamicPage.prototype._toggleHeaderInTabChain = function (bTabbable) {
		var oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		if (!exists(oDynamicPageTitle) || !exists(oDynamicPageHeader)) {
			return;
		}

		oDynamicPageHeader.$().css("visibility", bTabbable ? "visible" : "hidden");
	};

	/**
	 * Converts the header to collapsed (snapped) mode.
	 * @param {boolean} bAppendHeaderToContent
	 * @param {boolean} bUserInteraction - indicates if snapping was caused by user interaction (scroll, collapse button press, etc.)
	 * @private
	 */

	DynamicPage.prototype._snapHeader = function (bAppendHeaderToContent, bUserInteraction) {
		var oDynamicPageTitle = this.getTitle();

		if (this._bPinned && !bUserInteraction) {
		   Log.debug("DynamicPage :: aborted snapping, header is pinned", this);
		   return;
		}

		Log.debug("DynamicPage :: snapped header", this);

		if (this._bPinned && bUserInteraction) {
			this._unPin();
			this._togglePinButtonPressedState(false);
		}

		if (exists(oDynamicPageTitle)) {

			oDynamicPageTitle._toggleState(false, bUserInteraction);

			if (bAppendHeaderToContent && this._bHeaderInTitleArea) {
				this._moveHeaderToContentArea(true);
			}
		}

		if (!exists(this.$titleArea)) {
			Log.warning("DynamicPage :: couldn't snap header. There's no title.", this);
			return;
		}

		this.setProperty("headerExpanded", false, true);
		if (this._hasVisibleTitleAndHeader()) {
			this.$titleArea.addClass(Device.system.phone && oDynamicPageTitle.getSnappedTitleOnMobile() ?
					"sapFDynamicPageTitleSnappedTitleOnMobile" : "sapFDynamicPageTitleSnapped");
			this._updateToggleHeaderVisualIndicators();
			this._togglePinButtonVisibility(false);
		}

		this._toggleHeaderInTabChain(false);
		this._updateARIAStates(false);
	};

	/**
	 * Converts the header to expanded mode.
	 * @param {boolean} bAppendHeaderToTitle
	 * @param {boolean} bUserInteraction - indicates if expanding was caused by user interaction (scroll, expand button press, etc.)
	 * @private
	 */
	DynamicPage.prototype._expandHeader = function (bAppendHeaderToTitle, bUserInteraction) {
		var oDynamicPageTitle = this.getTitle();

		Log.debug("DynamicPage :: expand header", this);

		if (exists(oDynamicPageTitle)) {

			oDynamicPageTitle._toggleState(true, bUserInteraction);

			if (bAppendHeaderToTitle) {
				this._moveHeaderToTitleArea(true);
			}
		}

		if (!exists(this.$titleArea)) {
			Log.warning("DynamicPage :: couldn't expand header. There's no title.", this);
			return;
		}

		this.setProperty("headerExpanded", true, true);
		if (this._hasVisibleTitleAndHeader()) {
			this.$titleArea.removeClass(Device.system.phone && oDynamicPageTitle.getSnappedTitleOnMobile() ?
					"sapFDynamicPageTitleSnappedTitleOnMobile" : "sapFDynamicPageTitleSnapped");
			this._updateToggleHeaderVisualIndicators();
			if (!this.getPreserveHeaderStateOnScroll() && !this._headerBiggerThanAllowedToPin()) {
				this._togglePinButtonVisibility(true);
			}
		}

		this._toggleHeaderInTabChain(true);
		this._updateARIAStates(true);
	};

	/**
	 * Toggles the header visibility in such a way, that the page content is pushed down or pulled up.
	 * The method is used, when <code>preserveHeaderStateOnScroll</code> is enabled.
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderVisibility = function (bShow, bUserInteraction) {
		var bExpanded = this.getHeaderExpanded(),
			oDynamicPageTitle = this.getTitle(),
			oDynamicPageHeader = this.getHeader();

		if (this._bPinned && !bUserInteraction) {
			Log.debug("DynamicPage :: header toggle aborted, header is pinned", this);
			return;
		}

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._toggleState(bExpanded);
		}

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().toggleClass("sapFDynamicPageHeaderHidden", !bShow);
			this._updateScrollBar();
		}
	};

	/**
	 * Appends header to content area.
	 * @param {boolean} bOffsetContent - whether to offset the content bellow the newly-added header in order to visually preserve its scroll position
	 * @private
	 */
	DynamicPage.prototype._moveHeaderToContentArea = function (bOffsetContent) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().prependTo(this.$wrapper);
			this._bHeaderInTitleArea = false;
			if (bOffsetContent) {
				this._offsetContentOnMoveHeader();
			}
		}
	};

	/**
	 * Appends header to title area.
	 * @param {boolean} bOffsetContent - whether to offset the scroll position of the content bellow the removed header in order to visually preserve its scroll position
	 * @private
	 */
	DynamicPage.prototype._moveHeaderToTitleArea = function (bOffsetContent) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().prependTo(this.$stickyPlaceholder);
			this._bHeaderInTitleArea = true;
			if (bOffsetContent) {
				this._offsetContentOnMoveHeader();
			}
		}
	};

	/**
	 * Vertically offsets the content to compensate the removal/addition of <code>DynamicPageHeader</code>,
	 * so that the user continues to see the content at the same vertical position
	 * as the user used to before the <code>DynamicPageHeader</code> was added/removed
	 * @private
	 */
	DynamicPage.prototype._offsetContentOnMoveHeader = function () {

		var iOffset = Math.ceil(this._getHeaderHeight()),
			iCurrentScrollPosition = this._getScrollPosition(),
			iCurrentScrollBarPosition = this._getScrollBar().getScrollPosition(),
			iNewScrollPosition;

		if (!iOffset) {
			return;
		}

		// if the user has left the page and iCurrentScrollPosition is 0, we restore the previously scrolled position (if any),
		// using the already saved scroll position of the ScrollBar
		if (!iCurrentScrollPosition && iCurrentScrollBarPosition) {
			iNewScrollPosition = this._getScrollBar().getScrollPosition();
		} else {
			iNewScrollPosition = this._bHeaderInTitleArea ?
			iCurrentScrollPosition - iOffset :
			iCurrentScrollPosition + iOffset;
		}

		iNewScrollPosition = Math.max(iNewScrollPosition, 0);

		this._setScrollPosition(iNewScrollPosition, true /* suppress toggle header on scroll */);
	};

	/**
	 * Pins the header.
	 * @private
	 */
	DynamicPage.prototype._pin = function () {
		var $oDynamicPage = this.$();

		if (this._bPinned) {
			return;
		}

		this._bPinned = true;

		if (!this._bHeaderInTitleArea) {
			this._moveHeaderToTitleArea(true);
			this._updateScrollBar();
		}

		this._updateToggleHeaderVisualIndicators();
		this._togglePinButtonARIAState(this._bPinned);

		if (exists($oDynamicPage)) {
			$oDynamicPage.addClass("sapFDynamicPageHeaderPinned");
		}
	};


	/**
	 * Unpins the header.
	 * @private
	 */
	DynamicPage.prototype._unPin = function () {
		var $oDynamicPage = this.$();

		if (!this._bPinned) {
			return;
		}

		this._bPinned = false;
		this._updateToggleHeaderVisualIndicators();
		this._togglePinButtonARIAState(this._bPinned);

		if (exists($oDynamicPage)) {
			$oDynamicPage.removeClass("sapFDynamicPageHeaderPinned");
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
	 * Determines the current scroll position.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getScrollPosition = function () {
		return exists(this.$wrapper) ? Math.ceil(this.$wrapper.scrollTop()) : 0;
	};

	/**
	 * Sets the appropriate scroll position of the <code>ScrollBar</code> and <code>DynamicPage</code> content wrapper,
	 * based on the used device.
	 * @param {Number} iNewScrollPosition
	 * @param {Number} bSuppressToggleHeader - flag to raise in cases where we only want to adjust the vertical positioning of the visible content, without changing the <code>headerExpanded</code> state of the <code>DynamicPage</code>
	 * @private
	 */
	DynamicPage.prototype._setScrollPosition = function (iNewScrollPosition, bSuppressToggleHeader) {
		if (!exists(this.$wrapper)) {
			return;
		}

		if (this._getScrollPosition() === iNewScrollPosition) { //is already there
			return;
		}

		if (bSuppressToggleHeader) {
			this._bSuppressToggleHeaderOnce = true;
		}

		if (!this.getScrollDelegate()._$Container) {
			// workaround for the problem that the scrollEnablement obtains this reference only after its hook to onAfterRendering of the dynamicPage is called
			this.getScrollDelegate()._$Container = this.$wrapper;
		}
		// we need to scroll via the scrollEnablement
		// in order to let it know of the latest scroll position in the earliest,
		// otherwise it will revert the operation on its own refresh
		this.getScrollDelegate().scrollTo(0, iNewScrollPosition);
	};

	/**
	 * Determines if the header should collapse (snap) on scroll.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldSnapOnScroll = function () {
		return !this._preserveHeaderStateOnScroll() && this._getScrollPosition() >= this._getSnappingHeight()
			&& this.getHeaderExpanded() && !this._bPinned;
	};

	/**
	 * Determines if the header should expand on scroll.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldExpandOnScroll = function () {
		var bIsScrollable = this._needsVerticalScrollBar();

		return !this._preserveHeaderStateOnScroll() && this._getScrollPosition() < this._getSnappingHeight()
			&& !this.getHeaderExpanded() && !this._bPinned && bIsScrollable;
	};

	/**
	 * Determines should the sticky content stick.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldStickStickyContent = function () {
		var bIsInSnappingHeight,
			bShouldNotStick,
			iScrollPosition;

		iScrollPosition = this._getScrollPosition();
		bIsInSnappingHeight = iScrollPosition <= Math.ceil(this._getHeaderHeight()) && !this._bPinned && !this.getPreserveHeaderStateOnScroll();

		// If the scroll position is 0, the sticky content should be always in the DOM of content provider.
		// If the scroll position is <= header height and at all we can use the snapping height (bIsInSnappingHeight)
		// the the sticky content should be in the DOM of content provider.
		bShouldNotStick = iScrollPosition === 0 || bIsInSnappingHeight && this._hasVisibleHeader();

		return !bShouldNotStick;
	};

	/**
	 * Determines if the header is scrolled out completely.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerScrolledOut = function () {
		return this._getScrollPosition() >= this._getSnappingHeight();
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
	 * <code>Note:</code>
	 * For IE and Edge we use 1px threshold,
	 * because the clientHeight returns results in 1px difference compared to the scrollHeight,
	 * the reason is not defined.
	 *
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._canSnapHeaderOnScroll = function () {
		var iMaxScrollPosition = this._getMaxScrollPosition(),
			iThreshold = this._bMSBrowser ? 1 : 0;

		if (this._bHeaderInTitleArea) { // when snapping with scroll, the header will be in the content area
			iMaxScrollPosition += this._getHeaderHeight();
			iMaxScrollPosition -= iThreshold;
		}
		return iMaxScrollPosition > this._getSnappingHeight();
	};

	/**
	 * Determines the appropriate height at which the header can collapse (snap).
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._getSnappingHeight = function () {
			return Math.ceil(this._getHeaderHeight() || this._getTitleHeight());
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
			return $wrapperDom.scrollHeight - $wrapperDom.clientHeight;
		}
		return 0;
	};

	/**
	 * Determines if the control would need a <code>ScrollBar</code>.
	 * <code>Note:</code>
	 * For IE and Edge we use 1px threshold,
	 * because the clientHeight returns results in 1px difference compared to the scrollHeight,
	 * the reason is not defined.
	 *
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._needsVerticalScrollBar = function () {
		var iThreshold = this._bMSBrowser ? 1 : 0;

		return this._getMaxScrollPosition() > iThreshold;
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
		if (!(typeof iControlHeight === "number" && !isNaN(parseInt(iControlHeight)))) {
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

	/*
	 * Determines if the header is larger than allowed to show in the title area on toggle.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._headerBiggerThanAllowedToBeExpandedInTitleArea = function () {
		var iEntireHeaderHeight = this._getEntireHeaderHeight(), // Title + Header
			iDPageHeight = this._getOwnHeight();

		// Return false when DynamicPage is not visible
		if (iDPageHeight === 0) {
			return false;
		}

		return Device.system.phone ? iEntireHeaderHeight >= DynamicPage.HEADER_MAX_ALLOWED_NON_SROLLABLE_ON_MOBILE * iDPageHeight : iEntireHeaderHeight >= iDPageHeight;
	};

	/**
	 * Determines the height that is needed to correctly offset the <code>ScrollBar</code>,
	 * when <code>preserveHeaderStateOnScroll</code> is set to <code>false</code>.
	 * @returns {Number}
	 * @private
	 */
	DynamicPage.prototype._measureScrollBarOffsetHeight = function () {
		var iHeight = 0,
			bSnapped = !this.getHeaderExpanded(),
			bHeaderInTitle = this._bHeaderInTitleArea;

		if (this._preserveHeaderStateOnScroll() || this._bPinned || (!bSnapped && this._bHeaderInTitleArea)) {
			iHeight = this._getTitleAreaHeight();
			Log.debug("DynamicPage :: preserveHeaderState is enabled or header pinned :: title area height" + iHeight, this);
			return iHeight;
		}

		if (bSnapped || !exists(this.getTitle()) || !this._canSnapHeaderOnScroll()) {
			iHeight = this._getTitleHeight();
			Log.debug("DynamicPage :: header snapped :: title height " + iHeight, this);
			return iHeight;
		}

		this._snapHeader(true);

		iHeight = this._getTitleHeight();

		if (!bSnapped) { // restore expanded state
			this._expandHeader(bHeaderInTitle); // restore header position
		}

		Log.debug("DynamicPage :: snapped mode :: title height " + iHeight, this);
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

		if (!Device.system.desktop || !exists(this.$wrapper) || (this._getHeight(this) === 0)) {
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
		}
		setTimeout(this._updateFitContainer.bind(this), 0);
		setTimeout(this._updateScrollBarOffset.bind(this), 0);
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
		var sStyleAttribute = Core.getConfiguration().getRTL() ? "left" : "right",
			iOffsetWidth = this._needsVerticalScrollBar() ? getScrollbarSize().width + "px" : 0,
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

	DynamicPage.prototype._updateTitleARIAState = function (bExpanded) {
		var oDynamicPageTitle = this.getTitle();

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._updateARIAState(bExpanded);
		}
	};

	DynamicPage.prototype._updateARIAStates = function (bExpanded) {
		this._updateHeaderARIAState(bExpanded);
		this._updateTitleARIAState(bExpanded);
	};

	/**
	 * Updates the media size of the control based on its own width, not on the entire screen size (which media query does).
	 * This is necessary, because the control will be embedded in other controls (like the <code>sap.f.FlexibleColumnLayout</code>),
	 * thus it will not be using all of the screen width, but despite that the paddings need to be appropriate.
	 * @param {Number} iWidth - the actual width of the control
	 * @private
	 */
	DynamicPage.prototype._updateMedia = function (iWidth) {
		if (iWidth <= DynamicPage.BREAK_POINTS.PHONE) {
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
	 * Toggles the <code>DynamicPageTitle</code> <code>expandButton</code> aggregation.
	 * @param {boolean} bToggle
	 * @private
	 */
	DynamicPage.prototype._toggleExpandVisualIndicator = function (bToggle) {
		var oDynamicPageTitle = this.getTitle();

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._toggleExpandButton(bToggle);
		}
	};

	/**
	 * Focuses the <code>DynamicPageTitle</code> <code>expandButton</code> aggregation.
	 * @private
	 */
	DynamicPage.prototype._focusExpandVisualIndicator = function () {
		var oDynamicPageTitle = this.getTitle();

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._focusExpandButton();
		}
	};

	/**
	 * Toggles the <code>DynamicPageTitle</code> <code>collapseButton</code> aggregation.
	 * @param {boolean} bToggle
	 * @private
	 */
	DynamicPage.prototype._toggleCollapseVisualIndicator = function (bToggle) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._toggleCollapseButton(bToggle);
		}
	};

	/**
	 * Focuses the <code>DynamicPageTitle</code> <code>collapseButton</code> aggregation.
	 * @private
	 */
	DynamicPage.prototype._focusCollapseVisualIndicator = function () {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._focusCollapseButton();
		}
	};

	/**
	 * Updates the visibility of the <code>expandButton</code> and <code>collapseButton</code>.
	 * @private
	 */
	DynamicPage.prototype._updateToggleHeaderVisualIndicators = function () {
		var bHeaderExpanded,
			bCollapseVisualIndicatorVisible,
			bExpandVisualIndicatorVisible,
			bHasTitleAndHeader = this._hasVisibleTitleAndHeader();

		if (!this.getToggleHeaderOnTitleClick() || !bHasTitleAndHeader) {
			bCollapseVisualIndicatorVisible = false;
			bExpandVisualIndicatorVisible = false;
		} else {
			bHeaderExpanded = this.getHeaderExpanded();
			bCollapseVisualIndicatorVisible = bHeaderExpanded;
			bExpandVisualIndicatorVisible = Device.system.phone && this.getTitle().getAggregation("snappedTitleOnMobile") ? false : !bHeaderExpanded;
		}

		this._toggleCollapseVisualIndicator(bCollapseVisualIndicatorVisible);
		this._toggleExpandVisualIndicator(bExpandVisualIndicatorVisible);
	};

	/**
	 * Updates the visibility of the <code>pinButton</code> and the header scroll state.
	 * @private
	 */
	DynamicPage.prototype._updateHeaderVisualState = function (iPageControlHeight) {
		var oDynamicPageHeader = this.getHeader();

		if (!this._preserveHeaderStateOnScroll() && oDynamicPageHeader) {
			if (this._headerBiggerThanAllowedToPin(iPageControlHeight) || Device.system.phone) {
				this._unPin();
				this._togglePinButtonVisibility(false);
				this._togglePinButtonPressedState(false);
			} else {
				this._togglePinButtonVisibility(true);
			}

			if (this.getHeaderExpanded() && this._bHeaderInTitleArea && this._headerBiggerThanAllowedToBeExpandedInTitleArea()) {
				this._expandHeader(false /* remove header from title area */);
				this._setScrollPosition(0);
			}
		}
	};

	/**
	 * Updates the focus visibility and active state of the <code>title</code>.
	 * @private
	 */
	DynamicPage.prototype._updateTitleVisualState = function () {
		var oTitle = this.getTitle(),
			bTitleActive = this._hasVisibleTitleAndHeader() && this.getToggleHeaderOnTitleClick();

		this.$().toggleClass("sapFDynamicPageTitleClickEnabled", bTitleActive && !Device.system.phone);
		if (exists(oTitle)) {
			oTitle._toggleFocusableState(bTitleActive);
		}
	};

	/**
	 * Scrolls to bring the 'collapse' visual-indicator into view. (The collapse button is part of the scrollable content)
	 * @private
	 */
	DynamicPage.prototype._scrollBellowCollapseVisualIndicator = function () {
		var oHeader = this.getHeader(),
			$collapseButton,
			iCollapseButtonHeight,
			iViewportHeight,
			iOffset;

		if (exists(oHeader)) {
			$collapseButton = this.getHeader()._getCollapseButton().getDomRef();
			iCollapseButtonHeight = $collapseButton.getBoundingClientRect().height;
			iViewportHeight = this.$wrapper[0].getBoundingClientRect().height; // height of the div that contains all the scrollable content

			// compute the amount we need to scroll in order to show the $collapseButton [in the bottom of the viewport]
			iOffset = $collapseButton.offsetTop + iCollapseButtonHeight - iViewportHeight;

			this._setScrollPosition(iOffset);
		}
	};

	/**
	 * Returns <code>true</code> if DynamicPage has <code>title</code> and <code>header</code> aggregations set and they are both visible.
	 * @private
	 */
	DynamicPage.prototype._hasVisibleTitleAndHeader = function () {
		var oTitle = this.getTitle();

		return exists(oTitle) && oTitle.getVisible() && this._hasVisibleHeader();
	};

	/**
	 * Returns <code>true</code> if DynamicPage has <code>header</code> aggregation set and it is visible.
	 * @private
	 */
	DynamicPage.prototype._hasVisibleHeader = function () {
		var oHeader = this.getHeader();

		return exists(oHeader) && oHeader.getVisible() && exists(oHeader.getContent());
	};

	/**
	 * Determines the height of a control safely.
	 * If the control or its DOM reference don't exist, it returns 0,
	 * so it doesn't confuse any calculations based on it.
	 * Otherwise, it returns the DOM element height, using <code>Element.getBoundingClientRect()</code>.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the height of the control
	 */
	DynamicPage.prototype._getHeight = function (oControl) {
		var $ControlDom;

		if (!(oControl instanceof Control)) {
			return 0;
		}

		$ControlDom = oControl.getDomRef();

		return $ControlDom ? $ControlDom.getBoundingClientRect().height : 0;
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
	 * @returns {sap.m.ScrollBar} the "fake" <code>ScrollBar</code>
	 * @private
	 */
	DynamicPage.prototype._getScrollBar = function () {
		if (!exists(this.getAggregation("_scrollBar"))) {
			var oVerticalScrollBar = new ScrollBar(this.getId() + "-vertSB", {
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
		this.$stickyPlaceholder = this.$("stickyPlaceholder");

		this._cacheTitleDom();
		this._cacheHeaderDom();
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

	DynamicPage.prototype._cacheHeaderDom = function () {
		var oHeader = this.getHeader();

		if (exists(oHeader)) {
			this.$header = oHeader.$();
		}
	};

	/**
	 * Toggles between the two possible snapping modes:
	 * (1) snapping with scrolling-out the header - when enough content is available to allow snap header on scroll
	 * (2) snapping with hiding the header - when not enough content is available to allow snap header on scroll
	 * @private
	 */
	DynamicPage.prototype._adjustSnap = function () {
		var oDynamicPageHeader,
			bIsSnapped,
			bCanSnapWithScroll,
			bIsSnappedWithoutScroll,
			iScrollPosition,
			iSnappingHeight,
			$oDPage = this.$();

		if (!exists($oDPage)) {
			return;
		}

		if (!hasDOMElementSize($oDPage[0])) {
			return;
		}

		oDynamicPageHeader = this.getHeader();
		bIsSnapped = !this.getHeaderExpanded();

		if (!oDynamicPageHeader || !bIsSnapped) {
			return; //no adjustment needed
		}

		bCanSnapWithScroll = !this._preserveHeaderStateOnScroll() && this._canSnapHeaderOnScroll();
		bIsSnappedWithoutScroll = bIsSnapped && oDynamicPageHeader.$().hasClass("sapFDynamicPageHeaderHidden");

		if (bCanSnapWithScroll
			&& bIsSnappedWithoutScroll) {

			// switch to snapping *with* scroll
			this._toggleHeaderVisibility(true);
			this._moveHeaderToContentArea(true);
			return;
		}

		if (!bCanSnapWithScroll
			&& !bIsSnappedWithoutScroll) {

			// switch to snapping *without* scroll
			this._moveHeaderToTitleArea(true);
			this._toggleHeaderVisibility(false);
			return;
		}

		if (bCanSnapWithScroll) {
			iScrollPosition = this._getScrollPosition();
			iSnappingHeight = this._getSnappingHeight();
			// if the latest resize caused *change in the snap breakpoint value*
			// => make sure the current scroll position is still valid
			if (iScrollPosition < iSnappingHeight) {
				// the snapped header should remain scrolled-out of view
				this._setScrollPosition(iSnappingHeight);
			}
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
	 *
	 * <b>Note:</b> In case <code>DynamicPageTitle</code> or <code>DynamicPageHeader</code> is re-rendered,
	 * their DOM references and resize handlers should be also updated.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onChildControlAfterRendering = function (oEvent) {
		var oSourceControl = oEvent.srcControl;

		if (oSourceControl instanceof DynamicPageTitle) {
			this._cacheTitleDom();
			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE);
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.TITLE, this.$title[0], this._onChildControlsHeightChange.bind(this));
		} else if (oSourceControl instanceof DynamicPageHeader) {
			this._cacheHeaderDom();
			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER);
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER, this.$header[0], this._onChildControlsHeightChange.bind(this));
		}

		setTimeout(this._updateScrollBar.bind(this), 0);
	};

	/**
	 * Reacts when the aggregated child controls change their height
	 * in order to adjust the update the <code>ScrollBar</code>.
	 * @private
	 */
	DynamicPage.prototype._onChildControlsHeightChange = function (oEvent) {
		var bNeedsVerticalScrollBar = this._needsVerticalScrollBar(),
			oHeader = this.getHeader();

		// FitContainer needs to be updated, when height is changed and scroll bar appear, to enable calc of original height
		if (bNeedsVerticalScrollBar) {
			this._updateFitContainer(bNeedsVerticalScrollBar);
		}

		this._adjustSnap();

		if (!this._bExpandingWithAClick) {
			this._updateScrollBar();
		}

		this._bExpandingWithAClick = false;

		if (oHeader && oEvent.target.id === oHeader.getId()) {
			this._updateHeaderVisualState();
		}
	};

	/**
	 * Handles the resize event of the <code>DynamicPage</code>.
	 * Unpins the header when its size threshold has been reached and updates the "fake" <code>ScrollBar</code> height.
	 * Adjusts the expanded/collapsed state.
	 * Triggers the <code>resize</code> handler of the <code>DynamicPageTitle</code>.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onResize = function (oEvent) {
		var oDynamicPageTitle = this.getTitle(),
			iCurrentWidth = oEvent.size.width;

		this._updateHeaderVisualState(oEvent.size.height);

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._onResize(iCurrentWidth);
		}

		this._adjustSnap();
		this._updateScrollBar();
		this._updateMedia(iCurrentWidth);
	};

	/**
	 * Handles the scrolling on the content.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onWrapperScroll = function (oEvent) {
		var iScrollTop = Math.max(oEvent.target.scrollTop, 0);

		if (Device.system.desktop) {
			if (this.allowCustomScroll === true) {
				this.allowCustomScroll = false;
				return;
			}

			this.allowInnerDiv = true;
			this._getScrollBar().setScrollPosition(iScrollTop);
			this.toggleStyleClass("sapFDynamicPageWithScroll", this._needsVerticalScrollBar());
		}
	};

	/**
	 * Switches between expanded/collapsed (snapped) modes.
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderOnScroll = function () {
		this._adjustStickyContent();

		if (this._bSuppressToggleHeaderOnce) {
			this._bSuppressToggleHeaderOnce = false;
			return;
		}
		if (Device.system.desktop && this._bExpandingWithAClick) {
			return;
		}

		if (this._preserveHeaderStateOnScroll()) {
			return;
		}

		if (this._shouldSnapOnScroll()) {
			this._snapHeader(true, true /* bUserInteraction */);

		} else if (this._shouldExpandOnScroll()) {
			this._expandHeader(false, true /* bUserInteraction */);
			this._toggleHeaderVisibility(true);

		} else if (!this._bPinned && this._bHeaderInTitleArea) {
			var bDoOffsetContent = (this._getScrollPosition() >= this._getSnappingHeight()); // do not offset if the scroll is transferring between expanded-header-in-title to expanded-header-in-content
			this._moveHeaderToContentArea(bDoOffsetContent);
		}
	};

	/**
	 * Moves the sticky content in the sticky area or in the DOM of its provider.
	 * @private
	 */
	DynamicPage.prototype._adjustStickyContent = function () {
		if (!this._oStickySubheader) {
			return;
		}

		var oLastFocusedElement,
			bShouldStick = this._shouldStickStickyContent(),
			oStickySubheaderProvider,
			sStickySubheaderProviderId = this.getStickySubheaderProvider();

		if (bShouldStick === this._bStickySubheaderInTitleArea) {
			return;
		}

		oStickySubheaderProvider = Core.byId(sStickySubheaderProviderId);

		if (!exists(oStickySubheaderProvider)) {
			return;
		}

		oLastFocusedElement = document.activeElement;
		oStickySubheaderProvider._setStickySubheaderSticked(bShouldStick);

		if (bShouldStick) {
			this._oStickySubheader.$().appendTo(this.$stickyPlaceholder);
		} else {
			oStickySubheaderProvider._returnStickyContent();
		}

		oLastFocusedElement.focus();
		this._bStickySubheaderInTitleArea = bShouldStick;
	};

	/**
	 * Handles the scrolling on the "fake" <code>ScrollBar</code>.
	 * @private
	 */
	DynamicPage.prototype._onScrollBarScroll = function () {
		if (this.allowInnerDiv === true) {
			this.allowInnerDiv = false;
			return;
		}

		this.allowCustomScroll = true;
		this._setScrollPosition(this._getScrollBar().getScrollPosition());
	};

	/**
	 * Handles the title press event and prevents the collapse/expand, if necessary
	 * @private
	 */
	DynamicPage.prototype._onTitlePress = function () {
		if (this.getToggleHeaderOnTitleClick() && this._hasVisibleTitleAndHeader()) {
			this._titleExpandCollapseWhenAllowed(true /* user interaction */);
			this.getTitle()._focus();
		}
	};

	DynamicPage.prototype._onExpandHeaderVisualIndicatorPress = function () {
		this._onTitlePress();
		if (this._headerBiggerThanAllowedToBeExpandedInTitleArea()) {
			// scroll to show the 'collapse' visual-indicator before focusing it
			// this is needed in order to specify the **exact** position (scrollTop) of the visual-indicator
			// because the default position (from the browser default auto-scroll to newly-focused item) is not UX-compliant
			this._scrollBellowCollapseVisualIndicator();
		}
		this._focusCollapseVisualIndicator();
	};

	DynamicPage.prototype._onCollapseHeaderVisualIndicatorPress = function () {
		this._onTitlePress();
		this._focusExpandVisualIndicator();
	};

	DynamicPage.prototype._onVisualIndicatorMouseOver = function() {
		var $oDynamicPage = this.$();

		if (exists($oDynamicPage)) {
			$oDynamicPage.addClass("sapFDynamicPageTitleForceHovered");
		}
	};

	DynamicPage.prototype._onVisualIndicatorMouseOut = function () {
		var $oDynamicPage = this.$();

		if (exists($oDynamicPage)) {
			$oDynamicPage.removeClass("sapFDynamicPageTitleForceHovered");
		}
	};

	DynamicPage.prototype._onTitleMouseOver = DynamicPage.prototype._onVisualIndicatorMouseOver;
	DynamicPage.prototype._onTitleMouseOut = DynamicPage.prototype._onVisualIndicatorMouseOut;

	/**
	 * Еxpands/collapses the header when allowed to do so by the internal rules of the <code>DynamicPage</code>.
	 * @param {boolean} bUserInteraction - indicates if title expand/collapse was caused by user interaction (scroll, collapse button press, etc.)
	 * @private
	 */
	DynamicPage.prototype._titleExpandCollapseWhenAllowed = function (bUserInteraction) {
		var bAllowAppendHeaderToTitle;

		if (this._bPinned && !bUserInteraction) { // operation not allowed
			return this;
		}

		// Header scrolling is not allowed or there is no enough content scroll bar to appear
		if (this._preserveHeaderStateOnScroll() || !this._canSnapHeaderOnScroll() || !this.getHeader()) {
			if (!this.getHeaderExpanded()) {
				// Show header, pushing the content down
				this._expandHeader(false, bUserInteraction);
				this._toggleHeaderVisibility(true, bUserInteraction);
			} else {
				// Hide header, pulling the content up
				this._snapHeader(false, bUserInteraction);
				this._toggleHeaderVisibility(false, bUserInteraction);
			}

		} else if (!this.getHeaderExpanded()) {
			// Header is already snapped, then expand
			bAllowAppendHeaderToTitle = !this._headerBiggerThanAllowedToBeExpandedInTitleArea();
			this._bExpandingWithAClick = true;
			this._expandHeader(bAllowAppendHeaderToTitle, bUserInteraction);
			this.getHeader().$().removeClass("sapFDynamicPageHeaderHidden");
			if (!bAllowAppendHeaderToTitle) {
				this._setScrollPosition(0);
			}
			this._bExpandingWithAClick = false;

		} else { //should snap
			var bMoveHeaderToContent = this._bHeaderInTitleArea;
			this._snapHeader(bMoveHeaderToContent, bUserInteraction);
			if (!bMoveHeaderToContent) {
				this._setScrollPosition(this._getSnappingHeight());
			}
		}
	};

	/**
	 * Handles the pin/unpin button press event, which results in the pinning/unpinning of the <code>DynamicPageHeader</code>.
	 * @private
	 */
	DynamicPage.prototype._onPinUnpinButtonPress = function () {
		if (this._bPinned) {
			this._unPin();
		} else {
			this._pin();
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

		if (exists(this.$header)) {
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER, this.$header[0], fnChildControlSizeChangeHandler);
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
		this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER);
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
			oHeader = this.getHeader(),
			oContent = this.getContent(),
			oPageChildrenAfterRenderingDelegate = {onAfterRendering: this._onChildControlAfterRendering.bind(this)};

		if (exists(oTitle)) {
			oTitle.addEventDelegate(oPageChildrenAfterRenderingDelegate);
		}

		if (exists(oContent)) {
			oContent.addEventDelegate(oPageChildrenAfterRenderingDelegate);
		}

		if (exists(oHeader)) {
			oHeader.addEventDelegate(oPageChildrenAfterRenderingDelegate);
		}
	};

	/**
	 * Attaches handler to the <code>DynamicPageTitle</code> <code>press</code> event.
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
	 * Attaches handler to the <code>DynamicPageHeader</code> pin/unpin button <code>press</code> event.
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
	 * Attaches observer to the <code>DynamicPageHeader</code> visible property.
	 * @private
	 */
	DynamicPage.prototype._attachHeaderObserver = function () {
		var oHeader = this.getHeader();

		if (exists(oHeader) && !this._bAlreadyAttachedHeaderObserver) {
			if (!this._oHeaderObserver) {
				this._oHeaderObserver = new ManagedObjectObserver(this._adjustStickyContent.bind(this));
			}

			this._oHeaderObserver.observe(oHeader, {properties: ["visible"]});

			this._bAlreadyAttachedHeaderObserver = true;
		}
	};

	/**
	 * Attaches handlers to <code>DynamicPageTitle</code> and <DynamicPageHeader</> visual indicators` <code>press</code> events.
	 * @private
	 */
	DynamicPage.prototype._attachVisualIndicatorsPressHandlers = function () {
		var oTitle = this.getTitle(),
			oHeader = this.getHeader();

		if (exists(oTitle) && !this._bAlreadyAttachedTitleIndicatorPressHandler) {
			oTitle.attachEvent(DynamicPage.EVENTS.TITLE_VISUAL_INDICATOR_PRESS, this._onExpandHeaderVisualIndicatorPress, this);
			this._bAlreadyAttachedTitleIndicatorPressHandler = true;
		}

		if (exists(oHeader) && !this._bAlreadyAttachedHeaderIndicatorPressHandler) {
			oHeader.attachEvent(DynamicPage.EVENTS.HEADER_VISUAL_INDICATOR_PRESS, this._onCollapseHeaderVisualIndicatorPress, this);
			this._bAlreadyAttachedHeaderIndicatorPressHandler = true;
		}
	};

	/**
	 * Adds event delegate to <code>DynamicPage</code> content to know when it is rendered.
	 * @private
	 */

	DynamicPage.prototype._addStickySubheaderAfterRenderingDelegate = function () {
		var oStickySubheaderProvider,
			sStickySubheaderProviderId = this.getStickySubheaderProvider(),
			bIsInInterface;

		oStickySubheaderProvider = Core.byId(sStickySubheaderProviderId);

		if (exists(oStickySubheaderProvider) && !this._bAlreadyAddedStickySubheaderAfterRenderingDelegate) {
			bIsInInterface = oStickySubheaderProvider.getMetadata()
				.getInterfaces()
				.indexOf("sap.f.IDynamicPageStickyContent") !== -1;

			if (bIsInInterface) {
				this._oStickySubheader = oStickySubheaderProvider._getStickyContent();

				this._oStickySubheader.addEventDelegate(this._oSubHeaderAfterRenderingDelegate, this);

				this._bAlreadyAddedStickySubheaderAfterRenderingDelegate = true;
				this._attachHeaderObserver();
			}
		}
	};

	/**
	 * Attaches handlers to  <code>DynamicPageHeader</code> visual indicators` <code>mouseover</code> and <code>mouseout</code> events.
	 *
	 * <b>Note:</b> No need to attach for <code>DynamicPageTitle</code> visual indicator <code>mouseover</code> and <code>mouseout</code> events,
	 * as being part of the <code>DynamicPageTitle</code>,
	 * the visual indicator produces <code>mouseover</code> and <code>mouseout</code> events on the <code>DynamicPageTitle</code> by default.
	 * @private
	 */
	DynamicPage.prototype._attachVisualIndicatorMouseOverHandlers = function () {
		var oHeader = this.getHeader();

		if (exists(oHeader) && !this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler) {
			oHeader.attachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OVER, this._onVisualIndicatorMouseOver, this);
			oHeader.attachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OUT, this._onVisualIndicatorMouseOut, this);
			this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler = true;
		}
	};

	/**
	 * Attaches handlers to <code>DynamicPageTitle</code> <code>mouseover</code> and <code>mouseout</code> events.
	 * @private
	 */
	DynamicPage.prototype._attachTitleMouseOverHandlers = function () {
		var oTitle = this.getTitle();

		if (exists(oTitle) && !this._bAlreadyAttachedTitleMouseOverOutHandler) {
			oTitle.attachEvent(DynamicPage.EVENTS.TITLE_MOUSE_OVER, this._onTitleMouseOver, this);
			oTitle.attachEvent(DynamicPage.EVENTS.TITLE_MOUSE_OUT, this._onTitleMouseOut, this);
			this._bAlreadyAttachedTitleMouseOverOutHandler = true;
		}
	};

	/**
	 * Attaches the <code>DynamicPage</code> content scroll handler.
	 * @private
	 */
	DynamicPage.prototype._attachScrollHandler = function () {
		this._onWrapperScrollReference = this._onWrapperScroll.bind(this);
		this._toggleHeaderOnScrollReference = this._toggleHeaderOnScroll.bind(this);

		this.$wrapper.on("scroll", this._onWrapperScrollReference);
		this.$wrapper.on("scroll", this._toggleHeaderOnScrollReference);
	};

	/**
	 * Toggles the <code>sapFDynamicPageNavigation</code> CSS class depending on the
	 * <code>StickySubheaderProvider</code> existence.
	 * @private
	 */
	DynamicPage.prototype._toggleAdditionalNavigationClass = function() {
		var bShow = this._bStickySubheaderProviderExists();

		this.toggleStyleClass(DynamicPage.NAVIGATION_CLASS_NAME, bShow);
	};

	/**
	 * Checks whether or not the <code>StickySubheaderProvider</code> is available.
	 * @returns {boolean} Whether the <code>StickySubheaderProvider</code> exists
	 * @private
	 */
	DynamicPage.prototype._bStickySubheaderProviderExists = function() {
		var oSticky = Core.byId(this.getStickySubheaderProvider());
		return !!oSticky && oSticky.isA("sap.f.IDynamicPageStickyContent");
	};

	/**
	 * Detaches the <code>DynamicPage</code> content scroll handler.
	 * @private
	 */
	DynamicPage.prototype._detachScrollHandler = function () {
		if (this.$wrapper) {
			this.$wrapper.off("scroll", this._onWrapperScrollReference);
			this.$wrapper.off("scroll", this._toggleHeaderOnScrollReference);
		}
	};

	/**
	 * Formats <code>DynamicPageAccessibleLandmarkInfo</code> role and label of the provided <code>DynamicPage</code> part.
	 *
	 * @param {sap.f.DynamicPageAccessibleLandmarkInfo} oLandmarkInfo DynamicPage LandmarkInfo
	 * @param {string} sPartName part of the page
	 * @returns {sap.f.DynamicPageAccessibleLandmarkInfo} The formatted landmark info
	 * @private
	 */
	DynamicPage.prototype._formatLandmarkInfo = function (oLandmarkInfo, sPartName) {
		if (oLandmarkInfo) {
			var sRole = oLandmarkInfo["get" + sPartName + "Role"]() || "",
				sLabel = oLandmarkInfo["get" + sPartName + "Label"]() || "";

			if (sRole === AccessibleLandmarkRole.None) {
				sRole = '';
			}

			return {
				role: sRole.toLowerCase(),
				label: sLabel
			};
		}

		return {};
	};

	/**
	 * Returns HTML tag of the page header.
	 *
	 * @param {sap.f.DynamicPageAccessibleLandmarkInfo} oLandmarkInfo DynamicPage LandmarkInfo
	 * @returns {string} The HTML tag of the page header.
	 * @private
	 */
	DynamicPage.prototype._getHeaderTag = function (oLandmarkInfo) {
		if (oLandmarkInfo && oLandmarkInfo.getHeaderRole() !== AccessibleLandmarkRole.None) {
			return DynamicPage.DIV;
		}

		return DynamicPage.HEADER;
	};

	/**
	 * Returns HTML tag of the page footer.
	 *
	 * @param {sap.f.DynamicPageAccessibleLandmarkInfo} oLandmarkInfo DynamicPage LandmarkInfo
	 * @returns {string} The HTML tag of the page footer.
	 * @private
	 */
	DynamicPage.prototype._getFooterTag = function (oLandmarkInfo) {
		if (oLandmarkInfo && oLandmarkInfo.getFooterRole() !== AccessibleLandmarkRole.None) {
			return DynamicPage.DIV;
		}

		return DynamicPage.FOOTER;
	};

	return DynamicPage;

});
