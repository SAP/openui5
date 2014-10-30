/*!
 * ${copyright}
 */

sap.ui.controller("sap.ui.core.sample.ViewTemplate.scenario.Main", {
	//TODO clarify with UI5 Core: why can view models not be accessed in onInit?
	onBeforeRendering: function () {
		var oModel = this.getView().getModel(),
			that = this;

		oModel.createBindingContext("/ProductSet('HT-1000')", null, null, function (oContext) {
			var sANNO_PATH = "/schemas/GWSAMPLE_BASIC/annotations",
				oMetaContext,
				oMetaModel = that.getView().getModel("meta"),
				aAnnotations = oMetaModel.getObject(sANNO_PATH),
				i;

			for (i = 0; i < aAnnotations.length; i += 1) {
				if (aAnnotations[i].target === "GWSAMPLE_BASIC.Product") {
					oMetaContext = oMetaModel.createBindingContext(sANNO_PATH + "/" + i);
					break;
				}
			}
			that.getView().byId("detail").destroyItems().addItem(sap.ui.view({
				type: sap.ui.core.mvc.ViewType.XML,
				viewName: "sap.ui.core.sample.ViewTemplate.scenario.Detail",
				bindingContexts: {undefined: oContext, meta: oMetaContext},
				models: {undefined: oModel, meta: oMetaModel}
			}));
		});
	}
});