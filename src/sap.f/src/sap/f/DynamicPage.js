/*!
 * ${copyright}
 */

// Provides control sap.f.DynamicPage.
sap.ui.define([
	"./library",
	"sap/base/i18n/Localization",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/Control",
	"sap/ui/core/ControlBehavior",
	"sap/m/library",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/InvisibleText",
	"sap/ui/core/delegate/ScrollEnablement",
	"sap/ui/Device",
	"sap/ui/base/ManagedObject",
	"sap/ui/dom/getScrollbarSize",
	"sap/f/DynamicPageTitle",
	"sap/f/DynamicPageHeader",
	"./DynamicPageRenderer",
	"sap/base/Log",
	'sap/ui/dom/units/Rem',
	"sap/ui/core/library"
], function(
	library,
	Localization,
	AnimationMode,
	Control,
	ControlBehavior,
	mLibrary,
	ManagedObjectObserver,
	Element,
	Library,
	ResizeHandler,
	InvisibleText,
	ScrollEnablement,
	Device,
	ManagedObject,
	getScrollbarSize,
	DynamicPageTitle,
	DynamicPageHeader,
	DynamicPageRenderer,
	Log,
	DomUnitsRem,
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
				 * Determines whether the <code>DynamicPageHeader</code> is pinned.
				 *
				 * The property can be changed programmatically or in the occurrence of
				 * the following user interactions:
				 * <ul>
				 * <li>Toggling the pin/unpin button of <code>DynamicPageHeader</code></li>
				 * <li>Snapping the <code>DynamicPageHeader</code> by explicitly clicking on the <code>DynamicPageTitle</code></li>
				 * </ul>
				 *
				 * <b>Note: </b> The property will only apply if the header is effectively pinnable, i.e. if the following conditions are met:
				 * <ul>
				 * <li><code>DynamicPageHeader</code> <code>pinnable</code> property is <code>true</code></li>
				 * <li><code>DynamicPageHeader</code> is expanded</li>
				 * <li><code>DynamicPage</code> <code>preserveHeaderStateOnScroll</code> property is effectively disabled</li>
				 * </ul>
				 *
				 * @since 1.93
				 */
				 headerPinned: {type: "boolean", group: "Behavior", defaultValue: false},

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
				 * Forces the content container of the <code>DynamicPage</code> to make room for
				 * stretchable controls in the <code>content</code> aggregation to fill exactly
				 * the visible space between the header and the footer.
				 *
				 * <b>Notes:</b>
				 * <ul>
				 * <li>Enable this property only if the control of the <code>content</code> aggregation is configured
				 * to automatically stretch to fill the available height, which means that the content would appear
				 * squashed in height when this property is disabled. Such stretchable controls may be
				 * {@link sap.ui.table.Table} and {@link sap.ui.table.AnalyticalTable} depending on their settings.</li>
				 * <li>It is not recommended to enable this property for controls that do not stretch in
				 * height (and appear properly when this property is disabled).</li>
				 * </ul>
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
				landmarkInfo : {type : "sap.f.DynamicPageAccessibleLandmarkInfo", multiple : false}
			},
			events: {

				/**
				 * The event is fired when the <code>headerPinned</code> property is changed via user interaction.
				 *
				 * @since 1.93
				 */
				pinnedStateChange: {
					parameters: {

						/**
						 * False or True values indicate the new pinned property value.
						 */
						pinned: {type: "boolean"}
					}
				}
			},
			dnd: { draggable: false, droppable: true },
			designtime: "sap/f/designtime/DynamicPage.designtime"
		},

		renderer: DynamicPageRenderer
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

	DynamicPage.MEDIA_RANGESET_NAME = "DynamicPageRangeSet";

	DynamicPage.BREAK_POINTS = {
		DESKTOP: 1439,
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
		DESKTOP: "sapFDynamicPage-Std-Desktop",
		DESKTOP_XL: "sapFDynamicPage-Std-Desktop-XL"
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

	// Synced with @_sap_f_DynamicPageHeader_PaddingBottom in base less file of DynamicPageHeader
	DynamicPage.HEADER_CONTENT_PADDING_BOTTOM = DomUnitsRem.toPx("1rem");

	DynamicPage.SHOW_FOOTER_CLASS_NAME = "sapFDynamicPageActualFooterControlShow";
	DynamicPage.HIDE_FOOTER_CLASS_NAME = "sapFDynamicPageActualFooterControlHide";

	// Class which is added to the DynamicPage if we have additional navigation (e.g. IconTabBar)
	DynamicPage.NAVIGATION_CLASS_NAME = "sapFDynamicPageNavigation";

	DynamicPage.ARIA_ROLE_DESCRIPTION = "DYNAMIC_PAGE_ROLE_DESCRIPTION";
	DynamicPage.ARIA_LABEL_TOOLBAR_FOOTER_ACTIONS = "ARIA_LABEL_TOOLBAR_FOOTER_ACTIONS";

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
		this._oScrollHelper = new ScrollEnablement(this, this.getId() + "-content", {
			horizontal: false,
			vertical: true
		});
		this._oStickyHeaderObserver = null;
		this._oHeaderObserver = null;
		this._oTitleObserver = null;
		this._oSubHeaderAfterRenderingDelegate = {onAfterRendering: function() {
				this._bStickySubheaderInTitleArea = false; // reset the flag as the stickySubHeader is freshly rerendered with the iconTabBar
				this._cacheDomElements();
				this._adjustStickyContent();
			}};

		this._setAriaRoleDescription(Library.getResourceBundleFor("sap.f").getText(DynamicPage.ARIA_ROLE_DESCRIPTION));
		this._initRangeSet();
		this._attachMediaContainerWidthChange(this._onMediaRangeChange,
			this, DynamicPage.MEDIA_RANGESET_NAME);
	};

	DynamicPage.prototype.onBeforeRendering = function () {
		if (!this._preserveHeaderStateOnScroll()) {
			this._attachPinPressHandler();
		}

		this._attachTitlePressHandler();
		this._attachVisualIndicatorsPressHandlers();
		if (Device.system.desktop) {
			this._attachVisualIndicatorMouseOverHandlers();
			this._attachTitleMouseOverHandlers();
		}
		this._attachHeaderObserver();
		this._attachTitleObserver();
		this._addStickySubheaderAfterRenderingDelegate();
		this._detachScrollHandler();
		this._detachResizeHandlers();
		this._toggleAdditionalNavigationClass();
		this._setFooterAriaLabelledBy();
	};

	DynamicPage.prototype.onAfterRendering = function () {

		var bShouldSnapWithScroll,
			iCurrentScrollPosition,
			oHeader = this.getHeader();

		if (this.getPreserveHeaderStateOnScroll()) {
			// Ensure that in this tick DP and it's aggregations are rendered
			setTimeout(this._overridePreserveHeaderStateOnScroll.bind(this), 0);
		}

		this._cacheDomElements();
		this._attachResizeHandlers();
		this._updateMedia(this._getWidth(this));
		this._attachScrollHandler();
		this._updateTitlePositioning();
		this._attachPageChildrenAfterRenderingDelegates();
		this._updatePinButtonState();
		this._showHidePinButton();

		if (!this.getHeaderExpanded()) {
			this._snapHeader(false);

			bShouldSnapWithScroll = this.getHeader() && !this.getPreserveHeaderStateOnScroll() && this._canSnapHeaderOnScroll();

			if (bShouldSnapWithScroll) {
				iCurrentScrollPosition = this.$wrapper.scrollTop();
				this._setScrollPosition(iCurrentScrollPosition ? iCurrentScrollPosition : this._getSnappingHeight());
			} else {
				this._toggleHeaderVisibility(false);
				this._moveHeaderToTitleArea();
			}
		}

		this._updateToggleHeaderVisualIndicators();
		this._updateTitleVisualState();

		if (exists(oHeader) && oHeader._setLandmarkInfo) {
			oHeader._setLandmarkInfo(this.getLandmarkInfo());
		}
	};

	DynamicPage.prototype.exit = function () {
		this._detachResizeHandlers();
		if (this._oScrollHelper) {
			this._oScrollHelper.destroy();
		}

		if (this._oStickyHeaderObserver) {
			this._oStickyHeaderObserver.disconnect();
		}

		if (this._oHeaderObserver) {
			this._oHeaderObserver.disconnect();
		}

		if (this._oTitleObserver) {
			this._oTitleObserver.disconnect();
		}

		if (this._oStickySubheader) {
			this._oStickySubheader.removeEventDelegate(this._oSubHeaderAfterRenderingDelegate);
		}

		this._destroyInvisibleText();
	};

	DynamicPage.prototype.setShowFooter = function (bShowFooter) {
		var vResult = this.setProperty("showFooter", bShowFooter, /* bSuppressInvalidate */ true);

		this._toggleFooter(bShowFooter);

		return vResult;
	};

	DynamicPage.prototype.setHeader = function (oHeader) {
		var oOldHeader = this.getHeader();

		if (oHeader === oOldHeader) {
			return this;
		}

		this._detachHeaderEventListeners();

		return this.setAggregation("header", oHeader);
	};

	DynamicPage.prototype.destroyHeader = function () {
		this._detachHeaderEventListeners();

		return this.destroyAggregation("header");
	};

	DynamicPage.prototype.destroyFooter = function () {
		this._destroyInvisibleText();

		return this.destroyAggregation("footer");
	};

	DynamicPage.prototype._detachHeaderEventListeners = function () {
		var oHeader = this.getHeader();

		if (oHeader) {
			if (this._oStickyHeaderObserver) {
				this._oStickyHeaderObserver.disconnect();
			}

			if (this._oHeaderObserver) {
				this._oHeaderObserver.disconnect();
			}

			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER);
			oHeader.detachEvent(DynamicPage.EVENTS.PIN_UNPIN_PRESS, this._onPinUnpinButtonPress);
			this._bAlreadyAttachedPinPressHandler = false;
			oHeader.detachEvent(DynamicPage.EVENTS.HEADER_VISUAL_INDICATOR_PRESS, this._onCollapseHeaderVisualIndicatorPress);
			this._bAlreadyAttachedHeaderIndicatorPressHandler = false;
			oHeader.detachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OVER, this._onVisualIndicatorMouseOver);
			oHeader.detachEvent(DynamicPage.EVENTS.VISUAL_INDICATOR_MOUSE_OUT, this._onVisualIndicatorMouseOut);
			this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler = false;
			this._bAlreadyAttachedStickyHeaderObserver = false;
			this._bAlreadyAttachedHeaderObserver = false;
		}
	};

	DynamicPage.prototype.setStickySubheaderProvider = function (sStickySubheaderProviderId) {
		var oOldStickySubheaderProvider,
			sOldStickySubheaderProviderId = this.getStickySubheaderProvider();

		if (sStickySubheaderProviderId === sOldStickySubheaderProviderId) {
			return this;
		}

		oOldStickySubheaderProvider = Element.getElementById(sOldStickySubheaderProviderId);

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

		this._updatePinButtonState();

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
			this._toggleScrollingStyles();
		}

		return vResult;
	};

	/**
	 * Returns the <code>sap.ui.core.delegate.ScrollEnablement</code> delegate which is used with this control.
	 *
	 * @public
	 * @returns {sap.ui.core.delegate.ScrollEnablement} The scroll delegate instance
	 */
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
		if (this.$().width() === 0 || this.$().height() === 0) {
			return;
		}

		var bOldValue = this._headerBiggerThanAllowedHeight, bChange;

		this._headerBiggerThanAllowedHeight = this._headerBiggerThanAllowedToBeFixed();
		bChange = bOldValue !== this._headerBiggerThanAllowedHeight;

		if (!this._headerBiggerThanAllowedHeight || !bChange) {
			return;
		}
		//move the header to content
		if (this.getHeaderExpanded()) {
			this._moveHeaderToContentArea();
		} else {
			this._adjustSnap(); // moves the snapped header to content if possible
		}
		this._updateTitlePositioning();
	};

	/**
	 * Hides/shows the footer container.
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleFooter = function (bShow) {
		var oFooter = this.getFooter(),
			bUseAnimations, sAnimationMode;

		if (!exists(this.$()) || !exists(oFooter) || !exists(this.$footerWrapper)) {
			return;
		}

		sAnimationMode = ControlBehavior.getAnimationMode();
		bUseAnimations = sAnimationMode !== AnimationMode.none && sAnimationMode !== AnimationMode.minimal;

		if (exists(this.$contentFitContainer)) {
			this.$contentFitContainer.toggleClass("sapFDynamicPageContentFitContainerFooterVisible", bShow);
		}

		this.$().toggleClass("sapFDynamicPageFooterVisible", bShow);

		if (bUseAnimations) {
			this._toggleFooterAnimation(bShow, oFooter);
		} else {
			this.$footerWrapper.toggleClass("sapUiHidden", !bShow);
		}

		this._updateTitlePositioning();
	};

	/**
	 * Animates the footer.
	 * @param {boolean} bShow
	 * @param {object} oFooter
	 * @private
	 */
	DynamicPage.prototype._toggleFooterAnimation = function(bShow, oFooter) {

		this.$footerWrapper.on("webkitAnimationEnd animationend",
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

		this.$footerWrapper.off("webkitAnimationEnd animationend");

		if (oFooter.hasStyleClass(DynamicPage.HIDE_FOOTER_CLASS_NAME)) {
			this.$footerWrapper.addClass("sapUiHidden");
			oFooter.removeStyleClass(DynamicPage.HIDE_FOOTER_CLASS_NAME);
		} else {
			oFooter.removeStyleClass(DynamicPage.SHOW_FOOTER_CLASS_NAME);
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

		// ensure constant header height while the header is hidden in the scroll overflow
		// in order to avoid unnecessary jumps of the scroll position
		// due to reflow of the header content while in the scroll overflow
		oDynamicPageHeader.$().css("height", bTabbable ? "" : this._getHeaderHeight() + "px");
		oDynamicPageHeader.$().css("overflow", bTabbable ? "" : "hidden");
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
			this._unPin(bUserInteraction);
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
		this._adjustStickyContent();
		if (this._hasVisibleTitleAndHeader()) {
			this.$titleArea.addClass(Device.system.phone && oDynamicPageTitle.getSnappedTitleOnMobile() ?
					"sapFDynamicPageTitleSnappedTitleOnMobile" : "sapFDynamicPageTitleSnapped");
			this._updateToggleHeaderVisualIndicators();
			this._togglePinButtonVisibility(false);
			this._updateTitlePositioning();
		}

		this._toggleHeaderInTabChain(false);
		this._updateARIAStates(false);
		this._toggleHeaderBackground(true);
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
		this._adjustStickyContent();
		if (this._hasVisibleTitleAndHeader()) {
			this.$titleArea.removeClass(Device.system.phone && oDynamicPageTitle.getSnappedTitleOnMobile() ?
					"sapFDynamicPageTitleSnappedTitleOnMobile" : "sapFDynamicPageTitleSnapped");
			this._updateToggleHeaderVisualIndicators();
			if (!this.getPreserveHeaderStateOnScroll() && !this._headerBiggerThanAllowedToPin()) {
				this._togglePinButtonVisibility(true);
			}
			this._updateTitlePositioning();
		}

		this._toggleHeaderInTabChain(true);
		this._updateARIAStates(true);
		this._toggleHeaderBackground(false);
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
			this._updateTitlePositioning();
		}
	};

	/**
	 * Ensures that when the header is hidden with <code>visibility: hidden</code>
	 * the area that it occupies still has the required background (as that area may be
	 * visible to the user by being outside the scroll overflow).
	 *
	 * This is needed in FLP environment where the FLP background contrasts with
	 * the background of the page eleemnts => we need to ensure that all non-transparent
	 * page elements have the expected background.
	 * @param {boolean} bShow
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderBackground = function (bShow) {
		this.$headerInContentWrapper.toggleClass("sapFDynamicPageHeaderSolid", bShow);
	};

	/**
	 * Appends header to content area.
	 * @param {boolean} bOffsetContent - whether to offset the content bellow the newly-added header in order to visually preserve its scroll position
	 * @private
	 */
	DynamicPage.prototype._moveHeaderToContentArea = function (bOffsetContent) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader.$().prependTo(this.$headerInContentWrapper);
			this._bHeaderInTitleArea = false;
			if (bOffsetContent) {
				this._offsetContentOnMoveHeader();
			}
			this.fireEvent("_moveHeader");
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
			this.fireEvent("_moveHeader");
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
			iCurrentScrollPosition = this.$wrapper.scrollTop(),
			iNewScrollPosition;

		if (!iOffset) {
			return;
		}

		iNewScrollPosition = this._bHeaderInTitleArea ?
		iCurrentScrollPosition - iOffset :
		iCurrentScrollPosition + iOffset;

		iNewScrollPosition = Math.max(iNewScrollPosition, 0);

		this._setScrollPosition(iNewScrollPosition, true /* suppress toggle header on scroll */);
	};

	DynamicPage.prototype._isHeaderPinnable = function () {
		var oHeader = this.getHeader();
		return oHeader && oHeader.getPinnable()
			&& this.getHeaderExpanded()
			&& !this.getPreserveHeaderStateOnScroll();
	};

	DynamicPage.prototype._updatePinButtonState = function() {
		var bShouldPin = this.getHeaderPinned() && this._isHeaderPinnable();
		this._togglePinButtonPressedState(bShouldPin);
		if (bShouldPin) {
			this._pin();
		} else {
			this._unPin();
		}
	};

	/**
	 * Pins the header.
	 * @private
	 */
	DynamicPage.prototype._pin = function (bUserInteraction) {
		if (this._bPinned) {
			return;
		}

		this._bPinned = true;
		if (bUserInteraction) {
			this.setProperty("headerPinned", true, true);
			this.fireEvent("pinnedStateChange", {pinned: true});
		}

		if (!this._bHeaderInTitleArea) {
			this._moveHeaderToTitleArea(true);
			this._adjustStickyContent();
			this._updateTitlePositioning();
		}

		this._updateToggleHeaderVisualIndicators();

		this.addStyleClass("sapFDynamicPageHeaderPinned");
	};


	/**
	 * Unpins the header.
	 * @private
	 */
	DynamicPage.prototype._unPin = function (bUserInteraction) {
		if (!this._bPinned) {
			return;
		}

		this._bPinned = false;
		if (bUserInteraction) {
			this.setProperty("headerPinned", false, true);
			this.fireEvent("pinnedStateChange", {pinned: false});
		}
		this._updateToggleHeaderVisualIndicators();

		this.removeStyleClass("sapFDynamicPageHeaderPinned");
	};

	/**
	 * Shows/Hides the header pin button
	 * @param {boolean} bToggle
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
	 * @param {boolean} bPressed
	 * @private
	 */
	DynamicPage.prototype._togglePinButtonPressedState = function (bPressed) {
		var oDynamicPageHeader = this.getHeader();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._togglePinButton(bPressed);
		}
	};


	/**
	 * Shows/hides the pin button if pin scenario is possible/not possible
	 * @private
	 */
	DynamicPage.prototype._showHidePinButton = function () {
		this._togglePinButtonVisibility(!this._preserveHeaderStateOnScroll());
	};

	/**
	 * Checks if there are conditions to directly enable the pinned state of the header
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._isHeaderPinnable = function () {
		var oHeader = this.getHeader();
		return oHeader && oHeader.getPinnable()
			&& this.getHeaderExpanded()
			&& !this.getPreserveHeaderStateOnScroll();
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
	 * @returns {int}
	 * @private
	 */
	DynamicPage.prototype._getScrollPosition = function () {
		return exists(this.$wrapper) ? Math.ceil(this.$wrapper.scrollTop()) : 0;
	};

	/**
	 * Sets the value for aria-roledescription attribute
	 * @param {string} sAriaRoleDescription
	 * @return {this} this for chaining
	 * @private
	 */
	DynamicPage.prototype._setAriaRoleDescription = function (sAriaRoleDescription) {
		this._sAriaRoleDescription = sAriaRoleDescription;

		return this;
	};

	/**
	 * Returns the aria-roledescription value
	 * if not overwritten the default "Dynamic Page" string is returned
	 * @return {string} aria-roledescription
	 * @private
	 */
	DynamicPage.prototype._getAriaRoleDescription = function () {
		return this._sAriaRoleDescription;
	};

	/**
	 * Updates the scroll position
	 * @param {number} iNewScrollPosition
	 * @param {boolean} bSuppressToggleHeader - flag to raise in cases where we only want to adjust the vertical positioning of the visible content, without changing the <code>headerExpanded</code> state of the <code>DynamicPage</code>
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
		var bIsScrollable = this._needsVerticalScrollBar(),
			iScrollPosition = this._getScrollPosition(),
			bIsBelowSnappingHeight = iScrollPosition === 0 || iScrollPosition < this._getSnappingHeight();

		return !this._preserveHeaderStateOnScroll() && bIsBelowSnappingHeight
			&& !this.getHeaderExpanded() && !this._bPinned && bIsScrollable;
	};

	/**
	 * Determines should the sticky content stick.
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._shouldStickStickyContent = function () {
		return !this.getHeaderExpanded() || this._preserveHeaderStateOnScroll() || this._bHeaderInTitleArea;
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
	 *
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._canSnapHeaderOnScroll = function () {
		return this._getMaxScrollPosition() > this._getSnappingHeight();
	};

	/**
	 * Determines the appropriate height at which the header can collapse (snap).
	 * @returns {number}
	 * @private
	 */
	DynamicPage.prototype._getSnappingHeight = function () {
		var oTitle = this.getTitle(),
			$expandWrapper = oTitle && oTitle.$expandWrapper,
			$snappedWrapper = oTitle && oTitle.$snappedWrapper,
			$expandWrapperHeading = oTitle && oTitle.$expandHeadingWrapper,
			$snappedWrapperHeading = oTitle && oTitle.$snappedHeadingWrapper,
			//we should make sure all the snap/expand elements is taken is consideration if they exist.
			iExpandedHeaderHeight = $expandWrapper && $expandWrapper.length ? $expandWrapper.height() : 0,
			iSnappedHeaderHeadingHeight =  $snappedWrapperHeading && $snappedWrapperHeading.length ? $snappedWrapperHeading.height() : 0,
			iExpandedHeaderHeadingHeight = $expandWrapperHeading && $expandWrapperHeading.length ? $expandWrapperHeading.height() : 0,
			iSnappedHeaderHeight =  $snappedWrapper && $snappedWrapper.length ? $snappedWrapper.height() : 0,
			iSnappingHeight = Math.ceil(this._getHeaderHeight() ||
			iExpandedHeaderHeight + iSnappedHeaderHeight + iSnappedHeaderHeadingHeight + iExpandedHeaderHeadingHeight) - DynamicPage.HEADER_CONTENT_PADDING_BOTTOM;

		return iSnappingHeight > 0 ? iSnappingHeight : 0;
	};

	/**
	 * Determines the maximum scroll position, depending on the content size.
	 * @returns {number}
	 * @private
	 */
	DynamicPage.prototype._getMaxScrollPosition = function() {
		var $wrapperDom,
			iClientHeight;

		if (exists(this.$wrapper)) {
			$wrapperDom = this.$wrapper[0];
			// we obtain the ceiled <code>iClientHeight</code> value
			// to avoid ending up with that <code>iClientHeight</code> that is only a single pixel
			// bigger than <code>scrollHeight</code> due to rounding (=> will cause redundand scrollbar)
			iClientHeight = Math.max($wrapperDom.clientHeight, Math.ceil($wrapperDom.getBoundingClientRect().height));
			return $wrapperDom.scrollHeight - iClientHeight;
		}
		return 0;
	};

	/**
	 * Determines if the content is scrollable.
	 * <code>Note:</code>
	 * For IE and Edge we use 1px threshold,
	 * because the clientHeight returns results in 1px difference compared to the scrollHeight,
	 * the reason is not defined.
	 *
	 * @returns {boolean}
	 * @private
	 */
	DynamicPage.prototype._needsVerticalScrollBar = function () {
		// treat maxScrollHeight values in the range [0, 1] as 0,
		// to cover the known cases where the nested content overflows
		// the container with up to 1px because of rounding issues
		return Math.floor(this._getMaxScrollPosition()) > 1;
	};

	/**
	 * Retrieves the height of the <code>DynamicPage</code> control.
	 * @returns {number}
	 * @private
	 */
	DynamicPage.prototype._getOwnHeight = function () {
		return this._getHeight(this);
	};

	/**
	 * Determines the combined height of the title and the header.
	 * @returns {number} the combined height of the title and the header
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
	 * @param {number} iControlHeight
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
	 * Updates the position/height of the area of the scroll container underneath the title area
	 * @private
	 */
	DynamicPage.prototype._updateTitlePositioning = function () {
		if (!exists(this.$wrapper) || !exists(this.$titleArea) || (this._getHeight(this) === 0)) {
			return;
		}

		var bScrollBarNeeded = this._needsVerticalScrollBar(),
			oWrapperElement = this.$wrapper.get(0),
			iTitleHeight = this.$titleArea.get(0).getBoundingClientRect().height,
			iTitleWidth = this._getTitleAreaWidth(),
			iScrollbarWidth = getScrollbarSize().width,
			sClipPath;

		// the top area of the scroll container is reserved for showing the title element,
		// (where the title element is positioned absolutely on top of the scroll container),
		// therefore

		// (1) add top padding for the area underneath the title element
		// so that the title does not overlap the content of the scroll container
		oWrapperElement.style.paddingTop = iTitleHeight + "px";
		oWrapperElement.style.scrollPaddingTop = iTitleHeight + "px";
		this._oScrollHelper.setScrollPaddingTop(iTitleHeight);

		// (2) also make the area underneath the title invisible (using clip-path)
		// to allow usage of *transparent background* of the title element
		// (otherwise content from the scroll *overflow* will show underneath the transparent title element)
		sClipPath = 'polygon(0px ' + Math.floor(iTitleHeight) + 'px, '
			+ iTitleWidth + 'px ' + Math.floor(iTitleHeight) + 'px, '
			+ iTitleWidth + 'px 0, 100% 0, 100% 100%, 0 100%)'; //

		if (Localization.getRTL()) {
			sClipPath = 'polygon(0px 0px, ' + iScrollbarWidth + 'px 0px, '
			+ iScrollbarWidth + 'px ' + iTitleHeight + 'px, 100% '
			+ iTitleHeight + 'px, 100% 100%, 0 100%)';
		}
		oWrapperElement.style.clipPath = sClipPath;

		this.toggleStyleClass("sapFDynamicPageWithScroll", bScrollBarNeeded);

		 // update styles for scrolling after a timeout of 0, in order to obtain the final state
		 // e.g. after the ResizeHandler looped though *all* resized controls (to notify them) =>
		 // so all of them completed their adjustments for the new size (notably any nested table adjusted its
		 // visible rows count upon being notified by ResizeHandler for change of height of its container)
		setTimeout(this._toggleScrollingStyles.bind(this), 0);
	};

	DynamicPage.prototype._toggleScrollingStyles = function (bNeedsVerticalScrollBar) {
		var bNoScrollBar = typeof bNeedsVerticalScrollBar !== 'undefined' ? !bNeedsVerticalScrollBar : !this._needsVerticalScrollBar();

		this.toggleStyleClass("sapFDynamicPageWithScroll", !bNoScrollBar);
		this.$contentFitContainer.toggleClass("sapFDynamicPageContentFitContainer", bNoScrollBar);
	};

	/**
	 * Updates the Header ARIA state depending on the <code>DynamicPageHeader</code> expanded/collapsed (snapped) state.
	 * @param {boolean} bExpanded determines if the header is expanded or collapsed (snapped).
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
	 * Initializes the specific Device.media range set for <code>DynamicPage</code>.
	 */
	DynamicPage.prototype._initRangeSet = function () {
		if (!Device.media.hasRangeSet(DynamicPage.MEDIA_RANGESET_NAME)) {
			Device.media.initRangeSet(DynamicPage.MEDIA_RANGESET_NAME,
				[DynamicPage.BREAK_POINTS.PHONE,
				DynamicPage.BREAK_POINTS.TABLET,
				DynamicPage.BREAK_POINTS.DESKTOP], "px", ["phone", "tablet", "desktop"]);
		}
	};

	DynamicPage.prototype._onMediaRangeChange = function () {
		var iCurrentWidth = this._getMediaContainerWidth();
		this._updateMedia(iCurrentWidth);
	};

	/**
	 * Updates the media size of the control based on its own width, not on the entire screen size (which media query does).
	 * This is necessary, because the control will be embedded in other controls (like the <code>sap.f.FlexibleColumnLayout</code>),
	 * thus it will not be using all of the screen width, but despite that the paddings need to be appropriate.
	 * @param {number} iWidth - the actual width of the control
	 * @private
	 */
	DynamicPage.prototype._updateMedia = function (iWidth) {
        if (!iWidth) {
            // in case of rerendering or when the control does not exist at the moment, a zero is passed as iWidth and
            // phone media styles are applied which is causing flickering when the actual size is passed
            return;
        }
		if (iWidth <= DynamicPage.BREAK_POINTS.PHONE) {
			this._updateMediaStyle(DynamicPage.MEDIA.PHONE);
		} else if (iWidth <= DynamicPage.BREAK_POINTS.TABLET) {
			this._updateMediaStyle(DynamicPage.MEDIA.TABLET);
		} else if (iWidth <= DynamicPage.BREAK_POINTS.DESKTOP) {
			this._updateMediaStyle(DynamicPage.MEDIA.DESKTOP);
		} else {
			this._updateMediaStyle(DynamicPage.MEDIA.DESKTOP_XL);
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
			bHasTitleAndHeader = this._hasVisibleTitleAndHeader(),
			oHeader = this.getHeader(),
			bHeaderHasContent = false;

		if (exists(oHeader)) {
			bHeaderHasContent = !!oHeader.getContent().length;
		}

		if (!this.getToggleHeaderOnTitleClick() || !bHasTitleAndHeader) {
			bCollapseVisualIndicatorVisible = false;
			bExpandVisualIndicatorVisible = false;
		} else {
			bHeaderExpanded = this.getHeaderExpanded();
			bCollapseVisualIndicatorVisible = bHeaderExpanded;
			bExpandVisualIndicatorVisible = Device.system.phone && this.getTitle().getAggregation("snappedTitleOnMobile") ? false : !bHeaderExpanded;
		}

		bExpandVisualIndicatorVisible = bExpandVisualIndicatorVisible && bHeaderHasContent;
		bCollapseVisualIndicatorVisible = bCollapseVisualIndicatorVisible && bHeaderHasContent;

		this._toggleCollapseVisualIndicator(bCollapseVisualIndicatorVisible);
		this._toggleExpandVisualIndicator(bExpandVisualIndicatorVisible);
		this._updateTitleVisualState();
	};

	/**
	 * Updates the visibility of the <code>pinButton</code> and the header scroll state.
	 * @private
	 */
	DynamicPage.prototype._updateHeaderVisualState = function (bHeightChange, iPageControlHeight) {
		var oDynamicPageHeader = this.getHeader();

		// If there is a change in the height of the DynanmicPage, we need to update the
		// "_preserveHeaderStateOnScroll" function status
		if (bHeightChange && this.getPreserveHeaderStateOnScroll()) {
			this._overridePreserveHeaderStateOnScroll();
		}

		if (!this._preserveHeaderStateOnScroll() && oDynamicPageHeader) {
			if (this._headerBiggerThanAllowedToPin(iPageControlHeight) || Device.system.phone) {
				this._unPin();
				this._togglePinButtonVisibility(false);
				this._togglePinButtonPressedState(false);
			} else {
				this._togglePinButtonVisibility(true);
				this._updatePinButtonState();
			}

			if (this.getHeaderExpanded() && this._bHeaderInTitleArea && this._headerBiggerThanAllowedToBeExpandedInTitleArea()) {
				this._expandHeader(false /* remove header from title area */);
				this._setScrollPosition(0);
			}
		} else if (this._preserveHeaderStateOnScroll() && oDynamicPageHeader) {
			this._togglePinButtonVisibility(false);
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
			iOffset = $collapseButton.offsetTop + iCollapseButtonHeight - iViewportHeight + this._getTitleHeight();

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
	 * @return {number} the height of the control
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
	 * @return {number} the width of the control
	 */
	DynamicPage.prototype._getWidth = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerWidth() || 0;
	};

	/**
	 * Determines the height of the <code>DynamicPage</code> outer header DOM element (the title area),
	 * the wrapper of the <code>DynamicPageTitle</code> and <code>DynamicPageHeader</code>.
	 * @returns {number}
	 * @private
	 */
	DynamicPage.prototype._getTitleAreaHeight = function () {
		return exists(this.$titleArea) ? this.$titleArea.outerHeight() || 0 : 0;
	};

	/**
	 * Determines the width of the <code>DynamicPage</code> outer header DOM element (the title area),
	 * the wrapper of the <code>DynamicPageTitle</code> and <code>DynamicPageHeader</code>.
	 * @returns {Number}
	 * @private
	 */
	 DynamicPage.prototype._getTitleAreaWidth = function () {
		return exists(this.$titleArea) ? this.$titleArea.width() || 0 : 0;
	};

	/**
	 * Determines the height of the <code>DynamicPageTitle</code> and if it's not present it returns 0.
	 * @returns {number}
	 * @private
	 */
	DynamicPage.prototype._getTitleHeight = function () {
		return this._getHeight(this.getTitle());
	};

	/**
	 * Determines the height of the <code>DynamicPageHeader</code> and if it's not present it returns 0.
	 * @returns {number}
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
		this.$headerInContentWrapper = this.$("headerWrapper");
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
	 * Reacts to the <code>DynamicPage</code> child controls re-rendering, updating the title positioning.
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
		} else if (oSourceControl instanceof DynamicPageHeader && oSourceControl.getDomRef() !== this.$header.get(0)) {
			this._cacheHeaderDom();
			this._deRegisterResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER);
			this._registerResizeHandler(DynamicPage.RESIZE_HANDLER_ID.HEADER, this.$header[0], this._onChildControlsHeightChange.bind(this));
		}

		setTimeout(this._updateTitlePositioning.bind(this), 0);
	};

	/**
	 * Reacts when the aggregated child controls change their height.
	 * @private
	 */
	DynamicPage.prototype._onChildControlsHeightChange = function (oEvent) {
		var bNeedsVerticalScrollBar = this._needsVerticalScrollBar(),
			oHeader = this.getHeader(),
			bCurrentHeight,
			bOldHeight;

		// FitContainer needs to be updated, when height is changed and scroll bar appear, to enable calc of original height
		if (bNeedsVerticalScrollBar) {
			this._toggleScrollingStyles(bNeedsVerticalScrollBar);
		}

		this._adjustSnap();

		if (!this._bExpandingWithAClick) {
			this._updateTitlePositioning();
		}

		this._bExpandingWithAClick = false;

		if (oHeader && oEvent.target.id === oHeader.getId()) {
			bCurrentHeight = oEvent.size.height;
			bOldHeight = oEvent.oldSize.height;
			this._updateHeaderVisualState(bCurrentHeight !== bOldHeight);
			this._adaptScrollPositionOnHeaderChange(bCurrentHeight, bOldHeight);
		}
	};

	/**
	 * Handles the resize event of the <code>DynamicPage</code>.
	 * Unpins the header when its size threshold has been reached.
	 * Adjusts the expanded/collapsed state.
	 * Triggers the <code>resize</code> handler of the <code>DynamicPageTitle</code>.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	DynamicPage.prototype._onResize = function (oEvent) {
		var oDynamicPageTitle = this.getTitle(),
			iCurrentWidth = oEvent.size.width,
			iCurrentHeight = oEvent.size.height,
			bHeightChange = iCurrentHeight !== oEvent.oldSize.height;

		this._updateHeaderVisualState(bHeightChange, iCurrentHeight);

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._onResize(iCurrentWidth);
		}

		this._adjustSnap();
		this._updateTitlePositioning();
		this._updateMedia(iCurrentWidth);
	};

	/**
	 * Switches between expanded/collapsed (snapped) modes.
	 * @private
	 */
	DynamicPage.prototype._toggleHeaderOnScroll = function () {
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
			this._adjustStickyContent();
			this._updateTitlePositioning();
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

		oStickySubheaderProvider = Element.getElementById(sStickySubheaderProviderId);

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
	 * When the header is in the overflow of the scroll container, it still takes space and whenever its height changes,
	 * it affects the scroll position of the scrollable content bellow it. Whenever its height increases/decreases,
	 * the content bellow it is pushed down or up, respectively.
	 * To avoid a visual jump of the visible content upon change in the header height, we adjust the scroll position
	 * accordingly, to compensate the increase/decrease of header height.
	 * @param iNewHeight
	 * @param iOldHeigh
	 * @private
	 */
	DynamicPage.prototype._adaptScrollPositionOnHeaderChange = function (iNewHeight, iOldHeigh) {
		var iHeightChange =  iNewHeight - iOldHeigh,
			oHeader = this.getHeader();

		// check if the header is in the scroll overflow (i.e. is snapped by being scrolled out of view)
		if (iHeightChange && (!this.getHeaderExpanded() && (oHeader.$().css("visibility") !== "hidden"))
			 && !this._bHeaderInTitleArea && this._needsVerticalScrollBar()) {
			this._setScrollPosition(this._getScrollPosition() + iHeightChange);
		}
	};

	/**
	 * Handles the title press event and prevents the collapse/expand, if necessary
	 * @private
	 */
	DynamicPage.prototype._onTitlePress = function () {
		if (this.getToggleHeaderOnTitleClick() && this._hasVisibleTitleAndHeader()) {
			if (!this.getHeaderExpanded() && this._headerBiggerThanAllowedToBeExpandedInTitleArea() && !this._preserveHeaderStateOnScroll()) {
				// if the header will expanded and it is bigger than the allowed height to be shown in the title area
				// we explicitly move it to the content area unless the preserveHeaderStateOnScroll is set
				// the header is then always displayed in the title are by definition as is always sticky
				this._moveHeaderToContentArea(true);
			}
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
	 * Expands/collapses the header when allowed to do so by the internal rules of the <code>DynamicPage</code>.
	 * @param {boolean} bUserInteraction - indicates if title expand/collapse was caused by user interaction (scroll, collapse button press, etc.)
	 * @private
	 */
	DynamicPage.prototype._titleExpandCollapseWhenAllowed = function (bUserInteraction) {
		var bAllowAppendHeaderToTitle, iSnappingHeight;

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
				iSnappingHeight = this._getSnappingHeight();
				this._setScrollPosition(iSnappingHeight ? (iSnappingHeight + DynamicPage.HEADER_CONTENT_PADDING_BOTTOM) : 0);
			}
		}
	};

	/**
	 * Handles the pin/unpin button press event, which results in the pinning/unpinning of the <code>DynamicPageHeader</code>.
	 * @private
	 */
	DynamicPage.prototype._onPinUnpinButtonPress = function () {
		if (this._bPinned) {
			this._unPin(true);
		} else {
			this._pin(true);
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
			oCallback = this._onChildControlAfterRendering.bind(this),
			oPageChildrenAfterRenderingDelegate = {onAfterRendering: oCallback};

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
	DynamicPage.prototype._attachStickyHeaderObserver = function () {
		var oHeader = this.getHeader();

		if (exists(oHeader) && !this._bAlreadyAttachedStickyHeaderObserver) {
			if (!this._oStickyHeaderObserver) {
				this._oStickyHeaderObserver = new ManagedObjectObserver(this._onHeaderPropertyChange.bind(this));
			}

			this._oStickyHeaderObserver.observe(oHeader, {properties: ["visible"]});

			this._bAlreadyAttachedStickyHeaderObserver = true;
		}
	};

	/**
	 * Listener for property changes of the header
	 * @private
	 */
	DynamicPage.prototype._onHeaderPropertyChange = function (oEvent) {
		var oHeader = this.getHeader();
		this._adjustStickyContent();

		if (oHeader && oEvent.name === "visible" && oEvent.current === false) { // the header is given visibile = false,
			// => the header will be removed from DOM
			// but no afterRendering event will be fired (framework-specific behavior)
			// so we need to reflect the removal of the header height from now
			oHeader.invalidate(); // force the DOM update
			// update according to the latest header height
			this._updateTitlePositioning();
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
				this._oHeaderObserver = new ManagedObjectObserver(this._onHeaderFieldChange.bind(this));
			}

			this._oHeaderObserver.observe(oHeader, {aggregations: ["content"], properties: ["visible", "pinnable"]});

			this._bAlreadyAttachedHeaderObserver = true;
		}
	};

	/**
	 * Attaches observer to the <code>DynamicPageHeader</code> visible property.
	 * @private
	 */
	 DynamicPage.prototype._attachTitleObserver = function () {
		var oTitle = this.getTitle();

		if (exists(oTitle) && !this._bAlreadyAttachedTitleObserver) {
			if (!this._oTitleObserver) {
				this._oTitleObserver = new ManagedObjectObserver(this._onTitleFieldChange.bind(this));
			}

			this._oTitleObserver.observe(oTitle, {properties: ["visible"]});

			this._bAlreadyAttachedTitleObserver = true;
		}
	};

	DynamicPage.prototype._onHeaderFieldChange = function (oEvent) {

		if ((oEvent.type === "property") && (oEvent.name === "pinnable")) {
			this._updatePinButtonState();
			return;
		}

		this._updateToggleHeaderVisualIndicators();
	};

	DynamicPage.prototype._onTitleFieldChange = function (oEvent) {

		if ((oEvent.type === "property") && (oEvent.name === "visible")) {
			this.invalidate();
			return;
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

		oStickySubheaderProvider = Element.getElementById(sStickySubheaderProviderId);

		if (exists(oStickySubheaderProvider) && !this._bAlreadyAddedStickySubheaderAfterRenderingDelegate) {
			bIsInInterface = oStickySubheaderProvider.getMetadata()
				.getInterfaces()
				.indexOf("sap.f.IDynamicPageStickyContent") !== -1;

			if (bIsInInterface) {
				this._oStickySubheader = oStickySubheaderProvider._getStickyContent();

				this._oStickySubheader.addEventDelegate(this._oSubHeaderAfterRenderingDelegate, this);

				this._bAlreadyAddedStickySubheaderAfterRenderingDelegate = true;
				this._attachStickyHeaderObserver();
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
		this._toggleHeaderOnScrollReference = this._toggleHeaderOnScroll.bind(this);

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
		var oSticky = Element.getElementById(this.getStickySubheaderProvider());
		return !!oSticky && oSticky.isA("sap.f.IDynamicPageStickyContent");
	};

	/**
	 * Detaches the <code>DynamicPage</code> content scroll handler.
	 * @private
	 */
	DynamicPage.prototype._detachScrollHandler = function () {
		if (this.$wrapper) {
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

	/**
	 * Sets the <code>aria-labelledby</code> attribute of the {@link sap.f.DynamicPage} footer.
	 * @private
	 */
	DynamicPage.prototype._setFooterAriaLabelledBy = function () {
		var oFooter = this.getFooter();

		if (oFooter && !oFooter.getAriaLabelledBy().length) {
			this._oInvisibleText = new InvisibleText({
				id: oFooter.getId() + "-FooterActions-InvisibleText",
				text: Library.getResourceBundleFor("sap.f").getText(DynamicPage.ARIA_LABEL_TOOLBAR_FOOTER_ACTIONS)
			}).toStatic();

			oFooter.addAriaLabelledBy(this._oInvisibleText);
		}
	};

	/**
	 * Destroys the invisible text object associated with the footer of the {@link sap.f.DynamicPage} control.
	 * @private
	 */
	DynamicPage.prototype._destroyInvisibleText = function () {
		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			this._oInvisibleText = null;
		}
	};

	return DynamicPage;
});
