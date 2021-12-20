sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/SkeletonCard"
], function (Controller, SkeletonCard) {
	"use strict";

	var aManifests = {
		"objectCard": {
			path: "sap/f/cardsdemo/bundles/objectbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/objectbundle/"
		},
		"listCard": {
			path: "sap/f/cardsdemo/bundles/listbundle/manifest.json",
			baseUrl: "sap/f/cardsdemo/bundles/listbundle/"
		},
		"listCardGrouping": {
			path: "sap/f/cardsdemo/cardcontent/listcontent/groups.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listcontent/"
		},
		"listCardNoData": {
			path: "sap/f/cardsdemo/cardcontent/listcontent/noData.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listcontent/"
		},
		"listCardBulletGraphActions": {
			path: "sap/f/cardsdemo/cardcontent/listcontent/bulletGraphAndActions.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listcontent/"
		},
		"stackedBar": {
			path: "sap/f/cardsdemo/cardcontent/listcontent/stackedBar.json",
			baseUrl: "sap/f/cardsdemo/cardcontent/listcontent/"
		}
	};

	return Controller.extend("sap.f.cardsdemo.controller.ManifestResolver", {

		onInit: function () {
			this.onManifestChange();
		},

		onManifestChange: function () {
			var sSelectedKey = this.byId("manifestId").getSelectedKey(),
				oManifest = aManifests[sSelectedKey];

			this.byId("baseUrlInp").setValue(sap.ui.require.toUrl(oManifest.baseUrl));

			fetch(sap.ui.require.toUrl(oManifest.path))
				.then(function (res) {
					return res.json();
				})
				.then(function (manifest) {
					this.byId("editor").setValue(JSON.stringify(manifest, null, "\t"));
				}.bind(this));
		},

		onResolveManifestPress: function () {
			this.resolveManifest();
		},

		resolveManifest: function () {
			var oCard = new SkeletonCard({
					manifest: JSON.parse(this.byId("editor").getValue()),
					baseUrl: this.byId("baseUrlInp").getValue()
				}),
				errorOutput = this.byId("error"),
				output = this.byId("output");

			errorOutput.setVisible(false);
			output.setValue("");

			oCard.resolveManifest()
				.then(function (sRes) {
					output.setValue(JSON.stringify(JSON.parse(sRes), null, "\t"));
				})
				.catch(function (sError) {
					output.setValue("");
					errorOutput
						.setVisible(true)
						.setText("Fundamental error: " + sError);
				});

			oCard.attachEvent("_error", function (oEvent) {
				errorOutput
					.setVisible(true)
					.setText(oEvent.getParameter("message"));
			});
		}
	});
});