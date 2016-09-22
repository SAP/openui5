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
		var sTooltipText = oControl._getTooltipText();
		this._bRTL = sap.ui.getCore().getConfiguration().getRTL();

		oRm.write("<span");
		oRm.writeControlData(oControl);
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
		this._renderSubheader(oRm, oControl);

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
	};

	GenericTileLineModeRenderer._writeDirection = function(oRm) {
		if (this._bRTL) {
			oRm.writeAttribute("dir", "rtl");
		}
	};

	GenericTileLineModeRenderer._renderFailedIcon = function(oRm, oControl) {
		if (oControl.getState() === LoadState.Failed) {
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
		var $StyleHelper = this.$("styleHelper"),
			iBarOffsetX, iBarOffsetY,
			iBarPaddingTop = Math.ceil(GenericTileLineModeRenderer._getCSSHeight(this, "margin-top")),
			iBarWidth,
			iParentWidth = this.getParent().$().outerWidth(),
			iParentLeft = this.getParent().$().offset().left,
			iParentRight = iParentLeft + iParentWidth,
			iHeight = Math.floor(this.$().height()),
			cHeight = GenericTileLineModeRenderer._getCSSHeight(this, "line-height"), //height including gap between lines
			cLineHeight = Math.ceil(GenericTileLineModeRenderer._getCSSHeight(this, "min-height")), //line height
			iLines = Math.round(iHeight / cHeight),
			i = 0,
			sHelpers,
			$Rect,
			bRTL = sap.ui.getCore().getConfiguration().getRTL(),
			iPosEnd = this.$("endMarker").offset().left,
			iOffset = this.$("startMarker").offset().left;

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
			//set bar width
			if (iLines === 1) { //first and only line
				iBarOffsetX = iOffset;
				iBarWidth = iPosEnd - iBarOffsetX;
			} else if (i === iLines - 1) { //last line
				iBarOffsetX = 0;
				iBarWidth = iPosEnd - iBarOffsetX;
			} else if (i === 0) { //first line
				iBarOffsetX = iOffset;
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
	 * @param {sap.m.GenericTile|jQuery} tile The tile the CSS property is to be retrieved of.
	 * @param {string} property The CSS property to be read and converted.
	 * @returns {float} The property value in pixels.
	 * @private
	 */
	GenericTileLineModeRenderer._getCSSHeight = function(tile, property) {
		var $Obj = tile instanceof jQuery ? tile : tile.$(),
			aMatch = ($Obj.css(property) || "").match(/([^a-zA-Z\%]*)(.*)/),
			fValue = parseFloat(aMatch[1]),
			sUnit = aMatch[2];
		return (sUnit === "px") ? fValue : fValue * 16;
	};

	return GenericTileLineModeRenderer;

}, /* bExport= */true);
