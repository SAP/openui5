jQuery.sap.declare("sap.ui.demo.mdskeleton.Component");
jQuery.sap.require("sap.ui.demo.mdskeleton.util.formatter");
jQuery.sap.require("sap.ui.demo.mdskeleton.util.MyRouter");
jQuery.sap.require("sap.ui.demo.mdskeleton.model.Device");
jQuery.sap.require("sap.ui.demo.mdskeleton.model.MockableModel");

sap.ui.core.UIComponent.extend("sap.ui.demo.mdskeleton.Component", {
	metadata : {
		name : "MD Skeleton",
		dependencies : {
			libs : ["sap.m", "sap.ui.layout"]
		},

		rootView : "sap.ui.demo.mdskeleton.view.App",

		config : {
			resourceBundle : "i18n/messageBundle.properties",
			// always use absolute paths relative to our own component
			// (relative paths will fail if running in the Fiori Launchpad)
			rootPath: jQuery.sap.getModulePath("sap.ui.demo.mdskeleton"),
			serviceConfig : {
				northwind : {
					// If responderOn=true is provided as an url parameter, the model will serve the data in the model/data/<dataFolderName> data.
					// See model/MockableModel.js for the implementation.
					dataFolderName: "Northwind",
					// If responderOn is not provided in the URL the model will hit the actual OData server.
					serviceUrl: "../../../../../proxy/http/services.odata.org/V2/(S(sapuidemomd))/OData/OData.svc/"
				}
			}
		},

		routing : {
			config : {
				routerClass : sap.ui.demo.mdskeleton.util.MyRouter,
				viewType : "XML",
				viewPath : "sap.ui.demo.mdskeleton.view",
				targetAggregation : "detailPages",
				clearTarget : false
			},
			routes : [
				{
					pattern : "",
					name : "main",
					view : "Master",
					targetAggregation : "masterPages",
					targetControl : "idAppControl",
					subroutes : [
						{
							pattern : "{product}",
							name : "product",
							view : "Detail"
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

	init : function() {
		//Call the base init
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		var mConfig = this.getMetadata().getConfig();

		// set the models
		this.setModel(new sap.ui.model.resource.ResourceModel({
			bundleUrl : [mConfig.rootPath, mConfig.resourceBundle].join("/")
		}), "i18n");

		this.setModel(new sap.ui.demo.mdskeleton.model.MockableModel(mConfig.serviceConfig.northwind));

		this.setModel(new sap.ui.demo.mdskeleton.model.Device(), "device");

		// Creates views based on the url/hash
		this.getRouter().initialize();
	}

});

