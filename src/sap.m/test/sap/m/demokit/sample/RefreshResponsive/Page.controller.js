sap.ui.define([
		'jquery.sap.global',
		'sap/ui/Device',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Device, Controller, Filter, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.RefreshResponsive.Page", {

		onInit: function (oEvent) {

			var oView = this.getView();

			// set device model
			var deviceModel = new JSONModel({
				isNoTouch : !Device.support.touch,
				isTouch : Device.support.touch
			});
			deviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(deviceModel, "device");

			// Responsiveness: move the search bar below the pull to refresh on touch devices
			if (Device.support.touch) {
				var bar = this.getView().byId("searchBar");
				var page = this.getView().byId("page");
				page.insertAggregation("content", bar, 1);
			}

			// Create mock model to simulate more results from the backend
			oView.setModel(new JSONModel({
				ProductCollection: []
			}));

			// load product data
			this._productCount = 0;
			var that = this;
			jQuery.getJSON(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"), function (oData) {
				that._productData = oData;
				that._pushNewProduct();
			});
		},

		// Simulates increasing collection of products.
		// Obviously not for productive use at all.
		_pushNewProduct: function () {
			var aColl = this._productData.ProductCollection;
			if (this._productCount < aColl.length) {
				var oView = this.getView();
				var oData = oView.getModel().getData();
				oData.ProductCollection.push(aColl[this._productCount++]);
				oView.getModel().setData(oData);
			}
		},

		handleRefresh: function (oEvent) {

			setTimeout(jQuery.proxy(function () {

				this._pushNewProduct();
				this.getView().byId("pullToRefresh").hide();

				// Deal with any actual search query
				var oList = this.getView().byId("list");
				var oSearchField = this.getView().byId("searchField");
				var sQuery = oSearchField.getValue();
				var aFilters = [];
				if (sQuery && sQuery.length) {
					aFilters.push(new Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery));
				}
				oList.getBinding("items").filter(aFilters);

			}, this), 1000);
		}
	});


	return PageController;

});
