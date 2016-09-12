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

		oRm.write("<span");
		oRm.writeControlData(oControl);
		oRm.addClass("sapMGT");
		oRm.addClass("sapMGTLineMode");

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

		oRm.write("<span");
		oRm.addClass("sapMGTHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-hdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl._oTitle.getText());
		oRm.write("</span>"); //.sapMGTHdrTxt

		oRm.write("<span");
		oRm.addClass("sapMGTSubHdrTxt");
		oRm.writeClasses();
		oRm.writeAttribute("id", oControl.getId() + "-subHdr-text");
		oRm.write(">");
		oRm.writeEscaped(oControl.getSubheader());

		oRm.write("<span");
		oRm.addClass("sapMGTSubHdrEndMarker");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</span>");

		oRm.write("</span>"); //.sapMGTSubHdrTxt

		//hover and press style helper
		oRm.write("<svg");
		oRm.addClass("sapMGTStyleHelper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</svg>");

		//rendering helper
		oRm.write("<div");
		oRm.addClass("sapMGTSizeHelper");
		oRm.writeClasses();
		oRm.write(">");
		oRm.write("</div>");

		oRm.write("</span>"); //.sapMGT
	};

	/**
	 * Handles the mouseenter event and calculates and draws all hover rects.
	 * These elements are then made visible in order to imitate a per-line box effect.
	 *
	 * @private
	 */
	GenericTileLineModeRenderer._updateHoverStyle = function() {
		var $this = this.$(),
			$StyleHelper = $this.find(".sapMGTStyleHelper"),
			$SizeHelper = $this.find(".sapMGTSizeHelper"),
			$SubHdr = this.$().find(".sapMGTSubHdrTxt"),
			$SubHdrEnd = this.$().find(".sapMGTSubHdrEndMarker"),
			iBarOffsetLeft,
			iBarPaddingTop = Math.ceil(GenericTileLineModeRenderer._getCSSHeight(this, "margin-top")),
			iBarWidth,
			iParentWidth = this.getParent().$().outerWidth(),
			iHeight = Math.floor(this.$().height()),
			cHeight = GenericTileLineModeRenderer._getCSSHeight(this, "line-height"), //height including gap between lines
			cLineHeight = Math.ceil(GenericTileLineModeRenderer._getCSSHeight(this, "min-height")), //line height
			cWrappedLineIndent = 2, //0.5rem(padding-left) - 0.375rem(wrapped padding) = 0.125rem = 2px
			iLines = Math.round(iHeight / cHeight),
			i = 0,
			sRectTemplate = "<rect class='sapMGTStyleRect' x='$x' y='$y' width='$w' height='" + cLineHeight + "' />",
			sRect,
			iLeftOffset = $SizeHelper.offset().left - this.getParent().$().offset().left, //get offset relative to parent
			iSubhdrLeftOffset = $SubHdr.offset().left,
			iSubhdrWidth = $SubHdr.width(),
			iRadiusLeft, iRadiusRight;

		$StyleHelper.empty();

		for (i; i < iLines; i++) {
			//set bar width
			if (iLines === 1) { //first and only line
				iBarOffsetLeft = iLeftOffset;
				iBarWidth = (iSubhdrLeftOffset - iLeftOffset) + iSubhdrWidth;
			} else if (i === iLines - 1) { //last line
				iBarOffsetLeft = cWrappedLineIndent;
				iBarWidth = $SubHdrEnd.offset().left - iBarOffsetLeft;
			} else if (i === 0) { //first line
				iBarOffsetLeft = iLeftOffset;
				iBarWidth = iParentWidth - iLeftOffset - cWrappedLineIndent;
			} else {
				iBarOffsetLeft = cWrappedLineIndent;
				iBarWidth = iParentWidth - (cWrappedLineIndent * 2);
			}
			sRect = sRectTemplate.replace("$w", iBarWidth);
			sRect = sRect.replace("$x", iBarOffsetLeft);
			sRect = sRect.replace("$y", i * cHeight + iBarPaddingTop);

			//set rounded corner radii
			iRadiusLeft = iRadiusRight = 0;
			if (i === 0) { //first line
				iRadiusLeft = 3; //3px
			}
			if (i === iLines - 1) { //last line
				iRadiusRight = 3; //3px
			}

			$StyleHelper.append("<svg>" + GenericTileLineModeRenderer._createRoundedRectPath(sRect, iRadiusLeft, iRadiusRight) + "</svg>"); //wrap element in svg tag to make the browser interpret it
		}

		$StyleHelper.find("svg > *").unwrap(); //remove svg tag from all rects
		$StyleHelper.css("left", -iLeftOffset + "px");
		$StyleHelper.css("width", iParentWidth + "px").css("height", (iLines * cHeight) + "px");
		$StyleHelper.find(".sapMGTStyleRect").width(); //enforce re-layouting to enable css transition
		$StyleHelper.find(".sapMGTStyleRect").addClass("sapMGTStyleRectHover");
	};

	/**
	 * Handles the mouseout event and removes the class sapMGTStyleRectHover from all hover rects.
	 *
	 * @param {jQuery.event} evt
	 * @private
	 */
	GenericTileLineModeRenderer._removeHoverStyle = function(evt) {
		var $this = this.$(),
			$StyleHelper = $this.find(".sapMGTStyleHelper");

		$StyleHelper.find(".sapMGTStyleRect").removeClass("sapMGTStyleRectHover");
	};

	/**
	 * Converts a rect element to a path with rounded corners.
	 *
	 * @param {string} rect The rect element as an HTML string.
	 * @param {int} rLeft The top-left and bottom-left radius for rounded corners.
	 * @param {int} rRight The top-right and bottom-right radius for rounded corners.
	 * @returns {string} The path element as an HTML string.
	 * @private
	 */
	GenericTileLineModeRenderer._createRoundedRectPath = function(rect, rLeft, rRight) {
		var $Rect = jQuery(rect),
			$Path = jQuery("<path />"),
			x = parseFloat($Rect.attr("x")),
			y = parseFloat($Rect.attr("y")),
			w = parseFloat($Rect.attr("width")),
			h = parseFloat($Rect.attr("height"));
		rLeft = rLeft || 0;
		rRight = rRight || 0;

		var sData = "M" + x + " " + (y + rLeft) + " ";
		sData += "a" + rLeft + " " + rLeft + " 0, 0, 1, " + rLeft + "," + -rLeft + " ";
		sData += "h " + (w - rLeft - rRight) + " ";
		sData += "a" + rRight + " " + rRight + " 0, 0, 1, " + rRight + "," + rRight + " ";
		sData += "v " + (h - (rRight * 2)) + " ";
		sData += "a" + rRight + " " + rRight + " 0, 0, 1, " + -rRight + "," + rRight + " ";
		sData += "h " + -(w - rLeft - rRight) + " ";
		sData += "a" + rLeft + " " + rLeft + " 0, 0, 1, " + -rLeft + "," + -rLeft + " Z";

		$Path.get(0).className = $Rect.get(0).className; //copy classes
		$Path.attr("d", sData);
		return $Path.outerHTML();
	};

	/**
	 * Calculates the line-height of the passed tile from its css property. If the line-height is given in pixels, it is directly returned.
	 * If the line-height is given as rem, it is converted to pixels.
	 *
	 * @param {sap.m.GenericTile} tile The tile the line-height is to be retrieved of.
	 * @param {string} property The CSS property to be read and converted.
	 * @returns {float} The line-height in pixels.
	 * @private
	 */
	GenericTileLineModeRenderer._getCSSHeight = function(tile, property) {
		var aMatch = tile.$().css(property).match(/([^a-zA-Z\%]*)(.*)/),
			fValue = parseFloat(aMatch[1]),
			sUnit = aMatch[2];
		return (sUnit === "px") ? fValue : fValue * 16;
	};

	return GenericTileLineModeRenderer;

}, /* bExport= */true);
