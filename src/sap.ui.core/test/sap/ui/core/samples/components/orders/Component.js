/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/library', 'sap/ui/core/mvc/View', 'sap/ui/model/resource/ResourceModel', 'sap/ui/table/Table'],
	function(UIComponent, coreLibrary, View, ResourceModel, Table) {
	"use strict";


	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// new Component
	var Component = UIComponent.extend("samples.components.orders.Component", {

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
	Component.prototype.createContent = function(){
		this.view = sap.ui.view({id:this.createId("ordersView"),viewName:"samples.components.orders.view.Orders",type:ViewType.XML});
		this.view.setModel(new ResourceModel({bundleName: this.getProperty("i18nBundle")}), "texts");
		return this.view;
	};


	return Component;

});
