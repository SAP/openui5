sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/mdc/link/FakeFlpConnector",
	"sap/base/util/LoaderExtensions",
	"sap/base/util/UriParameters"
], function (UIComponent, FakeFlpConnector, LoaderExtensions, UriParameters) {
	"use strict";

	var fnLoadManifest = function() {
		var oDefaultManifest;
		// TODO: remove this handling after adoption in sapui5.runtime
		try {
			oDefaultManifest = LoaderExtensions.loadResource("sap/ui/v4demo/templateManifest.json");
		} catch (e) {
			if (e.status === "Not Found") {
				oDefaultManifest = LoaderExtensions.loadResource("sap/ui/v4demo/manifest.json");
			}
		}

		var oUriParams = new UriParameters(window.location.href);
		if (oUriParams.get("service") === "tenant") {
			var sRandomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
			oDefaultManifest["sap.app"].dataSources.default.uri = "/tenant(" + sRandomString + ")/catalog-test/";
		}

		return oDefaultManifest;
	};

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata: {
			manifest: fnLoadManifest()
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			this.__initFakeFlpConnector();
		},
		__initFakeFlpConnector: function() {
			FakeFlpConnector.enableFakeConnector({
				'FakeFlpSemanticObject': {
					links: [
						{
							action: "action_01",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Books/{path: 'ID', targetType: 'raw'}",
							text: "Manage book",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							description: "{title}",
							tags: [
								"superiorAction"
							]
						},
						{
							action: "action_02",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Authors/{path: 'author_ID', targetType: 'raw'}",
							text: "Manage author",
							description: "{author/name}"
						}
					]
				}
			});
		}

	});
});
