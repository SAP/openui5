/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library",
	"sap/ui/core/Core",
	"sap/ui/core/LocaleData",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/Parameters",
	"sap/m/IllustratedMessage",
	"sap/m/Button",
	"sap/ui/core/InvisibleMessage"
], function(MLibrary, Core, LocaleData, Theming, ThemeParameters, IllustratedMessage, Button, InvisibleMessage) {
	"use strict";
	/*global Intl*/

	/**
	 * Provides utility functions for tables.
	 *
	 * @namespace
	 * @alias module:sap/m/table/Util
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.96.0
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc, sap.ui.comp
	 */
	var Util = {};

	// local privates
	var sDefaultFont = "";
	var fBaseFontSize = parseFloat(MLibrary.BaseFontSize);
	var oSelectAllNotificationPopover = null;
	var pGetSelectAllPopover = null;

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

		Theming.attachApplied(fnSetDefaultFont);

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
		const oTimezones = LocaleData.getInstance(Core.getConfiguration().getLocale()).getTimezoneTranslations();
		let sLongestTimezone;
		var fBooleanWidth = 0;
		var aDateParameters = [2023, 9, 26, 22, 47, 58, 999];
		var oUTCDate = new Date(Date.UTC.apply(0, aDateParameters));
		var oLocalDate = new (Function.prototype.bind.apply(Date, [null].concat(aDateParameters)))();
		var mNumericLimits = { Byte: 3, SByte: 3, Int16: 5, Int32: 9, Int64: 12, Single: 6, Float: 12, Double: 13, Decimal: 15, Integer: 9 };
		Theming.attachApplied(function() { fBooleanWidth = 0; });

		const getLongestTimezone = function() {
			if (!sLongestTimezone) {
				[sLongestTimezone] = Object.entries(oTimezones).reduce(([sTimezone, iLength], [sKey, sValue]) => {
					return typeof sValue === "string" && sValue.length > iLength ? [sKey, sValue.length] : [sTimezone, iLength];
				}, ["", 0]);
			}
			return sLongestTimezone;
		};

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
				if (!iMaxLength || iMaxLength * 0.25 > iMaxWidth) {
					return iMaxWidth;
				}

				var fSampleWidth = Util.measureText("A".repeat(iMaxLength));
				if (iMaxLength < iMaxWidth || iMaxWidth < 10) {
					return applySettings(fSampleWidth);
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
				} else if (oType.isA("sap.ui.model.odata.type.DateTimeWithTimezone")) {

					// Use IANA timezone with highest translated length
					sSample = oType.formatValue([oDate, getLongestTimezone()], "string");
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
	 * @param {float} [fContentWidth] The calculated width of the cell in rem
	 * @param {int} [iMaxWidth=19] The maximum header width in rem
	 * @param {int} [iMinWidth=2] The minimum header width in rem
	 * @param {boolean} [bRequired=false] Determines whether the given column header is marked as required
	 * @returns {float} The calculated header width in rem
	 * @private
	 * @ui5-restricted sap.ui.comp
	 */
	Util.calcHeaderWidth = (function() {
		var sHeaderFont = "";
		var sRequiredFont = "";
		var fnGetHeaderFont = function() {
			if (!sHeaderFont) {
				sHeaderFont = [ThemeParameters.get({ name: "sapUiColumnHeaderFontWeight" }) || "normal", sDefaultFont].join(" ");
			}
			return sHeaderFont;
		};
		var fnGetRequiredFont = function() {
			if (!sRequiredFont) {
				sRequiredFont = [ThemeParameters.get({ name: "sapMFontLargeSize" }) || "normal", sDefaultFont].join(" ");
			}
			return sRequiredFont;
		};

		Theming.attachApplied(function() {
			sHeaderFont = "";
			sRequiredFont = "";
		});

		return function(sHeader, fContentWidth, iMaxWidth, iMinWidth, bRequired) {
			var iHeaderLength = sHeader.length;
			var fRequired = 0;
			iMaxWidth = iMaxWidth || 19;
			iMinWidth = iMinWidth || 2;

			if (fContentWidth > iMaxWidth) {
				return iMaxWidth;
			}
			if (iMinWidth > iHeaderLength) {
				return iMinWidth;
			}

			if (bRequired) {
				fRequired = 0.125 /* margin */ + Util.measureText("*", fnGetRequiredFont());
			}

			if (!fContentWidth) {
				var fHeaderWidth = Util.measureText(sHeader, fnGetHeaderFont());
				return fHeaderWidth + fRequired;
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
			return fHeaderWidth + fRequired;
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
	 * @param {int} [mSettings.padding=1.0625] The sum of column padding(1rem) and border(1px) in rem
	 * @param {float} [mSettings.gap=0] The additional content width in rem
	 * @param {boolean} [mSettings.headerGap=false] Whether icons in the header should be taken into account
	 * @param {boolean} [mSettings.truncateLabel=true] Whether the header of the column can be truncated or not
	 * @param {boolean} [mSettings.verticalArrangement=false] Whether the fields are arranged vertically
	 * @param {boolean} [mSettings.required=false] Indicates the state of the column header as defined by the <code>required</code> property
	 * @param {int} [mSettings.defaultWidth=8] The default column content width when type check fails
	 * @param {int} [mSettings.treeColumn=false] Determines whether the first column of the tree table
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
			truncateLabel: true,
			padding: 1.0625,
			gap: 0
		}, mSettings);

		var fHeaderWidth = 0;
		var iMinWidth = Math.max(1, mSettings.minWidth);
		var iMaxWidth = Math.max(iMinWidth, mSettings.maxWidth);
		var fTreeColumnGap = mSettings.treeColumn ? 3 : 0;

		var fContentWidth = mSettings.gap + fTreeColumnGap + vTypes.reduce(function(fInnerWidth, vType) {
			var oType = vType, oTypeSettings = {
				defaultWidth: mSettings.defaultWidth,
				maxWidth: mSettings.maxWidth
			};

			if (Array.isArray(vType)) {
				// for internal usage (mdc/Table) every field can provide own width settings
				// in this case we get [<TypeInstance>, <TypeSettings>][] instead of <TypeInstance>[]
				oType = vType[0];
				oTypeSettings = vType[1] || oTypeSettings;
			}

			var fTypeWidth = Util.calcTypeWidth(oType, oTypeSettings);
			return mSettings.verticalArrangement ? Math.max(fInnerWidth, fTypeWidth) : fInnerWidth + fTypeWidth + (fInnerWidth && 0.5);
		}, 0);

		if (sHeader) {
			fHeaderWidth = Util.calcHeaderWidth(sHeader, (mSettings.truncateLabel ? fContentWidth : 0), iMaxWidth, iMinWidth, mSettings.required);
			fHeaderWidth += mSettings.headerGap ? (8 /* padding */ + 14 /* icon width */) / fBaseFontSize : 0;
		}

		fContentWidth = Math.max(iMinWidth, fContentWidth, fHeaderWidth);
		fContentWidth = Math.min(fContentWidth, iMaxWidth);
		fContentWidth = Math.ceil(fContentWidth * 100) / 100;

		return fContentWidth + mSettings.padding + "rem";
	};

	/**
	 * Returns an instance of <code>sap.m.IllustratedMessage</code> in case there are no visible columns in the table.
	 *
	 * @returns {sap.m.IllustratedMessage} The message to be displayed when the table has no visible columns
	 * @param {function} [fnAddColumn] The handler to be executed when the additional add column button is pressed
	 * @private
	 */
	Util.getNoColumnsIllustratedMessage = function(fnAddColumn) {
		var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

		var oIllustratedMessage = new IllustratedMessage({
			illustrationType: MLibrary.IllustratedMessageType.AddColumn,
			title: oResourceBundle.getText("TABLE_NO_COLUMNS_TITLE"),
			description: oResourceBundle.getText("TABLE_NO_COLUMNS_DESCRIPTION")
		});

		if (fnAddColumn) {
			var oAddButton = new Button({
				icon: "sap-icon://action-settings",
				press: fnAddColumn
			});
			oIllustratedMessage.addAdditionalContent(oAddButton);
		}

		return oIllustratedMessage;
	};

	/**
	 * Creates or returns the existing popover
	 *
	 * @returns {Promise} A promise that resolves when the popover is created
	 * @private
	 * @since 1.109
	 */
	Util.getSelectAllPopover = function() {
		if (pGetSelectAllPopover) {
			return pGetSelectAllPopover;
		}

		pGetSelectAllPopover = Promise.all(
			[new Promise(function(fnResolve) {
				sap.ui.require([
					"sap/m/Popover",
					"sap/m/Bar",
					"sap/m/HBox",
					"sap/m/Title",
					"sap/ui/core/Icon",
					"sap/ui/core/library",
					"sap/m/Text"
				], function(Popover, Bar, HBox, Title, Icon, coreLib, Text) {
					fnResolve({
						Popover: Popover,
						Bar: Bar,
						HBox: HBox,
						Title: Title,
						Icon: Icon,
						coreLib: coreLib,
						Text: Text
					});
				});
			}),
			Core.getLibraryResourceBundle('sap.m', true)
		]).then(function(aResult) {
			var oModules = aResult[0];
			var oResourceBundle = aResult[1];
			var sIconColor = oModules.coreLib.IconColor.Critical,
			sTitleLevel = oModules.coreLib.TitleLevel.H2;

			oSelectAllNotificationPopover = new oModules.Popover({
				customHeader: new oModules.Bar({
					contentMiddle: [
						new oModules.HBox({
							items: [
								new oModules.Icon({src: "sap-icon://message-warning", color: sIconColor})
									.addStyleClass("sapUiTinyMarginEnd"),
								new oModules.Title({text: oResourceBundle.getText("TABLE_SELECT_LIMIT_TITLE"), level: sTitleLevel})
							],
							renderType: "Bare",
							justifyContent: "Center",
							alignItems: "Center"
						})
					]
				}),
				content: [new oModules.Text()]
			}).addStyleClass("sapUiContentPadding");
			return {
				oSelectAllNotificationPopover: oSelectAllNotificationPopover,
				oResourceBundle: oResourceBundle
			};
		});
		return pGetSelectAllPopover;
	};

	/**
	 * Opens the Popover and sets the appropriate message.
	 *
	 * @param {int} iLimit The selectable items length
	 * @param {object} oSelectAllDomRef Control object where the popOver is opened
	 * @private
	 * @since 1.109
	 */
	Util.showSelectionLimitPopover = function(iLimit, oSelectAllDomRef) {
		Util.getSelectAllPopover().then(function(oResult) {
			var oPopover = oResult.oSelectAllNotificationPopover;
			var oResourceBundle = oResult.oResourceBundle;
			var sMessage = oResourceBundle.getText("TABLE_SELECT_LIMIT", [iLimit]);
			oPopover.getContent()[0].setText(sMessage); //Content contains a single text element
			if (oSelectAllDomRef) {
				oPopover.openBy(oSelectAllDomRef);
			}
		});
	};

	/**
	 * Closes the popover if opened
	 *
	 * @private
	 * @since 1.109
	 */
	Util.hideSelectionLimitPopover = function() {
		if (oSelectAllNotificationPopover && oSelectAllNotificationPopover.isOpen()) {
			oSelectAllNotificationPopover.close();
		}
	};

	/**
	 * Provides an additional announcement for the screen reader to inform the user that the table
	 * has been updated.
	 *
	 * @param {string} sText The header text to be announced
	 * @param {int|undefined} iRowCount The row count. If not provided, the row count will not be announced
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc, sap.ui.comp
	 * @since 1.114
	 */
	Util.announceTableUpdate = function(sText, iRowCount) {
		var oInvisibleMessage = InvisibleMessage.getInstance();

		if (oInvisibleMessage) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.m");

			if (iRowCount == undefined) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED", [sText]));
			} else if (iRowCount > 1) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_MULT", [sText, iRowCount]));
			} else if (iRowCount === 1) {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_SING", [sText, iRowCount]));
			} else {
				oInvisibleMessage.announce(oResourceBundle.getText("table.ANNOUNCEMENT_TABLE_UPDATED_NOITEMS", [sText]));
			}
		}
	};

	/**
	 * Checks whether the table is empty.
	 *
	 * @param {sap.ui.model.Binding} oRowBinding The row binding
	 * @returns {boolean} Whether the table is empty or not
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.ui.comp
	 * @since 1.114
	 */
	Util.isEmpty = function(oRowBinding) {
		if (!oRowBinding) {
			return true;
		}

		var iRowCount = oRowBinding.getLength();
		if (iRowCount === 1 && oRowBinding.isA('sap.ui.model.analytics.AnalyticalBinding')) {
			var bHasGrandTotal = oRowBinding ? oRowBinding.providesGrandTotal() && oRowBinding.hasTotaledMeasures() : false;

			if (bHasGrandTotal) {
				iRowCount = 0;
			}
		}
		return iRowCount <= 0;
	};

	return Util;

});