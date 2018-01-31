sap.ui.define([
	'jquery.sap.global',
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/formatter',
	'sap/ui/demo/cart/model/cart'
], function ($, BaseController, formatter, cart) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Product", {
		formatter : formatter,
		cart: cart,

		onInit : function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("product").attachPatternMatched(this._routePatternMatched, this);
			this._router.getRoute("cartProduct").attachPatternMatched(this._routePatternMatched, this);

			this._router.getTarget("productView").attachDisplay(function (oEvent) {
				this.fnUpdateProduct(oEvent.getParameter("data").productId);// update the binding based on products cart selection
			}, this);
		},

		_routePatternMatched: function(oEvent) {
			var sId = oEvent.getParameter("arguments").productId,
				oView = this.getView(),
				oModel = oView.getModel();
			// the binding should be done after insuring that the metadata is loaded successfully
			oModel.metadataLoaded().then(function () {
				var sPath = "/" + this.getModel().createKey("Products", {
						ProductId: sId
					});
				oView.bindElement({
					path : sPath,
					events: {
						dataRequested: function () {
							oView.setBusy(true);
						},
						dataReceived: function () {
							oView.setBusy(false);
						}
					}
				});
				var oData = oModel.getData(sPath);
				//if there is no data the model has to request new data
				if (!oData) {
					oView.setBusyIndicatorDelay(0);
					oView.getElementBinding().attachEventOnce("dataReceived", function() {
						// reset to default
						oView.setBusyIndicatorDelay(null);
						this._checkIfProductAvailable(sPath);
					}.bind(this));
				}
			}.bind(this));
		},

		fnUpdateProduct: function(productId) {
			var sPath = "/Products('" + productId + "')",
				fnCheck = function () {
					this._checkIfProductAvailable(sPath);
				};

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

		/**
		 * Called, when the add button of a product is pressed.
		 * Saves the product, the i18n bundle, and the cart model and hands them to the <code>addToCart</code> function
		 * @public
		 */
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
		}
	});
});