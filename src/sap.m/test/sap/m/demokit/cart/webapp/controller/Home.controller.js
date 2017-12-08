sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/formatter',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (
	BaseController,
	formatter,
	Filter,
	FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Home", {
		formatter : formatter,

		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			// trigger first search to set visibilities right
			this._search();
		},

		onSearch: function () {
			this._search();
		},

		onRefresh: function () {
			// trigger search again and hide pullToRefresh when data ready
			var oProductList = this.byId("productList");
			var oBinding = oProductList.getBinding("items");
			var fnHandler = function () {
				this.byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			}.bind(this);
			oBinding.attachDataReceived(fnHandler);
			this._search();
		},

		_search: function () {
			var oView = this.getView();
			var oProductList = oView.byId("productList");
			var oCategoryList = oView.byId("categoryList");
			var oSearchField = oView.byId("searchField");

			// switch visibility of lists
			var bShowSearchResults = oSearchField.getValue().length !== 0;
			oProductList.setVisible(bShowSearchResults);
			oCategoryList.setVisible(!bShowSearchResults);

			if (bShowSearchResults) {
				this._changeNoDataTextToIndicateLoading(oProductList);
			}

			// filter product list
			var oBinding = oProductList.getBinding("items");
			if (oBinding) {
				if (bShowSearchResults) {
					var oFilter = new Filter("Name", FilterOperator.Contains, oSearchField.getValue());
					oBinding.filter([oFilter]);
				} else {
					oBinding.filter([]);
				}
			}
		},

		_changeNoDataTextToIndicateLoading: function (oList) {
			var sOldNoDataText = oList.getNoDataText();
			oList.setNoDataText("Loading...");
			oList.attachEventOnce("updateFinished", function () {
				oList.setNoDataText(sOldNoDataText);
			});
		},

		onCategoryListItemPress: function (oEvent) {
			var oBindContext = oEvent.getSource().getBindingContext();
			var oModel = oBindContext.getModel();
			var sCategoryId = oModel.getData(oBindContext.getPath()).Category;
			this._router.navTo("category", {id: sCategoryId});
		},

		onProductListSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress: function (oEvent) {
			var oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct: function (oItem) {
			var oBindContext = oItem.getBindingContext();
			var oModel = oBindContext.getModel();
			var sId = oModel.getData(oBindContext.getPath()).ProductId;
			this._router.navTo("cartProduct", {productId: sId}, !sap.ui.Device.system.phone);
		},

		onNavButtonPress : function () {
			this.getOwnerComponent().myNavBack();
		},

		onCartButtonPress: function () {
			this._router.navTo("cart");
		}
	});
});