/*!
 * ${copyright}
 */

sap.ui.define([ "sap/m/GenericTileRenderer", "sap/m/LoadState" ],
	function(TileRenderer, LoadState) {
	"use strict";

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
			bIsCompact = oControl._isCompact(),
			sAriaText = oControl._getAriaText(),
			bHasPress = oControl.hasListeners("press");
		this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

		if (bIsCompact) {
			//compact
			oRm.write("<span");
			oRm.writeControlData(oControl);
			oRm.writeAttributeEscaped("aria-label", sAriaText);
			if (bHasPress) {
				oRm.writeAttribute("role", "button");
			} else {
				oRm.writeAttribute("role", "presentation");
			}
			oRm.addClass("sapMGT");
			oRm.addClass("sapMGTLineMode");
			this._writeDirection(oRm);
			if (sTooltipText) {
				oRm.writeAttributeEscaped("title", sTooltipText);
			}
			if (oControl.getState() !== LoadState.Disabled) {
				oRm.addClass("sapMPointer");
				oRm.writeAttribute("tabindex", "0");
			} else {
				oRm.addClass("sapMGTDisabled");
			}
			oRm.writeClasses();
			oRm.write(">");
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-startMarker");
			oRm.addClass("sapMGTStartMarker");
			oRm.writeClasses();
			oRm.write("/>");

			this._renderFailedIcon(oRm, oControl);
			this._renderHeader(oRm, oControl);
			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-endMarker");
			oRm.addClass("sapMGTEndMarker");
			oRm.writeClasses();
			oRm.write("/>");

			//hover and press style helper
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-styleHelper");
			oRm.addClass("sapMGTStyleHelper");
			oRm.writeClasses();
			oRm.write("/>");
			oRm.write("</span>"); //.sapMGT

		} else {
			// cozy
			oRm.write("<span");
			oRm.writeControlData(oControl);
			oRm.writeAttributeEscaped("aria-label", sAriaText);
			if (bHasPress) {
				oRm.writeAttribute("role", "button");
			} else {
				oRm.writeAttribute("role", "presentation");
			}
			oRm.addClass("sapMGT");
			oRm.addClass("sapMGTLineMode");
			this._writeDirection(oRm);
			if (sTooltipText) {
				oRm.writeAttributeEscaped("title", sTooltipText);
			}
			if (oControl.getState() !== LoadState.Disabled) {
				oRm.addClass("sapMPointer");
				oRm.writeAttribute("tabindex", "0");
			} else {
				oRm.addClass("sapMGTDisabled");
			}
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.addClass("sapMGTTouchArea");
			oRm.writeClasses();
			oRm.write(">");

			this._renderFailedIcon(oRm, oControl);

			oRm.write("<span");
			oRm.addClass("sapMGTLineModeHelpContainer");
			oRm.writeClasses();
			oRm.write(">");

			this._renderHeader(oRm, oControl);

			if (oControl.getSubheader()) {
				this._renderSubheader(oRm, oControl);
			}

			oRm.write("</span>"); //.sapMGTLineModeHelpContainer

			oRm.write("</div>"); //.sapMGTTouchArea

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
		if (this._bRTL && sap.ui.Device.browser.mozilla) {
			oRm.write(" ");
		}
		oRm.write("</span>");
	};

	GenericTileLineModeRenderer._renderSubheader = function(oRm, oControl) {
		oRm.write("<span");
		this._writeDirection(oRm);
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());
		oRm.write("</span>");
	};

	/**
	 * Renders the style helper elements for LineMode.
	 * These elements are used in order to imitate a per-line box effect.
	 *
	 * @private
	 */
	GenericTileLineModeRenderer._updateHoverStyle = function() {
		this.removeStyleClass("sapMGTNewLine"); //remove this class before the new calculation begins in order to have the "default state" of tile-breaks

		var $StyleHelper = this.$("styleHelper"),
			$End = this.$("endMarker"),
			$Start =  this.$("startMarker"),
			iBarOffsetX, iBarOffsetY,
			iBarPaddingTop = Math.ceil(GenericTileLineModeRenderer._getCSSPixelValue(this, "margin-top")),
			iBarWidth,
			iParentWidth = this.$().parent().outerWidth(),
			iParentLeft = this.$().parent().offset().left,
			iParentRight = iParentLeft + iParentWidth,
			iHeight = Math.round($End.offset().top - $Start.offset().top),
			cHeight = GenericTileLineModeRenderer._getCSSPixelValue(this, "line-height"), //height including gap between lines
			cLineHeight = Math.ceil(GenericTileLineModeRenderer._getCSSPixelValue(this, "min-height")), //line height
			iLines = Math.round(iHeight / cHeight) + 1,
			bLineBreak = this.$().is(":not(:first-child)") && iLines > 1,
			i = 0,
			sHelpers,
			$Rect,
			bRTL = sap.ui.getCore().getConfiguration().getRTL(),
			iPosEnd = $End.offset().left,
			iOffset = $Start.offset().left;

		if (bLineBreak) { //tile does not fit in line without breaking --> add line-break before tile
			this.addStyleClass("sapMGTNewLine");
			iPosEnd = $End.offset().left;
			iHeight = $End.offset().top - $Start.offset().top;
			iLines = Math.round(iHeight / cHeight) + 2; //+ first empty line
		}

		if (bRTL) {
			iOffset = iParentRight - iOffset;
			iPosEnd = iParentRight - iPosEnd;

			if (sap.ui.Device.browser.mozilla) {
				$StyleHelper.css("right", -iOffset + "px");
			} else if (!(sap.ui.Device.browser.msie || sap.ui.Device.browser.edge)) {
				$StyleHelper.css("right", -Math.min(iOffset, iPosEnd) + "px");
			}
		} else {
			iOffset -= iParentLeft;
			iPosEnd -= iParentLeft;
		}

		$StyleHelper.empty();

		sHelpers = "";
		for (i; i < iLines; i++) {
			if (bLineBreak && i === 0) {
				continue;
			}

			//set bar width
			if (iLines === 1) { //first and only line
				iBarOffsetX = iOffset;
				iBarWidth = iPosEnd - iBarOffsetX;
			} else if (i === iLines - 1) { //last line
				iBarOffsetX = 0;
				iBarWidth = iPosEnd - iBarOffsetX;
			} else if (i === 0) { //first line for non-wrapped tile
				iBarOffsetX = iOffset;
				iBarWidth = iParentWidth - iBarOffsetX;
			} else if (bLineBreak && i === 1) { //first line for wrapped tile
				iBarOffsetX = 0;
				iBarWidth = iParentWidth - iBarOffsetX;
			} else {
				iBarOffsetX = 0;
				iBarWidth = iParentWidth;
			}
			iBarOffsetY = i * cHeight + iBarPaddingTop;

			$Rect = jQuery("<div class='sapMGTLineStyleHelper'><div class='sapMGTLineStyleHelperInner' /></div>");
			if (bRTL) {
				$Rect.css("right", iBarOffsetX + "px");
			} else {
				$Rect.css("left", iBarOffsetX + "px");
			}
			$Rect.css({
				top: iBarOffsetY + "px",
				width: iBarWidth + "px",
				height: cLineHeight
			});
			sHelpers += $Rect.outerHTML();
		}
		$StyleHelper.html(sHelpers);
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
