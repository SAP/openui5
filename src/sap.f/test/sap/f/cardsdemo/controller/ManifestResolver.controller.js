sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/integration/ManifestResolver"
], function (Controller, ManifestResolver) {
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
			ManifestResolver.resolve(
				JSON.parse(this.byId("editor").getValue()),
				this._sBaseUrl
			)
				.then(function (sRes) {
					this.byId("output").setValue(sRes);
				}.bind(this));
		},

		onPrettifyOutput: function () {
			this.byId("output").setValue(JSON.stringify(JSON.parse(this.byId("output").getValue()), null, "\t"));
		}

	});
});