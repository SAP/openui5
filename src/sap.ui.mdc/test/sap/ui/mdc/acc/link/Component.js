sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/core/util/MockServer"
], function(UIComponent, ODataModel, MockServer) {
	"use strict";

	return UIComponent.extend("sap.ui.mdc.acc.link.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {

			var sMockServerUrl = "/odata/";

			var oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			var sPath = sap.ui.require.toUrl("sap/ui/mdc/acc/localservice");

			// load local mock data
			oMockServer.simulate(sPath + "/metadata.xml", {
				sMockdataBaseUrl: sPath + "/mockdata",
				bGenerateMissingMockData: true
			});

			// start
			oMockServer.start();

			this.setModel(new ODataModel(sMockServerUrl, {
				defaultBindingMode: "TwoWay"
			}));

			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});