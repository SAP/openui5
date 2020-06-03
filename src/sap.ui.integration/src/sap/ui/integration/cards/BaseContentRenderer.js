/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 *  BaseContent renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var BaseContentRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.integration.card.BaseContent} oCardContent an object representation of the control that should be rendered
	 */
	BaseContentRenderer.render = function (oRm, oCardContent) {
		// Add class the simple way. Add renderer hooks only if needed.
		var sClass = "sapFCard",
			sLibrary = oCardContent.getMetadata().getLibraryName(),
			sName = oCardContent.getMetadata().getName(),
			sType = sName.slice(sLibrary.length + 1, sName.length),
			oCard = oCardContent.getParent(),
			bIsCardValid = oCard && oCard.isA("sap.f.ICard"),
			oContent = oCardContent.getAggregation("_content");

		sClass += sType;

		oRm.openStart("div", oCardContent)
			.class(sClass)
			.class("sapFCardBaseContent");

		if (oCardContent.hasListeners("press")) {
			oRm.class("sapFCardClickable");
		}

		if (bIsCardValid && oCard.getHeight() === "auto") { // if there is no height specified the default value is "auto"
			var sHeight = this.getMinHeight(sType, oCardContent.getConfiguration(), oCardContent);
			oRm.style("min-height", sHeight);
		}

		oRm.openEnd();

		if (sType !== "AdaptiveContent" && bIsCardValid && oCardContent.isLoading()) {
			oRm.renderControl(oCardContent._oLoadingPlaceholder);

			//Removing content from the tab chain
			if (sType !== "AnalyticalContent" && sType !== "TimelineContent") {
				oContent.addStyleClass("sapFCardContentHidden");
			}
		}

		oRm.renderControl(oContent);
		oRm.close("div");
	};

	BaseContentRenderer.getMinHeight = function (sType, oConfiguration, oContent) {

		var MIN_HEIGHT = 5,
			iHeight,
			oReferenceElement = oContent,
			oParent = oContent.getParent();

		if (!oContent.getDomRef() && oParent && oParent.isA("sap.f.ICard")) {
			oReferenceElement = oParent;
		}

		// check if there is an element up the DOM which enables compact density
		var isCompact = oReferenceElement.$().closest(".sapUiSizeCompact").hasClass("sapUiSizeCompact");

		if (jQuery.isEmptyObject(oConfiguration)) {
			return "0rem";
		}

		switch (sType) {
			case "ListContent":
				iHeight = this._getMinListHeight(oConfiguration, isCompact);
				break;
			case "TableContent":
				iHeight = this._getMinTableHeight(oConfiguration, isCompact);
				break;
			case "TimelineContent":
				iHeight = this._getMinTimelineHeight(oConfiguration, isCompact);
				break;
			case "AnalyticalContent":
				iHeight = 14;
				break;
			case "AnalyticsCloudContent":
				iHeight = 14;
				break;
			case "ObjectContent":
				iHeight = 0;
				break;
			default:
				iHeight = 0;
		}

		return (iHeight !== 0 ? iHeight : MIN_HEIGHT) + "rem";
	};

	BaseContentRenderer._getMinListHeight = function (oConfiguration, isCompact) {
		var iCount = parseInt(oConfiguration.maxItems) || 0,
			oTemplate = oConfiguration.item,
			iItemHeight = isCompact ? 2 : 2.75; // list item height in "rem"

		if (!oTemplate) {
			return 0;
		}

		if (oTemplate.description) {
			iItemHeight = 5; // list item height with description in "rem"
		}

		return iCount * iItemHeight;
	};

	BaseContentRenderer._getMinTableHeight = function (oConfiguration, isCompact) {
		var iCount = parseInt(oConfiguration.maxItems) || 0,
			iRowHeight = isCompact ? 2 : 2.75, // table row height in "rem"
			iTableHeaderHeight = isCompact ? 2 : 2.75; // table header height in "rem"

		return iCount * iRowHeight + iTableHeaderHeight;
	};

	BaseContentRenderer._getMinTimelineHeight = function (oConfiguration, isCompact) {
		var iCount = parseInt(oConfiguration.maxItems) || 0,
			iItemHeight = isCompact ? 4 : 5; // timeline item height in "rem"

		return iCount * iItemHeight;
	};

	return BaseContentRenderer;
});
