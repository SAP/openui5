/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
 *   OData service.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.scenario.Component");
jQuery.sap.require("sap.ui.core.util.ODataHelper");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.scenario.Component", {
	metadata: "json", //TODO Use component metadata from manifest file

	createContent: function () {
		jQuery.sap.require("sap.ui.core.util.MockServer");

		var sUri = "/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/data2/",
			oLayout = new sap.m.HBox(),
			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri}),
			oModel,
			oMetaModel;

		//TODO/FIX4MASTER remove server names from mock data to allow for delivery with OpenUI5
		oMockServer.simulate(sUri + "metadata.xml", {
			sMockdataBaseUrl: sUri,
			bGenerateMissingMockData: true
		});
		oMockServer.start();

		oModel = new sap.ui.model.odata.v2.ODataModel(sUri, {
			json: true,
			loadMetadataAsync: true,
			useBatch: false //MockServer does not work with batch being default for v2.ODataModel
		});
		oMetaModel = new sap.ui.model.json.JSONModel(sUri + "metadataMerged.json");

		function createView() {
			oLayout.addItem(sap.ui.view({
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.scenario.Main",
				models: {
					undefined: oModel,
					"meta": oMetaModel
				}
			}));
		}

		// _after_ meta data is loaded, create and add view
		//TODO Investigate with UI5 why we need to wait for loaded metadata if these are loaded async
		if (oModel.getServiceMetadata()) {
			createView();
		} else {
			oModel.attachMetadataLoaded(createView);
		}

		return oLayout;
	}
});
