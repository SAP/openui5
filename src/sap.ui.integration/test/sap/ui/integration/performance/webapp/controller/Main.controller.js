sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/integration/widgets/Card",
		"sap/f/GridContainerItemLayoutData",
		"cards/performance/manifests/objectCardManifest",
		"cards/performance/manifests/additionalObjectCardManifest",
		"cards/performance/manifests/listCardManifest",
		"cards/performance/manifests/tableCardManifest",
		"cards/performance/manifests/numericListCardManifest",
		"cards/performance/manifests/analyticalCardManifest",
		"cards/performance/manifests/timelineCardManifest",
		"cards/performance/manifests/calendarCardManifest",
		"cards/performance/manifests/extensionsCardManifest",
		"cards/performance/manifests/adaptiveCardManifest",
		"cards/performance/manifests/filterCardManifest",
		"cards/performance/manifests/bulletChartCardManifest"
	],
	function (Controller, Card, GridContainerItemLayoutData,
		ObjectCardManifest, AdditionalObjectCardManifest, ListCarManifest, TableCardManifest, NumericListCardManifest, AnalyticalCardManifest,
		TimeLineCardManifest, CalendarCardManifest, ExtensionsCardManifest, AdaptiveCardManifest,
		FilterCardManifest, BulletChartCardManifest) {
		"use strict";

		return Controller.extend("cards.performance.controller.Main", {
			onInit: function () {

				var oContainer = this.byId("cardsContainer"),
					iNumberOfCards = 5;
				oContainer.destroyItems();

				this._generateCards(oContainer, iNumberOfCards, ObjectCardManifest);
				this._generateCards(oContainer, iNumberOfCards, AdditionalObjectCardManifest);
				this._generateCards(oContainer, iNumberOfCards, ListCarManifest);
				this._generateCards(oContainer, iNumberOfCards, TableCardManifest);
				this._generateCards(oContainer, iNumberOfCards, NumericListCardManifest);
				this._generateCards(oContainer, iNumberOfCards, AnalyticalCardManifest);
				this._generateCards(oContainer, iNumberOfCards, TimeLineCardManifest);
				this._generateCards(oContainer, iNumberOfCards, CalendarCardManifest);
				this._generateCards(oContainer, iNumberOfCards, AdaptiveCardManifest);
				this._generateCards(oContainer, iNumberOfCards, FilterCardManifest);
				this._generateCards(oContainer, iNumberOfCards, ExtensionsCardManifest);
				this._generateCards(oContainer, iNumberOfCards, BulletChartCardManifest);
			},

			_generateCards: function (oContainer, iNumberOfCards, oManifest) {

				for (var i = 0; i < iNumberOfCards; i++) {
					var oCard = new Card({
						layoutData: new GridContainerItemLayoutData({
							columns: 4
						}),
						baseUrl: sap.ui.require.toUrl("cards/performance/manifests/")
					});
					oManifest["sap.card"].id = oManifest["sap.card"].id + i;
					oCard.setManifest(oManifest);
					oContainer.addItem(oCard);
				}
			}
		});
	});