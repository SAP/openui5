/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageLayout.
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Configuration",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/core/delegate/ScrollEnablement",
	"./ObjectPageSectionBase",
	"./ObjectPageSection",
	"./ObjectPageSubSection",
	"./ObjectPageHeaderContent",
	"./LazyLoading",
	"./ObjectPageLayoutABHelper",
	"./ThrottledTaskHelper",
	"sap/m/ScrollBar",
	"sap/ui/core/library",
	"./library",
	"./ObjectPageLayoutRenderer",
	"sap/base/Log",
	"sap/ui/dom/getScrollbarSize",
	"sap/base/assert",
	"sap/ui/events/KeyCodes",
	"sap/ui/dom/getFirstEditableInput"
], function(
	jQuery,
	ManagedObjectObserver,
	ResizeHandler,
	Configuration,
	Control,
	Device,
	ScrollEnablement,
	ObjectPageSectionBase,
	ObjectPageSection,
	ObjectPageSubSection,
	ObjectPageHeaderContent,
	LazyLoading,
	ABHelper,
	ThrottledTask,
	ScrollBar,
	coreLibrary,
	library,
	ObjectPageLayoutRenderer,
	Log,
	getScrollbarSize,
	assert,
	KeyCodes,
	getFirstEditableInput
) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.ui.core.AccessibleLandmarkRole
	var AccessibleLandmarkRole = coreLibrary.AccessibleLandmarkRole;

	// shortcut for sap.uxap.ObjectPageSubSectionLayout
	var ObjectPageSubSectionLayout = library.ObjectPageSubSectionLayout;

	/**
	 * Constructor for a new <code>ObjectPageLayout</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * A layout that allows apps to easily display information related to a business object.
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>ObjectPageLayout</code> layout is composed of a header (title and content),
	 * an optional anchor bar and block content wrapped in sections and subsections that
	 * structure the information.
	 *
	 * <h3>Structure</h3>
	 *
	 * An <code>ObjectPageLayout</code> control is used to put together all parts of an Object page
	 * - Header, optional Anchor Bar and Sections/Subsections.
	 *
	 * <h4>Header</h4>
	 * The <code>ObjectPageLayout</code> implements the snapping header concept. This means that
	 * the upper part of the header (Header Title) always stays visible, while the lower part
	 * (Header Content) can scroll out of view.
	 *
	 * Header Title is displayed at the top of the header and always remains visible above the
	 * scrollable content of the page. It contains the title and most prominent details of the object.
	 *
	 * The Header Content scrolls along with the content of the page until it disappears (collapsed header).
	 * When scrolled back to the top it becomes visible again (expanded header). It contains all the
	 * additional information of the object.
	 *
	 * <h4>Anchor Bar</h4>
	 * The Anchor Bar is an automatically generated internal menu that shows the titles of the sections
	 * and subsections and allows the user to scroll to the respective section and subsection content.
	 *
	 * <h4>Sections, Subsections, Blocks</h4>
	 * The content of the page that appears bellow the header is composed of blocks structured into
	 * sections and subsections.
	 *
	 * <h3>Usage</h3>
	 * Use the <code>ObjectPageLayout</code> if:
	 * <ul>
	 * <li>The users need to see, edit, or create an item with all its details.</li>
	 * <li>Users need to get an overview of an object and interact with different parts of the object.</li>
	 * </ul>
	 *
	 * <h3>Responsive behavior</h3>
	 *
	 * The <code>ObjectPageLayout</code> is responsive and adapts to all screen sizes.
	 *
	 * @see {@link topic:2e61ab6c68a2480eb666c1927a707658 Object Page Layout}
	 * @see {@link topic:d2ef0099542d44dc868719d908e576d0 Object Page Headers}
	 * @see {@link topic:370b67986497463187336fa130aebbf1 Anchor Bar}
	 * @see {@link topic:4527729576cb4a4888275b6935aad03a Object Page Blocks}
	 * @see {@link topic:2978f6064742456ebed31c5ccf4d051d Creating Blocks}
	 * @see {@link topic:bc410e94e46540efa02857e15aae583f Object Page Scrolling}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/object-page/ Object Page Layout}
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/snapping-header/ UX Guidelines: Object Page - Snapping Header}
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageLayout
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageLayout = Control.extend("sap.uxap.ObjectPageLayout", /** @lends sap.uxap.ObjectPageLayout.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Determines whether the Navigation bar (Anchor bar) is displayed.
				 */
				showAnchorBar: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether to show a Popover with Subsection links when clicking on Section links in the Anchor bar.
				 */
				showAnchorBarPopover: {type: "boolean", defaultValue: true},

				/**
				 * Determines whether the Anchor bar items are displayed in upper case.
				 */
				upperCaseAnchorBar: {type: "boolean", defaultValue: true},

				/**
				 * Determines the background color of the <code>AnchorBar</code>.
				 *
				 * <b>Note:</b> The default value of <code>backgroundDesignAnchorBar</code> property is null.
				 * If the property is not set, the color of the background is <code>@sapUiObjectHeaderBackground</code>,
				 * which depends on the specific theme.
				 * @since 1.58
				*/
				backgroundDesignAnchorBar : {type: "sap.m.BackgroundDesign", group: "Appearance"},

				/**
				 * Determines the height of the ObjectPage.
				 */
				height: {type: "sap.ui.core.CSSSize", defaultValue: "100%"},

				/**
				 * Enable lazy loading for the Object page Subsections.
				 */
				enableLazyLoading: {type: "boolean", defaultValue: false},

				/**
				 * Determines whether Subsection titles are displayed on top or to the left of the Subsection content.
				 */
				subSectionLayout: {
					type: "sap.uxap.ObjectPageSubSectionLayout",
					defaultValue: ObjectPageSubSectionLayout.TitleOnTop
				},

				/**
				 * Determines the ARIA level of the <code>ObjectPageSection</code> and <code>ObjectPageSubSection</code> titles.
				 * The ARIA level is used by assisting technologies, such as screen readers, to create a hierarchical site map for faster navigation.
				 *
				 * <br><b>Note:</b>
				 * <ul>
				 * <li>Defining a <code>sectionTitleLevel</code> will add <code>aria-level</code> attribute from 1 to 6
				 * instead of changing the titles` HTML tag from H1 to H6.
				 * <br>For example: if <code>sectionTitleLevel</code> is <code>TitleLevel.H1</code>,
				 * it will result as aria-level of 1 added to the <code>ObjectPageSection</code> title.
				 * </li>
				 *
				 * <li> The <code>ObjectPageSubSection</code> title
				 * would have <code>aria-level</code> one level lower than the defined.
				 * For example: if <code>sectionTitleLevel</code> is <code>TitleLevel.H1</code>,
				 * it will result as aria-level of 2 added to the <code>ObjectPageSubSection</code> title.</li>
				 *
				 * <li> It is possible to define a <code>titleLevel</code> on <code>ObjectPageSection</code> or <code>ObjectPageSubSection</code> level.
				 * In this case the value of this property will be ignored.
				 * </li>
				 * </ul>
				 * @since 1.44.0
				 */
				sectionTitleLevel : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

				/**
				 * Determines whether the navigation mode is tab-based instead of the default anchor bar. If enabled,
				 * the sections are displayed separately on each tab rather than having all of them visible at the same time.
				 *
				 * <b>Note:</b> Keep in mind that the <code>sap.m.IconTabBar</code> control is no longer used for the tab navigation mode.
				 */
				useIconTabBar: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Determines the visibility of the Header content (headerContent aggregation).
				 */
				showHeaderContent: {type: "boolean", group: "Misc", defaultValue: true},

				/**
				 * Determines whether the to use two column layout for the L screen size.
				 */
				useTwoColumnsForLargeScreen: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Determines whether the title, image, markers and selectTitleArrow are shown in the Header content area.
				 *
				 * <b>Note</b>: This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageHeader</code> is used for the <code>headerTitle</code> aggregation.</li>
				 */
				showTitleInHeaderContent: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Determines whether sections and subsections with importance Low and Medium are hidden even on large screens.
				 * @since 1.32.0
				 */
				showOnlyHighImportance: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether the page is a child page and renders it with a different design.
				 * Child pages have an additional (darker/lighter) stripe on the left side of their header content area.
				 *
				 * <b>Note</b>: This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageHeader</code> is used for the <code>headerTitle</code> aggregation.
				 * @since 1.34.0
				 */
				isChildPage: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Determines whether Header Content will always be expanded on desktop.
				 *
				 * <b>Note</b>: This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageHeader</code> is used for the <code>headerTitle</code> aggregation.
				 * @since 1.34.0
				 */
				alwaysShowContentHeader: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether the Header Content area can be pinned.
				 *
				 * When set to <code>true</code>, a pin button is displayed within the Header Content area.
				 * The pin button allows the user to make the Header Content always visible
				 * at the top of the page above any scrollable content.
				 *
				 * <b>Note:</b> This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageDynamicHeaderTitle</code> is used for the <code>headerTitle</code> aggregation.
				 * @since 1.52
				 */
				headerContentPinnable: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Determines whether the user can switch between the expanded/collapsed states of the
				 * <code>sap.uxap.ObjectPageDynamicHeaderContent</code> by clicking on the <code>sap.uxap.ObjectPageDynamicHeaderTitle</code>.
				 * If set to <code>false</code>, the <code>sap.uxap.ObjectPageDynamicHeaderTitle</code> is not clickable and the application
				 * must provide other means for expanding/collapsing the <code>sap.uxap.ObjectPageDynamicHeaderContent</code>, if necessary.
				 *
				 * <b>Note:</b> This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageDynamicHeaderTitle</code> is used for the <code>headerTitle</code> aggregation.
				 * @since 1.52
				 */
				toggleHeaderOnTitleClick: {type: "boolean", group: "Behavior", defaultValue: true},

				/**
				 * Preserves the current header state when scrolling.
				 * For example, if the user expands the header by clicking on the title and then scrolls down the page, the header will remain expanded.
				 *
				 * <b>Notes:</b>
				 * <ul><li>This property is only taken into account if an instance of <code>sap.uxap.ObjectPageDynamicHeaderTitle</code> is used for the <code>headerTitle</code> aggregation.</li>
				 * <li>Based on internal rules, the value of the property is not always taken into account - for example,
				 * when the control is rendered on tablet or mobile and the control`s title and header
				 * are with height larger than the given threshold.</li></ul>
				 * @since 1.52
				 */
				preserveHeaderStateOnScroll: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether an Edit button will be displayed in Header Content.
				 *
				 * <b>Note</b>: This property is only taken into account if an instance of
				 * <code>sap.uxap.ObjectPageHeader</code> is used for the <code>headerTitle</code> aggregation.
				 * @since 1.34.0
				 */
				showEditHeaderButton: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Specifies whether the object page enables flexibility features, such as hiding and adding sections.<br>
				 * For more information about SAPUI5 flexibility, refer to the Developer Guide.
				 * @since 1.34.0
				 */
				flexEnabled: {type: "boolean", group: "Misc", defaultValue: false},

				/**
				 * Determines whether the footer is visible.
				 * @since 1.40
				 */
				showFooter: {type: "boolean", group: "Behavior", defaultValue: false}
			},
			associations: {

				/**
				 * The section that is selected by default on load.
				 * @since 1.44.0
				 */
				selectedSection: {type: "sap.uxap.ObjectPageSection", multiple: false}
			},
			defaultAggregation: "sections",
			aggregations: {

				/**
				 * The sections that make up the Object page content area.
				 */
				sections: {type: "sap.uxap.ObjectPageSection", multiple: true, singularName: "section"},

				/**
				 * Object page header title - the upper, always static, part of the Object page header.
				 */
				headerTitle: {type: "sap.uxap.IHeaderTitle", multiple: false},

				/**
				 * Object page header content - the dynamic part of the Object page header.
				 */
				headerContent: {type: "sap.ui.core.Control", multiple: true, singularName: "headerContent"},

				/**
				 * Object page floating footer.
				 * @since 1.40
				 */
				footer: {type: "sap.m.IBar", multiple: false},

				/**
				 * Accessible landmark settings to be applied on the containers of the <code>sap.uxap.ObjectPageLayout</code> control.
				 *
				 * If not set, no landmarks will be written.
				 *
				 * @since 1.61
				 */
				landmarkInfo : {type : "sap.uxap.ObjectPageAccessibleLandmarkInfo", multiple : false},

				/**
				 * Internal aggregation to hold the reference to the AnchorBar.
				 */
				_anchorBar: {type: "sap.uxap.AnchorBar", multiple: false, visibility: "hidden"},

				/**
				 * Internal aggregation to hold the reference to the IconTabBar.
				 */
				_iconTabBar: {type: "sap.m.IconTabBar", multiple: false, visibility: "hidden"},

				/**
				 * Internal aggregation to hold the reference to the IHeaderContent implementation.
				 */
				_headerContent: {type: "sap.uxap.IHeaderContent", multiple: false, visibility: "hidden"},

				_customScrollBar: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}
			},
			events: {

				/**
				 * The event is fired when the Anchor bar is switched from moving to fixed or the other way round.
				 */
				toggleAnchorBar: {
					parameters: {

						/**
						 * False indicates that the Anchor bar has just detached from the Header and became part of the scrolling area. True means that the Anchor bar has just snapped to the Header.
						 */
						fixed: {type: "boolean"}
					}
				},

				/**
				 * Fired when the current section is changed by scrolling.
				 *
				 * @since 1.73
				 */
				sectionChange: {
					parameters: {
						/**
						 * The section which the layout is scrolled to.
						 */
						section: {type: "sap.uxap.ObjectPageSection"},
						/**
						 * The subsection which the layout is scrolled to.
						 */
						subSection: {type: "sap.uxap.ObjectPageSubSection"}
					}
				},

				/**
				 * The event is fired when the Edit Header button is pressed
				 */
				editHeaderButtonPress: {},

				/**
				 * The event is fired when the selected section is changed using the navigation.
				 * @since 1.40
				 */
				navigate: {
					parameters: {

						/**
						 * The selected section object.
						 */
						section: {type: "sap.uxap.ObjectPageSection"},

						/**
						 * The selected subsection object.
						 */
						subSection: {type: "sap.uxap.ObjectPageSubSection"}
					}
				}
			},
			dnd: { draggable: false, droppable: true },
			designtime: "sap/uxap/designtime/ObjectPageLayout.designtime"
		}
	});

	/**
	 * STATIC MEMBERS
	 */
	ObjectPageLayout.HEADER_CALC_DELAY = 350;			// ms.
	ObjectPageLayout.DOM_CALC_DELAY = 200;				// ms.
	ObjectPageLayout.MAX_SNAP_POSITION_OFFSET = 20;		// px
	ObjectPageLayout.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE = 0.6; // pct.
	ObjectPageLayout.TITLE_LEVEL_AS_ARRAY = Object.keys(TitleLevel);

	ObjectPageLayout.EVENTS = {
		TITLE_PRESS: "_titlePress",
		TITLE_MOUSE_OVER: "_titleMouseOver",
		TITLE_MOUSE_OUT: "_titleMouseOut",
		PIN_UNPIN_PRESS: "_pinUnpinPress",
		VISUAL_INDICATOR_MOUSE_OVER: "_visualIndicatorMouseOver",
		VISUAL_INDICATOR_MOUSE_OUT: "_visualIndicatorMouseOut",
		HEADER_VISUAL_INDICATOR_PRESS: "_headerVisualIndicatorPress",
		TITLE_VISUAL_INDICATOR_PRESS: "_titleVisualIndicatorPress"
	};

	ObjectPageLayout.BREAK_POINTS = {
		TABLET: 1024,
		PHONE: 600
	};

	ObjectPageLayout.MEDIA = {
		PHONE: "sapUxAPObjectPageLayout-Std-Phone",
		TABLET: "sapUxAPObjectPageLayout-Std-Tablet",
		DESKTOP: "sapUxAPObjectPageLayout-Std-Desktop"
	};

	ObjectPageLayout.DYNAMIC_HEADERS_MEDIA = {
		PHONE: "sapFDynamicPage-Std-Phone",
		TABLET: "sapFDynamicPage-Std-Tablet",
		DESKTOP: "sapFDynamicPage-Std-Desktop"
	};

	ObjectPageLayout.DIV = "div";
	ObjectPageLayout.HEADER = "header";
	ObjectPageLayout.FOOTER = "section";

	ObjectPageLayout.SHOW_FOOTER_CLASS_NAME = "sapUxAPObjectPageFloatingFooterShow";
	ObjectPageLayout.HIDE_FOOTER_CLASS_NAME = "sapUxAPObjectPageFloatingFooterHide";

	// Class which is added to the ObjectPageLayout if we don't have
	// additional navigation (e.g. AnchorBar, IconTabBar, etc.)
	ObjectPageLayout.NO_NAVIGATION_CLASS_NAME = "sapUxAPObjectPageNoNavigation";

	ObjectPageLayout.prototype._getFirstEditableInput = function(sContainer) {
		var oContainer = this.getDomRef(sContainer);

		return getFirstEditableInput(oContainer);
	};

	/**
	 * Focuses the first visible and editable input or textarea element.
	 *
	 * @param sContainer ID of the container inside <code>sap.uxap.ObjectPageLayout</code> to search for editable field
	 * @restricted
	 * @since 1.72
	 */
	ObjectPageLayout.prototype._focusFirstEditableInput = function(sContainer) {
		this._getFirstEditableInput(sContainer).focus();
	};

	/**
	 * Retrieves thе next entry starting from the given one within the <code>sap.ui.core.TitleLevel</code> enumeration.
	 * <br><b>Note:</b>
	 * <ul>
	 * <li> If the provided starting entry is not found, the <code>sap.ui.core.TitleLevel.Auto</code> is returned.</li>
	 * <li> If the provided starting entry is the last entry, the last entry is returned.</li>
	 * </ul>
	 * @param {String} sTitleLevel the <code>sap.ui.core.TitleLevel</code> entry to start from
	 * @returns {String} <code>sap.ui.core.TitleLevel</code> entry
	 * @since 1.44
	 */
	ObjectPageLayout._getNextTitleLevelEntry = function(sTitleLevel) {
		var iCurrentTitleLevelIndex = ObjectPageLayout.TITLE_LEVEL_AS_ARRAY.indexOf(sTitleLevel),
			bTitleLevelFound = iCurrentTitleLevelIndex !== -1,
			bHasNextTitleLevel = bTitleLevelFound && (iCurrentTitleLevelIndex !== ObjectPageLayout.TITLE_LEVEL_AS_ARRAY.length - 1);

		if (!bTitleLevelFound) {
			return TitleLevel.Auto;
		}

		return ObjectPageLayout.TITLE_LEVEL_AS_ARRAY[bHasNextTitleLevel ? iCurrentTitleLevelIndex + 1 : iCurrentTitleLevelIndex];
	};

	/**
	 * Retrieves the resource bundle for the <code>sap.uxap</code> library.
	 * @static
	 * @private
	 * @returns {Object} the resource bundle object
	 */
	ObjectPageLayout._getLibraryResourceBundle = function () {
		return sap.ui.getCore().getLibraryResourceBundle("sap.uxap");
	};

	/*************************************************************************************
	 * life cycle management
	 ************************************************************************************/

	ObjectPageLayout.prototype.init = function () {

		this.oCore = sap.ui.getCore();
		// lazy loading
		this._bFirstRendering = true;
		this._bDomReady = false;                    //dom is fully ready to be inspected
		this._bPinned = false;
		this._bStickyAnchorBar = false;             //status of the header
		this._bHeaderInTitleArea = false;
		this._bHeaderExpanded = true;
		this._bHeaderBiggerThanAllowedHeight = false;
		this._bDelayDOMBasedCalculations = true;    //delay before obtaining DOM metrics to ensure that the final metrics are obtained
		this._iStoredScrollTop = 0; // used by RTA to restore state upon drag'n'drop operation
		this._oStoredScrolledSubSectionInfo = {}; // used to (re)store the position within the currently scrolled section upon rerender
		this._bAllContentFitsContainer = false; // indicates if the page has only one visible subSection in total (and it is marked to fit its container)
		this._bIsFooterAanimationGoing = false; // Indicates if the animation of the floating footer is still going.
		// anchorbar management
		this._bInternalAnchorBarVisible = true;

		this._$footerWrapper = [];                  //dom reference to the floating footer wrapper
		this._$opWrapper = [];                      //dom reference to the header for Dark mode background image scrolling scenario
		this._$anchorBar = [];                      //dom reference to the anchorBar
		this._$titleArea = [];                    //dom reference to the header title
		this._$stickyAnchorBar = [];                //dom reference to the sticky anchorBar
		this._$headerContent = [];                  //dom reference to the headerContent
		this._$stickyHeaderContent = [];            //dom reference to the stickyHeaderContent

		// header animation && anchor bar management
		this._bMobileScenario = false;              //are we in a mobile scenario or the desktop one?
		this._oSectionInfo = {};                    //register some of the section info sSectionId:{offset,buttonClone} for updating the anchorbar accordingly
		this._aSectionBases = [];                   //hold reference to all sections and subsections alike (for perf reasons)
		this._sScrolledSectionId = "";              //section id that is currently scrolled
		this._iScrollToSectionDuration = 600;       //ms
		this._$spacer = [];                         //dom reference to the bottom padding spacing
		this.iHeaderContentHeight = 0;              // original height of the header content
		this.iStickyHeaderContentHeight = 0;        // original height of the sticky header content
		this.iHeaderTitleHeight = 0;                // original height of the header title
		this.iHeaderTitleHeightStickied = 0;        // height of the header title when stickied (can be different from the collapsed height because of isXXXAlwaysVisible options or text wrapping)
		this.iAnchorBarHeight = 0;                  // original height of the anchorBar
		this.iFooterHeight = 0;                     // original height of the anchorBar
		this.iTotalHeaderSize = 0;                  // total size of headerTitle + headerContent

		this._iREMSize = parseInt(jQuery("body").css("font-size"));
		this._iOffset = parseInt(0.25 * this._iREMSize);

		this._iResizeId = null;
		this._iAfterRenderingDomReadyTimeout = null;

		this._oABHelper = new ABHelper(this);

		this._initializeScroller();
	};

	/**
	 * update the anchor bar content accordingly to the section info and enable the lazy loading of the first visible sections
	 */

	ObjectPageLayout.prototype.onBeforeRendering = function () {

		var oHeaderContent,
			bPinnable;

		this._deregisterScreenSizeListener();

		if (this._oLazyLoading) {
			this._oLazyLoading.destroy();
		}
		// The lazy loading helper needs media information, hence instantiated on onBeforeRendering, where contextual width is available
		this._oLazyLoading = new LazyLoading(this);

		this._deregisterCustomEvents();

		if (!this.getVisible()) {
			return;
		}

		if (!this.getSelectedSection()) {
			this._bHeaderExpanded = true; // enforce to expanded header whenever selectedSection is reset
		}

		this._bMobileScenario = library.Utilities.isPhoneScenario(this._getCurrentMediaContainerRange());
		this._bTabletScenario = library.Utilities.isTabletScenario(this._getCurrentMediaContainerRange());

		if (this._checkAlwaysShowContentHeader()) {
			this._bHeaderExpanded = true; // enforce to expanded header whenever the <code>alwaysShowContentHeader</code> takes effect (it takes effect depending on screen size and header type)
		}

		this._bHeaderInTitleArea = this._shouldPreserveHeaderInTitleArea();

		this._createHeaderContent();
		this._getHeaderContent().setContentDesign(this._getHeaderDesign());
		this._oABHelper._getAnchorBar().setProperty("upperCase", this.getUpperCaseAnchorBar(), true);

		this._storeScrollLocation(); // store location *before* applying the UXRules (=> while the old sectionInfo with positionTop of sections is still available)
		this._applyUxRules();

		// If we are on the first true rendering : first time we render the page with section and blocks
		if (!jQuery.isEmptyObject(this._oSectionInfo) && this._bFirstRendering) {
			this._preloadSectionsOnBeforeFirstRendering();
			this._bFirstRendering = false;
		}

		this._bStickyAnchorBar = false; //reset default state in case of re-rendering

		// Detach expand button press event
		this._handleExpandButtonPressEventLifeCycle(false);
		this._attachTitlePressHandler();

		oHeaderContent = this._getHeaderContent();
		if (oHeaderContent && oHeaderContent.supportsPinUnpin()) {
			bPinnable = this.getHeaderContentPinnable() && !this.getPreserveHeaderStateOnScroll();
			this._getHeaderContent().setPinnable(bPinnable);
			if (bPinnable) {
				this._attachPinPressHandler();
			}
		}

		this._attachVisualIndicatorsPressHandlers(this._handleDynamicTitlePress, this);
		this._attachVisualIndicatorMouseOverHandlers(this._addHoverClass, this._removeHoverClass, this);
		this._attachTitleMouseOverHandlers(this._addHoverClass, this._removeHoverClass, this);

		if (this.getFooter() && this._bIsFooterAanimationGoing) {
			this._onToggleFooterAnimationEnd(this.getFooter());
		}
	};

	/**
	 * Sets the value of the <code>backgroundDesignAnchorBar</code> property.
	 *
	 * @param {sap.m.BackgroundDesign} sBackgroundDesignAnchorBar - new value of the <code>backgroundDesignAnchorBar</code>
	 * @return {sap.uxap.ObjectPageLayout} <code>this</code> to allow method chaining
	 * @public
	 * @since 1.58
	 */
	ObjectPageLayout.prototype.setBackgroundDesignAnchorBar = function (sBackgroundDesignAnchorBar) {
		var sCurrentBackgroundDesignAnchorBar = this.getBackgroundDesignAnchorBar();

		if (sCurrentBackgroundDesignAnchorBar === sBackgroundDesignAnchorBar) {
			return this;
		}

		this.setProperty("backgroundDesignAnchorBar", sBackgroundDesignAnchorBar);
		this._oABHelper._getAnchorBar().setBackgroundDesign(sBackgroundDesignAnchorBar);

		return this;
	};

	ObjectPageLayout.prototype.setToggleHeaderOnTitleClick = function (bToggleHeaderOnTitleClick) {
		var oDynamicPageTitle = this.getHeaderTitle(),
			vResult = this.setProperty("toggleHeaderOnTitleClick", bToggleHeaderOnTitleClick, true);

		if (!oDynamicPageTitle || !oDynamicPageTitle.supportsToggleHeaderOnTitleClick()) {
			Log.warning("Setting toggleHeaderOnTitleClick will not take effect as it is not supported in the ObjectPageHeader, read the API Doc for more information", this);
			return vResult;
		}

		bToggleHeaderOnTitleClick = this.getProperty("toggleHeaderOnTitleClick");
		this._updateToggleHeaderVisualIndicators();
		this._updateTitleVisualState();

		return vResult;
	};

	ObjectPageLayout.prototype._attachTitlePressHandler = function () {
		var oTitle = this.getHeaderTitle();

		if (exists(oTitle) && !this._bAlreadyAttachedTitlePressHandler) {
			oTitle.attachEvent(ObjectPageLayout.EVENTS.TITLE_PRESS, this._handleDynamicTitlePress, this);
			this._bAlreadyAttachedTitlePressHandler = true;
		}
	};

	ObjectPageLayout.prototype._toggleHeaderVisibility = function (bShow) {

		var oHeaderContent = this._getHeaderContent();

		if (exists(oHeaderContent)) {
			oHeaderContent.$().toggleClass("sapUxAPObjectPageHeaderContentHidden", !bShow);
		}
	};

	/**
	 * Snaps the header
	 * and toggles the state of the title and the anchorBar accordingly
	 *
	 * @param bAppendHeaderToContent, determines if the header should be snapped
	 * with or without scroll:
	 *
	 * (1) If the <code>bAppendHeaderToContent</code> is <code>true</code>, then the
	 * snapping is done by ensuring the header content is visible but scrolled-out of view
	 *
	 * (2) If the <code>bAppendHeaderToContent</code> is <code>false</code>, then the
	 * snapping is done by ensuring the header content is not visible using <code>display:none</code>
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._snapHeader = function (bAppendHeaderToContent) {

		var bIsPageTop,
			oHeaderContent = this._getHeaderContent();

		if (oHeaderContent && oHeaderContent.supportsPinUnpin() && this._bPinned) {
			this._unPin();
			oHeaderContent.getAggregation("_pinButton").setPressed(false);
			bAppendHeaderToContent = true;
		}

		this._toggleHeaderTitle(false /* not expand */, true /* user interaction */);
		this._toggleHeaderVisibility(bAppendHeaderToContent);
		this._moveAnchorBarToTitleArea();

		if (bAppendHeaderToContent) {
			this._moveHeaderToContentArea();
			this._bHeaderExpanded = false;

			this._updateToggleHeaderVisualIndicators();

			// recalculate layout of the content area
			this._adjustHeaderHeights();
			this._requestAdjustLayout(true);

			bIsPageTop = (this._$opWrapper.scrollTop() <= (this._getSnapPosition() + 1));
			if (bIsPageTop) {
				this._scrollTo(this._getSnapPosition() + 1);
			}
			return;
		}

		this._bHeaderExpanded = false;

		this._updateToggleHeaderVisualIndicators();

		//recalculate layout of the content area
		this._adjustHeaderHeights();
		this._requestAdjustLayout();
	};

	/**
	 * Expands the header
	 * and toggles the state of the title and the anchorBar accordingly
	 *
	 * @param bAppendHeaderToTitle, determines if the header should be in the
	 * scrollable content-area or in the non-scrollable title-area
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._expandHeader = function (bAppendHeaderToTitle) {

		this._toggleHeaderTitle(true /* expand */, true /* user interaction */);
		this._toggleHeaderVisibility(true);

		if (bAppendHeaderToTitle) {
			this._moveAnchorBarToTitleArea();
			this._moveHeaderToTitleArea();
			this._bHeaderExpanded = true;

			this._updateToggleHeaderVisualIndicators();

			//recalculate layout of the content area
			this._adjustHeaderHeights();
			this._requestAdjustLayout();
			return;
		}

		this._moveAnchorBarToContentArea();
		this._moveHeaderToContentArea();
		this._scrollTo(0, 0, 0);
		this._bHeaderExpanded = true;
		this._updateToggleHeaderVisualIndicators();
	};

	ObjectPageLayout.prototype._handleDynamicTitlePress = function () {
		if (!this.getToggleHeaderOnTitleClick() || !this._hasVisibleDynamicTitleAndHeader()) {
			return;
		}

		var bExpand = !this._bHeaderExpanded,
			bIsPageTop,
			bAppendHeaderToTitle,
			bAppendHeaderToContent;

		if (bExpand) {
			bIsPageTop = (this._$opWrapper.scrollTop() <= (this._getSnapPosition() + 1));
			bAppendHeaderToTitle = !this._headerBiggerThanAllowedToBeExpandedInTitleArea() && (this._shouldPreserveHeaderInTitleArea() || !bIsPageTop);
			this._expandHeader(bAppendHeaderToTitle);
			if (!bAppendHeaderToTitle) {
				this._scrollTo(0, 0);
			}
		} else {
			bAppendHeaderToContent = !this._shouldPreserveHeaderInTitleArea() &&
			(!this._bAllContentFitsContainer || this._headerBiggerThanAllowedToBeExpandedInTitleArea());
			// the <code>bAppendHeaderToContent</code> parameter determines if the header should snap *with* or *without* scroll
			this._snapHeader(bAppendHeaderToContent);
		}

		this.getHeaderTitle()._getFocusSpan().$().focus();
	};

	/**
	 * Attaches handler to the <code>ObjectPageDynamicHeaderContent</code> pin/unpin button <code>press</code> event.
	 * @private
	 */
	ObjectPageLayout.prototype._attachPinPressHandler = function () {
		var oHeaderContent = this._getHeaderContent();

		if (exists(oHeaderContent) && !this._bAlreadyAttachedPinPressHandler) {
			oHeaderContent.attachEvent(ObjectPageLayout.EVENTS.PIN_UNPIN_PRESS, this._onPinUnpinButtonPress, this);
			this._bAlreadyAttachedPinPressHandler = true;
		}
	};

	/**
	 * Attaches or detaches the "_handleExpandButtonPress" handler to the expand button of the HeaderTitle if available
	 * @param {boolean} bAttach should the method attach the event
	 * @private
	 */
	ObjectPageLayout.prototype._handleExpandButtonPressEventLifeCycle = function (bAttach) {
		var oHeaderTitle = this.getHeaderTitle(),
			bHasDynamicTitle = this._hasDynamicTitle(),
			oExpandButton;

		if (oHeaderTitle && !bHasDynamicTitle) {
			oExpandButton = oHeaderTitle.getAggregation("_expandButton");
			if (oExpandButton) {
				oExpandButton[bAttach ? "attachPress" : "detachPress"](this._handleExpandButtonPress, this);
			}
		}
	};

	ObjectPageLayout.prototype._adjustSelectedSectionByUXRules = function () {
		var oSelectedSection = this.oCore.byId(this.getSelectedSection()),
			bValidSelectedSection = oSelectedSection && this._sectionCanBeRenderedByUXRules(oSelectedSection);

		if (!bValidSelectedSection) {
			if (this._oFirstVisibleSection) {
				oSelectedSection = this._oFirstVisibleSection; // next candidate
				this.setAssociation("selectedSection", oSelectedSection.getId(), true);
			} else {
				this.setAssociation("selectedSection", null, true);
				return; // skip further computation as there is no a section to be selected
			}
		}
	};

	ObjectPageLayout.prototype._sectionCanBeRenderedByUXRules = function (oSection) {

		// SubSection binding info is needed later in order to decide wether a section
		// can be rendered by UX rules, i.e.
		// if a section is bound, it is expected to not be empty
		var oSubSectionsBindingInfo = oSection.getBindingInfo("subSections");

		if (
			(!oSection || !oSection.getVisible() || !oSection._getInternalVisible()) &&
			!oSubSectionsBindingInfo
		) {
			return false;
		}

		var aSectionBasesIds = this._aSectionBases.map(function (oSectionBase) {
			return oSectionBase.getId();
		});

		return (aSectionBasesIds.indexOf(oSection.getId()) > -1);
	};

	/**
	 * Retrieves the list of sections to render initially
	 * (the list includes the sections to be loaded lazily, as these are empty in the beginning, only their skeleton will be rendered)
	 * @returns the sections list
	 */
	ObjectPageLayout.prototype._getSectionsToRender = function () {
		this._adjustSelectedSectionByUXRules();
		var oSelectedSection = this.oCore.byId(this.getSelectedSection());

		if (this.getUseIconTabBar() && oSelectedSection) {
			return [oSelectedSection]; // only the content for the selected tab should be rendered
		} else {
			return this.getSections();
		}
	};

	/**
	 * Preloads the expected first visible (sub)sections
	 * on *initial* rendering  on the page
	 * to make their data early available
	 * (so that the user does not have to wait to see data).
	 * @private
	 */
	ObjectPageLayout.prototype._preloadSectionsOnBeforeFirstRendering = function () {
		var aToLoad = this._getSectionsToPreloadOnBeforeFirstRendering();

		this._connectModelsForSections(aToLoad);

		// early notify that subSections are being loaded
		if (this.getEnableLazyLoading()) {
			aToLoad.forEach(function (subSection) {
				this.fireEvent("subSectionPreload", {
					subSection: subSection
				});
			}, this);
		}
	};

	/**
	 * Returns a subset (or all) of the visible (sub)sections to be loaded on initial rendering.
	 *
	 * In case of *no* lazyLoading, it will return *all visible* sections
	 *
	 * In case of lazyLoading, it will return only the *first visible* subSections,
	 * where *first visible* depends on:
	 * (1) the currently <code>selectedSection</code>
	 * (2) the static configuration for the count of items to preload in <code>sap.uxap._helpers.LazyLoading</code>
	 *
	 * @returns the subSections list
	 */
	ObjectPageLayout.prototype._getSectionsToPreloadOnBeforeFirstRendering = function () {
		var aSectionBases,
			oSelectedSection,
			iIndexOfSelectedSection;

		if (!this.getEnableLazyLoading()) {
			// In case we are not lazy loaded make sure that we connect the blocks properly...
			return this._getSectionsToRender(); // load *all* renderable sections
		}

		if (this.getUseIconTabBar()) { //lazy loading and tabs => connect first visible subsections of current tab
			return this._oLazyLoading.getSubsectionsToPreload(this._grepCurrentTabSectionBases());
		}

		// connect the first visible subsections
		// first visible depends on selectedSection => obtain latest selectedSection first:
		this._adjustSelectedSectionByUXRules();
		oSelectedSection = this.oCore.byId(this.getSelectedSection());

		if (!oSelectedSection || (oSelectedSection === this._oFirstVisibleSection)) {
			return this._oLazyLoading.getSubsectionsToPreload(this._aSectionBases); // no offset needed, as selectedSection is the firstVisible
		}

		// return only subsections that include and follow the selectedSection
		// => discard sections *above* the selected one
		// as they will not be within the first visible in the viewport
		iIndexOfSelectedSection = this.indexOfSection(oSelectedSection);
		var fnFilterSections = function (oSectionBase) {
			var oSection = oSectionBase.isA("sap.uxap.ObjectPageSection") ? oSectionBase : oSectionBase.getParent();
			return this.indexOfSection(oSection) >= iIndexOfSelectedSection;
		}.bind(this);

		aSectionBases = this._aSectionBases.filter(fnFilterSections);
		return this._oLazyLoading.getSubsectionsToPreload(aSectionBases);
	};

	ObjectPageLayout.prototype._grepCurrentTabSectionBases = function () {
		var oFiltered = [],
			oSectionToLoad,
			oSectionParent;

		this._adjustSelectedSectionByUXRules();
		oSectionToLoad = this.oCore.byId(this.getSelectedSection());

		if (oSectionToLoad) {
			var sSectionToLoadId = oSectionToLoad.getId();
			this._aSectionBases.forEach(function (oSection) {
				oSectionParent = oSection.getParent();
				if (oSectionParent && oSectionParent.getId() === sSectionToLoadId) {
					oFiltered.push(oSection);
				}
			});
		}
		return oFiltered;
	};

	/*************************************************************************************
	 * header & scroll management
	 ************************************************************************************/

	ObjectPageLayout.prototype.onAfterRendering = function () {
		var oHeaderContent = this._getHeaderContent(),
			oFooter = this.getFooter(),
			sFooterAriaLabel,
			iWidth = this._getWidth(this);

		this._iResizeId = ResizeHandler.register(this, this._onUpdateScreenSize.bind(this));

		this._ensureCorrectParentHeight();

		this._cacheDomElements();

		if (this._hasDynamicTitle()) {
			this.addStyleClass("sapUxAPObjectPageHasDynamicTitle");
		}

		if (iWidth > 0) {
			this._updateMedia(iWidth, ObjectPageLayout.MEDIA);
		}

		this._$opWrapper.on("scroll.OPL", this._onScroll.bind(this));

		//the dom is already ready (re-rendering case), thus we compute the header immediately
		//in order to avoid flickering (see Incident 1570011343)
		if (this._bDomReady && this.$().parents(":hidden").length === 0) {
			this._onAfterRenderingDomReady();
		} else {
			// schedule instead
			if (this._iAfterRenderingDomReadyTimeout) { // if the page was rerendered before the previous scheduled task completed, cancel the previous
				clearTimeout(this._iAfterRenderingDomReadyTimeout);
			}
			this._iAfterRenderingDomReadyTimeout = setTimeout(this._onAfterRenderingDomReady.bind(this), this._getDOMCalculationDelay());
		}

		if (oHeaderContent && oHeaderContent.supportsPinUnpin()) {
			this.$().toggleClass("sapUxAPObjectPageLayoutHeaderPinnable", oHeaderContent.getPinnable());
		}

		if (oFooter) {
			sFooterAriaLabel = ObjectPageLayout._getLibraryResourceBundle().getText("FOOTER_ARIA_LABEL");
			oFooter.$().attr("aria-label", sFooterAriaLabel);
		}

		// Attach expand button event
		this._handleExpandButtonPressEventLifeCycle(true);
	};

	ObjectPageLayout.prototype._onAfterRenderingDomReady = function () {
		var sSectionToSelectID, oSectionToSelect, bAppendHeaderToContent;

		if (this._bIsBeingDestroyed) {
			return;
		}

		this._adjustSelectedSectionByUXRules(); //validate again as in could have been changed by the app in page's onAfterRendering hook
		sSectionToSelectID = this.getSelectedSection();
		oSectionToSelect = this.oCore.byId(sSectionToSelectID);

		this._iAfterRenderingDomReadyTimeout = null;
		this._bDomReady = true;
		this._adjustHeaderHeights();

		this._initAnchorBarScroll();

		if (sSectionToSelectID) {

			if (this.getUseIconTabBar()) {
				this._setSelectedSectionId(sSectionToSelectID);
				this._setCurrentTabSection(oSectionToSelect);
				// in iconTabBar mode, only the subSections of the current section are shown
				// => update the <code>this._bAllContentFitsContainer</code> value
				this._bAllContentFitsContainer = this._hasSingleVisibleFullscreenSubSection(oSectionToSelect);
			} else {
				this.scrollToSection(sSectionToSelectID, 0);
			}
		}
		// enable scrolling in non-fullscreen-mode only
		// (to avoid any scrollbar appearing even for an instance while we snap/unsnap header)
		this._toggleScrolling(!this._bAllContentFitsContainer);

		if (Device.system.desktop) {
			this._$opWrapper.on("scroll.OPL", this.onWrapperScroll.bind(this));
		}

		this._registerOnContentResize();

		this.getHeaderTitle() && this._shiftHeaderTitle();
		this.getFooter() && this._shiftFooter();

		this._setSectionsFocusValues();

		if (this._preserveHeaderStateOnScroll()) {
			this._overridePreserveHeaderStateOnScroll();
		}

		if (!this._bHeaderExpanded) {
			bAppendHeaderToContent = !this._shouldPreserveHeaderInTitleArea() && !this._bAllContentFitsContainer;
			// the <code>bAppendHeaderToContent</code> parameter determines if the header should snap *with* or *without* scroll
			this._snapHeader(bAppendHeaderToContent);
		}

		this._restoreScrollPosition();

		this.oCore.getEventBus().publish("sap.ui", "ControlForPersonalizationRendered", this);

		this._updateMedia(this._getWidth(this), ObjectPageLayout.MEDIA);

		if (this._hasDynamicTitle()) {
			this._updateMedia(this._getWidth(this), ObjectPageLayout.DYNAMIC_HEADERS_MEDIA);
		}

		this._updateToggleHeaderVisualIndicators();
		this._updateTitleVisualState();

		this.fireEvent("onAfterRenderingDOMReady");
	};

	/**
	 * Suppresses or enables scrolling
	 * used to supress scrolling in fullscreen-mode
	 * (to avoid a problem with scrollbar appearing for a small instance
	 * while we snap/unsnap header)
	 * @private
	 * @param {Boolean} bEnable used to supress scrolling
	 */
	ObjectPageLayout.prototype._toggleScrolling = function (bEnable) {
		if (this._$opWrapper.length) {
			this._$opWrapper.get(0).style.overflowY = bEnable ? "auto" : "hidden";
		}
	};

	/**
	 * Shift footer horizontally with regards to the scroll bar width.
	 * @private
	*/
	ObjectPageLayout.prototype._shiftFooter = function () {
		var $footer = this.$("footerWrapper"),
			oShiftOffsetParams = this._calculateShiftOffset();
		$footer.css(oShiftOffsetParams.sStyleAttribute, oShiftOffsetParams.iMarginalsOffset + "px");
	};

	/**
	 * Calculate the parameters of marginals horizontal shift.
	 * @private
	 */
	ObjectPageLayout.prototype._calculateShiftOffset = function () {
		var iHeaderOffset = 0,
			sStyleAttribute = this.oCore.getConfiguration().getRTL() ? "left" : "right",
			bHasVerticalScroll = this._hasVerticalScrollBar(),
			iActionsOffset = this._iOffset,
			iScrollbarWidth;

		if (Device.system.desktop) {
			iScrollbarWidth = getScrollbarSize().width;
			iHeaderOffset = iScrollbarWidth;
			if (!bHasVerticalScroll) {
				iHeaderOffset = 0;
				iActionsOffset += iScrollbarWidth;
			}
		}
		return {"sStyleAttribute": sStyleAttribute, "iActionsOffset": iActionsOffset, "iMarginalsOffset": iHeaderOffset};
	};

	/**
	 * Get the amount of time (in ms) to wait before obtaining DOM metrics.
	 * This delay is used for optimization purposes, to ensure that only the *final* metrics are obtained.
	 * @private
	 */
	ObjectPageLayout.prototype._getDOMCalculationDelay = function () {
		return this._bDelayDOMBasedCalculations ? ObjectPageLayout.HEADER_CALC_DELAY : 0;
	};

	ObjectPageLayout.prototype.exit = function () {
		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		this._deregisterScreenSizeListener();

		if (this._iContentResizeId) {
			ResizeHandler.deregister(this._iContentResizeId);
		}

		if (this._iAfterRenderingDomReadyTimeout) {
			clearTimeout(this._iAfterRenderingDomReadyTimeout);
		}

		if (this._oObserver) {
			this._oObserver.disconnect();
			this._oObserver = null;
		}

		this._deregisterCustomEvents();

		// setting these to null is necessary because
		// some late callbacks may still have access to the page
		// (and try to process the page) after the page is being destroyed
		this._oFirstVisibleSection = null;
		this._oFirstVisibleSubSection = null;
	};

	ObjectPageLayout.prototype._getCustomScrollBar = function () {

		if (!this.getAggregation("_customScrollBar")) {
			var oVSB = new ScrollBar(this.getId() + "-vertSB", {
				scrollPosition: 0,
				scroll: this.onCustomScrollerScroll.bind(this),
				visible: false
			});
			this.setAggregation("_customScrollBar", oVSB, true);
		}

		return this.getAggregation("_customScrollBar");
	};

	ObjectPageLayout.prototype.onWrapperScroll = function (oEvent) {
		var iScrollTop = Math.max(oEvent.target.scrollTop, 0);

		if (this._getCustomScrollBar()) {
			if (this.allowCustomScroll === true) {
				this.allowCustomScroll = false;
				return;
			}
			this.allowInnerDiv = true;

			this._getCustomScrollBar().setScrollPosition(iScrollTop);
		}
	};

	ObjectPageLayout.prototype.onCustomScrollerScroll = function (oEvent) {
		var iScrollTop = Math.max(this._getCustomScrollBar().getScrollPosition(), 0); // top of the visible page

		if (this.allowInnerDiv === true) {
			this.allowInnerDiv = false;
			return;
		}
		this.allowCustomScroll = true;

		jQuery(this._$opWrapper).scrollTop(iScrollTop);
	};

	ObjectPageLayout.prototype.setShowOnlyHighImportance = function (bValue) {
		var bOldValue = this.getShowOnlyHighImportance();

		if (bOldValue !== bValue) {
			this.setProperty("showOnlyHighImportance", bValue, true);
			this.getSections().forEach(function (oSection) {
				oSection._updateImportance();
			});
		}
		return this;
	};

	ObjectPageLayout.prototype.setIsHeaderContentAlwaysExpanded = function (bValue) {
		var bOldValue = this.getAlwaysShowContentHeader();
		var bSuppressInvalidate = (Device.system.phone || Device.system.tablet);

		if (bOldValue !== bValue) {
			this.setProperty("alwaysShowContentHeader", bValue, bSuppressInvalidate);
		}
		return this;
	};

	ObjectPageLayout.prototype.setShowEditHeaderButton = function (bValue) {
		var bOldValue = this.getShowEditHeaderButton(),
			oHeaderContent = this.getAggregation("_headerContent");

		if (bOldValue !== bValue) {
			this.setProperty("showEditHeaderButton", bValue, true);
			oHeaderContent && oHeaderContent.invalidate();
		}
		return this;
	};

	ObjectPageLayout.prototype._initializeScroller = function () {
		if (this._oScroller) {
			return;
		}

		this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
			horizontal: false,
			vertical: true
		});
	};

	/**
	 * Sets the section that should be selected.
	 *
	 * The section can either be given by itself or by its id.
	 *
	 * Note that an argument of <code>null</code> will cause the first visible section be set as <code>selectedSection</code>.
	 * This is because the <code>sap.uxap.ObjectPageLayout</code> should always have one of its sections selected (unless it has 0 visible sections).
	 *
	 * @param {string | sap.uxap.ObjectPageSection} sId
	 *            The ID or the section instance that should be selected
	 *            Note that <code>null</code> or <code>undefined</code> are not valid arguments
	 * @return {sap.uxap.ObjectPageLayout} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	ObjectPageLayout.prototype.setSelectedSection = function (sId) {
		var vClosestSection,
			sSectionIdToSet;

		if (sId instanceof ObjectPageSectionBase) {
			sId = sId.getId();
		} else if (sId != null && typeof sId !== "string") {
			assert(false, "setSelectedSection(): sId must be a string, an instance of sap.uxap.ObjectPageSection or null");
			return this;
		}

		if (sId === this.getSelectedSection()){
			return this; // no change
		}

		if (sId === null) {
			this.setAssociation("selectedSection", null, true);
			this._expandHeader(this._bHeaderInTitleArea);
			this._requestAdjustLayoutAndUxRules(true); // obtains the firstVisible section and scrolls to it if needed
			return this;
		}

		this.scrollToSection(sId);
		//note there was no validation whether oSection was child of ObjectPage/visible/non-empty,
		//because at the point of calling this setter, the sections setup may not be complete yet
		//but we still need to save the selectedSection value
		vClosestSection = ObjectPageSection._getClosestSection(sId);
		sSectionIdToSet = (vClosestSection instanceof ObjectPageSection) ? vClosestSection.getId() : vClosestSection;
		return this.setAssociation("selectedSection", sSectionIdToSet, true);
	};

	/**
	 * if our container has not set a height, we need to enforce it or nothing will get displayed
	 * the reason is the objectPageLayout has 2 containers with position:absolute, height:100%
	 * @private
	 */
	ObjectPageLayout.prototype._ensureCorrectParentHeight = function () {
		if (this._bCorrectParentHeightIsSet) {
			return;
		}

		/* BCP: 1670054830 - returned the original check here since it was breaking in a case where
		the object page was embedded in sap.m.Page, the sap.m.Page already had height 100%,
		but we set it to its content div where the ObjectPage is resulting in the sap.m.Page
		footer would float above some of the ObjectPage content. Its still a bit strange that we check
		for the framework controls parent's height, but then we apply height 100% to the direct dom parent. */
		if (this.getParent().getHeight && ["", "auto"].indexOf(this.getParent().getHeight()) !== -1) {
			this.$().parent().css("height", "100%");
		}

		this._bCorrectParentHeightIsSet = true;
	};

	ObjectPageLayout.prototype._cacheDomElements = function () {
		this._$footerWrapper = jQuery(document.getElementById(this.getId() + "-footerWrapper"));
		this._$titleArea = jQuery(document.getElementById(this.getId() + "-headerTitle"));
		this._$anchorBar = jQuery(document.getElementById(this.getId() + "-anchorBar"));
		this._$stickyAnchorBar = jQuery(document.getElementById(this.getId() + "-stickyAnchorBar"));
		this._$opWrapper = jQuery(document.getElementById(this.getId() + "-opwrapper"));
		this._$spacer = jQuery(document.getElementById(this.getId() + "-spacer"));
		this._$headerContent = jQuery(document.getElementById(this.getId() + "-headerContent"));
		this._$stickyHeaderContent = jQuery(document.getElementById(this.getId() + "-stickyHeaderContent"));
		this._$contentContainer = jQuery(document.getElementById(this.getId() + "-scroll"));
		this._$sectionsContainer = jQuery(document.getElementById(this.getId() + "-sectionsContainer"));

		// BCP 1870201875: explicitly set the latest scrollContainer dom ref
		// (as the scroller obtains the latest scrollContainer dom ref in a LATER hook, which fails in conditions detailed in BCP 1870201875)
		this._oScroller._$Container = this._$opWrapper;

		this._bDomElementsCached = true;
	};

	/**
	 * Handles the press of the expand header button
	 * @private
	 */
	ObjectPageLayout.prototype._handleExpandButtonPress = function (oEvent) {
		this._expandHeader(true);
	};

	/**
	 * Toggles visual rules on manually expand or collapses the sticky header
	 * @private
	 */
	ObjectPageLayout.prototype._toggleHeaderTitle = function (bExpand, bUserInteraction) {
		var oHeaderTitle = this.getHeaderTitle();

		// note that <code>this._$titleArea</code> is the placeholder [of the sticky area] where both the header title and header content are placed
		this._$titleArea.toggleClass("sapUxAPObjectPageHeaderStickied", !bExpand);
		this._$titleArea.toggleClass("sapUxAPObjectPageHeaderSnappedTitleOnMobile",
				this._hasDynamicTitleWithSnappedTitleOnMobile() && !bExpand);

		if (bExpand) {
			oHeaderTitle && oHeaderTitle.unSnap(bUserInteraction);
		} else {
			oHeaderTitle && oHeaderTitle.snap(bUserInteraction);
		}
	};

	/**
	 * Moves the header to the title area
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._moveHeaderToTitleArea = function () {
		this._$headerContent.children().appendTo(this._$stickyHeaderContent);
		this._bHeaderInTitleArea = true;

		// suppress the first scroll event to prevent the header snap again immediately
		this._bSupressModifyOnScrollOnce = true;
	};

	/**
	 * Moves the header to the content area
	 * @private
	 */
	ObjectPageLayout.prototype._moveHeaderToContentArea = function () {
		if (this._bHeaderInTitleArea) {
			this._$headerContent.append(this._$stickyHeaderContent.children());
			this._$stickyHeaderContent.children().remove();
			this._bHeaderInTitleArea = false;
		}
	};

	ObjectPageLayout.prototype._updateNavigation = function () {
		if (this.getShowAnchorBar()) {
			this._oABHelper._buildAnchorBar();
		}
	};

	/*************************************************************************************
	 * Ux rules
	 ************************************************************************************/
	/**
	 * updates the objectPageLayout structure based on ux rules
	 * This affects data!
	 * @private
	 * @param {boolean} bInvalidate request the invalidation of the sectionBase that would turn into visible or hidden. This may not be necessary if you are already within a rendering process.
	 */
	ObjectPageLayout.prototype._applyUxRules = function (bInvalidate) {
		var aSections, aSubSections, iVisibleSubSections, iVisibleSection, iVisibleBlocks,
			bVisibleAnchorBar, bUseIconTabBar, oFirstVisibleSection, oFirstVisibleSubSection,
			bFirstSectionTitleHidden, aContent, iFirstVisibleSectionVisibleSubSections, oTitleVisibilityInfo = {},
			bShouldShowFirstSectionTitle;

		aSections = this.getSections() || [];
		iVisibleSection = 0;
		bVisibleAnchorBar = this.getShowAnchorBar();
		bUseIconTabBar = this.getUseIconTabBar();
		bShouldShowFirstSectionTitle = aSections.length <= 1;

		oFirstVisibleSection = null;

		this._cleanMemory();

		aSections.forEach(function (oSection) {

			//ignore hidden sections
			if (!oSection.getVisible()) {
				return true;
			}

			this._registerSectionBaseInfo(oSection);
			aSubSections = oSection.getSubSections() || [];
			iVisibleSubSections = 0;
			oFirstVisibleSubSection = null;

			aSubSections.forEach(function (oSubSection) {

				//ignore hidden subSection
				if (!oSubSection.getVisible()) {
					return true;
				}

				this._registerSectionBaseInfo(oSubSection);
				iVisibleBlocks = oSubSection.getVisibleBlocksCount();

				//rule noVisibleBlock: If a subsection has no visible content the subsection will be hidden.
				if (iVisibleBlocks === 0) {
					oSubSection._setInternalVisible(false, bInvalidate);
					Log.info("ObjectPageLayout :: noVisibleBlock UX rule matched", "subSection " + oSubSection.getTitle() + " forced to hidden");
				} else {
					oSubSection._setInternalVisible(true, bInvalidate);
					//if TitleOnTop.sectionGetSingleSubSectionTitle is matched, this will be hidden back
					oTitleVisibilityInfo[oSubSection.getId()] = true;
					iVisibleSubSections++;
					if (!oFirstVisibleSubSection) {
						oFirstVisibleSubSection = oSubSection;
					}

					if (this._shouldApplySectionTitleLevel(oSubSection)) {
						oSubSection._setInternalTitleLevel(this._determineSectionBaseInternalTitleLevel(oSubSection));
					}
				}

			}, this);

			//rule noVisibleSubSection: If a section has no content (or only empty subsections) the section will be hidden.
			if (iVisibleSubSections == 0) {
				oSection._setInternalVisible(false, bInvalidate);
				Log.info("ObjectPageLayout :: noVisibleSubSection UX rule matched", "section " + oSection.getTitle() + " forced to hidden");
			} else {
				oSection._setInternalVisible(true, bInvalidate);
				oTitleVisibilityInfo[oSection.getId()] = true;
				if (!oFirstVisibleSection) {
					oFirstVisibleSection = oSection;
					iFirstVisibleSectionVisibleSubSections = iVisibleSubSections;
				}

				//rule TitleOnTop.sectionGetSingleSubSectionTitle: If a section as only 1 subsection and the subsection title is not empty, the section takes the subsection title on titleOnTop layout only
				if (this.getSubSectionLayout() === ObjectPageSubSectionLayout.TitleOnTop &&
					iVisibleSubSections === 1 && oFirstVisibleSubSection.getTitle().trim() !== "") {
					Log.info("ObjectPageLayout :: TitleOnTop.sectionGetSingleSubSectionTitle UX rule matched", "section " + oSection.getTitle() + " is taking its single subsection title " + oFirstVisibleSubSection.getTitle());
					oSection._setInternalTitle(oFirstVisibleSubSection.getTitle(), bInvalidate);
					oTitleVisibilityInfo[oFirstVisibleSubSection.getId()] = false;

					// Title propagation support - set the borrowed Dom ID to the section title
					oFirstVisibleSubSection._setBorrowedTitleDomId(oSection.getId() + "-title");
				} else {
					oSection._setInternalTitle("", bInvalidate);
				}

				if (iVisibleSubSections === 1 && !oFirstVisibleSubSection.getTitle().trim()) {
					oFirstVisibleSubSection._setBorrowedTitleDomId(oSection.getId() + "-title");
				}

				if (this._shouldApplySectionTitleLevel(oSection)) {
					oSection._setInternalTitleLevel(this._determineSectionBaseInternalTitleLevel(oSection));
				}

				iVisibleSection++;
			}

			if (bUseIconTabBar) {
				oTitleVisibilityInfo[oSection.getId()] = bShouldShowFirstSectionTitle;
			}
		}, this);

		//rule notEnoughVisibleSection: If there is only 1 section overall, the navigation control shall be hidden.
		if (iVisibleSection <= 1) {
			bVisibleAnchorBar = false;
			Log.info("ObjectPageLayout :: notEnoughVisibleSection UX rule matched", "anchorBar forced to hidden");
			//rule firstSectionTitleHidden: the first section title is never visible if there is an anchorBar
		} else if (oFirstVisibleSection && bVisibleAnchorBar) {
			bFirstSectionTitleHidden = true;
			oTitleVisibilityInfo[oFirstVisibleSection.getId()] = false;
			Log.info("ObjectPageLayout :: firstSectionTitleHidden UX rule matched", "section " + oFirstVisibleSection.getTitle() + " title forced to hidden");
		}

		this.toggleStyleClass(ObjectPageLayout.NO_NAVIGATION_CLASS_NAME, bVisibleAnchorBar);

		Object.keys(oTitleVisibilityInfo).forEach(function(sId) {
			this.oCore.byId(sId)._setInternalTitleVisible(oTitleVisibilityInfo[sId], bInvalidate);
		}.bind(this));

		// the AnchorBar needs to reflect the dom state
		if (bVisibleAnchorBar) {
			this._oABHelper._buildAnchorBar();
		}

		this._setInternalAnchorBarVisible(bVisibleAnchorBar, bInvalidate);
		this._oFirstVisibleSection = oFirstVisibleSection;
		this._oFirstVisibleSubSection = this._getFirstVisibleSubSection(oFirstVisibleSection);
		this._bAllContentFitsContainer = (iVisibleSection === 1)
			&& (iVisibleSubSections === 1)
			&& this._oFirstVisibleSubSection.hasStyleClass(ObjectPageSubSection.FIT_CONTAINER_CLASS);

		if (bFirstSectionTitleHidden && (iFirstVisibleSectionVisibleSubSections === 1)) {
			// Title propagation support - set the borrowed title Dom ID to the first AnchorBar button
			aContent = this.getAggregation("_anchorBar").getContent();
			if (aContent.length) {
				this._oFirstVisibleSubSection._setBorrowedTitleDomId(aContent[0].getId() + "-content");
			}
		}
	};

	/* IconTabBar management */

	ObjectPageLayout.prototype.setUseIconTabBar = function (bValue) {

		var bOldValue = this.getUseIconTabBar();
		if (bValue != bOldValue) {
			this._applyUxRules(); // UxRules contain logic that depends on whether we use iconTabBar or not
		}
		this.setProperty("useIconTabBar", bValue);
		return this;
	};

	/**
	 * Sets a new section to be displayed as currently selected tab
	 * @param oSection
	 * @private
	 */
	ObjectPageLayout.prototype._setCurrentTabSection = function (oSection, bIsTabClicked) {
		if (!oSection) {
			return;
		}

		var oSubsection;

		if (oSection instanceof sap.uxap.ObjectPageSubSection) {
			oSubsection = oSection;
			oSection = oSection.getParent();
		} else {
			oSubsection = this._getFirstVisibleSubSection(oSection);
		}

		if (this._oCurrentTabSection !== oSection) {
			this._renderSection(oSection);
			this._oCurrentTabSection = oSection;
		}
		this._oCurrentTabSubSection = oSubsection;
	};

	/**
	 * renders the given section in the ObjectPageContainer html element, without causing re-rendering of the ObjectPageLayout,
	 * used for switching between sections, when the navigation is through IconTabBar
	 * @param oSectionToRender
	 * @private
	 */
	ObjectPageLayout.prototype._renderSection = function (oSectionToRender) {
		var $objectPageContainer = this.$().find(".sapUxAPObjectPageContainer"),
			oRm;

		if (oSectionToRender && $objectPageContainer.length) {
			oRm = this.oCore.createRenderManager();

			this.getSections().forEach(function (oSection) {
				if ((oSection.getId() === oSectionToRender.getId())) {
					oRm.renderControl(oSectionToRender);
				} else {
					oRm.cleanupControlWithoutRendering(oSection); // clean the previously rendered sections
				}
			});

			oRm.flush($objectPageContainer[0]); // place the section in the ObjectPageContainer
			oRm.destroy();
		}
	};

	/* AnchorBar management */

	ObjectPageLayout.prototype.setShowAnchorBarPopover = function (bValue, bSuppressInvalidate) {

		var bOldValue = this.getProperty("showAnchorBarPopover"),
			bValue = this.validateProperty("showAnchorBarPopover", bValue),
			sSelectedSectionId = this.getSelectedSection();

		if (bValue === bOldValue) {
			return this;
		}

		this._oABHelper._getAnchorBar().setShowPopover(bValue);
		this._oABHelper._buildAnchorBar();
		this._setSelectedSectionId(sSelectedSectionId);

		return this.setProperty("showAnchorBarPopover", bValue, true /* don't re-render the whole objectPageLayout */);
	};

	ObjectPageLayout.prototype._getInternalAnchorBarVisible = function () {
		return this._bInternalAnchorBarVisible;
	};

	ObjectPageLayout.prototype._setInternalAnchorBarVisible = function (bValue, bInvalidate) {
		if (bValue != this._bInternalAnchorBarVisible) {
			this._bInternalAnchorBarVisible = bValue;
			if (bInvalidate === true) {
				this.invalidate();
			}
		}
	};


	ObjectPageLayout.prototype.setUpperCaseAnchorBar = function (bValue) {
		this._oABHelper._getAnchorBar().setProperty("upperCase", bValue);
		return this.setProperty("upperCaseAnchorBar", bValue, true /* don't re-render the whole objectPageLayout */);
	};

	/*************************************************************************************
	 * layout management
	 ************************************************************************************/

	/**
	 * Schedules for execution a layout adjustment task.
	 * This task is throttled by default (unless the bImmediate parameter is specified).
	 * @param {Boolean} bImmediate - whether the task should be executed immediately, rather than throttled
	 * @returns {Promise} - promise that will be resolved upon the task execution
	 * @since 1.44
	 * @private
	 */
	ObjectPageLayout.prototype._requestAdjustLayout = function (bImmediate) {

		if (!this._oLayoutTask) {
			this._oLayoutTask = new ThrottledTask(
				this._updateScreenHeightSectionBasesAndSpacer, //function to execute
				ObjectPageLayout.DOM_CALC_DELAY, // throttle delay
				this); // context
		}
		if (!bImmediate) {
			Log.debug("ObjectPageLayout :: _requestAdjustLayout", "delayed by " + ObjectPageLayout.DOM_CALC_DELAY + " ms because of dom modifications");
		}

		return this._oLayoutTask.reSchedule(bImmediate, {}).catch(function(reason) {
			// implement catch function to prevent uncaught errors message
		}); // returns promise
	};

	ObjectPageLayout.prototype._requestAdjustLayoutAndUxRules = function (bImmediate) {
		this._setSectionInfoIsDirty(true);

		if (!this._oUxRulesTask) {
			this._oUxRulesTask = new ThrottledTask(
				this._adjustLayoutAndUxRules, //function to execute
				ObjectPageLayout.DOM_CALC_DELAY, // throttle delay
				this); // context
		}
		if (!bImmediate) {
			Log.debug("ObjectPageLayout :: _requestAdjustLayoutAndUxRules", "delayed by " + ObjectPageLayout.DOM_CALC_DELAY + " ms because of dom modifications");
		}

		return this._oUxRulesTask.reSchedule(bImmediate, {}).catch(function(reason) {
			// implement catch function to prevent uncaught errors message
		}); // returns promise
	};

	/**
	 * adjust the layout but also the ux rules
	 * used for refreshing the overall structure of the objectPageLayout when it as been updated after the first rendering
	 * @private
	 */

	ObjectPageLayout.prototype._adjustLayoutAndUxRules = function () {

		var sSelectedSectionId,
			oSelectedSection;

		//in case we have added a section or subSection which change the ux rules
		Log.debug("ObjectPageLayout :: _requestAdjustLayout", "refreshing ux rules");

		this._applyUxRules(true);

		/* reset the selected section,
		 as the previously selected section may not be available anymore,
		 as it might have been deleted, or emptied, or set to hidden in the previous step */
		this._adjustSelectedSectionByUXRules();
		sSelectedSectionId = this.getSelectedSection();
		oSelectedSection = this.oCore.byId(sSelectedSectionId);

		if (oSelectedSection) {
			this._setSelectedSectionId(sSelectedSectionId); //reselect the current section in the navBar (because the anchorBar was freshly rebuilt from scratch)
			if (this.getUseIconTabBar()) {
				this._setCurrentTabSection(oSelectedSection);
			}
			this._requestAdjustLayout(true)
				.then(function (bSuccess) { // scrolling must be done after the layout adjustment is done (so the latest section positions are determined)
					if (bSuccess) {
						this._oLazyLoading.doLazyLoading();
					}
					this._adjustSelectedSectionByUXRules(); //section may have changed again from the app before the promise completed => ensure adjustment
					sSelectedSectionId = this.getSelectedSection();
					// if the current scroll position is not at the selected section OR the ScrollEnablement is still scrolling due to an animation
					if (!this._isClosestScrolledSection(sSelectedSectionId) || this._oScroller._$Container.is(":animated")) {
						// then change the selection to match the correct section
						this.scrollToSection(sSelectedSectionId, null, 0, false, true /* redirect scroll */);
					}
				}.bind(this));
		}
	};


	ObjectPageLayout.prototype._isClosestScrolledSection = function (sSectionId) {
		var iScrollTop = this._$opWrapper.length > 0 ? this._$opWrapper.scrollTop() : 0,
			iPageHeight = this.iScreenHeight,
			sClosestSectionId = this._getClosestScrolledSectionId(iScrollTop, iPageHeight);

		return sClosestSectionId && (sSectionId === sClosestSectionId);
	};

	ObjectPageLayout.prototype._setSelectedSectionId = function (sSelectedSectionId) {
		var oAnchorBar = this.getAggregation("_anchorBar"),
			oSelectedSectionInfo = sSelectedSectionId && this._oSectionInfo[sSelectedSectionId];

		if (!oSelectedSectionInfo) {
			return;
		}

		if (oAnchorBar && oSelectedSectionInfo.buttonId) {
			oAnchorBar.setSelectedButton(oSelectedSectionInfo.buttonId);
			this.setAssociation("selectedSection", sSelectedSectionId, true);
		}
	};


	ObjectPageLayout.prototype.isFirstRendering = function () {
		return this._bFirstRendering;
	};

	/**
	 * clean the oSectionInfo and aSectionBases internal properties
	 * as the oSectionInfo contains references to created objects, we make sure to destroy them properly in order to avoid memory leaks
	 * @private
	 */
	ObjectPageLayout.prototype._cleanMemory = function () {
		var oAnchorBar = this.getAggregation("_anchorBar");

		if (oAnchorBar) {
			oAnchorBar._resetControl();
		}

		this._oSectionInfo = {};
		this._aSectionBases = [];
	};

	/**
	 * register the section within the internal property used for lazy loading and navigation
	 * most of these properties are going to be updated later when the dom will be ready (positions) or when the anchorBar button will be created (buttonId)
	 * @param oSectionBase the section to register
	 * @private
	 */
	ObjectPageLayout.prototype._registerSectionBaseInfo = function (oSectionBase) {
		this._oSectionInfo[oSectionBase.getId()] = {
			$dom: [],
			positionTop: 0,
			positionTopMobile: 0,
			buttonId: "",
			isSection: (oSectionBase instanceof ObjectPageSection),
			sectionReference: oSectionBase
		};

		this._aSectionBases.push(oSectionBase);
	};

	/**
	 * Resets the internal information of which subsections are in view and immediately
	 * calls the layout calculation so that an event <code>subSectionEnteredViewPort</code> is fired
	 * for the subsections that are actually in view. Use this method after a change in bindings
	 * to the existing object, since it's layout might have changed and the app
	 * needs to react to the new subsections in view.
	 * @private
	 * @ui5-restricted
	 */
	ObjectPageLayout.prototype._triggerVisibleSubSectionsEvents = function () {
		this._bDelayDOMBasedCalculations = false;
		if (this.getEnableLazyLoading() && this._oLazyLoading) {
			this._oLazyLoading._triggerVisibleSubSectionsEvents();
		}
	};

	/**
	 * Scrolls the Object page to the given Section.
	 *
	 * @param {string} sId The Section ID to scroll to
	 * @param {int} iDuration Scroll duration (in ms). Default value is 0
	 * @param {int} iOffset Additional pixels to scroll
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ObjectPageLayout.prototype.scrollToSection = function (sId, iDuration, iOffset, bIsTabClicked, bRedirectScroll) {
		var oSection = this.oCore.byId(sId),
			iSnapPosition;

		if (!this.getDomRef()){
			Log.warning("scrollToSection can only be used after the ObjectPage is rendered", this);
			return;
		}

		if (!oSection){
			Log.warning("scrollToSection aborted: unknown section", sId, this);
			return;
		}

		if (!this._oSectionInfo[sId]) {
			Log.warning("scrollToSection aborted: section is hidden by UX rules", sId, this);
			return;
		}

		if (this.bIsDestroyed) {
			Log.debug("ObjectPageLayout :: scrollToSection", "scrolling canceled as page is being destroyed");
			return;
		}

		if (this.getUseIconTabBar()) {
			var oToSelect = ObjectPageSection._getClosestSection(oSection);

			var bWasFullscreenMode = this._bAllContentFitsContainer,
				bFullscreenModeChanged;

			// the current tab changed => update the <code>this._bAllContentFitsContainer</code> accordingly
			this._bAllContentFitsContainer = this._hasSingleVisibleFullscreenSubSection(oToSelect);
			this._toggleScrolling(!this._bAllContentFitsContainer);

			bFullscreenModeChanged = this._bAllContentFitsContainer !== bWasFullscreenMode;
			if (bFullscreenModeChanged && !this._bHeaderExpanded) {
				// call the snapping function again with the *latest* parameter value
				// to properly switch between the two ways of snapping the header
				// (snap *with* scroll VS snap *without* scroll)
				this._snapHeader(!this._bAllContentFitsContainer);
				this._bSupressModifyOnScrollOnce = true;
			}

			/* exclude the previously selected tab from propagation chain for performance reasons */
			if (this._oCurrentTabSection) {
				this._oCurrentTabSection._allowPropagationToLoadedViews(false);
			}
			oToSelect._allowPropagationToLoadedViews(true); /* include the newly selected tab back to the propagation chain */

			this._setCurrentTabSection(oSection);
			this.getAggregation("_anchorBar").setSelectedButton(this._oSectionInfo[oToSelect.getId()].buttonId);
			this.setAssociation("selectedSection", oToSelect.getId(), true);
		}

		if (bIsTabClicked) {
			this.fireNavigate({
				section: ObjectPageSection._getClosestSection(oSection),
				subSection: oSection instanceof ObjectPageSubSection ? oSection : oSection.getSubSections()[0]
			});
		}

		if (this._bHeaderInTitleArea && !this._shouldPreserveHeaderInTitleArea() && !this._bAllContentFitsContainer) {
			this._moveHeaderToContentArea();
			this._toggleHeaderTitle(false /* snap */);
			this._bHeaderExpanded = false;
			this._updateToggleHeaderVisualIndicators();
		}

		iOffset = iOffset || 0;

		oSection._expandSection();
		//call _requestAdjustLayout synchronously to make extra sure we have the right positionTops for all sectionBase before scrolling
		this._requestAdjustLayout(true);

		iDuration = this._computeScrollDuration(iDuration, oSection);

		var iScrollTo = this._computeScrollPosition(oSection);

		if (this._sCurrentScrollId != sId || bRedirectScroll) {
			this._sCurrentScrollId = sId;

			if (this._iCurrentScrollTimeout) {
				clearTimeout(this._iCurrentScrollTimeout);
				if (this._$contentContainer) {
					this._$contentContainer.parent().stop(true, false);
				}
			}

			if (this._bDomElementsCached) {
				this._iCurrentScrollTimeout = setTimeout(function () {
					this._sCurrentScrollId = undefined;
					this._iCurrentScrollTimeout = undefined;
				}.bind(this), iDuration);
			}

			this._preloadSectionsOnBeforeScroll(oSection);

			this.getHeaderTitle() && this._shiftHeaderTitle();

			iScrollTo += iOffset;

			if (!this._bStickyAnchorBar && this._shouldSnapHeaderOnScroll(iScrollTo)) {
				iSnapPosition = this._getSnapPosition();
				// <code>scrollTo</code> position is the one with *snapped* header
				// (because the header will snap DURING scroll,
				// EXCEPT on slow machines, where it will snap only AFTER scroll)
				// => snap the header in advance (before scrolling)
				// to ensure page arrives at *correct* scroll position even on slow machines
				this._scrollTo(iSnapPosition, 0);
				if (iSnapPosition === 0) {
					this._toggleHeader(true); // ensure header is toggled even if no scroll
				}
			}

			this._scrollTo(iScrollTo, iDuration);
		}
	};

	ObjectPageLayout.prototype._hasSingleVisibleFullscreenSubSection = function (oSection) {
		var aVisibleSubSections = oSection.getSubSections().filter(function(oSubSection) {
			return oSubSection.getVisible() && oSubSection._getInternalVisible() && (oSubSection.getBlocks().length > 0);
		});
		return (aVisibleSubSections.length === 1) && aVisibleSubSections[0].hasStyleClass(ObjectPageSubSection.FIT_CONTAINER_CLASS);
	};

	ObjectPageLayout.prototype._computeScrollDuration = function (iAppSpecifiedDuration, oTargetSection) {
		var iDuration = parseInt(iAppSpecifiedDuration);
		iDuration = iDuration >= 0 ? iDuration : this._iScrollToSectionDuration;

		if (this.getUseIconTabBar()
			&& ((oTargetSection instanceof ObjectPageSection) || this._isFirstVisibleSectionBase(oTargetSection))
			&& this._bStickyAnchorBar) { // in this case we are only scrolling
			// a section from expanded to sticky position,
			// so the scrolling animation in not needed, instead it looks unnatural, so set a 0 duration
			iDuration = 0;
		}
		return iDuration;
	};

	ObjectPageLayout.prototype._computeScrollPosition = function (oTargetSection) {

		var bFirstLevel = oTargetSection && (oTargetSection instanceof ObjectPageSection),
			sId = oTargetSection.getId(),
			iScrollTo = this._bMobileScenario || bFirstLevel ? this._oSectionInfo[sId].positionTopMobile : this._oSectionInfo[sId].positionTop,
			bExpandedMode = !this._bStickyAnchorBar;

		if (bExpandedMode && this._isFirstVisibleSectionBase(oTargetSection)) { // preserve expanded header if no need to stick
			iScrollTo = 0;
		}

		return iScrollTo;
	};

	/**
	 * Preloads the next visible subsections.
	 * The function should be called upon request [by anchorBar click or API call] to scroll to a new section,
	 * in order to preload the target section so that its data is available by the time the scroll animation completed.
	 *
	 * The total count of subSections (within or after the target section) to preload depends on the static configuration
	 * for preload in <code>sap.uxap._helpers.LazyLoading</code>
	 * @param {object} oTargetSection the section
	 * @private
	 */
	ObjectPageLayout.prototype._preloadSectionsOnBeforeScroll = function (oTargetSection) {

		var sId = oTargetSection.getId(),
			aToLoad;

		if (!this.getEnableLazyLoading() && this.getUseIconTabBar()) {
			aToLoad = (oTargetSection instanceof ObjectPageSection) ? oTargetSection : oTargetSection.getParent();
			this._connectModelsForSections([aToLoad]);
		}

		if (this.getEnableLazyLoading()) {
			//connect target subsection to avoid delay in data loading
			var oSectionBasesToLoad = this.getUseIconTabBar() ? this._grepCurrentTabSectionBases() : this._aSectionBases;
			aToLoad = this._oLazyLoading.getSubsectionsToPreload(oSectionBasesToLoad, sId);

			if (Device.system.desktop) {
				//on desktop we delay the call to have the preload done during the scrolling animation
				setTimeout(function () {
					this._connectModelsForSections(aToLoad);
				}.bind(this), 50);
			} else {
				//on device, do the preload first then scroll.
				//doing anything during the scrolling animation may
				//trouble animation and lazy loading on slow devices.
				this._connectModelsForSections(aToLoad);
			}

			aToLoad.forEach(function (subSection) {
				this.fireEvent("subSectionEnteredViewPort", {
					subSection: subSection
				});
			}, this);
		}
	};

	/**
	 * Returns the UI5 ID of the Section that is currently being scrolled.
	 *
	 * @type string
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ObjectPageLayout.prototype.getScrollingSectionId = function () {
		return this._sScrolledSectionId;
	};

	/**
	 * Set for reference the destination section of the ongoing scroll
	 * When this one is set, then the page will skip intermediate sections [during the scroll from the current to the destination section]
	 * and will scroll directly to the given section
	 * @param {string} sDirectSectionId - the section to be scrolled directly to
	 */
	ObjectPageLayout.prototype.setDirectScrollingToSection = function (sDirectSectionId) {
		this.sDirectSectionId = sDirectSectionId;
	};

	/**
	 * Get the destination section of the ongoing scroll
	 * When this one is non-null, then the page will skip intermediate sections [during the scroll from the current to the destination section]
	 * and will scroll directly to the given section
	 */
	ObjectPageLayout.prototype.getDirectScrollingToSection = function () {
		return this.sDirectSectionId;
	};

	/**
	 * Clear the destination section of the ongoing scroll
	 * When this one is null, then the page will process all intermediate sections [during the scroll to some Y position]
	 * and select each one in sequence
	 */
	ObjectPageLayout.prototype.clearDirectScrollingToSection = function () {
		this.sDirectSectionId = null;
	};

	/**
	 * Scroll to the y position in dom
	 * @param y the position in pixel
	 * @param time the animation time
	 * @private
	 */
	ObjectPageLayout.prototype._scrollTo = function (y, time) {
		if (this._oScroller && this._bDomReady && !this._bSuppressScroll) {
			Log.debug("ObjectPageLayout :: scrolling to " + y);

			if ((time === 0) && this._shouldSnapHeaderOnScroll(y)) {
				this._toggleHeader(true);
			}

			this._oScroller.scrollTo(0, y, time);
		}
		return this;
	};

	/**
	 * Scrolls to bring the 'collapse' visual indicator into view.
	 * @private
	 */
	ObjectPageLayout.prototype._scrollBelowCollapseVisualIndicator = function () {
		var oHeader = this._getHeaderContent(),
			$collapseButton,
			iCollapseButtonHeight,
			iViewportHeight,
			offset;

		if (!exists(oHeader) || !exists(this._$opWrapper)) {
			return;
		}

		$collapseButton = oHeader._getCollapseButton().getDomRef();
		iCollapseButtonHeight = $collapseButton.getBoundingClientRect().height;
		iViewportHeight = this._$opWrapper[0].getBoundingClientRect().height; // height of the div that contains all the *scrollable* content

		// compute the amount we need to scroll in order to show the $collapseButton [right at the bottom of the viewport]
		offset = $collapseButton.offsetTop + iCollapseButtonHeight - iViewportHeight;

		this._scrollTo(offset);
	};

	/**
	* Updates the media style class of the control, based on its own width, not on the entire screen size (which media query does).
	* This is necessary, because the control will be embedded in other controls (like the <code>sap.f.FlexibleColumnLayout</code>),
	* thus it will not be using all of the screen width, but despite that the paddings need to be appropriate.
	* <b>Note:</b>
	* The method is called, when the <code>ObjectPageDynamicPageHeaderTitle</code> is being used.
	* @param {Number} iWidth - the actual width of the control
	* @param {Object} oMedia - object containing CSS classes for the respective media (Phone, Tablet, etc.)
	* @private
	*/
	ObjectPageLayout.prototype._updateMedia = function (iWidth, oMedia) {
		// Applies the provided CSS Media (oMedia) class and removes the rest.
		// Example: If the <code>sapFDynamicPage-Std-Phone</code> class should be applied,
		// the <code>sapFDynamicPage-Std-Tablet</code> and <code>sapFDynamicPage-Std-Desktop</code> classes will be removed.
		var fnUpdateMediaStyleClass = function (sMediaClass) {
			Object.keys(oMedia).forEach(function (sMedia) {
				var sCurrentMediaClass = oMedia[sMedia],
					bEnable = sMediaClass === sCurrentMediaClass;

				this.toggleStyleClass(sCurrentMediaClass, bEnable);
			}, this);
		}.bind(this),
		mBreakpoints = ObjectPageLayout.BREAK_POINTS;

		if (iWidth <= mBreakpoints.PHONE) {
			fnUpdateMediaStyleClass(oMedia.PHONE);
		} else if (iWidth <= mBreakpoints.TABLET) {
			fnUpdateMediaStyleClass(oMedia.TABLET);
		} else {
			fnUpdateMediaStyleClass(oMedia.DESKTOP);
		}
	};

	/**
	 * update the section dom reference
	 * @private
	 */
	ObjectPageLayout.prototype._updateScreenHeightSectionBasesAndSpacer = function () {
		var iLastVisibleHeight,
			oLastVisibleSubSection,
			iSpacerHeight,
			sPreviousSubSectionId,
			sPreviousSectionId,
			bAllowScrollSectionToTop,
			bStickyTitleMode = !this._bHeaderExpanded,
			bIsFirstVisibleSubSection,
			bParentIsFirstVisibleSection,
			bIsFullscreenSection,
			oDomRef = this.getDomRef(),
			bUseIconTabBar = this.getUseIconTabBar();

		if (!oDomRef || !this._bDomReady) { //calculate the layout only if the object page is full ready
			return false; // return success flag
		}

		Log.debug("ObjectPageLayout :: _updateScreenHeightSectionBasesAndSpacer", "re-evaluating dom positions");

		this.iScreenHeight = this._getDOMRefHeight(oDomRef);

		if (this.iScreenHeight === 0) {
			return; // element is hidden or not in DOM => the resulting calculations would be invalid
		}

		this.iFooterHeight = this._getFooterHeight();

		var iSubSectionIndex = -1;

		this._aSectionBases.forEach(function (oSectionBase) {
			var oInfo = this._oSectionInfo[oSectionBase.getId()],
				$this = oSectionBase.$(),
				$mobileAnchor,
				bPromoted = false;

			if (!oInfo /* sectionBase is visible */ || !$this.length) {
				return;
			}

			if (!oInfo.isSection) {
				iSubSectionIndex++;
			}

			oInfo.$dom = $this;

			//calculate the scrollTop value to get the section title at the bottom of the header
			//performance improvements possible here as .position() is costly
			var realTop = $this.position().top; //first get the dom position = scrollTop to get the section at the window top

			//the amount of scrolling required is the distance between their position().top and the bottom of the anchorBar
			oInfo.positionTop = Math.ceil(realTop);

			//the amount of scrolling required for the mobile scenario
			//we want to navigate just below its title
			//as of UX specs Oct 7, 2014
			if (oInfo.isSection) {
				$mobileAnchor = oSectionBase.$("header");
			} else {
				$mobileAnchor = oSectionBase.$("headerTitle");
			}

			bPromoted = $mobileAnchor.length === 0;

			//calculate the mobile position
			if (!bPromoted) {
				oInfo.positionTopMobile = Math.ceil($mobileAnchor.position().top) + $mobileAnchor.outerHeight();
			} else {
				//title wasn't found (=first section, hidden title, promoted subsection), scroll to the same position as desktop
				oInfo.positionTopMobile = oInfo.positionTop;
			}

			if (!this._bStickyAnchorBar && !this._bHeaderInTitleArea) { // in sticky mode the anchor bar is not part of the content
				oInfo.positionTopMobile -= this.iAnchorBarHeight;
				oInfo.positionTop -= this.iAnchorBarHeight;
			}

			oInfo.sectionReference.toggleStyleClass("sapUxAPObjectPageSubSectionPromoted", bPromoted);

			//for calculating the currently scrolled section of subsection (and for lazy loading) we also need to know the bottom of the section and subsections
			//we can't use oInfo.$dom.height() since the margin are not taken into account.
			//therefore the most reliable calculation is to consider as a bottom, the top of the next section/subsection
			//on mobile, each section and subsection is considered equally (a section is a very tiny subsection containing only a title)
			if (this._bMobileScenario) {
				// BCP 1680331690. Should skip subsections that are in a section with lower importance, which makes them hidden.
				var sectionParent = this.oCore.byId(oSectionBase.getId()).getParent();
				if (sectionParent instanceof ObjectPageSection && sectionParent._getIsHidden()) {
					return;
				}

				if (sPreviousSectionId) {               //except for the very first section
					this._oSectionInfo[sPreviousSectionId].positionBottom = oInfo.positionTop;
				}
				sPreviousSectionId = oSectionBase.getId();
				oLastVisibleSubSection = oSectionBase;
			} else { //on desktop, we update section by section (each section is resetting the calculation)
				//on a desktop the previous section bottom is the top of the current section
				if (oInfo.isSection) {
					if (sPreviousSectionId) {           //except for the very first section
						this._oSectionInfo[sPreviousSectionId].positionBottom = oInfo.positionTop;
						if (sPreviousSubSectionId) {
							this._oSectionInfo[sPreviousSubSectionId].positionBottom = oInfo.positionTop;
						}
					}
					sPreviousSectionId = oSectionBase.getId();
					sPreviousSubSectionId = null;
				} else { //on desktop, the previous subsection bottom is the top of the current subsection
					if (sPreviousSubSectionId) {        //except for the very first subSection
						this._oSectionInfo[sPreviousSubSectionId].positionBottom = oInfo.positionTop;
					}
					sPreviousSubSectionId = oSectionBase.getId();
					oLastVisibleSubSection = oSectionBase;
				}
			}

			if (!oInfo.isSection) {

				bParentIsFirstVisibleSection = bUseIconTabBar /* there is only single section per tab */ || (oSectionBase.getParent() === this._oFirstVisibleSection);
				bIsFirstVisibleSubSection = bParentIsFirstVisibleSection && (iSubSectionIndex === 0); /* index of *visible* subSections is first */
				bIsFullscreenSection = oSectionBase.hasStyleClass(ObjectPageSubSection.FIT_CONTAINER_CLASS);

				oSectionBase._setHeight(this._computeSubSectionHeight(bIsFirstVisibleSubSection, bIsFullscreenSection, oInfo.positionTop));
			}

		}, this);

		//calculate the bottom spacer height and update the last section/subSection bottom (with our algorithm of having section tops based on the next section, we need to have a special handling for the very last subSection)
		if (oLastVisibleSubSection) {

			iLastVisibleHeight = this._computeLastVisibleHeight(oLastVisibleSubSection);

			//on desktop we need to set the bottom of the last section as well
			if (this._bMobileScenario && sPreviousSectionId) {
				this._oSectionInfo[sPreviousSectionId].positionBottom = this._oSectionInfo[sPreviousSectionId].positionTop + iLastVisibleHeight;
			} else {
				// BCP: 1670390469 - for both variables here there are cases in which there's unsafe member access.
				// This is an uncommon case and it's not really how do you get here
				if (sPreviousSubSectionId) {
					this._oSectionInfo[sPreviousSubSectionId].positionBottom = this._oSectionInfo[sPreviousSubSectionId].positionTop + iLastVisibleHeight;
				}
				if (sPreviousSectionId && sPreviousSubSectionId){
					this._oSectionInfo[sPreviousSectionId].positionBottom = this._oSectionInfo[sPreviousSubSectionId].positionTop + iLastVisibleHeight;
				}
			}

			// checks whether to ensure extra bottom space that allows scrolling the section up to the top of the page (right bellow the anchorBar)
			bAllowScrollSectionToTop = this._bStickyAnchorBar /* if already in sticky mode, then preserve it, even if the section does not require scroll for its [entire content] display */
			|| (iSubSectionIndex > 0) /* bringing any section (other than the first) bellow the anchorBar requires snap */
			|| this._checkContentBottomRequiresSnap(oLastVisibleSubSection); /* check snap is needed in order to display the full section content in the viewport */

			if (this._bAllContentFitsContainer) {
				// no need for extra bottom space [to ensure scroll to top] in fullscreen mode
				// because we have no scrolling in fullscreen mode
				bAllowScrollSectionToTop = false;
			}

			if (bAllowScrollSectionToTop && !this._shouldPreserveHeaderInTitleArea()) {
				bStickyTitleMode = true; // by the time the bottom of the page is reached, the header will be snapped on scroll => obtain the *sticky* title height
			}

			iSpacerHeight = this._computeSpacerHeight(oLastVisibleSubSection, iLastVisibleHeight, bAllowScrollSectionToTop, bStickyTitleMode);

			this._$spacer.height(iSpacerHeight + "px");
			Log.debug("ObjectPageLayout :: bottom spacer is now " + iSpacerHeight + "px");
		}

		this._updateCustomScrollerHeight(bStickyTitleMode);

		this._setSectionInfoIsDirty(false);

		return true; // return success flag
	};

	ObjectPageLayout.prototype._computeSubSectionHeight = function(bFirstVisibleSubSection, bFullscreenSection, iSubSectionOffsetTop) {

		var iSectionsContainerHeight,
			iRemainingSectionContentHeight;

		if (!bFullscreenSection) {
			return ""; // default height
		}

		// if the page is scrollable, then the value of <code>bIsHeaderExpanded</code>
		// depends on the position of the section in the sections list
		// 1) first visible is initially displayed in container with *expanded* header
		// => obtain container height when *expanded* header
		// 2) non-first visible is displayed in container with *snapped* header
		// (because by the time we scroll to show the section, the header is already snapped)
		// => obtain container height when *snapped* header
		var bIsHeaderExpanded = (this._bAllContentFitsContainer) ? this._bHeaderExpanded : bFirstVisibleSubSection;


		// size the section to have the full height of its container
		iSectionsContainerHeight = this._getSectionsContainerHeight(!bIsHeaderExpanded);


		if (this._bAllContentFitsContainer) {
			// if we have a single fullscreen subsection [that takes the entire height of the sections container]
			// => then the only *other* content in the sections container [besides the subSection]
			// is the title of its parent section and the footer space
			// => subtract the above heights from the subSection height to *avoid having a scrollbar*
			iRemainingSectionContentHeight = (iSubSectionOffsetTop - this.iHeaderContentHeight /*- this.iAnchorBarHeight*/) + this.iFooterHeight;
			iSectionsContainerHeight -= iRemainingSectionContentHeight;
		}

		return iSectionsContainerHeight + "px";
	};

	ObjectPageLayout.prototype._updateCustomScrollerHeight = function(bRequiresSnap) {

		if (Device.system.desktop && this.getAggregation("_customScrollBar")) {

			// update content size
			var iScrollableContentSize = this._computeScrollableContentSize(bRequiresSnap);
			iScrollableContentSize += this._getStickyAreaHeight(bRequiresSnap);
			this._getCustomScrollBar().setContentSize(iScrollableContentSize + "px");


			// update visibility
			var bShouldBeVisible = (iScrollableContentSize > Math.ceil(this.iScreenHeight)),
				bVisibilityChange = (bShouldBeVisible !== this._getCustomScrollBar().getVisible());

			if (bVisibilityChange) {
				this._getCustomScrollBar().setVisible(bShouldBeVisible);
				this.getHeaderTitle() && this._shiftHeaderTitle();
			}
		}
	};

	ObjectPageLayout.prototype._computeScrollableContentSize = function(bShouldStick) {

		var iScrollableContentHeight = 0;

		if (this._$contentContainer && this._$contentContainer.length){
			iScrollableContentHeight = this._$contentContainer[0].scrollHeight;
		}

		if (!this._bStickyAnchorBar && bShouldStick) { //anchorBar is removed from scrollable content upon snap
			iScrollableContentHeight -= this.iAnchorBarHeight;
		}
		if (this._bStickyAnchorBar && !bShouldStick) { //anchorBar is added back to the scrollable content upon expand
			iScrollableContentHeight += this.iAnchorBarHeight;
		}

		return iScrollableContentHeight;
	};

	ObjectPageLayout.prototype._computeLastVisibleHeight = function(oLastVisibleSubSection) {

		/* lastVisibleHeight = position.top of spacer - position.top of lastSection */

		var bIsStickyMode = this._bStickyAnchorBar || this._bHeaderInTitleArea; // get current mode
		var iLastSectionPositionTop = this._getSectionPositionTop(oLastVisibleSubSection, bIsStickyMode); /* we need to get the position in the current mode */

		return this._$spacer.position().top - iLastSectionPositionTop;
	};

	ObjectPageLayout.prototype._getStickyAreaHeight = function(bIsStickyMode) {
		if (bIsStickyMode) { // we are pre-calculating the expected sticky area height in snapped mode => it is the sum of the pre-calculated stickyTitle + anchorBar height
			return this.iHeaderTitleHeightStickied + this.iAnchorBarHeight;
		}

		//in all other cases it is simply the height of the entire area above the scrollable content (where all [stickyTitle, stickyAnchorBar, stickyHeaderContent] reside)
		return this.iHeaderTitleHeight;
	};

	/* *
	* Computes the height of the viewport bellow the sticky area
	* */
	ObjectPageLayout.prototype._getScrollableViewportHeight = function(bIsStickyMode) {
		return this.getDomRef().getBoundingClientRect().height - this._getStickyAreaHeight(bIsStickyMode);
	};

	ObjectPageLayout.prototype._getSectionsContainerHeight = function(bIsStickyMode) {

		var iScrollContainerHeight = this._getScrollableViewportHeight(bIsStickyMode);
		if (!bIsStickyMode) {
			// for expanded mode, subtract the heights of headerContent and anchorBar
			// as they are also part of the scrollable content when *expanded* header,
			// but we need the height of the *sections area bellow* them
			iScrollContainerHeight -= (this.iHeaderContentHeight + this.iAnchorBarHeight);
		}
		return iScrollContainerHeight;
	};

	ObjectPageLayout.prototype._getSectionPositionTop = function(oSectionBase, bShouldStick) {
		var iPosition = oSectionBase.$().position().top;

		if (!this._bStickyAnchorBar && !this._bHeaderInTitleArea && bShouldStick) { // in sticky mode the anchor bar is not part of the content
			iPosition -= this.iAnchorBarHeight;
		}

		return iPosition;
	};

	ObjectPageLayout.prototype._getSectionPositionBottom = function(oSectionBase, bShouldStick) {
		var iPosition = this._oSectionInfo[oSectionBase.getId()].positionBottom; //sticky position
		if (!bShouldStick) {
			iPosition += this.iAnchorBarHeight;
		}
		return iPosition;
	};

	/**
	 * Determines thе <code>ObjectPageSectionBase</code> internal <code>titleLevel</code>.
	 * For <code>ObjectPageSection</code>, the internal <code>titleLevel</code> is the current <code>sectionTitleLevel</code>.
	 * For <code>ObjectPageSubSection</code>, the internal <code>titleLevel</code> is one level lower than the current <code>sectionTitleLevel</code>.
	 * If the <code>sectionTitleLevel</code> has value of <code>sap.ui.core.TitleLevel.Auto</code>,
	 * <code>sap.ui.core.TitleLevel.H3</code> is returned for <code>ObjectPageSection</code> and
	 * <code>sap.ui.core.TitleLevel.H4</code> for <code>ObjectPageSubSection</code>.
	 * @param {Object} oSectionBase <code>ObjectPageSectionBase</code> instance
	 * @returns {String} <code>sap.ui.core.TitleLevel</code>
	 * @since 1.44
	 * @private
	 */
	ObjectPageLayout.prototype._determineSectionBaseInternalTitleLevel = function(oSectionBase) {
		var sSectionBaseTitleLevel = this.getSectionTitleLevel(),
			bIsSection = oSectionBase instanceof ObjectPageSection;

		if (sSectionBaseTitleLevel === TitleLevel.Auto) {
			return bIsSection ? TitleLevel.H3 : TitleLevel.H4;
		}

		return bIsSection ? sSectionBaseTitleLevel : ObjectPageLayout._getNextTitleLevelEntry(sSectionBaseTitleLevel);
	};

	/**
	 * Determines if the <code>ObjectPageLayout</code> should set <code>ObjectPageSectionBase</code> internal <code>titleLevel</code>.
	 * @param {Object} oSectionBase <code>ObjectPageSectionBase</code> instance
	 * @returns {Boolean}
	 * @since 1.44
	 * @private
	 */
	ObjectPageLayout.prototype._shouldApplySectionTitleLevel = function(oSectionBase) {
		return oSectionBase.getTitleLevel() === TitleLevel.Auto;
	};

	ObjectPageLayout.prototype._checkContentBottomRequiresSnap = function(oSection) {
		var bSnappedMode = false; // calculate for expanded mode
		return this._getSectionPositionBottom(oSection, bSnappedMode) > (this._getScrollableViewportHeight(bSnappedMode) + this._getSnapPosition());
	};

	ObjectPageLayout.prototype._computeSpacerHeight = function(oLastVisibleSubSection, iLastVisibleHeight, bAllowSpaceToSnapViaScroll, bStickyTitleMode) {

		var iSpacerHeight,
			iScrollableViewportHeight;

		iScrollableViewportHeight = this._getScrollableViewportHeight(bStickyTitleMode);

		if (!bAllowSpaceToSnapViaScroll) {
			iLastVisibleHeight = this._getSectionPositionBottom(oLastVisibleSubSection, false); /* in expanded mode, all the content above lastSection bottom is visible */
		}

		//calculate the required additional space for the last section only
		if (iLastVisibleHeight < iScrollableViewportHeight) {

			//the amount of space required is what is needed to get the latest position you can scroll to up to the "top"
			//therefore we need to create enough space below the last subsection to get it displayed on top = the spacer
			//the "top" is just below the sticky header + anchorBar, therefore we just need enough space to get the last subsection below these elements
			iSpacerHeight = iScrollableViewportHeight - iLastVisibleHeight;

			//take into account that we may need to scroll down to the positionMobile, thus we need to make sure we have enough space at the bottom
			if (this._bMobileScenario) {
				iSpacerHeight += (this._oSectionInfo[oLastVisibleSubSection.getId()].positionTopMobile - this._oSectionInfo[oLastVisibleSubSection.getId()].positionTop);
			}
		} else {
			iSpacerHeight = 0;
		}

		if ((this.iFooterHeight > iSpacerHeight)) {
			iSpacerHeight += this.iFooterHeight;
		}

		return iSpacerHeight;
	};

	ObjectPageLayout.prototype._isFirstVisibleSectionBase = function (oSectionBase) {

		var sSectionBaseId,
			oSelectedSection,
			sFirstVisibleSubSection,
			sSelectedSectionId = this.getSelectedSection(),
			bUseIconTabBar = this.getUseIconTabBar();

		if (!oSectionBase || !oSectionBase.getParent()) {
			return;
		}

		sSectionBaseId = oSectionBase.getId();

		// we use tabs => check if the section matches the current tab section
		if (bUseIconTabBar && (sSectionBaseId === sSelectedSectionId)) {
			return true;
		}

		// we use tabs => check if the section is a subSection of the current tab section
		if (bUseIconTabBar && (oSectionBase.getParent().getId() === sSelectedSectionId)) {
			oSelectedSection = sap.ui.getCore().byId(sSelectedSectionId);
			sFirstVisibleSubSection = this._getFirstVisibleSubSection(oSelectedSection);
			return sFirstVisibleSubSection && (sFirstVisibleSubSection.getId() === sSectionBaseId);
		}

		// in anchorBar mode only return the available calculated firstVisibleSection
		if (this._oFirstVisibleSection && this._oFirstVisibleSubSection) {
			return sSectionBaseId === this._oFirstVisibleSection.getId() || sSectionBaseId === this._oFirstVisibleSubSection.getId();
		}

		return false;
	};

	ObjectPageLayout.prototype._getFirstVisibleSubSection = function (oSection) {
		if (!oSection) {
			return;
		}
		var oFirstSubSection;
		this._aSectionBases.every(function (oSectionBase) {
			if (oSectionBase.getParent() && (oSectionBase.getParent().getId() === oSection.getId())) {
				oFirstSubSection = oSectionBase;
				return false;
			}
			return true;
		});
		return oFirstSubSection;
	};

	/**
	 * init the internal section info {positionTop}
	 * @private
	 */
	ObjectPageLayout.prototype._initAnchorBarScroll = function () {

		var oSelectedSection = this.oCore.byId(this.getSelectedSection()),
			iScrollTop;

		this._requestAdjustLayout(true);

		iScrollTop = oSelectedSection ? this._computeScrollPosition(oSelectedSection) : 0;

		//reset the scroll for anchorbar & scrolling management
		this._sScrolledSectionId = "";
		this._sCurrentScrollId = "";
		this._onScroll({target: {scrollTop: iScrollTop}}, true /* bImmediateLazyLoading */);//make sure that the handler for the scroll event is called
		// because only when the handler for the scroll event is called => the selectedSection is set as currentSection => selected section is selected in the anchorBar)
	};

	/**
	 * Set a given section as the currently scrolled section and update the anchorBar relatively
	 * @param {string} sSectionId the section id
	 * @private
	 */
	ObjectPageLayout.prototype._setAsCurrentSection = function (sSectionId) {
		var oAnchorBar, oSectionBase, bShouldDisplayParentTitle;

		if (this._sScrolledSectionId === sSectionId) {
			return;
		}

		Log.debug("ObjectPageLayout :: current section is " + sSectionId);
		this._sScrolledSectionId = sSectionId;

		oAnchorBar = this.getAggregation("_anchorBar");

		if (oAnchorBar && this._getInternalAnchorBarVisible()) {
			oSectionBase = this.oCore.byId(sSectionId);

			bShouldDisplayParentTitle = oSectionBase && oSectionBase instanceof ObjectPageSubSection &&
				(oSectionBase.getTitle().trim() === "" || !oSectionBase._getInternalTitleVisible() || oSectionBase.getParent()._getIsHidden());

			//the sectionBase title needs to be visible (or the user won't "feel" scrolling that sectionBase but its parent)
			//see Incident 1570016975 for more details
			if (bShouldDisplayParentTitle) {
				sSectionId = oSectionBase.getParent().getId();

				Log.debug("ObjectPageLayout :: current section is a subSection with an empty or hidden title, selecting parent " + sSectionId);
			}

			if (oSectionBase && this._oSectionInfo[sSectionId]) {
				oAnchorBar.setSelectedButton(this._oSectionInfo[sSectionId].buttonId);
				this.setAssociation("selectedSection", ObjectPageSection._getClosestSection(sSectionId).getId(), true);
				this._setSectionsFocusValues(sSectionId);
			}
		}
	};

	ObjectPageLayout.prototype._registerOnContentResize = function () {

		var $container = this._$contentContainer.length && this._$contentContainer[0];
		if (!$container) {
			return;
		}

		if (this._iContentResizeId) {
			ResizeHandler.deregister(this._iContentResizeId);
		}
		this._iContentResizeId = ResizeHandler.register($container, this._onUpdateContentSize.bind(this));
	};

	ObjectPageLayout.prototype._onUpdateContentSize = function (oEvent) {
		var iScrollTop;

		if (this._preserveHeaderStateOnScroll()) {
			this._overridePreserveHeaderStateOnScroll();
		}

		// a special case: if the content that changed its height was *above* the current scroll position =>
		// then the current scroll position updated respectively and => triggered a scroll event =>
		// a new section may become selected during that scroll

		// problem if this happened BEFORE _requestAdjustLayout executed => wrong section may have been selected

		// solution [implemented bellow] is to ensure that scroll handler is called with the latest scrollTop => we ensure the correct section is selected
		if (this._hasDynamicTitle()) {
			this._adjustHeaderHeights();
		}
		this._requestAdjustLayout() // call adjust layout to calculate the new section sizes
			.then(function () {
				iScrollTop = this._$opWrapper.scrollTop();
				this._updateSelectionOnScroll(iScrollTop);
			}.bind(this));
	};

	/**
	 * called when the screen is resize by users. Updates the screen height
	 * @param oEvent
	 * @private
	 */
	ObjectPageLayout.prototype._onUpdateScreenSize = function (oEvent) {
		var oTitle = this.getHeaderTitle(),
			oHeaderContent = this._getHeaderContent(),
			iCurrentWidth = oEvent.size.width,
			iCurrentHeight = oEvent.size.height,
			iOldHeight = oEvent.oldSize.height,
			bHeightChange = (iCurrentHeight !== iOldHeight),
			sSelectedSectionId,
			bIsAlwaysShowContentHeaderEnabled = oHeaderContent && oHeaderContent.supportsAlwaysExpanded()
				&& this.getAlwaysShowContentHeader();

		if (oEvent.size.height === 0 || oEvent.size.width === 0) {
			Log.info("ObjectPageLayout :: not triggering calculations if height or width is 0");
			return;
		}

		if (!this._bDomReady) {
			Log.info("ObjectPageLayout :: cannot _onUpdateScreenSize before dom is ready");
			return;
		}

		this._oLazyLoading.setLazyLoadingParameters();

		setTimeout(function () {
			this._bMobileScenario = library.Utilities.isPhoneScenario(this._getCurrentMediaContainerRange());
			this._bTabletScenario = library.Utilities.isTabletScenario(this._getCurrentMediaContainerRange());

			if (bIsAlwaysShowContentHeaderEnabled && (this._bHeaderInTitleArea != this._checkAlwaysShowContentHeader())) {
				this.invalidate();
			}

			if (this._bHeaderInTitleArea && this._headerBiggerThanAllowedToBeExpandedInTitleArea()) {
				this._expandHeader(false);
				this._scrollTo(0, 0);
			}

			// Let the dynamic header know size changed first, because this might lead to header dimensions changes
			if (oTitle && oTitle.isDynamic()) {
				oTitle._onResize(iCurrentWidth);
				this._updateMedia(iCurrentWidth, ObjectPageLayout.DYNAMIC_HEADERS_MEDIA); // Update media classes when ObjectPageDynamicHeaderTitle is used.
			}

			this._updateMedia(iCurrentWidth, ObjectPageLayout.MEDIA);

			this._adjustHeaderHeights();

			this._requestAdjustLayout(true);

			if (this.getFooter() && this.getShowFooter()) {
				this._shiftFooter();
			}

			sSelectedSectionId = this.getSelectedSection();
			// if the page was hidden (its iOldHeight === 0)
			// AND its selectedSection changed *while* the page was hidden
			// => the page could not update its scrollPosition to match its newly selectedSection
			// (because changes to scrollTop of a hidden container are ignored by the browser)
			// => we need to restore the correct scroll position
			if ((iOldHeight === 0) && bHeightChange && !this._isClosestScrolledSection(sSelectedSectionId)) {
				this.scrollToSection(sSelectedSectionId, 0);
			}

			this._scrollTo(this._$opWrapper.scrollTop(), 0);
			// ensure lazy loading is triggered as soon as the page is restored (=> its latest page metrics are available)
			if ((iOldHeight === 0) && bHeightChange && this.getEnableLazyLoading() && this._oLazyLoading && !this._bDelayDOMBasedCalculations) {
				this._oLazyLoading.doLazyLoading();
			}
		}.bind(this), this._getDOMCalculationDelay());

	};

	ObjectPageLayout.prototype._onUpdateHeaderTitleSize = function (oEvent) {

		if (oEvent.size.height === 0 || oEvent.size.width === 0) {
			Log.info("ObjectPageLayout :: not triggering calculations if height or width is 0");
			return;
		}

		if (!this._bDomReady) {
			Log.info("ObjectPageLayout :: cannot _onUpdateTitleSize before dom is ready");
			return;
		}

		this._adjustHeaderHeights();
		this._requestAdjustLayout();
	};

	/**
	 * Checks if the given <code>scrollTop</code> position requires snap
	 * @param iScrollTop
	 * @private
	 */
	ObjectPageLayout.prototype._shouldSnapHeaderOnScroll = function (iScrollTop) {
		return (iScrollTop > 0) && (iScrollTop >= this._getSnapPosition()) && !this._shouldPreserveHeaderInTitleArea();
	};

	ObjectPageLayout.prototype._getScrollableContentLength = function () {
		return this._$contentContainer.length ? this._getDOMRefHeight(this._$contentContainer[0]) : 0;
	};

	ObjectPageLayout.prototype._isContentScrolledToBottom = function () {
		return this._oLastScrollState.iScrollableContentLength <= (this._oLastScrollState.iScrollTop + this._oLastScrollState.iScrollableViewportHeight);
	};

	ObjectPageLayout.prototype._isContentLengthDecreased = function (oPreviousScrollState) {
		if (oPreviousScrollState) {
			return ((oPreviousScrollState.iScrollableContentLength > this._oLastScrollState.iScrollableContentLength)
				&& (oPreviousScrollState.iSpacerHeight === this._oLastScrollState.iSpacerHeight)); // ignore spacer adjustments
		}
	};

	ObjectPageLayout.prototype._canReachScrollTop = function (oRequiredScrollTop, iExtraSpaceLength) {
		var iReachableScrollTop;
		iExtraSpaceLength = iExtraSpaceLength || 0;

		iReachableScrollTop = this._oLastScrollState.iScrollableContentLength + iExtraSpaceLength - this._oLastScrollState.iScrollableViewportHeight;
		return iReachableScrollTop >= oRequiredScrollTop;
	};

	/**
	 * removes all the events which are not using event delegation and bound with jQuery#on
	 * these custom events are bound with "OPL" namespace
	 * @private
	 */
	ObjectPageLayout.prototype._deregisterCustomEvents = function () {
		if (this._$opWrapper.length) {
			this._$opWrapper.off(".OPL");
		}
	};

	/**
	 * removes listener for screen resize
	 * @private
	 */
	ObjectPageLayout.prototype._deregisterScreenSizeListener = function () {
		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
			this._iResizeId = null;
		}
	};

	/**
	 * called when the user scrolls on the page
	 * @param oEvent
	 * @private
	 */
	ObjectPageLayout.prototype._onScroll = function (oEvent, bImmediateLazyLoading) {
		var iScrollTop = Math.max(Math.ceil(oEvent.target.scrollTop), 0), // top of the visible page
			$wrapper = this._$opWrapper.length && this._$opWrapper[0],
			$spacer = this._$spacer.length && this._$spacer[0],
			iSpacerHeight = $spacer.offsetHeight,
			iPageHeight,
			oHeader = this.getHeaderTitle(),
			bShouldStick = this._shouldSnapHeaderOnScroll(iScrollTop),
			bShouldPreserveHeaderInTitleArea = this._shouldPreserveHeaderInTitleArea(),
			bScrolled = false,
			oPreviousScrollState = this._oLastScrollState;

		this._oLastScrollState = {
			iScrollTop: iScrollTop,
			iScrollableContentLength: Math.ceil(this._getScrollableContentLength()),
			iScrollableViewportHeight: $wrapper.offsetHeight,
			iSpacerHeight: iSpacerHeight
		};

		if (this._bSupressModifyOnScrollOnce) {
			this._bSupressModifyOnScrollOnce = false;
			return;
		}

		if (!$wrapper || !$spacer) {
			return;
		}

		//calculate the limit of visible sections to be lazy loaded
		iPageHeight = this.iScreenHeight;
		if (iPageHeight === 0) {
			return; // page is hidden
		}

		if (this._getSectionInfoIsDirty()) {
			return;
		}

		// check if scroll was a browser AUTO-scroll
		// caused by decrease in the length of the scrollable content
		// to an extent that the previous scrollTop cannot be maintained anymore (not enough content to scroll that far)
		if (oPreviousScrollState
			&& this._isContentScrolledToBottom()
			&& this._isContentLengthDecreased(oPreviousScrollState)) {

			var iContentLengthChange = oPreviousScrollState.iScrollableContentLength - this._oLastScrollState.iScrollableContentLength;
			if (!this._canReachScrollTop(oPreviousScrollState.iScrollTop)
				&& this._canReachScrollTop(oPreviousScrollState.iScrollTop, iContentLengthChange)) {

				var iNewSpacerHeight = iSpacerHeight + iContentLengthChange;
				this._$spacer.height(iNewSpacerHeight + "px"); // add extra space to compensate height loss
				this._scrollTo(oPreviousScrollState.iScrollTop); // scroll back to the previous scroll top (to fallback from the visual offset of content)
				return;
			}
		}

		if (bShouldStick && !bShouldPreserveHeaderInTitleArea) {
			iPageHeight -= (this.iAnchorBarHeight + this.iHeaderTitleHeightStickied);
		}

		if (this._bHeaderInTitleArea && !bShouldPreserveHeaderInTitleArea) {
			this._moveHeaderToContentArea();
			this._toggleHeaderTitle(false /* snap */);
			this._bHeaderExpanded = false;
			this._updateToggleHeaderVisualIndicators();
			this._requestAdjustLayout();
		}

		//don't apply parallax effects if there are not enough space for it
		if (!bShouldPreserveHeaderInTitleArea && ((oHeader && this.getShowHeaderContent()) || this.getShowAnchorBar())) {
			this._toggleHeader(bShouldStick, !!(oEvent && oEvent.type === "scroll"));
		}

		if (!bShouldPreserveHeaderInTitleArea) {
			this._adjustHeaderTitleBackgroundPosition(iScrollTop);
		}

		Log.debug("ObjectPageLayout :: lazy loading : Scrolling at " + iScrollTop, "----------------------------------------");

		this._updateSelectionOnScroll(iScrollTop);

		//lazy load only the visible subSections
		if (this.getEnableLazyLoading()) {
			//calculate the progress done between this scroll event and the previous one
			//to see if we are scrolling fast (more than 5% of the page height)
			this._oLazyLoading.lazyLoadDuringScroll(bImmediateLazyLoading, iScrollTop, oEvent.timeStamp, iPageHeight);
		}

		if (oHeader && oHeader.supportsTitleInHeaderContent() &&  this.getShowHeaderContent() && this.getShowTitleInHeaderContent() && oHeader.getShowTitleSelector()) {
			if (iScrollTop === 0) {
				// if we have arrow from the title inside the ContentHeader and the ContentHeader isn't scrolled we have to put higher z-index to the ContentHeader
				// otherwise part of the arrow is cut off
				jQuery(document.getElementById(this.getId() + "-scroll")).css("z-index", "1000");
				bScrolled = false;
			} else if (!bScrolled) {
				bScrolled = true;
				// and we have to "reset" the z-index it when we start scrolling
				jQuery(document.getElementById(this.getId() + "-scroll")).css("z-index", "0");
			}
		}
	};

	/**
	 * Finds the section that corresponds to the new scrollTop and sets it as selected section in the anchorBar
	 * @param iScrollTop
	 * @private
	 */
	ObjectPageLayout.prototype._updateSelectionOnScroll = function(iScrollTop) {

		var iPageHeight = this.iScreenHeight,
			sClosestId,
			sClosestSubSectionId;

		if (iPageHeight === 0) {
			return; // page is hidden
		}

		//find the currently scrolled section = where position - iScrollTop is closest to 0
		sClosestId = this._getClosestScrolledSectionId(iScrollTop, iPageHeight);
		sClosestSubSectionId = this._getClosestScrolledSectionId(iScrollTop, iPageHeight, true /* subSections only */);

		if (sClosestId) {

			// check if scroll destination is set in advance
			// (this is when a particular section is requested from the anchorBar sectionsList and we are now scrolling to reach it)
			var sDestinationSectionId = this.getDirectScrollingToSection();

			if (sClosestId !== this._sScrolledSectionId) {

				Log.debug("ObjectPageLayout :: closest id " + sClosestId, "----------------------------------------");

				// check if scroll-destination section is explicitly set
				var sDestinationSectionId = this.getDirectScrollingToSection();

				// if scroll-destination section is explicitly set
				// then we do not want to process intermediate sections (i.e. sections between scroll-start section and scroll-destination sections)
				// so if current section is not destination section
				// then no need to proceed further
				if (sDestinationSectionId && sDestinationSectionId !== sClosestId) {
					return;
				}
				this.clearDirectScrollingToSection();

				this._setAsCurrentSection(sClosestId);
			} else if (sClosestId === this.getDirectScrollingToSection()) { //we are already in the destination section
				this.clearDirectScrollingToSection();
			}

			if (sClosestSubSectionId !== this._sScrolledSubSectionId) {
				this._sScrolledSubSectionId = sClosestSubSectionId;
				this.fireEvent("_sectionChange", {
					section: this.oCore.byId(sClosestId),
					subSection: this.oCore.byId(sClosestSubSectionId)
				});
				this.fireEvent("sectionChange", {
					section: this.oCore.byId(sClosestId),
					subSection: this.oCore.byId(sClosestSubSectionId)
				});
			}
		}
	};

	ObjectPageLayout.prototype._getSnapPosition = function() {
		var iSnapPosition = this.iHeaderContentHeight,
			iTitleHeightDelta = this.iHeaderTitleHeightStickied - this.iHeaderTitleHeight;

		if (iTitleHeightDelta < ObjectPageLayout.MAX_SNAP_POSITION_OFFSET) {
			iSnapPosition -= iTitleHeightDelta;
		}

		return iSnapPosition;
	};

	ObjectPageLayout.prototype._getClosestScrolledSectionId = function (iScrollTop, iPageHeight, bSubSectionsOnly) {
		bSubSectionsOnly = !!bSubSectionsOnly;
		iScrollTop = Math.ceil(iScrollTop);

		var iScrollPageBottom = iScrollTop + iPageHeight,                 //the bottom limit
			sClosestId,
			bTraverseSubSections = bSubSectionsOnly || this._bMobileScenario;

		jQuery.each(this._oSectionInfo, function (sId, oInfo) {
			var section, sectionParent, isParentHiddenSection, firstVisibleSubSection, oSelectedSection, sSelectedSectionId = this.getSelectedSection();

			// on desktop/tablet, skip subsections
			// BCP 1680331690. Should skip subsections that are in a section with lower importance, which makes them hidden.
			section = this.oCore.byId(sId);
			if (!section) {
				return;
			}
			sectionParent = section.getParent();
			isParentHiddenSection = sectionParent instanceof ObjectPageSection && sectionParent._getIsHidden();

			// discard (sub)sections that are not part of the current current tab
			if (this.getUseIconTabBar() && sSelectedSectionId) {
				oSelectedSection = this.oCore.byId(sSelectedSectionId);
				if (!oSelectedSection) {
					return;
				}
				if (oInfo.isSection && oInfo.sectionReference != oSelectedSection) {
					return true;
				}
				if (!oInfo.isSection && oSelectedSection.indexOfSubSection(oInfo.sectionReference) < 0) {
					return true;
				}
			}

			if (oInfo.isSection || (bTraverseSubSections && !isParentHiddenSection)) {
				//we need to set the sClosest to the first section for handling the scrollTop = 0
				if (!sClosestId && (oInfo.sectionReference._getInternalVisible() === true)) {
					firstVisibleSubSection = this._getFirstVisibleSubSection(oInfo.sectionReference);
					if (oInfo.isSection && bSubSectionsOnly && firstVisibleSubSection) {
						//initialize to the first visible subsection if need only subsections to be returned
						sClosestId = firstVisibleSubSection.getId();
					} else {
						sClosestId = sId;
					}
				}

				if (oInfo.isSection && bSubSectionsOnly) {
					return true;
				}

				// current section/subsection is inside the view port
				if (oInfo.positionTop <= iScrollPageBottom && iScrollTop <= oInfo.positionBottom) {
					// scrolling position is over current section/subsection
					if (oInfo.positionTop <= iScrollTop && oInfo.positionBottom > iScrollTop) {
						sClosestId = sId;
						return false;
					}
				}
			}

		}.bind(this));

		return sClosestId;
	};


	/**
	 * toggles the header state
	 * @param {boolean} bShouldStick boolean true for fixing the header, false for keeping it moving
	 * @private
	 */
	ObjectPageLayout.prototype._toggleHeader = function (bShouldStick, bUserInteraction) {
		var oHeaderTitle;

		if (bShouldStick === this._bStickyAnchorBar) {
			return;
		}

		oHeaderTitle = this.getHeaderTitle();

		//switch to stickied
		if (!this._shouldPreserveHeaderInTitleArea() && !this._bHeaderInTitleArea) {
			this._toggleHeaderTitle(!bShouldStick, bUserInteraction);
		}

		if (!this._bStickyAnchorBar && bShouldStick) {
			this._restoreFocusAfter(this._moveAnchorBarToTitleArea);
			oHeaderTitle && oHeaderTitle.snap();
			this._bHeaderExpanded = false;
			this._adjustHeaderHeights();
			this._updateToggleHeaderVisualIndicators();
		} else if (this._bStickyAnchorBar && !bShouldStick) {
			this._restoreFocusAfter(this._moveAnchorBarToContentArea);
			oHeaderTitle && oHeaderTitle.unSnap();
			this._bHeaderExpanded = true;
			this._adjustHeaderHeights();
			this._updateToggleHeaderVisualIndicators();
		}
	};

	/**
	 * Restores the focus after moving the Navigation bar after moving it between containers
	 * @private
	 * @param {function} fnMoveNavBar a function that moves the navigation bar
	 * @returns {sap.uxap.ObjectPageLayout} this
	 */
	ObjectPageLayout.prototype._restoreFocusAfter = function (fnMoveNavBar) {
		var oLastSelectedElement = this.oCore.byId(this.oCore.getCurrentFocusedControlId());

		fnMoveNavBar.call(this);
		if (Device.system.phone !== true) { // FIX - can not convert to expanded on windows phone
			if (!this.oCore.byId(this.oCore.getCurrentFocusedControlId())) {
				oLastSelectedElement && oLastSelectedElement.$().focus();
			}
		}

		return this;
	};

	/**
	 * Converts the Header to stickied (collapsed) mode
	 * @private
	 * @returns this
	 */
	ObjectPageLayout.prototype._moveAnchorBarToTitleArea = function () {
		this._$anchorBar.children().appendTo(this._$stickyAnchorBar);

		this._toggleHeaderStyleRules(true);

		//Internal Incident: 1472003895: FIT W7 MI: Dual color in the header
		//we need to adjust the header background now in case its size is different
		if (this.iHeaderTitleHeight != this.iHeaderTitleHeightStickied) {
			this._adjustHeaderBackgroundSize();
		}

		return this;
	};

	/**
	 * Converts the Header to expanded (moving) mode
	 * @private
	 * @returns this
	 */
	ObjectPageLayout.prototype._moveAnchorBarToContentArea = function () {
		if (!this._shouldPreserveHeaderInTitleArea()) {
			var iScrollTopBeforeAppend = this._$opWrapper.scrollTop();
			this._$anchorBar.css("height", "auto").append(this._$stickyAnchorBar.children()); //TODO: css auto redundant?
			// ensure that appending the anchorBar does not change the scrollTop, as it may happen in certain cases (if another part of content freshly rerendered (BCP: 1870365138)
			this._$opWrapper.scrollTop(iScrollTopBeforeAppend);

			this._toggleHeaderStyleRules(false);
		}
		return this;
	};

	/**
	 * Toggles the header styles for between stickied and expanded modes
	 * @private
	 * @returns this
	 */
	ObjectPageLayout.prototype._toggleHeaderStyleRules = function (bStuck) {
		bStuck = !!bStuck;
		var sValue = bStuck ? "hidden" : "inherit";

		this._bStickyAnchorBar = bStuck;
		this._$headerContent.css("overflow", sValue);
		this._$headerContent.toggleClass("sapContrastPlus", !bStuck); // contrast only in expanded mode
		this._$anchorBar.css("visibility", sValue);
		if (exists(this._$stickyAnchorBar)) {
			this._$stickyAnchorBar.attr("aria-hidden", !bStuck);
		}
		this.fireToggleAnchorBar({fixed: bStuck});
		if (!bStuck && !this.iAnchorBarHeight) {
			// We expand => ensure we recalculate heights to remove any extra spacer height
			// that was needed in the snapped mode only
			// (Note: we need this call only if no <code>this.iAnchorBarHeight</code>
			// because if <code>this.iAnchorBarHeight</code> then <code>_requestAdjustLayout</code>
			// will be called anyway from the resize content listener)
			this._requestAdjustLayout();
		}
	};

	// use type 'object' because Metamodel doesn't know ScrollEnablement
	/**
	 * Returns an sap.ui.core.delegate.ScrollEnablement object used to handle scrolling
	 *
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ObjectPageLayout.prototype.getScrollDelegate = function () {
		return this._oScroller;
	};

	/* Header specific methods */

	ObjectPageLayout.prototype.setHeaderTitle = function (oHeaderTitle, bSuppressInvalidate) {
		if (oHeaderTitle && typeof oHeaderTitle.addEventDelegate === "function"){
			oHeaderTitle.addEventDelegate({
				onAfterRendering: this._adjustHeaderHeights.bind(this)
			});
		}
		this.setAggregation("headerTitle", oHeaderTitle, bSuppressInvalidate);
		this._oObserver && this._oObserver.disconnect();
		this._oObserver = new ManagedObjectObserver(this._onModifyHeaderTitle.bind(this));

		this._oObserver.observe(oHeaderTitle, {
			aggregations: ["headerTitle"],
			properties: ["backgroundDesign"]
		});

		// Once the title is resolved, set the correct header
		if (oHeaderTitle) {
			this._createHeaderContent();
		}

		return this;
	};

	/**
	 * Handles change of HeaderTitle's <code>backgroundDesign</code> property.
	 * Sets the same <code>backgroundDesign</code> to HeaderContent.
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._onModifyHeaderTitle = function (params) {
		var oHeaderContent = this.getAggregation("_headerContent");

		oHeaderContent && params.current && oHeaderContent.setBackgroundDesign(params.current);
	};

	/**
	 * This triggers rerendering of itself and its children.
	 * @param {sap.ui.base.ManagedObject} [oOrigin] Child control for which the method was called</br>
	 * If the child is an instance of <code>sap.uxap.ObjectPageSection</code> that corresponds to an inactive tab, the invalidation will be suppressed (in iconTabBar mode)
	 *
	 * @protected
	 */
	ObjectPageLayout.prototype.invalidate = function (oOrigin) {
		if (this.getUseIconTabBar() && oOrigin && (oOrigin instanceof ObjectPageSection) && !oOrigin.isActive() && this._oSectionInfo[oOrigin.getId()]) {
			return; // no need to invalidate when an inactive tab is changed
		}

		if (this._iAfterRenderingDomReadyTimeout) {
			// cancel the existing onAfterRenderingDOMReady task as its calculation will not be valid (or necessary)
			clearTimeout(this._iAfterRenderingDomReadyTimeout);
		}

		Control.prototype.invalidate.apply(this, arguments);
	};

	ObjectPageLayout.prototype._createHeaderContent = function () {
		var oHeaderTitle = this.getHeaderTitle(),
			sHeaderTitleBackgroundDesign = oHeaderTitle && oHeaderTitle.supportsBackgroundDesign() && oHeaderTitle.getBackgroundDesign(),
			oHeaderContent = this.getAggregation("_headerContent"),
			oOldHeaderContent,
			oNewHeaderContent;

		// If no title is set, but the header needs to be created, use the old class by default
		var fnHeaderContentClass = oHeaderTitle ? oHeaderTitle.getCompatibleHeaderContentClass() : ObjectPageHeaderContent;

		// If the header content is not set or is set, but is an instance of another class, create a new header content and use it
		if (!(oHeaderContent instanceof fnHeaderContentClass)) {
			oOldHeaderContent = this.getAggregation("_headerContent");

			if (oOldHeaderContent) {
				oOldHeaderContent.destroy();
			}

			oNewHeaderContent = fnHeaderContentClass.createInstance(
				this.getAggregation("headerContent"),
				this.getShowHeaderContent(),
				this._getHeaderDesign(),
				this.getHeaderContentPinnable(),
				this.getId() + "-OPHeaderContent"
			);

			sHeaderTitleBackgroundDesign && oNewHeaderContent.setBackgroundDesign(sHeaderTitleBackgroundDesign);
			this.setAggregation("_headerContent", oNewHeaderContent, true);
		}
	};

	ObjectPageLayout.prototype._adjustHeaderBackgroundSize = function () {
		// Update the background image size and position
		var oHeaderTitle = this.getHeaderTitle();
		if (oHeaderTitle && oHeaderTitle.getHeaderDesign() == "Dark") {

			if (!this._shouldPreserveHeaderInTitleArea()) {
				this.iTotalHeaderSize = this.iHeaderTitleHeight + this.iHeaderContentHeight;
				this._$headerContent.css("background-size", "100% " + this.iTotalHeaderSize + "px");
			} else {
				// The header size in this case contains the header content and the anchor bar, we have to exclude the anchor bar, since no background is applyied to it
				this.iTotalHeaderSize = this.iHeaderTitleHeight - this._$stickyAnchorBar.height();
				// here the sticky header content has to be updated not the content like in the upper case
				this._$stickyHeaderContent.css("background-size", "100% " + this.iTotalHeaderSize + "px");
			}

			oHeaderTitle.$().css("background-size", "100% " + this.iTotalHeaderSize + "px");

			this._adjustHeaderTitleBackgroundPosition(0);
		}
	};

	ObjectPageLayout.prototype._adjustHeaderTitleBackgroundPosition = function (iScrollTop) {

		var oHeaderTitle = this.getHeaderTitle();
		if (oHeaderTitle && oHeaderTitle.getHeaderDesign() == "Dark") {
			if (this._bStickyAnchorBar) {
				oHeaderTitle.$().css("background-position", "0px " + ((this.iTotalHeaderSize - this.iHeaderTitleHeightStickied) * -1) + "px");
			} else {
				if (this._shouldPreserveHeaderInTitleArea()) {
					// If the header is always expanded, there is no neeed to scroll the background so we setting it to 0 position
					oHeaderTitle.$().css("background-position", "0px 0px");
				} else {
					oHeaderTitle.$().css("background-position", "0px " + (this.iHeaderTitleHeight + this.iHeaderContentHeight - this.iTotalHeaderSize - iScrollTop) + "px");
				}
			}
		}
	};

	ObjectPageLayout.prototype._adjustHeaderHeights = function () {
		var oTitle = this.getHeaderTitle(),
			bPreviewTitleHeightViaDomClone = true; // default

		if (oTitle && !oTitle.supportsAdaptLayoutForDomElement()) {
			bPreviewTitleHeightViaDomClone = false;
		}

		//checking the $headerTitle we prevent from checking the headerHeights multiple times during the first rendering
		//$headerTitle is set in the objectPageLayout.onAfterRendering, thus before the objectPageLayout is fully rendered once, we don't enter here multiple times (performance tweak)
		if (this._$titleArea.length > 0) {

			// read the headerContentHeight ---------------------------
			// Note: we are using getBoundingClientRect on the Dom reference to get the correct height taking into account
			// possible browser zoom level. For more details BCP: 1780309606
			this.iHeaderContentHeight = this._$headerContent.length ? Math.ceil(this._getDOMRefHeight(this._$headerContent[0])) : 0;

			//read the sticky headerContentHeight ---------------------------
			this.iStickyHeaderContentHeight = this._$stickyHeaderContent.height();

			//figure out the anchorBarHeight  ------------------------
			this.iAnchorBarHeight = this._bStickyAnchorBar ? this._$stickyAnchorBar.outerHeight() : this._$anchorBar.outerHeight();

			//in sticky mode, we need to calculate the size of original header
			if (!this._bHeaderExpanded) {

				//read the headerTitleStickied ---------------------------
				this.iHeaderTitleHeightStickied = this._$titleArea.height() - this.iAnchorBarHeight;

				//adjust the headerTitle  -------------------------------
				this.iHeaderTitleHeight = this._obtainExpandedTitleHeight(bPreviewTitleHeightViaDomClone);
			} else { //otherwise it's the sticky that we need to calculate

				//read the headerTitle -----------------------------------
				this.iHeaderTitleHeight = this._$titleArea.is(":visible") ? this._$titleArea.height() : 0;

				//adjust headerTitleStickied ----------------------------
				this.iHeaderTitleHeightStickied = this._obtainSnappedTitleHeight(bPreviewTitleHeightViaDomClone);
			}

			this._adjustHeaderBackgroundSize();

			Log.info("ObjectPageLayout :: adjustHeaderHeight", "headerTitleHeight: " + this.iHeaderTitleHeight + " - headerTitleStickiedHeight: " + this.iHeaderTitleHeightStickied + " - headerContentHeight: " + this.iHeaderContentHeight);
		} else {
			Log.debug("ObjectPageLayout :: adjustHeaderHeight", "skipped as the objectPageLayout is being rendered");
		}
	};

	ObjectPageLayout.prototype._appendTitleCloneToDOM = function (bEnableStickyMode) {

		var $headerTitle = this.getHeaderTitle().$(),
			$headerTitleClone = $headerTitle.clone();
		//prepare: make sure it won't be visible ever and fix width to the original headerTitle which is 100%
		$headerTitleClone.css({left: "-10000px", top: "-10000px", width: $headerTitle.width() + "px", position:"absolute"});
		$headerTitleClone.toggleClass("sapUxAPObjectPageHeaderStickied", bEnableStickyMode);
		$headerTitleClone.appendTo(this._$titleArea.parent());

		if (bEnableStickyMode) {
			this.getHeaderTitle() && this.getHeaderTitle()._adaptLayoutForDomElement($headerTitleClone);
		}

		return $headerTitleClone;
	};

	ObjectPageLayout.prototype._obtainSnappedTitleHeight = function (bViaClone) {

		var oTitle = this.getHeaderTitle(),
			$Clone,
			iHeight;

		if (!oTitle) {
			return 0;
		}

		if (bViaClone) {
			$Clone = this._appendTitleCloneToDOM(true /* enable snapped mode */);
			iHeight = $Clone.height();
			$Clone.remove(); //clean dom
		} else if (oTitle.snap) {
			iHeight = this._obtainTitleHeightViaStateChange(true /* snap */);
		}

		return iHeight;
	};

	ObjectPageLayout.prototype._obtainExpandedTitleHeight = function (bViaClone) {
		var oTitle = this.getHeaderTitle(),
			$Clone,
			iHeight;

		if (!oTitle) {
			return 0;
		}

		if (bViaClone) {
			$Clone = this._appendTitleCloneToDOM(false /* disable snapped mode */);
			iHeight = $Clone.is(":visible") ? $Clone.height() - this.iAnchorBarHeight : 0;
			$Clone.remove(); //clean dom
		} else if (oTitle.unSnap) {
			iHeight = this._obtainTitleHeightViaStateChange(false /* do not snap */);
		}

		return iHeight;
	};

	/**
	 * Obtains the height of the title in its alternative state
	 * by temporarily switching to the alternative state
	 * @param bSnap
	 * @returns {number}
	 * @private
	 */
	ObjectPageLayout.prototype._obtainTitleHeightViaStateChange = function (bSnap) {
		var oTitle = this.getHeaderTitle(),
			iHeight,
			iSectionsContainerHeight = this._$sectionsContainer.height(),
			iSectionsContainerNewHeight,
			fnToAlternativeState = (bSnap) ? oTitle.snap : oTitle.unSnap,
			fnRestoreState =  (bSnap) ? oTitle.unSnap : oTitle.snap;

		fnToAlternativeState.call(oTitle, false);
		iHeight = oTitle.$().outerHeight();
		fnRestoreState.call(oTitle, false);

		iSectionsContainerNewHeight = this._$sectionsContainer.height();
		this._adjustSpacerHeightUponUnsnapping(iSectionsContainerHeight, iSectionsContainerNewHeight);

		return iHeight;
	};

	/**
	 * Adjusts spacer's height upon unsnapping for measurements (in case of unneeded Scrollbar appearance)
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._adjustSpacerHeightUponUnsnapping = function (iSectionsContainerHeight, iSectionsContainerNewHeight) {
		var iSpacerNewHeight;

		if (iSectionsContainerHeight != iSectionsContainerNewHeight) {
			iSpacerNewHeight = this._$spacer.height() - (iSectionsContainerNewHeight - iSectionsContainerHeight);
			this._$spacer.height(iSpacerNewHeight);
		}
	};

	/**
	 * Retrieve the current header design that was defined in the headerTitle if available
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._getHeaderDesign = function () {
		var oHeader = this.getHeaderTitle(),
			sDesign = library.ObjectPageHeaderDesign.Light;

		if (oHeader != null) {
			sDesign = oHeader.getHeaderDesign();
		}
		return sDesign;
	};

	/**
	 * Gets only the visible sections
	 *
	 * @private
	 */

	ObjectPageLayout.prototype._getVisibleSections = function () {
		return this.getSections().filter(function (oSection) {
			return oSection.getVisible() && oSection._getInternalVisible();
		});
	};

	/**
	 * Sets appropriate focus to the sections
	 *
	 * @private
	 */

	ObjectPageLayout.prototype._setSectionsFocusValues = function (sSectionId) {
		var aSections = this._getVisibleSections() || [],
			$section,
			sFocusable = '0',
			sNotFocusable = '-1',
			sTabIndex = "tabindex",
			oSelectedElement,
			oFirstSection = aSections[0];

		aSections.forEach(function (oSection) {
			$section = oSection.$();

			if (sSectionId === oSection.sId) {
				$section.attr(sTabIndex, sFocusable);
				oSelectedElement = oSection;
				oSection._setSubSectionsFocusValues();
			} else {
				$section.attr(sTabIndex, sNotFocusable);
				oSection._disableSubSectionsFocus();
			}
		});

		if (!oSelectedElement && aSections.length > 0) {
			oFirstSection.$().attr(sTabIndex, sFocusable);
			oFirstSection._setSubSectionsFocusValues();
			oSelectedElement = oFirstSection;
		}

		return oSelectedElement;
	};

	ObjectPageLayout.prototype.setShowHeaderContent = function (bShow) {
		var bOldShow = this.getShowHeaderContent(),
			oHeaderContent;

		if (bOldShow !== bShow) {
			if (bOldShow && this._bHeaderInTitleArea && !this._shouldPreserveHeaderInTitleArea()) {
				this._moveHeaderToContentArea();
				this._toggleHeaderTitle(false /* snap */);
			}
			this.setProperty("showHeaderContent", bShow);
			oHeaderContent = this._getHeaderContent();
			if (oHeaderContent) {
				oHeaderContent.setProperty("visible", bShow);
			}
		}
		return this;
	};

	/**
	 * Re-renders the <code>ObjectPageHeaderContent</code> when <code>ObjectPageHeader</code> Title changes.
	 * @private
	 */
	ObjectPageLayout.prototype._headerTitleChangeHandler = function (bIsObjectImageChange) {
		var oRm;

		if (!this.getShowTitleInHeaderContent()) {
			return;
		}

		if (bIsObjectImageChange) {
			this._getHeaderContent()._destroyObjectImage(true);
		}

		oRm = this.oCore.createRenderManager();
		this.getRenderer()._rerenderHeaderContentArea(oRm, this);
		this._getHeaderContent().invalidate();
		oRm.destroy();
	};


	/* Maintain ObjectPageHeaderContent aggregation */

	ObjectPageLayout.prototype.getHeaderContent = function () {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.getAggregation("headerContent", []);
		}

		return this._getHeaderContent().getAggregation("content", []);
	};

	ObjectPageLayout.prototype.insertHeaderContent = function (oObject, iIndex, bSuppressInvalidate) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.insertAggregation("headerContent", oObject, iIndex, bSuppressInvalidate);
		}

		return this._getHeaderContent().insertAggregation("content", oObject, iIndex, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.addHeaderContent = function (oObject, bSuppressInvalidate) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.addAggregation("headerContent", oObject, bSuppressInvalidate);
		}

		return this._getHeaderContent().addAggregation("content", oObject, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.removeAllHeaderContent = function (bSuppressInvalidate) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.removeAllAggregation("headerContent", bSuppressInvalidate);
		}

		return this._getHeaderContent().removeAllAggregation("content", bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.removeHeaderContent = function (oObject, bSuppressInvalidate) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.removeAggregation("headerContent", oObject, bSuppressInvalidate);
		}

		return this._getHeaderContent().removeAggregation("content", oObject, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.destroyHeaderContent = function (bSuppressInvalidate) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.destroyAggregation("headerContent", bSuppressInvalidate);
		}

		return this._getHeaderContent().destroyAggregation("content", bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.indexOfHeaderContent = function (oObject) {
		// If header content not resolved yet - use local aggregation until it is
		if (!this._getHeaderContent()) {
			return this.indexOfAggregation("headerContent", oObject);
		}

		return this._getHeaderContent().indexOfAggregation("content", oObject);
	};

	/**
	 * Lazy loading of the _headerContent aggregation
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._getHeaderContent = function () {
		return this.getAggregation("_headerContent");
	};

	ObjectPageLayout.prototype._connectModelsForSections = function (aSections) {
		aSections = aSections || [];
		aSections.forEach(function (oSection) {
			oSection.connectToModels();
		});
	};

	ObjectPageLayout.prototype._getHeightRelatedParameters = function () {
		return {
			iHeaderContentHeight: this.iHeaderContentHeight,
			iScreenHeight: this.iScreenHeight,
			iAnchorBarHeight: this.iAnchorBarHeight,
			iHeaderTitleHeightStickied: this.iHeaderTitleHeightStickied,
			iStickyHeaderContentHeight: this.iStickyHeaderContentHeight,
			iScrollTop: this._$opWrapper.scrollTop()
		};
	};

	ObjectPageLayout.prototype._hasVerticalScrollBar = function () {
		return (this._getCustomScrollBar().getVisible() === true);
	};

	ObjectPageLayout.prototype._shiftHeaderTitle = function () {

		var oShiftOffsetParams = this._calculateShiftOffset(),
			sDirection = oShiftOffsetParams.sStyleAttribute,
			sPixels = oShiftOffsetParams.iMarginalsOffset;
		this.$().find(".sapUxAPObjectPageHeaderTitle").css("padding-" + sDirection, sPixels + "px");
	};

	/**
	 * Checks if a section is the first visible one
	 * @private
	 */
	ObjectPageLayout.prototype._isFirstSection = function (oSection) {
		var aSections = this._getVisibleSections();
		if (oSection === aSections[0]) {
			return true;
		}
		return false;
	};

	/**
	 * Checks if the <code>_oStoredScrolledSubSectionInfo</code> is still eligible to restore
	 *
	 * (as the visibility of the stored subSection or the value of the currently <code>selectedSection</code> may have
	 * changed from outside since the <code>_oStoredScrolledSubSectionInfo</code> was last obtained
	 *
	 * @returns {boolean}
	 * @private
	 */
	ObjectPageLayout.prototype._isValidStoredSubSectionInfo = function () {
		var sSelectedSectionId = this.getSelectedSection(),
			oSelectedSection = this.oCore.byId(sSelectedSectionId),
			oStoredSubSection;

		if (!oSelectedSection || !this._oStoredScrolledSubSectionInfo) {
			return false;
		}

		oStoredSubSection = this.oCore.byId(this._oStoredScrolledSubSectionInfo.sSubSectionId);

		return oStoredSubSection
			&& this._sectionCanBeRenderedByUXRules(oStoredSubSection)
			&& (oSelectedSection.indexOfSubSection(oStoredSubSection) >= 0);
	};

	/**
	 * Restores the more precise scroll position within the selected section
	 * @private
	 */
	ObjectPageLayout.prototype._restoreScrollPosition = function () {

		var bValidStoredSubSection = this._isValidStoredSubSectionInfo(),
			iRestoredScrollPosition;

		if (bValidStoredSubSection) {
			iRestoredScrollPosition =
				this._computeScrollPosition(this.oCore.byId(this._oStoredScrolledSubSectionInfo.sSubSectionId)) +
				this._oStoredScrolledSubSectionInfo.iOffset;
			this._scrollTo(iRestoredScrollPosition, 0);
		} else {
			this.scrollToSection(this.getSelectedSection(), 0);
		}
	};

	/**
	 * Stores the more precise scroll position within the selected section
	 * @private
	 */
	ObjectPageLayout.prototype._storeScrollLocation = function () {

		if (!this.getDomRef() || !this._bDomReady || !this._oScroller) {
			return;
		}

		var iScrollTop = this._oScroller.getScrollTop(),
			sScrolledSubSectionId = this._getClosestScrolledSectionId(
				this._oScroller.getScrollTop(), this.iScreenHeight, true /* subSections only */),
			iScrollTopWithinScrolledSubSection;

		if (sScrolledSubSectionId) {
			iScrollTopWithinScrolledSubSection = iScrollTop -
				this._computeScrollPosition(this.oCore.byId(sScrolledSubSectionId));
		}

		this._iStoredScrollTop = iScrollTop;
		this._oStoredScrolledSubSectionInfo = {
			sSubSectionId: sScrolledSubSectionId,
			iOffset: iScrollTopWithinScrolledSubSection
		};
		this._oCurrentTabSection = null;
	};

	ObjectPageLayout.prototype.onkeyup = function (oEvent) {
		var oFocusedControlId,
			oFocusedControl;

		if (oEvent.which === KeyCodes.TAB) {
			oFocusedControlId = this.oCore.getCurrentFocusedControlId();
			oFocusedControl = oFocusedControlId && this.oCore.byId(oFocusedControlId);

			if (oFocusedControl && this._isFirstSection(oFocusedControl)) {
				this._scrollTo(0, 0);
			}
		}
	};

	//Footer section
	ObjectPageLayout.prototype.setShowFooter = function (bShowFooter) {
		var vResult = this.setProperty("showFooter", bShowFooter, true);
		this._toggleFooter(bShowFooter);
		return vResult;
	};

	/**
	 * Switch footer visibility
	 * @param {boolean} bShow switch visibility on if true
	 * @private
	 */
	ObjectPageLayout.prototype._toggleFooter = function (bShow) {
		var bUseAnimations,
			oFooter = this.getFooter();

		if (!exists(oFooter) || !exists(this._$footerWrapper)) {
			return;
		}

		bUseAnimations = this.oCore.getConfiguration().getAnimationMode() !== Configuration.AnimationMode.none;

		if (bUseAnimations) {
			this._toggleFooterAnimation(bShow, oFooter);
		} else {
			this._$footerWrapper.toggleClass("sapUiHidden", !bShow);
		}

		this._requestAdjustLayout();
	};

	/**
	 * Animates the footer.
	 * @param {boolean} bShow
	 * @param {object} oFooter
	 * @private
	 */
	ObjectPageLayout.prototype._toggleFooterAnimation = function(bShow, oFooter) {

		this._$footerWrapper.bind("webkitAnimationEnd animationend",
		this._onToggleFooterAnimationEnd.bind(this, oFooter));
		//Flagging if the animation has started
		this._bIsFooterAanimationGoing = true;

		if (bShow) {
			this._$footerWrapper.removeClass("sapUiHidden");
		}

		oFooter.toggleStyleClass(ObjectPageLayout.SHOW_FOOTER_CLASS_NAME, bShow);
		oFooter.toggleStyleClass(ObjectPageLayout.HIDE_FOOTER_CLASS_NAME, !bShow);
	};

	/**
	 * Footer animation end handler.
	 * @param {object} oFooter
	 * @private
	 */
	ObjectPageLayout.prototype._onToggleFooterAnimationEnd = function(oFooter) {

		this._$footerWrapper.unbind("webkitAnimationEnd animationend");

		if (oFooter.hasStyleClass(ObjectPageLayout.HIDE_FOOTER_CLASS_NAME)) {
			this._$footerWrapper.addClass("sapUiHidden");
			oFooter.removeStyleClass(ObjectPageLayout.HIDE_FOOTER_CLASS_NAME);
		} else {
			oFooter.removeStyleClass(ObjectPageLayout.SHOW_FOOTER_CLASS_NAME);
		}
		this._bIsFooterAanimationGoing = false;
	};

	/**
	 * In order to work properly in scenarios in which the objectPageLayout is cloned,
	 * it is necessary to also clone the hidden aggregations which are proxied.
	 * @override
	 * @returns {*}
	 */
	ObjectPageLayout.prototype.clone = function () {
		var oClone,
			oHeaderContent,
			oCloneHeaderContent;

		Object.keys(this.mAggregations).forEach(this._cloneProxiedAggregations, this);

		oClone = Control.prototype.clone.apply(this, arguments);
		oHeaderContent = this._getHeaderContent();

		oCloneHeaderContent = oClone._getHeaderContent();

		if (oCloneHeaderContent) { // a shallow (i.e. not deep) headerContent clone may be internally created by the objectPage if the original object had a headerTitle
			oCloneHeaderContent.destroy();
		}

		// "_headerContent" aggregation is hidden and it is not cloned by default => explicitly create a deep clone
		if (oHeaderContent) {
			oClone.setAggregation("_headerContent", oHeaderContent.clone(), true);
		}

		return oClone;
	};

	ObjectPageLayout.prototype._cloneProxiedAggregations = function (sAggregationName) {
		var oAggregation = this.mAggregations[sAggregationName];

		if (Array.isArray(oAggregation) && oAggregation.length === 0) {
			oAggregation = this["get" + sAggregationName.charAt(0).toUpperCase() + sAggregationName.slice(1)]();
		}

		this.mAggregations[sAggregationName] = oAggregation;
	};

	ObjectPageLayout.prototype._shouldPreserveHeaderInTitleArea = function () {
		return this._bPinned || this._preserveHeaderStateOnScroll() || this._checkAlwaysShowContentHeader();
	};

	ObjectPageLayout.prototype._checkAlwaysShowContentHeader = function () {
			return !this._hasDynamicTitle()
				&& !this._bMobileScenario
				&& !this._bTabletScenario
				&& this.getShowHeaderContent()
				&& this.getAlwaysShowContentHeader();
	};

	ObjectPageLayout.prototype._shouldOverridePreserveHeaderStateOnScroll = function () {
		return !Device.system.desktop && this._headerBiggerThanAllowedToBeFixed();
	};

	ObjectPageLayout.prototype._headerBiggerThanAllowedToBeFixed = function () {
		var iControlHeight = this._getOwnHeight();

		return this._getEntireHeaderHeight() > ObjectPageLayout.HEADER_MAX_ALLOWED_NON_SROLLABLE_PERCENTAGE * iControlHeight;
	};

	ObjectPageLayout.prototype._headerBiggerThanAllowedToBeExpandedInTitleArea = function () {
		return this._getEntireHeaderHeight() >= this._getOwnHeight();
	};

	ObjectPageLayout.prototype._getOwnHeight = function () {
		return this._getHeight(this);
	};

	ObjectPageLayout.prototype._getHeight = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerHeight() || 0;
	};

	ObjectPageLayout.prototype._getEntireHeaderHeight = function () {
		var iTitleHeight = 0,
			iHeaderHeight = 0,
			oTitle = this.getHeaderTitle(),
			oHeader = this._getHeaderContent();

		if (exists(oTitle)) {
			iTitleHeight = oTitle.$().outerHeight();
		}

		if (exists(oHeader)) {
			iHeaderHeight = oHeader.$().outerHeight();
		}

		return iTitleHeight + iHeaderHeight;
	};

	ObjectPageLayout.prototype._onPinUnpinButtonPress = function () {
		if (this._bPinned) {
			this._unPin();
		} else {
			this._pin();
			this._restorePinButtonFocus();
		}
	};

	/**
	 * Restores the focus of the pin button in the HeaderContent.
	 * @private
	 */
	ObjectPageLayout.prototype._restorePinButtonFocus = function () {
		var oHeaderContent = this._getHeaderContent();

		if (exists(oHeaderContent) && oHeaderContent.supportsPinUnpin()) {
			oHeaderContent._focusPinButton();
		}
	};

	ObjectPageLayout.prototype._pin = function () {
		var $oObjectPage = this.$();

		if (this._bPinned) {
			return;
		}

		this._bPinned = true;
		this._toggleHeaderTitle(true /* expand */);
		this._moveAnchorBarToTitleArea();
		this._moveHeaderToTitleArea();
		this._adjustHeaderHeights();
		this._requestAdjustLayout();
		this._togglePinButtonARIAState(this._bPinned);
		this._updateToggleHeaderVisualIndicators();

		if (exists($oObjectPage)) {
			$oObjectPage.addClass("sapUxAPObjectPageLayoutHeaderPinned");
		}
	};

	ObjectPageLayout.prototype._unPin = function () {
		var $oObjectPage = this.$();

		if (!this._bPinned) {
			return;
		}

		this._bPinned = false;
		this._updateToggleHeaderVisualIndicators();

		this._togglePinButtonARIAState(this._bPinned);

		if (exists($oObjectPage)) {
			$oObjectPage.removeClass("sapUxAPObjectPageLayoutHeaderPinned");
		}
	};

	/**
	 * Toggles the header pin button ARIA State
	 * @param {Boolean} bPinned
	 * @private
	 */
	ObjectPageLayout.prototype._togglePinButtonARIAState = function (bPinned) {
		var oHeaderContent = this._getHeaderContent();

		if (exists(oHeaderContent) && oHeaderContent.supportsPinUnpin()) {
			oHeaderContent._updateARIAPinButtonState(bPinned);
		}
	};

	/**
	 * Determines the adjusted value of <code>preserveHeaderStateOnScroll</code>,
	 * after the restrictions in <code>this._overridePreserveHeaderStateOnScroll</code> have been applied.
	 * @returns {boolean}
	 * @private
	 */
	ObjectPageLayout.prototype._preserveHeaderStateOnScroll = function () {
		return this._hasDynamicTitle() && this.getPreserveHeaderStateOnScroll() && !this._bHeaderBiggerThanAllowedHeight;
	};

	/**
	 * If the header is larger than the allowed height, the <code>preserveHeaderStateOnScroll</code> property will be ignored
	 * and the header can be expanded or collapsed on page scroll.
	 * @private
	 */
	ObjectPageLayout.prototype._overridePreserveHeaderStateOnScroll = function () {
		if (!this._shouldOverridePreserveHeaderStateOnScroll()) {
			this._bHeaderBiggerThanAllowedHeight = false;
			return;
		}

		this._bHeaderBiggerThanAllowedHeight = true;

		//move the header to content
		if (this._bHeaderExpanded) {
			this._moveAnchorBarToContentArea();
			this._moveHeaderToContentArea(true);
		} else {
			this._snapHeader(true);
		}
		this._adjustHeaderHeights();
		this._requestAdjustLayout();
	};

	ObjectPageLayout.prototype._hasDynamicTitle = function() {
		var oTitle = this.getHeaderTitle();
		return oTitle && oTitle.isDynamic();
	};

	/**
	 * Attaches handlers to <code>DynamicPageTitle</code> and <code>DynamicPageHeader</code> visual indicators` <code>press</code> events.
	 * @param {function} fnPress The handler function to call when the event occurs.
	 * @param {object} oContext The object that wants to be notified when the event occurs (<code>this</code> context within the
	 *                        handler function).
	 * @private
	 */
	ObjectPageLayout.prototype._attachVisualIndicatorsPressHandlers = function (fnPress, oContext) {
		var oTitle = this.getHeaderTitle(),
			oHeader = this._getHeaderContent();

		if (exists(oTitle) && !this._bAlreadyAttachedTitleIndicatorPressHandler) {
			oTitle.attachEvent(ObjectPageLayout.EVENTS.TITLE_VISUAL_INDICATOR_PRESS, function () {
				fnPress.call(oContext);
				if (this._headerBiggerThanAllowedToBeExpandedInTitleArea()) {
					// scroll to show the 'collapse' visual-indicator before focusing it
					// this is needed in order to specify the **exact** position (scrollTop) of the visual-indicator
					// because the default position (from the browser default auto-scroll to newly-focused item) is not UX-compliant
					this._scrollBelowCollapseVisualIndicator();
				}
				this._focusCollapseVisualIndicator();
			}, this);
			this._bAlreadyAttachedTitleIndicatorPressHandler = true;
		}

		if (exists(oHeader) && !this._bAlreadyAttachedHeaderIndicatorPressHandler) {
			oHeader.attachEvent(ObjectPageLayout.EVENTS.HEADER_VISUAL_INDICATOR_PRESS, function () {
				fnPress.call(oContext);
				this._focusExpandVisualIndicator();
			}, this);
			this._bAlreadyAttachedHeaderIndicatorPressHandler = true;
		}
	};

	/**
	 * Returns <code>true</code> if ObjectPageLayout has <code>headerTitle</code> and <code>headerContent</code> aggregations set and they are both visible.
	 * @private
	 */
	ObjectPageLayout.prototype._hasVisibleDynamicTitleAndHeader = function () {
		var oTitle = this.getHeaderTitle(),
			oHeader = this.getHeaderContent();

		return exists(oTitle) && oTitle.isDynamic() && oTitle.getVisible() && exists(oHeader) && oHeader.length > 0;
	};

	/**
	 * Returns <code>true</code> if ObjectPageLayout has Dynamic <code>headerTitle</code> and a valid <code>snappedTitleOnMobile</code> aggregation set in it.
	 * @private
	 */
	ObjectPageLayout.prototype._hasDynamicTitleWithSnappedTitleOnMobile = function () {
		var oTitle = this.getHeaderTitle();

		return exists(oTitle) && oTitle.isDynamic() && !!oTitle.getSnappedTitleOnMobile() && Device.system.phone;
	};

	/**
	 * Updates the visibility of the <code>expandButton</code> and <code>collapseButton</code>.
	 * @private
	 */
	ObjectPageLayout.prototype._updateToggleHeaderVisualIndicators = function () {
		var bHeaderExpanded,
			bCollapseVisualIndicatorVisible,
			bExpandVisualIndicatorVisible,
			bHasTitleAndHeader = this._hasVisibleDynamicTitleAndHeader();

		if (!this.getToggleHeaderOnTitleClick() || !bHasTitleAndHeader) {
			bCollapseVisualIndicatorVisible = false;
			bExpandVisualIndicatorVisible = false;
		} else {
			bHeaderExpanded = this._bHeaderExpanded;
			bCollapseVisualIndicatorVisible = bHeaderExpanded;

			// by UX design, there shouldn't be an expand button in the case of snappedTitleOnMobile with DynamicTitle
			bExpandVisualIndicatorVisible = !bHeaderExpanded && !this._hasDynamicTitleWithSnappedTitleOnMobile();
		}

		this._toggleCollapseVisualIndicator(bCollapseVisualIndicatorVisible);
		this._toggleExpandVisualIndicator(bExpandVisualIndicatorVisible);
	};

	/**
	 * Updates the focus visibility and active state of the <code>headerTitle</code>.
	 * @private
	 */
	ObjectPageLayout.prototype._updateTitleVisualState = function () {
		var oTitle = this.getHeaderTitle(),
			bTitleActive = this._hasVisibleDynamicTitleAndHeader() &&
				this.getToggleHeaderOnTitleClick() && !this._hasDynamicTitleWithSnappedTitleOnMobile();

		this.$().toggleClass("sapUxAPObjectPageLayoutTitleClickEnabled", bTitleActive);
		if (exists(oTitle)) {
			oTitle._toggleFocusableState(bTitleActive);
		}
	};

	/**
	 * Focuses the <code>DynamicPageTitle</code> <code>collapseButton</code> aggregation.
	 * @private
	 */
	ObjectPageLayout.prototype._focusCollapseVisualIndicator = function () {
		var oDynamicPageHeader = this._getHeaderContent();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._focusCollapseButton();
		}
	};


	/**
	 * Focuses the <code>DynamicPageTitle</code> <code>expandButton</code> aggregation.
	 * @private
	 */
	ObjectPageLayout.prototype._focusExpandVisualIndicator = function () {
		var oDynamicPageTitle = this.getHeaderTitle();

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._focusExpandButton();
		}
	};


	/**
	 * Toggles the <code>DynamicPageTitle</code> <code>expandButton</code> aggregation.
	 * @param {boolean} bToggle
	 * @private
	 */
	ObjectPageLayout.prototype._toggleExpandVisualIndicator = function (bToggle) {
		var oDynamicPageTitle = this.getHeaderTitle();

		if (exists(oDynamicPageTitle)) {
			oDynamicPageTitle._toggleExpandButton(bToggle);
		}
	};


	/**
	 * Toggles the <code>DynamicPageTitle</code> <code>collapseButton</code> aggregation.
	 * @param {boolean} bToggle
	 * @private
	 */
	ObjectPageLayout.prototype._toggleCollapseVisualIndicator = function (bToggle) {
		var oDynamicPageHeader = this._getHeaderContent();

		if (exists(oDynamicPageHeader)) {
			oDynamicPageHeader._toggleCollapseButton(bToggle);
		}
	};

	/**
	 * Attaches handlers to  <code>DynamicPageHeader</code> visual indicators` <code>mouseover</code> and <code>mouseout</code> events.
	 *
	 * <b>Note:</b> No need to attach for <code>DynamicPageTitle</code> visual indicator <code>mouseover</code> and <code>mouseout</code> events,
	 * as being part of the <code>DynamicPageTitle</code>,
	 * the visual indicator produces <code>mouseover</code> and <code>mouseout</code> events on the <code>DynamicPageTitle</code> by default.
	 * @param {function} fnOver The handler function to call when the <code>mouseover</code> event occurs
	 * @param {function} fnOut The handler function to call when the <code>mouseout</code> event occurs
	 * @param {object} oContext The object that wants to be notified when the event occurs (<code>this</code> context within the
	 *                        handler function).
	 * @private
	 */
	ObjectPageLayout.prototype._attachVisualIndicatorMouseOverHandlers = function (fnOver, fnOut, oContext) {
		var oHeader = this._getHeaderContent();

		if (exists(oHeader) && !this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler) {
			oHeader.attachEvent(ObjectPageLayout.EVENTS.VISUAL_INDICATOR_MOUSE_OVER, fnOver, oContext);
			oHeader.attachEvent(ObjectPageLayout.EVENTS.VISUAL_INDICATOR_MOUSE_OUT, fnOut, oContext);
			this._bAlreadyAttachedVisualIndicatorMouseOverOutHandler = true;
		}
	};

	/**
	 * Attaches handlers to <code>DynamicPageTitle</code> <code>mouseover</code> and <code>mouseout</code> events.
	 * @param {function} fnOver The handler function to call when the <code>mouseover</code> event occurs
	 * @param {function} fnOut The handler function to call when the <code>mouseout</code> event occurs
	 * @param {object} oContext The object that wants to be notified when the event occurs (<code>this</code> context within the
	 *                        handler function).
	 * @private
	 */
	ObjectPageLayout.prototype._attachTitleMouseOverHandlers = function (fnOver, fnOut, oContext) {
		var oTitle = this.getHeaderTitle();

		if (exists(oTitle) && !this._bAlreadyAttachedTitleMouseOverOutHandler) {
			oTitle.attachEvent(ObjectPageLayout.EVENTS.TITLE_MOUSE_OVER, fnOver, oContext);
			oTitle.attachEvent(ObjectPageLayout.EVENTS.TITLE_MOUSE_OUT, fnOut, oContext);
			this._bAlreadyAttachedTitleMouseOverOutHandler = true;
		}
	};

	/**
	 * Sets a flag to [temporarily] deactivate any scrolling requested with the <code>sap.uxap.ObjectPageLayout.prototype._scrollTo</code> function
	 * This flag is used by RTA for the purpose of postponing the auto-scrolling of the ObjectPage to its selected section
	 * so that the scrolling does not start before RTA operation fully completed
	 * @private
	 * @ui5-restricted
	 */
	ObjectPageLayout.prototype._suppressScroll = function () {
		this._bSuppressScroll = true;
	};

	/**
	 * Un-sets the flag that deactivates scrolling requested with the <code>sap.uxap.ObjectPageLayout.prototype._scrollTo</code> function
	 * This flag is used by RTA for the purpose of postponing/resuming the auto-scrolling of the ObjectPage to its selected section
	 * so that the scrolling does not start before RTA operation fully completed
	 * @private
	 * @ui5-restricted
	 */
	ObjectPageLayout.prototype._resumeScroll = function () {
		this._bSuppressScroll = false;
		// restore state:
		// (1) restore latest stored scrollPosition
		// (2) adjust snapped state and selectedSection to the ones that corresponds to the current scrollPosition (these, by design, will be auto-detected and adjusted in the **onScroll** listener)
		if (this._iStoredScrollTop) { // restore scroll position if available
			this._scrollTo(this._iStoredScrollTop, 0); // snapped state and selectedSection will be auto-detected and adjusted in the onScroll handler
		} else { // remain at current scroll position
			this._onScroll({target: {scrollTop: this._$opWrapper.scrollTop()}}); // explicitly call the onScroll handler to allow auto-detect and adjust the selectedSection and the snapped state
		}
	};

	ObjectPageLayout.prototype._addHoverClass = function() {
		var $oObjectPage = this.$();

		if ($oObjectPage) {
			$oObjectPage.addClass("sapUxAPObjectPageLayoutTitleForceHovered");
		}
	};

	ObjectPageLayout.prototype._removeHoverClass = function () {
		var $oObjectPage = this.$();

		if ($oObjectPage) {
			$oObjectPage.removeClass("sapUxAPObjectPageLayoutTitleForceHovered");
		}
	};

	ObjectPageLayout.prototype._getHeight = function (oControl) {
		return !(oControl instanceof Control) ? 0 : oControl.$().outerHeight() || 0;
	};

	/**
	 * Determines the width of a control safely. If the control doesn't exist, it returns 0.
	 * If it exists, it returns the DOM element width.
	 * @param  {sap.ui.core.Control} oControl
	 * @return {Number} the width of the control
	 */
	ObjectPageLayout.prototype._getWidth = function (oControl) {
		var oDomReference = oControl.getDomRef();
		return !(oControl instanceof Control) ? 0 : (oDomReference && oDomReference.offsetWidth) || 0;
	};

	/**
	 * Returns the bSectionInfoIsDirty flag indicating if the information in the this._oSectionInfo object is valid.
	 * @returns {boolean}
	 * @private
	 */
	ObjectPageLayout.prototype._getSectionInfoIsDirty = function () {
		return this.bSectionInfoIsDirty;
	};

	/**
	 * Sets the bSectionInfoIsDirty flag.
	 * @param bDirty {boolean}
	 * @private
	 */
	ObjectPageLayout.prototype._setSectionInfoIsDirty = function (bDirty) {
		this.bSectionInfoIsDirty = bDirty;
	};


	ObjectPageLayout.prototype._getAriaLabelText = function (sElement) {
		var oHeader = this.getHeaderTitle(),
			sTitleText = oHeader ? oHeader.getTitleText() : null,
			sAriaLabelText;

		if (oHeader && sTitleText) {
			sAriaLabelText = sTitleText + " " + ObjectPageLayout._getLibraryResourceBundle().getText(sElement + "_ARIA_LABEL_WITH_TITLE");
		} else {
			sAriaLabelText = ObjectPageLayout._getLibraryResourceBundle().getText(sElement + "_ARIA_LABEL_WITHOUT_TITLE");
		}

		return sAriaLabelText;
	};

	/**
	 * Returns the footer height, by either obtaining its DOM element height
	 * or directly returning 0 if no visible footer
	 * @returns {number}
	 * @private
	 */
	ObjectPageLayout.prototype._getFooterHeight = function () {
		if (this.getFooter() && this.getShowFooter()) {
			return this._getDOMRefHeight(this.$("footerWrapper").get(0));
		}
		return 0;
	};

	/*
	* Returns the <code>DOM reference</code> height, using the getBoundingClientRect method.
	* Note: internally the method checks if the DOM reference has existing parent element
	* to avoid errors, thrown in IE10 and IE11
	*/
	ObjectPageLayout.prototype._getDOMRefHeight = function (oDOMRef) {
		return oDOMRef.parentElement ? oDOMRef.getBoundingClientRect().height : 0;
	};

	/*
	 * Updates the ObjectPage ARIA labels in the DOM in case of title change and no user pre-defined labels.
	 */
	ObjectPageLayout.prototype._updateAriaLabels = function () {
		var oLandmarkInfo = this.getLandmarkInfo(),
			sRootText = this._getAriaLabelText("ROOT"),
			sHeaderText = this._getAriaLabelText("HEADER"),
			sNavigationText = this._getAriaLabelText("NAVIGATION"),
			sToolbarText = this._getAriaLabelText("NAVTOOLBAR"),
			bHeaderLabelSet = oLandmarkInfo && oLandmarkInfo.getHeaderLabel(),
			bRootLabelSet = oLandmarkInfo && oLandmarkInfo.getRootLabel(),
			bNavigationLabelSet = oLandmarkInfo && oLandmarkInfo.getNavigationLabel();

		if (!bRootLabelSet) {
			this.$().attr("aria-label", sRootText);
		}
		if (!bHeaderLabelSet) {
			this.$("headerTitle").attr("aria-label", sHeaderText);
		}
		if (!bNavigationLabelSet) {
			this.$("anchorBar").attr("aria-label", sNavigationText);
			this.$("stickyAnchorBar").attr("aria-label", sNavigationText);
		}
		this.$("anchBar").attr("aria-label", sToolbarText);
	};

	/**
	 * Formats <code>ObjectPageAccessibleLandmarkInfo</code> role and label of the provided <code>ObjectPageLayout</code> part.
	 *
	 * @param {sap.uxap.ObjectPageAccessibleLandmarkInfo} oLandmarkInfo ObjectPageLayout LandmarkInfo
	 * @param {string} sPartName part of the page
	 * @returns {sap.f.ObjectPageAccessibleLandmarkInfo} The formatted landmark info
	 * @private
	 */
	ObjectPageLayout.prototype._formatLandmarkInfo = function (oLandmarkInfo, sPartName) {
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
	 * @param {sap.uxap.ObjectPageAccessibleLandmarkInfo} oLandmarkInfo ObjectPageLayout LandmarkInfo
	 * @returns {string} The HTML tag of the page header.
	 * @private
	 */
	ObjectPageLayout.prototype._getHeaderTag = function (oLandmarkInfo) {
		if (oLandmarkInfo && oLandmarkInfo.getHeaderRole() !== AccessibleLandmarkRole.None) {
			return ObjectPageLayout.DIV;
		}

		return ObjectPageLayout.HEADER;
	};

	/**
	 * Returns HTML tag of the page footer.
	 *
	 * @param {sap.uxap.ObjectPageAccessibleLandmarkInfo} oLandmarkInfo ObjectPageLayout LandmarkInfo
	 * @returns {string} The HTML tag of the page footer.
	 * @private
	 */
	ObjectPageLayout.prototype._getFooterTag = function (oLandmarkInfo) {
		if (oLandmarkInfo && oLandmarkInfo.getFooterRole() !== AccessibleLandmarkRole.None) {
			return ObjectPageLayout.DIV;
		}

		return ObjectPageLayout.FOOTER;
	};

	function exists(vObject) {
		if (arguments.length === 1) {
			return Array.isArray(vObject) ? vObject.length > 0 : !!vObject;
		}

		return Array.prototype.slice.call(arguments).every(function (oObject) {
			return exists(oObject);
		});
	}

	return ObjectPageLayout;
});
