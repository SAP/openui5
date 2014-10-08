/*!
 * ${copyright}
 */

jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.table.Table");
jQuery.sap.declare("samples.components.productlist.Component");

// new Component
sap.ui.core.UIComponent.extend("samples.components.productlist.Component", {

	metadata : {
		version : "1.0",
		dependencies : {
			version : "1.8",
			libs : [ "sap.ui.core" ]
		}
	}
});

/*
 * set the model on init, as it's not in the settings but fixed
 */
samples.components.productlist.Component.prototype.init = function(){
	sap.ui.core.UIComponent.prototype.init.apply(this);
	this.setModel(new sap.ui.model.resource.ResourceModel({
		bundleName: "samples.components.productlist.i18n.messagebundle"
	}), "texts");
};

/*
 * create the content
 */
samples.components.productlist.Component.prototype.createContent = function(){
	this.view = sap.ui.view({id:this.createId("myView"),viewName:"samples.components.productlist.views.Products",type:sap.ui.core.mvc.ViewType.XML});
	return this.view;
};

