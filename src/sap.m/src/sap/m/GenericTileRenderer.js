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

	var ValueColor = library.ValueColor;

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
		var isHalfFrame = frameType === frameTypes.OneByHalf || frameType === frameTypes.TwoByHalf;

		// Render a link when URL is provided, not in action scope and the state is enabled
		var bRenderLink = oControl.getUrl() && !oControl._isInActionScope() && sState !== LoadState.Disabled && !oControl._isNavigateActionEnabled() && !oControl._isActionMode();

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
		if (!bIsArticleMode && !bIsActionMode && frameType !== frameTypes.OneByHalf && (oControl.getSystemInfo() || oControl.getAppShortcut())) {
			oRm.class("tileWithAppInfo");
		}
		//Set respective Class/ BackgroundColor for IconMode
		if (oControl._isIconMode()) {
			if (frameType === frameTypes.TwoByHalf) {
				oRm.class("sapMGTTwoByHalf");
			} else if (frameType === frameTypes.OneByOne) {
				if (!this._isThemeHighContrast()) {
					oRm.style("background-color", oControl.getBackgroundColor());
				} else {
					oRm.style("border-color", oControl.getBackgroundColor());
					oRm.style("box-shadow", "0 0 0 1px" + oControl.getBackgroundColor());
				}
			}
		}

		if (sAriaRole) {
			oRm.attr("role", sAriaRole);
		} else if (!bRenderLink) { // buttons only; <a> elements always have the default role
				oRm.attr("role", bHasPress ? "button" : "presentation");
		} else {
				oRm.attr("role", "link");
		}
		if (sState === LoadState.Loaded) {
			oRm.attr("aria-label", sAriaText);
				}
		if (sAriaRoleDescription) {
			oRm.attr("aria-roledescription", sAriaRoleDescription );
		} else {
			oRm.attr("aria-roledescription", oRb.getText("GENERIC_TILE_ROLE_DESCRIPTION"));
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
		oRm.openEnd();
		var aTileContent = oControl.getTileContent();
		var iLength = aTileContent.length;
		var isFooterPresent = false;
		var isContentPresent = false;
		if (sState === LoadState.Loading) {
			//Setplaceholders for IconMode.
			if ( oControl._isIconMode() ) {
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
					oRm.openStart("div")
						.class("sapMGTContentShimmerPlaceholderItemTextOneByOne")
						.class("sapMGTLoadingShimmer")
						.openEnd()
						.close("div");
				} else {
					oRm.openStart("div").class("sapMGTContentShimmerPlaceholderItemTwoByHalf");
					oRm.class("sapMGTContentShimmerPlaceholderWithDescriptionTwoByHalf");
					oRm.openEnd();
					oRm.openStart("div")
						.class("sapMGTContentShimmerPlaceholderRowsTwoByHalf")
						.openEnd();
					oRm.openStart("div")
						.class("sapMGTContentShimmerPlaceholderIconTwoByHalf")
						.class("sapMGTLoadingShimmer")
						.openEnd()
						.close("div");
					oRm.openStart("div")
						.class("sapMGTContentShimmerPlaceholderItemTextTwoByHalf")
						.class("sapMGTLoadingShimmer")
						.openEnd()
						.close("div");
				}
				oRm.close("div");
				oRm.close("div");
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
				oRm.openStart("div");
				if (frameType === frameTypes.OneByOne) {
					oRm.class("sapMGTOneByOneIcon");
				} else {
					oRm.class("sapMGTTwoByHalfIcon");
					if (!this._isThemeHighContrast()) {
						oRm.style("background-color", oControl.getBackgroundColor());
					} else {
						oRm.class("HighContrastTile");
						oRm.style("border-color", oControl.getBackgroundColor());
						oRm.style("box-shadow", "0 0 0 1px" + oControl.getBackgroundColor());
					}
				}
				oRm.openEnd();
				if (oControl.getTileIcon()) {
					var sAggregation = oControl._generateIconAggregation(oControl.getTileIcon());
					if (sAggregation) {
						oRm.renderControl(oControl.getAggregation(sAggregation));
					}
				}
				oRm.close("div");
			}

			//Wrapper div for adjusting to Info Container
			if (this._shouldRenderInfoContainer(oControl) && frameType === frameTypes.TwoByHalf) {
				oRm.openStart("div", oControl.getId() + "-wrapper").class("sapMGTWrapper").openEnd();
				oRm.openStart("div", oControl.getId() + "-wrapper-content").class("sapMGTWrapperCnt").openEnd();
			}

			oRm.openStart("div");
			oRm.class("sapMGTHdrContent");
			if (oControl._isIconMode() ){
				if (frameType === frameTypes.OneByOne) {
					var sClass = "sapMGTOneByOne";
				} else if (frameType === frameTypes.TwoByHalf) {
					var sClass = "TwoByHalf";
				}
			}
			oRm.class(oControl._isIconMode()	? sClass : frameType);
			if (sTooltipText) {
				oRm.attr("title", sTooltipText);
			}
			if (bIsActionMode && oControl.getFrameType() === frameTypes.TwoByOne && sHeaderImage) {
				oRm.class("sapMGTHdrImage");
			}
			oRm.openEnd();

			//Render Header Image
			if (sHeaderImage) {
				oControl._oImage.removeStyleClass(ValueColor.None);
				if (this._sPreviousStyleClass) {
					oControl._oImage.removeStyleClass(this._sPreviousStyleClass);
				}
				this._sPreviousStyleClass = this._isValueColorValid(oControl.getValueColor()) ? oControl.getValueColor() : ValueColor.None;
				oControl._oImage.addStyleClass(this._sPreviousStyleClass);

				oRm.renderControl(oControl._oImage);
			}

			this._renderHeader(oRm, oControl);
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

			if (!(isHalfFrame && isContentPresent)) {
				if (oControl.getSubheader()) {
					//Restrict creation of SubHeader for IconMode & OneByOne frameType
					if (!(oControl._isIconMode() && oControl.getFrameType() == frameTypes.OneByOne)) {
						this._renderSubheader(oRm, oControl);
					}
				}
			}

			oRm.close("div");

			if ( !oControl._isIconMode() ) { //Restrict creation of Footer for IconMode
				oRm.openStart("div", oControl.getId() + "-content");
				oRm.class("sapMGTContent");
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
				for (var i = 0; i < iLength; i++) {
					oRm.renderControl(aTileContent[i]);
				}

				//Render InfoContainer except for TwoByHalf frame
				if (this._shouldRenderInfoContainer(oControl) && frameType !== frameTypes.TwoByHalf) {
					this._renderInfoContainer(oRm, oControl);
				}

				oRm.close("div");
			}

			//Render InfoContainer for TwoByHalf frame
			if (this._shouldRenderInfoContainer(oControl) && frameType === frameTypes.TwoByHalf) {
				oRm.close("div");
				this._renderInfoContainer(oRm, oControl);
				oRm.close("div");
			}
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
		if (bRenderLink) {
			oRm.close("a");
		} else {
			oRm.close("div");
		}
	};

	/**
	 * Checks if the GenericTile should render the info container.
	 * @param {sap.m.GenericTile} oControl The GenericTile control
	 * @returns {boolean} True if the info container should be rendered, false otherwise
	 * @private
	 */
	GenericTileRenderer._shouldRenderInfoContainer = function(oControl) {
		var frameType = oControl.getFrameType(),
			bIsArticleMode = oControl.getMode() === GenericTileMode.ArticleMode,
			bIsActionMode = oControl.getMode() === GenericTileMode.ActionMode,
			bIsIconMode = oControl.getMode() === GenericTileMode.IconMode;
			if (frameType === frameTypes.OneByOne && bIsIconMode){
				return true;
			}
		return !bIsArticleMode && !bIsActionMode && !bIsIconMode && frameType !== frameTypes.OneByHalf && (oControl.getSystemInfo() || oControl.getAppShortcut());
	};

	/**
	 * Renders the Info Container.
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.GenericTile} oControl The control that will be rendered
	 * @private
	 */
	GenericTileRenderer._renderInfoContainer = function(oRm, oControl) {
		oRm.openStart("div", oControl.getId() + "-tInfo");
		oRm.class("sapMGTTInfoContainer");
		oRm.openEnd();
		oRm.openStart("div", oControl.getId() + "-tInfo-content");
		oRm.class("sapMGTTInfo");
		oRm.openEnd();
		if (oControl.getAppShortcut()) {
			oRm.openStart("div", oControl.getId() + "-appShortcut");
			oRm.class("sapMGTAppShortcutText").openEnd();
			oRm.renderControl(oControl._oAppShortcut);
			oRm.close("div");
		}
		if (oControl.getSystemInfo()) {
			oRm.openStart("div", oControl.getId() + "-sytemInfo");
			if (oControl.getAppShortcut() && oControl.getSystemInfo()){
				oRm.class("sapMGTMarginTop4px");
			}
			oRm.class("sapMGTSystemInfoText").openEnd();
			oRm.renderControl(oControl._oSystemInfo);
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
		if (oControl._isActionMode() && this._isValueColorValid(oControl.getValueColor())) {
			oRm.class("sapMGTCriticalHdrTxt");
			oRm.class(oControl.getValueColor());
		}
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
		return /(hcw|hcb)/g.test(sap.ui.getCore().getConfiguration().getTheme());
	};

	return GenericTileRenderer;

}, /* bExport= */true);
