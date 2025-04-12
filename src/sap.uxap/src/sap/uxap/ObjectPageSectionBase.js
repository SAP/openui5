/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSectionBase.
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Control",
	"sap/ui/core/library",
	"sap/ui/core/Lib",
	"./library",
	"sap/m/library",
	"sap/base/Log",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/Grid",
	"sap/ui/layout/GridData",
	"sap/m/Button",
	// jQuery Plugin "firstFocusableDomRef"
	"sap/ui/dom/jquery/Focusable"
], function(Localization, jQuery, Control, coreLibrary, Library, library, mobileLibrary, Log, KeyCodes, Grid, GridData, Button) {
	"use strict";

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	var ButtonType = mobileLibrary.ButtonType;

	/**
	 * Constructor for a new <code>ObjectPageSectionBase</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * An abstract container for sections and subsections in the {@link sap.uxap.ObjectPageLayout}.
	 * @extends sap.ui.core.Control
	 * @abstract
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageSectionBase
	 * @since 1.26
	 */
	var ObjectPageSectionBase = Control.extend("sap.uxap.ObjectPageSectionBase", /** @lends sap.uxap.ObjectPageSectionBase.prototype */ {
		metadata: {

			"abstract": true,
			library: "sap.uxap",
			properties: {

				/**
				 * Defines the title of the respective section/subsection.
				 *
				 * <b>Note:</b> If a subsection is the only one (or the only one visible) within a section, its title is
				 * displayed instead of the section title. This behavior is true even if the <code>showTitle</code>
				 * propeprty of {@link sap.uxap.ObjectPageSubSection} is set to <code>false</code>.
				 */
				title: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Determines the ARIA level of the <code>ObjectPageSectionBase</code> title.
				 * The ARIA level is used by assisting technologies, such as screen readers, to create a hierarchical site map for faster navigation.
				 *
				 * <b>Note:</b> Defining a <code>titleLevel</code> will add <code>aria-level</code> attribute from 1 to 6,
				 * instead of changing the <code>ObjectPageSectionBase</code> title HTML tag from H1 to H6.
				 * <br>For example: if <code>titleLevel</code> is <code>TitleLevel.H1</code>,
				 * it will result as aria-level of 1 added to the <code>ObjectPageSectionBase</code> title.
				 * @since 1.44.0
				 */
				titleLevel : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : TitleLevel.Auto},

				/**
				 * Invisible ObjectPageSectionBase are not rendered
				 */
				visible: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Defines the actual visibility of the title of <code>ObjectPageSectionBase</code>.
				 *
				 * <b>Note:</b> This property is read-only. The <code>ObjectPageSectionBase</code> updates it, according to internal rules, based on UX specifications.
				 * You can only read the value of <code>titleVisible</code> property and use it in your binding to determine the aria-levels of the inner Controls.
				 *
				 * @since 1.121.0
				 * @protected
				 */
				titleVisible: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Determines whether the section will be hidden on low resolutions.
				 * @since 1.32.0
				 */
				importance: {
					type: "sap.uxap.Importance",
					group: "Behavior",
					defaultValue: library.Importance.High
				}
			},
			aggregations: {
				/**
				 * The custom button that will provide a link to the section in the ObjectPageLayout anchor bar.
				 * This button will be used as a custom template to be into the ObjectPageLayout anchorBar area, therefore property changes happening on this button template after the first rendering won't affect the actual button copy used in the anchorBar.
				 *
				 * If you want to change some of the button properties, you would need to bind them to a model.
				 */
				customAnchorBarButton: {type: "sap.m.Button", multiple: false},

				/**
				 * Internal grid aggregation
				 */
				_grid: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

				_showHideButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			}
		},
		renderer: null // control has no renderer (it is an abstract class)
	});

	ObjectPageSectionBase._getLibraryResourceBundle = function() {
		return Library.getResourceBundleFor("sap.uxap");
	};

	/**
	 * Explicitly ask to connect to the UI5 model tree
	 *
	 * @name sap.uxap.ObjectPageSectionBase#connectToModels
	 * @function
	 * @type void
	 * @public
	 */

	ObjectPageSectionBase.prototype.init = function () {

		//handled for ux rules management
		this._bInternalVisible = true;
		this._sInternalTitleLevel = TitleLevel.Auto;
		//hidden status
		this._isHidden = false;
		this._oGridContentObserver = null;
		this._sTitleStyle = "";

		this._bRtl = Localization.getRTL();
	};

	ObjectPageSectionBase.prototype.onBeforeRendering = function () {
		var oTitle = this._getTitleControl();

		if (oTitle) {
			oTitle.setProperty("visible", this._isTitleVisible(), true);
			oTitle.setProperty("level", this.getEffectiveTitleLevel(), true);
			oTitle.setProperty("wrapping", this._getWrapTitle(), true);
			oTitle.setProperty("titleStyle", this._getTitleStyle(), true);
			oTitle.toggleStyleClass(this._getTitleUpperCaseStyleClass(), this.getTitleUppercase());
		}

		this._getObjectPageLayout()?._setSectionInfoIsDirty(true);
	};

	ObjectPageSectionBase.prototype.onAfterRendering = function () {
		if (this._getObjectPageLayout()) {
			this._getObjectPageLayout()._requestAdjustLayout().catch(function () {
				Log.debug("ObjectPageSectionBase :: cannot adjustLayout", this);
			});
			this._getObjectPageLayout()._setSectionsFocusValues();
		}
	};

	ObjectPageSectionBase.prototype.exit = function () {
		if (this._oInvisibleText) {
			this._oInvisibleText.destroy();
			this._oInvisibleText = null;
		}
	};

	ObjectPageSectionBase.prototype._getTitleUpperCaseStyleClass = function () {
		return ""; // will be overwritten in child controls
	};

	ObjectPageSectionBase.prototype._getWrapTitle = function () {
		return false; // will be overwritten in child controls
	};

	ObjectPageSectionBase.prototype.setShowTitle = function (bShow) {
		this.setProperty("showTitle", bShow);

		this.setTitleVisible();

		return this;
	};

	/**
	 * Returns the effectively applied title level. Could be different than "titleLevel" property, according to internal UX rules.
	 * @protected
	 * @returns {string} the effective title level
	 */
	ObjectPageSectionBase.prototype.getEffectiveTitleLevel = function () {
		return this._getTitleLevel();
	};

	/**
	 * Sets title visibility
	 * @protected
	 */
	ObjectPageSectionBase.prototype.setTitleVisible = function () {
		return this.setProperty("titleVisible", this._isTitleVisible(), true);
	};

	ObjectPageSectionBase.prototype._isTitleVisible = function () {
		return true; // will be overwritten in child controls
	};

	ObjectPageSectionBase.prototype._isTitleAriaVisible = function () {
		return this.getShowTitle() || this._shouldDisplayButtonsInHeader();
	};

	ObjectPageSectionBase.prototype._shouldDisplayButtonsInHeader = function () {
		return this._getShouldDisplayExpandCollapseButton();
	};

	ObjectPageSectionBase.prototype._getShouldDisplayExpandCollapseButton = function () {
		return this._getIsHidden();
	};

	ObjectPageSectionBase.prototype._getTitleStyle = function () {
		return this._sTitleStyle;
	};

	ObjectPageSectionBase.prototype._getGrid = function () {
		if (!this.getAggregation("_grid") && !this._bIsBeingDestroyed) {
			this.setAggregation("_grid", new Grid({
				id: this.getId() + "-innerGrid",
				defaultSpan: "XL12 L12 M12 S12",
				hSpacing: 1,
				vSpacing: 1,
				width: "100%",
				containerQuery: true
			}), true); // this is always called onBeforeRendering so suppress invalidate

			if (this._oGridContentObserver) {
				this._oGridContentObserver.observe(this.getAggregation("_grid"), {
					aggregations: [
					 // both aggregation names are required
					 // because the first ("content") is the actual
					 // and the second ("subSections") is the publicly visible
					 // due to aggregation forwarding
					"content", "subSections"
				]});
			}
		}

		return this.getAggregation("_grid");
	};

	ObjectPageSectionBase.prototype._getTitleControl = function () {
		return null; // will be overwritten in child controls
	};

	/**
	 * Remove any existing layout data of grid-items
	 * prior to running built-in mechanism to calculate the column layout of these items
	 * @param aGridItems
	 * @private
	 */
	ObjectPageSectionBase.prototype._resetLayoutData = function (aGridItems) {
		aGridItems.forEach(function (oItem) {
			// There might be cases when the content of the SubSection is not yet unstashed (created) and it is still the ObjectPageLazyLoader
			if (oItem?.getLayoutData?.()) {
				oItem.destroyLayoutData();
			}
		}, this);
	};

	/**
	 * Calculate the layout data to use for grid items
	 * Aligned with PUX specifications as of Oct 14, 2014
	 * @private
	 */
	ObjectPageSectionBase.prototype._assignLayoutData = function (aGridItems, oColumnConfig) {
		var iGridSize = 12,
			aVisibleItems = [],
			aInvisibleItems = [],
			M, L, XL,
			aDisplaySizes;

		M = {
			iRemaining: oColumnConfig.M,
			iColumnConfig: oColumnConfig.M
		};

		L = {
			iRemaining: oColumnConfig.L,
			iColumnConfig: oColumnConfig.L
		};

		XL = {
			iRemaining: oColumnConfig.XL,
			iColumnConfig: oColumnConfig.XL
		};

		aDisplaySizes = [XL, L, M];

		//step 1: the visible blocks should be separated
		// as only they should take space inside the grid
		aGridItems.forEach(function(oItem) {
			// Skip if there is undefined
			if (!oItem) {
				return;
			}

			// Check if it's ObjectPageLazyLoader
			if (oItem.getVisible?.()) {
				aVisibleItems.push(oItem);
			} else {
				aInvisibleItems.push(oItem);
			}
		});

		//step 2: set layout for each blocks based on their columnLayout configuration
		//As of Oct 14, 2014, the default behavior is:
		//on phone, blocks take always the full line
		//on tablet, desktop:
		//1 block on the line: takes 3/3 columns
		//2 blocks on the line: takes 1/3 columns then 2/3 columns
		//3 blocks on the line: takes 1/3 columns then 1/3 columns and last 1/3 columns

		aVisibleItems.forEach(function (oItem, iIndex) {

			aDisplaySizes.forEach(function (oConfig) {
				oConfig.iCalculatedSize = this._getEffectiveColspanForGridItem(oItem, oConfig.iRemaining,
					aVisibleItems, iIndex, oConfig.iColumnConfig);
			}, this);

			//set block layout based on resolution and break to a new line if necessary
			oItem.setLayoutData(new GridData({
				spanS: iGridSize,
				spanM: M.iCalculatedSize * (iGridSize / M.iColumnConfig),
				spanL: L.iCalculatedSize * (iGridSize / L.iColumnConfig),
				spanXL: XL.iCalculatedSize * (iGridSize / XL.iColumnConfig),
				linebreakM: (iIndex > 0 && M.iRemaining === M.iColumnConfig),
				linebreakL: (iIndex > 0 && L.iRemaining === L.iColumnConfig),
				linebreakXL: (iIndex > 0 && XL.iRemaining === XL.iColumnConfig)
			}));

			if (oItem.isA("sap.uxap.ObjectPageSubSection")) {
				oItem._oLayoutConfig = {
					M: M.iCalculatedSize,
					L: L.iCalculatedSize,
					XL: XL.iCalculatedSize
				};
			}

			aDisplaySizes.forEach(function (oConfig) {
				oConfig.iRemaining -= oConfig.iCalculatedSize;
				if (oConfig.iRemaining < 1) {
					oConfig.iRemaining = oConfig.iColumnConfig;
				}
			});

		}, this);

		aInvisibleItems.forEach(function(oItem) {
			// ensure invisible blocks do not take space at all. Don't setLayoutData if it's ObjectPageLazyLoader
			oItem.setLayoutData?.(new GridData({
				visibleS: false,
				visibleM: false,
				visibleL: false,
				visibleXL: false
			}));
		});

		return aVisibleItems;
	};

	/**
	 * Obtains the optimal number of columns a grid item should span accross,
	 * given the available columns count and the content of the item.
	 *
	 * The obtained value is the same or bigger than the minimal required colspan
	 * for a grid item. It will be bigger if extra unused columns remained on the side
	 * and the child is allowed to extend to span accross that extra unused space.
	 *
	 * @param {*} oGridItem , the grid-item
	 * @param {*} iFreeColumnsCount , the current unused columns count
	 * @param {*} aGridItems , all grid items
	 * @param {*} iCurrentIndex , the index of the item among its sibling items
	 * @param {*} iTotalColumnsCount , the total available column count in the current device size
	 * @return {number} the count of columns the item should span accross
	 * @private
	 */
	ObjectPageSectionBase.prototype._getEffectiveColspanForGridItem = function (oGridItem, iFreeColumnsCount, aGridItems, iCurrentIndex, iTotalColumnsCount) {
		var iNextItemColspan,
			iForewordItemsToCheck = iTotalColumnsCount,
			indexOffset,
			iMinColspan = this._getMinRequiredColspanForChild(oGridItem);

		if (!this._allowAutoextendColspanForChild(oGridItem)) {
			return Math.min(iTotalColumnsCount, iMinColspan);
		}

		for (indexOffset = 1; indexOffset <= iForewordItemsToCheck; indexOffset++) {
			iNextItemColspan = this._getMinRequiredColspanForChild(aGridItems[iCurrentIndex + indexOffset]);
			if (iNextItemColspan <= (iFreeColumnsCount - iMinColspan)) {
				iFreeColumnsCount -= iNextItemColspan;
			} else {
				break;
			}
		}

		return iFreeColumnsCount;
	};

	/**
	 * To override in subclasses:
	 * Determines the minimal required number of columns that a child item
	 * should take, based on the child content and own colspan
	 * @param {object} oChild
	 * @return {number}
	 */
	ObjectPageSectionBase.prototype._getMinRequiredColspanForChild = function (oChild) {};

	/**
	 * To override in subclasses
	 * Determines if allowed to automatically extend the number of columns to span accross
	 * (in case of unused columns on the side, in order to utilize that unused space
	 * @param {object} oChild
	 * @return {boolean}
	 */
	ObjectPageSectionBase.prototype._allowAutoextendColspanForChild = function (oChild) {};

	ObjectPageSectionBase.prototype.setCustomAnchorBarButton = function (oButton) {
		var vResult = this.setAggregation("customAnchorBarButton", oButton, true);

		if (this._getObjectPageLayout()){
			this._getObjectPageLayout()._updateNavigation();
		}

		return vResult;
	};

	/**
	 * set the internal visibility of the sectionBase. This is set by the ux rules (for example don't display a section that has no subSections)
	 * @param {boolean} bValue
	 * @param {boolean} bInvalidate if set to true, the sectionBase should be rerendered in order to be added or removed to the dom (similar to what a "real" internalVisibility property would trigger
	 * @private
	 */
	ObjectPageSectionBase.prototype._setInternalVisible = function (bValue, bInvalidate) {
		if (bValue != this._bInternalVisible) {
			this._bInternalVisible = bValue;
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageSectionBase.prototype._getInternalVisible = function () {
		return this._bInternalVisible;
	};

	/**
	 * Returns the <code>ObjectPageSectionBase</code> <code>titleLevel</code>
	 * if explicitly defined and different from <code>sap.ui.core.TitleLevel.Auto</code>.
	 * Otherwise, the <code>ObjectPageSectionBase</code> internal <code>titleLevel</code> is returned.
	 * @returns {string}
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._getTitleLevel = function () {
		var sTitleLevel = this.getTitleLevel();
		return (sTitleLevel === TitleLevel.Auto) ? this._getInternalTitleLevel() : sTitleLevel;
	};

	/**
	 * Sets the <code>ObjectPageSectionBase</code> internal <code>titleLevel</code>.
	 * The method is used by the <code>ObjectPageLayout</code> to apply the <code>sectionTitleLevel</code> property.
	 * @param {string} sTitleLevel
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._setInternalTitleLevel = function (sTitleLevel, bInvalidate) {
		if (sTitleLevel !== this._sInternalTitleLevel) {
			this._sInternalTitleLevel = sTitleLevel;
			this._getTitleControl().setLevel(sTitleLevel);
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	/**
	 * Returns the <code>ObjectPageSectionBase</code> internal <code>titleLevel</code>.
	 * The internal <code>titleLevel</code> is set by the <code>ObjectPageLayout</code>.
	 * @returns {string}
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._getInternalTitleLevel = function () {
		return this._sInternalTitleLevel;
	};

	ObjectPageSectionBase.prototype._getImportance = function () {
		return this.getImportance();
	};

	/**
	 * getter for the parent object page layout
	 * @returns {*}
	 * @private
	 */
	ObjectPageSectionBase.prototype._getObjectPageLayout = function () {
		return library.Utilities.getClosestOPL(this);
	};

	/**
	 * Notify the parent objectPageLayout of structural changes after the first rendering
	 * @private
	 */
	ObjectPageSectionBase.prototype._notifyObjectPageLayout = function () {
		if (this._getObjectPageLayout() && this._getObjectPageLayout().$().length){
			this._getObjectPageLayout()._requestAdjustLayoutAndUxRules();
		}
	};

	/**
	 * Returns the <code>aria-level</code>, matching to the <code>ObjectPageSectionBase</code> <code>titleLevel</code> or internal <code>titleLevel</code>.
	 * If the <code>titleLevel</code> is <code>TitleLevel.H1</code>, the result would be "1".
	 * If the <code>titleLevel</code> is <code>TitleLevel.Auto</code>,
	 * the result would be "3" for <code>ObjectPageSection</code> and "4" for <code>ObjectPageSubSection</code>.
	 * The method is used by <code>ObjectPageSectionRenderer</code>.
	 *
	 * If there is a case where a TitleLevel.Auto is returned from _getTitleLevel in order to prevent a wrong
	 * value to be se to the aria-level attribute title level fallbacks to TitleLevel.H2 as this is the default
	 * aria-level according to aria specification
	 *
	 * @returns {string} the <code>aria-level</code>
	 * @private
	 */
	ObjectPageSectionBase.prototype._getARIALevel = function () {
		var sTitleLevel = this._getTitleLevel();

		if (sTitleLevel === TitleLevel.Auto) {
			sTitleLevel = TitleLevel.H2;
		}

		return sTitleLevel.slice(-1);
	};

	// Generate proxies for aggregation mutators
	["addAggregation", "insertAggregation", "removeAllAggregation", "removeAggregation", "destroyAggregation"].forEach(function (sMethod) {
		ObjectPageSectionBase.prototype[sMethod] = function (sAggregationName, oObject, iIndex, bSuppressInvalidate) {

			if (["addAggregation", "removeAggregation"].indexOf(sMethod) > -1) {
				bSuppressInvalidate = iIndex; //shift argument
			}
			if (["removeAllAggregation", "destroyAggregation"].indexOf(sMethod) > -1) {
				bSuppressInvalidate = oObject; //shift argument
			}
			var vResult = Control.prototype[sMethod].apply(this, arguments);

			if (bSuppressInvalidate !== true){
				this._notifyObjectPageLayout();
			}
			return vResult;
		};
	});

	ObjectPageSectionBase.prototype.setVisible = function (bValue, bSuppressInvalidate) {
		if (this.getVisible() === bValue) {
			return this;
		}

		if (!this._getObjectPageLayout()) {
			return this.setProperty("visible", bValue, bSuppressInvalidate);
		}

		this.setProperty("visible", bValue, true);
		/* handle invalidation ourselves in adjustLayoutAndUxRules */
		this._notifyObjectPageLayout();

		this.invalidate();
		return this;
	};

	ObjectPageSectionBase.prototype.setTitle = function (sValue, bSuppressInvalidate) {

		this.setProperty("title", sValue, bSuppressInvalidate);
		this._notifyObjectPageLayout();
		this._getTitleControl().setText(sValue);
		this.setTitleVisible();

		return this;
	};

	ObjectPageSectionBase.prototype.setTitleLevel = function (sTitleLevel) {
		this.setProperty("titleLevel", sTitleLevel);
		this._getTitleControl().setLevel(sTitleLevel);

		return this;
	};

	ObjectPageSectionBase.prototype._shouldBeHidden = function () {
		return ObjectPageSectionBase._importanceMap[this._getImportance()] >
			ObjectPageSectionBase._importanceMap[this._sCurrentLowestImportanceLevelToShow];
	};

	ObjectPageSectionBase._importanceMap = {
		"Low": 3,
		"Medium": 2,
		"High": 1
	};

	ObjectPageSectionBase.prototype._updateShowHideState = function (bHide) {
		var oObjectPage = this._getObjectPageLayout();
		this._isHidden = bHide;
		this.setTitleVisible();
		this.$().children(this._sContainerSelector).toggle(!bHide);
		this._updateShowHideButton(bHide);
		if (oObjectPage) {
			oObjectPage._requestAdjustLayout();
		}
		return this;
	};

	/**
	 * Determines if the <code>ObjectPageSection</code> content is visible.
	 *
	 * The content is not visible if the <code>ObjectPageSection</code> is
	 * given a lower <code>importance</code> than allowed to be rendered
	 * for the current screen size.
	 *
	 * @private
	 * @returns {boolean}
	 */
	ObjectPageSectionBase.prototype._getIsHidden = function () {
		return this._isHidden;
	};

	ObjectPageSectionBase.prototype._expandSection = function () {
		return this._updateShowHideState(false);
	};

	ObjectPageSectionBase.prototype._showHideContent = function () {
		return this._updateShowHideState(!this._getIsHidden());
	};

	/**
	 * Called to set the visibility of the section / subsection
	 * @param {string} sCurrentLowestImportanceLevelToShow
	 *
	 * @private
	 */
	ObjectPageSectionBase.prototype._applyImportanceRules = function (sCurrentLowestImportanceLevelToShow) {
		var bImportanceLevelChange = this._sCurrentLowestImportanceLevelToShow !== sCurrentLowestImportanceLevelToShow,
			bShouldBeHidden;

		this._sCurrentLowestImportanceLevelToShow = sCurrentLowestImportanceLevelToShow;
		this.setTitleVisible();

		bShouldBeHidden = bImportanceLevelChange ? this._shouldBeHidden() : this._getIsHidden();
		if (this.getDomRef()) {
			this._updateShowHideState(bShouldBeHidden);
		} else {
			this._isHidden = bShouldBeHidden;
			this.setTitleVisible();
		}
	};

	ObjectPageSectionBase.prototype._updateShowHideButton = function (bHide) {
		this._getShowHideButton()
			.setVisible(this._shouldBeHidden())
			.setText(this._getShowHideButtonText(!bHide));
	};

	ObjectPageSectionBase.prototype._getShowHideButton = function () {
		if (!this.getAggregation("_showHideButton")) {
			this.setAggregation("_showHideButton", new Button({
				visible: this._shouldBeHidden(),
				text: this._getShowHideButtonText(!this._getIsHidden()),
				press: this._showHideContent.bind(this),
				type: ButtonType.Transparent
			}).addStyleClass("sapUxAPShowHideButton"), true); // this is called from the renderer, so suppress invalidate
		}

		return this.getAggregation("_showHideButton");
	};

	ObjectPageSectionBase.prototype._getShowHideButtonText = function (bHide) {
		// TODO: replace other similar functions with this one
		return ObjectPageSectionBase._getLibraryResourceBundle().getText(bHide ? "HIDE" : "SHOW");
	};

	ObjectPageSectionBase.prototype._getImportanceLevelToHide = function (oCurrentMedia) {
		var oObjectPage = this._getObjectPageLayout(),
			oMedia = oCurrentMedia || this._getCurrentMediaContainerRange(),
			bShowOnlyHighImportance = oObjectPage && oObjectPage.getShowOnlyHighImportance();

		return this._determineTheLowestLevelOfImportanceToShow(oMedia.name, bShowOnlyHighImportance);
	};

	ObjectPageSectionBase.prototype._determineTheLowestLevelOfImportanceToShow = function (sMedia, bShowOnlyHighImportance) {
		if (bShowOnlyHighImportance || sMedia === "Phone") {
			return library.Importance.High;
		}
		if (sMedia === "Tablet") {
			return library.Importance.Medium;
		}

		return library.Importance.Low;
	};

	/*******************************************************************************
	 * Keyboard navigation
	 ******************************************************************************/

	ObjectPageSectionBase.PAGEUP_AND_PAGEDOWN_JUMP_SIZE = 5;

	/**
	 * Handler for key down - handle
	 * @param oEvent - The event object
	 */

	ObjectPageSectionBase.prototype.onkeydown = function (oEvent) {
		// Prevent browser scrolling in case of SPACE key
		if (oEvent.keyCode === KeyCodes.SPACE && oEvent.srcControl.isA("sap.uxap.ObjectPageSection")) {
			oEvent.preventDefault();
		}

		// Filter F7 key down
		if (oEvent.keyCode === KeyCodes.F7) {
			var aSubSections = this.getSubSections(),
				oFirstSubSection = aSubSections[0],
				oLastFocusedEl;

			if (aSubSections.length === 1) {
				oLastFocusedEl = oFirstSubSection._oLastFocusedControlF7;
				if (oLastFocusedEl) {
					oLastFocusedEl.$().trigger("focus");
				} else {
					oFirstSubSection.$().firstFocusableDomRef().focus();
				}
			} else {
				if (oFirstSubSection.getActions().length) {
					oFirstSubSection.getActions()[0].$().trigger("focus");
				}
			}
		}
	};

	/**
	 * Handler for arrow down
	 * @param {jQuery.Event} oEvent The AROW-DOWN keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsapdown = function (oEvent) {
		var oTarget = oEvent.currentTarget,
			oNextSibling = oTarget.nextSibling;

		if (oTarget.classList.contains('sapUxAPObjectPageSubSection')) {
			// each subsection is wrapped in a div, so we need the subsection inside the sibling wrapper
			var oParent = oTarget.parentElement;
			if (oParent.nextElementSibling) {
				oNextSibling = oParent.nextElementSibling.querySelector(".sapUxAPObjectPageSubSection");
			}
		}
		this._handleFocusing(oEvent, oNextSibling);
	};

	ObjectPageSectionBase.prototype._handleFocusing = function (oEvent, oElementToReceiveFocus) {
		var aSections;

		if (this._targetIsCorrect(oEvent) && oElementToReceiveFocus) {
			aSections = jQuery(oEvent.currentTarget).parent().children();
			oEvent.preventDefault();
			oElementToReceiveFocus.focus();
			if (aSections.length > 1) {
				this._scrollParent(jQuery(oElementToReceiveFocus).attr("id"));
			}
		}
	};

	ObjectPageSectionBase.prototype._targetIsCorrect = function (oEvent) {
		return oEvent.srcControl === this;
	};

	/**
	 * Handler for arrow right
	 * @param {jQuery.Event} oEvent The AROW-RIGHT keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsapright = function (oEvent) {
		var sMethodName = this._bRtl ? "onsapup" : "onsapdown";
		this[sMethodName](oEvent);
	};

	/**
	 * Handler for arrow up
	 * @param {jQuery.Event} oEvent The AROW-UP keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsapup = function (oEvent) {
		var oTarget = oEvent.currentTarget,
			oPreviousSibling = oTarget.previousSibling;

		if (oTarget.classList.contains('sapUxAPObjectPageSubSection')) {
			// each subsection is wrapped in a div, so we need the subsection inside the sibling wrapper
			var oParent = oTarget.parentElement;
			if (oParent.previousElementSibling) {
				oPreviousSibling = oParent.previousElementSibling.querySelector(".sapUxAPObjectPageSubSection");
			}
		}
		this._handleFocusing(oEvent, oPreviousSibling);
	};

	/**
	 * Handler for arrow left
	 * @param {jQuery.Event} oEvent The ARROW-LEFT keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsapleft = function (oEvent) {
		var sMethodName = this._bRtl ? "onsapdown" : "onsapup";
		this[sMethodName](oEvent);
	};

	/**
	 * Handler for HOME key
	 * @param {jQuery.Event} oEvent The HOME keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsaphome = function (oEvent) {
		var oTarget = oEvent.currentTarget,
			oFirstChild = oTarget.parentElement.firstChild;
		if (oTarget.classList.contains('sapUxAPObjectPageSubSection')) {
			// each subsection is wrapped in a div, so we need the subsection inside the first wrapper
			oFirstChild = oTarget.closest(".sapUxAPObjectPageSection").querySelector(".sapUxAPObjectPageSubSection");
		}
		this._handleFocusing(oEvent, oFirstChild);
	};

	/**
	 * Handler for END key
	 * @param {jQuery.Event} oEvent The END keyboard key event object
	 */
	ObjectPageSectionBase.prototype.onsapend = function (oEvent) {
		var oTarget = oEvent.currentTarget,
			oLastChild = oTarget.parentElement.lastChild,
			aChildren;
		if (oTarget.classList.contains('sapUxAPObjectPageSubSection')) {
			// each subsection is wrapped in a div, so we need the subsection inside the last wrapper
			aChildren = oTarget.closest(".sapUxAPObjectPageSection").querySelectorAll(".sapUxAPObjectPageSubSection");
			oLastChild = aChildren[aChildren.length - 1];
		}
		this._handleFocusing(oEvent, oLastChild);
	};

	/**
	 * Handler for PAGE UP event.
	 * @param {jQuery.Event} oEvent The PAGE-UP keyboard key event object
	 * @private
	 */
	ObjectPageSectionBase.prototype.onsappageup = function (oEvent) {
		if (!this._targetIsCorrect(oEvent)) {
			return;
		}

		oEvent.preventDefault();

		var iNextIndex, oTarget = oEvent.currentTarget;
		var aSections = jQuery(oTarget).parent().children();
		var focusedSectionId;

		if (oTarget.classList.contains("sapUxAPObjectPageSubSection")) {
			aSections = jQuery(oTarget.closest(".sapUxAPObjectPageSection")).find(".sapUxAPObjectPageSubSection");
		}

		aSections.each(function (iSectionIndex, oSection) {
			if (jQuery(oSection).attr("id") === oEvent.currentTarget.id) {
				iNextIndex = iSectionIndex - (ObjectPageSectionBase.PAGEUP_AND_PAGEDOWN_JUMP_SIZE + 1);
				return;
			}
		});

		if (iNextIndex && aSections[iNextIndex]) {
			aSections[iNextIndex].focus();
			focusedSectionId = jQuery(aSections[iNextIndex]).attr("id");
		} else if (aSections[0]) {
			aSections[0].focus();
			focusedSectionId = jQuery(aSections[0]).attr("id");
		}

		if (aSections.length > 1) {
			this._scrollParent(focusedSectionId);
		}
	};

	/**
	 * Handler for PAGE DOWN event.
	 *
	 * @param {jQuery.Event} oEvent The PAGE-DOWN keyboard key event object
	 * @private
	 */
	ObjectPageSectionBase.prototype.onsappagedown = function (oEvent) {
		if (!this._targetIsCorrect(oEvent)) {
			return;
		}

		oEvent.preventDefault();

		var iNextIndex, oTarget = oEvent.currentTarget;
		var aSections = jQuery(oTarget).parent().children();
		var focusedSectionId;

		if (oTarget.classList.contains("sapUxAPObjectPageSubSection")) {
			aSections = jQuery(oTarget.closest(".sapUxAPObjectPageSection")).find(".sapUxAPObjectPageSubSection");
		}

		aSections.each(function (iSectionIndex, oSection) {
			if (jQuery(oSection).attr("id") === oEvent.currentTarget.id) {
				iNextIndex = iSectionIndex + ObjectPageSectionBase.PAGEUP_AND_PAGEDOWN_JUMP_SIZE + 1;
				return;
			}
		});

		if (iNextIndex && aSections[iNextIndex]) {
			aSections[iNextIndex].focus();
			focusedSectionId = jQuery(aSections[iNextIndex]).attr("id");
		} else if (aSections[aSections.length - 1]) {
			aSections[aSections.length - 1].focus();
			focusedSectionId = jQuery(aSections[aSections.length - 1]).attr("id");
		}

		if (aSections.length > 1) {
			this._scrollParent(focusedSectionId);
		}
	};

	/**
	 * Tells the ObjectPageLayout instance to scroll itself to a given section (by Id)
	 * @param {string} sId
	 * @private
	 */
	ObjectPageSectionBase.prototype._scrollParent = function (sId) {
		if (this._getObjectPageLayout()) {
			this._getObjectPageLayout().scrollToSection(sId, 0, 10);
		}
	};

	return ObjectPageSectionBase;

});