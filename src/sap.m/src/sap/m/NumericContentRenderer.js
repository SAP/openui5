/*!
 * @copyright@
 */

sap.ui.define([ './library' ],
	function(library) {
	"use strict";

	/**
	 * NumericContent renderer.
	 * @namespace
	 */
	var NumericContentRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	NumericContentRenderer.render = function(oRm, oControl) {
		var sValue = oControl.getValue();
		var sIndicator = oControl.getIndicator();
		var sScale = oControl.getScale();
		var sState = oControl.getState();
		var bIndicator = library.DeviationIndicator.None !== sIndicator && sValue !== "";
		var bWithMargin = oControl.getWithMargin();
		var sWithoutMargin;
		if (bWithMargin) {
			sWithoutMargin = "";
		} else {
			sWithoutMargin = "WithoutMargin";
		}
		if (oControl.getFormatterValue()) {
			var oFormattedValue = oControl._parseFormattedValue(sValue);
			sScale = oFormattedValue.scale;
			sValue = oFormattedValue.value;
		}
		var bScale = sScale && sValue;
		oRm.write("<div");
		oRm.writeControlData(oControl);
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.writeAttributeEscaped("aria-label", sTooltip);
		oRm.writeAttribute("role", "img");

		if (sState == library.LoadState.Failed || sState == library.LoadState.Loading) {
			oRm.writeAttribute("aria-disabled", "true");
		}
		if (oControl.getAnimateTextChange()) {
			oRm.addStyle("opacity", "0.25");
		}
		if (oControl.getWidth()) {
			oRm.addStyle("width", oControl.getWidth());
		}
		oRm.writeStyles();
		oRm.addClass("sapMNC");
		oRm.addClass(sWithoutMargin);
		if (oControl.hasListeners("press")) {
			oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapMPointer");
		}
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapMNCInner");
		oRm.addClass(sWithoutMargin);
		oRm.writeClasses();
		oRm.write(">");
		if (bWithMargin) {
			this._renderScaleAndIndicator(oRm, oControl, bIndicator, bScale, sWithoutMargin, sIndicator, sScale);
			this._renderValue(oRm, oControl, sWithoutMargin, sValue);
		} else {
			this._renderValue(oRm, oControl, sWithoutMargin, sValue);
			this._renderScaleAndIndicator(oRm, oControl, bIndicator, bScale, sWithoutMargin, sIndicator, sScale);
		}
		oRm.write("</div>");

		oRm.write("</div>");
	};

	/**
	 * Adds missing style attributes to the icon due to a different property initialization order in Internet Explorer
	 * in comparison to Chrome.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param {sap.ui.core.Icon} oIcon the icon inside the control
	 * @private
	 */
	NumericContentRenderer._prepareAndRenderIcon = function(oRm, oControl, oIcon) {
		if (oIcon) {
			var sState,
			oLoadState = library.LoadState,
			sCurrentState = oControl.getState();

			//remove state classes from icon and only add the current state's class
			for (sState in oLoadState) {
				if (oLoadState.hasOwnProperty(sState) && sState !== sCurrentState) {
					oIcon.removeStyleClass(sState);
				} else if (oLoadState.hasOwnProperty(sState) && sState === sCurrentState) {
					oIcon.addStyleClass(sState);
				}
			}

			oIcon.addStyleClass("sapMNCIconImage");
			oRm.renderControl(oIcon);
		}
	};

	/**
	 * Renders the HTML for the ScaleInd of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 * @param {boolean} isIndicator
	 * @param {boolean} isScale
	 * @param {String} withoutMargin
	 * @param {String} textIndicator
	 * @param {String} textScale
	 */
	NumericContentRenderer._renderScaleAndIndicator = function(oRm, oControl, isIndicator, isScale, withoutMargin, textIndicator, textScale) {
		if (isIndicator || isScale) {
			var sState = oControl.getState();
			var sColor = oControl.getValueColor();
			oRm.write("<div");
			oRm.addClass("sapMNCIndScale");
			oRm.addClass(withoutMargin);
			oRm.addClass(sState);
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-indicator");
			oRm.addClass("sapMNCIndicator");
			oRm.addClass(textIndicator);
			oRm.addClass(sState);
			oRm.addClass(sColor);
			oRm.writeClasses();
			oRm.write("/>");

			if (isScale) {
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-scale");
				oRm.addClass("sapMNCScale");
				oRm.addClass(sState);
				oRm.addClass(sColor);
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(textScale.substring(0, 3));
				oRm.write("</div>");
			}

			oRm.write("</div>");
		}
	};

	/**
	 * Renders the HTML for the ScaleInd of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 * @param {String} withoutMargin
	 * @param {String} value
	 */
	NumericContentRenderer._renderValue = function(oRm, oControl, withoutMargin, value) {
		var sEmptyValue;
		if (oControl.getNullifyValue()) {
			sEmptyValue = "0";
		} else {
			sEmptyValue = "";
		}
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-value");
		oRm.addClass("sapMNCValue");
		oRm.addClass(withoutMargin);
		oRm.addClass(oControl.getValueColor());
		oRm.addClass(oControl.getState());
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-value-scr");
		oRm.addClass("sapMNCValueScr");
		oRm.addClass(withoutMargin);
		oRm.writeClasses();
		oRm.write(">");

		this._prepareAndRenderIcon(oRm, oControl, oControl._oIcon);

		var iChar = oControl.getTruncateValueTo();
		//Control shows only iChar characters. If the last shown character is decimal separator - show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
		if (value.length >= iChar && (value[iChar - 1] === "." || value[iChar - 1] === ",")) {
			oRm.writeEscaped(value.substring(0, iChar - 1));
		} else {
			if (value) {
				oRm.writeEscaped(value.substring(0, iChar));
			} else {
				oRm.writeEscaped(sEmptyValue);
			}
		}

		oRm.write("</div>");
		oRm.write("</div>");
	};

	return NumericContentRenderer;
}, /* bExport= */true);
