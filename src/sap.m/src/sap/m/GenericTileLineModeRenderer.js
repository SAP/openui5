/*!
 * ${copyright}
 */

sap.ui.define(["sap/m/library", "sap/base/security/encodeCSS", "sap/ui/thirdparty/jquery"],
	function(library, encodeCSS, jQuery) {
	"use strict";

	// shortcut for sap.m.GenericTileScope
	var GenericTileScope = library.GenericTileScope;

	// shortcut for sap.m.LoadState
	var LoadState = library.LoadState;

	/**
	 * GenericTileLineMode renderer.
	 * @namespace
	 */
	var GenericTileLineModeRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.GenericTile} oControl the control to be rendered
	 */
	GenericTileLineModeRenderer.render = function(oRm, oControl) {
		var sTooltipText = oControl._getTooltipText(),
			bIsScreenLarge = oControl._isScreenLarge(),
			sAriaText = oControl._getAriaText(),
			sScope = oControl.getScope(),
			sScopeClass,
			bIsSingleAction = false,
			bHasPress = oControl.hasListeners("press");
		this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (sScope === GenericTileScope.Actions) {
			sScopeClass = encodeCSS("sapMGTScopeActions");
		} else if (sScope === GenericTileScope.ActionMore || sScope === GenericTileScope.ActionRemove) {
			bIsSingleAction = true;
			sScopeClass = encodeCSS("sapMGTScopeSingleAction");
		} else {
			sScopeClass = encodeCSS("sapMGTScopeDisplay");
		}

		if (oControl.getUrl() && !oControl._isInActionScope()) {
			oRm.write("<a");
			oRm.writeAttributeEscaped("href", oControl.getUrl());
		} else {
			oRm.write("<span");
		}
		oRm.writeControlData(oControl);
		oRm.writeAttributeEscaped("aria-label", sAriaText);
		if (bHasPress) {
			if (oControl.getUrl() && !oControl._isInActionScope()) {
				oRm.writeAttribute("role", "link");
			} else {
				oRm.writeAttribute("role", "button");
			}
		} else {
			oRm.writeAttribute("role", "presentation");
		}
		oRm.addClass("sapMGT");
		oRm.addClass(sScopeClass);
		oRm.addClass("sapMGTLineMode");
		this._writeDirection(oRm);
		if (sTooltipText) {
			oRm.writeAttributeEscaped("title", sTooltipText);
		}

		var sState = oControl.getState();
		if (sState !== LoadState.Disabled) {
			oRm.addClass("sapMPointer");
			oRm.writeAttribute("tabindex", "0");
		} else {
			oRm.addClass("sapMGTDisabled");
		}
		if (sState === LoadState.Failed) {
			oRm.addClass("sapMGTFailed");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (bIsScreenLarge) {
			//large
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-startMarker");
			oRm.addClass("sapMGTStartMarker");
			oRm.writeClasses();
			oRm.write("></div>");

			this._renderFailedIcon(oRm, oControl);
			this._renderHeader(oRm, oControl);
			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-endMarker");
			oRm.addClass("sapMGTEndMarker");
			oRm.writeClasses();
			oRm.write(">");

			if (oControl._isInActionScope()) {
				this._renderActionsScope(oRm, oControl, bIsSingleAction);
			}

			oRm.write("</div>");

			//hover and press style helper
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-styleHelper");
			oRm.addClass("sapMGTStyleHelper");
			oRm.writeClasses();
			oRm.write("></div>");

		} else {
			// small
			if (oControl.getState() !== LoadState.Disabled) {
				this._renderFocusDiv(oRm, oControl);
			}

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-touchArea");
			oRm.addClass("sapMGTTouchArea");
			oRm.writeClasses();
			oRm.write(">");

			this._renderFailedIcon(oRm, oControl);

			oRm.write("<span");
			oRm.writeAttribute("id", oControl.getId() + "-lineModeHelpContainer");
			oRm.addClass("sapMGTLineModeHelpContainer");
			oRm.writeClasses();
			oRm.write(">");

			this._renderHeader(oRm, oControl);

			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}
			oRm.write("</span>"); //.sapMGTLineModeHelpContainer

			if (oControl._isInActionScope()) {
				this._renderActionsScope(oRm, oControl, bIsSingleAction);
			}

			oRm.write("</div>"); //.sapMGTTouchArea
		}

		if (oControl.getUrl() && !oControl._isInActionScope()) {
			oRm.write("</a>");
		} else {
			oRm.write("</span>"); //.sapMGT
		}
	};

	GenericTileLineModeRenderer._writeDirection = function(oRm) {
		if (this._bRTL) {
			oRm.writeAttribute("dir", "rtl");
		}
	};

	GenericTileLineModeRenderer._renderFailedIcon = function(oRm, oControl) {
		if (oControl.getState() === LoadState.Failed) {
			if (oControl._isCompact()) {
				oControl._oWarningIcon.setSize("1.25rem");
			} else {
				oControl._oWarningIcon.setSize("1.375rem");
			}
			oRm.renderControl(oControl._oWarningIcon.addStyleClass("sapMGTLineModeFailedIcon"));
		}
	};

	GenericTileLineModeRenderer._renderHeader = function(oRm, oControl) {
		oRm.write("<span");
		this._writeDirection(oRm);
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl._oTitle.getText());
		oRm.write("</span>");
	};

	GenericTileLineModeRenderer._renderSubheader = function(oRm, oControl) {
		oRm.write("<span");
		this._writeDirection(oRm);
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl._oSubTitle.getText());
		oRm.write("</span>");
	};

	GenericTileLineModeRenderer._renderActionsScope = function(oRm, oControl, bIsSingleAction) {
		if (oControl.getState() !== LoadState.Disabled) {
			oRm.write("<span");
			oRm.writeAttribute("id", oControl.getId() + "-actions");
			oRm.addClass("sapMGTActionsContainer");

			if (bIsSingleAction) {
				oRm.addClass("sapMGTScopeSingleActionContainer");
			}

			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oControl._oMoreIcon);
			oRm.renderControl(oControl._oRemoveButton);

			oRm.write("</span>");
		}
	};

	/**
	 * Removes and re-calculates the style helpers used in compact mode for hover and focus display.
	 *
	 * @private
	 */
	GenericTileLineModeRenderer._updateHoverStyle = function() {
		var $StyleHelper = this.$("styleHelper"),
			oLine,
			i = 0,
			sHelpers = "";

		//empty the style helper even if there is no style data available in order to guarantee a clean display without artifacts
		$StyleHelper.empty();

		if (!this._oStyleData || this.$().is(":hidden")) {
			return;
		}

		if (this._oStyleData.rtl) {
			$StyleHelper.css("right", -this._oStyleData.positionRight);
		} else {
			$StyleHelper.css("left", -this._oStyleData.positionLeft);
		}

		for (i; i < this._oStyleData.lines.length; i++) {
			oLine = this._oStyleData.lines[i];

			var $Rect = jQuery("<div class='sapMGTLineStyleHelper'><div class='sapMGTLineStyleHelperInner' /></div>");
			if (this._oStyleData.rtl) {
				$Rect.css("right", oLine.offset.x + "px");
			} else {
				$Rect.css("left", oLine.offset.x + "px");
			}
			$Rect.css({
				top: oLine.offset.y + "px",
				width: oLine.width + "px",
				height: oLine.height
			});

			sHelpers += $Rect.get(0).outerHTML.trim();
		}

		$StyleHelper.html(sHelpers);
	};

	/**
	 * Renders a helper used in cozy mode for focus display.
	 *
	 * @private
	 */
	GenericTileLineModeRenderer._renderFocusDiv = function(oRm, oControl) {
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-focus");
		oRm.addClass("sapMGTFocusDiv");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");
	};

	/**
	 * Calculates the given property of the passed tile. If the property is retrieved in pixels, it is directly returned.
	 * If the property is given as rem, it is converted to pixels.
	 *
	 * @param {sap.m.GenericTile|jQuery} obj The object the CSS property is to be retrieved of.
	 * @param {string} property The CSS property to be read and converted.
	 * @returns {float} The property value in pixels.
	 * @private
	 */
	GenericTileLineModeRenderer._getCSSPixelValue = function(obj, property) {
		var $Obj = obj instanceof jQuery ? obj : obj.$(),
			aMatch = ($Obj.css(property) || "").match(/([^a-zA-Z\%]*)(.*)/),
			fValue = parseFloat(aMatch[1]),
			sUnit = aMatch[2];
		return (sUnit === "px") ? fValue : fValue * 16;
	};

	return GenericTileLineModeRenderer;

}, /* bExport= */true);
