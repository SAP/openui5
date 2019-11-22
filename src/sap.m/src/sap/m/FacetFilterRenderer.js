/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/ui/Device", "sap/ui/core/InvisibleText"],
	function(library, Device, InvisibleText) {
	"use strict";


	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = library.FacetFilterType;


	/**
	 * FacetFilter renderer.
	 * @namespace
	 */
	var FacetFilterRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.render = function(oRm, oControl){
		switch (oControl.getType()) {

		case FacetFilterType.Simple:
			FacetFilterRenderer.renderSimpleFlow(oRm, oControl);
			break;

		case FacetFilterType.Light:
			FacetFilterRenderer.renderSummaryBar(oRm, oControl);
			break;
		}
	};

	/**
	 *
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.renderSimpleFlow = function(oRm, oControl) {

		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMFF");
		oRm.writeAccessibilityState(oControl, {
			"role": "toolbar"
		});

		if (oControl.getShowSummaryBar()) {

			oRm.write(">");
			FacetFilterRenderer.renderSummaryBar(oRm, oControl);
		} else {

			if (oControl._lastScrolling) {

				oRm.addClass("sapMFFScrolling");
			} else {

				oRm.addClass("sapMFFNoScrolling");
			}

			if (oControl.getShowReset()) {

				oRm.addClass("sapMFFResetSpacer");
			}
			oRm.writeClasses();
			oRm.write(">");


			if (Device.system.desktop) {
				oRm.renderControl(oControl._getScrollingArrow("left"));
			}
			// Render the div for the carousel
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-head");
			oRm.addClass("sapMFFHead");
			oRm.writeClasses();
			oRm.write(">");

			FacetFilterRenderer.renderFacetFilterListButtons(oControl, oRm);

			if (oControl.getShowPersonalization()) {
				oRm.renderControl(oControl.getAggregation("addFacetButton"));
			}
			oRm.write("</div>"); // Close carousel div
			if (Device.system.desktop) {
				oRm.renderControl(oControl._getScrollingArrow("right"));
			}

			if (oControl.getShowReset()) {

				oRm.write("<div");
				oRm.addClass("sapMFFResetDiv");
				oRm.writeClasses();
				oRm.write(">");
				oRm.renderControl(oControl.getAggregation("resetButton"));
				oRm.write("</div>");
			}
		}
		oRm.write("</div>");
	};


	/**
	 *
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.renderSummaryBar = function(oRm, oControl) {

		// We cannot just render the toolbar without the parent div.  Otherwise it is
		// not possible to switch type from light to simple.
		oRm.write("<div");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMFF");
		oRm.writeClasses();
		oRm.write(">");
		oRm.renderControl(oControl.getAggregation("summaryBar"));
		oRm.write("</div>");
	};


	/**
	 * Creates an invisible aria node for the given message bundle text
	 * in the static UIArea and returns its id for ARIA announcements.
	 *
	 * This method should be used when text is reached frequently.
	 *
	 * @param {String} sKey Key of the announcement
	 * @param {String} sBundleText Key of the announcement
	 * @returns {String} Id of the generated invisible aria node
	 * @protected
	 */
	FacetFilterRenderer.getAriaAnnouncement = function(sKey, sBundleText) {
		return InvisibleText.getStaticId("sap.m", sBundleText || "FACETFILTER_" + sKey.toUpperCase());
	};



	/**
	 * Returns the inner aria describedby IDs for the accessibility.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {String|undefined} The aria of the inner aria describedby IDs
	 * @protected
	 */
	FacetFilterRenderer.getAriaDescribedBy = function(oControl) {
		var aDescribedBy = [];

		if (oControl.getShowPersonalization()) {
			aDescribedBy.push(this.getAriaAnnouncement("ARIA_REMOVE"));
		}
		aDescribedBy = aDescribedBy.concat(oControl._aAriaPositionTextIds);

		return aDescribedBy.join(" ");
	};


	/**
	 * Returns the accessibility state of the control.
	 *
	 * @param {sap.ui.core.Control} oControl an object representation of the control
	 * @returns {object} The accessibility state of the control
	 * @protected
	 */
	FacetFilterRenderer.getAccessibilityState = function(oControl) {
		return {
			describedby : {
				value : this.getAriaDescribedBy(oControl),
				append : true
			}
		};
	};

	FacetFilterRenderer.renderFacetFilterListButtons = function(oControl, oRm) {
		var aLists = oControl._getSequencedLists(),
			iLength = aLists.length, oButton,
			i, sPosition, oAccText,
			aOldAriaDescribedBy = [], aNewAriaDescribedBy = [],
			sFacetFilterText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("FACETFILTER_ARIA_FACET_FILTER"),
			sRemoveFilterTextId = this.getAriaAnnouncement("ARIA_REMOVE");


		for (i = 0; i < iLength; i++) {
			// add button only if the list is not empty or is active
			var bListItems = aLists[i].getItems().length > 0,
				bListActive = aLists[i].getActive(),
				bAddButton = oControl._bCheckForAddListBtn && (bListItems || bListActive);

			if (!oControl._bCheckForAddListBtn || bAddButton) {
				oButton = oControl._getButtonForList(aLists[i]);

				//remove all previous InvisibleText(s) related to the positioning
				aOldAriaDescribedBy = oButton.removeAllAriaDescribedBy();
				aOldAriaDescribedBy.forEach(destroyItem);

				//get current position
				sPosition = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("FACETFILTERLIST_ARIA_POSITION", [(i + 1), iLength]);
				oAccText = new InvisibleText( {text: sFacetFilterText + " " + sPosition}).toStatic();
				oControl._aOwnedLabels.push(oAccText.getId());
				oButton.addAriaDescribedBy(oAccText);
				aNewAriaDescribedBy.push(oAccText.getId());

				if (oControl.getShowPersonalization()) {
					oButton.addAriaDescribedBy(FacetFilterRenderer.getAriaAnnouncement("ARIA_REMOVE"));
				}
				oRm.renderControl(oButton);
				if (oControl.getShowPersonalization()) {
					oRm.renderControl(oControl._getFacetRemoveIcon(aLists[i]));
				}
			}
		}
		//needed because of FacetFilterRenderer.getAriaDescribedBy
		oControl._aAriaPositionTextIds = aNewAriaDescribedBy;

		function destroyItem (sItemId) {
			if (sRemoveFilterTextId !== sItemId) {//exclude the acc text for removable facet, because it does not need change.
				var oItem = sap.ui.getCore().byId(sItemId);
				if (oItem) {
					oItem.destroy();
				}
			}
		}
	};

	return FacetFilterRenderer;

}, /* bExport= */ true);
