sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], (BaseController, formatter, Device, Filter, FilterOperator, JSONModel, Fragment) => {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Category", {
		formatter,

		// Define filterPreviousValues as global variables because they need to be accessed from different functions
		_iLowFilterPreviousValue: 0,

		_iHighFilterPreviousValue: 5000,

		onInit() {
			const oViewModel = new JSONModel({
				Suppliers: []
			});
			this.getView().setModel(oViewModel, "view");
			const oComponent = this.getOwnerComponent();
			this._oRouter = oComponent.getRouter();
			this._oRouter.getRoute("category").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("productCart").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("product").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("comparison").attachMatched(this._loadCategories, this);
			this._oRouter.getRoute("comparisonCart").attachMatched(this._loadCategories, this);
		},

		_loadCategories(oEvent) {
			const bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode"),
				sRouteName = oEvent.getParameter("name");

			// switch to first column in full screen mode for category route on small devices
			if (sRouteName === "category") {
				this._setLayout(bSmallScreen ? "One" : "Two");
			}

			const oModel = this.getModel();
			this._loadSuppliers();
			const oProductList = this.byId("productList");
			const oBinding = oProductList.getBinding("items");
			oBinding.attachDataReceived(this.fnDataReceived, this);
			const sId = oEvent.getParameter("arguments").id;
			this._sProductId = oEvent.getParameter("arguments").productId;
			// the binding should be done after insuring that the metadata is loaded successfully
			oModel.metadataLoaded().then(() => {
				const oView = this.getView(),
					sPath = "/" + this.getModel().createKey("ProductCategories", {
					Category: sId
				});
				oView.bindElement({
					path: sPath,
					parameters: {
						expand: "Products"
					},
					events: {
						dataRequested() {
							oView.setBusy(true);
						},
						dataReceived() {
							oView.setBusy(false);
						}
					}
				});
			});
		},

		/**
		 * Create a unique array of suppliers to be used in the supplier filter option.
		 */
		_loadSuppliers() {
			const oModel = this.getModel();
			oModel.read("/Products", {
				success: (oData) => {
					const aProducts = oData.results,
						aSuppliers = [];

					aProducts.forEach((oProduct) => {
						aSuppliers.push(oProduct.SupplierName);
					});
					// remove duplications from the suppliers array and sort it
					const aUniqueSuppliers = aSuppliers.filter((sName, iIndex, aUniqueSuppliers) => {
						return aUniqueSuppliers.indexOf(sName) === iIndex;
					}).sort();

					// create the unique suppliers array as array of of objects
					aUniqueSuppliers.map((sSupplierName, iIndex, aUniqueSuppliers) => {
						aUniqueSuppliers[iIndex] = {SupplierName: sSupplierName};
					});
					this.getModel("view").setProperty("/Suppliers", aUniqueSuppliers);
				}
			});
			this._clearComparison();
		},

		fnDataReceived() {
			const oList = this.byId("productList");
			const aListItems = oList.getItems();
			aListItems.some((oItem) => {
				if (oItem.getBindingContext().getPath() === `/Products('${this._sProductId}')`) {
					oList.setSelectedItem(oItem);
					return true;
				}

				return false;
			});
		},

		/**
		 * Event handler to determine which list item is selected
		 * @param {sap.ui.base.Event} oEvent the list select event
		 */
		onProductListSelect(oEvent) {
			this._showProduct(oEvent);
		},

		/**
		 * Event handler to determine which sap.m.ObjectListItem is pressed
		 * @param {sap.ui.base.Event} oEvent the sap.m.ObjectListItem press event
		 */


		onProductDetails(oEvent) {
			let oBindContext;
			if (Device.system.phone) {
				oBindContext = oEvent.getSource().getBindingContext();
			} else {
				oBindContext = oEvent.getSource().getSelectedItem().getBindingContext();
			}
			const oModel = oBindContext.getModel();
			const sCategoryId = oModel.getProperty(oBindContext.getPath()).Category;
			const sProductId = oModel.getProperty(oBindContext.getPath()).ProductId;

			// keep the cart context when showing a product
			const bCartVisible = this.getModel("appView").getProperty("/layout").startsWith("Three");
			this._setLayout("Two");
			this._oRouter.navTo(bCartVisible ? "productCart" : "product", {
				id: sCategoryId,
				productId: sProductId
			}, !Device.system.phone);
		},

		/**
		 * Applies selected filters to the category list and update text and visibility of the info toolbar.
		 * @param {sap.ui.base.Event} oEvent the press event of the sap.m.Button
		 */
		async _applyFilter(oEvent) {
			const oList = this.byId("productList");
			const oBinding = oList.getBinding("items");
			const aSelectedFilterItems = oEvent.getParameter("filterItems");
			const oCustomFilter =  this.byId("categoryFilterDialog").getFilterItems()[1];
			const oCustomKeys = {};
			const aFilters = [];
			const aAvailableFilters = [];
			const aPriceFilters = [];
			const aSupplierFilters = [];

			// Add the slider custom filter if the user selects some values
			if (oCustomFilter.getCustomControl().getAggregation("content")[0].getValue()
					!== oCustomFilter.getCustomControl().getAggregation("content")[0].getMin()
				|| oCustomFilter.getCustomControl().getAggregation("content")[0].getValue2()
					!== oCustomFilter.getCustomControl().getAggregation("content")[0].getMax()) {
				aSelectedFilterItems.push(oCustomFilter);
			}
			let oFilter;
			aSelectedFilterItems.forEach((oItem) => {
				const sFilterKey = oItem.getProperty("key");
				let iValueLow;
				let iValueHigh;
				switch (sFilterKey) {
					case "Available":
						oFilter = new Filter("Status", FilterOperator.EQ, "A");
						aAvailableFilters.push(oFilter);
						break;
					case "OutOfStock":
						oFilter = new Filter("Status", FilterOperator.EQ, "O");
						aAvailableFilters.push(oFilter);
						break;
					case "Discontinued":
						oFilter = new Filter("Status", FilterOperator.EQ, "D");
						aAvailableFilters.push(oFilter);
						break;
					case "Price":
						iValueLow = oItem.getCustomControl().getAggregation("content")[0].getValue();
						iValueHigh = oItem.getCustomControl().getAggregation("content")[0].getValue2();
						oFilter = new Filter("Price", FilterOperator.BT, iValueLow, iValueHigh);
						aPriceFilters.push(oFilter);
						oCustomKeys["priceKey"] = {Price: true};
						break;
					default:
						oFilter = new Filter("SupplierName", FilterOperator.EQ, sFilterKey);
						aSupplierFilters.push(oFilter);

				}
			});
			if (aAvailableFilters.length > 0) {
				aFilters.push(new Filter({filters: aAvailableFilters}));
			}
			if (aPriceFilters.length > 0) {
				aFilters.push(new Filter({filters: aPriceFilters}));
			}
			if (aSupplierFilters.length > 0) {
				aFilters.push(new Filter({filters: aSupplierFilters}));
			}
			oFilter = new Filter({filters: aFilters, and: true});
			if (aFilters.length > 0) {
				const oResourceBundle = await this.requestResourceBundle();
				oBinding.filter(oFilter);
				this.byId("categoryInfoToolbar").setVisible(true);
				let sText = oResourceBundle.getText("filterByText") + " ";
				let sSeparator = "";
				const oFilterKey = oEvent.getParameter("filterCompoundKeys");
				const oKeys = {...oFilterKey, ...oCustomKeys};
				for (const key in oKeys) {
					if (oKeys.hasOwnProperty(key)) {
						sText = sText + sSeparator  + oResourceBundle.getText(key,
							[this._iLowFilterPreviousValue, this._iHighFilterPreviousValue]);
						sSeparator = ", ";
					}
				}
				this.byId("categoryInfoToolbarTitle").setText(sText);
			} else {
				oBinding.filter(null);
				this.byId("categoryInfoToolbar").setVisible(false);
				this.byId("categoryInfoToolbarTitle").setText("");
			}
		},

		/**
		 * Opens the filter dialog
		 */
		onFilter() {
			// load asynchronous XML fragment
			if (!this._pCategoryFilterDialog) {
				this._pCategoryFilterDialog = Fragment.load({
					id: this.getView().getId(),
					name: "sap.ui.demo.cart.view.CategoryFilterDialog",
					controller: this
				}).then((oDialog) => {
					// connect dialog to the root view of this component (models, lifecycle)
					this.getView().addDependent(oDialog);
					oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					return oDialog;
				});
			}
			this._pCategoryFilterDialog.then((oDialog) => {
				oDialog.open();
			});
		},

		/**
		 * Updates the previous slider values
		 * @param {sap.ui.base.Event} oEvent the press event of the sap.m.Button
		 */
		async handleConfirm(oEvent) {
			const oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[1];
			const oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			this._iLowFilterPreviousValue = oSlider.getValue();
			this._iHighFilterPreviousValue = oSlider.getValue2();
			await this._applyFilter(oEvent);
		},

		/**
		 * Sets the slider values to the previous ones
		 * Updates the filter count
		 */
		handleCancel() {
			const oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[1];
			const oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(this._iLowFilterPreviousValue).setValue2(this._iHighFilterPreviousValue);
			if (this._iLowFilterPreviousValue > oSlider.getMin() || this._iHighFilterPreviousValue !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}
		},

		/**
		 * Updates filter count if there is a change in one of the slider values
		 * @param {sap.ui.base.Event} oEvent the change event of the sap.m.RangeSlider
		 */
		handleChange(oEvent) {
			const oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[1];
			const oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			const iLowValue = oEvent.getParameter("range")[0];
			const iHighValue = oEvent.getParameter("range")[1];
			if (iLowValue !== oSlider.getMin() || iHighValue !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}
		},

		/**
		 * Resets the price custom filter
		 */
		handleResetFilters() {
			const oCustomFilter = this.byId("categoryFilterDialog").getFilterItems()[1];
			const oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(oSlider.getMin());
			oSlider.setValue2(oSlider.getMax());
			oCustomFilter.setFilterCount(0);
		},

		/**
		 * Navigates to the comparison view
		 * @param {sap.ui.base.Event} oEvent the press event of the link text in sap.m.ObjectListItem
		 */
		compareProducts(oEvent) {
			const oProduct = oEvent.getSource().getBindingContext().getObject();
			const sItem1Id = this.getModel("comparison").getProperty("/item1");
			const sItem2Id = this.getModel("comparison").getProperty("/item2");
			this._oRouter.navTo("comparison", {
				id: oProduct.Category,
				item1Id: (sItem1Id ? sItem1Id : oProduct.ProductId),
				item2Id: (sItem1Id && sItem1Id != oProduct.ProductId ? oProduct.ProductId : sItem2Id)
			}, true);
		},

		/**
		 * Always navigates back to category overview
		 * @override
		 */
		onBack() {
			this.getRouter().navTo("categories");
		}
	});
});