/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/theming/Parameters",
	"sap/m/IllustratedMessage"
], function(MLibrary, Core, ThemeParameters, IllustratedMessage) {
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
	 * @param {float} [mSettings.gap=0] The additional content width in rem
	 * @returns {float} The calculated width of the ODataType converted to rem
	 * @private
	 */
	Util.calcTypeWidth = (function() {
		var fBooleanWidth = 0;
		var aDateParameters = [2023, 9, 26, 22, 47, 58, 999];
		var oUTCDate = new Date(Date.UTC.apply(0, aDateParameters));
		var oLocalDate = new (Function.prototype.bind.apply(Date, [null].concat(aDateParameters)))();
		var mNumericLimits = { Byte: 3, SByte: 3, Int16: 5, Int32: 9, Int64: 12, Single: 6, Float: 12, Double: 13, Decimal: 15, Integer: 9 };
		Core.attachThemeChanged(function() { fBooleanWidth = 0; });

		return function(oType, mSettings) {

			var sType = oType.getMetadata().getName().split(".").pop();
			var iMaxWidth = mSettings && mSettings.maxWidth || 19;
			var iGap = mSettings && mSettings.gap || 0;
			var applySettings = function(fCalculatedWidth) {
				return Math.min(fCalculatedWidth + iGap, iMaxWidth);
			};

			if (sType == "Boolean") {
				if (!fBooleanWidth) {
					var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.core");
					var fYesWidth = Util.measureText(oResourceBundle.getText("YES"));
					var fNoWidth = Util.measureText(oResourceBundle.getText("NO"));
					fBooleanWidth = Math.max(fYesWidth, fNoWidth);
				}
				return applySettings(fBooleanWidth);
			}

			if (sType == "String" || oType.isA("sap.ui.model.odata.type.String")) {
				var iMaxLength = parseInt(oType.getConstraints().maxLength) || 0;
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
				return applySettings(Math.min(fWidth, fSampleWidth));
			}

			if (sType.startsWith("Date") || sType.startsWith("Time")) {
				var mFormatOptions = oType.getFormatOptions();
				var oDate = mFormatOptions.UTC ? oUTCDate : oLocalDate;
				var sSample = oDate.toLocaleDateString();

				if (sType == "TimeOfDay") {
					sSample = new Intl.DateTimeFormat("de", {hour: "numeric", minute: "numeric", second: "numeric"}).format(oDate);
					sSample = oType.formatValue(sSample, "string");
				} else if (oType.isA("sap.ui.model.odata.type.Time")) {
					sSample = oType.formatValue({ __edmType: "Edm.Time", ms: oUTCDate.valueOf() }, "string");
				} else {
					sSample = oType.formatValue(mFormatOptions.interval ? [oDate, new Date(oDate * 1.009)] : oDate, "string");
					((oType.oFormat && oType.oFormat.oFormatOptions && oType.oFormat.oFormatOptions.pattern) || "").replace(/[MELVec]{3,4}/, function(sWideFormat) {
						sSample += (sWideFormat.length == 4 ? "---" : "-");
					});
				}
				return applySettings(Util.measureText(sSample));
			}

			if (mNumericLimits[sType]) {
				var iScale = parseInt(oType.getConstraints().scale) || 0;
				var iPrecision = parseInt(oType.getConstraints().precision) || 20;
				iPrecision = Math.min(iPrecision, mNumericLimits[sType]);
				var sNumber = 2 * Math.pow(10, iPrecision - iScale - 1);
				sNumber = oType.formatValue(sNumber, "string");
				return applySettings(Util.measureText(sNumber));
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

	/**
	 * Calculates the width of a table column.
	 *
	 * @param {sap.ui.model.odata.type.ODataType[]} vTypes The ODataType instances
	 * @param {string} [sHeader] The header of the column
	 * @param {object} [mSettings] The settings object
	 * @param {int} [mSettings.minWidth=2] The minimum content width of the field in rem
	 * @param {int} [mSettings.maxWidth=19] The maximum content width of the field in rem
	 * @param {int} [mSettings.padding=1] The sum of column padding and border in rem
	 * @param {float} [mSettings.gap=0] The additional content width in rem
	 * @param {boolean} [mSettings.verticalArrangement=false] Whether the fields are arranged vertically
	 * @param {int} [mSettings.defaultWidth=8] The default column content width when type check fails
	 * @returns {string} The calculated width of the column
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc, sap.ui.comp
	 * @since 1.101
	 */
	Util.calcColumnWidth = function(vTypes, sHeader, mSettings) {
		if (!Array.isArray(vTypes)) {
			vTypes = [vTypes];
		}

		mSettings = Object.assign({
			minWidth: 2,
			maxWidth: 19,
			defaultWidth: 8,
			padding: 1,
			gap: 0,
			verticalArrangement: false
		}, mSettings);

		var fHeaderWidth = 0;
		var iMinWidth = Math.max(1, mSettings.minWidth);
		var iMaxWidth = Math.max(iMinWidth, mSettings.maxWidth);

		var fContentWidth = mSettings.gap + vTypes.reduce(function(fInnerWidth, vType) {
			var oType = vType, oTypeSettings = mSettings;

			if (Array.isArray(vType)) {
				// for internal usage (mdc/Table) every field can provide own width settings
				// in this case we get [<TypeInstance>, <TypeSettings>][] instead of <TypeInstance>[]
				oType = vType[0];
				oTypeSettings = vType[1] || mSettings;
			}

			var fTypeWidth = Util.calcTypeWidth(oType, oTypeSettings);
			return mSettings.verticalArrangement ? Math.max(fInnerWidth, fTypeWidth) : fInnerWidth + fTypeWidth + (fInnerWidth && 0.5);
		}, 0);

		if (sHeader) {
			fHeaderWidth = Util.calcHeaderWidth(sHeader, fContentWidth, iMaxWidth, iMinWidth);
		}

		fContentWidth = Math.max(iMinWidth, fContentWidth, fHeaderWidth);
		fContentWidth = Math.min(fContentWidth, iMaxWidth);
		fContentWidth = Math.round(fContentWidth * 100) / 100;

		return fContentWidth + mSettings.padding + "rem";
	};

	/**
	 * Returns an instance of <code>sap.m.IllustratedMessage</code> in case there are no visible columns in the table.
	 *
	 * @returns {sap.m.IllustratedMessage} The message to be displayed when the table has no visible columns
	 * @private
	 */
	Util.getNoColumnsIllustratedMessage = function() {
		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		return new IllustratedMessage({
			illustrationType: MLibrary.IllustratedMessageType.AddColumn,
			title: oResourceBundle.getText("TABLE_NO_COLUMNS_TITLE"),
			description: oResourceBundle.getText("TABLE_NO_COLUMNS_DESCRIPTION")
		});
	};

	return Util;

});
