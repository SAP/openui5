/*global QUnit, oTable */

sap.ui.require([
	"sap/ui/table/RowSettings",
	"sap/ui/table/TableUtils",
	"sap/ui/core/MessageType",
	"sap/ui/core/theming/Parameters"
], function(RowSettings, TableUtils, MessageType, ThemeParameters) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	/**
	 * Sets up the row settings template in the table.
	 */
	function initRowSettings() {
		oTable.setVisibleRowCount(7);

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
							return MessageType.Success;
						} else if (iIndex === 6) {
							return MessageType.Success;
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
			createTables();
			initRowSettings();
			fakeGroupRow(5);
			fakeSumRow(6);
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

				if (iRowIndex < 5) {
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
							sRGBBackgroundColor = this.hexToRgb(ThemeParameters.get("sapUiHighlight"));
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

				if (iRowIndex < 5) {
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
		this.assertRowHeaderWidths(assert, 48, "sapUiSizeCozy");

		// Compact
		oBody.classList.remove("sapUiSizeCozy");
		oBody.classList.add("sapUiSizeCompact");
		this.assertWidths(assert, "sapUiSizeCompact");
		this.assertRowHeaderWidths(assert, 32, "sapUiSizeCompact");

		// Condensed
		oBody.classList.remove("sapUiSizeCompact");
		oBody.classList.add("sapUiSizeCondensed");
		this.assertWidths(assert, "sapUiSizeCondensed");
		this.assertRowHeaderWidths(assert, 32, "sapUiSizeCondensed");

		// Reset density
		oBody.classList.remove("sapUiSizeCondensed");
		oBody.classList.add("sapUiSizeCozy");
	});

	QUnit.test("setHighlight", function(assert) {
		var oOnAfterRenderingEventListener = this.spy();

		this.assertColor(assert, 0, this.hexToRgb(ThemeParameters.get("sapSuccessColor")));

		oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});
		oTable.getRows()[0].getAggregation("_settings").setHighlight(MessageType.Error);
		sap.ui.getCore().applyChanges();

		assert.ok(oOnAfterRenderingEventListener.notCalled, "The table did not re-render after changing a highlight");
		this.assertColor(assert, 0, this.hexToRgb(ThemeParameters.get("sapErrorColor")));
	});

	QUnit.test("_getHighlightCSSClassName", function(assert) {
		var aRows = oTable.getRows();

		for (var iRowIndex = 0; iRowIndex <= 4; iRowIndex++) {
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
			}

			assert.strictEqual(oRowSettings._getHighlightCSSClassName(), sCSSClassName,
				"The correct CSS class name was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getHighlightText", function(assert) {
		var aRows = oTable.getRows();

		for (var iRowIndex = 0; iRowIndex <= 4; iRowIndex++) {
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
			// Row with index 4 (MessageType.None) has no highlight.

			assert.strictEqual(oRowSettings._getHighlightText(), sHighlightText,
				"The correct text was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getRow", function(assert) {
		assert.strictEqual(oTable.getRows()[0].getAggregation("_settings")._getRow().getIndex(), 0, "The correct row was returned");
		assert.strictEqual(oTable.getRowSettingsTemplate()._getRow(), null, "Null is returned when called on the template");
	});
});