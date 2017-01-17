sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/formatter',
	'sap/ui/Device',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (BaseController,
			 formatter,
			 Device,
			 Filter,
			 FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Category", {
		formatter : formatter,

		onInit: function () {
			var oComponent = this.getOwnerComponent();

			this._router = oComponent.getRouter();
			this._router.getRoute("category").attachMatched(this._loadCategory, this);
			this._router.getRoute("product").attachMatched(this._loadCategory, this);
		},

		_loadCategory: function(oEvent) {
			var oProductList = this.getView().byId("productList");
			this._changeNoDataTextToIndicateLoading(oProductList);
			var oBinding = oProductList.getBinding("items");
			oBinding.attachDataReceived(this.fnDataReceived, this);
			var sId = oEvent.getParameter("arguments").id;
			this._sProductId = oEvent.getParameter("arguments").productId;

			this.getView().bindElement({
				path : "/ProductCategories('" + sId + "')",
				parameters: {
					expand: "Products"
				}
			});
		},

		_changeNoDataTextToIndicateLoading: function (oList) {
			var sOldNoDataText = oList.getNoDataText();
			oList.setNoDataText("Loading...");
			oList.attachEventOnce("updateFinished", function() {oList.setNoDataText(sOldNoDataText);});
		},

		fnDataReceived: function() {
			var that = this,
				oList = this.getView().byId("productList");
			var aListItems = oList.getItems();
			aListItems.some(function(oItem) {
				if (oItem.getBindingContext().sPath === "/Products('" + that._sProductId + "')") {
					oList.setSelectedItem(oItem);
					return true;
				}
			});
		},

		onProductListSelect : function (oEvent) {
			this._showProduct(oEvent);
		},

		onProductListItemPress : function (oEvent) {
			this._showProduct(oEvent);
		},

		_showProduct: function (oEvent) {
			var oBindContext;
			if (sap.ui.Device.system.phone) {
				oBindContext = oEvent.getSource().getBindingContext();
			} else {
				oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			}
			var oModel = oBindContext.getModel();
			var sCategoryId = oModel.getData(oBindContext.getPath()).Category;
			var sProductId = oModel.getData(oBindContext.getPath()).ProductId;
			this._router.navTo("product", {id: sCategoryId, productId: sProductId}, !Device.system.phone);
		},

		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},

		onCartButtonPress :  function () {
			this._router.navTo("cart");
		},

		onAvailabilityFilterToggle : function (oEvent) {
			var oList = this.getView().byId("productList");
			var oBinding = oList.getBinding("items");
			var oStatusFilter = new Filter("status", FilterOperator.EQ, "A");

			if(oEvent.getParameter("pressed")) {
				oBinding.filter([oStatusFilter]);
			}
			else {
				oBinding.filter(null);
			}
		}
	});
});
