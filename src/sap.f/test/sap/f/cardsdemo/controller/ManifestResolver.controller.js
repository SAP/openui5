sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/util/SkeletonCard"
], function (Controller, SkeletonCard) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.ManifestResolver", {

		onInit: function () {
			this._sBaseUrl = sap.ui.require.toUrl("sap/f/cardsdemo/bundles/objectbundle/");
			this.byId("baseUrlInp").setValue(this._sBaseUrl);

			fetch(sap.ui.require.toUrl("sap/f/cardsdemo/bundles/objectbundle/manifest.json"))
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

		onBaseUrlChange: function (e) {
			this._sBaseUrl = e.getParameter("value");
			this.resolveManifest();
		},

		resolveManifest: function () {
			var oCard = new SkeletonCard({
					manifest: JSON.parse(this.byId("editor").getValue()),
					baseUrl: this._sBaseUrl
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