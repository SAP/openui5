sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/model/type/Currency" ],
function(Controller, Currency) {
	"use strict";

	return Controller.extend("sap.ui.demo.db.controller.App", {
		formatMail: function(sFirstName, sLastName) {
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			return sap.m.URLHelper.normalizeEmail(
				sFirstName + "." + sLastName + "@example.com",
				oBundle.getText("mailSubject", [sFirstName]),
				oBundle.getText("mailBody"));
		},
		formatStockValue : function(fUnitPrice,
				iStockLevel, sCurrCode) {
			var sBrowserLocale = sap.ui.getCore().getConfiguration().getLanguage();
			var oLocale = new sap.ui.core.Locale(sBrowserLocale);
			var oLocaleData = new sap.ui.core.LocaleData(oLocale);
			var oCurrency = new Currency(oLocaleData.mData.currencyFormat);
			return oCurrency.formatValue([fUnitPrice * iStockLevel, sCurrCode ], "string");
		},
		onItemSelected : function(oEvent) {
			var oSelectedItem = oEvent.getSource();
			var oContext = oSelectedItem.getBindingContext("products");
			var sPath = oContext.getPath();
			var oProductDetailPanel = this.byId("productDetailsPanel");
			oProductDetailPanel.bindElement({path : sPath, model : "products"});
		},
		productListFactory : function(sId,oContext) {
			var oUIControl = null;

			// Define the item description
			var sDescription = oContext.getProperty("ProductName") + " (" + oContext.getProperty("QuantityPerUnit") + ")";

			// This item is out of stock and discontinued
			// *and* discontinued?
			if (oContext.getProperty("UnitsInStock") === 0 && oContext.getProperty("Discontinued")) {
				// Yup, so use a
				// StandardListItem
				oUIControl = new sap.m.StandardListItem(sId, {
					icon : "sap-icon://warning",
					title : sDescription,
					info : { path: "i18n>Discontinued" },
					infoState : "Error"
				});
			} else {
				// Nope, so we will create an
				// ObjectListItem

				oUIControl = new sap.m.ObjectListItem(sId, {
					title : sDescription,
					number : {
						parts : [ "products>UnitPrice", "/currencyCode" ],
						type : "sap.ui.model.type.Currency",
						formatOptions : {
							showMeasure : false
						}
					},
					numberUnit : {
						path : "/currencyCode"
					}
				});

				// Is this item out of stock?
				if (oContext.getProperty("UnitsInStock") < 1) {
					// Nope, so this item is just temporarily out of stock
					oUIControl.addAttribute(new sap.m.ObjectAttribute({
						text : { path: "i18n>outOfStock" }
					}));
				}
			}

			// Set item active (so it is clickable) and attach the press event
			// handler for showing the details
			oUIControl.setType(sap.m.ListType.Active);
			oUIControl.attachPress(this.onItemSelected, this);
			return oUIControl;
		}
	});
});