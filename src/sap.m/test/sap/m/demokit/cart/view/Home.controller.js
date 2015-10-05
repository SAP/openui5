jQuery.sap.require("sap.ui.demo.cart.util.Formatter");
jQuery.sap.require("sap.ui.demo.cart.model.Config");

sap.ui.controller("sap.ui.demo.cart.view.Home", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
		// trigger first search to set visibilities right
		this._search();
	},

	handleSearch : function (oEvent) {
		this._search();
	},

	handleRefresh : function (oEvent) {
		var that = this;
		if (model.Config.isMock) {
			// just wait if we do not have oData services
			setTimeout(function () {
				that.getView().byId("pullToRefresh").hide();
			}, 2000);
		} else {
			// trigger search again and hide pullToRefresh when data ready
			var oProductList = this.getView().byId("productList");
			var oBinding = oProductList.getBinding("items");
			var fnHandler = function() {
				that.getView().byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			};
			oBinding.attachDataReceived(fnHandler);
			that._search();
		}
	},

	_search : function () {
		var oView = this.getView();
		var oProductList = oView.byId("productList");
		var oCategoryList = oView.byId("categoryList");
		var oSearchField = oView.byId("searchField");

		// switch visibility of lists
		var bShowSearch = oSearchField.getValue().length !== 0;
		oProductList.toggleStyleClass("invisible", !bShowSearch);
		oCategoryList.toggleStyleClass("invisible", bShowSearch);
		
		if (bShowSearch) {
			this._changeNoDataTextToIndicateLoading(oProductList);
		}

		// filter product list
		var oBinding = oProductList.getBinding("items");
		if (oBinding) {
			if (bShowSearch) {
				var oFilter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, oSearchField.getValue());
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		}
	},
	
	_changeNoDataTextToIndicateLoading: function (oList) {
		var sOldNoDataText = oList.getNoDataText();
		oList.setNoDataText("Loading...");
		oList.attachEventOnce("updateFinished", function() {oList.setNoDataText(sOldNoDataText);});
	},

	handleCategoryListItemPress : function (oEvent) {
		var oBindContext = oEvent.getSource().getBindingContext();
		var oModel = oBindContext.getModel();
		var sCategoryId = oModel.getData(oBindContext.getPath()).Category;
		this._router.navTo("category", {id: sCategoryId});
	},
	
	handleProductListSelect: function (oEvent) {
		var oItem = oEvent.getParameter("listItem");
		this._showProduct(oItem);
	},
	
	handleProductListItemPress: function (oEvent) {
		var oItem = oEvent.getSource();
		this._showProduct(oItem);
	},
	
	_showProduct: function (oItem) {
		var oBindContext = oItem.getBindingContext();
		var oModel = oBindContext.getModel();
		var sId = oModel.getData(oBindContext.getPath()).ProductId;
		this._router.navTo("cartProduct", {productId: sId}, !sap.ui.Device.system.phone);
	},
	
	handleCartButtonPress :  function (oEvent) {
		this._router.navTo("cart");
	}
});