sap.ui.define([
	"sap/ui/core/UIComponent",
	"testutils/link/FakeUShellConnector"
], function (UIComponent,  FakeUShellConnector) {
	"use strict";

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata : {
			manifest: "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			this.getRouter().initialize();

			this.__initFakeUShellConnector();
		},
		__initFakeUShellConnector: function() {
			FakeUShellConnector.enableFakeConnector({
				'FakeFlpSemanticObject': {
					links: [
						{
							action: "action_01",
							intent: self.location.pathname + "#/Books/{ID}",
							text: "Manage book",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							description: "{title}",
							tags: [
								"superiorAction"
							]
						},
						{
							action: "action_02",
							intent: self.location.pathname + "#/Authors/{author_ID}",
							text: "Manage author",
							description: "{author/name}"
						}
					]
				}
			});
		}

	});
});
