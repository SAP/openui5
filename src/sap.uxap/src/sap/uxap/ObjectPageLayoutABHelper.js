/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Metadata",
	"sap/ui/core/CustomData",
	"sap/ui/base/ManagedObjectObserver",
	"./AnchorBar",
	"sap/m/Button",
	"sap/ui/core/IconPool"
], function (jQuery, Metadata, CustomData, ManagedObjectObserver, AnchorBar, Button, IconPool) {
	"use strict";

	var ABHelper = Metadata.createClass("sap.uxap._helpers.AB", {
		/**
		 * @private
		 * @param {sap.uxap.ObjectPageLayout} oObjectPageLayout Object Page layout instance
		 */
		constructor: function (oObjectPageLayout) {
			this._oObjectPageLayout = oObjectPageLayout;
			this._iScrollDuration = oObjectPageLayout._iScrollToSectionDuration;
			this._oObserver = new ManagedObjectObserver(this._proxyStateChanges.bind(this));
		}
	});

	ABHelper.prototype.getObjectPageLayout = function () {
		return this._oObjectPageLayout;
	};

	ABHelper.prototype._proxyStateChanges = function (oChanges) {
		var oObject = oChanges.object,
			oObjectClone = this._findExistingClone(oObject),
			sPropertyName = oChanges.name,
			vCurrentValue = oChanges.current,
			sSetter = "set" + fnCapitalize(sPropertyName);

			if (oObjectClone) {
				oObjectClone[sSetter].call(oObjectClone, vCurrentValue);
			}
	};

	ABHelper.prototype._findExistingClone = function (oObject) {
		var oClone,
			sCloneIdPrefix = oObject.getId() + "-__clone",
			oAnchorBar = this._getAnchorBar(),
			aAnchorBarButtons = oAnchorBar.getContent();

			aAnchorBarButtons.some(function(oButton) {
				if (oButton.getId().indexOf(sCloneIdPrefix) === 0) {
					oClone = oButton;
					return true;
				}
			});

			return oClone;
	};

	/**
	 * Lazy loads the hidden Aggregation "_anchorBar"
	 * @returns {sap.uxap.AnchorBar} AnchorBar
	 * @private
	 */
	ABHelper.prototype._getAnchorBar = function () {
		var oAnchorBar = this.getObjectPageLayout().getAggregation("_anchorBar");

		if (!oAnchorBar) {

			oAnchorBar = new AnchorBar({
				id: this.getObjectPageLayout().getId() + "-anchBar",
				showPopover: this.getObjectPageLayout().getShowAnchorBarPopover()
			});

			this.getObjectPageLayout().setAggregation("_anchorBar", oAnchorBar, true);
		}

		return oAnchorBar;
	};

	/**
	 * build the anchorBar and all the anchorBar buttons
	 * @private
	 */
	ABHelper.prototype._buildAnchorBar = function () {
		var aSections = this.getObjectPageLayout().getSections() || [],
			oAnchorBar = this._getAnchorBar();

		//tablet & desktop mechanism
		if (oAnchorBar && this.getObjectPageLayout().getShowAnchorBar()) {

			oAnchorBar._resetControl();
			this._oObserver.disconnect(); // unobserve all previousy observed objects

			//first level
			aSections.forEach(function (oSection) {

				if (!oSection.getVisible() || !oSection._getInternalVisible()) {
					return;
				}

				var oButtonClone,
					aSubSections = oSection.getSubSections() || [];

				oButtonClone = this._buildAnchorBarButton(oSection, true);

				if (oButtonClone) {
					oAnchorBar.addContent(oButtonClone);

					//second Level
					aSubSections.forEach(function (oSubSection) {

						if (!oSubSection.getVisible() || !oSubSection._getInternalVisible()) {
							return;
						}

						var oSecondLevelButtonClone = this._buildAnchorBarButton(oSubSection, false);

						if (oSecondLevelButtonClone) {
							oAnchorBar.addContent(oSecondLevelButtonClone);
						}

					}, this);
				}

			}, this);
		}
	};

	ABHelper.prototype._focusOnSectionWhenUsingKeyboard = function (oEvent) {
		var oSourceData = oEvent.srcControl.data(),
			oSection = sap.ui.getCore().byId(oSourceData.sectionId),
			oObjectPage = this.getObjectPageLayout();

		if (oSection && !oSourceData.bHasSubMenu && !oObjectPage.getUseIconTabBar()) {
			jQuery.sap.delayedCall(this._iScrollDuration, oSection.$(), "focus");
		}
	};

	/**
	 * build an sap.m.button equivalent to a section or sub section for insertion in the anchorBar
	 * also registers the section info for further dom position updates
	 * @param oSectionBase
	 * @param {boolean} bIsSection
	 * @returns {null}
	 * @private
	 */
	ABHelper.prototype._buildAnchorBarButton = function (oSectionBase, bIsSection) {
		var oButtonClone = null,
			oObjectPageLayout = this.getObjectPageLayout(),
			oButton,
			oAnchorBar = this._getAnchorBar(),
			sId,
			aSubSections = oSectionBase.getAggregation("subSections"),
			fnButtonKeyboardUseHandler = this._focusOnSectionWhenUsingKeyboard.bind(this),
			oEventDelegatesForkeyBoardHandler = {
				onsapenter: fnButtonKeyboardUseHandler,
				onsapspace: fnButtonKeyboardUseHandler
			};

		if (oSectionBase.getVisible() && oSectionBase._getInternalVisible()) {
			oButton = oSectionBase.getCustomAnchorBarButton();

			//by default we get create a button with the section title as text
			if (!oButton) {
				sId = oAnchorBar.getId() + "-" + oSectionBase.getId() + "-anchor";

				oButtonClone = new Button({
					ariaDescribedBy: oSectionBase,
					id: sId
				});

				oButtonClone.addEventDelegate(oEventDelegatesForkeyBoardHandler);
				//has a ux rule been applied that we need to reflect here?
				var sTitle = (oSectionBase._getInternalTitle() != "") ? oSectionBase._getInternalTitle() : oSectionBase.getTitle();
				oButtonClone.setText(sTitle);
			} else {
				oButtonClone = oButton.clone(); //keep original button parent control hierarchy
				this._oObserver.observe(oButton, {
					properties: true
				});
			}

			//update the section info
			oObjectPageLayout._oSectionInfo[oSectionBase.getId()].buttonId = oButtonClone.getId();

			//the anchorBar needs to know the sectionId for automatic horizontal scrolling
			oButtonClone.addCustomData(new CustomData({
				key: "sectionId",
				value: oSectionBase.getId()
			}));

			//the anchorBar needs to know whether the title is actually displayed or not (so the anchorBar is really reflecting the objactPage layout state)
			oButtonClone.addCustomData(new CustomData({
				key: "bTitleVisible",
				value: oSectionBase._getInternalTitleVisible()
			}));

			if (!bIsSection) {
				//the anchorBar needs to know that this is a second section because it will handle responsive scenarios
				oButtonClone.addCustomData(new CustomData({
					key: "secondLevel",
					value: true
				}));
			}

			if (aSubSections && aSubSections.length > 1) {
				var iVisibleSubSections = aSubSections.filter(function (oSubSection) {
					return oSubSection.getVisible();
				}).length;

				if (iVisibleSubSections > 1) {
					// the anchor bar need to know if the button has submenu for accessibility rules
					oButtonClone.addCustomData(new CustomData({
						key: "bHasSubMenu",
						value: true
					}));

					if (oObjectPageLayout.getShowAnchorBarPopover()) {
						// Add arrow icon-down in order to indicate that on click will open popover
						oButtonClone.setIcon(IconPool.getIconURI("slim-arrow-down"));
						oButtonClone.setIconFirst(false);
					}
				}
			}
		}

		return oButtonClone;
	};

	function fnCapitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	return ABHelper;

}, /* bExport= */ false);
