jQuery.sap.declare("sap.ui.demo.mdtemplate.Component");
jQuery.sap.require("sap.ui.demo.mdtemplate.util.formatters");
jQuery.sap.require("sap.ui.demo.mdtemplate.util.groupers");
jQuery.sap.require("sap.ui.demo.mdtemplate.util.MyRouter");
jQuery.sap.require("sap.ui.demo.mdtemplate.model.Device");
jQuery.sap.require("sap.ui.demo.mdtemplate.model.MockableModel");
jQuery.sap.require("sap.ui.demo.mdtemplate.util.ListSelector");

sap.ui.core.UIComponent.extend("sap.ui.demo.mdtemplate.Component", {
	metadata : {
		name : "MD Template",
		dependencies : {
			libs : ["sap.m", "sap.ui.layout"]
		},

		rootView : "sap.ui.demo.mdtemplate.view.App",

		config : {
			messageBundle : "sap.ui.demo.mdtemplate.i18n.messageBundle",
			// always use absolute paths relative to our own component
			// (relative paths will fail if running in the Fiori Launchpad)
			rootPath: jQuery.sap.getModulePath("sap.ui.demo.mdtemplate"),
			serviceConfig : {
				md_template : {
					// If responderOn=true is provided as an url parameter, the model will serve the data in the model/data/<dataFolderName> data.
					// See model/MockableModel.js for the implementation.
					dataFolderName: "md_template",
					// If responderOn is not provided in the URL the model would hit the actual OData server.
					serviceUrl: "here/goes/your/serviceUrl/"
				}
			}
		},

		routing : {
			config : {
				routerClass : sap.ui.demo.mdtemplate.util.MyRouter,
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
		this.setModel(new sap.ui.model.resource.ResourceModel({
			bundleName : mConfig.messageBundle
		}), "i18n");

		this.oListSelector = new sap.ui.demo.mdtemplate.util.ListSelector();

		// set the mock data model
		this.setModel(new sap.ui.demo.mdtemplate.model.MockableModel(mConfig.serviceConfig.md_template));

		// set the device model
		this.setModel(new sap.ui.demo.mdtemplate.model.Device(), "device");

		// create the views based on the url/hash
		this.getRouter().initialize();
	}

});

