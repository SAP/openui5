/* global describe, it, element, by, takeScreenshot, browser, expect */

describe("sap.f.Card", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = "sap.ui.integration.widgets.Card";

	function navigateTo(sTitle) {
		element(by.control({
			controlType: "sap.m.CustomListItem",
			descendant: {
				controlType: "sap.m.Title",
				properties: { text: sTitle }
			}
		})).click();
	}

	function navigateBack() {
		browser.executeScript("window.history.back()");
	}

	function switchToCompactDensity() {
		var oCompactBtn = element(by.control({
			controlType: "sap.m.SegmentedButton",
			descendant: {
				controlType: "sap.m.SegmentedButtonItem",
				properties: { key: "compact" }
			}
		}));

		browser.executeScript("arguments[0].scrollIntoView()", oCompactBtn.getWebElement());

		oCompactBtn.click();
	}

	function getElement(oConfig) {
		var oElement;

		if (oConfig.control) {
			oElement = element(by.control(oConfig.control));
		}

		if (oConfig.id) {
			oElement = element(by.id(oConfig.id));
		}

		if (oConfig.css) {
			oElement = element(by.css(oConfig.css));
		}

		return oElement;
	}

	function takePictureOfElement(oConfig, sPictureId) {
		var oElement = getElement(oConfig);

		browser.executeScript("arguments[0].scrollIntoView()", oElement.getWebElement());

		expect(takeScreenshot(oElement)).toLookAs(sPictureId);
	}

	function focusElement(oConfig) {
		var oElement = getElement(oConfig);
		browser.executeScript("arguments[0].focus()", oElement.getWebElement());
	}

	it("Test page loaded", function () {
		expect(takeScreenshot()).toLookAs("0_Initial");
	});

	it("List Card", function () {
		navigateTo("List Card");

		var aCardIds = ["card1", "card2", "card3", "card4", "card5", "card6"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ListContent",
					interaction: "root",
					id: sId
				}
			}, "1_List_Card_" + sId);
		});

		switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ListContent",
					interaction: "root",
					id: sId
				}
			}, "1_List_Card_" + sId + "_Compact");
		});

		navigateBack();
	});

	it("Table Card", function () {
		navigateTo("Table Card");
		var aCardIds = ["tablecard1", "tablecard2"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "TableContent",
					interaction: "root",
					id: sId
				}
			}, "2_Table_Card_1" + sId);
		});

		switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "TableContent",
					interaction: "root",
					id: sId
				}
			}, "2_Table_Card_" + sId + "_Compact");
		});

		navigateBack();
	});

	it("Analytical Card", function () {
		navigateTo("Analytical Card");
		var aCardIds = ["line", "stackedColumn", "stackedBar", "donut", "bubble"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AnalyticalContent",
					interaction: "root",
					id: sId
				}
			}, "3_Analytical_Card_" + sId);
		});

		navigateBack();
	});

	it("Object Card", function () {
		navigateTo("Object Card");
		var aCardIds = ["card1", "card2"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ObjectContent",
					interaction: "root",
					id: sId
				}
			}, "4_Object_Card_" + sId);
		});

		switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ObjectContent",
					interaction: "root",
					id: sId
				}
			}, "4_Object_Card_" + sId + "_Compact");
		});

		navigateBack();
	});

	it("Component Card", function () {
		navigateTo("Component Card");
		var aCardIds = ["comp", "ticket"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ComponentCard",
					interaction: "root",
					id: sId
				}
			}, "5_Component_Card_" + sId);
		});

		switchToCompactDensity();

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "ComponentCard",
					interaction: "root",
					id: sId
				}
			}, "5_Component_Card_" + sId + "_Compact");
		});

		navigateBack();
	});

	it("sap.f.Card", function () {
		navigateTo("sap.f.Card");
		var aCardIds = ["card1", "card2", "card3", "card4"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "sapfCard",
					interaction: "root",
					id: sId
				}
			}, "6_sap_f_Card_" + sId);
		});

		navigateBack();
	});


	it("Adaptive Card", function () {
		navigateTo("Adaptive Card");
		var aCardIds = ["adaptivecard1", "adaptivecard2", "adaptivecard3"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AdaptiveCard",
					interaction: "root",
					id: sId
				}
			}, "7_Adaptive_Card_" + sId);
		});

		navigateBack();
	});

	it("Fit Container", function () {
		navigateTo("Fit Container");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Splitter",
				interaction: "root",
				id: "container"
			}
		}, "8_Fit_Container");


		navigateBack();
	});


	it("Grid Container", function () {
		navigateTo("Grid Container");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "GridContainer",
				interaction: "root",
				id: "grid1"
			}
		}, "9_Grid_Container");

		navigateBack();
	});

	it("Grid Container DnD", function () {
		navigateTo("GridContainer Drag and Drop with Target Position");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Dnd3",
				id: "grid4"
			}
		}, "10_Grid_Container_DnD");

		navigateBack();
	});

	var aMinHeightCardIds = [
		"donutChart", "largeList", "staticData", "noContent", "sapFCardMinHeight", "webPageCard"
	];

	it("Min-height", function () {
		navigateTo("Min-height of the Card Content");

		aMinHeightCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "MinHeight",
					interaction: "root",
					id: sId
				}
			}, "11_Min_Height_" + sId);
		});

	});

	it("Min-height - Compact", function () {
		switchToCompactDensity();

		aMinHeightCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "MinHeight",
					interaction: "root",
					id: sId
				}
			}, "11_Min_Height_" + sId + "_Compact");
		});

		navigateBack();
	});

	it("Default Header", function () {
		navigateTo("Default Header");
		var aCardIds = ["card1", "card2", "card3", "card4", "defaultDataTimestamp"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "DefaultHeader",
					interaction: "root",
					id: sId
				}
			}, "12_Default_Header_" + sId);
		});

		navigateBack();
	});

	it("Numeric Header", function () {
		navigateTo("Numeric Header");
		var aCardIds = ["fcard1", "fcard2", "kpicard1", "kpicard2", "kpicard3", "kpicard4", "kpicard5", "tablecard1", "tablecard123", "unitOfMeasurementOnly"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NumericHeader",
					interaction: "root",
					id: sId
				}
			}, "13_NumericHeader_" + sId);
		});

		navigateBack();
	});

	it("No Header / No Content", function () {
		navigateTo("No Header / No Content");
		var aCards = [
			{ id: "i1" },
			{ id: "i2", focus: true },
			{ id: "f3" },
			{ id: "i4", focus: true },
			{ id: "i5", focus: true },
			{ id: "i6-error", focus: true },
			{ id: "i7-error", focus: true }
		];

		aCards.forEach(function (oCard) {
			var oElement = {
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "NoHeaderNoContent",
					interaction: "root",
					id: oCard.id
				}
			};

			if (oCard.focus) {
				focusElement(oElement);
			}

			takePictureOfElement(oElement, "14_No_Header_No_Content_" + oCard.id);
		});

		navigateBack();
	});

	it("Translation", function () {
		navigateTo("Translations & Header Count");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Translation",
				interaction: "root",
				id: "card"
			}
		}, "15_Translations");

		navigateBack();
	});

	it("Badges", function () {
		navigateTo("Badges");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Badges",
				id: "badgesPage"
			}
		}, "16_Badges");

		navigateBack();
	});

	it("Preview", function () {
		navigateTo("Preview");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Preview",
				id: "previewPage"
			}
		}, "17_Preview");

		navigateBack();
	});

	it("Filters", function () {
		navigateTo("Filters");

		takePictureOfElement({
			control: {
				viewNamespace: "sap.f.cardsdemo.view.",
				viewName: "Filters",
				interaction: "root",
				id: "card"
			}
		}, "18_Filters");

		navigateBack();
	});

	it("AnalyticsCloud Card", function () {
		navigateTo("AnalyticsCloud Card");
		var aCardIds = ["card1", "card2", "card3", "card4", "card5"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "AnalyticsCloudContent",
					interaction: "root",
					id: sId
				}
			}, "19_Analytics_Cloud_Content_" + sId);
		});

		navigateBack();
	});

	it("WebPage Card", function () {
		navigateTo("WebPage Card");
		var aCardIds = ["webPageCardLocal"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "WebPageContent",
					interaction: "root",
					id: sId
				}
			}, "20_WebPage_Card_" + sId);
		});

		navigateBack();
	});

	it("Pagination", function () {
		navigateTo("Pagination");
		var aCardIds = ["card1", "card2"];

		aCardIds.forEach(function (sId) {
			takePictureOfElement({
				control: {
					viewNamespace: "sap.f.cardsdemo.view.",
					viewName: "Pagination",
					interaction: "root",
					id: sId
				}
			}, "21_Pagination_" + sId);
		});

		navigateBack();
	});
});