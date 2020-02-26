/*global QUnit, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/RowSettings",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/library",
	"sap/ui/core/theming/Parameters"
], function(TableQUnitUtils, RowSettings, TableUtils, CoreLibrary, ThemeParameters) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;
	var removeRowActions = window.removeRowActions;

	var MessageType = CoreLibrary.MessageType;
	var IndicationColor = CoreLibrary.IndicationColor;

	var iRowsWithHighlight = 13;

	/**
	 * Sets up the row settings template in the table.
	 */
	function initRowSettings() {
		oTable.setVisibleRowCount(iRowsWithHighlight + 2);

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: {
				path: "",
				formatter: function() {
					var oRow = this._getRow();

					if (oRow != null) {
						var iIndex = oRow.getIndex();

						if (iIndex === 0) {
							return MessageType.Success;
						} else if (iIndex === 1) {
							return MessageType.Warning;
						} else if (iIndex === 2) {
							return MessageType.Error;
						} else if (iIndex === 3) {
							return MessageType.Information;
						} else if (iIndex === 4) {
							return MessageType.None;
						} else if (iIndex === 5) {
							return IndicationColor.Indication01;
						} else if (iIndex === 6) {
							return IndicationColor.Indication02;
						} else if (iIndex === 7) {
							return IndicationColor.Indication03;
						} else if (iIndex === 8) {
							return IndicationColor.Indication04;
						} else if (iIndex === 9) {
							return IndicationColor.Indication05;
						} else if (iIndex === 10) {
							return IndicationColor.Indication06;
						} else if (iIndex === 11) {
							return IndicationColor.Indication07;
						} else if (iIndex === 12) {
							return IndicationColor.Indication08;
						}
					}

					return "None";
				}
			}
		}));

		sap.ui.getCore().applyChanges();
	}

	QUnit.module("Highlights", {
		beforeEach: function() {
			createTables(false, false, iRowsWithHighlight + 2);
			initRowSettings();
			fakeGroupRow(iRowsWithHighlight);
			fakeSumRow(iRowsWithHighlight + 1);
		},
		afterEach: function() {
			destroyTables();
		},
		assertRendering: function(assert, bRendered) {
			var aRows = oTable.getRows();

			for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				var oRow = aRows[iRowIndex];
				var oHighlightElement = oRow.getDomRef("highlight");

				assert.strictEqual(oHighlightElement == null, !bRendered,
					"The highlight element of row " + (iRowIndex + 1) + " is " + (bRendered ? "" : "not ") + "in the DOM");
			}
		},
		hexToRgb: function(sHexColor) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			sHexColor = sHexColor.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHexColor);

			if (result != null) {
				var r = parseInt(result[1], 16);
				var g = parseInt(result[2], 16);
				var b = parseInt(result[3], 16);

				return "rgb(" + r + ", " + g + ", " + b + ")";
			} else {
				return null;
			}
		},
		assertText: function(assert, iRowIndex, sExpectedText) {
			var oRow = oTable.getRows()[iRowIndex];
			var oHighlightTextElement = oRow.getDomRef("highlighttext");

			assert.strictEqual(oHighlightTextElement.innerHTML, sExpectedText, "The highlight text is correct");
		},
		assertColor: function(assert, iRowIndex, sExpectedBackgroundColor) {
			var oRow = oTable.getRows()[iRowIndex];
			var oHighlightElement = oRow.getDomRef("highlight");
			var sActualBackgroundColor = getComputedStyle(oHighlightElement).backgroundColor;

			if (sActualBackgroundColor === "rgba(0, 0, 0, 0)") {
				sActualBackgroundColor = "transparent";
			}

			assert.strictEqual(sActualBackgroundColor, sExpectedBackgroundColor,
				"The highlight element of row " + (iRowIndex + 1) + " has the correct background color");
		},
		assertColors: function(assert) {
			var aRows = oTable.getRows();

			for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				var oRow = aRows[iRowIndex];
				var oHighlightElement = oRow.getDomRef("highlight");

				if (iRowIndex < iRowsWithHighlight) {
					var sHighlight = oRow.getAggregation("_settings").getHighlight();
					var sRGBBackgroundColor;

					switch (sHighlight) {
						case MessageType.Success:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiSuccessBorder"));
							break;
						case MessageType.Warning:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiWarningBorder"));
							break;
						case MessageType.Error:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiErrorBorder"));
							break;
						case MessageType.Information:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiInformationBorder"));
							break;
						case IndicationColor.Indication01:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication1"));
							break;
						case IndicationColor.Indication02:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication2"));
							break;
						case IndicationColor.Indication03:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication3"));
							break;
						case IndicationColor.Indication04:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication4"));
							break;
						case IndicationColor.Indication05:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication5"));
							break;
						case IndicationColor.Indication06:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication6"));
							break;
						case IndicationColor.Indication07:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication7"));
							break;
						case IndicationColor.Indication08:
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiIndication8"));
							break;
						default:
							sRGBBackgroundColor = "transparent"; // transparent
					}

					this.assertColor(assert, iRowIndex, sRGBBackgroundColor);

				} else { // Group and sum rows
					assert.strictEqual(getComputedStyle(oHighlightElement).display, "none",
						"The highlight element of row " + (iRowIndex + 1) + " (group or sum row) has \"display\" set to \"none\"");
				}
			}
		},
		assertWidths: function(assert, sDensity) {
			var aRows = oTable.getRows();

			for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				var oRow = aRows[iRowIndex];
				var oHighlightElement = oRow.getDomRef("highlight");

				if (iRowIndex < iRowsWithHighlight) {
					assert.strictEqual(oHighlightElement.getBoundingClientRect().width, 6,
						sDensity + ": The highlight element of row " + (iRowIndex + 1) + " has the correct width"
					);
				} else {
					assert.strictEqual(oHighlightElement.getBoundingClientRect().width, 0,
						sDensity + ": The highlight element of row " + (iRowIndex + 1) + " (group or sum row) has the correct width"
					);
				}
			}
		},
		assertRowHeaderWidths: function(assert, iStandardRowHeaderWidth, sDensity) {
			var aRows = oTable.getRows();

			for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				var oRowHeaderElement = oTable.getDomRef("rowsel" + iRowIndex);

				assert.strictEqual(oRowHeaderElement.getBoundingClientRect().width, iStandardRowHeaderWidth + 6,
					sDensity + ": The header element of row " + (iRowIndex + 1) + " has the correct width"
				);
			}
		}
	});

	QUnit.test("Rendering - Settings not configured", function(assert) {
		oTable.setRowSettingsTemplate(null);
		sap.ui.getCore().applyChanges();

		this.assertRendering(assert, false);
	});

	QUnit.test("Rendering - Highlights not configured", function(assert) {
		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: null
		}));
		sap.ui.getCore().applyChanges();

		this.assertRendering(assert, false);

		oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.None
		}));
		sap.ui.getCore().applyChanges();

		this.assertRendering(assert, false);
	});

	QUnit.test("Rendering", function(assert) {
		var oBody = document.getElementsByTagName("body")[0];

		this.assertRendering(assert, true);
		this.assertColors(assert);

		// Cozy
		this.assertWidths(assert, "sapUiSizeCozy");
		this.assertRowHeaderWidths(assert, TableUtils.BaseSize.sapUiSizeCozy, "sapUiSizeCozy");

		// Compact
		oBody.classList.remove("sapUiSizeCozy");
		oBody.classList.add("sapUiSizeCompact");
		this.assertWidths(assert, "sapUiSizeCompact");
		this.assertRowHeaderWidths(assert, TableUtils.BaseSize.sapUiSizeCompact, "sapUiSizeCompact");

		// Condensed
		oBody.classList.remove("sapUiSizeCompact");
		oBody.classList.add("sapUiSizeCondensed");
		this.assertWidths(assert, "sapUiSizeCondensed");
		this.assertRowHeaderWidths(assert, TableUtils.BaseSize.sapUiSizeCompact, "sapUiSizeCondensed");

		// Reset density
		oBody.classList.remove("sapUiSizeCondensed");
		oBody.classList.add("sapUiSizeCozy");
	});

	QUnit.test("setHighlight", function(assert) {
		var oOnAfterRenderingEventListener = this.spy();

		this.assertColor(assert, 0, this.hexToRgb(ThemeParameters.get("sapUiSuccessBorder")));
		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_SUCCESS"));

		oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});
		oTable.getRows()[0].getAggregation("_settings").setHighlight(MessageType.Error);
		sap.ui.getCore().applyChanges();

		assert.ok(oOnAfterRenderingEventListener.notCalled, "The table did not re-render after changing a highlight");
		this.assertColor(assert, 0, this.hexToRgb(ThemeParameters.get("sapUiErrorBorder")));
		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_ERROR"));
	});

	QUnit.test("setHighlightText", function(assert) {
		var oOnAfterRenderingEventListener = this.spy();

		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_SUCCESS"));

		oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});
		oTable.getRows()[0].getAggregation("_settings").setHighlightText("testitext");
		sap.ui.getCore().applyChanges();

		assert.ok(oOnAfterRenderingEventListener.notCalled, "The table did not re-render after changing a highlight text");
		this.assertText(assert, 0, "testitext");
	});

	QUnit.test("_getHighlightCSSClassName", function(assert) {
		var aRows = oTable.getRows();

		for (var iRowIndex = 0; iRowIndex < iRowsWithHighlight; iRowIndex++) {
			var oRow = aRows[iRowIndex];
			var oRowSettings = oRow.getAggregation("_settings");
			var sCSSClassName = "sapUiTableRowHighlight";

			if (iRowIndex === 0) {
				sCSSClassName += "Success";
			} else if (iRowIndex === 1) {
				sCSSClassName += "Warning";
			} else if (iRowIndex === 2) {
				sCSSClassName += "Error";
			} else if (iRowIndex === 3) {
				sCSSClassName += "Information";
			} else if (iRowIndex === 4) {
				sCSSClassName += "None";
			} else if (iRowIndex === 5) {
				sCSSClassName += "Indication01";
			} else if (iRowIndex === 6) {
				sCSSClassName += "Indication02";
			} else if (iRowIndex === 7) {
				sCSSClassName += "Indication03";
			} else if (iRowIndex === 8) {
				sCSSClassName += "Indication04";
			} else if (iRowIndex === 9) {
				sCSSClassName += "Indication05";
			} else if (iRowIndex === 10) {
				sCSSClassName += "Indication06";
			} else if (iRowIndex === 11) {
				sCSSClassName += "Indication07";
			} else if (iRowIndex === 12) {
				sCSSClassName += "Indication08";
			}

			assert.strictEqual(oRowSettings._getHighlightCSSClassName(), sCSSClassName,
				"The correct CSS class name was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getHighlightText - Default texts", function(assert) {
		var aRows = oTable.getRows();

		for (var iRowIndex = 0; iRowIndex < iRowsWithHighlight; iRowIndex++) {
			var oRow = aRows[iRowIndex];
			var oRowSettings = oRow.getAggregation("_settings");
			var sHighlightText = "";

			if (iRowIndex === 0) {
				sHighlightText = TableUtils.getResourceBundle().getText("TBL_ROW_STATE_" + MessageType.Success.toUpperCase());
			} else if (iRowIndex === 1) {
				sHighlightText = TableUtils.getResourceBundle().getText("TBL_ROW_STATE_" + MessageType.Warning.toUpperCase());
			} else if (iRowIndex === 2) {
				sHighlightText = TableUtils.getResourceBundle().getText("TBL_ROW_STATE_" + MessageType.Error.toUpperCase());
			} else if (iRowIndex === 3) {
				sHighlightText = TableUtils.getResourceBundle().getText("TBL_ROW_STATE_" + MessageType.Information.toUpperCase());
			}
			// Rows with indices 4-9 (MessageType.None and IndicationColors) has no highlight text.

			assert.strictEqual(oRowSettings._getHighlightText(), sHighlightText,
				"The correct text was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getHighlightText - Custom texts", function(assert) {
		var aRows = oTable.getRows();
		var sCustomHighlightText = "Custom highlight text";

		for (var iRowIndex = 0; iRowIndex < iRowsWithHighlight; iRowIndex++) {
			var oRow = aRows[iRowIndex];
			var oRowSettings = oRow.getAggregation("_settings");
			var sHighlightText = sCustomHighlightText;

			oRowSettings.setHighlightText(sCustomHighlightText);

			if (iRowIndex === 4) { // MessageType.None
				sHighlightText = "";
			}

			assert.strictEqual(oRowSettings._getHighlightText(), sHighlightText,
				"The correct custom text was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getRow", function(assert) {
		assert.strictEqual(oTable.getRows()[0].getAggregation("_settings")._getRow().getIndex(), 0, "The correct row was returned");
		assert.strictEqual(oTable.getRowSettingsTemplate()._getRow(), null, "Null is returned when called on the template");
	});

	QUnit.module("Navigated indicators", {
		beforeEach: function() {
			createTables(false, false, 3);

			oTable.setVisibleRowCount(3);
			oTable.setRowActionTemplate(new sap.ui.table.RowAction({
				items: [
					new sap.ui.table.RowActionItem({
						type: "Navigation"
					})
				]
			}));
			oTable.setRowActionCount(1);

			oTable.setRowSettingsTemplate(new RowSettings({
				navigated: {
					path: "",
					formatter: function() {
						var oRow = this._getRow();

						if (oRow != null) {
							var iIndex = oRow.getIndex();

							if (iIndex === 1) {
								return true;
							}
						}
					}
				}
			}));

			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		},
		assertNavIndicatorRendering: function(assert, hasRowActions, bRendered) {
			var aRows = oTable.getRows();

			for (var iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				var oRow = aRows[iRowIndex];
				var oNavIndicator = oRow.getDomRef("navIndicator");

				assert.strictEqual(oNavIndicator == null, !bRendered,
					"The navigated indicator of row " + (iRowIndex + 1) + " is " + (bRendered ? "" : "not ") + "in the DOM when RowActions column " +
					(hasRowActions ? "exists" : "doesn't exist"));

				if (bRendered) {
					if (iRowIndex === 1) {
						assert.ok(oNavIndicator.className.indexOf("sapUiTableRowNavigated") > -1,
							"The navigated indicator of row " + (iRowIndex + 1) + " has the correct css class");
					} else {
						assert.ok(oNavIndicator.className.indexOf("sapUiTableRowNavigated") === -1,
							"The css class hasn't been assigned to the navigated indicator of row " + (iRowIndex + 1));
					}
				}
			}
		}
	});

	QUnit.test("Rendering - Settings not configured", function(assert) {
		oTable.setRowSettingsTemplate(null);
		sap.ui.getCore().applyChanges();

		this.assertNavIndicatorRendering(assert, true, false);
	});

	QUnit.test("Rendering - Navigated not configured", function(assert) {
		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: null
		}));
		sap.ui.getCore().applyChanges();

		this.assertNavIndicatorRendering(assert, true, false);

		oTable.setRowSettingsTemplate(new RowSettings({
			navigated: false
		}));
		sap.ui.getCore().applyChanges();

		this.assertNavIndicatorRendering(assert, true, false);
	});

	QUnit.test("Rendering", function(assert) {
		this.assertNavIndicatorRendering(assert, true, true);

		removeRowActions(oTable);

		this.assertNavIndicatorRendering(assert, false, true);
	});
});