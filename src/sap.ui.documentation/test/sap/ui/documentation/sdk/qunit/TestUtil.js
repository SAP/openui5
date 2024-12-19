sap.ui.define([
	"sap/ui/documentation/sdk/util/DocumentationRouter",
	"sap/ui/thirdparty/jquery"],
function (DocumentationRouter, jQuery) {
	"use strict";

	return {
		createRouter: function () {
			return new Promise(function (resolve, reject) {
				this.getManifest().then(function (oManifest) {
					resolve(this.createRouterFromManifest(oManifest));
				}.bind(this));
			}.bind(this));
		},
		getManifest: function () {
			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					url : sap.ui.require.toUrl("sap/ui/documentation/sdk/manifest.json"),
					dataType : 'json',
					success : function(oResponse) {
						resolve(oResponse);
					},
					error : function (err) {
						reject(err);
					}
				});
			});
		},
		createRouterFromManifest: function (oManifest) {
			var oRoutingManifestEntry = oManifest["sap.ui5"].routing,
				oRoutingConfig = oRoutingManifestEntry.config,
				aRoutes = oRoutingManifestEntry.routes;
			return new DocumentationRouter(aRoutes, oRoutingConfig, null, oRoutingManifestEntry.targets);
		}
	};
});