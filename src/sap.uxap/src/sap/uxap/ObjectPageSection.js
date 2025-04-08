/*!
 * ${copyright}
 */

// Provides control sap.uxap.ObjectPageSection.
sap.ui.define([
	"./ObjectPageSectionBase",
	"sap/ui/Device",
	"sap/m/Button",
	"sap/m/Title",
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/core/StashedControlSupport",
	"sap/ui/base/ManagedObjectObserver",
	"./ObjectPageSubSection",
	"./library",
	"sap/m/library",
	"./ObjectPageSectionRenderer",
	"sap/ui/core/library"
], function(
	ObjectPageSectionBase,
	Device,
	Button,
	Title,
	Element,
	Library,
	StashedControlSupport,
	ManagedObjectObserver,
	ObjectPageSubSection,
	library,
	mobileLibrary,
	ObjectPageSectionRenderer,
	coreLibrary
	) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.core.IconColor
	var IconColor = coreLibrary.IconColor;

	var TitleLevel = coreLibrary.TitleLevel;

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
				titleUppercase: {type: "boolean", group: "Appearance", defaultValue: true},

				/**
				* Determines whether the Section title wraps on multiple lines, when the available space is not enough.
				*/
				wrapTitle: {type: "boolean", group: "Appearance", defaultValue: false},

				/**
				 * Specifies the text color of each button inside the AnchorBar.
				 *
				 * The color can be chosen from the icon colors (https://ui5.sap.com/#/api/sap.ui.core.IconColor%23overview).
				 * Possible semantic colors are: Neutral, Positive, Critical, Negative.
				 */
				anchorBarButtonColor : {type : "sap.ui.core.IconColor", group : "Appearance", defaultValue : IconColor.Default}
			},
			defaultAggregation: "subSections",
			aggregations: {

				/**
				 * The list of Subsections.
				 *
 				 * Note: If multiple subsections are used, it is highly recommended to set a title for the section
				 * for accessibility reasons.
				 */
				subSections: {type: "sap.uxap.ObjectPageSubSection", multiple: true, singularName: "subSection", forwarding: {getter: "_getGrid", aggregation: "content"}},

				/**
				 * Section heading content.
				 *
				 * Note: For some accessibility concerns we encourage you to use non-focusable elements.
				 * @since 1.106
				 */
				heading: {type: "sap.ui.core.Control", multiple: false},

				/**
				 * Internal title aggregation
				 */
				_title: {type: "sap.m.Title", multiple: false, visibility: "hidden" },

				_showHideAllButton: {type: "sap.m.Button", multiple: false, visibility: "hidden"}
			},
			associations: {

				/**
				 * The most recently selected Subsection by the user.
				 */
				selectedSubSection: {type: "sap.uxap.ObjectPageSubSection", multiple: false}
			},
			designtime: "sap/uxap/designtime/ObjectPageSection.designtime"
		},

		renderer: ObjectPageSectionRenderer
	});

	ObjectPageSection.MEDIA_RANGE = Device.media.RANGESETS.SAP_STANDARD;

	/**
	 * Returns the closest ObjectPageSection.
	 * @param  {sap.uxap.ObjectPageSectionBase} vSectionBase
	 * @returns {sap.uxap.ObjectPageSection} The closest ObjectPageSection
	 * @private
	 */
	ObjectPageSection._getClosestSection = function (vSectionBase) {
		var oSectionBase = (typeof vSectionBase === "string" && Element.getElementById(vSectionBase)) || vSectionBase;
		return (oSectionBase instanceof ObjectPageSubSection) ? oSectionBase.getParent() : oSectionBase;
	};

	/**
	 * Retrieves the resource bundle for the <code>sap.uxap</code> library.
	 * @static
	 * @private
	 * @returns {Object} the resource bundle object
	 */
	ObjectPageSection._getLibraryResourceBundle = function() {
		return Library.getResourceBundleFor("sap.uxap");
	};

	ObjectPageSection.prototype._expandSection = function () {
		ObjectPageSectionBase.prototype._expandSection.call(this)
			._updateShowHideAllButton(!this._thereAreHiddenSubSections());
	};

	ObjectPageSection.prototype.init = function () {
		ObjectPageSectionBase.prototype.init.call(this);
		this._bInternalTitleVisible = true;
		this._sContainerSelector = ".sapUxAPObjectPageSectionContainer";
		this._oGridContentObserver = new ManagedObjectObserver(this._onGridContentChange.bind(this));
		this._sTitleStyle = TitleLevel.H4;
		this._sTitleId = this.getId() + "-title";
		this._bHasPromotedSubSection = false;
		this._getTitleControl().addStyleClass("sapUxAPObjectPageSectionTitle");
	};

	ObjectPageSection.prototype.exit = function () {
		this._detachMediaContainerWidthChange(this._updateImportance, this);
		this._getTitleControl().destroy();

		if (ObjectPageSectionBase.prototype.exit) {
			ObjectPageSectionBase.prototype.exit.call(this);
		}
	};

	ObjectPageSection.prototype._getTitleControl = function () {
		if (!this.getAggregation("_title")) {
			this.setAggregation("_title", new Title(this._sTitleId, {
				titleStyle: this._getTitleStyle(),
				level: this._getTitleLevel()
			}), true); // this is always called onBeforeRendering so suppress invalidate
		}

		return this.getAggregation("_title");
	};

	ObjectPageSection.prototype._setHasPromotedSubSection = function (bHasPromotedSubSection, bInvalidate) {
		if (bHasPromotedSubSection != this._bHasPromotedSubSection) {
			this._bHasPromotedSubSection = bHasPromotedSubSection;
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageSection.prototype._hasPromotedSubSection = function () {
		return this._bHasPromotedSubSection;
	};

	ObjectPageSection.prototype._getFirstVisibleSubSection  = function () {
		return (this._getVisibleSubSections().length && this._getVisibleSubSections()[0]) || null;
	};

	ObjectPageSection.prototype._updateImportance = function (oCurrentMedia) {
		var oObjectPage = this._getObjectPageLayout(),
			sImportanceLevelToHide = this._getImportanceLevelToHide(oCurrentMedia),
			oHeaderDOM = this.bOutput && this.getDomRef("header"),
			bTitleAriaVisible;

		this.getSubSections().forEach(function (oSubSection) {
			oSubSection._applyImportanceRules(sImportanceLevelToHide);
		});

		this._applyImportanceRules(sImportanceLevelToHide);
		this._updateShowHideAllButton(false);

		bTitleAriaVisible = this._isTitleAriaVisible();
		oHeaderDOM && oHeaderDOM.classList.toggle("sapUxAPObjectPageSectionHeaderHidden", !bTitleAriaVisible);
		oHeaderDOM && oHeaderDOM.setAttribute("aria-hidden", !bTitleAriaVisible);

		if (oObjectPage && this.getDomRef()) {
			oObjectPage._requestAdjustLayout();
		}
	};

	ObjectPageSection.prototype._getImportance = function () {
		if (this._hasPromotedSubSection()) {
			return library.Importance.High;
		}

		return this.getImportance();
	};

	ObjectPageSection.prototype._getTitleUpperCaseStyleClass = function () {
		return "sapUxAPObjectPageSectionTitleUppercase";
	};

	/**@deprecated */
	ObjectPageSection.prototype.connectToModels = function () {
		this.getSubSections().forEach(function (oSubSection) {
			oSubSection.connectToModels();
		});
	};

	ObjectPageSection.prototype.connectToModelsAsync = function () {
		var pAll  = [];

		this.getSubSections().forEach(function (oSubSection) {
			pAll.push(oSubSection.connectToModelsAsync());
		});

		return Promise.all(pAll);
	};

	ObjectPageSection.prototype._allowPropagationToLoadedViews = function (bAllow) {
		this.getSubSections().forEach(function (oSubSection) {
			oSubSection._allowPropagationToLoadedViews(bAllow);
		});
	};

	ObjectPageSection.prototype.onBeforeRendering = function () {
		ObjectPageSectionBase.prototype.onBeforeRendering.call(this);

		this._detachMediaContainerWidthChange(this._updateImportance, this);

		this._applyLayout();
		this._updateImportance();
	};

	ObjectPageSection.prototype.onAfterRendering = function () {
		this._attachMediaContainerWidthChange(this._updateImportance, this);
	};

	ObjectPageSection.prototype._applyLayout = function () {
		var oLayoutConfig = {M: 2, L: 3, XL: 4},
			aChildren = this.getSubSections();

		this._resetLayoutData(aChildren);

		this._assignLayoutData(aChildren, oLayoutConfig);

		return this;
	};

	ObjectPageSection.prototype.setAnchorBarButtonColor = function(value) {
		if (value !== this.getProperty("anchorBarButtonColor")) {
			this.setProperty("anchorBarButtonColor", value, true);
			this._notifyObjectPageLayout();
		}

		return this;
	};

	/**
	 * Determines the minimal required number of columns that a child item
	 * should take, based on the child content and own colspan
	 * @override
	 */
	ObjectPageSection.prototype._getMinRequiredColspanForChild = function (oSubSection) {
		return oSubSection ? oSubSection._getMinRequiredColspan() : 0;
	};

	/**
	 * Determines if allowed to automatically extend the number of columns to span accross
	 * (in case of unused columns on the side, in order to utilize that unused space
	 * @override
	 */
	ObjectPageSection.prototype._allowAutoextendColspanForChild = function (oSubSection) {
		return true;
	};

	ObjectPageSection.prototype._onGridContentChange = function (oEvent) {
		var sMutation;
		// both aggregation names are required
		// because the first ("content") is the actual
		// and the second ("subSections") is the publicly visible
		// due to aggregation forwarding
		if (oEvent.type === "aggregation" && ["content", "subSections"].indexOf(oEvent.name) > -1) {
			this.invalidate();
			sMutation = oEvent.mutation;
			if (sMutation === "add" || sMutation === "insert") {
				this._oGridContentObserver.observe(oEvent.child, {
					properties: ["visible", "importance"]
				});
			} else if (oEvent.mutation === "remove") {
				this._oGridContentObserver.unobserve(oEvent.child);
			}
		}
		if (oEvent.type === "property") {
			if (oEvent.name === "visible") {
				this.invalidate();
			} else if (oEvent.name === "importance") {
				this.setTitleVisible();
			}
		}
	};

	/**
	 * set the internal visibility of the Section title. This is set by the ux rules (for example don't display a Section title in IconTabBar mode)
	 * @param {boolean} bValue
	 * @param {boolean} bInvalidate if set to true, the Section should be rerendered in order to be added or removed to the dom (similar to what a "real" internalVisibility property would trigger)
	 * @private
	 */
	ObjectPageSection.prototype._setInternalTitleVisible = function (bValue, bInvalidate) {
		if (bValue != this._bInternalTitleVisible) {
			this._bInternalTitleVisible = bValue;
			this.setTitleVisible();
			if (bInvalidate) {
				this.invalidate();
			}
		}
	};

	ObjectPageSection.prototype._getInternalTitleVisible = function () {
		return this._bInternalTitleVisible;
	};

	/**
	 * Determines if the <code>ObjectPageSection</code> title is visible.
	 * @private
	 * @returns {boolean}
	 */
	ObjectPageSection.prototype._isTitleVisible = function () {
		var bIsTitleVisibleByUXRule;

		if (this._hasPromotedSubSection()) {
			return false;
		}

		bIsTitleVisibleByUXRule = this._getInternalTitleVisible() || this._shouldDisplayButtonsInHeader();

		return this.getShowTitle() && bIsTitleVisibleByUXRule;
	};

	/**
	 * Determines if the <code>ObjectPageSection</code> title is visible for the aria.
	 * @private
	 * @returns {boolean}
	 */
	ObjectPageSection.prototype._isTitleAriaVisible = function () {
		if (this._hasPromotedSubSection()) {
			return false;
		}

		return (this.getShowTitle() && this._getInternalTitleVisible()) || this._shouldDisplayButtonsInHeader();
	};

	/**
	 * Determines if the <code>ObjectPageSection</code> title is forced to be visible.
	 * This is the case when the <code>ObjectPageSection</code> displays the expand/collapse button or the show/hide all button.
	 * @private
	 * @returns {boolean}
	 */
	ObjectPageSection.prototype._shouldDisplayButtonsInHeader  = function () {
		return this._getShouldDisplayExpandCollapseButton() || this._getShouldDisplayShowHideAllButton();
	};

	/**
	 * Returns the label id for the section.
	 * @private
	 * @returns {string} aria-labeled by id
	 */
	ObjectPageSection.prototype._getAriaLabelledById = function () {
		// Each section should be labelled as:
		// 'titleID' - either its own or the promoted subsection's title
		if (this._hasPromotedSubSection()) {
			return this._getFirstVisibleSubSection()?._getTitleControl().getId();
		} else {
			return this._getTitleControl().getId();
		}
	};

	/**
	 * set subsections focus rules
	 * @private
	 * @returns {*} this
	 */
	ObjectPageSection.prototype._setSubSectionsFocusValues = function () {
		var aSubSections = this._getVisibleSubSections() || [],
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
			if (sLastSelectedSubSectionId === oSubsection.getId() && oSubsection.getTitleVisible()) {
				oSubsection._setToFocusable(true);
				bPreselectedSection = true;
			} else {
				oSubsection._setToFocusable(false);
			}
		});

		if (!bPreselectedSection) {
			var oFirstFocusableSubSection = aSubSections.find(function(oSubSection) {
				return oSubSection.getTitleVisible();
			});

			if (oFirstFocusableSubSection) {
				oFirstFocusableSubSection._setToFocusable(true);
			}
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

	ObjectPageSection.prototype._getShouldDisplayExpandCollapseButton = function () {
		return this._getIsHidden();
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

		this._getShowHideAllButton().setVisible(this._getShouldDisplayShowHideAllButton());

		return ObjectPageSectionBase.prototype._updateShowHideState.call(this, bHide);
	};

	ObjectPageSection.prototype._updateShowHideAllButton = function (bHide) {
		this._getShowHideAllButton()
			.setVisible(this._getShouldDisplayShowHideAllButton())
			.setText(this._getShowHideAllButtonText(bHide));
	};

	ObjectPageSection.prototype._getVisibleSubSections = function () {
		return this.getSubSections().filter(function (oSubSection) {
			return oSubSection.getVisible() && oSubSection._getInternalVisible();
		});
	};

	ObjectPageSection.prototype._getShowHideAllButton = function () {
		if (!this.getAggregation("_showHideAllButton")) {
			this.setAggregation("_showHideAllButton", new Button({
				visible: this._getShouldDisplayShowHideAllButton(),
				text: this._getShowHideAllButtonText(!this._thereAreHiddenSubSections()),
				press: this._showHideContentAllContent.bind(this),
				type: ButtonType.Transparent
			}).addStyleClass("sapUxAPShowHideButton"), true); // this is called from the renderer, so suppress invalidate
		}

		return this.getAggregation("_showHideAllButton");
	};

	ObjectPageSection.prototype._getShowHideAllButtonText = function (bHide) {
		return ObjectPageSection._getLibraryResourceBundle().getText(bHide ? "HIDE_ALL" : "SHOW_ALL");
	};

	StashedControlSupport.mixInto(ObjectPageSection);

	return ObjectPageSection;
});
