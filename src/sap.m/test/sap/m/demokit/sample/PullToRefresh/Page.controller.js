sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.PullToRefresh.Page", {

		onInit: function (oEvent) {

			// Create mock model to simulate more results from the backend
			this.getView().setModel(new JSONModel({
				ProductCollection: []
			}));

			// load product data
			this._productCount = 0;
			jQuery.getJSON(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json", function (oData) {
				this._productData = oData;
				this._pushNewProduct();
			}.bind(this));
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

		// simulate a refresh of the date that lasts 2 secs
		handleRefresh : function (evt) {
			setTimeout(function () {
				this.byId("pullToRefresh").hide();
				this._pushNewProduct();
			}.bind(this), 1000);
		}
	});


	return PageController;

});