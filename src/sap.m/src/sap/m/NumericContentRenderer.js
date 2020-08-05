/*!
 * @copyright@
 */

sap.ui.define([
	"sap/m/library"
], function (library) {
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
		var sState = oControl.getState();
		var bWithMargin = oControl.getWithMargin();
		var sWithoutMargin = bWithMargin ? "" : "WithoutMargin";
		oRm.write("<div");
		oRm.writeControlData(oControl);
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.writeAttributeEscaped("aria-label", sTooltip);
		oRm.writeAttribute("role", "img");

		if (sState === library.LoadState.Failed || sState === library.LoadState.Loading) {
			oRm.writeAttribute("aria-disabled", "true");
		}
		if (oControl.getAnimateTextChange()) {
			oRm.addClass("sapMNCAnimation");
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
		this._renderValue(oRm, oControl, sWithoutMargin);
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
	 * @param {String} sNumericContentFontClass font class of related NumericContent
	 * @private
	 */
	NumericContentRenderer._prepareAndRenderIcon = function (oRm, oControl, oIcon, sNumericContentFontClass) {
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

			var mSizeClasses = {
				sapMNCLargeFontSize: false,
				sapMNCMediumFontSize: false,
				sapMNCSmallFontSize: false
			};
			mSizeClasses[sNumericContentFontClass] = true;
			Object.keys(mSizeClasses).forEach(function (sKey) {
				oIcon.toggleStyleClass(sKey, mSizeClasses[sKey]);
			});

			oRm.renderControl(oIcon);
		}
	};

	/**
	 * Renders the HTML for the ScaleInd of the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control whose title should be rendered
	 * @param {String} sWithoutMargin
	 * @param {String} sValue
	 * @param {String} sScale
	 * @param {String} sNumericContentFontClass font class of related NumericContent
	 */
	NumericContentRenderer._renderScaleAndIndicator = function(oRm, oControl, sWithoutMargin, sValue, sScale, sNumericContentFontClass) {
		var bIndicator = library.DeviationIndicator.None !== oControl.getIndicator() && sValue !== "";
		var bScale = sScale && sValue;
		if (bIndicator || bScale) {
			var sState = oControl.getState();
			var sColor = oControl.getValueColor();
			oRm.write("<div");
			oRm.writeAttribute("id", oControl.getId() + "-indicator");
			oRm.addClass("sapMNCIndScale");
			oRm.addClass(sWithoutMargin);
			oRm.addClass(sColor);
			oRm.addClass(sState);
			if (sNumericContentFontClass) {
				oRm.addClass(sNumericContentFontClass);
			}
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oControl._oIndicatorIcon);

			if (bScale) {
				oRm.write("<div");
				oRm.writeAttribute("id", oControl.getId() + "-scale");
				oRm.addClass("sapMNCScale");
				oRm.addClass(sState);
				oRm.addClass(sColor);
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sScale);

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
	 * @param {String} sWithoutMargin
	 */
	NumericContentRenderer._renderValue = function(oRm, oControl, sWithoutMargin) {
		var sValue = oControl.getValue();
		var sScale = oControl.getScale();
		if (oControl.getFormatterValue()) {
			var oFormattedValue = oControl._parseFormattedValue(sValue);
			sScale = oFormattedValue.scale;
			sValue = oFormattedValue.value;
		}
		var sEmptyValue = oControl.getNullifyValue() ? "0" : "";
		oRm.write("<div");
		oRm.writeAttribute("id", oControl.getId() + "-value");
		oRm.addClass("sapMNCValue");
		oRm.addClass(sWithoutMargin);
		oRm.addClass(oControl.getValueColor());
		oRm.addClass(oControl.getState());
		oRm.writeClasses();
		oRm.write(">");

		var oMaxDigitsData = oControl._getMaxDigitsData();
		this._prepareAndRenderIcon(oRm, oControl, oControl._oIcon, oMaxDigitsData.fontClass);

		var iChar = oControl.getTruncateValueTo() || oMaxDigitsData.maxLength;
		oRm.write("<span id=\"" + oControl.getId() + "-value-inner\"");
		if (oMaxDigitsData.fontClass) {
			oRm.addClass(oMaxDigitsData.fontClass);
		}
		oRm.writeClasses();
		oRm.write(">");

		//Control shows only iChar characters. If the last shown character is decimal separator - show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
		if (sValue.length >= iChar && (sValue[iChar - 1] === "." || sValue[iChar - 1] === ",")) {
			oRm.writeEscaped(sValue.substring(0, iChar - 1));
		} else {
			oRm.writeEscaped(sValue ? sValue.substring(0, iChar) : sEmptyValue);
		}

		oRm.write("</span>");

		this._renderScaleAndIndicator(oRm, oControl, sWithoutMargin, sValue, sScale, oMaxDigitsData.fontClass);

		oRm.write("</div>");
	};

	return NumericContentRenderer;
}, /* bExport= */true);
