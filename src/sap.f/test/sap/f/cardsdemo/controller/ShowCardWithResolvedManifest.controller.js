sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/SkeletonCard",
	"sap/ui/integration/Host"
], function (Controller, SkeletonCard, Host) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ManifestResolver", {

		onInit: function () {
			var oHost = new Host({
					resolveDestination: function (sName) {
						switch (sName) {
							case "Northwind_V4":
								return Promise.resolve("https://services.odata.org/V4/Northwind/Northwind.svc");
							default:
								return null;
						}
					}
				}),
				oMainCard = new SkeletonCard({
					manifest: sap.ui.require.toUrl("sap/f/cardsdemo/cardcontent/showCard/order/manifest.json"),
					host: oHost
				}),
				oOutput1 = this.byId("output1"),
				oOutput2 = this.byId("output2");

			oHost.onShowCard = function (oChildCard, oOriginalParameters) {
				this._oChildCard = oChildCard;
				// show oChildCard somewhere in mobile SDK
				oChildCard.resolveManifest()
					.then(function (oRes) {
						oOutput2.setValue(JSON.stringify(oRes, null, "\t"));
					});

				// you can ignore oOriginalParameters, not really needed currently
			}.bind(this);

			oHost.onHideCard = function (oChildCard) {
				// hide the card in mobile SDK
				oOutput2.setValue("");
				oChildCard.destroy(); // host should destroy it ?
			};

			this._mainCard = oMainCard;

			oMainCard.resolveManifest()
				.then(function (oRes) {
					oOutput1.setValue(JSON.stringify(oRes, null, "\t"));
				});
		},

		simulateShowCardButtonPress: function () {
			this._mainCard.triggerAction({
				"type": "ShowCard",
				"parameters": {
					"manifest": "./detailsManifest.json",
					"parameters": {
						"orderId": 10249
					}
				}
			});
		},

		simulateHideCardButtonPress: function () {
			if (!this._oChildCard) {
				return;
			}

			this._oChildCard.triggerAction({
				"type": "HideCard"
			});

			this._oChildCard = null;
		}
	});
});