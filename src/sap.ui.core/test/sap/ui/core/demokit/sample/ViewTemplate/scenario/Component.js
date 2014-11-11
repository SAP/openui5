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
			//TODO/FIX4MASTER check mock data to allow for delivery with OpenUI5
			oMockServer.simulate(/*TODO sUri?!*/sMockServerBaseUri + "metadata.xml", {
				sMockdataBaseUrl: sMockServerBaseUri,
				bGenerateMissingMockData: true
			});
			oMockServer.start();
		} else if (location.hostname === "localhost") { //for local testing prefix with proxy
			sUri = "proxy" + sUri;
		}

		oModel = new sap.ui.model.odata.v2.ODataModel(sUri, {
			annotationURI: /*TODO sUri!*/sMockServerBaseUri + "annotations.xml",
			json: true,
			loadMetadataAsync: true
		});

		oModel.getMetaModel().loaded().then(function() {
			oLayout.addItem(sap.ui.view({
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.scenario.Main",
				models: {
					undefined: oModel,
					"meta": oModel.getMetaModel()
				}
			}));
		});

		return oLayout;
	}
});
