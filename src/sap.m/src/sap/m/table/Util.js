/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/theming/Parameters"
], function(MLibrary, Core, ThemeParameters) {
	"use strict";
	/*global Intl*/

	/**
	 * Provides utility functions for tables.
	 * @namespace
	 * @alias module:sap/m/table/Util
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.96.0
	 * @private
	 * @experimental Since 1.96.0. This class is experimental and the API might be changed in future.
	 */
	var Util = {};

	// local privates
	var sDefaultFont = "";
	var fBaseFontSize = parseFloat(MLibrary.BaseFontSize);

	/**
	 * Measures the given text width in a canvas and returns the value in rem.
	 *
	 * @param {string} sText The text to be measured
	 * @param {string} [sFont] The font. When not given, uses theme parameters: sapMFontMediumSize and sapUiFontFamily.
	 * @returns {float} The text width converted to rem
	 * @private
	 */
	Util.measureText = (function() {
		var fEpsilon = 0.05;
		var oCanvasContext = document.createElement("canvas").getContext("2d");
		var fnSetDefaultFont = function() {
			sDefaultFont = [
				parseFloat(ThemeParameters.get({ name: "sapMFontMediumSize" }) || "0.875rem") * fBaseFontSize + "px",
				ThemeParameters.get({ name: "sapUiFontFamily" }) || "Arial"
			].join(" ");
			return sDefaultFont;
		};

		Core.attachThemeChanged(fnSetDefaultFont);

		return function(sText, sFont) {
			oCanvasContext.font = sFont || sDefaultFont || fnSetDefaultFont();
			return oCanvasContext.measureText(sText || "").width / fBaseFontSize + fEpsilon;
		};
	})();


	/**
	 * Calculates the width of a given ODataType that is used in tables.
	 *
	 * @param {sap.ui.model.odata.type.ODataType} oType The ODataType instance
	 * @param {object} [mSettings] The settings object
	 * @param {int} [mSettings.maxWidth=19] The maximum content width of the field in rem
	 * @param {int} [mSettings.defaultWidth=8] The default column content width when type check fails
	 * @returns {float} The calculated width of the ODataType converted to rem
	 * @private
	 */
	Util.calcTypeWidth = (function() {
		var fBooleanWidth = 0;
		var aDateParameter = [2023, 9, 26, 22, 47, 58, 999];
		var oUTCDate = new Date(Date.UTC.apply(0, aDateParameter));
		var oLocalDate = new (Function.prototype.bind.apply(Date, [null].concat(aDateParameter)))();
		var mNumericLimits = { Byte: 3, SByte: 3, Int16: 5, Int32: 9, Int64: 12, Single: 6, Float: 12, Double: 13, Decimal: 15 };
		Core.attachThemeChanged(function() { fBooleanWidth = 0; });

		return function(oType, mSettings) {

			var sType = oType.getMetadata().getName().split(".").pop();

			if (sType == "Boolean") {
				if (!fBooleanWidth) {
					var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.core");
					var fYesWidth = Util.measureText(oResourceBundle.getText("YES"));
					var fNoWidth = Util.measureText(oResourceBundle.getText("NO"));
					fBooleanWidth = Math.max(fYesWidth, fNoWidth);
				}
				return fBooleanWidth;
			}

			if (sType == "String" || oType.isA("sap.ui.model.odata.type.String")) {
				var iMaxWidth = mSettings && mSettings.maxWidth || 19;
				var iMaxLength = oType.getConstraints().maxLength || 0;

				if (!iMaxLength) {
					return Math.max(Math.min(10, iMaxWidth), iMaxWidth * 0.75);
				}
				if (iMaxLength * 0.25 > iMaxWidth) {
					return iMaxWidth;
				}

				var fSampleWidth = Util.measureText("A".repeat(iMaxLength));
				if (iMaxLength < iMaxWidth || iMaxWidth < 10) {
					return Math.min(fSampleWidth, iMaxWidth);
				}

				var fWidth = Math.log(fSampleWidth - iMaxWidth * 0.16) / Math.log(iMaxWidth / 3) * (iMaxWidth / 2) * Math.pow(iMaxWidth / 19, 1 / fSampleWidth);
				return Math.min(fWidth, fSampleWidth, iMaxWidth);
			}

			if (sType.startsWith("Date") || sType.startsWith("Time")) {
				var oDate = oType.getFormatOptions().UTC ? oUTCDate : oLocalDate;
				var sSample = oDate.toLocaleDateString();

				if (sType == "TimeOfDay") {
					sSample = new Intl.DateTimeFormat('de', {hour: 'numeric', minute: 'numeric', second: 'numeric'}).format(oDate);
					sSample = oType.formatValue(sSample, "string");
				} else if (oType.isA("sap.ui.model.odata.type.Time")) {
					sSample = oType.formatValue({ __edmType: "Edm.Time", ms: oUTCDate.valueOf() }, "string");
				} else {
					sSample = oType.formatValue(oDate, "string");
				}
				return Util.measureText(sSample);
			}

			if (mNumericLimits[sType]) {
				var iScale = oType.getConstraints().scale || 0;
				var iPrecision = oType.getConstraints().precision || 20;
				iPrecision = Math.min(iPrecision, mNumericLimits[sType]);
				var sNumber = 2 * Math.pow(10, iPrecision - iScale - 1);
				sNumber = oType.formatValue(sNumber, "string");
				return Util.measureText(sNumber);
			}

			return mSettings && mSettings.defaultWidth || 8;
		};

	})();

	/**
	 * Calculates the width of the column header width according to calculated cell content and min/max width restrictions.
	 *
	 * @param {string} sHeader The header text
	 * @param {float} fContentWidth The calculated width of the cell in rem
	 * @param {int} [iMaxWidth=19] The maximum header width in rem
	 * @param {int} [iMinWidth=2] The minimum header width in rem
	 * @returns {float} The calculated header width in rem
	 * @private
	 */
	Util.calcHeaderWidth = (function() {
		var sHeaderFont = "";
		var fnGetHeaderFont = function() {
			if (!sHeaderFont) {
				sHeaderFont = [ThemeParameters.get({ name: "sapUiColumnHeaderFontWeight" }) || "normal", sDefaultFont].join(" ");
			}
			return sHeaderFont;
		};

		Core.attachThemeChanged(function() { sHeaderFont = ""; });

		return function(sHeader, fContentWidth, iMaxWidth, iMinWidth) {
			var iHeaderLength = sHeader.length;
			iMaxWidth = iMaxWidth || 19;
			iMinWidth = iMinWidth || 2;

			if (fContentWidth > iMaxWidth) {
				return iMaxWidth;
			}
			if (iMinWidth > iHeaderLength) {
				return iMinWidth;
			}

			fContentWidth = Math.max(fContentWidth, iMinWidth);
			if (fContentWidth > iHeaderLength) {
				return fContentWidth;
			}

			var fOrigHeaderWidth = Util.measureText(sHeader, fnGetHeaderFont());
			fOrigHeaderWidth = Math.min(fOrigHeaderWidth, iMaxWidth * 0.7);

			var fContentHeaderRatio = Math.max(1, 1 - (Math.log(Math.max(fContentWidth - 1.7, 0.2)) / Math.log(iMaxWidth * 0.5)) + 1);
			var fMaxHeaderWidth = fContentHeaderRatio * fContentWidth;

			var fHeaderWidthDiff = Math.max(0, fOrigHeaderWidth - fMaxHeaderWidth);
			var fHeaderWidth = (fHeaderWidthDiff < 0.15) ? fOrigHeaderWidth : fMaxHeaderWidth + fHeaderWidthDiff * (1 - 1 / fContentWidth) / Math.E;
			return fHeaderWidth;
		};
	})();

	return Util;

});
