sap.ui.define(["sap/ui/model/json/JSONModel", 'sap/ui/core/mvc/Controller', 'sap/m/library'],
	function (JSONModel, Controller, library) {
		"use strict";

		var ToolbarDesign = library.ToolbarDesign,
			ToolbarStyle = library.ToolbarStyle;

		var ToolbarController = Controller.extend("sap.m.sample.ToolbarDesign.Toolbar", {

			onInit: function () {

				var aDesignTypeData = [],
					aStyleTypeData = [];

				Object.keys(ToolbarDesign).forEach(function (sKey) {
					aDesignTypeData.push({key: sKey});
				});
				Object.keys(ToolbarStyle).forEach(function (sKey) {
					aStyleTypeData.push({key: sKey});
				});

				var oModel = new JSONModel({
					designTypes: aDesignTypeData,
					styleTypes: aStyleTypeData
				});
				this.getView().setModel(oModel);
			},
			onSelectDesign: function (oEvent) {
				var oView = this.getView(),
					sSelectedKey = oEvent.getParameter("selectedItem").getKey(),
					bActionContext = sSelectedKey !== sap.m.ToolbarDesign.Info;
				oView.byId("contentTb").setDesign(sSelectedKey);
				oView.getModel().setProperty("/bActionContext", bActionContext);
			},
			onSelectStyle: function (oEvent) {
				this.getView().byId("contentTb").setStyle(oEvent.getParameter("selectedItem").getKey());
			}
		});

		return ToolbarController;

	});
