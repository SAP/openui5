sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device"
], (BaseController, formatter, Filter, FilterOperator, Device) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Home", {
		formatter,

		onInit() {
			const oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("categories").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched() {
			const bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode");
			if (bSmallScreen) {
				this._setLayout("One");
			}
		},

		onSearch() {
			this._search();
		},

		onRefresh() {
			// trigger search again and hide pullToRefresh when data ready
			const oProductList = this.byId("productList");
			const oBinding = oProductList.getBinding("items");
			const fnHandler = () => {
				this.byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			};
			oBinding.attachDataReceived(fnHandler);
			this._search();
		},

		_search() {
			const oView = this.getView();
			const oCategoryList = oView.byId("categoryList");
			const oProductList = oView.byId("productList");
			const oSearchField = oView.byId("searchField");

			// switch visibility of lists
			const bShowSearchResults = oSearchField.getValue().length !== 0;
			oProductList.setVisible(bShowSearchResults);
			oCategoryList.setVisible(!bShowSearchResults);

			// filter product list
			const oBinding = oProductList.getBinding("items");
			if (oBinding) {
				if (bShowSearchResults) {
					const oFilter = new Filter({
						path: "Name",
						operator: FilterOperator.Contains,
						value1: oSearchField.getValue()
					});
					oBinding.filter([oFilter]);
				} else {
					oBinding.filter([]);
				}
			}
		},

		onCategoryListItemPress(oEvent) {
			const oBindContext = oEvent.getSource().getBindingContext();
			const oModel = oBindContext.getModel();
			const sCategoryId = oModel.getProperty(oBindContext.getPath()).Category;

			this._router.navTo("category", {id: sCategoryId});
		},

		onProductListSelect(oEvent) {
			const oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress(oEvent) {
			const oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct(oItem) {
			const oEntry = oItem.getBindingContext().getObject();

			this._router.navTo("product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		/**
		 * Always navigates back to home
		 * @override
		 */
		onBack() {
			this.getRouter().navTo("home");
		}
	});
});
