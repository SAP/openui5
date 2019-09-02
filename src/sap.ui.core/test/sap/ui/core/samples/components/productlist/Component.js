/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/library', 'sap/ui/core/mvc/View', 'sap/ui/model/resource/ResourceModel', 'sap/ui/table/Table'],
	function(UIComponent, coreLibrary, View, ResourceModel, Table) {
	"use strict";


	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// new Component
	var Component = UIComponent.extend("samples.components.productlist.Component", {

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
	Component.prototype.init = function(){
		UIComponent.prototype.init.apply(this);
		this.setModel(new ResourceModel({
			bundleName: "samples.components.productlist.i18n.messagebundle"
		}), "texts");
	};

	/*
	 * create the content
	 */
	Component.prototype.createContent = function(){
		this.view = sap.ui.view({id:this.createId("myView"),viewName:"samples.components.productlist.views.Products",type:ViewType.XML});
		return this.view;
	};



	return Component;

});
