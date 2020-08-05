sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.CheckBoxTriState.CheckBoxTriState", {
		onInit: function() {
			this.oModel = new JSONModel({
				child1: true,
				child2: false,
				child3: true
			});
			this.getView().setModel(this.oModel);
		},

		onParentClicked: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			this.oModel.setData({ child1: bSelected, child2: bSelected, child3: bSelected });
		}
	});
});