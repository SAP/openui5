/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.declare("samples.components.orders.Component");

// new Component
sap.ui.core.UIComponent.extend("samples.components.orders.Component", {

	metadata : {
		version : "1.0",
		dependencies : {
			version : "1.8",
			libs : [ "sap.ui.core" ]
		},
		properties:{
			i18nBundle: {name: "geti18nBundle", type: "string", defaultValue: "samples.components.orders.i18n.messagebundle"},
			model: { name: "model", type: "Object", defaultValue: null}
		}
	}
});

// create the component content, set the models
samples.components.orders.Component.prototype.createContent = function(){
	this.view = sap.ui.view({id:this.createId("ordersView"),viewName:"samples.components.orders.view.Orders",type:sap.ui.core.mvc.ViewType.XML});
	this.view.setModel(new sap.ui.model.resource.ResourceModel({bundleName: this.getProperty("i18nBundle")}), "texts");
	return this.view;
};
