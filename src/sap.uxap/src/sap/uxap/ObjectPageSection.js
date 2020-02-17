/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSection.
sap.ui.define([
    "sap/ui/core/InvisibleText",
    "./ObjectPageSectionBase",
    "sap/ui/Device",
    "sap/m/Button",
    "sap/ui/core/StashedControlSupport",
    "./ObjectPageSubSection",
    "./library",
    "sap/m/library",
    "./ObjectPageSectionRenderer"
], function(
    InvisibleText,
	ObjectPageSectionBase,
	Device,
	Button,
	StashedControlSupport,
	ObjectPageSubSection,
	library,
	mobileLibrary,
	ObjectPageSectionRenderer
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	 * Constructor for a new <code>ObjectPageSection</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Top-level information container of an {@link sap.uxap.ObjectPageLayout}.
	 *
	 * The <code>ObjectPageSection</code>'s purpose is to aggregate subsections.
	 *
	 * <b>Note:</b> This control is intended to be used only as part of the <code>ObjectPageLayout</code>.
	 *
	 * @extends sap.uxap.ObjectPageSectionBase
	 *
	 * @constructor
	 * @public
	 * @alias sap.uxap.ObjectPageSection
	 * @since 1.26
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ObjectPageSection = ObjectPageSectionBase.extend("sap.uxap.ObjectPageSection", /** @lends sap.uxap.ObjectPageSection.prototype */ {
		metadata: {

			library: "sap.uxap",
			properties: {

				/**
				 * Determines whether to display the Section title or not.
				 */
				showTitle: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				 * Determines whether the Section title is displayed in upper case.
				 */
				titleUppercase: {type: "boolean", group: "Appearance", defaultValue: true}
			},
			defaultAggregation: "subSections",
			aggregations: {

				/**
				 * The list of Subsections.
				 */
				subSections: {type: "sap.uxap.ObjectPageSubSection", multiple: true, singularName: "subSection"},

				/**
				 * Screen Reader ariaLabelledBy
				 */
				ariaLabelledBy: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"},
				_showHideAllButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"},
				_showHideButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			associations: {

				/**
				 * The most recently selected Subsection by the user.
				 */
				selectedSubSection: {type: "sap.uxap.ObjectPageSubSection", multiple: false}
			},
			designtime: "sap/uxap/designtime/ObjectPageSection.designtime"
		}
	});

	ObjectPageSection.MEDIA_RANGE = Device.media.RANGESETS.SAP_STANDARD;

	/**
	 * Returns the closest ObjectPageSection
	 * @param  {sap.uxap.ObjectPageSectionBase} oSectionBase
	 * @returns {sap.uxap.ObjectPageSection}
	 * @private
	 */
	ObjectPageSection._getClosestSection = function (vSectionBase) {
		var oSectionBase = (typeof vSectionBase === "string" && sap.ui.getCore().byId(vSectionBase)) || vSectionBase;
		return (oSectionBase instanceof ObjectPageSubSection) ? oSectionBase.getParent() : oSectionBase;
	};

	/**
	 * Retrieves the resource bundle for the <code>sap.uxap</code> library.
	 * @static
	 * @private
	 * @returns {Object} the resource bundle object
	 */
	ObjectPageSection._getLibraryResourceBundle = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.uxap");
	};

	ObjectPageSection.prototype._expandSection = function () {
		ObjectPageSectionBase.prototype._expandSection.call(this)
			._updateShowHideAllButton(!this._thereAreHiddenSubSections());
	};

	ObjectPageSection.prototype.init = function () {
		ObjectPageSectionBase.prototype.init.call(this);
		this._sContainerSelector = ".sapUxAPObjectPageSectionContainer";
	};

	ObjectPageSection.prototype.exit = function () {
		this._detachMediaContainerWidthChange(this._updateImportance, this);
	};

	ObjectPageSection.prototype.setTitle = function (sValue) {
		ObjectPageSectionBase.prototype.setTitle.call(this, sValue);

		var oAriaLabelledBy = this.getAggregation("ariaLabelledBy"),
			sSectionText = ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME");

		if (oAriaLabelledBy) {
			sap.ui.getCore().byId(oAriaLabelledBy.getId()).setText(sValue + " " + sSectionText);
		}
		return this;
	};

	ObjectPageSection.prototype._getImportanceLevelToHide = function (oCurrentMedia) {
		var oObjectPage = this._getObjectPageLayout(),
			oMedia = oCurrentMedia || this._getCurrentMediaContainerRange(),
			bShowOnlyHighImportance = oObjectPage && oObjectPage.getShowOnlyHighImportance();

		return this._determineTheLowestLevelOfImportanceToShow(oMedia.name, bShowOnlyHighImportance);
	};

	ObjectPageSection.prototype._updateImportance = function (oCurrentMedia) {
		var oObjectPage = this._getObjectPageLayout(),
			sImportanceLevelToHide = this._getImportanceLevelToHide(oCurrentMedia);

		this.getSubSections().forEach(function (oSubSection) {
			oSubSection._applyImportanceRules(sImportanceLevelToHide);
		});

		this._applyImportanceRules(sImportanceLevelToHide);
		this._updateShowHideAllButton(false);

		if (oObjectPage && this.getDomRef()) {
			oObjectPage._requestAdjustLayout();
		}
	};

	ObjectPageSection.prototype._determineTheLowestLevelOfImportanceToShow = function (sMedia, bShowOnlyHighImportance) {
		if (bShowOnlyHighImportance || sMedia === "Phone") {
			return library.Importance.High;
		}
		if (sMedia === "Tablet") {
			return library.Importance.Medium;
		}

		return library.Importance.Low;
	};

	ObjectPageSection.prototype.connectToModels = function () {
		this.getSubSections().forEach(function (oSubSection) {
			oSubSection.connectToModels();
		});
	};

	ObjectPageSection.prototype._allowPropagationToLoadedViews = function (bAllow) {
		this.getSubSections().forEach(function (oSubSection) {
			oSubSection._allowPropagationToLoadedViews(bAllow);
		});
	};

	ObjectPageSection.prototype.onBeforeRendering = function () {
		var sAriaLabeledBy = "ariaLabelledBy";

		if (!this.getAggregation(sAriaLabeledBy)) {
			this.setAggregation(sAriaLabeledBy, this._getAriaLabelledBy(), true); // this is called onBeforeRendering, so suppress invalidate
		}

		this._detachMediaContainerWidthChange(this._updateImportance, this);

		this._updateImportance();
	};

	ObjectPageSection.prototype.onAfterRendering = function () {
		this._attachMediaContainerWidthChange(this._updateImportance, this);
	};

	/**
	 * provide a default aria-labeled by text
	 * @private
	 * @returns {*} sap.ui.core.InvisibleText
	 */
	ObjectPageSection.prototype._getAriaLabelledBy = function () {
		// Each section should be labelled as:
		// 'titleName Section' - if the section has a title
		// 'Section' - if it does not have a title

		var sLabel = "",
			sTitle = this._getTitle();

		if (sTitle) {
			sLabel += sTitle + " ";
		}

		sLabel += ObjectPageSection._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME");

		return new InvisibleText({
			text: sLabel
		}).toStatic();
	};

	/**
	 * Determines if the <code>ObjectPageSection</code> title is visible.
	 * @private
	 * @returns {Boolean}
	 */
	ObjectPageSection.prototype._isTitleVisible = function () {
		return this.getShowTitle() && this._getInternalTitleVisible();
	};

	/**
	 * set subsections focus rules
	 * @private
	 * @returns {*} this
	 */
	ObjectPageSection.prototype._setSubSectionsFocusValues = function () {
		var aSubSections = this.getSubSections() || [],
			sLastSelectedSubSectionId = this.getSelectedSubSection(),
			bPreselectedSection;

		if (aSubSections.length === 0) {
			return this;
		}

		if (aSubSections.length === 1) {
			aSubSections[0]._setToFocusable(false);
			return this;
		}

		aSubSections.forEach(function (oSubsection) {
			if (sLastSelectedSubSectionId === oSubsection.sId) {
				oSubsection._setToFocusable(true);
				bPreselectedSection = true;
			} else {
				oSubsection._setToFocusable(false);
			}
		});

		if (!bPreselectedSection) {
			aSubSections[0]._setToFocusable(true);
		}

		return this;
	};

	ObjectPageSection.prototype._disableSubSectionsFocus = function () {
		var aSubSections = this.getSubSections() || [];

		aSubSections.forEach(function (oSubsection) {
			oSubsection._setToFocusable(false);
		});

		return this;
	};

	ObjectPageSection.prototype._thereAreHiddenSubSections = function () {
		return this.getSubSections().some(function (oSubSection) {
			return oSubSection._getIsHidden();
		});
	};

	ObjectPageSection.prototype._updateShowHideSubSections = function (bHide) {
		this.getSubSections().forEach(function (oSubSection) {
			if (bHide && oSubSection._shouldBeHidden()) {
				oSubSection._updateShowHideState(true);
			} else if (!bHide) {
				oSubSection._updateShowHideState(false);
			}
		});
	};

	ObjectPageSection.prototype._getShouldDisplayShowHideAllButton = function () {
		return this.getSubSections().some(function (oSubSection) {
			return oSubSection._shouldBeHidden();
		});
	};

	ObjectPageSection.prototype._showHideContentAllContent = function () {
		var bShouldShowSubSections = this._thereAreHiddenSubSections();

		if (this._getIsHidden() && bShouldShowSubSections) {
			this._updateShowHideState(false);
		}

		this._updateShowHideSubSections(!bShouldShowSubSections);
		this._updateShowHideAllButton(bShouldShowSubSections);
	};

	ObjectPageSection.prototype._updateShowHideState = function (bHide) {
		if (this._getIsHidden() === bHide) {
			return this;
		}

		this._updateShowHideButton(bHide);
		this._getShowHideAllButton().setVisible(this._getShouldDisplayShowHideAllButton());

		return ObjectPageSectionBase.prototype._updateShowHideState.call(this, bHide);
	};

	ObjectPageSection.prototype._updateShowHideAllButton = function (bHide) {
		this._getShowHideAllButton()
			.setVisible(this._getShouldDisplayShowHideAllButton())
			.setText(this._getShowHideAllButtonText(bHide));
	};

	ObjectPageSection.prototype._getShowHideAllButton = function () {
		if (!this.getAggregation("_showHideAllButton")) {
			this.setAggregation("_showHideAllButton", new Button({
				visible: this._getShouldDisplayShowHideAllButton(),
				text: this._getShowHideAllButtonText(!this._thereAreHiddenSubSections()),
				press: this._showHideContentAllContent.bind(this),
				type: ButtonType.Transparent
			}).addStyleClass("sapUxAPSectionShowHideButton"), true); // this is called from the renderer, so suppress invalidate
		}

		return this.getAggregation("_showHideAllButton");
	};

	ObjectPageSection.prototype._getShowHideButtonText = function (bHide) {
		return ObjectPageSection._getLibraryResourceBundle().getText(bHide ? "HIDE" : "SHOW");
	};

	ObjectPageSection.prototype._getShowHideAllButtonText = function (bHide) {
		return ObjectPageSection._getLibraryResourceBundle().getText(bHide ? "HIDE_ALL" : "SHOW_ALL");
	};

	ObjectPageSection.prototype._updateShowHideButton = function (bHide) {
		this._getShowHideButton()
			.setVisible(this._shouldBeHidden())
			.setText(this._getShowHideButtonText(!bHide));
	};

	ObjectPageSection.prototype._getShowHideButton = function () {
		if (!this.getAggregation("_showHideButton")) {
			this.setAggregation("_showHideButton", new Button({
				visible: this._shouldBeHidden(),
				text: this._getShowHideButtonText(!this._getIsHidden()),
				press: this._showHideContent.bind(this),
				type: ButtonType.Transparent
			}).addStyleClass("sapUxAPSectionShowHideButton"), true); // this is called from the renderer, so suppress invalidate
		}

		return this.getAggregation("_showHideButton");
	};

	StashedControlSupport.mixInto(ObjectPageSection);

	return ObjectPageSection;
});
