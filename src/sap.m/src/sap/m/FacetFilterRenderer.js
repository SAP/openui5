/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/ui/Device", "sap/ui/core/InvisibleText", "sap/ui/core/Element", "sap/ui/core/Lib"],
	function(library, Device, InvisibleText, Element, Lib) {
	"use strict";


	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = library.FacetFilterType;


	/**
	 * FacetFilter renderer.
	 * @namespace
	 */
	var FacetFilterRenderer = {
		apiVersion: 2
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.render = function(oRm, oControl){
		if (oControl.getType() === FacetFilterType.Light || oControl.getShowSummaryBar()) {
			FacetFilterRenderer.renderSummaryBar(oRm, oControl);

		} else {
			FacetFilterRenderer.renderSimpleFlow(oRm, oControl);

		}
	};

	/**
	 *
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.renderSimpleFlow = function(oRm, oControl) {

		oRm.openStart("div", oControl);
		oRm.class("sapMFF");
		oRm.accessibilityState({
			role: "toolbar",
			roledescription: oControl._bundle.getText("FACETFILTER_TITLE")
		});

		if (oControl._lastScrolling) {
			oRm.class("sapMFFScrolling");
		} else {
			oRm.class("sapMFFNoScrolling");
		}

		if (oControl.getShowReset()) {
			oRm.class("sapMFFResetSpacer");
		}

		oRm.openEnd();

		if (Device.system.desktop) {
			oRm.renderControl(oControl._getScrollingArrow("left"));
		}

		// Render the div for the carousel
		oRm.openStart("div", oControl.getId() + "-head" );
		oRm.class("sapMFFHead");
		oRm.openEnd();

		FacetFilterRenderer.renderFacetFilterListButtons(oControl, oRm);

		if (oControl.getShowPersonalization()) {
			FacetFilterRenderer.renderAddFilterButton(oControl, oRm);
		}

		oRm.close("div"); // Close carousel div

		if (Device.system.desktop) {
			oRm.renderControl(oControl._getScrollingArrow("right"));
		}

		if (oControl.getShowReset()) {
			oRm.openStart("div");
			oRm.class("sapMFFResetDiv");
			oRm.openEnd();
			oRm.renderControl(oControl.getAggregation("resetButton"));
			oRm.close("div");
		}

		oRm.close("div");
	};


	/**
	 *
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 */
	FacetFilterRenderer.renderSummaryBar = function(oRm, oControl) {

		// We cannot just render the toolbar without the parent div.  Otherwise it is
		// not possible to switch type from light to simple.
		oRm.openStart("div", oControl);
		oRm.class("sapMFF");
		oRm.openEnd();
		oRm.renderControl(oControl.getAggregation("summaryBar"));
		oRm.close("div");

	};


	/**
	 * Creates an invisible aria node for the given message bundle text
	 * in the static UIArea and returns its id for ARIA announcements.
	 *
	 * This method should be used when text is reached frequently.
	 *
	 * @param {string} sKey Key of the announcement
	 * @param {string} sBundleText Key of the announcement
	 * @returns {string} Id of the generated invisible aria node
	 * @protected
	 */
	FacetFilterRenderer.getAriaAnnouncement = function(sKey, sBundleText) {
		return InvisibleText.getStaticId("sap.m", sBundleText || "FACETFILTER_" + sKey.toUpperCase());
	};

	FacetFilterRenderer.renderFacetFilterListButtons = function(oControl, oRm) {
		var aLists = oControl._getSequencedLists(),
			iLength = aLists.length,
			bShowPersonalization = oControl.getShowPersonalization(),
			bAddFilterButton = bShowPersonalization && (oControl.getType() === FacetFilterType.Simple),
			iFacetFilterButtonsLength = bAddFilterButton ? iLength + 1 : iLength,
			oButton,
			i;

		for (i = 0; i < iLength; i++) {
			// add button only if the list is not empty or is active
			var bListItems = aLists[i].getItems().length > 0,
				bListActive = aLists[i].getActive(),
				bAddButton = oControl._bCheckForAddListBtn && (bListItems || bListActive);

			if (!oControl._bCheckForAddListBtn || bAddButton) {
				oButton = oControl._getButtonForList(aLists[i]);

				FacetFilterRenderer.addPositionInfoForButton(oControl, oButton, i + 1, iFacetFilterButtonsLength);

				if (bShowPersonalization) {
					oButton.addAriaDescribedBy(FacetFilterRenderer.getAriaAnnouncement("ARIA_REMOVE"));
				}
				oRm.renderControl(oButton);
				if (bShowPersonalization) {
					oRm.renderControl(oControl._getFacetRemoveIcon(aLists[i]));
				}
			}
		}

		return this;
	};

	/**
	 * Prepares the "Add Filter" button by adding positioning information and then renders it.
	 *
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 *
	 * @returns {FacetFilterRenderer} <code>this</code> to allow method chaining
	 */
	FacetFilterRenderer.renderAddFilterButton = function (oControl, oRm) {
		var oAddFacetButton = oControl.getAggregation("addFacetButton"),
			iButtonsCount = oControl._getSequencedLists().length + 1;

		FacetFilterRenderer.addPositionInfoForButton(oControl, oAddFacetButton, iButtonsCount, iButtonsCount);
		oRm.renderControl(oAddFacetButton);

		return this;
	};

	/**
	 * Replaces the old positioning information with updated one.
	 *
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 * @param {sap.m.Button} oButton The button on which positioning information will be added
	 * @param {int} iPosInSet Button's position in the set
	 * @param {int} iSetSize Set's total size
	 * @returns {FacetFilterRenderer} <code>this</code> to allow method chaining
	 */
	FacetFilterRenderer.addPositionInfoForButton = function (oControl, oButton, iPosInSet, iSetSize) {
		var oStaticLabel = FacetFilterRenderer.createStaticPositioningLabel(oControl, iPosInSet, iSetSize);

		FacetFilterRenderer.clearOldPositioningLabels(oControl, oButton);
		oButton.addAriaDescribedBy(oStaticLabel);

		return this;
	};

	/**
	 * Removes the old positioning information.
	 *
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 * @param {sap.m.Button} oButton The button from which old positioning information will be removed
	 * @returns {FacetFilterRenderer} <code>this</code> to allow method chaining
	 */
	FacetFilterRenderer.clearOldPositioningLabels = function (oControl, oButton) {
		var aOldAriaDescribedBy = oButton.removeAllAriaDescribedBy(),
			sRemoveFilterTextId = this.getAriaAnnouncement("ARIA_REMOVE"),
			oItem;

		// Destroy the labels after removal as well.
		aOldAriaDescribedBy.forEach(function(sItemId) {
			// Exclude the invisible label for removable facet, because it doesn't need change.
			if (sRemoveFilterTextId === sItemId) {
				return;
			}

			// Destroy the item itself
			oItem = Element.registry.get(sItemId);
			oItem && oItem.destroy();
		});

		return this;
	};

	/**
	 * Creates a label in the static area, which contains positioning information.
	 *
	 * @param {sap.m.FacetFilter} oControl An object representation of the control that should be rendered
	 * @param {int} iPosInSet Position in the set
	 * @param {int} iSetSize Set's total size
	 * @returns {sap.ui.core.InvisibleText} oStaticLabel The newly created label
	 */
	FacetFilterRenderer.createStaticPositioningLabel = function (oControl, iPosInSet, iSetSize) {
		var oRB = Lib.getResourceBundleFor("sap.m"),
			sFacetFilterText = oRB.getText("FACETFILTER_ARIA_FACET_FILTER"),
			sPositioningText = oRB.getText("FACETFILTERLIST_ARIA_POSITION", [iPosInSet, iSetSize]),
			oStaticLabel = new InvisibleText({ text: sFacetFilterText + " " + sPositioningText }).toStatic();

		oControl._aOwnedLabels.push(oStaticLabel.getId());
		return oStaticLabel;
	};

	return FacetFilterRenderer;

}, /* bExport= */ true);
