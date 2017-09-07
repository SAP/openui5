sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/type/Currency",
	"sap/m/ObjectAttribute"
], function(Controller, Currency, ObjectAttribute) {
	"use strict";

	return Controller.extend("sap.ui.demo.db.controller.App", {
		formatMail: function(sFirstName, sLastName) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			return sap.m.URLHelper.normalizeEmail(
				sFirstName + "." + sLastName + "@example.com",
				oBundle.getText("mailSubject", [sFirstName]),
				oBundle.getText("mailBody"));
		},

		formatStockValue : function(fUnitPrice, iStockLevel, sCurrCode) {
			var sBrowserLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oLocale = new sap.ui.core.Locale(sBrowserLocale);
			var oLocaleData = new sap.ui.core.LocaleData(oLocale);
			var oCurrency = new Currency(oLocaleData.mData.currencyFormat);
			return oCurrency.formatValue([fUnitPrice * iStockLevel, sCurrCode], "string");
		},

		onItemSelected : function(oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext("products");
			var sPath = oContext.getPath();
			var oProductDetailPanel = this.byId("productDetailsPanel");
			oProductDetailPanel.bindElement({ path: sPath, model: "products" });
		},

		productListFactory : function(sId, oContext) {
			var oUIControl;

			// Decide based on the data which fragment to show
			if (oContext.getProperty("UnitsInStock") === 0 && oContext.getProperty("Discontinued")) {
				// The item is discontinued, so use a StandardListItem
				if (!this._oProductSimple) {
					this._oProductSimple = sap.ui.xmlfragment(sId, "sap.ui.demo.db.view.ProductSimple", this);
				}
				oUIControl = this._oProductSimple.clone();
			} else {
				// The item is available, so we will create an ObjectListItem
				if (!this._oProductExtended) {
					this._oProductExtended = sap.ui.xmlfragment(sId, "sap.ui.demo.db.view.ProductExtended", this);
				}
				oUIControl = this._oProductExtended.clone();

				// The item is temporarily out of stock, so we will add a status
				if (oContext.getProperty("UnitsInStock") < 1) {
					oUIControl.addAttribute(new ObjectAttribute({
						text : {
							path: "i18n>outOfStock"
						}
					}));
				}
			}

			return oUIControl;
		}
	});
});