/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/base/security/encodeCSS"],
	function(library, encodeCSS) {
	"use strict";

	// shortcut for sap.m.GenericTileMode
	var GenericTileMode = library.GenericTileMode;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	// shortcut for sap.m.FrameType
	var frameTypes = library.FrameType;

	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * GenericTile renderer.
	 * @namespace
	 */
	var GenericTileRenderer = {
		apiVersion: 2    // enable in-place DOM patching
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileRenderer.render = function(oRm, oControl) {
		// Write the HTML into the render manager.
		var sTooltipText = oControl._getTooltipText();
		var sAriaText = oControl._getAriaText();
		var sHeaderImage = oControl.getHeaderImage();
		var bHasPress = oControl.hasListeners("press");
		var sState = oControl.getState();
		var sStateClass = encodeCSS("sapMGTState" + sState);
		var sScopeClass;
		var frameType = oControl.getFrameType();
		var sAriaRoleDescription = oControl.getAriaRoleDescription();
		var sAriaRole = oControl.getAriaRole();

		// Render a link when URL is provided, not in action scope and the state is enabled
		var bRenderLink = oControl.getUrl() && !oControl._isInActionScope() && sState !== LoadState.Disabled;

		if (oControl._isInActionScope()) {
			sScopeClass = encodeCSS("sapMGTScopeActions");
		} else {
			sScopeClass = encodeCSS("sapMGTScopeDisplay");
		}

		if (bRenderLink) {
			oRm.openStart("a", oControl);
			oRm.attr("href", oControl.getUrl());
			oRm.attr("rel", "noopener noreferrer");
			oRm.attr("draggable", "false"); // <a> elements are draggable per default, use UI5 DnD instead
		} else {
			oRm.openStart("div",oControl );
		}

		if (sTooltipText) {
			oRm.attr("title", sTooltipText);
		}

		oRm.class("sapMGT");
		oRm.class(sStateClass);
		oRm.class(sScopeClass);
		// render actions view for SlideTile actions scope
		if (!oControl._isInActionScope() && oControl._bShowActionsView) {
			oRm.class("sapMGTScopeActions");
		}
		oRm.class(frameType);
		if (sAriaRole) {
			oRm.attr("role", sAriaRole);
		} else if (!bRenderLink) { // buttons only; <a> elements always have the default role
				oRm.attr("role", bHasPress ? "button" : "presentation");
		} else {
				oRm.attr("role", "link");
		}
		oRm.attr("aria-label", sAriaText);
		if (sAriaRoleDescription) {
			oRm.attr("aria-roledescription", sAriaRoleDescription );
		} else {
			oRm.attr("aria-roledescription", oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"));
		}
		if (sState !== LoadState.Disabled) {
			if (!oControl.isInActionRemoveScope()) {
				oRm.class("sapMPointer");
			}
			oRm.attr("tabindex", "0");
		}
		if (oControl.getWidth()) {
			oRm.style("width", oControl.getWidth() );
		}
		if (oControl.getBackgroundImage()) {
			oRm.style("background-image", "url('" + encodeCSS(oControl.getBackgroundImage()) + "')");
			oRm.class("sapMGTBackgroundImage");
		}
		if (oControl.getMode() === GenericTileMode.HeaderMode) {
			oRm.class("sapMGTHeaderMode");
		}
		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapMGTHdrContent");
		oRm.class(frameType);
		if (sTooltipText) {
			oRm.attr("title", sTooltipText);
		}
		oRm.openEnd();
		if (sHeaderImage) {
			oRm.renderControl(oControl._oImage);
		}

		this._renderHeader(oRm, oControl);
		var aTileContent = oControl.getTileContent();
		var iLength = aTileContent.length;
		var isHalfFrame = frameType === frameTypes.OneByHalf || frameType === frameTypes.TwoByHalf;
		var isContentPresent = false;
		for (var i = 0; i < iLength; i++) {
			if (aTileContent[i].getAggregation("content") !== null){
				if (frameType === frameTypes.OneByHalf && aTileContent[i].getAggregation("content").getMetadata()._sClassName === "sap.m.ImageContent") {
					isContentPresent = false;
				} else {
					isContentPresent = true;
					break;
				}
			}
		}
		if (!(isHalfFrame && isContentPresent)) {
			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}
		}

		oRm.close("div");

		oRm.openStart("div", oControl.getId() + "-content");
		oRm.class("sapMGTContent");
		oRm.openEnd();
		for (var i = 0; i < iLength; i++) {
			oControl._checkFooter(aTileContent[i], oControl);
			oRm.renderControl(aTileContent[i]);
		}
		oRm.close("div");

		if (sState !== LoadState.Loaded) {
			this._renderStateOverlay(oRm, oControl, sTooltipText);
		}

		if (sState !== LoadState.Disabled) {
			this._renderHoverOverlay(oRm, oControl);
			this._renderFocusDiv(oRm, oControl);
		}

		if (oControl._isInActionScope()) {
			this._renderActionsScope(oRm, oControl);
		}
		if (bRenderLink) {
			oRm.close("a");
		} else {
			oRm.close("div");
		}
	};

	GenericTileRenderer._renderFocusDiv = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-focus");
		oRm.class("sapMGTFocusDiv");
		oRm.openEnd();
		oRm.close("div");
	};

	GenericTileRenderer._renderStateOverlay = function(oRm, oControl, sTooltipText) {
		var sState = oControl.getState();
		oRm.openStart("div", oControl.getId() + "-overlay");
		oRm.class("sapMGTOverlay");
		if (sTooltipText) {
			oRm.attr("title", sTooltipText);
		}
		oRm.openEnd();
		switch (sState) {
			case LoadState.Loading :
				oControl._oBusy.setBusy(sState == LoadState.Loading);
				oRm.renderControl(oControl._oBusy);
				break;
			case LoadState.Failed :
				oRm.openStart("div", oControl.getId() + "-failed-ftr");
				oRm.class("sapMGenericTileFtrFld");
				oRm.openEnd();
				oRm.openStart("div", oControl.getId() + "-failed-icon");
				oRm.class("sapMGenericTileFtrFldIcn");
				oRm.openEnd();
				oRm.renderControl(oControl._oWarningIcon);
				oRm.close("div");

				if (!oControl._isInActionScope() && !oControl._bShowActionsView) {
					oRm.openStart("div", oControl.getId() + "-failed-text");
					oRm.class("sapMGenericTileFtrFldTxt");
					oRm.openEnd();
					oRm.renderControl(oControl.getAggregation("_failedMessageText"));
					oRm.close("div");
				}

				oRm.close("div");
				break;
			default :
		}
		oRm.close("div");
	};

	GenericTileRenderer._renderActionsScope = function(oRm, oControl) {
		if (oControl.getState() !== LoadState.Disabled) {
			oRm.renderControl(oControl._oRemoveButton);
			oRm.renderControl(oControl._oMoreIcon);
		}
	};

	GenericTileRenderer._renderHoverOverlay = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-hover-overlay");
		if (oControl.getBackgroundImage()) {
			oRm.class("sapMGTWithImageHoverOverlay");
		} else {
			oRm.class("sapMGTWithoutImageHoverOverlay");
		}
		oRm.openEnd();
		oRm.close("div");
	};

	/**
	 * Renders the HTML for the header of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 */
	GenericTileRenderer._renderHeader = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-hdr-text");
		oRm.class("sapMGTHdrTxt");
		oRm.openEnd();
		oRm.renderControl(oControl._oTitle);
		oRm.close("div");
	};

	/**
	 * Renders the HTML for the subheader of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose description should be rendered
	 */
	GenericTileRenderer._renderSubheader = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-subHdr-text");
		oRm.class("sapMGTSubHdrTxt");
		oRm.openEnd();
		oRm.renderControl(oControl._oSubTitle);
		oRm.close("div");
	};

	return GenericTileRenderer;

}, /* bExport= */true);
