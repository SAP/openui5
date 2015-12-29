sap.ui.define(function() {
	"use strict";

	var Formatter = {

		weightState :  function (fValue) {

			try {
				fValue = parseFloat(fValue);
				if (fValue < 0) {
					return "None";
				} else if (fValue < 1000) {
					return "Success";
				} else if (fValue < 2000) {
					return "Warning";
				} else {
					return "Error";
				}
			} catch (err) {
				return "None";
			}
		},

		round2DP : function (nNumber) {
			return (Math.round(nNumber * 100) / 100).toFixed(2);
		},

		// Only display dimensions that are available
		dimensions : function (iWidth, iDepth, iHeight, sDimUnit) {
			var sDimDisplay = [iWidth, iDepth, iHeight].filter(function (element) {
				return element;
			}).join(" x ");
			if (sDimDisplay) {
				sDimDisplay += " " + sDimUnit;
			}
			return sDimDisplay;
		},

		// A formatter-helper that returns a list of
		// products that have been selected
		listProductsSelected : function (oContext) {
			var mOrder = oContext.getModel("Order").getData();
			var oModel = oContext.getModel();
			return Object.keys(mOrder.products)
				.filter(function(sKey) { return mOrder.products[sKey]; })
				.map(function(sKey) { return oModel.getProperty(sKey); });
		},

		// Returns whether a given product has been selected
		isProductSelected : function (sProductId) {
			var aProductsSelected = Formatter.listProductsSelected(this);
			return aProductsSelected.map(function(mProduct) {
				return mProduct.ProductId;
			}).indexOf(sProductId) != -1;
		},

		// Returns whether there are any products selected at all
		isAnyProductSelected : function () {
			return Formatter.listProductsSelected(this).length > 0;
		},

		// Returns a list item type depending on whether we're on
		// a branch or a leaf node of the hierarchy. We determine
		// that we're on a leaf if there's a ProductId
		listItemType : function (sProductId) {
			return sProductId ? "Inactive" : "Navigation";
		}
	};

	return Formatter;

}, /* bExport= */ true);
