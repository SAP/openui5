//Copyright (c) 2014 SAP SE, All Rights Reserved
/**
 * @fileOverview Application component to display customer info.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.if_sample.Component");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.if_sample.Component", {
	metadata: "json", //TODO Use component metadata from manifest file

	createContent: function () {
		jQuery.sap.require("sap.ui.core.util.MockServer");

		var oLayout = new sap.m.HBox(),
			sUri = "/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/data/",
			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri}),
			oModel;

		oMockServer.simulate(sUri + "metadata.xml", {
			sMockdataBaseUrl: sUri,
			bGenerateMissingMockData: true
		});
		oMockServer.start();

		oModel = new sap.ui.model.odata.ODataModel(sUri, {
			annotationURI: sUri + "BSCBN_SALES_ORDER_SRV_ANNO.xml",
			json: true,
			loadAnnotationsJoined: true,
			loadMetadataAsync: true
		});

		function createView() {
			oLayout.addItem(sap.ui.view({
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.if_sample.Master",
				models: oModel
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
