sap.ui.define([
		'sap/base/util/deepExtend',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(deepExtend, Controller, JSONModel) {
	"use strict";

	var TableController = Controller.extend("sap.m.sample.TableColumnWidth.Table", {

		onInit: function () {
			this.oProductModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.oProductModel.setSizeLimit(3);

			this.oColumnModel = new JSONModel();
			this.oColumnModel.setData(this.oData);

			var oCloneData = deepExtend([], this.oData);
			oCloneData[0].width = "auto";
			this.oColumnModelClone = new JSONModel();
			this.oColumnModelClone.setData(oCloneData);

			this.getView().setModel(this.oColumnModel, "columns");
			this.getView().setModel(this.oProductModel, "products");
			this.getView().setModel(this.oColumnModelClone, "clone");
		},

		onReset: function (oEvent) {
			this.oColumnModel.setData(this.oData);
		},

		onCheckBoxSelect: function (oEvent) {
			var bStrictLayout = oEvent.getParameter("selected");
			this.byId("table").setFixedLayout(bStrictLayout ? "Strict" : true);
		},

		oData : [{
				width: "30%",
				header: "Product Name",
				demandPopin: false,
				minScreenWidth: "",
				styleClass: "cellBorderLeft cellBorderRight"
			}, {
				width: "20%",
				header: "Supplier Name",
				demandPopin: false,
				minScreenWidth: "",
				styleClass: "cellBorderRight"
			}, {
				width: "50%",
				header: "Description",
				demandPopin: true,
				minScreenWidth: "Tablet",
				styleClass: "cellBorderRight"
			}
		]
	});

	return TableController;

});