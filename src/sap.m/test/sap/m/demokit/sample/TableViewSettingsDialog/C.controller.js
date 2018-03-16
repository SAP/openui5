sap.ui.define([
		'jquery.sap.global',
		'./Formatter',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/ui/model/json/JSONModel',
		'sap/m/Menu',
		'sap/m/MenuItem'
	], function(jQuery, Formatter, Fragment, Controller, Filter, Sorter, JSONModel, Menu, MenuItem) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.TableViewSettingsDialog.C", {

		_oDialog: null,

		onInit: function () {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
			this.getView().setModel(oModel);

			this.mGroupFunctions = {
				SupplierName: function(oContext) {
					var name = oContext.getProperty("SupplierName");
					return {
						key: name,
						text: name
					};
				},
				Price: function(oContext) {
					var price = oContext.getProperty("Price");
					var currencyCode = oContext.getProperty("CurrencyCode");
					var key, text;
					if (price <= 100) {
						key = "LE100";
						text = "100 " + currencyCode + " or less";
					} else if (price <= 1000) {
						key = "BT100-1000";
						text = "Between 100 and 1000 " + currencyCode;
					} else {
						key = "GT1000";
						text = "More than 1000 " + currencyCode;
					}
					return {
						key: key,
						text: text
					};
				}
			};
		},

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleViewSettingsDialogButtonPressed: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.TableViewSettingsDialog.Dialog", this);
			}
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleConfirm: function(oEvent) {

			var oView = this.getView();
			var oTable = oView.byId("idProductsTable");

			var mParams = oEvent.getParameters();
			var oBinding = oTable.getBinding("items");

			// apply sorter to binding
			// (grouping comes before sorting)
			var sPath;
			var bDescending;
			var vGroup;
			var aSorters = [];
			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new Sorter(sPath, bDescending, vGroup));
			}
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			oBinding.sort(aSorters);

			// apply filters to binding
			var aFilters = [];
			jQuery.each(mParams.filterItems, function (i, oItem) {
				var aSplit = oItem.getKey().split("___");
				var sPath = aSplit[0];
				var sOperator = aSplit[1];
				var sValue1 = aSplit[2];
				var sValue2 = aSplit[3];
				var oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});
			oBinding.filter(aFilters);

			// update filter bar
			oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			oView.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		onToggleContextMenu: function(oEvent) {
			if (oEvent.getParameter("pressed")) {
				this.byId("idProductsTable").setContextMenu(new Menu({
					items: [
						new MenuItem({text: "{Name}"}),
						new MenuItem({text: "{ProductId}"})
					]
				}));
			} else {
				this.byId("idProductsTable").destroyContextMenu();
			}
		}
	});


	return CController;

});
