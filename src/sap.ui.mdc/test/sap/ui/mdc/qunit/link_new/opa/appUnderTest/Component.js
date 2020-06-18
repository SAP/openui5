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

	return UIComponent.extend("appUnderTest.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			UIComponent.prototype.init.apply(this, arguments);

			FakeFlpConnector.enableFakeConnector({
				'appUnderTest_SemanticObjectName': {
					links: [
						{
							action: "displayFactSheet",
							intent: "?applicationUnderTest_SemanticObjectName_01#link",
							text: "FactSheet of Name"
						}, {
							action: "action_02",
							intent: "?applicationUnderTest_SemanticObjectName_02#link",
							text: "Name Link2 (Superior)",
							tags: [
								"superiorAction"
							]
						}, {
							action: "action_03",
							intent: "?applicationUnderTest_SemanticObjectName_03#link",
							text: "Name Link3"
						}
					]
				},
				'appUnderTest_SemanticObjectCategory': {
					links: [
						{
							action: "displayFactSheet",
							intent: "?applicationUnderTest_SemanticObjectCategory_01#link",
							text: "FactSheet of Category"
						}, {
							action: "action_02",
							intent: "?applicationUnderTest_SemanticObjectCategory_02#link",
							text: "Category Link2 (Superior)",
							tags: [
								"superiorAction"
							]
						}, {
							action: "action_03",
							intent: "?applicationUnderTest_SemanticObjectCategory_03#link",
							text: "Category Link3"
						}, {
							action: "action_04",
							intent: "?applicationUnderTest_SemanticObjectCategory_04#link",
							text: "Category Link4"
						}, {
							action: "action_05",
							intent: "?applicationUnderTest_SemanticObjectCategory_05#link",
							text: "Category Link5"
						}, {
							action: "action_06",
							intent: "?applicationUnderTest_SemanticObjectCategory_06#link",
							text: "Category Link6"
						}, {
							action: "action_07",
							intent: "?applicationUnderTest_SemanticObjectCategory_07#link",
							text: "Category Link7"
						}, {
							action: "action_08",
							intent: "?applicationUnderTest_SemanticObjectCategory_08#link",
							text: "Category Link8"
						}, {
							action: "action_09",
							intent: "?applicationUnderTest_SemanticObjectCategory_09#link",
							text: "Category Link9"
						}, {
							action: "action_10",
							intent: "?applicationUnderTest_SemanticObjectCategory_10#link",
							text: "Category Link10"
						}, {
							action: "action_11",
							intent: "?applicationUnderTest_SemanticObjectCategory_11#link",
							text: "Category Link11"
						}, {
							action: "action_12",
							intent: "?applicationUnderTest_SemanticObjectCategory_12#link",
							text: "Category Link12"
						}
					]
				}
			});
			FakeLrepConnectorLocalStorage.enableFakeConnector();

			var sMockServerUrl = "/odata/";

			var oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			var sPath = sap.ui.require.toUrl("appUnderTest/localService");

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
