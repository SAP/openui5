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

		if (bIsCompact) {
			//compact
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

		} else {
			// cozy
			this._renderFocusDiv(oRm, oControl);

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

			oRm.write("</div>"); //.sapMGTTouchArea
		}

		oRm.write("</span>"); //.sapMGT
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
	 * Removes and re-calculates the style helpers used in compact mode for hover and focus display.
	 *
	 * @private
	 */
	GenericTileLineModeRenderer._updateHoverStyle = function() {
		this._oStyleData = this._getStyleData();
		var $StyleHelper = this.$("styleHelper"),
			oLine,
			i = 0,
			sHelpers = "";

		if (this._oStyleData.rtl && sap.ui.Device.browser.mozilla) {
			$StyleHelper.css("right", -this._oStyleData.startX + "px");
		} else if (this._oStyleData.rtl && !(sap.ui.Device.browser.msie || sap.ui.Device.browser.edge)) {
			$StyleHelper.css("right", -Math.min(this._oStyleData.startX, this._oStyleData.endX) + "px");
		}

		$StyleHelper.empty();
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

			sHelpers += $Rect.outerHTML();
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
