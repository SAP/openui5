/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/base/security/encodeCSS", "sap/ui/core/Theming"], function(library, encodeCSS, Theming) {
"use strict";

// shortcut for sap.m.GenericTileMode
var GenericTileMode = library.GenericTileMode;

// shortcut for sap.m.GenericTileScope
var GenericTileScope = library.GenericTileScope;

// shortcut for sap.m.LoadState
var LoadState = library.LoadState;

// shortcut for sap.m.FrameType
var frameTypes = library.FrameType;

var ValueColor = library.ValueColor;

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
	var sAriaRole = oControl.getGridItemRole() || oControl.getAriaRole();
	var isHalfFrame = frameType === frameTypes.OneByHalf || frameType === frameTypes.TwoByHalf;
	var sBGColor = oControl._oBadgeColors["backgroundColor"];
	var aLinkTileContent = oControl.getLinkTileContents();
	var oBadge = oControl.getBadge();

	// Render a link when URL is provided, not in action scope and the state is enabled
	var bRenderLink = oControl._shouldRenderLink();

	if (oControl._isInActionScope()) {
		sScopeClass = encodeCSS("sapMGTScopeActions");
	} else {
		sScopeClass = encodeCSS("sapMGTScopeDisplay");
	}

	if (bRenderLink) {
		oRm.openStart("a", oControl);
		oRm.attr("href", oControl.getUrl());
		oRm.attr("rel", "noopener noreferrer");
		if (!this._isDragabble(oControl)) {
			oRm.attr("draggable", "false"); // <a> elements are draggable per default, use UI5 DnD instead
		}
	} else {
		oRm.openStart("div",oControl );
	}

	if (sTooltipText && sState !== LoadState.Loading) {
		oRm.attr("title", sTooltipText);
	}

	oRm.class("sapMGT");
	oRm.class(sStateClass);
	oRm.class(sScopeClass);
	// render actions view for SlideTile actions scope
	if (!oControl._isInActionScope() && oControl._bShowActionsView) {
		oRm.class("sapMGTScopeActions");
	}
	//Set respective Class for IconMode
	if (oControl._isIconMode()){
		if (frameType === frameTypes.OneByOne) {
			var sClass = "sapMGTOneByOne";
		} else if (frameType === frameTypes.TwoByHalf) {
			var sClass = "TwoByHalf";
		}
	}
	oRm.class(oControl._isIconMode() ? sClass : frameType);

	var bIsArticleMode = oControl.getMode() === GenericTileMode.ArticleMode,
		bIsActionMode = oControl.getMode() === GenericTileMode.ActionMode;

	if (bIsActionMode) {
		oRm.class("sapMGTActionMode");
	}
	if (bIsArticleMode) {
		oRm.class("sapMGTArticleMode");
	}
	if (oControl._isIconMode()) {
		oRm.class("sapMGTIconMode");
		if (this._isThemeHighContrast()) {
			oRm.class("HighContrastTile");
		}
	}
	if (!bIsArticleMode && !bIsActionMode && !(oControl._isIconMode() && frameType === frameTypes.OneByOne) && (oControl.getSystemInfo() || oControl.getAppShortcut())) {
		oRm.class("tileWithAppInfo");
	}
	//Set respective Class/ BackgroundColor for IconMode
	if (oControl._isIconMode()) {
		if (frameType === frameTypes.TwoByHalf) {
			oRm.class("sapMGTTwoByHalf");
		} else if (frameType === frameTypes.OneByOne) {
			if (!this._isThemeHighContrast()) {
				oRm.style("background-color", sBGColor);
			} else {
				oRm.style("border-color", sBGColor);
				oRm.style("box-shadow", "0 0 0 1px" + sBGColor);
			}
		}
	}

	if (sAriaRole && !bRenderLink) {
		oRm.attr("role", sAriaRole);
	} else if (!bRenderLink) { // buttons only; <a> elements always have the default role
			oRm.attr("role", bHasPress ? "button" : "presentation");
	} else {
			oRm.attr("role", "link");
	}
	if (sState === LoadState.Loaded && (bHasPress || bRenderLink || sAriaRole)) {
		oRm.attr("aria-label", sAriaText);
	}
	if (sAriaRoleDescription) {
		oRm.attr("aria-roledescription", sAriaRoleDescription );
	}
	if (sState !== LoadState.Disabled) {
		if (!oControl.isInActionRemoveScope() && oControl.getPressEnabled()) {
			oRm.class("sapMPointer");
		}
		if (!oControl.getPressEnabled()) {
			oRm.class("sapMAutoPointer");
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
	var aTileContent = oControl.getTileContent();
	var iLength = aTileContent.length;
	if (this._isNewsContentPresent(aTileContent,iLength)){
		oRm.class("sapMGTNewsContent");
	}
	if (aLinkTileContent.length > 0) {
		oRm.class("sapMGTLinkTileContent");
	}
	oRm.openEnd();
	oRm.openStart("div");
	oRm.class("sapMGTContentWrapper");
	oRm.openEnd();
	if (sTooltipText) {
		oControl.getAggregation("_invisibleText").setText(sTooltipText);
		oRm.renderControl(oControl.getAggregation("_invisibleText"));
	}
	var isFooterPresent = false;
	var isContentPresent = false;
	function renderLoadingShimmerIconMode(oRm, bIsLoading) {
		if (frameType === frameTypes.OneByOne) {
			oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItemOneByOne");
			oRm.class("sapMGTContentShimmerPlaceholderWithDescriptionOneByOne");
			oRm.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderRowsOneByOne")
				.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderIconOneByOne")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			if (bIsLoading){
				oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderItemTextOneByOne")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			}
		} else {
			oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItemTwoByHalf");
			oRm.class("sapMGTContentShimmerPlaceholderWithDescriptionTwoByHalf");
			if (!oControl.getIconLoaded() && !bIsLoading) {
				oRm.class("sapMGTContentShimmerPlaceholderWithDescriptionTwoByHalfIconLoaded");
			}
			oRm.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderRowsTwoByHalf")
				.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderIconTwoByHalf")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			if (bIsLoading){
				oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderItemTextTwoByHalf")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			}
		}
		oRm.close("div");
		oRm.close("div");
	}
	if (sState === LoadState.Loading) {
		//Setplaceholders for IconMode.
		if (oControl._isIconMode()) {
			renderLoadingShimmerIconMode(oRm, true);
		} else {
			oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItem");
			oRm.class("sapMGTContentShimmerPlaceholderWithDescription");
			oRm.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderRows")
				.openEnd();
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderItemHeader")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			oRm.openStart("div")
				.class("sapMGTContentShimmerPlaceholderItemText")
				.class("sapMGTLoadingShimmer")
				.openEnd()
				.close("div");
			if (!isHalfFrame) {
				for (var i = 0; i < iLength; i++) {
					oRm.renderControl(aTileContent[i]);
				}
			}
			oRm.close("div");
			oRm.close("div");
		}
	} else {
		if (!bIsActionMode && this._isValueColorValid(oControl.getValueColor())) {
			oRm.openStart("div");
			oRm.class("sapMGTCriticalBorder");
			oRm.class(oControl.getValueColor());
			oRm.openEnd();
			oRm.close("div");
		}
		//Set respective Class/ BackgroundColor for IconMode
		if (oControl._isIconMode()) {
			if (!oControl.getIconLoaded()) {
				renderLoadingShimmerIconMode(oRm, false);
			} else {
				if (frameType === frameTypes.OneByOne) {
					oRm.openStart("div");
					oRm.class("sapMGTHideOverflow");
					oRm.openEnd();
					oRm.openStart("div");
					oRm.class("sapMGTIconWrapper");
					oRm.openEnd();
				}
				oRm.openStart("div");

				if (frameType === frameTypes.OneByOne) {
					oRm.class("sapMGTOneByOneIcon");
				} else {
					oRm.class("sapMGTTwoByHalfIcon");
					if (oControl._sTileBadge) {
						oRm.class("sapMGTIconBadge");
					} else if (!this._isThemeHighContrast()) {
							oRm.style("background-color", sBGColor);
					} else {
						oRm.class("HighContrastTile");
						oRm.style("border-color", sBGColor);
						oRm.style("box-shadow", "0 0 0 1px" + sBGColor);
					}
				}
				oRm.openEnd();
				if (oControl.getTileIcon() || oControl._sTileBadge) {
					var sAggregation = oControl._generateIconAggregation(oControl._sTileBadge ? "sap-icon://folder-full" : oControl.getTileIcon());
					if (sAggregation) {
						var oIcon = oControl.getAggregation(sAggregation);
						if (oControl._sTileBadge) {
							oIcon.setColor(sBGColor);
						}
						oRm.renderControl(oIcon);
					}
					if (oControl._sTileBadge) {
						oRm.openStart("div", oControl.getId() + "-tileBadge").class("sapMGTileBadge").openEnd();
						oRm.text(oControl._sTileBadge);
						oRm.close("div");
					}
				}
				oRm.close("div");
			}
		}

		//Wrapper div for adjusting to Info Container (IconMode TwoByHalf only)
		if (this._shouldRenderInfoContainer(oControl) && oControl._isIconMode() && frameType === frameTypes.TwoByHalf) {
			oRm.openStart("div", oControl.getId() + "-wrapper").class("sapMGTWrapper").openEnd();
			oRm.openStart("div", oControl.getId() + "-wrapper-content").class("sapMGTWrapperCnt").openEnd();
		}

		oRm.openStart("div",oControl.getId() + "-hdrContent");
		oRm.class("sapMGTHdrContent");

		if (oControl._isIconMode()) {
			if (frameType === frameTypes.OneByOne) {
				oRm.class("sapMGTOneByOne");

				if (!oControl.getIconLoaded()) {
					oRm.class("sapMGTOneByOneIconLoaded");
				}
			} else if (frameType === frameTypes.TwoByHalf) {
				oRm.class("TwoByHalf");
			}
		} else {
			oRm.class(frameType);
		}

		if (sTooltipText) {
			oRm.attr("title", sTooltipText);
		}
		if (bIsActionMode && oControl.getFrameType() === frameTypes.TwoByOne && sHeaderImage) {
			oRm.class("sapMGTHdrImage");
		}
		oRm.openEnd();

		//Render Header Image
		if (sHeaderImage) {
			var bIsIconFrameEnabled = oControl.isA("sap.m.ActionTile") && oControl.getProperty("enableIconFrame");
			if (!bIsIconFrameEnabled) {
				oControl._oImage.removeStyleClass(ValueColor.None);
				if (this._sPreviousStyleClass) {
					oControl._oImage.removeStyleClass(this._sPreviousStyleClass);
				}
				this._sPreviousStyleClass = this._isValueColorValid(oControl.getValueColor()) ? oControl.getValueColor() : ValueColor.None;
				oControl._oImage.addStyleClass(this._sPreviousStyleClass);
				oRm.renderControl(oControl._oImage);
			} else {
				var oIconFrame = oControl._getIconFrame();
				var bRenderFrameBadge = oControl.isA("sap.m.ActionTile") && oControl.getProperty("badgeIcon") && oControl.getProperty("badgeValueState") ? true : false;
				if (bRenderFrameBadge) {
					oIconFrame.setCustomDisplaySize("3rem");
				}

				oIconFrame.toggleStyleClass("sapMGTIconFrameBadge", bRenderFrameBadge);
				oRm.renderControl(oIconFrame);
			}
		}

		var bIsTilePriorityPresent = this._isPriorityPresent(oControl);
		if (bIsTilePriorityPresent) {
			oRm.openStart("div", oControl.getId() + "-header-container").class("sapMATHeaderContainer").openEnd();
		}

		this._renderHeader(oRm, oControl);

		if (oControl._isIconMode() && oControl.getIconLoaded() && frameType === frameTypes.OneByOne) {
			oRm.close("div");
			oRm.close("div");
		}

		for (var i = 0; i < iLength; i++) {
			isFooterPresent = oControl._checkFooter(aTileContent[i], oControl) && (aTileContent[i].getFooter() ||  aTileContent[i].getUnit());
			var oAggregationContent = aTileContent[i].getContent();
			if (oAggregationContent) {
				if (frameType === frameTypes.OneByHalf && oAggregationContent.getMetadata().getElementName() === "sap.m.ImageContent") {
					isContentPresent = false;
				} else {
					isContentPresent = true;
					break;
				}
			}
		}

		if (bIsTilePriorityPresent) {
			this._renderPriorityText(oRm, oControl);
		} else if (!(isHalfFrame && isContentPresent) && oControl.getSubheader()) {
			this._renderSubheader(oRm, oControl);
		}

		if (bIsTilePriorityPresent) {
			oRm.close("div");
		}

		var aTileContents = oControl.getTileContent();
		var oTileContent = Array.isArray(aTileContents) && aTileContents[0];
		var oContentPriorityBadge = oTileContent && oTileContent._getPriorityBadge();
		var oContentAdditionalPriorityBadge = oTileContent && oTileContent._getAdditionalPriorityBadge();

		// Render priority badges in header — only in ArticleMode. Hidden on desktop,
		// shown on mobile where the background image covers the tile body.
		if (bIsArticleMode && (oContentPriorityBadge || oContentAdditionalPriorityBadge)) {
			oRm.openStart("div", oControl.getId() + "-content-priority-badge").class("sapMGTBackgroundBadge").openEnd();
			if (oContentPriorityBadge) {
				oRm.renderControl(oContentPriorityBadge);
			}
			if (oContentAdditionalPriorityBadge) {
				oRm.renderControl(oContentAdditionalPriorityBadge);
			}
			oRm.close("div");
		}
		oRm.close("div");

		if ( !oControl._isIconMode() ) { //Restrict creation of Footer for IconMode
			oRm.openStart("div", oControl.getId() + "-content");
			oRm.class("sapMGTContent");
			if (frameType === frameTypes.TwoByOne) {
				oRm.class("TwoByOne");
			}
			if (oControl.getSystemInfo() || oControl.getAppShortcut()) {
				if (aTileContent.length === 0){
					oRm.class("appInfoWithoutTileCnt");
				}
				if (isFooterPresent && frameType !== frameTypes.OneByHalf) {
					oRm.class("appInfoWithFooter");
				} else {
					oRm.class("appInfoWithoutFooter");
				}
			}
			oRm.openEnd();
			if (aLinkTileContent.length > 0) {
				oRm.openStart("div", oControl.getId() + "-linkTileContent").class("sapMGTLinkTileContentWrapper");
				if (!oControl.getSubheader()) {
					oRm.class("saMGTLinkSubheaderNotPresent");
				}
				oRm.openEnd();
				for (var i = 0; i < aLinkTileContent.length; i++) {
					oRm.renderControl(aLinkTileContent[i].getLinkTileContentInstance());
				}
				oRm.close("div");
			}
			for (var i = 0; i < iLength; i++) {
				oRm.renderControl(aTileContent[i]);
			}

			//Render InfoContainer (for all tiles except IconMode TwoByHalf, which uses wrapper)
			if (this._shouldRenderInfoContainer(oControl) && !(oControl._isIconMode() && frameType === frameTypes.TwoByHalf)) {
				this._renderInfoContainer(oRm, oControl);
			}

			oRm.close("div");
		}

		//Render InfoContainer for IconMode TwoByHalf frame (after wrapper)
		if (this._shouldRenderInfoContainer(oControl) && oControl._isIconMode() && frameType === frameTypes.TwoByHalf) {
			oRm.close("div");
			this._renderInfoContainer(oRm, oControl);
			oRm.close("div");
		}

	}

	oRm.close("div"); // close sapMGTContentWrapper

	if (oControl._isActionMode() && oControl.getActionButtons().length > 0) {
		//Render Action Buttons, only in ActionMode and in TwoByOne frame type
		oRm.openStart("div", oControl.getId() + "-actionButtons");
		oRm.class("sapMGTActionModeContainer");
		oRm.openEnd();
		oControl.getActionButtons().forEach(function (oActionButton) {
			oRm.renderControl(oActionButton);
		});
		oRm.close("div");
	}

	if (sState !== LoadState.Loaded && sState !== LoadState.Loading) {
		this._renderStateOverlay(oRm, oControl, sTooltipText);
	}

	if (sState !== LoadState.Disabled) {
		this._renderHoverOverlay(oRm, oControl);
		this._renderFocusDiv(oRm, oControl);
	}

	if (oControl._isInActionScope()) {
		this._renderActionsScope(oRm, oControl);
	}
	if (oBadge && (oBadge.getSrc() || oBadge.getText()) && (!oControl._isInActionScope() || oControl._isIconModeOfTypeTwoByHalf() )) {
		this._renderBadge(oRm,oControl);
	}
	if (bRenderLink) {
		oRm.close("a");
	} else {
		oRm.close("div");
	}
};

/**
 * Renders a badge on top of GenericTile.
 * @param {sap.ui.core.RenderManager} oRm - The RenderManager instance.
 * @param {sap.m.GenericTile} oControl The GenericTile control
 * @private
 */

GenericTileRenderer._renderBadge = function(oRm,oControl) {
	var oBadge = oControl.getBadge();
	var sBadgeText = oBadge.getText();
	var bIsIconOnlyPresent = oBadge.getSrc() && !oBadge.getText();
	var bIsTextOnlyPresent = !oBadge.getSrc() && oBadge.getText();
	oRm.openStart("div");
	oRm.class("sapMGTBadge");
	oRm.class("sapMGTBadgeBackgroundColor" + oBadge.getBackgroundColor());
	oRm.class("sapMGTBadgeColor" + oBadge.getTextColor());
	oRm.class("sapMGTBadgeBorderColor" + oBadge.getBorderColor());
	if (oBadge.getText() && oBadge.getSrc()) {
		oRm.class("sapMGTBadgeTextPresent");
	}
	oRm.class((bIsIconOnlyPresent) ? "sapMGTBadgeOnlyIcon" : null);
	oRm.class((bIsTextOnlyPresent) ? "sapMGTBadgeOnlyText" : null);
	oRm.openEnd();
	if (oBadge.getSrc()) {
		oRm.renderControl(oControl._oBadgeIcon);
	}
	if (sBadgeText) {
		oRm.openStart("span");
		oRm.class("sapMGTBadgeText");
		oRm.openEnd();
		oRm.text(sBadgeText);
		oRm.close("span");
	}
	if (oControl.getState() != LoadState.Loaded) {
		oRm.openStart("div");
		oRm.class("sapMGTBadgeOverlay");
		oRm.class("sapMGTBadgeBackgroundColor" + oBadge.getBackgroundColor());
		oRm.openEnd();
		oRm.close("div");
	}
	oRm.close("div");
};

/**
 * Checks if the priority is present for a tile.
 * Applies only for ActionMode.
 *
 * @private
 * @param {object} oControl - The tile control instance.
 * @returns {boolean} - Returns true if the content priority is present; otherwise, returns false.
 */
GenericTileRenderer._isPriorityPresent = function (oControl) {
	return oControl.isA("sap.m.ActionTile") && oControl.getProperty("priority") && oControl.getProperty("priorityText");
};

/**
 * Renders the priority text for the tile.
 *
 * @private
 * @param {object} oRm - The RenderManager instance.
 * @param {object} oControl - The control instance to render.
 */
GenericTileRenderer._renderPriorityText = function (oRm, oControl) {
	oRm.openStart("div", oControl.getId() + "-priority-text");
	oRm.class("sapMTilePriorityValue");
	oRm.class(oControl.getProperty("priority"));
	oRm.openEnd();
	oRm.text(oControl.getProperty("priorityText"));
	oRm.close("div");
};

/**
 * Checks if the GenericTile should be draggable or not.
 * @param {sap.m.GenericTile} oControl The GenericTile control
 * @returns {boolean} True if the GenericTile is draggable, false otherwise
 * @private
 */
 GenericTileRenderer._isDragabble = function(oControl) {
	var bDraggable = oControl.getDragDropConfig().some(function(vDragDropInfo){
		return vDragDropInfo.isDraggable(oControl);
	});

	if (!bDraggable) {
		// also check parent config
		var oParent = oControl.getParent();
		if (oParent && oParent.getDragDropConfig) {
			bDraggable = oParent.getDragDropConfig().some(function(vDragDropInfo){
				return vDragDropInfo.isDraggable(oControl);
			});
		}
	}
	return bDraggable;
};

/**
 * Checks if the GenericTile should render the info container (appShortcut / systemInfo chip).
 * - ArticleMode and ActionMode: never rendered.
 * - IconMode: rendered only for TwoByHalf when at least one of appShortcut or systemInfo is set;
 *   not rendered for IconMode OneByOne (the transaction-code chip uses a separate path).
 * - All other modes (Normal/ContentMode): rendered for any frame type when at least one of
 *   appShortcut or systemInfo is set.
 * @param {sap.m.GenericTile} oControl The GenericTile control
 * @returns {boolean} True if the info container should be rendered, false otherwise
 * @private
 */
GenericTileRenderer._shouldRenderInfoContainer = function(oControl) {
	var frameType = oControl.getFrameType(),
		bIsArticleMode = oControl.getMode() === GenericTileMode.ArticleMode,
		bIsActionMode = oControl.getMode() === GenericTileMode.ActionMode,
		bIsIconMode = oControl.getMode() === GenericTileMode.IconMode;
	if (bIsArticleMode || bIsActionMode) {
		return false;
	}
	if (bIsIconMode) {
		// IconMode OneByOne: no info container; IconMode TwoByHalf: show info container when systemInfo or appShortcut set
		return frameType === frameTypes.TwoByHalf && !!(oControl.getAppShortcut() || oControl.getSystemInfo());
	}
	// Normal mode: hide info container when scope is Actions or ActionMore
	if (oControl.getScope() === GenericTileScope.Actions || oControl.getScope() === GenericTileScope.ActionMore) {
		return false;
	}
	// Normal mode: render info container for all frame types when systemInfo or appShortcut is present
	return !!(oControl.getSystemInfo() || oControl.getAppShortcut());
};

/**
 * Renders the info container holding the appShortcut and systemInfo Text controls.
 * For TwoByHalf IconMode tiles and all OneByHalf tiles the sapMGTTInfoInline class is
 * added to enable a flex-row (side-by-side) layout. TwoByHalf NumericContent and
 * ImageContent tiles render the values stacked vertically.
 * systemInfo is rendered first (left/top), appShortcut second (right/bottom).
 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.GenericTile} oControl The control that will be rendered
 * @private
 */
GenericTileRenderer._renderInfoContainer = function(oRm, oControl) {
	var bHasAppShortcut = !!oControl.getAppShortcut();
	var bHasSystemInfo = !!oControl.getSystemInfo();

	oRm.openStart("div", oControl.getId() + "-tInfo");
	oRm.class("sapMGTTInfoContainer");
	oRm.openEnd();

	oRm.openStart("div", oControl.getId() + "-tInfo-content");
	oRm.class("sapMGTTInfo");
	if ((oControl.getFrameType() === frameTypes.TwoByHalf && oControl._isIconMode()) ||
		oControl.getFrameType() === frameTypes.OneByHalf) {
		oRm.class("sapMGTTInfoInline");
	}
	oRm.openEnd();
	if (bHasSystemInfo) {
		oRm.openStart("div", oControl.getId() + "-sytemInfoWrapper");
		oRm.class("sapMGTSystemInfoText").openEnd();
		oRm.renderControl(oControl._oSystemInfo);
		oRm.close("div");
	}
	if (bHasAppShortcut) {
		oRm.openStart("div", oControl.getId() + "-appShortcutWrapper");
		oRm.class("sapMGTAppShortcutText").openEnd();
		oRm.renderControl(oControl._oAppShortcut);
		oRm.close("div");
	}
	oRm.close("div");

	oRm.close("div");
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
	if (sState === LoadState.Failed) {
		oRm.close("div");
	}
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
			oRm.renderControl(oControl._oErrorIcon);
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
	if (sState !== LoadState.Failed) {
		oRm.close("div");
	}
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
		if (oControl._isIconMode()) { //Set respective BorderRadius for IconMode
			if (oControl.getFrameType() === frameTypes.OneByOne) {
				oRm.style("border-radius", "1rem");
			} else {
				oRm.style("border-radius", "0.75rem");
			}
		}
	}
	oRm.openEnd();
	oRm.close("div");
};

/**
 * Renders the HTML for the header of the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @private
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.m.GenericTile} oControl an object representation of the control whose title should be rendered
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
 * @param {sap.m.GenericTile} oControl an object representation of the control whose description should be rendered
 */
GenericTileRenderer._renderSubheader = function(oRm, oControl) {
	oRm.openStart("div", oControl.getId() + "-subHdr-text");
	oRm.class("sapMGTSubHdrTxt");
	oRm.openEnd();
	oRm.renderControl(oControl._oSubTitle);
	oRm.close("div");
};

/**
 * Checks for valid value color
 *
 * @private
 */
 GenericTileRenderer._isValueColorValid = function(sValueColor) {
	if (sValueColor == ValueColor.Good || sValueColor == ValueColor.Error || sValueColor == ValueColor.Neutral || sValueColor == ValueColor.Critical) {
		return true;
	}
	return false;
};

/**
 * Checks whether the current theme is a high contrast theme like sap_belize_hcb or sap_belize_hcw.
 * @returns {boolean} True if the theme name contains hcb or hcw, false otherwise
 * @private
 */
GenericTileRenderer._isThemeHighContrast = function() {
	return /(hcw|hcb)/g.test(Theming.getTheme());
};

GenericTileRenderer._isNewsContentPresent = function(aTileContent,iLength) {
	var bIsPresent = false;
	for (var i = 0; i < iLength; i++) {
		var oAggregationContent = aTileContent[i].getContent();
		if (oAggregationContent && oAggregationContent.isA("sap.m.NewsContent")) {
			bIsPresent = true;
			break;
		}
	}
	return bIsPresent;
};

return GenericTileRenderer;

});
