/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSectionBase.
sap.ui.define(["jquery.sap.global", "sap/ui/core/Control", "sap/ui/core/TitleLevel", "./library"], function (jQuery, Control, TitleLevel, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageSectionBase.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * An abstract container for object page sections and subSections
	 * @extends sap.ui.core.Control
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageSectionBase
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageSectionBase = Control.extend("sap.uxap.ObjectPageSectionBase", /** @lends sap.uxap.ObjectPageSectionBase.prototype */ {
		metadata: {

			"abstract": true,
			library: "sap.uxap",
			properties: {

				/**
				 * Section Title
				 */
				title: {type: "string", group: "Appearance", defaultValue: null},

				/**
				 * Determines the ARIA level of the <code>ObjectPageSectionBase</code> title.
				 * The ARIA level is used by assisting technologies, such as screen readers, to create a hierarchical site map for faster navigation.
				 *
				 * <br><b>Note:</b> Defining a <code>titleLevel</code> will add <code>aria-level</code> attribute from 1 to 6,
				 * instead of changing the <code>ObjectPageSectionBase</code> title HTML tag from H1 to H6.
				 * <br>For example: if <code>titleLevel</code> is <code>TitleLevel.H1</code>,
				 * it will result as aria-level of 1 added to the <code>ObjectPageSectionBase</code> title.
				 * @since 1.44.0
				 */
				titleLevel : {type : "sap.ui.core.TitleLevel", group : "Appearance", defaultValue : sap.ui.core.TitleLevel.Auto},

				/**
				 * Invisible ObjectPageSectionBase are not rendered
				 */
				visible: {type: "boolean", group: "Appearance", defaultValue: true},

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
				customAnchorBarButton: {type: "sap.m.Button", multiple: false}
			}
		}
	});

	/**
	 * Explicitly ask to connect to the UI5 model tree
	 *
	 * @name sap.uxap.ObjectPageSectionBase#connectToModels
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	ObjectPageSectionBase.prototype.init = function () {

		//handled for ux rules management
		this._bInternalVisible = true;
		this._bInternalTitleVisible = true;
		this._sInternalTitle = "";
		this._sInternalTitleLevel = TitleLevel.Auto;
		//hidden status
		this._isHidden = false;

		this._oParentObjectPageLayout = undefined; //store the parent objectPageLayout

		this._bRtl = sap.ui.getCore().getConfiguration().getRTL();
	};

	ObjectPageSectionBase.prototype.onAfterRendering = function () {
		if (this._getObjectPageLayout()) {
			this._getObjectPageLayout()._requestAdjustLayout().catch(function () {
				jQuery.sap.log.debug("ObjectPageSectionBase :: cannot adjustLayout", this);
			});
			this._getObjectPageLayout()._setSectionsFocusValues();
		}
	};

	ObjectPageSectionBase.prototype.setCustomAnchorBarButton = function (oButton) {
		var vResult = this.setAggregation("customAnchorBarButton", oButton, true);

		if (this._getObjectPageLayout()){
			this._getObjectPageLayout()._updateNavigation();
		}

		return vResult;
	};

	/**
	 * set the internal visibility of the sectionBase. This is set by the ux rules (for example don't display a section that has no subSections)
	 * @param bValue
	 * @param bInvalidate if set to true, the sectionBase should be rerendered in order to be added or removed to the dom (similar to what a "real" internalVisibility property would trigger
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
	 * set the internal visibility of the sectionBase title. This is set by the ux rules (for example don't display a subSection title if there are only 1 in the section)
	 * @param bValue
	 * @param bInvalidate if set to true, the sectionBase should be rerendered in order to be added or removed to the dom (similar to what a "real" internalVisibility property would trigger
	 * @private
	 */
	ObjectPageSectionBase.prototype._setInternalTitleVisible = function (bValue, bInvalidate) {
		if (bValue != this._bInternalTitleVisible) {
			this._bInternalTitleVisible = bValue;
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageSectionBase.prototype._getInternalTitleVisible = function () {
		return this._bInternalTitleVisible;
	};

	/**
	 * set the internal title of the sectionBase. This is set by the ux rules (for example the subSection title becomes the section title if there are only 1 subSection in the section)
	 * @param sValue
	 * @param bInvalidate if set to true, the sectionBase should be rerendered in order to be added or removed to the dom (similar to what a "real" internalVisibility property would trigger
	 * @private
	 */

	ObjectPageSectionBase.prototype._setInternalTitle = function (sValue, bInvalidate) {
		if (sValue != this._sInternalTitle) {
			this._sInternalTitle = sValue;
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageSectionBase.prototype._getInternalTitle = function () {
		return this._sInternalTitle;
	};

	/**
	 * Returns the <code>aria-level</code>, matching to the <code>ObjectPageSectionBase</code> <code>titleLevel</code> or internal <code>titleLevel</code>.
	 * If the <code>titleLevel</code> is <code>TitleLevel.H1</code>, the result would be "1".
	 * If the <code>titleLevel</code> is <code>TitleLevel.Auto</code>,
	 * the result would be "3" for <code>ObjectPageSection</code> and "4" for <code>ObjectPageSubSection</code>.
	 * The method is used by <code>ObjectPageSectionRenderer</code> and <code>ObjectPageSubSectionRenderer</code>.
	 * @returns {String} the <code>aria-level</code>
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._getARIALevel = function () {
		return this._getTitleLevel().slice(-1);
	};

	/**
	 * Returns the <code>ObjectPageSectionBase</code> <code>titleLevel</code>
	 * if explicitly defined and different from <code>sap.ui.core.TitleLevel.Auto</code>.
	 * Otherwise, the <code>ObjectPageSectionBase</code> internal <code>titleLevel</code> is returned.
	 * @returns {String}
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
	 * @param {String} sTitleLevel
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._setInternalTitleLevel = function (sTitleLevel) {
		this._sInternalTitleLevel = sTitleLevel;
	};

	/**
	 * Returns the <code>ObjectPageSectionBase</code> internal <code>titleLevel</code>.
	 * The internal <code>titleLevel</code> is set by the <code>ObjectPageLayout</code>.
	 * @returns {String}
	 * @since 1.44
	 * @private
	 */
	ObjectPageSectionBase.prototype._getInternalTitleLevel = function () {
		return this._sInternalTitleLevel;
	};

	/**
	 * getter for the parent object page layout
	 * @returns {*}
	 * @private
	 */
	ObjectPageSectionBase.prototype._getObjectPageLayout = function () {
		if (!this._oParentObjectPageLayout) {
			this._oParentObjectPageLayout = library.Utilities.getClosestOPL(this);
		}

		return this._oParentObjectPageLayout;
	};

	/**
	 * Notify the parent objectPageLayout of structural changes after the first rendering
	 * @private
	 */
	ObjectPageSectionBase.prototype._notifyObjectPageLayout = function () {
		if (this._getObjectPageLayout() && this._getObjectPageLayout().$().length){
			this._getObjectPageLayout()._adjustLayoutAndUxRules();
		}
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
		if (!this._getObjectPageLayout()) {
			return this.setProperty("visible", bValue, bSuppressInvalidate);
		}

		this.setProperty("visible", bValue, true);
		/* handle invalidation ourselves in adjustLayoutAndUxRules */
		this._getObjectPageLayout()._adjustLayoutAndUxRules();
		this.invalidate();
		return this;
	};

	ObjectPageSectionBase.prototype.setTitle = function (sValue, bSuppressInvalidate) {

		this.setProperty("title", sValue, bSuppressInvalidate);
		this._notifyObjectPageLayout();

		return this;
	};

	ObjectPageSectionBase.prototype._shouldBeHidden = function () {
		return ObjectPageSectionBase._importanceMap[this.getImportance()] >
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
		this.$().children(this._sContainerSelector).toggle(!bHide);
		if (oObjectPage) {
			oObjectPage._requestAdjustLayout();
		}
		return this;
	};

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
	 * @params oSection, sCurrentLowestImportanceLevelToShow
	 *
	 * @private
	 */
	ObjectPageSectionBase.prototype._applyImportanceRules = function (sCurrentLowestImportanceLevelToShow) {
		this._sCurrentLowestImportanceLevelToShow = sCurrentLowestImportanceLevelToShow;

		if (this.getDomRef()) {
			this._updateShowHideState(this._shouldBeHidden());
		} else {
			this._isHidden = this._shouldBeHidden();
		}
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
		// Filter F7 key down
		if (oEvent.keyCode === jQuery.sap.KeyCodes.F7) {
			var aSubSections = this.getSubSections(),
				oFirstSubSection = aSubSections[0],
				oLastFocusedEl;

			if (aSubSections.length === 1) {
				oLastFocusedEl = oFirstSubSection._oLastFocusedControlF7;
				if (oLastFocusedEl) {
					oLastFocusedEl.$().focus();
				} else {
					oFirstSubSection.$().firstFocusableDomRef().focus();
				}
			} else {
				if (oFirstSubSection.getActions().length) {
					oFirstSubSection.getActions()[0].$().focus();
				}
			}
		}
	};

	/**
	 * Handler for arrow down
	 * @param oEvent - The event object
	 */
	ObjectPageSectionBase.prototype.onsapdown = function (oEvent) {
		this._handleFocusing(oEvent, oEvent.currentTarget.nextSibling);
	};

	ObjectPageSectionBase.prototype._handleFocusing = function (oEvent, oElementToReceiveFocus) {
		if (this._targetIsCorrect(oEvent) && oElementToReceiveFocus) {
			oEvent.preventDefault();
			oElementToReceiveFocus.focus();
			this._scrollParent(jQuery(oElementToReceiveFocus).attr("id"));
		}
	};

	ObjectPageSectionBase.prototype._targetIsCorrect = function (oEvent) {
		return oEvent.srcControl === this;
	};

	/**
	 * Handler for arrow right
	 */
	ObjectPageSectionBase.prototype.onsapright = function (oEvent) {
		var sMethodName = this._bRtl ? "onsapup" : "onsapdown";
		this[sMethodName](oEvent);
	};

	/**
	 * Handler for arrow up
	 * @param oEvent - The event object
	 */
	ObjectPageSectionBase.prototype.onsapup = function (oEvent) {
		this._handleFocusing(oEvent, oEvent.currentTarget.previousSibling);
	};

	/**
	 * Handler for arrow left
	 */
	ObjectPageSectionBase.prototype.onsapleft = function (oEvent) {
		var sMethodName = this._bRtl ? "onsapdown" : "onsapup";
		this[sMethodName](oEvent);
	};

	/**
	 * Handler for HOME key
	 * @param oEvent - The event object
	 */
	ObjectPageSectionBase.prototype.onsaphome = function (oEvent) {
		this._handleFocusing(oEvent, oEvent.currentTarget.parentElement.firstChild);
	};

	/**
	 * Handler for END key
	 * @param oEvent - The event object
	 */
	ObjectPageSectionBase.prototype.onsapend = function (oEvent) {
		this._handleFocusing(oEvent, oEvent.currentTarget.parentElement.lastChild);
	};

	/**
	 * Handler for PAGE UP event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectPageSectionBase.prototype.onsappageup = function (oEvent) {
		if (!this._targetIsCorrect(oEvent)) {
			return;
		}

		oEvent.preventDefault();

		var iNextIndex;
		var aSections = jQuery(oEvent.currentTarget).parent().children();
		var focusedSectionId;

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

		this._scrollParent(focusedSectionId);
	};

	/**
	 * Handler for PAGE DOWN event.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	ObjectPageSectionBase.prototype.onsappagedown = function (oEvent) {
		if (!this._targetIsCorrect(oEvent)) {
			return;
		}

		oEvent.preventDefault();

		var iNextIndex;
		var aSections = jQuery(oEvent.currentTarget).parent().children();
		var focusedSectionId;

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

		this._scrollParent(focusedSectionId);
	};

	/**
	 * Tells the ObjectPageLayout instance to scroll itself to a given section (by Id)
	 * @param sId
	 * @private
	 */
	ObjectPageSectionBase.prototype._scrollParent = function (sId) {
		if (this._getObjectPageLayout()) {
			this._getObjectPageLayout().scrollToSection(sId, 0, 10);
		}
	};

	return ObjectPageSectionBase;

});
