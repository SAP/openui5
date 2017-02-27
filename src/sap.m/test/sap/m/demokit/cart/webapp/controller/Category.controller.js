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
			var oList = this.getView().byId("productList");
			var aListItems = oList.getItems();
			aListItems.some(function(oItem) {
				if (oItem.getBindingContext().sPath === "/Products('" + this._sProductId + "')") {
					oList.setSelectedItem(oItem);
					return true;
				}
			}.bind(this));
		},

		/**
		 * Event handler to determine which list item is selected
		 * @param {sap.ui.base.Event} oEvent the list select event
		 */
		onProductListSelect : function (oEvent) {
			this._showProduct(oEvent);
		},

		/**
		 * Event handler to determine which sap.m.ObjectListItem is pressed
		 * @param {sap.ui.base.Event} oEvent the sap.m.ObjectListItem press event
		 */
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

		/**
		 * Navigation back to home view
		 */
		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},

		/**
		 * Navigation to cart view
		 */
		onCartButtonPress :  function () {
			this._router.navTo("cart");
		},

		/**
		 * Event handler to determine if the sap.m.ToggleButton is pressed or not
		 * @param {sap.ui.base.Event} oEvent sap.m.ToggleButton press event
		 */
		onAvailabilityFilterToggle : function (oEvent) {
			var oList = this.getView().byId("productList");
			var oBinding = oList.getBinding("items");
			var oStatusFilter = new Filter("Status", FilterOperator.EQ, "A");

			if (oEvent.getParameter("pressed")) {
				oBinding.filter([oStatusFilter]);
			} else {
				oBinding.filter(null);
			}
		}
	});
});
