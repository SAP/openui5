/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the GWSAMPLE_BASIC
 *   OData service.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.scenario.Component");
jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.scenario.Component", {
	metadata: "json", //TODO Use component metadata from manifest file

	createContent: function () {
		var sUri = "/sap/opu/odata/IWBEP/GWSAMPLE_BASIC/",
			sMockServerBaseUri =
				"/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/data2/",
			oLayout = new sap.m.HBox(),
			oMockServer,
			oModel,
			oMetaModel;

		if (jQuery.sap.getUriParameters().get("realOData") !== "true") {
			jQuery.sap.require("sap.ui.core.util.MockServer");

			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri});
			//TODO/FIX4MASTER remove server names from mock data to allow for delivery with OpenUI5
			oMockServer.simulate(sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl: sMockServerBaseUri,
				bGenerateMissingMockData: true
			});
			oMockServer.start();
		}

		oModel = new sap.ui.model.odata.v2.ODataModel(sUri, {json: true, loadMetadataAsync: true});

		oMetaModel = new sap.ui.model.json.JSONModel(sMockServerBaseUri + "metadataMerged.json");

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
