//Copyright (c) 2014 SAP SE, All Rights Reserved
sap.ui.controller("sap.ui.core.sample.ViewTemplate.if_sample.Master", {
	onSelect: function(oEvent) {
		var oItem = oEvent.getParameter("listItem"),
			oContext = oItem.getBindingContext(),
			oMetaModel;

		oMetaModel = new sap.ui.model.json.JSONModel({
			"CB_SALES_ORDER_SRV.Customer" : {
				"com.sap.vocabularies.UI.v1.HeaderInfo" : {
					"TypeName" : {
						"String" : "Customer"
					},
					"TypeNamePlural" : {
						"String" : "Customers"
					},
					"ImageUrl" : {
						"Path" : "ImageUrl",
						"EdmType" : "Edm.String"
					},
					"Title" : {
						"Label" : {
							"String" : "Customer"
						},
						"Value" : {
							"Path" : "CustomerName"
						}
					},
					"Description" : {
						"Label" : {
							"String" : "ID"
						},
						"Value" : {
							"Path" : "Customer"
						}
					}
				},
				"com.sap.vocabularies.UI.v1.Identification": [{
					"Label" : {
						"String" : "Customer"
					},
					"Value" : {
						"Path" : "CustomerName"
					}
				}, {
					"Label" : {
						"String" : "ID"
					},
					"Value" : {
						"Path" : "Customer"
					}
				}]
			}
		});

		this.getView().byId("detail").destroyItems().addItem(sap.ui.view({
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.if_sample.Detail",
			bindingContexts: oContext,
			models: {undefined: oContext.getModel(), meta: oMetaModel}
		}));
	}
});
