sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/m/routing/Router',
	'sap/ui/model/resource/ResourceModel',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/model/json/JSONModel'
], function (UIComponent,
			Router,
			ResourceModel,
			ODataModel,
			JSONModel) {

	return UIComponent.extend("sap.ui.demo.cart.Component", {

		metadata: {
			routing: {
				config: {
					routerClass: Router,
					viewType: "XML",
					viewPath: "view",
					controlId: "splitApp",
					transition: "slide",
					bypassed: {
						target: ["home" , "notFound"]
					}
				},
				routes: [
					{
						pattern: "",
						name: "home",
						target: "home"
					},
					{
						pattern: "category/{id}",
						name: "category",
						target: "categoryView"
					},
					{
						pattern: "category/{id}/product/{productId}",
						name: "product",
						target: ["categoryView", "productView"]
					},
					{
						pattern: "cart",
						name: "cart",
						target: "cart"
					},
					{
						pattern: "product/{productId}",
						name: "cartProduct",
						target: ["home" , "productView"]
					}
				],
				targets: {
					productView: {
						viewName: "Product",
						viewLevel: 3,
						controlAggregation: "detailPages"
					},
					categoryView: {
						viewName: "Category",
						viewLevel: 2,
						controlAggregation: "masterPages"
					},
					notFound: {
						viewName: "NotFound",
						viewLevel: 3,
						controlAggregation: "detailPages"
					},
					welcome: {
						viewName: "Welcome",
						viewLevel: 0,
						controlAggregation: "detailPages"
					},
					home: {
						viewName: "Home",
						viewLevel: 1,
						controlAggregation: "masterPages"
					},
					cart: {
						viewName: "Cart",
						controlAggregation: "masterPages"
					}
				}
			}
		},

		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);

			//extend the router
			this._router = this.getRouter();

			//navigate to initial page for !phone
			if (!sap.ui.Device.system.phone) {
				this._router.getTargets().display("welcome");
			}

			// initialize the router
			this._router.initialize();

		},

		myNavBack : function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this._router.navTo("home", {}, true);
			}
		},

		createContent: function () {

			// set i18n model
			var oI18nModel = new ResourceModel({
				bundleUrl: "i18n/appTexts.properties"
			});
			sap.ui.getCore().setModel(oI18nModel, "i18n");

			// create root view
			var oView = sap.ui.view({
				viewName: "view.App",
				type: "XML"
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
				var sMsg = "Running in demo mode with mock data.";
				sap.m.MessageToast.show(sMsg, {
					duration: 2000
				});
			}

			var oModel = new ODataModel(sUrl, true, model.Config.getUser(), model.Config.getPwd());
			//if we do not set this property to false, this would lead to a synchronized request which blocks the ui
			oModel.setCountSupported(false);

			oView.setModel(oModel);

			//create and set cart model
			var oCartModel = new JSONModel({
				entries: [],
				totalPrice: "0",
				showEditAndProceedButton: false
			});
			oView.setModel(oCartModel, "cartProducts");


			// set device model
			var oDeviceModel = new JSONModel({
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(oDeviceModel, "device");


			// done
			return oView;
		}
	});

});
