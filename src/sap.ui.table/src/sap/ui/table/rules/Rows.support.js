/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/table/rowmodes/Type",
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(
	Lib,
	RowModeType,
	SupportHelper,
	SupportLibrary,
	Device,
	jQuery
) {
	"use strict";

	const Categories = SupportLibrary.Categories;
	const Severity = SupportLibrary.Severity;

	function checkDensity($Source, sTargetClass, sMessage, oIssueManager) {
		let bFound = false;
		$Source.each(function() {
			if (jQuery(this).closest(sTargetClass).length) {
				bFound = true;
			}
		});
		if (bFound && sMessage) {
			SupportHelper.reportIssue(oIssueManager, sMessage, Severity.High);
		}
		return bFound;
	}

	/*
	 * Checks whether content densities are used correctly.
	 */
	const oContentDensity = SupportHelper.normalizeRule({
		id: "ContentDensity",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Content Density Usage",
		description: "Checks whether the content densities 'Cozy', 'Compact' and 'Condensed' are used correctly.",
		resolution: "Ensure that either only the 'Cozy' or 'Compact' content density is used, or the 'Condensed' and 'Compact' content densities"
					+ " are used in combination.",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "topic/e54f729da8e3405fae5e4fe8ae7784c1")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			const $Document = jQuery("html");
			const $Cozy = $Document.find(".sapUiSizeCozy");
			const $Compact = $Document.find(".sapUiSizeCompact");
			const $Condensed = $Document.find(".sapUiSizeCondensed");

			checkDensity($Compact, ".sapUiSizeCozy", "'Compact' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity($Cozy, ".sapUiSizeCompact", "'Cozy' content density is used within 'Compact' area.", oIssueManager);
			checkDensity($Condensed, ".sapUiSizeCozy", "'Condensed' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity($Cozy, ".sapUiSizeCondensed", "'Cozy' content density is used within 'Condensed' area.", oIssueManager);

			if ($Condensed.length > 0) {
				const bFound = checkDensity($Condensed, ".sapUiSizeCompact", oIssueManager);
				if (!bFound) {
					SupportHelper.reportIssue(oIssueManager, "'Condensed' content density must be used in combination with 'Compact'.",
						Severity.High);
				}
			}

			if (Lib.all()["sap.m"] && $Cozy.length === 0 && $Compact.length === 0 && $Condensed.length === 0) {
				SupportHelper.reportIssue(oIssueManager,
					"If the sap.ui.table and the sap.m libraries are used together, a content density must be specified.",
					Severity.High
				);
			}
		}
	});

	/*
	 * Checks whether the currently rendered rows have the expected height.
	 */
	const oRowHeights = SupportHelper.normalizeRule({
		id: "RowHeights",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Row heights",
		description: "Checks whether the currently rendered rows have the expected height.",
		resolution: "Check whether content densities are correctly used, and only the supported controls are used as column templates, with their"
					+ " wrapping property set to \"false\"",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "#/topic/e54f729da8e3405fae5e4fe8ae7784c1"),
			SupportHelper.createDocuRef("Documentation: Supported controls", "#/topic/148892ff9aea4a18b912829791e38f3e"),
			SupportHelper.createDocuRef("API Reference: sap.ui.table.Column#getTemplate", "#/api/sap.ui.table.Column/methods/getTemplate"),
			SupportHelper.createFioriGuidelineResolutionEntry()
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			const bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio !== 1;

			for (let i = 0; i < aTables.length; i++) {
				const aVisibleRows = aTables[i].getRows();
				const iExpectedRowHeight = aTables[i]._getBaseRowHeight();
				let bUnexpectedRowHeightDetected = false;

				for (let j = 0; j < aVisibleRows.length; j++) {
					const oRowElement = aVisibleRows[j].getDomRef();
					const oRowElementFixedPart = aVisibleRows[j].getDomRef("fixed");

					if (oRowElement) {
						const nActualRowHeight = oRowElement.getBoundingClientRect().height;
						const nActualRowHeightFixedPart = oRowElementFixedPart ? oRowElementFixedPart.getBoundingClientRect().height : null;
						let nHeightToReport = nActualRowHeight;

						if (bIsZoomedInChrome) {
							const nHeightDeviation = Math.abs(iExpectedRowHeight - nActualRowHeight);
							const nHeightDeviationFixedPart = Math.abs(nActualRowHeightFixedPart - nActualRowHeight);

							// If zoomed in Chrome, the actual height may deviate from the expected height by less than 1 pixel. Any higher
							// deviation shall be considered as defective.
							if (nHeightDeviation > 1) {
								bUnexpectedRowHeightDetected = true;
							} else if (nActualRowHeightFixedPart != null && nHeightDeviationFixedPart > 1) {
								bUnexpectedRowHeightDetected = true;
								nHeightToReport = nActualRowHeightFixedPart;
							}
						} else if (nActualRowHeight !== iExpectedRowHeight) {
							bUnexpectedRowHeightDetected = true;
						} else if (nActualRowHeightFixedPart != null && nActualRowHeightFixedPart !== iExpectedRowHeight) {
							bUnexpectedRowHeightDetected = true;
							nHeightToReport = nActualRowHeightFixedPart;
						}

						if (bUnexpectedRowHeightDetected) {
							SupportHelper.reportIssue(oIssueManager,
								"The row height was expected to be " + iExpectedRowHeight + "px, but was " + nHeightToReport + "px instead."
								+ " This causes issues with vertical scrolling.",
								Severity.High, aVisibleRows[j].getId());
							break;
						}
					}
				}
			}
		}
	});

	/*
	 * Checks the configuration of the sap.f.DynamicPage. If the DynamicPage contains a table with row mode <code>Auto</code>, the
	 * <code>fitContent</code> property of the DynamicPage should be set to true, otherwise false.
	 */
	const oDynamicPageConfiguration = SupportHelper.normalizeRule({
		id: "DynamicPageConfiguration",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Table environment validation - 'sap.f.DynamicPage'",
		description: "Verifies that the DynamicPage is configured correctly from the table's perspective.",
		resolution: "If a table with row mode 'Auto' is placed inside a sap.f.DynamicPage, the fitContent property of the DynamicPage"
					+ " should be set to true, otherwise false.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.f.DynamicPage#getFitContent", "#/api/sap.f.DynamicPage/methods/getFitContent")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			const aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkAllParentDynamicPages(oControl, fnCheck) {
				if (oControl) {
					if (oControl.isA("sap.f.DynamicPage")) {
						fnCheck(oControl);
					}
					checkAllParentDynamicPages(oControl.getParent(), fnCheck);
				}
			}

			function checkConfiguration(oTable, oDynamicPage) {
				const vRowMode = oTable.getRowMode();
				let bIsTableInAutoMode = false;

				if (vRowMode) {
					bIsTableInAutoMode = vRowMode === RowModeType.Auto || vRowMode.isA("sap.ui.table.rowmodes.Auto");
				}

				if (bIsTableInAutoMode && !oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with an auto row mode is placed inside a sap.f.DynamicPage with fitContent=\"false\"",
						Severity.High, oTable.getId());
				} else if (!bIsTableInAutoMode && oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with a fixed or interactive row mode is placed inside a sap.f.DynamicPage with fitContent=\"true\"",
						Severity.Low, oTable.getId());
				}
			}

			for (let i = 0; i < aTables.length; i++) {
				checkAllParentDynamicPages(aTables[i], checkConfiguration.bind(null, aTables[i]));
			}
		}
	});

	return [oContentDensity, oRowHeights, oDynamicPageConfiguration];

});