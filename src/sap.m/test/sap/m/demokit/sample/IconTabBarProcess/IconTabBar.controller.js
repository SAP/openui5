sap.ui.controller("sap.m.sample.IconTabBarProcess.IconTabBar", {

	onInit: function () {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);

		// reuse table sample component
		var oComp = sap.ui.getCore().createComponent({
			name : 'sap.m.sample.Table'
		});
		oComp.setModel(this.getView().getModel());
		this._oTable = oComp.getTable();
		this.getView().byId("idIconTabBar").insertContent(this._oTable);

		// update table
		this._oTable.setHeaderText(null);
		this._oTable.setShowSeparators("Inner");
	},

	handleIconTabBarSelect : function (oEvent) {
		var oTable = oEvent.getSource().getContent()[0];
		var oBinding = oTable.getBinding("items"),
			sKey = oEvent.getParameter("selectedKey"),
			oFilter;
		if (sKey === "Ok") {
			oFilter = new sap.ui.model.Filter("WeightMeasure", "LE", 1000);
			oBinding.filter([oFilter]);
		} else if (sKey === "Heavy") {
			oFilter = new sap.ui.model.Filter("WeightMeasure", "BT", 1001, 2000);
			oBinding.filter([oFilter]);
		} else if (sKey === "Overweight") {
			oFilter = new sap.ui.model.Filter("WeightMeasure", "GT", 2000);
			oBinding.filter([oFilter]);
		} else {
			oBinding.filter([]);
		}
	}
});
