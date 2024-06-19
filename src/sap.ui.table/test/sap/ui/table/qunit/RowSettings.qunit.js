/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/RowSettings",
	"sap/ui/table/Row",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/theming/Parameters"
], function(
	TableQUnitUtils,
	RowSettings,
	Row,
	FixedRowMode,
	TableUtils,
	JSONModel,
	CoreLibrary,
	MessageType,
	ThemeParameters
) {
	"use strict";

	const IndicationColor = CoreLibrary.IndicationColor;

	QUnit.module("Highlights", {
		beforeEach: async function() {
			this.iRowsWithHighlight = 13;
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: new JSONModel([
					{highlight: MessageType.Success},
					{highlight: MessageType.Warning},
					{highlight: MessageType.Error},
					{highlight: MessageType.Information},
					{highlight: MessageType.None},
					{highlight: IndicationColor.Indication01},
					{highlight: IndicationColor.Indication02},
					{highlight: IndicationColor.Indication03},
					{highlight: IndicationColor.Indication04},
					{highlight: IndicationColor.Indication05},
					{highlight: IndicationColor.Indication06},
					{highlight: IndicationColor.Indication07},
					{highlight: IndicationColor.Indication08}
				]),
				columns: TableQUnitUtils.createTextColumn(),
				rowMode: new FixedRowMode({
					rowCount: this.iRowsWithHighlight + 2
				}),
				rowSettingsTemplate: new RowSettings({
					highlight: "{highlight}"
				})
			});

			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
			this.oTable.qunit.setRowStates(Array(this.iRowsWithHighlight)
				.concat({type: Row.prototype.Type.GroupHeader, expandable: true})
				.concat({type: Row.prototype.Type.Summary}));

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertRendering: function(assert, bRendered) {
			const aRows = this.oTable.getRows();

			for (let iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				const oRow = aRows[iRowIndex];
				const oHighlightElement = oRow.getDomRef("highlight");

				assert.strictEqual(oHighlightElement == null, !bRendered,
					"The highlight element of row " + (iRowIndex + 1) + " is " + (bRendered ? "" : "not ") + "in the DOM");
			}
		},
		getColorRgb: function(sThemeParameterName) {
			let sHexColor = ThemeParameters.get({name: sThemeParameterName});
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			sHexColor = sHexColor.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHexColor);

			if (result != null) {
				const r = parseInt(result[1], 16);
				const g = parseInt(result[2], 16);
				const b = parseInt(result[3], 16);

				return "rgb(" + r + ", " + g + ", " + b + ")";
			} else {
				return null;
			}
		},
		assertText: function(assert, iRowIndex, sExpectedText) {
			const oRow = this.oTable.getRows()[iRowIndex];
			const oHighlightTextElement = oRow.getDomRef("highlighttext");

			assert.strictEqual(oHighlightTextElement.innerHTML, sExpectedText, "The highlight text is correct");
		},
		assertColor: function(assert, iRowIndex, sExpectedBackgroundColor) {
			const oRow = this.oTable.getRows()[iRowIndex];
			const oHighlightElement = oRow.getDomRef("highlight");
			let sActualBackgroundColor = getComputedStyle(oHighlightElement).backgroundColor;

			if (sActualBackgroundColor === "rgba(0, 0, 0, 0)") {
				sActualBackgroundColor = "transparent";
			}

			assert.strictEqual(sActualBackgroundColor, sExpectedBackgroundColor,
				"The highlight element of row " + (iRowIndex + 1) + " has the correct background color");
		},
		assertColors: function(assert) {
			const aRows = this.oTable.getRows();

			for (let iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				const oRow = aRows[iRowIndex];
				const oHighlightElement = oRow.getDomRef("highlight");

				if (iRowIndex < this.iRowsWithHighlight) {
					const sHighlight = oRow.getAggregation("_settings").getHighlight();
					let sRGBBackgroundColor;

					switch (sHighlight) {
						case MessageType.Success:
							sRGBBackgroundColor = this.getColorRgb("sapUiSuccessBorder");
							break;
						case MessageType.Warning:
							sRGBBackgroundColor = this.getColorRgb("sapUiWarningBorder");
							break;
						case MessageType.Error:
							sRGBBackgroundColor = this.getColorRgb("sapUiErrorBorder");
							break;
						case MessageType.Information:
							sRGBBackgroundColor = this.getColorRgb("sapUiInformationBorder");
							break;
						case IndicationColor.Indication01:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication1");
							break;
						case IndicationColor.Indication02:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication2");
							break;
						case IndicationColor.Indication03:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication3");
							break;
						case IndicationColor.Indication04:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication4");
							break;
						case IndicationColor.Indication05:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication5");
							break;
						case IndicationColor.Indication06:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication6");
							break;
						case IndicationColor.Indication07:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication7");
							break;
						case IndicationColor.Indication08:
							sRGBBackgroundColor = this.getColorRgb("sapUiIndication8");
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
			const aRows = this.oTable.getRows();

			for (let iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				const oRow = aRows[iRowIndex];
				const oHighlightElement = oRow.getDomRef("highlight");

				if (iRowIndex < this.iRowsWithHighlight) {
					assert.strictEqual(oHighlightElement.getBoundingClientRect().width, 7,
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
			const aRows = this.oTable.getRows();

			for (let iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				const oRowHeaderElement = this.oTable.getDomRef("rowsel" + iRowIndex);

				assert.strictEqual(oRowHeaderElement.getBoundingClientRect().width, iStandardRowHeaderWidth + 7,
					sDensity + ": The header element of row " + (iRowIndex + 1) + " has the correct width"
				);
			}
		}
	});

	QUnit.test("Rendering - Settings not configured", async function(assert) {
		this.oTable.setRowSettingsTemplate(null);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRendering(assert, false);
	});

	QUnit.test("Rendering - Highlights not configured", async function(assert) {
		this.oTable.setRowSettingsTemplate(new RowSettings({
			highlight: null
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRendering(assert, false);

		this.oTable.setRowSettingsTemplate(new RowSettings({
			highlight: MessageType.None
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.assertRendering(assert, false);
	});

	QUnit.test("Rendering", function(assert) {
		const oBody = document.getElementsByTagName("body")[0];

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

	QUnit.test("setHighlight", async function(assert) {
		const oOnAfterRenderingEventListener = this.spy();

		this.assertColor(assert, 0, this.getColorRgb("sapUiSuccessBorder"));
		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_SUCCESS"));

		this.oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});
		this.oTable.getRows()[0].getAggregation("_settings").setHighlight(MessageType.Error);
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oOnAfterRenderingEventListener.notCalled, "The table did not re-render after changing a highlight");
		this.assertColor(assert, 0, this.getColorRgb("sapUiErrorBorder"));
		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_ERROR"));
	});

	QUnit.test("setHighlightText", async function(assert) {
		const oOnAfterRenderingEventListener = this.spy();

		this.assertText(assert, 0, TableUtils.getResourceBundle().getText("TBL_ROW_STATE_SUCCESS"));

		this.oTable.addEventDelegate({onAfterRendering: oOnAfterRenderingEventListener});
		this.oTable.getRows()[0].getAggregation("_settings").setHighlightText("testitext");
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oOnAfterRenderingEventListener.notCalled, "The table did not re-render after changing a highlight text");
		this.assertText(assert, 0, "testitext");
	});

	QUnit.test("_getHighlightCSSClassName", function(assert) {
		const aRows = this.oTable.getRows();

		for (let iRowIndex = 0; iRowIndex < this.iRowsWithHighlight; iRowIndex++) {
			const oRow = aRows[iRowIndex];
			const oRowSettings = oRow.getAggregation("_settings");
			let sCSSClassName = "sapUiTableRowHighlight";

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
		const aRows = this.oTable.getRows();

		for (let iRowIndex = 0; iRowIndex < this.iRowsWithHighlight; iRowIndex++) {
			const oRow = aRows[iRowIndex];
			const oRowSettings = oRow.getAggregation("_settings");
			let sHighlightText = "";

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
		const aRows = this.oTable.getRows();
		const sCustomHighlightText = "Custom highlight text";

		for (let iRowIndex = 0; iRowIndex < this.iRowsWithHighlight; iRowIndex++) {
			const oRow = aRows[iRowIndex];
			const oRowSettings = oRow.getAggregation("_settings");
			let sHighlightText = sCustomHighlightText;

			oRowSettings.setHighlightText(sCustomHighlightText);

			if (iRowIndex === 4) { // MessageType.None
				sHighlightText = "";
			}

			assert.strictEqual(oRowSettings._getHighlightText(), sHighlightText,
				"The correct custom text was returned for highlight " + oRowSettings.getHighlight());
		}
	});

	QUnit.test("_getRow", function(assert) {
		assert.strictEqual(this.oTable.getRows()[0].getAggregation("_settings")._getRow().getIndex(), 0, "The correct row was returned");
		assert.strictEqual(this.oTable.getRowSettingsTemplate()._getRow(), null, "Null is returned when called on the template");
	});

	QUnit.module("Navigated indicators", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(3),
				columns: TableQUnitUtils.createTextColumn(),
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rowSettingsTemplate: new RowSettings({
					navigated: {
						path: "",
						formatter: function() {
							return this._getRow().getIndex() === 1;
						}
					}
				}),
				rowActionTemplate: TableQUnitUtils.createRowAction([{type: "Navigation"}]),
				setRowActionCount: 1
			});

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertNavIndicatorRendering: function(assert, hasRowActions, bRendered) {
			const aRows = this.oTable.getRows();

			for (let iRowIndex = 0; iRowIndex < aRows.length; iRowIndex++) {
				const oRow = aRows[iRowIndex];
				const oNavIndicator = oRow.getDomRef("navIndicator");

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

	QUnit.test("Rendering - Settings not configured", async function(assert) {
		this.oTable.setRowSettingsTemplate(null);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertNavIndicatorRendering(assert, true, false);
	});

	QUnit.test("Rendering - Navigated not configured", async function(assert) {
		this.oTable.setRowSettingsTemplate(new RowSettings({
			navigated: null
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.assertNavIndicatorRendering(assert, true, false);

		this.oTable.setRowSettingsTemplate(new RowSettings({
			navigated: false
		}));
		await this.oTable.qunit.whenRenderingFinished();

		this.assertNavIndicatorRendering(assert, true, false);
	});

	QUnit.test("Rendering with navigation row action", async function(assert) {
		this.assertNavIndicatorRendering(assert, true, true);

		this.oTable.destroyRowActionTemplate();
		this.oTable.setRowActionCount(0);
		await this.oTable.qunit.whenRenderingFinished();

		this.assertNavIndicatorRendering(assert, false, true);
	});
});