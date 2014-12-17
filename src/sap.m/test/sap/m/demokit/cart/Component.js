jQuery.sap.declare("sap.ui.demo.cart.Component");

sap.ui.core.UIComponent.extend("sap.ui.demo.cart.Component", {

	metadata: {
		routing: {
			config: {
				viewType: "XML",
				viewPath: "view",
				targetControl: "splitApp",
				clearTarget: false,
				transition: "slide"
			},
			routes: [
				{
					pattern: "category/{id}",
					name: "category",
					view: "Category",
					viewLevel: 2,
					targetAggregation: "masterPages",
					subroutes: [
						{
							pattern: "category/{id}/product/{productId}",
							name: "product",
							view: "Product",
							viewLevel: 3,
							targetAggregation: "detailPages"
						}
					]
				},
				{
					pattern: "cart",
					name: "cart",
					view: "Cart",
					targetAggregation: "masterPages"
				},
				{	pattern: "",
					name : "home",
					view : "Home",
					viewLevel : 1,
					targetAggregation : "masterPages",
					subroutes : [
						{
							pattern: "product/{productId}",
							name: "cartProduct",
							view: "Product",
							viewLevel: 3,
							targetAggregation: "detailPages"
						},
						{
							pattern : "{all*}",
							name : "notFound",
							view : "notFound",
							viewLevel : 3,
							targetAggregation : "detailPages"
						}
					]
				}
			]
		}
	},

	init : function () {

		jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
		jQuery.sap.require("sap.ui.core.routing.HashChanger");
		jQuery.sap.require("sap.ui.demo.cart.myRouter");

		// call overwritten init (calls createContent)
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		//extend the router
		this._router = this.getRouter();
		jQuery.extend(this._router, sap.ui.demo.cart.myRouter);

		//navigate to initial page for !phone
		if (!sap.ui.Device.system.phone) {
			this._router._myNavToWithoutHash("view.Welcome", "XML", false);
		}

		// initialize the router
		this._routeHandler = new sap.m.routing.RouteMatchedHandler(this._router);
		this._router.initialize();

	},

	destroy : function () {

		if (this._routeHandler) {
			this._routeHandler.destroy();
		}

		// call overriden destroy
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	},

	createContent : function () {

		// set i18n model
		var oI18nModel = new sap.ui.model.resource.ResourceModel({
			bundleUrl : "i18n/appTexts.properties"
		});
		sap.ui.getCore().setModel(oI18nModel, "i18n");

		// create root view
		var oView = sap.ui.view({
			id : "app",
			viewName : "view.App",
			type : "JS",
			viewData : { component : this }
		});

		oView.setModel(oI18nModel, "i18n");


		jQuery.sap.require("model.Config");
		// set data model
		var sUrl = model.Config.getServiceUrl();

		// start mock server
		if (model.Config.isMock) {
			jQuery.sap.require("sap.ui.core.util.MockServer");
			var oMockServer = new sap.ui.core.util.MockServer({
				rootUri: sUrl
			});
			oMockServer.simulate("model/metadata.xml", "model/");
			oMockServer.start();

			jQuery.sap.require("sap.m.MessageToast");
			var sMsg = "Running in demo mode with mock data.";
			sap.m.MessageToast.show(sMsg, {
				duration: 2000
			});
		}

		var oModel = new sap.ui.model.odata.ODataModel(sUrl, true, model.Config.getUser(), model.Config.getPwd());
		//if we do not set this property to false, this would lead to a synchronized request which blocks the ui
		oModel.setCountSupported(false);

		oView.setModel(oModel);

		//create and set cart model
		var oCartModel = new sap.ui.model.json.JSONModel({
			entries : [],
			totalPrice: "0",
			showEditAndProceedButton: false
		});
		oView.setModel(oCartModel, "cartProducts");


		// set device model
		var oDeviceModel = new sap.ui.model.json.JSONModel({
			isTouch : sap.ui.Device.support.touch,
			isNoTouch : !sap.ui.Device.support.touch,
			isPhone : sap.ui.Device.system.phone,
			isNoPhone : !sap.ui.Device.system.phone,
			listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
			listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
		});
		oDeviceModel.setDefaultBindingMode("OneWay");
		oView.setModel(oDeviceModel, "device");


		// done
		return oView;
	}

});