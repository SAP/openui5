sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController',
	'sap/ui/demo/cart/model/formatter',
	'sap/ui/Device',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'jquery.sap.global'
], function (BaseController,
			 formatter,
			 Device,
			 Filter,
			 FilterOperator,
			 $) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Category", {
		formatter : formatter,
		// Define filterPreviousValues as global variables because they need to be accessed from different functions
		_filterPreviousValue: 0,
		_filterPreviousValue2: 5000,

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

		/** Apply selected filters to the category list and update text and visibility of the info toolbar
		 * @param oEvent {sap.ui.base.Event} the press event of the sap.m.Button
		 * @private
		 */
		_applyFilter : function (oEvent) {
			var oList = this.getView().byId("productList"),
				oBinding = oList.getBinding("items"),
				aSelectedFilterItems = oEvent.getParameter("filterItems"),
				oCustomFilter =  this._oDialog.getFilterItems()[1],
				oFilter,
				oCustomKeys = {},
				aFilters = [],
				aAvailableFilters = [],
				aPriceFilters = [];

			// Add the slider custom filter if the user selects some values
			if (oCustomFilter.getCustomControl().getAggregation("content")[0].getValue() !== oCustomFilter.getCustomControl().getAggregation("content")[0].getMin() ||
				oCustomFilter.getCustomControl().getAggregation("content")[0].getValue2() !== oCustomFilter.getCustomControl().getAggregation("content")[0].getMax()) {
				aSelectedFilterItems.push(oCustomFilter);
			}
			aSelectedFilterItems.forEach(function (oItem) {
				var sFilterKey = oItem.getProperty("key"),
					iValueLow,
					iValueHigh;
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
				}
			});
			if (aAvailableFilters.length > 0) {
				aFilters.push(new Filter({filters: aAvailableFilters}));
			}
			if (aPriceFilters.length > 0) {
				aFilters.push(new Filter({filters: aPriceFilters}));
			}
			oFilter = new Filter({filters: aFilters, and: true});
			if (aFilters.length > 0) {
				oBinding.filter(oFilter);
				this.byId("categoryInfoToolbar").setVisible(true);
				var sText = this.getResourceBundle().getText("filterByText") + " ";
				var sSeparator = "";
				var oFilterKey = oEvent.getParameter("filterCompoundKeys");
				var oKeys = $.extend(oFilterKey, oCustomKeys);
				for (var key in oKeys) {
					if (oKeys.hasOwnProperty(key)) {
						sText = sText + sSeparator  + this.getResourceBundle().getText(key, [this._filterPreviousValue, this._filterPreviousValue2]);
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
		 * Open the filter dialog
		 */
		onMasterListFilterPressed: function () {
			this._getDialog().open();
		},

		/**
		 * Define and return {sap.ui.xmlfragment}
		 * @private
		 */
		_getDialog: function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.ui.demo.cart.view.MasterListFilterDialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		/**
		 * Updates the previous slider values
		 * @param {sap.ui.base.Event} oEvent the press event of the sap.m.Button
		 */
		handleConfirm: function (oEvent) {
			var oCustomFilter = this._getDialog().getFilterItems()[1];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			this._filterPreviousValue = oSlider.getValue();
			this._filterPreviousValue2 = oSlider.getValue2();
			this._applyFilter(oEvent);
		},

		/**
		 * Sets the slider values to the previous ones
		 * Updates the filter count
		 */
		handleCancel: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[1];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(this._filterPreviousValue).setValue2(this._filterPreviousValue2);
			if (this._filterPreviousValue > oSlider.getMin() || this._filterPreviousValue2 !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}
		},

		/**
		 * Updates filter count if there is a change in one of the slider values
		 * @param {sap.ui.base.Event} oEvent the change event of the sap.m.RangeSlider
		 */
		handleChange: function (oEvent) {
			var oCustomFilter = this._getDialog().getFilterItems()[1];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			var iLowValue = oEvent.getParameter("range")[0];
			var iHighValue = oEvent.getParameter("range")[1];
			if (iLowValue !== oSlider.getMin() || iHighValue !== oSlider.getMax()) {
				oCustomFilter.setFilterCount(1);
			} else {
				oCustomFilter.setFilterCount(0);
			}

		},

		/**
		 * Reset the price custom filter
		 */
		handleResetFilters: function () {
			var oCustomFilter = this._oDialog.getFilterItems()[1];
			var oSlider = oCustomFilter.getCustomControl().getAggregation("content")[0];
			oSlider.setValue(oSlider.getMin());
			oSlider.setValue2(oSlider.getMax());
			oCustomFilter.setFilterCount(0);
		}
	});
});
