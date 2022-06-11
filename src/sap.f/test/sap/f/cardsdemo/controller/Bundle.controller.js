sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/widgets/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/thirdparty/jquery"
], function (Controller, Card, GridContainerItemLayoutData, jQuery) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Bundle", {

		onCreateCardsWithManifestUrl: function () {
			this._createCards();
		},

		onCreateCardsWithPreloadedManifest: function () {
			this._createCards(true);
		},

		_createCards: function (bUseBaseUrl) {
			if (bUseBaseUrl) {
				this._createCardsWithBaseUrl();
			} else {
				this._createCardsWithoutBaseUrl();
			}
		},
		_createCardsWithoutBaseUrl: function () {
			this._createCardWithoutBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/listbundle/manifest.json"), 3);
			this._createCardWithoutBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/objectbundle/manifest.json"), 5);
			this._createCardWithoutBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/tablebundle/manifest.json"), 4);
			this._createCardWithoutBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/timelinebundle/manifest.json"), 4);
		},
		_createCardsWithBaseUrl: function () {
			this._createCardWithBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/listbundle/"), 3);
			this._createCardWithBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/objectbundle/"), 5);
			this._createCardWithBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/tablebundle/"), 4);
			this._createCardWithBaseUrl(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/timelinebundle/"), 4);
		},
		_createCardWithBaseUrl: function (sBaseUrl, iColumns) {
			var oGrid = this.getView().byId("grid");

			jQuery.getJSON(sBaseUrl + "manifest.json", function (oJson) {
				var oCard = new Card({
					manifest: oJson,
					baseUrl: sBaseUrl,
					layoutData: new GridContainerItemLayoutData({ columns: iColumns })
				});
				oGrid.addItem(oCard);
			});
		},
		_createCardWithoutBaseUrl: function (sManifestUrl, iColumns) {
			var oGrid = this.getView().byId("grid");
			var oCard = new Card({
				manifest: sManifestUrl,
				layoutData: new GridContainerItemLayoutData({ columns: iColumns })
			});
			oGrid.addItem(oCard);
		}

	});
});