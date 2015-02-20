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
					// bugfix: right now there is a bug in the routing/targets, the prefixing for xml views is not working
					// therefore the controlId "idAppControl" cannot be found
					// Tobias is fixing this at the moment
					rootView : "__xmlview0",
					// end bugfix
					routerClass : Router,
					viewType : "XML",
					viewPath : "sap.ui.demo.mdtemplate.view",
					controlId: "idAppControl",
					controlAggregation: "detailPages",
					bypassed: {
						target: ["master", "notFound"]
					}
				},
				routes : [
					{
						pattern: "",
						name: "master",
						target: ["object", "master"]
					},
					{
						pattern : "object/{objectId}",
						name : "object",
						target: ["master", "object"]
					},
					{
						pattern : "object/{objectId}/lineitem/{lineItemId}",
						name: "lineItem",
						target: ["master", "lineItem"]
					}
				],
				targets: {
					master : {
						viewName: "Master",
						viewLevel: 1,
						controlAggregation: "masterPages"
					},
					object : {
						viewName: "Detail",
						viewLevel: 2
					},
					lineItem : {
						viewName: "LineItem",
						viewLevel: 3
					},
					// not found targets
					detailObjectNotFound : {
						viewName: "DetailObjectNotFound",
						viewLevel: 3
					},
					detailNoObjectsAvailable: {
						viewName: "DetailNoObjectsAvailable",
						viewLevel: 3
					},
					lineItemNotFound : {
						viewName: "LineItemNotFound",
						viewLevel: 3
					},
					notFound : {
						viewName: "NotFound",
						viewLevel: 3
					}
				}
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