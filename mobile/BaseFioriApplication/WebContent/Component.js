jQuery.sap.declare("my.demo.basefioriapp.Component");

sap.ui.core.UIComponent.extend("my.demo.basefioriapp.Component", {
	metadata : {
		"name" : "Master Detail Sample",
		"version" : "1.0",
		"includes" : [],
		"dependencies" : {
			"libs" : ["sap.m", "sap.me", "sap.ushell"],
			"components" : []
		},

		"config" : {
			"resourceBundle" : "i18n/messageBundle.properties",
			"titleResource" : "SHELL_TITLE",
			
			// "icon" : "sap-icon://Fiori2/F0002",
			// "favIcon" : "./resources/sap/ca/ui/themes/base/img/favicon/F0002_My_Accounts.ico",
			// "homeScreenIconPhone" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/57_iPhone_Desktop_Launch.png",
			// "homeScreenIconPhone@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/114_iPhone-Retina_Web_Clip.png",
			// "homeScreenIconTablet" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/72_iPad_Desktop_Launch.png",
			// "homeScreenIconTablet@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/144_iPad_Retina_Web_Clip.png",
			// "startupImage320x460" : null, //add your own app splash screen path here, otherwise you are using Launchpad splash screen
			// "startupImage640x920" : null,
			// "startupImage640x1096" : null,
			// "startupImage768x1004" : null,
			// "startupImage748x1024" : null,
			// "startupImage1536x2008" : null,
			// "startupImage1496x2048" : null

			"serviceConfig" : {
				// url: "/com.sap.odata.dynamic.service.provider/odata/SalesOrder/"
				url: "/sap/opu/odata/sap/SRA018_SO_TRACKING_SRV/"
			}
		},

		routing: {
			config: {
				viewType : "XML",
				viewPath: "my.demo.basefioriapp.view",  // common prefix
				targetControl: "fioriContent",
				targetAggregation: "detailPages",
				clearTarget: false,
				callback: function(oRoute, oArguments, oConfig, oControl, oView) {
					oControl.toDetail(oView.getId());
				}
			},
			routes: [
				{
					pattern : "Detail/{contextPath}", // will be the url and from has to be provided in the data
					view : "Detail",
					name : "Detail" // name used for listening or navigating to this route
				},
				{
					pattern : ":all*:", // catchall
					view : "Detail",
					name : "catchall", // name used for listening or navigating to this route
				}
			]
		}
	},

	init : function() {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		// this component should automatically initialize the router
		this.getRouter().initialize();
		
		var oServiceConfig = this.getMetadata().getConfig()["serviceConfig"];
		var sServiceUrl = oServiceConfig.url;

		// always use absolute paths relative to our own component
		// (relative paths will fail if running in the Fiori Launchpad)
		var rootPath = jQuery.sap.getModulePath("my.demo.basefioriapp");

		// if proxy needs to be used for local testing...
		var sProxyOn = jQuery.sap.getUriParameters().get("proxyOn");
		var bUseProxy = ("true" === sProxyOn);
		if (bUseProxy) {
			sServiceUrl = rootPath + "/proxy" + sServiceUrl;
		} 

		// start mock server if required
		var responderOn = jQuery.sap.getUriParameters().get("responderOn");
		var bUseMockData = ("true" === responderOn);
		if (bUseMockData) {
			jQuery.sap.require("sap.ui.app.MockServer");
			var oMockServer = new sap.ui.app.MockServer({
				rootUri: sServiceUrl
			});
			oMockServer.simulate(rootPath + "/model/metadata.xml", rootPath + "/model/");
			oMockServer.start();

			var msg = "Running in demo mode with mock data."; // not translated because only for development scenario
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show(msg, {
				duration: 4000
			});
		}

		
		// set i18n model
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : rootPath + "/i18n/messageBundle.properties"
		});
		this.setModel(i18nModel, "i18n");
		
		
		// set data model
		var m = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		this.setModel(m);
		

		// set device model
		var deviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : jQuery.device.is.phone,
			isNoPhone : !jQuery.device.is.phone,
			listMode : (jQuery.device.is.phone) ? "None" : "SingleSelectMaster",
					listItemType : (jQuery.device.is.phone) ? "Active" : "Inactive"
		});
		deviceModel.setDefaultBindingMode("OneWay");
		this.setModel(deviceModel, "device");
	},

	/**
	 * Initialize the application
	 * 
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent : function() {

		var oViewData = {
				component : this
		};
		return sap.ui.view({
			viewName : "my.demo.basefioriapp.view.App",
			type : sap.ui.core.mvc.ViewType.XML,
			viewData : oViewData
		});
	}
});

