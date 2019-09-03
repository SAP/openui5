/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/core/library', 'sap/ui/core/mvc/View', 'sap/ui/model/resource/ResourceModel', 'sap/ui/table/Table'],
	function(UIComponent, coreLibrary, View, ResourceModel, Table) {
	"use strict";


	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// new Component
	var Component = UIComponent.extend("samples.components.products.overview.Component", {

		metadata : {
			version : "1.0",
			dependencies : {
				version : "1.8",
				libs : [ "sap.ui.core" ]
			},
			properties:{
				eventBusPublication: {name: "publication", type: "object", defaultValue: {channel: "rowSelected", event: "rowSelected", fn: null}},
				i18nBundle: {name: "geti18nBundle", type: "string", defaultValue: "samples.components.products.overview.i18n.messagebundle"},
				model: { name: "model", type: "Object", defaultValue: null}
			}
		}
	});

	/*
	 * create the component content, set the text model
	 */
	Component.prototype.createContent = function(){
		this.view = sap.ui.view({id:this.createId("myView"),viewName:"samples.components.products.overview.view.Products",type:ViewType.XML});
		this.view.setModel(new ResourceModel({bundleName: this.getProperty("i18nBundle")}), "texts");
		this.view.getController().eventBusPublication = this.getProperty('eventBusPublication');
		return this.view;
	};

	/*
	 * get selection from current view controller
	 */
	Component.prototype.getSelection = function() {
		return this.view.getController().oContext;
	};

	/*
	 * if there is a different event bus channel and event provided from other components that should trigger
	 *  the onContextChanged method, these can be set here.
	 */
	Component.prototype.setEventBusPublication = function(o){
		this.view.getController().eventBusParams = o;
		this.setProperty('eventBusPublication', o);
		return this;
	};


	return Component;

});
