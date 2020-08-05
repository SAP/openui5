/*!
 * ${copyright}
 */
sap.ui.define([
	"./TableHelper.support",
	"sap/ui/support/library",
	"sap/ui/Device"
], function(SupportHelper, SupportLibrary, Device) {
	"use strict";

	var Categories = SupportLibrary.Categories;
	var Severity = SupportLibrary.Severity;

	function checkDensity($Source, sTargetClass, sMessage, oIssueManager) {
		var bFound = false;
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
	var oContentDensity = SupportHelper.normalizeRule({
		id: "ContentDensity",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Content Density Usage",
		description: "Checks whether the content densities 'Cozy', 'Compact' and 'Condensed' are used correctly.",
		resolution: "Ensure that either only the 'Cozy' or 'Compact' content density is used, or the 'Condensed' and 'Compact' content densities"
					+ " are used in combination.",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "#docs/guide/e54f729da8e3405fae5e4fe8ae7784c1.html")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var $Document = jQuery("html");
			var $Cozy = $Document.find(".sapUiSizeCozy");
			var $Compact = $Document.find(".sapUiSizeCompact");
			var $Condensed = $Document.find(".sapUiSizeCondensed");

			checkDensity($Compact, ".sapUiSizeCozy", "'Compact' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity($Cozy, ".sapUiSizeCompact", "'Cozy' content density is used within 'Compact' area.", oIssueManager);
			checkDensity($Condensed, ".sapUiSizeCozy", "'Condensed' content density is used within 'Cozy' area.", oIssueManager);
			checkDensity($Cozy, ".sapUiSizeCondensed", "'Cozy' content density is used within 'Condensed' area.", oIssueManager);

			if ($Condensed.length > 0) {
				var bFound = checkDensity($Condensed, ".sapUiSizeCompact", oIssueManager);
				if (!bFound) {
					SupportHelper.reportIssue(oIssueManager, "'Condensed' content density must be used in combination with 'Compact'.",
						Severity.High);
				}
			}

			if (sap.ui.getCore().getLoadedLibraries()["sap.m"] && $Cozy.length === 0 && $Compact.length === 0 && $Condensed.length === 0) {
				SupportHelper.reportIssue(oIssueManager,
					"If the sap.ui.table and the sap.m libraries are used together, a content density must be specified.",
					Severity.High
				);
			}
		}
	});

	/*
	 * Checks whether the currently visible rows have the expected height.
	 */
	var oRowHeights = SupportHelper.normalizeRule({
		id: "RowHeights",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Row heights",
		description: "Checks whether the currently visible rows have the expected height.",
		resolution: "Check whether content densities are correctly used, and only the supported controls are used as column templates, with their"
					+ " wrapping property set to \"false\"",
		resolutionurls: [
			SupportHelper.createDocuRef("Documentation: Content Densities", "#/topic/e54f729da8e3405fae5e4fe8ae7784c1"),
			SupportHelper.createDocuRef("Documentation: Supported controls", "#/topic/148892ff9aea4a18b912829791e38f3e"),
			SupportHelper.createDocuRef("API Reference: sap.ui.table.Column#getTemplate", "#/api/sap.ui.table.Column/methods/getTemplate"),
			SupportHelper.createFioriGuidelineResolutionEntry()
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");
			var bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio != 1;

			for (var i = 0; i < aTables.length; i++) {
				var aVisibleRows = aTables[i].getRows();
				var iExpectedRowHeight = aTables[i]._getBaseRowHeight();
				var bUnexpectedRowHeightDetected = false;

				for (var j = 0; j < aVisibleRows.length; j++) {
					var oRowElement = aVisibleRows[j].getDomRef();
					var oRowElementFixedPart = aVisibleRows[j].getDomRef("fixed");

					if (oRowElement) {
						var nActualRowHeight = oRowElement.getBoundingClientRect().height;
						var nActualRowHeightFixedPart = oRowElementFixedPart ? oRowElementFixedPart.getBoundingClientRect().height : null;
						var nHeightToReport = nActualRowHeight;

						if (bIsZoomedInChrome) {
							var nHeightDeviation = Math.abs(iExpectedRowHeight - nActualRowHeight);
							var nHeightDeviationFixedPart = Math.abs(nActualRowHeightFixedPart - nActualRowHeight);

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
	 * Checks the configuration of the sap.f.DynamicPage. If the DynamicPage contains a table with <code>visibleRowCountMode=Auto</code>, the
	 * <code>fitContent</code> property of the DynamicPage should be set to true, otherwise false.
	 */
	var oDynamicPageConfoguration = SupportHelper.normalizeRule({
		id: "DynamicPageConfiguration",
		minversion: "1.38",
		categories: [Categories.Usage],
		title: "Table environment validation - 'sap.f.DynamicPage'",
		description: "Verifies that the DynamicPage is configured correctly from the table's perspective.",
		resolution: "If a table with visibleRowCountMode=Auto is placed inside a sap.f.DynamicPage, the fitContent property of the DynamicPage"
					+ " should be set to true, otherwise false.",
		resolutionurls: [
			SupportHelper.createDocuRef("API Reference: sap.f.DynamicPage#getFitContent", "#/api/sap.f.DynamicPage/methods/getFitContent")
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var aTables = SupportHelper.find(oScope, true, "sap.ui.table.Table");

			function checkAllParentDynamicPages(oControl, fnCheck) {
				if (oControl) {
					if (oControl.isA("sap.f.DynamicPage")) {
						fnCheck(oControl);
					}
					checkAllParentDynamicPages(oControl.getParent(), fnCheck);
				}
			}

			function checkConfiguration(oTable, oDynamicPage) {
				if (oTable._getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode") && !oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with an auto row mode is placed inside a sap.f.DynamicPage with fitContent=\"false\"",
						Severity.High, oTable.getId());
				} else if ((oTable._getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode")
							|| oTable._getRowMode().isA("sap.ui.table.rowmodes.InteractiveRowMode"))
						   && oDynamicPage.getFitContent()) {
					SupportHelper.reportIssue(oIssueManager,
						"A table with a fixed or interactive row mode is placed inside a sap.f.DynamicPage with fitContent=\"true\"",
						Severity.Low, oTable.getId());
				}
			}

			for (var i = 0; i < aTables.length; i++) {
				checkAllParentDynamicPages(aTables[i], checkConfiguration.bind(null, aTables[i]));
			}
		}
	});

	return [oContentDensity, oRowHeights, oDynamicPageConfoguration];

}, true);