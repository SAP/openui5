jQuery.sap.declare("sap.ui.demo.poa.Component");

sap.ui.core.UIComponent.extend("sap.ui.demo.poa.Component", {

	metadata : {
		routing : {
			config : {
				viewType : "XML",
				viewPath : "sap.ui.demo.poa.view",
				targetControl : "splitApp",
				clearTarget : false
			},
			routes : [
				{
					pattern : "",
					name : "master",
					view : "Master",
					viewLevel : 0,
					targetAggregation : "masterPages",
					subroutes : [
						{
							pattern : "detail/{detailId}",
							name : "detail",
							view : "Detail",
							viewLevel : 1,
							targetAggregation : "detailPages",
							subroutes : [
								{
									pattern : "detail/{detailId}/lineItemId/:lineItemId:",
									name : "lineItem",
									view : "LineItem",
									viewLevel : 2,
									targetAggregation : "detailPages"
								}
							]
						},
						{
							pattern : "{all*}",
							name : "notFound",
							view : "NotFound",
							targetAggregation : "detailPages"
						}
					]
				}
			]
		}
	},

	
	/**
	 * !!! The steps in here are sequence dependent !!!
	 */
	init : function () {
		// 1. some very generic requires
		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		jQuery.sap.require("sap.ui.demo.poa.MyRouter");
		jQuery.sap.require("sap.ui.demo.poa.model.Config");
		jQuery.sap.require("sap.ui.demo.poa.util.objectSearch");
		// 2. call overwritten init (calls createContent)
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		// 3a. monkey patch the router
		var oRouter = this.getRouter();
		oRouter.myNavBack = sap.ui.demo.poa.MyRouter.myNavBack;
		oRouter.myNavToWithoutHash = sap.ui.demo.poa.MyRouter.myNavToWithoutHash;
		// 5. initialize the router
		this.oRouteHandler = new sap.m.routing.RouteMatchedHandler(oRouter);
		oRouter.initialize();
	},

	destroy : function () {
		if (this.oRouteHandler) {
			this.oRouteHandler.destroy();
		}
		// call overwritten destroy
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},

	/**
	 * 
	 */
	createContent : function () {
		
		// create root view
		var oView = sap.ui.view({
			id : "app",
			viewName : "sap.ui.demo.poa.view.App",
			type : "JS",
			viewData : { component : this }
		});
		
		// set i18n model (must be done before data)
		var i18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : "i18n/messageBundle.properties"
		});
		oView.setModel(i18nModel, "i18n");
		
		// set data model (mock/oData)
		var oModel;
		if (!sap.ui.demo.poa.model.Config.isMock) {
			var sUrl = model.Config.getServiceUrl();
			oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
		} else {
			oModel = new sap.ui.model.json.JSONModel("model/mock.json");
		}
		oView.setModel(oModel);
		
		// publish event once data is loaded
		oModel.attachRequestCompleted(function () {
			sap.ui.getCore().getEventBus().publish("app", "DataLoaded");
		});
		
		// set employee mock model
		oModel = new sap.ui.model.json.JSONModel("model/mockEmployee.json");
		oView.setModel(oModel, "employee");
		
		// set device model
		oModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : sap.ui.Device.system.phone,
			isNoPhone : !sap.ui.Device.system.phone,
			listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
			listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
		});
		oModel.setDefaultBindingMode("OneWay");
		oView.setModel(oModel, "device");
		
		// done
		return oView;
	}
});