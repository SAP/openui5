/*!
 * @copyright@
 */

sap.ui.define([
	"sap/m/library"
], function (library) {
	"use strict";

	var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	var ValueColor = library.ValueColor;

	/**
	 * NumericContent renderer.
	 * @namespace
	 */
	var NumericContentRenderer = {
		apiVersion : 2  // enable in-place DOM patching
	};

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
		oRm.openStart("div" , oControl);
		var sTooltip = oControl.getTooltip_AsString();
		if (typeof sTooltip !== "string") {
			sTooltip = "";
		}

		oRm.attr("aria-label", sTooltip);
		oRm.attr("role", "img");
		oRm.attr("aria-roledescription", oResourceBundle.getText("NUMERIC_CONTENT_ROLE_DESCRIPTION"));

		if (sState === library.LoadState.Failed || sState === library.LoadState.Loading) {
			oRm.attr("aria-disabled", "true");
		}
		if (oControl.getAnimateTextChange()) {
			oRm.class("sapMNCAnimation");
		}
		if (oControl.getWidth()) {
			oRm.style("width", oControl.getSize());

		}
		oRm.class("sapMNC");
		oRm.class(sWithoutMargin);
		if (oControl.hasListeners("press")) {
			oRm.attr("tabindex", 0);
			oRm.class("sapMPointer");
		}
		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapMNCInner");
		oRm.class(sWithoutMargin);
		oRm.openEnd();
		this._renderValue(oRm, oControl, sWithoutMargin);
		oRm.close("div");
		oRm.close("div");

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
			oRm.openStart("div", oControl.getId() + "-indicator");
			oRm.class("sapMNCIndScale");
			oRm.class(sWithoutMargin);
			oRm.class(sState);
			oRm.class(sState);

			if (sNumericContentFontClass) {
				oRm.class(sNumericContentFontClass);
			}
			oRm.openEnd();

			oRm.renderControl(oControl._oIndicatorIcon);

			if (bScale) {
				oRm.openStart("div", oControl.getId() + "-scale");
				oRm.class("sapMNCScale");
				oRm.class(sState);
				oRm.class(sColor);
				oRm.openEnd();
				oRm.text(sScale);

				oRm.close("div");
			}

			oRm.close("div");
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
		oRm.openStart("div", oControl.getId() + "-value");
		oRm.class("sapMNCValue");
		oRm.class(sWithoutMargin);
		if (oControl.getValueColor() === ValueColor.None) {
			oRm.class(oResourceBundle.getText("SEMANTIC_COLOR_NEUTRAL"));
		} else {
			oRm.class(oControl.getValueColor());
		}
		oRm.class(oControl.getState());
		oRm.openEnd();

		var oMaxDigitsData = oControl._getMaxDigitsData();
		this._prepareAndRenderIcon(oRm, oControl, oControl._oIcon, oMaxDigitsData.fontClass);

		var iChar = oControl.getTruncateValueTo() || oMaxDigitsData.maxLength;
	    oRm.openStart("span" , oControl.getId() + "-value-inner");
		if (oMaxDigitsData.fontClass) {
			oRm.class(oMaxDigitsData.fontClass);
		}
		oRm.openEnd();

		//Control shows only iChar characters. If the last shown character is decimal separator - show only first N-1 characters. So "144.5" is shown like "144" and not like "144.".
		if (sValue.length >= iChar && (sValue[iChar - 1] === "." || sValue[iChar - 1] === ",")) {
			oRm.text(sValue.substring(0, iChar - 1));
		} else {
			oRm.text(sValue ? sValue.substring(0, iChar) : sEmptyValue);
		}

		oRm.close("span");

		this._renderScaleAndIndicator(oRm, oControl, sWithoutMargin, sValue, sScale, oMaxDigitsData.fontClass);

		oRm.close("div");
	};

	return NumericContentRenderer;
}, /* bExport= */true);
