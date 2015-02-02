jQuery.sap.require("sap.m.sample.TableViewSettingsDialog.Formatter");

sap.ui.controller("sap.m.sample.TableViewSettingsDialog.C", {

	_oDialog: null,

	onInit: function () {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
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
		}
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
		var aSorters = [];
		if (mParams.groupItem) {
			var sPath = mParams.groupItem.getKey();
			var bDescending = mParams.groupDescending;
			var vGroup = this.mGroupFunctions[sPath];
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
		}
		var sPath = mParams.sortItem.getKey();
		var bDescending = mParams.sortDescending;
		aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
		oBinding.sort(aSorters);

		// apply filters to binding
		var aFilters = [];
		jQuery.each(mParams.filterItems, function (i, oItem) {
			var aSplit = oItem.getKey().split("___");
			var sPath = aSplit[0];
			var sOperator = aSplit[1];
			var sValue1 = aSplit[2];
			var sValue2 = aSplit[3];
			var oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1, sValue2);
			aFilters.push(oFilter);
		});
		oBinding.filter(aFilters);

		// update filter bar
		oView.byId("vsdFilterBar").setVisible(aFilters.length > 0);
		oView.byId("vsdFilterLabel").setText(mParams.filterString);
	}
});
