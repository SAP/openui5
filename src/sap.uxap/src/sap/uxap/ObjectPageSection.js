/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSection.
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/InvisibleText",
	"./ObjectPageSectionBase",
	"sap/ui/Device",
	"sap/m/Button",
	"./library"
], function (jQuery, InvisibleText, ObjectPageSectionBase, Device, Button, library) {
	"use strict";

	/**
	 * Constructor for a new ObjectPageSection.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * An ObjectPageSection is the top-level information container of an Object page. Its purpose is to aggregate Subsections.
	 * Disclaimer: This control is intended to be used only as part of the Object page layout
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
			}
		}
	});

	ObjectPageSection.MEDIA_RANGE = Device.media.RANGESETS.SAP_STANDARD;

	ObjectPageSection.prototype._expandSection = function () {
		ObjectPageSectionBase.prototype._expandSection.call(this)
			._updateShowHideAllButton(!this._thereAreHiddenSubSections());
	};

	ObjectPageSection.prototype.init = function () {
		ObjectPageSectionBase.prototype.init.call(this);
		this._sContainerSelector = ".sapUxAPObjectPageSectionContainer";
		Device.media.attachHandler(this._updateImportance, this, ObjectPageSection.MEDIA_RANGE);
	};

	ObjectPageSection.prototype.exit = function () {
		Device.media.detachHandler(this._updateImportance, this, ObjectPageSection.MEDIA_RANGE);
	};

	/**
	 * Handler for key up - handle
	 * @param oEvent - The event object
	 */

	ObjectPageSection.prototype.onkeyup = function (oEvent) {
		if (oEvent.keyCode === jQuery.sap.KeyCodes.TAB && this._getObjectPageLayout()._isFirstSection(this)) {
			this._getObjectPageLayout().$("opwrapper").scrollTop(0);
		}
	};

	ObjectPageSection.prototype._updateImportance = function (oCurrentMedia) {
		var oObjectPage = this._getObjectPageLayout(),
			oMedia = oCurrentMedia || Device.media.getCurrentRange(ObjectPageSection.MEDIA_RANGE),
			bShowOnlyHighImportance = oObjectPage && oObjectPage.getShowOnlyHighImportance(),
			sImportanceLevelToHide = this._determineTheLowestLevelOfImportanceToShow(oMedia.name, bShowOnlyHighImportance);

		this.getSubSections().forEach(function (oSubSection) {
			oSubSection._applyImportanceRules(sImportanceLevelToHide);
		});

		this._applyImportanceRules(sImportanceLevelToHide);
		this._updateShowHideAllButton(false);

		if (oObjectPage) {
			oObjectPage._adjustLayout();
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

	ObjectPageSection.prototype.onBeforeRendering = function () {
		var sAriaLabeledBy = "ariaLabelledBy";

		if (!this.getAggregation(sAriaLabeledBy)) {
			this.setAggregation(sAriaLabeledBy, this._getAriaLabelledBy());
		}
	};

	ObjectPageSection.prototype.onAfterRendering = function () {
		this._updateImportance();
	};

	/**
	 * provide a default aria-labeled by text
	 * @private
	 * @returns {*} sap.ui.core.InvisibleText
	 */
	ObjectPageSection.prototype._getAriaLabelledBy = function () {
		return new InvisibleText({
			text: this._getInternalTitle() || this.getTitle()
		}).toStatic();
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
				text: this._getShowHideAllButtonText(!this._thereAreHiddenSubSections()),
				press: this._showHideContentAllContent.bind(this),
				type: sap.m.ButtonType.Transparent
			}).addStyleClass("sapUxAPSectionShowHideButton"));
		}

		return this.getAggregation("_showHideAllButton");
	};

	ObjectPageSection.prototype._getShowHideButtonText = function (bHide) {
		return library.i18nModel.getResourceBundle().getText(bHide ? "HIDE" : "SHOW");
	};

	ObjectPageSection.prototype._getShowHideAllButtonText = function (bHide) {
		return library.i18nModel.getResourceBundle().getText(bHide ? "HIDE_ALL" : "SHOW_ALL");
	};

	ObjectPageSection.prototype._updateShowHideButton = function (bHide) {
		this._getShowHideButton()
			.setVisible(this._shouldBeHidden())
			.setText(this._getShowHideButtonText(!bHide));
	};

	ObjectPageSection.prototype._getShowHideButton = function () {
		if (!this.getAggregation("_showHideButton")) {
			this.setAggregation("_showHideButton", new Button({
				text: this._getShowHideButtonText(!this._getIsHidden()),
				press: this._showHideContent.bind(this),
				type: sap.m.ButtonType.Transparent
			}).addStyleClass("sapUxAPSectionShowHideButton"));
		}

		return this.getAggregation("_showHideButton");
	};

	return ObjectPageSection;
});
