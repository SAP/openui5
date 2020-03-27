sap.ui.define([
		'sap/ui/core/mvc/Controller',
		'sap/ui/Device',
		'sap/ui/model/Filter',
		'sap/ui/model/Sorter',
		'sap/ui/model/json/JSONModel',
		'sap/m/Menu',
		'sap/m/MenuItem',
		'./Formatter'
	], function(Controller, Device ,Filter, Sorter, JSONModel, Menu, MenuItem /*, Formatter*/) {
	"use strict";

	var SettingsDialogController = Controller.extend("sap.m.sample.TableViewSettingsDialog.SettingsDialogController", {

		onInit: function () {
			// Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
			this._mViewSettingsDialogs = {};

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
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

		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		handleSortButtonPressed: function () {
			this.createViewSettingsDialog("sap.m.sample.TableViewSettingsDialog.SortDialog").open();
		},

		handleFilterButtonPressed: function () {
			this.createViewSettingsDialog("sap.m.sample.TableViewSettingsDialog.FilterDialog").open();
		},

		handleGroupButtonPressed: function () {
			this.createViewSettingsDialog("sap.m.sample.TableViewSettingsDialog.GroupDialog").open();
		},

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function(oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		handleGroupDialogConfirm: function (oEvent) {
			var oTable = this.byId("idProductsTable"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				vGroup,
				aGroups = [];

			if (mParams.groupItem) {
				sPath = mParams.groupItem.getKey();
				bDescending = mParams.groupDescending;
				vGroup = this.mGroupFunctions[sPath];
				aGroups.push(new Sorter(sPath, bDescending, vGroup));
				// apply the selected group settings
				oBinding.sort(aGroups);
			}
		},

		onToggleContextMenu: function (oEvent) {
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

	return SettingsDialogController;
});