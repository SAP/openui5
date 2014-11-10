//Copyright (c) 2014 SAP SE, All Rights Reserved
/**
 * @fileOverview Application component to display constant expressions.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.constants.Component");

jQuery.sap.require("sap.ui.core.util.MockServer");
jQuery.sap.require("sap.ui.core.util.ODataHelper");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.constants.Component", {
	metadata: "json", //TODO Use component metadata from manifest file

	createContent: function () {
		var sUri
			= "/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/constants/data/",
			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri}),
			oModel = new sap.ui.model.json.JSONModel({
				MyAddress: {
					"vCard.Address#work": {
						Street: "MyAddress/vCard.Address#work/Street"
					}
				}
			}),
			oMetaModel = new sap.ui.model.json.JSONModel();

		oMockServer.start();
		oMetaModel.loadData(sUri + "miscellaneous.json", undefined, /*bAsync*/false);

		return sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.constants.Template",
			bindingContexts: {"undefined": oModel.createBindingContext("/")},
			models: {"undefined": oModel, meta: oMetaModel}
		});
	}
});
