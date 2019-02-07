/* global describe, it, element, by, takeScreenshot, browser, expect */

describe("sap.ui.layout.CSSGridVisualTests", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.layout.cssgrid.CSSGrid";

	var APP_PREFIX = "gridplayground---app--",
		aBasicExamples = ["with properties", "as a container", "with template columns", "with template rows", "as a page layout"],
		mSizes = {
			S: "500px",
			M: "900px",
			L: "1200px"
		},
		iPictureIndex = 0;


	function goToIconTabFilter (iIndex) {
		element(by.control({
			id: "cssGrid" + iIndex + "Filter",
			viewName: "Main",
			viewNamespace: "sap.ui.layout.cssgrid.gridplayground.view.",
			controlType: "sap.m.IconTabFilter"
		})).click();
	}

	function setSize (sId, iWidth) {
		browser.executeScript("sap.ui.getCore().byId('" + sId + "').setWidth('" + iWidth + "');");
	}

	function scrollIntoView (sId) {
		browser.executeScript("document.getElementById('" + sId + "').scrollIntoView();");
	}

	function expandPanel (sId) {
		browser.executeScript("sap.ui.getCore().byId('" + sId + "').setExpanded(true);");
	}

	function takeAllSizePictures(sViewPrefix, sGridId, sPanelId, sPictureTitle) {
		var ID_PREFIX = APP_PREFIX + sViewPrefix + "--",
			sFullGridId = ID_PREFIX + sGridId,
			sFullPanelId = ID_PREFIX + sPanelId,
			oGrid = element(by.id(sFullGridId));

		scrollIntoView(sFullGridId);

		expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_grid_XL_" + sPictureTitle);

		browser.executeScript(
			"return sap.ui.Device.system.desktop;")
			.then(function (bDesktop) {
				if (bDesktop) {
					setSize(sFullPanelId, mSizes.L);
					expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_grid_L_" + sPictureTitle);

					setSize(sFullPanelId, mSizes.M);
					expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_grid_M_" + sPictureTitle);

					setSize(sFullPanelId, mSizes.S);
					expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_grid_S_" + sPictureTitle);
				}
		});

		// Checking containerQuery property of GridResponsiveLayout
		if (sPanelId == "breakContainer") {
			setSize(sFullPanelId, "100%");

			browser.executeScript("sap.ui.getCore().byId('" + sFullGridId + "').getCustomLayout().setContainerQuery(false);");

			expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_containerQuery_grid_XL_" + sPictureTitle);

			browser.executeScript(
				"return sap.ui.Device.system.desktop;")
				.then(function (bDesktop) {
					if (bDesktop) {
						setSize(sFullPanelId, mSizes.L);
						expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_containerQuery_grid_L_" + sPictureTitle);

						setSize(sFullPanelId, mSizes.M);
						expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_containerQuery_grid_M_" + sPictureTitle);

						setSize(sFullPanelId, mSizes.S);
						expect(takeScreenshot(oGrid)).toLookAs(iPictureIndex++ + "_containerQuery_grid_S_" + sPictureTitle);
					}
			});
		}
	}

	function expandPanelAndTakePictures (sDescription, i) {
		it("should visualize CSSGrid " + sDescription + ".", function () {
			expandPanel(APP_PREFIX + "generalExamples--" + "panel" + i);
			takeAllSizePictures("generalExamples", "grid" + i, "panel" + i, "basic" + i);
		});
	}

	// CSSGrid basic examples
	for (var i = 1; i <= aBasicExamples.length; i++) {
		expandPanelAndTakePictures(aBasicExamples[i], i);
	}

	// CSSGrid Breakpoints
	it("should visualize CSSGrid different breakpoints", function () {
		goToIconTabFilter(2);
		takeAllSizePictures("breakpointExamples", "grid1", "breakContainer", "breakpoints");
	});

	// CSSGrid BoxContainer
	it("should visualize CSSGrid with box layout", function () {
		goToIconTabFilter(3);
		takeAllSizePictures("boxContainerExamples", "grid1", "boxContainerPanel", "box_layout");
	});

	// CSSGrid with layoutData
	it("should visualize CSSGrid with item layout data", function () {
		goToIconTabFilter(4);
		takeAllSizePictures("layoutDataExamples", "grid1", "gridLayout", "with_layout_data");
	});
});