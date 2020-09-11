sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {
	"use strict";

	var SampleExtension = Extension.extend("card.explorer.adaptive.extensionSample.SampleExtension");

	SampleExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);
		this.attachAction(this._handleAction.bind(this));
	};

	/* Custom event handler for the submit event.
	Intercepts submit action, performs validation and/or data modifications. */
	SampleExtension.prototype._handleAction = function (oEvent) {
		var oCard = this.getCard(),
			sActionType = oEvent.getParameter("type"),
			mParams = oEvent.getParameter("parameters"),
			mSubmitData = mParams.data;

		if (sActionType !== "Submit") {
			return;
		}

		oEvent.preventDefault();

		if (mSubmitData.ProductName.length > 20) {
			oCard.showMessage("{i18n>ERROR_LONG_PRODUCT_NAME}", "Error");
			return;
		}

		// Submits to a mock server
		oCard.request({
			"url": "samples/adaptive/extensionSample/MOCK.json",
			"method": "GET",
			"parameters": mSubmitData
		}).then(function () {
			oCard.showMessage("{i18n>SUCCESSFUL_SUBMIT}", "Success");
		}).catch(function(sErrorMessage) {
			oCard.showMessage(sErrorMessage, "Error");
		});
	};

	// Gets all data for the card.
	SampleExtension.prototype.getData = function () {
		var mParameters = this.getCard().getCombinedParameters(),
			iProductId = mParameters.productId,
			pProduct = this._getProduct(iProductId),
			pCategories = this._getCategories();

		return Promise.all([pProduct, pCategories])
			.then(function (aResult) {
				return {
					product: aResult[0],
					categories: aResult[1]
				};
			});
	};

	// Fetches a product using destinations property from manifest.json.
	SampleExtension.prototype._getProduct = function (iProductId) {
		return this.getCard().request({
			"url": "{{destinations.northwind}}/Products",
			"parameters": {
				"$format": "json",
				"$filter": "ProductID eq " + iProductId
			}
		}).then(function (oData) {
			var oProduct = oData.value[0];
			oProduct.CategoryID = oProduct.CategoryID + "";

			// fetch supplier
			return this._getSupplier(oProduct.SupplierID).then(function (oSupplier) {
				oProduct.supplier = oSupplier;
				return oProduct;
			});
		}.bind(this));
	};

	// Fetches a supplier via the card API from the destionation defined in the manifest file.
	SampleExtension.prototype._getSupplier = function (iSupplierId) {
		return this.getCard().request({
			"url": "{{destinations.northwind}}/Suppliers",
			"parameters": {
				"$format": "json",
				"$filter": "SupplierID eq " + iSupplierId
			}
		}).then(function (oData) {
			return oData.value[0];
		});
	};

	// Fetches a list of all product categories in Northwind.
	SampleExtension.prototype._getCategories = function () {
		return this.getCard().request({
			"url": "{{destinations.northwind}}/Categories",
			"parameters": {
				"$format": "json"
			}
		}).then(function (oData) {
			var aCategories = oData.value;

			aCategories.map(function (oCategory) {
				oCategory.CategoryID = oCategory.CategoryID + "";
			});

			return aCategories;
		});
	};

	return SampleExtension;
});
