/*!
 * ${copyright}
 */

sap.ui.define(["./library", "sap/base/security/encodeCSS", "sap/m/GenericTile"], function(library, encodeCSS, GenericTile) {
"use strict";

var GenericTileMode = library.GenericTileMode,
	FrameType = library.FrameType,
	Priority = library.Priority;

/**
 * TileContent renderer.
 * @namespace
 */
var TileContentRenderer = {
	apiVersion: 2    // enable in-place DOM patching
};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.TileContent} oControl An object representation of the control that should be rendered
 */
TileContentRenderer.render = function(oRm, oControl) {

	var sTooltip = oControl.getTooltip_AsString();
	var sContentTypeClass = oControl._getContentType();
	var sPriority = oControl.getPriority();
	if (sContentTypeClass) {
		sContentTypeClass = encodeCSS(sContentTypeClass);
	}
	var sFrameTypeClass = encodeCSS("sapMFrameType" + oControl.getFrameType());

	oRm.openStart("div", oControl);
	oRm.class(oControl.getState() == "Disabled" ? "sapMTileCnt sapMTileCntDisabled" : "sapMTileCnt");
	oRm.class(sContentTypeClass);
	oRm.class(sFrameTypeClass);
	if (sPriority === Priority.None){
		oRm.class("sapMGTNoPriority");
	} else {
		oRm.class("sapMGTPriority");
	}
	if (sTooltip.trim()) { // trim check needed since IE11 renders white spaces
		oRm.attr("title", sTooltip);
	}
	if (oControl.getFooter()) {
		oRm.class("sapMTileFooterPresent");
	}
	oRm.openEnd();
	if (oControl.getState() == "Loading") {
		oRm.openStart("div").class("sapMTileCntContentShimmerPlaceholderItem");
		oRm.class("sapMTileCntContentShimmerPlaceholderWithDescription");
		oRm.openEnd();
		oRm.openStart("div").class("sapMTileCntContentShimmerPlaceholderRows")
		.openEnd();
		if (!(oControl.getParent().getFrameType() === "TwoByHalf" || oControl.getParent().getFrameType() === "OneByHalf")) {
			oRm.openStart("div")
			.class("sapMTileCntContentShimmerPlaceholderItemBox")
			.class("sapMTileCntLoadingShimmer")
			.openEnd()
			.close("div");
		}
		oRm.openStart("div")
		.class("sapMTileCntContentShimmerPlaceholderItemTextFooter")
		.class("sapMTileCntLoadingShimmer")
		.openEnd()
		.close("div");
		oRm.close("div");
		oRm.close("div");
	} else if (oControl.getState() == "Failed"){
		oRm.openStart("div", oControl.getId() + "-failed-ftr");
		oRm.class("sapMTileCntFtrFld");
		oRm.openEnd();
		oRm.openStart("div", oControl.getId() + "-failed-icon");
		oRm.class("sapMTileCntFtrFldIcn");
		oRm.openEnd();
		oRm.renderControl(oControl.getParent()._oErrorIcon);
		oRm.close("div");
		oRm.openStart("div", oControl.getId() + "-failed-text");
		oRm.class("sapMTileCntFtrFldTxt");
		oRm.openEnd();
		oRm.renderControl(oControl.getParent().getAggregation("_failedMessageText"));
		oRm.close("div");
		oRm.close("div");
	} else {
		this._renderContent(oRm, oControl);
		this._renderFooter(oRm, oControl);
	}

	oRm.close("div");
};

/**
 * Renders the HTML for the content of the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.TileContent} oControl an object representation of the control whose content should be rendered
 */
TileContentRenderer._renderContent = function(oRm, oControl) {
	if (!oControl._bRenderContent) {
		return;
	}

	var oContent = oControl.getContent(),
		oPriority = oControl.getPriority(),
		oTile = oControl.getParent(),
		bIsActionMode = oTile instanceof GenericTile && oTile.getMode() === GenericTileMode.ActionMode && oTile.getFrameType() === FrameType.TwoByOne,
		sPriorityText = oControl.getPriorityText(),
		bRenderPriority = bIsActionMode && oPriority && oPriority !== Priority.None && sPriorityText,
		iMaxLines = (oPriority !== Priority.None && sPriorityText) ? 1 : 3; //if the Priority is present then the text should have 1 line else 3 lines in ActionMode

	if (oContent) {
		if (bRenderPriority) {
			oRm.openStart("div", oControl.getId() + "-content-container");
			oRm.class("sapMTileContainer");
			oRm.openEnd();
			//Priority Container
			oRm.openStart("div", oControl.getId() + "-priority");
			oRm.class("sapMTilePriority");
			oRm.class(oPriority);
			oRm.openEnd();
			//Inner Container
			oRm.openStart("div", oControl.getId() + "-priority-content");
			oRm.class("sapMTilePriorityCnt");
			oRm.openEnd();
			//Value
			oRm.openStart("span", oControl.getId() + "-priority-value");
			oRm.class("sapMTilePriorityValue");
			oRm.openEnd();
			oRm.text(sPriorityText);
			oRm.close("span");
			oRm.close("div");
			oRm.close("div");
			oRm.close("div");
		}
		if (oContent.isA("sap.m.Text") && bIsActionMode && (oControl.getFrameType() === FrameType.TwoByOne || oControl.getFrameType() === FrameType.Auto)) {
			oContent.setMaxLines(iMaxLines);
		}
		oRm.openStart("div", oControl.getId() + "-content");
		oRm.class("sapMTileCntContent");
		oRm.openEnd();
		if (!oContent.hasStyleClass("sapMTcInnerMarker")) {
			oContent.addStyleClass("sapMTcInnerMarker");
		}
		oRm.renderControl(oContent);
		oRm.close("div");

	}
};

/**
 * Renders the HTML for the footer of the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.TileContent} oControl an object representation of the control whose footer should be rendered
 */

TileContentRenderer._renderFooter = function(oRm, oControl) {
	if (!oControl._bRenderFooter) {
		return;
	}

	var sColorClass = "sapMTileCntFooterTextColor" + oControl.getFooterColor(),
		sFooterTxt = oControl._getFooterText(oRm, oControl),
		oTile = oControl.getParent();

	if (oTile instanceof GenericTile && (oTile._isNavigateActionEnabled())) {
		oRm.openStart("div", oTile.getId() + "-footer-container");
		oRm.class("sapMTileFtrCnt");
		oRm.openEnd();
	}

	// footer text div
	oRm.openStart("div", oControl.getId() + "-footer-text");
	oRm.class("sapMTileCntFtrTxt");
	oRm.class(encodeCSS(sColorClass));
	oRm.openEnd();
	oRm.text(sFooterTxt);
	oRm.close("div");

	if (oTile instanceof GenericTile && oTile._isNavigateActionEnabled()) {
		oRm.openStart("div", oTile.getId() + "-navigateActionContainer");
		oRm.class("sapMTileNavContainer");
		oRm.openEnd();
		oRm.renderControl(oTile._getNavigateAction());
		oRm.close("div");
		oRm.close("div");
	}
};

return TileContentRenderer;
});