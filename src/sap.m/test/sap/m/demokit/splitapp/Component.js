jQuery.sap.declare("sap.ui.demo.splitapp.Component");

sap.ui.core.UIComponent.extend("sap.ui.demo.splitapp.Component", {

	metadata : {
		routing : {
			config : {
				viewType : "JS",
				viewPath : "view",
				targetControl : "splitApp",
				clearTarget : false,
				transition: "slide"
			},
			routes : [
				{
					pattern : "inbox/:inboxType:",
					name : "inbox",
					view : "MailInbox",
					viewPath : "view.inbox",
					viewLevel : 1,
					targetAggregation : "masterPages"
				},
				{
					pattern : "",
					name : "home",
					viewPath : "view.inbox",
					view : "Home",
					viewLevel : 0,
					preservePageInSplitContainer : true,
					targetAggregation : "masterPages",
					subroutes : [
						{
							pattern : "mail/{viewId}",
							name : "mail",
							view : "Mail",
							viewPath : "view.detail",
							viewLevel : 2,
							targetAggregation : "detailPages"
						}
					]
				},
			]
		}
	},

	/**
	 * !!! The steps in here are sequence dependent !!!
	 */
	init : function () {

		// 1. some very generic requires
		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		jQuery.sap.require("sap.ui.demo.splitapp.MyRouter");
		jQuery.sap.require("util.ObjectSearch");

		// 2. call overridden init (calls createContent)
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		// 3a. monkey patch the router
		var router = this.getRouter();
		router.myNavBack = sap.ui.demo.splitapp.MyRouter.myNavBack;
		router.myNavToWithoutHash = sap.ui.demo.splitapp.MyRouter.myNavToWithoutHash;

		if (!sap.ui.Device.system.phone) {
			router.myNavToWithoutHash("view.detail.Empty", "JS", false);
		}

		// 4. initialize the router
		this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
		router.initialize();
	},

	destroy : function () {
		if (this.routeHandler) {
			this.routeHandler.destroy();
		}

		// call overridden destroy
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},

	createContent : function () {
		// create root view
		var oView = sap.ui.view({
			id : "app",
			viewName : "view.App",
			type : "JS",
			viewData : { component : this }
		});

		// set navigation model
		// load the global data model
		var oJSONDataModel = new sap.ui.model.json.JSONModel("model/data.json");
		oView.setModel(oJSONDataModel);

		// load the global image source model
		var oImgModel = new sap.ui.model.json.JSONModel("model/img.json");
		oView.setModel(oImgModel, "img");

		// done
		return oView;
	}
});