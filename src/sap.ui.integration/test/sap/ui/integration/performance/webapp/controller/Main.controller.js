sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/f/GridContainerItemLayoutData",
	"../manifests/objectCardSimpleTemplate",
	"../manifests/objectCardInputsTemplate",
	"../manifests/objectCardAdditionalDetailsTemplate",
	"../manifests/listCardBarChartTemplate",
	"../manifests/listBulletChartTemplate",
	"../manifests/listCardQuickActionsTemplate",
	"../manifests/analyticalLineTemplate",
	"../manifests/analyticalDonutTemplate",
	"../manifests/timelineTemplate",
	"../manifests/calendarTemplate",
	"../manifests/tableTemplate",
	"../manifests/extensionFormattersTemplate",
	"../manifests/adaptiveMarkdownTemplate",
	"../manifests/adaptiveTemplatingTemplate",
	"../manifests/filterSelectTemplate",
	"../manifests/filterMultipleTemplate"
], function (
	Controller,
	integrationLibrary,
	Card,
	GridContainerItemLayoutData,
	objectCardSimpleTemplate,
	objectCardInputsTemplate,
	objectCardAdditionalDetailsTemplate,
	listCardBarChartTemplate,
	listBulletChartTemplate,
	listCardQuickActionsTemplate,
	analyticalLineTemplate,
	analyticalDonutTemplate,
	timelineTemplate,
	calendarTemplate,
	tableTemplate,
	extensionFormattersTemplate,
	adaptiveMarkdownTemplate,
	adaptiveTemplatingTemplate,
	filterSelectTemplate,
	filterMultipleTemplate
) {
	"use strict";

	var TOTAL_CARDS_COUNT = 50;
	var CardDataMode = integrationLibrary.CardDataMode;
	var sCardsBaseUrl = sap.ui.require.toUrl("cards/performance/manifests/");
	var aTemplates = [
		{ manifest: objectCardSimpleTemplate, layout: { columns: 8, minRows: 3 } },
		{ manifest: objectCardAdditionalDetailsTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: listCardQuickActionsTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: listCardBarChartTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: listBulletChartTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: analyticalLineTemplate, layout: { columns: 4, minRows: 4 } },
		{ manifest: objectCardInputsTemplate, layout: { columns: 4, minRows: 7 } },
		{ manifest: analyticalDonutTemplate, layout: { columns: 4, minRows: 3 } },
		{ manifest: calendarTemplate, layout: { columns: 8, minRows: 6 } },
		{ manifest: tableTemplate, layout: { columns: 8, minRows: 4 } },
		{ manifest: timelineTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: extensionFormattersTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: adaptiveMarkdownTemplate, layout: { columns: 4, minRows: 4 } },
		{ manifest: adaptiveTemplatingTemplate, layout: { columns: 4, minRows: 4 } },
		{ manifest: filterSelectTemplate, layout: { columns: 4, minRows: 5 } },
		{ manifest: filterMultipleTemplate, layout: { columns: 4, minRows: 5 } }
	];

	return Controller.extend("cards.performance.controller.Main", {
		onInit: function () {
			var aCardsSettings = [];
			var iCurrTemplate = 0;

			// Generate cards from templates, until the total count reaches TOTAL_CARDS_COUNT
			while (aCardsSettings.length < TOTAL_CARDS_COUNT) {
				var oSettings = aTemplates[iCurrTemplate];
				oSettings.manifest["sap.app"].id = "cards.performance.manifests.generatedCard-" + aCardsSettings.length;
				aCardsSettings.push(oSettings);
				iCurrTemplate = (iCurrTemplate + 1) % aTemplates.length;
			}

			this._createCards(aCardsSettings);
		},

		_createCards: function (aCardsSettings) {
			var sDataMode = this._getDataMode();
			var oContainer = this.byId("cardsContainer");

			aCardsSettings.forEach(function (oCardSettings) {
				oContainer.addItem(new Card({
					manifest: oCardSettings.manifest,
					layoutData: new GridContainerItemLayoutData(oCardSettings.layout),
					baseUrl: sCardsBaseUrl,
					dataMode: sDataMode
				}));
			});
		},

		_getDataMode: function () {
			if (new URLSearchParams(document.location.search).get("lazy-loading") === "true") {
				return CardDataMode.Auto;
			}

			return CardDataMode.Active;
		}
	});
});