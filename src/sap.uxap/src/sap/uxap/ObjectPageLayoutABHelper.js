/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/Metadata",
	"sap/ui/core/CustomData",
	"./AnchorBar",
	"sap/m/Button",
	"sap/ui/core/IconPool"
], function (jQuery, Metadata, CustomData, AnchorBar, Button, IconPool) {
	"use strict";

	var ABHelper = Metadata.createClass("sap.uxap._helpers.AB", {
		/**
		 * @private
		 * @param {sap.uxap.ObjectPageLayout} oObjectPageLayout Object Page layout instance
		 */
		constructor: function (oObjectPageLayout) {
			this._oObjectPageLayout = oObjectPageLayout;
		}
	});

	ABHelper.prototype.getObjectPageLayout = function () {
		return this._oObjectPageLayout;
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
				showPopover: this.getObjectPageLayout().getShowAnchorBarPopover()
			});

			this.getObjectPageLayout().setAggregation("_anchorBar", oAnchorBar);
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

			oAnchorBar.removeAllContent();

			//first level
			aSections.forEach(function (oSection) {

				if (!oSection.getVisible() || !oSection._getInternalVisible()) {
					return true;
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

						var oButtonClone = this._buildAnchorBarButton(oSubSection, false);

						if (oButtonClone) {
							oAnchorBar.addContent(oButtonClone);
						}

					}, this);
				}

			}, this);
		}
	};

	/**
	 * build a sap.m.button equivalent to a section or sub section for insertion in the anchorBar
	 * also registers the section info for further dom position updates
	 * @param oSectionBase
	 * @param bIsSection
	 * @returns {null}
	 * @private
	 */
	ABHelper.prototype._buildAnchorBarButton = function (oSectionBase, bIsSection) {

		var oButtonClone = null,
			oButton,
			oSectionBindingInfo,
			sModelName,
			aSubSections = oSectionBase.getAggregation("subSections");

		if (oSectionBase.getVisible() && oSectionBase._getInternalVisible()) {
			oButton = oSectionBase.getCustomAnchorBarButton();

			//by default we get create a button with the section title as text
			if (!oButton) {
				oButtonClone = new Button({
					ariaDescribedBy: oSectionBase
				});

				//has a ux rule been applied that we need to reflect here?
				if (oSectionBase._getInternalTitle() != "") {
					oButtonClone.setText(oSectionBase._getInternalTitle());
				} else {

					//is the section title bound to a model? in this case we need to apply the same binding
					oSectionBindingInfo = oSectionBase.getBindingInfo("title");
					if (oSectionBindingInfo && oSectionBindingInfo.parts && oSectionBindingInfo.parts.length > 0) {

						sModelName = oSectionBindingInfo.parts[0].model;

						//handle relative binding scenarios
						oButtonClone.setBindingContext(oSectionBase.getBindingContext(sModelName), sModelName);

						//copy binding information
						oButtonClone.bindProperty("text", {
							path: oSectionBindingInfo.parts[0].path,
							model: sModelName
						});
					} else { //otherwise just copy the plain text
						oButtonClone.setText(oSectionBase.getTitle());
					}
				}
			} else {
				oButtonClone = oButton.clone(); //keep original button parent control hierarchy
			}

			//update the section info
			this.getObjectPageLayout()._oSectionInfo[oSectionBase.getId()].buttonId = oButtonClone.getId();

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
				// the anchor bar need to know if the button has submenu for accessibility rules
				oButtonClone.addCustomData(new CustomData({
					key: "bHasSubMenu",
					value: true
				}));

				// Add arrow icon-down in order to indicate that on click will open popover
				oButtonClone.setIcon(IconPool.getIconURI("slim-arrow-down"));
				oButtonClone.setIconFirst(false);
			}
		}

		return oButtonClone;
	};

	return ABHelper;

}, /* bExport= */ false);
