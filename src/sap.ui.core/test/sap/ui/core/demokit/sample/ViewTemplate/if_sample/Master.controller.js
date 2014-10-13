//Copyright (c) 2014 SAP SE, All Rights Reserved
sap.ui.controller("sap.ui.core.sample.ViewTemplate.if_sample.Master", {
	onSelect: function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext();

		this.getView().byId("detail").destroyItems().addItem(sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.if_sample.Detail",
			bindingContexts: oContext,
			models: oContext.getModel()
		}));
	}
});
