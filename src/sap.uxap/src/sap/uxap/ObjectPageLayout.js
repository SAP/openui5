/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageLayout.
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/ResizeHandler",
	"sap/ui/core/Control",
	"sap/ui/core/CustomData",
	"sap/ui/Device",
	"sap/ui/core/delegate/ScrollEnablement",
	"./ObjectPageSubSection",
	"./ObjectPageSubSectionLayout",
	"./LazyLoading",
	"./ObjectPageLayoutITBHelper",
	"./ObjectPageLayoutABHelper",
	"./library"
], function (jQuery, ResizeHandler, Control, CustomData, Device, ScrollEnablement, ObjectPageSubSection, ObjectPageSubSectionLayout, LazyLoading, ITBHelper, ABHelper, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An ObjectPageLayout is the layout control, used to put together all parts of an Object page - Header, Navigation bar and Sections/Subsections.
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
				 */
				height: {type: "sap.ui.core.CSSSize", defaultValue: '100%'},

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
				 * Use sap.m.IconTabBar instead of the default Anchor bar
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
				 * @since 1.34.0
				 */
				isChildPage: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Determines whether Header Content will always be expanded on desktop.
				 * @since 1.34.0
				 */
				alwaysShowContentHeader: {type: "boolean", group: "Behavior", defaultValue: false},

				/**
				 * Determines whether an Edit button will be shown in Header Content.
				 * @since 1.34.0
				 */
				showEditHeaderButton: {type: "boolean", group: "Behavior", defaultValue: false}

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
				headerTitle: {type: "sap.uxap.ObjectPageHeader", multiple: false},

				/**
				 * Object page header content - the dynamic part of the Object page header.
				 */
				headerContent: {type: "sap.ui.core.Control", multiple: true, singularName: "headerContent"},

				/**
				 * Internal aggregation to hold the reference to the AnchorBar.
				 */
				_anchorBar: {type: "sap.uxap.AnchorBar", multiple: false, visibility: "hidden"},

				/**
				 * Internal aggregation to hold the reference to the IconTabBar.
				 */
				_iconTabBar: {type: "sap.m.IconTabBar", multiple: false, visibility: "hidden"},

				/**
				 * Internal aggregation to hold the reference to the ObjectPageHeaderContent.
				 */
				_headerContent: {type: "sap.uxap.ObjectPageHeaderContent", multiple: false, visibility: "hidden"}
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
				 * The event is fired when the Edit Header button is pressed
				 */
				editHeaderButtonPress: {}
			},
			designTime : true
		}
	});


	/**
	 * Scrolls the Object page to the given Section
	 *
	 * @name sap.uxap.ObjectPageLayout#scrollToSection
	 * @function
	 * @param {string} sId
	 *         The Section ID to scroll to
	 * @param {int} iDuration
	 *         Scroll duration (in ms). Default value is 0
	 * @param {int} iOffset
	 *         Additional pixels to scroll
	 * @type sap.uxap.ObjectPageLayout
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/**
	 * Returns a sap.ui.core.delegate.ScrollEnablement object used to handle scrolling
	 *
	 * @name sap.uxap.ObjectPageLayout#getScrollDelegate
	 * @function
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */


	/*************************************************************************************
	 * life cycle management
	 ************************************************************************************/

	ObjectPageLayout.prototype.init = function () {

		// lazy loading
		this._bFirstRendering = true;
		this._bDomReady = false;                    //dom is fully ready to be inspected
		this._bStickyAnchorBar = false;             //status of the header

		// anchorbar management
		this._bInternalAnchorBarVisible = true;

		this._$opWrapper = [];                      //dom reference to the header for Dark mode background image scrolling scenario
		this._$anchorBar = [];                      //dom reference to the anchorBar
		this._$headerTitle = [];                    //dom reference to the header title
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
		this.iTotalHeaderSize = 0;                  // total size of headerTitle + headerContent

		this._iResizeId = ResizeHandler.register(this, this._onUpdateScreenSize.bind(this));

		this._oLazyLoading = new LazyLoading(this);
		this._oITBHelper = new ITBHelper(this);
		this._oABHelper = new ABHelper(this);
	};

	/**
	 * update the anchor bar content accordingly to the section info and enable the lazy loading of the first visible sections
	 */

	ObjectPageLayout.prototype.onBeforeRendering = function () {
		this._bMobileScenario = library.Utilities.isPhoneScenario();
		this._bTabletScenario = library.Utilities.isTabletScenario();

		// if we have Header Content on a desktop, check if it is always expanded
		this._bHContentAlwaysExpanded = this._checkAlwaysShowContentHeader();

		this._initializeScroller();

		this._getHeaderContent().setContentDesign(this._getHeaderDesign());
		this._oABHelper._getAnchorBar().setUpperCase(this.getUpperCaseAnchorBar());

		// do not call applyUxRules each time for IconTabBar mode, otherwise switching between sections would be compromised
		if (this._bFirstRendering || !this.getUseIconTabBar()) {
			this._applyUxRules();
		}

		// If we are on the first true rendering : first time we render the page with section and blocks
		if (!jQuery.isEmptyObject(this._oSectionInfo) && this._bFirstRendering) {
			if (!this.getEnableLazyLoading()) {
				// In case we are not lazy loaded make sure that we connect the blocks properly...
				this._connectModelsForSections(this.getSections());
			} else {
				// connect first visible subsections
				this._connectModelsForSections(this._oLazyLoading.getSubsectionsToPreload(this._aSectionBases));
			}
			this._bFirstRendering = false;
		}

		this._bStickyAnchorBar = false; //reset default state in case of re-rendering
	};


	/*************************************************************************************
	 * header & scroll management
	 ************************************************************************************/

	ObjectPageLayout.prototype.onAfterRendering = function () {

		this._ensureCorrectParentHeight();

		this._cacheDomElements();

		this._$opWrapper.on("scroll", this._onScroll.bind(this));

		//the dom is already ready (re-rendering case), thus we compute the header immediately
		//in order to avoid flickering (see Incident 1570011343)
		if (this._bDomReady && this.$().parents(":hidden").length === 0) {
			this._onAfterRenderingDomReady();
		} else {
			jQuery.sap.delayedCall(ObjectPageLayout.HEADER_CALC_DELAY, this, this._onAfterRenderingDomReady);
		}

	};

	ObjectPageLayout.prototype._onAfterRenderingDomReady = function () {
		this._bDomReady = true;

		this._adjustHeaderHeights();

		this._initAnchorBarScroll();

		if (this.getUseIconTabBar()) {
			this._oITBHelper._setFacetInitialVisibility();
		}
		this._setSectionsFocusValues();
	};

	ObjectPageLayout.prototype.exit = function () {
		if (this._oScroller) {
			this._oScroller.destroy();
			this._oScroller = null;
		}

		if (this._iResizeId) {
			ResizeHandler.deregister(this._iResizeId);
		}
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

	ObjectPageLayout.prototype._initializeScroller = function () {
		//are we re-rendering an existing objectPageLayout?
		//if so we need to reset the scroller as it gets confused
		if (this._oScroller) {
			this._oScroller.scrollTo(0, 0, 0);         //reset the actual scroll position
			this._oScroller.destroy();
		}

		//Internal Incident: 1482023778: workaround BB10 = use zynga instead of iScroll
		var bEnforceZynga = (Device.os.blackberry && Device.os.version >= 10.0 && Device.os.version < 11.0);

		this._oScroller = new ScrollEnablement(this, this.getId() + "-scroll", {
			horizontal: false,
			vertical: true,
			zynga: bEnforceZynga,
			preventDefault: true,
			nonTouchScrolling: "scrollbar",
			scrollbarClass: "sapUxAPObjectPageScroll"
		});
	};

	ObjectPageLayout.prototype._ensureCorrectParentHeight = function () {
		//if our container has not set a height, we need to enforce it or nothing will get displayed
		//the reason is the objectPageLayout has 2 containers with position:absolute, height:100%
		if (this.getParent().getHeight && ["", "auto"].indexOf(this.getParent().getHeight()) !== -1) {
			this.$().parent().css("height", "100%");
		}
	};

	ObjectPageLayout.prototype._cacheDomElements = function () {
		this._$headerTitle = jQuery.sap.byId(this.getId() + "-headerTitle");
		this._$anchorBar = jQuery.sap.byId(this.getId() + "-anchorBar");
		this._$stickyAnchorBar = jQuery.sap.byId(this.getId() + "-stickyAnchorBar");
		this._$opWrapper = jQuery.sap.byId(this.getId() + "-opwrapper");
		this._$spacer = jQuery.sap.byId(this.getId() + "-spacer");
		this._$headerContent = jQuery.sap.byId(this.getId() + "-headerContent");
		this._$stickyHeaderContent = jQuery.sap.byId(this.getId() + "-stickyHeaderContent");
		this._$contentContainer = jQuery.sap.byId(this.getId() + "-scroll");
	};

	/**
	 * returns the ObjectPageContainer html element
	 * @private
	 * @returns {*} $ container element
	 */
	ObjectPageLayout.prototype._getContainerElement = function () {
		return this.$().find(".sapUxAPObjectPageContainer")[0];
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
			bVisibleAnchorBar, bVisibleIconTabBar, oFirstVisibleSection, oFirstVisibleSubSection;

		aSections = this.getSections() || [];
		iVisibleSection = 0;
		bVisibleAnchorBar = this.getShowAnchorBar();
		bVisibleIconTabBar = this.getUseIconTabBar();

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
					jQuery.sap.log.info("ObjectPageLayout :: noVisibleBlock UX rule matched", "subSection " + oSubSection.getTitle() + " forced to hidden");
				} else {
					oSubSection._setInternalVisible(true, bInvalidate);
					//if TitleOnTop.sectionGetSingleSubSectionTitle is matched, this will be hidden back
					oSubSection._setInternalTitleVisible(true, bInvalidate);
					iVisibleSubSections++;
					if (!oFirstVisibleSubSection) {
						oFirstVisibleSubSection = oSubSection;
					}
				}

			}, this);

			//rule noVisibleSubSection: If a section has no content (or only empty subsections) the section will be hidden.
			if (iVisibleSubSections == 0) {
				oSection._setInternalVisible(false, bInvalidate);
				jQuery.sap.log.info("ObjectPageLayout :: noVisibleSubSection UX rule matched", "section " + oSection.getTitle() + " forced to hidden");
			} else {
				oSection._setInternalVisible(true, bInvalidate);
				oSection._setInternalTitleVisible(true, bInvalidate);
				if (!oFirstVisibleSection) {
					oFirstVisibleSection = oSection;
				}

				//rule TitleOnTop.sectionGetSingleSubSectionTitle: If a section as only 1 subsection and the subsection title is not empty, the section takes the subsection title on titleOnTop layout only
				if (this.getSubSectionLayout() === ObjectPageSubSectionLayout.TitleOnTop &&
					iVisibleSubSections === 1 && oFirstVisibleSubSection.getTitle().trim() !== "") {
					jQuery.sap.log.info("ObjectPageLayout :: TitleOnTop.sectionGetSingleSubSectionTitle UX rule matched", "section " + oSection.getTitle() + " is taking its single subsection title " + oFirstVisibleSubSection.getTitle());
					oSection._setInternalTitle(oFirstVisibleSubSection.getTitle(), bInvalidate);
					oFirstVisibleSubSection._setInternalTitleVisible(false, bInvalidate);
				} else {
					oSection._setInternalTitle("", bInvalidate);
				}

				iVisibleSection++;
			}

			if (bVisibleIconTabBar) {
				oSection._setInternalTitleVisible(false, bInvalidate);
			}

		}, this);

		//rule notEnoughVisibleSection: If there is only 1 section overall, the navigation control shall be hidden.
		if (iVisibleSection <= 1) {
			bVisibleAnchorBar = false;
			bVisibleIconTabBar = false;
			jQuery.sap.log.info("ObjectPageLayout :: notEnoughVisibleSection UX rule matched", "anchorBar forced to hidden");
			//rule firstSectionTitleHidden: the first section title is never visible if there is an anchorBar
		} else if (oFirstVisibleSection && bVisibleAnchorBar) {
			oFirstVisibleSection._setInternalTitleVisible(false, bInvalidate);
			jQuery.sap.log.info("ObjectPageLayout :: firstSectionTitleHidden UX rule matched", "section " + oFirstVisibleSection.getTitle() + " title forced to hidden");
		}

		// the AnchorBar/IconTabBar needs to reflect the dom state
		if (bVisibleIconTabBar) {
			this._oITBHelper._buildIconTabBar();
		} else if (bVisibleAnchorBar) {
			this._oABHelper._buildAnchorBar();
		}

		this._setInternalAnchorBarVisible(bVisibleAnchorBar, bInvalidate);
	};

	/*************************************************************************************
	 * lazy loading
	 ************************************************************************************/


	/*************************************************************************************
	 * IconTabBar management
	 ************************************************************************************/

	/**
	 * Overrides the setter for the useIconTabBar property, so it disables the showAnchorBar property
	 * @param bValue
	 * @param bSuppressInvalidate
	 * @returns this
	 */
	ObjectPageLayout.prototype.setUseIconTabBar = function (bValue) {
		if (bValue === true) {
			this.setProperty("useIconTabBar", true);
			this.setProperty("showAnchorBar", false);
		} else {
			this.setProperty("useIconTabBar", false);
		}

		return this;
	};


	/*************************************************************************************
	 * anchor bar management
	 ************************************************************************************/

	ObjectPageLayout.prototype.setShowAnchorBarPopover = function (bValue, bSuppressInvalidate) {
		this._oABHelper._getAnchorBar().setShowPopover(bValue);
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

	ObjectPageLayout.prototype._adjustLayout = function (oEvent, bImmediate, bNeedLazyLoading) {

		//adjust the layout only if the object page is full ready
		if (!this._bDomReady) {
			return;
		}

		//postpone until we get requests
		if (this._iLayoutTimer) {
			jQuery.sap.log.debug("ObjectPageLayout :: _adjustLayout", "delayed by " + ObjectPageLayout.DOM_CALC_DELAY + " ms because of dom modifications");
			jQuery.sap.clearDelayedCall(this._iLayoutTimer);
		}

		if (bImmediate) {
			this._updateScreenHeightSectionBasesAndSpacer();
			this._iLayoutTimer = undefined;
		} else {
			//need to "remember" if one of the adjustLayout is requesting the lazyLoading
			this._bNeedLazyLoading = this._bNeedLazyLoading !== undefined || bNeedLazyLoading;

			this._iLayoutTimer = jQuery.sap.delayedCall(ObjectPageLayout.DOM_CALC_DELAY, this, function () {
				jQuery.sap.log.debug("ObjectPageLayout :: _adjustLayout", "re-evaluating dom positions");
				this._updateScreenHeightSectionBasesAndSpacer();

				//in case the layout has changed we need to re-evaluate the lazy loading
				if (this._bNeedLazyLoading) {
					this._oLazyLoading.doLazyLoading();
				}

				this._bNeedLazyLoading = undefined;
				this._iLayoutTimer = undefined;
			});
		}
	};


	/**
	 * adjust the layout but also the ux rules
	 * used for refreshing the overall structure of the objectPageLayout when it as been updated after the first rendering
	 * @private
	 */

	ObjectPageLayout.prototype._adjustLayoutAndUxRules = function () {
		//in case we have added a section or subSection which change the ux rules
		jQuery.sap.log.debug("ObjectPageLayout :: _adjustLayout", "refreshing ux rules");

		var sSelectedSectionId = this._getSelectedSectionId(); //obtain the currently selected section in the navBar before navBar is destroyed

		this._applyUxRules(true);

		this._setSelectedSectionId(sSelectedSectionId); //reselect the current section in the navBar

		this._adjustLayout(null, false, true /* requires a check on lazy loading */);
	};


	ObjectPageLayout.prototype._getSelectedSectionId = function () {

		var oAnchorBar = this.getAggregation("_anchorBar"),
			oIconTabBar = this.getAggregation("_iconTabBar"),
			sSelectedSectionId;

		if (oAnchorBar && oAnchorBar.getSelectedSection()) {
			sSelectedSectionId = oAnchorBar.getSelectedSection().getId();
		}

		if (oIconTabBar && oIconTabBar.getSelectedKey()) {
			var sSelectedKey = oIconTabBar.getSelectedKey(),
				oSelectedItem = sap.ui.getCore().byId(sSelectedKey);
			if (oSelectedItem && oSelectedItem.data("selectedSection")) {
				sSelectedSectionId = oSelectedItem.data("selectedSection").getId();
			}
		}
		return sSelectedSectionId;
	};


	ObjectPageLayout.prototype._setSelectedSectionId = function (sSelectedSectionId) {
		var oAnchorBar = this.getAggregation("_anchorBar"),
			oIconTabBar = this.getAggregation("_iconTabBar"),
			oSelectedSectionInfo = sSelectedSectionId && this._oSectionInfo[sSelectedSectionId];

		if (!oSelectedSectionInfo) {
			return;
		}

		if (oAnchorBar && oSelectedSectionInfo.buttonId) {
			oAnchorBar.setSelectedButton(oSelectedSectionInfo.buttonId);
		} else if (oIconTabBar && oSelectedSectionInfo.filterId) {
			oIconTabBar.setSelectedKey(oSelectedSectionInfo.filterId);
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
			oAnchorBar.destroyContent();
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
			realTop: 0.0,
			buttonId: "",
			isSection: (oSectionBase instanceof library.ObjectPageSection),
			sectionReference: oSectionBase
		};

		this._aSectionBases.push(oSectionBase);
	};

	/**
	 * Scroll to a specific Section
	 *
	 * @param sId       id of the section to scroll to
	 * @param iDuration  Scroll duration. Default value is 0
	 * @param iOffset Additional offset to scroll
	 *
	 */
	ObjectPageLayout.prototype.scrollToSection = function (sId, iDuration, iOffset) {
		var oSection = sap.ui.getCore().byId(sId);

		iOffset = iOffset || 0;

		oSection._expandSection();
		//call _adjustLayout synchronously to make extra sure we have the right positionTops for all sectionBase before scrolling
		this._adjustLayout(null, true);

		iDuration = parseInt(iDuration, 10);
		iDuration = iDuration >= 0 ? iDuration : this._iScrollToSectionDuration;

		var bFirstLevel = oSection && (oSection.getMetadata().getName() === "sap.uxap.ObjectPageSection");

		var iScrollTo = this._bMobileScenario || bFirstLevel ? this._oSectionInfo[sId].positionTopMobile : this._oSectionInfo[sId].positionTop;

		//avoid triggering twice the scrolling onto the same target section
		if (this._sCurrentScrollId != sId) {
			this._sCurrentScrollId = sId;

			if (this._iCurrentScrollTimeout) {
				clearTimeout(this._iCurrentScrollTimeout);
				this._$contentContainer.parent().stop(true, false);
			}

			this._iCurrentScrollTimeout = jQuery.sap.delayedCall(iDuration, this, function () {
				this._sCurrentScrollId = undefined;
				this._iCurrentScrollTimeout = undefined;
			});


			if (this.getEnableLazyLoading()) {
				//connect target subsection to avoid delay in data loading
				if (Device.system.desktop) {
					//on desktop we delay the call to have the preload done during the scrolling animation
					jQuery.sap.delayedCall(50, this, function () {
						this._connectModelsForSections(this._oLazyLoading.getSubsectionsToPreload(this._aSectionBases, sId));
					});
				} else {
					//on device, do the preload first then scroll.
					//doing anything during the scrolling animation may
					//trouble animation and lazy loading on slow devices.
					this._connectModelsForSections(this._oLazyLoading.getSubsectionsToPreload(this._aSectionBases, sId));
				}
			}
			this._scrollTo(iScrollTo + iOffset, iDuration);
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
	 * @param sDirectSectionId - the section to be scrolled directly to
	 */
	ObjectPageLayout.prototype.setDirectScrollingToSection = function (sDirectSectionId) {
		this.sDirectSectionId = sDirectSectionId;
	};

	/**
	 * Get the destination section of the ongoing scroll
	 * When this one is non-null, then the page will skip intermediate sections [during the scroll from the current to the destination section]
	 * and will scroll directly to the given section
	 * @param sDirectSectionId - the section to be scrolled directly to
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
		if (this._oScroller) {
			jQuery.sap.log.debug("ObjectPageLayout :: scrolling to " + y);
			this._oScroller.scrollTo(0, y, time);
		}
		return this;
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
			iHeaderGap = 0;

		this.iScreenHeight = this.$().height();

		if (!this._bHContentAlwaysExpanded) {
			iHeaderGap = this.iHeaderTitleHeightStickied - this.iHeaderTitleHeight;
		}

		this._aSectionBases.forEach(function (oSectionBase) {
			var oInfo = this._oSectionInfo[oSectionBase.getId()],
				$this = oSectionBase.$(),
				$mobileAnchor;

			if (!oInfo /* sectionBase is visible */ || !$this.length) {
				return;
			}

			oInfo.$dom = $this;

			//calculate the scrollTop value to get the section title at the bottom of the header
			//performance improvements possible here as .position() is costly
			oInfo.realTop = $this.position().top; //first get the dom position = scrollTop to get the section at the window top

			//the amount of scrolling required is the distance between their position().top and the bottom of the anchorBar
			oInfo.positionTop = Math.ceil(oInfo.realTop) - this.iAnchorBarHeight - iHeaderGap;

			//the amount of scrolling required for the mobile scenario
			//we want to navigate just below its title
			//as of UX specs Oct 7, 2014
			if (oInfo.isSection) {
				$mobileAnchor = oSectionBase.$("header");
			} else {
				$mobileAnchor = oSectionBase.$("headerTitle");
			}

			//calculate the mobile position
			if ($mobileAnchor.length > 0) {
				oInfo.positionTopMobile = Math.ceil($mobileAnchor.position().top) + $mobileAnchor.outerHeight() - this.iAnchorBarHeight - iHeaderGap;
			} else {
				//title wasn't found (=first section, hidden title, promoted subsection), scroll to the same position as desktop
				oInfo.positionTopMobile = oInfo.positionTop;
			}

			//for calculating the currently scrolled section of subsection (and for lazy loading) we also need to know the bottom of the section and subsections
			//we can't use oInfo.$dom.height() since the margin are not taken into account.
			//therefore the most reliable calculation is to consider as a bottom, the top of the next section/subsection
			//on mobile, each section and subsection is considered equally (a section is a very tiny subsection containing only a title)
			if (this._bMobileScenario) {
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
						this._oSectionInfo[sPreviousSubSectionId].positionBottom = oInfo.positionTop;
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

		}, this);

		//calculate the bottom spacer height and update the last section/subSection bottom (with our algorithm of having section tops based on the next section, we need to have a special handling for the very last subSection)
		if (oLastVisibleSubSection) {
			iLastVisibleHeight = this._$spacer.position().top - this._oSectionInfo[oLastVisibleSubSection.getId()].realTop;

			//on desktop we need to set the bottom of the last section as well
			if (this._bMobileScenario) {
				this._oSectionInfo[sPreviousSectionId].positionBottom = this._oSectionInfo[sPreviousSectionId].positionTop + iLastVisibleHeight;
			} else { //update the position bottom for the last subsection
				this._oSectionInfo[sPreviousSubSectionId].positionBottom = this._oSectionInfo[sPreviousSubSectionId].positionTop + iLastVisibleHeight;
				this._oSectionInfo[sPreviousSectionId].positionBottom = this._oSectionInfo[sPreviousSubSectionId].positionTop + iLastVisibleHeight;
			}

			//calculate the required additional space for the last section only
			if (iLastVisibleHeight < this.iScreenHeight) {

				//the amount of space required is what is needed to get the latest position you can scroll to up to the "top"
				//therefore we need to create enough space below the last subsection to get it displayed on top = the spacer
				//the "top" is just below the sticky header + anchorBar, therefore we just need enough space to get the last subsection below these elements

				//the latest position is below the last subsection title in case of a mobile scroll to the last subsection
				if (this.iHeaderContentHeight || this._bHContentAlwaysExpanded) {
					// Not always when we scroll the HeaderTitle is in Sticky position so instead of taking out its StickyHeight we have to take out its height and the HeaderGap,
					// which will be zero when the HeaderTitle is in normal mode
					iSpacerHeight = this.iScreenHeight - iLastVisibleHeight - this.iHeaderTitleHeight - iHeaderGap - this.iAnchorBarHeight;
				} else {
					iSpacerHeight = this.iScreenHeight - iLastVisibleHeight - this.iAnchorBarHeight;
				}

				//take into account that we may need to scroll down to the positionMobile, thus we need to make sure we have enough space at the bottom
				if (this._bMobileScenario) {
					iSpacerHeight += (this._oSectionInfo[oLastVisibleSubSection.getId()].positionTopMobile - this._oSectionInfo[oLastVisibleSubSection.getId()].positionTop);
				}

				this._$spacer.height(iSpacerHeight + "px");
				jQuery.sap.log.debug("ObjectPageLayout :: bottom spacer is now " + iSpacerHeight + "px");
			}
		}

	};

	/**
	 * init the internal section info {positionTop}
	 * @private
	 */
	ObjectPageLayout.prototype._initAnchorBarScroll = function () {

		this._adjustLayout(null, true);

		//reset the scroll to top for anchorbar & scrolling management
		this._sScrolledSectionId = "";
		this._onScroll({target: {scrollTop: 0}});//make sure we got the very last scroll event even on slow devices
	};

	/**
	 * Set a given section as the currently scrolled section and update the anchorBar relatively
	 * @param sSectionId the section id
	 * @private
	 */
	ObjectPageLayout.prototype._setAsCurrentSection = function (sSectionId) {
		var oAnchorBar, oSectionBase, bShouldDisplayParentTitle;

		if (this._sScrolledSectionId === sSectionId) {
			return;
		}

		jQuery.sap.log.debug("ObjectPageLayout :: current section is " + sSectionId);
		this._sScrolledSectionId = sSectionId;

		oAnchorBar = this.getAggregation("_anchorBar");

		if (oAnchorBar && this._getInternalAnchorBarVisible()) {
			oSectionBase = sap.ui.getCore().byId(sSectionId);

			bShouldDisplayParentTitle = oSectionBase && oSectionBase instanceof ObjectPageSubSection &&
				(oSectionBase.getTitle().trim() === "" || !oSectionBase._getInternalTitleVisible() || oSectionBase.getParent()._getIsHidden());

			//the sectionBase title needs to be visible (or the user won't "feel" scrolling that sectionBase but its parent)
			//see Incident 1570016975 for more details
			if (bShouldDisplayParentTitle) {
				sSectionId = oSectionBase.getParent().getId();

				jQuery.sap.log.debug("ObjectPageLayout :: current section is a subSection with an empty or hidden title, selecting parent " + sSectionId);
			}

			if (this._oSectionInfo[sSectionId]) {
				oAnchorBar.setSelectedButton(this._oSectionInfo[sSectionId].buttonId);
				this._setSectionsFocusValues(sSectionId);
			}
		}
	};

	/**
	 * called when the screen is resize by users. Updates the screen height
	 * @param oEvent
	 * @private
	 */
	ObjectPageLayout.prototype._onUpdateScreenSize = function (oEvent) {

		if (!this._bDomReady) {
			jQuery.sap.log.info("ObjectPageLayout :: cannot _onUpdateScreenSize before dom is ready");
			return;
		}

		this._oLazyLoading.setLazyLoadingParameters();

		jQuery.sap.delayedCall(ObjectPageLayout.HEADER_CALC_DELAY, this, function () {
			this._bMobileScenario = library.Utilities.isPhoneScenario();
			this._bTabletScenario = library.Utilities.isTabletScenario();

			if (this._bHContentAlwaysExpanded != this._checkAlwaysShowContentHeader()) {
				this.invalidate();
			}

			this._adjustHeaderHeights();

			this._adjustLayout(null, true);

			this._oScroller.scrollTo(0, this._$opWrapper.scrollTop(), 0);
		});

	};

	/**
	 * called when the user scrolls on the page
	 * @param oEvent
	 * @private
	 */

	ObjectPageLayout.prototype._onScroll = function (oEvent) {
		var iScrollTop = Math.max(oEvent.target.scrollTop, 0), // top of the visible page
			iPageHeight,
			oHeader = this.getHeaderTitle(),
			bShouldStick = iScrollTop >= (this.iHeaderContentHeight - (this.iHeaderTitleHeightStickied - this.iHeaderTitleHeight)), // iHeaderContentHeight minus the gap between the two headerTitle
			sClosestId;

		//calculate the limit of visible sections to be lazy loaded
		iPageHeight = this.iScreenHeight;
		if (bShouldStick && !this._bHContentAlwaysExpanded) {
			iPageHeight -= (this.iAnchorBarHeight + this.iHeaderTitleHeightStickied);
		} else {
			if (bShouldStick && this._bHContentAlwaysExpanded) {
				iPageHeight = iPageHeight - (this._$stickyAnchorBar.height() + this.iHeaderTitleHeight + this.iStickyHeaderContentHeight); // - this.iStickyHeaderContentHeight
			}
		}

		//don't apply parallax effects if there are not enough space for it
		if (!this._bHContentAlwaysExpanded && ((oHeader && this.getShowHeaderContent()) || this.getShowAnchorBar())) {
			this._toggleHeader(bShouldStick);

			//if we happen to have been able to collapse it at some point (section height had increased)
			//and we no longer are (section height is reduced) and we are at the top of the page we expand it back anyway
		} else if (iScrollTop == 0 && ((oHeader && this.getShowHeaderContent()) || this.getShowAnchorBar())) {
			this._toggleHeader(false);
		}

		if (!this._bHContentAlwaysExpanded) {
			this._adjustHeaderTitleBackgroundPosition(iScrollTop);
		}

		jQuery.sap.log.debug("ObjectPageLayout :: lazy loading : Scrolling at " + iScrollTop, "----------------------------------------");

		//find the currently scrolled section = where position - iScrollTop is closest to 0
		sClosestId = this._getClosestScrolledSectionId(iScrollTop, iPageHeight);

		if (sClosestId) {

			// check if scroll destination is set in advance
			// (this is when a particular section is requested from the anchorBar sectionsList and we are now scrolling to reach it)
			var sDestinationSectionId = this.getDirectScrollingToSection();

			if (sClosestId !== this._sScrolledSectionId) {
				jQuery.sap.log.debug("ObjectPageLayout :: closest id " + sClosestId, "----------------------------------------");

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
		}

		//lazy load only the visible subSections
		if (this.getEnableLazyLoading()) {
			//calculate the progress done between this scroll event and the previous one
			//to see if we are scrolling fast (more than 5% of the page height)
			this._oLazyLoading.lazyLoadDuringScroll(iScrollTop, oEvent.timeStamp, iPageHeight);
		}

		if (oHeader && this.getShowHeaderContent() && this.getShowTitleInHeaderContent() && oHeader.getShowTitleSelector()) {
			if (iScrollTop === 0) {
				// if we have arrow from the title inside the ContentHeader and the ContentHeader isn't scrolled we have to put higher z-index to the ContentHeader
				// otherwise part of the arrow is cut off
				jQuery.sap.byId(this.getId() + "-scroll").css("z-index", "1000");
			} else {
				// and we have to "reset" the z-index it when we start scrolling
				jQuery.sap.byId(this.getId() + "-scroll").css("z-index", "0");
			}
		}
	};

	ObjectPageLayout.prototype._getClosestScrolledSectionId = function (iScrollTop, iPageHeight) {
		var iScrollPageBottom = iScrollTop + iPageHeight,                 //the bottom limit
			iExpandedHeights = this.iStickyHeaderContentHeight + this.iHeaderTitleHeight + this.iAnchorBarHeight + this._$contentContainer.height() - this.iScreenHeight,
			iMin = this._bHContentAlwaysExpanded ? iExpandedHeights : this._$contentContainer.height() - this.iScreenHeight, // scroll limit
			sClosestId;

		// find the closest section
		jQuery.each(this._oSectionInfo, jQuery.proxy(function (sId, oInfo) {
			// on desktop/tablet, find a section, not a subsection
			if (oInfo.isSection || this._bMobileScenario) {

				//we need to set the sClosest to the first section for handling the scrollTop = 0
				if (!sClosestId) {
					sClosestId = sId;
				}

				//find closest
				// 1D segment intersection
				if (oInfo.positionTop <= iScrollPageBottom && iScrollTop <= oInfo.positionBottom) {
					// find the closest section: the sections that intersect the visible page and that ends the closest to iScrollTop
					if (oInfo.positionBottom - iScrollTop < iMin) {
						sClosestId = sId;
						iMin = oInfo.positionBottom - iScrollTop;
					}
				}
			}

		}, this));

		return sClosestId;
	};


	/**
	 * toggles the header state
	 * @param bStick boolean true for fixing the header, false for keeping it moving
	 * @private
	 */
	ObjectPageLayout.prototype._toggleHeader = function (bStick) {
		var oHeaderTitle = this.getHeaderTitle();

		//switch to stickied
		if (!this._bHContentAlwaysExpanded) {
			this._$headerTitle.toggleClass("sapUxAPObjectPageHeaderStickied", bStick);
		}

		// if the title in the header is not always visible but the action buttons are there we have to adjust header height and remove the padding of the action buttons
		if (oHeaderTitle && oHeaderTitle.getIsActionAreaAlwaysVisible() && !oHeaderTitle.getIsObjectTitleAlwaysVisible()) {
			oHeaderTitle._setActionsPaddingStatus(!bStick);
		}

		if (!this._bStickyAnchorBar && bStick) {
			this._restoreFocusAfter(this._convertHeaderToStickied);
			oHeaderTitle && oHeaderTitle._adaptLayout();
			this._adjustHeaderHeights();
		} else if (this._bStickyAnchorBar && !bStick) {
			this._restoreFocusAfter(this._convertHeaderToExpanded);
			oHeaderTitle && oHeaderTitle._adaptLayout();
			this._adjustHeaderHeights();
		}
	};

	/**
	 * Restores the focus after moving the Navigation bar after moving it between containers
	 * @private
	 * @param fnMoveNavBar a function that moves the navigation bar
	 * @returns this
	 */
	ObjectPageLayout.prototype._restoreFocusAfter = function (fnMoveNavBar) {
		var oCore = sap.ui.getCore(),
			oLastSelectedElement = oCore.byId(oCore.getCurrentFocusedControlId());

		fnMoveNavBar.call(this);
		if (Device.system.phone !== true) { // FIX - can not convert to expanded on windows phone
			if (!oCore.byId(oCore.getCurrentFocusedControlId())) {
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
	ObjectPageLayout.prototype._convertHeaderToStickied = function () {
		if (!this._bHContentAlwaysExpanded) {
			this._$anchorBar.css("height", this.iAnchorBarHeight).children().appendTo(this._$stickyAnchorBar);

			this._toggleHeaderStyleRules(true);

			//Internal Incident: 1472003895: FIT W7 MI: Dual color in the header
			//we need to adjust the header background now in case its size is different
			if (this.iHeaderTitleHeight != this.iHeaderTitleHeightStickied) {
				this._adjustHeaderBackgroundSize();
			}
		}

		return this;
	};

	/**
	 * Converts the Header to expanded (moving) mode
	 * @private
	 * @returns this
	 */
	ObjectPageLayout.prototype._convertHeaderToExpanded = function () {
		if (!this._bHContentAlwaysExpanded) {
			this._$anchorBar.css("height", "auto").append(this._$stickyAnchorBar.children());

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
		this._$headerContent.css("visibility", sValue);
		this._$anchorBar.css("visibility", sValue);
		this.fireToggleAnchorBar({fixed: bStuck});
	};

	/**
	 * Returns the sap.ui.core.ScrollEnablement delegate which is used with this control.
	 */
	ObjectPageLayout.prototype.getScrollDelegate = function () {
		return this._oScroller;
	};


	/************************************************************************************************************
	 * Header specific methods
	 ***********************************************************************************************************/

	ObjectPageLayout.prototype.setHeaderTitle = function (oHeaderTitle, bSuppressInvalidate) {

		oHeaderTitle.addEventDelegate({
			onAfterRendering: this._adjustHeaderHeights.bind(this)
		});

		return this.setAggregation("headerTitle", oHeaderTitle, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype._adjustHeaderBackgroundSize = function () {
		// Update the background image size and position
		var oHeaderTitle = this.getHeaderTitle();
		if (oHeaderTitle && oHeaderTitle.getHeaderDesign() == "Dark") {

			if (!this._bHContentAlwaysExpanded) {
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
				if (this._bHContentAlwaysExpanded) {
					// If the header is always expanded, there is no neeed to scroll the background so we setting it to 0 position
					oHeaderTitle.$().css("background-position", "0px 0px");
				} else {
					oHeaderTitle.$().css("background-position", "0px " + (this.iHeaderTitleHeight + this.iHeaderContentHeight - this.iTotalHeaderSize - iScrollTop) + "px");
				}
			}
		}
	};

	ObjectPageLayout.prototype._adjustHeaderHeights = function () {
		//checking the $headerTitle we prevent from checking the headerHeights multiple times during the first rendering
		//$headerTitle is set in the objectPageLayout.onAfterRendering, thus before the objectPageLayout is fully rendered once, we don't enter here multiple times (performance tweak)
		if (this._$headerTitle.length > 0) {
			var $headerTitleClone = this._$headerTitle.clone();

			//read the headerContentHeight ---------------------------
			this.iHeaderContentHeight = this._$headerContent.height();

			//read the sticky headerContentHeight ---------------------------
			this.iStickyHeaderContentHeight = this._$stickyHeaderContent.height();

			//figure out the anchorBarHeight  ------------------------
			this.iAnchorBarHeight = this._$anchorBar.height();

			//prepare: make sure it won't be visible ever and fix width to the original headerTitle which is 100%
			$headerTitleClone.css({left: "-10000px", top: "-10000px", width: this._$headerTitle.width() + "px"});

			//in sticky mode, we need to calculate the size of original header
			if (this._bStickyAnchorBar) {

				//read the headerTitleStickied ---------------------------
				this.iHeaderTitleHeightStickied = this._$headerTitle.height() - this.iAnchorBarHeight;

				//adjust the headerTitle  -------------------------------
				$headerTitleClone.removeClass("sapUxAPObjectPageHeaderStickied");
				$headerTitleClone.appendTo(this._$headerTitle.parent());

				this.iHeaderTitleHeight = $headerTitleClone.is(":visible") ? $headerTitleClone.height() - this.iAnchorBarHeight : 0;
			} else { //otherwise it's the sticky that we need to calculate

				//read the headerTitle -----------------------------------
				this.iHeaderTitleHeight = this._$headerTitle.is(":visible") ? this._$headerTitle.height() : 0;

				//adjust headerTitleStickied ----------------------------
				$headerTitleClone.addClass("sapUxAPObjectPageHeaderStickied");
				$headerTitleClone.appendTo(this._$headerTitle.parent());

				this.iHeaderTitleHeightStickied = $headerTitleClone.height();
			}

			//clean dom
			$headerTitleClone.remove();

			//adjust dom element directly depending on the adjusted height
			// Adjust wrapper top position
			this._$opWrapper.css("padding-top", this.iHeaderTitleHeight);
			this._adjustHeaderBackgroundSize();

			jQuery.sap.log.info("ObjectPageLayout :: adjustHeaderHeight", "headerTitleHeight: " + this.iHeaderTitleHeight + " - headerTitleStickiedHeight: " + this.iHeaderTitleHeightStickied + " - headerContentHeight: " + this.iHeaderContentHeight);
		} else {
			jQuery.sap.log.debug("ObjectPageLayout :: adjustHeaderHeight", "skipped as the objectPageLayout is being rendered");
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
			sTabIndex = "tabIndex",
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

	/**
	 * get current visibility of the HeaderContent and if it is different from the new one rererender it
	 */
	ObjectPageLayout.prototype.setShowHeaderContent = function (bShow) {
		var bOldShow = this.getShowHeaderContent();

		if (bOldShow !== bShow) {
			this.setProperty("showHeaderContent", bShow);
			this._getHeaderContent().setProperty("visible", bShow);
		}
		return this;
	};

	/**
	 * Calls the renderer function that will rerender the ContentHeader when something is changed in the ObjectPageHeader Title
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._headerTitleChangeHandler = function () {

		if (!this.getShowTitleInHeaderContent() || this._bFirstRendering) {
			return;
		}

		var oRm = sap.ui.getCore().createRenderManager();
		this.getRenderer()._rerenderHeaderContentArea(oRm, this);
		oRm.destroy();
	};

	/**
	 * Maintain ObjectPageHeaderContent aggregation
	 *
	 */
	ObjectPageLayout.prototype.getHeaderContent = function () {
		return this._getHeaderContent().getAggregation("content");
	};

	ObjectPageLayout.prototype.insertHeaderContent = function (oObject, iIndex, bSuppressInvalidate) {
		return this._getHeaderContent().insertAggregation("content", oObject, iIndex, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.addHeaderContent = function (oObject, bSuppressInvalidate) {
		return this._getHeaderContent().addAggregation("content", oObject, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.removeAllHeaderContent = function (bSuppressInvalidate) {
		return this._getHeaderContent().removeAllAggregation("content", bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.removeHeaderContent = function (oObject, bSuppressInvalidate) {
		return this._getHeaderContent().removeAggregation("content", oObject, bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.destroyHeaderContent = function (bSuppressInvalidate) {
		return this._getHeaderContent().destroyAggregation("content", bSuppressInvalidate);
	};

	ObjectPageLayout.prototype.indexOfHeaderContent = function (oObject) {
		return this._getHeaderContent().indexOfAggregation("content", oObject);
	};

	/**
	 * Lazy loading of the _headerContent aggregation
	 *
	 * @private
	 */
	ObjectPageLayout.prototype._getHeaderContent = function () {

		if (!this.getAggregation("_headerContent")) {
			this.setAggregation("_headerContent", new library.ObjectPageHeaderContent({
				visible: this.getShowHeaderContent(),
				contentDesign: this._getHeaderDesign(),
				content: this.getAggregation("headerContent")
			}), true);
		}

		return this.getAggregation("_headerContent");
	};

	ObjectPageLayout.prototype._checkAlwaysShowContentHeader = function () {
		return !this._bMobileScenario
			&& !this._bTabletScenario
			&& this.getShowHeaderContent()
			&& this.getAlwaysShowContentHeader();
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

	ObjectPageLayout.HEADER_CALC_DELAY = 350;   //ms. The higher the safer and the uglier...
	ObjectPageLayout.DOM_CALC_DELAY = 200;      //ms.

	// Get the helper to create all sections aggregation functions on the ObjectPageLayout prototype
	ITBHelper._enrichPrototypeWithITBMutators(ObjectPageLayout);

	return ObjectPageLayout;

});
