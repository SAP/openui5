sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/mdtemplate/model/Device",
		"sap/ui/demo/mdtemplate/model/AppModel",
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/ui/demo/mdtemplate/Router",
		"sap/ui/demo/mdtemplate/model/formatter",
		"sap/ui/demo/mdtemplate/model/grouper"
	], function (UIComponent, ResourceModel, DeviceModel, AppModel, ListSelector, Router) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.mdtemplate.Component", {

		metadata : {
			name : "MD Template",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
	
			rootView : "sap.ui.demo.mdtemplate.view.App",
	
			config : {
				messageBundle : "sap.ui.demo.mdtemplate.i18n.messageBundle",
				// always use absolute paths relative to our own component
				// (relative paths will fail if running in the Fiori Launchpad)
				rootPath: jQuery.sap.getModulePath("sap.ui.demo.mdtemplate"),
				serviceUrl: "here/goes/your/serviceUrl/"
			},
	
			routing : {
				config : {
					routerClass : Router,
					viewType : "XML",
					viewPath : "sap.ui.demo.mdtemplate.view",
					targetAggregation : "detailPages",
					clearTarget : false
				},
				routes : [
					{
						name : "masterParent",
						view : "Master",
						targetAggregation : "masterPages",
						targetControl : "idAppControl",
						subroutes : [
							{
								pattern : "objects/{objectId}",
								name : "object",
								view : "Detail"
							},
							{
								pattern : "object/{objectId}/lineitem/{lineItemId}",
								name: "lineItem",
								view: "LineItem"
							}
						]
					},
					{
						name : "detailParent",
						view : "Detail",
						targetControl : "idAppControl",
						subroutes: [
							{
								pattern : "",
								name : "main",
								view : "Master",
								targetAggregation : "masterPages"
							}
						]
					},
					{
						name : "catchallMaster",
						view : "Master",
						targetAggregation : "masterPages",
						targetControl : "idAppControl",
						subroutes : [
							{
								pattern : ":all*:",
								name : "catchallDetail",
								view : "NotFound",
								transition : "show"
							}
						]
					}
				]
			}
		},
	
		/** 
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.  
		 * In this method, the resource and application models are set and the router is initialized.
		 * @public 
		 */
		init : function () {
			var mConfig = this.getMetadata().getConfig();
	
			// call the base component's init function
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
	
			// set the internationalization model
			this.setModel(new ResourceModel({
				bundleName : mConfig.messageBundle
			}), "i18n");
	
			this.oListSelector = new ListSelector();
	
			// set the app data model
			this.setModel(new AppModel(mConfig.serviceUrl));
	
			// set the device model
			this.setModel(new DeviceModel(), "device");
	
			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	
	});

}, /* bExport= */ true);