sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/formatter',
	'sap/ui/demo/cart/model/cart',
	'sap/m/MessageToast',
	'sap/m/MessageBox'
], function ($, BaseController, formatter, cart) {
	return BaseController.extend("sap.ui.demo.cart.controller.Product", {
		formatter : formatter,
		cart: cart,

		onInit : function () {
			var oComponent = this.getOwnerComponent();

			this._router = oComponent.getRouter();
			this._router.getRoute("product").attachPatternMatched(this._routePatternMatched, this);
			this._router.getRoute("cartProduct").attachPatternMatched(this._routePatternMatched, this);

			// register for events
			var oBus = sap.ui.getCore().getEventBus();
			oBus.subscribe("shoppingCart", "updateProduct", this.fnUpdateProduct, this);
		},

		_routePatternMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").productId,
				oView = this.getView(),
				sPath = "/Products('" + sId + "')";

			var oModel = oView.getModel();
			var oData = oModel.getData(sPath);
			oView.bindElement({
				path: sPath,
				events: {
					dataRequested: function () {
						oView.setBusy(true);
					},
					dataReceived: function () {
						oView.setBusy(false);
					}
				}
			});
			//if there is no data the model has to request new data
			if (!oData) {
				oView.setBusyIndicatorDelay(0);
				oView.getElementBinding().attachEventOnce("dataReceived", function() {
					// reset to default
					oView.setBusyIndicatorDelay(null);
					this._checkIfProductAvailable(sPath, sId);
				}.bind(this));
			}
		},

		fnUpdateProduct: function(sChannel, sEvent, oData) {
			var fnCheck = function () {
				this._checkIfProductAvailable(sPath, oData.productId);
			};
			var sPath = "/Products('" + oData.productId + "')";
			this.getView().bindElement({
				path: sPath,
				events: {
					change: fnCheck.bind(this)
				}
			});
		},

		_checkIfProductAvailable: function(sPath) {
			var oModel = this.getModel();
			var oData = oModel.getData(sPath);

			// show not found page
			if (!oData) {
				this._router.getTargets().display("notFound");
			}
		},

		onAddButtonPress : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oProduct = this.getView().getBindingContext().getObject();
			var oCartModel = this.getView().getModel("cartProducts");
			cart.addToCart(oResourceBundle, oProduct, oCartModel);
		},

		onCartButtonPress :  function () {
			this._router.navTo("cart");
		},

		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},

		onPicturePress: function () {
			this.byId("lightBox").open();
		}

	});
});