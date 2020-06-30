/*
 * ! ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI OData service.
 * @version
 * ${version}
 */
sap.ui.define([
	'sap/ui/core/UIComponent', 'sap/ui/model/odata/v2/ODataModel', 'sap/ui/core/util/MockServer', 'sap/ui/mdc/link/FakeFlpConnector', 'sap/ui/fl/FakeLrepConnectorLocalStorage'
], function(UIComponent, ODataModel, MockServer, FakeFlpConnector, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("appUnderTestContactAnnotation.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);

			FakeFlpConnector.enableFakeConnector({});
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			var sMockServerUrl = "/odata/";

			var oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			var sPath = sap.ui.require.toUrl("appUnderTestContactAnnotation/localService");

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
		},

		exit: function() {
			FakeFlpConnector.disableFakeConnector();
			FakeLrepConnectorLocalStorage.disableFakeConnector();
		}
	});
});
