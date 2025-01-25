sap.ui.define([
	"sap/ui/documentation/sdk/util/DocumentationRouter",
	"sap/ui/thirdparty/jquery"],
function (DocumentationRouter, jQuery) {
	"use strict";

	return {
		getManifest: function () {
			return new Promise(function (resolve, reject) {
				jQuery.ajax({
					url : sap.ui.require.toUrl("sap/ui/documentation/sdk/manifest.json"),
					dataType : 'json',
					success : function(oResponse) {
						resolve(oResponse);
					},
					error : function (oXHR, sError, oDetails) {
						reject(sError + " - " + oDetails);
					}
				});
			});
		},
		createRouter: function (oManifest) {
			var oRoutingManifestEntry = oManifest["sap.ui5"].routing,
				oRoutingConfig = oRoutingManifestEntry.config,
				aRoutes = oRoutingManifestEntry.routes;
			return new DocumentationRouter(aRoutes, oRoutingConfig, null, oRoutingManifestEntry.targets);
		}
	};
});