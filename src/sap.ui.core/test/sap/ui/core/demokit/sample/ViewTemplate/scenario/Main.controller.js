/*!
 * ${copyright}
 */

sap.ui.controller("sap.ui.core.sample.ViewTemplate.scenario.Main", {
	onInit: function () {
		var oEntityTypes = {
				selectedKey: "Product",
				types: [
					{
						key: "BusinessPartner",
						target: "GWSAMPLE_BASIC.BusinessPartner",
						instance: "/BusinessPartnerSet('0100000001')"
					},
					{
						key: "Contact",
						target: "GWSAMPLE_BASIC.Contact",
						instance: "/ContactSet(guid'0050568D-393C-1EE4-9882-CEC33E1510CD')"
					},
					{
						key: "Product",
						target: "GWSAMPLE_BASIC.Product",
						instance: "/ProductSet('HT-1000')"
					},
					{
						key: "SalesOrder",
						target: "GWSAMPLE_BASIC.SalesOrder",
						instance: "/SalesOrderSet('0500000000')"
					},
					{
						key: "SalesOrderLineItem",
						target: "GWSAMPLE_BASIC.SalesOrderLineItem",
						instance: "/SalesOrderSet('0500000000')"
					}
				]
			};

		this.getView().setModel(new sap.ui.model.json.JSONModel(oEntityTypes), "ui");
	},

	//TODO clarify with UI5 Core: why can view models not be accessed in onInit?
	onBeforeRendering: function () {
		this._showDetails();
	},

	onChangeType: function (oEvent) {
		this._showDetails();
	},

	_showDetails: function () {
		var sANNO_PATH = "/schemas/GWSAMPLE_BASIC/annotations",
			oDetailView,
			oView = this.getView(),
			oMetaContext,
			oMetaModel = oView.getModel("meta"),
			aAnnotations = oMetaModel.getObject(sANNO_PATH),
			oModel = oView.getModel(),
			aTypes = oView.getModel("ui").getProperty("/types"),
			oType,
			i;

		for (i = 0; i < aTypes.length; i += 1) {
			if (aTypes[i].key === oView.getModel("ui").getProperty("/selectedKey")) {
				oType = aTypes[i];
				break;
			}
		}
		for (i = 0; i < aAnnotations.length; i += 1) {
			if (aAnnotations[i].target === oType.target) {
				oMetaContext = oMetaModel.createBindingContext(sANNO_PATH + "/" + i);
				break;
			}
		}
		oDetailView = sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.scenario.Detail",
			bindingContexts: {meta: oMetaContext},
			models: {meta: oMetaModel}
		});
		oDetailView.bindElement(oType.instance, {models: oModel});
		oView.byId("detail").destroyItems().addItem(oDetailView);
	}
});