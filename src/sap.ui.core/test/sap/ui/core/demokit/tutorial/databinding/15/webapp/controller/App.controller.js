sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/ui/model/type/Currency" ],
function(Controller, Currency) {
	"use strict";

	return Controller.extend("sap.ui.demo.db.controller.App", {
		formatMapUrl : function(sStreet, sZip, sCity, sCountry) {
			return "https://maps.googleapis.com/maps/api/staticmap?zoom=13&size=500x300&markers="
					+ jQuery.sap.encodeURL(sStreet + ", " + sZip + " " + sCity + ", " + sCountry);
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
			var oProductDetailPanel = this.getView().byId("productDetailsPanel");
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
					info : {
						path : "i18n>discontinued"
					},
					infoState : "Error"
				});
			} else {
				// Nope, so we will create an
				// ObjectListItem
				oUIControl = new sap.m.ObjectListItem(sId, {
					title : sDescription,
					number : {
						parts : [
								{
									path : "products>UnitPrice"
								},
								{
									path : "/currencyCode"
								} ],
						type : "sap.ui.model.type.Currency",
						formatOptions : {
							showMeasure : false
						}
					},
					numberUnit : {
						path : "/currencyCode"
					}
				});

				// Is this item in stock?
				if (oContext.getProperty("UnitsInStock") > 0) {
					// First object attribute
					// displays the current
					// stock level
					oUIControl.addAttribute(new sap.m.ObjectAttribute({
						title : {
							path : "i18n>unitsInStock"
						},
						text : {
							path : "products>UnitsInStock"
						}
					}));

					// Second object attribute displays the current stock value
					oUIControl.addAttribute(new sap.m.ObjectAttribute({
						title : {
							path : "i18n>stockValue"
						},
						text : {
							parts : [
									{
										path : "products>UnitPrice"
									},
									{
										path : "products>UnitsInStock"
									},
									{
										path : "/currencyCode"
									} ],
							formatter : this.formatStockValue
						}
					}));

					// Has this product been discontinued?
					if (oContext.getProperty("Discontinued")) {
						// Yup, so we're selling off the last remaining stock items
						// Set the status of the first attribute to "discontinued"
						oUIControl.setFirstStatus(new sap.m.ObjectStatus({
							text : {
								path : "i18n>discontinued"
							},
							state : "Error"
						}));
					}
				} else {
					// Nope, so this item is just temporarily out of stock
					oUIControl.addAttribute(new sap.m.ObjectAttribute({
							text : {
								path : "i18n>outOfStock"
							}
						}
					));
				}
			}
			// Set item active (so it is clickable) and attach the press event 
			// handler for showing the details
			oUIControl.setType(sap.m.ListType.Active);
			oUIControl.attachPress(this.onItemSelected, this);
			return oUIControl;
		},

		onInit : function() {
			// Get a reference to the Product List using the XML element's id
			var oProductList = this.getView()
					.byId("ProductList");

			// In addition to binding the "items" aggregation in the list to the Products array
			// in the "products" model, the productListFactory function is also passed as a parameter
			oProductList.bindAggregation(
					"items",
					"products>/Products",
					this.productListFactory.bind(this));
		}

	});
});